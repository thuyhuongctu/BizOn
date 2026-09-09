/* BizOn Bật Nghiệp 2026 – Engine mô phỏng 6 vòng (client-side)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 * Mô hình hóa: decisions {price, marketing_budget,
 * production_volume, rd_investment} → financial_reports {revenue, net_profit,
 * market_share, inventory_stock}. Đơn vị tiền: nghìn ₫ (giá) / triệu ₫ (ngân sách).
 */

const ROUNDS_TOTAL = 6;
const BASE_MARKET_UNITS = 12000;     // tổng cầu thị trường mỗi vòng
const UNIT_COST = 45;                 // nghìn ₫ / sản phẩm (chưa gồm nhân công)
const FIXED_COST = 30;                // triệu ₫ / vòng (điện nước, mặt bằng)
const REF_PRICE = 150;                // nghìn ₫ – giá tham chiếu
const PRICE_ELASTICITY = 1.8;
const STARTING_BALANCE = 500;         // triệu ₫ (vốn giảng viên cấp)
const XP_PER_LEVEL = 100;
const AI_QUOTA_PER_ROUND = 3;         // ERR_AI_LIMIT

function MARKET_EVENTS_LIST() { return [
  null,
  { id: 'EV_STABLE', round: 1, tone: 'good', icon: '🌤️', name: T('Thị trường ổn định', 'Stable Market'), tag: T('VÒNG KHỞI ĐỘNG', 'KICKOFF ROUND'),
    desc: T('Vòng khởi động – nhu cầu thị trường ở mức chuẩn.', 'The kickoff round – market demand at baseline.'), demand: 1.0, costMul: 1.0,
    impacts: [{ icon: '📈', label: T('Nhu cầu thị trường', 'Market demand'), value: T('Chuẩn', 'Baseline'), dir: 'flat' }, { icon: '⚙️', label: T('Chi phí vận hành', 'Operating cost'), value: T('Ổn định', 'Stable'), dir: 'flat' }],
    luminaImg: 'lumina-vest-thumbsup', luminaMsg: T('Chào cả đội! Vòng đầu là lúc thiết lập nền tảng. CEO hãy thống nhất chiến lược giá, SEC nhớ ghi chép lại các quyết định nhé!',
      "Hi team! The first round is about setting the foundation. CEO, align on a pricing strategy, and SEC, remember to log the team's decisions!"),
    cta: { label: T('🎯 Nhập quyết định ngay', '🎯 Enter decisions now'), tab: 'decisions' } },
  { id: 'EV_GOLDEN', round: 2, tone: 'good', icon: '🌟', name: T('Cơ Hội Vàng', 'Golden Opportunity'), tag: T('SỰ KIỆN ĐẶC BIỆT', 'SPECIAL EVENT'),
    desc: T('Chính phủ vừa công bố gói kích cầu kinh tế và miễn thuế xuất khẩu. Đây là thời cơ để bứt phá doanh thu trên thị trường quốc tế.',
      'The government just announced an economic stimulus package and export tax exemption. This is the moment to break through on international revenue.'),
    demand: 1.35, costMul: 1.0, rdBoost: 1.5,
    impacts: [{ icon: '🧾', label: T('Thuế xuất khẩu', 'Export tax'), value: '0%', dir: 'down-good' }, { icon: '📦', label: T('Nhu cầu dự kiến', 'Expected demand'), value: '+35%', dir: 'up' }],
    luminaImg: 'lumina-ao-dai-clap', luminaMsg: T('Thật tuyệt vời! CFO hãy rà soát lại ngân sách đầu tư, còn COO hãy chuẩn bị tăng công suất để đáp ứng làn sóng đơn hàng mới này nhé!',
      'Wonderful news! CFO, review the investment budget, and COO, get ready to ramp up capacity for this new wave of orders!'),
    cta: { label: T('🏭 Tăng công suất ngay', '🏭 Ramp up capacity now'), tab: 'decisions' } },
  { id: 'EV_PRICEWAR', round: 3, tone: 'warn', icon: '⚔️', name: T('Cạnh Tranh Về Giá', 'Price Competition'), tag: T('CẢNH BÁO THỊ TRƯỜNG', 'MARKET WARNING'),
    desc: T('Đối thủ giảm giá 15% điện rộng tại kênh Modern Trade – khách hàng cực nhạy cảm về giá trong vòng này.',
      'A rival has cut prices 15% broadly in the Modern Trade channel – customers are extremely price-sensitive this round.'),
    demand: 1.0, costMul: 1.0, elasticityMul: 1.4,
    impacts: [{ icon: '🏷️', label: T('Giá đối thủ (kênh MT)', 'Rival price (MT channel)'), value: '-15%', dir: 'down' }, { icon: '💔', label: T('Độ nhạy giá của khách', 'Customer price sensitivity'), value: T('CAO', 'HIGH'), dir: 'up-bad' }],
    luminaImg: 'lumina-vest-worried', luminaMsg: T('Thưa CMO, đối thủ vừa châm ngòi chiến tranh giá! Ta có 2 lối đi: chiến thuật Bundling hoặc tăng Value-Added – đừng lao vào giảm giá sâu kẻo mất biên lợi nhuận.',
      "CMO, a rival just sparked a price war! We have 2 paths: a Bundling tactic or adding more Value-Added – don't dive into deep discounts or we'll lose our margin."),
    cta: { label: T('🤖 Xem giải pháp từ Lumina', '🤖 See Lumina\'s solution'), tab: 'advisor' } },
  { id: 'EV_RECESSION', round: 4, tone: 'bad', icon: '⚡', name: T('Khủng Hoảng Năng Lượng', 'Energy Crisis'), tag: T('CẢNH BÁO KHẨN CẤP', 'URGENT WARNING'), img: 'assets/illustrations/event-energy-crisis.webp',
    desc: T('Thị trường năng lượng toàn cầu đang gặp biến động cực lớn. Giá điện sản xuất tăng vọt, tổng cầu suy giảm.',
      'The global energy market is experiencing massive volatility. Production power costs have spiked and overall demand has fallen.'),
    demand: 0.7, costMul: 1.3, shake: true, oeeHit: 10,
    impacts: [{ icon: '📈', label: T('Chi phí vận hành', 'Operating cost'), value: '+30%', dir: 'up-bad' }, { icon: '🏭', label: T('Hiệu suất (OEE)', 'Efficiency (OEE)'), value: '-10%', dir: 'down' }],
    luminaImg: 'lumina-ao-dai-alert', luminaMsg: T('Cảnh báo khẩn cấp! Giá điện sản xuất tăng vọt. COO hãy rà soát lịch chạy máy, còn CFO cần dự phòng thêm vốn ngay nhé!',
      'Urgent warning! Production power costs have spiked. COO, review the machine schedule, and CFO, set aside extra reserve capital right away!'),
    cta: { label: T('⚡ Tối ưu năng lượng ngay', '⚡ Optimize energy now'), tab: 'reports', report: 'energy' } },
  { id: 'EV_SUPPLY', round: 5, tone: 'bad', icon: '🚢', name: T('Khủng Hoảng Chuỗi Cung Ứng', 'Supply Chain Crisis'), tag: T('CẢNH BÁO KHẨN CẤP', 'URGENT WARNING'),
    desc: T('Một sự cố nghiêm trọng tại các cửa ngõ giao thương quốc tế. Tàu chở hàng chính bị mắc kẹt, gây đình trệ dây chuyền sản xuất của BizOn.',
      "A serious incident at international trade gateways. The main cargo ship is stuck, stalling BizOn's production line."),
    demand: 1.0, costMul: 1.25, fulfillMul: 0.85, shake: true,
    impacts: [{ icon: '💰', label: T('Giá thành đơn vị', 'Unit cost'), value: '+25%', dir: 'up-bad' }, { icon: '📦', label: T('Tỷ lệ đáp ứng đơn hàng', 'Order fulfillment rate'), value: '-15%', dir: 'down' }],
    luminaImg: 'lumina-ao-dai-alert', luminaMsg: T('Thưa CEO, tình hình rất khẩn cấp! Dây chuyền sản xuất đình trệ vì thiếu linh kiện đầu vào. Chúng ta cần quyết định ngay: tăng ngân sách vận chuyển hay đàm phán lại thời gian giao hàng?',
      'CEO, this is extremely urgent! The production line has stalled from a shortage of input parts. We need to decide now: raise the shipping budget or renegotiate delivery times?'),
    cta: { label: T('👥 Họp khẩn cấp toàn đội', '👥 Emergency team meeting'), tab: 'decisions' } },
  { id: 'EV_MILESTONE', round: 6, tone: 'good', icon: '🐉', name: T('Việt Nam Hóa Rồng', 'Vietnam Ascendant'), tag: T('VÒNG CHUNG KẾT · KỊCH BẢN GIẢ ĐỊNH', 'FINAL ROUND · HYPOTHETICAL SCENARIO'), img: 'assets/illustrations/event-vietnam-2026.webp',
    desc: T('Kịch bản giả định «Rồng Việt vươn mình»: Việt Nam tiến vào nhóm thu nhập trung bình cao. Tầng lớp trung lưu mở rộng, sức mua bùng nổ – khách hàng ít nhạy cảm về giá, ưu tiên chất lượng và thương hiệu. (Tham số mô phỏng minh họa, không phải số liệu thống kê thực.)',
      "A hypothetical «Vietnam Ascendant» scenario: Vietnam moves into the upper-middle-income group. The middle class expands and purchasing power booms – customers become less price-sensitive and prioritize quality and brand. (Illustrative simulation parameters, not real statistics.)"),
    demand: 1.25, costMul: 1.0, elasticityMul: 0.85, wageMul: 1.1, brandPow: 1.5, mktBoost: 1.2,
    impacts: [{ icon: '🛍️', label: T('Tổng cầu thị trường', 'Total market demand'), value: '+25%', dir: 'up' }, { icon: '🏷️', label: T('Độ nhạy giá của khách', 'Customer price sensitivity'), value: '-15%', dir: 'down-good' }, { icon: '👷', label: T('Chi phí nhân công', 'Labor cost'), value: '+10%', dir: 'up-bad' }, { icon: '✨', label: T('Trọng số thương hiệu', 'Brand weight'), value: '×1.5', dir: 'up' }],
    luminaImg: 'lumina-ao-dai-clap', luminaMsg: T('Kịch bản chung kết, thưa đội ngũ điều hành! Trong kịch bản giả định này, Việt Nam tiến vào nhóm thu nhập trung bình cao – thị trường "thay da đổi thịt" với sức mua bùng nổ. Đây là cơ hội vàng để CMO nâng tầm thương hiệu thành dòng Premium và CEO mở rộng quy mô phục vụ làn sóng tiêu dùng mới!',
      'The final scenario, executive team! In this hypothetical scenario, Vietnam moves into the upper-middle-income group – the market transforms with a purchasing-power boom. This is a golden chance for the CMO to elevate the brand into a Premium line and for the CEO to scale up for this new wave of consumers!'),
    cta: { label: T('🐉 Bứt phá về đích', '🐉 Sprint to the finish'), tab: 'decisions' } },
]; }

