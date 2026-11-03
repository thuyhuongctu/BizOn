// Màn hình lớp học (03/11/2026): một trang chiếu cho giảng viên, ghép ba hướng phác thảo
// (A sa bàn Bến Phù Sa, B quần đảo 7 thị trường Hộ Chiếu Thương Hiệu, C dòng phù sa 8 chặng Hộ Chiếu Sầu Riêng).
// 1. Bộ chuyển dữ liệu: gộp theo tên, xếp hạng, đếm thị trường, chỉ tính Sầu Riêng đã xong Bậc 3, không lộ email.
// 2. Trang: noindex, lối vào từ Trang Giảng viên, sw.js có tệp mới.
// 3. Trình duyệt (dữ liệu minh họa): ba cảnh dựng không lỗi, đổi trò, đổi ngày/đêm, chưa đăng nhập thì hiện hộp nhắc.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const D = require('../js/man-hinh-lop-hoc-data.js');

// ---- 1. Bến Phù Sa: một dòng tốt nhất mỗi nhóm, xếp giảm dần, nhóm đầu đi hết tuyến
{
  const d = D.fromFt([
    { team_name: 'Đội A', total_revenue: 500, efficiency: 70, final_rank: 2 },
    { team_name: 'đội a', total_revenue: 650, efficiency: 75, final_rank: 1 },
    { team_name: 'Đội B', total_revenue: 325, efficiency: 50 },
    { team_name: '', player_name: 'sv01@student.ctu.edu.vn', total_revenue: 100 },
  ]);
  assert.equal(d.submitted, 4);
  assert.deepEqual(d.teams.map(t => t.name), ['đội a', 'Đội B', 'sv01']);
  assert.equal(d.teams[0].progress, 1); assert.equal(d.teams[1].progress, 0.5); assert.equal(d.teams[0].rank, 1);
  assert.ok(d.teams[0].label.includes('650') && d.teams[0].sub.includes('hạng ván 1'));
  assert.ok(!JSON.stringify(d).includes('@'), 'không chiếu email lên màn hình');
}
// ---- Hộ Chiếu Thương Hiệu: đếm doanh nghiệp đã vào từng thị trường (thứ tự S.entered của brand-passport.html)
{
  assert.deepEqual(D.BP_MARKETS, ['Hải Lam', 'Bắc Phong', 'Kim Sa', 'Lục Đảo', 'Nhật Quang', 'Tân Cảng', 'Hỏa Sơn']);
  const bp = read('brand-passport.html');
  D.BP_MARKETS.forEach((m, i) => assert.ok(new RegExp("id: " + i + ", key: '[a-z]+', icon: '[^']+', name: '" + m + "'").test(bp), 'thị trường ' + i + ' phải là ' + m));
  const d = D.fromBp([
    { company: 'Mekong Digital', player_name: 'Lan', total_score: 80, detail_json: { markets: [1, null, 2, null, null, 3, null] } },
    { company: 'Lam Việt', player_name: 'Minh', total_score: 60, detail_json: { markets: [2, 1, null, null, null, null, null] } },
    { company: 'Mộc Nhiên', total_score: 40, detail_json: {} },
  ]);
  assert.deepEqual(d.markets.map(m => m.count), [2, 1, 1, 0, 0, 1, 0]);
  assert.equal(d.teams[0].name, 'Mekong Digital · Lan'); assert.equal(d.teams[0].progress, 0.8); assert.equal(d.teams[0].sub, '3 / 7 thị trường');
  assert.equal(d.teams[2].sub, '0 / 7 thị trường');
}
// ---- Hộ Chiếu Sầu Riêng: chỉ nhóm chơi qua Hành trình và xong Bậc 3 biến thể durian; chặng 0–7 theo điểm
{
  const d = D.fromJourney([
    { team_name: 'N1', passport: { tiers: { t3: { status: 'done', variant: 'durian', total: 100, channelOrder: ['DOM', 'cn', 'XX'] } } } },
    { team_name: 'N2', passport: { tiers: { t3: { status: 'done', variant: 'durian', total: 12 } } } },
    { team_name: 'N3', passport: { tiers: { t3: { status: 'playing', variant: 'durian' } } } },
    { team_name: 'N4', passport: { tiers: { t3: { status: 'done', variant: 'brand', total: 90 } } } },
    { team_name: 'N5', passport: null },
  ]);
  assert.equal(d.submitted, 2); assert.deepEqual(d.playing, ['N3']);
  assert.equal(d.teams[0].stage, 7); assert.equal(d.teams[1].stage, 0);
  assert.deepEqual(d.teams[0].channels, ['DOM', 'CN']); assert.equal(d.teams[0].sub, 'Nội địa, Trung Quốc chính ngạch');
}
// ---- Dữ liệu minh họa: cố định, đủ 10 nhóm
for (const g of ['bps', 'hcth', 'hcsr']) assert.deepEqual(D.demo(g), D.demo(g), 'minh họa không ngẫu nhiên: ' + g);
assert.equal(D.demo('bps').teams.length, 10); assert.equal(D.demo('hcth').teams.length, 10);
assert.equal(D.demo('hcsr').teams.length, 9); assert.equal(D.demo('hcsr').playing.length, 1);

