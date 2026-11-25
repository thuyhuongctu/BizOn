// Đặc tả 009 · Go Global – hồ sơ khí hậu ND-GAIN (PR 1, Câu chuyện 1).
//  1. Số liệu trong js/go-global-khi-hau.js khớp từng số với bảng trích ND-GAIN 2026 (CSV) và nhất quán với
//     công thức của ND-GAIN: điểm = (sẵn sàng − dễ tổn thương + 1) × 50.
//  2. Hàm thuần s (dễ tổn thương tương đối), a (cam kết tài sản), m (giảm nhờ ESG) đúng như plan.md.
//  3. gCalc KHÔNG đổi: 7 thị trường × 7 phương thức × 2 bộ quyết định × 4 quý trùng khít mẫu ghi trước PR
//     (test/fixtures/go-global-gcalc-mau.json). Chạy với --ghi-mau để ghi lại mẫu (chỉ khi cố ý đổi luật).
//  4. Trình duyệt: 7 thẻ có dòng ND-GAIN, khối giải thích có nguồn và năm; VI/EN; 360 px không tràn ngang.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const ROOT = path.join(__dirname, '..'), R = f => path.join(ROOT, f);
const KH = require('../js/go-global-khi-hau.js');
const CSV = R('docs/research/du-lieu/nd-gain-2026-nuoc-trung-tam.csv');
const MAU = R('test/fixtures/go-global-gcalc-mau.json');
const GHI_MAU = process.argv.includes('--ghi-mau');

// 1. Dữ liệu
assert.ok(fs.existsSync(CSV), 'thiếu bảng trích ND-GAIN 2026: chạy scripts/research/trich-nd-gain.mjs với tệp zip chính thức');
const dong = fs.readFileSync(CSV, 'utf8').split('\n').filter(l => l && !l.startsWith('#'));
assert.equal(dong[0], 'thi_truong,iso3,nuoc,nam,nd_gain,vulnerability,readiness,hang,tong_so_nuoc');
const bang = dong.slice(1).map(l => l.split(','));
assert.equal(bang.length, 7, 'đủ 7 nước trung tâm');
assert.match(fs.readFileSync(CSV, 'utf8').split('\n')[0], /^# Nguồn: nd_?gain_country_?index_2026[\w.-]*\.zip .+ tải ngày \d{4}-\d{2}-\d{2}; tệp gain\/gain\.csv, vulnerability\/vulnerability\.csv, readiness\/readiness\.csv/, 'CSV ghi tệp nguồn chính thức và ngày tải');
assert.ok(KH.coSoLieu(), 'js/go-global-khi-hau.js có đủ số liệu 7 thị trường');
for (const [tt, iso, , nam, gain, vul, ready, hang, tong] of bang) {
  assert.equal(KH.THI_TRUONG[tt], iso, `${tt} → ${iso}`);
  const h = KH.NUOC[iso];
  assert.deepEqual([h.nam, h.gain, h.vul, h.ready, h.hang], [+nam, +gain, +vul, +ready, +hang], iso + ': số trong game khớp CSV');
  assert.equal(KH.TONG_SO_NUOC, +tong, 'tổng số nước khớp CSV');
  assert.equal(KH.NAM, +nam, 'cùng một năm số liệu');
  assert.ok(Math.abs(+gain - (+ready - +vul + 1) * 50) <= 0.15, `${iso}: điểm ND-GAIN nhất quán với (sẵn sàng − dễ tổn thương + 1) × 50`);
  assert.ok(+hang >= 1 && +hang <= +tong, iso + ': thứ hạng hợp lệ');
}
assert.ok(KH.NAM >= 2020 && KH.NAM <= 2026, 'năm số liệu gần đây');

// 2. Hàm thuần
const ids = Object.keys(KH.THI_TRUONG);
const theoVul = [...ids].sort((x, y) => KH.hoSo(x).vul - KH.hoSo(y).vul);
const theoS = [...ids].sort((x, y) => KH.s(x) - KH.s(y));
assert.deepEqual(theoS, theoVul, 's giữ nguyên thứ tự dễ tổn thương của nguồn');
assert.equal(Math.min(...ids.map(KH.s)), 0); assert.equal(Math.max(...ids.map(KH.s)), 1);
assert.equal(KH.a({ cost0: 180 }), 1); assert.ok(Math.abs(KH.a({ cost0: 30 }) - 30 / 180) < 1e-12);
assert.equal(KH.m(35), 1); assert.ok(Math.abs(KH.m(100) - 0.6) < 1e-12); assert.equal(KH.m(10), 1); assert.ok(Math.abs(KH.m(200) - 0.6) < 1e-12);

const v = +fs.readFileSync(R('sw.js'), 'utf8').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 989, 'sw.js phải ≥ bizon-v989, đang ' + v);
assert.ok(fs.readFileSync(R('sw.js'), 'utf8').includes("'./js/go-global-khi-hau.js'"), 'sw.js lưu sẵn js/go-global-khi-hau.js để chơi ngoại tuyến');

