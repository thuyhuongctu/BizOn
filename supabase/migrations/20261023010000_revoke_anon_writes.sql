-- ============================================================
-- BizOn — Bắt buộc sinh viên đăng nhập mới nộp kết quả về lớp (bước 2/2: THU HỒI)
--
-- ÁP SAU 20261023000000_require_student_login.sql VÀ SAU KHI các trang đã lên
-- bản nộp qua hàm có đăng nhập (game.html, Bến Phù Sa, Hộ Chiếu). Áp sớm hơn
-- thì trang cũ đang mở trong lớp sẽ không nộp được nữa.
--
--   1. Bỏ quyền INSERT trực tiếp của anon/authenticated trên round_submissions,
--      ft_results, bp_results, member_log: chỉ còn đường nộp qua
--      bizon_submit_round / bizon_submit_ft_result / bizon_submit_bp_result /
--      bizon_log_member (SECURITY DEFINER, kiểm auth.uid() + email trường).
--   2. Thu hồi khỏi anon các hàm đọc/ghi theo Mã lớp + Tên đội không xác thực:
--      get_team_save / upsert_team_save (thay bằng bizon_student_get_save /
--      bizon_student_upsert_save) và bizon_team_log / bizon_team_all_log
--      (thay bằng bản _v2 chỉ cho thành viên đúng đội).
--   3. Bảng xếp hạng công khai chỉ tính lượt nộp đã đăng nhập (student_id có
--      giá trị); tên hiện ra là biệt danh người chơi tự đặt, không bao giờ
--      trả email. Lượt ẩn danh cũ vẫn nằm trong bảng cho giảng viên xem.
--
-- Không đổi: survey_responses (phiếu khảo sát nghiên cứu, ẩn danh theo thiết
-- kế), client_errors, bizon_report_bug. An toàn khi chạy lại.
-- ============================================================

-- ---------- 1. Bỏ ghi trực tiếp ----------
drop policy if exists "sinh vien chi duoc nop ket qua" on public.round_submissions;
drop policy if exists "sinh vien chi duoc nop ket qua ganh hang" on public.ft_results;
drop policy if exists "sinh vien chi duoc nop ket qua ho chieu" on public.bp_results;
drop policy if exists bp_results_insert on public.bp_results;
drop policy if exists member_log_insert on public.member_log;

revoke insert on public.round_submissions from anon, authenticated;
revoke insert on public.ft_results from anon, authenticated;
revoke insert on public.bp_results from anon, authenticated;
revoke insert on public.member_log from anon, authenticated;

-- ---------- 2. Thu hồi hàm theo Mã lớp + Tên đội ----------
revoke execute on function public.get_team_save(text, text, text) from anon, authenticated, public;
revoke execute on function public.upsert_team_save(text, text, jsonb, text) from anon, authenticated, public;
revoke execute on function public.bizon_team_log(text, text, int) from anon, authenticated, public;
revoke execute on function public.bizon_team_all_log(text, text) from anon, authenticated, public;

-- ---------- 3. Bảng xếp hạng: chỉ lượt đã đăng nhập, hiện biệt danh ----------
create or replace function public.bp_class_leaderboard(p_class_code text)
returns table (player_name text, company text, total_score int, markets int, badges int, stars int, title text, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select * from (
    select distinct on (r.student_id, r.company)
      coalesce(nullif(r.player_name, ''), 'Người chơi'), r.company, r.total_score, r.markets, r.badges, r.stars, r.title, r.created_at
    from bp_results r
    where upper(r.class_code) = upper(trim(p_class_code)) and r.student_id is not null
    order by r.student_id, r.company, r.total_score desc, r.created_at
  ) x order by x.total_score desc, x.created_at limit 50;
$$;
revoke all on function public.bp_class_leaderboard(text) from public;
grant execute on function public.bp_class_leaderboard(text) to anon, authenticated;

create or replace function public.ft_class_leaderboard(p_class_code text)
returns table (player_name text, team_name text, total_revenue numeric, efficiency numeric, final_rank int, exam boolean, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select * from (
    select distinct on (r.student_id, r.team_name)
      coalesce(nullif(r.player_name, ''), 'Người chơi'), r.team_name, r.total_revenue, r.efficiency::numeric, r.final_rank::int, coalesce((r.detail_json->>'exam')::boolean, false), r.created_at
    from ft_results r
    where upper(r.class_code) = upper(trim(p_class_code)) and r.student_id is not null
    order by r.student_id, r.team_name, r.total_revenue desc, r.created_at
  ) x order by x.total_revenue desc, x.created_at limit 60;
$$;
revoke all on function public.ft_class_leaderboard(text) from public;
grant execute on function public.ft_class_leaderboard(text) to anon, authenticated;

create or replace function public.ft_class_results_by_version(p_class_code text)
returns table (player_name text, team_name text, total_revenue numeric, efficiency numeric, final_rank int, exam boolean, created_at timestamptz, app_version text)
language sql security definer stable set search_path = public as $$
  select * from (
    select distinct on (r.student_id, r.team_name, coalesce(r.app_version, ''))
      coalesce(nullif(r.player_name, ''), 'Người chơi'), r.team_name, r.total_revenue, r.efficiency::numeric, r.final_rank::int,
      coalesce((r.detail_json->>'exam')::boolean, false), r.created_at, r.app_version
    from ft_results r
    where upper(r.class_code) = upper(trim(p_class_code)) and r.student_id is not null
    order by r.student_id, r.team_name, coalesce(r.app_version, ''), r.total_revenue desc, r.created_at
  ) x order by x.total_revenue desc, x.created_at limit 120;
$$;
revoke all on function public.ft_class_results_by_version(text) from public;
grant execute on function public.ft_class_results_by_version(text) to anon, authenticated;

notify pgrst, 'reload schema';
