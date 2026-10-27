/* Hành trình 3 bậc – «Cuốn hộ chiếu»: bìa + ba trang thị thực, tem đóng dần theo bậc đã xong; vẽ được ra PNG để tải/in.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 * Phụ thuộc (nạp trước): js/core/journey.js, js/journey-card.js. Dùng ở hanh-trinh.html (js/hanh-trinh.js).
 * API: BizOnJourneyPassport.html(p, { lang }) → chuỗi HTML; .lines(p, tier, lang) → mảng dòng kết quả; .draw(canvas, p, { lang });
 *      .png(p, { lang }) → Promise<Blob>; .fileName(p). */
(function (root) {
  'use strict';
  const J = root.BizOnJourney, C = root.BizOnJourneyCard;
  if (!J || !C) return;
  const esc = C.esc, TIERS = ['t1', 't2', 't3'];
  const T = (lang, vi, en) => (lang === 'en' ? en : vi);
  const fmtDate = (iso, lang) => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d)) return String(iso).slice(0, 10); const dd = String(d.getDate()).padStart(2, '0'), mm = String(d.getMonth() + 1).padStart(2, '0'); return lang === 'en' ? `${d.getFullYear()}-${mm}-${dd}` : `${dd}/${mm}/${d.getFullYear()}`; };
  const variantOf = p => (p.tiers.t3 && p.tiers.t3.variant) || J.DEFAULT_T3_VARIANT;
  const graded = p => !!(p.classCode && p.classCode !== 'TU-HOC' && p.classCode !== 'DEMO-2026');

  // Dòng kết quả in trên trang thị thực của từng bậc (2–3 dòng ngắn, không công thức).
  function lines(p, k, lang) {
    const d = p.tiers[k]; if (!d || d.status !== 'done') return [];
    if (k === 't1') return [T(lang, `Hiệu quả ${d.eff}/100 · hạng ${d.rank}/4`, `Efficiency ${d.eff}/100 · rank ${d.rank}/4`), T(lang, `${d.knownPairs ? d.knownPairs.length : 0} cặp món–địa điểm đã biết`, `${d.knownPairs ? d.knownPairs.length : 0} dish–place pairs learnt`)];
    if (k === 't2') return [T(lang, `Kết thúc ${d.balanceEnd} triệu ₫ · thị phần ${d.shareEnd} %`, `Finished ${d.balanceEnd}m ₫ · ${d.shareEnd}% share`), T(lang, `${d.profitableRounds}/6 vòng có lãi · kịch bản ${d.caseId || 'A'}`, `${d.profitableRounds}/6 profitable rounds · case ${d.caseId || 'A'}`)];
    const out = [T(lang, `Điểm ${d.total}/100`, `Score ${d.total}/100`)];
    if (d.variant === 'brand') out.push(T(lang, `${(d.entered || []).filter(x => x != null).length} thị trường đã vào · uy tín ${d.repEnd}`, `${(d.entered || []).filter(x => x != null).length} markets entered · reputation ${d.repEnd}`));
    else out.push(T(lang, `${(d.badges || []).length} huy hiệu · ${(d.channelOrder || []).length} kênh`, `${(d.badges || []).length} badges · ${(d.channelOrder || []).length} channels`));
    return out;
  }

  function status(p, k) { return J.tierDone(p, k) ? 'done' : J.canPlay(p, k) ? 'open' : 'locked'; }
  function doneCount(p) { return TIERS.filter(k => J.tierDone(p, k)).length; }
  function finishedAt(p) { const t = p.tiers.t3 && p.tiers.t3.finishedAt; return t || ''; }

  function page(p, k, lang) {
    const d = C.TIER[k], st = status(p, k), v = variantOf(p), name = C.tierName(k, lang, v), sub = T(lang, d.subVi, d.subEn);
    const ls = lines(p, k, lang), when = fmtDate(p.tiers[k].finishedAt, lang);
    const stamp = st === 'done'
      ? `<div class="jp-stamp" role="img" aria-label="${esc(T(lang, 'Đã hoàn thành', 'Completed'))} ${esc(when)}"><b>${esc(T(lang, 'ĐÃ HOÀN THÀNH', 'COMPLETED'))}</b><span>${esc(when)}</span><i>BIZON · ${esc(T(lang, 'BẬC', 'LEVEL'))} ${d.n}</i></div>`
      : `<div class="jp-stamp jp-empty" aria-hidden="true"><span>${esc(st === 'open' ? T(lang, 'chờ đóng dấu', 'awaiting stamp') : T(lang, 'chưa mở', 'locked'))}</span></div>`;
    return `<article class="jp-page" data-tier="${k}" data-status="${st}"><header><span class="jp-visa">${esc(T(lang, 'THỊ THỰC', 'VISA'))} · ${esc(T(lang, 'BẬC', 'LEVEL'))} ${d.n}/3</span><span class="jp-ic" aria-hidden="true">${d.icon}</span></header>` +
      `<h3>${esc(name)}</h3><p class="jp-sub">${esc(sub)}</p>` +
      (ls.length ? `<ul class="jp-lines">${ls.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="jp-wait">${esc(st === 'open' ? T(lang, 'Chơi xong bậc này để nhận tem.', 'Finish this level to earn the stamp.') : T(lang, `Mở sau khi xong Bậc ${d.n - 1}.`, `Unlocks after Level ${d.n - 1}.`))}</p>`) +
      stamp + `</article>`;
  }

  function html(p, opts) {
    const lang = (opts && opts.lang) || 'vi', n = doneCount(p), all = n === 3;
    const cover = `<article class="jp-cover"><span class="jp-emblem" aria-hidden="true">🧭</span><p class="jp-kicker">BIZON · ${esc(T(lang, 'HÀNH TRÌNH 3 BẬC', '3-LEVEL JOURNEY'))}</p><h3>${esc(T(lang, 'HỘ CHIẾU HÀNH TRÌNH', 'JOURNEY PASSPORT'))}</h3><p class="jp-sub">${esc(T(lang, 'Từ Phù Sa ra Thế giới', 'From the River Silt to the World'))}</p>` +
      `<dl><dt>${esc(T(lang, 'Đội', 'Team'))}</dt><dd>${esc(p.teamName)}</dd><dt>${esc(T(lang, 'Lớp', 'Class'))}</dt><dd>${esc(graded(p) ? p.classCode : T(lang, 'Tự học', 'Self-study'))}</dd><dt>${esc(T(lang, 'Số', 'No.'))}</dt><dd><code>${esc(p.journeyId)}</code></dd><dt>${esc(T(lang, 'Cấp ngày', 'Issued'))}</dt><dd>${esc(fmtDate(p.createdAt, lang))}</dd></dl>` +
      `<p class="jp-progress" data-done="${n}">${esc(T(lang, `${n}/3 tem`, `${n}/3 stamps`))}</p></article>`;
    const ribbon = all ? `<p class="jp-ribbon" id="jp-ribbon">🎉 ${esc(T(lang, 'Đã đi hết ba bậc', 'All three levels completed'))} · ${esc(fmtDate(finishedAt(p), lang))}</p>` : '';
    return `<div class="jp-book" data-done="${n}" lang="${lang}">${cover}${TIERS.map(k => page(p, k, lang)).join('')}</div>${ribbon}`;
  }

  // ---------- PNG: 1600 × 1000, lưới 2 × 2 (bìa + ba trang) ----------
  const INK = '#1f2a44', TEAL = '#1f6f8a', GOLD = '#e7c27a', PAPER = '#fbf6ee', LINE = '#e6d6bf', RED = '#b8412f', MUTED = '#6b6f7a';
  const SANS = '"Be Vietnam Pro", Nunito, system-ui, sans-serif', HEAD = '"Baloo 2", "Be Vietnam Pro", system-ui, sans-serif';
  function rrect(x, y, w, h, r) { const c = this; c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function wrap(c, text, x, y, maxW, lh, max) { const words = String(text).split(' '); let line = '', n = 0; for (const w of words) { const test = line ? line + ' ' + w : w; if (c.measureText(test).width > maxW && line) { c.fillText(line, x, y); y += lh; line = w; if (++n >= (max || 9)) return y; } else line = test; } if (line) c.fillText(line, x, y); return y + lh; }
  function stampCanvas(c, cx, cy, lang, when, n) {
    c.save(); c.translate(cx, cy); c.rotate(-0.22); c.globalAlpha = 0.9;
    c.strokeStyle = RED; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 78, 0, Math.PI * 2); c.stroke(); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 66, 0, Math.PI * 2); c.stroke();
    c.fillStyle = RED; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `800 15px ${HEAD}`; c.fillText(T(lang, 'ĐÃ HOÀN THÀNH', 'COMPLETED'), 0, -16);
    c.font = `700 22px ${HEAD}`; c.fillText(when, 0, 10);
    c.font = `700 11px ${SANS}`; c.fillText(`BIZON · ${T(lang, 'BẬC', 'LEVEL')} ${n}`, 0, 34);
    c.restore();
  }
  function draw(canvas, p, opts) {
    const lang = (opts && opts.lang) || 'vi', W = 1600, H = 1000; canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d'); const rr = rrect.bind(c);
    c.fillStyle = '#f1e8d8'; c.fillRect(0, 0, W, H);
    const cells = [[20, 20], [820, 20], [20, 520], [820, 520]], CW = 760, CH = 460;
    // bìa
    { const [x, y] = cells[0]; rr(x, y, CW, CH, 28); c.fillStyle = '#153f4f'; c.fill(); c.strokeStyle = GOLD; c.lineWidth = 3; rr(x + 16, y + 16, CW - 32, CH - 32, 20); c.stroke();
      c.fillStyle = GOLD; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = `64px ${SANS}`; c.fillText('🧭', x + CW / 2, y + 120);
      c.font = `800 14px ${HEAD}`; c.fillText(`BIZON · ${T(lang, 'HÀNH TRÌNH 3 BẬC', '3-LEVEL JOURNEY')}`, x + CW / 2, y + 160);
      c.font = `800 40px ${HEAD}`; c.fillText(T(lang, 'HỘ CHIẾU HÀNH TRÌNH', 'JOURNEY PASSPORT'), x + CW / 2, y + 208);
      c.font = `italic 500 18px ${SANS}`; c.fillStyle = '#f3e7cf'; c.fillText(T(lang, 'Từ Phù Sa ra Thế giới', 'From the River Silt to the World'), x + CW / 2, y + 240);
      c.textAlign = 'left'; c.font = `700 15px ${SANS}`; c.fillStyle = '#cfe3e6';
      const rows = [[T(lang, 'Đội', 'Team'), p.teamName], [T(lang, 'Lớp', 'Class'), graded(p) ? p.classCode : T(lang, 'Tự học', 'Self-study')], [T(lang, 'Số', 'No.'), p.journeyId], [T(lang, 'Cấp ngày', 'Issued'), fmtDate(p.createdAt, lang)]];
      rows.forEach((r, i) => { c.fillStyle = '#9fc3c9'; c.fillText(r[0].toUpperCase(), x + 60, y + 300 + i * 30); c.fillStyle = '#fff'; c.font = `800 17px ${SANS}`; c.fillText(String(r[1]).slice(0, 48), x + 170, y + 300 + i * 30); c.font = `700 15px ${SANS}`; });
      c.textAlign = 'right'; c.fillStyle = GOLD; c.font = `800 18px ${HEAD}`; c.fillText(T(lang, `${doneCount(p)}/3 tem`, `${doneCount(p)}/3 stamps`), x + CW - 48, y + CH - 44); }
    // ba trang
    TIERS.forEach((k, i) => {
      const [x, y] = cells[i + 1], d = C.TIER[k], st = status(p, k), v = variantOf(p);
      rr(x, y, CW, CH, 28); c.fillStyle = PAPER; c.fill(); c.strokeStyle = LINE; c.lineWidth = 4; c.stroke();
      c.strokeStyle = '#efe4d0'; c.lineWidth = 1; for (let g = 1; g < 6; g++) { c.beginPath(); c.moveTo(x + 30, y + 150 + g * 44); c.lineTo(x + CW - 30, y + 150 + g * 44); c.stroke(); }
      c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = TEAL; c.font = `800 13px ${HEAD}`; c.fillText(`${T(lang, 'THỊ THỰC', 'VISA')} · ${T(lang, 'BẬC', 'LEVEL')} ${d.n}/3`, x + 40, y + 52);
      c.font = `44px ${SANS}`; c.textAlign = 'right'; c.fillText(d.icon, x + CW - 40, y + 72); c.textAlign = 'left';
      c.fillStyle = INK; c.font = `800 30px ${HEAD}`; c.fillText(C.tierName(k, lang, v), x + 40, y + 100);
      c.fillStyle = MUTED; c.font = `500 15px ${SANS}`; c.fillText(T(lang, d.subVi, d.subEn), x + 40, y + 128);
      c.fillStyle = INK; c.font = `600 17px ${SANS}`; let yy = y + 184;
      const ls = lines(p, k, lang);
      if (ls.length) ls.forEach(l => { yy = wrap(c, '• ' + l, x + 40, yy, CW - 280, 26, 2); });
      else { c.fillStyle = MUTED; c.font = `italic 500 16px ${SANS}`; wrap(c, st === 'open' ? T(lang, 'Chơi xong bậc này để nhận tem.', 'Finish this level to earn the stamp.') : T(lang, `Mở sau khi xong Bậc ${d.n - 1}.`, `Unlocks after Level ${d.n - 1}.`), x + 40, yy, CW - 280, 26, 2); }
      if (st === 'done') stampCanvas(c, x + CW - 150, y + CH - 140, lang, fmtDate(p.tiers[k].finishedAt, lang), d.n);
      else { c.save(); c.setLineDash([8, 8]); c.strokeStyle = '#cdbfa6'; c.lineWidth = 3; c.beginPath(); c.arc(x + CW - 150, y + CH - 140, 78, 0, Math.PI * 2); c.stroke(); c.restore(); c.fillStyle = '#b3a68f'; c.textAlign = 'center'; c.font = `700 13px ${SANS}`; c.fillText(st === 'open' ? T(lang, 'chờ đóng dấu', 'awaiting stamp') : T(lang, 'chưa mở', 'locked'), x + CW - 150, y + CH - 135); c.textAlign = 'left'; }
    });
    c.textAlign = 'center'; c.fillStyle = MUTED; c.font = `600 13px ${SANS}`; c.fillText(`bizonland.com · ${T(lang, 'Hành trình 3 bậc', '3-level journey')} · ${p.journeyId}`, W / 2, H - 6);
    return canvas;
  }
  function png(p, opts) {
    const canvas = document.createElement('canvas');
    const ready = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(() => {}) : Promise.resolve();
    return ready.then(() => new Promise((ok, fail) => { draw(canvas, p, opts); canvas.toBlob(b => (b ? ok(b) : fail(new Error('toBlob'))), 'image/png'); }));
  }
  const fileName = p => `ho-chieu-hanh-trinh-${String(p.journeyId).replace(/[^A-Za-z0-9-]+/g, '-')}.png`;

  root.BizOnJourneyPassport = Object.freeze({ html, lines, draw, png, fileName, doneCount });
})(typeof window !== 'undefined' ? window : globalThis);
