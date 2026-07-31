/* BizOn Bật Nghiệp 2026 – Service Worker (offline app shell)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */

const CACHE = 'bizon-v207';
const SHELL = [
  './',
  './index.html',
  './game.html',
  './thu-vien.html',
  './am-nhac.html',
  './lumina.html',
  './hau-truong.html',
  './assets/character/advisors/lumina-nghe-nhac-vay-cut.png',
  './assets/character/advisors/lumina-nghe-nhac-vest-cut.png',
  './assets/character/advisors/lumina-chap-tay-cut.png',
  './assets/character/advisors/lumina-y-tuong-cut.png',
  './assets/character/advisors/lumina-vo-tay-cut.png',
  './assets/character/advisors/lumina-bien-co-thi-truong-cut.png',
  './gioi-thieu.html',
  './games.html',
  './doi-ngu.html',
  './global.html',
  './giai-phap.html',
  './lop-hoc.html',
  './giang-vien.html',
  './khao-sat-online.html',
  './brand-passport.html',
  './bang-chung.html',
  './hoc-thuat.html',
  './du-an.html',
  './tuyen-dung.html',
  './lien-he.html',
  './chinh-sach.html',
  './css/tw.css',
  './js/engine.js',
  './js/backend-config.js',
  './js/backend.js',
  './js/error-log.js',
  './js/tutorial.js',
  './js/site-dock.js',
  './js/site-footer.js',
  './js/app.js',
  './js/site-ui.js',
  './js/quiz-bank.js',
  './manifest.webmanifest',
  './assets/character/lumina-ao-dai.png',
  './assets/character/lumina-ao-dai-clap.png',
  './assets/character/lumina-ao-dai-alert.png',
  './assets/character/lumina-vest.png',
  './assets/character/lumina-vest-worried.png',
  './assets/character/lumina-vest-thumbsup.png',
  './assets/illustrations/hero-vietnam-2026.png',
  './assets/illustrations/arena-vietnam-map.png',
  './assets/illustrations/giai-dieu-bizon.jpg',
  './assets/illustrations/thuyen-sen-khoi-hanh.jpg',
  './assets/character/advisors/lumina-nghe-nhac-dung-cut.png',
  './assets/character/advisors/lumina-nghe-nhac-ngoi-cut.png',
  './assets/illustrations/globe-trade.png',
  './assets/illustrations/command-center.jpg',
  './assets/illustrations/team-holo-meeting.jpg',
  './assets/illustrations/logo-splash.png',
  './assets/illustrations/login-clay.png',
  './assets/character/anh-tu-ao-dai-welcome-cut.png',
  './assets/character/anh-tu-ao-dai-explain-cut.png',
  './assets/character/anh-tu-ao-dai-point-cut.png',
  './assets/character/anh-tu-ao-dai-work-cut.png',
  './assets/character/anh-tu-ao-dai-cut.png',
  './assets/character/anh-tu-ao-dai-smile-cut.png',
  './assets/character/anh-tu-suit-green.png',
  './assets/character/advisors/ba-sau-lanh-cut.png',
  './assets/character/advisors/victor-lam-cut.png',
  './assets/character/advisors/lina-park-cut.png',
  './assets/character/advisors/ba-sau-lanh-aodai-cut.png',
  './assets/character/advisors/victor-lam-aodai-cut.png',
  './assets/character/advisors/lina-park-aodai-cut.png',
  './assets/character/advisors/minh-khang-aodai-cut.png',
  './assets/character/advisors/an-nhien-aodai-cut.png',
  './assets/character/advisors/lumina-aodai-cut.png',
  './assets/character/advisors/lumina-vest-cut.png',
  './assets/character/advisors/an-nhien-cut.png',
  './assets/character/advisors/minh-khang-cut.png',
  './assets/character/advisors/victor-lam-doithuong-cut.png',
  './assets/character/firms/moc-nhien-cut.png',
  './assets/character/firms/mekong-digital-doithuong-cut.png',
  './assets/character/firms/phu-sa-foods-cut.png',
  './assets/character/firms/lam-viet-cut.png',
  './assets/character/firms/mekong-digital-cut.png',
  './assets/character/firms/moc-nhien-aodai-cut.png',
  './assets/character/firms/phu-sa-foods-aodai-cut.png',
  './assets/character/firms/lam-viet-aodai-cut.png',
  './assets/audio/brand-passport.mp3',
  './assets/character/rivals/alpha.png',
  './assets/character/rivals/mekong.png',
  './assets/character/rivals/star.png',
  './assets/character/team/lineup-cut.png',
  './assets/character/team/ceo-cut.png',
  './assets/character/team/cfo-cut.png',
  './assets/character/team/cmo-cut.png',
  './assets/character/team/coo-cut.png',
  './assets/character/team/sec-cut.png',
  './assets/character/anh-tu-ao-dai-welcome.jpg',
  './assets/character/anh-tu-ao-dai.jpg',
  './assets/character/anh-tu-ao-dai-smile.jpg',
  './assets/character/anh-tu-ao-dai-explain.jpg',
  './assets/character/anh-tu-ao-dai-work.jpg',
  './assets/character/anh-tu-ao-dai-point.jpg',
  './assets/character/lumina-ao-dai-wave.png',
  './assets/character/lumina-ao-dai-present.png',
  './assets/character/lumina-office-present.png',
  './assets/character/lumina-ao-dai-cheer.png',
  './assets/character/lumina-ao-dai-thumbsup.png',
  './assets/character/lumina-knit-thumbsup.png',
  './assets/character/lumina-office-welcome.png',
  './assets/docs/sig-huong.png',
  './assets/docs/sig-tu.png',
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

// Chiến lược theo loại tài nguyên (không bao giờ trả index.html cho request không phải điều hướng):
//  - Điều hướng HTML: network-first → cache trang đó → index.html (chỉ ở đây mới fallback index)
//  - Ảnh: stale-while-revalidate (trả cache ngay, cập nhật nền)
//  - Audio/video: cache-on-demand (không cache phản hồi 206 Range)
//  - JS/CSS/font/còn lại: cache-first theo phiên bản CACHE, lỗi mạng thì báo lỗi thật
function putIfOk(req, res) {
  if (res && res.ok && res.status === 200) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
  }
  return res;
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // CDN/fonts: để trình duyệt tự xử lý

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => putIfOk(e.request, res))
        .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  const dest = e.request.destination;
  if (dest === 'image') {
    e.respondWith(
      caches.match(e.request).then(hit => {
        const net = fetch(e.request).then(res => putIfOk(e.request, res)).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }
  if (dest === 'audio' || dest === 'video') {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => putIfOk(e.request, res))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => putIfOk(e.request, res))));
});
