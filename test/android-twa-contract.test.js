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
assert.match(rootBuild, /com\.android\.application' version '8\.7\.3'/);
assert.match(appBuild, /applicationId 'vn\.bizon\.simulation'/);
assert.match(appBuild, /compileSdk 35/);
assert.match(appBuild, /targetSdk 35/);
assert.match(appBuild, /minSdk 23/);
assert.match(appBuild, /androidbrowserhelper:2\.2\.0/);
assert.doesNotMatch(appBuild, /storePassword|keyPassword|signingConfig\s+signingConfigs\.release/i);

assert.match(androidManifest, /com\.google\.androidbrowserhelper\.trusted\.LauncherActivity/);
assert.match(androidManifest, /android:exported="true"/);
assert.match(androidManifest, /android\.support\.customtabs\.trusted\.DEFAULT_URL/);
assert.match(androidManifest, /android:host="thuyhuongctu\.github\.io"/);
assert.match(androidManifest, /android:pathPrefix="\/BizOn\/"/);
assert.match(strings, /https:\/\/thuyhuongctu\.github\.io\/BizOn\/app\//);

assert.equal(webManifest.start_url, './index.html');
assert.equal(webManifest.scope, './');
assert.equal(webManifest.display, 'standalone');
assert.equal(assetlinksTemplate[0].target.package_name, 'vn.bizon.simulation');
assert.deepEqual(assetlinksTemplate[0].target.sha256_cert_fingerprints, ['REPLACE_WITH_PLAY_APP_SIGNING_SHA256']);
assert.equal(fs.existsSync('.well-known/assetlinks.json'), false, 'Do not publish assetlinks.json with a fake fingerprint');

console.log('Android TWA contract passed');
