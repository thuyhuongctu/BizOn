/* Bật Nghiệp 3D – ảnh CEO đối thủ Alpha Dynamics tách nền sạch (11/11/2026).
 * Ảnh cũ solid/alpha-full-tex.webp còn 41 đốm trắng sót quanh chân, viền trắng quanh người và lỗ nền trắng giữa cánh tay
 * chống hông và thân. Bản sửa lưu thành tệp mới solid/alpha-full-tex-v2.webp (không ghi đè ảnh gốc); bizon-characters.js
 * trỏ sang bản mới. Kiểm: đường dẫn, ảnh gốc còn nguyên, bản mới chỉ còn một khối hình, không còn lỗ nền trắng. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const goc = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(goc, f), 'utf8');

check(/alpha: 'solid\/alpha-full-tex-v2\.webp'/.test(read('bizon-characters.js')), 'bizon-characters.js dùng ảnh alpha-full-tex-v2.webp');
check(fs.existsSync(path.join(goc, 'assets/character/solid/alpha-full-tex.webp')), 'ảnh gốc alpha-full-tex.webp vẫn còn (không ghi đè)');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(read('sw.js')) || [])[1] >= 835, 'sw.js ≥ bizon-v835');

let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
(async () => {
  // đọc điểm ảnh bằng trình duyệt (không cần thư viện xử lý ảnh trong Node)
  const b = await chromium.launch();
  try {
    const pg = await b.newPage();
    const doc = f => 'data:image/webp;base64,' + fs.readFileSync(path.join(goc, f)).toString('base64');
    const doDem = src => pg.evaluate(async s => {
      const im = new Image(); im.src = s; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height, op = new Uint8Array(W * H), lab = new Int32Array(W * H);
      for (let i = 0; i < W * H; i++) op[i] = d[i * 4 + 3] > 40 ? 1 : 0;
      let khoi = 0, lon = 0;
      for (let i = 0; i < W * H; i++) if (op[i] && !lab[i]) {
        khoi++; let n = 0; const st = [i]; lab[i] = khoi;
        while (st.length) { const p = st.pop(); n++; const px = p % W, py = (p - px) / W;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = px + dx, ny = py + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const q = ny * W + nx; if (op[q] && !lab[q]) { lab[q] = khoi; st.push(q); } } }
        if (n > lon) lon = n;
      }
      // lỗ nền giữa tay và hông: vùng x 81–112, y 283–331 của ảnh 371 × 720
      let trang = 0; for (let y = 283; y <= 331; y++) for (let x2 = 81; x2 <= 112; x2++) { const k = (y * W + x2) * 4; if (d[k + 3] > 100 && Math.min(d[k], d[k + 1], d[k + 2]) > 195) trang++; }
      return { khoi, W, H, trang };
    }, src);
    const cu = await doDem(doc('assets/character/solid/alpha-full-tex.webp')), moi = await doDem(doc('assets/character/solid/alpha-full-tex-v2.webp'));
    check(cu.khoi > 10 && cu.trang > 500, 'ảnh cũ đúng là có lỗi (' + cu.khoi + ' khối, ' + cu.trang + ' điểm trắng ở lỗ nền) – để test có ý nghĩa');
    check(moi.W === cu.W && moi.H === cu.H, 'bản mới giữ nguyên kích thước ' + cu.W + ' × ' + cu.H + ' (không lệch tỉ lệ trong cảnh)');
    check(moi.khoi === 1, 'bản mới chỉ còn một khối hình, không còn đốm sót (' + moi.khoi + ')');
    check(moi.trang < 20, 'bản mới không còn lỗ nền trắng giữa tay và hông (' + moi.trang + ' điểm)');
  } finally { await b.close(); }
  console.log(fails ? '\n' + fails + ' kiểm tra hỏng' : '\nbat-nghiep-tach-nen-alpha: ok');
  process.exit(fails ? 1 : 0);
})();
