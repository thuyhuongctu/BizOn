/* VietLens — hiển thị lớp dữ liệu thật (Nấc 1).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 * Đọc window.VIETLENS_OFFICIAL (sinh bởi tools/build_official.py). Không gọi mạng.
 */
(function () {
  'use strict';
  const O = window.VIETLENS_OFFICIAL;
  const host = document.getElementById('officialGrid');
  if (!O || !host) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = (x, d) => Number(x).toLocaleString('vi-VN', { maximumFractionDigits: d, minimumFractionDigits: d });
  const sign = (x) => (x > 0 ? '+' : '') + nf(x, 1) + '%';
  const qLabel = (q) => /^\d{4}Q\d$/.test(q) ? `Q${q.slice(-1)}/${q.slice(0, 4)}` : q;
  const ytdLabel = (q) => ({ 1: '3 tháng', 2: '6 tháng', 3: '9 tháng', 4: 'cả năm' }[q.slice(-1)] + ' ' + q.slice(0, 4));

  function barChart(obs, unit) {
    const pts = obs.filter((o) => o.value !== null);
    const W = 640, H = 170, L = 34, B = 22, max = Math.max(...pts.map((o) => o.value)) * 1.08;
    const bw = (W - L - 6) / pts.length;
    const y = (v) => 8 + (1 - v / max) * (H - B - 8);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ cột theo quý, ${esc(unit)}">`;
    [0, 0.5, 1].forEach((f) => { const v = max * f; s += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${L - 4}" y="${y(v) + 4}" text-anchor="end">${nf(v, 0)}</text>`; });
    pts.forEach((o, i) => {
      s += `<rect x="${L + i * bw + 1}" y="${y(o.value)}" width="${Math.max(1, bw - 2)}" height="${y(0) - y(o.value)}" rx="1.5"><title>${qLabel(o.period)}: ${nf(o.value, 2)} ${esc(unit)}</title></rect>`;
      if (o.period.endsWith('Q1') && +o.period.slice(0, 4) % 2 === 0 && L + i * bw < W - 30) s += `<text x="${L + i * bw}" y="${H - 6}">${o.period.slice(0, 4)}</text>`;
    });
    return s + '</svg>';
  }

  function lineChart(obs, unit) {
    const W = 640, H = 170, L = 34, B = 22;
    const vals = obs.map((o) => o.value), lo = Math.min(...vals) * 0.97, hi = Math.max(...vals) * 1.03;
    const x = (i) => L + i * (W - L - 6) / (obs.length - 1), y = (v) => 8 + (1 - (v - lo) / (hi - lo)) * (H - B - 8);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ đường theo quý, ${esc(unit)}">`;
    [lo, (lo + hi) / 2, hi].forEach((v) => { s += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${L - 4}" y="${y(v) + 4}" text-anchor="end">${nf(v, 0)}</text>`; });
    s += `<polyline points="${obs.map((o, i) => `${x(i)},${y(o.value)}`).join(' ')}"/>`;
    obs.forEach((o, i) => { if (o.period.endsWith('Q1') && +o.period.slice(0, 4) % 2 === 0 && x(i) < W - 30) s += `<text x="${x(i)}" y="${H - 6}">${o.period.slice(0, 4)}</text>`; });
    return s + '</svg>';
  }

  const VI = { Japan: 'Nhật Bản', Taiwan: 'Đài Loan', Singapore: 'Singapore', 'Republic of Korea': 'Hàn Quốc', 'British Virgin Islands': 'Quần đảo Virgin (Anh)',
    'Hong Kong SAR': 'Hồng Kông', 'United States': 'Hoa Kỳ', Malaysia: 'Malaysia', 'China (mainland)': 'Trung Quốc' };
  function hbar(obs) {
    const max = Math.max(...obs.map((o) => o.value));
    return `<div class="hbars">${obs.map((o) => `<div class="hb"><span>${esc(VI[o.period] || o.period)}</span><i style="width:${(100 * o.value / max).toFixed(1)}%"></i><b>${nf(o.value, 1)} · ${nf(o.share, 1)}%</b></div>`).join('')}</div>`;
  }

  function factsTable(obs) {
    const name = { xuat_khau_sau_rieng: 'Kim ngạch xuất khẩu', thi_phan_tq_gia_tri: 'Thị phần giá trị tại Trung Quốc', gia_xk_tq_vn: 'Giá XK sang TQ — Việt Nam', gia_xk_tq_th: 'Giá XK sang TQ — Thái Lan' };
    return `<table class="facts"><tbody>${obs.map((o) => `<tr><td>${esc(o.period)}</td><td>${esc(name[o.metric] || o.metric)}</td><td class="n">${nf(o.value, o.value % 1 ? 1 : 0)} ${esc(o.unit)}</td></tr>`).join('')}</tbody></table>`;
  }

  function headline(s) {
    const l = s.latest;
    if (s.id.startsWith('fdi_') && l.ytd !== undefined) return `<b>${nf(l.ytd, 2)} tỷ USD</b><span>${ytdLabel(l.period)}${l.ytdYoY !== null ? ` · <em class="${l.ytdYoY >= 0 ? 'up' : 'down'}">${sign(l.ytdYoY)} so cùng kỳ</em>` : ''}${l.share != null ? ` · chiếm ${nf(l.share, 1)}% tổng kim ngạch` : ''}</span>`;
    if (s.chart === 'hbar') return `<b>${nf(l.total, 1)} tỷ USD</b><span>tổng, mọi đối tác</span>`;
    if (s.chart === 'line') return `<b>${nf(l.value, 1)}</b><span>${qLabel(l.period)} · <em class="${l.yoy >= 0 ? 'up' : 'down'}">${sign(l.yoy)} so cùng kỳ</em></span>`;
    return `<b>${nf(l.value, 0)} triệu USD</b><span>năm ${esc(l.period)}</span>`;
  }

  function evidence(s) {
    const withQuote = s.observations.filter((o) => o.quote);
    if (!withQuote.length) return '';
    return `<details><summary>Xem ${withQuote.length} điểm số liệu kèm trích dẫn nguyên văn</summary><div class="table-wrap"><table><thead><tr><th>Kỳ</th><th>Số</th><th>Trích dẫn</th><th>Nguồn</th></tr></thead><tbody>
      ${withQuote.slice().reverse().map((o) => `<tr><td>${esc(VI[o.period] || qLabel(o.period))}</td><td class="n">${o.ytd !== undefined ? nf(o.ytd, 2) : nf(o.value, 1)}</td><td class="q">«${esc(o.quote)}»</td><td>${o.url ? `<a href="${esc(o.url)}" rel="noopener" target="_blank">mở</a>` : esc(o.source)}</td></tr>`).join('')}
    </tbody></table></div></details>`;
  }

  function card(s) {
    const chart = s.chart === 'bar' ? barChart(s.observations, s.unit) : s.chart === 'line' ? lineChart(s.observations, s.unit)
      : s.chart === 'hbar' ? hbar(s.observations) : factsTable(s.observations);
    const note = s.chart === 'bar' ? '<p class="cap">Cột = dòng vốn từng quý (tỷ USD), suy từ số lũy kế công bố.</p>' : '';
    return `<article class="panel ocard" id="o-${esc(s.id)}">
      <header><div><p class="eyebrow">SỐ LIỆU THẬT · ${esc(s.frequency.toUpperCase())}</p><h3>${esc(s.label)}</h3></div><span class="badge ok">có xuất xứ</span></header>
      <div class="ohead">${headline(s)}</div>
      ${chart}${note}
      <dl class="prov-dl">
        <dt>Nguồn</dt><dd>${esc(s.source)}</dd>
        <dt>Phương pháp</dt><dd>${esc(s.method)}</dd>
        <dt>Giới hạn</dt><dd>${esc(s.limitation)}</dd>
        <dt>Quyền tái phân phối</dt><dd>${esc(s.rights)}</dd>
      </dl>
      ${evidence(s)}
    </article>`;
  }

  host.innerHTML = O.series.map(card).join('');

  // Ghi các nguồn thật vào sổ nguồn ở mục Kiểm định
  const tbody = document.querySelector('#provenanceTable tbody');
  if (tbody) {
    const seen = new Set();
    O.series.forEach((s) => {
      const key = s.source.split(' — ')[0];
      if (seen.has(key)) return; seen.add(key);
      tbody.insertAdjacentHTML('beforeend', `<tr class="real"><td>${esc(key)} <b>· thật</b></td><td>${esc(s.domain)}</td><td>công khai, có trích dẫn</td><td>available</td><td>${esc(s.frequency)}</td><td>${esc(s.rights)}</td></tr>`);
    });
  }
  const meta = document.getElementById('officialMeta');
  if (meta) meta.textContent = `${O.series.length} chuỗi · ${O.series.reduce((n, s) => n + s.observations.length, 0)} điểm số liệu · dựng ngày ${O.builtAt}. ${O.excluded}`;
})();
