/* Báo lỗi khi cảnh 3D không chạy được (20/11/2026, đợt 1 sau rà soát game 3D trên điện thoại).
 * Trước đây nếu three.js hay tệp cảnh tải hỏng (mạng rớt, máy không có WebGL) thì khung 3D để trống, không một lời nào.
 * Cách dùng: đặt TRƯỚC thẻ <script type="module"> của cảnh, script thường (không defer):
 *   <script src="js/bao-loi-3d.js" data-khung="bps3d" data-tep="js/bps3d.js" data-ban-2d="ben-phu-sa.html"></script>
 * - data-khung: id phần tử chứa canvas 3D; cảnh coi là đã chạy khi trong khung có <canvas>.
 * - data-tep: đường dẫn module cảnh; chỉ lỗi của module này (tải hỏng hay lỗi khi dựng) mới bật thông báo.
 * - data-ban-2d: trang bản 2D để chơi tiếp. Tuỳ chọn data-cho (ms, mặc định 25000): quá lâu chưa có canvas thì báo «tải lâu».
 * - Tuỳ chọn data-tren (mặc định 16px): khoảng cách từ mép trên khung tới lời báo; khung phủ cả màn (dưới thanh tiêu đề,
 *   trên bảng chơi) thì đặt lớn hơn để lời báo nằm ngay dưới thanh tiêu đề, không bị bảng chơi che.
 * Thông báo nằm trong khung 3D, có «Thử lại» (tải lại trang) và «Chơi bản 2D». Không đụng logic game. */
(function () {
  var me = document.currentScript; if (!me) return;
  var khungId = me.getAttribute('data-khung'), tep = me.getAttribute('data-tep') || '', ban2d = me.getAttribute('data-ban-2d') || '';
  var cho = +(me.getAttribute('data-cho') || 25000), tren = me.getAttribute('data-tren') || '16px', daBao = false;
  var en = function () { try { return localStorage.getItem('bizon-lang') === 'en' || document.documentElement.lang === 'en'; } catch (e) { return false; } };
  var khung = function () { return document.getElementById(khungId); };
  var daChay = function () { var k = khung(); return !!(k && k.querySelector('canvas')); };
  function bao(loai) {
    var k = khung(); if (daBao || !k || daChay()) return; daBao = true;
    var E = en(), d = document.createElement('div');
    d.id = 'bao-loi-3d'; d.setAttribute('role', 'alert');
    d.style.cssText = 'position:absolute;inset:0;z-index:30;display:flex;align-items:flex-start;justify-content:center;padding:' + tren + ' 16px 16px;box-sizing:border-box;background:rgba(244,250,255,.92);font:600 14px/1.5 "Be Vietnam Pro",system-ui,sans-serif;color:#033337;text-align:center';
    var hop = document.createElement('div'); hop.style.cssText = 'max-width:340px';
    var p = document.createElement('p'); p.style.margin = '0 0 12px';
    p.textContent = loai === 'lau'
      ? (E ? 'The 3D scene is taking longer than usual to load. Try again, or play the 2D version.' : 'Cảnh 3D tải lâu hơn bình thường. Bấm «Thử lại», hoặc chơi bản 2D.')
      : (E ? 'Could not load the 3D scene (network problem or this device does not support WebGL). Try again, or play the 2D version.' : 'Không tải được cảnh 3D (mạng chập chờn hoặc máy không hỗ trợ WebGL). Bấm «Thử lại», hoặc chơi bản 2D.');
    var nut = 'display:inline-block;margin:4px;min-height:44px;padding:10px 16px;border-radius:12px;font:800 14px "Be Vietnam Pro",system-ui,sans-serif;cursor:pointer;text-decoration:none;box-sizing:border-box';
    var lai = document.createElement('button'); lai.type = 'button'; lai.textContent = E ? '↻ Try again' : '↻ Thử lại';
    lai.style.cssText = nut + ';border:0;background:#033337;color:#fff'; lai.onclick = function () { location.reload(); };
    hop.appendChild(p); hop.appendChild(lai);
    if (ban2d) { var a = document.createElement('a'); a.href = ban2d + (E ? (ban2d.indexOf('?') < 0 ? '?' : '&') + 'lang=en' : ''); a.textContent = E ? 'Play the 2D version →' : 'Chơi bản 2D →';
      a.style.cssText = nut + ';border:2px solid #033337;background:#fff;color:#033337'; hop.appendChild(a); }
    d.appendChild(hop);
    if (getComputedStyle(k).position === 'static') k.style.position = 'relative';
    k.appendChild(d);
  }
  var cuaTep = function (url) { return !!(tep && url && url.split('?')[0].slice(-tep.length) === tep); };
  // Tải hỏng (module cảnh hay module nó nhập như three.js): sự kiện error ở chính thẻ script; lỗi khi dựng cảnh: error của window
  addEventListener('error', function (e) {
    var t = e.target;
    if ((t && t.tagName === 'SCRIPT' && cuaTep(t.src)) || cuaTep(e.filename) || /WebGL/i.test(e.message || '')) setTimeout(function () { bao('hong'); }, 0);
  }, true);
  setTimeout(function () { if (!daChay()) bao('lau'); }, cho);
})();
