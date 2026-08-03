import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const output = process.env.BIZON_QA_OUTPUT || 'artifacts/bizon-2030';
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function capture(name, route, viewport, scale = 1) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: scale, colorScheme: 'dark', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(window.innerHeight * .7, 360)) {
      window.scrollTo(0, y);
      await pause(80);
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0), { timeout: 15000 });
  const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  if (bodyWidth > viewport.width + 2) throw new Error(`${name} horizontal overflow: ${bodyWidth}px > ${viewport.width}px`);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
  if (errors.length) throw new Error(`${name} console errors:\n${errors.join('\n')}`);
  await context.close();
}

await capture('01-blueprint-desktop', '/app/blueprint-2030.html', { width: 1440, height: 1000 });
await capture('02-blueprint-mobile', '/app/blueprint-2030.html', { width: 390, height: 844 }, 2);
await capture('03-aibis-entry-mode-desktop', '/aibis-entry-mode-preview.html', { width: 1440, height: 1000 });
await capture('04-aibis-entry-mode-mobile', '/aibis-entry-mode-preview.html', { width: 390, height: 844 }, 2);

await browser.close();
console.log(`BizOn 2030 visual QA captured in ${output}`);
