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
        class_code: (S.profile && S.profile.classId) || 'TU-DO',
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
  }

  window.addEventListener('online', flush);
  document.addEventListener('DOMContentLoaded', flush);
  window.BizonBackend = { submitRound, flush };
})();
