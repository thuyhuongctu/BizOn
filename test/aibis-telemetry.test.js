const assert = require('assert');

global.BIZON_BACKEND = { enabled: true, url: 'https://example.supabase.co', anonKey: 'anon' };
global.BIZON_AIBIS = { enabled: true, uploadTelemetry: false };
const telemetry = require('../js/aibis-telemetry.js');

const base = {
  schema_version: 1,
  engine_version: '0.1.0',
  session_seed: 'CTU-IB-2026-A',
  classroom_id: 'IB01',
  team_id: 'TEAM-A',
  consent: true,
  current_round: 2,
  market: { id: 'eas' },
  entry_mode: 'joint_venture',
  decisions: [{ id: 'd1', rationale: 'must not be added by telemetry' }],
  outcomes: { profit: 10 },
  shocks: []
};

assert.strictEqual(telemetry.canUpload(base), false, 'upload must stay disabled by feature flag');
global.BIZON_AIBIS = { enabled: true, uploadTelemetry: true };
assert.strictEqual(telemetry.canUpload({ ...base, consent: false }), false, 'no consent means no upload');
assert.strictEqual(telemetry.canUpload(base), true, 'all three gates permit upload');

const clean = telemetry.sanitize({
  ...base,
  session_seed: 'x'.repeat(200),
  engine_version: 'v'.repeat(100),
  current_round: 999,
  decisions: Array.from({ length: 130 }, (_, i) => ({ id: String(i) })),
  shocks: Array.from({ length: 80 }, (_, i) => ({ id: i }))
});
assert.strictEqual(clean.session_seed.length, 120);
assert.strictEqual(clean.engine_version.length, 40);
assert.strictEqual(clean.current_round, 20);
assert.strictEqual(clean.decisions.length, 100);
assert.strictEqual(clean.shocks.length, 50);
assert.strictEqual(clean.consent, true);

console.log('AIBIS telemetry tests passed');
