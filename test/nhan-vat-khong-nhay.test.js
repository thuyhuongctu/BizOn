'use strict';
/* Bật Nghiệp (14/11/2026): chị thấy nhân vật «nhảy tưng tưng» và ảnh tách nền còn viền trắng.
 * - Game 3D: vòng có lãi / thắng sàn đấu thì ăn mừng bằng cử chỉ, chân không rời sàn.
 * - Trang Văn phòng đội: nhân vật không trồi lên tụt xuống theo cuộn, không nhảy khi rê chuột; sa bàn 3D không nhún.
 * - Ảnh nhân vật tách lại thành tệp mới (-v2, thầy Tu Phan -v4): bỏ viền trắng, bỏ lỗ nền trắng giữa tay và thân;
 *   ảnh gốc giữ nguyên. Kiểm điểm ảnh bằng trình duyệt (không cần thư viện ảnh trong Node). */
const fs = require('node:fs'), path = require('node:path');
let fails = 0; const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) fails++; };
const goc = path.join(__dirname, '..'), R = f => fs.readFileSync(path.join(goc, f), 'utf8'), co = f => fs.existsSync(path.join(goc, f));

const game = R('BizOn Game 3D.html');
check(!/Math\.abs\(Math\.sin\(t \* 6 \+ a\.phase\)\)/.test(game) && (game.match(/a\.o\.position\.y = 0;/g) || []).length === 2, 'Game 3D: đội không nhảy khi vòng có lãi');
check(!/p\.ch\.position\.y \+= Math\.abs/.test(game), 'Game 3D: đội thắng sàn đấu không nhảy trên bục');
const vp3d = R('js/van-phong-doi-3d.js');
check(!/o\.s\.position\.y = o\.y0 \+ Math\.abs/.test(vp3d), 'Sa bàn văn phòng: nhân vật không nhún');
const css = R('css/van-phong.css');
check(!/\.san \.nv\{[^}]*translateY/.test(css) && !/\.doi-hinh figure:hover img[^}]*translateY/.test(css), 'Văn phòng đội: nhân vật không trồi theo cuộn, không nhảy khi rê chuột');

const DOI = [['ceo-tex', 'ceo-tex-v2'], ['cfo-tex', 'cfo-tex-v2'], ['cmo-tex', 'cmo-tex-v2'], ['coo-tex', 'coo-tex-v2'], ['sec-tex', 'sec-tex-v2'], ['lumina-tex', 'lumina-tex-v2'], ['tu-phan-tex-v3', 'tu-phan-tex-v4']];
const vp = R('van-phong-doi.html'), hub = R('hub-3d.html');
for (const [cu, moi] of DOI) {
  check(co('assets/character/solid/' + cu + '.webp') && co('assets/character/solid/' + moi + '.webp'), moi + '.webp có, ảnh gốc ' + cu + '.webp vẫn giữ');
  check(!vp.includes('solid/' + cu + '.webp') && vp.includes('solid/' + moi + '.webp') && vp3d.includes("anh: '" + moi + "'"), 'Văn phòng đội dùng ' + moi);
}
check(['ceo', 'cfo', 'cmo', 'coo', 'sec'].every(k => hub.includes(`solid/${k}-tex-v2.webp`) && !hub.includes(`solid/${k}-tex.webp`)), 'Bến BizOn 3D dùng ảnh -v2');
check(game.includes('solid/lumina-tex-v2.webp') && !game.includes('solid/lumina-tex.webp'), 'Game 3D: thẻ chào Lumina dùng ảnh -v2');
check(+(/CACHE = 'bizon-v(\d+)'/.exec(R('sw.js')) || [])[1] >= 865, 'sw.js ≥ bizon-v865');

let chromium; try { chromium = require('playwright').chromium; } catch (e) { chromium = require('playwright-core').chromium; }
(async () => {
  const b = await chromium.launch();
  try {
    const pg = await b.newPage();
    const doc = f => 'data:image/webp;base64,' + fs.readFileSync(path.join(goc, 'assets/character/solid', f + '.webp')).toString('base64');
    // viền: điểm mép (kề nền trong suốt) sáng gần trắng; lỗ: điểm trắng nằm trong vùng kiểm (tay – thân)
    const doDem = (src, hop) => pg.evaluate(async ([s, hop]) => {
      const im = new Image(); im.src = s; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
      const A = (px, py) => (px < 0 || py < 0 || px >= W || py >= H) ? 0 : d[(py * W + px) * 4 + 3];
      let vien = 0, mep = 0, lo = 0, mo = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 0 && d[i] < 12) mo++;
      for (let y = 0; y < H; y++) for (let x2 = 0; x2 < W; x2++) {
        const k = (y * W + x2) * 4; if (d[k + 3] < 60) continue;
        if (A(x2 - 1, y) < 10 || A(x2 + 1, y) < 10 || A(x2, y - 1) < 10 || A(x2, y + 1) < 10) { mep++; if (Math.min(d[k], d[k + 1], d[k + 2]) > 205) vien++; }
      }
      if (hop) for (let y = hop[1]; y <= hop[3]; y++) for (let x2 = hop[0]; x2 <= hop[2]; x2++) { const k = (y * W + x2) * 4; if (d[k + 3] > 100 && Math.min(d[k], d[k + 1], d[k + 2]) > 200 && d[k] - d[k + 2] < 40) lo++; }
      return { W, H, ti: vien / mep, lo, mo };
    }, [src, hop]);
    // vùng lỗ nền: cfo hai bên túi tiền, coo giữa tay phải và thân, sec giữa tay trái và thân
    const HOP = { 'cfo-tex': [50, 255, 65, 290], 'coo-tex': [175, 260, 200, 345], 'sec-tex': [47, 297, 70, 390] };
    for (const [cu, moi] of DOI) {
      const a = await doDem(doc(cu), HOP[cu]), m = await doDem(doc(moi), HOP[cu]);
      check(a.W === m.W && a.H === m.H, moi + ': giữ cỡ ' + a.W + ' × ' + a.H);
      // nhân vật áo trắng (Lumina, thầy Tu) mép áo vốn trắng: không đo viền trắng, chỉ đòi hết sương mờ quanh người
      if (!/lumina|tu-phan/.test(cu)) check(m.ti < 0.02 && a.ti > m.ti * 3, moi + ': viền trắng quanh mép ' + (a.ti * 100).toFixed(1) + ' % → ' + (m.ti * 100).toFixed(1) + ' %');
      check(a.mo > 0 && m.mo === 0, moi + ': sương mờ quanh người ' + a.mo + ' → ' + m.mo + ' điểm');
      if (HOP[cu]) check(a.lo > 100 && m.lo < 10, moi + ': lỗ nền trắng giữa tay và thân ' + a.lo + ' → ' + m.lo + ' điểm');
    }
  } finally { await b.close(); }
  if (fails) { console.error(fails + ' kiểm tra hỏng'); process.exit(1); }
})();
