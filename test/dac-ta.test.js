// Lệnh /dac-ta (09/11/2026): lối vào tiếng Việt cho Spec Kit. Chạy liền đặc tả → làm rõ (≤ 5 câu hỏi) → kế hoạch →
// chia PR → đối chiếu rồi dừng chờ chị duyệt; gọi lại các lệnh speckit-* đã cài, không chép mẫu; có ghi nguồn MIT.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const s = read('.claude/skills/dac-ta/SKILL.md');
const fm = s.match(/^---\n([\s\S]*?)\n---\n/);
assert.ok(fm, 'thiếu frontmatter');
assert.match(fm[1], /^name: dac-ta$/m);
assert.match(fm[1], /^description: "[^"]{80,}"$/m);
assert.match(fm[1], /^user-invocable: true$/m);
assert.ok(s.includes('xưng «em», gọi chị'), 'phải dặn trả lời tiếng Việt, xưng em');
assert.ok(s.includes('github/spec-kit') && s.includes('MIT'), 'thiếu dòng ghi nguồn');
assert.ok(!/claude-(opus|sonnet|haiku|fable)/i.test(s), 'không ghi mã mô hình');

// Đủ năm bước theo đúng thứ tự, mỗi bước trỏ tới lệnh speckit-* có thật trong kho
const steps = ['speckit-specify', 'speckit-clarify', 'speckit-plan', 'speckit-tasks', 'speckit-analyze'];
let last = -1;
for (const k of steps) {
  assert.ok(fs.existsSync(path.join(ROOT, `.claude/skills/${k}/SKILL.md`)), 'không có lệnh ' + k);
  const i = s.indexOf(`.claude/skills/${k}/SKILL.md`);
  assert.ok(i > last, `bước ${k} thiếu hoặc sai thứ tự`);
  last = i;
}
for (const m of s.matchAll(/`\/(speckit-[a-z-]+)`/g)) assert.ok(fs.existsSync(path.join(ROOT, `.claude/skills/${m[1]}/SKILL.md`)), 'trỏ tới lệnh không có: ' + m[1]);

// Quy ước riêng của BizOn
assert.match(s, /tối đa \*\*5\*\* câu hỏi|tối đa 5 câu hỏi/i, 'giới hạn 5 câu hỏi');
assert.ok(s.includes('## Kế hoạch PR'), 'tasks.md phải có mục Kế hoạch PR');
assert.ok(s.includes('Không viết mã trong lệnh này'), 'phải dừng trước khi viết mã');
assert.ok(s.includes('Chỉ gộp khi chị nói «Gộp»'), 'quy tắc gộp');
assert.ok(s.includes('Kiểm theo hiến chương') && s.includes('constitution.md'), 'phải kiểm theo hiến chương');
assert.ok(s.includes('Cho … / Khi … / Thì …'), 'kịch bản nghiệm thu Cho/Khi/Thì');

// Ghi nhận ở CLAUDE.md và THIRD-PARTY-NOTICES.md; đặc tả mẫu 001 vẫn theo đúng cấu trúc lệnh mô tả
assert.ok(read('CLAUDE.md').includes('`/dac-ta'), 'CLAUDE.md chưa nhắc /dac-ta');
assert.ok(read('THIRD-PARTY-NOTICES.md').includes('`dac-ta`'), 'THIRD-PARTY-NOTICES chưa ghi dac-ta');
assert.ok(fs.existsSync(path.join(ROOT, 'specs/001-giai-phap-cta/spec.md')), 'mất đặc tả mẫu 001');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 821);
console.log('dac-ta: ok');
