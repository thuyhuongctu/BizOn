#!/usr/bin/env node
/* BizOn – dựng video «Một trái sầu riêng, cả vùng cùng sầu» (kịch bản docs/video/kich-ban-sau-rieng-ma-so-vung-trong.md).
 * Khổ ngang 1920×1080, 30 khung/giây; giọng đọc của tác giả (assets/video/src/sau-rieng-ma-so/<vi|en>/01…14.mp3),
 * nhạc nền không lời «Mekong Compass» (assets/audio/mekong-compass.mp3) tự hạ khi có lời; hình là 14 cảnh trong
 * scripts/video/sau-rieng/canh.html, vẽ tất định từng khung theo mốc giọng đọc.
 *
 * Dùng:  NODE_PATH=… node scripts/video/dung-sau-rieng.mjs --lang vi|en --out <thư mục> [--thu]
 *   --thu  chỉ chụp 1 ảnh giữa mỗi cảnh (xem bố cục), không dựng video
 * Kết quả: sau-rieng-ma-so-<lang>.mp4, -720p.mp4, -poster.jpg/.webp, phụ đề <tên>.vi.vtt và <tên>.en.vtt (cùng mốc câu).
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, extname, resolve, sep, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const LANG = arg('--lang') || 'vi', OUT = resolve(arg('--out') || join(ROOT, 'out-video')), THU = process.argv.includes('--thu');
const FPS = 30, LEAD = 0.35, GAP = 0.3, TAIL = 0.35;     // giây: trước câu đầu, giữa các câu, sau chữ cuối (rồi cắt đen)
const NAME = `sau-rieng-ma-so-${LANG}`;
mkdirSync(OUT, { recursive: true });
const tmp = join(OUT, NAME + '-tam'); rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true });
const ff = (...a) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' }); if (r.status !== 0) throw new Error('ffmpeg lỗi: ' + a.join(' ').slice(0, 200)); };
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout);

// ---------- lời đọc (VI và EN) từ tài liệu kịch bản, để làm phụ đề ----------
const doc = readFileSync(join(ROOT, 'docs/video/kich-ban-sau-rieng-ma-so-vung-trong.md'), 'utf8');
const rows = t => t.split('\n').map(l => l.split('|').map(x => x.trim())).filter(c => c.length > 3 && /^\d+$/.test(c[1]));
const LOI = {
  vi: rows(doc.slice(doc.indexOf('## 3. Lời đọc'), doc.indexOf('## 4.'))).map(c => c[3]),
  en: rows(doc.slice(doc.indexOf('## 7. Lời đọc tiếng Anh'))).map(c => c[2]),
};
if (LOI.vi.length !== 14 || LOI.en.length !== 14) throw new Error('Cần đủ 14 câu VI và EN trong tài liệu kịch bản');

// ---------- giọng: cắt khoảng lặng đầu/cuối, xếp theo mốc ----------
const SRC = join(ROOT, 'assets/video/src/sau-rieng-ma-so', LANG);
const moc = []; let t = LEAD;
for (let i = 1; i <= 14; i++) {
  const w = join(tmp, `g${i}.wav`);
  ff('-i', join(SRC, String(i).padStart(2, '0') + '.mp3'), '-af',
    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,aresample=48000', '-ac', '1', w);
  const d = dur(w); moc.push({ a: t, b: t + d, w }); t += d + GAP;
}
const TONG = moc[13].b + TAIL;                       // video kết ngay sau chữ cuối
console.log(`Giọng ${LANG}: ${moc.length} câu, tổng ${TONG.toFixed(2)} s`);

// ---------- máy chủ tĩnh + trang cảnh ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const p = resolve(ROOT, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT + sep) || !existsSync(p) || !statSync(p).isFile()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/scripts/video/sau-rieng/canh.html?lang=${LANG}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// cảnh bắt đầu sớm 0,1 s so với lời (hình phản ứng trước chữ vài khung)
await page.evaluate(([m, tong]) => window.datMoc(m, tong), [moc.map(m => ({ a: Math.max(0, m.a - 0.1), b: m.b })), TONG]);

if (THU) {
  for (let i = 0; i < 14; i++) { await page.evaluate(x => window.veKhung(x), (moc[i].a + moc[i].b) / 2 + 0.3); await page.screenshot({ path: join(OUT, `${NAME}-canh-${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 80 }); }
  await browser.close(); server.close(); rmSync(tmp, { recursive: true, force: true });
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log('Đã chụp 14 cảnh vào ' + OUT); process.exit(0);
}

// ---------- vẽ từng khung ----------
const N = Math.ceil(TONG * FPS);
for (let k = 0; k < N; k++) {
  await page.evaluate(x => window.veKhung(x), k / FPS);
  await page.screenshot({ path: join(tmp, `k${String(k).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
  if (k % 300 === 0) console.log(`  khung ${k}/${N}`);
}
await browser.close(); server.close();
if (errors.length) { console.error('Lỗi JS trên trang cảnh:\n' + errors.join('\n')); process.exit(1); }

// ---------- âm thanh: giọng theo mốc + nhạc nền tự hạ khi có lời ----------
const voice = join(tmp, 'giong.wav');
const ins = moc.flatMap(m => ['-i', m.w]);
const delays = moc.map((m, i) => `[${i}:a]adelay=${Math.round(m.a * 1000)}:all=1[d${i}]`).join(';');
ff(...ins, '-filter_complex', `${delays};${moc.map((_, i) => `[d${i}]`).join('')}amix=inputs=14:normalize=0,apad,atrim=0:${TONG.toFixed(3)}[v]`, '-map', '[v]', '-ar', '48000', '-ac', '1', voice);
const mixed = join(tmp, 'tron.wav');
const music = join(ROOT, 'assets/audio/mekong-compass.mp3');
// nhạc nền thấp hơn lời ~12 dB, hạ thêm khi có lời (sidechain), mở/đóng nhẹ
ff('-i', voice, '-i', music, '-filter_complex',
  `[1:a]atrim=0:${TONG.toFixed(3)},asetpts=PTS-STARTPTS,aresample=48000,volume=0.22,afade=t=in:d=0.6,afade=t=out:st=${(TONG - 0.6).toFixed(3)}:d=0.5[m];` +
  `[0:a]asplit=2[v1][v2];[m][v1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[v2][md]amix=inputs=2:normalize=0,aformat=channel_layouts=stereo[a]`,
  '-map', '[a]', '-ar', '48000', mixed);
const meas = spawnSync('ffmpeg', ['-hide_banner', '-i', mixed, '-af', 'loudnorm=I=-15:TP=-2.5:LRA=7:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const m = JSON.parse(meas.slice(meas.lastIndexOf('{'), meas.lastIndexOf('}') + 1));
const audio = join(tmp, 'am.m4a');
ff('-i', mixed, '-af', `loudnorm=I=-15:TP=-2.5:LRA=7:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`, '-c:a', 'aac', '-b:a', '160k', audio);

// ---------- ghép ----------
const final = join(OUT, NAME + '.mp4');
ff('-framerate', String(FPS), '-i', join(tmp, 'k%05d.jpg'), '-i', audio, '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p',
  '-c:a', 'copy', '-shortest', '-movflags', '+faststart', final);
ff('-i', final, '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart', join(OUT, NAME + '-720p.mp4'));
// ảnh bìa: giữa cảnh 1 (móc câu)
ff('-ss', ((moc[0].a + moc[0].b) / 2 + 0.6).toFixed(2), '-i', final, '-frames:v', '1', '-q:v', '3', join(OUT, NAME + '-poster.jpg'));
ff('-i', join(OUT, NAME + '-poster.jpg'), '-c:v', 'libwebp', '-quality', '80', join(OUT, NAME + '-poster.webp'));
// phụ đề VI + EN theo mốc câu của giọng này
const ts = x => { const h = Math.floor(x / 3600), mi = Math.floor(x / 60) % 60, s = x % 60; return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; };
for (const l of ['vi', 'en']) writeFileSync(join(OUT, `${NAME}.${l}.vtt`), 'WEBVTT\n\n' + moc.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(Math.min(c.b + GAP * 0.9, TONG))}\n${LOI[l][i]}\n`).join('\n'));
rmSync(tmp, { recursive: true, force: true });
console.log(`Xong: ${final} (${TONG.toFixed(1)} s, ${N} khung)`);
