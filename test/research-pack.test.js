'use strict';
// R4 · Gói dữ liệu nghiên cứu ẩn danh: mã hoá dấu vết (dc-v1), ZIP không nén, dựng gói (rp-v1), nút trên Trang Giảng viên (demo).
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const DC = require('../js/core/decision-codes.js');
const Z = require('../js/core/zip-store.js');
const RP = require('../js/core/research-pack.js');
const CT = require('../js/case-task-data.js');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.error('Cần cài playwright.'); process.exit(2); }
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

// --- mã hoá dấu vết ---
{ const r = DC.codeTier1([{ w: 1, m: 2, menu: 0, loc: 2, net: 1 }, { w: 2, m: 1, menu: 1, loc: 1, net: 2 }, { w: 3, m: 0, menu: 0, loc: 2, net: 5 }, { w: 4, m: 0, menu: 2, loc: 0, net: -1 }, { w: 5, m: 0, menu: 1, loc: 1, net: 4 }]);
  assert.deepEqual(r.map(x => x.code), ['survey', 'explore', 'exploit-known', 'exploit-unknown', 'exploit-known']); assert.deepEqual(r.map(x => x.uppsala_ok), [1, 1, 1, 0, 1]); assert.deepEqual(r.map(x => x.logic), ['causal', 'effectual', 'causal', 'leap', 'causal']);
  const s = DC.summarize(r); assert.equal(s.uppsala_adherence, 0.8); assert.equal(s.effectual_share, 0.2); assert.equal(s.leap_share, 0.2); assert.equal(s.n_coded, 5); }
assert.deepEqual(DC.codeTier1(null), []); assert.deepEqual(DC.codeTier1([{ w: 1, m: 7 }]).map(x => x.code + ':' + x.uppsala_ok), ['unknown:null']);
{ const r = DC.codeTier2([{ round_number: 3, result_json: { decisions: { production: 3000 }, lostSales: 0 } }, { round_number: 1, result_json: { decisions: { production: 2000, funding: 'loan', whatIfUsed: 1 }, lostSales: 0 } }, { round_number: 2, result_json: { decisions: { production: 2500 }, lostSales: 30 } }, { round_number: 4, result_json: { decisions: { production: 2000 }, lostSales: 0 } }]);
  assert.deepEqual(r.map(x => x.seq), [1, 2, 3, 4], 'sắp theo vòng'); assert.deepEqual(r.map(x => x.code), ['start', 'expand-uninformed', 'expand-informed', 'contract']); assert.deepEqual(r.map(x => x.uppsala_ok), [null, 0, 1, 1]);
  assert.equal(r[1].d_production, 0.25); assert.equal(r[0].what_if, 1); assert.equal(r[0].loan, 1); assert.equal(r[1].loan, ''); assert.equal(DC.summarize(r).uppsala_adherence, 0.667); }
assert.deepEqual(DC.codeTier3Brand([null, 3, 1, null, null, 2, 4]).map(x => x.market + ':' + x.code + ':' + x.uppsala_ok), ['2:near-first:1', '5:near-first:1', '1:sequential:1', '6:sequential:1']);
assert.deepEqual(DC.codeTier3Brand([1, null, 2]).map(x => x.code), ['leapfrog', 'late-near']); assert.equal(DC.summarize(DC.codeTier3Brand([1, null, 2])).uppsala_adherence, 0.5);
assert.deepEqual(DC.codeTier3Durian(['DOM', 'CN', 'BORDER', 'jp']).map(x => x.code), ['near-first', 'sequential', 'late-near', 'sequential']);
assert.deepEqual(DC.codePassport({ tiers: { t1: { status: 'done', weeks: [{ w: 1, m: 1, menu: 0, loc: 0 }] }, t2: { status: 'done' }, t3: { status: 'done', variant: 'durian', channelOrder: ['CN'] } } }, []).map(x => x.tier + x.code), ['t1explore', 't3leapfrog']);
assert.equal(DC.summarize([]).uppsala_adherence, ''); assert.equal(DC.CODING_VERSION, 'dc-v1');

