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
 * Chỉ bật khi URL có ?coreV2=1. */
(function loadCoreV2BehindFlag() {
  'use strict';
  let enabled = false;
  try { enabled = new URLSearchParams(window.location.search).get('coreV2') === '1'; }
  catch (_) { enabled = false; }
  if (!enabled || !document?.head) return;

  const scripts = [
    'js/core/game-state.js',
    'js/core/persistence.js',
    'js/core/legacy-state-adapter.js',
    'js/core/core-v2-bridge.js'
  ];

  function loadAt(index) {
    if (index >= scripts.length) {
      const start = () => window.BizOnCoreV2Bridge?.boot();
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
      else start();
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
