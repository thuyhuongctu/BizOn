/* Kiểm thử tích hợp Brand Passport Learning Edition.
 *
 * Chạy cùng máy chủ tĩnh:
 *   python3 -m http.server 8899 --directory .
 *   node test/brand-passport-learning.test.js
 */
'use strict';

const BASE = process.env.BIZON_URL || 'http://127.0.0.1:8899';
let chromium;
try {
  chromium = require('playwright').chromium;
} catch (error) {
  console.error('Cần cài playwright: npm install --no-save playwright');
  process.exit(2);
}

const checks = [];
function check(condition, message) {
  checks.push({ ok: Boolean(condition), message });
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto(`${BASE}/brand-passport-learning.html?seed=424242`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForFunction(() => window.BizOnLearning && window.BizOnLearning.ready, null, {
    timeout: 30000,
  });

  const readiness = await page.evaluate(() => ({
    version: window.BizOnLearning.version,
    schema: window.BizOnLearning.schema,
    status: document.getElementById('learning-status').textContent,
    iframeReady: Boolean(document.getElementById('bp-game').contentWindow.bpTest),
  }));
  check(/^bp-learning-v1\./.test(readiness.version), 'Learning Layer công bố version V1');
  check(readiness.schema === 'bizon.learning.trace.v1', 'Audit schema đúng phiên bản');
  check(readiness.iframeReady, 'Deterministic game engine vẫn truy cập được');
  check(/Đã kết nối/.test(readiness.status), 'Giao diện báo đã kết nối');

  await page.fill('#team-id', 'TEAM-04');
  await page.fill('#reflection-text', 'Chúng tôi chọn kênh số để giới hạn vốn ban đầu; rủi ro là hiểu biết thị trường còn thấp.');

  await page.evaluate(() => {
    const game = document.getElementById('bp-game').contentWindow;
    game.bpFirm(0);
    game.bpStart();
    game.bpToDecide();
    game.bpPick('prio', 0);
    game.bpPick('bud', 1);
    game.bpEnter(0, 0);
  });

  const prompt = await page.evaluate(() => window.BizOnLearning.getPrompt());
  check(prompt && /đánh đổi|phương thức thâm nhập/i.test(prompt.coach), 'Coach phản hồi theo quyết định thâm nhập');
  check(prompt && /kênh số|bằng chứng thị trường|Phản biện/i.test(prompt.critic), 'Critic chất vấn theo trạng thái hiện tại');

  await page.evaluate(() => {
    const game = document.getElementById('bp-game').contentWindow;
    game.bpCommit();
    game.bpEv(0);
  });
  await page.waitForFunction(() => window.BizOnLearning.getAudit().records.length === 1);

  const audit = await page.evaluate(() => window.BizOnLearning.getAudit());
  const record = audit.records[0];
  check(audit.team_id === 'TEAM-04', 'Audit lưu mã nhóm');
  check(audit.game_seed === '424242', 'Audit lưu seed của kịch bản');
  check(audit.ai_mode.includes('no LLM scoring'), 'Audit tuyên bố rõ AI không chấm điểm');
  check(record.round === 1, 'Record gắn đúng quý');
  check(record.decision.entry_market === 'Hải Lam', 'Record lưu thị trường đã chọn');
  check(record.decision.entry_mode === 'Nền tảng số', 'Record lưu entry mode');
  check(record.student_reflection.includes('giới hạn vốn'), 'Record lưu reflection của người học');
  check(record.engine_outcome_source === 'deterministic', 'Nguồn kết quả được đánh dấu deterministic');
  check(record.ai_changed_score === false, 'Learning Layer không thay đổi điểm số');
  check(record.outcome_before_engine && record.outcome_after_engine, 'Có snapshot trước và sau engine');
  check(record.outcome_delta && typeof record.outcome_delta.cash === 'number', 'Có delta kết quả có cấu trúc');
  check(Array.isArray(record.learning_outcomes) && record.learning_outcomes.length >= 3, 'Có mapping CLO');
  check(Boolean(record.audit_timestamp), 'Có audit timestamp');

  const traceText = await page.textContent('#trace-list');
  check(/Decision/.test(traceText) && /Consequence/.test(traceText) && /Explanation/.test(traceText),
    'UI hiển thị chuỗi Decision → Consequence → Explanation');

  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    panelHeight: document.getElementById('lumina-panel').getBoundingClientRect().height,
  }));
  check(mobile.scrollWidth <= mobile.width + 1, 'Learning Edition không tràn ngang trên viewport Android');
  check(mobile.panelHeight <= 844, 'Lumina panel nằm trong chiều cao mobile');
  check(errors.length === 0, `Không có lỗi JavaScript/console: ${errors.join(' | ')}`);

  await browser.close();
  checks.forEach(item => console.log(`${item.ok ? '✓' : '✗'} ${item.message}`));
  console.log(`\n${checks.filter(item => item.ok).length}/${checks.length} kiểm tra đạt`);
})().catch(async error => {
  console.error('✗', error.stack || error.message);
  process.exit(1);
});
