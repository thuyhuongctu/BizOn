/* BizOn Hộ Chiếu Mini – Đầu tư quốc tế (FDI). Dữ liệu + chuỗi 3 ngôn ngữ [vi, en, id].
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Số liệu đã cách điệu cho giảng dạy. */
(function () {
  var D = {};
  D.HOMES = [
    { id: 'vn', flag: '🇻🇳', n: ['Việt Nam', 'Vietnam', 'Vietnam'] },
    { id: 'id', flag: '🇮🇩', n: ['Indonesia', 'Indonesia', 'Indonesia'] },
    { id: 'th', flag: '🇹🇭', n: ['Thái Lan', 'Thailand', 'Thailand'] },
    { id: 'my', flag: '🇲🇾', n: ['Malaysia', 'Malaysia', 'Malaysia'] },
    { id: 'kr', flag: '🇰🇷', n: ['Hàn Quốc', 'South Korea', 'Korea Selatan'] },
    { id: 'jp', flag: '🇯🇵', n: ['Nhật Bản', 'Japan', 'Jepang'] },
  ];
  // size: quy mô cầu · cit: thuế TNDN · wht: thuế khấu trừ cổ tức chuyển về · hol: số quý miễn thuế cho FDI
  // pol: xác suất biến cố chính trị/quý · fxT/fxV: xu hướng/biến động tỷ giá · cost: chi phí vận hành · dist: khoảng cách văn hoá 0–1
  D.MARKETS = {
    id: { flag: '🇮🇩', n: ['Indonesia', 'Indonesia', 'Indonesia'], size: 1.3, cit: 0.22, wht: 0.10, hol: 2, pol: 0.16, fxT: -0.012, fxV: 0.06, cost: 0.9, dist: 0.45, partner: 0.9, ip: 0.3,
      note: ['Thị trường 280 triệu dân, ưu đãi miễn thuế cho FDI, rupiah hay biến động, cần đối tác để phủ các đảo.', '280-million market, tax holidays for FDI, a volatile rupiah, partners needed to cover the islands.', 'Pasar 280 juta jiwa, tax holiday untuk PMA, rupiah fluktuatif, perlu mitra untuk menjangkau pulau-pulau.'] },
    th: { flag: '🇹🇭', n: ['Thái Lan', 'Thailand', 'Thailand'], size: 1.0, cit: 0.20, wht: 0.10, hol: 2, pol: 0.12, fxT: 0, fxV: 0.035, cost: 1.0, dist: 0.35, partner: 0.6, ip: 0.2,
      note: ['Ưu đãi BOI rõ ràng, chuỗi cung ứng tốt, chính trị đôi lúc bất ổn.', 'Clear BOI incentives, strong supply chains, occasional political turbulence.', 'Insentif BOI jelas, rantai pasok kuat, politik kadang bergejolak.'] },
    de: { flag: '🇩🇪', n: ['Đức (EU)', 'Germany (EU)', 'Jerman (UE)'], size: 1.5, cit: 0.30, wht: 0.10, hol: 0, pol: 0.02, fxT: 0.004, fxV: 0.025, cost: 1.35, dist: 0.8, partner: 0.4, ip: 0.05,
      note: ['Sức mua cao, pháp lý ổn định, thuế và chi phí cao, khách khó tính, không ưu đãi miễn thuế.', 'High purchasing power, stable law, high tax and costs, demanding buyers, no tax holiday.', 'Daya beli tinggi, hukum stabil, pajak dan biaya tinggi, pembeli menuntut, tanpa tax holiday.'] },
    vn: { flag: '🇻🇳', n: ['Việt Nam', 'Vietnam', 'Vietnam'], size: 1.1, cit: 0.20, wht: 0, hol: 2, pol: 0.07, fxT: -0.004, fxV: 0.02, cost: 0.85, dist: 0.4, partner: 0.7, ip: 0.25,
      note: ['Tăng trưởng nhanh, ưu đãi FDI, không thu thuế khấu trừ cổ tức, đồng VND điều hành theo biên độ.', 'Fast growth, FDI incentives, no dividend withholding tax, a managed dong.', 'Pertumbuhan cepat, insentif PMA, tanpa pajak dividen, dong dikelola.'] },
  };
  D.pickMarkets = function (home) { var s = ['id', 'th', 'de']; var i = s.indexOf(home); if (i >= 0) s[i] = 'vn'; return s; };
  D.MODES = [
    { id: 'lic', icon: '📜', cost: 1.0, n: ['Cấp phép', 'Licensing', 'Lisensi'], d: ['Vốn 1 tr USD. Nhận phí bản quyền 7% doanh số đối tác. Rủi ro bị sao chép.', '$1M. Earn a 7% royalty on partner sales. Risk of imitation.', '$1 jt. Royalti 7% dari penjualan mitra. Risiko peniruan.'] },
    { id: 'jv', icon: '🤝', cost: 5.0, n: ['Liên doanh', 'Joint venture', 'Usaha patungan'], d: ['Vốn 5 tr USD. Chia 50% lợi nhuận. Đối tác giảm nửa rủi ro chính trị và giúp học thị trường nhanh.', '$5M. 50% of profit. The partner halves political risk and speeds up learning.', '$5 jt. 50% laba. Mitra memangkas risiko politik separuh dan mempercepat belajar.'] },
    { id: 'fdi', icon: '🏭', cost: 10.0, n: ['FDI 100% vốn', 'Wholly owned FDI', 'PMA 100%'], d: ['Vốn 10 tr USD. Giữ 100% lợi nhuận, hưởng ưu đãi miễn thuế. Chịu toàn bộ rủi ro.', '$10M. Keep 100% of profit and get tax holidays. Carry all the risk.', '$10 jt. 100% laba dan tax holiday. Menanggung semua risiko.'] },
  ];
  D.POLICIES = [
    { id: 'loc', icon: '🧭', cost: 0.4, n: ['Bản địa hoá', 'Localise', 'Lokalisasi'], d: ['+15% doanh số lâu dài ở các thị trường đã đầu tư (tối đa +45%).', '+15% lasting sales in markets you’re in (up to +45%).', '+15% penjualan permanen di pasar Anda (maks +45%).'] },
    { id: 'hedge', icon: '🛡️', cost: 0.3, n: ['Phòng ngừa tỷ giá', 'Hedge FX', 'Lindung nilai kurs'], d: ['Giảm 80% tác động biến động tỷ giá quý này.', 'Cuts 80% of exchange-rate swings this quarter.', 'Memangkas 80% gejolak kurs kuartal ini.'] },
    { id: 'gov', icon: '🏛️', cost: 0.3, n: ['Quan hệ chính phủ', 'Government relations', 'Hubungan pemerintah'], d: ['Giảm 60% thiệt hại nếu có biến cố chính trị/chính sách quý này.', 'Cuts 60% of damage from a political or policy shock this quarter.', 'Memangkas 60% kerugian dari guncangan politik kuartal ini.'] },
  ];
  D.REPAT = [0, 0.5, 1];
  D.EVENTS = [
    { id: 'fxdown', icon: '📉', k: 'fx', t: ['Đồng nội tệ mất giá', 'Local currency slides', 'Mata uang lokal melemah'], d: ['Tỷ giá tại {m} giảm 12%. Lợi nhuận giữ lại ở đó mất giá khi quy về USD.', '{m}’s currency falls 12%. Profits held there lose value in USD.', 'Mata uang {m} turun 12%. Laba yang ditahan di sana turun nilainya dalam USD.'] },
    { id: 'holiday', icon: '🎁', k: 'inc', t: ['Ưu đãi đầu tư mới', 'New investment incentive', 'Insentif investasi baru'], d: ['{m} thêm 2 quý miễn thuế cho dự án FDI và liên doanh mới.', '{m} adds a 2-quarter tax holiday for new FDI and JVs.', '{m} menambah tax holiday 2 kuartal untuk PMA dan JV baru.'] },
    { id: 'pol', icon: '🏛️', k: 'pol', t: ['Bất ổn chính sách', 'Policy shock', 'Guncangan kebijakan'], d: ['{m} đột ngột siết giấy phép với doanh nghiệp nước ngoài. Tài sản và doanh số bị ảnh hưởng.', '{m} suddenly tightens licences for foreign firms. Assets and sales are hit.', '{m} tiba-tiba memperketat izin bagi perusahaan asing. Aset dan penjualan terdampak.'] },
    { id: 'tax', icon: '🧾', k: 'tax', t: ['Tăng thuế khấu trừ', 'Withholding tax rises', 'Pajak potong naik'], d: ['{m} tăng thuế khấu trừ cổ tức chuyển ra nước ngoài thêm 5 điểm %.', '{m} raises withholding tax on outbound dividends by 5 points.', '{m} menaikkan pajak dividen keluar sebesar 5 poin.'] },
    { id: 'boom', icon: '🚀', k: 'demand', t: ['Cầu tăng mạnh', 'Demand boom', 'Lonjakan permintaan'], d: ['Tiêu dùng tại {m} tăng, doanh số quý này +25%.', 'Consumer spending in {m} jumps: sales +25% this quarter.', 'Belanja konsumen di {m} naik: penjualan +25% kuartal ini.'] },
    { id: 'copy', icon: '🪞', k: 'ip', t: ['Bị sao chép công nghệ', 'Technology copied', 'Teknologi ditiru'], d: ['Một doanh nghiệp tại {m} làm nhái sản phẩm. Hợp đồng cấp phép ở đó mất 40% phí bản quyền.', 'A firm in {m} copies your product. Licensing there loses 40% of royalties.', 'Perusahaan di {m} meniru produk Anda. Lisensi di sana kehilangan 40% royalti.'] },
    { id: 'calm', icon: '🌤️', k: 'none', t: ['Quý ổn định', 'A calm quarter', 'Kuartal tenang'], d: ['Không có cú sốc lớn. Thời điểm tốt để mở rộng.', 'No major shocks. A good moment to expand.', 'Tanpa guncangan besar. Saat yang baik untuk ekspansi.'] },
  ];
  window.FDIMiniData = D;
})();
