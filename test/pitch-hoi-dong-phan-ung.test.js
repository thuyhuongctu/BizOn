// Đặc tả 012 · PR 3 (Câu chuyện 3): Hội đồng phản ứng theo luật và giọng đọc câu hỏi.
//  - Bảng luật đủ VI/EN; tính cách ba nhà đầu tư; phản ứng chỉ dựa trên tín hiệu đo được (thời gian, nút tự bấm, ba con số, PASTOR).
//  - Ba con số lệch → Minh Khang (tài chính, theo dữ liệu đặc tả 010) cau mày và hỏi câu vặn tài chính; số câu giữ nguyên.
//  - Hết giờ trả lời → Lumina gõ chuông, người hỏi ghi chép; có dòng nói rõ phản ứng không dựa trên nội dung.
//  - Giảm chuyển động: không chạy hoạt ảnh. Giọng đọc bật/tắt được; máy không có giọng thì im lặng, không lỗi.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const D = require('../lab/pitch-goi-von-data.js'), C = require('../lab/pitch-goi-von-core.js');
const VIET = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;

// 1. Dữ liệu
const ids = D.HOI_DONG.map(h => h.id);
assert.deepEqual(Object.keys(D.TINH_CACH).sort(), ids.slice().sort(), 'mỗi thành viên có tính cách');
for (const id of ids) assert.ok(D.TINH_CACH[id].vi && D.TINH_CACH[id].en && !VIET.test(D.TINH_CACH[id].en), id + ': tính cách VI/EN');
const mk = D.HOI_DONG.find(h => h.id === 'minh-khang');
assert.ok(/Tài chính/.test(mk.vaiTro.vi) && mk.chu.includes('T') && mk.chu.includes('O'), 'Minh Khang là người hỏi tài chính (T, O) theo dữ liệu đặc tả 010');
for (const [k, v] of Object.entries(D.DONG_TAC)) assert.ok(v.vi && v.en && v.icon && !VIET.test(v.en), 'động tác ' + k + ' đủ VI/EN');
assert.deepEqual(Object.keys(D.DONG_TAC).sort(), ['cau-may', 'chuong', 'gat', 'ghi-chep', 'nghieng']);
const TIN_HIEU = ['bat-dau-cau', 'lech-so', 'con-10', 'qua-gio', 'tra-loi-som', 'tu-tin', 'chua-chac'];
assert.deepEqual([...new Set(D.PHAN_UNG.map(r => r.tinHieu))].sort(), TIN_HIEU.slice().sort(), 'bảng luật phủ đủ tín hiệu');
for (const r of D.PHAN_UNG) {
  assert.ok(D.DONG_TAC[r.dongTac], r.tinHieu + ': động tác có trong danh mục');
  const loi = r.loi.vi ? [r.loi] : ids.map(id => r.loi[id]);
  for (const l of loi) assert.ok(l && l.vi && l.en && !VIET.test(l.en), r.tinHieu + ': câu nói đủ VI/EN');
}
assert.ok(/không chấm nội dung/.test(D.GHI_CHU_PHAN_UNG.vi) && /does not listen to or grade/.test(D.GHI_CHU_PHAN_UNG.en), 'ghi chú nói rõ không dựa trên nội dung');
for (const [k, c] of Object.entries(D.CAU_VAN)) assert.ok(D.PASTOR[c.p] && c.vi.endsWith('?') && c.en.endsWith('?') && !VIET.test(c.en), 'câu vặn ' + k);

