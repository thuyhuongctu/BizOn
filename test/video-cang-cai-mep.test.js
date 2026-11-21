// Video «Đường ngắn nhất đi qua Singapore» về Cảng Cái Mép (đặc tả 005, kịch bản chị duyệt 21/11/2026).
// Giai đoạn 1 (chưa có giọng đọc): kịch bản đủ 13 câu VI + EN và bảng nguồn, trang cảnh 13 cảnh vẽ tất định không lỗi,
// ảnh chụp màn hình thật của Bật Nghiệp 3D có trong kho, script dựng có chế độ xem trước --nhap.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), read = f => fs.readFileSync(R(f), 'utf8');

// 1. Kịch bản: 13 câu VI, 13 câu EN, nguồn có URL; câu mở và câu kết gọi nhau
const doc = read('docs/video/kich-ban-cang-cai-mep.md');
const rows = t => t.split('\n').map(l => l.split('|').map(x => x.trim())).filter(c => c.length > 3 && /^\d+$/.test(c[1]));
const vi = rows(doc.slice(doc.indexOf('## 2. Lời đọc'), doc.indexOf('## 3.'))).map(c => c[3]);
const en = rows(doc.slice(doc.indexOf('## 3. Lời tiếng Anh'), doc.indexOf('## 4.'))).map(c => c[2]);
assert.equal(vi.length, 13, 'kịch bản có 13 câu tiếng Việt');
assert.equal(en.length, 13, 'kịch bản có 13 câu tiếng Anh');
assert.match(vi[0], /Singapore/, 'câu mở nói đường vòng qua Singapore');
assert.match(vi[12], /đội bạn chọn\.$/, 'câu kết: đội bạn chọn');
assert.match(doc, /kịch bản đã duyệt/, 'ghi trạng thái đã duyệt');
const nguon = rows(doc.slice(doc.indexOf('## 1. Sự thật'), doc.indexOf('## 2.')));
assert.ok(nguon.length >= 5 && nguon.every(c => /^https:\/\//.test(c[4])), 'mỗi sự thật có URL nguồn');
assert.ok(doc.includes('en.sggp.org.vn') && doc.includes('sct.dongnai.gov.vn') && doc.includes('itf-oecd.org'), 'nguồn SGGP, Sở Công Thương, ITF');
assert.ok(!/vov\.vn\/en\/economy\/cai-mep-thi-vai-port-receives-giant-container-vessel-845409/.test(doc.slice(doc.indexOf('| 1 |'), doc.indexOf('**Không dùng'))), 'không dùng liên kết VOV sai bài làm nguồn');
// Số mô phỏng trong game không được đọc như số thật
for (const x of vi) assert.ok(!/1,30|0,06|95%|85%/.test(x), 'lời đọc không có số mô phỏng của game: ' + x);

// 2. Ảnh chụp màn hình thật (tệp mới, WebP)
const SRC = 'assets/video/src/cang-cai-mep/';
for (const f of ['man-tru-so', 'man-cang-3d', 'man-the-cang-tac', 'man-o-quyet-dinh-vu5']) {
  const b = fs.readFileSync(R(SRC + f + '.webp'));
  assert.ok(b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP', f + ': WebP');
}
const canh = read('scripts/video/cang-cai-mep/canh.html');
for (const m of canh.matchAll(/A\('([^']+)'\)/g)) assert.ok(fs.existsSync(R(SRC + m[1])), 'cảnh dùng ảnh có thật: ' + m[1]);

// 3. Script dựng
const dung = read('scripts/video/dung-cang-cai-mep.mjs');
assert.ok(dung.includes('mekong-compass.mp3') && dung.includes('loudnorm') && dung.includes('veKhung') && dung.includes('--nhap'), 'script dựng: nhạc nền, chuẩn độ to, vẽ từng khung, chế độ xem trước');
assert.ok(dung.includes("'assets/video/src/cang-cai-mep'") && dung.includes('kich-ban-cang-cai-mep.md'), 'script đọc giọng và lời từ đúng chỗ');

// 4. Trang cảnh chạy được, 13 cảnh, cảnh nào cũng hiện khi tới lượt, cắt đen ở cuối
(async () => {
  const b = await chromium.launch();
  try {
    for (const lang of ['vi', 'en']) {
      const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto(BASE + '/scripts/video/cang-cai-mep/canh.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
      assert.equal(await p.evaluate(() => window.SO_CANH), 13, lang + ': 13 cảnh');
      const vis = await p.evaluate(() => { const out = []; for (let i = 0; i < 13; i++) { window.veKhung(i * 5 + 2.5); out.push([...document.querySelectorAll('.canh')].findIndex(c => +c.style.opacity === 1)); } return out; });
      assert.deepEqual(vis, [...Array(13).keys()], lang + ': mỗi cảnh hiện đúng lượt');
      assert.equal(await p.evaluate(() => { window.veKhung(64.9); return getComputedStyle(document.getElementById('den')).opacity; }), '1', lang + ': cắt đen ở chữ cuối');
      const txt = await p.evaluate(() => { window.veKhung(2.5); return document.body.innerText; });
      assert.ok(lang === 'en' ? /Europe/.test(txt) && !/Châu Âu/.test(txt) : /Châu Âu/.test(txt), lang + ': chữ trên hình đúng ngôn ngữ');
      assert.deepEqual(errs, [], lang + ': không lỗi JS');
    }
    console.log('video-cang-cai-mep: ok');
  } catch (e) { console.error(e); process.exitCode = 1; }
  await b.close();
})();
