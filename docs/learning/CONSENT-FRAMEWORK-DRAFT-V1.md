# Khung đồng thuận & Quyền dữ liệu người học — BẢN THẢO V1

> **TRẠNG THÁI: BẢN THẢO KỸ THUẬT — CHƯA CÓ HIỆU LỰC.**
> Tài liệu này ghi lại phần *kỹ thuật* của khung đồng thuận để mã nguồn có chỗ dựa
> (`js/decision-log.js`). Mọi quyết định *pháp lý và chính sách* — ai sở hữu dữ liệu,
> ngôn từ phiếu đồng thuận có hiệu lực, thời hạn lưu — thuộc về **chủ dự án + luật sư +
> hội đồng đạo đức**, KHÔNG do Claude Code quyết. Các mục dưới đánh dấu 🔒 là câu hỏi
> phải chuyển cho luật sư/hội đồng, không được tự trả lời trong mã.
>
> Nguồn: "Bộ mở khóa hai điểm chặn" (chủ dự án cung cấp) + bản giao việc Bước 1.

## B. Hai mục đích — hai ô đồng ý tách riêng

Gộp "nghiên cứu học thuật" và "cải tiến sản phẩm" vào một ô là ép buộc gián tiếp: người
học muốn giúp nghiên cứu buộc phải chấp nhận cả khai thác sản phẩm. Vì vậy tách đôi.

| Mục đích | Mã trong lược đồ | Bản chất | Ô đồng ý |
|---|---|---|---|
| Nghiên cứu học thuật | `research` | Công bố, phân tích tổng hợp, không danh tính | Ô 1 (độc lập) |
| Cải tiến sản phẩm | `product` | Hiệu chỉnh mô phỏng, hồ sơ phản ứng | Ô 2 (độc lập) |

**Đã hiện thực trong mã** (`js/decision-log.js`):

- Hằng số `PURPOSES = ['research', 'product']` — đúng hai ô.
- `DecisionLog` giữ cờ + phiên bản phiếu **riêng cho từng mục đích**; mặc định cả hai TẮT.
- `enablePurpose(purpose, version)` bật đúng một mục đích, bắt buộc kèm phiên bản phiếu.
- `record(fields, { consentedPurposes })` chỉ ghi cho **giao của** (mục đích đội đã đồng ý)
  ∩ (mục đích đang bật). Giao rỗng → bỏ qua, trả `reason: 'no_active_consent'`.
- Mỗi bản ghi đóng dấu `consent_purposes` — biết được bản ghi này được phép dùng cho việc gì.

🔒 **Chuyển hội đồng/luật sư:** ngôn từ chính xác của hai ô đồng ý; phiếu song ngữ VI/EN;
tuổi tối thiểu và cơ chế cho người học chưa đủ tuổi tự quyết.

## C. Xung đột vai trò: giảng viên vừa là nhà nghiên cứu

Người dạy đồng thời thu dữ liệu để nghiên cứu tạo áp lực ngầm: sinh viên sợ từ chối ảnh
hưởng điểm. Ba giảm thiểu (phần kỹ thuật đã sẵn sàng, phần quy trình cần hội đồng duyệt):

1. **Đồng thuận tách khỏi điểm số.** Nhật ký chỉ chứa `team_id` đã **băm** (`hashTeamId`),
   không tên/email; `looksLikePII` chặn danh tính lọt vào mọi trường. Giảng viên chấm trên
   ảnh chụp đóng băng (Bước 4), không cần biết ai đồng ý.
2. 🔒 **Người thu đồng thuận ≠ người chấm điểm.** Quy trình lớp học phải để một bên trung
   lập (trợ lý, hệ thống) thu phiếu; giảng viên không thấy ai đồng ý cho tới khi khóa điểm.
   → Hội đồng đạo đức duyệt.
3. 🔒 **Rút lui không ảnh hưởng điểm.** Phải nói rõ trong phiếu và thực thi bằng quy chế lớp.

## D. Giới hạn kỹ thuật của quyền rút lui — phải nói thẳng trong phiếu

Rút lui **chỉ ngăn được các lần ước lượng SAU**. Không gỡ được phần dữ liệu đã gộp vào
tham số cụm/hồ sơ phản ứng đã tính trước đó (giống như không rút lại được một giọt mực đã
hòa vào ly nước). Phiếu đồng thuận PHẢI nói đúng giới hạn này — hứa "xóa sạch mọi dấu vết"
là hứa điều mã không làm được.

**Đã hiện thực trong mã:**

- `withdraw(teamId)` đánh dấu đội rút lui; `record()` sau đó trả `reason: 'withdrawn'` — chặn
  mọi lần ghi/ước lượng tiếp theo.
- `entries({ excludeWithdrawn: true })` loại đội đã rút lui khỏi lần phân tích tiếp theo.
- Bản ghi *đã tạo trước khi rút lui* vẫn nằm trong bộ đệm — phản ánh trung thực rằng phần đã
  gộp vào tính toán trước đó không tự biến mất.

🔒 **Chuyển hội đồng/luật sư:**
- Câu chữ trong phiếu mô tả đúng giới hạn "rút lui chỉ chặn về sau".
- Thời hạn lưu bản ghi thô và lịch xóa định kỳ (`bizon_purge_expired_*` ở tầng lưu trữ).
- **🔒 Câu hỏi chưa có lời sạch — ai sở hữu dữ liệu người học khi BÁN sản phẩm cho trường
  khác?** Cần điều khoản chuyển giao quyền kiểm soát dữ liệu (data controller) trong hợp
  đồng bán/cấp phép. Đây là điểm chặn pháp lý, không phải điểm chặn kỹ thuật — luật sư trả lời.

---

## Trạng thái mở khóa

| Điểm chặn | Phần kỹ thuật | Phần cần người quyết |
|---|---|---|
| Hai mục đích tách ô | ✅ mã đã có (PURPOSES, enablePurpose) | 🔒 câu chữ phiếu (hội đồng) |
| Xung đột vai trò | ✅ băm + chấm trên ảnh chụp | 🔒 tách người thu/người chấm (hội đồng) |
| Giới hạn rút lui | ✅ withdraw + excludeWithdrawn | 🔒 câu chữ phiếu (luật sư) |
| Sở hữu dữ liệu khi bán | — (không phải việc của mã) | 🔒🔒 điều khoản controller (luật sư) |

> Cho tới khi bốn ô 🔒 được duyệt, cả hai mục đích trong `DecisionLog` vẫn **TẮT theo mặc
> định** — hạ tầng ghi đã sẵn sàng nhưng không ghi dữ liệu thật. Bật từng mục đích bằng
> `enablePurpose(purpose, version)` chỉ sau khi có phiếu tương ứng được phê duyệt.
