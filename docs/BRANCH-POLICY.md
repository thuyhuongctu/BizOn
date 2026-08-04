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
| Nhánh đích đã chọn | `develop` (tạo ngày 2026-08-04 từ `main` tại `78f0021`) |
| Lý do chọn | Quy ước tích hợp chuẩn: `main` là bản phát hành ổn định, `develop` là nơi mọi việc mới hợp nhất vào trước khi lên `main`. Nhánh tính năng rẽ từ `develop`, PR quay về `develop`. |

> Nhánh `develop` được tạo bằng thao tác **chỉ thêm** (`git branch develop origin/main` + push), KHÔNG đụng nhánh cũ nào. Mục A1 (sao lưu gương) và A3 (phân loại 56 nhánh) vẫn là việc của chủ dự án và chưa thực hiện — tạo nhánh đích không thay thế hai mục đó.

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

- [ ] Bật bảo vệ nhánh cho `[NHÁNH ĐÍCH]`.
- [ ] Yêu cầu PR trước khi hợp nhất; cấm đẩy thẳng.
- [ ] Yêu cầu các kiểm thử CI hiện có xanh (xem `.github/workflows/`).
- [ ] Yêu cầu ít nhất một lượt duyệt (nếu có đồng tác giả).

---

*Điền xong ba mục A1–A3 là mở khóa được Bước 3 (Instructor Studio) mà không lo mất lịch
sử. Bước 1 (ghi dữ liệu người học) còn chờ thêm khung đồng thuận — xem
`docs/learning/CONSENT-FRAMEWORK-DRAFT-V1.md`.*
