const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('aibis-staging.html', 'utf8');
const css = fs.readFileSync('css/aibis-staging.css', 'utf8');
const js = fs.readFileSync('js/aibis-staging-app.js', 'utf8');

[
  'market-grid','mode-grid','btn-commit','readiness-score','decision-log',
  'kpi-revenue','kpi-profit','kpi-risk','ctx-consent'
].forEach(id => assert(html.includes(`id="${id}"`), `missing #${id}`));

[
  'js/aibis-core.js','js/aibis-context.js','js/aibis-parameters.js','js/aibis-staging-app.js'
].forEach(src => assert(html.includes(src), `missing script ${src}`));

assert(css.includes('@media(max-width:600px)'), 'mobile breakpoint missing');
assert(js.includes('A.resolveRound'), 'simulation engine not connected');
assert(js.includes('A.exportResearchRecord'), 'research export not connected');
assert(js.includes('P.listMarkets'), 'parameter registry not connected');

console.log('AIBIS staging smoke checks passed.');