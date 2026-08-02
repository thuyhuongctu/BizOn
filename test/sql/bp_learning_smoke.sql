\set ON_ERROR_STOP on

-- Fail fast when the migration accidentally grants direct classroom-data access.
do $$
declare
  v_submit_exec boolean;
  v_delete_exec boolean;
  v_board_exec boolean;
begin
  if has_table_privilege('anon', 'public.bp_learning_traces', 'SELECT')
     or has_table_privilege('anon', 'public.bp_learning_traces', 'UPDATE')
     or has_table_privilege('anon', 'public.bp_learning_traces', 'DELETE')
     or has_table_privilege('anon', 'public.bp_learning_traces', 'INSERT') then
    raise exception 'anon must not have direct table privileges';
  end if;

  select bool_or(has_function_privilege('anon', p.oid, 'EXECUTE'))
    into v_submit_exec
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'bizon_submit_learning_trace';

  select bool_or(has_function_privilege('anon', p.oid, 'EXECUTE'))
    into v_delete_exec
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'bizon_delete_learning_trace';

  select bool_or(has_function_privilege('anon', p.oid, 'EXECUTE'))
    into v_board_exec
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'bizon_bp_learning_traces';

  if coalesce(v_submit_exec, false) is not true
     or coalesce(v_delete_exec, false) is not true
     or coalesce(v_board_exec, false) is not true then
    raise exception 'anon RPC execute grants are incomplete';
  end if;
end
$$;

-- A valid voluntary submission must work through the RPC as the anon role.
set role anon;
select *
from public.bizon_submit_learning_trace(
  '11111111-1111-4111-8111-111111111111'::uuid,
  'ib2026_a',
  'TEAM-04',
  'session-test-1',
  '424242',
  'bizon.learning.trace.v1',
  'bp-learning-v1.0.0',
  'bp-learning-consent-v1',
  now(),
  '{"records":[{"round":1,"engine_outcome_source":"deterministic","ai_changed_score":false}],"data_governance":{"ai_scoring":false}}'::jsonb,
  repeat('a', 64),
  now()
);
reset role;

do $$
declare
  v_count integer;
  v_hash text;
  v_retention interval;
begin
  select count(*), max(delete_token_hash), max(retention_until - created_at)
    into v_count, v_hash, v_retention
  from public.bp_learning_traces
  where id = '11111111-1111-4111-8111-111111111111'::uuid;

  if v_count <> 1 then
    raise exception 'valid trace was not stored exactly once';
  end if;
  if v_hash = repeat('a', 64) or v_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'deletion token was not stored as a SHA-256 hash';
  end if;
  if v_retention > interval '181 days' or v_retention < interval '179 days' then
    raise exception 'retention is outside the expected 180-day window: %', v_retention;
  end if;
end
$$;

-- Invalid consent and AI-scoring declarations must be rejected server-side.
do $$
declare
  v_rejected boolean := false;
begin
  begin
    perform * from public.bizon_submit_learning_trace(
      '22222222-2222-4222-8222-222222222222'::uuid,
      'IB2026_A', 'TEAM-05', 'session-test-2', '424242',
      'bizon.learning.trace.v1', 'bp-learning-v1.0.0',
      'wrong-consent-version', now(),
      '{"records":[{"round":1}],"data_governance":{"ai_scoring":false}}'::jsonb,
      repeat('b', 64), now()
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'invalid consent was accepted';
  end if;
end
$$;

do $$
declare
  v_rejected boolean := false;
begin
  begin
    perform * from public.bizon_submit_learning_trace(
      '33333333-3333-4333-8333-333333333333'::uuid,
      'IB2026_A', 'TEAM-06', 'session-test-3', '424242',
      'bizon.learning.trace.v1', 'bp-learning-v1.0.0',
      'bp-learning-consent-v1', now(),
      '{"records":[{"round":1}],"data_governance":{"ai_scoring":true}}'::jsonb,
      repeat('c', 64), now()
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'ai_scoring=true payload was accepted';
  end if;
end
$$;

-- Instructor reads are class-scoped and key-gated.
do $$
declare
  v_bad integer;
  v_good integer;
begin
  select count(*) into v_bad
  from public.bizon_bp_learning_traces('IB2026_A', 'WRONG-KEY');
  select count(*) into v_good
  from public.bizon_bp_learning_traces('IB2026_A', 'TEST-INSTRUCTOR-KEY');

  if v_bad <> 0 then
    raise exception 'wrong instructor key returned rows';
  end if;
  if v_good <> 1 then
    raise exception 'valid instructor key did not return the expected row';
  end if;
end
$$;

-- A wrong deletion receipt must fail without deleting the row.
set role anon;
select public.bizon_delete_learning_trace(
  '11111111-1111-4111-8111-111111111111'::uuid,
  repeat('z', 64)
) as wrong_token_deleted;
reset role;

do $$
begin
  if not exists (
    select 1 from public.bp_learning_traces
    where id = '11111111-1111-4111-8111-111111111111'::uuid
  ) then
    raise exception 'wrong deletion token removed the trace';
  end if;
end
$$;

-- The matching receipt must delete the exact trace.
set role anon;
select public.bizon_delete_learning_trace(
  '11111111-1111-4111-8111-111111111111'::uuid,
  repeat('a', 64)
) as correct_token_deleted;
reset role;

do $$
begin
  if exists (
    select 1 from public.bp_learning_traces
    where id = '11111111-1111-4111-8111-111111111111'::uuid
  ) then
    raise exception 'matching deletion token did not remove the trace';
  end if;
end
$$;

-- Retention purge is reserved for service_role and removes expired rows.
set role anon;
select *
from public.bizon_submit_learning_trace(
  '44444444-4444-4444-8444-444444444444'::uuid,
  'IB2026_A', 'TEAM-07', 'session-test-4', '424242',
  'bizon.learning.trace.v1', 'bp-learning-v1.0.0',
  'bp-learning-consent-v1', now(),
  '{"records":[{"round":1}],"data_governance":{"ai_scoring":false}}'::jsonb,
  repeat('d', 64), now()
);
reset role;

update public.bp_learning_traces
set retention_until = now() - interval '1 day'
where id = '44444444-4444-4444-8444-444444444444'::uuid;

set role service_role;
select public.bizon_purge_expired_learning_traces() as purged_rows;
reset role;

do $$
begin
  if exists (
    select 1 from public.bp_learning_traces
    where id = '44444444-4444-4444-8444-444444444444'::uuid
  ) then
    raise exception 'retention purge left an expired trace';
  end if;
end
$$;
