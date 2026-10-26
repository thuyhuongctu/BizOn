/* BizOn Bật Nghiệp · giao diện mới (bat-nghiep-v2.html) – lớp giao diện, KHÔNG có công thức mô phỏng.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Mọi con số do js/engine.js tính: newGameState, simulateRound, forecastCash, whatIfSimulate, luminaAdvice,
 * currentEvent. Tệp này chỉ đọc trạng thái S, vẽ màn hình và gọi engine đúng như js/app.js gọi:
 * - kiểm vốn trước khi chốt (ERR_INSUFFICIENT_FUNDS), cắm cờ = thị phần cao nhất VÀ có lãi (recordConquest);
 * - lượt hỏi Lumina AI_QUOTA_PER_ROUND (+2 với kỹ năng SK_AI1), lượt Nếu–Thì WHAT_IF_LIMIT;
 * - lưu chung khoá 'bizon2026' và đồng bộ qua BizonBackend (submitRound, syncTeamState, loadTeamState).
 * Các tên toàn cục S, T, currentLang, money, save, renderAll được js/market-dynamic.js, js/class-sync.js,
 * js/lumina-whatif.js đọc – giữ đúng tên như js/app.js.
 */

const STORAGE_KEY = 'bizon2026';
let S = null;

function currentLang() { try { return localStorage.getItem('bizon-lang') || 'vi'; } catch (e) { return 'vi'; } }
function T(vi, en) { return currentLang() === 'en' ? en : vi; }
const money = m => currentLang() === 'en'
  ? ((m >= 1000 || m <= -1000) ? (m / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' bn₫' : Math.round(m).toLocaleString('en-US') + 'm₫')
  : ((m >= 1000 || m <= -1000) ? (m / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ₫' : Math.round(m).toLocaleString('vi-VN') + 'tr₫');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) {}
  if (window.BizonBackend && S) BizonBackend.syncTeamState(S);
}
// Bổ sung trường cho tiến trình cũ – cùng danh sách mặc định với applyStateDefaults() của js/app.js.
function applyStateDefaults(s) {
  if (!s) return s;
  s.missionsClaimed ??= []; s.aiAskedTotal ??= 0; s.itemsBought ??= 0;
  s.minigameBest ??= 0; s.minigamePlays ??= 0; s.roundLocked ??= false; s.grantLog ??= [];
  s.minigamePoints ??= 0; s.rewardsOwned ??= []; s.rewardEquipped ??= null;
  s.oee ??= 85; s.defect ??= 2.0; s.brandLoyalty ??= 65; s.adEff ??= 0;
  s.quickRatio ??= 1.0; s.roi ??= 0; s.energyLines ??= [2100, 4850, 1470];
  s.lineUpgraded ??= [false, false, false]; s.maintBonus ??= 0; s.maintenanceLog ??= [];
  s.loan ??= 0; s.costCutter ??= false; s.peakShare ??= 0; s.eventShownRound ??= 0;
  s.rivalDialogueShownRound ??= 0; s.whatIfUsed ??= 0; s.advisorHistory ??= [];
  s.whatIfTotal ??= 0; s.suggestionsApplied ??= 0; s.achShown ??= (s.achievements || []).slice();
  s.conquest ??= []; s.aiHistory ??= []; s.teamMembers ??= null;
  s.difficulty ??= 'normal'; s.autoDiff ??= 1.0; s.caseId ??= 'A'; s.caseDrawn ??= false;
  if (((s.profile && s.profile.classId) || '').trim()) s.difficulty = 'normal';
  return s;
}
function load() {
  try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY)); return s ? applyStateDefaults(s) : null; } catch (e) { return null; }
}
const isTrial = () => !((S && S.profile && S.profile.classId) || '').trim();

// Sáu tỉnh dừng chân của bản đồ chinh phục – trùng CONQUEST_STOPS của js/app.js.
const CONQUEST_STOPS = [
  { name: 'Cần Thơ', zone: 'Đồng bằng sông Cửu Long', zoneEn: 'Mekong Delta' },
  { name: 'TP. Hồ Chí Minh', zone: 'Đông Nam Bộ', zoneEn: 'Southeast region' },
  { name: 'Khánh Hòa', zone: 'Duyên hải Nam Trung Bộ', zoneEn: 'South Central Coast' },
  { name: 'Đà Nẵng', zone: 'Duyên hải miền Trung', zoneEn: 'Central Coast' },
  { name: 'Thanh Hóa', zone: 'Bắc Trung Bộ', zoneEn: 'North Central Coast' },
  { name: 'Hà Nội', zone: 'Đồng bằng sông Hồng', zoneEn: 'Red River Delta' },
];
// Cắm cờ: thị phần cao nhất VÀ có lãi – y hệt recordConquest() của js/app.js.
function recordConquest(report) {
  const best = S.competitors.reduce((acc, c) => ((c.share || 0) > (acc.share || 0) ? c : acc), { share: 0, name: 'AI' });
  const hasTopShare = report.share >= (best.share || 0);
  const win = hasTopShare && report.netProfit > 0;
  (S.conquest ??= []).push({ round: report.round, win, hasTopShare, winner: win ? S.profile.teamName : best.name });
  (S.aiHistory ??= []).push(S.competitors.map(c => ({ name: c.name, share: Math.round((c.share || 0) * 10) / 10 })));
  unlockAchievements(S, report);
  return win;
}

const RIVALS = {
  aggressive: { img: 'assets/character/rivals/alpha.webp', color: '#e8762d', vi: 'Giá rẻ tốc chiến · ~130k, marketing ~85tr', en: 'Budget blitz · ~130k, marketing ~85m' },
  balanced: { img: 'assets/character/rivals/mekong.webp', color: '#00a0c8', vi: 'Cân bằng chắc chắn · ~150k, marketing ~60tr', en: 'Steady balance · ~150k, marketing ~60m' },
  premium: { img: 'assets/character/rivals/star.webp', color: '#5a32a3', vi: 'Cao cấp thương hiệu · ~180k, marketing ~85tr', en: 'Premium brand · ~180k, marketing ~85m' },
};
const ROLES = ['CEO', 'CFO', 'CMO', 'COO', 'SEC'];
const CSUITE = r => 'assets/character/csuite/' + r.toLowerCase() + '-smile.webp';
// Biên của thanh trượt – trùng các <input type=range> trong game.html.
const RANGE = { price: [80, 300, 5], marketing: [0, 200, 5], production: [200, 4000, 100], rd: [0, 150, 5], workers: [20, 100, 5], training: [0, 10, 1] };
const DEFAULT_D = { price: 150, marketing: 50, production: 2800, rd: 30, workers: 45, training: 0, funding: 'equity', paymentTerm: 30 };

