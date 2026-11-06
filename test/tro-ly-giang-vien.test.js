'use strict';
// Trợ lý giảng viên duyệt nhận xét cuối vòng (docs/design/tro-ly-giang-vien.md §10).
// Phần 1 không cần trình duyệt: luật soạn trên 12 bản result_json mẫu, mẫu câu không đưa đáp án, chỗ trống được điền hết,
// và các mối nối tĩnh (migration, API, trang, feed của game, sw.js). Phần 2 mở trang thật ở 360 và 390 px.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const TL = require('../js/tro-ly-mau-cau.js');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';

// --- 1. 12 bản mẫu: đúng mã tín hiệu kỳ vọng ---
const FX = path.join(__dirname, 'fixtures', 'tro-ly');
const fixtures = fs.readdirSync(FX).filter(f => f.endsWith('.json')).sort();
assert.equal(fixtures.length, 12, 'cần đủ 12 bản mẫu');
const daPhu = new Set();
for (const f of fixtures) {
  const x = JSON.parse(fs.readFileSync(path.join(FX, f), 'utf8'));
  for (const lang of ['vi', 'en']) {
    const n = TL.soan(x.r, x.p, { lang });
    assert.equal(n.thieu, x.thieu, f + ' thiếu');
    assert.equal(n.hoi, x.hoi, `${f} (${lang}): câu hỏi`);
    assert.equal(n.ghiNhan, x.ghiNhan, `${f} (${lang}): ghi nhận`);
    assert.ok(!n.text.includes('{'), `${f} (${lang}): còn chỗ trống chưa điền: ${n.text}`);
    assert.ok(!/undefined|null|NaN/.test(n.text), `${f} (${lang}): lọt giá trị rỗng: ${n.text}`);
    if (!n.thieu) { assert.equal(n.canCu.mau_phien_ban, TL.MAU_PHIEN_BAN); assert.equal(n.canCu.hoi, x.hoi); }
  }
  [x.hoi, x.ghiNhan].forEach(m => m && daPhu.add(m));
}
for (const m of [...TL.RUI_RO, ...TL.TOT]) assert.ok(daPhu.has(m), 'bản mẫu chưa phủ ' + m);
assert.ok(fixtures.some(f => f.includes('vong-1')) && fixtures.some(f => f.includes('kieu-cu')) && fixtures.some(f => f.includes('sold-0')));

// Số liệu cụ thể trong câu (ví dụ ở §2 thiết kế), định dạng đúng theo thứ tiếng.
{
  const g1 = JSON.parse(fs.readFileSync(path.join(FX, '06-g1-thi-phan.json'), 'utf8'));
  assert.match(TL.soan(g1.r, g1.p, { lang: 'vi' }).text, /thị phần lên 31,2% từ 26,8%/);
  assert.match(TL.soan(g1.r, g1.p, { lang: 'en' }).text, /rose to 31\.2% from 26\.8%/);
  const r1 = JSON.parse(fs.readFileSync(path.join(FX, '01-r1-quick.json'), 'utf8'));
  assert.match(TL.soan(r1.r, r1.p, { lang: 'vi' }).text, /Quick ratio vòng 3 là 0,84/);
  const r2 = JSON.parse(fs.readFileSync(path.join(FX, '02-r2-hut-hang.json'), 'utf8'));
  assert.match(TL.soan(r2.r, r2.p, { lang: 'vi' }).text, /hụt 1\.240 sản phẩm/);
  assert.match(TL.soan(r2.r, r2.p, { lang: 'en' }).text, /short 1,240 units/);
}

// Giá trị biên: NaN / Infinity coi như thiếu; tất định (gọi hai lần ra cùng chữ).
{
  const r = { round: 2, share: 20, netProfit: 10, quickRatio: NaN, defect: Infinity, oee: 90 };
  const n = TL.soan(r, null, { lang: 'vi' });
  assert.equal(n.hoi, 'Q0'); assert.equal(n.ghiNhan, 'G0');
  assert.deepEqual(TL.soan(r, null, { lang: 'vi' }), n);
  assert.equal(TL.soan({ round: 1 }, null, { lang: 'vi' }).thieu, true);
  assert.equal(TL.soan(null, null, { lang: 'en' }).text, TL.THIEU.en);
}
// Ngưỡng chỉnh được: hạ ngưỡng quick thì R1 tắt.
assert.equal(TL.soan({ round: 2, quickRatio: 0.84, share: 20, netProfit: 5 }, null, { nguong: { quick: 0.8 } }).hoi, 'Q0');
// Xếp bảng: nhiều rủi ro trước, hoà thì quick thấp trước.
{
  const ds = [
    { team: 'B', nhap: { mucChuY: 1, quick: 1.2 } }, { team: 'A', nhap: { mucChuY: 0, quick: 0.5 } },
    { team: 'C', nhap: { mucChuY: 1, quick: 0.7 } }, { team: 'D', nhap: { mucChuY: 2, quick: null } },
  ].sort(TL.soSanh);
  assert.deepEqual(ds.map(x => x.team), ['D', 'C', 'B', 'A']);
}

