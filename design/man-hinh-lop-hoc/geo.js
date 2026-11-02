// Bản phác «Màn hình lớp học» – phần dùng chung: chiếu kinh/vĩ độ sang mặt phẳng, dựng khối Việt Nam từ assets/geo/vnm.json,
// tuyến sông và địa danh đồng bằng (toạ độ gần đúng, chỉ để phác).
import * as THREE from '../../vendor/three/three.module.js';
export { THREE };
export const C = { lon: 105.9, lat: 10.15 };           // tâm khung: giữa đồng bằng
const K = 10;                                            // 1 độ ≈ 10 đơn vị
export function P(lon, lat) { return new THREE.Vector2((lon - C.lon) * K * Math.cos(C.lat * Math.PI / 180), -(lat - C.lat) * K); }
export const PLACES = {
  canTho:  { vi: 'Cần Thơ', lon: 105.78, lat: 10.03 },
  chauDoc: { vi: 'Châu Đốc', lon: 105.12, lat: 10.70 },
  vinhLong:{ vi: 'Vĩnh Long', lon: 105.97, lat: 10.25 },
  myTho:   { vi: 'Mỹ Tho', lon: 106.36, lat: 10.36 },
  hcm:     { vi: 'TP. Hồ Chí Minh', lon: 106.70, lat: 10.78 },
  caiMep:  { vi: 'Cảng Cái Mép', lon: 107.03, lat: 10.53 },
};
export const RIVERS = {
  hau:  [[105.10, 10.72], [105.25, 10.55], [105.43, 10.38], [105.62, 10.18], [105.78, 10.03], [106.0, 9.82], [106.2, 9.66], [106.42, 9.52]],
  tien: [[105.24, 10.80], [105.45, 10.62], [105.63, 10.46], [105.95, 10.34], [106.18, 10.33], [106.36, 10.36], [106.6, 10.27], [106.8, 10.2]],
};
// Tuyến minh hoạ: bến Cần Thơ → Vĩnh Long → Mỹ Tho → TP.HCM → cảng Cái Mép
export const ROUTE = [[105.78, 10.03], [105.97, 10.25], [106.36, 10.36], [106.70, 10.78], [107.03, 10.53]];
export async function vnShapes(url) {
  const g = await (await fetch(url)).json();
  return g.coordinates.map(poly => {
    const s = new THREE.Shape(poly[0].map(([x, y]) => P(x, y)));
    poly.slice(1).forEach(h => s.holes.push(new THREE.Path(h.map(([x, y]) => P(x, y)))));
    return s;
  });
}
export function curve(pts, y = 0.32) { return new THREE.CatmullRomCurve3(pts.map(([x, z]) => { const v = P(x, z); return new THREE.Vector3(v.x, y, v.y); })); }
export const TEAMS = ['Phù Sa', 'Sen Hồng', 'Cá Linh', 'Đom Đóm', 'Bông Điên Điển', 'Gió Chướng', 'Ghe Lườn', 'Lục Bình', 'Mù U', 'Bần Chua'];
// Tiến độ minh hoạ (0–1 trên tuyến) – KHÔNG phải dữ liệu thật
export const PROG = [0.92, 0.81, 0.74, 0.66, 0.61, 0.55, 0.47, 0.38, 0.30, 0.18];
export const TEAM_COLORS = ['#FDA127', '#E86A8C', '#2F8A8C', '#F4D35E', '#8FB339', '#5B8DEF', '#C0703A', '#7FC8A9', '#B48EAD', '#E8762D'];
