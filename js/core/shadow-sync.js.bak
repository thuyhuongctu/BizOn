(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./legacy-state-adapter.js') : root.BizOnLegacyStateAdapter,
    typeof module === 'object' && module.exports ? require('./game-state.js') : root.BizOnGameState
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnShadowSync = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (LegacyAdapter, GameState) {
  'use strict';

  const SHADOW_PREFIX = 'bizon:v2:shadow:';
  const DEFAULT_INTERVAL_MS = 2000;

  function getStorage(options) {
    if (options?.storage) return options.storage;
    if (typeof localStorage !== 'undefined') return localStorage;
    throw new Error('storage_unavailable');
  }

  function hashString(value) {
    const text = String(value || '');
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function cleanId(value) {
    return String(value || '').trim().replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 120);
  }

  function shadowKey(sessionId) {
    const id = cleanId(sessionId);
    if (!id) throw new Error('session_id_required');
    return `${SHADOW_PREFIX}${id}`;
  }

  function createShadowSnapshot(storage, options = {}) {
    if (!LegacyAdapter || !GameState) throw new Error('shadow_dependencies_missing');
    const raw = storage.getItem(LegacyAdapter.LEGACY_STORAGE_KEY);
    if (raw == null || raw === '') return { status: 'missing', changed: false, snapshot: null };

    const rawHash = hashString(raw);
    if (options.previousHash && options.previousHash === rawHash) {
      return { status: 'unchanged', changed: false, rawHash, snapshot: null };
    }

    const state = LegacyAdapter.readAndConvert(storage, options.convertOptions || {});
    const validation = GameState.validateGameState(state);
    if (!validation.valid) {
      const error = new Error('shadow_state_invalid');
      error.details = validation.errors;
      throw error;
    }

    const snapshot = GameState.clone(state);
    snapshot.metadata.shadowSync = {
      sourceKey: LegacyAdapter.LEGACY_STORAGE_KEY,
      sourceHash: rawHash,
      observedAt: new Date().toISOString(),
      mode: 'read-only-shadow'
    };
    return { status: 'updated', changed: true, rawHash, snapshot };
  }

  function createController(options = {}) {
    const storage = getStorage(options);
    const intervalMs = Math.max(1000, Number(options.intervalMs) || DEFAULT_INTERVAL_MS);
    const persistShadow = options.persistShadow !== false;
    let timer = null;
    let lastHash = null;
    let lastSnapshot = null;
    let lastError = null;
    let syncCount = 0;

    function syncNow() {
      try {
        const beforeLegacy = storage.getItem(LegacyAdapter.LEGACY_STORAGE_KEY);
        const result = createShadowSnapshot(storage, {
          previousHash: lastHash,
          convertOptions: options.convertOptions
        });
        const afterLegacy = storage.getItem(LegacyAdapter.LEGACY_STORAGE_KEY);
        if (beforeLegacy !== afterLegacy) throw new Error('legacy_save_mutated');

        if (result.changed) {
          lastHash = result.rawHash;
          lastSnapshot = result.snapshot;
          syncCount += 1;
          if (persistShadow) {
            storage.setItem(shadowKey(result.snapshot.session.sessionId), JSON.stringify(result.snapshot));
          }
          if (typeof options.onSnapshot === 'function') options.onSnapshot(GameState.clone(result.snapshot));
        }
        lastError = null;
        return result;
      } catch (error) {
        lastError = error;
        if (typeof options.onError === 'function') options.onError(error);
        return { status: 'error', changed: false, error: error.message, details: error.details || [] };
      }
    }

    return {
      start() {
        if (!timer) {
          syncNow();
          timer = setInterval(syncNow, intervalMs);
        }
        return this;
      },
      stop() {
        if (timer) clearInterval(timer);
        timer = null;
        return this;
      },
      syncNow,
      isRunning() { return Boolean(timer); },
      getStatus() {
        return {
          running: Boolean(timer),
          lastHash,
          syncCount,
          lastError: lastError?.message || null,
          sessionId: lastSnapshot?.session?.sessionId || null,
          currentRound: lastSnapshot?.game?.currentRound ?? null
        };
      },
      getLastSnapshot() { return lastSnapshot ? GameState.clone(lastSnapshot) : null; }
    };
  }

  return Object.freeze({
    SHADOW_PREFIX,
    DEFAULT_INTERVAL_MS,
    hashString,
    shadowKey,
    createShadowSnapshot,
    createController
  });
});
