-- ============================================================
-- BizOn — Hộ Chiếu Thương Hiệu: bảng kết quả + bảng xếp hạng lớp
-- Chạy SAU 20260928000000_class_controls.sql. An toàn khi chạy lại.
-- ============================================================
create table if not exists public.bp_results (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  player_name text,
  company text,
  total_score int,
  profit numeric,
  rep numeric, capab numeric, adapt numeric, sust numeric,
  title text,
  quarters int,
  detail_json jsonb,
  app_version text,
  client_ts timestamptz,
  created_at timestamptz not null default now()
);
alter table public.bp_results add column if not exists markets int;
alter table public.bp_results add column if not exists badges int;
alter table public.bp_results add column if not exists stars int;
create index if not exists idx_bp_class on public.bp_results (upper(class_code), total_score desc);
alter table public.bp_results enable row level security;
revoke all on public.bp_results from anon, authenticated;
grant insert on public.bp_results to anon, authenticated;
drop policy if exists bp_results_insert on public.bp_results;
create policy bp_results_insert on public.bp_results for insert to anon, authenticated
  with check (class_code ~ '^[A-Za-z0-9_-]{3,40}$' and coalesce(total_score, 0) between 0 and 100 and coalesce(length(player_name), 0) <= 60);

-- Bảng xếp hạng công khai cho người chơi (chỉ tên + điểm, lấy lượt cao nhất mỗi người/doanh nghiệp)
create or replace function public.bp_class_leaderboard(p_class_code text)
returns table (player_name text, company text, total_score int, markets int, badges int, stars int, title text, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select * from (
    select distinct on (lower(coalesce(r.player_name, '')), r.company)
      coalesce(nullif(r.player_name, ''), 'Ẩn danh'), r.company, r.total_score, r.markets, r.badges, r.stars, r.title, r.created_at
    from bp_results r
    where upper(r.class_code) = upper(trim(p_class_code))
    order by lower(coalesce(r.player_name, '')), r.company, r.total_score desc, r.created_at
  ) x order by x.total_score desc, x.created_at limit 50;
$$;

-- Toàn bộ kết quả cho giảng viên sở hữu lớp
create or replace function public.bizon_bp_results(p_class_code text)
returns setof public.bp_results language sql security definer stable set search_path = public as $$
  select * from bp_results r
  where bizon_owns_class(upper(trim(p_class_code))) and upper(r.class_code) = upper(trim(p_class_code))
  order by r.total_score desc, r.created_at;
$$;

revoke all on function public.bp_class_leaderboard(text) from public;
grant execute on function public.bp_class_leaderboard(text) to anon, authenticated;
revoke all on function public.bizon_bp_results(text) from public, anon;
grant execute on function public.bizon_bp_results(text) to authenticated;

notify pgrst, 'reload schema';
