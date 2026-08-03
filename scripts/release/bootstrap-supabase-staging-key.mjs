import { spawnSync } from 'node:child_process';

const PRODUCTION_PROJECT_REF = 'ceytblfelodpnudomccn';

const required = name => {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment value: ${name}`);
  return value;
};

const parseBoolean = value => /^(1|true|yes)$/i.test(String(value || ''));
const sqlLiteral = value => `'${String(value).replace(/'/g, "''")}'`;

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

// Keep the staging bootstrap aligned with the canonical BizOn instructor schema.
// No extension is required here: migrations that need pgcrypto install it separately.
const sql = `
create table if not exists public.app_secrets (
  name text primary key,
  value text not null
);

alter table public.app_secrets enable row level security;

insert into public.app_secrets (name, value)
values ('instructor_key', ${sqlLiteral(instructorKey)})
on conflict (name) do update set value = excluded.value;

create or replace function public.bizon_check_key(p_key text)
returns boolean
language sql
security definer
stable
set search_path = public
as $bizon_key$
  select exists (
    select 1
    from public.app_secrets s
    where s.name = 'instructor_key'
      and s.value = p_key
  );
$bizon_key$;

revoke all on function public.bizon_check_key(text) from public;
grant execute on function public.bizon_check_key(text) to anon, authenticated;
`;

const psqlEnv = {
  ...process.env,
  PGHOST: database.hostname,
  PGPORT: database.port || '5432',
  PGUSER: decodeURIComponent(database.username),
  PGPASSWORD: decodeURIComponent(database.password),
  PGDATABASE: database.pathname.replace(/^\//, '') || 'postgres',
  PGSSLMODE: database.searchParams.get('sslmode') || 'require',
  PGCONNECT_TIMEOUT: '15'
};

const result = spawnSync('psql', ['-X', '--set', 'ON_ERROR_STOP=1'], {
  input: sql,
  encoding: 'utf8',
  env: psqlEnv,
  maxBuffer: 1024 * 1024
});

if (result.status !== 0) {
  const rawDiagnostic = `${result.stderr || ''}\n${result.stdout || ''}`;
  const diagnostic = rawDiagnostic.toLowerCase();

  if (diagnostic.includes('password authentication failed')) {
    throw new Error('Staging database authentication failed. Update the staging database password secret.');
  }
  if (diagnostic.includes('tenant or user not found') || diagnostic.includes('invalid tenant')) {
    throw new Error('Supavisor could not resolve the staging tenant. Use the exact Session Pooler host and username shown by Supabase Connect.');
  }
  if (
    diagnostic.includes('could not translate host name') ||
    diagnostic.includes('connection timed out') ||
    diagnostic.includes('timeout expired') ||
    diagnostic.includes('connection refused') ||
    diagnostic.includes('network is unreachable')
  ) {
    throw new Error('Unable to reach the protected staging Session Pooler. Check the staging region and pooler availability.');
  }
  if (diagnostic.includes('no pg_hba.conf entry') || diagnostic.includes('ssl')) {
    throw new Error('The protected staging database rejected the SSL connection. Confirm Session Pooler port 5432 with sslmode=require.');
  }
  if (diagnostic.includes('permission denied') || diagnostic.includes('must be owner')) {
    throw new Error('The staging database user lacks permission to create the BizOn instructor schema. Use the project postgres connection.');
  }

  const safeLine = rawDiagnostic
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(line => /^(psql:|error:|fatal:)/i.test(line));
  throw new Error(
    safeLine
      ? `Staging bootstrap SQL failed: ${safeLine.replace(databaseUrl, '[REDACTED_DATABASE_URL]').replace(instructorKey, '[REDACTED_INSTRUCTOR_KEY]')}`
      : 'Unable to bootstrap public.bizon_check_key(text) on the protected staging project.'
  );
}

process.stdout.write('Protected staging instructor-key verifier bootstrapped.\n');
