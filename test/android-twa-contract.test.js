const fs = require('node:fs');
const assert = require('node:assert/strict');

const settings = fs.readFileSync('android/settings.gradle', 'utf8');
const rootBuild = fs.readFileSync('android/build.gradle', 'utf8');
const appBuild = fs.readFileSync('android/app/build.gradle', 'utf8');
const androidManifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const strings = fs.readFileSync('android/app/src/main/res/values/strings.xml', 'utf8');
const webManifest = JSON.parse(fs.readFileSync('app/manifest.webmanifest', 'utf8'));
const assetlinksTemplate = JSON.parse(fs.readFileSync('.well-known/assetlinks.template.json', 'utf8'));

assert.match(settings, /include ':app'/);
assert.match(rootBuild, /com\.android\.application' version '8\.10\.1'/);
assert.match(appBuild, /applicationId 'vn\.bizon\.simulation'/);
assert.match(appBuild, /compileSdk 36/);
assert.match(appBuild, /targetSdk 36/);
assert.match(appBuild, /minSdk 23/);
assert.match(appBuild, /androidbrowserhelper:2\.2\.0/);
assert.match(appBuild, /BIZON_UPLOAD_KEYSTORE_PATH/);
assert.match(appBuild, /BIZON_UPLOAD_STORE_PASSWORD/);
assert.match(appBuild, /BIZON_UPLOAD_KEY_ALIAS/);
assert.match(appBuild, /BIZON_UPLOAD_KEY_PASSWORD/);
assert.doesNotMatch(appBuild, /storePassword\s+['"][^'"]+['"]/);
assert.doesNotMatch(appBuild, /keyPassword\s+['"][^'"]+['"]/);

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
assert.equal(webManifest.shortcuts.find(item => item.short_name === 'Passport').url, './brand-passport.html');
assert.equal(webManifest.shortcuts.find(item => item.short_name === 'AIBIS').url, './aibis.html');
assert.equal(assetlinksTemplate[0].target.package_name, 'vn.bizon.simulation');
assert.deepEqual(assetlinksTemplate[0].target.sha256_cert_fingerprints, ['REPLACE_WITH_PLAY_APP_SIGNING_SHA256']);
assert.equal(fs.existsSync('.well-known/assetlinks.json'), false, 'Do not publish assetlinks.json with a fake fingerprint');

for (const path of ['app/release.html', 'app/brand-passport.html', 'brand-passport-learning.html']) {
  assert.equal(fs.existsSync(path), true, `${path} must exist`);
}

const release = fs.readFileSync('app/release.html', 'utf8');
assert.match(release, /\.\/brand-passport\.html/);
assert.match(release, /Local-only/);
assert.match(release, /serviceWorker\.register\('\.\/sw\.js'/);

console.log('Android TWA API 36 release contract passed');
