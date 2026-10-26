/* BizOn — Trang chấm rubric bài tình huống (cham-tinh-huong.html, R3): chấm mù cho từng người chấm và tính độ tin cậy liên chấm.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 * Phụ thuộc (nạp trước): js/core/irr.js, js/case-task-data.js, js/case-rubric-data.js, js/bizon-clay-i18n.js.
 *
 * Tab 1 «Chấm»: nạp CSV bài tình huống xuất từ Trang Giảng viên (một dòng mỗi câu trả lời), gom thành từng bài, xáo thứ tự
 * theo người chấm, KHÔNG hiện giai đoạn và điều kiện lớp; chấm từng tiêu chí 0–2; lưu localStorage; xuất CSV điểm.
 * Tab 2 «Độ tin cậy»: nạp CSV điểm của hai người chấm → κ Cohen (thường và trọng số bậc hai) từng tiêu chí, ICC(2,1)/(2,k)
 * cho tổng điểm, danh sách bất đồng để hoà giải; xuất báo cáo. Mọi thứ chạy trên máy, không gửi đi đâu. */
(function () {
  'use strict';
  const I = window.BizOnIRR, D = window.BizOnCaseTaskData, R = window.BizOnCaseRubric; if (!I || !D || !R) return;
  const $ = id => document.getElementById(id);
  const lang = () => (typeof window.clayCurrentLang === 'function' ? window.clayCurrentLang() : 'vi');
  const t = (vi, en) => (lang() === 'en' ? en : vi);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fnv = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const cell = v => { const s = String(v == null ? '' : v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: type || 'text/csv;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }

  // ---------- CSV ----------
  function parseCsv(text) {
    const s = String(text || '').replace(/^﻿/, ''); const rows = []; let row = [], f = '', q = false;
    for (let i = 0; i < s.length; i++) { const c = s[i];
      if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c; }
    if (f.length || row.length) { row.push(f); rows.push(row); }
    const head = (rows.shift() || []).map(h => h.trim()); return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== '')).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] === undefined ? '' : r[i]])));
  }
  const baiKey = r => [r.class, r.student_key, r.phase, r.form].join('|');
  // Gom dòng CSV câu trả lời (R2) thành bài
  function groupAnswers(rows) {
    const m = new Map();
    for (const r of rows) { if (!r.student_key || !r.item) continue; const k = baiKey(r);
      if (!m.has(k)) m.set(k, { key: k, class: r.class, student_key: r.student_key, phase: r.phase, form: r.form, team: r.team, explain_condition: r.explain_condition, items: [] });
      m.get(k).items.push({ item: r.item, mech: r.mech, choice: r.choice, why: r.why, aligned: r.aligned }); }
    for (const b of m.values()) b.items.sort((x, y) => (D.FORMS[b.form] || []).findIndex(i => i.id === x.item) - (D.FORMS[b.form] || []).findIndex(i => i.id === y.item));
    return Array.from(m.values());
  }
  function shuffle(arr, seed) { const a = arr.slice(); let s = seed >>> 0 || 1; const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // ---------- trạng thái chấm ----------
  const S = { rater: '', fileSig: '', bai: [], order: [], cur: 0, scores: {}, answersRows: [] };
  const storeKey = () => 'bizon-rubric:' + S.rater + ':' + S.fileSig;
  function loadScores() { try { S.scores = JSON.parse(localStorage.getItem(storeKey()) || '{}') || {}; } catch (e) { S.scores = {}; } }
  function saveScores() { try { localStorage.setItem(storeKey(), JSON.stringify(S.scores)); } catch (e) {} }
  const score = (k, item, crit) => ((S.scores[k] || {})[item] || {})[crit];
  function setScore(k, item, crit, v) { S.scores[k] = S.scores[k] || {}; S.scores[k][item] = S.scores[k][item] || {}; S.scores[k][item][crit] = v; S.scores[k][item]._at = new Date().toISOString(); saveScores(); }
  function itemDone(b, it) { return R.criteriaFor(it.mech).every(c => Number.isInteger(score(b.key, it.item, c.key))); }
  function baiDone(b) { return b.items.every(it => itemDone(b, it)); }

  function startGrading() {
    const rater = $('rb-rater').value.trim(); if (!rater) { msg('rb-msg', t('Nhập tên hoặc mã người chấm.', 'Enter the rater name or id.')); return; }
    if (!S.bai.length) { msg('rb-msg', t('Nạp tệp CSV bài tình huống trước.', 'Load the case-task CSV first.')); return; }
    S.rater = rater; loadScores();
    S.order = shuffle(S.bai.map((_, i) => i), fnv(rater + '|' + S.fileSig));
    S.cur = Math.max(0, S.order.findIndex(i => !baiDone(S.bai[i]))); if (S.cur < 0) S.cur = 0;
    $('rb-setup').hidden = true; $('rb-grade').hidden = false; renderBai();
  }
  function renderBai() {
    const b = S.bai[S.order[S.cur]], L = lang(), form = D.FORMS[b.form] || [];
    $('rb-progress').textContent = t(`Bài ${S.cur + 1}/${S.order.length} · đã chấm xong ${S.bai.filter(baiDone).length}/${S.bai.length} · người chấm: ${S.rater}`, `Script ${S.cur + 1}/${S.order.length} · completed ${S.bai.filter(baiDone).length}/${S.bai.length} · rater: ${S.rater}`);
    $('rb-jump').innerHTML = S.order.map((bi, i) => `<option value="${i}"${i === S.cur ? ' selected' : ''}>${i + 1}${baiDone(S.bai[bi]) ? ' ✓' : ''} · ${esc(S.bai[bi].student_key)} · ${esc(S.bai[bi].form)}</option>`).join('');
    $('rb-items').innerHTML = b.items.map(it => {
      const def = form.find(x => x.id === it.item), c = def ? (def[L] || def.vi) : null, crits = R.criteriaFor(it.mech || (def && def.mech));
      const head = def ? `<h3>${esc(c.title)} <small>· ${esc(D.MECH[def.mech] ? (L === 'en' ? D.MECH[def.mech].en : D.MECH[def.mech].vi) : def.mech)}</small></h3><p class="rb-q">${esc(c.text)}</p>` : `<h3>${esc(it.item)}</h3>`;
      const ans = def && def.mech !== 'explain'
        ? `<p class="rb-ans"><b>${esc(t('Chọn', 'Chose'))} ${esc((it.choice || '?').toUpperCase())}.</b> ${esc(c && c.opts ? c.opts[it.choice] || '' : '')}</p><p class="rb-why"><b>${esc(t('Lý do', 'Reason'))}:</b> ${esc(it.why || '—')}</p>`
        : `<p class="rb-why rb-long">${esc(it.why || '—')}</p>`;
      return `<li class="rb-item${itemDone(b, it) ? ' done' : ''}" data-item="${esc(it.item)}">${head}${ans}${crits.map(cr => { const cc = cr[L] || cr.vi, v = score(b.key, it.item, cr.key);
        return `<div class="rb-crit" data-crit="${esc(cr.key)}"><div class="rb-crit-name">${esc(cc.name)}</div><div class="rb-levels">${R.LEVELS.map(l => `<button type="button" class="rb-lv${v === l ? ' on' : ''}" data-lv="${l}"><b>${l}</b><span>${esc(cc['a' + l])}</span></button>`).join('')}</div></div>`; }).join('')}</li>`;
    }).join('');
    $('rb-prev').disabled = S.cur === 0; $('rb-next').disabled = S.cur >= S.order.length - 1;
    window.scrollTo({ top: $('rb-grade').offsetTop - 12 });
  }
  function onLevelClick(e) {
    const btn = e.target.closest('.rb-lv'); if (!btn) return;
    const li = btn.closest('.rb-item'), crit = btn.closest('.rb-crit'); const b = S.bai[S.order[S.cur]];
    setScore(b.key, li.dataset.item, crit.dataset.crit, +btn.dataset.lv);
    crit.querySelectorAll('.rb-lv').forEach(x => x.classList.toggle('on', x === btn));
    const it = b.items.find(x => x.item === li.dataset.item); li.classList.toggle('done', itemDone(b, it));
    $('rb-progress').textContent = t(`Bài ${S.cur + 1}/${S.order.length} · đã chấm xong ${S.bai.filter(baiDone).length}/${S.bai.length} · người chấm: ${S.rater}`, `Script ${S.cur + 1}/${S.order.length} · completed ${S.bai.filter(baiDone).length}/${S.bai.length} · rater: ${S.rater}`);
  }
  function exportScores() {
    const head = ['rater', 'class', 'student_key', 'phase', 'form', 'explain_condition', 'item', 'mech', 'criterion', 'score', 'rubric_version', 'scored_at'];
    const lines = [head.join(',')]; let n = 0;
    for (const b of S.bai) for (const it of b.items) for (const cr of R.criteriaFor(it.mech)) { const v = score(b.key, it.item, cr.key); if (!Number.isInteger(v)) continue; n++;
      lines.push([S.rater, b.class, b.student_key, b.phase, b.form, b.explain_condition || '', it.item, it.mech, cr.key, v, R.VERSION, (S.scores[b.key][it.item]._at || '')].map(cell).join(',')); }
    if (!n) { msg('rb-msg2', t('Chưa có điểm nào để xuất.', 'No scores to export yet.')); return lines; }
    download(`BizOn-rubric-${S.rater.replace(/[^\w-]+/g, '_')}-${S.fileSig}.csv`, lines.join('\n') + '\n');
    msg('rb-msg2', t(`Đã xuất ${n} điểm.`, `Exported ${n} scores.`), true); return lines;
  }

  // ---------- độ tin cậy ----------
  function scoreMap(rows) { const m = new Map(); for (const r of rows) { if (!r.student_key || !r.criterion) continue; m.set([r.class, r.student_key, r.phase, r.form, r.item, r.criterion].join('|'), { ...r, score: Number(r.score) }); } return m; }
  function reliability(rowsA, rowsB) {
    const A = scoreMap(rowsA), B = scoreMap(rowsB); const keys = Array.from(A.keys()).filter(k => B.has(k));
    const byCrit = {}; const bai = {};
    for (const k of keys) { const a = A.get(k), b = B.get(k); const crit = a.criterion === 'why' ? 'why:' + a.mech : a.criterion;
      (byCrit[crit] = byCrit[crit] || { a: [], b: [], items: [] }); byCrit[crit].a.push(a.score); byCrit[crit].b.push(b.score); byCrit[crit].items.push(k);
      (byCrit.why_all = byCrit.why_all || { a: [], b: [], items: [] }); if (a.criterion === 'why') { byCrit.why_all.a.push(a.score); byCrit.why_all.b.push(b.score); byCrit.why_all.items.push(k); }
      const bk = [a.class, a.student_key, a.phase, a.form].join('|'); bai[bk] = bai[bk] || { whyA: 0, whyB: 0, xA: 0, xB: 0, nWhy: 0, nX: 0 };
      if (a.criterion === 'why') { bai[bk].whyA += a.score; bai[bk].whyB += b.score; bai[bk].nWhy++; } else { bai[bk].xA += a.score; bai[bk].xB += b.score; bai[bk].nX++; } }
    const crit = {}; for (const [c, v] of Object.entries(byCrit)) { if (!v.a.length) continue; crit[c] = { n: v.a.length, po: I.agreement(v.a, v.b).po, kappa: I.cohenKappa(v.a, v.b, { categories: R.LEVELS }).kappa, wkappa: I.cohenKappa(v.a, v.b, { categories: R.LEVELS, weights: 'quadratic' }).kappa }; }
    const full = Object.values(bai).filter(x => x.nWhy === 5 && x.nX === 4);
    const totals = { why: I.icc(Object.values(bai).filter(x => x.nWhy === 5).map(x => [x.whyA, x.whyB])), explain: I.icc(Object.values(bai).filter(x => x.nX === 4).map(x => [x.xA, x.xB])), total: I.icc(full.map(x => [x.whyA + x.xA, x.whyB + x.xB])) };
    const disagreements = keys.map(k => ({ key: k, a: A.get(k).score, b: B.get(k).score, diff: Math.abs(A.get(k).score - B.get(k).score), row: A.get(k) })).filter(d => d.diff > 0).sort((x, y) => y.diff - x.diff || x.key.localeCompare(y.key));
    return { n_pairs: keys.length, n_bai: Object.keys(bai).length, n_full: full.length, raters: [rowsA[0] && rowsA[0].rater, rowsB[0] && rowsB[0].rater], crit, totals, disagreements, rubric_version: R.VERSION, computed_at: new Date().toISOString() };
  }
  let lastReport = null;
  function renderReport(rep) {
    lastReport = rep; const L = lang(); const f = v => (Number.isFinite(v) ? v.toFixed(2) : '—');
    const critName = c => c === 'why_all' ? t('Lý do (5 tình huống gộp)', 'Reasons (5 situations pooled)') : c.startsWith('why:') ? t('Lý do · ', 'Reason · ') + ((D.MECH[c.slice(4)] || {})[L] || c.slice(4)) : ((R.EXPLAIN.find(x => x.key === c) || {})[L] || {}).name || c;
    const order = ['why_all', ...Object.keys(rep.crit).filter(c => c.startsWith('why:')).sort(), 'x1', 'x2', 'x3', 'x4'].filter(c => rep.crit[c]);
    $('rb-rep-head').textContent = t(`${rep.n_pairs} cặp điểm · ${rep.n_bai} bài có cả hai người chấm (${rep.n_full} bài chấm đủ) · người chấm: ${rep.raters.join(' và ')}`, `${rep.n_pairs} score pairs · ${rep.n_bai} scripts rated by both (${rep.n_full} fully rated) · raters: ${rep.raters.join(' and ')}`);
    $('rb-rep-crit').innerHTML = `<tr><th>${esc(t('Tiêu chí', 'Criterion'))}</th><th>n</th><th>${esc(t('% trùng', '% agree'))}</th><th>κ</th><th>κ trọng số</th><th>${esc(t('Mức', 'Level'))}</th></tr>` +
      order.map(c => { const v = rep.crit[c], ip = Number.isFinite(v.wkappa) ? I.interpretKappa(v.wkappa) : (v.po === 1 ? { vi: 'trùng hoàn toàn (một hạng, κ không xác định)', en: 'full agreement (one category, κ undefined)' } : I.interpretKappa(NaN)); return `<tr><td>${esc(critName(c))}</td><td>${v.n}</td><td>${f(v.po * 100)}</td><td>${f(v.kappa)}</td><td>${f(v.wkappa)}</td><td>${esc(L === 'en' ? ip.en : ip.vi)}</td></tr>`; }).join('');
    $('rb-rep-icc').innerHTML = `<tr><th>${esc(t('Tổng điểm', 'Total'))}</th><th>n</th><th>ICC(2,1)</th><th>ICC(2,k)</th><th>${esc(t('Mức', 'Level'))}</th></tr>` +
      [['why', t('Lý do (0–10)', 'Reasons (0–10)')], ['explain', t('Giải thích (0–8)', 'Explanation (0–8)')], ['total', t('Lý do + giải thích (0–18)', 'Reasons + explanation (0–18)')]].map(([k, name]) => { const v = rep.totals[k], ip = Number.isFinite(v.icc21) ? I.interpretIcc(v.icc21) : (v.n >= 2 ? { vi: 'tổng không đổi giữa các bài, ICC không xác định', en: 'totals constant across scripts, ICC undefined' } : I.interpretIcc(NaN)); return `<tr><td>${esc(name)}</td><td>${v.n}</td><td>${f(v.icc21)}</td><td>${f(v.icc2k)}</td><td>${esc(L === 'en' ? ip.en : ip.vi)}</td></tr>`; }).join('');
    const ansMap = new Map(); for (const b of S.bai) for (const it of b.items) ansMap.set([b.class, b.student_key, b.phase, b.form, it.item].join('|'), it);
    $('rb-rep-dis').innerHTML = rep.disagreements.length ? rep.disagreements.slice(0, 300).map(d => { const r = d.row, it = ansMap.get([r.class, r.student_key, r.phase, r.form, r.item].join('|'));
      return `<li class="${d.diff >= 2 ? 'big' : ''}"><b>${esc(r.student_key)} · ${esc(r.form)} · ${esc(r.item)} · ${esc(r.criterion)}</b> — ${esc(rep.raters[0] || 'A')}: ${d.a} · ${esc(rep.raters[1] || 'B')}: ${d.b}${it ? `<span>${esc(it.why || '')}</span>` : ''}</li>`; }).join('')
      : `<li>${esc(t('Không có bất đồng.', 'No disagreements.'))}</li>`;
    $('rb-rep-note').textContent = t('Ngưỡng tham khảo: κ ≥ 0,61 khá tốt, ≥ 0,81 gần như hoàn toàn (Landis & Koch 1977); ICC ≥ 0,75 tốt, ≥ 0,90 xuất sắc (Koo & Li 2016). Bất đồng ≥ 2 bậc cần hoà giải trước; nếu κ < 0,61 ở tiêu chí nào thì hiệu chỉnh mốc điểm của tiêu chí đó rồi chấm lại mẫu hiệu chuẩn.', 'Reference thresholds: κ ≥ 0.61 substantial, ≥ 0.81 almost perfect (Landis & Koch 1977); ICC ≥ 0.75 good, ≥ 0.90 excellent (Koo & Li 2016). Resolve disagreements of ≥ 2 levels first; if any criterion has κ < 0.61, refine its anchors and re-rate the calibration sample.');
    $('rb-report').hidden = false;
  }
  function exportReport() {
    if (!lastReport) return; const rep = lastReport;
    const lines = ['criterion,n,percent_agree,kappa,weighted_kappa'].concat(Object.entries(rep.crit).map(([c, v]) => [c, v.n, (v.po * 100).toFixed(1), v.kappa.toFixed(3), v.wkappa.toFixed(3)].join(',')))
      .concat(['', 'total,n,icc21,icc2k'], Object.entries(rep.totals).map(([k, v]) => [k, v.n, Number.isFinite(v.icc21) ? v.icc21.toFixed(3) : '', Number.isFinite(v.icc2k) ? v.icc2k.toFixed(3) : ''].join(',')))
      .concat(['', 'disagreement_key,rater_a,rater_b,diff'], rep.disagreements.map(d => [cell(d.key), d.a, d.b, d.diff].join(',')));
    download(`BizOn-irr-${(rep.raters[0] || 'A')}-${(rep.raters[1] || 'B')}.csv`, lines.join('\n') + '\n');
    download(`BizOn-irr-${(rep.raters[0] || 'A')}-${(rep.raters[1] || 'B')}.json`, JSON.stringify({ ...rep, disagreements: rep.disagreements.map(d => ({ key: d.key, a: d.a, b: d.b, diff: d.diff })) }, null, 2), 'application/json');
  }

  // ---------- khởi động ----------
  function msg(id, text, ok) { const el = $(id); if (!el) return; el.textContent = text || ''; el.style.color = ok ? '#246b3a' : ''; }
  const readFile = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(f, 'utf-8'); });
  function loadAnswers(text, name) {
    S.answersRows = parseCsv(text); S.bai = groupAnswers(S.answersRows); S.fileSig = fnv(text).toString(16).padStart(8, '0');
    if (!S.bai.length) { msg('rb-msg', t('Tệp không có dòng câu trả lời nào (cần CSV «bài tình huống» xuất từ Trang Giảng viên).', 'No answer rows found (use the case-task CSV exported from the instructor page).')); return; }
    msg('rb-msg', t(`Đã nạp ${S.bai.length} bài (${S.answersRows.length} câu trả lời) từ ${name || 'tệp'}.`, `Loaded ${S.bai.length} scripts (${S.answersRows.length} answers) from ${name || 'file'}.`), true);
  }
  function init() {
    try { $('rb-rater').value = localStorage.getItem('bizon-rubric-rater') || ''; } catch (e) {}
    $('rb-file').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; loadAnswers(await readFile(f), f.name); });
    $('rb-start').addEventListener('click', () => { try { localStorage.setItem('bizon-rubric-rater', $('rb-rater').value.trim()); } catch (e) {} startGrading(); });
    $('rb-items').addEventListener('click', onLevelClick);
    $('rb-prev').addEventListener('click', () => { if (S.cur > 0) { S.cur--; renderBai(); } });
    $('rb-next').addEventListener('click', () => { if (S.cur < S.order.length - 1) { S.cur++; renderBai(); } });
    $('rb-jump').addEventListener('change', e => { S.cur = +e.target.value; renderBai(); });
    $('rb-export').addEventListener('click', exportScores);
    $('rb-back').addEventListener('click', () => { $('rb-grade').hidden = true; $('rb-setup').hidden = false; });
    document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); $('tab-grade').hidden = b.dataset.tab !== 'grade'; $('tab-irr').hidden = b.dataset.tab !== 'irr'; }));
    const files = {};
    for (const id of ['rb-a', 'rb-b', 'rb-ans']) $(id).addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; files[id] = await readFile(f); if (id === 'rb-ans') loadAnswers(files[id], f.name); });
    $('rb-compute').addEventListener('click', () => { if (!files['rb-a'] || !files['rb-b']) { msg('rb-msg3', t('Cần hai tệp điểm (người chấm A và B).', 'Two score files (raters A and B) are needed.')); return; }
      const rep = reliability(parseCsv(files['rb-a']), parseCsv(files['rb-b'])); if (!rep.n_pairs) { msg('rb-msg3', t('Hai tệp không có cặp điểm nào trùng bài/tiêu chí.', 'The two files share no matching script/criterion pairs.')); return; } msg('rb-msg3', ''); renderReport(rep); });
    $('rb-report-export').addEventListener('click', exportReport);
    window.addEventListener('bizon:langchange', () => { if (!$('rb-grade').hidden) renderBai(); if (lastReport) renderReport(lastReport); });
  }
  window.__rbTest = { parseCsv, groupAnswers, reliability, exportScores, state: S, shuffle };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
