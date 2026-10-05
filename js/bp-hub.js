/* Hộ Chiếu Thương Hiệu 3D – "Văn phòng chiến lược": hub clay đi lại dùng
 * js/clay-hub.js (engine dùng chung với Bến Phù Sa 3D / Bật Nghiệp). Nạp SAU
 * js/bp-rival-intel.js + js/clay-hub.js, và SAU script chính của trang (cần
 * window.__bp – cùng cách bp3d-streets.js đọc trạng thái sống của trang, xem
 * "window.__bp = {...}" ở cuối script chính). bpToggleShop/bpShowRules đã là
 * hàm global thật (window.bpToggleShop = ...) nên gọi thẳng được. Gắn nút
 * "🏢 Văn phòng" cạnh nút Luật chơi/Hướng dẫn trong #bp-play – mở bất cứ lúc
 * nào, không chặn luồng chơi chính. Thuần hiển thị + điều hướng, không đổi
 * doanh thu/điểm số.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };
  var f1 = function (v) { return (Math.round(v * 10) / 10).toLocaleString(isEN() ? 'en-US' : 'vi-VN', { maximumFractionDigits: 1 }); };
  var G = function () { return window.__bp; };

  function notebookText() {
    var s = G() && G().S; if (!s) return '';
    var entered = (s.entered || []).filter(function (m) { return m !== null; }).length;
    var lines = [
      T('📍 Quý ' + (s.q + 1) + '/6 · 💼 ' + f1(s.cash) + ' tỷ ₫ tiền mặt · ⭐ ' + Math.round(s.rep) + ' uy tín', '📍 Quarter ' + (s.q + 1) + '/6 · 💼 ' + f1(s.cash) + ' bn ₫ cash · ⭐ ' + Math.round(s.rep) + ' reputation'),
      T('🌍 Đã vào ' + entered + '/7 thị trường.', '🌍 Entered ' + entered + '/7 markets.'),
    ];
    if (s.q === 0) lines.push(T('Gợi ý: mua tình báo trước khi chọn thị trường đầu tiên – đừng vào mù.', 'Tip: buy intel before picking your first market – don\'t go in blind.'));
    else if (s.profit < s.rival.rev) lines.push(T('Kim Long Exports đang dẫn trước – xem lại thị trường nào bạn chưa khai thác hết.', 'Kim Long Exports is ahead – review which markets you haven\'t fully tapped yet.'));
    else lines.push(T('Bạn đang dẫn trước – giữ nhịp, đừng chủ quan ở các quý cuối.', "You're ahead – keep the pace, don't get complacent in the final quarters."));
    return lines.join('\n');
  }

  function buildConfig() {
    var b = G() || {};
    var s = b.S, firms = b.FIRMS || [];
    var f = (s && firms[s.firm]) || {};
    return {
      title: T('🏢 Văn phòng chiến lược', '🏢 Strategy Office'),
      subtitle: T('Hộ Chiếu Thương Hiệu', 'Brand Passport'),
      hint: T('WASD / mũi tên / joystick / chạm sàn để đi. Đến gần rồi bấm <b>E</b> hoặc chạm để nói.', 'WASD / arrows / joystick / tap the floor to move. Get close and press <b>E</b> or tap to interact.'),
      exitLabel: T('Rời văn phòng ▸', 'Leave office ▸'),
      byeLabel: T('Cảm ơn, tôi đi tiếp.', 'Thanks, moving on.'),
      width: 1400, height: 900,
      decor: [
        { x: 160, y: 20, w: 200, h: 130, img: 'assets/illustrations/game/phong-hop-chien-luoc.webp' },
        { x: 1040, y: 20, w: 200, h: 130, img: 'assets/illustrations/command-center.webp' },
      ],
      player: { img: f.img || 'assets/character/firms/moc-nhien-cut.webp', name: (f.icon || '🏢') + ' ' + (f.name || T('Đội bạn', 'Your team')), x: 700, y: 760 },
      npcs: [
        { id: 'rival', img: 'assets/character/firms/kim-long-rival-cut.webp', icon: '🐉', accent: '#c0392b', name: 'Kim Long Exports', x: 1100, y: 620,
          talk: function (api) {
            if (window.BPRivalIntel && s) { api.close(); window.BPRivalIntel.showDetail(s.profit, s.rival.rev); }
            else api.dialogue({ name: 'Kim Long Exports', icon: '🐉', img: 'assets/character/firms/kim-long-rival-cut.webp' }, T('Thần tốc mở rộng, chiếm chỗ trước khi đối thủ kịp vào.', 'Expand fast – claim ground before anyone else arrives.'), [{ text: 'OK', primary: true, onPick: api.close }]);
          } },
      ],
      stations: [
        { id: 'shop', icon: '🛍️', art: 'assets/illustrations/game/celebrate-shop.webp', name: T('Cửa hàng', 'Shop'), x: 420, y: 380,
          desc: T('Dùng tiền mặt mua vật phẩm hỗ trợ.', 'Spend cash on helpful items.'),
          onOpen: function (api) { api.exit(); var s2 = G() && G().S; if (s2 && !s2.shopOpen && typeof window.bpToggleShop === 'function') window.bpToggleShop();
            var el = $('bp-shop-card'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } },
        { id: 'notebook', icon: '📓', art: 'assets/illustrations/game/paths-compass.webp', name: T('Sổ tay chiến lược', 'Strategy Notebook'), x: 700, y: 380,
          onOpen: function (api) { api.dialogue({ name: T('Sổ tay chiến lược', 'Strategy Notebook'), icon: '📓', art: 'assets/illustrations/game/paths-compass.webp', station: true }, notebookText(), [{ text: T('Đóng', 'Close'), primary: true, onPick: api.close }]); } },
        { id: 'rules', icon: '📜', art: 'assets/illustrations/strategy-notes-podium.webp', name: T('Luật chơi', 'Rules'), x: 980, y: 380,
          onOpen: function () { if (typeof window.bpShowRules === 'function') window.bpShowRules(); } },
      ],
    };
  }

  function mountEntry() {
    if ($('bp-hub-enter')) return;
    var rulesBtn = document.querySelector('#bp-play [onclick="bpShowRules()"]');
    var anchor = rulesBtn && rulesBtn.parentNode;
    if (!anchor) return;
    var btn = document.createElement('button');
    btn.id = 'bp-hub-enter'; btn.type = 'button'; btn.className = 'text-[11px] font-bold text-deep-teal/50';
    btn.style.position = 'relative';
    btn.title = T('Văn phòng', 'Office'); btn.textContent = T('🏢 Văn phòng', '🏢 Office');
    btn.onclick = function () { clearNew(); window.ClayHub.open(buildConfig()); };
    anchor.insertBefore(btn, anchor.firstChild);
  }
  var tries = 0;
  (function wait() { if ($('bp-play')) mountEntry(); if (++tries < 40) setTimeout(wait, 250); })();

  // Chấm cam nhắc "có tin mới" trên nút vào văn phòng sau mỗi quý chốt xong –
  // khuyến khích học viên chủ động ghé kiểm tra đối thủ thay vì chỉ bấm lướt
  // qua các quý. Tắt khi mở văn phòng. Thuần hiển thị, không đổi điểm số.
  function markNew() {
    var btn = $('bp-hub-enter'); if (!btn || $('bp-hub-dot')) return;
    var dot = document.createElement('span'); dot.id = 'bp-hub-dot';
    dot.style.cssText = 'position:absolute;top:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:#e8762d;box-shadow:0 0 0 2px #fff';
    btn.appendChild(dot);
  }
  function clearNew() { var dot = $('bp-hub-dot'); if (dot) dot.remove(); }

  window.BPHub = { open: function () { clearNew(); window.ClayHub.open(buildConfig()); }, markNew: markNew };
})();
