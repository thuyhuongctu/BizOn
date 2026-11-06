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
check(!/ho-chieu-sau-rieng-(engine|core)\.js/.test(page) && !/Math\.random/.test(ui + read('lab/day-chuyen-sau-rieng-data.js')), 'không nạp engine/core Hộ Chiếu, không có số ngẫu nhiên');
{ const DD = require('../lab/ho-chieu-sau-rieng-data.js');
  const keys = [...D.THU_TU_KHO.flatMap(id => D.DU_KIEN[id] || []), ...Object.values(D.DU_KIEN.don).flat()];
  const thieu = keys.filter(k => !DD.facts[k] || !DD.sources[DD.facts[k].src]);
  check(!thieu.length && D.DON.every(d => (D.DU_KIEN.don[d.id] || []).length) && page.indexOf('ho-chieu-sau-rieng-data.js') < page.indexOf('day-chuyen-sau-rieng-ui.js'),
    'mọi trạm/đơn trỏ tới dữ kiện có nguồn trong DurianData.facts (chỉ đọc data Hộ Chiếu) ' + thieu.join(', '));
  const txt = JSON.stringify(D.DON) + JSON.stringify(D.TRAM);
  check(!/Quảng Tây|Guangxi|−35 đến −40|−35 to −40|5–7 ngày|5–7 days|10–14 ngày|Năm 2025 phía/.test(txt) && txt.includes('1/6/2024') && txt.includes('10/1/2025') && txt.includes('19/8/2024') && txt.includes('13,5 °C'),
    'nội dung khớp dữ kiện Hộ Chiếu (mốc cadimi 1/6/2024, vàng O 10/1/2025, đông lạnh 19/8/2024, 13,5 °C), bỏ các số chưa có nguồn'); }
check(read('ho-chieu-sau-rieng.html').includes('href="lab/day-chuyen-sau-rieng.html"'), 'trang Hộ Chiếu Sầu Riêng dẫn tới dây chuyền');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(sw) || [])[1] >= 778 && ['day-chuyen-sau-rieng.html', 'day-chuyen-sau-rieng-data.js', 'day-chuyen-sau-rieng-ui.js'].every(f => sw.includes("'./lab/" + f + "'")), 'sw.js ≥ bizon-v778 và cache ba tệp');

// ---- Giọng thật: đủ 34 file mỗi thứ tiếng, đúng tên giao diện gọi ----
{ const can = ['mo-dau', ...D.DON.map((d, i) => 'don-' + (i + 1)), ...D.THU_TU_KHO.map((id, i) => 'tram-' + String(i + 1).padStart(2, '0') + '-' + id),
    ...D.DON.flatMap((d, i) => ['chin', 'gio', 'nhiet'].map(k => 'giai-thich-don-' + (i + 1) + '-' + k)), 'ket-qua-dat', 'ket-qua-giam-gia', 'ket-qua-tra', 'tong-ket-gioi', 'tong-ket-kha', 'tong-ket-lam-lai'];
  const thieu = ['vi', 'en'].flatMap(l => can.map(f => l + '/' + f + '.mp3')).filter(f => !fs.existsSync(path.join(root, 'assets/voice/day-chuyen', f)));
  check(can.length === 34 && !thieu.length && ui.includes("'../assets/voice/day-chuyen/'"), 'đủ 34 file giọng thật mỗi thứ tiếng ' + thieu.join(', ')); }
