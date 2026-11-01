#!/usr/bin/env bash
# Sao lưu cơ sở dữ liệu Supabase của BizOn thành MỘT tệp đã mã hóa (AES-256, gpg).
# Chạy bởi .github/workflows/supabase-backup.yml; cũng chạy được trên máy (xem docs/sao-luu-supabase.md).
#
# Đầu vào (biến môi trường, KHÔNG truyền qua tham số dòng lệnh để không lộ trong danh sách tiến trình):
#   SUPABASE_DB_PASSWORD  mật khẩu cơ sở dữ liệu (cách dễ nhất: chỉ dán mật khẩu, script tự ghép chuỗi kết nối
#                         Session pooler từ SUPABASE_PROJECT_REF và SUPABASE_POOLER_HOST); có thì được ưu tiên
#   SUPABASE_DB_URL       hoặc cả chuỗi kết nối Postgres (Supabase → Connect → Session pooler, đã điền mật khẩu)
#   BACKUP_PASSPHRASE   mật khẩu mã hóa tệp sao lưu (ít nhất 16 ký tự)
#   OUT_DIR             thư mục ghi tệp (mặc định ./backup-out)
#   PG_BIN              thư mục chứa pg_dump/psql (mặc định lấy theo PATH)
#
# Kết quả: $OUT_DIR/bizon-supabase-<UTC ngày giờ>.tar.gpg gồm
#   public.dump      lược đồ + dữ liệu schema public (pg_dump -Fc, khôi phục bằng pg_restore)
#   auth-users.dump  dữ liệu tài khoản đăng nhập (auth.users, auth.identities), chỉ dữ liệu
#   so-dong.tsv      số dòng từng bảng lúc sao lưu, để đối chiếu khi khôi phục
# Không có bản dữ liệu chưa mã hóa nào được giữ lại: thư mục tạm bị xóa khi script kết thúc.
set -euo pipefail

die() { echo "::error::$*" >&2; exit 1; }
if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
  [ -n "${SUPABASE_PROJECT_REF:-}" ] && [ -n "${SUPABASE_POOLER_HOST:-}" ] || die "Thiếu SUPABASE_PROJECT_REF hoặc SUPABASE_POOLER_HOST để ghép chuỗi kết nối."
  # Mã hóa URL cho mật khẩu (ký tự @ # / : ? % không làm hỏng chuỗi); bỏ khoảng trắng, xuống dòng lỡ dán thừa ở hai đầu
  PW_ENC="$(SUPABASE_DB_PASSWORD="$SUPABASE_DB_PASSWORD" python3 -c 'import os,urllib.parse;print(urllib.parse.quote(os.environ["SUPABASE_DB_PASSWORD"].strip(), safe=""))')"
  SUPABASE_DB_URL="postgresql://postgres.${SUPABASE_PROJECT_REF}:${PW_ENC}@${SUPABASE_POOLER_HOST}:5432/postgres?sslmode=require"
  unset PW_ENC
fi
[ -n "${SUPABASE_DB_URL:-}" ] || die "Thiếu SUPABASE_DB_PASSWORD (hoặc SUPABASE_DB_URL) trong repository secret. Xem docs/sao-luu-supabase.md, bước 1."
case "$SUPABASE_DB_URL" in *'[YOUR-PASSWORD]'*|*'['*']'*) die "SUPABASE_DB_URL còn dấu ngoặc vuông [ ]: thay cả cụm [YOUR-PASSWORD] bằng mật khẩu.";; esac
[ -n "${BACKUP_PASSPHRASE:-}" ] || die "Thiếu BACKUP_PASSPHRASE (repository secret). Xem docs/sao-luu-supabase.md, bước 2."
[ "${#BACKUP_PASSPHRASE}" -ge 16 ] || die "BACKUP_PASSPHRASE quá ngắn: cần ít nhất 16 ký tự."

PG_BIN="${PG_BIN:-}"; P() { if [ -n "$PG_BIN" ]; then echo "$PG_BIN/$1"; else echo "$1"; fi; }
OUT_DIR="${OUT_DIR:-./backup-out}"
STAMP="$(date -u +%Y-%m-%d-%H%M)"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
chmod 700 "$WORK"; mkdir -p "$OUT_DIR"

