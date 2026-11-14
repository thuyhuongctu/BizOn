/* Video vẽ tay khổ dọc Bến Phù Sa «Thứ không treo lên sào được» (14/11/2026): chuyện có thật ở chợ nổi Cái Răng, dựng bằng mã
 * theo phong cách Tablet Sketch (bộ công cụ Lemo-Opuscar, MIT) từ kịch bản đã duyệt docs/video/kich-ban-ben-phu-sa-cay-beo.md,
 * hai bản lời đọc bằng giọng tác giả Đỗ Thùy Hương (tiếng Việt, tiếng Anh). Gắn ở màn giới thiệu Bến Phù Sa 3D (mục gập «Trước khi
 * chơi»). Kiểm: hai tệp đúng khổ 720 × 1280, có tiếng, nhẹ; đủ giọng gốc; có ghi nguồn; trang phát đúng bản theo ngôn ngữ, đổi
 * theo khi đổi ngôn ngữ giữa chừng (kể cả sự kiện không kèm chi tiết như nút ngôn ngữ của game), không tải trước, khung dọc,
 * không tràn ngang ở 360 và 390 px; trang CHAM vẫn dùng chung tệp chọn bản. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const { spawnSync } = require('node:child_process');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const V = l => 'assets/video/ben-phu-sa-cay-beo-ve-tay-' + l + '-720p.mp4', P = l => 'assets/video/ben-phu-sa-cay-beo-ve-tay-' + l + '-poster.webp';
const LEN = { vi: [80, 90], en: [93, 103] };
for (const l of ['vi', 'en']) {
  check(fs.existsSync(R(V(l))) && fs.statSync(R(V(l))).size < 10e6, l + ': video có mặt, nhẹ hơn 10 MB');
  check(fs.existsSync(R(P(l))) && fs.statSync(R(P(l))).size < 150000, l + ': ảnh bìa WebP có mặt, nhẹ');
  check([...Array(11)].every((_, i) => fs.existsSync(R('assets/video/src/ben-phu-sa-cay-beo/' + l + '/' + String(i + 1).padStart(2, '0') + '.mp3'))), l + ': đủ 11 tệp giọng gốc');
  const pr = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', R(V(l))], { encoding: 'utf8' });
  if (pr.error) { console.log('  (không có ffprobe: bỏ qua kiểm khổ và độ dài)'); continue; }
  const j = JSON.parse(pr.stdout), v = j.streams.find(s => s.codec_type === 'video'), d = +j.format.duration;
  check(v && v.width === 720 && v.height === 1280, l + ': khổ dọc 720 × 1280');
  check(j.streams.some(s => s.codec_type === 'audio'), l + ': có tiếng');
  check(d >= LEN[l][0] && d <= LEN[l][1], l + ': dài ' + d.toFixed(1) + ' giây (trong ' + LEN[l].join('–') + ')');
}
const tpn = read('THIRD-PARTY-NOTICES.md');
check(/ben-phu-sa-cay-beo-ve-tay/.test(tpn), 'THIRD-PARTY-NOTICES.md ghi nguồn video');
check(/Đã dựng/.test(read('docs/video/kich-ban-ben-phu-sa-cay-beo.md')), 'kịch bản ghi trạng thái đã dựng');
check(/js\/video-song-ngu\.js/.test(read('ben-phu-sa-3d.html')) && /js\/video-song-ngu\.js/.test(read('cham/tham-dinh.html')), 'hai trang dùng chung js/video-song-ngu.js');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 867, 'sw.js ≥ bizon-v867');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [lang, w] of [['vi', 360], ['en', 390]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
      await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-bps-tour-seen', '1'); } catch (e) {} }, lang);
      await ctx.route('**/*.mp4', r => r.abort());
      const pg = await ctx.newPage(), loi = []; pg.on('pageerror', e => loi.push(e.message));
      await pg.goto(BASE + '/ben-phu-sa-3d.html', { waitUntil: 'load' });
      await pg.waitForFunction(() => { const v = document.getElementById('bpsVideo'); return v && v.getAttribute('data-lang'); }, null, { timeout: 15000 }).catch(() => {});
      await pg.evaluate(() => { document.getElementById('ft-intro').classList.remove('hidden'); document.getElementById('bps-video').open = true; });
      const doc = () => pg.evaluate(() => { const e = document.getElementById('bpsVideo'), r = e.getBoundingClientRect(); return { src: e.querySelector('source').getAttribute('src'), pre: e.getAttribute('preload'), poster: e.getAttribute('poster'), aria: e.getAttribute('aria-label'), w: r.width, h: r.height }; });
      let v = await doc();
      check(v.src.endsWith('ben-phu-sa-cay-beo-ve-tay-' + lang + '-720p.mp4') && v.poster.endsWith('ve-tay-' + lang + '-poster.webp'), lang + ': phát đúng bản ' + lang + ' (' + v.src.split('/').pop() + ')');
      check(lang === 'en' ? /Hand-drawn/.test(v.aria) : /Video vẽ tay/.test(v.aria), lang + ': nhãn đọc màn hình đúng ngôn ngữ');
      check(v.pre === 'none', lang + ': không tải trước');
      check(v.h > v.w * 1.5 && v.w <= 320, lang + ': khung dọc, rộng tối đa 320 px (' + Math.round(v.w) + ' × ' + Math.round(v.h) + ')');
      check(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), lang + ': không tràn ngang ở ' + w + ' px');
      const khac = lang === 'vi' ? 'en' : 'vi';
      await pg.evaluate(l => { localStorage.setItem('bizon-lang', l); window.dispatchEvent(new Event('bizon:langchange')); }, khac);
      v = await doc();
      check(v.src.endsWith('ben-phu-sa-cay-beo-ve-tay-' + khac + '-720p.mp4'), lang + ' → ' + khac + ': video đổi theo (sự kiện không kèm chi tiết)');
      check(loi.length === 0, lang + ': không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
      await ctx.close();
    }
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nvideo-ben-phu-sa-ve-tay: ok');
  process.exit(fails ? 1 : 0);
})();
