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

const MARKET_EVENTS = [
  null,
  { id: 'EV_STABLE', round: 1, tone: 'good', icon: '🌤️', name: 'Thị trường ổn định', tag: 'VÒNG KHỞI ĐỘNG',
    desc: 'Vòng khởi động – nhu cầu thị trường ở mức chuẩn.', demand: 1.0, costMul: 1.0,
    impacts: [{ icon: '📈', label: 'Nhu cầu thị trường', value: 'Chuẩn', dir: 'flat' }, { icon: '⚙️', label: 'Chi phí vận hành', value: 'Ổn định', dir: 'flat' }],
    luminaImg: 'lumina-vest-thumbsup', luminaMsg: 'Chào cả đội! Vòng đầu là lúc thiết lập nền tảng. CEO hãy thống nhất chiến lược giá, SEC nhớ ghi chép lại các quyết định nhé!',
    cta: { label: '🎯 Nhập quyết định ngay', tab: 'decisions' } },
  { id: 'EV_GOLDEN', round: 2, tone: 'good', icon: '🌟', name: 'Cơ Hội Vàng', tag: 'SỰ KIỆN ĐẶC BIỆT',
    desc: 'Chính phủ vừa công bố gói kích cầu kinh tế và miễn thuế xuất khẩu. Đây là thời cơ để bứt phá doanh thu trên thị trường quốc tế.',
    demand: 1.35, costMul: 1.0, rdBoost: 1.5,
    impacts: [{ icon: '🧾', label: 'Thuế xuất khẩu', value: '0%', dir: 'down-good' }, { icon: '📦', label: 'Nhu cầu dự kiến', value: '+35%', dir: 'up' }],
    luminaImg: 'lumina-ao-dai-clap', luminaMsg: 'Thật tuyệt vời! CFO hãy rà soát lại ngân sách đầu tư, còn COO hãy chuẩn bị tăng công suất để đáp ứng làn sóng đơn hàng mới này nhé!',
    cta: { label: '🏭 Tăng công suất ngay', tab: 'decisions' } },
  { id: 'EV_PRICEWAR', round: 3, tone: 'warn', icon: '⚔️', name: 'Cạnh Tranh Về Giá', tag: 'CẢNH BÁO THỊ TRƯỜNG',
    desc: 'Đối thủ giảm giá 15% điện rộng tại kênh Modern Trade – khách hàng cực nhạy cảm về giá trong vòng này.',
    demand: 1.0, costMul: 1.0, elasticityMul: 1.4,
    impacts: [{ icon: '🏷️', label: 'Giá đối thủ (kênh MT)', value: '-15%', dir: 'down' }, { icon: '💔', label: 'Độ nhạy giá của khách', value: 'CAO', dir: 'up-bad' }],
    luminaImg: 'lumina-vest-worried', luminaMsg: 'Thưa CMO, đối thủ vừa châm ngòi chiến tranh giá! Ta có 2 lối đi: chiến thuật Bundling hoặc tăng Value-Added – đừng lao vào giảm giá sâu kẻo mất biên lợi nhuận.',
    cta: { label: '🤖 Xem giải pháp từ Lumina', tab: 'advisor' } },
  { id: 'EV_RECESSION', round: 4, tone: 'bad', icon: '⚡', name: 'Khủng Hoảng Năng Lượng', tag: 'CẢNH BÁO KHẨN CẤP', img: 'assets/illustrations/event-energy-crisis.webp',
    desc: 'Thị trường năng lượng toàn cầu đang gặp biến động cực lớn. Giá điện sản xuất tăng vọt, tổng cầu suy giảm.',
    demand: 0.7, costMul: 1.3, shake: true, oeeHit: 10,
    impacts: [{ icon: '📈', label: 'Chi phí vận hành', value: '+30%', dir: 'up-bad' }, { icon: '🏭', label: 'Hiệu suất (OEE)', value: '-10%', dir: 'down' }],
    luminaImg: 'lumina-ao-dai-alert', luminaMsg: 'Cảnh báo khẩn cấp! Giá điện sản xuất tăng vọt. COO hãy rà soát lịch chạy máy, còn CFO cần dự phòng thêm vốn ngay nhé!',
    cta: { label: '⚡ Tối ưu năng lượng ngay', tab: 'reports', report: 'energy' } },
  { id: 'EV_SUPPLY', round: 5, tone: 'bad', icon: '🚢', name: 'Khủng Hoảng Chuỗi Cung Ứng', tag: 'CẢNH BÁO KHẨN CẤP',
    desc: 'Một sự cố nghiêm trọng tại các cửa ngõ giao thương quốc tế. Tàu chở hàng chính bị mắc kẹt, gây đình trệ dây chuyền sản xuất của BizOn.',
    demand: 1.0, costMul: 1.25, fulfillMul: 0.85, shake: true,
    impacts: [{ icon: '💰', label: 'Giá thành đơn vị', value: '+25%', dir: 'up-bad' }, { icon: '📦', label: 'Tỷ lệ đáp ứng đơn hàng', value: '-15%', dir: 'down' }],
    luminaImg: 'lumina-ao-dai-alert', luminaMsg: 'Thưa CEO, tình hình rất khẩn cấp! Dây chuyền sản xuất đình trệ vì thiếu linh kiện đầu vào. Chúng ta cần quyết định ngay: tăng ngân sách vận chuyển hay đàm phán lại thời gian giao hàng?',
    cta: { label: '👥 Họp khẩn cấp toàn đội', tab: 'decisions' } },
  { id: 'EV_MILESTONE', round: 6, tone: 'good', icon: '🐉', name: 'Việt Nam Hóa Rồng', tag: 'VÒNG CHUNG KẾT · KỊCH BẢN GIẢ ĐỊNH', img: 'assets/illustrations/event-vietnam-2026.webp',
    desc: 'Kịch bản giả định «Rồng Việt vươn mình»: Việt Nam tiến vào nhóm thu nhập trung bình cao. Tầng lớp trung lưu mở rộng, sức mua bùng nổ – khách hàng ít nhạy cảm về giá, ưu tiên chất lượng và thương hiệu. (Tham số mô phỏng minh họa, không phải số liệu thống kê thực.)',
    demand: 1.25, costMul: 1.0, elasticityMul: 0.85, wageMul: 1.1, brandPow: 1.5, mktBoost: 1.2,
    impacts: [{ icon: '🛍️', label: 'Tổng cầu thị trường', value: '+25%', dir: 'up' }, { icon: '🏷️', label: 'Độ nhạy giá của khách', value: '-15%', dir: 'down-good' }, { icon: '👷', label: 'Chi phí nhân công', value: '+10%', dir: 'up-bad' }, { icon: '✨', label: 'Trọng số thương hiệu', value: '×1.5', dir: 'up' }],
    luminaImg: 'lumina-ao-dai-clap', luminaMsg: 'Kịch bản chung kết, thưa đội ngũ điều hành! Trong kịch bản giả định này, Việt Nam tiến vào nhóm thu nhập trung bình cao – thị trường "thay da đổi thịt" với sức mua bùng nổ. Đây là cơ hội vàng để CMO nâng tầm thương hiệu thành dòng Premium và CEO mở rộng quy mô phục vụ làn sóng tiêu dùng mới!',
    cta: { label: '🐉 Bứt phá về đích', tab: 'decisions' } },
];

