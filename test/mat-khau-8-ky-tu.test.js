// Mật khẩu tối thiểu 8 ký tự ở mọi nơi tạo hay đổi mật khẩu, khớp «Minimum password length» = 8 trên Supabase Auth.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const gv = read('Trang Giang Vien.dc.html');
assert.match(gv, /const GV_MIN_PASS = 8;/);
assert.match(gv, /fNewPass\.length < GV_MIN_PASS/, 'đặt lại mật khẩu phải đòi 8 ký tự');
assert.match(gv, /mode === 'up' && fPass\.length < GV_MIN_PASS/, 'tạo tài khoản giảng viên phải đòi 8 ký tự');
assert.ok(gv.includes("tPassPh: tr('Tối thiểu 8 ký tự', 'At least 8 characters')"));
assert.ok(read('js/student-auth.js').includes('password.length < 8'));
assert.ok(read('js/app-shell/instructor-studio.js').includes('password.length < 8'));

// Không còn chỗ nào hứa hay kiểm 6 ký tự
for (const f of ['Trang Giang Vien.dc.html', 'js/student-auth.js', 'js/app-shell/instructor-studio.js', 'js/instructor-api.js']) {
  const s = read(f);
  assert.ok(!/length < 6\b|6 ký tự|at least 6 characters/i.test(s), f + ': còn mức 6 ký tự');
}
console.log('mat-khau-8-ky-tu: ok');
