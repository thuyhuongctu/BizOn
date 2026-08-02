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

### Local-only

- Là chế độ mặc định.
- Decision Trace và reflection chỉ lưu trên thiết bị người học.
- Không yêu cầu mã lớp.
- Không gọi API gửi dữ liệu.
- Người học vẫn sử dụng đầy đủ Coach–Critic–Reflection.

### Classroom/pilot opt-in

Chỉ kích hoạt sau khi người học:

- nhập mã lớp;
- chủ động đánh dấu consent;
- bấm gửi trace;
- nhận biên nhận xóa.

Consent học tập và consent nghiên cứu phải tách riêng. Không đồng ý nghiên cứu không được làm mất quyền tham gia hoạt động lớp học.

## 3. Dữ liệu tối thiểu

### Session

- session_id;
- class_code;
- team_id hoặc bí danh;
- game_seed;
- consent_version;
- consent_scope;
- consented_at;
- retention_until;
- learning_layer_version;
- engine_source.

### Decision record

- round;
- decision_json;
- outcome_before_json;
- outcome_after_json;
- outcome_delta_json;
- coach_text;
- critic_text;
- student_reflection;
- learning_outcomes;
- `engine_outcome_source = deterministic`;
- `ai_changed_score = false`;
- audit_timestamp;
- schema_version.

## 4. Không thu thập

- họ tên đầy đủ;
- email cá nhân;
- số điện thoại;
- địa chỉ;
- ngày sinh;
- dữ liệu sức khỏe;
- dữ liệu chính trị, tôn giáo hoặc sinh trắc học;
- nội dung ngoài mục tiêu học tập đã công bố.

## 5. Consent scopes

### classroom_learning

Dữ liệu được dùng để giảng viên phản hồi, debrief và đánh giá quá trình học tập trong lớp đã chỉ định.

### research_optional

Consent nghiên cứu phải tách riêng, có thông tin nghiên cứu cụ thể, cơ sở đạo đức và quyền rút lui. Không chọn vẫn được tham gia hoạt động lớp học.

## 6. Retention

- Pilot UI công bố: 180 ngày.
- Giới hạn kỹ thuật tối đa: 365 ngày.
- Hết hạn phải xóa session và toàn bộ decision records liên quan bằng cascade.
- Cần cấu hình Supabase Cron hoặc scheduler được phê duyệt.

## 7. Quyền xóa

Người học nhận một deletion token ngẫu nhiên. Chỉ hash của token được lưu trên server. Yêu cầu xóa phải xác minh token bằng hàm security-definer; không cho anonymous client xóa tùy ý theo session_id.

## 8. Phân quyền

| Vai trò | Insert | Read | Update | Delete |
|---|---:|---:|---:|---:|
| Anonymous learner | Có, qua policy/RPC giới hạn | Không | Không | Chỉ qua RPC có deletion token |
| Instructor | Không trực tiếp | Qua RPC + khóa lớp | Không trực tiếp | Không |
| Service role | Có | Có | Có | Có, cho retention và yêu cầu hợp lệ |

## 9. Migration

- `20260802000000_bp_learning_traces.sql`: schema trace pilot hiện có.
- `20260802010000_bp_learning_governance.sql`: lớp session, record và deletion governance bổ sung.

Mỗi migration phải có version timestamp duy nhất. Không dùng hai file cùng tiền tố thời gian vì Supabase có thể coi chúng là cùng một migration version.

## 10. Cổng phát hành

Không bật gửi dữ liệu thật trước khi hoàn tất:

- duyệt consent VI/EN;
- xác định data controller;
- xác định retention owner và lịch xóa;
- kiểm thử RLS/RPC trên Supabase staging;
- kiểm thử deletion receipt từ thiết bị khác;
- kiểm thử instructor access chỉ giới hạn đúng class_code;
- đánh giá bảo mật khóa giảng viên;
- phê duyệt nghiên cứu nếu dữ liệu được dùng ngoài hoạt động dạy học.
