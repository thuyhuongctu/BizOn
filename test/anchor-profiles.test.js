'use strict';
const assert = require('node:assert/strict');
const A = require('../js/aibis/anchor-profiles.js');

// 1) Sáu đến tám nguyên mẫu, đều là hồ sơ neo (giả định do người thiết kế viết).
assert.ok(A.PROFILES.length >= 6 && A.PROFILES.length <= 8, 'phải có 6–8 nguyên mẫu');
assert.ok(A.PROFILES.every(p => p.origin === 'anchor'), 'mọi hồ sơ đều đánh dấu anchor (giả định)');
assert.ok(A.PROFILES.every(p => p.response.type === 'piecewise_linear'), 'phản ứng là hàm số, không LLM');

// Tổng trọng số share ≈ 1.
const totalShare = A.PROFILES.reduce((s, p) => s + p.share, 0);
assert.ok(Math.abs(totalShare - 1) < 1e-9, 'tổng share = 1');

// 2) Phản ứng XÁC ĐỊNH: cùng đầu vào luôn cho cùng đầu ra.
const grab = A.PROFILES.find(p => p.id === 'gia-thap-gianh-thi-phan');
assert.equal(A.respondRatio(grab, 1.0), A.respondRatio(grab, 1.0));
assert.equal(A.respondPrice(grab, 150), A.respondPrice(grab, 150), 'lặp lại cho kết quả giống hệt');
// Nội suy tuyến tính đúng: giữa [1.0,0.88] và [1.3,1.05], tại 1.15 -> 0.965.
assert.ok(Math.abs(A.respondRatio(grab, 1.15) - 0.965) < 1e-9);
// Kẹp đầu mút, không ngoại suy bừa.
assert.equal(A.respondRatio(grab, 0.2), 0.66);
assert.equal(A.respondRatio(grab, 5.0), 1.05);
// "Giá thấp giành thị phần" phải bán DƯỚI giá đối thủ khi giá thị trường ở mức tham chiếu.
assert.ok(A.respondPrice(grab, 150) < 150, 'undercut ở mức tham chiếu');
// "Cao cấp giữ biên" phải bán TRÊN giá tham chiếu.
const premium = A.PROFILES.find(p => p.id === 'cao-cap-giu-bien');
assert.ok(A.respondPrice(premium, 150) > 150, 'premium giữ giá cao');

// 3) Khởi động nguội: học kỳ đầu (chưa có ước lượng) -> quần thể toàn hồ sơ neo,
//    lớp 12 sinh viên vẫn đối mặt thị trường ~200 chủ thể (có ý nghĩa kinh tế).
const cold = A.buildPopulation({ size: 200, estimated: [] });
assert.equal(cold.length, 200, 'thị trường đủ ~200 chủ thể dù lớp nhỏ');
assert.ok(cold.every(a => a.origin === 'anchor'), 'học kỳ đầu toàn hồ sơ neo');
// Đa dạng chiến lược cao (không đơn canh).
assert.ok(A.strategyDiversity(cold) > 0.8, 'quần thể khởi động nguội đa dạng');

// 4) Chống thoái hóa: khi đã có hồ sơ ước lượng, vẫn giữ >= ~20% là hồ sơ neo.
const estimated = Array.from({ length: 6 }, (_, i) => ({ id: 'est-' + i, share: 1 / 6, origin: 'estimated' }));
const mixed = A.buildPopulation({ size: 200, estimated });
assert.equal(mixed.length, 200);
const anchorCount = mixed.filter(a => a.origin === 'anchor').length;
assert.ok(anchorCount / 200 >= A.ANCHOR_RESERVE - 0.02, 'giữ >= 20–30% hồ sơ neo cố định');
assert.ok(mixed.some(a => a.origin === 'estimated'), 'có dùng hồ sơ ước lượng');

// 5) Chỉ số đa dạng: quần thể đơn canh -> gần 0 (kích hoạt tiêm lại hồ sơ neo).
const mono = Array.from({ length: 50 }, () => ({ profileId: 'x' }));
assert.ok(A.strategyDiversity(mono) < 0.01, 'đơn canh -> đa dạng ~0');

console.log('AIBIS anchor profiles (Bước 5) contract passed.');
