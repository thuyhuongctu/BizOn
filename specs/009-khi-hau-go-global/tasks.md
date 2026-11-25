# Danh sách việc: Rủi ro khí hậu (ND-GAIN) trong Go Global

**Đầu vào**: `spec.md`, `plan.md` trong `specs/009-khi-hau-go-global/`

**Quy ước**:
- `[P]` = làm song song được (khác tệp, không phụ thuộc nhau).
- `[US1]`, `[US2]`, `[US3]` = câu chuyện 1, 2, 3 trong đặc tả.
- Test viết trước và phải thấy hỏng (hiến chương IV).

## Giai đoạn 1: Chuẩn bị

- [ ] T001 Chị tải `ndgain_countryindex_2026.zip` từ trang ND-GAIN (Download Data) và gửi em. Trang chặn tải tự động.
- [X] T002 Đọc điều khoản dùng dữ liệu trên trang ND-GAIN; ghi cách trích dẫn vào `plan.md` và `THIRD-PARTY-NOTICES.md`.
- [ ] T003 Trích 7 nước (SGP, JPN, DEU, USA, ARE, KOR, KEN) từ tệp gốc: năm mới nhất có số, ND-GAIN, vulnerability, readiness, thứ hạng. Ghi vào `docs/research/du-lieu/nd-gain-2026-nuoc-trung-tam.csv`, kèm tên tệp gốc và ngày tải.

## Giai đoạn 2: Nền dùng chung (chặn mọi câu chuyện)

- [X] T004 Viết test `test/go-global-khi-hau.test.js` phần dữ liệu:
  - mọi số trong `js/go-global-khi-hau.js` khớp CSV trích (SC-004);
  - đủ 7 thị trường;
  - hàm `s` giữ thứ tự dễ tổn thương;
  - `m(35) = 1`, `m(100) = 0,6`.
  Chạy thấy hỏng.
- [X] T005 Tạo `js/go-global-khi-hau.js`: dữ liệu, ánh xạ thị trường → nước, hệ số minh họa, các hàm thuần `s`, `a`, `m`, `chiPhiQuy`, `thienTai`. Dùng được cả trên trình duyệt và Node.
- [X] T006 Thêm `./js/go-global-khi-hau.js` vào precache trong `sw.js`; nâng `CACHE`.

## Giai đoạn 3: Câu chuyện 1 – Hồ sơ khí hậu trên thẻ thị trường (P1)

**Mục tiêu:** sinh viên thấy số ND-GAIN thật trước khi chọn; điểm không đổi.
**Cách thử độc lập:** mở `global.html` ở 360 px và 1366 px, VI và EN; so kết quả ván trước và sau.

- [X] T007 [US1] (mẫu `test/fixtures/go-global-gcalc-mau.json` ghi từ `global.html` trên main, 392 ô) Thêm vào test:
  - ảnh chụp kết quả `gCalc` của bản hiện tại (7 thị trường × 7 phương thức × 2 bộ quyết định × 4 quý) làm mốc; sau PR phải trùng khít (FR-003, SC-002);
  - Playwright: 7 thẻ có số, năm, nguồn, VI/EN, 360 px không tràn (SC-001).
  Chạy thấy hỏng ở phần thẻ.
- [X] T008 [US1] `global.html`: nạp `js/go-global-khi-hau.js`; thẻ thị trường thêm một dòng «🌡️ ND-GAIN xx,x · hạng n», ghi tên nước trung tâm. Chỉ dùng lớp CSS sẵn có.
- [X] T009 [US1] `global.html`: đoạn giải thích mở bằng `<details>` dưới lưới thẻ, VI/EN (`data-en`):
  - chỉ số đo gì, hai thành phần;
  - số là của nước trung tâm, Singapore không đại diện cả Đông Nam Á;
  - Oh et al. (2026) và giới hạn suy rộng sang doanh nghiệp nhỏ;
  - trích dẫn APA của ND-GAIN và Oh et al.
- [ ] T010 [US1] Chạy `html-validate`, `global-tieng-anh`, `ie-lab` (lõi không đổi); kiểm 360 px.

**Điểm dừng:** P1 dùng được độc lập, có thể gộp riêng.

## Giai đoạn 4: Câu chuyện 2 – Kịch bản khí hậu bật bằng `?khihau=1` (P2)

**Mục tiêu:** rủi ro khí hậu có hậu quả, tăng theo mức dễ tổn thương, theo mức cam kết tài sản; ESG giảm thiệt hại.
**Cách thử độc lập:** cùng quyết định, bật và tắt.

- [ ] T011 [US2] Thêm vào test:
  - tắt thì trùng khít mốc T007;
  - bật thì thứ tự chi phí khí hậu giữa 7 thị trường trùng thứ tự dễ tổn thương (Spearman = 1);
  - cùng thị trường: FDI > xuất khẩu, ESG thấp > ESG cao;
  - biến cố thiên tai mạnh hơn ở thị trường dễ tổn thương hơn;
  - cân bằng: không phương thức nào thắng ở cả 7 thị trường.
  Chạy thấy hỏng.
