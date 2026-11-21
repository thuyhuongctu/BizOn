# Kế hoạch thực hiện: Công cụ giảng viên sau buổi UMK

**Nhánh**: `claude/cong-cu-giang-vien` | **Ngày**: 2026-11-19 | **Đặc tả**: [spec.md](spec.md)

## Tóm tắt

Ba PR, làm theo thứ tự ưu tiên:
- **PR 1** (câu chuyện 1): tab «Bật Nghiệp» trên Màn hình lớp học. Đọc `bizon_submissions_v2` có sẵn, xếp theo lợi nhuận lũy kế bằng chính hàm `teams()` của `js/bizon-grading.js` (1A). Không cần migration.
- **PR 2** (câu chuyện 2): viết lại `truong-giang-vien.html` thành tài liệu tập huấn 6 bước, giữ địa chỉ (2A). Ảnh chụp sinh bằng script Playwright trên lớp demo. Có bản in A4 và bản EN.
- **PR 3** (câu chuyện 3, 3A): chọn nhanh lý do lúc chốt vòng (không bắt buộc) bằng mô-đun móc ngoài; dòng thời gian theo đội trên Trang Giảng viên. Làm sau PR 1 và 2.

## Bối cảnh kỹ thuật

- **Màn hình lớp học**:
  - `man-hinh-lop-hoc.html` (script module), `js/man-hinh-lop-hoc.js` (sa bàn three.js, `createStage().show(game, data, night)`), `js/man-hinh-lop-hoc-data.js` (bộ chuyển dữ liệu `fromFt/fromBp/fromJourney`, `demo(game)`, `withLive`);
  - tab chọn bằng `data-game`; `GAME_URL`, `NOTES`, `NIGHT_DEFAULT` khai trong trang.
- **Dữ liệu Bật Nghiệp**:
  - `BizOnInstructor.submissions(code)` (RPC `bizon_submissions_v2`, cần giảng viên đăng nhập; chế độ demo có `dRows`);
  - `window.BizOnInstructorPage.teams(subs)` gom đội không phân biệt hoa thường, cộng `netProfit` các vòng, bỏ đội giảng viên chơi thử (`staff`). PR 1 nạp `js/bizon-grading.js` vào Màn hình lớp học để dùng lại hàm này, không chép công thức.
- **Tuyến 6 chặng**: Cần Thơ → TP. Hồ Chí Minh → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội. Tọa độ lấy theo cách `PLACES` của tab Bến Phù Sa. Mỗi đội là một xe tải đất sét đặt ở chặng bằng vòng lớn nhất đã nộp.
- **Tập huấn**:
  - `truong-giang-vien.html` hiện dùng `data-vi`/`data-en`, có 6 mục h2;
  - script chụp ảnh mới `scripts/chup-tap-huan.mjs` mở lớp demo (`Trang Giang Vien.dc.html` chế độ «Dùng thử», `man-hinh-lop-hoc.html?demo=1`, `BizOn Game 3D.html` Đội Demo) và lưu `assets/tap-huan/buoc-N-{vi,en}.webp`;
  - ảnh sinh lại thì lưu tệp mới `-v2`… theo quy tắc không ghi đè.
- **Lý do quyết định (PR 3)**:
  - luồng chốt nằm trong `js/app.js` (đóng băng), nên làm mô-đun `js/ly-do-quyet-dinh.js` móc `commitDecisions` giống cách `js/cang-cai-mep.js` móc;
  - lý do ghi vào `decisions.reasons` của vòng, đi theo `result_json` đang nộp; không cần bảng mới;
  - dòng thời gian đọc nhật ký thành viên (`bizon_team_log_v2`) và lượt nộp. Nếu RPC hiện có không đủ, dừng lại và hỏi chị trước khi viết migration.

## Kiểm theo hiến chương

