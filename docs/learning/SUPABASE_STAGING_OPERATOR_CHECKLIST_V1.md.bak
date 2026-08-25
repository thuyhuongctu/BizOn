# BizOn Supabase Staging — Operator Checklist V1

Checklist này dành cho người sở hữu repository và Supabase account. Mục tiêu là tạo một project staging độc lập, cấu hình GitHub Environment và chạy smoke test mà không chạm production hoặc dữ liệu lớp học thật.

## A. Tạo project Supabase staging

- [ ] Tạo project mới, tên gợi ý: `bizon-staging`.
- [ ] Chọn region Singapore.
- [ ] Dùng database password riêng, không trùng production.
- [ ] Xác nhận project ref staging khác `ceytblfelodpnudomccn`.
- [ ] Không import dữ liệu production hoặc dữ liệu sinh viên.
- [ ] Không dùng khóa giảng viên production.
- [ ] Ghi project ref staging vào hồ sơ nội bộ, không dán vào ảnh chụp công khai.

## B. Chuẩn bị schema nền

- [ ] Áp các migration nền cần thiết để có `public.bizon_check_key(text)`.
- [ ] Thay khóa giảng viên mặc định bằng khóa staging riêng.
- [ ] Kiểm tra hàm tồn tại:

```sql
select to_regprocedure('public.bizon_check_key(text)');
```

Kết quả phải khác `null`.

## C. Tạo GitHub Environment bảo vệ

Trong repository:

```text
Settings → Environments → New environment → supabase-staging
```

- [ ] Tên environment chính xác là `supabase-staging`.
- [ ] Có ít nhất một required reviewer.
- [ ] Không cho branch không liên quan tự động truy cập environment.
- [ ] Không đặt staging database password ở repository-level secret khi có thể đặt trong environment.

## D. Khai báo variables

Trong environment `supabase-staging`, tạo:

```text
SUPABASE_STAGING_PROJECT_REF
SUPABASE_STAGING_URL
```

- [ ] `SUPABASE_STAGING_PROJECT_REF` là ref staging, không phải production.
- [ ] `SUPABASE_STAGING_URL` có dạng `https://<ref>.supabase.co`.
- [ ] Hostname trong URL khớp chính xác project ref.

## E. Khai báo secrets

Tạo các environment secrets:

```text
SUPABASE_STAGING_DATABASE_URL
SUPABASE_STAGING_ANON_KEY
SUPABASE_STAGING_INSTRUCTOR_KEY
```

- [ ] Database URL thuộc đúng project staging.
- [ ] Chỉ dùng anon/publishable key cho REST test.
- [ ] Không tạo hoặc lưu `service_role` key trong GitHub workflow.
- [ ] Instructor key staging đủ dài và không trùng production.
- [ ] Không dán secrets vào PR, issue, commit, log hoặc screenshot.

## F. Chạy lần đầu

Mở:

```text
Actions → BizOn Supabase Staging Gate → Run workflow
```

Nhập:

```text
confirm_project_ref = <project ref staging>
apply_migration = true
run_retention_purge = true
```

- [ ] Reviewer phê duyệt đúng environment.
- [ ] Xác nhận project ref thêm một lần trước khi chạy.
- [ ] Workflow không báo project production bị chặn.
- [ ] Migration chuẩn được áp dụng thành công.
- [ ] Artifact `bizon-supabase-staging-report` được tạo.
- [ ] Report không chứa secrets.

## G. Chạy xác minh lại

Chạy lần hai:

```text
apply_migration = false
run_retention_purge = true
```

- [ ] Schema tồn tại mà không cần áp lại migration.
- [ ] RLS bật.
- [ ] Anonymous không có quyền bảng trực tiếp.
- [ ] Sai khóa và sai mã lớp không trả dữ liệu.
- [ ] Consent sai và `ai_scoring=true` bị từ chối.
- [ ] Token xóa đúng xóa vật lý fixture.
- [ ] Purge xóa fixture hết hạn.
- [ ] Tất cả fixture được cleanup.

## H. Go/No-Go

Chỉ chuyển PR khỏi Draft khi:

- [ ] Remote staging gate đạt trên project staging độc lập.
- [ ] Consent VI/EN đã duyệt.
- [ ] Data controller và người vận hành đã xác định.
- [ ] Lịch purge 180 ngày đã được phê duyệt.
- [ ] Android vật lý và Safari/iOS đã kiểm thử.
- [ ] Không dùng dữ liệu định danh trực tiếp.

Giữ **No-Go** khi bất kỳ mục nào ở trên chưa đạt. Không thay `js/backend-config.js` production bằng thông tin staging.
