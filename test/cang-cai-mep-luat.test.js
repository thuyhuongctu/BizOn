/* Bật Nghiệp · Cảng Cái Mép, vụ 5: đội chọn cách xử lý hàng kẹt (specs/005-cang-cai-mep, câu chuyện 2).
 *
 * Luật cảng nằm trong mô-đun riêng js/cang-cai-mep.js, móc vào currentEvent và simulateRound như
 * js/market-dynamic.js; js/engine.js, js/app.js, js/backend.js không đổi dòng nào (hồ sơ quyền tác giả).
 *
 * Phần 1 (Node vm, không cần trình duyệt), cho mỗi trường hợp A, B, C, khi bật và tắt thị trường động:
 *  - «không chọn» và (b) trùng từng con số với luật cũ (không nạp mô-đun);
 *  - (a) không cắt đơn, costMul = Ca × hệ số thành phố, giá thành đơn vị tăng đúng tỉ lệ Ca / 1,25;
 *  - (c) bán 95% số bán được, brand giảm U trước vụ 6;
 *  - khiên bảo hiểm giảm một nửa phần bất lợi của lựa chọn đã chọn (kể cả mức giảm uy tín của (c));
 *  - vụ khác vụ 5 không bị ảnh hưởng; đối thủ ảo không đổi (thị phần, lợi nhuận);
 *  - Lumina chỉ hỏi gợi mở ở vụ 5, không chọn giúp.
 * Phần 2 (tĩnh): game.html, bat-nghiep-v2.html nạp mô-đun sau market-dynamic.js; sw.js lưu sẵn; bản xuất Excel
 *  của giảng viên có cột «Lựa chọn ở cảng (vụ 5)»; thẻ hải quan 3D có nút «Ra quyết định».
 * Phần 3 (Playwright, cần BIZON_URL): ô «🚢 Xử lý hàng kẹt ở Cái Mép» chỉ hiện ở vụ 5, mặc định (b), chọn được,
 *  tải lại vẫn giữ, VI/EN, vùng chạm ≥ 44 px, không tràn ngang ở 360 và 390 px; bản v2 có cùng ô.
 *
 * Chạy:  node test/cang-cai-mep-luat.test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const MOD = 'js/cang-cai-mep.js';

let fails = 0;
const check = (ok, msg) => { if (!ok) { fails++; console.log('  ✗ ' + msg); } else if (process.env.VERBOSE) console.log('  ✓ ' + msg); };
const near = (a, b, tol, msg) => check(Math.abs(a - b) <= tol, msg + (Math.abs(a - b) <= tol ? '' : ` — mong ${b}±${tol}, nhận ${a}`));
const same = (a, b, msg) => { const x = JSON.stringify(a), y = JSON.stringify(b); check(x === y, msg + (x === y ? '' : ` — khác nhau:\n      ${x.slice(0, 300)}\n      ${y.slice(0, 300)}`)); };
let passed = 0; const section = (name, fn) => { const f0 = fails; try { fn(); } catch (e) { check(false, name + ': ngoại lệ ' + String(e.message).split('\n')[0]); } console.log((fails === f0 ? '✅ ' : '❌ ') + name); if (fails === f0) passed++; };

/* ---------- Môi trường vm: engine, (tuỳ chọn) thị trường động, (tuỳ chọn) luật cảng ---------- */
function makeEnv({ market = true, marketOff = false, port = true } = {}) {
  const ctx = {
    console, T: (vi) => vi, Math, JSON, Date, URLSearchParams,   // market-dynamic đọc ?market=off bằng URLSearchParams
    setTimeout: () => 0, clearTimeout: () => {},
    location: { search: marketOff ? '?market=off' : '' },
    MutationObserver: class { observe() {} disconnect() {} },
    addEventListener() {},
    document: { readyState: 'complete', body: null, head: null, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ style: {}, appendChild() {}, querySelector: () => null, setAttribute() {} }) },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(read('js/engine.js'), ctx, { filename: 'js/engine.js' });
  if (market) vm.runInContext(read('js/market-dynamic.js'), ctx, { filename: 'js/market-dynamic.js' });
  if (port && fs.existsSync(path.join(ROOT, MOD))) vm.runInContext(read(MOD), ctx, { filename: MOD });
  return ctx;
}

