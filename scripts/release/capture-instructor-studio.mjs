import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const output = process.env.BIZON_QA_OUTPUT || 'artifacts/instructor-studio';
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    colorScheme: 'dark',
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(`${baseUrl}/app/instructor-studio.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const image = document.querySelector('.bi-mentor img');
    return image && image.complete && image.naturalWidth > 0;
  });

  const audit = await page.evaluate(() => {
    const entries = Object.entries(localStorage);
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyText: document.body.innerText,
      mentorWidth: document.querySelector('.bi-mentor img')?.naturalWidth || 0,
      secretStored: entries.some(([key, value]) =>
        /secret|instructor[-_]?key|admin[-_]?key/i.test(key) ||
        /BIZON-GV-|service[_-]?role/i.test(String(value))
      )
    };
  });

  if (audit.overflow > 1) throw new Error(`${name}: horizontal overflow ${audit.overflow}px`);
  if (audit.mentorWidth < 1) throw new Error(`${name}: mentor image did not load`);
  if (/Food Truck|Gánh Hàng/i.test(audit.bodyText)) throw new Error(`${name}: excluded Food Truck surface is visible`);
  if (audit.secretStored) throw new Error(`${name}: an instructor credential was found in localStorage`);

  await page.screenshot({ path: path.join(output, `${name}-connection.png`), fullPage: true });

  await page.evaluate(() => {
    document.querySelector('#bi-studio-content')?.classList.remove('bi-hidden');
    const label = document.querySelector('#bi-class-label');
    if (label) label.textContent = 'QA-CLASS';
  });
  await page.screenshot({ path: path.join(output, `${name}-empty-state.png`), fullPage: true });

  await page.click('[data-bi-tab="traces"]');
  const tracesVisible = await page.locator('[data-bi-panel="traces"]').evaluate(node => !node.classList.contains('bi-hidden'));
  if (!tracesVisible) throw new Error(`${name}: Decision Trace tab did not open`);
  await page.screenshot({ path: path.join(output, `${name}-decision-trace.png`), fullPage: true });

  if (errors.length) throw new Error(`${name} console errors:\n${errors.join('\n')}`);
  await context.close();
}

await capture('instructor-desktop', { width: 1440, height: 1000 });
await capture('instructor-mobile', { width: 390, height: 844 }, 2);

await browser.close();
console.log(`Instructor Studio QA captured in ${output}`);
