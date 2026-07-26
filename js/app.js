/* BizOn Bật Nghiệp 2026 — UI controller (SPA, localStorage persistence)
 * © 2026 Đỗ Thùy Hương (Je m'appelle Hương) & Phan Anh Tú. Bảo lưu mọi quyền. */

const STORAGE_KEY = 'bizon2026';
let S = null;

// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const money = m => (m >= 1000 || m <= -1000)
  ? (m / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ₫'
  : Math.round(m).toLocaleString('vi-VN') + 'tr₫';

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s) { // migration cho save cũ thiếu trường mới
      s.missionsClaimed ??= []; s.aiAskedTotal ??= 0; s.itemsBought ??= 0;
      s.minigameBest ??= 0; s.minigamePlays ??= 0; s.roundLocked ??= false; s.grantLog ??= [];
      s.oee ??= 85; s.defect ??= 2.0; s.brandLoyalty ??= 65; s.adEff ??= 0;
      s.quickRatio ??= 1.0; s.roi ??= 0; s.energyLines ??= [2100, 4850, 1470];
      s.lineUpgraded ??= [false, false, false]; s.maintBonus ??= 0; s.maintenanceLog ??= [];
      s.loan ??= 0; s.costCutter ??= false; s.peakShare ??= 0; s.eventShownRound ??= 0;
    }
    return s;
  } catch { return null; }
}

function createConfetti() {
  const colors = ['#006687', '#00c4ff', '#f4a020', '#e85d75', '#7bd389'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
    p.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

// ---------- Boot: Splash → Login/App ----------
const ROLES = [
  { id: 'CEO', icon: '🧭' }, { id: 'CFO', icon: '💰' }, { id: 'CMO', icon: '📣' },
  { id: 'COO', icon: '🏭' }, { id: 'SEC', icon: '📝' },
];
let pickedRole = 'CEO';

window.addEventListener('DOMContentLoaded', () => {
  $('role-picker').innerHTML = ROLES.map(r => `
    <button type="button" data-role="${r.id}" onclick="pickRole('${r.id}')"
      class="role-chip clay-card !rounded-2xl py-2 text-center ${r.id === 'CEO' ? 'ring-2 ring-primary-container' : ''}">
      <div class="text-lg">${r.icon}</div><div class="text-[10px] font-bold text-deep-teal">${r.id}</div>
    </button>`).join('');

  setTimeout(() => {
    $('screen-splash').classList.remove('active');
    const saved = load();
    if (saved && saved.profile) { S = saved; enterApp(); }
    else $('screen-login').classList.add('active');
  }, 1600);
});

function pickRole(id) {
  pickedRole = id;
  document.querySelectorAll('.role-chip').forEach(b =>
    b.classList.toggle('ring-2', b.dataset.role === id));
}

function doLogin() {
  const email = $('login-email').value.trim() || 'sinhvien@bizon.vn';
  const team = $('login-team').value.trim() || 'Đội Claymorphism';
  S = newGameState({ email, teamName: team, role: pickedRole });
  save();
  $('screen-login').classList.remove('active');
  enterApp();
  createConfetti();
}

function enterApp() {
  $('app-shell').classList.remove('hidden');
  showTab('home');
  maybeShowEventIntro();
}

// ---------- Biến cố toàn màn hình (theo thiết kế Stitch) ----------
function maybeShowEventIntro() {
  if (!S || S.finished || S.committed) return;
  if (S.eventShownRound >= S.round) return;
  const ev = currentEvent(S);
  S.eventShownRound = S.round;
  save();
  const bad = ev.tone === 'bad', warn = ev.tone === 'warn';
  const tagCls = bad ? 'bg-red-100 text-red-600' : warn ? 'bg-amber-100 text-amber-700' : 'bg-primary-container/25 text-primary';
  const titleCls = bad ? 'text-red-600' : 'text-deep-teal';
  const dirIcon = d => ({ up: '📈', 'up-bad': '📈', down: '📉', 'down-good': '📉', flat: '➖' }[d] || '➖');
  const dirCls = d => (d === 'up' || d === 'down-good') ? 'text-primary' : (d === 'flat' ? 'text-deep-teal' : 'text-red-600');
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-50 bg-surface-bright overflow-y-auto';
  div.innerHTML = `
    <div class="max-w-md mx-auto px-6 py-8 ${ev.shake ? 'animate-shake' : ''}">
      <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-full ${tagCls}">● ${ev.tag || 'BIẾN CỐ THỊ TRƯỜNG'}</span>
      <h1 class="font-display text-3xl font-extrabold ${titleCls} uppercase mt-3 leading-tight">${ev.name}</h1>
      <p class="text-sm text-deep-teal/70 mt-2">${ev.desc}</p>
      <div class="grid grid-cols-2 gap-3 mt-5">
        ${(ev.impacts || []).map(im => `
          <div class="clay-card p-4 text-center">
            <p class="text-2xl">${im.icon}</p>
            <p class="text-[10px] uppercase font-bold text-deep-teal/50 mt-1">${im.label}</p>
            <p class="font-display font-extrabold text-xl ${dirCls(im.dir)}">${dirIcon(im.dir)} ${im.value}</p>
          </div>`).join('')}
      </div>
      <div class="clay-card p-4 mt-4 flex gap-3 items-start">
        <img src="assets/character/${ev.luminaImg || 'lumina-vest'}.png" alt="Lumina" class="w-14 h-20 rounded-2xl object-cover shrink-0 shadow-clay" style="object-position:50% 10%">
        <div>
          <p class="font-display font-bold text-deep-teal text-sm">Je m'appelle Hương <span class="ml-1 text-[9px] bg-primary-container/30 text-primary font-extrabold px-2 py-0.5 rounded-full">AI ADVISOR</span></p>
          <p class="text-sm text-deep-teal/80 italic mt-1">"${ev.luminaMsg}"</p>
        </div>
      </div>
      <button id="ev-cta" class="clay-btn w-full ${bad ? 'bg-deep-teal' : 'bg-primary'} text-white font-display font-bold py-4 mt-5">${ev.cta ? ev.cta.label : '🎯 Nhập quyết định'}</button>
      <button id="ev-close" class="clay-btn w-full bg-white text-deep-teal font-display font-bold py-4 mt-3">Về Trung tâm điều hành</button>
    </div>`;
  div.querySelector('#ev-cta').onclick = () => {
    div.remove();
    if (ev.cta && ev.cta.report) currentReport = ev.cta.report;
    showTab(ev.cta ? ev.cta.tab : 'decisions');
  };
  div.querySelector('#ev-close').onclick = () => { div.remove(); showTab('home'); };
  document.body.appendChild(div);
}

// ---------- Màn hình Chúc mừng chiến thắng (TOP 1 MARKET) ----------
function showVictory(r) {
  const growth = (() => {
    const prev = S.history[S.history.length - 2];
    return prev ? (r.share - prev.share).toFixed(1) : r.share.toFixed(1);
  })();
  const satisfaction = Math.min(5, (S.brandLoyalty / 19)).toFixed(1);
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-50 bg-surface-bright overflow-y-auto';
  div.innerHTML = `
    <div class="max-w-md mx-auto px-6 py-8 text-center">
      <div class="clay-card overflow-hidden mb-4">
        <img src="assets/character/lumina-ao-dai-clap.png" alt="Lumina chúc mừng" class="w-full h-64 object-cover" style="object-position:50% 15%">
      </div>
      <div class="clay-card p-4 mb-4 text-left">
        <p class="text-sm text-deep-teal italic">"Thật tuyệt vời thưa ${S.profile.role}! Chiến dịch vừa qua đã tạo nên một cú hích lịch sử. Chúng ta chính thức dẫn đầu thị trường với những con số ấn tượng!"</p>
      </div>
      <span class="inline-block bg-primary-container/25 text-primary text-[11px] font-extrabold px-3 py-1.5 rounded-full">🎊 CHÚC MỪNG CHIẾN THẮNG</span>
      <h2 class="font-display font-extrabold text-deep-teal text-xl mt-1 mb-3">Thị Phần Đạt Đỉnh Mới!</h2>
      <div class="clay-card p-5 mb-3 relative">
        <span class="absolute -top-2 right-4 bg-primary-container text-deep-teal text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-clay">TOP 1 MARKET</span>
        <p class="text-[10px] uppercase font-bold text-deep-teal/50 tracking-widest">Market Share</p>
        <p class="font-display font-extrabold text-deep-teal text-5xl">${r.share.toFixed(1)}<span class="text-2xl">%</span></p>
        <div class="h-3 rounded-full bg-surface-bright overflow-hidden mt-3"><div class="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style="width:${Math.min(100, r.share * 2)}%"></div></div>
        <p class="text-xs text-deep-teal/60 mt-2">Tăng trưởng ${growth}% so với vòng trước.</p>
      </div>
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="clay-card p-4"><p class="text-2xl">📈</p><p class="font-display font-extrabold text-deep-teal">+${r.adEff}%</p><p class="text-[10px] text-deep-teal/50 font-semibold">Hiệu quả quảng cáo</p></div>
        <div class="clay-card p-4"><p class="text-2xl">😊</p><p class="font-display font-extrabold text-deep-teal">${satisfaction}/5</p><p class="text-[10px] text-deep-teal/50 font-semibold">Độ hài lòng thương hiệu</p></div>
      </div>
      <button id="vic-report" class="clay-btn w-full bg-deep-teal text-white font-display font-bold py-4 mb-3">📊 XEM BÁO CÁO CHI TIẾT</button>
      <button id="vic-next" class="clay-btn w-full bg-white text-deep-teal font-display font-bold py-4">LẬP KẾ HOẠCH TIẾP THEO</button>
    </div>`;
  div.querySelector('#vic-report').onclick = () => { div.remove(); showTab('reports'); };
  div.querySelector('#vic-next').onclick = () => { div.remove(); showTab('home'); maybeShowEventIntro(); };
  document.body.appendChild(div);
  createConfetti();
}

// ---------- Navigation ----------
function showTab(tab) {
  document.querySelectorAll('main .screen').forEach(s => s.classList.remove('active'));
  $('tab-' + tab).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));
  window.scrollTo({ top: 0 });
  renderAll();
  if (tab === 'reports') showReport(currentReport);
}