// Sản lượng lớn hơn cầu để phần cắt đơn của biến cố hiện rõ (hàng có sẵn nhưng không giao được).
const DEC = i => ({ price: 145 + i * 3, production: 2600 + i * 50, marketing: 55 + i * 4, rd: 25, workers: 45, training: 1, funding: 'loan', paymentTerm: 30 });
const clone = o => JSON.parse(JSON.stringify(o));
const strip = r => { const x = clone(r); if (x.decisions) delete x.decisions.portChoice; return x; };
const stripState = s => { const x = clone(s); delete x.portChoice; (x.history || []).forEach(h => { if (h.decisions) delete h.decisions.portChoice; }); return x; };

/* Chơi trọn 6 vụ. choice: undefined (không chạm ô) | 'a' | 'b' | 'c', đặt trước khi chốt vụ 5. */
function play(ctx, caseId, choice, { shield = false, team = 'Đội Cảng', from = 5 } = {}) {
  const s = ctx.newGameState({ email: 'test@ctu.edu.vn', teamName: team, role: 'COO' });
  s.caseId = caseId; ctx.S = s;
  const reps = [], evs = [], snaps = [];
  for (let i = 1; i <= 6; i++) {
    if (choice !== undefined && i === from) s.portChoice = choice;
    if (shield && i === 5) s.activeBoosts = ['INS_SHIELD_01'];
    evs.push(clone(ctx.currentEvent(s)));
    const before = { inv: s.inventory, brand: s.brand };
    const r = ctx.simulateRound(s, DEC(i));
    reps.push(clone(r));
    snaps.push({ before, brandAfter: s.brand, loyAfter: s.brandLoyalty, comp: clone(s.competitors) });
  }
  return { s, reps, evs, snaps };
}

const modExists = fs.existsSync(path.join(ROOT, MOD));
check(modExists, 'có ' + MOD);
const P0 = modExists ? makeEnv().BizonPort : null;
check(P0 && typeof P0.CA === 'number' && typeof P0.U === 'number' && typeof P0.FULFILL_C === 'number', 'mô-đun xuất window.BizonPort với tham số CA, U, FULFILL_C');
const CA = P0 ? P0.CA : 1.4, U = P0 ? P0.U : 0.06, FC = P0 ? P0.FULFILL_C : 0.95;
check(CA > 1.25 && CA <= 1.6 && U > 0 && U <= 0.1 && FC > 0.85 && FC < 1, `tham số trong khoảng hợp lý (Ca ${CA}, U ${U}, FULFILL_C ${FC})`);

const MODES = [['thị trường động bật', { market: true }], ['thị trường động tắt (?market=off)', { market: true, marketOff: true }], ['không nạp thị trường động', { market: false }]];

