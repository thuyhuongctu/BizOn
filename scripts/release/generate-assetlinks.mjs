import fs from 'node:fs';
import path from 'node:path';

const PACKAGE_NAME = process.env.BIZON_PACKAGE_NAME || 'vn.bizon.simulation';
const RAW_FINGERPRINT = process.env.PLAY_APP_SIGNING_SHA256 || process.argv[2] || '';
const OUTPUT = process.env.ASSETLINKS_OUTPUT || process.argv[3] || 'release-artifacts/assetlinks.json';

function normalizeFingerprint(value) {
  const compact = String(value).trim().replace(/:/g, '').toUpperCase();
  if (!/^[0-9A-F]{64}$/.test(compact)) {
    throw new Error('PLAY_APP_SIGNING_SHA256 must contain exactly 64 hexadecimal characters.');
  }
  return compact.match(/.{2}/g).join(':');
}

if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(PACKAGE_NAME)) {
  throw new Error('Invalid Android package name.');
}

const fingerprint = normalizeFingerprint(RAW_FINGERPRINT);
const document = [{
  relation: ['delegate_permission/common.handle_all_urls'],
  target: {
    namespace: 'android_app',
    package_name: PACKAGE_NAME,
    sha256_cert_fingerprints: [fingerprint]
  }
}];

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(document, null, 2) + '\n', 'utf8');
console.log(`Generated ${OUTPUT} for ${PACKAGE_NAME}`);
