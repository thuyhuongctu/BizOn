# Việc cần làm: Bến BizOn – bảng nhiệm vụ và điều khiển trên điện thoại

**Đầu vào**: [spec.md](spec.md), [plan.md](plan.md) · **Định dạng**: `[Mã] [P?] [Câu chuyện] Mô tả` – `[P]` làm song song
được (khác tệp, không phụ thuộc). Mỗi câu chuyện là một PR; test viết trước và phải thấy hỏng trước khi viết mã.

## Giai đoạn 1 – Nhiệm vụ «Làm quen Bến BizOn» (câu chuyện 1, P1)

**Mục tiêu**: người mới vào bến thấy «việc tiếp theo», làm theo «Dẫn đường», xong năm việc, tải lại vẫn nhớ.

### Test (viết trước, phải hỏng)

- [ ] T001 [US1] Viết `test/ben-bizon-nhiem-vu.test.js` (Playwright, iPhone 13 và 1280 px):
  - xóa `localStorage` rồi vào bến: bảng hiện, «0/5», việc tiếp theo «Hỏi đường Lumina»;
  - «Dẫn đường» đưa tới Lumina (`near === 'lumina'`); mở hội thoại thì «1/5»;
  - làm việc không theo thứ tự (Bảng tin trước) vẫn được tích;
  - tải lại giữ tiến độ; xong cả năm thì hiện lời chúc và nút «Tới Bến Phù Sa», bảng thu một dòng;
  - nút thu gọn nhớ trạng thái; đổi VI/EN thì chữ đổi;
  - đã ghé `hanh-trinh.html` từ trước thì việc «Ghé Hành trình 3 bậc» tích sẵn;
  - ở 360, 390, 412 px (dọc, ngang): bảng không chồng nút «Thoát», «Góc nhìn», «Đi tới…», cần gạt, thẻ «Vào»; không tràn ngang;
  - chặn `localStorage`: bảng vẫn chạy, không lỗi trang; giảm chuyển động: dùng được đầy đủ.

### Làm

- [ ] T002 [US1] Tạo `js/ben-bizon-nhiem-vu.js`: dữ liệu nhiệm vụ «Làm quen» (5 việc ở plan.md), `taoNhiemVu({ host, L,
  goTo, daGhe, luu })` → `{ bao, state, lamMoiChu, dispose }`; lưu khóa `bizon-ben-nhiem-vu` trong `try/catch`.
- [ ] T003 [US1] `hub-3d.html`: khung `<section id="bb-nv" aria-label>` ở cột trái trên; CSS bề rộng `min(300px, 100% -
  150px)`, tự thu gọn khi cao < 420 px; bỏ `#bb-hint` khi có bảng; xếp `#bb-note` ngay dưới bảng; vùng `aria-live`.
- [ ] T004 [US1] `js/ben-bizon.js`: tạo bảng sau khi cảnh sẵn sàng; gọi `nv.bao(...)` trong `moThoai`, `vaoNoi` và khi
  thẻ `hanh-trinh` hiện; «Dẫn đường» dùng `dc.goTo`; thêm `nhiemVu` vào `window.__benBizon.state()`; `L()` đổi ngôn ngữ
  gọi `nv.lamMoiChu()`.
- [ ] T005 [US1] Cập nhật `test/ben-bizon-canh.test.js` chỗ đo `#bb-hint` cho đúng bố cục mới (không bỏ kiểm tra chồng lấn).
- [ ] T006 [US1] `sw.js`: nâng `CACHE`, thêm `./js/ben-bizon-nhiem-vu.js` vào danh sách lưu sẵn.
- [ ] T007 [US1] Chạy `ben-bizon`, `di-chuyen`, `nhiem-vu`; `html-validate@8.24.1 hub-3d.html` 0 lỗi; quay video thử trên
  khổ điện thoại gửi chị.

**Điểm dừng**: PR 1 tự dùng được; chờ chị nói «Gộp».

## Giai đoạn 2 – Nút chạy/đi và góc nhìn cho tay phải (câu chuyện 2, P2)

### Test (viết trước, phải hỏng)

- [ ] T008 [US2] Viết `test/ben-bizon-dieu-khien.test.js`:
  - iPhone 13, Pixel 7, 360 px: `#bb-chay` và `#bb-goc` ở góc phải dưới, ≥ 44 × 44 px, không chồng cần gạt, bảng nhiệm
    vụ, thẻ «Vào», hộp thoại; không tràn ngang;
  - bấm `#bb-chay` → `state().nhip === 'chay'`, `aria-pressed="true"`; đẩy cần gạt 40 % → `state().chay === true`;
  - bấm lại → `'tu-dong'`, đẩy 40 % thì đi; tải lại nhớ nhịp;
  - máy tính: Shift, WASD như cũ; nút bấm được bằng Tab, Enter;
  - hộp thoại hoặc «Đi tới…» đang mở thì hai nút không bấm được.

### Làm

- [ ] T009 [P] [US2] `js/di-chuyen-3d.js`: thêm `nhip(m)` (`'tu-dong'` | `'chay'`) và `nhip` trong `state()`; không đổi
  hành vi mặc định.
