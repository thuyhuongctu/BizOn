const fs = require('node:fs');
const assert = require('node:assert/strict');

const policy = fs.readFileSync('chinh-sach.html', 'utf8');
const dataSafety = fs.readFileSync('docs/release/GOOGLE_PLAY_DATA_SAFETY_DRAFT.md', 'utf8');
const manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');

assert.match(policy, /local-first/i);
assert.match(policy, /local-only/i);
assert.match(policy, /mã lớp|class code/i);
assert.match(policy, /chủ động|explicit user action/i);
assert.match(policy, /GitHub Pages/);
assert.match(policy, /Supabase/);
assert.match(policy, /Internet access only|quyền Internet/i);
assert.match(policy, /patu@ctu\.edu\.vn/);
assert.match(policy, /thuyhuongctu@gmail\.com/);
assert.match(policy, /02\/08\/2026|August 2, 2026/);
assert.doesNotMatch(policy, /không bao giờ được gửi đi đâu|never transmitted anywhere/i);
assert.doesNotMatch(policy, /Google Fonts/);

assert.match(dataSafety, /vn\.bizon\.simulation/);
assert.match(dataSafety, /working paper|not a submitted declaration/i);
assert.match(dataSafety, /collection is optional/i);
assert.match(dataSafety, /Do not state|Assertions not yet allowed/i);
assert.match(dataSafety, /Play App Signing SHA-256/);
assert.match(dataSafety, /deletion process|deletion operations/i);

const permissions = [...manifest.matchAll(/<uses-permission[^>]+android:name="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(permissions, ['android.permission.INTERNET']);

console.log('Privacy and Play readiness contract passed');