const SHOP_ITEMS = [
  { id: 'SOLAR_01',     icon: '☀️', name: 'Pin Mặt Trời',   type: 'blueprint',  price: 150, img: 'assets/illustrations/solar-farm.webp', desc: 'Tự chủ nguồn điện: -15% chi phí cố định vĩnh viễn, +20 điểm ESG, giảm nửa tác động OEE khi khủng hoảng năng lượng. Hoàn vốn ~2 vòng.' },
  { id: 'MKT_BOOST_01', icon: '📣', name: 'Marketing Boost', type: 'booster',    price: 80,  desc: '+30% hiệu quả marketing trong vòng kế tiếp.' },
  { id: 'RD_UPGRADE_01', icon: '🔬', name: 'R&D Upgrade',    type: 'blueprint',  price: 120, desc: 'Giảm 8% giá thành sản xuất vĩnh viễn.' },
  { id: 'OPS_LEAN_01',  icon: '🏭', name: 'Lean Operations', type: 'blueprint',  price: 100, desc: 'Giảm 20% chi phí khấu hao máy móc.' },
  { id: 'INS_SHIELD_01', icon: '🛡️', name: 'Khiên bảo hiểm', type: 'consumable', price: 60,  desc: 'Vô hiệu hóa tác động tiêu cực của 1 biến cố thị trường.' },
  { id: 'DATA_PACK_01', icon: '📊', name: 'Gói dữ liệu thị trường', type: 'consumable', price: 50, desc: 'Lumina tiết lộ trước biến cố của vòng sau.' },
];

const SKILLS = [
  { id: 'SK_FIN1', icon: '💰', name: 'Quản trị dòng tiền', cost: 50,  desc: '+5% lợi nhuận ròng mỗi vòng.', effect: { profitMul: 1.05 } },
  { id: 'SK_MKT1', icon: '📣', name: 'Marketing số',       cost: 80,  desc: '+10% hiệu quả ngân sách quảng cáo.', effect: { mktMul: 1.10 } },
  { id: 'SK_OPS1', icon: '🏭', name: 'Sản xuất tinh gọn',  cost: 80,  desc: '-5% giá thành đơn vị.', effect: { costMul: 0.95 } },
  { id: 'SK_NEG1', icon: '🤝', name: 'Đàm phán chiến lược', cost: 120, desc: 'Giảm 10% giá vật phẩm trong Cửa hàng.', effect: { shopMul: 0.90 } },
  { id: 'SK_AI1',  icon: '🤖', name: 'Cộng hưởng Lumina',  cost: 150, desc: '+2 lượt hỏi Lumina AI mỗi vòng.', effect: { aiQuota: 2 } },
];

