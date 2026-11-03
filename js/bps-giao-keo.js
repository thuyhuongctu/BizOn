/* BizOn – «Ký giao kèo đầu vụ» cho Bến Phù Sa (3D).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Trước tuần 1, đội tự đặt (không bắt buộc): mức lợi nhuận muốn đạt sau 5 tuần, cách đi dự định
 * (dò đường rồi chạy ghe / chạy ghe ngay / đi gánh cả mùa) và một câu giao kèo của đội.
 * Cuối ván, màn kết quả đặt giao kèo cạnh kết quả thật để đội tự phản tư (so sánh dự định – thực tế).
 * Giao kèo KHÔNG cộng hay trừ điểm, không gửi đi đâu: chỉ nằm trong ván đang chơi trên máy.
 *
 *   BPSGiaoKeo.mount(host, { maxRev })    vẽ thẻ giao kèo ở màn giới thiệu (maxRev = lợi nhuận kịch bản hoàn hảo)
 *   BPSGiaoKeo.read()                     giao kèo đã ký (hoặc null nếu đội bỏ qua)
 *   BPSGiaoKeo.endHtml(pledge, history, total, en)   khối so sánh ở màn kết quả
 *   Hàm thuần: tiers(maxRev), classify(history), compare(pledge, history, total) – có test node. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BPSGiaoKeo = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';
  // Phương thức trong ben-phu-sa-3d.html: 0 = ghe hàng bông (×3, phí ghe), 1 = gánh hàng rong, 2 = khảo sát chợ
  const BOAT = 0;
  const PLANS = {
    scout: { icon: '🧭', vi: 'Dò đường trước, rõ rồi mới chạy ghe', en: 'Scout first, run the boat once it is clear' },
    bold: { icon: '⛵', vi: 'Chạy ghe ngay từ tuần 1', en: 'Run the boat from week 1' },
    small: { icon: '🧺', vi: 'Đi chắc bằng gánh cả mùa', en: 'Play safe with the cart all season' },
  };
  const TIERS = [
    { key: 'safe', share: 0.35, vi: 'Chắc ăn', en: 'Safe' },
    { key: 'mid', share: 0.55, vi: 'Vừa sức', en: 'Stretch' },
    { key: 'high', share: 0.75, vi: 'Tham vọng', en: 'Ambitious' },
  ];
  const MAX_TEXT = 120;

  const half = v => Math.max(0.5, Math.round(v * 2) / 2);
  const num = v => (Number.isFinite(+v) ? +v : 0);
  const clean = s => String(s == null ? '' : s).replace(/[<>&"]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);

  // Ba mức mục tiêu theo tỷ lệ của kịch bản hoàn hảo, làm tròn 0,5 triệu ₫, luôn tăng dần
  function tiers(maxRev) {
    const m = Math.max(1, num(maxRev));
    let prev = 0;
    return TIERS.map(t => { let v = half(m * t.share); if (v <= prev) v = prev + 0.5; prev = v; return { key: t.key, vi: t.vi, en: t.en, target: v }; });
  }
  // Cách đi thật của ván: ghe ngay tuần 1 → bold; có ghe nhưng từ tuần 2 trở đi → scout; không dùng ghe → small
  function classify(history) {
    const h = (history || []).slice().sort((a, b) => num(a.w) - num(b.w));
    if (!h.length) return null;
    if (h[0].m === BOAT) return 'bold';
    return h.some(x => x.m === BOAT) ? 'scout' : 'small';
  }
  function compare(pledge, history, total) {
    if (!pledge) return null;
    const t = num(total), target = num(pledge.target), actual = classify(history);
    return { target, total: t, hit: t >= target, gap: Math.round((t - target) * 10) / 10, plan: pledge.plan || null, actual, samePlan: !!pledge.plan && pledge.plan === actual, text: clean(pledge.text) };
  }

  // ---------- Giao diện ----------
  const isEN = () => { try { return (root.localStorage.getItem('bizon-lang') || 'vi') === 'en'; } catch (e) { return false; } };
  const T = (vi, en, en2) => ((en2 == null ? isEN() : en2) ? en : vi);
  const f1 = (v, en) => (Math.round(v * 10) / 10 || 0).toLocaleString(en ? 'en-US' : 'vi-VN', { maximumFractionDigits: 1 });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const CSS = '.bps-gk{margin-top:16px;padding:14px;border-radius:18px;border:2px dashed rgba(253,161,39,.6);background:rgba(253,161,39,.07);text-align:left}' +
    '.bps-gk.signed{border-style:solid;border-color:#0F766E;background:rgba(15,118,110,.07)}' +
    '.bps-gk-h{font:800 15px/1.3 "Plus Jakarta Sans",system-ui,sans-serif;color:inherit}.bps-gk-h span{font-size:10px;font-weight:700;opacity:.55;margin-left:4px;text-transform:uppercase;letter-spacing:.05em}' +
    '.bps-gk-p{font-size:12.5px;opacity:.75;margin-top:4px}.bps-gk-l{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;opacity:.6;margin:12px 0 6px}' +
    '.bps-gk-row{display:flex;flex-wrap:wrap;gap:6px}.bps-gk-chip{flex:1 1 140px;min-height:44px;padding:7px 10px;border-radius:14px;border:2px solid rgba(0,102,135,.25);background:transparent;color:inherit;font:700 12.5px/1.3 system-ui,sans-serif;text-align:left;cursor:pointer}' +
    '.bps-gk-chip small{display:block;font-weight:600;opacity:.65;font-size:11px}.bps-gk-chip.on{border-color:#fda127;background:rgba(253,161,39,.2)}' +
    '.bps-gk input{width:100%;min-height:44px;border:2px solid rgba(0,102,135,.25);border-radius:12px;padding:8px 12px;background:transparent;color:inherit;font:600 14px system-ui,sans-serif}' +
    '.bps-gk-sign{width:100%;min-height:44px;margin-top:10px;border:0;border-radius:14px;background:#0F766E;color:#fff;font:800 14px "Plus Jakarta Sans",system-ui,sans-serif;cursor:pointer}' +
    '.bps-gk-note,.bps-gk-sim{font-size:11px;opacity:.6;margin-top:8px}' +
    '.bps-gk-end{margin-top:16px;padding:14px;border-radius:16px;border:2px solid rgba(253,161,39,.45);text-align:left}.bps-gk-quote{font-style:italic;margin:6px 0 2px;font-weight:600}' +
    '.bps-gk-end table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12.5px}.bps-gk-end th,.bps-gk-end td{padding:6px 4px;border-top:1px solid rgba(0,102,135,.15);text-align:left;vertical-align:top}' +
    '.bps-gk-end thead th{border-top:0;font-size:10.5px;text-transform:uppercase;opacity:.55}.bps-gk-q{font-size:12.5px;margin-top:8px;font-weight:600}';
  function injectCss() {
    const d = root.document;
    if (!d || d.getElementById('bps-gk-css')) return;
    const s = d.createElement('style'); s.id = 'bps-gk-css'; s.textContent = CSS; d.head.appendChild(s);
  }

  let host = null, opts = {}, sel = { tier: 'mid', plan: null, text: '', signed: false };
  function render() {
    if (!host) return;
    injectCss();
    const en = isEN(), list = tiers(opts.maxRev);
    const chip = (on, attr, label, sub) => '<button type="button" ' + attr + ' aria-pressed="' + on + '" class="bps-gk-chip' + (on ? ' on' : '') + '">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
    host.innerHTML =
      '<div class="bps-gk' + (sel.signed ? ' signed' : '') + '">' +
      '<p class="bps-gk-h">📜 ' + T('Ký giao kèo đầu vụ', 'Sign your season pact', en) + ' <span>' + T('không bắt buộc', 'optional', en) + '</span></p>' +
      '<p class="bps-gk-p">' + T('Thương hồ miền Tây hay giao kèo với bạn hàng trước mùa. Đội đặt mục tiêu và cách đi; hết 5 tuần, màn kết quả sẽ đặt giao kèo cạnh kết quả thật để cả đội nhìn lại.',
        'Mekong river traders strike a deal with their partners before the season. Set your target and your plan; after 5 weeks the results screen puts this pact next to what really happened.', en) + '</p>' +
      '<p class="bps-gk-l">' + T('1 · Lợi nhuận muốn đạt sau 5 tuần', '1 · Profit target after 5 weeks', en) + '</p>' +
      '<div class="bps-gk-row">' + list.map(t => chip(sel.tier === t.key, 'data-gk-tier="' + t.key + '"', T(t.vi, t.en, en), '≥ ' + f1(t.target, en) + ' ' + T('triệu ₫', 'mn ₫', en))).join('') + '</div>' +
      '<p class="bps-gk-l">' + T('2 · Cách đi dự định', '2 · Your plan', en) + '</p>' +
      '<div class="bps-gk-row">' + Object.keys(PLANS).map(k => chip(sel.plan === k, 'data-gk-plan="' + k + '"', PLANS[k].icon + ' ' + T(PLANS[k].vi, PLANS[k].en, en))).join('') + '</div>' +
      '<label class="bps-gk-l" for="bps-gk-text">' + T('3 · Câu giao kèo của đội', '3 · Your team’s pledge', en) + '</label>' +
      '<input id="bps-gk-text" type="text" maxlength="' + MAX_TEXT + '" value="' + esc(sel.text) + '" placeholder="' + esc(T('VD: Không chạy ghe khi chưa biết khách ở đâu', 'E.g. No boat until we know where the customers are', en)) + '">' +
      '<button type="button" class="bps-gk-sign" data-gk-sign>' + (sel.signed ? '✅ ' + T('Đã ký – bấm để sửa', 'Signed – tap to edit', en) : '✍️ ' + T('Ký giao kèo', 'Sign the pact', en)) + '</button>' +
      '<p class="bps-gk-note">' + T('Giao kèo chỉ để phản tư – không cộng hay trừ điểm, không gửi đi đâu.', 'The pact is for reflection only – no points added or taken, nothing is sent anywhere.', en) + '</p>' +
      '</div>';
  }
  function onClick(e) {
    const b = e.target.closest && e.target.closest('button');
    if (!b || !host.contains(b)) return;
    if (b.dataset.gkTier) { sel.tier = b.dataset.gkTier; sel.signed = false; }
    else if (b.dataset.gkPlan) { sel.plan = sel.plan === b.dataset.gkPlan ? null : b.dataset.gkPlan; sel.signed = false; }
    else if (b.hasAttribute('data-gk-sign')) sel.signed = !sel.signed;
    else return;
    render();
  }
  function onInput(e) { if (e.target && e.target.id === 'bps-gk-text') { sel.text = clean(e.target.value); if (sel.signed) { sel.signed = false; const s = host.querySelector('[data-gk-sign]'); if (s) s.textContent = '✍️ ' + T('Ký giao kèo', 'Sign the pact'); host.firstChild.classList.remove('signed'); } } }
  function mount(el, o) {
    if (!el) return;
    host = el; opts = o || {};
    if (!el.__gk) { el.__gk = true; el.addEventListener('click', onClick); el.addEventListener('input', onInput); root.addEventListener && root.addEventListener('bizon:langchange', render); }
    render();
  }
  function read() {
    if (!sel.signed) return null;
    const t = tiers(opts.maxRev).find(x => x.key === sel.tier) || tiers(opts.maxRev)[1];
    return { tier: t.key, target: t.target, plan: sel.plan, text: clean(sel.text) };
  }

  function endHtml(pledge, history, total, en) {
    if (en == null) en = isEN();
    injectCss();
    const note = '<p class="bps-gk-sim">ℹ️ ' + T('Lợi nhuận, hạng và hiệu suất là <b>chỉ số mô phỏng</b> của mô hình Bến Phù Sa (nhu cầu ẩn, đối thủ theo kịch bản), không phải đánh giá năng lực kinh doanh ngoài đời.',
      'Profit, rank and efficiency are <b>simulation metrics</b> of the Bến Phù Sa model (hidden demand, scripted rivals), not an assessment of real-world business ability.', en) + '</p>';
    const c = compare(pledge, history, total);
    if (!c) return note;
    const plan = k => (k && PLANS[k] ? PLANS[k].icon + ' ' + T(PLANS[k].vi, PLANS[k].en, en) : T('chưa chọn', 'not set', en));
    const money = v => f1(v, en) + ' ' + T('triệu ₫', 'mn ₫', en);
    const rows = [
      [T('Mục tiêu', 'Target', en), '≥ ' + money(c.target), money(c.total) + ' ' + (c.hit ? '✅ ' + T('vượt', 'over by', en) + ' ' + money(Math.abs(c.gap)) : '⚠️ ' + T('thiếu', 'short by', en) + ' ' + money(Math.abs(c.gap)))],
      [T('Cách đi', 'Plan', en), plan(c.plan), plan(c.actual) + (c.plan ? ' ' + (c.samePlan ? '✅' : '🔀') : '')],
    ];
    const q = c.samePlan && !c.hit
      ? T('Đội đi đúng cách đã định nhưng chưa tới mục tiêu: mục tiêu đặt cao quá, hay từng tuần chọn món và địa điểm chưa tới?', 'You followed your plan but missed the target: was the target too high, or were the weekly product and location picks off?', en)
      : !c.hit || (c.plan && !c.samePlan)
      ? T('Điều gì trên thị trường khiến đội đi khác giao kèo? Lần sau đội sẽ đặt mục tiêu hay cách đi khác thế nào?', 'What in the market pulled you away from the pact? Next time, how would you set the target or plan differently?', en)
      : T('Đội giữ đúng giao kèo. Tín hiệu nào cho đội biết kế hoạch đầu vụ vẫn đúng – và nếu thị trường đổi thì đội có dám đổi không?', 'You kept the pact. What signal told you the plan still held – and would you have dared to change course if the market shifted?', en);
    return '<div class="bps-gk-end">' +
      '<p class="bps-gk-h">📜 ' + T('Giao kèo đầu vụ và kết quả thật', 'Season pact vs what really happened', en) + '</p>' +
      (c.text ? '<p class="bps-gk-quote">«' + esc(c.text) + '»</p>' : '') +
      '<table><thead><tr><th scope="col"></th><th scope="col">' + T('Giao kèo', 'Pact', en) + '</th><th scope="col">' + T('Thực tế', 'Actual', en) + '</th></tr></thead><tbody>' +
      rows.map(r => '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') + '</tbody></table>' +
      '<p class="bps-gk-q">💬 ' + q + '</p></div>' + note;
  }

  return { PLANS, tiers, classify, compare, mount, read, endHtml };
});
