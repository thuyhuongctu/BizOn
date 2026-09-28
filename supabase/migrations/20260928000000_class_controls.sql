-- BizOn — Điều khiển lớp cho giảng viên (khóa vòng, cấp/trừ vốn, tung biến cố)
-- Cần có sẵn: public.bizon_owns_class(text), public.round_submissions (từ các migration trước).

create table if not exists public.class_controls (
  class_code text primary key check (class_code ~ '^[A-Z0-9_-]{3,40}$'),
  locked_round int check (locked_round between 0 and 6),
  forced_event text,
  forced_event_round int,
  message text,
  updated_at timestamptz not null default now()
);
alter table public.class_controls enable row level security;
revoke all on public.class_controls from anon, authenticated;

create table if not exists public.class_grants (
  id uuid primary key default gen_random_uuid(),
  class_code text not null,
  team_name text not null,
  amount numeric not null,
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_cg_class on public.class_grants (class_code, created_at);
alter table public.class_grants enable row level security;
revoke all on public.class_grants from anon, authenticated;

create table if not exists public.class_scores (
  class_code text not null,
  team_name text not null,
  reasoning numeric check (reasoning between 0 and 10),
  teamwork numeric check (teamwork between 0 and 10),
  note text,
  updated_at timestamptz not null default now(),
  primary key (class_code, team_name)
);
alter table public.class_scores enable row level security;
revoke all on public.class_scores from anon, authenticated;

create or replace function public.bizon_set_controls(p_class_code text, p_locked_round int, p_forced_event text, p_forced_event_round int, p_message text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Không có quyền với lớp này.'; end if;
  insert into class_controls (class_code, locked_round, forced_event, forced_event_round, message, updated_at)
  values (v, p_locked_round, nullif(p_forced_event, ''), p_forced_event_round, nullif(p_message, ''), now())
  on conflict (class_code) do update set locked_round = excluded.locked_round, forced_event = excluded.forced_event,
    forced_event_round = excluded.forced_event_round, message = excluded.message, updated_at = now();
  return true;
end; $$;

create or replace function public.bizon_grant(p_class_code text, p_team_name text, p_amount numeric, p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code)); r uuid;
begin
  if not bizon_owns_class(v) then raise exception 'Không có quyền với lớp này.'; end if;
  if abs(p_amount) > 1000 then raise exception 'Mỗi lần tối đa ±1000 triệu.'; end if;
  insert into class_grants (class_code, team_name, amount, reason, created_by) values (v, p_team_name, p_amount, p_reason, auth.uid()) returning id into r;
  return r;
end; $$;

create or replace function public.bizon_save_score(p_class_code text, p_team_name text, p_reasoning numeric, p_teamwork numeric, p_note text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v text := upper(trim(p_class_code));
begin
  if not bizon_owns_class(v) then raise exception 'Không có quyền với lớp này.'; end if;
  insert into class_scores values (v, p_team_name, p_reasoning, p_teamwork, p_note, now())
  on conflict (class_code, team_name) do update set reasoning = excluded.reasoning, teamwork = excluded.teamwork, note = excluded.note, updated_at = now();
  return true;
end; $$;

create or replace function public.bizon_submissions_v2(p_class_code text)
returns table (team_name text, round_number int, result_json jsonb, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select distinct on (rs.team_name, rs.round_number) rs.team_name, rs.round_number, rs.result_json, rs.created_at
  from round_submissions rs
  where bizon_owns_class(p_class_code) and rs.class_code = upper(trim(p_class_code))
  order by rs.team_name, rs.round_number, rs.created_at desc;
$$;

create or replace function public.bizon_class_state_v2(p_class_code text)
returns jsonb language sql security definer stable set search_path = public as $$
  select case when not bizon_owns_class(p_class_code) then null else jsonb_build_object(
    'controls', (select to_jsonb(c) from class_controls c where c.class_code = upper(trim(p_class_code))),
    'grants', coalesce((select jsonb_agg(to_jsonb(g) order by g.created_at desc) from class_grants g where g.class_code = upper(trim(p_class_code))), '[]'::jsonb),
    'scores', coalesce((select jsonb_agg(to_jsonb(s)) from class_scores s where s.class_code = upper(trim(p_class_code))), '[]'::jsonb)
  ) end;
$$;

create or replace function public.bizon_class_feed(p_class_code text, p_team_name text)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object(
    'controls', (select jsonb_build_object('locked_round', c.locked_round, 'forced_event', c.forced_event, 'forced_event_round', c.forced_event_round, 'message', c.message, 'updated_at', c.updated_at)
                 from class_controls c where c.class_code = upper(trim(p_class_code))),
    'grants', coalesce((select jsonb_agg(jsonb_build_object('id', g.id, 'amount', g.amount, 'reason', g.reason, 'created_at', g.created_at) order by g.created_at)
                 from class_grants g where g.class_code = upper(trim(p_class_code)) and (g.team_name = p_team_name or g.team_name = '*')), '[]'::jsonb)
  );
$$;

revoke all on function public.bizon_set_controls(text,int,text,int,text) from public, anon;
revoke all on function public.bizon_grant(text,text,numeric,text) from public, anon;
revoke all on function public.bizon_save_score(text,text,numeric,numeric,text) from public, anon;
revoke all on function public.bizon_submissions_v2(text) from public, anon;
revoke all on function public.bizon_class_state_v2(text) from public, anon;
grant execute on function public.bizon_set_controls(text,int,text,int,text) to authenticated;
grant execute on function public.bizon_grant(text,text,numeric,text) to authenticated;
grant execute on function public.bizon_save_score(text,text,numeric,numeric,text) to authenticated;
grant execute on function public.bizon_submissions_v2(text) to authenticated;
grant execute on function public.bizon_class_state_v2(text) to authenticated;
revoke all on function public.bizon_class_feed(text,text) from public;
grant execute on function public.bizon_class_feed(text,text) to anon, authenticated;

notify pgrst, 'reload schema';
