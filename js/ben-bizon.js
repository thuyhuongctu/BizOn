/* BizOn – «Bến BizOn» (hub-3d.html): lối vào 3D tới các game, dựng thành một bến sông miền Tây bằng đất sét.
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Đặc tả: specs/002-ben-bizon-3d (câu chuyện 1). Người chơi chọn 1 trong 5 vai đội, đi bộ trên bờ và cầu tàu; mỗi game là
 * một điểm đúng chất của nó (ghe chợ nổi, trụ sở, con tàu, vườn sầu riêng, nhà sàn, cột mốc ba bậc). Lumina và thầy Tu
 * Phan đứng ở sân bến làm cố vấn. Phần di chuyển (cần điều khiển, máy quay sau lưng, thẻ «Vào», «Đi tới…») nằm ở
 * js/di-chuyen-3d.js; tệp này chỉ lo bối cảnh, nhân vật và nội dung.
 *
 * Nhân vật: mô hình có xương dựng từ tranh gốc (assets/models/nhan-vat/), nạp qua bizon-characters.js bằng cờ có sẵn
 * BIZON_CHAR_GLB; mô hình chưa tải hay tải hỏng thì bizon-characters.js tự dùng tranh dựng đứng. Cảnh dựng hoàn toàn
 * bằng khối cơ bản của three.js (lớp chi tiết ở js/ben-bizon-canh.js), không thêm tài sản bên thứ ba. Không gọi mạng, chỉ nhớ vai đã chọn và game đã ghé
 * trong localStorage.
 */
import * as THREE from 'three';
import { makeCharacters } from '../bizon-characters.js';
import { lamDayCanh } from './ben-bizon-canh.js';
import { taoDangDi } from './ben-bizon-dang-di.js';
import { taoTranhDong } from './ben-bizon-tranh-dong.js';

window.BIZON_CHAR_GLB = true;   // bật mô hình có xương cho riêng trang này (mặc định của kho vẫn tắt, PR #1024)

const $ = id => document.getElementById(id);
const lang = () => { try { return localStorage.getItem('bizon-lang') === 'en' ? 'en' : 'vi'; } catch (e) { return 'vi'; } };
const L = v => (v ? v[lang()] || v.vi || '' : '');
const giam = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
const PI = Math.PI;

// ---------------------------------------------------------------- nội dung
const VAI = {
  ceo: { nhan: { vi: 'CEO', en: 'CEO' }, ten: 'Minh Long' }, cfo: { nhan: { vi: 'CFO', en: 'CFO' }, ten: 'Thu Hà' },
  cmo: { nhan: { vi: 'CMO', en: 'CMO' }, ten: 'Mạnh Chi' }, coo: { nhan: { vi: 'COO', en: 'COO' }, ten: 'Bảo Ngọc' },
  sec: { nhan: { vi: 'Thư ký', en: 'Secretary' }, ten: 'Gia Hân' },
};
// Nhãn chính sách theo trang Chính sách: Arcade và Bến Phù Sa miễn phí; Bật Nghiệp và Hộ Chiếu Thương Hiệu dùng thử một học kỳ.
// Game trang Chính sách chưa nói rõ thì không ghi nhãn.
const MIEN_PHI = { vi: 'Miễn phí', en: 'Free' }, DUNG_THU = { vi: 'Dùng thử', en: 'Trial' };
const HOI = { vi: 'Hỏi', en: 'Ask' };
// x, z: chỗ đứng kích hoạt thẻ (trên bờ hoặc cầu tàu); mx, mz: vị trí hình trong cảnh (để nhân vật quay mặt về và đặt bảng tên)
const NOI = [
  { id: 'hanh-trinh', bieuTuong: '🧭', x: 1.9, z: -1.6, tam: 2.1, mx: 3.3, mz: -1.2, my: 2.5, url: 'hanh-trinh.html',
    ten: { vi: 'Hành trình 3 bậc', en: 'The 3-tier journey' }, moTa: { vi: 'Từ Phù Sa ra Thế giới: xem ba bậc và cuốn hộ chiếu của bạn.', en: 'From the delta to the world: see the three tiers and your passport.' } },
  { id: 'ben-phu-sa', bieuTuong: '🛶', x: -0.9, z: 5.5, tam: 1.7, mx: -3.5, mz: 5.5, my: 3.3, url: 'ben-phu-sa-3d.html', nhan: MIEN_PHI,
    ten: { vi: 'Bến Phù Sa', en: 'Bến Phù Sa' }, moTa: { vi: 'Bậc 1 · Ghe chợ nổi: khởi sự kinh doanh trên sông trong 5 tuần.', en: 'Tier 1 · The floating-market boat: start a business on the river in 5 weeks.' } },
  { id: 'hc-thuong-hieu', bieuTuong: '🚢', x: 0, z: 12.4, tam: 1.8, mx: 0, mz: 17.4, my: 5.2, url: 'Ho Chieu Thuong Hieu 3D.html', nhan: DUNG_THU,
    ten: { vi: 'Hộ Chiếu Thương Hiệu', en: 'Brand Passport' }, moTa: { vi: 'Bậc 3 · Con tàu ra khơi: đưa thương hiệu Việt tới bảy thị trường.', en: 'Tier 3 · The outbound ship: take a Vietnamese brand to seven markets.' } },
  { id: 'bat-nghiep', bieuTuong: '🏢', x: -10, z: -5.2, tam: 2.2, mx: -10, mz: -10.4, my: 4.4, url: 'BizOn Game 3D.html', nhan: DUNG_THU,
    ten: { vi: 'Bật Nghiệp', en: 'Bật Nghiệp' }, moTa: { vi: 'Bậc 2 · Trụ sở Cần Thơ: năm vai điều hành doanh nghiệp qua sáu vòng.', en: 'Tier 2 · The Cần Thơ head office: five roles run a company over six rounds.' } },
  { id: 'hc-sau-rieng', bieuTuong: '🌳', x: 10.5, z: -5.4, tam: 2.2, mx: 10.5, mz: -9.6, my: 3.6, url: 'lab/ho-chieu-sau-rieng-3d.html',
    ten: { vi: 'Hộ Chiếu Sầu Riêng', en: 'Durian Passport' }, moTa: { vi: 'Bậc 3 · Vườn sầu riêng: đưa trái sầu riêng đi xuất khẩu qua sáu vụ.', en: 'Tier 3 · The durian orchard: export durian over six seasons.' } },
  { id: 'arcade', bieuTuong: '🏮', x: -14.4, z: -2.7, tam: 1.9, mx: -18.6, mz: -2.7, my: 4.3, url: 'games.html', nhan: MIEN_PHI,
    ten: { vi: 'BizOn Arcade', en: 'BizOn Arcade' }, moTa: { vi: 'Nhà sàn trò chơi nhỏ: mỗi trò vài phút.', en: 'The stilt house of mini games: a few minutes each.' } },
  { id: 'lumina', bieuTuong: '💡', x: -2.4, z: -4.6, tam: 1.6, mx: -3.3, mz: -4.6, my: 1.75, thoai: 'lumina', nut: HOI,
    ten: { vi: 'Lumina', en: 'Lumina' }, moTa: { vi: 'Cố vấn học tập của BizOn: hỏi đường trên bến.', en: 'BizOn’s learning advisor: ask for directions.' } },
  { id: 'thay-tu', bieuTuong: '📚', x: 2.6, z: -5.0, tam: 1.6, mx: 3.5, mz: -5.0, my: 1.8, thoai: 'tu', nut: HOI,
    ten: { vi: 'Thầy Tu Phan', en: 'Thầy Tu Phan' }, moTa: { vi: 'Cố vấn học thuật: game dựng trên mô hình nào.', en: 'Academic advisor: the models behind the games.' } },
  { id: 'may-hat', bieuTuong: '🎵', x: 6.2, z: -2.6, tam: 1.4, mx: 7.3, mz: -2.1, my: 2.0, viec: 'nhac', nut: { vi: 'Bật / tắt', en: 'Play / stop' },
    ten: { vi: 'Máy hát', en: 'Jukebox' }, moTa: { vi: 'Bật nhạc nền BizOn Theme khi đi trên bến.', en: 'Play the BizOn Theme while you walk.' } },
  { id: 'bang-tin', bieuTuong: '📋', x: -5.6, z: -2.4, tam: 1.4, mx: -6.5, mz: -1.6, my: 2.3, thoai: 'bang', nut: { vi: 'Đọc', en: 'Read' },
    ten: { vi: 'Bảng tin', en: 'Notice board' }, moTa: { vi: 'Bến BizOn có gì và đi thế nào.', en: 'What is here and how to get around.' } },
  { id: 'thanh-tich', bieuTuong: '🏆', x: 15.5, z: -2.8, tam: 1.5, mx: 16.7, mz: -2.2, my: 2.4, viec: 'thanh-tich', nut: { vi: 'Xem', en: 'View' },
    ten: { vi: 'Bảng thành tích', en: 'Achievement board' }, moTa: { vi: 'Bạn đã ghé những game nào.', en: 'Which games you have visited.' } },
];
NOI.forEach(p => { p.huong = Math.atan2(p.mx - p.x, p.mz - p.z); });
const GAME = NOI.filter(p => p.url);

