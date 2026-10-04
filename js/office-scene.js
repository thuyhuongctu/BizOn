/* BizOn Bật Nghiệp – Văn phòng điều hành (đi lại & hội thoại, 6 vòng) · plugin cho game.html
 * Nạp SAU js/app.js và js/office-rounds.js:  <script src="js/office-scene.js"></script>  (+ js/office-stations.js để chơi các góc ngay trong văn phòng)
 * Ảnh: assets/character/clay3d/*.png (render từ bizon-characters.js), fallback assets/character/v2 & rivals,
 *      assets/illustrations/arena-vietnam-map-v2.webp
 * Luồng: popup biến cố (maybeShowEventIntro) → CTA → văn phòng → gặp người có dấu ! → 1/3 phương án →
 * ghi vào S → save() → mở tab của CTA. «Về Trung tâm điều hành»/«Bỏ qua cảnh» = bỏ qua. Mỗi vòng 1 lần.
 * Trong văn phòng còn có: 3 đối thủ AI (thoại theo thị phần thật), bản đồ cờ trên tường, và các góc
 * Cửa hàng / Mini-game / Cây kỹ năng / Nhiệm vụ / Bảng xếp hạng / Thành tựu / Báo cáo / Thị trường.
 * Nút «🏢 Vào văn phòng» được gắn vào Trang chủ để quay lại bất cứ lúc nào.
 */
