/* BizOn – Thư viện tình huống (bản 2, theo gói bàn giao «design_handoff_thu_vien_tinh_huong», 11/2026).
 * Một luồng song ngữ: Thư viện (cột lọc + kệ theo bậc) → Trang case (4 bước) → case cùng bậc / về thư viện.
 * Địa chỉ thật cho từng màn: thu-vien-tinh-huong.html?case=cham&step=2 (nút Back và chia sẻ dùng được).
 * Bộ lọc khóa theo giá trị tiếng Việt nên đổi ngôn ngữ không mất bộ lọc.
 * 12 thẻ «Case mẫu» trong bản thiết kế chỉ minh họa thư viện ở quy mô lớn: không phải nội dung thật,
 * chỉ hiện khi mở ?mau=1. Ghi chú giảng dạy đầy đủ nằm ở cham/bo-cong-cu.html; trang này không giả lập
 * đăng nhập giảng viên (BizOn chưa có khóa này).
 * CHAM™ và nội dung tình huống © 2017–2026 Đỗ Thùy Hương & Phan Anh Tú, dùng trên BizOn theo giấy phép không độc quyền. */
(function (root) {
  'use strict';
  const L = (vi, en) => ({ vi, en });
  const TIERS = [null, L('Khởi đầu', 'Getting started'), L('Vận hành', 'Operations'), L('Ra thế giới', 'Going global')];
  const TIER_SUBS = [null, L('Một quyết định, ít số liệu. Hợp cho buổi đầu.', 'One decision, few numbers. Good for a first session.'),
    L('Kế hoạch, dòng tiền, đối thủ thật.', 'Plans, cash flow, real competitors.'), L('Thị trường nước ngoài, quy định, chuỗi cung ứng.', 'Foreign markets, regulation, supply chains.')];
  const DISC_EN = { 'Khởi nghiệp': 'Entrepreneurship', 'Tài chính': 'Finance', 'Marketing': 'Marketing', 'Quốc tế hóa': 'Internationalisation', 'Chuỗi cung ứng': 'Supply chain', 'Vận hành': 'Operations' };
  const REGION_EN = { 'ĐBSCL': 'Mekong Delta', 'Việt Nam': 'Vietnam' };
  const BG = ['river', 'yellow', 'leaf', 'brick', 'lilac', 'pale'];

  /* Case thật: CHAM (đầy đủ), Bến Phù Sa và Hộ Chiếu Sầu Riêng (có mô phỏng, case đang biên soạn) */
  const CASES = [
    { id: 'cham', t: L('CHAM Homestay', 'CHAM Homestay'), d: L('Kế hoạch homestay đầu tiên trên cù lao Tân Lộc. Kế hoạch hòa vốn sau 5 tháng, nếu tin vào chính các con số của nó.', 'A plan for the first homestay on Tân Lộc islet. It breaks even in 5 months, if you trust its own numbers.'),
      disc: ['Khởi nghiệp', 'Tài chính', 'Marketing'], region: 'Cần Thơ', tier: 2, kind: 'full', bg: 'river', sims: 6, dur: L('2 buổi', '2 sessions'), year: '2017' },
    { id: 'bps', t: L('Bến Phù Sa', 'Bến Phù Sa'), d: L('Gánh hàng rong trên chợ nổi: chọn phương thức, món hàng, địa điểm mỗi tuần. Khi nào thử nhanh, khi nào nhân rộng.', 'A street-vendor business on the floating market: choose method, product and place each week. When to test fast, when to scale.'),
      disc: ['Khởi nghiệp'], region: 'ĐBSCL', tier: 1, kind: 'sim', bg: 'yellow', sims: 1, dur: L('5 tuần', '5 weeks'), href: 'ben-phu-sa-3d.html' },
    { id: 'srp', t: L('Hộ Chiếu Sầu Riêng', 'Durian Passport'), d: L('Đưa sầu riêng Việt ra thế giới: mã số vùng trồng, nghị định thư kiểm dịch, chính ngạch và tiểu ngạch.', 'Taking Vietnamese durian global: growing-area codes, quarantine protocols, formal and informal export.'),
      disc: ['Quốc tế hóa', 'Chuỗi cung ứng'], region: 'Việt Nam', tier: 3, kind: 'sim', bg: 'leaf', sims: 1, dur: L('6 mùa', '6 seasons'), href: 'ho-chieu-sau-rieng.html' }
  ];
  /* Thẻ minh họa của bản thiết kế (KHÔNG phải case thật): chỉ hiện với ?mau=1 */
  const SAMPLES = [
    ['Gạo ST25 ra thế giới', 'ST25 rice goes global', 'Hợp tác xã chọn giữa bán lúa tươi cho thương lái và tự xây thương hiệu gạo.', 'A cooperative chooses between selling fresh paddy to traders and building its own rice brand.', ['Marketing', 'Quốc tế hóa'], 'Sóc Trăng', 3],
    ['Khóm Cầu Đúc', 'Cầu Đúc pineapple', 'Chế biến sâu hay bán trái tươi: công suất nhà máy và mùa vụ.', 'Process or sell fresh: factory capacity against the harvest season.', ['Vận hành', 'Tài chính'], 'Hậu Giang', 2],
    ['Cá tra và chứng nhận ASC', 'Pangasius and ASC certification', 'Chi phí chứng nhận bền vững so với giá bán vào EU.', 'The cost of sustainability certification against EU selling prices.', ['Chuỗi cung ứng', 'Quốc tế hóa'], 'An Giang', 3],
    ['Lò bánh pía gia truyền', 'Heirloom pía cake bakery', 'Mở kênh online mà không mất khách quen ở chợ.', 'Open an online channel without losing regulars at the market.', ['Marketing', 'Khởi nghiệp'], 'Sóc Trăng', 1],
    ['Xoài cát Hòa Lộc', 'Hòa Lộc mangoes', 'Chỉ dẫn địa lý và chênh lệch giá theo mã vùng trồng.', 'Geographical indication and price gaps by growing-area code.', ['Marketing', 'Chuỗi cung ứng'], 'Tiền Giang', 2],
    ['Tour chợ nổi Cái Răng', 'Cái Răng floating market tour', 'Định giá tour sáng sớm khi khách đến theo mùa và theo đoàn.', 'Pricing a dawn tour when visitors arrive by season and in groups.', ['Khởi nghiệp', 'Marketing'], 'Cần Thơ', 1],
    ['Kẹo dừa Bến Tre', 'Bến Tre coconut candy', 'Bao bì mới cho thị trường quà tặng, số lượng in tối thiểu.', 'New packaging for the gift market, with minimum print runs.', ['Marketing', 'Tài chính'], 'Bến Tre', 1],
    ['Tôm – lúa Cà Mau', 'Cà Mau shrimp–rice', 'Hợp đồng bao tiêu: ai chịu rủi ro dịch bệnh.', 'Offtake contracts: who carries the disease risk.', ['Chuỗi cung ứng', 'Tài chính'], 'Cà Mau', 2],
    ['Muối hầm Bạc Liêu', 'Bạc Liêu roasted salt', 'Từ muối hạt giá rẻ đến đặc sản đóng hộp.', 'From cheap sea salt to a boxed specialty.', ['Khởi nghiệp', 'Marketing'], 'Bạc Liêu', 1],
    ['Mật ong U Minh', 'U Minh honey', 'Truy xuất nguồn gốc và niềm tin của người mua online.', 'Traceability and the trust of online buyers.', ['Marketing'], 'Cà Mau', 2],
    ['Cacao Chợ Lách', 'Chợ Lách cacao', 'Bán hạt lên men cho nhà sản xuất sô-cô-la nước ngoài.', 'Selling fermented beans to foreign chocolate makers.', ['Quốc tế hóa', 'Chuỗi cung ứng'], 'Bến Tre', 3],
    ['Nhà máy sấy trái cây', 'Fruit drying plant', 'Vay vốn mở dây chuyền sấy lạnh, hòa vốn theo mùa trái.', 'A loan for a freeze-drying line, break-even by fruit season.', ['Tài chính', 'Vận hành'], 'Vĩnh Long', 2]
  ].map(([tv, te, dv, de, disc, region, tier], i) => ({ id: 'mau' + (i + 1), t: L(tv, te), d: L(dv, de), disc, region, tier, kind: 'draft', bg: BG[i % BG.length], sims: 0, dur: L('—', '—') }));

  const SIMS = [
    { tg: L('20 PHÚT · CÁ NHÂN', '20 MIN · SOLO'), t: L('Một ngày ở Tân Lộc', 'A day on Tân Lộc'), d: L('Đọc case qua 24 giờ trên cù lao.', 'Read the case as 24 hours on the islet.'), href: 'cham/mot-ngay.html', bg: 'river' },
    { tg: L('30 PHÚT · NHÓM', '30 MIN · TEAMS'), t: L('Trò chơi nhà sáng lập', 'Founder game'), d: L('Bảy quyết định, kết quả 5 năm.', 'Seven decisions, five years of results.'), href: 'cham/tro-choi.html', bg: 'yellow' },
    { tg: L('45 PHÚT · NHÓM', '45 MIN · TEAMS'), t: L('Thẩm định kế hoạch', 'Plan review'), d: L('Bút đỏ trên sáu phần của kế hoạch.', 'A red pen over six sections of the plan.'), href: 'cham/tham-dinh.html', bg: 'brick' },
    { tg: L('2 BUỔI · 4 ĐỘI', '2 SESSIONS · 4 TEAMS'), t: L('Đấu trường Cù lao Tân Lộc', 'Tân Lộc Arena'), d: L('Kịch bản Bậc 2, sáu mùa, ba đối thủ.', 'Tier-2 scenario: six seasons, three rivals.'), href: 'cham/dau-truong.html', bg: 'leaf' },
    { gv: true, tg: L('GIẢNG VIÊN', 'INSTRUCTOR'), t: L('Bộ công cụ giảng dạy', 'Teaching kit'), d: L('Máy tính hòa vốn, soát lỗi, tin đăng mẫu, ghi chú.', 'Payback calculator, plan audit, sample listing, notes.'), href: 'cham/bo-cong-cu.html' },
    { gv: true, tg: L('GIẢNG VIÊN', 'INSTRUCTOR'), t: L('Bài giảng 9 slide', '9-slide teaching deck'), d: L('Trình chiếu trên lớp, in được ra PDF.', 'For class, printable to PDF.'), href: 'cham/bai-giang.html' }
  ];
  const GOALS = [L('Đọc và phản biện một kế hoạch kinh doanh khởi nghiệp.', 'Read and critique a startup business plan.'), L('Tính hòa vốn trên đúng khoản vốn đầu tư.', 'Calculate payback on the right investment base.'),
    L('Đánh giá chiến lược giá theo mùa và theo nhóm khách.', 'Evaluate pricing by season and by guest segment.'), L('Đề xuất cách khác biệt hóa khi rào cản gia nhập thấp, so sánh với đối thủ thật là Homestay Cẩm Lụa.', 'Propose differentiation when entry barriers are low, benchmarked against the real competitor Homestay Cẩm Lụa.')];
  const STATS = [[L('Địa điểm', 'Location'), L('Cù lao Tân Lộc, Thốt Nốt', 'Tân Lộc islet, Thốt Nốt'), 'river'], [L('Tổng vốn', 'Total capital'), L('4 tỷ đồng', '4 billion đ'), 'yellow'],
    [L('Doanh thu năm 1 (KH)', 'Year-1 revenue (plan)'), L('1.761 triệu đ', '1,761 million đ'), 'leaf'], [L('Hòa vốn (KH)', 'Payback (plan)'), L('5 tháng 23 ngày', '5 months 23 days'), 'brick']];
  const LINKS = { caseFull: 'cham/ke-hoach-2017.html', project: 'cham/', notes: 'cham/bo-cong-cu.html#tk4' };

  const TX = {
    viewAs: L('XEM VỚI TƯ CÁCH', 'VIEWING AS'), sv: L('Sinh viên', 'Student'), gv: L('Giảng viên', 'Instructor'),
    allTiers: L('Mọi bậc', 'All tiers'), tier: L('Bậc', 'Tier'), all: L('Tất cả', 'All'),
    kinds: { all: L('Tất cả', 'All'), full: L('Đầy đủ', 'Complete'), sim: L('Có mô phỏng', 'Simulation ready'), draft: L('Case mẫu', 'Sample') },
    noteSv: L('Bắt đầu từ Bậc 1. Bấm vào case để mở.', 'Start at Tier 1. Click a case to open it.'), noteGv: L('Thẻ hiện thêm thời lượng và số mô phỏng.', 'Cards also show duration and number of simulations.'),
    noSim: L('Chưa có mô phỏng', 'No simulation yet'), lib: L('Thư viện', 'Library'), back: L('← Thư viện', '← Library'),
    steps: [L('Đọc case', 'Read the case'), L('Soát số liệu', 'Check the numbers'), L('Chơi mô phỏng', 'Play a simulation'), L('Phản tư', 'Reflect')],
    stepEyebrow: [L('BƯỚC 1 · KHOẢNG 10 PHÚT', 'STEP 1 · ABOUT 10 MIN'), L('BƯỚC 2 · KHOẢNG 15 PHÚT', 'STEP 2 · ABOUT 15 MIN'), L('BƯỚC 3 · CHỌN MỘT MÔ PHỎNG', 'STEP 3 · PICK ONE SIMULATION'), L('BƯỚC 4 · ĐỐI CHIẾU VỚI MỤC TIÊU', 'STEP 4 · COMPARE WITH THE GOALS')],
    stepsAria: L('Bốn bước của case', 'Four steps of the case'),
    next: L('Bước tiếp:', 'Next:'), done: L('Xong · quay lại thư viện', 'Done · back to library'), prev: L('← Bước trước', '← Previous step'),
    p1: L('Cần Thơ đón trên 5,2 triệu lượt khách trong 8 tháng đầu năm 2017 nhưng chỉ khoảng 1,3 triệu lượt lưu trú. Trên cù lao Tân Lộc chưa có cơ sở nào cho khách ở lại qua đêm. CHAM đề xuất sáu nhà lá, vé tham quan 80.000 đ, ẩm thực đồng quê và đặc sản từ cúc la mã.',
      'Cần Thơ had over 5.2 million visits in the first 8 months of 2017 but only about 1.3 million overnight stays, and Tân Lộc islet had nowhere to stay. CHAM proposes six thatched huts, an 80,000 đ day pass, country food and chamomile products.'),
    p2: L('Kế hoạch cho rằng CHAM là homestay duy nhất trên cù lao; thực tế hiện đã có Homestay Cẩm Lụa (khu vực Long Châu, phường Tân Lộc) với nhà vườn ven sông, chèo thuyền, câu cá, hái trái cây và BBQ, giá phòng 250.000–450.000 đ/đêm.',
      'The plan assumes CHAM will be the only homestay on the islet; today Homestay Cẩm Lụa (Long Châu, Tân Lộc ward) offers a riverside garden, boating, fishing, fruit picking and BBQ at 250,000–450,000 đ a night.'),
    p3: L('Bên kia sông, cách 5–10 phút đò, khách sạn ở Thốt Nốt có giá khoảng 300.000–350.000 đ/đêm: đây là dịch vụ thay thế trực tiếp cho một đêm trên cù lao.',
      'Across the river, 5–10 minutes by ferry, hotels in Thốt Nốt charge about 300,000–350,000 đ: a direct substitute for a night on the islet.'),
    fullCase: L('Trang tình huống ↗', 'Case page ↗'), project: L('Mở dự án CHAM ↗', 'Open the CHAM project ↗'),
    alert: L('Khi đối chiếu, các bảng trong kế hoạch có ít nhất năm chỗ không khớp nhau. Bạn tìm được mấy chỗ?', 'Checked against each other, the plan’s tables disagree in at least five places. How many can you find?'),
    planNote: L('KH = theo kế hoạch. Số liệu là giả định, không phải kết quả hoạt động.', 'Plan = as stated in the business plan. Figures are assumptions, not operating results.'),
    found: L('Chỗ không khớp bạn tìm được', 'Mismatches you found'), foundAria: L('Đã tìm được {n} chỗ', 'Found {n}'),
    reflectLbl: L('Ghi chú phản tư', 'Reflection note'), reflectPh: L('Ghi lại một quyết định bạn sẽ làm khác…', 'Note one decision you would make differently…'), saved: L('✓ Đã lưu trên máy này', '✓ Saved on this device'),
    gvEyebrow: L('GÓC GIẢNG VIÊN', 'INSTRUCTOR CORNER'), gvTitle: L('Kế hoạch hai buổi học', 'Two-session lesson plan'),
    gvBody: L('Kế hoạch hai buổi học, đáp án gợi ý và rubric 100 điểm nằm trong Bộ công cụ giảng dạy.', 'The two-session plan, suggested answers and the 100-point rubric are in the teaching kit.'),
    gvBtn: L('Mở ghi chú giảng dạy', 'Open teaching notes'), gvLocked: L('Bản chính thức sẽ chỉ mở ghi chú khi giảng viên đăng nhập; hiện chưa có khóa.', 'The live version will open notes only after an instructor login; there is no lock yet.'),
    gvGo: L('Mở ghi chú giảng dạy ↗', 'Open teaching notes ↗'), gvLocks: [L('Kế hoạch hai buổi', 'Two-session plan'), L('Đáp án gợi ý', 'Suggested answers'), L('Rubric 100 điểm', '100-point rubric')],
    sameTier: L('Cùng bậc', 'Same tier'), others: L('Case khác', 'Other cases'),
    draftNote: L('Case mẫu: nội dung đang được biên soạn. Thẻ này chỉ để minh họa quy mô thư viện.', 'Sample case: content is still being written. This card only illustrates the library at scale.'),
    simNote: L('Case đang biên soạn. Mô phỏng đã chơi được trên BizOn.', 'Case in preparation. The simulation is already playable on BizOn.'), playSim: L('Chơi mô phỏng →', 'Play simulation →'),
    sampleBanner: L('Đang xem kèm 12 «Case mẫu» minh họa quy mô thư viện. Đây không phải case thật.', 'Showing 12 illustrative “Sample” cards to preview the library at scale. They are not real cases.')
  };

  const tr = (o, lang) => (o == null ? '' : typeof o === 'object' ? (lang === 'en' && o.en != null ? o.en : o.vi) : String(o));
  const discName = (d, lang) => (lang === 'en' ? DISC_EN[d] || d : d);
  const regionName = (r, lang) => (lang === 'en' ? REGION_EN[r] || r : r);
  const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const casesFor = withSamples => (withSamples ? CASES.concat(SAMPLES) : CASES.slice());
  const countWord = (n, lang) => (lang === 'en' ? n + (n === 1 ? ' case' : ' cases') : n + ' case');
  const simWord = (n, lang) => (lang === 'en' ? n + (n === 1 ? ' simulation' : ' simulations') : n + ' mô phỏng');

  /* F = { q, tier (0 = mọi bậc), kind ('all'|'full'|'sim'|'draft'), disc ('' = tất cả), region ('' = tất cả) } */
  function matches(c, F) {
    const q = fold((F.q || '').trim());
    const hay = fold([c.t.vi, c.t.en, c.d.vi, c.d.en, c.region, REGION_EN[c.region] || ''].join(' '));
    return (!q || hay.includes(q)) && (!F.disc || c.disc.includes(F.disc)) && (!F.region || c.region === F.region) &&
      (!F.tier || c.tier === F.tier) && (!F.kind || F.kind === 'all' || (F.kind === 'sim' ? c.kind !== 'draft' : c.kind === F.kind));
  }
  function filterCases(list, F) { return list.filter(c => matches(c, F)); }
  /* Kệ theo bậc: chỉ bậc có kết quả; trong một kệ, case thật đứng trước Case mẫu */
  function shelves(list) {
    return [1, 2, 3].map(n => ({ n, items: list.filter(c => c.tier === n).sort((a, b) => (a.kind === 'draft') - (b.kind === 'draft')) })).filter(s => s.items.length);
  }
  function activeCount(F) { return [(F.q || '').trim(), F.disc, F.region, F.tier, F.kind && F.kind !== 'all'].filter(Boolean).length; }
  /* Case liên quan: cùng bậc trước; nếu bậc đó chỉ có một case thì gợi ý case khác */
  function related(list, cur) {
    const same = list.filter(c => c.tier === cur.tier && c.id !== cur.id).sort((a, b) => (a.kind === 'draft') - (b.kind === 'draft'));
    if (same.length) return { same: true, items: same.slice(0, 3) };
    return { same: false, items: list.filter(c => c.id !== cur.id && c.kind !== 'draft').slice(0, 3) };
  }
  /* Địa chỉ: ?case=<id>&step=<1–4> (bước chỉ có ở CHAM), ?mau=1 giữ thẻ minh họa */
  function parseUrl(search, withSamplesDefault) {
    const p = new URLSearchParams(search || '');
    const mau = p.get('mau') === '1' || !!withSamplesDefault;
    const all = casesFor(mau), c = all.find(x => x.id === p.get('case'));
    let step = parseInt(p.get('step'), 10); if (!(step >= 1 && step <= 4)) step = 1;
    return { mau, view: c ? 'case' : 'lib', caseId: c ? c.id : null, step: c && c.id === 'cham' ? step : 1 };
  }
  function buildUrl(st) {
    const p = new URLSearchParams();
    if (st.view === 'case' && st.caseId) { p.set('case', st.caseId); if (st.caseId === 'cham' && st.step > 1) p.set('step', String(st.step)); }
    if (st.mau) p.set('mau', '1');
    const s = p.toString(); return s ? '?' + s : '';
  }

  const API = { CASES, SAMPLES, SIMS, GOALS, STATS, LINKS, TIERS, TX, DISC_EN, REGION_EN, tr, fold, casesFor, matches, filterCases, shelves, activeCount, related, parseUrl, buildUrl };
  root.BizOnCaseLibrary = API;
  if (typeof document === 'undefined' || !root.ChamKit) return;

  /* ---------------- Giao diện ---------------- */
  const K = root.ChamKit, esc = K.esc, $ = K.$;
  const t = o => tr(o, K.lang());
  const KEY = 'bizon-thuvien-v1';
  const init = parseUrl(location.search);
  const S = Object.assign({ q: '', tier: 0, kind: 'all', disc: '', region: '', role: 'sv', filtersOpen: false, notesOpen: false, found: 0, reflect: '' },
    (() => { const v = K.get(KEY, {}); return { found: Math.max(0, Math.min(5, +v.found || 0)), reflect: typeof v.reflect === 'string' ? v.reflect : '' }; })(), init);
  const save = () => K.set(KEY, { found: S.found, reflect: S.reflect });
  const all = () => casesFor(S.mau);
  const lang = () => K.lang();
  const tierLine = c => t(TX.tier) + ' ' + c.tier + ' · ' + regionName(c.region, lang());
  const kindBadge = c => '<span class="tv-kind k-' + c.kind + '">' + esc(t(TX.kinds[c.kind])) + '</span>';
  const pressed = on => ' aria-pressed="' + (on ? 'true' : 'false') + '"';

  function cardHtml(c, cls) {
    const gv = S.role === 'gv';
    return '<button type="button" class="tv-card ch-bg-' + c.bg + (cls ? ' ' + cls : '') + '" data-open="' + c.id + '">' +
      '<span class="tv-card-top"><span class="tv-reg">' + esc(tierLine(c)) + '</span>' + kindBadge(c) + '</span>' +
      '<b>' + esc(t(c.t)) + '</b><span class="tv-d">' + esc(t(c.d)) + '</span>' +
      '<span class="tv-disc">' + esc(c.disc.map(d => discName(d, lang())).join(' · ')) + '</span>' +
      (gv ? '<span class="tv-gvstrip"><span>⏱ ' + esc(t(c.dur)) + '</span><span>' + esc(c.sims ? simWord(c.sims, lang()) : t(TX.noSim)) + '</span></span>' : '') +
      '</button>';
  }
  function chip(group, val, label, on, extra) {
    return '<button type="button" class="tv-chip" data-g="' + group + '" data-v="' + esc(val) + '"' + pressed(on) + '>' + (extra != null ? '<span>' + esc(label) + '</span><span class="tv-n">' + extra + '</span>' : esc(label)) + '</button>';
  }
  function rolesHtml() { return ['sv', 'gv'].map(r => chip('role', r, t(TX[r]), S.role === r)).join(''); }

  /* Giữ tiêu điểm bàn phím khi vẽ lại nhóm nút */
  function keepFocus(fn) {
    const a = document.activeElement, sig = a && a.dataset ? ['g', 'v', 'open', 'step', 'act', 'dot'].map(k => a.dataset[k] || '').join('|') : null;
    fn();
    if (!sig || sig === '|||||') return;
    const hit = Array.from(document.querySelectorAll('#tv-root button')).find(b => ['g', 'v', 'open', 'step', 'act', 'dot'].map(k => b.dataset[k] || '').join('|') === sig);
    if (hit) hit.focus({ preventScroll: true });
  }

  function renderLib() {
    const list = all(), en = lang() === 'en', n = k => list.filter(k).length;
    const F = { q: S.q, tier: S.tier, kind: S.kind, disc: S.disc, region: S.region };
    $('#tv-roles').innerHTML = rolesHtml();
    $('#tv-tiers').innerHTML = [0, 1, 2, 3].map(x => chip('tier', String(x), x ? t(TX.tier) + ' ' + x : t(TX.allTiers), S.tier === x)).join('');
    $('#tv-kinds').innerHTML = ['all', 'full', 'sim'].concat(S.mau ? ['draft'] : []).map(k => chip('kind', k, t(TX.kinds[k]), S.kind === k)).join('');
    const discs = Array.from(new Set(list.flatMap(c => c.disc))), regions = Array.from(new Set(list.map(c => c.region)));
    $('#tv-discs').innerHTML = chip('disc', '', t(TX.all), !S.disc, list.length) + discs.map(d => chip('disc', d, discName(d, lang()), S.disc === d, n(c => c.disc.includes(d)))).join('');
    $('#tv-regions').innerHTML = chip('region', '', t(TX.all), !S.region, list.length) + regions.map(r => chip('region', r, regionName(r, lang()), S.region === r, n(c => c.region === r))).join('');
    const res = filterCases(list, F), act = activeCount(F);
    $('#tv-count').textContent = en ? res.length + ' of ' + countWord(list.length, 'en') : res.length + ' / ' + list.length + ' case';
    $('#tv-rolenote').textContent = t(S.role === 'gv' ? TX.noteGv : TX.noteSv);
    $('#tv-empty').hidden = res.length > 0;
    $('#tv-sample').hidden = !S.mau; $('#tv-sample').textContent = t(TX.sampleBanner);
    $('#tv-lic-sample').hidden = !S.mau;
    const badge = $('#tv-fbadge'); badge.hidden = !act; badge.textContent = act;
    $('#tv-ftoggle').setAttribute('aria-expanded', S.filtersOpen ? 'true' : 'false');
    $('#tv-farrow').textContent = S.filtersOpen ? '▴' : '▾';
    $('#tv-filters').classList.toggle('open', S.filtersOpen);
    if ($('#tv-q').value !== S.q) $('#tv-q').value = S.q;
    $('#tv-shelves').innerHTML = shelves(res).map(sh => '<section class="tv-shelf" aria-labelledby="tv-sh-' + sh.n + '">' +
      '<div class="tv-shelf-h"><span class="tv-tierdot" aria-hidden="true">' + sh.n + '</span><div><h2 id="tv-sh-' + sh.n + '">' + esc(t(TX.tier) + ' ' + sh.n + ' · ' + t(TIERS[sh.n])) + '</h2><span>' + esc(t(TIER_SUBS[sh.n])) + '</span></div>' +
      '<span class="tv-shelf-n">' + esc(countWord(sh.items.length, lang()).toUpperCase()) + '</span></div>' +
      '<div class="tv-well">' + sh.items.map(c => cardHtml(c)).join('') + '</div></section>').join('');
  }

  function stepBody(step) {
    if (step === 1) return [TX.p1, TX.p2, TX.p3].map(p => '<p>' + esc(t(p)) + '</p>').join('') +
      '<div class="ch-row"><a class="tv-btn soft" href="' + LINKS.caseFull + '" target="_blank" rel="noopener">' + esc(t(TX.fullCase)) + '</a><a class="tv-btn soft" href="' + LINKS.project + '" target="_blank" rel="noopener">' + esc(t(TX.project)) + '</a></div>';
    if (step === 2) return '<p class="tv-alert">' + esc(t(TX.alert)) + '</p><div class="tv-statlist">' +
      STATS.map(([k, v, bg]) => '<div class="ch-bg-' + bg + '"><span>' + esc(t(k)) + '</span><b>' + esc(t(v)) + '</b></div>').join('') + '</div>' +
      '<div class="tv-found"><span id="tv-found-l">' + esc(t(TX.found)) + '</span><div class="tv-dots" role="group" aria-labelledby="tv-found-l">' +
      [1, 2, 3, 4, 5].map(n => '<button type="button" data-dot="' + n + '"' + pressed(n <= S.found) + (n <= S.found ? ' class="on"' : '') + ' aria-label="' + esc(t(TX.foundAria).replace('{n}', n)) + '">' + n + '</button>').join('') +
      '</div></div><p class="tv-small">' + esc(t(TX.planNote)) + '</p>';
    if (step === 3) return '<div class="tv-sims">' + SIMS.filter(s => !s.gv).map(s => '<a class="ch-bg-' + s.bg + '" href="' + s.href + '" target="_blank" rel="noopener"><span class="tg">' + esc(t(s.tg)) + '</span><b>' + esc(t(s.t)) + ' →</b><span>' + esc(t(s.d)) + '</span></a>').join('') + '</div>';
    return GOALS.map((g, i) => '<div class="tv-goal"><span class="n" aria-hidden="true">' + (i + 1) + '</span><span>' + esc(t(g)) + '</span></div>').join('') +
      '<label class="tv-reflect"><span class="sr-only">' + esc(t(TX.reflectLbl)) + '</span><textarea id="tv-reflect" rows="4" placeholder="' + esc(t(TX.reflectPh)) + '">' + esc(S.reflect) + '</textarea></label>' +
      '<span class="tv-saved" id="tv-saved"' + (S.reflect ? '' : ' hidden') + '>' + esc(t(TX.saved)) + '</span>';
  }

  function renderCase() {
    const list = all(), c = list.find(x => x.id === S.caseId) || CASES[0], en = lang() === 'en', gv = S.role === 'gv';
    const crumb = t(TX.tier) + ' ' + c.tier + ' · ' + t(TIERS[c.tier]);
    const meta = [tierLine(c), c.year, c.sims ? simWord(c.sims, lang()) : t(TX.noSim)].filter(Boolean).join(' · ');
    document.title = t(c.t) + ' · ' + (en ? 'Case library · BizOn' : 'Thư viện tình huống · BizOn');
    let body = '';
    if (c.id === 'cham') {
      const step = S.step;
      body = '<div class="tv-stats">' + STATS.map(([k, v]) => '<div><span>' + esc(t(k)) + '</span><b>' + esc(t(v)) + '</b></div>').join('') + '</div>' +
        '<nav class="tv-steps" aria-label="' + esc(t(TX.stepsAria)) + '">' + TX.steps.map((l, i) => { const n = i + 1, cls = n === step ? 'cur' : n < step ? 'done' : '';
          return '<button type="button" data-step="' + n + '"' + (cls ? ' class="' + cls + '"' : '') + (n === step ? ' aria-current="step"' : '') + '><span class="m" aria-hidden="true">' + (n < step ? '✓' : n) + '</span>' + esc(t(l)) + '</button>'; }).join('') + '</nav>' +
        '<div class="tv-casegrid"><section class="tv-panel" aria-labelledby="tv-step-h"><span class="tv-eyebrow">' + esc(t(TX.stepEyebrow[step - 1])) + '</span><h2 id="tv-step-h" tabindex="-1">' + esc(t(TX.steps[step - 1])) + '</h2>' +
        stepBody(step) +
        '<div class="tv-panel-foot">' + (step > 1 ? '<button type="button" class="tv-btn sunk" data-act="prev">' + esc(t(TX.prev)) + '</button>' : '') +
        '<button type="button" class="tv-btn primary" data-act="next">' + esc(step < 4 ? t(TX.next) + ' ' + t(TX.steps[step]) + ' →' : t(TX.done)) + '</button></div></section>' +
        (gv ? '<aside class="tv-gv" aria-labelledby="tv-gv-h"><span class="tv-eyebrow">' + esc(t(TX.gvEyebrow)) + '</span><h2 id="tv-gv-h">' + esc(t(TX.gvTitle)) + '</h2><p>' + esc(t(TX.gvBody)) + '</p>' +
          SIMS.filter(s => s.gv).map(s => '<a href="' + s.href + '" target="_blank" rel="noopener"><b>' + esc(t(s.t)) + ' →</b><span>' + esc(t(s.d)) + '</span></a>').join('') +
          '<button type="button" class="tv-btn gold" data-act="notes" aria-expanded="' + S.notesOpen + '" aria-controls="tv-notes">' + esc(t(TX.gvBtn)) + '</button>' +
          '<div id="tv-notes"' + (S.notesOpen ? '' : ' hidden') + '>' + TX.gvLocks.map(l => '<div class="tv-lock"><span>' + esc(t(l)) + '</span><span aria-hidden="true">🔒</span></div>').join('') +
          '<p class="tv-small">' + esc(t(TX.gvLocked)) + '</p><a class="tv-gvgo" href="' + LINKS.notes + '" target="_blank" rel="noopener">' + esc(t(TX.gvGo)) + '</a></div></aside>' : '') + '</div>';
    } else {
      body = '<section class="tv-panel tv-panel-sm">' + (c.kind === 'draft' ? '<p class="tv-note">' + esc(t(TX.draftNote)) + '</p>' :
        '<p class="tv-alert">' + esc(t(TX.simNote)) + '</p><a class="tv-btn primary" href="' + c.href + '" target="_blank" rel="noopener">' + esc(t(TX.playSim)) + '</a>') +
        '<button type="button" class="tv-btn outline" data-act="lib">' + esc(t(TX.back)) + '</button></section>';
    }
    const rel = related(list, c);
    $('#tv-case').innerHTML = '<div class="tv-band"><div class="tv-band-in"><div class="tv-band-main">' +
      '<div class="tv-crumb"><button type="button" class="tv-pill" data-act="lib">' + esc(t(TX.back)) + '</button><span>' + esc(crumb) + '</span></div>' +
      '<span class="tv-meta">' + esc(meta) + '</span><h1 id="tv-case-h" tabindex="-1">' + esc(t(c.t)) + '</h1><p class="tv-lede">' + esc(t(c.d)) + '</p>' +
      '<div class="tv-tags">' + kindBadge(c) + c.disc.map(d => '<span class="tv-tag">' + esc(discName(d, lang())) + '</span>').join('') + '</div></div>' +
      '<div class="tv-band-role"><span class="tv-eyebrow" id="tv-role-l2">' + esc(t(TX.viewAs)) + '</span><div class="tv-seg" role="group" aria-labelledby="tv-role-l2">' + rolesHtml() + '</div></div></div></div>' +
      '<div class="tv-casemain">' + body +
      (rel.items.length ? '<section class="tv-related" aria-labelledby="tv-rel-h"><h2 id="tv-rel-h">' + esc(rel.same ? t(TX.sameTier) + ' · ' + crumb : t(TX.others)) + '</h2><div class="tv-relgrid">' + rel.items.map(x => cardHtml(x, 'sm')).join('') + '</div></section>' : '') + '</div>';
  }

  function render() {
    const isCase = S.view === 'case';
    $('#tv-lib').hidden = isCase; $('#tv-case').hidden = !isCase;
    if (isCase) renderCase(); else { document.title = lang() === 'en' ? 'Case library · BizOn' : 'Thư viện tình huống · BizOn'; renderLib(); }
  }
  const draw = () => keepFocus(render);

  function go(patch, push, focusSel) {
    Object.assign(S, patch);
    const url = location.pathname + buildUrl(S) + location.hash.replace(/^#tv-.*/, '');
    try { history[push ? 'pushState' : 'replaceState']({ tv: 1 }, '', url); } catch (e) {}
    render();
    if (focusSel) { const el = $(focusSel); if (el) el.focus({ preventScroll: true }); }
  }
  const toTop = () => { try { window.scrollTo({ top: 0, behavior: K.reduced() ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, 0); } };
  function openCase(id) { go({ view: 'case', caseId: id, step: 1, notesOpen: false }, true, '#tv-case-h'); toTop(); }
  function toLib() { go({ view: 'lib', step: 1, notesOpen: false }, true, '#tv-lib-h'); toTop(); }
  function toStep(n) { go({ step: n }, false, '#tv-step-h'); const st = $('.tv-steps'); if (st && st.getBoundingClientRect().top < 0) st.scrollIntoView({ block: 'start', behavior: K.reduced() ? 'auto' : 'smooth' }); }

  document.addEventListener('click', e => {
    const b = e.target.closest('#tv-root button'); if (!b) return;
    const d = b.dataset;
    if (d.g === 'role') { S.role = d.v; draw(); }
    else if (d.g === 'tier') { S.tier = +d.v; draw(); }
    else if (d.g) { S[d.g] = d.v; draw(); }
    else if (d.open) openCase(d.open);
    else if (d.step) toStep(+d.step);
    else if (d.dot) { const n = +d.dot; S.found = S.found === n ? n - 1 : n; save(); draw(); }
    else if (d.act === 'lib') toLib();
    else if (d.act === 'prev') toStep(Math.max(1, S.step - 1));
    else if (d.act === 'next') { if (S.step < 4) toStep(S.step + 1); else toLib(); }
    else if (d.act === 'notes') { S.notesOpen = !S.notesOpen; draw(); }
    else if (d.act === 'reset') { Object.assign(S, { q: '', tier: 0, kind: 'all', disc: '', region: '' }); draw(); }
    else if (d.act === 'filters') { S.filtersOpen = !S.filtersOpen; draw(); }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'tv-q') { S.q = e.target.value; keepFocus(renderLib); }
    else if (e.target.id === 'tv-reflect') { S.reflect = e.target.value; save(); const s = $('#tv-saved'); if (s) s.hidden = !S.reflect; }
  });
  window.addEventListener('popstate', () => { Object.assign(S, parseUrl(location.search), { notesOpen: false }); render(); });
  try { history.replaceState({ tv: 1 }, '', location.pathname + buildUrl(S) + location.hash); } catch (e) {}
  K.mount(draw);
})(typeof self !== 'undefined' ? self : this);
