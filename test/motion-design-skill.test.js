// Skill motion-design (.claude/skills/motion-design/, 19/11/2026): chép từ LottieFiles/motion-design-skill (MIT).
// Kiểm: đủ tệp, có giấy phép và ghi nguồn; chỉ gồm Markdown (không script); SKILL.md trỏ tới quy tắc BizOn;
// NGUON.md có quy tắc BizOn (không Creator MCP, giảm chuyển động, transform/opacity, easing đất sét, tệp hồ sơ).
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8'), T = '.claude/skills/motion-design/';
for (const f of ['SKILL.md', 'LICENSE', 'NGUON.md', 'director/disney-principles.md', 'director/choreography.md', 'patterns/entrance-exit.md',
  'patterns/state-feedback.md', 'reference/timing-easing-tables.md', 'reference/quality-checklist.md'])
  assert.ok(fs.existsSync(R(T + f)), 'thiếu ' + f);
const skill = read(T + 'SKILL.md');
assert.match(skill, /^---\nname: motion-design\n/);
assert.match(skill, /> \*\*BizOn:\*\*.*NGUON\.md/, 'SKILL.md trỏ tới quy tắc BizOn');
assert.match(read(T + 'LICENSE'), /MIT License[\s\S]*LottieFiles/);
const walk = d => fs.readdirSync(R(d), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(d + e.name + '/') : [d + e.name]);
const files = walk(T);
assert.deepEqual(files.filter(f => !/\.md$|\/LICENSE$/.test(f)), [], 'chỉ có Markdown và LICENSE, không có script');
const nguon = read(T + 'NGUON.md');
assert.match(nguon, /LottieFiles\/motion-design-skill/);
assert.match(nguon, /d77a9fc8cb371cab1ba5420df5bfd232cd14c9bb/, 'ghi commit gốc');
assert.match(nguon, /Không dùng Creator MCP/, 'không dùng dịch vụ xuất tệp bên ngoài');
assert.match(nguon, /prefers-reduced-motion: reduce/, 'giảm chuyển động bắt buộc');
assert.match(nguon, /`transform` và `opacity`/, 'chỉ animate transform/opacity');
assert.match(nguon, /cubic-bezier\(\.34,1\.56,\.64,1\)/, 'easing đất sét');
assert.match(nguon, /js\/engine\.js/, 'nhắc tệp hồ sơ quyền tác giả');
assert.match(read('THIRD-PARTY-NOTICES.md'), /LottieFiles\/motion-design-skill/);
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 914, 'sw.js ≥ bizon-v914');
console.log('motion-design-skill: ok');
