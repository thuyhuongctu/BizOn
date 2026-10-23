/* BizOn Bật Nghiệp 2026 – Service Worker (offline app shell)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */

const CACHE = 'bizon-v585';
const SHELL = [
  './',
  './index.html',
  './game.html',
  './ben-phu-sa.html',
  './ben-phu-sa-3d.html',
  './ben-phu-sa-v8.html',
  './Ben Phu Sa Game v4 Nhom.dc.html',
  './Bang Giao Vien.dc.html',
  './Trang Giang Vien.dc.html',
  './nhac-ben-phu-sa.html',
  './lab/cmr-lab.html',
  './lab/cvp-studio.html',
  './lab/bo-do-tien-quyet.html',
  './lab/gravity-lab.html',
  './lab/gravity-lab-engine.js',
  './lab/gravity-lab-data.js',
  './lab/nha-may-fdi.html',
  './lab/nha-may-fdi-engine.js',
  './lab/nha-may-fdi-data.js',
  './lab/ie-lab.html',
  './lab/ie-lab.js',
  './assets/fonts/Baloo2-var-vietnamese.woff2',
  './assets/fonts/Baloo2-var-latin.woff2',
  './assets/fonts/Nunito-var-vietnamese.woff2',
  './assets/fonts/Nunito-var-latin.woff2',
  './ho-chieu-sau-rieng.html',
  './lab/ho-chieu-sau-rieng.html',
  './lab/ho-chieu-sau-rieng-3d.html',
  './lab/ho-chieu-sau-rieng-engine.js',
  './lab/ho-chieu-sau-rieng-core.js',
  './lab/ho-chieu-sau-rieng-data.js',
  './js/durian-voice.js',
  './js/vendor/three.module.js',
  './js/vendor/three.core.js',
  './js/poly3d-kit.js',
  './thu-vien.html',
  './am-nhac.html',
  './lumina.html',
  './hau-truong.html',
  './gioi-thieu.html',
  './games.html',
  './demo.html',
  './doi-ngu.html',
  './global.html',
  './giai-phap.html',
  './lop-hoc.html',
  './khao-sat-online.html',
  './brand-passport.html',
  './ho-chieu-thuong-hieu.html',
  './Ho Chieu Thuong Hieu 3D.html',
  './Ho Chieu Mini 3D.html',
  './Ho Chieu Mini.dc.html',
  // three.min.js (~670KB) CỐ Ý không nằm trong SHELL – trang thử nghiệm này
  // không nên làm nặng lượt cài đặt của mọi người chơi khác; sẽ được đệm vào
  // cache ở lượt tải đầu tiên khi ai đó thực sự mở trang qua handler chung.
  './hub-3d.html',
  './js/hub3d.js',
  './huong-dan.html',
  './bang-chung.html',
  './dinh-huong.html',
  './hoc-thuat.html',
  './truong-hoc-thuat.html',
  './du-an.html',
  './tuyen-dung.html',
  './lien-he.html',
  './giang-vien.html',
  './bao-chi.html',
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
  // Bản đất sét (Claymorphism): hệ thống thiết kế + phông thân Be Vietnam Pro.
  './css/bizon-clay-fonts.css',
  './css/bizon-clay.css',
  './css/clay-tool-skin.css',
  './css/clay-legacy.css',
  './css/bizon-clay-chrome.css',
  './js/bizon-clay-bridge.js',
  './css/clay-dark-skin.css',
  './css/clay-vietlens-skin.css',
  './assets/fonts/BeVietnamPro-400-vietnamese.woff2',
  './assets/fonts/BeVietnamPro-400-latin.woff2',
  './assets/fonts/BeVietnamPro-700-vietnamese.woff2',
  './assets/fonts/BeVietnamPro-700-latin.woff2',
  './assets/fonts/BeVietnamPro-800-vietnamese.woff2',
  './assets/fonts/BeVietnamPro-800-latin.woff2',
  './js/vendor/gsap.min.js',
  './js/engine.js',
  './js/core/seed-engine.js',
  './js/backend-config.js',
  './js/backend.js',
  './js/student-login.js',
  './js/error-log.js',
  './js/tutorial.js',
  './js/bp-tutorial.js',
  './js/bp-rival-intel.js',
  './js/bps-rival-intel.js',
  './js/clay-hub.js',
  './js/bp-hub.js',
  './js/bps-hub.js',
  './js/bps-hub-nhom.js',
  './js/negotiate.js',
  './js/bp-negotiate.js',
  './js/bps-negotiate.js',
  './js/bn-negotiate.js',
  './js/official-cert.js',
  './js/lumina-mascot.js',
  './js/site-dock.js',
  './js/site-footer.js',
  './js/site-nav.js',
  './js/site-people.js',
  './js/site-nethero.js',
  './js/app.js',
  './js/game3d-login-gate.js',
  './js/game3d-globe.js',
  './js/office-rounds.js',
  './js/site-ui.js',
  './js/bizon-lang.js',
  './js/capture-guard.js',
  './js/site-tour.js',
  './js/site-vnmap.js',
  './js/bizon-boot.js',
  './js/bizon-clay-i18n.js',
  './js/bizon-clay-nav.js',
  './js/bizon-clay-footer.js',
  './js/music-data.js',
  './js/music-lyrics.js',
  './js/am-nhac-clay.js',
  './js/am-mv.js',
  './js/thu-vien-data.js',
  './js/thu-vien-data-en.js',
  './js/thu-vien-clay.js',
  './js/lop-hoc-data.js',
  './js/lop-hoc-data-en.js',
  './js/lop-hoc-clay.js',
  './js/golden-silt-lyrics.js',
  './js/quiz-bank.js',
  './js/quiz-bank-en.js',
  './js/games-clay.js',
  './js/bps3d.js',
  './js/bps3d-v3.js',
  './js/bps3d-npc.js',
  './js/ghe-phu-sa.js',
  './bp3d-boat/model-boat.js',
  './bp3d-boat/model-huong.js',
  './bp3d-boat/model-tu.js',
  './bp3d-boat/model-ghe-mui.js',
  './bp3d-boat/model-ghe-cargo.js',
  './bp3d-boat/model-team.js',
  './js/bps-voice.js',
  './js/bps-cast.js',
  './js/bps-exam.js',
  './js/bps-extras.js',
  './js/bps-hotseat.js',
  './js/bps3d-bridge.js',
  './support.js',
  './vendor/peerjs/peerjs.min.js',
  './vendor/three/three.module.js',
  './vendor/three/three.core.js',
  './vendor/three/OrbitControls.js',
  './vendor/react/react.production.min.js',
  './vendor/react/react-dom.production.min.js',
  './css/bizon-fonts-v8.css',
  './manifest.webmanifest',
  './manifest-brand-passport.webmanifest',
  // Ảnh (webp/png/jpg/svg) và PDF không nạp sẵn: tải lần đầu người chơi mở tới rồi
  // nằm trong IMG_CACHE (bên dưới), không bị xoá khi tăng CACHE.
  // Bài chủ đề game Hộ Chiếu Thương Hiệu – nạp sẵn để mở offline vẫn có nhạc.
  // 7,1MB: đây là mục nặng nhất trong danh sách, cân nhắc bỏ nếu muốn rút ngắn
  // thời gian cài đặt (nhạc vẫn tải và lưu đệm ngay lần đầu người chơi bật).
  // Bài chủ đề game Hộ Chiếu Sầu Riêng – nạp sẵn để mở offline vẫn có nhạc.
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

// Ảnh và PDF: cache riêng, không gắn số phiên bản nên không bị xoá khi tăng CACHE.
// An toàn vì quy tắc đổi tên tệp khi sửa ảnh (xem putIfOk); giới hạn số mục để không phình mãi.
const IMG_CACHE = 'bizon-img';
const IMG_MAX = 600;

// Nhạc/video không lưu sẵn (bên dưới cũng không phục vụ chúng từ cache) – chỉ làm nặng lần cài đầu.
// Lưu từng tệp riêng: một tệp lỗi không làm hỏng cả lần cài như addAll.
// Tăng CACHE không bắt điện thoại tải lại tệp chưa đổi: sw-manifest.json (tạo lúc deploy bởi
// scripts/release/sw-manifest.mjs) ghi mã băm nội dung từng tệp; tệp có mã trùng với bản đã lưu
// trong cache cũ thì chép sang, chỉ tệp đã đổi mới tải về. Không có manifest (chạy cục bộ) thì
// tải hết như trước. Tải 6 tệp một lúc để không giành hết băng thông của trang đang mở.
const MANIFEST = './sw-manifest.json';
async function oldCaches() {
  const keys = (await caches.keys()).filter(k => /^bizon-v\d+$/.test(k) && k !== CACHE).sort((x, y) => y.slice(7) - x.slice(7));
  return Promise.all(keys.map(k => caches.open(k)));
}
async function readFiles(res) { try { return (await res.json()).files || {}; } catch (e) { return {}; } }
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE), olds = await oldCaches(), q = SHELL.slice();
    let man = null, now = {}, before = {};
    try { const r = await fetch(MANIFEST, { cache: 'no-store' }); if (r.ok) { man = r.clone(); now = await readFiles(r); } } catch (err) { /* không có manifest */ }
    for (const o of olds) { const r = await o.match(MANIFEST); if (r) { before = await readFiles(r); break; } }
    const one = async u => {
      if (now[u] && now[u] === before[u]) for (const o of olds) { const prev = await o.match(u); if (prev) return c.put(u, prev); }
      return c.add(new Request(u, { cache: 'no-cache' }));
    };
    await Promise.all(Array.from({ length: 6 }, async () => { while (q.length) { const u = q.shift(); try { await one(u); } catch (err) { /* một tệp lỗi không chặn cả lần cài */ } } }));
    if (man) await c.put(MANIFEST, man);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => /^bizon-v\d+$/.test(k) && k !== CACHE).map(k => caches.delete(k)))) // chỉ dọn bản cũ của chính sw.js; cache của sw-bizon.js, sw-hochieu.js, app/sw.js và IMG_CACHE để nguyên
      .then(() => self.clients.claim())
  );
});

