// Rà soát 03/11/2026 – việc nhỏ: (1) 5 trang thiết kế nội bộ hết lỗi html-validate (lang, title, chỉ thị cho cú pháp x-dc);
// (2) workflow Android bản phát hành không chèn thẳng ${{ inputs.* }} vào shell; (3) workflow nào cũng khai permissions.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

for (const f of ['design/dashboard-giang-vien.html', 'design/pitch-deck.html', 'design/poster.html', 'design/ra-soat-ux.html']) {
  const s = read(f);
  assert.match(s, /<html lang="vi">/, f); assert.match(s, /<title>[^<]+<\/title>/, f); assert.match(s, /html-validate-disable [^:]+: cú pháp mẫu của bộ khung x-dc/, f);
}
assert.ok(read('play-store/feature-graphic.html').startsWith('<!DOCTYPE html>'));

const aab = read('.github/workflows/android-production-aab.yml');
const run = aab.slice(aab.indexOf('Validate release inputs'), aab.indexOf('- name:', aab.indexOf('Validate release inputs') + 10));
assert.ok(!/run: \|[\s\S]*\$\{\{ inputs\./.test(run), 'bước kiểm tra không chèn inputs vào shell');
assert.match(run, /IN_VERSION_CODE: \$\{\{ inputs\.version_code \}\}/);

const dir = path.join(ROOT, '.github/workflows');
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.yml'))) {
  const s = fs.readFileSync(path.join(dir, f), 'utf8');
  assert.ok(/^permissions:/m.test(s) || /^\s{4}permissions:/m.test(s), f + ': thiếu permissions');
}
console.log('ra-soat-viec-nho: ok');
