/* BizOn landing page P0 — navigation, accessibility and explicit page translations.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền. */
(function () {
  'use strict';

  function currentLang() {
    try { return localStorage.getItem('bizon-lang') || 'vi'; }
    catch (e) { return 'vi'; }
  }

  function applyLandingLang(lang) {
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.viLanding) el.dataset.viLanding = el.textContent.trim();
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.viLanding;
    });

    document.querySelectorAll('[data-en-label]').forEach(function (el) {
      if (!el.dataset.viLabel) el.dataset.viLabel = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'en' ? el.dataset.enLabel : el.dataset.viLabel);
    });
  }

  function installTranslationBridge() {
    var sharedApplyLang = window.applyLang;
    window.applyLang = function (lang) {
      if (typeof sharedApplyLang === 'function') sharedApplyLang(lang);
      applyLandingLang(lang);
    };
    applyLandingLang(currentLang());
  }

  function installMobileMenu() {
    var button = document.getElementById('menu-btn');
    var menu = document.getElementById('mobile-nav');
    if (!button || !menu) return;

    function closeMenu() {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.textContent = '☰';
      button.setAttribute('aria-label', currentLang() === 'en' ? 'Open menu' : 'Mở menu');
    }

    button.addEventListener('click', function () {
      var willOpen = menu.hidden;
      menu.hidden = !willOpen;
      button.setAttribute('aria-expanded', String(willOpen));
      button.textContent = willOpen ? '✕' : '☰';
      button.setAttribute('aria-label', willOpen
        ? (currentLang() === 'en' ? 'Close menu' : 'Đóng menu')
        : (currentLang() === 'en' ? 'Open menu' : 'Mở menu'));
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1020) closeMenu();
    });
  }

  function installFaqBehavior() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.faq-grid details'));
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    installTranslationBridge();
    installMobileMenu();
    installFaqBehavior();
  });
})();