function SHOP_ITEMS_LIST() { return [
  { id: 'SOLAR_01',     icon: '☀️', name: T('Pin Mặt Trời', 'Solar Panels'),   type: 'blueprint',  price: 150, img: 'assets/illustrations/solar-farm.webp', desc: T('Tự chủ nguồn điện: -15% chi phí cố định vĩnh viễn, +20 điểm ESG, giảm nửa tác động OEE khi khủng hoảng năng lượng. Hoàn vốn ~2 vòng.', 'Self-sufficient power: -15% fixed cost permanently, +20 ESG points, halves the OEE hit during an energy crisis. Pays back in ~2 rounds.') },
  { id: 'MKT_BOOST_01', icon: '📣', name: T('Marketing Boost', 'Marketing Boost'), type: 'booster',    price: 80,  desc: T('+30% hiệu quả marketing trong vòng kế tiếp.', '+30% marketing effectiveness next round.') },
  { id: 'RD_UPGRADE_01', icon: '🔬', name: T('R&D Upgrade', 'R&D Upgrade'),    type: 'blueprint',  price: 120, desc: T('Giảm 8% giá thành sản xuất vĩnh viễn.', 'Permanently cuts unit production cost by 8%.') },
  { id: 'OPS_LEAN_01',  icon: '🏭', name: T('Lean Operations', 'Lean Operations'), type: 'blueprint',  price: 100, desc: T('Giảm 20% chi phí khấu hao máy móc.', 'Cuts equipment depreciation cost by 20%.') },
  { id: 'INS_SHIELD_01', icon: '🛡️', name: T('Khiên bảo hiểm', 'Insurance Shield'), type: 'consumable', price: 60,  desc: T('Vô hiệu hóa tác động tiêu cực của 1 biến cố thị trường.', 'Cancels the negative impact of 1 market event.') },
  { id: 'DATA_PACK_01', icon: '📊', name: T('Gói dữ liệu thị trường', 'Market Data Pack'), type: 'consumable', price: 50, desc: T('Lumina tiết lộ trước biến cố của vòng sau.', "Lumina reveals next round's event in advance.") },
]; }

function SKILLS_LIST() { return [
  { id: 'SK_FIN1', icon: '💰', name: T('Quản trị dòng tiền', 'Cash Flow Management'), cost: 50,  desc: T('+5% lợi nhuận ròng mỗi vòng.', '+5% net profit every round.'), effect: { profitMul: 1.05 } },
  { id: 'SK_MKT1', icon: '📣', name: T('Marketing số', 'Digital Marketing'),       cost: 80,  desc: T('+10% hiệu quả ngân sách quảng cáo.', "+10% advertising budget effectiveness."), effect: { mktMul: 1.10 } },
  { id: 'SK_OPS1', icon: '🏭', name: T('Sản xuất tinh gọn', 'Lean Manufacturing'),  cost: 80,  desc: T('-5% giá thành đơn vị.', '-5% unit production cost.'), effect: { costMul: 0.95 } },
  { id: 'SK_NEG1', icon: '🤝', name: T('Đàm phán chiến lược', 'Strategic Negotiation'), cost: 120, desc: T('Giảm 10% giá vật phẩm trong Cửa hàng.', '10% off item prices in the Shop.'), effect: { shopMul: 0.90 } },
  { id: 'SK_AI1',  icon: '🤖', name: T('Cộng hưởng Lumina', 'Lumina Synergy'),  cost: 150, desc: T('+2 lượt hỏi Lumina AI mỗi vòng.', '+2 Lumina AI questions per round.'), effect: { aiQuota: 2 } },
]; }

const COMPETITORS = [
  { name: 'Alpha Dynamics', style: 'aggressive' },
  { name: 'Mekong Ventures', style: 'balanced' },
  { name: 'Star Clay Co.',   style: 'premium' },
];

/* ===== NHIỆM VỤ (Missions) ===== */
function MISSIONS_LIST() { return [
  { id: 'M_FIRST',    icon: '🚀', name: T('Khởi động', 'Kickoff'), desc: T('Hoàn thành vòng chơi đầu tiên.', 'Complete the first round.'), rewardMoney: 20, rewardXp: 10, test: s => s.history.length >= 1 },
  { id: 'M_PROFIT',   icon: '💎', name: T('Kinh doanh có lãi', 'Profitable Business'), desc: T('Đạt lợi nhuận dương trong một vòng.', 'Post a positive profit in one round.'), rewardMoney: 30, rewardXp: 20, test: s => s.history.some(r => r.netProfit > 0) },
  { id: 'M_SHARE30',  icon: '👑', name: T('Chiếm lĩnh thị trường', 'Market Domination'), desc: T('Đạt thị phần từ 30% trở lên.', 'Reach 30% market share or more.'), rewardMoney: 50, rewardXp: 30, test: s => s.history.some(r => r.share >= 30) },
  { id: 'M_SHOP',     icon: '🛍️', name: T('Nhà đầu tư thông thái', 'Savvy Investor'), desc: T('Mua ít nhất 1 vật phẩm trong Cửa hàng.', 'Buy at least 1 item from the Shop.'), rewardMoney: 20, rewardXp: 10, test: s => (s.itemsBought || 0) >= 1 },
  { id: 'M_AI3',      icon: '🤖', name: T('Người bạn của Lumina', "Lumina's Friend"), desc: T('Hỏi Lumina AI tổng cộng 3 lần.', 'Ask Lumina AI a total of 3 times.'), rewardMoney: 15, rewardXp: 10, test: s => (s.aiAskedTotal || 0) >= 3 },
  { id: 'M_SKILL',    icon: '🌳', name: T('Học không ngừng', 'Lifelong Learner'), desc: T('Mở khóa 1 kỹ năng trong Cây kỹ năng.', 'Unlock 1 skill in the Skill Tree.'), rewardMoney: 25, rewardXp: 15, test: s => s.skills.length >= 1 },
  { id: 'M_MINIGAME', icon: '🏭', name: T('Thợ đất sét cừ khôi', 'Master Clay Worker'), desc: T('Đạt từ 15 điểm trong Clay Factory Frenzy.', 'Score at least 15 in Clay Factory Frenzy.'), rewardMoney: 25, rewardXp: 15, test: s => (s.minigameBest || 0) >= 15 },
  { id: 'M_SURVIVE',  icon: '🛟', name: T('Thuyền trưởng bão táp', 'Storm Captain'), desc: T('Có lãi trong vòng Khủng hoảng năng lượng.', 'Turn a profit during the Energy Crisis round.'), rewardMoney: 60, rewardXp: 40, test: s => s.history.some(r => r.event.id === 'EV_RECESSION' && r.netProfit > 0) },
  { id: 'M_FINISH',   icon: '🎓', name: T('Tốt nghiệp BizOn', 'BizOn Graduate'), desc: T('Hoàn thành trọn vẹn 6 vòng mô phỏng.', 'Complete all 6 rounds of the simulation.'), rewardMoney: 100, rewardXp: 50, test: s => s.finished },
]; }

function missionStatus(s, m) {
  if ((s.missionsClaimed || []).includes(m.id)) return 'claimed';
  return m.test(s) ? 'ready' : 'pending';
}

function claimMission(s, id) {
  const m = MISSIONS_LIST().find(x => x.id === id);
  if (!m || missionStatus(s, m) !== 'ready') return false;
  s.missionsClaimed.push(id);
  s.balance += m.rewardMoney;
  s.xp += m.rewardXp;
  return true;
}

