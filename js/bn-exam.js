/* BizOn — Chế độ thi cho Bật Nghiệp (BizOn Game 3D / game.html).
 * Dùng chung lịch thi của lớp (bảng class_exam, RPC bizon_exam_feed – migration 20261001000000_exam_mode.sql):
 * [giờ bắt đầu, + phút chuẩn bị) đăng nhập; vòng k mở trong round_min phút tiếp theo; sau vòng 6 hết giờ.
 * - Chưa tới giờ vòng: khóa nút Commit.
 * - Hết giờ vòng mà chưa Commit: tự Commit theo quyết định đang có trên thanh trượt.
 * Đặt sau app.js. Không đụng gì nếu lớp chưa bật «Bắt đầu tính giờ» trên Trang Giảng viên.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var cfg = function () { return window.BIZON_BACKEND || {}; };
  var on = function () { var c = cfg(); return c.enabled && c.url && c.url.indexOf('YOUR-PROJECT') < 0; };
  var TT = function (vi, en) { return typeof T === 'function' ? T(vi, en) : vi; };
  var getS = function () { return (typeof window.S !== 'undefined' && window.S) || (function () { try { return eval('S'); } catch (e) { return null; } })(); };
  var exam = null, skew = 0, busy = false;

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
    el.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:10000;max-width:92vw;background:#1f4a55;color:#fff;padding:10px 16px;border-radius:14px;font:700 14px/1.4 inherit;box-shadow:0 6px 20px rgba(0,0,0,.25)';
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 4200);
  }
  async function feed() {
    var s = getS(), code = s && s.profile && s.profile.classId ? String(s.profile.classId).trim().toUpperCase() : '';
    if (!on() || !code) { exam = null; return; }
    try {
      var r = await fetch(cfg().url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_exam_feed', { method: 'POST', headers: { apikey: cfg().anonKey, Authorization: 'Bearer ' + cfg().anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_class_code: code }) });
      if (!r.ok) return; var j = await r.json(); if (j && j.now) skew = Date.parse(j.now) - Date.now(); exam = (j && j.exam) || null;
    } catch (e) {}
  }

  function pill(ex) {
    var el = document.getElementById('bn-exam-clock');
    if (!ex) { if (el) el.style.display = 'none'; return; }
    if (!el) { el = document.createElement('div'); el.id = 'bn-exam-clock'; el.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9998;padding:8px 16px;border-radius:999px;font:800 15px inherit;color:#fff;box-shadow:0 4px 0 rgba(0,0,0,.25);white-space:nowrap'; document.body.appendChild(el); }
    el.style.display = 'block';
    el.style.background = ex.phase === 'round' && ex.left < 1 ? '#c0443a' : ex.phase === 'end' ? '#5a6b74' : '#1f4a55';
    el.textContent = '⏱ ' + (ex.phase === 'wait' ? TT('Thi bắt đầu sau ', 'Exam starts in ') + mmss(ex.left)
      : ex.phase === 'setup' ? TT('Chuẩn bị · vòng 1 mở sau ', 'Setup · Round 1 opens in ') + mmss(ex.left)
      : ex.phase === 'end' ? TT('Đã hết giờ thi', 'Exam time is over')
      : TT('Vòng ', 'Round ') + ex.round + TT(' · còn ', ' · ') + mmss(ex.left));
  }

  // Chặn Commit khi chưa tới giờ vòng (đội đi nhanh hơn lịch thi)
  function wrap() {
    if (typeof window.commitDecisions !== 'function' || window.commitDecisions.__exam) return;
    var o = window.commitDecisions;
    window.commitDecisions = function () {
      var ex = status(exam, now()), s = getS();
      if (ex && s && s.round > ex.allowed && !window.__bnExamAuto) {
        toast(ex.phase === 'wait' || ex.phase === 'setup'
          ? TT('Chưa đến giờ thi – vòng 1 mở sau ' + mmss(ex.left) + '.', 'The exam has not started – Round 1 opens in ' + mmss(ex.left) + '.')
          : TT('Vòng ' + s.round + ' chưa mở – chờ đến giờ theo lịch thi.', 'Round ' + s.round + ' is not open yet – wait for the exam schedule.'));
        return;
      }
      return o.apply(this, arguments);
    };
    window.commitDecisions.__exam = true;
  }

  // Hết giờ vòng mà chưa Commit: tự Commit theo quyết định đang có trên thanh trượt
  function autoCommit(ex) {
    var s = getS(); if (!s || busy || s.finished || s.committed) return;
    if (!(ex.phase === 'end' || (ex.phase === 'round' && s.round < ex.round))) return;
    var box = document.getElementById('commit-box'); if (!box || box.classList.contains('hidden')) return;
    busy = true; window.__bnExamAuto = true;
    try {
      toast(TT('Hết giờ vòng ' + s.round + ' – hệ thống tự Commit theo thanh trượt hiện có.', 'Round ' + s.round + ' time is up – auto-committing with the current sliders.'));
      window.commitDecisions();
    } catch (e) {} finally { window.__bnExamAuto = false; setTimeout(function () { busy = false; }, 3000); }
  }

  function tick() {
    wrap();
    var ex = status(exam, now()); pill(ex);
    if (ex) autoCommit(ex);
  }
  setInterval(tick, 1000);
  setInterval(feed, 10000);
  document.addEventListener('DOMContentLoaded', function () { feed().then(tick); });
  window.addEventListener('load', function () { wrap(); tick(); });
  window.BizOnBnExam = { get exam() { return exam; }, refresh: function () { return feed().then(tick); } };
})();
