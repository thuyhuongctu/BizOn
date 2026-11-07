/* BizOn — phần chạy chung của bốn trang «Văn phòng của đội»: số đếm và lớp .vao khi mục vào khung nhìn, biến --p theo cuộn,
 * gắn sa bàn 3D (js/van-phong-doi-3d.js) khi tới gần. Trang của từng game khai danh sách phòng ở window.VP_PHONG
 * (không khai thì dùng đội Bật Nghiệp có sẵn trong js/van-phong-doi-3d.js). */
addEventListener('DOMContentLoaded', function () {
  var tinh = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canh = [].slice.call(document.querySelectorAll('.canh'));
  // Số đếm: định dạng theo thứ tiếng đang hiện (1,24 / 1.24)
  function dem(el, xong) {
    var dich = parseFloat(el.dataset.dem), le = +el.dataset.le || 0;
    var loc = document.documentElement.lang === 'en' ? 'en-US' : 'vi-VN';
    var f = function (v) { return v.toLocaleString(loc, { minimumFractionDigits: le, maximumFractionDigits: le }); };
    if (tinh || xong) { el.textContent = f(dich); return; }
    var t0 = performance.now();
    (function b(t) { var k = Math.min(1, (t - t0) / 1100); el.textContent = f(dich * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(b); })(t0);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting && !e.target.classList.contains('vao')) { e.target.classList.add('vao'); [].forEach.call(e.target.querySelectorAll('[data-dem]'), function (el) { dem(el); }); } });
  }, { threshold: .35 });
  canh.forEach(function (c) { if (tinh) { c.classList.add('vao'); [].forEach.call(c.querySelectorAll('[data-dem]'), function (el) { dem(el, true); }); } else io.observe(c); });
  new MutationObserver(function () { [].forEach.call(document.querySelectorAll('.vao [data-dem]'), function (el) { dem(el, true); }); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  // --p: tiến độ của mục qua khung nhìn (0 khi mép trên chạm đáy màn hình, 1 khi giữa mục tới giữa màn hình)
  if (!tinh) {
    var hen = false;
    var cap = function () { hen = false; var h = innerHeight; canh.forEach(function (c) { var r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > h) return; var p = (h - r.top) / (h / 2 + r.height / 2); c.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3)); }); };
    addEventListener('scroll', function () { if (!hen) { hen = true; requestAnimationFrame(cap); } }, { passive: true });
    addEventListener('resize', cap); cap();
  }
  // Sa bàn 3D: gắn khi đến gần khung nhìn, để trang mở nhanh
  function gan(id) {
    var o = document.getElementById(id), cv = o.querySelector('canvas'), xong = false;
    var nhin = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || xong) return; xong = true; nhin.disconnect();
      try { window.BizOnVanPhong.mount(cv, { phong: window.VP_PHONG, onPick: function (p) { var d = document.getElementById(p); if (d) d.scrollIntoView({ behavior: tinh ? 'auto' : 'smooth' }); } }); }
      catch (err) { o.classList.add('loi'); }
    }, { rootMargin: '200px' });
    nhin.observe(o);
  }
  gan('sa-dau'); gan('sa-cuoi');
});
