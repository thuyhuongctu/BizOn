# Bộ học liệu CHAM Homestay

Dựng lại từ gói bản mẫu thiết kế «Bizonland clay style mockups» (bàn giao 29/10/2026) theo khuôn của kho: trang tĩnh, một tệp HTML song ngữ cho mỗi sản phẩm (`data-en`, nút VI/EN chung), CSS đất sét chung, menu và chân trang chung, không cần build.

CHAM™ và nội dung tình huống © 2017–2026 Đỗ Thùy Hương, dùng trên BizOn theo giấy phép không độc quyền (xem `docs/ho-so-so-huu-tri-tue.md`, mục D4). Mọi trang để `noindex` và mang dòng giấy phép.

## Sản phẩm

| Sản phẩm | Tệp | Bản mẫu gốc |
|---|---|---|
| Trang tổng hợp (có mã QR theo ngôn ngữ) | `cham/index.html` | CHAM Project Hub (+ VI) |
| Trang tình huống – kế hoạch 2017 | `cham/ke-hoach-2017.html` | BizOn Case CHAM (+ VI) |
| Website cho khách (11 màn hình, đặt phòng 3 bước) | `cham/website.html` | CHAM Homestay Website (+ VI) |
| Một ngày ở Tân Lộc | `cham/mot-ngay.html` | CHAM Day Story (+ VI) |
| Trò chơi nhà sáng lập | `cham/tro-choi.html` | CHAM Founder Game (+ VI) |
| Bảng điều khiển giảng viên | `cham/bang-dieu-khien.html` | CHAM Founder Dashboard (+ VI) |
| Thẩm định kế hoạch (+ bản in/PDF trong cùng trang) | `cham/tham-dinh.html` | CHAM Plan Review, Plan Review Print (+ VI) |
| Bộ công cụ giảng dạy (+ ghi chú giảng dạy) | `cham/bo-cong-cu.html` | CHAM Teaching Kit (+ VI) |
| Bài giảng 8 slide (trình chiếu, in PDF) | `cham/bai-giang.html` | CHAM Teaching Deck (+ VI) |
| Đấu trường Cù lao Tân Lộc (Bậc 2) | `cham/dau-truong.html` | Tan Loc Arena (+ EN) |
| Thư viện tình huống | `thu-vien-tinh-huong.html` | BizOn Case Library (+ EN) |
| Tài liệu kịch bản Bậc 2 | `docs/cham/kich-ban-tan-loc.md` | Bat Nghiep Tan Loc Scenario |

Mã dùng chung: `css/cham-clay.css` (bảng màu, phông Baloo 2 / Nunito tự lưu trữ, bóng đất sét), `js/cham-kit.js` (song ngữ, định dạng số, lưu cục bộ), `js/cham-engine.js` (mô hình 5 năm, máy tính hòa vốn, engine Đấu trường, mã kết quả). Ảnh đất sét tạm: `assets/cham/clay/*.png`. Bản đồ: `assets/geo/tan-loc-clay.svg` (OpenStreetMap, ODbL). Test: `test/cham-hoc-lieu.test.js`.

Khóa lưu trên thiết bị: `cham-founder-board` (bảng xếp hạng, dùng chung trò chơi và bảng điều khiển), `cham-review-notes` (ghi chú thẩm định), `cham-arena-state` (ván Đấu trường đang chơi).

## Khác với bản mẫu

- Không dựng: «BizOn Case CHAM Concepts» (ba hướng ý tưởng ban đầu, chỉ là phác thảo), hai công cụ three.js tạo ảnh đất sét (Tan Loc Clay Diorama/Props), tệp PowerPoint dạng ảnh trong `export/` (7 MB, không sửa được; bài giảng HTML in ra PDF thay thế).
- Không đưa lên kho bản PDF/văn bản kế hoạch 2017 (`uploads/`).
- Ghi tác giả (quyết định của tác giả, 29/10/2026): **không** ghi nhóm tác giả gốc; mọi trang ghi tác giả chính là **Đỗ Thùy Hương** («Tác giả: Đỗ Thùy Hương» ở trang tổng hợp, trang kế hoạch 2017 và slide tiêu đề; «kế hoạch kinh doanh gốc năm 2017 của Đỗ Thùy Hương» ở các đoạn giới thiệu). Câu «kế hoạch của bốn sinh viên Kinh tế ĐH Cần Thơ» trong bản mẫu không dùng.
- Khóa giảng viên giả trong thư viện tình huống bị bỏ: không giả lập bảo mật; ghi chú giảng dạy nằm ở Bộ công cụ, kèm lời nói rõ là chưa có khóa.
- Website cho khách gắn nhãn «bản mẫu» rõ ràng, không nhận/gửi dữ liệu đặt phòng.
- Mã kết quả của trò chơi: bảng điều khiển tính lại dòng tiền từ các lựa chọn, nên mã sửa tay không đổi được xếp hạng. Mã của bản mẫu cũ vẫn đọc được.

## Việc còn mở (từ bản bàn giao)

1. Giá phòng: **500.000 đ/đêm** (tác giả xác nhận 29/10/2026; kế hoạch 2017 ghi 50.000 đ, giữ làm điểm thẩm định). Còn chờ xác nhận: lương quản lý, tháng mùa nước, chính sách thanh toán và hủy, giá lớp nấu ăn, tên phòng, giờ mở cửa các vườn.
2. Khóa giảng viên thật cho ghi chú giảng dạy (cần đăng nhập).
3. Bảng xếp hạng và ghi chú sinh viên đang ở bộ nhớ thiết bị; cần máy chủ để dùng chung giữa các máy.
4. Hiệu chỉnh engine Đấu trường với lớp thật; bản chơi nhiều đội trên nhiều máy.
5. Bản PowerPoint chỉnh sửa được (hoặc xuất từ bài giảng HTML).
6. Ảnh đất sét trong `assets/cham/clay/` là ảnh tạm; thay bằng ảnh đặt làm.
7. Kiểm chứng số liệu thực tế (Cẩm Lụa, khách sạn Thốt Nốt, phà Thuận Hưng) trước khi dùng trên lớp.
