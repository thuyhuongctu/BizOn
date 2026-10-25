/* Hộ Chiếu Thương Hiệu – lõi dùng chung cho bản thẻ (brand-passport.html) và bản 3D (Ho Chieu Thuong Hieu 3D.html):
 * MỘT công thức điểm và MỘT bộ tham số đối thủ Kim Long, để cùng một ván chơi ra cùng một điểm ở cả hai bản.
 * Không đụng DOM, không đọc trạng thái toàn cục: trang gọi vào với S (trạng thái ván) và endReason.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
(function (root, factory) { var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.BPCore = api; })(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  // Trọng số công khai từ quý 1: 30 % Lợi nhuận · 20 % Uy tín · 20 % Năng lực · 15 % Thích ứng · 15 % Bền vững
  var WEIGHTS = { p: 0.3, r: 0.2, c: 0.2, a: 0.15, s: 0.15 };
  // Mốc 100 điểm lợi nhuận: lãi vận hành lũy kế 6 tỷ sau 6 quý (= mỗi quý 1 tỷ trên vốn 7–8 tỷ)
  var PROFIT_FULL = 6;
  // Điểm 5 chiều + hệ số bề rộng thị trường (0,7 + 0,08 × số thị trường đã vào, trần 1,1) + hệ số thua sớm (×0,6).
  // Thích ứng = 60 % sức chống chịu + 12 điểm cho mỗi lần ứng phó biến cố có tính thích ứng; Bền vững = 30 + 30 × hồ sơ xanh.
  function scoreOf(S, endReason) {
    var pS = clamp(S.profit / PROFIT_FULL * 100);
    var aS = clamp((S.resil || 0) * 0.6 + (S.adapt || 0) * 12);
    var sS = clamp(30 + (S.susts || 0) * 30);
    var nMk = (S.entered || []).filter(function (v) { return v !== null && v !== undefined; }).length;
    var breadth = Math.min(1.1, Math.round((0.7 + 0.08 * nMk) * 100) / 100); // làm tròn 2 chữ số để 0,7 + 0,08 = 0,78 đúng nghĩa đen
    var finish = endReason ? 0.6 : 1;
    var r = clamp(S.rep), c = clamp(S.capab);
    var base = WEIGHTS.p * pS + WEIGHTS.r * r + WEIGHTS.c * c + WEIGHTS.a * aS + WEIGHTS.s * sS;
    return { p: pS, r: r, c: c, a: aS, s: sS, breadth: breadth, finish: finish, base: Math.round(base), total: Math.round(base * breadth * finish) };
  }
  // Đối thủ Kim Long Exports: sức hút doanh thu ở một thị trường = attrBase × fit × xu hướng ÷ cạnh tranh × (1 + ramp × số quý có mặt);
  // mỗi quý có xác suất enterBase + enterStep × quý để mở thêm một thị trường; lợi nhuận ước = doanh thu × margin.
  // Mức 0.8/0.17/0.25/0.055 chọn bằng mô phỏng 32 ván mỗi mức (8 hạt giống × 4 lối chơi, 10-2025):
  // mức cũ 0.67/0.15/0.22/0.05 → đội thắng Kim Long 74 %; mức 1.0/0.2/0.3/0.06 → 31 %; mức này → 61 %
  // (chơi tập trung 50 %, mở rộng có kỷ luật 63 %, hãng phần mềm 100 %, chơi lan man 29 %).
  var RIVAL = { attrBase: 0.8, ramp: 0.17, margin: 0.30, enterBase: 0.25, enterStep: 0.055 };
  function rivalEnterProb(q) { return RIVAL.enterBase + (q || 0) * RIVAL.enterStep; }
  // Tri thức thị trường (Uppsala: học trước rồi mới cam kết): doanh thu ở một thị trường nhân với
  // KNOW.base + KNOW.span × tri thức/100 → 0/100 ×0,90, 67/100 ×1,00, 100/100 ×1,05. Tâm quanh 1 để
  // không đổi mặt bằng cân bằng với Kim Long; mua tin, bán hàng (+6/quý) và liên doanh (+6/quý) đều nâng tri thức.
  // Mô phỏng 32 ván (10-2025) với Kim Long giữ nguyên: lối có mua tin không đổi (mở rộng 63 %, tập trung 50 %),
  // lối vào mù giảm (tập trung không mua tin 50 % → 38 %, lan man 29 % → 25 %); tổng thể 61 % → 56 %.
  var KNOW = { base: 0.9, span: 0.15 };
  function knowMul(k) { return KNOW.base + KNOW.span * clamp(k) / 100; }
  return Object.freeze({ VERSION: '2026-10-25', WEIGHTS: WEIGHTS, PROFIT_FULL: PROFIT_FULL, clamp: clamp, scoreOf: scoreOf, RIVAL: RIVAL, rivalEnterProb: rivalEnterProb, KNOW: KNOW, knowMul: knowMul });
});
