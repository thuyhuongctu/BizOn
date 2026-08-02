import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const PRODUCTION_PROJECT_REF = 'ceytblfelodpnudomccn';
const MIGRATION_PATH = 'supabase/migrations/20260802000000_bp_learning_traces.sql';
const REPORT_DIR = process.env.BIZON_STAGING_REPORT_DIR || 'artifacts/supabase-staging';
const REPORT_PATH = path.join(REPORT_DIR, 'staging-report.json');

const required = name => {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment value: ${name}`);
  return value;
};

const parseBoolean = value => /^(1|true|yes)$/i.test(String(value || ''));
const startedAt = new Date();
const tests = [];
let database;
let psqlEnvironment;
let stagingUrl;
let anonKey;
let instructorKey;
let projectRef;
let fixtureIds = [];
let fixtureClassCode = null;

function redact(value) {
  let text = String(value || '');
  const secrets = [
    process.env.SUPABASE_STAGING_DATABASE_URL,
    process.env.SUPABASE_STAGING_ANON_KEY,
    process.env.SUPABASE_STAGING_INSTRUCTOR_KEY,
    database?.password,
    anonKey,
    instructorKey
  ].filter(Boolean);
  for (const secret of secrets) text = text.split(String(secret)).join('[REDACTED]');
  return text.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]');
}

function record(name, details = {}) {
  tests.push({ name, status: 'pass', ...details });
  process.stdout.write(`PASS ${name}\n`);
}

function fail(name, message) {
  tests.push({ name, status: 'fail', message: redact(message) });
  throw new Error(`${name}: ${redact(message)}`);
}

function ensure(condition, name, message, details = {}) {
  if (!condition) fail(name, message);
  record(name, details);
}

function runPsql(sql, { tuplesOnly = true } = {}) {
  const args = ['-X', '--set', 'ON_ERROR_STOP=1'];
  if (tuplesOnly) args.push('-A', '-t', '-q');
  const result = spawnSync('psql', args, {
    input: sql,
    encoding: 'utf8',
    env: psqlEnvironment,
    maxBuffer: 4 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(redact(result.stderr || result.stdout || `psql exited with ${result.status}`));
  }
  return String(result.stdout || '').trim();
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function request(endpoint, { method = 'POST', body, key = anonKey } = {}) {
  const response = await fetch(`${stagingUrl.replace(/\/$/, '')}${endpoint}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { response, data };
}

async function rpc(name, body, { expectOk = true } = {}) {
  const result = await request(`/rest/v1/rpc/${name}`, { body });
  if (expectOk && !result.response.ok) {
    throw new Error(`RPC ${name} returned HTTP ${result.response.status}: ${redact(JSON.stringify(result.data))}`);
  }
  if (!expectOk && result.response.ok) {
    throw new Error(`RPC ${name} unexpectedly accepted an invalid request`);
  }
  return result;
}

function makePayload({ id, classCode, deleteToken, aiScoring = false, consentVersion = 'bp-learning-consent-v1' }) {
  const now = new Date().toISOString();
  return {
    p_id: id,
    p_class_code: classCode,
    p_team_alias: 'STAGING-QA',
    p_session_id: `staging-${id}`,
    p_game_seed: '20260803',
    p_schema_version: 'bizon.learning.trace.v1',
    p_learning_layer_version: 'bp-learning-v1.0.0',
    p_consent_version: consentVersion,
    p_consented_at: now,
    p_trace_json: {
      records: [{
        round: 1,
        decision: { label: 'Staging verification only' },
        engine_outcome_source: 'deterministic',
        ai_changed_score: false
      }],
      data_governance: {
        storage_mode: 'server-opt-in',
        participant_identifier: 'team_alias_only',
        ai_scoring: aiScoring
      }
    },
    p_delete_token: deleteToken,
    p_client_ts: now
  };
}

async function submitFixture(classCode) {
  const id = randomUUID();
  const deleteToken = randomBytes(32).toString('hex');
  fixtureIds.push(id);
  const result = await rpc('bizon_submit_learning_trace', makePayload({ id, classCode, deleteToken }));
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  ensure(row?.trace_id === id, 'submit returns matching trace receipt', 'Trace receipt ID did not match the submitted fixture.');
  const retentionDays = (new Date(row.retention_until).getTime() - Date.now()) / 86400000;
  ensure(retentionDays >= 179 && retentionDays <= 181.5, 'retention window is approximately 180 days', `Unexpected retention window: ${retentionDays}`);
  return { id, deleteToken, row };
}

async function cleanupFixtures() {
  if (!psqlEnvironment || !fixtureIds.length) return;
  const ids = fixtureIds.map(sqlLiteral).join(',');
  try {
    runPsql(`delete from public.bp_learning_traces where id::text in (${ids});`);
  } catch (error) {
    process.stderr.write(`Cleanup warning: ${redact(error.message)}\n`);
  }
}

