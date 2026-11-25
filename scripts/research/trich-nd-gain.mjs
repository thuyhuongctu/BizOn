#!/usr/bin/env node
// Trích số liệu ND-GAIN cho 7 nước trung tâm của BizOn Go Global (đặc tả 009).
//   node scripts/research/trich-nd-gain.mjs <ndgain_countryindex_2026.zip> [--ngay-tai YYYY-MM-DD]
// Đọc gain.csv, vulnerability.csv, readiness.csv trong tệp zip chính thức (tải tay ở
// https://gain.nd.edu/our-work/country-index/download-data/ vì trang chặn tải tự động),
// rồi ghi:
//   - docs/research/du-lieu/nd-gain-2026-nuoc-trung-tam.csv  (bảng trích để đối chiếu)
//   - khối dữ liệu giữa hai dấu «nd-gain:bat-dau / nd-gain:ket-thuc» trong js/go-global-khi-hau.js
// Năm dùng: năm mới nhất mà cả 7 nước đều có điểm ND-GAIN; nước nào không có năm đó (hiếm) thì báo lỗi,
// không nội suy. Thứ hạng: xếp điểm ND-GAIN giảm dần trong năm đó trên mọi nước có điểm (bằng điểm thì cùng hạng).
import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const zip = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--ngay-tai');
const ngayTai = argv.includes('--ngay-tai') ? argv[argv.indexOf('--ngay-tai') + 1] : new Date().toISOString().slice(0, 10);
const loi = m => { console.error('trich-nd-gain: ' + m); process.exit(1); };
if (!zip) loi('thiếu đường dẫn tệp zip ND-GAIN');

export const NUOC = [
  { thiTruong: 'sea', iso3: 'SGP', vi: 'Singapore', en: 'Singapore' },
  { thiTruong: 'eas', iso3: 'JPN', vi: 'Nhật Bản', en: 'Japan' },
  { thiTruong: 'eu', iso3: 'DEU', vi: 'Đức', en: 'Germany' },
  { thiTruong: 'na', iso3: 'USA', vi: 'Hoa Kỳ', en: 'United States' },
  { thiTruong: 'me', iso3: 'ARE', vi: 'Các Tiểu vương quốc Ả Rập Thống nhất', en: 'United Arab Emirates' },
  { thiTruong: 'kr', iso3: 'KOR', vi: 'Hàn Quốc', en: 'South Korea' },
  { thiTruong: 'af', iso3: 'KEN', vi: 'Kenya', en: 'Kenya' },
];

// Giải nén vào thư mục tạm riêng (dữ liệu tải về là dữ liệu không tin cậy: chỉ đọc CSV, không chạy gì trong đó)
const tam = mkdtempSync(join(tmpdir(), 'nd-gain-'));
const r = spawnSync('unzip', ['-q', '-o', resolve(zip), '-d', tam], { stdio: 'inherit' });
if (r.status !== 0) loi('giải nén lỗi');
const tim = (dir, ten) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { const k = tim(p, ten); if (k) return k; }
    else if (f.toLowerCase() === ten) return p;
  }
  return null;
};

