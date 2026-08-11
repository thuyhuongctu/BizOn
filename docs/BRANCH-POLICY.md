# Chính sách nhánh & Sao lưu — BizOn (Bước 0)

> **Trạng thái:** MẪU điền tay. Đây là việc của chủ dự án (≈30 phút), KHÔNG phải việc
> của Claude Code. Không thao tác git phá hủy trên 56 nhánh. Tài liệu này chỉ dựng
> khung để chủ dự án tự quyết định và tự thực hiện — thay các ô `[…]` rồi commit.

## 0. Vì sao có tài liệu này

Kho hiện có nhiều nhánh tồn dư từ các giai đoạn trước. Trước khi mở luồng ghi dữ liệu
người học thật (Bước 1) và Instructor Studio (Bước 3), cần MỘT nhánh đích rõ ràng và
MỘT bản sao lưu đầy đủ để không mất lịch sử. Đây là quyết định quản trị, nên do người
sở hữu kho thực hiện, không tự động hóa.

## A1. Sao lưu đầy đủ trước mọi thao tác

Chạy tại máy cá nhân (không phải trong phiên Claude Code), một lần:

```bash
# Bản sao gương đầy đủ mọi nhánh + tag + ref — cất ngoài GitHub để phòng hờ.
git clone --mirror git@github.com:thuyhuongctu/BizOn.git bizon-mirror-[NGÀY].git
# Ví dụ tên: bizon-mirror-2026-08-04.git
```

- [ ] Đã tạo bản gương và cất ở nơi an toàn (ổ ngoài / kho lưu trữ riêng).
- Đường dẫn bản sao: `[ĐIỀN ĐƯỜNG DẪN]`
- Ngày sao lưu: `[NGÀY]`
- Người thực hiện: `[TÊN]`

> Không xóa/gộp/ép-đẩy nhánh nào cho tới khi mục này đã tick.

## A2. Chọn nhánh đích

Nhánh đích là nhánh DUY NHẤT mà công việc mới hợp nhất vào. Mọi nhánh khác hoặc được
gộp vào đây, hoặc lưu trữ (đổi tiền tố), hoặc xóa sau khi đã có trong bản sao gương.

| Hạng mục | Giá trị |
|---|---|
| Nhánh mặc định hiện tại | `main` (bản đang chạy / deploy GitHub Pages) |
| Nhánh đích đã chọn | **`main`** — vừa tích hợp vừa phát hành (deploy GitHub Pages). Nhánh tính năng rẽ từ `main`, PR quay về `main`. |
| Lý do chọn | **Cập nhật 2026-08-11.** Thực tế nhiều tuần cho thấy `main` mới là nhánh đích thật: nhánh `develop` (tạo 2026-08-04 từ `main` tại `78f0021`) đến 2026-08-11 vẫn **đi sau `main` 54 commit và 0 commit đi trước** — chưa từng có việc nào hợp nhất vào nó; mọi PR (kể cả #399, #400) đều nhắm `main`, và không có gì hỏng. Khi tài liệu lệch với thực tế đang chạy tốt thì **sửa tài liệu, không bẻ thực tế**: chọn `main` làm nhánh đích duy nhất, tránh chi phí đồng bộ và rủi ro của việc hồi sinh một nhánh không dùng. |

> **`develop` — NGỪNG DÙNG (2026-08-11).** Giữ lại nhánh (không xóa) để không mất tham chiếu lịch sử, nhưng **không hợp nhất việc mới vào `develop`**. Nếu về sau cần một luồng tích hợp riêng, sẽ mở lại bằng quyết định có ghi chép mới — không mặc nhiên dùng lại `develop` cũ.
>
> Mục A1 (sao lưu gương) và A3 (phân loại nhánh tồn dư) vẫn là việc của chủ dự án.

## A3. Phân loại 56 nhánh (điền tay, quyết định của chủ dự án)

Với mỗi nhánh, chọn MỘT hành động. Không tự động hóa — đọc nội dung trước khi quyết.

| # | Tên nhánh | Hành động (`giữ` / `gộp→đích` / `lưu-trữ` / `xóa`) | Ghi chú |
|---|---|---|---|
| 1 | `[…]` | `[…]` | |
| … | | | |

- `lưu-trữ` = đổi tên sang tiền tố `archive/…` để khỏi vướng danh sách nhánh hoạt động.
- `xóa` = chỉ sau khi mục A1 đã tick (nhánh vẫn còn trong bản gương).

## A4. Quy tắc đặt tên nhánh từ nay

- Nhánh tính năng: `claude/<slug-việc>` hoặc `feat/<slug-việc>`.
- Không đẩy trực tiếp lên nhánh đích; mọi thay đổi qua Pull Request có kiểm thử.
- Nhánh phát triển hiện hành của tự động hóa: `claude/google-stitch-project-as0p1g`.

## A5. Cổng bảo vệ nhánh đích (thiết lập trên GitHub)

- [ ] Bật bảo vệ nhánh cho `main` (nhánh đích).
- [ ] Yêu cầu PR trước khi hợp nhất; cấm đẩy thẳng.
- [ ] Yêu cầu các kiểm thử CI hiện có xanh (xem `.github/workflows/`).
- [ ] Yêu cầu ít nhất một lượt duyệt (nếu có đồng tác giả).

## A6. Lịch sử quyết định nhánh đích

| Ngày | Quyết định | Ghi chú |
|---|---|---|
| 2026-08-04 | Ban đầu chọn `develop` làm nhánh đích | Theo quy ước tích hợp chuẩn (Bước 0); tạo `develop` từ `main` tại `78f0021`. |
| 2026-08-11 | **Đổi nhánh đích sang `main`; `develop` ngừng dùng** | Thực tế: `develop` chưa từng được hợp nhất (sau `main` 54 commit, 0 đi trước); mọi việc chạy trên `main` không lỗi. Cập nhật tài liệu cho khớp thực tế. |

*Các luật khác giữ nguyên: mọi thay đổi qua Pull Request có kiểm thử; xóa nhánh sau khi
gộp; giữ số nhánh mở ở mức thấp.*

---

*Điền xong ba mục A1–A3 là mở khóa được Bước 3 (Instructor Studio) mà không lo mất lịch
sử. Bước 1 (ghi dữ liệu người học) còn chờ thêm khung đồng thuận — xem
`docs/learning/CONSENT-FRAMEWORK-DRAFT-V1.md`.*
