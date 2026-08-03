(() => {
  'use strict';

  if (!document.querySelector('script[data-bizon-existing-assets]')) {
    const existingAssets = document.createElement('script');
    existingAssets.src = document.currentScript?.src
      ? new URL('./existing-assets.js', document.currentScript.src).href
      : '../js/app-shell/existing-assets.js';
    existingAssets.defer = true;
    existingAssets.dataset.bizonExistingAssets = 'true';
    document.head.appendChild(existingAssets);
  }

  if (!document.querySelector('link[data-bizon-overrides]')) {
    const overrides = document.createElement('link');
    overrides.rel = 'stylesheet';
    overrides.href = '../css/bizon-unified-overrides.css';
    overrides.dataset.bizonOverrides = 'true';
    document.head.appendChild(overrides);
  }

  const installButton = document.querySelector('[data-install-app]');
  const networkNodes = document.querySelectorAll('[data-network-status]');
  const menuButton = document.querySelector('[data-mobile-menu]');
  const mobileMenu = document.querySelector('[data-mobile-panel]');
  let deferredPrompt = null;

  const setNetworkState = () => {
    const online = navigator.onLine;
    networkNodes.forEach(node => {
      node.textContent = online ? 'Trực tuyến' : 'Ngoại tuyến';
      node.dataset.state = online ? 'online' : 'offline';
    });
  };

  window.addEventListener('online', setNetworkState);
  window.addEventListener('offline', setNetworkState);
  setNetworkState();

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  installButton?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    deferredPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installButton) installButton.hidden = true;
  });

  menuButton?.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    if (mobileMenu) mobileMenu.hidden = expanded;
  });

  document.querySelectorAll('[data-scroll-target]').forEach(button => {
    button.addEventListener('click', event => {
      const target = document.querySelector(button.dataset.scrollTarget);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const panels = [...document.querySelectorAll(`[data-tab-panel="${group.dataset.tabGroup}"]`)];
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(item => {
          const selected = item === tab;
          item.setAttribute('aria-selected', String(selected));
          item.classList.toggle('active', selected);
        });
        panels.forEach(panel => {
          panel.hidden = panel.dataset.tabValue !== tab.dataset.tabValue;
        });
      });
    });
  });

  // Keep the installed Web/PWA experience inside the unified app shell.
  // The legacy dashboard remains accessible from Instructor Studio for fallback and comparison.
  if (!location.pathname.endsWith('/app/instructor-studio.html')) {
    document.querySelectorAll('a[href="../giang-vien.html"], a[href="/BizOn/giang-vien.html"]').forEach(link => {
      link.href = './instructor-studio.html';
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
    });
  }
})();
