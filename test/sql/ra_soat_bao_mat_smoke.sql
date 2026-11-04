\set ON_ERROR_STOP on
-- Kiểm 20261104000000_ra_soat_bao_mat.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql, toàn bộ migration
-- và test/sql/live_progress_smoke.sql (dùng lại người dùng e1/e3/f1 và lớp LP-TEST). Chạy lại được.
reset role;
create or replace function pg_temp.rs_fail(p_sql text, p_needle text) returns void language plpgsql as $$
begin
  begin execute p_sql; exception when others then
    if p_needle <> '' and position(p_needle in sqlerrm) = 0 then raise exception 'Lỗi sai loại: "%" (cần "%")', sqlerrm, p_needle; end if; return; end;
  raise exception 'Lẽ ra phải bị chặn: %', p_sql;
end; $$;
grant execute on function pg_temp.rs_fail(text, text) to anon, authenticated;
create or replace function pg_temp.rs_eq(p_actual text, p_expected text, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, p_actual, p_expected; end if; end; $$;
grant execute on function pg_temp.rs_eq(text, text, text) to anon, authenticated;

-- 1. key_check_attempts: RLS bật, anon/authenticated không đọc không ghi
select pg_temp.rs_eq((select relrowsecurity::text from pg_class where oid = 'public.key_check_attempts'::regclass), 'true', 'RLS key_check_attempts');
set role anon;
select pg_temp.rs_fail($q$select * from public.key_check_attempts$q$, 'permission denied');
select pg_temp.rs_fail($q$update public.key_check_attempts set fail_count = 0$q$, 'permission denied');
reset role;
set role authenticated;
select pg_temp.rs_fail($q$delete from public.key_check_attempts$q$, 'permission denied');
reset role;

-- 2. live_progress: lớp chưa đăng ký thì không gửi được; lớp đã đăng ký (LP-TEST) vẫn gửi được
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1","email":"jt.a@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.rs_fail($q$select public.bizon_live_progress_upsert('LOP-LA-XYZ','bps','Doi Gia',1,5)$q$, 'chưa được giảng viên đăng ký');
select pg_temp.rs_eq(public.bizon_live_progress_upsert('LP-TEST','bps','Doi A',4,5,400)->>'round', '4', 'lớp đã đăng ký vẫn gửi được');
reset role;
select pg_temp.rs_eq((select count(*)::text from public.live_progress where class_code = 'LOP-LA-XYZ'), '0', 'không có dòng rác');

-- 3a. survey_responses: anon nộp phiếu hợp lệ được; phiếu quá cỡ bị chặn
delete from public.survey_responses where class_code like 'RS-TEST%';
set role anon;
insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  values ('pre', 'RS-TEST', 'AB12', '{"1":"a"}', 10, '{"1":4}');
select pg_temp.rs_fail($q$insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b, open_like)
  values ('post', 'RS-TEST', 'AB12', '{"1":"a"}', 10, '{"1":4}', repeat('x', 5000))$q$, 'survey_responses_size_ck');
select pg_temp.rs_fail($q$insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  values ('pre', 'RS-TEST', 'AB12', ('{"k":"' || repeat('y', 20000) || '"}')::jsonb, 10, '{"1":4}')$q$, 'survey_responses_size_ck');
reset role;
-- 3b. tần suất: 150 phiếu / phút / lớp
insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  select 'pre', 'RS-TEST-FLOOD', 'S' || g, '{"1":"a"}', 5, '{"1":3}' from generate_series(1, 150) g;
set role anon;
select pg_temp.rs_fail($q$insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  values ('pre', 'RS-TEST-FLOOD', 'S999', '{"1":"a"}', 5, '{"1":3}')$q$, 'Quá nhiều phiếu');
insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  values ('pre', 'RS-TEST-KHAC', 'S1', '{"1":"a"}', 5, '{"1":3}');
reset role;
-- phiếu cũ hơn một phút không còn tính
update public.survey_responses set created_at = now() - interval '2 minutes' where class_code = 'RS-TEST-FLOOD';
set role anon;
insert into public.survey_responses (phase, class_code, student_code, answers_a, score_a, likert_b)
  values ('pre', 'RS-TEST-FLOOD', 'S999', '{"1":"a"}', 5, '{"1":3}');
reset role;
delete from public.survey_responses where class_code like 'RS-TEST%';

-- 3c. client_errors: ghi được, quá cỡ bị chặn, quá 300 dòng / 5 phút bị chặn
delete from public.client_errors where page like 'rs-test%';
set role anon;
insert into public.client_errors (page, message) values ('rs-test.html', 'TypeError: x is undefined');
select pg_temp.rs_fail($q$insert into public.client_errors (page, message) values ('rs-test.html', repeat('m', 3000))$q$, 'client_errors_size_ck');
reset role;
insert into public.client_errors (page, message) select 'rs-test-flood.html', 'e' || g from generate_series(1, 299) g;   -- + 1 dòng ở trên = 300
set role anon;
select pg_temp.rs_fail($q$insert into public.client_errors (page, message) values ('rs-test.html', 'một lỗi nữa')$q$, 'Quá nhiều báo lỗi');
reset role;
delete from public.client_errors where page like 'rs-test%';

-- 3d. bug_reports qua bizon_report_bug: 60 / giờ
delete from public.bug_reports where class_code = 'RS-TEST';
set role anon;
select public.bizon_report_bug('RS-TEST', 'Doi A', 1, 'CEO', 'Nút chốt vòng không bấm được');
reset role;
insert into public.bug_reports (class_code, description) select 'RS-TEST', 'báo cáo số ' || g from generate_series(1, 59) g;   -- + 1 báo cáo ở trên = 60
set role anon;
select pg_temp.rs_fail($q$select public.bizon_report_bug('RS-TEST', 'Doi A', 1, 'CEO', 'Thêm một báo cáo nữa')$q$, 'Quá nhiều báo cáo');
reset role;
delete from public.bug_reports where class_code = 'RS-TEST';

-- 4. team_saves: phải là đối tượng JSON, ≤ 256 KB
delete from public.team_saves where class_code = 'RS-TEST';
insert into public.team_saves (class_code, team_name, state_json) values ('RS-TEST', 'Doi A', '{"round":1}');
select pg_temp.rs_fail($q$insert into public.team_saves (class_code, team_name, state_json) values ('RS-TEST', 'Doi B', '[1,2]')$q$, 'team_saves_state_ck');
select pg_temp.rs_fail($q$update public.team_saves set state_json = jsonb_build_object('big', (select string_agg(md5(g::text), '') from generate_series(1, 40000) g)) where class_code = 'RS-TEST'$q$, 'team_saves_state_ck');
delete from public.team_saves where class_code = 'RS-TEST';

select 'ra_soat_bao_mat_smoke: OK' as result;
