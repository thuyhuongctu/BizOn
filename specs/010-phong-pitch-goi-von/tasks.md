# Danh sách việc: Phòng luyện pitch gọi vốn

## Nền và Câu chuyện 1 (P1, PR 1)
- [X] T001 (40 câu, bảng duyệt ở `bo-cau-hoi.md`, Hương duyệt ngày 25/11/2026) Soạn bộ câu hỏi khoảng 40 câu VI/EN, phủ 6 chữ PASTOR × 5 vai, gắn người hỏi (Tu Phan: P, R; Victor Lâm: A, S; Minh Khang: T, O); chị duyệt.
- [X] T002 Test hàm thuần (hỏng trước): đồng hồ đổi vai đúng mốc; phạt khi > 7:30; rút câu tất định theo mã, không lặp, đúng người hỏi; phủ đủ ô PASTOR × vai.
- [X] T003 `lab/pitch-goi-von-core.js`, `lab/pitch-goi-von-data.js`.
- [X] T004 `lab/pitch-goi-von.html`: màn luật (Lumina), đồng hồ theo vai, phần hỏi đáp có giờ từng câu; VI/EN; 360 px.
- [X] T005 Liên kết từ kịch bản «Đại hội Cổ đông» trong `js/lop-hoc-data.js` và `-en.js`; precache `sw.js`; sitemap và canonical.

## Câu chuyện 2 (P2, PR 2)
- [X] T006 Test: tự chấm 4 × 2,5, trừ phạt; kiểm ba con số báo lệch có công thức; so sánh lượt 1 và lượt 2; xuất CSV.
- [X] T007 Màn tự chấm, kiểm ba con số, bảng tổng kết (in được), lưu `localStorage`, xuất CSV.

## Câu chuyện 3 (P3, PR 3)
- [ ] T008 Test: có WebGL thì có canvas 3D, người hỏi nổi bật; không có WebGL thì về bản phẳng, không lỗi.
- [ ] T009 Phòng Hội đồng 3D, dùng lại sa bàn văn phòng; tải three.js chỉ khi mở chế độ 3D.

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính | Chị làm tay |
|---|---|---|---|---|---|
| 0 (PR này) | Đặc tả, kế hoạch, việc | `claude/pitch-goi-von` | – | `specs/010-phong-pitch-goi-von/` | Duyệt |
| 1 | Nền + US1: đồng hồ theo vai, Hội đồng hỏi | `claude/pitch-goi-von-p1` | `test/pitch-goi-von.test.js` | `lab/pitch-goi-von*.{html,js}`, `js/lop-hoc-data*.js`, `sw.js`, `sitemap.xml` | Duyệt bộ câu hỏi |
| 2 | US2: tự chấm, ba con số, tổng kết, CSV | `claude/pitch-goi-von-p2` | thêm vào cùng tệp test | `lab/pitch-goi-von*.{html,js}`, `sw.js` | Không |
| 3 | US3: phòng Hội đồng 3D | `claude/pitch-goi-von-p3` | `test/pitch-goi-von-3d.test.js` | `lab/pitch-goi-von-3d.js`, `lab/pitch-goi-von.html`, `sw.js` | Không |

## Đối chiếu
- FR-001, FR-002 → T002–T004.
- FR-003, FR-004 → T001–T003.
- FR-005, FR-006, FR-008 → T006–T007.
- FR-007, FR-009 → T004 (không gọi dịch vụ ngoài, chữ Lumina).
- Không còn chỗ cần làm rõ.
