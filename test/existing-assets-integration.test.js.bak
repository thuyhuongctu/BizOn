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

const requiredRegistryKeys = [
  'huong_lumina_classroom',
  'tu_phan_lecture_hall',
  'lumina_office_present',
  'vietnam_journey_map',
  'vietnam_startup_hero',
  'brand_passport_cast_sheet',
  'bizon_music_cover'
];
for (const key of requiredRegistryKeys) {
  assert.ok(registry.assets[key], `Required approved asset is missing: ${key}`);
}

const assets = Object.values(registry.assets);
assert.ok(assets.length >= 10, 'Expected at least ten approved existing assets');

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
assert.match(integration, /vietnamJourneyMap/);
assert.match(integration, /vietnamStartupHero/);
assert.match(integration, /brandPassportCastSheet/);
assert.match(integration, /bizonMusicCover/);
assert.match(integration, /installLandingCast/);
assert.match(integration, /installEcosystemLibrary/);
assert.match(integration, /installCommandCenterGuide/);
assert.match(integration, /installAibisGuide/);
assert.match(integration, /data-existing-ecosystem/);
assert.match(integration, /game\.html/);
assert.match(integration, /global\.html/);
assert.match(integration, /app\/brand-passport\.html/);
assert.match(integration, /am-nhac\.html/);
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

const music = read('am-nhac.html');
assert.match(music, /arena-vietnam-map-v2\.webp/);
assert.match(music, /hero-vietnam-2026\.webp/);
assert.match(music, /giai-dieu-bizon\.webp/);
assert.match(music, /cast-sheet-brand-passport\.webp/);

const stylesheet = read('css/bizon-existing-assets.css');
assert.match(stylesheet, /\.bz-existing-cast/);
assert.match(stylesheet, /\.bz-existing-ecosystem/);
assert.match(stylesheet, /\.bz-existing-ecosystem-grid/);
assert.match(stylesheet, /\.bz-existing-module/);
assert.match(stylesheet, /\.bz-existing-guide/);
assert.match(stylesheet, /\.aibis-existing-guide/);
assert.match(stylesheet, /@media \(max-width: 560px\)/);

const sw = read('app/sw.js');
assert.match(sw, /bizon-app-shell-v7/);
for (const required of [
  '../css/bizon-existing-assets.css',
  '../js/app-shell/existing-assets.js',
  '../assets/approved-existing-assets.json',
  '../assets/illustrations/lumina-holo-classroom.webp',
  '../assets/illustrations/anh-tu-lecture-hall.webp',
  '../assets/character/lumina-office-present.webp',
  '../assets/illustrations/arena-vietnam-map-v2.webp',
  '../assets/illustrations/hero-vietnam-2026.webp',
  '../assets/illustrations/cast-sheet-brand-passport.webp',
  '../assets/illustrations/giai-dieu-bizon.webp'
]) {
  assert.ok(sw.includes(required), `Service worker must cache ${required}`);
}

console.log(`Existing asset integration contract passed for ${assets.length} approved assets.`);
