const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = file => fs.readFileSync(file, 'utf8');
const workflow = read('.github/workflows/supabase-staging-gate.yml');
const verifier = read('scripts/release/verify-supabase-staging.mjs');
const runbook = read('docs/learning/BIZON_SUPABASE_STAGING_GATE_V1.md');
const backend = read('js/backend-config.js');

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /environment:\s*supabase-staging/);
assert.match(workflow, /if:\s*github\.event_name == 'workflow_dispatch'/);
assert.match(workflow, /SUPABASE_STAGING_PROJECT_REF/);
assert.match(workflow, /SUPABASE_STAGING_DATABASE_URL/);
assert.match(workflow, /SUPABASE_STAGING_ANON_KEY/);
assert.match(workflow, /SUPABASE_STAGING_INSTRUCTOR_KEY/);
assert.doesNotMatch(workflow, /SERVICE_ROLE_KEY|service_role_key/);
assert.match(workflow, /actions\/upload-artifact@v4/);

assert.match(verifier, /ceytblfelodpnudomccn/);
assert.match(verifier, /projectRef !== PRODUCTION_PROJECT_REF/);
assert.match(verifier, /confirmedRef === projectRef/);
assert.match(verifier, /hostname === `\$\{projectRef\}\.supabase\.co`/);
assert.match(verifier, /bizon_submit_learning_trace/);
assert.match(verifier, /bizon_delete_learning_trace/);
assert.match(verifier, /bizon_bp_learning_traces/);
assert.match(verifier, /bizon_purge_expired_learning_traces/);
assert.match(verifier, /ai_scoring=true payload is rejected/);
assert.match(verifier, /invalid consent version is rejected/);
assert.match(verifier, /anonymous direct REST table read is denied/);
assert.match(verifier, /deletion token is stored only as SHA-256/);
assert.match(verifier, /deleted fixture is no longer returned/);
assert.match(verifier, /fixtureIds\.push\(aiScoringFixtureId\)/);
assert.match(verifier, /fixtureIds\.push\(invalidConsentFixtureId\)/);
assert.match(verifier, /finally \{\s*await cleanupFixtures\(\)/s);
assert.match(verifier, /secrets_in_report:\s*false/);
assert.doesNotMatch(verifier, /console\.log\([^\n]*(anonKey|instructorKey|databaseUrl|deleteToken)/);

assert.match(runbook, /không dùng project production/i);
assert.match(runbook, /supabase-staging/);
assert.match(runbook, /required reviewer/i);
assert.match(runbook, /APPLY_MIGRATION=false/);
assert.match(runbook, /không chứa service_role/i);
assert.match(runbook, /dữ liệu giả lập/i);

const productionUrl = backend.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
assert.equal(productionUrl, 'ceytblfelodpnudomccn');
assert.ok(verifier.includes(productionUrl), 'The staging verifier must explicitly block the currently configured production project ref.');

console.log('Supabase staging gate safety contract passed.');
