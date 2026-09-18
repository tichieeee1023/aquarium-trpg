import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { JOBS, ITEM_DB, SCENARIOS, ENDINGS, initialGameState, gameReducer as reduce } from '../src/aquariumEngine.js';
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
test('full bag cannot grant equipment and discard frees a slot', () => {
  let state = { ...start(), phase: 'STAGE_2_BULKHEAD', inventory: [ITEM_DB.TONGS, ITEM_DB.RUBBER_BOOTS, ITEM_DB.LINE_CUTTER, ITEM_DB.PENLIGHT, ITEM_DB.KEY_TAG] };
  const point = SCENARIOS.STAGE_2_BULKHEAD.points[0];
  const full = examine(state, point);
  assert.equal(full.flags.hasCrowbar, false); assert.equal(full.inventory.length, 5);
  assert.match(full.logs[0], /가방이 가득/);
  state = reduce(state, { type: 'DISCARD_ITEM', payload: 'TONGS' });
  state = examine(state, point); assert.equal(state.flags.hasCrowbar, true);
  state = reduce(state, { type: 'DISCARD_ITEM', payload: 'CROWBAR' }); assert.equal(state.flags.hasCrowbar, false);
});
test('cannot repeat examination or spend negative AP', () => {
  const point = SCENARIOS.STAGE_1_JELLYFISH.points[0]; const once = examine(start(), point);
  assert.equal(examine(once, point), once);
  const empty = { ...start(), ap: 0 }; assert.equal(examine(empty, point), empty);
});
test('consumables require ownership and zero HP ends run', () => {
  const state = start(); assert.equal(reduce(state, { type: 'USE_ITEM', payload: 'SEDATIVE' }), state);
  const dead = examine({ ...state, character: { ...state.character, hp: 1 } }, SCENARIOS.STAGE_1_JELLYFISH.points[3]);
  assert.equal(dead.character.hp, 0); assert.equal(dead.phase, 'ENDING');
});