// Bộ tiếng Anh đầy đủ (06/11/2026): en-v2/ có đủ 147 câu – mọi chữ hiển thị trên trang; bộ en/ cũ giữ nguyên trong kho.
{ const so = id => String(D.THU_TU_KHO.indexOf(id) + 1).padStart(2, '0'), thua = ['tachMui', 'hutChan', 'capDong', 'kiemDich', 'kiemMau', 'tiepNhan'];
  const can = ['mo-dau', 'trang-tieu-de', 'trang-tong-diem', 'trang-muc-1', 'trang-muc-1-huong-dan', 'trang-muc-2', 'trang-muc-2-huong-dan', 'trang-muc-3', 'trang-day-trong', 'trang-chon-tram',
    ...['do-gia', 'gio', 'nhiet'].flatMap(k => ['thanh-' + k, 'thanh-' + k + '-chu-thich']), 'nut-chay', 'nut-goi-y', 'nut-tham-khao', 'nut-thao-het',
    ...D.DON.map((d, i) => 'don-' + (i + 1)), ...D.THU_TU_KHO.flatMap(id => ['tram-' + so(id) + '-' + id, 'tram-ngan-' + so(id) + '-' + id, 'loi-thieu-' + so(id) + '-' + id, 'loi-trung-' + so(id) + '-' + id, 'goi-y-tiep-' + so(id) + '-' + id]),
    ...thua.flatMap(id => ['loi-thua-' + so(id) + '-' + id, 'goi-y-bo-' + so(id) + '-' + id]), 'goi-y-du-roi',
    ...[...new Set([...D.THU_TU_KHO.flatMap(id => D.DU_KIEN[id]), ...Object.values(D.DU_KIEN.don).flat()])].map(k => 'du-kien-' + k),
    'ket-qua-dat', 'ket-qua-giam-gia', 'ket-qua-tra', 'nhan-xet-dung-thu-tu', 'nhan-xet-thu-tu-chua-dung', 'nhan-xet-dong-khong-cap-dong', 'moi-muc-deu-tot',
    'bang-thu-tu', 'bang-do-gia', 'bang-thoi-gian', 'bang-nhiet-do', 'bang-goi-y', 'nut-sua-chay-lai', 'nut-chot-don-tiep', 'nut-chot-don-tong-ket',
    ...D.DON.flatMap((d, i) => ['chin', 'gio', 'nhiet'].map(k => 'giai-thich-don-' + (i + 1) + '-' + k)),
    'tong-ket-tieu-de', 'tong-ket-cot-bang', 'nut-in-phieu', 'nut-choi-lai', 'tong-ket-gioi', 'tong-ket-kha', 'tong-ket-lam-lai', 'hoi-choi-lai', 'chu-y-tieu-de', ...[1, 2, 3, 4, 5, 6].map(i => 'chu-y-' + i)];
  const thieu = can.filter(f => !fs.existsSync(path.join(root, 'assets/voice/day-chuyen/en-v2', f + '.mp3')));
  const thua2 = fs.readdirSync(path.join(root, 'assets/voice/day-chuyen/en-v2')).filter(f => !can.includes(f.replace(/\.mp3$/, '')));
  check(can.length === 147 && new Set(can).size === 147 && !thieu.length && !thua2.length && ui.includes("en: 'en-v2'"), 'tiếng Anh đủ 147 câu ghi âm trong en-v2/, không thiếu không thừa ' + thieu.concat(thua2).join(', '));
  check(fs.existsSync(path.join(root, 'assets/voice/day-chuyen/en/mo-dau.mp3')), 'bộ en/ cũ giữ nguyên'); }

