#!/usr/bin/env node
/* Độ tin cậy giữa người chấm cho rubric pitch (đặc tả 012, PR 2). Không cần thư viện ngoài.
 *
 * Dùng:  node scripts/research/do-tin-cay-pitch.mjs <cham.csv> [cham2.csv …] [--tieu-chi ten] [--json ra.json] [--seed 1]
 *   Đầu vào: CSV dạng dài do màn chiếu xuất («Xuất CSV chấm điểm»), cột
 *   ma_buoi, doi, nguoi_cham, vai, tieu_chi, diem, thoi_diem   (vai: gv | ban; tieu_chi: 6 tiêu chí và y_dinh).
 *   Mỗi lượt pitch = (ma_buoi, doi). Điểm của một người chấm cho một lượt = trung bình 6 tiêu chí (hoặc một tiêu chí với --tieu-chi).
 *
 * In ra:
 *   - ICC(2,1) và ICC(2,k), mô hình hai chiều ngẫu nhiên, đồng thuận tuyệt đối (Shrout & Fleiss, 1979; McGraw & Wong, 1996),
 *     giữa hai «người chấm»: giảng viên và trung bình các bạn học, trên các lượt có cả hai; khoảng tin cậy 95 % theo McGraw & Wong.
 *   - α Krippendorff (thang khoảng) trên mọi người chấm riêng lẻ, chấp nhận ô trống (Hayes & Krippendorff, 2007);
 *     khoảng tin cậy 95 % bằng bootstrap theo lượt pitch (phân vị, 2000 lần, hạt giống cố định).
 *   - So với ngưỡng ICC(2,k) ≥ 0,75 (Koo & Li, 2016); cảnh báo khi dưới 30 lượt pitch.
 * Phần tính là hàm thuần, xuất ra để test đối chiếu số liệu mẫu đã công bố. */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export const TIEU_CHI = ['chuan_bi', 'nhiet_huyet', 'tai_chinh', 'van_de_giai_phap', 'doi_ngu', 'tra_loi'];
export const NGUONG_ICC = 0.75, SO_LUOT_TOI_THIEU = 30;

