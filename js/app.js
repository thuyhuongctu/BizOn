/* BizOn Bật Nghiệp 2026 — UI controller (SPA, localStorage persistence)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */

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
      s.minigamePoints ??= 0; s.rewardsOwned ??= []; s.rewardEquipped ??= null;
      s.oee ??= 85; s.defect ??= 2.0; s.brandLoyalty ??= 65; s.adEff ??= 0;
      s.quickRatio ??= 1.0; s.roi ??= 0; s.energyLines ??= [2100, 4850, 1470];
      s.lineUpgraded ??= [false, false, false]; s.maintBonus ??= 0; s.maintenanceLog ??= [];
      s.loan ??= 0; s.costCutter ??= false; s.peakShare ??= 0; s.eventShownRound ??= 0;
      s.whatIfUsed ??= 0; s.advisorHistory ??= [];
      s.conquest ??= []; s.aiHistory ??= []; s.teamMembers ??= null;
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
  { id: 'CEO', icon: '🧭', title: 'Nhà lãnh đạo tầm nhìn',   desc: 'Chèo lái chiến lược, chốt hạ mọi quyết định' },
  { id: 'CFO', icon: '💰', title: 'Chiến lược gia tài chính', desc: 'Giữ két sắt, cân đối dòng tiền & gọi vốn' },
  { id: 'CMO', icon: '📣', title: 'Phù thủy marketing',       desc: 'Đánh chiếm thị phần bằng thương hiệu' },
  { id: 'COO', icon: '🏭', title: 'Chuyên gia vận hành',      desc: 'Tối ưu xưởng, OEE & chất lượng sản phẩm' },
  { id: 'SEC', icon: '📝', title: 'Thư ký pháp chế',          desc: 'Biên bản minh bạch, tuân thủ & hồ sơ đội' },
];
let pickedRole = 'CEO';

