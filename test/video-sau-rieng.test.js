// Video «Một trái sầu riêng, cả vùng cùng sầu» (5/11/2026): bản VI và EN 1920×1080 + 720p, ảnh bìa, phụ đề VI/EN theo mốc câu,
// giọng đọc nguồn 14 câu mỗi thứ tiếng, script dựng tất định lưu trong kho.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), size = f => fs.statSync(R(f)).size;

for (const l of ['vi', 'en']) {
  const n = `sau-rieng-ma-so-${l}`;
  for (const f of [`${n}.mp4`, `${n}-720p.mp4`]) {
    const p = `assets/video/${f}`; assert.ok(fs.existsSync(R(p)), 'thiếu ' + p);
    const head = fs.readFileSync(R(p)).subarray(0, 64 * 1024).toString('latin1');
    assert.ok(head.includes('moov') && head.includes('avc1') && head.includes('mp4a'), p + ': H.264 + AAC, faststart');
  }
  assert.ok(size(`assets/video/${n}-720p.mp4`) < size(`assets/video/${n}.mp4`) * 0.6, n + ': bản 720p phải nhẹ hơn nhiều');
  assert.ok(size(`assets/video/${n}.mp4`) < 25e6, n + ': bản 1080p quá nặng');
  for (const p of [`${n}-poster`, `${n}-v2-poster`]) assert.ok(size(`assets/video/${p}.webp`) < size(`assets/video/${p}.jpg`), p + ': poster WebP nhỏ hơn JPG');
  for (const s of ['vi', 'en']) {
    const v = fs.readFileSync(R(`assets/video/subs/${n}.${s}.vtt`), 'utf8');
    assert.ok(v.startsWith('WEBVTT'), n + '.' + s + ': WebVTT');
    assert.equal((v.match(/-->/g) || []).length, 14, n + '.' + s + ': đủ 14 câu');
  }
  const src = fs.readdirSync(R(`assets/video/src/sau-rieng-ma-so/${l}`)).filter(f => /^\d\d\.mp3$/.test(f));
  assert.equal(src.length, 14, 'giọng nguồn ' + l + ' đủ 14 câu');
}
assert.ok(fs.readFileSync(R('assets/video/subs/sau-rieng-ma-so-vi.vi.vtt'), 'utf8').includes('Họ chỉ đọc một dòng chữ: Việt Nam.'));
assert.ok(fs.readFileSync(R('assets/video/subs/sau-rieng-ma-so-en.en.vtt'), 'utf8').includes('They only read one line: Viet Nam.'));
const dung = fs.readFileSync(R('scripts/video/dung-sau-rieng.mjs'), 'utf8');
assert.ok(dung.includes('mekong-compass.mp3') && dung.includes('loudnorm') && dung.includes('veKhung'));
assert.ok(fs.readFileSync(R('THIRD-PARTY-NOTICES.md'), 'utf8').includes('sau-rieng-ma-so-*.mp4'), 'ghi nguồn gốc ở THIRD-PARTY-NOTICES mục 7');
assert.ok(+(fs.readFileSync(R('sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 774);
console.log('video-sau-rieng: ok');