// --- 2. Mẫu câu không đưa đáp án (§10.2) ---
for (const [ma, m] of Object.entries(TL.MAU)) for (const lang of ['vi', 'en']) {
  assert.ok(m[lang], ma + ' thiếu ' + lang);
  assert.ok(!/\bnên\b|hãy|should|phải đặt|must set/i.test(m[lang]), `${ma}.${lang} có lời khuyên chọn giúp: ${m[lang]}`);
}

// --- 3. Mối nối tĩnh ---
{
  const sql = read('supabase/migrations/20261106000000_class_feedback.sql');
  for (const s of ['create table if not exists public.class_feedback', 'enable row level security', 'bizon_feedback_send', 'bizon_feedback_set_state', 'bizon_feedback_class', "'feedback'", "interval '365 days'", 'explain_hidden'])
    assert.ok(sql.includes(s), 'migration thiếu ' + s);
  assert.match(sql, /revoke all on table public\.class_feedback from public, anon, authenticated/);
  const be = read('js/backend.js');
  assert.match(be, /rivalTopShare: Array\.isArray\(report\.rivals\)/);
  const api = read('js/instructor-api.js');
  for (const fn of ['bizon_feedback_class', 'bizon_feedback_send', 'bizon_feedback_set_state']) assert.ok(api.includes(fn), 'instructor-api thiếu ' + fn);
  const cs = read('js/class-sync.js');
  assert.match(cs, /j\.feedback/);
  const gv = read('Trang Giang Vien.dc.html');
  assert.ok(gv.includes('nhan-xet-vong.html?lop={{ code }}'), 'Trang Giảng viên chưa có lối sang bảng nhận xét');
  const page = read('nhan-xet-vong.html');
  assert.ok(page.includes('<script src="js/tro-ly-mau-cau.js"></script>'));
  assert.ok(page.includes('<meta name="robots" content="noindex">'));
  const sw = read('sw.js');
  assert.ok(sw.includes("'./nhan-xet-vong.html'") && sw.includes("'./js/tro-ly-mau-cau.js'"), 'sw.js chưa đệm trang mới');
  assert.ok(+sw.match(/bizon-v(\d+)/)[1] >= 794, 'chưa tăng số bộ nhớ đệm');
  const wf = read('.github/workflows/supabase-student-login.yml');
  assert.ok(wf.includes('test/sql/class_feedback_smoke.sql'), 'workflow chưa chạy test SQL');
}
console.log('tro-ly-giang-vien (tĩnh): OK');

