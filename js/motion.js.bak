/* ===========================================================================
   BizOn ACADEMIA 3D — lớp chuyển động (JS)
   Đi cùng css/bizon-motion.css. Không phụ thuộc thư viện ngoài.

   Ba nguyên tắc:
     1. Tôn trọng prefers-reduced-motion — có thì không gắn gì cả.
     2. Parallax chỉ chạy khi thiết bị có con trỏ tinh (chuột/bút), không chạy
        trên cảm ứng (§5).
     3. Mọi thứ chạy trong requestAnimationFrame, không nghe scroll/mousemove
        trực tiếp để khỏi giật khung hình.
   =========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine)');

  /* ---------- 1. Hiện dần khi cuộn ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.bz-reveal');
    if (!els.length) return;
    if (reduced.matches || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    // đánh số thứ tự trong nhóm để hiện lần lượt
    document.querySelectorAll('.bz-stagger').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty('--i', i);
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);          // chỉ hiện một lần, không lặp lại
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2. Parallax theo con trỏ ---------- */
  function initParallax() {
    var scenes = document.querySelectorAll('[data-bz-scene]');
    if (!scenes.length || reduced.matches || !finePointer.matches) return;

    scenes.forEach(function (scene) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

      scene.addEventListener('pointermove', function (ev) {
        var r = scene.getBoundingClientRect();
        // chuẩn hoá về -1..1, kẹp lại để con trỏ ra ngoài không văng số
        tx = Math.max(-1, Math.min(1, (ev.clientX - r.left) / r.width * 2 - 1));
        ty = Math.max(-1, Math.min(1, (ev.clientY - r.top) / r.height * 2 - 1));
        if (!raf) raf = requestAnimationFrame(tick);
      });
      scene.addEventListener('pointerleave', function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });

      function tick() {
        // nội suy để chuyển động mượt, không bám dính con trỏ
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        scene.style.setProperty('--mx', cx.toFixed(4));
        scene.style.setProperty('--my', cy.toFixed(4));
        if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = null;
        }
      }
    });
  }

  /* ---------- 3. Thanh điều hướng thu lại khi cuộn ---------- */
  function initNav() {
    var nav = document.querySelector('.bz-nav');
    if (!nav) return;
    var ticking = false;
    function update() {
      nav.classList.toggle('is-stuck', window.scrollY > 60);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 4. Đếm số, đúng một lần ---------- */
  function initCount() {
    var els = document.querySelectorAll('.bz-count[data-to]');
    if (!els.length) return;
    if (reduced.matches || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = el.dataset.to; el.classList.remove('bz-count'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        var to = parseFloat(el.dataset.to) || 0;
        var dur = 900, t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * eased).toLocaleString('vi-VN');
          if (p < 1) requestAnimationFrame(step);
          else { el.textContent = to.toLocaleString('vi-VN'); el.classList.remove('bz-count'); }
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 5. Chuyển cảnh sang Brand Passport ---------- */
  function initPassport() {
    var links = document.querySelectorAll('[data-bz-passport-link]');
    if (!links.length) return;
    links.forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var book = document.querySelector('.bz-passport');
        // Giảm chuyển động, không có vật thể, hoặc mở tab mới -> đi thẳng
        if (reduced.matches || !book || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
        ev.preventDefault();
        book.classList.add('is-opening');
        var href = a.getAttribute('href');
        var done = false;
        function go() { if (!done) { done = true; location.href = href; } }
        book.addEventListener('animationend', go, { once: true });
        // lưới an toàn: nếu animation không chạy thì vẫn phải chuyển trang
        setTimeout(go, 1400);
      });
    });
  }

  function boot() { initReveal(); initParallax(); initNav(); initCount(); initPassport(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
