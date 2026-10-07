-- ============================================================
-- BizOn — Mở rộng nhật ký đóng góp: thêm loại 'lumina' (hỏi cố vấn AI)
-- và RPC cho sinh viên tự xem toàn bộ nhật ký đội mình (tab "Hiệu suất thành viên").
-- Chạy SAU 20260930000000_member_log.sql. An toàn khi chạy lại.
-- ============================================================
alter table public.member_log drop constraint if exists member_log_kind_check;
alter table public.member_log add constraint member_log_kind_check
  check (kind in ('proposal','minutes','whatif','commit','lumina'));

-- Trong game: mọi thành viên xem toàn bộ nhật ký đội mình (không trả email, giống bizon_team_log)
create or replace function public.bizon_team_all_log(p_class_code text, p_team_name text)
returns table (round_number int, member_name text, role text, kind text, payload jsonb, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select l.round_number, l.member_name, l.role, l.kind, l.payload, l.created_at from member_log l
  where upper(l.class_code) = upper(trim(p_class_code)) and l.team_name = p_team_name
  order by l.round_number, l.created_at limit 500;
$$;

revoke all on function public.bizon_team_all_log(text,text) from public;
grant execute on function public.bizon_team_all_log(text,text) to anon, authenticated;

notify pgrst, 'reload schema';
