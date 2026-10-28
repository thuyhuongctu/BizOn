/* BizOn — Xưởng Nhãn Hiệu (xuong-nhan-hieu.html): dữ liệu và luật góp ý.
 * © 2026 Đỗ Thùy Hương & PGS.TS. Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Bài tập chương 5 học phần Khởi sự doanh nghiệp: một nhóm sinh viên khởi nghiệp bán đặc sản địa phương
 * (nông sản chế biến hoặc thủ công truyền thống); quy mô nhỏ, vốn ít, chưa có thương hiệu, khách trong nước,
 * ưu tiên bán trực tuyến và trực tiếp. Sinh viên đặt tên thương hiệu, slogan, giải thích; rồi thiết kế 4P.
 *
 * Lumina góp ý THEO LUẬT CỐ ĐỊNH (không gọi mô hình ngôn ngữ): cùng bài làm thì cùng lời góp ý, và mỗi lời
 * góp ý nói rõ vì sao. Lời góp ý không phải điểm: không có thang điểm riêng ở đây (bộ chấm duy nhất của BizOn
 * là js/bizon-grading.js); giảng viên chấm bài chuyên cần theo yêu cầu của học phần.
 * Chạy được trong trình duyệt (window.BizOnBrandWorkshop) và trong Node (module.exports) để kiểm thử.
 */
