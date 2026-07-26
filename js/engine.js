/* BizOn Bật Nghiệp 2026 — Engine mô phỏng 6 vòng (client-side)
 * © 2026 Đỗ Thùy Hương (Je m'appelle Hương) & Phan Anh Tú. Bảo lưu mọi quyền.
 * Mô hình hóa: decisions {price, marketing_budget,
 * production_volume, rd_investment} → financial_reports {revenue, net_profit,
 * market_share, inventory_stock}. Đơn vị tiền: nghìn ₫ (giá) / triệu ₫ (ngân sách).
 */

const ROUNDS_TOTAL = 6;
const BASE_MARKET_UNITS = 12000;     // tổng cầu thị trường mỗi vòng
const UNIT_COST = 60;                 // nghìn ₫ / sản phẩm
const FIXED_COST = 50;                // triệu ₫ / vòng
const REF_PRICE = 150;                // nghìn ₫ — giá tham chiếu
const PRICE_ELASTICITY = 1.8;
const STARTING_BALANCE = 500;         // triệu ₫ (vốn giảng viên cấp)
const XP_PER_LEVEL = 100;
const AI_QUOTA_PER_ROUND = 3;         // ERR_AI_LIMIT

const MARKET_EVENTS = [
  null,
  { id: 'EV_STABLE', round: 1, tone: 'good', icon: '🌤️', name: 'Thị trường ổn định', tag: 'VÒNG KHỞI ĐỘNG',
    desc: 'Vòng khởi động — nhu cầu thị trường ở mức chuẩn.', demand: 1.0, costMul: 1.0,
    impacts: [{ icon: '📈', label: 'Nhu cầu thị trường', value: 'Chuẩn', dir: 'flat' }, { icon: '⚙️', label: 'Chi phí vận hành', value: 'Ổn định', dir: 'flat' }],
    luminaImg: 'lumina-vest-thumbsup', luminaMsg: 'Chào cả đội! Vòng đầu là lúc thiết lập nền tảng. CEO hãy thống nhất chiến lược giá, SEC nhớ ghi chép lại các quyết định nhé!',
    cta: { label: '🎯 Nhập quyết định ngay', tab: 'decisions' } },
  { id: 'EV_GOLDEN', round: 2, tone: 'good', icon: '🌟', name: 'Biến cố: Cơ Hội Vàng', tag: 'BIẾN CỐ ĐẶC BIỆT',
    desc: 'Chính phủ vừa công bố gói kích cầu kinh tế và miễn thuế xuất khẩu. Đây là thời cơ để bứt phá doanh thu trên thị trường quốc tế.',
    demand: 1.35, costMul: 1.0, rdBoost: 1.5,
    impacts: [{ icon: '🧾', label: 'Thuế xuất khẩu', value: '0%', dir: 'down-good' }, { icon: '📦', label: 'Nhu cầu dự kiến', value: '+35%', dir: 'up' }],
    luminaImg: 'lumina-ao-dai-clap', luminaMsg: 'Thật tuyệt vời! CFO hãy rà soát lại ngân sách đầu tư, còn COO hãy chuẩn bị tăng công suất để đáp ứng làn sóng đơn hàng mới này nhé!',
    cta: { label: '🏭 Tăng công suất ngay', tab: 'decisions' } },
  { id: 'EV_PRICEWAR', round: 3, tone: 'warn', icon: '⚔️', name: 'Biến cố: Chiến Tranh Giá', tag: 'CẢNH BÁO THỊ TRƯỜNG',
    desc: 'Đối thủ giảm giá 15% điện rộng tại kênh Modern Trade — khách hàng cực nhạy cảm về giá trong vòng này.',
    demand: 1.0, costMul: 1.0, elasticityMul: 1.4,
    impacts: [{ icon: '🏷️', label: 'Giá đối thủ (kênh MT)', value: '-15%', dir: 'down' }, { icon: '💔', label: 'Độ nhạy giá của khách', value: 'CAO', dir: 'up-bad' }],
    luminaImg: 'lumina-vest-worried', luminaMsg: 'Thưa CMO, đối thủ vừa châm ngòi chiến tranh giá! Ta có 2 lối đi: chiến thuật Bundling hoặc tăng Value-Added — đừng lao vào giảm giá sâu kẻo mất biên lợi nhuận.',
    cta: { label: '🤖 Xem giải pháp từ Lumina', tab: 'advisor' } },
  { id: 'EV_RECESSION', round: 4, tone: 'bad', icon: '⚡', name: 'Khủng Hoảng Năng Lượng', tag: 'CẢNH BÁO KHẨN CẤP',
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
  { id: 'EV_EXPO', round: 6, tone: 'good', icon: '🌏', name: 'Hội Chợ Quốc Tế', tag: 'VÒNG CHUNG KẾT',
    desc: 'Cơ hội vàng ở vòng chung kết: hiệu quả marketing tăng 40%, nhu cầu quốc tế tăng mạnh.',
    demand: 1.1, costMul: 1.0, mktBoost: 1.4,
    impacts: [{ icon: '📣', label: 'Hiệu quả marketing', value: '+40%', dir: 'up' }, { icon: '🌏', label: 'Nhu cầu quốc tế', value: '+10%', dir: 'up' }],
    luminaImg: 'lumina-ao-dai-clap', luminaMsg: 'Vòng cuối rồi cả đội ơi! Đây là lúc dồn lực marketing để chốt vị trí dẫn đầu. Cả đội cùng bứt phá nhé!',
    cta: { label: '🚀 Bứt phá vòng cuối', tab: 'decisions' } },
];

const SHOP_ITEMS = [
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

/* ===== LUMINA ADVISOR PRO — kịch bản "Nếu — Thì" từ số liệu thực ===== */
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
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: `Nâng cấp Dây chuyền ${idx + 1} (-${cost}tr₫) — tiết kiệm 40% điện năng, OEE +5%` });
  return true;
}

