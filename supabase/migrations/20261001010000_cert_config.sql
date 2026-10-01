-- ============================================================
-- BizOn — Chứng nhận chính thức: giảng viên nhập 1 lần mã môn/tên môn/ngày
-- học cho cả lớp, áp dụng cho chứng nhận kiểu ĐH Cần Thơ (bản tải thứ 2,
-- cạnh chứng chỉ BizOn mặc định) ở cả 3 game. Chạy SAU
-- 20260928000000_class_controls.sql. An toàn khi chạy lại.
-- ============================================================
create table if not exists public.class_cert_config (
  class_code text primary key check (class_code ~ '^[A-Z0-9_-]{3,40}$'),
  course_code text not null default 'KT330H' check (char_length(course_code) <= 30),
  course_name text not null default 'Entrepreneurship' check (char_length(course_name) <= 120),
  course_dates text not null default '' check (char_length(course_dates) <= 160),
  updated_at timestamptz not null default now()
);
alter table public.class_cert_config enable row level security;
revoke all on public.class_cert_config from anon, authenticated;

create or replace function public.bizon_set_cert_config(p_class_code text, p_course_code text, p_course_name text, p_course_dates text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Bạn không sở hữu lớp này'; end if;
  insert into class_cert_config (class_code, course_code, course_name, course_dates, updated_at)
  values (v, coalesce(nullif(trim(p_course_code), ''), 'KT330H'), coalesce(nullif(trim(p_course_name), ''), 'Entrepreneurship'), coalesce(trim(p_course_dates), ''), now())
  on conflict (class_code) do update set course_code = excluded.course_code, course_name = excluded.course_name,
    course_dates = excluded.course_dates, updated_at = now();
  return true;
end; $$;

-- Đọc cấu hình chứng nhận (cho game và Trang Giảng viên) – luôn trả về một
-- bộ giá trị hợp lệ (mặc định KT330H/Entrepreneurship) kể cả khi lớp chưa
-- cấu hình gì, để chứng nhận chính thức luôn tải được.
create or replace function public.bizon_cert_feed(p_class_code text)
returns jsonb language sql security definer stable set search_path = public as $$
  select coalesce(
    (select jsonb_build_object('course_code', c.course_code, 'course_name', c.course_name, 'course_dates', c.course_dates)
     from class_cert_config c where c.class_code = upper(trim(p_class_code))),
    jsonb_build_object('course_code', 'KT330H', 'course_name', 'Entrepreneurship', 'course_dates', ''));
$$;

revoke all on function public.bizon_set_cert_config(text,text,text,text) from public, anon;
grant execute on function public.bizon_set_cert_config(text,text,text,text) to authenticated;
revoke all on function public.bizon_cert_feed(text) from public;
grant execute on function public.bizon_cert_feed(text) to anon, authenticated;

notify pgrst, 'reload schema';
