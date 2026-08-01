/* BizOn Service Worker v3 – production PWA foundation
 * Offline-first for the app shell; runtime caching for heavy assets.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */

const VERSION = 'v3.0.0';
const PREFIX = 'bizon';
const CACHES = {
  shell: `${PREFIX}-shell-${VERSION}`,
  pages: `${PREFIX}-pages-${VERSION}`,
  assets: `${PREFIX}-assets-${VERSION}`,
  media: `${PREFIX}-media-${VERSION}`
};

const APP_SHELL = [
  './',
  './index.html',
  './app-shell-preview.html',
  './offline.html',
  './manifest.webmanifest',
  './css/tw.css',
  './css/bizon-fonts.css',
  './css/app-shell-preview.css',
  './js/site-ui.js',
  './js/pwa/pwa-manager.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

const MAX_ENTRIES = {
  pages: 24,
  assets: 120,
  media: 24
};

async function trimCache(name, maxEntries) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

async function cachePut(cacheName, request, response, maxEntries) {
  if (!response || !response.ok || response.status !== 200) return response;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  if (maxEntries) await trimCache(cacheName, maxEntries);
  return response;
}

async function networkFirst(request, cacheName, fallback) {
  try {
    const response = await fetch(request);
    return await cachePut(cacheName, request, response, MAX_ENTRIES.pages);
  } catch (_) {
    return (await caches.match(request)) || (await caches.match(fallback));
  }
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => cachePut(cacheName, request, response, maxEntries))
    .catch(() => null);
  return cached || network || Response.error();
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    return await cachePut(cacheName, request, response, maxEntries);
  } catch (_) {
    return Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHES.shell)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set(Object.values(CACHES));
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(`${PREFIX}-`) && !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: VERSION });
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHES.pages, './offline.html'));
    return;
  }

  const destination = request.destination;

  if (destination === 'style' || destination === 'script' || destination === 'font') {
    event.respondWith(staleWhileRevalidate(request, CACHES.assets, MAX_ENTRIES.assets));
    return;
  }

  if (destination === 'image') {
    event.respondWith(staleWhileRevalidate(request, CACHES.assets, MAX_ENTRIES.assets));
    return;
  }

  if (destination === 'audio' || destination === 'video') {
    if (request.headers.has('range')) return;
    event.respondWith(cacheFirst(request, CACHES.media, MAX_ENTRIES.media));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, CACHES.assets, MAX_ENTRIES.assets));
});
