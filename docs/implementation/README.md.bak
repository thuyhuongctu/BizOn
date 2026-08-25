# BizOn International Implementation Baseline v1

Các tệp trong thư mục này được bảo toàn từ kế hoạch thực thi PR #251 như một **baseline quản trị**, gồm kế hoạch tổng thể, backlog 12 sprint, product-maturity registry và release gates.

## Cách sử dụng

- Xem trạng thái sản phẩm và liên kết trực quan hiện hành tại `app/blueprint-2030.html`.
- Xem ánh xạ kiến trúc hiện hành tại `docs/roadmap/BIZON-INTERNATIONAL-BLUEPRINT-2030.md`.
- Dùng `BIZON-12-SPRINT-BACKLOG.csv` làm nguồn task/dependency ban đầu; cập nhật trạng thái trước khi lập sprint mới.
- Dùng `BIZON-PRODUCT-MATURITY.csv` như snapshot ban đầu, không mặc định coi các mức maturity cũ là trạng thái hiện tại.
- **Trạng thái "chín" (đã qua cổng chất lượng):** không mô-đun nào ở trạng thái "chín" cho tới khi **Bước 8** qua — Bước 8 đang **hoãn có chủ ý** (04/08/2026). Đọc mọi nhãn ngụ ý "đã xong" là **"gần xong"**. Chi tiết: [`../BAN-GIAO-VIEC-TRANG-THAI-2026-08-04.md`](../BAN-GIAO-VIEC-TRANG-THAI-2026-08-04.md).
- Áp dụng `BIZON-RELEASE-GATES.md` cho mọi quyết định Experimental, Technical Pilot, Academic Pilot và Paid Commercial Pilot.

## Nguyên tắc

Kế hoạch này không cho phép viết lại toàn bộ hệ thống. BizOn tiếp tục phát triển theo strangler pattern: giữ trải nghiệm đang vận hành, tách dần engine và dữ liệu thành mô-đun có version/contract, và chỉ nâng trạng thái khi có bằng chứng kiểm thử, visual QA, governance và khả năng rollback.
