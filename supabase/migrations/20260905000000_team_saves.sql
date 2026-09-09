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
-- Chống đội khác đoán (class_code, team_name) để đọc trộm/ghi đè: mỗi
-- dòng có thêm save_token_hash (bản băm SHA-256 của 1 token ngẫu nhiên
-- do trình duyệt của đội tự sinh lần lưu đầu, xem js/backend.js). Lần
-- lưu ĐẦU TIÊN cho một (class_code, team_name) sẽ "nhận" token đó làm
-- chủ; các lần đọc/ghi sau bắt buộc gửi đúng token mới được phép — cùng
-- kiểu dữ liệu (delete_token_hash) đã dùng cho bp_learning_traces.
--
-- Chạy tệp này 1 lần trong Supabase Dashboard → SQL Editor → Run.
-- ============================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists team_saves (
  class_code text not null check (length(trim(class_code)) > 0),
  team_name text not null check (length(trim(team_name)) > 0),
  state_json jsonb not null,
  save_token_hash text,
  updated_at timestamptz not null default now(),
  primary key (class_code, team_name)
);

-- Nâng cấp bảng đã tồn tại từ trước (nếu tệp này từng chạy trước khi có cột này).
alter table team_saves add column if not exists save_token_hash text;

create index if not exists idx_team_saves_updated on team_saves (updated_at);

alter table team_saves enable row level security;
-- Không tạo policy SELECT/INSERT/UPDATE cho anon trên bảng này —
-- mọi truy cập đi qua 2 hàm bên dưới.

create or replace function get_team_save(p_class_code text, p_team_name text, p_token text default null)
returns table(state_json jsonb, updated_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash text;
begin
  select ts.save_token_hash into v_hash
  from team_saves ts
  where ts.class_code = trim(p_class_code) and ts.team_name = trim(p_team_name);

  if not found then
    return; -- chưa từng lưu – không có gì để đọc, không cần token
  end if;

  -- Dòng cũ từ trước khi có token (v_hash null) vẫn đọc được bình thường,
  -- để không khóa nhầm đội đang dùng dở tiến trình từ trước bản vá này.
  if v_hash is not null and v_hash is distinct from encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex') then
    return; -- token sai – coi như không có dữ liệu, không lộ gì thêm
  end if;

  return query
    select ts.state_json, ts.updated_at
    from team_saves ts
    where ts.class_code = trim(p_class_code) and ts.team_name = trim(p_team_name);
end;
$$;

revoke all on function get_team_save(text, text, text) from public;
grant execute on function get_team_save(text, text, text) to anon;

create or replace function upsert_team_save(p_class_code text, p_team_name text, p_state jsonb, p_token text default null)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_class text := trim(p_class_code);
  v_team text := trim(p_team_name);
  v_new_hash text := encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
  v_existing_hash text;
  v_found boolean;
begin
  select ts.save_token_hash into v_existing_hash
  from team_saves ts where ts.class_code = v_class and ts.team_name = v_team;
  v_found := found;

  if v_found and v_existing_hash is not null and v_existing_hash is distinct from v_new_hash then
    raise exception 'invalid save token';
  end if;

  insert into team_saves (class_code, team_name, state_json, save_token_hash, updated_at)
  values (v_class, v_team, p_state, v_new_hash, now())
  on conflict (class_code, team_name)
  -- Dòng cũ chưa có token (v_existing_hash null) được "nhận chủ" ngay ở lần
  -- ghi kế tiếp này; dòng đã có token thì giữ nguyên token cũ (đã qua kiểm
  -- tra ở trên nên chắc chắn khớp).
  do update set state_json = excluded.state_json, updated_at = now(),
    save_token_hash = coalesce(team_saves.save_token_hash, excluded.save_token_hash);
end;
$$;

revoke all on function upsert_team_save(text, text, jsonb, text) from public;
grant execute on function upsert_team_save(text, text, jsonb, text) to anon;

-- Ghi chú vận hành:
--  • Một đội chỉ có đúng 1 dòng lưu tiến trình (mới nhất luôn ghi đè) —
--    khác round_submissions (lưu mọi lần nộp để đối chiếu lịch sử).
--  • anon key được phép nhúng công khai trong web (thiết kế của
--    Supabase); TUYỆT ĐỐI không nhúng service_role key.
--  • Token lưu trong localStorage của trình duyệt đội đó – mất trình
--    duyệt/xóa dữ liệu site thì mất luôn quyền ghi đè dòng đó (đội cần
--    dùng lại Mã lớp + Tên đội mới, hoặc giảng viên xóa dòng cũ trong
--    Table Editor để đội lưu lại từ đầu).
