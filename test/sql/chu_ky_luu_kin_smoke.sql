\set ON_ERROR_STOP on
-- Kiểm 20261115010000_chu_ky_luu_kin.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration.
-- Chạy lại được: dọn lớp KIN-TEST trước. kin.gv là chủ lớp, kin.khac là giảng viên khác.
reset role;
delete from public.class_cert_signature where class_code = 'KIN-TEST';
delete from public.class_cert_config where class_code = 'KIN-TEST';
delete from public.instructor_class_access where class_code = 'KIN-TEST';
create or replace function pg_temp.kin_eq(p_actual text, p_expected text, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được "%", cần "%"', p_what, left(p_actual, 60), left(p_expected, 60); end if; end; $$;
grant execute on function pg_temp.kin_eq(text, text, text) to anon, authenticated;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000d1', 'kin.gv@ctu.edu.vn'), ('00000000-0000-0000-0000-0000000000d2', 'kin.khac@ctu.edu.vn') on conflict (id) do nothing;
insert into public.instructor_allowlist (email, note, added_by) values ('kin.gv@ctu.edu.vn', 'test', 'test'), ('kin.khac@ctu.edu.vn', 'test', 'test') on conflict (email) do nothing;

-- Chủ lớp lưu rồi đọc lại chữ ký.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d1","email":"kin.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_claim_class('KIN-TEST');
select public.bizon_set_cert_issuer('KIN-TEST', 'Trường Thử', '', '', '', 'TS. Người Ký', 'Trưởng khoa', '');
select pg_temp.kin_eq(public.bizon_get_cert_signature('KIN-TEST'), '', 'chủ lớp: chưa lưu thì rỗng');
select public.bizon_set_cert_signature('kin-test', 'data:image/png;base64,iVBORw0KGgo=');
select pg_temp.kin_eq(public.bizon_get_cert_signature('KIN-TEST'), 'data:image/png;base64,iVBORw0KGgo=', 'chủ lớp: đọc lại chữ ký (mã lớp chữ thường)');
-- Không nhận thứ không phải ảnh data URL.
do $$ begin perform public.bizon_set_cert_signature('KIN-TEST', 'https://evil.example/x.png'); raise exception 'không được nhận URL ngoài'; exception when others then if sqlerrm not like '%không hợp lệ%' then raise; end if; end $$;
do $$ begin perform public.bizon_set_cert_signature('KIN-TEST', 'data:image/svg+xml;base64,PHN2Zz4='); raise exception 'không được nhận SVG'; exception when others then if sqlerrm not like '%không hợp lệ%' then raise; end if; end $$;
-- Bảng không đọc thẳng được dù đã đăng nhập.
do $$ begin perform 1 from public.class_cert_signature; raise exception 'authenticated đọc thẳng được bảng'; exception when insufficient_privilege then null; end $$;

-- Giảng viên khác: không đọc, không ghi được.
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d2","email":"kin.khac@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
do $$ begin perform public.bizon_get_cert_signature('KIN-TEST'); raise exception 'giảng viên khác đọc được chữ ký'; exception when others then if sqlerrm not like '%không sở hữu%' then raise; end if; end $$;
do $$ begin perform public.bizon_set_cert_signature('KIN-TEST', ''); raise exception 'giảng viên khác xoá được chữ ký'; exception when others then if sqlerrm not like '%không sở hữu%' then raise; end if; end $$;

-- Ẩn danh (sinh viên tự tải chứng nhận): feed công khai vẫn không có chữ ký; không gọi được hàm đọc.
reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select pg_temp.kin_eq(public.bizon_cert_feed('KIN-TEST') ->> 'signer_sig', '', 'anon: feed không trả chữ ký');
select pg_temp.kin_eq(public.bizon_cert_feed('KIN-TEST') ->> 'signer_name', 'TS. Người Ký', 'anon: feed vẫn trả tên người ký');
do $$ begin perform public.bizon_get_cert_signature('KIN-TEST'); raise exception 'anon gọi được hàm đọc chữ ký'; exception when insufficient_privilege then null; end $$;
do $$ begin perform 1 from public.class_cert_signature; raise exception 'anon đọc thẳng được bảng'; exception when insufficient_privilege then null; end $$;

-- Chủ lớp xoá chữ ký.
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000d1","email":"kin.gv@ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_set_cert_signature('KIN-TEST', '');
select pg_temp.kin_eq(public.bizon_get_cert_signature('KIN-TEST'), '', 'chủ lớp: xoá xong thì rỗng');

reset role;
delete from public.class_cert_signature where class_code = 'KIN-TEST';
delete from public.class_cert_config where class_code = 'KIN-TEST';
delete from public.instructor_class_access where class_code = 'KIN-TEST';
select 'chu_ky_luu_kin_smoke: OK';
