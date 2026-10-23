// Đặt mtime của mọi tệp theo thời điểm commit cuối cùng chạm vào tệp đó.
// GitHub Pages tạo ETag/Last-Modified từ mtime + kích thước. Nếu để mtime là
// giờ checkout, mỗi lần deploy mọi tệp đều đổi ETag, nên trình duyệt và sw.js
// phải tải lại toàn bộ dù tệp không đổi. Giữ mtime theo commit thì tệp không
// đổi vẫn giữ ETag cũ và chỉ cần trả 304.
// Cần checkout đủ lịch sử (actions/checkout với fetch-depth: 0).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const log = execFileSync('git', ['-c', 'core.quotePath=false', 'log', '--format=@%ct', '--name-only', '--no-renames', 'HEAD'], { encoding: 'utf8', maxBuffer: 256 << 20 });
const seen = new Set();
let ts = 0, n = 0;
for (const line of log.split('\n')) {
  if (line.startsWith('@')) { ts = Number(line.slice(1)); continue; }
  if (!line || seen.has(line)) continue;
  seen.add(line);
  try { fs.utimesSync(line, ts, ts); n++; } catch (e) { /* tệp đã xoá hoặc đổi tên */ }
}
console.log('restore-mtime: ' + n + ' tệp');
