/* BizOn – dữ liệu loạt phim «Đưa trái ra biển» / «Fruit to the Sea» (đặc tả specs/008-phim-dua-trai-ra-bien).
 * © 2026 NCS. Đỗ Thùy Hương & PGS.TS. Phan Anh Tú. Bảo lưu mọi quyền.
 * Lịch theo docs/phim/ke-hoach-san-xuat.md: hai tuần một tập, Chủ nhật 20:00 giờ Việt Nam, nghỉ quanh Tết.
 * yt.vi / yt.en để trống tới khi đăng; trang hiện «sắp phát hành» cho tập chưa có mã YouTube.
 * binhChon: kết quả bình chọn sau mỗi tập (để trống tới khi đóng thăm dò). Không tiết lộ «cú lật» của tập. */
(function (root) {
  'use strict';
  const L = (vi, en) => ({ vi, en });
  const tap = (so, ten, quyetDinh, phat) => ({ so, ten, quyetDinh, phat, yt: { vi: '', en: '' } });
  const PHIM = {
    ten: L('Đưa trái ra biển', 'Fruit to the Sea'),
    mua: 1,
    kenh: 'https://www.youtube.com/@jemappellehuong',
    tap: [
      tap(1, L('Sà lan hay xe tải?', 'Barge or Truck?'), L('Đưa 20 container sầu riêng từ Cần Thơ lên cảng Cái Mép bằng đường sông hay đường bộ.', 'Move 20 containers of durian from Cần Thơ to Cái Mép port by river or by road.'), '2026-12-13T20:00:00+07:00'),
      tap(2, L('Tươi hay cấp đông?', 'Fresh or Frozen?'), L('Bán trái tươi đi lạnh, hay cấp đông để đi đường dài với giá rẻ hơn.', 'Sell fresh fruit in cold chain, or freeze it to travel further for less.'), '2026-12-27T20:00:00+07:00'),
      tap(3, L('Chốt cước hay chờ?', 'Lock the Rate or Wait?'), L('Chốt cước tàu biển sớm, hay chờ giá xuống.', 'Lock in the ocean freight rate early, or wait for prices to fall.'), '2027-01-10T20:00:00+07:00'),
      tap(4, L('Tự lập điểm gom?', 'Our Own Collection Point?'), L('Tự lập điểm gom để giảm hao hụt, hay tiếp tục qua thương lái.', 'Build an own collection point to cut losses, or keep selling through traders.'), '2027-01-24T20:00:00+07:00'),
      tap(5, L('Rẻ, nhanh hay đủ?', 'Cheapest, Fastest or Complete?'), L('Ưu tiên rẻ nhất, nhanh nhất, hay giao đủ trọn đơn.', 'Put the cheapest, the fastest or the complete delivery first.'), '2027-02-21T20:00:00+07:00'),
      tap(6, L('Tới bến', 'Landfall'), L('Container tới tay người mua; nhìn lại các lựa chọn của người xem.', 'The container reaches the buyer; a look back at the viewers’ choices.'), '2027-03-07T20:00:00+07:00'),
    ],
    binhChon: {},
  };
  /** Tập sắp phát kế tiếp (theo giờ `now`), hoặc null khi đã phát hết. */
  PHIM.tapKeTiep = function (now) { const t = +now; return PHIM.tap.find(x => Date.parse(x.phat) > t) || null; };
  /** Còn bao lâu: { ngay, gio, phut, giay } (không âm). */
  PHIM.conLai = function (moc, now) {
    let s = Math.max(0, Math.floor((Date.parse(moc) - +now) / 1000));
    const ngay = Math.floor(s / 86400); s -= ngay * 86400; const gio = Math.floor(s / 3600); s -= gio * 3600; const phut = Math.floor(s / 60);
    return { ngay, gio, phut, giay: s - phut * 60 };
  };
  if (typeof module === 'object' && module.exports) module.exports = PHIM;
  else root.PhimData = PHIM;
})(typeof self !== 'undefined' ? self : this);
