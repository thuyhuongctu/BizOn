# Sao lưu cơ sở dữ liệu Supabase của BizOn

Gói miễn phí của Supabase không tự sao lưu. Workflow `.github/workflows/supabase-backup.yml` thay việc đó:

- **Lịch:** mỗi ngày 02:17 giờ Việt Nam. Chạy tay được bất cứ lúc nào: GitHub → **Actions** → «Supabase – sao lưu định kỳ (mã hóa)» → **Run workflow**.
- **Nội dung:** schema `public` (lược đồ + dữ liệu: khảo sát, điểm, bài nộp, hộ chiếu, lớp…) và tài khoản đăng nhập (`auth.users`, `auth.identities`), kèm bảng đếm số dòng.
- **Bảo mật:** cả gói được mã hóa AES-256 bằng gpg trước khi lưu. Kho BizOn công khai, ai có tài khoản GitHub cũng tải được artifact, nên chỉ có tệp đã mã hóa được tải lên. Không có mật khẩu thì tệp vô dụng.
- **Lưu giữ:** 90 ngày (mức tối đa của GitHub cho kho công khai). Muốn giữ lâu hơn, tải tệp về Google Drive.
- **Lưu ý:** GitHub tự tắt lịch chạy nếu kho không có commit nào trong 60 ngày. Khi đó vào Actions bấm **Enable workflow**.

## Thiết lập một lần (2 secret)

GitHub → kho **BizOn** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

### Bước 1 · `SUPABASE_DB_URL`

1. Supabase → dự án BizOn → nút **Connect** (đầu trang) → thẻ **Connection string** → chọn **Session pooler**.
   Không dùng «Direct connection»: địa chỉ đó chỉ có IPv6, máy chạy của GitHub không kết nối được.
2. Chép chuỗi dạng `postgresql://postgres.ceytblfelodpnudomccn:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`.
3. Thay `[YOUR-PASSWORD]` bằng mật khẩu cơ sở dữ liệu. Quên thì đặt lại ở **Database → Settings → Reset database password**; BizOn không dùng mật khẩu này ở đâu khác (trang web dùng khóa công khai, workflow áp migration dùng `SUPABASE_ACCESS_TOKEN`).
   Mật khẩu có ký tự đặc biệt (`@ # / : ?`…) thì đổi sang dạng mã hóa URL (`@` → `%40`, `#` → `%23`), hoặc đặt mật khẩu chỉ gồm chữ và số.
4. Tạo secret tên `SUPABASE_DB_URL`, dán cả chuỗi.

### Bước 2 · `BACKUP_PASSPHRASE`

Một câu mật khẩu dài **ít nhất 16 ký tự** (nên 25+), chỉ chị và thầy Tú biết. Lưu nó ở nơi an toàn ngoài GitHub (trình quản lý mật khẩu). **Mất mật khẩu này thì không mở được bất kỳ bản sao lưu nào.**

### Bước 3 · Chạy thử

Actions → «Supabase – sao lưu định kỳ (mã hóa)» → **Run workflow**. Khoảng 1–2 phút sau, trang kết quả có bảng số dòng từng bảng và một artifact `bizon-supabase-<ngày>`.

## Khôi phục

1. Actions → lần chạy cần dùng → tải artifact (một tệp `.zip`), giải nén ra `bizon-supabase-<ngày>.tar.gpg`.
2. Giải mã (máy có `gpg` và `pg_restore` 17; trên Windows dùng WSL hoặc Gpg4win + PostgreSQL):

   ```bash
   gpg -d bizon-supabase-<ngày>.tar.gpg | tar -x    # nhập BACKUP_PASSPHRASE khi được hỏi
   # ra 3 tệp: public.dump, auth-users.dump, so-dong.tsv
   ```

3. Khôi phục vào **một dự án Supabase mới** (hoặc nhánh thử), không đè thẳng lên dự án đang chạy khi chưa chắc chắn:

   ```bash
   export DB='<chuỗi Session pooler của dự án đích>'
   pg_restore --no-owner --no-privileges -d "$DB" public.dump          # báo «schema "public" already exists» là bình thường
   pg_restore --data-only --no-owner -d "$DB" auth-users.dump           # tài khoản đăng nhập
   ```

4. Đối chiếu số dòng với `so-dong.tsv`.

Để lấy lại vài dòng bị xóa nhầm, khôi phục vào dự án thử rồi chép đúng các dòng cần sang dự án chính bằng SQL, thay vì khôi phục đè cả cơ sở dữ liệu.

Script dùng chung: `scripts/supabase-backup.sh` (chạy được trên máy với cùng hai biến môi trường).
