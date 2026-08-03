const fs = require('node:fs');
const assert = require('node:assert/strict');

const workflow = fs.readFileSync('.github/workflows/supabase-staging-gate.yml', 'utf8');
const bootstrap = fs.readFileSync('scripts/release/bootstrap-supabase-staging-key.mjs', 'utf8');

assert.match(bootstrap, /PRODUCTION_PROJECT_REF/);
assert.match(bootstrap, /confirmedRef !== projectRef/);
assert.match(bootstrap, /projectRef === PRODUCTION_PROJECT_REF/);
assert.match(bootstrap, /instructorKey\.length < 32/);
assert.match(bootstrap, /create table if not exists public\.app_secrets/i);
assert.match(bootstrap, /insert into public\.app_secrets/i);
assert.match(bootstrap, /on conflict \(name\) do update set value = excluded\.value/i);
assert.match(bootstrap, /create or replace function public\.bizon_check_key\(p_key text\)/i);
assert.match(bootstrap, /security definer/i);
assert.match(bootstrap, /from public\.app_secrets/i);
assert.match(bootstrap, /s\.value = p_key/i);
assert.match(bootstrap, /revoke all on function public\.bizon_check_key\(text\) from public/i);
assert.match(bootstrap, /grant execute on function public\.bizon_check_key\(text\) to anon, authenticated/i);
assert.doesNotMatch(bootstrap, /SERVICE_ROLE_KEY|service_role/i);
assert.doesNotMatch(bootstrap, /createHash|digest\(p_key/i);
assert.doesNotMatch(bootstrap, /console\.log\([^\n]*(instructorKey|databaseUrl)/);

assert.match(workflow, /bootstrap-supabase-staging-key\.mjs/);
assert.match(workflow, /if:\s*inputs\.apply_migration == true/);
const bootstrapIndex = workflow.indexOf('bootstrap-supabase-staging-key.mjs');
const verifyIndex = workflow.indexOf('verify-supabase-staging.mjs');
assert.ok(bootstrapIndex > -1 && verifyIndex > -1 && bootstrapIndex < verifyIndex,
  'Instructor-key bootstrap must run before the staging verifier.');

console.log('Supabase staging instructor-key bootstrap contract passed.');
