/* CHAM Homestay – các phép tính thuần của bộ học liệu, dùng chung Node (test) và trình duyệt.
 * - founder: mô hình 5 năm của Trò chơi nhà sáng lập (7 quyết định, so với kế hoạch gốc 2017).
 * - kit: máy tính doanh thu & hòa vốn năm 1 của Bộ công cụ giảng dạy.
 * - arena: engine tất định của kịch bản Bậc 2 «Đấu trường Cù lao Tân Lộc» (4 homestay, 6 mùa).
 * - mã kết quả base64 (UTF-8) để dán vào Bảng điều khiển giảng viên; giải mã có kiểm tra.
 * Đơn vị tiền: triệu đồng, trừ giá phòng/vé tính bằng nghìn đồng như bản thiết kế.
 * Mọi hệ số của Đấu trường là ĐỀ XUẤT, cần hiệu chỉnh khi chạy thử với lớp thật (docs/cham/kich-ban-tan-loc.md).
 * CHAM™ và nội dung tình huống © 2017–2026 Đỗ Thùy Hương, dùng trên BizOn theo giấy phép không độc quyền. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.ChamEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------- Trò chơi nhà sáng lập ---------------- */
  const PLAN = Object.freeze({ room: 50, demand: 'plan', mkt: 'paid', staff: 'plan', tea: 40, occ: 'plan', cap: 500 });
  const CHOICES = Object.freeze({ room: [50, 500], demand: ['plan', 'season'], mkt: ['paid', 'organic'], staff: ['plan', 'paid'], tea: [40, 80], occ: ['plan', 'half'], cap: [500, 4000] });
  const KEYS = Object.keys(CHOICES);
  const DEPRECIATION = 160;
  const GROWTH = [1, 1.3299, 1.2312, 1.3176, 1.3233];
  const PLAN_COST = [798.25, 697, 702.7, 681.2, 694];

  function founderModel(c) {
    const r = c.demand === 'plan' ? 1 : 0.75;
    const rev1 = (576 + (c.occ === 'plan' ? 1800 : 1095) * c.room / 1000 + 1095 + (c.tea - 40) * 1.44) * r;
    const mktDelta = c.mkt === 'paid' ? 0 : -120.45;
    const staffDelta = c.staff === 'plan' ? 0 : 384;
    let cum = 0, payYear = null;
    const years = GROWTH.map((g, i) => {
      const rev = rev1 * g, cost = PLAN_COST[i] + staffDelta + (i === 0 ? mktDelta : 0), tax = rev * 0.045 + 1;
      const profit = rev - cost - tax; cum += profit + DEPRECIATION;
      if (payYear === null && cum >= c.cap) payYear = i + 1;
      return { rev, cost, tax, profit, cum };
    });
    const y = years[0];
    return { years, payYear, pb: c.cap / (y.profit + DEPRECIATION), y1: y.profit, rev1: y.rev };
  }

  function validChoices(c) {
    if (!c || typeof c !== 'object') return null;
    const out = {};
    for (const k of KEYS) { if (!CHOICES[k].includes(c[k])) return null; out[k] = c[k]; }
    return out;
  }

  /* ---------------- Mã kết quả ---------------- */
  function b64encode(str) {
    if (typeof Buffer !== 'undefined') return Buffer.from(str, 'utf8').toString('base64');
    const bytes = new TextEncoder().encode(str); let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function b64decode(code) {
    if (typeof Buffer !== 'undefined') return Buffer.from(code, 'base64').toString('utf8');
    const bin = atob(code); const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  const cleanName = n => String(n == null ? '' : n).replace(/\s+/g, ' ').trim().slice(0, 40) || '—';

  function resultOf(name, c) {
    const m = founderModel(c);
    return { name: cleanName(name), cash: Math.round(m.years[4].cum), pay: m.payYear, c: Object.assign({}, c) };
  }
  const encodeResult = r => b64encode(JSON.stringify({ name: cleanName(r.name), cash: r.cash, pay: r.pay, c: r.c }));
  /* Giải mã một mã; trả null nếu hỏng. Dòng tiền và năm hòa vốn được TÍNH LẠI từ các lựa chọn,
     nên mã sửa tay không gian lận được bảng xếp hạng. */
  function decodeResult(code) {
    try {
      const o = JSON.parse(b64decode(String(code).trim()));
      const c = validChoices(o && o.c);
      if (!c) return null;
      return resultOf(o.name, c);
    } catch (e) { return null; }
  }
  function decodeMany(text) {
    const ok = [], bad = [];
    String(text || '').split(/\s+/).filter(Boolean).forEach(code => { const r = decodeResult(code); if (r) ok.push(r); else bad.push(code); });
    return { ok, bad };
  }
  /* Bảng xếp hạng: sắp theo dòng tiền 5 năm, giữ tối đa `max` dòng */
  const rankBoard = (board, max) => board.slice().sort((a, z) => z.cash - a.cash).slice(0, max || 50);
  /* Đọc bảng đã lưu: bỏ dòng không hợp lệ, tính lại số liệu từ lựa chọn */
  const cleanBoard = raw => (Array.isArray(raw) ? raw : []).map(b => { const c = validChoices(b && b.c); return c ? resultOf(b.name, c) : null; }).filter(Boolean);

  /* ---------------- Bộ công cụ: máy tính năm 1 ---------------- */
  const KIT_DEFAULT = Object.freeze({ visitors: 7200, ticket: 80, rentals: 1800, room: 50, fnb: 1095, cost: 798, cap: 500 });
  function kitCalc(s) {
    const tickets = s.visitors * s.ticket / 1000, rooms = s.rentals * s.room / 1000;
    const rev = tickets + rooms + s.fnb, tax = rev * 0.045 + 1, profit = rev - s.cost - tax;
    const cash = profit + DEPRECIATION;
    return { tickets, rooms, fnb: s.fnb, rev, cost: s.cost, tax, profit, years: cash > 0 ? s.cap / cash : null };
  }

  /* ---------------- Đấu trường Cù lao Tân Lộc ---------------- */
  const SEASON_K = [1.0, 1.4, 0.6, 1.2, 1.0, 1.4];
  const ROUNDS = SEASON_K.length;
  const MARKET = 7200, MAX_NIGHTS = 546, FLOOD_ROUND = 2, TET_ROUND = 3, RIVAL_ROUND = 4;
  const PRODUCTS = Object.freeze([
    { id: 'music', cost: 20, boost: 0.08 },
    { id: 'cook', cost: 15, boost: 0.06 },
    { id: 'photo', cost: 10, boost: 0.05 },
    { id: 'spec', cost: 25, boost: 0.05 }
  ]);
  const RIVALS = Object.freeze([
    { id: 'sonca', name: 'Sơn Ca Garden', room: 150, ticket: 60, mk: 15, staff: 8, mgr: false, prods: ['cook'] },
    { id: 'greenloc', name: 'Green Lộc Retreat', room: 700, ticket: 120, mk: 35, staff: 12, mgr: true, prods: ['music', 'photo'] },
    { id: 'camlua', name: 'Homestay Cẩm Lụa', room: 350, ticket: 30, mk: 15, staff: 8, mgr: true, prods: ['cook'] }
  ]);
  const ARENA_DEC = Object.freeze({ room: 500, ticket: 80, mk: 20, staff: 10, mgr: false });
  const LIMITS = Object.freeze({ room: [50, 800], ticket: [30, 150], mk: [0, 60], staff: [6, 14] });
  const prod = id => PRODUCTS.find(p => p.id === id) || { cost: 0, boost: 0 };

  function arenaInit() {
    return { round: 1, dec: Object.assign({}, ARENA_DEC), owned: {}, pending: {}, history: [], aw: [0.3, 0.3, 0.3, 0.3], cum: [0, 0, 0, 0] };
  }
  function clampDec(d) {
    const o = Object.assign({}, ARENA_DEC, d);
    for (const k of Object.keys(LIMITS)) o[k] = Math.min(LIMITS[k][1], Math.max(LIMITS[k][0], Number(o[k]) || LIMITS[k][0]));
    o.mgr = !!o.mgr; return o;
  }

  /* Một vòng: trả kết quả cho [CHAM, ...RIVALS] */
  function arenaSimulate(S) {
    const r = S.round - 1;
    const teams = [Object.assign({ id: 'cham' }, clampDec(S.dec), { prods: Object.keys(Object.assign({}, S.owned, S.pending)) })].concat(RIVALS);
    const aw = teams.map((t, i) => Math.min(1, 0.7 * S.aw[i] + t.mk / 60));
    const idx = teams.map(t => t.ticket + 0.05 * t.room);
    const avgRoom = teams.reduce((a, t) => a + t.room, 0) / teams.length;
    const avg = idx.reduce((a, b) => a + b, 0) / idx.length;
    const att = teams.map((t, i) => {
      const q = Math.max(0.6, Math.min(1.2, t.staff / 10)) * (t.mgr ? 1.05 : 0.95);
      const boost = t.prods.reduce((a, id) => a + prod(id).boost, 0);
      return Math.pow(avg / idx[i], 1.2) * (0.4 + 0.6 * aw[i]) * q * (1 + boost);
    });
    const sum = att.reduce((a, b) => a + b, 0), market = MARKET * SEASON_K[r] * (r === RIVAL_ROUND ? 0.9 : 1);
    return teams.map((t, i) => {
      const vis = market * att[i] / sum;
      const hotel = t.room > 350 ? Math.max(0.5, 1 - (t.room - 350) / 900) : 1;
      const stay = Math.min(0.6, 0.3 * Math.pow(avgRoom / t.room, 0.8)) * hotel;
      const nights = Math.min(vis * stay / 2.5, MAX_NIGHTS);
      const specMul = (t.prods.includes('spec') ? 2 : 1) * (r === TET_ROUND ? 2 : 1);
      const fnb = vis * 150 / 1000;
      const rev = vis * t.ticket / 1000 + fnb + nights * t.room / 1000 + vis * 20 * specMul / 1000;
      const newProds = i === 0 ? Object.keys(S.pending) : (r === 0 ? t.prods : []);
      const invest = newProds.reduce((a, id) => a + prod(id).cost, 0);
      const cost = t.staff * 2.77 * 3 + (t.mgr ? 96 : 0) + 60 + fnb * 0.3 + t.mk + invest + (r === FLOOD_ROUND ? 60 : 0) + 90 + vis * 40 / 1000 + Math.max(0, vis - t.staff * 200) * 60 / 1000;
      return { id: t.id, name: t.name || 'CHAM', vis, nights, occ: nights / MAX_NIGHTS, rev, cost, profit: rev - cost, share: att[i] / sum, aw: aw[i] };
    });
  }
  /* Chốt vòng: trả trạng thái mới (không sửa S) */
  function arenaSubmit(S) {
    if (S.round > ROUNDS) return S;
    const res = arenaSimulate(S);
    return {
      round: S.round + 1, dec: Object.assign({}, S.dec), pending: {},
      owned: Object.assign({}, S.owned, S.pending),
      history: S.history.concat([{ round: S.round, res, dec: Object.assign({}, S.dec) }]),
      aw: res.map(x => x.aw), cum: S.cum.map((c, i) => c + res[i].profit)
    };
  }
  function arenaRank(S) { return S.cum.slice().sort((a, b) => b - a).indexOf(S.cum[0]) + 1; }
  /* Thu hồi 4 tỷ ở nhịp 6 mùa (1,5 năm) */
  function arenaPaybackYears(S) { const yearly = S.cum[0] / 1.5; return yearly > 0 ? 4000 / yearly : null; }
  /* Mã câu hỏi gợi ý của Lumina (chữ nằm ở trang) */
  function arenaHints(S) {
    const d = S.dec, last = S.history[S.history.length - 1], out = [];
    if (d.room > 450) out.push('hotel');
    if (d.room <= 100) out.push('planPrice');
    if (S.round === 3 && d.mk > 30) out.push('floodMk');
    if (d.staff < 8) out.push('staff');
    if (!d.mgr) out.push('mgr');
    if (last && last.res[0].share < 0.2) out.push('share');
    if (S.round === 5) out.push('copycat');
    return out.length ? out.slice(0, 3) : ['balanced'];
  }

  return {
    PLAN, CHOICES, KEYS, DEPRECIATION, founderModel, validChoices, resultOf, encodeResult, decodeResult, decodeMany, rankBoard, cleanBoard,
    KIT_DEFAULT, kitCalc,
    SEASON_K, ROUNDS, PRODUCTS, RIVALS, ARENA_DEC, LIMITS, arenaInit, arenaSimulate, arenaSubmit, arenaRank, arenaPaybackYears, arenaHints
  };
});
