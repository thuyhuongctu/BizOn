// Các lệnh Claude Code phỏng theo Claude Code Game Studios (MIT): đủ frontmatter, tiếng Việt, ghi nguồn,
// và THIRD-PARTY-NOTICES.md mục 6 có dòng ghi công tương ứng.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// 16/11/2026: thêm 7 lệnh từ bản 1.3.0 (security-audit, localize, asset-audit, perf-profile, smoke-check, patch-notes, prototype).
const SKILLS = ['balance-check', 'playtest-report', 'design-review', 'ux-review',
  'security-audit', 'localize', 'asset-audit', 'perf-profile', 'smoke-check', 'patch-notes', 'prototype'];
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

// 25/11/2026: security-audit có phần phỏng theo Claude-BugHunter (nội dung CC BY 4.0) – phải ghi công ở tệp và ở mục 6.
{
  const sa = read('.claude/skills/security-audit/SKILL.md');
  for (const t of ['Claude-BugHunter', 'Sachin Sharma', 'CC BY 4.0', 'creativecommons.org/licenses/by/4.0', 'Đã thay đổi'])
    assert.ok(sa.includes(t), 'security-audit thiếu ghi công Claude-BugHunter: ' + t);
  for (const t of ['Claude-BugHunter', 'Sachin Sharma', 'CC BY 4.0']) assert.ok(sec6.includes(t), 'mục 6 thiếu ghi công Claude-BugHunter: ' + t);
  assert.match(sa, /Cổng xác minh 7 câu/);
  assert.match(sa, /nguồn → đích/);
}

// Lệnh trỏ nhau phải trỏ tới lệnh có thật trong .claude/skills/
for (const name of SKILLS) for (const m of read(`.claude/skills/${name}/SKILL.md`).matchAll(/`\/([a-z-]+)/g)) {
  assert.ok(fs.existsSync(path.join(ROOT, '.claude/skills', m[1], 'SKILL.md')), `${name} trỏ tới lệnh không có: /${m[1]}`);
}
console.log('lenh-xuong-game: ok');
