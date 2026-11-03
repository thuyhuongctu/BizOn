// Tên hiển thị của trang chủ bằng tiếng Anh (03/11/2026): tab trình duyệt, tên khi thêm ra màn hình chính (iPhone),
// khung xem trước khi chia sẻ link. index.html và academia3d-v2.html vẫn giống hệt nhau.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const home = read('index.html');
assert.equal(home, read('academia3d-v2.html'), 'index.html phải giống hệt academia3d-v2.html');
const title = (home.match(/<title>([^<]*)<\/title>/) || [])[1];
assert.equal(title, 'BizOn – Business Decision Simulation Ecosystem');
assert.ok(home.includes('<meta property="og:title" content="BizOn – Business Decision Simulation Ecosystem">'));
assert.ok(home.includes('<meta property="og:description" content="Explainable business simulations, from Vietnam to the world.">'));
assert.ok(home.includes('<meta name="apple-mobile-web-app-title" content="BizOn">') && home.includes('<meta name="application-name" content="BizOn">'), 'tên ngắn khi cài ra màn hình chính');
assert.ok(home.includes('<meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="vi_VN">'));
assert.ok(!/<title>[^<]*sinh thái/.test(home) && !/og:title" content="[^"]*sinh thái/.test(home), 'không còn tiêu đề tiếng Việt');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 755);
console.log('tieu-de-tieng-anh: ok');
