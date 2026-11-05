/* Dây Chuyền Sầu Riêng (Durian Packing Line) – học liệu đi kèm Hộ Chiếu Sầu Riêng.
   © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
   Dữ liệu và luật chấm, thuần, không đụng DOM: chạy được trong trình duyệt và trong Node.
   Cùng dây chuyền, cùng thông số thì cùng kết quả (tất định, không có số ngẫu nhiên).
   Không dùng engine Hộ Chiếu: đây là trò chơi riêng về khâu sơ chế, đóng gói, không đổi kết quả 6 vụ.
   Mọi khoảng số dưới đây là QUY ƯỚC DẠY HỌC tổng hợp, không phải tiêu chuẩn TCVN hay quy định
   của hải quan nước nhập khẩu. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DayChuyenData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---- 11 trạm ----
  const TRAM = {
    cat: { icon: '✂️',
      vi: { ten: 'Cắt trái', ngan: 'Cắt cuống khi trái đủ già',
        mo: 'Cắt cả cuống, không để trái rụng tự nhiên rơi xuống đất (dập, nhiễm nấm). Trái đặt lên đệm, không chất đống giữa nắng.' },
      en: { ten: 'Harvest', ngan: 'Cut the stalk at the right maturity',
        mo: 'Cut with the stalk on; never let fruit drop to the ground (bruising, fungal infection). Lay fruit on padding, not in a heap in the sun.' } },
    tiepNhan: { icon: '📋',
      vi: { ten: 'Tiếp nhận & mã vùng trồng', ngan: 'Ghi mã vùng trồng, lập lô',
        mo: 'Mỗi lô ghi mã số vùng trồng và nhà vườn. Hàng xuất chính ngạch phải truy được ngược về vùng trồng đã được cấp mã.' },
      en: { ten: 'Intake & area code', ngan: 'Record planting-area code, make lots',
        mo: 'Each lot records the planting-area code and the grower. Official exports must trace back to a registered planting area.' } },
    phanLoai: { icon: '⚖️',
      vi: { ten: 'Phân loại & cân', ngan: 'Loại trái nứt, sâu, méo; chia cỡ',
        mo: 'Gõ nghe tiếng, xem gai và cuống; loại trái nứt, sâu đục, méo; cân và chia cỡ theo đơn hàng.' },
      en: { ten: 'Grading & weighing', ngan: 'Reject cracked, bored, misshapen fruit; size',
        mo: 'Tap and listen, check spines and stalk; reject cracked, borer-damaged or misshapen fruit; weigh and size to the order.' } },
    lamSach: { icon: '🧽',
      vi: { ten: 'Làm sạch & xử lý', ngan: 'Chải bụi, thổi khí, xử lý rệp sáp',
        mo: 'Chải đất cát trong kẽ gai, thổi khí hoặc xịt rửa; kiểm và xử lý rệp sáp, nấm thối trái, vì đây là đối tượng kiểm dịch hay bị bắt lỗi.' },
      en: { ten: 'Cleaning & treatment', ngan: 'Brush, air-blow, treat mealybugs',
        mo: 'Brush soil out from between the spines, air-blow or rinse; check and treat mealybugs and fruit rot – common quarantine failures.' } },
    kiemMau: { icon: '🧪',
      vi: { ten: 'Kiểm mẫu phòng lab', ngan: 'Dư lượng, kim loại nặng, chất cấm',
        mo: 'Lấy mẫu gửi phòng thử nghiệm: dư lượng thuốc bảo vệ thực vật, kim loại nặng (cadimi), chất tạo màu cấm (vàng O). Có phiếu kết quả mới được đóng lô.' },
      en: { ten: 'Lab sampling', ngan: 'Residues, heavy metals, banned dyes',
        mo: 'Send samples to a testing lab: pesticide residues, heavy metals (cadmium), banned dyes (auramine O). The lot is closed only once the test report is in.' } },
    tachMui: { icon: '🔪',
      vi: { ten: 'Bổ & tách múi', ngan: 'Bổ trái, lấy cơm trong phòng sạch',
        mo: 'Bổ trái trong khu sạch, người làm đeo găng, khẩu trang; lấy múi nguyên, loại múi sượng, múi nhão. Từ đây là thực phẩm hở, dễ nhiễm khuẩn.' },
      en: { ten: 'Opening & de-segmenting', ngan: 'Open fruit, take pulp in a clean room',
        mo: 'Open fruit in a clean area with gloves and masks; keep whole segments, reject hard or mushy ones. From here it is exposed food and easily contaminated.' } },
    hutChan: { icon: '🫙',
      vi: { ten: 'Hút chân không', ngan: 'Cho múi vào khay, hút chân không',
        mo: 'Xếp múi vào khay hoặc túi, hút chân không, hàn kín. Bớt không khí thì múi ít bị oxy hoá và giữ mùi.' },
      en: { ten: 'Vacuum packing', ngan: 'Tray the pulp, vacuum-seal',
        mo: 'Lay segments in trays or bags, vacuum and seal. Less air means less oxidation and the aroma stays in.' } },
    capDong: { icon: '❄️',
      vi: { ten: 'Cấp đông nhanh', ngan: 'Hạ nhanh xuống khoảng −35 đến −40 °C',
        mo: 'Tủ cấp đông gió hoặc IQF hạ nhiệt thật nhanh để tinh thể đá nhỏ, rã đông ít chảy nước. Cấp đông chậm thì múi nhão.' },
      en: { ten: 'Blast freezing', ngan: 'Drop fast to about −35 to −40 °C',
        mo: 'Blast or IQF freezers chill very fast so ice crystals stay small and thawed pulp keeps its texture. Slow freezing makes it mushy.' } },
    dongThung: { icon: '📦',
      vi: { ten: 'Dán tem & đóng thùng', ngan: 'Tem truy xuất, thùng có lỗ thông khí',
        mo: 'Dán tem ghi mã vùng trồng, mã cơ sở đóng gói, tên hàng; xếp vào thùng carton đúng quy cách đơn hàng.' },
      en: { ten: 'Labelling & boxing', ngan: 'Trace labels, ventilated cartons',
        mo: 'Label with the planting-area code, packhouse code and product name; pack into cartons to the order spec.' } },
    kho: { icon: '🚚',
      vi: { ten: 'Kho lạnh & container', ngan: 'Giữ nhiệt độ suốt đường đi',
        mo: 'Đưa vào kho lạnh rồi container lạnh. Hàng tươi giữ mát; hàng đông giữ đông sâu. Nhiệt độ đặt ở thanh trượt bên dưới.' },
      en: { ten: 'Cold store & reefer', ngan: 'Hold temperature all the way',
        mo: 'Into the cold store, then a reefer container. Fresh fruit stays cool; frozen stays deep-frozen. Set the temperature with the slider below.' } },
    kiemDich: { icon: '🛂',
      vi: { ten: 'Kiểm dịch & thông quan', ngan: 'Chứng thư kiểm dịch, hồ sơ lô',
        mo: 'Cơ quan kiểm dịch thực vật kiểm lô, cấp chứng thư; hồ sơ khớp mã vùng trồng, mã cơ sở đóng gói, phiếu kiểm nghiệm.' },
      en: { ten: 'Quarantine & customs', ngan: 'Phytosanitary certificate, lot file',
        mo: 'Plant-quarantine officers inspect the lot and issue the certificate; the file must match the area code, packhouse code and lab report.' } }
  };
  // Ảnh 3D đất sét có sẵn trong assets/hc (dùng chung với Hộ Chiếu Sầu Riêng): «vat» là vật dụng của trạm,
  // «canh» là cảnh 3D minh họa trạm ấy. Đường dẫn tính từ thư mục assets/hc/.
  const ANH = {
    cat:       { vat: 'tool/keo-cat-canh.webp',          canh: 'durian/chang-2-thu-hoach-brix.webp' },
    tiepNhan:  { vat: 'stamp/ma-puc.webp',               canh: 'chain2/03-vuon-ma-vung-trong.webp' },
    phanLoai:  { vat: 'tool/can-dien-tu.webp',           canh: 'chain2/04-thu-hoach-dong-goi.webp' },
    lamSach:   { vat: 'tool/xe-rua-sau-rieng.webp',      canh: 'durian/chang-3-rua-phan-loai-phc.webp' },
    kiemMau:   { vat: 'tool/kinh-lup.webp',              canh: 'chain2/06-lab-do-brix.webp' },
    tachMui:   { vat: 'tool/trai-sau-rieng.webp',        canh: 'durian/nha-may-che-bien-phc.webp' },
    hutChan:   { vat: 'stamp/ma-phc.webp',               canh: 'chain2/34-nha-may-che-bien.webp' },
    capDong:   { vat: 'stamp/chuoi-lanh-cap-dong.webp',  canh: 'durian/chang-4-cap-dong-iqf.webp' },
    dongThung: { vat: 'tool/thung-xuat-khau-grade-a.webp', canh: 'durian/chang-5-qr-kiem-dich.webp' },
    kho:       { vat: 'tool/xe-tai-lanh.webp',           canh: 'chain2/12-dong-cont-lanh.webp' },
    kiemDich:  { vat: 'tool/con-dau-pass.webp',          canh: 'chain2/11-kiem-dich-noi-dia.webp' },
    don: { 'tuoi-cn': 'chain2/21-xe-lanh-cua-khau-huu-nghi.webp', 'dong-nguyen': 'durian/container-lanh-cang.webp',
           'mui-dong': 'chain2/36-quan-trang-mieng.webp', 'tuoi-nd': 'chain2/38-sieu-thi-gia-dinh.webp' },
    trai: 'tool/trai-sau-rieng.webp', nhaMay: 'scene/nha-may-cap-dong.webp'
  };
  const THU_TU_KHO = ['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'tachMui', 'hutChan', 'capDong', 'dongThung', 'kho', 'kiemDich'];

  // ---- 4 đơn hàng. Khoảng chấm: [tốt từ, tốt đến, tạm từ, tạm đến]; ngoài khoảng «tạm» là hỏng.
  // phuongAn: các thứ tự đúng đầy đủ; canCo: trạm bắt buộc. Dây chuyền đúng khi là dãy con của một phương án
  // và có đủ trạm bắt buộc.
  const DON = [
    { id: 'tuoi-cn', icon: '🇨🇳',
      phuongAn: [['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'dongThung', 'kho', 'kiemDich']],
      canCo: ['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'dongThung', 'kho', 'kiemDich'],
      chin: [75, 85, 70, 90], gio: [0, 24, 0, 48], nhiet: [12, 15, 10, 18],
      vi: { ten: 'Trái tươi xuất chính ngạch', khach: 'Nhà nhập khẩu ở Quảng Tây',
        tomTat: 'Trái nguyên, còn tươi, đi container lạnh đường bộ qua cửa khẩu, khoảng 5–7 ngày mới tới tay người bán.',
        bienCo: 'Năm 2025 phía nhập khẩu siết kiểm tra cadimi và chất vàng O. Lô không có phiếu kiểm nghiệm thì dừng ở cửa khẩu.',
        chin: 'Đi xa nhiều ngày, trái tiếp tục chín trên đường: cắt già quá thì tới nơi nứt múi, rụng cuống; non quá thì cơm sượng, không chín được.',
        nhiet: 'Mát vừa để trái chín chậm. Dưới khoảng 10 °C vỏ dễ thâm đen do tổn thương lạnh; trên 18 °C trái chín nhanh, nứt.',
        gio: 'Từ lúc cắt tới khi vào kho lạnh càng ngắn càng đỡ hao: trái đang thở mạnh, để lâu ngoài trời thì mất nước và chín không đều.' },
      en: { ten: 'Fresh fruit, official export', khach: 'Importer in Guangxi',
        tomTat: 'Whole fresh fruit by reefer truck through the border gate; about 5–7 days before it reaches the seller.',
        bienCo: 'In 2025 the importing side tightened checks for cadmium and auramine O. Lots without a lab report stop at the border.',
        chin: 'On a long trip the fruit keeps ripening: cut too ripe and it arrives split with stalks dropping; too young and the pulp stays hard and never ripens.',
        nhiet: 'Cool enough to ripen slowly. Below about 10 °C the husk blackens from chilling injury; above 18 °C it ripens fast and splits.',
        gio: 'The shorter the time from cutting to cold store, the smaller the loss: the fruit is respiring hard and dries out and ripens unevenly in the open.' } },
    { id: 'dong-nguyen', icon: '🚢',
      phuongAn: [['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'capDong', 'dongThung', 'kho', 'kiemDich'],
                 ['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'dongThung', 'capDong', 'kho', 'kiemDich']],
      canCo: ['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'capDong', 'dongThung', 'kho', 'kiemDich'],
      chin: [85, 95, 80, 100], gio: [0, 24, 0, 36], nhiet: [-40, -18, -40, -12],
      vi: { ten: 'Nguyên trái cấp đông', khach: 'Nhà phân phối đi tàu biển',
        tomTat: 'Trái nguyên cấp đông, đi tàu biển 10–14 ngày. Không cần chín chậm nữa, cần giữ đông sâu suốt đường.',
        bienCo: 'Đường biển dài: hàng tươi không đi kịp, phải cấp đông trước khi đóng container.',
        chin: 'Cấp đông «khoá» độ chín lúc cắt: trái phải gần chín ăn được. Non thì rã đông ra cơm sượng, nhạt.',
        nhiet: 'Sau cấp đông, kho và container giữ từ −18 °C trở xuống. Ấm hơn khoảng −12 °C thì đá tan dần, múi nhão, mất mùi.',
        gio: 'Trái gần chín để lâu ngoài kho sẽ nứt, chảy nhựa trước khi kịp cấp đông.' },
      en: { ten: 'Whole frozen fruit', khach: 'Distributor shipping by sea',
        tomTat: 'Whole fruit, frozen, 10–14 days by sea. No slow ripening needed – it must stay deep-frozen all the way.',
        bienCo: 'A long sea route: fresh fruit would not last, so it must be frozen before the container is loaded.',
        chin: 'Freezing locks in the ripeness at cutting: the fruit must be nearly ready to eat. Young fruit thaws hard and bland.',
        nhiet: 'After freezing, store and container hold −18 °C or colder. Warmer than about −12 °C the ice slowly melts, the pulp turns mushy and loses aroma.',
        gio: 'Nearly ripe fruit left out too long splits and weeps before it can be frozen.' } },
    { id: 'mui-dong', icon: '🍰',
      phuongAn: [['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'tachMui', 'hutChan', 'capDong', 'dongThung', 'kho', 'kiemDich']],
      canCo: ['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'tachMui', 'hutChan', 'capDong', 'dongThung', 'kho', 'kiemDich'],
      chin: [90, 100, 85, 100], gio: [0, 12, 0, 24], nhiet: [-40, -18, -40, -12],
      vi: { ten: 'Múi cấp đông hút chân không', khach: 'Chuỗi tráng miệng và làm bánh',
        tomTat: 'Chỉ lấy cơm: bổ trái, tách múi, hút chân không, cấp đông. Khách dùng làm bánh, kem, chè.',
        bienCo: 'Từ lúc bổ trái, múi là thực phẩm hở. Khách yêu cầu nhanh và sạch: cắt xong phải vào khâu bổ, đóng gói, cấp đông ngay trong ngày.',
        chin: 'Làm bánh, làm kem cần múi chín mềm, thơm. Múi non khó tách hạt, vị nhạt, phải loại nhiều.',
        nhiet: 'Múi đã hút chân không vẫn cần đông sâu từ −18 °C trở xuống; ấm hơn thì nước đá tan, túi phồng, múi chua.',
        gio: 'Trái chín kỹ thì cơm dễ lên men: càng để lâu trước khi bổ và cấp đông càng dễ chua, nhão.' },
      en: { ten: 'Vacuum-packed frozen pulp', khach: 'Dessert and bakery chain',
        tomTat: 'Pulp only: open the fruit, take the segments, vacuum-pack, freeze. The buyer makes cakes, ice cream, sweet soups.',
        bienCo: 'Once opened, the pulp is exposed food. The buyer wants it fast and clean: from cutting to opening, packing and freezing within the day.',
        chin: 'Cakes and ice cream need soft, fragrant pulp. Young segments are hard to de-seed, bland, and many get rejected.',
        nhiet: 'Vacuum-packed pulp still needs −18 °C or colder; warmer and the ice melts, bags swell, the pulp sours.',
        gio: 'Fully ripe pulp ferments easily: the longer before opening and freezing, the more it sours and softens.' } },
    { id: 'tuoi-nd', icon: '🛒',
      phuongAn: [['cat', 'tiepNhan', 'phanLoai', 'lamSach', 'kiemMau', 'dongThung', 'kho']],
      canCo: ['cat', 'phanLoai', 'lamSach', 'dongThung', 'kho'],
      chin: [85, 95, 80, 100], gio: [0, 24, 0, 48], nhiet: [15, 22, 10, 28],
      vi: { ten: 'Trái tươi bán trong nước', khach: 'Siêu thị ở TP.HCM, giao trong 1 ngày',
        tomTat: 'Đường gần, khách mua về ăn trong vài ngày. Không cần hồ sơ xuất khẩu, nhưng vẫn phải sạch và có tem.',
        bienCo: 'Không phải xuất khẩu: thêm khâu không cần thiết chỉ tốn tiền và giờ. Mã vùng trồng và kiểm mẫu không bắt buộc nhưng siêu thị đánh giá cao.',
        chin: 'Khách ăn trong vài ngày nên cắt già hơn hàng xuất khẩu; non thì để mãi không chín, khách trả lại.',
        nhiet: 'Đi xe mát một ngày là đủ. Lạnh dưới khoảng 10 °C thì thâm vỏ; nóng trên 28 °C thì nứt và bốc mùi trong xe.',
        gio: 'Đường gần nhưng vẫn nên đưa vào kho mát trong ngày để trái chín đều.' },
      en: { ten: 'Fresh fruit, domestic', khach: 'Supermarket in Ho Chi Minh City, 1-day delivery',
        tomTat: 'Short trip; shoppers eat it within days. No export paperwork, but it must be clean and labelled.',
        bienCo: 'Not an export: extra steps only cost money and time. Area codes and lab tests are optional but the supermarket values them.',
        chin: 'Eaten within days, so cut riper than export fruit; young fruit never ripens and gets returned.',
        nhiet: 'A cool truck for one day is enough. Below about 10 °C the husk blackens; above 28 °C it splits and smells up the truck.',
        gio: 'Short trip, but still get it into a cool store the same day so it ripens evenly.' } }
  ];

  const tl = (o, lang) => o[lang === 'en' ? 'en' : 'vi'];
  const tenTram = (id, lang) => tl(TRAM[id], lang).ten;

  // Thông số tham khảo: giữa khoảng «tốt»; hàng đông lấy −25 °C.
  function thamKhao(don) {
    const giua = r => Math.round((r[0] + r[1]) / 2);
    return { chin: giua(don.chin), gio: Math.max(6, Math.min(12, don.gio[1])), nhiet: don.nhiet[1] <= -18 ? -25 : giua(don.nhiet) };
  }

  function laDayCon(a, b) { let j = 0; for (const x of b) if (x === a[j]) j++; return j === a.length; }

  function lyDoThua(x, lang) {
    const L = (vi, en) => (lang === 'en' ? en : vi);
    if (x === 'tachMui' || x === 'hutChan') return L('đơn này bán trái nguyên, không bổ.', 'this order sells whole fruit, not opened.');
    if (x === 'capDong') return L('đơn này bán trái tươi; cấp đông xong thì không còn là hàng tươi.', 'this order is fresh fruit; once frozen it is no longer fresh.');
    if (x === 'kiemDich') return L('bán trong nước không qua cửa khẩu, không cần chứng thư kiểm dịch xuất khẩu.', 'domestic sales cross no border and need no export phytosanitary certificate.');
    return L('không cần cho đơn này.', 'not needed for this order.');
  }

  // Kiểm thứ tự. Trả { dung, loi: [{ id, vi, en }] }.
  function kiemThuTu(don, day) {
    const loi = [];
    const both = f => ({ vi: f('vi'), en: f('en') });
    const trung = day.filter((x, i) => day.indexOf(x) !== i);
    if (trung.length) loi.push({ id: 'trung', ...both(l => (l === 'en' ? 'Station «' + tenTram(trung[0], l) + '» is placed twice.' : 'Trạm «' + tenTram(trung[0], l) + '» xếp hai lần.')) });
    const tatCa = new Set(don.phuongAn.flat());
    for (const x of day) if (!tatCa.has(x))
      loi.push({ id: 'thua:' + x, ...both(l => (l === 'en' ? '«' + tenTram(x, l) + '» does not belong on this line: ' : '«' + tenTram(x, l) + '» không thuộc dây chuyền này: ') + lyDoThua(x, l)) });
    for (const x of don.canCo) if (!day.includes(x))
      loi.push({ id: 'thieu:' + x, ...both(l => (l === 'en' ? 'Missing «' : 'Thiếu «') + tenTram(x, l) + '»: ' + tl(TRAM[x], l).ngan.toLowerCase() + '.') });
    const hopLe = day.filter(x => tatCa.has(x));
    if (!trung.length && !don.phuongAn.some(p => laDayCon(hopLe, p))) {
      const p = don.phuongAn[0];
      const sai = hopLe.find((x, i) => i > 0 && p.indexOf(x) < p.indexOf(hopLe[i - 1]));
      const truoc = sai ? hopLe[hopLe.indexOf(sai) - 1] : null;
      loi.push({ id: 'thu-tu', ...both(l => sai
        ? (l === 'en' ? '«' + tenTram(truoc, l) + '» before «' + tenTram(sai, l) + '» is the wrong way round.' : '«' + tenTram(truoc, l) + '» đặt trước «' + tenTram(sai, l) + '» là ngược.')
        : (l === 'en' ? 'The station order is not right yet.' : 'Thứ tự các trạm chưa đúng.')) });
    }
    return { dung: loi.length === 0, loi };
  }

  // Gợi ý trạm tiếp theo (không trừ điểm ở đây; giao diện đếm số lần xin gợi ý).
  function goiY(don, day, lang) {
    const L = (vi, en) => (lang === 'en' ? en : vi);
    const dich = don.phuongAn[0].filter(x => don.canCo.includes(x));
    const thua = day.find(x => !don.phuongAn.flat().includes(x));
    if (thua) return L('Bỏ «' + tenTram(thua, lang) + '»: đơn này không cần trạm ấy.', 'Remove «' + tenTram(thua, lang) + '»: this order does not need it.');
    const chi = day.filter(x => dich.includes(x));
    let k = 0; while (k < chi.length && chi[k] === dich[k]) k++;
    if (k < chi.length) return L('Sau «' + (k ? tenTram(dich[k - 1], lang) : 'đầu dây chuyền') + '» nên là «' + tenTram(dich[k], lang) + '», không phải «' + tenTram(chi[k], lang) + '».',
      'After «' + (k ? tenTram(dich[k - 1], lang) : 'the start') + '» comes «' + tenTram(dich[k], lang) + '», not «' + tenTram(chi[k], lang) + '».');
    if (k < dich.length) return L('Trạm tiếp theo: «' + tenTram(dich[k], lang) + '».', 'Next station: «' + tenTram(dich[k], lang) + '».');
    return L('Các trạm bắt buộc đã đủ và đúng thứ tự. Giờ chỉnh ba thanh thông số.', 'All required stations are in, in order. Now set the three sliders.');
  }

  function muc(v, r) { if (v >= r[0] && v <= r[1]) return 'tot'; if (v >= r[2] && v <= r[3]) return 'tam'; return 'hong'; }

  const DIEM = { thuTu: 40, chin: 20, gio: 15, nhiet: 25, goiY: 5 };

  // Chấm một đơn. day: mảng id trạm; ts: { chin, gio, nhiet }; soGoiY: số lần xin gợi ý.
  function cham(don, day, ts, soGoiY) {
    const tt = kiemThuTu(don, day);
    const loiThua = tt.loi.filter(l => l.id.startsWith('thua:')).length;
    const loiKhac = tt.loi.length - loiThua;
    const dThuTu = tt.dung ? DIEM.thuTu : Math.max(0, DIEM.thuTu - 10 * loiKhac - 5 * loiThua);
    const phan = { tot: 1, tam: 0.5, hong: 0 };
    const mc = { chin: muc(ts.chin, don.chin), gio: muc(ts.gio, don.gio), nhiet: muc(ts.nhiet, don.nhiet) };
    // Nhiệt độ âm mà dây chuyền không có trạm cấp đông: mâu thuẫn, nhiệt độ tính là hỏng.
    const coCapDong = day.includes('capDong');
    const dongKhongCapDong = ts.nhiet < 0 && !coCapDong;
    if (dongKhongCapDong) mc.nhiet = 'hong';
    const d = { thuTu: dThuTu, chin: DIEM.chin * phan[mc.chin], gio: DIEM.gio * phan[mc.gio], nhiet: DIEM.nhiet * phan[mc.nhiet], goiY: -DIEM.goiY * (soGoiY || 0) };
    const tong = Math.max(0, Math.round(d.thuTu + d.chin + d.gio + d.nhiet + d.goiY));
    // Lô bị trả: thiếu làm sạch / kiểm mẫu / kiểm dịch (khi đơn bắt buộc), thông số hỏng, hoặc từ hai lỗi thứ tự.
    const thieuChot = ['kiemMau', 'kiemDich', 'lamSach'].filter(x => don.canCo.includes(x) && !day.includes(x));
    const hong = Object.values(mc).includes('hong');
    const ketQua = (thieuChot.length || hong || (!tt.dung && loiKhac >= 2)) ? 'tra' : (tong >= 85 ? 'dat' : 'giam-gia');
    // Lô bị trả thì tối đa 1 sao, dù điểm cao: điểm đo cách làm, kết quả lô là khách có nhận hay không.
    const sao = Math.min(ketQua === 'tra' ? 1 : 3, tong >= 90 ? 3 : tong >= 70 ? 2 : tong >= 45 ? 1 : 0);
    const nx = (l) => {
      const L = (vi, en) => (l === 'en' ? en : vi);
      const t = tl(don, l);
      return [
        ...(tt.dung ? [{ nhom: 'thuTu', muc: 'tot', text: L('Dây chuyền đúng thứ tự, đủ trạm.', 'The line is complete and in the right order.') }] : []),
        ...tt.loi.map(x => ({ nhom: 'thuTu', muc: 'hong', text: x[l === 'en' ? 'en' : 'vi'] })),
        { nhom: 'chin', muc: mc.chin, text: L('Độ già khi cắt ' + ts.chin + '% (tốt: ' + don.chin[0] + '–' + don.chin[1] + '%). ', 'Maturity at cutting ' + ts.chin + '% (good: ' + don.chin[0] + '–' + don.chin[1] + '%). ') + t.chin },
        { nhom: 'gio', muc: mc.gio, text: L('Từ cắt đến kho lạnh ' + ts.gio + ' giờ (tốt: không quá ' + don.gio[1] + ' giờ). ', 'Cutting to cold store ' + ts.gio + ' h (good: at most ' + don.gio[1] + ' h). ') + t.gio },
        { nhom: 'nhiet', muc: mc.nhiet, text: (dongKhongCapDong
          ? L('Đặt ' + ts.nhiet + ' °C mà dây chuyền không có trạm cấp đông: trái tươi đông đá dần trong container, vỏ thâm, cơm úng. ', 'Set to ' + ts.nhiet + ' °C with no freezing station: fresh fruit slowly freezes in the container, the husk blackens, the pulp goes soggy. ')
          : L('Nhiệt độ kho và container ' + ts.nhiet + ' °C (tốt: ' + don.nhiet[0] + ' đến ' + don.nhiet[1] + ' °C). ', 'Store and container ' + ts.nhiet + ' °C (good: ' + don.nhiet[0] + ' to ' + don.nhiet[1] + ' °C). ')) + t.nhiet }
      ];
    };
    return { tong, diem: d, muc: mc, ketQua, sao, thuTu: tt, nhanXet: { vi: nx('vi'), en: nx('en') } };
  }

  const KET_QUA = {
    vi: { dat: '✅ Lô đạt, giao đủ giá', 'giam-gia': '⚠️ Lô nhận nhưng bị ép giá', tra: '⛔ Lô bị trả về' },
    en: { dat: '✅ Lot accepted at full price', 'giam-gia': '⚠️ Lot accepted at a discount', tra: '⛔ Lot rejected' }
  };

  return { TRAM, ANH, THU_TU_KHO, DON, DIEM, KET_QUA, tl, tenTram, thamKhao, kiemThuTu, goiY, muc, cham };
});
