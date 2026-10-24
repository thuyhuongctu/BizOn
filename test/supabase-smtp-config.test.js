// Kiểm tra script cấu hình SMTP cho Supabase Auth: dữ liệu gửi đi đúng trường của Management API,
// giữ Redirect URLs cũ, không in mật khẩu ra log, và workflow chỉ chạy tay trên main.
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const m = await import('../scripts/release/configure-supabase-smtp.mjs');

  const g = m.buildAuthPatch({ provider: 'gmail', user: 'bizon.noreply@gmail.com', password: 'abcdabcdabcdabcd' },
    { uri_allow_list: 'https://bizonland.com/game.html,http://localhost:8899/**' });
  assert.equal(g.smtp_host, 'smtp.gmail.com');
  assert.equal(g.smtp_port, '465'); // Management API khai smtp_port là chuỗi
  assert.equal(g.smtp_user, 'bizon.noreply@gmail.com');
  assert.equal(g.smtp_admin_email, 'bizon.noreply@gmail.com');
  assert.equal(g.smtp_sender_name, 'BizOn');
  assert.equal(g.rate_limit_email_sent, 100);
  assert.equal(g.mailer_autoconfirm, false);
  assert.equal(g.site_url, 'https://bizonland.com');
  assert.equal(g.uri_allow_list, 'https://bizonland.com/game.html,http://localhost:8899/**,https://bizonland.com/**');

  const r = m.buildAuthPatch({ provider: 'resend', password: 're_x', rateLimit: '60' });
  assert.equal(r.smtp_host, 'smtp.resend.com');
  assert.equal(r.smtp_user, 'resend');
  assert.equal(r.smtp_admin_email, 'no-reply@bizonland.com');
  assert.equal(r.rate_limit_email_sent, 60);
  assert.equal(m.mergeAllowList('https://bizonland.com/**', ['https://bizonland.com/**']), 'https://bizonland.com/**');

  assert.throws(() => m.buildAuthPatch({ provider: 'gmail', user: 'a@gmail.com' }), /mật khẩu SMTP/);
  assert.throws(() => m.buildAuthPatch({ provider: 'gmail', password: 'x' }), /Thiếu host\/port\/user\/sender/);
  assert.throws(() => m.buildAuthPatch({ provider: 'gmail', user: 'khong-phai-email', password: 'x' }), /không hợp lệ/);
  assert.throws(() => m.buildAuthPatch({ provider: 'gmail', user: 'a@gmail.com', password: 'x', rateLimit: '0' }), /Giới hạn/);

  const s = m.summary({ ...g, smtp_pass: 'abcdabcdabcdabcd' });
  assert.ok(!JSON.stringify(s).includes('abcdabcdabcdabcd'), 'summary không được chứa mật khẩu');
  assert.equal(m.PRODUCTION_PROJECT_REF, 'ceytblfelodpnudomccn');

  // Chạy main() với Management API giả: PATCH đúng dự án, đọc lại xác nhận, log không lộ mật khẩu.
  let cfg = { uri_allow_list: 'https://bizonland.com/game.html', smtp_host: null }, calls = [], logs = [];
  const realFetch = globalThis.fetch, realLog = console.log;
  globalThis.fetch = async (url, init) => {
    calls.push([init.method, url, init.headers.Authorization]);
    if (init.method === 'PATCH') cfg = { ...cfg, ...JSON.parse(init.body), smtp_pass: undefined };
    return new Response(JSON.stringify(cfg), { status: 200 });
  };
  console.log = (...a) => logs.push(a.join(' '));
  try {
    await m.main({ SUPABASE_ACCESS_TOKEN: 'sbp_test', SMTP_PASSWORD: 'matkhau-bimat-123', SMTP_PROVIDER: 'gmail', SMTP_USER: 'bizon.noreply@gmail.com', DRY_RUN: 'false' });
    assert.deepEqual(calls.map(c => c[0]), ['GET', 'PATCH', 'GET']);
    assert.ok(calls.every(c => c[1] === 'https://api.supabase.com/v1/projects/ceytblfelodpnudomccn/config/auth' && c[2] === 'Bearer sbp_test'));
    assert.ok(!logs.join('\n').includes('matkhau-bimat-123') && !logs.join('\n').includes('sbp_test'), 'log không lộ bí mật');
    calls = [];
    await m.main({ SUPABASE_ACCESS_TOKEN: 'sbp_test', DRY_RUN: 'true' });
    assert.deepEqual(calls.map(c => c[0]), ['GET'], 'DRY_RUN chỉ đọc');
  } finally { globalThis.fetch = realFetch; console.log = realLog; }

  const src = fs.readFileSync('scripts/release/configure-supabase-smtp.mjs', 'utf8');
  assert.ok(!/console\.\w+\([^)]*(smtp_pass|SMTP_PASSWORD|token\b)/.test(src), 'không in mật khẩu/token');

  const wf = fs.readFileSync('.github/workflows/supabase-smtp.yml', 'utf8');
  assert.match(wf, /^on:\n  workflow_dispatch:/m);
  assert.doesNotMatch(wf, /^\s+(push|pull_request|schedule):/m);
  assert.match(wf, /if: github\.ref == 'refs\/heads\/main'/);
  assert.match(wf, /secrets\.SUPABASE_ACCESS_TOKEN/);
  assert.match(wf, /secrets\.BIZON_SMTP_PASSWORD/);
  console.log('supabase-smtp-config: OK');
})().catch(e => { console.error(e); process.exit(1); });
