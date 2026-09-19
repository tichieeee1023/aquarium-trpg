import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { JOBS, ITEM_DB, SCENARIOS, ENDINGS, initialGameState, gameReducer as reduce, getFinalEnding } from '../src/game/index.js';
import { FINAL_ESCAPE_STEPS, getFinalStepCheck } from '../src/game/finalEscape.js';
const start = (key = 'AQUARIST', roll = 10) => reduce(reduce(initialGameState, { type: 'SELECT_CHARACTER', payload: { key, gender: 'F' } }), { type: 'RESOLVE_CONDITION', payload: roll });
const examine = (state, point) => reduce(state, { type: 'EXAMINE_POINT', payload: { point, rewardItem: ITEM_DB[point.reward], flagKey: point.flag, hpCost: point.hpCost, sanCost: point.sanCost } });
test('referenced images exist', () => {
  const paths = Object.values(JOBS).flatMap(job => [job.imgM, job.imgF]);
  for (const scene of Object.values(SCENARIOS)) paths.push(...['bg', 'closingBg', 'vortexBg', 'breakBg'].map(k => scene[k]).filter(Boolean));
  paths.push(...Object.values(ITEM_DB).map(i => i.img).filter(Boolean));
  for (const key of Object.keys(ENDINGS)) paths.push(reduce(start(), { type: 'TRIGGER_ENDING', payload: key }).currentBg);
  for (const path of paths) assert.ok(existsSync(new URL('../public'+path, import.meta.url)), path);
});
test('condition bonuses fit gauges and fatigue changes DEX', () => {
  const lucky = start('VET', 20).character;
  assert.equal(lucky.san, 40); assert.equal(lucky.maxSan, 40);
  assert.equal(start('DIVER', 1).character.stats.DEX, 13);
});
test('equipment rewards are kept even after five items', () => {
  const state = { ...start(), phase: 'STAGE_2_BULKHEAD', inventory: [ITEM_DB.TONGS, ITEM_DB.RUBBER_BOOTS, ITEM_DB.LINE_CUTTER, ITEM_DB.PENLIGHT, ITEM_DB.KEY_TAG] };
  const point = SCENARIOS.STAGE_2_BULKHEAD.points[0];
  const rewarded = examine(state, point);
  assert.equal(rewarded.flags.hasCrowbar, true);
  assert.equal(rewarded.inventory.length, 6);
  assert.ok(rewarded.inventory.some((item) => item.id === 'CROWBAR'));
});test('cannot repeat examination or spend negative AP', () => {
  const point = SCENARIOS.STAGE_1_JELLYFISH.points[0]; const once = examine(start(), point);
  assert.equal(examine(once, point), once);
  const empty = { ...start(), ap: 0 }; assert.equal(examine(empty, point), empty);
});
test('consumables require ownership and zero HP ends run', () => {
  const state = start(); assert.equal(reduce(state, { type: 'USE_ITEM', payload: 'SEDATIVE' }), state);
  const dead = examine({ ...state, character: { ...state.character, hp: 1 } }, SCENARIOS.STAGE_1_JELLYFISH.points[3]);
  assert.equal(dead.character.hp, 0); assert.equal(dead.phase, 'ENDING');
});
test('one-time item and clue preparation modifies the intended checks', () => {
  const vent = FINAL_ESCAPE_STEPS[0];
  const fracture = FINAL_ESCAPE_STEPS[1];

  assert.deepEqual(
    getFinalStepCheck(vent, [ITEM_DB.MASTER_KEYCARD], {}, 'VET'),
    { dc: 11, preparation: 'MASTER_KEYCARD' }
  );
  assert.deepEqual(
    getFinalStepCheck(fracture, [ITEM_DB.HEX_WRENCH], {}, 'VET'),
    { dc: 13, preparation: 'HEX_WRENCH' }
  );
  assert.deepEqual(
    getFinalStepCheck(fracture, [ITEM_DB.CROWBAR, ITEM_DB.HEX_WRENCH], {}, 'VET'),
    { dc: 10, preparation: 'CROWBAR' }
  );
  assert.deepEqual(
    getFinalStepCheck(fracture, [], { isVortexStopped: true }, 'VET'),
    { dc: 13, preparation: 'VORTEX_STOPPED' }
  );
  assert.equal(
    getFinalEnding({
      failures: 0,
      inventory: [ITEM_DB.MASTER_KEYCARD, ITEM_DB.HEX_WRENCH, ITEM_DB.OXYGEN_MASK],
      characterKey: 'VET'
    }),
    'TRUE'
  );
  assert.equal(
    getFinalEnding({
      failures: 0,
      inventory: [ITEM_DB.MASTER_KEYCARD, ITEM_DB.OXYGEN_MASK],
      flags: { isVortexStopped: true },
      characterKey: 'VET'
    }),
    'TRUE'
  );
});
test('key tag makes the oxygen locker investigation succeed without a die roll', () => {
  const state = {
    ...start(),
    phase: 'STAGE_4_PUMP',
    inventory: [ITEM_DB.KEY_TAG],
    ap: 3
  };
  const point = SCENARIOS.STAGE_4_PUMP.points.find((entry) => entry.id === 'c4_4');
  const resolved = examine(state, point);
  assert.equal(resolved.inventory.some((item) => item.id === 'OXYGEN_MASK'), true);
  assert.equal(resolved.flags.hasOxygenMask, true);
});
