/* Bộ skill YouTube yt-* (24/11/2026): chép từ Jakeschincariol/youtube-agent-skill (MIT). Kiểm:
 * - đủ 11 thư mục, mỗi thư mục có SKILL.md với name khớp tên thư mục; LICENSE MIT và NGUON.md (kho, commit, thay đổi) có mặt;
 * - thay đổi duy nhất so với bản gốc: 6 skill đọc docs/youtube/giong-kenh.md trước ~/.claude/youtube/voice.md; tệp giọng kênh có thật
 *   và giữ các điều «không được nói» (không nói BizOn gây ra kết quả học tập, số trong game là chỉ số mô phỏng);
 * - công cụ Python chỉ dùng thư viện chuẩn, không gọi mạng hay tiến trình con; chạy được title.py và hookscore.py (nếu máy có python3);
 * - THIRD-PARTY-NOTICES.md ghi nguồn, giấy phép. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..'), SK = path.join(ROOT, '.claude/skills'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const NAMES = ['yt-audit', 'yt-chapters', 'yt-comment', 'yt-edit', 'yt-package', 'yt-plan', 'yt-retention', 'yt-script', 'yt-seo', 'yt-shorts', 'yt-viral'];
for (const n of NAMES) {
  const md = fs.readFileSync(path.join(SK, n, 'SKILL.md'), 'utf8');
  assert.match(md, new RegExp('^---\\nname: ' + n + '\\n'), n + ': SKILL.md có name đúng');
  assert.match(md, /Nothing here publishes\. This skill writes and you publish\./, n + ': giữ nguyên «không tự đăng»');
}
const lic = fs.readFileSync(path.join(SK, 'yt-script/LICENSE'), 'utf8');
assert.ok(/^MIT License/.test(lic) && lic.includes('Jake Schincariol'), 'LICENSE MIT của tác giả gốc');
const nguon = fs.readFileSync(path.join(SK, 'yt-script/NGUON.md'), 'utf8');
assert.ok(nguon.includes('github.com/Jakeschincariol/youtube-agent-skill') && /`[0-9a-f]{40}`/.test(nguon), 'NGUON.md ghi kho và commit');

// Thay đổi duy nhất: đọc hồ sơ giọng kênh trong kho
const patched = NAMES.filter(n => fs.readFileSync(path.join(SK, n, 'SKILL.md'), 'utf8').includes('Read `docs/youtube/giong-kenh.md` (BizOn channel voice, kept in the repo) first, then `~/.claude/youtube/voice.md`'));
assert.deepEqual(patched, ['yt-audit', 'yt-comment', 'yt-package', 'yt-plan', 'yt-script', 'yt-seo'], 'đúng 6 skill đọc docs/youtube/giong-kenh.md');
const voice = R('docs/youtube/giong-kenh.md');
assert.ok(/Không nói BizOn «gây ra» kết quả học tập/.test(voice), 'giọng kênh: không nói BizOn gây ra kết quả');
assert.ok(/Con số trong game là chỉ số mô phỏng/.test(voice), 'giọng kênh: số trong game là chỉ số mô phỏng');
assert.ok(/bizonland\.com/.test(voice) && /Không đăng lại video, hình, nhạc của kênh khác/.test(voice), 'giọng kênh: liên kết trang, không đăng lại của kênh khác');
for (const f of voice.match(/docs\/video\/[a-z0-9-]+\.md/g) || []) assert.ok(fs.existsSync(path.join(ROOT, f)), 'mẫu giọng có thật: ' + f);

// Python: thư viện chuẩn, không mạng
const py = NAMES.flatMap(n => fs.readdirSync(path.join(SK, n)).filter(f => f.endsWith('.py')).map(f => path.join(SK, n, f)));
assert.equal(py.length, 6, '6 công cụ Python');
for (const f of py) {
  const src = fs.readFileSync(f, 'utf8');
  assert.doesNotMatch(src, /\b(subprocess|urllib|requests|socket|http\.client|os\.system|eval\(|exec\()/, path.basename(f) + ': không gọi mạng hay tiến trình con');
}
const hasPy = spawnSync('python3', ['--version']).status === 0;
if (hasPy) {
  const t = spawnSync('python3', ['-I', 'title.py', '--title', 'Bến Phù Sa: 5 tuần khởi nghiệp trên chợ nổi', '--thumb', 'CÂY BẸO'], { cwd: path.join(SK, 'yt-package'), encoding: 'utf8' });
  assert.equal(t.status, 0, 'title.py chạy được: ' + t.stderr);
  assert.match(t.stdout, /chars\s+score \d+\/100/, 'title.py in độ dài và điểm');
  const h = spawnSync('python3', ['-I', 'hookscore.py', '--hook', 'Một container sầu riêng bị trả về chỉ vì một con số.'], { cwd: path.join(SK, 'yt-script'), encoding: 'utf8' });
  assert.equal(h.status, 0, 'hookscore.py chạy được: ' + h.stderr);
} else console.log('  (bỏ qua chạy thử Python: máy không có python3)');

// Bộ hồ sơ đăng 8 video (chị duyệt 24/11/2026): mọi tệp, phụ đề, ảnh bìa, đường dẫn có thật; tiêu đề ≤ 60 ký tự đúng số ghi
const kit = R('docs/youtube/ho-so-dang-8-video.md');
assert.equal((kit.match(/^## \d\. /gm) || []).length, 8, 'đủ 8 video');
for (const [, f] of kit.matchAll(/\*\*Tệp:\*\* `(assets\/video\/[^`]+)`/g)) assert.ok(fs.existsSync(path.join(ROOT, f)), 'tệp video có thật: ' + f);
for (const [, f] of kit.matchAll(/`subs\/([^`]+\.vtt)`/g)) assert.ok(fs.existsSync(path.join(ROOT, 'assets/video/subs', f)), 'phụ đề có thật: ' + f);
for (const [, n, t] of kit.matchAll(/\*\*Tiêu đề \((\d+) ký tự\):\*\* (.+)/g)) {
  const len = [...t.trim()].length;
  assert.equal(len, +n, 'số ký tự ghi đúng: ' + t); assert.ok(len <= 60, 'tiêu đề ≤ 60 ký tự: ' + t);
}
for (const [, u] of kit.matchAll(/https:\/\/bizonland\.com\/([^\s)]*)/g)) {
  const f = decodeURIComponent(u.replace(/[.,]$/, '')) || 'index.html';
  assert.ok(fs.existsSync(path.join(ROOT, f)), 'đường dẫn trỏ tới trang có thật: ' + f);
}
const jpgSize = b => { for (let i = 2; i < b.length;) { const m = b[i + 1], len = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + len; } };
const bia = [...kit.matchAll(/anh-bia-\d\d-[a-z0-9-]+\.jpg/g)].map(m => m[0]);
assert.ok(bia.every(f => f.endsWith('-v2.jpg')), 'hồ sơ dùng ảnh bìa bản -v2 (giãn dòng, dấu tiếng Việt không chạm nhau)');
assert.equal(new Set(bia).size, 4, '4 ảnh bìa cho 4 video ngang');
for (const f of new Set(bia)) assert.deepEqual(jpgSize(fs.readFileSync(path.join(ROOT, 'docs/youtube/anh-bia', f))), [1280, 720], f + ' 1280×720');

const tpn = R('THIRD-PARTY-NOTICES.md');
assert.ok(tpn.includes('**Jakeschincariol/youtube-agent-skill**') && tpn.includes('.claude/skills/yt-script/LICENSE'), 'THIRD-PARTY-NOTICES ghi nguồn và giấy phép');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 975, 'sw.js tăng phiên bản');
console.log('youtube-agent-skill: ok');
