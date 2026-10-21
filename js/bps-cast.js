/* Bến Phù Sa 3D – nhân vật nói (cô Hương, thầy Tú, đối thủ, người dẫn) + phát mp3. Thiếu file mp3 thì chỉ hiện chữ.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var V = window.BPS_VOICE; if (!V) return;
  var EN = function () { try { return localStorage.getItem('bizon-lang') === 'en' || document.documentElement.lang === 'en'; } catch (e) { return false; } };
  var L = {}; V.lines.forEach(function (l) { L[l[0]] = l; });
  var muted = false; try { muted = localStorage.getItem('bizon-bps-voice') === 'off'; } catch (e) {}
  var q = [], cur = null, busy = false, hideT = null;
  // Tên/ảnh đối thủ trong bản thu âm – trang nào dùng đối thủ khác (bản v8) thì lấy từ window.__bps.RIVALS
  var RV_IMG = ['assets/character/rivals/alpha.webp', 'assets/character/rivals/mekong.webp', 'assets/character/rivals/star.webp'];
  var RV_NAME = ['Alpha Dynamics', 'Mekong Ventures', 'Star Clay Co.'];
  // Chỉ phát mp3 ở ngôn ngữ đã thu âm (V.langs) – ngôn ngữ khác chỉ hiện chữ, không tải thử file
  var hasAudio = function () { return (V.langs || ['vi']).indexOf(EN() ? 'en' : 'vi') >= 0; };

  var css = document.createElement('style');
  css.textContent = '.bps-say{position:fixed;right:16px;bottom:78px;z-index:900;width:min(380px,calc(100vw - 32px));display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;align-items:end;animation:bpsIn .35s cubic-bezier(.2,1.3,.4,1);pointer-events:none}' +
    '.bps-say.inline{position:relative;left:auto;right:auto;top:auto;bottom:auto;z-index:auto;margin:0 auto 16px;width:min(420px,100%);text-align:left}' +
    '@keyframes bpsIn{from{transform:translateY(16px) scale(.96);opacity:0}to{transform:none;opacity:1}}' +
    '.bps-say img{width:64px;height:64px;object-fit:cover;object-position:top;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 12px rgba(3,51,55,.25)}' +
    '.bps-say .av{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:28px;background:#033337;border:3px solid #fff}' +
    '.bps-say .b{background:#fffdf6;color:#033337;border-radius:18px 18px 18px 4px;padding:10px 14px;font:600 13.5px/1.5 "Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 8px 24px rgba(3,51,55,.2);border:2px solid rgba(3,51,55,.08)}' +
    '.bps-say .b b{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#b8561b;margin-bottom:2px}' +
    '.bps-say .x{position:absolute;right:6px;top:-10px;width:28px;height:28px;border-radius:50%;border:0;background:#033337;color:#fff;font-size:12px;cursor:pointer;pointer-events:auto}' +
    '#bps-mute{position:fixed;right:16px;bottom:16px;z-index:900;width:44px;height:44px;border-radius:50%;border:0;background:#033337;color:#fff;font-size:19px;cursor:pointer;box-shadow:0 6px 18px rgba(3,51,55,.3)}';
  document.head.appendChild(css);
  var mb = document.createElement('button'); mb.id = 'bps-mute'; mb.type = 'button';
  var paint = function () { mb.textContent = muted ? '🔇' : '🔊'; mb.title = muted ? (EN() ? 'Voice on' : 'Bật lồng tiếng') : (EN() ? 'Voice off' : 'Tắt lồng tiếng'); };
  mb.onclick = function () { muted = !muted; try { localStorage.setItem('bizon-bps-voice', muted ? 'off' : 'on'); } catch (e) {} if (muted && cur) { cur.pause(); cur = null; } paint(); };
  paint(); document.body.appendChild(mb);

  function say(code, opt) { var l = L[code]; if (!l) return; q.push({ l: l, opt: opt || {} }); if (!busy) next(); }

  // ---- Vị trí: bong bóng & nút loa nằm TRONG khung cảnh 3D đang thấy, né bảng
  // quyết định (#ft-play / #hud-panel) và không chặn bấm; màn kết thúc thì nằm
  // trong thẻ kết quả (không đè bảng xếp hạng).
  function vis(e) { if (!e) return false; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function sceneRect() {
    var play = document.getElementById('ft-play'), wrap = document.getElementById('bps3d-wrap');
    if (!play || play.classList.contains('hidden') || !vis(wrap)) return null;
    var r = wrap.getBoundingClientRect();
    var R = { top: Math.max(0, r.top), bottom: Math.min(innerHeight, r.bottom), left: Math.max(0, r.left), right: Math.min(innerWidth, r.right) };
    // bản 3D: #ft-play chính là bảng; bản v8: cảnh nằm trong #ft-play, bảng là #hud-panel
    var panel = document.getElementById('hud-panel') || (play.contains(wrap) ? null : play);
    if (vis(panel)) {
      var p = panel.getBoundingClientRect();
      if (p.top > R.top + 40 && p.left <= R.left + 10) R.bottom = Math.min(R.bottom, p.top); // tấm trượt dưới đáy (di động)
      else if (p.left > R.left + 40) R.right = Math.min(R.right, p.left);                   // cột phải (máy tính)
    }
    // đáy cột chip góc phải trên (toàn màn hình, âm thanh, hiệu ứng…)
    R.col = R.top + 8;
    wrap.querySelectorAll('.bps3d-chip').forEach(function (c) {
      if (c === mb || !vis(c)) return; var b = c.getBoundingClientRect();
      // chỉ chip hẹp nằm hẳn ở nửa phải, sát mép trên (không tính ô hướng dẫn/dòng gợi ý trải ngang)
      if (b.left > (R.left + R.right) / 2 && b.right > R.right - 40 && b.top < R.top + 200) R.col = Math.max(R.col, b.bottom);
    });
    return R;
  }
  function place() {
    var hub = document.getElementById('chub'), R = sceneRect(), m = mb.style;
    if (hub) { m.left = 'auto'; m.right = '16px'; m.bottom = 'auto'; m.top = '64px'; }           // hub đất sét: né dòng hướng dẫn góc phải dưới
    else if (R) { m.left = 'auto'; m.right = (innerWidth - R.right + 12) + 'px'; m.bottom = 'auto'; m.top = (R.col + 8) + 'px'; }
    else { m.left = 'auto'; m.right = '16px'; m.top = 'auto'; m.bottom = '16px'; }
    var el = document.querySelector('.bps-say'); if (!el || el.classList.contains('inline')) return;
    var st = el.style;
    if (R && R.right - R.left >= 560) { // máy tính: góc phải trên của cảnh, dưới nút loa
      st.left = 'auto'; st.right = (innerWidth - R.right + 12) + 'px'; st.bottom = 'auto';
      st.top = (R.col + 60) + 'px'; st.width = Math.min(380, R.right - R.left - 24) + 'px';
    } else if (R) { // di động: đầu khung cảnh đang thấy, trên tấm trượt; chừa cột nút loa bên phải
      st.right = 'auto'; st.left = (R.left + 12) + 'px'; st.bottom = 'auto';
      st.top = (R.top + 10) + 'px'; st.width = Math.max(200, R.right - R.left - 24 - 52) + 'px';
    } else { st.left = 'auto'; st.right = '16px'; st.top = 'auto'; st.bottom = '16px'; st.width = ''; }
  }
  window.addEventListener('resize', place);

  function next() {
    var it = q.shift(); if (!it) { busy = false; return; } busy = true;
    var l = it.l, sp = V.speakers[l[1]], name = it.opt.name || (EN() ? sp.nameEn || sp.name : sp.name), img = it.opt.img || sp.img;
    var text = it.opt.text || (EN() ? l[4] : l[3]);
    var old = document.querySelector('.bps-say'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'bps-say';
    el.innerHTML = (img ? '<img src="' + img + '" alt="">' : '<span class="av">' + (l[1] === 'NAR' ? '🎙️' : '⚔️') + '</span>') +
      '<div class="b"><b>' + name + '</b>' + text + '</div><button class="x" type="button" aria-label="' + (EN() ? 'Close' : 'Đóng') + '">✕</button>';
    var end = document.getElementById('ft-end'), card = end && !end.classList.contains('hidden') ? end.querySelector('.clay-card') : null;
    if (card) { el.classList.add('inline'); card.insertBefore(el, card.firstChild); } else document.body.appendChild(el);
    place();
    var done = function () { if (!el.isConnected) return; clearTimeout(hideT); el.remove(); if (cur) { cur.pause(); cur = null; } setTimeout(next, 250); };
    el.querySelector('.x').onclick = done;
    if (card) busy = false; // màn kết thúc: lời tổng kết ở lại trong thẻ kết quả tới khi bấm ✕
    else hideT = setTimeout(done, Math.max(3500, text.length * 65));
    if (!muted && l[1] !== 'HG' && !it.opt.noAudio && hasAudio()) {   // giọng Lumina (HG) đã tắt; vẫn hiện lời thoại
      cur = new Audio(V.base + (EN() ? 'en' : 'vi') + '/' + l[0] + '-v2.mp3');
      cur.onended = function () { if (card) return; clearTimeout(hideT); hideT = setTimeout(done, 900); };
      cur.play().catch(function () {});
    }
  }
  window.BPSSay = say;

  var G = function () { return window.__bps; };
  window.addEventListener('bps-week', function (e) { var w = e.detail.week; if (w === 0) say('BPS_HG_01'); if (w >= 0 && w < 5) say('BPS_TP_0' + (w + 1)); });
  var endShown = function () { var end = document.getElementById('ft-end'); return !!end && !end.classList.contains('hidden'); };
  window.addEventListener('bps-result', function (e) {
    var d = e.detail, g = G(); if (!g || endShown()) return; // tuần cuối: màn kết thúc đã mở, chỉ còn lời tổng kết
    if (d.m === 2) { say('BPS_NAR_22'); return; }
    if (d.storm) say('BPS_NAR_10');
    var hit = []; g.RIVALS.forEach(function (r, k) { if (r.plan && r.plan[d.week] === d.loc) hit.push(k); });
    if (hit.length) {
      var k = hit[0], r = g.RIVALS[k] || {}, code = 'BPS_RV_0' + (k + 1), o = { name: r.name || RV_NAME[k], img: r.img || RV_IMG[k] };
      // Đối thủ của trang khác tên trong bản thu âm → lời theo tên thật, không phát mp3 đọc tên cũ
      var tpl = V.rivalTpl && V.rivalTpl[code];
      if (r.name && r.name !== RV_NAME[k] && tpl) { o.text = (EN() ? tpl[1] : tpl[0]).replace('{n}', r.name); o.noAudio = true; }
      say(code, o); say('BPS_NAR_21');
    }
    else if (!d.storm && d.rev > 0) say('BPS_NAR_20'); // «đắt hàng» chỉ khi tuần này có lãi
  });
  // tổng kết: đọc hạng từ bảng xếp hạng cuối game
  var ended = false;
  setInterval(function () {
    place();
    var end = document.getElementById('ft-end'); if (!end) return;
    var vis = !end.classList.contains('hidden');
    if (vis && !ended) { ended = true; q = [];
      // bỏ bong bóng đang nổi của màn chơi (không để nó đè bảng xếp hạng)
      var old = document.querySelector('.bps-say'); if (old && !old.classList.contains('inline')) { clearTimeout(hideT); old.remove(); if (cur) { cur.pause(); cur = null; } busy = false; }
      var rows = document.querySelectorAll('#ft-board .ft-row'), rank = 3;
      rows.forEach(function (r, i) { if (r.classList.contains('me')) rank = i; }); say('BPS_HG_1' + Math.min(3, rank)); }
    if (!vis) ended = false;
  }, 500);
})();
