/* Bộ kiểm thử cho «Lumina ứng phó sự kiện» trong js/market-dynamic.js.
 *
 * Thị trường động bốc thăm cú sốc theo tỉnh (bão, lạm phát, ngập lụt…) bằng hạt giống của lớp. Lumina
 * phải nhắc đúng những cú sốc đang tác động lên tỉnh của vòng hiện tại, và chỉ đổi LỜI, không đổi ĐIỂM.
 * Ba cú sốc mới (ngập lụt, đứt gãy chuỗi cung ứng, siết tín dụng) chỉ dành cho ván tạo sau khi thêm
 * (S.mkt.bo = 2), để ván đang chơi dở bốc thăm y hệt như trước.
 *
 * Nạp engine.js + market-dynamic.js vào vm với DOM giả tối thiểu – không cần trình duyệt.
 * Chạy:  node test/market-shock-lumina.test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* Mỗi lần gọi dựng một môi trường mới: engine, rồi (tuỳ chọn) market-dynamic bọc lên trên. */
function makeEnv(withMarket) {
  const ctx = {
    console, T: (vi) => vi, Math, JSON, Date,
    setTimeout: () => 0, clearTimeout: () => {},
    location: { search: '' },
    MutationObserver: class { observe() {} disconnect() {} },
    document: { readyState: 'complete', body: null, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ style: {}, appendChild() {}, querySelector: () => null }) },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(read('js/engine.js'), ctx, { filename: 'js/engine.js' });
  if (withMarket) vm.runInContext(read('js/market-dynamic.js'), ctx, { filename: 'js/market-dynamic.js' });
  return ctx;
}

const DEC = { price: 150, production: 2000, marketing: 50, rd: 30, workers: 45, training: 0, funding: 'equity', paymentTerm: 30 };
const newGame = (ctx, team) => ctx.newGameState({ email: 'test@vlute.edu.vn', teamName: team, role: 'CEO' });

/* ---------- khung kiểm thử tối giản (cùng kiểu test/engine.test.js) ---------- */
const tests = [];
let cur = null;
const test = (name, fn) => tests.push({ name, fn });
const check = (ok, msg) => { cur.checks.push({ ok: !!ok, msg }); if (!ok) cur.failed = true; };
const eq = (a, b, msg) => { const ok = JSON.stringify(a) === JSON.stringify(b); check(ok, msg + (ok ? '' : ` — mong ${JSON.stringify(b)}, nhận ${JSON.stringify(a)}`)); };

/* Chơi trọn ván, ghi lại lời Lumina ở mỗi vòng (trước khi chốt) và kết quả vòng. */
function play(ctx, team, mutate) {
  const s = newGame(ctx, team); ctx.S = s;
  if (mutate) mutate(s);
  const rounds = [];
  const N = vm.runInContext('ROUNDS_TOTAL', ctx); // const ở mức ngoài cùng không gắn vào đối tượng toàn cục
  for (let i = 1; i <= N; i++) {
    const shocks = ctx.BizonMarket ? ctx.BizonMarket.activeShocks(s) : [];
    const adv = { risk: ctx.luminaAdvice(s, 'risk'), pricing: ctx.luminaAdvice(s, 'pricing'), marketing: ctx.luminaAdvice(s, 'marketing') };
    const r = ctx.simulateRound(s, Object.assign({}, DEC));
    rounds.push({ shocks, adv, out: [r.netProfit, r.share] });
  }
  return { s, rounds };
}

const TEAMS = Array.from({ length: 40 }, (_, i) => 'Đội ' + i);

test('Lumina nhắc đúng mọi cú sốc đang tác động ở chủ đề «rủi ro», và chỉ cú sốc cùng chủ đề ở «giá»/«marketing»', () => {
  let seen = 0;
  for (const team of TEAMS) {
    const { rounds } = play(makeEnv(true), team);
    rounds.forEach((rd, i) => {
      rd.shocks.forEach(sh => {
        seen++;
        check(rd.adv.risk.text.includes(sh.text), `${team} vòng ${i + 1}: «rủi ro» nhắc ${sh.id}`);
        for (const t of ['pricing', 'marketing']) {
          check(rd.adv[t].text.includes(sh.text) === (sh.topic === t), `${team} vòng ${i + 1}: «${t}» ${sh.topic === t ? 'phải' : 'không được'} nhắc ${sh.id}`);
        }
      });
      if (!rd.shocks.length) check(!rd.adv.risk.text.includes('Biến động thị trường'), `${team} vòng ${i + 1}: không có cú sốc thì không nói gì thêm`);
    });
  }
  check(seen > 40, `đủ mẫu: ${seen} lượt cú sốc được kiểm`);
});

