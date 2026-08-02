const fs = require('node:fs');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

const version = JSON.parse(fs.readFileSync('app/version.json', 'utf8'));
const release = fs.readFileSync('app/release.html', 'utf8');
const manager = fs.readFileSync('js/app-shell/update-manager.js', 'utf8');
const worker = fs.readFileSync('app/sw.js', 'utf8');

assert.equal(version.schema_version, 1);
assert.match(version.web_version, /^\d+\.\d+\.\d+$/);
assert.match(version.build_id, /^\d{4}\.\d{2}\.\d{2}\.\d+$/);
assert.equal(typeof version.force_refresh, 'boolean');
assert.ok(Array.isArray(version.changes) && version.changes.length >= 1);
assert.ok(version.title.length > 0 && version.summary.length > 0);

assert.match(release, new RegExp(`data-bizon-build="${version.build_id.replaceAll('.', '\\.') }"`));
assert.match(release, /id="updateCard"[^>]*hidden/);
assert.match(release, /id="updateNow"/);
assert.match(release, /id="updateLater"/);
assert.match(release, /js\/app-shell\/update-manager\.js/);
assert.match(release, /aria-live="polite"/);

assert.match(manager, /cache:\s*'no-store'/);
assert.match(manager, /Cache-Control':\s*'no-cache'/);
assert.match(manager, /isNewerBuild/);
assert.match(manager, /updateButton\?\.addEventListener\('click',\s*applyUpdate\)/);
assert.match(manager, /laterButton\?\.addEventListener\('click',\s*dismissUpdate\)/);
assert.match(manager, /startsWith\('bizon-app-shell-'\)/);
assert.match(manager, /registration\.update\(\)/);
assert.match(manager, /SKIP_WAITING/);
assert.doesNotMatch(manager, /setTimeout\([^)]*location\.reload/);

assert.match(worker, /bizon-app-shell-v5/);
assert.match(worker, /\.\/version\.json/);
assert.match(worker, /command-center\.html/);
assert.match(worker, /bizon-unified\.css/);
assert.match(worker, /bizon-existing-assets\.css/);
assert.match(worker, /unified-app\.js/);
assert.match(worker, /existing-assets\.js/);
assert.match(worker, /approved-existing-assets\.json/);
assert.match(worker, /update-manager\.js/);
assert.match(worker, /endsWith\('\/app\/version\.json'\)/);
assert.match(worker, /cache:\s*'no-store'/);
assert.match(worker, /networkFirst\(event\.request,\s*'\.\/offline\.html'\)/);
assert.match(worker, /staleWhileRevalidate\(event\.request\)/);
assert.match(worker, /CLEAR_APP_CACHE/);

execFileSync(process.execPath, ['--check', 'js/app-shell/update-manager.js'], { stdio: 'inherit' });
execFileSync(process.execPath, ['--check', 'js/app-shell/unified-app.js'], { stdio: 'inherit' });
execFileSync(process.execPath, ['--check', 'js/app-shell/existing-assets.js'], { stdio: 'inherit' });
execFileSync(process.execPath, ['--check', 'app/sw.js'], { stdio: 'inherit' });

console.log('BizOn web update channel contract passed');