function writeReport(status, error = null) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const report = {
    schema: 'bizon.supabase-staging-report.v1',
    status,
    project_ref: projectRef || null,
    commit_sha: process.env.GITHUB_SHA || null,
    started_at: startedAt.toISOString(),
    completed_at: new Date().toISOString(),
    migration_applied: parseBoolean(process.env.APPLY_MIGRATION),
    retention_purge_tested: parseBoolean(process.env.RUN_RETENTION_PURGE),
    fixture_class_code: fixtureClassCode,
    tests,
    error: error ? redact(error.message || error) : null,
    secrets_in_report: false
  };
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

async function main() {
  projectRef = required('SUPABASE_STAGING_PROJECT_REF');
  const confirmedRef = required('CONFIRM_PROJECT_REF');
  stagingUrl = required('SUPABASE_STAGING_URL');
  anonKey = required('SUPABASE_STAGING_ANON_KEY');
  instructorKey = required('SUPABASE_STAGING_INSTRUCTOR_KEY');
  const databaseUrl = required('SUPABASE_STAGING_DATABASE_URL');

  ensure(confirmedRef === projectRef, 'operator confirmed staging project ref', 'CONFIRM_PROJECT_REF does not match the configured staging project ref.');
  ensure(projectRef !== PRODUCTION_PROJECT_REF, 'production project ref is blocked', 'The configured staging project ref is the BizOn production project ref.');
  ensure(!stagingUrl.includes(PRODUCTION_PROJECT_REF), 'production REST URL is blocked', 'The configured staging URL points to production.');

  const apiUrl = new URL(stagingUrl);
  ensure(apiUrl.protocol === 'https:' && apiUrl.hostname === `${projectRef}.supabase.co`, 'staging REST hostname matches project ref', `Unexpected staging REST hostname: ${apiUrl.hostname}`);

  database = new URL(databaseUrl);
  const databaseIdentity = `${database.hostname}|${decodeURIComponent(database.username)}`;
  ensure(!databaseIdentity.includes(PRODUCTION_PROJECT_REF), 'production database endpoint is blocked', 'The configured database connection points to production.');
  ensure(databaseIdentity.includes(projectRef), 'staging database endpoint matches project ref', 'The database host or username does not contain the confirmed staging project ref.');

  psqlEnvironment = {
    ...process.env,
    PGHOST: database.hostname,
    PGPORT: database.port || '5432',
    PGUSER: decodeURIComponent(database.username),
    PGPASSWORD: decodeURIComponent(database.password),
    PGDATABASE: database.pathname.replace(/^\//, '') || 'postgres',
    PGSSLMODE: database.searchParams.get('sslmode') || 'require',
    PGCONNECT_TIMEOUT: '15'
  };

  const dependency = runPsql("select coalesce(to_regprocedure('public.bizon_check_key(text)')::text, '');");
  ensure(Boolean(dependency), 'instructor-key dependency exists', 'public.bizon_check_key(text) is missing on staging.');

  if (parseBoolean(process.env.APPLY_MIGRATION)) {
    const migration = fs.readFileSync(MIGRATION_PATH, 'utf8');
    runPsql(migration, { tuplesOnly: false });
    record('canonical learning-trace migration applied');
  }

  ensure(runPsql("select to_regclass('public.bp_learning_traces') is not null;") === 't', 'canonical trace table exists', 'public.bp_learning_traces is missing.');
  ensure(runPsql("select relrowsecurity from pg_class where oid='public.bp_learning_traces'::regclass;") === 't', 'row level security is enabled', 'RLS is not enabled on public.bp_learning_traces.');
  ensure(runPsql("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('bizon_submit_learning_trace','bizon_delete_learning_trace','bizon_bp_learning_traces','bizon_purge_expired_learning_traces');") === '4', 'all four governed RPCs exist', 'One or more governed RPCs are missing.');
  ensure(runPsql("select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('bp_learning_sessions','bp_learning_records','bp_learning_deletion_requests');") === '0', 'no competing learning schema exists', 'Competing Brand Passport learning tables were found.');
  ensure(runPsql("select concat_ws('|',has_table_privilege('anon','public.bp_learning_traces','SELECT'),has_table_privilege('anon','public.bp_learning_traces','INSERT'),has_table_privilege('anon','public.bp_learning_traces','UPDATE'),has_table_privilege('anon','public.bp_learning_traces','DELETE'));") === 'false|false|false|false', 'anon has no direct table privileges', 'Anonymous role has a direct table privilege.');

  const directRead = await request('/rest/v1/bp_learning_traces?select=id&limit=1', { method: 'GET' });
  ensure(!directRead.response.ok, 'anonymous direct REST table read is denied', `Direct table read returned HTTP ${directRead.response.status}.`);

  fixtureClassCode = `BP_STG_${Date.now().toString(36).toUpperCase()}`.slice(0, 40);
  const fixture = await submitFixture(fixtureClassCode);

  const hashCheck = runPsql(`select concat_ws('|', char_length(delete_token_hash), delete_token_hash ~ '^[0-9a-f]{64}$', delete_token_hash <> ${sqlLiteral(fixture.deleteToken)}) from public.bp_learning_traces where id=${sqlLiteral(fixture.id)}::uuid;`);
  ensure(hashCheck === '64|true|true', 'deletion token is stored only as SHA-256', `Unexpected token hash verification result: ${hashCheck}`);

  const wrongKey = await rpc('bizon_bp_learning_traces', { p_class_code: fixtureClassCode, p_key: 'WRONG-STAGING-KEY' });
  ensure(Array.isArray(wrongKey.data) && wrongKey.data.length === 0, 'wrong instructor key returns no rows', 'Wrong instructor key returned learning traces.');

  const wrongClass = await rpc('bizon_bp_learning_traces', { p_class_code: `${fixtureClassCode}_OTHER`.slice(0, 40), p_key: instructorKey });
  ensure(Array.isArray(wrongClass.data) && wrongClass.data.length === 0, 'wrong class code returns no rows', 'A different class code returned the fixture.');

  const correctRead = await rpc('bizon_bp_learning_traces', { p_class_code: fixtureClassCode, p_key: instructorKey });
  ensure(Array.isArray(correctRead.data) && correctRead.data.some(row => (row.trace_id || row.id) === fixture.id), 'correct class and key return only scoped fixture', 'Instructor RPC did not return the expected fixture.');

  const aiScoringFixtureId = randomUUID();
  fixtureIds.push(aiScoringFixtureId);
  await rpc('bizon_submit_learning_trace', makePayload({
    id: aiScoringFixtureId,
    classCode: fixtureClassCode,
    deleteToken: randomBytes(32).toString('hex'),
    aiScoring: true
  }), { expectOk: false });
  record('ai_scoring=true payload is rejected');

  const invalidConsentFixtureId = randomUUID();
  fixtureIds.push(invalidConsentFixtureId);
  await rpc('bizon_submit_learning_trace', makePayload({
    id: invalidConsentFixtureId,
    classCode: fixtureClassCode,
    deleteToken: randomBytes(32).toString('hex'),
    consentVersion: 'invalid-consent'
  }), { expectOk: false });
  record('invalid consent version is rejected');

  const wrongDelete = await rpc('bizon_delete_learning_trace', { p_trace_id: fixture.id, p_delete_token: randomBytes(32).toString('hex') });
  ensure(wrongDelete.data === false, 'wrong deletion token cannot delete fixture', 'Wrong deletion token returned true.');

  const correctDelete = await rpc('bizon_delete_learning_trace', { p_trace_id: fixture.id, p_delete_token: fixture.deleteToken });
  ensure(correctDelete.data === true, 'correct deletion token deletes fixture', 'Correct deletion token did not delete the fixture.');

  const afterDelete = await rpc('bizon_bp_learning_traces', { p_class_code: fixtureClassCode, p_key: instructorKey });
  ensure(Array.isArray(afterDelete.data) && !afterDelete.data.some(row => (row.trace_id || row.id) === fixture.id), 'deleted fixture is no longer returned', 'Deleted fixture remained visible through the instructor RPC.');
  fixtureIds = fixtureIds.filter(id => id !== fixture.id);

  if (parseBoolean(process.env.RUN_RETENTION_PURGE)) {
    const purgeFixture = await submitFixture(fixtureClassCode);
    const anonPurge = await rpc('bizon_purge_expired_learning_traces', {}, { expectOk: false });
    ensure([401, 403, 404].includes(anonPurge.response.status), 'anonymous client cannot invoke retention purge', `Unexpected anonymous purge status: ${anonPurge.response.status}`);
    runPsql(`update public.bp_learning_traces set retention_until=now()-interval '1 day' where id=${sqlLiteral(purgeFixture.id)}::uuid;`);
    const purged = Number(runPsql('select public.bizon_purge_expired_learning_traces();'));
    ensure(Number.isFinite(purged) && purged >= 1, 'administrator purge removes expired fixture', `Purge returned ${purged}.`);
    ensure(runPsql(`select count(*) from public.bp_learning_traces where id=${sqlLiteral(purgeFixture.id)}::uuid;`) === '0', 'expired fixture is physically removed', 'Expired fixture remained after purge.');
    fixtureIds = fixtureIds.filter(id => id !== purgeFixture.id);
  }

  record('staging smoke suite completed without real learner data');
}

try {
  await main();
  writeReport('pass');
} catch (error) {
  await cleanupFixtures();
  writeReport('fail', error);
  process.stderr.write(`${redact(error.stack || error.message || error)}\n`);
  process.exitCode = 1;
} finally {
  await cleanupFixtures();
}
