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

### Pilot governance shell

`brand-passport-learning-pilot.html` bọc Learning Edition bằng lớp kiểm soát dữ liệu riêng:

- local-only vẫn là mặc định;
- không có request ghi dữ liệu trước opt-in;
- submit yêu cầu mã lớp + consent rõ ràng;
- retention tối đa 180 ngày;
- deletion receipt cho phép người học xóa sớm;
- anon không có quyền đọc bảng trực tiếp;
- giảng viên đọc theo mã lớp + instructor key;
- reflection không dùng để AI tự động chấm điểm.

Chi tiết: `docs/learning/BRAND_PASSPORT_DATA_GOVERNANCE_V1.md`.

### Chưa triển khai

- Không gọi LLM hoặc API AI bên ngoài.
- Không tạo lời khuyên sinh tự do.
- Không thay đổi score, cash, profit, event hoặc bất kỳ rule nào của engine.
- Migration Supabase mới chỉ nằm trong PR; chưa được xem là hoạt động production cho đến khi được review và áp dụng vào project đúng.
- Không có instructor dashboard trực quan hoặc cohort mode.
- Không gắn Learning Edition/Pilot Shell vào navigation production.

## 3. Kiến trúc

```text
brand-passport-learning-pilot.html (optional governed pilot shell)
  └─ brand-passport-learning.html (Learning Layer)
       └─ brand-passport.html (deterministic game)
```

Luồng kết quả:

```text
Learner decision
      ↓
Deterministic engine
      ↓
Outcome snapshot + delta
      ↓
Rule-based Coach/Critic explanation
      ↓
Learner reflection
      ↓
Decision Trace + CLO mapping
```

Learning Layer không giữ tham chiếu đến biến nội bộ `S`; nó chỉ đọc bản sao từ `window.bpTest.state()` và bọc các hàm UI công khai để ghi thời điểm trước/sau.

## 4. Audit schema

Audit cấp phiên:

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
  "records": []
}
```

Record cấp quý:

```json
{
  "record_id": "uuid",
  "round": 1,
  "decision": {
    "priority": "Thu thập thông tin",
    "budget": "Cân bằng",
    "entry_market": "Hải Lam",
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
```

Payload server opt-in bổ sung:

```json
{
  "data_governance": {
    "storage_mode": "server-opt-in",
    "consent_version": "bp-learning-consent-v1",
    "retention_days": 180,
    "right_to_delete": "deletion receipt token",
    "instructor_access": "class code + instructor key",
    "ai_scoring": false
  }
}
```

## 5. Coach–Critic V1

V1 dùng luật rõ ràng, có thể kiểm tra:

- chưa chọn ưu tiên → Coach yêu cầu xác định mục tiêu quý;
- chọn thị trường khi knowledge < 35 → Critic hỏi về bằng chứng yếu;
- cash < 2 → Critic ưu tiên rủi ro mất thanh khoản;
- đối tác địa phương → hỏi về phụ thuộc và kiểm soát thương hiệu;
- xuất khẩu trực tiếp → hỏi về vốn và năng lực vận hành;
- nền tảng số → hỏi về adaptation/chứng nhận chưa được giải quyết.

Đây là instructional prompts, không phải causal inference và không phải đáp án tối ưu.

## 6. Mapping CLO

- **CLO 1:** đánh giá thị trường khi có quyết định entry market.
- **CLO 2:** lựa chọn entry mode.
- **CLO 3:** đánh giá thông tin khi đã mua intelligence source.
- **CLO 5:** nhận diện path dependence.
- **CLO 6:** giải thích quyết định đa tiêu chí và trade-off.

Mapping này cần cố vấn học thuật duyệt trước pilot chính thức.

## 7. Bảo vệ engine

Hai trường bắt buộc:

```json
{
  "engine_outcome_source": "deterministic",
  "ai_changed_score": false
}
```

Learning Layer không gọi hàm để chỉnh score và không ghi trở lại trạng thái game. Nếu về sau dùng LLM, LLM chỉ nhận bản sao outcome và không được có quyền gọi engine mutation APIs.

## 8. Kiểm thử

`test/brand-passport-learning.test.js` kiểm tra:

- kết nối được deterministic game;
- version/schema đúng;
- Coach/Critic thay đổi theo lựa chọn;
- một quý tạo đúng một record;
- reflection, seed, team ID, snapshot, delta, CLO và timestamp đầy đủ;
- `engine_outcome_source = deterministic`;
- `ai_changed_score = false`;
- không lỗi console;
- không tràn ngang ở viewport Android.

`test/brand-passport-governance.test.js` kiểm tra:

- local-only không phát sinh request;
- thiếu consent thì submit bị chặn;
- payload không gửi tên/email/điện thoại;
- consent version và retention được khai báo;
- deletion receipt được tạo ở client;
- RPC delete dùng đúng trace ID và token;
- RLS/RPC/retention có trong migration;
- layout governance đạt ở desktop và Android.

## 9. Giới hạn V1

- Prompt chỉ dùng tiếng Việt.
- Rule-based support chưa phải adaptive model đã được kiểm định.
- Delta trước/sau bao gồm cả quyết định và biến cố, nên không được diễn giải là tác động nhân quả riêng của quyết định.
- Pilot Shell thêm một iframe ngoài để cô lập governance khỏi Learning Layer đã đạt QA; cần đánh giá lại kiến trúc trước production quy mô lớn.
- `localStorage` không phải kho nghiên cứu dài hạn.
- Server storage chỉ được bật sau review migration, consent, data controller và purge schedule.

## 10. Cổng phát hành

Trước khi đưa vào lớp học thật:

- duyệt học thuật Coach/Critic và CLO;
- duyệt wording consent VI/EN;
- xác định data controller/đầu mối hỗ trợ;
- áp dụng và kiểm tra migration trên Supabase staging;
- cấu hình purge job 180 ngày;
- kiểm tra quyền đọc theo lớp;
- kiểm tra Android thật và Safari/iOS;
- chốt policy về retention, quyền xóa và xử lý mất deletion receipt;
- không dùng reflection để AI tự động chấm điểm.
