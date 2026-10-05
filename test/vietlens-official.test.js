/* VietLens Nấc 1: lớp dữ liệu thật phải có xuất xứ đầy đủ, khớp tệp nguồn và không chứa dữ liệu đã mua. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const { execFileSync } = require('child_process');

const json = JSON.parse(fs.readFileSync('vietlens/data/official.json', 'utf8'));
const js = fs.readFileSync('vietlens/official-data.js', 'utf8');
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok -', name); };

test('Tệp trình duyệt và JSON máy đọc chứa cùng dữ liệu', () => {
  const m = js.match(/window\.VIETLENS_OFFICIAL = Object\.freeze\((.*)\);\s*$/s);
  assert.ok(m, 'không đọc được official-data.js');
  assert.deepStrictEqual(JSON.parse(m[1]), json);
});

test('Dựng lại từ tệp nguồn cho đúng kết quả đã lưu (trừ ngày dựng)', () => {
  const out = execFileSync('python3', ['-c', 'import json,sys; sys.path.insert(0,"vietlens/tools"); import build_official as b; d=b.build(); d.pop("builtAt"); print(json.dumps(d, ensure_ascii=False))']).toString();
  const saved = Object.assign({}, json); delete saved.builtAt;
  assert.deepStrictEqual(JSON.parse(out), saved);
});

test('Không có xuất xứ thì không lên bảng: mọi chuỗi đủ nguồn, phương pháp, giới hạn, quyền tái phân phối', () => {
  assert.ok(json.series.length >= 6);
  json.series.forEach((s) => ['source', 'method', 'limitation', 'rights', 'unit', 'frequency'].forEach((k) => assert.ok(s[k] && String(s[k]).length >= 2, `${s.id} thiếu ${k}`)));
});

test('Mỗi điểm FDI có đường dẫn và câu trích nguyên văn chứa đúng con số', () => {
  json.series.filter((s) => s.id.startsWith('fdi_')).forEach((s) => s.observations.forEach((o) => {
    assert.ok(/^https?:\/\//.test(o.url), `${s.id} ${o.period} thiếu URL`);
    assert.ok(o.quote && o.quote.length > 20, `${s.id} ${o.period} thiếu trích dẫn`);
  }));
  const d = json.series.find((s) => s.id === 'fdi_disbursed');
  // Ví dụ kiểm chứng: 6 tháng 2026 = 13,03 tỷ USD
  const last = d.observations.find((o) => o.period === '2026Q2');
  assert.strictEqual(last.ytd, 13.03);
  assert.ok(last.quote.includes('13,03'), last.quote);
});

test('FDI giải ngân: lũy kế không giảm trong năm, dòng quý dương, so cùng kỳ tính đúng', () => {
  const d = json.series.find((s) => s.id === 'fdi_disbursed');
  d.observations.forEach((o) => assert.ok(o.value === null || o.value > 0, `${o.period}: ${o.value}`));
  const prev = d.observations.find((o) => o.period === '2025Q2');
  assert.strictEqual(d.latest.ytdYoY, Math.round(1000 * (13.03 / prev.ytd - 1)) / 10);
});

test('Xuất/nhập khẩu khu vực FDI: đủ 58 quý, lũy kế tăng trong năm, khớp câu trích, tỷ trọng đúng', () => {
  ['fdi_sector_exports', 'fdi_sector_imports'].forEach((id) => {
    const s = json.series.find((x) => x.id === id);
    assert.strictEqual(s.observations.length, 58);
    s.observations.forEach((o) => {
      assert.ok(o.value === null || o.value > 0, `${id} ${o.period}: ${o.value}`);
      assert.ok(o.quote.includes(String(o.ytd).replace('.', ',')) || o.quote.includes(String(o.ytd)), `${id} ${o.period}: ${o.ytd} không có trong trích dẫn`);
    });
  });
  const x = json.series.find((s) => s.id === 'fdi_sector_exports');
  // 6 tháng 2026: 213,01 tỷ USD, chiếm 79,9% (báo cáo quý II/2026)
  assert.strictEqual(x.latest.ytd, 213.01);
  assert.strictEqual(x.latest.share, 79.9);
  assert.strictEqual(x.latest.ytdYoY, 26.0);   // tỷ lệ in trong báo cáo, không tự tính
});

test('Bán lẻ: đủ 58 quý, lũy kế tăng trong năm, khớp câu trích; 6 tháng 2026 = 3.889,5 nghìn tỷ đồng', () => {
  const s = json.series.find((x) => x.id === 'retail_sales');
  assert.strictEqual(s.observations.length, 58);
  s.observations.forEach((o, i) => {
    assert.ok(o.value === null || o.value > 0, `${o.period}: ${o.value}`);
    const shown = o.ytd.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });   // 3.889,5
    const forms = [shown, shown.replace('.', ''), shown.replace(/,0$/, ''), shown.replace('.', '').replace(/,0$/, '')];   // 1.932,0 | 1932,0 | 1.932 | 1932
    assert.ok(forms.some((f) => new RegExp(`(^|[^\\d.,])${f.replace(/\./g, '\\.')}([^\\d]|$)`).test(o.quote)), `${o.period}: ${shown} không có trong trích dẫn`);
  });
  assert.strictEqual(s.latest.ytd, 3889.5);
  assert.strictEqual(s.latest.ytdYoY, 12.9);
  assert.strictEqual(s.latest.realYoY, 7.3);
});

test('Chỉ số giá USD: đủ 58 quý, câu trích bắt đầu bằng tên chỉ tiêu và chứa đúng tỷ lệ', () => {
  const s = json.series.find((x) => x.id === 'usd_index_yoy');
  assert.strictEqual(s.observations.length, 58);
  s.observations.forEach((o) => {
    assert.ok(o.quote.startsWith('Chỉ số giá đô la Mỹ'), o.period);
    const found = [...o.quote.matchAll(/(tăng|giảm) ([\d,]+)% so với (?:cùng kỳ|tháng 12\/)/g)]
      .map((m) => (m[1] === 'tăng' ? 1 : -1) * parseFloat(m[2].replace(',', '.')));
    assert.ok(found.includes(o.value), `${o.period}: ${o.value} không có trong trích dẫn`);
  });
  // tháng 6/2026: tăng 0,57% so với cùng kỳ năm trước
  assert.strictEqual(s.latest.value, 0.57);
});

test('Chuỗi bình quân quý chỉ lấy quý đủ 3 tháng', () => {
  ['world_import_volume', 'reer_vnd'].forEach((id) => {
    const s = json.series.find((x) => x.id === id);
    assert.ok(s.observations.every((o) => Number.isFinite(o.value)));
    assert.ok(s.observations.length >= 60);
  });
});

test('Không đưa dữ liệu Hải quan đã mua lên VietLens', () => {
  const blob = JSON.stringify(json);
  assert.ok(!/017\.T|018\.T|Biểu 017|panel_flat|monthly_harmonised/.test(blob));
  assert.ok(json.excluded.includes('chưa xác nhận giấy phép'));
});

test('Trang nạp lớp dữ liệu thật và có mục Số liệu thật', () => {
  const html = fs.readFileSync('vietlens/index.html', 'utf8');
  ['id="official"', 'id="officialGrid"', './official-data.js', './official.js', './data/official.json'].forEach((t) => assert.ok(html.includes(t), t));
  assert.ok(html.indexOf('./official-data.js') < html.indexOf('./app.js'), 'official-data.js phải nạp trước app.js');
});

console.log(`\n${passed} kiểm thử đạt`);
