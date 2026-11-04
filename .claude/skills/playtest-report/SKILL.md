---
name: playtest-report
description: "Mẫu báo cáo buổi chơi thử trên lớp, hoặc biến ghi chép thô (ghi chú của giảng viên, ảnh chụp, phản hồi sinh viên, số liệu Màn hình lớp học) thành báo cáo có cấu trúc và việc cần làm. Dùng sau mỗi buổi học có chơi BizOn."
argument-hint: "[moi | phan-tich đường-dẫn-ghi-chú]"
user-invocable: true
---

<!-- Phỏng theo skill playtest-report của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chỉnh cho buổi học có giảng viên, nhóm sinh viên và mục tiêu nghiên cứu của BizOn. -->

# Báo cáo chơi thử (buổi học)

Trả lời bằng tiếng Việt, xưng «em», gọi chị. **Không ghi tên thật hay email sinh viên** vào báo cáo: dùng tên đội,
biệt danh hoặc mã tự đặt. Báo cáo có thể dùng cho bài báo nên phải ẩn danh từ đầu.

## 1. Chọn chế độ

- `moi` → in mẫu trống (mục 2) rồi dừng.
- `phan-tich [đường dẫn]` → đọc ghi chép thô, điền mẫu, rồi phân loại việc (mục 3).
- Không có đối số → hỏi chị: mẫu trống hay phân tích ghi chép (xin đường dẫn hoặc dán nội dung).

Khi phân tích, đọc thêm nếu có: kết quả lớp từ Trang Giảng viên (bảng xếp hạng, tiến độ từng vụ), phiếu khảo sát trước–sau,
nhật ký lỗi trình duyệt, và tài liệu thiết kế của game (`docs/`). Chỗ nào ghi chép mâu thuẫn với ý đồ thiết kế thì đánh dấu.

## 2. Mẫu báo cáo

```markdown
# Báo cáo chơi thử – [Game] – [Lớp] – [YYYY-MM-DD]

## Thông tin buổi
- Lớp / học phần: [mã lớp, học phần, số sinh viên, số đội]
- Game và phiên bản: [trang, bizon-vNNN trong sw.js]
- Thời lượng: [phút chơi / phút debrief]
- Thiết bị: [máy phòng lab / điện thoại SV / máy chiếu + Màn hình lớp học]
- Cách tổ chức: [chơi cá nhân / theo đội / thi đấu cả lớp]
- Mục tiêu buổi: [chuẩn đầu ra nhắm tới; giả thuyết cần kiểm]

## 10 phút đầu
- Sinh viên hiểu mục tiêu game? [Có / Không / Một phần]
- Hiểu cách thao tác? [Có / Không / Một phần]
- Phải hỏi giảng viên những gì? [liệt kê]
- Không khí lớp: [hào hứng / lúng túng / chán / căng thẳng]

## Diễn biến
### Chạy tốt
- …
### Điểm vướng (mức Cao / Trung bình / Thấp)
- …
### Chỗ sinh viên hiểu sai luật hay ý nghĩa
- …
### Khoảnh khắc «à ra vậy» (bài học tự bật ra)
- …

## Lỗi kỹ thuật
| # | Mô tả | Thiết bị / trình duyệt | Mức độ | Lặp lại được? |

## Phản hồi theo tính năng
### [Tính năng]
- Hiểu mục đích? · Có dùng? · Gợi ý của sinh viên:

## Số liệu (nếu có)
- Tiến độ từng vụ: [nhóm chậm nhất / nhanh nhất ở vụ nào]
- Điểm / lợi nhuận: [trung bình, thấp nhất, cao nhất]
- Chiến lược phổ biến: [ví dụ 7/10 đội chạy ghe từ tuần 1]
- Tính năng bị bỏ qua: [liệt kê]

## Debrief
- Câu hỏi nào khơi được thảo luận tốt nhất?
- Sinh viên nối được quyết định trong game với lý thuyết nào?
- Hiểu lầm còn lại sau debrief:

## Đánh giá chung
- Độ khó: [Dễ quá / Vừa / Khó quá] · Nhịp: [Chậm / Vừa / Nhanh] · Thời lượng: [Ngắn / Vừa / Dài]
- Muốn chơi lại? [tỷ lệ nếu có khảo sát]

## 3 ưu tiên sau buổi này
1. …
2. …
3. …
```

## 3. Phân loại việc cần làm (chế độ phân tích)

Chia mọi phát hiện vào bốn nhóm:
- **Thiết kế:** sinh viên hiểu sai, luật gây nhầm, trải nghiệm lệch ý đồ → đề xuất chỉnh và chạy `/design-review` trên phần liên quan.
- **Cân bằng:** con số cảm thấy sai, một chiến lược quá mạnh hoặc quá yếu → chạy `/balance-check [game]` trước khi đổi tham số.
- **Lỗi kỹ thuật:** lặp lại được → mở việc sửa trên nhánh riêng, kèm test để không quay lại.
- **Trau chuốt / UX:** không chặn bài học nhưng gây khó chịu → chạy `/ux-review` trên trang đó.

Ghi riêng các phát hiện **có giá trị nghiên cứu** (ủng hộ hoặc bác giả thuyết), tách khỏi danh sách sửa lỗi.

## 4. Lưu

Hỏi chị trước khi ghi tệp: `docs/choi-thu/choi-thu-[game]-[YYYY-MM-DD].md` (tạo thư mục nếu chưa có). Commit theo quy tắc của kho
(tác giả thuyhuongctu, nhánh riêng, PR nháp). Không đưa ảnh có mặt sinh viên vào kho.
