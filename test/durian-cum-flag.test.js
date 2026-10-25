// Hộ Chiếu Sầu Riêng: cờ lũy kế 🏁 (lãi cộng dồn tới vụ n ≥ đối thủ cao nhất) cạnh cờ từng vụ – không đổi luật điểm.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ctx = {}; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-core.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-engine.js'), ctx);
const D = ctx.DurianData, C = ctx.DurianCore, E = ctx.DurianEngine;

// 1. Hàm: lịch sử giả, so với từng vụ của flagFor.
const H = p => ({ profit: p });
const rivals = [{ id: 'a', state: { history: [H(1), H(1), H(1)] } }, { id: 'b', state: { history: [H(-2), H(5), H(0)] } }];
const team = [H(2), H(0), H(1)];
let c = C.cumFlag(rivals, team, 1); assert.equal(c.win, true); assert.equal(c.rank, 1); assert.equal(c.of, 3); assert.equal(c.team, 2); assert.equal(c.best, 1); assert.equal(c.bestId, 'a');
c = C.cumFlag(rivals, team, 2); assert.equal(c.win, false, 'vụ 2: đội 2, a 2, b 3 → không dẫn đầu'); assert.equal(c.rank, 2); assert.equal(c.bestId, 'b');
c = C.cumFlag(rivals, team, 3); assert.equal(c.win, true, 'vụ 3: đội 3 = a 3 = b 3 → bằng là thắng (như flagFor)'); assert.equal(c.rank, 1);
assert.equal(E.flagFor(rivals, Object.assign({ n: 2 }, team[1])).win, false, 'cờ vụ 2 vẫn tính riêng theo lãi vụ');
assert.equal(C.cumFlag([], team, 2).win, true, 'không có đối thủ thì luôn dẫn đầu');
assert.equal(C.cumFlag([], team, 2).of, 1);

// 2. Khớp với engine thật: lũy kế = tổng cờ-vụ không nhất thiết trùng.
let st = E.newGame(D, 'packer', 3); const rv = E.rivalsRun(D, 'packer', 3);
for (let i = 0; i < 6; i++) st = E.playSeason(D, st, C.freshDec(D, 'packer'));
const cf6 = C.cumFlag(rv, st.history, 6);
const sumTeam = st.history.reduce((x, r) => x + r.profit, 0), sumBest = Math.max(...rv.map(r => r.state.history.reduce((x, h) => x + h.profit, 0)));
assert.ok(Math.abs(cf6.team - sumTeam) < 1e-9 && Math.abs(cf6.best - sumBest) < 1e-9, 'tổng lãi khớp lịch sử engine');
assert.equal(cf6.win, sumTeam >= sumBest);
assert.deepEqual(Object.keys(E.summary(D, st).parts).length, 5, 'điểm tổng không đổi cấu trúc');

// 3. Cách chơi nêu cả hai loại cờ.
const vi = C.howToPlay(D, (a, b) => a);
assert.ok(vi[5].lines.some(l => l[0] === 'Cờ lũy kế' && l[1].includes('🏁')), 'Cách chơi: dòng cờ lũy kế');

// 4. Bản thẻ: hàng cờ lũy kế dưới hàng cờ vụ, dòng lũy kế ở màn kết quả vụ.
const html2d = read('lab/ho-chieu-sau-rieng.html');
assert.match(html2d, /const cum = APP\.flags\.map\(\(f, i\) => f \? DurianCore\.cumFlag\(RIVALS, APP\.game\.history, i \+ 1\) : null\);/);
assert.match(html2d, /<div class="flags cum" id="cumFlags">/);
assert.match(html2d, /<p class="hint" id="cumLine"[^>]*>\$\{\(\(\) => \{ const cf = DurianCore\.cumFlag\(RIVALS, APP\.game\.history, n\);/);

// 5. Bản 3D: hội thoại kết quả vụ, chip HUD «Cờ · lũy kế», bảng tổng kết, bảng dấu vết và CSV.
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const tpl = JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/template">') + 1]);
assert.match(tpl, /const cf = window\.DurianCore\.cumFlag\(s\.rivals \|\| \[\], \(s\.st && s\.st\.history\) \|\| \[\], r\.n\); out\.text \+= /);
assert.match(tpl, /\[t\.flagsK, flagsStat\]\]\.map/);
assert.match(tpl, /flagsK: 'Cờ · lũy kế'/);
assert.match(tpl, /Lãi lũy kế hạng ' \+ cfS\.rank \+ '\/' \+ cfS\.of/);
assert.match(tpl, /cum: window\.DurianCore\.cumFlag\(s\.rivals \|\| \[\], h, r\.n\)\.win \? '🏁' : ''/);
assert.match(tpl, /\{\{ r\.flag \}\}\{\{ r\.cum \}\}/);
assert.match(tpl, /'flag_win', 'cum_flag_win'\]/);
console.log('durian-cum-flag: ok');
