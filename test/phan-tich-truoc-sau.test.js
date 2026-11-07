/* Script phân tích phiếu trước–sau (PR 7 của kế hoạch docs/roadmap/KE-HOACH-DON-HE-SINH-THAI-2026-11.md, 06/11/2026): đọc surveys.csv của gói
 * dữ liệu nghiên cứu, ghép cặp pre/post theo student_code (lấy phiếu mới nhất), tính Δ, d Cohen, t cặp, Wilcoxon; ra Markdown. Kiểm bằng dữ liệu giả
 * có dịch chuyển biết trước; không chứa dữ liệu thật. */
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path'), { execFileSync } = require('node:child_process');
const ROOT = path.join(__dirname, '..');
(async () => {
  const m = await import(path.join(ROOT, 'scripts/research/phan-tich-truoc-sau.mjs'));
  // Sinh dữ liệu giả: 40 sinh viên, điểm A tăng trung bình 2, tự tin tăng 0,5; 3 sinh viên chỉ có phiếu trước; 1 nộp trùng phiếu sau
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const head = 'instrument,phase,student_code,role,rounds_played,score_a,out_o1,out_o2,b_1,b_2,b_3,b_4,b_5,b_6,b_7,b_8,nps,created_at,c_1,c_2';
  const rows = [];
  for (let i = 0; i < 43; i++) {
    const code = 'SV' + String(i).padStart(2, '0'); const pre = Math.min(15, Math.max(0, Math.round(7 + rnd() * 5)));
    const b = Array.from({ length: 8 }, () => 2 + Math.round(rnd() * 2));
    rows.push(['quocte', 'pre', code, '', '', pre, 2, 1, ...b, '', '2026-10-20T08:00:00Z', '', ''].join(','));
    if (i < 40) {
      const post = Math.min(15, pre + 1 + Math.round(rnd() * 2)); const b2 = b.map(x => Math.min(5, x + (rnd() < 0.5 ? 1 : 0)));
      rows.push(['quocte', 'post', code, 'CEO', 6, post, 3, 2, ...b2, 8 + Math.round(rnd() * 2), '2026-10-27T08:00:00Z', 4, 5].join(','));
      if (i === 0) rows.push(['quocte', 'post', code, 'CEO', 6, 15, 3, 2, ...b2, 10, '2026-10-28T08:00:00Z', 5, 5].join(','));   // nộp lại, phải lấy bản này
    }
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pts-')); const csv = path.join(tmp, 'KTM330HM01.surveys.csv');
  fs.writeFileSync(csv, head + '\n' + rows.join('\n') + '\n');
  const r = m.analyse(m.parseCsv(fs.readFileSync(csv, 'utf8')), 'KTM330HM01');
  assert.equal(r.rows, 84); assert.equal(r.pairs, 40); assert.deepEqual(r.unpaired, { pre: 3, post: 0 });
  assert.ok(r.score_a.diff_mean >= 1.5 && r.score_a.diff_mean <= 2.5, 'Δ điểm A ≈ 2, đang ' + r.score_a.diff_mean);
  assert.ok(r.score_a.d_z > 0.8 && r.score_a.p_t < 0.001 && r.score_a.p_wilcoxon < 0.001, 'dịch chuyển rõ phải có d lớn, p nhỏ: ' + JSON.stringify(r.score_a));
  assert.equal(r.score_a.worse, 0);
  assert.ok(r.b_total.diff_mean > 0 && r.b['b_1'].n === 40, 'tự tin tăng, đủ 40 cặp');
  assert.ok(r.post.nps && r.post.nps.n === 40 && r.post.nps.nps >= 0, 'NPS từ phiếu sau');
  assert.equal(r.post.c.c_1.n, 40);
  // Phiếu nộp lại: SV00 lấy bản mới nhất (score 15)
  const r0 = m.analyse(m.parseCsv(head + '\n' + rows.filter(x => x.includes(',SV00,')).join('\n')), 'x'); assert.equal(r0.score_a.post_mean, 15);
  // Không đổi → Δ = 0, d = null hoặc 0, Wilcoxon bỏ qua
  const same = m.pairedStats([5, 6, 7, 8, 9, 10], [5, 6, 7, 8, 9, 10]); assert.equal(same.diff_mean, 0); assert.equal(same.wilcoxon_W, null);
  // CSV có dấu phẩy trong ngoặc kép
  assert.deepEqual(m.parseCsv('a,b\n"x, y",2\n')[0], { a: 'x, y', b: '2' });
  // Chạy dòng lệnh: thư mục nhiều lớp → Markdown có bảng từng lớp
  fs.mkdirSync(path.join(tmp, 'KTM330HM02')); fs.copyFileSync(csv, path.join(tmp, 'KTM330HM02', 'surveys.csv'));
  const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts/research/phan-tich-truoc-sau.mjs'), tmp, '--json', path.join(tmp, 'ra.json')], { encoding: 'utf8' });
  assert.ok(out.includes('| KTM330HM01 |') && out.includes('| KTM330HM02 |') && out.includes('không phải tác động nhân quả'), 'Markdown có hai lớp và câu giới hạn diễn giải');
  assert.equal(JSON.parse(fs.readFileSync(path.join(tmp, 'ra.json'), 'utf8')).length, 2);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('phan-tich-truoc-sau: ok');
})().catch(e => { console.error(e); process.exit(1); });