const THOAI = {
  lumina: { anh: 'assets/character/lumina-ao-dai-wave.webp', ten: { vi: 'Lumina', en: 'Lumina' }, cta: { nhan: { vi: '🧭 Xem Hành trình 3 bậc', en: '🧭 See the 3-tier journey' }, url: 'hanh-trinh.html' },
    cau: [
      { vi: 'Chào bạn! Mình là Lumina, cố vấn học tập của BizOn. Đây là Bến BizOn. 👋', en: 'Hi! I’m Lumina, BizOn’s learning advisor. This is BizOn Wharf. 👋' },
      { vi: 'Mỗi game là một điểm trên bến: ghe chợ nổi, trụ sở, con tàu, vườn sầu riêng. Tới gần rồi bấm «Vào».', en: 'Each game is a spot on the wharf: the market boat, the head office, the ship, the durian orchard. Walk up and press “Enter”.' },
      { vi: 'Chưa biết bắt đầu từ đâu? Cột mốc ở đầu cầu tàu kể về hành trình ba bậc. Chọn bậc nào là việc của bạn.', en: 'Not sure where to start? The milestone at the head of the pier tells the three-tier journey. Which tier to pick is up to you.' },
    ] },
  tu: { anh: 'assets/character/anh-tu-ao-dai-explain-cut.webp', ten: { vi: 'Thầy Tu Phan', en: 'Thầy Tu Phan' }, cta: { nhan: { vi: '🎓 Xem Nền tảng học thuật', en: '🎓 See the academic foundation' }, url: 'truong-hoc-thuat.html' },
    cau: [
      { vi: 'Chào bạn! Thầy là Tu Phan, cố vấn học thuật của BizOn. 📚', en: 'Hello! I’m Thầy Tu Phan, BizOn’s academic advisor. 📚' },
      { vi: 'Mỗi ván Bến Phù Sa hay Hộ Chiếu Thương Hiệu đều dựng trên mô hình kinh tế thật, không chỉ là trò chơi.', en: 'Every run of Bến Phù Sa or Brand Passport is built on real economic models, not just play.' },
      { vi: 'Muốn hiểu phương pháp đứng sau, mời bạn ghé Nền tảng học thuật.', en: 'To see the method behind them, visit the academic foundation.' },
    ] },
  bang: { anh: 'assets/icons/icon-192.png', ten: { vi: '📋 Bảng tin', en: '📋 Notice board' }, cta: null,
    cau: [
      { vi: 'Bến BizOn là lối vào bằng 3D tới các game của BizOn. Trang đang thử nghiệm.', en: 'BizOn Wharf is a 3D way into the BizOn games. This page is experimental.' },
      { vi: 'Trên bến có: Bến Phù Sa, Bật Nghiệp, Hộ Chiếu Thương Hiệu, Hộ Chiếu Sầu Riêng, BizOn Arcade và Hành trình 3 bậc.', en: 'On the wharf: Bến Phù Sa, Bật Nghiệp, Brand Passport, Durian Passport, BizOn Arcade and the 3-tier journey.' },
      { vi: 'Không muốn đi bộ? Bấm «Đi tới…» ở góc phải trên để chọn thẳng một nơi.', en: 'Rather not walk? Press “Go to…” at the top right to jump straight to a place.' },
    ] },
};
const CHU = {
  tai: { vi: 'Đang tải nhân vật…', en: 'Loading your character…' },
  tranh: { vi: 'Chưa tải được mô hình 3D, đang dùng tranh nhân vật.', en: 'The 3D model has not loaded; using the character art instead.' },
  mang: { vi: 'Đang mất mạng: dùng tranh nhân vật cho tới khi có mạng lại.', en: 'You are offline: using the character art until you are back online.' },
  nhacBat: { vi: '🎵 Đang phát BizOn Theme', en: '🎵 Playing the BizOn Theme' }, nhacTat: { vi: 'Đã tắt nhạc', en: 'Music stopped' },
  tiep: { vi: 'Tiếp tục ▸', en: 'Continue ▸' }, dong: { vi: 'Đóng', en: 'Close' },
  daGhe: { vi: 'Bạn đã ghé {n}/{m} điểm game trên bến.', en: 'You have visited {n} of {m} game spots on the wharf.' },
};

// ---------------------------------------------------------------- mặt bằng: bờ, cầu tàu, vật cản
const BO = { x1: -21.5, x2: 21.5, z1: -15.5, z2: -0.3 };
const CAU = [{ x1: -1.45, x2: 1.45, z1: -0.6, z2: 12.9 }, { x1: -5.8, x2: 5.8, z1: 10.2, z2: 13.0 }];
const trong = (r, x, z) => x >= r.x1 && x <= r.x2 && z >= r.z1 && z <= r.z2;
const laBo = (x, z) => trong(BO, x, z) || CAU.some(r => trong(r, x, z));
const VAT = [];
const chan = (x, z, r) => VAT.push({ x, z, r });
const chanHop = (x1, z1, x2, z2) => VAT.push({ x1, z1, x2, z2, cao: true });
const trongVat = (x, z, m) => VAT.some(v => (v.r != null ? Math.hypot(x - v.x, z - v.z) < v.r + m : x > v.x1 - m && x < v.x2 + m && z > v.z1 - m && z < v.z2 + m));
const diDuoc = (x, z) => laBo(x, z) && !trongVat(x, z, 0.28);
const cheMay = (x, z) => VAT.some(v => v.cao && x > v.x1 && x < v.x2 && z > v.z1 && z < v.z2);
const NUOC_Y = -0.34;