const COMPETITORS = [
  { name: 'Alpha Dynamics', style: 'aggressive' },
  { name: 'Mekong Ventures', style: 'balanced' },
  { name: 'Star Clay Co.',   style: 'premium' },
];

/* ===== NHIỆM VỤ (Missions) ===== */
const MISSIONS = [
  { id: 'M_FIRST',    icon: '🚀', name: 'Khởi động', desc: 'Hoàn thành vòng chơi đầu tiên.', rewardMoney: 20, rewardXp: 10, test: s => s.history.length >= 1 },
  { id: 'M_PROFIT',   icon: '💎', name: 'Kinh doanh có lãi', desc: 'Đạt lợi nhuận dương trong một vòng.', rewardMoney: 30, rewardXp: 20, test: s => s.history.some(r => r.netProfit > 0) },
  { id: 'M_SHARE30',  icon: '👑', name: 'Chiếm lĩnh thị trường', desc: 'Đạt thị phần từ 30% trở lên.', rewardMoney: 50, rewardXp: 30, test: s => s.history.some(r => r.share >= 30) },
  { id: 'M_SHOP',     icon: '🛍️', name: 'Nhà đầu tư thông thái', desc: 'Mua ít nhất 1 vật phẩm trong Cửa hàng.', rewardMoney: 20, rewardXp: 10, test: s => (s.itemsBought || 0) >= 1 },
  { id: 'M_AI3',      icon: '🤖', name: 'Người bạn của Lumina', desc: 'Hỏi Lumina AI tổng cộng 3 lần.', rewardMoney: 15, rewardXp: 10, test: s => (s.aiAskedTotal || 0) >= 3 },
  { id: 'M_SKILL',    icon: '🌳', name: 'Học không ngừng', desc: 'Mở khóa 1 kỹ năng trong Cây kỹ năng.', rewardMoney: 25, rewardXp: 15, test: s => s.skills.length >= 1 },
  { id: 'M_MINIGAME', icon: '🏭', name: 'Thợ đất sét cừ khôi', desc: 'Đạt từ 15 điểm trong Clay Factory Frenzy.', rewardMoney: 25, rewardXp: 15, test: s => (s.minigameBest || 0) >= 15 },
  { id: 'M_SURVIVE',  icon: '🛟', name: 'Thuyền trưởng bão táp', desc: 'Có lãi trong vòng Khủng hoảng năng lượng.', rewardMoney: 60, rewardXp: 40, test: s => s.history.some(r => r.event.id === 'EV_RECESSION' && r.netProfit > 0) },
  { id: 'M_FINISH',   icon: '🎓', name: 'Tốt nghiệp BizOn', desc: 'Hoàn thành trọn vẹn 6 vòng mô phỏng.', rewardMoney: 100, rewardXp: 50, test: s => s.finished },
];

function missionStatus(s, m) {
  if ((s.missionsClaimed || []).includes(m.id)) return 'claimed';
  return m.test(s) ? 'ready' : 'pending';
}

