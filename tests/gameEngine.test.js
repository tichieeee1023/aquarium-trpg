import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from '../src/state/initialGameState.js';
import { gameReducer } from '../src/state/gameReducer.js';
import { GAME_ACTIONS } from '../src/state/gameActions.js';
import { createStageHandlers } from '../src/state/stageHandlers.js';
import { ARCHETYPES } from '../src/data/surveyDB.js';
import { FATIGUE_ROLL_TABLE } from '../src/data/conditionDB.js';
import { executeD20Check, getSuccessProbability } from '../src/utils/diceEngine.js';
import { PUBLIC_ASSET_FILES } from '../src/data/assetDB.js';
import { ITEM_DATABASE } from '../src/data/itemDB.js';
import { advanceStoryModal } from '../src/utils/storyFlow.js';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function harness() {
  let state = createInitialGameState();
  const timers = [];
  const originalTimer = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => { timers.push(fn); return timers.length; };
  const dispatch = (action) => { state = gameReducer(state, action); };
  const update = (field, value) => dispatch({ type: GAME_ACTIONS.UPDATE_FIELD, field, value });
  const sfx = new Proxy({}, { get: () => () => {} });
  return {
    get state() { return state; },
    update,
    handlers() {
      const context = { ...state, dispatch, sfx, getState: () => state, addLog: () => {}, triggerGlitch: () => {},
        openDiceCheck: (_title, _stat, _dc, success) => success(),
        openConditionDice: (resolve) => resolve(14) };
      for (const field of Object.keys(state)) context[`set${field[0].toUpperCase()}${field.slice(1)}`] = (value) => update(field, value);
      return createStageHandlers(context);
    },
    close() { advanceStoryModal(state.activeModalText, (modal) => update('activeModalText', modal)); },
    flush() { while (timers.length) timers.shift()(); },
    restore() { globalThis.setTimeout = originalTimer; },
  };
}

test('reducer updates are immutable, sequential and reset to fresh state', () => {
  const initial = createInitialGameState();
  const next = gameReducer(initial, { type: GAME_ACTIONS.UPDATE_FIELD, field: 'ap', value: (ap) => ap - 1 });
  assert.equal(initial.ap, 3);
  assert.equal(next.ap, 2);
  assert.equal(gameReducer(next, { type: GAME_ACTIONS.UPDATE_FIELD, field: 'ap', value: (ap) => ap - 1 }).ap, 1);
  const reset = gameReducer(next, { type: GAME_ACTIONS.RESET });
  assert.equal(reset.ap, 3);
  assert.notEqual(reset.player, initial.player);
});

test('all 20 D20 outcomes match probability, including natural 1 and 20', () => {
  for (const stat of [9, 10, 14]) for (const dc of [1, 11, 14, 30]) {
    const results = Array.from({ length: 20 }, (_, i) => executeD20Check(stat, dc, 2, () => i / 20));
    assert.equal(results[0].isSuccess, false);
    assert.equal(results[19].isSuccess, true);
    assert.equal(results.filter((result) => result.isSuccess).length * 5, getSuccessProbability(stat, dc, 2));
  }
});

test('condition table boundaries and every profile retain existing data', () => {
  assert.equal(ARCHETYPES.length, 5);
  for (const profile of ARCHETYPES) assert.equal(Math.max(...Object.values(profile.stats)), 14);
  assert.deepEqual([1, 2, 7, 8, 14, 15, 19, 20].map((roll) => FATIGUE_ROLL_TABLE(roll).san), [24, 28, 28, 30, 30, 32, 32, 40]);
});

test('all 24 linked assets including the intro exist; selecting a female profile persists its gender', () => {
  assert.equal(Object.keys(PUBLIC_ASSET_FILES).length, 24);
  for (const path of Object.keys(PUBLIC_ASSET_FILES)) {
    assert.ok(existsSync(fileURLToPath(new URL(`../${path}`, import.meta.url))), path);
  }
  const game = harness();
  try {
    game.handlers().handleSelectArchetype(ARCHETYPES[4], 'F');
    assert.equal(game.state.player.gender, 'F');
    assert.equal(game.state.player.profileId, 'GAMBLER');
    assert.match(ARCHETYPES[4].portraits.F, /char_gambler_f.webp$/);
    game.handlers().handleRestart();
    assert.equal(game.state.player.gender, 'M');
  } finally { game.restore(); }
});

test('every mapped item image is a WebP file on disk', () => {
  assert.equal(Object.keys(ITEM_DATABASE).length, 25);
  for (const item of Object.values(ITEM_DATABASE)) {
    assert.match(item.img, /\.webp$/);
    assert.ok(existsSync(fileURLToPath(new URL(`../public${item.img}`, import.meta.url))), item.img);
  }
  assert.match(ITEM_DATABASE.DICE_CRIT_WIN.img, /item_dice_crit_success\.webp$/);
});

