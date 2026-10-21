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
    commitSeason: commitSeason
  };
})();
