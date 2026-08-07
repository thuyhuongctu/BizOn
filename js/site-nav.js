/* BizOn – Thanh điều hướng dùng chung toàn site
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Trước đây mỗi trang một kiểu thanh đầu: 17 trang không có thanh điều hướng
 * nào (chỉ đi lại được qua chân trang hoặc dock), doi-ngu có thanh kính riêng,
 * game.html có thanh chỉ số riêng. Tệp này gắn MỘT thanh điều hướng chung lên
 * đầu mọi trang nội dung, lấy đúng bộ liên kết 4 nhóm mà chân trang đang dùng
 * (js/site-footer.js) để hai nơi không lệch nhau.
 *
 * KHÔNG gắn ở: game.html (thanh chỉ số của ván chơi), trang chủ index.html và
 * bản kiểm định academia3d-v2.html (đã có thanh kính riêng), classic-home.html
 * (bản lui bất biến), mọi trang trong /app/ và /vietlens/. Trang nào muốn tự
 * tắt thì đặt window.BIZON_NO_NAV = true trước khi nạp tệp này.
 *
 * Nút Sáng/Tối và VI/EN cố ý KHÔNG đặt ở đây – chúng đã nằm trong dock (nút ⋯)
 * để tránh hai bộ nút trùng nhau trên một trang. Thanh này chỉ lo điều hướng.
 */
