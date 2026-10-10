/* Hộ Chiếu Sầu Riêng – lõi mô phỏng tất định
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Cùng hạt giống + cùng quyết định → cùng kết quả. Không dùng Math.random, không gọi mạng, không đụng DOM.
 *
 * Mỗi vụ người chơi chọn:
 *   priority   – 1 ưu tiên đầu tư (area | pack | test | trace | freezer | finance)
 *   linked     – tỷ lệ mua từ vùng trồng liên kết có mã số (0…1; HTX tự trồng thì bỏ qua)
 *   induce     – có xử lý ra hoa nghịch vụ không (chỉ HTX, chỉ vụ nghịch)
 *   alloc      – tỷ trọng sản lượng cho từng kênh (tự chuẩn hóa)
 *   intel      – danh sách nguồn tin đã mua (tối đa 2)
 *   option     – chỉ số phương án phản ứng biến cố của vụ
 * Đơn vị: khối lượng tấn · giá nghìn đồng/kg · tiền tỷ đồng (tấn × nghìn đ/kg ÷ 1000 = tỷ đ).
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
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const bn = (tons, kdPerKg) => tons * kdPerKg / 1000;   // tấn × nghìn đ/kg → tỷ đ

  function newGame(data, roleId, seed) {
    const r = data.roles[roleId];
    if (!r) throw new Error('Vai chơi không hợp lệ: ' + roleId);
    return {
      roleId, seed: seed >>> 0, n: 1,
      cash: data.params.cash0 + (r.cashAdj || 0),
      assets: { area: r.areaCode, pack: r.packCode, test: 0, trace: false, freezer: r.freezer },
      pending: {},                 // tài sản có hiệu lực từ vụ sau
      suspendedUntil: 0,           // mã bị tạm dừng đến hết vụ này
      cleanCN: 0,                  // số vụ chính ngạch không vi phạm (2% → 1%)
      linkedBonus: 0,              // hợp đồng bao tiêu từ biến cố
      treeHealth: 100,
      rep: 50, adapt: 40, sus: 60, resil: 50,
      usedEvents: [], history: []
    };
  }

  // Biến cố của vụ n: rút tất định từ hạt giống, không lặp, lọc theo vai và mùa
  function eventFor(data, state) {
    const s = data.seasons[state.n - 1];
    const role = data.roles[state.roleId];
    const pool = data.events.filter(e => !state.usedEvents.includes(e.id)
      && (!e.onlySeason || e.onlySeason === s.season)
      && (!e.onlyBuyers || !role.ownFarm));
    const rnd = mulberry32(state.seed + state.n * 104729);
    return pool[Math.floor(rnd() * pool.length)] || null;
  }

  // Giá vựa (nghìn đ/kg) trước biến cố, có nhiễu ±8% theo hạt giống
  function depotPrice(data, state) {
    const s = data.seasons[state.n - 1], P = data.params;
    const rnd = mulberry32(state.seed + state.n * 7919);
    const noise = 1 + 0.08 * (2 * rnd() - 1);
    return P.depotMain * (s.season === 'off' ? P.offMult : 1) * s.demand * noise;
  }

  // Giá vựa «công khai» không nhiễu: mức người chơi ước được khi chưa mua tin
  function basePrice(data, state) {
    const s = data.seasons[state.n - 1], P = data.params;
    return P.depotMain * (s.season === 'off' ? P.offMult : 1) * s.demand;
  }

  // Dự báo «Nếu – Thì»: giá vựa ước tính = trung bình các nguồn tin đã mua (chưa mua thì dùng giá công khai)
  function forecast(data, state, decision) {
    const sig = intelSignals(data, state, (decision && decision.intel) || []);
    const est = sig.length ? sig.reduce((x, y) => x + y.price, 0) / sig.length : basePrice(data, state);
    const next = playSeason(data, state, decision, { expected: true, depotEstimate: est });
    const r = next.history[next.history.length - 1];
    return { depotEstimate: est, profit: r.profit, revenue: r.revenue, pBlockCN: r.pBlockCN, pLossJP: r.pLossJP,
      cashAfter: next.cash, rep: next.rep, adapt: next.adapt, sus: next.sus, audit: r.audit, byChannel: r.byChannel };
  }

  // Ba đối thủ AI: chơi cùng vai, cùng lõi mô phỏng, theo chiến lược cố định và hạt giống riêng (tất định)
  function rivalDecision(data, rival, state, ev) {
    const owned = id => (id === 'area' && state.assets.area) || (id === 'pack' && state.assets.pack)
      || (id === 'trace' && state.assets.trace) || (id === 'freezer' && state.assets.freezer) || (id === 'test' && state.assets.test >= 2);
    const want = rival.plan[state.n - 1] || 'finance';
    const priority = owned(want) ? (rival.plan.find(p => !owned(p)) || 'finance') : want;
    let option = 0;
    if (ev && rival.options && rival.options[ev.id] !== undefined) option = rival.options[ev.id];
    return { priority, linked: rival.linked, induce: rival.induce !== false, alloc: rival.alloc, intel: [], option };
  }
  // Chọn 3 đối thủ cho ván: mỗi nhóm chiến lược một người, tất định theo hạt giống
  function pickRivals(data, seed) {
    const groups = data.rivalGroups || [];
    if (!groups.length) return (data.rivals || []).slice(0, 3);
    const rnd = mulberry32((seed ^ 0x5EED) >>> 0);
    return groups.map(g => { const pool = data.rivals.filter(r => r.group === g); return pool[Math.floor(rnd() * pool.length)]; }).filter(Boolean);
  }
  function rivalsRun(data, roleId, seed) {
    return pickRivals(data, seed).map(rv => {
      let st = newGame(data, roleId, (seed ^ seedFrom(rv.id)) >>> 0);
      while (st.n <= data.seasons.length) st = playSeason(data, st, rivalDecision(data, rv, st, eventFor(data, st)));
      return { id: rv.id, state: st };
    });
  }

  // Cờ của vụ n: đội thắng nếu lợi nhuận vụ ≥ đối thủ AI cao nhất
  function flagFor(rivals, playerResult) {
    const n = playerResult.n;
    let best = null;
    rivals.forEach(r => { const h = r.state.history[n - 1]; if (h && (!best || h.profit > best.profit)) best = { id: r.id, profit: h.profit }; });
    return { n, win: !best || playerResult.profit >= best.profit, rival: best };
  }

  // Dự báo giá từ các nguồn tin (để giao diện hiển thị trước khi quyết định)
  function intelSignals(data, state, ids) {
    const p = depotPrice(data, state);
    const ev = eventFor(data, state);
    return (ids || []).map(id => {
      const src = data.intel.find(x => x.id === id);
      if (!src) return null;
      const rnd = mulberry32(state.seed + state.n * 31 + id.length * 977);
      const est = p * (1 + src.bias + src.noise * (2 * rnd() - 1));
      const out = { id, price: est };
      if (src.reveals === 'risk') out.risk = riskLevel(data, state, ev);
      return out;
    }).filter(Boolean);
  }

  function riskLevel(data, state, ev) {
    const s = data.seasons[state.n - 1];
    let lvl = s.cadmium ? 2 : 1;
    if (ev && (ev.id === 'residue' || ev.id === 'pest')) lvl += 1;
    return clamp(lvl - state.assets.test, 0, 3);   // 0 thấp … 3 rất cao
  }

  function eligible(data, state, ch) {
    const a = state.assets, s = data.seasons[state.n - 1];
    if (ch.id === 'CN') return a.area && a.pack && state.suspendedUntil < state.n;
    if (ch.id === 'FROZEN') return a.freezer;
    if (ch.id === 'JP') return a.test >= 1;
    if (ch.id === 'BORDER') return (s.borderCut || 0) < 1;
    return true;
  }

  function normalizeAlloc(alloc, ids) {
    const raw = ids.map(id => Math.max(0, Number((alloc || {})[id]) || 0));
    const sum = raw.reduce((x, y) => x + y, 0);
    const out = {};
    ids.forEach((id, i) => { out[id] = sum > 0 ? raw[i] / sum : (id === 'DOM' ? 1 : 0); });
    return out;
  }

  // Tính một vụ; trả về trạng thái mới (không sửa trạng thái cũ).
  // opts.expected = true: chế độ «Nếu – Thì» (dự báo). Không rút ngẫu nhiên cho kiểm dịch, gian lận;
  // thay bằng kỳ vọng theo xác suất, và dùng giá vựa ước tính (opts.depotEstimate) thay cho giá thật.
  function playSeason(data, state, decision, opts) {
    const X = !!(opts && opts.expected);
    if (state.n > data.seasons.length) throw new Error('Trò chơi đã kết thúc');
    const P = data.params, s = data.seasons[state.n - 1], role = data.roles[state.roleId];
    const ev = eventFor(data, state);
    const opt = ev ? (ev.options[decision.option] || ev.options[0]) : null;
    const eff = (opt && opt.eff) || {};
    const rnd = mulberry32(state.seed + state.n * 15485863);
    const assets = Object.assign({}, state.assets);
    const notes = [];
    let rep = state.rep, adapt = state.adapt, sus = state.sus, resil = state.resil, tree = state.treeHealth;

    // --- nguồn hàng ---
    const linked = role.ownFarm ? 1 : clamp((Number(decision.linked) || 0) + state.linkedBonus, 0, 1);
    const induce = role.ownFarm && s.season === 'off' && !!decision.induce;
    let volume = role.volume;
    if (s.season === 'off') volume *= role.ownFarm ? (induce ? 1 - P.offYieldCut : 0.35) : 0.6;
    if (induce) tree -= P.treeHealthCost;
    if (eff.volume) volume *= 1 + eff.volume;

    const depot = X ? (opts.depotEstimate || basePrice(data, state)) : depotPrice(data, state);
    const buyCost = role.ownFarm ? P.farmCost * (s.season === 'off' && induce ? 1.3 : 1)
      : depot * (1 + P.linkedPremium * linked + (eff.buyCost || 0));
    const purchase = bn(volume, buyCost);

    let loss = P.baseLoss - (assets.trace ? P.traceLossCut : 0) + (eff.loss || 0);
    loss = clamp(loss, 0.05, 0.6);
    let sellable = volume * (1 - loss);

    // --- gian lận (biến cố «dán nhãn Thái») ---
    let fraudRev = 0, fraudExposed = false;
    if (eff.fraud) {
      const q = sellable * eff.fraud;
      sellable -= q;
      fraudRev = bn(q, depot * P.fraudMult);
      if (X) { rep -= 15; sus -= 15; notes.push('fraud_risk'); }   // kỳ vọng: 50% bị phát hiện
      else {
        fraudExposed = rnd() < 0.5;
        if (fraudExposed) { rep -= 30; sus -= 20; notes.push('fraud_exposed'); }
        else { sus -= 10; notes.push('fraud_hidden'); }
      }
    }

    // --- phân bổ kênh ---
    const ids = data.channels.map(c => c.id);
    const okIds = ids.filter(id => eligible(data, state, data.channels.find(c => c.id === id)) && !(id === 'JP' && eff.closeJP));
    const allocIn = {};
    okIds.forEach(id => { allocIn[id] = (decision.alloc || {})[id]; });
    const alloc = normalizeAlloc(allocIn, okIds);
    const share = {}; ids.forEach(id => { share[id] = alloc[id] || 0; });
    if (eff.domesticShift) {            // chuyển một phần hàng của các kênh khác về nội địa (tổng tỷ trọng vẫn bằng 1)
      let moved = 0;
      ids.forEach(id => { if (id !== 'DOM') { moved += share[id] * eff.domesticShift; share[id] *= 1 - eff.domesticShift; } });
      share.DOM = (share.DOM || 0) + moved;
    }

    const coded = role.ownFarm ? 1 : linked;           // chỉ hàng từ vùng có mã mới được đi chính ngạch
    let toDom = 0;
    const byChannel = data.channels.map(ch => {
      let qty = sellable * share[ch.id];
      if (ch.id === 'CN' && qty > sellable * coded) { toDom += qty - sellable * coded; qty = sellable * coded; }
      let cap = ch.cap;
      if (cap !== null && ch.id === 'BORDER') cap *= 1 - (s.borderCut || 0);
      if (cap !== null && eff.capBoost && eff.capBoost[ch.id]) cap += eff.capBoost[ch.id];
      if (cap !== null && qty > cap) { toDom += qty - cap; qty = cap; }
      return { id: ch.id, qty, cap };
    });
    byChannel.find(b => b.id === 'DOM').qty += toDom;

    // --- giá, chi phí, kiểm soát tuân thủ ---
    const traderShare = role.ownFarm ? 0 : 1 - linked;
    let blockedCN = false, jpDestroyed = false, pBlockCN = 0, pLossJP = 0;
    const results = byChannel.map(b => {
      const ch = data.channels.find(c => c.id === b.id);
      let price = depot * ch.priceMult;
      if (ch.id === 'CN') {
        price *= 1 + (eff.priceCN || 0);
        if (s.thaiDry && !(assets.test || assets.trace)) price *= 0.92;     // người mua đòi chuẩn cao hơn
      }
      if (ch.id === 'FROZEN' && s.frozenProtocol && assets.area && assets.pack) price *= 1.15;
      let revenue = bn(b.qty, price) * (1 - (ch.tariff || 0));
      let cost = bn(b.qty, ch.cost + (ch.freezeCost ? ch.freezeCost * depot : 0));
      let status = 'ok';
      if (b.qty > 0 && ch.id === 'CN') {
        let risk = (0.05 + 0.15 * traderShare) * (1 - 0.35 * assets.test) + (eff.risk || 0);
        if (s.cadmium) risk *= 2.5;
        const sampling = state.cleanCN >= 2 ? 0.6 : 1;                       // 2% → 1% (PROTO)
        const pest = ((eff.pestRisk || 0) + 0.03) * sampling;
        if (X) {
          pBlockCN = 1 - (1 - clamp(risk, 0, 0.9)) * (1 - clamp(pest, 0, 0.9));
          const rej = bn(b.qty, depot * data.channels.find(c => c.id === 'DOM').priceMult * (1 - P.rejectedDiscount));
          revenue = (1 - pBlockCN) * revenue + pBlockCN * rej;
        } else if (rnd() < clamp(risk, 0, 0.9) || rnd() < clamp(pest, 0, 0.9)) {
          blockedCN = true; status = 'blocked';
          revenue = bn(b.qty, depot * data.channels.find(c => c.id === 'DOM').priceMult * (1 - P.rejectedDiscount));
        }
      }
      if (b.qty > 0 && ch.id === 'JP') {
        const r = (0.10 + 0.2 * traderShare) * (1 - 0.4 * assets.test) + (eff.risk || 0);
        if (X) { pLossJP = clamp(r, 0, 0.9); revenue *= 1 - pLossJP; }
        else if (rnd() < clamp(r, 0, 0.9)) { jpDestroyed = true; status = 'destroyed'; revenue = 0; }
      }
      return { id: ch.id, qty: b.qty, price, revenue, cost, status };
    });

    // --- nhiệm vụ vụ 4: kiểm tra của Hải quan Trung Quốc ---
    let audit = null;
    const usedCN = results.find(r => r.id === 'CN').qty > 0;
    if (s.mission === 'audit') {
      if (!usedCN) audit = 'na';
      else if (assets.area && assets.pack && (assets.trace || assets.test >= 1)) { audit = 'pass'; rep += 8; }
      else { audit = 'fail'; rep -= 10; }
    }

    // --- hậu quả chính ngạch ---
    let suspendedUntil = state.suspendedUntil, cleanCN = state.cleanCN;
    if (blockedCN || audit === 'fail' || fraudExposed) { suspendedUntil = state.n + 1; rep -= blockedCN ? 12 : 0; cleanCN = 0; notes.push('suspended'); }
    else if (X && usedCN) { rep += 3 * (1 - pBlockCN) - 12 * pBlockCN; }
    else if (usedCN) { cleanCN += 1; rep += 3; }
    if (jpDestroyed) { rep -= 5; notes.push('jp_destroyed'); }
    else if (results.find(r => r.id === 'JP').qty > 0) rep += X ? 3 - 8 * pLossJP : 3;
    if (results.find(r => r.id === 'TW').qty > 0) rep += 1;

    // --- ưu tiên đầu tư (tài sản mã số, cấp đông có hiệu lực từ vụ sau) ---
    const pr = decision.priority || 'finance';
    const pCost = P.priorityCost[pr] || 0;
    const pending = {};
    if (pr === 'area') pending.area = true;
    if (pr === 'pack') pending.pack = true;
    if (pr === 'freezer') pending.freezer = true;
    if (pr === 'test') assets.test = Math.min(2, assets.test + 1);
    if (pr === 'trace') assets.trace = true;
    if (pr === 'finance') resil += 8;

    const intelCost = (decision.intel || []).slice(0, 2).reduce((x, id) => x + ((data.intel.find(i => i.id === id) || {}).cost || 0), 0);
    const revenue = results.reduce((x, r) => x + r.revenue, 0) + fraudRev;
    const logistics = results.reduce((x, r) => x + r.cost, 0);
    const finance = state.cash < 0 ? -state.cash * (pr === 'finance' ? 0.04 : 0.08) : 0;
    const profit = revenue - purchase - logistics - pCost - intelCost - (eff.cash ? -eff.cash : 0) - finance;

    // --- chỉ số mềm ---
    const used = results.filter(r => r.qty > 0.5 && r.id !== 'DOM').length;
    if (used >= 3) adapt += 4;
    adapt += eff.adapt || 0;
    rep += eff.rep || 0;
    sus += (eff.sus || 0) + (linked >= 0.5 ? 3 : 0) - (induce ? 2 : 0);
    if (profit < 0) resil -= 6; else resil += 2;

    const result = {
      n: state.n, season: s.season, eventId: ev ? ev.id : null, option: ev ? ev.options.indexOf(opt) : null,
      decision: { priority: pr, linked, induce, alloc: share, intel: (decision.intel || []).slice(0, 2) },
      depot, volume, loss, sellable, purchase, logistics, priorityCost: pCost, intelCost, finance,
      eventCash: eff.cash || 0, fraudRev, revenue, profit, byChannel: results, audit, blockedCN, jpDestroyed, notes
    };
    if (X) { result.expected = true; result.pBlockCN = pBlockCN; result.pLossJP = pLossJP; }
    const nextAssets = Object.assign({}, assets, pending);
    return {
      roleId: state.roleId, seed: state.seed, n: state.n + 1,
      cash: state.cash + profit,
      assets: nextAssets, pending: {}, suspendedUntil, cleanCN,
      linkedBonus: eff.linkedNext || 0,
      treeHealth: clamp(tree, 0, 100),
      rep: clamp(rep, 0, 100), adapt: clamp(adapt, 0, 100), sus: clamp(sus, 0, 100), resil: clamp(resil, 0, 100),
      usedEvents: ev ? state.usedEvents.concat([ev.id]) : state.usedEvents,
      history: state.history.concat([result])
    };
  }

  function capability(a) {
    return clamp(10 + (a.area ? 20 : 0) + (a.pack ? 20 : 0) + 10 * a.test + (a.trace ? 15 : 0) + (a.freezer ? 15 : 0), 0, 100);
  }

  // Điểm tổng 0–100 theo trọng số công khai; lợi nhuận so với mốc của vai (benchMargin nghìn đ/kg × sản lượng chuẩn × 6 vụ)
  function summary(data, state) {
    const role = data.roles[state.roleId], W = data.scoreWeights, h = state.history;
    const profit = h.reduce((x, r) => x + r.profit, 0);
    const bench = bn(role.volume * data.seasons.length, role.benchMargin || 8);
    const sustain = clamp(role.ownFarm ? 0.6 * state.sus + 0.4 * state.treeHealth : state.sus, 0, 100);
    const parts = {
      profit: clamp(50 + 50 * profit / bench, 0, 100),
      reputation: state.rep, capability: capability(state.assets),
      adaptation: state.adapt, sustainability: sustain
    };
    const total = Object.keys(W).reduce((x, k) => x + W[k] * parts[k] / 100, 0);
    const channelsUsed = new Set();
    h.forEach(r => r.byChannel.forEach(c => { if (c.qty > 0.5) channelsUsed.add(c.id); }));
    const badges = [];
    if (h.some(r => r.byChannel.find(c => c.id === 'CN').qty > 0) && !h.some(r => r.blockedCN)) badges.push('clean_official');
    if (channelsUsed.size >= 4) badges.push('diversified');
    if (h.some(r => r.fraudRev > 0)) badges.push('fake_origin');
    if (role.ownFarm && state.treeHealth < 70) badges.push('exhausted_trees');
    if (h.every(r => r.profit >= 0)) badges.push('resilient');
    return { profit, bench, parts, total, cash: state.cash, channelsUsed: [...channelsUsed], badges };
  }

  function decisionLog(state, meta) {
    return state.history.map(r => ({
      round: r.n, pillar: 'ho-chieu-sau-rieng', scenario_pack: 'durian-passport-v1',
      cohort_id: (meta && meta.cohort) || 'local', decision: r.decision, event: r.eventId, option: r.option,
      result_after: { revenue: r.revenue, profit: r.profit, blocked_cn: r.blockedCN, audit: r.audit }, seed: state.seed
    }));
  }

  const api = { mulberry32, seedFrom, newGame, eventFor, depotPrice, basePrice, forecast, rivalDecision, pickRivals, rivalsRun, flagFor, intelSignals, riskLevel, eligible, normalizeAlloc, playSeason, capability, summary, decisionLog };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DurianEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
