const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('app/index.html', 'utf8');
const manifest = JSON.parse(fs.readFileSync('app/manifest.webmanifest', 'utf8'));
const sw = fs.readFileSync('app/sw.js', 'utf8');
const assetlinks = JSON.parse(fs.readFileSync('.well-known/assetlinks.template.json', 'utf8'));

assert(html.includes('AI Command Center'));
assert(html.includes('./manifest.webmanifest'));
assert(html.includes('../js/app-shell/app-shell.js'));
assert(html.includes('href="./aibis.html"'));
assert(!html.includes('href="../global.html"'));
assert(!html.includes('$1.42M'));
assert(!html.includes('$248K'));
assert.strictEqual(manifest.id, '../');
assert.strictEqual(manifest.start_url, './index.html');
assert.strictEqual(manifest.scope, '../');
assert.strictEqual(manifest.display, 'standalone');
assert.strictEqual(manifest.shortcuts.find(item => item.short_name === 'AIBIS').url, './aibis.html');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
assert(sw.includes("const CACHE_NAME = 'bizon-app-shell-v1'"));
assert(sw.includes("'./offline.html'"));
assert(!sw.includes('.mp3'));
assert.strictEqual(assetlinks[0].target.package_name, 'vn.bizon.simulation');
assert(assetlinks[0].target.sha256_cert_fingerprints[0].includes('REPLACE_'));
console.log('web-app-mobile-foundation contracts passed');
