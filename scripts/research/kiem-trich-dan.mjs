#!/usr/bin/env node
/* Kiểm trích dẫn APA 7 trong một tài liệu Markdown (docs/research/*.md, bài hội thảo, hồ sơ). Không cần thư viện ngoài.
 *
 * Dùng:  node scripts/research/kiem-trich-dan.mjs <tệp.md> [tệp.md …] [--crossref] [--json ra.json]
 *
 * Kiểm ngoại tuyến (luôn chạy):
 *   1. Mỗi trích dẫn trong bài, kiểu (Tác giả, năm) hay Tác giả (năm), phải có mục trong «Tài liệu tham khảo» / «References»,
 *      khớp họ tác giả đầu và năm.
 *   2. Mỗi mục tài liệu tham khảo phải được trích ít nhất một lần.
 *   3. Số tác giả khớp quy tắc APA 7: một tên → 1 tác giả; «A & B» → đúng 2 tác giả; «A et al.» → từ 3 tác giả.
 *   4. Mục có DOI phải viết dạng https://doi.org/10.xxxx/…; mục không có DOI chỉ cảnh báo (sách, báo cáo).
 * Kiểm trực tuyến (--crossref): tra từng DOI trên api.crossref.org, so họ tác giả đầu, năm (in hoặc trực tuyến) và tên bài
 * (độ trùng từ ≥ 0,6). Chỉ đọc metadata công khai; không gửi thông tin người dùng.
 * Mã thoát: 0 nếu không có lỗi, 1 nếu có lỗi. Cảnh báo không làm hỏng mã thoát. */
import fs from 'node:fs';
import path from 'node:path';

const TIEU_DE_TLTK = /^#{2,3}\s+(?:\d+\.\s*)?(?:Tài liệu tham khảo|References)\b.*$/m;
const NAM = String.raw`(?:\d{4}[a-z]?|n\.d\.)`;
// Họ: chữ hoa đầu, có thể hai từ («World Bank») và tiểu từ viết thường đứng trước («de Jong», «van der Berg»).
const HO = String.raw`(?:(?:de|van|der|den|von|da|di|du|dos|del|ten|ter)\s)*[\p{Lu}][\p{L}'’\-]+(?:\s[\p{Lu}][\p{L}'’\-]+)?`;

/** Bỏ dấu, chữ thường: so họ «Jirásek» với «Jirasek» của Crossref. */
export const chuan = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();

