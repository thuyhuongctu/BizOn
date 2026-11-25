/* Script kiểm trích dẫn APA 7 (scripts/research/kiem-trich-dan.mjs, 25/11/2026): mỗi trích dẫn có mục tham khảo, mỗi mục được trích,
 * số tác giả đúng quy tắc (1 tên / A & B / A et al.), DOI viết dạng https://doi.org/…; so với Crossref theo họ, năm, tên bài.
 * Test không gọi mạng: phần Crossref kiểm bằng bản ghi giả. Tài liệu nghiên cứu thật của kho phải qua kiểm ngoại tuyến không lỗi. */
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), { spawnSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
(async () => {
  const m = await import(path.join(ROOT, 'scripts/research/kiem-trich-dan.mjs'));

  // 1. Đọc mục APA: họ đầu, số tác giả, năm, DOI
  const kir = m.docMuc('Kirschner, P. A., Sweller, J., & Clark, R. E. (2006). Why minimal guidance during instruction does not work. *Educational Psychologist, 41*(2), 75–86. https://doi.org/10.1207/s15326985ep4102_1');
  assert.deepEqual([kir.hoDau, kir.soTacGia, kir.nam, kir.doi], ['Kirschner', 3, '2006', '10.1207/s15326985ep4102_1']);
  assert.equal(kir.ten, 'Why minimal guidance during instruction does not work');
  const jv = m.docMuc('Johanson, J., & Vahlne, J.-E. (2009). The Uppsala model revisited. *JIBS, 40*(9), 1411–1431. https://doi.org/10.1057/jibs.2009.24');
  assert.equal(jv.soTacGia, 2, 'chữ cái đầu có gạch nối J.-E. không tính là họ');
  const wb = m.docMuc('World Bank. (2023). *Promoting innovative entrepreneurship in Viet Nam*. World Bank Group.');
  assert.deepEqual([wb.hoDau, wb.soTacGia, wb.doi], ['World Bank', 1, null], 'tác giả tổ chức');
  const lj = m.docMuc('Leemkuil, H., & de Jong, T. (2012). Adaptive advice. *AMLE, 11*(4), 653–665. https://doi.org/10.5465/amle.2010.0141');
  assert.equal(lj.soTacGia, 2, 'họ có tiểu từ viết thường');

  // 2. Bài mẫu có đúng các lỗi cố ý, không báo nhầm chỗ đúng
  const kq = m.kiemNgoaiTuyen(R('test/fixtures/trich-dan-loi.md'));
  const co = re => kq.loi.some(l => re.test(l));
  assert.ok(co(/không có trong tài liệu tham khảo: \(Nguyen, 2020\)/), 'trích dẫn thiếu mục');
  assert.ok(co(/Số tác giả không khớp APA 7 ở «Pollitt et al\. \(2012\)».*nên viết «Pollitt»/), 'et al. cho bài một tác giả');
  assert.ok(co(/không có trong tài liệu tham khảo: \(Paas, 1993\)/), 'sai năm');
  assert.ok(co(/Mục không được trích trong bài: Paas \(1992\)/) && co(/Mục không được trích trong bài: Zaheer \(1995\)/), 'mục thừa');
  assert.ok(co(/DOI nên viết dạng https:\/\/doi\.org\/…: Pollitt/), 'DOI dạng cũ doi:');
  assert.ok(kq.canhBao.some(l => /Không có DOI.*World Bank \(2023\)/.test(l)), 'không DOI chỉ cảnh báo');
  assert.ok(!co(/Ghost/), 'bỏ khối mã');
  assert.ok(!co(/Jirásek|Kirschner|Leemkuil|Johanson|World Bank/), 'không báo nhầm: ' + kq.loi.filter(l => /Jirásek|Kirschner|Leemkuil|Johanson|World Bank/.test(l)).join(' | '));
  assert.equal(kq.loi.length, 6, 'đúng 6 lỗi: ' + kq.loi.join(' | '));
  assert.equal(kq.trichDan.filter(t => t.hoDau.endsWith('Johanson')).length, 2, '«1977, 2009» là hai lượt trích');

  // 3. So Crossref bằng bản ghi giả
  const msg = { author: [{ family: 'Kirschner', sequence: 'first' }], issued: { 'date-parts': [[2006, 6]] }, title: ['Why Minimal Guidance During Instruction Does Not Work: An Analysis of the Failure of Constructivist, Discovery, Problem-Based, Experiential, and Inquiry-Based Teaching'] };
  assert.deepEqual(m.soCrossref(kir, msg), [], 'khớp khi họ, năm, tên bài đúng (tên Crossref dài hơn vẫn khớp)');
  const sai = m.soCrossref(kir, { ...msg, author: [{ family: 'Sweller', sequence: 'first' }], issued: { 'date-parts': [[2005]] }, title: ['Cognitive load theory and instructional design'] });
  assert.equal(sai.length, 3, 'báo lệch họ, năm, tên bài: ' + sai.join(' | '));
  const jir = m.docMuc('Jirásek, M. (2026). Distant Futures. *Simulation & Gaming*. https://doi.org/10.1177/10468781261509429');
  assert.deepEqual(m.soCrossref(jir, { author: [{ family: 'Jirasek', sequence: 'first' }], issued: { 'date-parts': [[2027]] }, 'published-online': { 'date-parts': [[2026, 11]] }, title: ['Distant Futures'] }), [], 'bỏ dấu khi so họ; năm trực tuyến được chấp nhận');

  // 4. Tài liệu nghiên cứu thật: không lỗi ngoại tuyến; dòng lệnh trả mã 1 khi có lỗi
  for (const f of ['docs/research/THIET-KE-DOT-KHAO-SAT-SAU.md', 'docs/doi-sanh-nen-tang-mo-phong.md']) {
    const k = m.kiemNgoaiTuyen(R(f));
    assert.deepEqual(k.loi, [], f + ' có lỗi trích dẫn');
    assert.ok(k.muc.length >= 4, f + ' đọc được mục tham khảo');
  }
  const cli = spawnSync(process.execPath, [path.join(ROOT, 'scripts/research/kiem-trich-dan.mjs'), path.join(ROOT, 'test/fixtures/trich-dan-loi.md')], { encoding: 'utf8' });
  assert.equal(cli.status, 1, 'mã thoát 1 khi có lỗi');
  assert.match(cli.stdout, /6 lỗi/);

  const v = +R('sw.js').match(/bizon-v(\d+)/)[1];
  assert.ok(v >= 994, 'sw.js phải ≥ bizon-v994, đang ' + v);
  console.log('kiem-trich-dan: đạt');
})().catch(e => { console.error(e); process.exit(1); });
