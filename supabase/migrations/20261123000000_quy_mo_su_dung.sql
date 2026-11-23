-- Quy mô sử dụng cho trang Bằng chứng (23/11/2026): một hàm công khai chỉ trả số tổng, không trả mã lớp, tên đội, email hay
-- bất kỳ dòng dữ liệu nào. Bỏ các lớp mẫu và lớp thử (mã bắt đầu bằng DEMO hoặc TEST).
--   lop                 số mã lớp khác nhau đã có dữ liệu ở bất kỳ trò chơi nào
--   doi_bat_nghiep      số đội (lớp × tên đội) đã nộp ít nhất một vòng Bật Nghiệp
--   van_bat_nghiep_xong số đội đã nộp đủ vòng 6 Bật Nghiệp
--   luot_ben_phu_sa     số ván Bến Phù Sa đã nộp kết quả
--   luot_ho_chieu       số ván Hộ Chiếu Thương Hiệu đã nộp kết quả
--   tu_ngay             ngày có dữ liệu sớm nhất (chỉ ngày, không giờ)
-- Chỉ đọc; không ghi bảng nào. Áp lên production bằng workflow «Supabase – áp migration lên production» (chạy tay).
create or replace function public.bizon_quy_mo_su_dung()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with lop as (
    select upper(trim(class_code)) as c, created_at as t from round_submissions
    union all select upper(trim(class_code)), updated_at from team_saves
    union all select upper(trim(class_code)), created_at from ft_results
    union all select upper(trim(class_code)), created_at from bp_results
  ), that as (
    select * from lop where c !~ '^(DEMO|TEST)'
  ), doi as (
    select upper(trim(class_code)) as c, lower(trim(team_name)) as d, max(round_number) as v
    from round_submissions where upper(trim(class_code)) !~ '^(DEMO|TEST)'
    group by 1, 2
  )
  select jsonb_build_object(
    'lop', (select count(distinct c) from that),
    'doi_bat_nghiep', (select count(*) from doi),
    'van_bat_nghiep_xong', (select count(*) from doi where v >= 6),
    'luot_ben_phu_sa', (select count(*) from ft_results where upper(trim(class_code)) !~ '^(DEMO|TEST)'),
    'luot_ho_chieu', (select count(*) from bp_results where upper(trim(class_code)) !~ '^(DEMO|TEST)'),
    'tu_ngay', (select to_char(min(t) at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') from that)
  );
$$;

revoke all on function public.bizon_quy_mo_su_dung() from public;
grant execute on function public.bizon_quy_mo_su_dung() to anon, authenticated;
comment on function public.bizon_quy_mo_su_dung() is 'Số tổng quy mô sử dụng cho trang Bằng chứng; không trả dữ liệu từng lớp hay từng người.';
