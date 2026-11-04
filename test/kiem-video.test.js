// Lệnh /video-ngan và công cụ kiểm video scripts/kiem-video.mjs (phỏng theo Claude Animated Shorts, MIT).
// Phần phân tích khung được kiểm trên khung tổng hợp (không cần ffmpeg); có ffmpeg thì chạy thêm trên một video thử.
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const skill = read('.claude/skills/video-ngan/SKILL.md');
const fm = skill.match(/^---\n([\s\S]*?)\n---\n/);
assert.ok(fm && /^name: video-ngan$/m.test(fm[1]) && /^description: "[^"]{40,}"$/m.test(fm[1]) && /^user-invocable: true$/m.test(fm[1]));
assert.ok(skill.includes('Claude Animated Shorts') && skill.includes('MIT') && skill.includes('xưng «em», gọi chị'));
assert.ok(skill.includes('scripts/kiem-video.mjs') && skill.includes('Bạn thấy đấy') && skill.includes('nguồn'));
const notes = read('THIRD-PARTY-NOTICES.md'), sec6 = notes.slice(notes.indexOf('## 6 ·'), notes.indexOf('## 7 ·'));
assert.ok(sec6.includes('Claude Animated Shorts') && sec6.includes('`scripts/kiem-video.mjs`') && sec6.includes('`video-ngan`'));
assert.ok(read('scripts/kiem-video.mjs').includes('Claude Animated Shorts'));

(async () => {
  const K = await import(path.join(ROOT, 'scripts/kiem-video.mjs'));
  assert.deepEqual(K.spans([1, 2, 3, 7, 9, 10]), [[1, 3], [7, 7], [9, 10]]);

  // 150 khung 30 fps: hình chạy đều; đen ngắn 40–42 (lỗi), khung hỏng 60 (một khung trắng lọt vào),
  // đen dài 90–109 (chuyển cảnh qua màn đen, không lỗi), đứng hình 112–131.
  const W = 16, H = 9, frame = (i) => { const f = new Uint8Array(W * H * 3); for (let p = 0; p < W * H; p++) f.fill(40 + ((p * 5 + i * 3) % 160), p * 3, p * 3 + 3); return f; };
  const frames = [];
  for (let i = 0; i < 150; i++) {
    if ((i >= 40 && i <= 42) || (i >= 90 && i <= 109)) frames.push(new Uint8Array(W * H * 3));
    else if (i === 60) frames.push(new Uint8Array(W * H * 3).fill(250));
    else frames.push(frame(i >= 112 && i <= 131 ? 112 : i));
  }
  const A = K.analyseFrames(frames, { fps: 30 });
  assert.deepEqual(A.black, [[40, 42]], 'đen ngắn giữa video là lỗi');
  assert.deepEqual(A.fades, [[90, 109]], 'đen dài là chuyển cảnh');
  assert.deepEqual(A.glitch, [60], 'khung hỏng một hình');
  assert.deepEqual(A.white, [], 'khung hỏng không bị báo trùng là chớp trắng');
  assert.ok(A.frozen.some(([a, b]) => a <= 112 && b >= 130), 'đứng hình 112–131');
  const B = K.analyseFrames(frames, { fps: 30, planned: new Set([40, 41, 42, 60]) });
  assert.deepEqual([B.black, B.glitch], [[], []], '--planned bỏ qua khung cố ý');

  const ff = spawnSync('ffmpeg', ['-version']);
  if (ff.status !== 0) { console.log('kiem-video: ok (không có ffmpeg, bỏ qua phần chạy thật)'); return; }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kiem-video-')), vid = path.join(dir, 't.mp4');
  const g = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=160x90:rate=30:d=3', '-f', 'lavfi', '-i', 'sine=f=440:d=3',
    '-vf', "drawbox=enable='between(n,40,42)':color=black:t=fill,drawbox=enable='eq(n,60)':color=red:t=fill", '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', vid]);
  if (g.status !== 0) { console.log('kiem-video: ok (ffmpeg không tạo được video thử, bỏ qua)'); return; }
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/kiem-video.mjs'), vid, '--json'], { encoding: 'utf8' });
  assert.equal(r.status, 1, r.stderr);
  const j = JSON.parse(r.stdout);
  assert.ok(j.errors.some(e => e.includes('Khung đen') && e.includes('40–42')), j.errors.join('\n'));
  assert.ok(j.errors.some(e => e.includes('Khung hỏng') && e.includes('khung 60')));
  assert.ok(j.warns.some(e => e.includes('LUFS')), 'tiếng sin −21 LUFS phải bị nhắc độ to');
  const ok = spawnSync(process.execPath, [path.join(ROOT, 'scripts/kiem-video.mjs'), vid, '--planned', '40-42,60', '--out', dir], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout);
  assert.ok(fs.readFileSync(path.join(dir, 'report.md'), 'utf8').includes('## Kết luận: ĐẠT, CÓ LƯU Ý'));
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('kiem-video: ok');
})().catch(e => { console.error(e); process.exit(1); });
