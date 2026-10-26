/* Hành trình 3 bậc – trang hanh-trinh.html: tạo/đọc hộ chiếu cục bộ, ba thẻ bậc, xem trước hành trang, cài đặt, sao lưu.
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 * Phụ thuộc (nạp trước): js/core/journey.js, js/journey-store.js, js/journey-card.js, js/bizon-clay-i18n.js. */
(function () {
  'use strict';
  const J = window.BizOnJourney, S = window.BizOnJourneyStore, C = window.BizOnJourneyCard;
  if (!J || !S || !C) return;
  const $ = id => document.getElementById(id);
  const lang = () => (typeof window.clayCurrentLang === 'function' ? window.clayCurrentLang() : 'vi');
  const t = (vi, en) => (lang() === 'en' ? en : vi);
  const esc = C.esc;

  function roleOptions(sel, cur) {
    sel.innerHTML = Object.keys(C.DURIAN_ROLES).map(id => `<option value="${id}"${id === cur ? ' selected' : ''}>${esc(t(C.DURIAN_ROLES[id].vi, C.DURIAN_ROLES[id].en))}</option>`).join('');
  }
  function msg(id, text, ok) { const el = $(id); if (!el) return; el.textContent = text || ''; el.style.color = ok ? '#246b3a' : ''; if (text) setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, 6000); }

  // ---------- màn tạo hộ chiếu ----------
  function bindSetup() {
    roleOptions($('jr-role'), 'packer');
    const form = $('jr-form');
    form.addEventListener('change', e => { if (e.target.name === 'variant') $('jr-role-wrap').style.display = e.target.value === 'durian' ? '' : 'none'; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const team = $('jr-team').value.trim(), cls = $('jr-class').value.trim().toUpperCase();
      if (!team) { msg('jr-msg-new', t('Nhập tên đội trước đã.', 'Enter a team name first.')); $('jr-team').focus(); return; }
      const variant = (form.querySelector('input[name="variant"]:checked') || {}).value || J.DEFAULT_T3_VARIANT;
      let p = J.createPassport({ classCode: cls || undefined, teamName: team, variant });
      if (variant === 'durian') p = J.setTier3Variant(p, 'durian', $('jr-role').value);
      S.save(p); render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $('jr-import-new').addEventListener('change', e => importFile(e.target, 'jr-msg-new'));
  }

  function importFile(input, msgId) {
    const f = input.files && input.files[0]; if (!f) return;
    f.text().then(txt => {
      const p = S.importJson(txt);
      if (!p) { msg(msgId, t('Tệp không phải hộ chiếu hợp lệ.', 'That file is not a valid passport.')); return; }
      S.save(p); render(); msg('jr-msg', t('Đã nhập hộ chiếu.', 'Passport imported.'), true);
    }).catch(() => msg(msgId, t('Không đọc được tệp.', 'Could not read the file.')));
    input.value = '';
  }

  // ---------- bảng điều khiển ----------
  const STATUS = { done: ['Đã xong', 'Done'], open: ['Đang mở', 'Open now'], locked: ['Khóa', 'Locked'] };
  function tierStatus(p, k) { return J.tierDone(p, k) ? 'done' : J.canPlay(p, k) ? 'open' : 'locked'; }
  function resultLine(p, k) {
    const d = p.tiers[k]; if (!d || d.status !== 'done') return '';
    if (k === 't1') return t(`Hiệu quả ${d.eff}/100 · hạng ${d.rank}/4 · ${d.knownPairs ? d.knownPairs.length : 0} cặp món–địa điểm đã biết`, `Efficiency ${d.eff}/100 · rank ${d.rank}/4 · ${d.knownPairs ? d.knownPairs.length : 0} dish–place pairs known`);
    if (k === 't2') return t(`Kết thúc ${d.balanceEnd} triệu ₫ · thị phần ${d.shareEnd} % · ${d.profitableRounds}/6 vòng có lãi`, `Finished with ${d.balanceEnd}m ₫ · ${d.shareEnd}% share · ${d.profitableRounds}/6 profitable rounds`);
    return t(`Điểm ${d.total}/100${d.badges && d.badges.length ? ' · ' + d.badges.length + ' huy hiệu' : ''}`, `Score ${d.total}/100${d.badges && d.badges.length ? ' · ' + d.badges.length + ' badges' : ''}`);
  }
  function tierCard(p, k) {
    const d = C.TIER[k], st = tierStatus(p, k), variant = p.tiers.t3.variant || J.DEFAULT_T3_VARIANT;
    const name = C.tierName(k, lang(), variant), sub = t(d.subVi, d.subEn), prev = k === 't2' ? 1 : 2;
    const res = st === 'done' ? resultLine(p, k) : st === 'locked' ? t(`Xong Bậc ${prev} để mở.`, `Finish Level ${prev} to unlock.`) : t('Mở game, nhận hành trang (nếu có) và chơi như bình thường.', 'Open the game, take the carry-over (if any) and play as usual.');
    const link = C.gameLink(p, k, variant);
    const btn = st === 'open' ? `<a class="go" href="${esc(link)}" data-tier="${k}">${esc(t(`Chơi Bậc ${d.n} →`, `Play Level ${d.n} →`))}</a><a class="go alt" href="${esc(C.gameLink(p, k, variant, '3d'))}" data-tier="${k}" data-mode="3d">${esc(t('🧊 Bản 3D', '🧊 3D version'))}</a>`
      : st === 'done' ? `<a class="go off" aria-disabled="true" href="${esc(link)}">${esc(t('Đã hoàn thành', 'Completed'))}</a>`
      : `<span class="go off" aria-disabled="true">🔒 ${esc(t(`Bậc ${d.n}`, `Level ${d.n}`))}</span>`;
    return `<article class="jr-tier" data-tier="${k}" data-status="${st}"><div class="ic" aria-hidden="true">${d.icon}</div><span class="st">${esc(t(STATUS[st][0], STATUS[st][1]))}</span><h3>${esc(t(`Bậc ${d.n} · `, `Level ${d.n} · `))}${esc(name)}</h3><p class="sub">${esc(sub)}</p><p class="res">${esc(res)}</p>${btn}</article>`;
  }

  function renderDash(p) {
    const nt = J.nextTier(p), variant = p.tiers.t3.variant || J.DEFAULT_T3_VARIANT, role = p.tiers.t3.roleId || 'packer';
    $('jr-title').textContent = p.teamName;
    const graded = p.classCode && p.classCode !== 'TU-HOC' && p.classCode !== 'DEMO-2026';
    $('jr-meta').innerHTML = `<span>${esc(t('Lớp', 'Class'))}: <b>${esc(graded ? p.classCode : t('Tự học', 'Self-study'))}</b></span><span>·</span><span>${esc(t('Hộ chiếu', 'Passport'))}: <code>${esc(p.journeyId)}</code></span><span>·</span><span>${esc(nt ? t(`Bậc kế tiếp: ${C.TIER[nt].n}`, `Next level: ${C.TIER[nt].n}`) : t('Đã đi hết ba bậc 🎉', 'All three levels done 🎉'))}</span>`;
    $('jr-tiers').innerHTML = ['t1', 't2', 't3'].map(k => tierCard(p, k)).join('');

    // hành trang cho bậc kế tiếp (xem trước, không nút)
    const box = $('jr-carry-box');
    if (nt === 't2' || nt === 't3') {
      const enabled = J.resolveCarryEnabled(p, undefined);
      const carry = J.journeyCarry(p, nt, { variant, roleId: role, cashAdj: nt === 't3' && variant === 'durian' ? (C.DURIAN_ROLES[role] || {}).cashAdj || 0 : 0, enabled });
      $('jr-carry').innerHTML = C.html(carry, { lang: lang(), tier: nt, variant, buttons: false })
        + (graded && !enabled && carry.preview && Object.keys(carry.preview).length ? `<p class="jr-msg" style="text-align:center">${esc(t('Lớp chấm điểm: hành trang mặc định tắt cho công bằng; giảng viên bật trong cài đặt lớp thì game mới áp.', 'Graded class: carry-over is off by default for fairness; the game applies it only once the instructor enables it in the class settings.'))}</p>` : '');
      box.hidden = false;
    } else if (nt === 't1') { $('jr-carry').innerHTML = `<p class="sub" style="margin:0">${esc(t('Bậc 1 là điểm xuất phát: chưa có hành trang. Chơi xong Bến Phù Sa, hành trang vào Bật Nghiệp sẽ hiện ở đây.', 'Level 1 is the starting point: no carry-over yet. Finish Bến Phù Sa and the carry-over into Bật Nghiệp appears here.'))}</p>`; box.hidden = false; }
    else box.hidden = true;

    // nhìn lại cả hành trình (khi có ít nhất một bậc xong)
    const doneTiers = ['t1', 't2', 't3'].filter(k => J.tierDone(p, k));
    $('jr-timeline-box').hidden = !doneTiers.length;
    if (doneTiers.length) {
      const CARRY = { t2: p.carry.t2, t3: p.carry.t3 };
      const carryLine = k => { const c = CARRY[k]; if (!c || !Object.keys(c).length) return '';
        if (k === 't2') return t(`Mang sang Bậc 2: vốn ${c.balance} triệu ₫ (+${c.balanceBonus}), thương hiệu ×${c.brand}${c.marketBrief ? ', bản tin thị trường' : ''}`, `Carried into Level 2: capital ${c.balance}m ₫ (+${c.balanceBonus}), brand ×${c.brand}${c.marketBrief ? ', market brief' : ''}`);
        return t(`Mang sang Bậc 3: vốn ×${c.cashMul} = ${c.cash} tỷ ₫, uy tín +${c.rep}, chống chịu ${c.resil >= 0 ? '+' : ''}${c.resil}${c.adapt != null ? ', ứng phó +' + c.adapt : ''}${c.capab != null ? ', năng lực +' + c.capab : ''}${c.linkedBonus ? ', hợp đồng liên kết' : ''}${c.net && c.net.length ? ', mạng lưới +' + c.net[0].add : ''}`, `Carried into Level 3: cash ×${c.cashMul} = ${c.cash}bn ₫, reputation +${c.rep}, resilience ${c.resil >= 0 ? '+' : ''}${c.resil}${c.adapt != null ? ', response +' + c.adapt : ''}${c.capab != null ? ', capability +' + c.capab : ''}${c.linkedBonus ? ', linked contract' : ''}${c.net && c.net.length ? ', network +' + c.net[0].add : ''}`); };
      $('jr-timeline').innerHTML = doneTiers.map(k => { const d = C.TIER[k], next = k === 't1' ? 't2' : k === 't2' ? 't3' : null, cl = next && J.tierDone(p, k) ? carryLine(next) : '';
        return `<li><div class="ic" aria-hidden="true">${d.icon}</div><div><b>${esc(t(`Bậc ${d.n} · `, `Level ${d.n} · `))}${esc(C.tierName(k, lang(), variant))}</b><span>${esc(resultLine(p, k))}</span>${cl ? `<em class="carry">→ ${esc(cl)}</em>` : ''}</div></li>`; }).join('');
    }
    // chỉ số nghiên cứu
    const sm = p.summary || {}, keys = Object.keys(sm);
    $('jr-summary-box').hidden = !keys.length;
    if (keys.length) {
      const L = { effectuationIndex: ['Chỉ số effectuation', 'Effectuation index', 'tỷ lệ tuần gánh/khảo sát ở Bậc 1', 'share of cart/survey weeks in Level 1'], causationIndex: ['Chỉ số causation', 'Causation index', 'tỷ lệ vòng dùng dự báo what-if ở Bậc 2', 'share of rounds using what-if forecasts in Level 2'], intlPattern: ['Kiểu quốc tế hóa', 'Internationalisation pattern', 'thứ tự vào thị trường/kênh ở Bậc 3', 'order of markets/channels entered in Level 3'] };
      $('jr-summary').innerHTML = keys.map(k => `<div><b>${esc(typeof sm[k] === 'number' ? sm[k].toFixed(2) : sm[k])}</b><span>${esc(t(L[k][0], L[k][1]))} · ${esc(t(L[k][2], L[k][3]))}</span></div>`).join('');
    }

    // cài đặt
    const t3done = p.tiers.t3.status === 'done';
    document.querySelectorAll('#jr-variant input').forEach(r => { r.checked = r.value === variant; r.disabled = t3done; });
    roleOptions($('jr-role2'), role); $('jr-role2').disabled = t3done; $('jr-role2-wrap').style.display = variant === 'durian' ? '' : 'none';
    $('jr-variant-note').textContent = t3done ? t('Bậc 3 đã xong, không đổi biến thể nữa.', 'Level 3 is done; the variant can no longer change.') : '';
    $('jr-carry-on').checked = p.carryEnabled !== false;
  }

  // Đồng bộ với lớp (J7): hộp đăng nhập sinh viên + nút đồng bộ; tự đồng bộ một lần khi đã đăng nhập.
  function bindSync() {
    const Y = window.BizOnJourneySync, box = $('jr-sync'); if (!box) return;
    if (!Y || !Y.available()) { box.hidden = true; return; }
    box.hidden = false;
    let syncing = false;
    const run = async (opts, quiet) => {
      if (syncing) return; if (!Y.signedIn()) { if (!quiet) msg('jr-sync-msg', t('Đăng nhập email trường ở khung trên trước đã.', 'Sign in with your school email above first.')); return; }
      syncing = true;
      try {
        const r = await Y.sync(opts);
        if (r.action === 'conflict') {
          const srvTeam = (r.server && r.server.teamName) || '?', srvAt = r.server && r.server.updatedAt ? new Date(r.server.updatedAt).toLocaleString() : '';
          const takeServer = confirm(t(`Trên máy chủ đang có một hộ chiếu khác của đội này (${srvTeam}, cập nhật ${srvAt}). Bấm OK để LẤY bản máy chủ về (bản trên máy này bị thay), Cancel để GIỮ bản máy này và ghi đè máy chủ.`, `The server holds a different passport for this team (${srvTeam}, updated ${srvAt}). OK = TAKE the server copy (this device's copy is replaced); Cancel = KEEP this device's copy and overwrite the server.`));
          const r2 = await Y.sync({ resolve: takeServer ? 'pull' : 'push' }); render();
          msg('jr-sync-msg', r2.action === 'pull' ? t('Đã lấy hộ chiếu từ máy chủ.', 'Passport taken from the server.') : t('Đã ghi hộ chiếu của máy này lên máy chủ.', 'This device’s passport saved to the server.'), true);
        } else if (r.action === 'pull') { render(); msg('jr-sync-msg', r.mine === false ? t('Đã lấy hộ chiếu mới hơn của đội từ máy chủ.', 'Took the team’s newer passport from the server.') : t('Đã lấy bản mới hơn từ máy chủ.', 'Took the newer copy from the server.'), true); }
        else if (r.action === 'push') msg('jr-sync-msg', t('Đã lưu hộ chiếu lên máy chủ lớp.', 'Passport saved to the class server.'), true);
        else if (r.action === 'same') msg('jr-sync-msg', t('Máy này và máy chủ đã giống nhau.', 'This device and the server already match.'), true);
      } catch (e) { msg('jr-sync-msg', t('Không đồng bộ được: ', 'Could not sync: ') + (e && e.message ? e.message : e)); }
      syncing = false;
    };
    if (window.StudentLogin && $('jr-login')) StudentLogin.mount($('jr-login'), { onChange: () => { if (Y.signedIn()) run(null, true); } });
    $('jr-sync-now').addEventListener('click', () => run(null, false));
    if (Y.signedIn()) run(null, true);
  }

  function bindDash() {
    $('jr-variant').addEventListener('change', e => { if (e.target.name !== 'variant2') return; S.update(p => J.setTier3Variant(p, e.target.value, $('jr-role2').value)); render(); });
    $('jr-role2').addEventListener('change', e => { S.update(p => J.setTier3Variant(p, p.tiers.t3.variant, e.target.value)); render(); });
    $('jr-carry-on').addEventListener('change', e => { S.update(p => { p.carryEnabled = !!e.target.checked; return p; }); render(); });
    $('jr-export').addEventListener('click', () => {
      const p = S.load(); if (!p) return;
      const blob = new Blob([S.exportJson(p)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'hanh-trinh-' + p.journeyId + '.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000); msg('jr-msg', t('Đã xuất tệp hộ chiếu.', 'Passport file exported.'), true);
    });
    $('jr-import').addEventListener('change', e => importFile(e.target, 'jr-msg'));
    // CSV ẩn danh một dòng cho thiết kế nghiên cứu: journeyId băm (FNV-1a), không email/tên; chỉ số và vài số liệu chính.
    $('jr-csv').addEventListener('click', () => {
      const p = S.load(); if (!p) return;
      let h = 2166136261; for (const ch of String(p.journeyId)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } const hid = (h >>> 0).toString(16).padStart(8, '0');
      const t1 = p.tiers.t1 || {}, t2 = p.tiers.t2 || {}, t3 = p.tiers.t3 || {}, sm = p.summary || {};
      const cols = ['journey_hash', 'carry_enabled', 't1_eff', 't1_rank', 't1_explore_weeks', 't1_survey_weeks', 't2_balance_end', 't2_share_end', 't2_profitable_rounds', 't2_case', 't3_variant', 't3_total', 'explain_t1', 'explain_t2', 'explain_t3', 'effectuation_index', 'causation_index', 'intl_pattern'];
      const vals = [hid, p.carryEnabled !== false ? 1 : 0, t1.eff ?? '', t1.rank ?? '', t1.style ? t1.style.exploreWeeks : '', t1.style ? t1.style.surveyWeeks : '', t2.balanceEnd ?? '', t2.shareEnd ?? '', t2.profitableRounds ?? '', t2.caseId ?? '', t3.variant ?? '', t3.total ?? '', t1.explain ?? '', t2.explain ?? '', t3.explain ?? '', sm.effectuationIndex ?? '', sm.causationIndex ?? '', sm.intlPattern ?? ''];
      const csv = cols.join(',') + '\n' + vals.map(v => String(v).replace(/[",\n]/g, ' ')).join(',') + '\n';
      const blob = new Blob([csv], { type: 'text/csv' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'hanh-trinh-' + hid + '.csv'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000); msg('jr-msg', t('Đã xuất CSV ẩn danh.', 'Anonymised CSV exported.'), true);
    });
    bindSync();
    $('jr-reset').addEventListener('click', () => {
      if (!confirm(t('Xóa hộ chiếu này và bắt đầu hành trình mới? Kết quả đã ghi trong hộ chiếu sẽ mất (các ván game không bị ảnh hưởng).', 'Delete this passport and start a new journey? Results recorded in the passport are lost (game saves are not affected).'))) return;
      S.clear(); render();
    });
  }

  // clayRefreshLang() phát lại 'bizon:langchange' → render(): chặn đệ quy bằng cờ busy (sự kiện phát đồng bộ).
  let busy = false;
  function render() {
    if (busy) return; busy = true;
    try {
      const p = S.load();
      $('jr-setup').hidden = !!p; $('jr-dash').hidden = !p;
      if (p) renderDash(p); else roleOptions($('jr-role'), $('jr-role').value || 'packer');
      if (typeof window.clayRefreshLang === 'function') window.clayRefreshLang();
    } finally { busy = false; }
  }

  bindSetup(); bindDash(); render();
  window.addEventListener('bizon:langchange', render);
  window.__jrRender = render; // cho kiểm thử
})();