// ---------------------------------------------------------------- dựng cảnh
let renderer, scene, camera, sun, chars, dc = null, player = null, vai = null, raf = 0, dongHo = 0, tLast = 0, sanSang = false;
let luminaObj, tuObj, noiChuyen = null, chiTiet = null, dangDi = null, daHaToc = false;
let tranh = null;   // nhân vật «tranh động» (bản thử, chỉ bật khi đường dẫn có ?nv=tranh và vai có tờ sprite)
const NV_TRANH = /[?&]nv=tranh\b/.test(window.location.search), CO_TRANH = { ceo: true };
const TOC_DI = 1.15, TOC_CHAY = 2.1;   // đơn vị của cảnh mỗi giây, hợp với sải chân của clip đi và clip chạy ở cỡ nhân vật này
const nenCu = [];   // lối đi và mảng cỏ phẳng của bản đầu: lớp chi tiết (ben-bizon-canh.js) thay bằng nền vẽ thì ẩn đi
const dong = [];     // các hàm chạy mỗi khung hình (bập bềnh, trôi)
const mats = {};
const M = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.88, metalness: 0 }, o))); };
function khoi(geo, mat, x = 0, y = 0, z = 0, cha) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (cha || scene).add(m); return m; }
const hop = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const tru = (r1, r2, h, n = 12) => new THREE.CylinderGeometry(r1, r2, h, n);
const cau = (r, a = 14, b = 10) => new THREE.SphereGeometry(r, a, b);
function hopBo(w, h, d, r = 0.14) {   // hộp bo góc, cho khối mềm kiểu đất sét
  const s = new THREE.Shape(), iw = Math.max(w - 2 * r, 0.01), ih = Math.max(h - 2 * r, 0.01), dd = Math.max(d - 2 * r, 0.01);
  s.moveTo(-iw / 2, -ih / 2); s.lineTo(iw / 2, -ih / 2); s.lineTo(iw / 2, ih / 2); s.lineTo(-iw / 2, ih / 2); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: dd, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 2 });
  g.translate(0, 0, -dd / 2); return g;
}
const nhom = (x = 0, y = 0, z = 0, cha) => { const g = new THREE.Group(); g.position.set(x, y, z); (cha || scene).add(g); return g; };
const taiAnh = new THREE.TextureLoader();
function bien(url, w, cha, x, y, z, ry = 0) {   // bảng hiệu: ảnh bìa game có sẵn trong kho, khung gỗ
  const g = nhom(x, y, z, cha); g.rotation.y = ry; const h = w * 800 / 1280;
  khoi(hopBo(w + 0.22, h + 0.22, 0.12, 0.05), M(0x8a5a34), 0, 0, -0.03, g);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xf3e2c2, toneMapped: false })); m.position.z = 0.045; g.add(m);
  taiAnh.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; m.material.map = t; m.material.color.set(0xffffff); m.material.needsUpdate = true; }, undefined, () => {});
  return g;
}
function chuTrenBang(chu, mau, nen, w = 256, h = 96) {   // chữ ngắn vẽ lên bảng gỗ (số bậc, tên trụ sở)
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = nen; x.fillRect(0, 0, w, h); x.fillStyle = mau; x.font = '800 ' + Math.round(h * 0.56) + 'px Manrope, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(chu, w / 2, h / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function dungDua(x, z, h = 4.4, ng = 0.5, quay = 0) {
  const g = nhom(x, 0, z); g.rotation.y = quay; const n = 6, th = M(0xa9794c), la = M(0x6aa858), la2 = M(0x86bf66);
  let px = 0, py = 0;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), seg = h / n, r = 0.2 - k * 0.07, a = ng * k * 0.5;
    const m = khoi(tru(r * 0.92, r, seg * 1.08, 8), th, px + Math.sin(a) * seg / 2, py + Math.cos(a) * seg / 2, 0, g); m.rotation.z = -a;
    px += Math.sin(a) * seg; py += Math.cos(a) * seg;
  }
  const ngon = nhom(px, py, 0, g);
  for (let i = 0; i < 8; i++) {
    const tay = nhom(0, 0, 0, ngon); tay.rotation.y = i * PI / 4 + 0.2;
    const l = khoi(cau(1, 8, 6), i % 2 ? la : la2, 0.95, -0.12 - (i % 3) * 0.05, 0, tay); l.scale.set(1.15, 0.07, 0.34); l.rotation.z = -0.42 - (i % 2) * 0.12;
  }
  for (let i = 0; i < 3; i++) khoi(cau(0.15, 8, 6), M(0x7a8a3c), Math.cos(i * 2.1) * 0.22, -0.2, Math.sin(i * 2.1) * 0.22, ngon);
  chan(x, z, 0.3); return g;
}

function dungNen() {
  // bờ phù sa: khối đất, mép dốc xuống sông, lối đi sáng màu, vài mảng cỏ
  const dat = khoi(hop(46, 1.4, 17.2), M(0xdcc08f), 0, -0.7, -8.6); dat.castShadow = false;
  const mep = khoi(hop(46, 0.9, 1.3), M(0xc19a66), 0, -0.62, 0.15); mep.rotation.x = 0.5; mep.castShadow = false;
  const loi = M(0xf0e2c0);
  [[0, -6.4, 2.6, 12.2], [0, -6.2, 24, 2.2], [-10, -4.4, 2.2, 3.6], [10.5, -4.4, 2.2, 3.6]].forEach(([x, z, w, d]) => { const m = khoi(hop(w, 0.04, d), loi, x, 0.0, z); m.castShadow = false; nenCu.push(m); });
  const co = M(0x9cc47c);
  [[-6, -11.5, 3.4], [5.5, -12.5, 2.8], [-15.5, -9.5, 2.6], [16.5, -8.4, 2.4], [-4.5, -2.4, 1.3], [12.5, -2.2, 1.6], [-13, -13.5, 2.2], [18.5, -13.2, 2.4]].forEach(([x, z, r]) => {
    const m = khoi(new THREE.CircleGeometry(r, 20), co, x, 0.012, z); m.rotation.x = -PI / 2; m.scale.y = 0.7; m.castShadow = false; nenCu.push(m); });
  // sông phù sa
  const nuoc = khoi(new THREE.PlaneGeometry(220, 120), M(0x7cc4c0, { roughness: 0.38 }), 0, NUOC_Y, 52); nuoc.rotation.x = -PI / 2; nuoc.castShadow = false;
  const phuSa = new THREE.Mesh(new THREE.PlaneGeometry(220, 5), new THREE.MeshBasicMaterial({ color: 0xc9ad7c, transparent: true, opacity: 0.55, depthWrite: false })); phuSa.rotation.x = -PI / 2; phuSa.position.set(0, NUOC_Y + 0.012, 2.4); scene.add(phuSa);
  const gon = new THREE.MeshBasicMaterial({ color: 0xe6f6f2, transparent: true, opacity: 0.6, depthWrite: false });
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6 + (i % 4) * 0.7, 0.07), gon); m.rotation.x = -PI / 2;
    const x0 = -26 + (i * 7.3) % 52, z = 2.5 + (i * 3.7) % 26; m.position.set(x0, NUOC_Y + 0.02, z); scene.add(m);
    if (!giam) dong.push(t => { m.position.x = -28 + ((x0 + 28 + t * (0.35 + (i % 3) * 0.12)) % 56); });
  }
  // bờ bên kia và hàng cây xa
  const xa = khoi(hop(220, 1.2, 10), M(0xb7cf8e), 0, -0.5, 66); xa.castShadow = false;
  for (let i = 0; i < 22; i++) { const m = khoi(cau(2.2 + (i % 3) * 0.7, 8, 6), M(i % 2 ? 0x8fbf74 : 0x79ad68), -72 + i * 7 + (i % 2) * 2, 1.2, 63 + (i % 3)); m.scale.y = 0.8; m.castShadow = false; }
  // mây
  const may = new THREE.MeshBasicMaterial({ color: 0xfffaf0, fog: false });
  [[-24, 15, 46], [8, 18, 58], [30, 14, 42], [-46, 19, 60], [52, 17, 62]].forEach(([x, y, z], i) => {
    const g = nhom(x, y, z); [[0, 0, 2.6], [2.4, 0.3, 2], [-2.3, 0.2, 1.8]].forEach(([dx, dy, r]) => { const m = new THREE.Mesh(cau(r, 10, 8), may); m.position.set(dx, dy, 0); m.scale.y = 0.55; g.add(m); });
    if (!giam) dong.push(t => { g.position.x = x + Math.sin(t * 0.03 + i) * 3; });
  });
  // lục bình trôi
  for (let i = 0; i < 9; i++) {
    const x0 = -22 + (i * 6.1) % 44, z0 = 3 + (i * 4.3) % 22; if (Math.abs(x0) < 7.5 && z0 < 21) continue;
    const g = nhom(x0, NUOC_Y + 0.03, z0);
    for (let k = 0; k < 5; k++) { const l = khoi(new THREE.CircleGeometry(0.2 + (k % 2) * 0.06, 10), M(0x5fa55a), Math.cos(k * 1.3) * 0.26, 0, Math.sin(k * 1.3) * 0.26, g); l.rotation.x = -PI / 2; l.castShadow = false; }
    khoi(new THREE.ConeGeometry(0.07, 0.24, 6), M(0x9a7fd1), 0, 0.14, 0, g);
    if (!giam) dong.push(t => { g.position.x = -24 + ((x0 + 24 + t * 0.22) % 48); g.position.y = NUOC_Y + 0.03 + Math.sin(t * 1.3 + i) * 0.02; });
  }
}

