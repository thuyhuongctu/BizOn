// Hướng dẫn lần đầu + âm thanh/hiệu ứng bán hàng cho Ben Phu Sa 3D
(function () {
  var EN = function () { try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; } };
  var T = function (vi, en) { return EN() ? en : vi; };
  var $ = function (id) { return document.getElementById(id); };
  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  /* ---------- Hướng dẫn ---------- */
  var tut = el('<div id="bps-tut" style="position:fixed;inset:0;z-index:70;display:none;pointer-events:none">' +
    '<div style="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);width:min(92vw,440px);pointer-events:auto;background:linear-gradient(180deg,#fffdf6,#f1e7d3);border-radius:24px;padding:18px 20px 16px;box-shadow:0 6px 0 #d9c7a6,0 24px 48px -16px rgba(3,51,55,.6);color:#033337;font-family:\'Plus Jakarta Sans\',sans-serif">' +
    '<p id="bps-tut-step" style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#e8762d"></p>' +
    '<p id="bps-tut-text" style="margin:0;font-size:15px;line-height:1.55;font-weight:600"></p>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">' +
    '<button type="button" id="bps-tut-skip" style="min-height:44px;padding:0 16px;border:0;border-radius:14px;background:transparent;color:#033337;font-weight:800;cursor:pointer"></button>' +
    '<button type="button" id="bps-tut-next" style="min-height:44px;padding:0 20px;border:0;border-radius:14px;background:#006687;color:#fff;font-weight:800;cursor:pointer;box-shadow:0 4px 0 #033337"></button>' +
    '</div></div></div>');
  document.body.appendChild(tut);
  var STEPS = [
    [null, 'Mỗi tuần bạn ra 3 quyết định rồi bấm Chốt. Sau 5 tuần, người có lợi nhuận cao nhất thắng.', 'Each week you make 3 decisions, then lock in. After 5 weeks, the highest profit wins.'],
    ['ft-methods', 'Phương thức: Ghe bán ×3 nhưng tốn 1,5 tr/tuần. Gánh không tốn phí, ít tiền hơn nhưng mang tin về. Khảo sát không bán, chỉ lấy dữ liệu.', 'Method: the boat sells ×3 but costs 1.5 mn/week. The cart is free, earns less, but brings back intel. A survey sells nothing and only gathers data.'],
    ['ft-menus', 'Món hàng: mỗi món hợp với một kiểu khách. Chưa biết thì dò bằng gánh trước.', 'Product: each product suits a different crowd. If unsure, scout with the cart first.'],
    ['bps3d-pick', 'Địa điểm: bấm một bến trên bản đồ 3D. Bến có nhiều đối thủ thì khách bị chia.', 'Location: tap a landing on the 3D map. Landings shared with rivals split the customers.'],
    ['ft-commit', 'Xem dự báo bên dưới rồi bấm Chốt tuần này. Gợi ý: dò 1 tuần, rồi chạy ghe ở cặp tốt nhất.', 'Check the forecast below, then lock in the week. Tip: scout for 1 week, then run the boat on the best pair.']
  ];
  var k = 0, lit = null;
  function clear() { if (lit) { lit.style.outline = ''; lit.style.outlineOffset = ''; } lit = null; }
  function show() {
    clear(); var s = STEPS[k]; tut.style.display = 'block';
    $('bps-tut-step').textContent = T('Hướng dẫn ', 'Guide ') + (k + 1) + '/' + STEPS.length;
    $('bps-tut-text').textContent = T(s[1], s[2]);
    $('bps-tut-skip').textContent = T('Bỏ qua', 'Skip');
    $('bps-tut-next').textContent = k < STEPS.length - 1 ? T('Tiếp →', 'Next →') : T('Bắt đầu chơi', 'Start playing');
    if (s[0] && $(s[0])) {
      lit = $(s[0]); lit.style.outline = '4px solid #fda127'; lit.style.outlineOffset = '4px';
      var p = lit.parentElement; while (p && p !== document.body && !(p.scrollHeight > p.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
      var r = lit.getBoundingClientRect(), dy = r.top - innerHeight * 0.2;
      if (p && p !== document.body) p.scrollBy({ top: dy, behavior: 'smooth' }); else window.scrollBy({ top: dy, behavior: 'smooth' });
    }
  }
  function done() { clear(); tut.style.display = 'none'; try { localStorage.setItem('bps3d-tut', '1'); } catch (e) {} }
  window.bpsTutorial = function () { k = 0; show(); };
  $('bps-tut-next').onclick = function () { if (++k >= STEPS.length) done(); else show(); };
  $('bps-tut-skip').onclick = done;
  var S0 = window.ftStart;
  window.ftStart = function () {
    S0.apply(this, arguments);
    var seen = false; try { seen = localStorage.getItem('bps3d-tut') === '1'; } catch (e) {}
    if (!seen) setTimeout(function () { if (!$('ft-play').classList.contains('hidden')) window.bpsTutorial(); }, 800);
  };
  var fc = $('ft-forecast');
  if (fc) { var hb = document.createElement('button'); hb.type = 'button'; hb.setAttribute('data-en', '❓ How to play'); hb.textContent = T('❓ Cách chơi', '❓ How to play');
    hb.style.cssText = 'display:block;margin:8px auto 0;min-height:36px;padding:0 14px;border:0;border-radius:12px;background:rgba(0,102,135,.1);color:#006687;font-weight:800;font-size:12px;cursor:pointer';
    hb.onclick = window.bpsTutorial; fc.after(hb); }

  /* ---------- Âm thanh & hiệu ứng ---------- */
  var ac = null, sfxOn = true; try { sfxOn = localStorage.getItem('bps-sfx') !== '0'; } catch (e) {}
  function tone(f, t0, d, type, g) { var o = ac.createOscillator(), v = ac.createGain(), n = ac.currentTime + t0; o.type = type; o.frequency.setValueAtTime(f, n);
    v.gain.setValueAtTime(0, n); v.gain.linearRampToValueAtTime(g, n + .015); v.gain.exponentialRampToValueAtTime(.0001, n + d);
    o.connect(v); v.connect(ac.destination); o.start(n); o.stop(n + d + .05); }
  function sfx(kind) { if (!sfxOn) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
    if (kind === 'big') [659, 784, 988, 1319, 1568].forEach(function (f, i) { tone(f, i * .08, .4, 'triangle', .16); });
    else if (kind === 'win') { [784, 988, 1319].forEach(function (f, i) { tone(f, i * .09, .35, 'triangle', .16); }); tone(2093, .3, .5, 'sine', .08); }
    else if (kind === 'loss') { tone(220, 0, .35, 'sawtooth', .07); tone(165, .14, .45, 'sawtooth', .07); }
    else { tone(523, 0, .2, 'sine', .12); tone(659, .1, .25, 'sine', .1); } } catch (e) {} }
  function toast(delta, survey) {
    var host = $('bps3d-wrap') || document.body, pos = delta >= 0, b = document.createElement('div');
    b.textContent = (survey ? '📋 ' : pos ? '💰 +' : '💸 ') + (Math.round(delta * 10) / 10).toLocaleString('vi-VN') + ' ' + T('tr', 'mn');
    b.style.cssText = 'position:absolute;left:50%;top:40%;z-index:6;pointer-events:none;padding:12px 22px;border-radius:999px;font:800 26px/1 "Plus Jakarta Sans",sans-serif;white-space:nowrap;' +
      (pos ? 'background:linear-gradient(180deg,#ffd38a,#fda127);color:#033337;box-shadow:0 5px 0 #c97a12,0 18px 30px -10px rgba(0,0,0,.5)' : 'background:#fff;color:#c0392b;box-shadow:0 5px 0 #d9c7a6,0 18px 30px -10px rgba(0,0,0,.5)');
    host.appendChild(b);
    b.animate([{ transform: 'translate(-50%,20px) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,0) scale(1.08)', opacity: 1, offset: .2 }, { transform: 'translate(-50%,-10px) scale(1)', opacity: 1, offset: .75 }, { transform: 'translate(-50%,-60px) scale(.95)', opacity: 0 }], { duration: 2200, easing: 'ease-out', fill: 'forwards' }).onfinish = function () { b.remove(); };
    if (pos && delta >= 3) for (var i = 0; i < 14; i++) (function () {
      var c = document.createElement('div'); c.textContent = Math.random() < .7 ? '🪙' : '✨';
      c.style.cssText = 'position:absolute;left:50%;top:44%;z-index:5;pointer-events:none;font-size:22px'; host.appendChild(c);
      var a = Math.random() * Math.PI * 2, r = 80 + Math.random() * 120;
      c.animate([{ transform: 'translate(-50%,0)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + Math.round(Math.cos(a) * r) + 'px),' + Math.round(Math.sin(a) * r - 60) + 'px)', opacity: 0 }], { duration: 1200 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }).onfinish = function () { c.remove(); };
    })();
  }
  var C1 = window.ftCommit;
  window.ftCommit = function () {
    var s = window.__bps && window.__bps.S, w = s ? s.week : -1, m = s ? s.sel.m : null, t0 = s ? s.total : 0;
    C1.apply(this, arguments);
    if (!s || m === null || s.week === w) return;
    var d = s.total - t0;
    if (m === 2) { sfx('tick'); toast(d, true); } else { sfx(d < 0 ? 'loss' : d >= 6 ? 'big' : 'win'); toast(d, false); }
  };
  var full = $('bps3d-full');
  if (full) { var sb = document.createElement('button'); sb.type = 'button'; sb.className = 'bps3d-chip';
    sb.style.cssText = 'position:absolute;right:12px;top:92px;cursor:pointer;z-index:2;pointer-events:auto';
    var lab = function () { sb.textContent = sfxOn ? T('🔔 Hiệu ứng: bật', '🔔 Effects: on') : T('🔕 Hiệu ứng: tắt', '🔕 Effects: off'); };
    lab(); sb.onclick = function () { sfxOn = !sfxOn; try { localStorage.setItem('bps-sfx', sfxOn ? '1' : '0'); } catch (e) {} lab(); sfx('tick'); };
    full.after(sb); window.addEventListener('storage', lab); document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[onclick*="Lang"],[data-lang]')) setTimeout(lab, 50); }); }
})();
