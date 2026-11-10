# Việc cần làm: Dạo phố 3D cho các game BizOn

Đặc tả: [spec.md](spec.md) · Kế hoạch: [plan.md](plan.md). `[US1]`… chỉ câu chuyện người dùng; `[P]` là việc làm song
song được. Chưa việc nào bắt đầu: chờ chị duyệt.

## Giai đoạn 1 – Nền dùng chung và Phố BizOn (câu chuyện 1, P1)

- [ ] T001 [US1] Viết `test/dao-pho-pho-bizon.test.js` (Playwright, 360 và 390 px, VI/EN) theo 6 kịch bản chấp nhận
  của câu chuyện 1 và các trường hợp biên; kiểm thêm cảnh cao ≥ 90% màn hình (SC-002), không chồng lấn (SC-003), mọi
  địa điểm tới được bằng bàn phím (SC-007), không có yêu cầu mạng nào ra ngoài trang (FR-016); chạy và thấy hỏng
- [ ] T002 [P] Viết `test/dao-pho-ho-so.test.js`: ba trang game thuộc hồ sơ và các tệp mã riêng của chúng không nhắc
  tới `dao-pho` (FR-015, SC-008)
- [ ] T003 [US1] `js/dao-pho.js`: điều khiển (cần điều khiển, WASD, mũi tên; hướng theo máy quay; dừng khi thả tay
  hoặc chuyển thẻ) và di chuyển có va chạm (FR-001, FR-003)
- [ ] T004 [US1] `js/dao-pho.js`: máy quay sau lưng, tránh vật cản, kéo ngang để nhìn quanh, tôn trọng «giảm chuyển
  động» (FR-002)
- [ ] T005 [US1] `js/dao-pho.js`: thẻ «Vào» cho địa điểm gần nhất, phím E / Enter, `aria-live` (FR-004, FR-005)
- [ ] T006 [US1] `js/dao-pho.js`: lối tắt «Đi tới…» dùng được bằng chạm, bàn phím, trình đọc màn hình (FR-006)
- [ ] T007 [US1] `js/dao-pho.js`: cửa đọc trạng thái `state()` cho test; chú thích đầu tệp ghi nguồn cảm hứng
- [ ] T008 [US1] `js/pho-bizon.js`: cảnh phố đất sét, sáu toà nhà game có bảng hiệu từ `assets/covers/`, máy hát,
  bảng tin, bảng thành tích; bảng nhãn chính sách (FR-017)
- [ ] T009 [US1] `js/pho-bizon.js`: chọn 1 trong 5 vai đội (ảnh gốc), nhớ lựa chọn; nạp mô hình có xương qua
  `bizon-characters.js` với cờ có sẵn; nhãn tên bằng chữ (FR-007, FR-008)
- [ ] T010 [US1] `js/pho-bizon.js`: Lumina và thầy Tu Phan đứng ở quảng trường với lời thoại của Sảnh cũ
- [ ] T011 [US1] `hub-3d.html`: tiêu đề «Phố BizOn», toàn màn hình, `importmap`, trạng thái đang tải / lỗi / mất mạng,
  song ngữ, đường lui khi không có WebGL hay mô hình lỗi (FR-012, FR-013, FR-014)
- [ ] T012 [US1] html-validate 0 lỗi trên `hub-3d.html`; nâng `CACHE` trong `sw.js`; chạy test liên quan và các test
  đang nhắc tới Sảnh 3D (`clay-factory-3d.html`, `strategy-table-3d.html` có liên kết «Về Sảnh 3D»); ghi vào mô tả PR
  rằng `git diff --stat origin/main` trên các tệp thuộc hồ sơ là rỗng (SC-008)
- [ ] T013 [US1] Đo tay trên điện thoại: thời gian tới game đầu tiên (SC-001), thời gian hiện nhân vật (SC-004),
  khung hình khi đi (SC-005); ghi số vào mô tả PR. Gửi chị ảnh chụp và địa chỉ xem thử

**Mốc kiểm**: mở Phố BizOn ở 390 px, chọn vai, đi tới toà Bến Phù Sa, bấm «Vào» → mở đúng game.

## Giai đoạn 2 – Bản đồ nhỏ và người qua lại (câu chuyện 2, P2)

- [ ] T014 [US2] Viết `test/dao-pho-ban-do-nho.test.js` theo 4 kịch bản chấp nhận của câu chuyện 2; thấy hỏng
- [ ] T015 [US2] `js/dao-pho.js`: bản đồ nhỏ (vị trí người chơi, địa điểm), bấm địa điểm thì có mũi tên chỉ đường;
  không che thẻ và cần điều khiển ở 360 px (FR-009)
