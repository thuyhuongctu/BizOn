/* Hộ Chiếu Sầu Riêng – dữ liệu kịch bản
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Hai loại số, tách bạch:
 *  - `sources` + mọi trường `src`: DỮ KIỆN có trích nguồn, lấy từ bộ tài liệu tra cứu
 *    «Xuất khẩu sầu riêng» (CESTI, 04/2024) và các tài liệu kèm theo (Nghị định thư MARD–GACC 2022,
 *    báo cáo thị trường rau quả Bộ Công Thương 12/2023–02/2024, luận văn Cai Lậy 2014, …).
 *  - `params`: THAM SỐ MINH HỌA để trò chơi chạy được (khối lượng, hệ số giá, xác suất).
 *    Chúng được neo vào dữ kiện ở mức tỷ lệ (ví dụ giá nghịch vụ gấp 2–3 lần chính vụ),
 *    nhưng KHÔNG phải số thống kê. Đơn vị tiền: nghìn đồng/kg; tiền mặt: tỷ đồng.
 */
(function (root) {
  'use strict';

  // ---------- Nguồn (khóa ngắn → mô tả đầy đủ) ----------
  const sources = {
    PROTO: 'Nghị định thư về yêu cầu kiểm dịch thực vật đối với quả sầu riêng tươi xuất khẩu từ Việt Nam sang Trung Quốc (MARD–GACC, 2022), Điều 2–9 và Phụ lục.',
    BC1022: 'Trung tâm Xúc tiến Thương mại Tiền Giang (2022). Thông tin thị trường xuất khẩu tháng 10/2022.',
    BC1223: 'Bộ Công Thương (2023). Báo cáo thị trường rau quả tháng 12/2023.',
    BC0124: 'Bộ Công Thương (2024). Báo cáo thị trường rau quả tháng 01/2024.',
    BC0224: 'Bộ Công Thương (2024). Báo cáo thị trường rau quả tháng 02/2024.',
    KQTC: 'CESTI (2024). Kết quả tra cứu «Xuất khẩu trái sầu riêng» (04/2024), gồm tin agro.gov.vn ngày 8/4/2024.',
    CAILAY: 'Luận văn thạc sĩ (2014). Giải pháp hoàn thiện chuỗi cung ứng sầu riêng tại huyện Cai Lậy, Tiền Giang.',
    PDIEN: 'Bài báo (2017). Chiến lược và giải pháp nâng cấp chuỗi cung ứng sầu riêng huyện Phong Điền, Cần Thơ.',
    CGIAR: 'CGIAR (2022). Fruit production and value chain – Mekong River Delta, Viet Nam (đánh giá rủi ro khí hậu).',
    TW: 'Bài báo (2020). Đẩy mạnh xuất khẩu sầu riêng của Việt Nam sang thị trường Đài Loan.',
    JETRO: 'IDE-JETRO (2018). Chapter 5 – Thai export of durian to China.',
    GMSARN: 'GMSARN (2023). The competitiveness of Thai durian export to China\'s market.',
    MYSOP: 'MARDI (2023). The SOP for exporting frozen whole durian fruit.',
    MYSC: 'Bài báo (2019). From farm to China: Malaysian frozen whole durian export supply chain.',
    GS1: 'APEC (2017). Application of global data standards for supply chain connectivity (thí điểm truy xuất sầu riêng Malaysia).',
    TCVN: 'TCVN 10739:2015 – Sầu riêng quả tươi.'
  };

  // ---------- Dữ kiện dùng trong trò chơi (có trích nguồn) ----------
  const facts = {
    openDate: { v: '27/7/2022', src: 'BC1022', vi: 'Hải quan Trung Quốc cho phép nhập khẩu sầu riêng tươi Việt Nam.', en: 'China Customs authorised imports of fresh Vietnamese durian.' },
    firstLot: { v: '17,28 tấn', src: 'BC1022', vi: 'Lô chính ngạch đầu tiên thông quan tại Hà Khẩu (10/2022).', en: 'First official lot cleared at Hekou (Oct 2022).' },
    codes: { src: 'PROTO', vi: 'Vùng trồng và cơ sở đóng gói phải đăng ký và được cả hai bên phê duyệt; thùng hàng ghi mã vùng trồng và mã cơ sở đóng gói. Hàng từ nơi chưa đăng ký bị từ chối.', en: 'Planting areas and packing facilities must be registered and approved by both sides; boxes carry both codes. Goods from unregistered sources are refused.' },
    sampling: { src: 'PROTO', vi: 'Lấy mẫu 2% mỗi lô trong 2 năm đầu; không vi phạm thì giảm còn 1%. Phát hiện sinh vật gây hại sống, đất hoặc lá: cả lô không được xuất; vùng trồng hoặc cơ sở có thể bị tạm dừng đến hết vụ.', en: '2% of each lot sampled in the first 2 years, then 1% if clean. A live pest, soil or leaves: the whole lot is blocked and the area or facility may be suspended for the rest of the season.' },
    pests: { src: 'PROTO', vi: '6 đối tượng kiểm dịch, gồm ruồi đục quả Bactrocera correcta và 5 loài rệp sáp.', en: '6 quarantine pests, including the fruit fly Bactrocera correcta and 5 mealybug species.' },
    cadmium: { src: 'KQTC', vi: 'Từ 6/2023 đến 1/2024, Hải quan Trung Quốc cảnh báo 30 lô sầu riêng của 18 doanh nghiệp nhiễm cadimi vượt giới hạn.', en: 'From Jun 2023 to Jan 2024, China Customs flagged 30 durian lots from 18 firms for cadmium above the limit.' },
    share57: { src: 'KQTC', vi: '2 tháng đầu 2024, Việt Nam dẫn đầu thị trường Trung Quốc: 32.750 tấn, 161 triệu USD, 57% thị phần giá trị (2023: 32%). Giá bình quân 4.916 USD/tấn, thấp hơn Thái Lan (6.133).', en: 'Jan–Feb 2024: Vietnam led China with 32,750 t, USD 161m, a 57% value share (2023: 32%). Average price USD 4,916/t, below Thailand (6,133).' },
    china92: { src: 'KQTC', vi: 'Trung Quốc chiếm 92% kim ngạch xuất khẩu sầu riêng Việt Nam (2 tháng đầu 2024); đông lạnh chiếm 7,6%.', en: 'China took 92% of Vietnam\'s durian export value (Jan–Feb 2024); frozen durian was 7.6%.' },
    offPremium: { src: 'BC0224', vi: 'Giá nghịch vụ gấp 2–3 lần thời điểm vụ thuận (vụ thuận phổ biến tháng 5–8 tùy vùng).', en: 'Off-season prices are 2–3 times main-season prices (main season usually May–August).' },
    offYield: { src: 'CAILAY', vi: 'Sầu riêng nghịch vụ cho sản lượng thấp hơn 10–20%, giá cao hơn 50–80% (2014); xử lý nghịch vụ làm giảm tuổi thọ cây 20–30%.', en: 'Off-season output is 10–20% lower and prices 50–80% higher (2014); off-season inducing cuts tree life by 20–30%.' },
    traders80: { src: 'CAILAY', vi: 'Doanh nghiệp xuất khẩu mua khoảng 80% qua thương lái, 20% trực tiếp từ nông dân.', en: 'Exporters buy about 80% through traders and 20% directly from farmers.' },
    loss: { src: 'CAILAY', vi: 'Hao hụt toàn chuỗi 15–40%, trong đó 15–20% là mất nước tự nhiên; hàng rớt bán giảm 50–80%.', en: 'Whole-chain loss 15–40%, of which 15–20% is natural moisture loss; rejected fruit sells 50–80% cheaper.' },
    breakDeal: { src: 'PDIEN', vi: 'Thỏa thuận mua bán chủ yếu bằng lời; 50% thương lái cho biết từng bị nông dân «bẻ kèo».', en: 'Deals are mostly verbal; 50% of traders report farmers breaking deals.' },
    japanMRL: { src: 'BC1223', vi: 'Một lô khoảng 1,4 tấn sang Nhật bị tiêu hủy: procymidone 0,03 ppm so với giới hạn 0,01 ppm.', en: 'A ~1.4 t lot to Japan was destroyed: procymidone 0.03 ppm vs a 0.01 ppm limit.' },
    twTariff: { src: 'TW', vi: 'Đài Loan áp thuế MFN 17% với sầu riêng Việt Nam; giới hạn dư lượng Cypermethrin 1 mg/kg, Chlorpyrifos 0,5 mg/kg.', en: 'Taiwan applies a 17% MFN tariff to Vietnamese durian; MRLs Cypermethrin 1 mg/kg, Chlorpyrifos 0.5 mg/kg.' },
    thaiDry: { src: 'BC1223', vi: 'Thái Lan nâng chuẩn độ khô cơm sầu riêng xuất khẩu từ 32% lên 35% và giám sát từng lô.', en: 'Thailand raised the export dry-matter standard from 32% to 35% and checks every lot.' },
    fakeOrigin: { src: 'GMSARN', vi: 'Sầu riêng Việt Nam (70 baht/kg) bị dán nhãn thành hàng Thái (bán tới 160 baht/kg) bằng chứng nhận GAP/GMP giả; Thái Lan khởi tố và thu hồi chứng nhận.', en: 'Vietnamese durian (70 baht/kg) was passed off as Thai (up to 160 baht/kg) with fake GAP/GMP certificates; Thailand prosecuted and revoked certificates.' },
    salinity: { src: 'CGIAR', vi: 'Hạn mặn 2015–2016 và 2019–2020; năm 2020, 25.439 ha cây ăn trái ĐBSCL bị thiệt hại. Mặn cao điểm tháng 1–4, trùng ra hoa – nuôi trái.', en: 'Salinity and drought in 2015–2016 and 2019–2020; in 2020, 25,439 ha of Mekong Delta fruit was damaged. Salinity peaks Jan–Apr, during flowering and fruit set.' },
    rain: { src: 'CGIAR', vi: 'Mưa trái mùa gây rụng hoa, rụng trái, chín không đều, thối trái do Phytophthora.', en: 'Unseasonal rain causes flower and fruit drop, uneven ripening and Phytophthora fruit rot.' },
    frozenThai: { src: 'JETRO', vi: 'Thái Lan 2016: giá xuất khẩu tươi 43 baht/kg, đông lạnh 106 baht/kg; cấp đông tốn thêm 21 baht/kg.', en: 'Thailand 2016: fresh export price 43 baht/kg, frozen 106; freezing adds 21 baht/kg.' },
    frozenMY: { src: 'MYSOP', vi: 'Cấp đông nguyên trái −80 đến −110 °C tối thiểu 1 giờ, rửa chlorine 500 ppm; chuyến thử nghiệm có 50% trái nứt vỏ do ẩm độ thấp.', en: 'Whole-fruit freezing at −80 to −110 °C for at least 1 hour after a 500 ppm chlorine wash; in a trial 50% of fruit cracked because of low humidity.' },
    frozenPush: { src: 'KQTC', vi: 'Đến 04/2024, Việt Nam đang thúc đẩy ký Nghị định thư sầu riêng đông lạnh với Trung Quốc; Cục BVTV yêu cầu rà soát vùng trồng, cơ sở chế biến.', en: 'As of Apr 2024, Vietnam was pushing to sign a frozen-durian protocol with China; local authorities were told to review planting areas and processors.' },
    gs1: { src: 'GS1', vi: 'Thí điểm mã vạch GS1 cho sầu riêng Malaysia: theo dõi kiện hàng từ 40% lên 100%, thời gian thông quan giảm gần 50%.', en: 'GS1 barcode pilot for Malaysian durian: package tracking rose from 40% to 100%; clearance time fell by nearly half.' },
    thaiOverlap: { src: 'CAILAY', vi: 'Chính vụ miền Tây (tháng 4–8) trùng vụ Thái Lan và Đông Nam Bộ nên thương lái Trung Quốc ít mua sầu riêng Việt Nam.', en: 'The Mekong main season (Apr–Aug) overlaps Thailand and the Southeast, so Chinese buyers purchase less Vietnamese durian.' },
    grades: { src: 'TCVN', vi: 'Hạng Đặc biệt ≥4 ngăn múi, hạng I ≥3, hạng II ≥2; dung sai chất lượng 10%.', en: 'Extra grade ≥4 full locules, Grade I ≥3, Grade II ≥2; 10% quality tolerance.' },
    thaiDrought: { src: 'GMSARN', vi: 'Hạn hán ở Thái Lan (2016–2017) làm giảm nguồn cung; thị phần Việt Nam tại Trung Quốc lên 37,39% năm 2017.', en: 'Drought in Thailand (2016–2017) cut supply; Vietnam\'s share in China rose to 37.39% in 2017.' },
    border2018: { src: 'TW', vi: 'Năm 2018 Trung Quốc siết dần nhập khẩu tiểu ngạch, làm giảm kim ngạch sầu riêng Việt Nam.', en: 'In 2018 China tightened small-scale border imports, reducing Vietnam\'s durian exports.' }
  };

  // ---------- Tham số minh họa ----------
  const params = {
    cash0: 12,                 // tỷ đồng tiền mặt ban đầu
    depotMain: 50,             // giá vựa chính vụ, nghìn đ/kg (minh họa; nghịch vụ = depotMain × offMult)
    offMult: 2.5,              // neo vào «gấp 2–3 lần» (BC0224)
    farmCost: 20,              // giá thành tự trồng, nghìn đ/kg (minh họa, quy đổi mặt bằng giá 2024)
    linkedPremium: 0.08,       // mua từ vùng liên kết có mã đắt hơn mua thương lái 8%
    baseLoss: 0.18,            // hao hụt cơ bản: mất nước 15% + thu hoạch 3% (neo CAILAY 15–40%)
    traceLossCut: 0.03,        // truy xuất + chuỗi lạnh giảm hao hụt 3 điểm % (minh họa)
    offYieldCut: 0.15,         // nghịch vụ sản lượng thấp hơn 15% (neo 10–20%, CAILAY)
    treeHealthCost: 12,        // mỗi vụ xử lý nghịch vụ trừ 12 điểm sức khỏe vườn (neo «giảm tuổi thọ 20–30%»)
    rejectedDiscount: 0.6,     // hàng rớt/hàng bị chặn bán nội địa còn 40% giá (neo «giảm 50–80%»)
    priorityCost: { area: 1.2, pack: 1.5, test: 0.6, trace: 0.8, freezer: 3.0, finance: 0 },
    fraudMult: 160 / 70,       // 160 so với 70 baht/kg (GMSARN)
    sampling: [0.02, 0.01]     // PROTO
  };

  // ---------- Vai chơi ----------
  const roles = {
    htx: { emoji: '🌳', vi: 'HTX nhà vườn Cai Lậy', en: 'Cai Lậy growers\' cooperative',
      descVi: 'Tự trồng trên vườn của xã viên, giá thành thấp, có thể xử lý ra hoa nghịch vụ. Chưa có cơ sở đóng gói.',
      descEn: 'Grows its own fruit at low cost and can induce off-season flowering. No packing facility yet.',
      volume: 250, benchMargin: 40, ownFarm: true, areaCode: false, packCode: false, freezer: false, cashAdj: -2 },
    packer: { emoji: '📦', vi: 'Cơ sở đóng gói Đắk Lắk', en: 'Đắk Lắk packing house',
      descVi: 'Đã có mã cơ sở đóng gói; mua trái từ nhà vườn Tây Nguyên, dễ bị «bẻ kèo» khi giá lên.',
      descEn: 'Already holds a packing-facility code; buys from Central Highlands growers who may break deals when prices rise.',
      volume: 500, benchMargin: 4, ownFarm: false, areaCode: false, packCode: true, freezer: false, cashAdj: 0 },
    exporter: { emoji: '🚛', vi: 'Công ty xuất khẩu TP.HCM', en: 'Ho Chi Minh City exporter',
      descVi: 'Vốn lớn, có khách Trung Quốc; mua chủ yếu qua thương lái nên khó kiểm soát dư lượng.',
      descEn: 'Well capitalised with Chinese buyers; buys mostly through traders, so residues are hard to control.',
      volume: 700, benchMargin: 4, ownFarm: false, areaCode: false, packCode: false, freezer: false, cashAdj: 6 },
    frozen: { emoji: '❄️', vi: 'Doanh nghiệp cấp đông Tiền Giang', en: 'Tiền Giang freezing company',
      descVi: 'Có dây chuyền cấp đông; sản phẩm đông lạnh giá cao nhưng chi phí lớn và chờ nghị định thư.',
      descEn: 'Owns a freezing line; frozen products earn more but cost more, and await a protocol.',
      volume: 350, benchMargin: 6, ownFarm: false, areaCode: false, packCode: true, freezer: true, cashAdj: 2 }
  };

  // ---------- Kênh bán ----------
  // priceMult: giá bán so với giá vựa trong vụ. Neo: DN xuất khẩu Cai Lậy mua 26.333, bán 47.333 đ/kg (×1,8; CAILAY);
  // bán lẻ 82.200 so với vựa 71.100 đ/kg (×1,16; PDIEN); đông lạnh/tươi ×2,47 và chi phí cấp đông ≈ 0,5 giá tươi (JETRO).
  // Các hệ số còn lại là minh họa. · cost: chi phí logistics/kiểm dịch, nghìn đ/kg · cap: tấn/vụ (null = không giới hạn)
  const channels = [
    { id: 'CN', emoji: '🇨🇳', vi: 'Trung Quốc chính ngạch (tươi)', en: 'China official (fresh)', priceMult: 1.6, cost: 8, cap: null, needs: ['area', 'pack'], src: 'CAILAY' },
    { id: 'BORDER', emoji: '🛻', vi: 'Trung Quốc tiểu ngạch', en: 'China border trade', priceMult: 1.35, cost: 5, cap: 260, needs: [], src: 'CAILAY' },
    { id: 'FROZEN', emoji: '❄️', vi: 'Đông lạnh (múi, nguyên trái)', en: 'Frozen (pulp, whole fruit)', priceMult: 2.6, cost: 6, freezeCost: 0.6, cap: 220, needs: ['freezer'], src: 'JETRO' },
    { id: 'TW', emoji: '🇹🇼', vi: 'Đài Loan', en: 'Taiwan', priceMult: 2.1, cost: 15, tariff: 0.17, cap: 50, needs: [], src: 'TW' },
    { id: 'JP', emoji: '🇯🇵', vi: 'Nhật Bản (hàng cao cấp)', en: 'Japan (premium)', priceMult: 2.4, cost: 22, cap: 30, needs: ['test'], src: 'BC1223' },
    { id: 'DOM', emoji: '🏪', vi: 'Nội địa (chợ đầu mối TP.HCM)', en: 'Domestic (HCMC wholesale)', priceMult: 1.1, cost: 2, cap: null, needs: [], src: 'PDIEN' }
  ];

  // ---------- Ưu tiên đầu tư (chọn 1 mỗi vụ) ----------
  const priorities = [
    { id: 'area', vi: 'Liên kết vùng trồng có mã số', en: 'Link coded planting areas', effVi: 'Mở kênh chính ngạch từ vụ sau (cùng mã đóng gói). +Năng lực', effEn: 'Unlocks official trade from next season (with a packing code). +Capability', src: 'PROTO' },
    { id: 'pack', vi: 'Xin mã cơ sở đóng gói', en: 'Obtain a packing-facility code', effVi: 'Đủ điều kiện đóng gói chính ngạch từ vụ sau. +Năng lực', effEn: 'Qualifies for official packing from next season. +Capability', src: 'PROTO' },
    { id: 'test', vi: 'Kiểm nghiệm dư lượng và kim loại nặng', en: 'Residue and heavy-metal testing', effVi: 'Giảm rủi ro bị cảnh báo (tối đa 2 cấp). Bắt buộc với Nhật Bản.', effEn: 'Cuts alert risk (up to 2 levels). Required for Japan.', src: 'KQTC' },
    { id: 'trace', vi: 'Truy xuất nguồn gốc (mã vạch GS1)', en: 'Traceability (GS1 barcodes)', effVi: 'Giảm hao hụt, chống giả xuất xứ, qua kiểm tra nhanh hơn.', effEn: 'Lower losses, protection against fake origin, faster checks.', src: 'GS1' },
    { id: 'freezer', vi: 'Đầu tư cấp đông nhanh', en: 'Invest in cryogenic freezing', effVi: 'Mở kênh đông lạnh từ vụ sau. Chi phí lớn.', effEn: 'Unlocks the frozen channel from next season. Costly.', src: 'MYSOP' },
    { id: 'finance', vi: 'Củng cố tài chính', en: 'Strengthen finances', effVi: 'Không chi tiền; +Chống chịu, giảm chi phí vốn.', effEn: 'No spending; +Resilience, lower financing cost.', src: null }
  ];

  // ---------- Nguồn tin (mua tối đa 2 mỗi vụ) ----------
  // bias: độ lệch dự báo giá; noise: sai số; reveals: thông tin bổ sung
  const intel = [
    { id: 'moit', vi: 'Báo cáo thị trường Bộ Công Thương', en: 'Ministry of Industry and Trade market report', cost: 0.05, bias: 0, noise: 0.05, src: 'BC0224' },
    { id: 'trader', vi: 'Tin từ thương lái', en: 'Word from traders', cost: 0, bias: 0.20, noise: 0.15, warnVi: 'Hay thổi giá để giữ hàng', warnEn: 'Tends to talk prices up', src: 'PDIEN' },
    { id: 'buyer', vi: 'Đối tác nhập khẩu Trung Quốc', en: 'Chinese importer', cost: 0.1, bias: -0.10, noise: 0.08, warnVi: 'Hay nói giảm để ép giá', warnEn: 'Tends to talk prices down', src: 'JETRO' },
    { id: 'ppd', vi: 'Cảnh báo của Cục Bảo vệ thực vật', en: 'Plant Protection Department alerts', cost: 0.05, bias: 0, noise: 0, reveals: 'risk', src: 'KQTC' }
  ];

  // ---------- 6 vụ: mốc thật + nhiệm vụ ----------
  // season: main | off · demand: hệ số giá vựa · flags cho kênh
  const seasons = [
    { n: 1, season: 'main', label: '2022 · chính vụ', demand: 0.9, anchor: 'openDate',
      vi: 'Mở cửa chính ngạch', en: 'Official trade opens',
      textVi: 'Ngày 27/7/2022, Hải quan Trung Quốc cho phép nhập khẩu sầu riêng tươi Việt Nam. Muốn đi chính ngạch phải có mã số vùng trồng và mã cơ sở đóng gói; trước đó hầu hết đi tiểu ngạch.',
      textEn: 'On 27 July 2022 China Customs allowed fresh Vietnamese durian. Official trade needs a planting-area code and a packing-facility code; before this, almost everything went through border trade.' },
    { n: 2, season: 'off', label: '2022–23 · nghịch vụ', demand: 1.0, anchor: 'firstLot', borderCut: 0.15,
      vi: 'Lô chính ngạch đầu tiên', en: 'First official lot',
      textVi: 'Tháng 10/2022, 17,28 tấn sầu riêng tươi thông quan tại Hà Khẩu. Tiểu ngạch bị siết dần; nghịch vụ giá cao gấp 2–3 lần chính vụ.',
      textEn: 'In October 2022, 17.28 t of fresh durian cleared at Hekou. Border trade is tightening; off-season prices are 2–3 times main-season prices.' },
    { n: 3, season: 'main', label: '2023 · chính vụ', demand: 0.75, anchor: 'thaiOverlap', borderCut: 0.3,
      vi: 'Trùng vụ Thái Lan', en: 'Thai season overlap',
      textVi: 'Chính vụ miền Tây trùng vụ Thái Lan và Đông Nam Bộ: người mua Trung Quốc mua ít hơn, giá vựa giảm.',
      textEn: 'The Mekong main season overlaps Thailand and the Southeast: Chinese buyers buy less and depot prices fall.' },
    { n: 4, season: 'off', label: '2023–24 · nghịch vụ', demand: 1.05, anchor: 'cadmium', mission: 'audit', cadmium: true, borderCut: 0.45,
      vi: 'NHIỆM VỤ · Đoàn kiểm tra và cảnh báo cadimi', en: 'MISSION · Audit and cadmium alerts',
      textVi: 'Hải quan Trung Quốc cảnh báo 30 lô của 18 doanh nghiệp nhiễm cadimi (6/2023–1/2024) và kiểm tra trực tuyến vùng trồng, cơ sở đóng gói. Hồ sơ yếu sẽ bị tạm dừng mã.',
      textEn: 'China Customs flags 30 lots from 18 firms for cadmium (Jun 2023–Jan 2024) and audits planting areas and packing facilities online. Weak records lead to suspended codes.' },
    { n: 5, season: 'main', label: '2024 · chính vụ', demand: 0.95, anchor: 'share57', thaiDry: true, borderCut: 0.55,
      vi: 'Việt Nam vượt Thái Lan', en: 'Vietnam overtakes Thailand',
      textVi: 'Đầu 2024 Việt Nam chiếm 57% thị phần giá trị tại Trung Quốc nhưng giá bình quân thấp hơn Thái Lan. Thái Lan nâng chuẩn độ khô từ 32% lên 35%: người mua đòi chất lượng cao hơn.',
      textEn: 'In early 2024 Vietnam held a 57% value share in China but at a lower average price than Thailand. Thailand raised its dry-matter standard from 32% to 35%: buyers demand higher quality.' },
    { n: 6, season: 'off', label: '2024–25 · nghịch vụ', demand: 1.1, anchor: 'frozenPush', frozenProtocol: true, borderCut: 0.6,
      vi: 'Nghị định thư đông lạnh (giả định)', en: 'Frozen protocol (scenario)',
      textVi: 'Kịch bản giả định của trò chơi: nghị định thư sầu riêng đông lạnh được ký (tài liệu 04/2024 cho biết Việt Nam đang thúc đẩy). Kênh đông lạnh được giá cao hơn nếu có vùng trồng và cơ sở đạt chuẩn.',
      textEn: 'A game scenario: a frozen-durian protocol is signed (documents from Apr 2024 say Vietnam was pushing for it). The frozen channel pays more for firms with qualified areas and facilities.' }
  ];

  // ---------- Biến cố có lựa chọn (mỗi vụ rút 1, không lặp) ----------
  // eff: tác động; các khóa engine hiểu: volume, loss, cash, rep, sus, adapt, risk, fraud, priceAll, chanCap, treeHealth, linkedNext
  const events = [
    { id: 'break', src: 'breakDeal', vi: 'Nhà vườn «bẻ kèo»', en: 'Growers break the deal',
      textVi: 'Giá vựa tăng, một phần nhà vườn đã hứa bán cho bạn quay sang bán cho thương lái trả cao hơn.', textEn: 'Depot prices rise and some growers who promised to sell to you switch to traders paying more.',
      onlyBuyers: true,
      options: [
        { vi: 'Trả thêm 10% để giữ hàng', en: 'Pay 10% more to keep supply', eff: { buyCost: 0.10, adapt: 2 } },
        { vi: 'Chấp nhận thiếu 20% hàng', en: 'Accept a 20% shortfall', eff: { volume: -0.20 } },
        { vi: 'Ký hợp đồng bao tiêu cho vụ sau (tốn 0,3 tỷ)', en: 'Sign forward contracts for next season (VND 0.3bn)', eff: { cash: -0.3, volume: -0.10, sus: 6, linkedNext: 0.15 } }
      ] },
    { id: 'rain', src: 'rain', vi: 'Mưa trái mùa', en: 'Unseasonal rain',
      textVi: 'Mưa trái mùa làm rụng trái, chín không đều và thối trái do nấm Phytophthora.', textEn: 'Unseasonal rain causes fruit drop, uneven ripening and Phytophthora rot.',
      options: [
        { vi: 'Phun thuốc mạnh để cứu trái', en: 'Spray heavily to save fruit', eff: { loss: 0.03, risk: 0.10 } },
        { vi: 'Thu sớm, bán nội địa phần non', en: 'Harvest early, sell unripe fruit at home', eff: { loss: 0.06, domesticShift: 0.15 } },
        { vi: 'Chấp nhận hao hụt', en: 'Accept the losses', eff: { loss: 0.10, sus: 3 } }
      ] },
    { id: 'salinity', src: 'salinity', vi: 'Hạn mặn', en: 'Salinity intrusion',
      textVi: 'Mặn xâm nhập sâu đúng mùa ra hoa – nuôi trái (tháng 1–4).', textEn: 'Salt water intrudes during flowering and fruit set (January–April).',
      onlySeason: 'off',
      options: [
        { vi: 'Trữ nước ngọt, đắp đê bao (0,5 tỷ)', en: 'Store fresh water, build dykes (VND 0.5bn)', eff: { cash: -0.5, volume: -0.05, sus: 5, adapt: 3 } },
        { vi: 'Mua bù từ Tây Nguyên qua thương lái', en: 'Buy from the Central Highlands via traders', eff: { buyCost: 0.12, risk: 0.05, adapt: 2 } },
        { vi: 'Chấp nhận mất mùa một phần', en: 'Accept a partial crop loss', eff: { volume: -0.25 } }
      ] },
    { id: 'fake', src: 'fakeOrigin', vi: 'Lời mời «dán nhãn Thái»', en: 'Offer to relabel as Thai',
      textVi: 'Một trung gian đề nghị mua lô hàng đẹp nhất của bạn để dán nhãn Thái Lan, trả giá cao hơn nhiều.', textEn: 'A middleman offers to buy your best lot to relabel it as Thai, at a much higher price.',
      options: [
        { vi: 'Từ chối', en: 'Refuse', eff: { rep: 3, sus: 3 } },
        { vi: 'Bán 10% sản lượng cho trung gian', en: 'Sell 10% of output to the middleman', eff: { fraud: 0.10 } }
      ] },
    { id: 'pest', src: 'sampling', vi: 'Phát hiện rệp sáp khi đóng gói', en: 'Mealybugs found while packing',
      textVi: 'Tổ kỹ thuật thấy rệp sáp trên một phần lô hàng chuẩn bị đi chính ngạch.', textEn: 'Your technicians find mealybugs on part of a lot bound for official export.',
      options: [
        { vi: 'Xử lý lại, chuyển phần nghi ngờ sang nội địa', en: 'Re-treat and send suspect fruit to the domestic market', eff: { domesticShift: 0.12, rep: 2 } },
        { vi: 'Vẫn xuất cả lô', en: 'Ship the whole lot anyway', eff: { pestRisk: 0.35 } }
      ] },
    { id: 'glut', src: 'thaiOverlap', vi: 'Hàng dồn, người mua ép giá', en: 'Glut and buyer pressure',
      textVi: 'Hàng về cảng và cửa khẩu dồn dập; người mua Trung Quốc ép giá thêm.', textEn: 'Shipments pile up at ports and border gates; Chinese buyers push prices down.',
      options: [
        { vi: 'Bán ngay giá thấp', en: 'Sell now at a lower price', eff: { priceCN: -0.12 } },
        { vi: 'Trữ lạnh chờ giá (0,4 tỷ, hao thêm)', en: 'Hold in cold storage (VND 0.4bn, more loss)', eff: { cash: -0.4, loss: 0.04, priceCN: -0.03 } },
        { vi: 'Chuyển bớt sang Đài Loan và Nhật', en: 'Divert some to Taiwan and Japan', eff: { capBoost: { TW: 30, JP: 15 }, adapt: 4 } }
      ] },
    { id: 'residue', src: 'japanMRL', vi: 'Cảnh báo dư lượng thuốc', en: 'Pesticide residue warning',
      textVi: 'Một lô sầu riêng Việt Nam sang Nhật bị tiêu hủy vì procymidone vượt giới hạn. Người mua cao cấp đòi chứng nhận kiểm nghiệm.', textEn: 'A Vietnamese lot to Japan was destroyed for procymidone above the limit. Premium buyers demand test certificates.',
      options: [
        { vi: 'Kiểm nghiệm từng lô (0,3 tỷ)', en: 'Test every lot (VND 0.3bn)', eff: { cash: -0.3, risk: -0.08, rep: 2 } },
        { vi: 'Tạm ngừng kênh Nhật vụ này', en: 'Pause Japan this season', eff: { closeJP: true } }
      ] },
    { id: 'thaidrought', src: 'thaiDrought', vi: 'Hạn hán ở Thái Lan', en: 'Drought in Thailand',
      textVi: 'Thái Lan mất mùa do hạn; người mua Trung Quốc tìm nguồn Việt Nam.', textEn: 'Drought cuts the Thai crop; Chinese buyers turn to Vietnam.',
      options: [
        { vi: 'Dồn hàng vào chính ngạch', en: 'Push volume into official trade', eff: { priceCN: 0.12 } },
        { vi: 'Giữ đều các kênh, giữ khách cũ', en: 'Keep channels balanced and keep old buyers', eff: { priceCN: 0.06, rep: 3, adapt: 2 } }
      ] }
  ];

  // Điểm tổng 0–100, công khai từ đầu ván (cùng cấu trúc Hộ Chiếu Thương Hiệu)
  const scoreWeights = { profit: 30, reputation: 20, capability: 20, adaptation: 15, sustainability: 15 };

  // ================= Bản lớp học (theo kế hoạch triển khai BizOn Classroom) =================

  // Đội 5 vai. Nhân vật đất sét dùng chung với Bật Nghiệp; mỗi vai phụ trách một nhóm quyết định.
  const team = [
    { id: 'ceo', name: 'Minh Long', img: 'team/ceo-cut.webp', vi: 'CEO – điều phối, chạy «Nếu – Thì», chốt vụ', en: 'CEO – coordinates, runs what-ifs, commits',
      owns: ['whatif', 'commit'] },
    { id: 'cmo', name: 'Lan Chi', img: 'team/cmo-cut.webp', vi: 'CMO – mua tin, đọc giá, chia kênh bán', en: 'CMO – buys information, reads prices, splits channels',
      owns: ['intel', 'alloc'] },
    { id: 'coo', name: 'Bảo Ngọc', img: 'team/coo-cut.webp', vi: 'COO – nguồn hàng, vùng trồng có mã, hao hụt, nghịch vụ', en: 'COO – sourcing, coded areas, losses, off-season',
      owns: ['linked', 'induce'] },
    { id: 'cfo', name: 'Thu Hà', img: 'team/cfo-cut.webp', vi: 'CFO – tiền mặt, ưu tiên đầu tư, chi phí tuân thủ', en: 'CFO – cash, investment priority, compliance costs',
      owns: ['priority'] },
    { id: 'sec', name: 'Gia Hân', img: 'team/sec-cut.webp', vi: 'SEC – đọc biến cố, ghi phiếu quyết định và nhật ký đội', en: 'SEC – reads events, keeps the decision sheet and team journal',
      owns: ['option', 'journal'] }
  ];

  // Ba đối thủ AI: cùng vai với đội, cùng lõi mô phỏng, chiến lược cố định (minh họa ba lối đi trong ngành)
  const rivals = [
    { id: 'alpha', img: 'rivals/alpha.webp', vi: 'Alpha Durian', en: 'Alpha Durian',
      styleVi: 'Tốc chiến: dồn tiểu ngạch, mua qua thương lái, sẵn sàng «dán nhãn»', styleEn: 'Fast and cheap: border trade, trader sourcing, open to relabelling',
      plan: ['finance', 'finance', 'area', 'finance', 'pack', 'finance'], linked: 0.1, induce: true,
      alloc: { CN: 20, BORDER: 60, FROZEN: 0, TW: 0, JP: 0, DOM: 20 }, options: { fake: 1, pest: 1, rain: 0 } },
    { id: 'mekong', img: 'rivals/mekong.webp', vi: 'Mekong Fruit', en: 'Mekong Fruit',
      styleVi: 'Cân bằng: làm mã số từng bước, giữ cả chính ngạch lẫn nội địa', styleEn: 'Balanced: builds codes step by step, keeps official and domestic channels',
      plan: ['area', 'pack', 'test', 'trace', 'finance', 'finance'], linked: 0.5, induce: true,
      alloc: { CN: 40, BORDER: 25, FROZEN: 0, TW: 10, JP: 0, DOM: 25 }, options: {} },
    { id: 'star', img: 'rivals/star.webp', vi: 'Star Durian', en: 'Star Durian',
      styleVi: 'Cao cấp: kiểm nghiệm, truy xuất, vùng liên kết; nhắm Nhật Bản, Đài Loan, đông lạnh', styleEn: 'Premium: testing, traceability, linked areas; targets Japan, Taiwan, frozen',
      plan: ['test', 'area', 'pack', 'trace', 'freezer', 'test'], linked: 0.9, induce: false,
      alloc: { CN: 40, BORDER: 0, FROZEN: 10, TW: 20, JP: 20, DOM: 10 }, options: { break: 0, glut: 2 } }
  ];

  // Lumina: tối đa 3 câu hỏi mỗi vụ. Lumina giải thích và đặt câu hỏi ngược, không đưa đáp án tối ưu.
  const luminaQuestions = [
    { id: 'risk', vi: 'Rủi ro chính ngạch của đội vụ này đến từ đâu?', en: 'Where does our official-trade risk come from this season?' },
    { id: 'price', vi: 'Nên tin nguồn giá nào?', en: 'Which price source should we trust?' },
    { id: 'channel', vi: 'Kênh nào phù hợp với hồ sơ hiện tại?', en: 'Which channels fit our current credentials?' },
    { id: 'invest', vi: 'Ưu tiên đầu tư nào tạo tác động tích lũy?', en: 'Which investment has a cumulative effect?' },
    { id: 'cash', vi: 'Dòng tiền của đội có đủ an toàn?', en: 'Is our cash position safe?' },
    { id: 'event', vi: 'Biến cố này liên quan khái niệm nào trong kinh doanh quốc tế?', en: 'Which international-business concept does this event illustrate?' }
  ];

  // Nhịp một vụ (khoảng 50–60 phút trên lớp; chơi nhanh 5–7 phút)
  const flow = [
    { id: 'read', min: 5, vi: 'Đọc thị trường', en: 'Read the market' },
    { id: 'meet', min: 10, vi: 'Họp đội theo vai', en: 'Role meeting' },
    { id: 'whatif', min: 5, vi: 'Nếu – Thì (tối đa 2)', en: 'What-if (max 2)' },
    { id: 'lumina', min: 5, vi: 'Hỏi Lumina (tối đa 3)', en: 'Ask Lumina (max 3)' },
    { id: 'sheet', min: 10, vi: 'Phiếu quyết định', en: 'Decision sheet' },
    { id: 'commit', min: 5, vi: 'Chốt vụ', en: 'Commit' },
    { id: 'result', min: 5, vi: 'Kết quả và nhật ký SEC', en: 'Results and SEC journal' }
  ];

  // Khung debrief sau mỗi hai vụ
  const debrief = [
    { id: 'what', vi: 'What? Đội đã quyết định gì và kết quả ra sao?', en: 'What? What did the team decide and what happened?' },
    { id: 'why', vi: 'Why? Vì sao kết quả khác hoặc giống dự báo «Nếu – Thì»?', en: 'Why? Why did results differ from (or match) the what-if forecast?' },
    { id: 'sowhat', vi: 'So what? Điều này liên quan lý thuyết nào (TBT/SPS, phương thức thâm nhập, nâng cấp chuỗi giá trị)?', en: 'So what? Which theory does this relate to (TBT/SPS, entry modes, value-chain upgrading)?' },
    { id: 'nowhat', vi: 'Now what? Đội sẽ thay đổi điều gì ở vụ tiếp theo?', en: 'Now what? What will the team change next season?' }
  ];

  // Rubric gợi ý: kết quả xếp hạng chỉ chiếm 20%
  const rubric = [
    { w: 20, vi: 'Kết quả hoạt động qua 6 vụ (điểm tổng trong game)', en: 'Performance over 6 seasons (in-game total)' },
    { w: 20, vi: 'Chất lượng lập luận trước quyết định (phiếu quyết định)', en: 'Quality of pre-decision reasoning (decision sheets)' },
    { w: 15, vi: 'Phân tích tài chính và vận hành', en: 'Financial and operational analysis' },
    { w: 15, vi: 'Khả năng thích nghi qua các vụ', en: 'Adaptation across seasons' },
    { w: 15, vi: 'Nhật ký SEC và phản tư', en: 'SEC journal and reflection' },
    { w: 10, vi: 'Hợp tác và đóng góp cá nhân', en: 'Collaboration and individual contribution' },
    { w: 5, vi: 'Báo cáo hoặc pitch cuối kỳ', en: 'Final report or pitch' }
  ];

  // Cột của nhật ký sự kiện (event log) xuất CSV
  const eventLogColumns = ['event_id', 'timestamp', 'class_id', 'team_id', 'round_id', 'role', 'event_type', 'old_value', 'new_value', 'device_session', 'committed'];

  const api = { sources, facts, params, roles, channels, priorities, intel, seasons, events, scoreWeights,
    team, rivals, luminaQuestions, flow, debrief, rubric, eventLogColumns };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DurianData = api;
})(typeof window !== 'undefined' ? window : globalThis);