/* ---------- Phân phối F (để lấy phân vị cho khoảng tin cậy) ---------- */
function lnGamma(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015; for (const v of c) ser += v / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}
function betacf(a, b, x) {
  const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
    const del = d * c; h *= del; if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
/** Hàm beta không đầy đủ chuẩn hóa I_x(a, b). */
export function betaI(x, a, b) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
/** P(F ≤ f) với bậc tự do d1, d2 (chấp nhận bậc tự do lẻ). */
export const fCdf = (f, d1, d2) => (f <= 0 ? 0 : betaI(d1 * f / (d1 * f + d2), d1 / 2, d2 / 2));
/** Phân vị p của phân phối F, tìm bằng chia đôi. */
export function fQuantile(p, d1, d2) {
  let lo = 0, hi = 1; while (fCdf(hi, d1, d2) < p) hi *= 2;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (fCdf(mid, d1, d2) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/* ---------- ICC hai chiều ngẫu nhiên, đồng thuận tuyệt đối ---------- */
/** `x`: n hàng (lượt pitch) × k cột (người chấm), không ô trống. */
export function icc(x, alpha = 0.05) {
  const n = x.length, k = x[0].length;
  if (n < 2 || k < 2 || x.some(r => r.length !== k || r.some(v => !Number.isFinite(v)))) throw new Error('Cần ma trận đủ, ít nhất 2 lượt × 2 người chấm.');
  const tb = x.flat().reduce((a, v) => a + v, 0) / (n * k);
  const tbH = x.map(r => r.reduce((a, v) => a + v, 0) / k);
  const tbC = Array.from({ length: k }, (_, j) => x.reduce((a, r) => a + r[j], 0) / n);
  const ssR = k * tbH.reduce((a, m) => a + (m - tb) ** 2, 0);
  const ssC = n * tbC.reduce((a, m) => a + (m - tb) ** 2, 0);
  const ssT = x.flat().reduce((a, v) => a + (v - tb) ** 2, 0);
  const ssE = ssT - ssR - ssC;
  const msR = ssR / (n - 1), msC = ssC / (k - 1), msE = ssE / ((n - 1) * (k - 1));
  const icc21 = (msR - msE) / (msR + (k - 1) * msE + k * (msC - msE) / n);
  const icc2k = (msR - msE) / (msR + (msC - msE) / n);
  // Khoảng tin cậy cho ICC(A,1) theo McGraw & Wong (1996), bảng 7, trường hợp 2A; ICC(A,k) suy ra bằng Spearman–Brown.
  const a = k * icc21 / (n * (1 - icc21)), b = 1 + k * icc21 * (n - 1) / (n * (1 - icc21));
  const v = (a * msC + b * msE) ** 2 / ((a * msC) ** 2 / (k - 1) + (b * msE) ** 2 / ((n - 1) * (k - 1)));
  const fTren = fQuantile(1 - alpha / 2, n - 1, v), fDuoi = fQuantile(1 - alpha / 2, v, n - 1);
  const duoi = n * (msR - fTren * msE) / (fTren * (k * msC + (k * n - k - n) * msE) + n * msR);
  const tren = n * (fDuoi * msR - msE) / (k * msC + (k * n - k - n) * msE + n * fDuoi * msR);
  const sb = r => k * r / (1 + (k - 1) * r);
  return { n, k, msR, msC, msE, icc21, icc2k, ci21: [duoi, tren], ci2k: [sb(duoi), sb(tren)], F: msR / msE, df: [n - 1, (n - 1) * (k - 1)] };
}

/* ---------- α Krippendorff ---------- */
/** `don`: mỗi phần tử là mảng giá trị của các người chấm cho một đơn vị (null = trống). metric: 'interval' | 'nominal'. */
export function alphaKrippendorff(don, metric = 'interval') {
  const d2 = metric === 'nominal' ? (a, b) => (a === b ? 0 : 1) : (a, b) => (a - b) ** 2;
  const gt = don.map(u => u.filter(v => v !== null && v !== undefined && v !== '')).filter(u => u.length >= 2);
  const N = gt.reduce((a, u) => a + u.length, 0);
  if (N < 2 || !gt.length) return NaN;
  let Do = 0;
  for (const u of gt) { let s = 0; for (let i = 0; i < u.length; i++) for (let j = 0; j < u.length; j++) if (i !== j) s += d2(u[i], u[j]); Do += s / (u.length - 1); }
  Do /= N;
  const tat = gt.flat(); let De = 0;
  for (let i = 0; i < tat.length; i++) for (let j = 0; j < tat.length; j++) if (i !== j) De += d2(tat[i], tat[j]);
  De /= N * (N - 1);
  return De === 0 ? (Do === 0 ? 1 : NaN) : 1 - Do / De;
}
/** Bộ sinh số giả ngẫu nhiên có hạt giống (mulberry32), để bootstrap ra cùng kết quả mỗi lần chạy. */
export function taoRand(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** Khoảng tin cậy bootstrap (phân vị) cho α, lấy mẫu lại theo đơn vị. */
export function alphaBootstrap(don, { lan = 2000, seed = 1, metric = 'interval', alpha = 0.05 } = {}) {
  const r = taoRand(seed), ds = [];
  for (let b = 0; b < lan; b++) { const m = don.map(() => don[Math.floor(r() * don.length)]); const a = alphaKrippendorff(m, metric); if (Number.isFinite(a)) ds.push(a); }
  ds.sort((p, q) => p - q);
  const pv = p => ds[Math.min(ds.length - 1, Math.max(0, Math.round(p * (ds.length - 1))))];
  return ds.length ? [pv(alpha / 2), pv(1 - alpha / 2)] : [NaN, NaN];
}

/* ---------- Đọc CSV của màn chiếu ---------- */
export function docCsv(text) {
  const s = String(text).replace(/^﻿/, ''), dong = []; let o = '', hang = [], nhay = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (nhay) { if (c === '"') { if (s[i + 1] === '"') { o += '"'; i++; } else nhay = false; } else o += c; continue; }
    if (c === '"') nhay = true; else if (c === ',') { hang.push(o); o = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; hang.push(o); dong.push(hang); hang = []; o = ''; }
    else o += c;
  }
  if (o !== '' || hang.length) { hang.push(o); dong.push(hang); }
  const bo = dong.filter(r => r.some(v => v.trim() !== ''));
  if (!bo.length) return [];
  const cot = bo[0].map(v => v.trim());
  return bo.slice(1).map(r => Object.fromEntries(cot.map((c, i) => [c, (r[i] || '').replace(/^'(?=[=+\-@\t\r])/, '')])));
}

/** Gom các dòng CSV thành điểm mỗi người chấm cho mỗi lượt pitch. */
export function gomDiem(dongs, tieuChi) {
  const can = tieuChi ? [tieuChi] : TIEU_CHI, luot = new Map();
  for (const d of dongs) {
    if (!can.includes(d.tieu_chi)) continue;
    const v = Number(d.diem); if (!Number.isFinite(v)) continue;
    const kLuot = d.ma_buoi + '|' + d.doi;
    if (!luot.has(kLuot)) luot.set(kLuot, new Map());
    const m = luot.get(kLuot), kNguoi = d.ma_buoi + '|' + d.nguoi_cham;
    if (!m.has(kNguoi)) m.set(kNguoi, { vai: d.vai, diem: [] });
    m.get(kNguoi).diem.push(v);
  }
  const ra = [];
  for (const [kLuot, m] of luot) {
    const nguoi = [...m].filter(([, x]) => x.diem.length === can.length).map(([id, x]) => ({ id, vai: x.vai, diem: x.diem.reduce((a, v) => a + v, 0) / x.diem.length }));
    ra.push({ luot: kLuot, nguoi });
  }
  return ra;
}

/** Phân tích đầy đủ từ các dòng CSV. */
export function phanTich(dongs, { tieuChi, seed = 1, lan = 2000 } = {}) {
  const luot = gomDiem(dongs, tieuChi);
  const tb = a => a.reduce((s, v) => s + v, 0) / a.length;
  const cap = luot.map(l => { const gv = l.nguoi.filter(x => x.vai === 'gv'), ban = l.nguoi.filter(x => x.vai === 'ban'); return gv.length && ban.length ? [tb(gv.map(x => x.diem)), tb(ban.map(x => x.diem))] : null; }).filter(Boolean);
  const nguoiIds = [...new Set(luot.flatMap(l => l.nguoi.map(x => x.id)))];
  const don = luot.map(l => nguoiIds.map(id => { const x = l.nguoi.find(y => y.id === id); return x ? x.diem : null; }));
  const ketQua = { soLuot: luot.length, soLuotCap: cap.length, soNguoiCham: nguoiIds.length, tieuChi: tieuChi || 'trung_binh_6_tieu_chi', canhBao: [] };
  if (cap.length >= 2) {
    const r = icc(cap);
    Object.assign(ketQua, { icc21: r.icc21, ci21: r.ci21, icc2k: r.icc2k, ci2k: r.ci2k, datNguong: r.icc2k >= NGUONG_ICC });
  } else ketQua.canhBao.push('Chưa đủ lượt có cả điểm giảng viên và điểm bạn học để tính ICC.');
  const a = alphaKrippendorff(don, 'interval');
  if (Number.isFinite(a)) Object.assign(ketQua, { alpha: a, ciAlpha: alphaBootstrap(don, { seed, lan }) });
  if (luot.length < SO_LUOT_TOI_THIEU) ketQua.canhBao.push('Mới có ' + luot.length + ' lượt pitch, dưới ' + SO_LUOT_TOI_THIEU + ': khoảng tin cậy còn rộng, chưa nên kết luận.');
  return ketQua;
}

const so = v => (Number.isFinite(v) ? v.toFixed(3).replace('.', ',') : '–');
export function inBaoCao(k) {
  const l = ['Độ tin cậy giữa người chấm · ' + k.tieuChi, 'Lượt pitch: ' + k.soLuot + ' · có cả giảng viên và bạn học: ' + k.soLuotCap + ' · người chấm: ' + k.soNguoiCham];
  if ('icc21' in k) {
    l.push('ICC(2,1) = ' + so(k.icc21) + '  [KTC 95 %: ' + so(k.ci21[0]) + '; ' + so(k.ci21[1]) + ']');
    l.push('ICC(2,k) = ' + so(k.icc2k) + '  [KTC 95 %: ' + so(k.ci2k[0]) + '; ' + so(k.ci2k[1]) + ']  ' + (k.datNguong ? '≥ 0,75: đạt ngưỡng' : '< 0,75: chưa đạt ngưỡng'));
  }
  if ('alpha' in k) l.push('α Krippendorff (khoảng) = ' + so(k.alpha) + '  [bootstrap 95 %: ' + so(k.ciAlpha[0]) + '; ' + so(k.ciAlpha[1]) + ']');
  k.canhBao.forEach(c => l.push('⚠ ' + c));
  return l.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const ts = process.argv.slice(2), tep = [], opt = {};
  for (let i = 0; i < ts.length; i++) {
    if (ts[i] === '--tieu-chi') opt.tieuChi = ts[++i];
    else if (ts[i] === '--json') opt.json = ts[++i];
    else if (ts[i] === '--seed') opt.seed = Number(ts[++i]);
    else tep.push(ts[i]);
  }
  if (!tep.length) { console.error('Dùng: node scripts/research/do-tin-cay-pitch.mjs <cham.csv> [...] [--tieu-chi ten] [--json ra.json]'); process.exit(2); }
  if (opt.tieuChi && !TIEU_CHI.includes(opt.tieuChi)) { console.error('Tiêu chí không có: ' + opt.tieuChi + '. Chọn: ' + TIEU_CHI.join(', ')); process.exit(2); }
  const dongs = tep.flatMap(f => docCsv(fs.readFileSync(f, 'utf8')));
  const k = phanTich(dongs, opt);
  console.log(inBaoCao(k));
  if (opt.json) fs.writeFileSync(opt.json, JSON.stringify(k, null, 2));
}
