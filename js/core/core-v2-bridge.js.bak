(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnCoreV2Bridge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const FLAG = 'coreV2';
  const ENABLE_VALUE = '1';
  const PANEL_ID = 'bizon-core-v2-panel';

  function enabled(locationLike) {
    try {
      const search = locationLike?.search || '';
      return new URLSearchParams(search).get(FLAG) === ENABLE_VALUE;
    } catch (_) {
      return false;
    }
  }

  function dependenciesAvailable(scope = root) {
    return Boolean(
      scope.BizOnGameState &&
      scope.BizOnPersistence &&
      scope.BizOnLegacyStateAdapter
    );
  }

  function preview(storage = root.localStorage, scope = root) {
    if (!dependenciesAvailable(scope)) {
      return { ok: false, reason: 'dependencies_missing' };
    }
    const inspection = scope.BizOnLegacyStateAdapter.inspect(storage);
    if (!inspection.found) return { ok: false, reason: 'legacy_save_missing', inspection };
    if (!inspection.convertible) return { ok: false, reason: inspection.error || 'legacy_save_not_convertible', inspection };
    const state = scope.BizOnLegacyStateAdapter.readAndConvert(storage);
    return {
      ok: true,
      inspection,
      state,
      targetKey: `${scope.BizOnPersistence.STORAGE_PREFIX}${state.session.sessionId}`
    };
  }

  function migrateCopy(storage = root.localStorage, scope = root) {
    const result = preview(storage, scope);
    if (!result.ok) return result;
    const legacyBefore = storage.getItem(scope.BizOnLegacyStateAdapter.LEGACY_STORAGE_KEY);
    const saved = scope.BizOnPersistence.saveGame(result.state, { storage });
    const legacyAfter = storage.getItem(scope.BizOnLegacyStateAdapter.LEGACY_STORAGE_KEY);
    if (legacyBefore !== legacyAfter) throw new Error('legacy_save_mutated');
    return {
      ok: true,
      state: saved,
      legacyPreserved: true,
      targetKey: `${scope.BizOnPersistence.STORAGE_PREFIX}${saved.session.sessionId}`
    };
  }

  function panelMarkup(result) {
    const summary = result.ok ? result.inspection.summary : null;
    return `
      <div style="font-weight:800;margin-bottom:6px">BizOn Core v2 · Nội bộ</div>
      <div data-role="status" style="font-size:12px;line-height:1.45;margin-bottom:8px">
        ${result.ok
          ? `Tìm thấy save cũ · đội ${summary.teamId || '—'} · vòng ${summary.currentRound} · ${summary.outcomes} kết quả.`
          : `Chưa thể preview: ${result.reason}.`}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button type="button" data-action="preview" style="padding:7px 10px;border-radius:10px;border:1px solid #8ad8eb;background:#fff;font-weight:700">Preview</button>
        <button type="button" data-action="migrate" ${result.ok ? '' : 'disabled'} style="padding:7px 10px;border-radius:10px;border:0;background:#006687;color:#fff;font-weight:800">Sao chép sang v2</button>
      </div>
      <div style="font-size:10px;opacity:.7;margin-top:8px">Không xóa hoặc ghi đè khóa <code>bizon2026</code>.</div>`;
  }

  function mountPanel(options = {}) {
    const scope = options.scope || root;
    const documentLike = options.document || scope.document;
    const storage = options.storage || scope.localStorage;
    if (!documentLike || !enabled(options.location || scope.location)) return null;
    if (documentLike.getElementById(PANEL_ID)) return documentLike.getElementById(PANEL_ID);

    const initial = preview(storage, scope);
    const panel = documentLike.createElement('aside');
    panel.id = PANEL_ID;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'BizOn Core v2 migration tools');
    panel.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:99999;width:min(360px,calc(100vw - 28px));padding:14px;border-radius:16px;background:#eefdff;color:#033337;box-shadow:0 12px 40px rgba(0,51,55,.28);font-family:system-ui,sans-serif';
    panel.innerHTML = panelMarkup(initial);

    panel.addEventListener('click', (event) => {
      const action = event.target?.dataset?.action;
      if (!action) return;
      const status = panel.querySelector('[data-role="status"]');
      if (action === 'preview') {
        const result = preview(storage, scope);
        status.textContent = result.ok
          ? `Preview hợp lệ: ${result.state.session.sessionId}; vòng ${result.state.game.currentRound}; sẽ ghi ${result.targetKey}.`
          : `Preview thất bại: ${result.reason}.`;
      }
      if (action === 'migrate') {
        try {
          const result = migrateCopy(storage, scope);
          status.textContent = result.ok
            ? `Đã sao chép sang v2: ${result.targetKey}. Save cũ được giữ nguyên.`
            : `Không thể sao chép: ${result.reason}.`;
        } catch (error) {
          status.textContent = `Lỗi migration: ${error.message}.`;
        }
      }
    });

    documentLike.body.appendChild(panel);
    return panel;
  }

  function boot(options = {}) {
    if (!enabled(options.location || root.location)) return { enabled: false, mounted: false };
    const panel = mountPanel(options);
    return { enabled: true, mounted: Boolean(panel) };
  }

  return Object.freeze({ FLAG, ENABLE_VALUE, PANEL_ID, enabled, dependenciesAvailable, preview, migrateCopy, mountPanel, boot });
});
