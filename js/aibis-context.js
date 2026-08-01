/* AIBIS private pilot context: shared seed, classroom/team identifiers and local consent state. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnAIBISContext = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';
  const VERSION = '0.1.0';
  function clean(value, max) {
    return String(value || '').trim().replace(/[^a-zA-Z0-9._-]/g, '').slice(0, max);
  }
  function read(search) {
    const params = new URLSearchParams(search == null && root.location ? root.location.search : search || '');
    return {
      seed: clean(params.get('aibisSeed'), 120) || null,
      classroomId: clean(params.get('classroom'), 64) || null,
      teamId: clean(params.get('team'), 64) || null,
      researchMode: params.get('researchAIBIS') === '1',
      debugMode: params.get('debugAIBIS') === '1'
    };
  }
  function consentKey(context) {
    const c = context || read();
    return ['bizon-aibis-consent', c.classroomId || 'none', c.teamId || 'none', c.seed || 'none'].join(':');
  }
  function getConsent(context) {
    try { return root.localStorage.getItem(consentKey(context)) === 'true'; } catch (_) { return false; }
  }
  function setConsent(value, context) {
    try { root.localStorage.setItem(consentKey(context), value ? 'true' : 'false'); return true; } catch (_) { return false; }
  }
  function clearConsent(context) {
    try { root.localStorage.removeItem(consentKey(context)); return true; } catch (_) { return false; }
  }
  function buildPilotUrl(base, values) {
    const v = values || {};
    const url = new URL(base, root.location ? root.location.href : 'https://example.invalid/');
    if (v.seed) url.searchParams.set('aibisSeed', clean(v.seed, 120));
    if (v.classroomId) url.searchParams.set('classroom', clean(v.classroomId, 64));
    if (v.teamId) url.searchParams.set('team', clean(v.teamId, 64));
    if (v.researchMode !== false) url.searchParams.set('researchAIBIS', '1');
    if (v.debugMode) url.searchParams.set('debugAIBIS', '1');
    return url.toString();
  }
  return Object.freeze({ VERSION, clean, read, consentKey, getConsent, setConsent, clearConsent, buildPilotUrl });
});