/* ===== WHAT-IF ANALYSIS (mô phỏng Nếu–Thì trước khi Commit) =====
 * Theo tài liệu logic CEO (STRATEGIC_OVERVIEW) & CFO (FINANCIAL_STRESS_TEST).
 * Giới hạn what_if_limit = 2 lượt/vòng (ERR_AI_LIMIT_REACHED).
 */
const WHAT_IF_LIMIT = 2;
const LOAN_INTEREST_RATE = 10; // %/phiên – dùng cho phân tích đòn bẩy

function whatIfSimulate(s, role, d) {
  const ev = currentEvent(s);
  const last = s.history[s.history.length - 1];
  const lastShare = last ? last.share : 25;

  // Ước tính thị phần: sức hấp dẫn mới so với vòng trước
  const elasticity = PRICE_ELASTICITY * (ev.elasticityMul || 1);
  const attr = (price, mkt) => Math.pow(REF_PRICE / price, elasticity) * (1 + Math.sqrt(mkt * (ev.mktBoost || 1)) / 18) * s.brand;
  const lastD = last ? last.decisions : { price: REF_PRICE, marketing: 50 };
  const oldAttr = attr(lastD.price, lastD.marketing);
  const compAttr = oldAttr * (100 - lastShare) / Math.max(1, lastShare);
  const newAttr = attr(d.price, d.marketing);
  const estShare = 100 * newAttr / (newAttr + compAttr);
  const deltaShare = estShare - lastShare;

  // Ước tính P&L
  const marketUnits = BASE_MARKET_UNITS * ev.demand;
  const estSold = Math.min(d.production + s.inventory, Math.round(marketUnits * estShare / 100));
  const unitCost = UNIT_COST * ev.costMul;
  const dep = Math.max(s.machineCapacity, d.production) * 0.015;
  const fixed = FIXED_COST * ev.costMul;
  const estRevenue = estSold * d.price / 1000;
  const estCost = d.production * unitCost / 1000 + d.marketing + d.rd + fixed + dep + s.loan * 0.05;
  const estProfit = estRevenue - estCost;
  const contribution = (d.price - unitCost) / 1000;                 // tr₫/sp
  const breakEven = Math.ceil((fixed + dep + d.marketing + d.rd) / Math.max(0.001, contribution));
  const plannedSpend = d.marketing + d.rd + d.production * unitCost / 1000;
  const liquidityRisk = Math.round(100 * plannedSpend / Math.max(1, s.balance)) / 100;

  if (role === 'CFO') {
    const loan = d.loanAmount || 0;
    const cut = d.costCutPct || 0;
    const projCash = s.balance + loan - plannedSpend + estRevenue - (estCost - plannedSpend) * (1 - cut / 100);
    const projQuickRatio = Math.round(Math.max(0.05, (s.balance + loan - plannedSpend * 0.6) / STARTING_BALANCE) * 100) / 100;
    const roiHyp = Math.round(1000 * (estProfit + fixed * cut / 100) / Math.max(1, STARTING_BALANCE + loan)) / 10;
    const leverageOK = roiHyp > LOAN_INTEREST_RATE;
    const qrDanger = projQuickRatio < 1.1;
    return {
      role, type: 'FINANCIAL_STRESS_TEST', title: T('💰 Stress test tài chính (CFO)', '💰 Financial stress test (CFO)'),
      status: qrDanger ? 'INSOLVENCY_RISK' : leverageOK ? 'SAFE_AND_EFFICIENT' : 'CAPITAL_EROSION',
      metrics: [
        { label: T('Số dư cuối chu kỳ (dự báo)', 'End-of-round balance (forecast)'), value: Math.round(projCash) + 'tr₫', bad: projCash < 100 },
        { label: T('Quick Ratio dự báo', 'Forecast Quick Ratio'), value: projQuickRatio + (qrDanger ? ' ⚠️' : ''), bad: qrDanger },
        { label: T('ROI giả định vs lãi vay ' + LOAN_INTEREST_RATE + '%', 'Hypothetical ROI vs ' + LOAN_INTEREST_RATE + '% loan interest'), value: roiHyp + '%', bad: !leverageOK },
      ],
      msg: qrDanger
        ? T(`CFO ơi, kịch bản này cho thấy Quick Ratio rơi xuống ${projQuickRatio} – dưới ngưỡng an toàn 1.1. Nếu doanh số thực tế thấp hơn dự báo 5%, chúng ta sẽ mất khả năng thanh toán. Tôi đề xuất vay thêm ít nhất 100tr₫ làm lớp đệm an toàn.`,
            `CFO, this scenario shows the Quick Ratio dropping to ${projQuickRatio} – below the 1.1 safety threshold. If actual sales come in 5% below forecast, we'll lose the ability to pay our bills. I suggest borrowing at least 100m₫ more as a safety buffer.`)
        : leverageOK
        ? T(`Phân tích cho thấy sử dụng vốn lúc này là bước đi thông minh: ROI kỳ vọng ${roiHyp}% cao hơn lãi suất vay ${LOAN_INTEREST_RATE}%. Đòn bẩy hiệu quả – có thể mạnh dạn tăng đầu tư R&D!`,
            `The analysis shows using leverage now is a smart move: expected ROI of ${roiHyp}% beats the ${LOAN_INTEREST_RATE}% loan rate. Efficient leverage – feel free to boost R&D investment!`)
        : T(`Cảnh báo mòn vốn: ROI kỳ vọng chỉ ${roiHyp}%, thấp hơn chi phí vốn ${LOAN_INTEREST_RATE}%. Nên cắt giảm chi phí cố định hoặc hoãn vay cho tới khi biên lợi nhuận cải thiện.`,
            `Capital erosion warning: expected ROI is only ${roiHyp}%, below the ${LOAN_INTEREST_RATE}% cost of capital. Consider cutting fixed costs or delaying the loan until margins improve.`),
    };
  }

  // CEO – STRATEGIC_OVERVIEW
  const risky = estProfit < 0 || liquidityRisk > 0.8;
  const aggressive = deltaShare > 3 && estProfit < 0;
  return {
    role: 'CEO', type: 'STRATEGIC_OVERVIEW', title: T('🧭 Tổng quan chiến lược (CEO)', '🧭 Strategic overview (CEO)'),
    status: aggressive ? 'VIABLE_BUT_RISKY' : risky ? 'HIGH_RISK' : 'SAFE',
    metrics: [
      { label: T('Thị phần dự báo', 'Forecast market share'), value: estShare.toFixed(1) + '% (' + (deltaShare >= 0 ? '+' : '') + deltaShare.toFixed(1) + '%)', bad: deltaShare < 0 },
      { label: T('Lợi nhuận ròng dự báo', 'Forecast net profit'), value: Math.round(estProfit) + 'tr₫', bad: estProfit < 0 },
      { label: T('Điểm hòa vốn', 'Break-even point'), value: T(`${breakEven.toLocaleString('vi-VN')} sp (bán dự kiến ${estSold.toLocaleString('vi-VN')})`, `${breakEven.toLocaleString('en-US')} units (expected sold ${estSold.toLocaleString('en-US')})`), bad: estSold < breakEven },
    ],
    msg: aggressive
      ? T(`Thưa CEO, kịch bản này có thể chiếm thêm ${deltaShare.toFixed(1)}% thị phần ngay vòng tới, nhưng lợi nhuận ròng sẽ âm ${Math.abs(Math.round(estProfit))}tr₫. Bạn có sẵn sàng đánh đổi lợi nhuận ngắn hạn để lấy vị thế dẫn đầu?`,
          `CEO, this scenario could gain ${deltaShare.toFixed(1)}% more market share next round, but net profit would go negative by ${Math.abs(Math.round(estProfit))}m₫. Are you ready to trade short-term profit for the lead position?`)
      : risky
      ? T(`Cảnh báo: kế hoạch chi chiếm ${Math.round(liquidityRisk * 100)}% ví hiện có và điểm hòa vốn là ${breakEven.toLocaleString('vi-VN')} sp. Hãy phối hợp với CFO thu xếp khoản vay ngắn hạn trước khi Commit.`,
          `Warning: the planned spend takes up ${Math.round(liquidityRisk * 100)}% of your current wallet, and the break-even point is ${breakEven.toLocaleString('en-US')} units. Coordinate with the CFO to arrange a short-term loan before you Commit.`)
      : T(`Dữ liệu cho thấy đây là kịch bản an toàn: bán dự kiến ${estSold.toLocaleString('vi-VN')} sp, vượt điểm hòa vốn ${breakEven.toLocaleString('vi-VN')} sp. Tôi đề xuất giữ ít nhất 20% ngân sách Marketing để phòng thủ trước đối thủ.`,
          `The data shows this is a safe scenario: expected sales of ${estSold.toLocaleString('en-US')} units clear the break-even point of ${breakEven.toLocaleString('en-US')} units. I suggest keeping at least 20% of the Marketing budget in reserve to defend against rivals.`),
  };
}