function claimMission(s, id) {
  const m = MISSIONS.find(x => x.id === id);
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
      role, type: 'FINANCIAL_STRESS_TEST', title: '💰 Stress test tài chính (CFO)',
      status: qrDanger ? 'INSOLVENCY_RISK' : leverageOK ? 'SAFE_AND_EFFICIENT' : 'CAPITAL_EROSION',
      metrics: [
        { label: 'Số dư cuối chu kỳ (dự báo)', value: Math.round(projCash) + 'tr₫', bad: projCash < 100 },
        { label: 'Quick Ratio dự báo', value: projQuickRatio + (qrDanger ? ' ⚠️' : ''), bad: qrDanger },
        { label: 'ROI giả định vs lãi vay ' + LOAN_INTEREST_RATE + '%', value: roiHyp + '%', bad: !leverageOK },
      ],
      msg: qrDanger
        ? `CFO ơi, kịch bản này cho thấy Quick Ratio rơi xuống ${projQuickRatio} – dưới ngưỡng an toàn 1.1. Nếu doanh số thực tế thấp hơn dự báo 5%, chúng ta sẽ mất khả năng thanh toán. Tôi đề xuất vay thêm ít nhất 100tr₫ làm lớp đệm an toàn.`
        : leverageOK
        ? `Phân tích cho thấy sử dụng vốn lúc này là bước đi thông minh: ROI kỳ vọng ${roiHyp}% cao hơn lãi suất vay ${LOAN_INTEREST_RATE}%. Đòn bẩy hiệu quả – có thể mạnh dạn tăng đầu tư R&D!`
        : `Cảnh báo mòn vốn: ROI kỳ vọng chỉ ${roiHyp}%, thấp hơn chi phí vốn ${LOAN_INTEREST_RATE}%. Nên cắt giảm chi phí cố định hoặc hoãn vay cho tới khi biên lợi nhuận cải thiện.`,
    };
  }

  // CEO – STRATEGIC_OVERVIEW
  const risky = estProfit < 0 || liquidityRisk > 0.8;
  const aggressive = deltaShare > 3 && estProfit < 0;
  return {
    role: 'CEO', type: 'STRATEGIC_OVERVIEW', title: '🧭 Tổng quan chiến lược (CEO)',
    status: aggressive ? 'VIABLE_BUT_RISKY' : risky ? 'HIGH_RISK' : 'SAFE',
    metrics: [
      { label: 'Thị phần dự báo', value: estShare.toFixed(1) + '% (' + (deltaShare >= 0 ? '+' : '') + deltaShare.toFixed(1) + '%)', bad: deltaShare < 0 },
      { label: 'Lợi nhuận ròng dự báo', value: Math.round(estProfit) + 'tr₫', bad: estProfit < 0 },
      { label: 'Điểm hòa vốn', value: breakEven.toLocaleString('vi-VN') + ' sp (bán dự kiến ' + estSold.toLocaleString('vi-VN') + ')', bad: estSold < breakEven },
    ],
    msg: aggressive
      ? `Thưa CEO, kịch bản này có thể chiếm thêm ${deltaShare.toFixed(1)}% thị phần ngay vòng tới, nhưng lợi nhuận ròng sẽ âm ${Math.abs(Math.round(estProfit))}tr₫. Bạn có sẵn sàng đánh đổi lợi nhuận ngắn hạn để lấy vị thế dẫn đầu?`
      : risky
      ? `Cảnh báo: kế hoạch chi chiếm ${Math.round(liquidityRisk * 100)}% ví hiện có và điểm hòa vốn là ${breakEven.toLocaleString('vi-VN')} sp. Hãy phối hợp với CFO thu xếp khoản vay ngắn hạn trước khi Commit.`
      : `Dữ liệu cho thấy đây là kịch bản an toàn: bán dự kiến ${estSold.toLocaleString('vi-VN')} sp, vượt điểm hòa vốn ${breakEven.toLocaleString('vi-VN')} sp. Tôi đề xuất giữ ít nhất 20% ngân sách Marketing để phòng thủ trước đối thủ.`,
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
      mk(0.85, 0.45, '🛡️ Thận trọng', 'low'),
      mk(1.15, 1.0,  '⚖️ Cân bằng', 'medium'),
      mk(1.6,  1.5,  '🚀 Tăng tốc', 'high'),
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
    status: 'RED', badge: 'ĐỎ · NGUY CẤP', metric: `Brand Loyalty ${s.brandLoyalty}% < ngưỡng 60%`,
    dialogue: 'Khách hàng đang dần rời bỏ chúng ta để sang đối thủ — dấu hiệu thương hiệu đang mất sức hút. Cân nhắc một chiến dịch tái định vị trước khi mất thêm thị phần.',
    actions: ['Kích hoạt Branding Premium', 'Tăng R&D để tái định vị thương hiệu'],
  };
  if (shareDrop > 5) return {
    status: 'RED', badge: 'ĐỎ · NGUY CẤP', metric: `Thị phần giảm ${shareDrop}% so với chu kỳ trước`,
    clip: 'adv-02', dialogue: 'Đối thủ đang xâm chiếm phân khúc của chúng ta bằng giá rẻ. Chúng ta cần tăng ngân sách quảng cáo hoặc tung sản phẩm R&D mới.',
    actions: ['Tăng ngân sách Marketing vòng tới', 'Mua Marketing Boost trong Cửa hàng'],
  };
  if (mroi !== null && mroi < 3) return {
    status: 'YELLOW', badge: 'VÀNG · RỦI RO', metric: `Doanh thu / CP Marketing = ${mroi} < 3.0`,
    clip: 'adv-03', dialogue: 'CMO thân mến, chi phí tiếp thị của chúng ta đang quá cao nhưng không chuyển đổi thành doanh thu tương ứng. Hãy rà soát lại thông điệp chiến dịch.',
    actions: ['Giảm ngân sách Marketing 15%', 'Rà soát lại thông điệp chiến dịch'],
  };
  if (demandMet < 90) return {
    status: 'GREEN', badge: 'XANH · CƠ HỘI', metric: `Đáp ứng nhu cầu chỉ ${demandMet}% (mất ${last.lostSales} đơn)`,
    clip: 'adv-04', dialogue: 'Nhu cầu thị trường đang rất lớn nhưng chúng ta không có đủ hàng để bán. Hãy phối hợp với COO để tăng sản lượng.',
    actions: ['Tăng sản lượng + thuê thêm nhân công', 'Nâng cấp dây chuyền sản xuất'],
  };
  if (ev.id === 'EV_PRICEWAR' && !s.finished) return {
    status: 'RED', badge: 'ĐỎ · PRICE WAR', metric: 'Một đối thủ hạ giá 15% tại Modern Trade',
    clip: 'adv-05', dialogue: 'Thưa CMO, một đối thủ vừa hạ giá 15% và chiếm mất 8% thị phần của chúng ta. Nếu không phản ứng trong vòng tới, chúng ta sẽ mất vị thế dẫn đầu.',
    actions: ["Triển khai gói 'Marketing Boost' giữ chân khách trung thành", 'Cải tiến bao bì (R&D) tăng giá trị cảm nhận – đừng đua giảm giá'],
  };
  return {
    status: 'OPPORTUNITY', badge: 'XANH · CƠ HỘI VÀNG', metric: "Xu hướng 'Tiêu dùng xanh' +25% tại Đông Nam Á",
    dialogue: "CMO ơi, thị trường đang khao khát sản phẩm bền vững. Nếu chúng ta 'Bật' chiến dịch xanh ngay bây giờ, chúng ta sẽ dẫn đầu xu hướng!",
    actions: ["Phân bổ 40% ngân sách vào chiến dịch 'Green Initiative'", 'Tăng giá bán 10% cho dòng sản phẩm cao cấp'],
  };
}

