'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = path => fs.readFileSync(path, 'utf8');
const page = read('app/blueprint-2030.html');
const css = read('css/bizon-blueprint-2030.css');
const shell = read('js/app-shell/unified-app.js');
const backend = read('js/backend-config.js');

[
  'Business Digital Twin','AI Multi-Agent Economy','Global Market Engine','Scenario Generator',
  'Learning Intelligence','Research Laboratory','Enterprise Edition','Marketplace','Cloud Platform','AI Research Hub'
].forEach(name => assert.ok(page.includes(name), `Missing Blueprint pillar: ${name}`));

['../index.html','./command-center.html','../game.html','./brand-passport.html','./instructor-studio.html','../aibis-entry-mode-preview.html']
  .forEach(href => assert.ok(page.includes(href), `Missing current product link: ${href}`));

assert.match(page, /Planned|PLANNED/);
assert.match(page, /Experimental|EXPERIMENTAL/);
assert.match(page, /Engine xác định/);
assert.match(page, /không phải cam kết rằng toàn bộ tầm nhìn đã được triển khai/i);
assert.match(css, /@media\(max-width:620px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(shell, /blueprint-2030\.html/);
assert.match(shell, /data\.blueprint2030|dataset\.blueprint2030/);

assert.match(backend, /coreV2/);
assert.match(backend, /shadowSync/);
assert.match(backend, /js\/core\/shadow-sync\.js/);
assert.match(backend, /shadowEnabled = enabled/);
assert.doesNotMatch(backend, /service_role/i);

const Engine = require('../js/aibis/entry-mode-engine.js');
const Models = require('../js/aibis/entry-mode-models.js');
const ranking = Engine.rankModes(Models.modes, {
  priorities: { control: 60, speed: 70, learning: 65, capitalEfficiency: 75, riskCompatibility: 55, knowledgeProtection: 55, localEmbeddedness: 60, digitalScalability: 65 },
  firm: { financialCapacity: 55, internationalExperience: 48, digitalCapability: 70 },
  country: { institutionalDistance: 40, culturalDistance: 52, logisticsQuality: 75, tariffPressure: 22, digitalReadiness: 88 }
});
assert.equal(ranking.length, 6);
assert.ok(ranking.every(item => Number.isFinite(item.score)));
assert.ok(ranking.every(item => item.confidence >= 0 && item.confidence <= 100));

const Registry = require('../js/aibis/country-profile-registry.js');
const Template = require('../js/aibis/country-profile-template.js');
const empty = Template.createEmptyCountryProfile({ iso2: 'JP', name: 'Japan', region: 'East Asia' });
assert.equal(Registry.validateProfile(empty).valid, false);
assert.equal(Registry.DIMENSIONS.length, 12);

console.log('BizOn 2030 unified platform contract passed.');