/** Dự báo dòng tiền trực tiếp từ thông số đang nhập (panel CVP). */
function forecastCash(s, d) {
  const ev = currentEvent(s);
  const term = PAYMENT_TERMS[d.paymentTerm] || PAYMENT_TERMS[30];
  const last = s.history[s.history.length - 1];
  const lastShare = last ? last.share : 25;
  const laborCap = (d.workers || 45) * UNITS_PER_WORKER;
  const prod = Math.min(d.production, laborCap);
  const est = Math.min(prod + s.inventory, Math.round(BASE_MARKET_UNITS * ev.demand * term.demandMul * lastShare / 100));
  const unitCost = UNIT_COST * ev.costMul;
  const inflow = est * d.price / 1000;
  const wage = (d.workers || 45) * WAGE_PER_WORKER;
  const training = (d.workers || 45) * (d.training || 0);
  const outflow = (prod * unitCost / 1000 + d.marketing + d.rd + FIXED_COST * ev.costMul
    + Math.max(s.machineCapacity, prod) * 0.015 + wage + training) * term.costMul;
  const contribution = (d.price - unitCost) / 1000;
  const breakEven = Math.ceil((FIXED_COST * ev.costMul + wage + training + d.marketing + d.rd) / Math.max(0.001, contribution));
  return { inflow: Math.round(inflow), outflow: Math.round(outflow), net: Math.round(inflow - outflow), breakEven, laborCap, estSold: est };
}

/* ===== LUMINA ADVISOR PRO – kịch bản "Nếu – Thì" từ số liệu thực ===== */
function advisorProScenarios(inp) {
  // inp: {revenue, cost, marketing, growthTarget} (triệu ₫/tháng, %)
  const margin = inp.revenue - inp.cost;
  const marginPct = inp.revenue > 0 ? (margin / inp.revenue) * 100 : 0;
  const mk = (mkMul, growMul, label, risk) => {
    const newMkt = Math.round(inp.marketing * mkMul);
    const growth = Math.min(inp.growthTarget * growMul, inp.growthTarget + 25);
    const newRevenue = Math.round(inp.revenue * (1 + growth / 100));
    const newProfit = Math.round(newRevenue - inp.cost - (newMkt - inp.marketing));
    return { label, risk, newMkt, growth: Math.round(growth), newRevenue, newProfit };
  };
  return {
    marginPct: Math.round(marginPct * 10) / 10,
    healthy: marginPct >= 15,
    scenarios: [
      mk(0.85, 0.45, T('🛡️ Thận trọng', '🛡️ Cautious'), 'low'),
      mk(1.15, 1.0,  T('⚖️ Cân bằng', '⚖️ Balanced'), 'medium'),
      mk(1.6,  1.5,  T('🚀 Tăng tốc', '🚀 Aggressive'), 'high'),
    ],
  };
}

/* ===== THE CMO BRAIN – cố vấn marketing theo kịch bản động =====
 * Bảng logic ưu tiên: Loyalty<60% (ĐỎ) → mất >5% thị phần (ĐỎ) → ROI marketing <3.0 (VÀNG)
 * → đáp ứng cầu <90% (XANH cơ hội) → Price War (kịch bản A) → mặc định thị trường ngách xanh (kịch bản B). */
function cmoBrain(s) {
  const last = s.history[s.history.length - 1] || null;
  const prev = s.history[s.history.length - 2] || null;
  const ev = currentEvent(s);
  const mroi = last && last.marketing > 0 ? Math.round(10 * last.revenue / last.marketing) / 10 : null;
  const demandMet = last && last.demandUnits > 0 ? Math.round(100 * last.sold / last.demandUnits) : 100;
  const shareDrop = last && prev ? Math.round(10 * (prev.share - last.share)) / 10 : 0;

  if (s.brandLoyalty < 60) return {
    status: 'RED', badge: T('ĐỎ · NGUY CẤP', 'RED · CRITICAL'), metric: T(`Brand Loyalty ${s.brandLoyalty}% < ngưỡng 60%`, `Brand Loyalty ${s.brandLoyalty}% < the 60% threshold`),
    dialogue: T('Khách hàng đang dần rời bỏ chúng ta để sang đối thủ — dấu hiệu thương hiệu đang mất sức hút. Cân nhắc một chiến dịch tái định vị trước khi mất thêm thị phần.',
      'Customers are gradually leaving us for rivals — a sign the brand is losing its pull. Consider a repositioning campaign before losing more share.'),
    actions: [T('Kích hoạt Branding Premium', 'Activate Branding Premium'), T('Tăng R&D để tái định vị thương hiệu', 'Increase R&D to reposition the brand')],
  };
  if (shareDrop > 5) return {
    status: 'RED', badge: T('ĐỎ · NGUY CẤP', 'RED · CRITICAL'), metric: T(`Thị phần giảm ${shareDrop}% so với chu kỳ trước`, `Market share down ${shareDrop}% from the previous round`),
    clip: 'adv-02', dialogue: T('Đối thủ đang xâm chiếm phân khúc của chúng ta bằng giá rẻ. Chúng ta cần tăng ngân sách quảng cáo hoặc tung sản phẩm R&D mới.',
      'A rival is invading our segment with low prices. We need to raise the advertising budget or launch a new R&D product.'),
    actions: [T('Tăng ngân sách Marketing vòng tới', 'Raise the Marketing budget next round'), T('Mua Marketing Boost trong Cửa hàng', 'Buy Marketing Boost in the Shop')],
  };
  if (mroi !== null && mroi < 3) return {
    status: 'YELLOW', badge: T('VÀNG · RỦI RO', 'YELLOW · RISK'), metric: `${T('Doanh thu / CP Marketing', 'Revenue / Marketing spend')} = ${mroi} < 3.0`,
    clip: 'adv-03', dialogue: T('CMO thân mến, chi phí tiếp thị của chúng ta đang quá cao nhưng không chuyển đổi thành doanh thu tương ứng. Hãy rà soát lại thông điệp chiến dịch.',
      "Dear CMO, our marketing spend is too high without converting into matching revenue. Let's review the campaign messaging."),
    actions: [T('Giảm ngân sách Marketing 15%', 'Cut the Marketing budget 15%'), T('Rà soát lại thông điệp chiến dịch', 'Review the campaign messaging')],
  };
  if (demandMet < 90) return {
    status: 'GREEN', badge: T('XANH · CƠ HỘI', 'GREEN · OPPORTUNITY'), metric: T(`Đáp ứng nhu cầu chỉ ${demandMet}% (mất ${last.lostSales} đơn)`, `Demand fulfillment only ${demandMet}% (lost ${last.lostSales} orders)`),
    clip: 'adv-04', dialogue: T('Nhu cầu thị trường đang rất lớn nhưng chúng ta không có đủ hàng để bán. Hãy phối hợp với COO để tăng sản lượng.',
      "Market demand is very high but we don't have enough stock to sell. Coordinate with the COO to raise production."),
    actions: [T('Tăng sản lượng + thuê thêm nhân công', 'Raise output + hire more workers'), T('Nâng cấp dây chuyền sản xuất', 'Upgrade the production line')],
  };
  if (ev.id === 'EV_PRICEWAR' && !s.finished) return {
    status: 'RED', badge: T('ĐỎ · PRICE WAR', 'RED · PRICE WAR'), metric: T('Một đối thủ hạ giá 15% tại Modern Trade', 'A rival cut price 15% in Modern Trade'),
    clip: 'adv-05', dialogue: T('Thưa CMO, một đối thủ vừa hạ giá 15% và chiếm mất 8% thị phần của chúng ta. Nếu không phản ứng trong vòng tới, chúng ta sẽ mất vị thế dẫn đầu.',
      "CMO, a rival just cut price 15% and took 8% of our market share. If we don't react next round, we'll lose the lead."),
    actions: [T("Triển khai gói 'Marketing Boost' giữ chân khách trung thành", "Deploy the 'Marketing Boost' pack to retain loyal customers"), T('Cải tiến bao bì (R&D) tăng giá trị cảm nhận – đừng đua giảm giá', "Improve packaging (R&D) to raise perceived value – don't race on price")],
  };
  return {
    status: 'OPPORTUNITY', badge: T('XANH · CƠ HỘI VÀNG', 'GREEN · GOLDEN OPPORTUNITY'), metric: T("Xu hướng 'Tiêu dùng xanh' +25% tại Đông Nam Á", "'Green consumption' trend +25% in Southeast Asia"),
    dialogue: T("CMO ơi, thị trường đang khao khát sản phẩm bền vững. Nếu chúng ta 'Bật' chiến dịch xanh ngay bây giờ, chúng ta sẽ dẫn đầu xu hướng!",
      "CMO, the market is hungry for sustainable products. If we launch a green campaign right now, we'll lead the trend!"),
    actions: [T("Phân bổ 40% ngân sách vào chiến dịch 'Green Initiative'", "Allocate 40% of the budget to the 'Green Initiative' campaign"), T('Tăng giá bán 10% cho dòng sản phẩm cao cấp', 'Raise price 10% on the premium product line')],
  };
}

