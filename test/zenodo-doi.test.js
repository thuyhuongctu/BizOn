// Nút «Zenodo DOI» của hai tác giả phải trỏ về DOI bản phát hành BizOn mà chị chọn (10.5281/zenodo.23325489 – v.1.3, khớp
// trường doi: của CITATION.cff), không phải DOI của M-AIDA (10.5281/zenodo.21282517 – dự án song hành).
// Lỗi chị báo 20/11/2026 trên trang Đội ngũ (điện thoại).
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const doi = (read('CITATION.cff').match(/^doi: (10\.5281\/zenodo\.\d+)$/m) || [])[1];
assert.equal(doi, '10.5281/zenodo.23325489', 'CITATION.cff ghi DOI bản phát hành chị chọn');
const nguoi = read('js/site-people.js');
assert.ok(nguoi.includes("zenodo: '" + doi + "'") && (nguoi.match(new RegExp("zenodo: '" + doi.replace(/\./g, '\\.') + "'", 'g')) || []).length === 2, 'site-people.js: cả hai tác giả dùng DOI của BizOn');
const dn = read('doi-ngu.html');
assert.equal((dn.match(/href="https:\/\/doi\.org\/10\.5281\/zenodo\.23325489" target="_blank" rel="noopener">Zenodo DOI<\/a>/g) || []).length, 2, 'doi-ngu.html: hai nút Zenodo DOI (chị Hương, thầy Tú) trỏ về DOI chị chọn');
// Nút ngay sau OSF của chị Hương (osf.io/m25qs) là «Zenodo DOI» và trỏ về BizOn
const sauOsf = dn.slice(dn.indexOf('https://osf.io/m25qs/'), dn.indexOf('https://osf.io/m25qs/') + 400);
assert.ok(sauOsf.includes('href="https://doi.org/' + doi + '"') && sauOsf.includes('>Zenodo DOI</a>'), 'doi-ngu.html: nút Zenodo DOI của chị Hương trỏ về BizOn');
assert.ok(!dn.includes('zenodo.21282517'), 'doi-ngu.html: không còn DOI M-AIDA ở nút tác giả');
for (const f of ['doi-ngu.html', 'js/site-people.js', 'universe.html', 'gioi-thieu.html', 'index.html']) {
  if (!fs.existsSync(path.join(__dirname, '..', f))) continue;
  const s = read(f), m = [...s.matchAll(/zenodo\.21282517[^"'<]*/g)];
  // M-AIDA chỉ được nhắc ở mục «Dự án song hành», không gắn vào nút «Zenodo DOI» của tác giả
  assert.ok(!/Zenodo DOI/.test(s.slice(Math.max(0, (m[0] || { index: -1 }).index - 300), (m[0] || { index: -1 }).index + 300)) || !m.length, f + ': nút Zenodo DOI không trỏ về M-AIDA');
}
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 923, 'sw.js ≥ bizon-v923');
console.log('zenodo-doi: ok');
