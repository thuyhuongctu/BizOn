/* BizOn – Tour hướng dẫn tân thủ (spotlight từng nút thật trên màn hình)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Lần đầu vào game (sau màn Giới thiệu), Lumina dẫn người chơi qua 8 điểm
 * chính: vòng đấu, chỉ số, cố vấn, bảng quyết định và nút Commit – để lớp
 * 40–60 sinh viên tự biết bấm vào đâu mà không cần giảng viên chỉ từng máy.
 * Chạy lại bất cứ lúc nào bằng nút "❓ Hướng dẫn" ở Truy cập nhanh. */
(function () {
  const SEEN_KEY = 'bizon-tour-seen';
  const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  // Hàm (không phải hằng) để chữ theo đúng ngôn ngữ đang chọn mỗi lần mở tour.
  const STEPS_LIST = () => [
    { tab: 'home', sel: '#dash-round', card: true,
      title: tr('🎯 Trung tâm điều hành', '🎯 Command center'), text: tr('Đây là vòng hiện tại của đội. Một ván có <b>6 vòng</b>, mỗi vòng ≈ 5–7 phút: xem tình hình → quyết định → khóa vòng → đọc kết quả.', 'This is your team\'s current round. A game has <b>6 rounds</b>, about 5–7 minutes each: read the situation → decide → lock in → read the results.') },
    { tab: 'home', sel: '#m-cash', grid: true,
      title: tr('📊 Ba chỉ số sống còn', '📊 Three vital numbers'), text: tr('<b>Dòng tiền</b> – hết tiền là nguy; <b>Thị phần</b> – cao nhất trong 4 đội <i>và có lãi</i> thì cắm cờ 🚩 (cao nhất mà lỗ thì chưa tính!); <b>Thương hiệu</b> – giữ khách quay lại. Ba số này đổi sau mỗi vòng.', '<b>Cash</b> – running out is dangerous; <b>Market share</b> – the highest of the 4 firms <i>and a profit</i> plants a flag 🚩 (highest with a loss does not count!); <b>Brand</b> – keeps customers coming back. All three change after every round.') },
    { tab: 'home', sel: '#dash-lumina', card: true,
      title: tr('🤖 Lumina – cố vấn AI của đội', '🤖 Lumina – your team\'s AI advisor'), text: tr('Bí thì hỏi Lumina! Cô ấy phân tích kịch bản «Nếu – Thì» trước khi bạn chốt. Mỗi vòng có số lượt hỏi giới hạn nên hãy dùng khôn ngoan.', 'Stuck? Ask Lumina! She runs «What-If» scenarios before you lock in. Questions per round are limited, so use them wisely.') },
    { tab: 'home', sel: '#btn-go-decisions',
      title: tr('🗳️ Cánh cửa quan trọng nhất', '🗳️ The most important door'), text: tr('Nút này mở <b>bảng quyết định</b> – nơi cả đội thống nhất giá bán, sản xuất, marketing… cho vòng này. Ta vào xem thử nhé!', 'This button opens the <b>decision board</b> – where the team agrees on price, output, marketing… for this round. Let\'s take a look!') },
    { tab: 'decisions', sel: '#in-price', card: true,
      title: tr('💲 Kéo là ra chiến lược', '💲 Slide your strategy'), text: tr('Kéo các thanh trượt để định <b>giá bán</b>, ngân sách <b>marketing</b>, <b>sản lượng</b>… Ô «Dự báo thị phần» sẽ báo ngay bạn đang thắng hay thua so với 3 đối thủ ảo.', 'Drag the sliders to set <b>price</b>, <b>marketing</b> budget, <b>output</b>… The «Market share forecast» box tells you right away whether you are beating the 3 virtual rivals.') },
    { tab: 'decisions', sel: '#btn-commit',
      title: tr('🔒 Commit – khóa quyết định', '🔒 Commit – lock in decisions'), text: tr('Cả đội thống nhất xong mới bấm nút này. Sau khi khóa, thị trường chạy mô phỏng và <b>không sửa lại được</b> – đúng như đời thật!', 'Press this only once the whole team agrees. After locking, the market simulation runs and <b>nothing can be changed</b> – just like real life!') },
    { tab: 'advisor', sel: '#advisor-chat',
      title: tr('💬 Phòng cố vấn', '💬 Advisor room'), text: tr('Đây là nơi trò chuyện với Lumina: chọn câu hỏi theo vai của bạn (CEO/CFO/CMO/COO/Thư ký) để nhận phân tích riêng. Sau mỗi vòng nhớ đọc mục <b>Báo cáo</b> để hiểu «Vì sao?».', 'Chat with Lumina here: pick questions for your role (CEO/CFO/CMO/COO/Secretary) to get a tailored analysis. After each round, read the <b>Reports</b> to understand «Why?».') },
    { tab: 'home', sel: '.nav-item[data-tab="home"]', nav: true,
      title: tr('🧭 Thanh điều hướng', '🧭 Navigation bar'), text: tr('Di chuyển giữa các khu bằng thanh này. Vậy là đủ để bắt đầu – chúc đội của bạn thắng lớn! 🚀', 'Move between areas with this bar. That is all you need to start – good luck to your team! 🚀') },
  ];
  let STEPS = STEPS_LIST();

  let idx = -1, overlay = null;
  const $q = s => document.querySelector(s);

  function targetOf(step) {
    let el = $q(step.sel);
    if (!el) return null;
    if (step.card) el = el.closest('.clay-card') || el;
    if (step.grid) el = el.closest('.grid') || el;
    if (step.nav) el = el.closest('nav') || el.parentElement || el;
    return el;
  }

  function paint() {
    const step = STEPS[idx];
    const el = targetOf(step);
    if (!el) { next(); return; } // phần tử chưa render → bỏ qua bước này
    const r = el.getBoundingClientRect();
    const pad = 8;
    const top = Math.max(8, r.top - pad), left = Math.max(8, r.left - pad);
    const w = Math.min(innerWidth - left - 8, r.width + pad * 2), h = r.height + pad * 2;
    const below = r.top < innerHeight * 0.45; // target ở nửa trên → thẻ chữ đặt bên dưới
    overlay.innerHTML = `
      <div style="position:fixed; top:${top}px; left:${left}px; width:${w}px; height:${h}px;
        border-radius:20px; box-shadow:0 0 0 4px rgba(253,161,39,.95), 0 0 0 9999px rgba(2,25,28,.78);
        transition:all .28s ease; pointer-events:none"></div>
      <div class="clay-card" style="position:fixed; left:50%; transform:translateX(-50%);
        ${below ? `top:${Math.min(innerHeight - 240, top + h + 14)}px` : `bottom:${Math.max(16, innerHeight - top + 14)}px`};
        width:min(92vw, 360px); padding:18px 18px 14px; z-index:1; text-align:left">
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:6px">
          <img src="assets/character/lumina-vest.webp" alt="" style="width:38px; height:38px; border-radius:999px; object-fit:cover; object-position:50% 12%">
          <p class="font-display font-extrabold text-deep-teal" style="font-size:15px">${step.title}</p>
        </div>
        <p class="text-deep-teal/75" style="font-size:12.5px; line-height:1.55">${step.text}</p>
        <div style="display:flex; justify-content:center; gap:5px; margin:12px 0 10px">${STEPS.map((_, i) =>
          `<span style="width:7px; height:7px; border-radius:999px; background:${i === idx ? '#006687' : 'rgba(0,102,135,.2)'}"></span>`).join('')}</div>
        <div style="display:flex; gap:8px">
          <button id="tour-skip" class="clay-btn bg-surface-bright text-deep-teal/60 font-bold" style="flex:1; padding:10px; font-size:12px">${idx ? tr('← Trước', '← Back') : tr('Bỏ qua', 'Skip')}</button>
          <button id="tour-next" class="clay-btn bg-primary text-white font-display font-bold" style="flex:1.4; padding:10px; font-size:12px">${idx === STEPS.length - 1 ? tr('Hoàn tất 🎉', 'Done 🎉') : tr('Tiếp theo →', 'Next →')}</button>
        </div>
      </div>`;
    overlay.querySelector('#tour-next').onclick = next;
    overlay.querySelector('#tour-skip').onclick = () => { idx ? go(idx - 1) : stop(); };
  }

  function go(i) {
    idx = i;
    const step = STEPS[idx];
    if (typeof showTab === 'function') { try { showTab(step.tab); } catch (e) {} }
    overlay.innerHTML = ''; // che màn trong lúc cuộn
    setTimeout(() => {
      const el = targetOf(step);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      setTimeout(paint, 120);
    }, 180);
  }

  function next() { idx >= STEPS.length - 1 ? stop(true) : go(idx + 1); }

  function stop(done) {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    if (overlay) { overlay.remove(); overlay = null; }
    if (typeof showTab === 'function') { try { showTab('home'); } catch (e) {} }
    if (done && typeof createConfetti === 'function') { try { createConfetti(); } catch (e) {} }
  }

  function start() {
    if (overlay) return;
    STEPS = STEPS_LIST();
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; z-index:90;';
    overlay.style.background = 'transparent';
    document.body.appendChild(overlay);
    go(0);
  }
  // Gắn đúng 1 lần cho cả trang – start() có thể gọi lại nhiều lần (nút "❓
  // Hướng dẫn"), gắn addEventListener trong đó sẽ cộng dồn listener resize
  // không bao giờ gỡ. Điều kiện overlay && idx >= 0 đã tự lo việc chỉ vẽ lại
  // khi tour đang thật sự mở.
  addEventListener('resize', () => { if (overlay && idx >= 0) paint(); });

  // Tự khởi động cho người chơi mới: đợi vào app xong và màn Giới thiệu
  // (slide 🎬) đóng lại rồi mới dẫn tour – tối đa chờ 90 giây.
  function autoStart() {
    try { if (localStorage.getItem(SEEN_KEY)) return; } catch (e) {}
    let tries = 0;
    const iv = setInterval(() => {
      if (++tries > 90) { clearInterval(iv); return; }
      const app = document.getElementById('app-shell');
      const introOpen = document.querySelector('#intro-next'); // slide Giới thiệu đang mở
      const eventOpen = document.querySelector('#ev-close');   // màn biến cố toàn màn hình đang mở
      const caseDrawOpen = document.querySelector('#case-draw-cta'); // màn bốc thăm Trường hợp đang mở
      if (app && !app.classList.contains('hidden') && !introOpen && !eventOpen && !caseDrawOpen && !overlay) {
        clearInterval(iv);
        start();
      }
    }, 1000);
  }
  document.addEventListener('DOMContentLoaded', autoStart);

  window.BizonTour = { start, stop };
})();
