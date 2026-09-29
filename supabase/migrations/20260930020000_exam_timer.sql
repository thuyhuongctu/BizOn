-- BizOn — Đồng hồ thi có tính giờ (theo «Thang điểm game Bật Nghiệp», mục 1–2).
-- Thêm cột exam_started_at vào class_controls đã có (20260928000000_class_controls.sql).
-- Mặc định NULL: lớp không bật tính giờ thì game chạy như trước, không đổi hành vi.

alter table public.class_controls add column if not exists exam_started_at timestamptz;

-- Đổi chữ ký bizon_set_controls: thêm p_exam_started_at (có default null nên lời gọi cũ 5 tham số vẫn chạy được).
drop function if exists public.bizon_set_controls(text,int,text,int,text);

create or replace function public.bizon_set_controls(p_class_code text, p_locked_round int, p_forced_event text, p_forced_event_round int, p_message text, p_exam_started_at timestamptz default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Không có quyền với lớp này.'; end if;
  insert into class_controls (class_code, locked_round, forced_event, forced_event_round, message, exam_started_at, updated_at)
  values (v, p_locked_round, nullif(p_forced_event, ''), p_forced_event_round, nullif(p_message, ''), p_exam_started_at, now())
  on conflict (class_code) do update set locked_round = excluded.locked_round, forced_event = excluded.forced_event,
    forced_event_round = excluded.forced_event_round, message = excluded.message, exam_started_at = excluded.exam_started_at, updated_at = now();
  return true;
end; $$;

revoke all on function public.bizon_set_controls(text,int,text,int,text,timestamptz) from public, anon;
grant execute on function public.bizon_set_controls(text,int,text,int,text,timestamptz) to authenticated;

-- bizon_class_feed (đọc bởi game.html mỗi ~20s): thêm exam_started_at vào controls trả về.
create or replace function public.bizon_class_feed(p_class_code text, p_team_name text)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object(
    'controls', (select jsonb_build_object('locked_round', c.locked_round, 'forced_event', c.forced_event, 'forced_event_round', c.forced_event_round, 'message', c.message, 'exam_started_at', c.exam_started_at, 'updated_at', c.updated_at)
                 from class_controls c where c.class_code = upper(trim(p_class_code))),
    'grants', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'amount', g.amount, 'reason', g.reason, 'created_at', g.created_at) order by g.created_at)
                 from class_grants g where g.class_code = upper(trim(p_class_code)) and (g.team_name = p_team_name or g.team_name = '*')), '[]'::jsonb)
  );
$$;
-- bizon_class_state_v2 dùng to_jsonb(c) nên đã tự động trả thêm exam_started_at, không cần sửa.

notify pgrst, 'reload schema';
