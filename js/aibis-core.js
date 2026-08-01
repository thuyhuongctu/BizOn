/* BizOn AIBIS Foundation
 * Deterministic internationalization simulation primitives.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. All rights reserved.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnAIBIS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = '0.1.0';
  const ENTRY_MODES = Object.freeze([
    'export', 'licensing', 'franchising', 'joint_venture',
    'strategic_alliance', 'digital_platform', 'greenfield_fdi'
  ]);
  const DECISION_TYPES = Object.freeze([
    'readiness', 'market_selection', 'entry_mode', 'localization',
    'negotiation', 'shock_response', 'portfolio', 'capability_building'
  ]);

  function clamp(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  function hashSeed(seed) {
    const text = String(seed || 'AIBIS-DEFAULT');
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function createRng(seed) {
    let state = hashSeed(seed) || 1;
    return function random() {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function readinessScore(profile) {
    const p = profile || {};
    const dimensions = {
      financial: clamp(p.financial, 0, 100),
      managerial: clamp(p.managerial, 0, 100),
      technology: clamp(p.technology, 0, 100),
      internationalExperience: clamp(p.internationalExperience, 0, 100),
      productScalability: clamp(p.productScalability, 0, 100),
      networkCapability: clamp(p.networkCapability, 0, 100)
    };
    const weights = {
      financial: 0.20,
      managerial: 0.15,
      technology: 0.15,
      internationalExperience: 0.15,
      productScalability: 0.20,
      networkCapability: 0.15
    };
    const score = Object.keys(weights).reduce((sum, key) => sum + dimensions[key] * weights[key], 0);
    return { score: Math.round(score * 10) / 10, dimensions, weights };
  }

  function createWorldState(options) {
    const input = options || {};
    const seed = String(input.seed || 'AIBIS-DEFAULT');
    return {
      schemaVersion: 1,
      engineVersion: VERSION,
      seed,
      round: 0,
      company: {
        cash: clamp(input.cash == null ? 1000000 : input.cash, 0, Number.MAX_SAFE_INTEGER),
        revenue: 0,
        profit: 0,
        marketShare: 0,
        reputation: 50,
        risk: 30,
        esg: 50,
        doi: 0,
        internationalLearning: 0,
        digitalCapability: clamp(input.digitalCapability == null ? 50 : input.digitalCapability, 0, 100)
      },
      market: input.market || null,
      entryMode: input.entryMode || null,
      shocks: [],
      decisions: [],
      metadata: {
        createdAt: input.createdAt || new Date().toISOString(),
        classroomId: input.classroomId || null,
        teamId: input.teamId || null,
        consent: Boolean(input.consent)
      }
    };
  }

  function validateDecision(decision) {
    if (!decision || typeof decision !== 'object') return { ok: false, errors: ['decision must be an object'] };
    const errors = [];
    if (!DECISION_TYPES.includes(decision.type)) errors.push('unsupported decision type');
    if (!decision.id) errors.push('decision.id is required');
    if (decision.type === 'entry_mode' && !ENTRY_MODES.includes(decision.value)) errors.push('unsupported entry mode');
    return { ok: errors.length === 0, errors };
  }

  function appendDecision(state, decision) {
    const validation = validateDecision(decision);
    if (!validation.ok) throw new Error(validation.errors.join('; '));
    const next = JSON.parse(JSON.stringify(state));
    const record = {
      id: String(decision.id),
      type: decision.type,
      value: decision.value,
      round: next.round,
      rationale: decision.rationale || '',
      evidenceSources: Array.isArray(decision.evidenceSources) ? decision.evidenceSources.slice() : [],
      aiAdviceUsed: Boolean(decision.aiAdviceUsed),
      aiAdviceFollowed: Boolean(decision.aiAdviceFollowed),
      decisionTimeSeconds: clamp(decision.decisionTimeSeconds || 0, 0, 86400),
      createdAt: decision.createdAt || new Date().toISOString()
    };
    next.decisions.push(record);
    if (decision.type === 'entry_mode') next.entryMode = decision.value;
    if (decision.type === 'market_selection') next.market = decision.value;
    return next;
  }

  function resolveRound(state, inputs) {
    const next = JSON.parse(JSON.stringify(state));
    const data = inputs || {};
    const rng = createRng(`${next.seed}:${next.round + 1}`);
    const marketGrowth = clamp(data.marketGrowth == null ? 50 : data.marketGrowth, 0, 100);
    const institutionalRisk = clamp(data.institutionalRisk == null ? 40 : data.institutionalRisk, 0, 100);
    const tariffPressure = clamp(data.tariffPressure == null ? 20 : data.tariffPressure, 0, 100);
    const localizationFit = clamp(data.localizationFit == null ? 50 : data.localizationFit, 0, 100);
    const executionQuality = clamp(data.executionQuality == null ? 50 : data.executionQuality, 0, 100);
    const shock = clamp(data.shock == null ? 0 : data.shock, -100, 100);

    const noise = (rng() - 0.5) * 6;
    const opportunity = marketGrowth * 0.38 + localizationFit * 0.22 + executionQuality * 0.30 + next.company.digitalCapability * 0.10;
    const exposure = institutionalRisk * 0.45 + tariffPressure * 0.35 + Math.max(0, shock) * 0.20;
    const revenueDelta = Math.max(-25, Math.min(40, (opportunity - exposure) * 0.34 + noise));
    const profitDelta = revenueDelta * 0.62 - institutionalRisk * 0.035 - tariffPressure * 0.03;

    next.round += 1;
    next.company.revenue = Math.max(0, next.company.revenue * (1 + revenueDelta / 100) + 100000 * (1 + revenueDelta / 100));
    next.company.profit = next.company.revenue * Math.max(-0.15, Math.min(0.30, 0.08 + profitDelta / 100));
    next.company.cash = Math.max(0, next.company.cash + next.company.profit);
    next.company.marketShare = clamp(next.company.marketShare + revenueDelta * 0.16, 0, 100);
    next.company.risk = clamp(next.company.risk + institutionalRisk * 0.06 + tariffPressure * 0.04 + shock * 0.05 - executionQuality * 0.05, 0, 100);
    next.company.reputation = clamp(next.company.reputation + localizationFit * 0.035 + executionQuality * 0.025 - Math.max(0, shock) * 0.02, 0, 100);
    next.company.internationalLearning = clamp(next.company.internationalLearning + 5 + executionQuality * 0.05, 0, 100);
    next.company.doi = clamp(next.company.doi + 6 + marketGrowth * 0.025, 0, 100);

    if (shock !== 0) {
      next.shocks.push({ round: next.round, magnitude: shock, type: data.shockType || 'market', source: data.shockSource || 'scenario' });
    }

    return {
      state: next,
      outcome: {
        round: next.round,
        revenueDeltaPercent: Math.round(revenueDelta * 10) / 10,
        profit: Math.round(next.company.profit),
        risk: Math.round(next.company.risk * 10) / 10,
        learning: Math.round(next.company.internationalLearning * 10) / 10,
        deterministicSeed: `${next.seed}:${next.round}`
      }
    };
  }

  function exportResearchRecord(state) {
    return {
      schema_version: state.schemaVersion,
      engine_version: state.engineVersion,
      session_seed: state.seed,
      classroom_id: state.metadata.classroomId,
      team_id: state.metadata.teamId,
      consent: state.metadata.consent,
      current_round: state.round,
      market: state.market,
      entry_mode: state.entryMode,
      decisions: state.decisions.map(function (d) {
        return {
          id: d.id,
          type: d.type,
          value: d.value,
          round: d.round,
          evidence_count: d.evidenceSources.length,
          ai_advice_used: d.aiAdviceUsed,
          ai_advice_followed: d.aiAdviceFollowed,
          decision_time_seconds: d.decisionTimeSeconds
        };
      }),
      outcomes: Object.assign({}, state.company),
      shocks: state.shocks.slice()
    };
  }

  return Object.freeze({
    VERSION,
    ENTRY_MODES,
    DECISION_TYPES,
    clamp,
    createRng,
    readinessScore,
    createWorldState,
    validateDecision,
    appendDecision,
    resolveRound,
    exportResearchRecord
  });
});
