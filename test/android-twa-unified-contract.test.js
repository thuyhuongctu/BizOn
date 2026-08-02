const fs = require('node:fs');
const assert = require('node:assert/strict');

const settings = fs.readFileSync('android/settings.gradle', 'utf8');
const rootBuild = fs.readFileSync('android/build.gradle', 'utf8');
const appBuild = fs.readFileSync('android/app/build.gradle', 'utf8');
const androidManifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const strings = fs.readFileSync('android/app/src/main/res/values/strings.xml', 'utf8');
const webManifest = JSON.parse(fs.readFileSync('app/manifest.webmanifest', 'utf8'));
const release = fs.readFileSync('app/release.html', 'utf8');
const command = fs.readFileSync('app/command-center.html', 'utf8');
const unifiedApp = fs.readFileSync('js/app-shell/unified-app.js', 'utf8');

assert.match(settings, /include ':app'/);
assert.match(rootBuild, /com\.android\.application' version '8\.10\.1'/);
assert.match(appBuild, /applicationId 'vn\.bizon\.simulation'/);
assert.match(appBuild, /compileSdk 36/);
assert.match(appBuild, /targetSdk 36/);
assert.match(appBuild, /minSdk 23/);
assert.match(appBuild, /androidbrowserhelper:2\.2\.0/);

assert.match(androidManifest, /com\.google\.androidbrowserhelper\.trusted\.LauncherActivity/);
assert.match(androidManifest, /android:exported="true"/);
assert.match(androidManifest, /android\.support\.customtabs\.trusted\.DEFAULT_URL/);
assert.match(androidManifest, /android:host="thuyhuongctu\.github\.io"/);
assert.match(androidManifest, /android:pathPrefix="\/BizOn\/"/);
assert.match(strings, /https:\/\/thuyhuongctu\.github\.io\/BizOn\/app\/release\.html/);

assert.equal(webManifest.id, './release.html');
assert.equal(webManifest.start_url, './release.html');
assert.equal(webManifest.scope, './');
assert.equal(webManifest.display, 'standalone');
assert.equal(webManifest.name, 'BizOn — Mô phỏng quyết định kinh doanh');
assert.equal(webManifest.shortcuts.find(item => item.short_name === 'Command').url, './command-center.html');
assert.equal(webManifest.shortcuts.find(item => item.short_name === 'Startup').url, '../game.html');
assert.equal(webManifest.shortcuts.find(item => item.short_name === 'Passport').url, './brand-passport.html');
assert.equal(webManifest.shortcuts.find(item => item.short_name === 'AIBIS').url, './aibis.html');

for (const file of ['app/release.html', 'app/command-center.html', 'app/brand-passport.html', 'app/aibis.html']) {
  assert.equal(fs.existsSync(file), true, `${file} must exist`);
}

assert.match(release, /href="\.\/command-center\.html"/);
assert.match(release, /href="\.\/brand-passport\.html"/);
assert.match(release, /lưu Decision Trace trên thiết bị/i);
assert.match(release, /js\/app-shell\/unified-app\.js/);
assert.match(command, /EcoFuture Team/);
assert.match(command, /Web & PWA Access/);
assert.match(unifiedApp, /serviceWorker\.register\('\.\/sw\.js'/);
assert.doesNotMatch(release, /Teaching demo|AI Command Center|Local-only|placeholder|auto-generated/i);

console.log('Android TWA API 36 unified surface contract passed');
