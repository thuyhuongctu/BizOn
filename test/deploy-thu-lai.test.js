// Deploy GitHub Pages: tránh lỗi «Found 0 artifact(s)» của actions/deploy-pages (#451, 11/2026).
//  - Hai job: build tải gói lên, deploy (needs: build) chỉ deploy → chạy lại job deploy không tải gói lần hai.
//  - Job deploy thử tối đa 3 lần; lần cuối không continue-on-error để lỗi thật vẫn làm workflow đỏ.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const y = fs.readFileSync(path.join(__dirname, '..', '.github/workflows/deploy-pages.yml'), 'utf8');
const iBuild = y.indexOf('\n  build:'), iDeploy = y.indexOf('\n  deploy:');
assert.ok(iBuild > 0 && iDeploy > iBuild, 'có job build rồi job deploy');
const build = y.slice(iBuild, iDeploy), deploy = y.slice(iDeploy);
assert.match(build, /actions\/upload-pages-artifact@/, 'build tải gói lên');
assert.ok(!/deploy-pages@/.test(build), 'build không deploy');
assert.match(deploy, /needs: build/, 'deploy chờ build');
assert.ok(!/upload-pages-artifact@/.test(deploy), 'deploy không tải gói lần hai');
assert.match(deploy, /environment:\s*\n\s*name: github-pages/);
const buoc = deploy.split(/\n\s*- (?=name:|uses:)/), tim = id => buoc.find(b => new RegExp('\\bid: ' + id + '\\b').test(b));
const d = ['deployment', 'deployment2', 'deployment3'].map(tim);
d.forEach((b, i) => assert.ok(b && /actions\/deploy-pages@v4/.test(b), 'có lần deploy ' + (i + 1)));
assert.match(d[0], /continue-on-error: true/); assert.match(d[1], /continue-on-error: true/);
assert.ok(!/continue-on-error/.test(d[2]), 'lần deploy cuối không che lỗi thật');
assert.match(d[1], /if: steps\.deployment\.outcome == 'failure'/);
assert.match(d[2], /steps\.deployment2\.outcome == 'failure'/);
assert.ok(deploy.indexOf('sleep 20') < deploy.indexOf('id: deployment2') && deploy.indexOf('sleep 60') < deploy.indexOf('id: deployment3'), 'chờ trước mỗi lần thử lại');
assert.match(deploy, /steps\.deployment\.outputs\.page_url \|\| steps\.deployment2\.outputs\.page_url \|\| steps\.deployment3\.outputs\.page_url/);
console.log('deploy-thu-lai: ok');