window.addEventListener('DOMContentLoaded', () => {
  $('role-picker').innerHTML = ROLES.map(r => `
    <button type="button" data-role="${r.id}" onclick="pickRole('${r.id}')"
      class="role-chip clay-card !rounded-3xl p-4 text-center ${r.id === 'CEO' ? 'sel ring-2 ring-primary-container' : ''}">
      <div class="text-5xl leading-none">${r.icon}</div>
      <div class="font-display font-extrabold text-deep-teal text-sm mt-2">${r.id}</div>
      <div class="text-[10px] font-bold text-primary leading-tight">${r.title}</div>
      <div class="text-[9px] text-deep-teal/50 mt-1 leading-snug">${r.desc}</div>
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
  document.querySelectorAll('.role-chip').forEach(b => {
    const on = b.dataset.role === id;
    b.classList.toggle('ring-2', on);
    b.classList.toggle('sel', on);
    if (on) b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}

// ---------- Đội demo 5 nhân vật & 3 đối thủ đại diện ----------
const DEMO_TEAM = [
  { role: 'CEO', icon: '🧭', name: 'Minh Long',  note: 'Nhà lãnh đạo tầm nhìn' },
  { role: 'CFO', icon: '💰', name: 'Thu Hà',     note: 'Chiến lược gia tài chính' },
  { role: 'CMO', icon: '📣', name: 'Lan Chi',    note: 'Phù thủy marketing' },
  { role: 'COO', icon: '🏭', name: 'Quốc Bảo',   note: 'Chuyên gia vận hành' },
  { role: 'SEC', icon: '📝', name: 'Gia Hân',    note: 'Thư ký pháp chế' },
];
const AI_OPPONENTS = [
  { name: 'Alpha Dynamics', icon: '🐺', style: 'Giá rẻ tốc chiến',   play: 'Giá ~125k · marketing ~90tr mỗi vòng (dao động ±12%)', counter: 'Đừng đua giá tận đáy — giữ biên lợi nhuận, xây thương hiệu để giữ khách trung thành.' },
  { name: 'Mekong Ventures', icon: '🐘', style: 'Cân bằng chắc chắn', play: 'Giá ~150k · marketing ~60tr — ổn định như đồng bằng', counter: 'Vượt mặt bằng R&D và biến cố: họ ít khi phản ứng nhanh với thị trường.' },
  { name: 'Star Clay Co.',   icon: '🦚', style: 'Cao cấp thương hiệu', play: 'Giá ~195k · marketing ~75tr — đánh phân khúc sang', counter: 'Chiếm phân khúc phổ thông họ bỏ ngỏ, hoặc đấu trực diện bằng chất lượng + ESG.' },
];

function doLoginDemo() {
  $('login-email').value = 'demo@bizon.vn';
  $('login-team').value = 'Đội Demo Rồng Xanh';
  $('login-class').value = 'DEMO-2026';
  pickedRole = 'CEO';
  doLogin();
  S.teamMembers = DEMO_TEAM;
  save(); renderAll();
}

function renderTeamCard() {
  const box = $('team-card');
  if (!box) return;
  if (!S.teamMembers) { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="clay-card p-5 mb-4">
    <h3 class="font-display font-bold text-deep-teal mb-3">👥 Đội hình của bạn <span class="text-[10px] font-extrabold text-primary">DEMO</span></h3>
    <div class="grid grid-cols-5 gap-2 text-center">${S.teamMembers.map(m => `
      <div class="clay-sunken rounded-2xl p-2 ${m.role === S.profile.role ? 'ring-2 ring-primary-container' : ''}">
        <p class="text-2xl">${m.icon}</p>
        <p class="text-[10px] font-extrabold text-deep-teal mt-0.5">${m.role}</p>
        <p class="text-[9px] text-deep-teal/55 leading-tight">${m.name}</p>
      </div>`).join('')}</div>
    <p class="text-[10px] text-deep-teal/45 mt-2.5">Bạn đang cầm vai ${S.profile.role} — các thành viên còn lại do đội thảo luận ngoài đời (chế độ lớp học).</p>
  </div>`;
}

function renderOpponents() {
  const box = $('opponents-card');
  if (!box) return;
  const shares = S.competitors.map(c => (c.share || 25));
  box.innerHTML = `<div class="clay-card p-5 mb-4">
    <h3 class="font-display font-bold text-deep-teal mb-1">⚔️ 3 đối thủ AI của bạn</h3>
    <p class="text-[10px] text-deep-teal/45 mb-3">Mỗi vòng họ tự định giá & chi marketing theo tính cách — xem Sổ tay 📖 mục "Đối thủ AI" để biết cách khắc chế.</p>
    ${AI_OPPONENTS.map((o, i) => `
      <div class="flex items-center gap-3 py-2 ${i < 2 ? 'border-b border-surface-bright' : ''}">
        <p class="text-2xl shrink-0">${o.icon}</p>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-extrabold text-deep-teal">${o.name} <span class="font-bold text-primary">· ${o.style}</span></p>
          <p class="text-[10px] text-deep-teal/55 truncate">${o.play}</p>
        </div>
        <p class="text-xs font-display font-extrabold text-deep-teal/70 shrink-0">${shares[i].toFixed(0)}%</p>
      </div>`).join('')}
  </div>`;
}

function doLogin() {
  const email = $('login-email').value.trim() || 'sinhvien@bizon.vn';
  const team = $('login-team').value.trim() || 'Đội Claymorphism';
  const classId = $('login-class').value.trim();
  S = newGameState({ email, teamName: team, role: pickedRole, classId });
  save();
  $('screen-login').classList.remove('active');
  enterApp();
  createConfetti();
  try { if (!localStorage.getItem('bizon-intro-seen')) showIntro(); } catch (e) {}
  playHuongIntro();   // giọng chào thật của Hương AI (được phép vì gọi từ thao tác chạm)
  startMusic();       // nhạc nền BizOn Theme
}

// ---------- Màn hình loading toàn trang khi xử lý vòng (thiết kế Stitch) ----------
const SIM_STEPS = [
  'Đang tổng hợp quyết định của đội...',
  'Thị trường đang phản ứng...',
  '3 đối thủ AI đang ra quyết định...',
  'Đang lập báo cáo tài chính...',
];
function showSimLoading() {
  const div = document.createElement('div');
  div.id = 'sim-loading';
  div.className = 'fixed inset-0 z-[60] flex flex-col items-center justify-center text-center px-8';
  div.style.background = 'linear-gradient(160deg,#02191c 0%,#033337 60%,#02444d 100%)';
  div.innerHTML = `
    <img src="assets/icons/icon-192.png" alt="" class="w-24 h-24 rounded-3xl animate-pulse-logo" style="filter:drop-shadow(0 0 28px rgba(0,196,255,.75))">
    <h2 class="font-display font-extrabold text-2xl text-white mt-8 leading-tight">Đang chuẩn bị<br><span style="color:#7fe3ff; text-shadow:0 0 18px rgba(0,196,255,.6)">Dashboard của bạn...</span></h2>
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
    <h2 class="font-display font-extrabold text-3xl text-white mt-8 leading-tight">Tuyệt vời! Đội đạt<br><span style="color:#fda127; text-shadow:0 0 20px rgba(253,161,39,.6)">Cấp ${level}</span></h2>
    <p class="text-white/60 text-sm mt-3 max-w-xs">Bạn đã mở khóa thêm sức mạnh mới. Hãy trải nghiệm ngay để nâng cao hiệu quả điều hành của đội.</p>
    <button id="lvl-close" class="clay-btn font-display font-extrabold text-white text-sm px-12 py-4 mt-9" style="background:linear-gradient(90deg,#00a2d8,#fda127)">Bắt đầu ngay</button>`;
  document.body.appendChild(div);
  createConfetti();
  playEventSting('good');
  div.querySelector('#lvl-close').addEventListener('click', () => div.remove());
}

// ---------- Sổ tay hướng dẫn (User Manual — thiết kế Stitch) ----------
const MANUAL = {
  start: { icon: '🚀', name: 'Bắt đầu', html: `
    <p class="text-sm text-deep-teal/75 mb-4">Chào mừng bạn đến với BizOn — môi trường mô phỏng kinh doanh 3D. Ba bước thiết lập:</p>
    ${[['1', 'Lập đội & chọn vai trò', 'Đăng nhập với tên đội, Class ID (nếu học trên lớp) và chọn vai trò CEO · CFO · CMO · COO · SEC.'],
       ['2', 'Nhận vốn khởi điểm', 'Mỗi đội bắt đầu với 500tr₫ vốn giảng viên cấp. Giữ ít nhất 15% dự phòng cho biến cố!'],
       ['3', 'Vào vòng 1', 'Đọc biến cố thị trường, hỏi Lumina AI, rồi vào Quyết định để chốt kế hoạch đầu tiên.']].map(([n, t, d]) => `
    <div class="clay-card p-4 mb-3 flex gap-3.5 items-start"><span class="w-9 h-9 shrink-0 rounded-full bg-primary-container/30 text-primary font-display font-extrabold flex items-center justify-center">${n}</span>
      <div><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div></div>`).join('')}` },
  ai: { icon: '⚔️', name: 'Đối thủ AI', html: `
    <p class="text-sm text-deep-teal/75 mb-4">Ba đối thủ AI mô phỏng ba chiến lược kinh điển. Mỗi vòng, chúng tự định giá và chi marketing quanh mức đặc trưng (dao động ±12%), rồi cạnh tranh giành thị phần bằng đúng công thức sức hút của bạn: giá thấp hơn giá tham chiếu, marketing hiệu quả và thương hiệu tích lũy.</p>
    ${[['🐺 Alpha Dynamics', 'Giá rẻ tốc chiến', 'Giá ~125k · marketing ~90tr. Mạnh khi thị trường nhạy giá (biến cố Price War càng lợi cho họ).', 'Khắc chế: đừng đua xuống đáy — giữ biên, xây Brand Loyalty ≥70% để khách không rời đi.'],
       ['🐘 Mekong Ventures', 'Cân bằng chắc chắn', 'Giá ~150k · marketing ~60tr. Ổn định, ít bứt phá, ít sai lầm.', 'Khắc chế: tận dụng biến cố tốt (Cơ Hội Vàng, Hóa Rồng) — họ không tăng tốc theo thị trường.'],
       ['🦚 Star Clay Co.', 'Cao cấp thương hiệu', 'Giá ~195k · marketing ~75tr. Hưởng lợi lớn ở vòng 6 khi thương hiệu được nhân trọng số ×1.5.', 'Khắc chế: chiếm phân khúc phổ thông, hoặc đầu tư R&D + ESG để đấu trực diện phân khúc sang.']].map(([n, s2, p, c]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${n} <span class="text-primary">· ${s2}</span></p>
      <p class="text-xs text-deep-teal/60 mt-1">${p}</p><p class="text-xs font-semibold text-emerald-700 mt-1">${c}</p></div>`).join('')}
    <p class="text-[11px] text-deep-teal/50 mt-2">📌 Giảng viên: hành vi AI là tất định (cùng seed đội → cùng kết quả), tiện chấm điểm & so sánh giữa các đội. Chi tiết trong tài liệu giảng viên trên GitHub.</p>` },
  roles: { icon: '👥', name: 'Vai trò & Đội ngũ', html: `
    <p class="text-sm text-deep-teal/75 mb-4">Sự phối hợp giữa 5 vị trí cốt lõi là chìa khóa thành công:</p>
    ${[['CEO', 'Quyết định', 'Định hướng chiến lược, duyệt ngân sách cuối cùng và chốt hạ quyết định.', '🤝 Làm việc chặt với CFO trước khi chốt số.'],
       ['CFO', 'Tài chính', 'Quản lý dòng tiền, phân bổ vốn, phân tích lỗ lãi và nguồn vốn vay.', '🔄 Cấp ngân sách cho CMO & COO.'],
       ['CMO', 'Thị trường', 'Quảng cáo, nghiên cứu đối thủ, định giá và giành thị phần.', '📈 Đẩy doanh số, báo cáo cho CEO.'],
       ['COO', 'Vận hành', 'Tối ưu sản xuất, quản lý tồn kho, bảo trì và nhân công.', '📦 Đồng bộ sản lượng với CMO.'],
       ['SEC', 'Thư ký', 'Ghi chép, nhắc thời hạn, quản trị thông tin và điều phối toàn đội.', '🔔 Điều phối toàn bộ team.']].map(([r, tag, d, i]) => `
    <div class="clay-card p-4 mb-3"><div class="flex items-center gap-2 mb-1"><p class="font-display font-extrabold text-primary">${r}</p><span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full risk-low">${tag}</span></div>
      <p class="text-xs text-deep-teal/70">${d}</p><p class="text-[11px] font-bold text-deep-teal/50 mt-1.5">${i}</p></div>`).join('')}` },
  rounds: { icon: '🎮', name: 'Cách chơi theo vòng', html: `
    <p class="text-sm text-deep-teal/75 mb-4">Mỗi vòng là một chu trình 6 bước:</p>
    ${[['Phân tích báo cáo', 'Đánh giá tài chính, thị phần từ vòng trước.', '💡 Chú ý dòng tiền và hàng tồn kho.'],
       ['Thảo luận đội', 'Thống nhất chiến lược dựa trên dữ liệu.', '💡 Phân công vai trò rõ ràng.'],
       ['Nhập quyết định', 'Giá bán, Marketing, Sản lượng, R&D, Nhân sự, Nguồn vốn.', '⚠️ Kiểm tra kỹ số liệu trước khi Commit.'],
       ['Theo dõi kết quả', 'Hệ thống mô phỏng và trả kết quả tức thì.', '💡 So sánh dự báo với thực tế.'],
       ['Đối phó biến cố', 'Price War, khủng hoảng năng lượng, chuỗi cung ứng…', '💡 Luôn giữ dự phòng tiền mặt.'],
       ['Tổng kết', 'Xem xếp hạng, rút kinh nghiệm cho vòng sau.', '💡 SEC ghi chép bài học vào Nhật ký đội.']].map(([t, d, tip], i) => `
    <div class="clay-card p-4 mb-3 flex gap-3.5 items-start"><span class="w-9 h-9 shrink-0 rounded-full font-display font-extrabold flex items-center justify-center text-white" style="background:#00c4ff; box-shadow:0 3px 0 #0095c2">${i + 1}</span>
      <div><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p><p class="text-[11px] font-semibold text-amber-700 mt-1">${tip}</p></div></div>`).join('')}` },
  lumina: { icon: '🤖', name: 'Cố vấn AI Lumina', html: `
    <div class="clay-card p-4 mb-4 flex gap-3 items-center"><img src="assets/character/lumina-vest.png" alt="" class="w-12 h-12 rounded-full object-cover" style="object-position:50% 14%"><p class="text-xs text-deep-teal/75">Hương là trợ lý AI cá nhân của đội — trò chuyện được bằng giọng nói tiếng Việt trong tab Lumina.</p></div>
    ${[['📊 Phân tích dữ liệu', 'Kịch bản tối ưu theo mục tiêu tài chính; mô phỏng "Nếu — Thì" trước khi Commit (2 lượt/vòng).'],
       ['🔮 Dự đoán thị trường', 'Cảnh báo rủi ro (đỏ/cam) hoặc cơ hội (xanh ngọc) theo từng vai trò CFO · COO · CMO · SEC.'],
       ['🛟 Phòng ngừa khủng hoảng', 'Kịch bản ứng phó khi thị trường biến động mạnh; lời khuyên khẩn cấp khi thanh khoản đỏ.']].map(([t, d]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div>`).join('')}` },
  tips: { icon: '💡', name: 'Mẹo & Thủ thuật', html: `
    ${[['👑 Chiến thuật CEO', 'Luôn tham khảo CFO trước khi chốt số. Một quyết định đầu tư lớn thiếu kiểm soát chi phí có thể dẫn đến phá sản.'],
       ['🏭 Tối ưu sản xuất', 'Đừng mở rộng quá nhanh — kiểm tra báo cáo khấu hao và bảo trì máy móc đúng lúc.'],
       ['📣 Chiếm lĩnh thị trường', 'Dùng Lumina AI dự báo xu hướng trước khi tung chiến dịch Marketing lớn.'],
       ['🛡️ Quản lý rủi ro', 'Giữ ít nhất 15% vốn dự phòng. Không bao giờ đầu tư hết tiền mặt vào một vòng.']].map(([t, d]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div>`).join('')}
    <p class="font-display font-extrabold text-deep-teal text-sm mt-5 mb-2">⚡ Quick Wins</p>
    ${['Dành 5 phút đầu vòng đọc bản tin Thị trường sống — nó chứa manh mối về đối thủ.',
       'Pin Mặt Trời hoàn vốn ~2 vòng và kháng khủng hoảng năng lượng vòng 4.',
       'Điều chỉnh giá linh hoạt theo độ nhạy của thị trường — đừng giữ nguyên giá cả 6 vòng.'].map(t => `
    <div class="clay-sunken rounded-2xl p-3 mb-2 flex gap-2 items-start"><span class="text-primary font-bold">✓</span><p class="text-xs text-deep-teal/75">${t}</p></div>`).join('')}` },
  trouble: { icon: '🔧', name: 'Xử lý sự cố', html: `
    ${[['📶 Kiểm tra mạng', 'BizOn chạy offline sau lần tải đầu (PWA) — nhưng lần đầu cần Wi-Fi hoặc 4G/5G ổn định.'],
       ['🔄 Làm mới ứng dụng', 'Đóng hoàn toàn và mở lại BizOn. Nếu đã cài lên màn hình chính, đóng hẳn app để nhận bản cập nhật mới.'],
       ['🧹 Xóa dữ liệu cũ', 'Nếu giao diện hiển thị lạ sau bản cập nhật: Cài đặt → Chơi lại từ đầu (Reset) — lưu ý sẽ mất tiến trình.'],
       ['🐞 Liên hệ hỗ trợ', 'Dùng nút "Gửi báo cáo lỗi" trong Cài đặt nếu vấn đề tiếp diễn.']].map(([t, d]) => `
    <div class="clay-card p-4 mb-3"><p class="font-bold text-sm text-deep-teal">${t}</p><p class="text-xs text-deep-teal/60 mt-0.5">${d}</p></div>`).join('')}` },
};
function showManual(sec) {
  const old = document.getElementById('manual-overlay');
  if (old) old.remove();
  const div = document.createElement('div');
  div.id = 'manual-overlay';
  div.className = 'fixed inset-0 z-[65] bg-surface-bright overflow-y-auto';
  const body = sec && MANUAL[sec]
    ? `<button onclick="showManual()" class="clay-btn bg-white text-deep-teal text-xs font-bold px-4 py-2 mb-4">← Sổ tay</button>
       <h2 class="font-display font-extrabold text-deep-teal text-2xl mb-4">${MANUAL[sec].icon} ${MANUAL[sec].name}</h2>${MANUAL[sec].html}`
    : `<div class="text-center mb-6">
         <h2 class="font-display font-extrabold text-primary text-2xl">📖 Sổ tay hướng dẫn</h2>
         <p class="text-sm text-deep-teal/60 mt-1">Mọi thứ bạn cần để vận hành BizOn mượt mà.</p>
       </div>
       <div class="grid grid-cols-2 gap-3">
         ${Object.entries(MANUAL).map(([k, m]) => `
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

// ---------- BizOn Premium — luồng nâng cấp tài khoản (thiết kế Stitch) ----------
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
      <p class="text-white/60 text-sm mt-2 max-w-xs">Dành cho giảng viên & trường học — mở khóa toàn bộ sức mạnh quản trị lớp học.</p>
      <div class="w-full max-w-sm text-left mt-7 space-y-2.5">
        ${['🏫 Lớp học không giới hạn số đội', '📊 Xuất báo cáo tổng kết & chứng chỉ PDF', '🎛️ Chế độ giảng viên nâng cao (khóa vòng, cấp vốn, biến cố tùy chỉnh)', '📈 Bảng phân tích hiệu suất từng thành viên', '🤝 Hỗ trợ ưu tiên & tùy biến thương hiệu trường'].map(f => `
        <div class="clay-card p-3.5 flex items-center gap-3 text-sm font-semibold text-deep-teal">${f}</div>`).join('')}
      </div>
      ${requested
        ? `<div class="clay-card p-4 mt-7 max-w-sm flex items-center gap-3"><p class="text-3xl">✅</p><p class="text-sm text-deep-teal font-semibold text-left">Yêu cầu đã gửi! Quản trị viên sẽ phê duyệt và cấp quyền cho tài khoản của bạn.</p></div>`
        : `<button id="prem-req" class="clay-btn font-display font-extrabold text-white text-sm px-12 py-4 mt-8" style="background:linear-gradient(90deg,#fda127,#e8762d)">👑 Gửi yêu cầu nâng cấp</button>`}
      <button id="prem-close" class="text-white/50 text-xs font-bold mt-5 underline">Đóng</button>
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
      <h2 class="font-display font-extrabold text-3xl text-white mt-8 leading-tight">Tuyệt vời! Yêu cầu<br><span style="color:#fda127">đã được gửi</span></h2>
      <p class="text-white/60 text-sm mt-3 max-w-xs">Quản trị viên sẽ phê duyệt và cấp quyền Premium cho bạn. Trong lúc chờ, hãy tiếp tục chinh phục TOP 1 thị phần nhé!</p>
      <button class="clay-btn font-display font-extrabold text-white text-sm px-12 py-4 mt-9" style="background:linear-gradient(90deg,#00a2d8,#fda127)" onclick="this.parentElement.remove()">Bắt đầu ngay</button>`;
    document.body.appendChild(ok);
  });
}

// ---------- Nhạc nền game (playlist: BizOn Theme → Bật Nghiệp) ----------
const BGM_TRACKS = ['assets/audio/bizon-theme.mp3', 'assets/audio/bat-nghiep.mp3'];
let bgm = null, bgmIdx = 0;
function musicEnabled() { return localStorage.getItem('bizon-music') !== 'off'; }
function startMusic() {
  if (!musicEnabled()) return;
  if (!bgm) {
    bgm = new Audio(BGM_TRACKS[0]); bgm.volume = 0.22;
    bgm.addEventListener('ended', () => {
      bgmIdx = (bgmIdx + 1) % BGM_TRACKS.length;
      bgm.src = BGM_TRACKS[bgmIdx];
      if (musicEnabled()) bgm.play().catch(() => {});
    });
  }
  bgm.play().catch(() => {});
}
function toggleMusic() {
  if (musicEnabled()) { localStorage.setItem('bizon-music', 'off'); if (bgm) bgm.pause(); }
  else { localStorage.setItem('bizon-music', 'on'); startMusic(); }
  const t = $('music-toggle'); if (t) t.checked = musicEnabled();
}
// Trở lại phiên cũ: trình duyệt chặn autoplay — bắt đầu nhạc ở lần chạm đầu tiên
document.addEventListener('pointerdown', function once() {
  document.removeEventListener('pointerdown', once);
  if (S) startMusic();
}, { once: true });

// ---------- Âm thanh kịch tính mở vòng (WebAudio, không cần tệp) ----------
function playEventSting(tone) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = tone === 'bad' ? [[110, 0], [104, .22], [98, .44], [82.4, .7]]      // dồn dập đi xuống — kịch tính
      : tone === 'warn' ? [[196, 0], [185, .2], [196, .4]]
      : [[261.6, 0], [329.6, .16], [392, .32], [523.3, .5]];                          // vui — arpeggio đi lên
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
  [3.53, 4.17, 'Tôi là Huong.'],
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
        <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-4 py-1.5 rounded-full ${tagCls}">● ${ev.tag || 'BIẾN CỐ THỊ TRƯỜNG'}</span>
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
        <img src="assets/character/${ev.luminaImg || 'lumina-vest'}.png" alt="Je m'appelle Hương AI Advisor" class="w-28 shrink-0 rounded-2xl object-cover animate-float drop-shadow-xl" style="aspect-ratio:3/4; object-position:50% 8%">
        <div class="relative clay-raised p-4 rounded-bl-none border-l-4 border-primary-container flex-1">
          <div class="speech-tail"></div>
          <p class="text-[10px] font-extrabold text-primary mb-1">JE M'APPELLE HƯƠNG · AI ADVISOR</p>
          <p class="text-sm text-deep-teal italic leading-relaxed">"${ev.luminaMsg}"</p>
        </div>
      </div>
      ${bad ? `
      <div class="clay-raised p-3 mt-3 flex items-center gap-3">
        <img src="assets/character/anh-tu-think.png" alt="Phan Anh Tú" class="w-11 h-11 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 8%">
        <p class="text-xs text-deep-teal/80 italic">"Bình tĩnh phân tích số liệu trước khi hành động — khủng hoảng luôn ẩn chứa cơ hội cho đội có kỷ luật." — <b class="text-emerald-700">Phan Anh Tú · Cố vấn học thuật</b></p>
      </div>` : ''}
      <button id="ev-cta" class="clay-button-primary w-full text-white font-display font-bold text-lg py-4 mt-6">${ev.cta ? ev.cta.label : '🎯 Nhập quyết định'}</button>
      <button id="ev-close" class="clay-button-secondary w-full text-primary font-display font-bold py-4 mt-3">Về Trung tâm điều hành</button>
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
      <div class="clay-raised p-3 mb-4 flex items-center gap-3 text-left">
        <img src="assets/character/anh-tu-cheer.png" alt="Phan Anh Tú" class="w-12 h-12 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 8%">
        <p class="text-xs text-deep-teal/80 italic">"Xuất sắc! Đây là minh chứng cho một chiến lược được thực thi kỷ luật." — <b class="text-emerald-700">Phan Anh Tú</b></p>
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
  renderMissions(); renderMinigame(); renderInstructor(); renderJournal(); renderMarket();
  renderConquest(); renderTeamCard(); renderOpponents();
  const mt = $('music-toggle'); if (mt) mt.checked = musicEnabled();
}

// ---------- BizOn Monitor (bảng theo dõi thị trường kiểu terminal) ----------
function mmSpark(series, w = 88, hgt = 26) {
  if (!series || series.length < 2) return '<span style="opacity:.35;font-size:9px">—</span>';
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
      <p style="font-size:11px;margin-top:8px;opacity:.7">Hoàn thành vòng 1 để kích hoạt bảng theo dõi thị trường.</p></div>`;
    return;
  }
  const metrics = [
    { name: 'Thị phần',      tag: 'THỊ PHẦN',   s: H.map(r => r.share),        fmt: v => v.toFixed(1) + '%' },
    { name: 'Doanh thu',     tag: 'DOANH THU',  s: H.map(r => r.revenue),      fmt: v => money(v) },
    { name: 'Lợi nhuận',     tag: 'LỢI NHUẬN',  s: H.map(r => r.netProfit),    fmt: v => money(v) },
    { name: 'Ví đội',        tag: 'DÒNG TIỀN',  s: H.map(r => r.balance),      fmt: v => money(v) },
    { name: 'OEE xưởng',     tag: 'VẬN HÀNH',   s: H.map(r => r.oee),          fmt: v => v + '%' },
    { name: 'Brand Loyalty', tag: 'THƯƠNG HIỆU', s: H.map(r => r.brandLoyalty), fmt: v => v + '%' },
  ];
  (S.aiHistory || []).length && COMPETITORS.forEach((c, i) => {
    metrics.push({ name: c.name, tag: 'ĐỐI THỦ AI', s: (S.aiHistory || []).map(snap => (snap[i] || {}).share || 0), fmt: v => v.toFixed(1) + '%' });
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
      <p style="font-size:9px;letter-spacing:.14em;color:#8fa89f">VÒNG ${H.length}/6</p>
    </div>
    <div style="display:flex;gap:8px;margin:12px 0 4px">
      ${chip('TĂNG', `${ups}/${rated.length || withPct.length}`, '#34d399')}
      ${chip('MẠNH NHẤT', best ? `${best.name} +${best.chg.toFixed(1)}%` : '—', '#34d399')}
      ${chip('YẾU NHẤT', worst ? `${worst.name} ${worst.chg.toFixed(1)}%` : '—', '#f87171')}
    </div>
    ${rows}
  </div>`;
}

// ---------- Thị trường sống (Live Market Pulse — theo 3 màn hình Stitch) ----------
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
    `🔵 Alpha Dynamics duy trì chiến lược giá rẻ — theo dõi biên lợi nhuận của họ`,
    `🟢 Brand Loyalty của đội bạn: ${S.brandLoyalty}% ${S.brandLoyalty >= 70 ? '(khách hàng gắn bó!)' : '(cần đầu tư thương hiệu)'}`,
    `🟡 Star Clay Co. đẩy mạnh phân khúc cao cấp — cơ hội ở phân khúc phổ thông`,
    S.loan > 0 ? `🏦 Đội đang có khoản vay ${S.loan}tr₫ — lãi trừ mỗi vòng` : `💰 Ví đội: ${money(S.balance)} — chưa dùng đòn bẩy`,
  ];
  $('market-ticker').innerHTML = '<span class="mx-6">' + ticker.join('</span><span class="mx-6">') + '</span>';

  // Thị phần: bạn vs 3 đối thủ
  const teams = [
    { name: 'BẠN', share, me: true },
    ...S.competitors.map(c => ({ name: c.name.split(' ')[0].toUpperCase(), share: c.share })),
  ];
  const maxShare = Math.max(...teams.map(t => t.share), 1);

  // Tiếng nói khách hàng (sinh từ trạng thái)
  const priceHigh = lastD.price > REF_PRICE * 1.15;
  const voices = [
    S.brandLoyalty >= 70
      ? { tag: 'KHÁCH TRUNG THÀNH', text: 'Yêu quyết định đầu tư chất lượng của BizOn! Rất hợp bản sắc thương hiệu.', s: 'positive' }
      : { tag: 'KHÁCH HÀNG MỚI', text: 'Sản phẩm ổn nhưng thương hiệu chưa đủ thuyết phục mình gắn bó lâu dài.', s: 'neutral' },
    priceHigh
      ? { tag: 'KHÁCH NHẠY GIÁ', text: `Giá ${lastD.price.toLocaleString('vi-VN')}k hơi chát so với túi tiền... đang ngó sang đối thủ. 📉`, s: 'negative' }
      : { tag: 'KHÁCH NHẠY GIÁ', text: 'Mức giá hiện tại khá hợp lý so với chất lượng nhận được!', s: 'positive' },
    ev.id === 'EV_PRICEWAR'
      ? { tag: 'GIỚI PHÂN TÍCH', text: 'Đối thủ vừa giảm giá sâu. Thị trường chờ phản ứng của BizOn trong 48 giờ tới.', s: 'alert' }
      : { tag: 'GIỚI PHÂN TÍCH', text: `R&D tích lũy ${Math.round(S.rdCumulative)}tr₫ — nền tảng đổi mới của BizOn đang được chú ý.`, s: 'neutral' },
  ];
  const sChip = { positive: '<span class="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">TÍCH CỰC</span>', neutral: '<span class="text-[9px] font-bold text-deep-teal/60 bg-surface-bright px-2 py-0.5 rounded-full">TRUNG LẬP</span>', negative: '<span class="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">TIÊU CỰC</span>', alert: '<span class="text-[9px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">⚠️ CẠNH TRANH</span>' };

  // Radar xu hướng: Chất lượng / Giá / Bền vững / Tốc độ (0..90 bán kính)
  const rQ = 30 + Math.min(60, S.brand * 40);
  const rP = 30 + Math.min(60, Math.max(0, (REF_PRICE * 1.3 - lastD.price) / REF_PRICE * 150));
  const rS = 30 + Math.min(60, S.rdCumulative / 8);
  const rSp = 30 + Math.min(60, (S.oee - 55) * 1.6);
  const radarPts = `100,${100 - rQ} ${100 + rP},100 100,${100 + rS} ${100 - rSp},100`;

  const loyaltyPct = S.brandLoyalty, adEffPct = Math.min(100, Math.round(S.adEff * 8));
  body.innerHTML = `
    <div class="clay-card p-4 mb-3 border-l-4 border-primary-container flex gap-3 items-start">
      <img src="assets/character/lumina-vest.png" alt="Cố vấn Hương" class="w-14 h-14 rounded-2xl object-cover shadow-clay shrink-0" style="object-position:50% 10%">
      <div>
        <p class="font-display font-bold text-deep-teal text-sm">Cố vấn Hương <span class="text-[9px] bg-primary-container text-white font-extrabold px-1.5 py-0.5 rounded ml-1">LIVE</span></p>
        <p class="text-xs text-deep-teal/80 italic mt-1">"${ev.tone === 'warn' && ev.id === 'EV_PRICEWAR'
          ? 'Nghe kỹ này: cú giảm giá của đối thủ là một cái bẫy — họ đang đốt vốn. Giữ vững vị thế và tập trung vào phân khúc Premium. Chất lượng sẽ bền hơn sự tuyệt vọng của họ.'
          : ev.tone === 'bad'
          ? 'Thị trường đang thở gấp. Ưu tiên phòng thủ dòng tiền, quan sát nhất cử nhất động của đối thủ trước khi phản công.'
          : 'Thị trường đang thở đều. Đây là lúc quan sát điểm yếu của đối thủ và chuẩn bị nước đi chiếm thị phần kế tiếp.'}"</p>
      </div>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-4">📊 Thị phần thời gian thực</h3>
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
        <h3 class="font-display font-bold text-deep-teal text-sm">💬 Tiếng nói khách hàng</h3>
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
      <h3 class="font-display font-bold text-deep-teal text-sm mb-2">🎯 Radar xu hướng</h3>
      <div class="flex items-center gap-3">
        <svg viewBox="0 0 200 200" class="w-36 h-36 shrink-0">
          <circle class="spider-grid" cx="100" cy="100" r="30"/><circle class="spider-grid" cx="100" cy="100" r="60"/><circle class="spider-grid" cx="100" cy="100" r="90"/>
          <line class="spider-grid" x1="100" y1="10" x2="100" y2="190"/><line class="spider-grid" x1="10" y1="100" x2="190" y2="100"/>
          <polygon points="${radarPts}" fill="rgba(0,196,255,.3)" stroke="#006687" stroke-width="2"/>
          <text x="100" y="8" text-anchor="middle" font-size="10" font-weight="700" fill="#006687">CHẤT LƯỢNG</text>
          <text x="196" y="104" text-anchor="end" font-size="10" font-weight="700" fill="#006687">GIÁ</text>
          <text x="100" y="199" text-anchor="middle" font-size="10" font-weight="700" fill="#006687">BỀN VỮNG</text>
          <text x="4" y="104" font-size="10" font-weight="700" fill="#006687">TỐC ĐỘ</text>
        </svg>
        <div class="flex-1 space-y-2">
          <div class="clay-sunken rounded-xl p-3 flex justify-between text-xs"><span class="text-deep-teal/70">Quan tâm sản phẩm xanh</span><b class="text-primary">+12.4%</b></div>
          <div class="clay-sunken rounded-xl p-3 flex justify-between text-xs"><span class="text-deep-teal/70">Độ nhạy cảm về giá</span><b class="${ev.elasticityMul ? 'text-red-600' : 'text-deep-teal'}">${ev.elasticityMul ? '+18.0%' : '+4.2%'}</b></div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="clay-card p-4">
        <div class="flex justify-between items-center mb-2"><p class="font-bold text-xs text-deep-teal">Brand Loyalty</p><span class="text-[10px] font-bold text-primary">${loyaltyPct}%</span></div>
        <div class="h-3 clay-sunken rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style="width:${loyaltyPct}%"></div></div>
        <p class="text-[9px] text-deep-teal/50 mt-1.5 font-bold">MỤC TIÊU: 85%</p>
      </div>
      <div class="clay-card p-4">
        <div class="flex justify-between items-center mb-2"><p class="font-bold text-xs text-deep-teal">Hiệu quả quảng cáo</p><span class="text-[10px] font-bold ${adEffPct >= 60 ? 'text-primary' : 'text-red-600'}">${adEffPct}%</span></div>
        <div class="h-3 clay-sunken rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-primary to-primary-container rounded-full" style="width:${adEffPct}%"></div></div>
        <p class="text-[9px] text-deep-teal/50 mt-1.5 font-bold">MỤC TIÊU: 60%</p>
      </div>
    </div>
    <div class="clay-card p-5">
      <h3 class="font-display font-bold text-deep-teal text-sm">Sẵn sàng can thiệp?</h3>
      <p class="text-xs text-deep-teal/60 mb-3">Điều chỉnh chiến lược dựa trên nhịp đập thị trường hiện tại.</p>
      <div class="grid grid-cols-2 gap-2">
        <button onclick="showTab('decisions')" class="clay-button-primary text-white text-xs font-extrabold py-3 tracking-wider" style="background:linear-gradient(135deg,#00c4ff,#006687)">🚀 DEPLOY CAMPAIGN</button>
        <button onclick="showTab('decisions')" class="clay-button-secondary text-primary text-xs font-extrabold py-3 tracking-wider">💲 REVISE PRICING</button>
      </div>
    </div>`;
}

