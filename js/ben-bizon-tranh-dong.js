/* BizOn – «Bến BizOn»: nhân vật «tranh động» (bản thử). © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Nhân vật là một tấm tranh động dựng đứng trong cảnh 3D: tranh gốc được vẽ thành các đoạn đi bộ theo ba hướng nhìn (từ trước,
 * ngang, từ sau), tách nền và cắt thành vòng lặp (scripts/3d/tach-nen-sprite.py), lưu thành tờ sprite ở assets/character/tranh-dong/.
 * Tấm tranh luôn quay mặt về máy quay; hướng nhìn chọn theo góc giữa hướng đi và máy quay (đi sang trái thì lật gương tờ «ngang»);
 * nhịp khung hình theo tốc độ đang đi. Đứng yên thì dừng ở khung đầu của hướng đang nhìn. Không gọi mạng ngoài trang.
 */
import * as THREE from 'three';

const THU_MUC = 'assets/character/tranh-dong/';
const HUONG = ['truoc', 'ngang', 'sau'];
const gocGan = a => Math.atan2(Math.sin(a), Math.cos(a));

/* id: mã nhân vật có tờ sprite (hiện chỉ 'ceo'); cao: chiều cao trong cảnh; tocDi: tốc độ đi mà vòng lặp phát đúng nhịp gốc */
export function taoTranhDong(id, { cao = 1.2, tocDi = 1.15, giam = false } = {}) {
  const root = new THREE.Group(), to = {}; let san = false, hong = false, huong = 'sau', lat = 1, khung = 0, dem = 0;
  const vl = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, toneMapped: false });
  const tam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), vl); tam.visible = false; tam.renderOrder = 2; root.add(tam);
  const bong = new THREE.Mesh(new THREE.CircleGeometry(0.26, 20), new THREE.MeshBasicMaterial({ color: 0x2a2010, transparent: true, opacity: 0.22, depthWrite: false }));
  bong.rotation.x = -Math.PI / 2; bong.position.y = 0.03; bong.scale.y = 0.6; root.add(bong);
  const nap = new THREE.TextureLoader();
  Promise.all(HUONG.map(h => fetch(THU_MUC + id + '-di-' + h + '.json').then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(j => new Promise((ok, loi) => nap.load(THU_MUC + id + '-di-' + h + '.webp', t => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; to[h] = { t, j }; ok(); }, undefined, loi)))))
    .then(() => { san = true; tam.visible = true; dat('sau', 1, 0); }).catch(() => { hong = true; });
  function dat(h, l, k) {   // chọn tờ sprite, hướng lật và khung hình
    const s = to[h], j = s.j, n = ((k % j.khung) + j.khung) % j.khung, cot = n % j.cot, hang = Math.floor(n / j.cot);
    if (vl.map !== s.t) { vl.map = s.t; vl.needsUpdate = true; tam.scale.set(cao * j.rong / j.cao, cao, 1); tam.position.y = cao / 2; }
    s.t.repeat.set(l / j.cot, 1 / j.hang); s.t.offset.set((l > 0 ? cot : cot + 1) / j.cot, 1 - (hang + 1) / j.hang);
    huong = h; lat = l; khung = n;
  }
  return {
    root, get sanSang() { return san; }, get hong() { return hong; },
    thongSo: () => ({ huong, lat, khung, soKhung: san ? to[huong].j.khung : 0 }),
    /* toc: tốc độ trên mặt đất; yaw: hướng đi; mx, mz: vị trí máy quay */
    capNhat(dt, toc, yaw, mx, mz) {
      if (!san) return false;
      const veMay = Math.atan2(mx - root.position.x, mz - root.position.z);
      tam.rotation.y = veMay - root.rotation.y;                      // tấm tranh quay mặt về máy quay dù nhóm đã xoay theo hướng đi
      const lech = gocGan(yaw - (veMay + Math.PI));                    // 0: đi ra xa máy quay; ±π: đi về phía máy quay
      let h = huong, l = lat;
      if (toc > 0.08) { const a = Math.abs(lech); h = a < Math.PI * 0.27 ? 'sau' : a > Math.PI * 0.73 ? 'truoc' : 'ngang'; l = h === 'ngang' ? (lech < 0 ? 1 : -1) : 1; }
      const j = to[h].j;
      if (toc > 0.08 && !giam) { dem += dt * j.fps * Math.max(0.6, Math.min(1.7, toc / tocDi)); if (h !== huong) dem = dem % j.khung; }
      else if (toc <= 0.08) dem = 0;
      dat(h, l, Math.floor(dem));
      return true;
    },
    huy() { HUONG.forEach(h => { if (to[h]) to[h].t.dispose(); }); vl.dispose(); tam.geometry.dispose(); bong.geometry.dispose(); bong.material.dispose(); },
  };
}
