# Cấu hình SMTP riêng cho Supabase Auth (để cả lớp đăng ký cùng lúc)

**Vì sao cần:** dịch vụ gửi email mặc định của Supabase chỉ gửi vài email mỗi giờ. Khi cả lớp bấm «Đăng ký» cùng lúc, đa số sinh viên không nhận được email xác nhận, nên không đăng nhập được. Lỗi này đã xảy ra ngày 09/10/2026 (xem ghi chú trong `game.html`). Từ bản bảo mật bước 2, sinh viên phải đăng nhập mới nộp được điểm, nên phải có SMTP riêng.

Tên mục trong dashboard Supabase có thể đổi nhẹ theo phiên bản. Hướng dẫn dưới đây theo bố cục cuối năm 2026.

## Cách nhanh: Gmail + mật khẩu ứng dụng (khoảng 500 email/ngày)

1. **Tạo mật khẩu ứng dụng Gmail.**
   - Dùng một tài khoản Gmail riêng cho BizOn, ví dụ `bizonland.noreply@gmail.com`.
   - Bật **Xác minh 2 bước**: Tài khoản Google → Bảo mật.
   - Vào **Mật khẩu ứng dụng**, tạo mật khẩu mới tên «Supabase BizOn», rồi chép lại 16 ký tự.
2. **Nhập SMTP vào Supabase.** Vào dự án BizOn → **Authentication → Emails → SMTP Settings**, bật **Enable custom SMTP** rồi điền:
   - Sender email: địa chỉ Gmail ở bước 1
   - Sender name: `BizOn`
   - Host: `smtp.gmail.com`
   - Port: `465`
   - Username: địa chỉ Gmail ở bước 1
   - Password: mật khẩu ứng dụng 16 ký tự (không phải mật khẩu Gmail)
3. **Nâng giới hạn gửi.** Vào **Authentication → Rate Limits**, đặt «Rate limit for sending emails» khoảng **100 email/giờ**. Mục này chỉ sửa được sau khi đã bật SMTP riêng.
4. **Kiểm tra địa chỉ trả về.**
   - Vào **Authentication → URL Configuration**.
   - **Site URL** phải là `https://bizonland.com`.
   - Thêm `https://bizonland.com/**` vào Redirect URLs, để link trong email xác nhận đưa về đúng trang.
5. **Thử:**
   - Đăng ký bằng một email `@student.ctu.edu.vn` thật.
   - Kiểm tra hộp thư, kể cả mục Spam.
   - Bấm link xác nhận, rồi đăng nhập lại trong game.

## Cách bền hơn: Resend hoặc SendGrid với tên miền bizonland.com

Email gửi từ `no-reply@bizonland.com` ít bị coi là spam hơn Gmail. Đổi lại phải thêm bản ghi DNS (SPF, DKIM) cho `bizonland.com`. Resend miễn phí 3.000 email/tháng.

1. Tạo tài khoản Resend → **Domains → Add domain** `bizonland.com`, rồi thêm các bản ghi DNS Resend đưa ra.
2. Tạo API key. Trong Supabase SMTP Settings điền:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: API key vừa tạo
   - Sender email: `no-reply@bizonland.com`

## Sau khi xong

Báo lại cho Claude. Các bước tiếp theo:

1. Áp `supabase/migrations/20261023000000_require_student_login.sql`. Migration này chỉ thêm, không làm gãy trang đang chạy.
2. Gộp PR sửa các game. Từ lúc này sinh viên đăng nhập để nộp điểm.
3. Áp `supabase/migrations/20261023010000_revoke_anon_writes.sql` để đóng hẳn đường ghi ẩn danh.

## Thêm trường đối tác (ví dụ bản Indonesia của Hộ Chiếu Mini)

Mặc định chỉ email `@student.ctu.edu.vn` được nộp bài. Sau khi áp migration A, có thể thêm tên miền email sinh viên của trường đối tác:

1. Vào **SQL Editor** của dự án Supabase.
2. Chạy lệnh dưới, thay tên miền bằng phần đứng sau `@` trong email sinh viên đối tác:

```sql
insert into public.student_email_domains (domain, note)
values ('student.truong-doi-tac.ac.id', 'Đối tác Indonesia');
```

3. Muốn gỡ một tên miền: `delete from public.student_email_domains where domain = '...';`

Trang đăng nhập tự đọc danh sách này. Không cần sửa code, cũng không cần gộp PR mới.
