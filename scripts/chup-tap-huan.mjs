#!/usr/bin/env node
/* Chụp ảnh 6 bước của trang «Tập huấn giảng viên» (truong-giang-vien.html) trên lớp mẫu DEMO-2026, bản VI và EN
 * (đặc tả 007, câu chuyện 2). Giao diện đổi thì chạy lại script này thay vì chụp tay; ảnh đã đăng không ghi đè:
 * muốn giữ ảnh cũ thì truyền hậu tố, ví dụ `node scripts/chup-tap-huan.mjs -v2`, rồi đổi đường dẫn trong trang.
 * Ảnh ra: assets/tap-huan/buoc-N-{vi,en}{hậu tố}.webp. Không gọi Supabase thật (trả rỗng), chỉ dùng dữ liệu mẫu.
 * Cần Playwright (đã có trên máy CI và máy đám mây). Tự bật máy chủ tĩnh ở một cổng trống nếu chưa đặt BIZON_URL. */
import { createServer } from 'node:http';
import { createReadStream, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'assets', 'tap-huan');
const SUFFIX = process.argv[2] || '';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

function serve() {
  return new Promise(ok => {
    const srv = createServer((req, res) => {
      let file = resolve(join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
      if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403).end(); return; }
      try { if (statSync(file).isDirectory()) file = join(file, 'index.html'); statSync(file); } catch { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' });
      createReadStream(file).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => ok(srv));
  });
}

async function newPage(b, lang, w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-theme', 'light'); } catch (e) {} }, lang);
  const p = await ctx.newPage();
  await p.route(/supabase\.co/, r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.route(/\.(mp3|m4a|mp4)(\?|$)/, r => r.abort());
  return { ctx, p };
}

// Lớp mẫu trên Trang Giảng viên: «Dùng thử với lớp mẫu DEMO-2026», đổi ngôn ngữ bằng nút VI/EN của trang
async function demoClass(p, base, lang) {
  await p.goto(base + '/Trang%20Giang%20Vien.dc.html', { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(1200);
  if (lang === 'en') { await p.getByRole('button', { name: 'EN', exact: true }).first().click(); await p.waitForTimeout(400); }
  await p.locator('button', { hasText: 'DEMO-2026' }).first().click();
  await p.waitForTimeout(1800);
}
const openDash = async p => { await p.getByText(/Mở bảng điều khiển|Open (the )?dashboard|Open class dashboard/i).first().click(); await p.waitForTimeout(2200); };
const tab = async (p, icon) => { await p.getByRole('button', { name: new RegExp(icon) }).first().click(); await p.waitForTimeout(1200); };

async function toWebp(b, png, file) {
  const { ctx, p } = await newPage(b, 'vi', 200, 200);
  const data = await p.evaluate(async src => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', 0.82);
  }, 'data:image/png;base64,' + png.toString('base64'));
  await ctx.close();
  writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
}

const box = (p, fn) => p.evaluate(fn);
// Đáy bảng đội của lớp mẫu: đội cuối danh sách mẫu là «Đội Gốm Đỏ»; lấy khung bảng chứa dòng đó
const lastRow = p => p.evaluate(() => {
  const cell = [...document.querySelectorAll('body *')].filter(e => e.offsetParent && e.children.length === 0 && /Gốm Đỏ/.test(e.textContent)).pop();
  let t = cell; while (t && t.getBoundingClientRect().width < 900) t = t.parentElement;
  return (t || cell).getBoundingClientRect().bottom + scrollY;
});

const STEPS = [
  // 1. Tạo lớp: khung «Lớp của tôi» (ô mã lớp mới, nút Tạo lớp, thẻ lớp)
  { n: 1, w: 1280, h: 1100, async shot(p, base, lang) {
    await demoClass(p, base, lang);
    const r = await box(p, () => {
      const go = [...document.querySelectorAll('button')].find(b => b.textContent.includes('＋')), link = [...document.querySelectorAll('a')].find(a => a.textContent.includes('🎮'));
      const a = go.getBoundingClientRect(), z = link.getBoundingClientRect(), top = a.top + scrollY - 90;
      return { x: 150, y: top, width: 980, height: z.bottom + scrollY - top + 18 };
    });
    return p.screenshot({ clip: r, fullPage: true });
  } },
  // 2. Gửi mã hoặc link: sinh viên mở vao-lop.html?lop=DEMO-2026 trên điện thoại, mã lớp đã điền sẵn
  { n: 2, w: 390, h: 844, async shot(p, base, lang) {
    await p.goto(base + '/vao-lop.html?lop=DEMO-2026' + (lang === 'en' ? '&lang=en' : ''), { waitUntil: 'load', timeout: 90000 });
    await p.waitForTimeout(1200);
    await p.evaluate(() => { const s = document.querySelector('.vl-step'); if (s) window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 150); });
    await p.waitForTimeout(300);
    return p.screenshot();
  } },
  // 3. Chiếu Màn hình lớp học (dữ liệu minh họa)
  { n: 3, w: 1280, h: 720, async shot(p, base, lang) {
    await p.goto(base + '/man-hinh-lop-hoc.html?demo=1' + (lang === 'en' ? '&lang=en' : ''), { waitUntil: 'load', timeout: 90000 });
    await p.waitForTimeout(2500);
    return p.screenshot();
  } },
  // 4. Theo dõi tiến độ: bảng điều khiển lớp, thẻ «Đội & tiến độ»
  { n: 4, w: 1280, h: 900, async shot(p, base, lang) {
    await demoClass(p, base, lang); await openDash(p);
    const bottom = await lastRow(p);
    return p.screenshot({ clip: { x: 24, y: 80, width: 1232, height: bottom - 80 + 16 }, fullPage: true });
  } },
  // 5. Chốt số liệu và chấm: thẻ «Chấm điểm» (thang 10, điểm tự động từ số liệu đã chốt, ô nhận xét)
  { n: 5, w: 1280, h: 900, async shot(p, base, lang) {
    await demoClass(p, base, lang); await openDash(p); await tab(p, '📝');
    const bottom = await lastRow(p);
    return p.screenshot({ clip: { x: 24, y: 80, width: 1232, height: bottom - 80 + 16 }, fullPage: true });
  } },
  // 6. Xuất kết quả và chứng nhận: «Điều khiển lớp» → danh sách sinh viên, «In cả lớp → PDF»
  { n: 6, w: 1280, h: 900, async shot(p, base, lang) {
    await demoClass(p, base, lang); await openDash(p); await tab(p, '🎛');
    await p.locator('textarea').last().fill('1\tNguyễn Văn A\tB2400001\n2\tTrần Thị B\tB2400002');
    const r = await box(p, () => {
      const btn = [...document.querySelectorAll('button')].filter(b => b.offsetParent && b.textContent.includes('📚')).pop();
      let card = btn; while (card && card.getBoundingClientRect().height < 400) card = card.parentElement;
      const c = card.getBoundingClientRect(), ta = [...document.querySelectorAll('textarea')].filter(t => t.offsetParent).pop().getBoundingClientRect(), b2 = btn.getBoundingClientRect();
      const lb = [...document.querySelectorAll('textarea')].filter(t => t.offsetParent).pop().previousElementSibling, top = (lb ? lb.getBoundingClientRect().top : ta.top - 40) + scrollY - 10;
      return { x: c.left - 6, y: top, width: c.width + 12, height: b2.bottom + scrollY - top + 14 };
    });
    return p.screenshot({ clip: r, fullPage: true });
  } },
];

const srv = process.env.BIZON_URL ? null : await serve();
const base = process.env.BIZON_URL || 'http://127.0.0.1:' + srv.address().port;
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
let fail = 0;
try {
  for (const lang of ['vi', 'en']) for (const s of STEPS) {
    const file = join(OUT, 'buoc-' + s.n + '-' + lang + SUFFIX + '.webp');
    if (existsSync(file) && !process.env.GHI_DE) { console.log('  · bỏ qua (đã có, không ghi đè): ' + file.replace(ROOT + sep, '')); continue; }
    const { ctx, p } = await newPage(b, lang, s.w, s.h);
    try { await toWebp(b, await s.shot(p, base, lang), file); console.log('  ✓ ' + file.replace(ROOT + sep, '')); }
    catch (e) { fail++; console.log('  ✗ bước ' + s.n + ' ' + lang + ': ' + e.message); }
    await ctx.close();
  }
} finally { await b.close(); if (srv) srv.close(); }
process.exit(fail ? 1 : 0);
