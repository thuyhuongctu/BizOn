// Sinh phần «Báo chí» từ một nguồn duy nhất data/bao-chi.json vào:
//   bao-chi.html   – kho lưu trữ đầy đủ (số liệu tổng, danh sách theo tháng, dòng ghi bản quyền)
//   doi-ngu.html   – mục «Trên báo chí» ở hồ sơ PGS.TS. Phan Anh Tú (4 bài mới nhất)
//   bang-chung.html – mục «Truyền thông & báo chí» (3 bài mới nhất có câu trích)
// Mỗi vùng sinh nằm giữa <!-- BAO-CHI:tên:start --> và <!-- BAO-CHI:tên:end -->; đừng sửa tay.
// Thêm bài mới: chèn lên đầu "articles" trong data/bao-chi.json rồi chạy
//   node scripts/build-press.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const vi = d => d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4);
const en = d => MONTHS_EN[+d.slice(5, 7) - 1].slice(0, 3) + ' ' + (+d.slice(8, 10)) + ', ' + d.slice(0, 4);
// phần tử song ngữ: chữ Việt hiển thị sẵn, data-en cho bizon-clay-i18n.js
const bi = (tag, extra, o) => `<${tag}${extra} data-en="${attr(o.en)}">${esc(o.vi)}</${tag}>`;
const titled = t => ({ vi: '«' + t.vi + '»', en: '«' + t.en + '»' });
const quoted = q => ({ vi: '"' + q.vi + '"', en: '"' + q.en + '"' });

