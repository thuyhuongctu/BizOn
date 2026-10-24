#!/usr/bin/env node
/* BizOn – áp một file supabase/migrations/*.sql lên dự án production qua Management API, thay cho
 * việc chép SQL vào SQL Editor. Chạy bằng workflow .github/workflows/supabase-migrate.yml.
 *   SUPABASE_ACCESS_TOKEN=sbp_… MIGRATION_FILE=20261023000000_require_student_login.sql \
 *   MIGRATION_PATH=supabase/migrations/20261023000000_require_student_login.sql CONFIRM=APPLY \
 *   node scripts/release/apply-supabase-migration.mjs
 * Không có CONFIRM=APPLY thì chỉ kiểm tra trước (đã áp chưa, điều kiện tiên quyết) rồi dừng.
 * Sau khi áp: ghi lịch sử vào supabase_migrations.schema_migrations (nếu có) và chạy kiểm tra sau. */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { cleanToken, tokenProblem, PRODUCTION_PROJECT_REF } from './configure-supabase-smtp.mjs';

export const FILE_RE = /^(\d{14})_([a-z0-9_]+)\.sql$/;

// Kiểm tra trước/sau cho từng migration đã biết; mỗi câu trả về một dòng có cột ok (boolean).
export const CHECKS = {
  require_student_login: {
    post: [
      ["to_regclass('public.student_email_domains') is not null", 'có bảng student_email_domains'],
      ["to_regclass('public.instructor_allowlist') is not null", 'có bảng instructor_allowlist'],
      ["exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'bizon_submit_round')", 'có hàm bizon_submit_round'],
    ],
  },
  revoke_anon_writes: {
    pre: [
      ["to_regclass('public.student_email_domains') is not null", 'migration A (require_student_login) đã được áp'],
    ],
    post: [
      ["not has_table_privilege('anon', 'public.round_submissions', 'INSERT')", 'anon không còn INSERT round_submissions'],
      ["not has_table_privilege('anon', 'public.member_log', 'INSERT')", 'anon không còn INSERT member_log'],
    ],
  },
};

export function parseFile(file) {
  const m = FILE_RE.exec(String(file || ''));
  if (!m) throw new Error(`Tên file migration không hợp lệ: «${file}» (dạng 20261023000000_ten_migration.sql).`);
  return { version: m[1], name: m[2] };
}

export function checkSql(expr) {
  return `select (${expr}) as ok;`;
}

const esc = s => String(s).replace(/'/g, "''");
export function historySql(version, name, sql) {
  return `do $bizon_hist$ begin
  if to_regclass('supabase_migrations.schema_migrations') is not null then
    insert into supabase_migrations.schema_migrations (version, name, statements)
    values ('${esc(version)}', '${esc(name)}', array['${esc(sql)}'])
    on conflict (version) do nothing;
  end if;
end $bizon_hist$;`;
}

async function call(token, ref, method, path, body) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}: ${text.slice(0, 600)}`);
  return text ? JSON.parse(text) : null;
}

export async function main(env = process.env) {
  const token = cleanToken(env.SUPABASE_ACCESS_TOKEN);
  const problem = tokenProblem(token);
  if (problem) throw new Error(problem);
  const ref = env.SUPABASE_PROJECT_REF || PRODUCTION_PROJECT_REF;
  const { version, name } = parseFile(env.MIGRATION_FILE);
  const sql = readFileSync(env.MIGRATION_PATH, 'utf8');
  if (!sql.trim()) throw new Error('File migration rỗng.');
  const query = q => call(token, ref, 'POST', 'database/query', { query: q });
  const runChecks = async (list, label) => {
    const failed = [];
    for (const [expr, desc] of list || []) {
      const rows = await query(checkSql(expr));
      const ok = Array.isArray(rows) && rows[0] && rows[0].ok === true;
      console.log(`${ok ? '✓' : '✗'} ${label}: ${desc}`);
      if (!ok) failed.push(desc);
    }
    return failed;
  };

  console.log(`Migration ${version}_${name} (${sql.length} ký tự) → dự án ${ref}`);
  const history = await query(`select exists (select 1 from information_schema.tables where table_schema = 'supabase_migrations' and table_name = 'schema_migrations') as has_table;`);
  if (history && history[0] && history[0].has_table) {
    const done = await query(`select version from supabase_migrations.schema_migrations where version = '${esc(version)}' or name = '${esc(name)}' limit 1;`);
    if (Array.isArray(done) && done.length) console.log('Ghi chú: lịch sử migration đã có bản ghi này; file được viết để chạy lại an toàn.');
  }

  const checks = CHECKS[name] || {};
  const preFailed = await runChecks(checks.pre, 'trước');
  if (preFailed.length) throw new Error(`Chưa đủ điều kiện để áp – chưa đạt: ${preFailed.join('; ')}.`);

  if (env.CONFIRM !== 'APPLY') {
    console.log('Chưa áp: gõ APPLY vào ô «confirm» để áp thật.');
    return { applied: false };
  }

  await query(sql);
  console.log('Đã chạy SQL migration.');
  await query(historySql(version, name, sql));
  const postFailed = await runChecks(checks.post, 'sau');
  if (postFailed.length) throw new Error(`Đã chạy SQL nhưng kiểm tra sau không đạt: ${postFailed.join('; ')}.`);
  console.log('Xong.');
  return { applied: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error('Lỗi:', e.message); process.exit(1); });
}
