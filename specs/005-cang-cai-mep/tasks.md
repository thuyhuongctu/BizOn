# Việc cần làm: Cảng Cái Mép trong Bật Nghiệp 3D

**Đầu vào**: [spec.md](spec.md), [plan.md](plan.md)

Ký hiệu: `[P]` làm song song được (khác tệp). `[US1]`, `[US2]` là câu chuyện 1, 2. Test viết trước và phải thấy hỏng.

## Giai đoạn 1 – Câu chuyện 1: Khu Cảng Cái Mép (P1) · PR 1 · gộp trước 19/11/2026

- [X] T001 [US1] Viết `test/cang-cai-mep-3d.test.js`, chạy và thấy hỏng. Test kiểm:
  - có nút «🚢 Cảng Cái Mép» trong `#zones`;
  - bấm nút thì máy quay tới khu cảng;
  - 5 điểm chạm mở đúng 5 thẻ VI/EN, đổi ngôn ngữ thì thẻ vẽ lại;
  - không tràn ngang ở 390 px; không lỗi JS;
  - cùng hạt giống và cùng quyết định 6 vụ thì kết quả trùng với khi chưa có cảng (SC-002).
- [X] T002 [US1] Kiểm lại hai số liệu cảng (24.188 TEU năm 2023; hơn 20 tuyến đi thẳng) ngày làm; ghi nguồn vào đầu tệp.
- [X] T003 [US1] Tạo `js/cang-cai-mep-3d.js` (ES module):
  - `buildPort(ctx)` dựng nền riêng ở x > 8, cần cẩu bờ, tàu container, bãi container, trạm hải quan có rào chắn, biển «CẢNG CÁI MÉP – THỊ VẢI»;
  - mỗi điểm chạm có `userData.label`/`role` [vi, en];
  - vật trang trí phụ đưa vào `LOWHIDE`.
- [X] T004 [US1] Trong `js/cang-cai-mep-3d.js`, thêm thẻ kiến thức: cầu cảng nước sâu, tàu container (TEU/FEU), bãi container và Incoterms (FOB/CIF), hải quan (bộ hồ sơ), «Khi cảng tắc». Có nút đóng, vẽ lại khi đổi VI/EN, vùng chạm ≥ 44 px.
- [X] T005 [US1] Trong `BizOn Game 3D.html`, thêm:
  - một dòng `import { buildPort } from './js/cang-cai-mep-3d.js'`;
  - một lời gọi `buildPort(...)` sau khi dựng trụ sở;
  - một mục `ZONES` «🚢 Cảng Cái Mép / Cái Mép Port».
  - Không sửa dòng nào khác.
- [X] T006 [US1] `sw.js`: thêm `./js/cang-cai-mep-3d.js` vào SHELL; `CACHE` lấy số lớn nhất + 1.
- [X] T007 [US1] Chạy `cang-cai-mep-3d`, `bn3d-onboarding`, `bn3d-upgrades`, `nhan-vat-3d-ceo`, `bat-nghiep-3d-tranh-dong`, `chan-trang-game-3d`, `ip-ma-nguon-afbacd2`, `engine`. Chạy html-validate trên `BizOn Game 3D.html`.
- [X] T008 [US1] Chụp khu cảng ở 390 px và 1280 px gửi chị. Mở PR nháp; gộp khi chị nói «Gộp» và CI xanh, trước 19/11/2026.

**Điểm dừng**: khu cảng dùng được, luật chơi không đổi. Đã gộp ở PR #1127 ngày 16/11/2026; lớp UMK chơi ngày 19/11 với bản này.

## Giai đoạn 2 – Câu chuyện 2: Quyết định ở cảng vụ 5 (P2) · PR 2 · gộp sau 19/11/2026

- [ ] T009 [US2] Viết `test/cang-cai-mep-luat.test.js` (Node `vm`, nạp `engine.js` + `market-dynamic.js` + `cang-cai-mep.js`), chạy và thấy hỏng. Test kiểm, cho mỗi trường hợp A, B, C:
  - «không chọn» và (b) trùng từng con số với luật cũ;
  - (a) không cắt đơn, `costMul` = Ca × hệ số thành phố;
  - (c) bán 95%, `brand` giảm U trước vụ 6;
  - khiên bảo hiểm giảm một nửa phần bất lợi;
  - vụ khác vụ 5 không bị ảnh hưởng;
  - đối thủ ảo không đổi.
