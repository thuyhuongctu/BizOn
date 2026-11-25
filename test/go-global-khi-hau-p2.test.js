// Đặc tả 009 · PR 2 (Câu chuyện 2): kịch bản khí hậu bật bằng ?khihau=1.
//  - Tắt: kết quả trùng khít mẫu (đã kiểm ở test/go-global-khi-hau.test.js) và không có trường khiHau.
//  - Bật: chi phí rủi ro khí hậu mỗi quý xếp đúng thứ tự dễ tổn thương ND-GAIN (Spearman = 1); FDI > xuất khẩu;
//    ESG thấp > ESG cao; biến cố thiên tai mạnh hơn ở nơi dễ tổn thương hơn; lợi nhuận giảm đúng bằng chi phí × tỷ lệ chia;
//    không phương thức nào thắng ở cả 7 thị trường (không tạo chiến lược áp đảo).
//  - Giao diện: dải «Kịch bản khí hậu đang bật», mức rủi ro trên thẻ, dòng chi phí ở «Thị trường phản ứng»,
//    lời biến cố thiên tai có số ND-GAIN; VI/EN; 360 px không tràn ngang; không lỗi JS.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const KH = require('../js/go-global-khi-hau.js');
const R = f => path.join(__dirname, '..', f);

// 1. Hàm thuần
const ids = Object.keys(KH.THI_TRUONG), FDI = { cost0: 180 }, XK = { cost0: 30 };
const hang = arr => arr.map(x => arr.filter(y => y < x).length);
assert.deepEqual(hang(ids.map(id => KH.chiPhiQuy(id, FDI, 35))), hang(ids.map(id => KH.hoSo(id).vul)), 'chi phí khí hậu (FDI) xếp đúng thứ tự dễ tổn thương');
for (const id of ids.filter(id => KH.s(id) > 0)) {
  assert.ok(KH.chiPhiQuy(id, FDI, 35) > KH.chiPhiQuy(id, XK, 35), id + ': FDI chịu chi phí khí hậu lớn hơn xuất khẩu');
  assert.ok(KH.chiPhiQuy(id, FDI, 35) > KH.chiPhiQuy(id, FDI, 90), id + ': ESG cao giảm chi phí khí hậu');
  assert.ok(KH.chiPhiQuy(id, FDI, 100) >= 0.6 * KH.chiPhiQuy(id, FDI, 35) - 1e-9, id + ': ESG giảm tối đa 40 %');
}
assert.deepEqual(hang(ids.map(id => KH.thienTai(id, FDI, 35).cogsAdd)), hang(ids.map(id => KH.hoSo(id).vul)), 'thiệt hại thiên tai xếp đúng thứ tự dễ tổn thương');
assert.ok(ids.every(id => KH.thienTai(id, FDI, 35).demand < 1), 'thiên tai luôn làm giảm cầu');
const kenya = ids.find(id => KH.s(id) === 1), duc = ids.find(id => KH.s(id) === 0);
assert.ok(Math.abs(KH.chiPhiQuy(kenya, FDI, 35) - KH.HE_SO.chiPhiQuy) < 1e-9 && KH.chiPhiQuy(duc, FDI, 35) === 0, 'mốc: dễ tổn thương nhất chịu đủ hệ số, ít nhất chịu 0');
assert.match(fs.readFileSync(R('js/go-global-khi-hau.js'), 'utf8'), /HE_SO[^\n]*\n|Hệ số MINH HỌA/, 'hệ số ghi rõ là minh họa');
const v = +fs.readFileSync(R('sw.js'), 'utf8').match(/bizon-v(\d+)/)[1];
assert.ok(v >= 991, 'sw.js phải ≥ bizon-v991, đang ' + v);

