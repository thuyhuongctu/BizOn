/* BizOn Bật Nghiệp – "Phòng đàm phán": luyện đàm phán với nhà đầu tư thiên
 * thần về vốn góp, dùng js/negotiate.js (engine dùng chung 3 game). Nạp SAU
 * js/negotiate.js. Gắn nút cạnh thẻ công ty ở Trang chủ. Nội dung tĩnh,
 * không đọc state riêng của trang. Thuần luyện tập, không ảnh hưởng doanh
 * thu/điểm số.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };

  function buildConfig() {
    return {
      id: 'bn-investor',
      title: T('Phòng đàm phán', 'Negotiation Room'),
      subtitle: T('BizOn Bật Nghiệp', 'BizOn Bật Nghiệp'),
      scenario: T('Một nhà đầu tư thiên thần quan tâm rót vốn cho đội của bạn, nhưng muốn bàn rõ định giá và tỷ lệ cổ phần trước khi ký.', 'An angel investor is interested in funding your team, but wants to negotiate valuation and equity before signing.'),
      partner: { name: T('Nhà đầu tư thiên thần', 'Angel Investor'), icon: '💼', accent: '#1f9a63' },
      openingLines: [
        T('Chào đội, tôi thích sản phẩm của các bạn. Các bạn đang định giá công ty bao nhiêu, và cần bao nhiêu vốn?', "Hi team, I like your product. What valuation are you going with, and how much capital do you need?"),
        T('Tôi đã xem báo cáo của các bạn. Trước khi rót vốn, tôi muốn hiểu rõ tỷ lệ cổ phần và kế hoạch dùng tiền.', "I've looked at your numbers. Before I invest, I want to understand the equity split and how you'll use the funds."),
      ],
      replyLines: [
        T('Được, vậy số vốn cụ thể là bao nhiêu, và đổi lại tôi nhận bao nhiêu phần trăm cổ phần?', 'Okay, so what\'s the exact amount, and what equity percentage do I get in return?'),
        T('Tôi cần biết tiền sẽ dùng vào việc gì cụ thể – mở rộng sản xuất, marketing, hay tuyển người?', 'I need to know specifically what the money is for – scaling production, marketing, or hiring?'),
        T('Tôi muốn có mốc tiến độ rõ ràng để theo dõi khoản đầu tư này. Các bạn cam kết gì?', 'I\'d like clear milestones to track this investment. What are you committing to?'),
        T('Nghe hợp lý đấy. Khi hai bên đã rõ ràng, hãy chốt lại các điều khoản để tôi xem qua.', "That sounds reasonable. Once we're aligned, lock in the terms so I can review."),
      ],
      fields: [
        { id: 'amount', label: T('Số vốn đầu tư', 'Investment amount'), placeholder: T('vd: 500 triệu ₫', 'e.g. 500m₫') },
        { id: 'equity', label: T('Tỷ lệ cổ phần đổi lại', 'Equity in return'), placeholder: T('vd: 10%', 'e.g. 10%') },
        { id: 'usage', label: T('Mục đích sử dụng vốn', 'Use of funds'), placeholder: T('vd: mở rộng sản xuất, marketing', 'e.g. scale production, marketing') },
        { id: 'milestone', label: T('Mốc tiến độ cam kết', 'Committed milestones'), placeholder: T('vd: đạt 1.000 đơn hàng trong 6 tháng', 'e.g. 1,000 orders within 6 months') },
        { id: 'note', label: T('Ghi chú khác', 'Other notes'), placeholder: '' },
      ],
      exitLabel: T('Đóng', 'Close'),
    };
  }

  function mountEntry() {
    if ($('bn-negot-enter')) return;
    var anchor = $('company-card');
    if (!anchor) return;
    var btn = document.createElement('button');
    btn.id = 'bn-negot-enter'; btn.type = 'button';
    btn.className = 'clay-card w-full p-3 mb-4 flex items-center gap-3 text-left';
    btn.style.cssText = 'display:flex;align-items:center;gap:12px';
    btn.innerHTML = '<span style="width:40px;height:40px;border-radius:14px;background:rgba(31,154,99,.12);display:flex;align-items:center;justify-content:center;font-size:20px">🤝</span>' +
      '<span style="flex:1"><b style="display:block;color:#006687;font-size:13px">' + T('Phòng đàm phán', 'Negotiation Room') + '</b><span style="font-size:11px;color:rgba(0,51,55,.55)">' + T('Luyện đàm phán với nhà đầu tư thiên thần.', 'Practice negotiating with an angel investor.') + '</span></span>' +
      '<span style="font-weight:900;color:#006687">➜</span>';
    btn.onclick = function () { window.Negotiate.open(buildConfig()); };
    anchor.insertAdjacentElement('afterend', btn);
  }
  var tries = 0;
  (function wait() { mountEntry(); if (!$('bn-negot-enter') && ++tries < 40) setTimeout(wait, 250); })();

  window.BNNegotiate = { open: function () { window.Negotiate.open(buildConfig()); } };
})();
