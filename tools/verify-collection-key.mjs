import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const production = process.argv.includes('--production');
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const url = `http://127.0.0.1:${production ? 4174 : 4173}/`;
const startGame = async (target) => {
  await target.getByRole('button', { name: '게임 시작', exact: true }).click();
  if (!await target.locator('.opening-screen').count()) {
    await target.getByRole('heading', { name: '막차에 오른 당신은 누구입니까?', exact: true }).waitFor();
    return;
  }
  await target.getByRole('heading', { name: '막차', exact: true }).waitFor();
  assert.match(await target.locator('.opening-image').getAttribute('src'), /scene_prologue_train\.webp$/);
  await target.locator('.opening-image').evaluate((image) => image.decode());
  while (await target.locator('.opening-screen').count()) {
    const action = target.locator('.opening-next');
    const label = await action.innerText();
    await action.click();
    if (label === '텍스트 바로 보기') {
      await target.waitForFunction(() => document.querySelector('.opening-next')?.textContent?.trim() !== '텍스트 바로 보기');
    }
  }
};
try {
  await page.goto(url);
  assert.equal(await page.getByRole('button', { name: '엔딩 도감 · 잠김', exact: true }).isDisabled(), true);
  await page.keyboard.press('Control+Shift+F10');
  if (production) {
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await page.getByRole('button', { name: '엔딩 도감 · 잠김', exact: true }).isDisabled(), true);
    assert.equal(await page.evaluate(() => localStorage.getItem('subway_0037_endings')), null);
  } else {
    await page.getByRole('heading', { name: '엔딩 도감 · 6/6' }).waitFor();
    assert.equal(await page.locator('.collection-grid img').count(), 6);
    assert.equal(await page.getByRole('button', { name: /히든 후일담 열기/ }).isEnabled(), true);
    await page.keyboard.press('Escape');
    await page.reload();
    await page.getByRole('button', { name: '엔딩 도감', exact: true }).click();
    assert.equal(await page.locator('.collection-grid img').count(), 6);
  }
  const skippedOpening = await context.newPage();
  await skippedOpening.goto(url);
  await skippedOpening.getByRole('button', { name: '게임 시작', exact: true }).click();
  await skippedOpening.getByRole('heading', { name: '막차', exact: true }).waitFor();
  await skippedOpening.screenshot({ path: 'artifacts/game-review/opening-sequence.png' });
  await skippedOpening.getByRole('button', { name: '인트로 건너뛰기', exact: true }).click();
  await skippedOpening.getByRole('heading', { name: '막차에 오른 당신은 누구입니까?', exact: true }).waitFor();
  assert.equal(await skippedOpening.evaluate(() => localStorage.getItem('subway-opening-seen-v1')), '1');
  await skippedOpening.getByRole('button', { name: /분석형 엔지니어/ }).click();
  await skippedOpening.getByRole('dialog').waitFor();
  assert.equal(await skippedOpening.locator('.preview-item-tag').count(), 2);
  assert.equal(await skippedOpening.locator('.preview-items img').count(), 0);
  await skippedOpening.getByRole('button', { name: '다시 선택', exact: true }).click();
  const repeatRun = await context.newPage();
  await repeatRun.goto(url);
  await repeatRun.getByRole('button', { name: '게임 시작', exact: true }).click();
  await repeatRun.getByRole('heading', { name: '막차에 오른 당신은 누구입니까?', exact: true }).waitFor();
  assert.equal(await repeatRun.locator('.opening-screen').count(), 0);
  const fresh = await browser.newPage();
  await fresh.goto(url);
  await startGame(fresh);
  await fresh.getByRole('button', { name: '현재 구역 힌트', exact: true }).click();
  await fresh.getByRole('heading', { name: '현재 구역 힌트', exact: true }).waitFor();
  await fresh.keyboard.press('Escape');
  if (!production) {
    await fresh.keyboard.press('Control+Shift+F10');
    await fresh.getByRole('heading', { name: '엔딩 도감 · 6/6' }).waitFor();
  }
  const saved = await browser.newPage();
  await saved.goto(url);
  await saved.evaluate(() => localStorage.setItem('subway_0037_endings', '["BAD_1"]'));
  await saved.reload();
  await saved.getByRole('button', { name: '엔딩 도감', exact: true }).click();
  assert.equal(await saved.locator('.collection-grid img').count(), 1);
  assert.equal(await saved.getByRole('button', { name: /히든 후일담 잠김/ }).isDisabled(), true);
  assert.deepEqual(errors, []);
  console.log(`PASS: ${production ? 'production ignores cheat' : 'developer key collects all and persists'}; zero-ending lock, two-scene opening skip, repeat-run skip, stage hint, single-ending unlock`);
} finally { await browser.close(); }