// ---------- Nhật ký đội (Team Journal — SEC ghi chép) ----------
function journalLesson(r) {
  const parts = [];
  if (r.netProfit < 0) {
    const costs = [['giá vốn sản xuất', r.cogs], ['marketing', r.marketing], ['chi phí cố định', r.fixed], ['khấu hao', r.depreciation]];
    costs.sort((a, b) => b[1] - a[1]);
    parts.push(`Lỗ ${money(Math.abs(r.netProfit))} — khoản chi lớn nhất là ${costs[0][0]} (${money(costs[0][1])}). Cần cân đối lại cơ cấu chi phí.`);
  } else {
    parts.push(`Lãi ${money(r.netProfit)} với biên lợi nhuận ${Math.round(100 * r.netProfit / Math.max(1, r.revenue))}%.`);
  }
  if (r.lostSales > 200) parts.push(`Hụt ${r.lostSales.toLocaleString('vi-VN')} đơn vì thiếu hàng — cầu vượt cung, nên tăng sản lượng.`);
  if (r.inventory > 400) parts.push(`Tồn kho ${r.inventory.toLocaleString('vi-VN')} sp do dự báo sai nhu cầu — chi phí lưu kho tăng.`);
  if (r.oee && r.oee < 80) parts.push(`OEE giảm còn ${r.oee}% — cần bảo trì/nâng cấp dây chuyền.`);
  return parts.join(' ');
}

