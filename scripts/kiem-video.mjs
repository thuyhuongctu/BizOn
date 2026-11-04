#!/usr/bin/env node
/* BizOn – kiểm một video trước khi đưa lên trang: thông số, độ to âm thanh, đoạn im, khung đen/trắng giữa chừng,
 * khung hỏng một hình (glitch), đoạn đứng hình, số lần cắt cảnh, độ dài tiếng và hình có khớp nhau không.
 * Phỏng theo scripts/short_qa.py của «Claude Animated Shorts» (Mr omi, giấy phép MIT – xem THIRD-PARTY-NOTICES.md mục 6),
 * viết lại bằng Node không cần thư viện ngoài (chỉ cần ffmpeg/ffprobe trên máy).
 *
 * Dùng:  node scripts/kiem-video.mjs <video.mp4> [--out thư-mục] [--sheets] [--json] [--freeze 12]
 *        [--planned 120-124,300-306]   (khung cố ý: chớp trắng, chuyển cảnh mờ – không tính là lỗi)
 *   --out    ghi report.md (và report.json) vào thư mục
 *   --sheets thêm tấm ghép khung hình (mỗi ô 0,5 giây) vào thư mục --out để nhìn nhanh cả video
 * Mã thoát 1 khi có LỖI (khung đen/hỏng giữa video, tiếng vỡ, tiếng và hình lệch nhau); CẢNH BÁO không làm hỏng mã thoát. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

// Ngưỡng (giải thích ngắn để người sau chỉnh có căn cứ)
export const LIMITS = {
  lufs: [-17, -13],      // web/mạng xã hội: khoảng −14 đến −16 LUFS; ngoài [−17, −13] thì nhắc
  truePeakWarn: -1.0,    // đỉnh thật > −1 dBTP dễ vỡ tiếng sau khi nền tảng nén lại
  truePeakError: 0.0,    // > 0 dBTP là đã vỡ tiếng
  blackLuma: 0.04,       // độ sáng trung bình dưới mức này coi là khung đen
  whiteLuma: 0.93,
  edgeSec: 0.6,          // khung đen ở 0,6 giây đầu/cuối là mở/đóng bằng màn đen, không phải lỗi
  longSpanSec: 0.4,      // đen/trắng kéo dài ≥ 0,4 s là chuyển cảnh qua màn đen hay cảnh nền trắng cố ý; ngắn hơn mới là chớp/lỗi
  freezeDiff: 0.02,      // chênh lệch trung bình giữa hai khung (thang 0–255) dưới mức này coi là đứng yên
  cutRatio: 4, cutMin: 12, // cắt cảnh: chênh lệch > 4 × trung vị quanh đó và > 12
  avMismatchSec: 0.5,    // tiếng ngắn/dài hơn hình quá 0,5 giây
  leadSilenceSec: 1.0,   // im lặng đầu video dài hơn 1 giây thì nhắc
};

const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: opts.binary ? 'buffer' : 'utf8', maxBuffer: 1 << 30 });

/** Gom các chỉ số liên tiếp thành đoạn [đầu, cuối]. */
export function spans(idx) {
  const out = [];
  for (const i of idx) { const s = out[out.length - 1]; if (s && i === s[1] + 1) s[1] = i; else out.push([i, i]); }
  return out;
}

/** Phân tích chuỗi khung (mỗi khung là Uint8Array RGB). Trả về các chỉ số và danh sách vấn đề. Tách riêng để test không cần ffmpeg. */
export function analyseFrames(frames, { fps = 30, planned = new Set(), freezeFrames = 12 } = {}) {
  const n = frames.length, L = LIMITS;
  const luma = frames.map(f => { let s = 0; for (let i = 0; i < f.length; i += 3) s += 0.2126 * f[i] + 0.7152 * f[i + 1] + 0.0722 * f[i + 2]; return s / (f.length / 3) / 255; });
  const d = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
  const diff = []; for (let i = 1; i < n; i++) diff.push(d(frames[i - 1], frames[i]));   // diff[i-1] = khung i so với i-1
  const edge = Math.round(L.edgeSec * fps);
  const inMid = i => i >= edge && i < n - edge && !planned.has(i);
  const long = Math.round(L.longSpanSec * fps), isLong = ([a, b]) => b - a + 1 >= long;
  const blackAll = spans(luma.map((v, i) => v < L.blackLuma && inMid(i) ? i : -1).filter(i => i >= 0));
  const whiteAll = spans(luma.map((v, i) => v > L.whiteLuma && inMid(i) ? i : -1).filter(i => i >= 0));
  // Khung hỏng: khác hẳn cả khung trước lẫn khung sau, trong khi hai khung kề nhau lại giống nhau (một hình lọt vào).
  const glitch = [];
  for (let i = 1; i < n - 1; i++) {
    if (planned.has(i)) continue;
    const a = diff[i - 1], b = diff[i];
    if (a > L.cutMin && b > L.cutMin && d(frames[i - 1], frames[i + 1]) < 0.35 * Math.min(a, b)) glitch.push(i);
  }
  const med = diff.map((_, i) => { const w = diff.slice(Math.max(0, i - 8), i + 9).sort((x, y) => x - y); return w[w.length >> 1]; });
  const cuts = diff.map((v, i) => v > L.cutRatio * med[i] + 1 && v > L.cutMin ? i + 1 : -1).filter(i => i >= 0 && !glitch.includes(i) && !glitch.includes(i - 1));
  const frozen = []; let st = null;
  for (let i = 0; i <= diff.length; i++) {
    if (i < diff.length && diff[i] < L.freezeDiff) { if (st === null) st = i; }
    else { if (st !== null && i - st >= freezeFrames) frozen.push([st, i]); st = null; }
  }
  const held = diff.filter(v => v < 0.3).length;
  const black = blackAll.filter(s => !isLong(s)), fades = blackAll.filter(isLong);
  const white = whiteAll.filter(s => !isLong(s) && !(s[0] === s[1] && glitch.includes(s[0])));
  return { n, luma, diff, black, fades, white, glitch, cuts, frozen, heldPct: n > 1 ? Math.round(held / diff.length * 100) : 0 };
}

