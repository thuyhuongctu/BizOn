/* lab/day-chuyen-sau-rieng.html – Dây Chuyền Sầu Riêng, học liệu đi kèm Hộ Chiếu Sầu Riêng.
 * Kiểm luật chấm trong Node (tất định, phương án chuẩn = 100 điểm, các lỗi hay gặp), kiểm tĩnh (hub dẫn tới, sw.js,
 * sitemap, canonical, dùng chung durian-voice.js, không dùng engine Hộ Chiếu) và chạy thật bằng Playwright trên
 * BIZON_URL: chơi trọn 4 đơn tiếng Việt, giọng đọc được gọi đúng lúc, tải lại giữ ván, bản EN, điện thoại 390px
 * không tràn ngang, không lỗi JS. */
'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('playwright-core').chromium; } catch (e2) { console.error('day-chuyen-sau-rieng: cần playwright'); process.exit(1); }
}
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const D = require('../lab/day-chuyen-sau-rieng-data.js');

// ---- Luật chấm ----
for (const d of D.DON) for (const p of d.phuongAn) for (const x of p) assert.ok(D.TRAM[x], d.id + ':' + x);
for (const id of D.THU_TU_KHO) for (const l of ['vi', 'en']) assert.ok(D.TRAM[id][l].ten && D.TRAM[id][l].mo, id + ' thiếu ' + l);
for (const d of D.DON) {
  for (const k of ['chin', 'gio', 'nhiet']) { const [a, b, c, e] = d[k]; assert.ok(c <= a && a <= b && b <= e, d.id + ':' + k); }
  for (const l of ['vi', 'en']) for (const k of ['ten', 'khach', 'tomTat', 'bienCo', 'chin', 'gio', 'nhiet']) assert.ok(d[l][k], d.id + '.' + l + '.' + k);
  for (const p of d.phuongAn) { const r = D.cham(d, p, D.thamKhao(d), 0); assert.equal(r.tong, 100, d.id); assert.equal(r.ketQua, 'dat', d.id); assert.equal(r.sao, 3, d.id); }
}
check(true, 'mỗi đơn: phương án chuẩn + thông số tham khảo = 100 điểm, lô đạt, 3 sao; đủ hai thứ tiếng');
{ const d = D.DON[0], ts = { chin: 72, gio: 30, nhiet: 16 };
  assert.deepEqual(D.cham(d, ['cat', 'phanLoai'], ts, 1), D.cham(d, ['cat', 'phanLoai'], ts, 1));
  const r = D.cham(d, d.phuongAn[0], ts, 0); assert.deepEqual(r.muc, { chin: 'tam', gio: 'tam', nhiet: 'tam' }); assert.equal(r.ketQua, 'giam-gia'); assert.equal(r.tong, 70); }
check(true, 'tất định; thông số lệch vừa thì bị ép giá (70 điểm), không bị trả');
{ const d = D.DON[0]; const r = D.cham(d, d.phuongAn[0].filter(x => x !== 'kiemMau'), D.thamKhao(d), 0);
  assert.equal(r.ketQua, 'tra'); assert.ok(r.thuTu.loi.some(l => l.id === 'thieu:kiemMau')); }
{ const d = D.DON[0]; const r = D.cham(d, d.phuongAn[0], { chin: 80, gio: 10, nhiet: -5 }, 0); assert.equal(r.muc.nhiet, 'hong'); assert.equal(r.ketQua, 'tra'); }
check(true, 'xuất chính ngạch thiếu kiểm mẫu → bị trả; hàng tươi đặt nhiệt âm không có cấp đông → nhiệt hỏng');
{ const d = D.DON[0]; const p = d.phuongAn[0].slice(); [p[2], p[3]] = [p[3], p[2]];
  const l = D.kiemThuTu(d, p).loi.find(x => x.id === 'thu-tu'); assert.ok(l && l.vi.includes('Làm sạch') && l.en.includes('Grading'), l && l.vi); }
{ const d = D.DON[3]; assert.ok(D.kiemThuTu(d, ['cat', 'phanLoai', 'lamSach', 'dongThung', 'kho']).dung);
  assert.ok(D.kiemThuTu(d, ['cat', 'phanLoai', 'lamSach', 'dongThung', 'kho', 'kiemDich']).loi.some(l => l.id === 'thua:kiemDich')); }
{ const d = D.DON[3]; const r = D.cham(d, d.phuongAn[0], { chin: 90, gio: 12, nhiet: -5 }, 0); assert.equal(r.ketQua, 'tra'); assert.ok(r.tong >= 70); assert.equal(r.sao, 1); }
{ const d = D.DON[0]; assert.equal(D.cham(d, d.phuongAn[0], D.thamKhao(d), 2).tong, 90); assert.match(D.goiY(d, ['cat'], 'vi'), /Tiếp nhận/); assert.match(D.goiY(d, ['cat', 'tachMui'], 'en'), /Remove/); }
check(true, 'chỉ ra cặp trạm ngược; bán trong nước: kiểm dịch là thừa; lô bị trả tối đa 1 sao; gợi ý −5 điểm và chỉ trạm tiếp theo');

// ---- Kiểm tĩnh ----
{ const anh = [D.ANH.trai, D.ANH.nhaMay, 'tool/con-dau-pass.webp', ...Object.values(D.ANH.don), ...D.THU_TU_KHO.flatMap(id => [D.ANH[id].vat, D.ANH[id].canh])];
  const thieu = anh.filter(f => !fs.existsSync(path.join(root, 'assets/hc', f)));
  check(!thieu.length && D.DON.every(d => D.ANH.don[d.id]), 'đủ ảnh 3D cho 11 trạm (vật + cảnh), 4 đơn và quả chạy trên băng chuyền ' + thieu.join(', ')); }
