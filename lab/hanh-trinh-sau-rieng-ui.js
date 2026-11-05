/* Hành Trình Một Trái Sầu Riêng – giao diện cuộn. © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
   Dựng 7 thẻ chặng từ hanh-trinh-sau-rieng-data.js, ghi tiến độ cuộn vào window.__htTien cho cảnh 3D,
   ô «Dữ kiện có nguồn» đọc DurianData (Hộ Chiếu, chỉ đọc), 🔊 đọc bằng js/durian-voice.js. */
(function () {
  'use strict';
  const H = window.HanhTrinhData, DD = window.DurianData;
  const $ = s => document.querySelector(s);
  const lang = () => ((window.clayCurrentLang ? window.clayCurrentLang() : 'vi') === 'en' ? 'en' : 'vi');
  const L = (vi, en) => (lang() === 'en' ? en : vi);
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) {
      if (attrs[k] == null) continue;
      if (k === 'class') n.className = attrs[k];
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    for (const c of kids) if (c != null) n.append(c);
    return n;
  };
  const noi = t => { const v = window.DurianVoice; if (v && v.canSpeak) { v.stop(); v.say(t, 'NAR', lang()); } };

  function veDk(keys) {
    if (!DD) return null;
    const l = lang(), src = l === 'en' ? Object.assign({}, DD.sources, DD.sourcesEn) : DD.sources;
    const li = keys.filter(k => DD.facts[k]).map(k => { const f = DD.facts[k];
      return el('li', null, (f.v ? f.v + ' · ' : '') + (l === 'en' ? f.en : f.vi), el('small', null, L('Nguồn: ', 'Source: ') + (src[f.src] || f.src))); });
    return li.length ? el('details', { class: 'ht-dk' }, el('summary', null, L('📚 Dữ kiện có nguồn (', '📚 Sourced facts (') + li.length + ')'), el('ul', null, ...li)) : null;
  }

  function veChang() {
    const box = $('#ht-chang'); box.innerHTML = '';
    const ray = $('#ht-ray'); ray.innerHTML = '';
    H.CHANG.forEach((c, i) => {
      const t = H.tl(c, lang());
      const nghe = (window.DurianVoice && window.DurianVoice.canSpeak)
        ? el('button', { type: 'button', class: 'ht-loa', title: L('Nghe chặng này', 'Listen to this stage'), 'aria-label': L('Nghe chặng này', 'Listen to this stage'), onclick: () => noi(t.ten + '. ' + t.loi) }, '🔊') : null;
      box.append(el('section', { class: 'ht-buoc', id: 'chang-' + (i + 1), 'data-i': String(i), 'aria-labelledby': 'ht-h-' + i },
        el('article', { class: 'ht-the' },
          el('img', { class: 'ht-anh', src: '../assets/hc/' + c.anh, alt: '', width: '688', height: '384', loading: 'lazy', decoding: 'async' }),
          el('span', { class: 'clay-eyebrow' }, L('Chặng ', 'Stage ') + (i + 1) + ' / ' + H.CHANG.length),
          el('h2', { id: 'ht-h-' + i }, t.ten + ' ', nghe),
          el('p', null, t.loi),
          veDk(c.dk),
          c.lienKet ? el('a', { class: 'clay-btn clay-btn-orange ht-nut', href: c.lienKet }, t.nut) : null)));
      ray.append(el('li', null, el('a', { href: '#chang-' + (i + 1), 'aria-label': (i + 1) + '. ' + t.ten, title: t.ten }, String(i + 1))));
    });
    capNhat();
  }

  // Tiến độ: chặng có tâm gần giữa màn hình nhất; nội suy giữa hai chặng kề nhau để máy quay trôi mượt.
  let hen = 0;
  function capNhat() {
    hen = 0;
    const ds = [...document.querySelectorAll('.ht-buoc')]; if (!ds.length) return;
    const giua = innerHeight / 2, tam = ds.map(s => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; });
    let t = 0;
    if (giua <= tam[0]) t = 0;
    else if (giua >= tam[tam.length - 1]) t = tam.length - 1;
    else for (let i = 0; i < tam.length - 1; i++) if (giua >= tam[i] && giua <= tam[i + 1]) { t = i + (giua - tam[i]) / (tam[i + 1] - tam[i]); break; }
    window.__htTien = t;
    const dang = Math.round(t);
    document.querySelectorAll('#ht-ray a').forEach((a, i) => a.toggleAttribute('aria-current', i === dang));
    ds.forEach((s, i) => s.classList.toggle('dang', i === dang));
  }
  addEventListener('scroll', () => { if (!hen) hen = requestAnimationFrame(capNhat); }, { passive: true });
  addEventListener('resize', capNhat);
  window.addEventListener('bizon:langchange', veChang);
  veChang();
  window.HanhTrinh = { tien: () => window.__htTien };
})();
