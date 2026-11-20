/* Bảng tinh chỉnh cảnh 3D cho người làm game (19/11/2026). Chỉ chạy khi địa chỉ có ?tinh-chinh=1: người chơi không thấy,
 * trang không tải thêm gì. Dùng Tweakpane 4.0.5 (© cocopon, MIT; vendor/tweakpane/). Chỉ chỉnh phần hiển thị (máy quay,
 * ánh sáng, sương, độ sáng, độ nét), không đụng luật chơi hay số liệu; tải lại trang là về như cũ.
 * Nút «Chép thông số» chép JSON các giá trị đang thấy để dán vào mã.
 * Gắn trong module 3D (sau khi có renderer, scene, camera):
 *   if (/[?&]tinh-chinh=1(&|$)/.test(location.search)) import('./tinh-chinh-3d.js').then(m => m.gan({ ten, renderer, scene, camera, controls }));
 * © 2026 Đỗ Thùy Hương & Phan Anh Tú. */
export const batTinhChinh = (q = location.search) => /[?&]tinh-chinh=1(&|$)/.test(q);
const r3 = v => Math.round(v * 1000) / 1000;

export async function gan(o) {
  if (!batTinhChinh() || !o || !o.renderer || !o.scene || !o.camera) return null;
  const { Pane } = await import('../vendor/tweakpane/tweakpane.min.js');
  const en = document.documentElement.lang === 'en';
  const T = (vi, e) => (en ? e : vi);
  const { renderer: r, scene: s, camera: c, controls: ctl } = o;
  const pane = new Pane({ title: T('Tinh chỉnh · ', 'Tuning · ') + (o.ten || '3D'), expanded: !matchMedia('(max-width: 600px)').matches });
  const box = pane.element.parentElement; box.style.zIndex = '2147483000'; box.dataset.tinhChinh = '';

  // Hiệu năng: khung hình mỗi giây, số lần vẽ, số tam giác
  const hn = { fps: 0, calls: 0, tris: 0 };
  const fHn = pane.addFolder({ title: T('Hiệu năng', 'Performance') });
  fHn.addBinding(hn, 'fps', { readonly: true, view: 'graph', min: 0, max: 90, label: T('Khung/giây', 'FPS') });
  fHn.addBinding(hn, 'calls', { readonly: true, label: T('Lần vẽ', 'Draw calls'), format: v => v.toFixed(0) });
  fHn.addBinding(hn, 'tris', { readonly: true, label: T('Tam giác', 'Triangles'), format: v => v.toFixed(0) });
  let n = 0, t0 = performance.now();
  (function dem() { n++; const t = performance.now(); if (t - t0 >= 500) { hn.fps = Math.round(n * 1000 / (t - t0)); n = 0; t0 = t; hn.calls = r.info.render.calls; hn.tris = r.info.render.triangles; } requestAnimationFrame(dem); })();

  // Hiển thị
  const fHt = pane.addFolder({ title: T('Hiển thị', 'Rendering') });
  const ht = { pr: r.getPixelRatio() };
  fHt.addBinding(ht, 'pr', { min: 0.5, max: 3, step: 0.25, label: T('Độ nét', 'Pixel ratio') }).on('change', e => { r.setPixelRatio(e.value); const el = r.domElement; r.setSize(el.clientWidth, el.clientHeight, false); });
  if (typeof r.toneMappingExposure === 'number') fHt.addBinding(r, 'toneMappingExposure', { min: 0.2, max: 3, step: 0.01, label: T('Độ sáng', 'Exposure') });
  if (s.fog && 'near' in s.fog) {
    fHt.addBinding(s.fog, 'near', { min: 0, max: 400, step: 1, label: T('Sương: gần', 'Fog near') });
    fHt.addBinding(s.fog, 'far', { min: 1, max: 800, step: 1, label: T('Sương: xa', 'Fog far') });
  }

  // Máy quay
  const fMq = pane.addFolder({ title: T('Máy quay', 'Camera') });
  const capNhat = () => { c.updateProjectionMatrix(); if (ctl && ctl.update) ctl.update(); };
  if ('fov' in c) fMq.addBinding(c, 'fov', { min: 15, max: 90, step: 1, label: T('Góc nhìn', 'FOV') }).on('change', capNhat);
  fMq.addBinding(c, 'position', { label: T('Vị trí', 'Position') }).on('change', capNhat);
  if (ctl && ctl.target) fMq.addBinding(ctl.target, 'x', { label: T('Nhìn vào x', 'Target x') }).on('change', capNhat);
  if (ctl && ctl.target) fMq.addBinding(ctl.target, 'z', { label: T('Nhìn vào z', 'Target z') }).on('change', capNhat);

  // Ánh sáng: mọi đèn trong cảnh
  const den = []; s.traverse(x => { if (x.isLight) den.push(x); });
  if (den.length) {
    const fAs = pane.addFolder({ title: T('Ánh sáng', 'Lights') + ' (' + den.length + ')', expanded: false });
    den.forEach((d, i) => {
      const ten = (d.name || d.type.replace('Light', '')) + ' ' + (i + 1);
      fAs.addBinding(d, 'intensity', { min: 0, max: 6, step: 0.01, label: ten });
      if (d.color) fAs.addBinding(d, 'color', { color: { type: 'float' }, label: T('màu ', 'color ') + (i + 1) });
    });
  }
  if (typeof o.them === 'function') o.them(pane, T);   // trang có thể thêm thông số riêng

  const thongSo = () => ({
    pixelRatio: r.getPixelRatio(), exposure: r3(r.toneMappingExposure),
    fog: s.fog && 'near' in s.fog ? { near: s.fog.near, far: s.fog.far } : null,
    camera: { fov: c.fov, position: c.position.toArray().map(r3), target: ctl && ctl.target ? ctl.target.toArray().map(r3) : null },
    lights: den.map(d => ({ type: d.type, intensity: r3(d.intensity), color: d.color ? '#' + d.color.getHexString() : null }))
  });
  pane.addButton({ title: T('Chép thông số', 'Copy values') }).on('click', () => {
    const txt = JSON.stringify(thongSo(), null, 2);
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).catch(() => console.log(txt));
  });
  window.__tinhChinh = { pane, thongSo };
  return pane;
}
