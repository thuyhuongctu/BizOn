/* BizOn · Lumina «Nếu – Thì» mở rộng · plugin cho game.html
 * Nạp SAU js/engine.js, js/app.js, js/market-dynamic.js:  <script src="js/lumina-whatif.js"></script>
 * - 5 vai: CEO (chiến lược) · CFO (tài chính, engine gốc) · CMO (thị trường) · COO (cung ứng) · SEC (điều kiện cắm cờ).
 * - Dự báo dùng đúng mô hình sức hút của simulateRound + chỉ số thành phố (thị trường động), không ngẫu nhiên.
 * - Bảng kịch bản Nếu–Thì (giá ±10%, marketing +30%, sản lượng khớp cầu) + phương án Lumina đề xuất (áp vào thanh trượt).
 * - Nhìn trước vòng sau: kế hoạch này làm thành phố kế tiếp thay đổi thế nào.
 * Trong game: thay runWhatIf(role) của app.js (giữ quota WHAT_IF_LIMIT). Ngoài game: LuminaWhatIf.render(el, s, role, d).
 */
(function () {
  'use strict';
  const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const G = (name, def) => { try { return eval(name); } catch (e) { return def; } }; // đọc const toàn cục của engine
  const num = v => Math.round(v).toLocaleString(tr('vi-VN', 'en-US'));
  const sg = v => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const RIVAL_BASE = { aggressive: { p: 125, m: 90 }, balanced: { p: 150, m: 60 }, premium: { p: 195, m: 75 } };
  const JIT = 1.025; // kỳ vọng của jitter 0.9 + U·0.25 trong engine

  function forecast(s, d) {
    const REF = G('REF_PRICE', 150), EL = G('PRICE_ELASTICITY', 1.8), BASE = G('BASE_MARKET_UNITS', 12000), UC = G('UNIT_COST', 45), FC = G('FIXED_COST', 30);
    const UPW = G('UNITS_PER_WORKER', 70), WPW = G('WAGE_PER_WORKER', 1), TERMS = G('PAYMENT_TERMS', { 30: { demandMul: 1, costMul: 1 } });
    const skill = (k, def) => (typeof skillEffect === 'function' ? skillEffect(s, k, def) : def);
    const items = s.items || {}, boosts = s.activeBoosts || [];
    const ev0 = (typeof currentEvent === 'function' && currentEvent(s)) || { demand: 1, costMul: 1 };
    const shielded = boosts.includes('INS_SHIELD_01') && ev0.tone === 'bad';
    const ev = shielded && typeof MARKET_EVENTS_LIST === 'function' ? MARKET_EVENTS_LIST()[1] : ev0;
    const term = TERMS[d.paymentTerm] || TERMS[30];
    const md = window.BizonMarket && BizonMarket.enabled(s) ? BizonMarket.mods(s) : { trust: 1 };
    const workers = d.workers || 45, prod = Math.min(d.production || 0, workers * UPW);
    const el = EL * (ev.elasticityMul || 1), bp = ev.brandPow || 1;
    let mktEff = (d.marketing || 0) * (ev.mktBoost || 1) * skill('mktMul', 1); if (boosts.includes('MKT_BOOST_01')) mktEff *= 1.3;
    const attr = (p, m, b) => Math.pow(REF / p, el) * (1 + Math.sqrt(m) / 18) * Math.pow(b, bp);
    const me = attr(d.price || REF, mktEff, (s.brand || 1) * md.trust);
    const dm = typeof difficultyMul === 'function' ? difficultyMul(s) : 1;
    const rivals = (s.competitors || []).map(c => { const b = RIVAL_BASE[c.style] || { p: REF, m: 55 }; let rp = b.p * JIT, rm = b.m * JIT;
      const adj = typeof window.BizonRivalAdjust === 'function' ? window.BizonRivalAdjust(s, c, rp, rm) : null; if (adj) { rp = adj.price; rm = adj.mkt; }
      return { name: c.name, style: c.style, price: rp, mkt: rm, a: attr(rp, rm, c.brand || 1) * dm }; });
    const tot = me + rivals.reduce((a, x) => a + x.a, 0);
    const share = 100 * me / tot;
    rivals.forEach(x => x.share = 100 * x.a / tot);
    const rivalMax = Math.max(0, ...rivals.map(x => x.share));
    const units = BASE * (ev.demand || 1) * (term.demandMul || 1);
    const demandU = Math.round(units * share / 100), avail = prod + (s.inventory || 0);
    const sold = Math.round(Math.min(demandU, avail) * (ev.fulfillMul || 1));
    const lost = Math.max(0, demandU - sold), left = Math.max(0, avail - sold);
    let unitCost = UC * (ev.costMul || 1) * skill('costMul', 1); if ((items.RD_UPGRADE_01 || 0) > 0) unitCost *= 0.92; unitCost *= Math.max(0.8, 1 - (s.rdCumulative || 0) / 1500);
    let dep = Math.max(s.machineCapacity || 1500, prod) * 0.015; if ((items.OPS_LEAN_01 || 0) > 0) dep *= 0.8;
    let fixed = FC * (ev.costMul || 1); if ((items.SOLAR_01 || 0) > 0) fixed *= 0.85; if (s.costCutter) fixed *= 0.85;
    const wage = workers * WPW * (ev.wageMul || 1), training = workers * (d.training || 0);
    const cost = (prod * unitCost / 1000 + (d.marketing || 0) + (d.rd || 0) + fixed + dep + left * 0.005 + (s.loan || 0) * 0.05 + wage + training) * (term.costMul || 1);
    const revenue = sold * (d.price || REF) / 1000;
    const profit = (revenue - cost) * skill('profitMul', 1);
    return { share, rivalMax, rivals, demandU, sold, lost, left, prod, revenue, cost, profit, unitCost, win: share >= rivalMax && profit > 0, top: share >= rivalMax, ev, md, capUse: prod / Math.max(1, s.machineCapacity || 1500) };
  }

  // Kế hoạch này làm thành phố kế tiếp thay đổi ra sao (cùng công thức với market-dynamic.js)
  function lookAhead(s, d, f) {
    if (!window.BizonMarket || !BizonMarket.enabled(s)) return null;
    const snap = BizonMarket.snapshot(s); const n = Math.min(s.round || 1, 6); const nx = snap && snap.cities[n];
    if (!nx) return null;
    const fill = f.demandU > 0 ? f.sold / f.demandU : 1;
    const dTrust = Math.round(clamp(((d.marketing || 50) - 60) / 12, -4, 7) + (fill < 0.9 ? -(1 - fill) * 18 : 0) + (f.share >= 30 ? 3 : 0));
    return { city: nx.short, dTrust, dComp: f.share >= 32 ? 6 : 0, sensUp: (d.price || 150) < 132, news: (snap.news || []).filter(x => x.n === nx.n || x.n === 0).slice(0, 2) };
  }

  function scenarios(s, d, base) {
    const UPW = G('UNITS_PER_WORKER', 70);
    const mk = (label, dd) => { const f = forecast(s, { ...d, ...dd }); return { label, d: { ...d, ...dd }, f, dShare: f.share - base.share, dProfit: f.profit - base.profit }; };
    const need = Math.ceil(Math.max(0, base.demandU - (s.inventory || 0)) / 100) * 100;
    const out = [
      mk(tr('Nếu giảm giá 10%', 'If price −10%'), { price: Math.round((d.price || 150) * 0.9) }),
      mk(tr('Nếu tăng giá 10%', 'If price +10%'), { price: Math.round((d.price || 150) * 1.1) }),
      mk(tr('Nếu tăng marketing 30%', 'If marketing +30%'), { marketing: Math.round((d.marketing || 0) * 1.3 / 5) * 5 || 20 }),
    ];
    if (Math.abs(need - (d.production || 0)) >= 200) out.push(mk(tr(`Nếu sản xuất khớp cầu (${num(need)} sp)`, `If output matches demand (${num(need)} units)`), { production: need, workers: Math.max(d.workers || 45, Math.ceil(need / UPW)) }));
    // Lumina đề xuất: tìm lưới giá × marketing, ưu tiên phương án cắm được cờ có lãi cao nhất
    let best = null;
    const mGrid = [...new Set([d.marketing || 0, ...Array.from({ length: 20 }, (_, i) => (i + 1) * 10)])];
    for (let p = 110; p <= 210; p += 5) for (const mm of mGrid) {
      const f = forecast(s, { ...d, price: p, marketing: mm });
      const score = (f.win ? 1e6 : f.top ? 5e5 : 0) + f.profit;
      if (!best || score > best.score) best = { score, d: { ...d, price: p, marketing: mm }, f };
    }
    const sug = best && (best.d.price !== d.price || best.d.marketing !== d.marketing) ? { label: tr(`✨ Lumina đề xuất: giá ${best.d.price}k · marketing ${best.d.marketing}tr`, `✨ Lumina suggests: price ${best.d.price}k · marketing ${best.d.marketing}m`), d: best.d, f: best.f, dShare: best.f.share - base.share, dProfit: best.f.profit - base.profit, sug: true } : null;
    return { rows: out, sug };
  }

  function analyze(s, role, d) {
    const f = forecast(s, d), city = f.ev.city ? f.ev.city.name : '';
    const snap = window.BizonMarket ? BizonMarket.snapshot(s) : null, c = snap ? snap.cities[Math.min(s.round, 6) - 1] : null;
    const avgP = c ? Math.round(BizonMarket.livePrice(c.n)) : 150;
    const cityM = c && snap.enabled ? { label: tr(`Thị trường ${c.short}`, `${c.short} market`), value: tr(`cầu ${c.demand.toFixed(2)}× · cạnh tranh ${c.comp} · niềm tin ${c.trust}`, `demand ${c.demand.toFixed(2)}× · comp. ${c.comp} · trust ${c.trust}`) } : null;
    const add = (r) => { if (cityM) r.metrics.unshift(cityM); return r; };
    if (role === 'CFO' && typeof whatIfSimulate === 'function') return add(whatIfSimulate(s, 'CFO', d));
    if (role === 'CMO') {
      const gap = f.share - f.rivalMax, mroi = d.marketing > 0 ? f.revenue / d.marketing : 0;
      return add({ role, title: tr('📣 Định vị thị trường (CMO)', '📣 Market positioning (CMO)'), status: f.win ? 'SAFE' : gap > -3 ? 'VIABLE_BUT_RISKY' : 'HIGH_RISK',
        metrics: [
          { label: tr('Thị phần dự báo vs đối thủ mạnh nhất', 'Forecast share vs top rival'), value: `${f.share.toFixed(1)}% / ${f.rivalMax.toFixed(1)}%`, bad: gap < 0 },
          { label: tr(`Giá của bản vs giá TB ${c ? c.short : ''}`, `Your price vs ${c ? c.short : ''} avg`), value: `${d.price}k / ${avgP}k (${sg(Math.round((d.price / avgP - 1) * 100))}%)`, bad: f.ev.elasticityMul > 1.1 && d.price > avgP },
          { label: tr('Doanh thu / CP Marketing', 'Revenue / Marketing spend'), value: mroi ? mroi.toFixed(1) : '–', bad: mroi > 0 && mroi < 3 },
        ],
        msg: f.win ? tr(`Nếu giữ kế hoạch này, đội dẫn đầu ${city} với ${f.share.toFixed(1)}% thị phần và có lãi – đủ điều kiện cắm cờ.`, `If you hold this plan, the team leads ${city} with ${f.share.toFixed(1)}% share and a profit – enough to plant the flag.`)
          : gap > -3 ? tr(`Chỉ còn cách đối thủ mạnh nhất ${Math.abs(gap).toFixed(1)} điểm. Nẽu tăng nhẹ marketing hoặc hạ giá 5k, mình có thể vượt lên.`, `Only ${Math.abs(gap).toFixed(1)} points behind the top rival. A small marketing bump or a 5k price cut could get us ahead.`)
          : tr(`Thị phần đang thua xa (${f.share.toFixed(1)}% so với ${f.rivalMax.toFixed(1)}%). Nếu khách ở ${city} nhạy giá, hãy xem bảng Nếu–Thì bên dưới trước khi chốt.`, `Share is well behind (${f.share.toFixed(1)}% vs ${f.rivalMax.toFixed(1)}%). If ${city} buyers are price-sensitive, check the What-If table below before locking in.`) });
    }
    if (role === 'COO') {
      const lostP = f.demandU ? f.lost / f.demandU : 0, leftP = f.demandU ? f.left / f.demandU : 0;
      const ship = f.md && f.md.ship ? Math.round((f.md.ship - 1) * 100) : 0;
      const cap0 = s.machineCapacity || 1500, over = f.prod > cap0, depUp = Math.round((f.prod - cap0) * 0.015);
      return add({ role, title: tr('🏭 Cung ứng & công suất (COO)', '🏭 Supply & capacity (COO)'), status: lostP > 0.1 || leftP > 0.4 ? 'HIGH_RISK' : f.prod > (s.machineCapacity || 1500) * 0.95 ? 'VIABLE_BUT_RISKY' : 'SAFE',
        metrics: [
          { label: tr('Cầu dự báo vs hàng sẵn có', 'Forecast demand vs available stock'), value: `${num(f.demandU)} / ${num(f.prod + (s.inventory || 0))}`, bad: lostP > 0.1 },
          { label: f.lost ? tr('Đơn có thể hụt', 'Orders at risk') : tr('Tồn kho dư cuối vòng', 'Leftover stock'), value: `${num(f.lost || f.left)} ${tr('sp', 'units')}`, bad: lostP > 0.1 || leftP > 0.4 },
          over ? { label: tr('Công suất máy', 'Machine capacity'), value: tr(`cần mở rộng ${num(cap0)} → ${num(f.prod)} sp`, `expand ${num(cap0)} → ${num(f.prod)} units`), bad: true }
            : { label: tr('Công suất máy sử dụng', 'Machine capacity used'), value: Math.round(f.capUse * 100) + '%', bad: f.capUse > 0.95 },
          { label: tr('Giá thành / sp (gồm vận chuyển)', 'Unit cost (incl. shipping)'), value: `${f.unitCost.toFixed(1)}k (${tr('vận chuyển', 'shipping')} ${sg(ship)}%)`, bad: ship >= 8 },
        ],
        msg: lostP > 0.1 ? tr(`Nếu giữ sản lượng này, mình hụt khoảng ${num(f.lost)} đơn ở ${city} – khách thiếu hàng sẽ làm giảm niềm tin ở thành phố kế tiếp.`, `If output stays here, we'll miss about ${num(f.lost)} orders in ${city} – stockouts will dent trust in the next city.`)
          : leftP > 0.4 ? tr(`Nếu sản xuất như vậy, còn dư ${num(f.left)} sp – tốn phí lưu kho. Có thể giảm sản lượng hoặc đẩy marketing.`, `At this output, ${num(f.left)} units will be left over – holding costs add up. Cut output or push marketing.`)
          : over ? tr(`Nếu sản xuất ${num(f.prod)} sp, đội phải mở rộng dây chuyền từ ${num(cap0)} lên ${num(f.prod)} sp – khấu hao +${depUp}tr₫ mỗi vòng từ nay về sau.`, `Producing ${num(f.prod)} units means expanding the line from ${num(cap0)} to ${num(f.prod)} – depreciation +${depUp}m₫ every round from now on.`)
          : f.capUse > 0.95 ? tr(`Máy chạy ${Math.round(f.capUse * 100)}% công suất – nếu cầu tăng thêm, mình không còn dư địa tăng ca; OEE dễ giảm.`, `Machines at ${Math.round(f.capUse * 100)}% capacity – if demand rises further there's no overtime headroom, and OEE may drop.`)
          : tr('Cung – cầu gần khớp. Nếu có biến cố làm cầu tăng, còn dư địa công suất để tăng ca.', 'Supply and demand are close. If a shock lifts demand, there is capacity headroom for overtime.') });
    }
    if (role === 'SEC') {
      const la = lookAhead(s, d, f);
      return add({ role, title: tr('📝 Điều kiện cắm cờ (SEC)', '📝 Flag conditions (SEC)'), status: f.win ? 'SAFE' : f.top || f.profit > 0 ? 'VIABLE_BUT_RISKY' : 'HIGH_RISK',
        metrics: [
          { label: tr('Thị phần cao nhất sàn đấu', 'Highest share in the arena'), value: f.top ? '✓' : `✗ (${tr('thiếu', 'short')} ${(f.rivalMax - f.share).toFixed(1)})`, bad: !f.top },
          { label: tr('Có lãi vòng này', 'Profitable this round'), value: f.profit > 0 ? `✓ ${Math.round(f.profit)}tr₫` : `✗ ${Math.round(f.profit)}tr₫`, bad: f.profit <= 0 },
          { label: tr('Tin cần theo dõi', 'News to watch'), value: la && la.news.length ? la.news.map(x => x.icon + ' ' + x.title).join(' · ') : tr('Không có', 'None'), bad: false },
        ],
        msg: f.win ? tr(`Hai điềi kiện đều đạt. Nếu cả đội đồng ý, mình ghi biên bản và nhắc CEO Commit để cắm cờ ${city}.`, `Both conditions are met. If the team agrees, I'll log the minutes and remind the CEO to Commit and plant the ${city} flag.`)
          : tr(`Chưa đủ điều kiện cắm cờ: ${!f.top ? 'thị phần chưa cao nhất' : ''}${!f.top && f.profit <= 0 ? ' và ' : ''}${f.profit <= 0 ? 'vòng này đang lỗ' : ''}. Mình đề xuất xem phương án Lumina bên dưới.`, `Flag conditions not met: ${!f.top ? 'share is not the highest' : ''}${!f.top && f.profit <= 0 ? ' and ' : ''}${f.profit <= 0 ? 'the round is at a loss' : ''}. I suggest reviewing Lumina's option below.`) });
    }
    // CEO
    const last = (s.history || [])[s.history.length - 1], dS = f.share - (last ? last.share : 25);
    const aggressive = dS > 3 && f.profit < 0, risky = f.profit < 0;
    return add({ role: 'CEO', title: tr('🧭 Tổng quan chiến lược (CEO)', '🧭 Strategic overview (CEO)'), status: f.win ? 'SAFE' : aggressive ? 'VIABLE_BUT_RISKY' : risky ? 'HIGH_RISK' : 'VIABLE_BUT_RISKY',
      metrics: [
        { label: tr('Thị phần dự báo', 'Forecast market share'), value: `${f.share.toFixed(1)}% (${dS >= 0 ? '+' : ''}${dS.toFixed(1)})`, bad: !f.top },
        { label: tr('Lợi nhuận ròng dự báo', 'Forecast net profit'), value: Math.round(f.profit) + 'tr₫', bad: f.profit < 0 },
        { label: tr('Bán dự kiến / cầu', 'Expected sold / demand'), value: `${num(f.sold)} / ${num(f.demandU)}`, bad: f.lost > f.demandU * 0.1 },
      ],
      msg: f.win ? tr(`Nếu chốt kế hoạch này, đội dẫn đầu ${city} và có lãi ${Math.round(f.profit)}tr₫ – cắm được cờ.`, `If you lock this plan, the team leads ${city} with ${Math.round(f.profit)}m₫ profit – flag secured.`)
        : aggressive ? tr(`Kế hoạch này giành thêm ${dS.toFixed(1)} điểm thị phần nhưng lỗ ${Math.abs(Math.round(f.profit))}tr₫. Không có lãi thì chưa cắm được cờ.`, `This plan gains ${dS.toFixed(1)} share points but loses ${Math.abs(Math.round(f.profit))}m₫. No profit means no flag.`)
        : risky ? tr('Kế hoạch đang lỗ. Hãy so các kịch bản bên dưới để tìm điểm cân bằng giữa giá và marketing.', 'The plan is loss-making. Compare the scenarios below to balance price and marketing.')
        : tr(`Có lãi nhưng chưa dẫn đầu (thiếu ${(f.rivalMax - f.share).toFixed(1)} điểm). Xem phương án Lumina đề xuất.`, `Profitable but not leading (${(f.rivalMax - f.share).toFixed(1)} points short). See Lumina's suggested option.`) });
  }

  const CSS = `
.lwi{background:#fff;border:3px solid #dbe9f0;border-radius:22px;padding:14px;color:#033337;font-size:12px}
.lwi *{box-sizing:border-box}
.lwi .hd{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
.lwi .hd b{font-size:14px;color:#006687}
.lwi .bd{font-size:10px;font-weight:900;padding:3px 8px;border-radius:999px;white-space:nowrap}
.lwi .bd.SAFE,.lwi .bd.SAFE_AND_EFFICIENT{background:#e3f6ec;color:#0a6a3c}.lwi .bd.VIABLE_BUT_RISKY,.lwi .bd.CAPITAL_EROSION{background:#fff3dc;color:#8a5200}.lwi .bd.HIGH_RISK,.lwi .bd.INSOLVENCY_RISK{background:#fde6e3;color:#a3281b}
.lwi .m{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:1px solid #eef3f6}.lwi .m:last-of-type{border:0}
.lwi .m span{color:#5d6770}.lwi .m b{text-align:right}.lwi .m b.bad{color:#c0392b}
.lwi .say{display:flex;gap:8px;align-items:flex-start;margin:10px 0 4px}
.lwi .say img{width:32px;height:32px;border-radius:50%;object-fit:cover;object-position:50% 12%;flex-shrink:0;background:#eef6fb}
.lwi .say p{margin:0;font-style:italic;line-height:1.45;color:#1f3f45}
.lwi h4{margin:12px 0 6px;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#b0501a}
.lwi .sc{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px 10px;align-items:center}
.lwi .sc .h{font-size:10px;font-weight:800;color:#8a9aa2;text-transform:uppercase}
.lwi .sc .l{font-weight:700;min-width:0}.lwi .sc .v{text-align:right;font-weight:800;white-space:nowrap}
.lwi .sc .v small{display:block;font-size:10px;font-weight:700}
.lwi .up{color:#0a7a45}.lwi .dn{color:#c0392b}
.lwi .sg{margin-top:8px;background:#f4faff;border:2px dashed #9fd0e0;border-radius:16px;padding:10px;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.lwi .sg button{font:inherit;font-weight:800;font-size:12px;border:0;border-radius:12px;padding:8px 12px;cursor:pointer;background:#006687;color:#fff}
.lwi .la{margin-top:8px;background:#fff7ef;border-radius:14px;padding:10px;line-height:1.5}
.lwi .q{margin-top:8px;text-align:right;font-size:10px;color:#8a9aa2}`;
  const css = () => { if (!document.getElementById('lwi-css')) { const st = document.createElement('style'); st.id = 'lwi-css'; st.textContent = CSS; document.head.appendChild(st); } };
  const LABEL = () => ({ SAFE: tr('✅ AN TOÀN', '✅ SAFE'), SAFE_AND_EFFICIENT: tr('✅ AN TOÁN & HIỆU QUẢ', '✅ SAFE & EFFICIENT'), VIABLE_BUT_RISKY: tr('🟡 KHẢ THI NHƯNG RỦI RO', '🟡 VIABLE BUT RISKY'),
    CAPITAL_EROSION: tr('🟡 CẢNH BÁO MÒN VỐN', '🟡 CAPITAL EROSION'), HIGH_RISK: tr('🔴 RỦI RO CAO', '🔴 HIGH RISK'), INSOLVENCY_RISK: tr('🔴 NGUY CƠ MẤT THANH KHOẢN', '🔴 INSOLVENCY RISK') });

  function render(el, s, role, d, opts) {
    opts = opts || {}; css(); if (!el) return;
    const r = analyze(s, role, d), base = forecast(s, d), sc = scenarios(s, d, base), la = lookAhead(s, d, base);
    const row = x => `<span class="l">${x.label}${x.f.win ? ' 🚩' : ''}</span>
      <span class="v">${x.f.share.toFixed(1)}%<small class="${x.dShare >= 0 ? 'up' : 'dn'}">${x.dShare >= 0 ? '+' : ''}${x.dShare.toFixed(1)}</small></span>
      <span class="v">${Math.round(x.f.profit)}tr<small class="${x.dProfit >= 0 ? 'up' : 'dn'}">${x.dProfit >= 0 ? '+' : ''}${Math.round(x.dProfit)}</small></span>`;
    el.innerHTML = `<div class="lwi">
      <div class="hd"><b>${r.title}</b><span class="bd ${r.status}">${LABEL()[r.status] || r.status}</span></div>
      ${r.metrics.map(m => `<div class="m"><span>${m.label}</span><b class="${m.bad ? 'bad' : ''}">${m.value}</b></div>`).join('')}
      <div class="say"><img src="assets/character/lumina-vest.webp" alt="Lumina"><p>“${r.msg}”</p></div>
      <h4>${tr('Nếu – Thì', 'What – If')} · ${tr('so với kế hoạch hiện tại', 'vs. your current plan')}</h4>
      <div class="sc"><span class="h">${tr('Kịch bản', 'Scenario')}</span><span class="h v">${tr('Thị phần', 'Share')}</span><span class="h v">${tr('Lãi', 'Profit')}</span>
        ${row({ label: tr('Kế hoạch hiện tại', 'Current plan'), f: base, dShare: 0, dProfit: 0 })}${sc.rows.map(row).join('')}</div>
      ${sc.sug ? `<div class="sg"><span><b>${sc.sug.label}</b><br>${tr('Thị phần', 'Share')} ${sc.sug.f.share.toFixed(1)}% · ${tr('lãi', 'profit')} ${Math.round(sc.sug.f.profit)}tr₫${sc.sug.f.win ? ' · 🚩 ' + tr('cắm được cờ', 'flag secured') : ''}</span>${opts.onApply ? `<button class="ap">${tr('Áp vào thanh trượt', 'Apply to sliders')}</button>` : ''}</div>` : ''}
      ${la ? `<div class="la">🔭 <b>${tr('Nhìn trước vòng sau', 'Looking ahead')} · ${la.city}:</b> ${tr('nếu chốt kế hoạch này, niềm tin', 'if you lock this plan, trust')} <b class="${la.dTrust >= 0 ? 'up' : 'dn'}">${sg(la.dTrust)}</b>${la.dComp ? `, ${tr('cạnh tranh', 'competition')} <b class="dn">+${la.dComp}</b> (${tr('đối thủ phản công', 'rivals strike back')})` : ''}${la.sensUp ? `, ${tr('khách nhạy giá hơn', 'buyers more price-sensitive')}` : ''}.</div>` : ''}
      ${opts.quota != null ? `<div class="q">${tr(`Còn ${opts.quota} lượt mô phỏng trong vòng này`, `${opts.quota} simulations left this round`)}</div>` : ''}
      <div class="q">${tr('Dự báo dùng mức giá trung bình của đối thủ; kết quả thật dao động ±', 'Forecast uses average rival pricing; actual results vary ±')}5%.</div>
    </div>`;
    const ap = el.querySelector('.ap'); if (ap && sc.sug) ap.onclick = () => opts.onApply(sc.sug.d);
    return r;
  }

  // ---------- Cảnh báo live khi kéo thanh trượt (không tốn lượt) ----------
  function warnings(s, d, f) {
    const w = [], cap0 = s.machineCapacity || 1500;
    const snap = window.BizonMarket ? BizonMarket.snapshot(s) : null, c = snap && snap.enabled ? snap.cities[Math.min(s.round, 6) - 1] : null;
    const avgP = c ? BizonMarket.livePrice(c.n) : 150;
    if (f.profit < 0) w.push(['bad', tr(`Kế hoạch đang lỗ ~${Math.abs(Math.round(f.profit))}tr₫ – không có lãi thì chưa cắm được cờ.`, `The plan loses ~${Math.abs(Math.round(f.profit))}m₫ – no profit, no flag.`)]);
    if (f.demandU && f.lost / f.demandU > 0.1) w.push(['bad', tr(`Thiếu hàng ~${num(f.lost)} đơn – niềm tin ở thành phố sau sẽ giảm.`, `Short ~${num(f.lost)} orders – trust in the next city will drop.`)]);
    if (f.prod > cap0) w.push(['warn', tr(`Vượt công suất ${num(cap0)} sp → phải mở rộng, khấu hao +${Math.round((f.prod - cap0) * 0.015)}tr₫/vòng.`, `Above ${num(cap0)}-unit capacity → expansion, depreciation +${Math.round((f.prod - cap0) * 0.015)}m₫/round.`)]);
    if (f.demandU && f.left / f.demandU > 0.4) w.push(['warn', tr(`Dư ~${num(f.left)} sp tồn kho – tốn phí lưu kho.`, `~${num(f.left)} units left over – holding costs.`)]);
    if (c && d.price > avgP * 1.1 && (f.ev.elasticityMul || 1) > 1.05) w.push(['warn', tr(`Giá cao hơn TB ${c.short} ${Math.round((d.price / avgP - 1) * 100)}% trong khi khách nhạy giá.`, `Price is ${Math.round((d.price / avgP - 1) * 100)}% above the ${c.short} average while buyers are price-sensitive.`)]);
    const spend = (d.marketing || 0) + (d.rd || 0) + f.prod * f.unitCost / 1000;
    if (spend > (s.balance || 0)) w.push(['warn', tr(`Chi dự kiến ${Math.round(spend)}tr₫ vượt tiền mặt ${Math.round(s.balance)}tr₫.`, `Planned spend ${Math.round(spend)}m₫ exceeds cash ${Math.round(s.balance)}m₫.`)]);
    if (!f.top && f.profit >= 0) w.push(['info', tr(`Còn thiếu ${(f.rivalMax - f.share).toFixed(1)} điểm thị phần để dẫn đầu.`, `${(f.rivalMax - f.share).toFixed(1)} share points short of the lead.`)]);
    return w;
  }
  const LCSS = `
.lwl{display:flex;gap:10px;align-items:flex-start;background:#f4faff;border:2px solid #dbe9f0;border-radius:18px;padding:10px 12px;margin:10px 0;color:#033337;font-size:12px}
.lwl img{width:30px;height:30px;border-radius:50%;object-fit:cover;object-position:50% 12%;flex-shrink:0}
.lwl .t{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-weight:900;font-size:13px;margin-bottom:4px}
.lwl .t span{font-size:10px;font-weight:900;border-radius:999px;padding:2px 8px;background:#e3f6ec;color:#0a6a3c}
.lwl .t span.no{background:#fde6e3;color:#a3281b}
.lwl ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:3px;line-height:1.4}
.lwl li.bad{color:#a3281b;font-weight:700}.lwl li.warn{color:#8a5200;font-weight:700}.lwl li.info{color:#33525a}
.lwl small{display:block;margin-top:4px;font-size:10px;color:#8a9aa2}`;
  let liveT = null;
  function live() {
    const s = typeof S !== 'undefined' ? S : null; if (!s || typeof currentDecisionInput !== 'function') return;
    let box = document.getElementById('lwi-live');
    if (!box) {
      const out = document.getElementById('whatif-result'); if (!out || !out.parentNode) return;
      box = document.createElement('div'); box.id = 'lwi-live';
      out.parentNode.insertBefore(box, out.previousElementSibling || out);
    }
    if (!document.getElementById('lwl-css')) { const st = document.createElement('style'); st.id = 'lwl-css'; st.textContent = LCSS; document.head.appendChild(st); }
    if (s.finished || s.committed) { box.innerHTML = ''; return; }
    const d = currentDecisionInput(), f = forecast(s, d), w = warnings(s, d, f);
    box.innerHTML = `<div class="lwl"><img src="assets/character/lumina-vest.webp" alt="Lumina"><div style="min-width:0;flex:1">
      <div class="t">${tr('Lumina dự báo live', 'Lumina live forecast')}: ${f.share.toFixed(1)}% · ${Math.round(f.profit)}tr₫ <span class="${f.win ? '' : 'no'}">${f.win ? '🚩 ' + tr('cắm được cờ', 'flag secured') : tr('chưa đủ cắm cờ', 'no flag yet')}</span></div>
      ${w.length ? `<ul>${w.slice(0, 3).map(x => `<li class="${x[0]}">${x[1]}</li>`).join('')}</ul>` : `<ul><li class="info">${tr('Kế hoạch cân đối. Bấm một vai bên dưới để xem kịch bản Nếu–Thì chi tiết.', 'The plan is balanced. Tap a role below for detailed What-If scenarios.')}</li></ul>`}
      <small>${tr('Không tốn lượt mô phỏng', 'Does not use a simulation')}</small></div></div>`;
  }
  const IDS = ['in-price', 'in-mkt', 'in-prod', 'in-rd', 'in-workers', 'in-train', 'in-term'];
  document.addEventListener('input', e => { if (e.target && IDS.includes(e.target.id)) { clearTimeout(liveT); liveT = setTimeout(live, 180); } }, true);
  document.addEventListener('change', e => { if (e.target && IDS.includes(e.target.id)) { clearTimeout(liveT); liveT = setTimeout(live, 60); } }, true);

  // ---------- Thay runWhatIf của app.js ----------
  const setVal = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
  function hook() {
    if (typeof window.runWhatIf !== 'function' || window.runWhatIf.__lwi || typeof currentDecisionInput !== 'function') return;
    const orig = window.runWhatIf;
    const f = function (role) {
      const s = typeof S !== 'undefined' ? S : null; const out = document.getElementById('whatif-result');
      if (!s || !out) return orig.apply(this, arguments);
      const LIM = G('WHAT_IF_LIMIT', 2);
      if (s.finished || s.committed || s.whatIfUsed >= LIM) return orig.apply(this, arguments);
      const d = currentDecisionInput();
      if (role === 'CFO') { d.loanAmount = s.loan > 0 ? 0 : 300; d.costCutPct = 15; }
      s.whatIfUsed++; s.whatIfTotal = (s.whatIfTotal || 0) + 1;
      if (typeof save === 'function') save();
      render(out, s, role, d, { quota: Math.max(0, LIM - s.whatIfUsed), onApply: nd => {
        setVal('in-price', nd.price); setVal('in-mkt', nd.marketing);
        if (typeof syncDecisionLabels === 'function') syncDecisionLabels();
        const ap = out.querySelector('.ap'); if (ap) { ap.textContent = tr('✓ Đã áp', '✓ Applied'); ap.disabled = true; ap.style.opacity = .6; }
      } });
      const q = document.getElementById('whatif-quota'); if (q) q.textContent = Math.max(0, LIM - s.whatIfUsed);
    };
    f.__lwi = true; window.runWhatIf = f;
  }
  hook(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook);

  setTimeout(live, 400);
  window.LuminaWhatIf = { forecast, analyze, scenarios, lookAhead, render, warnings, live };
})();