// 2. Hàm thuần
assert.deepEqual(C.phanUng('lech-so', 'tu-phan', D.PHAN_UNG).map(x => [x.ai, x.dongTac]), [['minh-khang', 'cau-may']], 'ba con số lệch: Minh Khang cau mày');
assert.deepEqual(C.phanUng('qua-gio', 'victor-lam', D.PHAN_UNG).map(x => [x.ai, x.dongTac]), [['lumina', 'chuong'], ['victor-lam', 'ghi-chep']], 'quá giờ: Lumina gõ chuông, người hỏi ghi chép');
assert.equal(C.phanUng('bat-dau-cau', 'tu-phan', D.PHAN_UNG)[0].vi, D.PHAN_UNG[0].loi['tu-phan'].vi, 'câu mở đầu theo tính cách người hỏi');
assert.deepEqual(C.phanUng('khong-co', 'tu-phan', D.PHAN_UNG), [], 'tín hiệu lạ: không phản ứng');
const v = C.cauVan([{ ma: 'ln', ok: false }, { ma: 'bep', ok: false }, { ma: 'von', ok: true }], D.CAU_VAN);
assert.ok(v.id === 'van-bep' && v.hoi === 'minh-khang' && v.vai === 'cfo' && v.p === 'T', 'ưu tiên câu vặn hòa vốn');
assert.equal(C.cauVan([{ ma: 'bep', ok: true }], D.CAU_VAN), null, 'không lệch: không có câu vặn');
assert.equal(C.cauVan([], D.CAU_VAN), null);
assert.equal(C.cauVan([{ ma: 'von', ok: false }], D.CAU_VAN).p, 'O');
const vSw = +R('sw.js').match(/bizon-v(\d+)/)[1];
assert.ok(vSw >= 1012, 'sw.js phải ≥ bizon-v1012, đang ' + vSw);

const LECH = { 'so-vonXin': 100, 'so-bep': 600, 'so-lnMucTieu': 10, 'so-gia': 150, 'so-bienPhi': 90, 'so-dinhPhi': 24, 'so-sanLuong': 800, 'so-dauTu': 50, 'so-thangHoaVon': 4 };
const GIONG = () => {
  window.__noi = [];
  const voices = [{ lang: 'vi-VN', name: 'VI' }, { lang: 'en-US', name: 'EN' }];
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => voices, speak: u => window.__noi.push(u.text), cancel: () => {}, addEventListener: () => {} } });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
};

