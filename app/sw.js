const CACHE_NAME = 'bizon-app-shell-v2';
const APP_SHELL = [
  './',
  './release.html',
  './index.html',
  './brand-passport.html',
  './aibis.html',
  './manifest.webmanifest',
  './offline.html',
  '../css/app-shell.css',
  '../css/aibis-app.css',
  '../css/bizon-fonts.css',
  '../js/app-shell/app-shell.js',
  '../js/app-shell/aibis-workspace.js',
  '../assets/icons/icon-192.png',
  '../assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('bizon-app-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then(response => {
        if (response.ok && url.pathname.includes('/app/')) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match('./offline.html'))));
    return;
  }

  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    if (response.ok && response.status === 200 && url.pathname.includes('/app/')) {
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    }
    return response;
  })));
});
