\set ON_ERROR_STOP on
-- Kiểm 20261119000000_khach_dang_ky_email.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration.
-- Chạy lại được: dọn các email @khach-test.example trước.
reset role;
delete from public.guest_signups where email like '%@khach-test.example';
create or replace function pg_temp.kh_eq(p_actual bigint, p_expected bigint, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được %, cần %', p_what, p_actual, p_expected; end if; end; $$;

-- Khách ẩn danh đăng ký được; email chuẩn hoá chữ thường, đăng ký lại không tạo dòng mới.
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select public.bizon_guest_signup('  Mot.Khach@Khach-Test.Example ', true, 'en', 'giang-vien');
select public.bizon_guest_signup('mot.khach@khach-test.example', true, 'vi', 'giang-vien');
-- Không đồng ý hoặc email sai thì từ chối.
do $$ begin perform public.bizon_guest_signup('hai@khach-test.example', false); raise exception 'nhận khi không đồng ý'; exception when others then if sqlerrm not like '%đồng ý%' then raise; end if; end $$;
do $$ begin perform public.bizon_guest_signup('khong-phai-email', true); raise exception 'nhận email sai'; exception when others then if sqlerrm not like '%không hợp lệ%' then raise; end if; end $$;
do $$ begin perform public.bizon_guest_signup('a b@khach-test.example', true); raise exception 'nhận email có dấu cách'; exception when others then if sqlerrm not like '%không hợp lệ%' then raise; end if; end $$;
-- Ẩn danh không đọc, không ghi thẳng được bảng.
do $$ begin perform 1 from public.guest_signups; raise exception 'anon đọc thẳng được bảng'; exception when insufficient_privilege then null; end $$;
do $$ begin insert into public.guest_signups (email, consent) values ('ba@khach-test.example', true); raise exception 'anon ghi thẳng được bảng'; exception when insufficient_privilege then null; end $$;

-- Người đã đăng nhập cũng chỉ ghi qua hàm.
reset role;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000e1","email":"sv@student.ctu.edu.vn","role":"authenticated"}', false); set role authenticated;
select public.bizon_guest_signup('bon@khach-test.example', true);
do $$ begin perform 1 from public.guest_signups; raise exception 'authenticated đọc thẳng được bảng'; exception when insufficient_privilege then null; end $$;

reset role;
select pg_temp.kh_eq((select count(*) from public.guest_signups where email like '%@khach-test.example'), 2, 'số email khách đã lưu');
select pg_temp.kh_eq((select count(*) from public.guest_signups where email = 'mot.khach@khach-test.example' and lang = 'en' and consent), 1, 'email chuẩn hoá, giữ ngôn ngữ lần đầu');
delete from public.guest_signups where email like '%@khach-test.example';
\echo 'khach_dang_ky_email_smoke: ok'
