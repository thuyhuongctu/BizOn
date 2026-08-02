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
- Pilot Gateway `brand-passport-learning-pilot.html` với local-only mặc định.
- Opt-in gửi dữ liệu, deletion receipt và retention 180 ngày.
- PostgreSQL contract test thực thi migration thật trong CI.

### Chưa triển khai production

- Không gọi LLM hoặc API AI bên ngoài.
- Không tạo lời khuyên sinh tự do.
- Không thay đổi score, cash, profit, event hoặc bất kỳ rule nào của engine.
- Chưa áp migration trên Supabase staging thật.
- Chưa gắn Learning Edition/Pilot Gateway vào navigation production.
- Chưa có instructor dashboard cho Decision Trace.
- Chưa có competitive cohort mode.

## 3. Kiến trúc

```text
brand-passport.html
  deterministic game engine
        ↓ read-only state
brand-passport-learning.html
  Coach · Critic · Reflection · Decision Trace
        ↓ optional opt-in
brand-passport-learning-pilot.html
  consent · receipt · deletion · retention
        ↓ governed RPC
public.bp_learning_traces
```

Learning Layer đọc trạng thái qua:

```text
window.bpTest.state()
```

và bọc các hàm UI công khai để chụp snapshot trước/sau. Không có dòng mã nào trong Learning Layer sửa trực tiếp biến engine nội bộ.

## 4. Audit schema

Audit package cấp session:

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

Mỗi record cấp quý lưu:

```text
record_id
round
Decision
Coach prompt
Critic question
Student reflection
Outcome before engine
Outcome after engine
Outcome delta
Consequence
Explanation
Learning outcomes/CLO
engine_outcome_source = deterministic
ai_changed_score = false
audit timestamp
```

Outcome delta chỉ ghi nhận sự thay đổi giữa hai snapshot. Nó không tự động chứng minh quan hệ nhân quả.

## 5. Coach–Critic V1

V1 dùng luật rõ ràng, có thể kiểm tra:

- chưa chọn ưu tiên → Coach yêu cầu xác định mục tiêu quý;
- chọn thị trường khi knowledge < 35 → Critic hỏi về bằng chứng yếu;
- cash < 2 → Critic ưu tiên rủi ro mất thanh khoản;
- đối tác địa phương → hỏi về phụ thuộc và kiểm soát thương hiệu;
- xuất khẩu trực tiếp → hỏi về vốn và năng lực vận hành;
- nền tảng số → hỏi về adaptation/chứng nhận chưa được giải quyết.

Đây là instructional prompts, không phải causal inference và không phải đáp án tối ưu.

## 6. Mapping CLO V1

| Quyết định | Learning outcome gợi ý |
|---|---|
| Ưu tiên chiến lược | BP-1, BP-4 |
| Thu thập thông tin | BP-1, BP-2 |
| Chọn thị trường | BP-2, BP-3 |
| Chọn entry mode | BP-3, BP-4 |
| Mức vận hành | BP-4, BP-5 |
| Ứng phó biến cố | BP-4, BP-5, BP-6 |
| Reflection | BP-6 |

Mapping này cần cố vấn học thuật duyệt trước pilot chính thức. V1 không dùng mapping CLO để tự động cho điểm.

## 7. Data Governance

Governance chi tiết nằm tại:

```text
docs/learning/BRAND_PASSPORT_DATA_GOVERNANCE_V1.md
docs/learning/BRAND_PASSPORT_SUPABASE_STAGING_RUNBOOK.md
```

Schema server canonical duy nhất:

```text
public.bp_learning_traces
```

Migration:

```text
supabase/migrations/20260802000000_bp_learning_traces.sql
```

Anonymous client không có quyền trực tiếp trên bảng; submit/delete/read-for-instructor chỉ đi qua RPC đã giới hạn. Purge chỉ dành cho `service_role`/quản trị viên.

## 8. Kiểm thử

### Browser integration

```text
test/brand-passport-learning.test.js
test/brand-passport-governance.test.js
```

Kiểm tra:

- Learning Layer kết nối deterministic game;
- một quý tạo đúng một record;
- Coach/Critic thay đổi theo trạng thái;
- reflection và CLO được lưu;
- không lỗi JavaScript;
- không tràn ngang mobile;
- local-only không gửi request;
- chưa consent không gửi;
- receipt và deletion flow đúng cấu trúc.

### PostgreSQL contract

```text
test/sql/bp_learning_bootstrap.sql
test/sql/bp_learning_smoke.sql
.github/workflows/brand-passport-supabase-sql.yml
```

Migration được thực thi trên PostgreSQL 16, không chỉ kiểm tra bằng biểu thức văn bản. Smoke test xác minh:

- RLS và không có direct table privilege cho anon;
- RPC execute grants;
- consent không hợp lệ bị từ chối;
- `ai_scoring=true` bị từ chối;
- instructor key và class scope;
- token sai không xóa;
- token đúng xóa được;
- retention purge xóa dữ liệu hết hạn;
- không có migration version trùng hoặc schema cạnh tranh.

CI PostgreSQL không thay thế kiểm thử trên Supabase staging thật.

## 9. Giới hạn V1

- Prompt hiện ưu tiên tiếng Việt.
- Rule-based support chưa phải adaptive model đã được kiểm định.
- Delta trước/sau bao gồm cả quyết định và biến cố, nên không được diễn giải là tác động nhân quả riêng của quyết định.
- Pilot Gateway thêm một iframe ngoài để cô lập governance khỏi Learning Layer đã đạt QA; cần đánh giá lại kiến trúc trước production quy mô lớn.
- `localStorage` không phải kho nghiên cứu dài hạn.
- Server storage chỉ được bật sau review migration, consent, data controller và purge schedule.

## 10. Cổng phát hành

PR phải tiếp tục ở trạng thái Draft cho đến khi:

- Coach/Critic và mapping CLO được duyệt;
- consent VI/EN được duyệt;
- xác định data controller và đầu mối vận hành;
- migration được áp trên Supabase staging;
- STG-01 đến STG-08 đạt;
- Android thật và Safari/iOS đạt;
- có quyết định go/no-go rõ ràng.

Không thu dữ liệu sinh viên thật chỉ dựa trên việc CI đã đạt.
