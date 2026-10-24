#!/usr/bin/env node
/* BizOn – đếm phiếu khảo sát trước/sau (bảng survey_responses) theo Mã lớp, CHỈ ĐỌC.
 * Chạy bằng workflow .github/workflows/supabase-survey-count.yml. Chỉ in Mã lớp, số phiếu,
 * số mã sinh viên và ngày – không in câu trả lời, mã sinh viên hay ý kiến tự do.
 * Mã lớp là ô gõ tự do nên gom theo dạng chuẩn hoá (bỏ khoảng trắng, viết hoa) và liệt kê
 * các cách gõ khác nhau để giảng viên nhận ra phiếu «lạc» sang mã gần giống. */
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { cleanToken, tokenProblem, PRODUCTION_PROJECT_REF } from './configure-supabase-smtp.mjs';

const esc = s => String(s).replace(/'/g, "''");

export function countSql(filter) {
  const f = String(filter || '').trim();
  const where = f ? `where upper(regexp_replace(class_code, '\\s', '', 'g')) like '%${esc(f.toUpperCase().replace(/\s/g, ''))}%'` : '';
  return `select upper(regexp_replace(class_code, '\\s', '', 'g')) as ma_lop,
  string_agg(distinct class_code, ' | ') as cach_go,
  coalesce(string_agg(distinct instrument, ', '), '') as bo_cau_hoi,
  count(*) filter (where phase = 'pre') as truoc,
  count(*) filter (where phase = 'post') as sau,
  count(distinct upper(student_code)) filter (where phase = 'pre') as ma_sv_truoc,
  count(distinct upper(student_code)) filter (where phase = 'post') as ma_sv_sau,
  count(distinct upper(student_code)) filter (where phase = 'pre' and upper(student_code) in (
    select upper(s2.student_code) from survey_responses s2
    where s2.phase = 'post' and upper(regexp_replace(s2.class_code, '\\s', '', 'g')) = upper(regexp_replace(survey_responses.class_code, '\\s', '', 'g')))) as cap_truoc_sau,
  to_char(min(created_at) at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') as tu_ngay,
  to_char(max(created_at) at time zone 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') as den_ngay
from survey_responses ${where}
group by 1 order by max(created_at) desc;`;
}

export function table(rows) {
  const head = '| Mã lớp | Cách gõ | Bộ câu hỏi | Phiếu trước | Phiếu sau | Mã SV (trước / sau) | Cặp trước–sau | Từ ngày | Đến ngày |\n|---|---|---|---:|---:|---:|---:|---|---|';
  const cell = v => String(v == null ? '' : v).replace(/\|/g, '/').replace(/\n/g, ' ');
  const body = rows.map(r => `| ${cell(r.ma_lop)} | ${cell(r.cach_go)} | ${cell(r.bo_cau_hoi)} | ${r.truoc} | ${r.sau} | ${r.ma_sv_truoc} / ${r.ma_sv_sau} | ${r.cap_truoc_sau} | ${r.tu_ngay} | ${r.den_ngay} |`);
  const tot = rows.reduce((a, r) => [a[0] + Number(r.truoc), a[1] + Number(r.sau)], [0, 0]);
  return `${head}\n${body.join('\n')}\n\n**Tổng:** ${rows.length} mã lớp · ${tot[0]} phiếu trước · ${tot[1]} phiếu sau.`;
}

async function query(token, ref, sql) {
  // Ưu tiên quyền chỉ đọc (supabase_read_only_user); không có endpoint đó thì dùng read_only: true.
  for (const [path, body] of [['database/query/read-only', { query: sql }], ['database/query', { query: sql, read_only: true }]]) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/${path}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const text = await res.text();
    if (res.ok) return text ? JSON.parse(text) : [];
    if (path === 'database/query') throw new Error(`POST ${path} → HTTP ${res.status}: ${text.slice(0, 400)}`);
    console.log(`(${path} → HTTP ${res.status}, thử lại với read_only)`);
  }
}

export async function main(env = process.env) {
  const token = cleanToken(env.SUPABASE_ACCESS_TOKEN);
  const problem = tokenProblem(token);
  if (problem) throw new Error(problem);
  const ref = env.SUPABASE_PROJECT_REF || PRODUCTION_PROJECT_REF;
  const rows = await query(token, ref, countSql(env.CLASS_FILTER));
  const md = rows.length ? table(rows) : 'Chưa có phiếu khảo sát nào' + (env.CLASS_FILTER ? ` có Mã lớp chứa «${env.CLASS_FILTER}»` : '') + '.';
  console.log(md);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, '## Phiếu khảo sát trước/sau theo Mã lớp\n\n' + md + '\n');
  return rows;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error('Lỗi:', e.message); process.exit(1); });
}
