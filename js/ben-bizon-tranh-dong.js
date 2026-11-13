/* BizOn – «Bến BizOn»: nhân vật «tranh động» (bản thử). © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Nhân vật là một tấm tranh động dựng đứng trong cảnh 3D: tranh gốc được vẽ thành các đoạn phim ngắn (đi bộ nhìn từ trước, ngang,
 * từ sau; đứng thở; đứng nói), tách nền và cắt thành vòng lặp (scripts/3d/tach-nen-sprite.py), lưu thành tờ sprite ở
 * assets/character/tranh-dong/<mã>-<động tác>.webp kèm .json. Tấm tranh luôn quay mặt về máy quay.
 *   • Đang đi: chọn tờ theo góc giữa hướng đi và máy quay (đi sang trái thì lật gương tờ «ngang»); nhịp khung hình theo tốc độ.
 *   • Vừa dừng: giữ khung đầu của hướng đang nhìn; đứng yên quá nửa giây thì quay ra nhìn người chơi và thở nhẹ (tờ «dung»).
 *   • Cố vấn (không đi): thở nhẹ, đang mở hội thoại thì dùng tờ «noi».
 * Tờ «dung» và «noi» phát xuôi rồi phát ngược ("quaLai" trong JSON) nên không thấy mối nối. Không gọi mạng ngoài trang.
 */
import * as THREE from 'three';

const THU_MUC = 'assets/character/tranh-dong/';
const DI = ['di-truoc', 'di-ngang', 'di-sau'];
/* Tờ sprite đã có của từng nhân vật. Vai đội cần đủ ba hướng đi mới dùng làm người chơi; cố vấn chỉ cần «dung» (và «noi»). */
export const BO_TRANH = {
  ceo: [...DI, 'dung'], cfo: [...DI, 'dung'], cmo: [...DI, 'dung'], coo: [...DI, 'dung'], sec: [...DI, 'dung'],
  lumina: ['dung', 'noi'], tu: ['dung', 'noi'],
};
/* Tờ đã làm lại thì nạp bản mới (tệp cũ giữ nguyên trong kho). Thầy Tu Phan v2 (13/11/2026): dựng thẳng từ tranh gốc áo dài
 * assets/character/anh-tu-ao-dai-cut-v2.webp, vì bản đầu làm từ ảnh mẫu vẽ lại nên chưa giống. Tờ đứng v3 (13/11/2026): đầu thu còn
 * 80 % cho cân với thân (chị thấy đầu to hơn thân), tờ nói v2 giữ nguyên vì tỷ lệ đã cân. */
export const BAN_MOI = { 'tu-dung': 'tu-dung-v3', 'tu-noi': 'tu-noi-v2' };
const tep = (id, t) => THU_MUC + (BAN_MOI[id + '-' + t] || id + '-' + t);
export const diDuoc = id => !!BO_TRANH[id] && DI.every(t => BO_TRANH[id].includes(t));
const gocGan = a => Math.atan2(Math.sin(a), Math.cos(a));
const CHO_QUAY = 0.45;   // giây đứng yên trước khi quay ra nhìn người chơi

