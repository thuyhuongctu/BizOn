# Việc cần làm: Bến BizOn – đi bộ và chèo xuồng 3D cho các game BizOn

Đặc tả: [spec.md](spec.md) · Kế hoạch: [plan.md](plan.md). `[US1]`… chỉ câu chuyện người dùng; `[P]` là việc làm song
song được. Chưa việc nào bắt đầu: chờ chị duyệt.

## Giai đoạn 1 – Nền dùng chung và Bến BizOn đi bộ (câu chuyện 1, P1)

- [ ] T001 [US1] Viết `test/ben-bizon-di-bo.test.js` (Playwright, 360 và 390 px, VI/EN) theo 7 kịch bản chấp nhận của
  câu chuyện 1 và các trường hợp biên; kiểm thêm cảnh cao ≥ 90% màn hình (SC-002), không chồng lấn (SC-003), mọi
  địa điểm tới được bằng bàn phím (SC-007), không có yêu cầu mạng nào ra ngoài trang (FR-016), nhân vật không bao
  giờ nằm trên nước (FR-019); chạy và thấy hỏng
- [ ] T002 [P] Viết `test/di-chuyen-3d-ho-so.test.js`: ba trang game thuộc hồ sơ và các tệp mã riêng của chúng không
  nhắc tới `di-chuyen-3d` (FR-015, SC-008); tệp dùng chung không chứa tên địa điểm hay bối cảnh nào (FR-020)
- [ ] T003 [US1] `js/di-chuyen-3d.js`: điều khiển (cần điều khiển, WASD, mũi tên; hướng theo máy quay; dừng khi thả
  tay hoặc chuyển thẻ) và đi bộ có va chạm, dừng ở mép nước (FR-001, FR-003, FR-019)
- [ ] T004 [US1] `js/di-chuyen-3d.js`: máy quay sau lưng, tránh vật cản, kéo ngang để nhìn quanh, tôn trọng «giảm
  chuyển động» (FR-002)
- [ ] T005 [US1] `js/di-chuyen-3d.js`: thẻ «Vào» cho địa điểm gần nhất, phím E / Enter, `aria-live` (FR-004, FR-005)
- [ ] T006 [US1] `js/di-chuyen-3d.js`: lối tắt «Đi tới…» dùng được bằng chạm, bàn phím, trình đọc màn hình (FR-006)
- [ ] T007 [US1] `js/di-chuyen-3d.js`: cửa đọc trạng thái `state()` cho test; chú thích đầu tệp ghi nguồn cảm hứng
- [ ] T008 [US1] `js/ben-bizon.js`: bối cảnh bến sông đất sét (bờ phù sa, hàng dừa, nhà sàn, cầu tàu, mặt nước, lục
  bình) và các địa điểm theo bảng trong kế hoạch, bảng hiệu từ `assets/covers/`; bảng nhãn chính sách (FR-017, FR-020)
- [ ] T009 [US1] `js/ben-bizon.js`: chọn 1 trong 5 vai đội (ảnh gốc), nhớ lựa chọn; nạp mô hình có xương qua
  `bizon-characters.js` với cờ có sẵn; nhãn tên bằng chữ (FR-007, FR-008)
- [ ] T010 [US1] `js/ben-bizon.js`: Lumina và thầy Tu Phan đứng ở sân bến với lời thoại của Sảnh cũ; máy hát, bảng
  tin, bảng thành tích
- [ ] T011 [US1] `hub-3d.html`: tiêu đề «Bến BizOn», toàn màn hình, `importmap`, trạng thái đang tải / lỗi / mất mạng,
  song ngữ, đường lui khi không có WebGL hay mô hình lỗi (FR-012, FR-013, FR-014)
- [ ] T012 [US1] html-validate 0 lỗi trên `hub-3d.html`; nâng `CACHE` trong `sw.js`; chạy test liên quan và các test
  đang nhắc tới Sảnh 3D (`clay-factory-3d.html`, `strategy-table-3d.html` có liên kết «Về Sảnh 3D»); ghi vào mô tả PR
  rằng `git diff --stat origin/main` trên các tệp thuộc hồ sơ là rỗng (SC-008)
