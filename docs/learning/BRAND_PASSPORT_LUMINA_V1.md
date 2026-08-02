# Brand Passport Learning Edition — Lumina Coach–Critic–Reflection V1

## 1. Mục tiêu

Triển khai một lớp hỗ trợ học tập có thể kiểm tra cho Brand Passport theo chuỗi:

```text
Decision → Consequence → Explanation → Reflection → Learning evidence
```

V1 ưu tiên ba nguyên tắc:

1. **Deterministic engine vẫn là nguồn duy nhất tính kết quả.**
2. **Lumina hỗ trợ phản tư, không chọn đáp án thay người học.**
3. **Mọi quyết định và diễn giải đều có audit trail.**

Bản tin học thuật ngày 02/08/2026 cung cấp định hướng trực tiếp cho kiến trúc này: AI coach nên hỗ trợ nhận thức, động lực và tự điều chỉnh trong mô phỏng; perceived usefulness phải được thể hiện qua mối liên hệ rõ giữa quyết định, hệ quả và mục tiêu học tập. Bản tin không cung cấp đầy đủ metadata thư mục cho nghiên cứu Lara/CAIS-GBL, nên tài liệu này không tự bổ sung hoặc suy đoán citation còn thiếu.

## 2. Phạm vi V1

### Đã triển khai

- Trang độc lập `brand-passport-learning.html`.
- Nhúng nguyên trạng `brand-passport.html` trong iframe cùng origin.
- Bọc các hàm UI công khai của game để quan sát luồng quyết định.
- Coach prompt theo trạng thái hiện tại.
- Critic question theo rủi ro, mức hiểu biết thị trường và entry mode.
- Reflection do người học tự nhập.
- Decision Trace sau mỗi quý.
- Mapping quyết định với CLO.
- Export audit trail dạng JSON.
- Lưu cục bộ bằng `localStorage`.
- Bộ kiểm thử Playwright và GitHub Actions.

### Chưa triển khai

- Không gọi LLM hoặc API AI bên ngoài.
- Không tạo lời khuyên sinh tự do.
- Không thay đổi score, cash, profit, event hoặc bất kỳ rule nào của engine.
- Không gửi reflection lên Supabase.
- Chưa có instructor dashboard.
- Chưa có competitive cohort mode.
- Chưa có consent flow cho pilot nghiên cứu thật.

## 3. Kiến trúc

```text
brand-passport-learning.html
        │
        ├── iframe: brand-passport.html
        │       └── deterministic engine + window.bpTest (read-only)
        │
        └── js/brand-passport-learning.js
                ├── observe public UI functions
                ├── read state snapshot
                ├── Coach rules
                ├── Critic rules
                ├── learner reflection
                ├── consequence delta
                ├── explanation + CLO mapping
                └── local audit JSON
```

Learning Layer không truy cập trực tiếp biến nội bộ `S`. Nó chỉ dùng cửa sổ kiểm thử chỉ-đọc `window.bpTest.state()` đã có trong game và các hàm công khai như `bpPick`, `bpEnter`, `bpCommit`, `bpEv`.

## 4. Coach–Critic–Reflection

### Coach

Coach giúp người học xác định khung phân tích:

- mục tiêu chiến lược của quý;
- đánh đổi giữa kiểm soát, vốn và tính chính danh địa phương;
- thanh khoản và mức hiểu biết thị trường;
- lý do nên hoặc chưa nên mở thị trường mới.

### Critic

Critic không phán quyết đúng/sai. Nó chất vấn:

- rủi ro thanh khoản;
- chất lượng bằng chứng thị trường;
- phụ thuộc đối tác;
- yêu cầu vốn và năng lực vận hành;
- giới hạn của kênh số;
- bằng chứng có thể bác bỏ lựa chọn hiện tại.

### Reflection

Người học được yêu cầu tự ghi:

- lý do lựa chọn;
- bằng chứng đã sử dụng;
- rủi ro lớn nhất;
- điều kiện khiến quyết định có thể sai.

