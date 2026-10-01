/* Nhà máy FDI – lõi mô phỏng tất định
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Cùng hạt giống + cùng quyết định → cùng kết quả (để chấm điểm và tái lập).
 * Không dùng Math.random, không gọi mạng, không đụng DOM.
 *
 * Mỗi quý người chơi chọn:
 *   local   – tỷ lệ đầu vào mua trong nước (0 … maxLocal)
 *   alloc   – tỷ trọng sản lượng chào bán cho từng thị trường (tự chuẩn hóa về tổng 1)
 *   invest  – tiền đầu tư phát triển nhà cung cấp trong nước (USD), có tác dụng từ quý sau
 */
(function (root) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFrom(text) {
    let h = 2166136261;
    for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function newGame(data, industryId, seed) {
    if (!data.industries[industryId]) throw new Error('Ngành không hợp lệ: ' + industryId);
    return { industryId, seed: seed >>> 0, quarter: 1, supplierCum: 0, history: [] };
  }

  function normalizeAlloc(alloc, markets) {
    const raw = markets.map(m => Math.max(0, Number(alloc[m.id]) || 0));
    const sum = raw.reduce((a, b) => a + b, 0);
    const out = {};
    markets.forEach((m, i) => { out[m.id] = sum > 0 ? raw[i] / sum : 1 / markets.length; });
    return out;
  }

  // Thuế áp cho thị trường m trong quý: MFN hoặc ưu đãi FTA (nếu đạt quy tắc xuất xứ) + thuế sự kiện
  function tariffFor(m, ev, local) {
    let rate = (m.roo !== null && local >= m.roo) ? m.pref : m.mfn;
    if (ev.tariff && ev.tariff[m.id]) rate += ev.tariff[m.id];
    if (ev.transship && ev.transship.market === m.id && local < ev.transship.threshold) rate = Math.max(rate, ev.transship.rate);
    return rate;
  }

  // Tính một quý; trả về trạng thái mới (không sửa trạng thái cũ).
  function playQuarter(data, state, decision) {
    if (state.quarter > data.events.length) throw new Error('Trò chơi đã kết thúc');
    const ind = data.industries[state.industryId];
    const ev = data.events[state.quarter - 1];
    const local = Math.min(Math.max(Number(decision.local) || 0, 0), ind.maxLocal);
    const invest = Math.max(0, Number(decision.invest) || 0);
    const alloc = normalizeAlloc(decision.alloc || {}, data.markets);
    const rnd = mulberry32(state.seed + state.quarter * 7919);

    const premium = ind.localPremium * Math.exp(-state.supplierCum / ind.supplierScale);
    const disruption = ev.disruption || 0;
    const importFreight = ev.importFreight || 0;
    const produced = ind.capacity * (1 - disruption * (1 - local));

    const byMarket = data.markets.map(m => {
      const noise = 1 + 0.05 * (2 * rnd() - 1);
      const demand = ind.capacity * m.share * ((ev.demand && ev.demand[m.id]) || 1) * noise;
      const offered = produced * alloc[m.id];
      const sold = Math.min(offered, demand);
      const price = ind.price * m.priceMult * (1 - ((ev.priceCut && ev.priceCut[m.id]) || 0));
      const tariff = tariffFor(m, ev, local);
      const revenue = sold * price * (1 - tariff);
      return { id: m.id, offered, demand, sold, price, tariff, revenue, unsold: offered - sold };
    });

    const sold = byMarket.reduce((s, r) => s + r.sold, 0);
    const exportsV = byMarket.reduce((s, r) => s + r.revenue, 0);
    const imports = produced * ind.material * (1 - local) * (1 + importFreight);
    const localPurchases = produced * ind.material * local * (1 + premium);
    const otherCost = produced * ind.other;
    const salvageRev = byMarket.reduce((s, r) => s + r.unsold, 0) * ind.price * (data.salvage || 0);
    const profit = exportsV + salvageRev - imports - localPurchases - otherCost - invest;
    const dva = exportsV - imports;

    const result = {
      quarter: state.quarter, eventVi: ev.vi, eventEn: ev.en,
      decision: { local, invest, alloc },
      premium, produced, sold, unsold: produced - sold,
      exports: exportsV, salvage: salvageRev, imports, localPurchases, otherCost, profit,
      dva, dvaRatio: exportsV > 0 ? dva / exportsV : 0,
      byMarket
    };
    return {
      industryId: state.industryId, seed: state.seed,
      quarter: state.quarter + 1,
      supplierCum: state.supplierCum + invest,
      history: state.history.concat([result])
    };
  }

  function summary(state) {
    const h = state.history;
    const sum = k => h.reduce((s, r) => s + r[k], 0);
    const exportsV = sum('exports'), imports = sum('imports');
    const badges = [];
    const dvaRatio = exportsV > 0 ? (exportsV - imports) / exportsV : 0;
    if (h.length && h.every(r => r.profit >= 0)) badges.push('resilient');
    if (dvaRatio >= 0.45) badges.push('upgrader');
    else if (dvaRatio < 0.30) badges.push('assembler');
    if (h.some(r => r.byMarket.some(m => m.id === 'US' && m.tariff >= 0.40 && m.sold > 0))) badges.push('transship_flag');
    return {
      quarters: h.length, profit: sum('profit'), exports: exportsV, imports,
      dva: exportsV - imports, dvaRatio, invest: h.reduce((s, r) => s + r.decision.invest, 0),
      lossQuarters: h.filter(r => r.profit < 0).length, badges
    };
  }

  // Nhật ký quyết định theo các trường của js/decision-log.js (chưa gắn cổng đồng thuận):
  // chỉ dùng để người chơi tự tải về; không gửi đi đâu.
  function decisionLog(state, meta) {
    return state.history.map(r => ({
      round: r.quarter,
      pillar: 'nha-may-fdi',
      scenario_pack: 'fdi-factory-mvp-v1',
      cohort_id: (meta && meta.cohort) || 'local',
      decision: r.decision,
      result_after: { exports: r.exports, imports: r.imports, profit: r.profit, dva_ratio: r.dvaRatio },
      seed: state.seed
    }));
  }

  const api = { mulberry32, seedFrom, newGame, normalizeAlloc, tariffFor, playQuarter, summary, decisionLog };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FactoryEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
