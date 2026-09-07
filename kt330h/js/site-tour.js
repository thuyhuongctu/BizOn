/* BizOn Classroom KT330H — Lumina AI, hướng dẫn viên trên màn hình
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 * Cùng mã nguồn với bizon-classroom_kt330h-kt338/js/site-tour.js, chỉnh
 * lang() để đọc localStorage theo định dạng persist của zustand (app này
 * dùng useLangStore, không phải chuỗi phẳng như trang tĩnh SV).
 *
 * Giọng đọc dùng SpeechSynthesis của trình duyệt — KHÔNG phải bản thu sẵn.
 * Máy nào không có giọng phù hợp thì phần chữ vẫn chạy đủ; bước chuyển tiếp
 * luôn có đồng hồ dự phòng, không phụ thuộc vào sự kiện 'end' của trình đọc.
 */
(function () {
  'use strict';
  if (window.BizonTour) return;

  var STYLE = [
    '.bztour-fab{width:52px;height:52px;border-radius:999px;border:2px solid var(--color-card);cursor:pointer;',
    'position:fixed;left:16px;bottom:96px;z-index:75;padding:0;overflow:hidden;',
    'display:inline-flex;align-items:center;justify-content:center;',
    'background:var(--color-primary);color:var(--color-primary-foreground);',
    'box-shadow:0 10px 24px -8px rgba(0,0,0,.5);transition:transform .12s ease}',
    '.bztour-fab:hover{transform:translateY(-1px)}',
    '.bztour-fab[aria-pressed="true"]{border-color:var(--color-terracotta)}',
    '.bztour-fab img{width:100%;height:100%;object-fit:cover;object-position:50% 2%}',

    '.bztour{position:fixed;left:0;right:0;bottom:0;z-index:80;display:none;',
    'align-items:flex-end;gap:.25rem;padding:0 12px 92px;pointer-events:none}',
    '@media (min-width:768px){.bztour{left:16.5rem;padding-bottom:12px}}',
    '.bztour.is-on{display:flex}',
    '.bztour__art{width:132px;height:auto;flex:none;order:2;align-self:flex-end;',
    'filter:drop-shadow(0 16px 18px rgba(0,0,0,.35));pointer-events:none;',
    'animation:bztour-in .3s ease}',
    '.bztour__box{order:1;flex:1 1 auto;min-width:0;max-width:520px;pointer-events:auto;',
    'background:var(--color-card);color:var(--color-ink);border-radius:20px;padding:.85rem 1rem;margin-bottom:1.1rem;',
    'box-shadow:0 18px 40px -12px rgba(0,0,0,.45);animation:bztour-in .3s ease;',
    'border:1px solid var(--color-border)}',
    '@keyframes bztour-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',

    '.bztour__head{display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem}',
    '.bztour__who{flex:1;min-width:0;font-size:9.5px;font-weight:800;letter-spacing:.12em;',
    'text-transform:uppercase;opacity:.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bztour__ico{flex:none;border:0;background:none;cursor:pointer;font-size:10px;font-weight:800;',
    'letter-spacing:.06em;color:inherit;opacity:.65;padding:2px 4px;white-space:nowrap}',
    '.bztour__ico:hover{opacity:1}',
    '.bztour__ico[aria-pressed="false"]{text-decoration:line-through}',
    '.bztour__txt{font-size:13px;line-height:1.5;margin:0}',
    '.bztour__foot{display:flex;align-items:center;gap:.5rem;margin-top:.6rem}',
    '.bztour__bar{flex:1;height:4px;border-radius:999px;background:var(--color-border);overflow:hidden}',
    '.bztour__bar i{display:block;height:100%;background:var(--color-terracotta);border-radius:999px;',
    'transition:width .35s ease}',
    '.bztour__next{border:0;border-radius:999px;background:var(--color-terracotta);color:#fff;cursor:pointer;',
    'font-size:11px;font-weight:800;padding:.4rem .85rem;white-space:nowrap}',
    '.bztour__step{font-size:10px;font-weight:700;opacity:.5;white-space:nowrap}',

    '.bztour-spot{outline:2px solid var(--color-terracotta);outline-offset:6px;',
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
      who: 'Lumina AI · Tour tham quan',
      voiceOn: '🔊 Giọng', voiceOff: '🔇 Giọng',
      stop: '✕ Dừng', next: '▶ Tiếp', done: '🏁 Xong',
      launch: 'Lumina AI dẫn tham quan trang'
    },
    en: {
      who: 'Lumina AI · Guided tour',
      voiceOn: '🔊 Voice', voiceOff: '🔇 Voice',
      stop: '✕ Stop', next: '▶ Next', done: '🏁 Done',
      launch: 'Lumina AI guided tour of this page'
    }
  };

  function lang() {
    try {
      var raw = localStorage.getItem('bizon-kt330h-lang');
      if (!raw) return 'vi';
      var parsed = JSON.parse(raw);
      return parsed && parsed.state && parsed.state.lang === 'en' ? 'en' : 'vi';
    } catch (e) { return 'vi'; }
  }
  function voiceWanted() {
    try { return localStorage.getItem('bizon-kt330h-tour-voice') !== 'off'; } catch (e) { return true; }
  }
  function setVoiceWanted(on) {
    try { localStorage.setItem('bizon-kt330h-tour-voice', on ? 'on' : 'off'); } catch (e) {}
  }
  function reduceMotion() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  var steps = [], opts = {}, idx = -1, running = false, timer = null;
  var el = {}, spotted = null;

  function luminaArt() { return opts.art || 'characters/lumina-ao-dai-wave.webp'; }

  function build() {
    var st = document.createElement('style');
    st.textContent = STYLE;
    document.head.appendChild(st);

    var art = luminaArt();
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

  /* Nếu sau này có file thu sẵn (audio/{lang}/{key}.mp3), thử phát trước;
     lỗi tải (chưa có file) thì rơi xuống SpeechSynthesis ngay lập tức. */
  function speak(text, onDone, key) {
    if (!voiceWanted()) return false;
    if (key) {
      try {
        var a = new Audio('audio/' + lang() + '/' + key + '.mp3');
        var used = false;
        a.addEventListener('canplaythrough', function () {
          if (used) return;
          used = true;
          if (onDone) a.addEventListener('ended', onDone, { once: true });
          a.play().catch(function () {});
        }, { once: true });
        a.addEventListener('error', function () {
          if (used) return;
          used = true;
          speakTTS(text, onDone);
        }, { once: true });
        a.load();
        return true;
      } catch (e) { /* fall through to TTS */ }
    }
    return speakTTS(text, onDone);
  }

  function speakTTS(text, onDone) {
    if (!('speechSynthesis' in window)) return false;
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

    var minMs = Math.max(4500, text.length / 15 * 1000);
    var t0 = performance.now(), advanced = false;
    var nextStep = function () {
      if (advanced) return;
      advanced = true;
      var left = Math.max(700, minMs - (performance.now() - t0));
      timer = setTimeout(function () { go(idx + 1); }, left);
    };
    if (!speak(text, nextStep, s.key)) timer = setTimeout(nextStep, minMs);
  }

  function start() {
    if (running) { stop(); return; }
    if (!steps.length) return;
    running = true;
    syncLabels();
    el.wrap.classList.add('is-on');
    if (el.launch) el.launch.setAttribute('aria-pressed', 'true');
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
    var L = T[lang()];
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bztour-fab';
    var portrait = document.createElement('img');
    portrait.src = luminaArt();
    portrait.alt = '';
    portrait.setAttribute('aria-hidden', 'true');
    b.appendChild(portrait);
    document.body.appendChild(b);
    b.id = 'tour-btn';
    b.title = L.launch;
    b.setAttribute('aria-label', L.launch);
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function (e) { e.stopPropagation(); start(); });
    el.launch = b;
  }

  function refreshLang() {
    if (!el.launch) return;
    var L = T[lang()];
    el.launch.title = L.launch;
    el.launch.setAttribute('aria-label', L.launch);
    if (running) { syncLabels(); go(Math.max(0, idx)); }
  }

  function init(config, config_opts) {
    steps = (config || window.BIZON_TOUR || []).filter(function (s) {
      return s && (s.vi || s.en) && (!s.sel || document.querySelector(s.sel));
    });
    if (!steps.length) return;
    opts = config_opts || window.BIZON_TOUR_OPTS || {};
    build();
    addLauncher();
  }

  window.BizonTour = { start: start, stop: stop, init: init, refreshLang: refreshLang };
})();
