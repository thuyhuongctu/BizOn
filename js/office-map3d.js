// BizOn · Bản đồ hành trình 3D (6 thành phố + cắm cờ). Được office-rounds.js nạp động khi cần.
// Dữ liệu biên giới: Natural Earth 50m (assets/geo/vnm.json). Có thể hiện kèm quần đảo Hoàng Sa, Trường Sa.
const THREE_URL = 'https://unpkg.com/three@0.184.0/build/three.module.js';
const CSS = `
#bz3{position:fixed;inset:0;z-index:62;background:radial-gradient(120% 90% at 50% 10%,#9bdcf0 0%,#3aa6c9 45%,#0c5a78 100%);font-family:inherit;color:#033337;overflow:hidden;touch-action:none;user-select:none}
#bz3 canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab}
#bz3 canvas:active{cursor:grabbing}
#bz3 .lb{position:absolute;left:0;top:0;transform:translate(-50%,-100%);pointer-events:auto;cursor:pointer;background:#fff;color:#033337;font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;white-space:nowrap;box-shadow:0 4px 10px rgba(0,40,60,.3);display:flex;gap:6px;align-items:center}
#bz3 .lb i{font-style:normal;width:18px;height:18px;border-radius:50%;background:#dbe9f0;color:#006687;display:flex;align-items:center;justify-content:center;font-size:11px}
#bz3 .lb.on i{background:#f08a3c;color:#fff}
#bz3 .lb.cur{background:#f08a3c;color:#fff}#bz3 .lb.cur i{background:#fff;color:#f08a3c}
#bz3 .lb.isl{background:rgba(255,255,255,.85);font-weight:700;font-size:11px;cursor:default}
#bz3 .top{position:absolute;top:14px;left:14px;right:14px;display:flex;gap:8px;align-items:center;pointer-events:none}
#bz3 .pill{white-space:nowrap;background:rgba(255,255,255,.92);border-radius:999px;padding:7px 14px;font-size:13px;font-weight:800;color:#006687;box-shadow:0 4px 12px rgba(0,40,60,.2)}
#bz3 .pill.h{font-weight:600;color:#033337;font-size:12px;min-width:0;overflow:hidden;text-overflow:ellipsis}
@media (max-width:1000px){#bz3 .pill.h{display:none}}
#bz3 .pn{position:absolute;right:18px;top:50%;transform:translateY(-50%);width:340px;max-width:calc(100% - 36px);background:#fff;border:4px solid #dbe9f0;border-radius:28px;box-shadow:10px 10px 30px rgba(0,40,60,.3);padding:22px;box-sizing:border-box;max-height:calc(100% - 36px);overflow:auto}
#bz3 .k{font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#b0501a}
#bz3 h2{margin:4px 0 12px;font-size:28px;font-weight:900;color:#006687;line-height:1.15}
#bz3 p{margin:0 0 10px;font-size:15px;line-height:1.5;text-wrap:pretty}
#bz3 .bar{display:flex;gap:6px;margin:14px 0 8px}
#bz3 .bar i{flex:1;height:8px;border-radius:4px;background:#dbe9f0}
#bz3 .bar i.on{background:#f08a3c}
#bz3 .pn button{font:inherit;font-weight:800;border:0;border-radius:16px;padding:13px 22px;cursor:pointer;background:#006687;color:#fff;font-size:15px;width:100%;margin-top:6px}
#bz3 .pn button:hover{background:#0f7596}
#bz3 .pn button.mkb{background:#f4faff;color:#006687;border:2px solid #dbe9f0}
#bz3 .mk{background:#f4faff;border-radius:18px;padding:12px;margin:10px 0 4px}
#bz3 .mk .t{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-weight:900;font-size:14px;margin-bottom:8px}
#bz3 .mk .t small{font-size:11px;font-weight:800;color:#b0501a;letter-spacing:.06em}
#bz3 .mk .g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
#bz3 .mk .g div{background:#fff;border-radius:10px;padding:6px 8px}
#bz3 .mk .g small{display:block;font-size:10px;font-weight:700;color:#5d6770}
#bz3 .mk .g b{font-size:15px;font-weight:900}
#bz3 .lgd{position:absolute;left:14px;bottom:14px;background:rgba(255,255,255,.92);border-radius:14px;padding:8px 12px;font-size:11px;font-weight:700;color:#033337;box-shadow:0 4px 12px rgba(0,40,60,.2);pointer-events:none}
#bz3 .lgd i{display:inline-block;width:60px;height:8px;border-radius:4px;background:linear-gradient(90deg,hsl(130,65%,45%),hsl(65,65%,45%),hsl(0,65%,45%));vertical-align:middle;margin:0 4px}
@media (max-width:760px){#bz3 .lgd{display:none}}
@media (max-width:760px){#bz3 .pn{top:auto;bottom:12px;right:12px;left:12px;transform:none;width:auto;max-width:none;max-height:45%;padding:16px}#bz3 h2{font-size:22px}#bz3 .pill.h{display:none}}`;

