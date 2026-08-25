'use strict';

const assert = require('node:assert/strict');
const GameState = require('../js/core/game-state.js');
const Seed = require('../js/core/seed-engine.js');

(function testDefaultState() {
  const state = GameState.createGameState({ classId: 'IB01', teamId: 'T01' });
  assert.equal(state.schemaVersion, '1.0');
  assert.equal(state.game.product, 'startup');
  assert.equal(state.game.totalRounds, 6);
  assert.equal(state.company.reputation, 50);
  assert.deepEqual(GameState.validateGameState(state), { valid: true, errors: [] });
})();

(function testAibisState() {
  const state = GameState.createGameState({ product: 'aibis', currentRound: 8 });
  assert.equal(state.game.totalRounds, 8);
  assert.equal(state.game.currentRound, 8);
})();

(function testBoundaryNormalization() {
  const state = GameState.createGameState({ risk: 999, marketShare: -5, currentRound: 99 });
  assert.equal(state.company.risk, 100);
  assert.equal(state.company.marketShare, 0);
  assert.equal(state.game.currentRound, 6);
})();

(function testInvalidState() {
  const state = GameState.createGameState();
  state.company.cash = Number.NaN;
  const validation = GameState.validateGameState(state);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes('invalid_company_cash'));
})();

(function testSeedCreation() {
  const seed = Seed.createSeed(' IB 01 ', 'T/01', 'pilot a');
  assert.equal(seed, 'IB-01:T-01:PILOT-A:2.0.0-ALPHA.1');
})();

(function testDeterminism() {
  const a = Seed.randomFromSeed('SAME', 'round-1');
  const b = Seed.randomFromSeed('SAME', 'round-1');
  const sequenceA = [a(), a(), a(), a()];
  const sequenceB = [b(), b(), b(), b()];
  assert.deepEqual(sequenceA, sequenceB);
})();

(function testNamespaceIsolation() {
  const a = Seed.randomFromSeed('SAME', 'market')();
  const b = Seed.randomFromSeed('SAME', 'event')();
  assert.notEqual(a, b);
})();

(function testHelpers() {
  assert.equal(Seed.integer('S', 'i', 1, 1), 1);
  assert.ok(['a', 'b', 'c'].includes(Seed.pick('S', 'p', ['a', 'b', 'c'])));
  assert.deepEqual(Seed.shuffle('S', 'sh', [1, 2, 3]), Seed.shuffle('S', 'sh', [1, 2, 3]));
  assert.throws(() => Seed.number('S', 'bad', 2, 1), /invalid_range/);
})();

console.log('core-state-seed tests passed');
