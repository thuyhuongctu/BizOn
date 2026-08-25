# Brand Passport Learning Pilot — Supabase Staging Runbook

## 1. Mục đích

Runbook này dùng để áp và xác minh **schema lưu Decision Trace có quản trị** trước khi thu dữ liệu lớp học thật.

Schema chuẩn duy nhất của V1 là:

```text
public.bp_learning_traces
```

Client `brand-passport-learning-pilot.html` chỉ gọi bốn RPC:

```text
bizon_submit_learning_trace
bizon_delete_learning_trace
bizon_bp_learning_traces
bizon_purge_expired_learning_traces
```

Không tạo thêm bảng `bp_learning_sessions`, `bp_learning_records` hoặc `bp_learning_deletion_requests` trong V1. Việc giữ một schema chuẩn giúp tránh phân mảnh consent, retention và quyền xóa.

## 2. Điều kiện chặn phát hành

Không bật đường dẫn pilot cho sinh viên thật khi chưa có đủ:

- một Supabase project được xác nhận là **staging**, tách khỏi dữ liệu production;
- người chịu trách nhiệm dữ liệu/data controller được ghi tên;
- mục đích sử dụng dữ liệu được phê duyệt;
- consent tiếng Việt và tiếng Anh được duyệt;
- thời hạn lưu 180 ngày được duyệt;
- khóa giảng viên đã thay khỏi giá trị mặc định;
- bằng chứng kiểm thử submit, read isolation, delete và purge;
- phương án xử lý sự cố và đầu mối liên hệ.

Khóa `service_role` không được đưa vào GitHub, JavaScript, ảnh chụp hoặc tài liệu chia sẻ cho người học.

## 3. Tệp migration chuẩn

Chỉ áp migration sau cho Learning Trace V1:

```text
supabase/migrations/20260802000000_bp_learning_traces.sql
```

Migration yêu cầu hàm sau đã tồn tại từ backend giảng viên:

```sql
public.bizon_check_key(text)
```

Trước khi chạy, kiểm tra:

```sql
select to_regprocedure('public.bizon_check_key(text)');
```

Kết quả phải khác `null`.

## 4. Áp migration trên staging

### Cách A — Supabase SQL Editor

1. Mở đúng project staging.
2. Mở **SQL Editor** và tạo query mới.
3. Dán toàn bộ nội dung `20260802000000_bp_learning_traces.sql`.
4. Chạy query.
5. Lưu ảnh hoặc export kết quả thực thi vào hồ sơ QA; không để lộ khóa bí mật.

### Cách B — quy trình migration đã liên kết của dự án

Chỉ dùng khi repo đã liên kết đúng với project staging và người thực hiện đã xác minh project ref. Không đẩy migration vào project production từ nhánh thử nghiệm.

## 5. Kiểm tra cấu trúc sau migration

Chạy trên SQL Editor staging:

```sql
select to_regclass('public.bp_learning_traces') as trace_table;

select relrowsecurity
from pg_class
where oid = 'public.bp_learning_traces'::regclass;

select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'bizon_submit_learning_trace',
    'bizon_delete_learning_trace',
    'bizon_bp_learning_traces',
    'bizon_purge_expired_learning_traces'
  )
order by proname;
```

Tiêu chí đạt:

- `trace_table` tồn tại;
- `relrowsecurity = true`;
- đủ bốn RPC;
- không có bảng cạnh tranh `bp_learning_sessions`, `bp_learning_records`, `bp_learning_deletion_requests`.

Kiểm tra quyền trực tiếp của anonymous client:

```sql
select
  has_table_privilege('anon', 'public.bp_learning_traces', 'SELECT') as can_select,
  has_table_privilege('anon', 'public.bp_learning_traces', 'INSERT') as can_insert,
  has_table_privilege('anon', 'public.bp_learning_traces', 'UPDATE') as can_update,
  has_table_privilege('anon', 'public.bp_learning_traces', 'DELETE') as can_delete;
```

Cả bốn giá trị phải là `false`. Anonymous client chỉ thao tác qua RPC `SECURITY DEFINER` đã giới hạn.

## 6. Ma trận smoke test staging

### STG-01 — Local-only mặc định

1. Mở `brand-passport-learning-pilot.html`.
2. Không đánh dấu consent.
3. Chơi và hoàn tất ít nhất một quý.
4. Quan sát Network trong trình duyệt.

