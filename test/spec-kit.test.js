'use strict';
// Spec Kit (github/spec-kit, MIT) cài cho Claude Code ngày 07/11/2026: đủ lệnh, đủ mẫu, script chạy được,
// hiến chương viết riêng cho BizOn (không còn chỗ trống của mẫu), CLAUDE.md giữ nguyên quy tắc của kho và có mục Spec Kit.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
for (const k of ['specify', 'clarify', 'plan', 'tasks', 'implement', 'analyze', 'checklist', 'constitution'])
  assert.match(read(`.claude/skills/speckit-${k}/SKILL.md`), new RegExp(`name: "speckit-${k}"`), 'thiếu lệnh speckit-' + k);
for (const t of ['spec', 'plan', 'tasks', 'checklist', 'constitution']) assert.ok(fs.existsSync(path.join(ROOT, `.specify/templates/${t}-template.md`)), 'thiếu mẫu ' + t);
const hc = read('.specify/memory/constitution.md');
assert.ok(!/\[[A-Z_0-9]+\]/.test(hc), 'hiến chương còn chỗ trống [PLACEHOLDER] của mẫu');
for (const y of ['Chỉ gộp khi chị nói «Gộp»', 'html-validate', 'Hồ sơ quyền tác giả', 'không chọn giúp']) assert.ok(hc.includes(y), 'hiến chương thiếu: ' + y);
const cm = read('CLAUDE.md');
assert.ok(cm.startsWith('# BizOn – hướng dẫn cho Claude Code') && cm.includes('## Spec Kit') && cm.includes('<!-- SPECKIT START -->'), 'CLAUDE.md phải giữ quy tắc của kho và có mục Spec Kit');
assert.ok(read('THIRD-PARTY-NOTICES.md').includes('github/spec-kit'), 'chưa ghi nguồn Spec Kit');
// Script tạo tính năng chạy được ở chế độ thử (không tạo tệp, không tạo nhánh)
const out = execFileSync('bash', ['.specify/scripts/bash/create-new-feature.sh', '--json', '--dry-run', '--short-name', 'thu-nghiem', 'Thử nghiệm'], { cwd: ROOT, encoding: 'utf8' });
const j = JSON.parse(out.trim().split('\n').pop());
assert.match(j.BRANCH_NAME || '', /^\d{3}-thu-nghiem$/, 'tên tính năng theo số thứ tự');
assert.ok(!fs.existsSync(path.join(ROOT, 'specs', j.BRANCH_NAME)), '--dry-run không được tạo thư mục');
console.log('spec-kit: ok (' + j.BRANCH_NAME + ')');
