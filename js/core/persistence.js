(function (root, factory) {
  const gameStateApi = typeof module === 'object' && module.exports
    ? require('./game-state.js')
    : root.BizOnGameState;
  const api = factory(gameStateApi);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnPersistence = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (GameState) {
  'use strict';

  if (!GameState) throw new Error('BizOnGameState is required');

  const STORAGE_PREFIX = 'bizon:v2:session:';
  const BACKUP_PREFIX = 'bizon:v2:backup:';
  const INDEX_KEY = 'bizon:v2:index';
  const EXPORT_FORMAT = 'bizon-session-export';
  const EXPORT_VERSION = '1.0';

  function createMemoryStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    return {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(String(key), String(value)); },
      removeItem(key) { values.delete(String(key)); },
      key(index) { return Array.from(values.keys())[index] ?? null; },
      get length() { return values.size; },
      snapshot() { return Object.fromEntries(values.entries()); }
    };
  }

  function getDefaultStorage() {
    if (typeof localStorage !== 'undefined') return localStorage;
    return createMemoryStorage();
  }

  function cleanId(value) {
    return String(value || '').trim().replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 120);
  }

  function storageKey(sessionId) {
    const id = cleanId(sessionId);
    if (!id) throw new Error('session_id_required');
    return `${STORAGE_PREFIX}${id}`;
  }

  function backupKey(sessionId) {
    const id = cleanId(sessionId);
    if (!id) throw new Error('session_id_required');
    return `${BACKUP_PREFIX}${id}`;
  }

  function parseJson(raw, code) {
    try { return JSON.parse(raw); }
    catch (error) {
      const wrapped = new Error(code || 'invalid_json');
      wrapped.cause = error;
      throw wrapped;
    }
  }

  function readIndex(storage) {
    const raw = storage.getItem(INDEX_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeIndex(storage, entries) {
    storage.setItem(INDEX_KEY, JSON.stringify(entries.slice(0, 100)));
  }

  function upsertIndex(storage, state) {
    const id = state.session.sessionId;
    const existing = readIndex(storage).filter((item) => item.sessionId !== id);
    existing.unshift({
      sessionId: id,
      classId: state.session.classId,
      teamId: state.session.teamId,
      product: state.game.product,
      currentRound: state.game.currentRound,
      status: state.game.status,
      updatedAt: state.session.updatedAt,
      engineVersion: state.engineVersion,
      schemaVersion: state.schemaVersion
    });
    writeIndex(storage, existing);
  }

  function migrateLegacyState(input) {
    if (!input || typeof input !== 'object') throw new Error('legacy_state_not_object');
    if (input.schemaVersion === GameState.SCHEMA_VERSION) return GameState.clone(input);

    const legacy = input.state && typeof input.state === 'object' ? input.state : input;
    const sessionId = legacy.sessionId || legacy.session?.sessionId || `legacy-${Date.now()}`;
    const product = legacy.product === 'aibis' || legacy.gameType === 'aibis' ? 'aibis' : 'startup';
    const migrated = GameState.createGameState({
      sessionId,
      classId: legacy.classId || legacy.session?.classId,
      teamId: legacy.teamId || legacy.session?.teamId,
      seed: legacy.seed || legacy.session?.seed || 'BIZON-LEGACY',
      product,
      mode: legacy.mode || legacy.game?.mode || 'basic',
      currentRound: legacy.round ?? legacy.currentRound ?? legacy.game?.currentRound ?? 0,
      status: legacy.status || legacy.game?.status || 'paused',
      cash: legacy.cash ?? legacy.company?.cash,
      revenue: legacy.revenue ?? legacy.company?.revenue,
      profit: legacy.profit ?? legacy.company?.profit,
      marketShare: legacy.marketShare ?? legacy.company?.marketShare,
      reputation: legacy.reputation ?? legacy.company?.reputation,
      risk: legacy.risk ?? legacy.company?.risk,
      locale: legacy.locale || legacy.metadata?.locale || 'vi',
      createdBy: legacy.createdBy || 'migration'
    });

    ['decisions', 'outcomes', 'events', 'instructorActions', 'aiInteractions'].forEach((key) => {
      if (Array.isArray(legacy[key])) migrated[key] = GameState.clone(legacy[key]);
    });
    migrated.metadata.migratedFrom = String(input.schemaVersion || legacy.version || 'legacy-unknown');
    return migrated;
  }

  function normalizeState(input) {
    const state = input?.schemaVersion === GameState.SCHEMA_VERSION
      ? GameState.clone(input)
      : migrateLegacyState(input);
    const validation = GameState.validateGameState(state);
    if (!validation.valid) {
      const error = new Error('invalid_game_state');
      error.validationErrors = validation.errors;
      throw error;
    }
    return GameState.touch(state);
  }

  function saveGame(input, options = {}) {
    const storage = options.storage || getDefaultStorage();
    const state = normalizeState(input);
    if (!state.session.sessionId) throw new Error('session_id_required');
    const key = storageKey(state.session.sessionId);
    const previous = storage.getItem(key);
    if (previous && options.backup !== false) storage.setItem(backupKey(state.session.sessionId), previous);
    storage.setItem(key, JSON.stringify(state));
    upsertIndex(storage, state);
    return GameState.clone(state);
  }

  function loadGame(sessionId, options = {}) {
    const storage = options.storage || getDefaultStorage();
    const raw = storage.getItem(storageKey(sessionId));
    if (!raw) return null;
    try {
      return normalizeState(parseJson(raw, 'corrupted_save'));
    } catch (error) {
      if (options.recoverFromBackup === false) throw error;
      const backup = storage.getItem(backupKey(sessionId));
      if (!backup) throw error;
      const recovered = normalizeState(parseJson(backup, 'corrupted_backup'));
      storage.setItem(storageKey(sessionId), JSON.stringify(recovered));
      return recovered;
    }
  }

  function deleteGame(sessionId, options = {}) {
    const storage = options.storage || getDefaultStorage();
    storage.removeItem(storageKey(sessionId));
    if (options.keepBackup !== true) storage.removeItem(backupKey(sessionId));
    writeIndex(storage, readIndex(storage).filter((item) => item.sessionId !== cleanId(sessionId)));
  }

  function listGames(options = {}) {
    return readIndex(options.storage || getDefaultStorage()).map((item) => ({ ...item }));
  }

  function exportGame(state) {
    const normalized = normalizeState(state);
    return JSON.stringify({
      format: EXPORT_FORMAT,
      exportVersion: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      state: normalized
    }, null, 2);
  }

  function importGame(payload, options = {}) {
    const parsed = typeof payload === 'string' ? parseJson(payload, 'invalid_import_json') : payload;
    const candidate = parsed?.format === EXPORT_FORMAT ? parsed.state : parsed;
    const normalized = normalizeState(candidate);
    if (options.persist === false) return normalized;
    return saveGame(normalized, options);
  }

  function createAutosave(options = {}) {
    const intervalMs = Math.max(1000, Number(options.intervalMs) || 15000);
    const getState = options.getState;
    if (typeof getState !== 'function') throw new Error('get_state_required');
    let timer = null;
    let lastError = null;

    function flush() {
      try {
        const state = getState();
        if (state) saveGame(state, options);
        lastError = null;
        return true;
      } catch (error) {
        lastError = error;
        if (typeof options.onError === 'function') options.onError(error);
        return false;
      }
    }

    return {
      start() {
        if (!timer) timer = setInterval(flush, intervalMs);
        return this;
      },
      stop() {
        if (timer) clearInterval(timer);
        timer = null;
        return this;
      },
      flush,
      isRunning() { return Boolean(timer); },
      getLastError() { return lastError; }
    };
  }

  return Object.freeze({
    STORAGE_PREFIX,
    BACKUP_PREFIX,
    INDEX_KEY,
    EXPORT_FORMAT,
    EXPORT_VERSION,
    createMemoryStorage,
    migrateLegacyState,
    normalizeState,
    saveGame,
    loadGame,
    deleteGame,
    listGames,
    exportGame,
    importGame,
    createAutosave
  });
});
