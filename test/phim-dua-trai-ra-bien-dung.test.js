// Loạt phim «Đưa trái ra biển», tập 1 – dựng phim (đặc tả 008, PR 2, 23/11/2026).
// Hình kết xuất bằng HyperFrames (HTML → MP4, Apache-2.0, chạy trên máy, tắt gửi dữ liệu sử dụng).
// Test không kết xuất video (quá nặng cho CI); test kiểm:
//  - tệp ghép: đường dẫn có thật, bong bóng thoại khớp đúng từng chữ với kịch bản;
//  - trang cảnh canh.html: mỗi cảnh số liệu hiện đúng lượt, chữ đúng ngôn ngữ, không lỗi JS, không vẽ bản đồ toàn quốc;
//  - script dựng phim: --nhap, --chi-html, loudnorm, phụ đề .vtt, ghim phiên bản HyperFrames, tắt telemetry;
//  - bản dựng nháp (--nhap --chi-html) VI và EN: dài 4–6 phút, đủ đoạn theo kịch bản, đoạn nào hiện đúng lúc, cảnh NV thiếu có thẻ chờ.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f), read = f => fs.readFileSync(R(f), 'utf8');
const rows = (t, n) => t.split('\n').filter(l => l.startsWith('|')).map(l => l.split('|').slice(1, -1).map(x => x.trim()))
  .filter(c => c.length >= n && /^(\d+|C\d+)$/.test(c[0]));

// 1. Tệp ghép
const G = JSON.parse(read('scripts/video/dua-trai-ra-bien/tap-01.ghep.json'));
for (const k of ['kich_ban', 'phan_canh', 'nhac']) assert.ok(fs.existsSync(R(G[k])), 'tệp ghép: ' + k + ' có thật');
assert.match(G.giong, /^assets\/video\/src\/dua-trai-ra-bien\/tap-01\/\{lang\}\/\{so\}\.mp3$/, 'giọng theo câu, tách VI/EN');
const KB = rows(read(G.kich_ban), 8).map(c => ({ so: +c[0], vi: c[3], en: c[4], chu: c[5], canh: c[6] }));
const PC = new Map(rows(read(G.phan_canh), 8).map(c => [c[0], c[1]]));
for (const k of KB) {
  const bong = [...k.chu.matchAll(/💬 ([^:]+): «([^»]+)» · «([^»]+)»/g)].map(m => ({ ai: m[1].trim(), vi: m[2], en: m[3] }));
  const co = (G.chu[k.so] || []).filter(x => x.loai === 'bong');
  assert.deepEqual(co.map(x => [x.ai, x.vi, x.en]), bong.map(x => [x.ai, x.vi, x.en]), 'câu ' + k.so + ': bong bóng thoại khớp kịch bản');
  if (/▭ \d\d:\d\d:\d\d/.test(k.chu)) assert.ok((G.chu[k.so] || []).some(x => x.loai === 'dem' && k.chu.includes(x.tu)), 'câu ' + k.so + ': có đồng hồ đếm ngược');
}
for (const so of Object.keys(G.chu)) assert.ok(KB.some(k => k.so === +so), 'tệp ghép: câu ' + so + ' có trong kịch bản');

// 2. Trang cảnh và script dựng
const canh = read('scripts/video/dua-trai-ra-bien/canh.html');
const SL = [...new Set(KB.filter(k => PC.get(k.canh) === 'SL').map(k => k.canh))];
for (const c of SL) assert.ok(new RegExp(`\\b${c}\\(d\\)`).test(canh), 'canh.html có cảnh số liệu ' + c);
assert.ok(canh.includes('window.__timelines') && canh.includes('data-composition-id="main"'), 'canh.html là khuôn HyperFrames');
assert.ok(!/Math\.random|Date\.now|@keyframes/.test(canh.replace(/<!--[\s\S]*?-->/g, '')), 'canh.html tất định: không ngẫu nhiên, không giờ máy, không animation CSS');
if (/toàn quốc|ban-do-viet-nam/i.test(canh.replace(/<!--[\s\S]*?-->/g, ''))) assert.ok(/Hoàng Sa/.test(canh) && /Trường Sa/.test(canh), 'bản đồ toàn quốc phải có Hoàng Sa và Trường Sa');
for (const m of canh.matchAll(/assets\/[\w\-/]+\.(?:webp|png|jpg)/g)) assert.ok(fs.existsSync(R(m[0])), 'canh.html dùng ảnh có thật: ' + m[0]);
const dung = read('scripts/video/dung-phim.mjs');
assert.ok(dung.includes('--nhap') && dung.includes('--chi-html') && dung.includes('loudnorm') && /\.vtt/.test(dung), 'dung-phim.mjs: nháp, chỉ HTML, chuẩn độ to, phụ đề');
assert.ok(dung.includes("'hyperframes@0.9.86'") && dung.includes("HYPERFRAMES_NO_TELEMETRY: '1'"), 'ghim HyperFrames 0.9.86 và tắt telemetry');
assert.ok(!/cloud|share|publish|auth/.test(dung.split('\n').filter(l => /spawnSync\('npx'/.test(l)).join('')), 'không dùng đám mây hay chia sẻ của HeyGen');
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 980, 'sw.js ≥ v980');

