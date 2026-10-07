// Dàn nhân vật đất sét 3D cho Hộ Chiếu Thương Hiệu – dựng thủ tục bằng bizon-characters.js (không dùng ảnh phẳng).
import { makeCharacters } from './bizon-characters.js';

const EXTRA = [
  { id: 'bp_sau', name: 'Bà Sáu Lành', skin: 0xe2a882, hair: 0xc9c4bc, hairStyle: 'bunTop', earring: true,
    top: 0x7a4a6a, bottom: 0x3a2a34, aoDai: 0.46, shoe: 0x5a3a28, pose: 'hands' },
  { id: 'bp_khang', name: 'Minh Khang', skin: 0xe8b08c, hair: 0x2a1d15, hairStyle: 'short', hairCap: 0.42,
    top: 0x24324f, bottom: 0x24324f, shoe: 0x2a2020, shirtFront: 0xf1efe9, tie: 0x8a2a2a, jacket: true, cuff: 0xf1efe9, pose: 'both', prop: 'moneybag' },
  { id: 'bp_annhien', name: 'An Nhiên', skin: 0xf0c09c, hair: 0x5a3422, hairStyle: 'wavy', smile: 'open',
    top: 0xe8765a, bottomType: 'skirt', skirt: 0xf3e3cf, skirtLen: 0.3, skirtFlare: 0.12, shoe: 0xe8765a, heels: true, collar: 0xf6b8a4, pose: 'megaphone', prop: 'megaphone' },
  { id: 'bp_lina', name: 'Lina Park', skin: 0xf2caa8, hair: 0x141414, hairStyle: 'bob',
    top: 0x2f7a86, bottom: 0x24545c, shoe: 0x1f2a2e, shirtFront: 0xf4f1ea, jacket: true, heels: true, pose: 'tablet', prop: 'tablet' },
  { id: 'bp_kimlong', name: 'Kim Long', skin: 0xe6b28e, hair: 0x1a1412, hairStyle: 'slick', smile: 'open',
    top: 0xb8302a, bottom: 0x2a2020, shoe: 0x1a1a1a, shirtFront: 0xf6d27a, tie: 0xf2b53a, jacket: true, cuff: 0xf6d27a, pose: 'cross' },
];
export const CAST_IDS = { 'Bà Sáu Lành': 'bp_sau', 'Minh Khang': 'bp_khang', 'An Nhiên': 'bp_annhien', 'Tu Phan': 'victor', 'Lina Park': 'bp_lina', 'Lumina': 'lumina' };
export const RIVAL_ID = 'bp_kimlong';