/* ===== CFO BRAIN – giám sát thanh khoản & chế độ khủng hoảng ===== */
function cfoBrain(s) {
  const last = s.history[s.history.length - 1] || null;
  const invDays = last && last.sold > 0
    ? Math.round(s.inventory / last.sold * 30)
    : (s.inventory > 0 ? 90 : 0);
  if (s.quickRatio < 1) return {
    status: 'CRISIS', badge: 'ĐỎ · KHỦNG HOẢNG THANH KHOẢN', invDays,
    metric: `Quick Ratio ${s.quickRatio.toFixed(2)} < 1.00`,
    clip: 'adv-14', dialogue: `CFO, thanh khoản đang ở vùng đỏ! Tiền mặt chỉ còn ${Math.round(s.balance)}tr₫, vòng quay tồn kho lên tới ${invDays} ngày. Hãy phê duyệt khoản vay khẩn cấp hoặc cắt giảm chi phí ngay – đừng để lỡ kỳ trả lương.`,
  };
  if (s.roi >= LOAN_INTEREST_RATE && s.loan === 0) return {
    status: 'LEVERAGE', badge: 'XANH · ĐÒN BẨY HIỆU QUẢ', invDays,
    metric: `ROI ${s.roi}% > chi phí vốn ${LOAN_INTEREST_RATE}%`,
    clip: 'adv-15', dialogue: `ROI hiện tại (${s.roi}%) đang cao hơn chi phí vốn vay (${LOAN_INTEREST_RATE}%). Đây là thời điểm tốt để dùng đòn bẩy tài chính mở rộng sản xuất, CFO ạ.`,
  };
  return {
    status: 'SAFE', badge: 'XANH · AN TOÀN', invDays,
    metric: `Quick Ratio ${s.quickRatio.toFixed(2)} ≥ 1.00`,
    clip: 'adv-16', dialogue: `Thanh khoản ổn định, vòng quay tồn kho ${invDays} ngày trong ngưỡng an toàn. Hãy duy trì kỷ luật chi tiêu và theo dõi dòng tiền từng vòng nhé.`,
  };
}

