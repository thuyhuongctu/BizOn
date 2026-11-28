/* Văn phòng đội Hộ Chiếu Thương Hiệu (28/11/2026, chị báo «nhân vật tách nền chưa kỹ, kích thước không đều nhau»). Kiểm:
 * - trang dùng 10 ảnh hcth-*-v2.webp (làm sạch bằng scripts/van-phong/lam-sach-anh.py); ảnh gốc vẫn còn, không bị ghi đè;
 *   ảnh v2 cùng kích thước ảnh gốc; sw.js tăng phiên bản;
 * - chất lượng tách nền (đọc điểm ảnh trên canvas): viền mờ không còn tối hơn hẳn thân (trước đây viền tối 40–73 so với thân
 *   86–145, thành đường viền xám trên nền kem); không còn bóng nền tối mờ cách thân > 5 px (mảng mờ cạnh tấm vải Lam Việt);
 *   ảnh gốc thì có hai lỗi đó (để chắc phép đo bắt được lỗi);
 * - hàng đội hình ở cả bốn văn phòng: mọi nhân vật cao bằng nhau (trước đây ảnh rộng như Lam Việt, Mekong Digital nhỏ hẳn),
 *   không tràn khỏi khung, trang không tràn ngang ở 390 và 1 280 px; không lỗi JS. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const TEN = ['an-nhien', 'ba-sau-lanh', 'lam-viet', 'lina-park', 'lumina', 'mekong-digital', 'minh-khang', 'moc-nhien', 'phu-sa-foods', 'tu'];
const html = R('van-phong-hc-thuong-hieu.html');
assert.doesNotMatch(html, /van-phong\/hcth-[a-z-]+(?<!-v2)\.webp/, 'trang không còn dùng ảnh hcth cũ');
assert.deepEqual([...new Set(html.match(/hcth-[a-z-]+-v2\.webp/g))].sort(), TEN.map(t => 'hcth-' + t + '-v2.webp').sort(), 'trang dùng đủ 10 ảnh v2');
const kichThuoc = f => { const b = fs.readFileSync(f); const i = b.indexOf('VP8X'); return [1 + b.readUIntLE(i + 12, 3), 1 + b.readUIntLE(i + 15, 3)]; };
for (const t of TEN) {
  const goc = path.join(ROOT, 'assets/character/van-phong/hcth-' + t + '.webp'), v2 = goc.replace('.webp', '-v2.webp');
  assert.ok(fs.existsSync(goc) && fs.existsSync(v2), t + ': còn ảnh gốc, có ảnh v2');
  assert.deepEqual(kichThuoc(v2), kichThuoc(goc), t + ': ảnh v2 cùng kích thước ảnh gốc');
}
assert.match(R('scripts/van-phong/tao-trang.py'), /'hcth-lam-viet-v2'/, 'script sinh trang trỏ tới ảnh v2');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 1021, 'sw.js tăng phiên bản');

const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); let fails = 0;
  const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
  const errs = [];
  // Đo trên canvas: độ sáng TB của viền mờ (20 < alpha < 200) so với thân đặc (alpha ≥ 250); số điểm bóng tối mờ cách thân > 5 px
  const pg0 = await b.newPage(); await pg0.goto(BASE + '/van-phong-hc-thuong-hieu.html', { waitUntil: 'domcontentloaded' });
  const doAnh = src => pg0.evaluate(async s => {
    const im = new Image(); im.src = s; await im.decode();
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
    const dac = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) dac[i] = d[i * 4 + 3] >= 250 ? 1 : 0;
    const gan = new Uint8Array(W * H);   // trong vòng 5 px quanh thân đặc: dải khử răng cưa của vật tối (quần, giày) là chính đáng
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (dac[y * W + xx]) for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const yy = y + dy, x2 = xx + dx; if (yy >= 0 && yy < H && x2 >= 0 && x2 < W) gan[yy * W + x2] = 1; }
    let sv = 0, nv = 0, st = 0, nt = 0, bong = 0;
    for (let i = 0; i < W * H; i++) { const a = d[i * 4 + 3], L = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
      if (a >= 250) { st += L; nt++; } else if (a > 20 && a < 200) { sv += L; nv++; if (L < 60 && !gan[i]) bong++; } }
    return { vien: sv / Math.max(1, nv), than: st / Math.max(1, nt), bong };
  }, src);
  let gocCoLoi = 0;
  for (const t of TEN) {
    const g = await doAnh('assets/character/van-phong/hcth-' + t + '.webp'), v = await doAnh('assets/character/van-phong/hcth-' + t + '-v2.webp');
    if (g.vien < g.than - 25 || g.bong > 200) gocCoLoi++;
    ok(v.vien >= v.than - 25, t + ': viền không tối hơn thân (viền ' + Math.round(v.vien) + ' / thân ' + Math.round(v.than) + '; ảnh gốc ' + Math.round(g.vien) + ' / ' + Math.round(g.than) + ')');
    ok(v.bong <= 50, t + ': không còn bóng nền tối mờ xa thân (' + v.bong + ' điểm; ảnh gốc ' + g.bong + ')');
  }
  ok(gocCoLoi >= 5, 'phép đo bắt được lỗi ở ảnh gốc (' + gocCoLoi + '/10 ảnh gốc có viền tối hoặc bóng sót)');
  await pg0.close();

  for (const u of ['van-phong-hc-thuong-hieu.html', 'van-phong-ben-phu-sa.html', 'van-phong-hc-sau-rieng.html', 'van-phong-doi.html'])
    for (const [w, h] of [[390, 844], [1280, 860]]) {
      const pg = await b.newPage({ viewport: { width: w, height: h } }); pg.on('pageerror', e => errs.push(u + ': ' + e.message));
      await pg.goto(BASE + '/' + u, { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(800);
      const r = await pg.evaluate(async () => {
        const d = document.querySelector('.doi-hinh'); d.scrollIntoView({ block: 'center' });
        const imgs = [...d.querySelectorAll('img')]; await Promise.all(imgs.map(i => i.decode().catch(() => {})));
        const dr = d.getBoundingClientRect(), hs = imgs.map(i => i.getBoundingClientRect().height);
        return { n: imgs.length, min: Math.min(...hs), max: Math.max(...hs), tran: imgs.filter(i => { const q = i.getBoundingClientRect(); return q.left < dr.left - 1 || q.right > dr.right + 1; }).length, sw: document.documentElement.scrollWidth - innerWidth };
      });
      ok(r.max - r.min <= 1 && r.min >= 140, u + ' ' + w + ': ' + r.n + ' nhân vật cao bằng nhau (' + Math.round(r.min) + '–' + Math.round(r.max) + ' px)');
      ok(!r.tran && r.sw <= 1, u + ' ' + w + ': không tràn khỏi khung, không tràn ngang');
      await pg.close();
    }
  ok(!errs.length, 'không lỗi JS' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  if (fails) { console.error('van-phong-hcth-v2: ' + fails + ' lỗi'); process.exit(1); }
  console.log('van-phong-hcth-v2: ok');
})().catch(e => { console.error(e); process.exit(1); });
