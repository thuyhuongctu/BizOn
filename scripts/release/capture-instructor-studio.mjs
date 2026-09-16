import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BIZON_URL || 'http://127.0.0.1:8899';
const output = process.env.BIZON_QA_OUTPUT || 'artifacts/instructor-studio';
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });

function collectErrors(page) {
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}

async function assertBaseSurface(page, name) {
  await page.waitForFunction(() => {
    const image = document.querySelector('.bi-mentor img');
    return image && image.complete && image.naturalWidth > 0;
  });

  const audit = await page.evaluate(() => {
    const localEntries = Object.entries(localStorage);
    const sessionEntries = Object.entries(sessionStorage);
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyText: document.body.innerText,
      mentorWidth: document.querySelector('.bi-mentor img')?.naturalWidth || 0,
      passwordInLocalStorage: localEntries.some(([key, value]) =>
        /secret|instructor[-_]?key|admin[-_]?key|password/i.test(key) ||
        /BIZON-GV-|service[_-]?role/i.test(String(value))
      ),
      // The instructor's own access/refresh tokens are expected to live in
      // sessionStorage (cleared when the tab closes); they must never spill
      // into localStorage, which persists across sessions.
      accessTokenInLocalStorage: localEntries.some(([, value]) => /fake-access-token|access_token/i.test(String(value))),
      sessionHasAccessToken: sessionEntries.some(([, value]) => /accessToken/.test(String(value)))
    };
  });

  if (audit.overflow > 1) throw new Error(`${name}: horizontal overflow ${audit.overflow}px`);
  if (audit.mentorWidth < 1) throw new Error(`${name}: mentor image did not load`);
  if (/Food Truck|Gánh Hàng/i.test(audit.bodyText)) throw new Error(`${name}: excluded Food Truck surface is visible`);
  if (audit.passwordInLocalStorage) throw new Error(`${name}: an instructor credential was found in localStorage`);
  if (audit.accessTokenInLocalStorage) throw new Error(`${name}: an access token leaked into localStorage`);
}

async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    colorScheme: 'dark',
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  const errors = collectErrors(page);

  await page.goto(`${baseUrl}/app/instructor-studio.html`, { waitUntil: 'networkidle' });
  await assertBaseSurface(page, name);
  await page.screenshot({ path: path.join(output, `${name}-connection.png`), fullPage: true });

  await page.evaluate(() => {
    document.querySelector('#bi-studio-content')?.classList.remove('bi-hidden');
    const label = document.querySelector('#bi-class-label');
    if (label) label.textContent = 'QA-CLASS';
  });
  await page.screenshot({ path: path.join(output, `${name}-empty-state.png`), fullPage: true });

  await page.click('[data-bi-tab="traces"]');
  const tracesVisible = await page.locator('[data-bi-panel="traces"]').evaluate(node => !node.classList.contains('bi-hidden'));
  if (!tracesVisible) throw new Error(`${name}: Decision Trace tab did not open`);
  await page.screenshot({ path: path.join(output, `${name}-decision-trace.png`), fullPage: true });

  if (errors.length) throw new Error(`${name} console errors:\n${errors.join('\n')}`);
  await context.close();
}

