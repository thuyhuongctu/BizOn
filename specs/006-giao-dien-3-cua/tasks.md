# Việc cần làm: Giao diện «3 cửa»

**Đầu vào**: [spec.md](spec.md), [plan.md](plan.md)

Ký hiệu: `[P]` làm song song được (khác tệp). `[US1]`, `[US2]` là câu chuyện 1, 2. Test viết trước và phải thấy hỏng.

## Giai đoạn 1 – Câu chuyện 1: Ba cửa ở trang chủ (P1) · PR 1

- [ ] T001 [US1] Viết `test/ba-cua-trang-chu.test.js`, chạy và thấy hỏng. Test kiểm:
  - ở 360, 390 và 1280 px, VI và EN: ba thẻ Sinh viên/Giảng viên/Khách nằm trọn trong màn đầu, mỗi thẻ cao ≥ 44 px, tương phản ≥ 4,5;
  - thẻ Sinh viên dẫn tới `vao-lop.html`; thẻ Giảng viên dẫn tới `truong-giang-vien.html` và có lối lớp demo; thẻ Khách dẫn tới `ben-phu-sa.html` và có video Bật Nghiệp;
  - tắt JavaScript thì ba thẻ vẫn là liên kết;
  - `index.html` trùng byte `academia3d-v2.html`;
  - không tràn ngang; không lỗi JS.
- [ ] T002 [US1] Trong `test/ba-cua-trang-chu.test.js`, kiểm `vao-lop.html`:
  - có bốn thẻ game với đường dẫn đúng;
  - gõ mã lớp thì cả bốn liên kết có `?lop=MÃ` (chữ hoa, bỏ khoảng trắng);
  - có `link rel="canonical"`, có trong `sitemap.xml`;
  - VI/EN; 360 px không tràn.
- [ ] T003 [US1] Sửa `index.html`: thêm khối ba thẻ dưới tiêu đề; chuyển đoạn giới thiệu xuống dưới; thẻ Khách thay nút «Bắt đầu với Bến Phù Sa». Chép sang `academia3d-v2.html`.
- [ ] T004 [P] [US1] Tạo `vao-lop.html` theo khuôn trang clay hiện có (menu, chân trang, `data-en`).
- [ ] T005 [P] [US1] `sitemap.xml` thêm `vao-lop.html`. Tạo `docs/thu-nghiem/thu-5-phut.md` (ba nhiệm vụ, cột thời gian, chỗ kẹt, không ghi tên).
- [ ] T006 [US1] `sw.js`: thêm `./vao-lop.html`, `CACHE` lấy số lớn nhất + 1.
- [ ] T007 [US1] Chạy `ba-cua-trang-chu` và các test trang chủ (`homepage-release-gate`, `academia3d-quality`, `trang-chu-*`, `hanh-van-de-hieu`, `ip-ma-nguon-afbacd2`). Chạy html-validate trên `index.html`, `academia3d-v2.html`, `vao-lop.html`.
- [ ] T008 [US1] Chụp màn đầu ở 390 và 1280 px gửi chị. Mở PR nháp; gộp khi chị nói «Gộp».

**Điểm dừng**: trang chủ có ba cửa, menu giữ nguyên.

## Giai đoạn 2 – Câu chuyện 2: Màn vào Bật Nghiệp 3D (P2) · PR 2

- [ ] T009 [US2] Trước khi sửa, chụp màn vào 3D ở main (390 và 1280 px) làm ảnh gốc cho test.
- [ ] T010 [US2] Viết `test/man-vao-bat-nghiep.test.js`, chạy và thấy hỏng. Test kiểm:
  - ở 390 px, hai nút «Tôi có mã lớp» và «Chơi thử với Đội Demo» nằm trong 844 px đầu;
  - chọn «Tôi có mã lớp» thì hiện các ô; nút «Bắt đầu ▶» thấy được không cần cuộn;
  - `?lop=UMK-2026` điền sẵn mã lớp và mở đường có mã lớp;
  - `?giao-dien=goc` cho ảnh chụp trùng ảnh gốc ở T009 (sai khác pixel dưới ngưỡng nhỏ);
  - Đội Demo vào game được; cùng hạt giống và cùng quyết định thì kết quả trùng như trước;
  - VI/EN; không lỗi JS.
- [ ] T011 [US2] `BizOn Game 3D.html`: thêm hai nút chọn đường và khối ô nhập hiện/ẩn. Giữ mọi `id` và trình xử lý cũ. Nút bắt đầu dính đáy ở bề rộng ≤ 760 px.
- [ ] T012 [US2] `BizOn Game 3D.html`: đọc `?lop=` vào ô mã lớp. `?giao-dien=goc` thêm class `goc` để trả về bố cục cũ. Màn mới có lối nhỏ «Giao diện bản hồ sơ».
- [ ] T013 [US2] `sw.js`: nâng `CACHE`. Chạy `man-vao-bat-nghiep`, `bn3d-onboarding`, `bat-nghiep-3d-*`, `dang-nhap-umk*`, `ip-ma-nguon-afbacd2`, `engine`, `chan-trang-game-3d`. Chạy html-validate trên `BizOn Game 3D.html`.
- [ ] T014 [US2] Chụp màn vào mới và `?giao-dien=goc` ở 390 px gửi chị. Mở PR nháp; gộp khi chị nói «Gộp».

## Phụ thuộc

- T001–T002 → T003–T006 → T007 → T008.
- PR 2 không cần PR 1 (khác tệp). Theo thứ tự ưu tiên, PR 2 làm sau PR 1.
- T009 → T010 → T011–T012 → T013 → T014.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính | Chị làm tay |
|---|---|---|---|---|---|
| 0 (#1140) | Đặc tả | `claude/giao-dien-3-cua` | – | `specs/006-giao-dien-3-cua/` | Duyệt kế hoạch |
| 1 | US1 Ba cửa trang chủ (P1) | `claude/ba-cua-trang-chu` | `test/ba-cua-trang-chu.test.js` | `index.html` = `academia3d-v2.html`, `vao-lop.html`, `sitemap.xml`, `sw.js`, `docs/thu-nghiem/thu-5-phut.md` | Xem ảnh, nói «Gộp» |
| 2 | US2 Màn vào Bật Nghiệp 3D (P2) | `claude/man-vao-bat-nghiep` | `test/man-vao-bat-nghiep.test.js` | `BizOn Game 3D.html`, `sw.js` | Xem ảnh màn mới và `?giao-dien=goc`, nói «Gộp» |

Không có migration Supabase, không cần áp gì lên production.