const LL = { 1: [105.78, 10.03], 2: [106.70, 10.78], 3: [109.19, 12.24], 4: [108.22, 16.05], 5: [105.78, 19.81], 6: [105.85, 21.03] };
const ISLANDS = [
  { vi: 'Quần đảo Hoàng Sa', en: 'Hoàng Sa (Paracel) Islands', c: [112.0, 16.5], pts: [[0, 0], [.35, .2], [-.3, .25], [.15, -.3], [-.2, -.2], [.5, -.1]] },
  { vi: 'Quần đảo Trường Sa', en: 'Truøng Sa (Spratly) Islands', c: [114.0, 10.0], pts: [[0, 0], [.6, .5], [-.5, .7], [.9, -.4], [-.8, -.3], [.2, -.8], [1.2, .3], [-.3, 1.2]] },
];
const C16 = Math.cos(16 * Math.PI / 180);
const P = (lon, lat) => [(lon - 106.8) * C16, lat - 15.6];
const TOP = 0.62;

let THREEp = null, GEOp = null;
export async function open3DMap(o) {
  const THREE = await (THREEp ||= import(THREE_URL));
  const geo = await (GEOp ||= fetch('assets/geo/vnm.json').then(r => { if (!r.ok) throw new Error('geo'); return r.json(); }));
  const tr = o.tr || ((vi) => vi);
  if (!document.getElementById('bz3-css')) { const st = document.createElement('style'); st.id = 'bz3-css'; st.textContent = CSS; document.head.appendChild(st); }

  const root = document.createElement('div'); root.id = 'bz3';
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  root.appendChild(renderer.domElement);
  const labels = document.createElement('div'); root.appendChild(labels);
  root.insertAdjacentHTML('beforeend', `<div class="top"><span class="pill">🖺️ ${tr('HÀNH TRÌNH BIZON · 3D', 'BIZON JOURNEY · 3D')}</span><span class="pill h">${tr('Kéo để xoay · cuộn/chụm để phòng to · chạm tên thành phố để bay tới', 'Drag to rotate · scroll/pinch to zoom · tap a city to fly there')}</span></div>
    <div class="pn"><div class="k">${o.kicker || ''}</div><h2>${o.title || ''}</h2>${o.body || ''}
    <div class="bar">${o.cities.map(c => `<i class="${c.flagged ? 'on' : ''}"></i>`).join('')}</div>
    <p style="font-size:13px;color:#33525a">${tr(`Đã cắm cờ ${o.count}/6 thành phố`, `Flags planted: ${o.count}/6 cities`)}</p>
    <div class="mk" hidden></div>
    <button class="cl">${o.btn || tr('Đóng', 'Close')}</button>${window.BizonMarket ? `<button class="mkb">📈 ${tr('Bảng thị trường', 'Market board')}</button>` : ''}</div>
    ${window.BizonMarket ? `<div class="lgd">${tr('Cột = nhu cầu · màu = cạnh tranh', 'Column = demand · color = competition')}<br>${tr('thấp', 'low')}<i></i>${tr('cao', 'high')}</div>` : ''}`);
  document.body.appendChild(root);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x3aa6c9, 30, 60);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xdff6ff, 0x6b5a40, 1.1));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
  sun.position.set(-8, 16, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 }); sun.shadow.bias = -0.0005;
  scene.add(sun);

  // Bển có sóng nhẹ
  const seaG = new THREE.PlaneGeometry(90, 90, 90, 90); seaG.rotateX(-Math.PI / 2);
  const seaBase = Float32Array.from(seaG.attributes.position.array);
  const sea = new THREE.Mesh(seaG, new THREE.MeshStandardMaterial({ color: 0x2c9cc2, roughness: 0.3, metalness: 0.05, flatShading: true, transparent: true, opacity: 0.94 }));
  sea.position.y = 0.08; sea.receiveShadow = true; scene.add(sea);
  // Thềm nước n˹ãng quanh bờ
  const shelfM = new THREE.MeshStandardMaterial({ color: 0x7fd3e0, roughness: 0.6, transparent: true, opacity: 0.55 });

  const toShape = ring => new THREE.Shape(ring.map(([lo, la]) => new THREE.Vector2(...P(lo, la))));
  const landTop = new THREE.MeshStandardMaterial({ color: 0x8fcf6b, roughness: 0.85, flatShading: true });
  const landSide = new THREE.MeshStandardMaterial({ color: 0xe8cf9c, roughness: 0.9 });
  let mainRing = null;
  geo.coordinates.forEach(poly => {
    const ring = poly[0]; if (!mainRing || ring.length > mainRing.length) mainRing = ring;
    const g = new THREE.ExtrudeGeometry(toShape(ring), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.07, bevelSegments: 2, curveSegments: 1 });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, [landTop, landSide]); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    const sg = new THREE.ExtrudeGeometry(toShape(ring), { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.28, bevelSegments: 1, curveSegments: 1 });
    sg.rotateX(-Math.PI / 2); const sm = new THREE.Mesh(sg, shelfM); sm.position.y = 0.06; scene.add(sm);
  });
  const inLand = (lo, la) => { let c = false; for (let i = 0, j = mainRing.length - 1; i < mainRing.length; j = i++) { const [xi, yi] = mainRing[i], [xj, yj] = mainRing[j]; if ((yi > la) !== (yj > la) && lo < (xj - xi) * (la - yi) / (yj - yi) + xi) c = !c; } return c; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // Núi thấyp (Tây Bắc, Trường Sơn, Tây Nguyên)
  const mtG = new THREE.ConeGeometry(1, 1, 6); const mtM = new THREE.MeshStandardMaterial({ color: 0x6fa857, roughness: 0.9, flatShading: true });
  const capM = new THREE.MeshStandardMaterial({ color: 0xa7c98b, roughness: 0.9, flatShading: true });
  [[103.8, 22.3, 5], [104.6, 21.6, 4], [105.6, 22.6, 4], [105.2, 18.6, 3], [106.6, 17.2, 3], [107.8, 15.2, 4], [108.1, 13.4, 4], [107.9, 12.0, 3]].forEach(([lo, la, k]) => {
    for (let i = 0; i < k; i++) {
      const x = lo + (rnd() - .5) * 1.2, y = la + (rnd() - .5) * 1.0; if (!inLand(x, y)) continue;
      const r = 0.3 + rnd() * 0.3, h = 0.5 + rnd() * 0.7, [px, pz] = P(x, y);
      const m = new THREE.Mesh(mtG, mtM); m.scale.set(r, h, r); m.position.set(px, TOP + h / 2 - 0.02, -pz); m.rotation.y = rnd() * 3; m.castShadow = m.receiveShadow = true; scene.add(m);
      const cap = new THREE.Mesh(mtG, capM); cap.scale.set(r * .35, h * .35, r * .35); cap.position.set(px, TOP + h - h * .175 - 0.02, -pz); cap.rotation.y = m.rotation.y; scene.add(cap);
    }
  });
  // Cây xanh (instanced)
  const cityXZ = Object.values(LL).map(([lo, la]) => P(lo, la));
  const trees = []; let guard = 0;
  while (trees.length < 180 && guard++ < 6000) {
    const lo = 102.2 + rnd() * 7.4, la = 8.6 + rnd() * 14.8; if (!inLand(lo, la)) continue;
    const [x, z] = P(lo, la); if (cityXZ.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 0.55)) continue;
    trees.push([x, z]);
  }
  const trG = new THREE.ConeGeometry(0.11, 0.32, 5); trG.translate(0, 0.16, 0);
  const tI = new THREE.InstancedMesh(trG, new THREE.MeshStandardMaterial({ color: 0x3f8f47, roughness: 0.8, flatShading: true }), trees.length);
  const dm = new THREE.Object3D();
  trees.forEach(([x, z], i) => { const s = 0.7 + rnd() * 0.6; dm.position.set(x, TOP - 0.01, -z); dm.scale.set(s, s, s); dm.rotation.y = rnd() * 3; dm.updateMatrix(); tI.setMatrixAt(i, dm.matrix); });
  tI.castShadow = true; scene.add(tI);

  // Quần đảo
  const isleM = new THREE.MeshStandardMaterial({ color: 0xf1dfb3, roughness: 0.9 });
  const isleTop = new THREE.MeshStandardMaterial({ color: 0x9bd07a, roughness: 0.9 });
  const isleLabels = ISLANDS.map(isl => {
    const [cx, cz] = P(...isl.c);
    isl.pts.forEach(([dx, dz], i) => {
      const r = i ? 0.09 + rnd() * 0.08 : 0.16;
      const b = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.25, r * 1.4, 0.18, 10), isleM); b.position.set(cx + dx, 0.12, -(cz + dz)); b.receiveShadow = true; scene.add(b);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(r * .8, r, 0.08, 10), isleTop); t.position.set(cx + dx, 0.24, -(cz + dz)); scene.add(t);
    });
    return { pos: new THREE.Vector3(cx, 0.6, -cz), text: tr(isl.vi, isl.en) };
  });

  // Tuyến hành trình (chuỗi chấm bay vòng cung)
  const cities = o.cities.map(c => { const [x, z] = P(...LL[c.n]); return { ...c, v: new THREE.Vector3(x, TOP, -z) }; });
  const dotG = new THREE.SphereGeometry(0.05, 8, 6);
  const dotOn = new THREE.MeshStandardMaterial({ color: 0xf08a3c, emissive: 0xf08a3c, emissiveIntensity: 0.35 });
  const dotOff = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
  for (let i = 0; i < cities.length - 1; i++) {
    const a = cities[i].v, b = cities[i + 1].v, mid = a.clone().add(b).multiplyScalar(0.5); mid.y += 0.5 + a.distanceTo(b) * 0.18;
    const cv = new THREE.QuadraticBezierCurve3(a.clone().setY(TOP + 0.15), mid, b.clone().setY(TOP + 0.15));
    const n = Math.max(6, Math.round(cv.getLength() / 0.28)), on = cities[i + 1].flagged && cities[i].flagged;
    for (let k = 1; k < n; k++) { const d = new THREE.Mesh(dotG, on ? dotOn : dotOff); d.position.copy(cv.getPoint(k / n)); scene.add(d); }
  }

  // Thành phố: bệ, cột cờ, cờ vải bay
  const flagTex = n => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 160; const x = cv.getContext('2d');
    x.fillStyle = '#f08a3c'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#d96f22'; x.fillRect(0, 124, 256, 36);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(92, 70, 44, 0, 7); x.fill();
    x.fillStyle = '#006687'; x.font = '900 60px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), 92, 73);
    x.fillStyle = '#fff'; x.font = '900 30px sans-serif'; x.fillText('BizOn', 190, 72);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const baseM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  const ringM = new THREE.MeshStandardMaterial({ color: 0x006687, roughness: 0.5 });
  const poleM = new THREE.MeshStandardMaterial({ color: 0x2b3440, roughness: 0.4, metalness: 0.4 });
  const goldM = new THREE.MeshStandardMaterial({ color: 0xffc94a, roughness: 0.3, metalness: 0.6 });
  const flags = [];
  let pulse = null, bob = null, animFlag = null;
  cities.forEach(c => {
    const g = new THREE.Group(); g.position.copy(c.v); scene.add(g);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.14, 24), c.flagged ? baseM : ringM); base.position.y = 0.07; base.castShadow = base.receiveShadow = true; g.add(base);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 24), c.flagged ? ringM : baseM); rim.position.y = 0.08; g.add(rim);
    if (c.flagged) {
      const f = new THREE.Group(); g.add(f);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.7, 8), poleM); pole.position.y = 0.95; pole.castShadow = true; f.add(pole);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), goldM); knob.position.y = 1.82; f.add(knob);
      const cg = new THREE.PlaneGeometry(0.95, 0.6, 14, 4); cg.translate(0.475, 0, 0);
      const cloth = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ map: flagTex(c.n), side: THREE.DoubleSide, roughness: 0.8 }));
      cloth.position.set(0.02, 1.45, 0); cloth.castShadow = true; f.add(cloth);
      flags.push({ geo: cg, base: Float32Array.from(cg.attributes.position.array), ph: c.n });
      if (c.n === o.anim) { animFlag = f; f.position.y = 7; f.visible = false; }
    } else if (c.cur) {
      pulse = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.44, 40), new THREE.MeshBasicMaterial({ color: 0xf08a3c, transparent: true, side: THREE.DoubleSide }));
      pulse.rotation.x = -Math.PI / 2; pulse.position.y = 0.16; g.add(pulse);
      bob = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 4), new THREE.MeshStandardMaterial({ color: 0xf08a3c, emissive: 0xf08a3c, emissiveIntensity: 0.3 }));
      bob.rotation.x = Math.PI; bob.position.y = 0.9; bob.castShadow = true; g.add(bob);
    }
  });

  // Thị trường động: cột nhu cầu (cao) + màu cạnh tranh (xanh→đỏ) cạnh mỗi thành phố
  const MK0 = window.BizonMarket && window.BizonMarket.snapshot ? window.BizonMarket.snapshot() : null;
  const MK = MK0 && MK0.enabled ? MK0 : null;
  const mkBox = root.querySelector('.mk');
  const showMk = n => {
    if (!MK || !mkBox) return; const m = MK.cities[n - 1]; if (!m) return;
    const p = window.BizonMarket.livePrice(n), pl = m.played;
    mkBox.hidden = false;
    mkBox.innerHTML = `<div class="t"><span>${m.name}</span><small>${m.status === 'done' ? tr('ĐÃ CHƠI', 'PLAYED') : m.status === 'cur' ? tr('VÒNG NÀY', 'THIS ROUND') : tr('SẮP TỚI', 'UPCOMING')}</small></div><div class="g">
      <div><small>${tr('Giá TB', 'Avg price')}</small><b>${p.toFixed(0)}k</b></div><div><small>${tr('Nhu cầu', 'Demand')}</small><b>${m.units.toLocaleString('vi-VN')}</b></div><div><small>${pl ? tr('Thị phần', 'Share') : tr('Cạnh tranh', 'Comp.')}</small><b>${pl ? pl.share + '%' : m.comp}</b></div>
      <div><small>${tr('Niềm tin', 'Trust')}</small><b>${m.trust}</b></div><div><small>${tr('V.chuyển', 'Shipping')}</small><b>+${Math.round((m.ship - 1) * 100)}%</b></div><div><small>${pl ? tr('Doanh thu', 'Revenue') : tr('Quy mô', 'Size')}</small><b>${(pl ? pl.revenue : m.size).toLocaleString('vi-VN')}tr</b></div></div>`;
  };
  if (MK) cities.forEach(c => {
    const m = MK.cities[c.n - 1]; if (!m) return;
    const h = 0.25 + m.demand * 1.15;
    const col = new THREE.Color().setHSL((1 - m.comp / 100) * 0.36, 0.65, 0.48);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, h, 12), new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, emissive: col, emissiveIntensity: 0.12 }));
    bar.position.set(c.v.x + 0.52, TOP + h / 2, c.v.z + 0.1); bar.castShadow = true; scene.add(bar);
    const cap = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 20), new THREE.MeshStandardMaterial({ color: 0xf08a3c, roughness: 0.4 }));
    cap.rotation.x = Math.PI / 2; cap.position.set(bar.position.x, TOP + 0.02 + (h - 0.05) * (m.trust / 100), bar.position.z); scene.add(cap);
  });
  // Nhãn HTML
  const lbls = cities.map(c => {
    const el = document.createElement('div'); el.className = 'lb' + (c.flagged ? ' on' : '') + (c.cur && !c.flagged ? ' cur' : '');
    el.innerHTML = `<i>${c.flagged ? '✓' : c.n}</i>${c.name}`; labels.appendChild(el);
    el.onclick = () => { goal.t.copy(c.v).setY(0); goal.d = 8.5; auto = false; showMk(c.n); };
    return { el, pos: c.v.clone().setY(TOP + (c.flagged ? 2.1 : c.cur ? 1.3 : 0.5)) };
  }).concat(isleLabels.map(l => { const el = document.createElement('div'); el.className = 'lb isl'; el.textContent = l.text; labels.appendChild(el); return { el, pos: l.pos }; }));

  // Camera quỹ đạo tự viết (không cần addon)
  const cam = { t: new THREE.Vector3(1.3, 0, -0.4), d: 27, az: 0.12, pol: 0.78 };
  const goal = { t: cam.t.clone(), d: 23, az: -0.05, pol: 0.72 };
  const focus = o.anim ? cities.find(c => c.n === o.anim) : cities.find(c => c.cur);
  let auto = !!o.anim;
  const t0 = performance.now();
  if (!o.anim && focus) { goal.t.lerp(focus.v.clone().setY(0), 0.35); }
  const ptrs = new Map(); let pinch = 0;
  const cvs = renderer.domElement;
  cvs.addEventListener('pointerdown', e => { cvs.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); auto = false; });
  cvs.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return; const [px, py] = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 1) { goal.az -= (e.clientX - px) * 0.006; goal.pol -= (e.clientY - py) * 0.005; }
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) goal.d *= pinch / d; pinch = d; }
    goal.az = Math.max(-1.1, Math.min(1.1, goal.az)); goal.pol = Math.max(0.3, Math.min(1.2, goal.pol)); goal.d = Math.max(6, Math.min(34, goal.d));
  });
  const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = 0; };
  cvs.addEventListener('pointerup', up); cvs.addEventListener('pointercancel', up);
  cvs.addEventListener('wheel', e => { e.preventDefault(); auto = false; goal.d = Math.max(6, Math.min(34, goal.d * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });

  // Pháo giấy
  const conf = []; const confG = new THREE.PlaneGeometry(0.07, 0.11);
  const burst = at => { const cols = [0xf08a3c, 0x006687, 0xffc94a, 0xffffff, 0x8fcf6b, 0xe8412c];
    for (let i = 0; i < 110; i++) { const m = new THREE.Mesh(confG, new THREE.MeshBasicMaterial({ color: cols[i % cols.length], side: THREE.DoubleSide })); m.position.copy(at).add(new THREE.Vector3(0, 1.6, 0));
      const a = rnd() * 6.28, sp = 1.2 + rnd() * 2.2; conf.push({ m, v: new THREE.Vector3(Math.cos(a) * sp, 3 + rnd() * 3, Math.sin(a) * sp), r: new THREE.Vector3(rnd() * 8, rnd() * 8, rnd() * 8), life: 3.2 }); scene.add(m); } };

  const pn = root.querySelector('.pn');
  const resize = () => { const w = root.clientWidth, h = root.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
    const side = w > 760 ? pn.offsetWidth + 18 : 0, bottom = w > 760 ? 0 : pn.offsetHeight + 12;
    if (side || bottom) camera.setViewOffset(w, h, side / 2, bottom / 2, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(root); resize();
  const tmp = new THREE.Vector3();
  let raf, last = performance.now(), dropT = -1, landed = false, frame = 0;
  const loop = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; const el = (now - t0) / 1000; frame++;
    if (auto && o.anim && focus) {
      if (el > 0.7) { goal.t.copy(focus.v).setY(0); goal.d = 9; goal.pol = 0.82; goal.az = 0.25; }
      if (el > 1.9 && dropT < 0 && animFlag) { dropT = el; animFlag.visible = true; }
      if (el > 6) { goal.t.set(1.3, 0, -0.4).lerp(focus.v.clone().setY(0), 0.35); goal.d = 22; goal.pol = 0.72; goal.az = -0.05; auto = false; }
    } else if (o.anim && animFlag && dropT < 0) { dropT = el; animFlag.visible = true; }
    const k = 1 - Math.exp(-dt * 2.6);
    cam.t.lerp(goal.t, k); cam.d += (goal.d - cam.d) * k; cam.az += (goal.az - cam.az) * k; cam.pol += (goal.pol - cam.pol) * k;
    camera.position.set(cam.t.x + cam.d * Math.sin(cam.pol) * Math.sin(cam.az), cam.d * Math.cos(cam.pol), cam.t.z + cam.d * Math.sin(cam.pol) * Math.cos(cam.az));
    camera.lookAt(cam.t);
    if (animFlag && dropT >= 0 && !landed) {
      const u = Math.min(1, (el - dropT) / 0.9), e = u < 1 ? 1 - Math.abs(Math.cos(u * Math.PI * 1.5)) * (1 - u) ** 2 : 1;
      animFlag.position.y = 7 * (1 - Math.min(1, u * 1.15)) + (u > .87 ? 0 : 0) ; animFlag.scale.y = u > .8 && u < 1 ? 0.85 + (u - .8) * .75 : 1;
      if (u >= 1) { landed = true; animFlag.position.y = 0; animFlag.scale.y = 1; burst(focus.v); } void e;
    }
    if (frame % 2 === 0) { const pa = seaG.attributes.position; for (let i = 0; i < pa.count; i++) { const x = seaBase[i * 3], z = seaBase[i * 3 + 2]; pa.array[i * 3 + 1] = Math.sin(x * 0.7 + el * 1.3) * 0.05 + Math.cos(z * 0.6 + el) * 0.05; } pa.needsUpdate = true; seaG.computeVertexNormals(); }
    flags.forEach(f => { const pa = f.geo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = f.base[i * 3], y = f.base[i * 3 + 1]; pa.array[i * 3 + 2] = Math.sin(x * 7 - el * 6 + f.ph) * 0.07 * x + Math.sin(y * 4 + el * 3) * 0.015 * x; } pa.needsUpdate = true; f.geo.computeVertexNormals(); });
    if (pulse) { const p = (el % 1.4) / 1.4; pulse.scale.setScalar(1 + p * 1.2); pulse.material.opacity = 1 - p; }
    if (bob) { bob.position.y = 0.9 + Math.sin(el * 3) * 0.12; bob.rotation.y = el * 1.5; }
    for (let i = conf.length - 1; i >= 0; i--) { const c = conf[i]; c.v.y -= 6 * dt; c.v.multiplyScalar(0.985); c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += c.r.x * dt; c.m.rotation.y += c.r.y * dt; c.life -= dt; if (c.life <= 0 || c.m.position.y < 0.1) { scene.remove(c.m); c.m.material.dispose(); conf.splice(i, 1); } }
    renderer.render(scene, camera);
    const w = root.clientWidth, h = root.clientHeight;
    lbls.forEach(l => { tmp.copy(l.pos).project(camera); const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1; l.el.style.display = vis ? 'flex' : 'none'; if (vis) l.el.style.transform = `translate(${(tmp.x * .5 + .5) * w}px,${(-tmp.y * .5 + .5) * h}px) translate(-50%,-100%)`; });
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const close = () => {
    cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown', kd);
    scene.traverse(x => { if (x.geometry) x.geometry.dispose(); const m = x.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(mm => { if (mm.map) mm.map.dispose(); mm.dispose(); }); });
    renderer.dispose(); root.remove(); o.onClose && o.onClose();
  };
  const kd = e => { if (e.key === 'Escape' && !o.anim) close(); };
  window.addEventListener('keydown', kd);
  root.querySelector('.pn button.cl').onclick = close;
  const mkb = root.querySelector('.pn button.mkb');
  if (mkb) mkb.onclick = () => window.BizonMarket.open({ city: (focus && focus.n) || 1 });
  if (focus) showMk(focus.n);
  return { close };
}
