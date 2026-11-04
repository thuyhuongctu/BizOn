// Bốn lệnh Claude Code phỏng theo Claude Code Game Studios (MIT): đủ frontmatter, tiếng Việt, ghi nguồn,
// và THIRD-PARTY-NOTICES.md mục 6 có dòng ghi công tương ứng.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const SKILLS = ['balance-check', 'playtest-report', 'design-review', 'ux-review'];
for (const name of SKILLS) {
  const f = `.claude/skills/${name}/SKILL.md`;
  const s = read(f);
  const fm = s.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(fm, f + ': thiếu frontmatter');
  assert.match(fm[1], new RegExp('^name: ' + name + '$', 'm'), f + ': name');
  assert.match(fm[1], /^description: "[^"]{40,}"$/m, f + ': description');
  assert.match(fm[1], /^user-invocable: true$/m, f + ': user-invocable');
  assert.ok(s.includes('Claude Code Game Studios') && s.includes('Donchitos') && s.includes('MIT'), f + ': thiếu dòng ghi nguồn');
  assert.ok(s.includes('xưng «em», gọi chị'), f + ': phải dặn trả lời tiếng Việt, xưng em');
  assert.ok(!/claude-(opus|sonnet|haiku|fable)/i.test(s), f + ': không ghi mã mô hình');
}

const notes = read('THIRD-PARTY-NOTICES.md');
const sec6 = notes.slice(notes.indexOf('## 6 ·'), notes.indexOf('## 7 ·'));
assert.ok(sec6.includes('Claude Code Game Studios') && sec6.includes('Donchitos') && sec6.includes('MIT'), 'mục 6 thiếu ghi công');
for (const name of SKILLS) assert.ok(sec6.includes('`' + name + '`'), 'mục 6 thiếu ' + name);

// Lệnh trỏ nhau phải trỏ tới lệnh có thật
for (const name of SKILLS) for (const m of read(`.claude/skills/${name}/SKILL.md`).matchAll(/`\/([a-z-]+)/g)) {
  assert.ok(SKILLS.includes(m[1]), `${name} trỏ tới lệnh không có: /${m[1]}`);
}
console.log('lenh-xuong-game: ok');
