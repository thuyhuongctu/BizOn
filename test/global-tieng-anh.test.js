// Go Global (global.html) song ngữ đầy đủ (16/11/2026): ở chế độ EN không còn chữ tiếng Việt trên màn chơi
// (thị trường, phương thức thâm nhập, đàm phán, biến cố quý, kết quả, đấu trường, báo cáo năm, hồ sơ CEO đối thủ),
// trừ tên riêng. Chế độ VI giữ nguyên chữ cũ. Đổi VI ↔ EN bằng nút trên menu thì vẽ lại ngay, không cần tải lại trang.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 891, 'sw.js ≥ v891');

// Chữ có dấu tiếng Việt (không tính é/è của tiếng Pháp trong «sans frontières»)
const VN = /[àáạảãâầấậẩẫăằắặẳẵẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
// Tên riêng được giữ nguyên ở bản tiếng Anh (cả tên game, địa danh ở menu/chân trang chung) và nhãn vốn đã song ngữ
const ALLOW = ["Je m'appelle Hương sans frontières", "Je m'appelle Hương", 'Đỗ Thùy Hương', 'Phan Anh Tú', 'Bật Nghiệp',
  'Bến Phù Sa', 'Hoàng Sa', 'Trường Sa', 'Minh Long', 'Cần Thơ', 'Việt Nam', 'Hương', 'Tú', 'Ngôn ngữ / Language'];
const strip = s => ALLOW.reduce((a, n) => a.split(n).join(''), s);

// Mọi nút chữ và thuộc tính đọc được (aria-label/title/alt/placeholder) của phần tử đang hiển thị
function collect() {
  const out = [];
  const vis = el => { if (!el) return false; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; return el.getClientRects().length > 0; };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const t = n.nodeValue.trim(); const p = n.parentElement;
    if (!t || !p || p.closest('script,style,noscript')) continue;
    if (vis(p)) out.push(t);
  }
  document.querySelectorAll('[aria-label],[title],[alt],[placeholder]').forEach(el => {
    if (!vis(el)) return;
    for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = el.getAttribute(a); if (v) out.push('@' + a + '=' + v); }
  });
  out.push('@document.title=' + document.title);
  return out;
}