// CSV đơn giản có ngoặc kép: tách theo dấu phẩy ngoài ngoặc
const tachDong = l => { const o = []; let c = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o.map(x => x.trim()); };
const docBang = ten => {
  const p = tim(tam, ten); if (!p) loi('không thấy ' + ten + ' trong tệp zip');
  const dong = readFileSync(p, 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter(Boolean).map(tachDong);
  const dau = dong[0], iIso = dau.findIndex(h => /^iso3$/i.test(h));
  if (iIso < 0) loi(ten + ': không có cột ISO3');
  const nam = dau.map((h, i) => /^\d{4}$/.test(h) ? [i, +h] : null).filter(Boolean);
  const bang = new Map();
  for (const d of dong.slice(1)) {
    const m = new Map(); for (const [i, y] of nam) { const v = parseFloat(d[i]); if (Number.isFinite(v)) m.set(y, v); }
    bang.set(d[iIso], m);
  }
  return { bang, tep: basename(p), namMax: Math.max(...nam.map(x => x[1])) };
};
const gain = docBang('gain.csv'), vul = docBang('vulnerability.csv'), rdy = docBang('readiness.csv');

// Năm mới nhất cả 7 nước đều có đủ ba điểm
let NAM = null;
for (let y = gain.namMax; y >= gain.namMax - 10 && NAM === null; y--) {
  if (NUOC.every(n => [gain, vul, rdy].every(t => t.bang.get(n.iso3)?.has(y)))) NAM = y;
}
if (NAM === null) loi('không có năm nào đủ số liệu cho cả 7 nước trong 10 năm gần nhất');

const tatCa = [...gain.bang].map(([iso, m]) => [iso, m.get(NAM)]).filter(([, v]) => Number.isFinite(v));
const hang = iso => 1 + tatCa.filter(([, v]) => v > gain.bang.get(iso).get(NAM)).length;
const rows = NUOC.map(n => ({
  ...n, nam: NAM,
  gain: +gain.bang.get(n.iso3).get(NAM).toFixed(1),
  vul: +vul.bang.get(n.iso3).get(NAM).toFixed(3),
  ready: +rdy.bang.get(n.iso3).get(NAM).toFixed(3),
  hang: hang(n.iso3),
}));
rmSync(tam, { recursive: true, force: true });

// 1. CSV trích
const csvPath = join(ROOT, 'docs/research/du-lieu/nd-gain-2026-nuoc-trung-tam.csv');
mkdirSync(dirname(csvPath), { recursive: true });
const csv = ['thi_truong,iso3,nuoc,nam,nd_gain,vulnerability,readiness,hang,tong_so_nuoc'].concat(
  rows.map(x => [x.thiTruong, x.iso3, x.en, x.nam, x.gain, x.vul, x.ready, x.hang, tatCa.length].join(',')));
writeFileSync(csvPath, `# Nguồn: ${basename(zip)} (ND-GAIN Country Index, University of Notre Dame), tải ngày ${ngayTai}; tệp ${gain.tep}, ${vul.tep}, ${rdy.tep}\n` + csv.join('\n') + '\n');

// 2. Khối dữ liệu trong js/go-global-khi-hau.js
const jsPath = join(ROOT, 'js/go-global-khi-hau.js');
const js = readFileSync(jsPath, 'utf8');
const khoi = `/* nd-gain:bat-dau – sinh bởi scripts/research/trich-nd-gain.mjs, không sửa tay */
  const NAM = ${NAM}, TONG_SO_NUOC = ${tatCa.length}, NGAY_TAI = '${ngayTai}';
  const NUOC = {
${rows.map(x => `    ${x.iso3}: { vi: ${JSON.stringify(x.vi)}, en: ${JSON.stringify(x.en)}, nam: ${x.nam}, gain: ${x.gain}, vul: ${x.vul}, ready: ${x.ready}, hang: ${x.hang} },`).join('\n')}
  };
  /* nd-gain:ket-thuc */`;
const moi = js.replace(/\/\* nd-gain:bat-dau[\s\S]*?\/\* nd-gain:ket-thuc \*\//, khoi);
if (moi === js && !js.includes(khoi)) loi('không tìm thấy dấu nd-gain:bat-dau / nd-gain:ket-thuc trong js/go-global-khi-hau.js');
writeFileSync(jsPath, moi);
console.log(`Năm số liệu ${NAM}, ${tatCa.length} nước có điểm. Đã ghi ${csvPath} và khối dữ liệu trong ${jsPath}.`);
for (const x of rows) console.log(`${x.iso3}  ND-GAIN ${x.gain}  hạng ${x.hang}/${tatCa.length}  dễ tổn thương ${x.vul}  sẵn sàng ${x.ready}`);