- [ ] T010 [US2] `hub-3d.html`: hàng nút góc phải dưới (`#bb-chay` mới, `#bb-goc` chuyển xuống, giữ `id` và
  `aria-pressed`), ≥ 48 px, tránh vùng an toàn; nâng thẻ «Vào» nếu chồng ở 360 px.
- [ ] T011 [US2] `js/ben-bizon.js`: nút `#bb-chay` gọi `dc.nhip`, nhớ khóa `bizon-ben-nhip`; ẩn hai nút khi hộp thoại
  hoặc «Đi tới…» mở; thêm `nhip` vào `state()`.
- [ ] T012 [US2] Cập nhật `test/ben-bizon-canh.test.js` chỗ đo vị trí `#bb-goc`.
- [ ] T013 [US2] `sw.js` nâng `CACHE`; chạy `ben-bizon`, `di-chuyen`, `dieu-khien`; `html-validate` 0 lỗi; video thử.

**Điểm dừng**: PR 2 tự dùng được; chờ chị nói «Gộp».

## Giai đoạn 3 – Câu hỏi nhanh ở sáu điểm game (câu chuyện 3, P3)

### Test (viết trước, phải hỏng)

- [ ] T014 [US3] Viết `test/ben-bizon-cau-hoi.test.js`:
  - đủ 6 câu, mỗi câu 3 lựa chọn, có bản EN, đúng một đáp án;
  - thẻ Bến Phù Sa có nút «Câu hỏi nhanh» ≥ 44 px;
  - chọn sai: hiện gợi ý, không lộ đáp án, chọn lại được; chọn đúng: tích việc «Bến Phù Sa» trong nhiệm vụ «Một vòng
    quanh bến»;
  - «Một vòng quanh bến» chỉ mở sau khi «Làm quen» xong;
  - nút «Vào» vẫn mở đúng game như cũ.

### Làm

- [ ] T015 [P] [US3] Tạo `js/ben-bizon-cau-hoi.js`: 6 câu (VI/EN) soạn từ mô tả thẻ đang có; **chị duyệt câu chữ trong PR 3**.
- [ ] T016 [P] [US3] `js/di-chuyen-3d.js`: tùy chọn chung `nutPhu(place) → { nhan, fn } | null` thêm một nút cạnh «Vào».
- [ ] T017 [US3] `js/ben-bizon-nhiem-vu.js`: nhiệm vụ «Một vòng quanh bến» (6 việc, loại `cau-hoi`), mở sau «Làm quen».
- [ ] T018 [US3] `js/ben-bizon.js`: câu hỏi mở trong `#bb-dlg` với 3 nút lựa chọn; đúng thì `nv.bao({ loai: 'cau-hoi', noi })`.
- [ ] T019 [US3] `sw.js` nâng `CACHE`, lưu sẵn `./js/ben-bizon-cau-hoi.js`; chạy test; `html-validate` 0 lỗi; gửi chị bảng 6 câu để duyệt.

**Điểm dừng**: chờ chị duyệt câu chữ rồi nói «Gộp».

## Thứ tự và phụ thuộc

- PR 1 → PR 2 → PR 3. PR 2 dời nút «Góc nhìn» nên cần biết chỗ của bảng nhiệm vụ (PR 1); PR 3 cần nhiệm vụ (PR 1).
- PR 2 có thể làm song song với PR 1 nếu chị muốn nhanh, nhưng khi gộp phải đưa main mới vào và lấy số `CACHE` lớn nhất + 1.
- T009 và T016 cùng sửa `js/di-chuyen-3d.js` nhưng ở hai PR khác nhau, không đụng nhau.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính |
|---|---|---|---|---|
| #1067 (đang mở) | Chỉ đặc tả (`specs/003-ben-bizon-nhiem-vu/`) | `claude/ben-bizon-nhiem-vu` | – | `specs/003-ben-bizon-nhiem-vu/` |
| 1 | Câu chuyện 1 (P1): nhiệm vụ «Làm quen» | `claude/ben-bizon-nhiem-vu-lam-quen` | `test/ben-bizon-nhiem-vu.test.js` | `js/ben-bizon-nhiem-vu.js`, `js/ben-bizon.js`, `hub-3d.html`, `sw.js` |
| 2 | Câu chuyện 2 (P2): nút chạy/đi, góc nhìn | `claude/ben-bizon-dieu-khien` | `test/ben-bizon-dieu-khien.test.js` | `js/di-chuyen-3d.js`, `js/ben-bizon.js`, `hub-3d.html`, `sw.js` |
| 3 | Câu chuyện 3 (P3): câu hỏi nhanh | `claude/ben-bizon-cau-hoi` | `test/ben-bizon-cau-hoi.test.js` | `js/ben-bizon-cau-hoi.js`, `js/ben-bizon-nhiem-vu.js`, `js/di-chuyen-3d.js`, `js/ben-bizon.js`, `sw.js` |

Việc chị cần làm tay:
- xem video thử mỗi PR trên điện thoại trước khi nói «Gộp»;
- duyệt câu chữ 6 câu hỏi ở PR 3;
- sau mỗi lần gộp bấm «Delete branch».

Không có migration, không đổi cài đặt Supabase.