// ---------- Renderers ----------
function renderAll() {
  if (!S) return;
  renderHeader(); renderDashboard(); renderDecisions(); renderAdvisorIntro();
  renderShop(); renderSkills(); renderLeaderboard(); renderAchievements(); renderProfile();
  renderMissions(); renderMinigame(); renderInstructor();
}

function renderHeader() {
  $('hdr-team').textContent = S.profile.teamName;
  $('hdr-level').textContent = 'Lv.' + (1 + Math.floor((S.xp - S.spentXp < 0 ? 0 : S.xp) / XP_PER_LEVEL));
  $('hdr-xp').textContent = S.xp.toLocaleString('vi-VN') + ' XP';
  $('hdr-balance').textContent = money(S.balance);
}

function renderDashboard() {
  const ev = currentEvent(S);
  $('dash-round').textContent = Math.min(S.round, ROUNDS_TOTAL);
  $('dash-status').textContent = S.finished ? '🏁 Đã hoàn thành mô phỏng!'
    : S.committed ? 'Đã khóa — chờ kết quả' : 'Đang chờ quyết định';
  $('round-dots').innerHTML = Array.from({ length: ROUNDS_TOTAL }, (_, i) => {
    const done = i < S.history.length;
    const cur = i + 1 === S.round && !S.finished;
    return `<span class="w-2.5 h-2.5 rounded-full ${done ? 'bg-primary-container' : cur ? 'bg-white' : 'bg-white/30'}"></span>`;
  }).join('');

  const banner = $('event-banner');
  if (ev && !S.finished) {
    banner.classList.remove('hidden');
    banner.className = 'clay-card p-4 mb-4 border-2 ' +
      (ev.tone === 'bad' ? 'border-orange-300 animate-shake' : ev.tone === 'warn' ? 'border-amber-200' : 'border-primary-container/40');
    banner.innerHTML = `<div class="flex gap-3 items-start"><span class="text-2xl">${ev.icon}</span>
      <div><p class="font-display font-bold text-deep-teal text-sm">Biến cố vòng ${S.round}: ${ev.name}</p>
      <p class="text-xs text-deep-teal/70 mt-0.5">${ev.desc}</p></div></div>`;
  } else banner.classList.add('hidden');

  const last = S.history[S.history.length - 1];
  $('m-cash').textContent = money(S.balance);
  $('m-share').textContent = last ? last.share.toFixed(1) + '%' : '25%';
  $('m-brand').textContent = S.brand >= 1.4 ? 'A+' : S.brand >= 1.2 ? 'A' : S.brand >= 1.05 ? 'B+' : 'B';
  $('dash-lumina').textContent = S.finished
    ? 'Chúc mừng! Xem chứng chỉ của bạn ở mục Thành tựu nhé. 🎓'
    : luminaAdvice(S, 'risk').text.slice(0, 90) + '…';
}

function syncDecisionLabels() {
  $('v-price').textContent = (+$('in-price').value).toLocaleString('vi-VN') + '.000₫';
  $('v-mkt').textContent = $('in-mkt').value + 'tr₫';
  $('v-prod').textContent = (+$('in-prod').value).toLocaleString('vi-VN') + ' sp';
  $('v-rd').textContent = $('in-rd').value + 'tr₫';
}

