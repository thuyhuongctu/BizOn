const fs=require('fs');
const assert=require('assert');
const html=fs.readFileSync('vietlens/index.html','utf8');
const css=fs.readFileSync('vietlens/styles.css','utf8');
const app=fs.readFileSync('vietlens/app.js','utf8');
const data=fs.readFileSync('vietlens/sample-data.js','utf8');
[
  'id="overview"','id="signals"','id="forecast"','id="audit"',
  'id="vnMap"','id="signalList"','id="scenarioResults"','id="provenanceTable"',
  './sample-data.js','./app.js','./styles.css'
].forEach(token=>assert(html.includes(token),`Missing HTML token: ${token}`));
assert(css.includes('@media(max-width:620px)'), 'Missing mobile breakpoint');
assert(app.includes('baselineForecast'), 'Missing forecast engine');
assert(app.includes('runScenario'), 'Missing scenario engine');
assert(app.includes('exportReport'), 'Missing report export');
assert(data.includes('VIETLENS_SAMPLE'), 'Missing sample dataset');
assert(data.includes('provenance'), 'Missing provenance metadata');
console.log('VietLens static smoke tests passed.');