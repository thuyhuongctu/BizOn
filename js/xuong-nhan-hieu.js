/* Xưởng Nhãn Hiệu Đặc Sản – phiếu bài chuyên cần chương 5 (Xây dựng nhãn hiệu & Marketing mix).
 * Đề bài © 2026 ThS. Đỗ Thùy Hương.
 *
 * Chạy hoàn toàn trên máy người dùng: không gửi dữ liệu đi đâu, bản nháp lưu ở localStorage.
 * Phần thuần (hints, progress, code, cardLines) không đụng DOM để test được bằng Node.
 */
(function (root) {
  'use strict';

  const T = (lang, vi, en) => (lang === 'en' ? en : vi);
  const norm = s => String(s || '').toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim();
  const words = s => norm(s).split(' ').filter(Boolean).length;
  const has = (s, list) => list.some(k => norm(s).includes(k));

  const CHANNELS = {
    online: [['shopee', 'Shopee', 'Shopee'], ['tiktok', 'TikTok Shop', 'TikTok Shop'], ['facebook', 'Facebook / Zalo', 'Facebook / Zalo'], ['web', 'Website riêng', 'Own website']],
    direct: [['hoicho', 'Hội chợ, phiên chợ', 'Fairs and markets'], ['ocop', 'Điểm OCOP, cửa hàng đặc sản', 'OCOP points, specialty shops'], ['taicho', 'Bán tại cơ sở, điểm du lịch', 'At the workshop, tourist spots']],
  };
  const PROMOS = [['cauchuyen', 'Câu chuyện sản phẩm', 'Product story'], ['video', 'Video ngắn', 'Short videos'], ['live', 'Livestream', 'Livestream'], ['koc', 'KOC / người dùng thật', 'KOCs / real users'], ['dungthu', 'Cho dùng thử', 'Free samples'], ['khaitruong', 'Ưu đãi khai trương', 'Launch offer'], ['hoicho', 'Gian hàng hội chợ', 'Fair booth']];
  const PRICES = [['tham-nhap', 'Thâm nhập (giá thấp để có khách đầu)', 'Penetration (low price to win first buyers)'], ['canh-tranh', 'Ngang giá thị trường', 'At market price'], ['gia-tri', 'Giá cao theo giá trị (quà tặng, thủ công)', 'Value-based premium (gifts, handmade)'], ['chi-phi', 'Chi phí cộng lãi', 'Cost-plus']];

  // Tên, slogan có sẵn trong đề – chỉ là ví dụ minh hoạ, không dùng lại.
  const EXAMPLES = ['hanoi brew', 'xanh sạch', 'hướng tới tương lai xanh'];
  const GENERIC = ['sạch', 'xanh', 'organic', 'hữu cơ', 'việt', 'quê', 'ngon', 'đặc sản', 'tự nhiên', 'green', 'fresh', 'natural', 'thiên nhiên', 'an toàn', 'quê hương'];
  const VAGUE = ['chất lượng cao', 'đáp ứng nhu cầu', 'tốt nhất', 'đa dạng', 'hiệu quả', 'hấp dẫn', 'phù hợp với thị trường', 'giá cạnh tranh', 'high quality', 'competitive price'];
  const KEY_CAPITAL = ['vốn', 'nhỏ', 'chi phí', 'tiết kiệm', 'ít tiền', 'khởi nghiệp', 'mới thành lập', 'doanh nghiệp mới', 'small', 'budget', 'capital', 'new business'];
  const KEY_DOMESTIC = ['trong nước', 'người việt', 'việt nam', 'người tiêu dùng', 'khách hàng', 'gia đình', 'giới trẻ', 'sinh viên', 'domestic', 'vietnamese', 'customers'];
  const KEY_DISTINCT = ['dễ nhớ', 'ngắn', 'gợi', 'khác biệt', 'nổi bật', 'địa phương', 'vùng', 'quê', 'văn hóa', 'văn hoá', 'truyền thống', 'memorable', 'local', 'tradition', 'distinct'];
  const hasNumber = s => /\d/.test(String(s || ''));

  /** Gợi ý theo từng ô. Trả về { field: [{ level: 'warn'|'ok', vi, en }] }. */
  function hints(s) {
    s = s || {};
    const out = {};
    const add = (f, level, vi, en) => (out[f] = out[f] || []).push({ level, vi, en });

    if (s.sanPham && !(s.tc1 && s.tc2 && s.tc3)) add('tieuchi', 'warn', 'Đánh dấu đủ ba tiêu chí. Nếu sản phẩm không đạt tiêu chí nào, nên đổi sản phẩm: đề bài bắt buộc chọn đặc sản địa phương.', 'Tick all three criteria. If the product fails one, pick another: the brief requires a local specialty.');
    if (s.sanPham && !norm(s.vung)) add('vung', 'warn', 'Ghi rõ vùng, tỉnh hoặc làng nghề. Đặc sản phải gắn với một nơi cụ thể.', 'Name the area, province or craft village. A specialty belongs to a specific place.');

    const ten = norm(s.ten);
    if (ten) {
      if (EXAMPLES.includes(ten)) add('ten', 'warn', 'Đây là ví dụ trong đề, hãy đặt tên của riêng bạn.', 'This is the example from the brief; create your own name.');
      else if (GENERIC.includes(ten) || ten.split(' ').every(w => GENERIC.includes(w))) add('ten', 'warn', 'Tên quá chung, nhiều doanh nghiệp đã dùng, khó nhớ và khó đăng ký nhãn hiệu.', 'Too generic: widely used, hard to remember and hard to register.');
      if (words(ten) > 4) add('ten', 'warn', 'Tên dài ' + words(ten) + ' chữ; nên 1–3 chữ để dễ nhớ, dễ in lên bao bì.', 'The name has ' + words(ten) + ' words; 1–3 is easier to remember and print.');
      if (!out.ten) add('ten', 'ok', 'Tên ngắn, riêng.', 'Short and distinctive.');
    }

    const sl = norm(s.slogan);
    if (sl) {
      if (EXAMPLES.includes(sl)) add('slogan', 'warn', 'Đây là slogan ví dụ trong đề, hãy viết slogan của riêng bạn.', 'This is the example slogan from the brief; write your own.');
      if (words(sl) > 10) add('slogan', 'warn', 'Slogan dài ' + words(sl) + ' chữ; nên dưới 10 chữ để đọc một lần là nhớ.', 'The slogan has ' + words(sl) + ' words; keep it under 10.');
      if (!out.slogan) add('slogan', 'ok', 'Độ dài vừa.', 'Good length.');
    }

    if (norm(s.giaiThich)) {
      if (words(s.giaiThich) < 20) add('giaiThich', 'warn', 'Giải thích còn ngắn; viết 2–4 câu.', 'Too short; write 2–4 sentences.');
      if (!has(s.giaiThich, KEY_CAPITAL)) add('giaiThich', 'warn', 'Chưa nói vì sao tên hợp với doanh nghiệp mới, vốn nhỏ (ví dụ: dễ làm bao bì, không tốn chi phí quảng bá để giải thích).', 'Say why it suits a new, small-budget business (e.g. cheap to print, needs no costly explaining).');
      if (!has(s.giaiThich, KEY_DOMESTIC)) add('giaiThich', 'warn', 'Chưa nhắc tới khách hàng trong nước: họ đọc tên và slogan thấy gì?', 'Mention domestic customers: what do they get from the name and slogan?');
      if (!has(s.giaiThich, KEY_DISTINCT)) add('giaiThich', 'warn', 'Chưa nói nét riêng: gắn với vùng, văn hoá hay điều gì làm tên dễ nhớ?', 'Say what makes it distinctive: the place, the culture, why it sticks.');
    }

    if (norm(s.product)) {
      if (has(s.product, VAGUE) && !hasNumber(s.product)) add('product', 'warn', 'Câu chung chung. Nêu cụ thể: nguyên liệu, cách làm, quy cách đóng gói, hạn dùng hoặc chứng nhận.', 'Too general. Be concrete: ingredients, method, pack size, shelf life or certification.');
      else if (words(s.product) < 12) add('product', 'warn', 'Thêm chi tiết: điều gì làm sản phẩm khác hàng cùng loại?', 'Add detail: what sets it apart from similar products?');
    }

    if (s.priceStrategy || norm(s.giaBan) || norm(s.priceReason)) {
      if (!s.priceStrategy) add('price', 'warn', 'Chọn một chiến lược giá.', 'Choose a pricing strategy.');
      if (!hasNumber(s.giaBan)) add('price', 'warn', 'Ghi giá bán dự kiến cho một quy cách, ví dụ 120.000 đ/hũ 500 g.', 'Give a planned price for one pack, e.g. 120,000 ₫ per 500 g jar.');
      if (norm(s.priceReason) && (words(s.priceReason) < 12 || (has(s.priceReason, VAGUE) && !hasNumber(s.priceReason)))) add('price', 'warn', 'Lý do cần cụ thể: so với giá đối thủ, chi phí một sản phẩm hoặc khách mục tiêu.', 'Justify concretely: competitor prices, unit cost or the target buyer.');
    }

    const place = s.place || [];
    if (place.length || norm(s.placeNote)) {
      const on = CHANNELS.online.some(c => place.includes(c[0])), off = CHANNELS.direct.some(c => place.includes(c[0]));
      if (!on || !off) add('place', 'warn', 'Đề bài ưu tiên cả kênh trực tuyến và trực tiếp; chọn ít nhất một kênh mỗi loại.', 'The brief favours both online and direct channels; pick at least one of each.');
      if (place.length > 4) add('place', 'warn', 'Doanh nghiệp vốn nhỏ khó lo nhiều kênh cùng lúc; nên bắt đầu với 2–3 kênh.', 'A small budget cannot run many channels; start with 2–3.');
    }

    const promo = s.promo || [];
    if (promo.length || norm(s.promoNote)) {
      if (promo.length < 2) add('promo', 'warn', 'Chọn ít nhất hai cách truyền thông bổ trợ nhau.', 'Pick at least two complementary tactics.');
      if (words(s.promoNote) < 15) add('promo', 'warn', 'Mô tả kế hoạch: làm gì trong tháng đầu, trên kênh nào, chi bao nhiêu.', 'Describe the plan: what in month one, on which channel, at what cost.');
    }
    return out;
  }

  /** Mức hoàn thành theo 8 phần của đề. */
  const PARTS = [
    ['sanPham', s => norm(s.sanPham) && s.nhom && norm(s.vung)],
    ['ten', s => norm(s.ten)], ['slogan', s => norm(s.slogan)], ['giaiThich', s => words(s.giaiThich) >= 20],
    ['product', s => words(s.product) >= 12], ['price', s => s.priceStrategy && hasNumber(s.giaBan) && norm(s.priceReason)],
    ['place', s => (s.place || []).length >= 1], ['promo', s => (s.promo || []).length >= 1 && norm(s.promoNote)],
  ];
  function progress(s) { s = s || {}; const done = PARTS.filter(p => p[1](s)).length; return { done, total: PARTS.length }; }

  /** Mã thẻ: băm nội dung bài (không gồm họ tên, MSSV). Hai bài giống hệt nhau cho cùng một mã. */
  const CONTENT = ['nhom', 'sanPham', 'vung', 'vanHoa', 'ten', 'slogan', 'giaiThich', 'product', 'priceStrategy', 'giaBan', 'priceReason', 'placeNote', 'promoNote'];
  function fnv(str, seed) { let h = seed >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  function code(s) {
    s = s || {};
    const body = CONTENT.map(k => norm(s[k])).join('|') + '|' + (s.place || []).slice().sort().join(',') + '|' + (s.promo || []).slice().sort().join(',');
    const hex = (fnv(body, 2166136261).toString(16).padStart(8, '0') + fnv(body, 2654435761).toString(16).padStart(8, '0')).toUpperCase();
    return 'XNH-' + hex.slice(0, 4) + '-' + hex.slice(4, 8);
  }

  const label = (list, id, lang) => { const f = list.find(x => x[0] === id); return f ? T(lang, f[1], f[2]) : ''; };
  const channelText = (s, lang) => (s.place || []).map(id => label(CHANNELS.online.concat(CHANNELS.direct), id, lang)).filter(Boolean).join(', ');
  const promoText = (s, lang) => (s.promo || []).map(id => label(PROMOS, id, lang)).filter(Boolean).join(', ');

  /** Nội dung thẻ (để vẽ và để test). */
  function cardLines(s, lang) {
    s = s || {};
    const nhom = s.nhom === 'thu-cong' ? T(lang, 'Thủ công truyền thống', 'Traditional craft') : s.nhom === 'nong-san' ? T(lang, 'Nông sản chế biến', 'Processed farm product') : '';
    return {
      brand: s.ten || T(lang, 'Tên thương hiệu', 'Brand name'),
      slogan: s.slogan || '',
      product: [s.sanPham, s.vung].filter(Boolean).join(' · '),
      nhom,
      why: s.giaiThich || '',
      p4: [
        [T(lang, 'Sản phẩm', 'Product'), s.product || ''],
        [T(lang, 'Giá', 'Price'), [label(PRICES, s.priceStrategy, lang), s.giaBan, s.priceReason].filter(Boolean).join(' – ')],
        [T(lang, 'Phân phối', 'Place'), [channelText(s, lang), s.placeNote].filter(Boolean).join('. ')],
        [T(lang, 'Truyền thông', 'Promotion'), [promoText(s, lang), s.promoNote].filter(Boolean).join('. ')],
      ],
      who: [s.hoTen, s.mssv, s.lop].filter(Boolean).join(' · '),
      code: code(s),
    };
  }

  // ---------- Vẽ thẻ (trình duyệt) ----------
  const SANS = '"Be Vietnam Pro", system-ui, sans-serif', HEAD = '"Plus Jakarta Sans", "Be Vietnam Pro", system-ui, sans-serif';
  function wrap(c, text, maxW, maxLines) {
    const out = []; let line = '';
    for (const w of String(text || '').split(/\s+/).filter(Boolean)) {
      const t = line ? line + ' ' + w : w;
      if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    }
    if (line) out.push(line);
    if (out.length > maxLines) { out.length = maxLines; out[maxLines - 1] = out[maxLines - 1].replace(/\s*\S*$/, '') + ' …'; }
    return out;
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  function draw(canvas, s, opts) {
    const lang = (opts && opts.lang) || 'vi', img = opts && opts.image;
    const W = 1240, H = 1754, P = 80; canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d'), L = cardLines(s, lang);
    c.fillStyle = '#FBF4E8'; c.fillRect(0, 0, W, H);
    // Đầu thẻ
    c.fillStyle = '#006687'; rrect(c, 40, 40, W - 80, 520, 44); c.fill();
    c.fillStyle = '#FFD58A'; c.font = `800 26px ${SANS}`; c.fillText(T(lang, 'THẺ THƯƠNG HIỆU · ĐẶC SẢN ĐỊA PHƯƠNG', 'BRAND CARD · LOCAL SPECIALTY'), P, 118);
    const textW = img ? W - P * 2 - 360 : W - P * 2;
    c.fillStyle = '#FFFFFF'; c.font = `800 88px ${HEAD}`;
    let y = 230; for (const l of wrap(c, L.brand, textW, 2)) { c.fillText(l, P, y); y += 96; }
    c.fillStyle = '#E6F6F8'; c.font = `italic 600 38px ${SANS}`;
    for (const l of wrap(c, L.slogan ? '«' + L.slogan + '»' : '', textW, 2)) { c.fillText(l, P, y + 6); y += 50; }
    c.fillStyle = '#FFD58A'; c.font = `700 28px ${SANS}`;
    for (const l of wrap(c, [L.nhom, L.product].filter(Boolean).join(' — '), textW, 2)) { c.fillText(l, P, Math.max(y + 40, 470)); y += 36; }
    if (img) {
      const bx = W - P - 320, by = 100, bs = 400;
      c.save(); rrect(c, bx, by, 320, bs, 28); c.clip();
      const r = Math.max(320 / img.width, bs / img.height), iw = img.width * r, ih = img.height * r;
      c.drawImage(img, bx + (320 - iw) / 2, by + (bs - ih) / 2, iw, ih); c.restore();
    }
    // Vì sao
    y = 620;
    c.fillStyle = '#C2581B'; c.font = `800 28px ${HEAD}`; c.fillText(T(lang, 'Vì sao nhãn hiệu này hợp với doanh nghiệp mới', 'Why this brand suits a new business'), P, y);
    c.fillStyle = '#033337'; c.font = `500 26px ${SANS}`; y += 44;
    for (const l of wrap(c, L.why, W - P * 2, 4)) { c.fillText(l, P, y); y += 36; }
    // 4P
    const top = Math.max(y + 30, 860), gw = (W - P * 2 - 30) / 2, gh = 330, fills = ['#DDF1E4', '#FFE6B8', '#D9F0F2', '#FDE1CE'];
    L.p4.forEach((p, i) => {
      const x = P + (i % 2) * (gw + 30), yy = top + Math.floor(i / 2) * (gh + 30);
      c.fillStyle = fills[i]; rrect(c, x, yy, gw, gh, 30); c.fill();
      c.fillStyle = '#033337'; c.font = `800 30px ${HEAD}`; c.fillText((i + 1) + ' · ' + p[0], x + 30, yy + 56);
      c.font = `500 24px ${SANS}`; let ly = yy + 100;
      for (const l of wrap(c, p[1] || "—", gw - 60, 7)) { c.fillText(l, x + 30, ly); ly += 32; }
    });
    // Chân thẻ
    c.fillStyle = '#3E5A5C'; c.font = `600 24px ${SANS}`;
    c.fillText(L.who || T(lang, 'Họ tên · MSSV · Lớp', 'Name · Student ID · Class'), P, H - 120);
    c.font = `700 24px "IBM Plex Mono", ui-monospace, monospace`; c.textAlign = 'right'; c.fillText(T(lang, 'Mã thẻ ', 'Card code ') + L.code, W - P, H - 120); c.textAlign = 'left';
    c.font = `500 20px ${SANS}`; c.fillStyle = '#3E5A5C';
    c.fillText(T(lang, 'bizonland.com · Xưởng Nhãn Hiệu Đặc Sản · Đề bài © 2026 ThS. Đỗ Thùy Hương', 'bizonland.com · Local Specialty Brand Lab · Brief © 2026 MSc Đỗ Thùy Hương'), P, H - 70);
    return canvas;
  }
  function png(canvas) { return new Promise((ok, fail) => canvas.toBlob(b => (b ? ok(b) : fail(new Error('toBlob'))), 'image/png')); }
  const fileName = s => 'the-thuong-hieu-' + (norm((s || {}).ten).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bizon') + '.png';

  root.BizOnBrandLab = Object.freeze({ hints, progress, code, cardLines, draw, png, fileName, CHANNELS, PROMOS, PRICES });
})(typeof window !== 'undefined' ? window : globalThis);
