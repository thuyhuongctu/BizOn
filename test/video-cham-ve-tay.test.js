/* Video vẽ tay khổ dọc CHAM «Hòa vốn sau năm tháng» (14/11/2026): dựng bằng mã theo phong cách Tablet Sketch (bộ công cụ
 * Lemo-Opuscar, MIT) từ kịch bản đã duyệt docs/video/kich-ban-cham-hoa-von.md, hai bản lời đọc bằng giọng tác giả Đỗ Thùy Hương
 * (tiếng Việt và tiếng Anh). Gắn ở trang Thẩm định kế hoạch CHAM. Kiểm: hai tệp đúng khổ 720 × 1280, có tiếng, nhẹ; bản ghi giọng
 * gốc đủ 11 câu mỗi thứ tiếng; có ghi nguồn; trang phát bản tiếng Việt khi chọn tiếng Việt, bản tiếng Anh khi chọn tiếng Anh (cả khi
 * đổi ngôn ngữ giữa chừng), không tải trước, khung dọc, không tràn ngang ở 360 và 390 px. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const { spawnSync } = require('node:child_process');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const V = l => 'assets/video/cham-hoa-von-ve-tay-' + l + '-720p.mp4', P = l => 'assets/video/cham-hoa-von-ve-tay-' + l + '-poster.webp';
const LEN = { vi: [70, 80], en: [80, 90] };
for (const l of ['vi', 'en']) {
  check(fs.existsSync(R(V(l))) && fs.statSync(R(V(l))).size < 9e6, l + ': video có mặt, nhẹ hơn 9 MB');
  check(fs.existsSync(R(P(l))) && fs.statSync(R(P(l))).size < 150000, l + ': ảnh bìa WebP có mặt, nhẹ');
  const pr = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', R(V(l))], { encoding: 'utf8' });
  if (pr.error) { console.log('  (không có ffprobe: bỏ qua kiểm khổ và độ dài)'); continue; }
  const j = JSON.parse(pr.stdout), v = j.streams.find(s => s.codec_type === 'video'), d = +j.format.duration;
  check(v && v.width === 720 && v.height === 1280, l + ': khổ dọc 720 × 1280 (' + (v && v.width + ' × ' + v.height) + ')');
  check(j.streams.some(s => s.codec_type === 'audio'), l + ': có tiếng');
  check(d >= LEN[l][0] && d <= LEN[l][1], l + ': dài ' + d.toFixed(1) + ' giây (trong ' + LEN[l].join('–') + ')');
  check([...Array(11)].every((_, i) => fs.existsSync(R('assets/video/src/cham-hoa-von/' + l + '/' + String(i + 1).padStart(2, '0') + '.mp3'))), l + ': đủ 11 tệp giọng gốc');
}
const tpn = read('THIRD-PARTY-NOTICES.md');
check(/cham-hoa-von-ve-tay/.test(tpn) && /lemo-opuscar/i.test(tpn), 'THIRD-PARTY-NOTICES.md ghi nguồn bộ công cụ, nhạc mẫu, phông và giọng đọc');
check(/Đã dựng/.test(read('docs/video/kich-ban-cham-hoa-von.md')), 'kịch bản ghi trạng thái đã dựng');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 863, 'sw.js ≥ bizon-v863');

(async () => {
  const b = await chromium.launch();
  try {
    for (const [lang, w] of [['vi', 360], ['en', 390]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
      await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await ctx.route('**/*.mp4', r => r.abort());
      const pg = await ctx.newPage(), loi = []; pg.on('pageerror', e => loi.push(e.message));
      await pg.goto(BASE + '/cham/tham-dinh.html', { waitUntil: 'load' });
      await pg.waitForFunction(() => { const v = document.getElementById('chamVideo'); return v && v.getAttribute('data-lang'); }, null, { timeout: 15000 }).catch(() => {});
      const doc = () => pg.evaluate(() => { const e = document.getElementById('chamVideo'), r = e && e.getBoundingClientRect(); return e && { src: e.querySelector('source').getAttribute('src'), pre: e.getAttribute('preload'), poster: e.getAttribute('poster'), w: r.width, h: r.height, tieuDe: document.getElementById('rv-video-h').textContent }; });
      let v = await doc();
      check(v && v.src.endsWith('cham-hoa-von-ve-tay-' + lang + '-720p.mp4') && v.poster.endsWith('cham-hoa-von-ve-tay-' + lang + '-poster.webp'), lang + ': phát đúng bản ' + lang + ' (' + (v && v.src.split('/').pop()) + ')');
      check(v && v.pre === 'none', lang + ': không tải trước');
      check(v && v.h > v.w * 1.5 && v.w <= 320, lang + ': khung dọc, rộng tối đa 320 px (' + (v && Math.round(v.w)) + ' × ' + (v && Math.round(v.h)) + ')');
      check(v && (lang === 'en' ? /red pen/.test(v.tieuDe) : /bút đỏ/.test(v.tieuDe)), lang + ': tiêu đề đúng ngôn ngữ');
      check(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), lang + ': không tràn ngang ở ' + w + ' px');
      // đổi ngôn ngữ giữa chừng: video đổi theo
      const khac = lang === 'vi' ? 'en' : 'vi';
      await pg.evaluate(l => window.dispatchEvent(new CustomEvent('bizon:langchange', { detail: { lang: l } })), khac);
      v = await doc();
      check(v && v.src.endsWith('cham-hoa-von-ve-tay-' + khac + '-720p.mp4'), lang + ' → ' + khac + ': video đổi sang bản ' + khac);
      check(loi.length === 0, lang + ': không lỗi trang' + (loi[0] ? ': ' + loi[0] : ''));
      await ctx.close();
    }
  } catch (e) { console.error(e); fails++; }
  await b.close();
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nvideo-cham-ve-tay: ok');
  process.exit(fails ? 1 : 0);
})();
