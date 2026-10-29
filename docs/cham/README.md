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

## Thông tin vận hành của tình huống (tác giả duyệt triển khai 29/10/2026)

Repo không có kế hoạch 2026 đầy đủ; các giá trị dưới đây là giả định lập kế hoạch của tình huống, dựa trên kế hoạch 2017, trang `cham-homestay.html` và đề xuất được tác giả duyệt. Đổi giá trị nào thì sửa ở đây và ở trang tương ứng.

| Mục | Giá trị | Nơi dùng |
|---|---|---|
| Giá phòng | 500.000 đ/đêm (kế hoạch 2017 ghi 50.000 đ, giữ làm điểm thẩm định) | website, bộ công cụ, thẩm định, trò chơi, bài giảng |
| Lương (bản 2026) | 46 triệu đ/tháng: 1 quản lý vận hành 10 tr, 2 trưởng ca × 7 tr, 4 nhân viên × 5 tr, phụ việc cuối tuần 2 tr; +20% bảo hiểm và thưởng | `cham-homestay.html` |
| Lương quản lý (bản 2017) | 4 quản lý × 8 triệu đ/tháng (+384 triệu/năm), phương án «trả lương» trong trò chơi và thẩm định | trò chơi, thẩm định, Đấu trường |
| Mùa nước | Tháng 9–11, đỉnh tháng 10; triều cường quanh mùng 1 và rằm âm lịch | website (an toàn), Đấu trường vòng 3 |
| Hoạt động theo mùa | Soi ếch, đom đóm: mùa mưa, tháng 5–10 | website (buổi tối) |
| Thanh toán | Xác nhận qua Zalo; cọc 30% chuyển khoản (Tết 50%), còn lại trả khi nhận phòng | website (đặt phòng) |
| Hủy | Trước 7 ngày hoàn 100% cọc · 3–6 ngày 50% · dưới 3 ngày hoặc dịp Tết không hoàn · homestay «Tạm đóng» mùa nước: dời lịch miễn phí hoặc hoàn 100% | website (đặt phòng, an toàn) |
| Lớp nấu ăn | 150.000 đ/người lớn, trẻ em 75.000 đ, tối thiểu 4 người; nguyên liệu thêm theo bảng trợ giá 2017 | website (ẩm thực, đặt phòng) |
| Tên phòng | 1 Nhà Cúc · 2 Nhà Dừa · 3 Nhà Ổi · 4 Nhà Mận · 5 Nhà Lục Bình · 6 Nhà Đom Đóm | website (lưu trú) |
| Giờ của CHAM | Vé trong ngày 7:30–17:00 · nhận phòng 14:00, trả phòng 11:00 · chương trình tối 19:00–21:30 | website |
| Giờ các vườn trên lịch trình | Không ghi giờ thay cơ sở khác: «thường mở ban ngày, nên gọi trước» | website (lịch trình) |
| An toàn | Áo phao bắt buộc khi đi xuồng, bắt cá; trẻ dưới 12 tuổi đi cùng người lớn; tránh đoạn bờ có biển sạt lở; điểm tập trung: nhà ăn chung; số khẩn cấp 112/113/114/115 | website (an toàn) |
| Từ TP.HCM | Khoảng 4,5–5 giờ bằng ô tô hoặc xe khách | website (đường đến) |

## Ảnh trưng bày và bản quyền

- `assets/cham/anh/*.webp` (59 ảnh: sản phẩm, màn hình website, «Khám phá cù lao»), `assets/cham/clay/*` và `assets/giang-vien/*.webp`: ảnh minh họa đất sét do tác giả cung cấp (29–30/10/2026), 600×448 hoặc 512×512, WebP chất lượng 78.
- Mỗi ảnh có **dòng bản quyền in trên ảnh**, góc dưới bên phải: «© 2026 Đỗ Thùy Hương · CHAM Tân Lộc» (ảnh CHAM) hoặc «© 2026 BizOn · Đỗ Thùy Hương & Phan Anh Tú» (ảnh Góc giảng viên). Dòng chữ nằm trong tệp ảnh nên vẫn còn khi ảnh bị tải về hay chia sẻ lại.
- CSS neo ảnh về góc dưới bên phải (`object-position: 100% 100%`) để khung cắt ảnh không làm mất dòng bản quyền. Ảnh mới thêm sau này cần in dòng bản quyền tương tự trước khi đưa vào kho.

## Việc còn mở (từ bản bàn giao)

1. ~~Giá phòng, lương, mùa nước, thanh toán và hủy, lớp nấu ăn, tên phòng, giờ~~: đã đặt giá trị ở bảng trên (29/10/2026). Giờ mở cửa thật của các vườn trên lịch trình vẫn cần hỏi từng nơi.
2. Khóa giảng viên thật cho ghi chú giảng dạy (cần đăng nhập).
3. Bảng xếp hạng và ghi chú sinh viên đang ở bộ nhớ thiết bị; cần máy chủ để dùng chung giữa các máy.
4. Hiệu chỉnh engine Đấu trường với lớp thật; bản chơi nhiều đội trên nhiều máy.
5. Bản PowerPoint chỉnh sửa được (hoặc xuất từ bài giảng HTML).
6. Ảnh đất sét: đã thay ảnh chính của trang tổng hợp, trang kế hoạch 2017, trang chủ website và trang tình huống 2026 bằng ảnh tác giả cung cấp (`assets/cham/clay/*.webp`); các ảnh `.png` còn lại vẫn là ảnh tạm.
7. Kiểm chứng số liệu thực tế (Cẩm Lụa, khách sạn Thốt Nốt, phà Thuận Hưng) trước khi dùng trên lớp.
