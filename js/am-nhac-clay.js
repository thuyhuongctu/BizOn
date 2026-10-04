/* ============================================================================
   BizOn Clay — Kho Âm nhạc v2: bàn xoay đĩa than + trình phát (vanilla).
   Đọc window.BZ_MUSIC (js/music-data.js). Song ngữ theo window.clayCurrentLang().
   Nạp SAU bizon-clay-i18n.js và music-data.js.
   ----------------------------------------------------------------------------
   «Bàn xoay» (deck) chứa một tuyển tập (k='c') hoặc một chùm ca khúc (k='g').
   Chọn bìa đĩa / đĩa ca khúc để nạp lên bàn xoay và phát; đĩa quay khi phát
   (animation-play-state), cần đọc nghiêng, 18 cột EQ. Một bài phát tại một
   thời điểm; hết bài tự sang bài kế trong hàng chờ.
   ========================================================================== */
(function(){
  if(window.__bizonMusic) return; window.__bizonMusic = true;

  var EQC = ['#7FD3DC','#FFD58A','#F4B6C2','#A9DCC4'];
  var SLEEVE = ['#E8762D','#006687','#1E7E8C','#C2581B'];
  var SHELF_BG = ['#7FD3DC','#FFD58A','#F4B6C2','#A9DCC4','#D9F0F2'];
  var LBL = {
    vi:{ studio:'Phòng thu đất sét', queue:'Hàng chờ', songs:'bài', versions:'bản',
         toGame:'Vào game', collection:'Tuyển tập', song:'Ca khúc' },
    en:{ studio:'Clay studio', queue:'Up next', songs:'songs', versions:'versions',
         toGame:'Open game', collection:'Collection', song:'Song' }
  };
  function lang(){ return (window.clayCurrentLang && window.clayCurrentLang()) === 'en' ? 'en' : 'vi'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function art(p){ return 'assets/' + p; }
  function url(id){ return 'assets/audio/' + id + '.mp3'; }
  function mm(x){ x = Math.floor(x||0); return Math.floor(x/60) + ':' + String(x%60).padStart(2,'0'); }

  /* ---- Trạng thái ---- */
  var A = null;                 // phần tử Audio dùng chung
  var deckK = 'g', deckI = 0;   // bàn xoay đang đặt: 'g' chùm / 'c' tuyển tập, chỉ số
  var cur = null, on = false, pos = 0, dur = 0;
  var queueFiles = [];          // hàng chờ hiện hành (các audioId)
  var nameMap = {};             // audioId -> {t, s} (tên hiển thị theo ngôn ngữ)

  function groupName(g){ var en = lang()==='en'; return (en && g[5]) || g[0]; }
  function groupDesc(g){ var en = lang()==='en'; return (en && g[4]) || g[2]; }
  function trackTitle(r){ var en = lang()==='en'; return (en && r[3]) || r[0]; }
  function trackSub(r){ var en = lang()==='en'; return (en && r[4]) || r[1]; }
  function colName(c){ return c[0]; }
  function colTone(c){ var en = lang()==='en'; return (en && c[5]) || c[2]; }

  function buildNameMap(){
    var M = window.BZ_MUSIC; nameMap = {};
    M.groups.forEach(function(g){
      var gn = groupName(g);
      g[3].forEach(function(r){
        var tt = trackTitle(r);
        nameMap[r[2]] = { t: tt.indexOf('«') > -1 ? tt : gn + ' – ' + tt, s: trackSub(r) };
      });
    });
  }

  /* Danh sách bài của bàn xoay hiện hành + metadata hiển thị */
  function deckInfo(){
    var M = window.BZ_MUSIC, l = LBL[lang()], items, dName, dArt, dHref;
    if(deckK === 'g'){
      var g = M.groups[deckI];
      dName = l.song + ' · ' + groupName(g);
      dArt = art(g[1]);
      dHref = 'am-nhac.html';
      items = g[3].map(function(r){ return { t: trackTitle(r), s: trackSub(r), f: r[2] }; });
    } else {
      var c = M.collections[deckI];
      dName = l.collection + ' · ' + colName(c);
      dArt = art(c[1]);
      dHref = c[3];
      items = c[4].map(function(f){ return { t:(nameMap[f]||{t:f}).t, s: colTone(c), f: f }; });
    }
    return { items: items, dName: dName, dArt: dArt, dHref: dHref };
  }

  /* ---- Trình phát ---- */
  function playFile(f, q){
    if(cur === f && A){ if(A.paused) A.play().catch(function(){}); else A.pause(); return; }
    if(A){ A.pause(); A.ontimeupdate = A.onended = A.onplay = A.onpause = null; }
    A = new Audio(url(f)); A.volume = .7;
    A.onplay = function(){ on = true; paint(); };
    A.onpause = function(){ on = false; paint(); };
    A.ontimeupdate = function(){ if(A.duration){ pos = A.currentTime; dur = A.duration; paintProgress(); } };
    A.onended = function(){
      var i = queueFiles.indexOf(cur);
      if(i > -1 && i+1 < queueFiles.length){ playFile(queueFiles[i+1], queueFiles); }
      else { on = false; paint(); }
    };
    cur = f; pos = 0; dur = 0; if(q) queueFiles = q;
    A.play().catch(function(){});
    paint();
  }

  /* Nạp một bàn xoay (chùm hoặc tuyển tập) rồi phát bài đầu */
  function loadDeck(k, i){
    deckK = k; deckI = i;
    var M = window.BZ_MUSIC;
    queueFiles = (k === 'g') ? M.groups[i][3].map(function(r){ return r[2]; }) : M.collections[i][4].slice();
    buildDeck();
    playFile(queueFiles[0], queueFiles);
  }

  /* ---- Dựng giao diện ---- */
  function buildDeck(){
    var box = document.getElementById('am-deck'); if(!box) return;
    var l = LBL[lang()], d = deckInfo();
    box.innerHTML =
      '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-bottom:22px">'
        + '<div style="display:flex;align-items:center;gap:10px;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7FD3DC"><span id="am-dot" style="width:10px;height:10px;border-radius:50%;background:#3E5A5C"></span>'+esc(l.studio)+'</div>'
        + '<div id="am-decklabel" style="font-size:13px;font-weight:700;color:#9CC9C9"></div>'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:clamp(24px,4vw,56px);align-items:center">'
        + '<div style="position:relative;width:100%;max-width:500px;aspect-ratio:1/1;justify-self:center">'
          + '<div style="position:absolute;inset:-4%;border-radius:36px;background:#0B4A4F;box-shadow:inset 0 -10px 0 rgba(0,0,0,.25),inset 0 6px 0 rgba(255,255,255,.08)"></div>'
          /* đĩa than */
          + '<div id="am-rec" style="position:absolute;inset:4%;border-radius:50%;background:repeating-radial-gradient(circle,#0E1F22 0 3px,#1A3337 3px 6px);box-shadow:0 24px 40px -14px rgba(0,0,0,.7),inset 0 0 0 10px #0A1719;animation:amSpin 6s linear infinite;animation-play-state:paused">'
            + '<div style="position:absolute;inset:30%;border-radius:50%;overflow:hidden;background:#FDA127;box-shadow:0 0 0 6px #FFD58A"><img src="'+esc(d.dArt)+'" alt="" style="width:100%;height:100%;object-fit:cover"></div>'
            + '<div style="position:absolute;left:48.5%;top:48.5%;width:3%;height:3%;border-radius:50%;background:#FBF4E8"></div>'
            + '<div style="position:absolute;inset:8%;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,.14),transparent 40%,transparent 60%,rgba(255,255,255,.06))"></div>'
          + '</div>'
          /* cần đọc */
          + '<div id="am-arm" style="position:absolute;right:2%;top:2%;width:12%;height:62%;transform-origin:50% 8%;transform:rotate(4deg);transition:transform .7s cubic-bezier(.3,1.4,.5,1)">'
            + '<div style="position:absolute;left:25%;top:0;width:50%;aspect-ratio:1;border-radius:50%;background:#E8762D;box-shadow:inset 0 -5px 0 rgba(0,0,0,.2),inset 0 3px 0 rgba(255,255,255,.35)"></div>'
            + '<div style="position:absolute;left:44%;top:6%;width:12%;height:84%;border-radius:8px;background:#FFFBF4;box-shadow:inset -3px 0 0 rgba(0,0,0,.12)"></div>'
            + '<div style="position:absolute;left:20%;bottom:0;width:60%;height:14%;border-radius:10px;background:#FDA127;box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)"></div>'
          + '</div>'
        + '</div>'
        + '<div style="min-width:0;display:flex;flex-direction:column;gap:14px">'
          + '<span id="am-deckname" style="align-self:flex-start;padding:6px 12px;border-radius:999px;background:#FDA127;color:#033337;font-size:12px;font-weight:800"></span>'
          + '<h2 id="am-title" style="margin:0;font-family:var(--clay-head);font-weight:800;font-size:clamp(28px,3.6vw,44px);line-height:1.12;text-wrap:balance;color:#fff"></h2>'
          + '<p id="am-sub" style="margin:0;font-size:15px;line-height:1.6;color:#BFE6EE"></p>'
          + '<div id="am-eq" style="height:64px;display:flex;align-items:flex-end;gap:5px"></div>'
          + '<div>'
            + '<div id="am-seek" style="height:14px;border-radius:999px;background:rgba(255,255,255,.12);box-shadow:inset 0 3px 5px rgba(0,0,0,.3);cursor:pointer;overflow:hidden"><div id="am-pct" style="height:100%;width:0%;border-radius:999px;background:#7FD3DC;box-shadow:inset 0 -3px 0 rgba(0,0,0,.15)"></div></div>'
            + '<div style="display:flex;justify-content:space-between;margin-top:6px;font-family:var(--clay-mono);font-size:12px;color:#9CC9C9"><span id="am-tc">0:00</span><span id="am-td">–:––</span></div>'
          + '</div>'
          + '<div style="display:flex;align-items:center;gap:14px">'
            + '<button id="am-prev" aria-label="Previous" style="border:0;cursor:pointer;display:grid;place-items:center;border-radius:50%;width:52px;height:52px;background:#0B4A4F;color:#fff;font-size:18px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.3),inset 0 3px 0 rgba(255,255,255,.1)">⏮</button>'
            + '<button id="am-toggle" aria-label="Play" style="border:0;cursor:pointer;display:grid;place-items:center;border-radius:50%;width:76px;height:76px;background:#FDA127;color:#033337;font-size:26px;box-shadow:inset 0 -7px 0 rgba(0,0,0,.18),inset 0 4px 0 rgba(255,255,255,.4),0 14px 24px -10px rgba(253,161,39,.7)">▶</button>'
            + '<button id="am-next" aria-label="Next" style="border:0;cursor:pointer;display:grid;place-items:center;border-radius:50%;width:52px;height:52px;background:#0B4A4F;color:#fff;font-size:18px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.3),inset 0 3px 0 rgba(255,255,255,.1)">⏭</button>'
            + '<a id="am-togame" href="'+esc(d.dHref)+'" style="margin-left:auto;padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.1);color:#fff;font-size:13px;font-weight:800">'+esc(l.toGame)+' ↗</a>'
          + '</div>'
        + '</div>'
      + '</div>'
      /* hàng chờ */
      + '<div style="margin-top:28px;padding-top:20px;border-top:2px dashed rgba(255,255,255,.12)">'
        + '<div id="am-queuehead" style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7FD3DC;margin-bottom:10px"></div>'
        + '<div id="am-queue" style="display:flex;gap:10px;overflow-x:auto;padding-bottom:6px"></div>'
      + '</div>';

    /* EQ 18 cột */
    var eq = document.getElementById('am-eq'), eqhtml = '';
    for(var i=0;i<18;i++){
      eqhtml += '<span style="flex:1;height:100%;border-radius:8px;background:'+EQC[i%4]+';transform-origin:bottom;transform:scaleY(.18);animation:amEq '+(0.6+(i%5)*.12).toFixed(2)+'s ease-in-out '+(i*.06).toFixed(2)+'s infinite;animation-play-state:paused;box-shadow:inset 0 -4px 0 rgba(0,0,0,.15)"></span>';
    }
    eq.innerHTML = eqhtml;

    /* nút điều khiển */
    document.getElementById('am-toggle').onclick = function(){ var it = deckInfo().items; var t = it[curIndexInDeck()]; if(t) playFile(t.f, deckFileList()); };
    document.getElementById('am-prev').onclick = function(){ var fs = deckFileList(); var ix = Math.max(0, fs.indexOf(cur)); playFile(fs[(ix-1+fs.length)%fs.length], fs); };
    document.getElementById('am-next').onclick = function(){ var fs = deckFileList(); var ix = Math.max(0, fs.indexOf(cur)); playFile(fs[(ix+1)%fs.length], fs); };
    document.getElementById('am-seek').onclick = function(e){
      if(!A || !A.duration || deckFileList().indexOf(cur) < 0) return;
      var r = e.currentTarget.getBoundingClientRect();
      A.currentTime = (e.clientX - r.left) / r.width * A.duration;
    };
    buildQueue();
    paint();
  }

  function deckFileList(){
    var M = window.BZ_MUSIC;
    return deckK === 'g' ? M.groups[deckI][3].map(function(r){ return r[2]; }) : M.collections[deckI][4];
  }
  function curIndexInDeck(){ return Math.max(0, deckFileList().indexOf(cur)); }

  function buildQueue(){
    var q = document.getElementById('am-queue'); if(!q) return;
    var items = deckInfo().items;
    q.innerHTML = items.map(function(x,k){
      return '<button type="button" data-qf="'+esc(x.f)+'" style="flex:none;width:220px;border:0;cursor:pointer;text-align:left;display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;align-items:center;padding:12px;border-radius:18px;background:#0B4A4F;color:#fff;font-family:var(--clay-sans);box-shadow:inset 0 -4px 0 rgba(0,0,0,.2)">'
        + '<span style="font-family:var(--clay-mono);font-size:12px;font-weight:600;opacity:.8">'+String(k+1).padStart(2,'0')+'</span>'
        + '<span style="min-width:0"><span style="display:block;font-size:14px;font-weight:800;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(x.t)+'</span><span style="display:block;font-size:12px;line-height:1.35;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(x.s)+'</span></span>'
      + '</button>';
    }).join('');
    q.querySelectorAll('button[data-qf]').forEach(function(b){
      b.onclick = function(){ playFile(b.getAttribute('data-qf'), deckFileList()); };
    });
  }

  function buildBrowse(){
    var M = window.BZ_MUSIC, l = LBL[lang()];
    /* Tuyển tập (bìa đĩa) */
    var al = document.getElementById('am-albums');
    if(al) al.innerHTML = M.collections.map(function(c,i){
      return '<button type="button" data-ci="'+i+'" style="border:0;cursor:pointer;padding:0;background:transparent;text-align:left;font-family:var(--clay-sans);color:var(--clay-ink)">'
        + '<div style="position:relative;aspect-ratio:1/1;margin-right:18%">'
          + '<div class="am-disc" style="position:absolute;top:6%;bottom:6%;aspect-ratio:1/1;right:-12%;border-radius:50%;background:repeating-radial-gradient(circle,#123033 0 2px,#1C3F43 2px 4px);box-shadow:0 10px 18px -8px rgba(0,0,0,.5);transition:right .5s cubic-bezier(.2,.8,.2,1)"><span style="position:absolute;inset:34%;border-radius:50%;background:'+SLEEVE[i%4]+'"></span></div>'
          + '<div class="am-ring" style="position:absolute;inset:0;border-radius:24px;overflow:hidden;background:#F3E6CF;border:4px solid #FFFBF4;box-shadow:inset 0 -8px 0 rgba(0,0,0,.08),0 20px 28px -18px rgba(110,70,30,.6)"><div role="img" aria-label="'+esc(colName(c))+'" style="position:absolute;inset:0;width:100%;height:100%;background:url(\''+esc(art(c[1]))+'\') 50% 50%/cover no-repeat"></div></div>'
        + '</div>'
        + '<div style="margin-top:14px;font-size:18px;font-weight:800;line-height:1.25">'+esc(colName(c))+'</div>'
        + '<div style="margin-top:2px;font-size:13px;font-weight:700;color:var(--clay-teal)">'+esc(colTone(c))+' · '+c[4].length+' '+l.songs+'</div>'
      + '</button>';
    }).join('');

    /* Kệ đĩa ca khúc gốc */
    var sh = document.getElementById('am-shelf');
    if(sh) sh.innerHTML = M.groups.map(function(g,i){
      return '<button type="button" data-gi="'+i+'" style="border:0;cursor:pointer;padding:10px 10px 14px;border-radius:24px;background:#FFFBF4;text-align:left;font-family:var(--clay-sans);color:var(--clay-ink);box-shadow:inset 0 -6px 0 rgba(110,70,30,.1),inset 0 4px 0 rgba(255,255,255,.8),0 16px 22px -16px rgba(110,70,30,.6)">'
        + '<div style="position:relative;aspect-ratio:1/1;border-radius:16px;overflow:hidden;background:var(--clay-bg)"><div role="img" aria-label="'+esc(groupName(g))+'" style="position:absolute;inset:0;width:100%;height:100%;background:url(\''+esc(art(g[1]))+'\') 50% 22%/cover no-repeat"></div><span style="position:absolute;right:8px;bottom:8px;padding:3px 8px;border-radius:999px;background:#033337;color:#fff;font-size:11px;font-weight:800">'+g[3].length+'</span></div>'
        + '<div style="margin-top:10px;font-size:14px;font-weight:800;line-height:1.3">'+esc(groupName(g))+'</div>'
      + '</button>';
    }).join('');

    /* Giọng Lumina */
    var vc = document.getElementById('am-voices');
    if(vc) vc.innerHTML = M.voices.map(function(v,i){
      var label = (lang()==='en' && v[2]) || v[0];
      return '<button type="button" data-vf="'+esc(v[1])+'" style="border:0;cursor:pointer;padding:14px 18px;border-radius:22px 22px 22px 6px;background:'+SHELF_BG[i%4]+';color:var(--clay-ink);font:800 15px var(--clay-sans);box-shadow:inset 0 -5px 0 rgba(0,0,0,.08),inset 0 3px 0 rgba(255,255,255,.5),0 14px 20px -14px rgba(110,70,30,.6)"><span class="am-vicon">▶</span> '+esc(label)+'</button>';
    }).join('');

    if(al) al.querySelectorAll('button[data-ci]').forEach(function(b){ b.onclick = function(){ loadDeck('c', +b.getAttribute('data-ci')); scrollDeck(); }; });
    if(sh) sh.querySelectorAll('button[data-gi]').forEach(function(b){ b.onclick = function(){ loadDeck('g', +b.getAttribute('data-gi')); scrollDeck(); }; });
    if(vc) vc.querySelectorAll('button[data-vf]').forEach(function(b){ b.onclick = function(){ playFile(b.getAttribute('data-vf'), [b.getAttribute('data-vf')]); }; });
  }

  function scrollDeck(){
    var d = document.getElementById('am-deck');
    if(d && d.scrollIntoView) d.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- Cập nhật tại chỗ (không dựng lại đĩa → giữ animation mượt) ---- */
  function paintProgress(){
    var fs = deckFileList(), same = fs.indexOf(cur) > -1;
    var pct = document.getElementById('am-pct'), tc = document.getElementById('am-tc'), td = document.getElementById('am-td');
    if(!pct) return;
    pct.style.width = (same && dur ? (pos/dur*100).toFixed(1) : 0) + '%';
    tc.textContent = same ? mm(pos) : '0:00';
    td.textContent = same && dur ? mm(dur) : '–:––';
  }

  function paint(){
    var l = LBL[lang()], d = deckInfo(), fs = deckFileList();
    var ix = Math.max(0, fs.indexOf(cur)), item = d.items[ix];
    var deckOn = on && fs.indexOf(cur) > -1;
    var ps = deckOn ? 'running' : 'paused';

    var set = function(id, prop, val){ var e = document.getElementById(id); if(e) e[prop] = val; };
    set('am-deckname','textContent', d.dName);
    set('am-decklabel','textContent', d.items.length + ' ' + (deckK==='g' ? l.versions : l.songs));
    set('am-title','textContent', item ? item.t : '');
    set('am-sub','textContent', item ? item.s : '');
    set('am-queuehead','textContent', l.queue + ' · ' + d.items.length);
    var tg = document.getElementById('am-togame'); if(tg){ tg.setAttribute('href', d.dHref); tg.firstChild && (tg.textContent = l.toGame + ' ↗'); }
    var dot = document.getElementById('am-dot'); if(dot) dot.style.background = deckOn ? '#FDA127' : '#3E5A5C';
    var tgl = document.getElementById('am-toggle'); if(tgl) tgl.textContent = deckOn ? '❚❚' : '▶';

    var rec = document.getElementById('am-rec'); if(rec) rec.style.animationPlayState = ps;
    var arm = document.getElementById('am-arm'); if(arm) arm.style.transform = 'rotate(' + (deckOn ? 24 : 4) + 'deg)';
    var eq = document.getElementById('am-eq'); if(eq) eq.querySelectorAll('span').forEach(function(s){ s.style.animationPlayState = ps; if(!deckOn) s.style.transform = 'scaleY(.18)'; else s.style.transform = ''; });

    paintProgress();

    /* hàng chờ: tô bài đang phát */
    document.querySelectorAll('#am-queue button[data-qf]').forEach(function(b){
      var me = b.getAttribute('data-qf') === cur;
      b.style.background = me ? '#FDA127' : '#0B4A4F';
      b.style.color = me ? '#033337' : '#fff';
    });
    /* bìa đĩa: đánh dấu tuyển tập đang trên bàn xoay */
    document.querySelectorAll('#am-albums button[data-ci]').forEach(function(b){
      var act = deckK==='c' && +b.getAttribute('data-ci') === deckI;
      var disc = b.querySelector('.am-disc'), ring = b.querySelector('.am-ring');
      if(disc) disc.style.right = act ? '-30%' : '-12%';
      if(ring) ring.style.borderColor = act ? '#FDA127' : '#FFFBF4';
    });
    /* kệ đĩa: đánh dấu chùm đang trên bàn xoay */
    document.querySelectorAll('#am-shelf button[data-gi]').forEach(function(b){
      var act = deckK==='g' && +b.getAttribute('data-gi') === deckI;
      b.style.background = act ? '#FFE6B8' : '#FFFBF4';
    });
    /* giọng Lumina: biểu tượng phát */
    document.querySelectorAll('#am-voices button[data-vf]').forEach(function(b){
      var me = b.getAttribute('data-vf') === cur;
      var ic = b.querySelector('.am-vicon'); if(ic) ic.textContent = (me && on) ? '❚❚' : '▶';
    });
  }

  function renderAll(){
    if(!window.BZ_MUSIC) return;
    buildNameMap();
    if(!queueFiles.length) queueFiles = deckFileList();
    buildBrowse();
    buildDeck();
  }

  function init(){
    if(window.BZ_MUSIC){ renderAll(); }
    else { var w = setInterval(function(){ if(window.BZ_MUSIC){ clearInterval(w); renderAll(); } }, 100); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('bizon:langchange', function(){ if(window.BZ_MUSIC) renderAll(); });
})();
