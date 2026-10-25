// Lõi chốt vụ dùng chung cho bản thẻ (ho-chieu-sau-rieng.html) và bản đồ 3D
// (ho-chieu-sau-rieng-3d.html). Hai bản phải ghi cùng một nhật ký kiểm toán
// (sự kiện, phiếu quyết định, thời gian chốt) để giảng viên chấm điểm như nhau.
// Mọi hàm nhận APP, D, E tường minh; không đọc biến cục bộ của trang nào.
(function () {
  'use strict';

  const SHEET_CEO_MIN = 10; // lý do của CEO tối thiểu (ký tự)

  // Tỷ trọng kênh mặc định của doanh nghiệp (D.roles[x].defaultAlloc, nếu không có thì D.params.defaultAlloc).
  function defaultAlloc(D, roleId) {
    const r = D && D.roles && D.roles[roleId];
    return Object.assign({}, (r && r.defaultAlloc) || (D && D.params && D.params.defaultAlloc) || { BORDER: 50, DOM: 40, TW: 10 });
  }

  // Kênh vừa mở ở vụ mới (trước không đi được, nay đi được) mà đang 0%: đưa sẵn D.params.openSeed[kênh] %,
  // các kênh đang mở khác giảm theo tỷ lệ. Trả về bản sao; không sửa alloc đầu vào.
  function seedNewChannels(D, E, prevState, nextState, alloc) {
    const out = Object.assign({}, alloc || {});
    const seed = (D.params && D.params.openSeed) || {};
    if (!prevState || !nextState || nextState.n > D.seasons.length || prevState.n > D.seasons.length) return out;
    const ch = id => D.channels.find(c => c.id === id);
    const open = D.channels.filter(c => E.eligible(D, nextState, c)).map(c => c.id);
    open.filter(id => seed[id] && !E.eligible(D, prevState, ch(id)) && !(out[id] > 0)).forEach(id => {
      const m = seed[id], others = open.filter(x => x !== id), S = others.reduce((x, o) => x + Math.max(0, out[o] || 0), 0);
      others.forEach(o => { out[o] = S > 0 ? Math.max(0, out[o] || 0) * (100 - m) / S : (100 - m) / others.length; });
      out[id] = m;
    });
    return out;
  }

  // D, roleId tùy chọn: có thì dùng tỷ trọng mặc định của doanh nghiệp.
  function freshDec(D, roleId) {
    return { priority: 'area', linked: 0.3, induce: true, alloc: D ? defaultAlloc(D, roleId) : { BORDER: 50, DOM: 40, TW: 10 }, intel: [], option: 0 };
  }

  function owned(a, id) {
    return (id === 'area' && a.area) || (id === 'pack' && a.pack) || (id === 'trace' && a.trace) || (id === 'freezer' && a.freezer) || (id === 'test' && a.test >= 2);
  }

  function pendingJournal(APP) {
    return APP.game.history.length > 0 && !APP.journals[APP.game.history.length];
  }

  function logEv(APP, D, type, oldV, newV, committed) {
    if (!APP) return;
    const round = pendingJournal(APP) ? APP.game.history.length : Math.min(APP.game.n, D.seasons.length);
    APP.events.push({
      event_id: 'EV' + String(APP.events.length + 1).padStart(6, '0'),
      timestamp: new Date().toISOString(), class_id: APP.cls || 'local', team_id: APP.team || 'TEAM',
      round_id: 'R' + round, role: (APP.operator || 'ceo').toUpperCase(), event_type: type,
      old_value: oldV === undefined ? '' : (typeof oldV === 'object' ? JSON.stringify(oldV) : String(oldV)),
      new_value: newV === undefined ? '' : (typeof newV === 'object' ? JSON.stringify(newV) : String(newV)),
      device_session: APP.session, committed: committed ? 1 : 0
    });
  }

  // Phiếu đủ điều kiện chốt: có mục tiêu, có giả định, lý do CEO đủ dài.
  function sheetComplete(sh) {
    return !!(sh && sh.goal && (sh.assume || '').trim() && (sh.ceo || '').trim().length >= SHEET_CEO_MIN);
  }

  // Nhãn mục tiêu (song ngữ theo L của trang gọi).
  function goals(L) {
    return { share: L('Thị phần chính ngạch', 'Official market share'), profit: L('Lợi nhuận', 'Profit'), cash: L('Tiền mặt', 'Cash'), rep: L('Uy tín, tuân thủ', 'Reputation, compliance'), capability: L('Năng lực dài hạn', 'Long-term capability') };
  }

  // Chuyển trạng thái một vụ: ghi thời gian, phiếu, kết quả, cờ, nhật ký COMMIT,
  // rồi chuẩn bị quyết định cho vụ sau. Không lưu và không vẽ lại; bên gọi làm việc đó.
  // sh: phiếu đã kiểm tra bằng sheetComplete (goal, assume, ceo, …).
  function commitSeason(APP, D, E, RIVALS, n, sh) {
    const dec = JSON.parse(JSON.stringify(APP.dec));
    const f = E.forecast(D, APP.game, dec);
    const elapsed = Math.round((Date.now() - APP.roundStart) / 1000);
    APP.timing[n] = { start: new Date(APP.roundStart).toISOString(), commit: new Date().toISOString(), seconds: elapsed, onTime: !APP.timerMin || elapsed <= APP.timerMin * 60, operator: APP.operator };
    APP.sheets[n] = Object.assign({}, sh, { forecastFinal: f.profit, forecastWhatIf: (APP.whatifs[n] || []).length ? APP.whatifs[n][APP.whatifs[n].length - 1].profit : null, pBlockCN: f.pBlockCN });
    const before = APP.game;
    APP.game = E.playSeason(D, APP.game, dec);
    const r = APP.game.history[APP.game.history.length - 1];
    APP.flags[n - 1] = E.flagFor(RIVALS, r);
    logEv(APP, D, 'COMMIT', '', JSON.stringify(dec), true);
    // giữ phương án làm điểm xuất phát vụ sau
    const next = freshDec(); next.alloc = seedNewChannels(D, E, before, APP.game, dec.alloc); next.linked = dec.linked; next.intel = [];
    const free = D.priorities.find(p => !owned(APP.game.assets, p.id));
    next.priority = free ? free.id : 'finance';
    APP.dec = next;
  }


  // «Cách chơi 6 vụ»: luật chơi rút thẳng từ dữ liệu và tham số (không chép tay số), dùng chung cho bản thẻ và bản 3D.
  // L(vi, en) → chuỗi theo ngôn ngữ trang. Trả về [{ title, lines: [[nhãn, giải thích], …] }].
  function howToPlay(D, L) {
    const P = D.params, W = D.scoreWeights, vi = L('x', 'y') === 'x';
    const num = v => (vi ? String(v).replace('.', ',') : String(v)), pct = x => Math.round(x * 100) + '%', bn = v => num(v) + L(' tỷ', ' bn');
    const nm = o => L(o.vi, o.en), need = { area: L('mã vùng trồng', 'area code'), pack: L('mã đóng gói', 'packing code'), freezer: L('cấp đông', 'freezer'), test: L('kiểm nghiệm', 'testing') };
    const cuts = D.seasons.map(s => pct(s.borderCut || 0)).join(' → ');
    const part = { profit: L('Lợi nhuận', 'Profit'), reputation: L('Uy tín', 'Reputation'), capability: L('Năng lực', 'Capability'), adaptation: L('Ứng phó biến cố', 'Shock response'), sustainability: L('Bền vững', 'Sustainability') };
    const why = {
      profit: L('100 điểm khi lãi lũy kế 6 vụ bằng mốc của doanh nghiệp (sản lượng chuẩn × 6 vụ × biên chuẩn); lãi 0 = 50 điểm; lỗ bằng mốc = 0.', '100 points when 6-season cumulative profit equals the firm\'s benchmark (standard volume × 6 seasons × standard margin); zero profit = 50; a loss equal to the benchmark = 0.'),
      reputation: L('tăng khi tuân thủ, giảm khi lô bị chặn, bị phát hiện giả xuất xứ hay vượt hạn mức vay.', 'rises with compliance; falls when a lot is blocked, fake origin is exposed or the credit limit is exceeded.'),
      capability: L('nền 10; mã vùng trồng +20, mã đóng gói +20, mỗi cấp kiểm nghiệm +10, truy xuất +15, cấp đông +15.', 'base 10; area code +20, packing code +20, each testing level +10, traceability +15, freezer +15.'),
      adaptation: L('tăng khi chọn phương án biến cố có tính thích ứng (trữ nước, hợp đồng bao tiêu, kiểm nghiệm từng lô…).', 'rises when you pick adaptive event responses (water storage, forward contracts, lot-by-lot testing…).'),
      sustainability: L('tăng/giảm theo phương án biến cố; hợp tác xã tính thêm 40% sức khỏe vườn (xử lý nghịch vụ liên tục làm vườn kiệt).', 'moves with event responses; for the cooperative 40% comes from orchard health (repeated off-season inducing exhausts trees).')
    };
    return [
      { title: L('Vòng chơi', 'The round'), lines: [
        [L('6 vụ, 2022–2025', '6 seasons, 2022–2025'), L('xen kẽ chính vụ và nghịch vụ, mỗi vụ bám một mốc thật. Nghịch vụ giá vựa gấp ' + num(P.offMult) + ' lần nhưng sản lượng thấp hơn.', 'main and off seasons alternate, each anchored to a real milestone. Off-season depot prices are ' + num(P.offMult) + '× but volumes are lower.')],
        [L('Tiểu ngạch bị siết dần', 'Border trade tightens'), L('phần kênh bị cắt qua 6 vụ: ' + cuts + '. Không làm mã số thì về cuối hụt kênh.', 'share cut over the 6 seasons: ' + cuts + '. Without codes you run out of channels late in the game.')],
        [L('Nhịp một vụ', 'One season'), L('đọc biến cố → mua tin → họp đội theo vai → tối đa 2 lượt «Nếu – Thì» → phiếu quyết định → CEO chốt → kết quả và cờ.', 'read the event → buy information → role meeting → up to 2 what-ifs → decision sheet → CEO commits → results and flag.')]
      ] },
      { title: L('Năm quyết định, mỗi vai một việc', 'Five decisions, one per role'), lines: [
        ['SEC', L('chọn cách ứng phó biến cố đầu vụ; mỗi phương án đổi tiền, sản lượng, uy tín, bền vững.', 'picks the response to the season\'s event; each option trades cash, volume, reputation and sustainability.')],
        ['CMO', L('mua tối đa 2 nguồn tin (' + D.intel.map(nm).join(', ') + '). Tin quyết định dự báo giá vựa; có nguồn thổi giá, có nguồn ép giá.', 'buys up to 2 information sources (' + D.intel.map(nm).join(', ') + '). They drive the price forecast; some talk prices up, some down.')],
        ['COO', L('tỷ lệ mua từ vùng liên kết có mã (đắt hơn ' + pct(P.linkedPremium) + ', cần cho chính ngạch). Hợp tác xã còn chọn xử lý ra hoa nghịch vụ, mỗi lần hao ' + P.treeHealthCost + ' điểm sức khỏe vườn.', 'share bought from linked coded areas (' + pct(P.linkedPremium) + ' dearer, needed for official trade). The cooperative can also induce off-season flowering, costing ' + P.treeHealthCost + ' orchard-health points each time.')],
        ['CFO', L('một ưu tiên đầu tư mỗi vụ (bảng «Đầu tư gì, mở kênh gì»).', 'one investment priority per season (see «What unlocks what»).')],
        ['CEO', L('chia sản lượng cho các kênh đang mở rồi chốt vụ; phiếu quyết định phải có mục tiêu và lý do.', 'splits output across open channels and commits; the decision sheet needs a goal and a reason.')]
      ] },
      { title: L('Đầu tư gì, mở kênh gì', 'What unlocks what'), lines: D.priorities.map(p => [nm(p) + (P.priorityCost[p.id] ? ' · ' + bn(P.priorityCost[p.id]) : ' · ' + L('0 đồng', 'free')), L(p.effVi, p.effEn)]) },
      { title: L('Sáu kênh bán', 'Six channels'), lines: D.channels.map(c => [c.emoji + ' ' + nm(c),
        L('giá ×' + num(c.priceMult) + (c.cap ? ', trần ' + c.cap + ' tấn' : '') + (c.tariff ? ', thuế ' + pct(c.tariff) : '') + (c.needs.length ? '; cần ' + c.needs.map(k => need[k]).join(' + ') : '; không cần điều kiện') + (c.id === 'BORDER' ? '; bị siết dần' : '') + '.',
          'price ×' + num(c.priceMult) + (c.cap ? ', cap ' + c.cap + ' t' : '') + (c.tariff ? ', tariff ' + pct(c.tariff) : '') + (c.needs.length ? '; needs ' + c.needs.map(k => need[k]).join(' + ') : '; no requirement') + (c.id === 'BORDER' ? '; tightening' : '') + '.')]) },
      { title: L('Tiền, vay và hao hụt', 'Cash, credit and losses'), lines: [
        [L('Tiền ban đầu', 'Starting cash'), L(bn(P.cash0) + ', cộng trừ theo doanh nghiệp.', bn(P.cash0) + ', adjusted by firm.')],
        [L('Hạn mức vay', 'Credit limit'), L(bn(P.creditLimit) + ': trong hạn mức lãi 8%/vụ, phần vượt lãi 15% và trừ 3 uy tín. «Củng cố tài chính» giảm nửa lãi vụ đó.', bn(P.creditLimit) + ': 8% per season within the limit, 15% above it plus −3 reputation. «Strengthen finances» halves that season\'s interest.')],
        [L('Hao hụt', 'Losses'), L('cơ bản ' + pct(P.baseLoss) + '; truy xuất nguồn gốc giảm ' + Math.round(P.traceLossCut * 100) + ' điểm %.', 'base ' + pct(P.baseLoss) + '; traceability cuts ' + Math.round(P.traceLossCut * 100) + ' points.')],
        [L('Hàng bị chặn hoặc rớt', 'Blocked or rejected lots'), L('quay về bán nội địa với ' + pct(P.rejectedDiscount) + ' giá.', 'go back to the domestic market at ' + pct(P.rejectedDiscount) + ' of the price.')]
      ] },
      { title: L('Đối thủ và cờ', 'Rivals and flags'), lines: [
        [L('3 doanh nghiệp AI', '3 AI firms'), L('rút theo mã lớp từ 7 CEO Go Global; chơi cùng doanh nghiệp, cùng 6 vụ, cùng engine, theo kịch bản cố định. Họ không phản ứng với đội: là mốc để so sánh, không giành thị phần.', 'drawn by class code from the 7 Go Global CEOs; same firm, same 6 seasons, same engine, fixed scripts. They do not react to you: a benchmark, not a fight for market share.')],
        [L('Cờ mỗi vụ', 'Flag each season'), L('đội cắm cờ khi lợi nhuận vụ đó bằng hoặc hơn đối thủ cao nhất.', 'you plant a flag when that season\'s profit matches or beats the best rival.')]
      ] },
      { title: L('Điểm tổng 0–100', 'Total score 0–100'), lines: Object.keys(W).map(k => [W[k] + '% ' + part[k], why[k]]).concat([
        [L('Huy hiệu', 'Badges'), L('chính ngạch sạch (không lô nào bị chặn), đa dạng (từ 4 kênh), chống chịu (không vụ nào lỗ); huy hiệu xấu nếu dính giả xuất xứ hay vườn kiệt sức.', 'clean official trade (no blocked lot), diversified (4+ channels), resilient (no losing season); bad badges for fake origin or an exhausted orchard.')]
      ]) }
    ];
  }


  // Thẻ giới thiệu một đối thủ AI (dùng chung bản thẻ và bản 3D): kịch bản cố định đọc thẳng từ dữ liệu.
  // rv: phần tử của D.rivals · L(vi, en). Trả về chuỗi đã dịch, chưa thoát HTML.
  function rivalCard(D, rv, L) {
    const nm = o => L(o.vi, o.en), pri = id => { const p = D.priorities.find(x => x.id === id); return p ? nm(p) : id; };
    const GROUP = { compliance: L('Tuân thủ cao', 'High compliance'), channel: L('Kênh và quy mô', 'Channels and scale'), shortcut: L('Đi tắt', 'Shortcut') };
    const alloc = Object.keys(rv.alloc || {}).filter(k => rv.alloc[k] > 0).sort((a, b) => rv.alloc[b] - rv.alloc[a])
      .map(k => { const c = D.channels.find(x => x.id === k); return (c ? c.emoji + ' ' + nm(c).split(' (')[0] : k) + ' ' + rv.alloc[k] + '%'; }).join(' · ');
    const plan = (rv.plan || []).map(pri);
    return { id: rv.id, name: nm(rv), flag: rv.flag || '', ceo: rv.ceo || '', hub: rv.hub || '', img: rv.img, group: GROUP[rv.group] || rv.group || '',
      style: L(rv.styleVi, rv.styleEn), plan, planText: plan.map((x, i) => (i + 1) + '. ' + x).join(' · '), alloc,
      linked: L('Vùng liên kết ', 'Linked areas ') + Math.round((rv.linked || 0) * 100) + '%' + (rv.induce ? L(' · có xử lý nghịch vụ', ' · induces off-season') : L(' · không ép nghịch vụ', ' · no off-season forcing')) };
  }
  // Câu nói rõ vai trò của đối thủ, dùng ở mọi chỗ giới thiệu đối thủ.
  function rivalNote(L) {
    return L('Ba đối thủ chơi cùng doanh nghiệp, cùng 6 vụ, cùng engine với đội, theo kịch bản cố định ghi ở trên. Họ không phản ứng với quyết định của đội và không giành thị phần: đây là mốc để so sánh. Đội cắm cờ ở vụ nào lợi nhuận vụ đó bằng hoặc hơn đối thủ cao nhất.',
      'The three rivals play the same firm, the same 6 seasons and the same engine as your team, following the fixed scripts above. They do not react to your decisions and do not take market share from you: they are a benchmark. You plant a flag in any season where your profit matches or beats the best rival.');
  }

  window.DurianCore = {
    SHEET_CEO_MIN: SHEET_CEO_MIN,
    freshDec: freshDec,
    defaultAlloc: defaultAlloc,
    seedNewChannels: seedNewChannels,
    owned: owned,
    pendingJournal: pendingJournal,
    logEv: logEv,
    sheetComplete: sheetComplete,
    goals: goals,
    howToPlay: howToPlay,
    rivalCard: rivalCard,
    rivalNote: rivalNote,
    commitSeason: commitSeason
  };
})();
