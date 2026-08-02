const fs = require('node:fs');
const assert = require('node:assert/strict');

const candidate = JSON.parse(fs.readFileSync('release/bizon-1.0.0-internal.json', 'utf8'));
const gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
const strings = fs.readFileSync('android/app/src/main/res/values/strings.xml', 'utf8');
const productionWorkflow = fs.readFileSync('.github/workflows/android-production-aab.yml', 'utf8');
const pilotPolicy = fs.readFileSync('js/brand-passport-pilot-policy.example.js', 'utf8');
const privacy = fs.readFileSync('chinh-sach.html', 'utf8');

assert.equal(candidate.product, 'BizOn');
assert.equal(candidate.package_name, 'vn.bizon.simulation');
assert.equal(candidate.version_name, '1.0.0');
assert.equal(candidate.version_code, 1);
assert.equal(candidate.track, 'internal');
assert.equal(candidate.distribution, 'free');
assert.equal(candidate.min_sdk, 23);
assert.equal(candidate.target_sdk, 36);
assert.equal(candidate.start_url, 'https://thuyhuongctu.github.io/BizOn/app/release.html');
assert.equal(candidate.privacy_policy_url, 'https://thuyhuongctu.github.io/BizOn/chinh-sach.html');
assert.equal(candidate.data_profile.core_local_use_available, true);
assert.equal(candidate.data_profile.brand_passport_remote_submission_enabled, false);
assert.equal(candidate.data_profile.advertising_sdk, false);
assert.equal(candidate.data_profile.native_sensitive_permissions, false);
assert.equal(candidate.signing.upload_key_required_for_signed_aab, true);
assert.equal(candidate.signing.play_app_signing_sha256_required_for_first_aab, false);
assert.equal(candidate.signing.play_app_signing_sha256_required_for_verified_twa, true);

assert.match(gradle, /applicationId 'vn\.bizon\.simulation'/);
assert.match(gradle, /minSdk 23/);
assert.match(gradle, /targetSdk 36/);
assert.match(gradle, /BIZON_VERSION_CODE/);
assert.match(gradle, /BIZON_VERSION_NAME/);

const permissions = [...manifest.matchAll(/<uses-permission[^>]+android:name="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(permissions, ['android.permission.INTERNET']);
assert.match(manifest, /android:allowBackup="false"/);
assert.match(manifest, /android:autoVerify="true"/);
assert.match(manifest, /android:host="thuyhuongctu\.github\.io"/);
assert.match(manifest, /android:pathPrefix="\/BizOn\/"/);
assert.doesNotMatch(manifest, /CAMERA|RECORD_AUDIO|ACCESS_FINE_LOCATION|READ_CONTACTS|READ_MEDIA|READ_EXTERNAL_STORAGE/);

assert.match(strings, /<string name="app_name">BizOn<\/string>/);
assert.match(strings, /https:\/\/thuyhuongctu\.github\.io\/BizOn\/app\/release\.html/);

assert.match(productionWorkflow, /BIZON_UPLOAD_KEYSTORE_BASE64/);
assert.match(productionWorkflow, /if \[ -n "\$PLAY_APP_SIGNING_SHA256" \]/);
assert.match(productionWorkflow, /PLAY_APP_SIGNING_SHA256 not configured/);
assert.doesNotMatch(productionWorkflow, /test -n "\$PLAY_APP_SIGNING_SHA256"/);

assert.match(pilotPolicy, /localOnlyAvailable:\s*true/);
assert.match(pilotPolicy, /allowRemoteSubmission:\s*false/);
assert.match(pilotPolicy, /aiScoring:\s*false/);
assert.match(pilotPolicy, /deterministicEngineAuthoritative:\s*true/);

assert.match(privacy, /BizOn Web, PWA &amp; Android/);
assert.match(privacy, /local-first/i);
assert.match(privacy, /Supabase/);

for (const path of [
  'app/release.html',
  'app/brand-passport.html',
  'app/aibis.html',
  'game.html',
  'giang-vien.html',
  'play-store/listing/vi-VN.md',
  'play-store/listing/en-US.md'
]) {
  assert.equal(fs.existsSync(path), true, `${path} must exist for the release candidate`);
}

const publicReleaseCopy = `${candidate.release_notes_vi}\n${candidate.release_notes_en}`;
assert.doesNotMatch(publicReleaseCopy, /AI[- ]generated|auto[- ]generated|prototype|placeholder/i);

console.log('BizOn Android 1.0.0 internal release candidate contract passed');