// 3. Bản dựng nháp VI và EN (chỉ HTML)
const OUT = R('artifacts/phim-test');
for (const lang of ['vi', 'en']) {
  const r = spawnSync(process.execPath, [R('scripts/video/dung-phim.mjs'), '--tap', '01', '--lang', lang, '--nhap', '--chi-html', '--out', OUT, '--canh', R('artifacts/phim-test/khong-co')], { encoding: 'utf8' });
  assert.equal(r.status, 0, 'dung-phim --chi-html ' + lang + ': ' + r.stderr);
  const html = fs.readFileSync(path.join(OUT, `dua-trai-ra-bien-01-${lang}-nhap`, 'index.html'), 'utf8');
  assert.ok(!html.includes('../../../') && !/<script src=/.test(html), lang + ': bản dựng không trỏ ra ngoài thư mục, GSAP chép vào trang');
  for (const m of html.matchAll(/goc\/[\w\-/]+\.(?:webp|png|jpg|css)/g)) assert.ok(fs.existsSync(path.join(OUT, `dua-trai-ra-bien-01-${lang}-nhap`, m[0])), lang + ': tệp đã chép ' + m[0]);
}

(async () => {
  const b = await chromium.launch();
  try {
    // 3a. canh.html mở thẳng: các cảnh số liệu nối nhau, mỗi câu 5 giây
    for (const lang of ['vi', 'en']) {
      const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto(BASE + '/scripts/video/dua-trai-ra-bien/canh.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
      const kq = await p.evaluate(() => window.thongTin.doan.map((d, i) => { window.veKhung((d.a + d.b) / 2); return [d.canh, [...document.querySelectorAll('.doan')].filter(e => getComputedStyle(e).visibility === 'visible').map(e => e.dataset.canh)]; }));
      for (const [c, vis] of kq) assert.deepEqual(vis, [c], lang + ': giữa đoạn ' + c + ' chỉ cảnh ấy hiện');
      for (const c of SL) assert.ok(kq.some(x => x[0] === c), lang + ': xem trước có cảnh ' + c);
      const txt = await p.evaluate(() => { const d = window.thongTin.doan.find(x => x.canh === 'C12'); window.veKhung(d.b - 0.5); return document.body.innerText; });
      assert.ok(lang === 'en' ? /Cost/.test(txt) && /short of trucks/.test(txt) && !/Chi phí/.test(txt) : /Chi phí/.test(txt) && /thiếu xe/.test(txt), lang + ': bảng ba cột đúng ngôn ngữ');
      assert.deepEqual(errs, [], lang + ': canh.html không lỗi JS');
      await p.close();
    }
    // 3b. Bản dựng nháp
    for (const lang of ['vi', 'en']) {
      const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      const loi404 = []; p.on('response', r => { if (r.status() >= 400) loi404.push(r.url()); });
      await p.goto(`${BASE}/artifacts/phim-test/dua-trai-ra-bien-01-${lang}-nhap/index.html`, { waitUntil: 'load', timeout: 60000 });
      const tt = await p.evaluate(() => window.thongTin);
      assert.ok(tt.tong >= 240 && tt.tong <= 360, lang + ': dài 4–6 phút (' + tt.tong + ' s)');
      const mong = KB.reduce((a, k) => (a.length && a[a.length - 1] === k.canh ? a : [...a, k.canh]), []);
      assert.deepEqual(tt.doan.map(d => d.canh), mong, lang + ': đủ đoạn theo thứ tự kịch bản');
      assert.ok(tt.doan.every((d, i) => i === 0 || Math.abs(d.a - tt.doan[i - 1].b) < 1e-6), lang + ': các đoạn nối liền, không hở');
      const vis = await p.evaluate(() => window.thongTin.doan.map(d => { window.veKhung((d.a + d.b) / 2); return [...document.querySelectorAll('.doan')].filter(e => getComputedStyle(e).visibility === 'visible').map(e => e.dataset.canh); }));
      vis.forEach((v, i) => assert.deepEqual(v, [tt.doan[i].canh], lang + ': giữa đoạn ' + (i + 1) + ' chỉ cảnh ' + tt.doan[i].canh + ' hiện'));
      const dau = await p.evaluate(() => { window.veKhung(0); return [...document.querySelectorAll('.doan')].filter(e => getComputedStyle(e).visibility === 'visible').length; });
      assert.equal(dau, 1, lang + ': khung đầu tiên (giây 0) đã có hình');
      const cho = await p.evaluate(() => window.thongTin.doan.filter(d => d.loai === 'NV').map(d => { window.veKhung((d.a + d.b) / 2); const e = [...document.querySelectorAll('.doan.cho')].find(x => getComputedStyle(x).visibility === 'visible'); return e ? e.querySelector('.ma').textContent : ''; }));
      assert.deepEqual(cho, tt.doan.filter(d => d.loai === 'NV').map(d => d.canh), lang + ': cảnh NV chưa có video hiện thẻ chờ đúng mã');
      const c1 = await p.evaluate(() => { window.veKhung(3.2); return [document.querySelector('.dem') && document.querySelector('.dem').textContent, document.body.innerText]; });
      assert.equal(c1[0], '43:59:57', lang + ': đồng hồ đếm ngược chạy theo giây phim');
      assert.ok(lang === 'en' ? c1[1].includes('Will we make it?') : c1[1].includes('Kịp không đây?'), lang + ': bong bóng thoại đúng ngôn ngữ');
      const het = await p.evaluate(() => { window.veKhung(window.thongTin.tong - 0.01); return getComputedStyle(document.getElementById('den')).opacity; });
      assert.ok(+het > 0.9, lang + ': cuối phim tối dần');
      assert.deepEqual(errs, [], lang + ': bản dựng không lỗi JS');
      assert.deepEqual(loi404.filter(u => !/favicon/.test(u)), [], lang + ': không thiếu tệp');
      await p.close();
    }
    console.log('phim-dua-trai-ra-bien-dung: đạt');
  } finally { await b.close(); fs.rmSync(OUT, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exit(1); });
