import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { SCENE_ASSETS, DICE_ASSETS } from '../src/data/assetDB.js';

const dataDir = new URL('../src/data/', import.meta.url);
const files = (await readdir(dataDir)).sort();
assert.deepEqual(files, ['assetDB.js', 'endingDB.js', 'surveyDB.js']);

const visualData = await readFile(new URL('../src/data/assetDB.js', import.meta.url), 'utf8');
const surveyData = await readFile(new URL('../src/data/surveyDB.js', import.meta.url), 'utf8');
assert.doesNotMatch(`${visualData}\n${surveyData}`, /지하철|전동차|승강장|7호차|환기탑|신도림|subway/i);
assert.ok(SCENE_ASSETS.INTRO.src.includes('scene_intro_aquarium'));
assert.ok(SCENE_ASSETS.BLACKOUT.src.includes('scene_stage1_blackout_shock'));
assert.ok(SCENE_ASSETS.CLASSIFIED_REPORT.src.includes('scene_classified_truth'));
assert.equal(Object.keys(DICE_ASSETS).length, 6);

console.log('PASS: aquarium data folder contains only aquarium visual, survey, and ending records; retired subway gameplay data is absent');