function dungCauTau() {
  const go = M(0xb07a45), goDam = M(0x8a5a34);
  khoi(hop(3.2, 0.24, 13.4), go, 0, -0.12, 6.3);
  khoi(hop(12, 0.24, 3.2), go, 0, -0.12, 11.6);
  for (let z = 0.3; z < 13; z += 0.7) { const m = khoi(hop(3.2, 0.012, 0.035), goDam, 0, 0.004, z); m.castShadow = false; }
  for (let x = -5.6; x <= 5.7; x += 0.7) { const m = khoi(hop(0.035, 0.012, 3.2), goDam, x, 0.005, 11.6); m.castShadow = false; }
  const coc = (x, z, cao = 0.5) => khoi(tru(0.14, 0.16, 1.5 + cao, 8), goDam, x, -0.75 + cao / 2, z);
  for (let z = 1.2; z < 10; z += 2.6) { coc(-1.6, z); coc(1.6, z); }
  [[-6, 10.1], [6, 10.1], [-6, 13.1], [6, 13.1], [-2.2, 13.1], [2.2, 13.1]].forEach(([x, z]) => coc(x, z, 0.75));
  // dây thừng nối cọc ở đầu cầu cho biết mép
  const day = M(0xe8d6a8);
  [[-4.1, 13.1, 3.6], [4.1, 13.1, 3.6]].forEach(([x, z, w]) => { const m = khoi(tru(0.03, 0.03, w, 6), day, x, 0.42, z); m.rotation.z = PI / 2; });
  // hai cột đèn lồng ở đầu cầu tàu
  [[-1.75, 0.2], [1.75, 0.2]].forEach(([x, z]) => {
    khoi(tru(0.07, 0.09, 2.6, 8), goDam, x, 1.1, z);
    const den = khoi(cau(0.24, 12, 10), M(0xf2a23a, { emissive: 0xd9731a, emissiveIntensity: 0.7 }), x, 2.3, z); den.scale.y = 1.2; den.castShadow = false;
    if (!giam) dong.push(t => { den.position.y = 2.3 + Math.sin(t * 1.4 + x) * 0.03; });
    chan(x, z, 0.12);
  });
}

function dungGhe() {   // ghe chợ nổi của Bến Phù Sa: thân gỗ, mui lá, mắt ghe, cây bẹo treo hàng
  const g = nhom(-3.5, NUOC_Y, 5.5);
  const than = khoi(new THREE.SphereGeometry(1, 18, 10, 0, PI * 2, PI / 2, PI / 2), M(0x8b5a34), 0, 0.62, 0, g); than.scale.set(1.15, 0.85, 3.5);
  const vien = khoi(new THREE.TorusGeometry(1, 0.035, 6, 28), M(0xc0392b), 0, 0.62, 0, g); vien.rotation.x = PI / 2; vien.scale.set(1.15, 3.5, 1);
  const san = khoi(new THREE.CircleGeometry(1, 24), M(0xc49a63), 0, 0.56, 0, g); san.rotation.x = -PI / 2; san.scale.set(1.08, 3.3, 1);
  const mui = khoi(new THREE.CylinderGeometry(0.86, 0.86, 2.3, 14, 1, true, -PI / 2, PI), M(0xcdb074, { side: THREE.DoubleSide }), 0, 0.6, -0.5, g); mui.rotation.x = -PI / 2;   // mui lá: nửa ống nằm dọc thân ghe
  [1, -1].forEach(s => {   // mắt ghe ở mũi
    const m = khoi(new THREE.CircleGeometry(0.2, 14), M(0xfdf6e3), s * 0.5, 0.42, 2.72, g); m.rotation.y = s * 1.0; m.castShadow = false;
    const c = khoi(new THREE.CircleGeometry(0.09, 10), M(0x1d1408), s * 0.52, 0.42, 2.75, g); c.rotation.y = s * 1.0; c.castShadow = false;
  });
  // cây bẹo: sào tre treo món đang bán
  khoi(tru(0.04, 0.05, 3.4, 6), M(0xb9a25a), 0.2, 2.2, 1.7, g);
  [[0xf08a2c, 0.2, 3.5], [0xe9c84a, 0.16, 3.05], [0x6fae5a, 0.19, 2.6], [0xd9483b, 0.13, 2.2]].forEach(([c, r, y], i) => khoi(cau(r, 10, 8), M(c), 0.2 + (i % 2 ? 0.2 : -0.18), y, 1.7, g));
  // hàng trên ghe
  [[0xf08a2c, -0.3, 1.5], [0xf2b33d, 0.3, 1.2], [0x6fae5a, -0.1, 0.95], [0xe9c84a, 0.35, 1.75], [0xd9483b, -0.4, 1.05], [0x8fc45a, 0.05, 1.45]].forEach(([c, x, z], i) => khoi(cau(0.2 + (i % 3) * 0.03, 10, 8), M(c), x, 0.74, z, g));
  if (!giam) dong.push(t => { g.position.y = NUOC_Y + Math.sin(t * 1.1) * 0.035; g.rotation.z = Math.sin(t * 0.8) * 0.018; });
  bien('assets/covers/ben-phu-sa-3d.webp', 1.5, scene, -2.15, 1.5, 7.5, PI / 2);
  khoi(tru(0.06, 0.07, 1.6, 6), M(0x8a5a34), -1.62, 0.5, 7.5);
}

