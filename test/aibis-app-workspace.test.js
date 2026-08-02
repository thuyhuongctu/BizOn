const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('app/aibis.html', 'utf8');
const css = fs.readFileSync('css/aibis-app.css', 'utf8');
const js = fs.readFileSync('js/app-shell/aibis-workspace.js', 'utf8');

assert.match(html, /International Business Digital Twin/i);
assert.match(html, /id="modeGrid"/);
assert.match(html, /id="priorityControls"/);
assert.match(html, /id="luminaRecommendation"/);
assert.match(html, /prefers-reduced-motion|aibis-app\.css/);
assert.match(css, /@media\(max-width:700px\)/);
assert.match(css, /prefers-reduced-motion/);

const ids = [...js.matchAll(/id:'([^']+)'/g)].map(match => match[1]);
assert.deepEqual(ids, ['export','licensing','joint-venture','alliance','fdi','digital']);
assert.match(js, /function fit\(mode\)/);
assert.match(js, /Fit score|score/);
assert.doesNotMatch(js, /localStorage|supabase|fetch\(/i);

console.log('AIBIS app workspace contract passed');
