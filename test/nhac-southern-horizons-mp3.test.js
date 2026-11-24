// 24/11/2026: bản tiếng Anh · Pháp «Southern Horizons» của bài tri ân «Ngọn hải đăng soi đường»,
// đặt ở assets/audio/ để Chansonia (chansonia.jemappellehuong.com) phát trực tiếp như các bài BizOn khác.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => path.join(__dirname, '..', f);
const F = 'assets/audio/southern-horizons.mp3';
assert.ok(fs.existsSync(R(F)), 'có tệp nhạc');
assert.equal(fs.readFileSync(R(F)).subarray(0, 3).toString('latin1'), 'ID3', 'MP3 hợp lệ');
const kb = fs.statSync(R(F)).size / 1024;
assert.ok(kb > 2000 && kb < 8000, 'dung lượng hợp lý cho một bài ~4:19');
assert.ok(+(/CACHE = 'bizon-v(\d+)'/.exec(fs.readFileSync(R('sw.js'), 'utf8')) || [])[1] >= 984, 'sw.js ≥ v984');
console.log('nhac-southern-horizons-mp3: đạt');
