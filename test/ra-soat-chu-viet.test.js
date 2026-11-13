/* Rà soát chữ tiếng Việt 13/11/2026: các câu dịch máy, từ vô nghĩa và chỗ sai nội dung đã sửa không được quay lại.
 * Kiểm tĩnh trên tệp nguồn (không cần trình duyệt). Mỗi dòng: tệp, cụm cấm, cụm phải có. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };

const CAM = [
  ['truong-hoc-thuat.html', 'Ảnh chụp đồng khóa', 'Bản chụp trạng thái đã khóa'],
  ['truong-hoc-thuat.html', 'không đi thẳng vào doanh thu', '×0,90 đến ×1,05'],
  ['truong-hoc-thuat.html', 'chia đều theo sức hấp dẫn', 'Khách được chia theo sức hấp dẫn tương đối'],
  ['huong-dan.html', 'thị trường được giải quyết', 'game tính kết quả thị trường'],
  ['huong-dan.html', 'Bài kiểm tra chịu lực', 'Kiểm tra sức chịu đựng tài chính'],
  ['huong-dan.html', 'bị đối thủ cắt giá', 'bị đối thủ bán rẻ hơn giành khách'],
  ['chinh-sach.html', 'của deterministic simulation engine', 'engine mô phỏng tất định'],
  ['chinh-sach.html', 'remote submission mặc định tắt', 'việc gửi dữ liệu lên máy chủ vẫn tắt'],
  ['giang-vien.html', 'ảnh chụp đóng băng', 'số liệu đã chốt'],
  ['truong-giang-vien.html', 'ảnh chụp đóng băng', 'số liệu đã chốt'],
  ['universe.html', 'ảnh chụp đóng băng', 'số liệu đã chốt'],
  ['universe.html', 'Vấn đề dự án giải,', 'Vấn đề dự án muốn giải quyết'],
  ['universe.html', 'Concept art hướng hình ảnh', 'Tranh ý tưởng định hướng hình ảnh'],
  ['hinh-dung.html', 'thanh ghi đất sét', 'chất đất sét, chữ tiếng Việt'],
  ['hinh-dung.html', 'luật giao thoa', 'quy ước giao diện của BizOn'],
  ['thiet-ke-nghien-cuu.html', 'đa quy nạp', 'điền khuyết đa bội (multiple imputation)'],
  ['thu-vien-clip.html', '5 giây động từ bản', '5 giây chuyển động từ bản tham chiếu'],
  ['global.html', 'mẫu mã nhỏ lô', 'mẫu mã theo lô nhỏ'],
  ['lab/ho-chieu-sau-rieng.html', "ở host country',", 'nước nhập khẩu'],
  ['lab/cmr-lab.html', 'dùng để trả định phí, phần còn lại là lãi', 'là số dư đảm phí: bù hết định phí rồi mới thành lãi'],
  ['js/lop-hoc-data.js', 'Chỉ cần nhớ: thuyhuongctu.github.io', 'bizonland.com'],
  ['index.html', 'hành trang có trần', 'hành trang có giới hạn'],
  ['hanh-trinh.html', 'hành trang có trần', 'hành trang có giới hạn'],
  ['js/games-clay.js', 'hành trang có trần', 'hành trang có giới hạn'],
];
for (const [f, cam, co] of CAM) { const s = R(f); check(!s.includes(cam) && s.includes(co), f + ': bỏ «' + cam + '», có «' + co + '»'); }

// Trang giảng viên không còn hứa «không cần đăng nhập» cho lớp học: chơi theo lớp thì sinh viên đăng nhập bằng email.
const gv = R('truong-giang-vien.html');
check(!/sinh viên mở bằng điện thoại, không cần đăng nhập|không đăng nhập, không thu thông tin định danh|no login needed|no login, no personal data collected/.test(gv), 'truong-giang-vien: không còn câu «không cần đăng nhập» cho lớp học (VI và EN)');
check(gv.includes('Chơi theo lớp thì sinh viên đăng nhập bằng email') && gv.includes('students sign in with their email'), 'truong-giang-vien: nói rõ chơi theo lớp thì đăng nhập bằng email (VI và EN)');
// Trang Học thuật khớp engine: tri thức nhân doanh thu 0,90–1,05 (js/bp-core.js KNOW)
const core = R('js/bp-core.js');
check(/KNOW = \{ base: 0\.9, span: 0\.15 \}/.test(core), 'js/bp-core.js: KNOW vẫn là 0,9 + 0,15 × tri thức/100, khớp câu ở trang Học thuật');
check(R('index.html') === R('academia3d-v2.html'), 'index.html giống hệt academia3d-v2.html');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 848, 'sw.js ≥ bizon-v848');
if (fails) { console.error(fails + ' kiểm tra thất bại'); process.exit(1); }
console.log('ra-soat-chu-viet: ok');