// --- ZIP ---
{ assert.equal(Z.crc32(new TextEncoder().encode('123456789')).toString(16), 'cbf43926');
  const bytes = Z.zip([{ name: 'a.csv', data: 'x,y\n1,2\n' }, { name: 'thư mục/ghi chú.md', data: '# xin chào' }, { name: 'b.bin', data: new Uint8Array([1, 2, 3]) }], { date: new Date(2026, 9, 27, 10, 0, 0) });
  assert.equal(bytes[0], 0x50); assert.equal(bytes[1], 0x4B); assert.ok(bytes.length > 150);
  const tmp = path.join(require('node:os').tmpdir(), 'bizon-rp-test.zip'); fs.writeFileSync(tmp, bytes);
  let py = null; try { py = execFileSync('python3', ['-c', "import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip());print('|'.join(i.filename+':'+str(i.file_size) for i in z.infolist()));print(z.read('thư mục/ghi chú.md').decode())", tmp], { encoding: 'utf8' }); } catch (e) { py = null; }
  if (py !== null) { const [bad, list, md] = py.trim().split('\n'); assert.equal(bad, 'None', 'zip hợp lệ'); assert.equal(list, 'a.csv:8|thư mục/ghi chú.md:11|b.bin:3'); assert.equal(md, '# xin chào'); } else console.warn('(bỏ qua kiểm ZIP bằng python3)');
  try { fs.unlinkSync(tmp); } catch (e) {} }

// --- dựng gói ---
const fixture = { classCode: 'kt-k48', caseTaskData: CT, now: '2026-11-10T00:00:00Z',
  submissions: [
    { team_name: 'Đội A', round_number: 1, created_at: '2026-11-01T00:00:00Z', result_json: { share: 25, netProfit: 10, revenue: 200, balance: 500, sold: 1800, lostSales: 0, inventory: 200, oee: 70, defect: 2, quickRatio: 1.2, brandLoyalty: 50, roi: 0.1, ach: 1, win: false, difficulty: 'normal', decisions: { price: 150, marketing: 50, production: 2000, rd: 30, workers: 45, training: 0, paymentTerm: 30, funding: 'equity' }, journey: { journeyId: 'J-KT-K48-DOI-A-2026-11-01', tier: 't2', carryApplied: { balance: 528 } }, explain: 'hidden' } },
    { team_name: 'Đội A', round_number: 2, created_at: '2026-11-01T01:00:00Z', result_json: { share: 27, netProfit: 12, lostSales: 40, decisions: { price: 150, marketing: 60, production: 2600, funding: 'loan' }, explain: 'hidden' } },
    { team_name: 'Đội A', round_number: 3, created_at: '2026-11-01T02:00:00Z', result_json: { share: 28, netProfit: 15, lostSales: 0, decisions: { production: 3100 }, win: true, explain: 'hidden' } },
    { team_name: 'Đội B', round_number: 1, created_at: '2026-11-01T00:00:00Z', result_json: { share: 25, netProfit: -3, lostSales: 0, decisions: { production: 2000 } } },
    { team_name: 'Đội B', round_number: 2, created_at: '2026-11-01T01:00:00Z', result_json: { share: 24, netProfit: 1, lostSales: 0, decisions: { production: 2800 } } },
    { team_name: 'Rác', round_number: 1, result_json: null }],
  passports: [
    { team_name: 'Đội A', student_email: 'SVA@student.ctu.edu.vn', journey_id: 'J-KT-K48-DOI-A-2026-11-01', app_version: 'bizon-journey-v1', updated_at: '2026-11-02T00:00:00Z', passport: { journeyId: 'J-KT-K48-DOI-A-2026-11-01', teamName: 'Đội A', carryEnabled: true, tiers: { t1: { status: 'done', eff: 71, rank: 2, total: 4.2, style: { exploreWeeks: 1, exploitWeeks: 3, surveyWeeks: 1 }, weeks: [{ w: 1, m: 2, menu: 0, loc: 1, net: 1 }, { w: 2, m: 0, menu: 0, loc: 1, net: 3 }, { w: 3, m: 1, menu: 2, loc: 2, net: 1 }, { w: 4, m: 0, menu: 2, loc: 2, net: 4 }, { w: 5, m: 0, menu: 1, loc: 0, net: -1 }], explain: 'hidden' }, t2: { status: 'done', balanceEnd: 612, netProfitTotal: 96, shareEnd: 31.5, profitableRounds: 5, whatIfRounds: 2, rdCumulative: 180, loanEnd: 0, caseId: 'B', explain: 'hidden' }, t3: { status: 'done', variant: 'brand', total: 61, cashEnd: 3.2, repEnd: 70, entered: [null, 3, 1, null, null, 2, null], explain: 'hidden' } }, summary: { effectuationIndex: 0.4, causationIndex: 0.33, intlPattern: 'near-first' } } },
    { team_name: 'Đội B', student_email: 'svb@student.ctu.edu.vn', journey_id: 'J-KT-K48-DOI-B-2026-11-01', updated_at: '2026-11-02T00:00:00Z', passport: { journeyId: 'J-KT-K48-DOI-B-2026-11-01', teamName: 'Đội B', tiers: { t1: { status: 'pending' }, t2: { status: 'pending' }, t3: { status: 'locked', variant: 'durian' } } } }],
  caseTasks: [
    { student_email: 'sva@student.ctu.edu.vn', team_name: 'Đội A', phase: 'pre', form: 'A', duration_s: 420, explain: 'hidden', journey_id: 'J-KT-K48-DOI-A-2026-11-01', updated_at: '2026-10-30T00:00:00Z', answers: { version: 'ct-v1', items: [{ id: 'u1', mech: 'uppsala', choice: 'b', why: 'vì, "chưa" đủ' }, { id: 'o1', mech: 'outsidership', choice: 'a', why: 'quảng cáo' }, { id: 'x', mech: 'explain', text: 'dòng 1\ndòng 2' }] } },
    { student_email: 'sva@student.ctu.edu.vn', team_name: 'Đội A', phase: 'post', form: 'B', duration_s: 380, explain: 'hidden', journey_id: 'J-KT-K48-DOI-A-2026-11-01', updated_at: '2026-11-05T00:00:00Z', answers: { version: 'ct-v1', items: [{ id: 'u1', mech: 'uppsala', choice: 'b', why: 'cam kết theo tri thức' }] } },
    { student_email: 'svc@student.ctu.edu.vn', team_name: 'Đội C', phase: 'pre', form: 'B', explain: 'shown', updated_at: '2026-10-30T00:00:00Z', answers: { version: 'ct-v1', items: [{ id: 'v1', mech: 'void', choice: 'c', why: 'trung gian' }] } }],
  surveys: [{ instrument: 'quocte', phase: 'pre', student_code: 'AB12', score_a: 9, score_by_outcome: { o1: 2, o2: 1 }, likert_b: [3, 4, 5], likert_c: null, nps: null, created_at: '2026-10-29T00:00:00Z', open_like: 'tên tôi là Hương' },
    { instrument: 'quocte', phase: 'post', student_code: 'AB12', role: 'CEO', rounds_played: 6, score_a: 12, score_by_outcome: { o1: 3, o2: 2 }, likert_b: [4, 4, 5], likert_c: { 1: 5, 2: 4 }, nps: 9, created_at: '2026-11-06T00:00:00Z', open_improve: 'ít lỗi hơn' }] };