(async () => {
  const b = await chromium.launch();
  let fail = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fail++; };
  const errs = [], ngoai = [];
  const moi = async (o, lang) => {
    const ctx = await b.newContext(Object.assign({ viewport: { width: 360, height: 760 } }, o || {}));
    await ctx.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang || 'vi');
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    p.on('request', q => { const u = q.url(); if (!u.startsWith(BASE) && !u.startsWith('data:')) ngoai.push(u); });
    return { ctx, p };
  };
  const pu = p => p.evaluate(() => __pitchTest.phanUng());
  const vaoHoiDap = async (p, so) => {
    if (so) { await p.click('#so-truoc summary'); for (const [id, val] of Object.entries(so)) await p.fill('#' + id, String(val)); }
    await p.click('#nut-bat-dau'); await p.evaluate(() => __pitchTest.tua(400)); await p.click('#nut-ket-thuc');
    // Trang dựng câu đầu ở nhịp kế tiếp (setTimeout) sau khi chuyển sang hỏi đáp: chờ câu và thẻ Hội đồng hiện ra.
    await p.waitForFunction(() => __pitchTest.trangThai().phase === 'hoi-dap' && document.querySelector('#hoi-dong .tv') && document.getElementById('cau').textContent && __pitchTest.phanUng().length > 0);
  };

  // A. Ba con số lệch, bản phẳng, VI
  {
    const { ctx, p } = await moi();
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=PU1&3d=0');
    check(await p.isVisible('#so-truoc') && await p.isHidden('#so-bep'), 'màn chuẩn bị có mục ba con số (thu gọn)');
    await vaoHoiDap(p, LECH);
    const st = await p.evaluate(() => __pitchTest.trangThai());
    check(st.cau[0] === 'van-bep' && st.cau.length === 3, 'ba con số lệch: câu đầu là câu vặn hòa vốn, vẫn 3 câu');
    const r = await pu(p);
    check(r.some(x => x.ai === 'minh-khang' && x.dongTac === 'cau-may' && x.tinHieu === 'lech-so'), 'Minh Khang cau mày');
    check(await p.$eval('.tv[data-id="minh-khang"]', el => el.classList.contains('dt-cau-may') && el.classList.contains('hoi')), 'thẻ Minh Khang: đang hỏi, cau mày');
    check(/Minh Khang cau mày: «Ba con số chưa khớp/.test(await p.textContent('#loi-hoi-dong')), 'bong bóng lời ghi động tác và câu nói');
    check(/không chấm nội dung/.test(await p.textContent('#man-hoi-dap')), 'có dòng nói rõ phản ứng không dựa trên nội dung');
    await p.evaluate(() => __pitchTest.tua(51));
    check((await pu(p)).some(x => x.tinHieu === 'con-10' && x.dongTac === 'nghieng'), 'còn 10 giây: người hỏi nghiêng tới');
    await p.evaluate(() => __pitchTest.tua(10));
    const q = await pu(p);
    check(q.some(x => x.ai === 'lumina' && x.dongTac === 'chuong') && q.some(x => x.ai === 'minh-khang' && x.dongTac === 'ghi-chep'), 'hết giờ: Lumina gõ chuông, người hỏi ghi chép');
    check(/Lumina gõ chuông/.test(await p.textContent('#loi-hoi-dong')), 'bong bóng: Lumina gõ chuông');
    await p.click('#nut-cau-tiep');
    const nguoi2 = (await p.evaluate(() => __pitchTest.trangThai())).cau[1];
    await p.click('#nut-tu-tin');
    check((await pu(p)).some(x => x.tinHieu === 'tu-tin' && x.dongTac === 'nghieng'), 'đội bấm «Tự tin»: người hỏi nghiêng tới, đòi con số');
    await p.click('#nut-chua-chac');
    check((await pu(p)).some(x => x.tinHieu === 'chua-chac' && x.dongTac === 'gat'), 'đội bấm «Chưa chắc»: người hỏi gật đầu');
    await p.click('#nut-cau-tiep');   // vừa vào câu 2 nên còn gần 60 giây
    const s3 = await pu(p);
    check(s3.some(x => x.tinHieu === 'tra-loi-som' && x.dongTac === 'gat') && s3.some(x => x.tinHieu === 'bat-dau-cau'), 'trả lời gọn: người hỏi trước gật đầu, người hỏi mới mở lời ' + nguoi2);
    await p.click('#nut-cau-tiep');
    check(!(await p.isHidden('#man-tu-cham')) && await p.inputValue('#so-bep') === '600' && await p.$eval('#so-bep', el => !!el.closest('#man-tu-cham')), 'sang màn tự chấm: ba con số đã nhập vẫn còn');
    check(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 0, '360 px không tràn ngang');
    await ctx.close();
  }
  // B. Không nhập số: không câu vặn; EN
  {
    const { ctx, p } = await moi({}, 'en');
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=PU2&3d=0');
    await vaoHoiDap(p);
    const st = await p.evaluate(() => __pitchTest.trangThai());
    check(!st.cau.some(c => /^van-/.test(c)) && (await pu(p))[0].tinHieu === 'bat-dau-cau', 'không nhập số: không có câu vặn, Hội đồng mở lời bình thường');
    const loi = await p.textContent('#loi-hoi-dong');
    check(loi.length > 10 && !VIET.test(loi.replace(/Victor Lâm|Lâm/g, '')), 'EN: bong bóng lời không còn chữ Việt');
    await ctx.close();
  }
  // C. Giảm chuyển động: có lớp động tác nhưng không chạy hoạt ảnh
  {
    const { ctx, p } = await moi({ reducedMotion: 'reduce' });
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=PU3&3d=0');
    await vaoHoiDap(p, LECH);
    const an = await p.$eval('.tv[data-id="minh-khang"] img', el => getComputedStyle(el).animationName);
    check(an === 'none', 'giảm chuyển động: không chạy hoạt ảnh (' + an + ')');
    check(await p.$eval('.tv[data-id="minh-khang"] .dt', el => el.textContent) === '🤨', 'giảm chuyển động: vẫn có biểu tượng động tác');
    await ctx.close();
  }
  // D. Giọng đọc
  {
    const { ctx, p } = await moi({ viewport: { width: 1280, height: 860 } });
    await ctx.addInitScript(GIONG);
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=PU4&3d=0');
    let g = await p.evaluate(() => __pitchTest.giong());
    check(g.hoTro && g.bat, 'màn rộng có giọng VI: đọc câu hỏi bật sẵn');
    await vaoHoiDap(p);
    const cau = await p.textContent('#cau');
    check((await p.evaluate(() => window.__noi)).includes(cau), 'đọc to câu hỏi hiện tại');
    check(await p.isVisible('#nut-giong') && await p.getAttribute('#nut-giong', 'aria-pressed') === 'true', 'nút giọng hiện, đang bật');
    await p.click('#nut-giong');
    g = await p.evaluate(() => __pitchTest.giong());
    check(!g.bat && await p.evaluate(() => localStorage.getItem('bizon-pitch-giong')) === '0', 'tắt giọng và nhớ lựa chọn');
    const truoc = (await p.evaluate(() => window.__noi)).length; await p.click('#nut-cau-tiep');
    check((await p.evaluate(() => window.__noi)).length === truoc, 'đã tắt thì không đọc câu sau');
    await ctx.close();
  }
  {
    const { ctx, p } = await moi();
    await ctx.addInitScript(GIONG);
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=PU5&3d=0');
    check(!(await p.evaluate(() => __pitchTest.giong())).bat, 'điện thoại: giọng tắt sẵn');
    await ctx.close();
  }
  {
    const { ctx, p } = await moi({ viewport: { width: 1280, height: 860 } });
    await ctx.addInitScript(() => { Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined }); window.SpeechSynthesisUtterance = undefined; });
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=PU6&3d=0');
    await vaoHoiDap(p);
    check(await p.isHidden('#nut-giong') && !(await p.evaluate(() => __pitchTest.giong())).hoTro, 'máy không có giọng: ẩn nút, không lỗi');
    await ctx.close();
  }
  {
    const { ctx, p } = await moi({ viewport: { width: 1280, height: 860 } });
    await ctx.addInitScript(() => { localStorage.setItem('bizon-pitch-giong', '1'); Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [], speak: () => { throw new Error('khong duoc goi'); }, cancel: () => {}, addEventListener: () => {} } }); window.SpeechSynthesisUtterance = function (t) { this.text = t; }; });
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=PU7&3d=0');
    await vaoHoiDap(p);
    const g = await p.evaluate(() => __pitchTest.giong());
    check(g.bat && g.boQua >= 1 && g.daDoc.length === 0, 'bật giọng nhưng máy không có giọng VI: im lặng, không lỗi');
    await ctx.close();
  }
  // E. 3D (nếu máy có WebGL)
  {
    const { ctx, p } = await moi({ viewport: { width: 1280, height: 860 } });
    await p.goto(BASE + '/lab/pitch-goi-von.html?ma=PU8&3d=1');
    if (await p.evaluate(() => window.PitchPhong3D.hoTro())) {
      await vaoHoiDap(p, LECH);
      await p.waitForFunction(() => { const s = __pitchTest.p3(); return s.sanSang && s.khung > 0; }, null, { timeout: 30000 }).catch(() => {});
      await p.click('#nut-chua-chac'); await p.click('#nut-tu-tin');
      const s = await p.evaluate(() => __pitchTest.p3());
      check(Array.isArray(s.phanUng) && s.phanUng.some(x => x.dongTac === 'nghieng'), 'phòng 3D nhận động tác theo luật');
    } else console.log('  (máy không có WebGL: bỏ qua phần 3D)');
    await ctx.close();
  }
  check(errs.length === 0, 'không lỗi JS ' + errs.join(' | '));
  check(ngoai.length === 0, 'không gọi mạng ngoài ' + ngoai.join(' '));
  await b.close();
  if (fail) { console.error(fail + ' kiểm tra hỏng'); process.exit(1); }
  console.log('pitch-hoi-dong-phan-ung: đạt');
})().catch(e => { console.error(e); process.exit(1); });
