/* Thầy Tu Phan «tranh động», tờ đứng v3 (13/11/2026): chị thấy trong Bật Nghiệp 3D đầu thầy Tú to hơn thân. Tờ đứng v2 có đầu
 * chiếm khoảng 1/5 chiều cao, trong khi tờ nói v2 chỉ khoảng 1/6,5. Tờ v3 thu đầu còn 80 % bằng scripts/3d/thu-dau-sprite.py.
 * Kiểm: tờ v3 có mặt, tờ v2 giữ nguyên, tỷ lệ đầu/chiều cao của tờ đứng v3 nhỏ hơn v2 và gần tờ nói, bộ nạp dùng tờ v3. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const { spawnSync } = require('node:child_process');
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const R = f => path.join(__dirname, '..', f), read = f => fs.readFileSync(R(f), 'utf8');
const TD = 'assets/character/tranh-dong/';
check(fs.existsSync(R(TD + 'tu-dung-v2.webp')) && fs.existsSync(R(TD + 'tu-dung-v3.webp')), 'tờ đứng v3 có mặt, tờ v2 giữ nguyên');
check(/'tu-dung': 'tu-dung-v3'/.test(read('js/ben-bizon-tranh-dong.js')), 'bộ nạp tranh động dùng tờ đứng v3');
check(/thu-dau-sprite\.py/.test(read('assets/models/SOURCES.md')), 'SOURCES.md ghi cách làm tờ v3');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 852, 'sw.js ≥ bizon-v852');
// tỷ lệ đầu / chiều cao nhân vật ở khung đầu của mỗi tờ (đo bằng Python + Pillow nếu máy có)
const py = `
import json, sys, numpy as np
from PIL import Image
for n in sys.argv[1:]:
    a = Image.open(n + '.webp').convert('RGBA'); j = json.load(open(n + '.json')); W, H = a.width // j['cot'], a.height // j['hang']
    al = np.array(a.crop((0, 0, W, H)))[..., 3] > 128; w = al.sum(1); top = int(np.argmax(w > 0)); bot = H - 1 - int(np.argmax(w[::-1] > 0))
    yn = top + 30 + int(np.argmin(w[top + 30: top + 65])); print(round((yn - top) / (bot - top), 3))`;
const r = spawnSync('python3', ['-c', py, ...['tu-dung-v2', 'tu-dung-v3', 'tu-noi-v2'].map(t => R(TD + t))], { encoding: 'utf8' });
if (r.status === 0) {
  const [v2, v3, noi] = r.stdout.trim().split('\n').map(Number);
  check(v3 < v2 * 0.9, 'đầu tờ đứng v3 nhỏ hơn v2 (' + v3 + ' so với ' + v2 + ')');
  check(Math.abs(v3 - noi) < 0.04, 'tỷ lệ đầu tờ đứng v3 gần tờ nói (' + v3 + ' so với ' + noi + ')');
} else console.log('  (không đo được tỷ lệ đầu – thiếu Python/Pillow/numpy: bỏ qua)');
console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\ntu-tranh-dong-v3: ok');
process.exit(fails ? 1 : 0);
