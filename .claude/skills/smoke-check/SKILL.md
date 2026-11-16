---
name: smoke-check
description: "Kiểm nhanh các đường chính của BizOn trước một buổi học hay trước khi gộp PR lớn: test tự động liên quan, rồi mở thật trang chủ, game của buổi học, link ?lop=, trang Giảng viên, Màn hình lớp học, phiếu khảo sát trên điện thoại và máy tính. Kết luận ĐẠT / CÓ CẢNH BÁO / KHÔNG ĐẠT / CHƯA ĐÁNH GIÁ."
argument-hint: "[buoi-hoc <game> <mã lớp> | pr | quick]"
user-invocable: true
---

<!-- Phỏng theo skill smoke-check của «Claude Code Game Studios» (Donchitos, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
     Việt hóa và chỉnh cho BizOn: kiểm trước buổi học thật thay cho cổng bàn giao QA của studio. -->

# Kiểm nhanh trước buổi học

Trả lời bằng tiếng Việt, xưng «em», gọi chị. Lệnh này không sửa mã; thấy lỗi thì báo và đề xuất, sửa trong nhánh riêng khi chị đồng ý.

## 1. Test tự động

- `pr`: chạy test của các tệp đã đổi (`node scripts/run-tests.mjs <phần tên>`); `buoi-hoc`: test của game buổi học và trang
  Giảng viên; trước đợt phát hành lớn: `npm test` đầy đủ (khoảng 20–26 phút).
- Trên máy đám mây: `NODE_PATH=/opt/node22/lib/node_modules:/opt/node-tools/node_modules node scripts/run-tests.mjs ...`.
- Ghi số bộ đạt/hỏng. Bộ không chạy được (thiếu trình duyệt, cổng 8899 bận) là «CHƯA CHẠY», không phải đạt.

## 2. Đường chính (mở thật bằng Playwright ở 390×844 và 1280×860)

1. Trang chủ tải không lỗi JS, nút VI/EN đổi chữ, video giới thiệu và trailer mở được.
2. Game của buổi học (ví dụ `BizOn Game 3D.html` cho Bật Nghiệp 3D): link sinh viên `?lop=<mã>` mở được, đăng nhập/nhập tên đội,
   chơi qua vòng 1 và chốt được; với lớp quốc tế thì kiểm cả `?lang=en`.
3. Trang Giảng viên (lớp mẫu DEMO-2026): mở lớp, Điều khiển lớp, bảng đội, xuất Excel, mục chứng nhận.
4. Màn hình lớp học (`man-hinh-lop-hoc.html?lop=...`) hiện đội và tiến độ.
5. Phiếu khảo sát trước/sau (`khao-sat-online.html?phieu=truoc&lop=...`) mở được, không gửi thật.
6. Trang Hướng dẫn chơi và video hướng dẫn phát được.

Mỗi bước ghi: lỗi JS/console, tài nguyên 404, tràn ngang (`scrollWidth - innerWidth ≤ 1`), ảnh chụp (để trong scratchpad).
**Không gửi dữ liệu thật lên Supabase** (chặn yêu cầu ghi bằng `page.route` hoặc dùng lớp mẫu). Bước nào cần người thật
(đăng nhập email trường, Zoom) thì hỏi chị xác nhận; chưa xác nhận là «CHƯA ĐÁNH GIÁ».

`quick`: chỉ bước 1–2 và test của tệp đã đổi, dùng để kiểm lại sau một bản sửa.

## 3. Kết luận

- **KHÔNG ĐẠT**: test hỏng, hoặc một đường chính không đi hết được (lỗi JS chặn, nút không bấm được, trang trắng).
- **CÓ CẢNH BÁO**: đi hết được nhưng có lỗi console, 404 phụ, chữ một thứ tiếng, tràn ngang nhẹ.
- **ĐẠT**: mọi test và mọi bước đều qua.
- **CHƯA ĐÁNH GIÁ**: còn bước «CHƯA CHẠY» hoặc chưa được chị xác nhận — không bao giờ ghi ĐẠT trong trường hợp này.

Báo cáo trong trò chuyện: bảng bước / kết quả / bằng chứng, việc phải sửa trước giờ học, việc để sau.
