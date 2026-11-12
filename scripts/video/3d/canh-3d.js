/* BizOn – trang dựng cảnh cho bộ dựng video dọc 3D (đặc tả specs/004-video-ngan-3d, câu chuyện 1).
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Trang này không thuộc trang web BizOn: scripts/video/3d/dung-video-3d.mjs mở nó trong Chromium, gọi veKhung(n) cho từng
 * khung rồi chụp. Mọi thứ trên hình là hàm thuần của thời gian t = n / fps: không requestAnimationFrame, không Date.now,
 * không số ngẫu nhiên theo đồng hồ. Nhờ vậy dựng hai lần cho ra cùng khung hình, máy nhanh hay chậm cũng vậy.
 *
 * Nhân vật là các tệp GLB đất sét có sẵn của BizOn (assets/models/nhan-vat/). Clip thiếu (Wave, Cheer, Run…) ghép từ kho
 * dong-tac-v1.glb bằng ghepClip của js/ben-bizon-dang-di.js. Không dùng bizon-characters.js (tệp thuộc hồ sơ quyền tác giả).
 * Ý tưởng render tất định qua trình duyệt và cấu trúc cảnh theo mốc học từ thuann-vn/claude-3d-animated-shorts (MIT);
 * mã viết mới, không chép.
 */
import * as THREE from 'three';
import { GLTFLoader } from '../../../js/vendor/GLTFLoader.js';
import { clone as nhanBan } from '../../../js/vendor/SkeletonUtils.js';
import { ghepClip } from '../../../js/ben-bizon-dang-di.js';
import { DAO_CU, nonLa } from './dao-cu.js';

const q = new URLSearchParams(location.search);
const W = +q.get('w') || 1080, H = +q.get('h') || 1920;
const KHO = '../../../assets/models/nhan-vat/dong-tac-v1.glb';
const goc = p => '../../../' + p.replace(/^\/+/, '');   // đường dẫn trong kế hoạch tính từ gốc kho

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 200);
const loader = new GLTFLoader();
const taiGlb = url => new Promise((ok, loi) => loader.load(url, ok, undefined, () => loi(new Error('không tải được ' + url))));
const taiAnh = url => new Promise((ok, loi) => new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; ok(t); }, undefined, () => loi(new Error('không tải được ' + url))));

// ánh sáng đất sét: nắng ấm chếch bên, trời mát đổ bóng mềm
function anhSang(scene) {
  scene.add(new THREE.HemisphereLight(0xfff2dc, 0x8a7a66, 1.25));
  const nang = new THREE.DirectionalLight(0xffe2b8, 2.4); nang.position.set(3, 6, 4); nang.castShadow = true;
  nang.shadow.mapSize.set(1024, 1024); nang.shadow.camera.left = nang.shadow.camera.bottom = -6; nang.shadow.camera.right = nang.shadow.camera.top = 6;
  nang.shadow.radius = 4; nang.shadow.bias = -0.0005; scene.add(nang);
  const vien = new THREE.DirectionalLight(0xcfe3ff, 0.5); vien.position.set(-4, 3, -3); scene.add(vien);
}

// phông ảnh phủ kín khung (giữ tỉ lệ, cắt bớt mép như object-fit: cover)
function phongPhuKin(tex) {
  const ar = tex.image.width / tex.image.height, khung = W / H;
  if (ar > khung) { tex.repeat.set(khung / ar, 1); tex.offset.set((1 - khung / ar) / 2, 0); } else { tex.repeat.set(1, ar / khung); tex.offset.set(0, (1 - ar / khung) / 2); }
  return tex;
}

const eo = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);   // smoothstep: máy quay vào và ra êm
const lerp3 = (a, b, k) => new THREE.Vector3(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);

