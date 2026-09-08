/* BizOn – Nộp kết quả vòng chơi lên backend mỏng (Supabase)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Engine mô phỏng vẫn chạy trên máy sinh viên; tệp này chỉ gửi bản sao
 * kết quả mỗi lần đội khóa vòng – kèm mã băm SHA-256 để giảng viên đối
 * chiếu. Mất mạng không sao: kết quả xếp hàng trong localStorage và tự
 * gửi lại khi có mạng. Mọi lỗi đều im lặng, không ảnh hưởng trải nghiệm. */
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

  async function post(row) {
    const c = cfg();
    const res = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/round_submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: c.anonKey,
        Authorization: 'Bearer ' + c.anonKey,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok && res.status !== 409) throw new Error('HTTP ' + res.status);
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

  async function flush() {
    if (!on() || !navigator.onLine) return;
    const q = readQueue();
    if (!q.length) return;
    const rest = [];
    for (const row of q) {
      try { await post(row); } catch (e) { rest.push(row); }
    }
    writeQueue(rest);
  }

  async function submitRound(S, report) {
    if (!on()) return;
    // Ván chơi thử (không nhập Mã lớp) không gửi lên máy chủ. Người chơi tự do
    // vẫn chơi trọn 6 vòng, nhưng bảng dữ liệu của giảng viên chỉ còn các ván
    // thuộc lớp thật – tránh nhiễu cho chấm điểm và cho nghiên cứu.
    const classId = ((S.profile && S.profile.classId) || '').trim();
    if (!classId) return;
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
      };
      const text = JSON.stringify(result);
      const row = {
        class_code: classId,
        team_name: (S.profile && S.profile.teamName) || 'Đội chưa đặt tên',
        student_email: (S.profile && S.profile.email) || null,
        round_number: report.round,
        result_json: result,
        result_hash: await sha256(text),
        client_ts: new Date().toISOString(),
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
   * kiện với submitRound: chỉ đội có Mã lớp mới đồng bộ lên máy chủ. */
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
    try {
      await rpc('upsert_team_save', { p_class_code: key.classCode, p_team_name: key.teamName, p_state: S });
    } catch (e) { /* im lặng – thử lại ở lần lưu tiếp theo */ }
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
    if (!classCode || !team || classCode === 'DEMO-2026') return null;
    try {
      const rows = await rpc('get_team_save', { p_class_code: classCode, p_team_name: team });
      return Array.isArray(rows) && rows.length ? rows[0] : null; // {state_json, updated_at}
    } catch (e) { return null; }
  }

  window.addEventListener('online', flush);
  document.addEventListener('DOMContentLoaded', flush);
  // Best-effort: gửi nốt bản lưu đang chờ nếu người chơi đóng tab trước khi hết giờ debounce.
  window.addEventListener('beforeunload', () => {
    if (pendingState && on()) {
      const key = teamKey(pendingState);
      if (key) {
        try {
          const c = cfg();
          navigator.sendBeacon(
            c.url.replace(/\/$/, '') + '/rest/v1/rpc/upsert_team_save?apikey=' + encodeURIComponent(c.anonKey),
            new Blob([JSON.stringify({ p_class_code: key.classCode, p_team_name: key.teamName, p_state: pendingState })], { type: 'application/json' }),
          );
        } catch (e) { /* im lặng */ }
      }
    }
  });
  window.BizonBackend = { submitRound, flush, syncTeamState, loadTeamState };
})();
