#!/usr/bin/env bash
# BizOn – lấy file supabase/migrations/<tên> cho workflow supabase-migrate.yml.
# Thứ tự tìm: nhánh source_ref (mặc định main) → nhánh của các PR đang mở. Nếu nhiều PR có file
# này với nội dung khác nhau thì dừng, yêu cầu điền source_ref. Đọc qua GitHub API (gh), không fetch git.
# Dùng: GITHUB_REPOSITORY=chu/kho fetch-migration.sh <ten-file.sql> <source_ref|''> <file-ra>
set -euo pipefail
M="$1"; REF="${2:-}"; OUT="$3"
[[ "$M" =~ ^[0-9]{14}_[a-z0-9_]+\.sql$ ]] || { echo "Tên file migration không hợp lệ: $M"; exit 1; }
REF="${REF:-main}"
[[ "$REF" =~ ^[A-Za-z0-9._/-]+$ ]] || { echo "Tên nhánh không hợp lệ: $REF"; exit 1; }

get() { gh api -H 'Accept: application/vnd.github.raw' "repos/$GITHUB_REPOSITORY/contents/supabase/migrations/$M?ref=$1" 2>/dev/null; }
done_msg() { echo "Lấy $M từ nhánh $1: $(wc -l < "$OUT") dòng, sha256 $(sha256sum "$OUT" | cut -c1-12)."; }

if get "$REF" > "$OUT" && [ -s "$OUT" ]; then done_msg "$REF"; exit 0; fi
echo "Nhánh $REF chưa có $M – tìm trong các PR đang mở…"

TMP="$(mktemp -d)"; found=(); n=0
while read -r b; do
  [ -n "$b" ] || continue
  n=$((n + 1))
  if get "$b" > "$TMP/$n" && [ -s "$TMP/$n" ]; then found+=("$n:$b"); fi
done < <(gh pr list --repo "$GITHUB_REPOSITORY" --state open --limit 100 --json headRefName --jq '.[].headRefName')

[ "${#found[@]}" -gt 0 ] || { echo "Không PR đang mở nào có supabase/migrations/$M."; exit 1; }
distinct=$(for f in "${found[@]}"; do sha256sum "$TMP/${f%%:*}" | cut -d' ' -f1; done | sort -u | wc -l)
names=$(printf '%s ' "${found[@]#*:}")
if [ "$distinct" -gt 1 ]; then
  echo "Các nhánh $names có $M với nội dung khác nhau – điền source_ref để chọn một nhánh."
  exit 1
fi
cp "$TMP/${found[0]%%:*}" "$OUT"
echo "Tìm thấy trên: $names"
done_msg "${found[0]#*:}"
