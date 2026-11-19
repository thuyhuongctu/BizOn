# Việc cần làm: Công cụ giảng viên sau buổi UMK

**Đầu vào**: [spec.md](spec.md), [plan.md](plan.md)

Ký hiệu: `[P]` làm song song được (khác tệp). `[US1]`…`[US3]` là câu chuyện 1–3. Test viết trước và phải thấy hỏng.

## Giai đoạn 1 – Câu chuyện 1: Tab Bật Nghiệp trên Màn hình lớp học (P1) · PR 1

- [ ] T001 [US1] Viết `test/man-hinh-lop-hoc-bat-nghiep.test.js`, chạy và thấy hỏng. Test kiểm:
  - có tab thứ tư «Bật Nghiệp / Bat Nghiep»;
  - `?game=bn&demo=1` vẽ sa bàn có 6 thành phố, xe của mỗi đội đứng ở chặng bằng vòng đã nộp;
  - bảng 10 đội đầu xếp theo lợi nhuận lũy kế, trùng thứ tự với `BizOnInstructorPage.teams()`;
  - chưa đăng nhập thì hiện màn đăng nhập;
  - EN không còn chữ Việt ngoài tên riêng; 390 và 1280 px không tràn; không lỗi JS.
- [ ] T002 [US1] `js/man-hinh-lop-hoc-data.js`: `GAMES.bn`, `fromBn(subs)`, `demo('bn')`.
- [ ] T003 [US1] `js/man-hinh-lop-hoc.js`: cảnh `bn` (tuyến 6 thành phố, xe tải đất sét, nhãn VI/EN, chế độ ngày/đêm).
- [ ] T004 [US1] `man-hinh-lop-hoc.html`: nút tab, `NOTES.bn`, `GAME_URL.bn`, nạp `js/bizon-grading.js`, nhánh `fetchData`.
- [ ] T005 [US1] Sửa `man-hinh-lop-hoc.test.js` và `man-hinh-lop-hoc-en.test.js` cho đủ 4 tab. `sw.js` nâng `CACHE`. Chạy các test `man-hinh-*`, `bizon-grading`, `instructor-*`; html-validate `man-hinh-lop-hoc.html`.
- [ ] T006 [US1] Chụp tab Bật Nghiệp ở 1280 px gửi chị. Mở PR nháp; gộp khi chị nói «Gộp».

## Giai đoạn 2 – Câu chuyện 2: Tập huấn giảng viên 6 bước (P2) · PR 2

- [ ] T007 [US2] Viết `test/tap-huan-giang-vien.test.js`, chạy và thấy hỏng. Test kiểm:
  - `truong-giang-vien.html` có đúng 6 bước theo thứ tự tạo lớp → gửi mã/link → chiếu Màn hình lớp học → theo dõi → chốt và chấm → xuất kết quả;
  - mỗi bước có ảnh (tệp tồn tại, có `alt`), một việc cần làm, một lỗi hay gặp;
  - bản in (`emulateMedia print`) không có menu, mỗi bước không bị cắt;
  - EN đủ; 360 px không tràn.
- [ ] T008 [P] [US2] `scripts/chup-tap-huan.mjs`: chụp 6 bước trên lớp demo, VI và EN, xuất WebP vào `assets/tap-huan/`.
- [ ] T009 [US2] Viết lại `truong-giang-vien.html` theo 6 bước, giữ địa chỉ và các mục yêu cầu kỹ thuật và câu hỏi thường gặp ở cuối.
- [ ] T010 [P] [US2] Đổi chữ liên kết «Lần đầu? Hướng dẫn 5 bước» trên `giang-vien.html` và các trang khác thành «Tập huấn 6 bước».
- [ ] T011 [US2] `sw.js` nâng `CACHE`. Chạy `tap-huan-giang-vien`, `giang-vien-*`, `hanh-van-de-hieu`. html-validate trên các trang đã đổi.
- [ ] T012 [US2] Gửi chị bản PDF in thử. Mở PR nháp; gộp khi chị nói «Gộp».

## Giai đoạn 3 – Câu chuyện 3: Lý do ra quyết định (P3) · PR 3 · sau PR 1 và 2

- [ ] T013 [US3] Viết `test/ly-do-quyet-dinh.test.js`, chạy và thấy hỏng. Test kiểm:
  - lúc chốt hiện chọn nhanh 5–6 lý do và nút «Bỏ qua»; ≤ 2 lần chạm;
  - có mã lớp thì lý do đi theo `decisions.reasons` của vòng; chơi thử thì không gửi gì;
  - cùng hạt giống và cùng quyết định thì kết quả trùng như cũ;
  - VI/EN.
- [ ] T014 [US3] `js/ly-do-quyet-dinh.js`: móc `commitDecisions`, hiện chọn lý do, ghi `decisions.reasons`. `game.html`, `bat-nghiep-v2.html` thêm thẻ script.
- [ ] T015 [US3] Kiểm RPC hiện có (`bizon_team_log_v2`, `bizon_submissions_v2`) có đủ dựng dòng thời gian không. Nếu thiếu, dừng và hỏi chị về migration.
- [ ] T016 [US3] Dòng thời gian theo đội trên Trang Giảng viên (đề xuất theo vai → chạy thử → lý do → quyết định → kết quả), chỉ chủ lớp xem.
- [ ] T017 [US3] `sw.js` nâng `CACHE`. Chạy `ly-do-quyet-dinh`, `engine`, `ip-ma-nguon-afbacd2`, `cang-cai-mep-luat`, `bizon-grading`. Mở PR nháp, kèm danh sách lý do để chị duyệt câu chữ; gộp khi chị nói «Gộp».

## Phụ thuộc

- PR 1, PR 2 độc lập (khác tệp), làm theo thứ tự ưu tiên.
- PR 3 làm sau PR 1 và 2 (3A). T015 có thể dừng chờ chị.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính | Chị làm tay |
|---|---|---|---|---|---|
| 0 (#1141) | Đặc tả | `claude/cong-cu-giang-vien` | – | `specs/007-cong-cu-giang-vien/` | Duyệt kế hoạch |
| 1 | US1 Tab Bật Nghiệp (P1) | `claude/man-hinh-lop-bat-nghiep` | `test/man-hinh-lop-hoc-bat-nghiep.test.js` | `man-hinh-lop-hoc.html`, `js/man-hinh-lop-hoc*.js`, `sw.js` | Xem ảnh, nói «Gộp» |
| 2 | US2 Tập huấn 6 bước (P2) | `claude/tap-huan-giang-vien` | `test/tap-huan-giang-vien.test.js` | `truong-giang-vien.html`, `scripts/chup-tap-huan.mjs`, `assets/tap-huan/`, `sw.js` | Xem bản in, nói «Gộp» |
| 3 | US3 Lý do quyết định (P3) | `claude/ly-do-quyet-dinh` | `test/ly-do-quyet-dinh.test.js` | `js/ly-do-quyet-dinh.js`, `game.html`, `bat-nghiep-v2.html`, Trang Giảng viên, `sw.js` | Duyệt danh sách lý do; nếu cần migration thì áp bằng APPLY |
