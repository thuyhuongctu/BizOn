/* ============================================================================
   BizOn – khung «Lời bài hát» cho nhạc nền game Bật Nghiệp.
   Dùng chung cho game.html (gọi từ js/app.js) và BizOn Game 3D.html (game chạy
   trong iframe ẩn, khung lời vẽ ở trang 3D bên ngoài).
   Đọc lời ở window.BZ_LYRICS (js/music-lyrics.js), tên bài ở window.BZ_MUSIC
   (js/music-data.js, không bắt buộc). Khóa = tên tệp mp3 trong assets/audio/.

   BNLyrics.toggle({
     audio: () => HTMLAudioElement | null,   // nhạc nền đang dùng
     play:  id => void,                      // phát bài có lời (bật nhạc nếu đang tắt)
     en:    () => boolean                    // giao diện tiếng Anh? (mặc định đọc 'bizon-lang')
   })
   ========================================================================== */
(function () {
  'use strict';
  var box = null, opts = {}, timer = 0, shownKey = null;

  function en() {
    if (opts.en) { try { return !!opts.en(); } catch (e) {} }
    try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; }
  }
  function T(vi, e) { return en() ? e : vi; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function lyrics() { return window.BZ_LYRICS || {}; }

  function idOf(a) {
    if (!a || !a.src) return '';
    var m = /\/([^\/?#]+)\.mp3(?:[?#].*)?$/.exec(decodeURIComponent(a.src));
    return m ? m[1] : '';
  }
  function title(id) {
    var M = window.BZ_MUSIC;
    if (M && M.groups) for (var g = 0; g < M.groups.length; g++) {
      var tr = M.groups[g][3] || [];
      for (var i = 0; i < tr.length; i++) if (tr[i][2] === id) return en() ? (tr[i][3] || tr[i][0]) : tr[i][0];
    }
    return id.replace(/-/g, ' ');
  }
  function audio() { try { return opts.audio ? opts.audio() : null; } catch (e) { return null; } }

  // Quy ước dòng giống trang Kho Âm nhạc: [Tên đoạn] → nhãn, [ghi chú dài] → in nghiêng, '' → ngắt khổ
  function linesHtml(lines) {
    return lines.map(function (t) {
      var m = /^\[(.+)\]$/.exec(t);
      if (m && /^[\w\s\/—-]{1,26}$/.test(m[1])) return '<div class="bnl-sec">' + esc(m[1]) + '</div>';
      if (m) return '<div class="bnl-note">' + esc(m[1]) + '</div>';
      if (!t) return '<div class="bnl-gap"></div>';
      return '<div>' + esc(t) + '</div>';
    }).join('');
  }

  function css() {
    if (document.getElementById('bnl-css')) return;
    var s = document.createElement('style'); s.id = 'bnl-css';
    s.textContent =
      '#bnl{position:fixed;z-index:2147483000;right:12px;bottom:84px;width:min(380px,calc(100vw - 24px));max-height:min(72vh,560px);display:flex;flex-direction:column;' +
      'background:#12343b;color:#eaf6f6;border:3px solid #1f4d55;border-radius:22px;box-shadow:0 8px 0 #0b2328,0 18px 40px rgba(0,0,0,.35);font:500 15px/1.6 "Be Vietnam Pro","Baloo 2",system-ui,sans-serif}' +
      '#bnl .bnl-hd{display:flex;align-items:flex-start;gap:10px;padding:14px 14px 10px 16px;border-bottom:1px solid rgba(255,255,255,.1)}' +
      '#bnl .bnl-hd b{display:block;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#FDA127}' +
      '#bnl .bnl-now{font-weight:800;font-size:15px;line-height:1.35;color:#fff;margin-top:2px}' +
      '#bnl .bnl-x{margin-left:auto;flex:none;width:36px;height:36px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#fff;font-size:18px;cursor:pointer}' +
      '#bnl .bnl-bd{overflow-y:auto;padding:6px 16px 16px;overscroll-behavior:contain}' +
      '#bnl .bnl-sec{margin:14px 0 4px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7FD3DC}' +
      '#bnl .bnl-note{font-size:13px;font-style:italic;color:#9CC9C9}' +
      '#bnl .bnl-gap{height:10px}' +
      '#bnl .bnl-msg{margin:12px 0 8px;font-size:14px;color:#cfe7e7}' +
      '#bnl .bnl-pick{display:block;width:100%;text-align:left;margin:8px 0 0;padding:10px 12px;border-radius:14px;border:2px solid #2c6670;background:#1a454d;color:#fff;font:inherit;font-weight:700;font-size:14px;line-height:1.35;cursor:pointer}' +
      '#bnl .bnl-pick:hover{background:#21545d}' +
      '#bnl .bnl-pick small{display:block;font-weight:600;font-size:12px;color:#9CC9C9}' +
      '@media (max-width:520px){#bnl{right:8px;left:8px;width:auto;bottom:76px;max-height:62vh}}';
    document.head.appendChild(s);
  }

  function render(force) {
    if (!box) return;
    var a = audio(), id = idOf(a), playing = !!(a && !a.paused), L = lyrics();
    var key = id + '|' + playing + '|' + en();
    if (!force && key === shownKey) return;
    var keepScroll = shownKey && shownKey.split('|')[0] === id;
    shownKey = key;
    var now = box.querySelector('.bnl-now'), bd = box.querySelector('.bnl-bd'), top = bd.scrollTop;
    box.querySelector('.bnl-hd b').textContent = T('Lời bài hát', 'Lyrics');
    box.querySelector('.bnl-x').setAttribute('aria-label', T('Đóng lời bài hát', 'Close lyrics'));
    now.textContent = id ? (playing ? '♪ ' : '❚❚ ') + title(id) : T('Nhạc nền chưa phát', 'Background music is not playing');
    var html = '';
    if (id && L[id]) html = linesHtml(L[id]);
    else {
      html = '<p class="bnl-msg">' + (id ? T('Bài đang phát chưa có lời. Chọn một bài có lời để nghe:', 'This track has no lyrics yet. Pick a song with lyrics:')
        : T('Chọn một bài để vừa nghe vừa xem lời:', 'Pick a song to listen and read along:')) + '</p>';
      Object.keys(L).forEach(function (k) {
        html += '<button type="button" class="bnl-pick" data-id="' + esc(k) + '">▶ ' + esc(title(k)) + '<small>' + T('Phát và hiện lời', 'Play with lyrics') + '</small></button>';
      });
    }
    bd.innerHTML = html;
    bd.scrollTop = keepScroll ? top : 0;
  }

  function open(o) {
    opts = o || opts || {};
    css();
    if (!box) {
      box = document.createElement('section'); box.id = 'bnl';
      box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Lời bài hát');
      box.innerHTML = '<div class="bnl-hd"><div><b></b><div class="bnl-now" aria-live="polite"></div></div><button type="button" class="bnl-x">✕</button></div><div class="bnl-bd"></div>';
      box.querySelector('.bnl-x').onclick = close;
      box.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('.bnl-pick');
        if (b && opts.play) { opts.play(b.getAttribute('data-id')); setTimeout(function () { render(true); }, 150); }
      });
      document.body.appendChild(box);
    }
    box.hidden = false; shownKey = null; render(true);
    clearInterval(timer); timer = setInterval(render, 1000);   // bài tự chuyển khi hết – cập nhật lời theo
  }
  function close() { if (box) box.hidden = true; clearInterval(timer); timer = 0; }
  function isOpen() { return !!(box && !box.hidden); }
  function toggle(o) { if (isOpen()) close(); else open(o); }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(); });
  window.BNLyrics = { open: open, close: close, toggle: toggle, isOpen: isOpen, refresh: function () { render(true); } };
})();