const fixtures = {
  bizon_leaderboard_v2: [{
    team_name: '=2+2 EcoFuture Team', best_round: 4, share: 18.6,
    net_profit: 2310000000, revenue: 12450000000, balance: 4280000000,
    submissions: 4, last_submit: '2026-08-02T16:45:00Z'
  }],
  bizon_feed_v2: [{
    created_at: '2026-08-02T16:45:00Z', team_name: '=2+2 EcoFuture Team',
    round_number: 4, net_profit: 2310000000, share: 18.6
  }],
  bizon_bp_board_v2: [{
    player_name: 'Nhóm A', company: 'Mekong Bloom', best_score: 82,
    best_profit: 2.31, best_title: 'Global Brand Builder', quarters: 4,
    plays: 2, last_play: '2026-08-02T16:44:00Z'
  }],
  bizon_bp_learning_traces_v2: [{
    trace_id: '00000000-0000-4000-8000-000000000001',
    team_alias: 'EcoFuture Team', session_id: 'qa-session-01', game_seed: 'qa-seed',
    trace_json: {
      data_governance: { ai_scoring: false },
      records: [
        { decision: { label: 'Market research' }, student_reflection: 'Cần kiểm tra giả định trước khi mở rộng.' },
        { decision: { label: 'Export' }, student_reflection: 'Xuất khẩu phù hợp với nguồn lực hiện tại.' }
      ]
    },
    consented_at: '2026-08-02T16:40:00Z',
    retention_until: '2027-01-29T16:40:00Z',
    updated_at: '2026-08-02T16:46:00Z'
  }],
  bizon_survey_export_v2: [
    { instrument: 'batnghiep', phase: 'pre', student_code: 'SV01', role: 'CEO', rounds_played: 0, score_a: 3.2, nps: 7, open_like: '', open_improve: '', created_at: '2026-08-02T15:00:00Z' },
    { instrument: 'batnghiep', phase: 'post', student_code: 'SV01', role: 'CEO', rounds_played: 6, score_a: 4.1, nps: 9, open_like: '=2+2', open_improve: 'Thêm thời gian', created_at: '2026-08-02T16:50:00Z' },
    { instrument: 'quocte', phase: 'pre', student_code: 'SV02', role: 'CMO', rounds_played: 0, score_a: 3.0, nps: 6, open_like: '', open_improve: '', created_at: '2026-08-02T15:01:00Z' },
    { instrument: 'quocte', phase: 'post', student_code: 'SV02', role: 'CMO', rounds_played: 4, score_a: 4.0, nps: 8, open_like: 'AIBIS', open_improve: '@SUM(A1:A2)', created_at: '2026-08-02T16:51:00Z' }
  ],
  bizon_claim_class: true,
  bizon_demo_leaderboard: [{
    team_name: 'Demo Team', best_round: 2, share: 22.4,
    net_profit: 120000000, revenue: 500000000, balance: 80000000,
    submissions: 2, last_submit: '2026-08-02T16:00:00Z'
  }],
  bizon_demo_feed: [{
    created_at: '2026-08-02T16:00:00Z', team_name: 'Demo Team', round_number: 2, net_profit: 120000000, share: 22.4
  }]
};

async function mockBackend(page, rpcResponder) {
  await page.route('**/js/backend-config.js', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: "window.BIZON_BACKEND={url:'https://qa.supabase.test',anonKey:'qa-anon'};"
  }));
  await page.route('https://qa.supabase.test/auth/v1/signup', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      access_token: 'fake-access-token-qa', refresh_token: 'fake-refresh-qa', expires_in: 3600,
      user: { email: 'qa-instructor@bizon.test' }
    })
  }));
  await page.route('https://qa.supabase.test/rest/v1/rpc/**', rpcResponder);
}

async function signUpAsInstructor(page) {
  await page.fill('#bi-email', 'qa-instructor@bizon.test');
  await page.fill('#bi-password', 'qa-password-12345');
  await page.click('#bi-signup');
  await page.waitForFunction(() => !document.querySelector('#bi-class-block')?.classList.contains('bi-hidden'));
}

