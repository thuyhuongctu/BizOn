const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('app/aibis.html', 'utf8');
const css = fs.readFileSync('css/aibis-app.css', 'utf8');
const workspace = fs.readFileSync('js/app-shell/aibis-workspace.js', 'utf8');
const models = require('../js/aibis/entry-mode-models.js');

assert.match(html, /International Business Digital Twin/i);
assert.match(html, /id="modeGrid"/);
assert.match(html, /id="priorityControls"/);
assert.match(html, /id="luminaRecommendation"/);
assert.match(html, /prefers-reduced-motion|aibis-app\.css/);
assert.match(css, /@media\(max-width:700px\)/);
assert.match(css, /prefers-reduced-motion/);

const expectedIds = [
  'export',
  'licensing',
  'joint_venture',
  'strategic_alliance',
  'wholly_owned_fdi',
  'digital_entry',
];
assert.deepEqual(models.modes.map(mode => mode.id), expectedIds);
assert.equal(new Set(models.modes.map(mode => mode.id)).size, 6);

const modelScript = html.indexOf('../js/aibis/entry-mode-models.js');
const profileScript = html.indexOf('../js/aibis/country-profile-registry.js');
const engineScript = html.indexOf('../js/aibis/entry-mode-engine.js');
const workspaceScript = html.indexOf('../js/app-shell/aibis-workspace.js');
assert(modelScript >= 0 && profileScript >= 0 && engineScript >= 0 && workspaceScript >= 0);
assert(modelScript < workspaceScript && profileScript < workspaceScript && engineScript < workspaceScript);

assert.match(workspace, /Engine\.rankModes\(Models\.modes/);
assert.match(workspace, /Engine\.compareModes/);
assert.match(workspace, /Profiles\.createProfile/);
assert.match(workspace, /evidence confidence/i);
assert.doesNotMatch(workspace, /localStorage|supabase|fetch\(/i);

console.log('AIBIS app workspace contract passed');
