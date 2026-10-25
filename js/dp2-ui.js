/* Hộ Chiếu Sầu Riêng · bản gọn (lab/ho-chieu-sau-rieng-v2.html) – lớp giao diện, KHÔNG có công thức mô phỏng.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Mô phỏng là ba mô-đun dùng chung với bản lớp học (ho-chieu-sau-rieng.html) và bản 3D: DurianEngine (lõi tất định),
 * DurianData (tham số, biến cố, nguồn), DurianCore (chốt vụ, nhật ký kiểm toán, cờ lũy kế, luật chơi). Tệp này chỉ:
 * - giữ APP cùng cấu trúc và cùng khoá lưu «durian_class_v2» với bản lớp học (ván dở mở tiếp được ở bản kia, báo cáo
 *   đầy đủ, chứng nhận, CSV/JSON cuối ván mở ở bản lớp học);
 * - vẽ mỗi vụ thành MỘT thẻ đi từng bước: biến cố → ① ưu tiên đầu tư → ② nguồn hàng → ③ chia kênh (mua tin trong
 *   «Nâng cao»), có dự báo của engine trước khi chốt, rồi một thẻ kết quả vụ với nhật ký rút gọn – theo khuôn bat-nghiep-v2.
 * Phiếu quyết định rút gọn: mục tiêu + một dòng «giả định và lý do» (ghi vào cả hai ô assume/ceo của phiếu đầy đủ).
 */
