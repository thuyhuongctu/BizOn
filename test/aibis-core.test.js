const assert = require('assert');
const AIBIS = require('../js/aibis-core.js');

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test('readiness score uses the documented six dimensions', () => {
  const result = AIBIS.readinessScore({
    financial: 80,
    managerial: 60,
    technology: 70,
    internationalExperience: 40,
    productScalability: 90,
    networkCapability: 50
  });
  assert.strictEqual(result.score, 68);
});

test('same seed and inputs produce the same round outcome', () => {
  const a = AIBIS.createWorldState({ seed: 'CTU-IB-001', createdAt: '2026-08-01T00:00:00Z' });
  const b = AIBIS.createWorldState({ seed: 'CTU-IB-001', createdAt: '2026-08-01T00:00:00Z' });
  const input = {
    marketGrowth: 72,
    institutionalRisk: 38,
    tariffPressure: 25,
    localizationFit: 65,
    executionQuality: 70,
    shock: 10,
    shockType: 'tariff'
  };
  const outA = AIBIS.resolveRound(a, input);
  const outB = AIBIS.resolveRound(b, input);
  assert.deepStrictEqual(outA.outcome, outB.outcome);
  assert.deepStrictEqual(outA.state.company, outB.state.company);
});

test('different seeds vary stochastic noise while preserving valid ranges', () => {
  const input = { marketGrowth: 65, institutionalRisk: 45, tariffPressure: 30 };
  const a = AIBIS.resolveRound(AIBIS.createWorldState({ seed: 'A' }), input);
  const b = AIBIS.resolveRound(AIBIS.createWorldState({ seed: 'B' }), input);
  assert.notStrictEqual(a.outcome.revenueDeltaPercent, b.outcome.revenueDeltaPercent);
  assert(a.state.company.risk >= 0 && a.state.company.risk <= 100);
  assert(b.state.company.doi >= 0 && b.state.company.doi <= 100);
});

test('decision log validates entry modes and records AI-use metadata', () => {
  let state = AIBIS.createWorldState({ seed: 'LOG-001', classroomId: 'IB2026', teamId: 'T01', consent: true });
  state = AIBIS.appendDecision(state, {
    id: 'd-1',
    type: 'entry_mode',
    value: 'joint_venture',
    rationale: 'Need local knowledge and shared capital exposure.',
    evidenceSources: ['market-report', 'local-partner'],
    aiAdviceUsed: true,
    aiAdviceFollowed: false,
    decisionTimeSeconds: 145,
    createdAt: '2026-08-01T00:05:00Z'
  });
  assert.strictEqual(state.entryMode, 'joint_venture');
  assert.strictEqual(state.decisions[0].evidenceSources.length, 2);
  assert.strictEqual(state.decisions[0].aiAdviceFollowed, false);
  assert.throws(() => AIBIS.appendDecision(state, {
    id: 'bad', type: 'entry_mode', value: 'unknown_mode'
  }));
});

test('research export excludes free-text rationale but preserves auditable measures', () => {
  let state = AIBIS.createWorldState({ seed: 'R-001', classroomId: 'IB', teamId: 'A', consent: true });
  state = AIBIS.appendDecision(state, {
    id: 'd-1', type: 'market_selection', value: 'advanced_stable',
    rationale: 'Potentially identifiable free text', evidenceSources: ['wto'], decisionTimeSeconds: 50
  });
  const record = AIBIS.exportResearchRecord(state);
  assert.strictEqual(record.decisions[0].evidence_count, 1);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(record.decisions[0], 'rationale'), false);
  assert.strictEqual(record.consent, true);
});

console.log(`AIBIS core ${AIBIS.VERSION}: all tests passed.`);