function probe(vid) {
  const r = run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels,duration:format=duration,size', '-of', 'json', vid]);
  if (r.status !== 0) throw new Error('ffprobe không đọc được tệp: ' + (r.stderr || '').trim());
  return JSON.parse(r.stdout);
}

function loudness(vid) {
  const e = run('ffmpeg', ['-hide_banner', '-nostats', '-i', vid, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr || '';
  const tail = e.slice(e.lastIndexOf('Summary:'));
  const num = re => { const m = tail.match(re); return m ? parseFloat(m[1]) : null; };
  return { I: num(/I:\s+(-?[\d.]+) LUFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/), peak: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/) };
}

function silences(vid) {
  const e = run('ffmpeg', ['-hide_banner', '-nostats', '-i', vid, '-map', '0:a:0', '-af', 'silencedetect=n=-45dB:d=0.5', '-f', 'null', '-']).stderr || '';
  const out = []; let s = null;
  for (const l of e.split('\n')) {
    const a = l.match(/silence_start: (-?[\d.]+)/), b = l.match(/silence_end: ([\d.]+)/);
    if (a) s = Math.max(0, parseFloat(a[1]));
    if (b && s !== null) { out.push([s, parseFloat(b[1])]); s = null; }
  }
  if (s !== null) out.push([s, null]);
  return out;
}

function readFrames(vid, w, h) {
  const r = run('ffmpeg', ['-v', 'error', '-i', vid, '-vf', `scale=${w}:${h}:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { binary: true });
  if (r.status !== 0) throw new Error('ffmpeg không giải mã được hình');
  const sz = w * h * 3, frames = [];
  for (let o = 0; o + sz <= r.stdout.length; o += sz) frames.push(new Uint8Array(r.stdout.buffer, r.stdout.byteOffset + o, sz));
  return frames;
}

const fmtT = (f, fps) => (f / fps).toFixed(2) + ' s';
const parsePlanned = s => { const set = new Set(); for (const p of (s || '').split(',').filter(Boolean)) { const [a, b] = p.split('-').map(Number); for (let i = a; i <= (b ?? a); i++) set.add(i); } return set; };

export function check(vid, opt = {}) {
  const pr = probe(vid);
  const v = pr.streams.find(s => s.codec_type === 'video');
  if (!v) throw new Error('Tệp không có hình');
  const au = pr.streams.find(s => s.codec_type === 'audio');
  const [fn, fd] = v.r_frame_rate.split('/').map(Number); const fps = fn / (fd || 1);
  const dur = parseFloat(pr.format.duration);
  const W = 96, H = Math.max(2, Math.round(W * v.height / v.width / 2) * 2);
  const A = analyseFrames(readFrames(vid, W, H), { fps, planned: parsePlanned(opt.planned), freezeFrames: opt.freeze || 12 });
  const errors = [], warns = [], info = [];
  info.push(`Hình ${v.width}×${v.height}, ${Math.round(fps * 100) / 100} khung/giây, ${A.n} khung, ${dur.toFixed(2)} s, ${v.codec_name}; ${(pr.format.size / 1048576).toFixed(1)} MB`);
  let loud = null, sil = [];
  if (!au) warns.push('Không có tiếng (nếu video cần lời đọc hay nhạc thì thiếu luồng âm thanh)');
  else {
    info.push(`Tiếng ${au.codec_name} ${au.sample_rate} Hz, ${au.channels} kênh`);
    loud = loudness(vid); sil = silences(vid);
    info.push(`Độ to ${loud.I} LUFS, dải động ${loud.LRA} LU, đỉnh thật ${loud.peak} dBTP`);
    if (loud.I !== null && (loud.I < LIMITS.lufs[0] || loud.I > LIMITS.lufs[1])) warns.push(`Độ to ${loud.I} LUFS nằm ngoài khoảng ${LIMITS.lufs[0]}…${LIMITS.lufs[1]} (web: −14 đến −16)`);
    if (loud.peak !== null && loud.peak > LIMITS.truePeakError) errors.push(`Đỉnh thật ${loud.peak} dBTP > 0: tiếng đã vỡ`);
    else if (loud.peak !== null && loud.peak > LIMITS.truePeakWarn) warns.push(`Đỉnh thật ${loud.peak} dBTP > −1: dễ vỡ tiếng khi nền tảng nén lại`);
    const ad = parseFloat(au.duration), vd = parseFloat(v.duration);
    if (ad && vd && Math.abs(ad - vd) > LIMITS.avMismatchSec) errors.push(`Tiếng dài ${ad.toFixed(2)} s, hình dài ${vd.toFixed(2)} s: lệch ${Math.abs(ad - vd).toFixed(2)} s`);
    const lead = sil.find(s => s[0] === 0);
    if (lead && (lead[1] ?? dur) > LIMITS.leadSilenceSec) warns.push(`Im lặng ${(lead[1] ?? dur).toFixed(2)} s ở đầu video`);
    const mid = sil.filter(s => s[0] > 0.5 && s[1] !== null && s[1] < dur - 0.5 && s[1] - s[0] >= 1.5);
    if (mid.length) warns.push('Đoạn im giữa video ≥ 1,5 s: ' + mid.map(s => `${s[0].toFixed(1)}–${s[1].toFixed(1)} s`).join(', '));
  }
  for (const [a, b] of A.black) errors.push(`Khung đen giữa video: khung ${a}–${b} (${fmtT(a, fps)})`);
  if (A.fades.length) info.push('Chuyển cảnh qua màn đen: ' + A.fades.map(([a, b]) => `${fmtT(a, fps)}–${fmtT(b + 1, fps)}`).join(', '));
  for (const [a, b] of A.white) warns.push(`Khung trắng giữa video: khung ${a}–${b} (${fmtT(a, fps)}) – nếu là chớp trắng cố ý thì ghi vào --planned`);
  for (const i of A.glitch) errors.push(`Khung hỏng một hình: khung ${i} (${fmtT(i, fps)})`);
  const longFreeze = A.frozen.filter(([a, b]) => b - a >= Math.round(3 * fps));
  if (longFreeze.length) warns.push('Đứng hình ≥ 3 s: ' + longFreeze.map(([a, b]) => `${fmtT(a, fps)}–${fmtT(b, fps)}`).join(', ') + ' (màn chữ cố ý thì bỏ qua)');
  info.push(`Cắt cảnh: ${A.cuts.length}; đứng hình ≥ ${opt.freeze || 12} khung: ${A.frozen.length} đoạn; khung gần như đứng yên: ${A.heldPct}%`);
  return { file: vid, fps, duration: dur, loudness: loud, silences: sil, cuts: A.cuts, frozen: A.frozen, black: A.black, fades: A.fades, white: A.white, glitch: A.glitch, errors, warns, info };
}

export function report(r) {
  const lines = [`# Kiểm video: ${basename(r.file)}`, '', ...r.info.map(s => '- ' + s), ''];
  lines.push(`## Kết luận: ${r.errors.length ? 'CÓ LỖI' : r.warns.length ? 'ĐẠT, CÓ LƯU Ý' : 'ĐẠT'}`, '');
  if (r.errors.length) lines.push('### Lỗi', ...r.errors.map(s => '- ' + s), '');
  if (r.warns.length) lines.push('### Lưu ý', ...r.warns.map(s => '- ' + s), '');
  return lines.join('\n');
}

function sheets(vid, out) {
  run('ffmpeg', ['-v', 'error', '-y', '-i', vid, '-vf', 'fps=2,scale=160:-2,tile=8x5:padding=2', join(out, 'tam-ghep-%02d.jpg')]);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const a = process.argv.slice(2), get = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const vid = a.find((x, i) => !x.startsWith('--') && !['--out', '--freeze', '--planned'].includes(a[i - 1]));
  if (!vid) { console.error('Dùng: node scripts/kiem-video.mjs <video.mp4> [--out thư-mục] [--sheets] [--json] [--freeze 12] [--planned a-b,c-d]'); process.exit(2); }
  const r = check(vid, { freeze: Number(get('--freeze')) || 12, planned: get('--planned') });
  const out = get('--out');
  if (out) {
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'report.md'), report(r) + '\n');
    writeFileSync(join(out, 'report.json'), JSON.stringify(r, null, 1));
    if (a.includes('--sheets')) sheets(vid, out);
  }
  console.log(a.includes('--json') ? JSON.stringify({ errors: r.errors, warns: r.warns, info: r.info }) : report(r));
  process.exit(r.errors.length ? 1 : 0);
}
