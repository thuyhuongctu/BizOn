'use strict';

const assert = require('assert');
const GameState = require('../js/core/game-state.js');
const Persistence = require('../js/core/persistence.js');
const LegacyAdapter = require('../js/core/legacy-state-adapter.js');
const ShadowSync = require('../js/core/shadow-sync.js');

function legacy(round = 2, profit = 18) {
  return {
    profile: { classId: 'IB01', teamName: 'Dragon Team', role: 'CEO' },
    round,
    balance: 560,
    brandLoyalty: 68,
    history: [
      { round: 1, revenue: 140, netProfit: 8, share: 22 },
      { round, revenue: 190, netProfit: profit, share: 29 }
    ],
    grantLog: [],
    advisorHistory: []
  };
}

(function hashIsStable() {
  assert.strictEqual(ShadowSync.hashString('abc'), ShadowSync.hashString('abc'));
  assert.notStrictEqual(ShadowSync.hashString('abc'), ShadowSync.hashString('abd'));
})();

(function missingLegacyIsSafe() {
  const storage = Persistence.createMemoryStorage();
  const result = ShadowSync.createShadowSnapshot(storage);
  assert.strictEqual(result.status, 'missing');
  assert.strictEqual(result.changed, false);
})();

(function snapshotDoesNotMutateLegacy() {
  const raw = JSON.stringify(legacy());
  const storage = Persistence.createMemoryStorage({ [LegacyAdapter.LEGACY_STORAGE_KEY]: raw });
  const result = ShadowSync.createShadowSnapshot(storage);
  assert.strictEqual(result.status, 'updated');
  assert.strictEqual(result.snapshot.game.currentRound, 2);
  assert.strictEqual(result.snapshot.company.profit, 18);
  assert.strictEqual(storage.getItem(LegacyAdapter.LEGACY_STORAGE_KEY), raw);
  assert.strictEqual(result.snapshot.metadata.shadowSync.mode, 'read-only-shadow');
})();

(function unchangedHashSkipsConversion() {
  const raw = JSON.stringify(legacy());
  const storage = Persistence.createMemoryStorage({ [LegacyAdapter.LEGACY_STORAGE_KEY]: raw });
  const first = ShadowSync.createShadowSnapshot(storage);
  const second = ShadowSync.createShadowSnapshot(storage, { previousHash: first.rawHash });
  assert.strictEqual(second.status, 'unchanged');
  assert.strictEqual(second.changed, false);
})();

(function controllerPersistsOnlyShadowNamespace() {
  const raw = JSON.stringify(legacy());
  const storage = Persistence.createMemoryStorage({ [LegacyAdapter.LEGACY_STORAGE_KEY]: raw });
  const controller = ShadowSync.createController({ storage });
  const result = controller.syncNow();
  assert.strictEqual(result.changed, true);
  const key = ShadowSync.shadowKey(result.snapshot.session.sessionId);
  assert.ok(storage.getItem(key));
  assert.strictEqual(storage.getItem(LegacyAdapter.LEGACY_STORAGE_KEY), raw);
  assert.strictEqual(storage.getItem(`bizon:v2:session:${result.snapshot.session.sessionId}`), null);
})();

(function controllerTracksChanges() {
  const storage = Persistence.createMemoryStorage({
    [LegacyAdapter.LEGACY_STORAGE_KEY]: JSON.stringify(legacy(2, 18))
  });
  const controller = ShadowSync.createController({ storage, persistShadow: false });
  assert.strictEqual(controller.syncNow().changed, true);
  assert.strictEqual(controller.syncNow().changed, false);
  storage.setItem(LegacyAdapter.LEGACY_STORAGE_KEY, JSON.stringify(legacy(3, 35)));
  const third = controller.syncNow();
  assert.strictEqual(third.changed, true);
  assert.strictEqual(controller.getStatus().syncCount, 2);
  assert.strictEqual(controller.getLastSnapshot().company.profit, 35);
})();

(function corruptLegacyReturnsErrorWithoutThrowingController() {
  const storage = Persistence.createMemoryStorage({ [LegacyAdapter.LEGACY_STORAGE_KEY]: '{bad' });
  const controller = ShadowSync.createController({ storage });
  const result = controller.syncNow();
  assert.strictEqual(result.status, 'error');
  assert.strictEqual(result.error, 'legacy_state_invalid_json');
})();

console.log('shadow-sync contract: ok');
