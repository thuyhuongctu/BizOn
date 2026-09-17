/* BizOn – Linh vật Lumina (theo dõi chuột, phản ứng khi bấm).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Cảm hứng từ page-mascot (nilbuild/page-mascot, MIT © Kamran Ahmed) — bản
 * gốc dùng 2 tấm sprite 3×3 (9 hướng đầu quay + 9 biểu cảm) vẽ riêng cho
 * đúng 1 nhân vật. BizOn chưa có bộ 9 hướng đồng bộ như vậy cho Lumina, nên
 * bản này dùng NGUYÊN ẢNH ĐÃ CÓ trong assets/character/: ảnh mặc định
 * nghiêng nhẹ theo hướng con trỏ (CSS transform, không đổi ảnh nên không
 * bao giờ "giật"/lệch khung); bấm vào thì đổi nhanh sang 1 trong các ảnh
 * biểu cảm có sẵn (giơ ngón cái/vỗ tay/cổ vũ/vẫy tay) kèm hiệu ứng nảy, rồi
 * quay lại ảnh mặc định — cùng ý tưởng "boop" của bản gốc.
 *
 * Chỉ chạy khi có chuột thật (hover:hover + pointer:fine) và tôn trọng
 * prefers-reduced-motion, giống nguyên tắc của bản gốc. */
(function () {
  'use strict';

  const REACT_IMAGES = [
    'assets/character/lumina-vest-thumbsup.webp',
    'assets/character/lumina-ao-dai-clap.webp',
    'assets/character/lumina-ao-dai-cheer.webp',
    'assets/character/lumina-ao-dai-wave.webp',
  ];
  const DEAD_ZONE = 60;      // px quanh tâm ảnh: trong vùng này coi như "nhìn thẳng"
  const MAX_TILT_DEG = 9;    // độ nghiêng tối đa
  const MAX_LIFT_PX = 6;     // dịch dọc tối đa
  const REACT_MS = 550;      // thời gian giữ ảnh biểu cảm trước khi quay lại

  function reduceMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }
  function canHover() {
    try { return window.matchMedia('(hover: hover) and (pointer: fine)').matches; }
    catch (e) { return false; }
  }

  function init() {
    const img = document.getElementById('lumina-mascot-avatar');
    if (!img || img.dataset.mascotWired) return;
    img.dataset.mascotWired = '1';
    const wrap = img.closest('.glow-ring') || img.parentElement;
    if (!wrap) return;

    const defaultSrc = img.getAttribute('src');
    img.style.transition = 'transform .18s ease-out';

    function aim(clientX, clientY) {
      if (reduceMotion() || !canHover()) return;
      const box = img.getBoundingClientRect();
      const dx = clientX - (box.left + box.width / 2);
      const dy = clientY - (box.top + box.height / 2);
      if (Math.hypot(dx, dy) < DEAD_ZONE) { img.style.transform = ''; return; }
      const rot = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, (dx / 240) * MAX_TILT_DEG));
      const lift = Math.max(-MAX_LIFT_PX, Math.min(MAX_LIFT_PX, (dy / 240) * MAX_LIFT_PX));
      img.style.transform = `rotate(${rot.toFixed(1)}deg) translateY(${lift.toFixed(1)}px)`;
    }
    window.addEventListener('pointermove', e => aim(e.clientX, e.clientY), { passive: true });

    let reactTimer = null;
    function boop() {
      clearTimeout(reactTimer);
      const pick = REACT_IMAGES[Math.floor(Math.random() * REACT_IMAGES.length)];
      img.setAttribute('src', pick);
      if (!reduceMotion() && wrap.animate) {
        wrap.animate([
          { transform: 'scale(1,1)' },
          { transform: 'scale(1.12,0.88)', offset: 0.2 },
          { transform: 'scale(0.95,1.06)', offset: 0.5 },
          { transform: 'scale(1,1)' },
        ], { duration: 420, easing: 'ease-in-out' });
      }
      reactTimer = setTimeout(() => img.setAttribute('src', defaultSrc), REACT_MS);
    }
    wrap.style.cursor = 'pointer';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('aria-label', 'Chạm vào Lumina');
    wrap.addEventListener('click', boop);
    wrap.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); boop(); }
    });
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
  if (document.readyState !== 'loading') init();
})();
