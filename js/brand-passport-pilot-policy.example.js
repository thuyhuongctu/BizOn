/* Brand Passport Learning Pilot — policy template
 *
 * Copy to a deployment-specific file only after governance approval.
 * Remote submission MUST remain false while controller fields are incomplete.
 */
window.BIZON_BP_PILOT_POLICY = Object.freeze({
  policyVersion: 'bp-learning-consent-v1',
  defaultLanguage: 'vi',
  supportedLanguages: ['vi', 'en'],

  dataController: Object.freeze({
    name: '',
    institution: '',
    contactEmail: ''
  }),

  pilot: Object.freeze({
    courseOrProject: '',
    startDate: '',
    endDate: '',
    retentionDays: 180,
    purpose: 'classroom_learning',
    researchOptional: false
  }),

  safeguards: Object.freeze({
    localOnlyAvailable: true,
    requireExplicitConsent: true,
    consentCheckboxPreselected: false,
    aiScoring: false,
    deterministicEngineAuthoritative: true,
    collectLegalName: false,
    collectPersonalEmail: false,
    collectPhone: false,
    deletionReceiptEnabled: true
  }),

  /* Fail closed. Set true only in the deployment environment after:
   * - data controller fields are complete;
   * - consent wording is approved;
   * - staging STG-01..STG-08 pass;
   * - incident/deletion operations have an assigned owner.
   */
  allowRemoteSubmission: false
});
