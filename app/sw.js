// App shell V7 adds the scoped Instructor Studio while preserving approved BizOn artwork offline.
const CACHE_NAME = 'bizon-app-shell-v7';
const APP_SCOPE_PREFIX = '/BizOn/';
const APP_SHELL = [
  './',
  './release.html',
  './command-center.html',
  './instructor-studio.html',
  './index.html',
  './brand-passport.html',
  './aibis.html',
  './version.json',
  './manifest.webmanifest',
  './offline.html',
  '../css/app-shell.css',
  '../css/aibis-app.css',
  '../css/bizon-fonts.css',
  '../css/bizon-unified.css',
  '../css/bizon-unified-overrides.css',
  '../css/bizon-existing-assets.css',
  '../css/bizon-instructor-studio.css',
  '../js/backend-config.js',
  '../js/app-shell/app-shell.js',
  '../js/app-shell/aibis-workspace.js',
  '../js/app-shell/unified-app.js',
  '../js/app-shell/existing-assets.js',
  '../js/app-shell/instructor-studio.js',
  '../js/app-shell/update-manager.js',
  '../assets/approved-existing-assets.json',
  '../assets/illustrations/lumina-holo-classroom.webp',
  '../assets/illustrations/anh-tu-lecture-hall.webp',
  '../assets/character/lumina-office-present.webp',
  '../assets/illustrations/arena-vietnam-map-v2.webp',
  '../assets/illustrations/hero-vietnam-2026.webp',
  '../assets/illustrations/cast-sheet-brand-passport.webp',
  '../assets/illustrations/giai-dieu-bizon.webp',
  '../assets/icons/icon-192.png',
  '../assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('bizon-app-shell-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_APP_CACHE') {
    event.waitUntil(
      caches.keys().then(keys => Promise.all(
        keys.filter(key => key.startsWith('bizon-app-shell-')).map(key => caches.delete(key))
      ))
    );
  }
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (_) {
    return (await cache.match(request)) || (fallbackUrl ? cache.match(fallbackUrl) : Response.error());
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async response => {
      if (response.ok && response.status === 200) await cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || network || Response.error();
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.headers.has('range')) return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_SCOPE_PREFIX)) return;

  if (url.pathname.endsWith('/app/version.json')) {
    const freshRequest = new Request(event.request, { cache: 'no-store' });
    event.respondWith(networkFirst(freshRequest, './version.json'));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, './offline.html'));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
