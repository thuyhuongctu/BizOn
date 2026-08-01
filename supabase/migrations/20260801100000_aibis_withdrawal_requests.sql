-- AIBIS private pilot: participant withdrawal requests.
-- Anonymous users may submit a request but cannot read/update/delete records.

create table if not exists aibis_withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  session_seed text not null check (char_length(session_seed) between 1 and 120),
  classroom_id text check (classroom_id is null or char_length(classroom_id) <= 64),
  team_id text check (team_id is null or char_length(team_id) <= 64),
  request_reason text check (request_reason is null or char_length(request_reason) <= 500),
  status text not null default 'pending' check (status in ('pending','verified','completed','rejected')),
  client_ts timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_aibis_withdrawal_lookup
  on aibis_withdrawal_requests (session_seed, classroom_id, team_id, created_at desc);

alter table aibis_withdrawal_requests enable row level security;

create policy "participant may submit AIBIS withdrawal request"
  on aibis_withdrawal_requests for insert to anon
  with check (status = 'pending');

-- No anonymous SELECT/UPDATE/DELETE policy. Verification and deletion must be
-- completed by an authorized research administrator using a protected process.
