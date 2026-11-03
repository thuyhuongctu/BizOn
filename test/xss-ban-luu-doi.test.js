// XSS qua bản lưu chung của đội (rà soát 03/11/2026): mọi thành viên ghi được state_json của đội, nên
// js/backend.js lọc bản lưu tải về (bỏ < > trong chuỗi, chặn __proto__, giới hạn độ sâu/độ dài) và
// js/office-stations.js thoát ký tự tên đội/đối thủ ở Bảng xếp hạng và Thị trường trước khi vào innerHTML.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'js/backend.js'), 'utf8');

// Nạp backend.js trong hộp cát tối thiểu rồi gọi BizonBackend.cleanState
const store = {};
const win = { BIZON_BACKEND: { enabled: false }, addEventListener() {}, setTimeout, clearTimeout, console,
  localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} }, location: { search: '', href: 'http://x/' }, navigator: { onLine: true } };
win.window = win; win.document = { addEventListener() {}, readyState: 'complete' };
vm.createContext(win); vm.runInContext(src, win);
const clean = win.BizonBackend.cleanState;
assert.equal(typeof clean, 'function');
const evil = JSON.parse('{"profile":{"teamName":"<img src=x onerror=alert(1)>Đội A","classId":"X"},"competitors":[{"name":"<svg onload=1>B","share":30}],"__proto__":{"polluted":1},"round":3,"loan":0,"deep":' + '['.repeat(30) + ']'.repeat(30) + '}');
const out = clean(evil);
assert.equal(out.profile.teamName, 'img src=x onerror=alert(1)Đội A');
assert.equal(out.competitors[0].name, 'svg onload=1B');
assert.equal(out.round, 3); assert.equal(out.loan, 0);
assert.equal(({}).polluted, undefined); assert.equal(Object.prototype.hasOwnProperty.call(out, '__proto__'), false);
assert.ok(JSON.stringify(out).length < JSON.stringify(evil).length + 10);
assert.equal(clean('x'.repeat(9000)).length, 4000);
assert.match(src, /if \(row && row\.state_json\) row\.state_json = cleanState\(row\.state_json, 0\);/);

const st = fs.readFileSync(path.join(ROOT, 'js/office-stations.js'), 'latin1');
assert.equal((st.match(/\$\{esc\(t\.name\)\}/g) || []).length, 2, 'cả hai chỗ tên đội đều thoát ký tự');
assert.ok(!/<b>\$\{t\.name\}<\/b>/.test(st) && !/nowrap">\$\{t\.name\}<\/span>/.test(st));
assert.ok(+fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/)[1] >= 763);
console.log('xss-ban-luu-doi: ok');
