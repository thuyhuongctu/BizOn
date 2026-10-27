'use strict';
// THIRD-PARTY-NOTICES.md phải khớp với kho: mọi tệp vendor và mọi họ phông đều được liệt kê;
// LICENSE, README, chinh-sach.html trỏ tới tệp này; hồ sơ SHTT có mục C6 BIZONLAND và tờ khai điền sẵn.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const notes = read('THIRD-PARTY-NOTICES.md');

// --- 1 · mọi tệp trong js/vendor và vendor/ có mặt ---
const vendored = [];
for (const d of ['js/vendor', 'vendor']) for (const f of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
  if (f.isDirectory()) { for (const g of fs.readdirSync(path.join(ROOT, d, f.name))) if (!/^(LICENSE|README\.md)$/.test(g)) vendored.push(`${d}/${f.name}/${g}`); }
  else vendored.push(`${d}/${f.name}`);
}
assert.ok(vendored.length >= 15, 'kiểm kê vendor quá ít: ' + vendored.length);
for (const f of vendored) assert.ok(notes.includes('`' + f + '`'), 'chưa liệt kê ' + f);

// --- 2 · mọi họ phông trong assets/fonts ---
const fam = new Set(fs.readdirSync(path.join(ROOT, 'assets/fonts')).filter(f => f.endsWith('.woff2')).map(f => f.split('-')[0]));
const names = { BeVietnamPro: 'Be Vietnam Pro', PlusJakartaSans: 'Plus Jakarta Sans', Manrope: 'Manrope', IBMPlexMono: 'IBM Plex Mono', DMSerifDisplay: 'DM Serif Display', Nunito: 'Nunito', Baloo2: 'Baloo 2' };
for (const k of fam) { assert.ok(names[k], 'họ phông mới chưa có tên: ' + k); assert.ok(notes.includes('| ' + names[k] + ' |'), 'chưa liệt kê phông ' + names[k]); }
assert.ok(fs.existsSync(path.join(ROOT, 'assets/fonts/OFL.txt')) && notes.includes('assets/fonts/OFL.txt'));
assert.ok(!fs.readdirSync(path.join(ROOT, 'assets/fonts')).some(f => /jetbrains/i.test(f)), 'có tệp JetBrains Mono thật thì sửa ghi chú IBM Plex Mono');

// --- 3 · giấy phép và phiên bản khớp tiêu đề tệp ---
assert.match(read('js/vendor/gsap.min.js').slice(0, 300), /GSAP 3\.15\.0/); assert.ok(notes.includes('| 3.15.0 | GSAP Standard'));
assert.match(read('js/vendor/d3.min.js').slice(0, 100), /v7\.9\.0/); assert.ok(notes.includes('| 7.9.0 | ISC |'));
assert.match(read('js/vendor/topojson-client.min.js').slice(0, 120), /v3\.1\.0/); assert.ok(notes.includes('| 3.1.0 | ISC |'));
assert.match(read('js/vendor/auto-animate.min.js').slice(0, 120), /v0\.10\.0 \| MIT/); assert.ok(notes.includes('| 0.10.0 | MIT'));
assert.match(read('js/vendor/three.module.js').slice(0, 200), /SPDX-License-Identifier: MIT/); assert.match(read('js/vendor/three.core.js').slice(0, 400), /REVISION = '184'/); assert.ok(notes.includes('| r184 | MIT |'));
assert.ok(read('vendor/peerjs/peerjs.min.js').includes('"1.5.4"')); assert.ok(notes.includes('| 1.5.4 | MIT |'));
assert.match(read('vendor/react/react.production.min.js').slice(0, 300), /@license React/); assert.ok(notes.includes('| 18.3.1 | MIT |'));
assert.ok(fs.existsSync(path.join(ROOT, 'vendor/auto-animate/LICENSE')));
assert.ok(notes.includes('assets/models/SOURCES.md') && notes.includes('CC0 1.0') && notes.includes('`js/vendor/countries-110m.json`'));

