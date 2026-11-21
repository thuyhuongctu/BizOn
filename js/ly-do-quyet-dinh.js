/* BizOn – Lý do ra quyết định (đặc tả 007, câu chuyện 3 · 21/11/2026).
 * Góp ý của thầy Tú sau buổi UMK: giảng viên muốn thấy đội «ra quyết định dựa vào cái gì».
 *
 * Cách làm:
 *  - KHÔNG đổi luồng chốt: commitDecisions() của js/app.js chạy y như cũ (hồ sơ quyền tác giả: js/engine.js,
 *    js/app.js, js/backend.js không đổi dòng nào). Mô-đun chỉ bọc ngoài, xem đội vừa chốt xong chưa.
 *  - Vừa chốt xong và phiên đang nộp về lớp (có mã lớp, đã đăng nhập: BizonMemberLog.live()), hiện thẻ nhỏ
 *    «Đội chốt dựa vào gì?»: chọn tối đa 2 lý do trung tính, ghi chú tuỳ ý, «Gửi» hoặc «Bỏ qua» (không bắt buộc, 3A).
 *    Chơi thử không hiện, không gửi gì.
 *  - Gửi: một dòng nhật ký đội kind 'commit', payload { reasonsOnly, reasons, note }, cùng số vòng lúc chốt.
 *    Không cần migration; js/bizon-grading.js và js/member-log.js bỏ qua dòng này khi chấm.
 *  - Bản 3D (game.html nằm trong khung của «BizOn Game 3D.html»): thẻ hiện trên trang ngoài để người chơi thấy;
 *    tệp 3D không đổi. Liên kết bản hồ sơ ?giao-dien=goc không hiện thẻ.
 *  - Chỉ dùng để chấm trong lớp; muốn dùng cho nghiên cứu cần phiếu đồng thuận riêng.
 * Gỡ thẻ <script> này là trở lại như cũ.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  'use strict';
  /* Danh sách trung tính: không gợi ý đáp án đúng, Lumina không chọn giúp. Thứ tự cố định. */
  var REASONS = [
    { id: 'doi-thu', vi: 'Giá và động thái đối thủ', en: 'Competitors’ prices and moves' },
    { id: 'ton-kho', vi: 'Tồn kho, sản lượng', en: 'Inventory and output' },
    { id: 'dong-tien', vi: 'Dòng tiền, vốn vay', en: 'Cash flow and loans' },
    { id: 'bien-co', vi: 'Biến cố của vòng này', en: 'This round’s event' },
    { id: 'de-xuat', vi: 'Đề xuất của các thành viên', en: 'Team members’ proposals' },
    { id: 'lumina', vi: 'Gợi ý của Lumina', en: 'Lumina’s hints' }
  ];
  var MAX = 2;
  function label(id, en) { for (var i = 0; i < REASONS.length; i++) if (REASONS[i].id === id) return en ? REASONS[i].en : REASONS[i].vi; return String(id || ''); }
  var api = { REASONS: REASONS, MAX: MAX, label: label };
  window.BizonLyDo = api;
  if (typeof document === 'undefined' || !document.createElement) return;   // nạp trong Node (test, bảng giảng viên chỉ cần danh sách)

  function isEn() {
    try { if (typeof window.T === 'function') return window.T('vi', 'en') === 'en'; } catch (e) {}
    try { return localStorage.getItem('bizon-lang') === 'en'; } catch (e) { return false; }
  }
  function L(vi, en) { return isEn() ? en : vi; }
  function st() { try { return typeof S !== 'undefined' ? S : null; } catch (e) { return null; } }   // biến toàn cục `let S` của app.js

  /* Trang hiện thẻ: trang ngoài nếu game nằm trong khung 3D (cùng nguồn), không thì chính trang này. */
  function host() {
    try {
      if (window.parent && window.parent !== window && window.parent.document && window.parent.document.getElementById('gf')) {
        if (/[?&]giao-dien=goc\b/.test(window.parent.location.search)) return null;   // bản hồ sơ: giữ nguyên như đã nộp
        return window.parent.document;
      }
    } catch (e) { return document; }
    return document;
  }

  function close(doc) { var c = doc && doc.getElementById('lydo-card'); if (c) c.remove(); }

  function show(round) {
    var doc = host(); if (!doc) return;
    close(doc);
    var picked = [];
    var card = doc.createElement('div');
    card.id = 'lydo-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'false');
    card.setAttribute('aria-labelledby', 'lydo-h');
    card.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483000;width:min(440px,calc(100vw - 24px));box-sizing:border-box;' +
      'background:#FFFAF0;color:#033337;border:3px solid #E8D9BF;border-radius:22px;padding:16px;font-family:inherit;' +
      'box-shadow:inset 0 -5px 0 rgba(110,70,30,.10),inset 0 3px 0 #fff,0 18px 40px -12px rgba(3,51,55,.45)';
    var chip = 'display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border-radius:999px;border:2px solid rgba(0,102,135,.25);background:#fff;color:#033337;font:700 14px/1.2 inherit;cursor:pointer;text-align:left';
    card.innerHTML =
      '<p id="lydo-h" style="margin:0 0 2px;font-weight:800;font-size:17px">' + L('Đội chốt dựa vào gì?', 'What did your team base this decision on?') + '</p>' +
      '<p style="margin:0 0 10px;font-size:13px;color:rgba(3,51,55,.7)">' + L('Chọn tối đa 2 lý do · không bắt buộc · chỉ giảng viên lớp bạn xem', 'Pick up to 2 reasons · optional · only your instructor sees this') + '</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">' +
        REASONS.map(function (r) { return '<button type="button" data-lydo="' + r.id + '" aria-pressed="false" style="' + chip + '">' + (isEn() ? r.en : r.vi) + '</button>'; }).join('') +
      '</div>' +
      '<label for="lydo-ghi-chu" style="display:block;font-size:13px;font-weight:700;margin-bottom:4px">' + L('Ghi chú (tuỳ ý)', 'Note (optional)') + '</label>' +
      '<input id="lydo-ghi-chu" type="text" maxlength="120" autocomplete="off" style="width:100%;box-sizing:border-box;min-height:44px;border:2px solid rgba(0,102,135,.2);border-radius:12px;padding:8px 12px;font:600 14px inherit;color:#033337;background:#fff;margin-bottom:12px">' +
      '<div style="display:flex;gap:8px">' +
        '<button type="button" id="lydo-gui" disabled style="flex:1;min-height:44px;border:0;border-radius:14px;background:#006687;color:#fff;font:800 15px inherit;cursor:pointer;opacity:.5">' + L('Gửi', 'Send') + '</button>' +
        '<button type="button" id="lydo-bo-qua" style="min-height:44px;padding:0 18px;border:2px solid rgba(0,102,135,.25);border-radius:14px;background:transparent;color:#033337;font:700 15px inherit;cursor:pointer">' + L('Bỏ qua', 'Skip') + '</button>' +
      '</div>';
    doc.body.appendChild(card);
    var send = card.querySelector('#lydo-gui');
    function sync() {
      card.querySelectorAll('[data-lydo]').forEach(function (b) {
        var on = picked.indexOf(b.getAttribute('data-lydo')) > -1;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.background = on ? '#006687' : '#fff'; b.style.color = on ? '#fff' : '#033337'; b.style.borderColor = on ? '#006687' : 'rgba(0,102,135,.25)';
      });
      send.disabled = !picked.length; send.style.opacity = picked.length ? '1' : '.5';
    }
    card.querySelectorAll('[data-lydo]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-lydo'), i = picked.indexOf(id);
        if (i > -1) picked.splice(i, 1); else if (picked.length < MAX) picked.push(id);
        sync();
      };
    });
    send.onclick = function () {
      if (!picked.length) return;
      var note = String(card.querySelector('#lydo-ghi-chu').value || '').trim().slice(0, 120);
      var p = { reasonsOnly: true, reasons: picked.slice(0, MAX) };
      if (note) p.note = note;
      try { if (window.BizonMemberLog) window.BizonMemberLog.record('commit', p, round); } catch (e) {}
      close(doc);
    };
    card.querySelector('#lydo-bo-qua').onclick = function () { close(doc); };
    card.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(doc); });
    var first = card.querySelector('[data-lydo]'); if (first) try { first.focus({ preventScroll: true }); } catch (e) {}
  }
  api.show = show;

  function hook() {
    if (typeof window.commitDecisions !== 'function' || window.commitDecisions.__ly) return;
    var o = window.commitDecisions;
    window.commitDecisions = function () {
      var s = st(), was = !!(s && s.committed);
      var x = o.apply(this, arguments);
      var s2 = st();
      if (s2 && !was && s2.committed) {
        var round = Math.min(6, Math.max(1, s2.round || 1));   // cùng cách tính vòng với dòng 'commit' của js/member-log.js
        var live = false; try { live = !!(window.BizonMemberLog && window.BizonMemberLog.live && window.BizonMemberLog.live()); } catch (e) {}
        if (live) setTimeout(function () { show(round); }, 0);
      }
      return x;
    };
    // Giữ cờ của các lớp bọc khác (js/member-log.js, js/bn-exam.js) để chúng không bọc chồng thêm lần nữa
    window.commitDecisions.__ml = o.__ml; window.commitDecisions.__exam = o.__exam; window.commitDecisions.__ly = true;
  }
  hook(); document.addEventListener('DOMContentLoaded', hook);
  window.addEventListener('load', function () { hook(); setTimeout(hook, 1600); setTimeout(hook, 3000); });
})();