function renderDecisions() {
  document.querySelectorAll('.dec-round').forEach(e => e.textContent = Math.min(S.round, ROUNDS_TOTAL));
  syncDecisionLabels();
  const btn = $('btn-commit');
  if (S.finished) {
    btn.disabled = true;
    btn.textContent = '🏁 Mô phỏng đã kết thúc';
    btn.classList.add('opacity-50');
  } else if (S.committed) {
    btn.disabled = true;
    btn.textContent = '🔒 Đã commit (ERR_ALREADY_COMMITTED)';
    btn.classList.add('opacity-50');
  } else {
    btn.disabled = false;
    btn.textContent = '🔒 Commit — Khóa quyết định';
    btn.classList.remove('opacity-50');
  }
}

function commitDecisions() {
  if (S.finished || S.committed) return;
  if (S.roundLocked) {
    alert('ERR_ROUND_LOCKED — Giảng viên đã khóa vòng chơi này. Chờ mở khóa để tiếp tục.');
    return;
  }
  const d = {
    price: +$('in-price').value,
    marketing: +$('in-mkt').value,
    production: +$('in-prod').value,
    rd: +$('in-rd').value,
  };
  const cashNeeded = d.marketing + d.rd + d.production * UNIT_COST / 1000;
  if (cashNeeded > S.balance + 300) {
    alert('ERR_INSUFFICIENT_FUNDS — Kế hoạch chi vượt quá khả năng vốn của đội. Hãy giảm sản lượng hoặc ngân sách.');
    return;
  }
  S.committed = true;
  renderDecisions();
  $('commit-box').classList.add('hidden');
  $('processing-box').classList.remove('hidden');

  setTimeout(() => {
    const report = simulateRound(S, d);
    save();
    $('processing-box').classList.add('hidden');
    $('commit-box').classList.remove('hidden');
    if (report.netProfit > 0) createConfetti();
    showRoundResult(report);
  }, 1800);
}

function showRoundResult(r) {
  const ok = r.netProfit > 0;
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-50 bg-deep-teal/50 backdrop-blur-sm flex items-center justify-center p-6';
  div.innerHTML = `
    <div class="clay-card max-w-sm w-full p-6 text-center ${r.event.tone === 'bad' && !r.shielded ? 'animate-shake' : ''}">
      <p class="text-4xl mb-2">${ok ? '🎉' : '😰'}</p>
      <h3 class="font-display font-extrabold text-deep-teal text-lg">Kết quả vòng ${r.round}</h3>
      <p class="text-xs text-deep-teal/60 mb-4">${r.event.icon} ${r.event.name}${r.shielded ? ' (đã chặn bởi 🛡️)' : ''}</p>
      <div class="grid grid-cols-2 gap-2 text-left text-sm">
        <div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Doanh thu</p><p class="font-display font-bold text-deep-teal">${money(r.revenue)}</p></div>
        <div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Lợi nhuận ròng</p><p class="font-display font-bold ${ok ? 'text-emerald-600' : 'text-orange-600'}">${money(r.netProfit)}</p></div>
        <div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Đã bán</p><p class="font-display font-bold text-deep-teal">${r.sold.toLocaleString('vi-VN')} sp</p></div>
        <div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Thị phần</p><p class="font-display font-bold text-deep-teal">${r.share.toFixed(1)}%</p></div>
      </div>
      <p class="mt-3 text-xs font-bold text-primary">+${r.xpGain} XP</p>
      <button class="clay-btn w-full bg-primary text-white font-display font-bold py-3 mt-4">Tiếp tục</button>
    </div>`;
  div.querySelector('button').onclick = () => {
    div.remove(); renderAll();
    if (S.finished) { showTab('achievements'); createConfetti(); }
    else if (r.isNewPeak) showVictory(r);
    else maybeShowEventIntro();
  };
  document.body.appendChild(div);
}

// ---------- Lumina Advisor ----------
function renderAdvisorIntro() {
  const quota = AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0) - S.aiUsed;
  $('ai-quota').textContent = Math.max(0, quota);
  if (!$('advisor-chat').childElementCount) {
    pushLumina({ risk: 'low', text: `Xin chào, Je m'appelle Hương! 👋 Tôi là Lumina — cố vấn AI của đội ${S.profile.teamName}. Hãy chọn một câu hỏi bên dưới, tôi sẽ phân tích kịch bản "Nếu — Thì" cho bạn.` });
  }
  // Badge biến động thị trường + ảnh cảm xúc theo biến cố hiện tại
  const ev = currentEvent(S);
  const vol = S.finished ? 'low' : ev.tone === 'bad' ? 'high' : ev.tone === 'warn' ? 'medium' : 'low';
  $('vol-dot').className = 'w-3 h-3 rounded-full ' + { low: 'bg-emerald-500', medium: 'bg-amber-500', high: 'bg-red-600' }[vol];
  $('vol-text').textContent = 'MARKET VOLATILITY: ' + vol.toUpperCase();
  $('advisor-hero').src = 'assets/character/' + (S.finished ? 'lumina-ao-dai-clap' : (ev.luminaImg || 'lumina-vest')) + '.png';
  renderRoleDeepdive();
}

