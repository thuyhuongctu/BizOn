// Xưởng Nhãn Hiệu Đặc Sản (28/10/2026): phiếu bài chuyên cần chương 5 – nhãn hiệu + 4P, xuất Thẻ thương hiệu.
// Phần thuần (gợi ý, tiến độ, mã thẻ) test bằng Node; trang test bằng trình duyệt (điện thoại, song ngữ, xuất PNG).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
require(path.join(ROOT, 'js/xuong-nhan-hieu.js'));
const L = globalThis.BizOnBrandLab;

// Gợi ý bám đúng đề
let h = L.hints({ ten: 'Xanh Sạch', slogan: 'Hướng tới tương lai xanh' });
assert.ok(h.ten.some(m => m.level === 'warn'), 'tên ví dụ trong đề phải bị nhắc');
assert.ok(h.slogan.some(m => m.level === 'warn'), 'slogan ví dụ trong đề phải bị nhắc');
h = L.hints({ ten: 'Sạch' }); assert.ok(h.ten[0].level === 'warn', 'tên chung chung phải bị nhắc');
h = L.hints({ ten: 'Mắm Bà Tư' }); assert.equal(h.ten[0].level, 'ok');
h = L.hints({ slogan: 'một hai ba bốn năm sáu bảy tám chín mười mười một' }); assert.ok(h.slogan.some(m => /dài/.test(m.vi)));
h = L.hints({ product: 'Sản phẩm chất lượng cao, đáp ứng nhu cầu khách hàng.' }); assert.ok(h.product.some(m => /chung chung/.test(m.vi)));
h = L.hints({ place: ['shopee', 'tiktok'] }); assert.ok(h.place.some(m => /trực tuyến và trực tiếp/.test(m.vi)), 'thiếu kênh trực tiếp phải bị nhắc');
h = L.hints({ place: ['shopee', 'hoicho'] }); assert.ok(!h.place, 'đủ hai loại kênh thì không nhắc');
h = L.hints({ priceStrategy: 'tham-nhap', giaBan: 'rẻ' }); assert.ok(h.price.some(m => /giá bán dự kiến/.test(m.vi)));
h = L.hints({ giaiThich: 'Tên đẹp.' }); assert.ok(h.giaiThich.length >= 3, 'giải thích ngắn, thiếu ý vốn nhỏ/khách trong nước/nét riêng');

// Tiến độ và mã thẻ
const full = { nhom: 'nong-san', sanPham: 'Mắm cá linh', vung: 'An Giang', ten: 'Linh Mùa Nước', slogan: 'Vị mùa nước nổi',
  giaiThich: 'Tên ngắn gợi mùa nước nổi An Giang, dễ nhớ với khách trong nước, in nhãn rẻ nên hợp doanh nghiệp mới vốn nhỏ mới thành lập.',
  product: 'Cá linh non đánh bắt mùa nước nổi, ủ muối và thính gạo 30 ngày, hũ thủy tinh 500 g, hạn dùng 6 tháng.',
  priceStrategy: 'gia-tri', giaBan: '120.000 đ/hũ 500 g', priceReason: 'Cao hơn mắm chợ khoảng 20% vì hũ quà tặng, vẫn thấp hơn hàng OCOP 4 sao.',
  place: ['shopee', 'hoicho'], promo: ['cauchuyen', 'video'], promoNote: 'Tháng đầu: 8 video ngắn quay mùa nước nổi trên TikTok, mời 3 KOC địa phương, chi 3 triệu đồng.' };
assert.deepEqual(L.progress(full), { done: 8, total: 8 });
assert.equal(L.progress({}).done, 0);
assert.match(L.code(full), /^XNH-[0-9A-F]{4}-[0-9A-F]{4}$/);
assert.equal(L.code(full), L.code(Object.assign({}, full, { hoTen: 'A', mssv: '1' })), 'mã thẻ không phụ thuộc họ tên');
assert.notEqual(L.code(full), L.code(Object.assign({}, full, { slogan: 'Khác' })));
assert.equal(L.fileName(full), 'the-thuong-hieu-linh-mua-nuoc.png');

// Trang
const s = read('xuong-nhan-hieu.html');
for (const need of ['js/bizon-clay-nav.js', 'js/bizon-clay-footer.js', 'js/bizon-clay-i18n.js', 'js/xuong-nhan-hieu.js']) assert.ok(s.includes(need), 'thiếu ' + need);
assert.ok(s.includes('Đề bài © 2026 ThS. Đỗ Thùy Hương'), 'thiếu dòng ghi đề bài');
assert.ok(read('giang-vien.html').includes('href="xuong-nhan-hieu.html"'), 'trang giảng viên chưa có lối vào');
assert.ok(read('sitemap.xml').includes('https://bizonland.com/xuong-nhan-hieu.html<'), 'sitemap thiếu trang');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 706);

(async () => {
  const b = await chromium.launch(); const errs = [];
  try {
    for (const [lang, want] of [['vi', 'Xưởng Nhãn Hiệu Đặc Sản'], ['en', 'Local Specialty Brand Lab']]) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
      const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
      await pg.addInitScript(l => { try { localStorage.setItem('bizon-lang', l); } catch (e) {} }, lang);
      await pg.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
      await pg.goto(BASE + '/xuong-nhan-hieu.html', { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(600);
      assert.equal((await pg.textContent('h1')).trim(), want, lang + ': tiêu đề');
      assert.equal(await pg.$$eval('[data-group="place"] input', l => l.length), 7);
      await pg.fill('[name="ten"]', 'Xanh Sạch');
      assert.ok(await pg.$eval('[data-for="ten"]', el => el.children.length > 0), lang + ': gợi ý tên hiện ngay khi gõ');
      await pg.fill('[name="sanPham"]', 'Mắm cá linh'); await pg.fill('[name="vung"]', 'An Giang'); await pg.check('[name="nhom"][value="nong-san"]');
      assert.match(await pg.textContent('#xn-progress'), /^2\/8$/, 'sản phẩm + tên = 2/8');
      assert.ok(await pg.evaluate(() => JSON.parse(localStorage.getItem('bizon-xnh-v1')).ten === 'Xanh Sạch'), 'lưu nháp');
      const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#xn-png')]);
      assert.equal(dl.suggestedFilename(), 'the-thuong-hieu-xanh-sach.png');
      assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), lang + ': tràn ngang trên điện thoại');
      await ctx.close();
    }
  } finally { await b.close(); }
  assert.deepEqual(errs, []);
  console.log('xuong-nhan-hieu: ok');
})().catch(e => { console.error(e); process.exit(1); });
