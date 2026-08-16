#!/usr/bin/env node
/**
 * Lumina session-dialogue parity check.
 *
 * Bảo đảm hai file thoại VI/EN đồng bộ theo quy tắc parity:
 *   - Cùng tập ID (không lệch file).
 *   - Cùng danh sách biến {vars} cho mỗi ID.
 *   - Không tham chiếu ID đã bị gỡ (glossary check: adv-01, adv-05).
 *   - Không có placeholder {var} nào trong text mà thiếu khai báo ở "vars".
 *
 * Chạy: node scripts/dialogue/parity-check.mjs
 * Thoát mã 0 nếu đạt, 1 nếu có lỗi.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const VI = resolve(ROOT, 'assets/dialogue/lumina-classroom-mekong.vi.json');
const EN = resolve(ROOT, 'assets/dialogue/lumina-classroom-mekong.en.json');

// ID đã gỡ khỏi glossary — thoại mới không được tham chiếu (bài học adv-01/adv-05).
const REMOVED_IDS = ['adv-01', 'adv-05'];

const errors = [];
const load = (p) => {
  try { return JSON.parse(readFileSync(p, 'utf-8')); }
  catch (e) { errors.push(`Không đọc được ${p}: ${e.message}`); return null; }
};

const vi = load(VI);
const en = load(EN);

if (vi && en) {
  const byId = (doc) => new Map((doc.dialogues || []).map((d) => [d.id, d]));
  const viMap = byId(vi);
  const enMap = byId(en);

  const viIds = [...viMap.keys()].sort();
  const enIds = [...enMap.keys()].sort();

  // 1) Cùng tập ID
  const onlyVi = viIds.filter((id) => !enMap.has(id));
  const onlyEn = enIds.filter((id) => !viMap.has(id));
  if (onlyVi.length) errors.push(`ID chỉ có ở VI: ${onlyVi.join(', ')}`);
  if (onlyEn.length) errors.push(`ID chỉ có ở EN: ${onlyEn.join(', ')}`);

  // 2..4) Kiểm tra từng ID chung
  const placeholders = (t) => [...t.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]);
  for (const id of viIds.filter((id) => enMap.has(id))) {
    const v = viMap.get(id);
    const e = enMap.get(id);

    // vars khớp giữa hai ngôn ngữ
    const vv = [...(v.vars || [])].sort();
    const ev = [...(e.vars || [])].sort();
    if (JSON.stringify(vv) !== JSON.stringify(ev)) {
      errors.push(`vars lệch ở ${id}: VI=[${vv}] vs EN=[${ev}]`);
    }
    // trigger khớp
    if (v.trigger !== e.trigger) errors.push(`trigger lệch ở ${id}: VI=${v.trigger} vs EN=${e.trigger}`);
    if (v.session_scope !== e.session_scope) errors.push(`session_scope lệch ở ${id}`);

    // placeholder trong text phải nằm trong vars (cả hai ngôn ngữ)
    for (const [lang, node] of [['VI', v], ['EN', e]]) {
      const declared = new Set(node.vars || []);
      for (const ph of placeholders(node.text || '')) {
        if (!declared.has(ph)) errors.push(`${lang} ${id}: placeholder {${ph}} không khai báo trong vars`);
      }
      // glossary: không tham chiếu ID đã gỡ
      for (const rm of REMOVED_IDS) {
        if ((node.text || '').includes(rm)) errors.push(`${lang} ${id}: tham chiếu ID đã gỡ '${rm}'`);
      }
    }
  }
  console.log(`VI: ${viIds.length} ID · EN: ${enIds.length} ID`);
  console.log(`IDs: ${viIds.join(', ')}`);
}

if (errors.length) {
  console.error('\n❌ PARITY CHECK THẤT BẠI:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('\n✅ PARITY CHECK ĐẠT — hai file VI/EN đồng bộ.');
