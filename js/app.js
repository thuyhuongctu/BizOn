/* BizOn Bật Nghiệp 2026 – UI controller (SPA, localStorage persistence)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */

const STORAGE_KEY = 'bizon2026';
let S = null;

// ---------- Helpers ----------
const $ = id => document.getElementById(id);
// Inline bilingual helper: T(vietnamese, english) — reads the site-wide lang toggle.
// Pure localization layer: 'vi' branch must stay byte-identical to the original text.
function currentLang() {
  try { return localStorage.getItem('bizon-lang') || 'vi'; } catch (e) { return 'vi'; }
}
function T(vi, en) { return currentLang() === 'en' ? en : vi; }
const money = m => (m >= 1000 || m <= -1000)
  ? (m / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ₫'
  : Math.round(m).toLocaleString('vi-VN') + 'tr₫';

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
  if (window.BizonBackend) BizonBackend.syncTeamState(S);
}
// migration cho save cũ (local hoặc tải từ máy chủ) thiếu trường mới
function applyStateDefaults(s) {
  if (!s) return s;
  s.missionsClaimed ??= []; s.aiAskedTotal ??= 0; s.itemsBought ??= 0;
  s.minigameBest ??= 0; s.minigamePlays ??= 0; s.roundLocked ??= false; s.grantLog ??= [];
  s.minigamePoints ??= 0; s.rewardsOwned ??= []; s.rewardEquipped ??= null;
  s.oee ??= 85; s.defect ??= 2.0; s.brandLoyalty ??= 65; s.adEff ??= 0;
  s.quickRatio ??= 1.0; s.roi ??= 0; s.energyLines ??= [2100, 4850, 1470];
  s.lineUpgraded ??= [false, false, false]; s.maintBonus ??= 0; s.maintenanceLog ??= [];
  s.loan ??= 0; s.costCutter ??= false; s.peakShare ??= 0; s.eventShownRound ??= 0;
  s.whatIfUsed ??= 0; s.advisorHistory ??= [];
  s.whatIfTotal ??= 0; s.suggestionsApplied ??= 0; s.achShown ??= (s.achievements || []).slice();
  s.conquest ??= []; s.aiHistory ??= []; s.teamMembers ??= null;
  return s;
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return s ? applyStateDefaults(s) : s;
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
function ROLES_LIST() { return [
  { id: 'CEO', icon: '🧭', title: T('Nhà lãnh đạo tầm nhìn', 'Visionary Leader'),   desc: T('Chèo lái chiến lược, chốt hạ mọi quyết định', 'Steers strategy, makes the final call') },
  { id: 'CFO', icon: '💰', title: T('Chiến lược gia tài chính', 'Finance Strategist'), desc: T('Giữ két sắt, cân đối dòng tiền & gọi vốn', 'Guards the cash box, balances cash flow & raises capital') },
  { id: 'CMO', icon: '📣', title: T('Phù thủy marketing', 'Marketing Wizard'),       desc: T('Đánh chiếm thị phần bằng thương hiệu', 'Wins market share through branding') },
  { id: 'COO', icon: '🏭', title: T('Chuyên gia vận hành', 'Operations Expert'),      desc: T('Tối ưu xưởng, OEE & chất lượng sản phẩm', 'Optimizes the factory, OEE & product quality') },
  { id: 'SEC', icon: '📝', title: T('Thư ký pháp chế', 'Legal Secretary'),        desc: T('Biên bản minh bạch, tuân thủ & hồ sơ đội', 'Transparent minutes, compliance & team records') },
]; }
let pickedRole = 'CEO';

function renderRolePicker() {
  const rp = $('role-picker');
  if (!rp) return;
  rp.innerHTML = ROLES_LIST().map(r => `
    <button type="button" data-role="${r.id}" onclick="pickRole('${r.id}')"
      class="role-chip clay-card !rounded-3xl p-4 text-center ${r.id === pickedRole ? 'sel ring-2 ring-primary-container' : ''}">
      <div class="text-5xl leading-none">${r.icon}</div>
      <div class="font-display font-extrabold text-deep-teal text-sm mt-2">${r.id}</div>
      <div class="text-[10px] font-bold text-primary leading-tight">${r.title}</div>
      <div class="text-[9px] text-deep-teal/50 mt-1 leading-snug">${r.desc}</div>
    </button>`).join('');
}

// Vài chuỗi tiếng Việt sống trong thuộc tính (placeholder/option), applyLang() ở
// site-ui.js chỉ đổi textContent nên không chạm tới – tự đồng bộ ở đây.
function applyGameStaticText() {
  const setPh = (id, vi, en) => { const el = $(id); if (el) el.placeholder = T(vi, en); };
  setPh('login-email', 'sinhvien@truong.edu.vn', 'student@university.edu');
  setPh('login-team', 'VD: Rồng Xanh Corp', 'e.g. Blue Dragon Corp');
  setPh('login-class', 'VD: QTKD-2026-A', 'e.g. BUS-2026-A');
  setPh('chat-input', 'Trò chuyện với Hương...', 'Chat with Hương...');
  const term = $('in-term');
  if (term && term.options.length >= 3) {
    term.options[0].textContent = T('30 ngày (Tiêu chuẩn)', '30 days (Standard)');
    term.options[1].textContent = T('60 ngày – cầu +4%, chi phí +2%', '60 days – demand +4%, cost +2%');
    term.options[2].textContent = T('90 ngày – cầu +8%, chi phí +5%', '90 days – demand +8%, cost +5%');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderRolePicker();
  applyGameStaticText();

  setTimeout(() => {
    $('screen-splash').classList.remove('active');
    const saved = load();
    if (saved && saved.profile) { S = saved; enterApp(); }
    else $('screen-login').classList.add('active');
  }, 1600);
});

// Đổi ngôn ngữ ngay trong game: applyLang() (site-ui.js) chỉ biết đổi text tĩnh,
// nên phát sự kiện này để app.js tự render lại toàn bộ nội dung động (Bảng điều
// khiển, Quyết định, Cố vấn, biến cố đang mở, v.v.) mà không cần tải lại trang.
window.addEventListener('bizon:langchange', () => {
  renderRolePicker();
  applyGameStaticText();
  if (S) {
    renderAll();
    const activeTab = document.querySelector('main .screen.active');
    if (activeTab && activeTab.id === 'tab-reports') showReport(currentReport);
  }
  const openManual = document.getElementById('manual-overlay');
  if (openManual) showManual(openManual.dataset.sec || undefined);
});

function pickRole(id) {
  pickedRole = id;
  document.querySelectorAll('.role-chip').forEach(b => {
    const on = b.dataset.role === id;
    b.classList.toggle('ring-2', on);
    b.classList.toggle('sel', on);
    if (on) b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}

// ---------- Đội demo 5 nhân vật & 3 đối thủ đại diện ----------
function DEMO_TEAM_LIST() { return [
  { role: 'CEO', icon: '🧭', img: 'assets/character/team/ceo.webp', name: 'Minh Long',  note: T('Nhà lãnh đạo tầm nhìn', 'Visionary Leader') },
  { role: 'CFO', icon: '💰', img: 'assets/character/team/cfo.jpg', name: 'Thu Hà',     note: T('Chiến lược gia tài chính', 'Finance Strategist') },
  { role: 'CMO', icon: '📣', img: 'assets/character/team/cmo.webp', name: 'Lan Chi',    note: T('Phù thủy marketing', 'Marketing Wizard') },
  { role: 'COO', icon: '🏭', img: 'assets/character/team/coo.webp', name: 'Bảo Ngọc',   note: T('Chuyên gia vận hành', 'Operations Expert') },
  { role: 'SEC', icon: '📝', img: 'assets/character/team/sec.webp', name: 'Gia Hân',    note: T('Thư ký pháp chế', 'Legal Secretary') },
]; }
const DEMO_TEAM = DEMO_TEAM_LIST();
function AI_OPPONENTS_LIST() { return [
  { name: 'Alpha Dynamics', icon: '🐺', img: 'assets/character/rivals/alpha.webp', accent: '#e8762d',
    motto: T('Tăng trưởng thần tốc, lấy số lượng đè lợi nhuận', 'Blitz growth – volume over margin'),
    weakness: T('Biên lợi nhuận cực mỏng, đốt vốn nhanh – dễ hụt hơi trong cuộc chiến dài hơi.', 'Razor-thin margins and fast cash burn – runs out of steam in a long fight.'),
    style: T('Giá rẻ tốc chiến', 'Budget blitz'),
    play: T('Giá ~125k · marketing ~90tr mỗi vòng (dao động ±12%)', 'Price ~125k · marketing ~90m/round (±12% variance)'),
    counter: T('Đừng đua giá tận đáy – giữ biên lợi nhuận, xây thương hiệu để giữ khách trung thành.', "Don't race them to the bottom on price – protect your margin and build brand loyalty instead.") },
  { name: 'Mekong Ventures', icon: '🐘', img: 'assets/character/rivals/mekong.webp', accent: '#00a0c8',
    motto: T('Chậm mà chắc, bám rễ niềm tin địa phương', 'Slow and steady, rooted in local trust'),
    weakness: T('Trung thành với truyền thống nên phản ứng chậm trước biến động công nghệ và thị trường.', 'Wedded to tradition, so it reacts slowly to tech and market shifts.'),
    style: T('Cân bằng chắc chắn', 'Steady balance'),
    play: T('Giá ~150k · marketing ~60tr – ổn định như đồng bằng', 'Price ~150k · marketing ~60m – steady as the delta'),
    counter: T('Vượt mặt bằng R&D và biến cố: họ ít khi phản ứng nhanh với thị trường.', 'Outpace them on R&D and market events – they rarely respond quickly.') },
  { name: 'Star Clay Co.',   icon: '🦚', img: 'assets/character/rivals/star.webp', accent: '#5a32a3',
    motto: T('Sang trọng trong từng chi tiết, bán sự khan hiếm', 'Luxury in every detail, selling scarcity'),
    weakness: T('Chi phí sản xuất thủ công cao – khó mở rộng quy mô nhanh, dễ nghẽn sản lượng.', 'High handcrafted production cost – hard to scale fast, prone to output bottlenecks.'),
    style: T('Cao cấp thương hiệu', 'Premium brand'),
    play: T('Giá ~195k · marketing ~75tr – đánh phân khúc sang', 'Price ~195k · marketing ~75m – targets the upscale segment'),
    counter: T('Chiếm phân khúc phổ thông họ bỏ ngỏ, hoặc đấu trực diện bằng chất lượng + ESG.', 'Take the mass-market segment they leave open, or challenge them head-on with quality + ESG.') },
]; }
const AI_OPPONENTS = AI_OPPONENTS_LIST();

async function doLoginDemo() {
  $('login-email').value = 'demo@bizon.vn';
  $('login-team').value = T('Đội Demo Rồng Xanh', 'Blue Dragon Demo Team');
  $('login-class').value = 'DEMO-2026';
  pickedRole = 'CEO';
  await doLogin();
  S.teamMembers = DEMO_TEAM_LIST();
  save(); renderAll();
}

/* Hồ sơ doanh nghiệp – tên công ty (= tên đội) + sản phẩm chủ lực */
function COMPANY_INFO_DATA() { return {
  product: T('Bộ linh vật đất sét Việt', 'Vietnamese Clay Mascot Set'), segment: T('Quà tặng & đồ sưu tầm', 'Gifts & collectibles'),
  factory: T('Xưởng thủ công Cần Thơ', 'Cần Thơ artisan workshop'), capital: T('Vốn ban đầu 500tr₫', 'Starting capital 500m₫'), refPrice: T('Giá bán đề xuất 150.000₫/bộ', 'Suggested price 150,000₫/set'),
}; }
const COMPANY_INFO = COMPANY_INFO_DATA();
function renderCompanyCard() {
  const box = $('company-card');
  if (!box) return;
  const CI = COMPANY_INFO_DATA();
  box.innerHTML = `<div class="clay-card p-5 mb-4">
    <div class="flex items-center gap-3 mb-2.5">
      <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-clay-orange to-clay-gold flex items-center justify-center text-2xl shadow-clay shrink-0">🏺</div>
      <div class="min-w-0">
        <p class="text-[9px] font-extrabold text-deep-teal/45 uppercase tracking-wide">${T('Doanh nghiệp', 'Company')}</p>
        <h3 class="font-display font-extrabold text-deep-teal text-lg truncate">${S.profile.teamName}</h3>
      </div>
    </div>
    <p class="text-xs text-deep-teal/65 mb-2.5">${T(`Xưởng đồ chơi đất sét thủ công khởi nghiệp từ Miền Tây – sản phẩm chủ lực: <b class="text-deep-teal">«${CI.product}»</b>, dòng ${CI.segment.toLowerCase()} mang hồn Việt.`, `A handcrafted clay-toy startup from Vietnam's Mekong Delta – flagship product: <b class="text-deep-teal">«${CI.product}»</b>, a ${CI.segment.toLowerCase()} line with Vietnamese soul.`)}</p>
    <div class="flex flex-wrap gap-1.5">
      ${[['🏺', CI.product], ['🎯', CI.segment], ['💲', CI.refPrice], ['🏭', CI.factory], ['💰', CI.capital]].map(([i, t]) => `
      <span class="clay-sunken rounded-full px-2.5 py-1 text-[10px] font-bold text-deep-teal/70">${i} ${t}</span>`).join('')}
    </div>
  </div>`;
}

function renderTeamCard() {
  const box = $('team-card');
  if (!box) return;
  if (!S.teamMembers) { box.innerHTML = ''; return; }
  const demoTeam = DEMO_TEAM_LIST();
  box.innerHTML = `<div class="clay-card p-5 mb-4">
    <h3 class="font-display font-bold text-deep-teal mb-3">${T('👥 Đội hình của bạn', '👥 Your lineup')} <span class="text-[10px] font-extrabold text-primary">DEMO</span></h3>
    <div class="grid grid-cols-5 gap-2 text-center">${S.teamMembers.map(m => { const img = m.img || (demoTeam.find(d => d.role === m.role) || {}).img; return `
      <div class="clay-sunken rounded-2xl p-2 ${m.role === S.profile.role ? 'ring-2 ring-primary-container' : ''}">
        ${img ? `<img src="${img}" alt="${m.role}" class="h-16 w-full object-contain rounded-xl" onerror="this.outerHTML='<p class=\\'text-2xl\\'>${m.icon}</p>'">` : `<p class="text-2xl">${m.icon}</p>`}
        <p class="text-[10px] font-extrabold text-deep-teal mt-0.5">${m.role}</p>
        <p class="text-[9px] text-deep-teal/55 leading-tight">${m.name}</p>
      </div>`; }).join('')}</div>
    <p class="text-[10px] text-deep-teal/45 mt-2.5">${T(`Bạn đang cầm vai ${S.profile.role} – các thành viên còn lại do đội thảo luận ngoài đời (chế độ lớp học).`, `You're playing the ${S.profile.role} role – the rest of the team discusses in person (classroom mode).`)}</p>
  </div>`;
}

function renderOpponents() {
  const box = $('opponents-card');
  if (!box) return;
  const shares = S.competitors.map(c => (c.share || 25));
  const opponents = AI_OPPONENTS_LIST();
  box.innerHTML = `<div class="clay-card p-5 mb-4">
    <h3 class="font-display font-bold text-deep-teal mb-1">${T('⚔️ 3 đối thủ AI của bạn', '⚔️ Your 3 AI rivals')}</h3>
    <p class="text-[10px] text-deep-teal/45 mb-3">${T('Mỗi vòng họ tự định giá & chi marketing theo tính cách – xem Sổ tay 📖 mục "Đối thủ AI" để biết cách khắc chế.', 'Each round they set price & marketing spend by personality – see the Handbook 📖 "AI Rivals" section for counter-strategies.')}</p>
    ${opponents.map((o, i) => `
      <button onclick="showRivalDetail(${i})" class="w-full text-left py-2 ${i < 2 ? 'border-b border-surface-bright' : ''}">
        <div class="flex items-center gap-3">
          <img src="${o.img}" alt="${o.name}" class="w-10 h-10 rounded-full object-cover object-top shadow-clay shrink-0" style="background:${o.accent}22">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-extrabold text-deep-teal">${o.icon} ${o.name} <span class="font-bold text-primary">· ${o.style}</span></p>
            <p class="text-[10px] text-deep-teal/55 truncate">${o.play}</p>
          </div>
          <p class="text-xs font-display font-extrabold text-deep-teal/70 shrink-0">${shares[i].toFixed(0)}% ›</p>
        </div>
        <div class="h-1.5 rounded-full bg-surface-bright overflow-hidden mt-1.5 ml-[52px]">
          <div class="h-full rounded-full transition-all duration-700" style="width:${Math.min(100, shares[i]).toFixed(0)}%; background:${o.accent}"></div>
        </div>
      </button>`).join('')}
    <p class="text-[10px] text-deep-teal/40 mt-2">${T('👆 Chạm vào một đối thủ để xem hồ sơ tình báo', '👆 Tap a rival to see their intel profile')}</p>
  </div>`;
}

/* Hồ sơ tình báo đối thủ – chân dung, chiến lược, điểm yếu và cách khắc chế */
function showRivalDetail(i) {
  const o = AI_OPPONENTS_LIST()[i];
  if (!o) return;
  const share = S && S.competitors && S.competitors[i] ? (S.competitors[i].share || 25) : 25;
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-[80] bg-deep-teal/60 backdrop-blur-sm flex items-center justify-center p-5 overflow-y-auto';
  div.innerHTML = `
    <div class="clay-card max-w-sm w-full overflow-hidden text-left">
      <div class="relative pt-5 px-5 pb-0 flex items-end justify-center" style="background:linear-gradient(160deg, ${o.accent}33 0%, ${o.accent}0d 100%)">
        <img src="${o.img}" alt="${o.name}" class="h-44 w-auto drop-shadow-xl">
        <span class="absolute top-3 right-3 text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full" style="background:${o.accent}">${o.icon} ${o.style}</span>
      </div>
      <div class="p-5">
        <h3 class="font-display font-extrabold text-deep-teal text-lg">${o.name}</h3>
        <p class="text-[11px] italic text-deep-teal/55 mt-0.5">«${o.motto}»</p>
        <div class="flex items-center gap-2 mt-3">
          <span class="text-[10px] font-extrabold uppercase text-deep-teal/50 shrink-0">${T('Thị phần hiện tại', 'Current market share')}</span>
          <div class="h-2 flex-1 rounded-full bg-surface-bright overflow-hidden"><div class="h-full rounded-full" style="width:${Math.min(100, share).toFixed(0)}%; background:${o.accent}"></div></div>
          <span class="text-xs font-display font-extrabold text-deep-teal shrink-0">${share.toFixed(0)}%</span>
        </div>
        <div class="clay-sunken rounded-2xl p-3 mt-3"><p class="text-[10px] font-extrabold text-deep-teal/50 uppercase mb-0.5">${T('📈 Cách họ chơi', '📈 How they play')}</p><p class="text-[11px] text-deep-teal/75">${o.play}</p></div>
        <div class="clay-sunken rounded-2xl p-3 mt-2"><p class="text-[10px] font-extrabold text-orange-600 uppercase mb-0.5">${T('⚠️ Điểm yếu chí mạng', '⚠️ Fatal weakness')}</p><p class="text-[11px] text-deep-teal/75">${o.weakness}</p></div>
        <div class="clay-sunken rounded-2xl p-3 mt-2"><p class="text-[10px] font-extrabold text-primary uppercase mb-0.5">${T('💡 Lumina khuyên cách khắc chế', '💡 Lumina\'s counter-strategy tip')}</p><p class="text-[11px] text-deep-teal/75">${o.counter}</p></div>
        <button class="clay-btn w-full bg-primary text-white font-display font-bold py-3 mt-4">${T('Đã nắm tình báo – quay lại', 'Got it – back')}</button>
      </div>
    </div>`;
  div.querySelector('button').onclick = () => div.remove();
  div.addEventListener('click', e => { if (e.target === div) div.remove(); });
  document.body.appendChild(div);
}

async function doLogin() {
  const email = $('login-email').value.trim() || 'sinhvien@bizon.vn';
  const team = $('login-team').value.trim() || T('Đội Claymorphism', 'Team Claymorphism');
  const classId = $('login-class').value.trim();

  // Đội đã có Mã lớp: thử tải lại tiến trình từ máy chủ trước — để đổi
  // sang máy khác ở phòng máy dùng chung vẫn tiếp tục đúng chỗ đang chơi
  // dở, thay vì bị ghi đè bằng ván mới.
  let restored = null;
  if (classId && window.BizonBackend) {
    try {
      const saved = await BizonBackend.loadTeamState(classId, team);
      if (saved && saved.state_json) restored = applyStateDefaults(saved.state_json);
    } catch (e) { /* im lặng – bắt đầu ván mới nếu không tải được */ }
  }
  S = restored || newGameState({ email, teamName: team, role: pickedRole, classId });
  save();
  $('screen-login').classList.remove('active');
  enterApp();
  createConfetti();
  try { if (!localStorage.getItem('bizon-intro-seen')) showIntro(); } catch (e) {}
  playHuongIntro();   // giọng chào thật của Hương AI (được phép vì gọi từ thao tác chạm)
  startMusic();       // nhạc nền BizOn Theme
}

// ---------- Màn hình loading toàn trang khi xử lý vòng (thiết kế Stitch) ----------
function SIM_STEPS_LIST() { return [
  T('Đang tổng hợp quyết định của đội...', "Compiling your team's decisions..."),
  T('Thị trường đang phản ứng...', 'The market is reacting...'),
  T('3 đối thủ AI đang ra quyết định...', '3 AI rivals are making their decisions...'),
  T('Đang lập báo cáo tài chính...', 'Building financial reports...'),
]; }
function showSimLoading() {
  const SIM_STEPS = SIM_STEPS_LIST();
  const div = document.createElement('div');
  div.id = 'sim-loading';
  div.className = 'fixed inset-0 z-[60] flex flex-col items-center justify-center text-center px-8';
  div.style.background = 'linear-gradient(160deg,#02191c 0%,#033337 60%,#02444d 100%)';
  div.innerHTML = `
    <img src="assets/icons/icon-192.png" alt="" class="w-24 h-24 rounded-3xl animate-pulse-logo" style="filter:drop-shadow(0 0 28px rgba(0,196,255,.75))">
    <h2 class="font-display font-extrabold text-2xl text-white mt-8 leading-tight">${T('Đang chuẩn bị<br><span style="color:#7fe3ff; text-shadow:0 0 18px rgba(0,196,255,.6)">Dashboard của bạn...</span>', 'Preparing<br><span style="color:#7fe3ff; text-shadow:0 0 18px rgba(0,196,255,.6)">your Dashboard...</span>')}</h2>
    <div class="w-full max-w-xs h-2.5 rounded-full mt-7 overflow-hidden" style="background:rgba(255,255,255,.15)">
      <div id="sim-bar" class="h-full rounded-full" style="width:4%; background:linear-gradient(90deg,#00c4ff,#7fe3ff); box-shadow:0 0 12px rgba(0,196,255,.8); transition:width .25s"></div>
    </div>
    <p id="sim-pct" class="text-white font-display font-extrabold text-sm mt-2.5">0%</p>
    <p id="sim-step" class="text-white/55 text-xs mt-1">${SIM_STEPS[0]}</p>`;
  document.body.appendChild(div);
  let p = 0, i = 0;
  const iv = setInterval(() => {
    p = Math.min(100, p + 6 + Math.random() * 8);
    const bar = $('sim-bar'), pct = $('sim-pct'), step = $('sim-step');
    if (bar) { bar.style.width = p + '%'; pct.textContent = Math.round(p) + '%'; }
    if (p > (i + 1) * 25 && i < SIM_STEPS.length - 1) { i++; if (step) step.textContent = SIM_STEPS[i]; }
    if (p >= 100) clearInterval(iv);
  }, 150);
  return () => { clearInterval(iv); div.remove(); };
}

// ---------- Màn chúc mừng toàn trang khi thăng cấp (thiết kế Stitch) ----------
function showLevelUp(level) {
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-[70] flex flex-col items-center justify-center text-center px-8';
  div.style.background = 'radial-gradient(circle at 50% 30%, rgba(253,161,39,.2), transparent 48%), linear-gradient(160deg,#0b1420,#033337)';
  div.innerHTML = `
    <p class="text-8xl animate-float" style="filter:drop-shadow(0 0 34px rgba(253,161,39,.85))">🏆</p>
    <h2 class="font-display font-extrabold text-3xl text-white mt-8 leading-tight">${T(`Tuyệt vời! Đội đạt<br><span style="color:#fda127; text-shadow:0 0 20px rgba(253,161,39,.6)">Cấp ${level}</span>`, `Great job! Your team reached<br><span style="color:#fda127; text-shadow:0 0 20px rgba(253,161,39,.6)">Level ${level}</span>`)}</h2>
    <p class="text-white/60 text-sm mt-3 max-w-xs">${T('Bạn đã mở khóa thêm sức mạnh mới. Hãy trải nghiệm ngay để nâng cao hiệu quả điều hành của đội.', "You've unlocked new power. Put it to use now to run your team even better.")}</p>
    <button id="lvl-close" class="clay-btn font-display font-extrabold text-white text-sm px-12 py-4 mt-9" style="background:linear-gradient(90deg,#00a2d8,#fda127)">${T('Bắt đầu ngay', 'Get started')}</button>`;
  document.body.appendChild(div);
  createConfetti();
  playEventSting('good');
  div.querySelector('#lvl-close').addEventListener('click', () => div.remove());
}

// ---------- Sổ tay hướng dẫn (User Manual – thiết kế Stitch) ----------
function MANUAL() { return {
  start: { icon: '🚀', name: T('Bắt đầu', 'Getting Started'), html: `
    <img src="assets/illustrations/game/team-portrait.webp" alt="${T('Đội ngũ đất sét BizOn', 'The BizOn clay-style team')}" class="w-full h-36 object-cover rounded-2xl mb-4">
    <p class="text-sm text-deep-teal/75 mb-4">${T('Chào mừng bạn đến với BizOn – môi trường mô phỏng kinh doanh 3D. ⏱️ Thời lượng: cả ván 6 vòng ≈ 30–45 phút (mỗi vòng 5–7 phút gồm đọc biến cố, họp đội, chốt quyết định và xem đấu trường); bản Go Global 4 quý ≈ 10–15 phút. Ba bước thiết lập:', 'Welcome to BizOn – a 3D business simulation. ⏱️ Duration: a full 6-round match ≈ 30–45 minutes (5–7 minutes per round: read the event, team huddle, lock in decisions, watch the arena); the 4-quarter Go Global version ≈ 10–15 minutes. Three setup steps:')}</p>
    ${[['1', T('Lập đội & chọn vai trò', 'Form your team & pick a role'), T('Đăng nhập với tên đội (cũng là tên doanh nghiệp của bạn), Class ID (nếu học trên lớp) và chọn vai trò CEO · CFO · CMO · COO · SEC. Doanh nghiệp là xưởng đồ chơi đất sét – sản phẩm chủ lực «Bộ linh vật đất sét Việt».', 'Sign in with your team name (also your company name), a Class ID if you\'re in a class, and pick a role: CEO · CFO · CMO · COO · SEC. Your company is a handcraft clay-toy workshop – flagship product: the "Vietnamese Clay Mascot Set".')],
       ['2', T('Nhận vốn khởi điểm', 'Get your starting capital'), T('Mỗi đội bắt đầu với 500tr₫ vốn giảng viên cấp. Giữ ít nhất 15% dự phòng cho biến cố!', 'Every team starts with 500m₫ in instructor-issued capital. Keep at least 15% in reserve for events!')],
       ['3', T('Vào vòng 1', 'Enter Round 1'), T('Đọc biến cố thị trường, hỏi Lumina AI, rồi vào Quyết định để chốt kế hoạch đầu tiên.', 'Read the market event, ask Lumina AI, then go to Decisions to lock in your first plan.')]].map(([n, t, d]) => `
    <div class="clay-card p-4 mb-3 flex gap-3.5 items-start"><span class="w-9 h-9 shrink-0 rounded-full bg-primary-container/30 text-primary font-display font-extrabold flex items-center justify-center">${n}</span>
      <div><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div></div>`).join('')}` },
  ai: { icon: '⚔️', name: T('Đối thủ AI', 'AI Rivals'), html: `
    <p class="text-sm text-deep-teal/75 mb-4">${T('Ba đối thủ AI mô phỏng ba chiến lược kinh điển. Mỗi vòng, chúng tự định giá và chi marketing quanh mức đặc trưng (dao động ±12%), rồi cạnh tranh giành thị phần bằng đúng công thức sức hút của bạn: giá thấp hơn giá tham chiếu, marketing hiệu quả và thương hiệu tích lũy.', 'Three AI rivals model three classic strategies. Each round they set their own price and marketing spend around a characteristic level (±12% variance), then compete for market share using the exact same attractiveness formula as you: price below the reference price, effective marketing, and accumulated brand.')}</p>
    ${[['🐺 Alpha Dynamics', T('Giá rẻ tốc chiến', 'Fast, cheap and aggressive'), T('Giá ~125k · marketing ~90tr. Mạnh khi thị trường nhạy giá (biến cố Price War càng lợi cho họ).', 'Price ~125k · marketing ~90m. Strong when the market is price-sensitive (a Price War event favors them even more).'), T('Khắc chế: đừng đua xuống đáy – giữ biên, xây Brand Loyalty ≥70% để khách không rời đi.', 'Counter: don\'t race to the bottom – protect your margin, build Brand Loyalty ≥70% so customers stay.')],
       ['🐘 Mekong Ventures', T('Cân bằng chắc chắn', 'Steady and balanced'), T('Giá ~150k · marketing ~60tr. Ổn định, ít bứt phá, ít sai lầm.', 'Price ~150k · marketing ~60m. Stable, rarely surges, rarely makes mistakes.'), T('Khắc chế: tận dụng biến cố tốt (Cơ Hội Vàng, Hóa Rồng) – họ không tăng tốc theo thị trường.', 'Counter: capitalize on good events (Golden Opportunity, Dragon Ascension) – they don\'t accelerate with the market.')],
       ['🦚 Star Clay Co.', T('Cao cấp thương hiệu', 'Premium and brand-led'), T('Giá ~195k · marketing ~75tr. Hưởng lợi lớn ở vòng 6 khi thương hiệu được nhân trọng số ×1.5.', 'Price ~195k · marketing ~75m. Gains the most in round 6, when brand gets a ×1.5 weight multiplier.'), T('Khắc chế: chiếm phân khúc phổ thông, hoặc đầu tư R&D + ESG để đấu trực diện phân khúc sang.', 'Counter: capture the mass-market segment, or invest in R&D + ESG to compete head-on in the premium segment.')]].map(([n, s2, p, c]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${n} <span class="text-primary">· ${s2}</span></p>
      <p class="text-xs text-deep-teal/60 mt-1">${p}</p><p class="text-xs font-semibold text-emerald-700 mt-1">${c}</p></div>`).join('')}
    <p class="text-[11px] text-deep-teal/50 mt-2">${T('📌 Giảng viên: hành vi AI là tất định (cùng seed đội → cùng kết quả), tiện chấm điểm & so sánh giữa các đội. Chi tiết trong tài liệu giảng viên trên GitHub.', '📌 For instructors: AI behavior is deterministic (same team seed → same outcome), which makes grading and cross-team comparison easy. Details in the instructor documentation on GitHub.')}</p>` },
  roles: { icon: '👥', name: T('Vai trò & Đội ngũ', 'Roles & Team'), html: `
    <img src="assets/illustrations/game/boardroom-lumina.webp" alt="${T('Đội C-suite họp cùng cố vấn Lumina', 'The C-suite team meeting with advisor Lumina')}" class="w-full h-36 object-cover rounded-2xl mb-4">
    <p class="text-sm text-deep-teal/75 mb-4">${T('Sự phối hợp giữa 5 vị trí cốt lõi là chìa khóa thành công:', 'Coordination across the 5 core roles is the key to success:')}</p>
    ${[['CEO', T('Quyết định', 'Decisions'), T('Định hướng chiến lược, duyệt ngân sách cuối cùng và chốt hạ quyết định.', 'Sets strategic direction, gives final budget approval, and locks in the decision.'), T('🤝 Làm việc chặt với CFO trước khi chốt số.', '🤝 Works closely with the CFO before finalizing numbers.')],
       ['CFO', T('Tài chính', 'Finance'), T('Quản lý dòng tiền, phân bổ vốn, phân tích lỗ lãi và nguồn vốn vay.', 'Manages cash flow, allocates capital, analyzes P&L, and handles borrowing.'), T('🔄 Cấp ngân sách cho CMO & COO.', '🔄 Allocates budget to the CMO & COO.')],
       ['CMO', T('Thị trường', 'Marketing'), T('Quảng cáo, nghiên cứu đối thủ, định giá và giành thị phần.', 'Advertising, competitor research, pricing, and winning market share.'), T('📈 Đẩy doanh số, báo cáo cho CEO.', '📈 Drives sales, reports to the CEO.')],
       ['COO', T('Vận hành', 'Operations'), T('Tối ưu sản xuất, quản lý tồn kho, bảo trì và nhân công.', 'Optimizes production, manages inventory, maintenance, and staffing.'), T('📦 Đồng bộ sản lượng với CMO.', '📦 Syncs output with the CMO.')],
       ['SEC', T('Thư ký', 'Secretary'), T('Ghi chép, nhắc thời hạn, quản trị thông tin và điều phối toàn đội.', 'Keeps minutes, tracks deadlines, manages information, and coordinates the whole team.'), T('🔔 Điều phối toàn bộ team.', '🔔 Coordinates the entire team.')]].map(([r, tag, d, i]) => `
    <div class="clay-card p-4 mb-3"><div class="flex items-center gap-2 mb-1"><p class="font-display font-extrabold text-primary">${r}</p><span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full risk-low">${tag}</span></div>
      <p class="text-xs text-deep-teal/70">${d}</p><p class="text-[11px] font-bold text-deep-teal/50 mt-1.5">${i}</p></div>`).join('')}` },
  rounds: { icon: '🎮', name: T('Cách chơi theo vòng', 'How a Round Works'), html: `
    <img src="assets/illustrations/game/table-model.webp" alt="${T('Đội phân tích mô hình kinh doanh quanh bàn', 'The team analyzing a business model around the table')}" class="w-full h-36 object-cover rounded-2xl mb-4">
    <p class="text-sm text-deep-teal/75 mb-4">${T('Mỗi vòng là một chu trình 6 bước:', 'Each round is a 6-step cycle:')}</p>
    ${[[T('Phân tích báo cáo', 'Review the report'), T('Đánh giá tài chính, thị phần từ vòng trước.', 'Assess finances and market share from the previous round.'), T('💡 Chú ý dòng tiền và hàng tồn kho.', '💡 Watch cash flow and inventory.')],
       [T('Thảo luận đội', 'Team huddle'), T('Thống nhất chiến lược dựa trên dữ liệu.', 'Agree on a strategy based on the data.'), T('💡 Phân công vai trò rõ ràng.', '💡 Assign roles clearly.')],
       [T('Nhập quyết định', 'Enter decisions'), T('Giá bán, Marketing, Sản lượng, R&D, Nhân sự, Nguồn vốn.', 'Price, Marketing, Production, R&D, Staffing, Funding.'), T('⚠️ Kiểm tra kỹ số liệu trước khi Commit.', '⚠️ Double-check the numbers before committing.')],
       [T('Theo dõi kết quả', 'Watch the outcome'), T('Hệ thống mô phỏng và trả kết quả tức thì.', 'The engine simulates and returns results instantly.'), T('💡 So sánh dự báo với thực tế.', '💡 Compare the forecast with what actually happened.')],
       [T('Đối phó biến cố', 'Handle the event'), T('Price War, khủng hoảng năng lượng, chuỗi cung ứng…', 'Price War, energy crisis, supply chain…'), T('💡 Luôn giữ dự phòng tiền mặt.', '💡 Always keep a cash reserve.')],
       [T('Tổng kết', 'Wrap up'), T('Xem xếp hạng, rút kinh nghiệm cho vòng sau.', 'Check the leaderboard, learn for the next round.'), T('💡 SEC ghi chép bài học vào Nhật ký đội.', '💡 The SEC logs lessons in the Team Journal.')]].map(([t, d, tip], i) => `
    <div class="clay-card p-4 mb-3 flex gap-3.5 items-start"><span class="w-9 h-9 shrink-0 rounded-full font-display font-extrabold flex items-center justify-center text-white" style="background:#00c4ff; box-shadow:0 3px 0 #0095c2">${i + 1}</span>
      <div><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p><p class="text-[11px] font-semibold text-amber-700 mt-1">${tip}</p></div></div>`).join('')}
    <div class="clay-card p-4 mb-2 border-2 border-clay-gold/50">
      <p class="font-bold text-sm text-deep-teal">${T('📐 Ví dụ một vòng mẫu (minh họa)', '📐 A worked example round (illustrative)')}</p>
      <p class="text-xs text-deep-teal/70 mt-1 leading-relaxed">${T('Đặt <b>giá 150.000₫</b> (bằng giá tham chiếu), <b>marketing 60 triệu₫</b>, <b>sản lượng 4.000 bộ</b>. Mỗi bộ lời ~<b>90.000₫</b> trước chi phí cố định (giá 150k − chi phí biến đổi ~60k). Cả thị trường cầu ~<b>12.000 bộ/vòng</b> chia cho bạn và 3 đối thủ AI — nếu sức hút ngang mức trung bình, thị phần ~<b>25%</b> (~3.000 bộ), doanh thu ~<b>450 triệu₫</b>, gộp lãi ~<b>270 triệu₫</b> trước chi phí cố định + marketing.', 'Set <b>price at 150,000₫</b> (equal to the reference price), <b>marketing at 60 million₫</b>, <b>production at 4,000 units</b>. Each unit earns ~<b>90,000₫</b> before fixed costs (price 150k − variable cost ~60k). Total market demand is ~<b>12,000 units/round</b>, split between you and 3 AI rivals — at average attractiveness, that\'s ~<b>25% share</b> (~3,000 units), revenue ~<b>450 million₫</b>, gross profit ~<b>270 million₫</b> before fixed costs + marketing.')}</p>
      <p class="text-xs font-semibold text-emerald-700 mt-1.5">${T('🚩 Muốn cắm cờ: cần thị phần cao nhất trong 4 đội — thử hạ giá về ~140k <i>hoặc</i> tăng marketing, nhưng luôn giữ lãi dương và ≥15% tiền dự phòng.', '🚩 To claim the flag: you need the highest share among the 4 teams — try dropping price to ~140k <i>or</i> raising marketing, but always keep profit positive and ≥15% cash in reserve.')}</p>
    </div>` },
  lumina: { icon: '🤖', name: T('Cố vấn AI Lumina', 'Lumina AI Advisor'), html: `
    <img src="assets/illustrations/game/lumina-vortex.webp" alt="${T('Lumina AI đồng hành cùng đội', 'Lumina AI accompanying the team')}" class="w-full h-36 object-cover rounded-2xl mb-4">
    <div class="clay-card p-4 mb-4 flex gap-3 items-center"><img src="assets/character/lumina-vest.webp" alt="" class="w-12 h-12 rounded-full object-cover" style="object-position:50% 14%"><p class="text-xs text-deep-teal/75">${T('Hương là trợ lý AI cá nhân của đội – trò chuyện được bằng giọng nói tiếng Việt trong tab Lumina.', 'Hương is your team\'s personal AI assistant – you can talk to her by voice in Vietnamese in the Lumina tab.')}</p></div>
    ${[[T('📊 Phân tích dữ liệu', '📊 Data analysis'), T('Kịch bản tối ưu theo mục tiêu tài chính; mô phỏng "Nếu – Thì" trước khi Commit (2 lượt/vòng).', 'Optimal scenarios tailored to your financial goals; "What-If" simulations before you Commit (2 uses/round).')],
       [T('🔮 Dự đoán thị trường', '🔮 Market forecasting'), T('Cảnh báo rủi ro (đỏ/cam) hoặc cơ hội (xanh ngọc) theo từng vai trò CFO · COO · CMO · SEC.', 'Risk warnings (red/amber) or opportunities (teal) tailored to each role: CFO · COO · CMO · SEC.')],
       [T('🛟 Phòng ngừa khủng hoảng', '🛟 Crisis preparedness'), T('Kịch bản ứng phó khi thị trường biến động mạnh; lời khuyên khẩn cấp khi thanh khoản đỏ.', 'Response playbooks for sharp market swings; emergency advice when liquidity turns red.')]].map(([t, d]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div>`).join('')}` },
  tips: { icon: '💡', name: T('Mẹo & Thủ thuật', 'Tips & Tricks'), html: `
    <img src="assets/illustrations/game/sen-shield.webp" alt="${T('Lumina dựng khiên sen bảo vệ đội khi thị trường biến động', 'Lumina raising a lotus shield to protect the team when the market turns volatile')}" class="w-full h-36 object-cover rounded-2xl mb-4">
    ${[[T('👑 Chiến thuật CEO', '👑 CEO tactics'), T('Luôn tham khảo CFO trước khi chốt số. Một quyết định đầu tư lớn thiếu kiểm soát chi phí có thể dẫn đến phá sản.', 'Always check with the CFO before finalizing numbers. A large investment decision without cost control can lead to bankruptcy.')],
       [T('🏭 Tối ưu sản xuất', '🏭 Production optimization'), T('Đừng mở rộng quá nhanh – kiểm tra báo cáo khấu hao và bảo trì máy móc đúng lúc.', 'Don\'t expand too fast – check depreciation reports and maintain machinery on time.')],
       [T('📣 Chiếm lĩnh thị trường', '📣 Winning the market'), T('Dùng Lumina AI dự báo xu hướng trước khi tung chiến dịch Marketing lớn.', 'Use Lumina AI to forecast trends before launching a big Marketing campaign.')],
       [T('🛡️ Quản lý rủi ro', '🛡️ Risk management'), T('Giữ ít nhất 15% vốn dự phòng. Không bao giờ đầu tư hết tiền mặt vào một vòng.', 'Keep at least 15% of capital in reserve. Never invest all your cash in a single round.')]].map(([t, d]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div>`).join('')}
    <p class="font-display font-extrabold text-deep-teal text-sm mt-5 mb-2">⚡ Quick Wins</p>
    ${[T('Dành 5 phút đầu vòng đọc bản tin Thị trường sống – nó chứa manh mối về đối thủ.', 'Spend the first 5 minutes of a round reading the Market Pulse feed – it holds clues about your rivals.'),
       T('Pin Mặt Trời hoàn vốn ~2 vòng và kháng khủng hoảng năng lượng vòng 4.', 'Solar Panels pay back in ~2 rounds and cushion the round-4 energy crisis.'),
       T('Điều chỉnh giá linh hoạt theo độ nhạy của thị trường – đừng giữ nguyên giá cả 6 vòng.', 'Adjust price flexibly to match market sensitivity – don\'t hold the same price for all 6 rounds.')].map(t => `
    <div class="clay-sunken rounded-2xl p-3 mb-2 flex gap-2 items-start"><span class="text-primary font-bold">✓</span><p class="text-xs text-deep-teal/75">${t}</p></div>`).join('')}` },
  world: { icon: '🌏', name: T('Hệ sinh thái BizOn', 'The BizOn Ecosystem'), html: `
    <img src="assets/illustrations/game/bridge-music.webp" alt="${T('Đội bước qua cầu ra thế giới', 'The team crossing a bridge to the world')}" class="w-full h-36 object-cover rounded-2xl mb-4">
    <p class="text-sm text-deep-teal/75 mb-4">${T('BizOn không chỉ có 6 vòng trong nước – cả một hệ sinh thái đang chờ bạn:', 'BizOn is more than 6 domestic rounds – a whole ecosystem is waiting for you:')}</p>
    ${[[T('🗺️ Bản đồ chinh phục', '🗺️ Conquest map'), T('Mỗi vòng thắng thị phần là một lá cờ 🚩 cắm lên bản đồ Việt Nam – từ Cần Thơ tới cột cờ Lũng Cú, kèm hai quần đảo Hoàng Sa & Trường Sa.', 'Every round you win market share plants a flag 🚩 on the map of Vietnam – from Cần Thơ to the Lũng Cú flagpole, including the Hoàng Sa & Trường Sa archipelagos.')],
       [T('🌏 BizOn Go Global', '🌏 BizOn Go Global'), T('Ra biển lớn: khai hồ sơ doanh nghiệp, chọn 1 trong 7 thị trường, đàm phán với đối tác bản địa, chọn phương thức thâm nhập (Export · Licensing · Liên doanh · FDI) và kinh doanh 4 quý. Có IE Lab mô phỏng số liệu và nút xuất nhật ký CSV để nộp giảng viên.', 'Head out to the wider world: file your company profile, pick 1 of 7 markets, negotiate with a local partner, choose an entry mode (Export · Licensing · Joint Venture · FDI), and run 4 quarters of business. Includes an IE Lab for number-crunching and a CSV log export to submit to your instructor.')],
       [T('🕹️ BizOn Arcade', '🕹️ BizOn Arcade'), T('Các mini-game phản xạ 30–60 giây: Clay Factory Frenzy, Trắc nghiệm Khởi nghiệp, Đoán Giá, Bắt Vốn Vàng.', '30–60 second reflex mini-games: Clay Factory Frenzy, Entrepreneurship Quiz, Guess the Price, Catch the Golden Capital.')],
       [T('📚 Thư viện & 🎶 Kho Âm nhạc', '📚 Library & 🎶 Music Vault'), T('Tạo hình nhân vật, sản phẩm cài áo, và toàn bộ ca khúc gốc với trình phát đầy đủ – mở từ Cài đặt hoặc Trang chủ.', 'Character art, product lineup, and the full original soundtrack with a full player – open from Settings or the Home page.')]].map(([t, d]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div>`).join('')}` },
  glossary: { icon: '📚', name: T('Thuật ngữ dễ hiểu', 'Plain-Language Glossary'), html: `
    <p class="text-sm text-deep-teal/75 mb-4">${T('Các thuật ngữ hay gặp trong game, giải thích bằng một câu:', 'Common in-game terms, explained in one sentence:')}</p>
    ${[[T('Thị phần (%)', 'Market Share (%)'), T('Miếng bánh khách hàng của bạn – trong 12.000 sp cầu thị trường mỗi chu kỳ, bạn bán được bao nhiêu %.', 'Your slice of the customer pie – out of 12,000 units of market demand each cycle, what % you sell.')],
       [T('Giá bán đề xuất (150k)', 'Reference Price (150k)'), T('Mức giá "chuẩn" thị trường – bán rẻ hơn thì hút khách, đắt hơn thì mất khách (mức độ theo độ co giãn giá 1.8).', 'The market\'s "standard" price – price below it to attract customers, above it and you lose them (governed by a price elasticity of 1.8).')],
       [T('Biên lợi nhuận', 'Profit Margin'), T('Tiền lời trên mỗi sản phẩm = giá bán − chi phí (~60k/sp). Giá 150k → lời ~90k/sp trước chi phí cố định.', 'Profit per unit = price − cost (~60k/unit). At a 150k price → ~90k/unit profit before fixed costs.')],
       [T('Hòa vốn (CVP)', 'Break-even (CVP)'), T('Số sản phẩm phải bán để bù hết chi phí cố định + marketing + R&D. Bán ít hơn mức này là lỗ.', 'The number of units you must sell to cover fixed costs + marketing + R&D. Sell fewer than this and you\'re losing money.')],
       ['OEE', T('Điểm sức khỏe dây chuyền (0–100%): máy chạy đều, ít hỏng, ít phế phẩm. Dưới 60% là báo động.', 'Your production line\'s health score (0–100%): smooth uptime, few breakdowns, low scrap. Below 60% is a red flag.')],
       ['Quick Ratio', T('Khả năng trả nợ ngay bằng tiền mặt – dưới 1.0 nghĩa là chi kế hoạch đang vượt tiền trong két.', 'Your ability to pay short-term debts with cash on hand right now – below 1.0 means planned spending is outrunning cash in the vault.')],
       [T('Điểm thương hiệu (Brand Score)', 'Brand Score'), T('Uy tín tích lũy qua các chu kỳ – nhân sức hút của bạn, đặc biệt chu kỳ 6 (trọng số ×1.5).', 'Reputation accumulated across cycles – multiplies your attractiveness, especially in cycle 6 (×1.5 weight).')],
       [T('Khấu hao', 'Depreciation'), T('Máy móc "mòn" theo công suất – đầu tư càng lớn, chi phí cố định mỗi vòng càng cao.', 'Machinery "wears down" with output – the bigger the investment, the higher your fixed cost each round.')]].map(([t, d]) => `
    <div class="clay-card p-4 mb-2.5"><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div>`).join('')}` },
  trouble: { icon: '🔧', name: T('Xử lý sự cố', 'Troubleshooting'), html: `
    ${[[T('📶 Kiểm tra mạng', '📶 Check your connection'), T('BizOn chạy offline sau lần tải đầu (PWA) – nhưng lần đầu cần Wi-Fi hoặc 4G/5G ổn định.', 'BizOn runs offline after the first load (PWA) – but the first load needs stable Wi-Fi or 4G/5G.')],
       [T('🔄 Làm mới ứng dụng', '🔄 Refresh the app'), T('Đóng hoàn toàn và mở lại BizOn. Nếu đã cài lên màn hình chính, đóng hẳn app để nhận bản cập nhật mới.', 'Fully close and reopen BizOn. If it\'s installed on your home screen, close the app completely to get the latest update.')],
       [T('🧹 Xóa dữ liệu cũ', '🧹 Clear old data'), T('Nếu giao diện hiển thị lạ sau bản cập nhật: Cài đặt → Chơi lại từ đầu (Reset) – lưu ý sẽ mất tiến trình.', 'If the UI looks wrong after an update: Settings → Start Over (Reset) – note this will erase your progress.')],
       [T('🐞 Liên hệ hỗ trợ', '🐞 Contact support'), T('Dùng nút "Gửi báo cáo lỗi" trong Cài đặt nếu vấn đề tiếp diễn.', 'Use the "Send bug report" button in Settings if the problem persists.')]].map(([t, d]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div>`).join('')}` },
}; }
function showManual(sec) {
  const old = document.getElementById('manual-overlay');
  if (old) old.remove();
  const div = document.createElement('div');
  div.id = 'manual-overlay';
  div.dataset.sec = sec || '';
  div.className = 'fixed inset-0 z-[65] bg-surface-bright overflow-y-auto';
  const manual = MANUAL();
  const body = sec && manual[sec]
    ? `<button onclick="showManual()" class="clay-btn bg-white text-deep-teal text-xs font-bold px-4 py-2 mb-4">${T('← Sổ tay', '← Handbook')}</button>
       <h2 class="font-display font-extrabold text-deep-teal text-2xl mb-4">${manual[sec].icon} ${manual[sec].name}</h2>${manual[sec].html}`
    : `<div class="text-center mb-6">
         <h2 class="font-display font-extrabold text-primary text-2xl">${T('📖 Sổ tay hướng dẫn', '📖 User Manual')}</h2>
         <p class="text-sm text-deep-teal/60 mt-1">${T('Mọi thứ bạn cần để vận hành BizOn mượt mà.', 'Everything you need to run BizOn smoothly.')}</p>
       </div>
       <div class="grid grid-cols-2 gap-3">
         ${Object.entries(manual).map(([k, m]) => `
         <button onclick="showManual('${k}')" class="clay-card p-4 text-left">
           <span class="w-12 h-12 clay-sunken rounded-full flex items-center justify-center text-2xl mb-3">${m.icon}</span>
           <p class="font-display font-bold text-primary text-sm">${m.name}</p>
         </button>`).join('')}
       </div>`;
  div.innerHTML = `
    <div class="max-w-md mx-auto px-5 py-6 pb-24">
      <div class="flex justify-between items-center mb-5">
        <div class="flex items-center gap-2"><img src="assets/icons/icon-192.png" alt="" class="w-8 h-8 rounded-lg"><span class="font-display font-extrabold text-primary">BizOn</span></div>
        <button onclick="document.getElementById('manual-overlay').remove()" class="clay-btn bg-white w-9 h-9 rounded-full text-deep-teal font-bold">✕</button>
      </div>
      ${body}
    </div>`;
  document.body.appendChild(div);
  div.scrollTop = 0;
}

// ---------- BizOn Premium – luồng nâng cấp tài khoản (thiết kế Stitch) ----------
function showPremium() {
  const requested = localStorage.getItem('bizon-premium') === 'requested';
  const div = document.createElement('div');
  div.id = 'premium-overlay';
  div.className = 'fixed inset-0 z-[70] overflow-y-auto';
  div.style.background = 'radial-gradient(circle at 50% 18%, rgba(253,161,39,.22), transparent 42%), linear-gradient(160deg,#0b1420,#033337)';
  div.innerHTML = `
    <div class="min-h-full flex flex-col items-center justify-center text-center px-8 py-12">
      <p class="text-7xl animate-float" style="filter:drop-shadow(0 0 30px rgba(253,161,39,.85))">👑</p>
      <h2 class="font-display font-extrabold text-3xl text-white mt-6">BizOn <span style="color:#fda127">Premium</span></h2>
      <p class="text-white/60 text-sm mt-2 max-w-xs">${T('Dành cho giảng viên & trường học – mở khóa toàn bộ sức mạnh quản trị lớp học.', 'For instructors & schools – unlock the full power of classroom management.')}</p>
      <div class="w-full max-w-sm text-left mt-7 space-y-2.5">
        ${[T('🏫 Lớp học không giới hạn số đội', '🏫 Unlimited teams per class'), T('📊 Xuất báo cáo tổng kết & chứng chỉ PDF', '📊 Export summary reports & PDF certificates'), T('🎛️ Chế độ giảng viên nâng cao (khóa vòng, cấp vốn, biến cố tùy chỉnh)', '🎛️ Advanced instructor mode (lock rounds, grant funds, custom events)'), T('📈 Bảng phân tích hiệu suất từng thành viên', '📈 Per-member performance analytics'), T('🤝 Hỗ trợ ưu tiên & tùy biến thương hiệu trường', "🤝 Priority support & your school's branding")].map(f => `
        <div class="clay-card p-3.5 flex items-center gap-3 text-sm font-semibold text-deep-teal">${f}</div>`).join('')}
      </div>
      ${requested
        ? `<div class="clay-card p-4 mt-7 max-w-sm flex items-center gap-3"><p class="text-3xl">✅</p><p class="text-sm text-deep-teal font-semibold text-left">${T('Yêu cầu đã gửi! Quản trị viên sẽ phê duyệt và cấp quyền cho tài khoản của bạn.', "Request sent! An administrator will approve and grant access to your account.")}</p></div>`
        : `<button id="prem-req" class="clay-btn font-display font-extrabold text-white text-sm px-12 py-4 mt-8" style="background:linear-gradient(90deg,#fda127,#e8762d)">${T('👑 Gửi yêu cầu nâng cấp', '👑 Send upgrade request')}</button>`}
      <button id="prem-close" class="text-white/50 text-xs font-bold mt-5 underline">${T('Đóng', 'Close')}</button>
    </div>`;
  document.body.appendChild(div);
  div.querySelector('#prem-close').addEventListener('click', () => div.remove());
  const req = div.querySelector('#prem-req');
  if (req) req.addEventListener('click', () => {
    localStorage.setItem('bizon-premium', 'requested');
    div.remove();
    createConfetti();
    playEventSting('good');
    const ok = document.createElement('div');
    ok.className = 'fixed inset-0 z-[70] flex flex-col items-center justify-center text-center px-8';
    ok.style.background = 'radial-gradient(circle at 50% 30%, rgba(253,161,39,.2), transparent 48%), linear-gradient(160deg,#0b1420,#033337)';
    ok.innerHTML = `
      <p class="text-8xl animate-float" style="filter:drop-shadow(0 0 34px rgba(253,161,39,.85))">🏆</p>
      <h2 class="font-display font-extrabold text-3xl text-white mt-8 leading-tight">${T('Tuyệt vời! Yêu cầu<br><span style="color:#fda127">đã được gửi</span>', 'Great! Your request<br><span style="color:#fda127">has been sent</span>')}</h2>
      <p class="text-white/60 text-sm mt-3 max-w-xs">${T('Quản trị viên sẽ phê duyệt và cấp quyền Premium cho bạn. Trong lúc chờ, hãy tiếp tục chinh phục TOP 1 thị phần nhé!', 'An administrator will approve and grant you Premium access. While you wait, keep pushing for the #1 market share!')}</p>
      <button class="clay-btn font-display font-extrabold text-white text-sm px-12 py-4 mt-9" style="background:linear-gradient(90deg,#00a2d8,#fda127)" onclick="this.parentElement.remove()">${T('Bắt đầu ngay', 'Get started')}</button>`;
    document.body.appendChild(ok);
  });
}

// ---------- Nhạc nền game «Bật Nghiệp» ----------
// Tuyển tập riêng: ca khúc chủ đề Việt Nam, anthem đội chơi, và tuyến ca khúc
// «Je m'appelle Hương sans frontières» – tuyến này kể chặng vươn ra thế giới nên
// hợp với phần cuối ván chơi. Nhạc của Hộ Chiếu Thương Hiệu vẫn để riêng bên
// brand-passport.html, không trộn vào đây.
const BGM_TRACKS = [
  'assets/audio/huong-and-the-world-en.mp3', // BÀI CHÍNH khi mở game — Hương & The World (bản tiếng Anh)
  'assets/audio/bat-nghiep-mekong-sunfire-rise.mp3', // Mekong Sunfire · Rise With The River
  'assets/audio/bat-nghiep-co-loi.mp3',   // ca khúc chủ đề, bản thu có lời
  'assets/audio/bat-nghiep-rap-symphony.mp3', // bản rap symphony
  'assets/audio/bat-nghiep-mekong-sunfire-2.mp3', // remix Mekong Sunfire – bản đề xuất
  'assets/audio/bat-nghiep-mekong-sunfire.mp3',
  'assets/audio/bat-nghiep.mp3',        // bản instrumental, ngắn hơn
  'assets/audio/huong-vuon-ra-the-gioi.mp3',
  'assets/audio/huong-sans-frontieres-2.mp3',
  'assets/audio/bizon-theme.mp3',
  'assets/audio/huong-on-return.mp3',
  'assets/audio/huong-on-return-remix.mp3',
  'assets/audio/vua-du-de-bay-cao.mp3',
  'assets/audio/doi-phu-sa.mp3',
  'assets/audio/doi-phu-sa-remix.mp3',
  'assets/audio/doi-phu-sa-remix2.mp3',
];
let bgm = null, bgmIdx = 0;
function musicEnabled() { return localStorage.getItem('bizon-music') !== 'off'; }
function ensureBgm(src) {
  if (!bgm) {
    bgm = new Audio(src || BGM_TRACKS[bgmIdx]); bgm.volume = 0.22;
    bgm.addEventListener('ended', () => {
      bgmIdx = (bgmIdx + 1) % BGM_TRACKS.length;
      bgm.src = BGM_TRACKS[bgmIdx];
      if (musicEnabled()) bgm.play().catch(() => {});
    });
  }
  return bgm;
}
function startMusic() {
  if (!musicEnabled()) return;
  ensureBgm().play().catch(() => {});
}
// Kết ván thì chuyển sang bản remix dài nhất của ca khúc chủ đề, đúng lúc màn
// hình mời người chơi ra Go Global. Chỉ đổi một lần mỗi lần mở trang, để xem
// lại báo cáo không làm nhạc nhảy về đầu bài.
let finaleThemePlayed = false;
function playFinaleTheme() {
  if (finaleThemePlayed || !musicEnabled()) return;
  const src = 'assets/audio/bat-nghiep-mekong-sunfire-2.mp3';
  const i = BGM_TRACKS.indexOf(src);
  if (i < 0) return;
  bgmIdx = i;
  const a = ensureBgm(src);
  // Chỉ tua về đầu khi thật sự đổi bài. Nếu bản này đang phát sẵn thì để yên –
  // tua lại giữa chừng nghe như nhạc bị giật.
  if (!a.src.endsWith(src)) { a.src = src; a.currentTime = 0; }
  finaleThemePlayed = true;
  // Trình duyệt chặn phát tự động khi trang chưa nhận thao tác nào. Gặp trường
  // hợp đó thì đánh dấu lại là chưa phát, để lần vẽ báo cáo sau còn thử lại;
  // nếu nhạc đã chạy bằng đường khác thì giữ nguyên, đừng phát chồng.
  a.play().catch(() => { if (a.paused) finaleThemePlayed = false; });
}
function toggleMusic() {
  if (musicEnabled()) { localStorage.setItem('bizon-music', 'off'); if (bgm) bgm.pause(); }
  else { localStorage.setItem('bizon-music', 'on'); startMusic(); }
  const t = $('music-toggle'); if (t) t.checked = musicEnabled();
}
// Trở lại phiên cũ: trình duyệt chặn autoplay – bắt đầu nhạc ở lần chạm đầu tiên
document.addEventListener('pointerdown', function once() {
  document.removeEventListener('pointerdown', once);
  if (S) startMusic();
}, { once: true });

// ---------- Âm thanh kịch tính mở vòng (WebAudio, không cần tệp) ----------
function playEventSting(tone) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = tone === 'bad' ? [[110, 0], [104, .22], [98, .44], [82.4, .7]]      // dồn dập đi xuống – kịch tính
      : tone === 'warn' ? [[196, 0], [185, .2], [196, .4]]
      : [[261.6, 0], [329.6, .16], [392, .32], [523.3, .5]];                          // vui – arpeggio đi lên
    notes.forEach(([f, t]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tone === 'bad' ? 'sawtooth' : 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + (tone === 'bad' ? 0.5 : 0.3));
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.6);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch (e) { /* trình duyệt không hỗ trợ WebAudio */ }
}

// ---------- Giọng nói thật của Hương AI (bản thu + phụ đề SRT) ----------
const HUONG_CUES = [
  [0.03, 0.87, 'Bonjour à tous!'],
  [1.25, 2.01, "Je m'appelle Huong."],
  [2.39, 3.17, 'Xin chào mọi người!'],
  [3.53, 11.2, 'Tôi là Huong.'],
];
let huongAudio = null;
function playHuongIntro() {
  if (!huongAudio) {
    huongAudio = new Audio('assets/audio/huong-intro.mp3');
    huongAudio.addEventListener('timeupdate', () => {
      const t = huongAudio.currentTime;
      const cue = HUONG_CUES.find(c => t >= c[0] && t <= c[1] + 0.2);
      const el = $('huong-caption');
      if (el && cue) el.textContent = '“' + cue[2] + '”';
    });
    huongAudio.addEventListener('ended', () => {
      const box = $('huong-caption-box');
      if (box) setTimeout(() => box.classList.add('hidden'), 600);
      const btn = $('huong-voice-btn');
      if (btn) btn.classList.remove('animate-pulse');
    });
  }
  const box = $('huong-caption-box'), btn = $('huong-voice-btn'), el = $('huong-caption');
  if (el) el.textContent = '';
  if (box) box.classList.remove('hidden');
  if (btn) btn.classList.add('animate-pulse');
  huongAudio.currentTime = 0;
  huongAudio.play().catch(() => {});
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
  playEventSting(ev.tone);   // âm thanh dồn dập/kịch tính mở vòng
  const bad = ev.tone === 'bad', warn = ev.tone === 'warn';
  const tagCls = bad ? 'bg-red-100 text-red-600' : warn ? 'bg-amber-100 text-amber-700' : 'bg-primary-container/25 text-primary';
  const titleCls = bad ? 'text-red-600' : 'text-deep-teal';
  const dirIcon = d => ({ up: '📈', 'up-bad': '📈', down: '📉', 'down-good': '📉', flat: '➖' }[d] || '➖');
  const dirCls = d => (d === 'up' || d === 'down-good') ? 'text-primary' : (d === 'flat' ? 'text-deep-teal' : 'text-red-600');
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-50 bg-surface-bright overflow-y-auto';
  div.innerHTML = `
    <div class="max-w-md mx-auto px-6 py-8 ${ev.shake ? 'animate-shake' : ''}">
      <div class="text-center">
        <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-4 py-1.5 rounded-full ${tagCls}">● ${ev.tag || T('BIẾN CỐ THỊ TRƯỜNG', 'MARKET EVENT')}</span>
        <h1 class="font-display text-3xl font-extrabold ${titleCls} uppercase mt-3 leading-tight">${ev.name}</h1>
        <p class="text-sm text-deep-teal/70 mt-2 max-w-sm mx-auto">${ev.desc}</p>
      </div>
      <div class="grid grid-cols-2 gap-4 mt-5">
        ${(ev.impacts || []).map(im => `
          <div class="clay-raised p-5 text-center flex flex-col items-center gap-1.5">
            <div class="w-12 h-12 rounded-full clay-sunken flex items-center justify-center text-xl">${im.icon}</div>
            <p class="text-[10px] uppercase font-bold text-deep-teal/50 tracking-wide">${im.label}</p>
            <p class="font-display font-extrabold text-2xl ${dirCls(im.dir)}">${dirIcon(im.dir)} ${im.value}</p>
          </div>`).join('')}
      </div>
      <div class="flex items-end gap-3 mt-6">
        <img src="assets/character/${ev.luminaImg || 'lumina-vest'}.webp" alt="Je m'appelle Hương AI Advisor" class="w-28 shrink-0 rounded-2xl object-cover animate-float drop-shadow-xl" style="aspect-ratio:3/4; object-position:50% 8%">
        <div class="relative clay-raised p-4 rounded-bl-none border-l-4 border-primary-container flex-1">
          <div class="speech-tail"></div>
          <p class="text-[10px] font-extrabold text-primary mb-1">JE M'APPELLE HƯƠNG · AI ADVISOR</p>
          <p class="text-sm text-deep-teal italic leading-relaxed">"${ev.luminaMsg}"</p>
        </div>
      </div>
      ${bad ? `
      <div class="clay-raised p-3 mt-3 flex items-center gap-3">
        <img src="assets/character/anh-tu-ao-dai-work-cut.webp" alt="Phan Anh Tú" class="w-11 h-11 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 6%;background:#dbeef7">
        <p class="text-xs text-deep-teal/80 italic">${T('"Bình tĩnh phân tích số liệu trước khi hành động – khủng hoảng luôn ẩn chứa cơ hội cho đội có kỷ luật." – <b class="text-emerald-700">Phan Anh Tú · Cố vấn học thuật</b>', '"Stay calm and read the data before acting – every crisis hides an opportunity for a disciplined team." – <b class="text-emerald-700">Phan Anh Tú · Academic Advisor</b>')}</p>
      </div>` : ''}
      <button id="ev-cta" class="clay-button-primary w-full text-white font-display font-bold text-lg py-4 mt-6">${ev.cta ? ev.cta.label : T('🎯 Nhập quyết định', '🎯 Enter decisions')}</button>
      <button id="ev-close" class="clay-button-secondary w-full text-primary font-display font-bold py-4 mt-3">${T('Về Trung tâm điều hành', 'Back to Command Center')}</button>
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
  playClip('assets/audio/lumina-victory.mp3');
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
        <img src="assets/character/lumina-ao-dai-clap.webp" alt="Lumina chúc mừng" class="w-full h-64 object-cover" style="object-position:50% 15%">
      </div>
      <div class="clay-card p-4 mb-4 text-left">
        <p class="text-sm text-deep-teal italic">${T(`"Thật tuyệt vời thưa ${S.profile.role}! Chiến dịch vừa qua đã tạo nên một cú hích lịch sử. Chúng ta chính thức dẫn đầu thị trường với những con số ấn tượng!"`, `"Wonderful work, ${S.profile.role}! That last campaign was a historic breakthrough. We're now officially leading the market with impressive numbers!"`)}</p>
      </div>
      <span class="inline-block bg-primary-container/25 text-primary text-[11px] font-extrabold px-3 py-1.5 rounded-full">${T('🎊 CHÚC MỪNG CHIẾN THẮNG', '🎊 CONGRATULATIONS ON THE WIN')}</span>
      <h2 class="font-display font-extrabold text-deep-teal text-xl mt-1 mb-3">${T('Thị Phần Đạt Đỉnh Mới!', 'New Market Share Peak!')}</h2>
      <div class="clay-card p-5 mb-3 relative">
        <span class="absolute -top-2 right-4 bg-primary-container text-deep-teal text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-clay">TOP 1 MARKET</span>
        <p class="text-[10px] uppercase font-bold text-deep-teal/50 tracking-widest">Market Share</p>
        <p class="font-display font-extrabold text-deep-teal text-5xl">${r.share.toFixed(1)}<span class="text-2xl">%</span></p>
        <div class="h-3 rounded-full bg-surface-bright overflow-hidden mt-3"><div class="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style="width:${Math.min(100, r.share * 2)}%"></div></div>
        <p class="text-xs text-deep-teal/60 mt-2">${T(`Tăng trưởng ${growth}% so với vòng trước.`, `Grew ${growth}% versus the previous round.`)}</p>
      </div>
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="clay-card p-4"><p class="text-2xl">📈</p><p class="font-display font-extrabold text-deep-teal">+${r.adEff}%</p><p class="text-[10px] text-deep-teal/50 font-semibold">${T('Hiệu quả quảng cáo', 'Ad effectiveness')}</p></div>
        <div class="clay-card p-4"><p class="text-2xl">😊</p><p class="font-display font-extrabold text-deep-teal">${satisfaction}/5</p><p class="text-[10px] text-deep-teal/50 font-semibold">${T('Độ hài lòng thương hiệu', 'Brand satisfaction')}</p></div>
      </div>
      <div class="clay-raised p-3 mb-4 flex items-center gap-3 text-left">
        <img src="assets/character/anh-tu-ao-dai-smile-cut.webp" alt="Phan Anh Tú" class="w-12 h-12 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 5%;background:#dbeef7">
        <p class="text-xs text-deep-teal/80 italic">${T('"Xuất sắc! Đây là minh chứng cho một chiến lược được thực thi kỷ luật." – <b class="text-emerald-700">Phan Anh Tú</b>', '"Excellent! This is proof of a disciplined, well-executed strategy." – <b class="text-emerald-700">Phan Anh Tú</b>')}</p>
      </div>
      <button id="vic-report" class="clay-btn w-full bg-deep-teal text-white font-display font-bold py-4 mb-3">${T('📊 XEM BÁO CÁO CHI TIẾT', '📊 VIEW DETAILED REPORT')}</button>
      <button id="vic-next" class="clay-btn w-full bg-white text-deep-teal font-display font-bold py-4">${T('LẬP KẾ HOẠCH TIẾP THEO', 'PLAN THE NEXT ROUND')}</button>
    </div>`;
  div.querySelector('#vic-report').onclick = () => { div.remove(); showTab('reports'); };
  div.querySelector('#vic-next').onclick = () => { div.remove(); showTab('home'); maybeShowEventIntro(); };
  document.body.appendChild(div);
  createConfetti();
}

// ---------- Navigation ----------
// ---------- Clip giọng Lumina (Bizon_1/Bizon_2 do tác giả thu) ----------
function playClip(src, vol = 0.9) {
  try { const au = new Audio(src); au.volume = vol; au.play().catch(() => {}); } catch (e) {}
}

// ---------- Giọng Lumina thu sẵn (assets/audio/voice/*.mp3) ----------
// Câu thoại Lumina có bản thu người thật → ưu tiên hơn giọng máy (TTS). Phát nối
// tiếp qua một hàng đợi để nhiều câu (VD kết quả vòng) không chồng tiếng lên nhau.
let luminaVoiceEl = null, luminaVoiceQueue = [], voiceBusy = false;
function playVoice(clip) {
  if (!clip || !voiceEnabled) return false;          // tôn trọng nút 🔊 Bật/Tắt như TTS
  luminaVoiceQueue.push('assets/audio/voice/' + clip + '.mp3');
  if (!voiceBusy) drainVoiceQueue();
  return true;
}
function drainVoiceQueue() {
  const src = luminaVoiceQueue.shift();
  if (!src) { voiceBusy = false; return; }
  voiceBusy = true;
  try {
    if ('speechSynthesis' in window) speechSynthesis.cancel();  // đừng để TTS đè lên giọng thu
    luminaVoiceEl = new Audio(src);
    luminaVoiceEl.volume = 0.95;
    luminaVoiceEl.onended = drainVoiceQueue;
    luminaVoiceEl.onerror = drainVoiceQueue;
    luminaVoiceEl.play().catch(drainVoiceQueue);
  } catch (e) { drainVoiceQueue(); }
}

function showTab(tab) {
  // Lời chào cố vấn nay do bản thu chat-02 (renderAdvisorIntro) đọc bằng giọng thật,
  // nên không phát clip chào cũ (lumina-advisor-hello.mp3) để tránh chào hai lần.
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
  renderMissions(); renderMinigame(); renderInstructor(); renderJournal(); renderMarket();
  renderCompanyCard(); renderConquest(); renderTeamCard(); renderOpponents();
  const mt = $('music-toggle'); if (mt) mt.checked = musicEnabled();
}

// ---------- BizOn Monitor (bảng theo dõi thị trường kiểu terminal) ----------
function mmSpark(series, w = 88, hgt = 26) {
  if (!series || series.length < 2) return '<span style="opacity:.35;font-size:9px">–</span>';
  const min = Math.min(...series), max = Math.max(...series), span = (max - min) || 1;
  const pts = series.map((v, i) => `${(i / (series.length - 1) * w).toFixed(1)},${(hgt - 2 - (v - min) / span * (hgt - 4)).toFixed(1)}`).join(' ');
  const up = series[series.length - 1] >= series[0];
  return `<svg viewBox="0 0 ${w} ${hgt}" style="width:${w}px;height:${hgt}px"><polyline points="${pts}" fill="none" stroke="${up ? '#34d399' : '#f87171'}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function renderMonitor() {
  const box = $('market-monitor');
  if (!box) return;
  const H = S.history;
  if (!H.length) {
    box.innerHTML = `<div class="rounded-clay p-5 text-center" style="background:#0d1117;color:#8fa89f;font-family:ui-monospace,Menlo,Consolas,monospace">
      <p style="font-size:11px;letter-spacing:.14em">📊 BIZON MONITOR</p>
      <p style="font-size:11px;margin-top:8px;opacity:.7">${T('Hoàn thành vòng 1 để kích hoạt bảng theo dõi thị trường.', 'Complete round 1 to activate the market monitor.')}</p></div>`;
    return;
  }
  const metrics = [
    { name: T('Thị phần', 'Market Share'),      tag: T('THỊ PHẦN', 'MARKET SHARE'),   s: H.map(r => r.share),        fmt: v => v.toFixed(1) + '%' },
    { name: T('Doanh thu', 'Revenue'),     tag: T('DOANH THU', 'REVENUE'),  s: H.map(r => r.revenue),      fmt: v => money(v) },
    { name: T('Lợi nhuận', 'Profit'),     tag: T('LỢI NHUẬN', 'PROFIT'),  s: H.map(r => r.netProfit),    fmt: v => money(v) },
    { name: T('Ví đội', 'Team Wallet'),        tag: T('DÒNG TIỀN', 'CASH FLOW'),  s: H.map(r => r.balance),      fmt: v => money(v) },
    { name: T('OEE xưởng', 'Factory OEE'),     tag: T('VẬN HÀNH', 'OPERATIONS'),   s: H.map(r => r.oee),          fmt: v => v + '%' },
    { name: 'Brand Loyalty', tag: T('THƯƠNG HIỆU', 'BRAND'), s: H.map(r => r.brandLoyalty), fmt: v => v + '%' },
  ];
  (S.aiHistory || []).length && COMPETITORS.forEach((c, i) => {
    metrics.push({ name: c.name, tag: T('ĐỐI THỦ AI', 'AI RIVAL'), s: (S.aiHistory || []).map(snap => (snap[i] || {}).share || 0), fmt: v => v.toFixed(1) + '%' });
  });

  const pct = m => {
    const n = m.s.length;
    if (n < 2) return null;
    const prev = m.s[n - 2], lastV = m.s[n - 1];
    if (!prev) return null;
    return (lastV - prev) / Math.abs(prev) * 100;
  };
  const withPct = metrics.map(m => ({ ...m, chg: pct(m) }));
  const rated = withPct.filter(m => m.chg !== null);
  const ups = rated.filter(m => m.chg >= 0).length;
  const best = rated.length ? rated.reduce((x, y) => (y.chg > x.chg ? y : x)) : null;
  const worst = rated.length ? rated.reduce((x, y) => (y.chg < x.chg ? y : x)) : null;
  const chip = (label, val, cls) => `<div style="border:1px solid #1f2b33;border-radius:12px;padding:8px 10px;flex:1;min-width:0">
    <p style="font-size:9px;letter-spacing:.14em;color:#8fa89f">${label}</p>
    <p style="font-size:12px;font-weight:700;margin-top:2px;color:${cls};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${val}</p></div>`;

  const rows = withPct.map(m => {
    const lastV = m.s[m.s.length - 1];
    const chgTxt = m.chg === null ? '' : `<span style="color:${m.chg >= 0 ? '#34d399' : '#f87171'}">${m.chg >= 0 ? '+' : ''}${m.chg.toFixed(2)}%</span>`;
    return `<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <div style="flex:1;min-width:0"><p style="font-size:13px;font-weight:700;color:#e8f2ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.name}</p>
        <p style="font-size:8.5px;letter-spacing:.14em;color:#7d948b">${m.tag}</p></div>
      <div style="flex-shrink:0">${mmSpark(m.s)}</div>
      <div style="text-align:right;flex-shrink:0;min-width:64px"><p style="font-size:13px;font-weight:700;color:#e8f2ec">${m.fmt(lastV)}</p>
        <p style="font-size:10px">${chgTxt}</p></div>
    </div>`;
  }).join('');

  box.innerHTML = `<div class="rounded-clay p-4" style="background:#0d1117;color:#dce8e2;font-family:ui-monospace,Menlo,Consolas,monospace;box-shadow:0 10px 30px -5px rgba(0,0,0,.35)">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1f2b33;padding-bottom:8px">
      <p style="font-size:11px;letter-spacing:.18em;font-weight:700">📊 BIZON MONITOR</p>
      <p style="font-size:9px;letter-spacing:.14em;color:#8fa89f">${T('VÒNG', 'ROUND')} ${H.length}/6</p>
    </div>
    <div style="display:flex;gap:8px;margin:12px 0 4px">
      ${chip(T('TĂNG', 'UP'), `${ups}/${rated.length || withPct.length}`, '#34d399')}
      ${chip(T('MẠNH NHẤT', 'STRONGEST'), best ? `${best.name} +${best.chg.toFixed(1)}%` : '–', '#34d399')}
      ${chip(T('YẾU NHẤT', 'WEAKEST'), worst ? `${worst.name} ${worst.chg.toFixed(1)}%` : '–', '#f87171')}
    </div>
    ${rows}
  </div>`;
}

// ---------- Thị trường sống (Live Market Pulse – theo 3 màn hình Stitch) ----------
function renderMarket() {
  renderMonitor();
  const body = $('market-body');
  if (!body) return;
  const ev = currentEvent(S);
  const last = S.history[S.history.length - 1];
  const share = last ? last.share : 25;
  const lastD = last ? last.decisions : { price: REF_PRICE, marketing: 50, rd: 30 };

  // Live ticker từ trạng thái game
  const ticker = [
    `🔴 ${ev.name}: ${ev.desc}`,
    T('🔵 Alpha Dynamics duy trì chiến lược giá rẻ – theo dõi biên lợi nhuận của họ', "🔵 Alpha Dynamics keeps its budget-price strategy – watch their margin"),
    T(`🟢 Brand Loyalty của đội bạn: ${S.brandLoyalty}% ${S.brandLoyalty >= 70 ? '(khách hàng gắn bó!)' : '(cần đầu tư thương hiệu)'}`,
      `🟢 Your team's Brand Loyalty: ${S.brandLoyalty}% ${S.brandLoyalty >= 70 ? '(customers are loyal!)' : '(needs brand investment)'}`),
    T('🟡 Star Clay Co. đẩy mạnh phân khúc cao cấp – cơ hội ở phân khúc phổ thông', '🟡 Star Clay Co. is pushing the premium segment – an opening in the mass market'),
    S.loan > 0 ? T(`🏦 Đội đang có khoản vay ${S.loan}tr₫ – lãi trừ mỗi vòng`, `🏦 The team has a ${S.loan}m₫ loan – interest deducted every round`) : T(`💰 Ví đội: ${money(S.balance)} – chưa dùng đòn bẩy`, `💰 Team wallet: ${money(S.balance)} – no leverage used yet`),
  ];
  $('market-ticker').innerHTML = '<span class="mx-6">' + ticker.join('</span><span class="mx-6">') + '</span>';

  // Thị phần: bạn vs 3 đối thủ
  const teams = [
    { name: T('BẠN', 'YOU'), share, me: true },
    ...S.competitors.map(c => ({ name: c.name.split(' ')[0].toUpperCase(), share: c.share })),
  ];
  const maxShare = Math.max(...teams.map(t => t.share), 1);

  // Tiếng nói khách hàng (sinh từ trạng thái)
  const priceHigh = lastD.price > REF_PRICE * 1.15;
  const voices = [
    S.brandLoyalty >= 70
      ? { tag: T('KHÁCH TRUNG THÀNH', 'LOYAL CUSTOMER'), text: T('Yêu quyết định đầu tư chất lượng của BizOn! Rất hợp bản sắc thương hiệu.', "Love BizOn's investment in quality! Really fits the brand identity."), s: 'positive' }
      : { tag: T('KHÁCH HÀNG MỚI', 'NEW CUSTOMER'), text: T('Sản phẩm ổn nhưng thương hiệu chưa đủ thuyết phục mình gắn bó lâu dài.', "The product's fine, but the brand hasn't convinced me to stick around long-term."), s: 'neutral' },
    priceHigh
      ? { tag: T('KHÁCH NHẠY GIÁ', 'PRICE-SENSITIVE CUSTOMER'), text: T(`Giá ${lastD.price.toLocaleString('vi-VN')}k hơi chát so với túi tiền... đang ngó sang đối thủ. 📉`, `${lastD.price.toLocaleString('en-US')}k is a bit steep for my wallet... eyeing a rival. 📉`), s: 'negative' }
      : { tag: T('KHÁCH NHẠY GIÁ', 'PRICE-SENSITIVE CUSTOMER'), text: T('Mức giá hiện tại khá hợp lý so với chất lượng nhận được!', "The current price feels fair for the quality I'm getting!"), s: 'positive' },
    ev.id === 'EV_PRICEWAR'
      ? { tag: T('GIỚI PHÂN TÍCH', 'ANALYSTS'), text: T('Đối thủ vừa giảm giá sâu. Thị trường chờ phản ứng của BizOn trong 48 giờ tới.', "A rival just made a deep price cut. The market is waiting for BizOn's response in the next 48 hours."), s: 'alert' }
      : { tag: T('GIỚI PHÂN TÍCH', 'ANALYSTS'), text: T(`R&D tích lũy ${Math.round(S.rdCumulative)}tr₫ – nền tảng đổi mới của BizOn đang được chú ý.`, `Cumulative R&D of ${Math.round(S.rdCumulative)}m₫ – BizOn's innovation base is getting noticed.`), s: 'neutral' },
  ];
  const sChip = { positive: `<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">${T('TÍCH CỰC', 'POSITIVE')}</span>`, neutral: `<span class="text-[9px] font-bold text-deep-teal/60 bg-surface-bright px-2 py-0.5 rounded-full">${T('TRUNG LẬP', 'NEUTRAL')}</span>`, negative: `<span class="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">${T('TIÊU CỰC', 'NEGATIVE')}</span>`, alert: `<span class="text-[9px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">${T('⚠️ CẠNH TRANH', '⚠️ COMPETITIVE')}</span>` };

  // Radar xu hướng: Chất lượng / Giá / Bền vững / Tốc độ (0..90 bán kính)
  const rQ = 30 + Math.min(60, S.brand * 40);
  const rP = 30 + Math.min(60, Math.max(0, (REF_PRICE * 1.3 - lastD.price) / REF_PRICE * 150));
  const rS = 30 + Math.min(60, S.rdCumulative / 8);
  const rSp = 30 + Math.min(60, (S.oee - 55) * 1.6);
  const radarPts = `100,${100 - rQ} ${100 + rP},100 100,${100 + rS} ${100 - rSp},100`;

  const loyaltyPct = S.brandLoyalty, adEffPct = Math.min(100, Math.round(S.adEff * 8));
  body.innerHTML = `
    <div class="clay-card p-4 mb-3 border-l-4 border-primary-container flex gap-3 items-start">
      <img src="assets/character/lumina-vest.webp" alt="Cố vấn Hương" class="w-14 h-14 rounded-2xl object-cover shadow-clay shrink-0" style="object-position:50% 10%">
      <div>
        <p class="font-display font-bold text-deep-teal text-sm">${T('Cố vấn Hương', 'Advisor Hương')} <span class="text-[9px] bg-primary-container text-white font-extrabold px-1.5 py-0.5 rounded ml-1">LIVE</span></p>
        <p class="text-xs text-deep-teal/80 italic mt-1">"${ev.tone === 'warn' && ev.id === 'EV_PRICEWAR'
          ? T('Nghe kỹ này: cú giảm giá của đối thủ là một cái bẫy – họ đang đốt vốn. Giữ vững vị thế và tập trung vào phân khúc Premium. Chất lượng sẽ bền hơn sự tuyệt vọng của họ.',
              "Listen closely: that rival price cut is a trap – they're burning capital. Hold your ground and focus on the Premium segment. Quality will outlast their desperation.")
          : ev.tone === 'bad'
          ? T('Thị trường đang thở gấp. Ưu tiên phòng thủ dòng tiền, quan sát nhất cử nhất động của đối thủ trước khi phản công.',
              "The market is breathing hard. Prioritize defending cash flow, and watch every rival move before you counter-attack.")
          : T('Thị trường đang thở đều. Đây là lúc quan sát điểm yếu của đối thủ và chuẩn bị nước đi chiếm thị phần kế tiếp.',
              "The market is breathing steady. This is the time to spot rival weaknesses and prepare your next move to gain share.")}"</p>
      </div>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-4">${T('📊 Thị phần thời gian thực', '📊 Real-time market share')}</h3>
      <div class="clay-sunken rounded-2xl p-4 flex items-end justify-around h-48">
        ${teams.map(t => `
          <div class="flex flex-col items-center gap-2 h-full justify-end">
            <span class="text-[10px] font-extrabold ${t.me ? 'text-primary' : 'text-deep-teal/50'}">${t.share.toFixed(0)}%</span>
            <div class="clay-bar-v w-10" style="height:${Math.max(12, t.share / maxShare * 78)}%; background:${t.me ? 'linear-gradient(to top,#004d66,#00c4ff)' : '#dfe3e7'}"></div>
            <span class="text-[9px] font-bold ${t.me ? 'text-primary' : 'text-deep-teal/50'}">${t.name}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="clay-card p-5 mb-3">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-display font-bold text-deep-teal text-sm">${T('💬 Tiếng nói khách hàng', '💬 Voice of the customer')}</h3>
        <span class="text-[10px] font-bold text-primary bg-primary-container/20 px-2 py-1 rounded-full">Social Pulse</span>
      </div>
      ${voices.map((v, i) => `
        <div class="clay-bubble-in p-3.5 mb-2.5 animate-float" style="animation-delay:${i * 0.7}s">
          <p class="text-[9px] font-extrabold text-deep-teal/40 tracking-wider mb-1">${v.tag}</p>
          <p class="text-xs text-deep-teal/90">"${v.text}"</p>
          <div class="mt-1.5">${sChip[v.s]}</div>
        </div>`).join('')}
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-2">${T('🎯 Radar xu hướng', '🎯 Trend radar')}</h3>
      <div class="flex items-center gap-3">
        <svg viewBox="0 0 200 200" class="w-36 h-36 shrink-0">
          <circle class="spider-grid" cx="100" cy="100" r="30"/><circle class="spider-grid" cx="100" cy="100" r="60"/><circle class="spider-grid" cx="100" cy="100" r="90"/>
          <line class="spider-grid" x1="100" y1="10" x2="100" y2="190"/><line class="spider-grid" x1="10" y1="100" x2="190" y2="100"/>
          <polygon points="${radarPts}" fill="rgba(0,196,255,.3)" stroke="#006687" stroke-width="2"/>
          <text x="100" y="8" text-anchor="middle" font-size="10" font-weight="700" fill="#006687">${T('CHẤT LƯỢNG', 'QUALITY')}</text>
          <text x="196" y="104" text-anchor="end" font-size="10" font-weight="700" fill="#006687">${T('GIÁ', 'PRICE')}</text>
          <text x="100" y="199" text-anchor="middle" font-size="10" font-weight="700" fill="#006687">${T('BỀN VỮNG', 'SUSTAINABILITY')}</text>
          <text x="4" y="104" font-size="10" font-weight="700" fill="#006687">${T('TỐC ĐỘ', 'SPEED')}</text>
        </svg>
        <div class="flex-1 space-y-2">
          <div class="clay-sunken rounded-xl p-3 flex justify-between text-xs"><span class="text-deep-teal/70">${T('Quan tâm sản phẩm xanh', 'Interest in green products')}</span><b class="text-primary">+12.4%</b></div>
          <div class="clay-sunken rounded-xl p-3 flex justify-between text-xs"><span class="text-deep-teal/70">${T('Độ nhạy cảm về giá', 'Price sensitivity')}</span><b class="${ev.elasticityMul ? 'text-red-600' : 'text-deep-teal'}">${ev.elasticityMul ? '+18.0%' : '+4.2%'}</b></div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="clay-card p-4">
        <div class="flex justify-between items-center mb-2"><p class="font-bold text-xs text-deep-teal">Brand Loyalty</p><span class="text-[10px] font-bold text-primary">${loyaltyPct}%</span></div>
        <div class="h-3 clay-sunken rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style="width:${loyaltyPct}%"></div></div>
        <p class="text-[9px] text-deep-teal/50 mt-1.5 font-bold">${T('MỤC TIÊU', 'TARGET')}: 85%</p>
      </div>
      <div class="clay-card p-4">
        <div class="flex justify-between items-center mb-2"><p class="font-bold text-xs text-deep-teal">${T('Hiệu quả quảng cáo', 'Ad effectiveness')}</p><span class="text-[10px] font-bold ${adEffPct >= 60 ? 'text-primary' : 'text-red-600'}">${adEffPct}%</span></div>
        <div class="h-3 clay-sunken rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style="width:${adEffPct}%"></div></div>
        <p class="text-[9px] text-deep-teal/50 mt-1.5 font-bold">${T('MỤC TIÊU', 'TARGET')}: 60%</p>
      </div>
    </div>
    <div class="clay-card p-5">
      <h3 class="font-display font-bold text-deep-teal text-sm">${T('Sẵn sàng can thiệp?', 'Ready to step in?')}</h3>
      <p class="text-xs text-deep-teal/60 mb-3">${T('Điều chỉnh chiến lược dựa trên nhịp đập thị trường hiện tại.', "Adjust your strategy based on the market's current pulse.")}</p>
      <div class="grid grid-cols-2 gap-2">
        <button onclick="showTab('decisions')" class="clay-button-primary text-white text-xs font-extrabold py-3 tracking-wider" style="background:linear-gradient(135deg,#00c4ff,#006687)">🚀 DEPLOY CAMPAIGN</button>
        <button onclick="showTab('decisions')" class="clay-button-secondary text-primary text-xs font-extrabold py-3 tracking-wider">💲 REVISE PRICING</button>
      </div>
    </div>`;
}

// ---------- Nhật ký đội (Team Journal – SEC ghi chép) ----------
function journalLesson(r) {
  const parts = [];
  if (r.netProfit < 0) {
    const costs = [[T('giá vốn sản xuất', 'production cost'), r.cogs], ['marketing', r.marketing], [T('chi phí cố định', 'fixed cost'), r.fixed], [T('khấu hao', 'depreciation'), r.depreciation]];
    costs.sort((a, b) => b[1] - a[1]);
    parts.push(T(`Lỗ ${money(Math.abs(r.netProfit))} – khoản chi lớn nhất là ${costs[0][0]} (${money(costs[0][1])}). Cần cân đối lại cơ cấu chi phí.`,
      `Loss of ${money(Math.abs(r.netProfit))} – the largest expense was ${costs[0][0]} (${money(costs[0][1])}). The cost structure needs rebalancing.`));
  } else {
    parts.push(T(`Lãi ${money(r.netProfit)} với biên lợi nhuận ${Math.round(100 * r.netProfit / Math.max(1, r.revenue))}%.`,
      `Profit of ${money(r.netProfit)} with a ${Math.round(100 * r.netProfit / Math.max(1, r.revenue))}% margin.`));
  }
  if (r.lostSales > 200) parts.push(T(`Hụt ${r.lostSales.toLocaleString('vi-VN')} đơn vì thiếu hàng – cầu vượt cung, nên tăng sản lượng.`,
    `Missed ${r.lostSales.toLocaleString('en-US')} orders from a stockout – demand outran supply, so raise production.`));
  if (r.inventory > 400) parts.push(T(`Tồn kho ${r.inventory.toLocaleString('vi-VN')} sp do dự báo sai nhu cầu – chi phí lưu kho tăng.`,
    `Inventory of ${r.inventory.toLocaleString('en-US')} units from a demand-forecast miss – holding costs are rising.`));
  if (r.oee && r.oee < 80) parts.push(T(`OEE giảm còn ${r.oee}% – cần bảo trì/nâng cấp dây chuyền.`, `OEE dropped to ${r.oee}% – the line needs maintenance/upgrading.`));
  return parts.join(' ');
}

function JOURNAL_QUOTES_LIST() { return [
  { clip: 'quote-01', text: T('Mục tiêu không phải là đánh bại đối thủ, mà là làm cho họ trở nên không còn quan trọng.', 'The goal is not to beat your rivals, but to make them irrelevant.'), by: 'Lumina AI', color: 'text-primary' },
  { clip: 'quote-02', text: T('Mọi báo cáo tài chính đều là một câu chuyện, hãy đảm bảo đội của bạn đang viết một chương thành công.', "Every financial report is a story — make sure your team is writing a successful chapter."), by: 'SEC', color: 'text-red-600' },
  { clip: 'quote-03', text: T('Dữ liệu cho ta biết quá khứ, quyết định hôm nay viết nên tương lai.', "Data tells us the past; today's decisions write the future."), by: 'Phan Anh Tú', color: 'text-emerald-700' },
  { clip: 'quote-04', text: T('Khủng hoảng là bài kiểm tra tốt nhất cho năng lực quản trị dòng tiền.', 'A crisis is the best test of cash-flow management skill.'), by: 'Lumina AI', color: 'text-primary' },
  { clip: 'quote-05', text: T('Thị phần mua được bằng tiền, nhưng lòng trung thành phải xây bằng giá trị.', 'Market share can be bought with money, but loyalty must be built with value.'), by: 'Phan Anh Tú', color: 'text-emerald-700' },
  { clip: 'quote-06', text: T('Đừng sợ commit sai – hãy sợ việc không rút ra được bài học nào.', "Don't fear committing to the wrong call — fear learning nothing from it."), by: 'SEC', color: 'text-red-600' },
]; }

function renderJournal() {
  const list = $('journal-list');
  if (!list) return;
  const entries = [];
  if (!S.finished) {
    const ev = currentEvent(S);
    entries.push(`
      <div class="relative">
        <span class="absolute -left-[22px] top-5 w-3.5 h-3.5 rounded-full bg-primary shadow-clay"></span>
        <div class="clay-raised p-4">
          <div class="flex justify-between items-start mb-1">
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-deep-teal text-white">${T('ĐANG DIỄN RA', 'IN PROGRESS')}</span>
            <span class="text-[11px] font-bold text-deep-teal/50">V${S.round}/6</span>
          </div>
          <p class="font-display font-bold text-deep-teal">${T(`Chu kỳ ${S.round}: ${ev.name}`, `Round ${S.round}: ${ev.name}`)}</p>
          <div class="clay-sunken rounded-2xl p-3 mt-2">
            <p class="text-[10px] font-bold text-deep-teal/50 uppercase">${T('Trạng thái', 'Status')}</p>
            <p class="text-sm font-bold text-primary">${S.committed ? T('Đã commit – chờ kết quả', 'Committed – awaiting results') : T('Đang thảo luận quyết định', 'Discussing decisions')}</p>
          </div>
        </div>
      </div>`);
  }
  const JOURNAL_QUOTES = JOURNAL_QUOTES_LIST();
  [...S.history].reverse().forEach(r => {
    const q = JOURNAL_QUOTES[(r.round - 1) % JOURNAL_QUOTES.length];
    const priceDelta = Math.round(100 * (r.decisions.price - REF_PRICE) / REF_PRICE);
    entries.push(`
      <div class="relative">
        <span class="absolute -left-[22px] top-5 w-3.5 h-3.5 rounded-full ${r.netProfit >= 0 ? 'bg-primary-container' : 'bg-orange-400'} shadow-clay"></span>
        <div class="clay-raised p-4">
          <div class="flex justify-between items-start mb-1">
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full clay-sunken text-deep-teal/70">${T('HOÀN THÀNH', 'DONE')}</span>
            <span class="text-[11px] font-bold text-deep-teal/50">V${r.round}/6</span>
          </div>
          <p class="font-display font-bold text-deep-teal">${T(`Chu kỳ ${r.round}: ${r.event.name}`, `Round ${r.round}: ${r.event.name}`)}</p>
          <div class="clay-sunken rounded-2xl p-3 mt-2">
            <p class="text-[10px] font-bold text-deep-teal/50 uppercase">${T('Quyết định then chốt', 'Key decision')}</p>
            <p class="text-sm font-bold text-primary">${T(`Giá bán: ${r.decisions.price.toLocaleString('vi-VN')}k₫ (${priceDelta >= 0 ? '+' : ''}${priceDelta}% so với ĐT) · R&D ${r.rd}tr₫`, `Price: ${r.decisions.price.toLocaleString('en-US')}k₫ (${priceDelta >= 0 ? '+' : ''}${priceDelta}% vs reference) · R&D ${r.rd}m₫`)}</p>
          </div>
          <p class="text-[10px] font-bold text-deep-teal/50 uppercase mt-2.5">${T('Kết quả & bài học', 'Results & lessons')}</p>
          <p class="text-sm text-deep-teal/80">${journalLesson(r)}</p>
          <div class="border-t border-surface-bright mt-2.5 pt-2.5 flex gap-2 items-start">
            <span class="text-base">💬</span>
            <p class="text-xs text-deep-teal/70 italic">"${q.text}" – <b class="${q.color}">${q.by}</b></p>
            ${q.clip ? `<button onclick="playVoice('${q.clip}')" aria-label="${T('Nghe câu trích dẫn', 'Listen to the quote')}" title="${T('Nghe câu trích dẫn', 'Listen to the quote')}" class="shrink-0 text-primary text-sm leading-none">🔊</button>` : ''}
          </div>
        </div>
      </div>`);
  });
  list.innerHTML = '<div class="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/15 rounded-full"></div>' +
    (entries.length ? entries.join('') : `<p class="text-sm text-deep-teal/50">${T('Hành trình sẽ được ghi lại tại đây sau vòng đầu tiên.', 'Your journey will be logged here after the first round.')}</p>`);
}

function renderHeader() {
  $('hdr-team').textContent = S.profile.teamName;
  const eqR = MG_REWARDS_LIST().find(r => r.id === S.rewardEquipped);
  $('hdr-level').textContent = 'Lv.' + (1 + Math.floor((S.xp - S.spentXp < 0 ? 0 : S.xp) / XP_PER_LEVEL)) + (eqR ? ' ' + eqR.icon : '');
  $('hdr-xp').textContent = S.xp.toLocaleString('vi-VN') + ' XP';
  $('hdr-balance').textContent = money(S.balance);
}

/* Ván không có Mã lớp = chơi thử: chơi trọn 6 vòng nhưng không gửi kết quả
 * về lớp và không cấp giấy chứng nhận. */
function isTrial() { return !((S.profile && S.profile.classId) || '').trim(); }

function renderDashboard() {
  const ev = currentEvent(S);
  $('dash-round').textContent = Math.min(S.round, ROUNDS_TOTAL);
  const trial = $('dash-trial');
  if (trial) trial.classList.toggle('hidden', !isTrial());
  $('dash-status').textContent = S.finished ? T('🏁 Đã hoàn thành mô phỏng!', '🏁 Simulation complete!')
    : S.committed ? T('Đã khóa – chờ kết quả', 'Locked in – awaiting results') : T('Đang ra quyết định', 'Making decisions');
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
    banner.innerHTML = `${ev.img ? `<img src="${ev.img}" alt="${ev.name}" class="w-full h-32 object-cover rounded-2xl mb-3" loading="lazy">` : ''}<div class="flex gap-3 items-start"><span class="text-2xl">${ev.icon}</span>
      <div><p class="font-display font-bold text-deep-teal text-sm">${T(`Sự kiện thị trường · Chu kỳ ${S.round}: ${ev.name}`, `Market event · Round ${S.round}: ${ev.name}`)}</p>
      <p class="text-xs text-deep-teal/70 mt-0.5">${ev.desc}</p></div></div>`;
  } else banner.classList.add('hidden');

  const last = S.history[S.history.length - 1];
  $('m-cash').textContent = money(S.balance);
  $('m-share').textContent = last ? last.share.toFixed(1) + '%' : '25%';
  $('m-brand').textContent = S.brand >= 1.4 ? 'A+' : S.brand >= 1.2 ? 'A' : S.brand >= 1.05 ? 'B+' : 'B';
  $('dash-lumina').textContent = S.finished
    ? T('Chúc mừng! Xem chứng chỉ của bạn ở mục Thành tựu nhé. 🎓', 'Congratulations! Check out your certificate in the Achievements tab. 🎓')
    : luminaAdvice(S, 'risk').text.slice(0, 90) + '…';
}

let decFunding = 'equity';

function setFunding(f) {
  decFunding = f;
  $('fund-equity').classList.toggle('ring-2', f === 'equity');
  $('fund-equity').classList.toggle('text-primary', f === 'equity');
  $('fund-equity').classList.toggle('text-deep-teal/60', f !== 'equity');
  $('fund-loan').classList.toggle('ring-2', f === 'loan');
  $('fund-loan').classList.toggle('text-primary', f === 'loan');
  $('fund-loan').classList.toggle('text-deep-teal/60', f !== 'loan');
  syncDecisionLabels();
}

function currentDecisionInput() {
  return {
    price: +$('in-price').value,
    marketing: +$('in-mkt').value,
    production: +$('in-prod').value,
    rd: +$('in-rd').value,
    workers: +$('in-workers').value,
    training: +$('in-train').value,
    funding: decFunding,
    paymentTerm: +$('in-term').value,
  };
}

function syncDecisionLabels() {
  $('v-price').textContent = (+$('in-price').value).toLocaleString('vi-VN') + '.000₫';
  $('v-mkt').textContent = $('in-mkt').value + 'tr₫';
  $('v-prod').textContent = (+$('in-prod').value).toLocaleString('vi-VN') + T(' sp', ' units');
  $('v-rd').textContent = $('in-rd').value + 'tr₫';
  $('v-workers').textContent = $('in-workers').value + T(' người', ' people');
  $('v-train').textContent = $('in-train').value + 'tr₫';
  // Dự báo dòng tiền CVP trực tiếp
  if (!S) return;
  const fc = forecastCash(S, currentDecisionInput());
  $('fc-in').textContent = '+ ' + money(fc.inflow);
  $('fc-out').textContent = '− ' + money(fc.outflow);
  $('fc-net').textContent = (fc.net >= 0 ? '+ ' : '− ') + money(Math.abs(fc.net));
  $('fc-net').classList.toggle('text-red-600', fc.net < 0);
  $('fc-net').classList.toggle('text-primary', fc.net >= 0);
  const capped = +$('in-prod').value > fc.laborCap;
  $('fc-be').textContent = T(`Sản lượng hòa vốn: ${fc.breakEven.toLocaleString('vi-VN')} sp · Bán dự kiến: ${fc.estSold.toLocaleString('vi-VN')} sp`,
    `Break-even output: ${fc.breakEven.toLocaleString('en-US')} units · Expected sold: ${fc.estSold.toLocaleString('en-US')} units`) +
    (capped ? T(` · ⚠️ Nhân sự chỉ đủ sản xuất ${fc.laborCap.toLocaleString('vi-VN')} sp`, ` · ⚠️ Staffing only supports ${fc.laborCap.toLocaleString('en-US')} units`) : '');
  renderMarketForecast();
  const recap = $('commit-recap');
  if (recap) {
    recap.innerHTML = T(`🧾 <b class="text-deep-teal">Xem lại trước khi chốt:</b> Giá <b>${(+$('in-price').value).toLocaleString('vi-VN')}k</b> · Marketing <b>${$('in-mkt').value}tr</b> · Sản xuất <b>${(+$('in-prod').value).toLocaleString('vi-VN')} sp</b> · Nhân công <b>${$('in-workers').value}</b> · R&D <b>${$('in-rd').value}tr</b>`,
      `🧾 <b class="text-deep-teal">Review before locking in:</b> Price <b>${(+$('in-price').value).toLocaleString('en-US')}k</b> · Marketing <b>${$('in-mkt').value}m</b> · Production <b>${(+$('in-prod').value).toLocaleString('en-US')} units</b> · Workers <b>${$('in-workers').value}</b> · R&D <b>${$('in-rd').value}m</b>`) +
      (capped ? T(' · <span class="text-red-600 font-extrabold">⚠️ thiếu nhân sự cho sản lượng này</span>', ' · <span class="text-red-600 font-extrabold">⚠️ not enough staff for this output</span>') : '');
  }
}

/* Dự báo thị phần sống – trả lời thẳng câu hỏi "tôi có cắm được cờ không?" */
function renderMarketForecast() {
  const el = $('mf-share');
  if (!el || !S) return;
  const d = currentDecisionInput();
  const ev = currentEvent(S) || MARKET_EVENTS_LIST()[1];
  const last = S.history[S.history.length - 1];
  const lastShare = last ? last.share : 25;
  const elasticity = PRICE_ELASTICITY * (ev.elasticityMul || 1);
  const attr = (p, m) => Math.pow(REF_PRICE / p, elasticity) * (1 + Math.sqrt(m * (ev.mktBoost || 1)) / 18) * S.brand;
  const lastD = last && last.decisions ? last.decisions : { price: REF_PRICE, marketing: 50 };
  const compAttr = attr(lastD.price, lastD.marketing) * (100 - lastShare) / Math.max(1, lastShare);
  const share = 100 * attr(d.price, d.marketing) / (attr(d.price, d.marketing) + compAttr);
  const rivalAvg = (100 - share) / 3;
  const winning = share > rivalAvg + 1;
  el.textContent = share.toFixed(1) + '%';
  el.classList.toggle('text-red-600', !winning);
  el.classList.toggle('text-primary', winning);
  const bar = $('mf-bar');
  if (bar) { bar.style.width = Math.min(100, Math.max(4, share)) + '%'; bar.classList.toggle('opacity-50', !winning); }
  const fc = forecastCash(S, d);
  $('mf-verdict').innerHTML = winning
    ? (fc.net >= 0 ? T(`✅ <b>Đang thắng!</b> Ước tính bạn vượt mức trung bình đối thủ (~${rivalAvg.toFixed(0)}%/đội) và có lãi – giữ vững là cắm được cờ 🚩.`,
                       `✅ <b>You're winning!</b> Estimated above the rival average (~${rivalAvg.toFixed(0)}%/team) and profitable – hold this and you'll plant the flag 🚩.`)
                   : T(`🟡 Thị phần đủ thắng (~ đối thủ ${rivalAvg.toFixed(0)}%/đội) nhưng <b>đang lỗ</b> – tăng giá nhẹ hoặc bớt chi để có lãi, vì thắng vòng cần cả hai.`,
                       `🟡 Share is enough to win (~rivals ${rivalAvg.toFixed(0)}%/team) but you're <b>losing money</b> – raise price slightly or cut spend to turn a profit, since winning the round needs both.`))
    : T(`🔻 Chưa đủ – mỗi đối thủ đang giữ ~${rivalAvg.toFixed(0)}%. Gợi ý: <b>giảm giá gần 150k</b> hoặc <b>tăng marketing</b> để kéo khách (xem đề xuất của Lan Chi ở Cuộc họp đội).`,
        `🔻 Not enough yet – each rival holds ~${rivalAvg.toFixed(0)}%. Tip: <b>lower price toward 150k</b> or <b>raise marketing</b> to win customers (see Lan Chi's suggestion in the Team Meeting).`);
}

/* ===== CUỘC HỌP ĐỘI – 4 thành viên demo đề xuất theo vai, tất định theo seed + vòng ===== */
function meetingJitter(k) {                       // dao động nhỏ nhưng lặp lại được để chấm điểm
  const x = (S.seed * 9301 + S.round * 49297 + k * 7907) % 233280;
  return x / 233280;                              // 0..1
}
function teamSuggestions() {
  const ev = currentEvent(S) || {};
  const last = S.history[S.history.length - 1];
  const share = last ? last.share : 25;
  const tight = S.quickRatio < 1 || S.balance < 120;
  const priceWar = false; // regex gốc trên tên tiếng Việt chưa từng khớp – giữ nguyên hành vi cũ
  const energy = ev.id === 'EV_RECESSION';   // trước đây match theo tên "năng lượng" – đổi theo id để không phụ thuộc ngôn ngữ hiển thị
  const boom = ev.id === 'EV_GOLDEN' || ev.id === 'EV_MILESTONE';

  const cfoRd = tight ? 15 : (boom ? 60 : 35 + Math.round(meetingJitter(1) * 3) * 5);
  const cmoPrice = Math.max(100, Math.min(220, (priceWar ? 130 : 150) + (S.brand > 1.2 ? 15 : 0) - (share < 22 ? 10 : 0) + Math.round(meetingJitter(2) * 2) * 5));
  const cmoMkt = Math.min(200, (boom ? 95 : priceWar ? 80 : 55) + Math.round(meetingJitter(3) * 3) * 5);
  const cooProd = Math.max(200, Math.min(4000, Math.round(S.machineCapacity * (energy ? 0.65 : 0.88) / 100) * 100));
  const cooWorkers = energy ? 40 : 50;

  return [
    { img: 'assets/character/team/cfo.jpg', name: 'Thu Hà · CFO', icon: '💰',
      say: tight ? T(`Thanh khoản đang căng (quick ratio ${S.quickRatio.toFixed(2)}). Em đề xuất giảm R&D về ${cfoRd}tr, ưu tiên giữ tiền mặt – cần thì vay ngắn hạn thay vì cắt marketing sát sàn.`,
                     `Liquidity is tight (quick ratio ${S.quickRatio.toFixed(2)}). I suggest cutting R&D to ${cfoRd}m and prioritizing cash – take a short-term loan if needed instead of slashing marketing to the bone.`)
                 : T(`Két sắt ổn (${Math.round(S.balance)}tr). Em đề xuất R&D ${cfoRd}tr – biến cố tốt thì đầu tư cho vòng sau, đừng để tiền nằm im.`,
                     `The cash box looks healthy (${Math.round(S.balance)}m). I suggest R&D of ${cfoRd}m – with a good event on our side, let's invest for next round instead of sitting on cash.`),
      apply: { 'in-rd': cfoRd } },
    { img: 'assets/character/team/cmo.webp', name: 'Lan Chi · CMO', icon: '📣',
      say: priceWar ? T(`Đối thủ đang phá giá! Em đề xuất giá ${cmoPrice}k + marketing ${cmoMkt}tr – mình không đua tận đáy nhưng phải giữ độ phủ.`,
                        `A rival is undercutting on price! I suggest price ${cmoPrice}k + marketing ${cmoMkt}m – we won't race to the bottom, but we need to keep our reach.`)
                    : T(`Với thương hiệu hiện tại, em đề xuất giá ${cmoPrice}k và marketing ${cmoMkt}tr${boom ? ' – biến cố này là thời cơ vàng để bung!' : ' – đủ áp lực lên cả ba đối thủ.'}`,
                        `Given our current brand, I suggest price ${cmoPrice}k and marketing ${cmoMkt}m${boom ? " – this event is a golden chance to go big!" : ' – enough pressure on all three rivals.'}`),
      apply: { 'in-price': cmoPrice, 'in-mkt': cmoMkt } },
    { img: 'assets/character/team/coo.webp', name: 'Bảo Ngọc · COO', icon: '🏭',
      say: energy ? T(`Khủng hoảng năng lượng – em đề xuất hạ sản lượng về ${cooProd.toLocaleString('vi-VN')} sp và ${cooWorkers} nhân công, chạy máy quá tải lúc này là đốt tiền điện.`,
                      `Energy crisis – I suggest lowering output to ${cooProd.toLocaleString('en-US')} units with ${cooWorkers} workers; overloading the machines now just burns money on power.`)
                  : T(`Công suất máy ${S.machineCapacity.toLocaleString('vi-VN')} sp – em đề xuất sản xuất ${cooProd.toLocaleString('vi-VN')} sp với ${cooWorkers} nhân công, chừa ~12% đệm cho bảo trì.`,
                      `Machine capacity is ${S.machineCapacity.toLocaleString('en-US')} units – I suggest producing ${cooProd.toLocaleString('en-US')} units with ${cooWorkers} workers, leaving ~12% buffer for maintenance.`),
      apply: { 'in-prod': cooProd, 'in-workers': cooWorkers } },
    { img: 'assets/character/team/sec.webp', name: 'Gia Hân · SEC', icon: '📝',
      say: T(`Tóm tắt cuộc họp: biến cố vòng này là «${ev.name || '–'}». ${ev.icon || ''} ${tight ? 'Ưu tiên số 1 theo CFO: an toàn dòng tiền. ' : ''}Em đã ghi biên bản – cả đội thống nhất xong thì CEO bấm Commit nhé!`,
              `Meeting summary: this round's event is «${ev.name || '–'}». ${ev.icon || ''} ${tight ? "CFO's top priority: protect cash safety. " : ''}I've logged the minutes – once the team agrees, the CEO can hit Commit!`) },
  ];
}
function applySuggestion(i) {
  const s = teamSuggestions()[i];
  if (!s || !s.apply) return;
  Object.entries(s.apply).forEach(([id, v]) => { const el = $(id); if (el) el.value = v; });
  S.suggestionsApplied = (S.suggestionsApplied || 0) + 1;
  save();
  syncDecisionLabels();
  const btn = document.getElementById('tm-applied-' + i);
  if (btn) { btn.textContent = T('✓ Đã áp vào thanh trượt', '✓ Applied to sliders'); btn.classList.add('opacity-60'); }
}
function renderTeamMeeting() {
  const box = $('team-meeting');
  if (!box) return;
  if (!S.teamMembers || S.finished || S.committed) { box.innerHTML = ''; return; }
  const sug = teamSuggestions();
  box.innerHTML = `<div class="clay-card p-4">
    <img src="assets/illustrations/team-holo-meeting.webp" alt="Đội ngũ nòng cốt họp chiến lược quanh bàn điều hành hologram" class="w-full h-28 object-cover rounded-2xl mb-3" style="object-position:50% 32%" loading="lazy">
    <p class="font-display font-bold text-deep-teal text-sm mb-1">${T(`🗣️ Cuộc họp đội – vòng ${S.round}`, `🗣️ Team meeting – round ${S.round}`)}</p>
    <p class="text-[10px] text-deep-teal/50 mb-3">${T(`4 thành viên đề xuất theo vai trò. Bạn là ${S.profile.role} – quyền quyết định cuối cùng vẫn thuộc về bạn.`, `4 members suggest a move for their role. You're the ${S.profile.role} – the final call is still yours.`)}</p>
    ${sug.map((m, i) => `
      <div class="clay-sunken rounded-2xl p-3 mb-2">
        <div class="flex gap-2.5 items-start">
          <img src="${m.img}" alt="" class="w-9 h-9 rounded-full object-cover object-top shadow-clay shrink-0">
          <div class="min-w-0">
            <p class="text-[11px] font-extrabold text-deep-teal">${m.icon} ${m.name}</p>
            <p class="text-[11px] text-deep-teal/75 italic mt-0.5">"${m.say}"</p>
            ${m.apply ? `<button id="tm-applied-${i}" onclick="applySuggestion(${i})" class="clay-btn bg-surface-bright text-primary text-[10px] font-extrabold px-3 py-1.5 mt-1.5">${T('👍 Nghe theo – áp vào thanh trượt', '👍 Take it – apply to sliders')}</button>` : ''}
          </div>
        </div>
      </div>`).join('')}
  </div>`;
}

/* Chế độ Cơ bản/Nâng cao: vòng 1–2 gấp gọn các quyết định nâng cao (giá trị mặc định vẫn hợp lý) */
let advTouched = false;
function toggleAdvDecisions() {
  advTouched = true;
  const box = $('adv-decisions'), btn = $('adv-toggle');
  const hide = !box.classList.contains('hidden');
  box.classList.toggle('hidden', hide);
  if (btn) btn.textContent = hide ? T('⚙️ Quyết định nâng cao (R&D · Tài chính · Nhân sự) ▾', '⚙️ Advanced decisions (R&D · Finance · HR) ▾') : T('⚙️ Thu gọn quyết định nâng cao ▴', '⚙️ Collapse advanced decisions ▴');
}
function syncAdvDecisions() {
  const box = $('adv-decisions'), btn = $('adv-toggle');
  if (!box || advTouched) return;
  const hide = S.round <= 2;
  box.classList.toggle('hidden', hide);
  if (btn) btn.textContent = hide ? T('⚙️ Quyết định nâng cao (R&D · Tài chính · Nhân sự) ▾', '⚙️ Advanced decisions (R&D · Finance · HR) ▾') : T('⚙️ Thu gọn quyết định nâng cao ▴', '⚙️ Collapse advanced decisions ▴');
}

function renderDecisions() {
  document.querySelectorAll('.dec-round').forEach(e => e.textContent = Math.min(S.round, ROUNDS_TOTAL));
  syncAdvDecisions();
  syncDecisionLabels();
  renderTeamMeeting();
  const wq = $('whatif-quota');
  if (wq) wq.textContent = Math.max(0, WHAT_IF_LIMIT - (S.whatIfUsed || 0));
  const btn = $('btn-commit');
  if (S.finished) {
    btn.disabled = true;
    btn.textContent = T('🏁 Mô phỏng đã kết thúc', '🏁 Simulation finished');
    btn.classList.add('opacity-50');
  } else if (S.committed) {
    btn.disabled = true;
    btn.textContent = T('🔒 Đã commit (ERR_ALREADY_COMMITTED)', '🔒 Already committed (ERR_ALREADY_COMMITTED)');
    btn.classList.add('opacity-50');
  } else {
    btn.disabled = false;
    btn.textContent = T('🔒 Commit – Khóa quyết định', '🔒 Commit – Lock in decisions');
    btn.classList.remove('opacity-50');
  }
}

function commitDecisions() {
  if (S.finished || S.committed) return;
  if (S.roundLocked) {
    alert(T('ERR_ROUND_LOCKED – Giảng viên đã khóa vòng chơi này. Chờ mở khóa để tiếp tục.', 'ERR_ROUND_LOCKED – Your instructor has locked this round. Wait for it to unlock to continue.'));
    return;
  }
  const d = currentDecisionInput();
  const cashNeeded = d.marketing + d.rd + d.production * UNIT_COST / 1000 + d.workers * WAGE_PER_WORKER + d.workers * d.training;
  if (d.funding !== 'loan' && cashNeeded > S.balance + 300) {
    alert(T('ERR_INSUFFICIENT_FUNDS – Kế hoạch chi vượt quá vốn tự có của đội. Hãy giảm ngân sách hoặc chuyển sang nguồn vốn "Vay ngân hàng" (lãi 8.5%/vòng).', 'ERR_INSUFFICIENT_FUNDS – The planned spend exceeds your team\'s equity. Reduce the budget or switch funding to "Bank loan" (8.5%/round interest).'));
    return;
  }
  S.committed = true;
  renderDecisions();
  $('commit-box').classList.add('hidden');
  $('processing-box').classList.remove('hidden');
  const hideLoading = showSimLoading();
  const lvlBefore = 1 + Math.floor(S.xp / XP_PER_LEVEL);

  setTimeout(() => {
    const report = simulateRound(S, d);
    recordConquest(report);
    save();
    if (window.BizonBackend) BizonBackend.submitRound(S, report);
    hideLoading();
    $('processing-box').classList.add('hidden');
    $('commit-box').classList.remove('hidden');
    if (report.netProfit > 0) createConfetti();
    // Kịch bản Stitch: chúc mừng KPI xuất sắc + cảnh báo rủi ro theo vai trò
    const notes = kpiCongrats(S, report).concat(riskAlerts(S, report));
    notes.forEach(m => pushLumina({ risk: m.risk, clip: m.clip, text: `【${m.role}】 ${m.text}` }));
    if (notes.some(m => m.risk === 'low')) createConfetti();
    showArena(report, () => showRoundResult(report));
    // Thăng cấp → màn chúc mừng toàn trang (sau khi bảng kết quả hiện)
    const lvlAfter = 1 + Math.floor(S.xp / XP_PER_LEVEL);
    if (lvlAfter > lvlBefore) setTimeout(() => showLevelUp(lvlAfter), 900);
  }, 2300);
}

/* ===== ⚔️ ĐẤU TRƯỜNG – các nhân vật ra sàn đấu giành thị phần sau mỗi Commit ===== */
const RIVAL_ICONS = { aggressive: '🐺', balanced: '🐘', premium: '🦚' };
/* Khi có tạo hình người đất sét cho 3 đối thủ: đặt ảnh vào assets/character/rivals/ và điền đường dẫn */
const RIVAL_IMGS = { aggressive: 'assets/character/rivals/alpha.webp', balanced: 'assets/character/rivals/mekong.webp', premium: 'assets/character/rivals/star.webp' };
function showArena(r, done) {
  const stop = CONQUEST_STOPS[r.round - 1];
  const fighters = [
    { name: S.profile.teamName, share: r.share, me: true, img: 'assets/character/team/ceo.webp', pos: 'bottom' },
    ...S.competitors.map((c, i) => ({ name: c.name, share: c.share || 25, icon: RIVAL_ICONS[c.style] || '🤖',
      img: RIVAL_IMGS[c.style], pos: ['top', 'left', 'right'][i] })),
  ];
  const max = Math.max(...fighters.map(f => f.share));
  // Bản đồ dựng đứng và hẹp nên xếp 4 đối thủ thành hai cột hai bên,
  // chừa trọn dải đất liền để ghim địa phương luôn nhìn thấy.
  const POS = { bottom: 'left:0; bottom:0', top: 'left:0; top:0',
                left: 'right:0; top:0', right: 'right:0; bottom:0' };
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto';
  div.style.background = 'linear-gradient(180deg, #06282f 0%, #052026 55%, #04171c 100%)'; // đồng màu với nền ảnh bản đồ
  // Sàn đấu là bản đồ Việt Nam đất nặn; ghim cắm tại địa phương của vòng này.
  const pin = stop ? `
        <div class="absolute" style="left:${stop.fx * 100}%; top:${stop.fy * 100}%; transform:translate(-50%,-50%); z-index:5">
          <span class="block w-5 h-5 rounded-full bg-clay-gold border-2 border-white cq-pulse" style="box-shadow:0 0 16px rgba(253,161,39,.95)"></span>
        </div>` : '';
  div.innerHTML = `
    <div class="w-full max-w-sm text-center py-6">
      <h3 class="font-display font-extrabold text-white text-xl">${T(`⚔️ ĐẤU TRƯỜNG ${stop ? stop.name.toUpperCase() : 'VÒNG ' + r.round}`, `⚔️ ARENA ${stop ? stop.name.toUpperCase() : 'ROUND ' + r.round}`)}</h3>
      <p class="text-white/60 text-xs">${r.event.icon} ${r.event.name} ${T('– 12.000 khách hàng chờ trên khán đài', '– 12,000 customers waiting in the stands')}</p>
      ${stop ? `<p class="text-[11px] font-extrabold mb-2" style="color:rgba(253,161,39,.9)">📍 ${stop.zone}</p>` : '<p class="mb-2"></p>'}
      <div class="relative mx-auto" style="width:min(96vw,376px); height:min(54vh,392px)">
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style="height:100%; aspect-ratio:768/1376">
          <div class="w-full h-full" style="-webkit-mask-image:linear-gradient(to bottom, transparent 0, #000 3%, #000 97%, transparent 100%); mask-image:linear-gradient(to bottom, transparent 0, #000 3%, #000 97%, transparent 100%)">
            <img src="assets/illustrations/arena-vietnam-map-v2.webp" alt="Bản đồ Việt Nam – sàn đấu giành thị phần" class="w-full h-full object-contain" style="-webkit-mask-image:linear-gradient(to right, transparent 0, #000 3%, #000 97%, transparent 100%); mask-image:linear-gradient(to right, transparent 0, #000 3%, #000 97%, transparent 100%)">
          </div>
          ${pin}
        </div>
        <p id="arena-vs" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-extrabold text-3xl pointer-events-none" style="color:rgba(255,255,255,.92); text-shadow:0 0 22px rgba(232,118,45,.95), 0 2px 10px rgba(0,0,0,.9)">VS</p>
        ${fighters.map((f, i) => `
        <div class="absolute w-[76px] text-center" data-pod="${i}" style="${POS[f.pos]}; animation:fadeUp .5s ease both; animation-delay:${i * 0.45}s">
          <div class="mx-auto w-14 h-14 rounded-full overflow-hidden border-2 ${f.me ? 'border-clay-gold shadow-[0_0_16px_rgba(253,161,39,.8)]' : 'border-white/30'} bg-white/10 flex items-center justify-center">
            ${f.img ? `<img src="${f.img}" class="w-full h-full object-cover object-top">` : `<span class="text-3xl">${f.icon}</span>`}
          </div>
          <div class="mx-auto w-10 h-1.5 rounded-full bg-black/50 blur-[2px] mt-0.5"></div>
          <p class="text-[9px] font-extrabold ${f.me ? 'text-clay-gold' : 'text-white/80'} leading-tight mt-1 truncate">${f.me ? '🏺 ' : ''}${f.name}</p>
          <p class="arena-num font-display font-extrabold ${f.me ? 'text-clay-gold' : 'text-white/70'} text-sm" data-share="${f.share.toFixed(1)}">0%</p>
          <div class="h-1.5 rounded-full bg-white/10 overflow-hidden mx-2"><div class="arena-bar h-full rounded-full ${f.me ? 'bg-gradient-to-r from-clay-orange to-clay-gold' : 'bg-white/40'}" style="width:0%; transition:width 1.1s cubic-bezier(.2,.8,.3,1) ${i * 0.45 + 0.3}s" data-w="${Math.max(6, f.share / max * 100)}"></div></div>
        </div>`).join('')}
      </div>
      <p id="arena-verdict" class="text-sm font-extrabold mt-3 min-h-[1.5rem] text-white opacity-0" style="transition:opacity .4s"></p>
      <button id="arena-next" class="clay-btn w-full bg-white text-deep-teal font-display font-extrabold py-3.5 mt-2 opacity-0" style="transition:opacity .4s">${T('Xem kết quả chi tiết →', 'View detailed results →')}</button>
    </div>`;
  document.body.appendChild(div);
  requestAnimationFrame(() => {
    div.querySelectorAll('.arena-bar').forEach(b => b.style.width = b.dataset.w + '%');
    div.querySelectorAll('.arena-num').forEach(n => {
      const target = +n.dataset.share; let t0 = null;
      const step = ts => { t0 ??= ts; const p = Math.min(1, (ts - t0) / 1400); n.textContent = (target * p).toFixed(1) + '%'; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  });
  const win = r.share >= max - 0.01;
  const winIdx = fighters.findIndex(f => f.share === max);
  setTimeout(() => {
    const pod = div.querySelector(`[data-pod="${winIdx}"] div`);
    if (pod) { pod.classList.add('ring-4', 'ring-clay-gold'); pod.insertAdjacentHTML('beforebegin', '<p class="text-lg" style="animation:fadeUp .4s ease">👑</p>'); }
    const vs = div.querySelector('#arena-vs'); if (vs) vs.textContent = win ? '🚩' : '🏴';
    const v = div.querySelector('#arena-verdict');
    v.textContent = win ? T(`🚩 ${S.profile.teamName} thắng sàn đấu${stop ? ' – cắm cờ tại ' + stop.name : ''}!`, `🚩 ${S.profile.teamName} wins the arena${stop ? ' – flag planted at ' + stop.name : ''}!`)
                        : T(`🏴 ${fighters[winIdx].name} giữ vị trí số 1 vòng này…`, `🏴 ${fighters[winIdx].name} holds #1 this round…`);
    v.style.opacity = 1; v.classList.add(win ? 'text-clay-gold' : 'text-white/80');
    if (win) createConfetti();
    const btn = div.querySelector('#arena-next');
    btn.style.opacity = 1;
    btn.onclick = () => { div.remove(); done(); };
  }, fighters.length * 450 + 1400);
  div.addEventListener('click', e => { if (e.target === div) { div.remove(); done(); } });
}

/* "Vì sao ra kết quả này?" – một câu giải thích nguyên nhân chính của vòng */
function explainRound(r) {
  const prev = S.history[S.history.length - 2];
  const dShare = prev ? r.share - prev.share : r.share - 25;
  const d = r.decisions || {};
  const causes = [];
  if (r.event && r.event.tone === 'bad' && !r.shielded) causes.push(T(`biến cố «${r.event.name}» ép chi phí/nhu cầu`, `the «${r.event.name}» event squeezed cost/demand`));
  if (d.price > REF_PRICE * 1.25) causes.push(T(`giá ${d.price}k cao hơn hẳn tham chiếu 150k nên mất khách nhạy giá`, `price ${d.price}k is well above the 150k reference, losing price-sensitive customers`));
  if (d.price < REF_PRICE * 0.8) causes.push(T(`giá ${d.price}k rất thấp kéo khách nhưng bào mỏng biên lãi`, `price ${d.price}k is very low – it pulls in customers but thins the margin`));
  if (r.sold < d.production * 0.85) causes.push(T(`sản xuất ${(d.production || 0).toLocaleString('vi-VN')} sp nhưng chỉ bán ${r.sold.toLocaleString('vi-VN')} – tồn kho chôn vốn`, `produced ${(d.production || 0).toLocaleString('en-US')} units but only sold ${r.sold.toLocaleString('en-US')} – excess inventory ties up cash`));
  if ((d.marketing || 0) < 40) causes.push(T('marketing dưới mặt bằng đối thủ (55–90tr) nên độ phủ yếu', "marketing is below the rivals' range (55-90m), so reach is weak"));
  const head = dShare >= 1 ? T(`Thị phần tăng ${dShare.toFixed(1)} điểm`, `Market share rose ${dShare.toFixed(1)} points`) : dShare <= -1 ? T(`Thị phần giảm ${Math.abs(dShare).toFixed(1)} điểm`, `Market share dropped ${Math.abs(dShare).toFixed(1)} points`) : T('Thị phần đi ngang', 'Market share held steady');
  const tail = causes.length ? T(' – nguyên nhân chính: ', ' – main cause: ') + causes.slice(0, 2).join('; ')
    : r.netProfit > 0 ? T(' – chiến lược cân bằng, không có điểm yếu rõ rệt.', ' – a balanced strategy, no clear weak point.')
    : T(' – lỗ chủ yếu do tổng chi vượt doanh thu, xem lại Dự báo Dòng tiền trước khi chốt.', ' – the loss mainly came from total cost exceeding revenue; review the Cash Flow Forecast before locking in.');
  return `${head}${tail}${causes.length ? '.' : ''}`;
}

function showRoundResult(r) {
  const ok = r.netProfit > 0;
  playClip('assets/audio/lumina-round-result.mp3');
  const cq = (S.conquest || [])[r.round - 1];
  const cqStop = CONQUEST_STOPS[r.round - 1];
  const cqLine = cq && cqStop ? (cq.win
    ? `<p class="mt-1 text-xs font-bold text-emerald-600">${T(`🚩 Đội bạn cắm cờ tại ${cqStop.name}!`, `🚩 Your team planted the flag at ${cqStop.name}!`)}</p>`
    : `<p class="mt-1 text-xs font-bold text-orange-600">${T(`🏴 ${cq.winner} chiếm ${cqStop.name} vòng này`, `🏴 ${cq.winner} took ${cqStop.name} this round`)}</p>`) : '';
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-50 bg-deep-teal/50 backdrop-blur-sm flex items-center justify-center p-6';
  div.innerHTML = `
    <div class="clay-card max-w-sm w-full p-6 text-center ${r.event.tone === 'bad' && !r.shielded ? 'animate-shake' : ''}">
      <p class="text-4xl mb-2">${ok ? '🎉' : '😰'}</p>
      <h3 class="font-display font-extrabold text-deep-teal text-lg">${T(`Kết quả vòng ${r.round}`, `Round ${r.round} results`)}</h3>
      <p class="text-xs text-deep-teal/60 mb-4">${r.event.icon} ${r.event.name}${r.shielded ? T(' (đã chặn bởi 🛡️)', ' (blocked by 🛡️)') : ''}</p>
      <div class="grid grid-cols-2 gap-2 text-left text-sm">
        <div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Doanh thu', 'Revenue')}</p><p class="font-display font-bold text-deep-teal">${money(r.revenue)}</p></div>
        <div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Lợi nhuận ròng', 'Net profit')}</p><p class="font-display font-bold ${ok ? 'text-emerald-600' : 'text-orange-600'}">${money(r.netProfit)}</p></div>
        <div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Đã bán', 'Units sold')}</p><p class="font-display font-bold text-deep-teal">${r.sold.toLocaleString('vi-VN')} ${T('sp', 'units')}</p></div>
        <div class="bg-surface-bright rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Thị phần (%)', 'Market share (%)')}</p><p class="font-display font-bold text-deep-teal">${r.share.toFixed(1)}%</p></div>
      </div>
      <div class="clay-sunken rounded-2xl p-3 mt-3 text-left"><p class="text-[10px] font-extrabold text-deep-teal/50 uppercase mb-0.5">${T('💡 Vì sao?', '💡 Why?')}</p><p class="text-[11px] text-deep-teal/75">${explainRound(r)}</p></div>
      <p class="mt-3 text-xs font-bold text-primary">+${r.xpGain} XP</p>
      ${cqLine}
      ${(() => {
        S.achShown ??= [];
        const fresh = (S.achievements || []).filter(id => !S.achShown.includes(id));
        if (!fresh.length) return '';
        S.achShown.push(...fresh); save();
        return fresh.map(id => {
          const a = ACHIEVEMENTS_LIST().find(x => x.id === id);
          return a ? `<p class="mt-1.5 text-xs font-extrabold text-clay-gold bg-deep-teal/90 rounded-full py-1.5 px-3 inline-block">${T(`🎖️ Mở khóa thành tựu: ${a.icon} ${a.name}`, `🎖️ Achievement unlocked: ${a.icon} ${a.name}`)}</p>` : '';
        }).join('<br>');
      })()}
      <button class="clay-btn w-full bg-primary text-white font-display font-bold py-3 mt-4">${T('Tiếp tục', 'Continue')}</button>
    </div>`;
  div.querySelector('button').onclick = () => {
    div.remove(); renderAll();
    if (S.finished) { currentReport = 'season'; showTab('reports'); createConfetti(); }
    else if (r.isNewPeak) showVictory(r);
    else maybeShowEventIntro();
  };
  document.body.appendChild(div);
}


// ---------- Bản đồ chinh phục Việt Nam (theo tỉnh thành mới sau sáp nhập) ----------
/* x,y: toạ độ cũ dùng cho bản đồ SVG phẳng trước đây (nay không còn dùng,
 * giữ lại phòng cần đối chiếu) – thẻ Chinh phục và màn Đấu trường (showArena)
 * nay đều dùng chung ảnh bản đồ đất nặn 3D arena-vietnam-map-v2.webp, ghim
 * theo fx,fy: toạ độ tỉ lệ 0–1 trên ảnh đó. */
const CONQUEST_STOPS = [
  { name: 'Cần Thơ',          x: 108, y: 449, fx: .43, fy: .830, zone: 'Đồng bằng sông Cửu Long' },
  { name: 'TP. Hồ Chí Minh',  x: 150, y: 406, fx: .56, fy: .735, zone: 'Đông Nam Bộ' },
  { name: 'Khánh Hòa',        x: 208, y: 302, fx: .77, fy: .615, zone: 'Duyên hải Nam Trung Bộ' },
  { name: 'Đà Nẵng',          x: 166, y: 220, fx: .68, fy: .460, zone: 'Duyên hải miền Trung' },
  { name: 'Thanh Hóa',        x: 122, y: 140, fx: .34, fy: .255, zone: 'Bắc Trung Bộ' },
  { name: 'Hà Nội',           x: 110, y:  92, fx: .32, fy: .145, zone: 'Đồng bằng sông Hồng' },
];

function recordConquest(report) {
  const best = S.competitors.reduce((acc, c) => ((c.share || 0) > (acc.share || 0) ? c : acc), { share: 0, name: 'AI' });
  const win = report.share >= (best.share || 0);
  (S.conquest ??= []).push({ round: report.round, win, winner: win ? S.profile.teamName : best.name });
  (S.aiHistory ??= []).push(S.competitors.map(c => ({ name: c.name, share: Math.round((c.share || 0) * 10) / 10 })));
  unlockAchievements(S, report);
  return win;
}

function renderConquest() {
  const box = $('conquest-map');
  if (!box) return;
  const cq = S.conquest || [];
  const wins = cq.filter(c => c.win).length;
  const cnt = $('cq-count');
  if (cnt) cnt.textContent = `🚩 ${wins}/${ROUNDS_TOTAL}`;

  // Cùng ảnh bản đồ đất nặn 3D dùng ở màn Đấu trường (showArena), ghim theo
  // tỉ lệ fx/fy đã có sẵn cho từng tỉnh dừng chân, để hai nơi nhất quán.
  const marks = CONQUEST_STOPS.map((st, i) => {
    const c = cq[i];
    const cur = !S.finished && i === Math.min(S.round, ROUNDS_TOTAL) - 1;
    const bg = c ? (c.win ? 'bg-clay-orange' : 'bg-[#93a8ae]') : 'bg-white/70';
    const icon = c ? (c.win ? '🚩' : '🏴') : '';
    return `<div class="absolute" style="left:${st.fx * 100}%; top:${st.fy * 100}%; transform:translate(-50%,-50%); z-index:5">
      <span class="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white ${bg}${cur ? ' cq-pulse' : ''}" style="box-shadow:0 1px 4px rgba(0,0,0,.35)">${icon ? `<span style="font-size:9px; line-height:1">${icon}</span>` : ''}</span>
    </div>`;
  }).join('');
  box.innerHTML = `
    <div class="relative w-full mx-auto rounded-2xl overflow-hidden shadow-clay" style="aspect-ratio:768/1376">
      <img src="assets/illustrations/arena-vietnam-map-v2.webp" alt="Bản đồ chinh phục Việt Nam đất sét 3D – Hoàng Sa & Trường Sa là của Việt Nam" class="w-full h-full object-contain" style="background:#062b3a">
      ${marks}
    </div>`;

  const list = $('conquest-list');
  if (list) list.innerHTML = CONQUEST_STOPS.map((st, i) => {
    const c = cq[i];
    const status = c
      ? (c.win ? `<b class="text-emerald-600">🚩 ${c.winner}</b>` : `<b class="text-deep-teal/45">🏴 ${c.winner}</b>`)
      : (!S.finished && i === cq.length ? `<b class="text-primary">${T('⚔️ đang tranh', '⚔️ in contest')}</b>` : '<span class="text-deep-teal/35">⏳</span>');
    // Nhãn vòng phải luôn đọc được; tên đội thắng mới là phần được phép cắt bớt
    return `<p class="flex justify-between items-baseline gap-2"><span class="font-bold text-deep-teal/70 shrink-0">V${i + 1} · ${st.name}</span><span class="min-w-0 truncate text-right">${status}</span></p>`;
  }).join('');
}

// ---------- Giới thiệu game (Intro – hành trình chinh phục) ----------
function INTRO_SLIDES_LIST() { return [
  { icon: '🇻🇳', title: T('Việt Nam 2026', 'Vietnam 2026'), img: 'assets/illustrations/game/river-worldmap.webp',
    text: T('Nền kinh tế đang vươn mình "Hóa Rồng". Đội của bạn điều hành một công ty đồ chơi đất sét – khởi nghiệp từ Miền Tây, khát vọng mở rộng cả thị trường nội địa và quốc tế.',
            'The economy is rising to become a "Dragon". Your team runs a clay-toy startup from the Mekong Delta, aiming to expand both at home and abroad.') },
  { icon: '🏺', title: T('Doanh nghiệp & sản phẩm của bạn', 'Your company & product'), img: 'assets/illustrations/game/workshop-lumina.webp',
    text: T('Bạn điều hành một xưởng đồ chơi đất sét thủ công tại Cần Thơ, vốn khởi điểm 500 triệu ₫. Sản phẩm chủ lực: «Bộ linh vật đất sét Việt» – dòng quà tặng & đồ sưu tầm, giá tham chiếu 150.000₫/bộ. Tên doanh nghiệp chính là tên đội bạn đặt khi đăng nhập!',
            "You run a handcrafted clay-toy workshop in Cần Thơ, starting with 500 million ₫ in capital. Flagship product: the «Vietnamese Clay Mascot Set» – a gifts & collectibles line, reference price 150,000₫/set. Your company's name is the team name you entered at login!") },
  { icon: '🗺️', title: T('6 vòng · 6 tỉnh thành', '6 rounds · 6 provinces'), img: 'assets/illustrations/game/mekong-capital.webp',
    text: T('Mỗi vòng là một quý kinh doanh tại một tỉnh/thành trên bản đồ mới: Cần Thơ → TP. Hồ Chí Minh → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội. Đội thắng vòng nào sẽ cắm cờ 🚩 lên tỉnh đó! ⏱️ Mỗi vòng 5–7 phút, cả ván ≈ 30–45 phút.',
            'Each round is a business quarter in one province on the new map: Cần Thơ → Hồ Chí Minh City → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội. Whichever team wins a round plants its flag 🚩 there! ⏱️ Each round takes 5-7 minutes, the full match ≈ 30-45 minutes.') },
  { icon: '👥', title: T('Đội hình C-Suite', 'Your C-Suite lineup'), img: 'assets/illustrations/game/team-portrait.webp',
    text: T('CEO chèo lái chiến lược, CFO giữ két sắt, CMO đánh chiếm thị trường, COO vận hành xưởng, SEC ghi biên bản – bên cạnh cố vấn Lumina AI và thầy Phan Anh Tú.',
            "CEO steers strategy, CFO guards the cash box, CMO wins the market, COO runs the workshop, SEC keeps the minutes – alongside advisor Lumina AI and Prof. Phan Anh Tú.") },
  { icon: '🌏', title: T('Sau đó: ra biển lớn', 'What comes next: going global'), img: 'assets/illustrations/game/globe-walk.webp',
    text: T('Chinh phục xong Việt Nam? BizOn Go Global đang chờ – chọn 1 trong 7 thị trường quốc tế, đàm phán với đối tác bản địa và thử sức 4 phương thức thâm nhập.',
            'Conquered Vietnam? BizOn Go Global is waiting – pick 1 of 7 international markets, negotiate with local partners, and try 4 market-entry modes.') },
  { icon: '🏆', title: T('Mục tiêu của bạn', 'Your goal'), img: 'assets/illustrations/game/conquest-spiral.webp',
    text: T('Cắm nhiều cờ nhất, đạt TOP 1 thị phần Việt Nam và nhận chứng nhận hoàn thành. Sẵn sàng Bật Nghiệp? 🚀', 'Plant the most flags, reach #1 market share in Vietnam, and earn your certificate of completion. Ready to Bật Nghiệp? 🚀') },
]; }

function showIntro() {
  let idx = 0;
  const INTRO_SLIDES = INTRO_SLIDES_LIST();
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-[70] bg-deep-teal/60 backdrop-blur-sm flex items-center justify-center p-6';
  const paint = () => {
    const s = INTRO_SLIDES[idx];
    const last = idx === INTRO_SLIDES.length - 1;
    div.innerHTML = `
      <div class="clay-card max-w-sm w-full overflow-hidden text-center">
        ${s.img ? `<img src="${s.img}" alt="" class="w-full h-32 object-cover">` : ''}
        <div class="p-6">
          <p class="text-5xl mb-2">${s.icon}</p>
          <h3 class="font-display font-extrabold text-deep-teal text-xl">${s.title}</h3>
          <p class="text-sm text-deep-teal/70 mt-2 leading-relaxed">${s.text}</p>
          <div class="flex justify-center gap-1.5 mt-5">${INTRO_SLIDES.map((_, i) =>
            `<span class="w-2 h-2 rounded-full ${i === idx ? 'bg-primary' : 'bg-primary/20'}"></span>`).join('')}</div>
          <div class="flex gap-2 mt-5">
            <button id="intro-skip" class="clay-btn flex-1 bg-surface-bright text-deep-teal/60 font-bold py-3 text-sm">${idx ? T('← Trước', '← Back') : T('Bỏ qua', 'Skip')}</button>
            <button id="intro-next" class="clay-btn flex-1 bg-primary text-white font-display font-bold py-3 text-sm">${last ? T('Bắt đầu 🚀', 'Start 🚀') : T('Tiếp theo →', 'Next →')}</button>
          </div>
        </div>
      </div>`;
    div.querySelector('#intro-next').onclick = () => {
      if (last) { div.remove(); } else { idx++; paint(); }
    };
    div.querySelector('#intro-skip').onclick = () => {
      if (idx) { idx--; paint(); } else div.remove();
    };
  };
  paint();
  document.body.appendChild(div);
  try { localStorage.setItem('bizon-intro-seen', '1'); } catch (e) {}
}

// ---------- Lumina Advisor ----------
// Mỗi ảnh Lumina có bố cục nhân vật khác nhau (tóc/tay dang ra ở vị trí khác nhau) nên
// object-position cố định 1 mức sẽ cắt mất đỉnh đầu ở một số ảnh – tra theo từng ảnh để luôn thấy trọn khuôn mặt + chỏm tóc.
const LUMINA_HERO_POS = {
  'lumina-vest': '50% 8%',
  'lumina-vest-thumbsup': '50% 8%',
  'lumina-vest-worried': '50% 8%',
  'lumina-ao-dai-clap': '50% 8%',
  'lumina-ao-dai-alert': '50% 0%',
};
function renderAdvisorIntro() {
  const quota = AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0) - S.aiUsed;
  $('ai-quota').textContent = Math.max(0, quota);
  if (!$('advisor-chat').childElementCount) {
    pushLumina({ risk: 'low', log: false, clip: 'chat-02', text: T(`Xin chào, Je m'appelle Hương! 👋 Tôi là Lumina – cố vấn AI của đội ${S.profile.teamName}. Hãy chọn một câu hỏi bên dưới, tôi sẽ phân tích kịch bản "Nếu – Thì" cho bạn.`,
      `Hi, Je m'appelle Hương! 👋 I'm Lumina – the AI advisor for team ${S.profile.teamName}. Pick a question below and I'll walk you through a "What-If" scenario.`) });
  }
  // Badge biến động thị trường + ảnh cảm xúc theo biến cố hiện tại
  const ev = currentEvent(S);
  const vol = S.finished ? 'low' : ev.tone === 'bad' ? 'high' : ev.tone === 'warn' ? 'medium' : 'low';
  $('vol-dot').className = 'w-3 h-3 rounded-full ' + { low: 'bg-emerald-500', medium: 'bg-amber-500', high: 'bg-red-600' }[vol];
  $('vol-text').textContent = 'MARKET VOLATILITY: ' + vol.toUpperCase();
  // (nhãn cố định tiếng Anh theo thiết kế gốc – giữ nguyên ở cả hai ngôn ngữ)
  const heroKey = S.finished ? 'lumina-ao-dai-clap' : (ev.luminaImg || 'lumina-vest');
  const heroImg = $('advisor-hero');
  heroImg.src = 'assets/character/' + heroKey + '.webp';
  heroImg.style.objectPosition = LUMINA_HERO_POS[heroKey] || '50% 8%';
  renderRoleDeepdive();
  renderAdvisorHistory();
}

function renderAdvisorHistory() {
  const riskIco = { low: '🟢', medium: '🟡', high: '🔴' };
  $('advisor-history').innerHTML = (S.advisorHistory || []).length
    ? S.advisorHistory.slice(-8).reverse().map(h =>
        `<p class="text-deep-teal/80"><b class="text-primary">V${h.round}</b> ${riskIco[h.risk] || '🟢'} ${h.text}${h.text.length >= 160 ? '…' : ''}</p>`).join('')
    : `<p class="text-deep-teal/40">${T('Chưa có ghi chép nào – mọi lời tư vấn của Lumina sẽ được SEC lưu tại đây.', "No entries yet – every piece of Lumina's advice will be logged here by SEC.")}</p>`;
}

// ---------- What-If Analysis (mô phỏng Nếu–Thì trước Commit) ----------
function runWhatIf(role) {
  if (S.finished || S.committed) {
    alert(T('Vòng này đã khóa – mô phỏng Nếu–Thì sẽ mở lại ở vòng sau.', 'This round is locked – What-If simulation reopens next round.'));
    return;
  }
  if (S.whatIfUsed >= WHAT_IF_LIMIT) {
    $('whatif-result').innerHTML = `<div class="clay-sunken rounded-2xl p-3 text-xs text-deep-teal/70 font-semibold">${T('ERR_AI_LIMIT_REACHED – Đã hết 2 lượt mô phỏng Nếu–Thì của vòng này. Lượt sẽ làm mới sau khi Commit.', "ERR_AI_LIMIT_REACHED – You've used all 2 What-If simulations for this round. The quota resets after Commit.")}</div>`;
    return;
  }
  const d = currentDecisionInput();
  if (role === 'CFO') { d.loanAmount = S.loan > 0 ? 0 : 300; d.costCutPct = 15; }
  S.whatIfUsed++;
  S.whatIfTotal = (S.whatIfTotal || 0) + 1;
  save();
  const r = whatIfSimulate(S, role, d);
  const statusMap = {
    SAFE: ['risk-low', T('✅ AN TOÀN', '✅ SAFE')], SAFE_AND_EFFICIENT: ['risk-low', T('✅ AN TOÀN & HIỆU QUẢ', '✅ SAFE & EFFICIENT')],
    VIABLE_BUT_RISKY: ['risk-medium', T('🟡 KHẢ THI NHƯNG RỦI RO', '🟡 VIABLE BUT RISKY')], CAPITAL_EROSION: ['risk-medium', T('🟡 CẢNH BÁO MÒN VỐN', '🟡 CAPITAL EROSION WARNING')],
    HIGH_RISK: ['risk-high', T('🔴 RỦI RO CAO', '🔴 HIGH RISK')], INSOLVENCY_RISK: ['risk-high', T('🔴 NGUY CƠ MẤT THANH KHOẢN', '🔴 INSOLVENCY RISK')],
  };
  const [cls, label] = statusMap[r.status] || ['risk-medium', r.status];
  $('whatif-result').innerHTML = `
    <div class="clay-raised p-4">
      <div class="flex justify-between items-center mb-2">
        <p class="font-display font-bold text-deep-teal text-sm">${r.title}</p>
        <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${cls}">${label}</span>
      </div>
      ${r.metrics.map(m => `<div class="flex justify-between text-xs py-1 border-b border-surface-bright last:border-0">
        <span class="text-deep-teal/60">${m.label}</span>
        <span class="font-bold ${m.bad ? 'text-red-600' : 'text-deep-teal'}">${m.value}</span></div>`).join('')}
      <div class="flex gap-2 items-start mt-2.5">
        <img src="assets/character/lumina-vest.webp" alt="Lumina" class="w-8 h-8 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
        <p class="text-xs text-deep-teal/80 italic">"${r.msg}"</p>
      </div>
      <p class="text-[10px] text-deep-teal/40 mt-2 text-right">${T(`Còn ${Math.max(0, WHAT_IF_LIMIT - S.whatIfUsed)} lượt mô phỏng trong vòng này`, `${Math.max(0, WHAT_IF_LIMIT - S.whatIfUsed)} simulations left this round`)}</p>
    </div>`;
  const q = $('whatif-quota');
  if (q) q.textContent = Math.max(0, WHAT_IF_LIMIT - S.whatIfUsed);
}

// ---------- Phân tích chuyên sâu theo vai trò (CFO / COO / CMO) ----------
function renderRoleDeepdive() {
  const qrBad = S.quickRatio < 1, roiBad = S.roi < 18;
  const oeeBad = S.oee < 85, defBad = S.defect > 4.3;
  const shareNow = S.history.length ? S.history[S.history.length - 1].share : 25;
  const cmo = cmoBrain(S), cfo = cfoBrain(S), coo = cooBrain(S), sec = secBrain(S);
  const badgeCls = { RED: 'risk-high', CRISIS: 'risk-high', YELLOW: 'risk-medium', GREEN: 'risk-low', OPPORTUNITY: 'risk-low', LEVERAGE: 'risk-low', SAFE: 'risk-low' };
  const cfoCrisis = cfo.status === 'CRISIS';
  const bar = (pct, bad) => `<div class="h-2 rounded-full bg-surface-bright overflow-hidden mt-1"><div class="h-full ${bad ? 'bg-red-500' : 'bg-primary'} rounded-full" style="width:${Math.min(100, Math.max(4, pct))}%"></div></div>`;
  const brain = (b, img) => `
      <div class="clay-sunken rounded-2xl p-3 mb-3 ${b.status === 'RED' || b.status === 'CRISIS' ? 'border border-red-200' : ''}">
        <div class="flex justify-between items-center mb-1.5">
          <p class="text-[10px] font-extrabold text-deep-teal/50 uppercase">${b.metric}</p>
          <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full ${badgeCls[b.status] || 'risk-low'} ${b.status === 'CRISIS' ? 'animate-pulse' : ''}">${b.badge}</span>
        </div>
        <div class="flex gap-2 items-start">
          <img src="assets/character/${img}.webp" alt="Hương" class="w-8 h-8 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
          <p class="text-[11px] text-deep-teal/80 italic">"${b.dialogue}"</p>
          ${b.clip ? `<button onclick="playVoice('${b.clip}')" aria-label="${T('Nghe giọng Lumina', "Listen to Lumina's voice")}" title="${T('Nghe giọng Lumina', "Listen to Lumina's voice")}" class="shrink-0 text-primary text-sm leading-none mt-0.5">🔊</button>` : ''}
        </div>
        ${b.actions ? `<div class="mt-2 space-y-1">${b.actions.map(a => `<p class="text-[10px] font-bold text-deep-teal/70">👉 ${a}</p>`).join('')}</div>` : ''}
      </div>`;
  const loyaltyTrend = S.history.slice(-6).map(r =>
    `<div class="clay-bar-v" style="height:${Math.max(8, r.brandLoyalty)}%; width:10px" title="V${r.round}: ${r.brandLoyalty}%"><div class="w-full h-full rounded-full ${r.brandLoyalty < 60 ? 'bg-red-400' : 'bg-primary'}"></div></div>`).join('');
  $('role-deepdive').innerHTML = `
    <div class="clay-card p-4 ${cfoCrisis ? 'border-l-4 border-red-500' : qrBad ? 'border-l-4 border-red-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">${T('💰 Cố vấn rủi ro & ROI', '💰 Risk & ROI Advisor')} <span class="text-[10px] text-deep-teal/50">${T('· dành cho CFO', '· for CFO')}</span></p>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Khả năng thanh toán nhanh', 'Quick ratio')}</p>
          <p class="font-display font-extrabold ${qrBad ? 'text-red-600' : 'text-deep-teal'} text-xl">${S.quickRatio.toFixed(2)} ${qrBad ? '⚠️' : ''}</p>${bar(S.quickRatio * 50, qrBad)}</div>
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('ROI thực tế', 'Actual ROI')}</p>
          <p class="font-display font-extrabold ${roiBad ? 'text-deep-teal' : 'text-emerald-600'} text-xl">${S.roi}%</p>
          <p class="text-[10px] text-deep-teal/50">${T('Mục tiêu:', 'Target:')} <b>18%</b></p>${bar(S.roi * 100 / 18, roiBad)}</div>
      </div>
      <div class="flex justify-between items-center mb-3 clay-sunken rounded-2xl px-3 py-2">
        <p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Vòng quay tồn kho', 'Inventory turnover')}</p>
        <p class="font-display font-extrabold ${cfo.invDays > 45 ? 'text-red-600' : 'text-deep-teal'} text-sm">${T(`${cfo.invDays} ngày`, `${cfo.invDays} days`)} <span class="text-[9px] text-deep-teal/40 font-bold">${T('· ngưỡng an toàn ≤ 45', '· safe threshold ≤ 45')}</span></p>
      </div>
      ${brain(cfo, 'lumina-vest' + (cfoCrisis ? '-worried' : ''))}
      <div class="grid grid-cols-2 gap-2">
        <button onclick="doApproveLoan()" class="clay-btn ${S.loan > 0 ? 'bg-surface-bright text-deep-teal/40' : cfoCrisis ? 'bg-red-500 text-white' : 'bg-primary text-white'} text-xs font-bold py-2.5" ${S.loan > 0 ? 'disabled' : ''}>🏦 ${S.loan > 0 ? T('Đang vay 300tr₫', 'Borrowed 300m₫') : cfoCrisis ? T('Vay vốn KHẨN CẤP', 'EMERGENCY loan') : T('Phê duyệt khoản vay', 'Approve a loan')}</button>
        <button onclick="doCutCosts()" class="clay-btn ${S.costCutter ? 'bg-surface-bright text-deep-teal/40' : 'bg-white text-deep-teal'} text-xs font-bold py-2.5" ${S.costCutter ? 'disabled' : ''}>✂️ ${T('Cắt giảm chi phí', 'Cut costs')}</button>
      </div>
    </div>
    <div class="clay-card p-4 ${oeeBad ? 'border-l-4 border-amber-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">${T('🏭 Cảnh báo Hiệu suất Vận hành', '🏭 Operations Performance Alert')} <span class="text-[10px] text-deep-teal/50">${T('· dành cho COO', '· for COO')}</span></p>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Hiệu suất thiết bị (OEE)', 'Equipment effectiveness (OEE)')}</p>
          <p class="font-display font-extrabold ${oeeBad ? 'text-deep-teal' : 'text-emerald-600'} text-xl">${S.oee}% ${oeeBad ? '↘️' : ''}</p>
          <p class="text-[10px] text-deep-teal/50">${oeeBad ? T('Dưới mục tiêu 85% vận hành ổn định', 'Below the stable-operations target of 85%') : T('Đạt mục tiêu vận hành ổn định', 'Meeting the stable-operations target')}</p>${bar(S.oee, oeeBad)}</div>
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Tỷ lệ phế phẩm', 'Defect rate')}</p>
          <p class="font-display font-extrabold ${defBad ? 'text-red-600' : 'text-deep-teal'} text-xl">${S.defect}% ${defBad ? `<span class="text-[9px] risk-high px-1.5 py-0.5 rounded-full align-middle">${T('CẢNH BÁO ĐỎ', 'RED ALERT')}</span>` : ''}</p>
          ${defBad ? `<p class="text-[10px] text-red-600 font-bold">${T(`Vượt ngưỡng cho phép (+${(S.defect - 4.3).toFixed(1)}%)`, `Above the allowed threshold (+${(S.defect - 4.3).toFixed(1)}%)`)}</p>` : `<p class="text-[10px] text-deep-teal/50">${T('Trong ngưỡng cho phép', 'Within the allowed threshold')}</p>`}${bar(S.defect * 10, defBad)}</div>
      </div>
      ${brain(coo, coo.status === 'RED' ? 'lumina-ao-dai-alert' : 'lumina-ao-dai')}
      <div class="grid grid-cols-2 gap-2">
        <button onclick="showReportFromAdvisor()" class="clay-btn bg-deep-teal text-white text-xs font-bold py-2.5">⬆️ ${T('Nâng cấp Dây chuyền', 'Upgrade Production Line')}</button>
        <button onclick="doMaintainFromAdvisor()" class="clay-btn bg-white text-deep-teal text-xs font-bold py-2.5">🔧 ${T('Bảo trì ngay', 'Maintain now')}</button>
      </div>
    </div>
    <div class="clay-card p-4 ${sec.status === 'RED' ? 'border-l-4 border-red-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">${T('📔 Điều phối & Tuân thủ', '📔 Coordination & Compliance')} <span class="text-[10px] text-deep-teal/50">${T('· dành cho SEC', '· for SEC')}</span></p>
      ${brain(sec, sec.status === 'RED' ? 'lumina-ao-dai-alert' : 'lumina-vest')}
      <div class="grid grid-cols-2 gap-2">
        <button onclick="showTab('journal')" class="clay-btn bg-primary text-white text-xs font-bold py-2.5">${T('📔 Mở Nhật ký đội', '📔 Open Team Journal')}</button>
        <button onclick="showTab('decisions')" class="clay-btn bg-white text-deep-teal text-xs font-bold py-2.5">${T('🗳️ Bảng quyết định', '🗳️ Decisions board')}</button>
      </div>
    </div>
    <div class="clay-card p-4 ${cmo.status === 'RED' ? 'border-l-4 border-red-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">${T('📣 Chiến lược Marketing', '📣 Marketing Strategy')} <span class="text-[10px] text-deep-teal/50">${T('· dành cho CMO', '· for CMO')}</span></p>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Thị phần (Market Share)', 'Market Share')}</p>
          <p class="font-display font-extrabold text-deep-teal text-xl">${shareNow.toFixed(1)}%</p>${bar(shareNow * 2, false)}</div>
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Brand Loyalty</p>
          <p class="font-display font-extrabold ${S.brandLoyalty < 60 ? 'text-red-600' : 'text-primary'} text-xl">${S.brandLoyalty}%</p>
          ${loyaltyTrend ? `<div class="flex items-end gap-1 h-7 mt-1">${loyaltyTrend}</div>` : `<p class="text-[10px] text-deep-teal/50">Social Sentiment: <b class="text-emerald-600">Positive</b></p>${bar(S.brandLoyalty, false)}`}</div>
      </div>
      ${currentEvent(S).id === 'EV_PRICEWAR' && !S.finished ? `
        <div class="bg-surface-bright rounded-2xl p-3 mb-2">
          <p class="text-xs font-bold text-red-600 mb-1">${T('📰 TIN NÓNG · Price War', '📰 BREAKING · Price War')}</p>
          <p class="text-[11px] text-deep-teal/70">${T('Đối thủ giảm giá 15% tại kênh Modern Trade. Đừng đua giảm giá – chọn 1 trong 2 chiến thuật:', "A rival cut price 15% in the Modern Trade channel. Don't race them down – pick one of two tactics:")}</p>
          <div class="flex gap-2 mt-2"><span class="text-[10px] font-bold bg-white rounded-full px-2.5 py-1 shadow-clay">${T('CHIẾN THUẬT BUNDLING', 'BUNDLING TACTIC')}</span><span class="text-[10px] font-bold bg-white rounded-full px-2.5 py-1 shadow-clay">${T('TĂNG VALUE-ADDED', 'ADD VALUE-ADDED')}</span></div>
        </div>` : ''}
      ${brain(cmo, cmo.status === 'RED' ? 'lumina-ao-dai-alert' : 'lumina-ao-dai')}
      <button onclick="doBrandingPremium()" class="clay-btn w-full bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold py-2.5">✨ Activate Branding Premium (120tr₫)</button>
    </div>`;
}

function doApproveLoan() {
  if (!approveLoan(S)) return;
  save(); renderAll(); createConfetti();
  pushLumina({ risk: 'medium', clip: 'chat-03', text: T('Đã giải ngân khoản vay 300tr₫! Lưu ý: lãi 5%/vòng (15tr₫) sẽ trừ vào lợi nhuận mỗi vòng còn lại. Hãy dùng vốn hiệu quả để ROI vượt chi phí vốn nhé.',
    "300m₫ loan disbursed! Note: 5%/round interest (15m₫) will be deducted from profit every remaining round. Use the capital well so your ROI beats the cost of capital.") });
}
function doCutCosts() {
  if (!cutCosts(S)) return;
  save(); renderAll();
  pushLumina({ risk: 'low', clip: 'chat-04', text: T('Đã kích hoạt phương án cắt giảm chi phí – chi phí cố định vòng sau giảm 15%. Cẩn thận đừng cắt vào các khoản đầu tư dài hạn!',
    "Cost-cutting plan activated – fixed costs drop 15% next round. Be careful not to cut into long-term investments!") });
}
function doBrandingPremium() {
  if (!brandingPremium(S)) { alert(T('ERR_INSUFFICIENT_FUNDS – Cần 120tr₫ để kích hoạt Branding Premium.', 'ERR_INSUFFICIENT_FUNDS – You need 120m₫ to activate Branding Premium.')); return; }
  save(); renderAll(); createConfetti();
  pushLumina({ risk: 'low', clip: 'chat-05', text: T('Branding Premium đã kích hoạt! Giá trị thương hiệu tăng – thị phần và Brand Loyalty sẽ cải thiện từ vòng sau. 🎉',
    'Branding Premium activated! Brand value is up – market share and Brand Loyalty will improve from next round. 🎉') });
}
function showReportFromAdvisor() { currentReport = 'energy'; showTab('reports'); }
function doMaintainFromAdvisor() {
  if (!doMaintenance(S)) { alert(T('ERR_INSUFFICIENT_FUNDS – Cần 60tr₫ trong ví để bảo trì.', 'ERR_INSUFFICIENT_FUNDS – You need 60m₫ in your wallet for maintenance.')); return; }
  save(); renderAll();
  pushLumina({ risk: 'low', clip: 'chat-06', text: T('Đã lên lịch bảo trì khẩn! OEE sẽ cải thiện +3% và tỷ lệ phế phẩm giảm ở vòng tới. 🔧',
    'Emergency maintenance scheduled! OEE will improve +3% and the defect rate will drop next round. 🔧') });
}

function pushLumina(advice) {
  // Ghi vào Bộ nhớ doanh nghiệp (ai_advisor_history) – trừ lời chào mở đầu
  if (S && advice.log !== false && S.history) {
    S.advisorHistory ??= [];
    S.advisorHistory.push({ round: Math.min(S.round, ROUNDS_TOTAL), risk: advice.risk, text: advice.text.slice(0, 160) });
    if (S.advisorHistory.length > 20) S.advisorHistory.shift();
    save();
  }
  const riskLabel = { low: T('🟢 Cơ hội', '🟢 Opportunity'), medium: T('🟡 Thận trọng', '🟡 Caution'), high: T('🔴 Rủi ro cao', '🔴 High risk') }[advice.risk];
  const el = document.createElement('div');
  el.className = 'flex gap-3 items-start max-w-[92%]';
  el.innerHTML = `
    <img src="assets/character/lumina-vest.webp" alt="Lumina" class="w-9 h-9 shrink-0 rounded-full object-cover shadow-clay" style="object-position:50% 12%">
    <div class="clay-bubble-in p-4 flex-1">
      <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 risk-${advice.risk}">${riskLabel}</span>
      <p class="text-sm text-deep-teal">${advice.text}</p>
    </div>`;
  $('advisor-chat').appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  if (advice.clip) playVoice(advice.clip);   // có bản thu → dùng giọng thật
  else speakLumina(advice.text);             // chưa thu → giọng máy dự phòng
}

function pushUserMsg(text) {
  const el = document.createElement('div');
  el.className = 'flex justify-end';
  el.innerHTML = `<div class="clay-bubble-out p-4 max-w-[85%]"><p class="text-sm">${text.replace(/</g, '&lt;')}</p></div>`;
  $('advisor-chat').appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ---------- Giọng nói (TTS/STT – theo màn hình Chat cố vấn AI giọng nói) ----------
let voiceEnabled = localStorage.getItem('bizon-voice') !== 'off';
let voiceGender = localStorage.getItem('bizon-voice-gender') || 'female';
let recognizing = false, recognition = null;

function pickViVoice() {
  const voices = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('vi'));
  if (!voices.length) return null;
  const male = voices.find(v => /nam|male/i.test(v.name));
  const female = voices.find(v => /n[uữ]|female|hoai|linh|my/i.test(v.name)) || voices[0];
  return voiceGender === 'male' ? (male || voices[0]) : female;
}

function speakLumina(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const clean = text.replace(/ERR_[A-Z_]+ – /g, '').replace(/[📣💲⚠️🎉🔧🟢🟡🔴👋]/g, '');
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'vi-VN';
  const v = pickViVoice();
  if (v) u.voice = v;
  u.rate = 1.02;
  u.onstart = () => { const b = $('speaking-bar'); if (b) { b.classList.remove('hidden'); b.classList.add('flex'); } };
  u.onend = u.onerror = () => { const b = $('speaking-bar'); if (b) { b.classList.add('hidden'); b.classList.remove('flex'); } };
  speechSynthesis.speak(u);
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  localStorage.setItem('bizon-voice', voiceEnabled ? 'on' : 'off');
  if (!voiceEnabled) speechSynthesis.cancel();
  $('voice-toggle').textContent = voiceEnabled ? T('🔊 Bật', '🔊 On') : T('🔇 Tắt', '🔇 Off');
  $('voice-toggle').classList.toggle('bg-primary-container/30', voiceEnabled);
}

function setVoiceGender(g) {
  voiceGender = g;
  localStorage.setItem('bizon-voice-gender', g);
  const f = $('voice-female'), m = $('voice-male');
  f.className = 'px-3 py-1 rounded-full text-[11px] font-bold ' + (g === 'female' ? 'bg-white shadow-md text-primary' : 'text-deep-teal/50');
  m.className = 'px-3 py-1 rounded-full text-[11px] font-bold ' + (g === 'male' ? 'bg-white shadow-md text-primary' : 'text-deep-teal/50');
}

function toggleMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert(T('Trình duyệt này chưa hỗ trợ nhận giọng nói – hãy dùng Chrome trên Android hoặc máy tính.', 'This browser does not support voice recognition – use Chrome on Android or desktop.')); return; }
  if (recognizing) { recognition.stop(); return; }
  recognition = new SR();
  recognition.lang = T('vi-VN', 'en-US');
  recognition.interimResults = false;
  recognition.onstart = () => { recognizing = true; $('mic-btn').classList.add('bg-red-100', 'animate-pulse'); };
  recognition.onend = () => { recognizing = false; $('mic-btn').classList.remove('bg-red-100', 'animate-pulse'); };
  recognition.onresult = e => {
    const text = e.results[0][0].transcript;
    $('chat-input').value = text;
    sendChat();
  };
  recognition.start();
}

