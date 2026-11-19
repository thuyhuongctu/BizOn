/* BizOn – Trang Giảng viên: khóa mục «Nguồn dữ liệu mở» (19/11/2026).
 * Mở cho: sinh viên đăng nhập bằng email trường (phiên 'bizon-student-session'), giảng viên đã đăng nhập
 * bảng điều khiển lớp (phiên 'bizon-instructor-session'), hoặc khách để lại email có đồng ý.
 * Email khách gửi qua RPC bizon_guest_signup (supabase/migrations/20261119000000_khach_dang_ky_email.sql);
 * lưu thành công thì nhớ trên máy (localStorage 'bizon-nguon-mo') để lần sau không phải nhập lại.
 * Đây là khóa mềm: các liên kết trỏ tới trang công khai bên ngoài. */
(function () {
  'use strict';
  var KEY = 'bizon-nguon-mo';
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var lock = document.getElementById('nguon-mo-khoa');
  var tpl = document.getElementById('nguon-mo-tpl');
  var form = document.getElementById('nguon-mo-form');
  if (!lock || !tpl || !form) return;

  function lang() { return (window.clayCurrentLang ? window.clayCurrentLang() : document.documentElement.lang) === 'en' ? 'en' : 'vi'; }
  function T(vi, en) { return lang() === 'en' ? en : vi; }
  function read(store, k) { try { return JSON.parse(store.getItem(k) || 'null'); } catch (e) { return null; } }

  function schoolSession() {
    var s = read(window.sessionStorage, 'bizon-student-session');
    if (s && s.accessToken && (s.expiresAt > Date.now() || s.refreshToken)) return true;
    var g = read(window.localStorage, 'bizon-instructor-session');
    return !!(g && g.access && (g.exp > Date.now() || g.refresh));
  }
  function remembered() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }

  function open() {
    if (!tpl.parentNode) return;
    tpl.parentNode.insertBefore(tpl.content.cloneNode(true), tpl);
    tpl.parentNode.removeChild(tpl);
    lock.hidden = true;
    if (window.clayRefreshLang) window.clayRefreshLang();
  }

  var msg = document.getElementById('nguon-mo-msg');
  function say(text, err) { msg.textContent = text; msg.classList.toggle('err', !!err); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = form.email.value.trim();
    if (!EMAIL_RE.test(email) || email.length > 254) { say(T('Email chưa đúng, bạn kiểm tra lại giúp.', 'Please check your email address.'), true); form.email.focus(); return; }
    if (!form.consent.checked) { say(T('Cần đánh dấu đồng ý để BizOn lưu email.', 'Please tick the consent box so BizOn can store your email.'), true); form.consent.focus(); return; }
    var cfg = window.BIZON_BACKEND || {};
    if (!cfg.enabled || !cfg.url || !cfg.anonKey) { say(T('Chưa kết nối được máy chủ, thử lại sau.', 'Cannot reach the server, please try again later.'), true); return; }
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; say(T('Đang lưu…', 'Saving…'));
    fetch(cfg.url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_guest_signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey },
      body: JSON.stringify({ p_email: email, p_consent: true, p_lang: lang(), p_source: 'giang-vien' })
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (j) {
        if (!r.ok) throw new Error((j && (j.message || j.hint)) || ('HTTP ' + r.status));
        try { localStorage.setItem(KEY, 'khach'); } catch (e) {}
        say(''); open();
      });
    }).catch(function (e) {
      btn.disabled = false;
      var m = String(e && e.message || '');
      say(/không hợp lệ/i.test(m) ? T('Email chưa đúng, bạn kiểm tra lại giúp.', 'Please check your email address.')
        : T('Chưa lưu được email, thử lại sau ít phút.', 'Could not save your email, please try again in a few minutes.'), true);
    });
  });

  if (remembered() || schoolSession()) open();
})();
