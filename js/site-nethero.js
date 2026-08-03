/* BizOn – Nền mạng lưới động dùng chung (phong cách DeepMind)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Một lớp nền canvas nhẹ: các nút trôi chậm, nối nhau bằng đường mờ khi ở gần,
 * thỉnh thoảng có một đốm vàng "tín hiệu" chạy dọc một cạnh. Dùng để làm hero
 * các TRANG NỘI DUNG hiện đại (Dự án, Giải pháp, Giới thiệu…). Các trang trò
 * chơi (Bật Nghiệp, Hộ Chiếu Thương Hiệu, Arcade…) CỐ Ý giữ phong cách đất sét,
 * không gắn lớp này.
 *
 * Cách dùng: thêm thuộc tính data-net-hero vào phần tử nền tối (thường là
 * <header>). Script tự chèn canvas phía sau, nâng nội dung lên trên.
 *
 * Tôn trọng người dùng: đứng yên một khung khi prefers-reduced-motion, tạm dừng
 * khi tab ẩn hoặc hero trôi khỏi màn hình, không thêm tài nguyên ngoài (chạy
 * offline, không đụng CSP). Có thể chặn bằng window.BIZON_NO_NETHERO = true.
 */
(function () {
  'use strict';
  if (window.__bizonNetHero) return;
  window.__bizonNetHero = true;
  if (window.BIZON_NO_NETHERO) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function mount(host) {
    if (host.__netHero) return;
    host.__netHero = true;
    var cs = getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    host.style.overflow = 'hidden';

    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none';
    host.insertBefore(cv, host.firstChild);
    // Nâng mọi nội dung sẵn có lên trên canvas
    Array.prototype.forEach.call(host.children, function (ch) {
      if (ch === cv) return;
      var p = getComputedStyle(ch).position;
      if (p === 'static') ch.style.position = 'relative';
      if (!ch.style.zIndex) ch.style.zIndex = '1';
    });

    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = 1, nodes = [], signals = [], raf = 0, running = false;
    var LINK = 130;

    function build() {
      var count = Math.max(16, Math.min(44, Math.round(W * H / 17000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.4 + 0.7
        });
      }
      signals = [];
    }

    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = host.clientWidth; H = host.clientHeight;
      if (!W || !H) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function draw(move) {
      var i, a, b, n;
      if (move) {
        for (i = 0; i < nodes.length; i++) {
          n = nodes[i]; n.x += n.vx; n.y += n.vy;
          if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
          if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
        }
      }
      ctx.clearRect(0, 0, W, H);
      for (a = 0; a < nodes.length; a++) {
        for (b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = 'rgba(130,214,244,' + ((1 - d / LINK) * 0.32).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(184,231,250,.72)'; ctx.fill();
      }
      if (move) {
        if (signals.length < 3 && Math.random() < 0.03) {
          var s = nodes[(Math.random() * nodes.length) | 0], e = nodes[(Math.random() * nodes.length) | 0];
          if (s !== e && Math.hypot(s.x - e.x, s.y - e.y) < LINK * 1.7) signals.push({ s: s, e: e, t: 0 });
        }
        for (i = signals.length - 1; i >= 0; i--) {
          var g = signals[i]; g.t += 0.02;
          if (g.t >= 1) { signals.splice(i, 1); continue; }
          var px = g.s.x + (g.e.x - g.s.x) * g.t, py = g.s.y + (g.e.y - g.s.y) * g.t;
          ctx.beginPath(); ctx.arc(px, py, 2.1, 0, 6.2832); ctx.fillStyle = '#ffce7a'; ctx.fill();
        }
      }
    }

    function loop() { draw(true); raf = requestAnimationFrame(loop); }
    function start() { if (running || !W) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { var wasRun = running; stop(); size(); if (reduce) draw(false); else if (wasRun) start(); }, 200);
    });

    size();
    if (reduce) { draw(false); return; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
      }, { threshold: 0 }).observe(host);
    } else { start(); }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
  }

  function init() {
    var hosts = document.querySelectorAll('[data-net-hero]');
    Array.prototype.forEach.call(hosts, mount);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
