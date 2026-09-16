import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const html = read('app/instructor-studio.html');
const client = read('js/app-shell/instructor-studio.js');
const css = read('css/bizon-instructor-studio.css');
const sw = read('app/sw.js');
const manifest = JSON.parse(read('app/manifest.webmanifest'));
const registry = JSON.parse(read('assets/approved-existing-assets.json'));
const unified = read('js/app-shell/unified-app.js');

assert.match(html, /Instructor Studio/);
assert.match(html, /Không chấm phản tư bằng AI/);
assert.match(html, /anh-tu-lecture-hall\.webp/);
assert.match(html, /backend-config\.js/);
assert.match(html, /instructor-studio\.js/);
assert.doesNotMatch(html, /Food Truck|Gánh Hàng|bizon_ft_board/i);
assert.doesNotMatch(client, /bizon_ft_board/i);

assert.doesNotMatch(html, /bi-instructor-key/);
assert.doesNotMatch(client, /bi-instructor-key/);
for (const requiredId of ['bi-email', 'bi-password', 'bi-signup', 'bi-signin', 'bi-class-block', 'bi-demo', 'bi-account-line']) {
  assert.ok(html.includes(`id="${requiredId}"`), `Missing per-instructor auth element: ${requiredId}`);
}

for (const functionName of [
  'bizon_leaderboard_v2',
  'bizon_feed_v2',
  'bizon_bp_board_v2',
  'bizon_bp_learning_traces_v2',
  'bizon_survey_export_v2',
  'bizon_claim_class',
  'bizon_demo_leaderboard',
  'bizon_demo_feed'
]) {
  assert.match(client, new RegExp(functionName));
}

assert.match(client, /rpc\('bizon_leaderboard_v2'/);
assert.match(client, /rpc\('bizon_feed_v2'/);
assert.match(client, /safeRpc\('bizon_bp_board_v2'/);
assert.match(client, /safeRpc\('bizon_bp_learning_traces_v2'/);
assert.match(client, /Không tải được dữ liệu lớp/);
assert.match(client, /Không tải được khảo sát/);
assert.match(client, /refreshWithStatus/);

assert.match(client, /localStorage\.setItem\('bizon-instructor-class'/);
assert.doesNotMatch(client, /localStorage\.setItem\([^\n]*password/i);
assert.doesNotMatch(client, /localStorage\.setItem\([^\n]*accessToken/i);
assert.doesNotMatch(client, /localStorage\.setItem\([^\n]*instructorKey/i);
assert.match(client, /sessionStorage\.setItem\(SESSION_KEY/);
assert.doesNotMatch(client, /localStorage\.setItem\(SESSION_KEY/);
assert.match(client, /clearPasswordInput/);
assert.ok((client.match(/clearPasswordInput\(\)/g) || []).length >= 3, 'Password input must be cleared after sign-up, sign-in, and pagehide (whichever paths call it).');
assert.match(client, /ai_scoring: false/);
assert.match(client, /not automatically graded by AI/);
assert.match(client, /setInterval\(\(\) => refreshWithStatus\(\{ quiet: true \}\), 10000\)/);

assert.match(client, /const csvCell = value =>/);
assert.match(client, /\^\[\\t\\r\\n \]\*\[=\+\\-@\]/);
assert.match(client, /csvCell\(row\.team_name\)/);
assert.match(client, /csvCell\(row\.student_code\)/);
assert.match(client, /csvCell\(row\.open_like\)/);
assert.match(client, /csvCell\(row\.open_improve\)/);

assert.match(css, /\.bi-layout/);
assert.match(css, /@media \(max-width: 820px\)/);
assert.match(css, /prefers-reduced-motion/);

assert.match(sw, /bizon-app-shell-v7/);
for (const requiredPath of [
  './instructor-studio.html',
  '../css/bizon-instructor-studio.css',
  '../js/app-shell/instructor-studio.js',
  '../js/backend-config.js'
]) {
  assert.ok(sw.includes(requiredPath), `Missing app-shell asset: ${requiredPath}`);
}

assert.ok(
  manifest.shortcuts.some(shortcut => shortcut.url === './instructor-studio.html'),
  'Instructor Studio must be available as a PWA shortcut.'
);
assert.ok(
  registry.assets.tu_phan_lecture_hall.allowed_pages.includes('app/instructor-studio.html'),
  'Tú Phan scene must be explicitly approved for Instructor Studio.'
);
assert.match(unified, /\.\/instructor-studio\.html/);

console.log('Instructor Studio contract passed.');