function chatRespond(text) {
  const t = text.toLowerCase();
  if (/xin chào|chào|hello|hi |^hi$|^hey/.test(t)) return { risk: 'low', free: true, text: T(`Chào bạn! Tôi là Hương – cố vấn AI của đội ${S.profile.teamName}. Bạn có thể hỏi tôi về giá bán, marketing, rủi ro, vốn vay hay vận hành nhé!`,
    `Hi there! I'm Hương – the AI advisor for team ${S.profile.teamName}. You can ask me about pricing, marketing, risk, loans, or operations!`) };
  if (/giá|price/.test(t)) return luminaAdvice(S, 'pricing');
  if (/marketing|quảng cáo|truyền thông|advertis/.test(t)) return luminaAdvice(S, 'marketing');
  if (/vay|vốn|thanh khoản|tiền mặt|dòng tiền|loan|cash|liquidity/.test(t)) return { risk: S.quickRatio < 1 ? 'high' : 'low', text: T(`Tình hình tài chính: ví còn ${money(S.balance)}, khả năng thanh toán nhanh ${S.quickRatio.toFixed(2)}${S.quickRatio < 1.1 ? ' – dưới ngưỡng an toàn 1.1, nên cân nhắc khoản vay đệm' : ' – an toàn'}. ROI hiện tại ${S.roi}%.`,
    `Financial status: wallet at ${money(S.balance)}, quick ratio ${S.quickRatio.toFixed(2)}${S.quickRatio < 1.1 ? ' – below the 1.1 safety threshold, consider a buffer loan' : ' – safe'}. Current ROI ${S.roi}%.`) };
  if (/oee|máy|bảo trì|dây chuyền|vận hành|sản xuất|maintenance|production|factory/.test(t)) return { risk: S.oee < 80 ? 'medium' : 'low', text: T(`Vận hành: OEE ${S.oee}% (mục tiêu 85%), phế phẩm ${S.defect}%. ${S.oee < 85 ? 'Tôi khuyên COO nên bảo trì ngay hoặc nâng cấp dây chuyền tiêu thụ điện cao nhất trong báo cáo ⚡ Năng lượng.' : 'Nhà máy đang vận hành ổn định!'}`,
    `Operations: OEE ${S.oee}% (target 85%), defect rate ${S.defect}%. ${S.oee < 85 ? "I'd suggest the COO run maintenance now or upgrade the highest-consuming line in the ⚡ Energy report." : 'The factory is running smoothly!'}`) };
  if (/thị phần|đối thủ|cạnh tranh|market share|rival|competit/.test(t)) {
    const last = S.history[S.history.length - 1];
    return { risk: 'low', text: T(`Thị phần hiện tại ${(last ? last.share : 25).toFixed(1)}%, Brand Loyalty ${S.brandLoyalty}%. Ba đối thủ: Alpha Dynamics (giá rẻ), Mekong Ventures (cân bằng), Star Clay Co. (cao cấp). Muốn phân tích sâu hơn hãy xem thẻ CMO bên dưới nhé!`,
      `Current market share ${(last ? last.share : 25).toFixed(1)}%, Brand Loyalty ${S.brandLoyalty}%. Three rivals: Alpha Dynamics (budget), Mekong Ventures (balanced), Star Clay Co. (premium). For a deeper analysis, check the CMO card below!`) };
  }
  return luminaAdvice(S, 'risk');
}