- [ ] T013 [US1] Đo tay trên điện thoại: thời gian tới game đầu tiên (SC-001), thời gian hiện nhân vật (SC-004),
  khung hình khi đi (SC-005); ghi số vào mô tả PR. Gửi chị ảnh chụp và địa chỉ xem thử

**Mốc kiểm**: mở Bến BizOn ở 390 px, chọn vai, đi ra cầu tàu tới ghe chợ nổi, bấm «Vào» → mở đúng Bến Phù Sa.

## Giai đoạn 2 – Chèo xuồng (câu chuyện 2, P2)

- [ ] T014 [US2] Viết `test/ben-bizon-cheo-xuong.test.js` theo 7 kịch bản chấp nhận của câu chuyện 2; kiểm xuồng
  không bao giờ nằm trên đất (SC-010); thấy hỏng
- [ ] T015 [US2] `js/di-chuyen-3d.js`: chế độ xuồng (quay mũi từ từ, có đà, lực cản nước, chỉ trong vùng nước, va
  chạm bờ và ghe), máy quay sau xuồng, «giảm chuyển động» (FR-018)
- [ ] T016 [US2] `js/di-chuyen-3d.js`: thẻ «Xuống xuồng» / «Lên bờ» tại bến xuồng; «Đi tới…» đưa thẳng tới điểm trên
  nước và ngược lại; tải lại trang bắt đầu trên bờ (FR-018, FR-019)
- [ ] T017 [US2] `js/ben-bizon.js`: hai bến xuồng, xuồng tô màu đất sét có mái chèo tự khua, gợn nước; điểm trên
  nước: chợ nổi giữa sông, phao Ra Khơi Cùng Lớp 3D, bãi lục bình có bảng kể chuyện
- [ ] T018 [US2] html-validate, `sw.js`, chạy test giai đoạn 1 và 2; đo tay SC-010 trên điện thoại; mô tả PR ghi rõ
  giới hạn «nhân vật đứng trên xuồng, chưa có động tác chèo»

**Mốc kiểm**: xuống xuồng, chèo ra chợ nổi, thấy thẻ «Vào»; chèo về bến, lên bờ, đi bộ lại bình thường.

## Giai đoạn 3 – Bản đồ nhỏ và người qua lại (câu chuyện 3, P3)

- [ ] T019 [US3] Viết `test/ben-bizon-ban-do-nho.test.js` theo 4 kịch bản chấp nhận của câu chuyện 3; thấy hỏng
- [ ] T020 [US3] `js/di-chuyen-3d.js`: bản đồ nhỏ (bờ, nước, địa điểm, người chơi đi bộ hay trên xuồng), bấm địa
  điểm thì có mũi tên chỉ đường; không che thẻ và cần điều khiển ở 360 px (FR-009)
- [ ] T021 [US3] `js/di-chuyen-3d.js`: người qua lại theo vòng điểm mốc, dừng và chào khi tới gần (FR-010)
- [ ] T022 [US3] `js/ben-bizon.js`: lối đi và câu chào (VI/EN) cho bốn vai đội còn lại, một ghe hàng trôi trên sông;
  mô hình tải sau người chơi, lỗi thì dùng tranh dựng đứng
- [ ] T023 [US3] html-validate, `sw.js`, chạy test giai đoạn 1 đến 3

**Mốc kiểm**: đi một đoạn → chấm trên bản đồ nhỏ dịch theo; tới gần một nhân vật → nhân vật dừng và chào.

## Giai đoạn 4 – Hộ Chiếu Sầu Riêng 3D (câu chuyện 4, P4)

- [ ] T024 [US4] Viết `test/sau-rieng-3d-sau-lung.test.js`: thẻ «Vào» mở đúng thứ phím E đang mở; đi bộ và «Đi tới…»
  cho cùng kết quả vụ (SC-006); ván lưu cũ mở lại được; thấy hỏng
