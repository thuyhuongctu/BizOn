// Sinh css/bizon-clay-chrome.css từ css/bizon-clay.css: chỉ biến màu (:root) +
// thanh điều hướng #clay-nav + chân trang #clay-footer. Dùng cho trang công cụ
// cũ (Tailwind) đã đổi sang menu đất sét mà không muốn .clay-card/.clay-btn
// của bizon-clay.css đè lên thẻ/nút sẵn có. Chạy lại sau mỗi lần sửa nav/footer:
//   node scripts/build-clay-chrome.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function buildClayChrome(src) {
  const root = src.match(/:root\{[\s\S]*?\n\}\n/);
  const start = src.indexOf('/* ============================================================================\n   Thanh điều hướng đất sét');
  const end = src.indexOf('/* ============================================================================\n   Hero đất sét');
  if (!root || start < 0 || end < start) throw new Error('bizon-clay.css: không tìm thấy mốc :root / nav / hero');
  return '/* TỰ SINH từ css/bizon-clay.css bởi scripts/build-clay-chrome.mjs – đừng sửa tay.\n'
    + '   Chỉ gồm biến màu + #clay-nav + #clay-footer cho trang công cụ cũ. */\n'
    + root[0] + '\n' + src.slice(start, end).trimEnd() + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const css = new URL('../css/', import.meta.url);
  writeFileSync(new URL('bizon-clay-chrome.css', css), buildClayChrome(readFileSync(new URL('bizon-clay.css', css), 'utf8')));
}