function sendChat() {
  const input = $('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  pushUserMsg(text);
  const reply = chatRespond(text);
  if (!reply.free) {
    const quota = AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0);
    if (S.aiUsed >= quota) {
      pushLumina({ risk: 'medium', log: false, clip: 'chat-07', text: T('ERR_AI_LIMIT_REACHED – Bạn đã dùng hết lượt tư vấn của vòng này. Lượt sẽ làm mới sau khi Commit quyết định nhé!', "ERR_AI_LIMIT_REACHED – You've used all your advisor turns this round. It resets after you Commit your decisions!") });
      return;
    }
    S.aiUsed++; S.aiAskedTotal++; save(); renderAdvisorIntro();
  }
  setTimeout(() => pushLumina(reply), 350);
}

function askLumina(topic) {
  const quota = AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0);
  if (S.aiUsed >= quota) {
    pushLumina({ risk: 'medium', text: T('ERR_AI_LIMIT_REACHED – Lumina đang bận! Bạn đã dùng hết lượt tư vấn của vòng này. Lượt hỏi sẽ được làm mới sau khi commit quyết định.', "ERR_AI_LIMIT_REACHED – Lumina is busy! You've used all your advisor turns this round. Your quota refreshes after you commit decisions.") });
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
  if (kind === 'cvp') { renderCvpReport(body); return; }
  if (kind === 'hr') { renderHrReport(body); return; }
  if (kind === 'bmc') { renderBmcReport(body); return; }
  if (kind === 'cash') { renderCashReport(body); return; }
  if (kind === 'rival') { renderRivalCostReport(body); return; }
  if (kind === 'season') { renderSeasonReport(body); return; }
  if (!S.history.length) {
    body.innerHTML = `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${T('Chưa có dữ liệu – hãy hoàn thành vòng đầu tiên!', 'No data yet – complete the first round!')}</div>`;
    return;
  }
  const rows = S.history.map(r => {
    if (kind === 'pnl') return { label: 'V' + r.round, main: r.netProfit, sub: T(`DT ${money(r.revenue)}`, `Rev ${money(r.revenue)}`) };
    if (kind === 'cash') return { label: 'V' + r.round, main: r.balance, sub: T(`LN ${money(r.netProfit)}`, `Profit ${money(r.netProfit)}`) };
    return { label: 'V' + r.round, main: -r.depreciation, sub: T(`Công suất ${(S.machineCapacity).toLocaleString('vi-VN')}`, `Capacity ${(S.machineCapacity).toLocaleString('en-US')}`) };
  });
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.main)), 1);
  const title = { pnl: T('Lợi nhuận ròng theo vòng', 'Net profit by round'), cash: T('Số dư ví ảo theo vòng', 'Virtual wallet balance by round'), dep: T('Chi phí khấu hao theo vòng', 'Depreciation cost by round') }[kind];
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
            <span class="font-bold text-deep-teal">${r.event.icon} ${T('Vòng', 'Round')} ${r.round}</span>
            <span class="text-right"><span class="font-display font-bold ${rows[i].main >= 0 ? 'text-deep-teal' : 'text-orange-600'}">${money(rows[i].main)}</span>
            <span class="block text-[10px] text-deep-teal/50">${rows[i].sub}</span></span>
          </div>`).join('')}
      </div>
    </div>`;
}