for (const [mname, mopt] of MODES) for (const cs of ['A', 'B', 'C']) {
  const tag = `[${cs} · ${mname}]`;
  const old = play(makeEnv(Object.assign({}, mopt, { port: false })), cs);
  const none = play(makeEnv(mopt), cs);
  const b = play(makeEnv(mopt), cs, 'b');
  const a = play(makeEnv(mopt), cs, 'a');
  const c = play(makeEnv(mopt), cs, 'c');

  section(`${tag} «không chọn» và (b) trùng từng con số với luật cũ`, () => {
    if (mopt.market) check(!!old.evs[4].city === !mopt.marketOff, `${tag} thị trường động ${mopt.marketOff ? 'tắt thật' : 'bật thật'} (hệ số thành phố ${old.evs[4].city ? 'có' : 'không có'})`);
    check(/EV_SUPPLY/.test(old.evs[4].id), `${tag} vụ 5 là biến cố hậu cần (${old.evs[4].id})`);
    same(none.reps.map(strip), old.reps, `${tag} không chọn: 6 báo cáo vụ trùng luật cũ`);
    same(b.reps.map(strip), old.reps, `${tag} (b): 6 báo cáo vụ trùng luật cũ`);
    same(stripState(none.s), stripState(old.s), `${tag} không chọn: trạng thái cuối ván trùng luật cũ`);
    same(stripState(b.s), stripState(old.s), `${tag} (b): trạng thái cuối ván trùng luật cũ`);
    check(none.reps[4].decisions.portChoice === 'b' && b.reps[4].decisions.portChoice === 'b', `${tag} lựa chọn vụ 5 ghi vào quyết định đã nộp (mặc định 'b')`);
    check(!old.reps[4].decisions.portChoice, `${tag} luật cũ không có trường portChoice`);
  });

  section(`${tag} (a) trả phí ưu tiên: giao đủ, costMul = Ca × hệ số thành phố`, () => {
    const ship = old.evs[4].costMul / 1.25, ev = a.evs[4], r = a.reps[4], rb = b.reps[4];
    near(ev.costMul, CA * ship, 1e-9, `${tag} costMul vụ 5 = ${CA} × ${ship.toFixed(3)}`);
    check(ev.fulfillMul === undefined, `${tag} không còn fulfillMul (không cắt đơn)`);
    check(r.sold === Math.min(r.demandUnits, DEC(5).production + a.snaps[4].before.inv), `${tag} bán đủ cầu (${r.sold}/${r.demandUnits})`);
    check(r.sold > rb.sold, `${tag} bán nhiều hơn (b): ${r.sold} > ${rb.sold}`);
    near(r.unitCost / rb.unitCost, CA / 1.25, 1e-9, `${tag} giá thành đơn vị tăng đúng Ca / 1,25`);
    near(r.fixed / rb.fixed, CA / 1.25, 1e-9, `${tag} chi phí cố định tăng đúng Ca / 1,25`);
    check(r.share === rb.share && r.demandUnits === rb.demandUnits, `${tag} thị phần và cầu không đổi`);
    same(r.rivals, rb.rivals, `${tag} đối thủ ảo vụ 5 không đổi (thị phần, doanh thu, chi phí, lợi nhuận)`);
    same(a.snaps[4].comp, b.snaps[4].comp, `${tag} lợi nhuận lũy kế của đối thủ ảo không đổi`);
    check((a.s.maintenanceLog || []).some(m => m.round === 5 && /Phí ưu tiên cảng/.test(m.text)), `${tag} báo cáo vụ ghi «Phí ưu tiên cảng»`);
    near(a.snaps[4].brandAfter, b.snaps[4].brandAfter, 1e-12, `${tag} (a) không đổi thương hiệu`);
  });

  section(`${tag} (c) lùi ngày giao: bán 95%, uy tín giảm U trước vụ 6`, () => {
    const ev = c.evs[4], r = c.reps[4], rb = b.reps[4];
    check(ev.fulfillMul === FC, `${tag} fulfillMul = ${FC}`);
    near(ev.costMul, old.evs[4].costMul, 1e-12, `${tag} costMul giữ như biến cố`);
    check(r.sold === Math.round(Math.min(r.demandUnits, DEC(5).production + c.snaps[4].before.inv) * FC), `${tag} bán ${Math.round(FC * 100)}% số bán được (${r.sold})`);
    near(c.snaps[4].brandAfter, Math.max(0.5, b.snaps[4].brandAfter - U), 1e-12, `${tag} brand sau vụ 5 giảm ${U}`);
    check(r.brandLoyalty === rb.brandLoyalty, `${tag} báo cáo vụ 5 vẫn ghi lòng trung thành trước khi giảm`);
    check(c.reps[5].share < b.reps[5].share, `${tag} vụ 6 thị phần thấp hơn (b) vì uy tín giảm (${c.reps[5].share.toFixed(2)} < ${b.reps[5].share.toFixed(2)})`);
    same(r.rivals, rb.rivals, `${tag} đối thủ ảo vụ 5 không đổi`);
    same(c.snaps[4].comp, b.snaps[4].comp, `${tag} lợi nhuận lũy kế của đối thủ ảo không đổi`);
    check((c.s.maintenanceLog || []).some(m => m.round === 5 && /Lùi ngày giao – uy tín giảm/.test(m.text)), `${tag} báo cáo vụ ghi «Lùi ngày giao – uy tín giảm»`);
  });

  section(`${tag} vụ khác vụ 5 không bị ảnh hưởng`, () => {
    const ctx = makeEnv(mopt), s = ctx.newGameState({ email: 't', teamName: 'Đội Kiểm', role: 'CEO' }); s.caseId = cs; ctx.S = s;
    for (let i = 1; i <= 6; i++) {
      if (i !== 5) for (const ch of ['a', 'c']) {
        delete s.portChoice; const e0 = clone(ctx.currentEvent(s));
        s.portChoice = ch; const e1 = clone(ctx.currentEvent(s));
        same(e1, e0, `${tag} vụ ${i}: biến cố không đổi khi portChoice = '${ch}'`);
      }
      delete s.portChoice; ctx.simulateRound(s, DEC(i));
    }
    const early = play(makeEnv(mopt), cs, 'a', { from: 1 });
    same(early.reps.slice(0, 4).map(strip), old.reps.slice(0, 4), `${tag} chọn (a) từ vụ 1: vụ 1–4 trùng luật cũ`);
    check(early.reps.slice(0, 4).every(r => !('portChoice' in r.decisions)), `${tag} vụ 1–4 không ghi portChoice`);
    check(!('portChoice' in a.reps[5].decisions), `${tag} vụ 6 không ghi portChoice`);
  });

  section(`${tag} khiên bảo hiểm giảm một nửa phần bất lợi`, () => {
    const ob = play(makeEnv(Object.assign({}, mopt, { port: false })), cs, undefined, { shield: true });
    const sb = play(makeEnv(mopt), cs, 'b', { shield: true });
    const sa = play(makeEnv(mopt), cs, 'a', { shield: true });
    const sc = play(makeEnv(mopt), cs, 'c', { shield: true });
    check(sb.reps[4].shielded && sa.reps[4].shielded && sc.reps[4].shielded, `${tag} khiên có tác dụng ở vụ 5`);
    same(sb.reps.map(strip), ob.reps, `${tag} (b) có khiên trùng luật cũ có khiên`);
    near(sa.reps[4].unitCost / sb.reps[4].unitCost, (1 + (CA - 1) / 2) / 1.125, 1e-9, `${tag} (a) có khiên: hệ số chi phí ${1 + (CA - 1) / 2} thay cho 1,125`);
    check(sa.reps[4].sold === Math.min(sa.reps[4].demandUnits, DEC(5).production + sa.snaps[4].before.inv), `${tag} (a) có khiên: vẫn giao đủ`);
    const fcs = 1 - (1 - FC) / 2;
    check(sc.reps[4].sold === Math.round(Math.min(sc.reps[4].demandUnits, DEC(5).production + sc.snaps[4].before.inv) * fcs), `${tag} (c) có khiên: bán ${fcs * 100}%`);
    near(sc.snaps[4].brandAfter, Math.max(0.5, sb.snaps[4].brandAfter - U / 2), 1e-12, `${tag} (c) có khiên: brand giảm ${U / 2}`);
    same(sa.reps[4].rivals, sb.reps[4].rivals, `${tag} (a) có khiên: đối thủ ảo không đổi`);
    same(sa.snaps[4].comp, sb.snaps[4].comp, `${tag} (a) có khiên: lợi nhuận lũy kế đối thủ không đổi`);
  });
}

