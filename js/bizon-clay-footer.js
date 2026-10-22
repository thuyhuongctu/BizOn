/* ============================================================================
   BizOn Clay – chân trang đất sét dùng chung cho trang bản đất sét.
   Bơm #clay-footer vào cuối <body>. Nạp SAU bizon-clay-i18n.js.
   ========================================================================== */
(function(){
  if(window.__bizonClayFooter) return; window.__bizonClayFooter = true;

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function col(titleVi, titleEn, links){
    return '<div><h4 data-en="'+esc(titleEn)+'">'+esc(titleVi)+'</h4>'
      + links.map(function(l){ return '<a href="'+l.href+'" data-en="'+esc(l.en)+'">'+esc(l.vi)+'</a>'; }).join('')
      + '</div>';
  }

  var GP = 'https://play.google.com/store/apps/details?id=io.github.thuyhuongctu.bizon';
  var cols =
    col('Trò chơi','Games',[
      { href:'game.html', vi:'Bật Nghiệp', en:'Bật Nghiệp' },
      { href:'ben-phu-sa.html', vi:'Bến Phù Sa', en:'Bến Phù Sa' },
      { href:'brand-passport.html', vi:'Hộ Chiếu Thương Hiệu', en:'Brand Passport' },
      { href:'ho-chieu-sau-rieng.html', vi:'Hộ Chiếu Sầu Riêng', en:'Durian Passport' },
      { href:'games.html', vi:'BizOn Arcade', en:'BizOn Arcade' }
    ])
    + col('Về BizOn','About',[
      { href:'truong-gioi-thieu.html', vi:'Giới thiệu dự án', en:'About the project' },
      { href:'doi-ngu.html', vi:'Đội ngũ sáng lập', en:'Team' },
      { href:'dinh-huong.html', vi:'Định hướng tác động vùng', en:'Regional impact' },
      { href:'bang-chung.html', vi:'Bằng chứng lớp học', en:'Evidence' }
    ])
    + col('Sáng tạo','Creative',[
      { href:'am-nhac.html', vi:'Kho Âm nhạc', en:'Music library' },
      { href:'thu-vien.html', vi:'Thư viện Sáng tạo', en:'Creative library' }
    ])
    + col('Liên hệ','Contact',[
      { href:'lien-he.html', vi:'Liên hệ & Hợp tác', en:'Contact & partnerships' },
      { href:'tuyen-dung.html', vi:'Tuyển dụng', en:'Jobs' },
      { href:'chinh-sach.html', vi:'Chính sách quyền riêng tư', en:'Privacy policy' }
    ]);

  var disVi = 'Trang web chỉ phục vụ mục đích giáo dục và nghiên cứu, không đại diện cho bất kỳ tổ chức chính trị nào. Hình ảnh quốc kỳ, bản đồ chỉ mang ý nghĩa minh họa văn hóa – giáo dục.';
  var disEn = 'This website serves educational and research purposes only and does not represent any political organization. Flag and map images are cultural and educational illustrations only.';

  var f = document.createElement('footer');
  f.id = 'clay-footer';
  /* Bố cục: khối thương hiệu (logo + mô tả + Google Play) | 4 cột liên kết (2×2 trên điện thoại) | dải dưới cùng (bản quyền · DOI, miễn trừ) */
  f.innerHTML =
    '<div class="cf-wave" aria-hidden="true"></div>'
    + '<div class="cf-inner">'
      + '<div class="cf-top">'
        + '<div class="cf-brand">'
          + '<a class="cf-logo" href="index.html" aria-label="BizOn">Biz<span class="cf-o" aria-hidden="true"></span>n</a>'
          + '<p data-en="Decision simulations for business education – from the Mekong Delta.">Mô phỏng ra quyết định cho giáo dục kinh doanh – từ Đồng bằng sông Cửu Long.</p>'
          + '<a class="cf-gp" href="'+GP+'" target="_blank" rel="noopener" data-en="▶ Get it on Google Play">▶ Tải trên Google Play</a>'
        + '</div>'
        + '<nav class="cf-cols" aria-label="Liên kết chân trang" data-en-aria="Footer links">' + cols + '</nav>'
      + '</div>'
      + '<div class="cf-bottom">'
        + '<div class="cf-legal">'
          + '<span data-en="© 2026 Bizonland · Do Thuy Huong &amp; Phan Anh Tu · All rights reserved">© 2026 Bizonland · Đỗ Thùy Hương &amp; Phan Anh Tú · Bảo lưu mọi quyền</span>'
          + '<span><span data-en="Cite as:" data-vi="Trích dẫn:">Trích dẫn:</span> <a href="https://doi.org/10.5281/zenodo.23325489" target="_blank" rel="noopener">doi:10.5281/zenodo.23325489</a></span>'
        + '</div>'
        + '<div class="cf-dis" data-en="'+esc(disEn)+'">'+esc(disVi)+'</div>'
      + '</div>'
    + '</div>';

  document.body.appendChild(f);

  /* Dịch chân trang vừa bơm theo ngôn ngữ hiện tại, không lưu lựa chọn */
  if(window.clayRefreshLang) window.clayRefreshLang();
})();