function doMaintenance(s, cost = 60) {
  if (s.balance < cost) return false;
  s.balance -= cost;
  s.maintBonus += 3;
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: `Bảo trì định kỳ (-${cost}tr₫) — OEE +3%, giảm phế phẩm` });
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
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: 'CFO kích hoạt cắt giảm chi phí — chi phí cố định vòng sau -15%' });
  return true;
}

function brandingPremium(s, cost = 120) {
  if (s.balance < cost) return false;
  s.balance -= cost;
  s.brand = Math.min(1.6, s.brand + 0.08);
  s.maintenanceLog.push({ round: Math.min(s.round, ROUNDS_TOTAL), text: `CMO kích hoạt Branding Premium (-${cost}tr₫) — giá trị thương hiệu +`});
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

/** Chạy mô phỏng 1 vòng với quyết định của người chơi. */
function simulateRound(s, d) {
  const ev = currentEvent(s);
  const shielded = s.activeBoosts.includes('INS_SHIELD_01') && ev.tone === 'bad';
  const evEff = shielded ? MARKET_EVENTS[1] : ev;

  // --- Sức hấp dẫn của từng đội (attractiveness) ---
  const elasticity = PRICE_ELASTICITY * (evEff.elasticityMul || 1);
  let mktEff = d.marketing * (evEff.mktBoost || 1) * skillEffect(s, 'mktMul', 1);
  if (s.activeBoosts.includes('MKT_BOOST_01')) mktEff *= 1.3;

  const playerAttr = Math.pow(REF_PRICE / d.price, elasticity) * (1 + Math.sqrt(mktEff) / 18) * s.brand;

  const compDecisions = s.competitors.map(c => {
    const jitter = 0.9 + rng(s) * 0.25;
    let price = REF_PRICE, mkt = 55;
    if (c.style === 'aggressive') { price = 125 * jitter; mkt = 90 * jitter; }
    if (c.style === 'balanced')   { price = 150 * jitter; mkt = 60 * jitter; }
    if (c.style === 'premium')    { price = 195 * jitter; mkt = 75 * jitter; }
    const attr = Math.pow(REF_PRICE / price, elasticity) * (1 + Math.sqrt(mkt) / 18) * c.brand;
    return { c, price, mkt, attr };
  });

  const totalAttr = playerAttr + compDecisions.reduce((a, x) => a + x.attr, 0);
  const marketUnits = BASE_MARKET_UNITS * evEff.demand;

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
  let depreciation = s.machineCapacity * 0.02;                    // khấu hao theo công suất
  if ((s.items['OPS_LEAN_01'] || 0) > 0) depreciation *= 0.8;

  const revenue = sold * d.price / 1000;                          // triệu ₫
  const cogs = d.production * unitCost / 1000;
  const holding = s.inventory * 0.005;                            // phí lưu kho
  let fixedThisRound = FIXED_COST * evEff.costMul;
  if (s.costCutter) { fixedThisRound *= 0.85; s.costCutter = false; }
  const loanInterest = s.loan * 0.05;                              // lãi vay 5%/vòng
  const totalCost = cogs + d.marketing + d.rd + fixedThisRound + depreciation + holding + loanInterest;
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
  compDecisions.forEach(x => {
    const cRev = (marketUnits * x.attr / totalAttr) * x.price / 1000;
    const cProfit = cRev - (marketUnits * x.attr / totalAttr) * UNIT_COST * evEff.costMul / 1000 - x.mkt - FIXED_COST;
    x.c.profit += cProfit;
    x.c.share = 100 * x.attr / totalAttr;
    x.c.brand = Math.min(1.5, x.c.brand + x.mkt / 5000);
  });

  // --- Chỉ số vận hành (OEE, phế phẩm, tài chính) ---
  const overload = Math.max(0, d.production / s.machineCapacity - 0.9);
  s.oee = Math.round(clampNum(88 - (evEff.oeeHit || 0) - overload * 25 + s.maintBonus, 55, 96));
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
    fixed: fixedThisRound, holding, loanInterest,
    oee: s.oee, defect: s.defect, adEff: s.adEff, brandLoyalty: s.brandLoyalty,
    quickRatio: s.quickRatio, roi: s.roi, isNewPeak,
    xpGain, balance: s.balance,
  };
  s.history.push(report);

  // --- Thành tựu ---
  unlockAchievements(s, report);

  // --- Tiêu hao boost dùng 1 lần ---
  s.activeBoosts = [];

  s.committed = false;
  s.aiUsed = 0;
  s.minigamePlays = 0;
  if (s.round >= ROUNDS_TOTAL) s.finished = true;
  else s.round += 1;

  return report;
}

