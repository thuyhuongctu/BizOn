-- ============================================================
-- BizOn — Nhãn rubric 4 mức cho "Chỉ số đồng đội" (tab Sổ điểm, Trang Giảng
-- viên). Giảng viên tự đặt tên 4 mức diễn giải điểm cân bằng 0–100; đây là
-- nhãn diễn giải, KHÔNG phải điểm chấm. Chạy SAU 20260930000000_member_log.sql.
-- An toàn khi chạy lại.
-- ============================================================
create table if not exists public.class_rubric_config (
  class_code text primary key check (class_code ~ '^[A-Z0-9_-]{3,40}$'),
  level1 text not null default 'Rất cân bằng' check (char_length(level1) <= 40),
  level2 text not null default 'Khá cân bằng' check (char_length(level2) <= 40),
  level3 text not null default 'Lệch rõ' check (char_length(level3) <= 40),
  level4 text not null default 'Lệch nhiều' check (char_length(level4) <= 40),
  updated_at timestamptz not null default now()
);
alter table public.class_rubric_config enable row level security;
revoke all on public.class_rubric_config from anon, authenticated;

create or replace function public.bizon_set_rubric_config(p_class_code text, p_level1 text, p_level2 text, p_level3 text, p_level4 text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Bạn không sở hữu lớp này'; end if;
  insert into class_rubric_config (class_code, level1, level2, level3, level4, updated_at)
  values (v, coalesce(nullif(trim(p_level1), ''), 'Rất cân bằng'), coalesce(nullif(trim(p_level2), ''), 'Khá cân bằng'),
    coalesce(nullif(trim(p_level3), ''), 'Lệch rõ'), coalesce(nullif(trim(p_level4), ''), 'Lệch nhiều'), now())
  on conflict (class_code) do update set level1 = excluded.level1, level2 = excluded.level2,
    level3 = excluded.level3, level4 = excluded.level4, updated_at = now();
  return true;
end; $$;

-- Chỉ giảng viên sở hữu lớp mới đọc được (nhãn riêng cho Sổ điểm nội bộ, không dùng trong game).
create or replace function public.bizon_rubric_config_feed(p_class_code text)
returns jsonb language sql security definer stable set search_path = public as $$
  select coalesce(
    (select jsonb_build_object('level1', c.level1, 'level2', c.level2, 'level3', c.level3, 'level4', c.level4)
     from class_rubric_config c where c.class_code = upper(trim(p_class_code)) and bizon_owns_class(c.class_code)),
    jsonb_build_object('level1', 'Rất cân bằng', 'level2', 'Khá cân bằng', 'level3', 'Lệch rõ', 'level4', 'Lệch nhiều'));
$$;

revoke all on function public.bizon_set_rubric_config(text,text,text,text,text) from public, anon;
grant execute on function public.bizon_set_rubric_config(text,text,text,text,text) to authenticated;
revoke all on function public.bizon_rubric_config_feed(text) from public, anon;
grant execute on function public.bizon_rubric_config_feed(text) to authenticated;

notify pgrst, 'reload schema';
