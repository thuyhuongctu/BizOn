#!/usr/bin/env node
/* BizOn – cấu hình SMTP riêng cho Supabase Auth của dự án production qua Management API,
 * thay cho việc bấm tay trong dashboard (docs/release/SUPABASE_SMTP_SETUP.md).
 * Chạy bằng workflow .github/workflows/supabase-smtp.yml (bấm «Run workflow»), hoặc tại máy:
 *   SUPABASE_ACCESS_TOKEN=sbp_… SMTP_PASSWORD=… SMTP_PROVIDER=gmail SMTP_USER=ban@gmail.com \
 *   node scripts/release/configure-supabase-smtp.mjs
 * Không bao giờ in mật khẩu SMTP hay access token ra log. DRY_RUN=true chỉ đọc cấu hình hiện tại. */
import { pathToFileURL } from 'node:url';

export const PRODUCTION_PROJECT_REF = 'ceytblfelodpnudomccn';
export const SITE_URL = 'https://bizonland.com';
export const REDIRECT_URL = 'https://bizonland.com/**';

export const PRESETS = {
  gmail: { host: 'smtp.gmail.com', port: '465' },
  resend: { host: 'smtp.resend.com', port: '465', user: 'resend', sender: 'no-reply@bizonland.com' },
};

// Ghép danh sách Redirect URLs (chuỗi cách nhau bởi dấu phẩy), giữ các mục cũ, thêm mục còn thiếu.
export function mergeAllowList(current, add) {
  const items = String(current || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const a of add) if (!items.includes(a)) items.push(a);
  return items.join(',');
}

export function buildAuthPatch(opts, current = {}) {
  const preset = PRESETS[opts.provider] || {};
  const host = opts.host || preset.host;
  const port = String(opts.port || preset.port || '');
  const user = opts.user || preset.user;
  const sender = opts.sender || preset.sender || user;
  if (!host || !port || !user || !sender) throw new Error('Thiếu host/port/user/sender cho SMTP (chọn provider gmail|resend hoặc điền đủ).');
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(sender)) throw new Error(`Địa chỉ gửi không hợp lệ: ${sender}`);
  if (!opts.password) throw new Error('Thiếu mật khẩu SMTP (secret BIZON_SMTP_PASSWORD).');
  const rate = Number(opts.rateLimit || 100);
  if (!Number.isInteger(rate) || rate < 1) throw new Error(`Giới hạn email/giờ không hợp lệ: ${opts.rateLimit}`);
  return {
    external_email_enabled: true,
    mailer_autoconfirm: false,
    smtp_admin_email: sender,
    smtp_sender_name: opts.senderName || 'BizOn',
    smtp_host: host,
    smtp_port: port,
    smtp_user: user,
    smtp_pass: opts.password,
    rate_limit_email_sent: rate,
    site_url: SITE_URL,
    uri_allow_list: mergeAllowList(current.uri_allow_list, [REDIRECT_URL]),
  };
}

// Chỉ các trường an toàn để in ra log.
export function summary(cfg) {
  return {
    smtp_host: cfg.smtp_host || null,
    smtp_port: cfg.smtp_port || null,
    smtp_user: cfg.smtp_user || null,
    smtp_admin_email: cfg.smtp_admin_email || null,
    smtp_sender_name: cfg.smtp_sender_name || null,
    rate_limit_email_sent: cfg.rate_limit_email_sent ?? null,
    site_url: cfg.site_url || null,
    uri_allow_list: cfg.uri_allow_list || null,
    mailer_autoconfirm: cfg.mailer_autoconfirm ?? null,
  };
}

// Giá trị secret dán từ trình duyệt hay dính khoảng trắng/xuống dòng hoặc chữ «Bearer»; làm sạch rồi
// kiểm tra dạng token cá nhân Supabase (sbp_…). Chỉ mô tả hình dạng, không bao giờ in giá trị.
export function cleanToken(raw) {
  return String(raw || '').trim().replace(/^Bearer\s+/i, '').trim();
}

export function tokenProblem(token) {
  if (!token) return 'Thiếu SUPABASE_ACCESS_TOKEN (tạo ở https://supabase.com/dashboard/account/tokens).';
  if (/^sbp_[A-Za-z0-9_]+$/.test(token)) return null;
  const hints = [];
  if (/\s/.test(token)) hints.push('có khoảng trắng hoặc xuống dòng');
  if (/^[a-z]{4}(\s?[a-z]{4}){3}$/i.test(token)) hints.push('trông giống mật khẩu ứng dụng Gmail (16 chữ) – có thể đã dán nhầm hai secret');
  else if (/^eyJ/.test(token)) hints.push('trông giống anon/service key của dự án (eyJ…), không phải token cá nhân');
  else if (/^sb_(secret|publishable)_/.test(token)) hints.push('là API key của dự án (sb_…), không phải token cá nhân');
  else if (!/^sbp_/.test(token)) hints.push('không bắt đầu bằng «sbp_»');
  return 'SUPABASE_ACCESS_TOKEN không đúng dạng token cá nhân Supabase (sbp_…): ' + hints.join('; ') +
    '. Tạo token ở https://supabase.com/dashboard/account/tokens rồi dán lại vào secret, chỉ phần sbp_…, không kèm chữ Bearer.';
}

export function cleanPassword(raw, provider) {
  const p = String(raw || '').trim();
  return provider === 'gmail' ? p.replace(/\s+/g, '') : p; // Google hiển thị mật khẩu ứng dụng thành 4 nhóm cách nhau
}

async function api(method, ref, token, body) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} config/auth → HTTP ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

export async function main(env = process.env) {
  const token = cleanToken(env.SUPABASE_ACCESS_TOKEN);
  const ref = env.SUPABASE_PROJECT_REF || PRODUCTION_PROJECT_REF;
  const problem = tokenProblem(token);
  if (problem) throw new Error(problem);
  const before = await api('GET', ref, token);
  console.log('Cấu hình hiện tại:', JSON.stringify(summary(before), null, 2));
  if (/^(1|true|yes)$/i.test(env.DRY_RUN || '')) { console.log('DRY_RUN: không thay đổi gì.'); return; }

  const patch = buildAuthPatch({
    provider: env.SMTP_PROVIDER, host: env.SMTP_HOST, port: env.SMTP_PORT, user: env.SMTP_USER,
    sender: env.SMTP_SENDER_EMAIL, senderName: env.SMTP_SENDER_NAME, password: cleanPassword(env.SMTP_PASSWORD, env.SMTP_PROVIDER),
    rateLimit: env.EMAIL_RATE_LIMIT,
  }, before);
  await api('PATCH', ref, token, patch);

  const after = await api('GET', ref, token);
  const got = summary(after);
  console.log('Cấu hình sau khi cập nhật:', JSON.stringify(got, null, 2));
  const bad = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_admin_email', 'rate_limit_email_sent', 'site_url']
    .filter(k => String(got[k]) !== String(patch[k]));
  if (!String(got.uri_allow_list || '').split(',').includes(REDIRECT_URL)) bad.push('uri_allow_list');
  if (bad.length) throw new Error(`Supabase chưa nhận đúng các trường: ${bad.join(', ')}`);
  console.log('Đã bật SMTP riêng. Thử đăng ký một email sinh viên thật để kiểm tra hộp thư.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error('Lỗi:', e.message); process.exit(1); });
}
