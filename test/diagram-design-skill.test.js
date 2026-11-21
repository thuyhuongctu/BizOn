// Skill diagram-design (.claude/skills/diagram-design/, 19/11/2026): chép từ cathrynlavery/diagram-design (MIT).
// Kiểm: đủ tệp, có giấy phép và ghi nguồn; script không gọi mạng hay shell; NGUON.md có quy tắc BizOn
// (phông tự lưu trữ, một màu nhấn, song ngữ); self_check.py --offline bắt được khuôn còn nạp Google Fonts.
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict'), { spawnSync } = require('node:child_process');
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8'), T = '.claude/skills/diagram-design/';
for (const f of ['SKILL.md', 'LICENSE', 'NGUON.md', 'THIRD_PARTY_LICENSES.md', 'references/style-guide.md', 'references/output-spec.md',
  'scripts/self_check.py', 'scripts/export_svg.py', 'assets/template.html', 'assets/template-dark.html', 'assets/icons.html'])
  assert.ok(fs.existsSync(R(T + f)), 'thiếu ' + f);
assert.match(read(T + 'SKILL.md'), /^---\nname: diagram-design\n/);
assert.match(read(T + 'SKILL.md'), /> \*\*BizOn:\*\*.*NGUON\.md/, 'SKILL.md trỏ tới quy tắc BizOn');
assert.match(read(T + 'LICENSE'), /MIT License/);
const nguon = read(T + 'NGUON.md');
assert.match(nguon, /cathrynlavery\/diagram-design/);
assert.match(nguon, /d74d8c2d0c78a9e1efd43137f6a9a51182a8b5f0/, 'NGUON.md ghi commit gốc');
assert.match(nguon, /bizon-clay-fonts\.css/, 'quy tắc phông tự lưu trữ');
assert.match(nguon, /một màu nhấn/i, 'quy tắc một màu nhấn');
assert.match(nguon, /data-en/, 'quy tắc song ngữ');
assert.match(nguon, /html-validate@8\.24\.1/, 'quy tắc html-validate');
assert.match(read('THIRD-PARTY-NOTICES.md'), /cathrynlavery\/diagram-design/);
// Không lấy tệp ví dụ nặng
assert.equal(fs.readdirSync(R(T + 'assets')).filter(f => f.startsWith('example-')).length, 0, 'không chép assets/example-*.html');
// Script chỉ đọc ghi tệp
const py = fs.readdirSync(R(T + 'scripts')).filter(f => f.endsWith('.py'));
assert.ok(py.length >= 8, 'đủ script (' + py.length + ')');
for (const f of py) assert.doesNotMatch(read(T + 'scripts/' + f), /import (urllib\.request|requests|socket|http\.client)|from urllib\.request|shell=True|os\.system\(|import subprocess/, f + ': không gọi mạng hay shell');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 905, 'sw.js ≥ bizon-v905');
// self_check.py: khuôn gốc đạt kiểm thường; chế độ --offline bắt được Google Fonts; bản bỏ link phông thì đạt --offline
const pv = spawnSync('python3', ['-c', 'import sys;print(sys.version_info>=(3,10))'], { encoding: 'utf8' });
if (pv.error || (pv.stdout || '').trim() !== 'True') console.log('  (không có Python ≥ 3.10: bỏ qua phần chạy self_check)');
else {
  const chk = (...a) => spawnSync('python3', [R(T + 'scripts/self_check.py'), ...a], { encoding: 'utf8', timeout: 60000 });
  assert.match(chk(R(T + 'assets/template.html')).stdout, /^OK /m, 'khuôn gốc đạt self_check');
  assert.match(chk('--offline', R(T + 'assets/template.html')).stdout, /offline: file loads Google Fonts/, '--offline bắt được Google Fonts');
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'so-do-')), 'so-do.html');
  fs.writeFileSync(tmp, read(T + 'assets/template.html').replace(/<link[^>]+fonts\.googleapis\.com[^>]*>\s*/g, '').replace(/<link[^>]+fonts\.gstatic\.com[^>]*>\s*/g, ''));
  const r = chk('--offline', tmp);
  assert.match(r.stdout, /^OK /m, 'bỏ link Google Fonts thì đạt --offline:\n' + r.stdout + r.stderr);
}
console.log('diagram-design-skill: ok');
