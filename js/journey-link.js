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

  // Hộp thoại «Hành trang» trước màn mở đầu (Bậc 2–3): trả Promise → applied (nhận) hoặc null (chơi độc lập / không có / tắt).
  // opts: { variant, roleId, cashAdj, classControls } – classControls là controls của lớp (cờ journey_carry), null nếu chưa có.
  function offerCarry(ctx, opts) {
    const o = opts || {};
    return new Promise(resolve => {
      if (!ctx || !ctx.active || !ctx.passport) return resolve(null);
      const p = ctx.passport, enabled = J.resolveCarryEnabled(p, o.classControls);
      const carry = J.journeyCarry(p, ctx.tier, { variant: o.variant, roleId: o.roleId, cashAdj: o.cashAdj, enabled });
      if (!carry.lines.length && !(carry.preview && Object.keys(carry.preview).length)) return resolve(null);
      const old = document.getElementById('jl-modal'); if (old) old.remove();
      const wrap = document.createElement('div'); wrap.id = 'jl-modal'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
      wrap.innerHTML = `<div class="jl-modal-box">${C.html(carry, { lang: lang(), tier: ctx.tier, variant: o.variant })}` +
        (!enabled && p.classCode && p.classCode !== 'TU-HOC' && p.classCode !== 'DEMO-2026' ? `<p class="jl-modal-note">${esc(t('Lớp chấm điểm: hành trang mặc định tắt cho công bằng; giảng viên bật trong cài đặt lớp thì mới áp.', 'Graded class: carry-over is off by default for fairness; it applies only once the instructor enables it in the class settings.'))}</p>` : '') + '</div>';
      document.body.appendChild(wrap);
      const done = v => { ctx.choice = v ? 'accept' : 'solo'; wrap.remove(); resolve(v); };
      const acc = wrap.querySelector('#jc-accept'), solo = wrap.querySelector('#jc-solo');
      if (acc) acc.onclick = () => done(carry.applied);
      if (solo) solo.onclick = () => done(null);
      (acc || solo || wrap).focus && (acc || solo).focus();
    });
  }
  // Ghi dấu hộ chiếu vào trạng thái ván (để nộp kết quả kèm p_detail_json.journey ở J7 và để Lumina chào theo phong cách Bậc 1).
  function stamp(S, ctx, applied) {
    if (!S || !ctx || !ctx.id) return S;
    const g = greeting(ctx.passport);
    S.journey = Object.assign({}, S.journey, { id: ctx.id, tier: ctx.tier, carryApplied: applied || null, marketBrief: !!(applied && applied.marketBrief), greeting: g });
    return S;
  }
  // Lời chào của Lumina ở vòng 1 theo hồ sơ phong cách Bậc 1 (effectuation: gánh/khảo sát nhiều · causation: ghe sớm).
  function greeting(p) {
    const t1 = p && p.tiers && p.tiers.t1; if (!t1 || t1.status !== 'done' || !t1.style) return null;
    const st = t1.style, explore = (st.exploreWeeks || 0) + (st.surveyWeeks || 0), boat = st.exploitWeeks || 0;
    if (explore >= 3) return { vi: `Ở Bến Phù Sa bạn dò đường kỹ (${explore}/5 tuần gánh hàng và khảo sát) rồi mới nhân rộng – kiểu effectuation. Bật Nghiệp cần thêm kế hoạch dài hơi: hãy dùng dự báo Nếu – Thì trước khi chốt.`, en: `At Bến Phù Sa you scouted carefully (${explore}/5 weeks of street cart and surveys) before scaling – effectuation style. Bật Nghiệp needs longer-range planning too: run the What-If forecast before you commit.` };
    if (boat >= 3) return { vi: `Ở Bến Phù Sa bạn lên ghe sớm (${boat}/5 tuần nhân rộng) – kiểu lập kế hoạch táo bạo. Ở đây thị trường đổi từng vòng: nhớ đọc biến cố và báo cáo trước khi đặt sản lượng lớn.`, en: `At Bến Phù Sa you took the trading boat early (${boat}/5 weeks of scaling) – a bold planning style. Here the market shifts every round: read the event and the reports before committing big volumes.` };
    return { vi: 'Ở Bến Phù Sa bạn cân bằng giữa thử nghiệm và nhân rộng. Giữ nhịp đó: một vòng thăm dò, rồi tăng tốc khi số liệu rõ.', en: 'At Bến Phù Sa you balanced testing and scaling. Keep that rhythm: one probing round, then accelerate once the numbers are clear.' };
  }
  // Phần thêm cho thẻ biến cố vòng 1: lời chào + bản tin thị trường (tên và phong cách 3 đối thủ) nếu hành trang có marketBrief.
  const STYLE = { aggressive: ['giá rẻ, quảng cáo mạnh', 'low prices, heavy advertising'], balanced: ['cân bằng, ổn định', 'balanced, steady'], premium: ['cao cấp, giá cao', 'premium, high prices'] };
  function introExtrasHtml(S) {
    if (!S || !S.journey || S.round !== 1) return '';
    const L = lang(); let out = '';
    if (S.journey.greeting) out += `<p class="jl-greet">🧭 ${esc(L === 'en' ? S.journey.greeting.en : S.journey.greeting.vi)}</p>`;
    if (S.journey.marketBrief && Array.isArray(S.competitors)) out += `<div class="jl-brief"><b>📰 ${esc(t('Bản tin thị trường (hành trang từ chợ nổi)', 'Market brief (carried over from the floating market)'))}</b><ul>${S.competitors.map(c => `<li>${esc(c.name)} – ${esc(STYLE[c.style] ? (L === 'en' ? STYLE[c.style][1] : STYLE[c.style][0]) : c.style)}</li>`).join('')}</ul></div>`;
    return out;
  }
  // Khối cuối ván cho giao diện vẽ lại bằng chuỗi (bản gọn): có khi bậc này đã ghi vào đúng hộ chiếu.
  function endHtml(ctx) {
    if (!ctx || !ctx.id) return '';
    const p = S.load(); if (!p || p.journeyId !== ctx.id || !J.tierDone(p, ctx.tier)) return '';
    return nextHtml(p, ctx.tier);
  }

  root.BizOnJourneyLink = Object.freeze({ HUB, attach, bannerHtml, mountBanner, finish, nextHtml, complete, offerCarry, stamp, greeting, introExtrasHtml, endHtml, lang });
})(window);
