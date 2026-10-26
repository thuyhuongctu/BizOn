-- ============================================================
-- BizOn — Hành trình 3 bậc «Từ Phù Sa ra Thế giới» (J7): hộ chiếu trên máy chủ + cờ hành trang của lớp
-- Thiết kế: docs/architecture/HANH-TRINH-3-BAC.md (mục 5 lưu trữ, mục 11 quyết định 2: lớp chấm điểm mặc định TẮT hành trang).
--
-- CHỈ THÊM, không thu hồi gì, an toàn khi chạy lại:
--   1. class_controls.journey_carry (boolean, null = chưa đặt → lớp có mã thật không áp hành trang) +
--      bizon_set_journey_carry (chủ lớp bật/tắt) + bizon_class_feed trả thêm journey_carry (game đọc qua BizOnClassSync).
--   2. journey_passports: mỗi sinh viên (đăng nhập email trường) một hộ chiếu cho mỗi (lớp, đội); RLS bật, không cấp quyền
--      bảng cho client – chỉ qua hai RPC: bizon_journey_upsert (ghi hộ chiếu của mình), bizon_journey_get (đọc của mình,
--      hoặc bản mới nhất của đội mình trong student_team_membership). Hộ chiếu không chứa email/tên thật – chỉ tên đội,
--      kết quả từng bậc và hành trang đã áp.
--   3. bizon_journey_class: giảng viên sở hữu lớp xem hộ chiếu của lớp (cột Hành trình trên Trang Giảng viên).
--   4. bizon_purge_expired: dọn hộ chiếu không cập nhật quá 12 tháng (như kết quả ván). Xoá tài khoản sinh viên →
--      on delete cascade.
-- Chạy SAU 20261023000000_require_student_login.sql (bizon_is_student_email, student_team_membership, bizon_owns_class).
-- Áp lên dự án thật CHỈ sau khi được xác nhận (xem PR). Kiểm thử: test/sql/journey_passports_smoke.sql.
-- ============================================================

-- ---------- 1. Cờ hành trang của lớp ----------
alter table public.class_controls add column if not exists journey_carry boolean;
comment on column public.class_controls.journey_carry is 'Hành trình 3 bậc: lớp có áp hành trang giữa các bậc không. null/false = không (mặc định công bằng khi chấm); true = giảng viên cho phép.';

create or replace function public.bizon_set_journey_carry(p_class_code text, p_on boolean)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Không có quyền với lớp này.'; end if;
  insert into class_controls (class_code, journey_carry, updated_at) values (v, coalesce(p_on, false), now())
  on conflict (class_code) do update set journey_carry = excluded.journey_carry, updated_at = now();
  return true;
end; $$;
revoke all on function public.bizon_set_journey_carry(text, boolean) from public, anon;
grant execute on function public.bizon_set_journey_carry(text, boolean) to authenticated;

-- bizon_class_feed (game.html đọc mỗi ~20 s; journey-link đọc một lần trước khi áp hành trang): thêm journey_carry.
create or replace function public.bizon_class_feed(p_class_code text, p_team_name text)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object(
    'controls', (select jsonb_build_object('locked_round', c.locked_round, 'forced_event', c.forced_event, 'forced_event_round', c.forced_event_round, 'message', c.message, 'exam_started_at', c.exam_started_at, 'journey_carry', c.journey_carry, 'updated_at', c.updated_at)
                 from class_controls c where c.class_code = upper(trim(p_class_code))),
    'grants', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'amount', g.amount, 'reason', g.reason, 'created_at', g.created_at) order by g.created_at)
                 from class_grants g where g.class_code = upper(trim(p_class_code)) and (g.team_name = p_team_name or g.team_name = '*')), '[]'::jsonb)
  );
$$;
-- bizon_class_state_v2 dùng to_jsonb(c) nên tự trả thêm journey_carry cho Trang Giảng viên.

-- ---------- 2. Hộ chiếu hành trình ----------
create table if not exists public.journey_passports (
  student_id uuid not null references auth.users(id) on delete cascade,
  class_code text not null check (class_code ~ '^[A-Z0-9_-]{3,40}$'),
  team_name text not null check (char_length(team_name) between 1 and 60),
  journey_id text not null check (char_length(journey_id) between 3 and 80),
  passport jsonb not null,
  app_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, class_code, team_name)
);
create index if not exists idx_journey_passports_team on public.journey_passports (class_code, lower(team_name), updated_at desc);
alter table public.journey_passports enable row level security;
revoke all on public.journey_passports from anon, authenticated, public;

-- Kiểm tra tối thiểu hộ chiếu (lược đồ v1 của js/core/journey.js); chi tiết hơn do client validatePassport.
create or replace function public.bizon_journey_passport_ok(p jsonb)
returns boolean language sql immutable as $$
  select p is not null and jsonb_typeof(p) = 'object'
     and (p->>'schemaVersion') = '1'
     and char_length(coalesce(p->>'journeyId', '')) between 3 and 80
     and jsonb_typeof(p->'tiers') = 'object'
     and char_length(p::text) <= 60000;
$$;
revoke all on function public.bizon_journey_passport_ok(jsonb) from public, anon, authenticated;

