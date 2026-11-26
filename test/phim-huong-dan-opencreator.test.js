// 26/11/2026: chị chọn thử OpenCreator (KrillinAI, Apache 2.0) để dựng cảnh nhân vật tập 1 (việc T010 của đặc tả 008).
// Hướng dẫn docs/phim/huong-dan-opencreator-tap-01.md phải khớp bảng phân cảnh: đủ mọi cảnh NV, đúng thời lượng và ảnh tham chiếu,
// giữ quy tắc của loạt phim (không chữ, chỉ nhân vật có sẵn, giọng Lumina do chị thu), ghi chỗ kiểm điều khoản dùng thương mại.
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const R = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const hd = R('docs/phim/huong-dan-opencreator-tap-01.md'), pc = R('docs/phim/tap-01-phan-canh.md');
const o = s => s.trim();
const nv = pc.split('\n').filter(l => /^\| C\d+ \| NV \|/.test(l)).map(l => { const c = l.split('|').map(o); return { ma: c[1], dai: c[3].replace(/ \(.*\)$/, ''), anh: (c[7].match(/`[^`]+`/g) || []) }; });
assert.ok(nv.length >= 10, 'bảng phân cảnh có các cảnh NV');
const dong = hd.split('\n').filter(l => /^\| C\d+ \|/.test(l));
assert.deepEqual(dong.map(l => l.split('|').map(o)[1]), nv.map(x => x.ma), 'hướng dẫn liệt kê đủ và đúng thứ tự các cảnh NV');
for (const x of nv) {
  const c = dong.find(l => l.split('|').map(o)[1] === x.ma).split('|').map(o);
  assert.equal(c[2], x.dai, x.ma + ': thời lượng khớp bảng phân cảnh');
  if (x.anh.length <= 3) for (const a of x.anh) assert.ok(c[4].includes(a), x.ma + ': có ảnh tham chiếu ' + a);
  for (const a of x.anh) assert.ok(fs.existsSync(path.join(__dirname, '..', a.replace(/`/g, ''))), x.ma + ': ảnh tham chiếu có trong kho ' + a);
}
assert.ok(hd.includes('no text, no signs, no logos, no subtitles') && pc.includes('no text, no signs, no logos, no subtitles'), 'giữ đuôi «không chữ» như bảng phân cảnh');
assert.ok(/giọng Lumina do Hương tự thu/.test(hd) && /Không dùng các mục đọc thành tiếng, lồng tiếng/.test(hd), 'không dùng giọng máy cho bản phát hành');
assert.ok(hd.includes('https://github.com/krillinai/OpenCreator/releases/latest') && /Apache 2\.0/.test(hd), 'nguồn tải và giấy phép');
assert.ok(/dùng thương mại/.test(hd) && /mục 10 của `khung-loat-phim\.md`/.test(hd) && /## 10\. Điều khoản công cụ video/.test(R('docs/phim/khung-loat-phim.md')), 'có chỗ ghi điều khoản, nối với mục 10 khung loạt phim');
assert.ok(hd.includes('Tap-01/03-canh-nv/') && R('docs/phim/ke-hoach-san-xuat.md').includes('03-canh-nv/'), 'thư mục gửi cảnh khớp kế hoạch sản xuất');
assert.ok(/C03 \(Bác Ba\)\*\* và \*\*C05 \(Minh Khang\)/.test(hd), 'thử trước hai cảnh C03, C05');
assert.ok(R('specs/008-phim-dua-trai-ra-bien/tasks.md').includes('huong-dan-opencreator-tap-01.md'), 'việc T010 trỏ tới hướng dẫn');
assert.ok(+(R('sw.js').match(/bizon-v(\d+)/) || [])[1] >= 1015, 'sw.js ≥ v1015');
console.log('phim-huong-dan-opencreator: ok (' + nv.length + ' cảnh NV)');
