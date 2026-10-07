/* BizOn · Thị trường động (6 thành phố) · plugin cho game.html
 * Nạp SAU js/engine.js + js/app.js:  <script src="js/market-dynamic.js"></script>
 * - Mỗi thành phố có chỉ số riêng: nhu cầu, giá TB, cạnh tranh, niềm tin, chi phí vận chuyển.
 * - Tác động TRỰC TIẾP lên mô phỏng: bọc currentEvent (cầu, độ nhạy giá, chi phí), difficultyMul
 *   (sức hút đối thủ theo cạnh tranh) và simulateRound (niềm tin → sức hút của đội).
 * - Sau mỗi vòng: quyết định của đội + biến cố ngẫu nhiên (seed theo Mã lớp → công bằng trong lớp)
 *   làm thay đổi các thành phố sắp tới. Trạng thái lưu ở S.mkt.
 * - Giao diện: BizonMarket.open() (bảng thị trường), TV live trong văn phòng, cột 3D trên bản đồ.
 */
(function () {
  'use strict';
  const tr = (vi, en) => (typeof T === 'function' ? T(vi, en) : vi);
  const REF = 150, BASE_UNITS = 12000;
  const CITY = [
    { n: 1, name: 'Cần Thơ', short: 'Cần Thơ', demand: 0.92, sens: 1.10, comp: 38, trust: 68, ship: 1.00, price: 140 },
    { n: 2, name: 'TP. Hồ Chí Minh', short: 'TP.HCM', demand: 1.22, sens: 1.00, comp: 72, trust: 50, ship: 1.03, price: 156 },
    { n: 3, name: 'Khánh Hòa', short: 'Khánh Hòa', demand: 0.88, sens: 0.92, comp: 46, trust: 46, ship: 1.07, price: 160 },
    { n: 4, name: 'Đà Nẵng', short: 'Đà Nẵng', demand: 0.96, sens: 0.96, comp: 54, trust: 44, ship: 1.08, price: 152 },
    { n: 5, name: 'Thanh Hóa', short: 'Thanh Hóa', demand: 0.85, sens: 1.14, comp: 40, trust: 40, ship: 1.10, price: 138 },
    { n: 6, name: 'Hà Nội', short: 'Hà Nội', demand: 1.18, sens: 0.94, comp: 70, trust: 38, ship: 1.12, price: 164 },
  ];
  const RIV = { aggressive: { k: 'alpha', c: '#e8762d', n: 'Alpha' }, balanced: { k: 'mekong', c: '#2e8b57', n: 'Mekong' }, premium: { k: 'star', c: '#6a3fb5', n: 'Star' } };
  const ME_C = '#006687';
  // Biến cố ngẫu nhiên: áp vào 1 thành phố sắp tới (hoặc tất cả nếu all)
  const SHOCKS = [
    { id: 'storm', icon: '🌀', w: 2, pick: [3, 4, 5], vi: 'Bão đổ bộ', en: 'Storm makes landfall', eff: { demand: -0.14, ship: 0.07 },
      dvi: 'Cầu giảm, đường vận chuyển gián đoạn.', den: 'Demand falls, shipping routes disrupted.' },
    { id: 'inflation', icon: '💸', w: 2, all: true, vi: 'Lạm phát tăng', en: 'Inflation rises', eff: { ship: 0.03, sens: 0.05 },
      dvi: 'Chi phí logistics tăng, khách cân nhắc giá kỹ hơn.', den: 'Logistics costs rise, buyers weigh prices harder.' },
    { id: 'trend', icon: '📱', w: 3, vi: 'Trend linh vật đất sét', en: 'Clay mascot trend', eff: { demand: 0.2, trust: 4 },
      dvi: 'Video lan truyền, nhu cầu tăng vọt.', den: 'A viral video sends demand soaring.' },
    { id: 'festival', icon: '🏮', w: 2, pick: [3, 4, 6], vi: 'Mùa lễ hội & du lịch', en: 'Festival & tourism season', eff: { demand: 0.15, sens: -0.05 },
      dvi: 'Khách du lịch mua quà, ít so giá.', den: 'Tourists buy gifts and compare prices less.' },
    { id: 'fuel', icon: '⛽', w: 2, vi: 'Giá xăng dầu tăng', en: 'Fuel prices climb', eff: { ship: 0.06 },
      dvi: 'Chi phí vận chuyển tới thành phố này tăng.', den: 'Shipping to this city costs more.' },
    { id: 'store', icon: '🏬', w: 2, vi: 'Đối thủ mở cửa hàng', en: 'A rival opens a store', eff: { comp: 12 },
      dvi: 'Cạnh tranh tại chỗ gắt hơn.', den: 'Local competition gets tougher.' },
    { id: 'kol', icon: '⭐', w: 2, vi: 'KOL địa phương review tốt', en: 'Local KOL gives a great review', eff: { trust: 8 },
      dvi: 'Niềm tin với hàng Việt thủ công tăng.', den: 'Trust in handmade Vietnamese goods rises.' },
  ];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1 = v => Math.round(v * 10) / 10;
  const hash = str => { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) || 1; };
  const prng = seed => () => ((seed = (Math.imul(seed, 48271) % 2147483647 + 2147483647) % 2147483647) / 2147483647);
  const seedOf = s => hash(((s.profile && (s.profile.classId || s.profile.teamName)) || 'bizon') + '|' + (s.caseId || 'A'));

  function ensure(s) {
    if (!s) return null;
    if (s.mkt && s.mkt.v === 1) return s.mkt;
    const rnd = prng(seedOf(s));
    s.mkt = { v: 1, cities: CITY.map(c => ({ n: c.n, demand: r1(c.demand * (0.96 + rnd() * 0.08) * 100) / 100, sens: c.sens, comp: Math.round(c.comp + (rnd() - .5) * 8),
      trust: Math.round(c.trust + (rnd() - .5) * 6), ship: c.ship, price: Math.round(c.price + (rnd() - .5) * 6), played: null })), news: [], changes: [], appliedRound: 0 };
    return s.mkt;
  }
  const cityRound = s => clamp((s && s.round) || 1, 1, 6);
  function mods(s, n) {
    const m = ensure(s); const c = m.cities[(n || cityRound(s)) - 1];
    return { demand: c.demand, sens: c.sens, ship: c.ship, trust: 0.9 + c.trust / 500, comp: 0.85 + c.comp * 0.003 };
  }
  const liveState = () => (typeof S !== 'undefined' ? S : null);
  // Công tắc: ?market=off (giảng viên phát link cho cả lớp) hoặc S.marketMode = 'off'. Tắt → engine chạy y hệt bản gốc.
  const urlOff = (() => { try { return new URLSearchParams(location.search).get('market') === 'off'; } catch (e) { return false; } })();
  const enabled = s => !urlOff && !(s && s.marketMode === 'off');
  const graded = s => !!(s && s.profile && String(s.profile.classId || '').trim());
  const canToggle = s => !urlOff && !(graded(s) && s.history && s.history.length > 0);
  function setEnabled(s, on) { if (!s || !canToggle(s)) return false; s.marketMode = on ? 'on' : 'off'; if (typeof save === 'function') save(); return true; }
  // Đối thủ phản ứng theo thành phố + theo phong độ của đội (engine gọi qua window.BizonRivalAdjust)
  function rivalPlan(s, style, price, mkt) {
    if (!s || s.finished || !enabled(s)) return null;
    const m = ensure(s), c = m.cities[cityRound(s) - 1];
    const last = s.history && s.history[s.history.length - 1], lastShare = last ? last.share : 25;
    let p = price, k = mkt; const why = [];
    if (style === 'aggressive') {
      if (c.sens > 1.05) { p *= 0.95; why.push(tr('khách nhạy giá → hạ giá thêm 5%', 'price-sensitive buyers → extra 5% cut')); }
      k *= 1 + (c.comp - 50) / 250; if (c.comp > 60) why.push(tr('cạnh tranh gắt → dồn quảng cáo', 'tough competition → heavier ads'));
      if (lastShare > 32) { p *= 0.95; why.push(tr('bạn đang dẫn → phá giá', 'you lead → undercutting')); }
    } else if (style === 'balanced') {
      p = p * 0.7 + c.price * 0.3; why.push(tr(`bám giá TB thành phố (~${c.price}k)`, `tracks the city average (~${c.price}k)`));
      if (c.demand > 1.1) { k *= 1.15; why.push(tr('cầu lớn → tăng marketing', 'big demand → more marketing')); }
    } else if (style === 'premium') {
      if (c.sens < 0.95) { p *= 1.06; why.push(tr('khách ít so giá → nâng giá', 'buyers compare less → higher price')); }
      else if (c.sens > 1.1) { p *= 0.95; why.push(tr('khách nhạy giá → giảm nhẹ', 'price-sensitive → slight cut')); }
      if (c.trust < 45) { k *= 1.2; why.push(tr('niềm tin hàng Việt thấp → chiến dịch thương hiệu', 'low local trust → brand campaign')); }
      if (lastShare > 32) { k *= 1.15; why.push(tr('bạn đang dẫn → tăng quảng cáo', 'you lead → more ads')); }
    }
    return { price: p, mkt: k, why };
  }
  window.BizonRivalAdjust = (s, c, price, mkt) => { const r = rivalPlan(s, c.style, price, mkt); return r ? { price: r.price, mkt: r.mkt } : null; };

  // ---------- Móc vào engine (chỉ khi có) ----------
  const hook = () => {
    if (typeof window.currentEvent === 'function' && !window.currentEvent.__mk) {
      const orig = window.currentEvent;
      const f = function (s) {
        const ev = orig.apply(this, arguments);
        if (!ev || !s || s.finished || !enabled(s)) return ev;
        const md = mods(s); const c = CITY[cityRound(s) - 1];
        return { ...ev, demand: (ev.demand || 1) * md.demand, elasticityMul: (ev.elasticityMul || 1) * md.sens, costMul: (ev.costMul || 1) * md.ship,
          city: { n: c.n, name: c.name, mods: md } };
      };
      f.__mk = true; window.currentEvent = f;
    }
    if (typeof window.difficultyMul === 'function' && !window.difficultyMul.__mk) {
      const orig = window.difficultyMul;
      const f = function (s) { const v = orig.apply(this, arguments); return s && !s.finished && s.mkt && enabled(s) ? v * mods(s).comp : v; };
      f.__mk = true; window.difficultyMul = f;
    }
    if (typeof window.simulateRound === 'function' && !window.simulateRound.__mk) {
      const orig = window.simulateRound;
      const f = function (s, d) {
        ensure(s); const n = cityRound(s); const tf = enabled(s) ? mods(s, n).trust : 1; const b0 = s.brand;
        s.brand = b0 * tf;
        let rep;
        try { rep = orig.apply(this, arguments); } finally { if (!rep) s.brand = b0; }
        s.brand = Math.min(1.6, b0 + (s.brand - b0 * tf));
        try { afterRound(s, rep, n); } catch (e) { console.warn('[BizonMarket]', e); }
        setTimeout(() => toast(s), 2600);
        return rep;
      };
      f.__mk = true; window.simulateRound = f;
    }
  };

  // ---------- Diễn biến sau mỗi vòng ----------
  function afterRound(s, r, n) {
    const m = ensure(s); if (!r || m.appliedRound >= n) return;
    m.appliedRound = n;
    const before = m.cities.map(c => ({ ...c }));
    const c = m.cities[n - 1], d = r.decisions || {};
    const rivals = (r.rivals || []).map(x => ({ style: x.style, name: x.name, share: x.share, price: x.price, mkt: x.mkt, revenue: x.revenue || 0, profit: x.profit || 0 }));
    const all = [{ share: r.share, price: d.price || REF }].concat(rivals);
    const tot = all.reduce((a, x) => a + (x.share || 0), 0) || 1;
    c.price = Math.round(all.reduce((a, x) => a + (x.price || REF) * (x.share || 0), 0) / tot);
    c.played = { share: r1(r.share), rivals, revenue: Math.round(r.revenue || 0), profit: Math.round(r.netProfit || 0), sold: r.sold || 0, demandUnits: r.demandUnits || 0, price: d.price || REF, mkt: d.marketing || 0 };
    const conq = (s.conquest || []).find(q => q.round === n);
    c.played.win = conq ? !!conq.win : (r.share >= Math.max(0, ...rivals.map(x => x.share || 0)) && (r.netProfit || 0) > 0);
    if (!enabled(s)) { m.changes = []; m.changesRound = n; return; }
    const changes = [];
    const push = (k, text, dir) => changes.push({ n: k, text, dir });
    const fill = r.demandUnits > 0 ? r.sold / r.demandUnits : 1;
    // Quyết định của đội lan sang các thành phố sau (gần thì mạnh hơn)
    for (let k = n + 1; k <= 6; k++) {
      const f = k - n === 1 ? 1 : k - n === 2 ? 0.6 : 0.35, t = m.cities[k - 1];
      const mk = clamp(((d.marketing || 50) - 60) / 12, -4, 7) * f;
      const stock = fill < 0.9 ? -(1 - fill) * 18 * f : 0;
      const wom = r.share >= 30 ? 3 * f : 0;
      t.trust = Math.round(clamp(t.trust + mk + stock + wom, 10, 95));
      if (r.share >= 32) t.comp = Math.round(clamp(t.comp + 6 * f, 10, 95));
      if ((d.price || REF) < 132) t.sens = Math.round(clamp(t.sens + 0.05 * f, 0.75, 1.4) * 100) / 100;
      t.price = Math.round(t.price * 0.85 + ((d.price || REF) * 0.15));
    }
    const nx = m.cities[n];
    if (nx) {
      const dt = nx.trust - before[n].trust, dc = nx.comp - before[n].comp;
      if (dt >= 1) push(nx.n, tr(`Niềm tin +${dt} nhờ ${r.share >= 30 ? 'thị phần cao' : 'marketing'} ở ${CITY[n - 1].short}`, `Trust +${dt} from ${r.share >= 30 ? 'high share' : 'marketing'} in ${CITY[n - 1].short}`), 'up');
      if (dt <= -1) push(nx.n, tr(`Niềm tin ${dt} vì ${fill < 0.9 ? 'thiếu hàng' : 'quảng cáo yếu'}`, `Trust ${dt} due to ${fill < 0.9 ? 'stockouts' : 'weak ads'}`), 'down');
      if (dc >= 1) push(nx.n, tr(`Đối thủ phản công: cạnh tranh +${dc}`, `Rivals strike back: competition +${dc}`), 'down');
      if ((d.price || REF) < 132) push(nx.n, tr('Khách quen giá rẻ → nhạy giá hơn', 'Buyers expect low prices → more price-sensitive'), 'down');
    }
    // Biến cố ngẫu nhiên (seed theo lớp + vòng: mọi đội cùng lớp gặp cùng biến cố)
    if (n < 6) {
      const rnd = prng(seedOf(s) + n * 7919);
      const cnt = rnd() < 0.45 ? 2 : 1;
      for (let i = 0; i < cnt; i++) {
        const tw = SHOCKS.reduce((a, x) => a + x.w, 0); let p = rnd() * tw, sh = SHOCKS[0];
        for (const x of SHOCKS) { if ((p -= x.w) <= 0) { sh = x; break; } }
        const pool = (sh.pick || [2, 3, 4, 5, 6]).filter(k => k > n);
        const targets = sh.all ? m.cities.filter(t => t.n > n) : pool.length ? [m.cities[pool[Math.floor(rnd() * pool.length)] - 1]] : [];
        if (!targets.length) continue;
        targets.forEach(t => {
          const e = sh.eff;
          if (e.demand) t.demand = Math.round(clamp(t.demand * (1 + e.demand), 0.6, 1.6) * 100) / 100;
          if (e.ship) t.ship = Math.round(clamp(t.ship + e.ship, 0.95, 1.3) * 100) / 100;
          if (e.sens) t.sens = Math.round(clamp(t.sens + e.sens, 0.75, 1.4) * 100) / 100;
          if (e.comp) t.comp = Math.round(clamp(t.comp + e.comp, 10, 95));
          if (e.trust) t.trust = Math.round(clamp(t.trust + e.trust, 10, 95));
        });
        const where = sh.all ? tr('toàn quốc', 'nationwide') : CITY[targets[0].n - 1].short;
        m.news.unshift({ round: n, icon: sh.icon, id: sh.id, n: sh.all ? 0 : targets[0].n, title: `${tr(sh.vi, sh.en)} · ${where}`, desc: tr(sh.dvi, sh.den), eff: sh.eff });
        push(sh.all ? 0 : targets[0].n, `${sh.icon} ${tr(sh.vi, sh.en)} · ${where}`, (sh.eff.demand > 0 || sh.eff.trust > 0) ? 'up' : 'down');
      }
    }
    m.news = m.news.slice(0, 12);
    m.changes = changes; m.changesRound = n;
  }

  // ---------- Ảnh chụp dữ liệu cho UI ----------
  function snapshot(s) {
    s = s || liveState(); if (!s) return null;
    const m = ensure(s), cur = s.finished ? 7 : cityRound(s);
    const shares = [{ name: tr('Bạn', 'You'), c: ME_C, v: (s.history && s.history.length ? s.history[s.history.length - 1].share : 25), me: true }]
      .concat((s.competitors || []).map(x => ({ name: (RIV[x.style] || {}).n || x.name, c: (RIV[x.style] || {}).c || '#888', v: x.share || 25 })));
    return {
      cur, round: s.round, finished: !!s.finished, enabled: enabled(s), canToggle: canToggle(s), news: m.news, changes: m.changes, changesRound: m.changesRound || 0, shares,
      cities: m.cities.map((c, i) => {
        const md = mods(s, c.n);
        return { ...c, name: CITY[i].name, short: CITY[i].short, status: c.played ? 'done' : c.n === cur ? 'cur' : 'next', mods: md,
          units: Math.round(BASE_UNITS * c.demand), size: Math.round(BASE_UNITS * c.demand * c.price / 1000) };
      }),
    };
  }

  // ---------- CSS ----------
  const CSS = `
#bzmk{position:fixed;inset:0;z-index:90;background:rgba(3,51,55,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit;color:#033337;backdrop-filter:blur(3px)}
#bzmk *{box-sizing:border-box}
#bzmk .cd{width:100%;max-width:1120px;max-height:calc(100vh - 32px);overflow:auto;background:#f4faff;border:4px solid #dbe9f0;border-radius:28px;box-shadow:10px 10px 30px rgba(0,40,60,.3);padding:22px}
#bzmk .hd{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;margin-bottom:16px}
#bzmk .k{font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#b0501a}
#bzmk h2{margin:4px 0 0;font-size:28px;font-weight:900;color:#006687;line-height:1.15}
#bzmk .x{font:inherit;font-weight:800;border:0;border-radius:14px;padding:11px 18px;cursor:pointer;background:#006687;color:#fff;font-size:14px}
#bzmk .x:hover{background:#0f7596}
#bzmk .hb{display:flex;gap:8px;flex-wrap:wrap}
#bzmk .x2{font:inherit;font-weight:800;border:2px solid #dbe9f0;border-radius:14px;padding:9px 14px;cursor:pointer;background:#fff;color:#006687;font-size:13px}
#bzmk .x2:disabled{opacity:.5;cursor:not-allowed}
#bzmk .lb{display:grid;grid-template-columns:28px minmax(0,1.4fr) repeat(4,minmax(0,1fr));gap:6px 10px;align-items:center;font-size:13px}
#bzmk .lb .h{font-size:10px;font-weight:900;color:#8a9aa2;text-transform:uppercase;letter-spacing:.06em}
#bzmk .lb .r{text-align:right;font-weight:800}#bzmk .lb .me{color:#006687;font-weight:900}
#bzmk .lb .rk{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:12px}
@media (max-width:760px){#bzmk .lb{grid-template-columns:24px minmax(0,1.2fr) repeat(2,minmax(0,1fr))}#bzmk .lb .o{display:none}}
#bzmk .live{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:#0a7a45;background:#e3f6ec;border-radius:999px;padding:4px 10px;margin-left:8px;vertical-align:middle}
#bzmk .live i{width:8px;height:8px;border-radius:50%;background:#12a05c;animation:bzmk-blink 1.2s infinite}
#bzmk .top{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px;margin-bottom:14px}
#bzmk .pn{background:#fff;border:3px solid #dbe9f0;border-radius:22px;padding:16px;min-width:0}
#bzmk .pn h3{margin:0 0 10px;font-size:13px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#33525a}
#bzmk .kp{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
#bzmk .kp div{background:#f4faff;border-radius:14px;padding:10px 12px}
#bzmk .kp small{display:block;font-size:11px;font-weight:700;color:#5d6770}
#bzmk .kp b{font-size:20px;font-weight:900;color:#033337}
#bzmk .kp em{font-style:normal;font-size:12px;font-weight:800;margin-left:4px}
#bzmk .up{color:#0a7a45}#bzmk .dn{color:#c0392b}
#bzmk .fx{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
#bzmk .fx span{font-size:12px;font-weight:800;border-radius:999px;padding:4px 10px;background:#eef6fb}
#bzmk .sb{display:flex;height:14px;border-radius:7px;overflow:hidden;background:#dbe9f0;margin:6px 0 4px}
#bzmk .sb i{display:block;height:100%}
#bzmk .lg{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;font-weight:700}
#bzmk .lg span{display:inline-flex;align-items:center;gap:5px}#bzmk .lg i{width:10px;height:10px;border-radius:3px;display:inline-block}
#bzmk .nw{display:flex;flex-direction:column;gap:8px}
#bzmk .nw div{display:grid;grid-template-columns:28px minmax(0,1fr);gap:8px;align-items:start;background:#f4faff;border-radius:14px;padding:9px 10px}
#bzmk .nw b{display:block;font-size:13px}#bzmk .nw p{margin:2px 0 0;font-size:12px;color:#33525a;line-height:1.4}
#bzmk .nw .ic{font-size:20px;line-height:1}
#bzmk .ch{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
#bzmk .ch li{font-size:13px;font-weight:700;padding:8px 10px;border-radius:12px;background:#fff7ef}
#bzmk .ch li.up{background:#e9f7ef;color:#0a5a35}#bzmk .ch li.down{background:#fdeeee;color:#8e2a1f}
#bzmk .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:10px}
#bzmk .cc{background:#fff;border:3px solid #dbe9f0;border-radius:20px;padding:12px;cursor:pointer;text-align:left;font:inherit;color:inherit;min-width:0}
#bzmk .cc[aria-pressed="true"]{border-color:#006687;box-shadow:0 0 0 3px rgba(0,102,135,.15)}
#bzmk .cc.cur{border-color:#f08a3c}
#bzmk .cc .t{display:flex;justify-content:space-between;align-items:center;gap:6px;font-weight:900;font-size:14px}
#bzmk .cc .st{font-size:10px;font-weight:900;letter-spacing:.06em;border-radius:999px;padding:2px 8px;background:#eef6fb;color:#33525a;white-space:nowrap}
#bzmk .cc.cur .st{background:#f08a3c;color:#fff}#bzmk .cc.done .st{background:#006687;color:#fff}
#bzmk .cc .pr{font-size:22px;font-weight:900;margin:6px 0 2px}#bzmk .cc .pr small{font-size:12px;font-weight:700;color:#5d6770}
#bzmk .mt{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 6px;align-items:center;font-size:11px;font-weight:700;color:#33525a}
#bzmk .mt .b{height:6px;border-radius:3px;background:#e6eef2;overflow:hidden}#bzmk .mt .b i{display:block;height:100%;border-radius:3px}
#bzmk svg.sp{width:100%;height:70px;display:block}
@keyframes bzmk-blink{50%{opacity:.25}}
@media (max-width:760px){#bzmk{padding:8px}#bzmk .cd{padding:14px;border-radius:22px;max-height:calc(100vh - 16px)}#bzmk .top{grid-template-columns:minmax(0,1fr)}#bzmk h2{font-size:22px}}
#bzmk-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:95;background:#033337;color:#fff;border-radius:18px;padding:12px 14px 12px 16px;display:flex;gap:12px;align-items:center;font-family:inherit;font-size:14px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,.3);max-width:calc(100% - 24px)}
#bzmk-toast button{font:inherit;font-weight:800;border:0;border-radius:12px;padding:9px 14px;cursor:pointer;background:#f08a3c;color:#fff;white-space:nowrap}
#bzmk-toast .c{background:transparent;padding:6px;color:#9fc3c9}
.bzmk-tv{position:absolute;inset:7px;border-radius:5px;background:#0d1117;color:#cfe3dc;font:700 11px/1.35 ui-monospace,Menlo,Consolas,monospace;overflow:hidden;cursor:pointer;padding:6px 8px}
.bzmk-tv .h{display:flex;justify-content:space-between;color:#8fa89f;font-size:10px;letter-spacing:.1em;margin-bottom:3px}
.bzmk-tv .h i{font-style:normal;color:#35d07f}
.bzmk-tv .r{display:flex;justify-content:space-between;gap:8px;white-space:nowrap}
.bzmk-tv .u{color:#35d07f}.bzmk-tv .d{color:#ff6b5e}.bzmk-tv .me{color:#ffc94a}
.bzmk-pill{font:inherit;cursor:pointer;background:#033337!important;color:#fff!important;border-color:#033337!important}`;
  const css = () => { if (!document.getElementById('bzmk-css')) { const st = document.createElement('style'); st.id = 'bzmk-css'; st.textContent = CSS; document.head.appendChild(st); } };

  // ---------- Giá live (chỉ hiển thị; không ảnh hưởng mô phỏng) ----------
  const tick = { p: {}, prev: {}, hist: {}, t: null, subs: new Set() };
  function tickOnce() {
    const snap = snapshot(); if (!snap) return;
    snap.cities.forEach(c => {
      const base = c.price, p = tick.p[c.n] ?? base;
      const vol = c.status === 'done' ? 0.002 : 0.006 + c.comp / 12000;
      const nv = clamp(p + (base - p) * 0.25 + (Math.random() - 0.5) * 2 * base * vol, base * 0.94, base * 1.06);
      tick.prev[c.n] = p; tick.p[c.n] = nv;
      (tick.hist[c.n] ||= []).push(nv); if (tick.hist[c.n].length > 40) tick.hist[c.n].shift();
    });
    tick.subs.forEach(f => { try { f(); } catch (e) { tick.subs.delete(f); } });
  }
  const sub = f => { tick.subs.add(f); if (!tick.t) { for (let i = 0; i < 12; i++) tickOnce(); tick.t = setInterval(tickOnce, 1200); } return () => { tick.subs.delete(f); if (!tick.subs.size) { clearInterval(tick.t); tick.t = null; } }; };
  const lp = n => tick.p[n] ?? (snapshot() || { cities: [] }).cities[n - 1]?.price ?? REF;
  const ld = n => (tick.p[n] ?? 0) - (tick.prev[n] ?? tick.p[n] ?? 0);

  // ---------- Bảng thị trường ----------
  const pct = v => (v >= 1 ? '+' : '') + Math.round((v - 1) * 100) + '%';
  const heat = v => `hsl(${Math.round((1 - v / 100) * 130)},65%,45%)`;
  function open(opts) {
    opts = opts || {}; css();
    const s = liveState(); const snap = snapshot(s); if (!snap) return;
    document.getElementById('bzmk')?.remove();
    let sel = opts.city || (snap.cur <= 6 ? snap.cur : 6);
    const root = document.createElement('div'); root.id = 'bzmk';
    root.innerHTML = '<div class="cd" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(root);
    const cd = root.querySelector('.cd');
    const render = () => {
      const sn = snapshot(s), c = sn.cities[sel - 1], md = c.mods, pl = c.played;
      const title = opts.result && sn.changesRound ? tr(`Thị trường sau vòng ${sn.changesRound}`, `Market after round ${sn.changesRound}`) : tr('Thị trường 6 thành phố', 'Six-city market');
      const shareRow = pl ? [{ name: tr('Bạn', 'You'), c: ME_C, v: pl.share }].concat(pl.rivals.map(x => ({ name: (RIV[x.style] || {}).n || x.name, c: (RIV[x.style] || {}).c || '#888', v: x.share }))) : sn.shares;
      const tot = shareRow.reduce((a, x) => a + x.v, 0) || 1;
      const h = tick.hist[sel] || [c.price], mn = Math.min(...h) - 1, mx = Math.max(...h) + 1;
      const pts = h.map((v, i) => `${(i / Math.max(1, h.length - 1) * 300).toFixed(1)},${(66 - (v - mn) / (mx - mn) * 60).toFixed(1)}`).join(' ');
      const dP = ld(sel);
      const changes = opts.result && sn.changes.length ? `<div class="pn" style="margin-bottom:14px"><h3>${tr('Điều gì đã thay đổi', 'What changed')}</h3><ul class="ch">${sn.changes.map(x => `<li class="${x.dir}">${x.n ? `<b>${CITY[x.n - 1].short}:</b> ` : ''}${x.text}</li>`).join('')}</ul></div>` : '';
      cd.innerHTML = `<div class="hd"><div><div class="k">${tr('Vòng', 'Round')} ${Math.min(sn.round, 6)} · ${tr('Thị trường động', 'Dynamic market')}</div><h2>${title}${sn.enabled ? '<span class="live"><i></i>LIVE</span>' : `<span class="live" style="background:#eee;color:#5d6770">${tr('ĐANG TẮT', 'OFF')}</span>`}</h2></div>
        <div class="hb">${sn.finished ? `<button class="x2 sm">🏁 ${tr('Tổng kết', 'Summary')}</button>` : ''}<button class="x2 tg" ${sn.canToggle ? '' : 'disabled'} title="${sn.canToggle ? '' : tr('Bản tính điểm: chỉ đổi trước vòng 1', 'Graded: only before round 1')}">${sn.enabled ? tr('Tắt thị trường động', 'Turn off dynamic market') : tr('Bật thị trường động', 'Turn on dynamic market')}</button><button class="x">${opts.btn || tr('Đóng', 'Close')}</button></div></div>
        ${sn.enabled ? '' : `<div class="pn" style="margin-bottom:14px">${tr('Thị trường động đang tắt: mô phỏng chạy như bản gốc (điểm giữ như cũ). Số liệu thành phố vẫn được ghi lại để tổng kết.', 'The dynamic market is off: the simulation runs like the original (scores unchanged). City results are still recorded for the summary.')}</div>`}
        ${changes}
        <div class="top"><div class="pn"><h3>${c.name} · ${c.status === 'done' ? tr('đã chơi', 'played') : c.status === 'cur' ? tr('vòng hiện tại', 'current round') : tr('sắp tới', 'upcoming')}</h3>
          <div class="kp">
            <div><small>${tr('Giá TB thị trường', 'Avg market price')}</small><b>${lp(sel).toFixed(1)}k</b><em class="${dP >= 0 ? 'up' : 'dn'}">${dP >= 0 ? '▲' : '▼'}${Math.abs(dP).toFixed(1)}</em></div>
            <div><small>${tr('Nhu cầu', 'Demand')}</small><b>${c.units.toLocaleString('vi-VN')}</b><em>${tr('sp', 'units')}</em></div>
            <div><small>${pl ? tr('Doanh thu của bạn', 'Your revenue') : tr('Quy mô thị trường', 'Market size')}</small><b>${(pl ? pl.revenue : c.size).toLocaleString('vi-VN')}</b><em>tr₫</em></div>
            <div><small>${tr('Cạnh tranh', 'Competition')}</small><b style="color:${heat(c.comp)}">${c.comp}</b><em>/100</em></div>
            <div><small>${tr('Niềm tin khách hàng', 'Customer trust')}</small><b>${c.trust}</b><em>/100</em></div>
            <div><small>${tr('Chi phí vận chuyển', 'Shipping cost')}</small><b>${pct(c.ship)}</b><em>${tr('giá thành', 'unit cost')}</em></div>
          </div>
          <svg class="sp" viewBox="0 0 300 70" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#006687" stroke-width="2.5" vector-effect="non-scaling-stroke"></polyline></svg>
          <h3 style="margin-top:6px">${pl ? tr('Thị phần tại đây', 'Share here') : tr('Thị phần hiện tại (toàn cuộc đua)', 'Current share (overall race)')}</h3>
          <div class="sb">${shareRow.map(x => `<i style="width:${(x.v / tot * 100).toFixed(1)}%;background:${x.c}"></i>`).join('')}</div>
          <div class="lg">${shareRow.map(x => `<span><i style="background:${x.c}"></i>${x.name} ${r1(x.v)}%</span>`).join('')}</div>
          ${c.status !== 'done' ? `<h3 style="margin-top:14px">${tr('Tác động lên mô phỏng vòng này', 'Effect on this round’s simulation')}</h3>
          <div class="fx"><span>${tr('Cầu', 'Demand')} ${pct(md.demand)}</span><span>${tr('Độ nhạy giá', 'Price sensitivity')} ${pct(md.sens)}</span><span>${tr('Chi phí', 'Cost')} ${pct(md.ship)}</span><span>${tr('Sức hút của bạn', 'Your pull')} ${pct(md.trust)}</span><span>${tr('Sức hút đối thủ', 'Rival pull')} ${pct(md.comp)}</span></div>` :
          `<div class="fx"><span>${tr('Giá bạn đặt', 'Your price')} ${pl.price}k</span><span>${tr('Bán', 'Sold')} ${pl.sold.toLocaleString('vi-VN')}/${pl.demandUnits.toLocaleString('vi-VN')}</span><span class="${pl.profit >= 0 ? 'up' : 'dn'}">${tr('Lãi', 'Profit')} ${pl.profit}tr₫</span></div>`}
        </div>
        <div class="pn"><h3>${tr('Tin thị trường', 'Market news')}</h3><div class="nw">${sn.news.length ? sn.news.map(x => `<div><span class="ic">${x.icon}</span><span><b>${x.title}</b><p>${tr('Sau vòng', 'After round')} ${x.round} · ${x.desc}</p></span></div>`).join('') :
          `<div><span class="ic">🌤️</span><span><b>${tr('Chưa có biến động', 'No shocks yet')}</b><p>${tr('Sau mỗi vòng, quyết định của đội và biến cố ngẫu nhiên sẽ làm các thành phố sắp tới thay đổi.', 'After each round, your decisions and random shocks reshape the upcoming cities.')}</p></span></div>`}</div></div></div>
        <div class="gr">${sn.cities.map(x => { const d = ld(x.n); return `<button class="cc ${x.status}" data-n="${x.n}" aria-pressed="${x.n === sel}">
          <div class="t"><span>${x.n}. ${x.short}</span><span class="st">${x.status === 'done' ? '🚩 ' + tr('XONG', 'DONE') : x.status === 'cur' ? tr('ĐANG ĐUA', 'LIVE') : tr('SẮP TỚI', 'NEXT')}</span></div>
          <div class="pr">${lp(x.n).toFixed(1)}<small>k₫ </small><small class="${d >= 0 ? 'up' : 'dn'}">${d >= 0 ? '▲' : '▼'}</small></div>
          <div class="mt"><span>${tr('Cầu', 'Dem.')}</span><span class="b"><i style="width:${clamp(x.demand / 1.6 * 100, 5, 100)}%;background:#006687"></i></span><span>${x.demand.toFixed(2)}×</span>
          <span>${tr('C.tranh', 'Comp.')}</span><span class="b"><i style="width:${x.comp}%;background:${heat(x.comp)}"></i></span><span>${x.comp}</span>
          <span>${tr('Niềm tin', 'Trust')}</span><span class="b"><i style="width:${x.trust}%;background:#f08a3c"></i></span><span>${x.trust}</span>
          <span>${tr('V.chuyển', 'Ship')}</span><span class="b"><i style="width:${clamp((x.ship - 0.95) / 0.35 * 100, 4, 100)}%;background:#6b7c86"></i></span><span>${pct(x.ship)}</span>
          ${x.played ? `<span title="${tr('% khách chọn bạn trong thành phố này', 'Your % share of customers in this city')}">${tr('Bạn', 'You')}</span><span class="b"><i style="width:${clamp(x.played.share, 2, 100)}%;background:${ME_C}"></i></span><span>${x.played.share}%</span>` : ''}</div></button>`; }).join('')}</div>`;
      cd.querySelector('.x').onclick = close;
      const tg = cd.querySelector('.tg'); if (tg) tg.onclick = () => { setEnabled(s, !enabled(s)); render(); };
      const smb = cd.querySelector('.sm'); if (smb) smb.onclick = () => { close(); openSummary(); };
      cd.querySelectorAll('.cc').forEach(b => b.onclick = () => { sel = +b.dataset.n; render(); });
    };
    const unsub = sub(render);
    const close = () => { unsub(); root.remove(); window.removeEventListener('keydown', kd); opts.onClose && opts.onClose(); };
    const kd = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', kd);
    root.addEventListener('click', e => { if (e.target === root) close(); });
    render();
    return { close };
  }

  // ---------- Tổng kết 6 vòng ----------
  function openSummary(opts) {
    opts = opts || {}; css();
    const s = liveState(); const sn = snapshot(s); if (!sn) return;
    document.getElementById('bzmk')?.remove();
    const played = sn.cities.filter(c => c.played);
    const teams = [{ key: 'me', name: (s.profile && s.profile.teamName) || tr('Đội bạn', 'Your team'), c: ME_C }]
      .concat((s.competitors || []).map(x => ({ key: x.style, name: x.name, c: (RIV[x.style] || {}).c || '#888' })));
    const pick = (c, t) => t.key === 'me' ? { share: c.played.share, revenue: c.played.revenue, profit: c.played.profit } : (c.played.rivals.find(x => x.style === t.key) || { share: 0, revenue: 0, profit: 0 });
    teams.forEach(t => {
      t.rows = played.map(c => pick(c, t));
      t.rev = t.rows.reduce((a, x) => a + (x.revenue || 0), 0); t.prof = t.rows.reduce((a, x) => a + (x.profit || 0), 0);
      t.avg = t.rows.length ? t.rows.reduce((a, x) => a + (x.share || 0), 0) / t.rows.length : 0;
      t.flags = played.filter(c => t.key === 'me' ? c.played.win : !c.played.win && (() => { const top = c.played.rivals.slice().sort((a, b) => b.share - a.share)[0]; return top && top.style === t.key; })()).length;
    });
    const rank = teams.slice().sort((a, b) => b.flags - a.flags || b.prof - a.prof);
    // Biểu đồ 1: thị phần xếp chồng theo thành phố
    const W = 640, H = 230, pad = 34, bw = (W - pad * 2) / 6;
    const bars = sn.cities.map((c, i) => {
      const x = pad + i * bw + bw * 0.18, w = bw * 0.64;
      if (!c.played) return `<rect x="${x}" y="${pad}" width="${w}" height="${H - pad * 2}" rx="8" fill="#eef3f6"></rect><text x="${x + w / 2}" y="${H - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="#8a9aa2">${c.short}</text>`;
      const segs = teams.map(t => ({ c: t.c, v: pick(c, t).share || 0 })); const tot = segs.reduce((a, x) => a + x.v, 0) || 1;
      let y = pad; const hh = H - pad * 2;
      const r = segs.map(sg2 => { const h = sg2.v / tot * hh; const el = `<rect x="${x}" y="${y.toFixed(1)}" width="${w}" height="${Math.max(0, h - 1).toFixed(1)}" fill="${sg2.c}"></rect>`; y += h; return el; }).join('');
      return `${r}${c.played.win ? `<text x="${x + w / 2}" y="${pad - 8}" text-anchor="middle" font-size="16">🚩</text>` : ''}<text x="${x + w / 2}" y="${pad + 16}" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">${c.played.share}%</text><text x="${x + w / 2}" y="${H - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="#033337">${c.short}</text>`;
    }).join('');
    // Biểu đồ 2: doanh thu & lãi của bạn theo thành phố
    const me = teams[0], maxV = Math.max(1, ...me.rows.map(x => Math.max(x.revenue, Math.abs(x.profit)))) * 1.1;
    const H2 = 220, base = H2 - 40, sc = (base - 20) / maxV;
    const rev = sn.cities.map((c, i) => { const x = pad + i * bw + bw * 0.22, w = bw * 0.56; const lab = `<text x="${x + w / 2}" y="${H2 - 14}" text-anchor="middle" font-size="12" font-weight="800" fill="${c.played ? '#033337' : '#8a9aa2'}">${c.short}</text>`;
      if (!c.played) return lab; const h = c.played.revenue * sc;
      return `<rect x="${x}" y="${(base - h).toFixed(1)}" width="${w}" height="${h.toFixed(1)}" rx="6" fill="#9fd0e0"></rect><text x="${x + w / 2}" y="${(base - h - 6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="#006687">${c.played.revenue}</text>${lab}`; }).join('');
    const pp = sn.cities.map((c, i) => c.played ? [pad + i * bw + bw / 2, base - Math.max(0, c.played.profit) * sc + (c.played.profit < 0 ? Math.min(18, -c.played.profit * sc) : 0), c.played.profit] : null).filter(Boolean);
    const line = pp.length ? `<polyline points="${pp.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="none" stroke="#f08a3c" stroke-width="3"></polyline>${pp.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5" fill="${p[2] >= 0 ? '#f08a3c' : '#c0392b'}" stroke="#fff" stroke-width="2"></circle>`).join('')}` : '';
    const root = document.createElement('div'); root.id = 'bzmk';
    root.innerHTML = `<div class="cd" role="dialog" aria-modal="true"><div class="hd"><div><div class="k">${tr('Tổng kết hành trình', 'Journey summary')} · ${played.length}/6 ${tr('thành phố', 'cities')}</div><h2>${rank[0].key === 'me' ? tr('🏆 Đội bạn dẫn đầu!', '🏆 Your team finished first!') : tr(`Hạng ${rank.indexOf(me) + 1}/4 · ${rank[0].name} dẫn đầu`, `Rank ${rank.indexOf(me) + 1}/4 · ${rank[0].name} leads`)}</h2></div><div class="hb"><button class="x2 bd">📈 ${tr('Bảng thị trường', 'Market board')}</button><button class="x">${opts.btn || tr('Đóng', 'Close')}</button></div></div>
      <div class="pn" style="margin-bottom:14px"><h3>${tr('Bảng xếp hạng cuối', 'Final leaderboard')}</h3><div class="lb">
        <span class="h"></span><span class="h">${tr('Đội', 'Team')}</span><span class="h r">🚩 ${tr('Cờ', 'Flags')}</span><span class="h r">${tr('Lãi', 'Profit')}</span><span class="h r o">${tr('Doanh thu', 'Revenue')}</span><span class="h r o" title="${tr('Thị phần trung bình qua các thành phố đã chơi', 'Average % share across cities played')}">${tr('TP TB', 'Avg share')}</span>
        ${rank.map((t, i) => `<span class="rk" style="background:${t.c}">${i + 1}</span><span class="${t.key === 'me' ? 'me' : ''}">${t.name}</span><span class="r">${t.flags}</span><span class="r" style="color:${t.prof >= 0 ? '#0a7a45' : '#c0392b'}">${t.prof.toLocaleString('vi-VN')}tr</span><span class="r o">${t.rev.toLocaleString('vi-VN')}tr</span><span class="r o">${t.avg.toFixed(1)}%</span>`).join('')}
      </div><p style="margin:10px 0 0;font-size:12px;color:#5d6770">${tr('Xếp theo số cờ, rồi tổng lãi. Cờ của đối thủ = thành phố họ có thị phần cao nhất khi đội bạn không cắm được cờ.', 'Ranked by flags, then total profit. A rival flag = a city where they had the top share and your team did not plant a flag.')}</p></div>
      <div class="top"><div class="pn"><h3>${tr('Thị phần theo thành phố', 'Share by city')}</h3><p style="margin:-4px 0 10px;font-size:11px;color:#5d6770">${tr('Mỗi cột = 100% khách ở thành phố đó, chia theo % mỗi đội giành được', "Each bar = 100% of that city's customers, split by each team's % share")}</p><svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">${bars}</svg>
        <div class="lg">${teams.map(t => `<span><i style="background:${t.c}"></i>${t.key === 'me' ? tr('Bạn', 'You') : (RIV[t.key] || {}).n || t.name}</span>`).join('')}</div></div>
      <div class="pn"><h3>${tr('Doanh thu & lãi của bạn (tr₫)', 'Your revenue & profit (m₫)')}</h3><svg viewBox="0 0 ${W} ${H2}" style="width:100%;height:auto;display:block"><line x1="${pad}" x2="${W - pad}" y1="${base}" y2="${base}" stroke="#dbe9f0" stroke-width="2"></line>${rev}${line}</svg>
        <div class="lg"><span><i style="background:#9fd0e0"></i>${tr('Doanh thu', 'Revenue')}</span><span><i style="background:#f08a3c"></i>${tr('Lãi ròng', 'Net profit')}</span></div></div></div></div>`;
    document.body.appendChild(root);
    const close = () => { root.remove(); window.removeEventListener('keydown', kd); opts.onClose && opts.onClose(); };
    const kd = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', kd);
    root.querySelector('.x').onclick = close; root.querySelector('.bd').onclick = () => { close(); open(); };
    root.addEventListener('click', e => { if (e.target === root) close(); });
    return { close };
  }

  function toast(s) {
    css(); const sn = snapshot(s); if (!sn || !sn.changesRound) return;
    if (s.finished) {
      document.getElementById('bzmk-toast')?.remove();
      const t = document.createElement('div'); t.id = 'bzmk-toast';
      t.innerHTML = `<span>🏁 ${tr('Hoàn thành 6 thành phố!', 'All 6 cities done!')}</span><button class="o">${tr('Xem tổng kết', 'See summary')}</button><button class="c" aria-label="close">✕</button>`;
      document.body.appendChild(t);
      t.querySelector('.o').onclick = () => { t.remove(); openSummary(); }; t.querySelector('.c').onclick = () => t.remove();
      return;
    }
    if (!enabled(s)) return;
    document.getElementById('bzmk-toast')?.remove();
    const t = document.createElement('div'); t.id = 'bzmk-toast';
    const n = sn.changes.length;
    t.innerHTML = `<span>📈 ${n ? tr(`Thị trường vừa biến động: ${n} thay đổi`, `The market just moved: ${n} change${n > 1 ? 's' : ''}`) : tr('Thị trường đã cập nhật sau vòng', 'Market updated after the round')}</span><button class="o">${tr('Xem', 'View')}</button><button class="c" aria-label="close">✕</button>`;
    document.body.appendChild(t);
    const kill = () => t.remove();
    t.querySelector('.o').onclick = () => { kill(); open({ result: true }); };
    t.querySelector('.c').onclick = kill;
    setTimeout(kill, 14000);
  }

  // ---------- TV live + nút HUD trong văn phòng ----------
  function decorateOffice(root) {
    if (!root || root.__mk) return; root.__mk = true; css();
    const hud = root.querySelector('.hud');
    if (hud) { const b = document.createElement('button'); b.className = 'pill bzmk-pill'; b.textContent = '📈 ' + tr('Thị trường', 'Market'); b.onclick = e => { e.stopPropagation(); open(); }; hud.appendChild(b); }
    const tvs = root.querySelectorAll('.tv'); const tv = tvs[1] || tvs[0];
    if (!tv) return;
    const box = document.createElement('div'); box.className = 'bzmk-tv'; tv.appendChild(box);
    box.onclick = e => { e.stopPropagation(); open(); };
    const paint = () => {
      if (!document.body.contains(box)) { unsub(); return; }
      const sn = snapshot(); if (!sn) return;
      if (!sn.enabled) { box.innerHTML = `<div class="h"><span>BIZON · ${tr('THỊ TRƯỜNG', 'MARKET')}</span><span>OFF</span></div><div class="r">${tr('Thị trường động đang tắt', 'Dynamic market is off')}</div>`; return; }
      box.innerHTML = `<div class="h"><span>BIZON · ${tr('THỊ TRƯỜNG', 'MARKET')}</span><i>● LIVE</i></div>` + sn.cities.map(c => { const d = ld(c.n); return `<div class="r ${c.status === 'cur' ? 'me' : ''}"><span>${c.short}</span><span class="${d >= 0 ? 'u' : 'd'}">${lp(c.n).toFixed(1)} ${d >= 0 ? '▲' : '▼'}</span></div>`; }).join('');
    };
    const unsub = sub(paint);
  }
  const mo = new MutationObserver(() => { const o = document.getElementById('bzo'); if (o && !o.__mk) setTimeout(() => decorateOffice(o), 60); });
  const start = () => { hook(); if (document.body) mo.observe(document.body, { childList: true }); const o = document.getElementById('bzo'); if (o) decorateOffice(o); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  hook();

  window.BizonMarket = { open, openSummary, snapshot, ensure, mods, enabled, setEnabled, canToggle, rivalPlan, afterRound: (s, r) => { afterRound(s, r, r && r.round || cityRound(s)); toast(s); }, livePrice: lp, CITY };
})();
