# Bản giao việc — Cập nhật trạng thái (04/08/2026)

> Ghi chú trạng thái gắn với "Bàn giao việc cho Claude Code" (nguồn chân lý). Mục đích:
> để sau này — kể cả chủ dự án sáu tháng nữa — **không ai tưởng Bước 8 đã xong** hay coi
> một mô-đun là "chín" khi nó chưa qua cổng chất lượng.

## 1. Bước 8 — HOÃN CÓ CHỦ Ý (không phải đã xong)

- **Trạng thái:** hoãn có chủ ý kể từ **04/08/2026**.
- **Đã làm được (một phần):** sửa tương phản màu đạt AA cho thanh ghi thể chế (`--silt` 4,3:1
  → 5,0:1; `--gold` mới 5,2:1) và bật kiểm tra `no-inline-style` + `aria-label-misuse`
  cho **các trang thể chế** qua `.htmlvalidate-institutional.json` + workflow
  `institutional-quality.yml` (PR #347).
- **CHƯA làm — phần còn lại của Bước 8:** kiểm toán điều hướng bàn phím xuyên suốt; quét
  `prefers-reduced-motion` toàn site (kể cả trang đất sét/game); ngân sách và đo hiệu năng
  cho toàn ứng dụng; bộ kiểm thử tự động đầy đủ cho engine (100-seed regression theo
  release gate).
- **Lý do hoãn:** ưu tiên nút thắt doanh thu (Bước 3). Bước 8 không biến mất — xem mục 3.

## 2. Định nghĩa "chín" và cách đọc bảng tổng quan

Theo bản giao việc và `docs/implementation/BIZON-RELEASE-GATES.md`: một mô-đun/nhánh chỉ được
gọi là **"chín"** khi **đã qua cổng chất lượng** (Bước 8 / các release gate). Vì Bước 8 đang
hoãn:

- **Không mô-đun nào ở trạng thái "chín" vào lúc này.**
- Mọi hạng mục trước đây bị ngụ ý là "đã chín / đã xong" phải đọc là **"gần xong"** — nghĩa là
  *đã hiện thực và kiểm thử hợp đồng, NHƯNG chưa qua cổng chất lượng*.
- Áp cho mọi bảng tổng quan (kể cả `app/blueprint-2030.html`,
  `docs/implementation/BIZON-PRODUCT-MATURITY.csv`): mức maturity/nhãn trạng thái là *snapshot*,
  không phải xác nhận đã qua cổng. Không nâng lên "chín/đã phát hành" nếu thiếu bằng chứng
  cổng chất lượng, visual QA, governance và khả năng rollback.

## 3. Điều kiện phát hành — Bước 8 là TIÊN QUYẾT trước lần bán đầu tiên

- Bước 8 chuyển thành **điều kiện tiên quyết trước khi bán cho đơn vị đầu tiên** (paid
  academic pilot).
- **Dùng nội bộ / thử nghiệm kỹ thuật:** chấp nhận được khi Bước 8 chưa hoàn tất.
- **Bán cho một trường đại học:** phải qua **kiểm toán khả năng tiếp cận** (và các release gate
  liên quan) trước. Bán một sản phẩm chưa kiểm toán tiếp cận cho cơ sở giáo dục là rủi ro khác
  hẳn so với dùng nội bộ.

## 4. Bước 3 — Instructor Studio: code trước, nghiệm thu sau

- **Tiêu chí hoàn thành (bản giao việc):** *một giảng viên NGOÀI nhóm chạy trọn một buổi mà
  không cần hỏi ai.*
- **Lõi đã có:** `js/instructor-gradebook.js` — đọc lược đồ nhật ký (Bước 1), chấm trên ảnh
  chụp đóng băng (Bước 4), cổng đồng thuận; kiểm thử trong CI (PR #345).
- **Đang/định dựng:** giao diện Instructor Studio (mở lớp, xem quyết định từng đội theo vòng,
  chỉ số neo, khung rubric, xuất báo cáo).
- **RÀNG BUỘC:** **không đánh dấu Bước 3 là xong** cho tới khi có **một giảng viên thật** thử
  trọn buổi. Cái tên đó là thứ mã không tạo ra được — thiếu người thử thì nút thắt doanh thu
  **vẫn còn nguyên** dù phần mềm đã viết xong. Trạng thái tối đa khi chưa có người thử:
  *"code xong, chưa nghiệm thu"* (một dạng "gần xong").

---

*Cập nhật bởi tự động hóa theo chỉ đạo của chủ dự án, 04/08/2026. Tài liệu này không tự xác lập
trạng thái phát hành; nó ghi lại quyết định để bảng tổng quan không nói sai về chính nó.*
