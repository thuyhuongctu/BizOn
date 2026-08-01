const assert = require('assert');
const AIBIS = require('../js/aibis-core.js');
const P = require('../js/aibis-parameters.js');
const Parity = require('../js/aibis-parity.js');

let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log('✓', name); }

const modes = P.listEntryModes();
const markets = P.listMarkets();

test('registry exposes seven markets and seven modes', () => {
  assert.strictEqual(markets.length, 7);
  assert.strictEqual(modes.length, 7);
});

let scenarios = 0;
markets.forEach((marketId, mi) => {
  modes.forEach((modeId, ei) => {
    if (scenarios >= 35) return;
    const m = P.getMarket(marketId);
    let state = AIBIS.createWorldState({ seed: `VAL-${marketId}-${modeId}`, market: marketId, entryMode: modeId, digitalCapability: m.digitalReadiness });
    const a = AIBIS.resolveRound(state, { marketGrowth: m.growth, institutionalRisk: m.institutionalRisk, tariffPressure: m.tariffPressure, localizationFit: 55 + mi, executionQuality: 58 + ei, shock: ei % 3 === 0 ? 20 : 0 });
    const b = AIBIS.resolveRound(state, { marketGrowth: m.growth, institutionalRisk: m.institutionalRisk, tariffPressure: m.tariffPressure, localizationFit: 55 + mi, executionQuality: 58 + ei, shock: ei % 3 === 0 ? 20 : 0 });
    test(`deterministic ${marketId}/${modeId}`, () => {
      assert.deepStrictEqual(a, b);
      assert(a.state.company.risk >= 0 && a.state.company.risk <= 100);
      assert(a.state.company.doi >= 0 && a.state.company.doi <= 100);
      assert(a.state.company.internationalLearning >= 0 && a.state.company.internationalLearning <= 100);
    });
    scenarios += 1;
  });
});

test('parity summary holds release with insufficient records', () => {
  const result = Parity.summarize([]);
  assert.strictEqual(result.releaseGate, 'hold');
});

console.log(`AIBIS validation: ${passed} tests passed across ${scenarios} scripted scenarios.`);
