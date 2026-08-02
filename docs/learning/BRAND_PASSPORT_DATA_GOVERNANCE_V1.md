# Brand Passport Learning Pilot — Data Governance V1

## 1. Phạm vi

Tài liệu này áp dụng cho `brand-passport-learning-pilot.html`, lớp pilot bọc quanh Brand Passport Learning Edition.

Mục tiêu là tạo cơ chế thu nhận Decision Trace phục vụ giảng dạy/nghiên cứu mà vẫn giữ các nguyên tắc:

1. **Local-only là mặc định.**
2. **Không gửi dữ liệu nếu người học chưa chủ động opt-in.**
3. **Không yêu cầu họ tên, email hoặc số điện thoại.**
4. **Dữ liệu có thời hạn lưu rõ ràng và cơ chế xóa sớm.**
5. **Reflection không được dùng để AI tự động chấm điểm.**
6. **Deterministic engine vẫn là nguồn duy nhất tạo kết quả mô phỏng.**

Tài liệu này là đặc tả kỹ thuật–quản trị của pilot, không thay thế phê duyệt đạo đức nghiên cứu, quy định của cơ sở đào tạo hoặc tư vấn pháp lý.

> **Trạng thái hiện tại:** migration và client opt-in mới nằm trong Draft PR. Không xem đây là hệ thống thu dữ liệu production cho đến khi migration được review, áp dụng trên staging, kiểm thử submit/delete/purge và có phê duyệt triển khai.

## 2. Hai chế độ dữ liệu

### Local-only — mặc định

- Decision Trace và reflection lưu trong `localStorage` trên thiết bị hiện tại.
- Không có request ghi dữ liệu lên Supabase.
- Người học vẫn sử dụng đầy đủ Coach–Critic–Reflection.
- Người học có thể xuất audit JSON hoặc xóa trace cục bộ.

### Server opt-in

Chỉ kích hoạt khi đồng thời có:

- ít nhất một Decision Trace hoàn tất;
- mã lớp hợp lệ;
- checkbox consent được đánh dấu;
- hành động bấm **Gửi trace về lớp**.

Không được suy diễn việc mở trang, chơi game hoặc nhập reflection là consent gửi dữ liệu.

## 3. Dữ liệu được gửi

| Trường | Mục đích |
|---|---|
| `class_code` | Định tuyến dữ liệu về đúng lớp |
| `team_alias` | Bí danh/mã nhóm, không yêu cầu tên thật |
| `session_id` | Liên kết các lần cập nhật của cùng phiên |
| `game_seed` | Tái lập điều kiện kịch bản |
| `schema_version` | Kiểm soát cấu trúc audit |
| `learning_layer_version` | Truy vết phiên bản phần mềm |
| `consent_version`, `consented_at` | Chứng minh phiên bản thông báo và thời điểm opt-in |
| `trace_json` | Decision, consequence, explanation, reflection, CLO và audit metadata |
| `client_ts` | Hỗ trợ đối chiếu thời gian client/server |

Không thu trong V1:

- họ tên bắt buộc;
- email;
- số điện thoại;
- vị trí chính xác;
- danh bạ;
- dữ liệu sinh trắc học;
- nội dung ngoài phạm vi Learning Edition.

## 4. Mục đích sử dụng

Dữ liệu pilot chỉ nên được sử dụng cho các mục đích đã thông báo và được phê duyệt, ví dụ:

- debrief trong lớp;
- đánh giá cách người học giải thích trade-off;
- kiểm tra tính khả dụng của Learning Edition;
- nghiên cứu giáo dục đã có protocol/consent phù hợp.

Không dùng reflection để:

- AI tự động cho điểm cuối cùng;
- suy luận đặc điểm nhạy cảm;
- quảng cáo cá nhân hóa;
- chia sẻ cho bên thứ ba ngoài phạm vi được thông báo.

## 5. Consent

Consent V1 có mã:

```text
bp-learning-consent-v1
```

Thông báo trong giao diện phải nêu rõ:

