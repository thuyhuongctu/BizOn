/* BizOn Bật Nghiệp 2026 — Service Worker (offline app shell)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */

const CACHE = 'bizon-v53';
const SHELL = [
  './',
  './index.html',
  './game.html',
  './thu-vien.html',
  './am-nhac.html',
  './gioi-thieu.html',
  './games.html',
  './doi-ngu.html',
  './global.html',
  './js/engine.js',
  './js/app.js',
  './js/site-ui.js',
  './manifest.webmanifest',
  './assets/character/lumina-ao-dai.png',
  './assets/character/lumina-ao-dai-clap.png',
  './assets/character/lumina-ao-dai-alert.png',
  './assets/character/lumina-vest.png',
  './assets/character/lumina-vest-worried.png',
  './assets/character/lumina-vest-thumbsup.png',
  './assets/illustrations/hero-vietnam-2026.png',
  './assets/illustrations/logo-splash.png',
  './assets/illustrations/login-clay.png',
  './assets/character/anh-tu-welcome.png',
  './assets/character/anh-tu-tablet.png',
  './assets/character/anh-tu-present.png',
  './assets/character/anh-tu-think.png',
  './assets/character/anh-tu-cheer.png',
  './assets/character/anh-tu-point.png',
  './assets/character/lumina-ao-dai-wave.png',
  './assets/character/anh-tu-open-arms.png',
  './assets/character/lumina-office-present.png',
  './assets/audio/huong-intro.mp3',
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
