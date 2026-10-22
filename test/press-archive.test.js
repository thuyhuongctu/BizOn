/* Kiểm thử Kho báo chí.
 *
 * - bao-chi.html, doi-ngu.html, bang-chung.html phải khớp đúng phần sinh từ
 *   data/bao-chi.json (chạy lại scripts/build-press.mjs nếu lệch).
 * - Kho liệt kê đủ mọi bài, có lối vào từ chân trang và có trong sw.js.
 */
'use strict';
const test = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const data = JSON.parse(read('data/bao-chi.json'));

test('phần báo chí đã sinh khớp data/bao-chi.json', async () => {
  const { build } = await import(pathToFileURL(path.join(ROOT, 'scripts', 'build-press.mjs')));
  const out = build(pathToFileURL(ROOT + path.sep), data);
  for (const [file, html] of Object.entries(out))
    assert.strictEqual(read(file), html, file + ' lệch dữ liệu – chạy: node scripts/build-press.mjs');
});

test('kho báo chí liệt kê đủ mọi bài, mới nhất trước', () => {
  const s = read('bao-chi.html');
  for (const a of data.articles) {
    assert.ok(s.includes('id="bai-' + a.id + '"'), 'thiếu bài ' + a.id);
    assert.ok(s.includes('href="' + a.url.replace(/&/g, '&amp;') + '"'), 'thiếu liên kết ' + a.id);
  }
  const dates = [...s.matchAll(/<section class="bz-month" data-month="(\d{4}-\d{2})">/g)].map(m => m[1]);
  assert.deepStrictEqual(dates, [...dates].sort().reverse(), 'tháng phải xếp mới nhất trước');
  assert.strictEqual(new Set(data.articles.map(a => a.url)).size, data.articles.length, 'trùng đường dẫn bài');
});

test('kho báo chí có lối vào từ chân trang, Đội ngũ, Bằng chứng và sw.js', () => {
  assert.ok(/href:'bao-chi\.html'/.test(read('js/bizon-clay-footer.js')), 'chân trang thiếu Kho báo chí');
  assert.ok(read('sw.js').includes("'./bao-chi.html'"), 'sw.js thiếu bao-chi.html');
  for (const f of ['doi-ngu.html', 'bang-chung.html'])
    assert.ok(read(f).includes('href="bao-chi.html"'), f + ' thiếu liên kết tới kho báo chí');
});
