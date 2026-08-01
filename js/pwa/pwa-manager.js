(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnPWA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  let deferredInstallPrompt = null;
  let registration = null;
  const listeners = new Map();

  function emit(type, detail = {}) {
    const event = { type, detail, timestamp: new Date().toISOString() };
    (listeners.get(type) || []).forEach((listener) => {
      try { listener(event); } catch (_) {}
    });
    if (root?.dispatchEvent && typeof CustomEvent === 'function') {
      root.dispatchEvent(new CustomEvent(`bizon:pwa:${type}`, { detail: event }));
    }
    return event;
  }

  function on(type, listener) {
    if (typeof listener !== 'function') throw new Error('listener_required');
    const group = listeners.get(type) || [];
    group.push(listener);
    listeners.set(type, group);
    return () => listeners.set(type, (listeners.get(type) || []).filter((item) => item !== listener));
  }

  function isStandalone() {
    return Boolean(
      root?.matchMedia?.('(display-mode: standalone)').matches ||
      root?.navigator?.standalone === true
    );
  }

  async function install() {
    if (!deferredInstallPrompt) return { available: false, outcome: 'unavailable' };
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    emit('install-choice', choice);
    return { available: true, ...choice };
  }

  function canInstall() {
    return Boolean(deferredInstallPrompt) && !isStandalone();
  }

  function applyUpdate() {
    if (!registration?.waiting) return false;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return true;
  }

  async function register(options = {}) {
    const navigatorRef = options.navigator || root?.navigator;
    if (!navigatorRef?.serviceWorker) {
      emit('unsupported');
      return null;
    }

    registration = await navigatorRef.serviceWorker.register(options.url || './sw.js', {
      scope: options.scope || './'
    });

    if (registration.waiting) emit('update-ready', { registration });

    registration.addEventListener?.('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener?.('statechange', () => {
        if (worker.state === 'installed' && navigatorRef.serviceWorker.controller) {
          emit('update-ready', { registration });
        }
      });
    });

    navigatorRef.serviceWorker.addEventListener?.('controllerchange', () => {
      emit('updated');
      if (options.reloadOnUpdate !== false) root?.location?.reload?.();
    });

    emit('registered', { scope: registration.scope });
    return registration;
  }

  function boot(options = {}) {
    root?.addEventListener?.('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      emit('install-available');
    });

    root?.addEventListener?.('appinstalled', () => {
      deferredInstallPrompt = null;
      emit('installed');
    });

    root?.addEventListener?.('online', () => emit('online'));
    root?.addEventListener?.('offline', () => emit('offline'));

    return register(options).catch((error) => {
      emit('registration-error', { message: error?.message || String(error) });
      return null;
    });
  }

  return Object.freeze({
    boot,
    register,
    install,
    canInstall,
    isStandalone,
    applyUpdate,
    on,
    getRegistration: () => registration
  });
});