// ---------- Phân tích Dòng tiền chi tiết (3 hoạt động) ----------
function renderCashReport(body) {
  if (!S.history.length) {
    body.innerHTML = `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${T('Chưa có dữ liệu – hãy hoàn thành vòng đầu tiên!', 'No data yet – complete the first round!')}</div>`;
    return;
  }
  const rows = S.history.map(r => {
    const operating = r.revenue - r.cogs - r.marketing - r.rd - r.fixed - (r.wageCost || 0) - (r.trainingCost || 0) - (r.holding || 0);
    const investing = -r.depreciation;
    const financing = -(r.loanInterest || 0) - (r.creditInterest || 0);
    return { r, operating, investing, financing, net: operating + investing + financing };
  });
  const last = rows[rows.length - 1];
  const totalIn = last.r.revenue, totalOut = totalIn - last.net;
  body.innerHTML = `
    <div class="clay-card p-5 mb-3 text-center">
      <p class="text-[11px] font-bold text-deep-teal/50 uppercase tracking-wider">${T(`Tổng dòng tiền thuần – Vòng ${last.r.round}`, `Total net cash flow – Round ${last.r.round}`)}</p>
      <p class="font-display font-extrabold ${last.net >= 0 ? 'text-primary' : 'text-red-600'} text-3xl">${last.net >= 0 ? '+' : '−'} ${money(Math.abs(last.net))}</p>
      <div class="grid grid-cols-2 gap-3 mt-3">
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Tổng thu (Inflow)', 'Total inflow')}</p><p class="font-bold text-emerald-600">+ ${money(totalIn)}</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Tổng chi (Outflow)', 'Total outflow')}</p><p class="font-bold text-red-600">− ${money(totalOut)}</p></div>
      </div>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-2">${T(`Theo hoạt động – Vòng ${last.r.round}`, `By activity – Round ${last.r.round}`)}</h3>
      ${[[T('🏢 Hoạt động Kinh doanh', '🏢 Operating Activities'), last.operating], [T('🏗️ Hoạt động Đầu tư (khấu hao)', '🏗️ Investing Activities (depreciation)'), last.investing], [T('🏦 Hoạt động Tài chính (lãi vay)', '🏦 Financing Activities (loan interest)'), last.financing]].map(([lbl, v]) => `
        <div class="flex justify-between text-sm py-2 border-b border-surface-bright last:border-0">
          <span class="text-deep-teal/80">${lbl}</span>
          <span class="font-bold ${v >= 0 ? 'text-emerald-600' : 'text-red-600'}">${v >= 0 ? '+' : '−'} ${money(Math.abs(v))}</span>
        </div>`).join('')}
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T('Số dư ví theo vòng', 'Wallet balance by round')}</h3>
      <div class="flex items-end gap-2 h-32">
        ${S.history.map(r => `<div class="flex-1 flex flex-col items-center justify-end h-full">
          <div class="w-full rounded-t-xl bg-gradient-to-t from-primary to-primary-container" style="height:${Math.max(8, Math.min(100, r.balance / 10))}%"></div>
          <p class="text-[10px] font-bold text-deep-teal/60 mt-1">V${r.round}</p>
        </div>`).join('')}
      </div>
    </div>
    <div class="clay-card p-4 bg-primary-container/10 flex gap-3 items-start">
      <img src="assets/character/lumina-vest.webp" alt="Mentor Hương" class="w-10 h-10 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
      <div><p class="font-display font-bold text-primary text-sm">Mentor Hương</p>
      <p class="text-xs text-deep-teal/80 italic mt-0.5">"${last.net >= 0
        ? T('Dòng tiền thuần dương – nền tảng tốt! Hãy cân nhắc tái đầu tư vào R&D hoặc nâng cấp dây chuyền để lãi kép ở các vòng sau.',
            'Positive net cash flow – a solid foundation! Consider reinvesting in R&D or upgrading the line to compound gains in later rounds.')
        : T('Dòng tiền thuần đang âm. Ưu tiên số 1: giảm chi phí biến đổi lớn nhất và cân nhắc kỳ hạn thanh toán ngắn hơn để thu tiền về nhanh.',
            'Net cash flow is negative. Priority #1: cut your largest variable cost and consider a shorter payment term to collect cash faster.')}"</p></div>
    </div>`;
}

