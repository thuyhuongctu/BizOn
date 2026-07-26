/* BizOn Bật Nghiệp 2026 — Service Worker (offline app shell)
 * © 2026 Đỗ Thùy Hương (Je m'appelle Hương) & Phan Anh Tú. Bảo lưu mọi quyền. */

const CACHE = 'bizon-v2';
const SHELL = [
  './',
  './index.html',
  './js/engine.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/character/lumina-ao-dai.png',
  './assets/character/lumina-ao-dai-clap.png',
  './assets/character/lumina-ao-dai-alert.png',
  './assets/character/lumina-vest.png',
  './assets/character/lumina-vest-worried.png',
  './assets/character/lumina-vest-thumbsup.png',
  './assets/illustrations/hero-vietnam-2026.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first cho app shell; network-first (có fallback cache) cho phần còn lại
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      if (res.ok && e.request.url.startsWith(self.location.origin)) {
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
