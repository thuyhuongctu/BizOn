/* Kiểm thử Pilot Data Governance cho Brand Passport Learning Edition. */
'use strict';

const fs = require('fs');
const path = require('path');
const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const OUT = process.env.BIZON_QA_DIR || 'governance-qa';
let chromium;
try { chromium = require('playwright').chromium; }
catch (error) { console.error('Cần cài playwright.'); process.exit(2); }

const checks = [];
function check(condition, message) {
  checks.push({ ok: Boolean(condition), message });
  if (!condition) throw new Error(message);
}

(async () => {
  const sqlPath = path.join('supabase', 'migrations', '20260802000000_bp_learning_traces.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  check(/enable row level security/i.test(sql), 'Migration bật RLS');
  check(/revoke all on table public\.bp_learning_traces from public, anon, authenticated/i.test(sql), 'Anon không có quyền bảng trực tiếp');
  check(/bizon_submit_learning_trace/i.test(sql), 'Có RPC submit giới hạn');
  check(/bizon_delete_learning_trace/i.test(sql), 'Có RPC xóa bằng biên nhận');
  check(/interval '180 days'/i.test(sql), 'Retention mặc định 180 ngày');
  check(/ai_scoring=false|ai_scoring.*false/is.test(sql), 'Server bắt buộc khai báo AI không chấm điểm');

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  const requests = { submit: 0, delete: 0, submitBody: null, deleteBody: null };
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  page.route('**/rest/v1/rpc/bizon_submit_learning_trace', async route => {
    requests.submit += 1;
    requests.submitBody = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        trace_id: requests.submitBody.p_id,
        retention_until: '2027-01-29T00:00:00.000Z',
        stored_at: '2026-08-02T02:00:00.000Z'
      }])
    });
  });
  page.route('**/rest/v1/rpc/bizon_delete_learning_trace', async route => {
    requests.delete += 1;
    requests.deleteBody = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'true' });
  });

  await page.goto(`${BASE}/brand-passport-learning-pilot.html?seed=424242`, {
    waitUntil: 'domcontentloaded', timeout: 30000
  });
  await page.waitForFunction(() => window.BizOnGovernance && window.BizOnGovernance.ready, null, { timeout: 30000 });

  check(requests.submit === 0 && requests.delete === 0, 'Mở và chơi mặc định không gửi request dữ liệu');
  check((await page.textContent('#storage-mode')).includes('Chỉ lưu'), 'UI công bố local-only mặc định');

  const learningFrame = page.frames().find(frame => /brand-passport-learning\.html/.test(frame.url()));
  const gameFrame = page.frames().find(frame => /brand-passport\.html/.test(frame.url()) && !/learning/.test(frame.url()));
  check(Boolean(learningFrame && gameFrame), 'Pilot kết nối đủ Learning Edition và deterministic game');

  await learningFrame.fill('#team-id', 'TEAM-04');
  await learningFrame.fill('#reflection-text', 'Nhóm chọn kênh số để giới hạn vốn; rủi ro là hiểu biết thị trường còn thấp.');
  await gameFrame.evaluate(() => {
    window.bpFirm(0);
    window.bpStart();
    window.bpToDecide();
    window.bpPick('prio', 0);
    window.bpPick('bud', 1);
    window.bpEnter(0, 0);
    window.bpCommit();
    window.bpEv(0);
  });
  await learningFrame.waitForFunction(() => window.BizOnLearning.getAudit().records.length === 1);

  await page.click('#data-open');
  await page.fill('#pilot-class-code', 'ib2026_a');
  await page.click('#pilot-submit');
  await page.waitForFunction(() => /đồng ý tự nguyện/i.test(document.getElementById('pilot-status').textContent));
  check(requests.submit === 0, 'Không consent thì không gửi request');

  await page.check('#pilot-consent');
  await page.click('#pilot-submit');
  await page.waitForFunction(() => window.BizOnGovernance.getReceipt() !== null);
  check(requests.submit === 1, 'Consent + hành động gửi tạo đúng một request');

  const body = requests.submitBody;
  check(body.p_class_code === 'IB2026_A', 'Mã lớp được chuẩn hóa');
  check(body.p_team_alias === 'TEAM-04', 'Chỉ gửi bí danh nhóm');
  check(body.p_game_seed === '424242', 'Gửi seed để tái lập kịch bản');
  check(body.p_consent_version === 'bp-learning-consent-v1', 'Gửi đúng consent version');
  check(Boolean(body.p_consented_at), 'Có thời điểm consent');
  check(body.p_trace_json.records.length === 1, 'Gửi đúng Decision Trace đã hoàn tất');
  check(body.p_trace_json.data_governance.storage_mode === 'server-opt-in', 'Payload ghi rõ opt-in');
  check(body.p_trace_json.data_governance.ai_scoring === false, 'Payload ghi rõ AI không chấm điểm');
  check(!('player_name' in body) && !('email' in body) && !('phone' in body), 'Không gửi tên, email hoặc điện thoại');
  check(typeof body.p_delete_token === 'string' && body.p_delete_token.length >= 64, 'Client tạo deletion token mạnh');

  const receipt = await page.evaluate(() => window.BizOnGovernance.getReceipt());
  check(receipt.trace_id === body.p_id, 'Biên nhận gắn đúng trace ID');
  check(receipt.delete_token === body.p_delete_token, 'Biên nhận giữ deletion token ở client');
  check(Boolean(receipt.retention_until), 'Biên nhận có thời hạn lưu');

  await page.screenshot({ path: `${OUT}/governance-desktop.png`, fullPage: true });
  await page.click('#pilot-delete');
  await page.waitForFunction(() => window.BizOnGovernance.getReceipt() === null);
  check(requests.delete === 1, 'Xóa bản đã gửi tạo đúng một request');
  check(requests.deleteBody.p_trace_id === body.p_id, 'RPC xóa dùng đúng trace ID');
  check(requests.deleteBody.p_delete_token === body.p_delete_token, 'RPC xóa dùng đúng deletion token');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('#data-open');
  const mobile = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    panelHeight: document.getElementById('data-panel').getBoundingClientRect().height
  }));
  check(mobile.scrollWidth <= mobile.width + 1, 'Pilot governance không tràn ngang trên Android');
  check(mobile.panelHeight <= 844, 'Panel governance nằm trong viewport mobile');
  await page.screenshot({ path: `${OUT}/governance-android.png`, fullPage: true });
  check(errors.length === 0, `Không lỗi JavaScript/console: ${errors.join(' | ')}`);

  await browser.close();
  checks.forEach(item => console.log(`${item.ok ? '✓' : '✗'} ${item.message}`));
  console.log(`\n${checks.filter(item => item.ok).length}/${checks.length} kiểm tra đạt`);
})().catch(error => {
  console.error('✗', error.stack || error.message);
  process.exit(1);
});