function dungTau() {   // con tàu chở hàng của Hộ Chiếu Thương Hiệu
  const g = nhom(0, NUOC_Y, 17.4);
  khoi(hopBo(13, 2.3, 4.2, 0.3), M(0x21405f), 0, 0.85, 0, g);
  khoi(hopBo(13.05, 0.7, 4.25, 0.25), M(0xb5362b), 0, -0.05, 0, g);
  const mui = khoi(new THREE.ConeGeometry(2.1, 3.2, 4), M(0x21405f), 7.6, 0.9, 0, g); mui.rotation.set(0, PI / 4, -PI / 2); mui.scale.set(1, 1, 0.55);
  khoi(hop(12.6, 0.12, 3.8), M(0xcbb890), 0, 2.02, 0, g);
  const mau = [0xe8762d, 0x1f8a8a, 0xf3e2c2, 0xc0392b, 0xfda127, 0x2f6f9f];
  for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) for (let t = 0; t < (i % 2 ? 1 : 2); t++) khoi(hopBo(1.9, 1.0, 1.5, 0.06), M(mau[(i * 2 + k + t) % 6]), -1.2 + i * 2.05, 2.6 + t * 1.02, -0.85 + k * 1.7, g);
  khoi(hopBo(2.6, 2.6, 3.2, 0.2), M(0xfaf3e3), -4.9, 3.35, 0, g);
  khoi(hop(0.06, 0.7, 2.6), M(0x2c6e7a), -3.58, 3.9, 0, g);
  khoi(tru(0.42, 0.5, 1.4, 12), M(0x1f8a8a), -5.2, 5.3, 0, g); khoi(tru(0.44, 0.44, 0.3, 12), M(0xfda127), -5.2, 5.6, 0, g);
  if (!giam) dong.push(t => { g.position.y = NUOC_Y + Math.sin(t * 0.7 + 1) * 0.03; });
  // cầu ván từ cầu tàu lên tàu, bảng hiệu quay về phía cầu tàu
  const van = khoi(hop(1.3, 0.1, 2.9), M(0xb07a45), 0, 0.82, 14.3); van.rotation.x = -0.56;
  bien('assets/covers/ho-chieu-thuong-hieu-3d-v2.webp', 2.6, scene, 3.6, 1.55, 13.3, PI);
  [[2.5, 13.3], [4.7, 13.3]].forEach(([x, z]) => khoi(tru(0.06, 0.07, 1.5, 6), M(0x8a5a34), x, 0.45, z));
}

function dungTruSo() {   // trụ sở Bật Nghiệp ở Cần Thơ
  const g = nhom(-10, 0, -10.6);
  khoi(hopBo(7, 3.1, 4.6, 0.22), M(0xf6ecd6), 0, 1.55, 0, g);
  khoi(hopBo(4.4, 1.9, 3.6, 0.2), M(0xfaf3e3), -0.9, 4.0, 0, g);
  khoi(hopBo(7.5, 0.34, 5.1, 0.12), M(0x1f8a8a), 0, 3.2, 0, g);
  khoi(hopBo(4.9, 0.3, 4.1, 0.12), M(0xe8762d), -0.9, 5.05, 0, g);
  khoi(hopBo(1.3, 2.0, 0.16, 0.08), M(0xe8762d), 0, 1.0, 2.34, g);
  khoi(hopBo(2.2, 0.16, 1.2, 0.06), M(0x1f8a8a), 0, 2.2, 2.75, g);
  const kinh = M(0x9fd8de, { roughness: 0.35 });
  [[-2.3, 1.6], [2.3, 1.6], [-2.0, 4.0], [0.2, 4.0]].forEach(([x, y]) => khoi(hopBo(1.25, 1.0, 0.1, 0.05), kinh, x, y, y > 3 ? 1.82 : 2.32, g));
  const ten = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.62), new THREE.MeshBasicMaterial({ map: chuTrenBang('BizOn', '#ffffff', '#1f8a8a', 256, 64), toneMapped: false })); ten.position.set(2.0, 4.0, 1.86); g.add(ten);
  [[-3.2, 2.9], [3.2, 2.9]].forEach(([x, z]) => { khoi(tru(0.3, 0.24, 0.5, 10), M(0xc47a4a), x, 0.25, z, g); const c = khoi(cau(0.48, 10, 8), M(0x6aa858), x, 0.9, z, g); c.scale.y = 1.15; });
  chanHop(-13.6, -13.0, -6.4, -8.1); chan(-13.2, -7.7, 0.35); chan(-6.8, -7.7, 0.35);
  bien('assets/covers/bat-nghiep-3d-v3.webp', 2.0, scene, -6.9, 1.5, -7.2, 0);
  [[-7.6, -7.25], [-6.2, -7.25]].forEach(([x, z]) => khoi(tru(0.06, 0.07, 1.4, 6), M(0x8a5a34), x, 0.4, z));
  chan(-6.9, -7.2, 0.85);
}

function dungVuon() {   // vườn sầu riêng của Hộ Chiếu Sầu Riêng
  const cay = (x, z, s = 1) => {
    const g = nhom(x, 0, z); g.scale.setScalar(s);
    khoi(tru(0.2, 0.28, 2.2, 8), M(0x7a5638), 0, 1.1, 0, g);
    const t1 = khoi(cau(1.5, 12, 10), M(0x4f8f4a), 0, 3.0, 0, g); t1.scale.y = 1.05;
    khoi(cau(1.05, 12, 10), M(0x5fa055), 0.5, 4.0, 0.2, g); khoi(cau(0.9, 10, 8), M(0x47843f), -0.7, 3.5, -0.3, g);
    [[0.7, 1.9, 0.6], [-0.6, 2.0, 0.5], [0.1, 1.75, -0.8], [-0.2, 2.1, 0.95]].forEach(([dx, dy, dz]) => {
      khoi(tru(0.015, 0.015, 0.35, 4), M(0x5a4028), dx, dy + 0.3, dz, g); khoi(new THREE.IcosahedronGeometry(0.2, 0), M(0xb9b548, { flatShading: true }), dx, dy, dz, g); });
    chan(x, z, 0.5 * s);
  };
  cay(8.2, -10.2, 1.05); cay(12.6, -9.9, 0.95); cay(10.6, -13.0, 1.15); cay(15.4, -12.2, 1.0); cay(6.2, -13.4, 0.9);
  // sọt sầu riêng và hàng rào tre thấp
  const sot = nhom(9.2, 0, -7.5); khoi(tru(0.5, 0.4, 0.55, 12), M(0xc9a76a), 0, 0.28, 0, sot);
  [[0, 0.62, 0], [0.22, 0.56, 0.16], [-0.2, 0.56, -0.12]].forEach(([x, y, z]) => khoi(new THREE.IcosahedronGeometry(0.2, 0), M(0xb9b548, { flatShading: true }), x, y, z, sot));
  chan(9.2, -7.5, 0.5);
  for (let x = 6.6; x <= 15.2; x += 1.1) { if (Math.abs(x - 10.5) < 1.3) continue; khoi(tru(0.05, 0.05, 0.8, 6), M(0xb9a25a), x, 0.4, -7.9); }
  [[7.55, 1.9], [13.65, 3.1]].forEach(([x, w]) => { const m = khoi(tru(0.035, 0.035, w, 6), M(0xb9a25a), x, 0.6, -7.9); m.rotation.z = PI / 2; });
  chanHop(6.4, -8.05, 9.1, -7.75); chanHop(11.9, -8.05, 15.4, -7.75);
  VAT[VAT.length - 1].cao = false; VAT[VAT.length - 2].cao = false;
  bien('assets/covers/ho-chieu-sau-rieng-3d.webp', 2.0, scene, 12.8, 1.5, -7.3, 0);
  [[12.1, -7.35], [13.5, -7.35]].forEach(([x, z]) => khoi(tru(0.06, 0.07, 1.4, 6), M(0x8a5a34), x, 0.4, z));
  chan(12.8, -7.3, 0.85);
}

