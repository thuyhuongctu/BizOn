/* BizOn — Chế độ thi cho Hộ Chiếu Thương Hiệu 3D.
 * Dùng chung lịch thi của lớp (bảng class_exam, RPC bizon_exam_feed – migration 20261001000000_exam_mode.sql):
 * [giờ bắt đầu, + phút đăng nhập) chuẩn bị; quý k mở trong round_min phút tiếp theo; sau quý 6 hết giờ.
 * - Chưa tới giờ quý: khóa nút chốt quý.
 * - Hết giờ quý: tự đi tiếp (chốt ưu tiên đang chọn, mặc định «Củng cố nội lực»; sự kiện chọn phương án đầu).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var KEY = 'bizon-ft-class';
  var cfg = function () { return window.BIZON_BACKEND || {}; };
  var on = function () { var c = cfg(); return c.enabled && c.url && c.url.indexOf('YOUR-PROJECT') < 0; };
  var T = function (vi, en) { return (document.documentElement.lang || 'vi').indexOf('en') === 0 ? en : vi; };
  var exam = null, skew = 0, busy = false, lastAuto = '';
  var code = function () { try { return (localStorage.getItem(KEY) || localStorage.getItem('bizon-class') || '').trim().toUpperCase(); } catch (e) { return ''; } };
  var BP = function () { return window.__bp && window.__bp.S; };

  function status(ex, now) {
    if (!ex || !ex.active || !ex.start_at) return null;
    var setup = +ex.setup_min || 0, rm = Math.max(1, +ex.round_min || 8), t = (now - Date.parse(ex.start_at)) / 60000;
    if (t < 0) return { phase: 'wait', allowed: 0, left: -t };
    if (t < setup) return { phase: 'setup', allowed: 0, left: setup - t };
    var k = Math.floor((t - setup) / rm) + 1;
    if (k > 6) return { phase: 'end', allowed: 6, round: 7, left: 0 };
    return { phase: 'round', round: k, allowed: k, left: setup + k * rm - t };
  }
  var mmss = function (m) { var s = Math.max(0, Math.round(m * 60)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  var now = function () { return Date.now() + skew; };

  function toast(msg) {
    var el = document.createElement('div'); el.textContent = msg;
    el.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:10000;max-width:92vw;background:#033337;color:#fff;padding:10px 16px;border-radius:14px;font:700 14px/1.4 inherit;box-shadow:0 6px 20px rgba(0,0,0,.25)';
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 4200);
  }
  async function feed() {
    var c = code(); if (!on() || !c) { exam = null; return; }
    try {
      var r = await fetch(cfg().url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_exam_feed', { method: 'POST', headers: { apikey: cfg().anonKey, Authorization: 'Bearer ' + cfg().anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_class_code: c }) });
      if (!r.ok) return; var j = await r.json(); if (j && j.now) skew = Date.parse(j.now) - Date.now(); exam = (j && j.exam) || null;
    } catch (e) {}
  }

  // Ô Mã lớp trên màn giới thiệu (dùng luôn cho phần nộp kết quả)
  function classField() {
    var intro = document.getElementById('bp-intro'); if (!intro || !on() || document.getElementById('bp-exam-class')) return;
    var box = document.createElement('div'); box.className = 'mt-4';
    box.innerHTML = '<label style="display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:800;color:#033337">' + T('🎓 Mã lớp (bắt buộc khi thi)', '🎓 Class code (required in exams)') +
      '<input id="bp-exam-class" autocomplete="off" style="padding:10px 12px;border-radius:14px;border:2px solid rgba(0,102,135,.2);font:700 15px inherit;text-transform:uppercase" placeholder="VD: QTKD-K48"></label>' +
      '<p id="bp-exam-note" style="margin:6px 0 0;font-size:11px;opacity:.65"></p>';
    var start = intro.querySelector('[onclick="bpStart()"]'); intro.insertBefore(box, start || null);
    var inp = document.getElementById('bp-exam-class'); inp.value = code();
    inp.addEventListener('change', function () { try { localStorage.setItem(KEY, inp.value.trim().toUpperCase()); } catch (e) {} feed().then(tick); });
  }

  function pill(ex) {
    var el = document.getElementById('bp-exam-clock');
    if (!ex) { if (el) el.style.display = 'none'; return; }
    if (!el) { el = document.createElement('div'); el.id = 'bp-exam-clock'; el.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9998;padding:8px 16px;border-radius:999px;font:800 15px inherit;color:#fff;box-shadow:0 4px 0 rgba(0,0,0,.25);white-space:nowrap'; document.body.appendChild(el); }
    var S = BP(), q = S ? S.q + 1 : 0;
    el.style.display = 'block';
    el.style.background = ex.phase === 'round' && ex.left < 1 ? '#c0443a' : ex.phase === 'end' ? '#5a6b74' : '#006687';
    el.textContent = '⏱ ' + (ex.phase === 'wait' ? T('Thi bắt đầu sau ', 'Exam starts in ') + mmss(ex.left)
      : ex.phase === 'setup' ? T('Chuẩn bị · quý 1 mở sau ', 'Setup · Q1 opens in ') + mmss(ex.left)
      : ex.phase === 'end' ? T('Đã hết giờ thi', 'Exam time is over')
      : T('Quý ', 'Q') + ex.round + T(' · còn ', ' · ') + mmss(ex.left) + (S && q < ex.round && S.phase ? T(' · bạn đang ở quý ', ' · you are on Q') + q : ''));
  }

  // Chặn chốt quý khi chưa tới giờ
  function wrap() {
    if (typeof window.bpCommit !== 'function' || window.bpCommit.__exam) return;
    var o = window.bpCommit;
    window.bpCommit = function () {
      var ex = status(exam, now()), S = BP();
      if (ex && S && S.q + 1 > ex.allowed && !window.__bpExamAuto) {
        toast(ex.phase === 'round' ? T('Quý ' + (S.q + 1) + ' chưa mở – chờ đến giờ theo lịch thi.', 'Q' + (S.q + 1) + ' is not open yet – wait for the exam schedule.')
          : T('Chưa đến giờ thi – quý 1 mở sau ' + mmss(ex.left) + '.', 'The exam has not started – Q1 opens in ' + mmss(ex.left) + '.'));
        return;
      }
      return o.apply(this, arguments);
    };
    window.bpCommit.__exam = true;
  }

  // Hết giờ quý: đi tiếp từng bước cho tới khi bắt kịp quý đang mở
  function autoStep(ex) {
    var S = BP(); if (!S || busy) return;
    var play = document.getElementById('bp-play'); if (!play || play.classList.contains('hidden')) return;
    if (!(ex.phase === 'end' || (ex.phase === 'round' && S.q + 1 < ex.round))) return;
    busy = true; window.__bpExamAuto = true;
    try {
      var stage = document.getElementById('bp-stage'), tag = S.q + ':' + S.phase;
      if (tag !== lastAuto) { lastAuto = tag; if (S.phase === 'obs') toast(T('Hết giờ quý ' + (S.q + 1) + ' – hệ thống tự chốt để bắt kịp lịch thi.', 'Q' + (S.q + 1) + ' time is up – auto-committing to keep up with the schedule.')); }
      if (S.phase === 'obs' && window.bpToDecide) window.bpToDecide();
      else if (S.phase === 'dec') { if (S.sel.prio === null) S.sel.prio = 4; window.bpCommit(); }
      else if (S.phase === 'evt' && stage) {
        var b = stage.querySelector('[onclick^="bpEv("]') || stage.querySelector('[onclick="bpNext()"]') || document.querySelector('[onclick="bpNext()"]');
        if (b) b.click();
      }
    } catch (e) {} finally { window.__bpExamAuto = false; setTimeout(function () { busy = false; }, 600); }
  }

  function tick() {
    classField(); wrap();
    var ex = status(exam, now()); pill(ex);
    var note = document.getElementById('bp-exam-note');
    if (note) note.textContent = !code() ? T('Nhập Mã lớp để nhận lịch thi và được chấm điểm.', 'Enter the class code to get the exam schedule and be graded.')
      : exam && exam.active ? T('✓ Đã nhận lịch thi của lớp ', '✓ Exam schedule received for ') + code() : T('Lớp ' + code() + ' chưa bật chế độ thi.', 'Class ' + code() + ' has no active exam.');
    if (ex) autoStep(ex);
  }
  setInterval(tick, 1000);
  setInterval(feed, 10000);
  document.addEventListener('DOMContentLoaded', function () { feed().then(tick); });
  window.addEventListener('load', function () { wrap(); tick(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) feed().then(tick); });
  window.BizOnBpExam = { get exam() { return exam; }, refresh: function () { return feed().then(tick); } };
})();