- [ ] T016 [US2] `js/dao-pho.js`: người qua lại theo vòng điểm mốc, dừng và chào khi tới gần (FR-010)
- [ ] T017 [US2] `js/pho-bizon.js`: lối đi và câu chào (VI/EN) cho bốn vai đội còn lại; mô hình tải sau người chơi,
  lỗi thì dùng tranh dựng đứng
- [ ] T018 [US2] html-validate, `sw.js`, chạy test giai đoạn 1 và 2

**Mốc kiểm**: đi một đoạn → chấm trên bản đồ nhỏ dịch theo; tới gần một nhân vật → nhân vật dừng và chào.

## Giai đoạn 3 – Hộ Chiếu Sầu Riêng 3D (câu chuyện 3, P3)

- [ ] T019 [US3] Viết `test/dao-pho-sau-rieng-3d.test.js`: thẻ «Vào» mở đúng thứ phím E đang mở; đi bộ và «Đi tới…»
  cho cùng kết quả vụ (SC-006); ván lưu cũ mở lại được; thấy hỏng
- [ ] T020 [US3] `lab/ho-chieu-sau-rieng-3d.html`: nạp `../js/dao-pho.js`; giao máy quay cho phần dạo phố khi đi bộ,
  giữ nguyên «Toàn cảnh» và sa bàn
- [ ] T021 [US3] `lab/ho-chieu-sau-rieng-3d.html`: thẻ «Vào» thay lời nhắc «bấm E», gọi đúng hàm mở hội thoại và bảng
  việc hiện có
- [ ] T022 [US3] `lab/ho-chieu-sau-rieng-3d.html`: bản đồ nhỏ và «Đi tới…» từ danh sách trạm và người có việc; giữ
  thẻ «Việc tiếp theo»
- [ ] T023 [US3] Chạy đủ test ba bản Sầu Riêng (2D, bản gọn, 3D) và test engine; html-validate; `sw.js`

**Mốc kiểm**: chơi một vụ bằng đi bộ, một vụ bằng lối tắt với cùng quyết định → báo cáo vụ giống hệt.

## Hoãn tới khi có giấy chứng nhận quyền tác giả

- [ ] T024 [US4] Bến Phù Sa 3D và Hộ Chiếu Thương Hiệu 3D: «Văn phòng chiến lược» kiểu dạo phố. Hỏi lại chị cách đưa
  vào (tuỳ chọn hay thay hẳn) rồi viết kế hoạch bổ sung
- [ ] T025 [US5] Bật Nghiệp 3D: văn phòng đội kiểu dạo phố, người chơi là mô hình của đúng vai

## Thứ tự và phụ thuộc

- T001, T002 trước mọi việc mã của giai đoạn 1. T003 → T004 → T005 → T006 (cùng một tệp, làm tuần tự).
- T008–T011 cần T003–T007. Giai đoạn 2 và 3 cần giai đoạn 1 đã gộp; giai đoạn 2 và 3 không phụ thuộc nhau, nhưng
  T022 dùng bản đồ nhỏ của T015 nên làm giai đoạn 2 trước.
- T024, T025 không làm trong lượt này.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính |
|---|---|---|---|---|
| 1 (#1059, đang có đặc tả) | Câu chuyện 1 (P1): nền dùng chung và Phố BizOn | `claude/dao-pho-3d` | `test/dao-pho-pho-bizon.test.js`, `test/dao-pho-ho-so.test.js` | `js/dao-pho.js`, `js/pho-bizon.js`, `hub-3d.html`, `sw.js`, `specs/002-dao-pho-3d/` |
| 2 | Câu chuyện 2 (P2): bản đồ nhỏ, người qua lại | `claude/dao-pho-ban-do-nho` | `test/dao-pho-ban-do-nho.test.js` | `js/dao-pho.js`, `js/pho-bizon.js`, `sw.js` |
| 3 | Câu chuyện 3 (P3): Hộ Chiếu Sầu Riêng 3D | `claude/dao-pho-sau-rieng-3d` | `test/dao-pho-sau-rieng-3d.test.js` | `lab/ho-chieu-sau-rieng-3d.html`, `sw.js` |
| Hoãn | Câu chuyện 4, 5: ba game thuộc hồ sơ | chưa mở | chưa viết | chờ giấy chứng nhận |

Việc chị cần làm tay: xem bản thử PR 1 trên điện thoại (mặt nhân vật có chấp nhận được không, đi có mượt không) trước
khi nói «Gộp»; sau mỗi lần gộp bấm «Delete branch». Không có migration, không đổi cài đặt Supabase.
