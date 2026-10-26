/* Hành trình 3 bậc – móc nối dùng chung cho các game: đọc ?journey=, băng thông báo ở màn mở đầu, ghi kết quả bậc vào
 * hộ chiếu cuối ván, khối «Sang Bậc kế tiếp» với xem trước hành trang.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 *
 * Nạp sau js/core/journey.js, js/journey-store.js, js/journey-card.js. Game gọi:
 *   const ctx = BizOnJourneyLink.attach('t1');            // đầu trang: đọc URL + hộ chiếu, đánh dấu bậc «đang chơi»
 *   BizOnJourneyLink.mountBanner(ctx, 'ft-intro');        // băng ở màn mở đầu (chỉ khi URL có ?journey=)
 *   BizOnJourneyLink.complete(ctx, S, meta, { host: 'ft-end', before: 'a[href="game.html"]' });  // cuối ván
 * Không có ?journey= → mọi hàm là no-op: game chạy y như cũ (nguyên tắc N4). */
(function (root) {
  'use strict';
  const J = root.BizOnJourney, S = root.BizOnJourneyStore, C = root.BizOnJourneyCard;
  if (!J || !S || !C) return;
  const HUB = 'hanh-trinh.html';
  const lang = () => { try { if (typeof root.clayCurrentLang === 'function') return root.clayCurrentLang(); return localStorage.getItem('bizon-lang') === 'en' ? 'en' : 'vi'; } catch (e) { return 'vi'; } };
  const t = (vi, en) => (lang() === 'en' ? en : vi);
  const esc = C.esc;
  const TAG = () => `<span class="jl-tag">🧭 ${esc(t('HÀNH TRÌNH 3 BẬC', '3-LEVEL JOURNEY'))}</span>`;

  // ctx = { tier, id, passport, active, reason: none | missing | mismatch | locked | done | ok }
  function attach(tier, search) {
    const id = C.journeyIdFromUrl(search); const ctx = { tier, id, passport: null, active: false, reason: id ? 'missing' : 'none' };
    if (!id) return ctx;
    const p = S.load(); if (!p) return ctx;
    ctx.passport = p;
    if (p.journeyId !== id) { ctx.reason = 'mismatch'; return ctx; }
    if (J.tierDone(p, tier)) { ctx.reason = 'done'; return ctx; }
    if (!J.canPlay(p, tier)) { ctx.reason = 'locked'; return ctx; }
    ctx.active = true; ctx.reason = 'ok';
    if (p.tiers[tier].status === 'pending') { try { ctx.passport = S.update(q => { q.tiers[tier].status = 'playing'; return q; }) || p; } catch (e) {} }
    return ctx;
  }

  function bannerHtml(ctx) {
    if (!ctx || !ctx.id) return '';
    const n = C.TIER[ctx.tier].n, link = `<a href="${HUB}" target="_top" class="jl-link">${esc(t('Mở Hành trình', 'Open the Journey'))} →</a>`;
    if (ctx.active) return `<div class="jl-banner" id="ft-journey" data-reason="ok">${TAG()}<b>${esc(t(`Bậc ${n}/3`, `Level ${n}/3`))} · ${esc(ctx.passport.teamName)}</b><span>${esc(t('Kết quả ván này sẽ ghi vào hộ chiếu khi kết thúc.', 'This run\'s result is recorded in the passport at the end.'))}</span>${link}</div>`;
    const why = ctx.reason === 'done' ? t('Bậc này đã ghi trong hộ chiếu; ván này chơi tự do, không ghi đè.', 'This level is already recorded in the passport; this run is free play and will not overwrite it.')
      : ctx.reason === 'locked' ? t('Bậc này chưa mở trong hộ chiếu (chưa xong bậc trước). Ván này chơi độc lập.', 'This level is not yet unlocked in the passport (previous level unfinished). This run is standalone.')
      : t('Không tìm thấy hộ chiếu hành trình này trên máy. Ván này chơi độc lập.', 'This journey passport was not found on this device. This run is standalone.');
    return `<div class="jl-banner jl-off" id="ft-journey" data-reason="${esc(ctx.reason)}">${TAG()}<span>${esc(why)}</span>${link}</div>`;
  }
  function mountBanner(ctx, host, where) {
    const h = typeof host === 'string' ? document.getElementById(host) : host;
    if (!h || !ctx || !ctx.id || document.getElementById('ft-journey')) return null;
    h.insertAdjacentHTML(where || 'afterbegin', bannerHtml(ctx)); return document.getElementById('ft-journey');
  }

  // Ghi kết quả bậc (một lần; đã ghi thì giữ nguyên). Trả về { recorded, passport }.
  function finish(ctx, state, meta) {
    if (!ctx || !ctx.active) return { recorded: false, passport: ctx && ctx.passport || null };
    let p = null;
    try {
      p = S.update(q => {
        if (J.tierDone(q, ctx.tier)) return q;
        if (ctx.tier === 't1') return J.recordTier1(q, state, meta);
        if (ctx.tier === 't2') return J.recordTier2(q, state, meta);
        return J.recordTier3(q, meta && meta.variant, state, meta);
      });
    } catch (e) { return { recorded: false, passport: ctx.passport, error: e }; }
    const recorded = !!(p && J.tierDone(p, ctx.tier));
    if (recorded) { ctx.active = false; ctx.reason = 'done'; ctx.passport = p; }
    return { recorded, passport: p };
  }

  // Khối cuối ván: «Bậc n đã ghi», xem trước hành trang cho bậc kế tiếp (không nút), nút về trang Hành trình.
  function nextHtml(p, tier) {
    const nt = J.nextTier(p), n = C.TIER[tier].n, L = lang(), variant = p.tiers.t3.variant || J.DEFAULT_T3_VARIANT;
    let inner = '';
    if (nt === 't2' || nt === 't3') {
      const role = p.tiers.t3.roleId || 'packer', enabled = J.resolveCarryEnabled(p, undefined);
      const carry = J.journeyCarry(p, nt, { variant, roleId: role, cashAdj: nt === 't3' && variant === 'durian' ? (C.DURIAN_ROLES[role] || {}).cashAdj || 0 : 0, enabled });
      inner = C.html(carry, { lang: L, tier: nt, variant, buttons: false, note: false });
    }
    const label = nt ? t(`Sang Bậc ${C.TIER[nt].n} · ${C.tierName(nt, L, variant)}`, `On to Level ${C.TIER[nt].n} · ${C.tierName(nt, L, variant)}`) : t('Xem tổng kết hành trình', 'See the journey wrap-up');
    return `<section class="jl-done" id="ft-journey-next">${TAG()}<h3>${esc(t(`Bậc ${n} đã ghi vào hộ chiếu của ${p.teamName}`, `Level ${n} recorded in ${p.teamName}'s passport`))}</h3>${inner}<a href="${HUB}" target="_top" class="jl-next">🧭 ${esc(label)} →</a></section>`;
  }

  // Tiện ích cho game: ghi + chèn khối vào màn kết thúc (trước phần tử `before` nếu có) + đổi nút «Lên Bậc 2» cũ về trang Hành trình.
  function complete(ctx, state, meta, opts) {
    const o = opts || {}; const r = finish(ctx, state, meta); const p = r.passport;
    if (!r.recorded || !p) return r;
    const host = typeof o.host === 'string' ? document.getElementById(o.host) : o.host;
    if (host && !document.getElementById('ft-journey-next')) {
      const anchor = o.before ? host.querySelector(o.before) : null, html = nextHtml(p, ctx.tier);
      if (anchor) anchor.insertAdjacentHTML('beforebegin', html); else host.insertAdjacentHTML('beforeend', html);
      const a = anchor && anchor.tagName === 'A' ? anchor : null;
      if (a) { a.href = HUB; a.target = '_top'; const vi = '🧭 Tiếp tục hành trình', en = '🧭 Continue the journey'; a.dataset.vi = vi; a.dataset.en = en; a.textContent = lang() === 'en' ? en : vi; }
    }
    return r;
  }

  root.BizOnJourneyLink = Object.freeze({ HUB, attach, bannerHtml, mountBanner, finish, nextHtml, complete, lang });
})(window);