const ACHIEVEMENTS = [
  { id: 'A_FIRST',   icon: '🎉', name: 'Khởi nghiệp', desc: 'Hoàn thành vòng đầu tiên.', test: (s, r) => r.round === 1 },
  { id: 'A_PROFIT',  icon: '💎', name: 'Có lãi!', desc: 'Đạt lợi nhuận dương trong một vòng.', test: (s, r) => r.netProfit > 0 },
  { id: 'A_SHARE30', icon: '👑', name: 'Dẫn đầu thị trường', desc: 'Thị phần vượt 30%.', test: (s, r) => r.share >= 30 },
  { id: 'A_SURVIVE', icon: '🛟', name: 'Vượt bão khủng hoảng', desc: 'Có lãi trong vòng Khủng hoảng năng lượng.', test: (s, r) => r.event.id === 'EV_RECESSION' && r.netProfit > 0 },
  { id: 'A_RICH',    icon: '🏦', name: 'Két sắt đầy', desc: 'Số dư ví vượt 1 tỷ ₫.', test: (s, r) => s.balance >= 1000 },
  { id: 'A_FINISH',  icon: '📜', name: 'Tốt nghiệp BizOn', desc: 'Hoàn thành cả 6 vòng mô phỏng.', test: (s) => s.finished },
];

function unlockAchievements(s, r) {
  ACHIEVEMENTS.forEach(a => {
    if (!s.achievements.includes(a.id) && a.test(s, r)) s.achievements.push(a.id);
  });
}

/** Lumina AI — kịch bản "Nếu — Thì" theo dữ liệu vòng trước. */
function luminaAdvice(s, topic) {
  const last = s.history[s.history.length - 1];
  const ev = currentEvent(s);
  const fmt = n => n.toLocaleString('vi-VN');

  if (topic === 'pricing') {
    if (ev.elasticityMul) return { risk: 'high', text: `Vòng này là Chiến tranh giá — khách cực nhạy về giá. Nếu bạn giữ giá trên ${fmt(REF_PRICE)}k₫, thị phần có thể rơi mạnh. Cân nhắc giảm 10–15% và bù bằng sản lượng.` };
    if (last && last.lostSales > 0) return { risk: 'low', text: `Vòng trước bạn hụt ${fmt(last.lostSales)} đơn vì thiếu hàng — cầu đang vượt cung. Nếu tăng giá 5–10%, lợi nhuận biên sẽ cải thiện mà thị phần giảm không đáng kể.` };
    return { risk: 'medium', text: `Giá tham chiếu thị trường là ${fmt(REF_PRICE)}k₫. Nếu giảm 10% giá, mô hình dự báo thị phần tăng ~3–4 điểm nhưng biên lợi nhuận mỏng đi — chỉ nên làm khi sản lượng đủ lớn.` };
  }
  if (topic === 'marketing') {
    const boost = ev.mktBoost ? ` Đặc biệt vòng này hiệu quả marketing được cộng hưởng ${Math.round((ev.mktBoost - 1) * 100)}% nhờ ${ev.name}!` : '';
    const shareNow = last ? last.share.toFixed(1) : '25.0';
    return { risk: 'low', text: `Nếu tăng ngân sách Marketing thêm 15%, thị phần dự kiến đạt ${(parseFloat(shareNow) + 2.5).toFixed(1)}% ở vòng sau.${boost} Khuyến nghị: Marketing Boost, R&D Upgrade.` };
  }
  // risk
  if (ev.tone === 'bad') return { risk: 'high', text: `⚠️ Cảnh báo đỏ: ${ev.name} — ${ev.desc} Nếu không giữ ít nhất 15% vốn dự phòng, đội có thể âm dòng tiền. Cân nhắc mua "Khiên bảo hiểm" trong Cửa hàng.` };
  if (ev.tone === 'warn') return { risk: 'medium', text: `Rủi ro chính vòng này: ${ev.name}. ${ev.desc} Hãy điều chỉnh cơ cấu chi phí trước khi commit.` };
  return { risk: 'low', text: `Cơ hội xanh ngọc: ${ev.name}. ${ev.desc} Đây là lúc mạnh dạn đầu tư để bứt phá thị phần.` };
}
