-- BizOn Brand Passport Learning Edition — governed audit schema v1
-- Human-governed, provenance-first. This migration does not modify game scores.

create table if not exists bp_learning_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  class_code text not null,
  team_id text,
  game_seed text,
  consent_version text not null,
  consent_scope text not null check (consent_scope in ('classroom_learning','research_optional')),
  consented_at timestamptz not null,
  withdrawal_token_hash text not null,
  retention_until date not null,
  learning_layer_version text not null,
  engine_source text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists bp_learning_records (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references bp_learning_sessions(session_id) on delete cascade,
  round int not null check (round between 1 and 6),
  decision_json jsonb not null,
  outcome_before_json jsonb not null,
  outcome_after_json jsonb not null,
  outcome_delta_json jsonb not null,
  coach_text text,
  critic_text text,
  student_reflection text,
  learning_outcomes text[] not null default '{}',
  engine_outcome_source text not null check (engine_outcome_source = 'deterministic'),
  ai_changed_score boolean not null default false check (ai_changed_score = false),
  audit_timestamp timestamptz not null,
  schema_version text not null,
  created_at timestamptz not null default now(),
  unique(session_id, round)
);

create table if not exists bp_learning_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  request_token_hash text not null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'pending' check (status in ('pending','completed','rejected'))
);

create index if not exists idx_bp_learning_sessions_class on bp_learning_sessions(class_code, created_at desc);
create index if not exists idx_bp_learning_records_session on bp_learning_records(session_id, round);
create index if not exists idx_bp_learning_retention on bp_learning_sessions(retention_until) where deleted_at is null;

alter table bp_learning_sessions enable row level security;
alter table bp_learning_records enable row level security;
alter table bp_learning_deletion_requests enable row level security;

-- Anonymous clients may submit only; they cannot read classroom data.
create policy "anon insert governed learning session"
  on bp_learning_sessions for insert to anon
  with check (
    consent_version <> '' and
    consent_scope in ('classroom_learning','research_optional') and
    retention_until <= (current_date + interval '365 days')
  );

create policy "anon insert deterministic learning record"
  on bp_learning_records for insert to anon
  with check (
    engine_outcome_source = 'deterministic' and
    ai_changed_score = false and
    char_length(coalesce(student_reflection,'')) <= 2000
  );

create policy "anon request deletion"
  on bp_learning_deletion_requests for insert to anon
  with check (session_id <> '' and request_token_hash <> '');

-- No anonymous SELECT, UPDATE or DELETE policies.
-- Instructor access must use a security-definer RPC that validates the existing
-- BizOn instructor key and returns only records for the requested class.

create or replace function bizon_bp_learning_board(p_class_code text, p_key text)
returns table (
  session_id text,
  team_id text,
  game_seed text,
  records_count bigint,
  last_activity timestamptz,
  consent_scope text,
  retention_until date
)
language sql security definer stable
set search_path = public
as $$
  select s.session_id, s.team_id, s.game_seed,
         count(r.id) as records_count,
         max(r.audit_timestamp) as last_activity,
         s.consent_scope, s.retention_until
  from bp_learning_sessions s
  left join bp_learning_records r on r.session_id = s.session_id
  where bizon_check_key(p_key)
    and s.class_code = p_class_code
    and s.deleted_at is null
  group by s.session_id, s.team_id, s.game_seed, s.consent_scope, s.retention_until
  order by max(r.audit_timestamp) desc nulls last;
$$;

-- Scheduled retention job (Supabase cron or external scheduler) should execute:
-- delete from bp_learning_sessions
-- where retention_until < current_date or deleted_at is not null;
