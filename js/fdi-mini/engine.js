/* BizOn Hộ Chiếu Mini – bộ máy tính toán (không phụ thuộc giao diện). Đơn vị: triệu USD. */
(function () {
  var D = window.FDIMiniData;
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  function newGame(o) {
    var seed = o.seed || (Date.now() % 1e9);
    var st = { v: 1, seed: seed, home: o.home || 'vn', team: o.team || '', cls: o.cls || '', Q: o.quarters || 4, q: 1, cash: 20, start: 20,
      mk: D.pickMarkets(o.home || 'vn'), pos: {}, wht: {}, hol: {}, log: [], ev: null, done: false, rc: 0 };
    st.mk.forEach(function (k) { st.wht[k] = D.MARKETS[k].wht; st.hol[k] = D.MARKETS[k].hol; });
    rollEvent(st);
    return st;
  }
  function R(st) { var r = rng(st.seed + st.q * 7919 + st.rc * 104729); st.rc++; return r(); }
  function rollEvent(st) {
    if (st.q === 1) { st.ev = { id: 'calm', m: st.mk[0] }; return; }
    var m = st.mk[Math.floor(R(st) * 3)], M = D.MARKETS[m], x = R(st), id;
    if (x < M.pol * 2.2) id = 'pol';
    else { var pool = ['fxdown', 'holiday', 'tax', 'boom', 'copy', 'calm']; id = pool[Math.floor(R(st) * pool.length)]; if (id === 'fxdown' && M.fxV < 0.03 && R(st) < 0.5) id = 'boom'; }
    st.ev = { id: id, m: m };
  }
  function canAfford(st, dec) {
    var c = 0; if (dec.invest) c += D.MODES.filter(function (x) { return x.id === dec.invest.mode; })[0].cost;
    if (dec.policy) c += D.POLICIES.filter(function (x) { return x.id === dec.policy; })[0].cost;
    return c <= st.cash + 1e-9;
  }
  function value(st) {
    var v = st.cash; Object.keys(st.pos).forEach(function (k) { var p = st.pos[k]; v += p.assets * 0.8 + p.ret * (1 - st.wht[k]); }); return v;
  }
  function score10(st) { var r = value(st) / st.start, k = 27 * Math.pow(4 / st.Q, 3); return Math.max(1, Math.min(10, Math.round((3 + (r - 1) * k) * 10) / 10)); }
  function resolve(st, dec) {
    if (st.done) return null;
    var ev = st.ev, lines = [], mode = null;
    if (dec.invest && !st.pos[dec.invest.m] && canAfford(st, dec)) {
      mode = D.MODES.filter(function (x) { return x.id === dec.invest.mode; })[0];
      st.cash -= mode.cost;
      st.pos[dec.invest.m] = { mode: mode.id, since: st.q, assets: mode.id === 'lic' ? 0.4 : mode.cost, ret: 0, know: mode.id === 'jv' ? 0.2 : 0, loc: 0, hol: mode.id === 'lic' ? 0 : st.hol[dec.invest.m] };
      lines.push(['enter', dec.invest.m, mode.id]);
    }
    if (dec.policy) { st.cash -= D.POLICIES.filter(function (x) { return x.id === dec.policy; })[0].cost; }
    if (ev.id === 'holiday') { st.hol[ev.m] += 2; if (st.pos[ev.m] && st.pos[ev.m].mode !== 'lic' && st.pos[ev.m].since === st.q) st.pos[ev.m].hol += 2; }
    if (ev.id === 'tax') st.wht[ev.m] += 0.05;
    var q = { q: st.q, ev: ev, dec: dec, rows: [], home0: st.cash };
    Object.keys(st.pos).forEach(function (k) {
      var p = st.pos[k], M = D.MARKETS[k], row = { m: k, mode: p.mode };
      if (dec.policy === 'loc') p.loc = Math.min(0.45, p.loc + 0.15);
      var shock = M.fxT + M.fxV * (R(st) * 2 - 1); if (ev.id === 'fxdown' && ev.m === k) shock -= 0.12;
      if (dec.policy === 'hedge') shock *= 0.2;
      row.fx = shock; p.ret *= 1 + shock;
      var dem = 1, sev = 0;
      if (ev.m === k && ev.id === 'boom') dem = 1.25;
      if (ev.m === k && ev.id === 'pol') { sev = (dec.policy === 'gov' ? 0.4 : 1) * (p.mode === 'jv' ? 0.5 : p.mode === 'lic' ? 0.3 : 1); dem = 1 - 0.35 * sev; p.assets *= 1 - 0.25 * sev; row.pol = sev; }
      var cap = Math.min(1.4, 1 + (p.assets > 0 ? p.ret / p.assets : 0) * 0.6);
      var sales = 6 * M.size * (0.55 + 0.45 * p.know) * (1 + p.loc) * (1 - M.dist * 0.35 * (1 - p.know)) * dem * cap * (1 + shock);
      row.sales = sales;
      if (p.mode === 'lic') {
        var roy = 0.07 * sales * 1.5; if (ev.m === k && ev.id === 'copy') { roy *= 0.6; row.copy = 1; }
        var net = roy * (1 - st.wht[k]); st.cash += net; row.net = roy; row.home = net; row.tax = roy - net;
      } else {
        var margin = 0.42 - 0.14 * M.cost, pre = sales * margin * (p.mode === 'jv' ? 1.2 : 1), share = p.mode === 'jv' ? 0.5 : 1;
        var tax = p.hol > 0 ? 0 : M.cit; row.holiday = p.hol > 0; if (p.hol > 0) p.hol--;
        var n2 = pre * share * (1 - tax); row.net = n2; row.tax = pre * share * tax; p.ret += n2;
        var out = p.ret * (dec.repat || 0), got = out * (1 - st.wht[k]); p.ret -= out; st.cash += got; row.home = got; row.wht = out - got;
      }
      p.know = Math.min(1, p.know + (p.mode === 'jv' ? 0.25 : p.mode === 'fdi' ? 0.18 : 0.08));
      row.ret = p.ret; row.assets = p.assets; q.rows.push(row);
    });
    q.lines = lines; q.value = value(st); q.cash = st.cash; st.log.push(q);
    if (st.q >= st.Q) { st.done = true; st.ev = null; } else { st.q++; rollEvent(st); }
    return q;
  }
  function grade(v) { var t = [[9, 'A', 4], [8, 'B+', 3.5], [7, 'B', 3], [6.5, 'C+', 2.5], [5.5, 'C', 2], [5, 'D+', 1.5], [4, 'D', 1]]; for (var i = 0; i < t.length; i++) if (v >= t[i][0]) return { l: t[i][1], g4: t[i][2], pass: true }; return { l: 'F', g4: 0, pass: false }; }
  function profile(st) {
    var modes = Object.keys(st.pos).map(function (k) { return st.pos[k].mode; });
    var n = modes.length, rep = st.log.reduce(function (s, q) { return s + (q.dec.repat || 0); }, 0) / Math.max(1, st.log.length);
    if (n === 0) return 'idle';
    if (modes.indexOf('fdi') >= 0 && n >= 2) return 'conqueror';
    if (modes.indexOf('jv') >= 0) return 'partner';
    if (modes.every(function (m) { return m === 'lic'; })) return 'cautious';
    return rep < 0.4 ? 'builder' : 'harvester';
  }
  function code(st) { var s = score10(st); return ['HCM', st.cls || '-', (st.team || '-').replace(/\W+/g, ''), st.home, s.toFixed(1), Math.round(value(st) * 10), (st.seed % 9973)].join('-'); }
  window.FDIMini = { newGame: newGame, resolve: resolve, canAfford: canAfford, value: value, score10: score10, grade: grade, profile: profile, code: code, rollEvent: rollEvent };
})();
