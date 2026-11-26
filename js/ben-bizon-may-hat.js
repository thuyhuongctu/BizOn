/* Bến BizOn – Máy hát (26/11/2026): chọn bài trên bến thay cho nút bật/tắt một bài.
 *   - «Có lời»: ca khúc gốc của BizOn (Đỗ Thùy Hương & Phan Anh Tú), lấy trong assets/audio/, tên theo Kho Âm nhạc (js/music-data.js).
 *     Hết bài tự sang bài kế trong nhóm.
 *   - «Không lời»: BizOn Theme, Bật Nghiệp (instrumental).
 *   - «Thư giãn»: âm thanh tạo ngay trong trình duyệt bằng Web Audio (không tải tệp, không có bản quyền của bên thứ ba):
 *     sóng alpha, sóng theta (hai tai lệch nhau 10 Hz / 6 Hz, nên đeo tai nghe), mưa nhẹ. Chỉ để nghỉ ngơi:
 *     KHÔNG nói là chữa đau đầu hay điều trị gì; trang có ghi chú rõ điều này.
 *   - Viên «đang phát» (#bb-mh-chip) ở góc trái dưới: bấm để dừng nhạc ở bất cứ đâu trên bến.
 * Mô-đun chỉ lo phát nhạc và vẽ bảng; ben-bizon.js lo mở bảng, dừng di chuyển, giảm tiếng bến sông khi có nhạc. */
