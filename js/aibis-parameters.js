/* AIBIS parameter registry — canonical staging values for markets and entry modes. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnAIBISParameters = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = '0.1.0';
  const markets = Object.freeze({
    sea: { archetype: 'regional-hub', growth: 68, institutionalRisk: 24, tariffPressure: 13, culturalDistance: 20, digitalReadiness: 85 },
    eas: { archetype: 'advanced-stable', growth: 60, institutionalRisk: 31, tariffPressure: 25, culturalDistance: 50, digitalReadiness: 95 },
    eu:  { archetype: 'sustainability-sensitive', growth: 56, institutionalRisk: 42, tariffPressure: 30, culturalDistance: 70, digitalReadiness: 90 },
    na:  { archetype: 'advanced-competitive', growth: 72, institutionalRisk: 43, tariffPressure: 38, culturalDistance: 60, digitalReadiness: 92 },
    me:  { archetype: 'relationship-driven', growth: 66, institutionalRisk: 50, tariffPressure: 20, culturalDistance: 80, digitalReadiness: 80 },
    kr:  { archetype: 'digital-first', growth: 64, institutionalRisk: 34, tariffPressure: 23, culturalDistance: 45, digitalReadiness: 93 },
    af:  { archetype: 'emerging-growth', growth: 71, institutionalRisk: 58, tariffPressure: 25, culturalDistance: 75, digitalReadiness: 55 }
  });

  const entryModes = Object.freeze({
    export: { commitment: 25, control: 35, learning: 35, flexibility: 85, baseRisk: 28 },
    licensing: { commitment: 15, control: 25, learning: 25, flexibility: 90, baseRisk: 20 },
    franchising: { commitment: 25, control: 40, learning: 42, flexibility: 75, baseRisk: 30 },
    joint_venture: { commitment: 60, control: 65, learning: 78, flexibility: 45, baseRisk: 52 },
    strategic_alliance: { commitment: 45, control: 50, learning: 70, flexibility: 60, baseRisk: 44 },
    digital_platform: { commitment: 30, control: 60, learning: 55, flexibility: 80, baseRisk: 36 },
    greenfield_fdi: { commitment: 95, control: 100, learning: 88, flexibility: 15, baseRisk: 76 }
  });

  function getMarket(id) { return markets[id] || null; }
  function getEntryMode(id) { return entryModes[id] || null; }
  function listMarkets() { return Object.keys(markets); }
  function listEntryModes() { return Object.keys(entryModes); }

  return Object.freeze({ VERSION, markets, entryModes, getMarket, getEntryMode, listMarkets, listEntryModes });
});
