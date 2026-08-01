/* BizOn – Cấu hình backend Supabase (backend mỏng cho Pilot Classroom)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * CÁCH BẬT (5 phút, xem chi tiết docs/SUPABASE-SETUP.md):
 *  1. Tạo project miễn phí tại https://supabase.com
 *  2. SQL Editor → dán nội dung supabase/migrations/001_bizon_pilot.sql → Run
 *  3. Settings → API: chép "Project URL" và "anon public" key vào 2 dòng dưới
 *  4. Đổi enabled thành true, commit & đẩy lên như thường lệ
 *
 * Khi enabled=false game hoạt động y hệt hiện tại – hoàn toàn offline.
 * anon key là khóa CÔNG KHAI theo thiết kế của Supabase; không bao giờ dán
 * service_role key vào đây. */
window.BIZON_BACKEND = {
  enabled: true,
  url: 'https://ceytblfelodpnudomccn.supabase.co',
  anonKey: 'sb_publishable_5FPpCma_dVUs05K4hvahzQ_Yeq0bLJt',
};

/* AIBIS private/staging feature flags.
 * Shadow mode runs beside legacy Go Global and never changes visible scores.
 * Telemetry remains OFF until consent UI, migration and pilot protocol pass.
 */
window.BIZON_AIBIS = Object.freeze({
  enabled: true,
  shadowMode: true,
  uploadTelemetry: false,
  diagnosticsByUrlOnly: true,
  researchModeByUrlOnly: true,
  engineVersion: '0.1.0'
});

(function loadAIBISFoundation() {
  const config = window.BIZON_AIBIS;
  const isGlobalPage = /(?:^|\/)global\.html$/.test(window.location.pathname);
  if (!config.enabled || !config.shadowMode || !isGlobalPage) return;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('Cannot load ' + src)); };
      document.head.appendChild(script);
    });
  }

  window.addEventListener('load', function () {
    const params = new URLSearchParams(window.location.search);
    loadScript('js/aibis-core.js')
      .then(function () { return loadScript('js/aibis-parameters.js'); })
      .then(function () { return loadScript('js/aibis-parity.js'); })
      .then(function () { return loadScript('js/aibis-telemetry.js'); })
      .then(function () { return loadScript('js/aibis-adapter.js'); })
      .then(function () {
        if (params.get('debugAIBIS') === '1') return loadScript('js/aibis-diagnostics.js');
      })
      .then(function () {
        if (params.get('researchAIBIS') === '1') return loadScript('js/aibis-research-ui.js');
      })
      .catch(function (error) {
        console.warn('[AIBIS] Foundation disabled:', error.message);
      });
  }, { once: true });
})();
