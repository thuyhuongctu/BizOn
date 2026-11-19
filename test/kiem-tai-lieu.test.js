// scripts/kiem-tai-lieu.mjs (19/11/2026): đối chiếu danh mục tài liệu tham khảo của các trang học thuật với Crossref.
// Test không gọi mạng: kiểm phần đọc danh mục trên ba trang thật và phần so sánh bằng bản ghi Crossref giả.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const R = f => path.join(__dirname, '..', f);
const src = fs.readFileSync(R('scripts/kiem-tai-lieu.mjs'), 'utf8');
assert.doesNotMatch(src, /writeFile|appendFile|unlink|rmSync|renameSync/, 'script chỉ đọc, không ghi hay xóa tệp');
assert.match(src, /api\.crossref\.org/, 'dùng Crossref');
assert.doesNotMatch(src, /@[a-z0-9-]+\.[a-z]{2,}/i, 'không gửi email trong User-Agent hay mã');

(async () => {
  const K = await import(pathToFileURL(R('scripts/kiem-tai-lieu.mjs')).href);
  // 1. Đọc danh mục trên ba trang mặc định
  for (const f of K.TRANG_MAC_DINH) {
    const ds = K.docDanhMuc(fs.readFileSync(R(f), 'utf8'), f);
    assert.ok(ds.length >= 10, f + ': đọc được ≥ 10 mục (' + ds.length + ')');
    for (const r of ds) {
      assert.ok(r.nam >= 1900 && r.nam <= 2030, f + ': năm hợp lệ – ' + r.nguyenVan.slice(0, 60));
      assert.ok(r.tieuDe.length >= 8 && !/Chép|Copy/.test(r.tieuDe), f + ': có tiêu đề, không lẫn chữ nút – ' + r.tieuDe);
      assert.ok(r.ho.length >= 2, f + ': có họ tác giả');
      if (r.doi) assert.match(r.doi, /^10\.\d{4,9}\/\S+$/, f + ': DOI đúng dạng – ' + r.doi);
    }
    assert.ok(ds.filter(r => r.doi).length >= 8, f + ': phần lớn mục có DOI');
  }
  const thuat = K.docDanhMuc(fs.readFileSync(R('truong-hoc-thuat.html'), 'utf8'));
  const sara = thuat.find(r => r.ho === 'Sarasvathy');
  assert.equal(sara.nam, 2001); assert.equal(sara.doi, '10.5465/amr.2001.4378020');
  assert.match(sara.tieuDe, /^Causation and effectuation/);

  // 2. So sánh với bản ghi Crossref giả
  const w = { title: ['Causation and Effectuation: Toward a Theoretical Shift from Economic Inevitability to Entrepreneurial Contingency'], issued: { 'date-parts': [[2001, 4]] }, author: [{ family: 'Sarasvathy' }] };
  assert.equal(K.doiChieu(sara, w).ketQua, 'KHỚP', 'khớp dù khác hoa/thường');
  assert.equal(K.doiChieu({ ...sara, nam: 2003 }, w).ketQua, 'SAI NĂM');
  assert.equal(K.doiChieu({ ...sara, tieuDe: 'A completely different paper about gravity models' }, w).ketQua, 'SAI TÊN');
  assert.equal(K.doiChieu({ ...sara, ho: 'Nguyen', tacGia: 'Nguyen, V.' }, w).ketQua, 'SAI TÁC GIẢ');
  const silva = { ho: 'Santos Silva', tacGia: 'Santos Silva, J. M. C., & Tenreyro, S.', nam: 2006, tieuDe: 'The log of gravity' };
  assert.equal(K.doiChieu(silva, { title: ['The Log of Gravity'], issued: { 'date-parts': [[2006]] }, author: [{ family: 'Silva' }, { family: 'Tenreyro' }] }).ketQua, 'KHỚP', 'họ ghép vẫn khớp');

  // 3. kiemMuc với fetch giả: DOI không có; mục chưa có DOI nhưng Crossref tìm thấy thì gợi ý
  const fake = (status, body) => async () => ({ status, ok: status < 400, json: async () => body });
  assert.equal((await K.kiemMuc({ ...sara }, fake(404, {}))).ketQua, 'DOI KHÔNG CÓ');
  assert.equal((await K.kiemMuc({ ...sara }, fake(200, { message: w }))).ketQua, 'KHỚP');
  const noDoi = { ...sara, doi: '' };
  const g = await K.kiemMuc(noDoi, fake(200, { message: { items: [{ ...w, DOI: '10.5465/amr.2001.4378020' }] } }));
  assert.equal(g.ketQua, 'CHƯA CÓ DOI'); assert.equal(g.goiY, '10.5465/amr.2001.4378020', 'gợi ý DOI tìm thấy');
  const g2 = await K.kiemMuc(noDoi, fake(200, { message: { items: [] } }));
  assert.equal(g2.ketQua, 'CHƯA CÓ DOI'); assert.equal(g2.goiY, undefined);
  console.log('kiem-tai-lieu: ok');
})().catch(e => { console.error(e); process.exit(1); });