const JOURNAL_QUOTES = [
  { text: 'Mục tiêu không phải là đánh bại đối thủ, mà là làm cho họ trở nên không còn quan trọng.', by: 'Lumina AI', color: 'text-primary' },
  { text: 'Mọi báo cáo tài chính đều là một câu chuyện, hãy đảm bảo đội của bạn đang viết một chương thành công.', by: 'SEC', color: 'text-red-600' },
  { text: 'Dữ liệu cho ta biết quá khứ, quyết định hôm nay viết nên tương lai.', by: 'Phan Anh Tú', color: 'text-emerald-700' },
  { text: 'Khủng hoảng là bài kiểm tra tốt nhất cho năng lực quản trị dòng tiền.', by: 'Lumina AI', color: 'text-primary' },
  { text: 'Thị phần mua được bằng tiền, nhưng lòng trung thành phải xây bằng giá trị.', by: 'Phan Anh Tú', color: 'text-emerald-700' },
  { text: 'Đừng sợ commit sai — hãy sợ việc không rút ra được bài học nào.', by: 'SEC', color: 'text-red-600' },
];

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
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-deep-teal text-white">ĐANG DIỄN RA</span>
            <span class="text-[11px] font-bold text-deep-teal/50">V${S.round}/6</span>
          </div>
          <p class="font-display font-bold text-deep-teal">Vòng ${S.round}: ${ev.name.replace('Biến cố: ', '')}</p>
          <div class="clay-sunken rounded-2xl p-3 mt-2">
            <p class="text-[10px] font-bold text-deep-teal/50 uppercase">Trạng thái</p>
            <p class="text-sm font-bold text-primary">${S.committed ? 'Đã commit — chờ kết quả' : 'Đang thảo luận quyết định'}</p>
          </div>
        </div>
      </div>`);
  }
  [...S.history].reverse().forEach(r => {
    const q = JOURNAL_QUOTES[(r.round - 1) % JOURNAL_QUOTES.length];
    const priceDelta = Math.round(100 * (r.decisions.price - REF_PRICE) / REF_PRICE);
    entries.push(`
      <div class="relative">
        <span class="absolute -left-[22px] top-5 w-3.5 h-3.5 rounded-full ${r.netProfit >= 0 ? 'bg-primary-container' : 'bg-orange-400'} shadow-clay"></span>
        <div class="clay-raised p-4">
          <div class="flex justify-between items-start mb-1">
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full clay-sunken text-deep-teal/70">HOÀN THÀNH</span>
            <span class="text-[11px] font-bold text-deep-teal/50">V${r.round}/6</span>
          </div>
          <p class="font-display font-bold text-deep-teal">Vòng ${r.round}: ${r.event.name.replace('Biến cố: ', '')}</p>
          <div class="clay-sunken rounded-2xl p-3 mt-2">
            <p class="text-[10px] font-bold text-deep-teal/50 uppercase">Quyết định then chốt</p>
            <p class="text-sm font-bold text-primary">Giá bán: ${r.decisions.price.toLocaleString('vi-VN')}k₫ (${priceDelta >= 0 ? '+' : ''}${priceDelta}% so với ĐT) · R&D ${r.rd}tr₫</p>
          </div>
          <p class="text-[10px] font-bold text-deep-teal/50 uppercase mt-2.5">Kết quả & bài học</p>
          <p class="text-sm text-deep-teal/80">${journalLesson(r)}</p>
          <div class="border-t border-surface-bright mt-2.5 pt-2.5 flex gap-2 items-start">
            <span class="text-base">💬</span>
            <p class="text-xs text-deep-teal/70 italic">"${q.text}" — <b class="${q.color}">${q.by}</b></p>
          </div>
        </div>
      </div>`);
  });
  list.innerHTML = '<div class="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/15 rounded-full"></div>' +
    (entries.length ? entries.join('') : '<p class="text-sm text-deep-teal/50">Hành trình sẽ được ghi lại tại đây sau vòng đầu tiên.</p>');
}

function renderHeader() {
  $('hdr-team').textContent = S.profile.teamName;
  const eqR = MG_REWARDS.find(r => r.id === S.rewardEquipped);
  $('hdr-level').textContent = 'Lv.' + (1 + Math.floor((S.xp - S.spentXp < 0 ? 0 : S.xp) / XP_PER_LEVEL)) + (eqR ? ' ' + eqR.icon : '');
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
  $('v-prod').textContent = (+$('in-prod').value).toLocaleString('vi-VN') + ' sp';
  $('v-rd').textContent = $('in-rd').value + 'tr₫';
  $('v-workers').textContent = $('in-workers').value + ' người';
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
  $('fc-be').textContent = `Sản lượng hòa vốn: ${fc.breakEven.toLocaleString('vi-VN')} sp · Bán dự kiến: ${fc.estSold.toLocaleString('vi-VN')} sp` +
    (capped ? ` · ⚠️ Nhân sự chỉ đủ sản xuất ${fc.laborCap.toLocaleString('vi-VN')} sp` : '');
}

function renderDecisions() {
  document.querySelectorAll('.dec-round').forEach(e => e.textContent = Math.min(S.round, ROUNDS_TOTAL));
  syncDecisionLabels();
  const wq = $('whatif-quota');
  if (wq) wq.textContent = Math.max(0, WHAT_IF_LIMIT - (S.whatIfUsed || 0));
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
  const d = currentDecisionInput();
  const cashNeeded = d.marketing + d.rd + d.production * UNIT_COST / 1000 + d.workers * WAGE_PER_WORKER + d.workers * d.training;
  if (d.funding !== 'loan' && cashNeeded > S.balance + 300) {
    alert('ERR_INSUFFICIENT_FUNDS — Kế hoạch chi vượt quá vốn tự có của đội. Hãy giảm ngân sách hoặc chuyển sang nguồn vốn "Vay ngân hàng" (lãi 8.5%/vòng).');
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
    hideLoading();
    $('processing-box').classList.add('hidden');
    $('commit-box').classList.remove('hidden');
    if (report.netProfit > 0) createConfetti();
    // Kịch bản Stitch: chúc mừng KPI xuất sắc + cảnh báo rủi ro theo vai trò
    const notes = kpiCongrats(S, report).concat(riskAlerts(S, report));
    notes.forEach(m => pushLumina({ risk: m.risk, text: `【${m.role}】 ${m.text}` }));
    if (notes.some(m => m.risk === 'low')) createConfetti();
    showRoundResult(report);
    // Thăng cấp → màn chúc mừng toàn trang (sau khi bảng kết quả hiện)
    const lvlAfter = 1 + Math.floor(S.xp / XP_PER_LEVEL);
    if (lvlAfter > lvlBefore) setTimeout(() => showLevelUp(lvlAfter), 900);
  }, 2300);
}

function showRoundResult(r) {
  const ok = r.netProfit > 0;
  const cq = (S.conquest || [])[r.round - 1];
  const cqStop = CONQUEST_STOPS[r.round - 1];
  const cqLine = cq && cqStop ? (cq.win
    ? `<p class="mt-1 text-xs font-bold text-emerald-600">🚩 Đội bạn cắm cờ tại ${cqStop.name}!</p>`
    : `<p class="mt-1 text-xs font-bold text-orange-600">🏴 ${cq.winner} chiếm ${cqStop.name} vòng này</p>`) : '';
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
      ${cqLine}
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


// ---------- Bản đồ chinh phục Việt Nam (theo tỉnh thành mới sau sáp nhập) ----------
const VN_OUTLINE = '108.9,25.2 148.2,39.0 145.3,52.5 158.2,69.0 186.7,80.1 166.7,96.0 158.2,99.0 148.2,102.0 138.2,120.0 126.8,129.0 120.3,156.0 125.4,177.0 142.5,189.0 159.6,210.0 174.4,231.0 192.4,243.0 202.9,258.0 210.9,273.0 216.6,291.0 222.3,312.0 223.7,336.0 220.9,357.0 218.0,378.0 198.1,396.0 183.8,405.0 159.6,415.5 152.5,417.0 146.8,429.0 141.1,441.0 119.7,456.0 95.5,468.0 94.6,454.5 93.5,439.5 101.2,427.5 96.3,415.5 84.1,413.4 101.2,399.0 124.0,397.5 124.8,378.0 140.2,374.4 145.3,363.0 172.4,348.0 169.6,321.0 169.6,294.0 172.4,284.4 173.8,270.0 169.6,249.0 153.9,240.0 134.0,219.0 116.8,198.0 104.0,174.0 72.7,147.0 85.5,137.4 88.3,121.5 81.2,113.4 44.2,99.0 39.9,86.4 18.2,83.4 18.5,54.0 31.3,43.5 52.7,50.4 61.3,42.0 81.2,43.2 95.8,38.4 105.5,32.4 108.9,25.2';
const CONQUEST_STOPS = [
  { name: 'Cần Thơ',          x: 108, y: 449 },
  { name: 'TP. Hồ Chí Minh',  x: 150, y: 406 },
  { name: 'Khánh Hòa',        x: 208, y: 302 },
  { name: 'Đà Nẵng',          x: 166, y: 220 },
  { name: 'Thanh Hóa',        x: 122, y: 140 },
  { name: 'Hà Nội',           x: 110, y: 92 },
];

function recordConquest(report) {
  const best = S.competitors.reduce((acc, c) => ((c.share || 0) > (acc.share || 0) ? c : acc), { share: 0, name: 'AI' });
  const win = report.share >= (best.share || 0);
  (S.conquest ??= []).push({ round: report.round, win, winner: win ? S.profile.teamName : best.name });
  (S.aiHistory ??= []).push(S.competitors.map(c => ({ name: c.name, share: Math.round((c.share || 0) * 10) / 10 })));
  return win;
}

function renderConquest() {
  const box = $('conquest-map');
  if (!box) return;
  const cq = S.conquest || [];
  const wins = cq.filter(c => c.win).length;
  const cnt = $('cq-count');
  if (cnt) cnt.textContent = `🚩 ${wins}/${ROUNDS_TOTAL}`;

  const journey = CONQUEST_STOPS.map((st, i) => `${i ? 'L' : 'M'}${st.x},${st.y}`).join(' ');
  const marks = CONQUEST_STOPS.map((st, i) => {
    const c = cq[i];
    const cur = !S.finished && i === Math.min(S.round, ROUNDS_TOTAL) - 1;
    let m = `<circle cx="${st.x}" cy="${st.y}" r="6" fill="${c ? (c.win ? '#e8762d' : '#93a8ae') : 'rgba(0,102,135,.12)'}" stroke="#006687" stroke-width="2.5"${cur ? ' class="cq-pulse"' : ''}/>`;
    if (c) m += `<text x="${st.x + 3}" y="${st.y - 9}" font-size="26">${c.win ? '🚩' : '🏴'}</text>`;
    return m;
  }).join('');
  box.innerHTML = `<svg viewBox="0 0 245 500" class="w-full h-auto" aria-label="Bản đồ chinh phục Việt Nam">
    <g transform="scale(.85) translate(4,10)">
      <polygon points="${VN_OUTLINE}" fill="rgba(0,102,135,.07)" stroke="#006687" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="${journey}" fill="none" stroke="#e8762d" stroke-width="2" stroke-dasharray="5 6" stroke-linecap="round" opacity=".55"/>
      ${marks}
    </g>
  </svg>`;

  const list = $('conquest-list');
  if (list) list.innerHTML = CONQUEST_STOPS.map((st, i) => {
    const c = cq[i];
    const status = c
      ? (c.win ? `<b class="text-emerald-600">🚩 ${c.winner}</b>` : `<b class="text-deep-teal/45">🏴 ${c.winner}</b>`)
      : (!S.finished && i === cq.length ? '<b class="text-primary">⚔️ đang tranh</b>' : '<span class="text-deep-teal/35">⏳</span>');
    return `<p class="flex justify-between items-baseline gap-2"><span class="font-bold text-deep-teal/70 truncate">V${i + 1} · ${st.name}</span><span class="shrink-0">${status}</span></p>`;
  }).join('');
}

// ---------- Giới thiệu game (Intro — hành trình chinh phục) ----------
const INTRO_SLIDES = [
  { icon: '🇻🇳', title: 'Việt Nam 2026', img: 'assets/illustrations/hero-vietnam-2026.png',
    text: 'Nền kinh tế đang vươn mình "Hóa Rồng". Đội của bạn điều hành một công ty đồ chơi đất sét — khởi nghiệp từ Miền Tây, khát vọng vươn ra cả nước.' },
  { icon: '🗺️', title: '6 vòng · 6 tỉnh thành', 
    text: 'Mỗi vòng là một quý kinh doanh tại một tỉnh/thành trên bản đồ mới: Cần Thơ → TP. Hồ Chí Minh → Khánh Hòa → Đà Nẵng → Thanh Hóa → Hà Nội. Đội thắng vòng nào sẽ cắm cờ 🚩 công ty lên tỉnh đó!' },
  { icon: '👥', title: 'Đội hình C-Suite', 
    text: 'CEO chèo lái chiến lược, CFO giữ két sắt, CMO đánh chiếm thị trường, COO vận hành xưởng, SEC ghi biên bản — bên cạnh cố vấn Lumina AI và thầy Phan Anh Tú.' },
  { icon: '🏆', title: 'Mục tiêu của bạn', 
    text: 'Cắm nhiều cờ nhất, đạt TOP 1 thị phần Việt Nam và nhận chứng nhận hoàn thành. Sẵn sàng Bật Nghiệp? 🚀' },
];

function showIntro() {
  let idx = 0;
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
            <button id="intro-skip" class="clay-btn flex-1 bg-surface-bright text-deep-teal/60 font-bold py-3 text-sm">${idx ? '← Trước' : 'Bỏ qua'}</button>
            <button id="intro-next" class="clay-btn flex-1 bg-primary text-white font-display font-bold py-3 text-sm">${last ? 'Bắt đầu 🚀' : 'Tiếp theo →'}</button>
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
function renderAdvisorIntro() {
  const quota = AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0) - S.aiUsed;
  $('ai-quota').textContent = Math.max(0, quota);
  if (!$('advisor-chat').childElementCount) {
    pushLumina({ risk: 'low', log: false, text: `Xin chào, Je m'appelle Hương! 👋 Tôi là Lumina — cố vấn AI của đội ${S.profile.teamName}. Hãy chọn một câu hỏi bên dưới, tôi sẽ phân tích kịch bản "Nếu — Thì" cho bạn.` });
  }
  // Badge biến động thị trường + ảnh cảm xúc theo biến cố hiện tại
  const ev = currentEvent(S);
  const vol = S.finished ? 'low' : ev.tone === 'bad' ? 'high' : ev.tone === 'warn' ? 'medium' : 'low';
  $('vol-dot').className = 'w-3 h-3 rounded-full ' + { low: 'bg-emerald-500', medium: 'bg-amber-500', high: 'bg-red-600' }[vol];
  $('vol-text').textContent = 'MARKET VOLATILITY: ' + vol.toUpperCase();
  $('advisor-hero').src = 'assets/character/' + (S.finished ? 'lumina-ao-dai-clap' : (ev.luminaImg || 'lumina-vest')) + '.png';
  renderRoleDeepdive();
  renderAdvisorHistory();
}

