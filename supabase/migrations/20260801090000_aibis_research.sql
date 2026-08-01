-- AIBIS private/staging research telemetry.
-- Anon may INSERT only when consent=true. No anon SELECT/UPDATE/DELETE policy.

create table if not exists aibis_research_sessions (
  id uuid primary key default gen_random_uuid(),
  schema_version int not null default 1 check (schema_version between 1 and 20),
  engine_version text not null,
  telemetry_version text,
  session_seed text not null,
  classroom_id text,
  team_id text,
  consent boolean not null check (consent = true),
  current_round int not null default 0 check (current_round between 0 and 20),
  market jsonb,
  entry_mode text,
  decisions jsonb not null default '[]'::jsonb,
  outcomes jsonb not null default '{}'::jsonb,
  shocks jsonb not null default '[]'::jsonb,
  client_ts timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_aibis_class_created
  on aibis_research_sessions (classroom_id, created_at desc);
create index if not exists idx_aibis_seed
  on aibis_research_sessions (session_seed);

alter table aibis_research_sessions enable row level security;

create policy "aibis consented insert only"
  on aibis_research_sessions for insert to anon
  with check (
    consent = true
    and char_length(session_seed) between 1 and 120
    and jsonb_typeof(decisions) = 'array'
    and jsonb_array_length(decisions) <= 100
    and jsonb_typeof(shocks) = 'array'
    and jsonb_array_length(shocks) <= 50
  );

comment on table aibis_research_sessions is
  'AIBIS consented research telemetry. Free-text rationales are excluded client-side.';
