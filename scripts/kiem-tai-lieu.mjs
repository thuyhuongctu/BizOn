#!/usr/bin/env node
/* Kiểm danh mục tài liệu tham khảo trên các trang học thuật của BizOn với Crossref (19/11/2026).
 * Ý tưởng học từ google-research/paper-orchestra (chặn trích dẫn bịa bằng cách tìm lại từng tài liệu trong cơ sở dữ liệu
 * học thuật và so tiêu đề, năm); mã viết mới, không chép.
 *
 * Cách dùng:
 *   node scripts/kiem-tai-lieu.mjs                       # ba trang mặc định
 *   node scripts/kiem-tai-lieu.mjs truong-hoc-thuat.html # một hay nhiều trang
 *   node scripts/kiem-tai-lieu.mjs --chi-doc              # chỉ đọc danh mục, không gọi mạng
 *   node scripts/kiem-tai-lieu.mjs --json                 # in kết quả dạng JSON
 *
 * Máy có proxy (máy đám mây, CI): chạy với NODE_USE_ENV_PROXY=1 để fetch của Node đi qua HTTPS_PROXY.
 * Chỉ đọc và báo cáo: không sửa trang nào. Gọi api.crossref.org (miễn phí, không cần khóa), chậm lại giữa các lần gọi.
 * Kết quả mỗi mục: KHỚP · SAI NĂM · SAI TÊN · SAI TÁC GIẢ · DOI KHÔNG CÓ · CHƯA CÓ DOI (kèm gợi ý nếu Crossref tìm thấy)
 * · KHÔNG TÌM THẤY · LỖI MẠNG. Sách và chương sách thường không có DOI; khi đó «CHƯA CÓ DOI» không phải là lỗi. */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const TRANG_MAC_DINH = ['truong-hoc-thuat.html', 'thiet-ke-nghien-cuu.html', 'dinh-huong.html'];
