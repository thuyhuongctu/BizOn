/* BizOn — Gói dữ liệu nghiên cứu ẩn danh (R4): dựng các tệp CSV + README + từ điển biến từ dữ liệu lớp mà Trang Giảng viên
 * đã tải (bài nộp từng vòng, hộ chiếu hành trình, bài tình huống, phiếu khảo sát). Hàm thuần, dùng chung Node và trình duyệt.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Ẩn danh: student_key = FNV-1a(email thường), team_key = FNV-1a(mã lớp | tên đội thường), journey_hash = FNV-1a(journey_id)
 * (cùng hàm băm với CSV trang Hành trình và CSV bài tình huống nên ghép được). Không có email, tên đội, tên người chơi.
 * Mã sinh viên trong phiếu khảo sát (student_code) do sinh viên tự đặt, không ghép được với các tệp khác – giữ nguyên.
 * Câu mở của phiếu khảo sát chỉ xuất khi includeOpenText = true. Phụ thuộc: js/core/decision-codes.js (truyền vào qua deps). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./decision-codes.js')); else root.BizOnResearchPack = factory(root.BizOnDecisionCodes);
})(typeof self !== 'undefined' ? self : this, function (DC) {
  'use strict';
  const PACK_VERSION = 'rp-v1';
  const fnv = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); };
  const cell = v => { if (v === null || v === undefined) return ''; const s = typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = (head, rows) => [head.join(','), ...rows.map(r => head.map(h => cell(r[h])).join(','))].join('\n') + '\n';
  const num = v => (v === null || v === undefined || v === '' ? '' : (Number.isFinite(Number(v)) ? Number(v) : ''));
  const lower = s => String(s || '').trim().toLowerCase();
  const studentKey = email => (email ? fnv(lower(email)) : '');
  const teamKey = (cls, team) => (team ? fnv(lower(cls) + '|' + lower(team)) : '');
  const journeyHash = id => (id ? fnv(String(id)) : '');

  // ---------- từ điển biến ----------
  const DICT = [
    ['participants.csv', 'student_key', 'text', 'Khoá ẩn danh sinh viên = FNV-1a(email thường); ghép với case_tasks, passports, decisions'],
    ['participants.csv', 'team_key', 'text', 'Khoá ẩn danh đội = FNV-1a(mã lớp | tên đội thường); ghép với teams, rounds'],
    ['participants.csv', 'journey_hash', 'text', 'Băm journey_id của hộ chiếu mới nhất; ghép với CSV trang Hành trình'],
    ['participants.csv', 'explain_condition', 'hidden|shown', 'Điều kiện lớp lúc nộp (R1): hộp đen hay hiện giải thích; lấy từ bài tình huống rồi hộ chiếu'],
    ['participants.csv', 'case_pre / case_post', '0/1', 'Đã nộp bài tình huống trước / sau'],
    ['participants.csv', 't1_done / t2_done / t3_done', '0/1', 'Bậc đã hoàn thành trong hộ chiếu'],
    ['teams.csv', 'n_rounds, last_round', 'int', 'Số vòng Bật Nghiệp đã nộp và vòng cuối'],
    ['teams.csv', 'carry_applied', '0/1', 'Có vòng nào áp hành trang hành trình (journey_carry) không'],
    ['teams.csv', 't2_uppsala_adherence', '0–1', 'Tỉ lệ quyết định sản lượng tuân thủ tín hiệu (xem MA-HOA-DAU-VET.md)'],
    ['rounds.csv', 'round', '1–6', 'Vòng Bật Nghiệp'],
    ['rounds.csv', 'share, net_profit, revenue, balance, sold, lost_sales, inventory, oee, defect, quick_ratio, brand_loyalty, roi', 'number', 'Kết quả vòng từ engine (result_json); tiền: triệu ₫'],
    ['rounds.csv', 'price, marketing, production, rd, workers, training, payment_term, funding', 'number/text', 'Quyết định của vòng (result_json.decisions); giá nghìn ₫, ngân sách triệu ₫'],
    ['rounds.csv', 'what_if', '0/1', 'Có dùng mô phỏng Nếu – Thì trong vòng (rỗng khi engine không ghi)'],
    ['rounds.csv', 'win, ach, difficulty', 'mixed', 'Cắm cờ vòng, số thành tựu, mức khó'],
    ['rounds.csv', 'code, logic, uppsala_ok, d_production', 'text/0-1/ratio', 'Mã dấu vết quyết định bậc 2 (dc-v1): expand-informed/expand-uninformed/contract/hold/start'],
    ['decisions.csv', 'tier, seq', 't1|t2|t3, int', 'Bậc và thứ tự quyết định (tuần, vòng, lần vào thị trường)'],
    ['decisions.csv', 'code', 'text', 't1: explore/survey/exploit-known/exploit-unknown · t2: như rounds · t3: near-first/sequential/leapfrog/late-near'],
    ['decisions.csv', 'logic', 'effectual|causal|leap|adaptive|start', 'Logic ra quyết định suy từ hành vi'],
    ['decisions.csv', 'uppsala_ok', '0/1/rỗng', '1 = cam kết đi sau tri thức/tín hiệu hoặc là bước học; 0 = cam kết đi trước'],
    ['decisions.csv', 'detail', 'json', 'Trường thô của quyết định (m, menu, loc, net | production, prev_lost_sales… | market, near, when)'],
    ['passports.csv', 'carry_enabled', '0/1', 'Hộ chiếu có bật hành trang (chỉ áp khi lớp bật journey_carry)'],
    ['passports.csv', 't1_eff, t1_rank, t1_total, t1_explore_weeks, t1_exploit_weeks, t1_survey_weeks, t1_explain', 'mixed', 'Kết quả Bậc 1 và điều kiện lúc ghi'],
    ['passports.csv', 't2_balance_end, t2_net_profit_total, t2_share_end, t2_profitable_rounds, t2_what_if_rounds, t2_rd_cumulative, t2_loan_end, t2_case, t2_explain', 'mixed', 'Kết quả Bậc 2 và điều kiện lúc ghi'],
    ['passports.csv', 't3_variant, t3_total, t3_cash_end, t3_rep_end, t3_markets_entered, t3_role, t3_explain', 'mixed', 'Kết quả Bậc 3 (brand/durian) và điều kiện lúc ghi'],
    ['passports.csv', 'effectuation_index, causation_index, intl_pattern', 'ratio/text', 'Chỉ số tổng hợp của hộ chiếu (js/core/journey.js summarize)'],
    ['passports.csv', 't1_uppsala_adherence, t1_effectual_share, t1_leap_share, t3_uppsala_adherence, journey_uppsala_adherence', '0–1', 'Chỉ số mã hoá dấu vết (dc-v1) theo bậc và cả hành trình (t1 + t2 của đội + t3)'],
    ['case_tasks.csv', '(như CSV bài tình huống của Trang Giảng viên)', '', 'Một dòng mỗi câu trả lời: phase, form, item, mech, choice, expected, aligned, logic, why, explain_condition, journey_hash'],
    ['surveys.csv', 'student_code', 'text', 'Mã tự đặt của sinh viên trên phiếu (2 chữ + 2 số); không ghép được với student_key'],
    ['surveys.csv', 'instrument, phase, role, rounds_played, score_a, out_*, b_*, c_*, nps', 'mixed', 'Phiếu trước/sau: điểm Phần A (0–15), điểm theo chuẩn đầu ra, Likert tự tin (B) và trải nghiệm (C), NPS'],
    ['surveys.csv', 'open_like, open_improve', 'text', 'Câu mở (chỉ có khi xuất với includeOpenText)']
  ];

  function flattenJson(prefix, obj, out) {
    if (Array.isArray(obj)) obj.forEach((v, i) => { out[prefix + '_' + (i + 1)] = v; });
    else if (obj && typeof obj === 'object') Object.keys(obj).sort((a, b) => (Number(a) || 0) - (Number(b) || 0) || a.localeCompare(b)).forEach(k => { out[prefix + '_' + k] = obj[k]; });
    return out;
  }

  function build(input) {
    const cls = String((input && input.classCode) || '').trim().toUpperCase();
    const subs = (input.submissions || []).filter(r => r && r.result_json), passports = input.passports || [], cases = input.caseTasks || [], surveys = input.surveys || [];
    const now = input.now || new Date().toISOString();
    // ---- vòng Bật Nghiệp theo đội ----
    const byTeam = new Map();
    for (const r of subs) { const k = lower(r.team_name); if (!byTeam.has(k)) byTeam.set(k, { name: r.team_name, rows: [] }); byTeam.get(k).rows.push(r); }
    const roundRows = [], teamRows = [], decisionRows = []; const teamCode = new Map();
    for (const { name, rows } of byTeam.values()) {
      const tk = teamKey(cls, name); const sorted = rows.slice().sort((a, b) => num(a.round_number) - num(b.round_number));
      const codes = DC.codeTier2(sorted); const codeByRound = new Map(codes.map(c => [c.seq, c]));
      let jh = '', carry = 0, cond = '';
      for (const r of sorted) {
        const j = r.result_json || {}, d = j.decisions || {}, c = codeByRound.get(num(r.round_number)) || {};
        if (j.journey && j.journey.journeyId) { jh = journeyHash(j.journey.journeyId); if (j.journey.carryApplied) carry = 1; }
        if (j.explain) cond = j.explain;
        roundRows.push({ team_key: tk, round: num(r.round_number), submitted_at: r.created_at || '', share: num(j.share), net_profit: num(j.netProfit), revenue: num(j.revenue), balance: num(j.balance), sold: num(j.sold), lost_sales: num(j.lostSales), inventory: num(j.inventory), oee: num(j.oee), defect: num(j.defect), quick_ratio: num(j.quickRatio), brand_loyalty: num(j.brandLoyalty), roi: num(j.roi), ach: num(j.ach), win: j.win === true ? 1 : j.win === false ? 0 : '', difficulty: j.difficulty || '', explain: j.explain || '',
          journey_hash: j.journey && j.journey.journeyId ? journeyHash(j.journey.journeyId) : '', carry_applied: j.journey ? (j.journey.carryApplied ? 1 : 0) : '',
          price: num(d.price), marketing: num(d.marketing), production: num(d.production), rd: num(d.rd), workers: num(d.workers), training: num(d.training), payment_term: num(d.paymentTerm), funding: d.funding || '', what_if: c.what_if ?? '',
          code: c.code || '', logic: c.logic || '', uppsala_ok: c.uppsala_ok ?? '', d_production: c.d_production ?? '' });
        decisionRows.push({ student_key: '', team_key: tk, journey_hash: jh, tier: 't2', seq: num(r.round_number), code: c.code || '', logic: c.logic || '', uppsala_ok: c.uppsala_ok ?? '', detail: { production: c.production, d_production: c.d_production, prev_lost_sales: c.prev_lost_sales, what_if: c.what_if, loan: c.loan } });
      }
      const sm = DC.summarize(codes); teamCode.set(lower(name), sm);
      teamRows.push({ team_key: tk, class: cls, n_rounds: sorted.length, last_round: sorted.length ? num(sorted[sorted.length - 1].round_number) : '', journey_hash: jh, carry_applied: carry, explain_condition: cond, t2_uppsala_adherence: sm.uppsala_adherence, t2_leap_share: sm.leap_share });
    }
    // ---- hộ chiếu ----
    const passportRows = []; const perStudent = new Map();
    const stu = key => { if (!perStudent.has(key)) perStudent.set(key, { student_key: key, class: cls, team_key: '', journey_hash: '', explain_condition: '', case_pre: 0, case_post: 0, has_passport: 0, t1_done: 0, t2_done: 0, t3_done: 0 }); return perStudent.get(key); };
    for (const r of passports) {
      const p = r.passport || {}, t = p.tiers || {}, sm = p.summary || {}, sk = studentKey(r.student_email), tk = teamKey(cls, r.team_name || p.teamName), jh = journeyHash(r.journey_id || p.journeyId);
      const t1 = t.t1 || {}, t2 = t.t2 || {}, t3 = t.t3 || {}, st = t1.style || {};
      const c1 = t1.status === 'done' ? DC.codeTier1(t1.weeks) : [], c3 = t3.status === 'done' ? (t3.variant === 'brand' ? DC.codeTier3Brand(t3.entered) : DC.codeTier3Durian(t3.channelOrder)) : [];
      const teamRounds = byTeam.get(lower(r.team_name || p.teamName)); const c2 = teamRounds ? DC.codeTier2(teamRounds.rows) : [];
      const s1 = DC.summarize(c1), s3 = DC.summarize(c3), sAll = DC.summarize([...c1, ...c2, ...c3]);
      for (const row of [...c1, ...c3]) decisionRows.push({ student_key: sk, team_key: tk, journey_hash: jh, tier: row.tier, seq: row.seq, code: row.code, logic: row.logic, uppsala_ok: row.uppsala_ok ?? '', detail: row.tier === 't1' ? { m: row.m, menu: row.menu, loc: row.loc, net: row.net, known_before: row.known_before } : { market: row.market, near: row.near, when: row.when } });
      passportRows.push({ student_key: sk, team_key: tk, journey_hash: jh, class: cls, updated_at: r.updated_at || p.updatedAt || '', app_version: r.app_version || '', carry_enabled: p.carryEnabled === false ? 0 : 1,
        t1_done: t1.status === 'done' ? 1 : 0, t1_eff: num(t1.eff), t1_rank: num(t1.rank), t1_total: num(t1.total), t1_explore_weeks: num(st.exploreWeeks), t1_exploit_weeks: num(st.exploitWeeks), t1_survey_weeks: num(st.surveyWeeks), t1_explain: t1.explain || '',
        t2_done: t2.status === 'done' ? 1 : 0, t2_balance_end: num(t2.balanceEnd), t2_net_profit_total: num(t2.netProfitTotal), t2_share_end: num(t2.shareEnd), t2_profitable_rounds: num(t2.profitableRounds), t2_what_if_rounds: num(t2.whatIfRounds), t2_rd_cumulative: num(t2.rdCumulative), t2_loan_end: num(t2.loanEnd), t2_case: t2.caseId || '', t2_explain: t2.explain || '',
        t3_done: t3.status === 'done' ? 1 : 0, t3_variant: t3.variant || '', t3_total: num(t3.total), t3_cash_end: num(t3.cashEnd), t3_rep_end: num(t3.repEnd), t3_markets_entered: t3.variant === 'brand' ? (Array.isArray(t3.entered) ? t3.entered.filter(x => x != null).length : '') : (Array.isArray(t3.channelOrder) ? t3.channelOrder.length : ''), t3_role: t3.roleId || '', t3_explain: t3.explain || '',
        effectuation_index: num(sm.effectuationIndex), causation_index: num(sm.causationIndex), intl_pattern: sm.intlPattern || '',
        t1_uppsala_adherence: s1.uppsala_adherence, t1_effectual_share: s1.effectual_share, t1_leap_share: s1.leap_share, t2_uppsala_adherence: DC.summarize(c2).uppsala_adherence, t3_uppsala_adherence: s3.uppsala_adherence, journey_uppsala_adherence: sAll.uppsala_adherence });
      if (sk) { const s = stu(sk); s.team_key = tk; s.journey_hash = jh; s.has_passport = 1; s.t1_done = t1.status === 'done' ? 1 : 0; s.t2_done = t2.status === 'done' ? 1 : 0; s.t3_done = t3.status === 'done' ? 1 : 0; if (!s.explain_condition) s.explain_condition = t3.explain || t2.explain || t1.explain || ''; }
    }
    // ---- bài tình huống ----
    const caseHead = ['class', 'student_key', 'team_key', 'phase', 'form', 'item', 'mech', 'choice', 'expected', 'aligned', 'logic', 'why', 'duration_s', 'explain_condition', 'journey_hash', 'submitted_at', 'answers_version'];
    const caseRows = []; const CT = input.caseTaskData || null;
    for (const r of cases) {
      const sk = studentKey(r.student_email), tk = teamKey(cls, r.team_name), items = (r.answers && Array.isArray(r.answers.items)) ? r.answers.items : [];
      for (const it of items) { const def = CT && CT.item ? CT.item(r.form, it.id) : null, exp = def && def.expected ? def.expected : '';
        caseRows.push({ class: cls, student_key: sk, team_key: tk, phase: r.phase, form: r.form, item: it.id, mech: it.mech || (def && def.mech) || '', choice: it.choice || '', expected: exp, aligned: exp && it.choice ? (it.choice === exp ? 1 : 0) : '', logic: def && def.logic && it.choice ? def.logic[it.choice] || '' : '', why: it.why != null ? it.why : (it.text || ''), duration_s: num(r.duration_s), explain_condition: r.explain || '', journey_hash: journeyHash(r.journey_id), submitted_at: r.updated_at || r.created_at || '', answers_version: (r.answers && r.answers.version) || '' }); }
      if (sk) { const s = stu(sk); if (r.phase === 'pre') s.case_pre = 1; if (r.phase === 'post') s.case_post = 1; if (!s.team_key) s.team_key = tk; if (!s.journey_hash) s.journey_hash = journeyHash(r.journey_id); if (r.explain) s.explain_condition = r.explain; }
    }
    // ---- phiếu khảo sát ----
    const surveyRows = surveys.map(r => { const o = { instrument: r.instrument || '', phase: r.phase, student_code: r.student_code || '', role: r.role || '', rounds_played: num(r.rounds_played), score_a: num(r.score_a) }; flattenJson('out', r.score_by_outcome, o); flattenJson('b', r.likert_b, o); flattenJson('c', r.likert_c, o); o.nps = num(r.nps); o.created_at = r.created_at || ''; if (input.includeOpenText) { o.open_like = r.open_like || ''; o.open_improve = r.open_improve || ''; } return o; });
    const surveyHead = surveyRows.length ? Array.from(new Set(surveyRows.flatMap(r => Object.keys(r)))) : ['instrument', 'phase', 'student_code', 'role', 'rounds_played', 'score_a', 'nps', 'created_at'];
    // ---- tệp ----
    const participantRows = Array.from(perStudent.values()).sort((a, b) => a.student_key.localeCompare(b.student_key));
    roundRows.sort((a, b) => a.team_key.localeCompare(b.team_key) || a.round - b.round); teamRows.sort((a, b) => a.team_key.localeCompare(b.team_key));
    decisionRows.sort((a, b) => (a.student_key || a.team_key).localeCompare(b.student_key || b.team_key) || a.tier.localeCompare(b.tier) || a.seq - b.seq);
    const stats = { participants: participantRows.length, teams: teamRows.length, rounds: roundRows.length, passports: passportRows.length, decisions: decisionRows.length, case_answers: caseRows.length, surveys: surveyRows.length };
    const readme = `# Gói dữ liệu nghiên cứu BizOn — lớp ${cls}\n\nXuất lúc ${now} · phiên bản gói ${PACK_VERSION} · mã hoá dấu vết ${DC.CODING_VERSION}.\n\n` +
      `## Ẩn danh\nKhông có email, tên người chơi hay tên đội. student_key = FNV-1a(email thường), team_key = FNV-1a(mã lớp | tên đội thường), journey_hash = FNV-1a(journey_id). Cùng hàm băm với CSV của trang Hành trình và CSV bài tình huống trên Trang Giảng viên. Mã sinh viên trên phiếu khảo sát (student_code) do sinh viên tự đặt, không ghép được với student_key.${input.includeOpenText ? ' Gói này CÓ câu mở của phiếu khảo sát – rà soát trước khi chia sẻ.' : ' Câu mở của phiếu khảo sát không xuất.'}\n\n` +
      `## Tệp\n| Tệp | Dòng | Nội dung |\n|---|---|---|\n| participants.csv | ${stats.participants} | một dòng mỗi sinh viên có hộ chiếu hoặc bài tình huống |\n| teams.csv | ${stats.teams} | một dòng mỗi đội Bật Nghiệp |\n| rounds.csv | ${stats.rounds} | một dòng mỗi vòng Bật Nghiệp đã nộp, kèm quyết định và mã dấu vết |\n| decisions.csv | ${stats.decisions} | một dòng mỗi quyết định được mã hoá (bậc 1, 2, 3) |\n| passports.csv | ${stats.passports} | một dòng mỗi hộ chiếu hành trình đã đồng bộ |\n| case_tasks.csv | ${stats.case_answers} | một dòng mỗi câu trả lời bài tình huống trước – sau |\n| surveys.csv | ${stats.surveys} | một dòng mỗi phiếu khảo sát trước/sau |\n| dictionary.csv | ${DICT.length} | từ điển biến |\n\n` +
      `## Tài liệu\n- Từ điển biến đầy đủ: docs/research/TU-DIEN-BIEN.md\n- Sơ đồ mã hoá dấu vết quyết định: docs/research/MA-HOA-DAU-VET.md\n- Thiết kế nghiên cứu: thiet-ke-nghien-cuu.html · Nhánh hộp đen: docs/architecture/NHANH-HOP-DEN.md · Bài tình huống: docs/architecture/BAI-TINH-HUONG.md · Rubric: docs/architecture/RUBRIC-CHAM-TINH-HUONG.md\n\n` +
      `## Ghép tệp\nparticipants ⟷ case_tasks, passports, decisions qua student_key · teams ⟷ rounds, decisions (t2) qua team_key · passports ⟷ CSV trang Hành trình qua journey_hash · điểm rubric (cham-tinh-huong.html) ⟷ case_tasks qua student_key + phase + form + item.\n`;
    const files = [
      { name: 'README.md', data: readme },
      { name: 'dictionary.csv', data: csv(['file', 'variable', 'type', 'description'], DICT.map(d => ({ file: d[0], variable: d[1], type: d[2], description: d[3] }))) },
      { name: 'participants.csv', data: csv(['student_key', 'class', 'team_key', 'journey_hash', 'explain_condition', 'case_pre', 'case_post', 'has_passport', 't1_done', 't2_done', 't3_done'], participantRows) },
      { name: 'teams.csv', data: csv(['team_key', 'class', 'n_rounds', 'last_round', 'journey_hash', 'carry_applied', 'explain_condition', 't2_uppsala_adherence', 't2_leap_share'], teamRows) },
      { name: 'rounds.csv', data: csv(['team_key', 'round', 'submitted_at', 'share', 'net_profit', 'revenue', 'balance', 'sold', 'lost_sales', 'inventory', 'oee', 'defect', 'quick_ratio', 'brand_loyalty', 'roi', 'ach', 'win', 'difficulty', 'explain', 'journey_hash', 'carry_applied', 'price', 'marketing', 'production', 'rd', 'workers', 'training', 'payment_term', 'funding', 'what_if', 'code', 'logic', 'uppsala_ok', 'd_production'], roundRows) },
      { name: 'decisions.csv', data: csv(['student_key', 'team_key', 'journey_hash', 'tier', 'seq', 'code', 'logic', 'uppsala_ok', 'detail'], decisionRows) },
      { name: 'passports.csv', data: csv(['student_key', 'team_key', 'journey_hash', 'class', 'updated_at', 'app_version', 'carry_enabled', 't1_done', 't1_eff', 't1_rank', 't1_total', 't1_explore_weeks', 't1_exploit_weeks', 't1_survey_weeks', 't1_explain', 't2_done', 't2_balance_end', 't2_net_profit_total', 't2_share_end', 't2_profitable_rounds', 't2_what_if_rounds', 't2_rd_cumulative', 't2_loan_end', 't2_case', 't2_explain', 't3_done', 't3_variant', 't3_total', 't3_cash_end', 't3_rep_end', 't3_markets_entered', 't3_role', 't3_explain', 'effectuation_index', 'causation_index', 'intl_pattern', 't1_uppsala_adherence', 't1_effectual_share', 't1_leap_share', 't2_uppsala_adherence', 't3_uppsala_adherence', 'journey_uppsala_adherence'], passportRows) },
      { name: 'case_tasks.csv', data: csv(caseHead, caseRows) },
      { name: 'surveys.csv', data: csv(surveyHead, surveyRows) }
    ];
    return { version: PACK_VERSION, coding_version: DC.CODING_VERSION, classCode: cls, stats, files };
  }
  return { PACK_VERSION, DICT, build, fnv, csv };
});