create or replace function public.bizon_journey_upsert(p_class_code text, p_team_name text, p_passport jsonb, p_app_version text default null)
returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare
  v_email text; v_code text := upper(trim(coalesce(p_class_code, ''))); v_team text := trim(coalesce(p_team_name, '')); v_at timestamptz;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập để lưu hộ chiếu.'; end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if not public.bizon_is_student_email(v_email) then raise exception 'Cần dùng đúng email trường (vd @student.ctu.edu.vn) để lưu hộ chiếu.'; end if;
  if v_code !~ '^[A-Z0-9_-]{3,40}$' then raise exception 'Mã lớp không hợp lệ.'; end if;
  if char_length(v_team) not between 1 and 60 then raise exception 'Tên đội không hợp lệ.'; end if;
  if not public.bizon_journey_passport_ok(p_passport) then raise exception 'Hộ chiếu không hợp lệ.'; end if;

  insert into public.journey_passports (student_id, class_code, team_name, journey_id, passport, app_version, created_at, updated_at)
  values (auth.uid(), v_code, v_team, p_passport->>'journeyId', p_passport, left(p_app_version, 40), now(), now())
  on conflict (student_id, class_code, team_name) do update
    set journey_id = excluded.journey_id, passport = excluded.passport, app_version = excluded.app_version, updated_at = now()
  returning updated_at into v_at;
  return jsonb_build_object('journey_id', p_passport->>'journeyId', 'updated_at', v_at);
end; $$;
revoke all on function public.bizon_journey_upsert(text, text, jsonb, text) from public, anon;
grant execute on function public.bizon_journey_upsert(text, text, jsonb, text) to authenticated;

-- Đọc: bản của chính mình; không có thì bản mới nhất của đội mình (phải là thành viên đội đó trong lớp). null nếu không có.
create or replace function public.bizon_journey_get(p_class_code text, p_team_name text)
returns jsonb
language plpgsql security definer stable set search_path = public, auth as $$
declare
  v_email text; v_code text := upper(trim(coalesce(p_class_code, ''))); v_team text := trim(coalesce(p_team_name, '')); r record;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập để đọc hộ chiếu.'; end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if not public.bizon_is_student_email(v_email) then raise exception 'Cần dùng đúng email trường để đọc hộ chiếu.'; end if;
  if v_code !~ '^[A-Z0-9_-]{3,40}$' or char_length(v_team) not between 1 and 60 then return null; end if;

  select j.passport, j.updated_at, j.journey_id into r from journey_passports j
   where j.student_id = auth.uid() and j.class_code = v_code and lower(j.team_name) = lower(v_team);
  if found then return jsonb_build_object('passport', r.passport, 'updated_at', r.updated_at, 'journey_id', r.journey_id, 'mine', true); end if;

  if exists (select 1 from student_team_membership m where m.student_id = auth.uid() and m.class_code = v_code and lower(m.team_name) = lower(v_team)) then
    select j.passport, j.updated_at, j.journey_id into r from journey_passports j
     where j.class_code = v_code and lower(j.team_name) = lower(v_team) order by j.updated_at desc limit 1;
    if found then return jsonb_build_object('passport', r.passport, 'updated_at', r.updated_at, 'journey_id', r.journey_id, 'mine', false); end if;
  end if;
  return null;
end; $$;
revoke all on function public.bizon_journey_get(text, text) from public, anon;
grant execute on function public.bizon_journey_get(text, text) to authenticated;

-- ---------- 3. Giảng viên: hộ chiếu của lớp ----------
create or replace function public.bizon_journey_class(p_class_code text)
returns table (team_name text, student_email text, journey_id text, passport jsonb, app_version text, updated_at timestamptz)
language sql security definer stable set search_path = public, auth as $$
  select j.team_name, u.email, j.journey_id, j.passport, j.app_version, j.updated_at
  from journey_passports j left join auth.users u on u.id = j.student_id
  where bizon_owns_class(p_class_code) and j.class_code = upper(trim(p_class_code))
  order by lower(j.team_name), j.updated_at desc;
$$;
revoke all on function public.bizon_journey_class(text) from public, anon;
grant execute on function public.bizon_journey_class(text) to authenticated;

-- ---------- 4. Dọn dữ liệu cũ (thêm journey_passports vào bizon_purge_expired của 20260924000000_retention_purge.sql) ----------
create or replace function public.bizon_purge_expired()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regclass('public.round_submissions') is not null then
    delete from round_submissions where created_at < now() - interval '12 months';
  end if;
  if to_regclass('public.bp_results') is not null then
    delete from bp_results where created_at < now() - interval '12 months';
  end if;
  if to_regclass('public.ft_results') is not null then
    delete from ft_results where created_at < now() - interval '12 months';
  end if;
  if to_regclass('public.survey_responses') is not null then
    delete from survey_responses where created_at < now() - interval '24 months';
  end if;
  if to_regclass('public.team_saves') is not null then
    delete from team_saves where updated_at < now() - interval '90 days';
  end if;
  if to_regclass('public.client_errors') is not null then
    delete from client_errors where created_at < now() - interval '90 days';
  end if;
  if to_regclass('public.bp_learning_traces') is not null then
    delete from bp_learning_traces where retention_until < now();
  end if;
  if to_regclass('public.journey_passports') is not null then
    delete from journey_passports where updated_at < now() - interval '12 months';
  end if;
end;
$$;
revoke all on function public.bizon_purge_expired() from public, anon, authenticated;

notify pgrst, 'reload schema';