async function dung() {
  const ke = (await import(q.get('ke'))).default, FPS = ke.fps || 30;
  const tenNv = Object.keys(ke.nhanVat || {});
  const goi = await Promise.all(tenNv.map(id => taiGlb(goc(ke.nhanVat[id])).then(g => [id, g])));
  const GLB = Object.fromEntries(goi);
  let kho = null; const layKho = async () => (kho ??= await taiGlb(KHO));

  // nhân vật đất sét đứng trong cảnh: nhân bản, chuẩn hóa chiều cao, gắn clip, có thể đội nón lá
  async function taoNguoi(p, canh) {
    const g = GLB[p.id]; if (!g) throw new Error(`Cảnh «${canh.ten}»: nhân vật «${p.id}» không có trong mục nhanVat`);
    const root = new THREE.Group(), model = nhanBan(g.scene); root.add(model);
    model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; } });
    model.updateMatrixWorld(true);
    const hop = new THREE.Box3().setFromObject(model, true), cao = hop.max.y - hop.min.y, muon = 1.2 * (p.cao || 1);
    const k = muon / cao; model.scale.setScalar(k); model.position.y = -hop.min.y * k;
    const mixer = new THREE.AnimationMixer(model), ten = (p.dong || 'Idle').toLowerCase();
    let clip = g.animations.find(a => a.name.toLowerCase() === ten);
    if (!clip) { const kh = await layKho(), nguon = kh.animations.find(a => a.name.toLowerCase() === ten); if (nguon) clip = ghepClip(nguon, kh.scene, model); }
    if (!clip) throw new Error(`Cảnh «${canh.ten}»: không có động tác «${p.dong}» cho nhân vật «${p.id}»`);
    const act = mixer.clipAction(clip); act.play();
    if (p.non) {
      root.updateMatrixWorld(true); let dau = null; model.traverse(o => { if (!dau && o.isBone && /head/i.test(o.name) && !/top|end/i.test(o.name)) dau = o; });
      // nón ngồi sát đỉnh đầu: vành rộng hơn đầu một chút, đáy hạ xuống ngang trán (đo bằng hộp bao của đầu nếu có xương đầu)
      const non = nonLa(0.2 * (p.cao || 1)); const hopMoi = new THREE.Box3().setFromObject(model, true), dinh = hopMoi.max.y;
      let cx = (hopMoi.min.x + hopMoi.max.x) / 2, cz = (hopMoi.min.z + hopMoi.max.z) / 2; if (dau) { const v = dau.getWorldPosition(new THREE.Vector3()); root.worldToLocal(v); cx = v.x; cz = v.z; }
      non.position.set(cx, dinh - 0.08 * (p.cao || 1), cz);
      root.add(non); if (dau) dau.attach(non);   // gắn vào xương đầu để nón đi theo đầu
    }
    root.position.set(p.vi[0], 0, p.vi[1]); root.rotation.y = THREE.MathUtils.degToRad(p.huong || 0);
    return { root, mixer, p };
  }

  const scene = new THREE.Scene(); anhSang(scene);
  const san = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: 0xd8c39a, roughness: 0.95 }));
  san.rotation.x = -Math.PI / 2; san.receiveShadow = true; scene.add(san);
  const CANH = []; let t0 = 0;
  for (const c of ke.canh) {
    const nhom = new THREE.Group(); nhom.visible = false; scene.add(nhom);
    const nguoi = []; for (const p of c.nguoi || []) { const n = await taoNguoi(p, c); nhom.add(n.root); nguoi.push(n); }
    for (const d of c.dao || []) {
      const f = DAO_CU[d.loai]; if (!f) throw new Error(`Cảnh «${c.ten}»: không có đạo cụ «${d.loai}»`);
      const o = f(...(d.tham || [])); o.position.set(d.vi[0], d.y || 0, d.vi[1]); o.rotation.y = THREE.MathUtils.degToRad(d.huong || 0); if (d.co) o.scale.setScalar(d.co); nhom.add(o);
    }
    const phong = c.phong ? phongPhuKin(await taiAnh(goc(c.phong))) : null;
    CANH.push({ c, nhom, nguoi, phong, tu: t0, den: t0 + c.dai }); t0 += c.dai;
  }
  const TONG = Math.round(t0 * FPS);

  window.veKhung = n => {
    const t = n / FPS; let s = CANH.find(x => t >= x.tu && t < x.den) || CANH[CANH.length - 1];
    for (const x of CANH) x.nhom.visible = x === s;
    const tl = t - s.tu, k = eo(tl / s.c.dai), m = s.c.may;
    scene.background = s.phong || new THREE.Color(s.c.nen ?? 0xe9dcc0); san.visible = !s.c.anSan;
    for (const nv of s.nguoi) {
      nv.mixer.setTime(tl + (nv.p.lech || 0));
      if (nv.p.di) { const a = eo((tl - (nv.p.di.tu || 0)) / (nv.p.di.dai || s.c.dai)); nv.root.position.set(nv.p.vi[0] + (nv.p.di.den[0] - nv.p.vi[0]) * a, 0, nv.p.vi[1] + (nv.p.di.den[1] - nv.p.vi[1]) * a); }
    }
    camera.position.copy(lerp3(m.tu, m.den || m.tu, k)); camera.fov = (m.fov || 35) + ((m.fovDen || m.fov || 35) - (m.fov || 35)) * k; camera.updateProjectionMatrix();
    camera.lookAt(lerp3(m.nhin, m.nhinDen || m.nhin, k));
    renderer.render(scene, camera);
    return { canh: s.c.ten, t };
  };
  window.__thongTin = { tong: TONG, fps: FPS, canh: CANH.map(x => ({ ten: x.c.ten, tu: Math.round(x.tu * FPS), den: Math.round(x.den * FPS) })) };
  window.veKhung(0);
}

window.__san = dung().then(() => true, e => { window.__loi = e.message; return false; });