section('Lumina chỉ hỏi gợi mở ở vụ 5, không chọn giúp (FR-008)', () => {
  for (const cs of ['A', 'B', 'C']) {
    const ctx = makeEnv(), ctx0 = makeEnv({ port: false });
    const s = ctx.newGameState({ email: 't', teamName: 'Đội Lumina', role: 'CEO' }), s0 = ctx0.newGameState({ email: 't', teamName: 'Đội Lumina', role: 'CEO' });
    s.caseId = s0.caseId = cs; ctx.S = s; ctx0.S = s0;
    for (let i = 1; i <= 6; i++) {
      const adv = ctx.luminaAdvice(s, 'risk').text, adv0 = ctx0.luminaAdvice(s0, 'risk').text;
      if (i === 5) {
        check(adv.startsWith(adv0) && adv.length > adv0.length, `${cs} vụ 5: Lumina thêm một câu hỏi vào lời khuyên «rủi ro»`);
        const q = adv.slice(adv0.length);
        check(/Biên lợi nhuận/.test(q) && /thương hiệu/.test(q) && q.trim().endsWith('?'), `${cs} vụ 5: câu hỏi về biên lợi nhuận và thương hiệu vụ 6 («${q.trim()}»)`);
        check(!/nên chọn|hãy chọn|tốt hơn|tốt nhất|khuyên/i.test(q), `${cs} vụ 5: Lumina không chọn giúp, không nói lựa chọn nào tốt hơn`);
        for (const t of ['pricing', 'marketing']) check(ctx.luminaAdvice(s, t).text === ctx0.luminaAdvice(s0, t).text, `${cs} vụ 5: chủ đề «${t}» không đổi`);
      } else check(adv === adv0, `${cs} vụ ${i}: lời Lumina không đổi`);
      ctx.simulateRound(s, DEC(i)); ctx0.simulateRound(s0, DEC(i));
    }
  }
});