function dungNhaSan() {   // nhà sàn BizOn Arcade, có dây đèn lồng
  const g = nhom(-18.6, 0, -2.7), go = M(0x8a5a34);
  [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5], [0, -1.5], [0, 1.5]].forEach(([x, z]) => khoi(tru(0.12, 0.14, 1.3, 8), go, x, 0.65, z, g));
  khoi(hopBo(3.8, 0.24, 3.8, 0.08), M(0xb07a45), 0, 1.4, 0, g);
  khoi(hopBo(3.0, 1.8, 3.0, 0.14), M(0xf3e2c2), 0, 2.4, 0, g);
  khoi(hopBo(0.12, 1.3, 0.9, 0.05), M(0xe8762d), 1.52, 2.2, 0, g);
  const mai = khoi(new THREE.ConeGeometry(3.1, 1.7, 4), M(0xb98a4e), 0, 4.15, 0, g); mai.rotation.y = PI / 4;
  for (let i = 0; i < 4; i++) { const b = khoi(hop(1.0, 0.1, 0.5), M(0xb07a45), 2.25 + i * 0.3, 1.2 - i * 0.33, 0, g); b.castShadow = false; }
  const mauDen = [0xd9483b, 0xf2a23a, 0xf7d154, 0xd9483b, 0xf2a23a];
  mauDen.forEach((c, i) => { const d = khoi(cau(0.17, 10, 8), M(c, { emissive: c, emissiveIntensity: 0.55 }), 1.72, 3.05 - Math.sin(i / 4 * PI) * 0.16, -1.3 + i * 0.65, g); d.scale.y = 1.2; d.castShadow = false;
    if (!giam) dong.push(t => { d.position.y = 3.05 - Math.sin(i / 4 * PI) * 0.16 + Math.sin(t * 1.6 + i) * 0.02; }); });
  chanHop(-20.6, -4.7, -16.6, -0.75);
}

function dungVatNho() {
  // cột mốc Hành trình 3 bậc: ba bậc đất sét chồng lên nhau, có cờ
  const g = nhom(3.3, 0, -1.2), mau = [0xc9a26b, 0x1f8a8a, 0xfda127], chu = ['#3a2a1a', '#ffffff', '#3a2a1a'];
  [1.3, 1.0, 0.7].forEach((w, i) => {
    khoi(hopBo(w, 0.55, w, 0.08), M(mau[i]), 0, 0.28 + i * 0.55, 0, g);
    const so = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ map: chuTrenBang(String(i + 1), chu[i], '#' + mau[i].toString(16).padStart(6, '0'), 64, 64), toneMapped: false }));
    so.position.set(-w / 2 - 0.006, 0.28 + i * 0.55, 0); so.rotation.y = -PI / 2; g.add(so);
  });
  khoi(tru(0.03, 0.03, 0.9, 6), M(0x8a5a34), 0, 2.1, 0, g);
  const co = khoi(hop(0.5, 0.3, 0.02), M(0xd9483b), 0.27, 2.38, 0, g); co.castShadow = false;
  if (!giam) dong.push(t => { co.rotation.y = Math.sin(t * 2.2) * 0.25; });
  chan(3.3, -1.2, 0.75);
  // máy hát
  const mh = nhom(7.3, 0, -2.1); mh.rotation.y = -2.0;
  khoi(hopBo(0.9, 1.3, 0.6, 0.14), M(0xc0392b), 0, 0.65, 0, mh);
  const vom = khoi(tru(0.45, 0.45, 0.6, 16, 1), M(0xf2a23a), 0, 1.3, 0, mh); vom.rotation.x = PI / 2;
  khoi(hopBo(0.62, 0.5, 0.06, 0.04), M(0xfdf1c7, { emissive: 0xf7d154, emissiveIntensity: 0.35 }), 0, 0.85, 0.3, mh);
  chan(7.3, -2.1, 0.5);
  // bảng tin
  const bt = nhom(-6.5, 0, -1.6); bt.rotation.y = 2.3;
  [[-0.55, 0], [0.55, 0]].forEach(([x, z]) => khoi(tru(0.06, 0.07, 1.9, 6), M(0x8a5a34), x, 0.95, z, bt));
  khoi(hopBo(1.4, 0.95, 0.1, 0.05), M(0xb07a45), 0, 1.45, 0, bt);
  [[-0.35, 1.55, 0xfaf3e3], [0.12, 1.6, 0xfde8a8], [0.42, 1.35, 0xcfe8ef], [-0.15, 1.25, 0xfad4c0]].forEach(([x, y, c]) => { const m = khoi(hop(0.3, 0.36, 0.012), M(c), x, y, 0.06, bt); m.castShadow = false; });
  chan(-6.5, -1.6, 0.5);
  // bảng thành tích có cúp
  const tt = nhom(16.7, 0, -2.2); tt.rotation.y = -2.2;
  [[-0.55, 0], [0.55, 0]].forEach(([x, z]) => khoi(tru(0.06, 0.07, 1.9, 6), M(0x8a5a34), x, 0.95, z, tt));
  khoi(hopBo(1.4, 0.95, 0.1, 0.05), M(0x1f8a8a), 0, 1.45, 0, tt);
  khoi(tru(0.2, 0.1, 0.32, 12), M(0xf7c948, { roughness: 0.45, metalness: 0.3 }), 0, 2.2, 0, tt); khoi(tru(0.14, 0.18, 0.1, 12), M(0x8a5a34), 0, 1.98, 0, tt);
  chan(16.7, -2.2, 0.5);
  // một chiếc xuồng nhỏ buộc ở bờ (lượt sau người chơi sẽ chèo được)
  const xg = nhom(5.2, NUOC_Y, 1.5); xg.rotation.y = 1.25;
  const tx = khoi(new THREE.SphereGeometry(1, 14, 8, 0, PI * 2, PI / 2, PI / 2), M(0xa46a3c), 0, 0.42, 0, xg); tx.scale.set(0.55, 0.5, 1.9);
  const sx = khoi(new THREE.CircleGeometry(1, 16), M(0xc49a63), 0, 0.38, 0, xg); sx.rotation.x = -PI / 2; sx.scale.set(0.5, 1.75, 1);
  if (!giam) dong.push(t => { xg.position.y = NUOC_Y + Math.sin(t * 1.3 + 2) * 0.03; xg.rotation.z = Math.sin(t * 0.9) * 0.03; });
}

function dungCanh() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7e3bf); scene.fog = new THREE.Fog(0xf4ddb6, 38, 110);
  scene.add(new THREE.HemisphereLight(0xfff3da, 0xb89a6a, 1.25));
  sun = new THREE.DirectionalLight(0xffe6bd, 2.0); sun.castShadow = renderer.shadowMap.enabled;
  sun.shadow.mapSize.set(nho ? 1024 : 2048, nho ? 1024 : 2048); Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 60 }); sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
  scene.add(sun); scene.add(sun.target);
  if (window.BizOnClayLight) window.BizOnClayLight.rig(THREE, scene, { intensity: 1.1, distance: 14 });
  dungNen(); dungCauTau(); dungGhe(); dungTau(); dungTruSo(); dungVuon(); dungNhaSan(); dungVatNho();
  [[-19.5, -9.5, 4.8, 0.5, 0.4], [-16.5, -13.2, 4.2, 0.4, 2.0], [-3.2, -13.4, 4.6, 0.5, 1.2], [3.8, -13.0, 4.1, 0.4, 3.0], [19.6, -5.6, 4.7, 0.6, 4.2],
    [20.2, -11.5, 4.2, 0.4, 5.0], [-12.8, -1.6, 4.4, 0.7, 1.6], [9.4, -1.5, 4.6, 0.7, 1.4], [13.4, -1.3, 3.9, 0.6, 1.9], [-20.4, -6.6, 4.0, 0.5, 0.2]].forEach(a => dungDua(...a));
  // lớp chi tiết: nền cỏ và đá lát, hàng rào tre, luống rau, bếp lửa, gà vịt… Hỏng thì cảnh gốc vẫn dùng được
  try { chiTiet = lamDayCanh({ THREE, scene, khoi, M, hop, tru, cau, nhom, chan, chanHop: (a, b, c2, d) => VAT.push({ x1: a, z1: b, x2: c2, z2: d }), dong, giam, nhe: nho || !renderer.shadowMap.enabled, NUOC_Y, noi: NOI, diDuoc, nenCu }); }
  catch (e) { chiTiet = null; nenCu.forEach(o => { o.visible = true; }); if (window.console) console.warn('Bến BizOn: bỏ lớp chi tiết', e); }
  // cố vấn
  luminaObj = chars.build('lumina'); luminaObj.position.set(-3.3, 0, -4.6); scene.add(luminaObj); chan(-3.3, -4.6, 0.42);
  tuObj = chars.build('tu'); tuObj.position.set(3.5, 0, -5.0); scene.add(tuObj); chan(3.5, -5.0, 0.42);
}