test('Mức rủi ro của lời khuyên không thấp hơn cú sốc nặng nhất đang tác động', () => {
  const R = { low: 0, medium: 1, high: 2 };
  for (const team of TEAMS) {
    play(makeEnv(true), team).rounds.forEach((rd, i) => {
      const max = rd.shocks.reduce((m, x) => Math.max(m, R[x.risk]), 0);
      check(R[rd.adv.risk.risk] >= max, `${team} vòng ${i + 1}: rủi ro ${rd.adv.risk.risk} ≥ cú sốc nặng nhất`);
    });
  }
});

test('Lời khuyên Lumina không đổi điểm: kết quả 6 vòng giống hệt khi bỏ phần bọc luminaAdvice', () => {
  for (const team of TEAMS.slice(0, 10)) {
    const a = play(makeEnv(true), team).rounds.map(r => r.out);
    const env = makeEnv(true);
    env.luminaAdvice = function () { return { risk: 'low', text: '' }; }; // thay hẳn Lumina
    const b = play(env, team).rounds.map(r => r.out);
    eq(a, b, `${team}: cùng lãi/lỗ và thị phần`);
  }
});

test('Tái lập: cùng đội, cùng quyết định thì cùng cú sốc và cùng lời khuyên', () => {
  for (const team of TEAMS.slice(0, 10)) {
    const a = play(makeEnv(true), team).rounds.map(r => [r.shocks.map(x => x.id), r.adv.risk.text]);
    const b = play(makeEnv(true), team).rounds.map(r => [r.shocks.map(x => x.id), r.adv.risk.text]);
    eq(a, b, team);
  }
});

test('Ván cũ (S.mkt không có bo) chỉ bốc trong bảy cú sốc cũ; ván mới có thể gặp cú sốc mới', () => {
  const OLD = ['storm', 'inflation', 'trend', 'festival', 'fuel', 'store', 'kol'];
  const idsOf = s => s.mkt.news.map(x => x.id);
  let newSeen = new Set();
  for (const team of TEAMS) {
    const env = makeEnv(true);
    // giả lập ván tạo trước khi thêm cú sốc: dựng S.mkt rồi xoá dấu bo
    const old = play(env, team, s => { env.BizonMarket.ensure(s); delete s.mkt.bo; });
    check(idsOf(old.s).every(id => OLD.includes(id)), `${team}: ván cũ chỉ có cú sốc cũ (${idsOf(old.s).join(',')})`);
    const fresh = play(makeEnv(true), team);
    idsOf(fresh.s).filter(id => !OLD.includes(id)).forEach(id => newSeen.add(id));
  }
  eq([...newSeen].sort(), ['credit', 'flood', 'supply'], 'qua 40 đội, ván mới gặp đủ ba cú sốc mới');
});

test('Ván cũ cho đúng dãy cú sốc như trước khi thêm (so với bảng bảy cú sốc gốc)', () => {
  // Chạy lại phép bốc thăm gốc độc lập với mã đã sửa: cùng prng, cùng trọng số bảy cú sốc.
  const W = [['storm', 2], ['inflation', 2], ['trend', 3], ['festival', 2], ['fuel', 2], ['store', 2], ['kol', 2]];
  const hash = str => { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) || 1; };
  const prng = seed => () => ((seed = (Math.imul(seed, 48271) % 2147483647 + 2147483647) % 2147483647) / 2147483647);
  for (const team of TEAMS.slice(0, 15)) {
    const env = makeEnv(true);
    const { s } = play(env, team, st => { env.BizonMarket.ensure(st); delete st.mkt.bo; });
    const seed = hash(team + '|' + (s.caseId || 'A'));
    const want = [];
    for (let n = 1; n < 6; n++) {
      const rnd = prng(seed + n * 7919); const cnt = rnd() < 0.45 ? 2 : 1;
      for (let i = 0; i < cnt; i++) {
        let p = rnd() * 15, id = W[0][0];
        for (const [k, w] of W) { if ((p -= w) <= 0) { id = k; break; } }
        const PICK = { storm: [3, 4, 5], festival: [3, 4, 6] }, ALL = { inflation: 1 };
        const pool = (PICK[id] || [2, 3, 4, 5, 6]).filter(k => k > n);
        if (ALL[id]) { want.push(id); continue; }
        if (!pool.length) continue;
        rnd(); want.push(id); // một lần rnd() để chọn thành phố đích
      }
    }
    eq(s.mkt.news.map(x => x.id).reverse(), want, `${team}: dãy cú sốc của ván cũ`);
  }
});

/* ================= CHẠY ================= */
let failed = 0;
for (const t of tests) {
  cur = { checks: [], failed: false };
  try { t.fn(); } catch (e) { cur.failed = true; cur.checks.push({ ok: false, msg: 'ngoại lệ: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ') }); }
  console.log((cur.failed ? '✗ ' : '✓ ') + t.name);
  cur.checks.filter(c => !c.ok).slice(0, 8).forEach(c => console.log('    ✗ ' + c.msg));
  if (cur.failed) failed++;
}
console.log(`\n${tests.length - failed}/${tests.length} phép thử đạt`);
process.exit(failed ? 1 : 0);
