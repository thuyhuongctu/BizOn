/* ===========================================================================
   BizOn ACADEMIA 3D — mô-típ âm thanh cho các cổng sản phẩm
   ---------------------------------------------------------------------------
   Mỗi cổng có một câu nhạc 2,2 giây cắt từ chính ca khúc của màn đó. Rê chuột
   lên thẻ thì nghe được câu ấy. Đây là thứ khó bắt chước nhất của BizOn: kho
   nhạc gốc do nhóm sở hữu bản quyền.

   Bốn nguyên tắc, không thương lượng:

   1. MẶC ĐỊNH TẮT. Âm thanh tự phát khi rê chuột là một trong những thứ gây
      khó chịu nhất trên web. Người dùng phải chủ động bật.
   2. Tôn trọng khoá 'bizon-music' sẵn có của site. Ai đã tắt nhạc ở nơi khác
      thì ở đây cũng tắt.
   3. Tắt hoàn toàn dưới prefers-reduced-motion và trên thiết bị cảm ứng
      (không có khái niệm «rê chuột» trên điện thoại).
   4. Nạp lười. Chỉ tải và giải mã tệp khi thật sự cần phát lần đầu.

   Vì sao dùng Web Audio thay cho thẻ <audio>: các đoạn được cắt ở ranh giới
   khung MPEG nên đầu và cuối có thể «tách» nhẹ. GainNode cho phép vuốt vào 90ms
   và vuốt ra 260ms để cắt sạch tiếng đó, đồng thời chồng tiếng mượt khi người
   dùng lướt nhanh qua nhiều thẻ.
   =========================================================================== */
(function () {
  'use strict';

  var MOTIFS = {
    core:     'assets/audio/motif/core.mp3',
    passport: 'assets/audio/motif/passport.mp3',
    lab:      'assets/audio/motif/lab.mp3',
    arcade:   'assets/audio/motif/arcade.mp3',
  };
  var KEY = 'bizon-motif';          // lựa chọn riêng cho tính năng này
  var MUSIC_KEY = 'bizon-music';    // lựa chọn nhạc chung của site
  var FADE_IN = 0.09, FADE_OUT = 0.26, PEAK = 0.5;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(pointer: fine)');
  var ctx = null, buffers = {}, loading = {}, current = null, currentKey = null;

  function pref(k, def) {
    try { var v = localStorage.getItem(k); return v === null ? def : v === '1'; }
    catch (e) { return def; }
  }
  function setPref(k, on) { try { localStorage.setItem(k, on ? '1' : '0'); } catch (e) {} }

  // Bật hay không: mặc định TẮT, và luôn thua nếu nhạc chung đã tắt
  function enabled() {
    if (reduced.matches || !finePointer.matches) return false;
    if (!pref(MUSIC_KEY, true)) return false;
    return pref(KEY, false);
  }

  function audioCtx() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function load(name) {
    if (buffers[name]) return Promise.resolve(buffers[name]);
    if (loading[name]) return loading[name];
    var c = audioCtx();
    if (!c || !MOTIFS[name]) return Promise.resolve(null);
    loading[name] = fetch(MOTIFS[name])
      .then(function (r) { return r.ok ? r.arrayBuffer() : Promise.reject(new Error('HTTP ' + r.status)); })
      .then(function (buf) {
        return new Promise(function (res, rej) { c.decodeAudioData(buf, res, rej); });
      })
      .then(function (ab) { buffers[name] = ab; return ab; })
      .catch(function () { return null; });   // thiếu tệp thì im lặng bỏ qua, không làm vỡ trang
    return loading[name];
  }

  function stop(fast) {
    if (!current) return;
    var c = ctx, g = current.gain, src = current.src;
    current = null; currentKey = null;
    if (!c) return;
    var t = c.currentTime, d = fast ? 0.06 : FADE_OUT;
    try {
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + d);
      src.stop(t + d + 0.02);
    } catch (e) {}
  }

  function play(name) {
    if (!enabled() || currentKey === name) return;
    load(name).then(function (ab) {
      if (!ab || !enabled()) return;
      var c = audioCtx();
      if (!c) return;
      stop(true);
      var src = c.createBufferSource(), g = c.createGain();
      src.buffer = ab;
      src.connect(g); g.connect(c.destination);
      var t = c.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(PEAK, t + FADE_IN);
      // vuốt ra ở cuối để không nghe tiếng cắt
      var end = ab.duration;
      g.gain.setValueAtTime(PEAK, t + Math.max(FADE_IN, end - FADE_OUT));
      g.gain.linearRampToValueAtTime(0.0001, t + end);
      src.start(t);
      current = { src: src, gain: g };
      currentKey = name;
      src.onended = function () { if (currentKey === name) { current = null; currentKey = null; } };
    });
  }

  /* ---------- gắn vào các thẻ có data-motif ---------- */
  function wire() {
    document.querySelectorAll('[data-motif]').forEach(function (el) {
      var name = el.dataset.motif;
      if (!MOTIFS[name]) return;
      el.addEventListener('pointerenter', function () { play(name); });
      el.addEventListener('pointerleave', function () { if (currentKey === name) stop(false); });
      // bàn phím cũng phải nghe được, không chỉ chuột
      el.addEventListener('focus', function () { play(name); });
      el.addEventListener('blur', function () { if (currentKey === name) stop(false); });
    });
  }

  /* ---------- nút bật/tắt ---------- */
  function wireToggle() {
    var btn = document.querySelector('[data-motif-toggle]');
    if (!btn) return;

    // Trên thiết bị cảm ứng hoặc khi người dùng chọn giảm chuyển động thì
    // tính năng vô nghĩa – ẩn nút đi thay vì để một công tắc không làm gì.
    if (reduced.matches || !finePointer.matches) { btn.hidden = true; return; }

    function sync() {
      var on = pref(KEY, false);
      var blocked = !pref(MUSIC_KEY, true);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = blocked ? '🔇 Nhạc site đang tắt'
                     : on ? '🔊 Mô-típ âm thanh: bật' : '🔈 Mô-típ âm thanh: tắt';
      btn.disabled = blocked;
    }
    btn.addEventListener('click', function () {
      var on = !pref(KEY, false);
      setPref(KEY, on);
      sync();
      if (on) play('core'); else stop(true);   // bật thì nghe thử ngay một câu
    });
    sync();
  }

  function boot() { wire(); wireToggle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.BizonMotif = { play: play, stop: stop, enabled: enabled };
})();