// ---------- 🆚 Tình báo chi phí đối thủ – so sánh ngân sách với 3 đối thủ AI ----------
const RIVAL_STYLE_BASE = { aggressive: { price: 125, mkt: 90 }, balanced: { price: 150, mkt: 60 }, premium: { price: 195, mkt: 75 } };
/* Ván chơi cũ chưa lưu tình báo trong report → ước lượng từ phong cách từng đối thủ */
function rivalIntelOf(r) {
  if (r.rivals && r.rivals.length) return r.rivals;
  return S.competitors.map(c => {
    const b = RIVAL_STYLE_BASE[c.style] || { price: 150, mkt: 55 };
    const units = 12000 * (c.share || 25) / 100;
    return { name: c.name, style: c.style, price: b.price, mkt: b.mkt,
      share: Math.round((c.share || 25) * 10) / 10,
      revenue: Math.round(units * b.price / 1000),
      cost: Math.round(units * 45 / 1000 + b.mkt + 30), est: true };
  });
}
function renderRivalCostReport(body) {
  const last = S.history[S.history.length - 1];
  if (!last) {
    body.innerHTML = `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${T('Chưa có dữ liệu tình báo – hãy hoàn thành vòng đầu tiên!', 'No intel data yet – complete the first round!')}</div>`;
    return;
  }
  const rivals = rivalIntelOf(last);
  const est = rivals.some(x => x.est);
  const myCost = last.cogs + last.marketing + last.rd + last.fixed + last.depreciation
    + (last.holding || 0) + (last.loanInterest || 0) + (last.wageCost || 0)
    + (last.trainingCost || 0) + (last.creditInterest || 0);

  // --- Băng ghế tổng chi phí: 4 cột xếp từ thấp đến cao, đội bạn nổi bật ---
  const bench = [
    { name: S.profile.teamName, cost: Math.round(myCost), me: true, img: 'assets/character/team/ceo.webp' },
    ...rivals.map(x => ({ name: x.name, cost: x.cost, img: RIVAL_IMGS[x.style] })),
  ].sort((a, b) => a.cost - b.cost);
  const maxCost = Math.max(...bench.map(b => b.cost), 1);
  const priciest = bench[bench.length - 1];
  const myRank = bench.findIndex(b => b.me);
  const gapVsPriciest = priciest.me ? 0 : Math.round(100 * (priciest.cost - myCost) / Math.max(1, priciest.cost));

  // --- Marketing: chi thật của từng đối thủ vòng này ---
  const mktRows = [
    { name: S.profile.teamName, mkt: last.marketing, me: true, img: 'assets/character/team/ceo.webp' },
    ...rivals.map(x => ({ name: x.name, mkt: x.mkt, img: RIVAL_IMGS[x.style] })),
  ].sort((a, b) => b.mkt - a.mkt);
  const maxMkt = Math.max(...mktRows.map(m => m.mkt), 1);
  const topSpender = mktRows[0];
  const myMroi = last.marketing > 0 ? Math.round(10 * last.revenue / last.marketing) / 10 : null;

  // --- R&D: lợi thế riêng – đối thủ AI không đầu tư R&D, giá thành họ đứng yên ---
  const rdCum = Math.round(S.rdCumulative || 0);
  const costDownPct = Math.min(20, Math.round((S.rdCumulative || 0) / 1500 * 1000) / 10);
  const rivalUnit = 45; // giá thành gốc/sp của đối thủ (nghìn ₫), không giảm theo R&D
  const unitGap = Math.round(10 * (rivalUnit - last.unitCost)) / 10;

  // --- Hiệu quả: chi phí đổi lấy mỗi 1% thị phần ---
  const myCps = Math.round(10 * myCost / Math.max(0.1, last.share)) / 10;
  const rivalCps = rivals.map(x => ({ name: x.name, cps: Math.round(10 * x.cost / Math.max(0.1, x.share)) / 10 }))
    .sort((a, b) => a.cps - b.cps);
  const bestRival = rivalCps[0];

  const insight = last.marketing < (rivals.find(x => x.style === 'aggressive') || { mkt: 90 }).mkt * 0.6
    ? T(`Alpha Dynamics đang chi ${(rivals.find(x => x.style === 'aggressive') || { mkt: 90 }).mkt}tr cho marketing – hơn hẳn mức ${Math.round(last.marketing)}tr của bạn. Độ phủ thương hiệu sẽ lép vế nếu kéo dài; cân nhắc tăng ngân sách hoặc bù bằng R&D tạo khác biệt.`,
        `Alpha Dynamics is spending ${(rivals.find(x => x.style === 'aggressive') || { mkt: 90 }).mkt}m on marketing – well above your ${Math.round(last.marketing)}m. Your brand reach will fall behind if this continues; consider raising the budget or offsetting with R&D differentiation.`)
    : myCps <= bestRival.cps
      ? T(`Xuất sắc! Mỗi 1% thị phần chỉ tốn của bạn ${myCps}tr – rẻ hơn cả đối thủ hiệu quả nhất (${bestRival.name}: ${bestRival.cps}tr). Bộ máy đang vận hành tinh gọn, có thể mạnh dạn mở rộng.`,
          `Excellent! Each 1% of market share only costs you ${myCps}m – cheaper than even the most efficient rival (${bestRival.name}: ${bestRival.cps}m). Your operation is lean; feel free to expand boldly.`)
      : T(`Mỗi 1% thị phần đang tốn của bạn ${myCps}tr, trong khi ${bestRival.name} chỉ mất ${bestRival.cps}tr. Hãy rà soát khoản chi lớn nhất trong Cấu trúc chi phí (tab CVP) trước khi tăng thêm ngân sách.`,
          `Each 1% of market share is costing you ${myCps}m, while ${bestRival.name} only spends ${bestRival.cps}m. Review your largest expense in the Cost Structure (CVP tab) before adding more budget.`);

  const avatar = (b, size) => b.img
    ? `<img src="${b.img}" class="${size} rounded-full object-cover object-top border ${b.me ? 'border-clay-gold' : 'border-white/40'} shrink-0">`
    : '';

  body.innerHTML = `
    <div class="clay-card p-5 mb-3 text-center">
      <p class="text-[11px] font-bold text-deep-teal/50 uppercase tracking-wider">${T(`🕵️ Tình báo chi phí – Vòng ${last.round}${est ? ' (ước lượng)' : ''}`, `🕵️ Cost Intel – Round ${last.round}${est ? ' (estimated)' : ''}`)}</p>
      <p class="font-display font-extrabold text-deep-teal text-3xl">${money(Math.round(myCost))}</p>
      <p class="text-xs text-deep-teal/60 mt-0.5">${T(`tổng chi phí của đội bạn – đứng thứ <b>${myRank + 1}/4</b> từ thấp đến cao`, `your team's total cost – ranked <b>${myRank + 1}/4</b> from lowest to highest`)}</p>
      ${gapVsPriciest > 0 ? `<p class="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full py-1.5 px-3 inline-block">${T(`✅ Thấp hơn ${priciest.name} ${gapVsPriciest}%`, `✅ ${gapVsPriciest}% lower than ${priciest.name}`)}</p>`
        : `<p class="mt-2 text-xs font-bold text-orange-600 bg-orange-50 rounded-full py-1.5 px-3 inline-block">${T('⚠️ Bạn đang là đội chi tiêu cao nhất sàn đấu', '⚠️ You are the highest-spending team in the arena')}</p>`}
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T('🧾 Tổng chi phí: Bạn vs 3 đối thủ', '🧾 Total cost: You vs 3 rivals')}</h3>
      <div class="flex items-end gap-3 h-36">
        ${bench.map(b => `
        <div class="flex-1 h-full flex flex-col justify-end items-center">
          <p class="text-[10px] font-extrabold ${b.me ? 'text-primary' : 'text-deep-teal/60'} mb-1">${money(b.cost)}</p>
          <div class="w-full rounded-t-xl ${b.me ? 'bg-gradient-to-t from-primary to-primary-container ring-2 ring-clay-gold' : 'bg-gradient-to-t from-slate-400 to-slate-200'}" style="height:${Math.max(10, b.cost / maxCost * 100)}%"></div>
        </div>`).join('')}
      </div>
      <div class="flex gap-3 mt-1.5">
        ${bench.map(b => `<div class="flex-1 flex flex-col items-center gap-0.5">${avatar(b, 'w-7 h-7')}<p class="text-[9px] font-bold ${b.me ? 'text-primary' : 'text-deep-teal/60'} text-center leading-tight">${b.me ? T('🏺 Đội bạn', '🏺 Your team') : b.name}</p></div>`).join('')}
      </div>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-1">${T('📣 Ngân sách Marketing vòng này', "📣 This round's Marketing budget")}</h3>
      <p class="text-[11px] text-deep-teal/55 mb-3">${T('Chi thật của từng đội trên sàn (không phải ước tính chung chung)', "Actual spend from each team in the arena (not a generic estimate)")}</p>
      ${mktRows.map(m => `
      <div class="flex items-center gap-2 py-1.5">
        ${avatar(m, 'w-6 h-6')}
        <span class="w-24 shrink-0 text-[11px] font-bold ${m.me ? 'text-primary' : 'text-deep-teal/70'} truncate">${m.me ? T('🏺 Đội bạn', '🏺 Your team') : m.name}</span>
        <div class="flex-1 h-3 rounded-full bg-surface-bright overflow-hidden"><div class="h-full rounded-full ${m.me ? 'bg-gradient-to-r from-clay-orange to-clay-gold' : 'bg-primary/35'}" style="width:${Math.max(4, m.mkt / maxMkt * 100)}%"></div></div>
        <span class="w-12 text-right text-[11px] font-extrabold text-deep-teal">${Math.round(m.mkt)}tr</span>
      </div>`).join('')}
      <div class="clay-sunken rounded-2xl p-3 mt-2.5 flex items-center gap-2">
        <span class="text-lg">${myMroi !== null && myMroi >= 3 ? '🎯' : '📉'}</span>
        <p class="text-[11px] text-deep-teal/70">${myMroi !== null
          ? T(`Mỗi 1tr marketing của bạn đem về <b>${myMroi}tr</b> doanh thu${myMroi >= 3 ? ' – trên chuẩn hiệu quả 3.0, đáng để giữ nhịp chi.' : ' – dưới chuẩn 3.0, thông điệp quảng cáo cần sắc bén hơn thay vì chỉ tăng tiền.'}`,
              `Every 1m of your marketing brings in <b>${myMroi}m</b> revenue${myMroi >= 3 ? ' – above the 3.0 efficiency benchmark, worth keeping up the pace.' : ' – below the 3.0 benchmark, the ad message needs to be sharper rather than just spending more.'}`)
          : T('Bạn chưa chi marketing vòng này – đối thủ đang một mình phủ sóng thị trường.', "You haven't spent on marketing this round – rivals have the market to themselves.")}
        ${topSpender.me ? '' : ' ' + T(`Chi mạnh tay nhất sàn hiện là <b>${topSpender.name}</b> (${Math.round(topSpender.mkt)}tr).`, `The biggest spender in the arena right now is <b>${topSpender.name}</b> (${Math.round(topSpender.mkt)}m).`)}</p>
      </div>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-1">${T('📈 ROI Marketing: 1tr quảng cáo đổi được bao nhiêu doanh thu?', '📈 Marketing ROI: how much revenue per 1m spent on ads?')}</h3>
      <p class="text-[11px] text-deep-teal/55 mb-3">${T('Chuẩn hiệu quả của ngành: 3.0tr doanh thu cho mỗi 1tr marketing', 'Industry benchmark: 3.0m revenue for every 1m of marketing')}</p>
      ${(() => {
        const roiRows = [
          { name: T('🏺 ', '🏺 ') + S.profile.teamName, roi: myMroi || 0, me: true },
          ...rivals.map(x => ({ name: x.name, roi: x.mkt > 0 ? Math.round(10 * (x.revenue || 0) / x.mkt) / 10 : 0 })),
        ].sort((a, b) => b.roi - a.roi);
        const maxRoi = Math.max(...roiRows.map(x => x.roi), 3);
        return roiRows.map((x, i) => `
        <div class="flex items-center gap-2 py-1.5">
          <span class="w-5 text-center text-xs">${['🥇', '🥈', '🥉', '4️⃣'][i]}</span>
          <span class="w-24 shrink-0 text-[11px] font-bold ${x.me ? 'text-primary' : 'text-deep-teal/70'} truncate">${x.name}</span>
          <div class="flex-1 h-3 rounded-full bg-surface-bright overflow-hidden relative">
            <div class="h-full rounded-full ${x.me ? 'bg-gradient-to-r from-clay-orange to-clay-gold' : ''}" style="width:${Math.max(4, x.roi / maxRoi * 100)}%${x.me ? '' : x.roi >= 3 ? ';background:rgba(16,185,129,.55)' : ';background:rgba(0,102,135,.35)'}"></div>
            <div class="absolute top-0 bottom-0 w-0.5 bg-deep-teal/30" style="left:${Math.min(97, 3 / maxRoi * 100)}%"></div>
          </div>
          <span class="w-12 text-right text-[11px] font-extrabold ${x.roi >= 3 ? 'text-emerald-600' : 'text-deep-teal'}">×${x.roi}</span>
        </div>`).join('') + `
        <p class="text-[10px] text-deep-teal/50 font-semibold mt-1.5">${T(`Vạch dọc = chuẩn ngành 3.0. ${roiRows[0].me ? 'Đội bạn đang dẫn đầu hiệu quả quảng cáo trên sàn! 🎯' : `${roiRows[0].name} đang có hiệu quả quảng cáo tốt nhất sàn (×${roiRows[0].roi}).`}`,
          `Dashed line = industry benchmark 3.0. ${roiRows[0].me ? "Your team leads the arena on ad efficiency! 🎯" : `${roiRows[0].name} currently has the best ad efficiency in the arena (×${roiRows[0].roi}).`}`)}</p>`;
      })()}
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-1">${T('🔬 R&D – vũ khí đối thủ không có', "🔬 R&D – a weapon rivals don't have")}</h3>
      <p class="text-[11px] text-deep-teal/55 mb-3">${T(`Cả 3 đối thủ AI không đầu tư R&D: giá thành của họ đứng yên ở ${rivalUnit}k/sp, còn của bạn giảm dần theo tích lũy`, `None of the 3 AI rivals invest in R&D: their unit cost stays fixed at ${rivalUnit}k/unit, while yours keeps falling as you accumulate R&D`)}</p>
      <div class="grid grid-cols-2 gap-2.5">
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('R&D tích lũy', 'Cumulative R&D')}</p><p class="font-display font-extrabold text-primary text-lg">${rdCum}tr</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Giá thành đã giảm', 'Unit cost reduced')}</p><p class="font-display font-extrabold text-primary text-lg">${costDownPct}%</p><p class="text-[9px] text-deep-teal/50 font-semibold">${T('tối đa 20%', 'max 20%')}</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Giá thành/sp của bạn', 'Your unit cost')}</p><p class="font-display font-extrabold text-deep-teal text-lg">${Math.round(last.unitCost * 10) / 10}k</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('So với đối thủ', 'vs rivals')}</p><p class="font-display font-extrabold ${unitGap > 0 ? 'text-emerald-600' : 'text-deep-teal'} text-lg">${unitGap > 0 ? '−' + unitGap + 'k/sp' : T('Ngang nhau', 'Even')}</p></div>
      </div>
      <div class="h-2.5 rounded-full bg-surface-bright overflow-hidden mt-3"><div class="h-full rounded-full bg-gradient-to-r from-primary to-clay-gold" style="width:${Math.min(100, costDownPct / 20 * 100)}%"></div></div>
      <p class="text-[10px] text-deep-teal/50 font-semibold mt-1">${T(`Tiến độ khai thác lợi thế R&D: ${Math.min(100, Math.round(costDownPct / 20 * 100))}%`, `R&D advantage progress: ${Math.min(100, Math.round(costDownPct / 20 * 100))}%`)}</p>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T('⚖️ Hiệu quả: chi phí đổi lấy 1% thị phần', '⚖️ Efficiency: cost per 1% of market share')}</h3>
      ${[{ name: T('🏺 ', '🏺 ') + S.profile.teamName, cps: myCps, me: true }, ...rivalCps].sort((a, b) => a.cps - b.cps).map((x, i) => `
      <div class="flex items-center gap-2 text-xs py-1.5 border-b border-surface-bright last:border-0">
        <span class="w-5 text-center">${['🥇', '🥈', '🥉', '4️⃣'][i]}</span>
        <span class="flex-1 font-bold ${x.me ? 'text-primary' : 'text-deep-teal/70'}">${x.name}</span>
        <span class="font-extrabold ${x.me ? 'text-primary' : 'text-deep-teal'}">${x.cps}tr / 1%</span>
      </div>`).join('')}
    </div>
    <div class="clay-card p-4 bg-primary-container/10 flex gap-3 items-start">
      <img src="assets/character/lumina-vest.webp" alt="Mentor Hương" class="w-10 h-10 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
      <div><p class="font-display font-bold text-primary text-sm">${T('Mentor Hương · Tình báo cạnh tranh', 'Mentor Hương · Competitive Intel')}</p>
      <p class="text-xs text-deep-teal/80 italic mt-0.5">"${insight}"</p></div>
    </div>`;
}

// ---------- 🏁 Tổng kết mùa giải – báo cáo năm kiểu Stitch: hero, xếp hạng, thành tựu ----------
function renderSeasonReport(body) {
  if (!S.history.length) {
    body.innerHTML = `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${T('Chưa có dữ liệu – hãy hoàn thành vòng đầu tiên!', 'No data yet – complete the first round!')}</div>`;
    return;
  }
  const rounds = S.history;
  const last = rounds[rounds.length - 1];
  const totalRev = rounds.reduce((a, r) => a + r.revenue, 0);
  const totalProfit = rounds.reduce((a, r) => a + r.netProfit, 0);
  const shareFirst = rounds[0].share, shareLast = last.share;
  const growth = Math.round((shareLast - shareFirst) * 10) / 10;
  const brandScore = Math.round((last.brandLoyalty || 45) / 10 * 10) / 10;

  // Gộp số liệu cả mùa của từng đối thủ từ tình báo lưu theo vòng
  const agg = {};
  rounds.forEach(r => rivalIntelOf(r).forEach(x => {
    const a = (agg[x.name] ??= { name: x.name, style: x.style, rev: 0, profit: 0, cost: 0, shareFirst: null, shareLast: 0 });
    a.rev += x.revenue || 0; a.profit += x.profit || 0; a.cost += x.cost || 0;
    a.shareFirst ??= x.share; a.shareLast = x.share;
  }));
  const teamCostTotal = rounds.reduce((a, r) => a + r.revenue - r.netProfit, 0);
  const ranking = [
    { name: S.profile.teamName, me: true, img: 'assets/character/team/ceo.webp',
      share: shareLast, growth, profit: Math.round(totalProfit),
      roi: Math.round(1000 * totalProfit / Math.max(1, teamCostTotal)) / 10 },
    ...Object.values(agg).map(a => ({ name: a.name, img: RIVAL_IMGS[a.style],
      share: a.shareLast, growth: Math.round((a.shareLast - (a.shareFirst || 25)) * 10) / 10,
      profit: Math.round(a.profit), roi: Math.round(1000 * a.profit / Math.max(1, a.cost)) / 10 })),
  ].sort((a, b) => b.share - a.share);
  const myRank = ranking.findIndex(x => x.me) + 1;
  const champion = ranking[0].me;

  const maxRev = Math.max(...rounds.map(r => r.revenue), 1);
  const target = i => rounds[0].revenue * Math.pow(1.08, i);   // mục tiêu: tăng 8%/vòng từ vòng 1

  const achUnlocked = (S.achievements || []).map(id => ACHIEVEMENTS_LIST().find(a => a.id === id)).filter(Boolean);
  const verdict = champion
    ? T(`Mùa giải trong mơ! Đội dẫn đầu thị phần chung cuộc với ${shareLast.toFixed(1)}% – vượt cả 3 tập đoàn AI${totalProfit > 0 ? `, kèm lợi nhuận tích lũy ${money(Math.round(totalProfit))}` : `. Lợi nhuận còn âm ${money(Math.abs(Math.round(totalProfit)))}, nhưng vị thế thị trường chính là bàn đạp cho mùa sau`}. Hãy chụp lại báo cáo này làm kỷ niệm nhé!`,
        `A dream season! Your team leads final market share at ${shareLast.toFixed(1)}% – beating all 3 AI rivals${totalProfit > 0 ? `, with cumulative profit of ${money(Math.round(totalProfit))}` : `. Profit is still negative at ${money(Math.abs(Math.round(totalProfit)))}, but this market position is a springboard for next season`}. Screenshot this report as a keepsake!`)
    : totalProfit > 0
      ? T(`Kết thúc mùa ở hạng ${myRank}/4 với lợi nhuận dương ${money(Math.round(totalProfit))} – nền tảng rất tốt. Khoảng cách với ${ranking[0].name} nằm ở ${growth < 5 ? 'tốc độ chiếm thị phần: hãy mạnh tay marketing sớm hơn ở mùa sau' : 'biên lợi nhuận: xem lại cấu trúc chi phí tab CVP'}.`,
          `Finished the season at rank ${myRank}/4 with a positive profit of ${money(Math.round(totalProfit))} – a solid foundation. The gap with ${ranking[0].name} is in ${growth < 5 ? 'market-share pace: push marketing harder earlier next season' : 'profit margin: revisit your cost structure in the CVP tab'}.`)
      : T(`Mùa giải lỗ ${money(Math.abs(Math.round(totalProfit)))} – nhưng đó là bài học đắt giá nhất của khởi nghiệp. Mở tab 🕵️ Chi phí đối thủ xem họ chi thế nào, rồi chơi lại mùa mới: người thắng là người đứng dậy nhanh nhất!`,
          `A season loss of ${money(Math.abs(Math.round(totalProfit)))} – but that's the most valuable lesson in entrepreneurship. Open the 🕵️ Rival Costs tab to see how they spend, then play a new season: the winner is whoever gets back up the fastest!`);

  body.innerHTML = `
    ${S.finished ? `<div class="clay-card overflow-hidden mb-3"><img src="assets/illustrations/game/celebrate-win.webp" alt="Đội BizOn ăn mừng hoàn thành ván mô phỏng" class="w-full" style="display:block"></div>` : ''}
    <div class="clay-card p-5 mb-3 text-center text-white" style="background:linear-gradient(135deg,#0e3d4d 0%,#006687 100%)">
      <p class="text-[11px] font-bold text-white/60 uppercase tracking-wider">🏁 ${S.finished ? T('Báo cáo Tổng kết mùa giải', 'Season Summary Report') : T(`Tổng kết tạm thời – sau vòng ${last.round}/${ROUNDS_TOTAL}`, `Interim summary – after round ${last.round}/${ROUNDS_TOTAL}`)}</p>
      <p class="font-display font-extrabold text-3xl mt-1">${champion && S.finished ? T('👑 VÔ ĐỊCH SÀN ĐẤU', '👑 ARENA CHAMPION') : T(`Hạng ${myRank}/4 toàn sàn`, `Rank ${myRank}/4 overall`)}</p>
      <p class="text-xs text-white/70 mt-0.5">${S.profile.teamName} · ${T(`${rounds.length} vòng thi đấu`, `${rounds.length} rounds played`)}</p>
      <div class="grid grid-cols-3 gap-2 mt-4 text-left">
        <div class="bg-white/10 rounded-2xl p-2.5"><p class="text-[9px] uppercase font-bold text-white/50">${T('Tổng doanh thu', 'Total revenue')}</p><p class="font-display font-extrabold text-sm">${money(Math.round(totalRev))}</p></div>
        <div class="bg-white/10 rounded-2xl p-2.5"><p class="text-[9px] uppercase font-bold text-white/50">${T('Lợi nhuận tích lũy', 'Cumulative profit')}</p><p class="font-display font-extrabold text-sm ${totalProfit >= 0 ? 'text-clay-gold' : 'text-orange-300'}">${money(Math.round(totalProfit))}</p></div>
        <div class="bg-white/10 rounded-2xl p-2.5"><p class="text-[9px] uppercase font-bold text-white/50">${T('Uy tín thương hiệu', 'Brand reputation')}</p><p class="font-display font-extrabold text-sm">${brandScore}/10</p></div>
      </div>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-1">${T('🏆 Bảng xếp hạng chung cuộc', '🏆 Final Leaderboard')}</h3>
      <p class="text-[11px] text-deep-teal/55 mb-3">${T('Xếp theo thị phần chung cuộc – thước đo chiến thắng của sàn đấu · tăng trưởng = thay đổi so với vòng 1', "Ranked by final market share – the arena's measure of victory · growth = change since round 1")}</p>
      ${ranking.map((x, i) => `
      <div class="flex items-center gap-2.5 py-2 border-b border-surface-bright last:border-0 ${x.me ? 'bg-clay-gold/10 rounded-xl px-2 -mx-2' : ''}">
        <span class="w-6 text-center text-base">${['🥇', '🥈', '🥉', '4️⃣'][i]}</span>
        ${x.img ? `<img src="${x.img}" class="w-8 h-8 rounded-full object-cover object-top border ${x.me ? 'border-clay-gold' : 'border-surface-bright'}">` : ''}
        <div class="flex-1 min-w-0">
          <p class="text-xs font-extrabold ${x.me ? 'text-primary' : 'text-deep-teal/80'} truncate">${x.me ? '🏺 ' : ''}${x.name}</p>
          <p class="text-[10px] text-deep-teal/50 font-semibold">${T('Thị phần', 'Market share')} ${x.share.toFixed(1)}% · <span class="${x.growth >= 0 ? 'text-emerald-600' : 'text-orange-600'}">${x.growth >= 0 ? '▲' : '▼'} ${T(`${Math.abs(x.growth)} điểm`, `${Math.abs(x.growth)} pts`)}</span></p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs font-display font-extrabold ${x.profit >= 0 ? 'text-deep-teal' : 'text-orange-600'}">${money(x.profit)}</p>
          <p class="text-[10px] font-bold text-deep-teal/50">ROI ${x.roi}%</p>
        </div>
      </div>`).join('')}
      <p class="text-[10px] text-deep-teal/45 font-semibold mt-2">${T('💡 Lợi nhuận đối thủ AI trông cao vì họ không gánh chi phí nhân sự, đào tạo và R&D như đội thật – xem tab 🕵️ Chi phí đối thủ để hiểu cấu trúc chi của họ.', "💡 AI rivals' profit looks high because they don't carry staffing, training, and R&D costs like a real team – see the 🕵️ Rival Costs tab to understand their cost structure.")}</p>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T('📊 Doanh thu thực tế vs Mục tiêu (+8%/vòng)', '📊 Actual revenue vs Target (+8%/round)')}</h3>
      <div class="flex items-end gap-2 h-32">
        ${rounds.map((r, i) => `
        <div class="flex-1 h-full flex items-end justify-center gap-0.5">
          <div class="rounded-t-lg bg-gradient-to-t from-primary to-primary-container" style="width:45%;height:${Math.max(6, r.revenue / Math.max(maxRev, target(rounds.length - 1)) * 100)}%"></div>
          <div class="rounded-t-lg" style="width:45%;background:#cbd5e1;height:${Math.max(6, target(i) / Math.max(maxRev, target(rounds.length - 1)) * 100)}%"></div>
        </div>`).join('')}
      </div>
      <div class="flex gap-2 mt-1">${rounds.map(r => `<p class="flex-1 text-center text-[10px] font-bold text-deep-teal/60">V${r.round}</p>`).join('')}</div>
      <div class="flex items-center gap-4 mt-2 justify-center">
        <span class="flex items-center gap-1 text-[10px] font-bold text-deep-teal/60"><span class="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> ${T('Thực tế', 'Actual')}</span>
        <span class="flex items-center gap-1 text-[10px] font-bold text-deep-teal/60"><span class="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> ${T('Mục tiêu', 'Target')}</span>
      </div>
    </div>
    ${achUnlocked.length ? `
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T(`🎖️ Thành tựu chủ chốt (${achUnlocked.length}/${ACHIEVEMENTS_LIST().length})`, `🎖️ Key achievements (${achUnlocked.length}/${ACHIEVEMENTS_LIST().length})`)}</h3>
      <div class="grid grid-cols-2 gap-2">
        ${achUnlocked.slice(0, 6).map(a => `
        <div class="clay-sunken rounded-2xl p-2.5 flex items-center gap-2">
          <span class="text-xl">${a.icon}</span>
          <div class="min-w-0"><p class="text-[11px] font-extrabold text-deep-teal truncate">${a.name}</p><p class="text-[9px] text-deep-teal/50 leading-tight">${a.desc}</p></div>
        </div>`).join('')}
      </div>
    </div>` : ''}
    ${S.finished && isTrial() ? `
    <div class="clay-card p-5 mb-3 text-center border-2 border-dashed border-clay-gold/50">
      <p class="text-3xl">🎓</p>
      <p class="font-display font-extrabold text-deep-teal text-sm mt-1">${T('Giấy chứng nhận dành cho ván có Mã lớp', 'Certificates are for sessions with a Class ID')}</p>
      <p class="text-xs text-deep-teal/60 mt-1.5 max-w-xs mx-auto">${T('Bạn vừa hoàn thành ván <b>chơi thử</b> nên chưa được cấp chứng nhận. Xin Mã lớp từ giảng viên rồi chơi lại một ván – kết quả sẽ vào bảng xếp hạng lớp và chứng nhận được cấp kèm tên lớp.',
        "You just completed a <b>trial</b> session, so no certificate is issued. Get a Class ID from your instructor and play again – results will count toward the class leaderboard and the certificate will include the class name.")}</p>
      <a href="lop-hoc.html" class="clay-btn inline-block bg-clay-gold text-deep-teal font-display font-extrabold px-4 py-2 text-[11px] mt-3">${T('📘 Cách tổ chức lớp học', '📘 How to set up a class')}</a>
    </div>` : ''}
    ${S.finished && !isTrial() ? `
    <style>@keyframes fwExplode{to{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}</style>
    <div class="clay-card p-1.5 mb-3">
      <div class="rounded-[20px] p-5 text-center relative overflow-hidden" style="background:linear-gradient(180deg,#fffdf6,#f4faff);border:3px solid rgba(253,161,39,.55);box-shadow:inset 0 0 0 1px rgba(0,102,135,.18)">
        <p class="text-[10px] font-extrabold uppercase tracking-widest text-deep-teal/50">${T('🎓 Giấy chứng nhận hoàn thành', '🎓 Certificate of Completion')}</p>
        <p class="font-display font-extrabold text-deep-teal text-lg leading-tight mt-0.5">CERTIFICATE OF COMPLETION</p>
        <p class="text-[11px] text-deep-teal/60 mt-3 italic">${T('Trao cho', 'Awarded to')}</p>
        <p class="font-display font-extrabold text-primary text-2xl mt-0.5 px-6 pb-1.5 border-b-2 border-clay-gold/40 inline-block">${S.profile.teamName}</p>
        ${S.profile.classId ? `<p class="text-[10px] font-extrabold text-deep-teal/60 mt-1.5">${T('Lớp / Mã lớp', 'Class / Class ID')}: ${S.profile.classId}</p>` : ''}
        <p class="text-[11px] text-deep-teal/70 mt-2.5 max-w-xs mx-auto">${T(`đã hoàn thành trọn vẹn ${rounds.length} vòng mô phỏng kinh doanh <b>«BizOn Bật Nghiệp»</b>${champion ? ' với ngôi vị Quán quân sàn đấu' : ''}`, `has fully completed ${rounds.length} rounds of the <b>«BizOn Bật Nghiệp»</b> business simulation${champion ? ' as Arena Champion' : ''}`)}</p>
        <div class="grid grid-cols-3 gap-2 mt-3.5">
          <div class="clay-sunken rounded-2xl p-2"><p class="text-[9px] uppercase font-bold text-deep-teal/50">${T('Hạng chung cuộc', 'Final rank')}</p><p class="font-display font-extrabold text-primary text-base">${champion ? '👑 #1' : '#' + myRank}/4</p></div>
          <div class="clay-sunken rounded-2xl p-2"><p class="text-[9px] uppercase font-bold text-deep-teal/50">${T('Thị phần (%)', 'Market share (%)')}</p><p class="font-display font-extrabold text-primary text-base">${shareLast.toFixed(1)}%</p></div>
          <div class="clay-sunken rounded-2xl p-2"><p class="text-[9px] uppercase font-bold text-deep-teal/50">${T('Lợi nhuận', 'Profit')}</p><p class="font-display font-extrabold ${totalProfit >= 0 ? 'text-primary' : 'text-orange-600'} text-base">${money(Math.round(totalProfit))}</p></div>
        </div>
        <div class="flex items-end justify-between gap-2 mt-5">
          <div class="text-center flex-1">
            <img src="assets/docs/sig-huong.png" alt="Chữ ký Đỗ Thùy Hương" class="h-11 w-auto mx-auto">
            <div class="h-px bg-deep-teal/20 my-1 mx-2"></div>
            <p class="text-[9px] font-extrabold text-deep-teal leading-tight">NCS. Đỗ Thùy Hương</p>
            <p class="text-[8px] text-deep-teal/50 font-bold">Founder &amp; Project Lead</p>
          </div>
          <div class="w-16 h-16 shrink-0 rounded-full border-2 border-dashed border-clay-gold flex items-center justify-center rotate-12" style="background:rgba(253,161,39,.12)">
            <div class="text-center leading-none"><p class="text-[7px] font-extrabold text-clay-orange uppercase">Official</p><p class="text-[10px] font-display font-extrabold text-clay-orange">BizOn</p><p class="text-[8px]">✓</p></div>
          </div>
          <div class="text-center flex-1">
            <img src="assets/docs/sig-tu.png" alt="Chữ ký Phan Anh Tú" class="h-10 w-auto mx-auto mt-1">
            <div class="h-px bg-deep-teal/20 my-1 mx-2"></div>
            <p class="text-[9px] font-extrabold text-deep-teal leading-tight">PGS.TS. Phan Anh Tú</p>
            <p class="text-[8px] text-deep-teal/50 font-bold">Co-founder &amp; Chief Academic Advisor</p>
          </div>
        </div>
        <p class="text-[9px] text-deep-teal/45 font-bold mt-3">${T(`Cấp ngày ${new Date().toLocaleDateString('vi-VN')}`, `Issued ${new Date().toLocaleDateString('en-US')}`)} · thuyhuongctu.github.io/BizOn</p>
        <div class="flex gap-2 justify-center mt-3"><button onclick="downloadCertificate('vi')" class="clay-btn bg-clay-gold text-deep-teal font-display font-extrabold px-4 py-2 text-[11px]">📥 Tải chứng nhận</button><button onclick="downloadCertificate('en')" class="clay-btn bg-white text-primary border border-primary/25 font-display font-extrabold px-4 py-2 text-[11px]">📥 Certificate (EN)</button></div>
      </div>
    </div>` : ''}
    ${S.finished ? `
    <div class="clay-card p-5 mb-3 text-center overflow-hidden relative" style="background:linear-gradient(165deg,#033337 0%,#02444d 55%,#006687 100%)">
      <img src="assets/illustrations/globe-trade.webp" alt="" aria-hidden="true" class="absolute -right-6 -bottom-6 w-32 opacity-25 pointer-events-none">
      <p class="text-[10px] font-extrabold uppercase tracking-widest text-white/55 relative">${T('Chặng tiếp theo', 'Next stop')}</p>
      <p class="font-display font-extrabold text-white text-lg mt-1 relative">${T('Chinh phục xong Việt Nam.<br>Bạn có muốn ra biển lớn?', 'Vietnam conquered.<br>Ready for the open seas?')}</p>
      <p class="text-[12px] text-white/70 mt-2 max-w-xs mx-auto relative">${T('«BizOn Go Global» – chọn 1 trong 7 thị trường quốc tế, đàm phán với đối tác bản địa và thử sức 4 phương thức thâm nhập.', '«BizOn Go Global» – pick 1 of 7 international markets, negotiate with local partners, and try 4 market-entry modes.')}</p>
      <div class="flex gap-2 justify-center mt-4 relative">
        <a href="global.html" class="clay-btn bg-clay-gold text-deep-teal font-display font-extrabold px-5 py-2.5 text-xs">${T('🌏 Ra biển lớn →', '🌏 Go global →')}</a>
        <a href="brand-passport.html" class="clay-btn bg-white/10 border border-white/25 text-white font-display font-extrabold px-4 py-2.5 text-xs">${T('🛂 Hộ Chiếu Thương Hiệu', '🛂 Brand Passport')}</a>
      </div>
    </div>` : ''}
    <div class="clay-card p-4 bg-primary-container/10 flex gap-3 items-start">
      <img src="assets/character/lumina-vest-thumbsup.webp" alt="Mentor Hương" class="w-10 h-10 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 10%">
      <div><p class="font-display font-bold text-primary text-sm">${T('Mentor Hương · Tổng kết mùa giải', 'Mentor Hương · Season Wrap-Up')}</p>
      <p class="text-xs text-deep-teal/80 italic mt-0.5">"${verdict}"</p></div>
    </div>`;
  S._cert = { team: S.profile.teamName, classId: S.profile.classId || '', rank: myRank, champion, share: shareLast.toFixed(1), profit: Math.round(totalProfit), rounds: rounds.length };
  if (S.finished) { launchCelebration(); playFinaleTheme(); }
}

