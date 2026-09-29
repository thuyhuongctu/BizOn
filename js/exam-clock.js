/* BizOn — lịch thi dùng chung cho game và Trang Giảng viên.
 * Mốc: [bắt đầu, +chuẩn bị) = đăng nhập; mỗi vòng k chiếm round_min phút tiếp theo; sau vòng 6 = kết thúc. */
(function () {
  function examStatus(ex, nowMs) {
    if (!ex || !ex.active || !ex.start_at) return null;
    const setup = +ex.setup_min || 0, rm = Math.max(1, +ex.round_min || 8);
    const t = (nowMs - Date.parse(ex.start_at)) / 60000;
    if (t < 0) return { phase: 'wait', allowed: 0, left: -t, label: 'Chưa bắt đầu' };
    if (t < setup) return { phase: 'setup', allowed: 0, left: setup - t, label: 'Đăng nhập & chọn vai' };
    const k = Math.floor((t - setup) / rm) + 1;
    if (k > 6) return { phase: 'end', allowed: 6, left: 0, round: 6, label: 'Đã hết giờ thi' };
    return { phase: 'round', round: k, allowed: k, left: setup + k * rm - t, label: 'Vòng ' + k };
  }
  const mmss = min => { const s = Math.max(0, Math.round(min * 60)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const endAt = ex => ex && ex.start_at ? new Date(Date.parse(ex.start_at) + ((+ex.setup_min || 0) + 6 * (+ex.round_min || 8)) * 60000) : null;
  window.BizOnExam = { examStatus, mmss, endAt };
})();
