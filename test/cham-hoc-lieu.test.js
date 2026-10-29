// Bộ học liệu CHAM (29/10/2026): dựng lại gói bản mẫu «Bizonland clay style mockups» thành các trang song ngữ trong cham/.
// Phần thuần (mô hình 5 năm, máy tính hòa vốn, engine Đấu trường, mã kết quả) test bằng Node; các trang test bằng trình duyệt
// (điện thoại 390 px, VI và EN, không lỗi, không tràn ngang) và vài luồng chính (trò chơi → bảng điều khiển, đặt phòng).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const E = require(path.join(ROOT, 'js/cham-engine.js'));
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, msg + ': ' + a + ' ≠ ' + b);

// --- Mô hình 5 năm khớp bảng tài chính của kế hoạch gốc ---
const plan = E.founderModel(E.PLAN);
near(plan.rev1, 1761, 0.01, 'doanh thu năm 1'); near(plan.y1, 882.5, 0.1, 'lợi nhuận năm 1');
near(plan.pb, 0.4796, 0.0001, 'hòa vốn theo công thức kế hoạch (500 / 1.042,5)');
assert.deepEqual(plan.years.map(y => Math.round(y.profit * 10) / 10), [882.5, 1538.6, 1366.9, 1533.7, 1530.5]);
assert.equal(plan.payYear, 1);
const real = E.founderModel(Object.assign({}, E.PLAN, { cap: 4000 }));
near(real.pb, 3.84, 0.01, 'hòa vốn trên 4 tỷ'); assert.equal(real.payYear, 3, 'dòng tiền lũy kế vượt 4 tỷ trong năm 3');
assert.ok(E.founderModel(Object.assign({}, E.PLAN, { demand: 'season' })).y1 < plan.y1 - 400, 'mất 1/4 khách giảm lợi nhuận ≈ 420 tr');
near(E.founderModel(Object.assign({}, E.PLAN, { staff: 'paid' })).y1, plan.y1 - 384, 0.01, 'lương quản lý +384');

// --- Mã kết quả: khứ hồi, tính lại từ lựa chọn, đọc được mã của bản mẫu cũ ---
const r = E.resultOf('Nhóm Ánh Dương', Object.assign({}, E.PLAN, { room: 500 }));
assert.deepEqual(E.decodeResult(E.encodeResult(r)), r);
const forged = Buffer.from(JSON.stringify({ name: 'Gian', cash: 999999, pay: 1, c: E.PLAN })).toString('base64');
assert.equal(E.decodeResult(forged).cash, Math.round(plan.years[4].cum), 'mã sửa tay không đổi được dòng tiền');
assert.equal(E.decodeResult('khong-phai-ma'), null);
assert.equal(E.decodeResult(Buffer.from(JSON.stringify({ name: 'x', c: Object.assign({}, E.PLAN, { room: 123 }) })).toString('base64')), null, 'lựa chọn lạ bị loại');
const many = E.decodeMany(E.encodeResult(r) + '\n  rác \n' + forged);
assert.equal(many.ok.length, 2); assert.equal(many.bad.length, 1);
assert.equal(E.resultOf('x'.repeat(80), E.PLAN).name.length, 40);

// --- Máy tính hòa vốn ---
const k = E.kitCalc(E.KIT_DEFAULT);
near(k.rev, 1761, 0.01, 'kit doanh thu'); near(k.years, 0.4795, 0.001, 'kit hòa vốn');
assert.equal(E.kitCalc(Object.assign({}, E.KIT_DEFAULT, { cost: 3000 })).years, null);

// --- Đấu trường: tất định, đủ 6 vòng, mùa nước làm giảm khách ---
const play = () => { let S = E.arenaInit(); for (let i = 0; i < E.ROUNDS; i++) S = E.arenaSubmit(S); return S; };
const a1 = play(), a2 = play();
assert.deepEqual(a1.cum, a2.cum, 'cùng quyết định cho cùng kết quả');
assert.equal(a1.round, 7); assert.equal(a1.history.length, 6);
assert.ok(a1.history[2].res[0].vis < a1.history[1].res[0].vis * 0.5, 'mùa nước nổi ít khách hơn hè');
a1.history.forEach(h => near(h.res.reduce((s, x) => s + x.share, 0), 1, 1e-9, 'thị phần cộng 100%'));
assert.equal(E.arenaSubmit(a1), a1, 'hết 6 vòng thì không chạy thêm');
let cheap = E.arenaInit(); cheap.dec.room = 50; assert.ok(E.arenaHints(cheap).includes('planPrice'));
assert.equal(E.RIVALS.find(x => x.id === 'camlua').room, 350, 'Cẩm Lụa: điểm giữa 250–450 nghìn');

// --- Trang: giấy phép, noindex, không ®, lối vào ---
const PAGES = ['cham/index.html', 'cham/ke-hoach-2017.html', 'cham/website.html', 'cham/mot-ngay.html', 'cham/tro-choi.html', 'cham/bang-dieu-khien.html',
  'cham/tham-dinh.html', 'cham/bo-cong-cu.html', 'cham/bai-giang.html', 'cham/dau-truong.html', 'thu-vien-tinh-huong.html'];
