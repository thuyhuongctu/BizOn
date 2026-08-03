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

let database;
try {
  database = new URL(databaseUrl);
} catch {
  throw new Error('SUPABASE_STAGING_DATABASE_URL is not a valid PostgreSQL connection URI. Copy the Session Pooler URI from Supabase Connect and replace the password placeholder.');
}

if (!/^postgres(?:ql)?:$/.test(database.protocol)) {
  throw new Error('SUPABASE_STAGING_DATABASE_URL must use the postgres:// or postgresql:// scheme.');
}

const databaseUser = decodeURIComponent(database.username);
const databasePassword = decodeURIComponent(database.password);
const databaseName = database.pathname.replace(/^\//, '') || 'postgres';
const databasePort = database.port || '5432';
const databaseIdentity = `${database.hostname}|${databaseUser}`;

if (!databasePassword || /YOUR[-_ ]?PASSWORD|\[PASSWORD\]/i.test(databasePassword)) {
  throw new Error('The staging database URI still contains an empty or placeholder password. Replace it with the staging database password.');
}
if (databaseIdentity.includes(PRODUCTION_PROJECT_REF)) {
  throw new Error('The configured database connection points to production.');
}
if (!databaseIdentity.includes(projectRef)) {
  throw new Error('The database host or username does not match the staging project ref.');
}

const isSupavisor = /\.pooler\.supabase\.com$/i.test(database.hostname);
if (isSupavisor) {
  if (databasePort !== '5432') {
    throw new Error('Use the Supabase Session Pooler connection on port 5432 for protected staging migrations.');
  }
  if (databaseUser !== `postgres.${projectRef}`) {
    throw new Error('The Session Pooler username must be postgres.<staging-project-ref>. Copy the exact URI from Supabase Connect.');
  }
}

// Keep the staging bootstrap aligned with the canonical BizOn instructor schema.
// No extension is required here: migrations that need pgcrypto install it separately.
const sql = `
begin;

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

commit;
`;

const psqlEnv = {
  ...process.env,
  PGHOST: database.hostname,
  PGPORT: databasePort,
  PGUSER: databaseUser,
  PGPASSWORD: databasePassword,
  PGDATABASE: databaseName,
  PGSSLMODE: database.searchParams.get('sslmode') || 'require',
  PGCONNECT_TIMEOUT: '15',
  PGAPPNAME: 'bizon-supabase-staging-gate'
};

const sanitize = value => {
  let output = String(value || '');
  const replacements = [
    [databaseUrl, '[REDACTED_DATABASE_URL]'],
    [instructorKey, '[REDACTED_INSTRUCTOR_KEY]'],
    [databasePassword, '[REDACTED_DATABASE_PASSWORD]'],
    [database.hostname, '[STAGING_DATABASE_HOST]'],
    [databaseUser, '[STAGING_DATABASE_USER]'],
    [projectRef, '[STAGING_PROJECT_REF]']
  ];
  for (const [secret, replacement] of replacements) {
    if (secret) output = output.split(secret).join(replacement);
  }
  return output;
};

const classifyPsqlFailure = (result, phase) => {
  if (result.error) {
    const code = sanitize(result.error.code || result.error.name || 'UNKNOWN');
    if (result.error.code === 'ENOENT') {
      return new Error('PostgreSQL client `psql` is unavailable on the GitHub runner.');
    }
    return new Error(`Unable to start psql during ${phase} (code: ${code}).`);
  }

  const rawDiagnostic = `${result.stderr || ''}\n${result.stdout || ''}`;
  const diagnostic = rawDiagnostic.toLowerCase();

  if (diagnostic.includes('password authentication failed')) {
    return new Error('Staging database authentication failed. Update SUPABASE_STAGING_DATABASE_URL with the current staging database password.');
  }
  if (diagnostic.includes('tenant or user not found') || diagnostic.includes('invalid tenant')) {
    return new Error('Supavisor could not resolve the staging tenant. Use the exact Session Pooler host and username shown by Supabase Connect.');
  }
  if (diagnostic.includes('database') && diagnostic.includes('does not exist')) {
    return new Error('The staging database name is invalid. The Supabase connection URI should normally end with /postgres.');
  }
  if (diagnostic.includes('role') && diagnostic.includes('does not exist')) {
    return new Error('The staging database role is invalid. Use the exact Session Pooler username postgres.<project-ref>.');
  }
  if (
    diagnostic.includes('could not translate host name') ||
    diagnostic.includes('connection timed out') ||
    diagnostic.includes('timeout expired') ||
    diagnostic.includes('connection refused') ||
    diagnostic.includes('network is unreachable') ||
    diagnostic.includes('server closed the connection unexpectedly')
  ) {
    return new Error('Unable to reach the protected staging Session Pooler. Check the copied Session Pooler host, port 5432 and project availability.');
  }
  if (diagnostic.includes('no pg_hba.conf entry') || diagnostic.includes('certificate verify failed')) {
    return new Error('The protected staging database rejected the SSL connection. Confirm Session Pooler port 5432 with sslmode=require.');
  }
  if (diagnostic.includes('permission denied') || diagnostic.includes('must be owner')) {
    return new Error('The staging database user lacks permission to create the BizOn instructor schema. Use the project postgres Session Pooler connection.');
  }

  const safeLines = rawDiagnostic
    .split(/\r?\n/)
    .map(line => sanitize(line.trim()))
    .filter(Boolean)
    .filter(line => !/^notice:/i.test(line))
    .slice(0, 3);

  return new Error(
    safeLines.length
      ? `Staging ${phase} failed: ${safeLines.join(' | ')}`
      : `Staging ${phase} failed with psql exit status ${String(result.status ?? 'unknown')} and no diagnostic output.`
  );
};

const runPsql = ({ args, input, phase }) => {
  const result = spawnSync('psql', ['-X', '--set', 'ON_ERROR_STOP=1', ...args], {
    input,
    encoding: 'utf8',
    env: psqlEnv,
    maxBuffer: 1024 * 1024
  });
  if (result.status !== 0 || result.error) throw classifyPsqlFailure(result, phase);
  return result;
};

runPsql({
  args: ['--tuples-only', '--no-align', '--command', 'select current_database(), current_user;'],
  phase: 'database connection preflight'
});

runPsql({
  args: [],
  input: sql,
  phase: 'instructor-key bootstrap'
});

process.stdout.write('Protected staging instructor-key verifier bootstrapped.\n');