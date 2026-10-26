\set ON_ERROR_STOP on
-- Kiểm hành vi của 20261027000000_explain_mode.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration
-- (có thể chạy sau journey_passports_smoke.sql, và chạy lại được: dọn lớp XP-TEST trước). Lớp riêng XP-TEST, giảng viên jt.gv (đã duyệt) và jt.gv2.
reset role;
delete from public.class_controls where class_code = 'XP-TEST';
delete from public.instructor_class_access where class_code = 'XP-TEST';
create or replace function pg_temp.xp_fail(p_sql text, p_needle text) returns void language plpgsql as $$
begin
  begin execute p_sql; exception when others then
    if p_needle <> '' and position(p_needle in sqlerrm) = 0 then raise exception 'Lỗi sai loại: "%" (cần "%")', sqlerrm, p_needle; end if; return; end;
  raise exception 'Lẽ ra phải bị chặn: %', p_sql;
end; $$;
grant execute on function pg_temp.xp_fail(text, text) to anon, authenticated;
create or replace function pg_temp.xp_eq(p_actual text, p_expected text, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, p_actual, p_expected; end if; end; $$;
grant execute on function pg_temp.xp_eq(text, text, text) to anon, authenticated;

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f1', 'jt.gv@ctu.edu.vn'), ('00000000-0000-0000-0000-0000000000f2', 'jt.gv2@ctu.edu.vn') on conflict (id) do nothing;
insert into public.instructor_allowlist (email, note, added_by) values ('jt.gv@ctu.edu.vn', 'test', 'test'), ('jt.gv2@ctu.edu.vn', 'test', 'test') on conflict (email) do nothing;

-- anon: không đặt được cờ; feed đọc được, chưa có controls
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select pg_temp.xp_fail($q$select public.bizon_set_explain_hidden('XP-TEST', true)$q$, 'permission denied');
select pg_temp.xp_eq((public.bizon_class_feed('XP-TEST','-')->'controls')::text, 'null', 'chưa có controls');
reset role;
-- chủ lớp: bật → feed true (journey_carry vẫn có khoá, null); tắt → false
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f1","email":"jt.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_claim_class('XP-TEST');
select pg_temp.xp_eq(public.bizon_set_explain_hidden('xp-test', true)::text, 'true', 'bật');
select pg_temp.xp_eq(public.bizon_class_feed('XP-TEST','-')->'controls'->>'explain_hidden', 'true', 'feed true');
select pg_temp.xp_eq(((public.bizon_class_feed('XP-TEST','-')->'controls') ? 'journey_carry')::text, 'true', 'feed vẫn có journey_carry');
select pg_temp.xp_eq(public.bizon_class_state_v2('XP-TEST')->'controls'->>'explain_hidden', 'true', 'state giảng viên');
select pg_temp.xp_eq(public.bizon_set_explain_hidden('XP-TEST', false)::text, 'true', 'tắt');
select pg_temp.xp_eq(public.bizon_class_feed('XP-TEST','-')->'controls'->>'explain_hidden', 'false', 'feed false');
reset role;
-- giảng viên khác: không có quyền; cờ không đổi
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000f2","email":"jt.gv2@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select pg_temp.xp_fail($q$select public.bizon_set_explain_hidden('XP-TEST', true)$q$, 'quyền');
reset role;
select pg_temp.xp_eq((select explain_hidden::text from public.class_controls where class_code = 'XP-TEST'), 'false', 'cờ giữ nguyên');
select 'explain_mode_smoke: OK' as result;
