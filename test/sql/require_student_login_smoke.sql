\set ON_ERROR_STOP on
-- Kiểm hành vi của 20261023000000_require_student_login.sql + 20261023010000_revoke_anon_writes.sql
-- trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration theo thứ tự.
-- Đổi người dùng như PostgREST: request.jwt.claims + set role.

reset role;
create or replace function pg_temp.expect_fail(p_sql text, p_needle text) returns void
language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if p_needle <> '' and position(p_needle in sqlerrm) = 0 then
      raise exception 'Lỗi sai loại: "%" (cần chứa "%") khi chạy: %', sqlerrm, p_needle, p_sql;
    end if;
    return;
  end;
  raise exception 'Lẽ ra phải bị chặn: %', p_sql;
end;
$$;
grant execute on function pg_temp.expect_fail(text, text) to anon, authenticated;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'sva@student.ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000a2', 'svb@student.ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000a3', 'ngoai@gmail.com'),
  ('00000000-0000-0000-0000-0000000000b1', 'gv.duyet@ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000b2', 'gv.la@gmail.com'),
  ('00000000-0000-0000-0000-0000000000c1', 'thuyhuongctu@gmail.com'),
  ('00000000-0000-0000-0000-0000000000d1', 'sv@student.doitac.ac.id');
insert into public.instructor_allowlist (email, note, added_by) values ('gv.duyet@ctu.edu.vn', 'test', 'test');
-- Lượt nộp ẩn danh cũ (trước khi khóa): không được hiện trên bảng xếp hạng công khai.
insert into public.ft_results (class_code, player_name, team_name, total_revenue, efficiency, final_rank)
values ('KT-TEST', 'Ten That Cu', 'Doi X', 9999, 50, 1);

-- ---------- 1. anon: mọi đường ghi và đọc theo đội đều bị chặn ----------
select set_config('request.jwt.claims', '{"role":"anon"}', false);
set role anon;
select pg_temp.expect_fail($q$insert into public.round_submissions (class_code, team_name, round_number, result_json, result_hash) values ('KT-TEST','Doi A',1,'{}','x')$q$, 'permission denied');
select pg_temp.expect_fail($q$insert into public.ft_results (class_code, team_name, total_revenue, efficiency, final_rank) values ('KT-TEST','Doi A',1,1,1)$q$, 'permission denied');
select pg_temp.expect_fail($q$insert into public.bp_results (class_code, total_score) values ('KT-TEST',10)$q$, 'permission denied');
select pg_temp.expect_fail($q$insert into public.member_log (class_code, team_name, round_number, role, kind) values ('KT-TEST','Doi A',1,'CEO','proposal')$q$, 'permission denied');
select pg_temp.expect_fail($q$select public.upsert_team_save('KT-TEST','Doi A','{}'::jsonb,null)$q$, 'permission denied');
select pg_temp.expect_fail($q$select * from public.get_team_save('KT-TEST','Doi A',null)$q$, 'permission denied');
select pg_temp.expect_fail($q$select * from public.bizon_team_log('KT-TEST','Doi A',1)$q$, 'permission denied');
select pg_temp.expect_fail($q$select * from public.bizon_team_all_log('KT-TEST','Doi A')$q$, 'permission denied');
select pg_temp.expect_fail($q$select public.bizon_submit_round('KT-TEST',1,'{}'::jsonb,'nohash',null)$q$, 'permission denied');
reset role;

