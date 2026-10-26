#!/usr/bin/env node
// Đóng gói lại bản 3D offline của Hộ Chiếu Sầu Riêng (lab/ho-chieu-sau-rieng-3d.html).
//
// Bản 3D là một tệp HTML tự chứa: các tài nguyên nằm trong <script type="__bundler/manifest">
// (JSON {uuid: {mime, compressed, data(base64)}}; JS được nén gzip), còn trang chơi nằm trong
// <script type="__bundler/template"> (một chuỗi JSON, mọi «</» được viết thành «<\u002F»).
//
// Cách dùng (chạy từ gốc repo):
//   node scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs                 đồng bộ engine/data/core từ lab/*.js vào bundle
//   node scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs --check         chỉ kiểm tra, thoát 1 nếu bundle lệch lab/*.js
//   node scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs --extract-template /tmp/tpl.html
//                                                                           xuất trang chơi (template) ra tệp để sửa
//   node scripts/release/rebundle-ho-chieu-sau-rieng-3d.mjs --template /tmp/tpl.html
//                                                                           nạp lại template đã sửa (kèm đồng bộ JS)
//
// Tất định: cùng đầu vào cho cùng tệp ra (gzip mức 9, mtime 0, byte OS cố định = 3).
// Tài nguyên không đổi nội dung thì giữ nguyên chuỗi base64 cũ.
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync, gunzipSync } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BUNDLE = resolve(ROOT, 'lab/ho-chieu-sau-rieng-3d.html');

// uuid trong manifest → tệp nguồn. Template nạp chúng bằng <script src="uuid">.
export const ASSETS = {
  '34b8e811-733d-42a5-8047-c2311f4b9411': 'lab/ho-chieu-sau-rieng-engine.js',
  '62ff4bdc-13be-40e1-95aa-ec770011ad8c': 'lab/ho-chieu-sau-rieng-data.js',
  'c0de5a17-d0c1-4e5a-9b0e-3a1d2c4f5e6b': 'lab/ho-chieu-sau-rieng-core.js',
  // Hai tệp dùng chung toàn site cho màn «Báo cáo sau 6 vụ»: cấu hình backend công khai và chứng nhận ĐHCT
  '5d1f0c7e-9a3b-4c2d-8e1f-0a1b2c3d4e5f': 'js/backend-config.js',
  '7e2a9b4c-1d3f-4a5b-9c6d-1e2f3a4b5c6d': 'js/official-cert.js',
  // Hành trình 3 bậc (J8): cùng CSS và bốn mô-đun với bản 2D – hộp thoại hành trang, ghi Bậc 3 vào hộ chiếu cục bộ.
  // Bốn mô-đun ghép thành MỘT asset (theo thứ tự phụ thuộc) vì runtime nạp các <script> trong <helmet> bất đồng bộ,
  // không giữ thứ tự giữa các tệp.
  '3b7f2c91-6d4e-4a8b-9c15-2e7d8f0a1b3c': 'css/journey.css',
  '8a4e6d12-3f5b-4c7a-8d9e-1b2c3d4e5f60': ['js/core/journey.js', 'js/journey-store.js', 'js/journey-card.js', 'js/journey-link.js', 'js/journey-sync.js', 'js/explain-mode.js']
};
const nameOf = file => (Array.isArray(file) ? file.join(' + ') : file);
const mimeOf = file => (nameOf(file).endsWith('.css') ? 'text/css' : 'application/javascript');
// Nguồn của một asset: tệp đơn, hoặc nhiều tệp nối nhau bằng một dòng trống (giữ nguyên byte từng tệp).
export const sourceOf = file => (Array.isArray(file) ? Buffer.concat(file.flatMap((f, i) => (i ? [Buffer.from('\n'), readFileSync(resolve(ROOT, f))] : [readFileSync(resolve(ROOT, f))]))) : readFileSync(resolve(ROOT, file)));

const MANIFEST_TAG = '<script type="__bundler/manifest">';
const TEMPLATE_TAG = '<script type="__bundler/template">';

function readBundle() {
  const html = readFileSync(BUNDLE, 'utf8');
  const lines = html.split('\n');
  const mi = lines.findIndex(l => l.trim() === MANIFEST_TAG);
  const ti = lines.findIndex(l => l.trim() === TEMPLATE_TAG);
  if (mi < 0 || ti < 0) throw new Error('Không tìm thấy manifest/template trong ' + BUNDLE);
  return { html, lines, mi: mi + 1, ti: ti + 1, manifest: JSON.parse(lines[mi + 1]), template: JSON.parse(lines[ti + 1]) };
}

export function decodeEntry(e) {
  const raw = Buffer.from(e.data, 'base64');
  return e.compressed ? gunzipSync(raw) : raw;
}

function encodeGzip(buf) {
  const gz = gzipSync(buf, { level: 9 });
  gz[4] = gz[5] = gz[6] = gz[7] = 0; // mtime
  gz[9] = 3;                           // OS = Unix, giống nhau trên mọi máy
  return gz.toString('base64');
}

const encodeTemplate = tpl => JSON.stringify(tpl).replace(/<\//g, '<\\u002F');

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const arg = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
  const b = readBundle();

  const ex = arg('--extract-template');
  if (ex) { writeFileSync(ex, b.template); console.log('Đã xuất template → ' + ex); return; }

  let template = b.template;
  const tplFile = arg('--template');
  if (tplFile) template = readFileSync(tplFile, 'utf8');

  const problems = [];
  let changed = template !== b.template;
  for (const [uuid, spec] of Object.entries(ASSETS)) {
    const file = nameOf(spec), src = sourceOf(spec);
    const e = b.manifest[uuid];
    if (!template.includes('"' + uuid + '"')) problems.push(`${file}: template không nạp uuid ${uuid}`);
    if (e && e.mime !== mimeOf(file)) { problems.push(`${file}: mime trong bundle (${e.mime}) khác ${mimeOf(file)}`); e.mime = mimeOf(file); changed = true; }
    if (e && decodeEntry(e).equals(src)) continue;
    problems.push(`${file}: ${e ? 'nội dung trong bundle khác tệp nguồn' : 'chưa có trong manifest'}`);
    b.manifest[uuid] = { mime: mimeOf(file), compressed: true, data: encodeGzip(src) };
    changed = true;
  }

  if (check) {
    if (problems.length) { console.error('Bundle 3D lệch nguồn:\n  ' + problems.join('\n  ')); process.exit(1); }
    console.log('Bundle 3D khớp ' + Object.values(ASSETS).map(nameOf).join(', '));
    return;
  }
  if (!changed) { console.log('Bundle 3D đã khớp nguồn, không cần ghi.'); return; }
  b.lines[b.mi] = JSON.stringify(b.manifest);
  b.lines[b.ti] = encodeTemplate(template);
  writeFileSync(BUNDLE, b.lines.join('\n'));
  console.log('Đã ghi ' + BUNDLE + (problems.length ? '\n  ' + problems.join('\n  ') : ''));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
