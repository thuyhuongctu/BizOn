/* BizOn Bật Nghiệp 2026 — Engine mô phỏng 6 vòng (client-side)
 * Mô hình hóa theo hồ sơ kỹ thuật Stitch: decisions {price, marketing_budget,
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
  { id: 'EV_STABLE',    round: 1, tone: 'good', icon: '🌤️', name: 'Thị trường ổn định', desc: 'Vòng khởi động — nhu cầu thị trường ở mức chuẩn.', demand: 1.0, costMul: 1.0 },
  { id: 'EV_TECHBOOM',  round: 2, tone: 'good', icon: '🚀', name: 'Bùng nổ công nghệ', desc: 'Nhu cầu tăng 20%! Đầu tư R&D vòng này hiệu quả gấp rưỡi.', demand: 1.2, costMul: 1.0, rdBoost: 1.5 },
  { id: 'EV_PRICEWAR',  round: 3, tone: 'warn', icon: '⚔️', name: 'Chiến tranh giá', desc: 'Đối thủ đồng loạt giảm giá — khách hàng cực nhạy cảm về giá.', demand: 1.0, costMul: 1.0, elasticityMul: 1.4 },
  { id: 'EV_RECESSION', round: 4, tone: 'bad',  icon: '📉', name: 'Suy thoái kinh tế', desc: 'Tổng cầu giảm 30%, chi phí cố định tăng. Giữ dòng tiền an toàn!', demand: 0.7, costMul: 1.15, shake: true },
  { id: 'EV_SUPPLY',    round: 5, tone: 'warn', icon: '🚢', name: 'Đứt gãy chuỗi cung ứng', desc: 'Chi phí sản xuất mỗi đơn vị tăng 25% trong vòng này.', demand: 1.0, costMul: 1.25 },
  { id: 'EV_EXPO',      round: 6, tone: 'good', icon: '🌏', name: 'Hội chợ quốc tế', desc: 'Cơ hội vàng: hiệu quả marketing tăng 40% ở vòng chung kết.', demand: 1.1, costMul: 1.0, mktBoost: 1.4 },
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
  };
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
  const sold = Math.min(demandUnits, available);
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
  const totalCost = cogs + d.marketing + d.rd + FIXED_COST * evEff.costMul + depreciation + holding;
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

  const report = {
    round: s.round, event: ev, shielded,
    decisions: d,
    revenue, netProfit, share, sold, demandUnits, lostSales,
    inventory: s.inventory, depreciation, cogs, unitCost,
    marketing: d.marketing, rd: d.rd,
    fixed: FIXED_COST * evEff.costMul, holding,
    xpGain, balance: s.balance,
  };
  s.history.push(report);

  // --- Thành tựu ---
  unlockAchievements(s, report);

  // --- Tiêu hao boost dùng 1 lần ---
  s.activeBoosts = [];

  s.committed = false;
  s.aiUsed = 0;
  if (s.round >= ROUNDS_TOTAL) s.finished = true;
  else s.round += 1;

  return report;
}

const ACHIEVEMENTS = [
  { id: 'A_FIRST',   icon: '🎉', name: 'Khởi nghiệp', desc: 'Hoàn thành vòng đầu tiên.', test: (s, r) => r.round === 1 },
  { id: 'A_PROFIT',  icon: '💎', name: 'Có lãi!', desc: 'Đạt lợi nhuận dương trong một vòng.', test: (s, r) => r.netProfit > 0 },
  { id: 'A_SHARE30', icon: '👑', name: 'Dẫn đầu thị trường', desc: 'Thị phần vượt 30%.', test: (s, r) => r.share >= 30 },
  { id: 'A_SURVIVE', icon: '🛟', name: 'Vượt bão suy thoái', desc: 'Có lãi trong vòng Suy thoái.', test: (s, r) => r.event.id === 'EV_RECESSION' && r.netProfit > 0 },
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