V1 không bắt buộc nhập reflection để tiếp tục game nhằm tránh thay đổi hành vi engine và UX gốc. Pilot nghiên cứu có thể bật điều kiện tối thiểu sau khi protocol, consent và rubric được duyệt.

## 5. Audit schema

```json
{
  "schema_version": "bizon.learning.trace.v1",
  "learning_layer_version": "bp-learning-v1.0.0",
  "session_id": "uuid",
  "team_id": "TEAM-04",
  "game_seed": "424242",
  "engine_source": "brand-passport.html deterministic engine",
  "ai_mode": "rule-based instructional prototype; no LLM scoring",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "records": [
    {
      "record_id": "uuid",
      "round": 1,
      "decision": {
        "priority_id": 0,
        "priority": "Thu thập thông tin",
        "budget_id": 1,
        "budget": "Cân bằng",
        "entry_market_id": 0,
        "entry_market": "Hải Lam",
        "entry_mode_id": 0,
        "entry_mode": "Nền tảng số",
        "intelligence_source_ids": []
      },
      "coach_prompt": "...",
      "critic_question": "...",
      "student_reflection": "...",
      "outcome_before_engine": {},
      "outcome_after_engine": {},
      "outcome_delta": {},
      "consequence": "...",
      "explanation": "...",
      "learning_outcomes": [],
      "engine_outcome_source": "deterministic",
      "ai_changed_score": false,
      "audit_timestamp": "ISO-8601"
    }
  ]
}
```

## 6. Giới hạn diễn giải

`outcome_delta` được tính giữa snapshot trước khi chốt quý và snapshot sau khi engine xử lý quyết định cùng biến cố. Vì vậy:

- không được diễn giải delta là tác động nhân quả riêng của một lựa chọn;
- biến cố quý có thể đồng thời làm thay đổi kết quả;
- explanation V1 chỉ mô tả logic và trade-off, không tự nhận là causal explanation;
- AI không thay đổi bất kỳ giá trị chấm điểm nào.

## 7. Dữ liệu, đạo đức và quyền riêng tư

V1 lưu dữ liệu trên thiết bị hiện tại. Trước pilot lớp học hoặc nghiên cứu cần bổ sung:

- thông báo và consent;
- mục đích sử dụng dữ liệu;
- thời hạn lưu giữ;
- quyền truy cập, xuất và xóa;
- mã hóa định danh nhóm/sinh viên;
- phân quyền giảng viên;
- quy trình xử lý withdrawal;
- versioning protocol và rubric.

Không nên thu tên thật khi mã nhóm hoặc mã nghiên cứu đã đủ mục đích.

## 8. Tiêu chí nghiệm thu V1

- Learning Layer kết nối được với game.
- Engine gốc vẫn truy cập và chạy bình thường.
- Một quý tạo đúng một decision trace hoàn tất.
- Trace có snapshot trước/sau, reflection, CLO và timestamp.
- `engine_outcome_source = deterministic`.
- `ai_changed_score = false`.
- Không lỗi JavaScript.
- Không tràn ngang ở viewport Android 390 × 844.

## 9. Lộ trình tiếp theo

### V1.1

- Nút truy cập Learning Edition từ homepage/Brand Passport sau khi UX được duyệt.
- Song ngữ VI/EN cho Learning Layer.
- Rubric reflection 4 mức.
- Market Intelligence Ledger.
- Path-dependence replay.

### V2

- Supabase schema cho consented audit records.
- Instructor debrief dashboard.
- Cohort/team management.
- So sánh decision paths giữa các nhóm.

### V3

- LLM explanation service tách biệt hoàn toàn với engine.
- Prompt/version registry.
- Guardrails, citations và uncertainty labels.
- Adaptive support theo self-regulation signals.
- A/B hoặc quasi-experimental pilot về perceived usefulness, engagement và learning outcomes.
