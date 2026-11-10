/* BizOn – tranh động 2D: phát một tờ sprite (assets/character/tranh-dong/<tên>.webp kèm .json) ngay tại chỗ một ảnh tĩnh.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Cách dùng: giữ nguyên thẻ ảnh tĩnh và thêm thuộc tính
 *   <img src="…ảnh tĩnh…" data-tranh-dong="assets/character/tranh-dong/teo-dung" [data-tranh-dong-noi="…/teo-noi"] [data-tranh-dong-kieu="left:1%;width:29%"]>
 * Tệp này tự tìm các ảnh đó. Tờ sprite tải xong thì đặt một khung phát đúng vị trí, kích thước và kiểu dáng của ảnh (ảnh tĩnh ẩn đi);
 * tải hỏng, trình duyệt cũ hoặc người dùng chọn «giảm chuyển động» thì ảnh tĩnh ở nguyên, trang không đổi gì. Khung phát dừng khi
 * ra khỏi màn hình hoặc khi thẻ trình duyệt bị ẩn. Đổi động tác: phần tử ảnh có .tranhDong.dongTac('noi' | 'dung').
 * Tờ có "quaLai": true trong JSON thì phát xuôi rồi phát ngược. Không gọi mạng ngoài trang.
 */
(function () {
  'use strict';
  var GIAM = false; try { GIAM = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function napTo(duong) {   // → Promise {j, url}
    return fetch(duong + '.json').then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); }).then(function (j) {
      if (!(j.khung > 0 && j.cot > 0 && j.hang > 0 && j.rong > 0 && j.cao > 0 && j.fps > 0)) throw new Error('json');
      return new Promise(function (ok, loi) { var i = new Image(); i.onload = function () { ok({ j: j, url: duong + '.webp' }); }; i.onerror = loi; i.src = duong + '.webp'; });
    });
  }
  function khungCua(j, k) { var K = j.khung; if (!j.quaLai || K < 3) return k % K; var m = k % (2 * K - 2); return m < K ? m : 2 * K - 2 - m; }
  function gan(img) {
    if (img.tranhDong || GIAM || !window.fetch || !window.Promise) return null;
    var duong = { dung: img.getAttribute('data-tranh-dong'), noi: img.getAttribute('data-tranh-dong-noi') }, to = {}, ten = 'dung', khung = 0, dem = 0, truoc = 0, raf = 0, thay = true, song = false, hop = null;
    if (!duong.dung) return null;
    var api = img.tranhDong = {
      sanSang: false, hong: false,
      thongSo: function () { return { dongTac: ten, khung: khung, soKhung: to[ten] ? to[ten].j.khung : 0, dangPhat: !!raf }; },
      dongTac: function (t) { if (to[t] && t !== ten) { ten = t; dem = 0; ve(); } return ten; },
      go: function () { song = false; dung(); if (hop && hop.parentNode) hop.parentNode.removeChild(hop); img.style.visibility = ''; img.tranhDong = null; },
    };
    function ve() {
      var s = to[ten], j = s.j; khung = khungCua(j, Math.floor(dem)); var c = khung % j.cot, h = Math.floor(khung / j.cot);
      hop.style.backgroundImage = 'url("' + s.url + '")'; hop.style.backgroundSize = (j.cot * 100) + '% ' + (j.hang * 100) + '%';
      hop.style.backgroundPosition = (j.cot > 1 ? c / (j.cot - 1) * 100 : 0) + '% ' + (j.hang > 1 ? h / (j.hang - 1) * 100 : 0) + '%';
    }
    function buoc(t) { raf = 0; if (!song) return; var dt = truoc ? Math.min(0.1, (t - truoc) / 1000) : 0; truoc = t; dem += dt * to[ten].j.fps; ve(); chay(); }
    function chay() { if (song && thay && !document.hidden && !raf) raf = requestAnimationFrame(buoc); }
    function dung() { if (raf) cancelAnimationFrame(raf); raf = 0; truoc = 0; }
    Promise.all([napTo(duong.dung), duong.noi ? napTo(duong.noi).catch(function () { return null; }) : null]).then(function (kq) {
      if (!img.parentNode || img.tranhDong !== api) return;
      to.dung = kq[0]; if (kq[1]) to.noi = kq[1];
      // khung phát chép kiểu dáng của ảnh tĩnh và nằm đè đúng chỗ nó; ảnh tĩnh vẫn giữ chỗ trong bố cục
      hop = document.createElement('span'); hop.className = 'bz-tranh-dong'; hop.setAttribute('aria-hidden', 'true');
      var kieu = img.getAttribute('style') || '', cs = window.getComputedStyle(img), tuyet = cs.position === 'absolute' || cs.position === 'fixed';
      hop.setAttribute('style', kieu + ';display:block;background-repeat:no-repeat;pointer-events:none;aspect-ratio:' + to.dung.j.rong + ' / ' + to.dung.j.cao + ';');
      if (!tuyet) { var cha = img.parentNode; if (window.getComputedStyle(cha).position === 'static') cha.style.position = 'relative'; hop.style.position = 'absolute'; hop.style.left = img.offsetLeft + 'px'; hop.style.top = img.offsetTop + 'px'; hop.style.height = img.offsetHeight + 'px'; hop.style.width = 'auto'; hop.style.margin = '0'; }
      else hop.style.position = cs.position;   // ảnh định vị bằng CSS của trang (không ghi trong style): khung phát định vị y như vậy
      if (tuyet && /(^|;)\s*width\s*:/.test(kieu) && !/(^|;)\s*height\s*:/.test(kieu)) hop.style.height = 'auto';
      else if (tuyet && /(^|;)\s*height\s*:/.test(kieu) && !/(^|;)\s*width\s*:/.test(kieu)) hop.style.width = 'auto';
      // tờ sprite có lề và tỷ lệ khác ảnh tĩnh: data-tranh-dong-kieu chỉnh riêng khung phát (ví dụ "left:1%;width:29%")
      var them = img.getAttribute('data-tranh-dong-kieu'); if (them) hop.style.cssText += ';' + them;
      img.parentNode.insertBefore(hop, img.nextSibling); img.style.visibility = 'hidden'; ve();
      song = true; api.sanSang = true;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { thay = es[es.length - 1].isIntersecting; if (thay) chay(); else dung(); }).observe(hop);
      document.addEventListener('visibilitychange', function () { if (document.hidden) dung(); else chay(); });
      chay();
    }).catch(function () { api.hong = true; });
    return api;
  }
  function quet(goc) { var ds = (goc || document).querySelectorAll('img[data-tranh-dong]'); for (var i = 0; i < ds.length; i++) gan(ds[i]); }
  window.BizOnTranhDong2D = { gan: gan, quet: quet, giam: GIAM };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { quet(); }); else quet();
})();
