\set ON_ERROR_STOP on
-- Kiểm hành vi của 20261103000000_live_progress.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration.
-- Chạy lại được (dọn lớp LP-TEST trước). Dùng chung người dùng e1/e2 (sinh viên), e3 (gmail), f1/f2 (giảng viên).
reset role;
create or replace function pg_temp.lp_fail(p_sql text, p_needle text) returns void language plpgsql as $$
begin
  begin execute p_sql; exception when others then
    if p_needle <> '' and position(p_needle in sqlerrm) = 0 then raise exception 'Lỗi sai loại: "%" (cần "%")', sqlerrm, p_needle; end if; return; end;
  raise exception 'Lẽ ra phải bị chặn: %', p_sql;
end; $$;
grant execute on function pg_temp.lp_fail(text, text) to anon, authenticated;
create or replace function pg_temp.lp_eq(p_actual text, p_expected text, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, p_actual, p_expected; end if; end; $$;
grant execute on function pg_temp.lp_eq(text, text, text) to anon, authenticated;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000e1', 'jt.a@student.ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000e2', 'jt.b@student.ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000e3', 'jt.ngoai@gmail.com'),
  ('00000000-0000-0000-0000-0000000000f1', 'jt.gv@ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000f2', 'jt.gv2@ctu.edu.vn')
on conflict (id) do nothing;
insert into public.instructor_allowlist (email, note, added_by) values ('jt.gv@ctu.edu.vn', 'test', 'test'), ('jt.gv2@ctu.edu.vn', 'test', 'test') on conflict (email) do nothing;
delete from public.live_progress where class_code = 'LP-TEST';
delete from public.instructor_class_access where class_code = 'LP-TEST';

-- anon: bị chặn hoàn toàn
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select pg_temp.lp_fail($q$select public.bizon_live_progress_upsert('LP-TEST','bps','Doi A',1,5)$q$, 'permission denied');
select pg_temp.lp_fail($q$select * from public.bizon_live_progress_class('LP-TEST','bps')$q$, 'permission denied');
select pg_temp.lp_fail($q$select * from public.live_progress$q$, 'permission denied');
reset role;

-- email ngoài trường: không gửi được
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e3","email":"jt.ngoai@gmail.com","role":"authenticated"}', false); set role authenticated;
select pg_temp.lp_fail($q$select public.bizon_live_progress_upsert('LP-TEST','bps','Doi A',1,5)$q$, 'email trường');
reset role;

-- sinh viên a: gửi tuần 1 rồi tuần 2 (ghi đè, vẫn một dòng); gửi thêm trò khác; tham số sai bị chặn; không đọc được bảng lớp
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1","email":"jt.a@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.lp_eq(public.bizon_live_progress_upsert('lp-test','BPS','Doi A',1,5,120)->>'round', '1', 'tuần 1');
select pg_temp.lp_eq(public.bizon_live_progress_upsert('LP-TEST','bps','Doi A',2,5,260,null,false,'{"loc":"ben-ninh-kieu"}')->>'round', '2', 'tuần 2');
select pg_temp.lp_eq(public.bizon_live_progress_upsert('LP-TEST','hcsr','Doi A',3,6,71,5)->>'game', 'hcsr', 'trò khác');
select pg_temp.lp_fail($q$select public.bizon_live_progress_upsert('LP-TEST','xyz','Doi A',1,5)$q$, 'Trò chơi');
select pg_temp.lp_fail($q$select public.bizon_live_progress_upsert('LP-TEST','bps','Doi A',6,5)$q$, 'Vụ');
select pg_temp.lp_fail($q$select public.bizon_live_progress_upsert('LP-TEST','bps','Doi A',1,30)$q$, 'Vụ');
select pg_temp.lp_fail($q$select public.bizon_live_progress_upsert('LP-TEST','hcsr','Doi A',1,6,10,9)$q$, 'Chặng');
select pg_temp.lp_fail($q$select public.bizon_live_progress_upsert('LP-TEST','bps','Doi A',1,5,null,null,false,'[1]'::jsonb)$q$, 'Chi tiết');
select pg_temp.lp_fail($q$select public.bizon_live_progress_upsert('L','bps','Doi A',1,5)$q$, 'Mã lớp');
select pg_temp.lp_eq((select count(*)::text from public.bizon_live_progress_class('LP-TEST','bps')), '0', 'sinh viên không đọc được lớp');
reset role;
select pg_temp.lp_eq((select count(*)::text from public.live_progress where class_code = 'LP-TEST' and game = 'bps'), '1', 'một dòng mỗi sinh viên × trò');

-- sinh viên b: xong ván
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e2","email":"jt.b@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_live_progress_upsert('LP-TEST','bps','Doi B',5,5,410,null,true);
reset role;

-- giảng viên chủ lớp đọc được, không có email; giảng viên khác không thấy
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f1","email":"jt.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_claim_class('LP-TEST');
select pg_temp.lp_eq((select string_agg(team_name || ':' || round || '/' || rounds_total || ':' || finished, ',') from public.bizon_live_progress_class('lp-test','bps')), 'Doi B:5/5:true,Doi A:2/5:false', 'bảng lớp');
select pg_temp.lp_eq((select detail->>'loc' from public.bizon_live_progress_class('LP-TEST','bps') where team_name = 'Doi A'), 'ben-ninh-kieu', 'chi tiết');
select pg_temp.lp_eq((select count(*)::text from public.bizon_live_progress_class('LP-TEST','hcsr')), '1', 'lọc theo trò');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f2","email":"jt.gv2@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.lp_eq((select count(*)::text from public.bizon_live_progress_class('LP-TEST','bps')), '0', 'giảng viên khác');
reset role;

-- quá 12 giờ: không còn trên màn hình; quá 30 ngày: lần gửi kế tiếp tự xoá
update public.live_progress set updated_at = now() - interval '13 hours' where class_code = 'LP-TEST' and team_name = 'Doi B';
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f1","email":"jt.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.lp_eq((select count(*)::text from public.bizon_live_progress_class('LP-TEST','bps')), '1', 'chỉ 12 giờ gần nhất');
reset role;
update public.live_progress set updated_at = now() - interval '31 days' where class_code = 'LP-TEST' and team_name = 'Doi B';
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1","email":"jt.a@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_live_progress_upsert('LP-TEST','bps','Doi A',3,5,330);
reset role;
select pg_temp.lp_eq((select count(*)::text from public.live_progress where class_code = 'LP-TEST' and team_name = 'Doi B'), '0', 'tự xoá sau 30 ngày');
select 'live_progress_smoke: OK' as result;