/* ===== THE COO BRAIN – cố vấn vận hành theo kịch bản ===== */
function cooBrain(s) {
  const last = s.history[s.history.length - 1] || null;
  const prev = s.history[s.history.length - 2] || null;
  const capUse = last ? last.decisions.production / Math.max(1, s.machineCapacity) : 0;
  const invRatio = last && last.demandUnits > 0 ? s.inventory / last.demandUnits : 0;
  if (invRatio > 0.4) return {
    status: 'RED', badge: 'ĐỎ · NGUY CẤP', metric: `Tồn kho / Nhu cầu = ${Math.round(invRatio * 100)}% > 40%`,
    clip: 'adv-06', dialogue: 'Lượng hàng tồn kho đang quá lớn, gây lãng phí chi phí lưu kho. Hãy phối hợp với CMO để đẩy mạnh tiêu thụ hoặc giảm sản lượng.',
    actions: ['Giảm sản lượng vòng tới', 'Phối hợp CMO đẩy tiêu thụ'],
  };
  if (last && prev && last.defect > prev.defect * 1.12) return {
    status: 'YELLOW', badge: 'VÀNG · RỦI RO', metric: `Phế phẩm tăng ${Math.round((last.defect / prev.defect - 1) * 100)}% so với vòng trước`,
    clip: 'adv-07', dialogue: 'Thưa COO, tôi nhận thấy tỷ lệ sản phẩm lỗi tăng mạnh. Nguyên nhân là do đội ngũ nhân sự mới chưa được đào tạo bài bản. Chúng ta nên đầu tư vào gói "Đào tạo chuyên sâu" để lấy lại phong độ.',
    actions: ['Tăng ngân sách đào tạo trong thẻ Nhân sự', 'Giữ chân kỹ sư lành nghề'],
  };
  if (capUse > 0.95) return {
    status: 'YELLOW', badge: 'VÀNG · RỦI RO', metric: `Sản lượng / Công suất = ${Math.round(capUse * 100)}% > 95%`,
    clip: 'adv-08', dialogue: 'COO ơi, nhà máy đang chạy quá tải. Nếu không đầu tư mở rộng ngay, chúng ta sẽ bỏ lỡ cơ hội bán hàng ở vòng tới.',
    actions: ['Nâng cấp dây chuyền sản xuất', 'Thuê thêm nhân công'],
  };
  if (last && last.lostSales > 0) return {
    status: 'GREEN', badge: 'XANH · CƠ HỘI', metric: `Thiếu ${last.lostSales.toLocaleString('vi-VN')} sp so với nhu cầu`,
    clip: 'adv-09', dialogue: 'Thị trường đang "khát" hàng nhưng chúng ta không đủ năng lực cung ứng. Đây là lúc để kích hoạt tăng ca hoặc mở rộng công suất.',
    actions: ['Tăng sản lượng + nhân công vòng tới', 'Đàm phán kỳ hạn 60 ngày để kích cầu'],
  };
  return {
    status: 'SAFE', badge: 'XANH · ỔN ĐỊNH', metric: 'Cung – cầu đang cân bằng',
    clip: 'adv-10', dialogue: 'Vận hành đang mượt mà, COO ạ. Hãy duy trì bảo trì định kỳ và theo dõi OEE để giữ phong độ nhé.',
    actions: ['Bảo trì định kỳ', 'Theo dõi OEE mỗi vòng'],
  };
}

/* ===== THE SEC BRAIN – cố vấn điều phối & tuân thủ ===== */
function secBrain(s) {
  const ev = currentEvent(s);
  if (!s.finished && ev.tone === 'bad' && !s.committed) return {
    status: 'RED', badge: 'ĐỎ · ĐIỀU PHỐI KHẨN', metric: `Sự kiện thị trường "${ev.name}" đang diễn ra`,
    clip: 'adv-17', dialogue: `Biến cố "${ev.name}" vừa ập đến! SEC hãy nhanh chóng tổng hợp thông tin từ COO về tình hình sản xuất và báo cáo cho CEO để điều chỉnh giá bán kịp thời.`,
    actions: ['Kích hoạt họp khẩn cấp toàn đội', 'Cập nhật mục tiêu vòng theo tình hình mới'],
  };
  if (!s.finished && !s.committed) return {
    status: 'YELLOW', badge: 'VÀNG · TIẾN ĐỘ', metric: `Vòng ${s.round} chưa chốt quyết định`,
    clip: 'adv-11', dialogue: 'SEC ơi, các bộ phận vẫn chưa thống nhất con số cuối cùng. Hãy nhắc CEO chốt quyết định ngay để tránh bị hệ thống tự động khóa!',
    actions: ['Rà soát bảng quyết định với từng vai trò', 'Nhắc CEO nhấn Commit'],
  };
  if ((s.advisorHistory || []).length === 0) return {
    status: 'YELLOW', badge: 'VÀNG · TRI THỨC', metric: 'Nhật ký cố vấn đang trống',
    clip: 'adv-12', dialogue: 'Dữ liệu lịch sử đang bị trống. SEC cần ghi chú lại các biến cố quan trọng để đội có cơ sở phân tích cho các vòng sau nhé.',
    actions: ['Hỏi Lumina để lưu phân tích vào SEC log', 'Ghi chép Nhật ký đội'],
  };
  return {
    status: 'GREEN', badge: 'XANH · SẴN SÀNG', metric: 'Toàn đội đã chốt phần việc',
    clip: 'adv-13', dialogue: 'Tuyệt vời! Toàn đội đã sẵn sàng. SEC hãy kiểm tra lại lần cuối và báo cáo CEO thực hiện nút nhấn "Commit" thần thánh nhé.',
    actions: ['Kiểm tra lần cuối bảng quyết định', 'Lưu biên bản vào Nhật ký đội'],
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
    clip: 'kpi-01', text: 'Thật tuyệt vời, CFO! Chiến lược tối ưu cấu trúc vốn của bạn đã mang lại lợi nhuận kỷ lục (ROI ' + r.roi + '%). Dòng tiền đang cực kỳ dồi dào để chúng ta tái đầu tư mở rộng!' });
  if (shareGain > 5 || (top1 && r.share >= 30)) out.push({ role: 'CMO', risk: 'low',
    clip: 'kpi-02', text: 'Chúc mừng CMO! Chiến dịch Marketing Mix của bạn đã đánh bại hoàn toàn đối thủ. Thương hiệu của đội hiện đang là lựa chọn số 1 của khách hàng!' });
  if (r.oee >= 95 && r.defect < 1) out.push({ role: 'COO', risk: 'low',
    clip: 'kpi-03', text: 'COO ơi, hiệu suất nhà máy đạt mức không tưởng (OEE ' + r.oee + '%, phế phẩm ' + r.defect + '%)! Bảo trì dự phòng và đào tạo công nhân đã giúp dây chuyền chạy mượt tuyệt đối.' });
  return out;
}