for (const p of PAGES) {
  const s = read(p);
  assert.ok(s.includes('<meta name="robots" content="noindex">'), p + ': noindex');
  assert.ok(s.includes('© 2017–2026 Đỗ Thùy Hương, dùng trên BizOn theo giấy phép không độc quyền'), p + ': dòng giấy phép');
  assert.ok(!/®/.test(s), p + ': chưa có văn bằng, không dùng ®');
  assert.ok(s.includes('bizon-clay-i18n.js') && s.includes('bizon-clay-nav.js') && s.includes('cham-clay.css'), p + ': khung chung');
  for (const m of s.matchAll(/(?:src|href)="(\.\.\/)?((?:js|css|assets)\/[^"?#]+)"/g)) assert.ok(fs.existsSync(path.join(ROOT, m[2])), p + ': thiếu ' + m[2]);
}
assert.ok(!fs.readdirSync(path.join(ROOT, 'cham')).some(f => /\.pdf$|ksdn/i.test(f)), 'không đưa tệp kế hoạch 2017 lên kho');
assert.ok(read('giang-vien.html').includes('href="cham/"'), 'trang giảng viên chưa có lối vào');
assert.ok(read('cham-homestay.html').includes('href="cham/"'), 'trang tình huống 2026 chưa trỏ sang bộ học liệu');
assert.ok(read('cham/website.html').includes('không nhận đặt phòng'), 'website mẫu phải ghi rõ là bản mẫu');
assert.ok(read('THIRD-PARTY-NOTICES.md').includes('`js/vendor/qrcode.js`'));
assert.ok(read('docs/ho-so-so-huu-tri-tue.md').includes('docs/cham/README.md'));
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 707);

(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (p, lang, w) => {
    const pg = await b.newPage({ viewport: { width: w || 390, height: 844 } });
    pg.on('pageerror', e => errs.push(p + ' ' + lang + ': ' + e.message));
    await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/' + p, { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(500);
    return pg;
  };
  try {
    for (const p of PAGES) for (const lang of ['vi', 'en']) {
      const pg = await open(p, lang);
      assert.equal(await pg.evaluate(() => document.documentElement.lang), lang, p + ': ngôn ngữ');
      assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), p + ' ' + lang + ': tràn ngang trên điện thoại');
      assert.ok((await pg.textContent('main')).trim().length > 200, p + ' ' + lang + ': trang trống');
      await pg.close();
    }
    // Trò chơi: đi hết 7 quyết định, lưu điểm, bảng điều khiển đọc được
    let pg = await open('cham/tro-choi.html', 'en');
    await pg.click('[data-act=start]');
    for (let i = 0; i < 7; i++) { if (i === 6) await pg.click('[data-pick="1"]'); await pg.click('[data-act=next]'); }
    assert.equal(await pg.textContent('#fg h2'), 'You recover the investment in year 3.');
    await pg.fill('#fg-team', 'Team Lotus'); await pg.click('[data-act=save]');
    const code = await pg.textContent('#fg-code');
    await pg.goto(BASE + '/cham/bang-dieu-khien.html'); await pg.waitForTimeout(400);
    assert.ok((await pg.textContent('#db-teams')).includes('Team Lotus'));
    await pg.fill('#db-paste', code + '\nrubbish'); await pg.click('#db-add');
    assert.match(await pg.textContent('#db-status'), /1 team\(s\) added\. Skipped 1/);
    await pg.close();
    // Website: đặt 2 phòng × 2 đêm + bữa tối 2 khách = 2.240.000 đ
    pg = await open('cham/website.html#dat-phong', 'vi');
    await pg.click('#ws-step [data-step="bRooms"][data-d="1"]'); await pg.click('#ws-step [data-step="bNights"][data-d="1"]');
    for (let i = 0; i < 3; i++) await pg.click('#ws-step [data-book=next]');
    await pg.waitForTimeout(200);
    assert.equal(await pg.evaluate(() => location.hash), '#xac-nhan');
    assert.ok((await pg.textContent('#ws-conf')).includes('2.240.000 đ'));
    await pg.close();
    // Thẩm định: ghi chú riêng được lưu lại
    pg = await open('cham/tham-dinh.html', 'vi');
    await pg.fill('#rv-draft', 'Hỏi lại giá phòng'); await pg.click('#rv-add'); await pg.reload(); await pg.waitForTimeout(400);
    assert.ok((await pg.textContent('#rv-mine')).includes('Hỏi lại giá phòng'));
    assert.equal(await pg.$$eval('#rv-print .rv-psec', l => l.length), 6, 'bản in đủ sáu phần');
    await pg.close();
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('cham-hoc-lieu: ok');
})().catch(e => { console.error(e); process.exit(1); });