/* id: mã nhân vật trong BO_TRANH; cao: chiều cao trong cảnh; tocDi: tốc độ đi mà vòng lặp phát đúng nhịp gốc */
export function taoTranhDong(id, { cao = 1.2, tocDi = 1.15, giam = false } = {}) {
  const bo = BO_TRANH[id] || [], coDi = diDuoc(id), root = new THREE.Group(), to = {};
  let san = false, hong = false, ten = coDi ? 'di-sau' : 'dung', lat = 1, khung = 0, dem = 0, dungLau = 0, dangNoi = false;
  const vl = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, toneMapped: false });
  const tam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), vl); tam.visible = false; tam.renderOrder = 2; root.add(tam);
  const bong = new THREE.Mesh(new THREE.CircleGeometry(0.26, 20), new THREE.MeshBasicMaterial({ color: 0x2a2010, transparent: true, opacity: 0.22, depthWrite: false }));
  bong.rotation.x = -Math.PI / 2; bong.position.y = 0.03; bong.scale.y = 0.6; root.add(bong);
  const nap = new THREE.TextureLoader();
  Promise.all(bo.map(t => fetch(tep(id, t) + '.json').then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
    .then(j => new Promise((ok, loi) => nap.load(tep(id, t) + '.webp', tx => { tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = THREE.RepeatWrapping; to[t] = { t: tx, j }; ok(); }, undefined, loi)))))
    .then(() => { if (!bo.length) throw new Error('khong co to sprite'); san = true; tam.visible = true; dat(ten, 1, 0); }).catch(() => { hong = true; });
  /* số khung thứ k của một tờ: tờ «qua lại» đi 0…K−1 rồi K−2…1 */
  function khungCua(j, k) { const K = j.khung; if (!j.quaLai || K < 3) return ((k % K) + K) % K; const m = k % (2 * K - 2); return m < K ? m : 2 * K - 2 - m; }
  function dat(t, l, k) {   // chọn tờ sprite, hướng lật và khung hình
    const s = to[t], j = s.j, n = khungCua(j, k), cot = n % j.cot, hang = Math.floor(n / j.cot);
    if (vl.map !== s.t) { vl.map = s.t; vl.needsUpdate = true; tam.scale.set(cao * j.rong / j.cao, cao, 1); tam.position.y = cao / 2; }
    s.t.repeat.set(l / j.cot, 1 / j.hang); s.t.offset.set((l > 0 ? cot : cot + 1) / j.cot, 1 - (hang + 1) / j.hang);
    ten = t; lat = l; khung = n;
  }
  return {
    root, get sanSang() { return san; }, get hong() { return hong; },
    /* huong: 'truoc' | 'ngang' | 'sau' (tờ đứng và nói đều nhìn từ trước); dongTac: 'di' | 'dung' | 'noi' */
    thongSo: () => ({ huong: ten.startsWith('di-') ? ten.slice(3) : 'truoc', lat, khung, soKhung: san ? to[ten].j.khung : 0, dongTac: ten.startsWith('di-') ? (dungLau > 0 ? 'dung' : 'di') : ten, to: ten }),
    noi(bat) { dangNoi = !!bat; },
    /* toc: tốc độ trên mặt đất; yaw: hướng đi; mx, mz: vị trí máy quay */
    capNhat(dt, toc, yaw, mx, mz) {
      if (!san) return false;
      const veMay = Math.atan2(mx - root.position.x, mz - root.position.z);
      tam.rotation.y = veMay - root.rotation.y;                      // tấm tranh quay mặt về máy quay dù nhóm đã xoay theo hướng đi
      let t = ten, l = lat;
      if (coDi && toc > 0.08) {
        const lech = gocGan(yaw - (veMay + Math.PI)), a = Math.abs(lech);   // 0: đi ra xa máy quay; ±π: đi về phía máy quay
        t = a < Math.PI * 0.27 ? 'di-sau' : a > Math.PI * 0.73 ? 'di-truoc' : 'di-ngang'; l = t === 'di-ngang' ? (lech < 0 ? 1 : -1) : 1;
        if (t !== ten) dem = ten.startsWith('di-') ? dem % to[t].j.khung : 0;
        if (!giam) dem += dt * to[t].j.fps * Math.max(0.6, Math.min(1.7, toc / tocDi));
        dungLau = 0;
      } else {
        dungLau += dt;
        const muon = dangNoi && to.noi ? 'noi' : to.dung && (!coDi || dungLau > CHO_QUAY) ? 'dung' : null;
        if (muon && !giam) { if (muon !== ten) dem = 0; else dem += dt * to[muon].j.fps; t = muon; l = 1; }
        else if (muon && !coDi) { t = muon; l = 1; dem = 0; }           // giảm chuyển động: cố vấn đứng yên ở khung đầu
        else dem = 0;                                                    // vừa dừng (hoặc giảm chuyển động): khung đầu của hướng đang nhìn
      }
      dat(t, l, Math.floor(dem));
      return true;
    },
    huy() { Object.values(to).forEach(s => s.t.dispose()); vl.dispose(); tam.geometry.dispose(); bong.geometry.dispose(); bong.material.dispose(); },
  };
}
