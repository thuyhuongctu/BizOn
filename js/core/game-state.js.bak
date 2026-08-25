(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnGameState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCHEMA_VERSION = '1.0';
  const ENGINE_VERSION = '2.0.0-alpha.1';
  const PRODUCTS = new Set(['startup', 'aibis']);
  const MODES = new Set(['basic', 'advanced']);
  const STATUSES = new Set(['draft', 'active', 'paused', 'completed', 'abandoned']);

  function text(value, fallback = '') {
    return typeof value === 'string' ? value.trim().slice(0, 120) : fallback;
  }

  function finite(value, fallback = 0) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function bounded(value, min, max, fallback) {
    return Math.min(max, Math.max(min, finite(value, fallback)));
  }

  function createGameState(input = {}) {
    const now = new Date().toISOString();
    const product = PRODUCTS.has(input.product) ? input.product : 'startup';
    const totalRounds = product === 'startup' ? 6 : 8;

    return {
      schemaVersion: SCHEMA_VERSION,
      engineVersion: ENGINE_VERSION,
      session: {
        sessionId: text(input.sessionId),
        classId: text(input.classId),
        teamId: text(input.teamId),
        seed: text(input.seed, 'BIZON-DEMO'),
        startedAt: text(input.startedAt, now),
        updatedAt: now
      },
      game: {
        product,
        mode: MODES.has(input.mode) ? input.mode : 'basic',
        currentRound: bounded(input.currentRound, 0, totalRounds, 0),
        totalRounds,
        status: STATUSES.has(input.status) ? input.status : 'draft'
      },
      company: {
        cash: finite(input.cash, 1_000_000_000),
        revenue: finite(input.revenue, 0),
        profit: finite(input.profit, 0),
        marketShare: bounded(input.marketShare, 0, 100, 0),
        reputation: bounded(input.reputation, 0, 100, 50),
        risk: bounded(input.risk, 0, 100, 20)
      },
      decisions: [],
      outcomes: [],
      events: [],
      instructorActions: [],
      aiInteractions: [],
      metadata: {
        locale: text(input.locale, 'vi'),
        createdBy: text(input.createdBy, 'player'),
        migratedFrom: null
      }
    };
  }

  function clone(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function validateGameState(state) {
    const errors = [];
    if (!state || typeof state !== 'object') return { valid: false, errors: ['state_not_object'] };
    if (state.schemaVersion !== SCHEMA_VERSION) errors.push('unsupported_schema_version');
    if (!state.session || !state.game || !state.company) errors.push('missing_required_section');
    if (!PRODUCTS.has(state.game?.product)) errors.push('invalid_product');
    if (!MODES.has(state.game?.mode)) errors.push('invalid_mode');
    if (!STATUSES.has(state.game?.status)) errors.push('invalid_status');
    if (!Number.isFinite(state.game?.currentRound)) errors.push('invalid_round');
    if (state.game?.currentRound < 0 || state.game?.currentRound > state.game?.totalRounds) errors.push('round_out_of_range');
    ['cash', 'revenue', 'profit', 'marketShare', 'reputation', 'risk'].forEach((key) => {
      if (!Number.isFinite(state.company?.[key])) errors.push(`invalid_company_${key}`);
    });
    ['decisions', 'outcomes', 'events', 'instructorActions', 'aiInteractions'].forEach((key) => {
      if (!Array.isArray(state[key])) errors.push(`invalid_array_${key}`);
    });
    return { valid: errors.length === 0, errors };
  }

  function touch(state) {
    const next = clone(state);
    next.session.updatedAt = new Date().toISOString();
    return next;
  }

  return Object.freeze({
    SCHEMA_VERSION,
    ENGINE_VERSION,
    createGameState,
    validateGameState,
    clone,
    touch
  });
});
