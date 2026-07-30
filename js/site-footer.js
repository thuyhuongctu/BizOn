/* BizOn — Chân trang dùng chung toàn site (theo mẫu trang M-AIDA)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Khối thương hiệu + DOI, ba cột liên kết tới mọi trang, dòng trích dẫn
 * APA 7 và phần liên hệ/disclaimer. Tự gắn vào cuối trang; hai dòng
 * "Liên hệ" và "🎓 Trang web chỉ phục vụ..." sẵn có được dời vào trong
 * footer để không lặp nội dung. Không gắn trên game.html (giao diện app). */
(function () {
  if (/game\.html$/.test(location.pathname)) return;

  var COLS = [
    ['🧭 Khám phá · Explore', [
      ['Game Bật Nghiệp', 'game.html'],
      ['Giới thiệu', 'gioi-thieu.html'],
      ['BizOn Arcade', 'games.html'],
      ['Hộ Chiếu Thương Hiệu', 'brand-passport.html'],
      ['Go Global', 'global.html'],
      ['Kho Âm nhạc', 'am-nhac.html'],
      ['Thư viện Sáng tạo', 'thu-vien.html'],
    ]],
    ['🎓 Giảng viên & Nghiên cứu · Educators', [
      ['Kịch bản lớp học', 'lop-hoc.html'],
      ['Bảng điều khiển lớp', 'giang-vien.html'],
      ['Khảo sát trước–sau', 'khao-sat-online.html'],
      ['Học thuật & Model Cards', 'hoc-thuat.html'],
      ['Bằng chứng lớp học', 'bang-chung.html'],
      ['Giải pháp & gói triển khai', 'giai-phap.html'],
    ]],
    ['📄 Trang · Pages', [
      ['Trang chủ', 'index.html'],
      ['Đội ngũ sáng lập', 'doi-ngu.html'],
      ['Danh mục dự án', 'du-an.html'],
      ['Tham gia nhóm', 'tuyen-dung.html'],
      ['Liên hệ & Hợp tác', 'lien-he.html'],
      ['Chính sách quyền riêng tư', 'chinh-sach.html'],
    ]],
  ];

  var css = document.createElement('style');
  css.textContent =
    '#bz-footer{margin-top:48px;padding:36px 20px 20px;background:rgba(0,102,135,.06);border-top:2px solid rgba(0,102,135,.12);' +
      'font-family:Manrope,\'Plus Jakarta Sans\',sans-serif;color:#033337}' +
    '#bz-footer .bzf-in{max-width:64rem;margin:0 auto}' +
    '#bz-footer .bzf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:26px}' +
    '#bz-footer .bzf-brand p{font-size:12px;line-height:1.6;opacity:.65;margin-top:8px}' +
    '#bz-footer .bzf-logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:16px}' +
    '#bz-footer .bzf-logo img{width:38px;height:38px;border-radius:12px}' +
    '#bz-footer h4{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.55;margin:0 0 10px}' +
    '#bz-footer ul{list-style:none;margin:0;padding:0}' +
    '#bz-footer ul a{display:block;font-size:13px;font-weight:700;color:#006687;text-decoration:none;padding:3.5px 0}' +
    '#bz-footer ul a:hover{text-decoration:underline}' +
    '#bz-footer .bzf-cite{font-size:11px;line-height:1.65;opacity:.6;border-top:1px solid rgba(0,102,135,.12);margin-top:26px;padding-top:16px}' +
    '#bz-footer .bzf-tail{text-align:center;margin-top:14px}' +
    '#bz-footer .bzf-tail p{max-width:42rem;margin:6px auto 0}' +
    'html[data-theme="dark"] #bz-footer{background:rgba(92,196,230,.06);border-top-color:rgba(92,196,230,.15);color:#d6ecf0}' +
    'html[data-theme="dark"] #bz-footer ul a{color:#5cc4e6}' +
    '@media print{#bz-footer{display:none !important}}';
  document.head.appendChild(css);

  function build() {
    var f = document.createElement('footer');
    f.id = 'bz-footer';
    var cols = COLS.map(function (c) {
      return '<div><h4>' + c[0] + '</h4><ul>' +
        c[1].map(function (l) { return '<li><a href="' + l[1] + '">' + l[0] + '</a></li>'; }).join('') +
        '</ul></div>';
    }).join('');
    f.innerHTML =
      '<div class="bzf-in">' +
        '<div class="bzf-grid">' +
          '<div class="bzf-brand">' +
            '<div class="bzf-logo"><img src="assets/icons/icon-192.png" alt="BizOn">BizOn <span style="color:#006687">Bật Nghiệp</span></div>' +
            '<p>Hệ sinh thái mô phỏng kinh doanh 3D phong cách đất nặn cho đào tạo khởi nghiệp.<br>Business simulation ecosystem for entrepreneurship education.</p>' +
            '<p>📦 DOI <a href="https://doi.org/10.5281/zenodo.21592241" target="_blank" rel="noopener" style="color:#006687;font-weight:700">10.5281/zenodo.21592241</a><br>' +
            '⭐ <a href="https://github.com/thuyhuongctu/BizOn" target="_blank" rel="noopener" style="color:#006687;font-weight:700">github.com/thuyhuongctu/BizOn</a></p>' +
          '</div>' + cols +
        '</div>' +
        '<p class="bzf-cite">Cite (APA 7): Do, T. H., &amp; Phan, A. T. (2026). <i>BizOn Bật Nghiệp: A claymorphism business-simulation ecosystem for entrepreneurship education</i> [Computer software]. https://doi.org/10.5281/zenodo.21592241</p>' +
        '<div class="bzf-tail" id="bzf-tail"></div>' +
      '</div>';
    document.body.appendChild(f);

    // Dời 2 dòng Liên hệ + disclaimer sẵn có vào trong footer (tránh lặp)
    var tail = document.getElementById('bzf-tail');
    Array.prototype.slice.call(document.querySelectorAll('body > p')).forEach(function (p) {
      var t = p.textContent || '';
      if (t.indexOf('✉️ Liên hệ') === 0 || t.indexOf('🎓 Trang web') === 0) tail.appendChild(p);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
