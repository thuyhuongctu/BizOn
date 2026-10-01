/* Bến Phù Sa – "Phòng đàm phán": luyện đàm phán với khách sỉ muốn mua số
 * lượng lớn, dùng js/negotiate.js (engine dùng chung 3 game). Nạp SAU
 * js/negotiate.js. Gắn nút "🤝 Đàm phán" cạnh khung thẻ đối thủ. Dùng được
 * ở cả bản 2D (ben-phu-sa.html) và 3D (ben-phu-sa-3d.html) vì nội dung tĩnh,
 * không đọc state riêng của trang. Thuần luyện tập, không ảnh hưởng doanh
 * thu/điểm số.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function () {
  var isEN = function () { try { return (localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  function T(vi, en) { return isEN() ? en : vi; }
  var $ = function (id) { return document.getElementById(id); };

  function buildConfig() {
    return {
      id: 'bps-khachsi',
      title: T('Phòng đàm phán', 'Negotiation Room'),
      subtitle: T('Bến Phù Sa', 'Bến Phù Sa'),
      scenario: T('Một chủ vựa muốn đặt mua số lượng lớn hàng của bạn mỗi tuần, với điều kiện giá phải mềm hơn giá bán lẻ bình thường.', 'A wholesale buyer wants to order a large quantity from you every week, on the condition that the price is lower than your usual retail price.'),
      partner: { name: T('Khách sỉ', 'Wholesale Buyer'), icon: '🧺', accent: '#fda127' },
      openingLines: [
        T('Chào bạn ơi, tôi muốn lấy hàng số lượng lớn mỗi tuần cho vựa của tôi. Giá sỉ bạn tính sao?', "Hey there, I'd like to buy in bulk every week for my stall. What's your wholesale price?"),
        T('Tôi mua đều đặn lâu dài đó nha, bạn tính giá tốt hơn một chút được không?', "I'll be a regular long-term buyer – can you give me a bit of a better price?"),
      ],
      replyLines: [
        T('Vậy mỗi tuần tôi cần khoảng bao nhiêu để chắc chắn có hàng? Giao tận nơi hay tôi tự lấy?', 'So how much do I need to order each week to be sure of supply? Do you deliver or do I pick up?'),
        T('Về tiền nong, tôi muốn trả sau khi bán hết, cuối tuần gom lại trả một lần. Được không?', 'For payment, I\'d like to pay after I sell it all – settle up once at the end of the week. Is that okay?'),
        T('Nếu hàng không đều hoặc chất lượng không ổn, tôi sẽ tìm mối khác đó nha, nhớ giữ chất lượng.', "If the supply isn't steady or the quality slips, I'll look for another source – please keep the quality up."),
        T('Thôi được rồi, mình chốt lại cho rõ ràng đi, kẻo lát quên.', "Alright, let's lock the details down clearly so we don't forget."),
      ],
      fields: [
        { id: 'price', label: T('Giá sỉ (mỗi đơn vị)', 'Wholesale price (per unit)'), placeholder: T('vd: thấp hơn giá lẻ 15%', 'e.g. 15% below retail') },
        { id: 'qty', label: T('Số lượng mỗi tuần', 'Quantity per week'), placeholder: T('vd: 50 phần', 'e.g. 50 portions') },
        { id: 'delivery', label: T('Giao hàng hay tự lấy?', 'Delivery or pickup?'), placeholder: '' },
        { id: 'payment', label: T('Hình thức thanh toán', 'Payment method'), placeholder: T('vd: trả cuối tuần', 'e.g. settle weekly') },
        { id: 'note', label: T('Ghi chú khác', 'Other notes'), placeholder: '' },
      ],
      exitLabel: T('Đóng', 'Close'),
    };
  }

  function mountEntry() {
    if ($('bps-negot-enter')) return;
    var anchor = $('bps-hub-enter') || $('ft-rival-cards');
    if (!anchor) return;
    var btn = document.createElement('button');
    btn.id = 'bps-negot-enter'; btn.type = 'button';
    btn.className = 'clay-btn w-full bg-primary text-white font-display font-extrabold py-2.5 text-xs mt-2';
    btn.textContent = T('🤝 Đàm phán với khách sỉ', '🤝 Negotiate with a wholesale buyer');
    btn.onclick = function () { window.Negotiate.open(buildConfig()); };
    anchor.insertAdjacentElement('afterend', btn);
  }
  var tries = 0;
  (function wait() { mountEntry(); if (!$('bps-negot-enter') && ++tries < 40) setTimeout(wait, 250); })();

  window.BPSNegotiate = { open: function () { window.Negotiate.open(buildConfig()); } };
})();
