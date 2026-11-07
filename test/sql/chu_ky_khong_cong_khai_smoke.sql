\set ON_ERROR_STOP on
-- Kiểm 20261107000000_chu_ky_khong_cong_khai.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration.
-- Chạy lại được: dọn lớp CK-TEST trước. Giảng viên ck.gv là chủ lớp.
reset role;
delete from public.class_cert_config where class_code = 'CK-TEST';
delete from public.instructor_class_access where class_code = 'CK-TEST';
create or replace function pg_temp.ck_eq(p_actual text, p_expected text, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, p_actual, p_expected; end if; end; $$;
grant execute on function pg_temp.ck_eq(text, text, text) to anon, authenticated;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'ck.gv@ctu.edu.vn') on conflict (id) do nothing;
insert into public.instructor_allowlist (email, note, added_by) values ('ck.gv@ctu.edu.vn', 'test', 'test') on conflict (email) do nothing;

-- Dòng cũ còn đường dẫn chữ ký (lưu trước migration này): feed công khai không được trả ra.
insert into public.class_cert_config (class_code, org_name, signer_name, signer_title, signer_sig)
  values ('CK-TEST', 'Trường Thử', 'TS. Người Ký', 'Trưởng khoa', 'assets/docs/chu-ky-that.png');
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select pg_temp.ck_eq(public.bizon_cert_feed('CK-TEST') ->> 'signer_sig', '', 'anon: feed không trả chữ ký');
select pg_temp.ck_eq(public.bizon_cert_feed('CK-TEST') ->> 'signer_name', 'TS. Người Ký', 'anon: feed vẫn trả tên người ký');
select pg_temp.ck_eq(public.bizon_cert_feed('ck-test') ->> 'org_name', 'Trường Thử', 'anon: mã lớp chữ thường vẫn tìm được');
select pg_temp.ck_eq(public.bizon_cert_feed('KHONG-CO') ->> 'signer_sig', '', 'anon: lớp chưa cấu hình');

-- Chủ lớp lưu đơn vị cấp kèm chữ ký: chữ ký không được lưu.
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c1","email":"ck.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_claim_class('CK-TEST');
select public.bizon_set_cert_issuer('CK-TEST', 'Trường Thử', '', '', '', 'TS. Người Ký', 'Trưởng khoa', 'assets/docs/chu-ky-moi.png');
reset role;
select pg_temp.ck_eq((select signer_sig from public.class_cert_config where class_code = 'CK-TEST'), '', 'chủ lớp: chữ ký không được lưu');
select pg_temp.ck_eq((select signer_title from public.class_cert_config where class_code = 'CK-TEST'), 'Trưởng khoa', 'chủ lớp: chức danh vẫn lưu');

delete from public.class_cert_config where class_code = 'CK-TEST';
delete from public.instructor_class_access where class_code = 'CK-TEST';
select 'chu_ky_khong_cong_khai_smoke: OK';
