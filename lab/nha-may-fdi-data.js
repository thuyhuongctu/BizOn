/* Nhà máy FDI – tham số kịch bản
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Hai loại số, tách bạch:
 *  - `params`, `markets`, `events`: THAM SỐ MINH HỌA cho giảng dạy (sẽ hiệu chỉnh
 *    theo chuỗi Hải quan 2013–2026 và kết quả nghiên cứu DA2/DA3). Không phải số thật.
 *  - `benchmarks`: SỐ THẬT đã công bố (Cục Hải quan, Biểu 017.T và 018.T, sơ bộ,
 *    8 tháng 2026, khu vực FDI), dùng làm tham chiếu cấp nhóm hàng.
 */
(function (root) {
  'use strict';

  const industries = {
    electronics: {
      vi: 'Điện tử – lắp ráp linh kiện', en: 'Electronics assembly',
      unitVi: 'thiết bị', unitEn: 'devices',
      capacity: 100000,      // sản lượng tối đa mỗi quý
      price: 100,            // USD/đơn vị, thị trường chuẩn
      material: 60,          // chi phí nguyên vật liệu chuẩn, USD/đơn vị
      other: 18,             // lao động + chi phí khác, USD/đơn vị
      localPremium: 0.20,    // mua trong nước đắt hơn nhập khẩu 20% lúc đầu
      supplierScale: 1e6,    // đầu tư phát triển nhà cung cấp làm phần chênh giảm e lần mỗi 1 triệu USD
      maxLocal: 0.7
    },
    textile: {
      vi: 'Dệt may – may mặc xuất khẩu', en: 'Textile & garments',
      unitVi: 'sản phẩm', unitEn: 'garments',
      capacity: 400000, price: 30, material: 16, other: 8,
      localPremium: 0.15, supplierScale: 0.8e6, maxLocal: 0.8
    }
  };

  // Hàng không bán được ở thị trường đã chọn được thanh lý trong nước với giá bằng tỷ lệ này (không tính là xuất khẩu).
  const salvage = 0.4;

  // share = phần công suất mà thị trường hấp thụ được trong quý bình thường (tổng > 1 nên phải chọn)
  const markets = [
    { id: 'US',   vi: 'Hoa Kỳ',              en: 'United States',     share: 0.45, priceMult: 1.00, mfn: 0.00, pref: 0.00, roo: null },
    { id: 'EU',   vi: 'Liên minh châu Âu',   en: 'European Union',    share: 0.30, priceMult: 1.05, mfn: 0.08, pref: 0.00, roo: 0.40, fta: 'EVFTA' },
    { id: 'JPKR', vi: 'Nhật Bản – Hàn Quốc', en: 'Japan – Korea',     share: 0.20, priceMult: 1.00, mfn: 0.06, pref: 0.00, roo: 0.40, fta: 'CPTPP / VKFTA' },
    { id: 'CNAS', vi: 'Trung Quốc – ASEAN',  en: 'China – ASEAN',     share: 0.25, priceMult: 0.85, mfn: 0.00, pref: 0.00, roo: null }
  ];

  // Kịch bản 8 quý, lấy cảm hứng từ các sự kiện thật; mọi độ lớn là minh họa.
  // demand: hệ số cầu theo thị trường · priceCut: giảm giá ròng do cước · tariff: thuế bổ sung
  // disruption: tỷ lệ đứt gãy đầu vào nhập khẩu · importFreight: phụ phí cước đầu vào nhập
  const events = [
    { q: 1, vi: 'Khởi động', en: 'Start-up',
      textVi: 'Nhà máy vừa nhận giấy chứng nhận đầu tư. Chọn nguồn đầu vào và thị trường cho quý đầu tiên.',
      textEn: 'The plant has just received its investment certificate. Choose inputs and markets for the first quarter.' },
    { q: 2, vi: 'Chiến tranh thương mại Mỹ – Trung', en: 'US–China trade war', inspired: '2018–2019',
      textVi: 'Hoa Kỳ áp thuế lên hàng Trung Quốc; người mua Mỹ chuyển đơn hàng sang Việt Nam.',
      textEn: 'The US tariffs Chinese goods; US buyers shift orders to Vietnam.',
      demand: { US: 1.35 } },
    { q: 3, vi: 'Quy tắc xuất xứ được siết', en: 'Rules of origin tighten', inspired: 'EVFTA 2020',
      textVi: 'Khách hàng EU chỉ được hưởng thuế 0% khi hàng đạt hàm lượng nội địa từ 40%. Cầu EU tăng nhẹ.',
      textEn: 'EU buyers get 0% duty only if local content reaches 40%. EU demand edges up.',
      demand: { EU: 1.10 } },
    { q: 4, vi: 'Đứt gãy chuỗi cung ứng', en: 'Supply-chain disruption', inspired: 'COVID-19, 2020–2021',
      textVi: 'Cảng và nhà máy linh kiện ở nước ngoài đóng cửa. Phần đầu vào nhập khẩu bị thiếu và cước tăng mạnh.',
      textEn: 'Foreign ports and component plants shut. Imported inputs run short and freight soars.',
      disruption: 0.50, importFreight: 0.40, demand: { US: 0.90, EU: 0.90, JPKR: 0.90, CNAS: 0.90 } },
    { q: 5, vi: 'Phục hồi', en: 'Recovery',
      textVi: 'Cầu toàn cầu phục hồi sau đứt gãy.',
      textEn: 'Global demand recovers after the disruption.',
      demand: { US: 1.10, EU: 1.10, JPKR: 1.10, CNAS: 1.10 } },
    { q: 6, vi: 'Gián đoạn tuyến Biển Đỏ', en: 'Red Sea shipping disruption', inspired: '2023–2024',
      textVi: 'Tàu đi châu Âu phải vòng qua Mũi Hảo Vọng: cước sang EU tăng, đầu vào nhập khẩu cũng đắt hơn.',
      textEn: 'Ships to Europe reroute around the Cape: EU freight rises and imported inputs cost more.',
      priceCut: { EU: 0.08 }, importFreight: 0.15 },
    { q: 7, vi: 'Thuế đối ứng của Hoa Kỳ', en: 'US reciprocal tariff', inspired: '2025',
      textVi: 'Hoa Kỳ áp thuế 20% lên hàng Việt Nam; hàng bị nghi trung chuyển (hàm lượng nội địa dưới 30%) chịu 40%.',
      textEn: 'The US imposes 20% on Vietnamese goods; suspected transshipment (local content under 30%) faces 40%.',
      tariff: { US: 0.20 }, transship: { market: 'US', threshold: 0.30, rate: 0.40 } },
    { q: 8, vi: 'Bình thường mới', en: 'New normal',
      textVi: 'Thuế của Hoa Kỳ giữ nguyên. Quý cuối để chứng minh mô hình kinh doanh của bạn bền vững.',
      textEn: 'US tariffs stay in place. A final quarter to prove your model is sustainable.',
      tariff: { US: 0.20 }, transship: { market: 'US', threshold: 0.30, rate: 0.40 } }
  ];

  // Số thật: Cục Hải quan, Biểu 017.T/018.T (sơ bộ), cộng dồn 8 tháng 2026, khu vực FDI, tỷ USD.
  const benchmarks = {
    source: 'Cục Hải quan (2026), Biểu 017.T và 018.T, số liệu sơ bộ, cộng dồn 8 tháng năm 2026.',
    totalExports: 299.530, totalImports: 290.229,
    electronics: { exports: 100.443, imports: 157.668,
      noteVi: 'Nhóm «Máy vi tính, sản phẩm điện tử và linh kiện»: nhập khẩu vượt xuất khẩu.',
      noteEn: '"Computers, electronic products and components": imports exceed exports.' },
    textile: { exports: 17.065, imports: 12.804,
      noteVi: 'Xuất khẩu hàng dệt may so với nhập vải, bông, xơ sợi và nguyên phụ liệu dệt may, da, giày.',
      noteEn: 'Textile and garment exports against imports of fabric, cotton, yarn and textile/leather/footwear materials.' }
  };

  const api = { industries, markets, events, benchmarks, salvage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FactoryData = api;
})(typeof window !== 'undefined' ? window : globalThis);