-- ---------- 2. Sinh viên A: tham gia đội, nộp vòng, ghi nhật ký, nộp Bến Phù Sa ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","email":"sva@student.ctu.edu.vn","role":"authenticated"}', false);
set role authenticated;
select * from public.bizon_join_team('kt-test', 'Doi A', 'CEO');
select public.bizon_submit_round('kt-test', 1, '{"revenue":120}'::jsonb, repeat('a', 64), now());
select pg_temp.expect_fail($q$select public.bizon_submit_round('KT-TEST',7,'{}'::jsonb,'nohash',null)$q$, 'Vòng');
select pg_temp.expect_fail($q$select public.bizon_submit_round('KT-TEST',2,'{}'::jsonb,'gia-mao',null)$q$, 'Mã băm');
select public.bizon_log_member('KT-TEST', 1, 'proposal', '{"gia":10}'::jsonb, 'Biệt danh A', now());
select pg_temp.expect_fail($q$select public.bizon_log_member('KT-TEST',1,'hack','{}'::jsonb,null,null)$q$, 'Loại');
select public.bizon_submit_ft_result('KT-TEST', 'Rong Xanh', 'Doi A', 500, 80, 1, '{}'::jsonb, 'bizon-bps2d-v2');
select pg_temp.expect_fail($q$select public.bizon_submit_bp_result('KT-TEST','A','Cty',150,0,0,0,0,0,'t',4,'{}'::jsonb,'v')$q$, 'không hợp lệ');
select public.bizon_submit_bp_result('KT-TEST', 'Rong Xanh', 'Cty A', 88, 1, 1, 1, 1, 1, 'Danh hieu', 4, '{}'::jsonb, 'v');
select public.bizon_submit_bp_result('KT-TEST', 'Rong Xanh', 'Cty B', 70, 1, 1, 1, 1, 1, 'Danh hieu', 6, '{}'::jsonb, 'v3d', 3, 5, 2);
select pg_temp.expect_fail($q$select public.bizon_submit_bp_result('KT-TEST','A','Cty',50,0,0,0,0,0,'t',4,'{}'::jsonb,'v',999,0,0)$q$, 'không hợp lệ');
select public.bizon_student_upsert_save('KT-TEST', '{"round":2}'::jsonb);
do $$ begin
  if (select count(*) from public.bizon_team_all_log_v2('KT-TEST')) <> 1 then raise exception 'A phải thấy 1 dòng nhật ký đội mình'; end if;
  if (select count(*) from public.bizon_team_log_v2('KT-TEST', 1)) <> 1 then raise exception 'A phải thấy đề xuất vòng 1'; end if;
end $$;
-- Sinh viên không tự nhận lớp được (chưa được duyệt là giảng viên).
select pg_temp.expect_fail($q$select public.bizon_claim_class('KT-TEST')$q$, 'chưa được duyệt');
reset role;

do $$
declare r record;
begin
  select * into r from public.round_submissions where class_code = 'KT-TEST';
  if r.team_name <> 'Doi A' or r.student_email <> 'sva@student.ctu.edu.vn' or r.student_id is null then
    raise exception 'round_submissions phải lấy đội/email từ thành viên đội: %', row_to_json(r);
  end if;
  select * into r from public.member_log where class_code = 'KT-TEST';
  if r.role <> 'CEO' or r.member_email <> 'sva@student.ctu.edu.vn' or r.member_name <> 'Biệt danh A' then
    raise exception 'member_log phải lấy vai/email từ thành viên đội: %', row_to_json(r);
  end if;
end $$;

-- ---------- 3. Sinh viên B: chưa vào đội thì không nộp được; đội khác không đọc được nhật ký đội A ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","email":"svb@student.ctu.edu.vn","role":"authenticated"}', false);
set role authenticated;
select pg_temp.expect_fail($q$select public.bizon_submit_round('KT-TEST',1,'{}'::jsonb,'nohash',null)$q$, 'chưa tham gia');
select pg_temp.expect_fail($q$select public.bizon_log_member('KT-TEST',1,'proposal','{}'::jsonb,null,null)$q$, 'chưa tham gia');
select * from public.bizon_join_team('KT-TEST', 'Doi B', 'CFO');
do $$ begin
  if (select count(*) from public.bizon_team_all_log_v2('KT-TEST')) <> 0 then raise exception 'Đội B không được thấy nhật ký đội A'; end if;
end $$;
-- Không giành được vai đã có người giữ.
select pg_temp.expect_fail($q$select * from public.bizon_join_team('KT-TEST','Doi A','CEO')$q$, 'đã có người khác giữ');
reset role;

-- ---------- 4. Email ngoài trường: không tham gia đội, không nộp được ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a3","email":"ngoai@gmail.com","role":"authenticated"}', false);
set role authenticated;
select pg_temp.expect_fail($q$select * from public.bizon_join_team('KT-TEST','Doi C','CEO')$q$, 'email trường');
select pg_temp.expect_fail($q$select public.bizon_submit_ft_result('KT-TEST','X','Doi C',1,1,1,'{}'::jsonb,'v')$q$, 'email trường');
select pg_temp.expect_fail($q$select public.bizon_submit_round('KT-TEST',1,'{}'::jsonb,'nohash',null)$q$, 'email trường');
reset role;

