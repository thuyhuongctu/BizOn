/* BizOn Bật Nghiệp 2026 – Bản đồ Việt Nam chìm làm nền trang
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Trước đây khối SVG này được chép tay vào từng trang, mỗi trang một mức mờ
 * khác nhau. Gom về một chỗ để mọi trang liên kết của BizOn dùng chung một
 * bản đồ, và để sửa một lần là cả site đổi theo.
 *
 * Hai nhà sáng lập đứng tại toạ độ Cần Thơ – nơi khởi nghiệp trong ván chơi,
 * cũng là nơi ngôi sao vàng đánh dấu trên bản đồ.
 *
 * Lớp nền trang trí: aria-hidden, pointer-events:none, z-index -1. Nếu trang
 * đã có sẵn <div id="vn-map"> thì thay ruột chứ không tạo thêm cái thứ hai.
 *
 * ⚠️ Hoàng Sa và Trường Sa vẽ bằng cụm chấm, CỐ Ý KHÔNG ghi chữ trên bản đồ
 * chìm này (khác với bản đồ 3D có nhãn ở trang chủ). Đừng thêm nhãn vào đây.
 */
(function () {
  'use strict';
  if (window.__bizonVnMap) return;
  window.__bizonVnMap = true;

  var CSS = [
    '#vn-map{position:fixed;top:50%;right:-2vw;transform:translateY(-50%);',
    'width:min(36vw,440px);z-index:-1;pointer-events:none;color:#006687;opacity:1}',
    '#vn-map svg{width:100%;height:auto;display:block}',
    /* Ba lớp đậm nhạt khác nhau: đường bờ mờ nhất, cờ và sao rõ hơn, hai nhân
       vật rõ nhất – nếu để chung một mức opacity thì người sẽ chìm mất. */
    '#vn-map .vnm-geo{opacity:.10}',
    '#vn-map .vnm-mark{opacity:.42}',
    // Cả hai đều mặc áo dài trắng, nền trang cũng gần trắng, nên cần một vệt đổ
    // bóng rất nhẹ để dáng người không tan vào nền.
    '#vn-map .vnm-folk{opacity:.6;filter:drop-shadow(0 1px 2px rgba(0,0,0,.22))}',
    '#vn-map .lh-light{animation:vnlh-blink 1.8s ease-in-out infinite}',
    '#vn-map .lh-halo{opacity:0;animation:vnlh-halo 1.8s ease-in-out infinite}',
    '#vn-map .lh2 .lh-light,#vn-map .lh2 .lh-halo{animation-delay:.45s}',
    '#vn-map .lh3 .lh-light,#vn-map .lh3 .lh-halo{animation-delay:.9s}',
    '#vn-map .lh4 .lh-light,#vn-map .lh4 .lh-halo{animation-delay:1.35s}',
    '@keyframes vnlh-blink{0%,100%{opacity:.35}50%{opacity:1}}',
    '@keyframes vnlh-halo{0%,100%{opacity:0}50%{opacity:.7}}',
    'html[data-theme="dark"] #vn-map{color:#6fc4d8}',
    'html[data-theme="dark"] #vn-map .vnm-geo{opacity:.14}',
    '@media (max-width:820px){#vn-map{right:-16vw;width:64vw}',
    '#vn-map .vnm-geo{opacity:.07}#vn-map .vnm-mark{opacity:.32}',
    '#vn-map .vnm-folk{opacity:.42}}',
    '@media (prefers-reduced-motion:reduce){',
    '#vn-map .lh-light,#vn-map .lh-halo{animation:none}#vn-map .lh-halo{opacity:.4}}'
  ].join('');

  var LH = '<path d="M-2.4 0 L-1.4 -7 H1.4 L2.4 0 Z" fill="none" stroke="currentColor" stroke-width="1"/>' +
    '<line x1="-2.6" y1="0" x2="2.6" y2="0" stroke="currentColor" stroke-width="1"/>' +
    '<rect x="-1.7" y="-9.2" width="3.4" height="2.2" rx="0.6" fill="none" stroke="currentColor" stroke-width="1"/>' +
    '<circle class="lh-light" cx="0" cy="-8.1" r="1.3" fill="#e8483f"/>' +
    '<circle class="lh-halo" cx="0" cy="-8.1" r="4.2" fill="none" stroke="#e8483f" stroke-width="1"/>';

  function dots(r, list) {
    return list.map(function (p) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '"/>';
    }).join('');
  }

  // Ảnh cắt nền của hai nhà sáng lập. Chiều cao đặt bằng nhau (38 đơn vị) rồi
  // suy ra chiều rộng theo đúng tỷ lệ gốc, nếu không dáng người sẽ bị bóp méo:
  // Lumina 760×1100, thầy Tú 342×1046.
  var FOLK = [
    { src: 'assets/character/advisors/lumina-aodai-cut.webp', cx: 105.0, w: 26.3, h: 38 },
    { src: 'assets/character/anh-tu-ao-dai-cut.webp',         cx: 128.5, w: 12.4, h: 38 }
  ];
  var GROUND = 421; // chân người chạm đúng vĩ độ ngôi sao Cần Thơ (122.0, 425.1)

  function base(path) {
    // Trang nào cũng nằm cùng thư mục gốc nên đường dẫn tương đối là đủ.
    return path;
  }

  function svg() {
    var folk = FOLK.map(function (f) {
      return '<image href="' + base(f.src) + '" x="' + (f.cx - f.w / 2).toFixed(1) +
        '" y="' + (GROUND - f.h) + '" width="' + f.w + '" height="' + f.h + '"/>';
    }).join('');

    return '<svg viewBox="0 0 432 588" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="vnm-geo">' +
        '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' +
          '<polygon points="108.9,25.2 148.2,39.0 145.3,52.5 158.2,69.0 186.7,80.1 166.7,96.0 158.2,99.0 148.2,102.0 138.2,120.0 126.8,129.0 120.3,156.0 125.4,177.0 142.5,189.0 159.6,210.0 174.4,231.0 192.4,243.0 202.9,258.0 210.9,273.0 216.6,291.0 222.3,312.0 223.7,336.0 220.9,357.0 218.0,378.0 198.1,396.0 183.8,405.0 159.6,415.5 152.5,417.0 146.8,429.0 141.1,441.0 119.7,456.0 95.5,468.0 94.6,454.5 93.5,439.5 101.2,427.5 96.3,415.5 84.1,413.4 101.2,399.0 124.0,397.5 124.8,378.0 140.2,374.4 145.3,363.0 172.4,348.0 169.6,321.0 169.6,294.0 172.4,284.4 173.8,270.0 169.6,249.0 153.9,240.0 134.0,219.0 116.8,198.0 104.0,174.0 72.7,147.0 85.5,137.4 88.3,121.5 81.2,113.4 44.2,99.0 39.9,86.4 18.2,83.4 18.5,54.0 31.3,43.5 52.7,50.4 61.3,42.0 81.2,43.2 95.8,38.4 105.5,32.4 108.9,25.2"/>' +
          '<ellipse cx="71.2" cy="419.4" rx="4.5" ry="7"/>' +
        '</g>' +
        '<g fill="currentColor">' +
          '<circle cx="145.3" cy="465.6" r="1.8"/>' +
          // Hoàng Sa
          '<g opacity=".95">' + dots(1.5, [[287.8,219],[299.2,225],[307.8,220.5],[319.2,231],[299.2,237],[290.7,229.5],[312.1,240]]) + '</g>' +
          // Trường Sa
          '<g opacity=".95">' + dots(1.4, [[296.4,384],[322,402],[350.5,393],[364.8,414],[339.2,432],[313.5,438],[379,429],[353.4,462],[324.9,474],[367.7,489],[290.7,420],[393.3,447]]) + '</g>' +
        '</g>' +
        '<g class="lh" transform="translate(302.1,228.0)">' + LH + '</g>' +
        '<g class="lh lh2" transform="translate(344.8,435.0)">' + LH + '</g>' +
        '<g class="lh lh3" transform="translate(71.2,419.4)">' + LH + '</g>' +
        '<g class="lh lh4" transform="translate(145.3,465.6)">' + LH + '</g>' +
      '</g>' +
      '<g class="vnm-mark">' +
        '<g transform="translate(108.9,25.2)">' +
          '<line x1="0" y1="0" x2="0" y2="-22" stroke="#8a6a4f" stroke-width="1.6"/>' +
          '<rect x="0.8" y="-22" width="17" height="11" rx="1.2" fill="#da251d"/>' +
          '<path fill="#ffce00" d="M9.3 -19.9 10.3 -17.2 13.1 -17.2 10.8 -15.5 11.7 -12.8 9.3 -14.5 6.9 -12.8 7.8 -15.5 5.5 -17.2 8.3 -17.2Z"/>' +
        '</g>' +
        '<g transform="translate(122.0,425.1)"><path fill="#b3701a" d="M0 -7 1.9 -2.2 7 -2.2 2.9 0.9 4.4 5.8 0 2.8 -4.4 5.8 -2.9 0.9 -7 -2.2 -1.9 -2.2Z"/></g>' +
      '</g>' +
      '<g class="vnm-folk">' + folk + '</g>' +
      '</svg>';
  }

  function mount() {
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var host = document.getElementById('vn-map');
    if (!host) {
      host = document.createElement('div');
      host.id = 'vn-map';
      document.body.insertBefore(host, document.body.firstChild);
    }
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = svg();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
