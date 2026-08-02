(() => {
  'use strict';

  const VERSION_URL = './version.json';
  const CURRENT_BUILD = '2026.08.02.3';
  const DISMISSED_BUILD_KEY = 'bizon.dismissedWebBuild';
  const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
  const root = document.documentElement;
  const currentBuild = CURRENT_BUILD;
  const card = document.getElementById('updateCard');
  const title = document.getElementById('updateTitle');
  const summary = document.getElementById('updateSummary');
  const updateButton = document.getElementById('updateNow');
  const laterButton = document.getElementById('updateLater');
  let availableVersion = null;
  let reloading = false;

  // Keep the runtime DOM marker current without rewriting the large launcher HTML for every release slice.
  root.dataset.bizonBuild = CURRENT_BUILD;

  function numericBuildParts(value) {
    return String(value)
      .split('.')
      .map(part => Number.parseInt(part, 10))
      .map(part => Number.isFinite(part) ? part : 0);
  }

  function isNewerBuild(candidate, installed) {
    const next = numericBuildParts(candidate);
    const current = numericBuildParts(installed);
    const length = Math.max(next.length, current.length);
    for (let index = 0; index < length; index += 1) {
      const left = next[index] || 0;
      const right = current[index] || 0;
      if (left > right) return true;
      if (left < right) return false;
    }
    return false;
  }

  function hideCard() {
    if (card) card.hidden = true;
  }

  function showCard(version) {
    if (!card || !title || !summary || !updateButton || !laterButton) return;
    const dismissedBuild = localStorage.getItem(DISMISSED_BUILD_KEY);
    if (!version.force_refresh && dismissedBuild === version.build_id) return;

    availableVersion = version;
    title.textContent = version.title || 'Có phiên bản BizOn mới';
    summary.textContent = version.summary || 'Cập nhật để sử dụng giao diện và nội dung mới nhất.';
    laterButton.hidden = Boolean(version.force_refresh);
    card.hidden = false;
  }

  async function fetchVersion() {
    const requestUrl = new URL(VERSION_URL, window.location.href);
    requestUrl.searchParams.set('check', Date.now().toString());
    const response = await fetch(requestUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error(`Version check failed: ${response.status}`);
    const version = await response.json();
    if (!version || typeof version.build_id !== 'string') {
      throw new Error('Invalid version manifest');
    }
    return version;
  }

  async function checkForUpdate() {
    if (!navigator.onLine) return;
    try {
      const version = await fetchVersion();
      if (isNewerBuild(version.build_id, currentBuild)) showCard(version);
      else hideCard();
    } catch (_) {
      // Version checks are non-blocking. The application remains usable offline.
    }
  }

  async function clearBizOnCaches() {
    if (!('caches' in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('bizon-app-shell-'))
      .map(key => caches.delete(key)));
  }

  async function applyUpdate() {
    if (!availableVersion || reloading) return;
    reloading = true;
    updateButton.disabled = true;
    updateButton.textContent = 'Đang cập nhật…';

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('./');
        if (registration) {
          await registration.update();
          const worker = registration.waiting || registration.installing;
          if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
        }
      }
      await clearBizOnCaches();
      localStorage.removeItem(DISMISSED_BUILD_KEY);
      window.location.reload();
    } catch (_) {
      reloading = false;
      updateButton.disabled = false;
      updateButton.textContent = 'Thử lại';
      summary.textContent = 'Chưa thể cập nhật. Hãy kiểm tra kết nối mạng rồi thử lại.';
    }
  }

  function dismissUpdate() {
    if (availableVersion) {
      localStorage.setItem(DISMISSED_BUILD_KEY, availableVersion.build_id);
    }
    hideCard();
  }

  updateButton?.addEventListener('click', applyUpdate);
  laterButton?.addEventListener('click', dismissUpdate);
  window.addEventListener('online', checkForUpdate);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    if (!reloading) return;
    window.location.reload();
  });

  checkForUpdate();
  window.setInterval(checkForUpdate, CHECK_INTERVAL_MS);
})();
