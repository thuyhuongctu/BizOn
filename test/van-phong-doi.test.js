'use strict';
// Trang «Văn phòng của đội» (van-phong-doi.html): phần giới thiệu cuộn + sa bàn văn phòng 3D (js/van-phong-doi-3d.js).
// Nhân vật phải là ảnh gốc trong game (assets/character/solid/*-tex.webp), không dựng nhân vật mới.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

// --- tĩnh ---
const page = read('van-phong-doi.html'), js = read('js/van-phong-doi-3d.js');
assert.ok(page.includes('<link rel="canonical" href="https://bizonland.com/van-phong-doi.html">'));
assert.ok(read('sitemap.xml').includes('<loc>https://bizonland.com/van-phong-doi.html</loc>'));
const sw = read('sw.js');
assert.ok(sw.includes("'./van-phong-doi.html'") && sw.includes("'./js/van-phong-doi-3d.js'"), 'sw.js chưa đệm trang');
assert.ok(+sw.match(/bizon-v(\d+)/)[1] >= 805);
// Mọi ảnh nhân vật đều là ảnh gốc có sẵn; tỉ lệ khai trong sa bàn khớp đúng cỡ tệp
const anh = [...new Set([...page.matchAll(/assets\/character\/solid\/([\w-]+)\.webp/g)].map(m => m[1]))];
assert.equal(anh.length, 7, 'năm nhân vật và hai cố vấn');
for (const a of anh) assert.ok(fs.existsSync(path.join(ROOT, 'assets/character/solid', a + '.webp')), 'thiếu ảnh ' + a);
for (const m of js.matchAll(/anh: '([\w-]+)', tl: (\d+) \/ (\d+)/g)) {
  const buf = fs.readFileSync(path.join(ROOT, 'assets/character/solid', m[1] + '.webp'));
  const w = 1 + buf.readUIntLE(24, 3), h = 1 + buf.readUIntLE(27, 3);   // khối VP8X
  assert.deepEqual([+m[2], +m[3]], [w, h], m[1] + ': tỉ lệ khai sai cỡ ảnh');
}
for (const id of ['ceo', 'cfo', 'cmo', 'coo', 'sec', 'lumina', 'thaytu']) {
  assert.ok(page.includes(`id="${id}"`), 'thiếu mục ' + id);
  assert.ok(js.includes(`id: '${id}'`), 'sa bàn thiếu phòng ' + id);
}
assert.ok(!/robot/i.test(page + js), 'không dựng robot');
assert.ok(read('universe.html').includes('href="van-phong-doi.html"'), 'trang Vũ trụ chưa có lối vào');
assert.ok(read('js/app.js').includes('<a href="van-phong-doi.html" target="_blank"'), 'game Bật Nghiệp chưa có lối vào');
assert.match(read('css/van-phong.css'), /prefers-reduced-motion:reduce/);
// Ba game còn lại: trang sinh từ scripts/van-phong/tao-trang.py, ảnh cắt sát trong assets/character/van-phong/
const TRANG = { 'van-phong-ben-phu-sa.html': ['ben-phu-sa.html', 8], 'van-phong-hc-thuong-hieu.html': ['brand-passport.html', 10], 'van-phong-hc-sau-rieng.html': ['lab/ho-chieu-sau-rieng.html', 8] };
for (const [f, [game, n]] of Object.entries(TRANG)) {
  const t = read(f);
  assert.ok(t.includes('SINH TỰ ĐỘNG bởi scripts/van-phong/tao-trang.py'), f + ': thiếu dấu tệp sinh');
  assert.ok(t.includes(`<link rel="canonical" href="https://bizonland.com/${f}">`), f + ': canonical');
  assert.ok(read('sitemap.xml').includes(`<loc>https://bizonland.com/${f}</loc>`), f + ': sitemap');
  assert.ok(sw.includes(`'./${f}'`), f + ': sw.js');
  const ds = JSON.parse(t.match(/window\.VP_PHONG = (\[.*\]);<\/script>/)[1]);
  assert.equal(ds.length, n, f + ': số phòng');
  assert.equal(ds.filter(p => p.giua).length, 1, f + ': một trạm giữa');
  for (const p of ds) {
    const buf = fs.readFileSync(path.join(ROOT, p.anh)); assert.equal(buf.toString('ascii', 8, 12), 'WEBP', p.anh);
    assert.ok(t.includes(`id="${p.id}"`), f + ': thiếu mục ' + p.id);
  }
  assert.ok(read(game).includes(game.startsWith('lab/') ? `../${f}` : `href="${f}"`), game + ': chưa có lối vào ' + f);
}
console.log('van-phong-doi (tĩnh): OK');

