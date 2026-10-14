// Kiểm thử đầu-cuối: quyết định chính của Hộ Chiếu Thương Hiệu 3D nằm trên cảnh 3D.
// Trên điện thoại (390×844): chọn Ưu tiên và Mức vận hành bằng cách bấm ô trong cảnh
// (raycast qua window.__bp3dKiosks), rồi bấm ô chốt; game phải chuyển sang pha 'evt'.
// Chạy: BASE=http://127.0.0.1:4173 node test/hochieu-3d-decision-hud.e2e.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:4173';
const PAGE = BASE + '/Ho%20Chieu%20Thuong%20Hieu%203D.html';
const failures = [];
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) failures.push(msg); };

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
// serviceWorkers: 'block' — sw-hochieu.js có thể tự tải lại trang giữa chừng và làm hỏng bối cảnh kiểm thử.
const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());

try {
  await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#bp-firms button', { state: 'attached', timeout: 30000 });
  const quick = page.getByText('Chơi thử nhanh, không cần điền').first();
  if (await quick.count()) await quick.click({ force: true }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.evaluate(() => { window.bpFirm(0); window.bpStart(); });
  await page.waitForFunction(() => window.__bp3dKiosks && window.__bp3dKiosks.cam, { timeout: 30000 });
  // Pha quan sát có thể chuyển tiếp bất đồng bộ sau bpStart(); gọi bpToDecide() cho tới khi pha là 'dec'.
  for (let i = 0; i < 60; i++) {
    const ph = await page.evaluate(() => window.__bp.S.phase).catch(() => null);
    if (ph === 'dec') break;
    await page.evaluate(() => { window.bpToDecide(); }).catch(() => {});
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);
  // Gỡ lớp hướng dẫn (tutorial) đang chặn click trong lần chơi đầu tiên.
  await page.evaluate(() => {
    document.querySelectorAll('body > div').forEach(d => {
      const c = getComputedStyle(d);
      if (c.position === 'fixed' && d.style.zIndex === '90' && !d.id) d.remove();
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);

  const hud = await page.evaluate(() => ({ phase: window.__bp.S.phase, hud: document.body.classList.contains('bp3d-choice-hud') }));
  check(hud.phase === 'dec' && hud.hud, 'pha quyết định bật HUD trong cảnh 3D (' + JSON.stringify(hud) + ')');

  const clickIcon = async (icon) => {
    const pos = await page.evaluate((icon) => {
      const K = window.__bp3dKiosks;
      const sp = K.hits.find(o => o.userData && o.userData.choice && o.userData.choice.icon === icon);
      if (!sp) return null;
      const v = sp.getWorldPosition(new sp.position.constructor()); v.project(K.cam);
      const r = K.R.domElement.getBoundingClientRect();
      return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
    }, icon);
    if (!pos) return false;
    await page.mouse.click(pos.x, pos.y);
    await page.waitForTimeout(700);
    return true;
  };

  check(await clickIcon('🏭'), 'ô Ưu tiên 🏭 có trong cảnh và bấm được');
  const afterPrio = await page.evaluate(() => window.__bp.S.sel.prio);
  check(afterPrio === 3, 'chọn Ưu tiên qua cảnh 3D (prio=' + afterPrio + ')');

  check(await clickIcon('⚖️'), 'ô Mức vận hành ⚖️ có trong cảnh và bấm được');
  const afterBud = await page.evaluate(() => window.__bp.S.sel.budget);
  check(afterBud === 1, 'chọn Mức vận hành qua cảnh 3D (budget=' + afterBud + ')');

  check(await clickIcon('🔒'), 'ô chốt 🔒 có trong cảnh và bấm được');
  const phase = await page.evaluate(() => window.__bp.S.phase);
  check(phase === 'evt', 'chốt quý từ cảnh 3D chuyển sang pha biến cố (phase=' + phase + ')');

  check(errors.length === 0, 'không có lỗi trang (' + errors.slice(0, 3).join(' | ') + ')');
} catch (e) {
  check(false, 'lỗi khi chạy kiểm thử: ' + e.message);
} finally {
  await browser.close();
}

if (failures.length) { console.log('\n' + failures.length + ' kiểm tra thất bại'); process.exit(1); }
console.log('\nTất cả kiểm tra đạt');