- [ ] T025 [US4] `lab/ho-chieu-sau-rieng-3d.html`: nạp `../js/di-chuyen-3d.js`; giao máy quay cho phần di chuyển mới
  khi đi bộ, giữ nguyên «Toàn cảnh» và sa bàn
- [ ] T026 [US4] `lab/ho-chieu-sau-rieng-3d.html`: thẻ «Vào» thay lời nhắc «bấm E», gọi đúng hàm mở hội thoại và bảng
  việc hiện có
- [ ] T027 [US4] `lab/ho-chieu-sau-rieng-3d.html`: bản đồ nhỏ và «Đi tới…» từ danh sách trạm và người có việc; giữ
  thẻ «Việc tiếp theo»
- [ ] T028 [US4] Chạy đủ test ba bản Sầu Riêng (2D, bản gọn, 3D) và test engine (FR-011); html-validate; `sw.js`

**Mốc kiểm**: chơi một vụ bằng đi bộ, một vụ bằng lối tắt với cùng quyết định → báo cáo vụ giống hệt.

## Hoãn tới khi có giấy chứng nhận quyền tác giả

- [ ] T029 [US5] Bến Phù Sa 3D và Hộ Chiếu Thương Hiệu 3D: «Văn phòng chiến lược» kiểu sau lưng. Hỏi lại chị cách
  đưa vào (tuỳ chọn hay thay hẳn) và nét riêng của từng game rồi viết kế hoạch bổ sung
- [ ] T030 [US6] Bật Nghiệp 3D: văn phòng đội kiểu sau lưng, người chơi là mô hình của đúng vai

## Thứ tự và phụ thuộc

- T001, T002 trước mọi việc mã của giai đoạn 1. T003 → T004 → T005 → T006 (cùng một tệp, làm tuần tự).
- T008–T011 cần T003–T007. Giai đoạn 2 cần giai đoạn 1 đã gộp. Giai đoạn 3 cần giai đoạn 2 (bản đồ nhỏ vẽ cả xuồng).
  Giai đoạn 4 cần giai đoạn 3 (dùng bản đồ nhỏ).
- T029, T030 không làm trong lượt này.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính |
|---|---|---|---|---|
| 1 (#1059, đang có đặc tả) | Câu chuyện 1 (P1): nền dùng chung và Bến BizOn đi bộ | `claude/dao-pho-3d` | `test/ben-bizon-di-bo.test.js`, `test/di-chuyen-3d-ho-so.test.js` | `js/di-chuyen-3d.js`, `js/ben-bizon.js`, `hub-3d.html`, `sw.js`, `specs/002-ben-bizon-3d/` |
| 2 | Câu chuyện 2 (P2): chèo xuồng | `claude/ben-bizon-cheo-xuong` | `test/ben-bizon-cheo-xuong.test.js` | `js/di-chuyen-3d.js`, `js/ben-bizon.js`, `sw.js` |
| 3 | Câu chuyện 3 (P3): bản đồ nhỏ, người qua lại | `claude/ben-bizon-ban-do-nho` | `test/ben-bizon-ban-do-nho.test.js` | `js/di-chuyen-3d.js`, `js/ben-bizon.js`, `sw.js` |
| 4 | Câu chuyện 4 (P4): Hộ Chiếu Sầu Riêng 3D | `claude/sau-rieng-3d-sau-lung` | `test/sau-rieng-3d-sau-lung.test.js` | `lab/ho-chieu-sau-rieng-3d.html`, `sw.js` |
| Hoãn | Câu chuyện 5, 6: ba game thuộc hồ sơ | chưa mở | chưa viết | chờ giấy chứng nhận |

Nhánh của PR 1 giữ tên cũ `claude/dao-pho-3d` vì PR #1059 đã mở trên nhánh này; tên chỉ là nhãn kỹ thuật, không hiện
ra với người chơi.

Việc chị cần làm tay: xem bản thử PR 1 trên điện thoại (mặt nhân vật có chấp nhận được không, đi có mượt không, bến
sông có ra chất BizOn không) trước khi nói «Gộp»; sau mỗi lần gộp bấm «Delete branch». Không có migration, không đổi
cài đặt Supabase.
