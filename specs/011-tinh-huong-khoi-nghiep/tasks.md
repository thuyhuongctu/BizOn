# Danh sách việc: Tình huống khởi nghiệp

## Nền và Câu chuyện 1 – «Kiểm định ý tưởng» (P1, PR 1)
- [X] T001 (bộ kn-v1, chờ Hương duyệt nội dung) Soạn 4 tình huống «Kiểm định ý tưởng» VI/EN: bối cảnh giả định ĐBSCL, 3–4 phương án; mỗi phương án có hệ quả, «Vì sao?», câu hỏi phản biện, nhãn logic. Thêm danh mục nguồn APA; Hương duyệt nội dung trong PR 1.
- [X] T002 Test (hỏng trước), gồm hàm thuần và Playwright:
  - đủ trường VI/EN cho mọi phương án;
  - không trùng bề mặt câu chuyện `ct-v1`; `js/case-task-data.js` không đổi;
  - lý do dưới 10 ký tự thì không mở hệ quả;
  - tổng kết đủ lựa chọn và lý do; CSV đúng cột;
  - tiến độ còn sau khi tải lại; trích dẫn qua `kiem-trich-dan.mjs` không lỗi;
  - 360 px, VI/EN, không lỗi JS, không gọi mạng ngoài.
- [X] T003 `lab/khoi-nghiep-tinh-huong-data.js`, `lab/khoi-nghiep-tinh-huong-core.js`.
- [X] T004 `lab/khoi-nghiep-tinh-huong.html`: chọn bộ, tình huống, ô lý do, hệ quả, tổng kết, in, CSV, làm lại; dòng «tình huống giả định».
- [X] T005 Thẻ trong thư viện (`js/cham-library.js`); `sw.js`, `sitemap.xml`, canonical.

## Câu chuyện 2 – «Ra thị trường» (P2, PR 2)
- [X] T006 (bộ «Ra thị trường», chờ Hương duyệt nội dung) Soạn 4 tình huống «Ra thị trường» VI/EN, có liên kết sang CMR Lab, CVP Lab, `global.html` và Hộ Chiếu Sầu Riêng ở phần «Vì sao?». Hương duyệt.
- [X] T007 Test: bộ thứ hai đủ trường; nghiệm thu «giá dưới biến phí» có công thức biên đóng góp; liên kết đúng; chọn giữa hai bộ.
- [X] T008 Thêm bộ vào dữ liệu và giao diện chọn bộ.

## Câu chuyện 3 – Ghi chú giảng viên và kết quả lớp (P3, PR 3)
- [X] T009 Test: gộp 3 tệp CSV mẫu ra bảng phân bố lựa chọn đúng; ghi chú giảng viên có mục tiêu, thời lượng, câu hỏi thảo luận, lưu ý đợt đo.
- [X] T010 Màn «Giảng viên» trong trang (mở bằng `?gv=1`): nạp nhiều CSV (đọc trên máy, không tải lên), bảng phân bố theo tình huống; ghi chú giảng dạy; mục mới trong `docs/huong-dan-giang-vien.md`.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính | Hương làm tay |
|---|---|---|---|---|---|
| 0 (PR này) | Đặc tả, kế hoạch, việc | `claude/tinh-huong-khoi-nghiep` | – | `specs/011-tinh-huong-khoi-nghiep/` | Duyệt |
| 1 | Nền + US1 «Kiểm định ý tưởng» | `claude/tinh-huong-khoi-nghiep-p1` | `test/khoi-nghiep-tinh-huong.test.js` | `lab/khoi-nghiep-tinh-huong*.{html,js}`, `js/cham-library.js`, `sw.js`, `sitemap.xml` | Duyệt nội dung 4 tình huống |
| 2 | US2 «Ra thị trường» | `claude/tinh-huong-khoi-nghiep-p2` | thêm vào cùng tệp test | `lab/khoi-nghiep-tinh-huong*.{html,js}`, `sw.js` | Duyệt nội dung 4 tình huống |
| 3 | US3 ghi chú giảng viên, gộp CSV lớp | `claude/tinh-huong-khoi-nghiep-p3` | `test/khoi-nghiep-tinh-huong-gv.test.js` | `lab/khoi-nghiep-tinh-huong*.{html,js}`, `docs/huong-dan-giang-vien.md`, `sw.js` | Không |

## Đối chiếu
- FR-001, FR-002 → T001, T003, T004, T006, T008.
- FR-003 → T001, T002 (kiểm trích dẫn), T006.
- FR-004 → T002 (chặn trùng `ct-v1`, tệp không đổi).
- FR-005 → T004, T005 (dòng «tình huống giả định» trên trang và thẻ).
- FR-006 → T005.
- FR-007 → T002, T004, T010.
- Rủi ro nghiên cứu → T010 (lưu ý trong hướng dẫn giảng viên).
- Không còn chỗ cần làm rõ.
