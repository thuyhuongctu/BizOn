(() => {
  'use strict';
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');
  const installBtn = document.getElementById('installBtn');
  const networkLabel = document.getElementById('networkLabel');
  const saveLabel = document.getElementById('saveLabel');
  const timeline = document.getElementById('decisionTimeline');
  const demoDecisionBtn = document.getElementById('demoDecisionBtn');
  let deferredPrompt = null;

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem('bizon-app-theme', theme); } catch (_) {}
  }
  try { setTheme(localStorage.getItem('bizon-app-theme') || 'dark'); } catch (_) { setTheme('dark'); }
  themeBtn?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  function updateNetwork() {
    const online = navigator.onLine;
    if (networkLabel) networkLabel.textContent = online ? 'Trực tuyến' : 'Ngoại tuyến';
    if (saveLabel) saveLabel.textContent = online ? 'Ứng dụng sẵn sàng' : 'Đang dùng bản ngoại tuyến';
  }
  addEventListener('online', updateNetwork);
  addEventListener('offline', updateNetwork);
  updateNetwork();

  addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) installBtn.hidden = false;
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    deferredPrompt = null;
    installBtn.hidden = true;
  });
  addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installBtn) installBtn.hidden = true;
  });

  demoDecisionBtn?.addEventListener('click', () => {
    const item = document.createElement('li');
    item.innerHTML = '<span>R2</span><div><b>So sánh phương thức thâm nhập</b><small>Xuất khẩu 76 · Liên doanh 79 · Đầu tư trực tiếp 54</small></div>';
    timeline?.appendChild(item);
    demoDecisionBtn.disabled = true;
    demoDecisionBtn.textContent = 'Đã thêm';
  });

  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('./sw.js', { scope: './' })
      .catch(error => console.warn('[BizOn] Không thể đăng ký service worker', error)));
  }
})();