section('Ván cũ dở ở vụ 5 (không có portChoice) và ván đã xong', () => {
  const ctx = makeEnv(), s = ctx.newGameState({ email: 't', teamName: 'Đội Cũ', role: 'CEO' }); ctx.S = s;
  for (let i = 1; i <= 4; i++) ctx.simulateRound(s, DEC(i));
  const P = ctx.BizonPort;
  check(P.choice(s) === 'b' && P.active(s), 'ván cũ mở lại ở vụ 5: ô hiện, mặc định (b)');
  s.portChoice = 'x'; check(P.choice(s) === 'b', 'giá trị lạ tính là (b)');
  delete s.portChoice; ctx.simulateRound(s, DEC(5));
  check(!P.active(s), 'sang vụ 6: ô ẩn');
  ctx.simulateRound(s, DEC(6)); check(s.finished && !P.active(s), 'ván xong: ô ẩn');
});

/* ---------- Phần 2: tĩnh ---------- */
section('Trang nạp mô-đun, sw.js, mã nguồn hồ sơ quyền tác giả không đổi', () => {
  for (const f of ['game.html', 'bat-nghiep-v2.html']) {
    const h = read(f);
    check(/<script src="js\/market-dynamic\.js"><\/script>\s*<script src="js\/cang-cai-mep\.js"><\/script>/.test(h), `${f}: nạp js/cang-cai-mep.js ngay sau market-dynamic.js`);
    check((h.match(/cang-cai-mep\.js/g) || []).length === 1, `${f}: nạp đúng một lần`);
  }
  const sw = read('sw.js');
  check(/'\.\/js\/cang-cai-mep\.js'/.test(sw), 'sw.js lưu sẵn js/cang-cai-mep.js');
  check(+(/CACHE = 'bizon-v(\d+)'/.exec(sw) || [])[1] >= 900, 'sw.js ≥ bizon-v900');
  for (const f of ['js/engine.js', 'js/app.js', 'js/backend.js']) check(!/cang-cai-mep|portChoice|BizonPort/.test(read(f)), `${f} không chứa luật cảng`);
  const mod = modExists ? read(MOD) : '';
  check(/const CA = [\d.]+/.test(mod) && /const U = [\d.]+/.test(mod) && /const FULFILL_C = [\d.]+/.test(mod), 'tham số Ca, U, FULFILL_C đặt ở đầu mô-đun');
  check(/Xử lý hàng kẹt ở Cái Mép/.test(mod) && /Cái Mép/.test(mod.replace(/Xử lý hàng kẹt ở Cái Mép/g, '')), 'mô-đun có ô «Xử lý hàng kẹt ở Cái Mép», tên riêng giữ dấu ở bản EN');
  const m3 = read('js/cang-cai-mep-3d.js');
  check(/Ra quyết định/.test(m3) && /Make the decision|Decide now|Go to decisions/.test(m3) && /__openTab\('decisions'\)/.test(m3), 'thẻ hải quan 3D có nút «Ra quyết định» mở tab decisions qua cầu nối');
});

