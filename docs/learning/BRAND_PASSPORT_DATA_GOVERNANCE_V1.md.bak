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

> **Trạng thái hiện tại:** client opt-in, migration và kiểm thử PostgreSQL đã nằm trong Draft PR. Chưa xem đây là hệ thống thu dữ liệu production cho đến khi migration được áp trên staging, kiểm thử RLS/RPC thật và có phê duyệt triển khai.

## 2. Kiến trúc dữ liệu chuẩn

V1 sử dụng đúng một bảng canonical:

```text
public.bp_learning_traces
```

Mỗi dòng lưu một audit package của một session, gồm tối đa sáu Decision Trace records. Client chỉ thao tác qua RPC `SECURITY DEFINER` đã giới hạn:

```text
bizon_submit_learning_trace
bizon_delete_learning_trace
bizon_bp_learning_traces
bizon_purge_expired_learning_traces
```

Không tạo thêm các bảng `bp_learning_sessions`, `bp_learning_records` hoặc `bp_learning_deletion_requests` trong V1. Việc giữ một schema giúp consent, retention, deletion receipt và quyền truy cập không bị phân mảnh.

Migration canonical:

```text
supabase/migrations/20260802000000_bp_learning_traces.sql
```

## 3. Hai chế độ dữ liệu

### 3.1 Local-only

Đây là chế độ mặc định.

- Decision Trace và reflection nằm trong `localStorage` của thiết bị.
- Không cần mã lớp.
- Không cần consent gửi dữ liệu.
- Không tạo request tới Supabase.
- Người học vẫn sử dụng đầy đủ Coach–Critic–Reflection.

### 3.2 Server opt-in

Chỉ kích hoạt khi người học đồng thời:

1. đã có ít nhất một Decision Trace hoàn tất;
2. nhập mã lớp hợp lệ;
3. đánh dấu consent tự nguyện;
4. chủ động bấm gửi.

Không consent không làm giảm chức năng học tập và không ảnh hưởng điểm từ deterministic engine.

## 4. Dữ liệu được phép gửi

- mã lớp;
- bí danh nhóm;
- session ID;
- seed;
- schema/version;
- Decision Trace;
- Coach/Critic text;
- reflection do người học nhập;
- consent version và timestamp;
- metadata retention;
- client timestamp.

Không yêu cầu hoặc chủ động gửi:

- họ tên;
- email;
- số điện thoại;
- địa chỉ;
- tài khoản mạng xã hội;
- nội dung ngoài phạm vi mô phỏng.

Giảng viên phải hướng dẫn người học không nhập dữ liệu cá nhân hoặc dữ liệu nhạy cảm vào reflection.

## 5. Consent

Consent version:

```text
bp-learning-consent-v1
```

Consent phải thể hiện rõ:

- gửi dữ liệu là tự nguyện;
- không gửi vẫn dùng được Learning Edition;
- mục đích sử dụng;
- loại dữ liệu thu;
- thời hạn lưu;
- ai có quyền truy cập;
- quyền yêu cầu xóa;
- AI không dùng reflection để tự động chấm điểm.

Nếu dùng dữ liệu cho nghiên cứu ngoài hoạt động giảng dạy thông thường, cần opt-in hoặc phê duyệt phù hợp riêng; không suy diễn consent lớp học thành consent nghiên cứu rộng hơn.

## 6. Retention

V1 đặt retention mặc định 180 ngày.

Server giới hạn `retention_until` không vượt quá khoảng 181 ngày kể từ thời điểm tạo dòng. Dữ liệu hết hạn được xóa vật lý bằng:

```sql
select public.bizon_purge_expired_learning_traces();
```

Hàm purge chỉ cấp cho `service_role`/quản trị viên và không được gọi từ browser.

Lịch purge, người chịu trách nhiệm và bằng chứng thực thi phải được ghi nhận trước pilot.

## 7. Quyền xóa

Khi gửi thành công, client tạo và giữ một deletion receipt gồm:

- trace ID;
- deletion token bí mật;
- session ID;
- class code;
- consent version;
- retention information.

Server chỉ lưu SHA-256 hash của deletion token, không lưu token dạng rõ.

Người học có thể:

- xóa trên cùng thiết bị bằng receipt đã lưu;
- tải receipt JSON;
- dùng trace ID + deletion token trên thiết bị khác.

Sai token không được xóa bản ghi.

## 8. Phân quyền

### Anonymous client

Không có quyền trực tiếp `SELECT`, `INSERT`, `UPDATE` hoặc `DELETE` trên bảng.

Anonymous chỉ được `EXECUTE` các RPC submit/delete và RPC đọc của giảng viên. RPC đọc chỉ trả dữ liệu khi `bizon_check_key()` xác minh khóa và mã lớp khớp.

### Instructor

Truy cập qua:

```text
class_code + instructor key
```

Khóa mặc định phải được thay trước pilot. Không đưa khóa vào mã client, ảnh chụp, biên nhận hoặc tài liệu dành cho sinh viên.

### Service role

Chỉ dùng phía quản trị cho retention purge hoặc vận hành backend. Không commit `service_role` key vào GitHub.

## 9. Ràng buộc phương pháp

Server từ chối payload khi:

- consent version sai;
- consent timestamp thiếu;
- class code sai định dạng;
- trace không phải object;
- records không phải array hoặc không có 1–6 records;
- payload vượt 250 KB;
- deletion token quá ngắn;
- `data_governance.ai_scoring` không phải `false`.

Audit package phải tiếp tục công bố:

```json
{
  "engine_outcome_source": "deterministic",
  "ai_changed_score": false
}
```

Outcome delta chỉ là mô tả thay đổi giữa snapshot trước/sau; không được tự động tuyên bố quan hệ nhân quả.

## 10. Kiểm thử

Ba lớp kiểm thử bắt buộc:

1. `test/brand-passport-learning.test.js` — Learning Layer và Decision Trace.
2. `test/brand-passport-governance.test.js` — local-only, consent, submit/delete receipt và mobile QA với REST mock.
3. `test/sql/bp_learning_smoke.sql` — thực thi migration trên PostgreSQL 16 và kiểm tra quyền bảng, RPC, consent rejection, AI-scoring rejection, instructor key, deletion token và retention purge.

Workflow PostgreSQL cũng chặn:

- migration version trùng;
- schema learning cạnh tranh;
- anonymous direct-table privileges.

Kiểm thử PostgreSQL trong CI không thay thế staging Supabase. Toàn bộ STG-01 đến STG-08 trong `BRAND_PASSPORT_SUPABASE_STAGING_RUNBOOK.md` vẫn phải đạt trước khi thu dữ liệu thật.

## 11. Data controller và hồ sơ vận hành

Trước pilot phải điền và phê duyệt:

```text
Data controller:
Đơn vị chịu trách nhiệm:
Mục đích xử lý:
Cơ sở/phê duyệt áp dụng:
Đầu mối liên hệ:
Ngày bắt đầu pilot:
Ngày kết thúc pilot:
Ngày purge dự kiến:
Người thực hiện purge:
```

Không tự động gán CTU hoặc bất kỳ tổ chức nào là data controller khi chưa có xác nhận chính thức.

## 12. Quy tắc phát hành

Không merge/gắn Pilot Gateway vào navigation production và không thu dữ liệu sinh viên thật trước khi:

- duyệt consent VI/EN;
- xác định data controller;
- áp migration trên Supabase staging;
- kiểm thử RLS/RPC, deletion và retention purge trên staging;
- kiểm tra Android thật và Safari/iOS;
- có quyết định go/no-go được ghi nhận.
