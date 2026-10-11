/* BizOn – Cổng đăng nhập nhẹ dùng chung cho các game 3D sau Bật Nghiệp (Hộ Chiếu
 * Thương Hiệu 3D, Bến Phù Sa v8/3D): hiện form đội/email/mã lớp TRƯỚC màn intro
 * sẵn có của mỗi game, giống đúng cơ chế game.html (doLogin()/doLoginDemo()) —
 * không mật khẩu, không auth thật, bỏ trống vẫn chơi được ở chế độ chơi thử.
 * Dùng chung class .clay-card/.clay-btn đã có trong css/tw.css nên không cần
 * CSS riêng. Nạp SCRIPT này rồi gọi: Game3DGate.mount({introId:'bp-intro', ...}).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  'use strict';
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  function mount(opts) {
    opts = opts || {};
    var introId = opts.introId;
    var title = opts.title || T('Chào mừng!', 'Welcome!');
    var subtitle = opts.subtitle || '';

    function go() {
      var intro = document.getElementById(introId);
      if (!intro) return; // phòng khi gọi sai id, không chặn trang
      intro.classList.add('hidden'); // phòng khi markup quên thêm sẵn 'hidden'

      var box = document.createElement('div');
      box.id = 'g3d-gate';
      box.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:linear-gradient(160deg,#02191c 0%,#033337 60%,#02444d 100%);overflow-y:auto';
      box.innerHTML =
        '<div class="clay-card p-0" style="max-width:420px;width:100%;overflow:hidden">' +
          '<div style="padding:28px 24px 24px">' +
            '<h2 class="font-display font-extrabold" style="font-size:22px;margin:0 0 4px;color:#033337">' + esc(title) + '</h2>' +
            (subtitle ? '<p style="font-size:13px;color:rgba(3,51,55,.6);margin:0 0 18px;line-height:1.4">' + esc(subtitle) + '</p>' : '<div style="margin-bottom:10px"></div>') +
            '<label style="display:block;font-size:13px;font-weight:700;color:#033337;margin:0 0 4px">' + T('Tên đội – cũng là tên doanh nghiệp của bạn', 'Team name – also your firm name') + '</label>' +
            '<input id="g3d-team" type="text" placeholder="' + T('VD: Rồng Xanh Corp', 'e.g. Blue Dragon Corp') + '" style="width:100%;border:2px solid rgba(0,102,135,.18);border-radius:14px;padding:11px 14px;margin:0 0 14px;font:inherit;box-sizing:border-box">' +
            '<label style="display:block;font-size:13px;font-weight:700;color:#033337;margin:0 0 4px">Email</label>' +
            '<input id="g3d-email" type="email" placeholder="sinhvien@truong.edu.vn" style="width:100%;border:2px solid rgba(0,102,135,.18);border-radius:14px;padding:11px 14px;margin:0 0 14px;font:inherit;box-sizing:border-box">' +
            '<label style="display:block;font-size:13px;font-weight:700;color:#033337;margin:0 0 4px">' + T('Mã lớp học', 'Class code') + ' <span style="font-weight:400;opacity:.5">(' + T('tùy chọn', 'optional') + ')</span></label>' +
            '<p style="font-size:11px;color:rgba(3,51,55,.55);margin:0 0 6px;line-height:1.4">' + T('Bỏ trống vẫn chơi trọn vẹn ở chế độ chơi thử. Điền mã lớp để kết quả gửi về máy chủ lớp học.', 'Leave blank to play in full trial mode. Add a class code to send results to the class server.') + '</p>' +
            '<input id="g3d-class" type="text" placeholder="' + T('VD: QTKD-2026-A', 'e.g. QTKD-2026-A') + '" style="width:100%;border:2px solid rgba(0,102,135,.18);border-radius:14px;padding:11px 14px;margin:0 0 18px;font:inherit;box-sizing:border-box">' +
            '<button id="g3d-go" type="button" class="clay-btn w-full bg-clay-gold text-deep-teal font-display font-extrabold py-4">' + T('Bắt đầu 🚀', 'Start 🚀') + '</button>' +
            '<button id="g3d-demo" type="button" style="display:block;width:100%;background:none;border:0;padding:12px 0 0;font:700 13px inherit;color:rgba(3,51,55,.65);cursor:pointer">' + T('👥 Chơi thử nhanh, không cần điền', '👥 Quick play, skip the form') + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(box);

      function enter(team, email, classId) {
        try {
          localStorage.setItem('bizon-team', team || '');
          localStorage.setItem('bizon-class', classId || '');
          localStorage.setItem('bizon-ft-class', classId || '');
          localStorage.setItem('bizon-ft-name', team || '');
          if (email) localStorage.setItem('bizon-email', email);
        } catch (e) {}
        box.remove();
        intro.classList.remove('hidden');
        if (typeof opts.onEnter === 'function') opts.onEnter({ team: team, email: email, classId: classId });
      }

      document.getElementById('g3d-go').onclick = function () {
        var team = document.getElementById('g3d-team').value.trim() || T('Đội của bạn', 'Your team');
        var email = document.getElementById('g3d-email').value.trim();
        var classId = document.getElementById('g3d-class').value.trim();
        enter(team, email, classId);
      };
      document.getElementById('g3d-demo').onclick = function () {
        enter(T('Đội Demo', 'Demo Team'), '', '');
      };
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }

  window.Game3DGate = { mount: mount };
})();
