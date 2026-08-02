'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
  console.log(`${condition ? '✓' : '✗'} ${message}`);
}

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(read('js/brand-passport-pilot-policy.example.js'), context, {
  filename: 'brand-passport-pilot-policy.example.js'
});

const policy = context.window.BIZON_BP_PILOT_POLICY;
check(Boolean(policy), 'Policy template exports BIZON_BP_PILOT_POLICY');
check(policy.allowRemoteSubmission === false, 'Remote submission fails closed by default');
check(policy.safeguards.localOnlyAvailable === true, 'Local-only remains available');
check(policy.safeguards.requireExplicitConsent === true, 'Explicit consent is required');
check(policy.safeguards.consentCheckboxPreselected === false, 'Consent cannot be preselected');
check(policy.safeguards.aiScoring === false, 'AI scoring remains disabled');
check(policy.safeguards.deterministicEngineAuthoritative === true, 'Deterministic engine remains authoritative');
check(policy.pilot.retentionDays === 180, 'Default retention is 180 days');
check(policy.dataController.name === '' && policy.dataController.institution === '' && policy.dataController.contactEmail === '',
  'Controller fields are deliberately incomplete in the template');
check(Array.isArray(policy.supportedLanguages) && policy.supportedLanguages.includes('vi') && policy.supportedLanguages.includes('en'),
  'Policy declares Vietnamese and English support');

const consent = read('docs/learning/BRAND_PASSPORT_CONSENT_VI_EN_V1.md');
check(consent.includes('# B. Bản tiếng Việt'), 'Consent contains Vietnamese notice');
check(consent.includes('# C. English version'), 'Consent contains English notice');
check(consent.includes('DATA_CONTROLLER_NAME') && consent.includes('DATA_CONTROLLER_EMAIL'),
  'Consent requires explicit data-controller configuration');
check(/local-only/i.test(consent), 'Consent preserves local-only use without submission');
check(/180 days|180 ngày/i.test(consent), 'Consent states the 180-day retention period');
check(/deletion receipt|biên nhận xóa/i.test(consent), 'Consent explains the deletion receipt');

const review = read('docs/learning/BRAND_PASSPORT_INSTRUCTIONAL_REVIEW_V1.md');
for (const phase of ['Observe', 'Decide', 'Event', 'Debrief']) {
  check(review.includes(phase), `Instructional matrix includes ${phase}`);
}
check(review.includes('không để AI tự chấm') || review.includes('không được AI chấm'),
  'Academic review prohibits automatic AI grading');
check(review.includes('deterministic engine'), 'Academic review preserves engine authority');
check(review.includes('outcome bias') && review.includes('hindsight bias'),
  'Debrief guardrail addresses outcome and hindsight bias');

if (failures.length) {
  console.error(`\n${failures.length}/${checks} policy checks failed:`);
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`\n${checks}/${checks} policy checks passed`);
