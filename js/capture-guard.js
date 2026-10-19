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

  /* Hình mờ lặp lại, rất nhạt: không cản người xem nhưng làm mọi ảnh chụp mang dấu nguồn. */
  function addWatermark() {
    var c = document.createElement('canvas');
    c.width = 280; c.height = 170;
    var g = c.getContext('2d');
    g.translate(140, 85);
    g.rotate(-0.35);
    g.fillStyle = 'rgba(3,51,55,0.07)';
    g.font = '700 15px system-ui,sans-serif';
    g.textAlign = 'center';
    g.fillText('BizOn · bản quyền', 0, 0);
    var layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;z-index:2147483646;pointer-events:none;background-image:url(' + c.toDataURL('image/png') + ')';
    document.documentElement.appendChild(layer);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addWatermark);
  else addWatermark();
})();
