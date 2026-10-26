-- ============================================================
-- BizOn — Bài tình huống trước – sau (R2): bài quyết định tình huống ngoài game, làm TRƯỚC và SAU can thiệp
-- Thiết kế: docs/architecture/BAI-TINH-HUONG.md. Mỗi sinh viên nộp tối đa một bài cho mỗi giai đoạn (pre/post) của một lớp;
-- hai bản song song A/B đổi chỗ theo sinh viên; câu trả lời (lựa chọn + lý do + giải thích cơ chế) lưu nguyên dạng để chấm
-- theo rubric (R3). Giảng viên chủ lớp đọc cả lớp (kèm journey_id của hộ chiếu để ghép với dấu vết quyết định).
--
-- CHỈ THÊM, an toàn khi chạy lại:
--   1. Bảng case_tasks (RLS bật, không cấp quyền trực tiếp; chỉ qua RPC security definer).
--   2. bizon_case_task_submit(...): sinh viên (đăng nhập + email trường) nộp; nộp lại cùng giai đoạn chỉ trong 24 giờ.
--   3. bizon_case_task_mine(p_class_code): các bài mình đã nộp trong lớp (để trang biết đang ở giai đoạn nào).
--   4. bizon_case_task_class(p_class_code): chủ lớp xem cả lớp.
--   5. bizon_purge_expired: thêm case_tasks (12 tháng). Nếu về sau chạy lại 20261026000000_journey_passports.sql thì phải
--      chạy lại tệp này (tệp đó định nghĩa lại bizon_purge_expired không có case_tasks).
-- Chạy SAU 20261026000000_journey_passports.sql. Kiểm thử: test/sql/case_tasks_smoke.sql.
-- ============================================================

-- ---------- 1. Bảng ----------
create table if not exists public.case_tasks (
  id bigserial primary key,
  student_id uuid not null references auth.users (id) on delete cascade,
  class_code text not null,
  team_name text not null default '',
  phase text not null check (phase in ('pre', 'post')),
  form text not null check (form in ('A', 'B')),
  answers jsonb not null,
  duration_s integer,
  explain text check (explain in ('hidden', 'shown')),
  app_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, class_code, phase)
);
comment on table public.case_tasks is 'Bài tình huống trước–sau (R2): một dòng cho mỗi sinh viên × lớp × giai đoạn; answers giữ nguyên lựa chọn, lý do và câu giải thích cơ chế để chấm rubric.';
create index if not exists idx_case_tasks_class on public.case_tasks (class_code, phase);
alter table public.case_tasks enable row level security;
revoke all on table public.case_tasks from public, anon, authenticated;
revoke all on sequence public.case_tasks_id_seq from public, anon, authenticated;

-- ---------- 2. Kiểm tra hình dạng answers ----------
create or replace function public.bizon_case_task_ok(p jsonb)
returns boolean language sql immutable as $$
  select p is not null and jsonb_typeof(p) = 'object'
    and jsonb_typeof(p->'items') = 'array' and jsonb_array_length(p->'items') between 1 and 12
    and char_length(p::text) <= 20000;
$$;

create or replace function public.bizon_case_task_submit(p_class_code text, p_team_name text, p_phase text, p_form text, p_answers jsonb,
                                                        p_duration_s integer default null, p_explain text default null, p_app_version text default null)
returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare
  v_email text; v_code text := upper(trim(coalesce(p_class_code, ''))); v_team text := left(trim(coalesce(p_team_name, '')), 60);
  v_phase text := lower(trim(coalesce(p_phase, ''))); v_form text := upper(trim(coalesce(p_form, ''))); v_old timestamptz; v_id bigint; v_at timestamptz;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập để nộp bài tình huống.'; end if;
  v_email := lower(coalesce(auth.jwt()->>'email', ''));
  if not public.bizon_is_student_email(v_email) then raise exception 'Cần dùng đúng email trường (vd @student.ctu.edu.vn) để nộp bài.'; end if;
  if v_code !~ '^[A-Z0-9_-]{3,40}$' then raise exception 'Mã lớp không hợp lệ.'; end if;
  if v_phase not in ('pre', 'post') then raise exception 'Giai đoạn phải là pre hoặc post.'; end if;
  if v_form not in ('A', 'B') then raise exception 'Bản bài phải là A hoặc B.'; end if;
  if not public.bizon_case_task_ok(p_answers) then raise exception 'Bài làm không hợp lệ.'; end if;
  if p_explain is not null and p_explain not in ('hidden', 'shown') then raise exception 'Điều kiện giải thích không hợp lệ.'; end if;

  select created_at into v_old from public.case_tasks where student_id = auth.uid() and class_code = v_code and phase = v_phase;
  if v_old is not null and v_old < now() - interval '24 hours' then
    raise exception 'Bài % của lớp % đã nộp từ trước; không nộp lại được sau 24 giờ.', v_phase, v_code;
  end if;

  insert into public.case_tasks (student_id, class_code, team_name, phase, form, answers, duration_s, explain, app_version, created_at, updated_at)
  values (auth.uid(), v_code, v_team, v_phase, v_form, p_answers, p_duration_s, p_explain, left(p_app_version, 40), now(), now())
  on conflict (student_id, class_code, phase) do update
    set team_name = excluded.team_name, form = excluded.form, answers = excluded.answers, duration_s = excluded.duration_s,
        explain = excluded.explain, app_version = excluded.app_version, updated_at = now()
  returning id, updated_at into v_id, v_at;
  return jsonb_build_object('id', v_id, 'phase', v_phase, 'form', v_form, 'updated_at', v_at);
end; $$;
revoke all on function public.bizon_case_task_submit(text, text, text, text, jsonb, integer, text, text) from public, anon;
grant execute on function public.bizon_case_task_submit(text, text, text, text, jsonb, integer, text, text) to authenticated;

-- ---------- 3. Bài của chính mình ----------
create or replace function public.bizon_case_task_mine(p_class_code text)
returns table (phase text, form text, created_at timestamptz, updated_at timestamptz)
language sql security definer stable set search_path = public, auth as $$
  select c.phase, c.form, c.created_at, c.updated_at
  from case_tasks c
  where auth.uid() is not null and c.student_id = auth.uid() and c.class_code = upper(trim(coalesce(p_class_code, '')))
  order by c.phase desc;   -- 'pre' trước 'post' theo thứ tự chữ ngược
$$;
revoke all on function public.bizon_case_task_mine(text) from public, anon;
grant execute on function public.bizon_case_task_mine(text) to authenticated;

-- ---------- 4. Chủ lớp xem cả lớp ----------
create or replace function public.bizon_case_task_class(p_class_code text)
returns table (student_email text, team_name text, phase text, form text, answers jsonb, duration_s integer, explain text, app_version text,
               journey_id text, created_at timestamptz, updated_at timestamptz)
language sql security definer stable set search_path = public, auth as $$
  select u.email, c.team_name, c.phase, c.form, c.answers, c.duration_s, c.explain, c.app_version,
         (select j.journey_id from journey_passports j where j.student_id = c.student_id and j.class_code = c.class_code order by j.updated_at desc limit 1),
         c.created_at, c.updated_at
  from case_tasks c left join auth.users u on u.id = c.student_id
  where bizon_owns_class(p_class_code) and c.class_code = upper(trim(p_class_code))
  order by lower(c.team_name), u.email, c.phase desc;
$$;
revoke all on function public.bizon_case_task_class(text) from public, anon;
grant execute on function public.bizon_case_task_class(text) to authenticated;

-- ---------- 5. Dọn dữ liệu cũ ----------
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
  if to_regclass('public.case_tasks') is not null then
    delete from case_tasks where updated_at < now() - interval '12 months';
  end if;
end;
$$;
revoke all on function public.bizon_purge_expired() from public, anon, authenticated;

notify pgrst, 'reload schema';
