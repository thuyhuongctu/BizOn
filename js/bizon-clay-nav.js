/* ============================================================================
   BizOn Clay — thanh điều hướng đất sét (pill-nav) dùng chung cho trang đất sét.
   Bơm #clay-nav vào đầu <body>. Nút VI/EN nối với js/bizon-clay-i18n.js.
   Nạp SAU bizon-clay-i18n.js. CSS ở css/bizon-clay.css.
   ========================================================================== */
(function(){
  if(window.__bizonClayNav) return; window.__bizonClayNav = true;
  window.BIZON_NO_NAV = true; /* chặn site-nav.js cũ nếu vô tình được nạp */

  var LINKS = [
    { href:'universe.html',         vi:'Vũ trụ',    en:'Universe' },
    { href:'games.html',            vi:'Trò chơi',  en:'Games' },
    { href:'lop-hoc.html',          vi:'Lớp học',   en:'Classroom' },
    { href:'truong-hoc-thuat.html', vi:'Học thuật', en:'Academic' },
    { href:'bang-chung.html',       vi:'Bằng chứng',en:'Evidence' },
    { href:'giai-phap.html',        vi:'Pilot',     en:'Pilot' },
    { href:'doi-ngu.html',          vi:'Đội ngũ',   en:'About' }
  ];
  var CTA = { href:'game.html', vi:'Bắt đầu', en:'Launch' };
  var DL_ARIA = { vi:'Tải app BizOn', en:'Get the BizOn app' };
  var DL_OPTIONS = [
    { href:'https://play.google.com/store/apps/details?id=io.github.thuyhuongctu.bizon', ext:true,
      vi:'🤖 Android — Google Play', en:'🤖 Android — Google Play' },
    { href:'huong-dan-cai-dat.html', ext:false,
      vi:'🍎 iPhone / iPad — Xem hướng dẫn cài', en:'🍎 iPhone / iPad — See install guide' }
  ];

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  function linksHtml(){
    return LINKS.map(function(l){
      var cur = l.href.toLowerCase() === here ? ' aria-current="page"' : '';
      return '<a href="'+l.href+'"'+cur+' data-en="'+esc(l.en)+'">'+esc(l.vi)+'</a>';
    }).join('');
  }

  function dlMenuHtml(){
    return DL_OPTIONS.map(function(o){
      var extra = o.ext ? ' target="_blank" rel="noopener"' : '';
      return '<a href="'+o.href+'"'+extra+' data-en="'+esc(o.en)+'">'+esc(o.vi)+'</a>';
    }).join('');
  }

  var nav = document.createElement('nav');
  nav.id = 'clay-nav';
  nav.setAttribute('aria-label', 'BizOn');
  nav.innerHTML =
    '<div class="cn-bar">'
    + '<a class="cn-brand" href="index.html" aria-label="BizOn">Biz<span class="cn-o"></span>n</a>'
    + '<div class="cn-links">' + linksHtml() + '</div>'
    + '<div class="cn-right">'
      + '<div class="cn-lang" role="group" aria-label="Ngôn ngữ / Language">'
        + '<button type="button" data-lang="vi" aria-pressed="true">VI</button>'
        + '<button type="button" data-lang="en" aria-pressed="false">EN</button>'
      + '</div>'
      + '<div class="cn-dlwrap">'
        + '<button type="button" class="cn-dl" aria-haspopup="true" aria-expanded="false" aria-label="'+esc(DL_ARIA.vi)+'" data-en-aria="'+esc(DL_ARIA.en)+'">⬇</button>'
        + '<div class="cn-dlmenu" hidden>' + dlMenuHtml() + '</div>'
      + '</div>'
      + '<a class="cn-cta" href="'+CTA.href+'" data-en="'+esc(CTA.en)+'">'+esc(CTA.vi)+'</a>'
    + '</div>'
    + '</div>'
    + '<div class="cn-row2">' + linksHtml() + '</div>';

  document.body.insertBefore(nav, document.body.firstChild);

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

  /* Dịch nhãn nav vừa bơm theo ngôn ngữ hiện tại */
  var cur = window.clayCurrentLang ? window.clayCurrentLang() : 'vi';
  if(window.clayApplyLang) window.clayApplyLang(cur); else syncLang(cur);
  syncLang(cur);
})();
