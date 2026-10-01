/* Kiểm thử Gravity Lab: dữ liệu công bố chép đúng + bộ máy ước lượng cho kết quả đúng. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const E = require('../lab/gravity-lab-engine.js');
const D = require('../lab/gravity-lab-data.js');

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('ok -', name); };

// ---------- Dữ liệu công bố ----------
test('Xuan & Xing Bảng 1: tổng từng nước khớp dòng Total', () => {
  D.xuanXing2008.series.forEach(s => {
    assert.strictEqual(s.v.length, D.xuanXing2008.years.length, s.id + ' đủ 15 năm');
    const sum = s.v.reduce((a, b) => a + b, 0);
    if (s.note) near(sum, 2455.6, 0.05, 'Tổng ô ' + s.id + ' (dòng Total in lệch, đã ghi chú)');
    else near(sum, s.total, 0.25, 'Tổng ' + s.id);
  });
});

test('Phan & Đỗ Bảng 6: đủ 8 mô hình, mọi biến đều được khai báo', () => {
  const ids = new Set(D.paper2019.vars.map(v => v.id));
  assert.strictEqual(D.paper2019.models.length, 8);
  D.paper2019.models.forEach((m, i) => {
    Object.keys(m.c).forEach(k => assert.ok(ids.has(k), `Mô hình ${i + 1}: biến lạ ${k}`));
    Object.values(m.c).forEach(([b, se]) => assert.ok(Number.isFinite(b) && se > 0));
  });
  assert.strictEqual(D.paper2019.models[7].c.fta[0], 1.01);
  assert.strictEqual(D.paper2019.models[7].c.lagfdi[0], 0.45);
});

test('Khoảng cách thủ đô tới Hà Nội nằm trong khoảng log của Bảng 4 (6,77–9,50)', () => {
  const lns = D.paper2019.countries.map(c => Math.log(E.haversineKm(D.HANOI, c.cap)));
  near(Math.min(...lns), 6.77, 0.06, 'min ln(km)');
  near(Math.max(...lns), 9.50, 0.06, 'max ln(km)');
  near(E.haversineKm(D.HANOI, [13.7563, 100.5018]), 990, 25, 'Hà Nội – Bangkok');
});

// ---------- Bộ máy ước lượng ----------
test('OLS khớp đúng đường thẳng không nhiễu', () => {
  const xs = [1, 2, 3, 4, 5, 6];
  const r = E.ols(xs.map(x => 1 + 2 * x), xs.map(x => [1, x]), ['_cons', 'x']);
  near(r.coef[0].b, 1, 1e-9, 'hằng số');
  near(r.coef[1].b, 2, 1e-9, 'độ dốc');
  near(r.r2, 1, 1e-12, 'R²');
});

test('OLS: hệ số khớp công thức cov/var', () => {
  const x = [1, 2, 4, 5, 7, 8, 10], y = [2.1, 2.9, 5.2, 5.8, 8.1, 8.7, 11.4];
  const mx = x.reduce((a, b) => a + b) / x.length, my = y.reduce((a, b) => a + b) / y.length;
  const bx = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
  const r = E.ols(y, x.map(v => [1, v]), ['_cons', 'x']);
  near(r.coef[1].b, bx, 1e-10, 'β');
  near(r.coef[0].b, my - bx * mx, 1e-10, 'α');
  assert.ok(r.coef[1].se > 0);
});

test('PPML chỉ có hằng số: exp(b) = trung bình y (kể cả quan sát bằng 0)', () => {
  const y = [0, 3, 5, 0, 12, 4];
  const r = E.ppml(y, y.map(() => [1]), ['_cons']);
  near(Math.exp(r.coef[0].b), 4, 1e-8, 'exp(b0)');
  assert.ok(r.converged);
});

test('PPML với biến giả nhóm: tái tạo đúng trung bình từng nhóm', () => {
  const g = [0, 0, 0, 1, 1, 1, 1], y = [2, 0, 4, 10, 0, 6, 8];
  const r = E.ppml(y, g.map(v => [1, v]), ['_cons', 'g']);
  near(Math.exp(r.coef[0].b), 2, 1e-8, 'nhóm 0');
  near(Math.exp(r.coef[0].b + r.coef[1].b), 6, 1e-8, 'nhóm 1');
});

test('PPML tìm lại đúng tham số khi dữ liệu sinh từ exp(a + b·x)', () => {
  const x = Array.from({ length: 30 }, (_, i) => i / 10);
  const y = x.map(v => Math.exp(0.5 - 0.8 * v));
  const r = E.ppml(y, x.map(v => [1, v]), ['_cons', 'x']);
  near(r.coef[0].b, 0.5, 1e-7, 'a');
  near(r.coef[1].b, -0.8, 1e-7, 'b');
});

test('Hiệu ứng cố định năm và loại cột cộng tuyến', () => {
  const rows = [
    { y: 1, x: 1, yr: 2000 }, { y: 2, x: 2, yr: 2000 }, { y: 3, x: 1, yr: 2001 }, { y: 5, x: 3, yr: 2001 }, { y: 4, x: 2, yr: 2002 }, { y: 6, x: 3, yr: 2002 }
  ];
  const d = E.design(rows, ['x'], { yearFE: 'yr' });
  assert.deepStrictEqual(d.names, ['_cons', 'x', 'yr=2001', 'yr=2002']);
  const dup = E.dropCollinear(d.X.map(r => r.concat([r[1] * 2])), d.names.concat(['x2']));
  assert.deepStrictEqual(dup.dropped, ['x2']);
});

test('p-value, sao, % thay đổi và hệ số dài hạn', () => {
  near(E.normCdf(1.959964), 0.975, 1e-6, 'Φ(1,96)');
  near(E.pValue(0.33, 0.19), 0.0824, 0.001, 'p của khoảng cách kinh tế, mô hình 8');
  assert.strictEqual(E.stars(E.pValue(1.01, 0.28)), '***');
  near(E.pctChange(1.01, 1), 174.6, 0.1, 'FTA: exp(1,01) − 1');
  near(E.longRun(1.01, 0.45), 1.836, 0.001, 'FTA dài hạn');
});

test('Đọc CSV dấu chấm phẩy và dấu thập phân phẩy', () => {
  const t = E.parseCSV('id;year;fdi\nJPN;2006;12,5\n"KOR";2007;0\n');
  assert.deepStrictEqual(t.columns, ['id', 'year', 'fdi']);
  assert.strictEqual(t.rows[0].fdi, 12.5);
  assert.strictEqual(t.rows[1].id, 'KOR');
});

test('Trang HTML nạp đúng hai tệp JS và có ghi công tác giả', () => {
  const html = fs.readFileSync(path.join(__dirname, '../lab/gravity-lab.html'), 'utf8');
  assert.ok(html.includes('gravity-lab-engine.js') && html.includes('gravity-lab-data.js'));
  assert.ok(html.includes('Phan Anh Tú') && html.includes('Đỗ Thùy Hương'));
  assert.ok(!/https?:\/\/(cdn|fonts\.googleapis)/.test(html), 'Không dùng CDN');
});

console.log(`\n${passed} kiểm thử đạt.`);
