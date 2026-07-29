# Hướng dẫn bật backend Supabase cho BizOn Pilot (≈10 phút)

Backend "mỏng" của BizOn: **engine mô phỏng vẫn chạy trên máy sinh viên**
(giữ nguyên chơi offline, chi phí 0), server chỉ **nhận kết quả nộp** mỗi lần
đội khóa vòng — kèm mã băm SHA-256 để đối chiếu, phục vụ chấm điểm và
nghiên cứu. Khi chưa bật, game hoạt động y hệt hiện tại.

## Bước 1 — Tạo project Supabase (miễn phí)

1. Mở https://supabase.com → **Start your project** → đăng nhập bằng GitHub
   (dùng chính tài khoản `thuyhuongctu`).
2. **New project**: đặt tên `bizon-pilot`, chọn region **Southeast Asia
   (Singapore)**, tạo mật khẩu database (lưu lại, ít dùng đến).
3. Chờ ~2 phút để project khởi tạo.

## Bước 2 — Tạo bảng dữ liệu

1. Trong dashboard, mở **SQL Editor** → **New query**.
2. Dán toàn bộ nội dung tệp `supabase/migrations/20260729000000_bizon_pilot.sql`
   (trong repo BizOn) → bấm **Run**.
3. Làm tương tự với tệp `supabase/migrations/20260729120000_client_errors.sql`
   (bảng giám sát lỗi tự động — trang web tự báo lỗi JavaScript về đây
   để nhóm phát triển sửa sớm, sinh viên không cần báo cáo thủ công).
4. Thấy `Success` là xong — sang **Table Editor** sẽ thấy 2 bảng
   `round_submissions` và `client_errors`.

## Bước 3 — Lấy khóa kết nối

1. Vào **Settings → API**.
2. Chép 2 giá trị:
   - **Project URL** — dạng `https://abcdefgh.supabase.co`
   - **anon public** key — chuỗi dài bắt đầu bằng `eyJ...`

⚠️ Chỉ dùng khóa **anon public** (khóa công khai theo thiết kế của Supabase,
nhúng vào web được). **Tuyệt đối không** dùng khóa `service_role`.

## Bước 4 — Bật trong game

1. Mở tệp `js/backend-config.js` trong repo, điền:

```js
window.BIZON_BACKEND = {
  enabled: true,
  url: 'https://abcdefgh.supabase.co',   // Project URL của cô
  anonKey: 'eyJ...',                      // anon public key
};
```

2. Commit và đẩy lên như thường lệ (nhờ Claude làm hoặc sửa trực tiếp trên
   GitHub web → Edit file → Commit changes vào nhánh main).

## Bước 5 — Kiểm tra

1. Mở game, đăng nhập có nhập **Mã lớp** (ví dụ `QTKD-K18`), chơi 1 vòng
   và khóa quyết định.
2. Vào Supabase **Table Editor → round_submissions**: thấy 1 dòng mới với
   đúng mã lớp, tên đội, kết quả vòng.
3. Mất mạng giữa chừng cũng không sao — kết quả xếp hàng trên máy và tự
   gửi lại khi có mạng.

## Dùng khi chấm điểm

- **Table Editor** → lọc theo `class_code` → **Export CSV**, hoặc chạy SQL:

```sql
select distinct on (class_code, team_name, round_number)
  class_code, team_name, round_number,
  result_json->>'share'      as thi_phan,
  result_json->>'netProfit'  as loi_nhuan,
  result_json->>'balance'    as ket_sat,
  result_hash, created_at
from round_submissions
order by class_code, team_name, round_number, created_at desc;
```

(Lấy dòng nộp **mới nhất** của mỗi đội/vòng — đội chơi lại sẽ có nhiều dòng.)

- Sinh viên **không đọc được** dữ liệu của nhau: khóa anon chỉ được phép
  ghi (RLS), việc xem/xuất chỉ làm được khi đăng nhập dashboard chủ project.

---
© 2026 Đỗ Thùy Hương & Phan Anh Tú — BizOn Bật Nghiệp
