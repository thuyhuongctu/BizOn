const fs = require('node:fs');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');

const gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
const workflow = fs.readFileSync('.github/workflows/android-production-aab.yml', 'utf8');
const generator = fs.readFileSync('scripts/release/generate-assetlinks.mjs', 'utf8');
const privacy = fs.readFileSync('chinh-sach.html', 'utf8');

assert.match(gradle, /applicationId 'vn\.bizon\.simulation'/);
assert.match(gradle, /BIZON_UPLOAD_KEYSTORE_PATH/);
assert.match(gradle, /BIZON_UPLOAD_STORE_PASSWORD/);
assert.match(gradle, /BIZON_UPLOAD_KEY_ALIAS/);
assert.match(gradle, /BIZON_UPLOAD_KEY_PASSWORD/);
assert.match(gradle, /BIZON_VERSION_CODE/);
assert.match(gradle, /BIZON_VERSION_NAME/);
assert.doesNotMatch(gradle, /storePassword\s+['"][^'"]+['"]/);
assert.doesNotMatch(gradle, /keyPassword\s+['"][^'"]+['"]/);

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /environment: google-play-release/);
assert.match(workflow, /BIZON_UPLOAD_KEYSTORE_BASE64/);
assert.match(workflow, /PLAY_APP_SIGNING_SHA256/);
assert.match(workflow, /:app:bundleRelease/);
assert.match(workflow, /jarsigner -verify/);
assert.match(workflow, /Remove decoded keystore/);
assert.doesNotMatch(workflow, /REPLACE_WITH_PLAY_APP_SIGNING_SHA256/);
assert.doesNotMatch(workflow, /storePassword:\s*[^$\n]+/i);

assert.match(generator, /64 hexadecimal characters/);
assert.match(generator, /delegate_permission\/common\.handle_all_urls/);
assert.match(generator, /vn\.bizon\.simulation/);

assert.match(privacy, /BizOn Web, PWA &amp; Android/);
assert.match(privacy, /không khai báo quyền vị trí, danh bạ, máy ảnh, micro/i);
assert.match(privacy, /local-first/i);

fs.rmSync('release-artifacts', { recursive: true, force: true });
execFileSync(process.execPath, ['scripts/release/generate-assetlinks.mjs'], {
  env: {
    ...process.env,
    PLAY_APP_SIGNING_SHA256: 'AA'.repeat(32),
    ASSETLINKS_OUTPUT: 'release-artifacts/assetlinks.json'
  },
  stdio: 'inherit'
});
const assetlinks = JSON.parse(fs.readFileSync('release-artifacts/assetlinks.json', 'utf8'));
assert.equal(assetlinks[0].target.package_name, 'vn.bizon.simulation');
assert.equal(assetlinks[0].target.sha256_cert_fingerprints[0], Array(32).fill('AA').join(':'));
fs.rmSync('release-artifacts', { recursive: true, force: true });

console.log('Android production release contract passed');
