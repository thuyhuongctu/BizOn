'use strict';
// Workflow đóng gói CH Play (android-build.yml) phải build đúng ứng dụng đang có trên Play
// (io.github.thuyhuongctu.bizon, dựng bằng Bubblewrap), và chặn bản ký sai khóa tải lên.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const wf = read('.github/workflows/android-build.yml');
const twa = JSON.parse(read('android/twa-manifest.json'));
const links = JSON.parse(read('.well-known/assetlinks.json'));

assert.equal(twa.packageId, 'io.github.thuyhuongctu.bizon', 'twa-manifest là ứng dụng trên Play');
assert.equal(twa.host, 'bizonland.com', 'TWA trỏ tên miền chính, không qua chuyển hướng 301');
assert.ok(Number.isInteger(twa.appVersionCode) && twa.appVersionCode >= 2, 'versionCode lớn hơn bản 1.1.0');

assert.ok(wf.includes('PACKAGE_ID: io.github.thuyhuongctu.bizon'), 'workflow đóng gói đúng package');
assert.ok(!wf.includes('vn.bizon.simulation:'), 'không dùng package thử cũ');
assert.ok(wf.includes('bubblewrap update --skipVersionUpgrade < /dev/null'), 'dựng dự án không cần trả lời câu hỏi');
assert.ok(wf.includes('./gradlew bundleRelease'), 'build .aab');
assert.ok(wf.includes('jarsigner -verify'), 'kiểm chữ ký');

const fp = (wf.match(/UPLOAD_KEY_SHA256: '([0-9A-F:]+)'/) || [])[1];
assert.ok(fp && fp.length === 95, 'workflow ghi vân tay SHA-256 của khóa tải lên');
const entry = links.find(l => l.target.package_name === twa.packageId);
assert.ok(entry && entry.target.sha256_cert_fingerprints.includes(fp), 'vân tay khóa tải lên có trong assetlinks.json');
assert.ok(/if \[ "\$FP" != "\$UPLOAD_KEY_SHA256" \]/.test(wf), 'dừng khi khóa trong secret không khớp');
assert.ok(!/KEYSTORE_PASSWORD: [^$]/.test(wf), 'mật khẩu chỉ lấy từ secret');

console.log('android-play-build: ok');
