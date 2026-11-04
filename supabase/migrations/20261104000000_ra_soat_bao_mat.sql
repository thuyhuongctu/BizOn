-- ============================================================
-- BizOn — Siết bảo mật sau rà soát toàn dự án 03/11/2026
--
-- CHỈ THÊM / SIẾT, an toàn khi chạy lại, không xoá dữ liệu:
--   1. key_check_attempts: bật RLS, thu mọi quyền trực tiếp (bảng của cơ chế khoá cũ; hàm SECURITY DEFINER vẫn dùng được).
--   2. live_progress: chỉ nhận tiến độ cho Mã lớp đã có giảng viên đăng ký (instructor_class_access) – chặn ghi rác vào lớp lạ.
--   3. survey_responses, client_errors, bug_reports (khách ẩn danh ghi được): giới hạn độ dài/kích thước cho dòng MỚI
--      (ràng buộc NOT VALID, không kiểm lại dòng cũ) và giới hạn tần suất bằng trigger đếm dòng gần đây.
--   4. team_saves: bản lưu của đội phải là đối tượng JSON và ≤ 256 KB (dòng mới / lần ghi mới).
-- Kiểm thử: test/sql/ra_soat_bao_mat_smoke.sql (chạy sau toàn bộ migration).
-- ============================================================

-- ---------- 1. key_check_attempts ----------
do $$
begin
  if to_regclass('public.key_check_attempts') is not null then
    execute 'alter table public.key_check_attempts enable row level security';
    execute 'revoke all on table public.key_check_attempts from public, anon, authenticated';
  end if;
end $$;

-- ---------- 2. live_progress: lớp phải tồn tại ----------
create or replace function public.bizon_live_progress_require_class()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.instructor_class_access a where a.class_code = new.class_code) then
    raise exception 'Mã lớp % chưa được giảng viên đăng ký.', new.class_code using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.bizon_live_progress_require_class() from public, anon, authenticated;

drop trigger if exists trg_live_progress_require_class on public.live_progress;
create trigger trg_live_progress_require_class
  before insert or update of class_code on public.live_progress
  for each row execute function public.bizon_live_progress_require_class();

-- ---------- 3. Bảng khách ẩn danh ghi được: kích thước + tần suất ----------
-- 3a. Giới hạn kích thước (NOT VALID: chỉ áp cho dòng mới, dòng cũ giữ nguyên)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'survey_responses_size_ck') then
    alter table public.survey_responses add constraint survey_responses_size_ck check (
      char_length(class_code) <= 40 and char_length(student_code) <= 40
      and coalesce(char_length(role), 0) <= 40
      and coalesce(char_length(open_like), 0) <= 2000 and coalesce(char_length(open_improve), 0) <= 2000
      and pg_column_size(answers_a) <= 8192 and pg_column_size(likert_b) <= 4096
      and coalesce(pg_column_size(likert_c), 0) <= 4096 and coalesce(pg_column_size(score_by_outcome), 0) <= 4096
      and score_a between 0 and 100 and coalesce(rounds_played, 0) between 0 and 100
    ) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'client_errors_size_ck') then
    alter table public.client_errors add constraint client_errors_size_ck check (
      char_length(page) <= 300 and char_length(message) <= 2000
      and coalesce(char_length(source), 0) <= 500 and coalesce(char_length(stack), 0) <= 4000
      and coalesce(char_length(app_version), 0) <= 60 and coalesce(char_length(user_agent), 0) <= 500
      and coalesce(char_length(viewport), 0) <= 40
    ) not valid;
  end if;
end $$;

create index if not exists idx_ce_created on public.client_errors (created_at);
create index if not exists idx_sr_created on public.survey_responses (created_at);
create index if not exists idx_bug_reports_created on public.bug_reports (created_at);

-- 3b. Giới hạn tần suất. Trigger SECURITY DEFINER đếm dòng gần đây (khách không đọc được bảng nên không tự đếm được).
--   survey_responses: ≤ 150 phiếu / phút cho một Mã lớp (lớp 60 sinh viên nộp cùng lúc vẫn dư) và ≤ 600 phiếu / phút toàn hệ thống.
--   client_errors:    ≤ 300 dòng / 5 phút toàn hệ thống (trình duyệt đã lọc trùng, mỗi trang tối đa 5 lỗi).
--   bug_reports:      ≤ 60 báo cáo / giờ toàn hệ thống.
create or replace function public.bizon_rate_limit_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if tg_table_name = 'survey_responses' then
    select count(*) into n from public.survey_responses where class_code = new.class_code and created_at > now() - interval '1 minute';
    if n >= 150 then raise exception 'Quá nhiều phiếu cho lớp này trong một phút, thử lại sau.' using errcode = 'P0001'; end if;
    select count(*) into n from public.survey_responses where created_at > now() - interval '1 minute';
    if n >= 600 then raise exception 'Hệ thống đang nhận quá nhiều phiếu, thử lại sau.' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'client_errors' then
    select count(*) into n from public.client_errors where created_at > now() - interval '5 minutes';
    if n >= 300 then raise exception 'Quá nhiều báo lỗi, thử lại sau.' using errcode = 'P0001'; end if;
  elsif tg_table_name = 'bug_reports' then
    select count(*) into n from public.bug_reports where created_at > now() - interval '1 hour';
    if n >= 60 then raise exception 'Quá nhiều báo cáo lỗi trong một giờ, thử lại sau.' using errcode = 'P0001'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.bizon_rate_limit_guard() from public, anon, authenticated;

drop trigger if exists trg_survey_rate on public.survey_responses;
create trigger trg_survey_rate before insert on public.survey_responses for each row execute function public.bizon_rate_limit_guard();
drop trigger if exists trg_client_errors_rate on public.client_errors;
create trigger trg_client_errors_rate before insert on public.client_errors for each row execute function public.bizon_rate_limit_guard();
drop trigger if exists trg_bug_reports_rate on public.bug_reports;
create trigger trg_bug_reports_rate before insert on public.bug_reports for each row execute function public.bizon_rate_limit_guard();

-- ---------- 4. team_saves: đối tượng JSON, ≤ 256 KB ----------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'team_saves_state_ck') then
    alter table public.team_saves add constraint team_saves_state_ck
      check (jsonb_typeof(state_json) = 'object' and pg_column_size(state_json) <= 262144) not valid;
  end if;
end $$;
