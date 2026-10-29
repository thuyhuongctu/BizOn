/* CHAM Homestay – tiện ích giao diện dùng chung cho bộ học liệu trong cham/ (song ngữ, lưu cục bộ).
 * Nội dung dựng bằng JS lấy chữ theo ngôn ngữ hiện tại qua ChamKit.t({ vi, en }) và vẽ lại khi
 * bizon-clay-i18n.js phát 'bizon:langchange'; phần tĩnh trong HTML dùng data-en như mọi trang đất sét.
 * CHAM™ và nội dung tình huống © 2017–2026 Đỗ Thùy Hương, dùng trên BizOn theo giấy phép không độc quyền. */
(function (root) {
  'use strict';
  const K = {};
  K.lang = () => (typeof root.clayCurrentLang === 'function' ? root.clayCurrentLang() : (document.documentElement.lang === 'en' ? 'en' : 'vi'));
  K.en = () => K.lang() === 'en';
  /* Chữ song ngữ: chuỗi thường giữ nguyên; { vi, en } chọn theo ngôn ngữ */
  K.t = o => (o == null ? '' : typeof o === 'object' ? (K.en() ? (o.en != null ? o.en : o.vi) : o.vi) : String(o));
  /* Số theo quy ước từng ngôn ngữ: EN 500,000 · VI 500.000 */
  K.num = (v, d = 0) => Number(v).toLocaleString(K.en() ? 'en-US' : 'vi-VN', { maximumFractionDigits: d, minimumFractionDigits: 0 });
  K.vnd = v => K.num(v) + ' đ';
  K.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  K.get = (key, def) => { try { const v = localStorage.getItem(key); return v == null ? def : JSON.parse(v); } catch (e) { return def; } };
  K.set = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; } };
  K.del = key => { try { localStorage.removeItem(key); } catch (e) {} };
  K.$ = (sel, el) => (el || document).querySelector(sel);
  /* Vẽ ngay và vẽ lại mỗi khi đổi ngôn ngữ */
  K.mount = render => {
    const run = () => { try { render(); } catch (e) { console.error(e); } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
    root.addEventListener('bizon:langchange', run);
  };
  K.reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  /* Chữ thay thế ảnh song ngữ: <img alt="…" data-en-alt="…"> (bizon-clay-i18n.js chưa đổi alt) */
  K.mount(() => document.querySelectorAll('img[data-en-alt]').forEach(el => {
    if (el.dataset.viAlt == null) el.dataset.viAlt = el.alt;
    el.alt = K.en() ? el.dataset.enAlt : el.dataset.viAlt;
  }));
  root.ChamKit = K;
})(typeof self !== 'undefined' ? self : this);