async function captureFunctional(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    acceptDownloads: true
  });
  const page = await context.newPage();
  const errors = collectErrors(page);

  await mockBackend(page, route => {
    const functionName = new URL(route.request().url()).pathname.split('/').at(-1);
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixtures[functionName] ?? [])
    });
  });

  await page.goto(`${baseUrl}/app/instructor-studio.html`, { waitUntil: 'networkidle' });
  await assertBaseSurface(page, name);

  await signUpAsInstructor(page);
  if (await page.locator('#bi-password').inputValue() !== '') {
    throw new Error(`${name}: password remained visible after account creation`);
  }

  await page.fill('#bi-class-code', 'QA-CLASS');
  await page.click('#bi-connect');
  await page.waitForFunction(() => {
    const status = document.querySelector('#bi-status');
    return status?.dataset.state === 'success' && status.textContent.includes('lớp QA-CLASS');
  });

  if (!await page.locator('#bi-leaderboard-rows').innerText().then(text => text.includes('EcoFuture Team'))) {
    throw new Error(`${name}: leaderboard fixture did not render`);
  }

  const leaderboardDownloadPromise = page.waitForEvent('download');
  await page.click('#bi-export-leaderboard');
  const leaderboardDownload = await leaderboardDownloadPromise;
  const leaderboardPath = await leaderboardDownload.path();
  const leaderboardCsv = await fs.readFile(leaderboardPath, 'utf8');
  if (!leaderboardCsv.includes("\"'=2+2 EcoFuture Team\"")) {
    throw new Error(`${name}: leaderboard CSV did not neutralize formula-like text`);
  }

  await page.click('[data-bi-tab="passport"]');
  if (!await page.locator('#bi-bp-rows').innerText().then(text => text.includes('Mekong Bloom'))) {
    throw new Error(`${name}: Brand Passport fixture did not render`);
  }

  await page.click('[data-bi-tab="traces"]');
  const traceText = await page.locator('#bi-trace-rows').innerText();
  if (!traceText.includes('qa-session-01') || !traceText.includes('Export')) {
    throw new Error(`${name}: Decision Trace fixture did not render`);
  }
  await page.screenshot({ path: path.join(output, `${name}-functional-trace.png`), fullPage: true });

  await page.click('[data-bi-tab="survey"]');
  await page.click('#bi-load-survey');
  await page.waitForFunction(() => document.querySelector('#bi-status')?.textContent.includes('Đã tải 4 phiếu'));
  const surveyAudit = await page.evaluate(() => ({
    total: document.querySelector('#bi-survey-total')?.textContent,
    pairs: document.querySelector('#bi-survey-pairs')?.textContent,
    startup: document.querySelector('#bi-survey-startup')?.textContent,
    international: document.querySelector('#bi-survey-international')?.textContent,
    localStorageDump: Object.fromEntries(Object.entries(localStorage)),
    passwordValue: document.querySelector('#bi-password')?.value
  }));
  if (surveyAudit.total !== '4' || surveyAudit.pairs !== '2' || surveyAudit.startup !== '2' || surveyAudit.international !== '2') {
    throw new Error(`${name}: survey summary is incorrect: ${JSON.stringify(surveyAudit)}`);
  }
  if (surveyAudit.passwordValue !== '') throw new Error(`${name}: password reappeared in the input`);
  if (JSON.stringify(surveyAudit.localStorageDump).includes('qa-password-12345')) {
    throw new Error(`${name}: password leaked to localStorage`);
  }
  if (surveyAudit.localStorageDump['bizon-instructor-class'] !== 'QA-CLASS') {
    throw new Error(`${name}: class code was not retained as intended`);
  }

  const surveyDownloadPromise = page.waitForEvent('download');
  await page.click('#bi-export-surveys');
  const surveyDownload = await surveyDownloadPromise;
  const surveyPath = await surveyDownload.path();
  const surveyCsv = await fs.readFile(surveyPath, 'utf8');
  if (!surveyCsv.includes("\"'=2+2\"") || !surveyCsv.includes("\"'@SUM(A1:A2)\"")) {
    throw new Error(`${name}: survey CSV did not neutralize formula-like text`);
  }
  await page.screenshot({ path: path.join(output, `${name}-functional-survey.png`), fullPage: true });

  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  const clearedPassword = await page.locator('#bi-password').inputValue();
  if (clearedPassword !== '') throw new Error(`${name}: password was not cleared on pagehide`);

  if (errors.length) throw new Error(`${name} console errors:\n${errors.join('\n')}`);
  await context.close();
}