// ---------- Phân tích chuyên sâu theo vai trò (CFO / COO / CMO) ----------
function renderRoleDeepdive() {
  const qrBad = S.quickRatio < 1, roiBad = S.roi < 18;
  const oeeBad = S.oee < 85, defBad = S.defect > 4.3;
  const shareNow = S.history.length ? S.history[S.history.length - 1].share : 25;
  const bar = (pct, bad) => `<div class="h-2 rounded-full bg-surface-bright overflow-hidden mt-1"><div class="h-full ${bad ? 'bg-red-500' : 'bg-primary'} rounded-full" style="width:${Math.min(100, Math.max(4, pct))}%"></div></div>`;
  $('role-deepdive').innerHTML = `
    <div class="clay-card p-4 ${qrBad ? 'border-l-4 border-red-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">💰 Cố vấn rủi ro & ROI <span class="text-[10px] text-deep-teal/50">· dành cho CFO</span></p>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Khả năng thanh toán nhanh</p>
          <p class="font-display font-extrabold ${qrBad ? 'text-red-600' : 'text-deep-teal'} text-xl">${S.quickRatio.toFixed(2)} ${qrBad ? '⚠️' : ''}</p>${bar(S.quickRatio * 50, qrBad)}</div>
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">ROI thực tế</p>
          <p class="font-display font-extrabold ${roiBad ? 'text-deep-teal' : 'text-emerald-600'} text-xl">${S.roi}%</p>
          <p class="text-[10px] text-deep-teal/50">Mục tiêu: <b>18%</b></p>${bar(S.roi * 100 / 18, roiBad)}</div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button onclick="doApproveLoan()" class="clay-btn ${S.loan > 0 ? 'bg-surface-bright text-deep-teal/40' : 'bg-primary text-white'} text-xs font-bold py-2.5" ${S.loan > 0 ? 'disabled' : ''}>🏦 ${S.loan > 0 ? 'Đang vay 300tr₫' : 'Phê duyệt khoản vay'}</button>
        <button onclick="doCutCosts()" class="clay-btn ${S.costCutter ? 'bg-surface-bright text-deep-teal/40' : 'bg-white text-deep-teal'} text-xs font-bold py-2.5" ${S.costCutter ? 'disabled' : ''}>✂️ Cắt giảm chi phí</button>
      </div>
    </div>
    <div class="clay-card p-4 ${oeeBad ? 'border-l-4 border-amber-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">🏭 Cảnh báo Hiệu suất Vận hành <span class="text-[10px] text-deep-teal/50">· dành cho COO</span></p>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Hiệu suất thiết bị (OEE)</p>
          <p class="font-display font-extrabold ${oeeBad ? 'text-deep-teal' : 'text-emerald-600'} text-xl">${S.oee}% ${oeeBad ? '↘️' : ''}</p>
          <p class="text-[10px] text-deep-teal/50">${oeeBad ? 'Dưới mục tiêu 85% vận hành ổn định' : 'Đạt mục tiêu vận hành ổn định'}</p>${bar(S.oee, oeeBad)}</div>
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Tỷ lệ phế phẩm</p>
          <p class="font-display font-extrabold ${defBad ? 'text-red-600' : 'text-deep-teal'} text-xl">${S.defect}% ${defBad ? '<span class="text-[9px] risk-high px-1.5 py-0.5 rounded-full align-middle">CẢNH BÁO ĐỎ</span>' : ''}</p>
          ${defBad ? `<p class="text-[10px] text-red-600 font-bold">Vượt ngưỡng cho phép (+${(S.defect - 4.3).toFixed(1)}%)</p>` : '<p class="text-[10px] text-deep-teal/50">Trong ngưỡng cho phép</p>'}${bar(S.defect * 10, defBad)}</div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button onclick="showReportFromAdvisor()" class="clay-btn bg-deep-teal text-white text-xs font-bold py-2.5">⬆️ Nâng cấp Dây chuyền</button>
        <button onclick="doMaintainFromAdvisor()" class="clay-btn bg-white text-deep-teal text-xs font-bold py-2.5">🔧 Bảo trì ngay</button>
      </div>
    </div>
    <div class="clay-card p-4">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">📣 Chiến lược Marketing <span class="text-[10px] text-deep-teal/50">· dành cho CMO</span></p>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Thị phần (Market Share)</p>
          <p class="font-display font-extrabold text-deep-teal text-xl">${shareNow.toFixed(1)}%</p>${bar(shareNow * 2, false)}</div>
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Brand Loyalty</p>
          <p class="font-display font-extrabold text-primary text-xl">${S.brandLoyalty}%</p>
          <p class="text-[10px] text-deep-teal/50">Social Sentiment: <b class="text-emerald-600">Positive</b></p>${bar(S.brandLoyalty, false)}</div>
      </div>
      ${currentEvent(S).id === 'EV_PRICEWAR' && !S.finished ? `
        <div class="bg-surface-bright rounded-2xl p-3 mb-2">
          <p class="text-xs font-bold text-red-600 mb-1">⚔️ Price War Scenario</p>
          <p class="text-[11px] text-deep-teal/70">Đối thủ giảm giá 15% tại kênh Modern Trade. Đừng đua giảm giá — chọn 1 trong 2 chiến thuật:</p>
          <div class="flex gap-2 mt-2"><span class="text-[10px] font-bold bg-white rounded-full px-2.5 py-1 shadow-clay">CHIẾN THUẬT BUNDLING</span><span class="text-[10px] font-bold bg-white rounded-full px-2.5 py-1 shadow-clay">TĂNG VALUE-ADDED</span></div>
        </div>` : `
        <div class="bg-surface-bright rounded-2xl p-3 mb-2">
          <p class="text-xs font-bold text-emerald-700 mb-1">🌱 Green Marketing</p>
          <p class="text-[11px] text-deep-teal/70">Người tiêu dùng Gen Z sẵn sàng chi thêm 10-15% cho sản phẩm cam kết Net Zero. Dự báo ROI tăng 22% sau 6 tháng.</p>
        </div>`}
      <button onclick="doBrandingPremium()" class="clay-btn w-full bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold py-2.5">✨ Activate Branding Premium (120tr₫)</button>
    </div>`;
}

function doApproveLoan() {
  if (!approveLoan(S)) return;
  save(); renderAll(); createConfetti();
  pushLumina({ risk: 'medium', text: 'Đã giải ngân khoản vay 300tr₫! Lưu ý: lãi 5%/vòng (15tr₫) sẽ trừ vào lợi nhuận mỗi vòng còn lại. Hãy dùng vốn hiệu quả để ROI vượt chi phí vốn nhé.' });
}
function doCutCosts() {
  if (!cutCosts(S)) return;
  save(); renderAll();
  pushLumina({ risk: 'low', text: 'Đã kích hoạt phương án cắt giảm chi phí — chi phí cố định vòng sau giảm 15%. Cẩn thận đừng cắt vào các khoản đầu tư dài hạn!' });
}
function doBrandingPremium() {
  if (!brandingPremium(S)) { alert('ERR_INSUFFICIENT_FUNDS — Cần 120tr₫ để kích hoạt Branding Premium.'); return; }
  save(); renderAll(); createConfetti();
  pushLumina({ risk: 'low', text: 'Branding Premium đã kích hoạt! Giá trị thương hiệu tăng — thị phần và Brand Loyalty sẽ cải thiện từ vòng sau. 🎉' });
}
function showReportFromAdvisor() { currentReport = 'energy'; showTab('reports'); }
function doMaintainFromAdvisor() {
  if (!doMaintenance(S)) { alert('ERR_INSUFFICIENT_FUNDS — Cần 60tr₫ trong ví để bảo trì.'); return; }
  save(); renderAll();
  pushLumina({ risk: 'low', text: 'Đã lên lịch bảo trì khẩn! OEE sẽ cải thiện +3% và tỷ lệ phế phẩm giảm ở vòng tới. 🔧' });
}

