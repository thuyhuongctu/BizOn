const assert = require('assert');
const GameState = require('../js/core/game-state.js');
const Persistence = require('../js/core/persistence.js');

function createState(id = 'S-001') {
  const state = GameState.createGameState({
    sessionId: id,
    classId: 'IB01',
    teamId: 'T01',
    seed: 'IB01:T01:BASE',
    product: 'startup',
    currentRound: 2,
    status: 'active',
    cash: 950000000,
    profit: 120000000,
    marketShare: 23,
    risk: 31
  });
  state.decisions.push({ round: 1, price: 12 });
  return state;
}

(function savesLoadsAndLists() {
  const storage = Persistence.createMemoryStorage();
  const saved = Persistence.saveGame(createState(), { storage });
  const loaded = Persistence.loadGame('S-001', { storage });
  assert.strictEqual(saved.session.sessionId, 'S-001');
  assert.strictEqual(loaded.company.profit, 120000000);
  assert.strictEqual(loaded.decisions.length, 1);
  assert.strictEqual(Persistence.listGames({ storage }).length, 1);
})();

(function createsBackupAndRecoversCorruption() {
  const storage = Persistence.createMemoryStorage();
  Persistence.saveGame(createState('S-002'), { storage });
  const updated = createState('S-002');
  updated.company.profit = 222;
  Persistence.saveGame(updated, { storage });
  storage.setItem(`${Persistence.STORAGE_PREFIX}S-002`, '{broken');
  const recovered = Persistence.loadGame('S-002', { storage });
  assert.strictEqual(recovered.company.profit, 120000000);
})();

(function migratesLegacyShape() {
  const migrated = Persistence.migrateLegacyState({
    version: 'legacy-1',
    sessionId: 'OLD-1',
    gameType: 'aibis',
    round: 3,
    status: 'active',
    cash: 500,
    marketShare: 12,
    decisions: [{ type: 'market', value: 'jp' }]
  });
  assert.strictEqual(migrated.schemaVersion, GameState.SCHEMA_VERSION);
  assert.strictEqual(migrated.game.product, 'aibis');
  assert.strictEqual(migrated.game.totalRounds, 8);
  assert.strictEqual(migrated.metadata.migratedFrom, 'legacy-1');
  assert.strictEqual(migrated.decisions.length, 1);
})();

(function exportsAndImportsWithoutPersistence() {
  const source = createState('S-003');
  const payload = Persistence.exportGame(source);
  const parsed = JSON.parse(payload);
  assert.strictEqual(parsed.format, Persistence.EXPORT_FORMAT);
  const imported = Persistence.importGame(payload, { persist: false });
  assert.strictEqual(imported.session.sessionId, 'S-003');
})();

(function rejectsInvalidState() {
  assert.throws(
    () => Persistence.saveGame({ schemaVersion: '1.0' }, { storage: Persistence.createMemoryStorage() }),
    /invalid_game_state/
  );
})();

(function deletesStateAndIndex() {
  const storage = Persistence.createMemoryStorage();
  Persistence.saveGame(createState('S-004'), { storage });
  Persistence.deleteGame('S-004', { storage });
  assert.strictEqual(Persistence.loadGame('S-004', { storage }), null);
  assert.deepStrictEqual(Persistence.listGames({ storage }), []);
})();

(function autosaveFlushesAndReportsErrors() {
  const storage = Persistence.createMemoryStorage();
  let state = createState('S-005');
  const autosave = Persistence.createAutosave({ storage, getState: () => state, intervalMs: 1000 });
  assert.strictEqual(autosave.flush(), true);
  assert.strictEqual(Persistence.loadGame('S-005', { storage }).session.sessionId, 'S-005');
  state = null;
  assert.strictEqual(autosave.flush(), true);
  assert.strictEqual(autosave.getLastError(), null);
})();

console.log('persistence tests passed');
