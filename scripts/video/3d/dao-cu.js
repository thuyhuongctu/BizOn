/* BizOn – đạo cụ đất sét cho bộ dựng video dọc 3D (đặc tả specs/004-video-ngan-3d).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Khối đơn giản, mặt hơi sần như đất nặn: nón lá, thùng xốp, bàn kiểm, container, hàng rào tre, cây và trái sầu riêng,
 * bảng chữ. Mỗi hàm trả về một THREE.Group, đơn vị là mét của cảnh (người cao khoảng 1,2). Không dùng số ngẫu nhiên theo
 * đồng hồ: vân đất được sinh bằng hạt giống cố định để khung hình tất định.
 */
import * as THREE from 'three';

// bộ sinh số có hạt giống (mulberry32): cùng hạt giống thì cùng chuỗi số
export function hatGiong(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// vân đất nặn: một tấm vân sần dùng chung làm bản đồ gồ ghề cho mọi đạo cụ
let vanDat = null;
function layVanDat() {
  if (vanDat) return vanDat;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), r = hatGiong(7);
  g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { const v = 100 + r() * 60 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc(r() * 256, r() * 256, 0.6 + r() * 2.2, 0, 7); g.fill(); }
  vanDat = new THREE.CanvasTexture(c); vanDat.wrapS = vanDat.wrapT = THREE.RepeatWrapping; vanDat.repeat.set(3, 3);
  return vanDat;
}
export function datSet(mau, { tho = 0.85, bong = 0.025 } = {}) {
  return new THREE.MeshStandardMaterial({ color: mau, roughness: tho, metalness: 0, bumpMap: layVanDat(), bumpScale: bong });
}
const khoi = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };

/* Nón lá: chóp nón dẹt màu rơm, có vòng vân đan và quai. r: bán kính vành (mét). Gốc tọa độ ở đáy vành. */
export function nonLa(r = 0.24) {
  const g = new THREE.Group(), rom = datSet(0xd9c08a, { tho: 0.9 }), dam = datSet(0xb89a60);
  const h = r * 0.85;   // chóp kín, đủ cao để tóc không lộ qua
  const non = khoi(new THREE.ConeGeometry(r, h, 40, 1, false), rom, 0, h / 2, 0); non.material.side = THREE.DoubleSide; g.add(non);
  for (let i = 1; i <= 5; i++) { const k = i / 6; const vong = khoi(new THREE.TorusGeometry(r * (1 - k), r * 0.012, 6, 48), dam, 0, h * k, 0); vong.rotation.x = Math.PI / 2; g.add(vong); }
  const vanh = khoi(new THREE.TorusGeometry(r, r * 0.025, 6, 48), dam, 0, 0.002, 0); vanh.rotation.x = Math.PI / 2; g.add(vanh);
  g.userData.loai = 'non-la'; return g;
}

/* Thùng xốp trắng ngà đựng trái (rộng × cao × sâu). */
export function thungXop(w = 0.5, h = 0.32, d = 0.36) {
  const g = new THREE.Group(), xop = datSet(0xf1ece0, { tho: 0.95 });
  g.add(khoi(new THREE.BoxGeometry(w, h, d), xop, 0, h / 2, 0));
  const nap = khoi(new THREE.BoxGeometry(w * 1.04, 0.04, d * 1.04), datSet(0xe6dfcf), 0, h + 0.02, 0); g.add(nap);
  return g;
}

