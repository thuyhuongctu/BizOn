/* ═══════════════════════════════════════════════════════════════
   BizOn — VỎ DÙNG CHUNG (shell.js)
   Thanh tiến trình, nav "stuck", hiện khi cuộn, công tắc VI/EN + sáng/tối.
   Hành vi riêng của từng trang (vd quan sát bậc thang ở trang đích) để
   trong script riêng của trang, không nhét vào đây.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var prog = document.getElementById('prog');
  var nav = document.getElementById('nav');

  /* thanh tiến trình + nav stuck */
  function onScroll() {
    if (prog) {
      var h = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    }
    if (nav) nav.classList.toggle('stuck', scrollY > 8);
  }
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* hiện khi cuộn tới */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  /* công tắc VI / EN */
  var bvi = document.getElementById('bvi'), ben = document.getElementById('ben');
  window.setLang = function (l) {
    document.documentElement.lang = l;
    if (bvi) bvi.setAttribute('aria-pressed', String(l === 'vi'));
    if (ben) ben.setAttribute('aria-pressed', String(l === 'en'));
    document.querySelectorAll('[data-vi]').forEach(function (el) {
      var t = el.getAttribute('data-' + l);
      if (t) el.innerHTML = t;
    });
  };
  if (bvi) bvi.onclick = function () { window.setLang('vi'); };
  if (ben) ben.onclick = function () { window.setLang('en'); };

  /* công tắc sáng / tối */
  var dark = document.documentElement.getAttribute('data-theme') !== 'light';
  var bth = document.getElementById('bth'), thi = document.getElementById('thi');
  window.setTheme = function (d) {
    dark = d;
    document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light');
    if (bth) bth.setAttribute('aria-pressed', String(d));
    if (thi) thi.textContent = d ? '☀' : '☾';
  };
  if (bth) bth.onclick = function () { window.setTheme(!dark); };
  if (matchMedia('(prefers-color-scheme: light)').matches) window.setTheme(false);
})();
