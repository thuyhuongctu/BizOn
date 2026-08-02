/* BizOn Bật Nghiệp 2026 – Service Worker (offline app shell)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */

const CACHE = 'bizon-v231';
const SHELL = [
  './',
  './index.html',
  './game.html',
  './thu-vien.html',
  './am-nhac.html',
  './lumina.html',
  './hau-truong.html',
  './assets/character/advisors/lumina-chap-tay-cut.webp',
  './assets/character/advisors/lumina-y-tuong-cut.webp',
  './assets/character/advisors/lumina-vo-tay-cut.webp',
  './assets/character/advisors/lumina-bien-co-thi-truong-cut.webp',
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
  // Phông tự host. Nạp sẵn cả bảng khai báo lẫn hai tập ký tự mà trang tiếng Việt
  // thật sự dùng, để lần mở offline vẫn đúng kiểu chữ chứ không rơi về phông hệ thống.
  // Tập 'latin-ext' cố ý bỏ ngoài danh sách: hiếm khi cần, để dành băng thông cài đặt.
  './css/bizon-fonts.css',
  './assets/fonts/Manrope-var-vietnamese.woff2',
  './assets/fonts/Manrope-var-latin.woff2',
  './assets/fonts/PlusJakartaSans-var-vietnamese.woff2',
  './assets/fonts/PlusJakartaSans-var-latin.woff2',
  './js/engine.js',
  './js/backend-config.js',
  './js/backend.js',
  './js/error-log.js',
  './js/tutorial.js',
  './js/site-dock.js',
  './js/site-footer.js',
  './js/app.js',
  './js/site-ui.js',
  './js/site-tour.js',
  './js/site-vnmap.js',
  './js/quiz-bank.js',
  './manifest.webmanifest',
  './assets/character/lumina-ao-dai.webp',
  './assets/character/lumina-ao-dai-clap.webp',
  './assets/character/lumina-ao-dai-alert.webp',
  './assets/character/lumina-vest.webp',
  './assets/character/lumina-vest-worried.webp',
  './assets/character/lumina-vest-thumbsup.webp',
  './assets/illustrations/hero-vietnam-2026.webp',
  './assets/illustrations/arena-vietnam-map-v2.webp',
  './assets/illustrations/giai-dieu-bizon.webp',
  './assets/illustrations/thuyen-sen-khoi-hanh.webp',
  './assets/character/advisors/lumina-nghe-nhac-dung-cut.webp',
  './assets/character/advisors/lumina-nghe-nhac-ngoi-cut.webp',
  './assets/character/bizon-duo-music.webp',
  './assets/character/bizon-duo-phong-thu-cut.webp',
  './assets/illustrations/bizon-music-studio.webp',
  './assets/illustrations/phong-thu-bizon.webp',
  './assets/illustrations/globe-trade.webp',
  './assets/illustrations/command-center.webp',
  './assets/illustrations/team-holo-meeting.webp',
  './assets/illustrations/logo-splash.webp',
  './assets/illustrations/login-clay.webp',
  './assets/character/anh-tu-ao-dai-welcome-cut.webp',
  './assets/character/anh-tu-ao-dai-explain-cut.webp',
  './assets/character/anh-tu-ao-dai-point-cut.webp',
  './assets/character/anh-tu-ao-dai-work-cut.webp',
  './assets/character/anh-tu-ao-dai-cut.webp',
  './assets/character/anh-tu-ao-dai-smile-cut.webp',
  './assets/character/anh-tu-suit-green.webp',
  './assets/character/advisors/ba-sau-lanh-cut.webp',
  './assets/character/advisors/victor-lam-cut.webp',
  './assets/character/advisors/lina-park-cut.webp',
  './assets/character/advisors/ba-sau-lanh-aodai-cut.webp',
  './assets/character/advisors/victor-lam-aodai-cut.webp',
  './assets/character/advisors/lina-park-aodai-cut.webp',
  './assets/character/advisors/minh-khang-aodai-cut.webp',
  './assets/character/advisors/an-nhien-aodai-cut.webp',
  './assets/character/advisors/lumina-aodai-cut.webp',
  './assets/character/advisors/lumina-vest-cut.webp',
  './assets/character/advisors/an-nhien-cut.webp',
  './assets/character/advisors/minh-khang-cut.webp',
  './assets/character/advisors/victor-lam-doithuong-cut.webp',
  './assets/character/firms/moc-nhien-cut.webp',
  './assets/character/firms/mekong-digital-doithuong-cut.webp',
  './assets/character/firms/phu-sa-foods-cut.webp',
  './assets/character/firms/lam-viet-cut.webp',
  './assets/character/firms/mekong-digital-cut.webp',
  './assets/character/firms/moc-nhien-aodai-cut.webp',
  './assets/character/firms/phu-sa-foods-aodai-cut.webp',
  './assets/character/firms/lam-viet-aodai-cut.webp',
  // Bài chủ đề game Hộ Chiếu Thương Hiệu – nạp sẵn để mở offline vẫn có nhạc.
  // 7,1MB: đây là mục nặng nhất trong danh sách, cân nhắc bỏ nếu muốn rút ngắn
  // thời gian cài đặt (nhạc vẫn tải và lưu đệm ngay lần đầu người chơi bật).
  './assets/audio/ho-chieu-p3-en-remix2.mp3',
  './assets/character/rivals/alpha.webp',
  './assets/character/rivals/mekong.webp',
  './assets/character/rivals/star.webp',
  './assets/character/team/lineup-cut.webp',
  './assets/character/team/ceo-cut.webp',
  './assets/character/team/cfo-cut.webp',
  './assets/character/team/cmo-cut.webp',
  './assets/character/team/coo-cut.webp',
  './assets/character/team/sec-cut.webp',
  './assets/character/anh-tu-ao-dai-welcome.webp',
  './assets/character/anh-tu-ao-dai.webp',
  './assets/character/anh-tu-ao-dai-smile.jpg',
  './assets/character/anh-tu-ao-dai-explain.webp',
  './assets/character/anh-tu-ao-dai-work.webp',
  './assets/character/anh-tu-ao-dai-point.webp',
  './assets/character/lumina-ao-dai-wave.webp',
  './assets/character/lumina-ao-dai-present.webp',
  './assets/character/lumina-office-present.webp',
  './assets/character/lumina-ao-dai-cheer.webp',
  './assets/character/lumina-ao-dai-thumbsup.webp',
  './assets/character/lumina-office-welcome.webp',
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
//
// QUY TẮC KHI SỬA NỘI DUNG MỘT TẤM ẢNH: phải ĐỔI TÊN TỆP, ví dụ thêm hậu tố
// "-v2". Ảnh dùng stale-while-revalidate nên trình duyệt trả bản trong cache
// trước rồi mới tải bản mới về dùng cho lần sau. Giữ nguyên tên thì người đã
// từng mở trang vẫn thấy ảnh cũ, và tăng số CACHE ở trên cũng không cứu được:
// service worker cũ còn phục vụ cho tới khi bản mới kích hoạt, chưa kể cache
// HTTP của trình duyệt hoạt động độc lập. Tên mới là URL mới nên không thể
// trúng bản đệm cũ. (Đổi tên tệp – không phải thêm ?v= – vì query string bị
// một số proxy và trình duyệt bỏ qua khi đối chiếu cache.)
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
