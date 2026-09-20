import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { JOBS, ITEM_DB, SCENARIOS, ENDINGS, initialGameState, gameReducer as reduce, getFinalEnding } from '../src/game/index.js';
import { FINAL_ESCAPE_STEPS, getFinalStepCheck } from '../src/game/finalEscape.js';
import { getEndingJobEpilogue } from '../src/data/endingJobEpilogues.js';
import { ENDING_DEFINITIONS } from '../src/data/endingDB.js';
import { ENDING_CARDS } from '../src/data/assetDB.js';
import { getStageTransitionStory } from '../src/game/stageFlow.js';
const start = (key = 'AQUARIST', roll = 10) => reduce(reduce(initialGameState, { type: 'SELECT_CHARACTER', payload: { key, gender: 'F' } }), { type: 'RESOLVE_CONDITION', payload: roll });
const examine = (state, point) => reduce(state, { type: 'EXAMINE_POINT', payload: { point, rewardItem: ITEM_DB[point.reward], flagKey: point.flag, hpCost: point.hpCost, sanCost: point.sanCost } });
test('referenced images exist', () => {
  const paths = Object.values(JOBS).flatMap(job => [job.imgM, job.imgF]);
  for (const scene of Object.values(SCENARIOS)) paths.push(...['bg', 'closingBg', 'vortexBg', 'breakBg'].map(k => scene[k]).filter(Boolean));
  paths.push(...Object.values(ITEM_DB).map(i => i.img).filter(Boolean));
  for (const key of Object.keys(ENDINGS)) paths.push(reduce(start(), { type: 'TRIGGER_ENDING', payload: key }).currentBg);
  paths.push(...Object.values(ENDING_CARDS));
  for (const path of paths) assert.ok(existsSync(new URL('../public'+path, import.meta.url)), path);
});
test('condition bonuses fit gauges and fatigue changes DEX', () => {
  const fresh = reduce(initialGameState, { type: 'SELECT_CHARACTER', payload: { key: 'VET', gender: 'F' } }).character;
  assert.equal(fresh.hp, 20); assert.equal(fresh.maxHp, 20);
  assert.equal(fresh.san, 15); assert.equal(fresh.maxSan, 15);
  const lucky = start('VET', 20).character;
  assert.equal(lucky.san, 25); assert.equal(lucky.maxSan, 25);
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
test('consumables require ownership and zero HP triggers BAD END 4', () => {
  const state = start(); assert.equal(reduce(state, { type: 'USE_ITEM', payload: 'SEDATIVE' }), state);
  const dead = examine({ ...state, character: { ...state.character, hp: 1 } }, SCENARIOS.STAGE_1_JELLYFISH.points[3]);
  assert.equal(dead.character.hp, 0); assert.equal(dead.phase, 'ENDING'); assert.equal(dead.ending.type, 'BAD_4');
});
test('energy drink reward is consumed immediately and restores up to 2 HP', () => {
  const state = { ...start(), character: { ...start().character, hp: 12 } };
  const rewarded = reduce(state, { type: 'REWARD_AND_CONSUME_ITEM', payload: 'ENERGY_DRINK' });
  assert.equal(rewarded.character.hp, 14);
  assert.equal(rewarded.inventory.some(item => item.id === 'ENERGY_DRINK'), false);
  assert.match(rewarded.logs[0], /에너지 드링크.*HP \+2/);

  const alreadyHealthy = reduce(start(), { type: 'REWARD_AND_CONSUME_ITEM', payload: 'ENERGY_DRINK' });
  assert.equal(alreadyHealthy.character.hp, alreadyHealthy.character.maxHp);
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
  assert.deepEqual(
    getFinalStepCheck(fracture, [ITEM_DB.HEX_WRENCH], { isVortexStopped: true }, 'VET'),
    { dc: 11, preparation: 'HEX_WRENCH + VORTEX_STOPPED' }
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
test('every ending has a distinct epilogue for every job', () => {
  const jobKeys = Object.keys(JOBS);
  const epilogues = Object.keys(ENDINGS).flatMap(endingType =>
    jobKeys.map(jobKey => getEndingJobEpilogue(jobKey, endingType))
  );
  assert.equal(epilogues.length, Object.keys(ENDINGS).length * jobKeys.length);
  assert.equal(epilogues.every(Boolean), true);
  assert.equal(new Set(epilogues).size, epilogues.length);
  const endingIds = ['BAD_1', 'BAD_2', 'BAD_3', 'BAD_4', 'NORMAL', 'GOOD', 'TRUE'];
  assert.deepEqual(Object.keys(ENDINGS), endingIds);
  assert.deepEqual(Object.keys(ENDING_DEFINITIONS), endingIds);
  assert.deepEqual(Object.keys(ENDING_CARDS), endingIds);
});
test('severe final escape failure resolves to BAD END 4', () => {
  assert.equal(getFinalEnding({ failures: 3, inventory: [], characterKey: 'VET' }), 'BAD_4');
});
test('final damage can reduce HP or SAN to zero', () => {
  const state = {
    ...start(),
    phase: 'STAGE_5_DOME',
    character: { ...start().character, hp: 1, san: 1 }
  };
  const resolved = reduce(state, {
    type: 'RESOLVE_FINAL_STEP',
    payload: { success: false, hpDamage: 99, sanDamage: 99 }
  });
  assert.equal(resolved.character.hp, 0);
  assert.equal(resolved.character.san, 0);
  assert.equal(resolved.finalStep, 1);
});
test('pump room transitions through a described route to the dome', () => {
  const story = getStageTransitionStory('STAGE_4_PUMP', 'STAGE_5_DOME');
  assert.match(story.body, /점검 사다리/);
  assert.match(story.body, /점검 해치/);
});
