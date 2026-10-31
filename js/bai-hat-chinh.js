/* BizOn – bài hát chính trên trang chủ: «BizOn – L'Esprit du Mékong».
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 * Không tự phát: nhạc chỉ tải và chạy khi khách bấm nút ở phần đầu trang. Khi đã bật, một thanh nhỏ
 * nổi ở góc phải dưới để tạm dừng / phát tiếp hoặc tắt hẳn mà không phải cuộn lên. Mở video giới
 * thiệu hay MV thì nhạc tự dừng. */
(function () {
  var SRC = 'assets/audio/bizon-lesprit-du-mekong.mp3';
  var nut = document.getElementById('bz-song');
  var thanh = document.getElementById('bz-song-bar');
  if (!nut || !thanh) return;
  var a = null, daBat = false;
  var en = function () { return (document.documentElement.lang || '').slice(0, 2) === 'en'; };
  var chu = {
    phat: function () { return en() ? 'Play' : 'Phát'; },
    dung: function () { return en() ? 'Pause' : 'Tạm dừng'; },
  };
  function ve() {
    var dang = a && !a.paused;
    nut.setAttribute('aria-pressed', dang ? 'true' : 'false');
    nut.querySelector('.hp-intro-dot').textContent = dang ? '❚❚' : '♪';
    thanh.hidden = !daBat;
    thanh.classList.toggle('dang', !!dang);
    var pp = thanh.querySelector('.pp');
    pp.textContent = dang ? '❚❚' : '▶';
    pp.setAttribute('aria-label', dang ? chu.dung() : chu.phat());
  }
  function tao() {
    if (a) return a;
    a = new Audio(SRC);
    a.preload = 'auto';
    ['play', 'pause', 'ended'].forEach(function (e) { a.addEventListener(e, ve); });
    a.addEventListener('timeupdate', function () {
      var p = a.duration ? a.currentTime / a.duration : 0;
      thanh.style.setProperty('--p', (p * 100).toFixed(2) + '%');
    });
    return a;
  }
  function batTat() {
    tao(); daBat = true;
    if (a.paused) { var r = a.play(); if (r && r.catch) r.catch(function () { ve(); }); } else a.pause();
    ve();
  }
  nut.addEventListener('click', batTat);
  thanh.querySelector('.pp').addEventListener('click', batTat);
  thanh.querySelector('.x').addEventListener('click', function () {
    if (a) { a.pause(); a.currentTime = 0; }
    daBat = false; ve(); nut.focus();
  });
  function dungLai() { if (a && !a.paused) a.pause(); }
  window.addEventListener('bizon:mv-play', dungLai);
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-trailer]')) dungLai();
  }, true);
  document.addEventListener('play', function (e) { if (e.target !== a && e.target.tagName) dungLai(); }, true);
  window.addEventListener('pagehide', dungLai);
  ve();
})();
