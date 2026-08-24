#!/usr/bin/env node
// Kiểm tra tính đồng bộ giữa hai bản thoại Lumina song song:
//   docs/loi-thoai-lumina.md      (tiếng Việt)
//   docs/loi-thoai-lumina-en.md   (tiếng Anh)
//
// Chặn lớp lỗi "hai file thoại trôi lệch nhau" — loại lỗi mà một dòng sửa ở bản
// này nhưng quên bản kia, phát hiện muộn thì phải thu lại giọng (rất đắt).
//
// Hai tầng kiểm:
//   1) PARITY ID (luôn chạy):     tập ID thoại ở hai file phải trùng khít.
//   2) CHỐNG TRÔI NỘI DUNG (khi có base): nếu văn bản của một ID đổi ở bản này
//      mà KHÔNG đổi ở bản kia trong cùng thay đổi → báo lỗi.
//
// Dùng:
//   node scripts/lumina-parity-check.mjs                 # chỉ kiểm parity ID
//   PARITY_BASE=<git-ref> node scripts/lumina-parity-check.mjs   # + chống trôi
//
// Không phụ thuộc thư viện ngoài; không phụ thuộc reviewer bên thứ ba.

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const VI = 'docs/loi-thoai-lumina.md';
const EN = 'docs/loi-thoai-lumina-en.md';
const READING_GUIDE_HEADER = '## 🗣️ Bản đọc cho thu âm'; // phần này chỉ có ở bản VI

// Lấy ô cuối cùng (không rỗng) của một dòng bảng markdown.
function lastCell(line) {
  const cells = line.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
  return cells.length ? cells[cells.length - 1] : '';
}

// Trả về Map(id -> text) cho các câu thoại trong một file.
//   VI: khớp `voice/<id>.mp3`, chỉ tính phần TRƯỚC mục "Bản đọc cho thu âm".
//   EN: khớp `voice/en/<id>.mp3`.
function parse(content, isEN) {
  let body = content;
  if (!isEN) {
    const cut = content.indexOf(READING_GUIDE_HEADER);
    if (cut >= 0) body = content.slice(0, cut);
  }
  const re = isEN ? /voice\/en\/([a-z]+-\d+)\.mp3/ : /voice\/([a-z]+-\d+)\.mp3/;
  const map = new Map();
  for (const line of body.split('\n')) {
    const m = line.match(re);
    if (!m) continue;
    const id = m[1];
    const text = lastCell(line);
    if (map.has(id)) {
      // Trong phần thoại, mỗi ID chỉ nên xuất hiện một lần.
      map.set(id, `${map.get(id)}\n${text}`);
    } else {
      map.set(id, text);
    }
  }
  return map;
}

function readWorktree(path, isEN) {
  return parse(readFileSync(path, 'utf8'), isEN);
}

function readBase(baseRef, path, isEN) {
  try {
    const content = execSync(`git show ${baseRef}:${path}`, { encoding: 'utf8' });
    return parse(content, isEN);
  } catch {
    // File chưa tồn tại ở base (mới thêm) → coi như rỗng.
    return new Map();
  }
}

const errors = [];

// --- Tầng 1: parity ID ---
const headVI = readWorktree(VI, false);
const headEN = readWorktree(EN, true);
const viIds = new Set(headVI.keys());
const enIds = new Set(headEN.keys());

const onlyVI = [...viIds].filter((id) => !enIds.has(id)).sort();
const onlyEN = [...enIds].filter((id) => !viIds.has(id)).sort();

if (onlyVI.length) errors.push(`ID chỉ có ở bản VIỆT (thiếu ở EN): ${onlyVI.join(', ')}`);
if (onlyEN.length) errors.push(`ID chỉ có ở bản ANH (thiếu ở VI): ${onlyEN.join(', ')}`);

// --- Tầng 2: chống trôi nội dung (chỉ khi có base) ---
const baseRef = process.env.PARITY_BASE;
if (baseRef) {
  const baseVI = readBase(baseRef, VI, false);
  const baseEN = readBase(baseRef, EN, true);
  const changed = (base, head) => {
    const ids = new Set([...base.keys(), ...head.keys()]);
    const out = new Set();
    for (const id of ids) if (base.get(id) !== head.get(id)) out.add(id);
    return out;
  };
  const viChanged = changed(baseVI, headVI);
  const enChanged = changed(baseEN, headEN);

  // ID có ở CẢ hai bản mà chỉ đổi một bên → trôi lệch.
  const bothLangs = (id) => viIds.has(id) && enIds.has(id);
  const viOnlyChange = [...viChanged].filter((id) => bothLangs(id) && !enChanged.has(id)).sort();
  const enOnlyChange = [...enChanged].filter((id) => bothLangs(id) && !viChanged.has(id)).sort();

  if (viOnlyChange.length)
    errors.push(
      `Bản VIỆT đổi nhưng bản ANH KHÔNG đổi cho: ${viOnlyChange.join(', ')} — cập nhật ${EN} tương ứng.`
    );
  if (enOnlyChange.length)
    errors.push(
      `Bản ANH đổi nhưng bản VIỆT KHÔNG đổi cho: ${enOnlyChange.join(', ')} — cập nhật ${VI} tương ứng.`
    );
} else {
  console.log('ℹ️  PARITY_BASE chưa đặt — bỏ qua tầng chống trôi nội dung (chỉ kiểm parity ID).');
}

