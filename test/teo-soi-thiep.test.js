// 21/11/2026: chị đổi «viết thiệp gửi thầy cô cùng rồng xanh BizOn» thành «… cùng Tèo Soi» (tên rồng BizOn) trên trang chủ
// và phần mô tả trang 20/11; bản EN «with Tèo Soi». index.html vẫn giống hệt academia3d-v2.html.
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
for (const f of ['index.html', 'academia3d-v2.html']) {
  const s = read(f);
  assert.ok(s.includes('data-en="Thank you, teachers · write a card for your teacher with Tèo Soi →">Tri ân thầy cô · viết thiệp gửi thầy cô cùng Tèo Soi →</span>'), f + ': dòng tin 20/11 dùng tên Tèo Soi');
}
assert.equal(read('index.html'), read('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
const le = read('ngay-nha-giao-20-11.html');
assert.ok(le.includes('gửi lời cảm ơn cùng rồng Tèo Soi.') && le.includes('with Tèo Soi, the BizOn dragon.'), 'mô tả trang 20/11 dùng tên Tèo Soi');
for (const f of ['index.html', 'academia3d-v2.html', 'ngay-nha-giao-20-11.html']) assert.ok(!/rồng xanh BizOn|BizOn green dragon/i.test(read(f)), f + ': không còn «rồng xanh BizOn»');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 946, 'sw.js ≥ v946');
console.log('teo-soi-thiep: ok');