function riskAlerts(s, r) {
  const out = [];
  if (r.oee < 60 || r.defect > 7) out.push({ role: 'COO', risk: 'high',
    clip: 'risk-01', text: 'Dây chuyền sản xuất đang kêu cứu! Tỷ lệ phế phẩm quá cao sẽ bào mòn lợi nhuận gộp. Đừng ép máy móc chạy quá tải mà bỏ qua bảo trì – hãy bảo trì định kỳ và đào tạo nhân sự kỹ thuật.' });
  if (r.decisions && r.decisions.production > s.machineCapacity * 0.9 && s.quickRatio < 1) out.push({ role: 'CEO', risk: 'high',
    clip: 'risk-02', text: 'Thưa CEO, chúng ta đang đứng trước ngưỡng cửa phá sản kỹ thuật. Sự đánh đổi giữa tăng trưởng nóng và an toàn dòng tiền đang bị lệch pha – hãy họp khẩn cấp toàn đội và rà soát lại quyết định.' });
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
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: `Nâng cấp Dây chuyền ${idx + 1} (-${cost}tr₫) – tiết kiệm 40% điện năng, OEE +5%` });
  return true;
}

function doMaintenance(s, cost = 60) {
  if (s.balance < cost) return false;
  s.balance -= cost;
  s.maintBonus += 3;
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: `Bảo trì định kỳ (-${cost}tr₫) – OEE +3%, giảm phế phẩm` });
  return true;
}

function approveLoan(s, amount = 300) {
  if (s.loan > 0) return false;             // mỗi phiên chỉ 1 khoản vay
  s.loan = amount;
  s.balance += amount;
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: `CFO phê duyệt khoản vay +${amount}tr₫ (lãi 5%/vòng)` });
  return true;
}

function cutCosts(s) {
  if (s.costCutter) return false;
  s.costCutter = true;
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: 'CFO kích hoạt cắt giảm chi phí – chi phí cố định vòng sau -15%' });
  return true;
}

function brandingPremium(s, cost = 120) {
  if (s.balance < cost) return false;
  s.balance -= cost;
  s.brand = Math.min(1.6, s.brand + 0.08);
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: `CMO kích hoạt Branding Premium (-${cost}tr₫) – giá trị thương hiệu +`});
  return true;
}

// PRNG có seed để mô phỏng tái lập được
function rng(state) {
  state.seed = (state.seed * 1103515245 + 12345) % 2147483648;
  return state.seed / 2147483648;
}

function hasSkill(s, id) { return s.skills.includes(id); }
function skillEffect(s, key, def) {
  return SKILLS.filter(sk => s.skills.includes(sk.id) && sk.effect[key] != null)
    .reduce((acc, sk) => acc * sk.effect[key], def);
}

function currentEvent(s) { return MARKET_EVENTS[s.round]; }

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
  const evEff = shielded ? MARKET_EVENTS[1] : ev;

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

