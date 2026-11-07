/* CI gọn (PR 4 của kế hoạch docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md, 06/11/2026): workflow không có pull_request mà chỉ on.push thì nhánh phải gồm main
 * (không còn workflow chỉ gắn với nhánh tính năng cũ); hai workflow bỏ hoang đã xóa; tests.yml vẫn chạy npm test cho mọi PR. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const DIR = path.join(__dirname, '..', '.github', 'workflows');
for (const f of ['core-state-seed.yml', 'save-resume-v2.yml']) assert.ok(!fs.existsSync(path.join(DIR, f)), f + ' phải đã bỏ');
for (const f of fs.readdirSync(DIR).filter(f => /\.ya?ml$/.test(f))) {
  const s = fs.readFileSync(path.join(DIR, f), 'utf8');
  const m = /^on:\s*\n([\s\S]*?)(?=^\S)/m.exec(s); if (!m) continue;
  const on = m[1];
  const push = /^\s{2}push:\s*\n((?:\s{4,}.*\n?)*)/m.exec(on);
  if (!push) continue;
  const br = /branches:\s*(\[[^\]]*\]|\n(?:\s+-\s+.*\n?)+)/.exec(push[1]);
  if (!br) continue;   // push mọi nhánh
  if (/^\s{2}pull_request:/m.test(on)) continue;   // có pull_request thì vẫn chạy cho mọi PR, nhánh push chỉ là báo sớm
  assert.ok(/\bmain\b/.test(br[1]), f + ': on.push.branches phải gồm main, đang là ' + br[1].trim().replace(/\s+/g, ' '));
}
const t = fs.readFileSync(path.join(DIR, 'tests.yml'), 'utf8');
assert.ok(/pull_request:/.test(t) && /run: npm test/.test(t), 'tests.yml chạy npm test cho mọi PR');
assert.ok(/CACHE = 'bizon-v(\d+)'/.test(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8')), 'sw.js có CACHE');
console.log('ci-gon: ok');
