const assert = require('assert');
const Adapter = require('../js/core/legacy-state-adapter.js');

class MemoryStorage {
  constructor(initial = {}) { this.map = new Map(Object.entries(initial)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

const legacy = {
  profile: {
    teamName: 'Đội Rồng Xanh',
    classCode: 'ENT-01',
    role: 'CEO'
  },
  round: 2,
  balance: 640,
  brandLoyalty: 71,
  history: [
    { round: 1, revenue: 210, netProfit: 22, share: 26 },
    { round: 2, revenue: 280, netProfit: 41, share: 31 }
  ],
  grantLog: [{ amount: 20 }],
  advisorHistory: [{ type: 'what-if' }],
  aiHistory: [{ type: 'advisor' }],
  achievements: ['A1'],
  conquest: ['CT'],
  rewardsOwned: ['R1'],
  aiAskedTotal: 3,
  roundLocked: true
};

{
  const result = Adapter.parseLegacy('{bad');
  assert.strictEqual(result.error, 'legacy_state_invalid_json');
}

{
  const state = Adapter.convert(legacy);
  assert.strictEqual(state.game.product, 'startup');
  assert.strictEqual(state.game.currentRound, 2);
  assert.strictEqual(state.game.status, 'active');
  assert.strictEqual(state.company.cash, 640);
  assert.strictEqual(state.company.revenue, 280);
  assert.strictEqual(state.company.profit, 41);
  assert.strictEqual(state.company.marketShare, 31);
  assert.strictEqual(state.company.reputation, 71);
  assert.strictEqual(state.outcomes.length, 2);
  assert.strictEqual(state.instructorActions.length, 1);
  assert.strictEqual(state.aiInteractions.length, 2);
  assert.strictEqual(state.metadata.migratedFrom, 'bizon2026');
  assert.strictEqual(state.metadata.legacyRoundLocked, true);
  assert.strictEqual(state.metadata.legacyRawDebug, undefined);
}

{
  const state = Adapter.convert(legacy, { includeRawDebug: true });
  assert.strictEqual(state.metadata.legacyRawDebug.profile.teamName, 'Đội Rồng Xanh');
}

{
  const storage = new MemoryStorage({ bizon2026: JSON.stringify(legacy) });
  const report = Adapter.inspect(storage);
  assert.strictEqual(report.found, true);
  assert.strictEqual(report.convertible, true);
  assert.strictEqual(report.summary.currentRound, 2);
  assert.strictEqual(storage.getItem('bizon2026'), JSON.stringify(legacy));
}

{
  const storage = new MemoryStorage();
  assert.strictEqual(Adapter.readAndConvert(storage), null);
}

{
  const completed = Adapter.convert({ ...legacy, round: 6 });
  assert.strictEqual(completed.game.status, 'completed');
}

console.log('legacy-state-adapter tests passed');