echo "pg_dump: $("$(P pg_dump)" --version)"

# 1. Schema public: lược đồ + dữ liệu
"$(P pg_dump)" --dbname="$SUPABASE_DB_URL" --format=custom --schema=public --no-owner --no-privileges \
  --file="$WORK/public.dump"

# 2. Tài khoản đăng nhập: chỉ dữ liệu (bảng do Supabase quản lý, lược đồ đã có sẵn ở mọi dự án Supabase)
AUTH_TABLES=()
for t in users identities; do
  if [ "$("$(P psql)" "$SUPABASE_DB_URL" -Atqc "select to_regclass('auth.$t') is not null")" = "t" ]; then AUTH_TABLES+=(--table="auth.$t"); fi
done
if [ "${#AUTH_TABLES[@]}" -gt 0 ]; then
  "$(P pg_dump)" --dbname="$SUPABASE_DB_URL" --format=custom --data-only --no-owner --no-privileges \
    "${AUTH_TABLES[@]}" --file="$WORK/auth-users.dump"
fi

# 3. Số dòng từng bảng (không chứa dữ liệu cá nhân)
"$(P psql)" "$SUPABASE_DB_URL" -Atq -F $'\t' -c "
  select n.nspname||'.'||c.relname, (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', n.nspname, c.relname), false, true, '')))[1]::text
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where c.relkind = 'r' and (n.nspname = 'public' or (n.nspname = 'auth' and c.relname in ('users','identities')))
  order by 1" > "$WORK/so-dong.tsv"

# 4. Kiểm tra tệp đọc lại được trước khi mã hóa
"$(P pg_restore)" --list "$WORK/public.dump" > /dev/null || die "public.dump hỏng"
[ ! -f "$WORK/auth-users.dump" ] || "$(P pg_restore)" --list "$WORK/auth-users.dump" > /dev/null || die "auth-users.dump hỏng"
[ "$(wc -l < "$WORK/so-dong.tsv")" -gt 0 ] || die "Không đếm được bảng nào trong schema public"

# 5. Đóng gói + mã hóa; mật khẩu đi qua mô tả tệp 3, không qua tham số
OUT="$OUT_DIR/bizon-supabase-$STAMP.tar.gpg"
tar -C "$WORK" -cf - . | gpg --batch --yes --quiet --pinentry-mode loopback --symmetric --cipher-algo AES256 \
  --passphrase-fd 3 --output "$OUT" 3<<<"$BACKUP_PASSPHRASE"

# 6. Thử giải mã lại để chắc chắn tệp mở được bằng đúng mật khẩu
gpg --batch --quiet --pinentry-mode loopback --decrypt --passphrase-fd 3 "$OUT" 3<<<"$BACKUP_PASSPHRASE" | tar -tf - > "$WORK/check.txt"
grep -q 'public.dump' "$WORK/check.txt" || die "Giải mã thử không thấy public.dump"

echo "Đã tạo $(basename "$OUT") ($(du -h "$OUT" | cut -f1))"
echo "Số bảng: $(wc -l < "$WORK/so-dong.tsv"); tổng số dòng: $(awk -F'\t' '{s+=$2} END{print s+0}' "$WORK/so-dong.tsv")"
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  { echo "### Sao lưu Supabase $STAMP (UTC)"; echo; echo "Tệp: \`$(basename "$OUT")\` ($(du -h "$OUT" | cut -f1)), đã mã hóa AES-256."; echo;
    echo "| Bảng | Số dòng |"; echo "|---|---:|"; awk -F'\t' '{print "| " $1 " | " $2 " |"}' "$WORK/so-dong.tsv"; } >> "$GITHUB_STEP_SUMMARY"
fi
if [ -n "${GITHUB_OUTPUT:-}" ]; then echo "file=$OUT" >> "$GITHUB_OUTPUT"; echo "name=$(basename "$OUT" .tar.gpg)" >> "$GITHUB_OUTPUT"; fi
