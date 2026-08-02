# Brand Passport · Lumina Decision Trace V1

## Mục tiêu

Prototype này kiểm tra một kiến trúc **Coach–Critic–Reflection** cho Brand Passport mà không thay đổi deterministic simulation engine.

Trang Lab: `brand-passport-lumina-lab.html`

## Nguyên tắc quản trị

1. `brand-passport.html` tiếp tục tính toàn bộ kết quả, điểm số và điều kiện thắng/thua.
2. Lumina chỉ đọc bản sao trạng thái qua API kiểm thử `window.bpTest.state()`.
3. Lumina không ghi vào state, không gọi hàm scoring và không lựa chọn thay người học.
4. Người học phải tự chốt quyết định trong game.
5. Audit trail được lưu cục bộ và có thể xuất JSON để phục vụ debrief hoặc nghiên cứu thí điểm.

## Chu trình hỗ trợ

```text
Observe deterministic state
        ↓
Coach: gợi ý khung phân tích
        ↓
Critic: chất vấn giả định và trade-off
        ↓
Human decision in Brand Passport
        ↓
Deterministic consequence
        ↓
Human reflection
        ↓
Decision trace export
```

## Schema audit V1

Mỗi entry gồm:

```json
{
  "trace_version": "1.0.0",
  "session_id": "BP-...",
  "audit_timestamp": "ISO-8601",
  "quarter": 1,
  "phase": "obs|dec|evt",
  "event_type": "session_start|decision_selection|phase_dec|phase_evt|quarter_advanced|human_reflection|state_change",
  "changed_fields": ["phase", "sel"],
  "deterministic_state": {},
  "ai_role": "coach_critic_reflection",
  "ai_changes_score": false,
  "human_decision_required": true,
  "reflection": null
}
```

## Những gì V1 đã làm

- Theo dõi thay đổi state theo chu kỳ polling.
- Ghi dấu vết lựa chọn, chuyển phase và chuyển quý.
- Sinh câu hỏi Coach và Critic theo phase.
- Cho người học lưu reflection riêng.
- Xuất JSON có metadata quản trị.
- Không sửa file `brand-passport.html`.

## Giới hạn

- Đây là prototype client-side, không phải backend multi-user.
- Trace hiện dựa trên state diff, chưa có semantic event emitted trực tiếp từ engine.
- Chưa có model LLM; nội dung Coach/Critic là rule-based để giữ khả năng tái lập.
- Chưa có consent, class identity hoặc instructor dashboard.
- Dữ liệu localStorage không phù hợp làm nguồn nghiên cứu chính thức nếu chưa có quy trình đồng ý tham gia và backend bảo mật.

## Bước tiếp theo

1. Bổ sung semantic event bus từ Brand Passport: `decision_committed`, `event_choice`, `quarter_settled`.
2. Gắn rule/model explanation và CLO cho từng decision trace.
3. Thêm opt-in consent và pseudonymous participant ID.
4. Gửi trace tới backend append-only.
5. Xây Instructor Debrief Dashboard.
6. Sau khi deterministic trace ổn định mới thử LLM-generated coaching trong guardrails.
