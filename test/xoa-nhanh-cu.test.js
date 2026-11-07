'use strict';
// Workflow dọn nhánh cũ (.github/workflows/xoa-nhanh-cu.yml): chỉ chạy tay trên main, phải gõ XOA,
// chỉ xóa khi đầu nhánh trùng sha trong danh sách; danh sách không chứa main hay nhánh chính của kho khác.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const rd = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const wf = rd('.github/workflows/xoa-nhanh-cu.yml');
assert.match(wf, /^on:\n  workflow_dispatch:/m, 'chỉ chạy tay');
assert.ok(!/\n  (push|pull_request|schedule):/.test(wf), 'không tự chạy');
assert.ok(wf.includes("if: github.ref == 'refs/heads/main'"), 'chỉ chạy trên main');
assert.ok(wf.includes('[ "$CONFIRM" = XOA ]'), 'phải gõ XOA mới xóa');
assert.ok(wf.includes('[ "$hien" != "$sha" ]'), 'so sha trước khi xóa');
const dong = rd('.github/xoa-nhanh/danh-sach.txt').split('\n').filter(l => l && !l.startsWith('#'));
assert.ok(dong.length > 0);
const ten = new Set();
for (const l of dong) {
  const m = l.match(/^([0-9a-f]{40}) (\S+)$/); assert.ok(m, 'dòng sai dạng: ' + l);
  assert.notEqual(m[2], 'main'); assert.ok(!ten.has(m[2]), 'trùng ' + m[2]); ten.add(m[2]);
}
console.log('xoa-nhanh-cu: OK (' + dong.length + ' nhánh)');
