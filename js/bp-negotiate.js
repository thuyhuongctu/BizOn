/* Hộ Chiếu Thương Hiệu – "Phòng đàm phán": luyện đàm phán với đại diện nhập
 * khẩu nước ngoài, dùng js/negotiate.js (engine dùng chung 3 game). Nạp SAU
 * js/negotiate.js. Gắn nút "🤝 Đàm phán" cạnh nút Luật chơi/Hướng dẫn. Dùng
 * được ở cả bản 2D (brand-passport.html) và 3D (Ho Chieu Thuong Hieu 3D.html)
 * vì nội dung tĩnh, không đọc state riêng của trang. Thuần luyện tập, không
 * ảnh hưởng doanh thu/điểm số.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };

  function buildConfig() {
    return {
      id: 'bp-importer',
      title: T('Phòng đàm phán', 'Negotiation Room'),
      subtitle: T('Hộ Chiếu Thương Hiệu', 'Brand Passport'),
      scenario: T('Bạn đang đàm phán với một đại diện nhập khẩu nước ngoài, người đang cân nhắc trở thành đối tác phân phối đầu tiên cho sản phẩm của bạn tại thị trường của họ.', 'You are negotiating with a foreign import representative who is considering becoming your product\'s first distribution partner in their market.'),
      partner: { name: T('Đại diện nhập khẩu', 'Import Representative'), icon: '🧑‍💼', accent: '#006687' },
      openingLines: [
        T('Chào bạn, chúng tôi quan tâm đến sản phẩm của bạn, nhưng cần biết rõ hơn về giá và số lượng tối thiểu trước khi bàn tiếp.', "Hello, we're interested in your product, but we need to know more about pricing and minimum order quantity before we go further."),
        T('Thị trường của chúng tôi khá cạnh tranh. Bạn có thể cho tôi biết vì sao nên chọn hợp tác với bạn thay vì đối thủ?', 'Our market is quite competitive. Can you tell me why we should partner with you instead of a competitor?'),
      ],
      replyLines: [
        T('Được, vậy số lượng tối thiểu mỗi lần đặt hàng là bao nhiêu? Và thời gian giao hàng dự kiến?', 'Okay, so what\'s the minimum order quantity per batch? And the expected delivery time?'),
        T('Về thanh toán, chúng tôi muốn trả sau 30 ngày kể từ ngày nhận hàng. Bạn có đồng ý không?', 'On payment, we\'d like 30 days after receipt. Are you okay with that?'),
        T('Nếu lô đầu bán tốt, chúng tôi muốn có quyền độc quyền phân phối trong khu vực. Bạn nghĩ sao?', 'If the first batch sells well, we\'d like exclusive distribution rights in our region. What do you think?'),
        T('Được, tôi nghĩ hai bên đã trao đổi khá đủ. Khi nào sẵn sàng, hãy chốt lại các điều khoản nhé.', "Alright, I think we've covered enough. When you're ready, let's lock in the terms."),
      ],
      fields: [
        { id: 'price', label: T('Giá bán (mỗi đơn vị)', 'Unit price'), placeholder: T('vd: 12 USD/sản phẩm', 'e.g. $12/unit') },
        { id: 'moq', label: T('Số lượng tối thiểu (MOQ)', 'Minimum order quantity'), placeholder: T('vd: 500 sản phẩm', 'e.g. 500 units') },
        { id: 'payment', label: T('Điều khoản thanh toán', 'Payment terms'), placeholder: T('vd: trả trước 50%, 50% sau giao hàng', 'e.g. 50% upfront, 50% on delivery') },
        { id: 'delivery', label: T('Thời gian giao hàng', 'Delivery time'), placeholder: T('vd: 30 ngày', 'e.g. 30 days') },
        { id: 'exclusive', label: T('Quyền độc quyền khu vực?', 'Regional exclusivity?'), placeholder: T('vd: có, trong 12 tháng', 'e.g. yes, for 12 months') },
        { id: 'note', label: T('Ghi chú khác', 'Other notes'), placeholder: '' },
      ],
      exitLabel: T('Đóng', 'Close'),
    };
  }

  function mountEntry() {
    if ($('bp-negot-enter')) return;
    var rulesBtn = document.querySelector('[onclick="bpShowRules()"]');
    var anchor = rulesBtn && rulesBtn.parentNode;
    if (!anchor) return;
    var btn = document.createElement('button');
    btn.id = 'bp-negot-enter'; btn.type = 'button'; btn.className = 'text-[11px] font-bold text-deep-teal/50';
    btn.title = T('Đàm phán', 'Negotiate'); btn.textContent = T('🤝 Đàm phán', '🤝 Negotiate');
    btn.onclick = function () { window.Negotiate.open(buildConfig()); };
    anchor.insertBefore(btn, anchor.firstChild);
  }
  var tries = 0;
  (function wait() { mountEntry(); if (!$('bp-negot-enter') && ++tries < 40) setTimeout(wait, 250); })();

  window.BPNegotiate = { open: function () { window.Negotiate.open(buildConfig()); } };
})();
