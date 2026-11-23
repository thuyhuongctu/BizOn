/* BizOn – đếm lượt xem trang ẩn danh (23/11/2026). © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 * Dùng GoatCounter (mã nguồn mở, không cookie, không lưu IP, chỉ thống kê tổng). Không nạp mã của bên thứ ba: trang tự gửi một
 * yêu cầu ảnh 1 điểm ảnh tới /count. Chỉ gửi: đường dẫn trang (bỏ phần sau «?» và «#», nên mã lớp ?lop= không bao giờ rời máy),
 * tên miền trang dẫn tới (không gửi cả địa chỉ), chiều rộng màn hình (để biết điện thoại hay máy tính).
 * Không đếm: khi chạy ở máy cục bộ hoặc mở tệp trực tiếp, khi trình duyệt do máy điều khiển (test tự động), khi người dùng bật
 * «Do Not Track» hoặc «Global Privacy Control». Chi tiết ở chinh-sach.html (mục Thống kê truy cập). */
(function () {
  'use strict';
  var DIEM_DEN = 'https://bizonland.goatcounter.com/count';
  try {
    var l = location, n = navigator;
    if (window.__bizonDaDem) return; window.__bizonDaDem = true;
    if (l.protocol !== 'https:' || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(l.hostname)) return;
    if (n.webdriver || n.doNotTrack === '1' || window.doNotTrack === '1' || n.globalPrivacyControl === true) return;
    var r = '';
    try { if (document.referrer) { var h = new URL(document.referrer).hostname; if (h && h !== l.hostname) r = h; } } catch (e) {}
    var q = '?p=' + encodeURIComponent(l.pathname) + (r ? '&r=' + encodeURIComponent(r) : '') + '&s=' + encodeURIComponent(screen.width || 0) + '&rnd=' + Math.random().toString(36).slice(2, 8);
    var img = new Image(1, 1); img.referrerPolicy = 'no-referrer'; img.alt = ''; img.src = DIEM_DEN + q;
  } catch (e) { /* đếm hỏng thì bỏ qua, không ảnh hưởng trang */ }
})();