const pack = RP.build(fixture);
const fnv = s => RP.fnv(s); const KA = fnv('sva@student.ctu.edu.vn'), KB = fnv('svb@student.ctu.edu.vn'), KC = fnv('svc@student.ctu.edu.vn'), TA = fnv('kt-k48|đội a'), TB = fnv('kt-k48|đội b'), JA = fnv('J-KT-K48-DOI-A-2026-11-01');
assert.equal(pack.classCode, 'KT-K48'); assert.deepEqual(pack.stats, { participants: 3, teams: 2, rounds: 5, passports: 2, decisions: 5 + 5 + 3, case_answers: 5, surveys: 2 });
assert.deepEqual(pack.files.map(f => f.name), ['README.md', 'dictionary.csv', 'participants.csv', 'teams.csv', 'rounds.csv', 'decisions.csv', 'passports.csv', 'case_tasks.csv', 'surveys.csv']);
const file = n => pack.files.find(f => f.name === n).data, lines = n => file(n).trim().split('\n');
const parse = n => { const t = file(n); const rows = []; let row = [], f = '', q = false; for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; } else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; } else f += c; } if (f || row.length) { row.push(f); rows.push(row); } const h = rows.shift(); return rows.filter(r => r.length > 1).map(r => Object.fromEntries(h.map((k, i) => [k, r[i]]))); };
// ẩn danh: không email, không tên đội, không tên trong câu mở; khoá nhất quán giữa các tệp
const everything = pack.files.filter(f => f.name !== 'README.md' && f.name !== 'dictionary.csv').map(f => f.data).join('\n');
assert.ok(!/@|Đội A|Đội B|Đội C|sva|svb|Hương/i.test(everything), 'không lộ danh tính'); assert.ok(!/open_like|open_improve/.test(file('surveys.csv')), 'không câu mở');
const P = parse('participants.csv'); assert.deepEqual(P.map(p => p.student_key), [KA, KB, KC].sort());
const pa = P.find(p => p.student_key === KA); assert.deepEqual(pa, { student_key: KA, class: 'KT-K48', team_key: TA, journey_hash: JA, explain_condition: 'hidden', case_pre: '1', case_post: '1', has_passport: '1', t1_done: '1', t2_done: '1', t3_done: '1' });
assert.equal(P.find(p => p.student_key === KC).explain_condition, 'shown'); assert.equal(P.find(p => p.student_key === KC).has_passport, '0');
const T = parse('teams.csv'); assert.equal(T.length, 2); const ta = T.find(t => t.team_key === TA); assert.equal(ta.n_rounds, '3'); assert.equal(ta.journey_hash, JA); assert.equal(ta.carry_applied, '1'); assert.equal(ta.explain_condition, 'hidden'); assert.equal(ta.t2_uppsala_adherence, '0.5');
const Rd = parse('rounds.csv'); assert.equal(Rd.length, 5); const r2 = Rd.find(r => r.team_key === TA && r.round === '2'); assert.equal(r2.code, 'expand-uninformed', 'vòng 1 không có đơn hụt → vòng 2 tăng 30 % là uninformed (tín hiệu lấy từ vòng trước)');
assert.equal(Rd.find(r => r.team_key === TA && r.round === '2').lost_sales, '40'); assert.equal(Rd.find(r => r.team_key === TA && r.round === '3').code, 'expand-informed'); assert.equal(Rd.find(r => r.team_key === TB && r.round === '2').code, 'expand-uninformed');
assert.equal(Rd[0].funding, 'equity'); assert.equal(Rd.find(r => r.round === '1' && r.team_key === TA).carry_applied, '1'); assert.equal(Rd.find(r => r.round === '1' && r.team_key === TA).win, '0'); assert.equal(Rd.find(r => r.round === '3' && r.team_key === TA).win, '1');
const De = parse('decisions.csv'); assert.equal(De.filter(d => d.tier === 't1').length, 5); assert.equal(De.filter(d => d.tier === 't2').length, 5); assert.equal(De.filter(d => d.tier === 't3').length, 3);
assert.deepEqual(De.filter(d => d.tier === 't1').map(d => d.code), ['survey', 'exploit-known', 'explore', 'exploit-known', 'exploit-unknown']); assert.deepEqual(De.filter(d => d.tier === 't3').map(d => d.code), ['near-first', 'near-first', 'sequential']);
assert.equal(JSON.parse(De.find(d => d.tier === 't1' && d.seq === '2').detail).known_before, 1); assert.ok(De.filter(d => d.tier === 't2').every(d => d.student_key === '' && d.team_key));
const Pp = parse('passports.csv'); assert.equal(Pp.length, 2); const ppa = Pp.find(p => p.student_key === KA);
assert.equal(ppa.t1_eff, '71'); assert.equal(ppa.t2_case, 'B'); assert.equal(ppa.t3_markets_entered, '3'); assert.equal(ppa.intl_pattern, 'near-first'); assert.equal(ppa.t1_uppsala_adherence, '0.8'); assert.equal(ppa.t1_effectual_share, '0.2'); assert.equal(ppa.t2_uppsala_adherence, '0.5'); assert.equal(ppa.t3_uppsala_adherence, '1'); assert.equal(ppa.journey_uppsala_adherence, '0.8', '(4+1+3)/(5+2+3)'); assert.equal(ppa.carry_enabled, '1'); assert.equal(ppa.t3_explain, 'hidden');
assert.equal(Pp.find(p => p.student_key === KB).t1_done, '0'); assert.equal(Pp.find(p => p.student_key === KB).journey_uppsala_adherence, '0', 'đội B chỉ có 2 vòng: start + uninformed → 0');
assert.equal(lines('case_tasks.csv')[0], 'class,student_key,team_key,phase,form,item,mech,choice,expected,aligned,logic,why,duration_s,explain_condition,journey_hash,submitted_at,answers_version');
const Cs = parse('case_tasks.csv'); assert.equal(Cs.length, 5); assert.deepEqual(Cs[0], { class: 'KT-K48', student_key: KA, team_key: TA, phase: 'pre', form: 'A', item: 'u1', mech: 'uppsala', choice: 'b', expected: 'b', aligned: '1', logic: 'incremental', why: 'vì, "chưa" đủ', duration_s: '420', explain_condition: 'hidden', journey_hash: JA, submitted_at: '2026-10-30T00:00:00Z', answers_version: 'ct-v1' });
assert.equal(Cs[2].why, 'dòng 1\ndòng 2'); assert.equal(Cs[1].aligned, '0');
assert.equal(lines('surveys.csv')[0], 'instrument,phase,student_code,role,rounds_played,score_a,out_o1,out_o2,b_1,b_2,b_3,nps,created_at,c_1,c_2'); const Sv = parse('surveys.csv'); assert.equal(Sv[1].c_1, '5'); assert.equal(Sv[1].nps, '9'); assert.equal(Sv[0].nps, '');
assert.ok(/open_like/.test(RP.build({ ...fixture, includeOpenText: true }).files.find(f => f.name === 'surveys.csv').data), 'tuỳ chọn câu mở');
assert.equal(lines('dictionary.csv').length, RP.DICT.length + 1); assert.ok(/participants.csv \| 3 \|/.test(file('README.md')) && /rp-v1/.test(file('README.md')) && /dc-v1/.test(file('README.md')));
// gói trống không lỗi
const empty = RP.build({ classCode: 'X-1' }); assert.deepEqual(empty.stats, { participants: 0, teams: 0, rounds: 0, passports: 0, decisions: 0, case_answers: 0, surveys: 0 }); assert.ok(Z.zip(empty.files).length > 100);