/** Tách tài liệu: phần thân (bỏ khối mã) và các dòng mục tài liệu tham khảo. */
export function tachTaiLieu(md) {
  const m = md.match(TIEU_DE_TLTK);
  if (!m) return { than: md, muc: [], coTltk: false };
  const dau = m.index, sau = md.slice(dau + m[0].length);
  const het = sau.search(/^##\s/m);
  const vung = het >= 0 ? sau.slice(0, het) : sau;
  const than = (md.slice(0, dau) + (het >= 0 ? sau.slice(het) : '')).replace(/```[\s\S]*?```/g, '');
  const muc = vung.split('\n').map(l => l.trim()).filter(l => new RegExp(String.raw`\(${NAM}[^)]*\)\.`).test(l));
  return { than, muc, coTltk: true };
}

/** Đọc một mục APA: tác giả đầu, số tác giả, năm, tên bài, DOI. */
export function docMuc(dong) {
  const m = dong.match(new RegExp(String.raw`^(.+?)\s\((${NAM})(?:,[^)]*)?\)\.\s*(.*)$`));
  if (!m) return null;
  const tacGia = m[1].trim(), nam = m[2], conLai = m[3];
  const phan = tacGia.split(/,\s*/).map(x => x.replace(/^&\s*/, '').trim()).filter(Boolean);
  const laChuCai = x => /^(\p{Lu}\.(?:[\s-]*\p{Lu}\.)*|\p{Lu}\.-\p{Lu}\.)$/u.test(x);
  const ho = phan.filter(x => !laChuCai(x));
  const soTacGia = /\.\.\./.test(tacGia) ? 21 : Math.max(1, ho.length);
  const hoDau = (ho[0] || tacGia).replace(/\.$/, '').trim();
  const ten = conLai.split(/\.\s+(?=\*|https?:|Trong |In )/)[0].replace(/\*/g, '').replace(/\.$/, '').trim();
  const doiM = conLai.match(/https?:\/\/(?:dx\.)?doi\.org\/(10\.\d{4,9}\/\S+?)[.,;]?$/) || conLai.match(/\b(10\.\d{4,9}\/\S+?)[.,;]?$/);
  return { dong, hoDau, soTacGia, nam, ten, doi: doiM ? doiM[1] : null, doiChuan: /https:\/\/doi\.org\/10\./.test(conLai) };
}

/** Tìm trích dẫn trong thân bài. Trả về [{hoDau, kieu: 1|2|'etal', nam, vanBan}]. */
export function timTrichDan(than) {
  const ra = [];
  const them = (nhom, chuoiNam, vanBan) => {
    const g = nhom.trim().replace(/^(?:e\.g\.,|xem|see|ví dụ|chẳng hạn)\s+/i, '');
    let hoDau, kieu;
    const etal = g.match(new RegExp(String.raw`^(${HO})\set al\.$`, 'u'));
    const hai = g.match(new RegExp(String.raw`^(${HO})\s(?:&|and|và)\s(${HO})$`, 'u'));
    const mot = g.match(new RegExp(String.raw`^(${HO})$`, 'u'));
    if (etal) { hoDau = etal[1]; kieu = 'etal'; } else if (hai) { hoDau = hai[1]; kieu = 2; } else if (mot) { hoDau = mot[1]; kieu = 1; } else return;
    for (const nam of chuoiNam.split(/,\s*/)) if (new RegExp(`^${NAM}$`).test(nam.trim())) ra.push({ hoDau, kieu, nam: nam.trim(), vanBan });
  };
  // Trong ngoặc: (A, 2001; B & C, 1977, 2009; D et al., 2021, p. 5)
  for (const m of than.matchAll(/\(([^()]*?\d{4}[a-z]?[^()]*?)\)/g)) {
    for (const doan of m[1].split(';')) {
      const k = doan.trim().match(new RegExp(String.raw`^(.*?),\s*(${NAM}(?:,\s*${NAM})*)(?:,\s*(?:p|pp|tr)\.\s*[\d–-]+)?$`, 'u'));
      if (k) them(k[1], k[2], m[0]);
    }
  }
  // Kể tên: A (2001), A và B (2009), A et al. (2021)
  const keTen = new RegExp(String.raw`(${HO}(?:\set al\.|\s(?:&|and|và)\s${HO})?)\s\((${NAM}(?:,\s*${NAM})*)\)`, 'gu');
  for (const m of than.matchAll(keTen)) them(m[1], m[2], m[0]);
  return ra;
}

/** Kiểm ngoại tuyến. Trả về {loi: [], canhBao: [], muc: [...]} */
export function kiemNgoaiTuyen(md) {
  const loi = [], canhBao = [];
  const { than, muc: dongMuc, coTltk } = tachTaiLieu(md);
  if (!coTltk) return { loi: ['Không thấy mục «## Tài liệu tham khảo» hay «## References».'], canhBao, muc: [], trichDan: [] };
  const muc = [];
  for (const d of dongMuc) { const x = docMuc(d); if (x) muc.push(x); else loi.push('Không đọc được mục: ' + d.slice(0, 80)); }
  const trichDan = timTrichDan(than);
  // Bắt kiểu kể tên có thể dính chữ đứng trước («Like Jirásek (2026)»): thử bỏ dần từ đầu cho đến khi khớp.
  const khop = t => {
    const tu = t.hoDau.split(/\s+/);
    for (let i = 0; i < tu.length; i++) {
      const ho = chuan(tu.slice(i).join(' '));
      const r = muc.filter(x => chuan(x.hoDau) === ho && x.nam === t.nam);
      if (r.length) return r;
    }
    return [];
  };
  const daTrich = new Set();
  for (const t of trichDan) {
    const ung = khop(t);
    if (!ung.length) { loi.push(`Trích dẫn không có trong tài liệu tham khảo: ${t.vanBan}`); continue; }
    ung.forEach(x => daTrich.add(x));
    const dung = ung.some(x => (t.kieu === 1 && x.soTacGia === 1) || (t.kieu === 2 && x.soTacGia === 2) || (t.kieu === 'etal' && x.soTacGia >= 3));
    if (!dung) {
      const n = ung[0].soTacGia, mau = n === 1 ? `${t.hoDau}` : n === 2 ? `${t.hoDau} & …` : `${t.hoDau} et al.`;
      loi.push(`Số tác giả không khớp APA 7 ở «${t.vanBan}»: mục có ${n} tác giả, nên viết «${mau}».`);
    }
  }
  for (const x of muc) {
    if (!daTrich.has(x)) loi.push(`Mục không được trích trong bài: ${x.hoDau} (${x.nam})`);
    if (!x.doi) canhBao.push(`Không có DOI (kiểm tay nếu là bài tạp chí): ${x.hoDau} (${x.nam})`);
    else if (!x.doiChuan) loi.push(`DOI nên viết dạng https://doi.org/…: ${x.hoDau} (${x.nam})`);
  }
  const trung = new Map();
  for (const x of muc) { const k = chuan(x.hoDau) + x.nam + x.soTacGia; if (trung.has(k) && !/[a-z]$/.test(x.nam)) loi.push(`Hai mục cùng tác giả đầu và năm, cần thêm a/b: ${x.hoDau} (${x.nam})`); trung.set(k, 1); }
  return { loi, canhBao, muc, trichDan };
}

const tu = s => new Set(chuan(s).replace(/<[^>]+>/g, ' ').split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 2));