- [ ] T012 [US2] `global.html`: đọc `khihau=1`; trong `gCalc`, khi bật, trừ `chiPhiQuy` vào lợi nhuận và thay tác động biến cố thiên tai bằng `thienTai`. Biến cố nhận ra bằng thuộc tính mới `climate: true` trên đúng biến cố «Thiên tai…»; thêm thuộc tính không đổi kết quả khi tắt.
- [ ] T013 [US2] `global.html`: khi bật, lời biến cố thiên tai và một dòng dưới «Thị trường phản ứng» nói rõ chi phí khí hậu quý này và vì sao (số ND-GAIN, mức cam kết, ESG), VI/EN. Lumina đặt câu hỏi, không khuyên chọn.
- [ ] T014 [US2] Dòng nhỏ trên trang khi bật: «Kịch bản khí hậu đang bật · độ lớn là minh họa».

**Điểm dừng:** P1 + P2 chạy, tắt mặc định.

## Giai đoạn 5: Câu chuyện 3 – Câu hỏi thảo luận và CSV (P3)

- [ ] T015 [US3] Thêm vào test: màn kết quả có câu hỏi khí hậu VI/EN, không chứa đáp án (không có từ «nên chọn»); CSV thêm `ndgain`, `climate_mode` ở cuối, 21 cột cũ giữ nguyên. Chạy thấy hỏng.
- [ ] T016 [US3] `global.html`: thêm 1–2 câu hỏi vào `gRenderResult`; thêm hai trường vào bản ghi `gCommit` và hai cột vào `gExportCSV`.
- [ ] T017 [US3] Cập nhật `docs/chuan-dau-ra-va-rubric.md` mục CLO-D (một dòng: rủi ro khí hậu là một trục so sánh khi bật kịch bản) và hướng dẫn giảng viên (cách gửi link `?khihau=1`).

## Giai đoạn 6: Hoàn thiện

- [ ] T018 Chạy toàn bộ `npm test`; `html-validate` các tệp đã đổi; kiểm 360/390/1366 px.
- [ ] T019 Ghi vào mô tả PR: bản nháp hồ sơ Go Global sẽ có thêm ngày thay đổi của `global.html`.

## Phụ thuộc

- T001 → T003 → T004–T006 → các câu chuyện.
- US1 → US2 (dùng mốc trùng khít của T007) → US3 (US3 dùng `climate_mode` của US2; nếu làm US3 trước US2 thì `climate_mode` luôn là `off`).

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính | Chị làm tay |
|---|---|---|---|---|---|
| 0 (PR này) | Đặc tả, kế hoạch, danh sách việc | `claude/go-global-nd-gain` | — (chỉ tài liệu) | `specs/009-khi-hau-go-global/` | Duyệt đặc tả |
| 1 | Nền + US1: dữ liệu ND-GAIN và thẻ thị trường | `claude/go-global-nd-gain-p1` | `test/go-global-khi-hau.test.js` (dữ liệu khớp CSV; thẻ có số; kết quả trùng khít) | `js/go-global-khi-hau.js`, `docs/research/du-lieu/nd-gain-2026-nuoc-trung-tam.csv`, `global.html`, `sw.js`, `THIRD-PARTY-NOTICES.md` | **Gửi tệp ND-GAIN 2026** (T001) |
| 2 | US2: kịch bản khí hậu `?khihau=1` | `claude/go-global-nd-gain-p2` | Thêm vào cùng tệp test: thứ tự thiệt hại, bất đẳng thức, cân bằng | `global.html`, `js/go-global-khi-hau.js`, `sw.js` | Không |
| 3 | US3: câu hỏi thảo luận, CSV, tài liệu | `claude/go-global-nd-gain-p3` | Thêm vào cùng tệp test: câu hỏi, cột CSV | `global.html`, `docs/chuan-dau-ra-va-rubric.md`, `docs/huong-dan-giang-vien.md`, `sw.js` | Không |

Mỗi PR: nâng `CACHE` trong `sw.js`; `html-validate@8.24.1` 0 lỗi trên tệp đã đổi; không chạm trang chủ.

## Đối chiếu đặc tả ↔ kế hoạch ↔ việc (25/11/2026)

| Yêu cầu | Việc |
|---|---|
| FR-001 dữ liệu 7 nước, có nguồn và năm | T001, T003, T004, T005 |
| FR-002 thẻ thị trường và đoạn giải thích | T007, T008, T009 |
| FR-003 tắt thì trùng khít | T007, T011 |
| FR-004 chi phí khí hậu mỗi quý và thiên tai theo mức dễ tổn thương | T011, T012 |
| FR-005 cam kết tài sản cao chịu nhiều hơn | T011, T012 |
| FR-006 ESG giảm thiệt hại, có trần | T004, T011, T012 |
| FR-007 hệ số ở một chỗ, ghi «minh họa» | T005, T014 |
| FR-008 câu hỏi thảo luận | T015, T016 |
| FR-009 hai cột CSV | T015, T016 |
| FR-010 tệp tĩnh, ngoại tuyến | T005, T006 |
| FR-011 không đổi tên hay chuyển hướng `global.html`; lõi IE Lab giữ nguyên | T010, T019 |

**Kết quả đối chiếu:**
- Không còn chỗ `[CẦN LÀM RÕ]`.
- **Lỗi đã sửa:** kế hoạch có «chi phí rủi ro khí hậu mỗi quý» nhưng đặc tả bản đầu chưa có. Đã thêm vào Câu chuyện 2 (a), FR-004 và SC-003.
- **Lưu ý cho chị:**
  - (1) PR 1 không làm được trước khi chị gửi tệp ND-GAIN (T001).
  - (2) Các hệ số tác động là minh họa. Em sẽ chạy kiểm cân bằng (T011) và báo lại nếu cần chỉnh.
