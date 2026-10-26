/* BizOn – Nộp kết quả vòng chơi lên backend mỏng (Supabase)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Engine mô phỏng vẫn chạy trên máy sinh viên; tệp này chỉ gửi bản sao
 * kết quả mỗi lần đội khóa vòng – kèm mã băm SHA-256 để giảng viên đối
 * chiếu. Mất mạng không sao: kết quả xếp hàng trong localStorage và tự
 * gửi lại khi có mạng. Lỗi không chặn game, nhưng nếu còn kết quả chưa gửi
 * được thì hiện một thanh cảnh báo để sinh viên biết và bấm "Gửi lại".
 *
 * Từ 10/2026 máy chủ chỉ nhận kết quả từ sinh viên đã đăng nhập email trường
 * và «Tham gia đội» (migration 20261023000000_require_student_login.sql):
 * kết quả vòng qua bizon_submit_round, tiến trình đội qua
 * bizon_student_get_save/upsert_save – đội và email do máy chủ lấy từ tài
 * khoản, không nhận từ trình duyệt. Phiên đăng nhập do js/student-login.js
 * giữ (tự làm mới token); chưa đăng nhập thì không gửi gì, chỉ báo. */
(function () {
  const QKEY = 'bizon-backend-queue';
  const cfg = () => window.BIZON_BACKEND || {};
  const on = () => cfg().enabled && cfg().url && !cfg().url.includes('YOUR-PROJECT');

  async function sha256(text) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return 'nohash'; }
  }

  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (e) { return []; }
  }
  function writeQueue(q) {
    try { localStorage.setItem(QKEY, JSON.stringify(q.slice(-60))); } catch (e) {}
  }

  const signedIn = () => !!(window.StudentLogin && StudentLogin.signedIn());

  // RPC bằng phiên sinh viên (Bearer = access token, không phải anon key).
  async function rpcAuth(fnName, payload) {
    const t = window.StudentLogin ? await StudentLogin.token() : null;
    if (!t) throw new Error('nologin');
    const c = cfg();
    const res = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/rpc/' + fnName, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: 'Bearer ' + t },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json().catch(() => null);
  }

  // Hàng đợi có thể còn dòng kiểu cũ (cột của round_submissions) từ trước 10/2026:
  // đổi sang tham số hàm, đội lấy theo tài khoản nên bỏ team_name/student_email.
  async function post(row) {
    await rpcAuth('bizon_submit_round', row.p_class_code ? row : {
      p_class_code: row.class_code, p_round: row.round_number, p_result_json: row.result_json,
      p_result_hash: row.result_hash, p_client_ts: row.client_ts,
    });
  }

  async function rpc(fnName, payload) {
    const c = cfg();
    const res = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/rpc/' + fnName, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: c.anonKey,
        Authorization: 'Bearer ' + c.anonKey,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json().catch(() => null);
  }

  async function doFlush() {
    if (!on() || !navigator.onLine || !signedIn()) return;
    const q = readQueue();
    if (!q.length) return;
    const rest = [];
    for (const row of q) {
      try { await post(row); } catch (e) { rest.push(row); }
    }
    // Dòng mới thêm vào SAU khi q được đọc (submitRound luôn push vào cuối
    // mảng) chưa từng được gửi – giữ lại thay vì để writeQueue() dưới đây
    // xoá mất chúng.
    const extra = readQueue().slice(q.length);
    writeQueue(rest.concat(extra));
  }

  // Trạng thái gửi: số kết quả vòng còn chờ + tiến trình đội lưu lên máy chủ có lỗi hay không.
  let stateError = false;
  let lastState = null;
  let needLogin = false; // ván có Mã lớp nhưng tab này chưa đăng nhập: không gửi được gì về lớp
  function notify() {
    let pending = 0;
    try { pending = readQueue().length; } catch (e) {}
    window.dispatchEvent(new CustomEvent('bizon-sync', { detail: { pending, stateError, needLogin } }));
    showSyncBanner(pending, stateError, needLogin);
  }

  // Thanh cảnh báo cố định dưới màn hình, chỉ hiện khi còn việc chưa gửi được.
  // Dùng textContent (không innerHTML) vì tên đội do sinh viên nhập.
  function showSyncBanner(pending, stateErr, noLogin) {
    let el = document.getElementById('bizon-sync-banner');
    if (!pending && !stateErr && !noLogin) { if (el) el.remove(); return; }
    if (!el) {
      if (!document.body) return;
      el = document.createElement('div');
      el.id = 'bizon-sync-banner';
      el.setAttribute('role', 'alert');
      el.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff3cd;color:#664d03;border:2px solid #ffc107;border-radius:12px;padding:10px 14px;font:600 14px/1.4 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.2)';
      document.body.appendChild(el);
    }
    el.textContent = '';
    const msg = document.createElement('span');
    msg.textContent = noLogin
      ? '⚠️ Phiên đăng nhập email trường đã hết, nên kết quả chưa gửi về lớp. Tải lại trang, đăng nhập và «Tham gia đội» rồi chơi tiếp. / Your school sign-in has ended, so results are not reaching your class. Reload, sign in and «Join team», then continue.'
      : pending
      ? '⚠️ Chưa gửi được ' + pending + ' kết quả vòng chơi lên máy chủ. Kiểm tra mạng rồi bấm "Gửi lại". / ' +
        pending + ' round result(s) not sent yet. Check your connection and tap "Resend".'
      : '⚠️ Chưa lưu được tiến trình đội lên máy chủ. Kiểm tra mạng rồi bấm "Gửi lại". / Team progress not saved to the server yet. Check your connection and tap "Resend".';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Gửi lại / Resend';
    btn.style.cssText = 'flex:none;border:0;border-radius:8px;padding:6px 10px;background:#664d03;color:#fff;font:700 13px system-ui,sans-serif;cursor:pointer';
    btn.onclick = function () {
      flush();
      if (stateError && lastState) saveTeamStateNow(lastState);
    };
    if (noLogin) el.append(msg); else el.append(msg, btn);
  }

  // flush() được gọi từ nhiều nơi (submitRound, sự kiện 'online',
  // DOMContentLoaded) có thể trùng thời điểm – khoá lại để chỉ 1 lượt gửi
  // chạy thật sự cùng lúc, nếu không 2 lượt sẽ cùng đọc và cùng gửi lại y
  // hệt các dòng giống nhau (POST trùng), và lượt xong sau sẽ writeQueue()
  // đè mất dòng mới vừa được submitRound() thêm vào trong lúc lượt kia
  // đang chạy.
  let flushing = null;
  function flush() {
    if (flushing) return flushing;
    // .finally() luôn chạy ở microtask kế tiếp (kể cả khi doFlush() đã xong
    // ngay lập tức vì hàng đợi rỗng – không có await nào cả), nên gán
    // "flushing = ..." chắc chắn hoàn tất TRƯỚC khi callback này chạy. Nếu
    // viết finally NGAY TRONG doFlush() thay vì .finally() ở đây, đường
    // "hàng đợi rỗng, không await" sẽ tự đặt flushing về null TRƯỚC KHI
    // dòng "flushing = (async()=>{...})()" ở dưới kịp gán xong, khiến giá
    // trị cuối cùng bị đè lại thành promise đã xong – kẹt "đang gửi" mãi.
    flushing = doFlush().finally(function () { flushing = null; notify(); });
    return flushing;
  }

  // Kết quả cắm cờ của vòng (recordConquest trong app.js chạy trước submitRound).
  function conquestWin(S, round) {
    const c = (S.conquest || []).filter(x => x && x.round === round).pop();
    return c ? !!c.win : null;
  }

  async function submitRound(S, report) {
    if (!on()) return;
    // Ván chơi thử (không nhập Mã lớp) không gửi lên máy chủ. Người chơi tự do
    // vẫn chơi trọn 6 vòng, nhưng bảng dữ liệu của giảng viên chỉ còn các ván
    // thuộc lớp thật – tránh nhiễu cho chấm điểm và cho nghiên cứu.
    const classId = ((S.profile && S.profile.classId) || '').trim();
    // Đội Demo («Chơi thử với Đội Demo») dùng chung mã lớp mẫu DEMO-2026 – coi như chơi thử, không gửi
    // (khớp lời hứa «chơi thử: dữ liệu chỉ lưu trên máy bạn» ở màn đăng nhập; tiến trình cũng đã không đồng bộ).
    if (!classId || classId === 'DEMO-2026') return;
    if (!signedIn()) { needLogin = true; notify(); return; }
    needLogin = false;
    try {
      // Bản kết quả gọn: đủ cho chấm điểm + nghiên cứu, bỏ các khối nặng
      const result = {
        round: report.round,
        eventId: report.event && report.event.id,
        decisions: report.decisions,
        revenue: report.revenue, netProfit: report.netProfit, share: report.share,
        sold: report.sold, lostSales: report.lostSales, inventory: report.inventory,
        balance: report.balance, oee: report.oee, roi: report.roi,
        quickRatio: report.quickRatio, brandLoyalty: report.brandLoyalty,
        // Ba trường dưới đây Trang Giảng viên dùng để chấm B3 (lỗi sản phẩm),
        // B4 (số thành tựu) và đếm cờ. Trước đây không gửi, nên mọi đội bị
        // B4 = 0 và mất 0,4 điểm lỗi ở B3 dù đã đạt trong game.
        defect: report.defect,
        ach: Array.isArray(S.achievements) ? S.achievements.length : null,
        win: conquestWin(S, report.round),
        // Mức khó áp cho vòng này (bản tính điểm luôn 'normal') – trường thêm mới, không đổi trường cũ.
        difficulty: S.difficulty || 'normal',
        // Hành trình 3 bậc: { journeyId, tier, carryApplied } khi ván thuộc hành trình (S.journey do journey-link.stamp), null khi không.
        journey: (window.BizOnJourneyLink && typeof BizOnJourneyLink.submitInfo === 'function') ? BizOnJourneyLink.submitInfo(S) : null,
        explain: window.BizOnExplain ? BizOnExplain.condition() : 'shown',   // nhánh hộp đen (R1)
      };
      const text = JSON.stringify(result);
      const row = {
        p_class_code: classId,
        p_round: report.round,
        p_result_json: result,
        p_result_hash: await sha256(text),
        p_client_ts: new Date().toISOString(),
      };
      const q = readQueue();
      q.push(row);
      writeQueue(q);
      flush();
    } catch (e) { /* im lặng – không chặn game */ }
    saveTeamStateNow(S);
  }

  /* Lưu & tải lại tiến trình theo đội (cross-device) – để đội đổi máy ở
   * phòng máy dùng chung vẫn tiếp tục đúng chỗ đang chơi dở. Cùng điều
   * kiện với submitRound: chỉ đội có Mã lớp mới đồng bộ lên máy chủ.
   *
   * Máy chủ tìm đội theo tài khoản đã «Tham gia đội» (bizon_student_*_save),
   * nên thành viên nào đăng nhập trên máy nào cũng tải đúng tiến trình đội
   * mình, không cần Mã đồng bộ. saveToken/getSyncCode/adoptSyncCode còn lại
   * chỉ để màn đăng nhập cũ không lỗi; máy chủ không dùng token này nữa. */
  function saveToken(classCode, teamName) {
    const k = 'bizon-save-token:' + classCode + ':' + teamName;
    try {
      let t = localStorage.getItem(k);
      if (!t) {
        t = [...crypto.getRandomValues(new Uint8Array(24))].map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem(k, t);
      }
      return t;
    } catch (e) { return null; }
  }

  function teamKey(S) {
    const classCode = ((S.profile && S.profile.classId) || '').trim();
    const teamName = ((S.profile && S.profile.teamName) || '').trim();
    // Đội Demo (nút "Chơi thử") dùng chung đúng 1 mã lớp + tên đội cho mọi
    // khách ghé trang — không đồng bộ/tải lại server, kẻo người lạ ghi đè
    // hoặc thừa hưởng tiến trình demo của nhau.
    if (classCode === 'DEMO-2026') return null;
    return classCode && teamName ? { classCode, teamName } : null;
  }

  async function saveTeamStateNow(S) {
    if (!on()) return;
    const key = teamKey(S);
    if (!key) return;
    if (!signedIn()) { needLogin = true; notify(); return; }
    lastState = S;
    try {
      await rpcAuth('bizon_student_upsert_save', { p_class_code: key.classCode, p_state: S });
      stateError = false;
    } catch (e) {
      // Lỗi lưu tiến trình không chặn game; báo để sinh viên biết và bấm "Gửi lại".
      stateError = true;
    }
    notify();
  }

  let syncTimer = null;
  let pendingState = null;
  function syncTeamState(S) {
    if (!on() || !teamKey(S)) return;
    pendingState = S;
    if (syncTimer) return; // đã lên lịch gửi, chờ đến lượt
    syncTimer = setTimeout(() => {
      syncTimer = null;
      const state = pendingState;
      pendingState = null;
      if (state) saveTeamStateNow(state);
    }, 20000);
  }

  async function loadTeamState(classId, teamName) {
    if (!on()) return null;
    const classCode = String(classId || '').trim();
    const team = String(teamName || '').trim();
    if (!classCode || !team || classCode === 'DEMO-2026' || !signedIn()) return null;
    try {
      const rows = await rpcAuth('bizon_student_get_save', { p_class_code: classCode });
      return Array.isArray(rows) && rows.length ? rows[0] : null; // {state_json, updated_at}
    } catch (e) { return null; }
  }

  // Bảng xếp hạng lớp trực tiếp: trả về các đội cùng Mã lớp với tổng hợp KPI.
  // Chỉ đọc, không token; dựa vào RPC bizon_class_leaderboard (chỉ trả tổng hợp
  // không nhạy cảm). Trả null nếu offline, không có lớp, hoặc RPC chưa triển khai.
  async function classLeaderboard(classId) {
    if (!on()) return null;
    const classCode = String(classId || '').trim();
    if (!classCode || classCode === 'DEMO-2026') return null;
    try {
      const rows = await rpc('bizon_class_leaderboard', { p_class_code: classCode });
      return Array.isArray(rows) ? rows : null;
    } catch (e) { return null; }
  }

  window.addEventListener('online', flush);
  document.addEventListener('DOMContentLoaded', flush);
  // Best-effort: gửi nốt bản lưu đang chờ nếu người chơi đóng tab trước khi hết giờ debounce.
  // sendBeacon không gửi được header Authorization nên dùng fetch keepalive, với
  // access token đang còn hạn (lúc đóng tab không kịp chờ làm mới token).
  window.addEventListener('beforeunload', () => {
    if (pendingState && on()) {
      const key = teamKey(pendingState);
      const s = window.StudentLogin && StudentLogin.getSession();
      if (key && s && s.expiresAt > Date.now()) {
        try {
          const c = cfg();
          fetch(c.url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_student_upsert_save', {
            method: 'POST', keepalive: true,
            headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: 'Bearer ' + s.accessToken },
            body: JSON.stringify({ p_class_code: key.classCode, p_state: pendingState }),
          });
        } catch (e) { /* im lặng */ }
      }
    }
  });
  // Mã đồng bộ đội = token lưu trên máy này. Đội chơi trên nhiều máy: nhập mã này
  // trên máy mới (cùng Mã lớp và Tên đội) để tải đúng tiến trình của đội.
  function getSyncCode(S) {
    const key = teamKey(S);
    return key ? saveToken(key.classCode, key.teamName) : null;
  }
  function adoptSyncCode(classId, teamName, code) {
    const c = String(code || '').trim().toLowerCase();
    if (!/^[0-9a-f]{48}$/.test(c)) return false;
    const cls = String(classId || '').trim();
    const team = String(teamName || '').trim();
    if (!cls || !team || cls === 'DEMO-2026') return false;
    try { localStorage.setItem('bizon-save-token:' + cls + ':' + team, c); return true; } catch (e) { return false; }
  }

  // Báo lỗi từ sinh viên về bảng bug_reports (chỉ giảng viên đọc được).
  async function sendBugReport(S, description) {
    if (!on()) return false;
    const p = (S && S.profile) || {};
    try {
      await rpc('bizon_report_bug', {
        p_class_code: p.classId || '',
        p_team_name: p.teamName || '',
        p_round: ((S && S.history) || []).length + 1,
        p_role: p.role || '',
        p_description: description,
        p_user_agent: navigator.userAgent,
      });
      return true;
    } catch (e) { return false; }
  }

  window.BizonBackend = { submitRound, flush, syncTeamState, loadTeamState, classLeaderboard, getSyncCode, adoptSyncCode, sendBugReport };
})();