function sorted(data) {
  const ids = new Set();
  for (const a of data.articles) {
    for (const k of ['id', 'date', 'outlet', 'kind', 'url']) if (!a[k]) throw new Error(`bài thiếu trường ${k}: ${a.id || a.url}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date)) throw new Error('ngày sai định dạng YYYY-MM-DD: ' + a.id);
    if (ids.has(a.id)) throw new Error('trùng id: ' + a.id); ids.add(a.id);
    if (!data.outlets[a.outlet]) throw new Error('chưa khai tòa soạn ' + a.outlet);
    if (!data.kinds[a.kind]) throw new Error('chưa khai loại bài ' + a.kind);
    for (const t of a.topics || []) if (!data.topics[t]) throw new Error('chưa khai chủ đề ' + t);
    for (const k of ['title', 'summary']) if (!a[k]?.vi || !a[k]?.en) throw new Error(`bài ${a.id} thiếu ${k} song ngữ`);
  }
  return [...data.articles].sort((x, y) => y.date.localeCompare(x.date));
}

function readLink(a, data, style) {
  const host = data.outlets[a.outlet].host;
  return `<a${style} href="${attr(a.url)}" target="_blank" rel="noopener" data-en="Read on ${attr(host)} →">Đọc bài trên ${esc(host)} →</a>`;
}

// ── Kho lưu trữ (bao-chi.html) ────────────────────────────────────────────────
export function renderStats(data) {
  const list = sorted(data);
  const outlets = new Set(list.map(a => a.outlet)).size;
  const quotes = list.filter(a => a.quote).length;
  const cell = (n, o) => `<div class="bz-stat"><b>${n}</b>${bi('span', '', o)}</div>`;
  return [
    cell(list.length, { vi: 'bài báo', en: 'articles' }),
    cell(outlets, { vi: 'tòa soạn', en: 'publications' }),
    cell(quotes, { vi: 'câu trích', en: 'quotes' }),
    `<div class="bz-stat"><b>${vi(list[0].date).slice(3)}</b>${bi('span', '', { vi: 'bài mới nhất', en: 'latest article' })}</div>`,
  ].join('\n');
}

export function renderFilters(data) {
  const list = sorted(data);
  const btn = (key, o, n) => `<button type="button" data-topic="${key}" aria-pressed="${key === 'all'}"><span data-en="${attr(o.en)}">${esc(o.vi)}</span> <small>${n}</small></button>`;
  return [btn('all', { vi: 'Tất cả', en: 'All' }, list.length)]
    .concat(Object.entries(data.topics).map(([k, o]) => [k, o, list.filter(a => (a.topics || []).includes(k)).length])
      .filter(([, , n]) => n).map(([k, o, n]) => btn(k, o, n)))
    .join('\n');
}

export function renderArchive(data) {
  const out = []; let month = '';
  for (const a of sorted(data)) {
    const m = a.date.slice(0, 7);
    if (m !== month) {
      if (month) out.push('</div>', '</section>');
      month = m;
      out.push(`<section class="bz-month" data-month="${m}">`,
        bi('h2', '', { vi: 'Tháng ' + (+m.slice(5)) + '/' + m.slice(0, 4), en: MONTHS_EN[+m.slice(5) - 1] + ' ' + m.slice(0, 4) }),
        '<div class="bz-list">');
    }
    const o = data.outlets[a.outlet], k = data.kinds[a.kind];
    out.push(`<article class="bz-item" id="bai-${attr(a.id)}" data-topics="${attr((a.topics || []).join(' '))}">`,
      `<div class="bz-date"><b>${a.date.slice(8, 10)}</b><span>${a.date.slice(5, 7)}/${a.date.slice(0, 4)}</span></div>`,
      '<div class="bz-body">',
      `<div class="bz-meta">${bi('span', ' class="bz-outlet"', o)}${bi('span', ' class="bz-kind"', k)}</div>`,
      `<h3><a href="${attr(a.url)}" target="_blank" rel="noopener" data-en="${attr(titled(a.title).en)}">${esc(titled(a.title).vi)}</a></h3>`,
      bi('p', '', a.summary));
    if (a.quote) out.push(bi('blockquote', '', quoted(a.quote)));
    out.push('<div class="bz-foot">',
      ...(a.topics || []).map(t => bi('span', ' class="bz-tag"', data.topics[t])),
      readLink(a, data, ' class="bz-read"'),
      '</div>',
      a.reporter ? bi('p', ' class="bz-by"', { vi: 'PV ' + a.reporter, en: 'Reporter: ' + a.reporter }) : '',
      '</div>', '</article>');
  }
  if (month) out.push('</div>', '</section>');
  return out.filter(Boolean).join('\n');
}

export function renderCredits(data, extra = ' class="bz-credit"') {
  const by = new Map();
  for (const a of sorted(data)) {
    if (!a.reporter) continue;
    const s = by.get(a.outlet) || new Set(); s.add(a.reporter); by.set(a.outlet, s);
  }
  const part = lang => [...by].map(([k, s]) => data.outlets[k][lang] + ' – ' + (lang === 'vi' ? 'PV ' : 'reporter ') + [...s].join(', ')).join('; ');
  return bi('p', extra, {
    vi: 'Các bài viết thuộc bản quyền của tòa soạn tương ứng' + (by.size ? ' (' + part('vi') + ')' : '') + '; BizOn chỉ dẫn nguồn và trích lược, không đăng lại toàn văn.',
    en: 'Articles are copyright of their respective publications' + (by.size ? ' (' + part('en') + ')' : '') + '; BizOn only cites and summarises, and does not republish the full text.',
  });
}

// ── Mục ngắn trên trang Đội ngũ / Bằng chứng ──────────────────────────────────
function moreLink(n, style) {
  return `<a${style} href="bao-chi.html" data-en="See all ${n} articles in the press archive →">Xem cả ${n} bài trong kho báo chí →</a>`;
}

export function renderTeam(data, limit = 4) {
  const list = sorted(data), out = ['<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">'];
  for (const a of list.slice(0, limit)) {
    const o = data.outlets[a.outlet];
    out.push('<div class="dn-press">',
      bi('div', ' style="font-size:15px;font-weight:800;line-height:1.35"', titled(a.title)),
      bi('p', ' style="margin:6px 0 0;font-size:13px;line-height:1.55;color:var(--clay-sub)"', { vi: o.vi + ' – ' + vi(a.date) + ': ' + a.summary.vi, en: o.en + ' – ' + en(a.date) + ': ' + a.summary.en }));
    if (a.quote) out.push(bi('p', ' style="margin:8px 0 0;padding-left:12px;border-left:3px solid var(--clay-gold);font-size:13px;font-style:italic;line-height:1.55;color:var(--clay-ink-2)"', quoted(a.quote)));
    out.push(readLink(a, data, ' style="display:inline-flex;margin-top:8px;font-size:13px;font-weight:800;color:var(--clay-accent)"'), '</div>');
  }
  out.push('</div>', moreLink(list.length, ' class="dn-more"'));
  return out.join('\n');
}

// Bằng chứng: chỉ lấy bài có câu trích (đội ngũ lên tiếng với tư cách chuyên gia), không lấy tin sự kiện chung.
export function renderEvidence(data, limit = 3) {
  const list = sorted(data), out = ['<div style="display:flex;flex-direction:column;gap:14px">'];
  for (const a of list.filter(a => a.quote).slice(0, limit)) {
    const o = data.outlets[a.outlet];
    out.push('<article class="bc-press">',
      `<div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--clay-accent)" data-en="${attr(o.en + ' · ' + en(a.date))}">${esc(o.vi + ' · ' + vi(a.date))}</div>`,
      bi('div', ' style="margin-top:6px;font-family:var(--clay-head);font-size:21px;font-weight:800;line-height:1.2"', titled(a.title)),
      bi('p', ' style="margin:8px 0 0;font-size:14px;line-height:1.6;color:var(--clay-sub)"', a.summary),
      `<a href="${attr(a.url)}" target="_blank" rel="noopener" style="display:inline-flex;margin-top:10px;font-size:13px;font-weight:800" data-en="Read the full article on ${attr(o.host)} →">Đọc toàn văn trên ${esc(o.host)} →</a>`,
      '</article>');
  }
  out.push('</div>', moreLink(list.length, ' class="bc-more"'));
  return out.join('\n');
}

