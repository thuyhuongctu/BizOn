// Sao lưu Supabase định kỳ (01/11/2026): workflow chạy theo lịch, chỉ tải lên tệp ĐÃ MÃ HÓA (kho công khai),
// mật khẩu không đi qua tham số dòng lệnh, thiếu secret thì báo lỗi rõ. Không kết nối cơ sở dữ liệu thật.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const wf = read('.github/workflows/supabase-backup.yml'), sh = read('scripts/supabase-backup.sh'), doc = read('docs/sao-luu-supabase.md');
assert.match(wf, /schedule:\s*\n\s*- cron: '17 19 \* \* \*'/, 'chạy mỗi ngày 02:17 giờ Việt Nam');
assert.ok(wf.includes('workflow_dispatch:'), 'chạy tay được');
assert.ok(wf.includes('SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}') && wf.includes('SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}') && wf.includes('BACKUP_PASSPHRASE: ${{ secrets.BACKUP_PASSPHRASE }}'), 'secret qua biến môi trường');
assert.ok(wf.includes('SUPABASE_PROJECT_REF: ceytblfelodpnudomccn') && wf.includes('SUPABASE_POOLER_HOST: aws-0-ap-northeast-1.pooler.supabase.com'), 'dự án + pooler Tokyo');
assert.ok(!/run:.*secrets\./.test(wf), 'không chèn secret thẳng vào lệnh run');
assert.match(wf, /path: \$\{\{ steps\.bk\.outputs\.file \}\}/, 'chỉ tải lên tệp do script tạo');
assert.match(wf, /retention-days: 90/);
assert.match(wf, /permissions:\s*\n\s*contents: read/);
assert.ok(wf.includes("github.repository == 'thuyhuongctu/BizOn'"), 'bản fork không chạy');
// Script: mã hóa AES-256, mật khẩu qua fd 3, dọn thư mục tạm, kiểm tra trước khi mã hóa, thử giải mã lại
assert.ok(sh.includes('--symmetric --cipher-algo AES256'), 'mã hóa AES-256');
assert.ok(sh.includes('--passphrase-fd 3') && !/--passphrase[ =]["$]/.test(sh), 'mật khẩu không nằm trong tham số');
assert.ok(sh.includes("trap 'rm -rf \"$WORK\"' EXIT"), 'xóa bản chưa mã hóa');
assert.ok(sh.includes('pg_restore') && sh.includes('--list'), 'đọc thử tệp dump');
assert.ok(/--decrypt/.test(sh), 'giải mã thử');
assert.ok(sh.includes('-ge 16'), 'mật khẩu tối thiểu 16 ký tự');
assert.ok(/\.tar\.gpg"/.test(sh) && !/upload|curl|https?:\/\//.test(sh.replace(/^#.*$/gm, '')), 'script không tự gửi dữ liệu đi đâu');
execFileSync('bash', ['-n', path.join(ROOT, 'scripts/supabase-backup.sh')]);
// Thiếu secret: dừng ngay với thông báo dẫn tới hướng dẫn, không tạo tệp nào
for (const [env, want] of [[{ SUPABASE_DB_URL: '', BACKUP_PASSPHRASE: 'x'.repeat(20) }, 'Thiếu SUPABASE_DB_PASSWORD'], [{ SUPABASE_DB_URL: 'postgresql://postgres.x:[YOUR-PASSWORD]@h:5432/postgres', BACKUP_PASSPHRASE: 'x'.repeat(20) }, 'dấu ngoặc vuông'], [{ SUPABASE_DB_URL: 'postgresql://x', BACKUP_PASSPHRASE: '' }, 'Thiếu BACKUP_PASSPHRASE'], [{ SUPABASE_DB_URL: 'postgresql://x', BACKUP_PASSPHRASE: 'ngan' }, 'quá ngắn']]) {
  const r = spawnSync('bash', [path.join(ROOT, 'scripts/supabase-backup.sh')], { env: { PATH: process.env.PATH, ...env, OUT_DIR: path.join(ROOT, 'backup-out-test-khong-tao') }, encoding: 'utf8' });
  assert.notEqual(r.status, 0); assert.ok(r.stderr.includes(want), r.stderr);
  assert.ok(!fs.existsSync(path.join(ROOT, 'backup-out-test-khong-tao')), 'thiếu secret thì không tạo thư mục');
}
// Chỉ dán mật khẩu: script ghép chuỗi Session pooler, mã hóa URL ký tự đặc biệt, bỏ khoảng trắng thừa; mật khẩu không in ra
{
  const os = require('node:os'), bin = fs.mkdtempSync(path.join(os.tmpdir(), 'pgfake-')), seen = path.join(bin, 'seen.txt');
  fs.writeFileSync(path.join(bin, 'pg_dump'), '#!/bin/sh\nfor a in "$@"; do case "$a" in --dbname=*) echo "${a#--dbname=}" > "' + seen + '";; esac; done\n[ "$1" = "--version" ] && echo "pg_dump (fake) 17" && exit 0\nexit 7\n', { mode: 0o755 });
  const r = spawnSync('bash', [path.join(ROOT, 'scripts/supabase-backup.sh')], { env: { PATH: process.env.PATH, PG_BIN: bin, SUPABASE_DB_PASSWORD: ' Ab@1#/:?%x \n', SUPABASE_PROJECT_REF: 'ceytblfelodpnudomccn', SUPABASE_POOLER_HOST: 'aws-0-ap-northeast-1.pooler.supabase.com', BACKUP_PASSPHRASE: 'x'.repeat(20), OUT_DIR: path.join(bin, 'out') }, encoding: 'utf8' });
  assert.notEqual(r.status, 0, 'pg_dump giả trả lỗi thì script dừng');
  assert.equal(fs.readFileSync(seen, 'utf8').trim(), 'postgresql://postgres.ceytblfelodpnudomccn:Ab%401%23%2F%3A%3F%25x@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require');
  assert.ok(!(r.stdout + r.stderr).includes('Ab@1#'), 'không in mật khẩu ra log');
  fs.rmSync(bin, { recursive: true, force: true });
}
// Hướng dẫn: Session pooler (IPv4), cảnh báo kho công khai, cách khôi phục
for (const need of ['SUPABASE_DB_PASSWORD', 'chỉ mật khẩu', 'Session pooler', 'IPv6', 'công khai', 'gpg -d', 'pg_restore', 'BACKUP_PASSPHRASE', '60 ngày', '1–2 phút']) assert.ok(doc.includes(need), 'hướng dẫn thiếu: ' + need);
assert.ok(read('.gitignore').includes('backup-out'), 'không lỡ commit thư mục sao lưu');
console.log('supabase-backup: ok');