function renderAdvisorHistory() {
  const riskIco = { low: '🟢', medium: '🟡', high: '🔴' };
  $('advisor-history').innerHTML = (S.advisorHistory || []).length
    ? S.advisorHistory.slice(-8).reverse().map(h =>
        `<p class="text-deep-teal/80"><b class="text-primary">V${h.round}</b> ${riskIco[h.risk] || '🟢'} ${h.text}${h.text.length >= 160 ? '…' : ''}</p>`).join('')
    : '<p class="text-deep-teal/40">Chưa có ghi chép nào — mọi lời tư vấn của Lumina sẽ được SEC lưu tại đây.</p>';
}

// ---------- What-If Analysis (mô phỏng Nếu–Thì trước Commit) ----------
function runWhatIf(role) {
  if (S.finished || S.committed) {
    alert('Vòng này đã khóa — mô phỏng Nếu–Thì sẽ mở lại ở vòng sau.');
    return;
  }
  if (S.whatIfUsed >= WHAT_IF_LIMIT) {
    $('whatif-result').innerHTML = '<div class="clay-sunken rounded-2xl p-3 text-xs text-deep-teal/70 font-semibold">ERR_AI_LIMIT_REACHED — Đã hết 2 lượt mô phỏng Nếu–Thì của vòng này. Lượt sẽ làm mới sau khi Commit.</div>';
    return;
  }
  const d = currentDecisionInput();
  if (role === 'CFO') { d.loanAmount = S.loan > 0 ? 0 : 300; d.costCutPct = 15; }
  S.whatIfUsed++;
  save();
  const r = whatIfSimulate(S, role, d);
  const statusMap = {
    SAFE: ['risk-low', '✅ AN TOÀN'], SAFE_AND_EFFICIENT: ['risk-low', '✅ AN TOÀN & HIỆU QUẢ'],
    VIABLE_BUT_RISKY: ['risk-medium', '🟡 KHẢ THI NHƯNG RỦI RO'], CAPITAL_EROSION: ['risk-medium', '🟡 CẢNH BÁO MÒN VỐN'],
    HIGH_RISK: ['risk-high', '🔴 RỦI RO CAO'], INSOLVENCY_RISK: ['risk-high', '🔴 NGUY CƠ MẤT THANH KHOẢN'],
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
        <img src="assets/character/lumina-vest.png" alt="Lumina" class="w-8 h-8 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
        <p class="text-xs text-deep-teal/80 italic">"${r.msg}"</p>
      </div>
      <p class="text-[10px] text-deep-teal/40 mt-2 text-right">Còn ${Math.max(0, WHAT_IF_LIMIT - S.whatIfUsed)} lượt mô phỏng trong vòng này</p>
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
          <img src="assets/character/${img}.png" alt="Hương" class="w-8 h-8 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
          <p class="text-[11px] text-deep-teal/80 italic">"${b.dialogue}"</p>
        </div>
        ${b.actions ? `<div class="mt-2 space-y-1">${b.actions.map(a => `<p class="text-[10px] font-bold text-deep-teal/70">👉 ${a}</p>`).join('')}</div>` : ''}
      </div>`;
  const loyaltyTrend = S.history.slice(-6).map(r =>
    `<div class="clay-bar-v" style="height:${Math.max(8, r.brandLoyalty)}%; width:10px" title="V${r.round}: ${r.brandLoyalty}%"><div class="w-full h-full rounded-full ${r.brandLoyalty < 60 ? 'bg-red-400' : 'bg-primary'}"></div></div>`).join('');
  $('role-deepdive').innerHTML = `
    <div class="clay-card p-4 ${cfoCrisis ? 'border-l-4 border-red-500' : qrBad ? 'border-l-4 border-red-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">💰 Cố vấn rủi ro & ROI <span class="text-[10px] text-deep-teal/50">· dành cho CFO</span></p>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Khả năng thanh toán nhanh</p>
          <p class="font-display font-extrabold ${qrBad ? 'text-red-600' : 'text-deep-teal'} text-xl">${S.quickRatio.toFixed(2)} ${qrBad ? '⚠️' : ''}</p>${bar(S.quickRatio * 50, qrBad)}</div>
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">ROI thực tế</p>
          <p class="font-display font-extrabold ${roiBad ? 'text-deep-teal' : 'text-emerald-600'} text-xl">${S.roi}%</p>
          <p class="text-[10px] text-deep-teal/50">Mục tiêu: <b>18%</b></p>${bar(S.roi * 100 / 18, roiBad)}</div>
      </div>
      <div class="flex justify-between items-center mb-3 clay-sunken rounded-2xl px-3 py-2">
        <p class="text-[10px] uppercase font-bold text-deep-teal/50">Vòng quay tồn kho</p>
        <p class="font-display font-extrabold ${cfo.invDays > 45 ? 'text-red-600' : 'text-deep-teal'} text-sm">${cfo.invDays} ngày <span class="text-[9px] text-deep-teal/40 font-bold">· ngưỡng an toàn ≤ 45</span></p>
      </div>
      ${brain(cfo, 'lumina-vest' + (cfoCrisis ? '-worried' : ''))}
      <div class="grid grid-cols-2 gap-2">
        <button onclick="doApproveLoan()" class="clay-btn ${S.loan > 0 ? 'bg-surface-bright text-deep-teal/40' : cfoCrisis ? 'bg-red-500 text-white' : 'bg-primary text-white'} text-xs font-bold py-2.5" ${S.loan > 0 ? 'disabled' : ''}>🏦 ${S.loan > 0 ? 'Đang vay 300tr₫' : cfoCrisis ? 'Vay vốn KHẨN CẤP' : 'Phê duyệt khoản vay'}</button>
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
      ${brain(coo, coo.status === 'RED' ? 'lumina-ao-dai-alert' : 'lumina-ao-dai')}
      <div class="grid grid-cols-2 gap-2">
        <button onclick="showReportFromAdvisor()" class="clay-btn bg-deep-teal text-white text-xs font-bold py-2.5">⬆️ Nâng cấp Dây chuyền</button>
        <button onclick="doMaintainFromAdvisor()" class="clay-btn bg-white text-deep-teal text-xs font-bold py-2.5">🔧 Bảo trì ngay</button>
      </div>
    </div>
    <div class="clay-card p-4 ${sec.status === 'RED' ? 'border-l-4 border-red-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">📔 Điều phối & Tuân thủ <span class="text-[10px] text-deep-teal/50">· dành cho SEC</span></p>
      ${brain(sec, sec.status === 'RED' ? 'lumina-ao-dai-alert' : 'lumina-vest')}
      <div class="grid grid-cols-2 gap-2">
        <button onclick="showTab('journal')" class="clay-btn bg-primary text-white text-xs font-bold py-2.5">📔 Mở Nhật ký đội</button>
        <button onclick="showTab('decisions')" class="clay-btn bg-white text-deep-teal text-xs font-bold py-2.5">🗳️ Bảng quyết định</button>
      </div>
    </div>
    <div class="clay-card p-4 ${cmo.status === 'RED' ? 'border-l-4 border-red-400' : ''}">
      <p class="font-display font-bold text-deep-teal text-sm mb-2">📣 Chiến lược Marketing <span class="text-[10px] text-deep-teal/50">· dành cho CMO</span></p>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Thị phần (Market Share)</p>
          <p class="font-display font-extrabold text-deep-teal text-xl">${shareNow.toFixed(1)}%</p>${bar(shareNow * 2, false)}</div>
        <div><p class="text-[10px] uppercase font-bold text-deep-teal/50">Brand Loyalty</p>
          <p class="font-display font-extrabold ${S.brandLoyalty < 60 ? 'text-red-600' : 'text-primary'} text-xl">${S.brandLoyalty}%</p>
          ${loyaltyTrend ? `<div class="flex items-end gap-1 h-7 mt-1">${loyaltyTrend}</div>` : `<p class="text-[10px] text-deep-teal/50">Social Sentiment: <b class="text-emerald-600">Positive</b></p>${bar(S.brandLoyalty, false)}`}</div>
      </div>
      ${currentEvent(S).id === 'EV_PRICEWAR' && !S.finished ? `
        <div class="bg-surface-bright rounded-2xl p-3 mb-2">
          <p class="text-xs font-bold text-red-600 mb-1">📰 TIN NÓNG · Price War</p>
          <p class="text-[11px] text-deep-teal/70">Đối thủ giảm giá 15% tại kênh Modern Trade. Đừng đua giảm giá — chọn 1 trong 2 chiến thuật:</p>
          <div class="flex gap-2 mt-2"><span class="text-[10px] font-bold bg-white rounded-full px-2.5 py-1 shadow-clay">CHIẾN THUẬT BUNDLING</span><span class="text-[10px] font-bold bg-white rounded-full px-2.5 py-1 shadow-clay">TĂNG VALUE-ADDED</span></div>
        </div>` : ''}
      ${brain(cmo, cmo.status === 'RED' ? 'lumina-ao-dai-alert' : 'lumina-ao-dai')}
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
  // Ghi vào Bộ nhớ doanh nghiệp (ai_advisor_history) — trừ lời chào mở đầu
  if (S && advice.log !== false && S.history) {
    S.advisorHistory ??= [];
    S.advisorHistory.push({ round: Math.min(S.round, ROUNDS_TOTAL), risk: advice.risk, text: advice.text.slice(0, 160) });
    if (S.advisorHistory.length > 20) S.advisorHistory.shift();
    save();
  }
  const riskLabel = { low: '🟢 Cơ hội', medium: '🟡 Thận trọng', high: '🔴 Rủi ro cao' }[advice.risk];
  const el = document.createElement('div');
  el.className = 'flex gap-3 items-start max-w-[92%]';
  el.innerHTML = `
    <img src="assets/character/lumina-vest.png" alt="Lumina" class="w-9 h-9 shrink-0 rounded-full object-cover shadow-clay" style="object-position:50% 12%">
    <div class="clay-bubble-in p-4 flex-1">
      <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 risk-${advice.risk}">${riskLabel}</span>
      <p class="text-sm text-deep-teal">${advice.text}</p>
    </div>`;
  $('advisor-chat').appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  speakLumina(advice.text);
}

function pushUserMsg(text) {
  const el = document.createElement('div');
  el.className = 'flex justify-end';
  el.innerHTML = `<div class="clay-bubble-out p-4 max-w-[85%]"><p class="text-sm">${text.replace(/</g, '&lt;')}</p></div>`;
  $('advisor-chat').appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ---------- Giọng nói (TTS/STT — theo màn hình Chat cố vấn AI giọng nói) ----------
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
  const clean = text.replace(/ERR_[A-Z_]+ — /g, '').replace(/[📣💲⚠️🎉🔧🟢🟡🔴👋]/g, '');
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
  $('voice-toggle').textContent = voiceEnabled ? '🔊 Bật' : '🔇 Tắt';
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
  if (!SR) { alert('Trình duyệt này chưa hỗ trợ nhận giọng nói — hãy dùng Chrome trên Android hoặc máy tính.'); return; }
  if (recognizing) { recognition.stop(); return; }
  recognition = new SR();
  recognition.lang = 'vi-VN';
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
  if (/xin chào|chào|hello|hi |^hi$/.test(t)) return { risk: 'low', free: true, text: `Chào bạn! Tôi là Hương — cố vấn AI của đội ${S.profile.teamName}. Bạn có thể hỏi tôi về giá bán, marketing, rủi ro, vốn vay hay vận hành nhé!` };
  if (/giá|price/.test(t)) return luminaAdvice(S, 'pricing');
  if (/marketing|quảng cáo|truyền thông/.test(t)) return luminaAdvice(S, 'marketing');
  if (/vay|vốn|thanh khoản|tiền mặt|dòng tiền/.test(t)) return { risk: S.quickRatio < 1 ? 'high' : 'low', text: `Tình hình tài chính: ví còn ${money(S.balance)}, khả năng thanh toán nhanh ${S.quickRatio.toFixed(2)}${S.quickRatio < 1.1 ? ' — dưới ngưỡng an toàn 1.1, nên cân nhắc khoản vay đệm' : ' — an toàn'}. ROI hiện tại ${S.roi}%.` };
  if (/oee|máy|bảo trì|dây chuyền|vận hành|sản xuất/.test(t)) return { risk: S.oee < 80 ? 'medium' : 'low', text: `Vận hành: OEE ${S.oee}% (mục tiêu 85%), phế phẩm ${S.defect}%. ${S.oee < 85 ? 'Tôi khuyên COO nên bảo trì ngay hoặc nâng cấp dây chuyền tiêu thụ điện cao nhất trong báo cáo ⚡ Năng lượng.' : 'Nhà máy đang vận hành ổn định!'}` };
  if (/thị phần|đối thủ|cạnh tranh/.test(t)) {
    const last = S.history[S.history.length - 1];
    return { risk: 'low', text: `Thị phần hiện tại ${(last ? last.share : 25).toFixed(1)}%, Brand Loyalty ${S.brandLoyalty}%. Ba đối thủ: Alpha Dynamics (giá rẻ), Mekong Ventures (cân bằng), Star Clay Co. (cao cấp). Muốn phân tích sâu hơn hãy xem thẻ CMO bên dưới nhé!` };
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
      pushLumina({ risk: 'medium', log: false, text: 'ERR_AI_LIMIT_REACHED — Bạn đã dùng hết lượt tư vấn của vòng này. Lượt sẽ làm mới sau khi Commit quyết định nhé!' });
      return;
    }
    S.aiUsed++; S.aiAskedTotal++; save(); renderAdvisorIntro();
  }
  setTimeout(() => pushLumina(reply), 350);
}

