-- ============================================================
-- BizOn Bật Nghiệp – Nhận báo cáo lỗi từ sinh viên
--
-- Trước đây nút "Gửi báo cáo lỗi" trong game chỉ hiện thông báo, không gửi gì.
-- Bảng này nhận báo cáo qua hàm bizon_report_bug (ghi được, không đọc được).
--
-- Bảo mật: anon KHÔNG có quyền SELECT/INSERT trực tiếp trên bảng, chỉ gọi
-- được hàm bizon_report_bug. Giảng viên đọc báo cáo trong Table Editor
-- (vai trò postgres/service role) hoặc SQL Editor.
--
-- Chạy tệp này 1 lần trong Supabase Dashboard → SQL Editor → Run.
-- ============================================================

create table if not exists public.bug_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  class_code text,
  team_name text,
  round_number int,
  role text,
  description text not null check (char_length(description) between 5 and 2000),
  user_agent text
);

alter table public.bug_reports enable row level security;
-- Không tạo policy cho anon/authenticated: mọi ghi đi qua hàm bên dưới.
revoke all on public.bug_reports from anon, authenticated, public;

create or replace function public.bizon_report_bug(
  p_class_code text,
  p_team_name text,
  p_round int,
  p_role text,
  p_description text,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if char_length(trim(coalesce(p_description, ''))) < 5 then
    raise exception 'description too short';
  end if;
  insert into public.bug_reports (class_code, team_name, round_number, role, description, user_agent)
  values (
    left(nullif(trim(coalesce(p_class_code, '')), ''), 40),
    left(nullif(trim(coalesce(p_team_name, '')), ''), 60),
    p_round,
    left(nullif(trim(coalesce(p_role, '')), ''), 20),
    left(trim(p_description), 2000),
    left(p_user_agent, 300)
  );
end;
$$;

revoke all on function public.bizon_report_bug(text, text, int, text, text, text) from public;
grant execute on function public.bizon_report_bug(text, text, int, text, text, text) to anon;
