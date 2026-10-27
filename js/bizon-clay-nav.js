/* ============================================================================
   BizOn Clay – thanh điều hướng đất sét (pill-nav) dùng chung cho trang đất sét.
   Bơm #clay-nav vào đầu <body>. Nút VI/EN nối với js/bizon-clay-i18n.js.
   Nút ☀️/🌙 nối với js/bizon-boot.js (chỉ hiện khi trang có nạp boot, tức trang
   web; game không nạp boot nên giữ nguyên giao diện của game).
   Nạp SAU bizon-clay-i18n.js. CSS ở css/bizon-clay.css.
   ========================================================================== */
(function(){
  if(window.__bizonClayNav) return; window.__bizonClayNav = true;
  /* Trang được nhúng trong khung (vd pilot nhúng Learning Edition) dùng menu của trang ngoài */
  try{ if(window.top !== window.self) return; }catch(e){ return; }
  window.BIZON_NO_NAV = true; /* chặn site-nav.js cũ nếu vô tình được nạp */

  var LINKS = [
    { href:'universe.html',         vi:'Vũ trụ',    en:'Universe' },
    { href:'games.html',            vi:'Trò chơi',  en:'Games' },
    { href:'hanh-trinh.html',       vi:'Hành trình',en:'Journey' },
    /* Góc giảng viên: đặt sớm để hàng menu cuộn ngang trên điện thoại vẫn thấy ngay */
    { href:'giang-vien.html',       vi:'Giảng viên',en:'Instructors' },
    { href:'lop-hoc.html',          vi:'Lớp học',   en:'Classroom' },
    { href:'truong-hoc-thuat.html', vi:'Học thuật', en:'Academic' },
    { href:'bang-chung.html',       vi:'Bằng chứng',en:'Evidence' },
    { href:'giai-phap.html',        vi:'Pilot',     en:'Pilot' },
    { href:'doi-ngu.html',          vi:'Đội ngũ',   en:'About' }
  ];
  var CTA = { href:'game.html', vi:'Bắt đầu', en:'Launch' };
  var DL_ARIA = { vi:'Tải app BizOn', en:'Get the BizOn app' };
  var THEME_ARIA = { vi:'Chế độ tối', en:'Dark mode' };
  var hasTheme = typeof window.clayToggleTheme === 'function';
  var DL_OPTIONS = [
    { href:'https://play.google.com/store/apps/details?id=io.github.thuyhuongctu.bizon', ext:true,
      vi:'🤖 Android – Google Play', en:'🤖 Android – Google Play' },
    { href:'huong-dan-cai-dat.html', ext:false,
      vi:'🍎 iPhone / iPad – Xem hướng dẫn cài', en:'🍎 iPhone / iPad – See install guide' }
  ];

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  /* Trang ở thư mục con (app/, lab/…) nạp '../js/bizon-clay-nav.js': lấy phần trước
     'js/' làm gốc để mọi liên kết tương đối trỏ đúng về trang ở thư mục gốc. */
  var cs = document.currentScript;
  var BASE = cs ? (cs.getAttribute('src') || '').replace(/js\/bizon-clay-nav\.js.*$/, '') : '';
  function u(h){ return /^(?:[a-z]+:|#|\/)/i.test(h) ? h : BASE + h; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  function linksHtml(){
    return LINKS.map(function(l){
      var cur = l.href.toLowerCase() === here ? ' aria-current="page"' : '';
      return '<a href="'+u(l.href)+'"'+cur+' data-en="'+esc(l.en)+'">'+esc(l.vi)+'</a>';
    }).join('');
  }

  function dlMenuHtml(){
    return DL_OPTIONS.map(function(o){
      var extra = o.ext ? ' target="_blank" rel="noopener"' : '';
      return '<a href="'+u(o.href)+'"'+extra+' data-en="'+esc(o.en)+'">'+esc(o.vi)+'</a>';
    }).join('');
  }

  var nav = document.createElement('nav');
  nav.id = 'clay-nav';
  nav.setAttribute('aria-label', 'BizOn');
  nav.innerHTML =
    '<div class="cn-bar">'
    + '<a class="cn-brand" href="'+u('index.html')+'" aria-label="BizOn">Biz<span class="cn-o"></span>n</a>'
    + '<div class="cn-links">' + linksHtml() + '</div>'
    + '<div class="cn-right">'
      + '<div class="cn-lang" role="group" aria-label="Ngôn ngữ / Language">'
        + '<button type="button" data-lang="vi" aria-pressed="true">VI</button>'
        + '<button type="button" data-lang="en" aria-pressed="false">EN</button>'
      + '</div>'
      + (hasTheme ? '<button type="button" class="cn-theme" aria-pressed="false" aria-label="'+esc(THEME_ARIA.vi)+'" data-en-aria="'+esc(THEME_ARIA.en)+'">🌙</button>' : '')
      + '<div class="cn-dlwrap">'
        + '<button type="button" class="cn-dl" aria-haspopup="true" aria-expanded="false" aria-label="'+esc(DL_ARIA.vi)+'" data-en-aria="'+esc(DL_ARIA.en)+'">⬇</button>'
        + '<div class="cn-dlmenu" hidden>' + dlMenuHtml() + '</div>'
      + '</div>'
      + '<a class="cn-cta" href="'+u(CTA.href)+'" data-en="'+esc(CTA.en)+'">'+esc(CTA.vi)+'</a>'
    + '</div>'
    + '</div>'
    + '<div class="cn-row2">' + linksHtml() + '</div>';

  document.body.insertBefore(nav, document.body.firstChild);

  /* Liên kết «Bỏ qua tới nội dung»: phần tử đầu tiên khi bấm Tab, ẩn tới khi được focus – người dùng bàn phím và
     trình đọc màn hình nhảy qua menu vào thẳng <main> (rà soát 27/10/2026, theo danh mục ship requirements). */
  var mainEl = document.querySelector('main');
  if (mainEl) {
    if (!mainEl.id) mainEl.id = 'noi-dung';
    if (!mainEl.hasAttribute('tabindex')) mainEl.setAttribute('tabindex', '-1');
    var skip = document.createElement('a');
    skip.className = 'cn-skip'; skip.href = '#' + mainEl.id;
    skip.textContent = 'Bỏ qua tới nội dung'; skip.setAttribute('data-en', 'Skip to content');
    document.body.insertBefore(skip, document.body.firstChild);
  }

  /* Hàng 2 (màn hẹp): đánh dấu .cn-more khi còn mục khuất bên phải để CSS làm mờ mép */
  var row2 = nav.querySelector('.cn-row2');
  function syncMore(){ row2.classList.toggle('cn-more', row2.scrollLeft + row2.clientWidth < row2.scrollWidth - 4); }
  row2.addEventListener('scroll', syncMore, { passive:true });
  window.addEventListener('resize', syncMore);
  window.addEventListener('bizon:langchange', syncMore);
  syncMore();

  /* Nút tải app: mở menu chọn Android / iPhone */
  var dlBtn = nav.querySelector('.cn-dl');
  var dlMenu = nav.querySelector('.cn-dlmenu');
  function closeDlMenu(){
    dlMenu.hidden = true;
    dlBtn.setAttribute('aria-expanded', 'false');
  }
  dlBtn.addEventListener('click', function(e){
    e.stopPropagation();
    var open = dlMenu.hidden;
    dlMenu.hidden = !open;
    dlBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function(e){
    if(!dlMenu.hidden && !nav.querySelector('.cn-dlwrap').contains(e.target)) closeDlMenu();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeDlMenu();
  });

  /* Nút VI/EN */
  var btns = nav.querySelectorAll('.cn-lang button');
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      if(window.clayApplyLang) window.clayApplyLang(b.getAttribute('data-lang'));
    });
  });
  function syncLang(lang){
    btns.forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
  }
  window.addEventListener('bizon:langchange', function(e){ syncLang(e.detail && e.detail.lang); });

  /* Nút sáng/tối: biểu tượng chỉ chế độ sẽ chuyển sang, aria-pressed = đang tối */
  var themeBtn = nav.querySelector('.cn-theme');
  function syncTheme(){
    if(!themeBtn) return;
    var dark = window.clayCurrentTheme && window.clayCurrentTheme() === 'dark';
    themeBtn.textContent = dark ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-pressed', String(!!dark));
  }
  if(themeBtn){
    themeBtn.addEventListener('click', function(){ window.clayToggleTheme(); });
    window.addEventListener('bizon:themechange', syncTheme);
    syncTheme();
  }

  /* Dịch nhãn nav vừa bơm theo ngôn ngữ hiện tại (không lưu: khách chưa chọn thì giữ mặc định) */
  var cur = window.clayCurrentLang ? window.clayCurrentLang() : 'vi';
  if(window.clayRefreshLang) window.clayRefreshLang(); else syncLang(cur);
  syncLang(cur);
})();
