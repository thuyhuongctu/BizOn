#!/usr/bin/env node
/* Phân tích phiếu trước–sau từ gói dữ liệu nghiên cứu ẩn danh (surveys.csv trong ZIP «Gói dữ liệu nghiên cứu» của Trang Giảng viên,
 * cột theo docs/research/TU-DIEN-BIEN.md). Không cần thư viện ngoài.
 *
 * Dùng:  node scripts/research/phan-tich-truoc-sau.mjs <surveys.csv | thư-mục-chứa-nhiều-lớp> [--md ra.md] [--json ra.json]
 *        Thư mục: mỗi lớp một thư mục con đã giải nén (hoặc tệp *.surveys.csv), tên thư mục/tệp dùng làm mã lớp.
 *
 * Việc làm: với mỗi (lớp, student_code) lấy phiếu pre và post mới nhất (created_at) → ghép cặp; tính cho score_a (0–15),
 * từng b_1…b_8 (tự tin 1–5) và tổng B: n cặp, trung bình trước/sau, chênh lệch, d Cohen theo cặp (d_z = mean(diff)/sd(diff)) và
 * d theo độ lệch chuẩn gộp, t theo cặp với p hai phía (xấp xỉ), Wilcoxon dấu-hạng (xấp xỉ chuẩn, hiệu chỉnh đồng hạng, bỏ chênh 0).
 * Thêm: phiếu sau có nps và c_1…c_5 (trải nghiệm). Không ghép được thì báo số phiếu lẻ. Không suy diễn nhân quả: đây là
 * thiết kế một nhóm trước–sau, chỉ nói «đo được», không nói «do BizOn gây ra» (thiet-ke-nghien-cuu.html). */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const src = args.find(a => !a.startsWith('--'));
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };

export function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const head = rows.shift() || [];
  return rows.filter(r => r.length > 1 || (r[0] || '').trim()).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