// --- 4. Trình duyệt: chế độ dùng thử, 360 và 390 px ---
(async () => {
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
  const browser = await chromium.launch();
  try {
    for (const width of [360, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      const errs = []; page.on('pageerror', e => errs.push(e.message));
      await page.route(/googleapis|gstatic|goatcounter|gc\.zgo/, r => r.abort());
      await page.goto(BASE + '/nhan-xet-vong.html?demo=1', { waitUntil: 'load' });
      await page.waitForSelector('.nx-the', { timeout: 15000 });
      const n = await page.locator('.nx-the').count();
      assert.ok(n >= 5, 'dữ liệu mẫu phải có ≥ 5 đội, được ' + n);
      // Đội nhiều rủi ro nhất đứng đầu.
      const muc = await page.$$eval('.nx-the', els => els.map(e => +e.dataset.muc));
      assert.deepEqual(muc, [...muc].sort((a, b) => b - a), 'bảng phải xếp đội cần chú ý lên trước');
      const tran = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(tran <= 0, `${width}px: tràn ngang ${tran}px`);
      const nho = await page.$$eval('button, select, textarea', els => els.filter(e => e.offsetParent).map(e => [e.textContent.trim().slice(0, 20) || e.tagName, Math.round(e.getBoundingClientRect().height)]).filter(([, h]) => h < 44));
      assert.deepEqual(nho, [], `${width}px: nút thấp hơn 44px`);
      // Duyệt bản đầu: thành «đã gửi», có biên nhận phiên bản 1; sửa rồi gửi lại thành phiên bản 2.
      const dau = page.locator('.nx-the').first();
      const team = await dau.getAttribute('data-team');
      await dau.locator('textarea').fill('Ghi nhận: thử sửa.\nCâu hỏi thử?');
      await dau.locator('button.nx-duyet').click();
      const daGui = page.locator(`.nx-the[data-team="${team}"]`);
      await daGui.locator('.nx-trangthai[data-tt="da_gui"]').waitFor({ timeout: 5000 });
      assert.match(await daGui.locator('.nx-bien-nhan').textContent(), /v1/);
      await daGui.locator('button.nx-sua').click();
      await daGui.locator('textarea').fill('Bản sửa lần hai.');
      await daGui.locator('button.nx-duyet').click();
      await page.locator(`.nx-the[data-team="${team}"] .nx-bien-nhan`).filter({ hasText: 'v2' }).waitFor({ timeout: 5000 });
      // Thu hồi.
      await page.locator(`.nx-the[data-team="${team}"] button.nx-thuhoi`).click();
      await page.locator(`.nx-the[data-team="${team}"] .nx-trangthai[data-tt="thu_hoi"]`).waitFor({ timeout: 5000 });
      // Đổi ngôn ngữ soạn: bản nháp vẽ lại tiếng Anh.
      await page.selectOption('#nx-lang', 'en');
      await page.waitForFunction(() => [...document.querySelectorAll('.nx-the textarea')].some(t => /Well done|Noted/.test(t.value)));
      assert.deepEqual(errs, [], 'lỗi trang: ' + errs.join(' | '));
      await page.close();
    }
    // Phía đội: js/class-sync.js đọc khoá 'feedback' của bizon_class_feed và hiện thẻ nhận xét, một lần cho mỗi phiên bản.
    {
      const page = await browser.newPage({ viewport: { width: 360, height: 740 } });
      const errs = []; page.on('pageerror', e => errs.push(e.message));
      let feedback = [{ id: 'fb-1', round: 2, phien_ban: 1, noi_dung: 'Ghi nhận: thị phần lên 31,2%.\nQuick ratio 0,84: khoản nào làm tiền mặt hụt?', ngon_ngu: 'vi', da_sua: false, created_at: '2026-11-06T10:00:00Z' }];
      await page.route('**/__thu-class-sync.html', r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body:
        '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>t</title></head><body><script>window.BIZON_BACKEND={enabled:true,url:"https://x.supabase.co",anonKey:"k"};' +
        'window.S={profile:{classId:"LOP-1",teamName:"Đội A"},round:3,balance:0};window.save=function(){};window.renderAll=function(){};</script><script src="js/class-sync.js"></script></body></html>' }));
      await page.route('https://x.supabase.co/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ controls: null, grants: [], feedback }) }));
      await page.goto(BASE + '/__thu-class-sync.html');
      await page.evaluate(() => BizOnClassSync.tick());
      const the = page.locator('#bizon-class-feedback');
      await the.waitFor({ state: 'visible', timeout: 5000 });
      assert.match(await the.textContent(), /Nhận xét của giảng viên · vòng 2[\s\S]*Quick ratio 0,84/);
      await the.locator('button').click();
      await page.evaluate(() => BizOnClassSync.tick());
      assert.equal(await the.isVisible(), false, 'cùng phiên bản không hiện lại');
      feedback = [Object.assign({}, feedback[0], { id: 'fb-2', phien_ban: 2, noi_dung: 'Bản sửa.', da_sua: true })];
      await page.evaluate(() => BizOnClassSync.tick());
      await the.waitFor({ state: 'visible', timeout: 5000 });
      assert.match(await the.textContent(), /\(đã sửa\)[\s\S]*Bản sửa\./);
      const h = await the.locator('button').evaluate(b => b.getBoundingClientRect().height);
      assert.ok(h >= 44, 'nút Đóng thấp hơn 44px');
      assert.deepEqual(errs, [], 'lỗi trang: ' + errs.join(' | '));
      await page.close();
    }
  } finally { await browser.close(); }
  console.log('tro-ly-giang-vien (trình duyệt): OK');
})().catch(e => { console.error(e); process.exit(1); });
