/* Bến BizOn – âm thanh bến sông (26/11/2026): bước chân, gió, chim hót, nước vỗ bến.
 * Mọi âm thanh tổng hợp ngay trong trình duyệt bằng Web Audio (tiếng ồn lọc, sóng sin quét tần số): không tải tệp, không gọi mạng,
 * không có bản quyền của bên thứ ba. Chỉ chạy sau một thao tác của người chơi (trình duyệt chặn tự phát âm thanh).
 *   - Gió: tiếng ồn hồng qua bộ lọc thông dải, cường độ và tần số trôi chậm.
 *   - Nước: tiếng ồn nâu qua bộ lọc thông thấp, «vỗ» theo nhịp chậm như sóng vào cột bến.
 *   - Chim: mỗi 4–10 giây một tràng 2–5 tiếng hót (sin quét 2,4–4,2 kHz), đặt ngẫu nhiên trái/phải.
 *   - Bước chân: tiếng «cộp» ngắn trên ván gỗ, phát theo quãng đường đi (bước ngắn khi đi, dài hơn khi chạy).
 * Bật/tắt bằng nút 🔊 (#bb-am), nhớ lựa chọn trong localStorage «bizon-ben-am». Mặc định bật. */
export function taoAmThanh(opt = {}) {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  const KHOA = 'bizon-ben-am';
  let ctx = null, chu = null, nen = null, hen = 0, quang = 0, soBuoc = 0, soChim = 0, nhacBat = false;
  let bat = (() => { try { return localStorage.getItem(KHOA) !== 'tat'; } catch (e) { return true; } })();
  const MUC = 0.32;                                   // âm lượng tổng, nhỏ hơn nhạc Máy hát (0,45)

  function bufOn(giay, loai) {                        // tiếng ồn trắng / hồng / nâu, phát lặp
    const n = Math.floor(ctx.sampleRate * giay), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, cu = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      if (loai === 'hong') { b0 = 0.997 * b0 + w * 0.029591; b1 = 0.985 * b1 + w * 0.032534; b2 = 0.95 * b2 + w * 0.048056; d[i] = (b0 + b1 + b2 + w * 0.0555) * 0.55; }
      else if (loai === 'nau') { cu = (cu + 0.02 * w) / 1.02; d[i] = cu * 3.2; }
      else d[i] = w;
    }
    return b;
  }
  function lfo(tan, bien, dich) {                     // dao động chậm cộng vào một tham số
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = tan; g.gain.value = bien; o.connect(g); g.connect(dich); o.start(); return o;
  }
  function dungNen() {
    // gió
    const gio = ctx.createBufferSource(); gio.buffer = bufOn(6, 'hong'); gio.loop = true;
    const locGio = ctx.createBiquadFilter(); locGio.type = 'bandpass'; locGio.frequency.value = 520; locGio.Q.value = 0.6;
    const gGio = ctx.createGain(); gGio.gain.value = 0.22;
    gio.connect(locGio); locGio.connect(gGio); gGio.connect(chu);
    lfo(0.07, 0.12, gGio.gain); lfo(0.05, 260, locGio.frequency); gio.start();
    // nước vỗ bến
    const nuoc = ctx.createBufferSource(); nuoc.buffer = bufOn(5, 'nau'); nuoc.loop = true;
    const locNuoc = ctx.createBiquadFilter(); locNuoc.type = 'lowpass'; locNuoc.frequency.value = 420;
    const gNuoc = ctx.createGain(); gNuoc.gain.value = 0.16;
    nuoc.connect(locNuoc); locNuoc.connect(gNuoc); gNuoc.connect(chu);
    lfo(0.23, 0.1, gNuoc.gain); nuoc.start();
    nen = { gio, nuoc };
    henChim();
  }
  function tieng(t, f0, f1, dai, pan) {               // một tiếng hót
    const o = ctx.createOscillator(), g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dai * 0.7);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
    o.connect(g); if (p) { p.pan.value = pan; g.connect(p); p.connect(chu); } else g.connect(chu);
    o.start(t); o.stop(t + dai + 0.02);
  }
  function henChim() {
    clearTimeout(hen);
    hen = setTimeout(() => {
      if (ctx && bat && ctx.state === 'running') {
        const t = ctx.currentTime + 0.05, n = 2 + Math.floor(Math.random() * 4), pan = Math.random() * 1.6 - 0.8, goc = 2400 + Math.random() * 900;
        for (let i = 0; i < n; i++) { const a = goc * (0.95 + Math.random() * 0.15); tieng(t + i * (0.11 + Math.random() * 0.06), a, a * (1.25 + Math.random() * 0.3), 0.07 + Math.random() * 0.05, pan); }
        soChim++;
      }
      henChim();
    }, 4000 + Math.random() * 6000);
  }
  let bufBuoc = null;
  function buoc() {                                   // một tiếng bước chân trên ván gỗ
    if (!ctx || !bat) return;
    soBuoc++;
    if (ctx.state !== 'running') return;
    if (!bufBuoc) bufBuoc = bufOn(0.09, 'trang');
    const t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = bufBuoc;
    const loc = ctx.createBiquadFilter(); loc.type = 'bandpass'; loc.frequency.value = 170 + Math.random() * 90; loc.Q.value = 1.4;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.75, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);
    s.connect(loc); loc.connect(g); g.connect(chu); s.start(t); s.stop(t + 0.1);
  }
  function batDau() {                                 // gọi trong một thao tác của người chơi (bấm chọn vai, bấm nút)
    if (!AC || !bat) return;
    if (!ctx) { ctx = new AC(); chu = ctx.createGain(); chu.gain.value = 0; chu.connect(ctx.destination); dungNen(); }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    chu.gain.cancelScheduledValues(ctx.currentTime); chu.gain.setTargetAtTime(nhacBat ? MUC * 0.55 : MUC, ctx.currentTime, 0.4);
  }
  function tamDung() {
    if (!ctx) return;
    chu.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    setTimeout(() => { if (ctx && (!bat || document.hidden || opt.dangTat && opt.dangTat())) ctx.suspend().catch(() => {}); }, 400);
  }
  return {
    batDau, tamDung,
    capNhat(dt, tocDo) {                              // gọi mỗi khung hình: tốc độ (m/s) → nhịp bước chân
      if (!(tocDo > 0.4)) { quang = 0; return; }
      quang += tocDo * dt;
      const sai = tocDo > 3 ? 1.15 : 0.72;            // sải chân: chạy dài hơn đi
      if (quang >= sai) { quang -= sai; buoc(); }
    },
    doi() {                                           // nút 🔊: bật/tắt, nhớ lựa chọn
      bat = !bat; try { localStorage.setItem(KHOA, bat ? 'bat' : 'tat'); } catch (e) {}
      if (bat) batDau(); else tamDung();
      return bat;
    },
    nhac(dangBat) { nhacBat = dangBat; if (ctx && bat) chu.gain.setTargetAtTime(dangBat ? MUC * 0.55 : MUC, ctx.currentTime, 0.4); },   // Máy hát bật thì gió, chim nhỏ lại
    trangThai: () => ({ coHoTro: !!AC, bat, chay: !!ctx && ctx.state === 'running', soBuoc, soChim }),
    huy() { clearTimeout(hen); if (ctx) { ctx.close().catch(() => {}); ctx = null; nen = null; } }
  };
}