export const TARGETS = {
  'bao-chi.html': { stats: renderStats, filters: renderFilters, archive: renderArchive, credits: renderCredits },
  'doi-ngu.html': { team: d => renderTeam(d) },
  'bang-chung.html': { evidence: d => renderEvidence(d), credits: d => renderCredits(d, ' style="margin:14px 0 0;font-size:12px;line-height:1.5;color:#6B7F80"') },
};

// Thay nội dung giữa hai mốc, thụt lề theo dòng mốc mở.
export function fill(html, name, body) {
  const re = new RegExp(`([ \\t]*)<!-- BAO-CHI:${name}:start -->[\\s\\S]*?<!-- BAO-CHI:${name}:end -->`);
  const m = html.match(re);
  if (!m) throw new Error('không tìm thấy mốc BAO-CHI:' + name);
  const pad = m[1];
  return html.replace(re, () => `${pad}<!-- BAO-CHI:${name}:start -->\n${body.split('\n').map(l => pad + l).join('\n')}\n${pad}<!-- BAO-CHI:${name}:end -->`);
}

export function build(root, data) {
  const out = {};
  for (const [file, parts] of Object.entries(TARGETS)) {
    let html = readFileSync(new URL(file, root), 'utf8');
    for (const [name, fn] of Object.entries(parts)) html = fill(html, name, fn(data));
    out[file] = html;
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL('../', import.meta.url);
  const data = JSON.parse(readFileSync(new URL('data/bao-chi.json', root), 'utf8'));
  for (const [file, html] of Object.entries(build(root, data))) writeFileSync(new URL(file, root), html);
  console.log('Đã sinh phần báo chí cho', Object.keys(TARGETS).join(', '), '–', data.articles.length, 'bài');
}
