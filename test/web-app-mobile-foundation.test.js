const fs = require('fs');
const assert = require('assert');

const entry = fs.readFileSync('app/index.html', 'utf8');
const release = fs.readFileSync('app/release.html', 'utf8');
const command = fs.readFileSync('app/command-center.html', 'utf8');
const passport = fs.readFileSync('app/brand-passport.html', 'utf8');
const aibis = fs.readFileSync('app/aibis.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync('app/manifest.webmanifest', 'utf8'));
const sw = fs.readFileSync('app/sw.js', 'utf8');
const version = JSON.parse(fs.readFileSync('app/version.json', 'utf8'));
const assetlinks = JSON.parse(fs.readFileSync('.well-known/assetlinks.template.json', 'utf8'));
const approvedAssets = JSON.parse(fs.readFileSync('assets/approved-existing-assets.json', 'utf8'));

assert(entry.includes("location.replace('./release.html')"));
assert(entry.includes('rel="canonical" href="./release.html"'));
assert(entry.includes('./manifest.webmanifest'));

assert(release.includes('Mô phỏng kinh doanh'));
assert(release.includes('href="./command-center.html"'));
assert(release.includes('href="./brand-passport.html"'));
assert(release.includes('href="./aibis.html"'));
assert(release.includes('Decision Trace'));
assert(release.includes('data-install-app'));
assert(release.includes('Quyền riêng tư'));
assert(release.includes('data-bizon-build'));
assert(release.includes('update-manager.js'));
assert(release.includes('bizon-unified.css'));
assert(command.includes('EcoFuture Team'));
assert(command.includes('$12.45M'));
assert(command.includes('Market Attractiveness'));
assert(command.includes('unified-app.js'));
assert(aibis.includes('bizon-unified-overrides.css'));
assert(aibis.includes('href="./command-center.html"'));
assert(passport.includes('../brand-passport-learning.html'));
assert(passport.includes('href="./release.html"'));
assert(passport.includes('Lưu trên thiết bị'));

for (const forbidden of ['Teaching demo', 'AI Command Center', 'Local-only', 'Android build pipeline', 'placeholder', 'auto-generated']) {
  assert(!release.includes(forbidden), `Public launcher must not contain: ${forbidden}`);
  assert(!command.includes(forbidden), `Command Center must not contain: ${forbidden}`);
  assert(!passport.includes(forbidden), `Brand Passport route must not contain: ${forbidden}`);
}

assert.strictEqual(manifest.id, './release.html');
assert.strictEqual(manifest.start_url, './release.html');
assert.strictEqual(manifest.scope, './');
assert.strictEqual(manifest.display, 'standalone');
assert.strictEqual(manifest.name, 'BizOn — Mô phỏng quyết định kinh doanh');
assert.strictEqual(manifest.short_name, 'BizOn');
assert.strictEqual(manifest.shortcuts.find(item => item.short_name === 'Command').url, './command-center.html');
assert.strictEqual(manifest.shortcuts.find(item => item.short_name === 'Startup').url, '../game.html');
assert.strictEqual(manifest.shortcuts.find(item => item.short_name === 'Passport').url, './brand-passport.html');
assert.strictEqual(manifest.shortcuts.find(item => item.short_name === 'AIBIS').url, './aibis.html');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2);

assert(sw.includes("const CACHE_NAME = 'bizon-app-shell-v5'"));
assert(sw.includes("'./release.html'"));
assert(sw.includes("'./command-center.html'"));
assert(sw.includes("'./brand-passport.html'"));
assert(sw.includes("'./version.json'"));
assert(sw.includes("'./offline.html'"));
assert(sw.includes("'../css/bizon-unified.css'"));
assert(sw.includes("'../css/bizon-existing-assets.css'"));
assert(sw.includes("'../js/app-shell/unified-app.js'"));
assert(sw.includes("'../js/app-shell/existing-assets.js'"));
assert(sw.includes("'../assets/approved-existing-assets.json'"));
assert(sw.includes('networkFirst'));
assert(sw.includes('staleWhileRevalidate'));
assert(!sw.includes('.mp3'));

assert.strictEqual(approvedAssets.policy.source, 'existing-repository-assets-only');
assert.strictEqual(approvedAssets.policy.allow_generated_replacements, false);
assert.strictEqual(approvedAssets.policy.exclude_food_truck, true);
assert(Object.keys(approvedAssets.assets).length >= 6);

assert.match(version.build_id, /^\d{4}\.\d{2}\.\d{2}\.\d+$/);
assert.strictEqual(assetlinks[0].target.package_name, 'vn.bizon.simulation');
assert(assetlinks[0].target.sha256_cert_fingerprints[0].includes('REPLACE_'));

console.log('web-app production surface contracts passed');