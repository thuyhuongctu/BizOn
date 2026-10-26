/* Hành trình 3 bậc – kho hộ chiếu cục bộ (localStorage['bizon-journey'] + bản sao lưu), xuất/nhập JSON.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Dùng chung cho trang hanh-trinh.html và bốn game (J4–J6). Chạy trình duyệt (window.BizOnJourneyStore) và Node
 * (require, truyền storage bộ nhớ để kiểm thử). Mọi bản ghi đi qua BizOnJourney.validatePassport: JSON hỏng,
 * sai lược đồ hay nhảy cóc bậc đều bị từ chối, bản sao lưu được thử lại trước khi coi như không có hộ chiếu.
 */
(function (root, factory) {
  const J = typeof module === 'object' && module.exports ? require('./core/journey.js') : root.BizOnJourney;
  const api = factory(J);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BizOnJourneyStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (J) {
  'use strict';
  if (!J) throw new Error('BizOnJourney is required');

  const KEY = 'bizon-journey';
  const BACKUP_KEY = 'bizon-journey-backup';
  const EXPORT_FORMAT = 'bizon-journey-export';
  const EXPORT_VERSION = 1;

  function memoryStorage(initial = {}) {
    const m = new Map(Object.entries(initial));
    return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(String(k), String(v)); }, removeItem: k => { m.delete(String(k)); }, get length() { return m.size; }, key: i => Array.from(m.keys())[i] ?? null };
  }
  function defaultStorage() { try { if (typeof localStorage !== 'undefined') { localStorage.getItem(KEY); return localStorage; } } catch (e) {} return memoryStorage(); }
  const st = o => (o && o.storage) || defaultStorage();

  // Đọc hộ chiếu: khóa chính, hỏng thì thử bản sao lưu; không có hoặc đều hỏng → null.
  function load(opts) {
    const s = st(opts);
    for (const k of [KEY, BACKUP_KEY]) {
      let raw = null; try { raw = s.getItem(k); } catch (e) { raw = null; }
      if (!raw) continue;
      const p = J.parsePassport(raw);
      if (p) { if (k === BACKUP_KEY) { try { s.setItem(KEY, raw); } catch (e) {} } return p; }
    }
    return null;
  }

  // Ghi hộ chiếu (sau khi kiểm tra); bản trước đó thành bản sao lưu. Trả về hộ chiếu đã ghi hoặc ném lỗi.
  function save(p, opts) {
    const v = J.validatePassport(p);
    if (!v.valid) { const e = new Error('invalid_passport'); e.errors = v.errors; throw e; }
    const s = st(opts); const raw = JSON.stringify(p);
    try { const prev = s.getItem(KEY); if (prev && prev !== raw) s.setItem(BACKUP_KEY, prev); } catch (e) {}
    s.setItem(KEY, raw);
    return p;
  }

  function clear(opts) { const s = st(opts); try { s.removeItem(KEY); s.removeItem(BACKUP_KEY); } catch (e) {} }

  // Có thì trả về, chưa có thì tạo mới theo input rồi ghi.
  function getOrCreate(input, opts) { return load(opts) || save(J.createPassport(input || {}), opts); }

  // Đọc → biến đổi bằng hàm thuần → ghi. fn nhận bản sao, trả về hộ chiếu mới.
  function update(fn, opts) { const p = load(opts); if (!p) return null; return save(fn(JSON.parse(JSON.stringify(p))), opts); }

  function exportJson(p) { return JSON.stringify({ format: EXPORT_FORMAT, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), passport: p }, null, 2); }
  // Nhận cả gói xuất lẫn hộ chiếu trần; sai → null (không ném, để giao diện báo nhẹ).
  function importJson(text) {
    let obj; try { obj = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { return null; }
    if (!obj || typeof obj !== 'object') return null;
    const p = obj.format === EXPORT_FORMAT ? obj.passport : obj;
    return J.validatePassport(p).valid ? p : null;
  }

  return Object.freeze({ KEY, BACKUP_KEY, EXPORT_FORMAT, EXPORT_VERSION, memoryStorage, load, save, clear, getOrCreate, update, exportJson, importJson });
});
