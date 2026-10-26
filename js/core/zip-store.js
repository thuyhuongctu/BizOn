/* BizOn — Ghi tệp ZIP không nén (phương thức store) thuần JavaScript, dùng chung Node và trình duyệt (R4).
 * © 2026 PGS.TS. Phan Anh Tú & NCS. Đỗ Thùy Hương. Bảo lưu mọi quyền.
 * zip([{ name, data }]) → Uint8Array; data là string (UTF-8) hoặc Uint8Array. Tên tệp UTF-8 (cờ bit 11). Đủ cho gói CSV/MD nhỏ. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.BizOnZip = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  const enc = s => new TextEncoder().encode(String(s));
  function dosTime(d) { const dt = d || new Date(); return { time: ((dt.getHours() << 11) | (dt.getMinutes() << 5) | (dt.getSeconds() >> 1)) & 0xFFFF, date: (((dt.getFullYear() - 1980) << 9) | ((dt.getMonth() + 1) << 5) | dt.getDate()) & 0xFFFF }; }
  function u16(v) { return [v & 0xFF, (v >>> 8) & 0xFF]; }
  function u32(v) { return [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]; }
  function zip(files, opts) {
    const o = opts || {}; const { time, date } = dosTime(o.date); const locals = [], centrals = []; let offset = 0;
    for (const f of files) {
      const name = enc(f.name), data = f.data instanceof Uint8Array ? f.data : enc(f.data == null ? '' : f.data), crc = crc32(data);
      const head = [...[0x50, 0x4B, 0x03, 0x04], ...u16(20), ...u16(0x0800), ...u16(0), ...u16(time), ...u16(date), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)];
      const local = new Uint8Array(head.length + name.length + data.length); local.set(head, 0); local.set(name, head.length); local.set(data, head.length + name.length);
      const cen = [...[0x50, 0x4B, 0x01, 0x02], ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(time), ...u16(date), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)];
      const central = new Uint8Array(cen.length + name.length); central.set(cen, 0); central.set(name, cen.length);
      locals.push(local); centrals.push(central); offset += local.length;
    }
    const cdSize = centrals.reduce((s, c) => s + c.length, 0);
    const end = new Uint8Array([...[0x50, 0x4B, 0x05, 0x06], ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(offset), ...u16(0)]);
    const out = new Uint8Array(offset + cdSize + end.length); let p = 0;
    for (const l of locals) { out.set(l, p); p += l.length; } for (const c of centrals) { out.set(c, p); p += c.length; } out.set(end, p);
    return out;
  }
  return { zip, crc32 };
});
