import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const outDir = path.resolve(process.env.PLAY_STORE_OUTPUT || 'artifacts/play-store');
const phoneDir = path.join(outDir, 'phone');
fs.mkdirSync(phoneDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function capturePhone(name, route, options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    locale: 'vi-VN',
    colorScheme: 'dark'
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
  });
  if (options.waitForFrame) {
    const frame = page.frames().find(item => item.url().includes(options.waitForFrame));
    if (!frame) throw new Error(`Expected frame not found: ${options.waitForFrame}`);
    await frame.waitForLoadState('domcontentloaded');
  }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(phoneDir, `${name}.png`), fullPage: false });
  await context.close();
}

await capturePhone('01-bizon-home', 'app/release.html');
await capturePhone('02-startup-lab', 'game.html');
await capturePhone('03-brand-passport', 'app/brand-passport.html', { waitForFrame: 'brand-passport-learning.html' });
await capturePhone('04-aibis', 'app/aibis.html');

const featureContext = await browser.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
const featurePage = await featureContext.newPage();
await featurePage.goto(`${baseUrl}/play-store/feature-graphic.html`, { waitUntil: 'networkidle' });
await featurePage.screenshot({ path: path.join(outDir, 'feature-graphic-1024x500.png'), fullPage: false });
await featureContext.close();
await browser.close();

fs.copyFileSync('assets/icons/icon-512.png', path.join(outDir, 'app-icon-512.png'));
fs.copyFileSync('play-store/listing/vi-VN.md', path.join(outDir, 'listing-vi-VN.md'));
fs.copyFileSync('play-store/listing/en-US.md', path.join(outDir, 'listing-en-US.md'));

const altText = {
  '01-bizon-home.png': 'Màn hình chính BizOn với bốn mô-đun học tập và nguyên tắc vận hành.',
  '02-startup-lab.png': 'Startup Lab cho phép người học vận hành doanh nghiệp qua các vòng quyết định.',
  '03-brand-passport.png': 'Brand Passport hỗ trợ quyết định quốc tế hóa và xem lại tiến trình lập luận.',
  '04-aibis.png': 'AIBIS so sánh các phương thức thâm nhập thị trường theo ưu tiên chiến lược.',
  'feature-graphic-1024x500.png': 'BizOn — học kinh doanh bằng những lựa chọn có thể giải thích.'
};
fs.writeFileSync(path.join(outDir, 'alt-text-vi.json'), `${JSON.stringify(altText, null, 2)}\n`, 'utf8');

console.log(`Play Store assets written to ${outDir}`);