const UA = 'BizOn-kiem-tai-lieu/1.0 (+https://bizonland.com)';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…' };
const decode = s => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] ?? m));
const text = h => decode(h.replace(/<button[\s\S]*?<\/button>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Đọc các mục kiểu APA «Tác giả (Năm). Tiêu đề. Nguồn…» trong <li> của một trang. */
export function docDanhMuc(html, trang = '') {
  const out = [];
  for (const m of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const raw = m[1], t = text(raw).replace(/^[•·\-\s]+/, '');
    const a = /^(.{3,200}?)\s\((\d{4})[a-z]?\)\.\s+(.+)$/.exec(t);
    if (!a || !/,/.test(a[1])) continue;
    const doi = ((/https?:\/\/(?:dx\.)?doi\.org\/(10\.[^"'\s<>]+)/i.exec(raw) || [])[1] || '').replace(/[.,;]+$/, '');
    // Tiêu đề: tới dấu chấm (hay ? !) đầu tiên theo sau là khoảng trắng; với sách in nghiêng thì lấy phần in nghiêng đầu
    const rest = a[3];
    const tieuDe = (/^(.+?[.?!])(?:\s|$)/.exec(rest) || [, rest])[1].replace(/[.]$/, '').trim();
    out.push({ trang, tacGia: a[1].trim(), ho: a[1].split(',')[0].trim(), nam: +a[2], tieuDe, doi, nguyenVan: t });
  }
  return out;
}

// So hai tiêu đề: bỏ dấu, chữ thường, so tập từ (Jaccard) – đủ để bắt tiêu đề sai mà không vướng hoa/thường, dấu câu
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
export function giongTieuDe(a, b) {
  const A = new Set(norm(a).split(' ').filter(w => w.length > 2)), B = new Set(norm(b).split(' ').filter(w => w.length > 2));
  if (!A.size || !B.size) return 0;
  let chung = 0; for (const w of A) if (B.has(w)) chung++;
  return chung / (A.size + B.size - chung);
}
const namCuaBai = w => ((w.issued || w['published-print'] || w['published-online'] || {})['date-parts'] || [[]])[0][0];
const tieuDeBai = w => [].concat(w.title || [])[0] || '';
const hoTacGia = w => (w.author || []).map(x => x.family || x.name || '').filter(Boolean);

/** Đối chiếu một mục với bản ghi Crossref; trả về { ketQua, chiTiet }. */
export function doiChieu(ref, w) {
  const g = giongTieuDe(ref.tieuDe, tieuDeBai(w)), nam = namCuaBai(w), ho = hoTacGia(w);
  const loi = [];
  if (g < 0.6) loi.push(['SAI TÊN', 'Crossref ghi «' + tieuDeBai(w) + '» (giống ' + Math.round(g * 100) + '%)']);
  // Lệch một năm thường do bản trực tuyến ra trước bản in: vẫn báo để người viết xem lại
  if (nam && nam !== ref.nam) loi.push(['SAI NĂM', 'trang ghi ' + ref.nam + ', Crossref ghi ' + nam]);
  // Họ ghép (Santos Silva, Van den Bosch…) Crossref có thể chỉ ghi phần cuối: coi là khớp nếu họ Crossref nằm trong chuỗi tác giả
  if (ho.length && !ho.some(h => norm(h) === norm(ref.ho) || (' ' + norm(ref.tacGia) + ' ').includes(' ' + norm(h) + ' '))) loi.push(['SAI TÁC GIẢ', 'trang ghi «' + ref.ho + '», Crossref ghi ' + ho.slice(0, 3).join(', ')]);
  return loi.length ? { ketQua: loi[0][0], chiTiet: loi.map(x => x[1]).join('; ') } : { ketQua: 'KHỚP', chiTiet: '' };
}

const ngu = ms => new Promise(r => setTimeout(r, ms));
async function layJSON(url, fetchFn) {
  for (let lan = 0; lan < 3; lan++) {
    try {
      const r = await fetchFn(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, redirect: 'follow' });
      if (r.status === 404) return { khongCo: true };
      if (r.status === 429 || r.status >= 500) { await ngu(1500 * (lan + 1)); continue; }
      if (!r.ok) return { loi: 'HTTP ' + r.status };
      return { data: await r.json() };
    } catch (e) { if (lan === 2) return { loi: e.message }; await ngu(1000); }
  }
  return { loi: 'hết lượt thử' };
}

/** Kiểm một mục. fetchFn để test thay bằng hàm giả. */
export async function kiemMuc(ref, fetchFn = fetch) {
  if (ref.doi) {
    const r = await layJSON('https://api.crossref.org/works/' + encodeURIComponent(ref.doi), fetchFn);
    if (r.khongCo) return { ...ref, ketQua: 'DOI KHÔNG CÓ', chiTiet: 'doi.org/' + ref.doi + ' không có trên Crossref' };
    if (r.loi) return { ...ref, ketQua: 'LỖI MẠNG', chiTiet: r.loi };
    return { ...ref, ...doiChieu(ref, r.data.message) };
  }
  const q = 'https://api.crossref.org/works?rows=3&select=DOI,title,author,issued,published-print,published-online&query.bibliographic=' + encodeURIComponent(ref.nguyenVan.slice(0, 300));
  const r = await layJSON(q, fetchFn);
  if (r.loi) return { ...ref, ketQua: 'LỖI MẠNG', chiTiet: r.loi };
  const items = (r.data && r.data.message && r.data.message.items) || [];
  const tot = items.map(w => ({ w, g: giongTieuDe(ref.tieuDe, tieuDeBai(w)) })).sort((x, y) => y.g - x.g)[0];
  if (tot && tot.g >= 0.85 && namCuaBai(tot.w) === ref.nam) return { ...ref, ketQua: 'CHƯA CÓ DOI', chiTiet: 'Crossref có: doi.org/' + tot.w.DOI, goiY: tot.w.DOI };
  return { ...ref, ketQua: 'CHƯA CÓ DOI', chiTiet: 'Crossref không có bản khớp (sách, báo cáo hay tài liệu không đăng ký DOI thì bình thường)' };
}

async function main(argv) {
  const chiDoc = argv.includes('--chi-doc'), json = argv.includes('--json');
  const trangs = argv.filter(a => !a.startsWith('--'));
  const ds = (trangs.length ? trangs : TRANG_MAC_DINH).flatMap(f => docDanhMuc(readFileSync(join(ROOT, f), 'utf8'), f));
  // Một tài liệu có thể xuất hiện ở nhiều trang: chỉ gọi Crossref một lần cho mỗi DOI hay mỗi nguyên văn
  const daKiem = new Map(), kq = [];
  for (const ref of ds) {
    const khoa = ref.doi || ref.nguyenVan;
    if (chiDoc) { kq.push({ ...ref, ketQua: '—', chiTiet: '' }); continue; }
    if (!daKiem.has(khoa)) { daKiem.set(khoa, await kiemMuc(ref)); await ngu(250); }
    const k = daKiem.get(khoa); kq.push({ ...ref, ketQua: k.ketQua, chiTiet: k.chiTiet, goiY: k.goiY });
  }
  if (json) { console.log(JSON.stringify(kq, null, 2)); return kq; }
  let trang = '';
  for (const r of kq) {
    if (r.trang !== trang) { trang = r.trang; console.log('\n## ' + trang + ' (' + kq.filter(x => x.trang === trang).length + ' mục)'); }
    const dau = r.ketQua === 'KHỚP' ? '✓' : r.ketQua === '—' ? '·' : r.ketQua === 'CHƯA CÓ DOI' && !r.goiY ? '○' : '✗';
    console.log(dau + ' ' + r.ho + ' (' + r.nam + ') ' + r.tieuDe.slice(0, 70) + (r.tieuDe.length > 70 ? '…' : '') + (r.ketQua !== '—' ? ' – ' + r.ketQua + (r.chiTiet ? ': ' + r.chiTiet : '') : ''));
  }
  const dem = {}; kq.forEach(r => { dem[r.ketQua] = (dem[r.ketQua] || 0) + 1; });
  console.log('\nTổng: ' + kq.length + ' mục · ' + Object.entries(dem).map(([k, v]) => k + ' ' + v).join(' · '));
  return kq;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(kq => { process.exitCode = kq.some(r => /SAI|KHÔNG CÓ/.test(r.ketQua)) ? 1 : 0; });
}
