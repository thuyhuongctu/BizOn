/* BizOn — Giám sát lỗi phía người dùng (backend mỏng Supabase)
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 *
 * Bắt lỗi JavaScript và Promise bị bỏ rơi trên máy sinh viên rồi gửi
 * bản ghi gọn về bảng client_errors (chỉ được GHI, không đọc được).
 * Nguyên tắc như backend.js: mất mạng thì xếp hàng trong localStorage
 * và tự gửi lại; mọi trục trặc đều im lặng, không ảnh hưởng trải nghiệm.
 * Tắt backend (enabled=false) là tắt luôn giám sát lỗi. */
(function () {
  const QKEY = 'bizon-error-queue';
  const APP_VER = 'bizon-v137'; // khớp CACHE trong sw.js — biết lỗi thuộc phiên bản nào
  const MAX_PER_LOAD = 5;       // chống bão lỗi lặp: tối đa 5 bản ghi mỗi lượt tải trang
  let sent = 0;
  const seen = new Set();

  const cfg = () => window.BIZON_BACKEND || {};
  const on = () => cfg().enabled && cfg().url && !cfg().url.includes('YOUR-PROJECT');

  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (e) { return []; }
  }
  function writeQueue(q) {
    try { localStorage.setItem(QKEY, JSON.stringify(q.slice(-20))); } catch (e) {}
  }

  async function post(row) {
    const c = cfg();
    const res = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/client_errors', {
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

  let busy = false; // hai flush chạy song song sẽ ghi đè hàng đợi của nhau
  async function flush() {
    if (busy || !on() || !navigator.onLine) return;
    busy = true;
    try {
      const q = readQueue();
      if (!q.length) return;
      const rest = [];
      for (const row of q) {
        try { await post(row); } catch (e) { rest.push(row); }
      }
      // giữ lại các lỗi mới push vào hàng đợi trong lúc đang gửi
      writeQueue(rest.concat(readQueue().slice(q.length)));
    } finally { busy = false; }
  }

  function report(message, source, line, col, stack) {
    try {
      if (!on() || sent >= MAX_PER_LOAD) return;
      message = String(message || '').slice(0, 500);
      // "Script error." không kèm chi tiết = lỗi cross-origin (tiện ích trình
      // duyệt, script bên thứ ba) — không phải lỗi của BizOn, bỏ qua.
      if (!message || message === 'Script error.') return;
      if (/^(chrome|moz|safari)-extension:/.test(source || '')) return;
      const key = message + '|' + (source || '') + '|' + (line || 0);
      if (seen.has(key)) return;
      seen.add(key);
      sent++;
      const q = readQueue();
      q.push({
        page: location.pathname.split('/').pop() || 'index.html',
        message: message,
        source: String(source || '').slice(0, 300),
        line_no: Number(line) || null,
        col_no: Number(col) || null,
        stack: String(stack || '').slice(0, 1500),
        app_version: APP_VER,
        user_agent: navigator.userAgent.slice(0, 300),
        viewport: innerWidth + 'x' + innerHeight,
        client_ts: new Date().toISOString(),
      });
      writeQueue(q);
      flush();
    } catch (e) { /* im lặng — giám sát lỗi không được phép tự gây lỗi */ }
  }

  window.addEventListener('error', function (e) {
    if (e.target && e.target !== window && (e.target.src || e.target.href)) {
      // Tài nguyên (ảnh/script/css) tải hỏng — ghi gọn, không có stack
      report('Tài nguyên lỗi: ' + (e.target.src || e.target.href), location.pathname, 0, 0, '');
      return;
    }
    report(e.message, e.filename, e.lineno, e.colno, e.error && e.error.stack);
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    const r = e.reason || {};
    report('Promise bị bỏ rơi: ' + (r.message || String(r)), location.pathname, 0, 0, r.stack);
  });

  window.addEventListener('online', flush);
  document.addEventListener('DOMContentLoaded', flush);
  window.BizonErrorLog = { report, flush };
})();