section('Bản xuất Excel của giảng viên có cột «Lựa chọn ở cảng (vụ 5)»', () => {
  const ctx = { window: {}, console };
  let blob = '';
  ctx.Blob = class { constructor(parts) { blob = parts.join(''); } };
  ctx.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
  ctx.document = { createElement: () => ({ click() {}, remove() {} }), body: { appendChild() {} } };
  ctx.setTimeout = () => 0;
  vm.createContext(ctx);
  vm.runInContext(read('js/bizon-grading.js'), ctx);
  const P = ctx.window.BizOnInstructorPage;
  const sub = (team, round, port) => ({ team_name: team, round_number: round, created_at: '2026-11-20T0' + round + ':00:00Z', student_email: 'x@student.ctu.edu.vn',
    result_json: { netProfit: 10, share: 26, oee: 86, quickRatio: 1.2, eventId: round === 5 ? 'EV_SUPPLY_B' : 'EV_STABLE', decisions: Object.assign({ price: 150 }, port && round === 5 ? { portChoice: port } : {}) } });
  const subs = [].concat(...[['Đội A', 'a'], ['Đội B', 'b'], ['Đội C', 'c'], ['Đội Cũ', null]].map(([t, p]) => [1, 2, 3, 4, 5, 6].map(r => sub(t, r, p))));
  const T = P.teams(subs), G = P.grades(T, [], {}, []);
  P.xls('KT-TEST', T, G, [], [], [], null, []);
  check(/Lựa chọn ở cảng \(vụ 5\)/.test(blob), 'tiêu đề cột «Lựa chọn ở cảng (vụ 5)»');
  const rowOf = n => (blob.split('<Row>').find(r => r.includes(`>${n}<`) && r.includes('Đạt') || r.includes(`>${n}<`) && r.includes('Không')) || '');
  check(/Trả phí ưu tiên/.test(rowOf('Đội A')), 'đội chọn (a) hiện «Trả phí ưu tiên»');
  check(/Chờ hoặc đổi cảng/.test(rowOf('Đội B')), 'đội chọn (b) hiện «Chờ hoặc đổi cảng»');
  check(/lùi ngày giao/i.test(rowOf('Đội C')), 'đội chọn (c) hiện «Lùi ngày giao»');
  check(!/Trả phí ưu tiên|Chờ hoặc đổi cảng|lùi ngày giao/i.test(rowOf('Đội Cũ')), 'ván chơi trước khi có luật cảng để trống');
});