| Nguyên tắc | Ảnh hưởng | Cách giữ |
|---|---|---|
| I. Học là chính | PR 3 hỏi «vì sao» | Lý do là danh sách trung tính, không gợi đáp án; Lumina không chọn giúp. Không đổi luật, không tính điểm riêng |
| II. Nói thật | Xếp hạng trên màn lớp | Dùng chung hàm xếp hạng với Trang Giảng viên, ghi rõ «xếp theo lợi nhuận lũy kế» |
| III. Trang tĩnh (không thương lượng) | Tab mới, trang tập huấn | Không build; VI/EN; 360/390/1280 px; trạng thái chưa đăng nhập, trống, lỗi, mất mạng; bản in A4 bằng `@media print` |
| IV. Có test | Mỗi PR có test viết trước | PR 1: `test/man-hinh-lop-hoc-bat-nghiep.test.js`; PR 2: `test/tap-huan-giang-vien.test.js`; PR 3: `test/ly-do-quyet-dinh.test.js`. html-validate 0 lỗi, `sw.js` số lớn nhất + 1 |
| V. Dữ liệu tối thiểu | PR 3 thêm lý do | Không bắt buộc (3A); chỉ gửi khi có mã lớp; chỉ chủ lớp xem; không dùng cho nghiên cứu khi chưa có phiếu đồng thuận |
| Hồ sơ quyền tác giả | PR 3 chạm luồng chốt | Không sửa `js/engine.js`, `js/app.js`, `js/backend.js`; mô-đun móc ngoài, gỡ một thẻ script là trở lại như cũ. Test `ip-ma-nguon-afbacd2` phải đạt |

## Tệp sẽ chạm

| Tệp | PR | Thay đổi |
|---|---|---|
| `man-hinh-lop-hoc.html` | 1 | Nút tab «Bật Nghiệp», `NOTES.bn`, `GAME_URL.bn = 'BizOn Game 3D.html'`, nạp `js/bizon-grading.js`, nhánh `fetchData` cho `bn` |
| `js/man-hinh-lop-hoc-data.js` | 1 | `GAMES.bn`, `fromBn(subs)` (dùng `BizOnInstructorPage.teams`), dữ liệu minh họa `demo('bn')` |
| `js/man-hinh-lop-hoc.js` | 1 | Cảnh `bn`: tuyến 6 thành phố, xe tải đất sét, nhãn VI/EN |
| `truong-giang-vien.html` | 2 | Viết lại theo 6 bước của một buổi dạy, ảnh từng bước, mục lỗi hay gặp, CSS in |
| `scripts/chup-tap-huan.mjs` (mới), `assets/tap-huan/*.webp` (mới) | 2 | Chụp ảnh lớp demo VI/EN |
| `giang-vien.html`, các trang có liên kết «Lần đầu? Hướng dẫn 5 bước» | 2 | Đổi chữ liên kết thành «Tập huấn 6 bước» |
| `js/ly-do-quyet-dinh.js` (mới), `game.html`, `bat-nghiep-v2.html` | 3 | Mô-đun chọn lý do; mỗi trang thêm một thẻ script |
| `Trang Giang Vien.dc.html` hoặc `js/bizon-grading.js` | 3 | Dòng thời gian theo đội |
| `sw.js` | 1, 2, 3 | Thêm tệp mới, nâng `CACHE` |

## Rủi ro

- **Lớp đông**: 32–40 đội × 6 vòng = 240 lượt nộp. RPC đã trả đủ từ #1112 (giới hạn lớp đông). Sa bàn chỉ vẽ 10 đội đầu.
- **Test Màn hình lớp học** đếm 3 tab (`man-hinh-lop-hoc.test.js`, `man-hinh-lop-hoc-en.test.js`): sửa cho đủ 4 tab và ghi lý do.
- **Ảnh tập huấn lỗi thời** khi giao diện đổi (đặc tả 006): chạy lại `scripts/chup-tap-huan.mjs`, lưu ảnh mới `-v2`.

## Đối chiếu (theo `/speckit-analyze`, 19/11/2026)

- **Độ phủ**:
  - FR-001, FR-002 → T001–T005;
  - FR-003 → T007–T011;
  - FR-004, FR-005 → T013–T017;
  - FR-006 → T005, T011, T017.
- **Còn để ý (mức thấp)**:
  - PR 3 có thể cần RPC mới cho dòng thời gian; nếu cần, em hỏi chị trước (T015).
  - Danh sách lý do (5–6 mục) em đề xuất trong PR 3 để chị duyệt câu chữ.
- **Mức CRITICAL**: không có.