export const NHOM = [
  { id: 'loi', ten: { vi: '🎤 Có lời', en: '🎤 With lyrics' } },
  { id: 'khong', ten: { vi: '🎼 Không lời', en: '🎼 Instrumental' } },
  { id: 'thu-gian', ten: { vi: '🌿 Thư giãn', en: '🌿 Relax' },
    ghi: { vi: 'Âm thanh tạo ngay trong trình duyệt. Sóng alpha, theta nghe rõ nhất bằng tai nghe. Dùng để nghỉ ngơi giữa giờ học, không thay cho tư vấn hay điều trị y khoa.',
      en: 'Generated in your browser. Alpha and theta sound best with headphones. For short breaks between lessons; not a substitute for medical advice or treatment.' } }
];
export const BAI = [
  { id: 'lesprit', nhom: 'loi', f: 'bizon-lesprit-du-mekong-v2.mp3', ten: { vi: 'BizOn – L’Esprit du Mékong' }, mo: { vi: 'Bài hát chính · lời Pháp–Anh–Việt', en: 'Main song · French–English–Vietnamese' } },
  { id: 'bat-nghiep-loi', nhom: 'loi', f: 'bat-nghiep-co-loi.mp3', ten: { vi: 'Bật Nghiệp' }, mo: { vi: 'Ca khúc chủ đề game · lời Việt', en: 'Game theme song · Vietnamese' } },
  { id: 'ben-phu-sa', nhom: 'loi', f: 'bai-hat-ben-phu-sa-v2.mp3', ten: { vi: 'Bến Phù Sa' }, mo: { vi: 'Song ca nam nữ · lời Việt', en: 'Duet · Vietnamese' } },
  { id: 'huong-ngot', nhom: 'loi', f: 'huong-ngot-phu-sa-v2.mp3', ten: { vi: 'Hương Ngọt Phù Sa' }, mo: { vi: 'Lời Việt', en: 'Vietnamese' } },
  { id: 'thap-den', nhom: 'loi', f: 'bat-nghiep-thap-den-ben-song-v2.mp3', ten: { vi: 'Thắp đèn bên sông', en: 'Lanterns by the River' }, mo: { vi: 'Dân ca Nam Bộ · lời Việt', en: 'Southern folk style · Vietnamese' } },
  { id: 'hai-dang', nhom: 'loi', f: 'bizonland-the-northern-shield-v2.mp3', ten: { vi: 'Ngọn hải đăng soi đường', en: 'The Guiding Light' }, mo: { vi: 'Tri ân Người Thầy 20/11', en: 'A thank-you song for teachers' } },
  { id: 'bay-cao', nhom: 'loi', f: 'vua-du-de-bay-cao.mp3', ten: { vi: 'Vừa Đủ Để Bay Cao' }, mo: { vi: 'Bản thu có lời', en: 'Vocal recording' } },
  { id: 'sans-frontieres', nhom: 'loi', f: 'huong-and-the-world.mp3', ten: { vi: 'Je m’appelle Hương sans frontières' }, mo: { vi: 'Bản tiếng Việt', en: 'Vietnamese version' } },
  { id: 'stamps', nhom: 'loi', f: 'stamps-beyond-borders.mp3', ten: { vi: 'Stamps Beyond Borders' }, mo: { vi: 'Lời tiếng Anh', en: 'English lyrics' } },
  { id: 'compass', nhom: 'loi', f: 'mekong-compass.mp3', ten: { vi: 'Mekong Compass' }, mo: { vi: 'Bản thu có lời', en: 'Vocal recording' } },
  { id: 'theme', nhom: 'khong', f: 'bizon-theme.mp3', ten: { vi: 'BizOn Theme' }, mo: { vi: 'Nhạc nền của bến', en: 'The wharf’s theme' } },
  { id: 'bat-nghiep', nhom: 'khong', f: 'bat-nghiep.mp3', ten: { vi: 'Bật Nghiệp (không lời)', en: 'Bật Nghiệp (instrumental)' }, mo: { vi: 'V-pop 112 BPM', en: 'V-pop 112 BPM' } },
  { id: 'alpha', nhom: 'thu-gian', tg: { trai: 200, phai: 210, hop: [110, 164.8, 220], on: 0 }, ten: { vi: 'Sóng alpha', en: 'Alpha waves' }, mo: { vi: 'Nhẹ, tỉnh táo · lệch 10 Hz', en: 'Calm, alert · 10 Hz offset' } },
  { id: 'theta', nhom: 'thu-gian', tg: { trai: 150, phai: 156, hop: [73.4, 110, 146.8], on: 0.15 }, ten: { vi: 'Sóng theta', en: 'Theta waves' }, mo: { vi: 'Chậm, thả lỏng · lệch 6 Hz', en: 'Slow, unwinding · 6 Hz offset' } },
  { id: 'mua', nhom: 'thu-gian', tg: { mua: true }, ten: { vi: 'Mưa nhẹ', en: 'Soft rain' }, mo: { vi: 'Tiếng mưa đều trên mái lá', en: 'Steady rain on a leaf roof' } }
];
const CHU = {
  ten: { vi: '🎵 Máy hát', en: '🎵 Jukebox' }, dong: { vi: 'Đóng', en: 'Close' },
  dang: { vi: 'Đang phát', en: 'Now playing' }, chua: { vi: 'Chưa phát bài nào. Chọn một bài bên dưới.', en: 'Nothing playing. Pick a track below.' },
  dung: { vi: '⏹ Dừng nhạc', en: '⏹ Stop music' }, ke: { vi: '⏭ Bài kế', en: '⏭ Next' },
  chip: { vi: 'Dừng nhạc', en: 'Stop music' }, loi: { vi: 'Chưa phát được bài này. Thử bài khác nhé.', en: 'Could not play this track. Try another one.' }
};