const DP2 = (() => {
  const E = window.DurianEngine, D = window.DurianData, C = window.DurianCore;
  const SAVE_KEY = 'durian_class_v2';
  const $ = id => document.getElementById(id);
  const app = () => $('dp2-app');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const lang = () => (store.get('bizon-lang') === 'en' ? 'en' : 'vi');
  const T = (vi, en) => (lang() === 'en' ? en : vi);
  const nm = o => (lang() === 'en' ? o.en : o.vi);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = (x, d) => (Number.isFinite(x) ? x : 0).toLocaleString(lang() === 'en' ? 'en-US' : 'vi-VN', { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 });
  const pct = x => nf(x * 100) + '%';
  const money = x => nf(x, 2) + T(' tỷ', ' bn');
  const sgnMoney = x => (x > 0 ? '+' : '') + money(x);
  const IMG = p => '../assets/character/' + p;
  const CH_IDS = D.channels.map(c => c.id);
  const seasonLabel = s => s.label.replace(/chính vụ|nghịch vụ/, m => T(m, m === 'chính vụ' ? 'main season' : 'off-season'));
  const fact = k => { const f = D.facts[k]; return f ? `${esc(nm(f))} <span class="src">[${esc(f.src)}]</span>` : ''; };
  const NEED = () => ({ area: T('mã vùng trồng', 'area code'), pack: T('mã đóng gói', 'packing code'), freezer: T('cấp đông', 'freezer'), test: T('kiểm nghiệm', 'testing') });
  const BADGE = () => ({ clean_official: T('Chính ngạch sạch', 'Clean official trade'), diversified: T('Đa dạng thị trường', 'Diversified markets'), resilient: T('Chống chịu: không vụ nào lỗ', 'Resilient: no losing season'),
    fake_origin: T('Dính giả xuất xứ', 'Fake origin involved'), exhausted_trees: T('Vườn kiệt sức', 'Exhausted orchard') });

  let APP = null, RIVALS = null;
  const ui = { view: 'decide', adv: false, help: false, err: '', setup: { cls: '', team: '', roleId: 'exporter' } };

  /* ---------- ván: cùng khoá và cùng cấu trúc với bản lớp học ---------- */
  function load() {
    const raw = store.get(SAVE_KEY); if (!raw) return null;
    try { const x = JSON.parse(raw); return x && x.game && x.roleId ? x : null; } catch (e) { return null; }
  }
  const save = () => { if (APP) store.set(SAVE_KEY, JSON.stringify(APP)); };
  function boot(a) {
    APP = a;
    RIVALS = E.rivalsRun(D, APP.roleId, APP.seed);
    APP.flags = APP.game.history.map(r => E.flagFor(RIVALS, r));
    APP.whatifs = APP.whatifs || {}; APP.lumina = APP.lumina || {}; APP.sheets = APP.sheets || {}; APP.journals = APP.journals || {};
    APP.debriefs = APP.debriefs || {}; APP.timing = APP.timing || {}; APP.events = APP.events || [];
  }
  const logEv = (type, o, n, committed) => C.logEv(APP, D, type, o, n, committed);
  function newGame(setup) {
    const cls = (setup.cls || '').trim(), team = (setup.team || '').trim(), roleId = D.roles[setup.roleId] ? setup.roleId : 'exporter';
    const seed = cls ? E.seedFrom(cls + '|' + roleId) : (Date.now() >>> 0);
    boot({
      cls, team, roleId, avatarId: 'basaulanh', seed, timerMin: 0, lean: true,
      game: E.newGame(D, roleId, seed), dec: C.freshDec(D, roleId), operator: 'ceo',
      session: 'S' + (Date.now() >>> 0).toString(36).toUpperCase(), roundStart: Date.now(),
      events: [], whatifs: {}, lumina: {}, sheets: {}, journals: {}, debriefs: {}, flags: [], timing: {}
    });
    logEv('LOGIN', '', JSON.stringify({ role: roleId, avatar: 'basaulanh', timer: 0, edition: 'lean' }));
    save();
  }
  const phase = () => (!APP ? 'start' : C.pendingJournal(APP) ? 'result' : APP.game.n > D.seasons.length ? 'end' : 'decide');
  const g = () => APP.game, dec = () => APP.dec, role = () => D.roles[APP.roleId], season = () => D.seasons[g().n - 1];
  const okIds = () => CH_IDS.filter(id => E.eligible(D, g(), D.channels.find(c => c.id === id)));
  const norm = () => { const ok = okIds(); return E.normalizeAlloc(Object.fromEntries(ok.map(id => [id, dec().alloc[id]])), ok); };
  const sheet = () => (APP.sheets[g().n] = APP.sheets[g().n] || {});
  const draft = () => { const n = g().history.length; return (APP.journals['draft' + n] = APP.journals['draft' + n] || {}); };
  const codedShare = () => (role().ownFarm ? 1 : Math.min(1, dec().linked + (g().linkedBonus || 0)));

  /* ---------- hành động trên quyết định (ghi nhật ký kiểm toán như bản lớp học) ---------- */
  function setDec(k, v) {
    const d = dec(), o = d[k];
    if (k === 'intel') { const had = d.intel.includes(v); d.intel = had ? d.intel.filter(x => x !== v) : d.intel.concat([v]).slice(0, 2); logEv(had ? 'UNBUY_INTEL' : 'BUY_INTEL', '', v); }
    else if (k === 'alloc') { Object.entries(v).forEach(([id, x]) => { const b = d.alloc[id] || 0; d.alloc[id] = +x; if (b !== +x) logEv('CHANGE_ALLOC_' + id, b, +x); }); }
    else { d[k] = v; logEv({ priority: 'CHANGE_PRIORITY', option: 'CHOOSE_OPTION', induce: 'CHANGE_INDUCE', linked: 'CHANGE_LINKED' }[k] || ('CHANGE_' + k.toUpperCase()), o, v); }
    save();
  }
  function setSheet(patch) { Object.assign(sheet(), patch); save(); }
  function commit() {
    const n = g().n, sh = sheet();
    if (!C.sheetComplete(sh)) { ui.err = T('Thiếu ghi chú trước khi chốt: chọn mục tiêu và viết giả định, lý do (từ 10 ký tự).', 'Add the note before committing: pick a goal and write your assumption and reason (10+ characters).'); logEv('COMMIT_REJECTED', '', 'SHEET_INCOMPLETE'); save(); render(); return false; }
    ui.err = '';
    C.commitSeason(APP, D, E, RIVALS, n, sh);
    save(); ui.view = 'result'; ui.adv = false; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }
  function journalDone() {
    const n = g().history.length, r = g().history[n - 1], d = draft(), sh = APP.sheets[n] || {};
    if (!d.cause || !(d.next || '').trim()) { ui.err = T('Nhật ký còn thiếu: nguyên nhân sai lệch và thay đổi dự kiến ở vụ sau.', 'The journal is incomplete: cause of the gap and planned change.'); render(); return false; }
    ui.err = '';
    const fc = sh.forecastWhatIf != null ? sh.forecastWhatIf : sh.forecastFinal;
    APP.journals[n] = Object.assign({ deviation: r.profit - (fc || 0) }, d);
    delete APP.journals['draft' + n];
    logEv('WRITE_JOURNAL', '', JSON.stringify({ cause: d.cause, lumina: {} }));
    APP.roundStart = Date.now();
    save(); ui.view = 'decide'; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }

  /* ---------- màn mở đầu ---------- */
  function viewStart() {
    const saved = load(), su = ui.setup;
    return `<main id="dp2-main" class="bn2-hero"><div class="bn2-card">
      <div class="bn2-row" style="justify-content:space-between">
        <img class="logo" src="../assets/brand/bizon-wordmark-ink.png" alt="BizOn">
        <button class="bn2-iconbtn" data-act="lang">${T('EN', 'VI')}</button>
      </div>
      <div class="bn2-row" style="margin-top:14px;align-items:center"><img class="dp2-badge" src="../assets/brand/durian-passport-badge.webp" alt="">
        <div><p class="bn2-eyebrow" style="margin:0">${T('Bậc 3 · Quốc tế hoá · bản gọn', 'Level 3 · Internationalisation · lean version')}</p>
        <h1 style="font-size:32px;margin:4px 0 0">Hộ Chiếu Sầu Riêng</h1></div></div>
      <p class="bn2-muted" style="margin-top:10px">${T('Sáu vụ đưa sầu riêng Việt Nam ra thế giới, từ ngày Trung Quốc mở cửa chính ngạch (7/2022), đấu với 3 đối thủ AI. Mỗi vụ chỉ ba bước: chọn một ưu tiên đầu tư, chọn nguồn hàng, chia sản lượng cho các kênh – có dự báo trước khi chốt. Cùng engine, cùng đối thủ và cùng ván lưu với bản lớp học.',
        'Six seasons taking Vietnamese durian to the world, from the day China opened official trade (July 2022), against 3 AI rivals. Each season is three steps: pick one investment priority, choose your sourcing, split output across channels – with a forecast before you commit. Same engine, rivals and saved game as the classroom edition.')}</p>
      ${saved ? `<div class="bn2-sunk" style="margin-top:14px"><p class="bn2-small" style="margin:0"><b>${T('Ván đang dở', 'Game in progress')}</b> · ${esc(saved.cls || '—')} · ${esc(saved.team || '—')} · ${esc(nm(D.roles[saved.roleId]))} · ${T('vụ', 'season')} ${Math.min(saved.game.n, D.seasons.length)}/${D.seasons.length}${saved.game.n > D.seasons.length ? ' · ' + T('đã xong', 'finished') : ''}</p>
        <div class="bn2-row" style="margin-top:8px"><button type="button" class="bn2-btn pri" data-act="resume">${T('Tiếp tục ván', 'Resume')}</button><button type="button" class="bn2-btn ghost" data-act="discard">${T('Xoá ván cũ', 'Discard')}</button></div></div>` : ''}
      <form id="dp2-login" style="margin-top:16px">
        <label class="bn2-small"><b>${T('Mã lớp', 'Class ID')}</b> <span class="bn2-muted">${T('(tuỳ chọn – cùng mã lớp và doanh nghiệp thì cùng biến cố và đối thủ; cần cho chứng nhận)', '(optional – same class and firm give the same events and rivals; needed for certificates)')}</span>
          <input class="bn2-input" name="cls" maxlength="24" autocomplete="off" value="${esc(su.cls)}" placeholder="KT330H-F1"></label>
        <label class="bn2-small" style="display:block;margin-top:10px"><b>${T('Mã đội', 'Team code')}</b> <span class="bn2-muted">${T('(không nhập họ tên)', '(no personal names)')}</span>
          <input class="bn2-input" name="team" maxlength="16" autocomplete="off" value="${esc(su.team)}" placeholder="TEAM_03"></label>
        <p class="bn2-small" style="margin:12px 0 0"><b>${T('Doanh nghiệp của đội', 'Your firm')}</b> <span class="bn2-muted">${T('– nấc thấp giá rẻ nhưng chưa có mã số, nấc cao có mã số nhưng vốn vào nhiều hơn', '– lower rungs are cheap but hold no codes; higher rungs hold codes but need more capital')}</span></p>
        <div class="dp2-firms">${Object.entries(D.roles).map(([id, r]) => `<button type="button" class="bp2-opt ${su.roleId === id ? 'on' : ''}" data-act="role" data-v="${id}" aria-pressed="${su.roleId === id}"><span class="ic">${r.emoji}</span><span>${esc(nm(r))}<span class="sc">${esc(lang() === 'en' ? r.scaleEn : r.scaleVi)}</span><small>${esc(lang() === 'en' ? r.descEn : r.descVi)}</small></span></button>`).join('')}</div>
        <button class="bn2-btn pri block" style="margin-top:16px" type="submit">${T('Bắt đầu 6 vụ', 'Start the 6 seasons')}</button>
      </form>
      <p class="bn2-small bn2-muted" style="margin-top:14px">${T('Muốn bản đầy đủ (họp đội 5 vai, Nếu – Thì, hỏi Lumina, phiếu và nhật ký chi tiết, chứng nhận)?', 'Want the full version (5-role meeting, what-ifs, Lumina, full sheet and journal, certificates)?')} <a href="ho-chieu-sau-rieng.html">${T('Bản lớp học →', 'Classroom edition →')}</a> · <a href="ho-chieu-sau-rieng-3d.html">${T('Bản 3D →', '3D version →')}</a></p>
    </div></main>`;
  }

  /* ---------- thanh trên, cột phải ---------- */
  function dots() {
    const n = g().n, done = g().history.length;
    return `<div class="dp2-dots" aria-label="${T('Tiến trình 6 vụ', '6-season progress')}">${D.seasons.map((s, i) => { const f = APP.flags[i]; const cls = f ? (f.win ? 'win' : 'lose') : (i + 1 === n && done < D.seasons.length ? 'cur' : ''); return `<span class="${cls}" title="${T('Vụ', 'Season')} ${i + 1}">${f ? (f.win ? '✓' : '✗') : i + 1}</span>`; }).join('')}</div>`;
  }
  function viewTop() {
    return `<header class="bn2-top"><div class="bn2-wrap">
      <img class="logo" src="../assets/brand/bizon-wordmark-ink.png" alt="BizOn">
      <div style="min-width:0"><div class="team">${esc(APP.team || T('Đội của bạn', 'Your team'))}</div><div class="bp2-top-sub sub">${role().emoji} ${esc(nm(role()))}${APP.cls ? ' · ' + esc(APP.cls) : ''}</div></div>
      <div class="sp"></div>${dots()}
      <div class="bn2-cash" title="${T('Tiền mặt', 'Cash')}">💰 ${money(g().cash)}</div>
      <button class="bn2-iconbtn" data-act="lang">${T('EN', 'VI')}</button>
      <button class="bn2-iconbtn" data-act="help" aria-label="${T('Cách chơi', 'How to play')}">❓</button>
    </div></header>`;
  }
  function standings(upto) {
    const rv = id => D.rivals.find(r => r.id === id);
    const rows = [{ me: true, name: APP.team || T('Đội của bạn', 'Your team'), h: g().history.slice(0, upto) }]
      .concat(RIVALS.map(r => ({ name: nm(rv(r.id)) + ' ' + (rv(r.id).flag || ''), img: IMG(rv(r.id).img), sub: 'CEO ' + rv(r.id).ceo, h: r.state.history.slice(0, upto) })));
    rows.forEach(r => { r.profit = r.h.reduce((x, y) => x + y.profit, 0); r.blocked = r.h.filter(x => x.blockedCN).length; });
    rows.sort((a, b) => b.profit - a.profit);
    return `<div class="dp2-rank">${rows.map((r, i) => `<div class="row ${r.me ? 'me' : ''}">${r.img ? `<img src="${esc(r.img)}" alt="">` : '<span class="star">⭐</span>'}<div style="min-width:0">${['🥇', '🥈', '🥉', '4️⃣'][i]} ${esc(r.name)}<small style="display:block;font-weight:500;color:var(--clay-sub)">${r.me ? T('Đội bạn', 'Your team') : esc(r.sub)} · ${r.blocked} ${T('lô bị chặn', 'blocked')}</small></div><b class="${r.profit >= 0 ? 'pos' : 'neg'}">${money(r.profit)}</b></div>`).join('')}</div>`;
  }
  function viewSide() {
    const G = g(), a = G.assets, n = G.n, upto = Math.min(G.history.length, D.seasons.length);
    const creds = ['area', 'pack', 'test', 'trace', 'freezer'].map(k => { const has = k === 'test' ? a.test > 0 : a[k]; const p = D.priorities.find(x => x.id === k); return `<span class="${has ? 'on' : ''}">${has ? '✓' : '○'} ${esc(nm(p))}${k === 'test' && a.test ? ' ×' + a.test : ''}</span>`; }).join('');
    const cum = upto ? C.cumFlag(RIVALS, G.history, upto) : null;
    return `<section class="bn2-card"><h2 style="font-size:20px">${T('Bảng xếp hạng', 'Standings')}</h2>
      <p class="bn2-small bn2-muted" style="margin:4px 0 0">${upto ? T('Lợi nhuận lũy kế sau vụ', 'Cumulative profit after season') + ' ' + upto : T('Đối thủ đã chơi xong; so sánh từng vụ.', 'Rivals have already played; compare season by season.')}</p>
      ${standings(upto)}
      ${cum ? `<div class="dp2-flags"><span class="${cum.win ? 'cum' : ''}">${cum.win ? '🏁 ' : ''}${T('Lũy kế: hạng', 'Cumulative: rank')} ${cum.rank}/${cum.of}</span><span>🟩 ${APP.flags.filter(f => f && f.win).length}/${upto} ${T('cờ vụ', 'season flags')}</span></div>` : ''}
    </section>
    <section class="bn2-card"><h2 style="font-size:20px">${T('Hồ sơ của đội', 'Team credentials')}</h2>
      <div class="dp2-chips">${creds}</div>
      ${G.suspendedUntil >= n ? `<div class="dp2-warn">${T('Mã chính ngạch đang bị tạm dừng vụ này.', 'Your official-trade codes are suspended this season.')}</div>` : ''}
      <div class="dp2-kpis"><div><span>${T('Tiền mặt', 'Cash')}</span><b class="${G.cash >= 0 ? 'pos' : 'neg'}">${money(G.cash)}</b></div><div><span>${T('Uy tín', 'Reputation')}</span><b>${nf(G.rep)}</b></div>
        <div><span>${T('Ứng phó biến cố', 'Shock response')}</span><b>${nf(G.adapt)}</b></div><div><span>${role().ownFarm ? T('Sức khỏe vườn', 'Orchard health') : T('Bền vững', 'Sustainability')}</span><b>${nf(role().ownFarm ? G.treeHealth : G.sus)}</b></div></div>
    </section>`;
  }

  /* ---------- thẻ quyết định một vụ ---------- */
  function viewDecide() {
    const G = g(), d = dec(), s = season(), n = G.n, r = role(), a = G.assets, ev = E.eventFor(D, G), ok = okIds(), nz = norm(), sh = sheet();
    const sig = E.intelSignals(D, G, d.intel);
    const f = E.forecast(D, G, JSON.parse(JSON.stringify(d)));
    const coded = codedShare(), warnCN = ok.includes('CN') && (nz.CN || 0) > coded + 1e-9;
    const goals = C.goals(T), complete = C.sheetComplete(sh);
    const nd = NEED();
    return `<section class="bn2-card" aria-labelledby="dp2-dec-h">
      <p class="bn2-eyebrow">${T('Vụ', 'Season')} ${n}/${D.seasons.length} · ${esc(seasonLabel(s))}</p>
      <h2 id="dp2-dec-h" style="font-size:22px;margin-top:4px">${esc(nm(s))}</h2>
      <div class="dp2-ms">${esc(lang() === 'en' ? s.textEn : s.textVi)}<br><span class="src">${fact(s.anchor)}</span></div>
      ${ev ? `<div class="dp2-event"><p class="bn2-eyebrow" style="margin:0 0 4px">⚡ ${T('Biến cố đầu vụ', 'Event this season')}</p><h3>${esc(nm(ev))}</h3><p>${esc(lang() === 'en' ? ev.textEn : ev.textVi)}</p>
        <p class="bn2-small bn2-muted" style="margin:0 0 8px">${fact(ev.src)}</p>
        <div class="opts">${ev.options.map((o, i) => `<button type="button" class="bp2-choice ${d.option === i ? 'on' : ''}" data-act="opt" data-v="${i}" aria-pressed="${d.option === i}">${d.option === i ? '✓ ' : ''}${esc(nm(o))}</button>`).join('')}</div></div>` : ''}

      <p class="bp2-step"><span>1</span>${T('Một ưu tiên đầu tư', 'One investment priority')}</p>
      <div class="dp2-pri">${D.priorities.map(p => { const own = C.owned(a, p.id), cost = D.params.priorityCost[p.id]; return `<button type="button" class="bp2-opt ${d.priority === p.id ? 'on' : ''}" data-act="pri" data-v="${p.id}" aria-pressed="${d.priority === p.id}" ${own ? 'disabled' : ''}>${own ? '✓ ' : ''}${esc(nm(p))}<span class="cost">${cost ? money(cost) : T('0 đồng', 'free')}</span><small>${esc(lang() === 'en' ? p.effEn : p.effVi)}</small></button>`; }).join('')}</div>

      <p class="bp2-step"><span>2</span>${T('Nguồn hàng', 'Sourcing')}</p>
      ${r.ownFarm ? (s.season === 'off'
        ? `<div class="bp2-opts"><button type="button" class="bp2-opt ${d.induce ? 'on' : ''}" data-act="ind" data-v="1" aria-pressed="${d.induce}">${T('Xử lý ra hoa nghịch vụ', 'Induce off-season flowering')}<small>${T('Giá vựa cao gấp', 'Depot price ×')} ${nf(D.params.offMult, 1)}${T(' lần, nhưng tốn ', ', but costs ')}${D.params.treeHealthCost}${T(' điểm sức khỏe vườn', ' orchard-health points')}</small></button><button type="button" class="bp2-opt ${!d.induce ? 'on' : ''}" data-act="ind" data-v="0" aria-pressed="${!d.induce}">${T('Để vườn nghỉ', 'Rest the orchard')}<small>${T('Không có hàng vụ này, vườn hồi sức.', 'No fruit this season; the orchard recovers.')}</small></button></div>`
        : `<p class="bn2-small bn2-muted" style="margin:0">${T('Chính vụ: vườn nhà tự ra hoa, không cần xử lý.', 'Main season: the orchard flowers on its own.')}</p>`)
        : `<label class="bn2-small" for="dp2-linked" style="display:block">${T('Tỷ lệ mua từ vùng trồng liên kết có mã số', 'Share bought from linked, coded areas')} <span class="bn2-muted">${T('(đắt hơn', '(costs')} ${pct(D.params.linkedPremium)}${T(', nhưng chỉ hàng có mã mới đi được chính ngạch)', ' more, but only coded fruit can go official)')}</span></label>
          <div class="dp2-range"><input type="range" id="dp2-linked" min="0" max="100" step="10" value="${Math.round(d.linked * 100)}" data-field="linked"><output for="dp2-linked" id="dp2-linked-v">${pct(d.linked)}</output></div>`}

      <p class="bp2-step"><span>3</span>${T('Chia sản lượng cho các kênh', 'Split output across channels')}</p>
      <div class="dp2-ch">${D.channels.map(c => { const e = ok.includes(c.id); const cap = c.cap === null ? '' : `${T('tối đa', 'max')} ${nf(c.id === 'BORDER' ? c.cap * (1 - (s.borderCut || 0)) : c.cap)} ${T('tấn', 't')} · `;
        return `<div class="row ${e ? '' : 'lock'}"><div><b>${c.emoji} ${esc(nm(c))}</b><small>${e ? cap + T('giá ×', 'price ×') + nf(c.priceMult, 2) : '🔒 ' + T('cần ', 'needs ') + c.needs.map(k => nd[k]).join(' + ')}</small></div>
          <input type="range" min="0" max="100" step="5" value="${d.alloc[c.id] || 0}" data-ch="${c.id}" ${e ? '' : 'disabled'} aria-label="${esc(nm(c))}"><output id="dp2-pct-${c.id}">${e ? pct(nz[c.id] || 0) : '—'}</output></div>`; }).join('')}</div>
      ${warnCN ? `<div class="dp2-warn">⚠ ${T(`Chỉ ${pct(coded)} sản lượng (hàng từ vùng có mã) đi được chính ngạch; phần dư sẽ dồn về nội địa.`, `Only ${pct(coded)} of output (fruit from coded areas) can go official; the rest falls back to the domestic market.`)}</div>` : ''}

      <button type="button" class="bp2-more" data-act="adv" aria-expanded="${ui.adv}">${T('Nâng cao: mua tin thị trường', 'Advanced: buy market information')} (${d.intel.length}/2)</button>
      ${ui.adv ? `<div class="bn2-sunk"><p class="bn2-small bn2-muted" style="margin:0 0 6px">${T('Tối đa 2 nguồn mỗi vụ. Tin quyết định giá vựa dùng trong dự báo; có nguồn thổi giá, có nguồn ép giá.', 'Up to 2 sources per season. They set the depot price used in the forecast; some talk prices up, some down.')}</p>
        <div class="dp2-chips">${D.intel.map(i => `<button type="button" class="${d.intel.includes(i.id) ? 'on' : ''}" data-act="intel" data-v="${i.id}" ${!d.intel.includes(i.id) && d.intel.length >= 2 ? 'disabled' : ''}>${esc(nm(i))} · ${i.cost ? money(i.cost) : T('miễn phí', 'free')}${i.warnVi ? ' · ' + esc(lang() === 'en' ? i.warnEn : i.warnVi) : ''}</button>`).join('')}</div>
        ${sig.length ? `<ul class="dp2-sig">${sig.map(x => { const src = D.intel.find(i => i.id === x.id); return `<li><b>${esc(nm(src))}</b>: ${x.price != null ? T('giá vựa ≈', 'depot price ≈') + ' <b>' + nf(x.price) + '</b> ' + T('nghìn đ/kg', 'VND k/kg') : T('rủi ro kiểm dịch', 'quarantine risk') + ': <b>' + esc(String(x.risk)) + '</b>'}</li>`; }).join('')}</ul>` : ''}</div>` : ''}

      <div class="bn2-sunk" style="margin-top:14px"><p class="bn2-small" style="margin:0 0 8px"><b>${T('Dự báo của engine trước khi chốt', 'Engine forecast before you commit')}</b> <span class="bn2-muted">${T('(giá vựa ước từ tin đã mua; thực tế còn tuỳ giá thật và may rủi kiểm dịch)', '(depot price estimated from bought information; actual results depend on the real price and inspection luck)')}</span></p>
        <div class="dp2-kpis"><div><span>${T('Lợi nhuận dự báo', 'Forecast profit')}</span><b class="${f.profit >= 0 ? 'pos' : 'neg'}">${sgnMoney(f.profit)}</b></div><div><span>${T('Tiền mặt cuối vụ', 'Cash after')}</span><b class="${f.cashAfter >= 0 ? 'pos' : 'neg'}">${money(f.cashAfter)}</b></div>
          <div><span>${T('Khả năng lô chính ngạch bị chặn', 'Official-lot block chance')}</span><b>${pct(f.pBlockCN || 0)}</b></div><div><span>${T('Giá vựa ước', 'Est. depot price')}</span><b>${nf(f.depotEstimate)} <small>${T('nghìn đ/kg', 'k/kg')}</small></b></div></div></div>

      <p class="bp2-step" style="margin-top:18px"><span>✎</span>${T('Ghi chú trước khi chốt', 'Note before you commit')}</p>
      <p class="bn2-small bn2-muted" style="margin:0 0 6px">${T('Mục tiêu của vụ', 'Goal this season')}</p>
      <div class="dp2-chips">${Object.entries(goals).map(([k, v]) => `<button type="button" class="${sh.goal === k ? 'on' : ''}" data-act="goal" data-v="${k}" aria-pressed="${sh.goal === k}">${esc(v)}</button>`).join('')}</div>
      <label class="bn2-small" for="dp2-why" style="display:block;margin-top:10px">${T('Đội tin điều gì sẽ xảy ra, và vì sao chọn vậy? (từ 10 ký tự)', 'What does the team expect, and why this choice? (10+ characters)')}</label>
      <textarea class="dp2-text" id="dp2-why" data-field="why" maxlength="600">${esc(sh.ceo || '')}</textarea>
      ${ui.err ? `<p class="dp2-err">${esc(ui.err)}</p>` : ''}
      <button type="button" class="bn2-btn pri block" style="margin-top:14px" data-act="commit" id="dp2-commit" ${complete ? '' : 'disabled'}>${T('Chốt vụ', 'Commit season')} ${n} →</button>
    </section>`;
  }

  /* ---------- thẻ kết quả vụ + nhật ký rút gọn ---------- */
  function viewResult() {
    const G = g(), n = G.history.length, r = G.history[n - 1], s = D.seasons[n - 1], sh = APP.sheets[n] || {}, fl = APP.flags[n - 1] || {}, d = draft();
    const fc = sh.forecastWhatIf != null ? sh.forecastWhatIf : (sh.forecastFinal || 0);
    const rv = id => D.rivals.find(x => x.id === id);
    const rows = [{ name: APP.team || T('Đội của bạn', 'Your team'), p: r.profit, me: true }].concat(RIVALS.map(x => ({ name: nm(rv(x.id)), p: x.state.history[n - 1].profit })));
    const mx = Math.max(...rows.map(x => Math.abs(x.p)), 0.01);
    const ST = { ok: '✓', blocked: T('Bị chặn, bán nội địa giá rớt', 'Blocked, sold at home as rejects'), destroyed: T('Bị tiêu hủy', 'Destroyed') };
    const AUDIT = { pass: T('Đạt kiểm tra của Hải quan Trung Quốc', 'Passed the China Customs audit'), fail: T('Không đạt kiểm tra: mã bị tạm dừng vụ sau', 'Failed the audit: codes suspended next season'), na: T('Không đi chính ngạch nên không bị kiểm tra', 'No official trade, so no audit') };
    const NOTES = { fraud_exposed: T('Vụ dán nhãn Thái bị phát hiện: uy tín sụp đổ, mã bị tạm dừng.', 'The Thai relabelling was exposed: reputation collapses and codes are suspended.'), fraud_hidden: T('Vụ dán nhãn chưa bị phát hiện, nhưng đội đã chấp nhận rủi ro đạo đức.', 'The relabelling was not exposed, but the team accepted an ethical risk.'), over_credit: T('Vượt hạn mức vay: lãi 15 % phần vượt và −3 uy tín.', 'Over the credit limit: 15 % interest on the excess and −3 reputation.') };
    const causes = C.causes(T), cf = C.cumFlag(RIVALS, G.history, n);
    const last = n >= D.seasons.length;
    return `<section class="bn2-card" aria-labelledby="dp2-res-h">
      <p class="bn2-eyebrow">${T('Kết quả vụ', 'Season result')} ${n}/${D.seasons.length} · ${esc(seasonLabel(s))}</p>
      <div class="bn2-flag ${fl.win ? 'win' : 'lose'}" id="dp2-res-h">${fl.win ? '🟩 ' + T('Đội cắm cờ vụ này!', 'Your team plants the flag!') : '🟥 ' + T('Đối thủ giữ cờ vụ này', 'A rival takes this season\'s flag')}</div>
      <p class="bn2-small bn2-muted" style="margin:6px 0 0">${cf.win ? '🏁 ' : ''}${T('Lũy kế sau vụ', 'Cumulative after season')} ${n}: ${T('hạng', 'rank')} ${cf.rank}/${cf.of} · ${money(cf.team)}</p>
      <div class="dp2-kpis"><div><span>${T('Doanh thu', 'Revenue')}</span><b>${money(r.revenue)}</b></div><div><span>${T('Mua hàng / giá thành', 'Purchases / farm cost')}</span><b>${money(r.purchase)}</b></div><div><span>${T('Hao hụt', 'Losses')}</span><b>${pct(r.loss)}</b></div><div><span>${T('Lợi nhuận vụ', 'Season profit')}</span><b class="${r.profit >= 0 ? 'pos' : 'neg'}">${sgnMoney(r.profit)}</b></div></div>
      <table class="bp2-table" style="margin-top:10px"><thead><tr><th>${T('Kênh', 'Channel')}</th><th>${T('Tấn', 'Tonnes')}</th><th>${T('Giá', 'Price')}</th><th>${T('Doanh thu', 'Revenue')}</th><th>${T('Tình trạng', 'Status')}</th></tr></thead><tbody>
        ${r.byChannel.filter(c => c.qty > 0.5).map(c => { const ch = D.channels.find(x => x.id === c.id); return `<tr><td>${ch.emoji} ${esc(nm(ch))}</td><td>${nf(c.qty)}</td><td>${nf(c.price)}</td><td>${money(c.revenue)}</td><td class="${c.status === 'ok' ? 'pos' : 'neg'}">${ST[c.status] || esc(c.status)}</td></tr>`; }).join('')}</tbody></table>
      ${r.audit ? `<div class="bp2-note">${AUDIT[r.audit] || ''}</div>` : ''}${(r.notes || []).map(x => NOTES[x] ? `<div class="bp2-note">${NOTES[x]}</div>` : '').join('')}
      <h3 style="font-size:17px;margin:16px 0 6px">${T('Đấu trường: lợi nhuận vụ', 'Arena: season profit')}</h3>
      <div class="dp2-arena">${rows.map(x => `<div class="row ${x.me ? 'me' : ''}"><span>${x.me ? '⭐ <b>' + esc(x.name) + '</b>' : esc(x.name)}</span><div class="bar"><i style="width:${Math.max(2, 100 * Math.abs(x.p) / mx)}%"></i></div><b class="${x.p >= 0 ? 'pos' : 'neg'}">${money(x.p)}</b></div>`).join('')}</div>
      <div class="dp2-kpis" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><span>${T('Dự báo', 'Forecast')}</span><b>${money(fc)}</b></div><div><span>${T('Thực tế', 'Actual')}</span><b>${money(r.profit)}</b></div><div><span>${T('Sai lệch', 'Gap')}</span><b class="${r.profit - fc >= 0 ? 'pos' : 'neg'}">${sgnMoney(r.profit - fc)}</b></div></div>
      <p class="bn2-small bn2-muted" style="margin:6px 0 0">${T('Giá vựa thực tế', 'Actual depot price')} ${nf(r.depot)} ${T('nghìn đ/kg', 'VND k/kg')}${r.blockedCN ? ' · ' + T('lô chính ngạch bị chặn', 'official lot blocked') : ''}.</p>

      <p class="bp2-step" style="margin-top:18px"><span>✎</span>${T('Nhật ký vụ', 'Season journal')}</p>
      <p class="bn2-small bn2-muted" style="margin:0 0 6px">${T('Nguyên nhân chính của sai lệch', 'Main cause of the gap')}</p>
      <div class="dp2-chips">${Object.entries(causes).map(([k, v]) => `<button type="button" class="${d.cause === k ? 'on' : ''}" data-act="cause" data-v="${k}" aria-pressed="${d.cause === k}">${esc(v)}</button>`).join('')}</div>
      <label class="bn2-small" for="dp2-next" style="display:block;margin-top:10px">${T('Thay đổi dự kiến ở vụ sau', 'Planned change next season')}</label>
      <textarea class="dp2-text" id="dp2-next" data-field="next" maxlength="600">${esc(d.next || '')}</textarea>
      ${ui.err ? `<p class="dp2-err">${esc(ui.err)}</p>` : ''}
      <button type="button" class="bn2-btn pri block" style="margin-top:14px" data-act="journal">${last ? '🏁 ' + T('Lưu nhật ký và xem tổng kết', 'Save journal and see the summary') : T('Lưu nhật ký, sang vụ', 'Save journal, go to season') + ' ' + (n + 1) + ' →'}</button>
    </section>`;
  }

  /* ---------- tổng kết (báo cáo đầy đủ, chứng nhận, xuất dữ liệu: bản lớp học) ---------- */
  function viewEnd() {
    const G = g(), S = E.summary(D, G), won = APP.flags.filter(f => f && f.win).length, B = BADGE();
    const part = { profit: T('Lợi nhuận', 'Profit'), reputation: T('Uy tín', 'Reputation'), capability: T('Năng lực', 'Capability'), adaptation: T('Ứng phó biến cố', 'Shock response'), sustainability: T('Bền vững', 'Sustainability') };
    const rv = id => D.rivals.find(x => x.id === id);
    const board = [{ name: APP.team || T('Đội của bạn', 'Your team'), me: true, S }].concat(RIVALS.map(x => ({ name: nm(rv(x.id)) + ' ' + (rv(x.id).flag || ''), img: IMG(rv(x.id).img), S: E.summary(D, x.state) }))).sort((a, b) => b.S.total - a.S.total);
    return `<section class="bn2-card" style="text-align:center"><p class="bn2-eyebrow">${T('Hết 6 vụ', 'Six seasons are over')}</p>
      <h1 style="font-size:30px;margin:6px 0">${esc(APP.team || T('Đội của bạn', 'Your team'))} · ${nf(S.total)}/100</h1>
      <p class="bn2-muted" style="margin:6px 0 0">${T(`Đội cắm ${won}/${D.seasons.length} cờ vụ. Tổng lợi nhuận ${money(S.profit)} (mốc của vai: ${money(S.bench)}).`, `Your team planted ${won}/${D.seasons.length} season flags. Total profit ${money(S.profit)} (role benchmark: ${money(S.bench)}).`)}</p>
      <div class="dp2-score" style="text-align:left">${Object.keys(D.scoreWeights).map(k => `<div class="row"><span>${part[k]} (${D.scoreWeights[k]}%)</span><div class="bar"><i style="width:${Math.max(0, Math.min(100, S.parts[k]))}%"></i></div><b>${nf(S.parts[k])}</b></div>`).join('')}</div>
      ${S.badges.length ? `<div class="dp2-badges" style="justify-content:center">${S.badges.map(b => `<span class="${/fake|exhaust/.test(b) ? 'bad' : ''}">${esc(B[b] || b)}</span>`).join('')}</div>` : ''}
      <h3 style="font-size:17px;margin:16px 0 6px">${T('Bảng xếp hạng cuối', 'Final leaderboard')}</h3>
      <div class="dp2-rank" style="text-align:left">${board.map((b, i) => `<div class="row ${b.me ? 'me' : ''}">${b.img ? `<img src="${esc(b.img)}" alt="">` : '<span class="star">⭐</span>'}<div>${['🥇', '🥈', '🥉', '4️⃣'][i]} ${esc(b.name)}<small style="display:block;font-weight:500;color:var(--clay-sub)">${T('điểm', 'score')} ${nf(b.S.total)}</small></div><b class="${b.S.profit >= 0 ? 'pos' : 'neg'}">${money(b.S.profit)}</b></div>`).join('')}</div>
      <p class="bn2-small bn2-muted" style="margin-top:10px">${T('Đối thủ dùng chiến lược cố định; so sánh để thảo luận lối đi nào bền vững.', 'Rivals use fixed strategies; compare them to discuss which path is sustainable.')}</p>
      <div class="bn2-row" style="justify-content:center;margin-top:14px"><a class="bn2-btn pri" href="ho-chieu-sau-rieng.html?resume=1">📄 ${T('Báo cáo đầy đủ, chứng nhận, xuất dữ liệu →', 'Full report, certificates, data export →')}</a><button type="button" class="bn2-btn ghost" data-act="again">🔄 ${T('Chơi ván mới', 'Play a new game')}</button></div>
      <p class="bn2-small bn2-muted" style="margin-top:8px">${T('Ván này đã lưu trên máy; bản lớp học mở đúng ván này (dấu vết quyết định, câu hỏi thảo luận, CSV/JSON, hai chứng nhận cho ván có Mã lớp).', 'This game is saved on the device; the classroom edition opens the same game (decision trail, discussion questions, CSV/JSON, two certificates for games with a Class ID).')}</p>
    </section>`;
  }
  function viewHelp() {
    const rvs = RIVALS ? RIVALS.map(r => C.rivalCard(D, D.rivals.find(x => x.id === r.id), T)) : [];
    return `<div class="bn2-modal" role="dialog" aria-modal="true" aria-labelledby="dp2-help-h"><div class="bn2-card bp2-help">
      <h2 id="dp2-help-h" style="font-size:24px">❓ ${T('Cách chơi trong 1 phút', 'How to play in 1 minute')}</h2>
      <ol><li><b>${T('Ba bước mỗi vụ', 'Three steps each season')}:</b> ${T('một ưu tiên đầu tư, nguồn hàng (vùng có mã hay thương lái), chia sản lượng cho các kênh đang mở; rồi ghi mục tiêu và lý do, chốt.', 'one investment priority, sourcing (coded areas or traders), split output across open channels; then note your goal and reason, and commit.')}</li>
        <li><b>${T('Mã số mở kênh', 'Codes unlock channels')}:</b> ${T('chính ngạch cần mã vùng trồng + mã đóng gói (từ vụ sau khi đầu tư); đông lạnh cần kho cấp đông; Nhật Bản cần kiểm nghiệm. Tiểu ngạch bị siết dần qua 6 vụ.', 'official trade needs an area code + packing code (from the season after you invest); frozen needs a freezer; Japan needs testing. Border trade tightens over the 6 seasons.')}</li>
        <li><b>${T('Biến cố', 'Events')}:</b> ${T('mỗi vụ một biến cố thật có trích nguồn; mỗi phương án đổi tiền, sản lượng, uy tín, bền vững.', 'one sourced real event per season; each response trades cash, volume, reputation and sustainability.')}</li>
        <li><b>${T('Dự báo', 'Forecast')}:</b> ${T('engine ước lợi nhuận từ giá vựa công khai hoặc tin đã mua; thực tế còn tuỳ giá thật và kiểm dịch.', 'the engine estimates profit from the public depot price or bought information; reality also depends on the real price and inspections.')}</li>
        <li><b>${T('Cờ và điểm', 'Flags and score')}:</b> ${T('cờ 🟩 khi lãi vụ bằng hoặc hơn đối thủ cao nhất; điểm 0–100 = lợi nhuận, uy tín, năng lực, ứng phó biến cố, bền vững.', '🟩 flag when season profit matches or beats the best rival; score 0–100 = profit, reputation, capability, shock response, sustainability.')}</li></ol>
      ${rvs.length ? `<h3 style="font-size:16px;margin:14px 0 4px">${T('Ba đối thủ của ván này', 'The three rivals in this game')}</h3><div class="dp2-rvs">${rvs.map(c => `<div class="rv"><img src="${IMG(c.img)}" alt=""><div><b>${esc(c.name)} ${c.flag}</b><small>CEO ${esc(c.ceo)} · ${esc(c.group)} · ${esc(c.style)}</small><small>${esc(c.planText)}</small><small>${esc(c.alloc)} · ${esc(c.linked)}</small></div></div>`).join('')}</div><p class="bn2-small bn2-muted" style="margin-top:8px">${esc(C.rivalNote(T))}</p>` : ''}
      <div class="bp2-rules">${C.howToPlay(D, T).map(sec => `<h3>${esc(sec.title)}</h3><ul>${sec.lines.map(([k, v]) => `<li><b>${esc(k)}</b> – ${esc(v)}</li>`).join('')}</ul>`).join('')}</div>
      <button type="button" class="bn2-btn pri block" style="margin-top:14px" data-act="closehelp">${T('Đã hiểu, chơi tiếp', 'Got it, back to the game')}</button></div></div>`;
  }

  /* ---------- vẽ ---------- */
  function render() {
    const el = app(); if (!el) return;
    document.documentElement.lang = lang();
    const ph = phase();
    if (ph === 'start') { el.innerHTML = viewStart(); return; }
    const main = ph === 'end' ? viewEnd() : ph === 'result' ? viewResult() : viewDecide();
    el.innerHTML = viewTop() + `<main id="dp2-main" class="bn2-wrap"><div class="bn2-grid main"><div class="bn2-grid">${main}</div><div class="bn2-grid">${viewSide()}</div></div></main>` + (ui.help ? viewHelp() : '');
  }

  /* ---------- sự kiện ---------- */
  function onClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act, v = b.dataset.v;
    if (act === 'lang') { const n = lang() === 'en' ? 'vi' : 'en'; store.set('bizon-lang', n); render(); return; }
    if (act === 'help') { ui.help = true; render(); return; }
    if (act === 'closehelp') { ui.help = false; render(); return; }
    if (act === 'role') { ui.setup.roleId = v; document.querySelectorAll('[data-act=role]').forEach(x => { const on = x.dataset.v === v; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); return; }
    if (act === 'resume') { const s = load(); if (s) { boot(s); logEv('RESUME', '', 'R' + s.game.n); save(); ui.view = 'decide'; render(); window.scrollTo(0, 0); } return; }
    if (act === 'discard') { if (confirm(T('Xoá hẳn ván đang lưu trên máy này?', 'Permanently delete the saved game on this device?'))) { store.del(SAVE_KEY); render(); } return; }
    if (act === 'again') { if (!confirm(T('Ván mới sẽ xoá ván này khỏi máy (tải dữ liệu ở bản lớp học trước nếu cần). Tiếp tục?', 'A new game deletes this one from the device (export data in the classroom edition first if needed). Continue?'))) return; store.del(SAVE_KEY); APP = null; RIVALS = null; render(); window.scrollTo(0, 0); return; }
    if (!APP) return;
    if (act === 'adv') { ui.adv = !ui.adv; render(); return; }
    if (act === 'opt') { setDec('option', +v); render(); return; }
    if (act === 'pri') { setDec('priority', v); render(); return; }
    if (act === 'ind') { setDec('induce', v === '1'); render(); return; }
    if (act === 'intel') { setDec('intel', v); render(); return; }
    if (act === 'goal') { setSheet({ goal: v }); logEv('SHEET_GOAL', '', v); save(); ui.err = ''; render(); return; }
    if (act === 'commit') { commit(); return; }
    if (act === 'cause') { draft().cause = v; save(); ui.err = ''; render(); return; }
    if (act === 'journal') { journalDone(); return; }
  }
  function onInput(e) {
    const el = e.target; if (!el || !APP) return;
    if (el.dataset.ch) {
      dec().alloc[el.dataset.ch] = +el.value;
      const nz = norm(); okIds().forEach(id => { const o = $('dp2-pct-' + id); if (o) o.textContent = pct(nz[id] || 0); });
    } else if (el.dataset.field === 'linked') { dec().linked = +el.value / 100; const o = $('dp2-linked-v'); if (o) o.textContent = pct(dec().linked); }
    else if (el.dataset.field === 'why') { setSheet({ assume: el.value, ceo: el.value }); const btn = $('dp2-commit'); if (btn) btn.disabled = !C.sheetComplete(sheet()); }
    else if (el.dataset.field === 'next') { draft().next = el.value; }
    else if (el.name === 'cls') ui.setup.cls = el.value;
    else if (el.name === 'team') ui.setup.team = el.value;
  }
  function onChange(e) {
    const el = e.target; if (!el || !APP) return;
    if (el.dataset.ch) { logEv('CHANGE_ALLOC_' + el.dataset.ch, '', +el.value); save(); render(); }
    else if (el.dataset.field === 'linked') { logEv('CHANGE_LINKED', '', dec().linked); save(); render(); }
    else if (el.dataset.field === 'why') { logEv('EDIT_SHEET_CEO', '', el.value.length + ' chars'); save(); }
    else if (el.dataset.field === 'next') save();
  }
  function onSubmit(e) {
    if (!e.target || e.target.id !== 'dp2-login') return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const saved = load();
    if (saved && !confirm(T('Bắt đầu ván mới sẽ ghi đè ván đang dở. Tiếp tục?', 'A new game will overwrite the saved one. Continue?'))) return;
    newGame({ cls: String(fd.get('cls') || ''), team: String(fd.get('team') || '').toUpperCase(), roleId: ui.setup.roleId });
    ui.view = 'decide'; ui.err = ''; render(); window.scrollTo(0, 0);
  }
  function start() {
    document.addEventListener('click', onClick); document.addEventListener('input', onInput); document.addEventListener('change', onChange); document.addEventListener('submit', onSubmit);
    window.addEventListener('bizon:langchange', render);
    render();
  }
  /* API chỉ đọc + vài hành động, dùng cho kiểm thử và cho giảng viên soi ván */
  return { start, render, phase, ui, app: () => APP, rivals: () => RIVALS, dec, newGame, resume: () => { const s = load(); if (s) { boot(s); render(); } return !!s; },
    setDec, setSheet, setJournal: patch => { Object.assign(draft(), patch); save(); }, commit, journalDone, forecast: () => E.forecast(D, g(), JSON.parse(JSON.stringify(dec()))), okIds, norm, SAVE_KEY };
})();
window.DP2 = DP2;