Đạt khi không có request tới:

```text
/rest/v1/rpc/bizon_submit_learning_trace
```

### STG-02 — Chặn gửi khi chưa consent

1. Nhập mã lớp hợp lệ.
2. Không đánh dấu consent.
3. Bấm gửi.

Đạt khi UI báo cần đồng ý tự nguyện và server không nhận bản ghi.

### STG-03 — Submit có consent

1. Dùng mã lớp staging, ví dụ `BP_STAGING_01`.
2. Dùng bí danh nhóm, không dùng họ tên hoặc email.
3. Đánh dấu consent và gửi.
4. Tải biên nhận xóa.

Đạt khi:

- server trả `trace_id`, `retention_until`, `stored_at`;
- `retention_until` xấp xỉ 180 ngày;
- payload có `data_governance.ai_scoring = false`;
- bản ghi có 1–6 records;
- biên nhận giữ deletion token ở phía người học.

### STG-04 — Token không lưu dạng rõ

```sql
select
  id,
  char_length(delete_token_hash) as hash_length,
  delete_token_hash ~ '^[0-9a-f]{64}$' as valid_sha256
from public.bp_learning_traces
where class_code = 'BP_STAGING_01';
```

Đạt khi `hash_length = 64` và `valid_sha256 = true`. Không sao chép deletion token từ biên nhận vào SQL hoặc log.

### STG-05 — Cách ly dữ liệu lớp

Gọi RPC giảng viên với:

- khóa sai;
- khóa đúng nhưng mã lớp khác;
- khóa đúng và mã lớp đúng.

Đạt khi hai trường hợp đầu trả 0 dòng, trường hợp cuối chỉ trả dữ liệu đúng lớp.

### STG-06 — Quyền xóa

1. Dùng sai deletion token: bản ghi phải còn.
2. Dùng token đúng trong biên nhận: RPC trả `true`.
3. Kiểm tra lại Table Editor/SQL: bản ghi đã bị xóa vật lý.

### STG-07 — Retention purge

Tạo một bản ghi thử nghiệm riêng. Trên staging, quản trị viên đặt `retention_until` về quá khứ rồi gọi:

```sql
select public.bizon_purge_expired_learning_traces();
```

Đạt khi hàm trả số dòng đã xóa và bản ghi hết hạn không còn tồn tại. RPC purge chỉ dành cho `service_role`/quản trị viên, không gọi từ browser.

### STG-08 — Ràng buộc phương pháp

Server phải từ chối:

- consent version không hợp lệ;
- `ai_scoring = true`;
- class code sai định dạng;
- trace không có records;
- nhiều hơn 6 records;
- payload vượt giới hạn 250 KB;
- deletion token quá ngắn.

## 7. Bằng chứng cần lưu

Lưu trong hồ sơ nội bộ, không commit khóa hoặc dữ liệu sinh viên:

- ngày và người áp migration;
- project staging được sử dụng;
- commit SHA/PR;
- ảnh kết quả migration;
- kết quả STG-01 đến STG-08;
- một biên nhận xóa giả lập đã che token;
- bằng chứng purge;
- quyết định go/no-go;
- ngày dự kiến xóa toàn bộ dữ liệu pilot.

## 8. Rollback staging

Chỉ thực hiện trên staging sau khi đã export bằng chứng cần thiết. Thứ tự:

```sql
drop function if exists public.bizon_purge_expired_learning_traces();
drop function if exists public.bizon_bp_learning_traces(text, text);
drop function if exists public.bizon_delete_learning_trace(uuid, text);
drop function if exists public.bizon_submit_learning_trace(
  uuid, text, text, text, text, text, text, text,
  timestamptz, jsonb, text, timestamptz
);
drop table if exists public.bp_learning_traces;
```

Không chạy rollback trên môi trường có dữ liệu thật khi chưa có phê duyệt và bản sao lưu.

## 9. Quyết định phát hành

Chỉ chuyển PR khỏi Draft khi:

- CI PostgreSQL thực thi migration thành công;
- toàn bộ STG-01 đến STG-08 đạt trên project staging;
- consent và governance được duyệt;
- Android thật và Safari/iOS đạt;
- đã xác định rõ data controller, người vận hành và lịch purge;
- chưa có dữ liệu định danh trực tiếp trong payload.
