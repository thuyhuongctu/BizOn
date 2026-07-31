/* BizOn – Dock tiện ích toàn site (theo mẫu trang M-AIDA)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Nút ⋯ nổi góc trái dưới, mở panel: nhạc nền BizOn Theme, chế độ
 * Sáng/Tối, song ngữ VI/EN, đồng hồ thế giới Việt Nam – Pháp và hàng
 * chia sẻ. Tự gắn vào mọi trang; trang nào thiếu toggleTheme/toggleLang
 * thì dock tự dùng cơ chế dự phòng hoặc ẩn nút tương ứng. */
(function () {
  var IS_GAME = /game\.html$/.test(location.pathname); // game có hệ nhạc riêng
  var SITE_URL = 'https://thuyhuongctu.github.io/BizOn/';
  /* Playlist toàn bộ ca khúc gốc – phát nối tiếp đến hết rồi tự lặp lại từ đầu.
   * Tên bài theo đúng Kho Âm nhạc (am-nhac.html) – nguồn chuẩn của hệ sinh thái. */
  var PLAYLIST = [
    ['Hương on Return ⭐ (bài hát chính)', 'huong-on-return.mp3'],
    ['Hương on Return – remix (remastered)', 'huong-on-return-remix.mp3'],
    ['Bật Nghiệp (instrumental · V-pop 112 BPM)', 'bat-nghiep.mp3'],
    ['BizOn Theme (instrumental)', 'bizon-theme.mp3'],
    ['Vừa Đủ Để Bay Cao', 'vua-du-de-bay-cao.mp3'],
    ['Journey on the Golden Silt', 'journey-golden-silt.mp3'],
    ['Journey on the Golden Silt – remix', 'journey-golden-silt-remix.mp3'],
    ['Journey on the Golden Silt – remix «Mekong River»', 'mekong-river-remix.mp3'],
    ['«Mekong River» – bản thu lại', 'mekong-river-v2.mp3'],
    ["Je m'appelle Hương sans frontières (tiếng Việt)", 'huong-and-the-world.mp3'],
    ["Je m'appelle Hương sans frontières (tiếng Anh)", 'huong-and-the-world-en.mp3'],
    ["Je m'appelle Hương sans frontières (giọng nam)", 'huong-and-the-world-male.mp3'],
    ['Hương et le Monde (tiếng Pháp)', 'huong-et-le-monde.mp3'],
    ['Mon histoire', 'mon-histoire.mp3'],
    ['And The World Say Hello!', 'and-the-world-say-hello.mp3'],
    ['Mekong Compass', 'mekong-compass.mp3'],
    ['Đội Phù Sa', 'doi-phu-sa.mp3'],
    ['Đội Phù Sa (remix)', 'doi-phu-sa-remix.mp3'],
    ['Đội Phù Sa (remix 2)', 'doi-phu-sa-remix2.mp3'],
    ['Brand Passport ⭐ (nhạc chủ đề Hộ Chiếu Thương Hiệu)', 'brand-passport.mp3'],
    ['Brand Passport – bản phối', 'brand-passport-v2.mp3'],
    ['Brand Passport – bản remix', 'brand-passport-remix.mp3'],
    ['Stamps Beyond Borders', 'stamps-beyond-borders.mp3'],
    ['Stamps Beyond Borders – bản thu lại', 'stamps-beyond-borders-v2.mp3'],
    ['Stamps Beyond Borders – bản phối 3:35', 'stamps-beyond-borders-v3.mp3'],
    ['Stamps Beyond Borders – bản mở rộng', 'stamps-beyond-borders-extended.mp3'],
    ['Golden Silt Route', 'golden-silt-route.mp3'],
    ['Hộ Chiếu Thương Hiệu – Phần I: Từ dòng Mekong', 'ho-chieu-p1-tu-dong-mekong.mp3'],
    ['Hộ Chiếu Thương Hiệu – Phần II: Qua Những Thị Trường', 'ho-chieu-p2-qua-nhung-thi-truong.mp3'],
    ['Hộ Chiếu Thương Hiệu – Phần III: Việt Nam ra thế giới', 'ho-chieu-p3-viet-nam-ra-the-gioi.mp3'],
    ['Hộ Chiếu Thương Hiệu – Phần III (remix)', 'ho-chieu-p3-remix.mp3'],
    ['Hộ Chiếu Thương Hiệu – Phần III (remix 2)', 'ho-chieu-p3-remix2.mp3'],
    ['Hộ Chiếu Thương Hiệu – Phần III: Vietnam to the World (tiếng Anh)', 'ho-chieu-p3-vietnam-to-the-world-en.mp3'],
  ];

  /* ---------- CSS ---------- */
  var css = document.createElement('style');
  css.textContent =
    '#bz-dock-btn{position:fixed;left:16px;bottom:16px;z-index:70;width:46px;height:46px;border-radius:9999px;border:none;cursor:pointer;' +
      'background:#fff;color:#033337;font-size:20px;font-weight:800;box-shadow:0 8px 24px -6px rgba(0,102,135,.4), inset 0 -3px 0 rgba(0,0,0,.08);transition:transform .12s}' +
    '#bz-dock-btn:active{transform:scale(.94)}' +
    '#bz-dock{position:fixed;left:14px;bottom:70px;z-index:70;width:min(88vw,320px);background:#fff;color:#033337;border-radius:22px;' +
      'box-shadow:0 18px 44px -10px rgba(0,60,80,.35), inset 0 -4px 0 rgba(0,0,0,.05);padding:16px;display:none;font-family:Manrope,\'Plus Jakarta Sans\',sans-serif}' +
    '#bz-dock.open{display:block}' +
    '#bz-dock .bz-cap{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;opacity:.55;margin:2px 0 8px}' +
    '#bz-dock .bz-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
    '#bz-dock .bz-chip{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:9999px;border:2px solid rgba(0,102,135,.18);' +
      'background:transparent;cursor:pointer;font-size:17px;color:inherit;transition:border-color .12s}' +
    '#bz-dock .bz-chip.on{border-color:#006687;background:rgba(0,102,135,.08)}' +
    '#bz-dock .bz-clock{display:flex;align-items:center;gap:10px;border:2px solid rgba(0,102,135,.14);border-radius:16px;padding:8px 12px;margin-top:8px}' +
    '#bz-dock .bz-clock b{font-size:19px;font-family:\'Plus Jakarta Sans\',Manrope,sans-serif}' +
    '#bz-dock .bz-clock small{font-size:10px;font-weight:800;letter-spacing:.08em;opacity:.55;display:block;text-transform:uppercase}' +
    '#bz-dock .bz-clock span.bz-sub{font-size:11px;font-weight:700;opacity:.5;margin-left:auto}' +
    '#bz-dock hr{border:none;border-top:1px solid rgba(0,102,135,.12);margin:13px 0}' +
    '#bz-dock a.bz-chip{text-decoration:none}' +
    'html[data-theme="dark"] #bz-dock,html[data-theme="dark"] #bz-dock-btn{background:#0e2a33;color:#d6ecf0;box-shadow:0 18px 44px -10px rgba(0,0,0,.6), inset 0 -4px 0 rgba(0,0,0,.3)}' +
    'html[data-theme="dark"] #bz-dock .bz-chip{border-color:rgba(92,196,230,.25)}' +
    'html[data-theme="dark"] #bz-dock .bz-chip.on{border-color:#5cc4e6;background:rgba(92,196,230,.12)}' +
    'html[data-theme="dark"] #bz-dock .bz-clock{border-color:rgba(92,196,230,.2)}' +
    '@media print{#bz-dock,#bz-dock-btn{display:none !important}}';
  document.head.appendChild(css);

  /* ---------- Khung ---------- */
  var btn = document.createElement('button');
  btn.id = 'bz-dock-btn';
  btn.textContent = '⋯';
  btn.title = 'Tiện ích: nhạc · sáng/tối · VI/EN · đồng hồ · chia sẻ';
  btn.setAttribute('aria-label', 'Mở bảng tiện ích BizOn');

  var dock = document.createElement('div');
  dock.id = 'bz-dock';
  var shareText = encodeURIComponent('BizOn Bật Nghiệp – trò chơi mô phỏng kinh doanh 3D cho đào tạo khởi nghiệp');
  var pageUrl = encodeURIComponent(SITE_URL);
  dock.innerHTML =
    '<p class="bz-cap">🎛️ Tiện ích · Quick controls</p>' +
    '<div class="bz-row">' +
      (IS_GAME ? '' : '<button class="bz-chip" id="bz-music" title="Phát/dừng playlist nhạc gốc BizOn (tự lặp lại)">🎵</button>' +
        '<button class="bz-chip" id="bz-next" title="Bài kế tiếp">⏭️</button>') +
      '<button class="bz-chip" id="bz-theme" title="Sáng / Tối · Light / Dark">🌙</button>' +
      '<button class="bz-chip" id="bz-lang" title="Tiếng Việt / English" style="width:auto;padding:0 14px;font-size:12px;font-weight:800">EN</button>' +
    '</div>' +
    (IS_GAME ? '' : '<p id="bz-track" style="font-size:11px;font-weight:700;opacity:.55;margin:8px 2px 0;display:none">🎶</p>') +
    '<hr>' +
    '<p class="bz-cap">🌏 Đồng hồ thế giới · World clocks</p>' +
    '<div class="bz-clock">🇻🇳<span><small>Việt Nam</small><b id="bz-t-vn">--:--</b></span><span class="bz-sub" id="bz-d-vn"></span></div>' +
    '<div class="bz-clock">🇫🇷<span><small>Pháp · France</small><b id="bz-t-fr">--:--</b></span><span class="bz-sub" id="bz-d-fr"></span></div>' +
    '<hr>' +
    '<p class="bz-cap">📣 Chia sẻ · Share</p>' +
    '<div class="bz-row">' +
      '<a class="bz-chip" href="https://github.com/thuyhuongctu/BizOn" target="_blank" rel="noopener" title="GitHub">🐙</a>' +
      '<a class="bz-chip" href="https://www.facebook.com/sharer/sharer.php?u=' + pageUrl + '" target="_blank" rel="noopener" title="Facebook">📘</a>' +
      '<a class="bz-chip" href="https://twitter.com/intent/tweet?text=' + shareText + '&url=' + pageUrl + '" target="_blank" rel="noopener" title="X">🐦</a>' +
      '<a class="bz-chip" href="mailto:?subject=' + shareText + '&body=' + pageUrl + '" title="Email">✉️</a>' +
      '<button class="bz-chip" id="bz-copy" title="Sao chép liên kết trang này">🔗</button>' +
    '</div>';

  function mount() {
    document.body.appendChild(btn);
    document.body.appendChild(dock);

    btn.addEventListener('click', function () {
      dock.classList.toggle('open');
      if (dock.classList.contains('open')) tick();
    });
    document.addEventListener('click', function (e) {
      if (!dock.contains(e.target) && e.target !== btn) dock.classList.remove('open');
    });

    /* Đồng hồ VN + Pháp (Paris tự theo giờ mùa hè nhờ Intl) */
    function fmt(tz) {
      try {
        var t = new Intl.DateTimeFormat('vi-VN', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
        var d = new Intl.DateTimeFormat('vi-VN', { timeZone: tz, day: '2-digit', month: '2-digit' }).format(new Date());
        var off = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date())
          .find(function (p) { return p.type === 'timeZoneName'; });
        return { t: t, d: d + (off ? ' · ' + off.value.replace('GMT', 'GMT') : '') };
      } catch (e) { return { t: '--:--', d: '' }; }
    }
    function tick() {
      var vn = fmt('Asia/Ho_Chi_Minh'), fr = fmt('Europe/Paris');
      var el;
      (el = document.getElementById('bz-t-vn')) && (el.textContent = vn.t);
      (el = document.getElementById('bz-d-vn')) && (el.textContent = vn.d);
      (el = document.getElementById('bz-t-fr')) && (el.textContent = fr.t);
      (el = document.getElementById('bz-d-fr')) && (el.textContent = fr.d);
    }
    tick();
    setInterval(tick, 20000);

    /* Nhạc nền – playlist nối tiếp toàn bộ ca khúc, hết danh sách tự quay lại
     * từ đầu; chỉ phát khi người dùng bấm (đúng chính sách autoplay) */
    var audio = null, trackIdx = 0;
    /* scope = tuyển tập riêng của một game (mảng chỉ số trong PLAYLIST).
     * null = nghe trọn kho. Nhờ vậy mỗi game có nhạc nền riêng mà vẫn dùng
     * chung một trình phát duy nhất. */
    var scope = null, scopeName = '';
    function list() { return scope || PLAYLIST.map(function (_, i) { return i; }); }
    var musicBtn = document.getElementById('bz-music');
    var nextBtn = document.getElementById('bz-next');
    var trackEl = document.getElementById('bz-track');
    function showTrack() {
      if (!trackEl) return;
      var L = list(), pos = L.indexOf(trackIdx) + 1;
      trackEl.style.display = 'block';
      trackEl.textContent = '🎶 ' + pos + '/' + L.length + ' · ' + PLAYLIST[trackIdx][0] + (scopeName ? ' · ' + scopeName : '');
    }
    function playTrack(i) {
      var L = list();
      trackIdx = L[((i % L.length) + L.length) % L.length];
      if (!audio) {
        audio = new Audio();
        audio.volume = 0.55;
        audio.addEventListener('ended', next);   // hết bài → bài kế; hết danh sách → vòng lại
        audio.addEventListener('error', function () { if (!audio.paused) next(); }); // bài lỗi mạng → bỏ qua
      }
      audio.src = 'assets/audio/' + PLAYLIST[trackIdx][1];
      audio.play().catch(function () {});
      musicBtn.classList.add('on');
      musicBtn.title = 'Tắt nhạc';
      showTrack();
    }
    function next() { playTrack(list().indexOf(trackIdx) + 1); }
    if (musicBtn) {
      musicBtn.addEventListener('click', function () {
        if (!audio || audio.paused) {
          if (audio && audio.src) { audio.play().catch(function () {}); musicBtn.classList.add('on'); showTrack(); }
          else playTrack(list().indexOf(trackIdx));
        } else {
          audio.pause();
          musicBtn.classList.remove('on');
          musicBtn.title = 'Phát playlist nhạc gốc BizOn (tự lặp lại)';
        }
      });
      nextBtn.addEventListener('click', next);
    }

    /* API cho các trang game gọi: phát đúng bài chủ đề bằng CHÍNH trình phát
     * của dock – tránh hai nguồn nhạc chồng nhau, UI dock cũng đồng bộ theo. */
    window.BizonDock = {
      play: function (file) {
        var i = PLAYLIST.findIndex(function (t) { return t[1] === file; });
        if (i < 0) return false;
        playTrack(i);
        return true;
      },
      pause: function () {
        if (audio && !audio.paused) { audio.pause(); if (musicBtn) musicBtn.classList.remove('on'); }
      },
      isPlaying: function () { return !!(audio && !audio.paused); },
      /* Thu hẹp playlist về tuyển tập riêng của một game.
       * files: mảng tên tệp mp3 (bỏ qua tên không có trong kho).
       * Gọi scope(null) để nghe lại trọn kho. */
      scope: function (files, name) {
        if (!files) { scope = null; scopeName = ''; return PLAYLIST.length; }
        var idx = [];
        files.forEach(function (f) {
          var i = PLAYLIST.findIndex(function (t) { return t[1] === f; });
          if (i >= 0 && idx.indexOf(i) < 0) idx.push(i);
        });
        if (!idx.length) return 0;
        scope = idx; scopeName = name || '';
        if (idx.indexOf(trackIdx) < 0) trackIdx = idx[0];
        return idx.length;
      },
    };

    /* Sáng / Tối – dùng toggleTheme của site-ui, thiếu thì tự lo */
    var themeBtn = document.getElementById('bz-theme');
    function syncTheme() { themeBtn.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙'; }
    themeBtn.addEventListener('click', function () {
      if (typeof window.toggleTheme === 'function') window.toggleTheme();
      else {
        var el = document.documentElement, dark = el.dataset.theme === 'dark';
        if (dark) delete el.dataset.theme; else el.dataset.theme = 'dark';
        try { localStorage.setItem('bizon-theme', dark ? 'light' : 'dark'); } catch (e) {}
      }
      syncTheme();
    });
    syncTheme();

    /* VI / EN – dùng cơ chế của từng trang; trang không hỗ trợ thì ẩn */
    var langBtn = document.getElementById('bz-lang');
    if (typeof window.toggleLang !== 'function') { langBtn.style.display = 'none'; }
    else {
      function syncLang() {
        var en = 'vi';
        try { en = localStorage.getItem('bizon-lang') || 'vi'; } catch (e) {}
        langBtn.textContent = en === 'en' ? 'VI' : 'EN';
      }
      langBtn.addEventListener('click', function () { window.toggleLang(); setTimeout(syncLang, 60); });
      syncLang();
    }

    /* Sao chép liên kết trang hiện tại */
    var copyBtn = document.getElementById('bz-copy');
    copyBtn.addEventListener('click', function () {
      var url = location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
        function () { copyBtn.textContent = '✅'; setTimeout(function () { copyBtn.textContent = '🔗'; }, 1500); },
        function () { prompt('Sao chép liên kết:', url); }
      );
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
