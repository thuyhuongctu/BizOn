// Xuất dinh-huong.html thành tệp PDF A4 tải về được (mọi trình duyệt, kể cả Zalo/Facebook
// trên điện thoại — nơi window.print() không hoạt động).
// Chạy: python3 -m http.server 8899  rồi  node scripts/release/build-dinh-huong-pdf.mjs
import { chromium } from 'playwright';

const baseUrl = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const output = process.env.BIZON_PDF_OUTPUT || 'assets/docs/BizOn-Dinh-huong-tac-dong-vung.pdf';

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
await context.addInitScript(() => { try { localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

await page.goto(`${baseUrl}/dinh-huong.html`, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.evaluate(async () => {
  window.dispatchEvent(new Event('beforeprint'));
  await document.fonts.ready;
  await Promise.all(Array.from(document.images).map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
});
await page.waitForTimeout(800);
await page.pdf({ path: output, preferCSSPageSize: true, printBackground: true });
await browser.close();

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Đã xuất ${output}`);
