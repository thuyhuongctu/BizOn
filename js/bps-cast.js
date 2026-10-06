/* Bến Phù Sa 3D – nhân vật nói (cô Hương, thầy Tú, đối thủ, người dẫn) + phát mp3. Thiếu file mp3 thì chỉ hiện chữ.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var V = window.BPS_VOICE; if (!V) return;
  var EN = function () { try { return localStorage.getItem('bizon-lang') === 'en' || document.documentElement.lang === 'en'; } catch (e) { return false; } };
  var L = {}; V.lines.forEach(function (l) { L[l[0]] = l; });
  var muted = false; try { muted = localStorage.getItem('bizon-bps-voice') === 'off'; } catch (e) {}
  var q = [], cur = null, busy = false, hideT = null;
  var RV_IMG = ['assets/character/rivals/alpha.webp', 'assets/character/rivals/mekong.webp', 'assets/character/rivals/star.webp'];
  var RV_NAME = ['Alpha Dynamics', 'Mekong Ventures', 'Star Clay Co.'];

  var css = document.createElement('style');
  css.textContent = '.bps-say{position:fixed;right:16px;bottom:78px;z-index:900;width:min(380px,calc(100vw - 32px));display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;align-items:end;animation:bpsIn .35s cubic-bezier(.2,1.3,.4,1);pointer-events:auto}' +
    '@keyframes bpsIn{from{transform:translateY(16px) scale(.96);opacity:0}to{transform:none;opacity:1}}' +
    '.bps-say img{width:64px;height:64px;object-fit:cover;object-position:top;border-radius:50%;background:#e8f3f6;border:3px solid #fff;box-shadow:0 4px 12px rgba(3,51,55,.25)}' +
    '.bps-say .av{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:28px;background:#033337;border:3px solid #fff}' +
    '.bps-say .b{background:#fffdf6;color:#033337;border-radius:18px 18px 18px 4px;padding:10px 14px;font:600 13.5px/1.5 "Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 8px 24px rgba(3,51,55,.2);border:2px solid rgba(3,51,55,.08)}' +
    '.bps-say .b b{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#b8561b;margin-bottom:2px}' +
    '.bps-say .x{position:absolute;right:6px;top:-10px;width:24px;height:24px;border-radius:50%;border:0;background:#033337;color:#fff;font-size:12px;cursor:pointer}' +
    '#bps-mute{position:fixed;right:16px;bottom:16px;z-index:900;width:48px;height:48px;border-radius:50%;border:0;background:#033337;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 6px 18px rgba(3,51,55,.3)}';
  document.head.appendChild(css);
  var mb = document.createElement('button'); mb.id = 'bps-mute'; mb.type = 'button';
  var paint = function () { mb.textContent = muted ? '🔇' : '🔊'; mb.title = muted ? (EN() ? 'Voice on' : 'Bật lồng tiếng') : (EN() ? 'Voice off' : 'Tắt lồng tiếng'); };
  mb.onclick = function () { muted = !muted; try { localStorage.setItem('bizon-bps-voice', muted ? 'off' : 'on'); } catch (e) {} if (muted && cur) { cur.pause(); cur = null; } paint(); };
  paint(); document.body.appendChild(mb);

  function say(code, opt) { var l = L[code]; if (!l) return; q.push({ l: l, opt: opt || {} }); if (!busy) next(); }
  function next() {
    var it = q.shift(); if (!it) { busy = false; return; } busy = true;
    var l = it.l, sp = V.speakers[l[1]], name = it.opt.name || sp.name, img = it.opt.img || sp.img;
    var old = document.querySelector('.bps-say'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'bps-say';
    el.innerHTML = (img ? '<img src="' + img + '" alt="">' : '<span class="av">' + (l[1] === 'NAR' ? '🎙️' : '⚔️') + '</span>') +
      '<div class="b"><b>' + name + '</b>' + (EN() ? l[4] : l[3]) + '</div><button class="x" type="button" aria-label="Đóng">✕</button>';
    document.body.appendChild(el);
    var done = function () { if (!el.isConnected) return; clearTimeout(hideT); el.remove(); if (cur) { cur.pause(); cur = null; } setTimeout(next, 250); };
    el.querySelector('.x').onclick = done;
    var ms = Math.max(3500, (EN() ? l[4] : l[3]).length * 65);
    hideT = setTimeout(done, ms);
    if (!muted && l[1] !== 'HG') {   // giọng Lumina (HG) đã tắt; vẫn hiện lời thoại
      cur = new Audio(V.base + (EN() ? 'en' : 'vi') + '/' + l[0] + '-v2.mp3');
      cur.onended = function () { clearTimeout(hideT); hideT = setTimeout(done, 900); };
      cur.play().catch(function () {});
    }
  }
  window.BPSSay = say;

  var G = function () { return window.__bps; };
  window.addEventListener('bps-week', function (e) { var w = e.detail.week; if (w === 0) say('BPS_HG_01'); if (w >= 0 && w < 5) say('BPS_TP_0' + (w + 1)); });
  window.addEventListener('bps-result', function (e) {
    var d = e.detail, g = G(); if (!g) return;
    if (d.m === 2) { say('BPS_NAR_22'); return; }
    if (d.storm) say('BPS_NAR_10');
    var hit = []; g.RIVALS.forEach(function (r, k) { if (r.plan && r.plan[d.week] === d.loc) hit.push(k); });
    if (hit.length) { var k = hit[0]; say('BPS_RV_0' + (k + 1), { name: RV_NAME[k], img: RV_IMG[k] }); say('BPS_NAR_21'); }
    else if (!d.storm) say('BPS_NAR_20');
  });
  // tổng kết: đọc hạng từ bảng xếp hạng cuối game
  var ended = false;
  setInterval(function () {
    var end = document.getElementById('ft-end'); if (!end) return;
    var vis = !end.classList.contains('hidden');
    if (vis && !ended) { ended = true; q = []; var rows = document.querySelectorAll('#ft-board .ft-row'), rank = 3;
      rows.forEach(function (r, i) { if (r.classList.contains('me')) rank = i; }); say('BPS_HG_1' + Math.min(3, rank)); }
    if (!vis) ended = false;
  }, 500);
})();
