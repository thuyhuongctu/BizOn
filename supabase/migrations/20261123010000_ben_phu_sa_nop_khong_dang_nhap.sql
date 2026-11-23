-- Bến Phù Sa: cho nộp kết quả không cần đăng nhập (23/11/2026, chị Hương duyệt «Nới»).
-- Bến Phù Sa là bậc nhập môn; trên production chưa có ván nào được nộp vì bắt buộc đăng nhập email trường. Hàm mới
-- bizon_submit_ft_result_khach nhận lượt nộp ẩn danh vào ft_results:
--   • không nhận và không lưu email; student_id, student_email để trống; detail_json có thêm "nop_khong_dang_nhap": true;
--   • cùng các kiểm tra giá trị như bizon_submit_ft_result (mã lớp, độ dài, hiệu suất 0–100, hạng 1–4, chi tiết ≤ 20 KB);
--   • giới hạn: 120 lượt/lớp/phút và 600 lượt toàn hệ thống/phút (chặn nộp tràn);
--   • lượt ẩn danh hiện trên bảng của giảng viên chủ lớp (bizon_ft_board_v, tên «(ẩn danh)» nếu không đặt biệt danh) nhưng
--     KHÔNG lên bảng xếp hạng công khai (ft_class_leaderboard chỉ tính student_id có giá trị), nên không ai mạo danh được.
-- Hàm cũ bizon_submit_ft_result (có đăng nhập) giữ nguyên; trang dùng hàm cũ khi sinh viên đã đăng nhập.
-- Áp lên production bằng workflow «Supabase – áp migration lên production» (chạy tay, gõ APPLY). Chạy lại được.
create or replace function public.bizon_submit_ft_result_khach(
  p_class_code text, p_player_name text, p_team_name text, p_total_revenue numeric,
  p_efficiency int, p_final_rank int, p_detail_json jsonb, p_app_version text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lop text := upper(trim(coalesce(p_class_code, '')));
  n integer;
begin
  if v_lop !~ '^[A-Z0-9_-]{3,40}$' then
    raise exception 'Mã lớp không hợp lệ.';
  end if;
  if coalesce(length(p_player_name), 0) > 60 or coalesce(length(trim(p_team_name)), 0) not between 1 and 80
     or p_total_revenue is null or p_total_revenue not between -100000 and 100000
     or coalesce(p_efficiency, -1) not between 0 and 100
     or coalesce(p_final_rank, 0) not between 1 and 4
     or (p_detail_json is not null and jsonb_typeof(p_detail_json) <> 'object')
     or coalesce(length(p_detail_json::text), 0) > 20000 then
    raise exception 'Kết quả không hợp lệ.';
  end if;
  select count(*) into n from public.ft_results where upper(class_code) = v_lop and created_at > now() - interval '1 minute';
  if n >= 120 then raise exception 'Quá nhiều lượt nộp cho lớp này trong một phút, thử lại sau.' using errcode = 'P0001'; end if;
  select count(*) into n from public.ft_results where created_at > now() - interval '1 minute';
  if n >= 600 then raise exception 'Hệ thống đang nhận quá nhiều lượt nộp, thử lại sau.' using errcode = 'P0001'; end if;

  insert into public.ft_results (
    class_code, player_name, team_name, total_revenue, efficiency, final_rank,
    detail_json, app_version, client_ts, student_id, student_email
  ) values (
    v_lop, nullif(trim(coalesce(p_player_name, '')), ''), trim(p_team_name), p_total_revenue, p_efficiency, p_final_rank,
    coalesce(p_detail_json, '{}'::jsonb) || jsonb_build_object('nop_khong_dang_nhap', true), left(p_app_version, 40), now(), null, null
  );
end;
$$;
revoke all on function public.bizon_submit_ft_result_khach(text, text, text, numeric, int, int, jsonb, text) from public;
grant execute on function public.bizon_submit_ft_result_khach(text, text, text, numeric, int, int, jsonb, text) to anon, authenticated;
comment on function public.bizon_submit_ft_result_khach(text, text, text, numeric, int, int, jsonb, text) is
  'Bến Phù Sa: nộp kết quả không cần đăng nhập; không lưu email; không lên bảng xếp hạng công khai.';

notify pgrst, 'reload schema';
