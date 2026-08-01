/* BizOn AIBIS telemetry — private/staging foundation.
 * Upload is denied unless backend, feature flag and explicit consent are all true.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnAIBISTelemetry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const VERSION = '0.1.0';

  function config() {
    return {
      backend: root.BIZON_BACKEND || {},
      aibis: root.BIZON_AIBIS || {}
    };
  }

  function canUpload(record) {
    const c = config();
    return Boolean(
      c.backend.enabled && c.backend.url && c.backend.anonKey &&
      c.aibis.enabled && c.aibis.uploadTelemetry === true &&
      record && record.consent === true
    );
  }

  function sanitize(record) {
    if (!record || typeof record !== 'object') throw new Error('AIBIS telemetry record is required');
    return {
      schema_version: Number(record.schema_version || 1),
      engine_version: String(record.engine_version || 'unknown').slice(0, 40),
      session_seed: String(record.session_seed || '').slice(0, 120),
      classroom_id: record.classroom_id ? String(record.classroom_id).slice(0, 80) : null,
      team_id: record.team_id ? String(record.team_id).slice(0, 80) : null,
      consent: record.consent === true,
      current_round: Math.max(0, Math.min(20, Number(record.current_round || 0))),
      market: record.market == null ? null : record.market,
      entry_mode: record.entry_mode == null ? null : String(record.entry_mode).slice(0, 40),
      decisions: Array.isArray(record.decisions) ? record.decisions.slice(0, 100) : [],
      outcomes: record.outcomes && typeof record.outcomes === 'object' ? record.outcomes : {},
      shocks: Array.isArray(record.shocks) ? record.shocks.slice(0, 50) : [],
      client_ts: new Date().toISOString(),
      telemetry_version: VERSION
    };
  }

  async function upload(record) {
    const clean = sanitize(record);
    if (!canUpload(clean)) {
      return { ok: false, skipped: true, reason: 'consent-or-feature-gate' };
    }
    const c = config();
    const response = await fetch(c.backend.url.replace(/\/$/, '') + '/rest/v1/aibis_research_sessions', {
      method: 'POST',
      headers: {
        apikey: c.backend.anonKey,
        Authorization: 'Bearer ' + c.backend.anonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(clean)
    });
    if (!response.ok) throw new Error('AIBIS telemetry upload failed: HTTP ' + response.status);
    return { ok: true, skipped: false };
  }

  return Object.freeze({ VERSION, canUpload, sanitize, upload });
});