/* Bàn kiểm gỗ (có thể đặt trái sầu riêng lên). */
export function banKiem(w = 1.2, d = 0.6, h = 0.72) {
  const g = new THREE.Group(), go = datSet(0x9a6b45), chan = datSet(0x7a5233);
  g.add(khoi(new THREE.BoxGeometry(w, 0.06, d), go, 0, h, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(khoi(new THREE.BoxGeometry(0.06, h, 0.06), chan, x * (w / 2 - 0.06), h / 2, z * (d / 2 - 0.06)));
  g.userData.matBan = h + 0.03; return g;
}

/* Container 20 feet thu nhỏ (gân dọc hai bên). mau: màu sơn. */
export function container(mau = 0xc0503a, dai = 3.0, cao = 1.3, rong = 1.25) {
  const g = new THREE.Group(), son = datSet(mau, { tho: 0.7 }), gan = datSet(new THREE.Color(mau).multiplyScalar(0.82));
  g.add(khoi(new THREE.BoxGeometry(dai, cao, rong), son, 0, cao / 2, 0));
  for (let i = 0; i < 14; i++) { const x = -dai / 2 + 0.12 + i * (dai - 0.24) / 13; for (const z of [-1, 1]) g.add(khoi(new THREE.BoxGeometry(0.05, cao * 0.9, 0.03), gan, x, cao / 2, z * (rong / 2 + 0.01))); }
  return g;
}

/* Hàng rào tre thấp (dài theo trục x). */
export function hangRao(dai = 4, cao = 0.55) {
  const g = new THREE.Group(), tre = datSet(0xb59a5a);
  const n = Math.max(2, Math.round(dai / 0.35));
  for (let i = 0; i <= n; i++) g.add(khoi(new THREE.CylinderGeometry(0.03, 0.035, cao, 8), tre, -dai / 2 + i * dai / n, cao / 2, 0));
  for (const y of [cao * 0.35, cao * 0.8]) { const t = khoi(new THREE.CylinderGeometry(0.02, 0.02, dai, 8), tre, 0, y, 0); t.rotation.z = Math.PI / 2; g.add(t); }
  return g;
}

/* Trái sầu riêng: khối gần cầu xanh vàng phủ gai hình nón nhỏ. r: bán kính (mét). seed: hạt giống cho vị trí gai. */
export function traiSauRieng(r = 0.12, seed = 3, mau = 0x8a9a3a) {
  const g = new THREE.Group(), vo = datSet(mau, { tho: 0.9, bong: 0.04 }), gai = datSet(new THREE.Color(mau).multiplyScalar(0.85));
  const than = khoi(new THREE.SphereGeometry(r, 24, 18), vo, 0, r, 0); than.scale.set(1, 1.15, 1); g.add(than);
  const ng = new THREE.ConeGeometry(r * 0.12, r * 0.22, 5), rnd = hatGiong(seed);
  for (let i = 0; i < 70; i++) {
    const u = rnd() * 2 - 1, p = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), v = new THREE.Vector3(s * Math.cos(p), u * 1.15, s * Math.sin(p));
    const m = khoi(ng, gai); m.position.copy(v.clone().multiplyScalar(r)).add(new THREE.Vector3(0, r, 0)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); g.add(m);
  }
  const cuong = khoi(new THREE.CylinderGeometry(r * 0.08, r * 0.1, r * 0.4, 8), datSet(0x6b5a2a), 0, r * 2.35, 0); g.add(cuong);
  g.userData.loai = 'trai'; return g;
}

/* Cây sầu riêng đơn giản: thân nâu, tán xanh nhiều khối cầu, vài trái treo. */
export function caySauRieng(cao = 2.6, seed = 11) {
  const g = new THREE.Group(), rnd = hatGiong(seed), than = datSet(0x6e4a2e), la = datSet(0x4f7d3a, { tho: 0.95, bong: 0.05 });
  g.add(khoi(new THREE.CylinderGeometry(0.09, 0.13, cao * 0.55, 10), than, 0, cao * 0.275, 0));
  for (let i = 0; i < 7; i++) { const a = rnd() * Math.PI * 2, d = rnd() * 0.5; g.add(khoi(new THREE.SphereGeometry(0.45 + rnd() * 0.25, 16, 12), la, Math.cos(a) * d, cao * 0.62 + rnd() * cao * 0.25, Math.sin(a) * d)); }
  for (let i = 0; i < 4; i++) { const a = i * 1.7 + 0.3, t = traiSauRieng(0.09, seed + i); t.position.set(Math.cos(a) * 0.55, cao * 0.5, Math.sin(a) * 0.55); g.add(t); }
  return g;
}

/* Bảng chữ đất sét: tấm ván có chữ vẽ bằng canvas (chữ phải là sự thật trong kịch bản). */
export function bangChu(dong, { rong = 1.4, cao = 0.7, nen = '#f3e6c4', chu = '#3a2a18', co = 64 } = {}) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * cao / rong); const g2 = c.getContext('2d');
  g2.fillStyle = nen; g2.fillRect(0, 0, c.width, c.height); g2.fillStyle = chu; g2.textAlign = 'center'; g2.textBaseline = 'middle';
  g2.font = `700 ${co}px "Be Vietnam Pro", "Segoe UI", sans-serif`;
  const ds = Array.isArray(dong) ? dong : [dong]; ds.forEach((d, i) => g2.fillText(d, c.width / 2, c.height * (i + 1) / (ds.length + 1)));
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group(), van = khoi(new THREE.BoxGeometry(rong, cao, 0.05), [datSet(0x8a6040), datSet(0x8a6040), datSet(0x8a6040), datSet(0x8a6040), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9 }), datSet(0x8a6040)], 0, cao / 2, 0);
  g.add(van); return g;
}

export const DAO_CU = { 'non-la': nonLa, 'thung-xop': thungXop, 'ban-kiem': banKiem, container, 'hang-rao': hangRao, trai: traiSauRieng, cay: caySauRieng, bang: bangChu };
