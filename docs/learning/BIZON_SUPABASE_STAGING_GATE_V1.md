# BizOn Supabase Staging Gate V1

## 1. Mục tiêu

Cổng này dùng để kiểm tra migration, RLS, RPC, quyền xóa, retention purge và khả năng đọc dữ liệu theo phạm vi lớp trước khi BizOn thu dữ liệu lớp học thật.

Cổng **không dùng project production**, không chạy tự động từ pull request và không thay đổi dữ liệu người học. Toàn bộ bản ghi được tạo trong smoke test là dữ liệu giả lập, có mã lớp riêng và được xóa sau khi kiểm tra.

Workflow chuẩn:

```text
.github/workflows/supabase-staging-gate.yml
```

Verifier chuẩn:

```text
scripts/release/verify-supabase-staging.mjs
```

## 2. Tạo project staging riêng

Tạo một Supabase project độc lập, ví dụ:

```text
bizon-staging
```

Không sao chép dữ liệu sinh viên hoặc dữ liệu production vào project này. Project ref staging phải khác project ref đang được `js/backend-config.js` sử dụng.

Khuyến nghị:

- region Singapore;
- database password riêng;
- không dùng cùng khóa giảng viên với production;
- chỉ dùng alias nhóm giả lập;
- bật cảnh báo chi phí và giới hạn quyền truy cập dashboard.

## 3. Tạo GitHub Environment

Trong repository BizOn:

```text
Settings → Environments → New environment → supabase-staging
```

Cấu hình ít nhất một **required reviewer**. Nhờ vậy workflow staging không thể chạy chỉ bằng một lần bấm nhầm.

Không đặt secrets staging ở repository-level khi có thể đặt trong environment. Không cho branch không liên quan truy cập environment này.

## 4. Variables và secrets bắt buộc

### Environment variables

```text
SUPABASE_STAGING_PROJECT_REF
SUPABASE_STAGING_URL
```

Ví dụ URL:

```text
https://<staging-project-ref>.supabase.co
```

### Environment secrets

```text
SUPABASE_STAGING_DATABASE_URL
SUPABASE_STAGING_ANON_KEY
SUPABASE_STAGING_INSTRUCTOR_KEY
```

`SUPABASE_STAGING_DATABASE_URL` có thể là direct connection hoặc transaction pooler URL. Host hoặc database username phải chứa đúng staging project ref để verifier xác minh môi trường.

Workflow **không chứa service_role key**. Retention purge được kiểm tra qua kết nối database quản trị trong runner được bảo vệ, không đưa đặc quyền quản trị vào browser hoặc artifact.

## 5. Chuẩn bị schema nền

Trước khi chạy Learning Trace migration, staging phải có:

```sql
public.bizon_check_key(text)
```

Hàm này phải kiểm tra `SUPABASE_STAGING_INSTRUCTOR_KEY` tương ứng với khóa lưu trong staging. Không dùng khóa mặc định và không dùng khóa production.

Migration chuẩn duy nhất cho Learning Trace V1:

```text
supabase/migrations/20260802000000_bp_learning_traces.sql
```

## 6. Chạy workflow

Mở:

```text
Actions → BizOn Supabase Staging Gate → Run workflow
```

Nhập chính xác project ref staging vào `confirm_project_ref`.

Lần kiểm tra schema đã tồn tại:

```text
APPLY_MIGRATION=false
RUN_RETENTION_PURGE=true
```

Lần đầu áp migration lên staging:

```text
APPLY_MIGRATION=true
RUN_RETENTION_PURGE=true
```

Chỉ chọn `APPLY_MIGRATION=true` sau khi đã kiểm tra project ref, environment approval và backup cần thiết. Workflow sẽ dừng trước khi kết nối nếu project ref hoặc URL trùng production.

## 7. Ma trận kiểm thử tự động

Workflow xác nhận:

1. Operator nhập đúng staging project ref.
2. REST URL và database endpoint cùng thuộc staging project.
3. Project production hiện tại bị chặn.
4. `public.bizon_check_key(text)` tồn tại.
5. `public.bp_learning_traces` tồn tại và bật RLS.
6. Đủ bốn RPC quản trị:
   - `bizon_submit_learning_trace`;
   - `bizon_delete_learning_trace`;
   - `bizon_bp_learning_traces`;
   - `bizon_purge_expired_learning_traces`.
7. Không có schema cạnh tranh `bp_learning_sessions`, `bp_learning_records`, `bp_learning_deletion_requests`.
8. `anon` không có quyền trực tiếp SELECT/INSERT/UPDATE/DELETE bảng.
9. REST anonymous không đọc trực tiếp bảng.
10. Submit có consent tạo biên nhận và retention khoảng 180 ngày.
11. Deletion token chỉ được lưu dưới dạng SHA-256.
12. Khóa sai và mã lớp sai không trả dữ liệu.
13. Khóa đúng chỉ trả fixture đúng lớp.
14. `ai_scoring=true` bị từ chối.
15. Consent version sai bị từ chối.
16. Token xóa sai không xóa dữ liệu.
17. Token đúng xóa đúng fixture.
18. Anonymous không gọi được purge.
19. Purge quản trị xóa vật lý fixture hết hạn.
20. Cleanup xóa toàn bộ fixture còn lại kể cả khi workflow thất bại giữa chừng.

## 8. Artifact và bảo mật

Workflow tải lên:

```text
bizon-supabase-staging-report
```

Report chỉ chứa:

- project ref staging;
- commit SHA;
- thời gian chạy;
- trạng thái từng test;
- mã lớp fixture;
- trạng thái migration và purge.

Report không chứa:

- database URL;
- database password;
- anon key;
- khóa giảng viên;
- deletion token;
- dữ liệu sinh viên;
- service role credential.

## 9. Tiêu chí go/no-go

### Có thể chuyển sang thử nghiệm lớp giả lập khi

- workflow staging đạt;
- migration và RPC đúng commit dự kiến;
- consent VI/EN đã duyệt;
- data controller và người vận hành được xác định;
- lịch purge 180 ngày được phê duyệt;
- không có dữ liệu định danh trực tiếp.

### Chưa được mở cho lớp học thật khi

- chưa có staging project độc lập;
- workflow chỉ mới đạt local PostgreSQL;
- chưa kiểm thử Android vật lý và Safari/iOS;
- chưa có phê duyệt governance/ethics cần thiết;
- project hoặc khóa vẫn dùng chung với production.

## 10. Quy tắc vận hành

- Không chạy workflow với project production.
- Không dán secrets vào issue, PR, log hoặc ảnh chụp.
- Không tải artifact lên nơi công khai ngoài GitHub Actions của repository.
- Không thay `js/backend-config.js` sang staging trên nhánh production.
- Không merge PR chỉ vì staging smoke test đạt; vẫn cần review học thuật, pháp lý và thiết bị thật.