test('wrench acquired on last AP allows escape; repeated point consumes no AP', () => {
  const game = harness();
  try {
    game.update('stage', 'STAGE_1_CAR6');
    game.handlers().examineCar6Point('p3_valve'); game.close();
    game.handlers().examineCar6Point('p3_valve');
    assert.equal(game.state.ap, 2);
    game.handlers().examineCar6Point('p6_floor'); game.close();
    game.handlers().examineCar6Point('p4_shelf'); game.close(); game.flush();
    assert.match(game.state.activeModalText.image.src, /mimic_centipede/);
    game.close(); game.close();
    assert.equal(game.state.stage, 'STAGE_2_TUNNEL');
    assert.equal(game.state.ap, 3);
    assert.deepEqual(game.state.examinedPoints, []);
  } finally { game.restore(); }
});

test('next dismisses an ordinary exploration result and shows its acquired tool', () => {
  const game = harness();
  try {
    game.update('stage', 'STAGE_1_CAR6');
    game.handlers().examineCar6Point('p4_shelf');
    assert.equal(game.state.activeModalText.rewardItems[0].id, 'wrench');
    game.close();
    assert.equal(game.state.activeModalText, null);
    assert.equal(game.state.ap, 2);
    game.handlers().examineCar6Point('p3_valve');
    game.close();
    assert.equal(game.state.activeModalText, null);
    assert.equal(game.state.ap, 1);
  } finally { game.restore(); }
});

test('no wrench produces BAD END 1; platform trap produces BAD END 2', () => {
  const game = harness();
  try {
    for (const point of ['p3_valve', 'p6_floor', 'p1_padding']) {
      game.handlers().examineCar6Point(point); game.close(); game.flush();
    }
    game.close();
    assert.equal(game.state.stage, 'ENDING');
    assert.match(game.state.endingData.title, /BAD END 1/);
    game.handlers().handleRestart();
    game.update('stage', 'STAGE_3_PLATFORM');
    game.handlers().choosePlatformExit('EXIT_3');
    assert.match(game.state.activeModalText.image.src, /trap_exit/);
    game.close();
    assert.equal(game.state.stage, 'ENDING');
    assert.match(game.state.endingData.title, /BAD END 2/);
  } finally { game.restore(); }
});

test('successful route traverses all stages and retains the tool ending path', () => {
  const game = harness();
  try {
    game.handlers().handleSelectArchetype(ARCHETYPES[0]);
    assert.equal(game.state.stage, 'DICE_CONDITION');
    game.handlers().handleRollCondition(); game.flush(); game.close();
    assert.match(game.state.activeModalText.image.src, /blackout/);
    game.close();
    for (const point of ['p4_shelf', 'p3_valve', 'p6_floor']) {
      game.handlers().examineCar6Point(point); game.close(); game.flush();
    }
    game.close(); game.close();
    assert.equal(game.state.stage, 'STAGE_2_TUNNEL');
    for (const point of ['t1_recess', 't2_phone', 't3_cart']) { game.handlers().examineTunnelPoint(point); game.close(); }
    game.close();
    assert.equal(game.state.stage, 'STAGE_3_PLATFORM');
    game.handlers().choosePlatformExit('BREAKER'); game.close();
    assert.equal(game.state.stage, 'STAGE_4_MALL');
    for (const point of ['c1_store', 'c3_cctv', 'c4_gate']) { game.handlers().examineMallPoint(point); game.close(); }
    game.close();
    assert.equal(game.state.stage, 'STAGE_5_VENT');
    game.handlers().handleStage5Action('TOOL_WRENCH'); game.close();
    assert.equal(game.state.flags.fanStopped, true);
    game.handlers().handlePushManhole();
    assert.equal(game.state.stage, 'ENDING');
    assert.equal(game.state.endingData.type, 'TRUE');
  } finally { game.restore(); }
});

test('low HP produces NORMAL; exhausted final turns produce BAD END 3', () => {
  const game = harness();
  try {
    game.update('player', (player) => ({ ...player, hp: 5 }));
    game.handlers().handlePushManhole();
    assert.equal(game.state.endingData.type, 'NORMAL');
    game.handlers().handleRestart();
    game.update('stage', 'STAGE_5_VENT');
    game.update('turnLimit', 1);
    const context = { ...game.state, sfx: new Proxy({}, { get: () => () => {} }), getState: () => game.state,
      addLog: () => {}, triggerGlitch: () => {}, openDiceCheck: (_title, _stat, _dc, _success, fail) => fail() };
    for (const field of Object.keys(game.state)) context[`set${field[0].toUpperCase()}${field.slice(1)}`] = (value) => game.update(field, value);
    createStageHandlers(context).handleStage5Action('INT');
    game.close();
    assert.equal(game.state.stage, 'ENDING');
    assert.match(game.state.endingData.title, /BAD END 3/);
  } finally { game.restore(); }
});

test('true ending requires HP 12 and SAN above 10', () => {
  const game = harness();
  try {
    game.update('player', (player) => ({ ...player, hp: 11, san: 11 }));
    game.handlers().handlePushManhole();
    assert.equal(game.state.endingData.type, 'NORMAL');
    game.handlers().handleRestart();
    game.update('player', (player) => ({ ...player, hp: 12, san: 11 }));
    game.handlers().handlePushManhole();
    assert.equal(game.state.endingData.type, 'TRUE');
  } finally { game.restore(); }
});