// Chiến lược theo loại tài nguyên (không bao giờ trả index.html cho request không phải điều hướng):
//  - Điều hướng HTML: network-first → cache trang đó → index.html (chỉ ở đây mới fallback index)
//  - Ảnh và PDF: stale-while-revalidate (trả cache ngay, cập nhật nền), lưu ở IMG_CACHE
//  - Audio/video: KHÔNG chặn — để trình duyệt tự tải theo Range. Trả bản cache 200 cho yêu cầu
//    Range, hoặc lưu cả tệp mp4 khi người dùng mở thẳng liên kết, làm video trên điện thoại bị cắt giữa chừng.
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
function putIfOk(req, res, name = CACHE) {
  if (res && res.ok && res.status === 200) {
    const copy = res.clone();
    caches.open(name).then(c => c.put(req, copy).then(() => name === IMG_CACHE && trimImg(c)));
  }
  return res;
}
// Bỏ các ảnh lưu sớm nhất khi vượt IMG_MAX (keys() trả theo thứ tự đã lưu).
async function trimImg(c) {
  const keys = await c.keys();
  for (let i = 0; i < keys.length - IMG_MAX; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // CDN/fonts: để trình duyệt tự xử lý
  if (/\.(mp4|m4v|webm|mov|mp3|m4a|ogg|oga|wav)$/i.test(url.pathname)) return; // audio/video: để trình duyệt tự xử lý Range

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => putIfOk(e.request, res))
        .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  const dest = e.request.destination;
  if (dest === 'image' || /\.(webp|png|jpe?g|gif|svg|pdf)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        const net = fetch(e.request).then(res => putIfOk(e.request, res, IMG_CACHE)).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }
  if (dest === 'audio' || dest === 'video' || e.request.headers.has('range')) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => putIfOk(e.request, res))));
});