- [ ] T010 [US2] Tạo `js/cang-cai-mep.js`:
  - tham số Ca = 1,40, U = 0,06, `FULFILL_C` = 0,95 ở đầu tệp;
  - móc `currentEvent` và `simulateRound` như mục «Thiết kế luật cảng» trong `plan.md`;
  - ghi dòng báo cáo vụ cho (a) «Phí ưu tiên cảng» và (c) «Lùi ngày giao – uy tín giảm»;
  - lưu `state.portChoice`.
- [ ] T011 [US2] Trong `js/cang-cai-mep.js`, chèn ô «🚢 Xử lý hàng kẹt ở Cái Mép» vào `#tab-decisions`:
  - ba lựa chọn, mặc định (b), câu chữ theo trường hợp A/B/C, VI/EN;
  - ô chỉ hiện ở vụ 5;
  - lựa chọn được giữ khi tải lại trang chưa chốt.
- [ ] T012 [US2] Lumina: thêm một câu hỏi gợi mở ở vụ 5 (biên lợi nhuận, nhu cầu thương hiệu vụ 6), không chọn giúp (FR-008).
- [ ] T013 [P] [US2] `game.html`, `bat-nghiep-v2.html`: thêm `<script src="js/cang-cai-mep.js"></script>` sau `market-dynamic.js`. html-validate 0 lỗi.
- [ ] T014 [P] [US2] `js/cang-cai-mep-3d.js`: ở vụ 5, thẻ trạm hải quan có nút «Ra quyết định», mở tab `decisions` qua cầu nối có sẵn.
- [ ] T015 [P] [US2] `Trang Giang Vien.dc.html`: bản xuất Excel thêm cột «Lựa chọn ở cảng (vụ 5)».
- [ ] T016 [US2] `/balance-check` với ba kiểu đội (SC-003); chỉnh Ca, U nếu một lựa chọn luôn thắng. Gửi chị và thầy Tú bảng số kèm nguồn (`plan.md`).
- [ ] T017 [P] [US2] `docs/chuan-dau-ra-va-rubric.md`: ghi ngày áp dụng luật cảng; thêm câu hỏi thảo luận «Vì sao đội chọn (a)/(b)/(c)?», không tính điểm riêng (5A).
- [ ] T018 [US2] `sw.js`: thêm `./js/cang-cai-mep.js`, nâng `CACHE`. Chạy `cang-cai-mep-luat`, `engine`, `market-shock-lumina`, `bn2-grade`, `ip-ma-nguon-afbacd2`, `cang-cai-mep-3d`.
- [ ] T019 [US2] Mở PR nháp; chỉ gộp sau 19/11/2026 khi chị nói «Gộp».

## Phụ thuộc

- T001 → T003–T005 → T007 → T008.
- PR 2 cần PR 1 đã gộp (T014 sửa `js/cang-cai-mep-3d.js`).
- T009 → T010 → T011–T015 → T016 → T018 → T019.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính | Chị làm tay |
|---|---|---|---|---|---|
| 0 (PR #1125) | Đặc tả | `claude/cang-cai-mep` | – | `specs/005-cang-cai-mep/` | Duyệt kế hoạch |
| 1 | US1 Khu cảng 3D (P1) | `claude/cang-cai-mep-3d` | `test/cang-cai-mep-3d.test.js` | `js/cang-cai-mep-3d.js`, `BizOn Game 3D.html`, `sw.js` | Xem ảnh, nói «Gộp» trước 19/11 |
| 2 | US2 Quyết định ở cảng (P2) | `claude/cang-cai-mep-luat` | `test/cang-cai-mep-luat.test.js` | `js/cang-cai-mep.js`, `game.html`, `bat-nghiep-v2.html`, `Trang Giang Vien.dc.html`, `docs/chuan-dau-ra-va-rubric.md`, `sw.js` | Cùng thầy Tú duyệt bảng số Ca, U; nói «Gộp» sau 19/11 |

Không có migration Supabase, không cần áp gì lên production.
