// 22/11/2026: chị gửi 33 sa bàn đất sét (tệp zip từ Drive), em chọn 3 sa bàn có chữ trên biển đúng chính tả, không có bản đồ
// thiếu Hoàng Sa – Trường Sa hay logo hãng thật: cảng Cái Mép – Thị Vải, kho lạnh nông sản, cửa khẩu quốc tế.
// - Ba ảnh vào chuỗi cung ứng lạnh (chain2) của Hộ Chiếu Sầu Riêng, đúng chặng: đường biển, kho lạnh, cửa khẩu; bản 3D được đóng gói lại.
// - Sa bàn cảng làm ảnh bìa mới cho video Cảng Cái Mép ở trang Hướng dẫn (tệp mới -v2, ảnh bìa cũ giữ nguyên).
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const { spawnSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), read = f => fs.readFileSync(R(f), 'utf8');
const webp = f => { const b = fs.readFileSync(R(f)); return b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP'; };
const D = require(R('lab/ho-chieu-sau-rieng-data.js'));
assert.ok(D && D.chain2, 'nạp được dữ liệu Hộ Chiếu Sầu Riêng');
const st = id => D.chain2.stages.find(s => s.id === id);
for (const [id, f] of [['rail-sea', 'cang-cai-mep-thi-vai'], ['cold-pack', 'kho-lanh-nong-san'], ['border', 'cua-khau-quoc-te']]) {
  const img = `hc/sa-ban/${f}.webp`, it = st(id).items.find(x => x.img === img);
  assert.ok(it, `chặng ${id} có sa bàn ${f}`);
  assert.ok(webp('assets/' + img), img + ': WebP có thật');
  assert.ok(it.vi && it.en && /Sa bàn/.test(it.vi) && /diorama/.test(it.en), img + ': chú thích VI/EN');
}
assert.ok(webp('assets/video/cang-cai-mep-poster-v2.webp') && fs.existsSync(R('assets/video/cang-cai-mep-poster-v2.jpg')), 'ảnh bìa v2');
assert.ok(fs.existsSync(R('assets/video/cang-cai-mep-vi-poster.webp')) && fs.existsSync(R('assets/video/cang-cai-mep-en-poster.webp')), 'ảnh bìa cũ giữ nguyên, không ghi đè');
assert.equal((read('huong-dan.html').match(/portPoster:'assets\/video\/cang-cai-mep-poster-v2\.webp'/g) || []).length, 2, 'trang Hướng dẫn dùng ảnh bìa sa bàn cho cả VI và EN');
assert.ok(read('THIRD-PARTY-NOTICES.md').includes('`assets/hc/sa-ban/*.webp`'), 'ghi nguồn gốc ở mục 7');
const chk = spawnSync(process.execPath, [R('scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs'), '--check'], { cwd: ROOT, encoding: 'utf8' });
assert.equal(chk.status, 0, 'bản 3D đã đóng gói lại cùng dữ liệu mới: ' + chk.stdout + chk.stderr);
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 953, 'sw.js ≥ v953');
console.log('sa-ban-3d: ok');
