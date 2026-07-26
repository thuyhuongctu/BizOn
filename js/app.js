/* BizOn Bật Nghiệp 2026 — UI controller (SPA, localStorage persistence) */

const STORAGE_KEY = 'bizon2026';
let S = null;

// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const money = m => (m >= 1000 || m <= -1000)
  ? (m / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ₫'
  : Math.round(m).toLocaleString('vi-VN') + 'tr₫';

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
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
  div.querySelector('button').onclick = () => { div.remove(); renderAll(); if (S.finished) { showTab('achievements'); createConfetti(); } };
  document.body.appendChild(div);
}

// ---------- Lumina Advisor ----------
function renderAdvisorIntro() {
  const quota = AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0) - S.aiUsed;
  $('ai-quota').textContent = Math.max(0, quota);
  if (!$('advisor-chat').childElementCount) {
    pushLumina({ risk: 'low', text: `Xin chào, Je m'appelle Hương! 👋 Tôi là Lumina — cố vấn AI của đội ${S.profile.teamName}. Hãy chọn một câu hỏi bên dưới, tôi sẽ phân tích kịch bản "Nếu — Thì" cho bạn.` });
  }
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
