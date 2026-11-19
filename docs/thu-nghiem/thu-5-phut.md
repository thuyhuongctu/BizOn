# Phiếu thử 5 phút với người mới (đặc tả 006, câu chuyện 4)

Soạn ngày 19/11/2026. Buổi thử **hoãn** theo câu làm rõ 5C; phiếu để sẵn, khi có thời gian thì dùng.

## Mục đích

Xem người chưa từng dùng BizOn có tìm được lối vào đúng vai trong 60 giây không (SC-002 của đặc tả 006). Thử cùng ba nhiệm vụ **trước** và **sau** khi đổi giao diện để so.

## Chuẩn bị

- 3–5 người chưa từng mở bizonland.com. Mỗi người thử riêng, trên điện thoại của họ (hoặc máy tính nếu không có).
- Người hướng dẫn chỉ đọc nhiệm vụ, **không gợi ý**. Người thử nói to điều mình đang nghĩ.
- Bấm giờ từ lúc đọc xong nhiệm vụ tới lúc người thử tới đúng trang đích, hoặc tới khi bỏ cuộc (tối đa 2 phút mỗi nhiệm vụ).
- **Không ghi tên, email, số điện thoại hay ảnh mặt người thử.** Chỉ ghi mã P1, P2, … và loại thiết bị.

## Ba nhiệm vụ

| # | Đọc cho người thử | Đích đúng |
|---|---|---|
| A | «Bạn là sinh viên. Giảng viên gửi mã lớp `DEMO-2026`. Hãy vào game của lớp.» | Mở được một game, mã lớp đi kèm (`?lop=DEMO-2026`) |
| B | «Bạn là giảng viên. Hãy tìm cách xem thử một lớp mẫu, không cần đăng nhập.» | Màn hình lớp học có dữ liệu minh họa, hoặc lớp mẫu `DEMO-2026` ở Trang Giảng viên |
| C | «Bạn chỉ tò mò. Hãy chơi thử một game.» | Màn đầu của một game bất kỳ |

## Bảng ghi (mỗi người thử một dòng cho mỗi nhiệm vụ)

| Người thử | Thiết bị | Lượt (trước/sau) | Nhiệm vụ | Thời gian (giây) | Xong? (có/không) | Chỗ kẹt | Câu người thử nói |
|---|---|---|---|---|---|---|---|
| P1 | | | A | | | | |
| P1 | | | B | | | | |
| P1 | | | C | | | | |

## Tổng hợp

| Nhiệm vụ | Lượt | Thời gian trung bình | Số người xong ≤ 60 giây | Số người kẹt | Chỗ kẹt hay gặp |
|---|---|---|---|---|---|
| A | trước | | | | |
| A | sau | | | | |
| B | trước | | | | |
| B | sau | | | | |
| C | trước | | | | |
| C | sau | | | | |

Đạt SC-002 khi ở lượt **sau**, ít nhất 4/5 người xong mỗi nhiệm vụ trong 60 giây mà không phải hỏi.

Ghi kết quả bằng lệnh `/playtest-report`, đính kèm bảng tổng hợp; không đính kèm bảng ghi từng người nếu có câu nói làm lộ danh tính.
