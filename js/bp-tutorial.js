/* Hộ Chiếu Thương Hiệu – Tour hướng dẫn tân thủ (spotlight từng khối thật trên
 * màn hình chơi thật, không phải slide riêng). © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Cùng cơ chế spotlight với js/tutorial.js (Bật Nghiệp) nhưng đơn giản hơn vì
 * Hộ Chiếu Thương Hiệu là một trang tuyến tính (không có các tab luôn tồn tại
 * sẵn trong DOM) – màn Quan sát và màn Quyết định chỉ thật sự có mặt khi người
 * chơi tới đúng bước đó. Vì vậy tour chia làm 2 chặng ngắn, tự bật đúng lúc:
 *   - Chặng "obs": lần đầu vào màn Quan sát & Tình báo (quý 1).
 *   - Chặng "dec": lần đầu vào màn Quyết định (quý 1), gồm cả khối chỉ số HUD
 *     để giải thích các chỉ số này đóng góp gì vào công thức điểm cuối.
 * Cả hai tự tắt vĩnh viễn sau khi xem (localStorage), nhưng bấm lại được bất
 * cứ lúc nào qua nút "❓ Hướng dẫn" trong màn chơi. */
(function () {
  var SEEN_KEY = 'bizon-bp-tour-seen';
  var $q = function (s) { return document.querySelector(s); };
  // brand-passport.html giữ isEN()/T() riêng bên trong IIFE của nó, không lộ
  // ra window – file này chạy độc lập nên cần bản riêng, cùng logic hệt vậy.
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }

  // Lumina đổi biểu cảm/dáng theo đúng nội dung đang giải thích, thay vì
  // đứng yên 1 ảnh suốt tour. Ba ảnh "vest*" cùng khung hình (đã dùng chung
  // object-position ở game.html/lumina-mascot.js) nên hiện tròn như cũ; các
  // ảnh "-cut" trong assets/character/advisors/ là tranh cắt dáng có hiệu
  // ứng riêng (tia sáng, kim tuyến…), khung hình hẹp/rộng khác nhau nên hiện
  // nguyên khung (contain), không bo tròn để không cắt mất tay/hiệu ứng.
  var FACE_NEUTRAL = { src: 'assets/character/lumina-vest.webp' };
  var FACE_WORRIED = { src: 'assets/character/lumina-vest-worried.webp' };
  var FACE_IDEA = { src: 'assets/character/advisors/lumina-y-tuong-cut.webp', contain: true };
  var FACE_CHART = { src: 'assets/character/advisors/lumina-bien-co-thi-truong-cut.webp', contain: true };
  var FACE_CLAP = { src: 'assets/character/advisors/lumina-vo-tay-cut.webp', contain: true };

  // title/text là hàm, không phải chuỗi đã dịch sẵn – để tour luôn hiện đúng
  // ngôn ngữ đang chọn tại đúng thời điểm vẽ (paint()), kể cả khi người chơi
  // đổi ngôn ngữ giữa chừng sau khi trang đã tải xong.
  var OBS_STEPS = [
    { sel: '#bp-signals', face: FACE_WORRIED,
      title: function () { return T('👁️ Tín hiệu thị trường', '👁️ Market signals'); },
      text: function () { return T('Mỗi quý có <b>2 tín hiệu</b> ngẫu nhiên – độ tin cậy khác nhau, có tín hiệu có thể gây hiểu lầm. Đọc kỹ trước khi quyết định.', 'Every quarter shows <b>2 random signals</b> – different reliability, and some can be misleading. Read them closely before deciding.'); } },
    { sel: '#bp-intel-grid', face: FACE_IDEA,
      title: function () { return T('🔎 Mua thêm thông tin', '🔎 Buy more intel'); },
      text: function () { return T('Có thể mua thêm tin từ 6 nguồn (tối đa 2/quý). Nguồn nào cũng có <b>giá và độ thiên lệch riêng</b> – đắt hơn không phải lúc nào cũng đáng tin hơn. Có thể bỏ qua nếu muốn tiết kiệm.', 'You can buy more intel from 6 sources (max 2/quarter). Each has its own <b>price and bias</b> – pricier isn\'t always more trustworthy. Skip this if you want to save cash.'); } },
    { sel: 'button[onclick="bpToDecide()"]', face: FACE_NEUTRAL,
      title: function () { return T('➡️ Sang bước Quyết định', '➡️ Move to the Decision step'); },
      text: function () { return T('Xong phần quan sát thì bấm nút này để qua bước ra quyết định của quý.', 'Once you\'re done observing, tap this to move to the quarter\'s decision step.'); } },
  ];

  var DEC_STEPS = [
    { sel: '#bp-hud', grid: true, face: FACE_CHART,
      title: function () { return T('📊 6 chỉ số quyết định điểm cuối', '📊 6 stats that decide your final score'); },
      text: function () { return T('Điểm tổng = <b>30% Lợi nhuận + 20% Uy tín + 20% Năng lực + 15% Thích ứng + 15% Bền vững</b>. Uy tín/Năng lực/Bền vững thấy ngay ở đây; Thích ứng và Lợi nhuận tích lũy được tính dần qua các quý. Tri thức và Chống chịu không trực tiếp tính điểm nhưng ảnh hưởng doanh thu và độ an toàn.', 'Total score = <b>30% Profit + 20% Reputation + 20% Capability + 15% Adaptation + 15% Sustainability</b>. Reputation/Capability/Sustainability show right here; Adaptation and cumulative Profit build up over the quarters. Knowledge and Resilience don\'t score directly but affect revenue and safety.'); } },
    { sel: '#bp-prio-section', face: FACE_NEUTRAL,
      title: function () { return T('1 · Ưu tiên của quý (bắt buộc)', '1 · Priority for the quarter (required)'); },
      text: function () { return T('Chọn đúng <b>1 trong 5</b> mỗi quý. Đây là lựa chọn duy nhất bắt buộc – chọn xong là đủ điều kiện chốt quý.', 'Pick exactly <b>1 of 5</b> each quarter. This is the only required choice – picking it is enough to lock in the quarter.'); } },
    { sel: '#bp-enter-section', face: FACE_IDEA,
      title: function () { return T('2 · Thâm nhập thị trường (tùy chọn)', '2 · Enter a market (optional)'); },
      text: function () { return T('Tối đa <b>1 thị trường mới/quý</b>. Chỉ số <b>AIBIS</b> chỉ mang tính tham khảo, không thay quyết định của bạn. Chọn xong 1 thị trường + 1 phương thức, phía dưới sẽ hiện <b>dự báo Lumina</b> ước tính doanh thu quý đó.', 'Max <b>1 new market/quarter</b>. The <b>AIBIS</b> score is for reference only, never a substitute for your own judgment. Once you pick a market + a mode, a <b>Lumina forecast</b> below estimates that quarter\'s revenue.'); } },
    { sel: '#bp-budget-section', face: FACE_WORRIED,
      title: function () { return T('3 · Mức vận hành (bắt buộc)', '3 · Operating stance (required)'); },
      text: function () { return T('Dồn lực cho doanh thu cao hơn nhưng chi phí & rủi ro tăng theo – Tiết kiệm thì ngược lại.', 'All-in raises revenue but cost and risk rise with it – Frugal does the opposite.'); } },
    { sel: '#bp-commit', face: FACE_CLAP,
      title: function () { return T('🔒 Chốt quý này', '🔒 Lock in this quarter'); },
      text: function () { return T('Chọn xong Ưu tiên + Mức vận hành là bấm được. Sau khi chốt, <b>không sửa lại được nữa</b> cho quý này.', 'Enabled once you\'ve picked a Priority and an Operating stance. Once locked in, <b>this quarter can\'t be changed</b>.'); } },
  ];

  var idx = -1, overlay = null, steps = null;

  function paint() {
    var step = steps[idx];
    var el = $q(step.sel);
    if (!el) { next(); return; } // phần tử chưa render (vd. đã vào đủ 7 thị trường) → bỏ qua bước
    if (step.grid) el = el.closest('.clay-card') || el;
    var r = el.getBoundingClientRect();
    var pad = 8;
    var top = Math.max(8, r.top - pad), left = Math.max(8, r.left - pad);
    var w = Math.min(innerWidth - left - 8, r.width + pad * 2), h = r.height + pad * 2;
    var below = r.top < innerHeight * 0.45;
    overlay.innerHTML =
      '<div style="position:fixed; top:' + top + 'px; left:' + left + 'px; width:' + w + 'px; height:' + h + 'px;' +
      'border-radius:20px; box-shadow:0 0 0 4px rgba(253,161,39,.95), 0 0 0 9999px rgba(2,25,28,.78);' +
      'transition:all .28s ease; pointer-events:none"></div>' +
      '<div class="clay-card" style="position:fixed; left:50%; transform:translateX(-50%);' +
      (below ? 'top:' + Math.min(innerHeight - 240, top + h + 14) + 'px' : 'bottom:' + Math.max(16, innerHeight - top + 14) + 'px') +
      '; width:min(92vw, 360px); padding:18px 18px 14px; z-index:1; text-align:left">' +
      '<div style="display:flex; gap:10px; align-items:center; margin-bottom:6px">' +
      '<img src="' + (step.face || FACE_NEUTRAL).src + '" alt="" style="width:38px; height:38px;' +
      (step.face && step.face.contain ? ' object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,102,135,.25))' : ' border-radius:999px; object-fit:cover; object-position:50% 12%') + '">' +
      '<p class="font-display font-extrabold text-deep-teal" style="font-size:15px">' + step.title() + '</p></div>' +
      '<p class="text-deep-teal/75" style="font-size:12.5px; line-height:1.55">' + step.text() + '</p>' +
      '<div style="display:flex; justify-content:center; gap:5px; margin:12px 0 10px">' + steps.map(function (_, i) {
        return '<span style="width:7px; height:7px; border-radius:999px; background:' + (i === idx ? '#006687' : 'rgba(0,102,135,.2)') + '"></span>';
      }).join('') + '</div>' +
      '<div style="display:flex; gap:8px">' +
      '<button id="bp-tour-skip" class="clay-btn bg-surface-bright text-deep-teal/60 font-bold" style="flex:1; padding:10px; font-size:12px">' + (idx ? T('← Trước', '← Back') : T('Bỏ qua', 'Skip')) + '</button>' +
      '<button id="bp-tour-next" class="clay-btn bg-primary text-white font-display font-bold" style="flex:1.4; padding:10px; font-size:12px">' + (idx === steps.length - 1 ? T('Hoàn tất 🎉', 'Done 🎉') : T('Tiếp theo →', 'Next →')) + '</button></div></div>';
    overlay.querySelector('#bp-tour-next').onclick = next;
    overlay.querySelector('#bp-tour-skip').onclick = function () { idx ? go(idx - 1) : stop(); };
  }

  function go(i) {
    idx = i;
    overlay.innerHTML = '';
    setTimeout(function () {
      var el = $q(steps[idx].sel);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      setTimeout(paint, 120);
    }, 180);
  }

  function next() { idx >= steps.length - 1 ? stop() : go(idx + 1); }

  function stop() {
    if (overlay) { overlay.remove(); overlay = null; }
    steps = null; idx = -1;
  }

  function run(which) {
    if (overlay) return; // đã có tour đang chạy (obs hoặc dec) thì không chồng lên nhau
    steps = which === 'obs' ? OBS_STEPS : DEC_STEPS;
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; z-index:90; background:transparent;';
    document.body.appendChild(overlay);
    addEventListener('resize', function () { if (overlay && idx >= 0) paint(); });
    go(0);
  }

  // Đổi ngôn ngữ ngay giữa tour (hiếm khi xảy ra, nhưng vẽ lại ngay cho khớp
  // quy ước của trang: không giữ lại chữ đã dịch sẵn từ trước khi đổi).
  addEventListener('bizon:langchange', function () { if (overlay && idx >= 0) paint(); });

  function seen() { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch (e) { return {}; } }
  function markSeen(which) {
    try { var s = seen(); s[which] = 1; localStorage.setItem(SEEN_KEY, JSON.stringify(s)); } catch (e) {}
  }

  // Tự bật đúng 1 lần cho mỗi chặng, chỉ ở quý 1 (S.q === 0) – gọi từ
  // renderObsScreen()/stageDecide() của brand-passport.html ngay sau khi vẽ
  // xong màn tương ứng. Không tự bật lại ở các quý sau dù chưa xem hết.
  function autoObs(q) {
    if (q !== 0 || seen().obs) return;
    markSeen('obs');
    setTimeout(function () { run('obs'); }, 400);
  }
  function autoDecide(q) {
    if (q !== 0 || seen().dec) return;
    markSeen('dec');
    setTimeout(function () { run('dec'); }, 400);
  }
  // Bấm lại thủ công qua nút "❓ Hướng dẫn" – hiện đúng chặng khớp màn đang
  // xem (obs hay dec); bỏ qua nếu đang ở màn khác (biến cố/kết thúc/giới thiệu).
  function replay(phase) {
    if (phase === 'obs') run('obs');
    else if (phase === 'dec') run('dec');
  }

  window.BPTour = { autoObs: autoObs, autoDecide: autoDecide, replay: replay };
})();
