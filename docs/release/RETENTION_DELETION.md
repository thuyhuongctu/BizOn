# BizOn — Retention & Deletion theo từng bảng Supabase

**Dự án production:** `ceytblfelodpnudomccn` · **Ngày soạn:** 24/09/2026
**Cơ sở:** rà 15 migration trong `supabase/migrations/` (bản `main`).
**Hiện trạng quan trọng:** repo **CHƯA có purge tự động** (không dùng `pg_cron`).
Con số "90 ngày" ở `client_errors` chỉ là **câu lệnh mẫu trong chú thích**; cột
`retention_until` ở `bp_learning_traces` có sẵn nhưng **không có job nào xoá**.
⇒ Cần thiết lập automation (Mục C) hoặc quy trình xoá định kỳ thủ công trước khi
rời internal testing.

---

## A. Bảng chứa dữ liệu người dùng

| Bảng | Nội dung / độ nhạy | Truy cập | Retention đề xuất | Xoá theo yêu cầu |
|---|---|---|---|---|
| `round_submissions` | Kết quả vòng game lớp học. **Có cột `student_email` (PII, tùy chọn)**, `team_name`, `result_json`. | anon INSERT-only; đọc qua RPC khóa GV | **12 tháng** kể từ `created_at` (một năm học); rút còn 6 tháng nếu chỉ cần chấm điểm học kỳ | Theo `class_code` (GV yêu cầu) hoặc theo `student_email` (chủ thể dữ liệu yêu cầu) |
| `bp_results` | Kết quả Brand Passport. `player_name` (tùy chọn), điểm, `detail_json`. Bí danh trừ khi người chơi tự nhập tên thật. | anon INSERT-only | **12 tháng** | Theo `class_code` (+ `player_name` nếu cần) |
| `ft_results` | Kết quả Bến Phù Sa. `player_name` (tùy chọn), `team_name`, `detail_json`. | anon INSERT-only | **12 tháng** | Theo `class_code` (+ `player_name`) |
| `survey_responses` | Khảo sát trước/sau. **Ẩn danh** (`student_code` tự đặt), có **văn bản tự do** `open_like`/`open_improve` (có thể lộ thông tin cá nhân nếu người dùng tự viết). | anon INSERT-only | **24 tháng** (dữ liệu nghiên cứu) — hoặc theo đề cương nghiên cứu đã duyệt | Theo `class_code` + `student_code` |
| `team_saves` | Lưu tiến trình đội (cross-device): `class_code`, `team_name`, `state_json`, `save_token_hash`. Dữ liệu tạm. | anon qua RPC `get/upsert_team_save` (+ token) | **90 ngày** kể từ `updated_at` (tiến trình học kỳ; quá hạn coi như bỏ) | Ghi đè bằng token; hoặc xoá thủ công theo (`class_code`,`team_name`) |
| `client_errors` | Nhật ký lỗi/chẩn đoán: `message`, `stack`, **`user_agent`**, `viewport`. Không PII trực tiếp. | anon INSERT-only (write-only) | **90 ngày** kể từ `created_at` (đúng ý định sẵn có) | Không có định danh người dùng → xoá theo tuổi; nếu cần, xoá theo `page`+`client_ts` |
| `bp_learning_traces` | Vết học tập (Pilot). Đã có `retention_until` (mặc định 180 ngày) + token xoá `bizon_delete_learning_trace`. **Đang TẮT.** | anon qua RPC (submit/delete) | **180 ngày** (giữ như thiết kế) | RPC `bizon_delete_learning_trace` bằng biên nhận; khi bật phải có purge tự động |

## B. Bảng vận hành (không phải dữ liệu người dùng — không cần retention theo chủ thể)

| Bảng | Nội dung | Ghi chú |
|---|---|---|
| `app_secrets` | Hash khóa giảng viên (bí mật vận hành) | Không phải PII; giữ theo vòng đời khóa; xoay khóa khi cần |
| `key_check_attempts` | 1 dòng đếm lần thử sai + `locked_until` (chống dò khóa) | Không phải PII; không cần retention theo chủ thể |
| Supabase **Auth** (`auth.users`) qua `student_auth` | Email + mật khẩu sinh viên | **ĐANG TẮT cho bản đầu.** Nếu bật lại: bắt buộc có quy trình **xoá tài khoản** (email + phiên) và tuyên bố trong Data Safety |

---

## C. Thiết lập purge tự động (khuyến nghị — chạy 1 lần trong SQL Editor)

Bật `pg_cron` rồi tạo hàm purge; chạy hằng ngày. (Chỉnh cửa sổ theo Mục A.)

```sql
create extension if not exists pg_cron;

create or replace function bizon_purge_expired()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from round_submissions where created_at < now() - interval '12 months';
  delete from bp_results        where created_at < now() - interval '12 months';
  delete from ft_results        where created_at < now() - interval '12 months';
  delete from survey_responses  where created_at < now() - interval '24 months';
  delete from team_saves        where updated_at < now() - interval '90 days';
  delete from client_errors     where created_at < now() - interval '90 days';
  delete from bp_learning_traces where retention_until < now();
end; $$;

-- 03:15 UTC mỗi ngày
select cron.schedule('bizon-purge-daily', '15 3 * * *', $$ select bizon_purge_expired(); $$);
```

> Nếu không muốn dùng pg_cron: chạy `select bizon_purge_expired();` thủ công theo
> lịch (vd cuối mỗi tháng) và ghi lại ngày chạy.

## D. Xử lý yêu cầu xoá của người dùng (đầu mối: patu@ctu.edu.vn · thuyhuongctu@gmail.com)

Ví dụ câu lệnh (chạy trong SQL Editor sau khi xác minh yêu cầu):

```sql
-- Theo email chủ thể dữ liệu (chỉ round_submissions có cột email)
delete from round_submissions where student_email = :email;

-- Theo lớp (giảng viên yêu cầu xoá dữ liệu một lớp)
delete from round_submissions where class_code = :class_code;
delete from bp_results        where class_code = :class_code;
delete from ft_results        where class_code = :class_code;
delete from survey_responses  where class_code = :class_code;
delete from team_saves        where class_code = :class_code;

-- Theo bí danh/tên tự nhập
delete from bp_results where class_code = :class_code and player_name = :name;
delete from ft_results where class_code = :class_code and player_name = :name;
```

- Ghi nhật ký mỗi lần xoá (ngày, người xử lý, phạm vi) để làm bằng chứng tuân thủ.
- `client_errors` không có định danh người dùng → không xoá theo cá nhân được; nêu rõ
  điều này trong phản hồi yêu cầu (dữ liệu ẩn danh, tự hết hạn sau 90 ngày).

## E. Khớp với Play Data Safety & Privacy Policy
- Data Safety "người dùng có thể yêu cầu xoá": **Có** — qua đầu mối email + các lệnh Mục D.
- Cập nhật Privacy Policy §7 nêu rõ cửa sổ retention (Mục A) và đầu mối/cách yêu cầu xoá.
- Trước khi rời internal testing: **áp Mục C** (hoặc lịch thủ công) và ghi người chịu
  trách nhiệm (data controller) + ngày duyệt.