function askLumina(topic) {
  const quota = AI_QUOTA_PER_ROUND + (hasSkill(S, 'SK_AI1') ? 2 : 0);
  if (S.aiUsed >= quota) {
    pushLumina({ risk: 'medium', text: 'ERR_AI_LIMIT_REACHED — Lumina đang bận! Bạn đã dùng hết lượt tư vấn của vòng này. Lượt hỏi sẽ được làm mới sau khi commit quyết định.' });
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

// ---------- Phân tích Dòng tiền chi tiết (3 hoạt động) ----------
function renderCashReport(body) {
  if (!S.history.length) {
    body.innerHTML = '<div class="clay-card p-8 text-center text-sm text-deep-teal/50">Chưa có dữ liệu — hãy hoàn thành vòng đầu tiên!</div>';
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
      <p class="text-[11px] font-bold text-deep-teal/50 uppercase tracking-wider">Tổng dòng tiền thuần — Vòng ${last.r.round}</p>
      <p class="font-display font-extrabold ${last.net >= 0 ? 'text-primary' : 'text-red-600'} text-3xl">${last.net >= 0 ? '+' : '−'} ${money(Math.abs(last.net))}</p>
      <div class="grid grid-cols-2 gap-3 mt-3">
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Tổng thu (Inflow)</p><p class="font-bold text-emerald-600">+ ${money(totalIn)}</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Tổng chi (Outflow)</p><p class="font-bold text-red-600">− ${money(totalOut)}</p></div>
      </div>
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-2">Theo hoạt động — Vòng ${last.r.round}</h3>
      ${[['🏢 Hoạt động Kinh doanh', last.operating], ['🏗️ Hoạt động Đầu tư (khấu hao)', last.investing], ['🏦 Hoạt động Tài chính (lãi vay)', last.financing]].map(([lbl, v]) => `
        <div class="flex justify-between text-sm py-2 border-b border-surface-bright last:border-0">
          <span class="text-deep-teal/80">${lbl}</span>
          <span class="font-bold ${v >= 0 ? 'text-emerald-600' : 'text-red-600'}">${v >= 0 ? '+' : '−'} ${money(Math.abs(v))}</span>
        </div>`).join('')}
    </div>
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">Số dư ví theo vòng</h3>
      <div class="flex items-end gap-2 h-32">
        ${S.history.map(r => `<div class="flex-1 flex flex-col items-center justify-end h-full">
          <div class="w-full rounded-t-xl bg-gradient-to-t from-primary to-primary-container" style="height:${Math.max(8, Math.min(100, r.balance / 10))}%"></div>
          <p class="text-[10px] font-bold text-deep-teal/60 mt-1">V${r.round}</p>
        </div>`).join('')}
      </div>
    </div>
    <div class="clay-card p-4 bg-primary-container/10 flex gap-3 items-start">
      <img src="assets/character/lumina-vest.png" alt="Mentor Hương" class="w-10 h-10 rounded-full object-cover shadow-clay shrink-0" style="object-position:50% 12%">
      <div><p class="font-display font-bold text-primary text-sm">Mentor Hương</p>
      <p class="text-xs text-deep-teal/80 italic mt-0.5">"${last.net >= 0
        ? 'Dòng tiền thuần dương — nền tảng tốt! Hãy cân nhắc tái đầu tư vào R&D hoặc nâng cấp dây chuyền để lãi kép ở các vòng sau.'
        : 'Dòng tiền thuần đang âm. Ưu tiên số 1: giảm chi phí biến đổi lớn nhất và cân nhắc kỳ hạn thanh toán ngắn hơn để thu tiền về nhanh.'}"</p></div>
    </div>`;
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
  const fixedCosts = last ? [['Chi phí cố định', last.fixed], ['Khấu hao', last.depreciation], ['Lương nhân sự', last.wageCost || 0], ['Đào tạo', last.trainingCost || 0]] : [];
  const varCosts = last ? [['Giá vốn (COGS)', last.cogs], ['Marketing', last.marketing], ['R&D', last.rd], ['Lưu kho + lãi vay', (last.holding || 0) + (last.loanInterest || 0) + (last.creditInterest || 0)]] : [];
  const totalF = fixedCosts.reduce((a, x) => a + x[1], 0), totalV = varCosts.reduce((a, x) => a + x[1], 0);
  const costBar = (label, val, total, color) => `
    <div class="flex items-center gap-2 text-xs py-1">
      <span class="w-32 shrink-0 text-deep-teal/70">${label}</span>
      <div class="flex-1 h-2.5 rounded-full bg-surface-bright overflow-hidden"><div class="h-full ${color} rounded-full" style="width:${Math.round(100 * val / Math.max(1, total))}%"></div></div>
      <span class="w-16 text-right font-bold text-deep-teal">${Math.round(val)}tr</span>
    </div>`;
  body.innerHTML = `
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">📐 Phân tích Điểm hòa vốn (CVP)</h3>
      <div class="grid grid-cols-2 gap-3">
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Sản lượng hòa vốn</p><p class="font-display font-extrabold text-primary text-lg">${fc.breakEven.toLocaleString('vi-VN')} sp</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Giá hòa vốn</p><p class="font-display font-extrabold text-primary text-lg">${bePrice ? bePrice.toLocaleString('vi-VN') + 'k₫' : '—'}</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Lãi góp / đơn vị</p><p class="font-display font-extrabold text-deep-teal text-lg">${Math.round(contribution * 1000)}k₫</p></div>
        <div class="clay-sunken rounded-2xl p-3"><p class="text-[10px] uppercase font-bold text-deep-teal/50">Bán dự kiến vòng này</p><p class="font-display font-extrabold ${fc.estSold >= fc.breakEven ? 'text-emerald-600' : 'text-red-600'} text-lg">${fc.estSold.toLocaleString('vi-VN')} sp</p></div>
      </div>
    </div>
    ${last ? `
    <div class="clay-card p-5 mb-3">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">🧾 Cấu trúc chi phí — Vòng ${last.round}</h3>
      <p class="text-[11px] font-bold text-deep-teal/60 uppercase mb-1">Chi phí cố định (${Math.round(totalF)}tr₫)</p>
      ${fixedCosts.map(x => costBar(x[0], x[1], totalF + totalV, 'bg-primary')).join('')}
      <p class="text-[11px] font-bold text-deep-teal/60 uppercase mb-1 mt-3">Chi phí biến đổi (${Math.round(totalV)}tr₫)</p>
      ${varCosts.map(x => costBar(x[0], x[1], totalF + totalV, 'bg-primary-container')).join('')}
    </div>
    <div class="clay-card p-5">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">💹 Lợi nhuận gộp theo vòng</h3>
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
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">📈 Tỷ suất sinh lời — Vòng ${last.round}</h3>
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
        <p class="text-[11px] font-bold text-deep-teal/60 uppercase mb-1">Biểu đồ lợi nhuận (Gộp → Hoạt động → Ròng)</p>
        <div class="flex items-end gap-6 h-28 mb-1 px-2">${wf(gross, 'bg-slate-300')}${wf(operating, 'bg-primary-container')}${wf(net, net >= 0 ? 'bg-primary' : 'bg-red-400')}</div>
        <div class="flex gap-6 px-2 mb-4 text-center">
          <p class="flex-1 text-[10px] font-bold text-deep-teal/60">Gộp<br>${money(gross)}</p>
          <p class="flex-1 text-[10px] font-bold text-deep-teal/60">HĐ<br>${money(operating)}</p>
          <p class="flex-1 text-[10px] font-bold ${net >= 0 ? 'text-primary' : 'text-red-600'}">Ròng<br>${money(net)}</p>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          ${card('ROS', ros, 'Lợi nhuận / Doanh thu')}
          ${card('ROE', roe, 'Lợi nhuận / Vốn CSH')}
          ${card('ROA', roa, 'Lợi nhuận / Tài sản')}
          ${card('OPERATING', operM, 'Biên LN hoạt động')}
        </div>
        <div class="clay-sunken rounded-2xl p-3 mt-2.5 flex items-center gap-2">
          <span class="text-lg">${ros >= 12 ? '🏆' : '📉'}</span>
          <p class="text-[11px] text-deep-teal/70">Net Profit Margin <b class="${ros >= 12 ? 'text-emerald-700' : 'text-red-600'}">${ros}%</b> — ${ros >= 12 ? 'cao hơn' : 'thấp hơn'} trung bình ngành (12%). Biên gộp: <b>${grossM}%</b>.</p>
        </div>`;
      })()}
    </div>` : '<div class="clay-card p-8 text-center text-sm text-deep-teal/50">Hoàn thành vòng đầu để xem cấu trúc chi phí và lợi nhuận gộp.</div>'}`;
}

