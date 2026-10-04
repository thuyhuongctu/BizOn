/* ============================================================================
   BizOn Clay — Kho Âm nhạc: dựng danh sách + trình phát (vanilla).
   Đọc window.BZ_MUSIC (js/music-data.js). Song ngữ theo window.clayCurrentLang().
   Nạp SAU bizon-clay-i18n.js và music-data.js.
   ========================================================================== */
(function(){
  if(window.__bizonMusic) return; window.__bizonMusic = true;

  var CLAY = ['#7FD3DC','#FFD58A','#F4B6C2','#A9DCC4','#D9F0F2'];
  var LBL = {
    vi:{ playAll:'▶ Phát cả tuyển tập', pause:'❚❚ Tạm dừng', songs:'bài', versions:'bản', toGame:'Vào game' },
    en:{ playAll:'▶ Play collection', pause:'❚❚ Pause', songs:'songs', versions:'versions', toGame:'Open game' }
  };
  function lang(){ return (window.clayCurrentLang && window.clayCurrentLang()) === 'en' ? 'en' : 'vi'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  function art(p){ return 'assets/' + p; }
  function url(id){ return 'assets/audio/' + id + '.mp3'; }

  var audio = null, cur = null, queue = null, playing = false, nameMap = {};

  /* ---- Now-playing bar (bơm một lần) ---- */
  var bar = document.createElement('div');
  bar.id = 'am-np';
  bar.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:60;width:min(640px,calc(100% - 24px));padding:10px 14px 10px 10px;border-radius:24px;background:#033337;color:#fff;display:none;grid-template-columns:44px minmax(0,1fr);gap:12px;align-items:center;box-shadow:0 20px 40px -12px rgba(0,20,25,.6)';
  bar.innerHTML = '<button id="am-np-btn" aria-label="Play/Pause" style="width:44px;height:44px;background:#FDA127;border:0;cursor:pointer;display:grid;place-items:center;border-radius:50%;color:#033337;font-size:15px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.2),inset 0 3px 0 rgba(255,255,255,.3)">▶</button>'
    + '<div style="min-width:0"><div id="am-np-title" style="font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div><div style="margin-top:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.18);overflow:hidden"><div id="am-np-pct" style="height:100%;width:0%;background:#7FD3DC;border-radius:999px"></div></div></div>';
  document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(bar); });
  function barUpdate(){
    if(!cur){ bar.style.display='none'; return; }
    bar.style.display='grid';
    document.getElementById('am-np-btn').textContent = playing ? '❚❚' : '▶';
    document.getElementById('am-np-title').textContent = nameMap[cur] || '';
  }
  bar.addEventListener('click', function(e){ if(e.target.id==='am-np-btn' && cur) play(cur, queue); });

  function play(id, q){
    if(cur === id && audio){ if(audio.paused) audio.play().catch(function(){}); else audio.pause(); return; }
    if(audio){ audio.pause(); audio.ontimeupdate = audio.onended = audio.onplay = audio.onpause = null; }
    audio = new Audio(url(id)); audio.volume = .7;
    audio.onplay = function(){ playing = true; barUpdate(); icons(); };
    audio.onpause = function(){ playing = false; barUpdate(); icons(); };
    audio.ontimeupdate = function(){ if(audio.duration){ document.getElementById('am-np-pct').style.width = (audio.currentTime/audio.duration*100).toFixed(1)+'%'; } };
    audio.onended = function(){
      var i = queue ? queue.indexOf(cur) : -1;
      if(i > -1 && i+1 < queue.length){ play(queue[i+1], queue); }
      else { playing = false; cur = null; queue = null; barUpdate(); icons(); }
    };
    cur = id; queue = q || null; playing = false;
    var pct = document.getElementById('am-np-pct'); if(pct) pct.style.width='0%';
    audio.play().catch(function(){});
    barUpdate();
  }

  /* cập nhật biểu tượng nút phát trong danh sách theo bài đang phát */
  function icons(){
    document.querySelectorAll('#am-groups button[data-id]').forEach(function(b){
      var me = b.getAttribute('data-id') === cur;
      b.textContent = (me && playing) ? '❚❚' : '▶';
      b.style.background = me ? '#E8762D' : '#006687';
      b.closest('.am-track').style.background = me ? '#FFF3DA' : 'transparent';
    });
    document.querySelectorAll('#am-albums button[data-first]').forEach(function(b){
      var l = LBL[lang()];
      var act = playing && queue && queue[0] === b.getAttribute('data-first');
      b.textContent = act ? l.pause : l.playAll;
    });
  }

  function render(){
    var M = window.BZ_MUSIC; if(!M) return;
    var en = lang() === 'en', l = LBL[lang()];
    /* tên hiển thị cho now-playing */
    nameMap = {};
    M.groups.forEach(function(g){ var gn = (en && g[5]) || g[0]; g[3].forEach(function(r){ var tt = (en && r[3]) || r[0]; nameMap[r[2]] = tt.indexOf('«') > -1 ? tt : gn + ' – ' + tt; }); });
    M.voices.forEach(function(v){ nameMap[v[1]] = (en && v[2]) || v[0]; });

    /* Albums / collections */
    var al = document.getElementById('am-albums');
    if(al) al.innerHTML = M.collections.map(function(c){
      var name=c[0], tone=(en&&c[5])||c[2], href=c[3], files=c[4];
      return '<div style="padding:12px;border-radius:28px;background:var(--clay-card);display:flex;flex-direction:column;box-shadow:inset 0 -8px 0 rgba(110,70,30,.08),inset 0 5px 0 #fff,0 22px 30px -22px rgba(110,70,30,.55)">'
        + '<div style="position:relative;aspect-ratio:4/3;border-radius:20px;overflow:hidden;background:var(--clay-tray)"><img src="'+art(c[1])+'" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>'
        + '<div style="padding:14px 6px 6px;display:flex;flex-direction:column;gap:6px;flex:1">'
        + '<div style="font-family:var(--clay-head);font-size:21px;font-weight:800;line-height:1.2">'+esc(name)+'</div>'
        + '<div style="font-size:13px;font-weight:700;color:var(--clay-teal)">'+esc(tone)+' · '+files.length+' '+l.songs+'</div>'
        + '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:8px">'
        + '<button type="button" data-first="'+esc(files[0])+'" data-files="'+esc(files.join(','))+'" style="border:0;cursor:pointer;padding:9px 14px;border-radius:999px;background:var(--clay-teal);color:#fff;font:800 13px var(--clay-head);box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)">'+l.playAll+'</button>'
        + '<a href="'+href+'" style="padding:9px 14px;border-radius:999px;background:var(--clay-tray);color:var(--clay-ink);font-size:13px;font-weight:800;box-shadow:inset 0 -3px 0 rgba(110,70,30,.15)">'+l.toGame+' →</a>'
        + '</div></div></div>';
    }).join('');

    /* Voices */
    var vc = document.getElementById('am-voices');
    if(vc) vc.innerHTML = M.voices.map(function(v,i){
      var label=(en&&v[2])||v[0];
      return '<button type="button" data-id="'+esc(v[1])+'" data-single="1" style="border:0;cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px;padding:14px;border-radius:22px;background:'+CLAY[i%CLAY.length]+';font:700 14px var(--clay-head);color:var(--clay-ink);box-shadow:inset 0 -6px 0 rgba(0,0,0,.08),inset 0 4px 0 rgba(255,255,255,.5),0 14px 20px -16px rgba(110,70,30,.6)"><span aria-hidden="true" style="width:40px;height:40px;background:var(--clay-teal);flex:none;display:grid;place-items:center;border-radius:50%;color:#fff;font-size:15px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.2),inset 0 3px 0 rgba(255,255,255,.3)">▶</span>'+esc(label)+'</button>';
    }).join('');

    /* Groups / original songs */
    var gr = document.getElementById('am-groups');
    if(gr) gr.innerHTML = M.groups.map(function(g){
      var gn=(en&&g[5])||g[0], gd=(en&&g[4])||g[2], tracks=g[3];
      var rows = tracks.map(function(r){
        var tt=(en&&r[3])||r[0], ss=(en&&r[4])||r[1];
        return '<div class="am-track" style="display:grid;grid-template-columns:44px minmax(0,1fr);gap:12px;align-items:center;padding:10px;border-radius:18px;background:transparent">'
          + '<button type="button" data-id="'+esc(r[2])+'" aria-label="Play" style="width:44px;height:44px;background:#006687;flex:none;border:0;cursor:pointer;display:grid;place-items:center;border-radius:50%;color:#fff;font-size:15px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.2),inset 0 3px 0 rgba(255,255,255,.3)">▶</button>'
          + '<div style="min-width:0"><div style="font-size:15px;font-weight:800;line-height:1.3">'+esc(tt)+'</div><div style="font-size:12px;line-height:1.4;color:var(--clay-sub)">'+esc(ss)+'</div></div>'
          + '</div>';
      }).join('');
      return '<div style="padding:20px;border-radius:32px;background:var(--clay-card);box-shadow:inset 0 -9px 0 rgba(110,70,30,.08),inset 0 5px 0 #fff,0 26px 36px -24px rgba(110,70,30,.5)">'
        + '<div style="display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:16px;align-items:center;margin-bottom:8px">'
        + '<div style="position:relative;width:72px;height:72px;border-radius:18px;overflow:hidden;background:var(--clay-tray)"><img src="'+art(g[1])+'" alt="" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 22%"></div>'
        + '<div style="min-width:0"><div style="font-family:var(--clay-head);font-size:21px;font-weight:800;line-height:1.2">'+esc(gn)+'</div><div style="margin-top:2px;font-size:13px;line-height:1.45;color:var(--clay-sub)">'+esc(gd)+'</div></div>'
        + '<span style="padding:4px 10px;border-radius:999px;background:var(--clay-c5);color:#03474F;font-size:12px;font-weight:800;white-space:nowrap">'+tracks.length+' '+l.versions+'</span>'
        + '</div>' + rows + '</div>';
    }).join('');

    wire(); icons();
  }

  function wire(){
    document.querySelectorAll('#am-groups button[data-id], #am-voices button[data-single]').forEach(function(b){
      b.onclick = function(){ play(b.getAttribute('data-id')); };
    });
    document.querySelectorAll('#am-albums button[data-first]').forEach(function(b){
      b.onclick = function(){
        var files = b.getAttribute('data-files').split(',');
        var act = playing && queue && queue[0] === files[0];
        if(act && audio){ audio.pause(); } else { play(files[0], files); }
      };
    });
  }

  function init(){
    if(window.BZ_MUSIC){ render(); }
    else { var w = setInterval(function(){ if(window.BZ_MUSIC){ clearInterval(w); render(); } }, 100); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('bizon:langchange', function(){ if(window.BZ_MUSIC) render(); });
})();