// --- Tầng 3: bộ thoại session-scope (JSON) — lớp học & Mekong (cls-*/mks-*) ---
// Bảng voice/<id>.mp3 ở trên KHÔNG phủ các dòng cls-*/mks-* (không có clip, ID hai
// gạch nối). Cặp JSON máy đọc dưới đây là nguồn chuẩn cho nhóm thoại đó; áp đúng
// nguyên tắc: ID/vars/trigger/scope trùng khít, và không trôi nội dung một bên.
const DJ_VI = 'assets/dialogue/lumina-classroom-mekong.vi.json';
const DJ_EN = 'assets/dialogue/lumina-classroom-mekong.en.json';
const REMOVED_IDS = ['adv-01', 'adv-05']; // bài học glossary: thoại mới không tham chiếu ID đã chỉnh/gỡ

function parseDialogueJSON(text) {
  const map = new Map();
  if (!text) return map;
  let doc;
  try { doc = JSON.parse(text); } catch { return map; }
  for (const d of doc.dialogues || []) {
    map.set(d.id, {
      text: d.text || '',
      vars: (d.vars || []).slice().sort().join(','),
      trigger: d.trigger || '',
      scope: d.session_scope || ''
    });
  }
  return map;
}
const readJSONWorktree = (path) => { try { return parseDialogueJSON(readFileSync(path, 'utf8')); } catch { return new Map(); } };
const readJSONBase = (ref, path) => { try { return parseDialogueJSON(execSync(`git show ${ref}:${path}`, { encoding: 'utf8' })); } catch { return new Map(); } };

const djVI = readJSONWorktree(DJ_VI);
const djEN = readJSONWorktree(DJ_EN);
if (djVI.size || djEN.size) {
  const jvi = new Set(djVI.keys());
  const jen = new Set(djEN.keys());
  const jOnlyVI = [...jvi].filter((id) => !jen.has(id)).sort();
  const jOnlyEN = [...jen].filter((id) => !jvi.has(id)).sort();
  if (jOnlyVI.length) errors.push(`[JSON cls/mks] ID chỉ có ở bản VIỆT (thiếu ở EN): ${jOnlyVI.join(', ')}`);
  if (jOnlyEN.length) errors.push(`[JSON cls/mks] ID chỉ có ở bản ANH (thiếu ở VI): ${jOnlyEN.join(', ')}`);

  for (const id of [...jvi].filter((id) => jen.has(id))) {
    const a = djVI.get(id);
    const b = djEN.get(id);
    if (a.vars !== b.vars) errors.push(`[JSON cls/mks] vars lệch ở ${id}: VI[${a.vars}] vs EN[${b.vars}]`);
    if (a.trigger !== b.trigger) errors.push(`[JSON cls/mks] trigger lệch ở ${id}: VI=${a.trigger} vs EN=${b.trigger}`);
    if (a.scope !== b.scope) errors.push(`[JSON cls/mks] session_scope lệch ở ${id}: VI=${a.scope} vs EN=${b.scope}`);
    for (const [lang, node] of [['VIỆT', a], ['ANH', b]]) {
      for (const rm of REMOVED_IDS) {
        if (node.text.includes(rm)) errors.push(`[JSON cls/mks] bản ${lang} ${id}: tham chiếu ID đã chỉnh/gỡ '${rm}'`);
      }
    }
  }

  // Chống trôi nội dung (khi có base): text đổi một bên mà bên kia không đổi.
  if (baseRef) {
    const bVI = readJSONBase(baseRef, DJ_VI);
    const bEN = readJSONBase(baseRef, DJ_EN);
    const textMap = (m) => new Map([...m].map(([k, v]) => [k, v.text]));
    const changedIds = (base, head) => {
      const ids = new Set([...base.keys(), ...head.keys()]);
      const out = new Set();
      for (const id of ids) if (base.get(id) !== head.get(id)) out.add(id);
      return out;
    };
    const vC = changedIds(textMap(bVI), textMap(djVI));
    const eC = changedIds(textMap(bEN), textMap(djEN));
    const both = (id) => jvi.has(id) && jen.has(id);
    const vOnly = [...vC].filter((id) => both(id) && !eC.has(id)).sort();
    const eOnly = [...eC].filter((id) => both(id) && !vC.has(id)).sort();
    if (vOnly.length) errors.push(`[JSON cls/mks] Bản VIỆT đổi nhưng bản ANH KHÔNG đổi cho: ${vOnly.join(', ')} — cập nhật ${DJ_EN}.`);
    if (eOnly.length) errors.push(`[JSON cls/mks] Bản ANH đổi nhưng bản VIỆT KHÔNG đổi cho: ${eOnly.join(', ')} — cập nhật ${DJ_VI}.`);
  }

  if (!errors.some((e) => e.startsWith('[JSON'))) {
    console.log(`✅ JSON cls/mks parity OK — ${jvi.size} ID (lớp học + Mekong) trùng khít VI/EN.`);
  }
}

if (errors.length) {
  console.error('❌ Lumina parity check THẤT BẠI:\n');
  for (const e of errors) console.error('  • ' + e);
  console.error(
    '\nHai bản thoại Lumina (VI/EN) phải song song. Sửa một bên thì sửa bên kia trong cùng PR' +
      '\n(chưa thu clip thì sửa text là đủ). Xem docs/loi-thoai-lumina.md & -en.md.'
  );
  process.exit(1);
}

console.log(`✅ Lumina parity OK — ${viIds.size} ID thoại trùng khít giữa VI và EN.`);