/* ---------- Phần 3: trình duyệt ---------- */
async function browserPart() {
  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) {
    try { chromium = require('playwright-core').chromium; } catch (e2) { console.log('❌ Cần playwright cho phần trình duyệt'); fails++; return; }
  }
  // Ván đang ở vụ 5 (trường hợp B), dựng bằng chính engine trong Node rồi đặt vào localStorage.
  const seed = (round, caseId) => {
    const ctx = makeEnv({ port: false }), s = ctx.newGameState({ email: 'sv@student.ctu.edu.vn', teamName: 'Đội Cảng Thử', role: 'COO' });
    s.caseId = caseId; s.caseDrawn = true; s.eventShownRound = round; s.rivalDialogueShownRound = round; ctx.S = s;
    for (let i = 1; i < round; i++) ctx.simulateRound(s, DEC(i));
    s.eventShownRound = round; return JSON.stringify(s);
  };
  const browser = await chromium.launch();
  try {
    for (const [lang, w] of [['vi', 360], ['en', 390], ['vi', 1280]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, serviceWorkers: 'block' });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
      await page.addInitScript(([l, st]) => { try { if (!sessionStorage.getItem('seeded')) { localStorage.clear(); localStorage.setItem('bizon2026', st); sessionStorage.setItem('seeded', '1'); }
        localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-intro-seen', '1'); localStorage.setItem('bizon-tour-seen', '1'); } catch (e) {} }, [lang, seed(5, 'B')]);
      await page.route(/\.(woff2?|mp3|m4a|mp4|glb)(\?|$)/, r => r.abort());
      const enter = async () => {
        await page.goto(BASE + '/game.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('#resume-continue', { state: 'visible', timeout: 20000 }).catch(() => {});
        await page.evaluate(() => { const b = document.getElementById('resume-continue'); if (b) b.click(); });
        await page.waitForFunction(() => typeof S !== 'undefined' && S && S.round === 5, null, { timeout: 20000 });
        await page.evaluate(() => { document.querySelectorAll('.fixed.inset-0').forEach(x => x.remove()); showTab('decisions'); });
        await page.waitForTimeout(400);
      };
      await enter();
      const r1 = await page.evaluate(() => {
        const box = document.getElementById('bz-port'), inputs = box ? [...box.querySelectorAll('input[type=radio]')] : [];
        const labels = box ? [...box.querySelectorAll('label')] : [];
        return { has: !!box, inDec: !!(box && box.closest('#tab-decisions')), n: inputs.length, checked: (inputs.find(x => x.checked) || {}).value, text: box ? box.textContent : '',
          minH: labels.length ? Math.min(...labels.map(l => l.getBoundingClientRect().height)) : 0,
          over: document.documentElement.scrollWidth - innerWidth, boxR: box ? Math.round(box.getBoundingClientRect().right) : 0 };
      });
      const tag = `game.html ${lang} ${w}px`;
      check(r1.has && r1.inDec, `${tag}: ô cảng nằm trong #tab-decisions ở vụ 5`);
      check(r1.n === 3 && r1.checked === 'b', `${tag}: ba lựa chọn, mặc định (b) (${r1.n}, ${r1.checked})`);
      check(lang === 'vi' ? /Xử lý hàng kẹt ở Cái Mép/.test(r1.text) && /Trả phí ưu tiên/.test(r1.text) : /Cái Mép/.test(r1.text) && /priority/i.test(r1.text) && !/Trả phí ưu tiên/.test(r1.text), `${tag}: chữ theo ngôn ngữ (${r1.text.slice(0, 60)}…)`);
      check(/Hàng ngoại|imports/i.test(r1.text), `${tag}: câu chữ theo trường hợp B`);
      check(r1.minH >= 44, `${tag}: vùng chạm mỗi lựa chọn ≥ 44 px (${Math.round(r1.minH)})`);
      check(r1.over <= 0 && r1.boxR <= w, `${tag}: không tràn ngang (lệch ${r1.over}, mép phải ô ${r1.boxR})`);
      if (w === 1280) { check(!errors.length, `${tag}: không lỗi JS (${errors.join(' | ')})`); await ctx.close(); continue; }
      await page.evaluate(() => { const i = document.querySelector('#bz-port input[value="a"]'); i.closest('label').click(); });
      const saved = await page.evaluate(() => [S.portChoice, JSON.parse(localStorage.getItem('bizon2026')).portChoice]);
      check(saved[0] === 'a' && saved[1] === 'a', `${tag}: chọn (a) ghi vào ván và lưu máy (${saved})`);
      await enter();
      const kept = await page.evaluate(() => ({ c: (document.querySelector('#bz-port input:checked') || {}).value, s: S.portChoice }));
      check(kept.c === 'a' && kept.s === 'a', `${tag}: tải lại trước khi chốt vẫn giữ (a)`);
      // Chốt vụ 5: lựa chọn đi vào báo cáo; sang vụ 6 ô ẩn.
      await page.evaluate(() => { commitDecisions(); });
      await page.waitForFunction(() => S.round === 6 || S.finished, null, { timeout: 15000 });
      const after = await page.evaluate(() => ({ hist: S.history[4].decisions.portChoice, box: !!document.getElementById('bz-port') && !document.getElementById('bz-port').hidden, log: (S.maintenanceLog || []).map(m => m.text).join(' | '), why: explainRound(S.history[4]) }));
      check(after.hist === 'a' && !after.box, `${tag}: chốt vụ 5 ghi lựa chọn vào báo cáo, sang vụ 6 ô ẩn`);
      check(/Phí ưu tiên cảng|Port priority fee/.test(after.log), `${tag}: nhật ký có dòng phí ưu tiên cảng`);
      check(/Phí ưu tiên cảng|port priority fee/.test(after.why), `${tag}: «Vì sao?» của kết quả vụ 5 có dòng phí ưu tiên cảng`);
      check(!errors.length, `${tag}: không lỗi JS (${errors.join(' | ')})`);
      await ctx.close();
    }
    // Vụ 4: không có ô.
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      await page.addInitScript(st => { try { localStorage.clear(); localStorage.setItem('bizon2026', st); localStorage.setItem('bizon-intro-seen', '1'); } catch (e) {} }, seed(4, 'A'));
      await page.route(/\.(woff2?|mp3|m4a|mp4|glb)(\?|$)/, r => r.abort());
      await page.goto(BASE + '/game.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('#resume-continue', { state: 'visible', timeout: 20000 }).catch(() => {});
      await page.evaluate(() => { const b = document.getElementById('resume-continue'); if (b) b.click(); });
      await page.waitForFunction(() => typeof S !== 'undefined' && S && S.round === 4, null, { timeout: 20000 });
      await page.evaluate(() => showTab('decisions')); await page.waitForTimeout(300);
      const has = await page.evaluate(() => { const b = document.getElementById('bz-port'); return !!b && !b.hidden; });
      check(!has, 'game.html vụ 4: không có ô cảng');
      await ctx.close();
    }
    // Bản v2: cùng ô, cùng mặc định.
    for (const [lang, w] of [['vi', 360], ['en', 390]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, serviceWorkers: 'block' });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(([l, st]) => { try { localStorage.clear(); localStorage.setItem('bizon2026', st); localStorage.setItem('bizon-lang', l); } catch (e) {} }, [lang, seed(5, 'C')]);
      await page.route(/\.(woff2?|mp3|m4a|mp4|glb)(\?|$)/, r => r.abort());
      await page.goto(BASE + '/bat-nghiep-v2.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('[data-act="resume"]', { timeout: 20000 }).catch(() => {});
      await page.evaluate(() => { const b = document.querySelector('[data-act="resume"]'); if (b) b.click(); });
      await page.waitForSelector('#bz-port', { timeout: 10000 }).catch(() => {});
      const r = await page.evaluate(() => { const box = document.getElementById('bz-port'), labels = box ? [...box.querySelectorAll('label')] : [];
        return { has: !!box && !!box.closest('[aria-labelledby="bn2-dec-h"]'), checked: (document.querySelector('#bz-port input:checked') || {}).value, text: box ? box.textContent : '',
          minH: labels.length ? Math.min(...labels.map(l => l.getBoundingClientRect().height)) : 0, over: document.documentElement.scrollWidth - innerWidth }; });
      const tag = `bat-nghiep-v2 ${lang} ${w}px`;
      check(r.has && r.checked === 'b', `${tag}: ô cảng trong khung quyết định, mặc định (b)`);
      check(/livestream/i.test(r.text), `${tag}: câu chữ theo trường hợp C`);
      check(r.minH >= 44 && r.over <= 0, `${tag}: chạm ≥ 44 px (${Math.round(r.minH)}), không tràn ngang (${r.over})`);
      await page.evaluate(() => { document.querySelector('#bz-port input[value="c"]').closest('label').click(); });
      await page.evaluate(() => { const i = document.getElementById('bn2-price'); if (i) { i.value = 160; i.dispatchEvent(new Event('input', { bubbles: true })); } });
      const st = await page.evaluate(() => ({ s: S.portChoice, c: (document.querySelector('#bz-port input:checked') || {}).value }));
      check(st.s === 'c' && st.c === 'c', `${tag}: chọn (c) ghi vào ván, kéo thanh trượt không mất lựa chọn`);
      await page.evaluate(() => document.querySelector('[data-act="commit"]').click());
      await page.waitForSelector('.bn2-modal .bzp-note', { timeout: 8000 }).catch(() => {});
      const rep = await page.evaluate(() => ({ note: (document.querySelector('.bn2-modal .bzp-note') || {}).textContent || '', hist: S.history[4] && S.history[4].decisions.portChoice, box: !!document.getElementById('bz-port') }));
      check(rep.hist === 'c' && /Lùi ngày giao|Later delivery/.test(rep.note) && !rep.box, `${tag}: chốt vụ 5 thì báo cáo vụ có dòng «${rep.note.trim()}», ô ẩn`);
      check(!errors.length, `${tag}: không lỗi JS (${errors.join(' | ')})`);
      await ctx.close();
    }
  } finally { await browser.close(); }
}

(async () => {
  if (!process.env.SKIP_BROWSER) {
    const f0 = fails;
    try { await browserPart(); } catch (e) { fails++; console.log('  ✗ phần trình duyệt: ' + String(e.message).split('\n')[0]); }
    console.log((fails === f0 ? '✅ ' : '❌ ') + 'Ô quyết định trên trang (game.html, bat-nghiep-v2.html)');
  }
  console.log(fails ? `\n❌ ${fails} kiểm tra hỏng` : `\n✅ Tất cả đạt (${passed} nhóm)`);
  process.exit(fails ? 1 : 0);
})();
