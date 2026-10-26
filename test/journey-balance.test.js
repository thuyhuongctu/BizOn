'use strict';
// Quét cân bằng Bậc 3 · Sầu Riêng: cùng hạt giống, cùng quyết định, có và không có hành trang CỰC ĐẠI
// (vốn ×1,15, uy tín +5, chống chịu +3, ứng phó +5, hợp đồng liên kết 5 %) → chênh điểm cuối ≤ 8/100
// (docs/architecture/HANH-TRINH-3-BAC.md mục 9, 11). Hành trang không được quyết định thắng thua bậc sau.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const J = require('../js/core/journey.js');

const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const ctx = vm.createContext({ console });
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-engine.js'), ctx);
const D = ctx.DurianData, E = ctx.DurianEngine;

const MAX_CARRY = { applied: { variant: 'durian', cashMul: 1.15, rep: 5, resil: 3, adapt: 5, linkedBonus: 0.05, creditLimitAdj: 0 } };
// Đối chứng: tài sản kiểm nghiệm là mở khóa kênh – không được là hành trang (quét 26/10: lệch tới +42 điểm).
const TEST_UNLOCK = { applied: { variant: 'durian', testAsset: 1 } };
const PRIORITIES = ['pack', 'test', 'trace', 'area', 'freezer', 'finance'];
const policy = (role, n) => ({ priority: PRIORITIES[(n + (role === 'htx' ? 3 : 0)) % PRIORITIES.length], linked: 0.5, induce: false,
  alloc: role === 'frozen' ? { FROZEN: 50, DOM: 30, CN: 20 } : { DOM: 40, CN: 35, BORDER: 25 }, intel: [], option: n % 2 });

function play(role, seed, carry) {
  let s = E.newGame(D, role, seed);
  if (carry) { const a = Object.assign({}, carry.applied, { cash: Math.round(s.cash * carry.applied.cashMul * 100) / 100 }); s = J.applyToDurian(s, { applied: a }); }
  for (let n = 1; n <= D.seasons.length; n++) s = E.playSeason(D, s, policy(role, n));
  return E.summary(D, s);
}

let worst = 0; const rows = [];
for (const role of Object.keys(D.roles)) for (let seed = 1; seed <= 6; seed++) {
  const a = play(role, seed, null), b = play(role, seed, MAX_CARRY);
  const diff = b.total - a.total; worst = Math.max(worst, Math.abs(diff));
  rows.push(`${role}#${seed}: ${a.total.toFixed(1)} → ${b.total.toFixed(1)} (${diff >= 0 ? '+' : ''}${diff.toFixed(1)})`);
}
assert.ok(worst <= 8, `chênh điểm cuối lớn nhất ${worst.toFixed(2)} > 8/100:\n` + rows.join('\n'));
if (process.env.JOURNEY_SWEEP_VERBOSE) console.log(rows.join('\n'));
// Đối chứng: nếu ai đó thêm lại tài sản kiểm nghiệm vào hành trang, quét này phải đỏ.
{ let w = 0; for (let seed = 1; seed <= 8; seed++) { let s = E.newGame(D, 'packer', seed); s.assets.test = 1; for (let n = 1; n <= D.seasons.length; n++) s = E.playSeason(D, s, policy('packer', n)); w = Math.max(w, Math.abs(E.summary(D, s).total - play('packer', seed, null).total)); }
  assert.ok(w > 8, 'đối chứng: một bậc kiểm nghiệm phải lệch > 8 điểm ở packer (nếu không, engine đã đổi – xem lại trần)'); assert.ok(!('testAsset' in J.journeyCarry(J.recordTier2(J.recordTier1(J.createPassport({}), { total: 4, result: { eff: 70, rank: 2 }, history: [], knownPairs: {} }), { balance: 900, history: [], brand: 1.5, quickRatio: 2, loan: 0, rdCumulative: 240 }), 't3').applied), 'journeyCarry không trả testAsset'); void TEST_UNLOCK; }
// Tất định: chạy lại cho cùng kết quả
assert.deepEqual(play('packer', 3, MAX_CARRY), play('packer', 3, MAX_CARRY));
console.log('journey-balance: OK · chênh lớn nhất ' + worst.toFixed(2) + '/100 trên ' + rows.length + ' ván');
