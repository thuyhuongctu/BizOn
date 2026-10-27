// Nén trailer (27/10/2026): trang chủ dùng bản 720p (H.264 CRF 24 + AAC 112k, faststart), nhẹ hơn 45–70 %
// so với bản 1080p gốc (SSIM ≥ 0,988 so với bản gốc thu về 720p). Tệp gốc giữ nguyên trong kho.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), size = f => fs.statSync(R(f)).size;
const home = fs.readFileSync(R('index.html'), 'utf8');
assert.equal(home, fs.readFileSync(R('academia3d-v2.html'), 'utf8'));
for (const n of ['ben-phu-sa-trailer-v2', 'bizon-trailer-v3', 'bp-trailer-v2', 'gravity-lab-trailer', 'srp-trailer']) {
  const o = `assets/video/${n}.mp4`, s = `assets/video/${n}-720p.mp4`;
  assert.ok(fs.existsSync(R(o)) && fs.existsSync(R(s)), 'cả bản gốc và bản 720p: ' + n);
  assert.ok(size(s) < size(o) * 0.6 && size(s) > 2e6, 'bản 720p nhẹ hơn ít nhất 40 %: ' + n);
  const b = fs.readFileSync(R(s)).subarray(0, 64 * 1024).toString('latin1');
  assert.ok(b.includes('moov') && b.indexOf('moov') < (b.indexOf('mdat') < 0 ? Infinity : b.indexOf('mdat')) && b.includes('avc1') && b.includes('mp4a'), 'faststart, H.264 + AAC: ' + n);
  assert.ok(home.includes(`data-trailer="${s}"`) && !home.includes(`"${o}"`), 'trang chủ dùng bản 720p: ' + n);
}
assert.ok(+(fs.readFileSync(R('sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 698);
console.log('trailers-720p: ok');
