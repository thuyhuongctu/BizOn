/* ============================================================================
   BizOn Clay — Kịch bản lớp học: dựng hero + mục lục + các khối nội dung.
   Đọc window.BZ_LOP.vi / .en (js/lop-hoc-data.js + lop-hoc-data-en.js).
   Toàn bộ nội dung song ngữ nằm trong dữ liệu — đổi ngôn ngữ thì dựng lại.
   Nạp SAU bizon-clay-i18n.js và hai tệp dữ liệu.
   ========================================================================== */
(function(){
  if(window.__bizonLop) return; window.__bizonLop = true;

  var CLAY = ['#7FD3DC','#FFD58A','#F4B6C2','#A9DCC4','#D9F0F2'];
  var COLS = { 2:'minmax(160px,1fr) minmax(0,2fr)', 3:'minmax(110px,.8fr) minmax(130px,1fr) minmax(0,2.2fr)' };
  function lang(){ return (window.clayCurrentLang && window.clayCurrentLang()) === 'en' ? 'en' : 'vi'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }

  function tableHtml(tb){
    var n = tb.head.length, cols = COLS[n] || COLS[3], minW = n===3 ? '620px' : '420px';
    var h = '<div style="margin-top:16px">';
    if(tb.cap) h += '<div style="margin-bottom:8px;font-size:14px;font-weight:800">'+esc(tb.cap)+'</div>';
    h += '<div style="overflow-x:auto;border-radius:18px;background:var(--clay-tray);box-shadow:inset 0 3px 6px rgba(110,70,30,.12)"><div style="min-width:'+minW+';padding:6px">';
    h += '<div style="display:grid;grid-template-columns:'+cols+';gap:12px;padding:10px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#7A4A0E">'
      + tb.head.map(function(hd){ return '<div>'+esc(hd)+'</div>'; }).join('') + '</div>';
    h += tb.rows.map(function(row){
      return '<div style="display:grid;grid-template-columns:'+cols+';gap:12px;padding:12px;margin-top:4px;border-radius:14px;background:var(--clay-card);font-size:14px;line-height:1.55;color:#24403F">'
        + row.map(function(v,j){ return '<div style="font-weight:'+(j===0?800:500)+';color:'+(j===0?'#033337':'#24403F')+'">'+esc(v)+'</div>'; }).join('')
        + '</div>';
    }).join('');
    h += '</div></div></div>';
    return h;
  }

  function sectionHtml(s, i){
    var bg = CLAY[i%5], n = i+1;
    var h = '<article id="s'+n+'" style="scroll-margin-top:100px;padding:28px;border-radius:32px;background:var(--clay-card);box-shadow:inset 0 -9px 0 rgba(110,70,30,.08),inset 0 5px 0 #fff,0 26px 36px -24px rgba(110,70,30,.5)">';
    h += '<h2 style="margin:0;display:flex;align-items:center;gap:12px;font-family:var(--clay-head);font-weight:800;line-height:1.2;font-size:clamp(21px,2.4vw,26px)"><span style="flex:none;width:42px;height:42px;border-radius:14px;background:'+bg+';display:grid;place-items:center;font-size:18px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.1),inset 0 3px 0 rgba(255,255,255,.5)">'+n+'</span>'+esc(s.h)+'</h2>';
    if(s.tag) h += '<p style="margin:10px 0 0;font-size:13px;font-weight:700;line-height:1.55;color:var(--clay-accent)">'+esc(s.tag)+'</p>';
    if(s.intro) h += '<p style="margin:12px 0 0;font-size:15px;line-height:1.65;color:var(--clay-sub)">'+esc(s.intro)+'</p>';
    if(s.dlTop) h += '<a href="'+esc(s.dlTop[1])+'" style="display:inline-flex;margin-top:14px;padding:10px 16px;border-radius:999px;background:var(--clay-teal);color:#fff;font-size:13px;font-weight:800;box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)">↓ '+esc(s.dlTop[0])+'</a>';
    (s.tables||[]).forEach(function(tb){ h += tableHtml(tb); });
    if(s.note) h += '<p style="margin:12px 0 0;font-size:13px;font-style:italic;line-height:1.6;color:var(--clay-sub)">'+esc(s.note)+'</p>';
    (s.list||[]).forEach(function(l){
      h += '<div style="display:flex;gap:12px;margin-top:12px;font-size:15px;line-height:1.6;color:var(--clay-sub)"><span style="flex:none;width:12px;height:12px;margin-top:6px;border-radius:50%;background:var(--clay-gold);box-shadow:inset 0 -2px 0 rgba(0,0,0,.15)"></span><div>'+(l[0]?'<strong style="color:var(--clay-ink)">'+esc(l[0])+'</strong> ':'')+esc(l[1])+'</div></div>';
    });
    (s.ol||[]).forEach(function(q,k){
      h += '<div style="display:grid;grid-template-columns:36px minmax(0,1fr);gap:12px;align-items:start;margin-top:12px"><span style="width:36px;height:36px;border-radius:12px;background:#FFD58A;display:grid;place-items:center;font-weight:800;box-shadow:inset 0 -3px 0 rgba(0,0,0,.1)">'+(k+1)+'</span><div style="padding-top:6px;font-size:15px;line-height:1.6;color:#24403F">'+esc(q)+'</div></div>';
    });
    (s.weights||[]).forEach(function(w,k){
      h += '<div style="margin-top:14px"><div style="display:flex;justify-content:space-between;gap:12px;font-size:15px;font-weight:800"><span>'+esc(w[0])+'</span><span style="color:var(--clay-teal)">'+w[1]+'%</span></div>'
        + '<div style="margin-top:6px;height:18px;border-radius:999px;background:var(--clay-tray);box-shadow:inset 0 3px 5px rgba(110,70,30,.18);overflow:hidden"><div style="height:100%;width:'+w[1]+'%;border-radius:999px;background:'+CLAY[k%5]+';box-shadow:inset 0 -4px 0 rgba(0,0,0,.12),inset 0 3px 0 rgba(255,255,255,.4)"></div></div>'
        + '<div style="margin-top:4px;font-size:13px;color:var(--clay-sub)">'+esc(w[2])+'</div></div>';
    });
    if(s.box){
      h += '<div style="margin-top:16px;padding:18px 20px;border-radius:22px;background:#D9F0F2;box-shadow:inset 0 -5px 0 rgba(0,0,0,.05)"><div style="font-size:15px;font-weight:800;color:#03474F">'+esc(s.box.t)+'</div>';
      (s.box.items||[]).forEach(function(it){ h += '<div style="display:flex;gap:10px;margin-top:8px;font-size:14px;line-height:1.6;color:#123B3E"><span style="flex:none;width:8px;height:8px;margin-top:8px;border-radius:50%;background:#006687"></span>'+esc(it)+'</div>'; });
      if(s.box.dl) h += '<a href="'+esc(s.box.dl[1])+'" style="display:inline-flex;margin-top:12px;padding:10px 16px;border-radius:999px;background:var(--clay-teal);color:#fff;font-size:13px;font-weight:800;box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)">↓ '+esc(s.box.dl[0])+'</a>';
      h += '</div>';
    }
    if(s.labs){
      h += '<div style="margin-top:18px;padding:18px 20px;border-radius:22px;background:var(--clay-cream-deep)"><div style="font-size:15px;font-weight:800">'+esc(s.labs.t)+'</div><p style="margin:4px 0 12px;font-size:13px;line-height:1.55;color:var(--clay-sub)">'+esc(s.labs.d)+'</p><div style="display:flex;flex-wrap:wrap;gap:8px">'
        + s.labs.items.map(function(k){ return '<a href="'+esc(k[1])+'" style="padding:9px 14px;border-radius:999px;background:var(--clay-card);color:var(--clay-ink);font-size:13px;font-weight:800;box-shadow:inset 0 -3px 0 rgba(110,70,30,.15)">'+esc(k[0])+'</a>'; }).join('')
        + '</div></div>';
    }
    h += '</article>';
    return h;
  }

  function render(){
    var L = window.BZ_LOP; if(!L || !L.vi || !L.en) return;
    var d = L[lang()];
    var set = function(id, html){ var e = document.getElementById(id); if(e) e.innerHTML = html; };

    set('lop-eyebrow', esc(d.eyebrow));
    set('lop-h1', esc(d.h1));
    set('lop-lead', esc(d.lead));

    set('lop-actions',
      '<a href="game.html" style="padding:12px 18px;border-radius:18px;font:800 15px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.14),inset 0 3px 0 rgba(255,255,255,.3),0 12px 18px -12px rgba(110,70,30,.6);background:var(--clay-teal);color:#fff">'+esc(d.b1)+' →</a>'
      + '<a href="BizOn Game 3D.html" style="padding:12px 18px;border-radius:18px;font:800 15px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.14),inset 0 3px 0 rgba(255,255,255,.3),0 12px 18px -12px rgba(110,70,30,.6);background:var(--clay-card);color:var(--clay-ink)">'+esc(d.b2)+'</a>'
      + (d.b4 ? '<a href="lab/ho-chieu-sau-rieng.html" style="padding:12px 18px;border-radius:18px;font:800 15px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.14),inset 0 3px 0 rgba(255,255,255,.3),0 12px 18px -12px rgba(110,70,30,.6);background:var(--clay-gold);color:#033337">'+esc(d.b4)+'</a>' : '')
      + '<button type="button" id="lop-print" style="border:0;cursor:pointer;padding:12px 18px;border-radius:18px;font:800 15px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.14),inset 0 3px 0 rgba(255,255,255,.3),0 12px 18px -12px rgba(110,70,30,.6);background:var(--clay-card);color:var(--clay-ink)">'+esc(d.b3)+'</button>');

    set('lop-toc', d.sec.map(function(s,i){
      return '<a href="#s'+(i+1)+'" style="padding:7px 12px;border-radius:999px;background:'+CLAY[i%5]+';color:var(--clay-ink);font-size:13px;font-weight:700;box-shadow:inset 0 -3px 0 rgba(0,0,0,.08)">'+(i+1)+' · '+esc(s.h)+'</a>';
    }).join(''));

    set('lop-sections', d.sec.map(sectionHtml).join(''));

    set('lop-cta',
      '<h2 style="margin:0;font-family:var(--clay-head);font-size:clamp(26px,3.2vw,36px);font-weight:800;line-height:1.14;color:#fff">'+esc(d.ctaT)+'</h2>'
      + '<p style="margin:10px auto 0;max-width:34em;font-size:15px;line-height:1.6;color:#D6EEF2">'+esc(d.ctaB)+'</p>'
      + '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:20px">'
        + '<a href="game.html" style="padding:12px 18px;border-radius:18px;font:800 15px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.14),inset 0 3px 0 rgba(255,255,255,.3),0 12px 18px -12px rgba(110,70,30,.6);background:var(--clay-gold);color:#033337">'+esc(d.c1)+'</a>'
        + '<a href="lien-he.html" style="padding:12px 18px;border-radius:18px;font:800 15px var(--clay-head);box-shadow:inset 0 -5px 0 rgba(0,0,0,.14),inset 0 3px 0 rgba(255,255,255,.3),0 12px 18px -12px rgba(110,70,30,.6);background:var(--clay-card);color:var(--clay-ink)">'+esc(d.c3)+'</a>'
      + '</div>');

    var pb = document.getElementById('lop-print'); if(pb) pb.onclick = function(){ window.print(); };
  }

  function init(){
    if(window.BZ_LOP && window.BZ_LOP.vi && window.BZ_LOP.en){ render(); }
    else { var w = setInterval(function(){ if(window.BZ_LOP && window.BZ_LOP.vi && window.BZ_LOP.en){ clearInterval(w); render(); } }, 100); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('bizon:langchange', function(){ render(); });
})();