// --- tĩnh ---
{ const gv = read('Trang Giang Vien.dc.html'); assert.match(gv, /<script src="js\/core\/decision-codes\.js"><\/script>\n<script src="js\/core\/research-pack\.js"><\/script>\n<script src="js\/core\/zip-store\.js"><\/script>/); assert.match(gv, /async exportResearchPack\(\)/); assert.match(gv, /📦 Gói dữ liệu nghiên cứu \(ZIP\)/); assert.match(gv, /exportPack: \(\) => this\.exportResearchPack\(\)/); }
assert.match(read('js/instructor-api.js'), /async surveyExport\(code\)[^\n]*bizon_survey_export_v2/);
{ const sw = read('sw.js'); assert.match(sw, /const CACHE = 'bizon-v\d+';/); for (const f of ["'./js/core/decision-codes.js'", "'./js/core/research-pack.js'", "'./js/core/zip-store.js'"]) assert.ok(sw.includes(f), 'sw ' + f); }
for (const f of ['docs/research/TU-DIEN-BIEN.md', 'docs/research/MA-HOA-DAU-VET.md']) assert.ok(fs.existsSync(path.join(__dirname, '..', f)), f);
assert.ok(/EXPAND = 0\.15/.test(read('js/core/decision-codes.js')) && /15 %/.test(read('docs/research/MA-HOA-DAU-VET.md')), 'ngưỡng trong mã và tài liệu khớp');

