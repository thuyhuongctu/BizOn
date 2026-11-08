'use strict';
// Văn phòng AI (08/11/2026): bảy agent Claude Code trong .claude/agents/, luật chung ở docs/van-phong-ai.md.
// Kiểm: đủ bảy tệp, tên khớp tên tệp, có mô tả, mọi agent dẫn về luật chung; ba agent chỉ soạn nháp không có
// quyền sửa tệp hay chạy lệnh; bộ opc-vn-business-law giữ giấy phép và miễn trừ; không lọt thông tin riêng vào
// kho công khai.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const AGENTS = ['chanh-van-phong', 'ky-su-web', 'seo', 'noi-dung', 'kinh-doanh', 'cham-soc-khach-hang', 'phap-ly-ke-toan'];
const files = fs.readdirSync(path.join(ROOT, '.claude/agents')).filter(f => f.endsWith('.md')).map(f => f.slice(0, -3)).sort();
assert.deepEqual(files, [...AGENTS].sort(), 'thư mục .claude/agents phải đúng bảy agent');

const doc = read('docs/van-phong-ai.md');
const fm = s => {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(s);
  assert.ok(m, 'thiếu khối frontmatter');
  return Object.fromEntries(m[1].split('\n').map(l => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
};
for (const a of AGENTS) {
  const s = read(`.claude/agents/${a}.md`), h = fm(s);
  assert.equal(h.name, a, `${a}: name phải trùng tên tệp`);
  assert.ok((h.description || '').length > 60, `${a}: thiếu mô tả để Claude biết khi nào gọi`);
  assert.ok(s.includes('docs/van-phong-ai.md'), `${a}: phải dẫn về luật chung`);
  assert.ok(doc.includes(`${a}.md`), `docs/van-phong-ai.md chưa liệt kê ${a}`);
  // Kho công khai: không ghi nơi làm việc, kế hoạch riêng hay giấy tờ cá nhân vào tệp agent.
  for (const cam of ['VLUTE', 'nghỉ việc', 'CCCD số', 'số tài khoản']) assert.ok(!s.includes(cam), `${a}: có thông tin riêng «${cam}»`);
}
// Ba agent chỉ soạn nháp: không được sửa tệp hay chạy lệnh.
for (const a of ['noi-dung', 'kinh-doanh', 'cham-soc-khach-hang']) {
  const t = fm(read(`.claude/agents/${a}.md`)).tools || '';
  assert.ok(t && !/\b(Edit|Write|Bash|NotebookEdit)\b/.test(t), `${a}: chỉ được đọc và tra cứu, có tools=${t}`);
}
for (const luat of ['Chỉ soạn nháp', 'Không bịa số', 'Dữ liệu riêng không vào kho công khai', '«Gộp»']) assert.ok(doc.includes(luat), 'luật chung thiếu: ' + luat);

const opc = '.claude/skills/opc-vn-business-law';
for (const f of ['SKILL.md', 'LICENSE', 'DISCLAIMER.md', 'references/03-governance-tnhh-mtv.md', 'assets/dieu-le-tnhh-mtv-toi-gian.md', 'scripts/so_sanh_thue.py'])
  assert.ok(fs.existsSync(path.join(ROOT, opc, f)), 'bộ opc-vn-business-law thiếu ' + f);
assert.match(read(`${opc}/LICENSE`), /CC BY 4\.0|Creative Commons Attribution 4\.0/, 'phải giữ giấy phép CC BY 4.0');
assert.ok(read('.claude/agents/phap-ly-ke-toan.md').includes('miễn trừ trách nhiệm'), 'agent pháp lý phải kèm miễn trừ trách nhiệm');
const tpn = read('THIRD-PARTY-NOTICES.md');
assert.ok(tpn.includes('diginno-net/opc-vn-business-law') && tpn.includes('markfulton/ai-employees'), 'chưa ghi nguồn trong THIRD-PARTY-NOTICES');
console.log('van-phong-ai: ok (' + AGENTS.length + ' agent)');