const num = v => (v === '' || v == null || Number.isNaN(+v)) ? null : +v;
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
const sd = a => { if (a.length < 2) return null; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
const r2 = v => v == null ? null : Math.round(v * 100) / 100;
const r3 = v => v == null ? null : Math.round(v * 1000) / 1000;

// Hàm phân phối chuẩn tích lũy và p hai phía từ t (xấp xỉ Student bằng công thức Hill cho df nhỏ, chuẩn cho df lớn)
function pnorm(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
function pT2(t, df) {
  if (!Number.isFinite(t) || df < 1) return null;
  if (df > 100) return 2 * (1 - pnorm(Math.abs(t)));
  // xấp xỉ qua tích phân số của mật độ t (Simpson), đủ cho báo cáo
  const lg = x => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let ser = 1.000000000190015; for (const cj of c) ser += cj / ++y; return -tmp + Math.log(2.5066282746310005 * ser / x); };
  const k = Math.exp(lg((df + 1) / 2) - lg(df / 2)) / Math.sqrt(df * Math.PI);
  const f = x => k * Math.pow(1 + x * x / df, -(df + 1) / 2);
  const a = Math.abs(t), N = 2000, h = a / N; let s = f(0) + f(a);
  for (let i = 1; i < N; i++) s += f(i * h) * (i % 2 ? 4 : 2);
  const p0a = s * h / 3;   // P(0 < T < a)
  return Math.max(0, Math.min(1, 2 * (0.5 - p0a)));
}

export function pairedStats(pre, post) {
  const n = pre.length; if (!n) return { n: 0 };
  const diff = pre.map((x, i) => post[i] - x);
  const md = mean(diff), sdd = sd(diff);
  const t = sdd ? md / (sdd / Math.sqrt(n)) : null;
  const sp = (sd(pre) != null && sd(post) != null) ? Math.sqrt((sd(pre) ** 2 + sd(post) ** 2) / 2) : null;
  // Wilcoxon dấu-hạng
  const nz = diff.map((d, i) => ({ d, a: Math.abs(d) })).filter(x => x.a > 0).sort((p, q) => p.a - q.a);
  let W = null, z = null, pW = null;
  if (nz.length >= 5) {
    const ranks = new Array(nz.length); let i = 0, tie = 0;
    while (i < nz.length) { let j = i; while (j + 1 < nz.length && nz[j + 1].a === nz[i].a) j++; const r = (i + j) / 2 + 1; for (let k = i; k <= j; k++) ranks[k] = r; const g = j - i + 1; if (g > 1) tie += g ** 3 - g; i = j + 1; }
    const Wp = nz.reduce((s, x, k) => s + (x.d > 0 ? ranks[k] : 0), 0), Wm = nz.reduce((s, x, k) => s + (x.d < 0 ? ranks[k] : 0), 0);
    W = Math.min(Wp, Wm); const m = nz.length, mu = m * (m + 1) / 4, va = m * (m + 1) * (2 * m + 1) / 24 - tie / 48;
    z = va > 0 ? (W - mu) / Math.sqrt(va) : null; pW = z == null ? null : 2 * (1 - pnorm(Math.abs(z)));
  }
  return { n, pre_mean: r2(mean(pre)), post_mean: r2(mean(post)), diff_mean: r2(md), diff_sd: r2(sdd), d_z: sdd ? r2(md / sdd) : null, d_pooled: sp ? r2(md / sp) : null,
    t: r2(t), df: n - 1, p_t: t == null ? null : r3(pT2(t, n - 1)), wilcoxon_W: W, wilcoxon_z: r2(z), p_wilcoxon: r3(pW), improved: diff.filter(d => d > 0).length, worse: diff.filter(d => d < 0).length, same: diff.filter(d => d === 0).length };
}

export function analyse(rows, classCode) {
  const latest = {};   // (student_code, phase) → dòng mới nhất
  for (const r of rows) {
    const code = (r.student_code || '').trim().toUpperCase(), ph = (r.phase || '').trim();
    if (!code || !['pre', 'post'].includes(ph)) continue;
    const k = code + '|' + ph; if (!latest[k] || (r.created_at || '') > (latest[k].created_at || '')) latest[k] = r;
  }
  const codes = [...new Set(Object.keys(latest).map(k => k.split('|')[0]))];
  const pairs = codes.filter(c => latest[c + '|pre'] && latest[c + '|post']).map(c => ({ pre: latest[c + '|pre'], post: latest[c + '|post'] }));
  const only = { pre: codes.filter(c => latest[c + '|pre'] && !latest[c + '|post']).length, post: codes.filter(c => !latest[c + '|pre'] && latest[c + '|post']).length };
  const bKeys = Object.keys(rows[0] || {}).filter(k => /^b_\d+$/.test(k)), cKeys = Object.keys(rows[0] || {}).filter(k => /^c_\d+$/.test(k)), oKeys = Object.keys(rows[0] || {}).filter(k => /^out_/.test(k));
  const take = (key, f = x => x) => { const pre = [], post = []; for (const p of pairs) { const a = num(p.pre[key]), b = num(p.post[key]); if (a != null && b != null) { pre.push(f(a)); post.push(f(b)); } } return pairedStats(pre, post); };
  const sumB = r => { const v = bKeys.map(k => num(r[k])); return v.every(x => x != null) ? v.reduce((s, x) => s + x, 0) : null; };
  const bTotal = (() => { const pre = [], post = []; for (const p of pairs) { const a = sumB(p.pre), b = sumB(p.post); if (a != null && b != null) { pre.push(a); post.push(b); } } return pairedStats(pre, post); })();
  const postRows = Object.values(latest).filter(r => r.phase === 'post');
  const post = { n: postRows.length, nps: (() => { const v = postRows.map(r => num(r.nps)).filter(x => x != null); if (!v.length) return null; const pro = v.filter(x => x >= 9).length, det = v.filter(x => x <= 6).length; return { n: v.length, mean: r2(mean(v)), nps: Math.round((pro - det) / v.length * 100) }; })(),
    c: Object.fromEntries(cKeys.map(k => { const v = postRows.map(r => num(r[k])).filter(x => x != null); return [k, v.length ? { n: v.length, mean: r2(mean(v)) } : null]; })) };
  return { class: classCode, rows: rows.length, pairs: pairs.length, unpaired: only, score_a: take('score_a'), outcomes: Object.fromEntries(oKeys.map(k => [k, take(k)])), b: Object.fromEntries(bKeys.map(k => [k, take(k)])), b_total: bTotal, post };
}

function loadClasses(p) {
  const st = fs.statSync(p);
  if (st.isFile()) return [{ cls: path.basename(p).replace(/\.?surveys\.csv$|\.csv$/i, '') || 'lop', rows: parseCsv(fs.readFileSync(p, 'utf8')) }];
  const out = [];
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    const f = path.join(p, e.name);
    if (e.isDirectory() && fs.existsSync(path.join(f, 'surveys.csv'))) out.push({ cls: e.name, rows: parseCsv(fs.readFileSync(path.join(f, 'surveys.csv'), 'utf8')) });
    else if (e.isFile() && /surveys\.csv$/i.test(e.name)) out.push({ cls: e.name.replace(/\.?surveys\.csv$/i, '') || 'lop', rows: parseCsv(fs.readFileSync(f, 'utf8')) });
  }
  return out;
}