export function makeBPCast(THREE) {
  const C = makeCharacters(THREE);
  // Ảnh đất sét gốc của Bật Nghiệp / Hộ Chiếu cho các nhân vật có tên (cùng cách hiển thị với BizOn Game 3D)
  const ARTMAP = { bp_sau: 'advisors/ba-sau-lanh-cut.webp', bp_khang: 'advisors/minh-khang-cut.webp', bp_annhien: 'advisors/an-nhien-cut.webp', bp_lina: 'advisors/lina-park-cut.webp', victor: 'advisors/tu-phan-cut.webp', bp_kimlong: 'firms/kim-long-rival-cut.webp' };
  const TL = new THREE.TextureLoader(), tc = {}, blobM = new THREE.MeshBasicMaterial({ color: 0x3a2a1a, transparent: true, opacity: 0.22, depthWrite: false });
  function artChar(src, h) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: false, alphaTest: 0.5, depthWrite: true, toneMapped: false }));
    sp.material.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <alphatest_fragment>', 'diffuseColor.a = smoothstep(0.03, 0.2, diffuseColor.a);\n#include <alphatest_fragment>'); };
    sp.center.set(0.5, 0); sp.scale.set(h * 0.4, h, 1); sp.visible = false; body.add(sp);
    const apply = t => { sp.material.map = t; sp.material.needsUpdate = true; sp.userData.aspect = t.image.width / t.image.height; sp.scale.set(h * sp.userData.aspect, h, 1); sp.visible = true; };
    const url = 'assets/character/' + src;
    if (tc[url] && tc[url].image) apply(tc[url]); else if (tc[url]) tc[url].__w.push(apply);
    else { const t = TL.load(url, () => t.__w.forEach(f => f(t))); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.__w = [apply]; tc[url] = t; }
    const blob = new THREE.Mesh(new THREE.CircleGeometry(0.2 * h / 1.2, 24), blobM); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.004; blob.scale.set(1, 0.7, 1); blob.renderOrder = -1; root.add(blob);
    const d = () => new THREE.Object3D();
    root.userData.rig = { art: true, sprite: sp, h, body, torso: body, head: d(), legs: [d(), d()], arms: {}, eyes: [], mouth: d(), hold: {}, rest: {}, pose: 'art' };
    return root;
  }
  EXTRA.forEach(e => { if (!C.roster.find(r => r.id === e.id)) C.roster.push(Object.assign({ label: e.name, line: '' }, e)); });
  function build(id, height = 1.45) {
    if (ARTMAP[id]) return artChar(ARTMAP[id], height);
    const r = C.build(id);
    if (r.userData.rig && r.userData.rig.art) { r.scale.setScalar(height / (r.userData.rig.h || 1.15)); return r; }
    r.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
    const box = new THREE.Box3().setFromObject(r), h = box.max.y - box.min.y || 1.2;
    r.scale.setScalar(height / h); return r;
  }
  const HAIRS = ['short', 'bob', 'bunTop', 'wavy', 'slick', 'long', 'spiky', 'bun'], HC = [0x2a1d15, 0x4a3020, 0x141414, 0x6a4630, 0xc9c4bc];
  const SKINS = [0xf2caa8, 0xe8b08c, 0xe2a882, 0xd9a47a, 0xa8764f];
  let vn = 0;
  function villager(top, skin, seed = 0, height = 0.8, bottom) {
    const id = 'vl_' + (vn++), k = (seed * 7 + vn) | 0, skirt = k % 3 === 1;
    C.roster.push({ id, label: id, name: id, line: '', skin: skin ?? SKINS[k % SKINS.length], hair: HC[k % HC.length], hairStyle: HAIRS[k % HAIRS.length],
      top, bottom: bottom ?? [0x3a3f55, 0x5a4a3a, 0x2b3f6b, 0xc8a57a][k % 4], shoe: 0x2e2c2c, smile: k % 2 ? 'open' : undefined,
      bottomType: skirt ? 'skirt' : undefined, skirt: skirt ? (bottom ?? 0xf3e3cf) : undefined, skirtLen: 0.3, skirtFlare: 0.1 });
    const r = build(id, height); r.traverse(o => { if (o.isMesh) o.castShadow = false; }); return r;
  }
  // Cử động mềm hơn cho ảnh đất sét: nhún, nghiêng, co giãn nhẹ
  function animate(root, t, mode, ph = 0) {
    const r = root.userData.rig; if (!r) return; if (!r.art) return C.animate(root, t, mode, ph);
    const s = r.sprite, w = (s.userData.aspect || 0.4) * r.h, tt = t + ph;
    if (mode === 'walk') { const k = Math.abs(Math.sin(tt * 6)); r.body.position.y = k * 0.07 * r.h; s.material.rotation = Math.sin(tt * 6) * 0.06; s.scale.set(w * (1 + (1 - k) * 0.04), r.h * (1 - (1 - k) * 0.05), 1); }
    else if (mode === 'talk') { const k = Math.abs(Math.sin(tt * 4)); r.body.position.y = k * 0.03 * r.h; s.material.rotation = Math.sin(tt * 1.6) * 0.045; s.scale.set(w * (1 - k * 0.02), r.h * (1 + k * 0.035), 1); }
    else if (mode === 'cheer') { const k = Math.abs(Math.sin(tt * 7)); r.body.position.y = k * 0.16 * r.h; s.material.rotation = Math.sin(tt * 3.5) * 0.08; s.scale.set(w * (1 + (1 - k) * 0.06), r.h * (1 - (1 - k) * 0.07 + k * 0.03), 1); }
    else { const b = Math.sin(tt * 2); r.body.position.y = 0; s.material.rotation = Math.sin(tt * 0.7) * 0.02; s.scale.set(w * (1 - b * 0.008), r.h * (1 + b * 0.014), 1); }
  }
  return { build, animate, villager, isArt: r => !!(r && r.userData.rig && r.userData.rig.art) };
}
