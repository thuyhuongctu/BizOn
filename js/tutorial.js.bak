/* BizOn – Tour hướng dẫn tân thủ (spotlight từng nút thật trên màn hình)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Lần đầu vào game (sau màn Giới thiệu), Lumina dẫn người chơi qua 8 điểm
 * chính: vòng đấu, chỉ số, cố vấn, bảng quyết định và nút Commit – để lớp
 * 40–60 sinh viên tự biết bấm vào đâu mà không cần giảng viên chỉ từng máy.
 * Chạy lại bất cứ lúc nào bằng nút "❓ Hướng dẫn" ở Truy cập nhanh. */
(function () {
  const SEEN_KEY = 'bizon-tour-seen';
  const STEPS = [
    { tab: 'home', sel: '#dash-round', card: true,
      title: '🎯 Trung tâm điều hành', text: 'Đây là vòng hiện tại của đội. Một ván có <b>6 vòng</b>, mỗi vòng ≈ 5–7 phút: xem tình hình → quyết định → khóa vòng → đọc kết quả.' },
    { tab: 'home', sel: '#m-cash', grid: true,
      title: '📊 Ba chỉ số sống còn', text: '<b>Dòng tiền</b> – hết tiền là nguy; <b>Thị phần</b> – cao nhất lớp thì cắm cờ 🚩; <b>Thương hiệu</b> – giữ khách quay lại. Ba số này đổi sau mỗi vòng.' },
    { tab: 'home', sel: '#dash-lumina', card: true,
      title: '🤖 Lumina – cố vấn AI của đội', text: 'Bí thì hỏi Lumina! Cô ấy phân tích kịch bản «Nếu – Thì» trước khi bạn chốt. Mỗi vòng có số lượt hỏi giới hạn nên hãy dùng khôn ngoan.' },
    { tab: 'home', sel: '#btn-go-decisions',
      title: '🗳️ Cánh cửa quan trọng nhất', text: 'Nút này mở <b>bảng quyết định</b> – nơi cả đội thống nhất giá bán, sản xuất, marketing… cho vòng này. Ta vào xem thử nhé!' },
    { tab: 'decisions', sel: '#in-price', card: true,
      title: '💲 Kéo là ra chiến lược', text: 'Kéo các thanh trượt để định <b>giá bán</b>, ngân sách <b>marketing</b>, <b>sản lượng</b>… Ô «Dự báo thị phần» sẽ báo ngay bạn đang thắng hay thua so với 3 đối thủ AI.' },
    { tab: 'decisions', sel: '#btn-commit',
      title: '🔒 Commit – khóa quyết định', text: 'Cả đội thống nhất xong mới bấm nút này. Sau khi khóa, thị trường chạy mô phỏng và <b>không sửa lại được</b> – đúng như đời thật!' },
    { tab: 'advisor', sel: '#advisor-chat',
      title: '💬 Phòng cố vấn', text: 'Đây là nơi trò chuyện với Lumina: chọn câu hỏi theo vai của bạn (CEO/CFO/CMO/COO/Thư ký) để nhận phân tích riêng. Sau mỗi vòng nhớ đọc mục <b>Báo cáo</b> để hiểu «Vì sao?».' },
    { tab: 'home', sel: '.nav-item[data-tab="home"]', nav: true,
      title: '🧭 Thanh điều hướng', text: 'Di chuyển giữa các khu bằng thanh này. Vậy là đủ để bắt đầu – chúc đội của bạn thắng lớn! 🚀' },
  ];

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
          <button id="tour-skip" class="clay-btn bg-surface-bright text-deep-teal/60 font-bold" style="flex:1; padding:10px; font-size:12px">${idx ? '← Trước' : 'Bỏ qua'}</button>
          <button id="tour-next" class="clay-btn bg-primary text-white font-display font-bold" style="flex:1.4; padding:10px; font-size:12px">${idx === STEPS.length - 1 ? 'Hoàn tất 🎉' : 'Tiếp theo →'}</button>
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
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; z-index:90;';
    overlay.style.background = 'transparent';
    document.body.appendChild(overlay);
    addEventListener('resize', () => { if (overlay && idx >= 0) paint(); });
    go(0);
  }

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
      if (app && !app.classList.contains('hidden') && !introOpen && !eventOpen && !overlay) {
        clearInterval(iv);
        start();
      }
    }, 1000);
  }
  document.addEventListener('DOMContentLoaded', autoStart);

  window.BizonTour = { start, stop };
})();
