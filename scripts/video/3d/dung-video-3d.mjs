#!/usr/bin/env node
/* BizOn – bộ dựng video dọc 3D (đặc tả specs/004-video-ngan-3d, câu chuyện 1).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Đọc một kế hoạch cảnh quay (tệp .mjs xuất mặc định { ten, fps, nhanVat, canh }), mở scripts/video/3d/canh-3d.html trong
 * Chromium (Playwright), vẽ đúng từng khung bằng veKhung(n), chụp rồi ghép mp4 bằng ffmpeg. Không gọi dịch vụ tạo video
 * nào, không tốn phí theo clip. Máy không có GPU thì Chromium vẽ bằng SwiftShader: chậm hơn nhưng ra cùng khung hình.
 *
 * Dùng:
 *   NODE_PATH=… node scripts/video/3d/dung-video-3d.mjs <kế-hoạch.mjs> --out <thư mục> [tùy chọn]
 *     --rong 1080 --cao 1920   khổ khung (mặc định dọc 1080 × 1920)
 *     --tu N --den M           chỉ dựng khung N … M−1 (để thử nhanh)
 *     --thu                    chỉ chụp một ảnh ở giữa mỗi cảnh (duyệt bố cục), không ghép video
 *     --giong <tệp âm thanh>   ghép tiếng vào video (giọng đã trộn sẵn); không có thì video câm
 *     --giu-khung              giữ thư mục khung PNG (mặc định xoá sau khi ghép)
 * Kết quả: <out>/<ten>.mp4 (H.264, yuv420p, 30 khung/giây).
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync, rmSync } from 'node:fs';
import { join, extname, resolve, sep, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const argv = process.argv.slice(2);
const arg = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const co = k => argv.includes(k);
const loi = msg => { console.error('Lỗi: ' + msg); process.exit(2); };

const keTep = argv[0] && !argv[0].startsWith('--') ? resolve(argv[0]) : null;
if (!keTep || !existsSync(keTep)) loi('cần đường dẫn tới kế hoạch cảnh quay (.mjs). Ví dụ: node scripts/video/3d/dung-video-3d.mjs scripts/video/3d/ke-hoach-thu.mjs --out out');
const OUT = resolve(arg('--out') || join(ROOT, 'out-video'));
const W = +(arg('--rong') || 1080), H = +(arg('--cao') || 1920);
const THU = co('--thu'), GIU = co('--giu-khung'), GIONG = arg('--giong') ? resolve(arg('--giong')) : null;

// ---------- kiểm kế hoạch trước khi mở trình duyệt ----------
const ke = (await import(pathToFileURL(keTep).href)).default;
if (!ke || !Array.isArray(ke.canh) || !ke.canh.length) loi('kế hoạch phải xuất mặc định { ten, nhanVat, canh: [...] } và có ít nhất một cảnh');
const TEN = ke.ten || basename(keTep).replace(/\.mjs$/, ''), FPS = ke.fps || 30;
for (const [id, p] of Object.entries(ke.nhanVat || {})) if (!existsSync(join(ROOT, p))) loi(`nhân vật «${id}»: không thấy tệp ${p}`);
for (const c of ke.canh) {
  if (!(c.dai > 0)) loi(`cảnh «${c.ten}»: cần thời lượng dai > 0 (giây)`);
  if (!c.may || !c.may.tu || !c.may.nhin) loi(`cảnh «${c.ten}»: cần máy quay { tu, nhin }`);
  const dung = !c.may.den && !c.may.nhinDen && !c.may.fovDen;
  if (dung) loi(`cảnh «${c.ten}»: máy quay phải chuyển động (thêm den, nhinDen hoặc fovDen), không để hình đứng yên`);
  for (const p of c.nguoi || []) if (!ke.nhanVat || !ke.nhanVat[p.id]) loi(`cảnh «${c.ten}»: nhân vật «${p.id}» chưa khai trong nhanVat`);
  if (c.phong && !existsSync(join(ROOT, c.phong))) loi(`cảnh «${c.ten}»: không thấy ảnh phông ${c.phong}`);
}
if (GIONG && !existsSync(GIONG)) loi('không thấy tệp giọng ' + GIONG);

// ---------- máy chủ tĩnh: gốc kho, cộng một đường dẫn riêng cho kế hoạch (kế hoạch có thể nằm ngoài kho) ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const p = u === '/__ke-hoach.mjs' ? keTep : resolve(ROOT, '.' + u);
  if (p !== keTep && (!p.startsWith(ROOT + sep) || !existsSync(p) || !statSync(p).isFile())) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const dong = async (b, ma = 0) => { try { await b.close(); } catch (e) {} server.close(); process.exit(ma); };

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
const loiTrang = []; page.on('pageerror', e => loiTrang.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/scripts/video/3d/canh-3d.html?w=${W}&h=${H}&ke=/__ke-hoach.mjs`, { waitUntil: 'load' });
const ok = await page.evaluate(() => window.__san);
if (!ok || loiTrang.length) { console.error('Lỗi: ' + (await page.evaluate(() => window.__loi) || loiTrang.join('\n'))); await dong(browser, 2); }
const tt = await page.evaluate(() => window.__thongTin);
console.log(`Kế hoạch «${TEN}»: ${tt.canh.length} cảnh, ${tt.tong} khung (${(tt.tong / FPS).toFixed(2)} giây), khổ ${W} × ${H}`);
mkdirSync(OUT, { recursive: true });

if (THU) {
  for (const c of tt.canh) { await page.evaluate(n => window.veKhung(n), Math.floor((c.tu + c.den) / 2)); await page.screenshot({ path: join(OUT, `${TEN}-${c.ten}.jpg`), type: 'jpeg', quality: 90 }); }
  console.log('Đã chụp ' + tt.canh.length + ' ảnh duyệt bố cục vào ' + OUT); await dong(browser, 0);
}

// ---------- vẽ và chụp từng khung ----------
const tu = Math.max(0, +(arg('--tu') || 0)), den = Math.min(tt.tong, +(arg('--den') || tt.tong));
const KHUNG = join(OUT, 'khung'); rmSync(KHUNG, { recursive: true, force: true }); mkdirSync(KHUNG, { recursive: true });
const bd = Date.now();
for (let n = tu; n < den; n++) {
  await page.evaluate(x => window.veKhung(x), n);
  await page.screenshot({ path: join(KHUNG, String(n - tu).padStart(6, '0') + '.png') });
  if ((n - tu) % 150 === 0) console.log(`  khung ${n - tu}/${den - tu}`);
}
const giay = (Date.now() - bd) / 1000;
console.log(`Vẽ ${den - tu} khung trong ${giay.toFixed(1)} giây (${((den - tu) / giay).toFixed(2)} khung/giây)`);
if (loiTrang.length) { console.error('Lỗi: ' + loiTrang.join('\n')); await dong(browser, 2); }
try { await browser.close(); } catch (e) {} server.close();

// ---------- ghép mp4 ----------
const mp4 = join(OUT, TEN + '.mp4');
const vao = ['-framerate', String(FPS), '-i', join(KHUNG, '%06d.png')];
const tieng = GIONG ? ['-i', GIONG, '-c:a', 'aac', '-b:a', '160k', '-shortest'] : [];
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...vao, ...tieng, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', mp4], { stdio: 'inherit' });
if (r.status !== 0) loi('ffmpeg không ghép được video');
if (!GIU) rmSync(KHUNG, { recursive: true, force: true });
console.log('Xong: ' + mp4);
process.exit(0);