// ---------- Pháo hoa + confetti khi xem chứng nhận hoàn thành (thiết kế Stitch) ----------
function launchCelebration() {
  if (document.getElementById('fw-layer')) return;
  const layer = document.createElement('div');
  layer.id = 'fw-layer';
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:120;overflow:hidden';
  document.body.appendChild(layer);
  const colors = ['#00c4ff', '#fda127', '#ffd700', '#006687', '#ffffff'];
  const burst = (x, y) => {
    for (let i = 0; i < 34; i++) {
      const p = document.createElement('div');
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 130;
      p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:7px;height:7px;border-radius:50%;background:${colors[Math.floor(Math.random() * colors.length)]};--tx:${Math.cos(a) * d}px;--ty:${Math.sin(a) * d}px;animation:fwExplode 1s ease-out forwards`;
      layer.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  };
  for (let i = 0; i < 6; i++) setTimeout(() => burst(40 + Math.random() * (innerWidth - 80), innerHeight * 0.12 + Math.random() * innerHeight * 0.45), i * 380);
  setTimeout(() => layer.remove(), 4200);
}

// ---------- Xuất chứng nhận hoàn thành ra ảnh PNG (vẽ canvas, chạy ngoại tuyến) ----------
function loadSigImg(src) {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);   // thiếu ảnh chữ ký → rơi về chữ ký kiểu chữ viết
    im.src = src;
  });
}

async function downloadCertificate(lang = 'vi') {
  if (isTrial()) { itemToast(T('Ván chơi thử chưa được cấp chứng nhận – cần Mã lớp của giảng viên.', "Trial sessions don't get a certificate – you need a Class ID from your instructor.")); return; }
  const c = S._cert;
  if (!c) return;
  const EN = lang === 'en';
  const L = EN ? {
    small: '🎓 BIZON BUSINESS SIMULATION ECOSYSTEM', to: 'This is to certify that',
    cls: `Class ID: ${c.classId}`,
    desc: `has successfully completed all ${c.rounds} rounds of the «BizOn Bật Nghiệp» business simulation`,
    champ: 'as Champion of the Arena',
    stats: ['FINAL RANK', 'MARKET SHARE', 'CUMULATIVE PROFIT'],
    sig1: 'PhD Candidate Do Thuy Huong', sig2: 'Assoc. Prof. Phan Anh Tu, Ph.D.',
    date: `Issued on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · thuyhuongctu.github.io/BizOn`,
  } : {
    small: '🎓 GIẤY CHỨNG NHẬN HOÀN THÀNH', to: 'Trao cho',
    cls: `Lớp / Mã lớp: ${c.classId}`,
    desc: `đã hoàn thành trọn vẹn ${c.rounds} vòng mô phỏng kinh doanh «BizOn Bật Nghiệp»`,
    champ: 'với ngôi vị Quán quân sàn đấu',
    stats: ['HẠNG CHUNG CUỘC', 'THỊ PHẦN', 'LỢI NHUẬN TÍCH LŨY'],
    sig1: 'NCS. Đỗ Thùy Hương', sig2: 'PGS.TS. Phan Anh Tú',
    date: `Cấp ngày ${new Date().toLocaleDateString('vi-VN')} · thuyhuongctu.github.io/BizOn`,
  };
  const [sigH, sigT] = await Promise.all([loadSigImg('assets/docs/sig-huong.png'), loadSigImg('assets/docs/sig-tu.png')]);
  const cv = document.createElement('canvas');
  cv.width = 1400; cv.height = 990;
  const g = cv.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 990);
  grad.addColorStop(0, '#fffdf6'); grad.addColorStop(1, '#f4faff');
  g.fillStyle = grad; g.fillRect(0, 0, 1400, 990);
  g.strokeStyle = '#fda127'; g.lineWidth = 8; g.strokeRect(34, 34, 1332, 922);
  g.strokeStyle = 'rgba(0,102,135,.35)'; g.lineWidth = 2; g.strokeRect(52, 52, 1296, 886);
  g.textAlign = 'center'; g.fillStyle = '#5b6b72';
  g.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  g.fillText(L.small, 700, 130);
  g.fillStyle = '#033337'; g.font = '800 58px "Plus Jakarta Sans", sans-serif';
  g.fillText('CERTIFICATE OF COMPLETION', 700, 200);
  g.fillStyle = '#5b6b72'; g.font = 'italic 28px Georgia, serif';
  g.fillText(L.to, 700, 280);
  g.fillStyle = '#006687'; g.font = '800 64px "Plus Jakarta Sans", sans-serif';
  g.fillText(c.team, 700, 360);
  g.strokeStyle = 'rgba(253,161,39,.6)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(420, 385); g.lineTo(980, 385); g.stroke();
  if (c.classId) {
    g.fillStyle = '#5b6b72'; g.font = 'bold 22px "Hanken Grotesk", sans-serif';
    g.fillText(L.cls, 700, 422);
  }
  g.fillStyle = '#3d484f'; g.font = '26px Manrope, sans-serif';
  const descY = c.classId ? 462 : 440;
  g.fillText(L.desc, 700, descY);
  if (c.champion) g.fillText(L.champ, 700, descY + 36);
  const stats = [[`${c.champion ? '👑 #1' : '#' + c.rank}/4`, L.stats[0]], [`${c.share}%`, L.stats[1]], [money(c.profit), L.stats[2]]];
  stats.forEach(([v, l], i) => {
    const x = 350 + i * 350;
    g.fillStyle = 'rgba(0,102,135,.06)';
    g.beginPath(); g.roundRect(x - 150, 520, 300, 110, 22); g.fill();
    g.fillStyle = '#5b6b72'; g.font = 'bold 18px "Hanken Grotesk", sans-serif'; g.fillText(l, x, 555);
    g.fillStyle = c.profit < 0 && i === 2 ? '#c2410c' : '#006687';
    g.font = '800 38px "Plus Jakarta Sans", sans-serif'; g.fillText(v, x, 605);
  });
  const sign = (x, sig, name, line1, line2) => {
    if (sig) {
      const h = 120, w = sig.width * h / sig.height;
      g.drawImage(sig, x - w / 2, 775 - h, w, h);
    } else {
      g.fillStyle = '#006687'; g.font = 'italic 44px "Segoe Script", "Brush Script MT", cursive';
      g.fillText(name, x, 760);
    }
    g.strokeStyle = 'rgba(3,51,55,.25)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - 190, 785); g.lineTo(x + 190, 785); g.stroke();
    g.fillStyle = '#033337'; g.font = '800 24px "Plus Jakarta Sans", sans-serif'; g.fillText(line1, x, 820);
    g.fillStyle = '#5b6b72'; g.font = 'bold 19px Manrope, sans-serif'; g.fillText(line2, x, 850);
  };
  sign(340, sigH, 'Đỗ Thùy Hương', L.sig1, 'Founder & Project Lead');
  sign(1060, sigT, 'Phan Anh Tú', L.sig2, 'Co-founder & Chief Academic Advisor');
  g.save(); g.translate(700, 790); g.rotate(0.2);
  g.strokeStyle = '#fda127'; g.lineWidth = 4; g.setLineDash([10, 7]);
  g.beginPath(); g.arc(0, 0, 62, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  g.fillStyle = 'rgba(253,161,39,.14)'; g.beginPath(); g.arc(0, 0, 56, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8762d'; g.font = 'bold 15px "Hanken Grotesk", sans-serif'; g.fillText('OFFICIAL', 0, -12);
  g.font = '800 24px "Plus Jakarta Sans", sans-serif'; g.fillText('BizOn', 0, 14);
  g.font = '18px sans-serif'; g.fillText('✓', 0, 38); g.restore();
  g.fillStyle = '#8a979e'; g.font = 'bold 19px Manrope, sans-serif';
  g.fillText(L.date, 700, 920);
  const a = document.createElement('a');
  a.download = `BizOn-ChungNhan-${c.team.replace(/[^\p{L}\p{N}]+/gu, '-')}.png`;
  a.href = cv.toDataURL('image/png');
  a.click();
}

// ---------- CVP: Hòa vốn, Lợi nhuận gộp & Cấu trúc chi phí ----------
function renderCvpReport(body) {
  const last = S.history[S.history.length - 1];
  const d = last ? last.decisions : { price: 150, production: 2800, marketing: 50, rd: 30, workers: 45, training: 1 };
  const fc = forecastCash(S, { ...d, paymentTerm: d.paymentTerm || 30, funding: d.funding || 'equity' });
  const unitCost = last ? last.unitCost : UNIT_COST;
  const contribution = Math.max(0.001, (d.price - unitCost) / 1000);
  const bePrice = last ? Math.round(unitCost + 1000 * (last.fixed + last.wageCost + (last.trainingCost || 0) + last.marketing + last.rd) / Math.max(1, last.sold)) : null;
  // Phân loại chi phí cố định vs biến đổi (vòng gần nhất)
  const fixedCosts = last ? [[T('Chi phí cố định', 'Fixed cost'), last.fixed], [T('Khấu hao', 'Depreciation'), last.depreciation], [T('Lương nhân sự', 'Wages'), last.wageCost || 0], [T('Đào tạo', 'Training'), last.trainingCost || 0]] : [];
  const varCosts = last ? [[T('Giá vốn (COGS)', 'COGS'), last.cogs], ['Marketing', last.marketing], ['R&D', last.rd], [T('Lưu kho + lãi vay', 'Holding + interest'), (last.holding || 0) + (last.loanInterest || 0) + (last.creditInterest || 0)]] : [];
  const totalF = fixedCosts.reduce((a, x) => a + x[1], 0), totalV = varCosts.reduce((a, x) => a + x[1], 0);
  const costBar = (label, val, total, color) => `
    <div class="flex items-center gap-2 text-xs py-1">
      <span class="w-32 shrink-0 text-deep-teal/70">${label}</span>
      <div class="flex-1 h-2.5 rounded-full bg-surface-bright overflow-hidden"><div class="h-full ${color} rounded-full" style="width:${Math.round(100 * val / Math.max(1, total))}%"></div></div>
      <span class="w-16 text-right font-bold text-deep-teal">${Math.round(val)}tr</span>
    </div>`;
  body.innerHTML = `
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T('📐 Phân tích Điểm hòa vốn (CVP)', '📐 Break-Even Analysis (CVP)')}</h3>
      <div class="grid grid-cols-2 gap-3">
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Sản lượng hòa vốn', 'Break-even volume')}</p><p class="font-display font-extrabold text-primary text-lg">${fc.breakEven.toLocaleString('vi-VN')} ${T('sp', 'units')}</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Giá hòa vốn', 'Break-even price')}</p><p class="font-display font-extrabold text-primary text-lg">${bePrice ? bePrice.toLocaleString('vi-VN') + 'k₫' : '–'}</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Lãi góp / đơn vị', 'Contribution / unit')}</p><p class="font-display font-extrabold text-deep-teal text-lg">${Math.round(contribution * 1000)}k₫</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">${T('Bán dự kiến vòng này', 'Expected sales this round')}</p><p class="font-display font-extrabold ${fc.estSold >= fc.breakEven ? 'text-emerald-600' : 'text-red-600'} text-lg">${fc.estSold.toLocaleString('vi-VN')} ${T('sp', 'units')}</p></div>
      </div>
    </div>
    ${last ? `
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T(`🧾 Cấu trúc chi phí – Vòng ${last.round}`, `🧾 Cost structure – Round ${last.round}`)}</h3>
      <p class="text-[11px] font-bold text-deep-teal/60 uppercase mb-1">${T(`Chi phí cố định (${Math.round(totalF)}tr₫)`, `Fixed costs (${Math.round(totalF)}m₫)`)}</p>
      ${fixedCosts.map(x => costBar(x[0], x[1], totalF + totalV, 'bg-primary')).join('')}
      <p class="text-[11px] font-bold text-deep-teal/60 uppercase mb-1 mt-3">${T(`Chi phí biến đổi (${Math.round(totalV)}tr₫)`, `Variable costs (${Math.round(totalV)}m₫)`)}</p>
      ${varCosts.map(x => costBar(x[0], x[1], totalF + totalV, 'bg-primary-container')).join('')}
    </div>
    <div class="clay-card p-5">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T('💹 Lợi nhuận gộp theo vòng', '💹 Gross profit by round')}</h3>
      ${S.history.map(r => {
        const gross = r.revenue - r.cogs;
        const marginPct = Math.round(100 * gross / Math.max(1, r.revenue));
        return `<div class="flex items-center gap-2 text-xs py-1.5 border-b border-surface-bright last:border-0">
          <span class="w-8 font-bold text-deep-teal">V${r.round}</span>
          <div class="flex-1 h-2.5 rounded-full bg-surface-bright overflow-hidden"><div class="h-full ${gross >= 0 ? 'bg-emerald-500' : 'bg-red-500'} rounded-full" style="width:${Math.min(100, Math.abs(marginPct))}%"></div></div>
          <span class="w-24 text-right font-bold ${gross >= 0 ? 'text-deep-teal' : 'text-red-600'}">${money(gross)} (${marginPct}%)</span>
        </div>`;
      }).join('')}
    </div>
    <div class="clay-card p-5 mt-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T(`📈 Tỷ suất sinh lời – Vòng ${last.round}`, `📈 Profitability ratios – Round ${last.round}`)}</h3>
      ${(() => {
        const gross = last.revenue - last.cogs;
        const opex = last.marketing + last.rd + last.fixed + (last.wageCost || 0) + (last.trainingCost || 0) + (last.holding || 0);
        const operating = gross - opex;
        const net = last.netProfit;
        const pct = v => Math.round(1000 * v / Math.max(1, last.revenue)) / 10;
        const ros = pct(net), grossM = pct(gross), operM = pct(operating);
        const assets = S.balance + S.machineCapacity * 0.05 + S.inventory * 0.045;
        const roa = Math.round(1000 * net / Math.max(1, assets)) / 10;
        const roe = Math.round(1000 * net / STARTING_BALANCE) / 10;
        const wf = (v, color) => `<div class="flex-1 flex flex-col items-center justify-end h-full">
          <div class="w-full waterfall-bar ${color}" style="height:${Math.max(6, Math.abs(v) / Math.max(1, gross) * 100)}%"></div></div>`;
        const card = (lbl, v, note) => `<div class="clay-sunken rounded-2xl p-3">
          <p class="text-[10px] font-extrabold text-deep-teal/50">${lbl}</p>
          <p class="font-display font-extrabold ${v >= 0 ? 'text-primary' : 'text-red-600'} text-xl">${v}%</p>
          <p class="text-[9px] text-deep-teal/50 font-semibold">${note}</p></div>`;
        return `
        <p class="text-[11px] font-bold text-deep-teal/60 uppercase mb-1">${T('Biểu đồ lợi nhuận (Gộp → Hoạt động → Ròng)', 'Profit waterfall (Gross → Operating → Net)')}</p>
        <div class="flex items-end gap-6 h-28 mb-1 px-2">${wf(gross, 'bg-slate-300')}${wf(operating, 'bg-primary-container')}${wf(net, net >= 0 ? 'bg-primary' : 'bg-red-400')}</div>
        <div class="flex gap-6 px-2 mb-4 text-center">
          <p class="flex-1 text-[10px] font-bold text-deep-teal/60">${T('Gộp', 'Gross')}<br>${money(gross)}</p>
          <p class="flex-1 text-[10px] font-bold text-deep-teal/60">${T('HĐ', 'Oper.')}<br>${money(operating)}</p>
          <p class="flex-1 text-[10px] font-bold ${net >= 0 ? 'text-primary' : 'text-red-600'}">${T('Ròng', 'Net')}<br>${money(net)}</p>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          ${card('ROS', ros, T('Lợi nhuận / Doanh thu', 'Profit / Revenue'))}
          ${card('ROE', roe, T('Lợi nhuận / Vốn CSH', 'Profit / Equity'))}
          ${card('ROA', roa, T('Lợi nhuận / Tài sản', 'Profit / Assets'))}
          ${card('OPERATING', operM, T('Biên LN hoạt động', 'Operating margin'))}
        </div>
        <div class="clay-sunken rounded-2xl p-3 mt-2.5 flex items-center gap-2">
          <span class="text-lg">${ros >= 12 ? '🏆' : '📉'}</span>
          <p class="text-[11px] text-deep-teal/70">${T(`Net Profit Margin <b class="${ros >= 12 ? 'text-emerald-700' : 'text-red-600'}">${ros}%</b> – ${ros >= 12 ? 'cao hơn' : 'thấp hơn'} trung bình ngành (12%). Biên gộp: <b>${grossM}%</b>.`,
            `Net Profit Margin <b class="${ros >= 12 ? 'text-emerald-700' : 'text-red-600'}">${ros}%</b> – ${ros >= 12 ? 'above' : 'below'} the industry average (12%). Gross margin: <b>${grossM}%</b>.`)}</p>
        </div>`;
      })()}
    </div>` : `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${T('Hoàn thành vòng đầu để xem cấu trúc chi phí và lợi nhuận gộp.', 'Complete the first round to see cost structure and gross profit.')}</div>`}`;
}

// ---------- Báo cáo Nhân sự ----------
function renderHrReport(body) {
  if (!S.history.length) {
    body.innerHTML = `<div class="clay-card p-8 text-center text-sm text-deep-teal/50">${T('Chưa có dữ liệu nhân sự – hãy hoàn thành vòng đầu tiên!', 'No HR data yet – complete the first round!')}</div>`;
    return;
  }
  const last = S.history[S.history.length - 1];
  const productivity = Math.round(last.sold / Math.max(1, last.workers || 45));
  body.innerHTML = `
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="clay-card p-4 text-center"><p class="text-2xl">👥</p><p class="font-display font-extrabold text-deep-teal">${last.workers || 45}</p><p class="text-[10px] text-deep-teal/50 font-semibold uppercase">${T('Nhân viên', 'Employees')}</p></div>
      <div class="clay-card p-4 text-center"><p class="text-2xl">⚡</p><p class="font-display font-extrabold text-primary">${productivity} ${T('sp', 'units')}</p><p class="text-[10px] text-deep-teal/50 font-semibold uppercase">${T('Năng suất/người', 'Output/person')}</p></div>
      <div class="clay-card p-4 text-center"><p class="text-2xl">💰</p><p class="font-display font-extrabold text-deep-teal">${money(last.wageCost || 0)}</p><p class="text-[10px] text-deep-teal/50 font-semibold uppercase">${T('Quỹ lương/vòng', 'Payroll/round')}</p></div>
      <div class="clay-card p-4 text-center"><p class="text-2xl">🎓</p><p class="font-display font-extrabold text-deep-teal">${money(last.trainingCost || 0)}</p><p class="text-[10px] text-deep-teal/50 font-semibold uppercase">${T('Đào tạo/vòng', 'Training/round')}</p></div>
    </div>
    <div class="clay-card p-5">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">${T('Lịch sử nhân sự & hiệu suất', 'HR & performance history')}</h3>
      ${S.history.map(r => `
        <div class="flex justify-between items-center text-xs py-2 border-b border-surface-bright last:border-0">
          <span class="font-bold text-deep-teal">V${r.round}</span>
          <span class="text-deep-teal/70">${T(`${r.workers || 45} người · lương ${Math.round(r.wageCost || 0)}tr · đào tạo ${Math.round(r.trainingCost || 0)}tr`, `${r.workers || 45} people · wages ${Math.round(r.wageCost || 0)}m · training ${Math.round(r.trainingCost || 0)}m`)}</span>
          <span class="font-bold ${r.oee >= 85 ? 'text-emerald-600' : 'text-amber-600'}">OEE ${r.oee}%</span>
        </div>`).join('')}
      <p class="text-[11px] text-deep-teal/50 mt-3">${T('💡 Đào tạo tăng OEE (tối đa +5%); sản xuất vượt năng lực nhân sự (70 sp/người) sẽ kéo OEE xuống.', '💡 Training raises OEE (up to +5%); producing beyond staff capacity (70 units/person) drags OEE down.')}</p>
    </div>`;
}

// ---------- Business Model Canvas ----------
function renderBmcReport(body) {
  const last = S.history[S.history.length - 1];
  const share = last ? last.share.toFixed(1) : '25.0';
  const totalRev = S.history.reduce((a, r) => a + r.revenue, 0);
  const block = (title, icon, content) => `
    <div class="clay-card p-3.5">
      <p class="text-[10px] font-extrabold text-primary uppercase mb-1">${icon} ${title}</p>
      <p class="text-[11px] text-deep-teal/80 leading-relaxed">${content}</p>
    </div>`;
  body.innerHTML = `
    <p class="text-[11px] text-deep-teal/50 mb-3">${T(`Business Model Canvas của đội ${S.profile.teamName} – cập nhật theo dữ liệu vòng ${Math.min(S.round, ROUNDS_TOTAL)}.`, `Business Model Canvas for team ${S.profile.teamName} – updated with round ${Math.min(S.round, ROUNDS_TOTAL)} data.`)}</p>
    <div class="grid grid-cols-2 gap-3">
      ${block(T('Phân khúc khách hàng', 'Customer Segments'), '🎯', T(`Thị trường đại chúng ${share}% thị phần; khách nhạy giá ${currentEvent(S).elasticityMul ? 'CAO (chiến tranh giá!)' : 'trung bình'}.`, `Mass market at ${share}% share; price sensitivity ${currentEvent(S).elasticityMul ? 'HIGH (price war!)' : 'average'}.`))}
      ${block(T('Giá trị cốt lõi', 'Value Propositions'), '💎', T(`Sản phẩm giá ${(last ? last.decisions.price : 150).toLocaleString('vi-VN')}k₫, thương hiệu hạng ${S.brand >= 1.2 ? 'A' : 'B+'}, R&D tích lũy ${Math.round(S.rdCumulative)}tr₫.`, `Product priced ${(last ? last.decisions.price : 150).toLocaleString('en-US')}k₫, brand grade ${S.brand >= 1.2 ? 'A' : 'B+'}, cumulative R&D ${Math.round(S.rdCumulative)}m₫.`))}
      ${block(T('Kênh phân phối', 'Channels'), '🚚', T(`Kênh Modern Trade + trực tuyến; tỷ lệ đáp ứng đơn ${currentEvent(S).fulfillMul ? '85% (khủng hoảng cung ứng)' : '100%'}.`, `Modern Trade + online channels; order fulfillment rate ${currentEvent(S).fulfillMul ? '85% (supply chain crisis)' : '100%'}.`))}
      ${block(T('Quan hệ khách hàng', 'Customer Relationships'), '❤️', T(`Brand Loyalty ${S.brandLoyalty}%; độ hài lòng ${Math.min(5, S.brandLoyalty / 19).toFixed(1)}/5.`, `Brand Loyalty ${S.brandLoyalty}%; satisfaction ${Math.min(5, S.brandLoyalty / 19).toFixed(1)}/5.`))}
      ${block(T('Dòng doanh thu', 'Revenue Streams'), '💵', T(`Bán sản phẩm: ${money(totalRev)} lũy kế; giá bán là đòn bẩy chính.`, `Product sales: ${money(totalRev)} cumulative; price is the main lever.`))}
      ${block(T('Nguồn lực chính', 'Key Resources'), '🏭', T(`${last ? (last.workers || 45) : 45} nhân sự, công suất máy ${S.machineCapacity.toLocaleString('vi-VN')} sp, OEE ${S.oee}%.`, `${last ? (last.workers || 45) : 45} staff, machine capacity ${S.machineCapacity.toLocaleString('en-US')} units, OEE ${S.oee}%.`))}
      ${block(T('Hoạt động chính', 'Key Activities'), '⚙️', T(`Sản xuất ${last ? last.decisions.production.toLocaleString('vi-VN') : '–'} sp/vòng, marketing, R&D, tối ưu năng lượng.`, `Producing ${last ? last.decisions.production.toLocaleString('en-US') : '–'} units/round, marketing, R&D, energy optimization.`))}
      ${block(T('Đối tác chính', 'Key Partners'), '🤝', T(`Ngân hàng (tín dụng 8.5%/vòng), nhà cung ứng linh kiện, ${(S.grantLog || []).length ? 'Giảng viên cấp vốn' : 'lớp học BizOn'}.`, `Bank (8.5%/round credit), parts suppliers, ${(S.grantLog || []).length ? 'instructor-funded grants' : 'the BizOn classroom'}.`))}
    </div>
    <div class="clay-card p-3.5 mt-3">
      <p class="text-[10px] font-extrabold text-primary uppercase mb-1">${T('🧾 Cơ cấu chi phí', '🧾 Cost Structure')}</p>
      <p class="text-[11px] text-deep-teal/80">${last ? T(`Biến đổi: COGS ${Math.round(last.cogs)}tr + Marketing ${last.marketing}tr + R&D ${last.rd}tr · Cố định: ${Math.round(last.fixed)}tr + khấu hao ${Math.round(last.depreciation)}tr + lương ${Math.round(last.wageCost || 0)}tr`, `Variable: COGS ${Math.round(last.cogs)}m + Marketing ${last.marketing}m + R&D ${last.rd}m · Fixed: ${Math.round(last.fixed)}m + depreciation ${Math.round(last.depreciation)}m + wages ${Math.round(last.wageCost || 0)}m`) : T('Hoàn thành vòng đầu để xem dữ liệu.', 'Complete the first round to see data.')}</p>
    </div>`;
}

// ---------- Kiểm toán Năng lượng (theo thiết kế Stitch) ----------
function renderEnergyReport(body) {
  const er = energyReport(S);
  const over = er.overloadPct > 100;
  const statusChip = { ok: `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full risk-low">${T('Hiệu quả', 'Efficient')}</span>`, warn: `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full risk-medium">${T('Cảnh báo', 'Warning')}</span>`, bad: `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full risk-high">${T('Nguy cấp', 'Critical')}</span>` };
  const barColor = { ok: 'bg-primary', warn: 'bg-amber-500', bad: 'bg-red-500' };
  const maxKwh = Math.max(...er.lines.map(l => l.kwh), 1);
  const worst = er.lines.reduce((a, b) => (b.kwh > a.kwh ? b : a));
  const worstIdx = er.lines.indexOf(worst);
  const ringDeg = Math.min(360, er.overloadPct * 3.6);
  const hasSolar = (S.items['SOLAR_01'] || 0) > 0;
  body.innerHTML = `
    <div class="clay-card p-4 mb-4 flex items-center gap-4 ${hasSolar ? '' : 'opacity-90'}">
      <p class="text-3xl">☀️</p>
      <div class="flex-1">
        <p class="font-display font-bold text-deep-teal text-sm">${T('Pin Mặt Trời', 'Solar Panels')} ${hasSolar ? `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full risk-low align-middle">${T('ĐANG HOẠT ĐỘNG', 'ACTIVE')}</span>` : `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full risk-medium align-middle">${T('CHƯA LẮP', 'NOT INSTALLED')}</span>`}</p>
        <p class="text-[11px] text-deep-teal/60">${hasSolar ? T('Tự chủ nguồn điện: -15% chi phí cố định, kháng khủng hoảng năng lượng.', 'Self-sufficient power: -15% fixed cost, resistant to energy crises.') : T('Lắp đặt trong Cửa hàng (150tr₫) để giảm 15% OPEX và tăng 20 điểm ESG. Hoàn vốn ~2 vòng.', 'Install it in the Shop (150m₫) to cut OPEX 15% and gain 20 ESG points. Pays back in ~2 rounds.')}</p>
      </div>
      <div class="text-center shrink-0">
        <p class="font-display font-extrabold ${esgScore(S) >= 70 ? 'text-emerald-600' : 'text-deep-teal'} text-2xl">${esgScore(S)}</p>
        <p class="text-[9px] font-extrabold text-deep-teal/50 uppercase">ESG Score</p>
      </div>
    </div>
    <div class="clay-card p-5 mb-4 text-center">
      <h3 class="font-display font-extrabold text-deep-teal text-lg">${T('Tổng mức tiêu thụ', 'Total consumption')}</h3>
      <p class="text-xs text-deep-teal/60 mb-3">${T('Sản lượng tiêu thụ hiện tại so với mục tiêu.', 'Current consumption versus the target.')}</p>
      ${over ? `<span class="inline-block risk-high text-xs font-bold px-3 py-1.5 rounded-full mb-3">${T('⚠️ Vượt Mức Tiêu Thụ', '⚠️ Over Consumption')}</span>` : `<span class="inline-block risk-low text-xs font-bold px-3 py-1.5 rounded-full mb-3">${T('✅ Trong ngưỡng an toàn', '✅ Within safe range')}</span>`}
      <p class="font-display font-extrabold ${over ? 'text-red-600' : 'text-primary'} text-4xl">${er.total.toLocaleString('vi-VN')} <span class="text-base">kWh</span></p>
      <p class="text-xs text-deep-teal/60 mb-4">${T('Mục tiêu', 'Target')}: <b>${er.target.toLocaleString('vi-VN')} kWh</b></p>
      <div class="w-36 h-36 mx-auto rounded-full flex items-center justify-center" style="background:conic-gradient(${over ? '#dc2626' : '#006687'} ${ringDeg}deg, #e5f2f8 0deg)">
        <div class="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
          <span class="font-display font-extrabold ${over ? 'text-red-600' : 'text-primary'} text-2xl">${er.overloadPct}%</span>
          <span class="text-[9px] font-bold text-deep-teal/50 uppercase">${over ? T('Quá tải', 'Overloaded') : T('Công suất', 'Capacity')}</span>
        </div>
      </div>
    </div>
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-display font-bold text-deep-teal">${T('Chi tiết dây chuyền', 'Line details')}</h3>
      <span class="text-[11px] text-deep-teal/50">${T(`Cập nhật theo vòng ${Math.min(S.round, ROUNDS_TOTAL)}`, `Updated for round ${Math.min(S.round, ROUNDS_TOTAL)}`)}</span>
    </div>
    ${er.lines.map((l, i) => `
      <div class="clay-card p-4 mb-3 ${l.status === 'bad' ? 'border-2 border-red-200' : ''}">
        <div class="flex items-center gap-3">
          <span class="text-2xl">${['🦾', '🏭', '🔩'][i]}</span>
          <div class="flex-1">
            <p class="font-bold text-sm text-deep-teal">${l.name} ${l.upgraded ? `<span class="text-[9px] bg-primary-container/30 text-primary font-bold px-1.5 py-0.5 rounded-full">${T('ĐÃ NÂNG CẤP', 'UPGRADED')}</span>` : ''}</p>
            <div class="h-2 rounded-full bg-surface-bright overflow-hidden mt-1.5"><div class="h-full ${barColor[l.status]} rounded-full" style="width:${Math.round(100 * l.kwh / maxKwh)}%"></div></div>
          </div>
          <div class="text-right"><p class="font-display font-bold ${l.status === 'bad' ? 'text-red-600' : 'text-primary'} text-sm">${l.kwh.toLocaleString('vi-VN')} kWh</p>${statusChip[l.status]}</div>
        </div>
      </div>`).join('')}
    <div class="clay-card p-4 mb-3 bg-primary-container/10">
      <div class="flex gap-3 items-start">
        <img src="assets/character/lumina-vest.webp" alt="Lumina" class="w-10 h-10 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
        <div>
          <p class="text-sm"><span class="font-display font-extrabold lumina-name">Lumina AI</span> <span class="signature text-base text-deep-teal">Je m'appelle Hương</span></p>
          <p class="text-sm text-deep-teal/80 italic mt-1">"${worst.upgraded
            ? T('Các dây chuyền đã vận hành tối ưu. Duy trì bảo trì định kỳ để giữ OEE ổn định nhé!', 'All lines are running optimally. Keep up routine maintenance to hold OEE steady!')
            : T(`${worst.name} đang tiêu thụ năng lượng nhiều hơn 40% do máy móc đã cũ. Việc nâng cấp sẽ giúp giảm đáng kể chi phí vận hành (OPEX).`, `${worst.name} is consuming 40% more energy due to aging equipment. Upgrading it will significantly cut operating cost (OPEX).`)}"</p>
          <p class="text-xs font-bold text-primary mt-2">${T(`💡 Tiềm năng tiết kiệm: ${Math.round(worst.kwh * 0.4 / 100) * 10}tr₫/vòng`, `💡 Potential savings: ${Math.round(worst.kwh * 0.4 / 100) * 10}m₫/round`)}</p>
        </div>
      </div>
    </div>
    <button onclick="doOptimizeLine(${worstIdx})" class="clay-btn w-full bg-deep-teal text-white font-display font-bold py-4 mb-3 ${worst.upgraded ? 'opacity-50' : ''}" ${worst.upgraded ? 'disabled' : ''}>${T(`⚡ Tối ưu ${worst.name} (150tr₫)`, `⚡ Optimize ${worst.name} (150m₫)`)}</button>
    <button onclick="doMaintain()" class="clay-btn w-full bg-white text-deep-teal font-display font-bold py-4 mb-4">${T('🕓 Bảo trì ngay (60tr₫)', '🕓 Maintain now (60m₫)')}</button>
    <h3 class="font-display font-bold text-deep-teal mb-2">${T('Lịch sử bảo trì', 'Maintenance history')}</h3>
    <div class="clay-card p-4 text-sm text-deep-teal/70 space-y-1.5">
      ${(S.maintenanceLog || []).length ? S.maintenanceLog.slice(-6).reverse().map(m => `<p>🔧 V${m.round}: ${m.text}</p>`).join('') : `<p class="text-deep-teal/40">${T('Chưa có hoạt động bảo trì nào.', 'No maintenance activity yet.')}</p>`}
    </div>`;
}

