/* Hành trình 3 bậc «Từ Phù Sa ra Thế giới» – hộ chiếu hành trình và hành trang chuyển tiếp.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Thiết kế: docs/architecture/HANH-TRINH-3-BAC.md (mục 3 hộ chiếu, mục 4 công thức và trần, mục 8 model card).
 * Mô-đun thuần: không DOM, không mạng, không Math.random; chạy cả trình duyệt (window.BizOnJourney) lẫn Node (require).
 *
 * Ba quyết định đã chốt (26/10/2026):
 *   1. Biến thể Bậc 3 mặc định của hành trình là Hộ Chiếu Sầu Riêng ('durian'); Thương Hiệu ('brand') vẫn chọn được.
 *   2. Lớp chấm điểm: hành trang MẶC ĐỊNH TẮT (resolveCarryEnabled: cờ lớp journey_carry phải bật rõ ràng mới áp).
 *   3. Không cho bỏ qua bậc: chỉ chơi được bậc kế tiếp bậc đã xong (nextTier / canPlay). Ai muốn chơi riêng một bậc
 *      thì mở game đó như hiện nay, không qua hành trình.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnJourney = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCHEMA_VERSION = 1;
  const MODULE_VERSION = '2026-10-26';
  const TIERS = ['t1', 't2', 't3'];
  const STATUSES = ['pending', 'playing', 'done'];
  const VARIANTS = ['durian', 'brand'];
  const DEFAULT_T3_VARIANT = 'durian';

  // Tham số hành trang (model card, mục 8). Tiền: triệu ₫ ở Bậc 1–2, tỷ ₫ ở Bậc 3.
  const PARAMS = Object.freeze({
    T2_BALANCE0: 500,        // vốn khởi điểm Bật Nghiệp (triệu ₫) – STARTING_BALANCE trong js/engine.js
    T1_CASH_PER_EFF: 0.4,    // +0,4 triệu cho mỗi điểm hiệu quả Bến Phù Sa (0–100)
    T1_RANK1_BONUS: 10,      // +10 triệu nếu vô địch Bến Phù Sa
    T1_CASH_MAX: 50,         // trần +50 triệu (10 % của 500)
    T1_BRAND: 1.05,          // thương hiệu địa phương nếu hạng ≤ 2
    T1_BRAND_RANK_MAX: 2,
    T1_BRIEF_MIN_PAIRS: 3,   // ≥ 3 cặp món–địa điểm đã biết → mở sẵn bản tin thị trường vòng 1
    T2_CASH_CAP: 0.15,       // ±15 % vốn khởi điểm Bậc 3
    T2_REP_MAX: 5,
    T2_BRAND_SPAN: 0.5,      // brandEnd 1,0 → 1,5 trải đều 0 → +5 uy tín
    T2_RESIL_QUICK_MIN: 1.2, // quickRatio cuối ≥ 1,2 → +3 chống chịu
    T2_RESIL: 3,
    T2_CAPAB_MAX: 5,
    T2_CAPAB_PER_RD: 20,     // +1 năng lực mỗi 20 triệu R&D lũy kế (Thương Hiệu)
    T2_ADAPT_PER_RD: 20,     // +1 ứng phó biến cố mỗi 20 triệu R&D lũy kế (Sầu Riêng), trần +5
    T2_ADAPT_MAX: 5,
    T2_NET: 5,
    T2_LINKED: 0.05,
    T2_PROFITABLE_MIN: 4,    // ≥ 4/6 vòng có lãi → mối quan hệ sẵn ở Bậc 3
    T2_CREDIT_PENALTY: 1,    // Sầu Riêng: còn nợ cuối Bậc 2 → hạn mức tín dụng −1 tỷ
    BRAND_CASH0: 8,          // tỷ ₫ – brand-passport.html
    DURIAN_CASH0: 12,        // tỷ ₫ – lab/ho-chieu-sau-rieng-data.js params.cash0 (chưa cộng cashAdj theo vai)
    // Hai thị trường «gần nhất về khoảng cách tâm lý» của Hộ Chiếu Thương Hiệu (chỉ số trong MKTS của brand-passport.html):
    // 5 Tân Cảng (cửa ngõ khu vực) và 2 Kim Sa (khách trẻ, gần gu). Tạm định, chờ dữ liệu pilot; đổi ở đây là đủ.
    T2_NET_MARKETS: Object.freeze([5, 2]),
    T2_ROUNDS: 6,
    T1_WEEKS: 5
  });

  // ---------- tiện ích ----------
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const r2 = x => Math.round(x * 100) / 100;
  const text = (v, d = '') => (typeof v === 'string' ? v.trim().slice(0, 120) : d);
  const clone = v => JSON.parse(JSON.stringify(v));
  const slug = s => text(s).toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/Đ/g, 'D').replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'DOI';

  // ---------- hộ chiếu ----------
  function createPassport(input = {}) {
    const classCode = text(input.classCode, 'TU-HOC');
    const teamName = text(input.teamName, 'Đội của tôi');
    const createdAt = text(input.createdAt) || new Date().toISOString();
    const day = createdAt.slice(0, 10);
    const variant = VARIANTS.includes(input.variant) ? input.variant : DEFAULT_T3_VARIANT;
    return {
      schemaVersion: SCHEMA_VERSION,
      journeyId: text(input.journeyId) || `J-${slug(classCode)}-${slug(teamName)}-${day}`,
      classCode, teamName,
      seed: text(input.seed) || `${slug(classCode)}:${slug(teamName)}:journey-v${SCHEMA_VERSION}:j1`,
      createdAt, updatedAt: createdAt,
      carryEnabled: input.carryEnabled !== false,
      tiers: {
        t1: { status: 'pending' },
        t2: { status: 'pending' },
        t3: { status: 'pending', variant }
      },
      carry: {},
      summary: {}
    };
  }

  function validatePassport(p) {
    const errors = [];
    if (!p || typeof p !== 'object') return { valid: false, errors: ['not_object'] };
    if (p.schemaVersion !== SCHEMA_VERSION) errors.push('schema_version');
    if (!text(p.journeyId)) errors.push('journey_id');
    if (!p.tiers || typeof p.tiers !== 'object') errors.push('tiers');
    else TIERS.forEach(t => {
      const tier = p.tiers[t];
      if (!tier || !STATUSES.includes(tier.status)) errors.push('tier_status_' + t);
    });
    if (p.tiers && p.tiers.t3 && p.tiers.t3.variant && !VARIANTS.includes(p.tiers.t3.variant)) errors.push('t3_variant');
    // Không bỏ qua bậc: bậc sau không thể xong/đang chơi khi bậc trước chưa xong.
    if (p.tiers && p.tiers.t2 && p.tiers.t1 && p.tiers.t2.status !== 'pending' && p.tiers.t1.status !== 'done') errors.push('tier_order_t2');
    if (p.tiers && p.tiers.t3 && p.tiers.t2 && p.tiers.t3.status !== 'pending' && p.tiers.t2.status !== 'done') errors.push('tier_order_t3');
    if (p.carry && typeof p.carry !== 'object') errors.push('carry');
    return { valid: errors.length === 0, errors };
  }

  function parsePassport(raw) {
    let obj = raw;
    if (typeof raw === 'string') { try { obj = JSON.parse(raw); } catch (e) { return null; } }
    return validatePassport(obj).valid ? obj : null;
  }

  // Bậc kế tiếp: bậc 'pending' hoặc 'playing' đầu tiên; không nhảy cóc. Xong cả ba → null.
  function nextTier(p) {
    for (const t of TIERS) { const s = p && p.tiers && p.tiers[t] ? p.tiers[t].status : 'pending'; if (s !== 'done') return t; }
    return null;
  }
  function tierDone(p, t) { return !!(p && p.tiers && p.tiers[t] && p.tiers[t].status === 'done'); }
  function canPlay(p, t) {
    const i = TIERS.indexOf(t); if (i < 0) return false;
    if (tierDone(p, t)) return false;
    return i === 0 || tierDone(p, TIERS[i - 1]);
  }

  // Hành trang chỉ áp khi hộ chiếu bật VÀ lớp không tắt. Lớp chấm điểm (có mã lớp thật) mặc định TẮT:
  // classControls.journey_carry phải === true. Tự học (không mã lớp) theo cờ của hộ chiếu.
  function resolveCarryEnabled(p, classControls) {
    if (!p || p.carryEnabled === false) return false;
    const graded = !!(p.classCode && p.classCode !== 'TU-HOC' && p.classCode !== 'DEMO-2026');
    if (classControls && typeof classControls === 'object' && 'journey_carry' in classControls) return classControls.journey_carry === true;
    return !graded;
  }

  // ---------- ghi kết quả từng bậc ----------
  function stamp(p) { p.updatedAt = new Date().toISOString(); return p; }

  // Bến Phù Sa: S = { total, result:{eff, rank}, history[{w,m,menu,loc,net}], knownPairs{'menu-loc':true} };
  // m theo METHODS của ben-phu-sa.html: 0 ghe hàng bông (nhân rộng) · 1 gánh hàng rong (thử nghiệm) · 2 khảo sát chợ.
  function recordTier1(p, S, meta = {}) {
    const q = clone(p); const h = Array.isArray(S.history) ? S.history : [];
    const res = S.result || {};
    const style = { exploreWeeks: h.filter(w => w.m === 1).length, exploitWeeks: h.filter(w => w.m === 0).length, surveyWeeks: h.filter(w => w.m === 2).length };
    const knownPairs = Array.isArray(S.knownPairs) ? S.knownPairs.slice() : Object.keys(S.knownPairs || {}).filter(k => S.knownPairs[k]);
    q.tiers.t1 = {
      status: 'done', appVersion: text(meta.appVersion, 'bizon-bps-v1'), finishedAt: text(meta.finishedAt) || new Date().toISOString(), explain: text(meta.explain, 'shown'),
      total: r2(num(S.total)), eff: clamp(Math.round(num(res.eff)), 0, 100), rank: clamp(Math.round(num(res.rank, 4)), 1, 4),
      weeks: h.map(w => ({ w: num(w.w), m: num(w.m), menu: w.menu == null ? null : num(w.menu), loc: w.loc == null ? null : num(w.loc), net: r2(num(w.net)) })),
      knownPairs, style
    };
    q.carry.t2 = journeyCarry(q, 't2').applied;
    q.summary = summarize(q);
    return stamp(q);
  }

  // Bật Nghiệp: s từ js/engine.js (balance, history[{netProfit, share, oee, whatIfUsed?}], brand, quickRatio, loan, rdCumulative, caseId).
  function recordTier2(p, s, meta = {}) {
    const q = clone(p); const h = Array.isArray(s.history) ? s.history : []; const last = h[h.length - 1] || {};
    q.tiers.t2 = {
      status: 'done', appVersion: text(meta.appVersion, 'bizon-bn-v2'), finishedAt: text(meta.finishedAt) || new Date().toISOString(), explain: text(meta.explain, 'shown'),
      balanceEnd: Math.round(num(s.balance)), netProfitTotal: Math.round(h.reduce((a, r) => a + num(r.netProfit), 0)),
      shareEnd: r2(num(last.share)), oeeEnd: Math.round(num(last.oee, num(s.oee))), quickRatioEnd: r2(num(s.quickRatio, 1)),
      brandEnd: r2(num(s.brand, 1)), loanEnd: Math.round(num(s.loan)), rdCumulative: Math.round(num(s.rdCumulative)),
      profitableRounds: h.filter(r => num(r.netProfit) > 0).length,
      whatIfRounds: num(meta.whatIfRounds, h.filter(r => num(r.whatIfUsed) > 0).length),
      caseId: text(s.caseId, 'A')
    };
    q.carry.t3 = journeyCarry(q, 't3', { variant: q.tiers.t3.variant, roleId: q.tiers.t3.roleId, cashAdj: meta.cashAdj }).applied;
    q.summary = summarize(q);
    return stamp(q);
  }

  // Hộ Chiếu: variant 'brand' (S của brand-passport, điểm BPCore.scoreOf) hoặc 'durian' (summary() của engine Sầu Riêng).
  function recordTier3(p, variant, result, meta = {}) {
    const q = clone(p); const v = VARIANTS.includes(variant) ? variant : q.tiers.t3.variant || DEFAULT_T3_VARIANT;
    const t3 = { status: 'done', variant: v, appVersion: text(meta.appVersion, v === 'brand' ? 'bizon-bp-v2' : 'bizon-srp-v2'), finishedAt: text(meta.finishedAt) || new Date().toISOString(), explain: text(meta.explain, 'shown'),
      carryApplied: q.carry.t3 || {}, total: r2(num(result.total)) };
    if (v === 'brand') {
      t3.entered = Array.isArray(result.entered) ? result.entered.map(x => (x == null ? null : num(x))) : [];
      t3.cashEnd = r2(num(result.cash)); t3.repEnd = Math.round(num(result.rep));
    } else {
      t3.roleId = text(meta.roleId || result.roleId || q.tiers.t3.roleId, '');
      t3.parts = result.parts ? clone(result.parts) : {}; t3.cashEnd = r2(num(result.cash)); t3.badges = Array.isArray(result.badges) ? result.badges.slice() : [];
      t3.channelOrder = Array.isArray(result.channelOrder) ? result.channelOrder.slice() : (Array.isArray(result.channelsUsed) ? result.channelsUsed.slice() : []);
    }
    q.tiers.t3 = t3; q.summary = summarize(q);
    return stamp(q);
  }

  function setTier3Variant(p, variant, roleId) {
    const q = clone(p); if (q.tiers.t3.status === 'done') return q;
    q.tiers.t3.variant = VARIANTS.includes(variant) ? variant : DEFAULT_T3_VARIANT; if (roleId) q.tiers.t3.roleId = text(roleId);
    if (tierDone(q, 't2')) q.carry.t3 = journeyCarry(q, 't3', { variant: q.tiers.t3.variant, roleId: q.tiers.t3.roleId }).applied;
    return stamp(q);
  }

  // ---------- hành trang ----------
  const EMPTY = tier => ({ tier, enabled: false, empty: true, applied: {}, lines: [] });
  const line = (key, value, vi, en) => ({ key, value, vi, en });

  // journeyCarry(passport, 't2' | 't3', { variant, roleId, cashAdj, enabled }) → { tier, enabled, empty, applied, lines }
  // Tất định: cùng hộ chiếu (và cùng tùy chọn) → cùng kết quả. Chỉ tính từ bậc liền trước đã 'done'.
  function journeyCarry(p, tier, opts = {}) {
    if (!p || !p.tiers) return EMPTY(tier);
    const enabled = opts.enabled === undefined ? p.carryEnabled !== false : !!opts.enabled;
    if (tier === 't2') return carryT2(p, enabled);
    if (tier === 't3') return carryT3(p, enabled, opts);
    return EMPTY(tier);
  }

  function carryT2(p, enabled) {
    const t1 = p.tiers.t1; if (!t1 || t1.status !== 'done') return EMPTY('t2');
    const P = PARAMS, eff = clamp(num(t1.eff), 0, 100), rank = clamp(num(t1.rank, 4), 1, 4), pairs = Array.isArray(t1.knownPairs) ? t1.knownPairs.length : 0;
    const bonus = clamp(Math.round(P.T1_CASH_PER_EFF * eff) + (rank === 1 ? P.T1_RANK1_BONUS : 0), 0, P.T1_CASH_MAX);
    const brand = rank <= P.T1_BRAND_RANK_MAX ? P.T1_BRAND : 1;
    const brief = pairs >= P.T1_BRIEF_MIN_PAIRS;
    const applied = { balanceBonus: bonus, balance: P.T2_BALANCE0 + bonus, brand, marketBrief: brief };
    const lines = [
      line('balance', bonus, `Hiệu quả ${eff}/100 ở Bến Phù Sa${rank === 1 ? ' + vô địch' : ''} → vốn khởi điểm ${P.T2_BALANCE0 + bonus} triệu ₫ (+${bonus}, trần +${P.T1_CASH_MAX})`,
        `Efficiency ${eff}/100 at Bến Phù Sa${rank === 1 ? ' + champion' : ''} → starting capital ${P.T2_BALANCE0 + bonus}m ₫ (+${bonus}, cap +${P.T1_CASH_MAX})`),
      line('brand', brand, rank <= P.T1_BRAND_RANK_MAX ? `Hạng ${rank} ở chợ nổi → thương hiệu địa phương ×${brand}` : `Hạng ${rank} ở chợ nổi → thương hiệu khởi điểm ×1,00 (cần hạng ≤ ${P.T1_BRAND_RANK_MAX})`,
        rank <= P.T1_BRAND_RANK_MAX ? `Rank ${rank} at the floating market → local brand ×${brand}` : `Rank ${rank} at the floating market → starting brand ×1.00 (needs rank ≤ ${P.T1_BRAND_RANK_MAX})`),
      line('marketBrief', brief, brief ? `Đã biết ${pairs} cặp món–địa điểm → mở sẵn bản tin thị trường vòng 1 (thông tin, không tiền)` : `Mới biết ${pairs} cặp món–địa điểm (cần ${P.T1_BRIEF_MIN_PAIRS}) → chưa có bản tin thị trường`,
        brief ? `${pairs} dish–place pairs known → round-1 market brief unlocked (information, not money)` : `Only ${pairs} dish–place pairs known (needs ${P.T1_BRIEF_MIN_PAIRS}) → no market brief`)
    ];
    return { tier: 't2', enabled, empty: !enabled, applied: enabled ? applied : {}, lines: enabled ? lines : [], preview: applied };
  }

  function carryT3(p, enabled, opts) {
    const t2 = p.tiers.t2; if (!t2 || t2.status !== 'done') return EMPTY('t3');
    const P = PARAMS, variant = VARIANTS.includes(opts.variant) ? opts.variant : (p.tiers.t3 && VARIANTS.includes(p.tiers.t3.variant) ? p.tiers.t3.variant : DEFAULT_T3_VARIANT);
    const bal = num(t2.balanceEnd, P.T2_BALANCE0), k = clamp((bal - P.T2_BALANCE0) / P.T2_BALANCE0, -P.T2_CASH_CAP, P.T2_CASH_CAP), cashMul = r2(1 + k);
    const rep = Math.round(P.T2_REP_MAX * clamp((num(t2.brandEnd, 1) - 1) / P.T2_BRAND_SPAN, 0, 1));
    const quickOk = num(t2.quickRatioEnd, 1) >= P.T2_RESIL_QUICK_MIN, debt = num(t2.loanEnd) > 0;
    const resil = (quickOk ? P.T2_RESIL : 0) + (debt ? -P.T2_RESIL : 0);
    const prof = num(t2.profitableRounds), linked = prof >= P.T2_PROFITABLE_MIN, rd = num(t2.rdCumulative);
    const cash0 = variant === 'brand' ? P.BRAND_CASH0 : P.DURIAN_CASH0 + num(opts.cashAdj);
    const applied = { variant, cashMul, cash0: r2(cash0), cash: r2(cash0 * cashMul), rep, resil };
    const lines = [
      line('cash', cashMul, `Kết thúc Bật Nghiệp với ${bal} triệu ₫ (vốn ${P.T2_BALANCE0}) → vốn Bậc 3 ×${cashMul.toFixed(2)} = ${r2(cash0 * cashMul)} tỷ ₫ (trần ±${P.T2_CASH_CAP * 100} %)`,
        `Finished Bật Nghiệp with ${bal}m ₫ (capital ${P.T2_BALANCE0}) → level-3 cash ×${cashMul.toFixed(2)} = ${r2(cash0 * cashMul)}bn ₫ (cap ±${P.T2_CASH_CAP * 100}%)`),
      line('rep', rep, `Thương hiệu cuối ${num(t2.brandEnd, 1).toFixed(2)} → uy tín +${rep} (tối đa +${P.T2_REP_MAX})`, `Final brand ${num(t2.brandEnd, 1).toFixed(2)} → reputation +${rep} (max +${P.T2_REP_MAX})`),
      line('resil', resil, `Quick ratio ${num(t2.quickRatioEnd, 1).toFixed(2)}${quickOk ? ' ≥ ' + P.T2_RESIL_QUICK_MIN + ' → +' + P.T2_RESIL : ''}${debt ? ', còn nợ ' + num(t2.loanEnd) + ' triệu → −' + P.T2_RESIL : ''} → chống chịu ${resil >= 0 ? '+' : ''}${resil}`,
        `Quick ratio ${num(t2.quickRatioEnd, 1).toFixed(2)}${quickOk ? ' ≥ ' + P.T2_RESIL_QUICK_MIN + ' → +' + P.T2_RESIL : ''}${debt ? ', ' + num(t2.loanEnd) + 'm still owed → −' + P.T2_RESIL : ''} → resilience ${resil >= 0 ? '+' : ''}${resil}`)
    ];
    if (variant === 'brand') {
      const capab = Math.min(P.T2_CAPAB_MAX, Math.round(rd / P.T2_CAPAB_PER_RD));
      applied.capab = capab; applied.net = linked ? P.T2_NET_MARKETS.map(i => ({ market: i, add: P.T2_NET })) : [];
      lines.push(line('capab', capab, `R&D lũy kế ${rd} triệu → năng lực +${capab} (tối đa +${P.T2_CAPAB_MAX})`, `Cumulative R&D ${rd}m → capability +${capab} (max +${P.T2_CAPAB_MAX})`));
      lines.push(line('net', linked ? P.T2_NET : 0, linked ? `${prof}/${P.T2_ROUNDS} vòng có lãi → vị thế mạng lưới +${P.T2_NET} ở hai thị trường gần nhất` : `${prof}/${P.T2_ROUNDS} vòng có lãi (cần ${P.T2_PROFITABLE_MIN}) → chưa có mối quan hệ sẵn`,
        linked ? `${prof}/${P.T2_ROUNDS} profitable rounds → network position +${P.T2_NET} in the two nearest markets` : `${prof}/${P.T2_ROUNDS} profitable rounds (needs ${P.T2_PROFITABLE_MIN}) → no ready-made ties`));
    } else {
      // Không chuyển tài sản kiểm nghiệm: quét cân bằng (test/journey-balance.test.js) cho thấy một bậc kiểm nghiệm là mở khóa
      // kênh (Nhật Bản, kiểm toán, rủi ro gian lận) → lệch tới +42 điểm. R&D Bậc 2 thành «ứng phó biến cố» liên tục, có trần.
      const adapt = Math.min(P.T2_ADAPT_MAX, Math.round(rd / P.T2_ADAPT_PER_RD));
      applied.adapt = adapt; applied.linkedBonus = linked ? P.T2_LINKED : 0; applied.creditLimitAdj = debt ? -P.T2_CREDIT_PENALTY : 0;
      lines.push(line('adapt', adapt, `R&D lũy kế ${rd} triệu → ứng phó biến cố +${adapt} (tối đa +${P.T2_ADAPT_MAX})`, `Cumulative R&D ${rd}m → event response +${adapt} (max +${P.T2_ADAPT_MAX})`));
      lines.push(line('linkedBonus', applied.linkedBonus, linked ? `${prof}/${P.T2_ROUNDS} vòng có lãi → một hợp đồng liên kết nhỏ (+${P.T2_LINKED * 100} % vùng trồng liên kết)` : `${prof}/${P.T2_ROUNDS} vòng có lãi (cần ${P.T2_PROFITABLE_MIN}) → chưa có hợp đồng liên kết`,
        linked ? `${prof}/${P.T2_ROUNDS} profitable rounds → a small linked-farm contract (+${P.T2_LINKED * 100}% linked supply)` : `${prof}/${P.T2_ROUNDS} profitable rounds (needs ${P.T2_PROFITABLE_MIN}) → no linked contract`));
      if (debt) lines.push(line('creditLimit', -P.T2_CREDIT_PENALTY, `Còn nợ cuối Bậc 2 → hạn mức tín dụng −${P.T2_CREDIT_PENALTY} tỷ ₫`, `Debt left at the end of level 2 → credit limit −${P.T2_CREDIT_PENALTY}bn ₫`));
    }
    return { tier: 't3', enabled, empty: !enabled, applied: enabled ? applied : {}, lines: enabled ? lines : [], preview: applied };
  }

  // ---------- áp hành trang vào trạng thái khởi đầu (không chạm công thức mô phỏng) ----------
  function applyToTier2(state, carry) {
    const s = state; const a = carry && carry.applied ? carry.applied : carry; if (!a || !Object.keys(a).length) return s;
    if (Number.isFinite(a.balance)) s.balance = a.balance;
    if (Number.isFinite(a.brand)) s.brand = r2(num(s.brand, 1) * a.brand);
    s.journey = Object.assign({}, s.journey, { marketBrief: !!a.marketBrief, carryApplied: clone(a) });
    return s;
  }
  function applyToBrand(S, carry) {
    const a = carry && carry.applied ? carry.applied : carry; if (!a || !Object.keys(a).length) return S;
    if (Number.isFinite(a.cash)) S.cash = a.cash;
    S.rep = clamp(num(S.rep, 50) + num(a.rep), 0, 100); S.resil = clamp(num(S.resil, 50) + num(a.resil), 0, 100); S.capab = clamp(num(S.capab, 40) + num(a.capab), 0, 100);
    if (Array.isArray(a.net) && Array.isArray(S.net)) a.net.forEach(n => { if (S.net[n.market] != null) S.net[n.market] = clamp(num(S.net[n.market]) + num(n.add), 0, 100); });
    S.journey = Object.assign({}, S.journey, { carryApplied: clone(a) });
    return S;
  }
  function applyToDurian(state, carry) {
    const a = carry && carry.applied ? carry.applied : carry; if (!a || !Object.keys(a).length) return state;
    if (Number.isFinite(a.cash)) state.cash = a.cash;
    state.rep = clamp(num(state.rep, 50) + num(a.rep), 0, 100); state.resil = clamp(num(state.resil, 50) + num(a.resil), 0, 100);
    state.adapt = clamp(num(state.adapt, 40) + num(a.adapt), 0, 100);
    if (a.linkedBonus) state.linkedBonus = r2(num(state.linkedBonus) + a.linkedBonus);
    state.journey = Object.assign({}, state.journey, { creditLimitAdj: num(a.creditLimitAdj), carryApplied: clone(a) });
    return state;
  }

  // ---------- chỉ số nghiên cứu (không vào điểm) ----------
  // Thương Hiệu: hai thị trường gần (T2_NET_MARKETS) vào trước → near-first; thị trường xa vào đầu → leapfrog.
  // Sầu Riêng: kênh đầu tiên mở là nội địa/biên mậu → near-first; chính ngạch/đông lạnh xuất khẩu ngay → leapfrog.
  const DURIAN_NEAR = ['DOM', 'BORDER'];   // id kênh trong lab/ho-chieu-sau-rieng-data.js: DOM, BORDER, CN, FROZEN, TW, JP
  function summarize(p) {
    const out = {}; const t1 = p.tiers && p.tiers.t1, t2 = p.tiers && p.tiers.t2, t3 = p.tiers && p.tiers.t3;
    if (t1 && t1.status === 'done' && t1.style) out.effectuationIndex = r2(clamp((num(t1.style.exploreWeeks) + num(t1.style.surveyWeeks)) / PARAMS.T1_WEEKS, 0, 1));
    if (t2 && t2.status === 'done') out.causationIndex = r2(clamp(num(t2.whatIfRounds) / PARAMS.T2_ROUNDS, 0, 1));
    if (t3 && t3.status === 'done') {
      let order = [];
      if (t3.variant === 'brand' && Array.isArray(t3.entered)) {
        order = t3.entered.map((q, i) => (q == null ? null : [q, i])).filter(Boolean).sort((a, b) => a[0] - b[0]).map(x => x[1]);
        out.intlPattern = pattern(order, i => PARAMS.T2_NET_MARKETS.includes(i));
      } else if (Array.isArray(t3.channelOrder)) {
        order = t3.channelOrder; out.intlPattern = pattern(order, id => DURIAN_NEAR.includes(String(id).toUpperCase()));
      }
    }
    return out;
  }
  function pattern(order, isNear) {
    if (!order.length) return 'none';
    const first = isNear(order[0]), second = order.length > 1 ? isNear(order[1]) : first;
    if (first && second) return 'near-first';
    if (!first) return 'leapfrog';
    return 'mixed';
  }

  return Object.freeze({
    SCHEMA_VERSION, MODULE_VERSION, TIERS, STATUSES, VARIANTS, DEFAULT_T3_VARIANT, PARAMS,
    createPassport, validatePassport, parsePassport, nextTier, canPlay, tierDone, resolveCarryEnabled,
    recordTier1, recordTier2, recordTier3, setTier3Variant,
    journeyCarry, applyToTier2, applyToBrand, applyToDurian, summarize
  });
});
