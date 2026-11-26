// Deploy GitHub Pages thử lại một lần khi deploy-pages báo «Found 0 artifact(s)» thoáng qua (25–26/11/2026),
// nhưng lần thử lại không được continue-on-error để lỗi thật vẫn làm workflow đỏ.
'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const y = fs.readFileSync(path.join(__dirname, '..', '.github/workflows/deploy-pages.yml'), 'utf8');
const buoc = y.split(/\n\s*- (?=name:|uses:)/);
const tim = id => buoc.find(b => new RegExp('\\bid: ' + id + '\\b').test(b));
const d1 = tim('deployment'), d2 = tim('deployment2');
assert.ok(d1 && /actions\/deploy-pages@v4/.test(d1) && /continue-on-error: true/.test(d1), 'lần deploy đầu được phép hỏng để thử lại');
assert.ok(d2 && /actions\/deploy-pages@v4/.test(d2), 'có bước deploy lại');
assert.match(d2, /if: steps\.deployment\.outcome == 'failure'/, 'chỉ deploy lại khi lần đầu hỏng');
assert.ok(!/continue-on-error/.test(d2), 'lần deploy lại không che lỗi thật');
assert.ok(y.indexOf('id: deployment2') > y.indexOf('sleep 60'), 'chờ trước khi deploy lại');
assert.match(y, /steps\.deployment\.outputs\.page_url \|\| steps\.deployment2\.outputs\.page_url/);
console.log('deploy-thu-lai: ok');
