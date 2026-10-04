/* ============================================================================
   BizOn Clay — chân trang đất sét dùng chung cho trang bản đất sét.
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
      { href:'game.html', vi:'Game Bật Nghiệp', en:'BizOn: Startup' },
      { href:'games.html', vi:'BizOn Arcade', en:'BizOn Arcade' },
      { href:'brand-passport.html', vi:'Brand Passport', en:'Brand Passport' },
      { href:'ben-phu-sa.html', vi:'Bến Phù Sa', en:'Ben Phu Sa' }
    ])
    + col('Sáng tạo','Creative',[
      { href:'am-nhac.html', vi:'Kho Âm nhạc', en:'Music library' },
      { href:'thu-vien.html', vi:'Thư viện Sáng tạo', en:'Creative library' }
    ])
    + col('Về BizOn','About',[
      { href:'gioi-thieu.html', vi:'Giới thiệu', en:'About' },
      { href:'doi-ngu.html', vi:'Đội ngũ sáng lập', en:'Team' },
      { href:'bang-chung.html', vi:'Bằng chứng lớp học', en:'Evidence' },
      { href:'lien-he.html', vi:'Liên hệ & Hợp tác', en:'Contact' }
    ]);

  var disVi = 'Trang web chỉ phục vụ mục đích giáo dục và nghiên cứu, không đại diện cho bất kỳ tổ chức chính trị nào. Hình ảnh quốc kỳ, bản đồ chỉ mang ý nghĩa minh họa văn hóa – giáo dục.';
  var disEn = 'This website serves educational and research purposes only and does not represent any political organization. Flag and map images are cultural and educational illustrations only.';

  var f = document.createElement('footer');
  f.id = 'clay-footer';
  f.innerHTML =
    '<div class="cf-wave" aria-hidden="true"></div>'
    + '<div class="cf-inner">'
      + '<div class="cf-cols">' + cols + '</div>'
      + '<div>© 2026 Đỗ Thùy Hương &amp; PGS.TS. Phan Anh Tú – BizOn Bật Nghiệp</div>'
      + '<a class="cf-gp" href="'+GP+'" target="_blank" rel="noopener" data-en="▶ Get it on Google Play">▶ Tải trên Google Play</a>'
      + '<div style="display:flex;flex-wrap:wrap;gap:16px">'
        + '<a href="chinh-sach.html" style="color:var(--clay-foot-link)" data-en="Privacy">Chính sách</a>'
        + '<a href="tuyen-dung.html" style="color:var(--clay-foot-link)" data-en="Jobs">Tuyển dụng</a>'
        + '<a href="lien-he.html" style="color:var(--clay-foot-link)" data-en="Contact">Liên hệ</a>'
      + '</div>'
      + '<div class="cf-dis" data-en="'+esc(disEn)+'">'+esc(disVi)+'</div>'
    + '</div>';

  document.body.appendChild(f);

  if(window.clayApplyLang) window.clayApplyLang(window.clayCurrentLang ? window.clayCurrentLang() : 'vi');
})();
