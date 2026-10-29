/* CHAM – «Một ngày ở Tân Lộc»: tình huống kể qua 7 chương từ 05:00 đến 22:00. Thanh thời gian, tự chạy (4 giây/chương),
 * âm thanh nền tổng hợp bằng WebAudio (sông, chim ban ngày, côn trùng ban đêm; chỉ bật khi người dùng bấm). */
(function () {
  'use strict';
  const K = window.ChamKit, t = K.t, esc = K.esc;
  const L = (vi, en) => ({ vi, en });
  const C = [
    { h: 5, img: 'islet-overview', tag: L('NƠI CHỐN', 'THE PLACE'), title: L('Cù lao thức giấc', 'The islet wakes up'), art: L('sương trên vườn cây, xuồng trên mương', 'mist over the orchard, a canoe on the canal'),
      body: L('CHAM nằm trên cù lao Tân Lộc giữa sông Hậu, nơi giáp ranh Cần Thơ, An Giang và Đồng Tháp. Ở CHAM hoàn toàn không có bê tông cốt thép.', 'CHAM sits on Tân Lộc, an islet in the Hậu River where Cần Thơ, An Giang and Đồng Tháp meet. There is no reinforced concrete anywhere on the property.'),
      cards: [[L('Diện tích', 'Site'), L('9.000 m²', '9,000 m²'), L('Lân Thạnh 2, phường Tân Lộc, Thốt Nốt', 'Lân Thạnh 2, Tân Lộc ward, Thốt Nốt')], [L('Thành lập', 'Founded'), L('19/3/2018', '19 Mar 2018'), L('Hộ kinh doanh cá thể', 'Household business')], [L('Tổng vốn đầu tư', 'Total investment'), L('4 tỷ đồng', '4 billion đ'), L('Vốn chủ sở hữu 3,5 tỷ, vốn đầu tư 500 triệu', '3.5 billion own capital, 500 million invested')]] },
    { h: 8, img: 'chamomile-field', tag: L('VÉ TRONG NGÀY', 'DAY PASS'), title: L('Mở cổng đón khách', 'Gates open for day visitors'), art: L('đồng cúc la mã trắng, xe đạp', 'white chamomile field, bicycles'),
      body: L('Sản phẩm cốt lõi là một ngày làm nông dân: bắt cá bằng tay không, hái trái cây, trồng rau, dạo đồng hoa cúc la mã, đạp xe và đi ca nô quanh cù lao, chơi trò chơi dân gian.', 'The core product is a day on the farm: catch fish by hand, pick fruit, plant vegetables, walk the chamomile field, cycle and canoe around the islet, play folk games.'),
      cards: [[L('Vé vào cổng', 'Entrance'), L('80.000 đ', '80,000 đ'), L('Dưới 1 m miễn phí · 1–1,4 m 30.000 đ', 'Under 1 m free · 1–1.4 m 30,000 đ')], [L('Doanh thu vé năm 1', 'Year-1 ticket revenue'), L('576 triệu đ', '576 million đ'), L('7.200 lượt khách', '7,200 visitors')], [L('Khuyến mãi', 'Promotion'), L('Mua 7 tặng 1', 'Buy 7, get 1'), L('Chỉ năm đầu, không áp dụng cho đoàn', 'Year 1 only, not for tour groups')]] },
    { h: 11, img: 'huts', tag: L('AI ĐẾN', 'WHO COMES'), title: L('Ba nhóm khách', 'Three kinds of guest'), art: L('sinh viên, cặp đôi, gia đình ở cổng', 'students, couple, family at the gate'),
      body: L('Học sinh, sinh viên đi theo nhóm; người đi làm đi đôi hoặc nhóm nhỏ để thư giãn; gia đình muốn gần thiên nhiên mà không phải đi xa.', 'Students and young people travel in groups; young professionals come as couples or small groups to unwind; families want nature without travelling far.'),
      cards: [[L('Nhóm 1', 'Segment 1'), L('HS, SV 15–24 tuổi', 'Students 15–24'), L('Nhóm 5–10 người', 'Groups of 5–10')], [L('Nhóm 2', 'Segment 2'), L('Người đi làm 24–30', 'Workers 24–30'), L('Đi 2 người hoặc nhóm 4–5', 'Couples or groups of 4–5')], [L('Nhóm 3', 'Segment 3'), L('Gia đình', 'Families'), L('Từ Cần Thơ, Đồng Tháp, An Giang, Sài Gòn', 'From Cần Thơ, Đồng Tháp, An Giang, Sài Gòn')]] },
    { h: 13, img: 'hotpot', tag: L('ẨM THỰC', 'FOOD'), title: L('Bữa trưa chỉ Tân Lộc mới có', 'Lunch only Tân Lộc has'), art: L('nồi lẩu trên bàn tre', 'clay hotpot on a bamboo table'),
      body: L('Mắm cá tra chỉ có ở Tân Lộc. Khách có thể tự nấu bằng nguyên liệu tự thu hoạch; rau miễn phí, cá đồng bán giá trợ giá.', 'Mắm cá tra is made only on Tân Lộc. Guests can also cook with ingredients they pick; vegetables are free and field fish is sold at subsidised prices.'),
      cards: [[L('Món đặc sản', 'Signature'), L('150.000 đ', '150,000 đ'), L('Gà đá hầm sả · lẩu mắm cá tra', 'Gà đá hầm sả · lẩu mắm cá tra')], [L('Tự nấu', 'Cook-it-yourself'), L('Rau miễn phí', 'Vegetables free'), L('Cá lóc 100.000 đ/kg · cua đồng 50.000 đ/kg', 'Cá lóc 100,000 đ/kg · cua đồng 50,000 đ/kg')], [L('Mang về', 'Take home'), L('50.000 đ', '50,000 đ'), L('Tinh dầu cúc la mã, 15 ml', 'Chamomile oil, 15 ml')]] },
    { h: 17, img: 'canoe-pier', tag: L('KHOẢNG TRỐNG', 'THE GAP'), title: L('Phần lớn khách ra về', 'Most visitors leave'), art: L('thuyền quay về lúc hoàng hôn', 'boats heading back at sunset'),
      body: L('8 tháng đầu năm 2017, Cần Thơ đón trên 5,2 triệu lượt khách nhưng chỉ khoảng 1,3 triệu lượt lưu trú. Tân Lộc có nhiều điểm tham quan nhưng không có chỗ ngủ lại.', 'In the first 8 months of 2017, Cần Thơ had over 5.2 million visits but only about 1.3 million overnight stays. Tân Lộc had several attractions and nowhere to sleep.'),
      cards: [[L('Lượt khách Cần Thơ', 'Cần Thơ visits'), L('5,2 triệu', '5.2 million'), L('Tháng 1–8/2017', 'Jan–Aug 2017')], [L('Lượt lưu trú', 'Overnight stays'), L('1,3 triệu', '1.3 million'), L('Khoảng 1 trên 4', 'About 1 in 4')], [L('Đối thủ trên cù lao', 'Competitors on the islet'), L('4 điểm sinh thái', '4 eco-sites'), L('Sơn Ca, nhà cổ Trần Bá Thế, vườn dừa, vườn ổi', 'Sơn Ca, Trần Bá Thế house, coconut and guava gardens')]] },
    { h: 19, img: 'campfire', tag: L('LƯU TRÚ', 'THE STAY'), title: L('Những vị khách ở lại', 'The guests who stay'), art: L('lửa trại, đàn kìm, sân khấu nhỏ', 'campfire, đàn kìm, a small stage'),
      body: L('Nhà lợp lá, giường tre, tủ gỗ. Mỗi tối mở đầu bằng hai tiếng tân cổ, đờn ca tài tử và bolero, sau đó sân khấu dành cho khách.', 'Thatched roofs, bamboo beds, wooden wardrobes. Each evening opens with two hours of tân cổ, đờn ca tài tử and bolero, then the stage belongs to the guests.'),
      cards: [[L('Phòng', 'Rooms'), L('6 nhà lá', '6 thatched huts'), L('Homestay duy nhất trên Tân Lộc (năm 2017)', 'The only homestay on Tân Lộc (in 2017)')], [L('Giá phòng', 'Room price'), L('50.000 đ', '50,000 đ'), L('Theo kế hoạch; trang tình huống ghi 500.000 đ', 'Per the plan; the case page says 500,000 đ')], [L('Sự kiện hằng tháng', 'Monthly event'), L('Ngày 14', 'The 14th'), L('“Trở về tuổi thơ”: ô ăn quan với người thật hóa trang', '“Back to childhood” ô ăn quan with costumed players')]] },
    { h: 22, img: 'campfire', tag: L('CON SỐ', 'THE NUMBERS'), title: L('Đom đóm, và kết quả cuối cùng', 'Fireflies, and the bottom line'), art: L('đom đóm trên mương', 'fireflies over the canal'),
      body: L('Kế hoạch dự kiến doanh thu 1,76 tỷ đồng năm 1 và hòa vốn sau 5 tháng 23 ngày. Con số này chia cho 500 triệu, không phải tổng vốn 4 tỷ.', 'The plan projects revenue of 1.76 billion đ in year 1 and claims payback in 5 months 23 days. That figure divides by 500 million, not the 4 billion total.'),
      cards: [[L('Doanh thu năm 1', 'Year-1 revenue'), L('1.761 triệu đ', '1,761 million đ'), L('Ẩm thực là khoản lớn nhất', 'Food is the largest line')], [L('Lợi nhuận sau thuế năm 1', 'Year-1 profit after tax'), L('882,5 triệu đ', '882.5 million đ'), L('ROS 0,50', 'ROS 0.50')], [L('Hòa vốn trên 4 tỷ', 'Payback on 4 billion'), L('≈ 3,8 năm', '≈ 3.8 years'), L('Kế hoạch ghi 5 tháng 23 ngày', 'Plan states 5 months 23 days')]] }
  ];
  const S = { idx: 0, playing: false, sound: false };
  const pad = h => String(h).padStart(2, '0') + ':00';
  const root = K.$('#ds');
  let timer = null, ac = null, river, night, birdT;

  function palette(h) {
    return h < 7 ? ['#2a3f55', '#eef3f1', '#3a5670', '#34506a', 'rgba(255,255,255,.12)'] : h < 16 ? ['#f3ece1', '#123f4c', '#cfe7e9', '#fbf6ee', 'rgba(0,0,0,.08)']
      : h < 19 ? ['#f2b48c', '#3a1d10', '#f6c9b6', '#f8d3bd', 'rgba(0,0,0,.1)'] : ['#132c38', '#eef3f1', '#1d4654', '#1d4654', 'rgba(255,255,255,.1)'];
  }
  function render(anim) {
    const c = C[S.idx], h = c.h, p = palette(h);
    ['--bg', '--fg', '--panel', '--card', '--line'].forEach((k, i) => root.style.setProperty(k, p[i]));
    K.$('#ds-clock').textContent = pad(h);
    const r = K.$('#ds-range'); r.value = S.idx; r.setAttribute('aria-valuetext', pad(h) + ' · ' + t(c.title));
    K.$('#ds-text').innerHTML = '<div class="ds-tag">' + t({ vi: 'CHƯƠNG ', en: 'CHAPTER ' }) + (S.idx + 1) + ' / 7 · ' + t(c.tag) + '</div><h1>' + esc(t(c.title)) + '</h1><p class="ds-body">' + esc(t(c.body)) + '</p>';
    const img = K.$('#ds-img'); img.src = '../assets/cham/clay/' + c.img + '.png'; img.alt = t({ vi: 'Hình đất sét 3D: ', en: '3D clay render: ' }) + t(c.art);
    const day = Math.max(0, Math.min(16, h < 8 ? 0 : h < 14 ? Math.round((h - 7) * 2.6) : h < 18 ? Math.round(16 - (h - 14) * 4) : 0));
    K.$('#ds-dots').innerHTML = '<div class="top"><span>' + t({ vi: 'Đang ở trên cù lao', en: 'On the islet now' }) + '</span><span>' + t({ vi: day + ' khách trong ngày · 4 khách ở lại', en: day + ' day visitors · 4 staying' }) + '</span></div>' +
      '<div class="row" aria-hidden="true">' + Array.from({ length: 20 }, (_, k) => '<i style="background:' + (k < 4 ? '#0a9cc4' : '#f2c94c') + ';opacity:' + (k < 4 || k - 4 < day ? 1 : 0.15) + '"></i>').join('') + '</div>' +
      '<div class="leg"><span>' + t({ vi: 'vàng: vé trong ngày', en: 'yellow: day pass' }) + '</span><span>' + t({ vi: 'xanh: khách lưu trú', en: 'teal: overnight guests' }) + '</span></div>';
    K.$('#ds-cards').innerHTML = c.cards.map(([k, v, d]) => '<div><div class="k">' + t(k) + '</div><div class="v">' + t(v) + '</div><div class="d">' + t(d) + '</div></div>').join('');
    K.$('#ds-nav').innerHTML = C.map((x, k) => '<button type="button" data-i="' + k + '"' + (k === S.idx ? ' aria-current="true"' : '') + '><b>' + pad(x.h) + '</b><small>' + t(x.tag) + '</small></button>').join('');
    K.$('#ds-next').textContent = S.idx === 6 ? t({ vi: 'Xem lại từ đầu', en: 'Start again' }) : t({ vi: 'Muộn hơn →', en: 'Later →' });
    const sb = K.$('#ds-sound'); sb.textContent = S.sound ? t({ vi: 'Âm thanh: bật', en: 'Sound: on' }) : t({ vi: 'Âm thanh: tắt', en: 'Sound: off' }); sb.setAttribute('aria-pressed', String(S.sound));
    const pb = K.$('#ds-play'); pb.textContent = S.playing ? t({ vi: 'Tạm dừng', en: 'Pause' }) : t({ vi: 'Chạy cả ngày', en: 'Play the day' }); pb.setAttribute('aria-pressed', String(S.playing));
    if (anim && !K.reduced()) ['#ds-text', '#ds-cards'].forEach((s, i) => { const el = K.$(s); el.classList.remove('ds-anim'); void el.offsetWidth; el.style.animationDelay = i * 120 + 'ms'; el.classList.add('ds-anim'); });
    const bar = K.$('#ds-prog'); bar.getAnimations && bar.getAnimations().forEach(a => a.cancel());
    if (S.playing && bar.animate) bar.animate([{ width: '0%' }, { width: '100%' }], { duration: 4000, easing: 'linear', fill: 'forwards' });
    mood();
  }
  function go(i) { S.idx = Math.max(0, Math.min(6, i)); render(true); }

  /* ---- âm thanh nền ---- */
  function startSound() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ac = new AC(); const master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
    const len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
    river = ac.createGain(); src.connect(lp); lp.connect(river); river.connect(master); src.start();
    night = ac.createGain(); night.gain.value = 0; night.connect(master);
    const cr = ac.createOscillator(); cr.frequency.value = 4400; const am = ac.createOscillator(); am.frequency.value = 28; const amG = ac.createGain(); amG.gain.value = 0.5;
    const crG = ac.createGain(); crG.gain.value = 0.5; am.connect(amG); amG.connect(crG.gain); cr.connect(crG); crG.connect(night); cr.start(); am.start();
    birdT = setInterval(() => {
      const h = C[S.idx].h; if (!ac || h < 6 || h > 17 || Math.random() < 0.4) return;
      const o = ac.createOscillator(), g = ac.createGain(), tt = ac.currentTime;
      o.frequency.setValueAtTime(2400 + Math.random() * 1200, tt); o.frequency.exponentialRampToValueAtTime(1600 + Math.random() * 800, tt + 0.18);
      g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(0.05, tt + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.22);
      o.connect(g); g.connect(master); o.start(tt); o.stop(tt + 0.25);
    }, 900);
    return true;
  }
  function mood() { if (!ac) return; const h = C[S.idx].h, tt = ac.currentTime, nt = h >= 19 || h < 6; river.gain.setTargetAtTime(nt ? 0.35 : 0.6, tt, 0.8); night.gain.setTargetAtTime(nt ? 0.012 : 0, tt, 0.8); }
  function stopSound() { clearInterval(birdT); if (ac) { ac.close(); ac = null; } }

  K.$('#ds-range').addEventListener('input', e => go(+e.target.value));
  K.$('#ds-prev').addEventListener('click', () => go(S.idx - 1));
  K.$('#ds-next').addEventListener('click', () => go(S.idx === 6 ? 0 : S.idx + 1));
  K.$('#ds-nav').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) go(+b.dataset.i); });
  K.$('#ds-play').addEventListener('click', () => {
    S.playing = !S.playing; clearInterval(timer);
    if (S.playing) timer = setInterval(() => go((S.idx + 1) % 7), 4000);
    render(false);
  });
  K.$('#ds-sound').addEventListener('click', () => { if (S.sound) { stopSound(); S.sound = false; } else S.sound = startSound(); render(false); });
  document.addEventListener('keydown', e => { if (e.target.matches('input,textarea')) return; if (e.key === 'ArrowRight') go(S.idx + 1); else if (e.key === 'ArrowLeft') go(S.idx - 1); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.playing) { S.playing = false; clearInterval(timer); render(false); } });
  K.mount(() => render(false));
})();