function pushLumina(advice) {
  const riskLabel = { low: '🟢 Cơ hội', medium: '🟡 Thận trọng', high: '🔴 Rủi ro cao' }[advice.risk];
  const el = document.createElement('div');
  el.className = 'flex gap-3 items-start';
  el.innerHTML = `
    <img src="assets/character/lumina-vest.png" alt="Lumina" class="w-9 h-9 shrink-0 rounded-full object-cover shadow-clay" style="object-position:50% 12%">
    <div class="clay-card p-4 flex-1">
      <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 risk-${advice.risk}">${riskLabel}</span>
      <p class="text-sm text-deep-teal">${advice.text}</p>
    </div>`;
  $('advisor-chat').appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function askLumina(topic) {
  const quota = AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0);
  if (S.aiUsed >= quota) {
    pushLumina({ risk: 'medium', text: 'ERR_AI_LIMIT — Lumina đang bận! Bạn đã dùng hết lượt hỏi của vòng này. Lượt hỏi sẽ được làm mới sau khi commit quyết định.' });
    return;
  }
  S.aiUsed++;
  S.aiAskedTotal++;
  save();
  renderAdvisorIntro();
  pushLumina(luminaAdvice(S, topic));
}

// ---------- Reports ----------
let currentReport = 'pnl';
function showReport(kind) {
  currentReport = kind;
  document.querySelectorAll('.rep-tab').forEach(b => {
    const on = b.dataset.rep === kind;
    b.classList.toggle('bg-primary', on); b.classList.toggle('text-white', on);
    b.classList.toggle('bg-white', !on); b.classList.toggle('text-deep-teal', !on);
  });
  const body = $('report-body');
  if (kind === 'energy') { renderEnergyReport(body); return; }
  if (!S.history.length) {
    body.innerHTML = '<div class="clay-card p-8 text-center text-sm text-deep-teal/50">Chưa có dữ liệu — hãy hoàn thành vòng đầu tiên!</div>';
    return;
  }
  const rows = S.history.map(r => {
    if (kind === 'pnl') return { label: 'V' + r.round, main: r.netProfit, sub: `DT ${money(r.revenue)}` };
    if (kind === 'cash') return { label: 'V' + r.round, main: r.balance, sub: `LN ${money(r.netProfit)}` };
    return { label: 'V' + r.round, main: -r.depreciation, sub: `Công suất ${(S.machineCapacity).toLocaleString('vi-VN')}` };
  });
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.main)), 1);
  const title = { pnl: 'Lợi nhuận ròng theo vòng', cash: 'Số dư ví ảo theo vòng', dep: 'Chi phí khấu hao theo vòng' }[kind];
  body.innerHTML = `
    <div class="clay-card p-5">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-4">${title}</h3>
      <div class="flex items-end gap-2 h-40 mb-2">
        ${rows.map(r => {
          const h = Math.max(8, Math.abs(r.main) / maxAbs * 100);
          const pos = r.main >= 0;
          return `<div class="flex-1 flex flex-col items-center justify-end h-full">
            <div class="w-full rounded-t-xl ${pos ? 'bg-gradient-to-t from-primary to-primary-container' : 'bg-gradient-to-t from-orange-500 to-orange-300'}" style="height:${h}%"></div>
            <p class="text-[10px] font-bold text-deep-teal/60 mt-1">${r.label}</p>
          </div>`;
        }).join('')}
      </div>
      <div class="divide-y divide-surface-bright">
        ${S.history.map((r, i) => `
          <div class="py-2.5 flex justify-between items-center text-sm">
            <span class="font-bold text-deep-teal">${r.event.icon} Vòng ${r.round}</span>
            <span class="text-right"><span class="font-display font-bold ${rows[i].main >= 0 ? 'text-deep-teal' : 'text-orange-600'}">${money(rows[i].main)}</span>
            <span class="block text-[10px] text-deep-teal/50">${rows[i].sub}</span></span>
          </div>`).join('')}
      </div>
    </div>`;
}

