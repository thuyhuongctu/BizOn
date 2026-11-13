/* Nhạc cho sinh viên quốc tế (13/11/2026): khách chọn tiếng Anh thì Bật Nghiệp, Bến Phù Sa 3D và Hộ Chiếu Thương Hiệu 3D phát
 * các bài lời tiếng Anh và tiếng Pháp có sẵn trong kho (ngôn ngữ lời kiểm bằng máy nghe hai đoạn 30 giây mỗi bài); chọn tiếng Việt
 * thì giữ nguyên danh sách cũ. Kiểm: tệp có thật, danh sách tiếng Anh không lẫn bài lời Việt, mỗi game chọn đúng danh sách theo
 * ngôn ngữ (gọi nút nhạc thật trong trình duyệt và ghi lại bài trình phát nhận). */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
// bài lời Việt (máy nghe xác nhận) – không được nằm trong danh sách tiếng Anh
const LOI_VIET = ['doi-phu-sa', 'bat-nghiep-co-loi', 'bat-nghiep-mekong-sunfire-2', 'bat-nghiep-mekong-sunfire.mp3', 'bat-nghiep-rap-symphony', 'bat-nghiep-thap-den-ben-song',
  'ho-chieu-p1', 'ho-chieu-p2', 'ho-chieu-p3-viet-nam-ra-the-gioi', 'ho-chieu-p3-remix', 'huong-vuon-ra-the-gioi', 'vua-du-de-bay-cao', 'huong-ngot', 'huong-et-le-monde'];
const laViet = f => LOI_VIET.some(v => f.includes(v));

const app = read('js/app.js'), en1 = /const BGM_TRACKS_EN = \[([\s\S]*?)\];/.exec(app)[1].match(/assets\/audio\/[a-z0-9-]+\.mp3/g);
const bps = read('ben-phu-sa-3d.html'), en2 = /var SOUNDTRACK_EN = \[([^\]]*)\]/.exec(bps)[1].match(/[a-z0-9-]+\.mp3/g);
const hc = read('Ho Chieu Thuong Hieu 3D.html'), en3 = /var SOUNDTRACK_EN = \[([^\]]*)\]/.exec(hc)[1].match(/[a-z0-9-]+\.mp3/g);
for (const [ten, ds, goc] of [['Bật Nghiệp', en1, ''], ['Bến Phù Sa 3D', en2, 'assets/audio/'], ['Hộ Chiếu Thương Hiệu 3D', en3, 'assets/audio/']]) {
  check(ds.length >= 5 && ds.every(f => fs.existsSync(R(goc + f))), ten + ': ' + ds.length + ' bài tiếng Anh/Pháp, tệp có thật');
  check(!ds.some(laViet), ten + ': danh sách tiếng Anh không lẫn bài lời Việt');
}
const dock = read('js/site-dock.js');
check(/if \(!window\.BizonDock\) \(function \(\)/.test(hc) && !/site-dock\.js/.test(hc), 'Hộ Chiếu Thương Hiệu 3D (không nạp dock chung) có trình phát dự phòng để nút nhạc phát được');
check([...en2, ...en3].every(f => dock.includes("'" + f + "'")), 'mọi bài của Bến Phù Sa và Hộ Chiếu có trong kho nhạc của dock (scope mới nhận)');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 843, 'sw.js ≥ bizon-v843');

const ghiDock = () => { const d = window.BizonDock; window.__ghi = []; const s = d.scope, p = d.play; d.scope = (f, n) => { window.__ghi.push(['scope', f.slice()]); return s(f, n); }; d.play = f => { window.__ghi.push(['play', f]); return true; }; d.isPlaying = () => false; };
(async () => {
  const b = await chromium.launch();
  try {
    for (const lang of ['en', 'vi']) {
      const ctx = await b.newContext(); await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-bps-tour-seen', '1'); } catch (e) {} }, lang);
      ctx.route('**/*.mp3', r => r.abort());
      // Bật Nghiệp (game.html dùng js/app.js)
      let pg = await ctx.newPage(); await pg.goto(BASE + '/game.html', { waitUntil: 'load' });
      const ds = await pg.evaluate(() => typeof dsNhac === 'function' ? dsNhac() : null);
      check(ds && (lang === 'en' ? ds[0].endsWith('bat-nghiep-mekong-sunfire-1.mp3') && !ds.some(f => f.includes('doi-phu-sa')) : ds[0].endsWith('bat-nghiep-mekong-sunfire-rise.mp3')), 'Bật Nghiệp, ' + lang + ': danh sách đúng ngôn ngữ (bài đầu ' + (ds && ds[0].split('/').pop()) + ')');
      await pg.close();
      // Bến Phù Sa 3D
      pg = await ctx.newPage(); await pg.goto(BASE + '/ben-phu-sa-3d.html', { waitUntil: 'load' });
      await pg.waitForFunction(() => window.BizonDock && window.ftMusic, null, { timeout: 30000 });
      await pg.evaluate(ghiDock); await pg.evaluate(() => window.ftMusic());
      let g = await pg.evaluate(() => window.__ghi);
      check(lang === 'en' ? g.some(x => x[0] === 'play' && x[1] === 'journey-golden-silt.mp3') : g.some(x => x[0] === 'play' && x[1] === 'doi-phu-sa.mp3'), 'Bến Phù Sa 3D, ' + lang + ': phát ' + (g.find(x => x[0] === 'play') || [])[1]);
      await pg.close();
      // Hộ Chiếu Thương Hiệu 3D
      pg = await ctx.newPage(); await pg.goto(BASE + '/Ho%20Chieu%20Thuong%20Hieu%203D.html', { waitUntil: 'load' });
      await pg.waitForFunction(() => window.BizonDock && window.bpMusic, null, { timeout: 30000 });
      await pg.evaluate(ghiDock); await pg.evaluate(() => window.bpMusic());
      g = await pg.evaluate(() => window.__ghi); const sc = (g.find(x => x[0] === 'scope') || [])[1] || [];
      check(lang === 'en' ? sc.length && !sc.some(f => f.startsWith('ho-chieu-p1') || f.startsWith('ho-chieu-p2')) : sc.some(f => f.startsWith('ho-chieu-p1')), 'Hộ Chiếu Thương Hiệu 3D, ' + lang + ': tuyển tập đúng ngôn ngữ (' + sc.length + ' bài)');
      await ctx.close();
    }
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nnhac-tieng-anh: ok');
  process.exit(fails ? 1 : 0);
})();
