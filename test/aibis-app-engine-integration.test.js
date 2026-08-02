const assert = require('assert');
const engine = require('../js/aibis/entry-mode-engine.js');
const models = require('../js/aibis/entry-mode-models.js');
const profiles = require('../js/aibis/country-profile-registry.js');

assert.strictEqual(models.modes.length, 6);
assert.strictEqual(new Set(models.modes.map(m => m.id)).size, 6);

const indicator = value => ({ value, sourceId:'test', referenceYear:2026, confidence:50, license:'test' });
const profile = profiles.createProfile({
  iso2:'JP', name:'Japan', indicators:Object.fromEntries(profiles.DIMENSIONS.map(key => [key, indicator(50)]))
});
assert.strictEqual(profiles.validateProfile(profile).valid, true);
assert.strictEqual(profiles.profileConfidence(profile), 50);

const context = {
  priorities:{control:70,speed:60,learning:75,capitalEfficiency:55,riskCompatibility:55,knowledgeProtection:60,localEmbeddedness:70,digitalScalability:65},
  firm:{financialCapacity:64,internationalExperience:48,digitalCapability:72},
  country:{marketSize:86,politicalRisk:18,culturalDistance:62,institutionalDistance:45,logisticsQuality:88,tariffPressure:25,digitalReadiness:91,ipProtection:86,dataRegulationRisk:52,crossBorderNetworkEffects:72,localPartnerValue:78,networkImportance:72,opportunismRisk:35}
};
const a = engine.rankModes(models.modes, context);
const b = engine.rankModes(models.modes, context);
assert.deepStrictEqual(a, b);
assert.strictEqual(a.length, 6);
a.forEach(result => {
  assert(result.score >= 0 && result.score <= 100);
  assert(result.confidence >= 0 && result.confidence <= 100);
});
const digital = a.find(r => r.modeId === 'digital_entry');
const lowDigital = engine.rankModes(models.modes, {...context, firm:{...context.firm, digitalCapability:10}}).find(r => r.modeId === 'digital_entry');
assert(lowDigital.score < digital.score);
console.log('AIBIS app engine integration contract passed');