// ---------- Kiểm toán Năng lượng (theo thiết kế Stitch) ----------
function renderEnergyReport(body) {
  const er = energyReport(S);
  const over = er.overloadPct > 100;
  const statusChip = { ok: '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full risk-low">Hiệu quả</span>', warn: '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full risk-medium">Cảnh báo</span>', bad: '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full risk-high">Nguy cấp</span>' };
  const barColor = { ok: 'bg-primary', warn: 'bg-amber-500', bad: 'bg-red-500' };
  const maxKwh = Math.max(...er.lines.map(l => l.kwh), 1);
  const worst = er.lines.reduce((a, b) => (b.kwh > a.kwh ? b : a));
  const worstIdx = er.lines.indexOf(worst);
  const ringDeg = Math.min(360, er.overloadPct * 3.6);
  body.innerHTML = `
    <div class="clay-card p-5 mb-4 text-center">
      <h3 class="font-display font-extrabold text-deep-teal text-lg">Tổng mức tiêu thụ</h3>
      <p class="text-xs text-deep-teal/60 mb-3">Sản lượng tiêu thụ hiện tại so với mục tiêu.</p>
      ${over ? '<span class="inline-block risk-high text-xs font-bold px-3 py-1.5 rounded-full mb-3">⚠️ Vượt Mức Tiêu Thụ</span>' : '<span class="inline-block risk-low text-xs font-bold px-3 py-1.5 rounded-full mb-3">✅ Trong ngưỡng an toàn</span>'}
      <p class="font-display font-extrabold ${over ? 'text-red-600' : 'text-primary'} text-4xl">${er.total.toLocaleString('vi-VN')} <span class="text-base">kWh</span></p>
      <p class="text-xs text-deep-teal/60 mb-4">Mục tiêu: <b>${er.target.toLocaleString('vi-VN')} kWh</b></p>
      <div class="w-36 h-36 mx-auto rounded-full flex items-center justify-center" style="background:conic-gradient(${over ? '#dc2626' : '#006687'} ${ringDeg}deg, #e5f2f8 0deg)">
        <div class="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
          <span class="font-display font-extrabold ${over ? 'text-red-600' : 'text-primary'} text-2xl">${er.overloadPct}%</span>
          <span class="text-[9px] font-bold text-deep-teal/50 uppercase">${over ? 'Quá tải' : 'Công suất'}</span>
        </div>
      </div>
    </div>
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-display font-bold text-deep-teal">Chi tiết dây chuyền</h3>
      <span class="text-[11px] text-deep-teal/50">Cập nhật theo vòng ${Math.min(S.round, ROUNDS_TOTAL)}</span>
    </div>
    ${er.lines.map((l, i) => `
      <div class="clay-card p-4 mb-3 ${l.status === 'bad' ? 'border-2 border-red-200' : ''}">
        <div class="flex items-center gap-3">
          <span class="text-2xl">${['🦾', '🏭', '🔩'][i]}</span>
          <div class="flex-1">
            <p class="font-bold text-sm text-deep-teal">${l.name} ${l.upgraded ? '<span class="text-[9px] bg-primary-container/30 text-primary font-bold px-1.5 py-0.5 rounded-full">ĐÃ NÂNG CẤP</span>' : ''}</p>
            <div class="h-2 rounded-full bg-surface-bright overflow-hidden mt-1.5"><div class="h-full ${barColor[l.status]} rounded-full" style="width:${Math.round(100 * l.kwh / maxKwh)}%"></div></div>
          </div>
          <div class="text-right"><p class="font-display font-bold ${l.status === 'bad' ? 'text-red-600' : 'text-primary'} text-sm">${l.kwh.toLocaleString('vi-VN')} kWh</p>${statusChip[l.status]}</div>
        </div>
      </div>`).join('')}
    <div class="clay-card p-4 mb-3 bg-primary-container/10">
      <div class="flex gap-3 items-start">
        <img src="assets/character/lumina-vest.png" alt="Lumina" class="w-10 h-10 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
        <div>
          <p class="font-display font-bold text-primary text-sm">Lumina AI Hương Advisor</p>
          <p class="text-sm text-deep-teal/80 italic mt-1">"${worst.upgraded
            ? 'Các dây chuyền đã vận hành tối ưu. Duy trì bảo trì định kỳ để giữ OEE ổn định nhé!'
            : `${worst.name} đang tiêu thụ năng lượng nhiều hơn 40% do máy móc đã cũ. Việc nâng cấp sẽ giúp giảm đáng kể chi phí vận hành (OPEX).`}"</p>
          <p class="text-xs font-bold text-primary mt-2">💡 Tiềm năng tiết kiệm: ${Math.round(worst.kwh * 0.4 / 100) * 10}tr₫/vòng</p>
        </div>
      </div>
    </div>
    <button onclick="doOptimizeLine(${worstIdx})" class="clay-btn w-full bg-deep-teal text-white font-display font-bold py-4 mb-3 ${worst.upgraded ? 'opacity-50' : ''}" ${worst.upgraded ? 'disabled' : ''}>⚡ Tối ưu ${worst.name} (150tr₫)</button>
    <button onclick="doMaintain()" class="clay-btn w-full bg-white text-deep-teal font-display font-bold py-4 mb-4">🕓 Bảo trì ngay (60tr₫)</button>
    <h3 class="font-display font-bold text-deep-teal mb-2">Lịch sử bảo trì</h3>
    <div class="clay-card p-4 text-sm text-deep-teal/70 space-y-1.5">
      ${(S.maintenanceLog || []).length ? S.maintenanceLog.slice(-6).reverse().map(m => `<p>🔧 V${m.round}: ${m.text}</p>`).join('') : '<p class="text-deep-teal/40">Chưa có hoạt động bảo trì nào.</p>'}
    </div>`;
}

function doOptimizeLine(idx) {
  if (!optimizeLine(S, idx)) { alert('ERR_INSUFFICIENT_FUNDS — Cần 150tr₫ trong ví để nâng cấp dây chuyền.'); return; }
  save(); renderAll(); showReport('energy'); createConfetti();
}

function doMaintain() {
  if (!doMaintenance(S)) { alert('ERR_INSUFFICIENT_FUNDS — Cần 60tr₫ trong ví để bảo trì.'); return; }
  save(); renderAll(); showReport('energy');
}

// ---------- Shop & Inventory ----------
function renderShop() {
  const mul = skillEffect(S, 'shopMul', 1);
  $('shop-list').innerHTML = SHOP_ITEMS.map(it => {
    const price = Math.round(it.price * mul);
    return `<div class="clay-card p-4 flex items-center gap-3">
      <span class="text-3xl">${it.icon}</span>
      <div class="flex-1"><p class="font-display font-bold text-deep-teal text-sm">${it.name}</p>
        <p class="text-[11px] text-deep-teal/60">${it.desc}</p></div>
      <button onclick="buyItem('${it.id}')" class="clay-btn bg-primary text-white text-xs font-bold px-3 py-2 shrink-0">${price}tr₫</button>
    </div>`;
  }).join('');

  const owned = Object.entries(S.items).filter(([, q]) => q > 0);
  $('inventory-list').innerHTML = owned.length ? owned.map(([id, q]) => {
    const it = SHOP_ITEMS.find(x => x.id === id);
    const activable = it.type !== 'blueprint';
    const active = S.activeBoosts.includes(id);
    return `<div class="clay-card p-4 flex items-center gap-3">
      <span class="text-2xl">${it.icon}</span>
      <div class="flex-1"><p class="font-bold text-sm text-deep-teal">${it.name} ×${q}</p>
        <p class="text-[10px] text-deep-teal/50">${it.type === 'blueprint' ? 'Hiệu lực vĩnh viễn' : active ? 'Sẽ áp dụng ở vòng kế tiếp' : 'Chưa kích hoạt'}</p></div>
      ${activable ? `<button onclick="toggleBoost('${id}')" class="clay-btn ${active ? 'bg-primary-container/40 text-primary' : 'bg-surface-bright text-deep-teal'} text-xs font-bold px-3 py-2">${active ? 'Đã bật' : 'Kích hoạt'}</button>` : ''}
    </div>`;
  }).join('') : '<p class="text-sm text-deep-teal/50">Chưa có vật phẩm nào.</p>';
}

function buyItem(id) {
  const it = SHOP_ITEMS.find(x => x.id === id);
  if (!it) { alert('ERR_ITEM_NOT_FOUND — Vật phẩm không tồn tại.'); return; }
  const price = Math.round(it.price * skillEffect(S, 'shopMul', 1));
  if (S.balance < price) { alert('ERR_INSUFFICIENT_FUNDS — Ví ảo của đội không đủ ' + price + 'tr₫.'); return; }
  S.balance -= price;
  S.items[id] = (S.items[id] || 0) + 1;
  S.itemsBought++;
  save(); renderAll(); createConfetti();
}

function toggleBoost(id) {
  const i = S.activeBoosts.indexOf(id);
  if (i >= 0) S.activeBoosts.splice(i, 1);
  else {
    S.activeBoosts.push(id);
    if ((S.items[id] || 0) > 0 && SHOP_ITEMS.find(x => x.id === id).type === 'consumable') S.items[id]--;
  }
  save(); renderShop();
}