const page = read('lab/day-chuyen-sau-rieng.html'), ui = read('lab/day-chuyen-sau-rieng-ui.js'), sw = read('sw.js');
check(page.includes('<link rel="canonical" href="https://bizonland.com/lab/day-chuyen-sau-rieng.html">') && read('sitemap.xml').includes('https://bizonland.com/lab/day-chuyen-sau-rieng.html'), 'canonical + sitemap');
check(['../js/durian-voice.js', 'day-chuyen-sau-rieng-data.js', 'day-chuyen-sau-rieng-ui.js', '../js/bizon-clay-i18n.js'].every(f => page.includes('src="' + f + '"'))
  && page.indexOf('day-chuyen-sau-rieng-data.js') < page.indexOf('day-chuyen-sau-rieng-ui.js') && page.indexOf('bizon-clay-i18n.js') < page.indexOf('day-chuyen-sau-rieng-ui.js'), 'trang nạp giọng đọc, dữ liệu, i18n trước giao diện');
check(!/ho-chieu-sau-rieng-(engine|core|data)\.js/.test(page) && !/Math\.random/.test(ui + read('lab/day-chuyen-sau-rieng-data.js')), 'không đụng engine Hộ Chiếu, không có số ngẫu nhiên');
check(read('ho-chieu-sau-rieng.html').includes('href="lab/day-chuyen-sau-rieng.html"'), 'trang Hộ Chiếu Sầu Riêng dẫn tới dây chuyền');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(sw) || [])[1] >= 774 && ['day-chuyen-sau-rieng.html', 'day-chuyen-sau-rieng-data.js', 'day-chuyen-sau-rieng-ui.js'].every(f => sw.includes("'./lab/" + f + "'")), 'sw.js ≥ bizon-v774 và cache ba tệp');

// ---- Chạy thật ----
(async () => {
  const b = await chromium.launch();
  const stubVoice = () => {
    window.__noi = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { value: { speak(u) { window.__noi.push(u.text); setTimeout(() => u.onend && u.onend(), 0); }, cancel() {}, getVoices() { return []; } } });
  };
  async function choi(w, lang) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const loi = [];
    p.on('pageerror', e => loi.push(e.message)); p.on('console', m => { if (m.type() === 'error') loi.push(m.text()); });
    await p.addInitScript(stubVoice);
    await p.goto(BASE + '/lab/day-chuyen-sau-rieng.html?lang=' + lang);
    await p.waitForSelector('#dc-kho .dc-tram');
    const kq = [];
    for (let i = 0; i < 4; i++) {
      const d = D.DON[i];
      for (const id of d.phuongAn[0]) await p.click('#dc-kho [data-tram="' + id + '"]');
      await p.click('#dc-tham-khao');
      if (i === 3) await p.fill('#dc-tt-nhiet', '-5');
      await p.click('#dc-chay');
      await p.waitForSelector('#dc-ket-qua:not([hidden]) .dc-chot');
      if (i === 0) check(await p.evaluate(() => [...document.querySelectorAll('#dc-day img, #dc-kho img, #dc-don-anh img')].every(im => im.complete && im.naturalWidth > 0)), w + 'px ' + lang + ': ảnh 3D trạm và đơn hàng tải được');
      kq.push((await p.textContent('.dc-kq-diem')).replace(/\s+/g, ' ').trim());
      if (i === 0) {
        check((await p.evaluate(() => window.__noi.length)) >= 1, w + 'px ' + lang + ': giọng đọc kết quả sau khi chạy');
        await p.click('#dc-don-ten .dc-loa'); const n = await p.evaluate(() => window.__noi.slice(-1)[0]);
        check(n.includes(lang === 'en' ? 'Fresh fruit, official export' : 'Trái tươi xuất chính ngạch'), w + 'px ' + lang + ': 🔊 đọc đơn hàng đúng ngôn ngữ');
      }
      await p.click('.dc-chot');
    }
    const tong = await p.textContent('#dc-tong-so');
    check(/^100 /.test(kq[0]) && /^100 /.test(kq[1]) && /^100 /.test(kq[2]) && /^75 /.test(kq[3]) && tong === '375 / 400', w + 'px ' + lang + ': 4 đơn ' + kq.join(' | ') + ' · tổng ' + tong);
    check(lang !== 'en' || (await p.textContent('#dc-man-tong h2')) === 'All four orders closed', w + 'px ' + lang + ': màn tổng kết đúng ngôn ngữ');
    await p.reload(); await p.waitForSelector('#dc-man-tong:not([hidden])');
    check((await p.textContent('#dc-tong-so')) === '375 / 400', w + 'px ' + lang + ': tải lại vẫn giữ ván');
    check((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, w + 'px ' + lang + ': không tràn ngang');
    check(!loi.length, w + 'px ' + lang + ': không lỗi JS ' + loi.join(' / '));
    await ctx.close();
  }
  try { await choi(1366, 'vi'); await choi(390, 'vi'); await choi(390, 'en'); }
  catch (e) { check(false, 'lỗi khi chạy: ' + e.message); }
  await b.close();
  if (fails) { console.log('day-chuyen-sau-rieng: ' + fails + ' lỗi'); process.exit(1); }
  console.log('day-chuyen-sau-rieng: ok');
})();
