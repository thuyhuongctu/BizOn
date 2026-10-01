/* Hộ Chiếu Thương Hiệu – "Hồ sơ tình báo" đối thủ Kim Long Exports: thẻ đối
 * thủ có ảnh + thanh thị phần sống (thay raceHtml() đơn giản), modal xem hồ
 * sơ (động cơ/điểm yếu/cách đối phó) khi chạm vào thẻ, và màn "đua" ngắn sau
 * mỗi quý. Module độc lập, không đọc trực tiếp biến S của trang chủ – trang
 * chủ (brand-passport.html / Ho Chieu Thuong Hieu 3D.html) gọi vào với đúng
 * số liệu cần, giống hệt quy ước của js/bp-tutorial.js. Thuần hiển thị,
 * không ảnh hưởng doanh thu/điểm số. © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };
  var f1 = function (v) { return (Math.round(v * 10) / 10).toLocaleString(isEN() ? 'en-US' : 'vi-VN', { maximumFractionDigits: 1 }); };
  function TY() { return T(' tỷ', ' bn'); }

  // Định dạng "hồ sơ CEO đối thủ" theo đúng mẫu đã dùng ở global.html
  // (RIVAL_CEOS: tên CEO + nhãn ngắn IN HOA + điểm mạnh/điểm yếu/cách khắc
  // chế) – giữ nhất quán phong cách trong toàn hệ sinh thái BizOn.
  var RIVAL = {
    name: 'Kim Long Exports', icon: '🐉', img: 'assets/character/firms/kim-long-rival-cut.webp', accent: '#c0392b',
    ceo: function () { return T('Lương Gia Long', 'Luong Gia Long'); },
    tag: function () { return T('THẦN TỐC & DÀN TRẢI', 'BLITZ & SPREAD THIN'); },
    style: function () { return T('Mở rộng thần tốc', 'Blitz expansion'); },
    motto: function () { return T('Thần tốc mở rộng, chiếm chỗ trước khi đối thủ kịp vào.', 'Expand fast – claim ground before anyone else arrives.'); },
    weakness: function () { return T('Dàn trải cùng lúc nhiều thị trường khiến năng lực thích ứng ở từng nơi khá mỏng – thị trường đòi tiêu chuẩn nghiêm hoặc cần lòng tin xây chậm dễ làm họ hụt hơi.', 'Spreading thin across many markets means weak depth anywhere – strict-standards markets or ones that need slow trust-building trip them up.'); },
    counter: function () { return T('Vào sớm những thị trường có rào cản cao (tiêu chuẩn nghiêm, chưa FTA) trước khi họ bén rễ, và xây uy tín ở nơi lòng tin quan trọng hơn tốc độ.', 'Enter high-barrier markets (strict standards, no FTA) early before they take root, and build reputation where trust matters more than speed.'); },
  };
  var TAUNTS_AHEAD = [
    function () { return T('Bạn đang tạm dẫn trước – đừng chủ quan, ' + RIVAL.name + ' có thể mở rộng bất cứ quý nào.', "You're ahead for now – stay sharp, " + RIVAL.name + ' can expand any quarter.'); },
    function () { return T('Khoảng cách đang có lợi cho bạn. Giữ nhịp này.', "The gap favors you right now. Keep this pace."); },
  ];
  var TAUNTS_BEHIND = [
    function () { return T(RIVAL.name + ' đang bứt lên. Cân nhắc một thị trường có rào cản cao để họ khó đuổi theo.', RIVAL.name + ' is pulling ahead. Consider a high-barrier market where they struggle to follow.'); },
    function () { return T('Khoảng cách đang nới rộng – đã đến lúc tăng tốc hoặc đổi hướng.', 'The gap is widening – time to speed up or change direction.'); },
  ];

  function barsHtml(mine, theirs) {
    var max = Math.max(mine, theirs, 1);
    return '<div class="flex items-center gap-2 text-[11px] font-bold mt-2">' +
      '<span class="w-16 shrink-0">🏢 ' + T('Bạn', 'You') + '</span>' +
      '<div class="flex-1 h-2.5 rounded-full bg-deep-teal/10 overflow-hidden"><div class="h-full bg-primary" style="width:' + Math.max(4, mine / max * 100) + '%"></div></div>' +
      '<span class="w-16 text-right shrink-0">' + f1(mine) + TY() + '</span></div>' +
      '<div class="flex items-center gap-2 text-[11px] font-bold mt-1">' +
      '<span class="w-16 shrink-0"><img src="' + RIVAL.img + '" class="w-4 h-4 rounded-full inline-block object-cover align-middle" style="background:' + RIVAL.accent + '22">' + ' ' + T('Đối thủ', 'Rival') + '</span>' +
      '<div class="flex-1 h-2.5 rounded-full bg-deep-teal/10 overflow-hidden"><div class="h-full" style="width:' + Math.max(4, theirs / max * 100) + '%;background:' + RIVAL.accent + '"></div></div>' +
      '<span class="w-16 text-right shrink-0">' + f1(theirs) + TY() + '</span></div>';
  }

  function cardHtml(mine, theirs) {
    var ahead = mine >= theirs;
    var statusLine = ahead ? '🏆 ' + T('Bạn đang dẫn trước!', 'You are ahead!')
      : '🐉 ' + RIVAL.name + ' ' + T('đang dẫn trước bạn.', 'is ahead of you.');
    return '<button type="button" onclick="BPRivalIntel.showDetail()" class="w-full text-left flex items-center gap-3">' +
      '<img src="' + RIVAL.img + '" alt="" class="w-11 h-11 rounded-full object-cover shrink-0" style="background:' + RIVAL.accent + '22;box-shadow:0 4px 10px rgba(0,0,0,.15)">' +
      '<div class="flex-1 min-w-0">' +
      '<p class="text-[10px] font-extrabold uppercase tracking-wide opacity-50">🆚 ' + T('Cuộc đua với ', 'The race with ') + RIVAL.name + '</p>' +
      '<p class="text-[13px] font-extrabold">' + statusLine + '</p></div>' +
      '<p class="text-[10px] font-bold opacity-45 shrink-0">' + T('Hồ sơ ›', 'Intel ›') + '</p></button>' +
      barsHtml(mine, theirs) +
      '<p class="text-[9.5px] opacity-40 mt-1.5">' + T('Ước tính minh họa – không tính vào điểm số. Chạm ảnh để xem hồ sơ tình báo.', "Illustrative estimate – not part of your score. Tap the photo for intel.") + '</p>';
  }

  function closeOverlay(id) { var ov = $(id); if (ov) ov.remove(); }

  window.BPRivalIntel = {
    cardHtml: cardHtml,

    showDetail: function (mine, theirs) {
      if ($('bp-rival-detail')) return;
      var ov = document.createElement('div');
      ov.id = 'bp-rival-detail';
      ov.style.cssText = 'position:fixed;inset:0;z-index:96;background:rgba(2,25,28,.82);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto';
      ov.innerHTML = '<div class="clay-card p-6" style="max-width:420px;width:100%;max-height:85vh;overflow:auto">' +
        '<div class="flex items-center gap-3 mb-3">' +
        '<img src="' + RIVAL.img + '" class="w-14 h-14 rounded-full object-cover" style="background:' + RIVAL.accent + '22">' +
        '<div class="flex-1"><p class="font-display font-extrabold text-deep-teal text-lg">' + RIVAL.icon + ' ' + RIVAL.name + '</p>' +
        '<p class="text-[11px] font-bold" style="color:' + RIVAL.accent + '">' + RIVAL.style() + '</p></div>' +
        '<button type="button" onclick="BPRivalIntel.closeDetail()" class="text-xl leading-none opacity-50">✕</button></div>' +
        '<p class="text-[11px] font-extrabold uppercase tracking-wide opacity-50 mb-1">💬 ' + T('Động cơ', 'Motto') + '</p>' +
        '<p class="text-[13px] italic mb-3">«' + RIVAL.motto() + '»</p>' +
        '<p class="text-[11px] font-extrabold uppercase tracking-wide opacity-50 mb-1">⚠️ ' + T('Điểm yếu', 'Weakness') + '</p>' +
        '<p class="text-[12.5px] mb-3">' + RIVAL.weakness() + '</p>' +
        '<p class="text-[11px] font-extrabold uppercase tracking-wide opacity-50 mb-1">🧭 ' + T('Cách đối phó', 'Counter-strategy') + '</p>' +
        '<p class="text-[12.5px] mb-4">' + RIVAL.counter() + '</p>' +
        (mine != null ? barsHtml(mine, theirs) : '') +
        '<button type="button" onclick="BPRivalIntel.closeDetail()" class="clay-btn w-full bg-primary text-white font-display font-extrabold py-3 mt-4">' + T('Đóng', 'Close') + '</button>' +
        '</div>';
      ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay('bp-rival-detail'); });
      document.body.appendChild(ov);
    },
    closeDetail: function () { closeOverlay('bp-rival-detail'); },

    // Màn "đua" ngắn sau mỗi quý – mine/theirs là số liệu MỚI của quý vừa chốt.
    // Tự đóng khi bấm nút hoặc bấm ra ngoài; không tự động đóng để người chơi
    // có thời gian đọc, nhất quán với các modal khác trong game (luật chơi,
    // hướng dẫn).
    showArena: function (mine, theirs, q) {
      if ($('bp-rival-arena')) return;
      var ahead = mine >= theirs;
      var max = Math.max(mine, theirs, 1);
      var pool = ahead ? TAUNTS_AHEAD : TAUNTS_BEHIND;
      var taunt = pool[q % pool.length]();
      var ov = document.createElement('div');
      ov.id = 'bp-rival-arena';
      ov.style.cssText = 'position:fixed;inset:0;z-index:96;background:rgba(2,25,28,.82);display:flex;align-items:center;justify-content:center;padding:16px';
      ov.innerHTML = '<div class="clay-card p-6" style="max-width:380px;width:100%;text-align:center">' +
        '<p class="text-[11px] font-extrabold uppercase tracking-wide opacity-50 mb-2">🏁 ' + T('Sau quý ' + q, 'After quarter ' + q) + '</p>' +
        '<div class="flex items-end justify-center gap-6 my-4">' +
        '<div><div class="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl" style="background:rgba(0,102,135,.12)">🏢</div>' +
        '<p class="text-[11px] font-extrabold mt-1">' + T('Bạn', 'You') + '</p><p class="text-xs font-bold">' + f1(mine) + TY() + '</p></div>' +
        '<p class="text-2xl" style="margin-bottom:28px">' + (ahead ? '🏆' : '⚔️') + '</p>' +
        '<div><img src="' + RIVAL.img + '" class="w-16 h-16 rounded-full mx-auto object-cover" style="background:' + RIVAL.accent + '22">' +
        '<p class="text-[11px] font-extrabold mt-1">' + RIVAL.icon + ' ' + RIVAL.name + '</p><p class="text-xs font-bold">' + f1(theirs) + TY() + '</p></div></div>' +
        '<div class="h-2.5 rounded-full bg-deep-teal/10 overflow-hidden flex mb-3">' +
        '<div style="width:' + Math.max(4, mine / max * 100) + '%;background:#006687"></div>' +
        '<div style="width:' + Math.max(4, theirs / max * 100) + '%;background:' + RIVAL.accent + '"></div></div>' +
        '<p class="text-[12.5px] font-bold mb-4">' + taunt + '</p>' +
        '<button type="button" onclick="BPRivalIntel.closeArena()" class="clay-btn w-full bg-primary text-white font-display font-extrabold py-3">' + T('Tiếp tục →', 'Continue →') + '</button>' +
        '</div>';
      ov.addEventListener('click', function (e) { if (e.target === ov) closeOverlay('bp-rival-arena'); });
      document.body.appendChild(ov);
    },
    closeArena: function () { closeOverlay('bp-rival-arena'); },
  };
})();
