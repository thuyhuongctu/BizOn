// 19/11/2026: chị bảo «giữ công khai và viết câu văn lại» cho mục Đối sánh (truong-hoc-thuat.html)
// và mục Hiện trạng (thiet-ke-nghien-cuu.html). Câu mới ngắn, rõ; câu cũ khó đọc không quay lại. Hai trang vẫn công khai.
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const ht = read('truong-hoc-thuat.html'), tk = read('thiet-ke-nghien-cuu.html');
for (const s of ['Bảng so sánh định tính, lập tháng 10/2026', 'BizOn mạnh hơn ở chỗ', 'BizOn còn yếu hơn ở chỗ', 'ghi chép so sánh các nền tảng mô phỏng', 'Capelo, Pereira &amp; Dias, 2021'])
  assert.ok(ht.includes(s), 'Học thuật thiếu «' + s + '»');
for (const s of ['BizOn đi trước ở đâu', 'BizOn còn thua ở đâu', 'Bản ghi làm việc đầy đủ', 'điều mà nghiên cứu về mô phỏng minh bạch gắn với'])
  assert.ok(!ht.includes(s), 'Học thuật còn câu cũ «' + s + '»');
for (const s of ['Đợt chơi thử tháng 10/2026: cho thấy điều gì, chưa cho thấy điều gì', 'so sánh được 49 cặp ghép', 'Tóm lại:', 'Bước tiếp theo cần hai việc'])
  assert.ok(tk.includes(s), 'Thiết kế nghiên cứu thiếu «' + s + '»');
for (const s of ['nói được gì, không nói được gì', 'tức 49 cặp ghép', 'chưa đủ chắc chắn về mặt thống kê'])
  assert.ok(!tk.includes(s), 'Thiết kế nghiên cứu còn câu cũ «' + s + '»');
// Giữ công khai: không có khóa đăng nhập/email trên hai trang
for (const [n, s] of [['truong-hoc-thuat.html', ht], ['thiet-ke-nghien-cuu.html', tk]])
  assert.ok(!/nguon-mo-gate|nguon-mo-khoa|bizon_guest_signup/.test(s), n + ' vẫn công khai, không bị khóa');
assert.ok(+(read('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 910, 'sw.js ≥ v910');
console.log('viet-lai-doi-sanh-hien-trang: ok');
