/* ============================================================================
   BizOn Clay — Thư viện Sáng tạo: lưới ảnh + tìm kiếm + lọc nhóm + lightbox.
   Đọc window.BZ_LIB (js/thu-vien-data.js). Chrome song ngữ theo clayCurrentLang();
   chú thích từng mục giữ tiếng Việt (nguồn tư liệu). Nạp SAU bizon-clay-i18n.js
   và thu-vien-data.js.
   ========================================================================== */
(function(){
  if(window.__bizonLib) return; window.__bizonLib = true;

  var T = {
    vi:{ all:'Tất cả', items:'mục', none:'Không có mục nào khớp từ khóa.', ph:'Tìm trong thư viện – tên nhân vật, bối cảnh, ca khúc…',
      s:['Tạo hình nhân vật','Dàn nhân vật «Hộ Chiếu Thương Hiệu»','Bối cảnh & minh họa','Âm nhạc gốc','Sản phẩm & Quà tặng'],
      n:['', 'Bộ 21 tạo hình đất nặn 3D của game Hộ Chiếu Thương Hiệu – 6 cố vấn đồng hành và 4 doanh nghiệp Việt, phần lớn nhân vật có cả bản thường và bản lễ phục áo dài. Cả 21 tệp dựng trên cùng khung chuẩn 760 × 1100 px, chiều cao nhân vật thống nhất và cùng một đường chân.', '', '', 'Bộ cài áo (lapel pin) chính thức của BizOn – quà tặng cho đội vô địch và vật phẩm nhận diện thương hiệu.'],
      expr:'Bảng biểu cảm', exprD:'Hài lòng · Ngạc nhiên · Suy nghĩ',
      roles:{ceo:'CEO',cfo:'CFO',coo:'COO',cmo:'CMO',sec:'Thư ký pháp chế','aodai-nam':'Đại diện đội áo dài nam','aodai-nu':'Đại diện đội áo dài nữ'},
      musicLink:'Kho Âm nhạc BizOn' },
    en:{ all:'All', items:'items', none:'Nothing matches that search.', ph:'Search the library – character, scene, song…',
      s:['Character designs','The «Brand Passport» cast','Scenes & illustrations','Original music','Merch & gifts'],
      n:['', '21 3D clay figures for the Brand Passport game – 6 advisors and 4 Vietnamese firms, most with both an everyday and a formal áo dài version. All 21 files share one 760 × 1100 px frame, the same figure height and baseline.', '', '', 'Official BizOn lapel pins – prizes for the winning team and brand identity items.'],
      expr:'Expression sheet', exprD:'Pleased · Surprised · Thinking',
      roles:{ceo:'CEO',cfo:'CFO',coo:'COO',cmo:'CMO',sec:'Company Secretary','aodai-nam':'Team rep áo dài (male)','aodai-nu':'Team rep áo dài (female)'},
      musicLink:'BizOn Music Library' }
  };
  function lang(){ return (window.clayCurrentLang && window.clayCurrentLang()) === 'en' ? 'en' : 'vi'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function art(p){ return 'assets/' + p; }

  var q = '', sec = -1, lb = null, cur = null, A = null, vis = [];

  function fig(src,name,desc){ return {src:art(src),name:name,desc:desc,ar:'4/5',fit:'contain',pos:'50% 100%',pad:'8px 8px 0',bg:'#EAF4F2',span:'auto'}; }
  function sheet(a){ return {src:art(a[0]),name:a[1],desc:a[2],ar:'16/9',fit:'contain',pos:'50% 50%',pad:'0',bg:'#FFF3DA',span:'1 / -1'}; }

  function sections(){
    var D = window.BZ_LIB, t = T[lang()];
    return [
      { h:t.s[0], note:t.n[0], min:'180px', items:
        D.chars.map(function(a){ return fig('character/'+a[0], a[1], a[2]); })
        .concat(D.expr.map(function(k){ return Object.assign(fig('character/expressions/'+k+'-expressions.webp', t.expr+' – '+t.roles[k], t.exprD), {ar:'4/3',fit:'contain',pos:'50% 50%',pad:'0',bg:'#FFFFFF'}); }))
        .concat(D.sheets.slice(0,2).map(sheet)) },
      { h:t.s[1], note:t.n[1], min:'160px', items:
        D.cast.map(function(a){ return fig('character/'+a[0], a[1], a[2]); }).concat([sheet(D.sheets[2])]) },
      { h:t.s[2], note:'', min:'260px', items:
        D.scenes.map(function(a){ return {src:art('illustrations/'+a[0]),name:a[1],desc:a[2],ar:'16/10',fit:'cover',pos:'50% 30%',pad:'0',bg:'#F3E6CF',span:'auto'}; }) },
      { h:t.s[3], note:'', min:'200px', items:[], music:true },
      { h:t.s[4], note:t.n[4], min:'240px', items:
        D.merch.map(function(a){ return {src:art(a[0]),name:a[1],desc:a[2],ar:'1/1',fit:'cover',pos:'50% 30%',pad:'0',bg:'#F3E4C8',span:'auto'}; }) }
    ];
  }

  function match(x){ var s = q.trim().toLowerCase(); return !s || (x.name+' '+x.desc).toLowerCase().indexOf(s) > -1; }

  /* ---- trình phát nhạc nhỏ ---- */
  function play(f){
    if(cur === f && A){ A.pause(); cur = null; render(); return; }
    if(A) A.pause();
    A = new Audio(art('audio/'+f+'.mp3')); A.volume = .6;
    A.onended = function(){ cur = null; render(); };
    A = A; cur = f; A.play().catch(function(){}); render();
  }

  /* ---- lightbox ---- */
  function openLb(i){ lb = i; paintLb(); }
  function closeLb(){ lb = null; paintLb(); }
  function stepLb(d){ if(lb==null || !vis.length) return; lb = (lb + d + vis.length) % vis.length; paintLb(); }
  function paintLb(){
    var root = document.getElementById('lib-lb'); if(!root) return;
    if(lb==null || !vis[lb]){ root.style.display='none'; root.innerHTML=''; document.documentElement.style.overflow=''; return; }
    var it = vis[lb];
    document.documentElement.style.overflow = 'hidden';
    root.style.display = 'flex';
    root.innerHTML =
      '<img src="'+esc(it.src)+'" alt="'+esc(it.name)+'" style="max-width:min(92vw,1100px);max-height:74vh;object-fit:contain;border-radius:20px;background:rgba(255,255,255,.05)">'
      + '<div style="margin-top:16px;max-width:min(92vw,760px);text-align:center;color:#fff">'
        + '<div style="font-size:18px;font-weight:800">'+esc(it.name)+'</div>'
        + '<div style="margin-top:4px;font-size:14px;color:rgba(255,255,255,.72)">'+esc(it.desc)+'</div>'
        + '<div style="margin-top:8px;font-size:12px;font-weight:800;color:rgba(255,255,255,.5)">'+(lb+1)+' / '+vis.length+'</div>'
      + '</div>'
      + '<button data-lb="x" aria-label="Close" style="position:absolute;border:0;cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font:800 20px var(--clay-head);top:20px;right:20px">✕</button>'
      + '<button data-lb="p" aria-label="Previous" style="position:absolute;border:0;cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font:800 20px var(--clay-head);left:16px;top:50%">‹</button>'
      + '<button data-lb="n" aria-label="Next" style="position:absolute;border:0;cursor:pointer;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font:800 20px var(--clay-head);right:16px;top:50%">›</button>';
    root.querySelector('[data-lb="x"]').onclick = function(e){ e.stopPropagation(); closeLb(); };
    root.querySelector('[data-lb="p"]').onclick = function(e){ e.stopPropagation(); stepLb(-1); };
    root.querySelector('[data-lb="n"]').onclick = function(e){ e.stopPropagation(); stepLb(1); };
  }

  function render(){
    var D = window.BZ_LIB; if(!D) return;
    var t = T[lang()], S = sections();

    /* chips (đếm toàn bộ, không theo từ khóa) */
    var total = S.reduce(function(a,x){ return a + (x.music ? D.music.length : x.items.length); }, 0);
    var chips = [{label:t.all, n:total, i:-1}].concat(S.map(function(x,i){ return {label:x.h, n:(x.music?D.music.length:x.items.length), i:i}; }));
    var chipBox = document.getElementById('lib-chips');
    if(chipBox) chipBox.innerHTML = chips.map(function(c){
      var on = sec === c.i;
      return '<button type="button" data-chip="'+c.i+'" style="flex:none;border:0;cursor:pointer;padding:8px 14px;border-radius:999px;background:'+(on?'#006687':'#FFFBF4')+';color:'+(on?'#fff':'#033337')+';font:800 13px var(--clay-head);white-space:nowrap;box-shadow:inset 0 -3px 0 rgba(0,0,0,.1)">'+esc(c.label)+' <span style="opacity:.65">'+c.n+'</span></button>';
    }).join('');

    /* tracks (lọc theo từ khóa) */
    var tracks = D.music.filter(function(m){ return match({name:m[0],desc:m[1]}); });

    /* sections đã lọc + vis[] cho lightbox */
    vis = [];
    var out = S.map(function(x,i){
      var items = x.items.filter(match);
      return { h:x.h, note:x.note, min:x.min, items:items, music:x.music, tracksN:tracks.length, i:i };
    }).filter(function(x){ return (sec<0 || sec===x.i) && ((x.music?x.tracksN:x.items.length) > 0); });

    var secBox = document.getElementById('lib-sections');
    var html = '';
    out.forEach(function(x){
      html += '<section style="margin-bottom:56px">';
      html += '<h2 style="margin:0;font-family:var(--clay-head);font-size:clamp(26px,3.2vw,36px);font-weight:800;line-height:1.14">'+esc(x.h)+'</h2>';
      if(x.note) html += '<p style="margin:8px 0 0;max-width:48em;font-size:15px;line-height:1.6;color:var(--clay-sub)">'+esc(x.note)+'</p>';
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,'+x.min+'),1fr));gap:18px;margin-top:20px">';
      x.items.forEach(function(it){
        var k = vis.length; vis.push(it);
        html += '<figure style="margin:0;grid-column:'+it.span+';padding:10px;border-radius:26px;background:var(--clay-card);display:flex;flex-direction:column;box-shadow:inset 0 -7px 0 rgba(110,70,30,.08),inset 0 4px 0 #fff,0 18px 26px -20px rgba(110,70,30,.55)">'
          + '<button type="button" data-open="'+k+'" aria-label="'+esc(it.name)+'" style="border:0;padding:0;cursor:zoom-in;position:relative;display:block;width:100%;aspect-ratio:'+it.ar+';border-radius:18px;overflow:hidden;background:'+it.bg+'">'
          + '<img src="'+esc(it.src)+'" alt="'+esc(it.name)+'" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:'+it.fit+';object-position:'+it.pos+';padding:'+it.pad+'">'
          + '</button>'
          + '<figcaption style="padding:12px 6px 4px"><div style="font-size:15px;font-weight:800;line-height:1.3">'+esc(it.name)+'</div><div style="margin-top:3px;font-size:12px;line-height:1.45;color:var(--clay-sub)">'+esc(it.desc)+'</div></figcaption>'
          + '</figure>';
      });
      html += '</div>';
      if(x.music){
        tracks.forEach(function(m){
          var on = cur === m[2];
          html += '<button type="button" data-play="'+esc(m[2])+'" style="margin-top:12px;width:100%;border:0;cursor:pointer;text-align:left;display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;align-items:center;padding:12px 14px;border-radius:22px;background:'+(on?'#FFF3DA':'#FFFBF4')+';font-family:var(--clay-head);color:var(--clay-ink);box-shadow:inset 0 -6px 0 rgba(110,70,30,.08),0 14px 20px -16px rgba(110,70,30,.55)">'
            + '<span style="width:44px;height:44px;border-radius:50%;background:'+(on?'#E8762D':'#006687')+';color:#fff;display:grid;place-items:center;font-size:15px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.2),inset 0 3px 0 rgba(255,255,255,.3)">'+(on?'❚❚':'▶')+'</span>'
            + '<span style="display:flex;flex-direction:column"><strong style="font-size:15px">'+esc(m[0])+'</strong><span style="font-size:12px;color:var(--clay-sub)">'+esc(m[1])+'</span></span>'
            + '</button>';
        });
        html += '<a href="am-nhac.html" style="display:inline-flex;margin-top:14px;font-size:14px;font-weight:800">'+esc(t.musicLink)+' →</a>';
      }
      html += '</section>';
    });
    if(!out.length) html = '<p style="margin:0 0 64px;padding:28px;border-radius:26px;background:var(--clay-tray);text-align:center;font-size:15px;font-weight:700;color:var(--clay-sub)">'+esc(t.none)+'</p>';
    if(secBox) secBox.innerHTML = html;

    var countEl = document.getElementById('lib-count');
    if(countEl) countEl.textContent = (vis.length + tracks.length) + ' ' + t.items;

    /* wiring */
    if(chipBox) chipBox.querySelectorAll('button[data-chip]').forEach(function(b){ b.onclick = function(){ sec = +b.getAttribute('data-chip'); render(); }; });
    if(secBox){
      secBox.querySelectorAll('button[data-open]').forEach(function(b){ b.onclick = function(){ openLb(+b.getAttribute('data-open')); }; });
      secBox.querySelectorAll('button[data-play]').forEach(function(b){ b.onclick = function(){ play(b.getAttribute('data-play')); }; });
    }
    if(lb != null && lb >= vis.length) lb = vis.length ? vis.length-1 : null;
    paintLb();
  }

  function init(){
    var qi = document.getElementById('lib-q');
    if(qi){ qi.setAttribute('placeholder', T[lang()].ph); qi.addEventListener('input', function(){ q = qi.value; render(); }); }
    var root = document.getElementById('lib-lb');
    if(root) root.addEventListener('click', function(e){ if(e.target === root) closeLb(); });
    window.addEventListener('keydown', function(e){
      if(lb==null) return;
      if(e.key==='Escape') closeLb();
      else if(e.key==='ArrowRight') stepLb(1);
      else if(e.key==='ArrowLeft') stepLb(-1);
    });
    if(window.BZ_LIB){ render(); }
    else { var w = setInterval(function(){ if(window.BZ_LIB){ clearInterval(w); render(); } }, 100); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('bizon:langchange', function(){
    var qi = document.getElementById('lib-q'); if(qi) qi.setAttribute('placeholder', T[lang()].ph);
    if(window.BZ_LIB) render();
  });
})();