export function taoMayHat(o) {
  const L = o.L, $ = id => document.getElementById(id);
  const hop = $('bb-mh'), ds = $('bb-mh-ds'), chip = $('bb-mh-chip');
  let audio = null, dang = null, tg = null, ctx = null, soLoi = 0;
  const AC = window.AudioContext || window.webkitAudioContext;

  // ---- âm thanh thư giãn (Web Audio)
  function batTg(b) {
    if (!AC) return false;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t = ctx.currentTime, chu = ctx.createGain(); chu.gain.setValueAtTime(0, t); chu.gain.linearRampToValueAtTime(0.5, t + 2.5); chu.connect(ctx.destination);
    const nut = [];
    const sin = (f, g, pan) => {
      const os = ctx.createOscillator(), gg = ctx.createGain(); os.type = 'sine'; os.frequency.value = f; gg.gain.value = g; os.connect(gg);
      if (pan != null && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; gg.connect(p); p.connect(chu); } else gg.connect(chu);
      os.start(); nut.push(os); return gg;
    };
    if (b.tg.mua) {
      const n = Math.floor(ctx.sampleRate * 4), buf = ctx.createBuffer(2, n, ctx.sampleRate);
      for (let k = 0; k < 2; k++) { const d = buf.getChannelData(k); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b0 = 0.997 * b0 + w * 0.0296; b1 = 0.985 * b1 + w * 0.0325; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.055) * 0.5; } }
      const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
      const loc = ctx.createBiquadFilter(); loc.type = 'lowpass'; loc.frequency.value = 1500;
      const cao = ctx.createBiquadFilter(); cao.type = 'highpass'; cao.frequency.value = 180;
      const g = ctx.createGain(); g.gain.value = 0.55; s.connect(cao); cao.connect(loc); loc.connect(g); g.connect(chu); s.start(); nut.push(s);
    } else {
      sin(b.tg.trai, 0.11, -1); sin(b.tg.phai, 0.11, 1);              // hai tai lệch nhau vài Hz
      const dem = ctx.createGain(); dem.gain.value = 1; dem.connect(chu);
      b.tg.hop.forEach((f, i) => { const g = sin(f * (1 + (i - 1) * 0.0015), 0.045, null); g.disconnect(); g.connect(dem); });
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.08; lg.gain.value = 0.35; lfo.connect(lg); lg.connect(dem.gain); lfo.start(); nut.push(lfo);
    }
    tg = { chu, nut };
    return true;
  }
  function tatTg() {
    if (!tg || !ctx) return;
    const { chu, nut } = tg, t = ctx.currentTime; tg = null;
    chu.gain.cancelScheduledValues(t); chu.gain.setValueAtTime(chu.gain.value, t); chu.gain.linearRampToValueAtTime(0, t + 0.6);
    setTimeout(() => { nut.forEach(n => { try { n.stop(); } catch (e) {} }); chu.disconnect(); }, 700);
  }

  // ---- phát / dừng
  function phat(id) {
    const b = BAI.find(x => x.id === id); if (!b) return;
    dungNgam();
    dang = b;
    if (b.tg) { if (!batTg(b)) { dang = null; o.bao(L(CHU.loi)); } }
    else {
      if (!audio) {
        audio = new Audio(); audio.preload = 'none'; audio.volume = 0.45;
        audio.addEventListener('ended', () => { if (dang && !dang.tg) ke(); });
        audio.addEventListener('error', () => { if (dang && !dang.tg) { soLoi++; o.bao(L(CHU.loi)); if (soLoi < 3) ke(); else { dang = null; ve(); o.khiDoi(false); } } });
      }
      audio.src = 'assets/audio/' + b.f; audio.loop = false;
      audio.play().then(() => { soLoi = 0; }).catch(() => {});
    }
    ve(); o.khiDoi(!!dang);
  }
  function dungNgam() { if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); } tatTg(); dang = null; }
  function dung() { const co = !!dang; dungNgam(); ve(); if (co) o.khiDoi(false); }
  function ke() {
    if (!dang) return phat(BAI[0].id);
    const nhom = BAI.filter(x => x.nhom === dang.nhom), i = nhom.indexOf(dang);
    phat(nhom[(i + 1) % nhom.length].id);
  }

  // ---- vẽ bảng và viên «đang phát»
  function ve() {
    $('bb-mh-ten').textContent = L(CHU.ten);
    $('bb-mh-dong').setAttribute('aria-label', L(CHU.dong));
    $('bb-mh-dang').textContent = dang ? L(CHU.dang) + ': ' + L(dang.ten) : L(CHU.chua);
    const nd = $('bb-mh-dung'), nk = $('bb-mh-ke'); nd.textContent = L(CHU.dung); nk.textContent = L(CHU.ke); nd.disabled = !dang; nk.disabled = !dang;
    const fa = document.activeElement, giuBai = fa && ds.contains(fa) && fa.dataset ? fa.dataset.bai : null;   // vẽ lại thì giữ tiêu điểm ở bài cũ
    ds.textContent = '';
    for (const n of NHOM) {
      const sec = document.createElement('section'), h = document.createElement('h3'), ul = document.createElement('ul');
      sec.className = 'bb-mh-nhom'; h.id = 'bb-mh-n-' + n.id; h.textContent = L(n.ten); ul.setAttribute('aria-labelledby', h.id);
      for (const b of BAI.filter(x => x.nhom === n.id)) {
        const li = document.createElement('li'), bt = document.createElement('button'), t1 = document.createElement('span'), t2 = document.createElement('span');
        bt.type = 'button'; bt.dataset.bai = b.id; bt.setAttribute('aria-pressed', String(dang === b));
        t1.className = 'bb-mh-t'; t1.textContent = (dang === b ? '▶ ' : '') + L(b.ten); t2.className = 'bb-mh-m'; t2.textContent = L(b.mo);
        bt.appendChild(t1); bt.appendChild(t2); li.appendChild(bt); ul.appendChild(li);
      }
      sec.appendChild(h); sec.appendChild(ul);
      if (n.ghi) { const p = document.createElement('p'); p.className = 'bb-mh-ghi'; p.textContent = L(n.ghi); sec.appendChild(p); }
      ds.appendChild(sec);
    }
    if (giuBai) { const n = ds.querySelector('[data-bai="' + giuBai + '"]'); if (n) n.focus(); }
    chip.hidden = !dang;
    if (dang) { chip.textContent = '🎵 ' + L(dang.ten) + '  ⏹'; chip.setAttribute('aria-label', L(CHU.chip) + ': ' + L(dang.ten)); }
  }
  ds.addEventListener('click', e => { const b = e.target.closest('button[data-bai]'); if (!b) return; const id = b.dataset.bai; if (dang && dang.id === id) dung(); else phat(id); const n = ds.querySelector('[data-bai="' + id + '"]'); if (n) n.focus(); });
  $('bb-mh-dung').addEventListener('click', dung);
  $('bb-mh-ke').addEventListener('click', ke);
  $('bb-mh-dong').addEventListener('click', () => dong());
  chip.addEventListener('click', dung);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !hop.hidden) { dong(); e.stopPropagation(); } });   // tiêu điểm lạc ra ngoài vẫn đóng được
  hop.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;                                   // giữ tiêu điểm trong bảng
    const f = [...hop.querySelectorAll('button:not([disabled])')]; if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
  });
  let truoc = null;
  function mo() { truoc = document.activeElement; ve(); hop.hidden = false; o.khiMo(true); const b = ds.querySelector('[aria-pressed="true"]') || ds.querySelector('button'); if (b) b.focus(); }
  function dong() { if (hop.hidden) return; hop.hidden = true; o.khiMo(false); if (truoc && truoc.offsetParent) truoc.focus(); }
  ve();
  return {
    mo, dong, dung, phat, ke, ve,
    moi: () => !hop.hidden,
    __audio: () => audio,                             // cho test: giả lập «hết bài»
    trangThai: () => ({ mo: !hop.hidden, dang: dang ? dang.id : null, nhom: dang ? dang.nhom : null, thuGian: !!tg, audio: audio && !audio.paused ? audio.src.split('/').pop() : null }),
    tamDung() { if (audio && !audio.paused) audio.pause(); if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); },
    tiepTuc() { if (dang && !dang.tg && audio) audio.play().catch(() => {}); if (dang && dang.tg && ctx) ctx.resume().catch(() => {}); }
  };
}
