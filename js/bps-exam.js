/* BizOn — Chế độ thi cho Bến Phù Sa 3D (5 tuần). Dùng chung lịch thi của lớp (class_exam, RPC bizon_exam_feed).
 * [giờ bắt đầu, + phút chuẩn bị) chuẩn bị; tuần k mở trong round_min phút tiếp theo; sau tuần 5 hết giờ.
 * Chưa tới giờ: khóa «Chốt tuần». Hết giờ: tự chốt lựa chọn đang có (thiếu thì: gánh hàng rong · món 1 · điểm đông khách nhất).
 * Kết thúc: tự nộp kết quả (ft_results) nếu đã có Mã lớp. © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var KEY = 'bizon-ft-class';
  var cfg = function () { return window.BIZON_BACKEND || {}; };
  var on = function () { var c = cfg(); return c.enabled && c.url && c.url.indexOf('YOUR-PROJECT') < 0; };
  var EN = function () { try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; } };
  var T = function (vi, en) { return EN() ? en : vi; };
  var exam = null, skew = 0, busy = false, submitted = false;
  var code = function () { try { return (localStorage.getItem(KEY) || '').trim().toUpperCase(); } catch (e) { return ''; } };
  var G = function () { return window.__bps; };
  var $ = function (id) { return document.getElementById(id); };
  var N = 5;

  function status(ex, now) {
    if (!ex || !ex.active || !ex.start_at) return null;
    var setup = +ex.setup_min || 0, rm = Math.max(1, +ex.round_min || 5), t = (now - Date.parse(ex.start_at)) / 60000;
    if (t < 0) return { phase: 'wait', allowed: 0, left: -t };
    if (t < setup) return { phase: 'setup', allowed: 0, left: setup - t };
    var k = Math.floor((t - setup) / rm) + 1;
    if (k > N) return { phase: 'end', allowed: N, round: N + 1, left: 0 };
    return { phase: 'round', round: k, allowed: k, left: setup + k * rm - t };
  }
  var mmss = function (m) { var s = Math.max(0, Math.round(m * 60)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  var now = function () { return Date.now() + skew; };
  function toast(msg) {
    var el = document.createElement('div'); el.textContent = msg;
    el.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:10000;max-width:92vw;background:#033337;color:#fff;padding:10px 16px;border-radius:14px;font:700 14px/1.4 "Plus Jakarta Sans",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25)';
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 4200);
  }
  async function feed() {
    var c = code(); if (!on() || !c) { exam = null; return; }
    try {
      var r = await fetch(cfg().url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_exam_feed', { method: 'POST', headers: { apikey: cfg().anonKey, Authorization: 'Bearer ' + cfg().anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_class_code: c }) });
      if (!r.ok) return; var j = await r.json(); if (j && j.now) skew = Date.parse(j.now) - Date.now(); exam = (j && j.exam) || null;
    } catch (e) {}
  }
  function classField() {
    var intro = $('ft-intro'); if (!intro || !on() || $('bps-exam-class')) return;
    var start = intro.querySelector('[onclick="ftStart()"]'); if (!start) return;
    var box = document.createElement('div'); box.style.cssText = 'margin-top:14px;display:flex;flex-direction:column;gap:6px';
    box.innerHTML = '<label style="display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:800;color:#033337">' + T('🎓 Mã lớp (bắt buộc khi thi)', '🎓 Class code (required in exams)') +
      '<input id="bps-exam-class" autocomplete="off" style="padding:10px 12px;border-radius:14px;border:2px solid rgba(0,102,135,.2);font:700 15px inherit;text-transform:uppercase" placeholder="VD: QTKD-K48"></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:800;color:#033337">' + T('👤 Tên bạn / tên đội', '👤 Your name / team name') + '<input id="bps-exam-name" autocomplete="off" style="padding:10px 12px;border-radius:14px;border:2px solid rgba(0,102,135,.2);font:700 15px inherit"></label>' +
      '<p id="bps-exam-note" style="margin:0;font-size:11px;opacity:.65"></p>';
    start.parentNode.insertBefore(box, start);
    var inp = $('bps-exam-class'), nm = $('bps-exam-name'); inp.value = code(); try { nm.value = localStorage.getItem('bizon-ft-name') || ''; } catch (e) {}
    inp.addEventListener('change', function () { try { localStorage.setItem(KEY, inp.value.trim().toUpperCase()); } catch (e) {} feed().then(tick); });
    nm.addEventListener('change', function () { try { localStorage.setItem('bizon-ft-name', nm.value.trim()); } catch (e) {} });
  }
  function pill(ex) {
    var el = $('bps-exam-clock');
    if (!ex) { if (el) el.style.display = 'none'; return; }
    if (!el) { el = document.createElement('div'); el.id = 'bps-exam-clock'; el.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:9998;padding:9px 18px;border-radius:999px;font:800 15px "Plus Jakarta Sans",sans-serif;color:#fff;box-shadow:0 4px 0 rgba(0,0,0,.25);white-space:nowrap'; document.body.appendChild(el); }
    var g = G(), w = g ? g.S.week + 1 : 0;
    el.style.display = 'block';
    el.style.background = ex.phase === 'round' && ex.left < 1 ? '#c0443a' : ex.phase === 'end' ? '#5a6b74' : '#006687';
    el.textContent = '⏱ ' + (ex.phase === 'wait' ? T('Thi bắt đầu sau ', 'Exam starts in ') + mmss(ex.left)
      : ex.phase === 'setup' ? T('Chuẩn bị · tuần 1 mở sau ', 'Setup · week 1 opens in ') + mmss(ex.left)
      : ex.phase === 'end' ? T('Đã hết giờ thi', 'Exam time is over')
      : T('Tuần ', 'Week ') + ex.round + T(' · còn ', ' · ') + mmss(ex.left) + (g && w < ex.round && w <= N ? T(' · bạn đang ở tuần ', ' · you are on week ') + w : ''));
  }
  function wrap() {
    if (typeof window.ftCommit !== 'function' || window.ftCommit.__exam) return;
    var o = window.ftCommit;
    window.ftCommit = function () {
      var ex = status(exam, now()), g = G();
      if (ex && g && g.S.week + 1 > ex.allowed && !window.__bpsExamAuto) {
        toast(ex.phase === 'round' ? T('Tuần ' + (g.S.week + 1) + ' chưa mở – chờ đến giờ theo lịch thi.', 'Week ' + (g.S.week + 1) + ' is not open yet – wait for the schedule.')
          : T('Chưa đến giờ thi – tuần 1 mở sau ' + mmss(ex.left) + '.', 'The exam has not started – week 1 opens in ' + mmss(ex.left) + '.'));
        return;
      }
      return o.apply(this, arguments);
    };
    window.ftCommit.__exam = true;
  }
  function autoStep(ex) {
    var g = G(); if (!g || busy) return;
    var play = $('ft-play'), rit = $('ft-ritual');
    if (rit && !rit.classList.contains('hidden')) { if (ex.phase === 'end' || g.S.week + 1 < ex.round) { var b = rit.querySelector('button'); if (b) b.click(); } return; }
    if (!play || play.classList.contains('hidden')) return;
    if (!(ex.phase === 'end' || (ex.phase === 'round' && g.S.week + 1 < ex.round))) return;
    busy = true; window.__bpsExamAuto = true;
    try {
      var s = g.S.sel, W = g.W[g.S.week] || [];
      toast(T('Hết giờ tuần ' + (g.S.week + 1) + ' – hệ thống tự chốt lựa chọn đang có.', 'Week ' + (g.S.week + 1) + ' time is up – auto-committing your current choices.'));
      if (s.m === null) window.ftPick('m', 1);
      if (s.menu === null) window.ftPick('menu', 0);
      if (s.loc === null) window.ftPick('loc', W.indexOf(Math.max.apply(null, W)));
      window.ftCommit();
    } catch (e) {} finally { window.__bpsExamAuto = false; setTimeout(function () { busy = false; }, 2600); }
  }
  function autoSubmit() {
    var end = $('ft-end'), g = G(); if (submitted || !end || end.classList.contains('hidden') || !g || !g.S.result || !code()) return;
    submitted = true;
    var c = $('ft-class'), n = $('ft-name'); if (c && !c.value) c.value = code(); if (n && !n.value) try { n.value = localStorage.getItem('bizon-ft-name') || ''; } catch (e) {}
    if (typeof window.ftSubmit === 'function') window.ftSubmit();
  }
  function tick() {
    classField(); wrap();
    var ex = status(exam, now()); pill(ex);
    var note = $('bps-exam-note');
    if (note) note.textContent = !code() ? T('Nhập Mã lớp để nhận lịch thi và tự nộp kết quả.', 'Enter the class code to get the exam schedule and auto-submit.')
      : exam && exam.active ? T('✓ Đã nhận lịch thi lớp ' + code() + ' · ' + (+exam.round_min || 5) + ' phút/tuần', '✓ Exam schedule for ' + code() + ' · ' + (+exam.round_min || 5) + ' min/week') : T('Lớp ' + code() + ' chưa bật chế độ thi – chơi tự do.', 'Class ' + code() + ' has no active exam – free play.');
    if (ex) autoStep(ex);
    if (exam && exam.active) autoSubmit();
  }
  setInterval(tick, 1000); setInterval(feed, 10000);
  feed().then(tick);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) feed().then(tick); });
  window.BizOnBpsExam = { get exam() { return exam; }, refresh: function () { return feed().then(tick); } };
})();
