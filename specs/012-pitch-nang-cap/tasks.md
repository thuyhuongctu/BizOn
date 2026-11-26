# Danh sách việc: Nâng cấp Phòng luyện pitch gọi vốn

## Nền và Câu chuyện 1 – Hội đồng nhà đầu tư cả lớp (P1, PR 1)
- [x] T001 Test, viết trước và thấy hỏng:
  - **hàm thuần sổ góp vốn:** 1 tỷ đồng mỗi quỹ, bậc 50 triệu, trần 500 triệu cho một đội, không rót cho mình, bỏ tin trùng theo mã lượt, bảng xếp hạng, CSV; giả lập 12 quỹ rót liên tục và gửi trùng, tổng vẫn đúng (SC-001);
  - **chủ phòng duy nhất:** máy thứ hai mở màn chiếu cùng mã phòng thì chỉ được xem;
  - **Ra Khơi 3D:** tên kênh mặc định không đổi;
  - **Playwright** (màn chiếu và 3 quỹ trên các thẻ trình duyệt, chuyển tin `local` qua `BroadcastChannel`): duyệt quỹ vào phòng, rót vốn, màn chiếu cập nhật, quỹ của đội đang pitch bị khóa, xuất CSV;
  - **trang:** 360 px, VI/EN, không gọi mạng ngoài.
- [x] T002 `js/phong-realtime.js`: thêm tham số tiền tố kênh, giá trị mặc định giữ nguyên.
- [x] T003 `lab/pitch-goi-von-lop.js`: sổ góp vốn, kiểm luật, xếp hạng, CSV; lớp chuyển tin (`realtime` / `local`); nhận chủ phòng qua nhịp bản tin mỗi giây (một chủ, máy sau nghe thấy nhịp thì chỉ xem).
- [x] T004 `lab/pitch-goi-von.html`: nút «Chế độ lớp»; bật bằng nút hoặc `?hoidong=1` (không dùng `?lop=`, tham số đó là mã lớp); màn chiếu có mã phòng, QR (`js/vendor/qrcode.js`), danh sách quỹ chờ duyệt, cửa sổ rót 60 giây, bảng góp vốn trực tiếp, bảng xếp hạng cuối buổi; sửa câu chân trang.
- [x] T005 `lab/pitch-quy.html`: trang quỹ trên điện thoại (vào phòng, vốn còn lại, rót theo bậc, danh mục, dòng về dữ liệu); `sw.js`, `sitemap.xml` (không đưa trang quỹ vào sitemap vì cần mã phòng; trang có `noindex`).

## Câu chuyện 2 – Rubric nghiên cứu và chấm cặp (P2, PR 2)
- [ ] T006 Test, viết trước: rubric đủ 6 tiêu chí VI/EN và câu «ý định đầu tư», mô tả neo 1–5, trích dẫn qua `kiem-trich-dan.mjs`; chấm mù (không lộ điểm trước khi đủ người nộp); ICC(2,1), ICC(2,k) khớp số liệu mẫu của Shrout và Fleiss (1979), sai số dưới 0,01; α Krippendorff khớp ví dụ mẫu; cảnh báo khi dưới 30 lượt.
- [ ] T007 `lab/pitch-goi-von-rubric.js` cùng màn chấm trên trang quỹ và màn chấm giảng viên (`?gv=1`); trung bình theo tiêu chí hiện sau khi mở; CSV dạng dài (một dòng một người chấm, một tiêu chí). Hương duyệt mô tả neo.
- [ ] T008 `scripts/research/do-tin-cay-pitch.mjs`, hướng dẫn `docs/research/DO-TIN-CAY-PITCH.md`; nối «trang chấm mù» trong `docs/research/ISAGA-2027-DAN-Y-BAI.md`.

## Câu chuyện 3 – Hội đồng 3D sống động hơn (P3, PR 3)
- [ ] T009 Test, viết trước: bảng luật phản ứng đủ VI/EN; tín hiệu «ba con số lệch» làm Victor Lâm cau mày và hỏi câu tài chính; quá giờ thì Lumina gõ chuông và người hỏi ghi chép; giảm chuyển động thì không chạy hoạt ảnh; giọng đọc tắt/mở được, máy không có giọng thì không lỗi.
- [ ] T010 Tính cách và bảng luật trong `lab/pitch-goi-von-data.js`; tín hiệu trong `-core.js`; biểu cảm và bong bóng lời trong `-3d.js`; bản phẳng hiện cùng câu nói; nút giọng đọc (Web Speech API).

## Câu chuyện 4 – Lumina góp ý sau pitch (P4, PR 4)
- [ ] T011 Test, viết trước: quá giờ ở đoạn Tài chính và lệch điểm hòa vốn thì Lumina nêu đúng hai điểm và gợi ý 3 câu nhóm tài chính; nút «Luyện lại ba câu này»; cờ `explain_hidden` (qua `?lop=`) ẩn góp ý cụ thể; CSV có cột `lumina`.
- [ ] T012 Luật góp ý trong `-data.js`, hàm chọn góp ý trong `-core.js`, khối Lumina trong trang; đọc cờ qua `js/explain-mode.js`; mục mới trong `docs/huong-dan-giang-vien.md` (chế độ lớp, đồng thuận nghiên cứu, nhánh Lumina).

## Kế hoạch PR

| PR | Câu chuyện | Nhánh | Test hỏng trước | Tệp chính | Hương làm tay |
|---|---|---|---|---|---|
| 0 (PR này) | Đặc tả, kế hoạch, việc | `claude/pitch-nang-cap` | – | `specs/012-pitch-nang-cap/` | Duyệt |
| 1 | US1 Hội đồng nhà đầu tư cả lớp | `claude/pitch-nang-cap-p1` | `test/pitch-hoi-dong-lop.test.js` | `js/phong-realtime.js`, `lab/pitch-goi-von-lop.js`, `lab/pitch-quy.html`, `lab/pitch-goi-von.html`, `sw.js` | Thử một buổi trên lớp thật (cần mạng lớp) |
| 2 | US2 Rubric nghiên cứu, chấm cặp | `claude/pitch-nang-cap-p2` | `test/pitch-rubric-do-tin-cay.test.js` | `lab/pitch-goi-von-rubric.js`, `scripts/research/do-tin-cay-pitch.mjs`, `docs/research/` | Duyệt mô tả neo 6 tiêu chí |
| 3 | US3 Hội đồng 3D sống động | `claude/pitch-nang-cap-p3` | `test/pitch-hoi-dong-phan-ung.test.js` | `lab/pitch-goi-von-3d.js`, `-data.js`, `-core.js` | Duyệt câu nói của ba nhà đầu tư |
| 4 | US4 Lumina góp ý, nhánh nghiên cứu | `claude/pitch-nang-cap-p4` | `test/pitch-lumina-gop-y.test.js` | `-data.js`, `-core.js`, `lab/pitch-goi-von.html`, `docs/huong-dan-giang-vien.md` | Không |

Mỗi PR nâng `CACHE` trong `sw.js`; chạy `html-validate@8.24.1` 0 lỗi trên tệp đã đổi; các test của đặc tả 010 (`pitch-goi-von*.test.js`) vẫn đạt.

## Đối chiếu
- FR-001, FR-002, FR-003 → T001–T005.
- FR-004, FR-005 → T006–T008.
- FR-006, FR-007 → T009–T010.
- FR-008 → T011–T012.
- FR-009 → mỗi PR chạy lại test đặc tả 010.
- SC-001 → T001 (giả lập 12 quỹ). SC-002 → T006. SC-003 → T009, T011. SC-004 → mọi PR.
- Không còn chỗ cần làm rõ.
