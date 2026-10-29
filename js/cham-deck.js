/* CHAM – Bài giảng 8 slide: chuyển slide (nút, phím ←/→, vuốt), toàn màn hình (F), ghi chú người trình bày song ngữ, in/PDF. */
(function () {
  'use strict';
  const K = window.ChamKit;
  const stage = K.$('#dk-stage'), slides = Array.from(stage.querySelectorAll('.dk-slide'));
  let i = 0;
  function show() {
    slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
    K.$('#dk-pos').textContent = (i + 1) + ' / ' + slides.length;
    const s = slides[i]; K.$('#dk-notes').textContent = K.en() ? s.dataset.enNotes : s.dataset.notes;
  }
  const go = n => { i = Math.max(0, Math.min(slides.length - 1, n)); show(); };
  const full = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {}); };
  K.$('#dk-prev').addEventListener('click', () => go(i - 1));
  K.$('#dk-next').addEventListener('click', () => go(i + 1));
  K.$('#dk-full').addEventListener('click', full);
  K.$('#dk-print').addEventListener('click', () => window.print());
  stage.addEventListener('click', e => { if (document.fullscreenElement) go(e.clientX > innerWidth / 2 ? i + 1 : i - 1); });
  let x0 = null;
  stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1); x0 = null; });
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,select')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && document.fullscreenElement)) { e.preventDefault(); go(i + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(i - 1); }
    else if (e.key === 'f' || e.key === 'F') full();
    else if (e.key === 'Home') go(0); else if (e.key === 'End') go(slides.length - 1);
  });
  K.mount(show);
})();
