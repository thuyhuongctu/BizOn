-- ============================================================
-- BizOn — Nhánh nghiên cứu «hộp đen» (R1): cờ lớp ẩn phần giải thích cơ chế trong game
-- Thiết kế: docs/architecture/NHANH-HOP-DEN.md. Biến độc lập của nghiên cứu đánh giá: cùng engine, cùng biến cố,
-- cùng thông tin về môi trường; lớp «hộp đen» chỉ không thấy lời giải cơ chế (Lumina, dự báo Nếu – Thì, dòng giải thích hành trang…).
--
-- CHỈ THÊM, an toàn khi chạy lại:
--   1. class_controls.explain_hidden (boolean; null/false = hiện giải thích như mặc định, true = ẩn).
--   2. bizon_set_explain_hidden(p_class_code, p_on): chủ lớp bật/tắt (Trang Giảng viên).
--   3. bizon_class_feed trả thêm explain_hidden (game đọc ẩn danh theo mã lớp; js/explain-mode.js).
-- Chạy SAU 20261026000000_journey_passports.sql (giữ journey_carry trong feed). Kiểm thử: test/sql/explain_mode_smoke.sql.
-- ============================================================
alter table public.class_controls add column if not exists explain_hidden boolean;
comment on column public.class_controls.explain_hidden is 'Nhánh nghiên cứu: true = ẩn phần giải thích cơ chế trong game của lớp này (hộp đen); null/false = hiện (mặc định).';

create or replace function public.bizon_set_explain_hidden(p_class_code text, p_on boolean)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Không có quyền với lớp này.'; end if;
  insert into class_controls (class_code, explain_hidden, updated_at) values (v, coalesce(p_on, false), now())
  on conflict (class_code) do update set explain_hidden = excluded.explain_hidden, updated_at = now();
  return true;
end; $$;
revoke all on function public.bizon_set_explain_hidden(text, boolean) from public, anon;
grant execute on function public.bizon_set_explain_hidden(text, boolean) to authenticated;

create or replace function public.bizon_class_feed(p_class_code text, p_team_name text)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object(
    'controls', (select jsonb_build_object('locked_round', c.locked_round, 'forced_event', c.forced_event, 'forced_event_round', c.forced_event_round, 'message', c.message, 'exam_started_at', c.exam_started_at, 'journey_carry', c.journey_carry, 'explain_hidden', c.explain_hidden, 'updated_at', c.updated_at)
                 from class_controls c where c.class_code = upper(trim(p_class_code))),
    'grants', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'amount', g.amount, 'reason', g.reason, 'created_at', g.created_at) order by g.created_at)
                 from class_grants g where g.class_code = upper(trim(p_class_code)) and (g.team_name = p_team_name or g.team_name = '*')), '[]'::jsonb)
  );
$$;

notify pgrst, 'reload schema';
