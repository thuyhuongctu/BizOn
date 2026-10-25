# Hộ Chiếu Thương Hiệu 3D – gói độc lập

Game tách riêng khỏi website BizOn và game Bật Nghiệp: có thanh tiêu đề riêng (đổi Việt/Anh, Sáng/Tối), không phụ thuộc menu hay chân trang của site.

Gói tự đủ: không cần mạng để tải three.js, font hay ảnh. Sau lần mở đầu tiên, game chạy offline (service worker `sw-hochieu.js`).

## Chạy
- **GitHub Pages / máy chủ web:** chép toàn bộ thư mục lên (giữ nguyên cấu trúc), mở `Ho Chieu Thuong Hieu 3D.html`.
- **Chạy thử trên máy:** cần một máy chủ tĩnh (file:// không tải được module 3D). Ví dụ: `npx serve .` hoặc `python -m http.server` rồi mở http://localhost:8000/Ho%20Chieu%20Thuong%20Hieu%203D.html
- **Cài như ứng dụng:** trên điện thoại, mở trang → Chia sẻ / menu → "Thêm vào màn hình chính".

## Trang
- `Ho Chieu Thuong Hieu 3D.html` – game chính (6 quý, 7 thị trường, bản đồ 3D).
- `Pho Thi Truong 3D.html` – phố mua sắm 3D của từng thị trường đã thâm nhập.

## Mã lớp = hạt giống chung của lớp
Nhập mã lớp ở cổng vào thì mọi đội trong lớp gặp cùng hồ sơ thị trường ẩn và cùng chuỗi biến cố (hạt giống sinh từ mã lớp, cùng cách với Hộ Chiếu Sầu Riêng). Hạt giống hiện ở nhật ký đầu ván, màn kết thúc, cột `seed` của CSV và `detail_json.seed` khi nộp bài; giảng viên mở `?seed=<số>` để dựng lại ván. Không có mã lớp thì kịch bản ngẫu nhiên như trước.

## Bền vững xây được, không chờ may rủi
Điểm Bền vững (15 %) tăng bằng vật phẩm «🌱 Hồ sơ xanh & truy xuất» trong Cửa hàng (0,7 tỷ/lần, tối đa 3, hiệu lực ngay) hoặc phương án bao bì tái chế của biến cố tiêu dùng xanh. Lục Đảo mở hết tiềm năng và gói ưu đãi xanh cần hồ sơ từ 2.

## Điểm số: hai hệ số và lợi nhuận vận hành
Điểm tổng = (30 % Lợi nhuận + 20 % Uy tín + 20 % Năng lực + 15 % Thích ứng + 15 % Bền vững) × bề rộng thị trường (0,7 + 0,08 × số thị trường đã vào, trần 1,1) × 0,6 nếu thua sớm. Lợi nhuận là lợi nhuận vận hành; vốn thâm nhập, ưu tiên có phí, mua tin, vật phẩm và biến cố trừ vào tiền mặt, nên có thể lãi mà vẫn cạn vốn. Màn kết thúc có khung «Tiền đi đâu» và mỗi quý có chip «Chi ngoài LN».

Công thức điểm và tham số đối thủ nằm trong `js/bp-core.js`, dùng chung cho bản thẻ (`brand-passport.html`) và bản 3D nên hai bản luôn chấm cùng một thước. Gói độc lập phải chép kèm file này.

## Lớp phủ không chồng nhau
Tour hướng dẫn của Lumina (`js/bp-tutorial.js`) nhường chỗ cho mọi lớp phủ khác: lễ đóng dấu, Kim Long xuất hiện, hỏi thầy Tú, màn đua sau quý, hồ sơ đối thủ, bảng chọn thị trường, luật chơi, đàm phán, văn phòng 3D và trạm hộ chiếu. Tour đang chạy mà có lớp phủ mở lên thì tạm ẩn, đóng xong hiện lại và vẽ lại đúng vị trí; tour chưa chạy thì chờ lớp phủ đóng rồi mới bắt đầu. Màn đua sau quý vẫn chờ lễ đóng dấu đóng xong mới hiện như trước.

## Chuyển động danh sách
Nhật ký, cửa hàng và kho vật phẩm dùng thư viện auto-animate (`js/vendor/auto-animate.min.js`, MIT, bản đóng gói toàn cục của gói npm `@formkit/auto-animate` 0.10.0): dòng mới trượt vào, dòng mất mờ đi, dòng còn lại dịch chỗ mượt. Thư viện tự tắt khi hệ điều hành đặt «giảm chuyển động». Cửa hàng và kho vẽ lại theo khóa (`data-key`) nên chỉ dòng thay đổi mới có hoạt ảnh. Gói độc lập phải chép kèm file này; thiếu file thì trang vẫn chạy, chỉ không có chuyển động.

## Đối thủ Kim Long Exports
Kim Long là đối thủ cùng tăng tốc theo ván: sức hút khởi điểm `RIVAL.attrBase`, mỗi quý tăng `RIVAL.ramp`, biên lợi nhuận `RIVAL.margin`, xác suất vào thị trường mới tăng từ `RIVAL.enterBase` thêm `RIVAL.enterStep` mỗi quý. Mức hiện tại (0,8 / 0,17 / 0,30 / 0,25 / 0,055) chọn bằng mô phỏng 32 ván mỗi mức: mức cũ cho đội thắng Kim Long 74 % ván, mức mới 61 % (đội tập trung 50 %, mở rộng có kỷ luật 63 %, hãng phần mềm 100 %, đội lan man 29 %), mức mạnh hơn nữa rơi xuống 31 %. Giảng viên muốn ván dễ hay khó hơn chỉ cần đổi các số trong `js/bp-core.js`.

## Nộp kết quả & bảng xếp hạng lớp (tuỳ chọn)
1. Điền URL + anon key Supabase trong `js/backend-config.js`.
2. Chạy `supabase/20260929000000_bp_leaderboard.sql` trong Supabase SQL Editor.
3. Giảng viên xem kết quả ở tab «🛂 Hộ Chiếu» của Trang Giảng Viên.
Không cấu hình thì game vẫn chơi đủ, chỉ ẩn phần nộp kết quả.

## Cập nhật bản mới
Sửa file rồi đổi `V = 'bizon-hochieu-v1'` trong `sw-hochieu.js` sang số mới để máy người chơi tải lại bộ nhớ đệm.
