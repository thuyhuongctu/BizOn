import { person } from './model-person.js';
// Đội 5 người trên ghe mui (bow toward -x, deck top y≈0.345).
export function buildTeam(THREE, M) {
  const g = new THREE.Group(); g.name = 'doi_5_nguoi';
  const D = 0.345;
  g.add(person(THREE, M, { name: 'cmo_lavender', pose: 'sit', pos: [-2.15, 0.3, 0.35], ry: 0.5, look: 0.2, shirt: M.lavender, pants: M.pants, scarf: M.scarf, style: 'long', prop: 'book', hands: [[0.02, 0.86, 0.36], [-0.12, 0.84, 0.3]] }));
  g.add(person(THREE, M, { name: 'ceo_yellow', pos: [-1.3, D, -0.15], ry: 0.4, shirt: M.yellow, pants: M.pants, scarf: M.scarf, style: 'bob', prop: 'megaphone', hands: [[0.16, 1.22, 0.26], [-0.2, 0.95, 0.15]] }));
  g.add(person(THREE, M, { name: 'cfo_brown', pos: [0.15, D, -0.35], ry: 0.25, shirt: M.brown, pants: M.pants, scarf: M.scarf, style: 'bun', hands: [[0.12, 0.92, 0.2], [-0.12, 0.92, 0.2]] }));
  g.add(person(THREE, M, { name: 'coo_blue', male: true, pos: [1.0, D, 0.05], ry: 0.15, look: -0.15, shirt: M.shirtBlue, pants: M.pantsDark, scarf: M.scarfRed, prop: 'book', hands: [[0.08, 1.12, 0.3], [-0.24, 0.9, 0.08]] }));
  g.add(person(THREE, M, { name: 'sec_olive', pose: 'sit', pos: [2.0, 0.3, -0.25], ry: 0.3, shirt: M.oliveGreen, pants: M.pants, scarf: M.scarf, style: 'bun', prop: 'basket', hands: [[0.12, 0.62, 0.3], [-0.12, 0.62, 0.3]] }));
  return g;
}
