/* BizOn Bật Nghiệp 2026 – Hướng dẫn viên AI trên màn hình
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Nhân vật Lumina đứng cố định dưới màn hình, kèm khung lời dẫn có nút bật/tắt
 * giọng và nút dừng. Mỗi trang tự khai kịch bản của mình:
 *
 *   window.BIZON_TOUR = [
 *     { sel: '#gioi-thieu', vi: 'Câu tiếng Việt…', en: 'English line…' },
 *     …
 *   ];
 *
 * Trang nào không khai BIZON_TOUR thì tệp này không làm gì cả.
 * Tuỳ chọn: window.BIZON_TOUR_OPTS = { art, artWave, onStart }.
 *
 * Giọng đọc dùng SpeechSynthesis của trình duyệt, KHÔNG phải bản thu của tác giả.
 * Máy nào không có giọng tiếng Việt thì phần chữ vẫn chạy đủ, chỉ là không có
 * tiếng – nên bước chuyển tiếp luôn có đường lui bằng đồng hồ, không phụ thuộc
 * vào sự kiện 'end' của trình đọc.
 */
(function () {
  'use strict';
  if (window.BizonTour) return;

  var STYLE = [
    '.bztour-fab{width:36px;height:36px;border-radius:999px;border:0;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;font-size:15px;',
    'background:rgba(0,102,135,.09);color:#006687;transition:transform .12s ease}',
    '.bztour-fab:hover{transform:translateY(-1px)}',
    '.bztour-fab[aria-pressed="true"]{background:#e8762d;color:#fff}',
    'html[data-theme="dark"] .bztour-fab{background:rgba(255,255,255,.12);color:#8fd4ea}',

    '.bztour{position:fixed;left:0;right:0;bottom:0;z-index:80;display:none;',
    'align-items:flex-end;gap:.25rem;padding:0 12px 12px;pointer-events:none}',
    '.bztour.is-on{display:flex}',
    '.bztour__art{width:132px;height:auto;flex:none;order:2;align-self:flex-end;',
    'filter:drop-shadow(0 16px 18px rgba(0,0,0,.35));pointer-events:none;',
    'animation:bztour-in .3s ease}',
    '.bztour__box{order:1;flex:1 1 auto;min-width:0;max-width:520px;pointer-events:auto;',
    'background:#fff;color:#033337;border-radius:20px;padding:.85rem 1rem;margin-bottom:1.1rem;',
    'box-shadow:0 18px 40px -12px rgba(0,0,0,.45);animation:bztour-in .3s ease}',
    'html[data-theme="dark"] .bztour__box{background:#0e2a33;color:#d6ecf0}',
    '@keyframes bztour-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',

    '.bztour__head{display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem}',
    '.bztour__who{flex:1;min-width:0;font-size:9.5px;font-weight:800;letter-spacing:.12em;',
    'text-transform:uppercase;opacity:.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    /* flex:none – nếu để co giãn mặc định, trên khổ 360px nút "✕ Dừng" bị bóp
       còn 8px và mất chữ, vì hai nút đều white-space:nowrap. */
    '.bztour__ico{flex:none;border:0;background:none;cursor:pointer;font-size:10px;font-weight:800;',
    'letter-spacing:.06em;color:inherit;opacity:.65;padding:2px 4px;white-space:nowrap}',
    '.bztour__ico:hover{opacity:1}',
    '.bztour__ico[aria-pressed="false"]{text-decoration:line-through}',
    '.bztour__txt{font-size:13px;line-height:1.5;margin:0}',
    '.bztour__foot{display:flex;align-items:center;gap:.5rem;margin-top:.6rem}',
    '.bztour__bar{flex:1;height:4px;border-radius:999px;background:rgba(0,102,135,.15);overflow:hidden}',
    'html[data-theme="dark"] .bztour__bar{background:rgba(255,255,255,.15)}',
    '.bztour__bar i{display:block;height:100%;background:#e8762d;border-radius:999px;',
    'transition:width .35s ease}',
    '.bztour__next{border:0;border-radius:999px;background:#e8762d;color:#fff;cursor:pointer;',
    'font-size:11px;font-weight:800;padding:.4rem .85rem;white-space:nowrap}',
    '.bztour__step{font-size:10px;font-weight:700;opacity:.5;white-space:nowrap}',

    /* Viền chỉ chỗ đang nói tới. Để mảnh và nhạt: đây là dấu chỉ đường, không
       phải nút bấm, viền dày đọc như lỗi giao diện. */
    '.bztour-spot{outline:2px solid rgba(232,118,45,.55);outline-offset:6px;',
    'border-radius:24px;transition:outline-color .3s ease}',

    '@media (max-width:520px){',
    '.bztour__art{width:96px}',
    '.bztour__box{margin-bottom:.6rem;padding:.7rem .8rem;border-radius:16px}',
    '.bztour__txt{font-size:12px}}',

    '@media (prefers-reduced-motion:reduce){',
    '.bztour__art,.bztour__box{animation:none}',
    '.bztour__bar i{transition:none}}'
  ].join('');

  var T = {
    vi: {
      who: 'Hương AI · Tour tham quan',
      voiceOn: '🔊 Giọng', voiceOff: '🔇 Giọng',
      stop: '✕ Dừng', next: '▶ Tiếp', done: '🏁 Xong',
      launch: 'Hương AI dẫn tham quan trang',
      greet: 'Xin chào! Mình là Hương – hướng dẫn viên AI của BizOn Bật Nghiệp. Để mình dẫn bạn đi một vòng nhé.'
    },
    en: {
      who: 'Huong AI · Guided tour',
      voiceOn: '🔊 Voice', voiceOff: '🔇 Voice',
      stop: '✕ Stop', next: '▶ Next', done: '🏁 Done',
      launch: 'Huong AI guided tour of this page',
      greet: "Hello! I'm Huong, the AI guide for BizOn Bật Nghiệp. Let me walk you through this page."
    }
  };

  function lang() {
    try { return localStorage.getItem('bizon-lang') === 'en' ? 'en' : 'vi'; } catch (e) { return 'vi'; }
  }
  function voiceWanted() {
    try { return localStorage.getItem('bizon-tour-voice') !== 'off'; } catch (e) { return true; }
  }
  function setVoiceWanted(on) {
    try { localStorage.setItem('bizon-tour-voice', on ? 'on' : 'off'); } catch (e) {}
  }
  function reduceMotion() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  var steps = [], opts = {}, idx = -1, running = false, timer = null;
  var el = {}, spotted = null;

  function build() {
    var st = document.createElement('style');
    st.textContent = STYLE;
    document.head.appendChild(st);

    var art = opts.art || 'assets/character/advisors/lumina-aodai-cut.webp';
    var wrap = document.createElement('div');
    wrap.className = 'bztour';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.innerHTML =
      '<div class="bztour__box">' +
        '<div class="bztour__head">' +
          '<span class="bztour__who"></span>' +
          '<button type="button" class="bztour__ico" data-act="voice" aria-pressed="true"></button>' +
          '<button type="button" class="bztour__ico" data-act="stop"></button>' +
        '</div>' +
        '<p class="bztour__txt"></p>' +
        '<div class="bztour__foot">' +
          '<span class="bztour__step"></span>' +
          '<span class="bztour__bar"><i style="width:0"></i></span>' +
          '<button type="button" class="bztour__next" data-act="next"></button>' +
        '</div>' +
      '</div>' +
      '<img class="bztour__art" alt="" aria-hidden="true" decoding="async">';
    document.body.appendChild(wrap);

    el.wrap = wrap;
    el.who = wrap.querySelector('.bztour__who');
    el.txt = wrap.querySelector('.bztour__txt');
    el.step = wrap.querySelector('.bztour__step');
    el.fill = wrap.querySelector('.bztour__bar i');
    el.next = wrap.querySelector('[data-act="next"]');
    el.voice = wrap.querySelector('[data-act="voice"]');
    el.img = wrap.querySelector('.bztour__art');
    el.img.src = art;
    el.stop = wrap.querySelector('[data-act="stop"]');

    el.next.addEventListener('click', function () { go(idx + 1); });
    el.stop.addEventListener('click', stop);
    el.voice.addEventListener('click', function () {
      var on = !voiceWanted();
      setVoiceWanted(on);
      syncLabels();
      if (!on) cancelSpeech();
      else if (running && idx >= 0) speak(textOf(steps[idx]));
    });
  }

  function syncLabels() {
    var L = T[lang()], on = voiceWanted();
    el.who.textContent = L.who;
    el.stop.textContent = L.stop;
    el.voice.textContent = on ? L.voiceOn : L.voiceOff;
    el.voice.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function textOf(s) { return s[lang()] || s.vi || s.en || ''; }

  function cancelSpeech() {
    try { speechSynthesis.cancel(); } catch (e) {}
  }

  /* Đọc câu hiện tại. Trả về true nếu trình duyệt nhận lời đọc – khi đó bước
     kế tiếp do sự kiện 'end' kích hoạt; ngược lại phía gọi tự hẹn giờ. */
  function speak(text, onDone) {
    if (!voiceWanted() || !('speechSynthesis' in window)) return false;
    try {
      cancelSpeech();
      var L = lang();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = L === 'en' ? 'en-US' : 'vi-VN';
      u.rate = 1.02;
      var want = L === 'en' ? 'en' : 'vi';
      var v = (speechSynthesis.getVoices() || []).filter(function (x) {
        return x.lang && x.lang.toLowerCase().indexOf(want) === 0;
      })[0];
      if (v) u.voice = v;
      if (onDone) { u.onend = onDone; u.onerror = onDone; }
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function unspot() {
    if (spotted) { spotted.classList.remove('bztour-spot'); spotted = null; }
  }

  function go(i) {
    if (!running) return;
    clearTimeout(timer);
    if (i >= steps.length) { stop(); return; }
    idx = i;
    var s = steps[i], L = T[lang()], text = textOf(s);

    unspot();
    var target = s.sel && document.querySelector(s.sel);
    if (target) {
      target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
      target.classList.add('bztour-spot');
      spotted = target;
    }
    if (s.art) el.img.src = s.art;

    el.txt.textContent = text;
    el.step.textContent = (i + 1) + '/' + steps.length;
    el.fill.style.width = Math.round((i + 1) / steps.length * 100) + '%';
    el.next.textContent = i === steps.length - 1 ? L.done : L.next;

    // Tự chuyển bước. Luôn giữ mỗi bước tối thiểu bằng thời gian đọc chữ
    // (~15 ký tự/giây, không dưới 4,5 giây) rồi mới sang bước sau.
    //
    // Không thể chỉ dựa vào sự kiện 'end' của trình đọc: máy nào không cài
    // giọng tiếng Việt thì 'error' bắn về gần như tức thì, và cả tour sẽ chạy
    // vụt qua trong vài giây. Vì vậy sự kiện đọc xong chỉ được rút ngắn phần
    // chờ còn lại chứ không được bỏ qua mức tối thiểu.
    var minMs = Math.max(4500, text.length / 15 * 1000);
    var t0 = performance.now(), advanced = false;
    var nextStep = function () {
      if (advanced) return;
      advanced = true;
      var left = Math.max(700, minMs - (performance.now() - t0));
      timer = setTimeout(function () { go(idx + 1); }, left);
    };
    if (!speak(text, nextStep)) timer = setTimeout(nextStep, minMs);
  }

  function start() {
    if (running) { stop(); return; }
    if (!steps.length) return;
    running = true;
    syncLabels();
    // Tour mở từ dock; để dock mở tiếp thì nó che mất nội dung đang được giới thiệu.
    var dk = document.getElementById('bz-dock');
    if (dk) dk.classList.remove('open');
    el.wrap.classList.add('is-on');
    if (el.launch) el.launch.setAttribute('aria-pressed', 'true');
    if (opts.artWave) el.img.src = opts.artWave;
    if (typeof opts.onStart === 'function') { try { opts.onStart(); } catch (e) {} }
    go(0);
  }

  function stop() {
    running = false;
    idx = -1;
    clearTimeout(timer);
    cancelSpeech();
    unspot();
    el.wrap.classList.remove('is-on');
    if (el.launch) el.launch.setAttribute('aria-pressed', 'false');
  }

  function addLauncher() {
    // Nút mở tour nằm trong dock tiện ích (js/site-dock.js) – cùng một khay với
    // nhạc nền, đúng như bố cục "Audio & guided tour" của trang mẫu. Cố ý KHÔNG
    // chèn vào thanh đầu trang: thêm nút thứ tư ở đó làm tiêu đề "BizOn Bật
    // Nghiệp" xuống dòng trên màn hình dưới 430px.
    var L = T[lang()];
    var b = document.getElementById('bz-tour');
    if (!b) {
      // Trang không nạp dock: thả nút nổi, nhích lên trên nút dock cho khỏi đè.
      b = document.createElement('button');
      b.type = 'button';
      b.className = 'bztour-fab';
      b.textContent = '🎧';
      b.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:75;width:46px;height:46px;' +
        'font-size:18px;box-shadow:0 10px 24px -8px rgba(0,0,0,.5)';
      document.body.appendChild(b);
    }
    b.id = 'tour-btn';
    b.title = L.launch;
    b.setAttribute('aria-label', L.launch);
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function (e) { e.stopPropagation(); start(); });
    el.launch = b;
  }

  function init() {
    steps = (window.BIZON_TOUR || []).filter(function (s) {
      return s && (s.vi || s.en) && (!s.sel || document.querySelector(s.sel));
    });
    if (!steps.length) return;
    opts = window.BIZON_TOUR_OPTS || {};
    build();
    addLauncher();
    // Nút đổi ngôn ngữ không phát sự kiện riêng, nên bám vào chính nó để dịch
    // lại nhãn ngay khi người dùng bấm.
    var lb = document.getElementById('lang-btn');
    if (lb) lb.addEventListener('click', function () {
      setTimeout(function () {
        var L2 = T[lang()];
        el.launch.title = L2.launch;
        el.launch.setAttribute('aria-label', L2.launch);
        if (running) {
          syncLabels();
          go(Math.max(0, idx));
        }
      }, 0);
    });
  }

  window.BizonTour = { start: start, stop: stop, init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
