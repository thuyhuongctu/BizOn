// js/bp-core.js – một công thức điểm và một bộ tham số đối thủ cho cả bản thẻ lẫn bản 3D của Hộ Chiếu Thương Hiệu.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const C = require(path.join(ROOT, 'js', 'bp-core.js'));
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// 1. Trọng số công khai và mốc lợi nhuận
assert.deepEqual(C.WEIGHTS, { p: 0.3, r: 0.2, c: 0.2, a: 0.15, s: 0.15 });
assert.equal(Object.values(C.WEIGHTS).reduce((x, y) => x + y, 0).toFixed(2), '1.00');
assert.equal(C.PROFIT_FULL, 6);
// 2. scoreOf: 5 chiều trong 0–100, hệ số bề rộng và thua sớm
const S = { profit: 3, rep: 60, capab: 50, resil: 50, adapt: 2, susts: 1, entered: [1, null, 0, null, null, null, null] };
const sc = C.scoreOf(S, null);
assert.equal(sc.p, 50); assert.equal(sc.r, 60); assert.equal(sc.c, 50); assert.equal(sc.a, 54); assert.equal(sc.s, 60);
assert.equal(sc.breadth, 0.86, '2 thị trường → 0,7 + 0,16'); assert.equal(sc.finish, 1);
assert.equal(sc.base, Math.round(0.3 * 50 + 0.2 * 60 + 0.2 * 50 + 0.15 * 54 + 0.15 * 60));
assert.equal(sc.total, Math.round((0.3 * 50 + 0.2 * 60 + 0.2 * 50 + 0.15 * 54 + 0.15 * 60) * 0.86));
assert.equal(C.scoreOf(Object.assign({}, S, { entered: [1, 1, 1, 1, 1, 1, 1] }), null).breadth, 1.1, 'trần 1,1');
assert.equal(C.scoreOf(Object.assign({}, S, { entered: [] }), null).breadth, 0.7, 'không vào thị trường nào → 0,7');
assert.equal(C.scoreOf(S, 'cash').finish, 0.6, 'thua sớm ×0,6');
assert.equal(C.scoreOf(S, 'cash').total, Math.round(sc.base * 0.86 * 0.6) || C.scoreOf(S, 'cash').total);
assert.equal(C.scoreOf({ profit: -9, rep: 200, capab: -5, resil: 0, adapt: 0, susts: 0, entered: [] }, null).p, 0, 'kẹp 0');
assert.equal(C.scoreOf({ profit: 99, rep: 200, capab: -5, resil: 0, adapt: 0, susts: 9, entered: [] }, null).s, 100, 'kẹp 100');
assert.equal(C.scoreOf({ profit: 0, rep: 0, capab: 0, resil: 0, adapt: 0, susts: 3, entered: [] }, null).s, 100, '3 lần hồ sơ xanh → 100');
// 3. Tham số đối thủ: một chỗ duy nhất, có thể ghi đè để cân bằng
for (const k of ['attrBase', 'ramp', 'margin', 'enterBase', 'enterStep']) assert.equal(typeof C.RIVAL[k], 'number', 'RIVAL.' + k);
assert.ok(Math.abs(C.rivalEnterProb(3) - (C.RIVAL.enterBase + 3 * C.RIVAL.enterStep)) < 1e-12);
assert.ok(C.rivalEnterProb(5) < 1, 'xác suất mở thị trường quý 6 vẫn < 1');
// 4. Hai trang nạp lõi và không còn công thức/hằng số riêng
for (const f of ['brand-passport.html', 'Ho Chieu Thuong Hieu 3D.html']) {
  const h = read(f);
  assert.match(h, /<script src="js\/bp-core\.js"><\/script>/, f + ' nạp js/bp-core.js');
  assert.match(h, /function scores\(\) \{ return window\.BPCore\.scoreOf\(S, endReason\); \}/, f + ' dùng scoreOf chung');
  assert.ok(!/RIVAL_ATTR_BASE|RIVAL_RAMP|RIVAL_MARGIN|0\.22 \+ S\.q \* 0\.05/.test(h), f + ' không còn hằng số đối thủ riêng');
  assert.match(h, /window\.BPCore\.RIVAL\.attrBase \* H\[m\]\.fit/, f + ' sức hút đối thủ đọc từ lõi');
  assert.match(h, /rnd\(\) < window\.BPCore\.rivalEnterProb\(S\.q\)/, f + ' xác suất mở thị trường đọc từ lõi');
  assert.ok(h.includes('bề rộng thị trường = 0,7 + 0,08'), f + ' luật chơi công khai hệ số bề rộng');
}
console.log('bp-core: ok');
