# Rà soát UX: trang chủ (`index.html`), luồng người mới tự học

Ngày rà: 28/11/2026. Người yêu cầu: chị Hương, sau một bản nhận xét bên ngoài cho rằng trang chủ «học thuật hóa», «quá nhiều lựa chọn ở cửa vào».
Cách rà: skill `ux-review`, Playwright ở 360×760, 390×844, 1280×860 và chế độ tối. Ảnh chụp không đưa vào kho.

## Kết luận: CẦN SỬA (hai mục Cao đã sửa trong PR này)

Phần kỹ thuật sạch: 0 lỗi JS, 0 lỗi console, 0 tài nguyên hỏng, không tràn ngang, ảnh có `alt`, nút biểu tượng có nhãn.
Màn đầu đã có ba cửa theo vai (đặc tả 006). Bản nhận xét bên ngoài nói quá về điểm này. Còn lại hai chỗ dễ hiểu sai cho người tự học.

Số đo: trang dài 25 màn (360 px), 21 màn (390 px), 11 màn (1 280 px); khoảng 2 150 chữ; 115 chỗ bấm được, riêng màn đầu 22–24 chỗ.

## Vấn đề

| Mức | Khổ | Vấn đề | Xử lý |
|---|---|---|---|
| Cao | Mọi khổ | Nút cam «Bắt đầu» trên thanh menu, nổi nhất trang, dẫn vào `game.html` (Bật Nghiệp, Bậc 2), còn cửa «Tôi muốn xem thử» dẫn vào Bến Phù Sa (Bậc 1). Hai nút chính đưa người mới tới hai nơi khác nhau. | **Đã sửa:** «Bắt đầu» (mọi trang, `js/bizon-clay-nav.js`) tới Bến Phù Sa – Bậc 1. |
| Cao | Mọi khổ | Người tự học không có cửa gọi đúng tên mình («Tôi muốn xem thử» nghe như chỉ xem). Viên «Lớp demo · Không cần đăng nhập» ngay cạnh mở Màn hình lớp học của giảng viên. | **Đã sửa:** cửa thứ ba thành «Tôi tự học – Bắt đầu từ Bậc 1: Bến Phù Sa»; viên lớp demo ghi «Màn hình lớp cho giảng viên». |
| Trung bình | Mọi khổ | Thuật ngữ nghiên cứu ở phần mở đầu: «engine tất định», «khoa học mở», «học tập, nghiên cứu và quốc tế hóa», nhãn «Engine mô phỏng xác định». | **Đã sửa:** viết lại bằng lời thường («Cùng quyết định luôn cho cùng kết quả, nên thầy cô chấm công bằng»). Thuật ngữ giữ ở phần Nghiên cứu (màn 14–15). |
| Trung bình | Điện thoại | Thanh menu hai tầng cao khoảng 150 px, cố định khi cuộn (18 % màn 844 px). | **Đã sửa (#1246):** menu một tầng 86 px, mục trang trong nút ☰. |
| Trung bình | Điện thoại | Mục «Mỗi người dùng có một lối vào riêng» (màn 2,7) lặp ba cửa ở màn đầu. | **Đã sửa:** thu thành «Bạn đến để nghiên cứu hay hợp tác?», giữ hai thẻ Nhà nghiên cứu, Nhà trường · đối tác · quỹ; trang ngắn khoảng 1 màn. |
| Thấp | Điện thoại | 14 nút dưới 44 px (⟳, VI/EN, 🌙, nút các Lab); 8 dòng chữ 11–12,5 px. | **Đã sửa:** chữ nội dung và chân trang ≥ 13 px (nhãn viết hoa giữ 12 px); ⟳, 🌙 vào bảng ☰ (#1246); nút Lab có vùng chạm ≥ 44 px sẵn. |

**Đính chính trong lúc sửa:** thẻ «20/11 Tri ân thầy cô» không quá hạn như báo cáo ban đầu ghi. Thẻ có sẵn khoảng ngày
`data-tu="2026-11-10"`, `data-den="2026-11-30"` và tự ẩn từ 01/12. Đã thêm test cho việc tự ẩn.

**Ba điểm bản nhận xét bên ngoài nói sai:** «bricoleur» chỉ là địa chỉ thư liên hệ; trang không có «pedagogical taxonomy»;
các Lab CVP, CMR, Gravity đã có dòng giải thích bằng lời thường.

## Chưa đánh giá
Thứ tự phím Tab, đo tương phản chính xác ở chế độ tối, toàn bộ bản tiếng Anh.

## Test giữ hành vi
`test/loi-vao-tu-hoc.test.js`: đích của «Bắt đầu» trên trang chủ và trang khác, tên cửa thứ ba (VI/EN), nhãn lớp demo,
phần mở đầu không có thuật ngữ nghiên cứu, thẻ 20/11 tự ẩn ngoài khoảng ngày, không tràn ngang.
