/* BizOn AIBIS Shadow Adapter
 * Bridges the current Go Global page to the deterministic AIBIS core without
 * changing any score or visible gameplay result.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. All rights reserved.
 */
(function () {
  'use strict';

  if (!window.BizOnAIBIS) {
    console.warn('[AIBIS] Core not available; shadow adapter disabled.');
    return;
  }

  const AIBIS = window.BizOnAIBIS;
  const MODE_MAP = Object.freeze({
    export: 'export',
    lic: 'licensing',
    fran: 'franchising',
    jv: 'joint_venture',
    ally: 'strategic_alliance',
    digi: 'digital_platform',
    fdi: 'greenfield_fdi'
  });

  const sessionSeed = (function () {
    try {
      const urlSeed = new URLSearchParams(window.location.search).get('aibisSeed');
      if (urlSeed) return urlSeed;
      const existing = sessionStorage.getItem('bizon-aibis-seed');
      if (existing) return existing;
      const generated = 'AIBIS-' + new Date().toISOString().slice(0, 10) + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      sessionStorage.setItem('bizon-aibis-seed', generated);
      return generated;
    } catch (error) {
      return 'AIBIS-OFFLINE-DEFAULT';
    }
  })();

  function profileValue(value, low, high) {
    return value === high ? 80 : value === low ? 35 : 55;
  }

  function buildReadinessProfile() {
    const profile = typeof PROFILE !== 'undefined' ? PROFILE : {};
    return {
      financial: 60,
      managerial: 58,
      technology: profileValue(profile.tech, 'low', 'high'),
      internationalExperience: profileValue(profile.exp, 'new', 'exp'),
      productScalability: 65,
      networkCapability: 50
    };
  }

  let shadowState = AIBIS.createWorldState({
    seed: sessionSeed,
    cash: 1000000,
    digitalCapability: buildReadinessProfile().technology,
    classroomId: null,
    teamId: null,
    consent: false
  });

  const shadowLog = [];
  let startedAt = Date.now();

  function decisionId(type) {
    return [type, shadowState.round, Date.now(), Math.random().toString(36).slice(2, 7)].join('-');
  }

  function appendDecision(type, value, extra) {
    const details = extra || {};
    shadowState = AIBIS.appendDecision(shadowState, {
      id: decisionId(type),
      type,
      value,
      rationale: '',
      evidenceSources: details.evidenceSources || [],
      aiAdviceUsed: Boolean(details.aiAdviceUsed),
      aiAdviceFollowed: Boolean(details.aiAdviceFollowed),
      decisionTimeSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000))
    });
    startedAt = Date.now();
  }

  function currentMarketInputs(price, marketing, localization) {
    const market = typeof G !== 'undefined' && G.market ? G.market : {};
    const event = typeof qEvent === 'function' ? qEvent() : {};
    const referencePrice = Number(market.ref || price || 10);
    const priceFit = Math.max(0, 100 - Math.abs(Number(price) - referencePrice) / Math.max(1, referencePrice) * 100);
    const tariff = Math.max(0, Number(market.tariff || 0) + Number(event.tariffAdd || 0));
    const culturalDistance = Math.max(0, Math.min(1, Number(market.cult || 0.5)));
    const digitalReadiness = Math.max(0, Math.min(1, Number(market.digital || 0.5)));

    return {
      marketGrowth: Math.max(0, Math.min(100, 48 + Number(event.demand || 1) * 22 + digitalReadiness * 18)),
      institutionalRisk: Math.max(0, Math.min(100, culturalDistance * 55 + tariff * 120)),
      tariffPressure: Math.max(0, Math.min(100, tariff * 250)),
      localizationFit: Math.max(0, Math.min(100, Number(localization) * 0.8 + priceFit * 0.2)),
      executionQuality: Math.max(0, Math.min(100, 35 + Number(marketing) * 0.45 + digitalReadiness * 20)),
      shock: event.tariffAdd ? 35 : event.cogsAdd ? 25 : event.demand && event.demand < 1 ? 15 : 0,
      shockType: event.tariffAdd ? 'trade' : event.cogsAdd ? 'supply_chain' : 'market',
      shockSource: event.name || 'Go Global event'
    };
  }

  function dispatchShadowEvent(detail) {
    try {
      window.dispatchEvent(new CustomEvent('bizon:aibis-shadow-round', { detail }));
    } catch (error) {
      // Older webviews may not support CustomEvent construction.
    }
  }

  function wrapFunction(name, wrapper) {
    const original = window[name];
    if (typeof original !== 'function') {
      console.warn('[AIBIS] Cannot wrap ' + name + '; function not found.');
      return;
    }
    window[name] = wrapper(original);
  }

  wrapFunction('pickMarket', function (original) {
    return function (id) {
      const result = original.apply(this, arguments);
      appendDecision('market_selection', id);
      return result;
    };
  });

  wrapFunction('pickMode', function (original) {
    return function (id) {
      const result = original.apply(this, arguments);
      const mapped = MODE_MAP[id];
      if (mapped) appendDecision('entry_mode', mapped);
      return result;
    };
  });

  wrapFunction('pickNego', function (original) {
    return function (id) {
      const result = original.apply(this, arguments);
      appendDecision('negotiation', id, { aiAdviceUsed: true, aiAdviceFollowed: true });
      return result;
    };
  });

  wrapFunction('gCommit', function (original) {
    return function () {
      if (typeof G === 'undefined' || !G.mode || G.done) return original.apply(this, arguments);

      const priceElement = document.getElementById('gp');
      const marketingElement = document.getElementById('gm');
      const localizationElement = document.getElementById('gl');
      const price = priceElement ? Number(priceElement.value) : 10;
      const marketing = marketingElement ? Number(marketingElement.value) : 50;
      const localization = localizationElement ? Number(localizationElement.value) : 50;
      const legacyRound = G.q;
      const legacyResult = typeof gCalc === 'function' ? gCalc(price, marketing, localization) : null;

      appendDecision('localization', {
        price,
        marketing,
        localization,
        market: G.market && G.market.id,
        mode: G.mode && G.mode.id
      });

      const shadowResult = AIBIS.resolveRound(shadowState, currentMarketInputs(price, marketing, localization));
      shadowState = shadowResult.state;

      const detail = {
        timestamp: new Date().toISOString(),
        round: legacyRound,
        seed: shadowResult.outcome.deterministicSeed,
        market: G.market && G.market.id,
        legacyMode: G.mode && G.mode.id,
        aibisMode: MODE_MAP[G.mode && G.mode.id] || null,
        inputs: { price, marketing, localization },
        legacy: legacyResult ? {
          revenue: Number(legacyResult.revenue.toFixed(3)),
          profit: Number(legacyResult.profit.toFixed(3)),
          risk: legacyResult.risk,
          doi: legacyResult.doi,
          learning: legacyResult.learn
        } : null,
        shadow: shadowResult.outcome
      };
      shadowLog.push(detail);
      dispatchShadowEvent(detail);
      console.info('[AIBIS shadow]', detail);

      return original.apply(this, arguments);
    };
  });

  window.BizOnAIBISShadow = Object.freeze({
    version: '0.1.0',
    seed: sessionSeed,
    readiness: function () { return AIBIS.readinessScore(buildReadinessProfile()); },
    getState: function () { return JSON.parse(JSON.stringify(shadowState)); },
    getParityLog: function () { return JSON.parse(JSON.stringify(shadowLog)); },
    exportResearchRecord: function () { return AIBIS.exportResearchRecord(shadowState); },
    reset: function () {
      shadowState = AIBIS.createWorldState({
        seed: sessionSeed,
        cash: 1000000,
        digitalCapability: buildReadinessProfile().technology,
        consent: false
      });
      shadowLog.length = 0;
      startedAt = Date.now();
    }
  });

  console.info('[AIBIS] Shadow adapter active', {
    version: window.BizOnAIBISShadow.version,
    seed: sessionSeed,
    readiness: window.BizOnAIBISShadow.readiness().score
  });
})();