/* ===== CFO BRAIN – giám sát thanh khoản & chế độ khủng hoảng ===== */
function cfoBrain(s) {
  const last = s.history[s.history.length - 1] || null;
  const invDays = last && last.sold > 0
    ? Math.round(s.inventory / last.sold * 30)
    : (s.inventory > 0 ? 90 : 0);
  if (s.quickRatio < 1) return {
    status: 'CRISIS', badge: T('ĐỎ · KHỦNG HOẢNG THANH KHOẢN', 'RED · LIQUIDITY CRISIS'), invDays,
    metric: `Quick Ratio ${s.quickRatio.toFixed(2)} < 1.00`,
    clip: 'adv-14', dialogue: T(`CFO, thanh khoản đang ở vùng đỏ! Tiền mặt chỉ còn ${Math.round(s.balance)}tr₫, vòng quay tồn kho lên tới ${invDays} ngày. Hãy phê duyệt khoản vay khẩn cấp hoặc cắt giảm chi phí ngay – đừng để lỡ kỳ trả lương.`,
      `CFO, liquidity is in the red zone! Cash is down to ${Math.round(s.balance)}m₫ and inventory turnover has risen to ${invDays} days. Approve an emergency loan or cut costs now – don't miss payroll.`),
  };
  if (s.roi >= LOAN_INTEREST_RATE && s.loan === 0) return {
    status: 'LEVERAGE', badge: T('XANH · ĐÒN BẨY HIỆU QUẢ', 'GREEN · EFFICIENT LEVERAGE'), invDays,
    metric: T(`ROI ${s.roi}% > chi phí vốn ${LOAN_INTEREST_RATE}%`, `ROI ${s.roi}% > cost of capital ${LOAN_INTEREST_RATE}%`),
    clip: 'adv-15', dialogue: T(`ROI hiện tại (${s.roi}%) đang cao hơn chi phí vốn vay (${LOAN_INTEREST_RATE}%). Đây là thời điểm tốt để dùng đòn bẩy tài chính mở rộng sản xuất, CFO ạ.`,
      `Current ROI (${s.roi}%) is higher than the cost of borrowed capital (${LOAN_INTEREST_RATE}%). This is a good time to use financial leverage to expand production, CFO.`),
  };
  return {
    status: 'SAFE', badge: T('XANH · AN TOÀN', 'GREEN · SAFE'), invDays,
    metric: `Quick Ratio ${s.quickRatio.toFixed(2)} ≥ 1.00`,
    clip: 'adv-16', dialogue: T(`Thanh khoản ổn định, vòng quay tồn kho ${invDays} ngày trong ngưỡng an toàn. Hãy duy trì kỷ luật chi tiêu và theo dõi dòng tiền từng vòng nhé.`,
      `Liquidity is stable, with inventory turnover at ${invDays} days within the safe range. Keep spending discipline and track cash flow every round.`),
  };
}

/* ===== THE COO BRAIN – cố vấn vận hành theo kịch bản ===== */
function cooBrain(s) {
  const last = s.history[s.history.length - 1] || null;
  const prev = s.history[s.history.length - 2] || null;
  const capUse = last ? last.decisions.production / Math.max(1, s.machineCapacity) : 0;
  const invRatio = last && last.demandUnits > 0 ? s.inventory / last.demandUnits : 0;
  if (invRatio > 0.4) return {
    status: 'RED', badge: T('ĐỎ · NGUY CẤP', 'RED · CRITICAL'), metric: `${T('Tồn kho / Nhu cầu', 'Inventory / Demand')} = ${Math.round(invRatio * 100)}% > 40%`,
    clip: 'adv-06', dialogue: T('Lượng hàng tồn kho đang quá lớn, gây lãng phí chi phí lưu kho. Hãy phối hợp với CMO để đẩy mạnh tiêu thụ hoặc giảm sản lượng.',
      'Inventory is too large, wasting holding costs. Coordinate with the CMO to push sales or cut production.'),
    actions: [T('Giảm sản lượng vòng tới', 'Cut production next round'), T('Phối hợp CMO đẩy tiêu thụ', 'Coordinate with CMO to push sales')],
  };
  if (last && prev && last.defect > prev.defect * 1.12) return {
    status: 'YELLOW', badge: T('VÀNG · RỦI RO', 'YELLOW · RISK'), metric: T(`Phế phẩm tăng ${Math.round((last.defect / prev.defect - 1) * 100)}% so với vòng trước`, `Defect rate up ${Math.round((last.defect / prev.defect - 1) * 100)}% from the previous round`),
    clip: 'adv-07', dialogue: T('Thưa COO, tôi nhận thấy tỷ lệ sản phẩm lỗi tăng mạnh. Nguyên nhân là do đội ngũ nhân sự mới chưa được đào tạo bài bản. Chúng ta nên đầu tư vào gói "Đào tạo chuyên sâu" để lấy lại phong độ.',
      'COO, I notice the defect rate has jumped sharply. The cause is new staff who haven\'t been properly trained. We should invest in an "in-depth training" package to get back on track.'),
    actions: [T('Tăng ngân sách đào tạo trong thẻ Nhân sự', 'Raise the training budget in the HR card'), T('Giữ chân kỹ sư lành nghề', 'Retain skilled engineers')],
  };
  if (capUse > 0.95) return {
    status: 'YELLOW', badge: T('VÀNG · RỦI RO', 'YELLOW · RISK'), metric: `${T('Sản lượng / Công suất', 'Output / Capacity')} = ${Math.round(capUse * 100)}% > 95%`,
    clip: 'adv-08', dialogue: T('COO ơi, nhà máy đang chạy quá tải. Nếu không đầu tư mở rộng ngay, chúng ta sẽ bỏ lỡ cơ hội bán hàng ở vòng tới.',
      "COO, the factory is running overloaded. If we don't invest to expand now, we'll miss sales opportunities next round."),
    actions: [T('Nâng cấp dây chuyền sản xuất', 'Upgrade the production line'), T('Thuê thêm nhân công', 'Hire more workers')],
  };
  if (last && last.lostSales > 0) return {
    status: 'GREEN', badge: T('XANH · CƠ HỘI', 'GREEN · OPPORTUNITY'), metric: T(`Thiếu ${last.lostSales.toLocaleString('vi-VN')} sp so với nhu cầu`, `Short ${last.lostSales.toLocaleString('en-US')} units versus demand`),
    clip: 'adv-09', dialogue: T('Thị trường đang "khát" hàng nhưng chúng ta không đủ năng lực cung ứng. Đây là lúc để kích hoạt tăng ca hoặc mở rộng công suất.',
      "The market is hungry for stock but we can't supply enough. This is the time to run overtime or expand capacity."),
    actions: [T('Tăng sản lượng + nhân công vòng tới', 'Raise output + staff next round'), T('Đàm phán kỳ hạn 60 ngày để kích cầu', 'Negotiate 60-day terms to stimulate demand')],
  };
  return {
    status: 'SAFE', badge: T('XANH · ỔN ĐỊNH', 'GREEN · STABLE'), metric: T('Cung – cầu đang cân bằng', 'Supply and demand are balanced'),
    clip: 'adv-10', dialogue: T('Vận hành đang mượt mà, COO ạ. Hãy duy trì bảo trì định kỳ và theo dõi OEE để giữ phong độ nhé.',
      "Operations are running smoothly, COO. Keep up routine maintenance and track OEE to stay on form."),
    actions: [T('Bảo trì định kỳ', 'Routine maintenance'), T('Theo dõi OEE mỗi vòng', 'Track OEE every round')],
  };
}

/* ===== THE SEC BRAIN – cố vấn điều phối & tuân thủ ===== */
function secBrain(s) {
  const ev = currentEvent(s);
  if (!s.finished && ev.tone === 'bad' && !s.committed) return {
    status: 'RED', badge: T('ĐỎ · ĐIỀU PHỐI KHẨN', 'RED · URGENT COORDINATION'), metric: T(`Sự kiện thị trường "${ev.name}" đang diễn ra`, `The "${ev.name}" market event is unfolding`),
    clip: 'adv-17', dialogue: T(`Biến cố "${ev.name}" vừa ập đến! SEC hãy nhanh chóng tổng hợp thông tin từ COO về tình hình sản xuất và báo cáo cho CEO để điều chỉnh giá bán kịp thời.`,
      `The "${ev.name}" event just hit! SEC, quickly gather production info from the COO and report to the CEO so the price can be adjusted in time.`),
    actions: [T('Kích hoạt họp khẩn cấp toàn đội', 'Trigger an emergency team meeting'), T('Cập nhật mục tiêu vòng theo tình hình mới', 'Update the round targets for the new situation')],
  };
  if (!s.finished && !s.committed) return {
    status: 'YELLOW', badge: T('VÀNG · TIẾN ĐỘ', 'YELLOW · PROGRESS'), metric: T(`Vòng ${s.round} chưa chốt quyết định`, `Round ${s.round} decisions not locked in yet`),
    clip: 'adv-11', dialogue: T('SEC ơi, các bộ phận vẫn chưa thống nhất con số cuối cùng. Hãy nhắc CEO chốt quyết định ngay để tránh bị hệ thống tự động khóa!',
      "SEC, the departments still haven't agreed on final numbers. Remind the CEO to lock in decisions now before the system auto-locks the round!"),
    actions: [T('Rà soát bảng quyết định với từng vai trò', 'Review the decisions board with each role'), T('Nhắc CEO nhấn Commit', 'Remind the CEO to hit Commit')],
  };
  if ((s.advisorHistory || []).length === 0) return {
    status: 'YELLOW', badge: T('VÀNG · TRI THỨC', 'YELLOW · KNOWLEDGE'), metric: T('Nhật ký cố vấn đang trống', 'Advisor log is empty'),
    clip: 'adv-12', dialogue: T('Dữ liệu lịch sử đang bị trống. SEC cần ghi chú lại các biến cố quan trọng để đội có cơ sở phân tích cho các vòng sau nhé.',
      'Historical data is empty. SEC should note down key events so the team has a basis for analysis in later rounds.'),
    actions: [T('Hỏi Lumina để lưu phân tích vào SEC log', "Ask Lumina to save analysis into SEC's log"), T('Ghi chép Nhật ký đội', 'Log entries in the Team Journal')],
  };
  return {
    status: 'GREEN', badge: T('XANH · SẴN SÀNG', 'GREEN · READY'), metric: T('Toàn đội đã chốt phần việc', "The whole team has finalized its part"),
    clip: 'adv-13', dialogue: T('Tuyệt vời! Toàn đội đã sẵn sàng. SEC hãy kiểm tra lại lần cuối và báo cáo CEO thực hiện nút nhấn "Commit" thần thánh nhé.',
      'Excellent! The whole team is ready. SEC, do one final check and tell the CEO to hit that legendary "Commit" button.'),
    actions: [T('Kiểm tra lần cuối bảng quyết định', 'Do a final check of the decisions board'), T('Lưu biên bản vào Nhật ký đội', 'Save the minutes into the Team Journal')],
  };
}

