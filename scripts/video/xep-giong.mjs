#!/usr/bin/env node
// Xếp tệp ghi âm giọng Lumina vào đúng chỗ từng câu của kịch bản.
//   node scripts/video/xep-giong.mjs --tap 01 --lang vi <tệp.zip | thư mục> [--thu] [--ghi-de] [--dich <thư mục>]
// Tên tệp ghi âm bắt đầu bằng số. Nhận hai kiểu đánh số:
//   - theo thứ tự đọc 1, 2, 3… (bằng đúng số câu có lời): tệp thứ n vào câu có lời thứ n (tập 1: tệp 28 → câu 29, vì câu 28 là chữ chạy);
//   - theo số câu của kịch bản (01–27, 29): giữ nguyên.
// Tệp .mp3 chép nguyên; .m4a/.wav/.aac/.ogg/.flac đổi sang .mp3 bằng ffmpeg.
// Không ghi đè tệp đã có (trừ khi --ghi-de). --thu chỉ in bảng xếp, không chép.
import { readFileSync, mkdirSync, existsSync, readdirSync, copyFileSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname, extname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const arg = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const CO_GIA_TRI = new Set(['--tap', '--lang', '--dich']);
const nguon = argv.find((a, i) => !a.startsWith('--') && !CO_GIA_TRI.has(argv[i - 1]));
const TAP = (arg('--tap') || '01').padStart(2, '0'), LANG = arg('--lang') === 'en' ? 'en' : 'vi';
const THU = argv.includes('--thu'), GHI_DE = argv.includes('--ghi-de');
const loi = m => { console.error('xep-giong: ' + m); process.exit(1); };
if (!nguon) loi('thiếu tệp zip hoặc thư mục ghi âm');

const CFG = JSON.parse(readFileSync(join(ROOT, `scripts/video/dua-trai-ra-bien/tap-${TAP}.ghep.json`), 'utf8'));
const cau = readFileSync(join(ROOT, CFG.kich_ban), 'utf8').split('\n').filter(l => l.startsWith('|'))
  .map(l => l.split('|').slice(1, -1).map(x => x.trim())).filter(c => c.length >= 8 && /^\d+$/.test(c[0]))
  .filter(c => { const t = LANG === 'en' ? c[4] : c[3]; return t && t !== '—'; }).map(c => +c[0]);
const DICH = resolve(arg('--dich') || join(ROOT, dirname(CFG.giong.replace('{lang}', LANG))));

// Lấy danh sách tệp âm thanh (giải nén zip vào thư mục tạm riêng nếu cần)
let dir = resolve(nguon), tam = null;
if (!existsSync(dir)) loi('không thấy ' + nguon);
if (statSync(dir).isFile()) {
  tam = mkdtempSync(join(tmpdir(), 'xep-giong-'));
  const r = spawnSync('unzip', ['-q', '-j', '-o', dir, '-d', tam], { stdio: 'inherit' });
  if (r.status !== 0) loi('giải nén lỗi');
  dir = tam;
}
const AM = /\.(mp3|m4a|wav|aac|ogg|flac)$/i;
const tep = readdirSync(dir).filter(f => AM.test(f) && !f.startsWith('.') && /^\d+/.test(f))
  .map(f => ({ f, so: parseInt(f, 10) })).sort((a, b) => a.so - b.so);
const so = tep.map(t => t.so);
if (new Set(so).size !== so.length) loi('có hai tệp cùng số: ' + so.filter((x, i) => so.indexOf(x) !== i).join(', '));

let xep;
const trung = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
if (trung(so, cau)) xep = tep.map(t => ({ ...t, cau: t.so }));
else if (trung(so, cau.map((_, i) => i + 1))) xep = tep.map((t, i) => ({ ...t, cau: cau[i] }));
else loi(`cần ${cau.length} tệp đánh số 1–${cau.length} hoặc theo số câu (${cau.join(', ')}); đang có ${so.length} tệp: ${so.join(', ')}`);

for (const x of xep) console.log(`${x.f.padEnd(14)} → câu ${String(x.cau).padStart(2, '0')}`);
if (!THU) {
  mkdirSync(DICH, { recursive: true });
  const daCo = xep.filter(x => existsSync(join(DICH, String(x.cau).padStart(2, '0') + '.mp3')));
  if (daCo.length && !GHI_DE) loi(`đã có giọng câu ${daCo.map(x => x.cau).join(', ')} trong ${DICH}; thêm --ghi-de nếu muốn thay`);
  for (const x of xep) {
    const src = join(dir, x.f), dst = join(DICH, String(x.cau).padStart(2, '0') + '.mp3');
    if (extname(x.f).toLowerCase() === '.mp3') copyFileSync(src, dst);
    else {
      const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', dst], { stdio: 'inherit' });
      if (r.status !== 0) loi('ffmpeg không đổi được ' + basename(src));
    }
  }
  console.log(`Đã xếp ${xep.length} câu vào ${DICH}`);
}
if (tam) rmSync(tam, { recursive: true, force: true });