function doOptimizeLine(idx) {
  if (!optimizeLine(S, idx)) { alert(T('ERR_INSUFFICIENT_FUNDS – Cần 150tr₫ trong ví để nâng cấp dây chuyền.', 'ERR_INSUFFICIENT_FUNDS – You need 150m₫ in your wallet to upgrade the line.')); return; }
  save(); renderAll(); showReport('energy'); createConfetti();
}

function doMaintain() {
  if (!doMaintenance(S)) { alert(T('ERR_INSUFFICIENT_FUNDS – Cần 60tr₫ trong ví để bảo trì.', 'ERR_INSUFFICIENT_FUNDS – You need 60m₫ in your wallet for maintenance.')); return; }
  save(); renderAll(); showReport('energy');
}

// ---------- Shop & Inventory ----------
function renderShop() {
  const mul = skillEffect(S, 'shopMul', 1);
  $('shop-list').innerHTML = SHOP_ITEMS_LIST().map(it => {
    const price = Math.round(it.price * mul);
    return `<div class="clay-card p-4 flex items-center gap-3">
      ${it.img ? `<img src="${it.img}" alt="${it.name}" class="w-14 h-14 rounded-2xl object-cover shrink-0">` : `<span class="text-3xl">${it.icon}</span>`}
      <div class="flex-1"><p class="font-display font-bold text-deep-teal text-sm">${it.name}</p>
        <p class="text-[11px] text-deep-teal/60">${it.desc}</p></div>
      <button onclick="buyItem('${it.id}')" class="clay-btn bg-primary text-white text-xs font-bold px-3 py-2 shrink-0">${price}tr₫</button>
    </div>`;
  }).join('');

  renderInventory();
}