(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async lang => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(lang + ': ' + e.message));
    await p.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); localStorage.setItem('bizon-music', 'off'); } catch (e) {} }, lang);
    await p.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await p.route(/coingecko|er-api/, r => r.abort());
    await p.goto(BASE + '/global.html?lang=' + lang, { waitUntil: 'load', timeout: 60000 });
    await p.waitForSelector('#market-cards button', { timeout: 15000 });
    await p.waitForTimeout(600);
    return { p, ctx };
  };
  const seen = new Map();
  const grab = async (p, step) => { for (const t of await p.evaluate(collect)) if (!seen.has(t)) seen.set(t, step); };
  // Chơi qua toàn bộ luồng: hồ sơ → thị trường → phương thức → đàm phán → 4 quý → đấu trường → kết quả → báo cáo năm
  const play = async (p, grabIt) => {
    await p.click('#prof-tech button:nth-child(2)'); await p.click('#prof-exp button:nth-child(2)');
    await p.click('#market-cards button:nth-child(1)'); await p.waitForTimeout(300);
    if (grabIt) await grab(p, 'thị trường + phương thức');
    await p.click('#mode-cards button[onclick*="\'jv\'"]'); await p.waitForTimeout(300);
    if (grabIt) await grab(p, 'quý 1 (trước đàm phán)');
    await p.click('#g-nego button:nth-child(2)'); await p.waitForTimeout(200);
    for (let q = 1; q <= 4; q++) {
      if (grabIt) await grab(p, 'quý ' + q);
      await p.click('button[onclick="gCommit()"]'); await p.waitForTimeout(250);
    }
    await p.waitForSelector('#ga-next', { timeout: 5000 }); await p.waitForTimeout(2400);
    if (grabIt) await grab(p, 'đấu trường');
    await p.click('#ga-next'); await p.waitForTimeout(300);
    if (grabIt) await grab(p, 'kết quả');
    await p.click('#sec-result button[onclick="gAnnual()"]'); await p.waitForTimeout(300);
    if (grabIt) await grab(p, 'báo cáo năm');
  };
  const vietnamese = () => [...seen].filter(([t]) => VN.test(strip(t))).map(([t, s]) => `[${s}] ${t}`);
  try {
    // 1. EN: không còn chữ tiếng Việt ngoài tên riêng
    const en = await open('en');
    await grab(en.p, 'mở trang');
    await play(en.p, true);
    // Chơi ván thứ hai ở thị trường khác với phương thức khác: biến cố và lời Lumina khác
    await en.p.click('#market-cards button:nth-child(4)'); await en.p.waitForTimeout(300);
    await en.p.click('#mode-cards button[onclick*="\'export\'"]'); await en.p.waitForTimeout(300);
    for (let q = 1; q <= 4; q++) { await grab(en.p, 'ván 2 quý ' + q); await en.p.click('button[onclick="gCommit()"]'); await en.p.waitForTimeout(250); }
    await en.p.waitForSelector('#ga-next', { timeout: 5000 }); await en.p.waitForTimeout(2400);
    await grab(en.p, 'ván 2 đấu trường'); await en.p.click('#ga-next'); await en.p.waitForTimeout(300);
    await grab(en.p, 'ván 2 kết quả');
    await en.p.click('#sec-result button[onclick="gAnnual()"]'); await en.p.waitForTimeout(300);
    await grab(en.p, 'ván 2 báo cáo năm');
    const left = vietnamese();
    assert.deepEqual(left, [], 'EN còn chữ tiếng Việt:\n' + left.join('\n'));
    const texts = [...seen.keys()].join('\n');
    for (const s of ['Southeast Asia', 'Joint venture', 'Exporting', 'Your team 🇻🇳', 'Counter:', 'Tariff', 'Digital readiness'])
      assert.ok(texts.includes(s), 'EN thiếu «' + s + '»');
    assert.ok(await en.p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'EN tràn ngang ở 390 px');

    // 2. Đổi sang VI bằng nút menu (không tải lại): bảng đang hiện vẽ lại bằng tiếng Việt, rồi đổi về EN lại sạch
    await en.p.evaluate(() => window.clayApplyLang('vi')); await en.p.waitForTimeout(500);
    const viNow = await en.p.evaluate(() => document.getElementById('market-cards').textContent + document.getElementById('rivals-global').textContent + document.getElementById('sec-annual').textContent + document.getElementById('sec-result').textContent);
    for (const s of ['Đông Nam Á', 'Đội của bạn', 'Khắc chế', 'Báo cáo Tổng kết Năm', 'Thị phần trung bình']) assert.ok(viNow.includes(s), 'đổi sang VI thiếu «' + s + '»');
    await en.p.evaluate(() => window.clayApplyLang('en')); await en.p.waitForTimeout(500);
    seen.clear(); await grab(en.p, 'đổi lại EN');
    const left2 = vietnamese();
    assert.deepEqual(left2, [], 'đổi lại EN còn chữ tiếng Việt:\n' + left2.join('\n'));
    await en.ctx.close();

    // 3. VI: giữ nguyên chữ gốc
    const vi = await open('vi');
    await play(vi.p, false);
    const viText = await vi.p.evaluate(() => document.body.innerText);
    for (const s of ['Đông Nam Á', 'Xuất khẩu', 'Liên doanh', 'Đội của bạn 🇻🇳', 'XƯỞNG LINH VẬT ĐẤT SÉT VIỆT', 'Quy mô 110k sp · Thuế 5% · Số hóa 85%', 'Thị phần trung bình', 'Lumina Mentor – góc lý thuyết', 'Báo cáo Tổng kết Năm'])
      assert.ok(viText.includes(s), 'VI thiếu «' + s + '»');
    await vi.ctx.close();

    assert.deepEqual(errs, [], 'lỗi JS');
    console.log('global-tieng-anh: ok');
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
