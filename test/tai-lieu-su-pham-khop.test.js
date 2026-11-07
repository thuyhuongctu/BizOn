/* Tài liệu sư phạm khớp nhau (PR 5 của kế hoạch docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md, 06/11/2026): rubric mô tả đúng phiếu
 * trước–sau đang dùng (khao-sat.html: 15 câu kiến thức + 8 câu tự tin), ghi đúng chỉ số nào có trong tệp xuất của giảng viên, và nêu rõ
 * điểm chưa khớp của cơ cấu điểm chờ tác giả chốt. Tài liệu hồ sơ SHTT (docs/ip, ho-so-so-huu-tri-tue, bieu-mau) giữ nguyên, không kiểm. */
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const ks = R('khao-sat.html');
const a = (ks.split('Phần B')[0].match(/<li\b|<div class="q"|<p class="q"|<tr><td>\d+\./g) || []).length;
const b = (ks.split('Phần B')[1].split('Phiếu trước')[0].match(/<tr><td>\d+\./g) || []).length;
assert.equal(b, 8, 'khao-sat.html Phần B phải có 8 phát biểu tự tin, đang ' + b);
assert.ok(/15 câu/.test(ks), 'khao-sat.html nói 15 câu Phần A');
const rb = R('docs/chuan-dau-ra-va-rubric.md');
assert.ok(rb.includes('**15 câu kiến thức (Phần A)** và **8 phát biểu tự tin'), 'rubric §5.1 mô tả phiếu 15 + 8 câu');
assert.ok(!/bộ 30 câu/i.test(rb.replace(/Bản 30 câu nêu ở các phiên bản trước[^.]*\./, '')), 'rubric không còn nói bộ 30 câu');
assert.ok(rb.includes('`adEff`, `lostSales`, `roi` chỉ hiện trong báo cáo vòng trên màn hình của đội'), 'rubric ghi rõ chỉ số không có trong tệp xuất');
// Cơ cấu điểm chốt 07/11/2026: 50% điểm game B1–B6 · 30% rubric lập luận · 20% hợp tác; không còn 45/35/20
for (const f of ['docs/chuan-dau-ra-va-rubric.md', 'docs/cham-diem-bat-nghiep.md', 'docs/huong-dan-giang-vien.md']) { const t = R(f); assert.ok(!t.includes('45/35/20') && !/\*\*45%\*\*/.test(t), f + ' không còn 45/35/20'); }
assert.ok(rb.includes('| **50%** |') && rb.includes('| **30%** |') && rb.includes('| **20%** |') && rb.includes('Quyết định 07/11/2026'), 'rubric có cơ cấu 50/30/20 và ghi ngày chốt');
assert.ok(R('docs/cham-diem-bat-nghiep.md').includes('| **50%** |') && R('docs/huong-dan-giang-vien.md').includes('50% điểm game B1–B6'), 'hướng dẫn chấm và hướng dẫn giảng viên cùng cơ cấu');
// Bốn tệp SQL đã áp tay nằm ở supabase/da-ap-tay/, không còn tệp .sql lạc ở supabase/
assert.ok(!fs.readdirSync(path.join(__dirname, '..', 'supabase')).some(f => f.endsWith('.sql')), 'không còn .sql lạc ngoài migrations');
for (const f of ['20260929000000_bp_leaderboard.sql', '20260930000000_member_log.sql', '20261007000000_member_log_lumina.sql', '20261007010000_rubric_config.sql', 'README.md']) assert.ok(fs.existsSync(path.join(__dirname, '..', 'supabase', 'da-ap-tay', f)), 'thiếu supabase/da-ap-tay/' + f);
for (const p of ['bang-chung.html', 'thiet-ke-nghien-cuu.html']) assert.ok(/15 câu|15-item/.test(R(p)), p + ' nói 15 câu');
// Tệp Excel của giảng viên: không có cột adEff, nên rubric không được hứa adEff xuất được
assert.ok(!/adEff/.test(R('js/bizon-grading.js')), 'bizon-grading.js chưa xuất adEff (nếu thêm cột thì sửa lại rubric §4.1)');
console.log('tai-lieu-su-pham-khop: ok');
