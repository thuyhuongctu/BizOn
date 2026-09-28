/* BizOn – service worker: cache tĩnh, luôn lấy mạng trước cho HTML/JS để nhận bản mới. */
const V = 'bizon-3d-v2';
const CORE = ['BizOn%20Game%203D.html', 'Trang%20Giang%20Vien.dc.html', 'game.html', 'support.js', 'bizon-characters.js', 'bizon-hq-kit.js', 'bizon-products.js', 'bizon-mascots.js', 'js/app.js', 'js/engine.js', 'js/backend.js', 'js/backend-config.js', 'js/class-sync.js', 'js/instructor-api.js', 'js/instructor-page.js', 'assets/icons/icon-192.png', 'vendor/three/three.module.js', 'vendor/three/three.core.js', 'vendor/three/OrbitControls.js', 'assets/illustrations/rong-bay-doi-bizon.webp', 'assets/character/rong-xanh.webp', 'assets/character/rong-xanh-sen.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.allSettled(CORE.map(u => c.add(u))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k.startsWith('bizon-3d')).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || /supabase\.co$/.test(u.hostname)) return;
  const net = () => fetch(e.request).then(r => { if (r.ok && (u.origin === location.origin || /unpkg|jsdelivr|fonts\.g/.test(u.hostname))) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); } return r; });
  const html = e.request.mode === 'navigate' || /\.(html|js)$/.test(u.pathname);
  e.respondWith(html ? net().catch(() => caches.match(e.request)) : caches.match(e.request).then(r => r || net()));
});