function renderAll() { if (window.BN2) BN2.render(); }   // js/class-sync.js gọi sau khi giảng viên khoá vòng / cấp vốn

const BN2 = (() => {
  const app = () => document.getElementById('bn2-app');
  const ui = { screen: 'start', role: 'CEO', d: null, advice: [], whatIf: null };
  const loc = () => T('vi-VN', 'en-US');
  const num = v => Math.round(v).toLocaleString(loc());
  const pct = v => (Math.round(v * 10) / 10).toLocaleString(loc()) + '%';
  const sgn = v => (v > 0 ? '+' : '') + money(v);
  const quota = () => AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0);

  function lastDecisions() {
    const last = S && S.history[S.history.length - 1];
    return Object.assign({}, DEFAULT_D, last ? last.decisions : {});
  }
  // Dự báo dòng tiền: như liveForecast() của js/app.js – ưu tiên LuminaWhatIf.forecast (có thị trường động).
  function forecast(d) {
    const fc = forecastCash(S, d);
    const LW = window.LuminaWhatIf;
    if (!LW || typeof LW.forecast !== 'function') return fc;
    try { const f = LW.forecast(S, d); return Object.assign(fc, { inflow: Math.round(f.revenue), outflow: Math.round(f.cost), net: Math.round(f.profit), estSold: f.sold }); }
    catch (e) { return fc; }
  }
  const cashNeeded = d => d.marketing + d.rd + d.production * UNIT_COST / 1000 + d.workers * WAGE_PER_WORKER + d.workers * d.training;

  // ---------- màn mở đầu ----------
  function viewStart() {
    const old = load();
    return `<main id="bn2-main" class="bn2-hero"><div class="bn2-card">
      ${ui.journey && ui.journey.id && window.BizOnJourneyLink ? BizOnJourneyLink.bannerHtml(ui.journey) : ''}
      <div class="bn2-row" style="justify-content:space-between">
        <img class="logo" src="assets/brand/bizon-wordmark-ink.png" alt="BizOn">
        <button class="bn2-iconbtn" data-act="lang">${T('EN', 'VI')}</button>
      </div>
      <p class="bn2-eyebrow" style="margin-top:14px">${T('Bậc 2 · Vận hành doanh nghiệp', 'Level 2 · Running a business')}</p>
      <h1 style="font-size:40px;margin:6px 0 4px">Bật Nghiệp</h1>
      <p class="bn2-muted">${T('Điều hành xưởng đồ chơi đất sét qua 6 vòng, từ Cần Thơ tới Hà Nội, đấu với 3 đối thủ ảo. Giao diện mới – cùng engine, cùng chấm điểm như bản gốc.', 'Run a clay-toy workshop through 6 rounds, from Cần Thơ to Hà Nội, against 3 virtual rivals. New interface – same engine and grading as the original.')}</p>
      ${old && old.profile ? `<div class="bn2-sunk" style="margin-top:14px">
        <p class="bn2-small" style="margin:0 0 8px">${T('Ván đang dở trên máy này', 'Game in progress on this device')}: <b>${esc(old.profile.teamName)}</b> · ${old.finished ? T('đã xong 6 vòng', 'all 6 rounds done') : T('vòng', 'round') + ' ' + old.round + '/6'}</p>
        <button class="bn2-btn teal block" data-act="resume">${T('Tiếp tục ván này →', 'Continue this game →')}</button></div>` : ''}
      <form id="bn2-login" style="margin-top:16px">
        <label class="bn2-small"><b>${T('Tên đội (= tên doanh nghiệp)', 'Team name (= company name)')}</b>
          <input class="bn2-input" name="team" maxlength="40" required placeholder="${T('VD: Đội Rồng Xanh', 'e.g. Green Dragon')}"></label>
        <label class="bn2-small" style="display:block;margin-top:10px"><b>${T('Mã lớp', 'Class ID')}</b> <span class="bn2-muted">${T('(bỏ trống = chơi thử, không gửi điểm)', '(leave blank = trial, no score sent)')}</span>
          <input class="bn2-input" name="classId" maxlength="40" autocomplete="off"></label>
        <p class="bn2-small" style="margin:12px 0 0"><b>${T('Vai của bạn trong đội', 'Your role in the team')}</b></p>
        <div class="bn2-roles">${ROLES.map(r => `<button type="button" data-act="role" data-v="${r}" class="${ui.role === r ? 'on' : ''}" aria-pressed="${ui.role === r}"><img src="${CSUITE(r)}" alt="">${r}</button>`).join('')}</div>
        <button class="bn2-btn pri block" style="margin-top:16px" type="submit">${T('Vào chơi', 'Start playing')}</button>
      </form>
      <button class="bn2-btn ghost block" style="margin-top:10px" data-act="demo">${T('Chơi thử với Đội Demo', 'Try with the Demo Team')}</button>
      <p class="bn2-small bn2-muted" style="margin-top:14px">${T('Muốn bản đầy đủ (cửa hàng, kỹ năng, nhiệm vụ, chứng nhận)?', 'Want the full version (shop, skills, missions, certificate)?')} <a href="game.html">game.html</a></p>
    </div></main>`;
  }

  async function startGame(team, classId, role) {
    let restored = null;
    if (classId && window.BizonBackend) {
      try { const sv = await BizonBackend.loadTeamState(classId, team); if (sv && sv.state_json) restored = applyStateDefaults(sv.state_json); } catch (e) {}
    }
    const same = (a, b) => String(a || '').trim().replace(/\s+/g, ' ').toLowerCase() === String(b || '').trim().replace(/\s+/g, ' ').toLowerCase();
    if (!restored) { const local = load(); if (local && local.profile && same(local.profile.classId, classId) && same(local.profile.teamName, team)) restored = local; }
    S = restored || newGameState({ email: 'sinhvien@bizon.vn', teamName: team, role, classId });
    if (window.BizOnExplain) BizOnExplain.init({ classCode: classId });   // nhánh hộp đen (R1)
    if (!restored) {
      S.difficulty = 'normal';
      // Bốc thăm trường hợp A/B/C như doLogin() của js/app.js: cố định theo Mã lớp + tên đội.
      if (window.BizOnSeedEngine) { try { S.caseId = BizOnSeedEngine.pick(BizOnSeedEngine.createSeed(classId || 'TRIAL', team, 'case-draw'), 'case', ['A', 'B', 'C']); } catch (e) {} }
    }
    applyStateDefaults(S);
    // Hành trình 3 bậc (?journey=): ván mới hỏi nhận hành trang Bậc 1 → 2 (lớp có mã thật: theo cờ lớp journey_carry, đọc một lần).
    if (!restored && window.BizOnJourneyLink && ui.journey && ui.journey.active) {
      let controls = null;
      try { if (window.BizOnClassSync && BizOnClassSync.fetchControls) controls = await Promise.race([BizOnClassSync.fetchControls(classId, team), new Promise(r => setTimeout(() => r(null), 2500))]); } catch (e) {}
      const applied = await BizOnJourneyLink.offerCarry(ui.journey, { classControls: controls });
      BizOnJourneyLink.stamp(S, ui.journey, applied);
      if (applied) BizOnJourney.applyToTier2(S, { applied });
    }
    save();
    ui.d = lastDecisions(); ui.advice = []; ui.whatIf = null; ui.screen = 'play';
    render();
  }

  // ---------- màn chơi ----------
  function viewTop() {
    const cq = S.conquest || [];
    return `<header class="bn2-top"><div class="bn2-wrap">
      <img class="logo" src="assets/brand/bizon-wordmark-ink.png" alt="BizOn">
      <div style="min-width:0"><div class="team">${esc(S.profile.teamName)}</div>
        <div class="bn2-small bn2-muted sub">${esc(S.profile.role || '')}${isTrial() ? ' · ' + T('chơi thử', 'trial') : ' · ' + esc(S.profile.classId)}</div></div>
      <div class="sp"></div>
      <div class="bn2-rounds" aria-label="${T('Tiến trình 6 vòng', '6-round progress')}">${CONQUEST_STOPS.map((st, i) => {
        const c = cq[i], cur = !S.finished && i === S.round - 1;
        return `<span class="${c ? (c.win ? 'win' : 'lose') : cur ? 'cur' : ''}" title="${esc(st.name)}">${c ? (c.win ? '🚩' : i + 1) : i + 1}</span>`; }).join('')}</div>
      <div class="bn2-cash" title="${T('Số dư', 'Balance')}">${money(S.balance)}</div>
      <button class="bn2-iconbtn" data-act="lang">${T('EN', 'VI')}</button>
      <button class="bn2-iconbtn" data-act="menu" aria-label="${T('Tuỳ chọn', 'Options')}">☰</button>
    </div></header>`;
  }

  function viewEvent() {
    const ev = currentEvent(S), st = CONQUEST_STOPS[S.round - 1] || {};
    return `<section class="bn2-card"><div class="bn2-event">
      <img src="assets/character/${esc(ev.luminaImg || 'lumina-vest')}.webp" onerror="this.onerror=null;this.src='assets/character/lumina-vest.webp'" alt="Lumina">
      <div>
        <p class="bn2-eyebrow">${T('Vòng', 'Round')} ${S.round}/6 · ${esc(st.name || '')} · ${esc(T(st.zone || '', st.zoneEn || ''))}</p>
        <h2 class="tone-${esc(ev.tone)}" style="font-size:26px;margin:6px 0">${esc(ev.icon || '')} ${esc(ev.name)}</h2>
        ${ev.tag ? `<span class="bn2-chip">${esc(ev.tag)}</span>` : ''}
        <p style="margin:8px 0">${esc(ev.desc)}</p>
        ${window.BizOnJourneyLink ? BizOnJourneyLink.introExtrasHtml(S) : ''}
        <div class="bn2-row">${(ev.impacts || []).map(m => `<span class="bn2-chip ${/up-bad|down$/.test(m.dir) ? 'down' : /up|down-good/.test(m.dir) ? 'up' : 'flat'}">${esc(m.icon)} ${esc(m.label)}: <b>${esc(m.value)}</b></span>`).join('')}</div>
        ${ev.luminaMsg ? `<div class="bn2-say bz-explain"><b>Lumina:</b> ${esc(ev.luminaMsg)}</div>` : ''}
        ${ev.city && ev.city.name ? `<p class="bn2-small bn2-muted" style="margin:8px 0 0">${T('Thị trường động', 'Dynamic market')}: ${esc(ev.city.name)}</p>` : ''}
      </div></div></section>`;
  }

  function slider(key, label, unit, hint) {
    const [lo, hi, st] = RANGE[key], v = ui.d[key];
    const shown = key === 'price' ? num(v * 1000) + '₫' : key === 'production' ? num(v) + T(' sp', ' units') : key === 'workers' ? v + T(' người', ' people') : v + unit;
    return `<div class="bn2-field"><label for="bn2-${key}">${label} <b id="bn2-v-${key}">${shown}</b></label>
      <input id="bn2-${key}" type="range" min="${lo}" max="${hi}" step="${st}" value="${v}" data-dec="${key}" aria-describedby="bn2-h-${key}">
      <small id="bn2-h-${key}">${hint}</small></div>`;
  }

  function viewDecisions() {
    const locked = S.committed || S.finished || S.roundLocked;
    const fc = forecast(ui.d), need = cashNeeded(ui.d), over = ui.d.funding !== 'loan' && need > Math.max(0, S.balance);
    return `<section class="bn2-card" aria-labelledby="bn2-dec-h">
      <h2 id="bn2-dec-h" style="font-size:22px">${T('Quyết định vòng này', "This round's decisions")}</h2>
      ${slider('price', T('Giá bán / bộ', 'Price / set'), '', T('Giá tham chiếu thị trường 150.000₫. Khách nhạy giá: hạ giá tăng thị phần nhưng mỏng biên lợi nhuận.', 'Market reference 150,000₫. Buyers are price-sensitive: lower price gains share but thins the margin.'))}
      ${slider('marketing', T('Ngân sách marketing', 'Marketing budget'), T('tr₫', 'm₫'), T('Tăng sức hút và thương hiệu; hiệu quả giảm dần.', 'Lifts pull and brand, with diminishing returns.'))}
      ${slider('production', T('Sản lượng sản xuất', 'Production volume'), '', T(`Năng lực nhân sự hiện tại tối đa ${num(fc.laborCap)} sp. Vượt công suất máy thì phải mở rộng (khấu hao tăng).`, `Current labor capacity caps output at ${num(fc.laborCap)} units. Beyond machine capacity you must expand (more depreciation).`))}
      ${slider('rd', T('Đầu tư R&D', 'R&D investment'), T('tr₫', 'm₫'), T('Tích luỹ dần: giảm giá thành và tăng thương hiệu.', 'Builds up: lowers unit cost and lifts brand.'))}
      ${slider('workers', T('Nhân viên', 'Workers'), '', T('Mỗi người 1tr₫/vòng, làm được 70 sp.', '1m₫ each per round, 70 units each.'))}
      ${slider('training', T('Đào tạo / người', 'Training / worker'), T('tr₫', 'm₫'), T('Tăng hiệu suất thiết bị (OEE).', 'Raises equipment effectiveness (OEE).'))}
      <div class="bn2-field"><label>${T('Nguồn vốn', 'Funding')}</label>
        <div class="bn2-seg" role="group">${[['equity', T('Vốn tự có', 'Equity')], ['loan', T('Vay ngân hàng · lãi 8,5%', 'Bank loan · 8.5%')]].map(([v, l]) => `<button type="button" data-act="fund" data-v="${v}" class="${ui.d.funding === v ? 'on' : ''}" aria-pressed="${ui.d.funding === v}">${l}</button>`).join('')}</div></div>
      <div class="bn2-field"><label for="bn2-term">${T('Kỳ hạn thanh toán cho khách', 'Customer payment terms')}</label>
        <select id="bn2-term" data-dec="paymentTerm">${[30, 60, 90].map(v => `<option value="${v}" ${+ui.d.paymentTerm === v ? 'selected' : ''}>${v} ${T('ngày', 'days')}${v === 60 ? T(' (+4% cầu, +2% chi phí)', ' (+4% demand, +2% cost)') : v === 90 ? T(' (+8% cầu, +5% chi phí)', ' (+8% demand, +5% cost)') : ''}</option>`).join('')}</select></div>
      <div class="bn2-sunk bz-explain" style="margin-top:6px"><p class="bn2-small" style="margin:0 0 8px"><b>${T('Dự báo trước khi chốt', 'Forecast before you commit')}</b> <span class="bn2-muted">${T('(ước tính, kết quả thật còn tuỳ đối thủ)', '(estimate – the real result depends on rivals)')}</span></p>
        <div class="bn2-fc">
          <div><span>${T('Tiền vào', 'Inflow')}</span><b>${money(fc.inflow)}</b></div>
          <div><span>${T('Tiền ra', 'Outflow')}</span><b>${money(fc.outflow)}</b></div>
          <div><span>${T('Lãi/lỗ dự kiến', 'Expected profit')}</span><b class="${fc.net >= 0 ? 'pos' : 'neg'}">${sgn(fc.net)}</b></div>
          <div><span>${T('Điểm hoà vốn', 'Break-even')}</span><b>${num(fc.breakEven)} ${T('sp', 'units')}</b></div>
        </div>
        ${over ? `<p class="bn2-small neg" style="margin:8px 0 0">${T(`Kế hoạch cần ${money(need)}, vượt số dư ${money(S.balance)}. Giảm chi hoặc chọn «Vay ngân hàng».`, `The plan needs ${money(need)}, above your ${money(S.balance)} balance. Cut spending or choose «Bank loan».`)}</p>` : ''}
      </div>
      ${S.roundLocked ? `<p class="bn2-small neg">${T('Giảng viên đang khoá vòng này. Chờ mở khoá để chốt.', 'Your instructor has locked this round. Wait for it to reopen.')}</p>` : ''}
      <button class="bn2-btn pri block" style="margin-top:14px" data-act="commit" ${locked ? 'disabled' : ''}>${S.finished ? T('Đã xong 6 vòng', 'All 6 rounds done') : T('Chốt quyết định vòng ', 'Commit round ') + S.round + ' →'}</button>
    </section>`;
  }

  function viewLumina() {
    const left = Math.max(0, quota() - (S.aiUsed || 0)), wLeft = Math.max(0, WHAT_IF_LIMIT - (S.whatIfUsed || 0));
    const role = S.profile.role || 'CEO';
    const st = { SAFE: ['low', T('An toàn', 'Safe')], SAFE_AND_EFFICIENT: ['low', T('An toàn & hiệu quả', 'Safe & efficient')], VIABLE_BUT_RISKY: ['medium', T('Khả thi nhưng rủi ro', 'Viable but risky')], CAPITAL_EROSION: ['medium', T('Cảnh báo mòn vốn', 'Capital erosion')], HIGH_RISK: ['high', T('Rủi ro cao', 'High risk')], INSOLVENCY_RISK: ['high', T('Nguy cơ mất thanh khoản', 'Insolvency risk')] };
    const w = ui.whatIf, ws = w && (st[w.status] || ['medium', w.status]);
    return `<section class="bn2-card bz-blackbox-note" style="align-self:start" aria-label="${T('Nhánh hộp đen', 'Black-box condition')}"><p class="bn2-small bn2-muted" style="margin:0">${T('Lớp này chơi không có gợi ý của Lumina và mô phỏng Nếu – Thì. Hãy quyết định từ số liệu của đội.', 'This class plays without Lumina hints and what-if simulation. Decide from your team\'s numbers.')}</p></section><section class="bn2-card bz-explain" aria-labelledby="bn2-lum-h">
      <div class="bn2-row" style="justify-content:space-between"><h2 id="bn2-lum-h" style="font-size:22px">${T('Hỏi Lumina', 'Ask Lumina')}</h2><span class="bn2-chip">${T('Còn', 'Left')} ${left}/${quota()}</span></div>
      <p class="bn2-small bn2-muted" style="margin:4px 0 10px">${T('Lumina gợi ý theo luật dựa trên số liệu của đội; Lumina không chấm điểm và không quyết thay bạn.', "Lumina gives rule-based hints from your team's numbers; she never scores or decides for you.")}</p>
      <div class="bn2-row">${[['pricing', T('Về giá', 'Pricing')], ['marketing', 'Marketing'], ['risk', T('Rủi ro vòng này', 'Risks this round')]].map(([k, l]) => `<button class="bn2-btn" data-act="ask" data-v="${k}" ${left <= 0 || S.finished ? 'disabled' : ''}>${l}</button>`).join('')}</div>
      <div data-aa="advice">${ui.advice.slice(-3).map((a, i, arr) => `<div class="bn2-advice risk-${esc(a.risk)}" data-k="a${ui.advice.length - arr.length + i}">${a.text}</div>`).join('')}</div>
      <div class="bn2-row" style="justify-content:space-between;margin-top:16px"><h3 style="font-size:17px">${T('Nếu – Thì', 'What-if')} (${esc(role)})</h3><span class="bn2-chip">${T('Còn', 'Left')} ${wLeft}/${WHAT_IF_LIMIT}</span></div>
      <p class="bn2-small bn2-muted" style="margin:4px 0 8px">${T('Thử kế hoạch đang kéo trên các thanh trượt trước khi chốt.', 'Test the plan on your sliders before you commit.')}</p>
      <button class="bn2-btn teal" data-act="whatif" ${wLeft <= 0 || S.committed || S.finished ? 'disabled' : ''}>${T('Chạy mô phỏng Nếu – Thì', 'Run what-if')}</button>
      ${w ? `<div class="bn2-advice risk-${ws[0]}"><b>${esc(w.title || '')}</b> · ${esc(ws[1])}
        <div class="bn2-metrics">${(w.metrics || []).map(m => `<div><span>${esc(m.label)}</span><b class="${m.bad ? 'neg' : ''}">${esc(m.value)}</b></div>`).join('')}</div>${esc(w.msg || '')}</div>` : ''}
    </section>`;
  }

  function viewRivals() {
    const last = S.history[S.history.length - 1];
    const rows = [{ me: true, name: S.profile.teamName, share: last ? last.share : 25, img: CSUITE(S.profile.role || 'CEO'), color: 'var(--clay-teal)', note: T('Đội của bạn', 'Your team') }]
      .concat(S.competitors.map(c => ({ k: c.style, name: c.name, share: c.share || 25, img: (RIVALS[c.style] || {}).img, color: (RIVALS[c.style] || {}).color, note: T((RIVALS[c.style] || {}).vi, (RIVALS[c.style] || {}).en) })))
      .sort((a, b) => b.share - a.share);   // xếp theo thị phần: đổi hạng là thấy trượt (bn2-motion.js)
    return `<section class="bn2-card"><h2 style="font-size:22px">${T('Thị phần sàn đấu', 'Arena market share')}</h2>
      <p class="bn2-small bn2-muted" style="margin:4px 0 6px">${last ? T('Sau vòng ', 'After round ') + last.round : T('Khởi điểm: mỗi đội 25%', 'Starting point: 25% each')}</p>
      <div data-aa="rivals">${rows.map(r => `<div class="bn2-rival" data-k="${r.me ? 'me' : esc(r.k)}"><img src="${esc(r.img)}" alt="" onerror="this.style.visibility='hidden'">
        <div style="min-width:0"><b style="${r.me ? 'color:var(--clay-teal)' : ''}">${esc(r.name)}</b><div class="bn2-small bn2-muted">${esc(r.note)}</div>
          <div class="bn2-bar"><i style="width:${Math.min(100, r.share)}%;background:${r.color}"></i></div></div>
        <b>${pct(r.share)}</b></div>`).join('')}</div>
      <p class="bn2-small bn2-muted" style="margin:8px 0 0">${T('Cắm cờ tỉnh khi đội có thị phần cao nhất VÀ có lãi trong vòng.', 'Plant the flag when your team has the top share AND a profit that round.')}</p>
    </section>`;
  }

  function viewPlay() {
    return viewTop() + `<main id="bn2-main" class="bn2-wrap"><div class="bn2-grid main">
      <div class="bn2-grid">${viewEvent()}${viewDecisions()}</div>
      <div class="bn2-grid">${viewLumina()}${viewRivals()}${viewHistory()}</div>
    </div></main>`;
  }

  function viewHistory() {
    if (!S.history.length) return '';
    return `<section class="bn2-card"><h2 style="font-size:22px">${T('Các vòng đã chơi', 'Rounds played')}</h2>
      <div style="overflow-x:auto"><table class="bn2-table"><thead><tr><th>${T('Vòng', 'Round')}</th><th>${T('Doanh thu', 'Revenue')}</th><th>${T('Lãi/lỗ', 'Profit')}</th><th>${T('Thị phần', 'Share')}</th><th>${T('Cờ', 'Flag')}</th></tr></thead>
      <tbody data-aa="hist">${S.history.map((r, i) => `<tr data-k="r${r.round}"><td>${r.round} · ${esc((CONQUEST_STOPS[i] || {}).name || '')}</td><td>${money(r.revenue)}</td><td class="${r.netProfit >= 0 ? 'pos' : 'neg'}">${sgn(r.netProfit)}</td><td>${pct(r.share)}</td><td>${(S.conquest[i] || {}).win ? '🚩' : '–'}</td></tr>`).join('')}</tbody></table></div>
      <button class="bn2-btn ghost" style="margin-top:10px" data-act="report" data-v="${S.history.length - 1}">${T('Xem lại báo cáo vòng gần nhất', 'Review the latest round report')}</button>
    </section>`;
  }

  // ---------- báo cáo một vòng ----------
  function explain(r, i) {
    const prev = S.history[i - 1], d = r.decisions || {}, out = [];
    if (r.event && r.event.tone === 'bad' && !r.shielded) out.push(T(`biến cố «${r.event.name}» ép chi phí hoặc nhu cầu`, `the «${r.event.name}» event squeezed cost or demand`));
    if (d.price > REF_PRICE * 1.25) out.push(T(`giá ${d.price}k cao hơn hẳn mức tham chiếu ${REF_PRICE}k nên mất khách nhạy giá`, `price ${d.price}k is well above the ${REF_PRICE}k reference, losing price-sensitive buyers`));
    else if (d.price < REF_PRICE * 0.8) out.push(T(`giá ${d.price}k thấp hút khách nhưng mỏng biên lợi nhuận`, `the low ${d.price}k price draws buyers but thins the margin`));
    if (r.lostSales > 0) out.push(T(`hụt ${num(r.lostSales)} đơn vì không đủ hàng`, `${num(r.lostSales)} orders lost to a stock shortfall`));
    if (r.inventory > (d.production || 0) * 0.3) out.push(T(`còn tồn ${num(r.inventory)} sp, tốn phí lưu kho`, `${num(r.inventory)} units left in stock, costing storage`));
    if (r.overdraft > 0) out.push(T(`thấu chi ${money(r.overdraft)} phải trả lãi vay`, `an overdraft of ${money(r.overdraft)} incurred loan interest`));
    const dShare = prev ? r.share - prev.share : r.share - 25;
    const head = T(`Thị phần ${dShare >= 0 ? 'tăng' : 'giảm'} ${Math.abs(dShare).toFixed(1)} điểm, lãi/lỗ ${sgn(r.netProfit)}.`, `Share ${dShare >= 0 ? 'rose' : 'fell'} ${Math.abs(dShare).toFixed(1)} points; profit ${sgn(r.netProfit)}.`);
    return head + (out.length ? ' ' + T('Nguyên nhân chính: ', 'Main causes: ') + out.join('; ') + '.' : '');
  }

  function viewReport(i) {
    const r = S.history[i], c = (S.conquest || [])[i] || {}, st = CONQUEST_STOPS[i] || {};
    const costs = [[T('Giá vốn hàng sản xuất', 'Cost of goods'), r.cogs], ['Marketing', r.marketing], ['R&D', r.rd], [T('Lương', 'Wages'), r.wageCost], [T('Đào tạo', 'Training'), r.trainingCost], [T('Chi phí cố định', 'Fixed cost'), r.fixed], [T('Khấu hao', 'Depreciation'), r.depreciation], [T('Lưu kho', 'Storage'), r.holding], [T('Lãi vay', 'Interest'), (r.loanInterest || 0) + (r.creditInterest || 0)]].filter(x => x[1] > 0.5);
    const tableRows = [{ me: true, name: S.profile.teamName, price: r.decisions.price, mkt: r.decisions.marketing, share: r.share, profit: r.netProfit }]
      .concat((r.rivals || []).map(x => ({ name: x.name, price: x.price, mkt: x.mkt, share: x.share, profit: x.profit })));
    return `<div class="bn2-modal" role="dialog" aria-modal="true" aria-labelledby="bn2-rep-h"><div class="bn2-card">
      <p class="bn2-eyebrow">${T('Kết quả vòng', 'Round result')} ${r.round}/6 · ${esc(st.name || '')}</p>
      <h2 id="bn2-rep-h" style="font-size:28px;margin:6px 0 10px">${esc(r.event.icon || '')} ${esc(r.event.name)}</h2>
      <div class="bn2-flag ${c.win ? 'win' : 'lose'}">${c.win ? T(`🚩 Cắm cờ tại ${st.name}!`, `🚩 Flag planted at ${st.name}!`) : c.hasTopShare ? T('⚠️ Thị phần cao nhất nhưng vòng này lỗ – cần có lãi mới cắm được cờ.', '⚠️ Top share, but a loss this round – you need a profit to plant the flag.') : T(`🏴 ${esc(c.winner || '')} giữ vị trí số 1 ở ${st.name}.`, `🏴 ${esc(c.winner || '')} holds #1 in ${st.name}.`)}</div>
      <div class="bn2-kpis">
        <div class="bn2-kpi"><span>${T('Doanh thu', 'Revenue')}</span><b>${money(r.revenue)}</b></div>
        <div class="bn2-kpi"><span>${T('Lãi/lỗ ròng', 'Net profit')}</span><b class="${r.netProfit >= 0 ? 'pos' : 'neg'}">${sgn(r.netProfit)}</b></div>
        <div class="bn2-kpi"><span>${T('Thị phần', 'Market share')}</span><b>${pct(r.share)}</b></div>
        <div class="bn2-kpi"><span>${T('Số dư', 'Balance')}</span><b>${money(r.balance)}</b></div>
        <div class="bn2-kpi"><span>${T('Bán / cầu', 'Sold / demand')}</span><b>${num(r.sold)} / ${num(r.demandUnits)}</b></div>
        <div class="bn2-kpi"><span>${T('Tồn kho', 'Inventory')}</span><b>${num(r.inventory)}</b></div>
        <div class="bn2-kpi"><span>OEE</span><b>${r.oee}%</b></div>
        <div class="bn2-kpi"><span>ROI</span><b>${r.roi}%</b></div>
      </div>
      <h3 style="font-size:17px;margin:16px 0 6px">${T('Vì sao ra kết quả này?', 'Why this result?')}</h3>
      <div class="bn2-why">${esc(explain(r, i))}</div>
      <h3 style="font-size:17px;margin:16px 0 6px">${T('Sàn đấu vòng này', "This round's arena")}</h3>
      <div style="overflow-x:auto"><table class="bn2-table"><thead><tr><th>${T('Đội', 'Team')}</th><th>${T('Giá', 'Price')}</th><th>Marketing</th><th>${T('Thị phần', 'Share')}</th><th>${T('Lãi/lỗ', 'Profit')}</th></tr></thead>
        <tbody>${tableRows.sort((a, b) => b.share - a.share).map(x => `<tr class="${x.me ? 'me' : ''}"><td>${esc(x.name)}</td><td>${Math.round(x.price)}k</td><td>${money(x.mkt)}</td><td>${pct(x.share)}</td><td>${sgn(x.profit)}</td></tr>`).join('')}</tbody></table></div>
      <p class="bn2-small bn2-muted" style="margin:6px 0 0">${T('Đối thủ ảo không chịu lương, khấu hao, R&D nên lãi/lỗ của họ không so trực tiếp với đội.', "Virtual rivals don't carry wages, depreciation or R&D, so their profit isn't directly comparable.")}</p>
      <h3 style="font-size:17px;margin:16px 0 6px">${T('Cơ cấu chi phí', 'Cost breakdown')}</h3>
      <div class="bn2-metrics">${costs.map(([l, v]) => `<div><span>${l}</span><b>${money(v)}</b></div>`).join('')}</div>
      <button class="bn2-btn pri block" style="margin-top:16px" data-act="close">${S.finished && i === S.history.length - 1 ? T('Xem tổng kết 6 vòng →', 'See the 6-round summary →') : T('Sang vòng tiếp →', 'On to the next round →')}</button>
    </div></div>`;
  }

  function viewEnd() {
    const wins = (S.conquest || []).filter(c => c.win).length, profit = S.history.reduce((a, r) => a + r.netProfit, 0);
    const ach = ACHIEVEMENTS_LIST().filter(a => S.achievements.includes(a.id));
    return viewTop() + `<main id="bn2-main" class="bn2-wrap"><section class="bn2-card" style="text-align:center">
      <img src="assets/character/lumina-ao-dai-clap.webp" alt="" style="height:180px">
      <p class="bn2-eyebrow">${T('Tổng kết 6 vòng', '6-round summary')}</p>
      <h1 style="font-size:34px;margin:6px 0">${esc(S.profile.teamName)}</h1>
      <div class="bn2-kpis" style="margin-top:14px">
        <div class="bn2-kpi"><span>${T('Cờ đã cắm', 'Flags planted')}</span><b>🚩 ${wins}/6</b></div>
        <div class="bn2-kpi"><span>${T('Lãi/lỗ cộng dồn', 'Cumulative profit')}</span><b class="${profit >= 0 ? 'pos' : 'neg'}">${sgn(profit)}</b></div>
        <div class="bn2-kpi"><span>${T('Số dư cuối', 'Final balance')}</span><b>${money(S.balance)}</b></div>
        <div class="bn2-kpi"><span>${T('Thị phần đỉnh', 'Peak share')}</span><b>${pct(S.peakShare || 0)}</b></div>
      </div>
      ${ach.length ? `<div class="bn2-row" style="justify-content:center;margin-top:14px">${ach.map(a => `<span class="bn2-chip" title="${esc(a.desc)}">${a.icon} ${esc(a.name)}</span>`).join('')}</div>` : ''}
      <p class="bn2-muted" style="margin-top:14px">${isTrial() ? T('Ván chơi thử: kết quả chỉ lưu trên máy này.', 'Trial game: results stay on this device.') : T('Kết quả đã gửi về lớp. Chứng nhận và phiếu chấm xem ở bản đầy đủ.', 'Results were sent to your class. See the certificate and score sheet in the full version.')}</p>
      <div class="bn2-row" style="justify-content:center;margin-top:10px"><a class="bn2-btn teal" href="game.html">${T('Mở bản đầy đủ (chứng nhận)', 'Open the full version (certificate)')}</a><button class="bn2-btn" data-act="new">${T('Chơi ván mới', 'New game')}</button></div>
    </section>${window.BizOnJourneyLink && ui.journey ? BizOnJourneyLink.endHtml(ui.journey) : ''}${window.BN2Grade ? BN2Grade.html(S) : ''}${viewHistory()}</main>`;
  }

  // ---------- vẽ và sự kiện ----------
  function render() {
    const el = app(); if (!el) return;
    document.documentElement.lang = currentLang();
    if (ui.screen === 'start' || !S) { el.innerHTML = viewStart(); return; }
    if (!ui.d) ui.d = lastDecisions();
    const keep = window.BN2Motion ? BN2Motion.before(el) : null;
    if (S.finished && window.BizOnJourneyLink && ui.journey && ui.journey.active) BizOnJourneyLink.finish(ui.journey, S, { appVersion: 'bizon-bn-v2' });   // hành trình 3 bậc: ghi Bậc 2 một lần
    el.innerHTML = (S.finished && ui.screen !== 'report') ? viewEnd() : viewPlay();
    if (keep) BN2Motion.after(el, keep, ui.screen === 'report' ? ['rivals', 'hist'] : []);   // giữ khung danh sách cũ để có chuyển động khi thêm, bớt, đổi hạng; báo cáo vòng đang mở thì đợi đóng mới đổi
    if (S.finished && window.BN2Grade) BN2Grade.load(S);   // đọc bảng xếp hạng lớp cho B1, vẽ lại riêng khung bảng điểm
    if (ui.screen === 'report' && ui.reportIdx != null) el.insertAdjacentHTML('beforeend', viewReport(ui.reportIdx));
  }

  function updateLive() {
    // cập nhật nhãn và dự báo mà không vẽ lại thanh trượt (giữ thao tác kéo mượt)
    const sec = document.querySelector('[aria-labelledby="bn2-dec-h"]'); if (!sec) return;
    const tmp = document.createElement('div'); tmp.innerHTML = viewDecisions();
    ['price', 'marketing', 'production', 'rd', 'workers', 'training'].forEach(k => { const a = document.getElementById('bn2-v-' + k), b = tmp.querySelector('#bn2-v-' + k); if (a && b) a.textContent = b.textContent; });
    const a = sec.querySelector('.bn2-sunk'), b = tmp.querySelector('.bn2-sunk'); if (a && b) a.innerHTML = b.innerHTML;
    const hp = document.getElementById('bn2-h-production'), hq = tmp.querySelector('#bn2-h-production'); if (hp && hq) hp.textContent = hq.textContent;
  }

  function commit() {
    if (S.finished || S.committed) return;
    if (S.roundLocked) { alert(T('Giảng viên đã khoá vòng chơi này. Chờ mở khoá để tiếp tục.', 'Your instructor has locked this round. Wait for it to reopen.')); return; }
    const d = Object.assign({}, ui.d);
    if (d.funding !== 'loan' && cashNeeded(d) > Math.max(0, S.balance)) {
      alert(T('Kế hoạch chi vượt quá vốn tự có của đội. Hãy giảm ngân sách hoặc chọn nguồn vốn «Vay ngân hàng» (lãi 8,5%/vòng).', "The planned spend exceeds your team's equity. Reduce the budget or choose «Bank loan» funding (8.5%/round interest)."));
      return;
    }
    S.committed = true;
    const busy = document.createElement('div'); busy.className = 'bn2-busy'; busy.innerHTML = `<i></i>${T('Thị trường đang phản ứng…', 'The market is responding…')}`; document.body.appendChild(busy);
    setTimeout(() => {
      const report = simulateRound(S, d);
      recordConquest(report);
      save();
      if (window.BizonBackend) BizonBackend.submitRound(S, report);
      busy.remove();
      ui.advice = []; ui.whatIf = null; ui.d = lastDecisions();
      ui.screen = 'report'; ui.reportIdx = S.history.length - 1;
      render();
      const h = document.getElementById('bn2-rep-h'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    }, 900);
  }

  function onClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act, v = b.dataset.v;
    if (act === 'lang') { try { localStorage.setItem('bizon-lang', currentLang() === 'en' ? 'vi' : 'en'); localStorage.removeItem('bizon-lang-auto'); } catch (x) {} render(); return; }
    if (act === 'role') { ui.role = v; document.querySelectorAll('.bn2-roles button').forEach(x => { x.classList.toggle('on', x.dataset.v === v); x.setAttribute('aria-pressed', x.dataset.v === v); }); return; }
    if (act === 'resume') { S = load(); ui.d = lastDecisions(); ui.screen = 'play'; render(); return; }
    if (act === 'demo') { startGame(T('Đội Demo Rồng Xanh', 'Green Dragon Demo Team'), 'DEMO-2026', 'CEO'); return; }
    if (act === 'fund') { ui.d.funding = v; document.querySelectorAll('[data-act="fund"]').forEach(x => { x.classList.toggle('on', x.dataset.v === v); x.setAttribute('aria-pressed', x.dataset.v === v); }); updateLive(); return; }
    if (act === 'commit') { commit(); return; }
    if (act === 'ask') {
      if (S.aiUsed >= quota()) return;
      S.aiUsed++; S.aiAskedTotal = (S.aiAskedTotal || 0) + 1; save();
      ui.advice.push(luminaAdvice(S, v)); render(); return;
    }
    if (act === 'whatif') {
      if (S.whatIfUsed >= WHAT_IF_LIMIT || S.committed || S.finished) return;
      const d = Object.assign({}, ui.d), role = S.profile.role || 'CEO';
      if (role === 'CFO') { d.loanAmount = S.loan > 0 ? 0 : 300; d.costCutPct = 15; }
      S.whatIfUsed++; S.whatIfTotal = (S.whatIfTotal || 0) + 1; save();
      const LW = window.LuminaWhatIf;
      ui.whatIf = (LW && typeof LW.analyze === 'function') ? LW.analyze(S, role, d) : whatIfSimulate(S, role === 'CFO' ? 'CFO' : 'CEO', d);
      render(); return;
    }
    if (act === 'report') { ui.screen = 'report'; ui.reportIdx = +v; render(); return; }
    if (act === 'close') { ui.screen = 'play'; ui.reportIdx = null; render(); window.scrollTo(0, 0); return; }
    if (act === 'menu') {
      const m = prompt(T('Gõ 1 để về màn đầu, 2 để mở bản đầy đủ game.html, 3 để xoá ván này và chơi lại.', 'Type 1 for the start screen, 2 to open the full game.html, 3 to delete this game and restart.'));
      if (m === '1') { ui.screen = 'start'; render(); }
      if (m === '2') location.href = 'game.html';
      if (m === '3' && confirm(T('Xoá tiến trình ván này trên máy?', 'Delete this game\'s progress on this device?'))) { try { localStorage.removeItem(STORAGE_KEY); } catch (x) {} S = null; ui.screen = 'start'; render(); }
      return;
    }
    if (act === 'new') { if (confirm(T('Bắt đầu ván mới? Ván này vẫn lưu ở lớp nếu đã có Mã lớp.', 'Start a new game? This one stays saved in your class if it had a Class ID.'))) { try { localStorage.removeItem(STORAGE_KEY); } catch (x) {} S = null; ui.screen = 'start'; render(); } }
  }

  function onInput(e) {
    const k = e.target.dataset && e.target.dataset.dec; if (!k || !ui.d) return;
    ui.d[k] = +e.target.value; updateLive();
  }

  function onSubmit(e) {
    if (e.target.id !== 'bn2-login') return;
    e.preventDefault();
    const f = new FormData(e.target);
    startGame(String(f.get('team') || '').trim() || T('Đội Claymorphism', 'Team Claymorphism'), String(f.get('classId') || '').trim(), ui.role);
  }

  function start() {
    ui.journey = window.BizOnJourneyLink ? BizOnJourneyLink.attach('t2') : null;   // hành trình 3 bậc (?journey=)
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onInput);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui.screen === 'report') { ui.screen = 'play'; render(); } });
    render();
  }
  return { start, render };
})();
window.BN2 = BN2;
