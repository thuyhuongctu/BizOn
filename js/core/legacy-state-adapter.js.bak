(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./game-state.js') : root.BizOnGameState
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnLegacyStateAdapter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (GameState) {
  'use strict';

  const LEGACY_STORAGE_KEY = 'bizon2026';

  function finite(value, fallback = 0) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function text(value, fallback = '') {
    return typeof value === 'string' ? value.trim().slice(0, 120) : fallback;
  }

  function array(value) {
    return Array.isArray(value) ? JSON.parse(JSON.stringify(value)) : [];
  }

  function parseLegacy(raw) {
    if (raw == null || raw === '') return { found: false, value: null, error: null };
    try {
      const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { found: true, value: null, error: 'legacy_state_not_object' };
      }
      return { found: true, value, error: null };
    } catch (error) {
      return { found: true, value: null, error: 'legacy_state_invalid_json' };
    }
  }

  function latestOutcome(history) {
    return Array.isArray(history) && history.length ? history[history.length - 1] || {} : {};
  }

  function buildSessionId(legacy, options) {
    const supplied = text(options.sessionId);
    if (supplied) return supplied;
    const profile = legacy.profile || {};
    const team = text(profile.teamId || profile.teamName, 'legacy-team');
    return `legacy-${team.toLowerCase().replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'session'}`.slice(0, 120);
  }

  function convert(legacy, options = {}) {
    if (!GameState || typeof GameState.createGameState !== 'function') {
      throw new Error('game_state_dependency_missing');
    }
    if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) {
      throw new Error('legacy_state_not_object');
    }

    const profile = legacy.profile || {};
    const history = array(legacy.history);
    const last = latestOutcome(history);
    const currentRound = Math.max(0, Math.min(6, Math.trunc(finite(legacy.round, history.length))));
    const status = currentRound >= 6 ? 'completed' : currentRound > 0 ? 'active' : 'draft';

    const state = GameState.createGameState({
      product: 'startup',
      sessionId: buildSessionId(legacy, options),
      classId: text(profile.classId || profile.classCode || legacy.classId),
      teamId: text(profile.teamId || profile.teamName || legacy.teamId),
      seed: text(legacy.seed || profile.seed, options.seed || 'BIZON-LEGACY'),
      mode: legacy.advancedMode ? 'advanced' : 'basic',
      currentRound,
      status,
      cash: finite(legacy.balance, 500),
      revenue: finite(last.revenue, 0),
      profit: finite(last.netProfit ?? last.profit, 0),
      marketShare: finite(last.share ?? last.marketShare, 0),
      reputation: finite(legacy.brandLoyalty, 50),
      risk: finite(legacy.risk, 20),
      locale: text(profile.locale || legacy.locale, 'vi'),
      createdBy: 'legacy-adapter'
    });

    state.outcomes = history;
    state.instructorActions = array(legacy.grantLog);
    state.aiInteractions = array(legacy.advisorHistory).concat(array(legacy.aiHistory));
    state.events = array(legacy.eventHistory || legacy.events);
    state.decisions = array(legacy.decisions);
    state.metadata.migratedFrom = text(options.sourceKey, LEGACY_STORAGE_KEY);
    state.metadata.legacyTeamName = text(profile.teamName);
    state.metadata.legacyRole = text(profile.role);
    state.metadata.legacyRoundLocked = Boolean(legacy.roundLocked);
    state.metadata.legacySummary = {
      achievements: array(legacy.achievements).length,
      conquest: array(legacy.conquest).length,
      rewardsOwned: array(legacy.rewardsOwned).length,
      aiAskedTotal: finite(legacy.aiAskedTotal, 0)
    };

    if (options.includeRawDebug === true) {
      state.metadata.legacyRawDebug = JSON.parse(JSON.stringify(legacy));
    }

    const validation = GameState.validateGameState(state);
    if (!validation.valid) {
      const error = new Error('converted_state_invalid');
      error.details = validation.errors;
      throw error;
    }
    return state;
  }

  function inspect(storage) {
    if (!storage || typeof storage.getItem !== 'function') {
      return { found: false, convertible: false, error: 'storage_unavailable' };
    }
    const parsed = parseLegacy(storage.getItem(LEGACY_STORAGE_KEY));
    if (!parsed.found) return { found: false, convertible: false, error: null };
    if (parsed.error) return { found: true, convertible: false, error: parsed.error };
    try {
      const state = convert(parsed.value);
      return {
        found: true,
        convertible: true,
        error: null,
        summary: {
          sessionId: state.session.sessionId,
          teamId: state.session.teamId,
          currentRound: state.game.currentRound,
          outcomes: state.outcomes.length
        }
      };
    } catch (error) {
      return { found: true, convertible: false, error: error.message, details: error.details || [] };
    }
  }

  function readAndConvert(storage, options = {}) {
    if (!storage || typeof storage.getItem !== 'function') throw new Error('storage_unavailable');
    const parsed = parseLegacy(storage.getItem(LEGACY_STORAGE_KEY));
    if (!parsed.found) return null;
    if (parsed.error) throw new Error(parsed.error);
    return convert(parsed.value, { ...options, sourceKey: LEGACY_STORAGE_KEY });
  }

  return Object.freeze({
    LEGACY_STORAGE_KEY,
    parseLegacy,
    convert,
    inspect,
    readAndConvert
  });
});
