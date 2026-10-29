/* CHAM – Trò chơi nhà sáng lập: 7 quyết định → kết quả 5 năm so với kế hoạch gốc 2017.
 * Bảng xếp hạng lưu trên thiết bị (localStorage 'cham-founder-board', dùng chung với Bảng điều khiển giảng viên);
 * mã kết quả base64 để dán vào bảng điều khiển trên máy khác. Mô hình nằm ở js/cham-engine.js. */
(function () {
  'use strict';
  const K = window.ChamKit, E = window.ChamEngine, t = K.t, esc = K.esc;
  const BOARD = 'cham-founder-board';
  const M = () => t({ vi: ' tr', en: ' M' });

  const Q = [
    { key: 'room', tag: { vi: 'GIÁ', en: 'PRICING' }, q: { vi: 'Một đêm trong nhà lá giá bao nhiêu?', en: 'What does a night in a thatched hut cost?' },
      ctx: { vi: 'Sáu nhà lá với giường tre, tủ gỗ. Kế hoạch coi phòng là phần phụ của vé trong ngày.', en: 'Six huts with bamboo beds and wooden wardrobes. The plan treats rooms as a small add-on to the day pass.' },
      src: { vi: '“Vé thuê phòng 1 đêm: 50.000 đồng/phòng”, tương ứng doanh thu phòng 90 triệu đ năm 1.', en: '“Vé thuê phòng 1 đêm: 50.000 đồng/phòng”, which gives 90 million đ of room revenue in year 1.' },
      opts: [{ v: 50, label: { vi: '50.000 đ', en: '50,000 đ' }, note: { vi: 'Như kế hoạch.', en: 'As written in the plan.' } },
        { v: 500, label: { vi: '500.000 đ', en: '500,000 đ' }, note: { vi: 'Giá tác giả đã xác nhận.', en: 'The price confirmed by the author.' } }] },
    { key: 'demand', tag: { vi: 'NHU CẦU', en: 'DEMAND' }, q: { vi: 'Thực tế sẽ có bao nhiêu khách?', en: 'How many visitors will really come?' },
      ctx: { vi: 'Kế hoạch đặt mục tiêu trên 20 khách/ngày. Cù lao có mùa nước nổi, ngày thường vắng hơn cuối tuần.', en: 'The plan targets more than 20 guests a day. The islet floods, and weekdays are quieter than weekends.' },
      src: { vi: '7.200 lượt khách mua vé năm 1, khoảng 20 khách/ngày trong 360 ngày.', en: '7,200 ticketed visitors in year 1, about 20 a day for 360 days.' },
      opts: [{ v: 'plan', label: { vi: '20 khách/ngày, cả năm', en: '20 a day, all year' }, note: { vi: 'Giữ 7.200 lượt như kế hoạch.', en: 'Keep the plan’s 7,200 visitors.' } },
        { v: 'season', label: { vi: 'Mất một phần tư vì mùa nước', en: 'Lose a quarter to flood season' }, note: { vi: 'Giảm 25% khách, phòng và bữa ăn.', en: '25% fewer visitors, rooms and meals.' } }] },
    { key: 'mkt', tag: { vi: 'RA MẮT', en: 'LAUNCH' }, q: { vi: 'Ra mắt thế nào trong 5 tháng đầu?', en: 'How do you launch in the first five months?' },
      ctx: { vi: 'Giai đoạn 1 là xâm nhập thị trường. Kế hoạch chi cho gói Foody “FULL PR”, người ảnh hưởng trên Facebook, trang phục sự kiện và lễ khai trương.', en: 'Phase 1 is market entry. The plan spends on a Foody “FULL PR” package, Facebook influencers, a costume event and an opening party.' },
      src: { vi: 'Marketing năm 1: 150,45 triệu đ, trong đó 116,4 triệu là “hoạt động thường niên”.', en: 'Year-1 marketing: 150.45 million đ, of which 116.4 million is “regular activities”.' },
      opts: [{ v: 'paid', label: { vi: 'Foody + người ảnh hưởng', en: 'Foody + influencers' }, note: { vi: '≈150 triệu đ năm 1, như kế hoạch.', en: '≈150 million đ in year 1, as planned.' } },
        { v: 'organic', label: { vi: 'Fanpage + trường học', en: 'Fanpage + schools' }, note: { vi: '≈30 triệu đ. Dựa vào fanpage và dã ngoại trường học.', en: '≈30 million đ. Rely on the fanpage and school trips.' } }] },
    { key: 'staff', tag: { vi: 'NHÂN SỰ', en: 'TEAM' }, q: { vi: 'Bốn quản lý có nhận lương không?', en: 'Do the four managers get paid?' },
      ctx: { vi: 'Kế hoạch có chủ homestay, 4 quản lý và 10 nhân viên. Bảng lương chỉ có 10 nhân viên.', en: 'The plan has an owner, 4 managers and 10 staff. Only the 10 staff appear in the payroll table.' },
      src: { vi: 'Bảng lương: 27,7 triệu đ/tháng cho 10 nhân viên. Không có dòng lương quản lý.', en: 'Payroll: 27.7 million đ per month for 10 staff. No salary line for managers.' },
      opts: [{ v: 'plan', label: { vi: 'Không, như kế hoạch', en: 'No, as in the plan' }, note: { vi: 'Nhà sáng lập nhận lợi nhuận, không nhận lương.', en: 'Founders take profit, not salary.' } },
        { v: 'paid', label: { vi: 'Có, 8 triệu đ/tháng mỗi người', en: 'Yes, 8 million đ a month each' }, note: { vi: '+384 triệu đ mỗi năm.', en: '+384 million đ a year.' } }] },
    { key: 'tea', tag: { vi: 'BẢNG GIÁ', en: 'PRICE LIST' }, q: { vi: 'Ghi giá trà cúc la mã nào?', en: 'Which chamomile tea price do you book?' },
      ctx: { vi: 'Bảng giá và bảng doanh thu ghi khác nhau cho cùng gói trà cúc la mã khô 500 g.', en: 'The price list and the revenue table disagree on the same 500 g pack of dried chamomile tea.' },
      src: { vi: 'Bảng giá: 80.000 đ/500 g. Bảng doanh thu: 40 (nghìn đ) × 1.440 gói = 57,6 triệu đ.', en: 'Price list: 80,000 đ / 500 g. Revenue table: 40 (thousand đ) × 1,440 packs = 57.6 million đ.' },
      opts: [{ v: 40, label: { vi: '40.000 đ', en: '40,000 đ' }, note: { vi: 'Như bảng doanh thu.', en: 'As in the revenue table.' } },
        { v: 80, label: { vi: '80.000 đ', en: '80,000 đ' }, note: { vi: 'Như bảng giá. +57,6 triệu đ.', en: 'As on the price list. +57.6 million đ.' } }] },
    { key: 'occ', tag: { vi: 'CÔNG SUẤT', en: 'OCCUPANCY' }, q: { vi: 'Sáu nhà lá kín phòng đến đâu?', en: 'How full are the six huts?' },
      ctx: { vi: 'Sáu phòng bán tối đa 2.190 đêm phòng mỗi năm. Kế hoạch ghi 1.800, tức kín khoảng 82% mỗi đêm.', en: 'Six rooms can sell at most 2,190 room-nights a year. The plan books 1,800, about 82% full every night.' },
      src: { vi: '1.800 lần thuê phòng năm 1, 2.160 năm 2.', en: '1,800 room rentals in year 1, 2,160 in year 2.' },
      opts: [{ v: 'plan', label: { vi: 'Kín 82%', en: '82% full' }, note: { vi: '1.800 đêm phòng, như kế hoạch.', en: '1,800 room-nights, as planned.' } },
        { v: 'half', label: { vi: 'Kín một nửa', en: 'Half full' }, note: { vi: '1.095 đêm phòng (giả định minh họa).', en: '1,095 room-nights (illustrative).' } }] },
    { key: 'cap', tag: { vi: 'HÒA VỐN', en: 'PAYBACK' }, q: { vi: 'Lợi nhuận phải thu hồi khoản vốn nào?', en: 'Which investment must the profits pay back?' },
      ctx: { vi: 'Tổng vốn là 4 tỷ đ, trong đó 3,5 tỷ là đất và nhà. Công thức hòa vốn dùng một con số nhỏ hơn.', en: 'Total capital is 4 billion đ, of which 3.5 billion is land and buildings. The payback formula uses a smaller number.' },
      src: { vi: '“Thời gian hòa vốn = 500.000/(882.505 + 160.000) = 0,4796 năm”.', en: '“Thời gian hòa vốn = 500.000/(882.505 + 160.000) = 0,4796 năm”.' },
      opts: [{ v: 500, label: { vi: '500 triệu đ', en: '500 million đ' }, note: { vi: 'Theo công thức kế hoạch: 5 tháng 23 ngày.', en: 'The plan’s formula: 5 months 23 days.' } },
        { v: 4000, label: { vi: '4 tỷ đ', en: '4 billion đ' }, note: { vi: 'Toàn bộ vốn, gồm cả đất.', en: 'All capital, including land.' } }] }
  ];
  const label = (k, v) => t(Q.find(x => x.key === k).opts.find(o => o.v === v).label);

  const S = Object.assign({ step: 0, team: '', saved: false, copied: false }, E.PLAN);
  const choices = () => { const c = {}; E.KEYS.forEach(k => { c[k] = S[k]; }); return c; };
  const f = v => K.num(Math.round(v));
  const pbTxt = m => (m.pb < 1 ? K.num(m.pb * 12, 1) + t({ vi: ' tháng', en: ' months' }) : K.num(m.pb, 1) + t({ vi: ' năm', en: ' years' }));
  const box = K.$('#fg'), saveBox = K.$('#fg-save');

  function pips() { return '<div class="fg-pips" aria-hidden="true">' + Array.from({ length: 9 }, (_, i) => '<i' + (i <= S.step ? ' class="on"' : '') + '></i>').join('') + '</div>'; }

  function intro() {
    const facts = [[{ vi: 'Vốn', en: 'Capital' }, { vi: '4 tỷ đồng', en: '4 billion đ' }], [{ vi: 'Diện tích', en: 'Site' }, { vi: '9.000 m²', en: '9,000 m²' }],
      [{ vi: 'Phòng', en: 'Rooms' }, { vi: '6 nhà lá', en: '6 huts' }], [{ vi: 'Hòa vốn theo KH', en: 'Plan’s payback' }, { vi: '5 tháng', en: '5 months' }]];
    return pips() + '<div class="fg-tag">' + t({ vi: '19/3/2018 · CÙ LAO TÂN LỘC', en: '19 MAR 2018 · TÂN LỘC ISLET' }) + '</div>' +
      '<h1>' + t({ vi: 'Điều hành CHAM trong năm năm.', en: 'Run CHAM for five years.' }) + '</h1>' +
      '<p style="max-width:44em;margin-top:14px">' + t({ vi: 'Kế hoạch kinh doanh gốc năm 2017 của Đỗ Thùy Hương cho homestay duy nhất trên cù lao Tân Lộc. Bạn ngồi vào ghế người sáng lập: bảy quyết định, rồi xem kết quả so với kế hoạch.', en: 'The original 2017 business plan by Đỗ Thùy Hương for the only homestay on Tân Lộc islet. You take the founder’s seat: seven decisions, then the results against the plan.' }) + '</p>' +
      '<div class="fg-facts">' + facts.map(([k, v]) => '<div><div class="ch-k" style="color:var(--ch-on-night-2)">' + t(k) + '</div><div class="ch-v" style="color:var(--ch-on-night)">' + t(v) + '</div></div>').join('') + '</div>' +
      '<button type="button" class="ch-btn yellow" data-act="start">' + t({ vi: 'Ngồi vào ghế →', en: 'Take the seat →' }) + '</button>';
  }

  function question() {
    const q = Q[S.step - 1], you = E.founderModel(choices());
    return pips() + '<div class="fg-tag">' + S.step + ' / 7 · ' + t(q.tag) + '</div><h2>' + t(q.q) + '</h2>' +
      '<p style="max-width:44em;margin-top:12px">' + t(q.ctx) + '</p>' +
      '<div class="fg-src"><b>' + t({ vi: 'Trong kế hoạch: ', en: 'From the plan: ' }) + '</b>' + esc(t(q.src)) + '</div>' +
      '<div class="fg-opts" role="group" aria-label="' + esc(t(q.q)) + '">' + q.opts.map((o, i) => '<button type="button" class="fg-opt" data-pick="' + i + '" aria-pressed="' + (S[q.key] === o.v) + '"><b>' + t(o.label) + '</b><span>' + t(o.note) + '</span></button>').join('') + '</div>' +
      '<div class="fg-foot"><div class="fg-live">' + t({ vi: 'Lợi nhuận năm 1 hiện tại', en: 'Year-1 profit so far' }) + '<b>' + f(you.y1) + M() + '</b></div>' +
      '<div class="ch-row"><button type="button" class="ch-btn ghost" style="color:var(--ch-on-night);border-color:rgba(255,255,255,.25)" data-act="back" aria-label="' + t({ vi: 'Quay lại', en: 'Back' }) + '">←</button>' +
      '<button type="button" class="ch-btn yellow" data-act="next">' + (S.step === 7 ? t({ vi: 'Xem 5 năm →', en: 'See five years →' }) : t({ vi: 'Tiếp →', en: 'Next →' })) + '</button></div></div>';
  }

  function result() {
    const c = choices(), you = E.founderModel(c), plan = E.founderModel(E.PLAN);
    const headline = you.y1 <= 0 ? t({ vi: 'CHAM lỗ ngay năm đầu.', en: 'CHAM loses money in year 1.' })
      : you.payYear === null ? t({ vi: 'Có lãi, nhưng sau 5 năm vẫn chưa thu hồi vốn.', en: 'Profitable, but the investment is not back after five years.' })
      : you.payYear === 1 && S.cap === 500 ? t({ vi: 'Kế hoạch đúng, nếu giữ nguyên giả định của nó.', en: 'The plan works, on its own assumptions.' })
      : t({ vi: 'Bạn thu hồi vốn vào năm thứ ' + you.payYear + '.', en: 'You recover the investment in year ' + you.payYear + '.' });
    const maxV = Math.max(S.cap, ...you.years.map(y => y.cum), 1) * 1.1;
    const capLabel = S.cap === 500 ? t({ vi: '500 triệu đ', en: '500 million đ' }) : t({ vi: '4 tỷ đ', en: '4 billion đ' });
    const bars = you.years.map((y, i) => '<div class="b"><span>' + f(y.cum) + '</span><div class="w"><i style="height:' + Math.max(2, Math.max(0, y.cum) / maxV * 100) + '%;background:' + (y.cum >= S.cap ? 'var(--ch-yellow)' : '#0a9cc4') + '"></i></div><small>' + t({ vi: 'N', en: 'Y' }) + (i + 1) + '</small></div>').join('');
    const kpis = [
      [{ vi: 'Doanh thu năm 1', en: 'Year-1 revenue' }, f(you.rev1) + M(), f(plan.rev1) + M()],
      [{ vi: 'Lợi nhuận sau thuế năm 1', en: 'Year-1 profit after tax' }, f(you.y1) + M(), f(plan.y1) + M()],
      [{ vi: 'Hòa vốn (theo nhịp năm 1)', en: 'Payback (year-1 pace)' }, you.y1 + E.DEPRECIATION > 0 ? pbTxt(you) : t({ vi: 'không bao giờ', en: 'never' }), pbTxt(plan)],
      [{ vi: 'Dòng tiền lũy kế 5 năm', en: '5-year cumulative cash' }, f(you.years[4].cum) + M(), f(plan.years[4].cum) + M()]
    ];
    const recap = Q.map(x => { const same = S[x.key] === E.PLAN[x.key];
      return '<div class="' + (same ? 'same' : 'diff') + '"><b>' + t(x.tag) + '</b><strong>' + label(x.key, S[x.key]) + '</strong>' +
        (same ? t({ vi: 'Giống kế hoạch.', en: 'Same as the plan.' }) : t({ vi: 'Khác kế hoạch: ', en: 'Different from the plan: ' }) + label(x.key, E.PLAN[x.key]) + '.') + '</div>'; }).join('');
    return pips() + '<div class="fg-tag">' + t({ vi: 'NĂM NĂM SAU', en: 'FIVE YEARS LATER' }) + '</div><h2>' + headline + '</h2>' +
      '<div class="ch-row" style="justify-content:space-between;margin-top:18px;font-size:13px;font-weight:700;color:var(--ch-on-night-2)"><span>' + t({ vi: 'Dòng tiền lũy kế (lợi nhuận + khấu hao), triệu đ', en: 'Cumulative cash (profit + depreciation), million đ' }) + '</span><span>' + t({ vi: 'Nét đứt: vốn cần thu hồi (', en: 'Dashed line: investment to recover (' }) + capLabel + ')</span></div>' +
      '<div class="fg-chart night" data-cap="' + (S.cap / maxV) + '"><div class="ch-bars" role="img" aria-label="' + esc(t({ vi: 'Dòng tiền lũy kế 5 năm', en: '5-year cumulative cash' })) + '">' + bars + '</div><div class="cap"></div></div>' +
      '<div class="ch-scroll"><table class="fg-kpi"><thead><tr><th scope="col"></th><th scope="col">' + t({ vi: 'BẠN', en: 'YOU' }) + '</th><th scope="col">' + t({ vi: 'KẾ HOẠCH', en: 'PLAN' }) + '</th></tr></thead><tbody>' +
      kpis.map(k => '<tr><td>' + t(k[0]) + '</td><td class="you">' + k[1] + '</td><td>' + k[2] + '</td></tr>').join('') + '</tbody></table></div>' +
      '<div class="fg-recap">' + recap + '</div>' +
      '<div class="fg-foot"><span></span><button type="button" class="ch-btn yellow" data-act="restart">' + t({ vi: 'Chơi lại', en: 'Play again' }) + '</button></div>';
  }

  function savePanel() {
    const c = choices(), r = E.resultOf(S.team, c), code = E.encodeResult(r);
    const board = E.rankBoard(E.cleanBoard(K.get(BOARD, [])), 10);
    return '<div class="ch-card"><h3>' + t({ vi: 'Lưu điểm của nhóm', en: 'Save your team’s score' }) + '</h3>' +
      '<label class="ch-sr" for="fg-team">' + t({ vi: 'Tên nhóm hoặc sinh viên', en: 'Team or student name' }) + '</label>' +
      '<div class="ch-row" style="margin-top:10px"><input id="fg-team" class="ch-field" style="flex:1;min-width:180px" maxlength="40" value="' + esc(S.team) + '" placeholder="' + esc(t({ vi: 'Tên nhóm hoặc sinh viên', en: 'Team or student name' })) + '">' +
      '<button type="button" class="ch-btn" data-act="save">' + (S.saved ? t({ vi: 'Đã lưu ✓', en: 'Saved ✓' }) : t({ vi: 'Lưu điểm', en: 'Save score' })) + '</button></div>' +
      '<div class="ch-row" style="justify-content:space-between;margin-top:14px"><span class="ch-k">' + t({ vi: 'Mã kết quả cho bảng điều khiển giảng viên', en: 'Result code for the teacher dashboard' }) + '</span>' +
      '<button type="button" class="ch-btn sm soft" data-act="copy">' + (S.copied ? t({ vi: 'Đã chép ✓', en: 'Copied ✓' }) : t({ vi: 'Sao chép', en: 'Copy' })) + '</button></div>' +
      '<div class="fg-code" id="fg-code" tabindex="0">' + esc(code) + '</div>' +
      '<p class="ch-note" style="margin-top:10px"><a href="bang-dieu-khien.html">' + t({ vi: 'Mở bảng điều khiển giảng viên →', en: 'Open teacher dashboard →' }) + '</a></p></div>' +
      '<div class="ch-card"><div class="ch-row" style="justify-content:space-between"><h3>' + t({ vi: 'Bảng xếp hạng lớp', en: 'Class leaderboard' }) + '</h3>' +
      (board.length ? '<button type="button" class="ch-btn sm ghost" data-act="clear">' + t({ vi: 'Xóa bảng', en: 'Clear leaderboard' }) + '</button>' : '') + '</div>' +
      '<p class="ch-note">' + t({ vi: 'Lưu trên thiết bị này · xếp theo dòng tiền 5 năm', en: 'Saved on this device · ranked by 5-year cash' }) + '</p>' +
      (board.length ? '<ol class="fg-board">' + board.map((b, i) => '<li><span class="n">' + (i + 1) + '</span><span><b>' + esc(b.name) + '</b><small>' +
        (b.pay ? t({ vi: 'hòa vốn năm ', en: 'payback year ' }) + b.pay : t({ vi: 'chưa hòa vốn', en: 'no payback' })) + '</small></span><span class="c">' + f(b.cash) + M() + '</span></li>').join('') + '</ol>'
        : '<p class="ch-note" style="margin-top:10px">' + t({ vi: 'Chưa có điểm nào. Hãy lưu điểm của bạn trước.', en: 'No scores yet. Save yours first.' }) + '</p>') + '</div>';
  }

  function render() {
    box.innerHTML = S.step === 0 ? intro() : S.step <= 7 ? question() : result();
    saveBox.hidden = S.step !== 8;
    if (S.step === 8) { saveBox.innerHTML = savePanel(); placeCap(); }
  }
  /* Nét đứt «vốn cần thu hồi» đặt theo đúng vùng vẽ cột */
  function placeCap() {
    const ch = box.querySelector('.fg-chart'), w = ch && ch.querySelector('.w'); if (!w) return;
    const cr = ch.getBoundingClientRect(), wr = w.getBoundingClientRect();
    ch.querySelector('.cap').style.top = (wr.bottom - cr.top - wr.height * Math.min(1, +ch.dataset.cap)) + 'px';
  }
  window.addEventListener('resize', () => { if (S.step === 8) placeCap(); });
  function go(step) { S.step = step; render(); box.scrollIntoView({ block: 'start', behavior: K.reduced() ? 'auto' : 'smooth' }); const h = box.querySelector('h1,h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act],[data-pick]'); if (!b) return;
    if (b.dataset.pick != null) { const q = Q[S.step - 1]; S[q.key] = q.opts[+b.dataset.pick].v; render(); const nb = box.querySelector('[data-pick="' + b.dataset.pick + '"]'); if (nb) nb.focus(); return; }
    const a = b.dataset.act;
    if (a === 'start') go(1);
    else if (a === 'next') go(S.step + 1);
    else if (a === 'back') go(S.step - 1);
    else if (a === 'restart') { Object.assign(S, E.PLAN, { saved: false, copied: false }); go(0); }
    else if (a === 'save') {
      if (S.saved) return;
      const board = E.rankBoard(E.cleanBoard(K.get(BOARD, [])).concat([E.resultOf(S.team, choices())]), 50);
      K.set(BOARD, board); S.saved = true; render();
    } else if (a === 'copy') {
      const code = K.$('#fg-code').textContent;
      const done = () => { S.copied = true; render(); };
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, done); else done();
    } else if (a === 'clear') {
      if (confirm(t({ vi: 'Xóa toàn bộ bảng xếp hạng trên thiết bị này?', en: 'Clear the whole leaderboard on this device?' }))) { K.del(BOARD); S.saved = false; render(); }
    }
  });
  document.addEventListener('input', e => { if (e.target.id === 'fg-team') { S.team = e.target.value; S.saved = false; S.copied = false; const sb = K.$('[data-act="save"]'); if (sb) sb.textContent = t({ vi: 'Lưu điểm', en: 'Save score' }); const c = K.$('#fg-code'); if (c) c.textContent = E.encodeResult(E.resultOf(S.team, choices())); } });

  K.mount(render);
})();
