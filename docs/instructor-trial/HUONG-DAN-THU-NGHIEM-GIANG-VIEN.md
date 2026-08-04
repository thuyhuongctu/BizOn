# Thử nghiệm Instructor Studio — Hướng dẫn một trang cho giảng viên

> Mục tiêu của buổi thử: kiểm chứng tiêu chí hoàn thành **Bước 3** — *một giảng viên ngoài
> nhóm phát triển chạy trọn một buổi mà không cần hỏi ai*. Nếu phải hỏi, hãy ghi lại câu hỏi
> ở mục cuối; đó chính là chỗ công cụ còn thiếu.

## A. Chuẩn bị (2 phút)

1. Mở trình duyệt (điện thoại hoặc máy tính đều được), vào:
   **https://thuyhuongctu.github.io/BizOn/instructor-grading.html**
2. Không cần đăng nhập, không cần mạng sau khi trang đã tải (chấm chạy cục bộ trên máy).

## B. Chạy thử với dữ liệu mẫu (5 phút)

1. Bấm **“Dùng dữ liệu mẫu”**. Bảng sổ điểm hiện ra: 3 đội × 3 vòng.
2. Đọc từng dòng — mỗi vòng cho thấy: **quyết định** của đội (giá · sản lượng), **chỉ số neo
   (thị phần)** tính *trên ảnh chụp đóng băng* của vòng đó, và **mã ảnh chụp**.
3. Kiểm tra ô **“Tự chấm rubric”** — phải hiện **KHÔNG**. Công cụ chỉ cấp *bằng chứng số*;
   điểm rubric do thầy cô đặt, dựa trên phần **lập luận** của người học.
4. Bấm **“Xuất sổ điểm CSV”** — mở tệp bằng Excel/Sheets. Xác nhận cột `team_id` là mã đã băm
   (không có tên/email thật).

## C. Chạy với dữ liệu lớp thật hoặc tệp mẫu đầy đủ (tùy chọn)

- Bấm **“Nạp nhật ký lớp (.json)”** và chọn tệp `docs/instructor-trial/sample-class.json`
  (4 đội × 4 vòng) để thử luồng nạp tệp.
- Khi có nhật ký lớp thật (xuất từ trò chơi), nạp đúng như vậy. Định dạng tệp:
  `{ "entries": [...], "snapshots": [...], "nameById": { "<mã băm>": "<tên đội>" } }`.

## D. Chấm bằng rubric bốn mức

Dùng chỉ số neo làm căn cứ, chấm phần **lập luận** của mỗi đội theo thang:

| Mức | Mô tả rút gọn |
|---|---|
| 1 · Chưa đạt | Kể lại đã làm gì, chưa giải thích. |
| 2 · Đạt | Nêu quan hệ định tính (giá tăng → cầu giảm). |
| 3 · Khá | Dẫn số liệu ít nhất hai vòng để giải thích một quyết định. |
| 4 · Xuất sắc | Chỉ ra vòng kém hiệu quả và tính ngưỡng hợp lý từ dữ liệu. |

Chuẩn đầu ra đầy đủ (CLO-A→E, BP-1→6): xem
**https://thuyhuongctu.github.io/BizOn/truong-giang-vien.html#rubric**

## E. Nghiệm thu (người thử điền — đây là phần mã không tạo ra được)

- Tên giảng viên thử: `____________________`  · Học phần: `____________________`
- Ngày thử: `__________`  · Số đội/lớp: `______`
- **Chạy trọn buổi mà KHÔNG cần hỏi ai?**  ☐ Có   ☐ Không
- Nếu **Không**, những chỗ phải hỏi / vướng:
  1. `________________________________________________`
  2. `________________________________________________`
- Nhận xét chung: `________________________________________________`

> Chỉ khi ô “Chạy trọn buổi không cần hỏi ai = Có” được một giảng viên **ngoài nhóm phát
> triển** tick, Bước 3 mới được chuyển sang **“đã nghiệm thu”** trong
> `docs/BAN-GIAO-VIEC-TRANG-THAI-2026-08-04.md`. Trước đó, trạng thái là *“code xong, chưa
> nghiệm thu”*.
