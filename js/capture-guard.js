/* BizOn – răn đe chụp và ghi hình màn hình trên web.
 * Trình duyệt không thể chặn hoàn toàn ảnh chụp hay quay phim từ hệ điều hành
 * hoặc từ máy khác. Script này chỉ chặn các đường thông thường: phím PrintScreen,
 * chuột phải, kéo ảnh ra ngoài, và phủ hình mờ để mọi ảnh chụp đều lộ nguồn.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */
(function () {
  'use strict';
  if (window.__bizonCaptureGuard) return;
  window.__bizonCaptureGuard = true;

  var FORM_TAG = /^(INPUT|TEXTAREA|SELECT)$/;
  function isEditable(t) { return !!t && (FORM_TAG.test(t.tagName) || t.isContentEditable); }

  /* Chuột phải: không mở menu "Lưu ảnh" / "Chụp". Ô nhập liệu vẫn dùng bình thường. */
  document.addEventListener('contextmenu', function (e) {
    if (!isEditable(e.target)) e.preventDefault();
  });

  /* Không cho kéo ảnh ra desktop để lưu. */
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  });

  /* Lớp che tạm thời khi bấm PrintScreen; xóa clipboard để ảnh vừa chụp không dán được. */
  var shield = null, shieldTimer = null;
  function flashShield(ms) {
    if (!shield) {
      shield = document.createElement('div');
      shield.setAttribute('aria-hidden', 'true');
      shield.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:24px;background:#033337;color:#fff;font:700 18px/1.4 system-ui,sans-serif;text-align:center';
      shield.textContent = 'Nội dung BizOn được bảo vệ. Vui lòng không chụp hoặc quay màn hình.';
      document.documentElement.appendChild(shield);
    }
    shield.style.display = 'flex';
    clearTimeout(shieldTimer);
    shieldTimer = setTimeout(function () { shield.style.display = 'none'; }, ms);
  }
  function clearClipboard() {
    try { navigator.clipboard.writeText(' ').catch(function () {}); } catch (e) {}
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'PrintScreen') { e.preventDefault(); clearClipboard(); flashShield(2500); }
  });
  document.addEventListener('keyup', function (e) {
    if (e.key === 'PrintScreen') { clearClipboard(); flashShield(2500); }
  });

  /* Hình mờ (23/11/2026: thưa và nhạt hơn, không phủ vùng game).
   * - Trang thường: chữ lặp lại theo ô 520×300 (trước 340×170, tức ít hơn khoảng 63 % số dòng trên màn hình),
   *   độ mờ 5 % (trước 7 %). Chế độ tối dùng chữ sáng cùng độ mờ, vì chữ xanh đậm không thấy trên nền tối.
   * - Trang game: không phủ lớp lặp lên game, chỉ đặt một nhãn nhỏ ở góc dưới bên phải. Nhận ra trang game theo
   *   (a) canvas hay iframe chiếm ≥ 35 % màn hình (game 3D), hoặc (b) phần tử gốc của game 2D: #ft-total (Bến Phù Sa),
   *   #bp-hud (Hộ Chiếu Thương Hiệu), #rulesModal (Hộ Chiếu Sầu Riêng bản lớp học), #screen-login (Bật Nghiệp game.html),
   *   hay [data-bz-game] cho game mới. Chỉ đọc các id này, không sửa trang game. Kiểm lại khi tải xong, sau 1,5 s, 5 s và khi đổi cỡ cửa sổ.
   * - Trang nằm trong iframe của một trang BizOn đã có lớp này (ví dụ game.html trong BizOn Game 3D): không vẽ thêm.
   * Lớp không nhận chuột (pointer-events:none) và trình đọc màn hình bỏ qua (aria-hidden). */
  var WM = { text: '© Bizonland · All rights reserved', tileW: 520, tileH: 300, alpha: 0.05, gameShare: 0.35,
    gameSel: '#ft-total,#bp-hud,#rulesModal,#screen-login,[data-bz-game]' };
  function tile(rgb) {
    var c = document.createElement('canvas');
    c.width = WM.tileW; c.height = WM.tileH;
    var g = c.getContext('2d');
    if (!g) return '';
    g.translate(WM.tileW / 2, WM.tileH / 2);
    g.rotate(-0.35);
    g.fillStyle = 'rgba(' + rgb + ',' + WM.alpha + ')';
    g.font = '700 15px system-ui,sans-serif';
    g.textAlign = 'center';
    g.fillText(WM.text, 0, 0);
    return c.toDataURL('image/png');
  }
  function parentHasGuard() {
    if (window.self === window.top) return false;
    try { return !!window.parent.__bizonCaptureGuard; } catch (e) { return false; }   // khác nguồn: tự vẽ
  }
  function bigGame() {
    if (document.querySelector(WM.gameSel)) return true;
    var vw = window.innerWidth || 1, vh = window.innerHeight || 1, els = document.querySelectorAll('canvas,iframe');
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      var w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)), h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (w * h >= WM.gameShare * vw * vh) return true;
    }
    return false;
  }
  var layer = null, badge = null;
  function addWatermark() {
    if (parentHasGuard()) { window.__bizonWatermark = { mode: 'iframe' }; return; }
    var st = document.createElement('style');
    var light = tile('3,51,55'), dark = tile('255,255,255');
    st.textContent = '#bz-wm{position:fixed;inset:0;z-index:2147483646;pointer-events:none;background-image:url(' + light + ')}'
      + 'html[data-theme="dark"] #bz-wm{background-image:url(' + dark + ')}'
      + '@media (prefers-color-scheme:dark){html:not([data-theme="light"]) #bz-wm{background-image:url(' + dark + ')}}'
      + '#bz-wm-goc{position:fixed;right:8px;bottom:6px;z-index:2147483646;pointer-events:none;font:600 10px/1 system-ui,sans-serif;letter-spacing:.02em;color:rgba(255,255,255,.7);text-shadow:0 0 2px rgba(0,0,0,.7),0 0 1px rgba(0,0,0,.7)}';   // chữ sáng viền tối: đọc được trên mọi nền game
    document.head ? document.head.appendChild(st) : document.documentElement.appendChild(st);
    layer = document.createElement('div'); layer.id = 'bz-wm'; layer.setAttribute('aria-hidden', 'true');
    badge = document.createElement('div'); badge.id = 'bz-wm-goc'; badge.setAttribute('aria-hidden', 'true'); badge.textContent = '© Bizonland';
    document.documentElement.appendChild(layer);
    document.documentElement.appendChild(badge);
    update();
    setTimeout(update, 1500); setTimeout(update, 5000);
    var t = null;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(update, 200); });
  }
  function update() {
    if (!layer) return;
    var game = bigGame();
    layer.style.display = game ? 'none' : '';
    badge.style.display = game ? '' : 'none';
    window.__bizonWatermark = { mode: game ? 'goc' : 'lap', alpha: WM.alpha, tileW: WM.tileW, tileH: WM.tileH };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addWatermark);
  else addWatermark();
})();
