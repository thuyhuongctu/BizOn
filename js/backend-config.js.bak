/* BizOn – Cấu hình backend Supabase (backend mỏng cho Pilot Classroom)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * CÁCH BẬT (5 phút, xem chi tiết docs/SUPABASE-SETUP.md):
 *  1. Tạo project miễn phí tại https://supabase.com
 *  2. SQL Editor → dán nội dung supabase/migrations/001_bizon_pilot.sql → Run
 *  3. Settings → API: chép "Project URL" và "anon public" key vào 2 dòng dưới
 *  4. Đổi enabled thành true, commit & đẩy lên như thường lệ
 *
 * Khi enabled=false game hoạt động hoàn toàn offline.
 * anon key là khóa CÔNG KHAI theo thiết kế của Supabase; không bao giờ dán
 * service_role key vào đây. */
window.BIZON_BACKEND = {
  enabled: true,
  url: 'https://ceytblfelodpnudomccn.supabase.co',
  anonKey: 'sb_publishable_5FPpCma_dVUs05K4hvahzQ_Yeq0bLJt',
};

/* Core v2 internal integration.
 * Mặc định không tải và không thay đổi gameplay/save production.
 * Bật bridge bằng ?coreV2=1.
 * Bật shadow sync bằng ?coreV2=1&shadowSync=1. */
(function loadCoreV2BehindFlag() {
  'use strict';
  let enabled = false;
  let shadowEnabled = false;
  try {
    const params = new URLSearchParams(window.location.search);
    enabled = params.get('coreV2') === '1';
    shadowEnabled = enabled && params.get('shadowSync') === '1';
  } catch (_) {
    enabled = false;
    shadowEnabled = false;
  }
  if (!enabled || !document?.head) return;

  const scripts = [
    'js/core/game-state.js',
    'js/core/persistence.js',
    'js/core/legacy-state-adapter.js',
    'js/core/core-v2-bridge.js'
  ];
  if (shadowEnabled) scripts.push('js/core/shadow-sync.js');

  function startCoreV2() {
    try { window.BizOnCoreV2Bridge?.boot(); }
    catch (error) { console.warn('[BizOn Core v2] bridge boot failed', error); }

    if (!shadowEnabled || !window.BizOnShadowSync) return;
    try {
      const controller = window.BizOnShadowSync.createController({
        storage: window.localStorage,
        intervalMs: 2000,
        persistShadow: true,
        onError: (error) => console.warn('[BizOn Core v2] shadow sync error', error)
      });
      controller.start();
      window.BIZON_CORE_V2_SHADOW = controller;
    } catch (error) {
      console.warn('[BizOn Core v2] shadow sync boot failed', error);
    }
  }

  function loadAt(index) {
    if (index >= scripts.length) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startCoreV2, { once: true });
      else startCoreV2();
      return;
    }
    const script = document.createElement('script');
    script.src = scripts[index];
    script.async = false;
    script.dataset.bizonCoreV2 = 'internal';
    script.onload = () => loadAt(index + 1);
    script.onerror = () => console.warn('[BizOn Core v2] failed to load', scripts[index]);
    document.head.appendChild(script);
  }

  loadAt(0);
})();
