---
name: patch-notes
description: "Viết «Có gì mới» cho sinh viên và giảng viên từ các PR đã gộp vào main của BizOn trong một khoảng thời gian: tính năng mới, thay đổi luật chơi, tiện ích, lỗi đã sửa, việc còn tồn. Lời lẽ cho người chơi, không thuật ngữ kỹ thuật; bản tiếng Việt và tiếng Anh."
argument-hint: "[từ ngày | từ PR #số] [đến ngày | đến PR #số] [ngan | chi-tiet] [sinh-vien | giang-vien]"
user-invocable: true
---

<!-- Phỏng theo skill patch-notes của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chỉnh cho BizOn (đọc commit squash có số PR, viết cho sinh viên/giảng viên, song ngữ). -->

# Viết «Có gì mới»

Trả lời bằng tiếng Việt, xưng «em», gọi chị.

## 1. Lấy dữ liệu (chỉ từ lịch sử thật)

- `git log --first-parent main --since=... --until=...` (hoặc khoảng giữa hai số PR). Mỗi PR gộp là một commit squash,
  tiêu đề tiếng Việt kết thúc bằng `(#số)`, thân commit liệt kê thay đổi.
- Không có commit nào trong khoảng đã chọn thì nói rõ và dừng; **không tự nghĩ ra thay đổi**. Mỗi dòng trong bản «Có gì mới»
  phải chỉ ra được PR gốc (ghi số PR trong bản nháp gửi chị, bỏ đi ở bản đăng nếu chị muốn).
- Bỏ qua thay đổi chỉ nội bộ: test, CI, workflow, tài liệu dev, đổi số `sw.js`, lệnh `.claude/`.

## 2. Phân loại

- **Mới**: trò chơi, màn, tính năng, video, chứng nhận.
- **Thay đổi luật chơi**: điểm, vòng, cân bằng, độ khó — ghi rõ ảnh hưởng tới người chơi («đội chọn FDI 100 % giờ được cảnh báo dòng tiền»).
- **Dễ dùng hơn**: giao diện, điện thoại, song ngữ, trợ năng.
- **Đã sửa**: nhóm theo trò chơi hay trang.
- **Còn tồn**: lỗi đã biết chưa sửa (hỏi chị có muốn nêu không).

## 3. Viết

- Giọng thân thiện, ngắn, nói lợi ích cho người đọc; không nhắc tên tệp, RPC, migration, số phiên bản cache.
- Tên riêng giữ tiếng Việt có dấu trong cả bản tiếng Anh (Bật Nghiệp, Bến Phù Sa...).
- `sinh-vien`: chỉ những gì người chơi thấy. `giang-vien`: thêm trang Giảng viên, chứng nhận, xuất điểm, Màn hình lớp học.
- `ngan`: 5–8 gạch đầu dòng. `chi-tiet`: theo mục ở phần 2, mỗi mục một đoạn ngắn.
- Không ghi tên hay mã mô hình AI.

## 4. Giao bản nháp

Gửi bản tiếng Việt và tiếng Anh trong trò chuyện kèm danh sách PR đã dùng. Chị muốn đăng lên trang hay lưu vào kho thì hỏi chỗ đặt
trước (ví dụ mục tin trên trang chủ như #1112), làm nhánh riêng và PR nháp như mọi thay đổi khác.
