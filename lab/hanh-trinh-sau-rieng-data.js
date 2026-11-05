/* Hành Trình Một Trái Sầu Riêng (Durian Journey) – trang cuộn kể chuyện của Hộ Chiếu Sầu Riêng.
   © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
   Dữ liệu 7 chặng, thuần, chạy được trong trình duyệt và Node. Mỗi chặng trỏ tới dữ kiện có nguồn trong
   DurianData.facts của Hộ Chiếu (lab/ho-chieu-sau-rieng-data.js, chỉ đọc) – không chép lại, không thêm số mới.
   «x» là vị trí của chặng trên con đường trong cảnh 3D (đơn vị cảnh, tăng dần từ vườn tới chợ). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HanhTrinhData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const CHANG = [
    { id: 'vuon', x: 0, anh: 'durian/chang-1-vuon-puc.webp', dk: ['codes', 'offPremium'],
      vi: { ten: 'Vườn có mã vùng trồng', loi: 'Mọi chuyến hàng chính ngạch bắt đầu từ một vườn đã được cấp mã vùng trồng. Không có mã, trái ngon đến đâu cũng không qua được cửa khẩu.' },
      en: { ten: 'An orchard with an area code', loi: 'Every official shipment starts at an orchard with a registered planting-area code. Without the code, however good the fruit, it cannot cross the border.' } },
    { id: 'cat', x: 22, anh: 'durian/chang-2-thu-hoach-brix.webp', dk: ['thaiDry', 'loss'],
      vi: { ten: 'Cắt trái đúng độ già', loi: 'Thợ gõ trái nghe tiếng, xem gai và cuống rồi mới cắt. Cắt non thì cơm sượng; để chín quá thì tới nơi đã nứt.' },
      en: { ten: 'Cut at the right maturity', loi: 'Cutters tap and listen, check spines and stalk before cutting. Too young and the pulp stays hard; too ripe and it arrives split.' } },
    { id: 'dong-goi', x: 44, anh: 'durian/chang-3-rua-phan-loai-phc.webp', dk: ['pests', 'grades', 'cdAuramine'], lienKet: 'day-chuyen-sau-rieng.html',
      vi: { ten: 'Nhà đóng gói: rửa, phân loại, kiểm mẫu', loi: 'Trái được chải sạch, soi rệp sáp, chia hạng, lấy mẫu kiểm cadimi và vàng O. Một con rệp sống hay một nắm đất là cả lô bị chặn.', nut: 'Tự lắp dây chuyền đóng gói →' },
      en: { ten: 'Packhouse: clean, grade, test', loi: 'Fruit is brushed, checked for mealybugs, graded, and sampled for cadmium and auramine O. One live pest or a clump of soil blocks the whole lot.', nut: 'Build the packing line yourself →' } },
    { id: 'lanh', x: 66, anh: 'durian/chang-4-cap-dong-iqf.webp', dk: ['freshStorage', 'frozenStandard', 'frozenSigned'],
      vi: { ten: 'Chuỗi lạnh', loi: 'Hàng tươi giữ mát để chín chậm; hàng đông cấp đông thật nhanh rồi giữ từ âm mười tám độ trở xuống. Đứt lạnh một lần là mất giá cả lô.' },
      en: { ten: 'The cold chain', loi: 'Fresh fruit is kept cool to ripen slowly; frozen fruit is frozen fast and held at minus eighteen or colder. One break in the chain and the whole lot loses value.' } },
    { id: 'xe-lanh', x: 88, anh: 'durian/chang-6-xe-lanh-cao-toc.webp', dk: ['loss', 'firstLot'],
      vi: { ten: 'Xe lạnh ra cửa khẩu', loi: 'Container lạnh chạy cao tốc ra biên giới. Mỗi giờ chờ là trái mất nước, mất cân, mất giá.' },
      en: { ten: 'Reefer truck to the border', loi: 'Reefer containers run up the expressway to the border. Every hour of waiting costs water, weight and price.' } },
    { id: 'cua-khau', x: 110, anh: 'durian/chang-5-qr-kiem-dich.webp', dk: ['openDate', 'sampling', 'cadmium'],
      vi: { ten: 'Cửa khẩu và kiểm dịch', loi: 'Hồ sơ phải khớp mã vùng trồng, mã cơ sở đóng gói và phiếu kiểm nghiệm. Phía nhập khẩu lấy mẫu, soi từng thùng.' },
      en: { ten: 'Border gate and quarantine', loi: 'The file must match the area code, the packhouse code and the lab report. The importing side samples and inspects box by box.' } },
    { id: 'cho', x: 132, anh: 'durian/chang-8-ban-le-nem-thu.webp', dk: ['share57', 'china92'],
      vi: { ten: 'Tới tay người mua', loi: 'Sau tất cả các chặng ấy, trái sầu riêng Việt mới lên quầy ở chợ và quán tráng miệng. Mỗi quyết định trước đó đều hiện ra trong giá bán.' },
      en: { ten: 'Into the buyer’s hands', loi: 'Only after all these stages does Vietnamese durian reach market stalls and dessert shops. Every earlier decision shows up in the selling price.' } }
  ];
  const tl = (o, lang) => o[lang === 'en' ? 'en' : 'vi'];
  return { CHANG, tl };
});
