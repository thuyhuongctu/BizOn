\set ON_ERROR_STOP on
-- Kiểm 20261123010000_ben_phu_sa_nop_khong_dang_nhap.sql trên CSDL đã chạy test/sql/supabase_auth_stub.sql và toàn bộ migration.
-- Dùng mã lớp NKDN-…; chạy lại được.
reset role;
delete from public.ft_results where class_code like 'NKDN-%';
create or replace function pg_temp.nk_eq(p_actual bigint, p_expected bigint, p_what text) returns void language plpgsql as $$
begin if p_actual is distinct from p_expected then raise exception '% : được %, cần %', p_what, p_actual, p_expected; end if; end; $$;

-- Khách ẩn danh nộp được; mã lớp chuẩn hoá chữ hoa; không có email, không có student_id; đánh dấu nộp không đăng nhập.
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select public.bizon_submit_ft_result_khach(' nkdn-1 ', 'Út Sen', 'Đội Sen Hồng – Út Sen', 152.3, 78, 2, '{"explain":"shown"}'::jsonb, 'bizon-bps3d-v2');
-- Sai giá trị thì từ chối.
do $$ begin perform public.bizon_submit_ft_result_khach('x', null, 'Đội', 1, 50, 1, null, 'v'); raise exception 'nhận mã lớp sai'; exception when others then if sqlerrm not like '%Mã lớp%' then raise; end if; end $$;
do $$ begin perform public.bizon_submit_ft_result_khach('NKDN-1', null, 'Đội', 1, 150, 1, null, 'v'); raise exception 'nhận hiệu suất 150'; exception when others then if sqlerrm not like '%không hợp lệ%' then raise; end if; end $$;
do $$ begin perform public.bizon_submit_ft_result_khach('NKDN-1', null, 'Đội', 1, 50, 5, null, 'v'); raise exception 'nhận hạng 5'; exception when others then if sqlerrm not like '%không hợp lệ%' then raise; end if; end $$;
do $$ begin perform public.bizon_submit_ft_result_khach('NKDN-1', null, '   ', 1, 50, 1, null, 'v'); raise exception 'nhận tên đội trống'; exception when others then if sqlerrm not like '%không hợp lệ%' then raise; end if; end $$;
do $$ begin perform public.bizon_submit_ft_result_khach('NKDN-1', null, 'Đội', 1, 50, 1, '[1]'::jsonb, 'v'); raise exception 'nhận chi tiết không phải đối tượng'; exception when others then if sqlerrm not like '%không hợp lệ%' then raise; end if; end $$;
-- Khách vẫn không ghi thẳng, không đọc thẳng được bảng.
do $$ begin insert into public.ft_results (class_code, team_name, total_revenue, efficiency, final_rank) values ('NKDN-1', 'x', 1, 1, 1); raise exception 'anon ghi thẳng được ft_results'; exception when insufficient_privilege then null; end $$;
do $$ begin if exists (select 1 from public.ft_results where class_code like 'NKDN-%') then raise exception 'anon đọc thẳng được ft_results'; end if; exception when insufficient_privilege then null; end $$;
reset role;

select pg_temp.nk_eq((select count(*) from public.ft_results where class_code = 'NKDN-1'), 1, 'số lượt đã lưu');
select pg_temp.nk_eq((select count(*) from public.ft_results where class_code = 'NKDN-1' and student_id is null and student_email is null
  and (detail_json->>'nop_khong_dang_nhap')::boolean and detail_json->>'explain' = 'shown' and player_name = 'Út Sen' and efficiency = 78 and final_rank = 2), 1, 'lượt ẩn danh đúng dữ liệu, không email');

-- Bảng xếp hạng công khai không tính lượt ẩn danh.
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
select pg_temp.nk_eq((select count(*) from public.ft_class_leaderboard('NKDN-1')), 0, 'bảng xếp hạng công khai bỏ lượt ẩn danh');
reset role;

-- Giới hạn 120 lượt/lớp/phút.
insert into public.ft_results (class_code, team_name, total_revenue, efficiency, final_rank) select 'NKDN-2', 'Đội ' || g, 1, 1, 1 from generate_series(1, 120) g;
select set_config('request.jwt.claims', '{"role":"anon"}', false); set role anon;
do $$ begin perform public.bizon_submit_ft_result_khach('NKDN-2', null, 'Đội 121', 1, 50, 1, null, 'v'); raise exception 'nhận lượt thứ 121 trong một phút'; exception when others then if sqlerrm not like '%Quá nhiều%' then raise; end if; end $$;
reset role;

delete from public.ft_results where class_code like 'NKDN-%';
select 'ben_phu_sa_nop_khong_dang_nhap_smoke: ok';
