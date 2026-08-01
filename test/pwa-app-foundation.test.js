const fs = require('fs');
const assert = require('assert');

const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
const sw = fs.readFileSync('sw.js', 'utf8');
const shell = fs.readFileSync('app-shell-preview.html', 'utf8');
const manager = fs.readFileSync('js/pwa/pwa-manager.js', 'utf8');

assert.equal(manifest.short_name, 'BizOn');
assert.equal(manifest.display, 'standalone');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.some((icon) => icon.purpose === 'maskable'));
assert.ok(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3);
assert.ok(manifest.start_url.includes('app-shell-preview.html'));

assert.ok(sw.includes("const VERSION = 'v3.0.0'"));
assert.ok(sw.includes("'./offline.html'"));
assert.ok(!sw.includes('ho-chieu-p3-en-remix2.mp3'), 'heavy audio must not be precached');
assert.ok(sw.includes('MAX_ENTRIES'));
assert.ok(sw.includes("request.headers.has('range')"));

assert.ok(shell.includes('id="workspace"'));
assert.ok(shell.includes('aria-live="polite"'));
assert.ok(shell.includes('bottom-nav'));
assert.ok(shell.includes('js/pwa/pwa-manager.js'));

assert.ok(manager.includes('beforeinstallprompt'));
assert.ok(manager.includes('SKIP_WAITING'));
assert.ok(manager.includes('controllerchange'));

console.log('PWA app foundation contract passed.');
