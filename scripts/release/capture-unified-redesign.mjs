import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const output = process.env.BIZON_QA_OUTPUT || 'artifacts/unified-redesign';
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function hydrateLazyAssets(page) {
  await page.evaluate(async () => {
    const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
    const step = Math.max(Math.floor(window.innerHeight * 0.72), 360);
    const height = document.documentElement.scrollHeight;

    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y);
      await pause(90);
    }

    window.scrollTo(0, document.documentElement.scrollHeight);
    await pause(180);
    window.scrollTo(0, 0);
  });

  await page.waitForFunction(() => {
    const assets = [...document.querySelectorAll('img[data-existing-asset]')];
    return assets.length === 0 || assets.every(image => image.complete && image.naturalWidth > 0);
  }, { timeout: 15_000 });
}

async function capture(name, route, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    colorScheme: 'dark',
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => consoleErrors.push(error.message));
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await hydrateLazyAssets(page);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
  if (consoleErrors.length) {
    throw new Error(`${name} console errors:\n${consoleErrors.join('\n')}`);
  }
  await context.close();
}

await capture('01-home-desktop', '/app/release.html', { width: 1440, height: 1000 });
await capture('02-command-center-desktop', '/app/command-center.html', { width: 1440, height: 1000 });
await capture('03-aibis-desktop', '/app/aibis.html', { width: 1440, height: 1000 });
await capture('04-home-mobile', '/app/release.html', { width: 390, height: 844 }, 2);
await capture('05-command-center-mobile', '/app/command-center.html', { width: 390, height: 844 }, 2);
await capture('06-aibis-mobile', '/app/aibis.html', { width: 390, height: 844 }, 2);

await browser.close();
console.log(`Unified redesign QA captured in ${output}`);
