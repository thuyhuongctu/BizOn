-- Nâng giới hạn cho lớp đông (160–200 sinh viên trong MỘT mã lớp), 12/11/2026.
--
-- Vì sao: lớp sinh viên quốc tế 160 bạn (KT330H) dùng chung một mã lớp. Các giới hạn cũ viết cho lớp 40–60 bạn:
--   • phiếu khảo sát: 150 phiếu / phút / mã lớp  → 160 bạn nộp cùng một phút thì có bạn bị từ chối;
--   • bảng xếp hạng Bến Phù Sa trả 60 dòng, Hộ Chiếu Thương Hiệu 50 dòng, kết quả theo phiên bản 120 dòng
--     → lớp đông thì đội xếp dưới biến mất mà không báo;
--   • bizon_feed_v2 tối đa 100 dòng → đường lùi của trang Giảng viên (khi thiếu bizon_submissions_v2) cụt ở 100 lượt nộp,
--     trong khi 32 đội × 6 vòng = 192 lượt.
--
-- Chỉ đổi CON SỐ: thân hàm chép nguyên từ 20261023010000_revoke_anon_writes.sql, 20260914000000_instructor_auth.sql
-- và 20261104000000_ra_soat_bao_mat.sql. Không đổi bảng, không đổi quyền, không xoá dữ liệu. Chạy lại được.
-- LƯU Ý: nếu sau này áp lại một trong ba migration trên thì phải áp lại tệp này (các con số sẽ quay về mức cũ).

-- ---------- 1. Phiếu khảo sát: 500 phiếu / phút / mã lớp, 1500 phiếu / phút toàn hệ thống ----------
--   client_errors và bug_reports giữ nguyên (300 dòng / 5 phút, 60 báo cáo / giờ).
create or replace function public.bizon_rate_limit_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if tg_table_name = 'survey_responses' then
    select count(*) into n from public.survey_responses where class_code = new.class_code and created_at > now() - interval '1 minute';
    if n >= 500 then raise exception 'Quá nhiều phiếu cho lớp này trong một phút, thử lại sau.' using errcode = 'P0001'; end if;
    select count(*) into n from public.survey_responses where created_at > now() - interval '1 minute';
    if n >= 1500 then raise exception 'Hệ thống đang nhận quá nhiều phiếu, thử lại sau.' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'client_errors' then
    select count(*) into n from public.client_errors where created_at > now() - interval '5 minutes';
    if n >= 300 then raise exception 'Quá nhiều báo lỗi, thử lại sau.' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'bug_reports' then
    select count(*) into n from public.bug_reports where created_at > now() - interval '1 hour';
    if n >= 60 then raise exception 'Quá nhiều báo cáo lỗi trong một giờ, thử lại sau.' using errcode = 'P0001'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.bizon_rate_limit_guard() from public, anon, authenticated;

-- ---------- 2. Bảng xếp hạng công khai (biệt danh): 500 dòng, kết quả theo phiên bản 1000 dòng ----------
create or replace function public.bp_class_leaderboard(p_class_code text)
returns table (player_name text, company text, total_score int, markets int, badges int, stars int, title text, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select * from (
    select distinct on (r.student_id, r.company)
      coalesce(nullif(r.player_name, ''), 'Người chơi'), r.company, r.total_score, r.markets, r.badges, r.stars, r.title, r.created_at
    from bp_results r
    where upper(r.class_code) = upper(trim(p_class_code)) and r.student_id is not null
    order by r.student_id, r.company, r.total_score desc, r.created_at
  ) x order by x.total_score desc, x.created_at limit 500;
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
  ) x order by x.total_revenue desc, x.created_at limit 500;
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
  ) x order by x.total_revenue desc, x.created_at limit 1000;
$$;
revoke all on function public.ft_class_results_by_version(text) from public;
grant execute on function public.ft_class_results_by_version(text) to anon, authenticated;

-- ---------- 3. Dòng nộp gần đây cho chủ lớp: mặc định vẫn 30, xin tối đa 1000 (trước là 100) ----------
create or replace function public.bizon_feed_v2(p_class_code text, p_limit int default 30)
returns table (
  team_name text,
  round_number int,
  net_profit numeric,
  share numeric,
  created_at timestamptz
)
language sql security definer stable
set search_path = public
as $$
  with auth as materialized (
    select bizon_owns_class(p_class_code) as ok
  )
  select rs.team_name, rs.round_number,
         (rs.result_json->>'netProfit')::numeric,
         (rs.result_json->>'share')::numeric,
         rs.created_at
  from round_submissions rs, auth
  where auth.ok and rs.class_code = p_class_code
  order by rs.created_at desc
  limit least(coalesce(p_limit, 30), 1000);
$$;
revoke all on function public.bizon_feed_v2(text, int) from public, anon;
grant execute on function public.bizon_feed_v2(text, int) to authenticated;

notify pgrst, 'reload schema';