- gửi dữ liệu là tự nguyện;
- không gửi vẫn chơi được;
- loại dữ liệu dự kiến gửi;
- thời hạn lưu tối đa 180 ngày;
- quyền xóa bằng biên nhận;
- reflection không dùng để AI chấm điểm.

Nếu mục đích, dữ liệu, retention hoặc đối tượng truy cập thay đổi, phải tăng phiên bản consent và yêu cầu consent lại.

## 6. Retention

- Mỗi bản ghi có `retention_until = created_at + 180 days`.
- Cập nhật trace không kéo dài thời hạn lưu ban đầu.
- RPC `bizon_purge_expired_learning_traces()` xóa vật lý dữ liệu hết hạn.
- Production cần cấu hình cron/service-role gọi purge định kỳ.
- Không được coi việc có trường `retention_until` là đủ nếu chưa có lịch purge hoạt động.

## 7. Quyền xóa

Khi gửi lần đầu, client tạo:

- `trace_id` — mã bản ghi;
- `delete_token` — khóa bí mật 256-bit.

Server chỉ lưu SHA-256 của token. Client tạo **deletion receipt JSON** chứa token gốc.

Xóa sớm qua RPC:

```text
bizon_delete_learning_trace(trace_id, delete_token)
```

Ai giữ đúng biên nhận có thể xóa bản ghi nhưng không thể đọc dữ liệu bằng biên nhận đó.

### Cảnh báo vận hành

- Không ghi deletion token vào `trace_json`.
- Không log token ở analytics hoặc error reporting.
- Người học cần tải/giữ biên nhận nếu muốn xóa từ thiết bị khác.
- Nếu mất biên nhận, quy trình hỗ trợ thủ công phải được đơn vị pilot quy định trước.

## 8. Phân quyền

### Người học/anon

Được:

- gọi RPC submit khi payload hợp lệ và có consent;
- cập nhật đúng `trace_id` khi cung cấp đúng deletion token;
- xóa đúng bản ghi khi cung cấp đúng deletion token.

Không được:

- `SELECT` trực tiếp bảng;
- liệt kê bản ghi;
- đọc trace của nhóm khác;
- sửa/xóa khi không có token.

### Giảng viên

Giảng viên đọc qua:

```text
bizon_bp_learning_traces(class_code, instructor_key)
```

RPC chỉ trả dữ liệu khi `bizon_check_key(instructor_key)` hợp lệ và mã lớp khớp.

### Service role

Chỉ dùng ở môi trường server để:

- purge dữ liệu hết hạn;
- backup/incident response theo quy trình được phê duyệt.

Không đưa service-role key vào JavaScript hoặc repository công khai.

## 9. Ràng buộc kỹ thuật

Server từ chối payload nếu:

- mã lớp không hợp lệ;
- consent version sai hoặc thiếu thời điểm consent;
- không có `records` dạng mảng;
- số record ngoài 1–6 quý;
- payload vượt 250 KB;
- trace không khai báo `data_governance.ai_scoring = false`;
- deletion token quá ngắn;
- cập nhật `trace_id` hiện có nhưng token không khớp.

Bảng bật RLS và không cấp quyền trực tiếp cho `anon`/`authenticated`; client chỉ thao tác qua RPC `SECURITY DEFINER` đã giới hạn.

## 10. Checklist trước lớp thật

- [ ] Protocol/purpose được phê duyệt bởi đơn vị phụ trách.
- [ ] Consent wording VI/EN được duyệt.
- [ ] Xác định data controller và đầu mối liên hệ.
- [ ] Cấu hình migration trên Supabase staging.
- [ ] Kiểm thử thật submit, cập nhật cùng trace ID và deletion receipt.
- [ ] Kiểm tra instructor key và phân lớp.
- [ ] Cấu hình purge job định kỳ và diễn tập purge.
- [ ] Kiểm tra Android thật, Safari/iOS và mạng yếu.
- [ ] Không có service-role key trong client.
- [ ] Có quy trình xử lý khi người học mất deletion receipt.
- [ ] Chốt thời điểm đóng pilot và xuất báo cáo tổng hợp.
- [ ] Chỉ sau các bước trên mới cân nhắc gắn Pilot Shell vào navigation production.
