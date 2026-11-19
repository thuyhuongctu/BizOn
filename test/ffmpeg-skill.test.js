// Skill ffmpeg-skill (.claude/skills/ffmpeg-skill/, 19/11/2026): chép nguyên từ kajisho5/ffmpeg-skill (MIT).
// Kiểm: đủ tệp, có giấy phép và ghi nguồn; mã không gọi mạng hay shell; nếu máy có ffmpeg ≥ 6.1 và Python ≥ 3.10 thì
// check.py chạy được trên một video của kho và báo đúng khổ 9:16.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { spawnSync } = require('node:child_process');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8'), T = '.claude/skills/ffmpeg-skill/';
for (const f of ['SKILL.md', 'LICENSE', 'NGUON.md', 'scripts/check.py', 'scripts/probe.py', 'scripts/_common/runner.py', 'references/workflow.md', 'templates/reels.json'])
  assert.ok(fs.existsSync(R(T + f)), 'thiếu ' + f);
assert.match(read(T + 'SKILL.md'), /^---\nname: ffmpeg-skill\n/);
assert.match(read(T + 'LICENSE'), /MIT License/);
assert.match(read(T + 'NGUON.md'), /kajisho5\/ffmpeg-skill/);
assert.match(read('THIRD-PARTY-NOTICES.md'), /kajisho5\/ffmpeg-skill/);
const py = [];
(function quet(d) { for (const e of fs.readdirSync(R(d), { withFileTypes: true })) e.isDirectory() ? quet(d + e.name + '/') : e.name.endsWith('.py') && py.push(d + e.name); })(T + 'scripts/');
assert.ok(py.length > 40, 'đủ script (' + py.length + ')');
for (const f of py) assert.doesNotMatch(read(f), /import (urllib|requests|socket)|shell=True|os\.system\(/, f + ': không gọi mạng hay shell');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 899, 'sw.js ≥ bizon-v899');
const v = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' }), pv = spawnSync('python3', ['-c', 'import sys;print(sys.version_info>=(3,10))'], { encoding: 'utf8' });
const m = /ffmpeg version n?(\d+)\.(\d+)/.exec(v.stdout || '');
if (v.error || !m || +m[1] * 100 + +m[2] < 601 || (pv.stdout || '').trim() !== 'True') console.log('  (không có ffmpeg ≥ 6.1 hoặc Python ≥ 3.10: bỏ qua phần chạy thử)');
else {
  const r = spawnSync('python3', [R(T + 'scripts/check.py'), R('assets/video/ben-phu-sa-cay-beo-ve-tay-vi-720p.mp4'), '--platform', 'reels'], { encoding: 'utf8', timeout: 300000 });
  assert.match(r.stdout, /PASS aspect\s+9:16/, 'check.py báo khổ 9:16:\n' + r.stdout + r.stderr);
  assert.match(r.stdout, /0 failed/, 'video Bến Phù Sa đạt chuẩn Reels');
}
console.log('ffmpeg-skill: ok');
