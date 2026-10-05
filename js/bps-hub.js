/* Bến Phù Sa 3D – "Bến đậu thương hồ": hub clay đi lại dùng js/clay-hub.js
 * (engine dùng chung với Brand Passport 3D / Bật Nghiệp). Nạp SAU
 * js/bps-rival-intel.js + js/clay-hub.js, và SAU script chính của trang (cần
 * window.__bps – cùng cách js/bps3d.js đọc trạng thái sống của trang, xem
 * "const G = () => window.__bps" ở đầu file đó, và "window.__bps = {...}" ở
 * script chính). ftToggleShop đã là hàm global thật (window.ftToggleShop =
 * ...) nên gọi thẳng được. Gắn nút "🏯 Ra bến" cạnh khung thẻ đối thủ – mở
 * bất cứ lúc nào, không chặn luồng chơi chính. Thuần hiển thị + điều hướng,
 * không đổi doanh thu/điểm số.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };
  var f1 = function (v) { return (Math.round(v * 10) / 10).toLocaleString(isEN() ? 'en-US' : 'vi-VN', { maximumFractionDigits: 1 }); };
  var G = function () { return window.__bps; };

  // Hàm, không phải hằng – T() chỉ đọc đúng ngôn ngữ nếu được GỌI LÚC MỞ hộp
  // thoại, không phải lúc script nạp. Trước đây là biến đánh giá 1 lần khi
  // IIFE chạy, nên đổi ngôn ngữ giữa ván không cập nhật được nội dung này.
  function rulesText() {
    return T(
      '⛵ Ghe hàng bông: doanh thu ×3 nhưng chốt cứng món hàng & địa điểm cả tuần.\n' +
      '🧺 Gánh hàng rong: doanh thu ×1 nhưng nghe ngóng được nhiều thông tin thị trường.\n' +
      '📋 Khảo sát chợ: mất trọn tuần không bán hàng, nhận dữ liệu lịch sử.\n' +
      '⚔️ Đụng cùng địa điểm với đối thủ là chia nhau khách!',
      '⛵ Trading boat: revenue ×3 but locks the product & location for the whole week.\n' +
      '🧺 Street cart: revenue ×1 but you gather a lot of market intel.\n' +
      '📋 Market survey: no sales for the week, but you get historical data.\n' +
      '⚔️ Hitting the same location as a rival means splitting the customers!'
    );
  }

  function notebookText() {
    var b = G(); var s = b && b.S, R = b && b.RIVALS; if (!s || !R) return '';
    var rank = R.filter(function (r) { return r.total > s.total; }).length;
    var lines = [
      T('📍 Tuần ' + (s.week + 1) + '/5 · 💰 ' + f1(s.total) + ' triệu ₫ · 🪙 ' + f1(s.budget) + ' triệu ₫ vốn riêng', '📍 Week ' + (s.week + 1) + '/5 · 💰 ' + f1(s.total) + ' mn ₫ · 🪙 ' + f1(s.budget) + ' mn ₫ capital'),
      rank === 0 ? T('🏆 Bạn đang dẫn đầu cả bến!', '🏆 You are leading the whole wharf!') : T('🌊 Bạn đang xếp hạng ' + (rank + 1) + '/4.', '🌊 You are ranked ' + (rank + 1) + '/4.'),
    ];
    if (s.week === 0) lines.push(T('Gợi ý: tuần đầu thử gánh hàng rong để nghe ngóng trước khi dồn vốn vào ghe hàng bông.', 'Tip: try the street cart in week 1 to scout before committing to the trading boat.'));
    else lines.push(T('Xem lại nhật ký quan sát bên dưới trước khi chốt tuần tiếp theo.', "Review the log below before locking in next week."));
    return lines.join('\n');
  }

  function buildConfig() {
    var b = G() || {};
    var R = b.RIVALS || [], s = b.S;
    var cap = b.cap;
    var capImg = (cap && cap.img) || 'assets/character/team/minh-long-cut.webp';
    var capName = (cap && cap.name) || T('Đội bạn', 'Your team');
    var npcs = R.map(function (r, i) {
      return { id: 'r' + i, img: r.img, icon: r.icon, accent: r.accent, name: r.name, x: 360 + i * 340, y: 600,
        talk: function (api) {
          if (window.BPSRivalIntel) { api.close(); window.BPSRivalIntel.showDetail(i); }
          else api.dialogue(r, isEN() ? r.styleEn : r.style, [{ text: 'OK', primary: true, onPick: api.close }]);
        } };
    });
    return {
      title: T('🏯 Bến đậu thương hồ', '🏯 The Trader\'s Mooring'),
      subtitle: T('Bến Phù Sa', 'Bến Phù Sa'),
      hint: T('WASD / mũi tên / joystick / chạm sàn để đi. Đến gần rồi bấm <b>E</b> hoặc chạm để nói.', 'WASD / arrows / joystick / tap the floor to move. Get close and press <b>E</b> or tap to interact.'),
      exitLabel: T('Rời bến ▸', 'Leave the wharf ▸'),
      byeLabel: T('Cảm ơn, tôi đi tiếp.', 'Thanks, moving on.'),
      width: 1400, height: 900,
      decor: [
        { x: 160, y: 20, w: 200, h: 130, img: 'assets/illustrations/game/river-worldmap.webp' },
        { x: 1040, y: 20, w: 200, h: 130, img: 'assets/illustrations/game/mekong-capital.webp' },
      ],
      player: { img: capImg, name: capName, x: 700, y: 760 },
      npcs: npcs,
      stations: [
        { id: 'shop', icon: '🛍️', art: 'assets/illustrations/game/celebrate-shop.webp', name: T('Cửa hàng', 'Shop'), x: 420, y: 380,
          onOpen: function (api) { api.exit(); var s2 = G() && G().S; if (s2 && !s2.shopOpen && typeof window.ftToggleShop === 'function') window.ftToggleShop();
            var el = $('ft-shop-card'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } },
        { id: 'notebook', icon: '📓', art: 'assets/illustrations/game/paths-compass.webp', name: T('Nhật ký thương hồ', "Trader's Journal"), x: 700, y: 380,
          onOpen: function (api) { api.dialogue({ name: T('Nhật ký thương hồ', "Trader's Journal"), icon: '📓', art: 'assets/illustrations/game/paths-compass.webp', station: true }, notebookText(), [{ text: T('Đóng', 'Close'), primary: true, onPick: api.close }]); } },
        { id: 'rules', icon: '📜', art: 'assets/illustrations/strategy-notes-podium.webp', name: T('Luật chơi', 'Rules'), x: 980, y: 380,
          onOpen: function (api) { api.dialogue({ name: T('Luật chơi', 'Rules'), icon: '📜', art: 'assets/illustrations/strategy-notes-podium.webp', station: true }, rulesText(), [{ text: T('Đã hiểu', 'Got it'), primary: true, onPick: api.close }]); } },
      ],
    };
  }

  function mountEntry() {
    if ($('bps-hub-enter')) return;
    var anchor = $('ft-rival-cards');
    if (!anchor) return;
    var btn = document.createElement('button');
    btn.id = 'bps-hub-enter'; btn.type = 'button'; btn.style.position = 'relative';
    btn.className = 'clay-btn w-full bg-deep-teal text-white font-display font-extrabold py-2.5 text-xs mt-3';
    btn.textContent = T('🏯 Ra bến gặp đối thủ', '🏯 Visit the wharf');
    btn.onclick = function () { clearNew(); window.ClayHub.open(buildConfig()); };
    anchor.insertAdjacentElement('afterend', btn);
  }
  var tries = 0;
  (function wait() { if ($('ft-rival-cards')) mountEntry(); if (++tries < 40) setTimeout(wait, 250); })();

  // Chấm cam nhắc "có tin mới" trên nút ra bến sau mỗi tuần chốt xong –
  // khuyến khích học viên chủ động ghé kiểm tra đối thủ thay vì chỉ bấm lướt
  // qua các tuần. Tắt khi ra bến. Thuần hiển thị, không đổi điểm số.
  function markNew() {
    var btn = $('bps-hub-enter'); if (!btn || $('bps-hub-dot')) return;
    var dot = document.createElement('span'); dot.id = 'bps-hub-dot';
    dot.style.cssText = 'position:absolute;top:-4px;right:-4px;width:9px;height:9px;border-radius:50%;background:#fda127;box-shadow:0 0 0 2px #fff';
    btn.appendChild(dot);
  }
  function clearNew() { var dot = $('bps-hub-dot'); if (dot) dot.remove(); }

  window.BPSHub = { open: function () { clearNew(); window.ClayHub.open(buildConfig()); }, markNew: markNew };
})();
