// Xuất dinh-huong.html thành tệp PDF A4 tải về được (mọi trình duyệt, kể cả Zalo/Facebook
// trên điện thoại — nơi window.print() không hoạt động).
// Xuất hai bản: tiếng Việt và tiếng Anh (theo nút VI/EN của trang).
// Chạy: python3 -m http.server 8899  rồi  node scripts/release/build-dinh-huong-pdf.mjs
import { chromium } from 'playwright';

const baseUrl = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const outputs = {
  vi: 'assets/docs/BizOn-Dinh-huong-tac-dong-vung.pdf',
  en: 'assets/docs/BizOn-Regional-Impact-Orientation-EN.pdf',
};

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
const errors = [];
for (const [lang, output] of Object.entries(outputs)) {
const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
await context.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
const page = await context.newPage();
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
await context.close();
console.log(`Đã xuất ${output}`);
}
await browser.close();

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
