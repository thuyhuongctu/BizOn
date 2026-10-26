/* BizOn — Mã hoá dấu vết quyết định (R4): gắn nhãn từng quyết định trong ba bậc theo logic ra quyết định và mức tuân thủ
 * Uppsala, hàm thuần dùng chung Node và trình duyệt. © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Sơ đồ mã hoá (docs/research/MA-HOA-DAU-VET.md, CODING_VERSION bên dưới). Mỗi quyết định → { code, logic, uppsala_ok }:
 *   logic: 'effectual' (thử nhỏ, phương tiện sẵn có) · 'causal' (thu thập thông tin/dự báo trước khi cam kết) ·
 *          'leap' (tăng cam kết khi chưa có tín hiệu/tri thức) · 'adaptive' (giữ hoặc co lại theo tín hiệu) · 'start' (chưa mã hoá)
 *   uppsala_ok: 1 khi cam kết đi sau tri thức/tín hiệu (hoặc là bước học), 0 khi cam kết đi trước, null khi không áp dụng.
 *
 * Bậc 1 (Bến Phù Sa, tiers.t1.weeks[{w,m,menu,loc,net}]): m=1 gánh hàng rong (thử nghiệm) → explore/effectual;
 *   m=2 khảo sát chợ → survey/causal; m=0 ghe hàng bông (nhân rộng) trên cặp (menu, loc) đã thử/khảo sát ở tuần trước →
 *   exploit-known/causal (ok 1), chưa biết → exploit-unknown/leap (ok 0).
 * Bậc 2 (Bật Nghiệp, result_json từng vòng): so sản lượng với vòng trước; tăng ≥ 15 % khi vòng trước có đơn hụt
 *   (lostSales > 0) → expand-informed/causal (ok 1); tăng ≥ 15 % khi không có đơn hụt → expand-uninformed/leap (ok 0);
 *   giảm ≥ 15 % → contract/adaptive; còn lại hold/adaptive; vòng 1 → start. Kèm cờ what_if (dùng Nếu – Thì) và loan.
 * Bậc 3 (Hộ Chiếu): thứ tự vào thị trường. Lần vào đầu ở thị trường gần (tâm lý/địa lý) → near-first (ok 1); lần vào thị
 *   trường xa sau khi đã có ≥ 1 thị trường gần → sequential (ok 1); vào thị trường xa trước → leapfrog (ok 0);
 *   thị trường gần sau khi đã nhảy cóc → late-near (ok 1). Brand: entered[i] = quý vào, gần = NEAR_BRAND; Sầu Riêng:
 *   channelOrder, gần = NEAR_DURIAN. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.BizOnDecisionCodes = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const CODING_VERSION = 'dc-v1';
  const NEAR_BRAND = [5, 2];               // trùng PARAMS.T2_NET_MARKETS của js/core/journey.js (hai thị trường gần nhất)
  const NEAR_DURIAN = ['DOM', 'BORDER'];   // trùng DURIAN_NEAR của js/core/journey.js
  const EXPAND = 0.15;
  const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const r3 = v => Math.round(v * 1000) / 1000;

  function codeTier1(weeks) {
    const known = new Set(); const out = [];
    for (const w of (Array.isArray(weeks) ? weeks : [])) {
      const m = num(w.m, -1), pair = w.menu == null || w.loc == null ? null : `${w.menu}-${w.loc}`;
      let code, logic, ok;
      if (m === 1) { code = 'explore'; logic = 'effectual'; ok = 1; }
      else if (m === 2) { code = 'survey'; logic = 'causal'; ok = 1; }
      else if (m === 0) { const k = !!(pair && known.has(pair)); code = k ? 'exploit-known' : 'exploit-unknown'; logic = k ? 'causal' : 'leap'; ok = k ? 1 : 0; }
      else { code = 'unknown'; logic = 'start'; ok = null; }
      out.push({ tier: 't1', seq: num(w.w, out.length + 1), code, logic, uppsala_ok: ok, m, menu: w.menu ?? '', loc: w.loc ?? '', net: w.net ?? '', known_before: pair ? (known.has(pair) ? 1 : 0) : '' });
      if (pair && (m === 1 || m === 2)) known.add(pair);
    }
    return out;
  }

  function codeTier2(rounds) {
    const rs = (Array.isArray(rounds) ? rounds : []).map(r => ({ round: num(r.round_number ?? r.round), j: r.result_json || r })).filter(r => r.round > 0).sort((a, b) => a.round - b.round);
    const out = []; let prev = null;
    for (const r of rs) {
      const d = r.j.decisions || {}, pd = prev ? (prev.j.decisions || {}) : null;
      const prod = num(d.production), pprod = pd ? num(pd.production) : 0;
      let code, logic, ok, dProd = '';
      if (!prev) { code = 'start'; logic = 'start'; ok = null; }
      else {
        dProd = pprod > 0 ? r3((prod - pprod) / pprod) : (prod > 0 ? 1 : 0);
        const signal = num(prev.j.lostSales) > 0;
        if (dProd >= EXPAND) { code = signal ? 'expand-informed' : 'expand-uninformed'; logic = signal ? 'causal' : 'leap'; ok = signal ? 1 : 0; }
        else if (dProd <= -EXPAND) { code = 'contract'; logic = 'adaptive'; ok = 1; }
        else { code = 'hold'; logic = 'adaptive'; ok = 1; }
      }
      out.push({ tier: 't2', seq: r.round, code, logic, uppsala_ok: ok, production: prod, d_production: dProd, prev_lost_sales: prev ? num(prev.j.lostSales) : '',
        what_if: d.whatIfUsed != null ? (num(d.whatIfUsed) > 0 ? 1 : 0) : (r.j.whatIfUsed != null ? (num(r.j.whatIfUsed) > 0 ? 1 : 0) : ''), loan: d.funding === 'loan' ? 1 : (d.funding ? 0 : ''),
        price: d.price ?? '', marketing: d.marketing ?? '', rd: d.rd ?? '', workers: d.workers ?? '', training: d.training ?? '', payment_term: d.paymentTerm ?? '' });
      prev = r;
    }
    return out;
  }

  function codeEntries(entries, isNear) {
    const out = []; let nearCount = 0, farCount = 0;
    entries.forEach((e, i) => {
      const near = !!isNear(e.market); let code, ok;
      if (near) { code = (i === 0 || farCount === 0) ? 'near-first' : 'late-near'; ok = 1; }
      else { code = nearCount > 0 ? 'sequential' : 'leapfrog'; ok = nearCount > 0 ? 1 : 0; }
      out.push({ tier: 't3', seq: i + 1, code, logic: ok ? 'causal' : 'leap', uppsala_ok: ok, market: e.market, near: near ? 1 : 0, when: e.when ?? '' });
      if (near) nearCount++; else farCount++;
    });
    return out;
  }
  function codeTier3Brand(entered) {
    const es = (Array.isArray(entered) ? entered : []).map((q, i) => (q == null ? null : { market: i, when: num(q) })).filter(Boolean).sort((a, b) => a.when - b.when || a.market - b.market);
    return codeEntries(es, m => NEAR_BRAND.includes(m));
  }
  function codeTier3Durian(channelOrder) {
    const es = (Array.isArray(channelOrder) ? channelOrder : []).map((id, i) => ({ market: String(id).toUpperCase(), when: i + 1 }));
    return codeEntries(es, m => NEAR_DURIAN.includes(m));
  }

  // Tổng hợp cho một danh sách mã (một bậc hoặc cả hành trình)
  function summarize(rows) {
    const coded = rows.filter(r => r.uppsala_ok === 0 || r.uppsala_ok === 1); const n = rows.length;
    const share = l => (n ? r3(rows.filter(r => r.logic === l).length / n) : '');
    return { n, n_coded: coded.length, uppsala_adherence: coded.length ? r3(coded.filter(r => r.uppsala_ok === 1).length / coded.length) : '',
      effectual_share: share('effectual'), causal_share: share('causal'), leap_share: share('leap'), adaptive_share: share('adaptive') };
  }
  // Mã hoá cả hộ chiếu (+ các vòng Bật Nghiệp của đội nếu có)
  function codePassport(p, rounds) {
    const t = (p && p.tiers) || {}; const rows = [];
    if (t.t1 && t.t1.status === 'done') rows.push(...codeTier1(t.t1.weeks));
    if (rounds && rounds.length) rows.push(...codeTier2(rounds));
    if (t.t3 && t.t3.status === 'done') rows.push(...(t.t3.variant === 'brand' ? codeTier3Brand(t.t3.entered) : codeTier3Durian(t.t3.channelOrder)));
    return rows;
  }
  return { CODING_VERSION, NEAR_BRAND, NEAR_DURIAN, EXPAND, codeTier1, codeTier2, codeTier3Brand, codeTier3Durian, codePassport, summarize };
});