async function captureDemo(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    colorScheme: 'dark',
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  const errors = collectErrors(page);

  await mockBackend(page, route => {
    const functionName = new URL(route.request().url()).pathname.split('/').at(-1);
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixtures[functionName] ?? [])
    });
  });

  await page.goto(`${baseUrl}/app/instructor-studio.html`, { waitUntil: 'networkidle' });
  await assertBaseSurface(page, name);

  // The demo path must work with zero credentials entered.
  await page.click('#bi-demo');
  await page.waitForFunction(() => {
    const status = document.querySelector('#bi-status');
    return status?.dataset.state === 'success' && status.textContent.includes('DEMO-2026');
  });

  const studioHidden = await page.locator('#bi-studio-content').evaluate(node => node.classList.contains('bi-hidden'));
  if (studioHidden) throw new Error(`${name}: demo studio content stayed hidden`);

  if (!await page.locator('#bi-leaderboard-rows').innerText().then(text => text.includes('Demo Team'))) {
    throw new Error(`${name}: demo leaderboard fixture did not render`);
  }

  const authHidden = await page.locator('#bi-auth-block').evaluate(node => node.classList.contains('bi-hidden'));
  if (authHidden) throw new Error(`${name}: demo mode should not require signing in`);

  await page.screenshot({ path: path.join(output, `${name}-demo.png`), fullPage: true });

  if (errors.length) throw new Error(`${name} console errors:\n${errors.join('\n')}`);
  await context.close();
}

async function captureFailure(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    colorScheme: 'dark',
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  const errors = collectErrors(page);

  await mockBackend(page, route => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'QA backend unavailable' })
  }));

  await page.goto(`${baseUrl}/app/instructor-studio.html`, { waitUntil: 'networkidle' });
  await signUpAsInstructor(page);
  await page.fill('#bi-class-code', 'FAILED-CLASS');
  await page.click('#bi-connect');
  await page.waitForFunction(() => document.querySelector('#bi-status')?.dataset.state === 'error');

  const audit = await page.evaluate(() => ({
    status: document.querySelector('#bi-status')?.textContent || '',
    studioHidden: document.querySelector('#bi-studio-content')?.classList.contains('bi-hidden'),
    savedClass: localStorage.getItem('bizon-instructor-class')
  }));
  if (!audit.status.includes('Không đăng ký được mã lớp')) throw new Error(`${name}: backend error was not explained`);
  if (!audit.studioHidden) throw new Error(`${name}: protected studio content was shown after backend failure`);
  if (audit.savedClass === 'FAILED-CLASS') throw new Error(`${name}: failed class code was persisted`);

  await page.screenshot({ path: path.join(output, `${name}-backend-error.png`), fullPage: true });
  const unexpectedErrors = errors.filter(error => !/status of 503 \(Service Unavailable\)/i.test(error));
  if (unexpectedErrors.length) {
    throw new Error(`${name} unexpected console errors:\n${unexpectedErrors.join('\n')}`);
  }
  await context.close();
}

await capture('instructor-desktop', { width: 1440, height: 1000 });
await capture('instructor-mobile', { width: 390, height: 844 }, 2);
await captureFunctional('instructor-desktop', { width: 1440, height: 1000 });
await captureFunctional('instructor-mobile', { width: 390, height: 844 }, 2);
await captureDemo('instructor-desktop', { width: 1440, height: 1000 });
await captureDemo('instructor-mobile', { width: 390, height: 844 }, 2);
await captureFailure('instructor-desktop', { width: 1440, height: 1000 });
await captureFailure('instructor-mobile', { width: 390, height: 844 }, 2);

await browser.close();
console.log(`Instructor Studio QA captured in ${output}`);
