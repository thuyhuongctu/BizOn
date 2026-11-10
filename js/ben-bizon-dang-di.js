/* BizOn – «Bến BizOn»: dáng đi của nhân vật người chơi. © 2026 Đỗ Thùy Hương & Phan Anh Tú. Bảo lưu mọi quyền.
 *
 * Vì sao có tệp này: trước đây nhân vật bị kéo đi 3,4 đơn vị/giây trong khi clip «đi» chỉ hợp với khoảng 1 đơn vị/giây, nên bàn
 * chân trượt trên mặt đất. Ở đây: (1) đo tốc độ tự nhiên của từng clip từ chính chuyển động bàn chân; (2) phát clip nhanh chậm
 * theo đúng tốc độ đang đi, nên chân bám đất; (3) có thêm dáng CHẠY, ghép từ kho động tác dùng chung
 * (assets/models/nhan-vat/dong-tac-v1.glb, cùng tên khớp) sang mô hình đang dùng; (4) hoà trộn đứng/đi/chạy liên tục, người hơi
 * nghiêng khi rẽ và khi tăng tốc. Chỉ điều khiển mixer và actions mà bizon-characters.js đã tạo sẵn trong userData.rig; không sửa tệp đó.
 */
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

const KHO = 'assets/models/nhan-vat/dong-tac-v1.glb';
let khoHua = null;
const taiKho = () => khoHua || (khoHua = new Promise((ok, loi) => new GLTFLoader().load(KHO, ok, undefined, loi)));
const kep = (v, a, b) => Math.max(a, Math.min(b, v));
const muot = (a, b, x) => { const t = kep((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const q1 = new THREE.Quaternion(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();

function nutTheoTen(root) { const m = {}; root.traverse(o => { if (o.name && !m[o.name]) m[o.name] = o; }); return m; }
const soVoiGoc = (b, g) => { g.getWorldQuaternion(q1); const gi = q1.clone().invert(); b.getWorldQuaternion(q1); return gi.multiply(q1.clone()); };

/* Ghép một clip từ bộ xương nguồn sang bộ xương đích cùng tên khớp: mỗi khớp giữ nguyên độ xoay trong không gian so với tư thế
 * nghỉ của chính nó, nên hai mô hình có tư thế nghỉ lệch nhau vẫn ra cùng một dáng. Hông dịch theo tỷ lệ chiều cao hông. */
export function ghepClip(clip, nguon, dich, fps = 30) {
  const S = nutTheoTen(nguon), T = {}; dich.traverse(o => { if (o.isBone) T[o.name] = o; });
  const ten = Object.keys(T).filter(n => S[n]); if (!S.Hips || !T.Hips || ten.length < 12) return null;
  nguon.updateMatrixWorld(true); dich.updateMatrixWorld(true);
  const gS = S.Hips.parent, gT = T.Hips.parent, nS = {}, nT = {}, giu = {};
  ten.forEach(n => { nS[n] = soVoiGoc(S[n], gS); nT[n] = soVoiGoc(T[n], gT); giu[n] = { q: S[n].quaternion.clone(), p: S[n].position.clone() }; });
  const hS = S.Hips.position.clone(), hT = T.Hips.position.clone(), tl = hT.y / (hS.y || 1);
  const mx = new THREE.AnimationMixer(nguon), a = mx.clipAction(clip); a.play();
  const N = Math.max(2, Math.round(clip.duration * fps)), tg = new Float32Array(N + 1), gt = {}, vt = new Float32Array((N + 1) * 3), W = {};
  ten.forEach(n => { gt[n] = new Float32Array((N + 1) * 4); });
  for (let i = 0; i <= N; i++) {
    tg[i] = clip.duration * i / N; mx.setTime(Math.min(tg[i], clip.duration - 1e-4)); nguon.updateMatrixWorld(true);
    ten.forEach(n => { W[n] = soVoiGoc(S[n], gS).multiply(nS[n].clone().invert()).multiply(nT[n]); });
    ten.forEach(n => { const cha = T[n].parent && T[n].parent.isBone && W[T[n].parent.name]; (cha ? cha.clone().invert().multiply(W[n]) : W[n]).toArray(gt[n], i * 4); });
    v1.copy(S.Hips.position).sub(hS).multiplyScalar(tl).add(hT).toArray(vt, i * 3);
  }
  a.stop(); mx.uncacheRoot(nguon); ten.forEach(n => { S[n].quaternion.copy(giu[n].q); S[n].position.copy(giu[n].p); });   // trả kho về tư thế nghỉ cho lần ghép sau
  const tracks = ten.map(n => new THREE.QuaternionKeyframeTrack(n + '.quaternion', tg, gt[n])); tracks.push(new THREE.VectorKeyframeTrack('Hips.position', tg, vt));
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

/* Tốc độ tự nhiên của một clip đi/chạy (đơn vị của cảnh mỗi giây): quãng bàn chân lùi so với hông trong nửa chu kỳ, nhân hai. */
function tocTuNhien(model, clip) {
  let chan = null, hong = null; model.traverse(o => { if (o.name === 'LeftFoot') chan = o; if (o.name === 'Hips') hong = o; });
  if (!chan || !hong) return 0;
  const mx = new THREE.AnimationMixer(model), a = mx.clipAction(clip); a.play(); let lo = Infinity, hi = -Infinity; const N = 36, huong = new THREE.Vector3();
  model.parent ? model.parent.getWorldDirection(huong) : huong.set(0, 0, 1);
  for (let i = 0; i < N; i++) { mx.setTime(clip.duration * i / N); model.updateMatrixWorld(true); chan.getWorldPosition(v1); hong.getWorldPosition(v2); const d = v1.sub(v2).dot(huong); if (d < lo) lo = d; if (d > hi) hi = d; }
  a.stop(); mx.uncacheAction(clip, model); mx.uncacheRoot(model);
  return (hi - lo) * 2 / clip.duration;
}

/* Tạo bộ điều khiển dáng đi cho một nhân vật dựng bằng chars.build(). Gọi capNhat mỗi khung hình; trả false khi mô hình có xương
 * chưa tải xong (nơi gọi tiếp tục dùng chars.animate cho tranh dựng đứng). */
export function taoDangDi(root, { giam = false } = {}) {
  let san = false, hong = false, r = null, vDi = 1, vChay = 0, w = { idle: 1, walk: 0, run: 0 }, nghieng = 0, chui = 0, tocCu = 0, yawCu = null, tsDi = 1, tsChay = 1, dang = 'dung';
  function chuanBi() {
    r = root.userData.rig; if (!r || !r.glb || !r.actions || !r.actions.walk || !r.actions.idle) return false;
    Object.values(r.actions).forEach(a => { a.stop(); a.setEffectiveWeight(0); });
    vDi = tocTuNhien(r.model, r.actions.walk.getClip()) || 1;
    ['idle', 'walk'].forEach(k => { const a = r.actions[k]; a.reset(); a.enabled = true; a.setEffectiveWeight(k === 'idle' ? 1 : 0); a.play(); });
    r.cur = 'idle'; san = true;
    taiKho().then(g => {
      if (!root.parent) return; const c = g.animations.find(x => /run/i.test(x.name)), clip = c && ghepClip(c, g.scene, r.model); if (!clip) { hong = true; return; }
      vChay = tocTuNhien(r.model, clip); const a = r.mixer.clipAction(clip, r.model); a.enabled = true; a.setEffectiveWeight(0); a.play(); r.actions.run = a;
      // tocTuNhien đặt lại thời gian của mixer: cho hai clip nền chạy tiếp
      ['idle', 'walk'].forEach(k => { r.actions[k].enabled = true; r.actions[k].play(); });
    }).catch(() => { hong = true; });
    return true;
  }
  return {
    get sanSang() { return san; }, get coChay() { return !!(r && r.actions && r.actions.run); }, get khoHong() { return hong; },
    thongSo: () => ({ vDi: +vDi.toFixed(3), vChay: +vChay.toFixed(3), tsDi: +tsDi.toFixed(3), tsChay: +tsChay.toFixed(3), wDung: +w.idle.toFixed(2), wDi: +w.walk.toFixed(2), wChay: +w.run.toFixed(2), dang, nghieng: +nghieng.toFixed(3) }),
    /* toc: tốc độ thật trên mặt đất; yaw: hướng mặt hiện tại (rad) */
    capNhat(dt, toc, yaw) {
      if (!san && !chuanBi()) return false;
      dt = kep(dt, 0, 0.05); const run = r.actions.run;
      const d = muot(0.06, Math.min(0.5, vDi * 0.5), toc), c = run ? muot(vDi * 1.22, Math.max(vDi * 1.5, vChay * 0.8), toc) : 0;
      const dich = { idle: 1 - d, walk: d * (1 - c), run: d * c }, k = Math.min(1, dt * 9);
      for (const n in w) w[n] += (dich[n] - w[n]) * k;
      tsDi = kep(toc / vDi, 0.75, run ? 1.35 : 1.6); r.actions.walk.setEffectiveTimeScale(tsDi);
      if (run) { tsChay = kep(toc / (vChay || 1), 0.8, 1.4); run.setEffectiveTimeScale(tsChay); run.setEffectiveWeight(w.run); }
      r.actions.idle.setEffectiveWeight(w.idle); r.actions.walk.setEffectiveWeight(w.walk);
      dang = w.run > 0.5 ? 'chay' : w.walk + w.run > 0.5 ? 'di' : 'dung'; r.cur = dang === 'dung' ? 'idle' : 'walk';
      // nghiêng người: ngả vào trong khi rẽ, chúi nhẹ khi tăng tốc và khi chạy (bỏ khi người dùng chọn giảm chuyển động)
      if (!giam && dt > 0) {
        let dq = yawCu == null ? 0 : yaw - yawCu; dq = Math.atan2(Math.sin(dq), Math.cos(dq)); yawCu = yaw;
        const muonN = kep(-dq / dt * 0.045, -0.2, 0.2) * kep(toc / (vDi || 1), 0, 1.4), muonC = kep((toc - tocCu) / dt * 0.02, -0.07, 0.1) + w.run * 0.07; tocCu = toc;
        nghieng += (muonN - nghieng) * Math.min(1, dt * 6); chui += (muonC - chui) * Math.min(1, dt * 5);
        r.model.rotation.z = nghieng; r.model.rotation.x = chui;
      }
      r.mixer.update(dt); return true;
    },
  };
}