(function (root) {
  'use strict';

  // ---------- gợi ý sản phẩm (sinh viên chọn hoặc tự gõ; địa danh theo tên gọi truyền thống của đặc sản) ----------
  const GOI_Y = {
    'nong-san': [
      { vi: 'Kẹo dừa (Bến Tre)', en: 'Coconut candy (Bến Tre)' },
      { vi: 'Bánh pía (Sóc Trăng)', en: 'Pía cake (Sóc Trăng)' },
      { vi: 'Mắm cá (Châu Đốc, An Giang)', en: 'Fermented fish (Châu Đốc, An Giang)' },
      { vi: 'Nem Lai Vung (Đồng Tháp)', en: 'Lai Vung fermented pork (Đồng Tháp)' },
      { vi: 'Hạt sen sấy (Đồng Tháp)', en: 'Dried lotus seeds (Đồng Tháp)' },
      { vi: 'Khóm Cầu Đúc sấy dẻo (Hậu Giang)', en: 'Soft-dried Cầu Đúc pineapple (Hậu Giang)' },
      { vi: 'Bánh tráng Thuận Hưng (Cần Thơ)', en: 'Thuận Hưng rice paper (Cần Thơ)' },
      { vi: 'Mật ong rừng U Minh (Cà Mau)', en: 'U Minh forest honey (Cà Mau)' },
    ],
    'thu-cong': [
      { vi: 'Chiếu Định Yên (Đồng Tháp)', en: 'Định Yên sedge mats (Đồng Tháp)' },
      { vi: 'Gốm đỏ Mang Thít (Vĩnh Long)', en: 'Mang Thít red pottery (Vĩnh Long)' },
      { vi: 'Lụa Tân Châu (An Giang)', en: 'Tân Châu silk (An Giang)' },
      { vi: 'Đồ đan lục bình (miền Tây)', en: 'Water-hyacinth weaving (Mekong Delta)' },
    ],
  };
  const NHOM = { 'nong-san': { vi: 'Nông sản chế biến', en: 'Processed farm product' }, 'thu-cong': { vi: 'Thủ công truyền thống', en: 'Traditional handicraft' } };

  // ---------- các lựa chọn 4P ----------
  const THUOC_TINH = [   // điểm nổi bật của sản phẩm (chọn 1–3)
    { id: 'nguon-goc', vi: 'Nguồn gốc rõ ràng (vùng nguyên liệu, nơi làm)', en: 'Clear origin (sourcing area, maker)' },
    { id: 'cong-thuc', vi: 'Công thức hoặc kỹ thuật truyền thống', en: 'Traditional recipe or technique' },
    { id: 'nghe-nhan', vi: 'Làm bởi nghệ nhân, hộ làng nghề', en: 'Made by artisans or craft-village households' },
    { id: 'an-toan', vi: 'An toàn, ít phụ gia, hạn dùng rõ', en: 'Safe, few additives, clear shelf life' },
    { id: 'bao-bi', vi: 'Bao bì kể chuyện địa phương', en: 'Packaging that tells a local story' },
    { id: 'qua-tang', vi: 'Hộp quà tặng (Tết, du lịch)', en: 'Gift box (Tết, travel)' },
    { id: 'chung-nhan', vi: 'Có chứng nhận (OCOP, VietGAP…) hoặc đang làm hồ sơ', en: 'Certified (OCOP, VietGAP…) or applying' },
    { id: 'nho-gon', vi: 'Gói nhỏ, dễ mang, dễ gửi', en: 'Small packs, easy to carry and ship' },
  ];
  const GIA = [
    { id: 'tham-nhap', vi: 'Giá thâm nhập (thấp lúc đầu để có khách)', en: 'Penetration (low at first to win customers)' },
    { id: 'gia-tri', vi: 'Giá theo giá trị cảm nhận (câu chuyện, chất lượng)', en: 'Value-based (story, quality)' },
    { id: 'ngang', vi: 'Ngang giá đối thủ', en: 'Match competitors' },
    { id: 'hot-vang', vi: 'Giá hớt váng (cao lúc đầu, giảm dần)', en: 'Skimming (high at first, then lower)' },
    { id: 'cao-cap', vi: 'Giá cao cấp (định vị sang)', en: 'Premium positioning' },
  ];
  const KENH = [
    { id: 'san-tmdt', loai: 'online', vi: 'Sàn thương mại điện tử (Shopee, Lazada, TikTok Shop)', en: 'E-commerce marketplaces (Shopee, Lazada, TikTok Shop)' },
    { id: 'mxh', loai: 'online', vi: 'Bán qua mạng xã hội (Facebook, Zalo)', en: 'Social selling (Facebook, Zalo)' },
    { id: 'web', loai: 'online', vi: 'Trang web riêng', en: 'Own website' },
    { id: 'cho', loai: 'truc-tiep', vi: 'Chợ, quầy bán tại chỗ', en: 'Market stall, on-site counter' },
    { id: 'hoi-cho', loai: 'truc-tiep', vi: 'Hội chợ, phiên chợ đặc sản, sự kiện trường', en: 'Fairs, specialty markets, campus events' },
    { id: 'cua-hang', loai: 'trung-gian', vi: 'Gửi bán ở cửa hàng đặc sản, quà lưu niệm', en: 'Consignment at specialty or souvenir shops' },
    { id: 'du-lich', loai: 'trung-gian', vi: 'Hợp tác điểm du lịch, homestay', en: 'Tourist spots, homestays' },
    { id: 'sieu-thi', loai: 'trung-gian', vi: 'Chuỗi siêu thị', en: 'Supermarket chains' },
  ];
  const QUANG_BA = [
    { id: 'video-ngan', online: true, vi: 'Video ngắn (TikTok, Reels)', en: 'Short videos (TikTok, Reels)' },
    { id: 'livestream', online: true, vi: 'Livestream bán hàng', en: 'Live-stream selling' },
    { id: 'koc', online: true, vi: 'Hợp tác KOC/KOL nhỏ ở địa phương', en: 'Small local KOCs/KOLs' },
    { id: 'cau-chuyen', vi: 'Kể chuyện nghệ nhân, vùng nguyên liệu', en: 'Artisan and sourcing-area stories' },
    { id: 'dung-thu', vi: 'Cho dùng thử tại hội chợ, quầy', en: 'Free tasting or trials at fairs and stalls' },
    { id: 'review', online: true, vi: 'Khuyến khích khách đánh giá, chia sẻ', en: 'Customer reviews and sharing' },
    { id: 'qua-tet', vi: 'Gói quà theo mùa (Tết, Trung thu)', en: 'Seasonal gift sets (Tết, Mid-Autumn)' },
    { id: 'giam-gia', vi: 'Giảm giá, mã khuyến mãi', en: 'Discounts and promo codes' },
  ];

  // ---------- tiện ích chữ ----------
  const boDau = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const tu = s => String(s || '').trim().split(/\s+/).filter(Boolean);
  const soTu = s => tu(s).length;
  const coTu = (s, ds) => { const x = ' ' + boDau(s).replace(/[^a-z0-9]+/g, ' ') + ' '; return ds.some(d => x.includes(' ' + boDau(d) + ' ')); };
  // từ chung chung: tên chỉ gồm những từ này thì khó phân biệt, khó đăng ký bảo hộ nhãn hiệu
  const TU_CHUNG = ['xanh', 'sach', 'ngon', 'viet', 'viet nam', 'que', 'nha', 'tuoi', 'organic', 'fresh', 'food', 'foods', 'dac', 'san', 'thuc', 'pham', 'nong', 'tu', 'nhien', 'tot', 'uy', 'tin', 'chat', 'luong', 'the', 'shop', 'store', 'mien', 'tay', 'green', 'clean', 'natural', 'best', 'vn'];
  const SLOGAN_CHUNG = ['chat luong hang dau', 'uy tin', 'gia tot', 'tuong lai xanh', 'chat luong cao', 'tan tam', 'so mot', 'tot nhat', 'hang dau'];
  const MO_TA_CHUNG = ['chat luong cao', 'dap ung nhu cau khach hang', 'gia ca hop ly', 'canh tranh'];
  const CUE_KHACH = ['khach', 'nguoi mua', 'gioi tre', 'sinh vien', 'du khach', 'gia dinh', 'qua', 'tang', 'nguoi tieu dung', 'phu nu', 'van phong', 'customer', 'customers', 'buyer', 'buyers', 'tourist', 'tourists', 'family', 'gift', 'young'];
  const CUE_DIA_PHUONG = ['dia phuong', 'truyen thong', 'que', 'lang', 'nghe nhan', 'vung', 'mien tay', 'song', 'phu sa', 'local', 'tradition', 'traditional', 'village', 'artisan', 'delta', 'mekong', 'heritage'];

  // ---------- bài làm trống ----------
  function trong() {
    return {
      v: 1,
      sv: { ten: '', mssv: '', lop: '' },
      sp: { nhom: '', ten: '', noi: '', moTa: '', thuocTinh: [] },
      nh: { ten: '', slogan: '', giaiThich: '', traTrung: 'chua', ketQuaTra: '' },
      gia: { chienLuoc: '', von: '', ban: '', doiThu: '', ghiChu: '' },
      kenh: { chon: [], ghiChu: '' },
      qb: { chon: [], keHoach: '' },
    };
  }

  // ---------- luật góp ý ----------
  // Mỗi lời góp ý: { id, muc: 'thieu'|'canh-bao'|'goi-y'|'tot', phan, vi, en }. 'thieu' = còn trống phần đề bài yêu cầu.
  function gopY(w) {
    const out = [], add = (id, muc, phan, vi, en) => out.push({ id, muc, phan, vi, en });
    const sp = w.sp || {}, nh = w.nh || {}, g = w.gia || {}, k = (w.kenh || {}).chon || [], q = (w.qb || {}).chon || [];
    const so = x => { const n = Number(String(x == null ? '' : x).replace(/[^\d.]/g, '')); return Number.isFinite(n) && n > 0 ? n : null; };

    // --- sản phẩm ---
    if (!sp.nhom) add('sp-nhom', 'thieu', 'sp', 'Chọn nhóm sản phẩm: nông sản chế biến hay thủ công truyền thống (đề bài chỉ nhận hai nhóm này).', 'Pick the product group: processed farm product or traditional handicraft (the case accepts only these two).');
    if (!String(sp.ten || '').trim()) add('sp-ten', 'thieu', 'sp', 'Ghi tên sản phẩm đặc sản cụ thể.', 'Name the specific local product.');
    if (!String(sp.noi || '').trim()) add('sp-noi', 'thieu', 'sp', 'Ghi địa phương gắn với sản phẩm: «đặc sản địa phương» là điều kiện bắt buộc của đề bài.', 'Give the place the product comes from: being a local specialty is required by the case.');

    // --- nhãn hiệu ---
    const ten = String(nh.ten || '').trim();
    if (!ten) add('nh-ten', 'thieu', 'nh', 'Đặt tên thương hiệu.', 'Propose a brand name.');
    else {
      if (soTu(ten) > 4 || ten.length > 28) add('nh-dai', 'canh-bao', 'nh', 'Tên dài quá 4 chữ: khách khó nhớ, khó gõ tìm trên sàn và mạng xã hội.', 'The name is longer than 4 words: hard to remember and to search on marketplaces and social media.');
      const chu = boDau(ten).replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(Boolean);
      if (chu.length && chu.every(c => TU_CHUNG.includes(c))) add('nh-chung', 'canh-bao', 'nh', 'Tên chỉ gồm từ mô tả chung (như «Xanh Sạch», «Đặc Sản Quê»): dễ trùng với người khác và khó đăng ký bảo hộ, vì nhãn hiệu phải có khả năng phân biệt. Thêm một yếu tố riêng: tên người, tên làng, một từ tự đặt.', 'The name uses only generic descriptive words (like «Green Clean», «Local Foods»): easy to clash with others and hard to register, because a trademark must be distinctive. Add something of your own: a person, a village, a coined word.');
      if (sp.ten && boDau(ten).replace(/[^a-z0-9]/g, '') === boDau(sp.ten).replace(/\(.*\)/, '').replace(/[^a-z0-9]/g, '')) add('nh-trung-sp', 'canh-bao', 'nh', 'Tên thương hiệu trùng tên gọi chung của sản phẩm: ai bán sản phẩm ấy cũng gọi như vậy, nên không phân biệt được bạn với người khác.', 'The brand name is the product\'s common name: everyone selling it uses that name, so it does not set you apart.');
    }
    if (nh.traTrung !== 'da-tra') add('nh-tra', 'goi-y', 'nh', 'Trước khi chốt tên, tra trùng trên WIPO Publish của Cục Sở hữu trí tuệ (wipopublish.ipvietnam.gov.vn), rồi ghi kết quả. Tên đã có người đăng ký cho cùng loại hàng thì phải đổi.', 'Before settling on the name, search WIPO Publish of the Vietnam IP Office (wipopublish.ipvietnam.gov.vn) and record what you found. A name already registered for the same goods must change.');
    else if (nh.ketQuaTra === 'gan-giong') add('nh-gan', 'canh-bao', 'nh', 'Bạn ghi là có nhãn hiệu gần giống: nên đổi tên hoặc thêm yếu tố riêng, để khỏi bị từ chối bảo hộ hoặc tranh chấp sau này.', 'You found a similar mark: change the name or add a distinctive element, to avoid refusal or disputes later.');
    else if (nh.ketQuaTra === 'khong-trung') add('nh-tra-ok', 'tot', 'nh', 'Đã tra trùng tên và chưa thấy nhãn hiệu giống: tốt. Ghi rõ ngày tra trong bài.', 'You searched and found no similar mark: good. Note the search date in your work.');

    const sl = String(nh.slogan || '').trim();
    if (!sl) add('nh-slogan', 'thieu', 'nh', 'Viết slogan (thông điệp cốt lõi) ngắn.', 'Write a short slogan (core message).');
    else {
      if (soTu(sl) > 10) add('nh-slogan-dai', 'canh-bao', 'nh', 'Slogan dài hơn 10 chữ: slogan nên ngắn (khoảng 3–8 chữ) để nhớ được sau một lần nghe.', 'The slogan is over 10 words: keep it short (about 3–8 words) so it sticks after one hearing.');
      if (SLOGAN_CHUNG.some(p => boDau(sl).includes(p))) add('nh-slogan-chung', 'canh-bao', 'nh', 'Slogan có cụm chung chung («uy tín», «chất lượng hàng đầu», «tương lai xanh»…): câu ấy đặt vào thương hiệu nào cũng đúng. Hãy nói điều chỉ sản phẩm của bạn có.', 'The slogan uses stock phrases («trusted», «top quality», «green future»…): it fits any brand. Say something only your product has.');
    }
    const gt = String(nh.giaiThich || '').trim();
    if (!gt) add('nh-giai-thich', 'thieu', 'nh', 'Giải thích vì sao nhãn hiệu này phù hợp với doanh nghiệp mới.', 'Explain why this brand suits a new business.');
    else {
      if (soTu(gt) < 25) add('nh-giai-thich-ngan', 'canh-bao', 'nh', 'Phần giải thích ngắn (dưới 25 chữ). Nói rõ ba điều: bán cho ai, gợi giá trị địa phương nào, và vì sao dễ nhớ, rẻ để xây dựng với vốn ít.', 'The explanation is short (under 25 words). Cover three points: who it is for, what local value it evokes, and why it is memorable and cheap to build on a small budget.');
      if (!coTu(gt, CUE_KHACH)) add('nh-cho-ai', 'goi-y', 'nh', 'Phần giải thích chưa nói nhãn hiệu dành cho ai (khách hàng mục tiêu trong nước).', 'The explanation does not say who the brand is for (the domestic target customer).');
      if (!coTu(gt, CUE_DIA_PHUONG) && !(sp.noi && coTu(gt, tu(boDau(sp.noi).replace(/[^a-z ]/g, ' '))))) add('nh-dia-phuong', 'goi-y', 'nh', 'Phần giải thích chưa gắn với địa phương hay giá trị truyền thống, trong khi đó là lợi thế khó sao chép của đặc sản.', 'The explanation does not link to the place or tradition, which is a specialty product\'s hard-to-copy advantage.');
    }

    // --- Product ---
    const tt = sp.thuocTinh || [];
    if (!tt.length) add('p-thuoc-tinh', 'thieu', 'p', 'Product: chọn 1–3 điểm nổi bật của sản phẩm.', 'Product: pick 1–3 standout features.');
    else if (tt.length > 3) add('p-nhieu', 'canh-bao', 'p', 'Product: chọn hơn 3 điểm nổi bật. Doanh nghiệp mới khó nói nhiều thứ cùng lúc; giữ 2–3 điểm khách nhớ được.', 'Product: more than 3 features. A new business cannot say everything at once; keep the 2–3 customers will remember.');
    if (tt.length && !tt.some(x => ['nguon-goc', 'cong-thuc', 'nghe-nhan', 'bao-bi'].includes(x))) add('p-truyen-thong', 'goi-y', 'p', 'Product: chưa có điểm nào nói về nguồn gốc hay giá trị truyền thống. Đề bài ưu tiên sản phẩm «chế biến đơn giản, giữ giá trị truyền thống».', 'Product: no feature speaks to origin or tradition. The case favours products that are «simply processed and keep traditional value».');
    if (sp.nhom === 'nong-san' && tt.length && !tt.includes('an-toan') && !tt.includes('nguon-goc')) add('p-an-toan', 'goi-y', 'p', 'Product: với nông sản chế biến, khách mua trực tuyến cần thấy hạn dùng, nguồn gốc và cách bảo quản trên nhãn.', 'Product: for processed food bought online, customers need shelf life, origin and storage on the label.');
    const mt = String(sp.moTa || '').trim();
    if (!mt) add('p-mo-ta', 'thieu', 'p', 'Product: mô tả ngắn sản phẩm có gì nổi bật.', 'Product: briefly describe what stands out.');
    else {
      if (soTu(mt) < 20) add('p-mo-ta-ngan', 'canh-bao', 'p', 'Product: phần mô tả ngắn (dưới 20 chữ). Nói cụ thể: nguyên liệu từ đâu, làm thế nào, đóng gói ra sao.', 'Product: the description is short (under 20 words). Be concrete: where the ingredients come from, how it is made, how it is packed.');
      if (MO_TA_CHUNG.some(p => boDau(mt).includes(p)) && soTu(mt) < 35) add('p-chung', 'canh-bao', 'p', 'Product: «chất lượng cao, đáp ứng nhu cầu khách hàng» đúng với mọi sản phẩm. Thay bằng chi tiết chỉ sản phẩm của bạn có.', 'Product: «high quality, meets customer needs» is true of any product. Replace it with details only yours has.');
    }

    // --- Price ---
    const von = so(g.von), ban = so(g.ban), dt = so(g.doiThu);
    if (!g.chienLuoc) add('g-chien-luoc', 'thieu', 'g', 'Price: chọn chiến lược giá.', 'Price: choose a pricing strategy.');
    if (!von || !ban) add('g-so', 'thieu', 'g', 'Price: ghi giá vốn và giá bán dự kiến cho một đơn vị (đồng) để xem biên lợi nhuận.', 'Price: enter the unit cost and planned selling price (VND) to see the margin.');
    else {
      const bien = (ban - von) / ban;
      if (ban <= von) add('g-lo', 'canh-bao', 'g', 'Price: giá bán không cao hơn giá vốn, tức là lỗ trên từng sản phẩm, chưa kể phí vận chuyển và phí bán hàng.', 'Price: the price does not exceed cost, so each sale loses money, before shipping and selling fees.');
      else if (bien < 0.2) add('g-bien-thap', 'canh-bao', 'g', `Price: biên lợi nhuận gộp khoảng ${Math.round(bien * 100)}%. Bán trên sàn còn mất phí sàn, phí thanh toán và vận chuyển; biên dưới 20% rất dễ thành lỗ.`, `Price: gross margin is about ${Math.round(bien * 100)}%. Marketplaces add platform, payment and shipping fees; under 20% easily turns into a loss.`);
      else add('g-bien', 'tot', 'g', `Price: biên lợi nhuận gộp khoảng ${Math.round(bien * 100)}% (giá vốn ${von.toLocaleString('vi-VN')} đ, giá bán ${ban.toLocaleString('vi-VN')} đ).`, `Price: gross margin about ${Math.round(bien * 100)}% (cost ${von.toLocaleString('en-US')} VND, price ${ban.toLocaleString('en-US')} VND).`);
      if (dt && g.chienLuoc === 'tham-nhap' && ban > dt * 1.1) add('g-tham-nhap-cao', 'canh-bao', 'g', 'Price: chọn giá thâm nhập nhưng giá bán cao hơn đối thủ hơn 10%: hai điều này mâu thuẫn nhau.', 'Price: penetration pricing, yet the price is over 10% above competitors: the two contradict each other.');
      if (dt && g.chienLuoc === 'gia-tri' && ban < dt * 0.8) add('g-gia-tri-thap', 'goi-y', 'g', 'Price: định giá theo giá trị nhưng bán rẻ hơn đối thủ hơn 20%: khách có thể hiểu là hàng kém hơn. Nói rõ giá trị rồi hãy định giá.', 'Price: value-based pricing but over 20% below competitors: customers may read it as lower quality. Make the value clear, then price it.');
    }
    if ((g.chienLuoc === 'hot-vang' || g.chienLuoc === 'cao-cap')) {
      if (tt.includes('qua-tang') || tt.includes('chung-nhan') || tt.includes('nghe-nhan')) add('g-cao-co-ly-do', 'goi-y', 'g', 'Price: giá cao có lý do (hộp quà, chứng nhận hoặc nghệ nhân). Nhớ nói rõ lý do ấy trên bao bì và trong quảng bá.', 'Price: the high price has a reason (gift box, certification or artisans). Make that reason visible on the pack and in promotion.');
      else add('g-cao', 'canh-bao', 'g', 'Price: thương hiệu mới chưa ai biết, vốn ít mà đặt giá cao thì khách chưa có lý do để trả. Giá cao cần đi kèm điều khách thấy được: hộp quà, chứng nhận, câu chuyện nghệ nhân.', 'Price: a new, unknown brand on a small budget pricing high gives customers no reason to pay. A high price needs something visible: a gift box, certification, an artisan story.');
    }

    // --- Place ---
    const loai = id => (KENH.find(x => x.id === id) || {}).loai;
    if (!k.length) add('l-kenh', 'thieu', 'l', 'Place: chọn kênh phân phối.', 'Place: choose distribution channels.');
    else {
      const on = k.some(x => loai(x) === 'online'), tr = k.some(x => loai(x) === 'truc-tiep');
      if (!on || !tr) add('l-ca-hai', 'canh-bao', 'l', 'Place: đề bài nói doanh nghiệp «ưu tiên kênh bán hàng trực tuyến và trực tiếp». Nên có ít nhất một kênh trực tuyến và một kênh trực tiếp.', 'Place: the case says the business «prioritises online and direct sales». Include at least one online and one direct channel.');
      else add('l-ca-hai-ok', 'tot', 'l', 'Place: có cả kênh trực tuyến lẫn trực tiếp, đúng với đề bài.', 'Place: both online and direct channels, as the case requires.');
      if (k.length > 4) add('l-nhieu', 'canh-bao', 'l', 'Place: hơn 4 kênh cùng lúc. Nhóm nhỏ, vốn ít thì làm tốt 2–3 kênh hơn là làm dở nhiều kênh.', 'Place: more than 4 channels at once. A small team does 2–3 channels well rather than many badly.');
      if (k.includes('sieu-thi')) add('l-sieu-thi', 'canh-bao', 'l', 'Place: chuỗi siêu thị thường đòi số lượng ổn định, chiết khấu và thanh toán chậm, khó với doanh nghiệp mới vốn ít. Để kênh này cho giai đoạn sau.', 'Place: supermarket chains usually demand steady volume, discounts and delayed payment, which is hard for a new, cash-poor business. Leave it for later.');
    }

    // --- Promotion ---
    if (!q.length) add('m-chon', 'thieu', 'm', 'Promotion: chọn cách truyền thông, quảng bá.', 'Promotion: choose how you will promote.');
    else {
      if (q.length > 5) add('m-nhieu', 'canh-bao', 'm', 'Promotion: hơn 5 hoạt động cùng lúc là quá sức với nhóm nhỏ. Chọn 2–4 hoạt động hợp kênh bán nhất.', 'Promotion: more than 5 activities is too much for a small team. Pick the 2–4 that fit your channels best.');
      if (q.length === 1 && q[0] === 'giam-gia') add('m-chi-giam-gia', 'canh-bao', 'm', 'Promotion: chỉ dựa vào giảm giá thì khách nhớ giá rẻ chứ không nhớ thương hiệu, và khó nâng giá về sau.', 'Promotion: relying only on discounts makes customers remember the low price, not the brand, and makes raising prices hard later.');
      if (q.includes('giam-gia') && (g.chienLuoc === 'cao-cap' || g.chienLuoc === 'gia-tri')) add('m-giam-gia-mau-thuan', 'canh-bao', 'm', 'Promotion: giảm giá mâu thuẫn với chiến lược giá theo giá trị hoặc cao cấp. Thay bằng quà tặng kèm hay dùng thử.', 'Promotion: discounting contradicts value-based or premium pricing. Use free gifts or trials instead.');
      if (!q.some(x => ['cau-chuyen', 'video-ngan', 'dung-thu'].includes(x))) add('m-ke-chuyen', 'goi-y', 'm', 'Promotion: chưa có hoạt động nào kể câu chuyện địa phương hay cho khách dùng thử, hai cách hợp nhất với đặc sản.', 'Promotion: nothing tells the local story or lets customers try, the two approaches that suit specialty products best.');
      const qbOnline = q.some(x => (QUANG_BA.find(y => y.id === x) || {}).online);
      if (qbOnline && k.length && !k.some(x => loai(x) === 'online')) add('m-khong-kenh', 'canh-bao', 'm', 'Promotion: có quảng bá trực tuyến (video, livestream, KOC) nhưng chưa có kênh bán trực tuyến để khách đặt mua ngay.', 'Promotion: you promote online (videos, live streams, KOCs) but have no online sales channel where customers can order.');
    }
    const kh = String((w.qb || {}).keHoach || '').trim();
    if (!kh) add('m-ke-hoach', 'thieu', 'm', 'Promotion: viết vài câu kế hoạch truyền thông (làm gì, ở đâu, khi nào).', 'Promotion: write a few lines of plan (what, where, when).');
    else if (soTu(kh) < 15) add('m-ke-hoach-ngan', 'canh-bao', 'm', 'Promotion: kế hoạch ngắn (dưới 15 chữ). Nêu ít nhất một hoạt động cụ thể cho tháng đầu.', 'Promotion: the plan is short (under 15 words). Name at least one concrete activity for the first month.');
    return out;
  }

  // mức hoàn thành: số mục đề bài yêu cầu đã điền (không phải điểm)
  const BAT_BUOC = ['sp-nhom', 'sp-ten', 'sp-noi', 'nh-ten', 'nh-slogan', 'nh-giai-thich', 'p-thuoc-tinh', 'p-mo-ta', 'g-chien-luoc', 'g-so', 'l-kenh', 'm-chon', 'm-ke-hoach'];
  function hoanThanh(w) {
    const thieu = new Set(gopY(w).filter(x => x.muc === 'thieu').map(x => x.id));
    return { xong: BAT_BUOC.filter(id => !thieu.has(id)).length, tong: BAT_BUOC.length };
  }

  const API = { GOI_Y, NHOM, THUOC_TINH, GIA, KENH, QUANG_BA, BAT_BUOC, trong, gopY, hoanThanh, boDau, soTu };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (root) root.BizOnBrandWorkshop = API;
})(typeof window !== 'undefined' ? window : null);