// ---------- Kho đồ (theo thiết kế Kho đồ 3D Claymorphism) ----------
let invFilter = 'all', invSelected = null;

function setInvFilter(f) {
  invFilter = f;
  document.querySelectorAll('.inv-tab').forEach(b => {
    const on = b.dataset.inv === f;
    b.classList.toggle('bg-primary', on); b.classList.toggle('text-white', on);
    b.classList.toggle('bg-white', !on); b.classList.toggle('text-deep-teal', !on);
  });
  renderInventory();
}

function renderInventory() {
  const list = $('inventory-list');
  if (!list) return;
  let owned = Object.entries(S.items).filter(([, q]) => q > 0);
  if (invFilter === 'blueprint') owned = owned.filter(([id]) => SHOP_ITEMS_LIST().find(x => x.id === id).type === 'blueprint');
  if (invFilter === 'item') owned = owned.filter(([id]) => SHOP_ITEMS_LIST().find(x => x.id === id).type !== 'blueprint');
  list.innerHTML = owned.length ? owned.map(([id, q]) => {
    const it = SHOP_ITEMS_LIST().find(x => x.id === id);
    const active = S.activeBoosts.includes(id);
    return `<button onclick="selectInvItem('${id}')" class="clay-card p-4 flex flex-col items-center text-center ${invSelected === id ? 'ring-2 ring-primary-container' : ''}">
      <div class="item-icon-container w-full aspect-square flex items-center justify-center mb-2">
        <span class="text-4xl animate-float">${it.icon}</span>
      </div>
      <p class="font-bold text-xs text-deep-teal line-clamp-1">${it.name}</p>
      <span class="text-primary font-bold text-[11px] mt-0.5">×${q}${active ? T(' · ĐÃ BẬT', ' · ACTIVE') : ''}</span>
    </button>`;
  }).join('') : `<p class="text-sm text-deep-teal/50 col-span-2">${T('Chưa có vật phẩm nào trong mục này.', 'No items in this category yet.')}</p>`;
  renderInvDetail();
}

function selectInvItem(id) { invSelected = id; renderInventory(); }

function renderInvDetail() {
  const it = invSelected ? SHOP_ITEMS_LIST().find(x => x.id === invSelected) : null;
  const q = it ? (S.items[invSelected] || 0) : 0;
  const useBtn = $('invd-use');
  if (!it || q <= 0) {
    $('invd-icon').textContent = '🎒';
    $('invd-name').textContent = T('Chọn một vật phẩm', 'Select an item');
    $('invd-count').textContent = '--';
    $('invd-desc').textContent = T('Chạm vào một vật phẩm trong kho để xem chi tiết và sử dụng sức mạnh của nó.', "Tap an item in your inventory to see details and use its power.");
    useBtn.disabled = true; useBtn.classList.add('opacity-50');
    useBtn.textContent = T('Sử dụng 🚀', 'Use 🚀');
    return;
  }
  const isBlueprint = it.type === 'blueprint';
  const active = S.activeBoosts.includes(it.id);
  $('invd-icon').textContent = it.icon;
  $('invd-name').textContent = it.name;
  $('invd-count').textContent = '×' + q;
  $('invd-desc').textContent = it.desc + (isBlueprint ? T(' (Bản thiết kế – hiệu lực vĩnh viễn.)', ' (Blueprint – permanent effect.)') : active ? T(' (Đang bật – sẽ áp dụng ở vòng kế tiếp.)', ' (Active – will apply next round.)') : '');
  useBtn.disabled = isBlueprint;
  useBtn.classList.toggle('opacity-50', isBlueprint);
  useBtn.textContent = isBlueprint ? T('Hiệu lực vĩnh viễn ✅', 'Permanent effect ✅') : active ? T('Tắt kích hoạt', 'Deactivate') : T('Sử dụng 🚀', 'Use 🚀');
  useBtn.onclick = (e) => {
    if (isBlueprint) return;
    const wasActive = active;
    toggleBoost(it.id);
    itemSparkles(e.clientX, e.clientY);
    itemToast(wasActive ? T('Đã tắt kích hoạt vật phẩm', 'Item deactivated') : T('✨ Vật phẩm đã được kích hoạt!', '✨ Item activated!'));
    renderInventory();
  };
}

// Hiệu ứng lấp lánh + toast khi dùng vật phẩm (thiết kế Stitch)
function itemSparkles(x, y) {
  const colors = ['#00c4ff', '#71d2ff', '#c0e8ff', '#fda127', '#ffffff'];
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'sparkle-particle';
    const size = 4 + Math.random() * 8;
    p.style.cssText = `width:${size}px;height:${size}px;background:${colors[i % colors.length]};left:${x}px;top:${y}px;`;
    const ang = Math.random() * Math.PI * 2, v = 40 + Math.random() * 70;
    p.style.setProperty('--tx', Math.cos(ang) * v + 'px');
    p.style.setProperty('--ty', Math.sin(ang) * v + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}
function itemToast(text) {
  const t = document.createElement('div');
  t.className = 'item-toast clay-card px-5 py-2.5 flex items-center gap-2.5';
  t.innerHTML = `<span class="w-6 h-6 rounded-full bg-primary-container/30 text-primary flex items-center justify-center text-sm font-bold">✓</span><span class="text-sm font-bold text-deep-teal">${text}</span>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function buyItem(id) {
  const it = SHOP_ITEMS_LIST().find(x => x.id === id);
  if (!it) { alert(T('ERR_ITEM_NOT_FOUND – Vật phẩm không tồn tại.', 'ERR_ITEM_NOT_FOUND – Item does not exist.')); return; }
  const price = Math.round(it.price * skillEffect(S, 'shopMul', 1));
  if (S.balance < price) { alert(T('ERR_INSUFFICIENT_FUNDS – Ví ảo của đội không đủ ' + price + 'tr₫.', "ERR_INSUFFICIENT_FUNDS – Your team's wallet doesn't have " + price + 'm₫.')); return; }
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
    if ((S.items[id] || 0) > 0 && SHOP_ITEMS_LIST().find(x => x.id === id).type === 'consumable') S.items[id]--;
  }
  save(); renderShop();
}

// ---------- Skills ----------
function renderSkills() {
  const avail = S.xp - S.spentXp;
  $('skill-tree').innerHTML = `<div class="clay-card p-4 mb-1 flex justify-between items-center">
      <span class="font-bold text-sm text-deep-teal">${T('XP khả dụng', 'Available XP')}</span>
      <span class="font-display font-extrabold text-primary">${avail.toLocaleString('vi-VN')} XP</span>
    </div>` +
    SKILLS_LIST().map(sk => {
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
  const sk = SKILLS_LIST().find(x => x.id === id);
  if (S.xp - S.spentXp < sk.cost) { alert(T('Chưa đủ XP – hãy hoàn thành thêm vòng chơi!', 'Not enough XP yet – complete more rounds!')); return; }
  S.spentXp += sk.cost;
  S.skills.push(id);
  save(); renderAll(); createConfetti();
}

// ---------- Leaderboard ----------
function renderLeaderboard() {
  const totalProfit = S.history.reduce((a, r) => a + r.netProfit, 0);
  const lastShare = S.history.length ? S.history[S.history.length - 1].share : 25;
  const all = [
    { name: S.profile.teamName + T(' (Bạn)', ' (You)'), profit: totalProfit, share: lastShare, me: true },
    ...S.competitors.map(c => ({ name: c.name, profit: c.profit, share: c.share })),
  ].sort((a, b) => b.profit - a.profit);
  const medals = ['🥇', '🥈', '🥉', '4️⃣'];
  $('lb-list').innerHTML = all.map((t, i) => `
    <div class="clay-card p-4 flex items-center gap-3 ${t.me ? 'border-2 border-primary-container' : ''}">
      <span class="text-2xl">${medals[i]}</span>
      <div class="flex-1"><p class="font-display font-bold text-deep-teal text-sm">${t.name}</p>
        <p class="text-[11px] text-deep-teal/50">${T(`Thị phần ${t.share.toFixed(1)}%`, `Market share ${t.share.toFixed(1)}%`)}</p></div>
      <span class="font-display font-bold ${t.profit >= 0 ? 'text-primary' : 'text-orange-600'}">${money(t.profit)}</span>
    </div>`).join('');
}

// ---------- Achievements & Certificate ----------
function renderAchievements() {
  $('ach-list').innerHTML = ACHIEVEMENTS_LIST().map(a => {
    const got = S.achievements.includes(a.id);
    return `<div class="clay-card p-4 text-center ${got ? '' : 'skill-locked'}">
      <p class="text-3xl">${a.icon}</p>
      <p class="font-display font-bold text-deep-teal text-xs mt-1">${a.name}</p>
      <p class="text-[10px] text-deep-teal/50 mt-0.5">${a.desc}</p>
    </div>`;
  }).join('');
  if (S.finished && !isTrial()) {
    $('certificate-box').classList.remove('hidden');
    $('cert-team').textContent = S.profile.teamName;
    const total = S.history.reduce((a, r) => a + r.netProfit, 0);
    $('cert-result').textContent = T(`Tổng lợi nhuận: ${money(total)} · ${S.xp.toLocaleString('vi-VN')} XP · ${S.achievements.length}/${ACHIEVEMENTS_LIST().length} thành tựu`,
      `Total profit: ${money(total)} · ${S.xp.toLocaleString('en-US')} XP · ${S.achievements.length}/${ACHIEVEMENTS_LIST().length} achievements`);
  }
}

// ---------- Profile & Settings ----------
function renderProfile() {
  $('pf-name').textContent = S.profile.teamName;
  $('pf-email').textContent = S.profile.email + (S.profile.classId ? T(' · Lớp ', ' · Class ') + S.profile.classId : '');
  $('pf-role').textContent = { CEO: T('🧭 CEO – Quyết định', '🧭 CEO – Decisions'), CFO: T('💰 CFO – Tài chính', '💰 CFO – Finance'), CMO: T('📣 CMO – Thị trường', '📣 CMO – Market'), COO: T('🏭 COO – Vận hành', '🏭 COO – Operations'), SEC: T('📝 SEC – Thư ký', '📝 SEC – Secretary') }[S.profile.role];
  const level = 1 + Math.floor(S.xp / XP_PER_LEVEL);
  $('pf-level').textContent = level;
  const TIERS = T('Khởi nghiệp,Trưởng nhóm,Quản lý,Giám đốc,Executive,Chủ tịch', 'Founder,Team Lead,Manager,Director,Executive,Chairperson').split(',');
  $('pf-tier').textContent = '🏅 Tier ' + Math.min(level, 6) + ' · ' + TIERS[Math.min(level - 1, TIERS.length - 1)];
  $('pf-xp').textContent = S.xp.toLocaleString('vi-VN') + ' XP';
  $('pf-xpbar').style.width = (S.xp % XP_PER_LEVEL) + '%';
  $('pf-profit').textContent = money(S.history.reduce((a, r) => a + r.netProfit, 0));
  $('pf-rounds').textContent = S.history.length + '/6';
}

function resetGame() {
  if (!confirm(T('Xóa toàn bộ tiến trình và chơi lại từ đầu?', 'Erase all progress and start over?'))) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ---------- Missions ----------
function renderMissions() {
  const readyCount = MISSIONS_LIST().filter(m => missionStatus(S, m) === 'ready').length;
  const badge = $('missions-badge');
  badge.classList.toggle('hidden', readyCount === 0);
  badge.textContent = readyCount;
  $('missions-list').innerHTML = MISSIONS_LIST().map(m => {
    const st = missionStatus(S, m);
    return `<div class="clay-card p-4 flex items-center gap-3 ${st === 'pending' ? 'opacity-70' : ''} ${st === 'claimed' ? 'border-2 border-primary-container/40' : ''}">
      <span class="text-3xl">${m.icon}</span>
      <div class="flex-1">
        <p class="font-display font-bold text-deep-teal text-sm">${m.name}</p>
        <p class="text-[11px] text-deep-teal/60">${m.desc}</p>
        <p class="text-[11px] font-bold text-primary mt-0.5">🎁 ${m.rewardMoney}tr₫ + ${m.rewardXp} XP</p>
      </div>
      ${st === 'claimed' ? '<span class="text-xl">✅</span>'
        : st === 'ready' ? `<button onclick="doClaimMission('${m.id}')" class="clay-btn bg-primary text-white text-xs font-bold px-3 py-2 shrink-0">${T('Nhận', 'Claim')}</button>`
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
  const pts = $('mg-points'); if (pts) pts.textContent = (S.minigamePoints || 0).toLocaleString('vi-VN');
  $('mg-plays').textContent = Math.min(3, (S.minigamePlays || 0) + 1);
  const btn = $('mg-start');
  const out = (S.minigamePlays || 0) >= 3;
  btn.disabled = out || !!mg;
  btn.classList.toggle('opacity-50', out);
  if (out) btn.innerHTML = T('⏳ Hết lượt – commit vòng mới để chơi tiếp', '⏳ Out of attempts – commit a new round to play again');
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
  S.minigamePoints = (S.minigamePoints || 0) + score * 10;   // điểm đổi thưởng Clay Reward Shop
  if (score > (S.minigameBest || 0)) S.minigameBest = score;
  mg = null;
  save(); renderAll();
  if (reward > 0) createConfetti();
  $('mg-start').innerHTML = T(`🎉 +${reward}tr₫! Chơi lại (lượt ${Math.min(3, S.minigamePlays + 1)}/3)`, `🎉 +${reward}m₫! Play again (attempt ${Math.min(3, S.minigamePlays + 1)}/3)`);
  if (S.minigamePlays < 3) { $('mg-start').disabled = false; $('mg-start').classList.remove('opacity-50'); }
}

// ---------- Clay Reward Shop + Xếp hạng mini-game (thiết kế Stitch) ----------
function MG_REWARDS_LIST() { return [
  { id: 'R_HAT',    icon: '🥳', name: T('Mũ tiệc sắc màu', 'Colorful Party Hat'),        cost: 300 },
  { id: 'R_TIE',    icon: '👔', name: T('Cà vạt đất nặn', 'Clay Necktie'),          cost: 500 },
  { id: 'R_CASE',   icon: '💼', name: T('Cặp táp đất sét mini', 'Mini Clay Briefcase'),    cost: 800 },
  { id: 'R_MKT',    icon: '📈', name: T('Huy hiệu Marketing Boost', 'Marketing Boost Badge'), cost: 1000, lockLevel: 5 },
  { id: 'R_PLANT',  icon: '🪴', name: T('Chậu cây để bàn cao cấp', 'Premium Desk Plant'), cost: 1200 },
  { id: 'R_LUNCH',  icon: '🍱', name: T('Voucher ăn trưa cả đội', 'Team Lunch Voucher'),  cost: 1500 },
  { id: 'R_MYSTERY', icon: '🎁', name: T('Hộp quà bí ẩn', 'Mystery Gift Box'),          cost: 2000, lockMissions: 5 },
]; }
function showRewardShop() {
  const old = document.getElementById('rshop-overlay'); if (old) old.remove();
  const lvl = 1 + Math.floor(S.xp / XP_PER_LEVEL);
  const claimed = (S.missionsClaimed || []).length;
  const div = document.createElement('div');
  div.id = 'rshop-overlay';
  div.className = 'fixed inset-0 z-[65] bg-surface-bright overflow-y-auto';
  div.innerHTML = `
    <div class="max-w-md mx-auto px-5 py-6 pb-24">
      <div class="flex justify-between items-center mb-5">
        <button onclick="document.getElementById('rshop-overlay').remove()" class="clay-btn bg-white w-9 h-9 rounded-full text-deep-teal font-bold">←</button>
        <button onclick="showMgLeaderboard()" class="clay-btn bg-white text-deep-teal text-xs font-bold px-4 py-2">${T('🏆 Xếp hạng', '🏆 Leaderboard')}</button>
      </div>
      <div class="text-center mb-6">
        <div class="clay-card inline-flex items-center gap-3 px-6 py-3">
          <span class="text-3xl">🐷</span>
          <div class="text-left"><p class="font-display font-extrabold text-primary text-2xl leading-none">${(S.minigamePoints || 0).toLocaleString('vi-VN')}</p><p class="text-[10px] font-extrabold text-deep-teal/50 uppercase">Points</p></div>
        </div>
        <h2 class="font-display font-extrabold text-deep-teal text-xl mt-4">🏺 Clay Reward Shop</h2>
        <p class="text-xs text-deep-teal/60 mt-1">${T('Đổi điểm Clay Factory lấy quà lưu niệm cho đội (điểm ×10 mỗi lượt chơi).', 'Trade Clay Factory points for team souvenirs (points ×10 per play).')}</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${MG_REWARDS_LIST().map(r => {
          const owned = S.rewardsOwned.includes(r.id);
          const locked = (r.lockLevel && lvl < r.lockLevel) || (r.lockMissions && claimed < r.lockMissions);
          const lockText = r.lockLevel ? T(`Khóa – Đạt cấp ${r.lockLevel}`, `Locked – Reach level ${r.lockLevel}`) : r.lockMissions ? T(`Khóa – Nhận ${r.lockMissions} nhiệm vụ`, `Locked – Claim ${r.lockMissions} missions`) : '';
          const equipped = S.rewardEquipped === r.id;
          return `<div class="clay-card p-4 text-center ${locked ? 'opacity-70' : ''} ${equipped ? 'ring-2 ring-primary-container' : ''}">
            <p class="text-4xl mb-2 ${locked ? 'grayscale' : 'animate-float'}">${locked ? '🔒' : r.icon}</p>
            <p class="font-bold text-xs text-deep-teal leading-tight min-h-[2rem]">${r.name}</p>
            ${locked
              ? `<p class="text-[10px] font-bold text-deep-teal/50 mt-2">${lockText}</p>`
              : owned
                ? `<button onclick="equipReward('${r.id}')" class="clay-btn w-full ${equipped ? 'bg-surface-bright text-deep-teal/50' : 'bg-white text-deep-teal'} text-xs font-bold py-2 mt-2">${equipped ? T('✓ Đang đeo', '✓ Equipped') : T('Đeo', 'Equip')}</button>`
                : `<p class="font-display font-extrabold text-primary text-sm mt-1">${T(`${r.cost.toLocaleString('vi-VN')} điểm`, `${r.cost.toLocaleString('en-US')} points`)}</p>
                   <button onclick="redeemReward('${r.id}', event)" class="clay-btn w-full ${S.minigamePoints >= r.cost ? 'bg-emerald-500 text-white' : 'bg-surface-bright text-deep-teal/40'} text-xs font-bold py-2 mt-2">Redeem</button>`}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  document.body.appendChild(div);
}
function redeemReward(id, e) {
  const r = MG_REWARDS_LIST().find(x => x.id === id);
  if (!r || S.rewardsOwned.includes(id)) return;
  if ((S.minigamePoints || 0) < r.cost) { itemToast(T('Chưa đủ điểm – chơi thêm Clay Factory nhé!', 'Not enough points – play more Clay Factory!')); return; }
  S.minigamePoints -= r.cost;
  S.rewardsOwned.push(id);
  save();
  if (e) itemSparkles(e.clientX, e.clientY);
  showUnboxing(r);
}
function showUnboxing(r) {
  const div = document.createElement('div');
  div.className = 'fixed inset-0 z-[75] flex flex-col items-center justify-center text-center px-8';
  div.style.background = 'radial-gradient(circle at 50% 34%, rgba(0,196,255,.18), transparent 50%), linear-gradient(160deg,#0b1420,#033337)';
  div.innerHTML = `
    <h2 class="font-display font-extrabold text-3xl text-white leading-tight">${T('Mở khóa<br><span style="color:#fda127; text-shadow:0 0 20px rgba(253,161,39,.6)">phần thưởng mới!</span>', 'Unlocked<br><span style="color:#fda127; text-shadow:0 0 20px rgba(253,161,39,.6)">a new reward!</span>')}</h2>
    <p class="text-8xl mt-8 animate-float" style="filter:drop-shadow(0 0 30px rgba(0,196,255,.7))">${r.icon}</p>
    <p class="font-display font-extrabold text-white text-xl mt-6">${r.name}</p>
    <div class="flex gap-3 mt-9">
      <button id="unbox-wear" class="clay-btn font-display font-extrabold text-white text-sm px-8 py-3.5" style="background:linear-gradient(90deg,#00a2d8,#00c4ff)">${T('Đeo ngay', 'Equip now')}</button>
      <button id="unbox-back" class="clay-btn bg-white text-deep-teal font-display font-extrabold text-sm px-8 py-3.5">${T('Về cửa hàng', 'Back to shop')}</button>
    </div>`;
  document.body.appendChild(div);
  createConfetti(); playEventSting('good');
  div.querySelector('#unbox-wear').addEventListener('click', () => { equipReward(r.id); div.remove(); });
  div.querySelector('#unbox-back').addEventListener('click', () => { div.remove(); showRewardShop(); });
}
function equipReward(id) {
  S.rewardEquipped = S.rewardEquipped === id ? null : id;
  save(); renderAll();
  const open = document.getElementById('rshop-overlay');
  if (open) { open.remove(); showRewardShop(); }
}
function showMgLeaderboard() {
  const old = document.getElementById('mglb-overlay'); if (old) old.remove();
  const AI = [
    { name: 'Alex', team: 'Alpha Dynamics', score: 28 }, { name: 'Bella', team: 'Mekong Ventures', score: 24 },
    { name: 'Chris', team: 'Star Clay Co.', score: 21 }, { name: 'David', team: 'Team Rocket', score: 18 },
    { name: 'Emily', team: 'Clay Masters', score: 15 }, { name: 'Frank', team: 'The Sculptors', score: 12 },
  ];
  const you = { name: S.profile.teamName, team: T('Đội của bạn', 'Your team'), score: S.minigameBest || 0, you: true };
  const all = AI.concat([you]).sort((a, b) => b.score - a.score);
  const rank = all.indexOf(you) + 1;
  const podium = all.slice(0, 3);
  const rest = all.slice(3);
  const medal = ['🥇', '🥈', '🥉'];
  const div = document.createElement('div');
  div.id = 'mglb-overlay';
  div.className = 'fixed inset-0 z-[70] bg-surface-bright overflow-y-auto';
  div.innerHTML = `
    <div class="max-w-md mx-auto px-5 py-6 pb-24">
      <div class="flex justify-between items-center mb-6">
        <button onclick="document.getElementById('mglb-overlay').remove()" class="clay-btn bg-white w-9 h-9 rounded-full text-deep-teal font-bold">←</button>
        <p class="font-display font-extrabold text-deep-teal">${T('🏆 Xếp hạng Clay Factory', '🏆 Clay Factory Leaderboard')}</p>
        <span class="w-9"></span>
      </div>
      <div class="flex items-end justify-center gap-2 mb-6">
        ${[podium[1], podium[0], podium[2]].filter(Boolean).map((p, i) => {
          const real = i === 1 ? 0 : i === 0 ? 1 : 2;
          const h = ['h-20', 'h-28', 'h-16'][i];
          return `<div class="flex-1 max-w-[110px] text-center">
            <p class="text-2xl">${medal[real]}</p>
            <p class="font-bold text-[11px] text-deep-teal truncate">${p.you ? '⭐ ' : ''}${p.name}</p>
            <div class="clay-card ${h} mt-1.5 flex flex-col items-center justify-center ${p.you ? 'ring-2 ring-primary-container' : ''}">
              <p class="font-display font-extrabold ${real === 0 ? 'text-clay-gold text-2xl' : 'text-deep-teal text-xl'}" style="${real === 0 ? 'color:#fda127' : ''}">${real + 1}</p>
              <p class="text-[10px] font-bold text-deep-teal/50">${T(`${p.score} điểm`, `${p.score} pts`)}</p>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="space-y-2.5">
        ${rest.map((p, i) => `
        <div class="clay-card p-3.5 flex items-center gap-3 ${p.you ? 'ring-2 ring-primary-container' : ''}">
          <span class="font-display font-extrabold text-deep-teal/40 w-8">#${i + 4}</span>
          <div class="flex-1 min-w-0"><p class="font-bold text-sm text-deep-teal truncate">${p.you ? '⭐ ' : ''}${p.name}</p><p class="text-[10px] text-deep-teal/50">${p.team}</p></div>
          <p class="font-display font-extrabold text-primary">${p.score}</p>
        </div>`).join('')}
      </div>
      <div class="clay-card p-4 mt-5 flex items-center justify-between" style="background:linear-gradient(90deg,#e8762d,#fda127)">
        <p class="font-display font-extrabold text-white text-sm">${T(`Hạng của bạn: #${rank}`, `Your rank: #${rank}`)}</p>
        <p class="font-display font-extrabold text-white">${T(`${you.score} điểm`, `${you.score} pts`)}</p>
      </div>
      <p class="text-[10px] text-deep-teal/40 text-center mt-3">${T('So tài cùng 6 đội AI – phá kỷ lục điểm Clay Factory để leo hạng!', 'Compete against 6 AI teams – beat your Clay Factory high score to climb the ranks!')}</p>
    </div>`;
  document.body.appendChild(div);
}

// ---------- Instructor ----------
function renderInstructor() {
  const lockBtn = $('btn-lock');
  lockBtn.textContent = S.roundLocked ? T('🔓 Mở khóa', '🔓 Unlock') : T('🔒 Khóa', '🔒 Lock');
  lockBtn.classList.toggle('bg-orange-100', S.roundLocked);
  const totalProfit = S.history.reduce((a, r) => a + r.netProfit, 0);
  const teams = [
    { id: 'YOU', name: S.profile.teamName + T(' (đội của lớp)', " (the class's team)"), balance: S.balance, profit: totalProfit, real: true },
    ...S.competitors.map((c, i) => ({ id: 'AI' + i, name: c.name + ' (AI)', balance: null, profit: c.profit })),
  ];
  $('ins-teams').innerHTML = teams.map(t => `
    <div class="clay-card p-4 flex items-center gap-3">
      <span class="text-2xl">${t.real ? '🏢' : '🤖'}</span>
      <div class="flex-1">
        <p class="font-bold text-sm text-deep-teal">${t.name}</p>
        <p class="text-[11px] text-deep-teal/60">${T('Lợi nhuận lũy kế:', 'Cumulative profit:')} ${money(t.profit)}${t.balance != null ? T(' · Ví: ', ' · Wallet: ') + money(t.balance) : ''}</p>
      </div>
      ${t.real ? `<button onclick="grantFunds(100)" class="clay-btn bg-primary text-white text-xs font-bold px-3 py-2 shrink-0">+100tr₫</button>` : ''}
    </div>`).join('');
  $('ins-log').innerHTML = (S.grantLog || []).length
    ? S.grantLog.slice(-8).reverse().map(g => `<p>${T(`💸 Cấp <b>${g.amount}tr₫</b> cho ${g.team} – vòng ${g.round}`, `💸 Granted <b>${g.amount}m₫</b> to ${g.team} – round ${g.round}`)}</p>`).join('')
    : `<p class="text-deep-teal/40">${T('Chưa có giao dịch nào.', 'No transactions yet.')}</p>`;
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
  const riskLabel = { low: T('🟢 Rủi ro thấp', '🟢 Low risk'), medium: T('🟡 Rủi ro vừa', '🟡 Medium risk'), high: T('🔴 Rủi ro cao', '🔴 High risk') };
  const riskClass = { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' };
  $('ap-result').innerHTML = `
    <div class="clay-card p-4 mb-3 flex items-center gap-3">
      <img src="assets/character/lumina-vest.webp" alt="Lumina" class="w-10 h-10 rounded-full object-cover shadow-clay" style="object-position:50% 12%">
      <p class="text-sm text-deep-teal">${T(`Biên lợi nhuận hiện tại của bạn là <b>${r.marginPct}%</b> – ${r.healthy ? 'nền tảng tốt để mở rộng! 💪' : 'hơi mỏng, nên tối ưu chi phí trước khi tăng tốc. ⚠️'}`,
        `Your current margin is <b>${r.marginPct}%</b> – ${r.healthy ? 'a solid base to expand on! 💪' : 'a bit thin, optimize costs before accelerating. ⚠️'}`)}</p>
    </div>
    ${r.scenarios.map(sc => `
      <div class="clay-card p-4 mb-3">
        <div class="flex justify-between items-center mb-2">
          <p class="font-display font-bold text-deep-teal">${sc.label}</p>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${riskClass[sc.risk]}">${riskLabel[sc.risk]}</span>
        </div>
        <p class="text-sm text-deep-teal/80">${T(`<b>Nếu</b> điều chỉnh ngân sách marketing thành <b>${sc.newMkt}tr₫/tháng</b>,
        <b>thì</b> tăng trưởng dự kiến đạt <b>${sc.growth}%/quý</b> – doanh thu ~<b>${sc.newRevenue}tr₫</b>,
        lợi nhuận ~<b class="${sc.newProfit >= 0 ? 'text-emerald-600' : 'text-orange-600'}">${sc.newProfit}tr₫/tháng</b>.`,
        `<b>If</b> you adjust the marketing budget to <b>${sc.newMkt}m₫/month</b>,
        <b>then</b> projected growth reaches <b>${sc.growth}%/quarter</b> – revenue ~<b>${sc.newRevenue}m₫</b>,
        profit ~<b class="${sc.newProfit >= 0 ? 'text-emerald-600' : 'text-orange-600'}">${sc.newProfit}m₫/month</b>.`)}</p>
      </div>`).join('')}
    <p class="text-[11px] text-deep-teal/40 text-center mb-4">${T('Mô hình dự báo đơn giản hóa cho mục đích học tập – không phải tư vấn tài chính.', 'A simplified forecasting model for educational purposes – not financial advice.')}</p>`;
}