(function () {
  'use strict';
  if (window.__bizonNav) return;
  var path = location.pathname;
  if (window.BIZON_NO_NAV) return;
  if (/\/(game|index|academia3d-v2|classic-home)\.html$/.test(path) || /\/$/.test(path)) return;
  if (/\/(app|vietlens)\//.test(path)) return;
  window.__bizonNav = true;

  // Cùng bộ liên kết với chân trang (js/site-footer.js) – nguồn duy nhất.
  var GROUPS = [
    ['🌌 Vũ trụ', [
      ['Bản đồ Vũ trụ', 'universe.html'],
      ['Trường (thể chế)', 'truong.html'],
      ['Nền tảng học thuật', 'truong-hoc-thuat.html'],
      ['Sổ điểm giảng viên', 'instructor-grading.html'],
    ]],
    ['🎮 Trò chơi', [
      ['Game Bật Nghiệp', 'game.html'],
      ['BizOn Arcade', 'games.html'],
      ['Hộ Chiếu Thương Hiệu', 'brand-passport.html'],
      ['Go Global', 'global.html'],
      ['Gánh Hàng Khởi Nghiệp', 'ben-phu-sa.html'],
    ]],
    ['🎨 Sáng tạo', [
      ['Kho Âm nhạc', 'am-nhac.html'],
      ['Thư viện Sáng tạo', 'thu-vien.html'],
      ['Hậu trường kho nhạc', 'hau-truong.html'],
    ]],
    ['🎓 Giảng dạy', [
      ['Kịch bản lớp học', 'lop-hoc.html'],
      ['Bảng điều khiển lớp', 'giang-vien.html'],
      ['Khảo sát trước–sau', 'khao-sat-online.html'],
      ['Học thuật & Model Cards', 'hoc-thuat.html'],
      ['Thẻ mô tả Lumina AI', 'lumina.html'],
      ['Bằng chứng lớp học', 'bang-chung.html'],
    ]],
    ['🏛️ Về BizOn', [
      ['Giới thiệu', 'gioi-thieu.html'],
      ['Đội ngũ sáng lập', 'doi-ngu.html'],
      ['Danh mục dự án', 'du-an.html'],
      ['Giải pháp & triển khai', 'giai-phap.html'],
      ['Tham gia nhóm', 'tuyen-dung.html'],
      ['Liên hệ & Hợp tác', 'lien-he.html'],
    ]],
  ];

  var here = (path.split('/').pop() || 'index.html');

  var CSS = [
    '#bz-nav{position:sticky;top:0;z-index:60;display:flex;align-items:center;gap:.5rem;',
    'padding:0 12px;min-height:52px;background:rgba(244,250,255,.85);',
    'backdrop-filter:blur(14px) saturate(150%);-webkit-backdrop-filter:blur(14px) saturate(150%);',
    'border-bottom:1px solid rgba(0,102,135,.12);font-family:Manrope,\'Manrope Fallback\',system-ui,sans-serif}',
    'html[data-theme="dark"] #bz-nav{background:rgba(8,26,32,.85);border-bottom-color:rgba(126,197,221,.16)}',
    '#bz-nav .bz-brand{display:flex;align-items:center;gap:8px;font-weight:800;color:#033337;white-space:nowrap;margin-right:auto}',
    'html[data-theme="dark"] #bz-nav .bz-brand{color:#d6ecf0}',
    '#bz-nav .bz-brand img{width:30px;height:30px;border-radius:9px;box-shadow:0 6px 16px -6px rgba(0,102,135,.5)}',
    '#bz-nav .bz-brand b{font-size:14px;line-height:1}#bz-nav .bz-brand b span{color:#e8762d}',
    '#bz-nav .bz-brand small{display:block;font-size:8.5px;font-weight:800;letter-spacing:.14em;',
    'text-transform:uppercase;color:rgba(0,102,135,.5);margin-top:2px}',

    /* Nhóm menu trên màn hình rộng */
    '#bz-nav .bz-groups{display:flex;gap:2px}',
    '#bz-nav .bz-grp{position:relative}',
    '#bz-nav .bz-grp>button{border:0;background:none;cursor:pointer;font:inherit;font-size:13px;',
    'font-weight:800;color:#033337;padding:8px 11px;border-radius:11px;display:flex;align-items:center;gap:4px}',
    'html[data-theme="dark"] #bz-nav .bz-grp>button{color:#d6ecf0}',
    '#bz-nav .bz-grp>button:hover,#bz-nav .bz-grp.open>button{background:rgba(0,102,135,.09)}',
    '#bz-nav .bz-grp>button::after{content:"▾";font-size:9px;opacity:.5}',
    '#bz-nav .bz-menu{position:absolute;top:calc(100% + 6px);right:0;min-width:210px;padding:6px;',
    'background:#fff;border:1px solid rgba(0,102,135,.14);border-radius:16px;',
    'box-shadow:0 20px 46px -14px rgba(7,29,58,.32);display:none;flex-direction:column;gap:1px}',
    'html[data-theme="dark"] #bz-nav .bz-menu{background:#0e2a33;border-color:rgba(126,197,221,.18)}',
    '#bz-nav .bz-grp.open .bz-menu{display:flex}',
    '#bz-nav .bz-menu a{padding:8px 11px;border-radius:10px;font-size:13px;font-weight:700;',
    'color:#033337;text-decoration:none;white-space:nowrap}',
    'html[data-theme="dark"] #bz-nav .bz-menu a{color:#cfe7ee}',
    '#bz-nav .bz-menu a:hover{background:rgba(0,102,135,.09)}',
    '#bz-nav .bz-menu a[aria-current="page"]{background:#e8762d;color:#fff}',

    /* Nút ☰ cho màn hình hẹp + tấm menu trượt */
    '#bz-nav .bz-burger{display:none;border:0;background:rgba(0,102,135,.09);cursor:pointer;',
    'width:38px;height:38px;border-radius:11px;font-size:17px;color:#033337}',
    'html[data-theme="dark"] #bz-nav .bz-burger{background:rgba(126,197,221,.14);color:#d6ecf0}',
    '#bz-sheet{position:fixed;inset:52px 0 0;z-index:59;display:none;padding:14px;overflow:auto;',
    'background:rgba(244,250,255,.97);backdrop-filter:blur(8px)}',
    'html[data-theme="dark"] #bz-sheet{background:rgba(8,26,32,.97)}',
    '#bz-sheet.open{display:block}',
    '#bz-sheet h3{margin:14px 4px 6px;font-size:11px;font-weight:800;letter-spacing:.08em;',
    'text-transform:uppercase;color:rgba(0,102,135,.6)}',
    'html[data-theme="dark"] #bz-sheet h3{color:rgba(126,197,221,.7)}',
    '#bz-sheet a{display:block;padding:11px 12px;border-radius:12px;font-size:15px;font-weight:700;',
    'color:#033337;text-decoration:none}',
    'html[data-theme="dark"] #bz-sheet a{color:#d6ecf0}',
    '#bz-sheet a[aria-current="page"]{background:#e8762d;color:#fff}',

    /* Sợi nhấn chung: cửa "Vũ trụ" khoác màu jade thể chế (base clay giữ nguyên) */
    '#bz-nav .bz-grp-hub>button{color:#0F5C4E}',
    '#bz-nav .bz-grp-hub>button::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#0F5C4E;margin-right:6px;vertical-align:1px}',
    '#bz-nav .bz-grp-hub>button:hover,#bz-nav .bz-grp-hub.open>button{background:rgba(15,92,78,.10)}',
    '#bz-nav .bz-grp-hub .bz-menu a:hover{background:rgba(15,92,78,.10);color:#0F5C4E}',
    'html[data-theme="dark"] #bz-nav .bz-grp-hub>button{color:#7FD9BE}',
    'html[data-theme="dark"] #bz-nav .bz-grp-hub>button::before{background:#7FD9BE}',
    'html[data-theme="dark"] #bz-nav .bz-grp-hub>button:hover,html[data-theme="dark"] #bz-nav .bz-grp-hub.open>button{background:rgba(127,217,190,.14)}',
    'html[data-theme="dark"] #bz-nav .bz-grp-hub .bz-menu a:hover{background:rgba(127,217,190,.14);color:#7FD9BE}',
    '#bz-sheet h3.bz-hub{color:#0F5C4E}',
    '#bz-sheet h3.bz-hub::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#0F5C4E;margin-right:6px;vertical-align:1px}',
    'html[data-theme="dark"] #bz-sheet h3.bz-hub,html[data-theme="dark"] #bz-sheet h3.bz-hub::before{color:#7FD9BE;background:#7FD9BE}',
    '@media (max-width:860px){#bz-nav .bz-groups{display:none}#bz-nav .bz-burger{display:block}}',
    '@media print{#bz-nav,#bz-sheet{display:none}}',
    '@media (prefers-reduced-motion:reduce){#bz-nav{backdrop-filter:none}}'
  ].join('');

  function cur(href) { return href === here ? ' aria-current="page"' : ''; }

  function build() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    var groupsHtml = GROUPS.map(function (g) {
      var hub = g[0].indexOf('Vũ trụ') !== -1 ? ' bz-grp-hub' : '';
      var items = g[1].map(function (l) {
        return '<a href="' + l[1] + '"' + cur(l[1]) + '>' + l[0] + '</a>';
      }).join('');
      return '<div class="bz-grp' + hub + '"><button type="button">' + g[0] + '</button>' +
        '<div class="bz-menu">' + items + '</div></div>';
    }).join('');

    var nav = document.createElement('nav');
    nav.id = 'bz-nav';
    nav.setAttribute('aria-label', 'Điều hướng chính');
    nav.innerHTML =
      '<a class="bz-brand" href="index.html" aria-label="BizOn Bật Nghiệp – trang chủ">' +
        '<img src="assets/icons/icon-192.png" alt="">' +
        '<b>BizOn <span>Bật Nghiệp</span><small>Business Simulation</small></b>' +
      '</a>' +
      '<div class="bz-groups">' + groupsHtml + '</div>' +
      '<button class="bz-burger" type="button" aria-label="Mở menu" aria-expanded="false">☰</button>';

    document.body.insertBefore(nav, document.body.firstChild);

    var sheet = document.createElement('div');
    sheet.id = 'bz-sheet';
    sheet.innerHTML = GROUPS.map(function (g) {
      var h = g[0].indexOf('Vũ trụ') !== -1 ? ' class="bz-hub"' : '';
      return '<h3' + h + '>' + g[0] + '</h3>' + g[1].map(function (l) {
        return '<a href="' + l[1] + '"' + cur(l[1]) + '>' + l[0] + '</a>';
      }).join('');
    }).join('');
    document.body.insertBefore(sheet, nav.nextSibling);

    // Mở/đóng dropdown trên màn hình rộng
    var grps = nav.querySelectorAll('.bz-grp');
    grps.forEach(function (grp) {
      grp.querySelector('button').addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = grp.classList.contains('open');
        grps.forEach(function (g) { g.classList.remove('open'); });
        if (!wasOpen) grp.classList.add('open');
      });
    });
    document.addEventListener('click', function () {
      grps.forEach(function (g) { g.classList.remove('open'); });
    });

    // Nút ☰
    var burger = nav.querySelector('.bz-burger');
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = sheet.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? '✕' : '☰';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
