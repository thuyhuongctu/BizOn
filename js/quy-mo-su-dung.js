/* BizOn – khối «Quy mô sử dụng» trên trang Bằng chứng (23/11/2026). © 2026 Đỗ Thùy Hương & Phan Anh Tú.
 * Gọi hàm công khai bizon_quy_mo_su_dung() (supabase/migrations/20261123000000_quy_mo_su_dung.sql): chỉ nhận số tổng.
 * Chưa có hàm, mất mạng, hay chưa có lớp nào thì giữ khối ẩn; trang vẫn đủ nội dung. */
(function () {
  'use strict';
  var sec = document.getElementById('quy-mo'), so = null;
  if (!sec) return;
  var en = function () { return (document.documentElement.lang || '').slice(0, 2) === 'en'; };
  function ve() {
    if (!so) return;
    var f = new Intl.NumberFormat(en() ? 'en-US' : 'vi-VN');
    sec.querySelectorAll('[data-qm]').forEach(function (el) {
      var k = el.getAttribute('data-qm'), v = so[k];
      if (k === 'tu_ngay') { var p = String(v || '').split('-'); el.textContent = p.length === 3 ? (en() ? p[1] + '/' + p[2] + '/' + p[0] : p[2] + '/' + p[1] + '/' + p[0]) : '–'; }
      else { el.textContent = typeof v === 'number' ? f.format(v) : '–'; var o = el.closest('.bc-stat'); if (o) o.hidden = !(v > 0); }   // ô bằng 0 thì ẩn (chưa có lớp nào nộp)
    });
  }
  var c = window.BIZON_BACKEND;
  if (!c || !c.enabled || !c.url || !window.fetch) return;
  fetch(c.url.replace(/\/$/, '') + '/rest/v1/rpc/bizon_quy_mo_su_dung', {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: c.anonKey, Authorization: 'Bearer ' + c.anonKey }, body: '{}',
  }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    if (!j || typeof j.lop !== 'number' || j.lop < 1) return;
    so = j; ve(); sec.hidden = false;
  }).catch(function () {});
  window.addEventListener('bizon:langchange', function () { setTimeout(ve, 0); });
})();