// ---------- Báo cáo Nhân sự ----------
function renderHrReport(body) {
  if (!S.history.length) {
    body.innerHTML = '<div class="clay-card p-8 text-center text-sm text-deep-teal/50">Chưa có dữ liệu nhân sự — hãy hoàn thành vòng đầu tiên!</div>';
    return;
  }
  const last = S.history[S.history.length - 1];
  const productivity = Math.round(last.sold / Math.max(1, last.workers || 45));
  body.innerHTML = `
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="clay-card p-4 text-center"><p class="text-2xl">👥</p><p class="font-display font-extrabold text-deep-teal">${last.workers || 45}</p><p class="text-[10px] text-deep-teal/50 font-semibold uppercase">Nhân viên</p></div>
      <div class="clay-card p-4 text-center"><p class="text-2xl">⚡</p><p class="font-display font-extrabold text-primary">${productivity} sp</p><p class="text-[10px] text-deep-teal/50 font-semibold uppercase">Năng suất/người</p></div>
      <div class="clay-card p-4 text-center"><p class="text-2xl">💰</p><p class="font-display font-extrabold text-deep-teal">${money(last.wageCost || 0)}</p><p class="text-[10px] text-deep-teal/50 font-semibold uppercase">Quỹ lương/vòng</p></div>
      <div class="clay-card p-4 text-center"><p class="text-2xl">🎓</p><p class="font-display font-extrabold text-deep-teal">${money(last.trainingCost || 0)}</p><p class="text-[10px] text-deep-teal/50 font-semibold uppercase">Đào tạo/vòng</p></div>
    </div>
    <div class="clay-card p-5">
      <h3 class="font-display font-bold text-deep-teal text-sm mb-3">Lịch sử nhân sự & hiệu suất</h3>
      ${S.history.map(r => `
        <div class="flex justify-between items-center text-xs py-2 border-b border-surface-bright last:border-0">
          <span class="font-bold text-deep-teal">V${r.round}</span>
          <span class="text-deep-teal/70">${r.workers || 45} người · lương ${Math.round(r.wageCost || 0)}tr · đào tạo ${Math.round(r.trainingCost || 0)}tr</span>
          <span class="font-bold ${r.oee >= 85 ? 'text-emerald-600' : 'text-amber-600'}">OEE ${r.oee}%</span>
        </div>`).join('')}
      <p class="text-[11px] text-deep-teal/50 mt-3">💡 Đào tạo tăng OEE (tối đa +5%); sản xuất vượt năng lực nhân sự (70 sp/người) sẽ kéo OEE xuống.</p>
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
    <p class="text-[11px] text-deep-teal/50 mb-3">Business Model Canvas của đội ${S.profile.teamName} — cập nhật theo dữ liệu vòng ${Math.min(S.round, ROUNDS_TOTAL)}.</p>
    <div class="grid grid-cols-2 gap-3">
      ${block('Phân khúc khách hàng', '🎯', `Thị trường đại chúng ${share}% thị phần; khách nhạy giá ${currentEvent(S).elasticityMul ? 'CAO (chiến tranh giá!)' : 'trung bình'}.`)}
      ${block('Giá trị cốt lõi', '💎', `Sản phẩm giá ${(last ? last.decisions.price : 150).toLocaleString('vi-VN')}k₫, thương hiệu hạng ${S.brand >= 1.2 ? 'A' : 'B+'}, R&D tích lũy ${Math.round(S.rdCumulative)}tr₫.`)}
      ${block('Kênh phân phối', '🚚', `Kênh Modern Trade + trực tuyến; tỷ lệ đáp ứng đơn ${currentEvent(S).fulfillMul ? '85% (khủng hoảng cung ứng)' : '100%'}.`)}
      ${block('Quan hệ khách hàng', '❤️', `Brand Loyalty ${S.brandLoyalty}%; độ hài lòng ${Math.min(5, S.brandLoyalty / 19).toFixed(1)}/5.`)}
      ${block('Dòng doanh thu', '💵', `Bán sản phẩm: ${money(totalRev)} lũy kế; giá bán là đòn bẩy chính.`)}
      ${block('Nguồn lực chính', '🏭', `${last ? (last.workers || 45) : 45} nhân sự, công suất máy ${S.machineCapacity.toLocaleString('vi-VN')} sp, OEE ${S.oee}%.`)}
      ${block('Hoạt động chính', '⚙️', `Sản xuất ${last ? last.decisions.production.toLocaleString('vi-VN') : '—'} sp/vòng, marketing, R&D, tối ưu năng lượng.`)}
      ${block('Đối tác chính', '🤝', `Ngân hàng (tín dụng 8.5%/vòng), nhà cung ứng linh kiện, ${(S.grantLog || []).length ? 'Giảng viên cấp vốn' : 'lớp học BizOn'}.`)}
    </div>
    <div class="clay-card p-3.5 mt-3">
      <p class="text-[10px] font-extrabold text-primary uppercase mb-1">🧾 Cơ cấu chi phí</p>
      <p class="text-[11px] text-deep-teal/80">${last ? `Biến đổi: COGS ${Math.round(last.cogs)}tr + Marketing ${last.marketing}tr + R&D ${last.rd}tr · Cố định: ${Math.round(last.fixed)}tr + khấu hao ${Math.round(last.depreciation)}tr + lương ${Math.round(last.wageCost || 0)}tr` : 'Hoàn thành vòng đầu để xem dữ liệu.'}</p>
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
  const hasSolar = (S.items['SOLAR_01'] || 0) > 0;
  body.innerHTML = `
    <div class="clay-card p-4 mb-4 flex items-center gap-4 ${hasSolar ? '' : 'opacity-90'}">
      <p class="text-3xl">☀️</p>
      <div class="flex-1">
        <p class="font-display font-bold text-deep-teal text-sm">Pin Mặt Trời ${hasSolar ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full risk-low align-middle">ĐANG HOẠT ĐỘNG</span>' : '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full risk-medium align-middle">CHƯA LẮP</span>'}</p>
        <p class="text-[11px] text-deep-teal/60">${hasSolar ? 'Tự chủ nguồn điện: -15% chi phí cố định, kháng khủng hoảng năng lượng.' : 'Lắp đặt trong Cửa hàng (150tr₫) để giảm 15% OPEX và tăng 20 điểm ESG. Hoàn vốn ~2 vòng.'}</p>
      </div>
      <div class="text-center shrink-0">
        <p class="font-display font-extrabold ${esgScore(S) >= 70 ? 'text-emerald-600' : 'text-deep-teal'} text-2xl">${esgScore(S)}</p>
        <p class="text-[9px] font-extrabold text-deep-teal/50 uppercase">ESG Score</p>
      </div>
    </div>
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
          <p class="text-sm"><span class="font-display font-extrabold lumina-name">Lumina AI</span> <span class="signature text-base text-deep-teal">Je m'appelle Hương</span></p>
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
  if (invFilter === 'blueprint') owned = owned.filter(([id]) => SHOP_ITEMS.find(x => x.id === id).type === 'blueprint');
  if (invFilter === 'item') owned = owned.filter(([id]) => SHOP_ITEMS.find(x => x.id === id).type !== 'blueprint');
  list.innerHTML = owned.length ? owned.map(([id, q]) => {
    const it = SHOP_ITEMS.find(x => x.id === id);
    const active = S.activeBoosts.includes(id);
    return `<button onclick="selectInvItem('${id}')" class="clay-card p-4 flex flex-col items-center text-center ${invSelected === id ? 'ring-2 ring-primary-container' : ''}">
      <div class="item-icon-container w-full aspect-square flex items-center justify-center mb-2">
        <span class="text-4xl animate-float">${it.icon}</span>
      </div>
      <p class="font-bold text-xs text-deep-teal line-clamp-1">${it.name}</p>
      <span class="text-primary font-bold text-[11px] mt-0.5">×${q}${active ? ' · ĐÃ BẬT' : ''}</span>
    </button>`;
  }).join('') : '<p class="text-sm text-deep-teal/50 col-span-2">Chưa có vật phẩm nào trong mục này.</p>';
  renderInvDetail();
}

function selectInvItem(id) { invSelected = id; renderInventory(); }

function renderInvDetail() {
  const it = invSelected ? SHOP_ITEMS.find(x => x.id === invSelected) : null;
  const q = it ? (S.items[invSelected] || 0) : 0;
  const useBtn = $('invd-use');
  if (!it || q <= 0) {
    $('invd-icon').textContent = '🎒';
    $('invd-name').textContent = 'Chọn một vật phẩm';
    $('invd-count').textContent = '--';
    $('invd-desc').textContent = 'Chạm vào một vật phẩm trong kho để xem chi tiết và sử dụng sức mạnh của nó.';
    useBtn.disabled = true; useBtn.classList.add('opacity-50');
    useBtn.textContent = 'Sử dụng 🚀';
    return;
  }
  const isBlueprint = it.type === 'blueprint';
  const active = S.activeBoosts.includes(it.id);
  $('invd-icon').textContent = it.icon;
  $('invd-name').textContent = it.name;
  $('invd-count').textContent = '×' + q;
  $('invd-desc').textContent = it.desc + (isBlueprint ? ' (Bản thiết kế — hiệu lực vĩnh viễn.)' : active ? ' (Đang bật — sẽ áp dụng ở vòng kế tiếp.)' : '');
  useBtn.disabled = isBlueprint;
  useBtn.classList.toggle('opacity-50', isBlueprint);
  useBtn.textContent = isBlueprint ? 'Hiệu lực vĩnh viễn ✅' : active ? 'Tắt kích hoạt' : 'Sử dụng 🚀';
  useBtn.onclick = (e) => {
    if (isBlueprint) return;
    const wasActive = active;
    toggleBoost(it.id);
    itemSparkles(e.clientX, e.clientY);
    itemToast(wasActive ? 'Đã tắt kích hoạt vật phẩm' : '✨ Vật phẩm đã được kích hoạt!');
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
  $('pf-email').textContent = S.profile.email + (S.profile.classId ? ' · Lớp ' + S.profile.classId : '');
  $('pf-role').textContent = { CEO: '🧭 CEO — Quyết định', CFO: '💰 CFO — Tài chính', CMO: '📣 CMO — Thị trường', COO: '🏭 COO — Vận hành', SEC: '📝 SEC — Thư ký' }[S.profile.role];
  const level = 1 + Math.floor(S.xp / XP_PER_LEVEL);
  $('pf-level').textContent = level;
  const TIERS = ['Khởi nghiệp', 'Trưởng nhóm', 'Quản lý', 'Giám đốc', 'Executive', 'Chủ tịch'];
  $('pf-tier').textContent = '🏅 Tier ' + Math.min(level, 6) + ' · ' + TIERS[Math.min(level - 1, TIERS.length - 1)];
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
  const pts = $('mg-points'); if (pts) pts.textContent = (S.minigamePoints || 0).toLocaleString('vi-VN');
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
  S.minigamePoints = (S.minigamePoints || 0) + score * 10;   // điểm đổi thưởng Clay Reward Shop
  if (score > (S.minigameBest || 0)) S.minigameBest = score;
  mg = null;
  save(); renderAll();
  if (reward > 0) createConfetti();
  $('mg-start').innerHTML = `🎉 +${reward}tr₫! Chơi lại (lượt ${Math.min(3, S.minigamePlays + 1)}/3)`;
  if (S.minigamePlays < 3) { $('mg-start').disabled = false; $('mg-start').classList.remove('opacity-50'); }
}

// ---------- Clay Reward Shop + Xếp hạng mini-game (thiết kế Stitch) ----------
const MG_REWARDS = [
  { id: 'R_HAT',    icon: '🥳', name: 'Mũ tiệc sắc màu',        cost: 300 },
  { id: 'R_TIE',    icon: '👔', name: 'Cà vạt đất nặn',          cost: 500 },
  { id: 'R_CASE',   icon: '💼', name: 'Cặp táp đất sét mini',    cost: 800 },
  { id: 'R_MKT',    icon: '📈', name: 'Huy hiệu Marketing Boost', cost: 1000, lockLevel: 5 },
  { id: 'R_PLANT',  icon: '🪴', name: 'Chậu cây để bàn cao cấp', cost: 1200 },
  { id: 'R_LUNCH',  icon: '🍱', name: 'Voucher ăn trưa cả đội',  cost: 1500 },
  { id: 'R_MYSTERY', icon: '🎁', name: 'Hộp quà bí ẩn',          cost: 2000, lockMissions: 5 },
];
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
        <button onclick="showMgLeaderboard()" class="clay-btn bg-white text-deep-teal text-xs font-bold px-4 py-2">🏆 Xếp hạng</button>
      </div>
      <div class="text-center mb-6">
        <div class="clay-card inline-flex items-center gap-3 px-6 py-3">
          <span class="text-3xl">🐷</span>
          <div class="text-left"><p class="font-display font-extrabold text-primary text-2xl leading-none">${(S.minigamePoints || 0).toLocaleString('vi-VN')}</p><p class="text-[10px] font-extrabold text-deep-teal/50 uppercase">Points</p></div>
        </div>
        <h2 class="font-display font-extrabold text-deep-teal text-xl mt-4">🏺 Clay Reward Shop</h2>
        <p class="text-xs text-deep-teal/60 mt-1">Đổi điểm Clay Factory lấy quà lưu niệm cho đội (điểm ×10 mỗi lượt chơi).</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${MG_REWARDS.map(r => {
          const owned = S.rewardsOwned.includes(r.id);
          const locked = (r.lockLevel && lvl < r.lockLevel) || (r.lockMissions && claimed < r.lockMissions);
          const lockText = r.lockLevel ? `Khóa — Đạt cấp ${r.lockLevel}` : r.lockMissions ? `Khóa — Nhận ${r.lockMissions} nhiệm vụ` : '';
          const equipped = S.rewardEquipped === r.id;
          return `<div class="clay-card p-4 text-center ${locked ? 'opacity-70' : ''} ${equipped ? 'ring-2 ring-primary-container' : ''}">
            <p class="text-4xl mb-2 ${locked ? 'grayscale' : 'animate-float'}">${locked ? '🔒' : r.icon}</p>
            <p class="font-bold text-xs text-deep-teal leading-tight min-h-[2rem]">${r.name}</p>
            ${locked
              ? `<p class="text-[10px] font-bold text-deep-teal/50 mt-2">${lockText}</p>`
              : owned
                ? `<button onclick="equipReward('${r.id}')" class="clay-btn w-full ${equipped ? 'bg-surface-bright text-deep-teal/50' : 'bg-white text-deep-teal'} text-xs font-bold py-2 mt-2">${equipped ? '✓ Đang đeo' : 'Đeo'}</button>`
                : `<p class="font-display font-extrabold text-primary text-sm mt-1">${r.cost.toLocaleString('vi-VN')} điểm</p>
                   <button onclick="redeemReward('${r.id}', event)" class="clay-btn w-full ${S.minigamePoints >= r.cost ? 'bg-emerald-500 text-white' : 'bg-surface-bright text-deep-teal/40'} text-xs font-bold py-2 mt-2">Redeem</button>`}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  document.body.appendChild(div);
}
function redeemReward(id, e) {
  const r = MG_REWARDS.find(x => x.id === id);
  if (!r || S.rewardsOwned.includes(id)) return;
  if ((S.minigamePoints || 0) < r.cost) { itemToast('Chưa đủ điểm — chơi thêm Clay Factory nhé!'); return; }
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
    <h2 class="font-display font-extrabold text-3xl text-white leading-tight">Mở khóa<br><span style="color:#fda127; text-shadow:0 0 20px rgba(253,161,39,.6)">phần thưởng mới!</span></h2>
    <p class="text-8xl mt-8 animate-float" style="filter:drop-shadow(0 0 30px rgba(0,196,255,.7))">${r.icon}</p>
    <p class="font-display font-extrabold text-white text-xl mt-6">${r.name}</p>
    <div class="flex gap-3 mt-9">
      <button id="unbox-wear" class="clay-btn font-display font-extrabold text-white text-sm px-8 py-3.5" style="background:linear-gradient(90deg,#00a2d8,#00c4ff)">Đeo ngay</button>
      <button id="unbox-back" class="clay-btn bg-white text-deep-teal font-display font-extrabold text-sm px-8 py-3.5">Về cửa hàng</button>
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
  const you = { name: S.profile.teamName, team: 'Đội của bạn', score: S.minigameBest || 0, you: true };
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
        <p class="font-display font-extrabold text-deep-teal">🏆 Xếp hạng Clay Factory</p>
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
              <p class="text-[10px] font-bold text-deep-teal/50">${p.score} điểm</p>
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
        <p class="font-display font-extrabold text-white text-sm">Hạng của bạn: #${rank}</p>
        <p class="font-display font-extrabold text-white">${you.score} điểm</p>
      </div>
      <p class="text-[10px] text-deep-teal/40 text-center mt-3">So tài cùng 6 đội AI — phá kỷ lục điểm Clay Factory để leo hạng!</p>
    </div>`;
  document.body.appendChild(div);
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