// ---------- Skills ----------
function renderSkills() {
  const avail = S.xp - S.spentXp;
  $('skill-tree').innerHTML = `<div class="clay-card p-4 mb-1 flex justify-between items-center">
      <span class="font-bold text-sm text-deep-teal">XP khả dụng</span>
      <span class="font-display font-extrabold text-primary">${avail.toLocaleString('vi-VN')} XP</span>
    </div>` +
    SKILLS.map(sk => {
      const owned = hasSkill(S, sk.id);
      const affordable = avail >= sk.cost;
      return `<div class="clay-card p-4 flex items-center gap-3 ${owned ? 'border-2 border-primary-container/60' : !affordable ? 'skill-locked' : ''}">
        <span class="text-3xl">${sk.icon}</span>
        <div class="flex-1"><p class="font-display font-bold text-deep-teal text-sm">${sk.name}</p>
          <p class="text-[11px] text-deep-teal/60">${sk.desc}</p></div>
        ${owned ? '<span class="text-xl">✅</span>'
          : `<button onclick="unlockSkill('${sk.id}')" class="clay-btn bg-primary text-white text-xs font-bold px-3 py-2 shrink-0">${sk.cost} XP</button>`}
      </div>`;
    }).join('');
}

function unlockSkill(id) {
  const sk = SKILLS.find(x => x.id === id);
  if (S.xp - S.spentXp < sk.cost) { alert('Chưa đủ XP — hãy hoàn thành thêm vòng chơi!'); return; }
  S.spentXp += sk.cost;
  S.skills.push(id);
  save(); renderAll(); createConfetti();
}

// ---------- Leaderboard ----------
function renderLeaderboard() {
  const totalProfit = S.history.reduce((a, r) => a + r.netProfit, 0);
  const lastShare = S.history.length ? S.history[S.history.length - 1].share : 25;
  const all = [
    { name: S.profile.teamName + ' (Bạn)', profit: totalProfit, share: lastShare, me: true },
    ...S.competitors.map(c => ({ name: c.name, profit: c.profit, share: c.share })),
  ].sort((a, b) => b.profit - a.profit);
  const medals = ['🥇', '🥈', '🥉', '4️⃣'];
  $('lb-list').innerHTML = all.map((t, i) => `
    <div class="clay-card p-4 flex items-center gap-3 ${t.me ? 'border-2 border-primary-container' : ''}">
      <span class="text-2xl">${medals[i]}</span>
      <div class="flex-1"><p class="font-display font-bold text-deep-teal text-sm">${t.name}</p>
        <p class="text-[11px] text-deep-teal/50">Thị phần ${t.share.toFixed(1)}%</p></div>
      <span class="font-display font-bold ${t.profit >= 0 ? 'text-primary' : 'text-orange-600'}">${money(t.profit)}</span>
    </div>`).join('');
}

// ---------- Achievements & Certificate ----------
function renderAchievements() {
  $('ach-list').innerHTML = ACHIEVEMENTS.map(a => {
    const got = S.achievements.includes(a.id);
    return `<div class="clay-card p-4 text-center ${got ? '' : 'skill-locked'}">
      <p class="text-3xl">${a.icon}</p>
      <p class="font-display font-bold text-deep-teal text-xs mt-1">${a.name}</p>
      <p class="text-[10px] text-deep-teal/50 mt-0.5">${a.desc}</p>
    </div>`;
  }).join('');
  if (S.finished) {
    $('certificate-box').classList.remove('hidden');
    $('cert-team').textContent = S.profile.teamName;
    const total = S.history.reduce((a, r) => a + r.netProfit, 0);
    $('cert-result').textContent = `Tổng lợi nhuận: ${money(total)} · ${S.xp.toLocaleString('vi-VN')} XP · ${S.achievements.length}/${ACHIEVEMENTS.length} thành tựu`;
  }
}

// ---------- Profile & Settings ----------
function renderProfile() {
  $('pf-name').textContent = S.profile.teamName;
  $('pf-email').textContent = S.profile.email;
  $('pf-role').textContent = { CEO: '🧭 CEO — Quyết định', CFO: '💰 CFO — Tài chính', CMO: '📣 CMO — Thị trường', COO: '🏭 COO — Vận hành', SEC: '📝 SEC — Thư ký' }[S.profile.role];
  const level = 1 + Math.floor(S.xp / XP_PER_LEVEL);
  $('pf-level').textContent = level;
  $('pf-xp').textContent = S.xp.toLocaleString('vi-VN') + ' XP';
  $('pf-xpbar').style.width = (S.xp % XP_PER_LEVEL) + '%';
  $('pf-profit').textContent = money(S.history.reduce((a, r) => a + r.netProfit, 0));
  $('pf-rounds').textContent = S.history.length + '/6';
}

