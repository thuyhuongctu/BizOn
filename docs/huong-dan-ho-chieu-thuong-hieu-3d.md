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

## Nộp kết quả & bảng xếp hạng lớp (tuỳ chọn)
1. Điền URL + anon key Supabase trong `js/backend-config.js`.
2. Chạy `supabase/20260929000000_bp_leaderboard.sql` trong Supabase SQL Editor.
3. Giảng viên xem kết quả ở tab «🛂 Hộ Chiếu» của Trang Giảng Viên.
Không cấu hình thì game vẫn chơi đủ, chỉ ẩn phần nộp kết quả.

## Cập nhật bản mới
Sửa file rồi đổi `V = 'bizon-hochieu-v1'` trong `sw-hochieu.js` sang số mới để máy người chơi tải lại bộ nhớ đệm.
