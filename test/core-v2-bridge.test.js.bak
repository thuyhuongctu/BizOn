const assert = require('assert');
const GameState = require('../js/core/game-state.js');
const Persistence = require('../js/core/persistence.js');
const Legacy = require('../js/core/legacy-state-adapter.js');

const scope = { BizOnGameState: GameState, BizOnPersistence: Persistence, BizOnLegacyStateAdapter: Legacy };
global.BizOnGameState = GameState;
global.BizOnPersistence = Persistence;
global.BizOnLegacyStateAdapter = Legacy;
const Bridge = require('../js/core/core-v2-bridge.js');

assert.strictEqual(Bridge.enabled({ search: '?coreV2=1' }), true);
assert.strictEqual(Bridge.enabled({ search: '?coreV2=0' }), false);
assert.strictEqual(Bridge.enabled({ search: '' }), false);
assert.strictEqual(Bridge.dependenciesAvailable(scope), true);
assert.strictEqual(Bridge.dependenciesAvailable({}), false);

const legacy = {
  profile: { teamName: 'Rồng Xanh', classCode: 'IB01', role: 'CEO' },
  round: 2,
  balance: 720,
  brandLoyalty: 68,
  history: [
    { round: 1, revenue: 500, netProfit: 80, share: 22 },
    { round: 2, revenue: 620, netProfit: 95, share: 27 }
  ],
  grantLog: [{ amount: 50 }],
  advisorHistory: [{ mode: 'rule' }]
};
const storage = Persistence.createMemoryStorage({ bizon2026: JSON.stringify(legacy) });
const original = storage.getItem('bizon2026');

const preview = Bridge.preview(storage, scope);
assert.strictEqual(preview.ok, true);
assert.strictEqual(preview.state.game.currentRound, 2);
assert.strictEqual(preview.state.company.cash, 720);
assert.strictEqual(preview.state.company.profit, 95);
assert.ok(preview.targetKey.startsWith(Persistence.STORAGE_PREFIX));
assert.strictEqual(storage.getItem(preview.targetKey), null, 'preview must not persist');

const migrated = Bridge.migrateCopy(storage, scope);
assert.strictEqual(migrated.ok, true);
assert.strictEqual(migrated.legacyPreserved, true);
assert.strictEqual(storage.getItem('bizon2026'), original, 'legacy save must remain byte-for-byte unchanged');
assert.ok(storage.getItem(migrated.targetKey), 'v2 copy should exist');
const loaded = Persistence.loadGame(migrated.state.session.sessionId, { storage });
assert.strictEqual(loaded.company.marketShare, 27);
assert.strictEqual(loaded.outcomes.length, 2);

const emptyStorage = Persistence.createMemoryStorage();
assert.strictEqual(Bridge.preview(emptyStorage, scope).reason, 'legacy_save_missing');
const corruptStorage = Persistence.createMemoryStorage({ bizon2026: '{bad' });
assert.strictEqual(Bridge.preview(corruptStorage, scope).reason, 'legacy_state_invalid_json');

console.log('core-v2-bridge.test.js: all assertions passed');
