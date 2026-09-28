/* BizOn – Màn "Kết quả vòng · cắm cờ" bản đồ đất nặn (thay OfficeRounds.showFlagScene)
 * Nạp SAU js/office-rounds.js:  <script src="js/flag-scene-3d.js"></script>
 * Dùng: assets/geo/vnm.json (đường bờ biển), CONQUEST_STOPS, S, T, money, AI_OPPONENTS_LIST, OfficeRounds.owner.
 * Cờ đội ta màu cam sao trắng; đối thủ theo accent + emblem. Đảo Hoàng Sa / Trường Sa luôn hiển thị. */
(function () {
  'use strict';
  var tr = function (vi, en) { return typeof T === 'function' ? T(vi, en) : vi; };
  var fmt = function (m) { return typeof money === 'function' ? money(m) : Math.round(m) + 'tr₫'; };
  var gs = function () { return typeof S !== 'undefined' ? S : null; };
  var stops = function () { return (typeof CONQUEST_STOPS !== 'undefined' && CONQUEST_STOPS) || []; };
  var rivals = function () { try { return typeof AI_OPPONENTS_LIST === 'function' ? AI_OPPONENTS_LIST() : []; } catch (e) { return []; } };
  var teamName = function () { var s = gs(); return (s && s.profile && s.profile.teamName) || tr('Đội bạn', 'Your team'); };
  var ME = { color: '#f39a33', emblem: '★' };
  var EMB = { 'Alpha Dynamics': '🐺', 'Mekong Ventures': '🐘', 'Star Clay Co.': '🦚' };
  // Kinh/vĩ độ 6 tỉnh (khớp CONQUEST_STOPS theo thứ tự).
  var LL = [[105.78, 10.03], [106.70, 10.78], [109.19, 12.24], [108.22, 16.05], [105.78, 19.81], [105.85, 21.03]];
  var K = 30, C16 = Math.cos(16 * Math.PI / 180);
  var P = function (ll) { return [(ll[0] - 102.1) * C16 * K, (23.6 - ll[1]) * K]; };
  var vnPath = '', loading = null;
  function loadVN() {
    if (vnPath || loading) return loading || Promise.resolve();
    loading = fetch('assets/geo/vnm.json').then(function (r) { return r.json(); }).then(function (g) {
      vnPath = g.coordinates.map(function (poly) { return poly.map(function (ring) { return 'M' + ring.map(function (p) { return P(p).map(function (v) { return v.toFixed(1); }).join(','); }).join('L') + 'Z'; }).join(''); }).join('');
    }).catch(function () {});
    return loading;
  }
  var CSS = '@keyframes bzf-pulse{0%{r:8;opacity:.9}100%{r:22;opacity:0}}@keyframes bzf-pop{0%{transform:scale(.2);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}' +
    '.bzf-ping{animation:bzf-pulse 1.4s ease-out infinite}.bzf-pop{transform-box:fill-box;transform-origin:50% 100%;animation:bzf-pop .6s ease both}' +
    '.bzf{position:fixed;inset:0;z-index:75;display:flex;align-items:center;justify-content:center;background:rgba(20,28,56,.5);backdrop-filter:blur(3px);padding:14px}' +
    '.bzf .rs{background:#2f8a95;border-radius:30px;padding:14px;box-shadow:inset 0 -8px 0 rgba(0,0,0,.15),0 20px 60px rgba(0,0,0,.35);width:min(980px,100%);max-height:calc(100vh - 28px);overflow:auto;box-sizing:border-box}' +
    '.bzf .in{background:#f6efe2;border-radius:22px;box-shadow:inset 0 -6px 0 #e3d3b8,inset 0 3px 0 #fffaf1;display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px;padding:14px}' +
    '@media (max-width:720px){.bzf .in{grid-template-columns:1fr}}' +
    '.bzf .map{background:#4b9fcf;border-radius:18px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.18),inset 0 4px 0 rgba(255,255,255,.25);overflow:hidden;min-height:280px;display:flex}.bzf .map svg{width:100%;height:100%;display:block}' +
    '.bzf .side{display:flex;flex-direction:column;gap:10px;min-width:0;font-family:"Be Vietnam Pro",system-ui,sans-serif;color:#2c3552}' +
    '.bzf .pill{align-self:flex-start;font:800 12px "Baloo 2","Be Vietnam Pro",sans-serif;letter-spacing:.04em;color:#1f6f8a;background:#e8f2f1;border:3px solid #cfe2e0;border-radius:14px;padding:2px 12px;text-transform:uppercase}' +
    '.bzf h2{margin:0;font:800 24px/1.25 "Baloo 2","Be Vietnam Pro",sans-serif;color:#d86a24;display:flex;gap:10px;align-items:center;text-wrap:balance}.bzf h2.lost{color:#5a4a8a}' +
    '.bzf .sub{margin:-2px 0 0;font-size:13px;color:#4a4f5c;text-wrap:pretty}' +
    '.bzf .fi{width:26px;height:30px;flex:none;position:relative}.bzf .fi:before{content:"";position:absolute;left:2px;top:0;width:4px;height:30px;border-radius:2px;background:#7a4a2a}.bzf .fi:after{content:"";position:absolute;left:6px;top:2px;width:20px;height:15px;background:var(--c);clip-path:polygon(0 0,100% 50%,0 100%);border-radius:3px}' +
    '.bzf .box{background:#fffaf2;border-radius:18px;border:3px solid #eadcc5;box-shadow:inset 0 -4px 0 #eadcc5;padding:8px 12px}.bzf .box h3{margin:0 0 6px;font:800 12px "Baloo 2","Be Vietnam Pro",sans-serif;letter-spacing:.05em}' +
    '.bzf .bar{display:grid;grid-template-columns:18px minmax(0,1fr) 54px;align-items:center;gap:6px;margin:6px 0}.bzf .trk{height:28px;border-radius:999px;background:#fbf6ee;border:3px solid var(--c);box-sizing:border-box;position:relative;overflow:hidden}' +
    '.bzf .fill{position:absolute;inset:0 auto 0 0;background:var(--c);border-radius:999px;transition:width 1s cubic-bezier(.3,1.3,.5,1);box-shadow:inset 0 -4px 0 rgba(0,0,0,.14),inset 0 3px 0 rgba(255,255,255,.3)}' +
    '.bzf .nm{position:relative;font:700 13px/22px "Baloo 2","Be Vietnam Pro",sans-serif;color:#fff;padding-left:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(0,0,0,.3)}.bzf .v{font:800 14px "Baloo 2",sans-serif;text-align:right}.bzf .st{font-size:15px;color:#e8a92c;text-align:center}' +
    '.bzf .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bzf .stat{border-radius:16px;border:4px solid;padding:5px 8px;text-align:center;background:#fffaf2;box-shadow:inset 0 -4px 0 rgba(0,0,0,.06)}.bzf .stat small{display:block;font:800 11px "Baloo 2",sans-serif;letter-spacing:.05em}.bzf .stat b{font:800 24px/1.2 "Baloo 2",sans-serif}' +
    '.bzf .foot{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-top:auto}.bzf .legend{display:flex;flex-wrap:wrap;gap:5px}.bzf .legend span{white-space:nowrap;font-size:11px;background:#fffaf2;border:2px solid #eadcc5;border-radius:10px;padding:2px 8px;display:flex;gap:5px;align-items:center}.bzf .legend i{width:10px;height:10px;border-radius:3px;background:var(--c)}' +
    '.bzf .btn{font:700 15px "Baloo 2","Be Vietnam Pro",sans-serif;border:3px solid #23706f;background:#2f8a8c;color:#fff;border-radius:16px;padding:9px 16px;cursor:pointer;box-shadow:0 4px 0 #1b5a5a}.bzf .btn:active{transform:translateY(2px);box-shadow:0 2px 0 #1b5a5a}';
  function css() { if (document.getElementById('bzf-css')) return; var st = document.createElement('style'); st.id = 'bzf-css'; st.textContent = CSS; document.head.appendChild(st); }

  function ownerOf(i) { return window.OfficeRounds && OfficeRounds.owner ? OfficeRounds.owner(i) : null; }
  function colorOf(o) { return !o ? '#fff' : o.me ? ME.color : (o.color || '#5d6770'); }
  function emblemOf(o) { return !o ? '' : o.me ? ME.emblem : (EMB[o.name] || o.icon || ''); }
  function routeD(pts) { var d = 'M' + pts[0]; for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i]; var mx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * -0.18, my = (a[1] + b[1]) / 2 + (a[0] - b[0]) * -0.18; d += ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1); } return d; }
  function flagSVG(x, y, col, big, cls, emb) {
    var s = big ? 1.5 : 1, inner = big ? (emb === '★' ? '<path d="M8.5,-21.5 l1.3,2.6 2.9,.4 -2.1,2 .5,2.9 -2.6,-1.4 -2.6,1.4 .5,-2.9 -2.1,-2 2.9,-.4z" fill="#fff6e6"/>' : '<text x="9" y="-15" font-size="8" text-anchor="middle">' + emb + '</text>') : '';
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><g class="' + (cls || '') + '"><ellipse cx="0" cy="1" rx="7" ry="3" fill="rgba(0,0,0,.25)"/><rect x="-1.6" y="-26" width="3.2" height="27" rx="1.6" fill="#6b4128"/><path d="M1.5,-25 L22,-18.5 L1.5,-12 Z" fill="' + col + '" stroke="rgba(0,0,0,.2)" stroke-width="1" stroke-linejoin="round"/>' + inner + '</g></g>';
  }
  function mapSVG(round) {
    var st = stops(), pts = LL.slice(0, st.length || 6).map(P), sea = pts.map(function (p) { return [p[0] + 16, p[1]]; });
    var hoang = P([111.9, 16.4]), truong = P([113.9, 10.1]), cur = pts[round], curO = ownerOf(round);
    var waves = ''; for (var i = 0; i < 9; i++) waves += '<path d="M-6,' + (40 + i * 50) + ' q60,-10 120,0 t120,0 t140,0" stroke="rgba(255,255,255,.12)" stroke-width="3" fill="none"/>';
    var isl = [[0, 0], [9, 5], [-6, 8], [14, -4], [4, 12]].map(function (d) { return '<circle cx="' + (hoang[0] + d[0]) + '" cy="' + (hoang[1] + d[1]) + '" r="2.6" fill="#8cc46a" stroke="#4a8a35"/>'; }).join('') +
      [[0, 0], [10, 8], [-8, 14], [18, -6], [4, 22], [-14, -4], [22, 16]].map(function (d) { return '<circle cx="' + (truong[0] + d[0]) + '" cy="' + (truong[1] + d[1]) + '" r="2.3" fill="#8cc46a" stroke="#4a8a35"/>'; }).join('');
    var dots = pts.map(function (p, i) { var o = ownerOf(i); return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (o ? 6 : 5) + '" fill="' + colorOf(o) + '" stroke="#fff" stroke-width="2.5"/>'; }).join('');
    var flags = pts.map(function (p, i) { var o = ownerOf(i); return o && i !== round ? flagSVG(p[0], p[1], colorOf(o), false) : ''; }).join('');
    var names = st.map(function (s, i) { if (i !== round && i !== 0 && i !== st.length - 1) return ''; var p = pts[i]; return '<text x="' + (p[0] - (i === st.length - 1 ? 30 : 60)) + '" y="' + (p[1] + (i === 0 ? 22 : -8)) + '">' + s.name + '</text>'; }).join('');
    return '<svg viewBox="-6 -6 392 478" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + tr('Bản đồ hành trình cắm cờ', 'Flag journey map') + '">' +
      '<defs><filter id="bzfclay" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="b"/><feOffset in="b" dy="5" result="o"/><feFlood flood-color="#123a4a" flood-opacity=".45"/><feComposite in2="o" operator="in" result="sh"/>' +
      '<feSpecularLighting in="b" surfaceScale="5" specularConstant=".55" specularExponent="16" lighting-color="#fff" result="sp"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting><feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2"/>' +
      '<feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/><feMergeNode in="sp2"/></feMerge></filter>' +
      '<pattern id="bzfgrain" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#6fae4f"/><circle cx="1.5" cy="2" r=".8" fill="#80bd5d"/><circle cx="4.5" cy="4.5" r=".7" fill="#5f9c43"/></pattern></defs>' +
      '<rect x="-6" y="-6" width="392" height="478" fill="#4b9fcf"/>' + waves +
      '<path d="' + vnPath + '" fill="url(#bzfgrain)" stroke="#4a8a35" stroke-width="2.2" stroke-linejoin="round" filter="url(#bzfclay)"/>' + isl +
      '<text x="' + (hoang[0] - 30) + '" y="' + (hoang[1] - 10) + '" font-size="10" font-family="Be Vietnam Pro" fill="#eaf6ff">QĐ. Hoàng Sa</text><text x="' + (truong[0] - 34) + '" y="' + (truong[1] - 12) + '" font-size="10" font-family="Be Vietnam Pro" fill="#eaf6ff">QĐ. Trường Sa</text>' +
      '<path d="' + routeD(sea) + '" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 11"/>' + dots +
      '<circle class="bzf-ping" cx="' + cur[0] + '" cy="' + cur[1] + '" r="8" fill="none" stroke="#3ff0e0" stroke-width="3"/>' + flags +
      (curO ? flagSVG(cur[0], cur[1], colorOf(curO), true, 'bzf-pop', emblemOf(curO)) : '') +
      '<g font-family="Baloo 2, Be Vietnam Pro" font-weight="700" font-size="13" fill="#fff" stroke="#2a5a2a" stroke-width="3" paint-order="stroke">' + names + '</g></svg>';
  }

  function showFlagScene(report, onContinue) {
    css();
    var s = gs(), i = report.round - 1, p = stops()[i] || { name: '', zone: '' }, o = ownerOf(i), total = stops().length || 6, isLast = report.round >= total;
    var rows = [{ name: teamName(), share: report.share || 0, color: ME.color, me: true }].concat((s && s.competitors || []).map(function (c) {
      var r = rivals().find(function (x) { return x.name === c.name; }) || {}; return { name: c.name, share: c.share || 0, color: r.accent || '#5d6770' };
    })).sort(function (a, b) { return b.share - a.share; });
    var maxv = Math.max.apply(null, rows.map(function (x) { return x.share; }).concat([1]));
    var mine = 0, cnt = {}; for (var k = 0; k < total; k++) { var ok = ownerOf(k); if (ok) { cnt[ok.name] = (cnt[ok.name] || 0) + 1; if (ok.me) mine++; } }
    var me = !!(o && o.me), lead = rows[0] && rows[0].me;
    var title = !o ? tr('Vòng ' + report.round + ' đã khép lại', 'Round ' + report.round + ' closed')
      : me ? tr('Đội bạn cắm cờ tại ' + p.name + '!', 'Your team planted the flag at ' + p.name + '!')
      : tr(o.name + ' cắm cờ tại ' + p.name, o.name + ' planted the flag at ' + p.name);
    var sub = me ? tr('Thị phần cao nhất và có lãi. Tỉnh này mang màu cờ của đội bạn.', 'Top share with a profit. This province flies your colours.')
      : lead ? tr('Đội bạn dẫn thị phần nhưng lỗ vòng này, nên cờ thuộc về đối thủ có thị phần cao nhất.', 'You led on share but lost money this round, so the flag goes to the top rival.')
      : tr((o ? o.name : 'Đối thủ') + ' có thị phần cao nhất vòng này, cờ tỉnh thuộc về họ.', (o ? o.name : 'A rival') + ' had the top share this round, so the flag is theirs.');
    var div = document.createElement('div'); div.className = 'bzf';
    div.innerHTML = '<div class="rs"><div class="in"><div class="map"></div><div class="side">' +
      '<span class="pill">' + tr('Vòng ', 'Round ') + report.round + '/' + total + ' · ' + (p.zone || '') + '</span>' +
      '<h2 class="' + (me ? '' : 'lost') + '"><span class="fi" style="--c:' + colorOf(o) + '"></span><span>' + title + '</span></h2><p class="sub">' + sub + '</p>' +
      '<div class="box"><h3>' + tr('THỊ PHẦN VÒNG NÀY', 'THIS ROUND\'S SHARE') + '</h3>' + rows.map(function (x) {
        return '<div class="bar" style="--c:' + x.color + '"><span class="st">' + (o && x.name === o.name ? '★' : '') + '</span><div class="trk"><div class="fill" style="width:0"></div><div class="nm">' + x.name + '</div></div><span class="v" style="color:' + x.color + '">' + x.share.toFixed(1) + '%</span></div>';
      }).join('') + '</div>' +
      '<div class="stats"><div class="stat" style="border-color:' + (report.netProfit >= 0 ? '#4f9a52' : '#d6453a') + '"><small>' + tr('LỢI NHUẬN RÒNG', 'NET PROFIT') + '</small><b style="color:' + (report.netProfit >= 0 ? '#3f8a44' : '#c0443a') + '">' + (report.netProfit >= 0 ? '↑ ' : '↓ ') + fmt(report.netProfit) + '</b></div>' +
      '<div class="stat" style="border-color:#f39a33"><small>' + tr('CỜ CỦA ĐỘI', 'YOUR FLAGS') + '</small><b style="color:#d86a24">' + mine + '/' + total + '</b></div></div>' +
      '<div class="foot"><div class="legend">' + [{ name: teamName(), color: ME.color }].concat(rivals().map(function (r) { return { name: r.name, color: r.accent }; })).map(function (r) { return '<span style="--c:' + r.color + '"><i></i>' + r.name + '<b>' + (cnt[r.name] || 0) + '</b></span>'; }).join('') + '</div>' +
      '<button class="btn">' + (isLast ? tr('Xem báo cáo tổng kết →', 'View season report →') : tr('Vào vòng tiếp theo →', 'Go to next round →')) + '</button></div></div></div></div>';
    var mapEl = div.querySelector('.map');
    loadVN().then(function () { mapEl.innerHTML = mapSVG(i); });
    div.querySelector('.btn').onclick = function () { div.remove(); if (window.OfficeRounds && OfficeRounds.render) OfficeRounds.render(); onContinue && onContinue(); };
    document.body.appendChild(div);
    requestAnimationFrame(function () { requestAnimationFrame(function () { var fs = div.querySelectorAll('.fill'); fs.forEach(function (f, j) { f.style.width = Math.min(100, rows[j].share / Math.max(maxv, 40) * 100) + '%'; }); }); });
  }
  loadVN();
  if (window.OfficeRounds) { window.OfficeRounds.showFlagScene = showFlagScene; window.OfficeRounds.flagMapSVG = function (round) { css(); return mapSVG(round); }; }
  else window.OfficeRounds = { showFlagScene: showFlagScene, render: function () {}, owner: function () { return null; } };
})();
