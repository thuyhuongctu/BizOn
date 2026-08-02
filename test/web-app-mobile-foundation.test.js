const fs = require('fs');
const assert = require('assert');

const commandCenter = fs.readFileSync('app/index.html', 'utf8');
const release = fs.readFileSync('app/release.html', 'utf8');
const passport = fs.readFileSync('app/brand-passport.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync('app/manifest.webmanifest', 'utf8'));
const sw = fs.readFileSync('app/sw.js', 'utf8');
const assetlinks = JSON.parse(fs.readFileSync('.well-known/assetlinks.template.json', 'utf8'));

assert(commandCenter.includes('AI Command Center'));
assert(commandCenter.includes('./manifest.webmanifest'));
assert(commandCenter.includes('../js/app-shell/app-shell.js'));
assert(commandCenter.includes('href="./aibis.html"'));
assert(!commandCenter.includes('href="../global.html"'));
assert(!commandCenter.includes('$1.42M'));
assert(!commandCenter.includes('$248K'));

assert(release.includes('Brand Passport Learning'));
assert(release.includes('href="./brand-passport.html"'));
assert(release.includes('href="./aibis.html"'));
assert(release.includes('Local-only'));
assert(passport.includes('../brand-passport-learning.html'));

assert.strictEqual(manifest.id, './release.html');
assert.strictEqual(manifest.start_url, './release.html');
assert.strictEqual(manifest.scope, './');
assert.strictEqual(manifest.display, 'standalone');
assert.strictEqual(manifest.shortcuts.find(item => item.short_name === 'Passport').url, './brand-passport.html');
assert.strictEqual(manifest.shortcuts.find(item => item.short_name === 'AIBIS').url, './aibis.html');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2);

assert(sw.includes("const CACHE_NAME = 'bizon-app-shell-v2'"));
assert(sw.includes("'./release.html'"));
assert(sw.includes("'./brand-passport.html'"));
assert(sw.includes("'./offline.html'"));
assert(!sw.includes('.mp3'));
assert.strictEqual(assetlinks[0].target.package_name, 'vn.bizon.simulation');
assert(assetlinks[0].target.sha256_cert_fingerprints[0].includes('REPLACE_'));

console.log('web-app release contracts passed');
