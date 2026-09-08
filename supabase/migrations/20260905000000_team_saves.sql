-- ============================================================
-- BizOn Bật Nghiệp – Lưu & tải lại tiến trình theo đội (cross-device)
-- Triết lý: vẫn "sổ nhận kết quả" như round_submissions, nhưng đây là
-- bản lưu ĐẦY ĐỦ trạng thái ván chơi (S) — để đội đổi máy (phòng máy
-- dùng chung ở lớp KT330H và các lớp khác) vẫn tải lại đúng chỗ đang
-- chơi dở, thay vì phải bắt đầu lại từ đầu.
--
-- Bảo mật: KHÔNG cấp SELECT/INSERT/UPDATE trực tiếp trên bảng cho anon
-- (tránh liệt kê toàn bộ dữ liệu mọi đội qua REST). Mọi truy cập đi qua
-- 2 hàm SECURITY DEFINER bên dưới, mỗi lần đúng 1 dòng khớp chính xác
-- (class_code, team_name) mà máy gọi tự cung cấp — cùng mức tin cậy
-- đang dùng cho round_submissions (không đăng nhập; mã lớp + tên đội
-- coi như định danh trong lớp, dữ liệu chỉ là số liệu mô phỏng).
--
-- Chạy tệp này 1 lần trong Supabase Dashboard → SQL Editor → Run.
-- ============================================================

create table if not exists team_saves (
  class_code text not null check (length(trim(class_code)) > 0),
  team_name text not null check (length(trim(team_name)) > 0),
  state_json jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (class_code, team_name)
);

create index if not exists idx_team_saves_updated on team_saves (updated_at);

alter table team_saves enable row level security;
-- Không tạo policy SELECT/INSERT/UPDATE cho anon trên bảng này —
-- mọi truy cập đi qua 2 hàm bên dưới.

create or replace function get_team_save(p_class_code text, p_team_name text)
returns table(state_json jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select ts.state_json, ts.updated_at
  from team_saves ts
  where ts.class_code = trim(p_class_code) and ts.team_name = trim(p_team_name);
$$;

revoke all on function get_team_save(text, text) from public;
grant execute on function get_team_save(text, text) to anon;

create or replace function upsert_team_save(p_class_code text, p_team_name text, p_state jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  insert into team_saves (class_code, team_name, state_json, updated_at)
  values (trim(p_class_code), trim(p_team_name), p_state, now())
  on conflict (class_code, team_name)
  do update set state_json = excluded.state_json, updated_at = now();
$$;

revoke all on function upsert_team_save(text, text, jsonb) from public;
grant execute on function upsert_team_save(text, text, jsonb) to anon;

-- Ghi chú vận hành:
--  • Một đội chỉ có đúng 1 dòng lưu tiến trình (mới nhất luôn ghi đè) —
--    khác round_submissions (lưu mọi lần nộp để đối chiếu lịch sử).
--  • anon key được phép nhúng công khai trong web (thiết kế của
--    Supabase); TUYỆT ĐỐI không nhúng service_role key.
