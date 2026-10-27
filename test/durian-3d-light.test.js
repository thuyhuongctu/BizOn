// Sầu Riêng 3D tải nhẹ hơn (27/10/2026): trang nhúng ảnh rồng dạng WebP thay PNG (HTML 2,25 MB → ~1,4 MB),
// chỉ nạp trước ảnh dự phòng «wave» + 6 tư thế Tèo Soi hay gặp; tư thế khác nạp khi cần (trước: 13 ảnh cũ + 31 tư thế).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'lab/ho-chieu-sau-rieng-3d.html'), 'utf8'), lines = html.split('\n');
const at = tag => JSON.parse(lines[lines.findIndex(l => l.trim() === '<script type="__bundler/' + tag + '">') + 1]);
const man = at('manifest'), tpl = at('template');
assert.ok(html.length < 1.6e6, 'trang nhẹ hơn 1,6 MB: ' + html.length);
assert.ok(!Object.values(man).some(v => v.mime === 'image/png'), 'không còn ảnh PNG nhúng');
assert.ok(Object.values(man).filter(v => v.mime === 'image/webp').length >= 9, 'ảnh nhúng dạng WebP');
assert.match(tpl, /static TS_EAGER = \['wave', 'walk', 'point-l', 'point-r', 'passport-show', 'think'\];/);
assert.ok(tpl.includes("Component.TS_EAGER.forEach(k => this.tex.load('assets/dragon/teo-soi/'") && !tpl.includes("Component.TS.forEach(k => this.tex.load("), 'chỉ nạp trước nhóm tư thế hay gặp');
assert.ok(tpl.includes("this.tex.load('assets/dragon/sprite/wave.webp'") && !/keys = \['wave', 'jump'/.test(tpl), 'bộ ảnh rồng cũ chỉ còn «wave» dự phòng');
assert.ok(tpl.includes("if (!u.tex[k] && k.indexOf('ts-') === 0 && Component.TS.includes(k.slice(3)) && !u.want[k])"), 'tư thế khác nạp khi cần');
assert.ok(tpl.includes('const tx = u.tex[k] || u.faceTx || u.tex.wave; if (!tx || (u.face === k && u.faceTx === tx)) return;'), 'giữ ảnh đang hiện khi tư thế mới chưa tải xong');
assert.ok(+(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').match(/bizon-v(\d+)/) || [])[1] >= 697);
console.log('durian-3d-light: ok');