(function () {
  if (window.__bizonOffice) return; window.__bizonOffice = true;
  const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const fmt = m => (typeof money === 'function' ? money(m) : Math.round(m) + 'tr₫');
  const getS = () => (typeof S !== 'undefined' ? S : null);
  const A = f => 'assets/character/' + f;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rivalsList = () => { try { return typeof AI_OPPONENTS_LIST === 'function' ? AI_OPPONENTS_LIST() : []; } catch (e) { return []; } };

  const ROLES = {
    ceo: { name: 'CEO Minh Long', img: A('v2/ceo.png') },
    cfo: { name: 'CFO Thu Hà', img: A('v2/cfo.png') },
    cmo: { name: 'CMO Mạnh Chi', img: A('v2/cmo.png') },
    coo: { name: 'COO Bảo Ngọc', img: A('v2/coo.png') },
    sec: { name: 'SEC Gia Hân', img: A('v2/sec.png') },
  };
  const SPOTS = [[330, 560], [2070, 560], [330, 1060], [2070, 1060], [720, 900]];
  const LUMINA = { name: 'Lumina AI', img: A('v2/lumina.png'), x: 1200, y: 640 };
  const RIVAL_SPOTS = { alpha: [800, 1360], mekong: [1200, 1380], star: [1600, 1360] };
  const RIVAL_DEF = {
    alpha: { name: 'Alpha Dynamics', img: A('rivals/alpha.webp'), fb: A('rivals/alpha.webp'), accent: '#e8762d', icon: '🐺' },
    mekong: { name: 'Mekong Ventures', img: A('rivals/mekong.webp'), accent: '#00a0c8', icon: '🐘' },
    star: { name: 'Star Clay Co.', img: A('rivals/star.webp'), accent: '#5a32a3', icon: '🦚' },
  };
  const STATIONS = [
    { id: 'shop', tab: 'shop', icon: '🛍️', x: 560, y: 330, name: tr('Cửa hàng', 'Shop'), desc: tr('Dùng ví ảo của đội để mua vật phẩm tăng lực.', 'Spend the team wallet on power-ups.') },
    { id: 'minigame', tab: 'minigame', icon: '🏭', x: 760, y: 330, name: 'Clay Factory Frenzy', desc: tr('Băng chuyền xưởng đất sét! Chạm đúng món hàng được đặt để đóng gói. Mỗi vòng chơi được 3 lượt.', 'The clay factory conveyor! Tap the ordered item to pack it. 3 plays per round.') },
    { id: 'skills', tab: 'skills', icon: '🌳', x: 960, y: 330, name: tr('Cây kỹ năng', 'Skill tree'), desc: tr('Mở khóa bằng XP tích lũy từ kết quả kinh doanh.', 'Unlock with XP earned from business results.') },
    { id: 'missions', tab: 'missions', icon: '📋', x: 1440, y: 330, name: tr('Nhiệm vụ', 'Missions'), desc: tr('Hoàn thành nhiệm vụ để nhận thưởng tiền ảo và XP.', 'Complete missions for virtual cash and XP.') },
    { id: 'leaderboard', tab: 'leaderboard', icon: '🏆', x: 1640, y: 330, name: tr('Bảng xếp hạng', 'Leaderboard'), desc: tr('Xếp hạng các đội theo thị phần.', 'Teams ranked by market share.') },
    { id: 'achievements', tab: 'achievements', icon: '🎖️', x: 1840, y: 330, name: tr('Thành tựu', 'Achievements'), desc: tr('Huy hiệu đội đã mở khóa và chứng chỉ hoàn thành.', 'Unlocked badges and the completion certificate.') },
    { id: 'reports', flat: true, tab: 'reports', icon: '📊', x: 180, y: 1400, name: tr('Báo cáo kết quả', 'Reports'), desc: tr('Dòng tiền, CVP, chi phí đối thủ, nhân sự và tổng kết mùa.', 'Cash flow, CVP, rival costs, HR and season summary.') },
    { id: 'market', flat: true, tab: 'market', icon: '📡', x: 2220, y: 1400, name: tr('Thị trường sống', 'Market Pulse'), desc: tr('Bản tin thị trường – chứa manh mối về đối thủ.', 'The market feed – full of clues about rivals.') },
  ];

  // Ảnh đất sét lấy từ repo (assets/illustrations, assets/character) cho các góc & tường.
  const ART = {
    shop: 'assets/illustrations/game/celebrate-shop.webp', minigame: 'assets/illustrations/goo-coo-production-planning.webp',
    skills: 'assets/illustrations/game/paths-compass.webp', missions: 'assets/illustrations/strategy-notes-podium.webp',
    leaderboard: 'assets/illustrations/game/celebrate-win.webp', achievements: 'assets/illustrations/team-victory-celebration.webp',
    reports: 'assets/illustrations/ceo-cfo-revenue-targets.webp', market: 'assets/illustrations/event-vietnam-2026.webp',
  };
  window.BizonArt = ART;
  /* Lumina 2D poses replaced by clay 3D render */
  const LUMINA_POSE = {};
  const B = (s, m) => { s.brand = Math.round(s.brand * m * 100) / 100; };
  const L = (s, d) => { s.brandLoyalty = clamp(s.brandLoyalty + d, 0, 100); };
  const O = (s, d) => { s.oee = clamp((s.oee ?? 85) + d, 0, 100); };
  const D = (s, d) => { s.defect = Math.max(0, Math.round(((s.defect ?? 2) + d) * 10) / 10); };
  const AD = (s, d) => { s.adEff = Math.max(0, (s.adEff || 0) + d); };

  const ROUNDS = {
    1: { city: 'Cần Thơ', lead: 'alpha',
      idle: { cfo: tr('Vốn 500 triệu giảng viên cấp. Đừng để mình phải nói câu "hết tiền" nhé.', 'We start with the instructor\'s 500m₫. Don\'t make me say "we\'re out of cash".'),
        cmo: tr('Thương hiệu đất sét mình cần một câu chuyện, không chỉ một cái logo.', 'Our clay brand needs a story, not just a logo.'),
        coo: tr('Công suất máy 1.500 sản phẩm. Muốn hơn phải đầu tư dây chuyền.', 'Machine capacity is 1,500 units. More means investing in the line.'),
        sec: tr('Mình sẽ ghi lại mọi quyết định của vòng này vào Nhật ký đội.', 'I\'ll log every decision this round in the Team Journal.'),
        ceo: tr('Vòng đầu, mình cần thống nhất chiến lược giá trước đã.', 'First round: we need to agree on pricing first.'),
        lumina: tr('Vòng đầu là lúc thiết lập nền tảng. Đi gặp vị khách phía dưới trước đã.', 'Round one is about foundations. Go meet the visitor down there first.') },
      text: tr('Chào đội trẻ! Nghe nói các bạn định chiếm thị phần phân khúc bình dân ở Cần Thơ à? Quên đi, Alpha Dynamics của tôi sẽ dìm giá xuống đáy để đè bẹp các bạn!', 'Hello, rookies! Heard you want the budget segment in Cần Thơ? Forget it, Alpha Dynamics will drive prices to the floor and crush you!'),
      choices: [
        { text: tr('⚔️ Chấp nhận đối đầu, giảm giá để cạnh tranh trực tiếp.', '⚔️ Take the fight: cut prices and compete head-on.'), fx: s => { s.balance -= 15; AD(s, 2); L(s, -3); },
          msg: tr('Hiệu quả quảng cáo +2, chi 15tr₫, trung thành -3.', 'Ad effectiveness +2, 15m₫ spent, loyalty -3.'),
          reply: tr('Khá khen cho sự liều lĩnh! Nhưng dòng tiền của các bạn có trụ nổi qua cuộc chiến cắt máu này không? Hãy xem kết quả tính toán thị phần cuối vòng nhé!', 'Bold! But can your cash survive a bleeding war? See you at the end-of-round share numbers!') },
        { text: tr('🛡️ Giữ nguyên giá, tập trung truyền thông vào chất lượng sản phẩm.', '🛡️ Hold price, focus communication on product quality.'), fx: s => { s.balance -= 5; B(s, 1.05); L(s, 3); },
          msg: tr('Thương hiệu ×1.05, trung thành +3, chi 5tr₫.', 'Brand ×1.05, loyalty +3, 5m₫ spent.'),
          reply: tr('Đánh vào chất lượng à? Chiến lược thông minh đấy, nhưng người tiêu dùng bình dân cần thời gian để nhận ra. Chờ xem bản lĩnh kinh doanh của các bạn.', 'Quality play? Smart, but budget buyers take time to notice. Let\'s see what you\'re made of.') },
        { text: tr('🏳️ Nhượng bộ rút lui bớt ngân sách, bảo toàn dòng tiền.', '🏳️ Pull back budget and protect cash flow.'), fx: s => { B(s, 0.95); L(s, -2); },
          msg: tr('Giữ nguyên tiền mặt; thương hiệu ×0.95, trung thành -2.', 'Cash preserved; brand ×0.95, loyalty -2.'),
          reply: tr('Hahaha, biết người biết ta là tốt! Nhường sân chơi này cho Alpha, các bạn cứ ôm lấy số tiền tiết kiệm đó mà phòng thủ đi nhé.', 'Haha, know your limits! Leave this field to Alpha and hug your savings.') },
      ] },
    2: { city: 'TP. Hồ Chí Minh', lead: 'cfo',
      idle: { coo: tr('Nếu đơn tăng 35%, dây chuyền hiện tại sẽ chạy sát trần.', 'If orders rise 35%, the current line will run near its ceiling.'),
        cmo: tr('Thị trường đang mở, đây là lúc để người Sài Gòn biết tên mình.', 'The market is opening up; time for Saigon to learn our name.'),
        sec: tr('Mình đã lưu thông báo gói kích cầu vào Nhật ký đội.', 'I saved the stimulus announcement to the Team Journal.'),
        ceo: tr('Cơ hội lớn, nhưng mình không muốn cháy vốn ở vòng hai.', 'Big opportunity, but I don\'t want to burn cash in round two.'),
        lumina: tr('CFO đang giữ phương án phân bổ vốn cho vòng này.', 'The CFO holds this round\'s capital plan.') },
      text: tr('Gói kích cầu và miễn thuế xuất khẩu vừa có hiệu lực, cầu dự kiến tăng 35%. Mình có ba cách dùng tiền cho vòng này. Chọn đi.', 'The stimulus and export-tax waiver just took effect; demand is expected up 35%. Three ways to deploy cash this round. Your call.'),
      choices: [
        { text: tr('🏭 Đầu tư tăng công suất để đón đơn hàng (40tr₫).', '🏭 Invest in capacity to catch the orders (40m₫).'), fx: s => { s.balance -= 40; O(s, 3); },
          msg: tr('Chi 40tr₫, OEE +3.', '40m₫ spent, OEE +3.'), reply: tr('Được. Mình giải ngân ngay để COO kịp lắp đặt trước khi đơn về.', 'Done. I\'ll release funds now so the COO can install before orders land.') },
        { text: tr('📣 Dồn ngân sách quảng cáo ra thị trường mới (25tr₫).', '📣 Push ad budget into the new market (25m₫).'), fx: s => { s.balance -= 25; AD(s, 3); },
          msg: tr('Chi 25tr₫, hiệu quả quảng cáo +3.', '25m₫ spent, ad effectiveness +3.'), reply: tr('Mình duyệt. Nhưng nhớ theo dõi tỷ lệ doanh thu trên chi phí marketing nhé.', 'Approved. Keep an eye on revenue per marketing dong though.') },
        { text: tr('🛟 Giữ tiền mặt làm quỹ dự phòng.', '🛟 Keep the cash as a reserve.'), fx: s => { L(s, -1); },
          msg: tr('Không chi thêm; trung thành -1 vì chậm phản ứng.', 'No spend; loyalty -1 for reacting slowly.'), reply: tr('An toàn. Chỉ lo đối thủ tranh thủ sóng kích cầu trước mình.', 'Safe. I just worry rivals will ride the stimulus wave first.') },
      ] },
    3: { city: 'Khánh Hòa', lead: 'cmo',
      idle: { cfo: tr('Giảm giá sâu là bào mòn biên lợi nhuận. Mình không ủng hộ.', 'Deep discounts erode margin. I\'m against it.'),
        coo: tr('Muốn làm bao bì mới thì báo mình sớm, dây chuyền cần chỉnh khuôn.', 'Tell me early if we\'re doing new packaging; the line needs retooling.'),
        sec: tr('Đối thủ giảm 15% ở kênh Modern Trade, mình đã ghi lại.', 'A rival cut 15% in Modern Trade; logged.'),
        ceo: tr('CMO đang có phương án đối phó chiến tranh giá.', 'The CMO has a plan for the price war.'),
        lumina: tr('Hai lối đi: Bundling hoặc tăng Value-Added. Hỏi CMO nhé.', 'Two paths: Bundling or Value-Added. Ask the CMO.') },
      text: tr('Đối thủ vừa giảm giá 15% ở kênh Modern Trade, khách đang cực nhạy về giá. Mình không muốn lao vào đua giá đáy. CEO chọn hướng nào?', 'A rival just cut 15% in Modern Trade and customers are very price-sensitive. I don\'t want a race to the bottom. Which way?'),
      choices: [
        { text: tr('🎁 Bundling: combo chậu + phụ kiện, giữ giá niêm yết (10tr₫).', '🎁 Bundling: combo set + accessory, keep list price (10m₫).'), fx: s => { s.balance -= 10; L(s, 4); },
          msg: tr('Chi 10tr₫, trung thành +4.', '10m₫ spent, loyalty +4.'), reply: tr('Combo giữ khách cũ mà không phải hạ giá. Mình lên thiết kế ngay.', 'Combos keep existing customers without cutting price. Designing now.') },
        { text: tr('✨ Value-Added: cải tiến bao bì, kể chuyện làng nghề (20tr₫).', '✨ Value-Added: better packaging and craft story (20m₫).'), fx: s => { s.balance -= 20; B(s, 1.06); },
          msg: tr('Chi 20tr₫, thương hiệu ×1.06.', '20m₫ spent, brand ×1.06.'), reply: tr('Tăng giá trị cảm nhận là cách bền nhất. Người Khánh Hòa sẽ nhớ câu chuyện này.', 'Raising perceived value lasts longest. Khánh Hòa will remember this story.') },
        { text: tr('🏷️ Giảm giá theo đối thủ để giữ thị phần.', '🏷️ Match the rival\'s price cut to hold share.'), fx: s => { AD(s, 2); B(s, 0.95); L(s, -4); },
          msg: tr('Hiệu quả quảng cáo +2; thương hiệu ×0.95, trung thành -4.', 'Ad effectiveness +2; brand ×0.95, loyalty -4.'), reply: tr('Mình làm theo, nhưng khách quen sẽ bắt đầu coi mình là hàng rẻ.', 'I\'ll do it, but loyal customers will start seeing us as cheap.') },
      ] },
    4: { city: 'Đà Nẵng', lead: 'coo',
      idle: { cfo: tr('Giá điện tăng 30%. Mình đang dự phòng thêm vốn.', 'Power is up 30%. I\'m setting aside extra reserve.'),
        cmo: tr('Cầu giảm 30%, mình sẽ giảm nhịp quảng cáo cho đỡ lãng phí.', 'Demand is down 30%; I\'ll slow ads to avoid waste.'),
        sec: tr('Biến cố khẩn cấp. Mình đang tổng hợp số liệu sản xuất cho CEO.', 'Urgent event. I\'m compiling production data for the CEO.'),
        ceo: tr('COO nắm rõ nhất dây chuyền. Nghe COO trước.', 'The COO knows the line best. Hear the COO first.'),
        lumina: tr('Khủng hoảng luôn ẩn chứa cơ hội cho đội có kỷ luật.', 'Every crisis hides an opportunity for a disciplined team.') },
      text: tr('Giá điện sản xuất tăng vọt, OEE đang bị kéo xuống. Mình có ba cách xử lý dây chuyền trong vòng này.', 'Production power prices have spiked and OEE is being dragged down. Three ways to handle the line this round.'),
      choices: [
        { text: tr('🌙 Dời lịch chạy máy sang giờ thấp điểm (5tr₫).', '🌙 Shift machine runs to off-peak hours (5m₫).'), fx: s => { s.balance -= 5; O(s, 4); },
          msg: tr('Chi 5tr₫, OEE +4.', '5m₫ spent, OEE +4.'), reply: tr('Ca đêm tốn phụ cấp nhưng tiền điện giảm hẳn. Mình xếp lịch ngay.', 'Night shifts cost allowances but cut power bills sharply. Scheduling now.') },
        { text: tr('🔧 Bảo trì dự phòng toàn bộ dây chuyền (15tr₫).', '🔧 Preventive maintenance on the whole line (15m₫).'), fx: s => { s.balance -= 15; O(s, 2); D(s, -0.5); },
          msg: tr('Chi 15tr₫, OEE +2, phế phẩm -0.5%.', '15m₫ spent, OEE +2, defects -0.5%.'), reply: tr('Máy chạy mượt hơn thì hao điện ít hơn. Mình gọi đội kỹ thuật.', 'Smoother machines draw less power. Calling the tech crew.') },
        { text: tr('⏸️ Giữ nguyên, chấp nhận chi phí tăng.', '⏸️ Change nothing, absorb the higher cost.'), fx: s => { O(s, -2); D(s, 0.3); },
          msg: tr('Không chi thêm; OEE -2, phế phẩm +0.3%.', 'No spend; OEE -2, defects +0.3%.'), reply: tr('Mình vẫn chạy được, nhưng máy sẽ nóng và lỗi nhiều hơn.', 'We can still run, but machines will run hot and fail more.') },
      ] },
    5: { city: 'Thanh Hóa', lead: 'sec',
      idle: { cfo: tr('Giá thành đơn vị tăng 25%. Mọi phương án đều tốn tiền.', 'Unit cost is up 25%. Every option costs money.'),
        cmo: tr('Nếu giao trễ, mình cần chuẩn bị thông điệp xin lỗi khách.', 'If we deliver late, I need an apology message ready.'),
        coo: tr('Dây chuyền đình trệ vì thiếu linh kiện đầu vào.', 'The line has stalled for lack of input parts.'),
        ceo: tr('SEC đang điều phối họp khẩn. Qua đó đi.', 'SEC is running the emergency meeting. Head over.'),
        lumina: tr('Tăng ngân sách vận chuyển hay đàm phán lại? SEC đã tổng hợp đủ dữ kiện.', 'Raise shipping budget or renegotiate? SEC has the facts.') },
      text: tr('Họp khẩn toàn đội: tàu hàng mắc kẹt, tỷ lệ đáp ứng đơn giảm 15%. Mình đã tổng hợp ba phương án từ COO và CFO, CEO chốt giúp.', 'Emergency meeting: the cargo ship is stuck and fulfillment is down 15%. I\'ve gathered three options from the COO and CFO. Please decide.'),
      choices: [
        { text: tr('✈️ Tăng ngân sách vận chuyển, giao đúng hẹn (30tr₫).', '✈️ Raise shipping budget, deliver on time (30m₫).'), fx: s => { s.balance -= 30; L(s, 3); },
          msg: tr('Chi 30tr₫, trung thành +3.', '30m₫ spent, loyalty +3.'), reply: tr('Đắt nhưng giữ được uy tín. Mình báo khách ngay.', 'Pricey but keeps our reputation. Informing customers now.') },
        { text: tr('🤝 Đàm phán lại thời gian giao hàng với khách.', '🤝 Renegotiate delivery times with customers.'), fx: s => { L(s, -3); },
          msg: tr('Không chi thêm; trung thành -3.', 'No spend; loyalty -3.'), reply: tr('Mình soạn thư ngay. Vài khách sẽ không vui.', 'Drafting the letters. Some customers won\'t be happy.') },
        { text: tr('🏠 Chuyển sang nhà cung cấp nội địa (15tr₫).', '🏠 Switch to a domestic supplier (15m₫).'), fx: s => { s.balance -= 15; D(s, 0.5); L(s, 1); },
          msg: tr('Chi 15tr₫, phế phẩm +0.5%, trung thành +1.', '15m₫ spent, defects +0.5%, loyalty +1.'), reply: tr('Nhanh hơn chờ tàu, nhưng COO cần kiểm soát chất lượng lô đầu.', 'Faster than waiting for the ship, but the COO must QC the first batch.') },
      ] },
    6: { city: 'Hà Nội', lead: 'lumina',
      idle: { cfo: tr('Vòng cuối. Mình muốn kết thúc mùa với lợi nhuận dương.', 'Final round. I want to end the season in profit.'),
        cmo: tr('Khách ít nhạy giá hơn, đây là lúc nâng tầm thương hiệu.', 'Customers are less price-sensitive; time to lift the brand.'),
        coo: tr('Chi phí nhân công tăng 10%, mình đã tính vào kế hoạch.', 'Labor is up 10%; already in the plan.'),
        sec: tr('Nhật ký đội đã đủ 5 vòng. Vòng này là trang cuối.', 'The journal has 5 rounds. This is the last page.'),
        ceo: tr('Lumina có đề xuất cho vòng chung kết.', 'Lumina has a proposal for the final round.') },
      text: tr('Vòng chung kết! Sức mua bùng nổ, trọng số thương hiệu ×1.5. Đội mình có ba cách về đích.', 'The final round! Purchasing power is booming and brand weight is ×1.5. Three ways to finish.'),
      choices: [
        { text: tr('💎 Ra mắt dòng Premium (30tr₫).', '💎 Launch a Premium line (30m₫).'), fx: s => { s.balance -= 30; B(s, 1.08); },
          msg: tr('Chi 30tr₫, thương hiệu ×1.08.', '30m₫ spent, brand ×1.08.'), reply: tr('Thương hiệu đất sét Việt lên kệ cao cấp. CMO sẽ rất vui.', 'A Vietnamese clay brand on premium shelves. The CMO will be thrilled.') },
        { text: tr('🚀 Mở rộng quy mô phục vụ làn sóng mới (40tr₫).', '🚀 Scale up for the new wave (40m₫).'), fx: s => { s.balance -= 40; AD(s, 3); O(s, -2); },
          msg: tr('Chi 40tr₫, hiệu quả quảng cáo +3, OEE -2.', '40m₫ spent, ad effectiveness +3, OEE -2.'), reply: tr('Nhiều đơn hơn, nhiều việc hơn. COO chuẩn bị tinh thần nhé.', 'More orders, more work. COO, brace yourself.') },
        { text: tr('⚖️ Cân bằng: nâng nhẹ thương hiệu, giữ quỹ (15tr₫).', '⚖️ Balanced: modest brand lift, keep reserves (15m₫).'), fx: s => { s.balance -= 15; B(s, 1.03); AD(s, 1); },
          msg: tr('Chi 15tr₫, thương hiệu ×1.03, hiệu quả quảng cáo +1.', '15m₫ spent, brand ×1.03, ad effectiveness +1.'), reply: tr('Về đích chắc chắn. CFO sẽ cảm ơn bạn.', 'A safe finish. The CFO will thank you.') },
      ] },
  };

  // Thoại đối thủ theo thị phần & số cờ thật.
  function rivalLine(key, s) {
    const d = RIVAL_DEF[key], meta = rivalsList().find(r => r.name === d.name) || {};
    const c = (s.competitors || []).find(x => x.name === d.name);
    const share = c ? (c.share || 25).toFixed(1) : '25.0';
    const flags = (s.conquest || []).filter(x => !x.win && x.winner === d.name).length;
    const mine = (s.conquest || []).filter(x => x.win).length;
    const lead = flags > mine;
    const base = {
      alpha: lead ? tr(`${flags} lá cờ đã mang màu cam của Alpha. Thị phần ${share}% – các bạn còn đuổi theo nổi không?`, `${flags} flags already fly Alpha orange. ${share}% share – can you still keep up?`)
                  : tr(`Thị phần tôi đang ${share}%. Giá rẻ thắng dài hạn, cứ chờ đấy.`, `I'm at ${share}% share. Cheap wins in the long run, just wait.`),
      mekong: lead ? tr(`Chậm mà chắc. ${flags} tỉnh đã tin Mekong Ventures. Thị phần ${share}%.`, `Slow and steady. ${flags} provinces already trust Mekong Ventures. ${share}% share.`)
                   : tr(`Mekong không vội. ${share}% thị phần, bám rễ từng khách hàng một.`, `Mekong is in no hurry. ${share}% share, rooted one customer at a time.`),
      star: lead ? tr(`Khách sành điệu chọn Star Clay: ${flags} lá cờ tím, ${share}% thị phần.`, `Discerning buyers pick Star Clay: ${flags} purple flags, ${share}% share.`)
                 : tr(`Star Clay bán sự khan hiếm. ${share}% là đủ, miễn biên lợi nhuận cao.`, `Star Clay sells scarcity. ${share}% is enough, as long as margins stay high.`),
    }[key];
    return base + (meta.counter ? '\n\n' + tr('Lumina nhắc: ', 'Lumina\'s tip: ') + meta.counter : '');
  }

  const CSS = `
#bzo{position:fixed;inset:0;z-index:60;background:#dfeaf0;font-family:inherit;color:#033337;overflow:hidden;user-select:none}
#bzo .w{position:absolute;left:0;top:0;width:2400px;height:1560px;background:radial-gradient(#c5d9e3 1.5px,transparent 1.5px) 0 0/28px 28px,#e6f0f5;will-change:transform}
#bzo .wall{position:absolute;left:0;right:0;top:0;height:220px;background:#f2e6d0;box-shadow:inset 0 -14px 0 #e3d3b6}
#bzo .rug{position:absolute;border-radius:999px;background:#f5e9d3;box-shadow:inset 0 0 0 10px #eadcbf}
#bzo .desk{position:absolute;background:#0f7596;border-radius:18px;box-shadow:inset 0 -10px 0 rgba(0,0,0,.18),0 14px 20px -8px rgba(0,60,80,.35)}
#bzo .desk::after{content:"";position:absolute;inset:8px 8px auto 8px;height:38%;border-radius:12px;background:#f2e6d0}
#bzo .npc,#bzo .stn{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;cursor:pointer}
#bzo .npc img{height:210px;width:auto;transform-origin:bottom center;animation:bzo-idle 2.6s ease-in-out infinite}
#bzo .npc.rv img{height:190px}
#bzo .npc.near img,#bzo .stn.near .box{filter:drop-shadow(0 0 8px rgba(0,196,255,.9))}
#bzo .tag{margin-top:6px;background:#033337;color:#fff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:999px;white-space:nowrap}
#bzo .bang{position:absolute;top:-30px;background:#f08a3c;color:#fff;font-weight:900;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:bzo-pop 1.1s ease-in-out infinite}
#bzo .stn .box{width:104px;height:104px;border-radius:50%;background:#fff;box-shadow:0 12px 16px -8px rgba(0,60,80,.4);display:flex;align-items:center;justify-content:center;font-size:44px;overflow:hidden}
#bzo .stn .box img{width:100%;height:100%;object-fit:cover}
#bzo .stn.flat .box{border-radius:26px;background:#f7ecd9}
#bzo .wall{background:#f2e6d0;box-shadow:inset 0 -14px 0 #e8a04f}
#bzo .pl{position:absolute;transform:translate(-50%,-100%)}
#bzo .pl img{height:230px;width:auto;position:relative;transform-origin:bottom center}
#bzo .sh{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:110px;height:22px;border-radius:50%;background:rgba(15,117,150,.3);filter:blur(2px)}
#bzo .wmap{position:absolute;left:1200px;top:18px;transform:translateX(-50%);width:108px;aspect-ratio:768/1376;border-radius:12px;overflow:hidden;border:5px solid #6b4a2b;box-shadow:0 10px 16px -6px rgba(0,0,0,.4);cursor:pointer}
#bzo .hud{position:absolute;top:12px;left:12px;right:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;z-index:2}
#bzo .pill{background:rgba(255,255,255,.92);border:2px solid #dbe9f0;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:700}
#bzo .hint{position:absolute;bottom:14px;right:14px;background:rgba(3,51,55,.75);color:#fff;font-size:12px;padding:8px 12px;border-radius:12px;max-width:290px;z-index:2}
#bzo .joy{position:absolute;bottom:28px;left:28px;width:128px;height:128px;border-radius:50%;background:rgba(255,255,255,.35);border:4px solid rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;touch-action:none;z-index:2}
#bzo .thumb{width:56px;height:56px;border-radius:50%;background:#fff;box-shadow:inset -4px -4px 8px rgba(0,0,0,.1),4px 4px 12px rgba(0,0,0,.15)}
#bzo .dlg{position:absolute;left:16px;right:16px;bottom:20px;max-width:900px;margin:0 auto;background:#fff;border:4px solid #dbe9f0;border-radius:28px;box-shadow:10px 10px 30px rgba(0,60,80,.15);padding:22px;display:flex;gap:20px;align-items:flex-start;z-index:3}
#bzo .dlg .av{height:170px;width:auto;flex-shrink:0}
#bzo .dlg .ic{width:120px;height:120px;border-radius:28px;background:#f4faff;display:flex;align-items:center;justify-content:center;font-size:60px;flex-shrink:0}
#bzo .dlg h3{margin:0 0 4px;font-size:20px;font-weight:900;color:#006687}
#bzo .dlg p{margin:0 0 14px;font-size:16px;line-height:1.5;min-height:48px;text-wrap:pretty;white-space:pre-line}
#bzo .ch{display:flex;flex-direction:column;gap:10px}
#bzo .ch button{text-align:left;padding:13px 16px;border:2px solid #dbe9f0;background:#f4faff;border-radius:16px;font:inherit;font-weight:600;font-size:15px;cursor:pointer;color:inherit}
#bzo .ch button:hover{background:#e0f4fb}
#bzo .ch button.p{align-self:flex-end;background:#006687;color:#fff;border-color:#006687;font-weight:800}
#bzo .toast{position:absolute;top:60px;right:14px;background:#033337;color:#fff;padding:10px 14px;border-radius:14px;font-size:13px;z-index:4;transition:.3s;opacity:0;transform:translateY(-20px);max-width:340px}
#bzo .toast.on{opacity:1;transform:none}
#bzo .skip{margin-left:auto;background:#006687;color:#fff;border:0;border-radius:999px;padding:7px 14px;font:inherit;font-weight:800;cursor:pointer}
@keyframes bzo-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes bzo-pop{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@media (max-width:640px){#bzo .dlg{flex-direction:column;align-items:center;padding:14px}#bzo .dlg .av{height:110px}#bzo .npc img{height:170px}#bzo .pl img{height:185px}}`;

  const isDone = (s, n) => !!((s.officeDone && s.officeDone[n]) || (n === 1 && s.officeRound1));
  const ORIG = {};

  function openOffice(s, n, onDone) {
    const R = ROUNDS[n] || null;
    const decide = !!(R && !isDone(s, n) && !s.committed && !s.finished);
    if (!document.getElementById('bzo-css')) { const st = document.createElement('style'); st.id = 'bzo-css'; st.textContent = CSS; document.head.appendChild(st); }
    const me = String((s.profile && s.profile.role) || 'CEO').toLowerCase();
    const myRole = ROLES[me] ? me : 'ceo';
    const lead = !decide ? null : (R.lead === myRole ? 'lumina' : R.lead);
    const cast = {};
    Object.keys(ROLES).filter(k => k !== myRole).forEach((k, i) => { cast[k] = { ...ROLES[k], x: SPOTS[i][0], y: SPOTS[i][1] }; });
    cast.lumina = { ...LUMINA, img: A(LUMINA_POSE[n] || 'v2/lumina.png'), fb: LUMINA.img };
    for (const k of Object.keys(RIVAL_DEF)) cast[k] = { ...RIVAL_DEF[k], name: 'CEO ' + RIVAL_DEF[k].name, x: RIVAL_SPOTS[k][0], y: RIVAL_SPOTS[k][1], rival: true };
    let evName = ''; try { evName = typeof currentEvent === 'function' ? currentEvent(s).name : ''; } catch (e) {}
    const city = R ? R.city : ((typeof CONQUEST_STOPS !== 'undefined' && CONQUEST_STOPS[Math.min(s.round, 6) - 1]) || {}).name || '';
    const wallMap = window.OfficeRounds && OfficeRounds.mapHtml ? OfficeRounds.mapHtml(16, -1) : '';

    const root = document.createElement('div'); root.id = 'bzo';
    root.innerHTML = `
      <div class="w">
        <div class="wall"></div>
        <div style="position:absolute;left:300px;top:40px;width:220px;height:140px;border:6px solid #6b4a2b;border-radius:14px;overflow:hidden;box-shadow:0 10px 16px -6px rgba(0,0,0,.4)"><img src="assets/illustrations/game/phong-hop-chien-luoc.webp" alt="" style="width:100%;height:100%;object-fit:cover"></div>
        <div style="position:absolute;left:1880px;top:40px;width:220px;height:140px;border:6px solid #6b4a2b;border-radius:14px;overflow:hidden;box-shadow:0 10px 16px -6px rgba(0,0,0,.4)"><img src="assets/illustrations/command-center.webp" alt="" style="width:100%;height:100%;object-fit:cover"></div>
        ${wallMap ? `<div class="wmap" title="${tr('Bản đồ cờ', 'Flag map')}">${wallMap}</div>` : ''}
        <div style="position:absolute;left:1200px;top:232px;transform:translateX(-50%);background:rgba(255,255,255,.9);border-radius:16px;padding:6px 20px;font-weight:900;color:#006687;letter-spacing:.04em;text-align:center;white-space:nowrap">${tr('VĂN PHÒNG ĐIỀU HÀNH', 'EXECUTIVE OFFICE')} · ${city.toUpperCase()} · ${tr('VÒNG', 'ROUND')} ${Math.min(s.round, 6)}${evName ? `<div style="font-size:12px;font-weight:700;letter-spacing:0;color:#033337">${evName}</div>` : ''}</div>
        <div class="rug" style="left:820px;top:600px;width:760px;height:420px"></div>
        <div class="desk" style="left:900px;top:680px;width:600px;height:260px"></div>
        <div class="desk" style="left:180px;top:560px;width:300px;height:150px"></div><div class="desk" style="left:180px;top:1060px;width:300px;height:150px"></div>
        <div class="desk" style="left:1920px;top:560px;width:300px;height:150px"></div><div class="desk" style="left:1920px;top:1060px;width:300px;height:150px"></div>
        <div class="rug" style="left:640px;top:1300px;width:1120px;height:170px;background:#efe3f0;box-shadow:inset 0 0 0 10px #e2d2e4"></div>
        <div style="position:absolute;left:1200px;top:1480px;transform:translateX(-50%);font-size:12px;font-weight:900;color:#5a32a3;letter-spacing:.06em">${tr('KHU KHÁCH · ĐỐI THỦ AI', 'VISITORS · AI RIVALS')}</div>
        <div class="npcs"></div>
        <div class="pl"><div class="sh"></div><img class="pi" src="${ROLES[myRole].img}" alt="${ROLES[myRole].name}"><div style="text-align:center;margin-top:4px"><span class="pill" style="font-size:12px;color:#006687">${tr('Bạn', 'You')} · ${myRole.toUpperCase()}</span></div></div>
        <div class="mk" style="position:absolute;width:32px;height:32px;margin:-16px;border-radius:50%;border:4px solid #00c4ff;display:none"></div>
      </div>
      <div class="hud"><span class="pill hb"></span><span class="pill hr"></span><span class="pill hl"></span><span class="pill ho"></span><span class="pill hf"></span><button class="skip">${decide ? tr('Bỏ qua cảnh ▸', 'Skip scene ▸') : tr('Rời văn phòng ▸', 'Leave office ▸')}</button></div>
      <div class="hint">${decide ? tr('WASD / mũi tên / joystick / bấm sàn để đi. Đến gần rồi bấm <b>E</b> hoặc chạm để nói. Người có dấu <b style="color:#f08a3c">!</b> giữ quyết định vòng này.', 'WASD / arrows / joystick / tap floor to move. Get close and press <b>E</b> or tap to talk. The one marked <b style="color:#f08a3c">!</b> holds this round\'s decision.') : tr('Tự do dạo văn phòng: nói chuyện với đội, đối thủ, hoặc ghé các góc chức năng.', 'Roam freely: talk to the team, the rivals, or visit the function corners.')}</div>
      <div class="toast"></div>
      <div class="joy"><div class="thumb"></div></div>`;
    document.body.appendChild(root);
    const q = sel => root.querySelector(sel);
    const world = q('.w'), player = q('.pl'), pimg = q('.pi'), npcs = q('.npcs'), marker = q('.mk'), joy = q('.joy'), thumb = q('.thumb'), toastEl = q('.toast');
    const hud = () => {
      q('.hb').textContent = '💰 ' + fmt(s.balance); q('.hr').textContent = '✨ ' + s.brand.toFixed(2); q('.hl').textContent = '❤️ ' + s.brandLoyalty + '%';
      q('.ho').textContent = '⚙️ OEE ' + Math.round(s.oee ?? 85) + '%'; q('.hf').textContent = '🚩 ' + (s.conquest || []).filter(c => c.win).length + '/6';
    }; hud();
    const spots = {};
    for (const [id, c] of Object.entries(cast)) {
      const el = document.createElement('div'); el.className = 'npc' + (c.rival ? ' rv' : ''); el.dataset.id = id; el.style.left = c.x + 'px'; el.style.top = c.y + 'px';
      el.innerHTML = `${id === lead ? '<span class="bang">!</span>' : ''}<img src="${c.img}" alt="${c.name}"${c.fb ? ` onerror="this.onerror=null;this.src='${c.fb}'"` : ''} style="animation-delay:${-Math.random() * 3}s"><span class="tag"${c.rival ? ` style="background:${c.accent}"` : ''}>${c.rival ? c.icon + ' ' : ''}${c.name}</span>`;
      el.onclick = e => { e.stopPropagation(); talk(id); }; npcs.appendChild(el); spots[id] = c;
    }
    for (const st of STATIONS) {
      const el = document.createElement('div'); el.className = 'stn'; el.dataset.id = 'st:' + st.id; el.style.left = st.x + 'px'; el.style.top = st.y + 'px';
      if (st.flat) el.classList.add('flat');
      el.innerHTML = `<div class="box"><img src="${ART[st.id] || 'assets/ui/' + st.id + '.png'}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:18px" onerror="this.outerHTML='${st.icon}'"></div><span class="tag" style="background:#006687">${st.name}</span>`;
      el.onclick = e => { e.stopPropagation(); talk('st:' + st.id); }; npcs.appendChild(el); spots['st:' + st.id] = { ...st, station: true };
    }
    const wm = q('.wmap'); if (wm) wm.onclick = e => { e.stopPropagation(); finish(); const b = document.getElementById('office-map-widget'); if (b) b.click(); };

    let px = 1200, py = 1120, vec = { x: 0, y: 0 }, keys = {}, target = null, facing = 1, drag = false, pid = null, jc = {}, nearId = null, camX = 0, camY = 0, dlg = null, done = false, last = performance.now(), toastT, typeT, raf;
    const toast = m => { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 3400); };
    const type = (el, text, cb) => { clearInterval(typeT); el.textContent = ''; let i = 0; typeT = setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(typeT); cb && cb(); } }, 16); };
    const busy = () => !!root.querySelector('.bzs-panel');
    const closeDlg = () => { clearInterval(typeT); if (dlg) { dlg.remove(); dlg = null; } };
    function openDlg(c, text, choices) {
      closeDlg(); dlg = document.createElement('div'); dlg.className = 'dlg';
      dlg.innerHTML = `${c.station ? `<div class="ic"><img src="${ART[c.id] || 'assets/ui/' + c.id + '.png'}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:28px" onerror="this.outerHTML='${c.icon}'"></div>` : `<img class="av" src="${c.img}" alt=""${c.fb ? ` onerror="this.onerror=null;this.src='${c.fb}'"` : ''}>`}<div style="flex:1;min-width:0"><h3${c.accent ? ` style="color:${c.accent}"` : ''}>${c.name}</h3><p></p><div class="ch"></div></div>`; root.appendChild(dlg);
      const box = dlg.querySelector('.ch');
      type(dlg.querySelector('p'), text, () => choices.forEach(ch => { const b = document.createElement('button'); if (ch.primary) b.className = 'p'; b.textContent = ch.text; b.onclick = ch.onPick; box.appendChild(b); }));
    }
    const bye = { text: tr('Cảm ơn, tôi đi tiếp.', 'Thanks, moving on.'), primary: true, onPick: closeDlg };
    function talk(id) {
      if (dlg || done || busy()) return; const c = spots[id]; if (!c) return;
      if (Math.hypot(c.x - px, c.y - py) > 260) { target = { x: c.x + (px < c.x ? -150 : 150), y: c.y + 30, then: () => talk(id) }; marker.style.display = 'block'; marker.style.left = target.x + 'px'; marker.style.top = target.y + 'px'; return; }
      if (c.station) {
        if (window.BizonStations && BizonStations.can(c.id)) {
          return BizonStations.open(c.id, { root, hud, toast, openTab: tab => finish(tab) });
        }
        const warn = decide ? '\n\n' + tr('Quyết định của vòng này vẫn đang chờ bạn trong văn phòng.', 'This round\'s decision is still waiting for you in the office.') : '';
        return openDlg(c, c.desc + warn, [{ text: tr('Mở ', 'Open ') + c.name + ' ➜', primary: true, onPick: () => finish(c.tab) }, { text: tr('Để sau', 'Later'), onPick: closeDlg }]);
      }
      if (c.rival && id !== lead) return openDlg(c, rivalLine(id, s), [bye]);
      if (id !== lead) return openDlg(c, (R && R.idle[id]) || (R && R.idle.lumina) || tr('Chúc đội mình một vòng thật tốt!', 'Have a great round, team!'), [bye]);
      openDlg(c, R.text, R.choices.map(ch => ({ text: ch.text, onPick: () => {
        ch.fx(s); s.officeDone = s.officeDone || {}; s.officeDone[n] = ch.text.replace(/^\S+\s/, '');
        if (n === 1) s.officeRound1 = ch.text;
        if (Array.isArray(s.advisorHistory)) s.advisorHistory.push({ round: n, role: myRole.toUpperCase(), source: 'office', text: s.officeDone[n] });
        if (typeof save === 'function') save();
        hud(); toast(ch.msg);
        const el = npcs.querySelector(`[data-id="${lead}"] .bang`); if (el) el.remove();
        openDlg(c, ch.reply, [{ text: tr('Xác nhận & tiếp tục 🚩', 'Confirm & continue 🚩'), primary: true, onPick: () => finish() }]);
      } })));
    }
    function finish(tab) {
      if (done) return; done = true; closeDlg(); const pn = root.querySelector('.bzs-panel [data-close]'); if (pn) pn.click(); cancelAnimationFrame(raf); root.remove();
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      if (tab) (ORIG.showTab || window.showTab)(tab); else onDone && onDone();
    }
    q('.skip').onclick = () => finish();
    joy.addEventListener('pointerdown', e => { drag = true; pid = e.pointerId; joy.setPointerCapture(pid); const r = joy.getBoundingClientRect(); jc = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    joy.addEventListener('pointermove', e => { if (!drag || e.pointerId !== pid) return; let dx = e.clientX - jc.x, dy = e.clientY - jc.y, d = Math.hypot(dx, dy); if (d > 50) { dx *= 50 / d; dy *= 50 / d; } thumb.style.transform = `translate(${dx}px,${dy}px)`; vec = { x: dx / 50, y: dy / 50 }; target = null; });
    const jr = e => { if (e.pointerId !== pid) return; drag = false; pid = null; thumb.style.transform = ''; vec = { x: 0, y: 0 }; };
    joy.addEventListener('pointerup', jr); joy.addEventListener('pointercancel', jr);
    const kd = e => { keys[e.key.toLowerCase()] = true; if (e.key.toLowerCase() === 'e' && nearId && !dlg) talk(nearId); if (e.key === 'Escape') { const pn = root.querySelector('.bzs-panel [data-close]'); if (pn) pn.click(); else closeDlg(); } };
    const ku = e => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    world.addEventListener('pointerdown', e => { if (dlg || busy()) return; const r = world.getBoundingClientRect(); target = { x: e.clientX - r.left, y: e.clientY - r.top }; marker.style.display = 'block'; marker.style.left = target.x + 'px'; marker.style.top = target.y + 'px'; });
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!dlg && !busy()) {
        let vx = vec.x, vy = vec.y;
        if (!drag) { const kx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), ky = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0); if (kx || ky) { vx = kx; vy = ky; target = null; } }
        if (target) { const dx = target.x - px, dy = target.y - py, d = Math.hypot(dx, dy); if (d < 8) { const t = target.then; target = null; marker.style.display = 'none'; t && t(); } else { vx = dx / d; vy = dy / d; } }
        const sp = 400 * dt, l = Math.hypot(vx, vy) || 1, mv = Math.min(1, Math.hypot(vx, vy));
        px = clamp(px + vx / l * mv * sp, 80, 2320); py = clamp(py + vy / l * mv * sp, 470, 1540);
        if (Math.abs(vx) > 0.05) facing = vx < 0 ? -1 : 1;
        pimg.style.transform = mv > 0.05 ? `scaleX(${facing}) translateY(${Math.abs(Math.sin(now / 85)) * -7}px)` : `scaleX(${facing})`;
      }
      player.style.left = px + 'px'; player.style.top = py + 'px';
      const vw = root.clientWidth, vh = root.clientHeight;
      const tx = clamp(px - vw / 2, 0, Math.max(0, 2400 - vw)), ty = clamp(py - vh / 2 - 60, 0, Math.max(0, 1560 - vh));
      camX += (tx - camX) * Math.min(1, dt * 6); camY += (ty - camY) * Math.min(1, dt * 6);
      world.style.transform = `translate3d(${-camX}px,${-camY}px,0)`;
      nearId = null; let best = 220;
      for (const [id, c] of Object.entries(spots)) { const d = Math.hypot(c.x - px, c.y - py); if (d < best) { best = d; nearId = id; } }
      npcs.querySelectorAll('[data-id]').forEach(el => el.classList.toggle('near', el.dataset.id === nearId));
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  // Nút «Vào văn phòng» trên Trang chủ (gắn cạnh thẻ Bản đồ văn phòng / Lộ trình).
  function mountEntry() {
    if (document.getElementById('office-enter-btn')) return;
    const anchor = document.getElementById('office-map-card') || (document.getElementById('conquest-map') && document.getElementById('conquest-map').closest('.clay-card'));
    if (!anchor) return;
    anchor.insertAdjacentHTML('beforebegin', `<button id="office-enter-btn" type="button" class="clay-card w-full p-4 mb-4 flex items-center gap-3 text-left" style="display:flex;align-items:center;gap:12px">
      <span style="width:44px;height:44px;border-radius:14px;background:rgba(0,102,135,.1);display:flex;align-items:center;justify-content:center;font-size:24px">🏢</span>
      <span style="flex:1"><b style="display:block;color:#006687">${tr('Vào văn phòng điều hành', 'Enter the executive office')}</b><span style="font-size:11px;color:rgba(0,51,55,.55)">${tr('Đi lại, nói chuyện với đội và đối thủ, ghé các góc chức năng.', 'Walk around, talk to the team and rivals, visit function corners.')}</span></span><span style="font-weight:900;color:#006687">➜</span></button>`);
    document.getElementById('office-enter-btn').onclick = () => window.BizonOffice.open();
  }

  // Hook: popup biến cố → CTA (trừ 'home') → văn phòng → tab đó.
  ORIG.showTab = window.showTab;
  let pending = 0;
  window.showTab = function (tab) {
    const s = getS();
    if (pending && s && pending === s.round && !s.committed && !s.finished && !isDone(s, s.round)) {
      const n = pending; pending = 0;
      if (tab !== 'home') { openOffice(s, n, () => ORIG.showTab(tab)); return; }
    }
    pending = 0;
    return ORIG.showTab.apply(this, arguments);
  };
  ORIG.event = window.maybeShowEventIntro;
  if (ORIG.event) window.maybeShowEventIntro = function () {
    const s0 = getS(), before = s0 ? s0.eventShownRound : 0;
    const r = ORIG.event.apply(this, arguments);
    const s = getS();
    if (s && ROUNDS[s.round] && before < s.round && s.eventShownRound === s.round && !isDone(s, s.round)) pending = s.round;
    return r;
  };
  if (window.OfficeRounds && OfficeRounds.render) {
    const r0 = OfficeRounds.render; OfficeRounds.render = function () { const out = r0.apply(this, arguments); mountEntry(); return out; };
  }
  setTimeout(mountEntry, 0);
  window.BizonOffice = { rounds: ROUNDS, open: (n) => { const s = getS(); if (s) openOffice(s, n || Math.min(s.round, 6), () => ORIG.showTab('decisions')); } };

  // Deep link game.html#office → tự mở văn phòng 2D, dùng bởi "BizOn Office Game.html"
  // (trang xem trước độc lập trong menu Bộ sưu tập 3D). Không có S sẵn (khách chưa vào ván)
  // thì tự đăng nhập Đội Demo rồi thử lại tới khi có S.
  if (location.hash === '#office') {
    let tries = 0, demoTried = false;
    const tryOpen = () => {
      const s = getS();
      if (s) { window.BizonOffice.open(); return; }
      if (!demoTried && typeof doLoginDemo === 'function') { demoTried = true; try { doLoginDemo(); } catch (e) {} }
      if (++tries < 25) setTimeout(tryOpen, 400);
    };
    setTimeout(tryOpen, 600);
  }
})();
