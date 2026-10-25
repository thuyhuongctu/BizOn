// Hộ Chiếu Sầu Riêng 3D: nhật ký phản tư sau vụ (cùng mẫu bản thẻ) – nguyên nhân sai lệch, thay đổi vụ sau bắt buộc;
// chặn chốt vụ kế tiếp khi chưa ghi; vào nhật ký, báo cáo, CSV đội–vụ và nhật ký sự kiện WRITE_JOURNAL.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// 1. Danh mục nguyên nhân dùng chung; bản thẻ gọi hàm chung
const ctx = {}; ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-data.js'), ctx);
vm.runInContext(read('lab/ho-chieu-sau-rieng-core.js'), ctx);
const C = ctx.DurianCore;
assert.equal(typeof C.causes, 'function', 'DurianCore.causes');
assert.deepEqual(Object.keys(C.causes((a, b) => a)), ['event', 'price', 'inspection', 'assumption', 'rivals', 'other']);
assert.equal(C.causes((a, b) => a).price, 'Giá vựa khác ước tính'); assert.equal(C.causes((a, b) => b).price, 'Depot price differed');
assert.match(read('lab/ho-chieu-sau-rieng.html'), /const CAUSES = \(\) => DurianCore\.causes\(L\);/);

// 2. Template 3D
const lines = read('lab/ho-chieu-sau-rieng-3d.html').split('\n');
const ti = lines.findIndex(l => l.trim() === '<script type="__bundler/template">');
const tpl = JSON.parse(lines[ti + 1]);
assert.match(tpl, /state = \{ jr: false, rp: false, hp: false, rv: false, rf: null, rfd: \{\}, log: \[\],/, 'trạng thái rf/rfd');
assert.match(tpl, /<sc-if value="\{\{ rf\.show \}\}">/, 'khung nhật ký phản tư');
assert.match(tpl, /<sc-for list="\{\{ rf\.causes \}\}" as="g" hint-placeholder-count="6">/, '6 nguyên nhân');
assert.match(tpl, /<textarea data-rf="\{\{ f\.k \}\}" value="\{\{ f\.v \}\}" sc-camel-on-change="\{\{ f\.set \}\}"/, 'ô nhập theo mẫu phiếu quyết định');
assert.match(tpl, /pendingRf\(\) \{ const l = this\.state\.log \|\| \[\], e = l\[l\.length - 1\]; return e && !e\.cause \? e : null; \}/, 'vụ vừa chốt chưa ghi thì còn nợ');
assert.match(tpl, /this\.logEv\('WRITE_JOURNAL', '', JSON\.stringify\(\{ round: n, cause: d\.cause \}\), true\);/, 'ghi sự kiện WRITE_JOURNAL như bản thẻ');
assert.match(tpl, /this\.logEv\('WRITE_DEBRIEF', '', Object\.keys\(db\)\.join\('\|'\), true\);/, 'WRITE_DEBRIEF khi có debrief');
assert.match(tpl, /if \(!force && \(!s\.goal \|\| s\.journal\.why\.trim\(\)\.length < 10 \|\| this\.pendingRf\(\)\)\) return;/, 'doCommit chặn khi còn nợ nhật ký');
assert.match(tpl, /const valid = !!s\.goal && s\.journal\.why\.trim\(\)\.length >= 10 && !this\.pendingRf\(\);/, 'nút chốt xám khi còn nợ');
assert.match(tpl, /\} else if \(id === 'ceo'\) \{\n      const pr = this\.pendingRf\(\);\n      if \(pr\) \{/, 'CEO nhắc ghi nhật ký trước');
assert.match(tpl, /out\.choices = \[\{ l: '📝 ' \+ t\.rfOpen \+ ' ' \+ r\.n, fn: \(\) => \{ close\(\); this\.openRf\(r\.n\); \} \}, \{ l: t\.dDone, fn: close \}\]; return out;/, 'màn kết quả vụ mở nhật ký');
assert.match(tpl, /else if \(this\.pendingRf\(\)\) out\.goal = g\(t\.rfOpen \+ ' ' \+ this\.pendingRf\(\)\.n/, '«Việc tiếp theo» nhắc ghi');
assert.match(tpl, /if \(e\.key === 'Escape'\) \{ if \(this\.state\.rf\) this\.setState\(\{ rf: false \}\); else /, 'Esc đóng khung');
assert.match(tpl, /'flag_win', 'cum_flag_win', 'journal_cause', 'journal_next', 'journal_good', 'journal_bad'\]/, 'CSV có 4 cột nhật ký');
assert.match(tpl, /<span data-rp="cause" style="color:#22522C">📝 \{\{ r\.cause \}\} → \{\{ r\.next \}\}<\/span>/, 'báo cáo 6 vụ hiện nguyên nhân → vụ sau');
assert.match(tpl, /<sc-if value="\{\{ r\.rf \}\}"><span style="font-size:12\.5px;color:#22522C">📝 \{\{ r\.rf \}\}<\/span><\/sc-if>/, 'nhật ký quyết định hiện dòng phản tư');
for (const k of ['rfTag', 'rfTitle', 'rfCause', 'rfGood', 'rfBad', 'rfNext', 'rfDebrief', 'rfLater', 'rfSave', 'rfOpen', 'rfHint', 'rfCauseK', 'rfNextK']) {
  assert.equal((tpl.match(new RegExp("\\b" + k + ": '")) || []).length, 1, 'chuỗi ' + k + ' có mặt');
  assert.equal(tpl.split(k + ": '").length - 1, 2, 'chuỗi ' + k + ' song ngữ (2 lần)');
}
assert.equal((tpl.match(/window\.DurianCore\.causes\(/g) || []).length, 3, 'bản 3D dùng hàm chung ở khung, nhật ký và dấu vết');
console.log('durian-3d-reflect: ok');