function resetGame() {
  if (!confirm('Xóa toàn bộ tiến trình và chơi lại từ đầu?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ---------- Missions ----------
function renderMissions() {
  const readyCount = MISSIONS.filter(m => missionStatus(S, m) === 'ready').length;
  const badge = $('missions-badge');
  badge.classList.toggle('hidden', readyCount === 0);
  badge.textContent = readyCount;
  $('missions-list').innerHTML = MISSIONS.map(m => {
    const st = missionStatus(S, m);
    return `<div class="clay-card p-4 flex items-center gap-3 ${st === 'pending' ? 'opacity-70' : ''} ${st === 'claimed' ? 'border-2 border-primary-container/40' : ''}">
      <span class="text-3xl">${m.icon}</span>
      <div class="flex-1">
        <p class="font-display font-bold text-deep-teal text-sm">${m.name}</p>
        <p class="text-[11px] text-deep-teal/60">${m.desc}</p>
        <p class="text-[11px] font-bold text-primary mt-0.5">🎁 ${m.rewardMoney}tr₫ + ${m.rewardXp} XP</p>
      </div>
      ${st === 'claimed' ? '<span class="text-xl">✅</span>'
        : st === 'ready' ? `<button onclick="doClaimMission('${m.id}')" class="clay-btn bg-primary text-white text-xs font-bold px-3 py-2 shrink-0">Nhận</button>`
        : '<span class="text-lg opacity-40">🔒</span>'}
    </div>`;
  }).join('');
}

function doClaimMission(id) {
  if (claimMission(S, id)) { save(); renderAll(); createConfetti(); }
}

// ---------- Clay Factory Frenzy ----------
const MG_ITEMS = ['🏺', '🫖', '🧱', '🪴', '🏆'];
let mg = null; // trạng thái phiên chơi hiện tại

function renderMinigame() {
  $('mg-best').textContent = S.minigameBest;
  $('mg-plays').textContent = Math.min(3, (S.minigamePlays || 0) + 1);
  const btn = $('mg-start');
  const out = (S.minigamePlays || 0) >= 3;
  btn.disabled = out || !!mg;
  btn.classList.toggle('opacity-50', out);
  if (out) btn.innerHTML = '⏳ Hết lượt — commit vòng mới để chơi tiếp';
}

function startMinigame() {
  if ((S.minigamePlays || 0) >= 3 || mg) return;
  S.minigamePlays = (S.minigamePlays || 0) + 1;
  save();
  mg = { score: 0, time: 30, target: MG_ITEMS[0], timers: [] };
  pickTarget();
  $('mg-score').textContent = '0';
  $('mg-time').textContent = '30';
  $('mg-start').disabled = true;
  $('mg-start').classList.add('opacity-50');
  mg.timers.push(setInterval(() => {
    mg.time--;
    $('mg-time').textContent = mg.time;
    if (mg.time <= 0) endMinigame();
  }, 1000));
  mg.timers.push(setInterval(spawnItem, 700));
}

function pickTarget() {
  mg.target = MG_ITEMS[Math.floor(Math.random() * MG_ITEMS.length)];
  $('mg-target').textContent = mg.target;
}

function spawnItem() {
  if (!mg) return;
  const belt = $('mg-belt');
  const el = document.createElement('span');
  el.className = 'mg-item';
  el.textContent = MG_ITEMS[Math.floor(Math.random() * MG_ITEMS.length)];
  el.style.animationDuration = (2.6 + Math.random() * 1.6) + 's';
  el.onclick = () => {
    if (!mg) return;
    if (el.textContent === mg.target) { mg.score++; pickTarget(); }
    else mg.score = Math.max(0, mg.score - 1);
    $('mg-score').textContent = mg.score;
    el.remove();
  };
  el.addEventListener('animationend', () => el.remove());
  belt.appendChild(el);
}

function endMinigame() {
  if (!mg) return;
  mg.timers.forEach(clearInterval);
  const score = mg.score;
  document.querySelectorAll('.mg-item').forEach(e => e.remove());
  const reward = Math.min(60, score * 2);
  S.balance += reward;
  if (score > (S.minigameBest || 0)) S.minigameBest = score;
  mg = null;
  save(); renderAll();
  if (reward > 0) createConfetti();
  $('mg-start').innerHTML = `🎉 +${reward}tr₫! Chơi lại (lượt ${Math.min(3, S.minigamePlays + 1)}/3)`;
  if (S.minigamePlays < 3) { $('mg-start').disabled = false; $('mg-start').classList.remove('opacity-50'); }
}

// ---------- Instructor ----------
function renderInstructor() {
  const lockBtn = $('btn-lock');
  lockBtn.textContent = S.roundLocked ? '🔓 Mở khóa' : '🔒 Khóa';
  lockBtn.classList.toggle('bg-orange-100', S.roundLocked);
  const totalProfit = S.history.reduce((a, r) => a + r.netProfit, 0);
  const teams = [
    { id: 'YOU', name: S.profile.teamName + ' (đội của lớp)', balance: S.balance, profit: totalProfit, real: true },
    ...S.competitors.map((c, i) => ({ id: 'AI' + i, name: c.name + ' (AI)', balance: null, profit: c.profit })),
  ];
  $('ins-teams').innerHTML = teams.map(t => `
    <div class="clay-card p-4 flex items-center gap-3">
      <span class="text-2xl">${t.real ? '🏢' : '🤖'}</span>
      <div class="flex-1">
        <p class="font-bold text-sm text-deep-teal">${t.name}</p>
        <p class="text-[11px] text-deep-teal/60">Lợi nhuận lũy kế: ${money(t.profit)}${t.balance != null ? ' · Ví: ' + money(t.balance) : ''}</p>
      </div>
      ${t.real ? `<button onclick="grantFunds(100)" class="clay-btn bg-primary text-white text-xs font-bold px-3 py-2 shrink-0">+100tr₫</button>` : ''}
    </div>`).join('');
  $('ins-log').innerHTML = (S.grantLog || []).length
    ? S.grantLog.slice(-8).reverse().map(g => `<p>💸 Cấp <b>${g.amount}tr₫</b> cho ${g.team} — vòng ${g.round}</p>`).join('')
    : '<p class="text-deep-teal/40">Chưa có giao dịch nào.</p>';
}

function toggleRoundLock() {
  S.roundLocked = !S.roundLocked;
  save(); renderAll();
}

function grantFunds(amount) {
  S.balance += amount;
  S.grantLog.push({ team: S.profile.teamName, amount, round: Math.min(S.round, ROUNDS_TOTAL) });
  save(); renderAll(); createConfetti();
}

// ---------- Lumina Advisor Pro ----------
function runAdvisorPro() {
  const inp = {
    revenue: +$('ap-revenue').value || 0,
    cost: +$('ap-cost').value || 0,
    marketing: +$('ap-marketing').value || 0,
    growthTarget: +$('ap-growth').value || 0,
  };
  const r = advisorProScenarios(inp);
  const riskLabel = { low: '🟢 Rủi ro thấp', medium: '🟡 Rủi ro vừa', high: '🔴 Rủi ro cao' };
  const riskClass = { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' };
  $('ap-result').innerHTML = `
    <div class="clay-card p-4 mb-3 flex items-center gap-3">
      <img src="assets/character/lumina-vest.png" alt="Lumina" class="w-10 h-10 rounded-full object-cover shadow-clay" style="object-position:50% 12%">
      <p class="text-sm text-deep-teal">Biên lợi nhuận hiện tại của bạn là <b>${r.marginPct}%</b> — ${r.healthy ? 'nền tảng tốt để mở rộng! 💪' : 'hơi mỏng, nên tối ưu chi phí trước khi tăng tốc. ⚠️'}</p>
    </div>
    ${r.scenarios.map(sc => `
      <div class="clay-card p-4 mb-3">
        <div class="flex justify-between items-center mb-2">
          <p class="font-display font-bold text-deep-teal">${sc.label}</p>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${riskClass[sc.risk]}">${riskLabel[sc.risk]}</span>
        </div>
        <p class="text-sm text-deep-teal/80"><b>Nếu</b> điều chỉnh ngân sách marketing thành <b>${sc.newMkt}tr₫/tháng</b>,
        <b>thì</b> tăng trưởng dự kiến đạt <b>${sc.growth}%/quý</b> — doanh thu ~<b>${sc.newRevenue}tr₫</b>,
        lợi nhuận ~<b class="${sc.newProfit >= 0 ? 'text-emerald-600' : 'text-orange-600'}">${sc.newProfit}tr₫/tháng</b>.</p>
      </div>`).join('')}
    <p class="text-[11px] text-deep-teal/40 text-center mb-4">Mô hình dự báo đơn giản hóa cho mục đích học tập — không phải tư vấn tài chính.</p>`;
}