/* ===== ESG SCORE – bền vững hóa doanh nghiệp ===== */
function esgScore(s) {
  return Math.min(100, 50 + ((s.items['SOLAR_01'] || 0) > 0 ? 20 : 0) + Math.min(15, Math.round(s.rdCumulative / 50)) + ((s.items['OPS_LEAN_01'] || 0) > 0 ? 5 : 0));
}

/* ===== KPI XUẤT SẮC & RỦI RO THEO VAI TRÒ (kịch bản Stitch) ===== */
function kpiCongrats(s, r) {
  const prev = s.history[s.history.length - 2];
  const shareGain = prev ? r.share - prev.share : 0;
  const top1 = r.share >= Math.max(...s.competitors.map(c => c.share || 0), 0);
  const out = [];
  if (r.roi > 30) out.push({ role: 'CFO', risk: 'low',
    clip: 'kpi-01', text: T('Thật tuyệt vời, CFO! Chiến lược tối ưu cấu trúc vốn của bạn đã mang lại lợi nhuận kỷ lục (ROI ' + r.roi + '%). Dòng tiền đang cực kỳ dồi dào để chúng ta tái đầu tư mở rộng!',
      'Fantastic work, CFO! Your capital-structure strategy delivered record profit (ROI ' + r.roi + '%). Cash flow is flush and ready for us to reinvest and expand!') });
  if (shareGain > 5 || (top1 && r.share >= 30)) out.push({ role: 'CMO', risk: 'low',
    clip: 'kpi-02', text: T('Chúc mừng CMO! Chiến dịch Marketing Mix của bạn đã đánh bại hoàn toàn đối thủ. Thương hiệu của đội hiện đang là lựa chọn số 1 của khách hàng!',
      "Congrats CMO! Your Marketing Mix campaign completely outperformed the rivals. The team's brand is now customers' #1 choice!") });
  if (r.oee >= 95 && r.defect < 1) out.push({ role: 'COO', risk: 'low',
    clip: 'kpi-03', text: T('COO ơi, hiệu suất nhà máy đạt mức không tưởng (OEE ' + r.oee + '%, phế phẩm ' + r.defect + '%)! Bảo trì dự phòng và đào tạo công nhân đã giúp dây chuyền chạy mượt tuyệt đối.',
      'COO, factory performance hit an incredible level (OEE ' + r.oee + '%, defects ' + r.defect + '%)! Preventive maintenance and worker training kept the line running perfectly smooth.') });
  return out;
}

function riskAlerts(s, r) {
  const out = [];
  if (r.oee < 60 || r.defect > 7) out.push({ role: 'COO', risk: 'high',
    clip: 'risk-01', text: T('Dây chuyền sản xuất đang kêu cứu! Tỷ lệ phế phẩm quá cao sẽ bào mòn lợi nhuận gộp. Đừng ép máy móc chạy quá tải mà bỏ qua bảo trì – hãy bảo trì định kỳ và đào tạo nhân sự kỹ thuật.',
      "The production line is crying for help! A defect rate this high will erode gross margin. Don't run machines overloaded while skipping maintenance – schedule routine upkeep and train technical staff.") });
  if (r.decisions && r.decisions.production > s.machineCapacity * 0.9 && s.quickRatio < 1) out.push({ role: 'CEO', risk: 'high',
    clip: 'risk-02', text: T('Thưa CEO, chúng ta đang đứng trước ngưỡng cửa phá sản kỹ thuật. Sự đánh đổi giữa tăng trưởng nóng và an toàn dòng tiền đang bị lệch pha – hãy họp khẩn cấp toàn đội và rà soát lại quyết định.',
      "CEO, we're standing at the edge of technical insolvency. The trade-off between hot growth and cash-flow safety is out of balance – call an emergency team meeting and review the decisions.") });
  return out;
}

function newGameState(profile) {
  return {
    profile,                                  // {email, teamName, role}
    round: 1,
    committed: false,
    balance: STARTING_BALANCE,
    xp: 0,
    spentXp: 0,
    machineCapacity: 1500,                    // công suất đã đầu tư → khấu hao
    rdCumulative: 0,
    brand: 1.0,
    inventory: 0,                             // hàng tồn kho (sp)
    items: {},                                // itemId -> qty
    activeBoosts: [],
    skills: [],
    aiUsed: 0,
    history: [],                              // financial_reports theo vòng
    competitors: COMPETITORS.map(c => ({ ...c, profit: 0, share: 25, brand: 1.0 })),
    achievements: [],
    finished: false,
    seed: 12345,
    missionsClaimed: [],
    aiAskedTotal: 0,
    itemsBought: 0,
    minigameBest: 0,
    minigamePlays: 0,
    roundLocked: false,
    grantLog: [],
    // Chỉ số vận hành (theo màn hình Kiểm toán năng lượng & OEE)
    oee: 85, defect: 2.0, brandLoyalty: 65, adEff: 0,
    quickRatio: 1.0, roi: 0,
    energyLines: [2100, 4850, 1470],   // kWh cơ sở 3 dây chuyền
    lineUpgraded: [false, false, false],
    maintBonus: 0,
    maintenanceLog: [],
    loan: 0,
    costCutter: false,
    peakShare: 0,
    eventShownRound: 0,
    whatIfUsed: 0,
    advisorHistory: [],
  };
}

function clampNum(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** kWh từng dây chuyền theo sản lượng vòng gần nhất. */
function energyReport(s) {
  const last = s.history[s.history.length - 1];
  const factor = last ? last.decisions.production / 2800 : 1;
  const evMul = (!s.finished && currentEvent(s).id === 'EV_RECESSION') ? 1.2 : 1;
  const lines = s.energyLines.map((base, i) => {
    let kwh = Math.round(base * factor * evMul);
    if (s.lineUpgraded[i]) kwh = Math.round(kwh * 0.6);
    const status = kwh > 4000 ? 'bad' : kwh > 2200 ? 'warn' : 'ok';
    return { name: 'Dây chuyền ' + (i + 1), kwh, status, upgraded: s.lineUpgraded[i] };
  });
  const total = lines.reduce((a, l) => a + l.kwh, 0);
  const target = 7000;
  return { lines, total, target, overloadPct: Math.round(100 * total / target) };
}

/* ===== Hành động vận hành theo vai trò (CFO / COO / CMO) ===== */
function optimizeLine(s, idx, cost = 150) {
  if (s.lineUpgraded[idx] || s.balance < cost) return false;
  s.balance -= cost;
  s.lineUpgraded[idx] = true;
  s.maintBonus += 5;
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: T(`Nâng cấp Dây chuyền ${idx + 1} (-${cost}tr₫) – tiết kiệm 40% điện năng, OEE +5%`, `Upgraded Line ${idx + 1} (-${cost}m₫) – saves 40% power, OEE +5%`) });
  return true;
}

function doMaintenance(s, cost = 60) {
  if (s.balance < cost) return false;
  s.balance -= cost;
  s.maintBonus += 3;
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: T(`Bảo trì định kỳ (-${cost}tr₫) – OEE +3%, giảm phế phẩm`, `Routine maintenance (-${cost}m₫) – OEE +3%, fewer defects`) });
  return true;
}

function approveLoan(s, amount = 300) {
  if (s.loan > 0) return false;             // mỗi phiên chỉ 1 khoản vay
  s.loan = amount;
  s.balance += amount;
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: T(`CFO phê duyệt khoản vay +${amount}tr₫ (lãi 5%/vòng)`, `CFO approved a loan +${amount}m₫ (5%/round interest)`) });
  return true;
}

function cutCosts(s) {
  if (s.costCutter) return false;
  s.costCutter = true;
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: T('CFO kích hoạt cắt giảm chi phí – chi phí cố định vòng sau -15%', 'CFO activated cost cutting – fixed costs -15% next round') });
  return true;
}

