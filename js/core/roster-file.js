/* BizOn — Đọc danh sách sinh viên từ tệp Excel (.xlsx) hoặc CSV/TSV ngay trong trình duyệt (không gửi lên máy chủ).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 * read(file) → Promise<{ text, count, sheet }>; text theo định dạng danh sách lớp của trang Giảng viên:
 * mỗi dòng «STT<Tab>Họ và tên<Tab>MSSV<Tab>Email<Tab>Nhóm». Dùng chung Node (test) và trình duyệt. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.BizOnRosterFile = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const dec = new TextDecoder('utf-8');
  const u16 = (b, o) => b[o] | (b[o + 1] << 8);
  const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

  // ---- ZIP: đọc mục lục trung tâm, giải nén «deflate» bằng DecompressionStream có sẵn trong trình duyệt ----
  function unzipIndex(buf) {
    let e = -1;
    for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (u32(buf, i) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('not-zip');
    const n = u16(buf, e + 10), files = {};
    let p = u32(buf, e + 16);
    for (let k = 0; k < n && u32(buf, p) === 0x02014b50; k++) {
      const method = u16(buf, p + 10), csize = u32(buf, p + 20), nl = u16(buf, p + 28), xl = u16(buf, p + 30), cl = u16(buf, p + 32), off = u32(buf, p + 42);
      files[dec.decode(buf.subarray(p + 46, p + 46 + nl))] = { method, csize, off };
      p += 46 + nl + xl + cl;
    }
    return files;
  }
  async function inflateRaw(data) {
    const ds = new DecompressionStream('deflate-raw');
    const out = new Response(new Blob([data]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  }
  async function unzipText(buf, files, name) {
    const f = files[name]; if (!f) return '';
    const o = f.off, start = o + 30 + u16(buf, o + 26) + u16(buf, o + 28), raw = buf.subarray(start, start + f.csize);
    if (f.method === 0) return dec.decode(raw);
    if (f.method === 8) return dec.decode(await inflateRaw(raw));
    throw new Error('zip-method');
  }

  // ---- XML tối giản (đủ cho workbook, sharedStrings, sheet của Excel) ----
  const ent = s => s.replace(/&(lt|gt|quot|apos|amp|#x[0-9a-f]+|#\d+);/gi, (m, g) => {
    const k = g.toLowerCase();
    if (k === 'lt') return '<'; if (k === 'gt') return '>'; if (k === 'quot') return '"'; if (k === 'apos') return "'"; if (k === 'amp') return '&';
    return String.fromCodePoint(k[1] === 'x' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10));
  });
  const attr = (tag, name) => { const m = new RegExp('\\s' + name + '="([^"]*)"').exec(tag); return m ? ent(m[1]) : ''; };
  const texts = xml => { let s = ''; xml.replace(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g, (m, t) => { s += ent(t); return m; }); return s; };
  const colIndex = ref => { const m = /^([A-Z]+)/.exec(ref || ''); if (!m) return -1; let n = 0; for (const ch of m[1]) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };

  function sheetRows(xml, shared) {
    const rows = [];
    xml.replace(/<row\b[^>]*>([\s\S]*?)<\/row>/g, (m, body) => {
      const row = []; let next = 0;
      body.replace(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, (mc, a, inner) => {
        const tag = '<c' + a + '>', ci = colIndex(attr(tag, 'r')), t = attr(tag, 't'), idx = ci >= 0 ? ci : next;
        let v = '';
        if (inner) {
          if (t === 'inlineStr') v = texts(inner);
          else { const vm = /<v>([\s\S]*?)<\/v>/.exec(inner); v = vm ? ent(vm[1]) : ''; if (t === 's') v = shared[+v] || ''; }
        }
        row[idx] = v; next = idx + 1; return mc;
      });
      rows.push(Array.from(row, c => (c == null ? '' : String(c))));
      return m;
    });
    return rows;
  }

  async function xlsxSheets(buf) {
    const files = unzipIndex(buf);
    const wb = await unzipText(buf, files, 'xl/workbook.xml'), rels = await unzipText(buf, files, 'xl/_rels/workbook.xml.rels');
    const ss = await unzipText(buf, files, 'xl/sharedStrings.xml'), shared = [];
    ss.replace(/<si\b[^>]*>([\s\S]*?)<\/si>/g, (m, si) => { shared.push(texts(si)); return m; });
    const target = {};
    rels.replace(/<Relationship\b[^>]*>/g, tag => { target[attr(tag, 'Id')] = attr(tag, 'Target'); return tag; });
    const out = [];
    for (const tag of wb.match(/<sheet\b[^>]*>/g) || []) {
      let t = target[attr(tag, 'r:id')] || ''; if (!t) continue;
      t = t.replace(/^\//, ''); if (!/^xl\//.test(t)) t = 'xl/' + t;
      out.push({ name: attr(tag, 'name'), rows: sheetRows(await unzipText(buf, files, t), shared) });
    }
    return out;
  }

  // ---- CSV/TSV ----
  function csvRows(text) {
    const s = String(text).replace(/^﻿/, ''), first = s.split(/\r?\n/)[0] || '';
    const sep = first.indexOf('\t') >= 0 ? '\t' : (first.split(';').length > first.split(',').length ? ';' : ',');
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (q) { if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && s[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // ---- Nhận cột theo dòng tiêu đề (Việt / Anh / Indonesia) ----
  const RX = {
    name: /^(full\s*name|họ\s*(và\s*)?tên|ho\s*(va\s*)?ten|tên\s*sinh\s*viên|student\s*name|name|nama(\s*lengkap)?)$/i,
    id: /^(student\s*(no\.?|id|number|code)|mssv|mã\s*(số\s*)?sinh\s*viên|mã\s*số|nim|npm|id)$/i,
    email: /^(e-?mail(\s*address)?|địa\s*chỉ\s*email)$/i,
    team: /^(team|nhóm|nhom|group|kelompok|đội|doi|breakout\s*room)$/i
  };
  const clean = v => String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
  function findHeader(rows) {
    for (let r = 0; r < Math.min(rows.length, 20); r++) {
      const h = {}; (rows[r] || []).forEach((c, i) => { const v = clean(c); for (const k in RX) if (h[k] == null && RX[k].test(v)) h[k] = i; });
      if (h.name != null) return { row: r, col: h };
    }
    return null;
  }
  function rowsToRoster(rows) {
    const head = findHeader(rows), lines = [];
    if (head) {
      const c = head.col;
      for (let r = head.row + 1; r < rows.length; r++) {
        const x = rows[r] || [], name = clean(x[c.name]); if (!name) continue;
        const pick = k => (c[k] == null ? '' : clean(x[c[k]]));
        lines.push([lines.length + 1, name, pick('id'), pick('email'), pick('team')].join('\t'));
      }
    } else {
      rows.forEach(x => { const cells = (x || []).map(clean); if (cells.some(Boolean)) lines.push(cells.join('\t')); });
    }
    return { text: lines.join('\n'), count: lines.length, header: !!head };
  }
  // Ưu tiên trang tên có «BizOn», rồi trang đầu tiên có cột họ tên + MSSV, rồi trang đầu có cột họ tên.
  function pickSheet(sheets) {
    const ok = s => findHeader(s.rows);
    return sheets.find(s => /bizon/i.test(s.name) && ok(s))
      || sheets.find(s => { const h = ok(s); return h && h.col.id != null; })
      || sheets.find(ok) || sheets[0] || null;
  }

  async function read(file) {
    const name = String(file && file.name || '');
    const buf = new Uint8Array(await file.arrayBuffer());
    const isZip = buf[0] === 0x50 && buf[1] === 0x4b;
    if (isZip) {
      const sh = pickSheet(await xlsxSheets(buf)); if (!sh) throw new Error('empty');
      return Object.assign({ sheet: sh.name }, rowsToRoster(sh.rows));
    }
    if (/\.xls$/i.test(name)) throw new Error('xls-old');
    return Object.assign({ sheet: '' }, rowsToRoster(csvRows(dec.decode(buf))));
  }

  return { read, rowsToRoster, csvRows, pickSheet, xlsxSheets };
});