/** So một mục với bản ghi Crossref (message của /works/{doi}). Trả về danh sách lỗi (rỗng nếu khớp). */
export function soCrossref(muc, msg) {
  const loi = [];
  const tg = (msg.author || []).find(a => a.sequence === 'first') || (msg.author || [])[0];
  const hoCr = tg ? (tg.family || tg.name || '') : '';
  if (hoCr && !chuan(hoCr).includes(chuan(muc.hoDau).split(' ').pop())) loi.push(`họ tác giả đầu: bài ghi «${muc.hoDau}», Crossref ghi «${hoCr}»`);
  const namCr = ['published-print', 'published-online', 'issued', 'published'].map(k => msg[k]?.['date-parts']?.[0]?.[0]).filter(Boolean).map(String);
  if (namCr.length && !/n\.d\./.test(muc.nam) && !namCr.includes(muc.nam.slice(0, 4))) loi.push(`năm: bài ghi ${muc.nam}, Crossref ghi ${[...new Set(namCr)].join('/')}`);
  const tenCr = (msg.title || [])[0] || '';
  if (tenCr && muc.ten) {
    const a = tu(muc.ten), b = tu(tenCr); const chung = [...a].filter(w => b.has(w)).length;
    const doTrung = chung / Math.max(1, Math.min(a.size, b.size));
    if (doTrung < 0.6) loi.push(`tên bài lệch (trùng ${doTrung.toFixed(2)}): Crossref ghi «${tenCr}»`);
  }
  return loi;
}

const ngu = ms => new Promise(r => setTimeout(r, ms));
// Crossref giới hạn tốc độ: tra lần lượt, nghỉ giữa các lần; gặp 429 thì chờ (theo Retry-After nếu có) rồi thử lại, tối đa 4 lần.
async function traCrossref(doi) {
  for (let lan = 0; lan < 4; lan++) {
    const r = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi), { headers: { 'User-Agent': 'BizOn-kiem-trich-dan/1.0' } });
    if (r.status === 404) return { khongCo: true };
    if (r.status === 429 || r.status >= 500) { await ngu(1000 * (Number(r.headers.get('retry-after')) || 2 ** (lan + 1))); continue; }
    if (!r.ok) throw new Error('Crossref trả ' + r.status);
    return (await r.json()).message;
  }
  throw new Error('Crossref bận, thử lại sau');
}

export async function kiemTep(tep, { crossref = false } = {}) {
  const kq = kiemNgoaiTuyen(fs.readFileSync(tep, 'utf8'));
  if (crossref) {
    for (const x of kq.muc.filter(m => m.doi)) {
      try {
        await ngu(400);
        const msg = await traCrossref(x.doi);
        if (msg.khongCo) kq.loi.push(`DOI không có trên Crossref: ${x.doi}`);
        else soCrossref(x, msg).forEach(l => kq.loi.push(`${x.hoDau} (${x.nam}), ${x.doi}: ${l}`));
      } catch (e) { kq.canhBao.push(`Không tra được ${x.doi}: ${e.message}`); }
    }
  }
  return { tep, ...kq };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const args = process.argv.slice(2);
  const iJson = args.indexOf('--json'), raJson = iJson >= 0 ? args[iJson + 1] : null;
  const tepS = args.filter((a, i) => !a.startsWith('--') && !(iJson >= 0 && i === iJson + 1));
  if (!tepS.length) { console.error('Dùng: node scripts/research/kiem-trich-dan.mjs <tệp.md> … [--crossref] [--json ra.json]'); process.exit(2); }
  const ketQua = [];
  for (const t of tepS) {
    const kq = await kiemTep(t, { crossref: args.includes('--crossref') });
    ketQua.push({ tep: kq.tep, loi: kq.loi, canhBao: kq.canhBao, soMuc: kq.muc.length, soTrichDan: kq.trichDan.length });
    console.log(`\n${t}: ${kq.muc.length} mục, ${kq.trichDan.length} lượt trích, ${kq.loi.length} lỗi, ${kq.canhBao.length} cảnh báo`);
    kq.loi.forEach(l => console.log('  LỖI  ' + l));
    kq.canhBao.forEach(l => console.log('  ⚠    ' + l));
  }
  if (raJson) fs.writeFileSync(raJson, JSON.stringify(ketQua, null, 2));
  process.exit(ketQua.some(k => k.loi.length) ? 1 : 0);
}
