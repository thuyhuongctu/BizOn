-- ============================================================
-- BizOn — Nhật ký đóng góp của từng thành viên đội (chấm B5, B6 tự động)
-- Mỗi thành viên chơi trên máy riêng, đăng nhập cùng Mã lớp + Tên đội + vai.
-- Game ghi: đề xuất theo vai (proposal), biên bản SEC (minutes), mô phỏng Nếu–Thì (whatif), CEO chốt vòng (commit).
-- Chạy SAU 20260928000000_class_controls.sql. An toàn khi chạy lại.
-- ============================================================
create table if not exists public.member_log (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  team_name text not null,
  round_number int not null check (round_number between 1 and 6),
  member_email text,
  member_name text,
  role text not null check (role in ('CEO','CFO','CMO','COO','SEC')),
  kind text not null check (kind in ('proposal','minutes','whatif','commit')),
  payload jsonb,
  client_ts timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_member_log on public.member_log (upper(class_code), team_name, round_number);
alter table public.member_log enable row level security;
revoke all on public.member_log from anon, authenticated;
grant insert on public.member_log to anon, authenticated;
drop policy if exists member_log_insert on public.member_log;
create policy member_log_insert on public.member_log for insert to anon, authenticated
  with check (class_code ~ '^[A-Za-z0-9_-]{3,40}$' and length(team_name) <= 80
    and coalesce(length(member_name), 0) <= 60 and coalesce(length(payload::text), 0) <= 4000);

-- Trong game: CEO xem đề xuất của đội ở vòng hiện tại (không trả email)
create or replace function public.bizon_team_log(p_class_code text, p_team_name text, p_round int)
returns table (member_name text, role text, kind text, payload jsonb, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select l.member_name, l.role, l.kind, l.payload, l.created_at from member_log l
  where upper(l.class_code) = upper(trim(p_class_code)) and l.team_name = p_team_name and l.round_number = p_round
    and l.kind in ('proposal','minutes')
  order by l.created_at desc limit 40;
$$;

-- Trang Giảng viên: toàn bộ nhật ký của lớp mình sở hữu
create or replace function public.bizon_member_log(p_class_code text)
returns setof public.member_log language sql security definer stable set search_path = public as $$
  select * from member_log l
  where bizon_owns_class(upper(trim(p_class_code))) and upper(l.class_code) = upper(trim(p_class_code))
  order by l.team_name, l.round_number, l.created_at;
$$;

revoke all on function public.bizon_team_log(text,text,int) from public;
grant execute on function public.bizon_team_log(text,text,int) to anon, authenticated;
revoke all on function public.bizon_member_log(text) from public, anon;
grant execute on function public.bizon_member_log(text) to authenticated;

notify pgrst, 'reload schema';
