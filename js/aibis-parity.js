/* AIBIS parity report utilities. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnAIBISParity = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '0.1.0';
  function n(v) { const x = Number(v); return Number.isFinite(x) ? x : null; }
  function relDiff(a, b) {
    a = n(a); b = n(b); if (a == null || b == null) return null;
    const denom = Math.max(1, Math.abs(a));
    return Math.round(Math.abs(a - b) / denom * 1000) / 10;
  }
  function summarize(records) {
    const rows = Array.isArray(records) ? records : [];
    const metrics = { profit: [], risk: [], learning: [] };
    rows.forEach(function (r) {
      if (!r || !r.legacy || !r.shadow) return;
      metrics.profit.push(relDiff(r.legacy.profit, r.shadow.profit));
      metrics.risk.push(relDiff(r.legacy.risk, r.shadow.risk));
      metrics.learning.push(relDiff(r.legacy.learning, r.shadow.learning));
    });
    function avg(values) {
      const clean = values.filter(function (v) { return v != null; });
      return clean.length ? Math.round(clean.reduce(function (s, v) { return s + v; }, 0) / clean.length * 10) / 10 : null;
    }
    return {
      version: VERSION,
      records: rows.length,
      meanRelativeDifferencePercent: {
        profit: avg(metrics.profit), risk: avg(metrics.risk), learning: avg(metrics.learning)
      },
      releaseGate: rows.length >= 30 && avg(metrics.risk) <= 35 && avg(metrics.learning) <= 35 ? 'review' : 'hold'
    };
  }
  function toCsv(records) {
    const rows = Array.isArray(records) ? records : [];
    const header = ['round','seed','market','legacy_mode','aibis_mode','legacy_profit','shadow_profit','legacy_risk','shadow_risk','legacy_learning','shadow_learning'];
    const lines = [header.join(',')];
    rows.forEach(function (r) {
      const vals = [r.round,r.seed,r.market,r.legacyMode,r.aibisMode,r.legacy&&r.legacy.profit,r.shadow&&r.shadow.profit,r.legacy&&r.legacy.risk,r.shadow&&r.shadow.risk,r.legacy&&r.legacy.learning,r.shadow&&r.shadow.learning];
      lines.push(vals.map(function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(','));
    });
    return lines.join('\n');
  }
  return Object.freeze({ VERSION, relDiff, summarize, toCsv });
});