// --- 4 · ngoại lệ CDN được liệt kê đúng ---
for (const f of ['kt330h/index.html', 'BizOn Game 3D.html', 'Characters 3D.html', 'HQ Asset Gallery.html', 'Trang Giang Vien.dc.html']) {
  assert.ok(read(f).includes('fonts.googleapis.com/css'), f + ' không còn tải Google Fonts: cập nhật THIRD-PARTY-NOTICES.md'); assert.ok(notes.includes('`' + f + '`'));
}
assert.ok(read('bp3d-boat/three-d-stage.js').includes('unpkg.com/three@0.184.0') && notes.includes('three.js 0.184.0'));
assert.ok(read('bp3d-explainer.html').includes('@babel/standalone@7.29.0') && notes.includes('@babel/standalone` 7.29.0'));
assert.ok(read('lab/ho-chieu-sau-rieng-3d.html').includes('esm.sh/three@0.160.0') && notes.includes('three.js 0.160.0'));
assert.ok(!read('Trang Giang Vien.dc.html').includes('<script src="https://unpkg.com/react'), 'React phải nạp từ vendor/react, không từ unpkg');

// --- 5 · tham chiếu chéo ---
assert.ok(read('LICENSE').includes('THIRD-PARTY-NOTICES.md') && !read('LICENSE').includes('Google Fonts: Plus Jakarta Sans, Manrope (SIL'));
assert.ok(read('README.md').includes('[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)') && read('README.md').includes('Nunito and Baloo 2'));
assert.ok(read('chinh-sach.html').includes('THIRD-PARTY-NOTICES.md') && !read('chinh-sach.html').includes('No third-party fonts or code are loaded from a CDN at runtime.'));
assert.ok(notes.includes('test/third-party-notices.test.js'));

// --- 6 · hồ sơ SHTT: mục C6 BIZONLAND và tờ khai điền sẵn ---
const ho = read('docs/ho-so-so-huu-tri-tue.md');
assert.ok(ho.includes('## C6 · Nhãn hiệu «BIZONLAND»') && ho.indexOf('## C6') < ho.indexOf('# PHẦN D'));
assert.ok(ho.includes('| **0** | **BIZONLAND** | Chữ |') && ho.includes('(ip/NHAN-HIEU-BIZONLAND-TO-KHAI-2026.md)') && ho.includes('[`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md)'));
assert.ok(ho.includes('hai đồng chủ đơn Đỗ Thùy Hương và Phan Anh Tú') && ho.includes('Đỗ Thùy Hương là người nộp') && ho.includes('dichvucong.ipvietnam.gov.vn'));
assert.ok(ho.includes('Thông tư 10/2026/TT-BKHCN') && ho.includes('TT 29/2026/TT-BTC') && ho.includes('TT 64/2025/TT-BTC'));
assert.ok(ho.includes('| 1 | **Nhãn hiệu «BIZONLAND» – Nhóm 9 + 41, nộp trực tuyến (C6)**'));
const tk = read('docs/ip/NHAN-HIEU-BIZONLAND-TO-KHAI-2026.md');
for (const s of ['**BIZONLAND** — nhãn **chữ**', 'Chủ đơn 1 (đồng chủ đơn, **người nộp và liên hệ**) | **Đỗ Thùy Hương**', 'Chủ đơn 2 (đồng chủ đơn) | **Phan Anh Tú**', 'Mẫu số 04', 'VNeID **mức 2**', 'wipopublish.ipvietnam.gov.vn', '| **9** |', '| **41** |', '**≈ 2.020.000 đ**', 'NHAN-HIEU-GIAY-UY-QUYEN-MAU.md', '../../THIRD-PARTY-NOTICES.md']) assert.ok(tk.includes(s), 'tờ khai thiếu: ' + s);
assert.ok(read('docs/ip/NHAN-HIEU-GOI-NOP-2026.md').includes('| **BIZONLAND** | Chữ |'));
// mọi liên kết nội bộ trong hai tài liệu mới trỏ tới tệp có thật
for (const [f, base] of [['docs/ip/NHAN-HIEU-BIZONLAND-TO-KHAI-2026.md', 'docs/ip'], ['THIRD-PARTY-NOTICES.md', '.']]) {
  for (const m of read(f).matchAll(/\]\(([^)#http][^)]*)\)/g)) assert.ok(fs.existsSync(path.join(ROOT, base, m[1])), f + ' liên kết hỏng: ' + m[1]);
}
assert.match(read('sw.js'), /CACHE = 'bizon-v687'/);
console.log('third-party-notices: OK (' + vendored.length + ' tệp vendor, ' + fam.size + ' họ phông)');
