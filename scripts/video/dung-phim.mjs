#!/usr/bin/env node
/* BizOn – dựng một tập phim «Đưa trái ra biển» (đặc tả 008) bằng HyperFrames (HTML → MP4, Apache-2.0).
 *
 * Đầu vào:
 *   - scripts/video/dua-trai-ra-bien/tap-NN.ghep.json: đường dẫn kịch bản, phân cảnh, giọng, nhạc, chữ trên hình từng câu;
 *   - kịch bản (docs/phim/tap-NN-kich-ban.md): mốc, lời VI/EN, cảnh của từng câu;
 *   - phân cảnh (docs/phim/tap-NN-phan-canh.md): cảnh nào là NV (chị dựng bằng công cụ video), cảnh nào là SL (em dựng);
 *   - giọng Lumina theo câu: assets/video/src/dua-trai-ra-bien/tap-NN/<vi|en>/NN.mp3;
 *   - cảnh NV: thư mục --canh, tệp <mã cảnh>.mp4 (hoặc C17-1.mp4, C17-2.mp4… nối nhau). Cảnh NV không đưa vào kho.
 * Hình: scripts/video/dua-trai-ra-bien/canh.html (cảnh số liệu, bong bóng thoại, đồng hồ) + video cảnh NV,
 *   kết xuất bằng `npx hyperframes@0.9.86 render` trên máy, tắt gửi dữ liệu sử dụng (HYPERFRAMES_NO_TELEMETRY=1),
 *   không dùng dịch vụ đám mây hay nút chia sẻ của HeyGen.
 * Tiếng: giọng xếp theo mốc câu + nhạc nền gốc BizOn tự hạ khi có lời, chuẩn độ to loudnorm −16 LUFS.
 *
 * Dùng:  NODE_PATH=… node scripts/video/dung-phim.mjs --tap 01 --lang vi|en [--out thư-mục] [--canh thư-mục-cảnh-NV] [--nhap] [--chi-html]
 *   --nhap      chưa đủ giọng hay cảnh NV: căn giờ theo mốc kịch bản, cảnh NV thiếu thay bằng thẻ chờ (tên tệp thêm «-nhap»)
 *   --chi-html  chỉ ghi thư mục dựng (index.html cho HyperFrames), không kết xuất – dùng cho test và xem trước
 *   --tho 0..1  giữ bao nhiêu phần khoảng dư giữa giọng thật và mốc kịch bản (mặc định 0,5)
 *   --phu-de vi|en  in lời Lumina thành phụ đề trên hình (bản duyệt nhịp, chiếu lớp); bản phát hành dùng .vtt
 * Kết quả: dua-trai-ra-bien-NN-<lang>.mp4, -720p.mp4, -poster.jpg/.webp, phụ đề .vi.vtt và .en.vtt (cùng mốc câu).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, copyFileSync } from 'node:fs';
import { join, resolve, dirname, isAbsolute } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const HF = 'hyperframes@0.9.86';
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const TAP = (arg('--tap') || '01').padStart(2, '0'), LANG = arg('--lang') === 'en' ? 'en' : 'vi';
const NHAP = process.argv.includes('--nhap'), CHI_HTML = process.argv.includes('--chi-html');
const PHU_DE = ['vi', 'en'].includes(arg('--phu-de')) ? arg('--phu-de') : null; // in lời Lumina lên hình (chỉ để duyệt; bản phát hành dùng .vtt)
const OUT = resolve(arg('--out') || join(ROOT, 'artifacts', 'phim'));
const CANH_DIR = resolve(arg('--canh') || join(ROOT, 'assets/video/src/dua-trai-ra-bien', 'tap-' + TAP, 'canh'));
const NAME = `dua-trai-ra-bien-${TAP}-${LANG}` + (NHAP ? '-nhap' : '') + (PHU_DE ? '-phu-de-' + PHU_DE : '');
const LEAD = 0.3, GAP = 0.35, TAIL = 0.6, FPS = 30;
const THO = arg('--tho') != null ? Math.min(1, Math.max(0, +arg('--tho'))) : 0.5;
const R = p => join(ROOT, p), read = p => readFileSync(R(p), 'utf8');
const ff = (...a) => { const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' }); if (r.status !== 0) throw new Error('ffmpeg lỗi: ' + a.join(' ').slice(0, 200)); };
const dur = f => parseFloat(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout);
const giay = m => m.split(':').map(Number).reduce((t, x) => t * 60 + x, 0);

// ---------- kịch bản, phân cảnh, tệp ghép ----------
const CFG = JSON.parse(read(`scripts/video/dua-trai-ra-bien/tap-${TAP}.ghep.json`));
const rows = (t, n) => t.split('\n').filter(l => l.startsWith('|')).map(l => l.split('|').slice(1, -1).map(x => x.trim()))
  .filter(c => c.length >= n && /^(\d+|C\d+)$/.test(c[0]));
const KB = rows(read(CFG.kich_ban), 8).map(c => ({ so: +c[0], moc: giay(c[1]), vi: c[3], en: c[4], canh: c[6] }));
const PC = new Map(rows(read(CFG.phan_canh), 8).map(c => [c[0], { loai: c[1], khung: c[4], anh: (c[6].match(/assets\/[^`\s,]+/g) || []) }]));
for (const k of KB) if (!PC.has(k.canh)) throw new Error(`Câu ${k.so}: cảnh ${k.canh} không có trong bảng phân cảnh`);

// ---------- giọng và mốc từng câu ----------
mkdirSync(OUT, { recursive: true });
const tmp = join(OUT, NAME + '-tam');
if (!CHI_HTML) { rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true }); }
const coLoi = k => k[LANG] && k[LANG] !== '—';
const giongCua = k => R(CFG.giong.replace('{lang}', LANG).replace('{so}', String(k.so).padStart(2, '0')));
const thieu = KB.filter(k => coLoi(k) && !existsSync(giongCua(k))).map(k => k.so);
if (thieu.length && !NHAP) throw new Error(`Thiếu giọng ${LANG} các câu ${thieu.join(', ')} (chạy với --nhap để dựng bản xem nhịp theo mốc kịch bản)`);
const CAU = [];
if (NHAP) { // theo mốc kịch bản; câu cuối dài cau_cuoi_giay
  KB.forEach((k, i) => CAU.push({ so: k.so, a: k.moc, b: i + 1 < KB.length ? KB[i + 1].moc : k.moc + CFG.cau_cuoi_giay, canh: k.canh }));
} else {
  let t = LEAD;
  KB.forEach((k, i) => {
    let d;
    if (coLoi(k)) {
      const w = join(tmp, `g${k.so}.wav`);
      ff('-i', giongCua(k), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,aresample=48000', '-ac', '1', w);
      d = dur(w); CAU.push({ so: k.so, a: t, loiHet: t + d, w, canh: k.canh });
      // Khoảng thở: giọng thật thường nhanh hơn mốc kịch bản; giữ lại một phần (--tho, mặc định 0,5) phần dư
      // để cảnh số liệu kịp hiện và người xem kịp đọc bong bóng thoại.
      const ke = (i + 1 < KB.length ? KB[i + 1].moc : k.moc + CFG.cau_cuoi_giay) - k.moc;
      t += d + GAP + THO * Math.max(0, ke - d - GAP);
    } else { // câu không lời (chữ chạy): giữ thời lượng dự kiến trong kịch bản
      d = (i + 1 < KB.length ? KB[i + 1].moc : k.moc + CFG.cau_cuoi_giay) - k.moc;
      CAU.push({ so: k.so, a: t, canh: k.canh }); t += d;
    }
  });
  CAU.forEach((c, i) => { c.b = i + 1 < CAU.length ? CAU[i + 1].a : (c.loiHet || c.a) + TAIL; });
}
const TONG = CAU[CAU.length - 1].b;

// ---------- đoạn: các câu liền nhau cùng một cảnh ----------
const DOAN = [];
for (const c of CAU) {
  const cuoi = DOAN[DOAN.length - 1];
  if (cuoi && cuoi.canh === c.canh) { cuoi.cau.push(c); cuoi.b = c.b; continue; }
  const pc = PC.get(c.canh);
  DOAN.push({ canh: c.canh, loai: pc.loai, a: c.a, b: c.b, cau: [c], mo_ta: pc.khung, anh: pc.anh.filter(a => !/\/hc\/durian\//.test(a)) });
}

// ---------- thư mục dựng cho HyperFrames ----------
// HyperFrames chỉ phục vụ tệp trong thư mục dự án, nên ảnh, phông chữ và video được chép vào BUILD/goc/ giữ nguyên
// đường dẫn tương đối như trong kho; trang dùng tiền tố «goc/» thay cho «../../../».
const BUILD = join(OUT, NAME), GOC = join(BUILD, 'goc');
rmSync(BUILD, { recursive: true, force: true }); mkdirSync(BUILD, { recursive: true });
const chep = (p, dich = p) => { const d = join(GOC, dich); mkdirSync(dirname(d), { recursive: true }); copyFileSync(isAbsolute(p) ? p : R(p), d); return 'goc/' + dich; };
let video = '', thieuNV = [];
DOAN.forEach(d => {
  if (d.loai !== 'NV') return;
  const co = re => (existsSync(CANH_DIR) ? readdirSync(CANH_DIR).filter(f => re.test(f)).sort((x, y) => x.localeCompare(y, 'en', { numeric: true })) : []);
  const tep = co(new RegExp(`^${d.canh}(-\\d+)?\\.mp4$`));
  if (!tep.length) {
    // Chưa có video: dùng khung hình tĩnh (C05.png, C10-1.png, C10-2.png…) chia đều thời lượng, máy quay đẩy nhẹ
    const anh = co(new RegExp(`^${d.canh}(-\\d+)?\\.(png|jpe?g|webp)$`, 'i'));
    if (!anh.length) { thieuNV.push(d.canh); return; }
    const k = (d.b - d.a) / anh.length;
    d.tinh = anh.map((f, i) => ({ src: chep(join(CANH_DIR, f), 'canh/' + f), a: d.a + i * k, b: d.a + (i + 1) * k }));
    return;
  }
  d.video = true; let t = d.a;
  tep.forEach((f, i) => {
    const p = join(CANH_DIR, f), het = i === tep.length - 1 ? d.b : Math.min(d.b, t + dur(p));
    video += `<video class="clip" data-start="${t.toFixed(3)}" data-duration="${(het - t).toFixed(3)}" data-track-index="${i % 2}" src="${chep(p, 'canh/' + f)}" muted playsinline></video>\n`;
    t = het;
  });
});
if (thieuNV.length && !NHAP) throw new Error(`Thiếu cảnh nhân vật ${thieuNV.join(', ')} trong ${CANH_DIR} (chạy với --nhap để thay bằng thẻ chờ)`);
const GHEP = {
  lang: LANG, tong: +TONG.toFixed(3),
  doan: DOAN.map(d => ({ canh: d.canh, loai: d.loai, a: d.a, b: d.b, video: !!d.video, tinh: d.tinh || null, mo_ta: d.mo_ta, anh: d.anh, cau: d.cau.map(c => ({ so: c.so, a: c.a, b: c.b })) })),
  cau: CAU.map(c => ({ so: c.so, a: c.a, b: c.b, chu: CFG.chu[c.so] || [] })),
  phu_de: PHU_DE ? CAU.map((c, i) => ({ a: c.a + 0.1, b: c.loiHet ? Math.min(c.b, c.loiHet + GAP * 0.9) : c.b, t: KB[i][PHU_DE] })).filter(x => x.t && x.t !== '—') : [],
};
const MAU = read('scripts/video/dua-trai-ra-bien/canh.html');
const tepAnh = new Set([...MAU.matchAll(/assets\/[\w\-/]+\.(?:webp|png|jpg)/g)].map(x => x[0]));
DOAN.forEach(d => d.anh.forEach(a => tepAnh.add(a)));
tepAnh.forEach(a => chep(a));
const css = read('css/bizon-clay-fonts.css'); chep('css/bizon-clay-fonts.css');
for (const u of css.matchAll(/url\('?\.\.\/([^')]+)'?\)/g)) chep(u[1]);
let html = MAU
  .replace('<!--VIDEO-->', video)
  .replace('<!--GHEP-->', `<script>window.GHEP = ${JSON.stringify(GHEP).replace(/</g, '\\u003c')};</script>`)
  .replace('data-duration="60"', `data-duration="${TONG.toFixed(3)}"`);
// GSAP nằm ngoài thư mục dựng: chép thẳng vào trang (HyperFrames không chạy .js ở ngoài thư mục dự án)
const gsap = read('js/vendor/gsap.min.js');
html = html.replace('<script src="../../../js/vendor/gsap.min.js"></script>', () => `<script>${gsap}</script>`).split('../../../').join('goc/');
writeFileSync(join(BUILD, 'index.html'), html);
writeFileSync(join(BUILD, 'meta.json'), JSON.stringify({ id: NAME, name: NAME }, null, 2) + '\n');
console.log(`Thư mục dựng: ${BUILD} (${DOAN.length} đoạn, ${TONG.toFixed(1)} s${thieuNV.length ? ', cảnh NV chờ: ' + thieuNV.join(' ') : ''})`);
if (CHI_HTML) process.exit(0);

// ---------- kết xuất hình bằng HyperFrames ----------
const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1', DO_NOT_TRACK: '1', HYPERFRAMES_SKIP_SKILLS: '1' };
// Ưu tiên chrome-headless-shell (chụp khung bằng BeginFrame, nhanh) kể cả khi máy đã đặt PUPPETEER_EXECUTABLE_PATH
// tới Chrome đầy đủ: Chrome đầy đủ phải chụp màn hình từng khung, chậm và có lúc treo. Muốn dùng trình duyệt khác: --chrome <đường dẫn>.
const SHELL = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (arg('--chrome')) env.PUPPETEER_EXECUTABLE_PATH = arg('--chrome');
else if (existsSync(SHELL)) env.PUPPETEER_EXECUTABLE_PATH = SHELL;
const hinh = join(tmp, 'hinh.mp4');
const r = spawnSync('npx', ['--yes', HF, 'render', BUILD, '-o', hinh, '--fps', String(FPS), '--quality', NHAP ? 'draft' : 'delivery', '--workers', arg('--workers') || '1', '--no-wait', '--quiet'], { stdio: 'inherit', env });
if (r.status !== 0 || !existsSync(hinh)) throw new Error('HyperFrames kết xuất lỗi');

// ---------- tiếng: giọng theo mốc + nhạc nền tự hạ khi có lời, chuẩn độ to ----------
const giongWav = join(tmp, 'giong.wav'), coGiong = CAU.filter(c => c.w);
if (coGiong.length) {
  const ins = coGiong.flatMap(c => ['-i', c.w]);
  const dl = coGiong.map((c, i) => `[${i}:a]adelay=${Math.round(c.a * 1000)}:all=1[d${i}]`).join(';');
  ff(...ins, '-filter_complex', `${dl};${coGiong.map((_, i) => `[d${i}]`).join('')}amix=inputs=${coGiong.length}:normalize=0,apad,atrim=0:${TONG.toFixed(3)}[v]`, '-map', '[v]', '-ar', '48000', '-ac', '1', giongWav);
} else ff('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', TONG.toFixed(3), giongWav);
const tron = join(tmp, 'tron.wav');
ff('-i', giongWav, '-stream_loop', '-1', '-i', R(CFG.nhac), '-filter_complex',
  `[1:a]atrim=0:${TONG.toFixed(3)},asetpts=PTS-STARTPTS,aresample=48000,volume=0.22,afade=t=in:d=0.8,afade=t=out:st=${(TONG - 1.2).toFixed(3)}:d=1[m];` +
  `[0:a]asplit=2[v1][v2];[m][v1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[v2][md]amix=inputs=2:normalize=0,aformat=channel_layouts=stereo[a]`,
  '-map', '[a]', '-ar', '48000', tron);
const do1 = spawnSync('ffmpeg', ['-hide_banner', '-i', tron, '-af', 'loudnorm=I=-16:TP=-2:LRA=7:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const m = JSON.parse(do1.slice(do1.lastIndexOf('{'), do1.lastIndexOf('}') + 1));
const am = join(tmp, 'am.m4a');
ff('-i', tron, '-af', `loudnorm=I=-16:TP=-2:LRA=7:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`, '-c:a', 'aac', '-b:a', '160k', am);

// ---------- ghép, bản 720p, ảnh bìa, phụ đề ----------
const final = join(OUT, NAME + '.mp4');
ff('-i', hinh, '-i', am, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p',
  '-c:a', 'copy', '-shortest', '-movflags', '+faststart', final);
ff('-i', final, '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart', join(OUT, NAME + '-720p.mp4'));
const tua = DOAN.find(d => d.canh === 'C02') || DOAN[0];
ff('-ss', ((tua.a + tua.b) / 2 + 0.5).toFixed(2), '-i', final, '-frames:v', '1', '-q:v', '3', join(OUT, NAME + '-poster.jpg'));
ff('-i', join(OUT, NAME + '-poster.jpg'), '-c:v', 'libwebp', '-quality', '80', join(OUT, NAME + '-poster.webp'));
const ts = x => { const h = Math.floor(x / 3600), mi = Math.floor(x / 60) % 60, s = x % 60; return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; };
for (const l of ['vi', 'en']) {
  const cues = CAU.map((c, i) => ({ c, k: KB[i] })).filter(({ k }) => k[l] && k[l] !== '—');
  writeFileSync(join(OUT, `${NAME}.${l}.vtt`), 'WEBVTT\n\n' + cues.map(({ c, k }, i) => `${i + 1}\n${ts(c.a)} --> ${ts(Math.min(c.loiHet ? c.loiHet + GAP * 0.9 : c.b, c.b))}\n${k[l]}\n`).join('\n'));
}
rmSync(tmp, { recursive: true, force: true });
console.log(`Xong: ${final} (${TONG.toFixed(1)} s)`);