// ---------------------------------------------------------------- giao diện của trang
const stage = $('bb-stage'), canvas = $('bb-canvas'), note = $('bb-note'), tag = $('bb-tag'), labels = $('bb-labels'), hint = $('bb-hint');
const dlg = $('bb-dlg'), fade = $('bb-fade');
const nho = Math.min(window.innerWidth, window.innerHeight) < 700;
let noteGiu = '', noteT = 0, nhac = null, nhacBat = false, tLoad = 0, tBatDau = 0, daDi = false;
const nhanNoi = [];

function datNote(chu, tam) { note.textContent = chu || ''; note.hidden = !chu; if (tam) { clearTimeout(noteT); noteT = setTimeout(() => datNote(noteGiu), tam); } else noteGiu = chu || ''; }
function veNhan() {
  labels.textContent = ''; nhanNoi.length = 0;
  NOI.forEach(p => { const e = document.createElement('div'); e.className = 'bb-lb'; e.textContent = p.bieuTuong + ' ' + L(p.ten); labels.appendChild(e); nhanNoi.push({ p, e }); });
  if (vai) tag.textContent = L(VAI[vai].nhan) + ' · ' + VAI[vai].ten;
}
const v3 = new THREE.Vector3();
function datLen(e, x, y, z, xaToiDa, px, pz) {
  v3.set(x, y, z).project(camera);
  const d = Math.hypot(x - px, z - pz);
  if (v3.z > 1 || v3.z < -1 || Math.abs(v3.x) > 1.15 || d > xaToiDa) { e.style.display = 'none'; return; }
  e.style.display = ''; e.style.opacity = String(Math.max(0.35, Math.min(1, 1.5 - d / xaToiDa)));
  e.style.transform = 'translate(-50%,-100%) translate(' + ((v3.x + 1) / 2 * stage.clientWidth).toFixed(1) + 'px,' + ((1 - v3.y) / 2 * stage.clientHeight).toFixed(1) + 'px)';
}

// hội thoại của cố vấn, bảng tin, bảng thành tích
let thoai = null, thoaiI = 0;
function veThoai() {
  const c = thoai.cau[thoaiI], cuoi = thoaiI === thoai.cau.length - 1;
  $('bb-dlg-name').textContent = L(thoai.ten); $('bb-dlg-text').textContent = typeof c === 'string' ? c : L(c);
  $('bb-dlg-avatar').src = thoai.anh; $('bb-dlg-next').textContent = L(cuoi ? CHU.dong : CHU.tiep);
  const a = $('bb-dlg-cta'); a.hidden = !(cuoi && thoai.cta); if (thoai.cta) { a.textContent = L(thoai.cta.nhan); a.href = thoai.cta.url; }
}
function moThoai(t, ai) { thoai = t; thoaiI = 0; noiChuyen = ai || null; veThoai(); dlg.classList.add('on'); if (dc) dc.dung(true); $('bb-dlg-next').focus(); }
function dongThoai() { dlg.classList.remove('on'); thoai = null; noiChuyen = null; if (dc) dc.dung(false); const b = stage.querySelector('.dc-vao'); if (b && b.offsetParent) b.focus(); }
$('bb-dlg-next').addEventListener('click', () => { if (!thoai) return; if (thoaiI < thoai.cau.length - 1) { thoaiI++; veThoai(); } else dongThoai(); });
$('bb-dlg-close').addEventListener('click', dongThoai);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && thoai) { dongThoai(); e.stopPropagation(); } });

const KHOA_GHE = 'bizon-hub3d-visited';
const daGhe = () => { try { return JSON.parse(localStorage.getItem(KHOA_GHE) || '[]'); } catch (e) { return []; } };
function ghiGhe(url) { try { const v = daGhe(); if (v.indexOf(url) === -1) { v.push(url); localStorage.setItem(KHOA_GHE, JSON.stringify(v)); } } catch (e) {} }
// các bản khác của cùng game (Sảnh cũ ghi đường dẫn bản 2D) cũng tính là đã ghé
const CUNG_GAME = { 'ben-phu-sa-3d.html': ['ben-phu-sa.html'], 'BizOn Game 3D.html': ['game.html'], 'Ho Chieu Thuong Hieu 3D.html': ['brand-passport.html'] };
function veThanhTich() {
  const v = daGhe(), xong = p => v.indexOf(p.url) !== -1 || (CUNG_GAME[p.url] || []).some(u => v.indexOf(u) !== -1);
  const n = GAME.filter(xong).length;
  return { anh: 'assets/icons/icon-192.png', ten: { vi: '🏆 Bảng thành tích', en: '🏆 Achievement board' }, cta: null,
    cau: [L(CHU.daGhe).replace('{n}', n).replace('{m}', GAME.length), GAME.map(p => (xong(p) ? '✅ ' : '⬜ ') + L(p.ten)).join('  ·  ')] };
}
function batNhac() {
  if (!nhac) { nhac = new Audio('assets/audio/bizon-theme.mp3'); nhac.loop = true; nhac.volume = 0.45; }
  if (nhacBat) nhac.pause(); else nhac.play().catch(() => {});
  nhacBat = !nhacBat; datNote(L(nhacBat ? CHU.nhacBat : CHU.nhacTat), 2600);
}
function vaoNoi(p) {
  if (p.thoai) return moThoai(THOAI[p.thoai], p.thoai === 'lumina' ? luminaObj : p.thoai === 'tu' ? tuObj : null);
  if (p.viec === 'nhac') return batNhac();
  if (p.viec === 'thanh-tich') return moThoai(veThanhTich());
  if (p.url) { ghiGhe(p.url); dc.dung(true); fade.classList.add('on'); setTimeout(() => { window.location.href = p.url; }, giam ? 0 : 430); }
}

// ---------------------------------------------------------------- vòng vẽ
function coGiu() {
  const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 62 : 50; camera.updateProjectionMatrix();
}
function ve(ms) {
  raf = requestAnimationFrame(ve);
  const t = ms / 1000, dt = Math.min(0.05, Math.max(0, t - (tLast || t))); tLast = t; dongHo += dt;
  dc.update(dt);
  const s = dc.state(), rig = player.userData.rig || {};
  // dáng đi khớp tốc độ (ben-bizon-dang-di.js); mô hình có xương chưa tải xong thì vẫn dùng tranh dựng đứng như cũ
  if (tranh) tranh.capNhat(dt, s.speed, s.yaw, camera.position.x, camera.position.z);
  else if (!dangDi || !dangDi.capNhat(dt, s.speed, s.yaw)) chars.animate(player, dongHo, s.mode === 'walk' ? 'walk' : 'idle');
  if (dangDi && dangDi.khoHong && !daHaToc) { daHaToc = true; dc.tocDo({ chay: 1.5 }); }
  // cố vấn quay về phía người chơi khi ở gần, nói khi đang mở hội thoại
  [luminaObj, tuObj].forEach((o, i) => {
    const d = Math.hypot(s.x - o.position.x, s.z - o.position.z), muon = d < 5 ? Math.atan2(s.x - o.position.x, s.z - o.position.z) : (i ? -0.5 : 0.5);
    let l = muon - o.rotation.y; l = Math.atan2(Math.sin(l), Math.cos(l)); o.rotation.y += l * Math.min(1, dt * 4);
    chars.animate(o, dongHo, noiChuyen === o ? 'talk' : 'idle', i * 1.7);
  });
  for (let i = 0; i < dong.length; i++) dong[i](dongHo);
  sun.target.position.set(s.x, 0, s.z); sun.position.set(s.x - 10, 15, s.z + 4);
  renderer.render(scene, camera);
  datLen(tag, s.x, 1.36, s.z, 99, s.x, s.z);
  for (let i = 0; i < nhanNoi.length; i++) { const n = nhanNoi[i]; datLen(n.e, n.p.mx, n.p.my, n.p.mz, 26, s.x, s.z); }
  if (!daDi && s.speed > 0.5) { daDi = true; hint.hidden = true; }
  // trạng thái tải mô hình: quá 10 giây (theo đồng hồ, không theo số khung hình) chưa có thì báo đang dùng tranh; có rồi thì gỡ dòng báo
  if (rig.glb) { if (tLoad >= 0) { tLoad = -1; datNote(''); } }
  else if (tLoad >= 0 && tLoad < 99 && performance.now() - tBatDau > 10000) { tLoad = 99; datNote(L(navigator.onLine === false ? CHU.mang : CHU.tranh)); }
  sanSang = true;
}