(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  const mo = async (q, lang, w = 1280) => {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
    await p.addInitScript(l => { try { localStorage.clear(); localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
    await p.goto(BASE + '/global.html' + q, { timeout: 60000 }); await p.waitForTimeout(800);
    return p;
  };
  const TINH = () => {
    const QD = [[12, 40, 30], [16, 80, 60], [14, 60, 45]], out = {};
    for (const mk of MARKETS) for (const md of MODES) for (let q = 1; q <= 4; q++) {
      G.market = mk; G.mode = md; G.q = q; G.negoAdj = 1;
      out[`${mk.id}|${md.id}|${q}`] = QD.map(d => { const r = gCalc(d[0], d[1], d[2]); return { profit: r.profit, kh: r.khiHau || null, climate: !!qEvent().climate, share: md.share, cost0: md.cost0 }; });
    }
    return { bat: KH_BAT, out };
  };

  // Tắt
  const p0 = await mo('', 'vi'); const tat = await p0.evaluate(TINH);
  check(!tat.bat && Object.values(tat.out).every(a => a.every(x => x.kh === null)), 'không có ?khihau=1: kịch bản tắt, không có trường khiHau');
  check(await p0.$eval('#kh-bat', el => el.hidden) && !(await p0.$eval('#market-cards', el => el.innerText.includes('rủi ro khí hậu'))), 'tắt: không hiện dải kịch bản, thẻ không có mức rủi ro');
  await p0.close();

  // Bật
  const p1 = await mo('?khihau=1', 'vi'); const bat = await p1.evaluate(TINH);
  check(bat.bat, '?khihau=1: kịch bản bật');
  const lech = Object.keys(bat.out).filter(k => !bat.out[k][0].climate).filter(k => bat.out[k].some((x, i) => Math.abs((tat.out[k][i].profit - x.profit) - x.kh.chiPhi * x.share) > 1e-6));
  check(lech.length === 0, 'quý không có thiên tai: lợi nhuận giảm đúng bằng chi phí khí hậu × tỷ lệ chia (' + lech.length + ' ô lệch)');
  const tt = Object.entries(bat.out).filter(([, a]) => a[0].climate);
  check(tt.length > 0 && tt.every(([, a]) => a[0].kh.thienTai && a[0].kh.thienTai.cogsAdd > 0), 'quý có thiên tai: tác động tính theo kịch bản (' + tt.length + ' ô)');
  // Lợi nhuận cả ván như game tính: trừ vốn ban đầu của phương thức (G.profit bắt đầu ở −cost0), cộng 4 quý
  const tong = {}; for (const [k, a] of Object.entries(bat.out)) { const [mk, md] = k.split('|'); tong[mk] = tong[mk] || {}; tong[mk][md] = tong[mk][md] || a.map(x => -x.cost0); a.forEach((x, i) => { tong[mk][md][i] += x.profit; }); }
  const thang = [0, 1, 2].map(i => Object.keys(tong).map(mk => Object.entries(tong[mk]).sort((x, y) => y[1][i] - x[1][i])[0][0]));
  check(thang.every(ws => new Set(ws).size > 1), 'cân bằng: không phương thức nào tốt nhất ở cả 7 thị trường (' + thang.map(w => [...new Set(w)].join('/')).join(' · ') + ')');
  const giam = mk => (Object.values(tat.out).length, ['fdi'].map(md => [1, 2, 3, 4].reduce((t, q) => t + tat.out[`${mk}|${md}|${q}`][0].profit - bat.out[`${mk}|${md}|${q}`][0].profit, 0))[0]);
  check(giam(kenya) > giam(duc), `FDI ở nơi dễ tổn thương nhất mất nhiều hơn nơi ít nhất (${giam(kenya).toFixed(1)} > ${giam(duc).toFixed(1)})`);
  check(!(await p1.$eval('#kh-bat', el => el.hidden)), 'bật: hiện dải «Kịch bản khí hậu đang bật»');
  const the = await p1.$$eval('#market-cards button', bs => bs.map(x => x.innerText));
  check(the.every(t => /rủi ro khí hậu (thấp|vừa|cao)/.test(t)), 'bật: 7 thẻ có mức rủi ro khí hậu');
  const ui = await p1.evaluate(() => {
    const mk = MARKETS.find(m => m.id === 'me'), md = MODES.find(m => m.id === 'fdi');
    G.market = mk; G.mode = md; G.done = false; G.negoAdj = 1;
    let qTT = 0; for (let q = 1; q <= 4; q++) { G.q = q; if (qEvent().climate) qTT = q; }
    G.q = qTT || 1; paintQuarter(); gUpdate();
    return { qTT, bienCo: document.getElementById('q-event').innerText, dong: document.getElementById('g-khihau').hidden ? '' : document.getElementById('g-khihau').innerText };
  });
  check(ui.qTT > 0 && /Kịch bản khí hậu: .+ dễ tổn thương 0,\d\d \(ND-GAIN \d{4}\)/.test(ui.bienCo) && /Lumina hỏi/.test(ui.bienCo), 'bật: lời biến cố thiên tai có số ND-GAIN và câu hỏi của Lumina');
  check(/Chi phí rủi ro khí hậu quý này: \d+,\dk\$/.test(ui.dong) && /ESG \d+ giảm \d+%/.test(ui.dong), 'bật: «Thị trường phản ứng» hiện chi phí khí hậu, ESG giảm bao nhiêu');
  check(/Thiên tai quý này: \+\d+,\d\d USD\/sản phẩm, cầu × 0,\d\d\./.test(ui.dong) && /được thay bằng mức tính theo nơi đặt hàng/.test(ui.bienCo), 'bật: quý thiên tai nói đúng mức thiệt hại đang tính (không để chữ «1,2 USD» cũ đứng một mình)');
  check(p1._errs.length === 0, 'bật: không lỗi JS' + (p1._errs[0] ? ' → ' + p1._errs[0] : ''));
  await p1.close();

  // Bật, tiếng Anh, 360 px
  const p2 = await mo('?khihau=1', 'en', 360);
  const en = await p2.evaluate(() => {
    G.market = MARKETS.find(m => m.id === 'me'); G.mode = MODES.find(m => m.id === 'fdi'); G.done = false; G.negoAdj = 1;
    for (let q = 1; q <= 4; q++) { G.q = q; if (qEvent().climate) break; }
    paintQuarter(); gUpdate();
    return [document.getElementById('kh-bat').innerText, document.getElementById('q-event').innerText, document.getElementById('g-khihau').innerText, document.getElementById('market-cards').innerText].join('\n');
  });
  const VN = /[àáạảãâầấậẩẫăằắặẳẵẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  const conViet = en.split('\n').filter(l => VN.test(l.replace(/Việt Nam|Đông Nam Á/g, '')) && /Climate|climate|ND-GAIN/.test(l));
  check(conViet.length === 0 && /Climate scenario is on/.test(en) && /climate risk (low|medium|high)/.test(en), 'EN: chữ kịch bản khí hậu bằng tiếng Anh' + (conViet.length ? ' → ' + conViet[0] : ''));
  check(await p2.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) <= 0, 'EN 360 px: không tràn ngang');
  check(p2._errs.length === 0, 'EN: không lỗi JS');
  await p2.close();
  await b.close();
  if (fail) { console.log(`    ${fail} kiểm tra thất bại`); process.exit(1); }
  console.log('go-global-khi-hau-p2: đạt');
})().catch(e => { console.error(e); process.exit(1); });
