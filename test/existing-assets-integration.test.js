const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = relativePath => fs.existsSync(path.join(root, relativePath));

const registryPath = 'assets/approved-existing-assets.json';
assert.ok(exists(registryPath), 'Approved existing asset registry is missing');

const registry = JSON.parse(read(registryPath));
assert.equal(registry.schema, 'bizon-approved-existing-assets-v1');
assert.equal(registry.policy.source, 'existing-repository-assets-only');
assert.equal(registry.policy.preserve_originals, true);
assert.equal(registry.policy.allow_generated_replacements, false);
assert.equal(registry.policy.exclude_food_truck, true);

const assets = Object.values(registry.assets);
assert.ok(assets.length >= 6, 'Expected at least six approved existing assets');

for (const asset of assets) {
  assert.ok(asset.path.startsWith('assets/'), `Asset must stay inside assets/: ${asset.path}`);
  assert.ok(exists(asset.path), `Approved asset does not exist: ${asset.path}`);
  assert.ok(asset.vi_alt && asset.en_alt, `Bilingual alt text is required: ${asset.path}`);
  assert.ok(Array.isArray(asset.allowed_pages) && asset.allowed_pages.length > 0, `Allowed page map is required: ${asset.path}`);
  assert.doesNotMatch(asset.path, /food[-_ ]?truck|generated|imagegen/i, `Excluded asset entered registry: ${asset.path}`);
}

const integration = read('js/app-shell/existing-assets.js');
assert.match(integration, /huongLuminaClassroom/);
assert.match(integration, /tuPhanLectureHall/);
assert.match(integration, /luminaOfficePresent/);
assert.match(integration, /installLandingCast/);
assert.match(integration, /installCommandCenterGuide/);
assert.match(integration, /installAibisGuide/);
assert.match(integration, /Lumina không sửa điểm, tiền mặt, lợi nhuận hoặc đầu ra engine/);

const unifiedShell = read('js/app-shell/unified-app.js');
const aibisShell = read('js/app-shell/app-shell.js');
assert.match(unifiedShell, /existing-assets\.js/);
assert.match(aibisShell, /existing-assets\.js/);

const release = read('app/release.html');
const command = read('app/command-center.html');
const aibis = read('app/aibis.html');
assert.match(release, /unified-app\.js/);
assert.match(command, /unified-app\.js/);
assert.match(aibis, /app-shell\.js/);

const stylesheet = read('css/bizon-existing-assets.css');
assert.match(stylesheet, /\.bz-existing-cast/);
assert.match(stylesheet, /\.bz-existing-guide/);
assert.match(stylesheet, /\.aibis-existing-guide/);
assert.match(stylesheet, /@media \(max-width: 560px\)/);

const sw = read('app/sw.js');
assert.match(sw, /bizon-app-shell-v5/);
for (const required of [
  '../css/bizon-existing-assets.css',
  '../js/app-shell/existing-assets.js',
  '../assets/approved-existing-assets.json',
  '../assets/illustrations/lumina-holo-classroom.webp',
  '../assets/illustrations/anh-tu-lecture-hall.webp',
  '../assets/character/lumina-office-present.webp'
]) {
  assert.ok(sw.includes(required), `Service worker must cache ${required}`);
}

console.log(`Existing asset integration contract passed for ${assets.length} approved assets.`);
