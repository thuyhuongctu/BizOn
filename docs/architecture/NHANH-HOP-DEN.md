# Nhánh nghiên cứu «hộp đen» – thao tác hoá biến độc lập (R1, 27/10/2026)

**Câu hỏi nghiên cứu** (xem thiet-ke-nghien-cuu.html): mô phỏng *giải thích được* có giúp người học nội hoá logic Uppsala và chuyển đổi đúng giữa effectuation – causation hơn mô phỏng *hộp đen* tương đương không. Hai điều kiện chỉ khác nhau ở **phần giải thích cơ chế**; engine, hạt giống, biến cố, thông tin về môi trường, luật chơi và điểm số giữ nguyên.

## 1 · Cờ lớp và cách áp
- Giảng viên đặt `class_controls.explain_hidden` cho lớp (Trang Giảng viên → Điều khiển lớp → «Giải thích cơ chế»). Mặc định null = hiện.
- Game đọc cờ ẩn danh qua `bizon_class_feed` (`js/explain-mode.js`), nhớ 5 phút trong `sessionStorage`; khi ẩn, thêm lớp `html.bz-blackbox` và `css/explain-mode.css` giấu các bề mặt dưới đây. Bật Nghiệp còn áp lại mỗi ~20 s qua `BizOnClassSync.tick`.
- Xem trước / kiểm thử: `?explain=hidden` hoặc `?explain=shown` trên URL (ghi điều kiện tương ứng; không dùng cho lớp thật).

## 2 · Bề mặt bị ẩn trong điều kiện hộp đen (và điều KHÔNG ẩn)

| Game | Ẩn | Giữ nguyên |
|---|---|---|
| Bật Nghiệp (`game.html`) | Lời Lumina trong thẻ biến cố (`.bz-explain`), dòng gợi ý Lumina trên bảng điều khiển `#dash-lumina`, khung hỏi Cố vấn `#advisor-chat` + lịch sử, hộp mô phỏng «Nếu – Thì» (`.bz-explain`) | Tên, mô tả và tác động định lượng của biến cố; báo cáo kết quả; luật chơi; bản tin thị trường từ hành trang |
| Bật Nghiệp bản gọn (`bat-nghiep-v2.html`) | Lời Lumina trong thẻ biến cố `.bn2-say`, dự báo dòng tiền `.bn2-fc`, khung lời khuyên Lumina và Nếu – Thì (`.bz-explain`) | Như trên |
| Hộ Chiếu Thương Hiệu (đầy đủ, bản gọn, 3D) | Lời bình cơ chế của cố vấn `.bp-adv` (Lumina, Victor Lâm, dự báo sự kiện), dấu chân hệ quả `#bp-footprint`, bài học cốt lõi `#bp-lesson` | Tín hiệu thị trường đã mua `#bp-signals`, hồ sơ thị trường, câu hỏi tổng kết, lời thoại không khí của nhân vật 3D |
| Hộ Chiếu Sầu Riêng (bản gọn, 3D) | Khối «Dự báo của engine trước khi chốt» và nút Nếu – Thì (`.bz-explain`), phần giải thích dự báo trong Cách chơi | Biến cố và lựa chọn, tin thị trường đã mua, nguồn dữ kiện (fact), phiếu quyết định và nhật ký phản tư |
| Bến Phù Sa (2D, 3D) | Câu «Bài học cốt lõi» cuối ván (`.bz-explain`) | Gợi ý thao tác `#ft-hint`, luật chơi, câu hỏi tổng kết |
| Hành trang hành trình (mọi game) | Dòng giải thích từng khoản (`.jc-lines`); thay bằng một câu «Hành trang đã áp, chi tiết ẩn trong lớp này» | Giá trị áp (vốn, uy tín…), nút Nhận / Chơi độc lập |

Nguyên tắc chọn: ẩn thứ nói **vì sao / sẽ ra sao** (cơ chế, dự báo, lời khuyên), giữ thứ nói **chuyện gì xảy ra / bạn có thể làm gì** (sự kiện, dữ liệu, thao tác). Hai nhóm vì thế có cùng thông tin môi trường, chỉ khác khả năng «nhìn vào máy».

## 3 · Ghi điều kiện để phân tích
- Mọi kết quả nộp: `p_detail_json.explain` (Bến Phù Sa, Hộ Chiếu Thương Hiệu), `result_json.explain` (Bật Nghiệp) = `'hidden' | 'shown'`.
- Hộ chiếu hành trình: `tiers.t1/t2/t3.explain` lúc ghi bậc; CSV ẩn danh của trang Hành trình thêm cột `explain_t1..t3`.
- Trang Giảng viên: tooltip vòng ghi «🔬 hộp đen»; thẻ điều khiển hiện trạng thái lớp.

## 4 · Giới hạn
- Lời thoại không khí của nhân vật 3D (bp3d.js) không chứa cơ chế nên không ẩn; nếu pilot cho thấy sinh viên coi đó là gợi ý, thêm vào bảng trên.
- Cờ đọc theo mã lớp, không theo cá nhân: cùng lớp cùng điều kiện (phân nhánh theo lớp, đúng thiết kế hai nhánh).
- Đổi danh sách bề mặt sau khi đã thu dữ liệu = đổi biến độc lập; ghi phiên bản `css/explain-mode.css` vào báo cáo.
