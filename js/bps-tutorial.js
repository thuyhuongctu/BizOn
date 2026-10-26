/* Bến Phù Sa 3D – hướng dẫn tân thủ theo từng bước (spotlight trên màn chơi thật).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Cùng cơ chế spotlight với js/bp-tutorial.js (Hộ Chiếu Thương Hiệu) nhưng
 * GẮN VỚI VIỆC THẬT: mỗi bước chiếu sáng đúng khối cần bấm và tự sang bước
 * kế khi người chơi đã làm xong (chọn phương thức → món hàng → điểm trên bản
 * đồ → Chốt tuần → đọc Quan sát thị trường). Lớp phủ chỉ làm tối nền, không
 * chặn bấm, nên người chơi làm thật ngay trong lúc xem hướng dẫn. Tự bật đúng
 * 1 lần ở tuần 1 (localStorage); bấm lại bất cứ lúc nào qua chip «❓ Hướng dẫn»
 * trên cảnh. Trong lúc tour chạy, chip ① ② ③ của Lumina (bps3d-coach) tạm ẩn
 * để không nói hai lần một ý (CSS .bps-tour-on). */
(function () {
  var SEEN_KEY = 'bizon-bps-tour-seen';
  var $q = function (s) { return document.querySelector(s); };
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var S = function () { return window.__bps && window.__bps.S; };
  var narrow = function () { return innerWidth < 1024; };
  var FACE = 'assets/character/phu-sa/huong-tu-ghe-chonoi-v2.webp';

  // sel: khối được chiếu sáng (hàm để chọn theo màn hình); done: điều kiện tự sang bước; gate: không hiện nút Tiếp khi chưa làm.
  var STEPS = [
    { sel: function () { return '#bps3d-tod'; },
      title: function () { return T('⛵ 5 tuần · mỗi tuần 3 quyết định', '⛵ 5 weeks · 3 decisions a week'); },
      text: function () { return T('Mỗi tuần bạn chọn <b>Phương thức</b>, <b>Món hàng</b> và <b>Địa điểm</b> rồi bấm <b>Chốt tuần</b>. Xếp hạng theo <b>lợi nhuận</b> sau 5 tuần. Làm thử ngay tuần này nhé.', 'Each week you pick a <b>Method</b>, a <b>Product</b> and a <b>Location</b>, then <b>Lock in</b>. Ranking is by <b>profit</b> after 5 weeks. Let\'s do week 1 together.'); } },
    { sel: function () { return '#ft-methods'; }, gate: true,
      done: function () { var s = S(); return !!s && s.sel.m !== null; },
      title: function () { return T('1 · Chọn phương thức', '1 · Pick a method'); },
      text: function () { return T('Lần đầu nên chọn <b>🧺 Gánh hàng rong</b>: không tốn phí, nghe ngóng được nhiều tin. <b>⛵ Ghe</b> lãi ×3 nhưng tốn 1,5 triệu/tuần. <b>📋 Khảo sát</b> không bán, chỉ mua dữ liệu.', 'For a first week pick the <b>🧺 Street cart</b>: no fee, lots of market intel. The <b>⛵ Boat</b> earns ×3 but costs 1.5 mn/week. <b>📋 Survey</b> sells nothing, it buys data.'); } },
    { sel: function () { return '#ft-menus'; }, gate: true,
      skip: function () { var s = S(); return !!s && s.sel.m === 2; },
      done: function () { var s = S(); return !!s && s.sel.menu !== null; },
      title: function () { return T('2 · Chọn món hàng', '2 · Pick a product'); },
      text: function () { return T('Nhu cầu thật của từng cặp <b>Món × Địa điểm</b> là ẩn số, mỗi ván mỗi khác. Chọn đại một món, tuần sau bạn sẽ có manh mối để chọn khôn hơn.', 'The real demand for each <b>Product × Location</b> pair is hidden and differs every game. Pick any product now; next week you will have clues to choose better.'); } },
    { sel: function () { return narrow() ? '#bps3d-pick' : '#bps3d'; }, gate: true, map: true,
      skip: function () { var s = S(); return !!s && s.sel.m === 2; },
      done: function () { var s = S(); return !!s && s.sel.loc !== null; },
      title: function () { return T('3 · Bấm một điểm đang nhấp nháy', '3 · Tap a pulsing spot'); },
      text: function () { return narrow()
        ? T('Sáu địa điểm đang <b>nhấp nháy vàng</b> trên bản đồ phía trên. Bấm vào một điểm, hoặc mở <b>«Hoặc chọn từ danh sách»</b> ngay dưới đây. 👥 Đông người = đông khách tuần này.', 'Six spots are <b>pulsing yellow</b> on the map above. Tap one, or open <b>“Or pick from a list”</b> just below. 👥 A crowd means more customers this week.')
        : T('Sáu địa điểm trên bản đồ 3D đang <b>nhấp nháy vàng</b> – bấm vào một điểm (kéo để xoay, cuộn để phóng). 👥 Đông người = đông khách tuần này; 🌧️ mây là mưa bão.', 'Six spots on the 3D map are <b>pulsing yellow</b> – tap one (drag to rotate, scroll to zoom). 👥 A crowd means more customers this week; 🌧️ a cloud means a storm.'); } },
    { sel: function () { return '#ft-commit'; }, gate: true,
      done: function () { return committed; },
      title: function () { return T('4 · Chốt tuần này', '4 · Lock in this week'); },
      text: function () { return T('Đủ ba lựa chọn thì nút này sáng lên. Dòng <b>🔮 dự báo</b> ngay trên nút cho biết khoảng lãi có thể có. Bấm Chốt để xem kết quả.', 'Once all three are picked this button lights up. The <b>🔮 forecast</b> line above it shows the likely profit range. Lock in to see the result.'); } },
    { sel: function () { return '#ft-log'; },
      title: function () { return T('5 · Manh mối cho tuần sau', '5 · Clues for next week'); },
      text: function () { return T('Sau mỗi tuần, <b>Quan sát thị trường</b> ghi lại điều bạn nghe ngóng được. Đây là manh mối quan trọng nhất: cặp nào bán chạy, đối thủ đi đâu. Từ tuần 2 bạn tự chơi – Lumina vẫn ở chip ① ② ③ khi cần.', 'After each week, <b>Watch the market</b> records what you overheard. This is your best clue: which pairs sell well and where rivals go. From week 2 you play on your own – Lumina stays in the ① ② ③ chip whenever you need her.'); } }
  ];

  var idx = -1, overlay = null, committed = false, timer = null;
  function shown(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; }
  function running() { return !!overlay; }

  function paint() {
    if (!overlay || idx < 0) return;
    var step = STEPS[idx];
    if (step.skip && step.skip()) { next(); return; }
    var el = $q(step.sel());
    if (!shown(el)) { next(); return; }
    var r = el.getBoundingClientRect(), pad = 8;
    var top = Math.max(8, r.top - pad), left = Math.max(8, r.left - pad);
    var w = Math.min(innerWidth - left - 8, r.width + pad * 2), h = Math.min(innerHeight - top - 8, r.height + pad * 2);
    var below = r.top + r.height / 2 < innerHeight * 0.5;
    var isDone = !step.done || step.done();
    var last = idx === STEPS.length - 1;
    // Thẻ hướng dẫn: máy tính rộng (cảnh trái, bảng phải) thì kê vào góc trái dưới cảnh để không che bảng quyết định;
    // màn hẹp thì đặt trên/dưới khối được chiếu sáng.
    var cardPos = !narrow() ? 'left:16px; bottom:16px;' : 'left:50%; transform:translateX(-50%);' + (below ? 'top:' + Math.min(innerHeight - 230, top + h + 12) + 'px;' : 'bottom:' + Math.max(12, innerHeight - top + 12) + 'px;');
    overlay.innerHTML =
      '<div style="position:fixed; top:' + top + 'px; left:' + left + 'px; width:' + w + 'px; height:' + h + 'px; border-radius:20px;' +
      'box-shadow:0 0 0 4px rgba(253,161,39,.95), 0 0 0 9999px rgba(2,25,28,.62); transition:all .28s ease; pointer-events:none"></div>' +
      '<div class="clay-card" style="position:fixed; ' + cardPos + ' width:min(92vw, 340px); padding:14px 16px 12px; z-index:1; text-align:left; pointer-events:auto">' +
      '<div style="display:flex; gap:10px; align-items:center; margin-bottom:6px">' +
      '<img src="' + FACE + '" alt="" style="width:40px; height:40px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,102,135,.25))">' +
      '<div><p style="font:700 10px/1 \'JetBrains Mono\',monospace; letter-spacing:.06em; color:#e8762d; margin:0 0 3px">' + T('LUMINA HƯỚNG DẪN', 'LUMINA GUIDE') + ' · ' + (idx + 1) + '/' + STEPS.length + '</p>' +
      '<p class="font-display font-extrabold text-deep-teal" style="font-size:14.5px; margin:0">' + step.title() + '</p></div></div>' +
      '<p class="text-deep-teal/75" style="font-size:12.5px; line-height:1.55; margin:0">' + step.text() + '</p>' +
      '<div style="display:flex; gap:8px; margin-top:12px; align-items:center">' +
      '<button id="bps-tour-skip" class="clay-btn bg-surface-bright text-deep-teal/60 font-bold" style="padding:9px 12px; font-size:12px">' + T('Bỏ qua', 'Skip') + '</button>' +
      (step.gate && !isDone
        ? '<span style="flex:1; font-size:11.5px; font-weight:700; color:#e8762d; text-align:center">' + T('⬆ Làm bước này để đi tiếp', '⬆ Do this step to continue') + '</span>'
        : '<button id="bps-tour-next" class="clay-btn bg-primary text-white font-display font-bold" style="flex:1; padding:9px; font-size:12px">' + (last ? T('Bắt đầu chơi 🎉', 'Start playing 🎉') : T('Tiếp →', 'Next →')) + '</button>') +
      '</div></div>';
    overlay.querySelector('#bps-tour-skip').onclick = stop;
    var nb = overlay.querySelector('#bps-tour-next'); if (nb) nb.onclick = next;
    document.body.classList.toggle('bps-tour-map', !!step.map && !narrow());
  }
  function go(i) {
    idx = i; if (!overlay) return; overlay.innerHTML = '';
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (!overlay || idx !== i) return;
      var step = STEPS[idx], el = $q(step.sel());
      if (shown(el) && !(step.map && !narrow())) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      setTimeout(paint, 120);
    }, 160);
  }
  function next() { idx >= STEPS.length - 1 ? stop() : go(idx + 1); }
  function stop() {
    clearTimeout(timer);
    if (overlay) { overlay.remove(); overlay = null; }
    idx = -1; document.body.classList.remove('bps-tour-on', 'bps-tour-map');
    try { window.dispatchEvent(new CustomEvent('bps-tour', { detail: { on: false } })); } catch (e) {}
  }
  function run() {
    if (overlay) return;
    committed = false;
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; z-index:90; pointer-events:none;';
    document.body.appendChild(overlay);
    document.body.classList.add('bps-tour-on');
    try { window.dispatchEvent(new CustomEvent('bps-tour', { detail: { on: true } })); } catch (e) {}
    go(0);
  }
  // Tự sang bước khi việc của bước đã xong (sự kiện cầu nối ở cuối ben-phu-sa-3d.html).
  function check() {
    if (!overlay || idx < 0) return;
    var step = STEPS[idx];
    if (step.done && step.done()) setTimeout(function () { if (overlay && STEPS[idx] === step) next(); }, step.sel() === '#ft-commit' ? 2600 : 350);
    else paint(); // vẽ lại để đổi trạng thái nút Tiếp
  }
  addEventListener('bps-pick', check);
  addEventListener('bps-commit', function () { committed = true; check(); });
  addEventListener('resize', function () { if (overlay && idx >= 0) paint(); });
  addEventListener('bizon:langchange', function () { if (overlay && idx >= 0) paint(); });

  function seen() { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return true; } }
  function markSeen() { try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {} }
  // Tự bật đúng 1 lần, chỉ khi bắt đầu ván ở tuần 1 (gọi từ cầu nối ftStart).
  function auto() {
    var s = S(); if (!s || s.week !== 0 || seen()) return;
    markSeen(); setTimeout(run, 500);
  }
  function replay() { stop(); run(); }
  window.BPSTour = { auto: auto, replay: replay, close: stop, state: function () { return { running: running(), step: idx, committed: committed }; } };
})();
