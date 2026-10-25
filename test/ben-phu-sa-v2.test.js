/* Bến Phù Sa · bản gọn (ben-phu-sa-v2.html + js/bps2-ui.js) chạy engine ben-phu-sa.html trong iframe ẩn (?embed=1).
 * Kiểm tra: (1) chế độ nhúng ẩn giao diện, bỏ cổng đăng nhập, có cửa sổ ftTest; (2) đi trọn 5 tuần qua giao diện bản
 * gọn – chọn đội/thuyền trưởng, Món → Địa điểm → Cách bán, mua & dùng Thám tử chợ, dự báo, chốt, thẻ kết quả, lễ cúng
 * Bà Cậu sau tuần 2, màn Kết thúc của engine hiện từ iframe; (3) đổi ngôn ngữ; (4) điện thoại không tràn ngang; (5)
 * không lỗi JS. Cần máy chủ tĩnh BIZON_URL. */
'use strict';
const path = require('path');
const fs = require('fs');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { try { chromium = require(path.join(process.env.HOME || '', '.cache', 'playwright-core')).chromium; } catch (e3) { console.error('Cần playwright'); process.exit(1); } }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const eng = read('ben-phu-sa.html'), v2 = read('ben-phu-sa-v2.html'), ui = read('js/bps2-ui.js'), sw = read('sw.js');
check(/classList\.add\('ft-embed'\)/.test(eng) && /\.ft-embed main>\*:not\(#ft-end\)\{display:none!important\}/.test(eng), 'ben-phu-sa.html: chế độ ?embed=1 ẩn mọi thứ trừ #ft-end');
check(/\} else Game3DGate\.mount\(\{ introId: 'ft-intro'/.test(eng), 'ben-phu-sa.html: nhúng thì bỏ cổng đăng nhập');
for (const k of ['data', 'state', 'phase', 'forecast', 'demand', 'logs', 'weekLogs', 'rivals', 'shop', 'rulesHtml']) check(new RegExp('^    ' + k + ': function', 'm').test(eng), 'ftTest.' + k + '() có mặt');
check(/function forecastRange\(\)/.test(eng) && /var fr = forecastRange\(\);/.test(eng), 'dự báo tách thành forecastRange() dùng chung');
check(/ben-phu-sa-v2\.html/.test(eng), 'ben-phu-sa.html: màn giới thiệu dẫn sang bản gọn');
check(/id="bps2-engine"/.test(v2) && /js\/bps2-ui\.js/.test(v2) && /css\/bn2\.css/.test(v2) && /css\/bp2\.css/.test(v2) && /css\/bps2\.css/.test(v2), 'ben-phu-sa-v2.html: iframe engine + bps2-ui + bn2/bp2/bps2.css');
check(!/share\(|menuAdj|D\[menu\]/.test(ui), 'js/bps2-ui.js: không chứa công thức mô phỏng');
check(/'\.\/ben-phu-sa-v2\.html'/.test(sw) && /'\.\/js\/bps2-ui\.js'/.test(sw) && /'\.\/css\/bps2\.css'/.test(sw), 'sw.js: bản gọn nằm trong SHELL');
check(read('index.html') === read('academia3d-v2.html') && /ben-phu-sa-v2\.html/.test(read('index.html')) && /ben-phu-sa-v2\.html/.test(read('js/games-clay.js')), 'trang chủ (= academia3d-v2) và games.html có liên kết bản gọn');

(async () => {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); } catch (e) {} });
    await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());

    await page.goto(BASE + '/ben-phu-sa.html?embed=1', { waitUntil: 'commit', timeout: 60000 });
    await page.waitForFunction(() => !!window.ftTest && typeof window.ftTest.data === 'function', null, { timeout: 60000 });
    await page.waitForTimeout(500);
    const em = await page.evaluate(() => ({ embed: window.ftTest.embed(), header: getComputedStyle(document.querySelector('header')).display, gate: !!document.getElementById('g3d-gate'), d: window.ftTest.data(), phase: window.ftTest.phase() }));
    check(em.embed && em.header === 'none' && !em.gate && em.phase === 'intro', 'nhúng: header ẩn, không có cổng đăng nhập, pha intro');
    check(em.d.MENUS.length === 3 && em.d.LOCS.length === 6 && em.d.METHODS.length === 3 && em.d.RIVALS.length === 3 && em.d.SHOP_ITEMS.length === 5, 'nhúng: data() có 3 món, 6 địa điểm, 3 cách bán, 3 đối thủ, 5 vật phẩm');

    await page.goto(BASE + '/ben-phu-sa-v2.html', { waitUntil: 'commit', timeout: 60000 });
    await page.waitForFunction(() => window.BPS2 && BPS2.ready(), null, { timeout: 60000 });
    await page.fill('input[name=team]', 'Đội Thử');
    await page.click('[data-act=cap][data-v="2"]');
    const kept = await page.evaluate(() => ({ team: document.querySelector('input[name=team]').value, on: document.querySelector('[data-act=cap][data-v="2"]').classList.contains('on') }));
    check(kept.team === 'Đội Thử' && kept.on, 'màn mở đầu: chọn thuyền trưởng không làm mất tên đội đã gõ');
    await page.click('#bps2-login button[type=submit]');
    await page.waitForSelector('[data-act=commit]', { timeout: 20000 });
    const s0 = await page.evaluate(() => { const A = BPS2.engine().ftTest; return { st: A.state(), ph: A.phase(), team: localStorage.getItem('bps-team'), name: A.teamName(), disabled: document.querySelector('[data-act=commit]').disabled, fc: A.forecast() }; });
    check(s0.ph === 'play' && s0.st.week === 0 && s0.st.cap === 2 && s0.team === 'Đội Thử' && s0.name === 'Đội Thử', 'bắt đầu: tuần 1, thuyền trưởng thứ 3, tên đội lưu và engine đọc được');
    check(s0.disabled && s0.fc === null, 'chưa chọn gì thì chưa chốt được, chưa có dự báo');
    await page.click('[data-act=menu][data-v="0"]'); await page.click('[data-act=loc][data-v="2"]'); await page.click('[data-act=method][data-v="1"]');
    const s1 = await page.evaluate(() => { const A = BPS2.engine().ftTest; return { sel: A.state().sel, fc: A.forecast(), fcCells: document.querySelectorAll('.bn2-fc div').length, disabled: document.querySelector('[data-act=commit]').disabled }; });
    check(s1.sel.menu === 0 && s1.sel.loc === 2 && s1.sel.m === 1, 'lựa chọn vào đúng S.sel của engine: ' + JSON.stringify(s1.sel));
    check(s1.fc && !s1.fc.known && s1.fc.hi > s1.fc.lo && s1.fc.cost === 0 && s1.fcCells === 2 && !s1.disabled, 'dự báo gánh hàng rong: dải rộng (chưa biết), phí 0, nút Chốt mở');
    await page.click('[data-act=commit]'); await page.waitForSelector('[data-act=next]');
    const r1 = await page.evaluate(() => { const A = BPS2.engine().ftTest; const st = A.state(); return { week: st.week, hist: st.history.length, known: Object.keys(st.knownPairs), kpis: document.querySelectorAll('.bn2-kpi').length, flag: document.querySelector('.bn2-flag').textContent.trim(), rivals: document.querySelectorAll('.bps2-result .bps2-rank .row').length, news: document.querySelectorAll('.bps2-result .bps2-news li').length }; });
    check(r1.week === 1 && r1.hist === 1 && r1.known.join() === '0-2' && r1.kpis === 4 && r1.rivals === 3 && r1.news >= 3, 'thẻ kết quả tuần 1: 4 ô KPI, 3 đối thủ, tin nghe ngóng; cặp đã biết 0-2 («' + r1.flag + '»)');
    await page.click('[data-act=next]'); await page.waitForSelector('[data-act=commit]');
    const n2 = await page.evaluate(() => document.querySelectorAll('.bps2-news li').length);
    check(n2 >= 3, 'tuần 2: tin nghe được tuần trước hiện đầu thẻ (' + n2 + ' dòng)');
    // Thám tử chợ: mua rồi dùng cho cặp đang chọn → ô địa điểm hiện ✓ kèm nhu cầu; dự báo thu hẹp
    await page.click('[data-act=adv]'); await page.waitForSelector('[data-act=buy][data-v="SCOUT"]');
    await page.click('[data-act=buy][data-v="SCOUT"]');
    await page.click('[data-act=menu][data-v="1"]'); await page.click('[data-act=loc][data-v="3"]');
    await page.click('[data-act=use][data-v="SCOUT"]');
    await page.click('[data-act=method][data-v="0"]');
    const s2 = await page.evaluate(() => { const A = BPS2.engine().ftTest; const st = A.state(); return { budget: st.budget, total: st.total, known: !!st.knownPairs['1-3'], tag: (document.querySelector('[data-act=loc][data-v="3"] .tag') || {}).textContent, fc: A.forecast(), note: (document.querySelector('.bp2-note') || {}).textContent || '' }; });
    check(Math.abs(s2.budget - 1.1) < 1e-9 && s2.known && /✓/.test(s2.tag || '') && s2.fc && s2.fc.known && s2.fc.cost === 1.5, 'Thám tử chợ: vốn riêng 1,5 → 1,1, cặp 1-3 hiện ✓ với nhu cầu, dự báo ghe hẹp lại và trừ phí 1,5');
    await page.click('[data-act=commit]'); await page.waitForSelector('[data-act=next]');
    const ph2 = await page.evaluate(() => BPS2.engine().ftTest.phase());
    check(ph2 === 'ritual', 'sau tuần 2 engine sang lễ cúng Bà Cậu');
    await page.click('[data-act=next]'); await page.waitForSelector('[data-act=ritual]');
    await page.click('[data-act=ritual][data-v="1"]'); await page.waitForSelector('[data-act=commit]');
    const r3 = await page.evaluate(() => { const A = BPS2.engine().ftTest; return { ph: A.phase(), done: A.state().ritualDone, log: /Bà Cậu/.test(A.logs(1)[0] || ''), txt: document.querySelector('#bps2-dec-h').textContent }; });
    check(r3.ph === 'play' && r3.done && r3.log && /tuần 3/i.test(r3.txt), 'lễ cúng ghi nhật ký, không tính điểm → sang tuần 3');
    for (let w = 2; w < 5; w++) {
      await page.click('[data-act=menu][data-v="2"]'); await page.click('[data-act=loc][data-v="4"]'); await page.click('[data-act=method][data-v="0"]');
      await page.click('[data-act=commit]'); await page.waitForSelector('[data-act=next]');
      await page.click('[data-act=next]');
      if (w < 4) await page.waitForSelector('[data-act=commit]');
    }
    await page.waitForFunction(() => { const f = document.getElementById('bps2-engine'); return f && !f.hidden && parseInt(f.style.height || '0', 10) > 200; }, null, { timeout: 15000 });
    const end = await page.evaluate(() => { const w = BPS2.engine(); const d = w.document; return { ph: w.ftTest.phase(), hist: w.ftTest.state().history.length, endVisible: getComputedStyle(d.getElementById('ft-end')).display !== 'none', playHidden: getComputedStyle(d.getElementById('ft-play')).display === 'none', eff: d.getElementById('ft-eff').textContent, again: !!document.querySelector('[data-act=again]') }; });
    check(end.ph === 'end' && end.hist === 5 && end.endVisible && end.playHidden && /Hiệu suất \d+%/.test(end.eff) && end.again, 'hết 5 tuần: iframe hiện màn Kết thúc của engine («' + end.eff + '»)');
    await page.click('[data-act=lang]');
    const en = await page.evaluate(() => ({ lang: localStorage.getItem('bizon-lang'), h: document.querySelector('#bps2-main .bn2-eyebrow').textContent, eff: BPS2.engine().document.getElementById('ft-eff').textContent }));
    check(en.lang === 'en' && /Five weeks are over/.test(en.h) && /Efficiency/.test(en.eff), 'đổi EN: trang mẹ và màn kết thúc trong iframe cùng đổi');
    await page.evaluate(() => { localStorage.setItem('bizon-lang', 'vi'); });

    const ph = await ctx.newPage(); ph.on('pageerror', e => errors.push(e.message));
    await ph.setViewportSize({ width: 390, height: 844 });
    await ph.goto(BASE + '/ben-phu-sa-v2.html', { waitUntil: 'commit', timeout: 60000 });
    await ph.waitForFunction(() => window.BPS2 && BPS2.ready(), null, { timeout: 60000 });
    await ph.click('#bps2-login button[type=submit]'); await ph.waitForSelector('[data-act=commit]', { timeout: 20000 });
    const mob = await ph.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, locs: document.querySelectorAll('[data-act=loc]').length }));
    check(mob.sw <= mob.cw && mob.locs === 6, 'điện thoại 390px: không tràn ngang, đủ 6 địa điểm');
    check(errors.length === 0, 'không lỗi JS ở trang mẹ và iframe' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  } finally { await browser.close(); }
  console.log(fails ? `\n✗ ${fails} kiểm tra thất bại` : '\n✓ ben-phu-sa-v2: tất cả đạt');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
