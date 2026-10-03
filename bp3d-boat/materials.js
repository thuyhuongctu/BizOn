export function makeMaterials(THREE) {
  const mat = (name, color, roughness = 0.7, metalness = 0) => new THREE.MeshStandardMaterial({ name, color, roughness, metalness });
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const gingham = (a, b) => {
    x.fillStyle = a; x.fillRect(0, 0, 64, 64); x.globalAlpha = 0.55; x.fillStyle = b;
    for (let i = 0; i < 64; i += 16) { x.fillRect(i, 0, 8, 64); x.fillRect(0, i, 64, 8); }
    x.globalAlpha = 1; for (let i = 0; i < 64; i += 16) for (let j = 0; j < 64; j += 16) x.fillRect(i, j, 8, 8);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace;
    const img = document.createElement('canvas'); img.width = img.height = 64; img.getContext('2d').drawImage(c, 0, 0); t.image = img; return t;
  };
  const M = {
    hull: mat('teak_hull', '#7a4e30', 0.65), trim: mat('dark_teak', '#553420', 0.6), plank: mat('deck_plank', '#a87448', 0.75),
    hullSide: mat('teak_weathered', '#7a5234', 0.7), roofGreen: mat('mui_green', '#5f8a6a', 0.75), roofEdge: mat('mui_edge', '#7a5a3a', 0.7),
    wicker: mat('wicker', '#b88a4e', 0.9), bamboo: mat('bamboo', '#d9b56a', 0.55), bambooNode: mat('bamboo_node', '#a8843f', 0.6),
    mango: mat('mango_yellow', '#f2c230', 0.45), mangoOrange: mat('mango_orange', '#f08a24', 0.45), red: mat('tomato_red', '#d63a2a', 0.35),
    lime: mat('lime_green', '#9cc93a', 0.5), pineapple: mat('pineapple', '#c99a2e', 0.8), durian: mat('durian', '#8aa23a', 0.85),
    leaf: mat('leaf', '#3f8a44', 0.7), melon: mat('watermelon', '#2f6a35', 0.5), coconut: mat('coconut', '#8a5a34', 0.85),
    papaya: mat('papaya_green', '#7fae4a', 0.5), radish: mat('radish_white', '#f2efe6', 0.6), dragon: mat('dragon_fruit', '#d23a78', 0.5),
    skin: mat('skin', '#f2c4a0', 0.6), blush: mat('blush', '#ec9a8a', 0.7), eyeDark: mat('eye_dark', '#2a1a14', 0.3), mouth: mat('mouth', '#b6524a', 0.6),
    eyeWhite: mat('eye_white', '#f5efe2', 0.6), iris: mat('iris_brown', '#5a3420', 0.3), brow: mat('brow', '#3a2418', 0.6), teeth: mat('teeth', '#fbf7ef', 0.4),
    button: mat('button', '#efe8f5', 0.4), embroidery: mat('embroidery_violet', '#7a4fb0', 0.6), shirtSeam: mat('denim_seam', '#3a5580', 0.8),
    dark: mat('ink', '#1c1a18', 0.6), boatEyeRed: mat('boat_eye_red', '#c8342a', 0.5), metal: mat('motor_grey', '#9a9a96', 0.45, 0.3), motorRed: mat('motor_red', '#b33a2e', 0.5),
    lavender: mat('lavender_ao_ba_ba', '#c4b0e0', 0.75), yellow: mat('yellow_ao', '#e8c23a', 0.75), brown: mat('brown_ao', '#a8603e', 0.8),
    shirtBlue: mat('denim_blue', '#4a74b0', 0.8), oliveGreen: mat('olive_ao', '#7a9a5a', 0.8),
    pants: mat('black_silk', '#24232a', 0.5), pantsDark: mat('charcoal', '#2b2b30', 0.7),
    hairDark: mat('hair_black', '#241e1a', 0.5), hairAuburn: mat('hair_auburn', '#9a4a26', 0.55),
    paper: mat('paper', '#f4f0e4', 0.8), megaphone: mat('megaphone_white', '#eeeeea', 0.4), water: mat('river_phu_sa', '#9aa97e', 0.6),
    nonLa: mat('non_la', '#e8d29a', 0.8), shirtGreen: mat('shirt_green', '#5f9a6a', 0.8), shirtRed: mat('shirt_red', '#c8574a', 0.8), shirtCyan: mat('shirt_cyan', '#5aa6c4', 0.8),
  };
  M.scarf = mat('khan_ran_black', '#ffffff', 0.85); M.scarf.map = gingham('#f3efe4', '#1e1e1e');
  M.scarfRed = mat('khan_ran_red', '#ffffff', 0.85); M.scarfRed.map = gingham('#f3e2d6', '#b8352c');
  return M;
}