-- ---------- 4b. Trường đối tác: chưa có tên miền thì bị chặn, thêm vào thì nộp được ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d1","email":"sv@student.doitac.ac.id","role":"authenticated"}', false);
set role authenticated;
select pg_temp.expect_fail($q$select public.bizon_submit_bp_result('KT-TEST','Garuda','HC Mini indo',60,0,null,null,null,null,'t',5,'{}'::jsonb,'hcmini-1')$q$, 'email trường');
select pg_temp.expect_fail($q$select public.bizon_admin_set_student_domain('student.doitac.ac.id', true, null)$q$, 'Chỉ quản trị');
do $$ begin
  if not exists (select 1 from public.bizon_student_domains() d where d = 'student.ctu.edu.vn') then raise exception 'Phải liệt kê tên miền CTU'; end if;
  if not exists (select 1 from public.bizon_student_domains() d where d = 'gstudent.ctu.edu.vn') then raise exception 'Phải liệt kê tên miền nghiên cứu sinh CTU'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","email":"thuyhuongctu@gmail.com","role":"authenticated"}', false);
set role authenticated;
select public.bizon_admin_set_student_domain('@Student.DoiTac.ac.id', true, 'Đối tác Indonesia');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d1","email":"sv@student.doitac.ac.id","role":"authenticated"}', false);
set role authenticated;
select public.bizon_submit_bp_result('KT-TEST','Garuda','HC Mini indo',60,0,null,null,null,null,'t',5,'{}'::jsonb,'hcmini-1');
select * from public.bizon_join_team('KT-TEST', 'Doi D', 'CEO');
-- Tên miền giả dạng (đuôi trùng nhưng khác tên miền) vẫn bị chặn.
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a3","email":"x@evilstudent.doitac.ac.id","role":"authenticated"}', false);
set role authenticated;
select pg_temp.expect_fail($q$select public.bizon_submit_ft_result('KT-TEST','X','Doi C',1,1,1,'{}'::jsonb,'v')$q$, 'email trường');
reset role;

-- ---------- 5. Giảng viên: chưa duyệt bị chặn, đã duyệt nhận được lớp ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","email":"gv.la@gmail.com","role":"authenticated"}', false);
set role authenticated;
select pg_temp.expect_fail($q$select public.bizon_claim_class('LOP-MOI')$q$, 'chưa được duyệt');
select pg_temp.expect_fail($q$select public.bizon_admin_set_instructor('gv.la@gmail.com', true, null)$q$, 'Chỉ quản trị');
select pg_temp.expect_fail($q$select * from public.bizon_admin_instructors()$q$, 'Chỉ quản trị');
reset role;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b1","email":"gv.duyet@ctu.edu.vn","role":"authenticated"}', false);
set role authenticated;
do $$ begin
  if not public.bizon_claim_class('KT-TEST') then raise exception 'Giảng viên đã duyệt phải nhận được lớp'; end if;
end $$;
reset role;

-- Admin duyệt thêm người, người đó nhận được lớp.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","email":"thuyhuongctu@gmail.com","role":"authenticated"}', false);
set role authenticated;
select public.bizon_admin_set_instructor('GV.La@gmail.com', true, 'Khoa Kinh tế');
do $$ begin
  if not exists (select 1 from public.bizon_admin_instructors() where email = 'gv.la@gmail.com') then raise exception 'Admin phải thấy giảng viên vừa duyệt'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","email":"gv.la@gmail.com","role":"authenticated"}', false);
set role authenticated;
do $$ begin
  if not public.bizon_claim_class('LOP-MOI') then raise exception 'Sau khi duyệt phải nhận được lớp'; end if;
end $$;
reset role;

-- ---------- 6. Bảng xếp hạng công khai: chỉ lượt đã đăng nhập, biệt danh, không email ----------
select set_config('request.jwt.claims', '{"role":"anon"}', false);
set role anon;
do $$
declare n int; names text;
begin
  select count(*), string_agg(player_name, ',') into n, names from public.ft_class_leaderboard('KT-TEST');
  if n <> 1 or names <> 'Rong Xanh' then raise exception 'ft_class_leaderboard phải chỉ có biệt danh đã đăng nhập, được: % (%)', names, n; end if;
  select count(*) into n from public.ft_class_results_by_version('KT-TEST');
  if n <> 1 then raise exception 'ft_class_results_by_version phải bỏ lượt ẩn danh, được %', n; end if;
  select count(*), string_agg(player_name, ',' order by player_name) into n, names from public.bp_class_leaderboard('KT-TEST');
  if n <> 3 or names <> 'Garuda,Rong Xanh,Rong Xanh' then raise exception 'bp_class_leaderboard sai: % (%)', names, n; end if;
  if not exists (select 1 from public.bp_class_leaderboard('KT-TEST') where company = 'Cty B' and markets = 3 and stars = 2) then
    raise exception 'bp_class_leaderboard phải có markets/stars của bản 3D'; end if;
end $$;
reset role;

select 'require_student_login_smoke: OK' as result;