// ---- 2. Trang, lối vào, service worker
const page = read('man-hinh-lop-hoc.html');
assert.ok(page.includes('<meta name="robots" content="noindex">'), 'trang giảng viên không lập chỉ mục');
for (const s of ['js/backend-config.js', 'js/instructor-api.js', 'js/man-hinh-lop-hoc-data.js', './js/man-hinh-lop-hoc.js']) assert.ok(page.includes(s), 'trang nạp ' + s);
assert.ok(read('js/man-hinh-lop-hoc.js').includes("from '../vendor/three/three.module.js'"), 'dùng three.js có sẵn trong kho');
assert.ok(/async ftBoard\(code\)[^\n]*ft_class_leaderboard/.test(read('js/instructor-api.js')));
assert.ok(read('Trang Giang Vien.dc.html').includes('href="man-hinh-lop-hoc.html?lop={{ code }}"'), 'lối vào từ Trang Giảng viên');
const sw = read('sw.js');
assert.ok(+(sw.match(/bizon-v(\d+)/) || [])[1] >= 753);
for (const f of ['./man-hinh-lop-hoc.html', './js/man-hinh-lop-hoc.js', './js/man-hinh-lop-hoc-data.js']) assert.ok(sw.includes("'" + f + "'"), 'sw.js thiếu ' + f);

// ---- 3. Trình duyệt
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  const open = async (q, vp = { width: 1920, height: 1080 }) => {
    const pg = await b.newPage({ viewport: vp });
    pg.on('pageerror', e => errs.push(q + ': ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push(q + ': ' + m.text()); });
    await pg.route(/\.(woff2?|mp3|mp4)(\?|$)/, r => r.abort());
    await pg.goto(BASE + '/man-hinh-lop-hoc.html?' + q, { waitUntil: 'load', timeout: 60000 });
    return pg;
  };
  try {
    const want = { bps: { rows: 10, sel: '#tags .lab', n: 5, night: false }, hcth: { rows: 10, sel: '#tags .lab', n: 8, night: true }, hcsr: { rows: 9, sel: '#tags .st', n: 8, night: false } };
    for (const [g, w] of Object.entries(want)) {
      const pg = await open('demo=1&game=' + g);
      await pg.waitForFunction(s => document.querySelectorAll(s).length > 0, w.sel, { timeout: 30000 });
      assert.equal(await pg.locator(w.sel).count(), w.n, g + ': số nhãn/thẻ trên sa bàn');
      assert.equal(await pg.locator('#rank li').count(), w.rows, g + ': bảng xếp hạng');
      assert.equal(await pg.locator('#demoChip').isVisible(), true, g + ': ghi rõ dữ liệu minh họa');
      assert.equal(await pg.evaluate(() => document.body.classList.contains('night')), w.night, g + ': chế độ mặc định');
      assert.equal(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, g + ': không tràn ngang');
      await pg.close();
    }
    // Đổi trò và ngày/đêm ngay trên trang
    const pg = await open('demo=1&game=bps');
    await pg.waitForSelector('#tags .lab');
    await pg.click('#night'); assert.ok(await pg.evaluate(() => document.body.classList.contains('night')));
    await pg.click('.tabs button[data-game="hcsr"]');
    await pg.waitForFunction(() => document.querySelectorAll('#tags .st').length === 8, null, { timeout: 30000 });
    assert.equal(await pg.getAttribute('.tabs button[data-game="hcsr"]', 'aria-pressed'), 'true');
    assert.ok(pg.url().includes('game=hcsr'), 'URL giữ trò đang chiếu');
    assert.ok((await pg.textContent('#strip')).includes('Đang chơi Bậc 3'));
    await pg.close();
    // Máy chiếu 1280×720
    const sm = await open('demo=1&game=hcth', { width: 1280, height: 720 });
    await sm.waitForSelector('#tags .lab');
    assert.equal(await sm.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, '1280px: không tràn ngang');
    await sm.close();
    // Chưa đăng nhập giảng viên: hộp nhắc + lối thử dữ liệu minh họa
    const g = await open('game=bps');
    await g.waitForSelector('#gate.on');
    assert.equal(await g.getAttribute('#gate a', 'href'), 'Trang%20Giang%20Vien.dc.html');
    await g.click('#tryDemo');
    await g.waitForFunction(() => document.querySelectorAll('#rank li').length === 10, null, { timeout: 30000 });
    assert.equal(await g.locator('#gate.on').count(), 0);
    await g.close();
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('man-hinh-lop-hoc: ok');
})().catch(e => { console.error(e); process.exit(1); });