// --- trình duyệt ---
(async () => {
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
  const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-gl=swiftshader'] });
  try {
    for (const [trang, width, height] of [['van-phong-doi', 1280, 800], ['van-phong-doi', 390, 844], ['van-phong-doi', 360, 740], ['van-phong-ben-phu-sa', 390, 844], ['van-phong-hc-thuong-hieu', 1280, 800], ['van-phong-hc-sau-rieng', 360, 740]]) {
      const p = await browser.newPage({ viewport: { width, height } });
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.route(/googleapis|gstatic|goatcounter|gc\.zgo|\.mp3|\.mp4/, r => r.abort());
      await p.goto(BASE + '/' + trang + '.html', { waitUntil: 'load' });
      await p.waitForFunction(() => window.BizOnVanPhong && window.THREE, null, { timeout: 15000 });
      await p.waitForTimeout(2500);
      // sa bàn đã vẽ: canvas không còn một màu
      // sa bàn đã vẽ: nhiều khung, đủ tam giác (sàn, phòng, đồ đạc, nhân vật)
      await p.waitForFunction(() => { const v = document.querySelector('#sa-dau canvas').__vanPhong; return v && v.lanVe > 3; }, null, { timeout: 15000 });
      const tk = await p.evaluate(() => document.querySelector('#sa-dau canvas').__vanPhong);
      assert.ok(tk.tamGiac > 500, `${width}px: sa bàn vẽ quá ít (${tk.tamGiac} tam giác)`);
      assert.equal(await p.locator('#sa-dau.loi').count(), 0, 'sa bàn báo lỗi WebGL');
      const tran = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(tran <= 0, `${width}px: tràn ngang ${tran}px`);
      // cuộn tới mục CFO: thẻ hiện, số đếm chạy tới 1,24
      if (trang === 'van-phong-doi') {
        // cuộn tới mục CFO: thẻ hiện, số đếm chạy tới 1,24
        await p.evaluate(() => document.getElementById('cfo').scrollIntoView({ block: 'center' }));
        await p.waitForFunction(() => document.getElementById('cfo').classList.contains('vao'));
        await p.waitForFunction(() => /1[,.]24/.test(document.querySelector('#cfo [data-dem]').textContent), null, { timeout: 5000 });
      } else {
        // mục thứ hai vào khung nhìn thì thẻ hiện; mọi ảnh nhân vật tải được
        await p.evaluate(() => document.querySelectorAll('.canh')[1].scrollIntoView({ block: 'center' }));
        await p.waitForFunction(() => document.querySelectorAll('.canh')[1].classList.contains('vao'));
        const hong = await p.evaluate(async () => { const ims = [...document.querySelectorAll('img.nv, .doi-hinh img')]; ims.forEach(i => { i.loading = 'eager'; });
          await Promise.all(ims.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); return ims.filter(i => !i.naturalWidth).map(i => i.src); });
        assert.deepEqual(hong, [], trang + ': ảnh không tải được');
      }
      assert.deepEqual(errs, [], `${width}px lỗi trang: ` + errs.join(' | '));
      await p.close();
    }
    // bấm vào một phòng trên sa bàn thì cuộn tới mục của người ấy
    {
      const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      await p.route(/googleapis|gstatic|goatcounter|gc\.zgo|\.mp3|\.mp4/, r => r.abort());
      await p.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
      await p.goto(BASE + '/van-phong-doi.html', { waitUntil: 'load' });
      await p.waitForFunction(() => window.BizOnVanPhong && window.THREE);
      await p.waitForTimeout(2500);
      const r = await p.locator('#sa-dau canvas').boundingBox();
      let toi = false;
      for (let gy = .3; gy < .9 && !toi; gy += .08) for (let gx = .1; gx < .95 && !toi; gx += .06) {
        await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(50);
        await p.mouse.click(r.x + r.width * gx, r.y + r.height * gy);
        await p.waitForTimeout(250);
        toi = await p.evaluate(() => scrollY > 600);
      }
      assert.ok(toi, 'bấm phòng không cuộn tới mục nào');
      await p.close();
    }
    // giảm chuyển động: mục hiện sẵn, số ở giá trị cuối
    {
      const p = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      await p.route(/googleapis|gstatic|goatcounter|gc\.zgo|\.mp3|\.mp4/, r => r.abort());
      await p.goto(BASE + '/van-phong-doi.html', { waitUntil: 'load' });
      await p.waitForFunction(() => document.querySelectorAll('.canh.vao').length === 7);
      assert.match(await p.locator('#coo [data-dem]').textContent(), /^85$/);
      await p.close();
    }
  } finally { await browser.close(); }
  console.log('van-phong-doi (trình duyệt): OK');
})().catch(e => { console.error(e); process.exit(1); });
