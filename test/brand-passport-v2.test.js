/* Hộ Chiếu Thương Hiệu · bản gọn (brand-passport-v2.html + js/bp2-ui.js) chạy engine brand-passport.html trong iframe
 * ẩn (?embed=1). Kiểm tra: (1) chế độ nhúng ẩn giao diện, bỏ cổng đăng nhập và tour, vẫn có các hàm đọc mới của
 * bpTest; (2) đi trọn một quý qua giao diện bản gọn – chọn doanh nghiệp, ưu tiên, mức vận hành, thị trường mới, mua
 * tin, chốt, xử lý biến cố, sang quý 2 – và trạng thái engine khớp; (3) chữ đã gõ không mất khi chọn doanh nghiệp,
 * mã lớp thành hạt giống; (4) đổi ngôn ngữ; (5) không lỗi JS ở trang mẹ lẫn iframe. Cần máy chủ tĩnh BIZON_URL. */
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

// Kiểm tra tĩnh
const bp = read('brand-passport.html'), v2 = read('brand-passport-v2.html'), ui = read('js/bp2-ui.js'), sw = read('sw.js');
check(/classList\.add\('bp-embed'\)/.test(bp) && /\.bp-embed main>\*:not\(#bp-end\)\{display:none!important\}/.test(bp), 'brand-passport.html: chế độ ?embed=1 ẩn mọi thứ trừ #bp-end');
check(/if \(!document\.documentElement\.classList\.contains\('bp-embed'\)\) Game3DGate\.mount/.test(bp) && /window\.BPTour = null;/.test(bp) && /if \(EMBED\) return; \/\/ bản gọn/.test(bp), 'brand-passport.html: nhúng thì bỏ cổng đăng nhập, tour và nhạc nền');
for (const k of ['data', 'signals', 'adviceRows', 'event', 'post', 'forecastQuarter', 'rival', 'logs', 'shop', 'aibis', 'rulesHtml', 'seedLine']) check(new RegExp('^    ' + k + ': function', 'm').test(bp), 'bpTest.' + k + '() có mặt');
check(/brand-passport-v2\.html/.test(bp), 'brand-passport.html: màn giới thiệu dẫn sang bản gọn');
check(/id="bp2-engine"/.test(v2) && /js\/bp2-ui\.js/.test(v2) && /css\/bn2\.css/.test(v2) && /css\/bp2\.css/.test(v2), 'brand-passport-v2.html: iframe engine + bp2-ui + bn2.css/bp2.css');
check(!/function settle|rivalAttr|H\[m\]\.fit/.test(ui), 'js/bp2-ui.js: không chứa công thức mô phỏng (chỉ gọi engine)');
check(/'\.\/brand-passport-v2\.html'/.test(sw) && /'\.\/js\/bp2-ui\.js'/.test(sw) && /'\.\/css\/bp2\.css'/.test(sw), 'sw.js: bản gọn nằm trong SHELL');
check(read('index.html') === read('academia3d-v2.html') && /brand-passport-v2\.html/.test(read('index.html')), 'index.html = academia3d-v2.html, có liên kết bản gọn');
check(/brand-passport-v2\.html/.test(read('js/games-clay.js')), 'games.html (js/games-clay.js): nút Bản gọn');

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, serviceWorkers: 'block' });
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    // Chỉ xoá bộ nhớ ở lần nạp đầu (cờ trong sessionStorage sống qua các lần chuyển trang) – để kiểm tra «Tiếp tục ván».
    await page.addInitScript(() => { try { if (!sessionStorage.getItem('bp2-test')) { localStorage.clear(); localStorage.setItem('bizon-lang', 'vi'); sessionStorage.setItem('bp2-test', '1'); } } catch (e) {} });
    await page.route(/\.(woff2?|mp3|m4a|glb|mp4)(\?|$)/, r => r.abort());

    // (1) chế độ nhúng
    await page.goto(BASE + '/brand-passport.html?embed=1&seed=4242', { waitUntil: 'commit', timeout: 60000 });
    await page.waitForFunction(() => !!window.bpTest && typeof window.bpTest.data === 'function', null, { timeout: 60000 });
    await page.waitForTimeout(600);
    const em = await page.evaluate(() => ({
      embed: window.bpTest.embed(), header: getComputedStyle(document.querySelector('header')).display, gate: !!document.getElementById('g3d-gate'),
      tour: window.BPTour === null, mkts: window.bpTest.data().MKTS.length, firms: window.bpTest.data().FIRMS.length, rules: /Sương mù/.test(window.bpTest.rulesHtml()),
    }));
    check(em.embed && em.header === 'none' && !em.gate, 'nhúng: header ẩn, không có cổng đăng nhập');
    check(em.tour, 'nhúng: BPTour tắt');
    check(em.mkts === 7 && em.firms === 4 && em.rules, 'nhúng: data() trả 7 thị trường, 4 doanh nghiệp; rulesHtml() có luật');

    // (2) đi trọn một quý qua bản gọn
    await page.goto(BASE + '/brand-passport-v2.html?seed=4242', { waitUntil: 'commit', timeout: 60000 });
    await page.waitForFunction(() => window.BP2 && BP2.ready(), null, { timeout: 60000 });
    await page.fill('input[name=team]', 'Đội Thử');
    await page.fill('input[name=classId]', 'qtkd-26a');
    await page.click('[data-act=firm][data-v="1"]');
    const kept = await page.evaluate(() => ({ team: document.querySelector('input[name=team]').value, on: document.querySelector('[data-act=firm][data-v="1"]').classList.contains('on') }));
    check(kept.team === 'Đội Thử' && kept.on, 'màn mở đầu: chọn doanh nghiệp không làm mất tên đội đã gõ');
    await page.click('#bp2-login button[type=submit]');
    await page.waitForSelector('[data-act=commit]', { timeout: 20000 });
    const s0 = await page.evaluate(() => { const A = BP2.engine().bpTest; return { st: A.state(), src: A.seedSource(), cls: localStorage.getItem('bp-class'), team: localStorage.getItem('bp-team'), disabled: document.querySelector('[data-act=commit]').disabled, sig: A.signals().length }; });
    check(s0.st.firm === 1 && s0.st.q === 0 && s0.st.phase === 'obs', 'bắt đầu: doanh nghiệp 2, quý 1, pha quan sát');
    check(s0.cls === 'QTKD-26A' && s0.team === 'Đội Thử' && s0.src === 'url', 'mã lớp viết hoa + tên đội lưu lại; ?seed= trên URL vẫn được ưu tiên');
    check(s0.disabled && s0.sig === 2, 'chưa chọn ưu tiên thì chưa chốt được; có 2 tín hiệu thị trường');
    await page.click('[data-act=prio][data-v="1"]');
    await page.click('[data-act=bud][data-v="2"]');
    await page.selectOption('select[data-sel=mkt]', '0');
    await page.waitForSelector('[data-act=ship]');
    await page.click('[data-act=mode][data-v="0"]');
    await page.click('[data-act=ship][data-v="1"]');
    await page.click('[data-act=adv]');
    await page.waitForSelector('[data-act=intel]');
    const cashBefore = await page.evaluate(() => BP2.engine().bpTest.state().cash);
    await page.click('[data-act=intel][data-v="0"]');
    const s1 = await page.evaluate(() => { const A = BP2.engine().bpTest; const st = A.state(); return { sel: st.sel, know0: st.know[0], cash: st.cash, fq: A.forecastQuarter(), fc: document.querySelectorAll('.bn2-fc div').length, note: (document.querySelector('.bp2-note') || {}).textContent || '', disabled: document.querySelector('[data-act=commit]').disabled }; });
    check(s1.sel.prio === 1 && s1.sel.budget === 2 && s1.sel.enter === 0 && s1.sel.enterMode === 0 && s1.sel.shipMode === 1, 'lựa chọn vào đúng S.sel của engine: ' + JSON.stringify(s1.sel));
    check(s1.sel.intel.length === 1 && s1.know0 === 28 && Math.abs(cashBefore - s1.cash - 0.3) < 1e-9 && /Báo cáo ngành/.test(s1.note), 'mua tin: tri thức Hải Lam 10→28, trừ 0,3 tỷ, ghi chú hiện kết quả');
    check(s1.fq.markets === 1 && s1.fq.revHi > s1.fq.revLo && s1.fq.revLo > 0 && Math.abs(s1.fq.spend - 0.5) < 1e-9 && s1.fc === 4, 'dự báo trước khi chốt: 1 thị trường, dải doanh thu, chi một lần 0,5 tỷ, 4 ô');
    check(!s1.disabled, 'đủ điều kiện → nút Chốt mở');
    await page.click('[data-act=commit]');
    await page.waitForSelector('[data-act=ev]', { timeout: 10000 });
    const e1 = await page.evaluate(() => { const A = BP2.engine().bpTest; const ev = A.event(); return { phase: A.state().phase, entered: A.state().entered, ev: ev && ev.choices.length, title: ev && ev.title, btns: document.querySelectorAll('[data-act=ev]').length, h2: document.querySelector('#bp2-ev-h').textContent }; });
    check(e1.phase === 'evt' && e1.entered[0] === 0, 'chốt: sang pha biến cố, đã vào Hải Lam bằng nền tảng số');
    check(e1.btns === e1.ev && e1.ev >= 2 && e1.h2.indexOf(e1.title) >= 0, 'thẻ biến cố: đủ ' + e1.ev + ' lựa chọn, đúng tiêu đề');
    await page.click('[data-act=ev][data-v="0"]');
    await page.waitForSelector('[data-act=next]', { timeout: 10000 });
    const r1 = await page.evaluate(() => { const A = BP2.engine().bpTest; const p = A.post(); return { q: A.state().q, qDone: p.qDone, lines: p.lines.length, delta: !!p.delta, rows: document.querySelectorAll('.bp2-table tbody tr').length, kpis: document.querySelectorAll('.bn2-kpi').length, save: !!localStorage.getItem('bizon-bp-save'), flag: document.querySelector('.bn2-flag').textContent }; });
    check(r1.q === 1 && r1.qDone === 1 && r1.lines === 1 && r1.rows === 1 && r1.delta && r1.kpis === 4, 'thẻ kết quả: quý 1 xong, 1 dòng thị trường, 4 ô KPI, nhận định «' + r1.flag.trim() + '»');
    check(r1.save, 'engine đã lưu ván (bizon-bp-save) sau khi chốt quý');
    await page.click('[data-act=next]');
    await page.waitForSelector('[data-act=commit]', { timeout: 10000 });
    const q2 = await page.evaluate(() => ({ phase: BP2.engine().bpTest.state().phase, q: BP2.engine().bpTest.state().q, txt: document.querySelector('#bp2-dec-h').textContent, dots: document.querySelectorAll('.bn2-rounds .win').length, mkts: document.querySelectorAll('.bp2-mkt').length }));
    check(q2.phase === 'obs' && q2.q === 1 && /quý 2/i.test(q2.txt) && q2.dots === 1 && q2.mkts === 1, 'sang quý 2: thẻ quyết định mới, 1 quý đã xong, 1 thị trường hiện diện');

    // (4) đổi ngôn ngữ
    await page.click('[data-act=lang]');
    const en = await page.evaluate(() => ({ lang: localStorage.getItem('bizon-lang'), txt: document.querySelector('#bp2-dec-h').textContent, help: !!document.querySelector('[data-act=help]') }));
    check(en.lang === 'en' && /Decisions for quarter 2/.test(en.txt), 'đổi ngôn ngữ: thẻ quyết định sang tiếng Anh');
    await page.click('[data-act=help]');
    const help = await page.evaluate(() => { const m = document.querySelector('.bn2-modal'); return m ? m.textContent : ''; });
    check(/How to play in 1 minute/.test(help) && /Market fog/.test(help), 'hộp ❓: cách chơi + luật chơi của engine (tiếng Anh)');

    // (3) tiếp tục ván từ màn mở đầu
    await page.goto(BASE + '/brand-passport-v2.html', { waitUntil: 'commit', timeout: 60000 });
    await page.waitForFunction(() => window.BP2 && BP2.ready(), null, { timeout: 60000 });
    const res = await page.evaluate(() => !!document.querySelector('[data-act=resume]'));
    check(res, 'màn mở đầu thấy ván đang dở → nút Tiếp tục');
    await page.click('[data-act=resume]');
    await page.waitForSelector('[data-act=commit]', { timeout: 20000 });
    const rs = await page.evaluate(() => BP2.engine().bpTest.state());
    check(rs.q === 1 && rs.entered[0] === 0 && rs.firm === 1, 'tiếp tục ván: đúng quý 2, Hải Lam đã vào, doanh nghiệp 2');

    // (5) chơi nhanh tới hết ván → màn Kết thúc của engine hiện từ iframe
    for (let i = 0; i < 8; i++) {
      const ended = await page.evaluate(() => BP2.engine().bpTest.ended());
      if (ended) break;
      await page.click('[data-act=prio][data-v="1"]');
      await page.click('[data-act=commit]');
      await page.waitForSelector('[data-act=ev]', { timeout: 10000 });
      await page.click('[data-act=ev][data-v="0"]');
      await page.waitForFunction(() => BP2.engine().bpTest.ended() || !!document.querySelector('[data-act=next]'), null, { timeout: 10000 });
      if (await page.evaluate(() => BP2.engine().bpTest.ended())) break;
      await page.click('[data-act=next]');
      await page.waitForSelector('[data-act=commit]', { timeout: 10000 });
    }
    await page.waitForFunction(() => { const f = document.getElementById('bp2-engine'); return f && !f.hidden && f.classList.contains('bp2-frame') && parseInt(f.style.height || '0', 10) > 200; }, null, { timeout: 10000 });
    const end = await page.evaluate(() => { const w = BP2.engine(); const d = w.document; return { ended: w.bpTest.ended(), total: (d.getElementById('bp-total') || {}).textContent, endVisible: getComputedStyle(d.getElementById('bp-end')).display !== 'none', playHidden: getComputedStyle(d.getElementById('bp-play')).display === 'none', again: !!document.querySelector('[data-act=again]'), save: !!localStorage.getItem('bizon-bp-save') }; });
    check(end.ended && end.endVisible && end.playHidden && /^\d+$/.test(String(end.total).trim()), 'kết thúc: iframe hiện màn Kết thúc của engine với điểm ' + end.total + ', màn chơi ẩn');
    check(end.again && !end.save, 'kết thúc: nút Chơi ván mới, bản lưu đã xoá');

    check(errors.length === 0, 'không lỗi JS ở trang mẹ và iframe' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  } finally { await browser.close(); }
  console.log(fails ? `\n✗ ${fails} kiểm tra thất bại` : '\n✓ brand-passport-v2: tất cả đạt');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
