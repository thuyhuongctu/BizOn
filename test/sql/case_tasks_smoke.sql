\set ON_ERROR_STOP on
-- Kiểm hành vi của 20261028000000_case_tasks.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration.
-- Chạy lại được (dọn lớp CT-TEST trước). Người dùng dùng chung với journey_passports_smoke (e1/e2 sinh viên, e3 gmail, f1/f2 giảng viên).
reset role;
create or replace function pg_temp.ct_fail(p_sql text, p_needle text) returns void language plpgsql as $$
begin
  begin execute p_sql; exception when others then
    if p_needle <> '' and position(p_needle in sqlerrm) = 0 then raise exception 'Lỗi sai loại: "%" (cần "%")', sqlerrm, p_needle; end if; return; end;
  raise exception 'Lẽ ra phải bị chặn: %', p_sql;
end; $$;
grant execute on function pg_temp.ct_fail(text, text) to anon, authenticated;
create or replace function pg_temp.ct_eq(p_actual text, p_expected text, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, p_actual, p_expected; end if; end; $$;
grant execute on function pg_temp.ct_eq(text, text, text) to anon, authenticated;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000e1', 'jt.a@student.ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000e2', 'jt.b@student.ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000e3', 'jt.ngoai@gmail.com'),
  ('00000000-0000-0000-0000-0000000000f1', 'jt.gv@ctu.edu.vn'),
  ('00000000-0000-0000-0000-0000000000f2', 'jt.gv2@ctu.edu.vn')
on conflict (id) do nothing;
insert into public.instructor_allowlist (email, note, added_by) values ('jt.gv@ctu.edu.vn', 'test', 'test'), ('jt.gv2@ctu.edu.vn', 'test', 'test') on conflict (email) do nothing;
delete from public.case_tasks where class_code = 'CT-TEST';
delete from public.journey_passports where class_code = 'CT-TEST';
delete from public.instructor_class_access where class_code = 'CT-TEST';
create temp table ct_p as select '{"version":"ct-v1","items":[{"id":"u1","mech":"uppsala","choice":"b","why":"chưa đủ tri thức"},{"id":"x","mech":"explain","text":"vì cam kết tăng trước tri thức"}]}'::jsonb as p;
grant select on ct_p to anon, authenticated;

-- anon: bị chặn hoàn toàn
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select pg_temp.ct_fail($q$select public.bizon_case_task_submit('CT-TEST','Doi A','pre','A',(select p from ct_p))$q$, 'permission denied');
select pg_temp.ct_fail($q$select * from public.bizon_case_task_mine('CT-TEST')$q$, 'permission denied');
select pg_temp.ct_fail($q$select * from public.bizon_case_task_class('CT-TEST')$q$, 'permission denied');
select pg_temp.ct_fail($q$select * from public.case_tasks$q$, 'permission denied');
reset role;

-- email ngoài trường: không nộp được
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e3","email":"jt.ngoai@gmail.com","role":"authenticated"}', false); set role authenticated;
select pg_temp.ct_fail($q$select public.bizon_case_task_submit('CT-TEST','Doi A','pre','A',(select p from ct_p))$q$, 'email trường');
reset role;

-- sinh viên a: nộp pre A, nộp lại (trong 24 giờ → cập nhật), nộp post B; kiểm tra tham số sai
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1","email":"jt.a@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.ct_eq(public.bizon_case_task_submit('ct-test','Doi A','PRE','a',(select p from ct_p), 420, 'hidden', 'bizon-ct-v1')->>'form', 'A', 'nộp pre');
select pg_temp.ct_eq((select count(*)::text from public.bizon_case_task_mine('CT-TEST')), '1', 'mine 1');
select pg_temp.ct_eq(public.bizon_case_task_submit('CT-TEST','Doi A','pre','A',(select p from ct_p), 500, 'hidden', 'bizon-ct-v1')->>'phase', 'pre', 'nộp lại pre');
select pg_temp.ct_eq((select count(*)::text from public.bizon_case_task_mine('CT-TEST')), '1', 'vẫn 1 dòng pre');
select pg_temp.ct_eq(public.bizon_case_task_submit('CT-TEST','Doi A','post','B',(select p from ct_p), 300, 'hidden', 'bizon-ct-v1')->>'form', 'B', 'nộp post');
select pg_temp.ct_eq((select string_agg(phase || ':' || form, ',') from public.bizon_case_task_mine('CT-TEST')), 'pre:A,post:B', 'mine 2');
select pg_temp.ct_fail($q$select public.bizon_case_task_submit('CT-TEST','Doi A','mid','A',(select p from ct_p))$q$, 'Giai đoạn');
select pg_temp.ct_fail($q$select public.bizon_case_task_submit('CT-TEST','Doi A','pre','C',(select p from ct_p))$q$, 'Bản bài');
select pg_temp.ct_fail($q$select public.bizon_case_task_submit('CT-TEST','Doi A','pre','A','{"items":[]}'::jsonb)$q$, 'không hợp lệ');
select pg_temp.ct_fail($q$select public.bizon_case_task_submit('CT-TEST','Doi A','pre','A',(select p from ct_p), null, 'maybe')$q$, 'Điều kiện');
select pg_temp.ct_fail($q$select public.bizon_case_task_submit('C','Doi A','pre','A',(select p from ct_p))$q$, 'Mã lớp');
-- hộ chiếu của a để ghép journey_id
select public.bizon_journey_upsert('CT-TEST','Doi A','{"schemaVersion":1,"journeyId":"J-CT-TEST-DOI-A-2026-11-03","classCode":"CT-TEST","teamName":"Doi A","createdAt":"2026-11-03T02:10:00Z","updatedAt":"2026-11-03T02:10:00Z","tiers":{"t1":{"status":"pending"},"t2":{"status":"pending"},"t3":{"status":"locked","variant":"durian"}},"carry":{},"carryEnabled":true}'::jsonb, 'x');
reset role;
-- quá 24 giờ: không nộp lại được
update public.case_tasks set created_at = now() - interval '2 days' where class_code = 'CT-TEST' and phase = 'post';
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1","email":"jt.a@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.ct_fail($q$select public.bizon_case_task_submit('CT-TEST','Doi A','post','B',(select p from ct_p))$q$, '24 giờ');
-- sinh viên a không xem được cả lớp (không phải chủ lớp): 0 dòng
select pg_temp.ct_eq((select count(*)::text from public.bizon_case_task_class('CT-TEST')), '0', 'sinh viên không xem lớp');
reset role;

-- sinh viên b: nộp pre B; mine của b chỉ thấy bài của b
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e2","email":"jt.b@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_case_task_submit('CT-TEST','Doi B','pre','B',(select p from ct_p), 380, 'shown', 'bizon-ct-v1');
select pg_temp.ct_eq((select string_agg(phase || ':' || form, ',') from public.bizon_case_task_mine('CT-TEST')), 'pre:B', 'mine của b');
reset role;

-- giảng viên chủ lớp: thấy 3 dòng, có email, journey_id của a; giảng viên khác: 0 dòng
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f1","email":"jt.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_claim_class('CT-TEST');
select pg_temp.ct_eq((select count(*)::text from public.bizon_case_task_class('CT-TEST')), '3', 'lớp 3 dòng');
select pg_temp.ct_eq((select string_agg(coalesce(journey_id, '-'), ',' order by student_email, phase) from public.bizon_case_task_class('CT-TEST')), 'J-CT-TEST-DOI-A-2026-11-03,J-CT-TEST-DOI-A-2026-11-03,-', 'journey_id ghép theo sinh viên');
select pg_temp.ct_eq((select (answers->'items'->0->>'choice') || '|' || explain || '|' || duration_s::text from public.bizon_case_task_class('CT-TEST') where phase = 'pre' and student_email = 'jt.a@student.ctu.edu.vn'), 'b|hidden|500', 'nội dung bản cập nhật');
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f2","email":"jt.gv2@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.ct_eq((select count(*)::text from public.bizon_case_task_class('CT-TEST')), '0', 'giảng viên khác');
reset role;

-- dọn: bài cũ hơn 12 tháng bị xoá
update public.case_tasks set updated_at = now() - interval '13 months' where class_code = 'CT-TEST' and phase = 'pre';
select public.bizon_purge_expired();
select pg_temp.ct_eq((select count(*)::text from public.case_tasks where class_code = 'CT-TEST'), '1', 'purge');
select 'case_tasks_smoke: OK' as result;
