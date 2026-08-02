import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const PRODUCTION_PROJECT_REF = 'ceytblfelodpnudomccn';

const required = name => {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment value: ${name}`);
  return value;
};

const parseBoolean = value => /^(1|true|yes)$/i.test(String(value || ''));

if (!parseBoolean(process.env.APPLY_MIGRATION)) {
  process.stdout.write('Instructor-key bootstrap skipped because APPLY_MIGRATION is false.\n');
  process.exit(0);
}

const projectRef = required('SUPABASE_STAGING_PROJECT_REF');
const confirmedRef = required('CONFIRM_PROJECT_REF');
const databaseUrl = required('SUPABASE_STAGING_DATABASE_URL');
const instructorKey = required('SUPABASE_STAGING_INSTRUCTOR_KEY');

if (confirmedRef !== projectRef) {
  throw new Error('CONFIRM_PROJECT_REF does not match the configured staging project ref.');
}
if (projectRef === PRODUCTION_PROJECT_REF) {
  throw new Error('The production Supabase project is blocked.');
}
if (instructorKey.length < 32) {
  throw new Error('The staging instructor key must contain at least 32 characters.');
}

const database = new URL(databaseUrl);
const databaseIdentity = `${database.hostname}|${decodeURIComponent(database.username)}`;
if (databaseIdentity.includes(PRODUCTION_PROJECT_REF)) {
  throw new Error('The configured database connection points to production.');
}
if (!databaseIdentity.includes(projectRef)) {
  throw new Error('The database host or username does not match the staging project ref.');
}

const instructorKeyHash = createHash('sha256').update(instructorKey, 'utf8').digest('hex');
const sql = `
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.bizon_check_key(p_key text)
returns boolean
language sql
security definer
stable
set search_path = public, extensions
as $bizon_key$
  select p_key is not null
     and encode(digest(p_key, 'sha256'), 'hex') = '${instructorKeyHash}';
$bizon_key$;

revoke all on function public.bizon_check_key(text) from public;
grant execute on function public.bizon_check_key(text) to anon, authenticated;
`;

const result = spawnSync('psql', ['-X', '--set', 'ON_ERROR_STOP=1'], {
  input: sql,
  encoding: 'utf8',
  env: {
    ...process.env,
    PGHOST: database.hostname,
    PGPORT: database.port || '5432',
    PGUSER: decodeURIComponent(database.username),
    PGPASSWORD: decodeURIComponent(database.password),
    PGDATABASE: database.pathname.replace(/^\//, '') || 'postgres',
    PGSSLMODE: database.searchParams.get('sslmode') || 'require',
    PGCONNECT_TIMEOUT: '15'
  },
  maxBuffer: 1024 * 1024
});

if (result.status !== 0) {
  throw new Error('Unable to bootstrap public.bizon_check_key(text) on the protected staging project.');
}

process.stdout.write('Protected staging instructor-key verifier bootstrapped.\n');
