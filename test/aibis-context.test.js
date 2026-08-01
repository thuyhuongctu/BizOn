const assert = require('assert');
const Context = require('../js/aibis-context.js');

const parsed = Context.read('?aibisSeed=CTU-IB-2026-A&classroom=IB01&team=T03&researchAIBIS=1&debugAIBIS=1');
assert.deepStrictEqual(parsed, {
  seed: 'CTU-IB-2026-A',
  classroomId: 'IB01',
  teamId: 'T03',
  researchMode: true,
  debugMode: true
});

assert.strictEqual(Context.clean(' A B/C? ', 64), 'ABC');
assert.strictEqual(Context.clean('x'.repeat(200), 12).length, 12);

const url = Context.buildPilotUrl('https://example.org/global.html', {
  seed: 'S-01', classroomId: 'C-01', teamId: 'T-01', researchMode: true, debugMode: false
});
const u = new URL(url);
assert.strictEqual(u.searchParams.get('aibisSeed'), 'S-01');
assert.strictEqual(u.searchParams.get('classroom'), 'C-01');
assert.strictEqual(u.searchParams.get('team'), 'T-01');
assert.strictEqual(u.searchParams.get('researchAIBIS'), '1');
assert.strictEqual(u.searchParams.has('debugAIBIS'), false);

console.log('AIBIS context tests passed');
