// Hồ sơ quyền tác giả (05/11/2026): ba bản trích mã nguồn in kèm (docs/ip/*/ma-nguon-dac-trung/)
// phải lấy từ đúng phiên bản đăng ký afbacd2 (07/10/2026) đã khai trong Tờ khai, ghi rõ
// Tailwind CSS (giấy phép MIT) là thư viện bên thứ ba, và bản Bến Phù Sa không in hằng số
// cân bằng (đáp án game) cũng như không chứa phần IB-CI.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const FILES = {
  'bat-nghiep': 'docs/ip/bat-nghiep/ma-nguon-dac-trung/bat-nghiep-ma-nguon-dac-trung.txt',
  'ben-phu-sa': 'docs/ip/ben-phu-sa/ma-nguon-dac-trung/ben-phu-sa-ma-nguon-dac-trung.txt',
  'ho-chieu-thuong-hieu': 'docs/ip/ho-chieu-thuong-hieu/ma-nguon-dac-trung/ho-chieu-thuong-hieu-ma-nguon-dac-trung.txt',
};
const COMMIT = 'afbacd29a8efa30ff6f1d95778837cfa84c18498';

for (const [game, f] of Object.entries(FILES)) {
  const t = read(f);
  assert.ok(t.includes('Mã phiên bản (commit) afbacd2 – ' + COMMIT), game + ': thiếu mã phiên bản đăng ký afbacd2');
  assert.ok(t.includes('14 giờ 53 ngày 07/10/2026'), game + ': thiếu mốc hoàn thành 07/10/2026');
  assert.ok(t.includes('https://bizonland.com'), game + ': thiếu địa chỉ công bố bizonland.com');
  assert.ok(/Tailwind CSS v3\.4\.17, giấy phép\s+MIT|three\.js r184/.test(t), game + ': thiếu khai thư viện bên thứ ba');
  // Không có dữ liệu cá nhân hay khóa kết nối trong tệp công khai
  assert.ok(!/0921940070|0920780020|098796|098826|eyJhb|supabase\.co/.test(t), game + ': lộ dữ liệu cá nhân/khóa');
}

// Bật Nghiệp: ghi rõ css/tw.css là Tailwind CSS (MIT), khớp Tờ khai
{
  const t = read(FILES['bat-nghiep']);
  assert.ok(t.includes('css/tw.css (Tailwind CSS v3.4.17, giấy phép MIT)'), 'tw.css phải ghi là Tailwind CSS (MIT)');
  assert.ok(t.includes('TỆP: js/engine.js') && t.includes('TỆP: js/backend.js'), 'phải in trọn js/engine.js và js/backend.js');
}

// Bến Phù Sa: hằng số cân bằng đã lược, không có IB-CI, giữ cấu trúc 3 phần
{
  const t = read(FILES['ben-phu-sa']);
  for (const h of ['PHẦN 1 —', 'PHẦN 2 —', 'PHẦN 3 —']) assert.ok(t.includes(h), 'thiếu ' + h);
  assert.ok((t.match(/‹ĐÃ LƯỢC/g) || []).length >= 10, 'phải đánh dấu chỗ lược');
  for (const bad of ['Math.pow(rnd(), 1.6)', 'rnd() * 0.45', '0.4 * (n - 1)', 'f *= 1.15', 'f *= 0.88', 'rnd() < 0.25', 'a.mult = [', 'mk.plan = ['])
    assert.ok(!t.includes(bad), 'còn hằng số cân bằng: ' + bad);
  const body = t.slice(t.indexOf('PHẦN 1 —'));
  assert.ok(!/IB-CI|IBCI|ib_ci/i.test(body), 'phần mã in không được có IB-CI');
}

// Hộ Chiếu: engine AIBIS + khối script chính; khai đúng GSAP/Tailwind/three/D3
{
  const t = read(FILES['ho-chieu-thuong-hieu']);
  assert.ok(t.includes('TỆP: js/aibis/entry-mode-models.js') && t.includes('TỆP: js/aibis/entry-mode-engine.js'));
  assert.ok(t.includes('TỆP: brand-passport.html — khối <script> chính'));
  assert.ok(t.includes('7 thị trường') && t.includes("name: 'Hỏa Sơn'"), 'phải là bản 7 thị trường (afbacd2)');
  assert.ok(t.includes('GSAP 3.15.0') && t.includes('D3 7.9.0'), 'phải khai GSAP và D3 như Tờ khai');
  assert.ok(!t.includes('không dùng thư viện/CDN bên thứ ba nào'), 'câu khai cũ mâu thuẫn Tờ khai phải bỏ');
}
console.log('ip-ma-nguon-afbacd2: OK');
