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
    ['🌌 Vũ trụ · Hub', '🌌 Universe · Hub', [
      ['Bản đồ Vũ trụ', 'universe.html', 'Universe Map'],
      ['Trường (thể chế)', 'truong.html', 'The School (institution)'],
      ['Nền tảng học thuật', 'truong-hoc-thuat.html', 'Academic Platform'],
      ['Sổ điểm giảng viên', 'instructor-grading.html', 'Instructor Gradebook'],
    ]],
    ['🎮 Trò chơi · Games', '🎮 Games', [
      ['Game Bật Nghiệp', 'game.html', 'Bật Nghiệp game'],
      ['Hướng dẫn chơi', 'huong-dan.html', 'How to play'],
      ['BizOn Arcade', 'games.html', 'BizOn Arcade'],
      ['Hộ Chiếu Thương Hiệu', 'brand-passport.html', 'Brand Passport'],
      ['IE Lab · Quốc tế hóa', 'lab/ie-lab.html', 'IE Lab · Internationalisation'],
      ['Bến Phù Sa', 'ben-phu-sa.html', 'Bến Phù Sa'],
      ['🧪 Sảnh 3D (thử nghiệm)', 'hub-3d.html', '🧪 3D Lobby (experimental)'],
    ]],
    ['🎨 Kho sáng tạo · Creative', '🎨 Creative', [
      ['Kho Âm nhạc', 'am-nhac.html', 'Music library'],
      ['Thư viện Sáng tạo', 'thu-vien.html', 'Creative Library'],
      ['Hậu trường sản xuất nhạc', 'hau-truong.html', 'Behind the Scenes: Music Production'],
    ]],
    ['🎓 Giảng dạy · Educators', '🎓 Educators', [
      ['Kịch bản lớp học', 'lop-hoc.html', 'Classroom scenario'],
      ['Bảng điều khiển lớp', 'giang-vien.html', 'Class dashboard'],
      ['Khảo sát trước–sau', 'khao-sat-online.html', 'Pre/post survey'],
      ['Phiếu khảo sát (bản in A4)', 'khao-sat.html', 'Survey Sheet (A4 printable)'],
      ['Học thuật & Model Cards', 'hoc-thuat.html', 'Academics & Model Cards'],
      ['Thẻ mô tả Lumina', 'lumina.html', 'Lumina system card'],
      ['Bằng chứng lớp học', 'bang-chung.html', 'Classroom evidence'],
    ]],
    ['🏛️ Về BizOn · About', '🏛️ About BizOn', [
      ['Giới thiệu', 'gioi-thieu.html', 'About'],
      ['Định hướng tác động vùng', 'dinh-huong.html', 'Regional impact orientation'],
      ['Đội ngũ sáng lập', 'doi-ngu.html', 'The founding team'],
      ['Danh mục dự án', 'du-an.html', 'Projects portfolio'],
      ['Giải pháp & gói triển khai', 'giai-phap.html', 'Solutions & Deployment Plans'],
      ['Tham gia nhóm', 'tuyen-dung.html', 'Join the team'],
      ['Liên hệ & Hợp tác', 'lien-he.html', 'Contact & Partnership'],
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
    /* --- chuyển sản phẩm trong hệ sinh thái (chỉ điều hướng, không dùng chung dữ liệu) --- */
    '#bz-footer .bzf-eco{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 18px;' +
      'margin-top:24px;padding:14px 16px;border:1px solid rgba(0,102,135,.14);border-radius:14px;background:rgba(0,102,135,.05)}' +
    '#bz-footer .bzf-eco-label{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.7}' +
    '#bz-footer .bzf-eco-label b{color:#006687}' +
    '#bz-footer .bzf-eco-links{display:flex;flex-wrap:wrap;gap:8px}' +
    '#bz-footer .bzf-eco-links a{font-size:12px;font-weight:800;text-decoration:none;padding:6px 12px;border-radius:999px;' +
      'background:#fff;border:1px solid rgba(0,102,135,.18);color:#006687}' +
    '#bz-footer .bzf-eco-links a:hover{background:#006687;color:#fff}' +
    '#bz-footer .bzf-eco-links a.bzf-eco-cur{background:#006687;color:#fff;border-color:#006687}' +
    'html[data-theme="dark"] #bz-footer .bzf-eco{border-color:rgba(92,196,230,.16);background:rgba(92,196,230,.05)}' +
    'html[data-theme="dark"] #bz-footer .bzf-eco-label b{color:#5cc4e6}' +
    'html[data-theme="dark"] #bz-footer .bzf-eco-links a{background:#0e2a33;border-color:rgba(92,196,230,.2);color:#5cc4e6}' +
    'html[data-theme="dark"] #bz-footer .bzf-eco-links a.bzf-eco-cur{background:#5cc4e6;color:#04222a;border-color:#5cc4e6}' +
    /* Sợi nhấn chung: cột "Vũ trụ" khoác jade thể chế (base clay giữ nguyên) */
    '#bz-footer .bzf-col-hub>summary{color:#0F5C4E}' +
    '#bz-footer .bzf-col-hub ul a{color:#0F5C4E}' +
    'html[data-theme="dark"] #bz-footer .bzf-col-hub>summary,html[data-theme="dark"] #bz-footer .bzf-col-hub ul a{color:#7FD9BE}' +
    '@media print{#bz-footer{display:none !important}}';
  document.head.appendChild(css);

  function build() {
    var f = document.createElement('footer');
    f.id = 'bz-footer';
    var cols = COLS.map(function (c) {
      var hub = c[0].indexOf('Vũ trụ') !== -1 ? ' bzf-col-hub' : '';
      return '<details class="bzf-col' + hub + '"><summary data-en="' + c[1] + '">' + c[0] + '</summary><ul>' +
        c[2].map(function (l) { return '<li><a href="' + l[1] + '" data-en="' + l[2] + '">' + l[0] + '</a></li>'; }).join('') +
        '</ul></details>';
    }).join('');
    f.innerHTML =
      '<div class="bzf-in">' +
        '<div class="bzf-top">' +
          '<div class="bzf-brand">' +
            '<a class="bzf-logo" href="index.html"><img src="assets/icons/icon-192.png" alt="BizOn">BizOn</a>' +
            '<p><span data-en="Claymorphism 3D business-simulation ecosystem for entrepreneurship education.">Hệ sinh thái mô phỏng kinh doanh 3D phong cách đất nặn cho đào tạo khởi nghiệp.</span></p>' +
          '</div>' +
          '<div class="bzf-meta">' +
            '📦 DOI <a href="https://doi.org/10.5281/zenodo.21592241" target="_blank" rel="noopener">10.5281/zenodo.21592241</a><br>' +
            '⭐ <a href="https://github.com/thuyhuongctu/BizOn" target="_blank" rel="noopener">github.com/thuyhuongctu/BizOn</a>' +
          '</div>' +
        '</div>' +
        '<div class="bzf-grid">' + cols + '</div>' +
        '<div class="bzf-eco">' +
          '<span class="bzf-eco-label" data-en-html="Ecosystem · &lt;b&gt;Je m\'appelle Hương&lt;/b&gt;">Hệ sinh thái · <b>Je m\'appelle Hương</b></span>' +
          '<span class="bzf-eco-links">' +
            '<a class="bzf-eco-cur" href="index.html" aria-current="true">BizOn</a>' +
            '<a href="vietlens/gioi-thieu.html">VietLens AI</a>' +
            '<a href="https://thuyhuongctu.github.io/M-AIDA/" target="_blank" rel="noopener">M-AIDA ↗</a>' +
          '</span>' +
        '</div>' +
        '<p class="bzf-cite">Cite (APA 7): Do, T. H., &amp; Phan, A. T. (2026). <i>BizOn Bật Nghiệp: A 3D claymorphism business-simulation game for entrepreneurship education</i> [Computer software]. https://doi.org/10.5281/zenodo.21592241</p>' +
        '<div class="bzf-tail" id="bzf-tail"></div>' +
        '<div class="bzf-legal">' +
          '<span data-en="© 2026 Bizonland · Do Thuy Huong &amp; Phan Anh Tu · All rights reserved">© 2026 Bizonland · Đỗ Thùy Hương &amp; Phan Anh Tú · Bảo lưu mọi quyền</span>' +
          '<span><a href="chinh-sach.html" data-en="Privacy policy">Chính sách quyền riêng tư</a> · <a href="reset.html" data-en="Refresh the app">Làm mới ứng dụng</a></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(f);

    // Dời 2 dòng Liên hệ + disclaimer sẵn có vào trong footer (tránh lặp)
    var tail = document.getElementById('bzf-tail');
    Array.prototype.slice.call(document.querySelectorAll('body > p')).forEach(function (p) {
      var t = p.textContent || '';
      if (t.indexOf('✉️ Liên hệ') === 0 || t.indexOf('🎓 Trang web') === 0 ||
          t.indexOf('✉️ Contact') === 0 || t.indexOf('🎓 This website') === 0) tail.appendChild(p);
    });

    // Trang đất sét không có site-ui.js: tự dịch chân trang vừa bơm (data-en) theo ngôn ngữ hiện tại.
    // Trang có site-ui.js thì để applyLang() của nó lo, tránh phát bizon:langchange hai lần.
    // Chỉ dịch lại, không lưu 'bizon-lang' (khách chưa chọn thì giữ mặc định của trang).
    if (!window.applyLang && window.clayRefreshLang) window.clayRefreshLang();
    else if (!window.applyLang && window.clayApplyLang) window.clayApplyLang(window.clayCurrentLang ? window.clayCurrentLang() : 'vi');

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
