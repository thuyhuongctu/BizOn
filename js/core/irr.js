/* BizOn — Độ tin cậy liên người chấm (inter-rater reliability), hàm thuần dùng chung Node và trình duyệt (R3).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * - cohenKappa(a, b, opts): κ Cohen cho hai người chấm trên cùng n đối tượng; opts.weights = 'none' | 'linear' | 'quadratic'
 *   (κ có trọng số cho thang thứ bậc; Cohen 1960, 1968). Trả { kappa, po, pe, n, categories }.
 * - agreement(a, b): tỉ lệ trùng khớp tuyệt đối.
 * - icc(matrix): ICC hai chiều ngẫu nhiên, thống nhất tuyệt đối (Shrout & Fleiss 1979; McGraw & Wong 1996):
 *   ICC(2,1) đơn lẻ và ICC(2,k) trung bình k người chấm; matrix = mảng n hàng (đối tượng) × k cột (người chấm).
 * - interpretKappa / interpretIcc: nhãn mô tả theo Landis & Koch 1977 và Koo & Li 2016 (chỉ để tham khảo).
 * Giá trị thiếu (null/undefined/NaN) loại cặp đó khỏi phép tính. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.BizOnIRR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const num = v => (v === null || v === undefined || v === '' ? NaN : Number(v));
  const pairs = (a, b) => { const out = []; const n = Math.min(a.length, b.length); for (let i = 0; i < n; i++) { const x = num(a[i]), y = num(b[i]); if (Number.isFinite(x) && Number.isFinite(y)) out.push([x, y]); } return out; };

  function agreement(a, b) { const p = pairs(a, b); if (!p.length) return { po: NaN, n: 0 }; return { po: p.filter(([x, y]) => x === y).length / p.length, n: p.length }; }

  function cohenKappa(a, b, opts) {
    const o = opts || {}; const w = o.weights || 'none'; const p = pairs(a, b);
    const cats = o.categories ? o.categories.slice() : Array.from(new Set(p.flat())).sort((x, y) => x - y);
    const k = cats.length, n = p.length;
    if (!n || k === 0) return { kappa: NaN, po: NaN, pe: NaN, n, categories: cats, weights: w };
    if (k === 1) return { kappa: NaN, po: 1, pe: 1, n, categories: cats, weights: w, note: 'one_category' };
    const idx = new Map(cats.map((c, i) => [c, i]));
    const O = cats.map(() => cats.map(() => 0));
    for (const [x, y] of p) { const i = idx.get(x), j = idx.get(y); if (i === undefined || j === undefined) continue; O[i][j]++; }
    const rowS = O.map(r => r.reduce((s, v) => s + v, 0)), colS = cats.map((_, j) => O.reduce((s, r) => s + r[j], 0));
    const W = cats.map((_, i) => cats.map((_, j) => w === 'none' ? (i === j ? 1 : 0) : w === 'linear' ? 1 - Math.abs(i - j) / (k - 1) : 1 - Math.pow(i - j, 2) / Math.pow(k - 1, 2)));
    let po = 0, pe = 0;
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) { po += W[i][j] * O[i][j] / n; pe += W[i][j] * (rowS[i] / n) * (colS[j] / n); }
    const kappa = pe >= 1 ? NaN : (po - pe) / (1 - pe);
    return { kappa, po, pe, n, categories: cats, weights: w, matrix: O };
  }

  // ICC(2,1) và ICC(2,k): hai chiều ngẫu nhiên, thống nhất tuyệt đối. Hàng thiếu giá trị bị loại.
  function icc(matrix) {
    const rows = (matrix || []).map(r => r.map(num)).filter(r => r.length && r.every(Number.isFinite));
    const n = rows.length, k = n ? rows[0].length : 0;
    if (n < 2 || k < 2 || rows.some(r => r.length !== k)) return { icc21: NaN, icc2k: NaN, n, k };
    const grand = rows.flat().reduce((s, v) => s + v, 0) / (n * k);
    const rowM = rows.map(r => r.reduce((s, v) => s + v, 0) / k), colM = Array.from({ length: k }, (_, j) => rows.reduce((s, r) => s + r[j], 0) / n);
    let ssR = 0, ssC = 0, ssE = 0;
    for (let i = 0; i < n; i++) { ssR += k * Math.pow(rowM[i] - grand, 2); for (let j = 0; j < k; j++) ssE += Math.pow(rows[i][j] - rowM[i] - colM[j] + grand, 2); }
    for (let j = 0; j < k; j++) ssC += n * Math.pow(colM[j] - grand, 2);
    const msR = ssR / (n - 1), msC = ssC / (k - 1), msE = ssE / ((n - 1) * (k - 1));
    const icc21 = (msR - msE) / (msR + (k - 1) * msE + k * (msC - msE) / n);
    const icc2k = (msR - msE) / (msR + (msC - msE) / n);
    return { icc21, icc2k, n, k, msR, msC, msE };
  }

  function interpretKappa(v) { if (!Number.isFinite(v)) return { vi: 'không tính được', en: 'not computable' }; if (v < 0) return { vi: 'kém hơn ngẫu nhiên', en: 'poor' }; if (v < 0.21) return { vi: 'rất thấp', en: 'slight' }; if (v < 0.41) return { vi: 'thấp', en: 'fair' }; if (v < 0.61) return { vi: 'trung bình', en: 'moderate' }; if (v < 0.81) return { vi: 'khá tốt', en: 'substantial' }; return { vi: 'gần như hoàn toàn', en: 'almost perfect' }; }
  function interpretIcc(v) { if (!Number.isFinite(v)) return { vi: 'không tính được', en: 'not computable' }; if (v < 0.5) return { vi: 'kém', en: 'poor' }; if (v < 0.75) return { vi: 'trung bình', en: 'moderate' }; if (v < 0.9) return { vi: 'tốt', en: 'good' }; return { vi: 'xuất sắc', en: 'excellent' }; }

  return { cohenKappa, agreement, icc, interpretKappa, interpretIcc };
});
