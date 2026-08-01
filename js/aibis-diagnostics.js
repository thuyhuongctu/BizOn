/* AIBIS diagnostics panel. Visible only with ?debugAIBIS=1. */
(function () {
  'use strict';
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('debugAIBIS') !== '1') return;

  function safe(fn, fallback) {
    try { return fn(); } catch (_) { return fallback; }
  }

  function render() {
    const shadow = window.BizOnAIBISShadow;
    if (!shadow) return;
    let panel = document.getElementById('aibis-diagnostics');
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'aibis-diagnostics';
      panel.setAttribute('aria-live', 'polite');
      panel.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:9999;width:min(360px,calc(100vw - 24px));max-height:70vh;overflow:auto;background:#081a20;color:#d6ecf0;border:1px solid #2f5660;border-radius:16px;padding:14px;font:12px/1.45 ui-monospace,Menlo,monospace;box-shadow:0 12px 34px rgba(0,0,0,.38)';
      document.body.appendChild(panel);
    }
    const state = safe(function () { return shadow.getState(); }, null);
    const readiness = safe(function () { return shadow.readiness(); }, null);
    const parity = safe(function () { return shadow.getParityLog(); }, []);
    const last = parity.length ? parity[parity.length - 1] : null;
    panel.innerHTML = [
      '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center">',
      '<strong>AIBIS PRIVATE DIAGNOSTICS</strong>',
      '<button id="aibis-diag-close" type="button" style="background:#16343d;color:#fff;border:0;border-radius:8px;padding:4px 8px">×</button>',
      '</div>',
      '<p style="opacity:.72;margin:6px 0">Không ảnh hưởng điểm hiển thị · không upload telemetry</p>',
      '<pre style="white-space:pre-wrap;margin:0">' + escapeHtml(JSON.stringify({
        engine: state && state.engineVersion,
        seed: state && state.seed,
        round: state && state.round,
        market: state && state.market,
        entryMode: state && state.entryMode,
        readiness: readiness && readiness.score,
        decisions: state && state.decisions ? state.decisions.length : 0,
        parityRecords: parity.length,
        lastParity: last
      }, null, 2)) + '</pre>'
    ].join('');
    document.getElementById('aibis-diag-close').addEventListener('click', function () { panel.remove(); });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  window.addEventListener('aibis:updated', render);
  window.addEventListener('load', function () {
    let tries = 0;
    const timer = setInterval(function () {
      tries += 1;
      if (window.BizOnAIBISShadow || tries > 40) {
        clearInterval(timer);
        if (window.BizOnAIBISShadow) render();
      }
    }, 250);
  }, { once: true });
})();
