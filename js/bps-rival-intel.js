/* Bến Phù Sa – "Hồ sơ tình báo" 3 đối thủ (Alpha Dynamics / Mekong Ventures /
 * Star Clay Co.): dãy thẻ đối thủ có ảnh + thanh thị phần sống (cạnh
 * ft-scores), modal xem hồ sơ (động cơ/điểm yếu/cách đối phó) khi chạm vào
 * thẻ, và màn "đua" ngắn xếp hạng 4 đội sau mỗi tuần. Module độc lập, không
 * đọc trực tiếp biến S của trang chủ – trang chủ (ben-phu-sa.html /
 * ben-phu-sa-3d.html) gọi vào với đúng số liệu cần, giống hệt quy ước của
 * js/bp-rival-intel.js / js/bp-tutorial.js. Thuần hiển thị, không ảnh hưởng
 * doanh thu/điểm số. © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };
  var f1 = function (v) { return (Math.round(v * 10) / 10).toLocaleString(isEN() ? 'en-US' : 'vi-VN', { maximumFractionDigits: 1 }); };
  function MU() { return T('triệu ₫', 'mn ₫'); }

  // Hồ sơ tình báo tĩnh (động cơ/điểm yếu/cách đối phó) – khớp tên với mảng
  // RIVALS sống trong ben-phu-sa.html, nội dung chuyển thể từ tính cách đã
  // thiết lập cho 3 đối thủ này ở Bật Nghiệp (js/app.js AI_OPPONENTS_LIST),
  // viết lại cho bối cảnh buôn bán theo tuần ở Bến Phù Sa.
  var INTEL = {
    'Alpha Dynamics': {
      motto: function () { return T('Dò nhanh, dồn mạnh – nã hết vốn vào tuần có vẻ ngon nhất.', 'Scout fast, go all-in – pour everything into the week that looks juiciest.'); },
      weakness: function () { return T('Dồn hết vào một tuần đoán sai là mất trắng cơ hội – không có kế hoạch dự phòng khi đoán trật.', 'Betting everything on one misjudged week wastes the whole opportunity – no backup plan if the guess is wrong.'); },
      counter: function () { return T('Giữ nhịp thử nghiệm đều bằng gánh hàng rong lâu hơn họ; khi họ "dồn lực" vào một khu, né khu đó để khỏi bị chia khách.', 'Keep steadily scouting with the street cart longer than they do; when they "go all-in" on a spot, avoid it so you don\'t split customers with them.'); },
    },
    'Mekong Ventures': {
      motto: function () { return T('Chọn một khu quen thuộc rồi bám trụ suốt mùa, không đổi.', 'Pick one familiar spot and stick with it all season, never switching.'); },
      weakness: function () { return T('Không bao giờ thử khu mới nên bỏ lỡ những tuần cao điểm ở nơi khác.', 'Never tries a new spot, so it misses peak weeks happening elsewhere.'); },
      counter: function () { return T('Tìm những tuần/khu mà họ không bén mảng tới – đó luôn là khoảng trống của họ.', 'Look for weeks/spots they never show up at – that gap is always open.'); },
    },
    'Star Clay Co.': {
      motto: function () { return T('Xây hình ảnh bằng cách xuất hiện đều đặn, luân phiên giữa hai khu quen.', 'Build an image by showing up reliably, rotating between two familiar spots.'); },
      weakness: function () { return T('Luân phiên cố định nên dễ đoán – và không tận dụng được khu thứ ba, thứ tư.', 'The fixed rotation is predictable – and leaves a third or fourth spot untouched.'); },
      counter: function () { return T('Theo dõi lịch luân phiên của họ 1–2 tuần rồi né đúng tuần họ ghé khu bạn định bán.', 'Watch their rotation for 1–2 weeks, then avoid the exact week they visit the spot you want to sell at.'); },
    },
  };
  // Bản chơi nhóm v8 (ben-phu-sa-v8.html) đặt tên đối thủ khác (Ghe Ba Lẹ /
  // Chú Sáu Bến Cũ / Cô Bảy Sen Hồng) nhưng cùng 3 tính cách/thứ tự với bản
  // 2D – trỏ thẳng vào cùng nội dung hồ sơ, tránh trùng lặp.
  INTEL['Ghe Ba Lẹ'] = INTEL['Alpha Dynamics'];
  INTEL['Chú Sáu Bến Cũ'] = INTEL['Mekong Ventures'];
  INTEL['Cô Bảy Sen Hồng'] = INTEL['Star Clay Co.'];
  var TAUNTS_AHEAD = [
    function (leaderName) { return T('Bạn đang tạm dẫn đầu cả bến! Giữ nhịp này.', "You're currently leading the whole wharf! Keep this pace."); },
    function (leaderName) { return T('Khoảng cách đang có lợi cho bạn – đừng chủ quan, tuần sau có thể đổi khác.', 'The gap favors you for now – stay sharp, next week could flip it.'); },
  ];
  var TAUNTS_BEHIND = [
    function (leaderName) { return T(leaderName + ' đang dẫn đầu. Thử một khu họ ít ghé để tránh đụng độ.', leaderName + ' is in the lead. Try a spot they rarely visit to dodge the clash.'); },
    function (leaderName) { return T('Bạn đang bị ' + leaderName + ' bỏ xa hơn – đã đến lúc đổi món hàng hoặc địa điểm.', "You're falling further behind " + leaderName + ' – time to switch up your product or location.'); },
  ];

  function pct(v, max) { return Math.max(4, v / max * 100); }

  // Nhớ lại lần render thẻ gần nhất, để showDetail(i) gọi từ onclick (không
  // tiện truyền nguyên mảng rival qua chuỗi HTML) vẫn có đủ dữ liệu.
  var lastRivals = [], lastMyTotal = 0;

  function cardsHtml(myTotal, rivals) {
    lastRivals = rivals; lastMyTotal = myTotal;
    var max = Math.max(myTotal, 1);
    rivals.forEach(function (r) { if (r.total > max) max = r.total; });
    var rank = rivals.filter(function (r) { return r.total > myTotal; }).length;
    var statusLine = rank === 0 ? '🏆 ' + T('Bạn đang dẫn đầu cả bến!', 'You are leading the whole wharf!')
      : '🌊 ' + T('Bạn đang xếp hạng ' + (rank + 1) + '/4.', 'You are ranked ' + (rank + 1) + '/4.');
    return '<p class="text-[10px] font-extrabold uppercase tracking-wide opacity-50 mb-1">⚔️ ' + T('Cuộc đua ở Bến Phù Sa', 'The race at Bến Phù Sa') + '</p>' +
      '<p class="text-[13px] font-extrabold mb-2">' + statusLine + '</p>' +
      rivals.map(function (r, i) {
        return '<button type="button" onclick="BPSRivalIntel.showDetail(' + i + ')" class="w-full text-left flex items-center gap-2.5 mb-1.5">' +
          '<img src="' + r.img + '" alt="" class="w-9 h-9 rounded-full object-cover shrink-0" style="background:' + (r.accent || '#006687') + '22">' +
          '<div class="flex-1 min-w-0">' +
          '<p class="text-[11px] font-extrabold truncate">' + r.icon + ' ' + r.name + '</p>' +
          '<div class="h-2 rounded-full bg-deep-teal/10 overflow-hidden mt-0.5"><div class="h-full" style="width:' + pct(r.total, max) + '%;background:' + (r.accent || '#006687') + '"></div></div>' +
          '</div>' +
          '<p class="text-[10.5px] font-bold opacity-60 shrink-0">' + f1(r.total) + ' ' + T('tr', 'mn') + '</p></button>';
      }).join('') +
      '<p class="text-[9.5px] opacity-40 mt-1">' + T('Ước tính minh họa – không tính vào điểm số. Chạm vào một đối thủ để xem hồ sơ tình báo.', "Illustrative estimate – not part of your score. Tap a rival to see their intel profile.") + '</p>';
  }

  function closeOverlay(id) { var ov = $(id); if (ov) ov.remove(); }

  window.BPSRivalIntel = {
    cardsHtml: cardsHtml,

    showDetail: function (i) {
      if ($('bps-rival-detail')) return;
      var r = lastRivals[i];
      if (!r) return;
      var intel = INTEL[r.name] || { motto: function () { return ''; }, weakness: function () { return ''; }, counter: function () { return ''; } };
      var ov = document.createElement('div');
      ov.id = 'bps-rival-detail';
      ov.style.cssText = 'position:fixed;inset:0;z-index:96;background:rgba(2,25,28,.82);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto';
      ov.innerHTML = '<div class="clay-card p-6" style="max-width:420px;width:100%;max-height:85vh;overflow:auto">' +
        '<div class="flex items-center gap-3 mb-3">' +
        '<img src="' + r.img + '" class="w-14 h-14 rounded-full object-cover" style="background:' + (r.accent || '#006687') + '22">' +
        '<div class="flex-1"><p class="font-display font-extrabold text-deep-teal text-lg">' + r.icon + ' ' + r.name + '</p>' +
        '<p class="text-[11px] font-bold" style="color:' + (r.accent || '#006687') + '">' + (isEN() ? r.styleEn : r.style) + '</p></div>' +
        '<button type="button" onclick="BPSRivalIntel.closeDetail()" class="text-xl leading-none opacity-50">✕</button></div>' +
        '<p class="text-[11px] font-extrabold uppercase tracking-wide opacity-50 mb-1">💬 ' + T('Động cơ', 'Motto') + '</p>' +
        '<p class="text-[13px] italic mb-3">«' + intel.motto() + '»</p>' +
        '<p class="text-[11px] font-extrabold uppercase tracking-wide opacity-50 mb-1">⚠️ ' + T('Điểm yếu', 'Weakness') + '</p>' +
        '<p class="text-[12.5px] mb-3">' + intel.weakness() + '</p>' +
        '<p class="text-[11px] font-extrabold uppercase tracking-wide opacity-50 mb-1">🧭 ' + T('Cách đối phó', 'Counter-strategy') + '</p>' +
        '<p class="text-[12.5px] mb-4">' + intel.counter() + '</p>' +
        '<button type="button" onclick="BPSRivalIntel.closeDetail()" class="clay-btn w-full bg-primary text-white font-display font-extrabold py-3">' + T('Đóng', 'Close') + '</button>' +
        '</div>';
      ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay('bps-rival-detail'); });
      document.body.appendChild(ov);
    },
    closeDetail: function () { closeOverlay('bps-rival-detail'); },

    // Màn "đua" ngắn sau mỗi tuần – xếp hạng 4 đội. myTotal/rivals là số liệu
    // MỚI của tuần vừa chốt. Không tự động đóng để người chơi có thời gian đọc.
    showArena: function (myTotal, rivals, week) {
      if ($('bps-rival-arena')) return;
      var rows = [{ img: null, name: T('Đội bạn', 'Your team'), total: myTotal, me: true }].concat(rivals.map(function (r) {
        return { img: r.img, name: r.icon + ' ' + r.name, total: r.total, accent: r.accent };
      }));
      rows.sort(function (a, b) { return b.total - a.total; });
      var myRank = rows.findIndex(function (r) { return r.me; });
      var ahead = myRank === 0;
      var leader = rows[0].me ? (rows[1] ? rows[1].name : '') : rows[0].name;
      var pool = ahead ? TAUNTS_AHEAD : TAUNTS_BEHIND;
      var taunt = pool[week % pool.length](leader);
      var MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];
      var max = Math.max.apply(null, rows.map(function (r) { return r.total; }).concat([1]));
      var ov = document.createElement('div');
      ov.id = 'bps-rival-arena';
      ov.style.cssText = 'position:fixed;inset:0;z-index:96;background:rgba(2,25,28,.82);display:flex;align-items:center;justify-content:center;padding:16px';
      ov.innerHTML = '<div class="clay-card p-6" style="max-width:380px;width:100%;text-align:center">' +
        '<p class="text-[11px] font-extrabold uppercase tracking-wide opacity-50 mb-3">🏁 ' + T('Sau tuần ' + week, 'After week ' + week) + '</p>' +
        '<div class="text-left mb-4">' + rows.map(function (r, i) {
          return '<div class="flex items-center gap-2 mb-1.5' + (r.me ? '' : '') + '">' +
            '<span class="text-sm shrink-0">' + MEDALS[i] + '</span>' +
            '<span class="text-[11px] font-extrabold shrink-0" style="width:92px' + (r.me ? ';color:#fda127' : '') + '">' + r.name + '</span>' +
            '<div class="flex-1 h-2 rounded-full bg-deep-teal/10 overflow-hidden"><div class="h-full" style="width:' + pct(r.total, max) + '%;background:' + (r.me ? '#006687' : (r.accent || '#888')) + '"></div></div>' +
            '<span class="text-[10.5px] font-bold opacity-60 shrink-0 w-12 text-right">' + f1(r.total) + '</span></div>';
        }).join('') + '</div>' +
        '<p class="text-[12.5px] font-bold mb-4">' + taunt + '</p>' +
        '<button type="button" onclick="BPSRivalIntel.closeArena()" class="clay-btn w-full bg-primary text-white font-display font-extrabold py-3">' + T('Tiếp tục →', 'Continue →') + '</button>' +
        '</div>';
      ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay('bps-rival-arena'); });
      document.body.appendChild(ov);
    },
    closeArena: function () { closeOverlay('bps-rival-arena'); },
  };
})();