// 3–4. Trình duyệt
(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  for (const lang of ['vi', 'en']) {
    const p = await b.newPage({ viewport: { width: 360, height: 800 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.clear(); localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/global.html', { timeout: 60000 }); await p.waitForTimeout(800);
    const the = await p.$$eval('#market-cards button', bs => bs.map(x => x.innerText));
    check(the.length === 7 && the.every(t => /🌡️ ND-GAIN \d+[.,]\d · (hạng|rank) \d+\/\d+/.test(t)), lang + ': 7 thẻ có dòng ND-GAIN và thứ hạng');
    check(the[0].includes(lang === 'vi' ? 'Singapore' : 'Singapore') && the[6].includes('Kenya'), lang + ': ghi tên nước trung tâm');
    check(lang === 'vi' ? /ND-GAIN \d+,\d/.test(the[0]) : /ND-GAIN \d+\.\d/.test(the[0]), lang + ': dấu thập phân đúng ngôn ngữ');
    await p.click('#kh-giai-thich summary');
    const gt = await p.$eval('#kh-giai-thich', el => ({ hien: !el.hidden && el.open, chu: el.innerText }));
    check(gt.hien && gt.chu.includes(String(KH.NAM)) && gt.chu.includes('10.1057/s41267-026-00912-4') && gt.chu.includes('gain.nd.edu'), lang + ': khối giải thích mở được, có năm, DOI Oh et al. và nguồn ND-GAIN');
    check(lang === 'vi' ? gt.chu.includes('không đại diện cho cả vùng') && gt.chu.includes('suy rộng') : gt.chu.includes('does not represent a whole region') && gt.chu.includes('extension for discussion'), lang + ': nói rõ giới hạn (nước trung tâm, suy rộng)');
    const tran = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(tran <= 0, lang + ': 360 px không tràn ngang (' + tran + ')');
    check(errs.length === 0, lang + ': không lỗi JS' + (errs.length ? ' → ' + errs[0] : ''));
    if (lang === 'vi') {
      // 3. gCalc không đổi so với mẫu
      const kq = await p.evaluate(() => {
        const out = {}; const QD = [[12, 40, 30], [16, 80, 60]];
        for (const mk of MARKETS) for (const md of MODES) for (let q = 1; q <= 4; q++) {
          G.market = mk; G.mode = md; G.q = q; G.negoAdj = 1;
          QD.forEach((d, i) => { const r = gCalc(d[0], d[1], d[2]); out[`${mk.id}|${md.id}|${q}|${i}`] = Object.fromEntries(Object.entries(r).map(([k, x]) => [k, Math.round(x * 1e6) / 1e6])); });
        }
        return out;
      });
      if (GHI_MAU) { fs.mkdirSync(path.dirname(MAU), { recursive: true }); fs.writeFileSync(MAU, JSON.stringify(kq, null, 0) + '\n'); console.log('  · đã ghi mẫu gCalc: ' + Object.keys(kq).length + ' ô'); }
      const mau = JSON.parse(fs.readFileSync(MAU, 'utf8'));
      const lech = Object.keys(mau).filter(k => JSON.stringify(mau[k]) !== JSON.stringify(kq[k]));
      check(Object.keys(mau).length === 7 * 7 * 4 * 2 && lech.length === 0, 'gCalc trùng khít mẫu trước PR (' + Object.keys(mau).length + ' ô, lệch ' + lech.length + ')');
    }
    await p.close();
  }
  await b.close();
  if (fail) { console.log(`    ${fail} kiểm tra thất bại`); process.exit(1); }
  console.log('go-global-khi-hau: đạt');
})().catch(e => { console.error(e); process.exit(1); });