// ---- Chạy thật ----
(async () => {
  const b = await chromium.launch();
  const stubVoice = () => {
    window.__noi = []; window.__phat = [];
    window.Audio = function (u) { this.src = u; window.__phat.push(u); const a = this; this.pause = () => {}; this.play = () => { setTimeout(() => a.onended && a.onended(), 0); return Promise.resolve(); }; };
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { value: { speak(u) { window.__noi.push(u.text); setTimeout(() => u.onend && u.onend(), 0); }, cancel() {}, getVoices() { return []; } } });
  };
  async function choi(w, lang) {
    const dir = lang === 'en' ? 'en-v2' : 'vi';
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
        await p.waitForTimeout(200);
        const sau = (await p.evaluate(() => window.__phat.map(u => u.split('/day-chuyen/')[1])));
        check(sau.includes(dir + '/ket-qua-dat.mp3'), w + 'px ' + lang + ': chạy xong phát giọng thật «lô đạt»');
        check(lang !== 'en' || ['tram-ngan-01-cat', 'tram-ngan-11-kiemDich', 'nhan-xet-dung-thu-tu', 'moi-muc-deu-tot', 'nut-sua-chay-lai', 'nut-chot-don-tiep'].every(f => sau.includes('en-v2/' + f + '.mp3')),
          w + 'px en: lắp trạm đọc dòng ngắn; kết quả đọc nhận xét và hai nút bằng giọng thật');
        check(lang !== 'vi' || (await p.evaluate(() => window.__noi.includes('Dây chuyền đúng thứ tự, đủ trạm.'))), w + 'px vi: câu chưa thu tiếng Việt đọc bằng giọng máy');
        await p.click('#dc-don-ten .dc-loa'); const n = await p.evaluate(() => window.__phat.slice(-1)[0]);
        check(n.endsWith('/day-chuyen/' + dir + '/don-1.mp3'), w + 'px ' + lang + ': 🔊 phát giọng thật đơn 1 đúng ngôn ngữ');
        check((await p.evaluate(async u => (await fetch(u)).status, n)) === 200, w + 'px ' + lang + ': file giọng thật tải được qua máy chủ');
        await p.click('#dc-don-dk summary'); const dk = await p.textContent('#dc-don-dk');
        check(dk.includes(lang === 'en' ? 'Source:' : 'Nguồn:') && dk.includes('GACC') && dk.includes('10/1/2025'), w + 'px ' + lang + ': ô dữ kiện có nguồn mở được, có trích nguồn');
        if (lang === 'en') {
          await p.click('#dc-don-dk li .dc-loa'); await p.waitForTimeout(50);
          check((await p.evaluate(() => window.__phat.slice(-1)[0])).endsWith('/en-v2/du-kien-openDate.mp3'), w + 'px en: 🔊 từng dữ kiện có nguồn phát giọng thật');
          await p.click('[data-muc="dc-h-ts"]'); await p.waitForTimeout(300);
          const ts = await p.evaluate(() => window.__phat.map(u => u.split('/').pop()));
          check(['trang-muc-3.mp3', 'thanh-do-gia.mp3', 'thanh-nhiet-chu-thich.mp3', 'nut-thao-het.mp3'].every(f => ts.includes(f)), w + 'px en: 🔊 mục thông số đọc nhãn, chú thích và nút');
          await p.click('[data-muc="dc-h-chu-y"]'); await p.waitForTimeout(300);
          check((await p.evaluate(() => window.__phat.slice(-1)[0])).endsWith('/en-v2/chu-y-6.mp3'), w + 'px en: 🔊 phần lưu ý đọc đủ 6 mục');
        }
        await p.click('#dc-day [data-id="kiemMau"] .dc-o-chinh');
        check((await p.textContent('#dc-xem .dc-dk summary')).includes('2'), w + 'px ' + lang + ': trạm kiểm mẫu có 2 dữ kiện có nguồn');
      }
      if (i === 3) { await p.waitForTimeout(300); const ds = await p.evaluate(() => window.__phat.map(u => u.split('/').pop()));
        const k = ds.lastIndexOf('ket-qua-tra.mp3'), sau4 = ds.slice(k);
        check(k >= 0 && sau4.includes('giai-thich-don-4-nhiet.mp3') && (lang !== 'en' || sau4.indexOf('nhan-xet-dong-khong-cap-dong.mp3') === sau4.indexOf('giai-thich-don-4-nhiet.mp3') - 1),
          w + 'px ' + lang + ': lô bị trả: phát «bị trả», cảnh báo nhiệt độ âm không cấp đông, rồi lời giải thích nhiệt độ đơn 4'); }
      if (i === 1) { await p.click('#dc-goi-y'); await p.waitForTimeout(100);
        check(lang !== 'en' || (await p.evaluate(() => window.__phat.slice(-1)[0])).endsWith('/en-v2/goi-y-du-roi.mp3'), w + 'px en: gợi ý phát giọng thật'); }
      await p.click('.dc-chot');
    }
    await p.waitForTimeout(300);
    check((await p.evaluate(() => window.__phat.map(u => u.split('/day-chuyen/')[1]))).includes(dir + '/tong-ket-gioi.mp3'), w + 'px ' + lang + ': màn tổng kết phát giọng thật «giỏi» (375/400, trung bình 93,75)');
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