const ACHIEVEMENTS = [
  { id: 'A_FIRST',   icon: '🎉', name: 'Khởi nghiệp', desc: 'Hoàn thành vòng đầu tiên.', test: (s, r) => r.round === 1 },
  { id: 'A_PROFIT',  icon: '💎', name: 'Có lãi!', desc: 'Đạt lợi nhuận dương trong một vòng.', test: (s, r) => r.netProfit > 0 },
  { id: 'A_SHARE30', icon: '👑', name: 'Dẫn đầu thị trường', desc: 'Thị phần vượt 30%.', test: (s, r) => r.share >= 30 },
  { id: 'A_SURVIVE', icon: '🛟', name: 'Vượt bão khủng hoảng', desc: 'Có lãi trong vòng Khủng hoảng năng lượng.', test: (s, r) => r.event.id === 'EV_RECESSION' && r.netProfit > 0 },
  { id: 'A_RICH',    icon: '🏦', name: 'Két sắt đầy', desc: 'Số dư ví vượt 1 tỷ ₫.', test: (s, r) => s.balance >= 1000 },
  { id: 'A_FINISH',  icon: '📜', name: 'Tốt nghiệp BizOn', desc: 'Hoàn thành cả 6 vòng mô phỏng.', test: (s) => s.finished },
  { id: 'A_FLAG',    icon: '🚩', name: 'Cắm cờ đầu tiên', desc: 'Thắng một vòng trên bản đồ chinh phục.', test: (s) => (s.conquest || []).some(c => c.win) },
  { id: 'A_WHATIF',  icon: '🔮', name: 'Chiến lược gia Nếu–Thì', desc: 'Dùng mô phỏng Nếu–Thì của Lumina ít nhất một lần.', test: (s) => (s.whatIfTotal || 0) > 0 },
  { id: 'A_TEAM',    icon: '🤝', name: 'Lắng nghe đội', desc: 'Áp dụng 3 gợi ý từ Cuộc họp đội.', test: (s) => (s.suggestionsApplied || 0) >= 3 },
  { id: 'A_CHAMP',   icon: '🏆', name: 'Vô địch BizOn', desc: 'Kết thúc 6 vòng với lợi nhuận cao nhất sàn đấu.', test: (s) => s.finished && s.competitors.every(c => (c.profit || 0) <= s.history.reduce((a, r2) => a + r2.netProfit, 0)) },
];

function unlockAchievements(s, r) {
  ACHIEVEMENTS.forEach(a => {
    if (!s.achievements.includes(a.id) && a.test(s, r)) s.achievements.push(a.id);
  });
}

/** Lumina AI – kịch bản "Nếu – Thì" theo dữ liệu vòng trước. */
function luminaAdvice(s, topic) {
  const last = s.history[s.history.length - 1];
  const ev = currentEvent(s);
  const fmt = n => n.toLocaleString('vi-VN');

  if (topic === 'pricing') {
    if (ev.elasticityMul) return { risk: 'high', clip: 'topic-01', text: `Vòng này là Chiến tranh giá – khách cực nhạy về giá. Nếu bạn giữ giá trên ${fmt(REF_PRICE)}k₫, thị phần có thể rơi mạnh. Cân nhắc giảm 10–15% và bù bằng sản lượng.` };
    if (last && last.lostSales > 0) return { risk: 'low', clip: 'topic-02', text: `Vòng trước bạn hụt ${fmt(last.lostSales)} đơn vì thiếu hàng – cầu đang vượt cung. Nếu tăng giá 5–10%, lợi nhuận biên sẽ cải thiện mà thị phần giảm không đáng kể.` };
    return { risk: 'medium', clip: 'topic-03', text: `Giá tham chiếu thị trường là ${fmt(REF_PRICE)}k₫. Nếu giảm 10% giá, mô hình dự báo thị phần tăng ~3–4 điểm nhưng biên lợi nhuận mỏng đi – chỉ nên làm khi sản lượng đủ lớn.` };
  }
  if (topic === 'marketing') {
    const boost = ev.mktBoost ? ` Đặc biệt vòng này hiệu quả marketing được cộng hưởng ${Math.round((ev.mktBoost - 1) * 100)}% nhờ ${ev.name}!` : '';
    const shareNow = last ? last.share.toFixed(1) : '25.0';
    return { risk: 'low', clip: 'topic-04', text: `Nếu tăng ngân sách Marketing thêm 15%, thị phần dự kiến đạt ${(parseFloat(shareNow) + 2.5).toFixed(1)}% ở vòng sau.${boost} Khuyến nghị: Marketing Boost, R&D Upgrade.` };
  }
  // risk
  if (ev.tone === 'bad') return { risk: 'high', clip: 'topic-05', text: `⚠️ Cảnh báo đỏ: ${ev.name} – ${ev.desc} Nếu không giữ ít nhất 15% vốn dự phòng, đội có thể âm dòng tiền. Cân nhắc mua "Khiên bảo hiểm" trong Cửa hàng.` };
  if (ev.tone === 'warn') return { risk: 'medium', clip: 'topic-06', text: `Rủi ro chính vòng này: ${ev.name}. ${ev.desc} Hãy điều chỉnh cơ cấu chi phí trước khi commit.` };
  return { risk: 'low', clip: 'topic-07', text: `Cơ hội xanh ngọc: ${ev.name}. ${ev.desc} Đây là lúc mạnh dạn đầu tư để bứt phá thị phần.` };
}