function khoiTao() {
  if (renderer) return true;
  try {
    const thu = document.createElement('canvas'); if (!(thu.getContext('webgl2') || thu.getContext('webgl'))) return false;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; return false; }
  const yeu = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, yeu ? 1.25 : nho ? 1.75 : 2));
  renderer.shadowMap.enabled = !yeu; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 260);
  chars = makeCharacters(THREE);
  dungCanh();
  window.addEventListener('resize', () => { if (document.documentElement.classList.contains('bb-play')) coGiu(); });
  return true;
}

// Hai góc máy: sau lưng (mặc định) và nhìn từ trên cao xuống, thấy cả sân bến. Nhớ lựa chọn trong localStorage.
const GOC = { sau: { xa: 4.4, cao: 2.8, nhin: 1.05 }, cao: { xa: 6.4, cao: 8.6, nhin: 0.5 } };
let goc = (() => { try { return localStorage.getItem('bizon-ben-goc') === 'cao' ? 'cao' : 'sau'; } catch (e) { return 'sau'; } })();
const nutGoc = $('bb-goc');
function datGoc(g) {
  goc = GOC[g] ? g : 'sau'; try { localStorage.setItem('bizon-ben-goc', goc); } catch (e) {}
  if (nutGoc) nutGoc.setAttribute('aria-pressed', goc === 'cao' ? 'true' : 'false');
  if (dc && dc.mayQuay) dc.mayQuay(GOC[goc]);
}
if (nutGoc) { nutGoc.setAttribute('aria-pressed', goc === 'cao' ? 'true' : 'false'); nutGoc.addEventListener('click', () => datGoc(goc === 'cao' ? 'sau' : 'cao')); }

function batDau(v) {
  if (!VAI[v]) return;
  if (!khoiTao()) { $('bb-fallback').hidden = false; $('bb-links').scrollIntoView({ block: 'nearest' }); return; }
  try { localStorage.setItem('bizon-ben-vai', v); } catch (e) {}
  vai = v; sanSang = false; tLoad = 0; tBatDau = performance.now(); daDi = false; hint.hidden = false;
  document.documentElement.classList.add('bb-play'); fade.classList.remove('on');
  if (dc) dc.dispose(); if (player) scene.remove(player);
  if (tranh) { tranh.huy(); tranh = null; }
  if (NV_TRANH && CO_TRANH[v]) { tranh = taoTranhDong(v, { cao: 1.2, tocDi: TOC_DI, giam }); player = tranh.root; scene.add(player); dangDi = null; }
  else { player = chars.build(v); scene.add(player); dangDi = taoDangDi(player, { giam }); }
  daHaToc = false;
  coGiu(); veNhan(); datNote(L(CHU.tai));
  dc = window.BizOnDiChuyen.create({ THREE, camera, canvas, host: stage, player, places: NOI, diDuoc, cheMay, lang, onEnter: vaoNoi, giamChuyenDong: giam, batDau: { x: 0, z: -7, yaw: 0 }, tocDoDi: TOC_DI, tocDoChay: tranh ? 1.8 : TOC_CHAY, tocQuay: 8, camXa: GOC[goc].xa, camCao: GOC[goc].cao, camNhin: GOC[goc].nhin });
  khoaNen(true); try { stage.focus({ preventScroll: true }); } catch (e) {}
  cancelAnimationFrame(raf); tLast = 0; raf = requestAnimationFrame(ve);
}
// Khi cảnh phủ toàn màn hình, phần trang bên dưới không được nhận tiêu điểm bàn phím hay trình đọc màn hình
function khoaNen(khoa) {
  document.querySelectorAll('main > *, body > *').forEach(e => { if (e === stage || e.contains(stage) || /^(SCRIPT|STYLE)$/.test(e.tagName)) return; if (khoa) e.setAttribute('inert', ''); else e.removeAttribute('inert'); });
}
function thoat() {
  cancelAnimationFrame(raf); raf = 0; if (thoai) dongThoai();
  if (nhac && nhacBat) { nhac.pause(); nhacBat = false; }
  if (dc) { dc.dispose(); dc = null; }   // trả phím mũi tên, WASD lại cho trang
  document.documentElement.classList.remove('bb-play'); sanSang = false; khoaNen(false);
  const b = document.querySelector('#bb-pick [data-vai="' + vai + '"]'); if (b) b.focus();
}

document.querySelectorAll('#bb-pick [data-vai]').forEach(b => b.addEventListener('click', () => batDau(b.getAttribute('data-vai'))));
$('bb-exit').addEventListener('click', thoat);
window.addEventListener('bizon:langchange', () => { if (!dc) return; dc.lamMoiChu(); veNhan(); if (thoai) veThoai(); if (noteGiu) datNote(L(tLoad === 99 ? CHU.tranh : CHU.tai)); });
window.addEventListener('pageshow', e => { if (e.persisted) { fade.classList.remove('on'); if (dc) dc.dung(false); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (dc && document.documentElement.classList.contains('bb-play') && !raf) { tLast = 0; raf = requestAnimationFrame(ve); } });
try { const cu = localStorage.getItem('bizon-ben-vai'); const b = cu && document.querySelector('#bb-pick [data-vai="' + cu + '"]'); if (b) b.classList.add('da-chon'); } catch (e) {}

// cửa đọc trạng thái cho test (Playwright) và để gỡ lỗi
window.__benBizon = {
  state() { const s = dc ? dc.state() : {}, rig = (player && player.userData.rig) || {}; return Object.assign(s, { ready: !!(dc && sanSang), goc, dang: dangDi && dangDi.sanSang ? dangDi.thongSo().dang : null, tranh: tranh ? Object.assign({ sanSang: tranh.sanSang, hong: tranh.hong }, tranh.thongSo()) : null, char: vai, glb: !!rig.glb, clip: rig.glb ? rig.cur : s.mode }); },
  info: () => ({ canh: 'ben-song', nuoc: true, cauTau: true, diaDiem: NOI.map(p => p.id), chiTiet, goc, dangDi: dangDi && dangDi.sanSang ? Object.assign({ coChay: dangDi.coChay, khoHong: dangDi.khoHong }, dangDi.thongSo()) : null, veMoiKhung: renderer ? renderer.info.render.calls : 0 }),
  datGoc,
  laBo, dat: (x, z, yaw) => dc && dc.dat(x, z, yaw),
};
