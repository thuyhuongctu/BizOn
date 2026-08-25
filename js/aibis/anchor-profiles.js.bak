/* BizOn — Hồ sơ neo soạn tay (Bước 5, bản giao việc)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * MỤC ĐÍCH (bản giao việc Bước 5 + tài liệu "Thị trường động từ kho quyết định"):
 *  1. KHỞI ĐỘNG NGUỘI — học kỳ đầu chưa có kho quyết định, nên thị trường được lấp
 *     bằng các nguyên mẫu chiến lược do người thiết kế viết, đánh dấu rõ là giả định.
 *  2. CHỐNG THOÁI HÓA — giữ vĩnh viễn 20–30% quần thể là hồ sơ neo cố định để quần
 *     thể chiến lược không co về một điểm cân bằng nghèo nàn (đơn canh) khi các khóa
 *     sau ước lượng từ khóa trước.
 *
 * RÀNG BUỘC CỨNG (Mục 2): mọi phản ứng là HÀM SỐ xác định — KHÔNG gọi mô hình ngôn
 * ngữ lúc chạy. Cùng đầu vào luôn cho cùng đầu ra, tái lập được, chạy ngoại tuyến,
 * công bố được trong Model Card.
 *
 * Đơn vị: đầu vào/đầu ra của hàm phản ứng là TỈ LỆ so với giá tham chiếu REF_PRICE
 * (khớp engine game). breakpoints = [[tỉ_lệ_giá_đối_thủ, tỉ_lệ_giá_của_mình], ...],
 * sắp theo đầu vào tăng dần; ngoài khoảng thì kẹp ở đầu mút (không ngoại suy bừa).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnAnchorProfiles = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var REF_PRICE = 150; // nghìn ₫ — khớp js/engine.js
  // Tỉ lệ quần thể luôn dành cho hồ sơ neo (không bao giờ đổi) — chống thoái hóa.
  var ANCHOR_RESERVE = 0.25;

  // Tám nguyên mẫu chiến lược. origin:'anchor' = do người thiết kế viết (giả định),
  // KHÔNG phải ước lượng từ dữ liệu — Model Card phải nói rõ điều này.
  var PROFILES = [
    { id: 'gia-thap-gianh-thi-phan', label: { vi: 'Giá thấp giành thị phần', en: 'Low-price share grab' },
      response: { type: 'piecewise_linear', input: 'gia_doi_thu_ti_le', output: 'gia_minh_ti_le',
        breakpoints: [[0.70, 0.66], [1.00, 0.88], [1.30, 1.05]] },
      aggression: 0.78, cashFloor: 0.12, share: 0.16 },
    { id: 'cao-cap-giu-bien', label: { vi: 'Cao cấp giữ biên', en: 'Premium margin keeper' },
      response: { type: 'piecewise_linear', input: 'gia_doi_thu_ti_le', output: 'gia_minh_ti_le',
        breakpoints: [[0.70, 1.05], [1.00, 1.18], [1.30, 1.28]] },
      aggression: 0.30, cashFloor: 0.25, share: 0.12 },
    { id: 'bam-trung-vi', label: { vi: 'Bám sát trung vị', en: 'Median follower' },
      response: { type: 'piecewise_linear', input: 'gia_doi_thu_ti_le', output: 'gia_minh_ti_le',
        breakpoints: [[0.70, 0.72], [1.00, 1.00], [1.30, 1.28]] },
      aggression: 0.35, cashFloor: 0.18, share: 0.18 },
    { id: 'dau-tu-thuong-hieu', label: { vi: 'Đầu tư thương hiệu', en: 'Brand investor' },
      response: { type: 'piecewise_linear', input: 'gia_doi_thu_ti_le', output: 'gia_minh_ti_le',
        breakpoints: [[0.70, 0.85], [1.00, 1.02], [1.30, 1.15]] },
      aggression: 0.50, cashFloor: 0.20, share: 0.12 },
    { id: 'than-trong-giu-tien', label: { vi: 'Thận trọng giữ tiền', en: 'Cash-conservative' },
      response: { type: 'piecewise_linear', input: 'gia_doi_thu_ti_le', output: 'gia_minh_ti_le',
        breakpoints: [[0.70, 0.90], [1.00, 1.05], [1.30, 1.12]] },
      aggression: 0.25, cashFloor: 0.35, share: 0.12 },
    { id: 'banh-truong-san-luong', label: { vi: 'Bành trướng sản lượng', en: 'Volume expander' },
      response: { type: 'piecewise_linear', input: 'gia_doi_thu_ti_le', output: 'gia_minh_ti_le',
        breakpoints: [[0.70, 0.70], [1.00, 0.92], [1.30, 1.08]] },
      aggression: 0.62, cashFloor: 0.12, share: 0.10 },
    { id: 'phan-cong-bien-co', label: { vi: 'Phản công theo biến cố', en: 'Event-reactive fighter' },
      response: { type: 'piecewise_linear', input: 'gia_doi_thu_ti_le', output: 'gia_minh_ti_le',
        breakpoints: [[0.70, 0.62], [1.00, 0.90], [1.30, 1.10]] },
      aggression: 0.85, cashFloor: 0.15, share: 0.10 },
    { id: 'can-bang-linh-hoat', label: { vi: 'Cân bằng linh hoạt', en: 'Balanced adaptive' },
      response: { type: 'piecewise_linear', input: 'gia_doi_thu_ti_le', output: 'gia_minh_ti_le',
        breakpoints: [[0.70, 0.78], [1.00, 1.00], [1.30, 1.22]] },
      aggression: 0.45, cashFloor: 0.20, share: 0.10 }
  ].map(function (p) { p.origin = 'anchor'; return p; });

  // Nội suy tuyến tính từng đoạn, xác định; ngoài khoảng thì kẹp ở đầu mút.
  function piecewiseLinear(breakpoints, x) {
    var bp = breakpoints;
    if (!bp || !bp.length) return null;
    if (x <= bp[0][0]) return bp[0][1];
    if (x >= bp[bp.length - 1][0]) return bp[bp.length - 1][1];
    for (var i = 1; i < bp.length; i++) {
      if (x <= bp[i][0]) {
        var x0 = bp[i - 1][0], y0 = bp[i - 1][1], x1 = bp[i][0], y1 = bp[i][1];
        var t = (x - x0) / (x1 - x0);
        return y0 + (y1 - y0) * t;
      }
    }
    return bp[bp.length - 1][1];
  }

  // Giá phản ứng (tỉ lệ) trước giá đối thủ (tỉ lệ so với REF_PRICE).
  function respondRatio(profile, competitorAvgRatio) {
    return piecewiseLinear(profile.response.breakpoints, competitorAvgRatio);
  }
  // Giá phản ứng theo đồng ₫ (nghìn ₫). Xác định, không ngẫu nhiên.
  function respondPrice(profile, competitorAvgPrice, refPrice) {
    var ref = refPrice || REF_PRICE;
    var ratio = respondRatio(profile, competitorAvgPrice / ref);
    return Math.round(ratio * ref);
  }

  // Chỉ số đa dạng chiến lược (Simpson 1 - Σ share²): CHỈ BÁO SỨC KHỎE hệ thống mỗi
  // học kỳ. Tụt dưới ngưỡng => tiêm lại hồ sơ neo (bản giao việc / tài liệu thị trường động).
  function strategyDiversity(population) {
    if (!population || !population.length) return 0;
    var counts = {};
    population.forEach(function (a) { counts[a.profileId] = (counts[a.profileId] || 0) + 1; });
    var n = population.length, sum = 0;
    Object.keys(counts).forEach(function (k) { var p = counts[k] / n; sum += p * p; });
    return 1 - sum; // 0 = đơn canh, tiến tới 1 = rất đa dạng
  }

  // Dựng quần thể ~size chủ thể cho một lớp: luôn giữ ANCHOR_RESERVE cho hồ sơ neo;
  // phần còn lại lấp bằng hồ sơ ước lượng nếu có, thiếu thì lấp thêm bằng hồ sơ neo.
  // Nhờ vậy lớp 12 sinh viên vẫn đối mặt thị trường có ý nghĩa kinh tế (~size chủ thể).
  function buildPopulation(opts) {
    opts = opts || {};
    var size = opts.size || 200;
    var estimated = opts.estimated || []; // hồ sơ ước lượng (rỗng ở học kỳ đầu)
    var anchorSlots = Math.max(Math.round(size * ANCHOR_RESERVE), estimated.length ? 0 : size);
    // Học kỳ đầu (estimated rỗng): toàn bộ là hồ sơ neo.
    if (!estimated.length) anchorSlots = size;
    var pool = [];
    fillWeighted(pool, PROFILES, anchorSlots, 'anchor');
    fillWeighted(pool, estimated, size - anchorSlots, 'estimated');
    // Nếu ước lượng không đủ số suất, lấp phần thiếu bằng hồ sơ neo (an toàn).
    if (pool.length < size) fillWeighted(pool, PROFILES, size - pool.length, 'anchor');
    return pool.slice(0, size);
  }

  // Phân bổ n chủ thể theo trọng số share, xác định (không ngẫu nhiên): làm tròn theo
  // tỉ lệ rồi bù/cắt cho đủ n, ưu tiên share lớn.
  function fillWeighted(pool, profiles, n, origin) {
    if (!profiles.length || n <= 0) return;
    var total = profiles.reduce(function (s, p) { return s + (p.share || 0); }, 0) || profiles.length;
    var alloc = profiles.map(function (p) {
      return { p: p, exact: n * ((p.share || (1 / profiles.length)) / total) };
    });
    alloc.forEach(function (a) { a.k = Math.floor(a.exact); });
    var used = alloc.reduce(function (s, a) { return s + a.k; }, 0);
    // Bù phần dư cho các hồ sơ có phần thập phân lớn nhất.
    alloc.sort(function (a, b) { return (b.exact - b.k) - (a.exact - a.k); });
    for (var i = 0; used < n; i++, used++) alloc[i % alloc.length].k++;
    alloc.forEach(function (a) {
      for (var j = 0; j < a.k; j++) {
        pool.push({ profileId: a.p.id, origin: a.p.origin || origin, aggression: a.p.aggression, cashFloor: a.p.cashFloor });
      }
    });
  }

  return Object.freeze({
    REF_PRICE: REF_PRICE,
    ANCHOR_RESERVE: ANCHOR_RESERVE,
    PROFILES: PROFILES,
    respondRatio: respondRatio,
    respondPrice: respondPrice,
    piecewiseLinear: piecewiseLinear,
    strategyDiversity: strategyDiversity,
    buildPopulation: buildPopulation
  });
});
