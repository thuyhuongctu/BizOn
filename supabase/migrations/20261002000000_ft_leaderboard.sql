-- ============================================================
-- BizOn — Bến Phù Sa: bảng xếp hạng lớp (chiếu trực tiếp) cho bảng ft_results (INSERT-only).
-- Chạy sau các migration trước. An toàn khi chạy lại.
-- ============================================================
create index if not exists idx_ft_class on public.ft_results (upper(class_code), total_revenue desc);

-- Công khai: tên + đội + doanh thu, lượt cao nhất của mỗi người
create or replace function public.ft_class_leaderboard(p_class_code text)
returns table (player_name text, team_name text, total_revenue numeric, efficiency numeric, final_rank int, exam boolean, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select * from (
    select distinct on (lower(coalesce(r.player_name, '')), r.team_name)
      coalesce(nullif(r.player_name, ''), 'Ẩn danh'), r.team_name, r.total_revenue, r.efficiency::numeric, r.final_rank::int, coalesce((r.detail_json->>'exam')::boolean, false), r.created_at
    from ft_results r
    where upper(r.class_code) = upper(trim(p_class_code))
    order by lower(coalesce(r.player_name, '')), r.team_name, r.total_revenue desc, r.created_at
  ) x order by x.total_revenue desc, x.created_at limit 60;
$$;
revoke all on function public.ft_class_leaderboard(text) from public;
grant execute on function public.ft_class_leaderboard(text) to anon, authenticated;

notify pgrst, 'reload schema';
