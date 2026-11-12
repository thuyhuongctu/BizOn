/* Chân trang đất sét (js/bizon-clay-footer.js, 12/11/2026): cột «Trò chơi» chỉ trỏ tới bản 3D mới nhất của từng game,
 * xếp theo Hành trình 3 bậc: Bến BizOn 3D, Bến Phù Sa 3D (bậc 1), Bật Nghiệp 3D (bậc 2), Hộ Chiếu Thương Hiệu 3D và
 * Hộ Chiếu Sầu Riêng 3D (bậc 3). BizOn Arcade (2D) chuyển sang cột «Sáng tạo». Bến BizOn mở cho tìm kiếm (bỏ noindex,
 * có canonical, có trong sitemap). Kiểm: đúng thứ tự và đích, liên kết mở được ở trang gốc và trang thư mục con,
 * tiếng Anh, không tràn ngang ở 360 px. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const goc = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(goc, f), 'utf8');

const DICH = ['hub-3d.html', 'ben-phu-sa-3d.html', 'BizOn Game 3D.html', 'Ho Chieu Thuong Hieu 3D.html', 'lab/ho-chieu-sau-rieng-3d.html'];
const CU = ['game.html', 'ben-phu-sa.html', 'brand-passport.html', 'ho-chieu-sau-rieng.html'];

// ---- Kiểm tĩnh
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 837, 'sw.js ≥ bizon-v837');
for (const f of DICH) check(fs.existsSync(path.join(goc, f)), 'trang đích có thật: ' + f);
const hub = read('hub-3d.html');
check(!/name="robots" content="noindex"/.test(hub) && hub.includes('<link rel="canonical" href="https://bizonland.com/hub-3d.html">'), 'hub-3d.html bỏ noindex, có canonical');
check(read('sitemap.xml').includes('<loc>https://bizonland.com/hub-3d.html</loc>'), 'hub-3d.html có trong sitemap.xml');
check(/name="robots" content="noindex"/.test(read('lab/ho-chieu-sau-rieng-3d.html')), 'Hộ Chiếu Sầu Riêng 3D vẫn noindex (chị chưa mở cho tìm kiếm)');

const cot = (pg, ten) => pg.evaluate(t => { const h = [...document.querySelectorAll('#clay-footer h4')].find(x => x.textContent.trim() === t); return h ? [...h.parentElement.querySelectorAll('a')].map(a => ({ href: a.href, chu: a.textContent.trim() })) : null; }, ten);

(async () => {
  const b = await chromium.launch();
  try {
    for (const [trang, w] of [['/index.html', 360], ['/cham/tro-choi.html', 390]]) {
      const pg = await b.newPage({ viewport: { width: w, height: 800 } }); const loi = []; pg.on('pageerror', e => loi.push(e.message));
      await pg.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
      await pg.goto(BASE + trang, { waitUntil: 'load' });
      await pg.waitForSelector('#clay-footer h4', { timeout: 15000 });
      const game = await cot(pg, 'Trò chơi');
      const duongDan = (game || []).map(a => decodeURIComponent(new URL(a.href).pathname).replace(/^\//, ''));
      check(JSON.stringify(duongDan) === JSON.stringify(DICH), trang + ': cột «Trò chơi» đúng 5 game 3D theo thứ tự bậc (' + duongDan.join(' | ') + ')');
      check(game && game.every(a => /3D/.test(a.chu)) && !duongDan.some(d => CU.includes(d)), trang + ': chỉ có bản 3D, không còn bản 2D cũ');
      const sangTao = await cot(pg, 'Sáng tạo');
      check(sangTao && sangTao.some(a => /games\.html$/.test(a.href) && /Arcade/.test(a.chu)), trang + ': BizOn Arcade chuyển sang cột «Sáng tạo»');
      const ma = await pg.evaluate(async hs => Promise.all(hs.map(h => fetch(h, { method: 'HEAD' }).then(r => r.status, () => 0))), (game || []).map(a => a.href));
      check(ma.length === 5 && ma.every(s => s === 200), trang + ': cả 5 liên kết mở được (' + ma.join(', ') + ')');
      check(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), trang + ': không tràn ngang ở ' + w + ' px');
      check(loi.length === 0, trang + ': không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
      await pg.close();
    }
    // tiếng Anh
    const pe = await b.newPage({ viewport: { width: 390, height: 800 } });
    await pe.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'en'); } catch (e) {} });
    await pe.goto(BASE + '/index.html', { waitUntil: 'load' }); await pe.waitForSelector('#clay-footer h4', { timeout: 15000 });
    const en = await pe.evaluate(() => [...document.querySelectorAll('#clay-footer a')].map(a => a.getAttribute('data-en') || ''));
    check(['BizOn Wharf 3D', 'Tier 1', 'Tier 2', 'Brand Passport 3D · Tier 3', 'Durian Passport 3D · Tier 3'].every(t => en.some(x => x.includes(t))), 'có nhãn tiếng Anh cho 5 game 3D');
    await pe.close();
  } finally { await b.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nchan-trang-game-3d: ok');
  process.exit(fails ? 1 : 0);
})();