function brandingPremium(s, cost = 120) {
  if (s.balance < cost) return false;
  s.balance -= cost;
  s.brand = Math.min(1.6, s.brand + 0.08);
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: T(`CMO kích hoạt Branding Premium (-${cost}tr₫) – giá trị thương hiệu +`, `CMO activated Branding Premium (-${cost}m₫) – brand value +`)});
  return true;
}

// PRNG có seed để mô phỏng tái lập được
function rng(state) {
  state.seed = (state.seed * 1103515245 + 12345) % 2147483648;
  return state.seed / 2147483648;
}

function hasSkill(s, id) { return s.skills.includes(id); }
function skillEffect(s, key, def) {
  return SKILLS_LIST().filter(sk => s.skills.includes(sk.id) && sk.effect[key] != null)
    .reduce((acc, sk) => acc * sk.effect[key], def);
}

function currentEvent(s) { return MARKET_EVENTS_LIST()[s.round]; }

/* Kỳ hạn thanh toán (theo màn hình Quyết định nâng cao):
 * cho khách trả chậm → cầu tăng nhưng chi phí vốn tăng */
const PAYMENT_TERMS = {
  30: { label: '30 ngày (Tiêu chuẩn)', demandMul: 1.0, costMul: 1.0 },
  60: { label: '60 ngày (+2% chi phí)', demandMul: 1.04, costMul: 1.02 },
  90: { label: '90 ngày (+5% chi phí)', demandMul: 1.08, costMul: 1.05 },
};
const WAGE_PER_WORKER = 1;        // triệu ₫/người/vòng
const UNITS_PER_WORKER = 70;      // năng lực sản xuất mỗi nhân viên
const CREDIT_INTEREST = 0.085;    // lãi vay ngân hàng 8.5%/vòng cho phần thấu chi

/** Chạy mô phỏng 1 vòng với quyết định của người chơi. */
function simulateRound(s, d) {
  d.workers ??= 45; d.training ??= 0; d.funding ??= 'equity'; d.paymentTerm ??= 30;
  const term = PAYMENT_TERMS[d.paymentTerm] || PAYMENT_TERMS[30];
  // Năng lực nhân sự giới hạn sản lượng thực tế
  const laborCap = d.workers * UNITS_PER_WORKER;
  d.production = Math.min(d.production, laborCap);
  const ev = currentEvent(s);
  const shielded = s.activeBoosts.includes('INS_SHIELD_01') && ev.tone === 'bad';
  const evEff = shielded ? MARKET_EVENTS_LIST()[1] : ev;

  // --- Sức hấp dẫn của từng đội (attractiveness) ---
  const elasticity = PRICE_ELASTICITY * (evEff.elasticityMul || 1);
  let mktEff = d.marketing * (evEff.mktBoost || 1) * skillEffect(s, 'mktMul', 1);
  if (s.activeBoosts.includes('MKT_BOOST_01')) mktEff *= 1.3;

  const brandPow = evEff.brandPow || 1;   // cột mốc thu nhập trung bình cao: trọng số thương hiệu ×1.5
  const playerAttr = Math.pow(REF_PRICE / d.price, elasticity) * (1 + Math.sqrt(mktEff) / 18) * Math.pow(s.brand, brandPow);

  const compDecisions = s.competitors.map(c => {
    const jitter = 0.9 + rng(s) * 0.25;
    let price = REF_PRICE, mkt = 55;
    if (c.style === 'aggressive') { price = 125 * jitter; mkt = 90 * jitter; }
    if (c.style === 'balanced')   { price = 150 * jitter; mkt = 60 * jitter; }
    if (c.style === 'premium')    { price = 195 * jitter; mkt = 75 * jitter; }
    const attr = Math.pow(REF_PRICE / price, elasticity) * (1 + Math.sqrt(mkt) / 18) * Math.pow(c.brand, brandPow);
    return { c, price, mkt, attr };
  });

  const totalAttr = playerAttr + compDecisions.reduce((a, x) => a + x.attr, 0);
  const marketUnits = BASE_MARKET_UNITS * evEff.demand * term.demandMul;

  // --- Doanh số & tồn kho ---
  const demandUnits = Math.round(marketUnits * playerAttr / totalAttr);
  const available = d.production + s.inventory;
  let sold = Math.min(demandUnits, available);
  sold = Math.round(sold * (evEff.fulfillMul || 1));   // khủng hoảng cung ứng: hụt tỷ lệ đáp ứng đơn
  const lostSales = demandUnits - sold;
  s.inventory = available - sold;

  // --- Chi phí & lợi nhuận (triệu ₫) ---
  let unitCost = UNIT_COST * evEff.costMul * skillEffect(s, 'costMul', 1);
  if ((s.items['RD_UPGRADE_01'] || 0) > 0) unitCost *= 0.92;
  unitCost *= Math.max(0.8, 1 - s.rdCumulative / 1500);          // R&D tích lũy giảm giá thành

  if (d.production > s.machineCapacity) s.machineCapacity = d.production; // đầu tư mở rộng
  let depreciation = s.machineCapacity * 0.015;                    // khấu hao theo công suất
  if ((s.items['OPS_LEAN_01'] || 0) > 0) depreciation *= 0.8;

  const revenue = sold * d.price / 1000;                          // triệu ₫
  const cogs = d.production * unitCost / 1000;
  const holding = s.inventory * 0.005;                            // phí lưu kho
  let fixedThisRound = FIXED_COST * evEff.costMul;
  if ((s.items['SOLAR_01'] || 0) > 0) fixedThisRound *= 0.85;      // Pin Mặt Trời: tự chủ nguồn điện
  if (s.costCutter) { fixedThisRound *= 0.85; s.costCutter = false; }
  const loanInterest = s.loan * 0.05;                              // lãi vay CFO 5%/vòng
  const wageCost = d.workers * WAGE_PER_WORKER * (evEff.wageMul || 1);
  const trainingCost = d.workers * d.training;
  // Vay ngân hàng bù thấu chi (nguồn vốn = 'loan'): lãi 8.5% trên phần thiếu hụt
  const plannedSpend = cogs + d.marketing + d.rd + wageCost + trainingCost;
  const overdraft = (d.funding === 'loan' && plannedSpend > s.balance) ? plannedSpend - s.balance : 0;
  const creditInterest = overdraft * CREDIT_INTEREST;
  const totalCost = (cogs + d.marketing + d.rd + fixedThisRound + depreciation + holding + loanInterest
    + wageCost + trainingCost + creditInterest) * term.costMul;
  let netProfit = revenue - totalCost;
  netProfit *= skillEffect(s, 'profitMul', 1);

  const share = 100 * playerAttr / totalAttr;

  // --- Cập nhật trạng thái đội ---
  const rdApplied = d.rd * ((ev.rdBoost && !shielded) ? ev.rdBoost : 1);
  s.rdCumulative += rdApplied;
  s.brand = Math.min(1.6, s.brand + rdApplied / 800 + mktEff / 4000);
  s.balance += netProfit;

  const xpGain = Math.max(5, Math.round(netProfit / 4 + share));
  s.xp += xpGain;

  // --- Đối thủ ---
  const rivalIntel = compDecisions.map(x => {
    const cUnits = marketUnits * x.attr / totalAttr;
    const cRev = cUnits * x.price / 1000;
    const cCogs = cUnits * UNIT_COST * evEff.costMul / 1000;
    const cProfit = cRev - cCogs - x.mkt - FIXED_COST;
    x.c.profit += cProfit;
    x.c.share = 100 * x.attr / totalAttr;
    x.c.brand = Math.min(1.5, x.c.brand + x.mkt / 5000);
    return { name: x.c.name, style: x.c.style, price: Math.round(x.price),
      mkt: Math.round(x.mkt), share: Math.round(x.c.share * 10) / 10,
      revenue: Math.round(cRev), cost: Math.round(cCogs + x.mkt + FIXED_COST),
      profit: Math.round(cProfit) };
  });

  // --- Chỉ số vận hành (OEE, phế phẩm, tài chính) ---
  const overload = Math.max(0, d.production / s.machineCapacity - 0.9);
  const laborStrain = Math.max(0, d.production / Math.max(1, d.workers * UNITS_PER_WORKER) - 0.85) * 20; // thiếu người → OEE giảm
  const trainingBoost = Math.min(5, (d.workers * d.training) / 50);   // đào tạo tăng năng suất
  const oeeHit = (evEff.oeeHit || 0) * ((s.items['SOLAR_01'] || 0) > 0 ? 0.5 : 1); // Pin Mặt Trời giảm nửa tác động
  s.oee = Math.round(clampNum(88 - oeeHit - overload * 25 - laborStrain + s.maintBonus + trainingBoost, 55, 96));
  s.maintBonus = Math.max(0, s.maintBonus - 2);                    // hiệu ứng bảo trì phai dần
  s.defect = Math.round((1.5 + Math.max(0, (82 - s.oee) * 0.45)) * 10) / 10;
  s.brandLoyalty = Math.round(Math.min(95, 45 + s.brand * 25));
  s.adEff = Math.round(Math.sqrt(mktEff) * 16) / 10;
  s.quickRatio = Math.round(Math.max(0.1, s.balance / STARTING_BALANCE) * 100) / 100;
  s.roi = Math.round(1000 * netProfit / Math.max(1, totalCost)) / 10;
  const isNewPeak = share >= 30 && share > s.peakShare && netProfit > 0;
  if (share > s.peakShare) s.peakShare = share;

  const report = {
    round: s.round, event: ev, shielded,
    decisions: d,
    revenue, netProfit, share, sold, demandUnits, lostSales,
    inventory: s.inventory, depreciation, cogs, unitCost,
    marketing: d.marketing, rd: d.rd,
    wageCost, trainingCost, creditInterest, workers: d.workers,
    fixed: fixedThisRound, holding, loanInterest,
    oee: s.oee, defect: s.defect, adEff: s.adEff, brandLoyalty: s.brandLoyalty,
    quickRatio: s.quickRatio, roi: s.roi, isNewPeak,
    xpGain, balance: s.balance,
    rivals: rivalIntel,
  };
  s.history.push(report);

  // Đặt cờ kết thúc TRƯỚC khi mở thành tựu. A_FINISH và A_CHAMP đều kiểm
  // s.finished; nếu đặt sau thì tại thời điểm chấm thành tựu cờ vẫn là false
  // nên hai thành tựu này không bao giờ mở được từ chính engine.
  if (s.round >= ROUNDS_TOTAL) s.finished = true;

  // --- Thành tựu ---
  unlockAchievements(s, report);

  // --- Tiêu hao boost dùng 1 lần ---
  s.activeBoosts = [];

  s.committed = false;
  s.aiUsed = 0;
  s.whatIfUsed = 0;
  s.minigamePlays = 0;
  if (!s.finished) s.round += 1;

  return report;
}

