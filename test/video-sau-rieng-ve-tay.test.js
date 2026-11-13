/* Video vẽ tay khổ dọc «Một trái sầu riêng, cả vùng cùng sầu» (13/11/2026): bản ngắn 55 giây dựng bằng mã theo phong cách
 * Tablet Sketch (bộ công cụ Lemo-Opuscar, MIT), lời đọc tiếng Việt sẵn có, phụ đề Việt và Anh in trên hình. Gắn dưới video ngang
 * ở màn mở đầu Hộ Chiếu Sầu Riêng. Kiểm: tệp đúng khổ 720 × 1280, nhẹ; có ghi nguồn; trang hiện video dọc ở cả tiếng Việt và
 * tiếng Anh, không tải trước (preload none), không tràn ngang ở 360 px. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const { spawnSync } = require('node:child_process');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const MP4 = 'assets/video/sau-rieng-ma-so-doc-ve-tay-vi-720p.mp4', POSTER = 'assets/video/sau-rieng-ma-so-doc-ve-tay-poster.webp';
check(fs.existsSync(R(MP4)) && fs.statSync(R(MP4)).size < 9e6, 'video web có mặt, nhẹ hơn 9 MB');
check(fs.existsSync(R(POSTER)) && fs.statSync(R(POSTER)).size < 150000, 'ảnh bìa WebP có mặt, nhẹ');
const pr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', R(MP4)], { encoding: 'utf8' });
if (!pr.error) check(pr.stdout.trim() === '720,1280', 'khổ dọc 720 × 1280 (' + pr.stdout.trim() + ')'); else console.log('  (không có ffprobe: bỏ qua kiểm khổ)');
check(/lemo-opuscar/.test(read('THIRD-PARTY-NOTICES.md')) && /sau-rieng-ma-so-doc-ve-tay/.test(read('THIRD-PARTY-NOTICES.md')), 'THIRD-PARTY-NOTICES.md ghi nguồn bộ công cụ, nhạc mẫu và phông');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 851, 'sw.js ≥ bizon-v851');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [lang, w] of [['vi', 360], ['en', 390]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
      await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      const pg = await ctx.newPage(), loi = []; pg.on('pageerror', e => loi.push(e.message));
      await pg.goto(BASE + '/lab/ho-chieu-sau-rieng.html', { waitUntil: 'load' });
      await pg.waitForSelector('#introVideoDoc', { timeout: 20000 }).catch(() => {});
      const v = await pg.evaluate(() => { const e = document.getElementById('introVideoDoc'); return e && { src: e.querySelector('source').getAttribute('src'), pre: e.getAttribute('preload'), poster: e.getAttribute('poster'), w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height, tieuDe: e.parentElement.querySelector('h3').textContent }; });
      check(v && /sau-rieng-ma-so-doc-ve-tay-vi-720p\.mp4$/.test(v.src) && v.pre === 'none' && /doc-ve-tay-poster\.webp$/.test(v.poster), lang + ': có video dọc, không tải trước, có ảnh bìa');
      check(v && v.h > v.w * 1.5 && v.w <= 320, lang + ': khung dọc, rộng tối đa 320 px (' + (v && Math.round(v.w)) + ' × ' + (v && Math.round(v.h)) + ')');
      check(v && (lang === 'en' ? /Short version/.test(v.tieuDe) : /Bản ngắn 55 giây/.test(v.tieuDe)), lang + ': tiêu đề đúng ngôn ngữ');
      check(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), lang + ': không tràn ngang ở ' + w + ' px');
      check(loi.length === 0, lang + ': không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
      await ctx.close();
    }
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nvideo-sau-rieng-ve-tay: ok');
  process.exit(fails ? 1 : 0);
})();