function fmtP(p) { return p == null ? '–' : p < 0.001 ? '< 0,001' : String(p).replace('.', ','); }
function fmt(v) { return v == null ? '–' : String(v).replace('.', ','); }
export function toMarkdown(results) {
  const L = ['# Phiếu trước – sau · kết quả phân tích', '', 'Thiết kế một nhóm trước–sau, không có nhóm đối chứng: kết quả là **mức thay đổi đo được**, không phải tác động nhân quả của BizOn.', ''];
  L.push('| Lớp | Phiếu | Cặp ghép | Lẻ (trước / sau) | Điểm A trước → sau (/15) | Δ | d_z | p (t cặp) | p (Wilcoxon) | Tự tin B tổng trước → sau | Δ | d_z | NPS |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of results) {
    const a = r.score_a, b = r.b_total;
    L.push(`| ${r.class} | ${r.rows} | ${r.pairs} | ${r.unpaired.pre} / ${r.unpaired.post} | ${fmt(a.pre_mean)} → ${fmt(a.post_mean)} | ${fmt(a.diff_mean)} | ${fmt(a.d_z)} | ${fmtP(a.p_t)} | ${fmtP(a.p_wilcoxon)} | ${fmt(b.pre_mean)} → ${fmt(b.post_mean)} | ${fmt(b.diff_mean)} | ${fmt(b.d_z)} | ${r.post.nps ? r.post.nps.nps + ' (n=' + r.post.nps.n + ')' : '–'} |`);
  }
  for (const r of results) {
    L.push('', `## ${r.class} · từng phát biểu tự tin (Likert 1–5, cặp n=${r.pairs})`, '', '| Câu | Trước | Sau | Δ | d_z | Tăng / giữ / giảm |', '|---|---|---|---|---|---|');
    for (const [k, v] of Object.entries(r.b)) L.push(`| ${k} | ${fmt(v.pre_mean)} | ${fmt(v.post_mean)} | ${fmt(v.diff_mean)} | ${fmt(v.d_z)} | ${v.improved ?? '–'} / ${v.same ?? '–'} / ${v.worse ?? '–'} |`);
    const oc = Object.entries(r.outcomes).filter(([, v]) => v.n);
    if (oc.length) { L.push('', `### ${r.class} · điểm theo chuẩn đầu ra`, '', '| Chuẩn | Trước | Sau | Δ | d_z |', '|---|---|---|---|---|'); for (const [k, v] of oc) L.push(`| ${k} | ${fmt(v.pre_mean)} | ${fmt(v.post_mean)} | ${fmt(v.diff_mean)} | ${fmt(v.d_z)} |`); }
    const cc = Object.entries(r.post.c).filter(([, v]) => v);
    if (cc.length) L.push('', `### ${r.class} · trải nghiệm (phiếu sau, 1–5): ` + cc.map(([k, v]) => `${k} ${fmt(v.mean)} (n=${v.n})`).join(' · '));
  }
  L.push('', 'Cách đọc: d_z = chênh lệch trung bình ÷ độ lệch chuẩn của chênh lệch (0,2 nhỏ · 0,5 vừa · 0,8 lớn). p xấp xỉ; mẫu nhỏ (< 20 cặp) chỉ nên nêu mô tả. Sinh viên có điểm trần (15/15 ở phiếu trước) không thể tăng, cần nêu tỷ lệ trần.');
  return L.join('\n') + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (!src) { console.error('Dùng: node scripts/research/phan-tich-truoc-sau.mjs <surveys.csv|thư mục> [--md ra.md] [--json ra.json]'); process.exit(2); }
  const classes = loadClasses(src);
  if (!classes.length) { console.error('Không thấy surveys.csv ở ' + src); process.exit(2); }
  const results = classes.map(c => analyse(c.rows, c.cls));
  const md = toMarkdown(results);
  const mdOut = opt('--md'), jsOut = opt('--json');
  if (mdOut) fs.writeFileSync(mdOut, md); else process.stdout.write(md);
  if (jsOut) fs.writeFileSync(jsOut, JSON.stringify(results, null, 2));
}