// --- Trang Giảng viên (demo): nút tạo ZIP ---
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } }); const errors = [];
  page.on('pageerror', e => errors.push('err: ' + e.message)); page.on('dialog', d => d.accept());
  await page.route(/\.(woff2?|mp3|m4a|mp4)(\?|$)/, r => r.abort());
  await page.addInitScript(() => { try { localStorage.clear(); HTMLAnchorElement.prototype.click = function () {}; } catch (e) {} });
  await page.goto(`${BASE}/Trang%20Giang%20Vien.dc.html`, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(1500);
  await page.click('text=DEMO-2026'); await page.waitForTimeout(1500); await page.click('text=Mở bảng điều khiển'); await page.waitForTimeout(2500);
  await page.getByText('🎛 Điều khiển lớp', { exact: true }).first().click(); await page.waitForTimeout(800);
  await page.getByText('📦 Gói dữ liệu nghiên cứu (ZIP)', { exact: true }).first().click();
  await page.waitForFunction(() => window.__lastResearchPack, null, { timeout: 15000 });
  const got = await page.evaluate(() => window.__lastResearchPack);
  assert.deepEqual(got.files, ['README.md', 'dictionary.csv', 'participants.csv', 'teams.csv', 'rounds.csv', 'decisions.csv', 'passports.csv', 'case_tasks.csv', 'surveys.csv']);
  assert.ok(got.stats.rounds > 0 && got.stats.teams >= 5, 'lớp mẫu có bài nộp: ' + JSON.stringify(got.stats)); assert.ok(got.bytes > 1000);
  await browser.close();
  assert.deepEqual(errors, [], 'không lỗi JS');
  console.log('research-pack: OK');
})().catch(e => { console.error(e); process.exit(1); });