function ACHIEVEMENTS_LIST() { return [
  { id: 'A_FIRST',   icon: '🎉', name: T('Khởi nghiệp', 'Startup Launched'), desc: T('Hoàn thành vòng đầu tiên.', 'Complete the first round.'), test: (s, r) => r.round === 1 },
  { id: 'A_PROFIT',  icon: '💎', name: T('Có lãi!', 'In the Black!'), desc: T('Đạt lợi nhuận dương trong một vòng.', 'Post a positive profit in one round.'), test: (s, r) => r.netProfit > 0 },
  { id: 'A_SHARE30', icon: '👑', name: T('Dẫn đầu thị trường', 'Market Leader'), desc: T('Thị phần vượt 30%.', 'Market share above 30%.'), test: (s, r) => r.share >= 30 },
  { id: 'A_SURVIVE', icon: '🛟', name: T('Vượt bão khủng hoảng', 'Weathered the Storm'), desc: T('Có lãi trong vòng Khủng hoảng năng lượng.', 'Turned a profit during the Energy Crisis round.'), test: (s, r) => r.event.id === 'EV_RECESSION' && r.netProfit > 0 },
  { id: 'A_RICH',    icon: '🏦', name: T('Két sắt đầy', 'Full Vault'), desc: T('Số dư ví vượt 1 tỷ ₫.', 'Wallet balance above 1 billion ₫.'), test: (s, r) => s.balance >= 1000 },
  { id: 'A_FINISH',  icon: '📜', name: T('Tốt nghiệp BizOn', 'BizOn Graduate'), desc: T('Hoàn thành cả 6 vòng mô phỏng.', 'Completed all 6 rounds of the simulation.'), test: (s) => s.finished },
  { id: 'A_FLAG',    icon: '🚩', name: T('Cắm cờ đầu tiên', 'First Flag Planted'), desc: T('Thắng một vòng trên bản đồ chinh phục.', 'Won a round on the conquest map.'), test: (s) => (s.conquest || []).some(c => c.win) },
  { id: 'A_WHATIF',  icon: '🔮', name: T('Chiến lược gia Nếu–Thì', 'What-If Strategist'), desc: T('Dùng mô phỏng Nếu–Thì của Lumina ít nhất một lần.', "Used Lumina's What-If simulation at least once."), test: (s) => (s.whatIfTotal || 0) > 0 },
  { id: 'A_TEAM',    icon: '🤝', name: T('Lắng nghe đội', 'Team Player'), desc: T('Áp dụng 3 gợi ý từ Cuộc họp đội.', 'Applied 3 suggestions from the Team Meeting.'), test: (s) => (s.suggestionsApplied || 0) >= 3 },
  { id: 'A_CHAMP',   icon: '🏆', name: T('Vô địch BizOn', 'BizOn Champion'), desc: T('Kết thúc 6 vòng với lợi nhuận cao nhất sàn đấu.', 'Finished all 6 rounds with the highest profit in the arena.'), test: (s) => s.finished && s.competitors.every(c => (c.profit || 0) <= s.history.reduce((a, r2) => a + r2.netProfit, 0)) },
]; }

function unlockAchievements(s, r) {
  ACHIEVEMENTS_LIST().forEach(a => {
    if (!s.achievements.includes(a.id) && a.test(s, r)) s.achievements.push(a.id);
  });
}

/** Lumina AI – kịch bản "Nếu – Thì" theo dữ liệu vòng trước. */
function luminaAdvice(s, topic) {
  const last = s.history[s.history.length - 1];
  const ev = currentEvent(s);
  const fmt = n => n.toLocaleString('vi-VN');

  if (topic === 'pricing') {
    if (ev.elasticityMul) return { risk: 'high', clip: 'topic-01', text: T(`Vòng này là Chiến tranh giá – khách cực nhạy về giá. Nếu bạn giữ giá trên ${fmt(REF_PRICE)}k₫, thị phần có thể rơi mạnh. Cân nhắc giảm 10–15% và bù bằng sản lượng.`,
      `This round is a Price War – customers are extremely price-sensitive. If you keep price above ${REF_PRICE.toLocaleString('en-US')}k₫, market share could drop sharply. Consider cutting 10-15% and making it up on volume.`) };
    if (last && last.lostSales > 0) return { risk: 'low', clip: 'topic-02', text: T(`Vòng trước bạn hụt ${fmt(last.lostSales)} đơn vì thiếu hàng – cầu đang vượt cung. Nếu tăng giá 5–10%, lợi nhuận biên sẽ cải thiện mà thị phần giảm không đáng kể.`,
      `Last round you missed ${last.lostSales.toLocaleString('en-US')} orders from a stock shortfall – demand is outrunning supply. Raising price 5-10% would improve margin with only a minor share drop.`) };
    return { risk: 'medium', clip: 'topic-03', text: T(`Giá tham chiếu thị trường là ${fmt(REF_PRICE)}k₫. Nếu giảm 10% giá, mô hình dự báo thị phần tăng ~3–4 điểm nhưng biên lợi nhuận mỏng đi – chỉ nên làm khi sản lượng đủ lớn.`,
      `The market reference price is ${REF_PRICE.toLocaleString('en-US')}k₫. A 10% price cut is modeled to raise share by ~3-4 points but thins the margin – only worth it once volume is large enough.`) };
  }
  if (topic === 'marketing') {
    const boost = ev.mktBoost ? T(` Đặc biệt vòng này hiệu quả marketing được cộng hưởng ${Math.round((ev.mktBoost - 1) * 100)}% nhờ ${ev.name}!`, ` This round marketing effectiveness is especially boosted ${Math.round((ev.mktBoost - 1) * 100)}% thanks to ${ev.name}!`) : '';
    const shareNow = last ? last.share.toFixed(1) : '25.0';
    return { risk: 'low', clip: 'topic-04', text: T(`Nếu tăng ngân sách Marketing thêm 15%, thị phần dự kiến đạt ${(parseFloat(shareNow) + 2.5).toFixed(1)}% ở vòng sau.${boost} Khuyến nghị: Marketing Boost, R&D Upgrade.`,
      `Raising the Marketing budget 15% is projected to bring share to ${(parseFloat(shareNow) + 2.5).toFixed(1)}% next round.${boost} Recommended: Marketing Boost, R&D Upgrade.`) };
  }
  // risk
  if (ev.tone === 'bad') return { risk: 'high', clip: 'topic-05', text: T(`⚠️ Cảnh báo đỏ: ${ev.name} – ${ev.desc} Nếu không giữ ít nhất 15% vốn dự phòng, đội có thể âm dòng tiền. Cân nhắc mua "Khiên bảo hiểm" trong Cửa hàng.`,
    `⚠️ Red alert: ${ev.name} – ${ev.desc} Without keeping at least 15% capital in reserve, the team's cash flow could go negative. Consider buying the "Insurance Shield" in the Shop.`) };
  if (ev.tone === 'warn') return { risk: 'medium', clip: 'topic-06', text: T(`Rủi ro chính vòng này: ${ev.name}. ${ev.desc} Hãy điều chỉnh cơ cấu chi phí trước khi commit.`,
    `Main risk this round: ${ev.name}. ${ev.desc} Adjust your cost structure before you commit.`) };
  return { risk: 'low', clip: 'topic-07', text: T(`Cơ hội xanh ngọc: ${ev.name}. ${ev.desc} Đây là lúc mạnh dạn đầu tư để bứt phá thị phần.`,
    `A golden-green opportunity: ${ev.name}. ${ev.desc} This is the time to invest boldly and break out on market share.`) };
}
