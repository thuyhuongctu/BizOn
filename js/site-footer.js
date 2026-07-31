/* BizOn – Chân trang dùng chung toàn site
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Bố cục ba tầng: (1) khối thương hiệu + DOI/GitHub, (2) bốn nhóm liên kết
 * xếp theo việc người xem muốn làm, (3) trích dẫn APA 7 – liên hệ – bản quyền.
 * Dưới 600px mỗi nhóm thu lại thành <details> để chân trang không dài lê thê.
 * Hai dòng "Liên hệ" và "🎓 Trang web chỉ phục vụ..." sẵn có trên trang được
 * dời vào trong footer để không lặp nội dung.
 * Không gắn trên game.html (giao diện app). */
(function () {
  if (/game\.html$/.test(location.pathname)) return;

  var COLS = [
    ['🎮 Trò chơi · Games', [
      ['Game Bật Nghiệp', 'game.html'],
      ['BizOn Arcade', 'games.html'],
      ['Hộ Chiếu Thương Hiệu', 'brand-passport.html'],
      ['Go Global', 'global.html'],
      ['Gánh Hàng Khởi Nghiệp', 'food-truck.html'],
    ]],
    ['🎨 Kho sáng tạo · Creative', [
      ['Kho Âm nhạc', 'am-nhac.html'],
      ['Thư viện Sáng tạo', 'thu-vien.html'],
      ['Hậu trường sản xuất nhạc', 'hau-truong.html'],
    ]],
    ['🎓 Giảng dạy · Educators', [
      ['Kịch bản lớp học', 'lop-hoc.html'],
      ['Bảng điều khiển lớp', 'giang-vien.html'],
      ['Khảo sát trước–sau', 'khao-sat-online.html'],
      ['Phiếu khảo sát (bản in A4)', 'khao-sat.html'],
      ['Học thuật & Model Cards', 'hoc-thuat.html'],
      ['Thẻ mô tả Lumina AI', 'lumina.html'],
      ['Bằng chứng lớp học', 'bang-chung.html'],
    ]],
    ['🏛️ Về BizOn · About', [
      ['Giới thiệu', 'gioi-thieu.html'],
      ['Đội ngũ sáng lập', 'doi-ngu.html'],
      ['Danh mục dự án', 'du-an.html'],
      ['Giải pháp & gói triển khai', 'giai-phap.html'],
      ['Tham gia nhóm', 'tuyen-dung.html'],
      ['Liên hệ & Hợp tác', 'lien-he.html'],
    ]],
  ];

  var css = document.createElement('style');
  css.textContent =
    '#bz-footer{margin-top:48px;padding:36px 20px 22px;background:rgba(0,102,135,.06);border-top:2px solid rgba(0,102,135,.12);' +
      'font-family:Manrope,\'Plus Jakarta Sans\',sans-serif;color:#033337}' +
    '#bz-footer .bzf-in{max-width:64rem;margin:0 auto}' +

    /* --- tầng 1: thương hiệu --- */
    '#bz-footer .bzf-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px 28px;' +
      'padding-bottom:22px;margin-bottom:22px;border-bottom:1px solid rgba(0,102,135,.12)}' +
    '#bz-footer .bzf-brand{max-width:27rem}' +
    '#bz-footer .bzf-logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:16px;color:inherit;text-decoration:none}' +
    '#bz-footer .bzf-logo img{width:38px;height:38px;border-radius:12px}' +
    '#bz-footer .bzf-accent{color:#006687}' +
    '#bz-footer .bzf-brand p{font-size:12px;line-height:1.6;opacity:.65;margin:8px 0 0}' +
    '#bz-footer .bzf-meta{font-size:12px;line-height:1.9;text-align:right}' +
    '#bz-footer .bzf-meta a{color:#006687;font-weight:700;text-decoration:none}' +
    '#bz-footer .bzf-meta a:hover{text-decoration:underline}' +

    /* --- tầng 2: bốn nhóm liên kết --- */
    '#bz-footer .bzf-grid{display:grid;grid-template-columns:1fr;gap:2px 26px;align-items:start}' +
    '#bz-footer .bzf-col{border-bottom:1px solid rgba(0,102,135,.10)}' +
    '#bz-footer summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;' +
      'font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.6;padding:12px 0}' +
    '#bz-footer summary::-webkit-details-marker{display:none}' +
    '#bz-footer summary::after{content:"⌄";font-size:15px;line-height:0;transform:translateY(-2px);opacity:.7}' +
    '#bz-footer details[open] summary::after{transform:translateY(2px) rotate(180deg)}' +
    '#bz-footer ul{list-style:none;margin:0;padding:0 0 12px}' +
    '#bz-footer ul a{display:block;font-size:13px;font-weight:700;color:#006687;text-decoration:none;padding:4px 0}' +
    '#bz-footer ul a:hover{text-decoration:underline}' +

    /* --- tầng 3: trích dẫn, liên hệ, bản quyền --- */
    '#bz-footer .bzf-cite{font-size:11px;line-height:1.65;opacity:.6;border-top:1px solid rgba(0,102,135,.12);margin-top:24px;padding-top:16px}' +
    '#bz-footer .bzf-tail{text-align:center;margin-top:12px}' +
    '#bz-footer .bzf-tail p{max-width:42rem;margin:6px auto 0}' +
    '#bz-footer .bzf-legal{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 18px;' +
      'font-size:11px;opacity:.6;border-top:1px solid rgba(0,102,135,.12);margin-top:18px;padding-top:14px}' +
    '#bz-footer .bzf-legal a{color:#006687;font-weight:700;text-decoration:none}' +
    '#bz-footer .bzf-legal a:hover{text-decoration:underline}' +

    /* --- từ 600px: mở sẵn mọi nhóm, bỏ mũi tên và vạch kẻ --- */
    '@media(min-width:600px){' +
      '#bz-footer .bzf-grid{grid-template-columns:repeat(2,1fr);gap:22px 26px}' +
      '#bz-footer .bzf-col{border-bottom:0}' +
      '#bz-footer summary{cursor:default;padding:0 0 10px}' +
      '#bz-footer summary::after{display:none}' +
      '#bz-footer ul{padding-bottom:0}}' +
    '@media(min-width:960px){#bz-footer .bzf-grid{grid-template-columns:repeat(4,1fr)}}' +
    '@media(max-width:599px){#bz-footer .bzf-meta{text-align:left}#bz-footer .bzf-legal{justify-content:center;text-align:center}}' +

    'html[data-theme="dark"] #bz-footer{background:rgba(92,196,230,.06);border-top-color:rgba(92,196,230,.15);color:#d6ecf0}' +
    'html[data-theme="dark"] #bz-footer .bzf-top,html[data-theme="dark"] #bz-footer .bzf-cite,' +
      'html[data-theme="dark"] #bz-footer .bzf-legal{border-color:rgba(92,196,230,.15)}' +
    'html[data-theme="dark"] #bz-footer .bzf-col{border-bottom-color:rgba(92,196,230,.13)}' +
    'html[data-theme="dark"] #bz-footer ul a,html[data-theme="dark"] #bz-footer .bzf-meta a,' +
      'html[data-theme="dark"] #bz-footer .bzf-legal a,html[data-theme="dark"] #bz-footer .bzf-accent{color:#5cc4e6}' +
    '@media print{#bz-footer{display:none !important}}';
  document.head.appendChild(css);

  function build() {
    var f = document.createElement('footer');
    f.id = 'bz-footer';
    var cols = COLS.map(function (c) {
      return '<details class="bzf-col"><summary>' + c[0] + '</summary><ul>' +
        c[1].map(function (l) { return '<li><a href="' + l[1] + '">' + l[0] + '</a></li>'; }).join('') +
        '</ul></details>';
    }).join('');
    f.innerHTML =
      '<div class="bzf-in">' +
        '<div class="bzf-top">' +
          '<div class="bzf-brand">' +
            '<a class="bzf-logo" href="index.html"><img src="assets/icons/icon-192.png" alt="BizOn">BizOn <span class="bzf-accent">Bật Nghiệp</span></a>' +
            '<p>Hệ sinh thái mô phỏng kinh doanh 3D phong cách đất nặn cho đào tạo khởi nghiệp.<br>Business simulation ecosystem for entrepreneurship education.</p>' +
          '</div>' +
          '<div class="bzf-meta">' +
            '📦 DOI <a href="https://doi.org/10.5281/zenodo.21592241" target="_blank" rel="noopener">10.5281/zenodo.21592241</a><br>' +
            '⭐ <a href="https://github.com/thuyhuongctu/BizOn" target="_blank" rel="noopener">github.com/thuyhuongctu/BizOn</a>' +
          '</div>' +
        '</div>' +
        '<div class="bzf-grid">' + cols + '</div>' +
        '<p class="bzf-cite">Cite (APA 7): Do, T. H., &amp; Phan, A. T. (2026). <i>BizOn Bật Nghiệp: A claymorphism business-simulation ecosystem for entrepreneurship education</i> [Computer software]. https://doi.org/10.5281/zenodo.21592241</p>' +
        '<div class="bzf-tail" id="bzf-tail"></div>' +
        '<div class="bzf-legal">' +
          '<span>© 2026 BizOn Bật Nghiệp · Đỗ Thùy Hương &amp; Phan Anh Tú</span>' +
          '<span><a href="chinh-sach.html">Chính sách quyền riêng tư</a> · <a href="reset.html">Làm mới ứng dụng</a></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(f);

    // Dời 2 dòng Liên hệ + disclaimer sẵn có vào trong footer (tránh lặp)
    var tail = document.getElementById('bzf-tail');
    Array.prototype.slice.call(document.querySelectorAll('body > p')).forEach(function (p) {
      var t = p.textContent || '';
      if (t.indexOf('✉️ Liên hệ') === 0 || t.indexOf('🎓 Trang web') === 0) tail.appendChild(p);
    });

    // Từ 600px trở lên các nhóm luôn mở; hẹp hơn thì thu lại để bớt cuộn
    var wide = window.matchMedia('(min-width:600px)');
    var groups = Array.prototype.slice.call(f.querySelectorAll('details.bzf-col'));
    function sync() { groups.forEach(function (d) { d.open = wide.matches; }); }
    sync();
    if (wide.addEventListener) wide.addEventListener('change', sync);
    else if (wide.addListener) wide.addListener(sync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
