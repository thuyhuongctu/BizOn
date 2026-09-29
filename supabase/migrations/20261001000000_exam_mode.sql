-- ============================================================
-- BizOn — Chế độ thi: tự động tính giờ từng vòng + vốn khởi điểm
-- Giảng viên đặt giờ bắt đầu, số phút chuẩn bị, số phút mỗi vòng, vốn cấp.
-- Game tự khóa/mở vòng theo giờ máy chủ; hết giờ vòng, máy CEO tự Commit.
-- Chạy SAU 20260928000000_class_controls.sql. An toàn khi chạy lại.
-- ============================================================
create table if not exists public.class_exam (
  class_code text primary key check (class_code ~ '^[A-Z0-9_-]{3,40}$'),
  active boolean not null default false,
  start_at timestamptz,
  setup_min int not null default 10 check (setup_min between 0 and 60),
  round_min int not null default 8 check (round_min between 2 and 60),
  capital numeric not null default 500 check (capital between 0 and 100000),
  updated_at timestamptz not null default now()
);
alter table public.class_exam enable row level security;
revoke all on public.class_exam from anon, authenticated;

create or replace function public.bizon_set_exam(p_class_code text, p_active boolean, p_start_at timestamptz, p_setup_min int, p_round_min int, p_capital numeric)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Bạn không sở hữu lớp này'; end if;
  insert into class_exam (class_code, active, start_at, setup_min, round_min, capital, updated_at)
  values (v, p_active, p_start_at, coalesce(p_setup_min, 10), coalesce(p_round_min, 8), coalesce(p_capital, 500), now())
  on conflict (class_code) do update set active = excluded.active, start_at = excluded.start_at, setup_min = excluded.setup_min,
    round_min = excluded.round_min, capital = excluded.capital, updated_at = now();
  return true;
end; $$;

-- Đọc lịch thi + giờ máy chủ (cho game và Trang Giảng viên)
create or replace function public.bizon_exam_feed(p_class_code text)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object('now', now(), 'exam',
    (select jsonb_build_object('active', e.active, 'start_at', e.start_at, 'setup_min', e.setup_min, 'round_min', e.round_min, 'capital', e.capital)
     from class_exam e where e.class_code = upper(trim(p_class_code))));
$$;

revoke all on function public.bizon_set_exam(text,boolean,timestamptz,int,int,numeric) from public, anon;
grant execute on function public.bizon_set_exam(text,boolean,timestamptz,int,int,numeric) to authenticated;
revoke all on function public.bizon_exam_feed(text) from public;
grant execute on function public.bizon_exam_feed(text) to anon, authenticated;

notify pgrst, 'reload schema';
