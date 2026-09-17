import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.addInitScript(() => { Math.random = () => 0.999; });
await mkdir('artifacts/game-review', { recursive: true });

const next = async (outside = false) => {
  const backdrop = page.getByTestId('story-backdrop');
  await backdrop.waitFor();
  const nextButton = page.getByRole('button', { name: '>다음', exact: true });
  if (await nextButton.getAttribute('data-typing') === 'typing') {
    const before = await page.getByRole('dialog').boundingBox();
    await nextButton.click();
    await page.waitForFunction(() => document.querySelector('[data-typing]')?.dataset.typing === 'complete');
    const after = await page.getByRole('dialog').boundingBox();
    assert.equal(before.height, after.height, 'Typing reserves the full text height');
  }
  if (outside) await backdrop.click({ position: { x: 8, y: 8 } });
  else await page.getByRole('button', { name: '>다음', exact: true }).click();
};
const checkChoices = async (stage) => {
  await page.waitForFunction(() => !document.querySelector('.game-chassis').classList.contains('invert'));
  for (const [width, height] of [[1920, 1080], [1680, 900], [1440, 900], [1366, 768], [1024, 768], [844, 390], [390, 844], [375, 667], [320, 568]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => {
      const compact = !matchMedia('(min-width: 1401px) and (min-height: 801px)').matches;
      return document.querySelector('.scene-overview').open === !compact;
    });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${stage}: horizontal overflow at ${width}x${height}`);
    await page.screenshot({ path: `artifacts/game-review/choices-${stage}-${width}.png`, fullPage: true });
    for (const button of await page.locator('.game-narrative button').all()) {
      const box = await button.boundingBox();
      assert.ok(box && box.y >= 0 && box.y + box.height <= height, `${stage}: clipped choice ${await button.innerText()} at ${width}x${height} (${JSON.stringify(box)})`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
};
const roll = async (screenshot = false, outside = false) => {
  await page.getByTestId('dice-backdrop').waitFor();
  const idleBox = await page.getByRole('dialog').boundingBox();
  await page.getByRole('button', { name: '운명의 D20 주사위 굴리기' }).click();
  const image = page.getByRole('img', { name: '회전 중...' });
  await image.waitFor();
  assert.match(await image.getAttribute('src'), /item_dice_rolling2\.webp$/);
  await image.evaluate((element) => element.decode());
  assert.equal(await image.evaluate((element) => element.complete && element.naturalWidth > 0), true);
  assert.equal(await image.evaluate((element) => getComputedStyle(element).animationName), 'd20-roll');
  assert.equal((await page.getByRole('dialog').boundingBox()).height, idleBox.height, 'Dice rolling keeps the modal height');
  assert.ok(await page.locator('.dice-canvas').evaluate((canvas) => canvas.width > 0 && canvas.height > 0));
  if (screenshot) await page.screenshot({ path: 'artifacts/game-review/dice-rolling.png' });
  if (outside) await page.getByTestId('dice-backdrop').click({ position: { x: 8, y: 8 } });
  else {
    await page.getByRole('button', { name: '>다음', exact: true }).waitFor();
    assert.equal((await page.getByRole('dialog').boundingBox()).height, idleBox.height, 'Dice result keeps the modal height');
    await page.getByRole('button', { name: '>다음', exact: true }).click();
  }
  await page.getByTestId('dice-backdrop').waitFor({ state: 'hidden' });
};

try {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('.intro-image').evaluate((image) => image.decode());
  await page.screenshot({ path: 'artifacts/game-review/intro-ui.png' });
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await page.getByRole('button', { name: '크게', exact: true }).click();
  await page.getByRole('checkbox', { name: '번쩍이는 이펙트 제거' }).check();
  await page.waitForFunction(() => document.documentElement.dataset.textSize === 'large' && document.documentElement.dataset.effects === 'off');
  assert.equal(await page.locator('#root').evaluate((element) => getComputedStyle(element).fontSize), '18.4px');
  await page.screenshot({ path: 'artifacts/game-review/settings-ui.png' });
  await page.reload();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.effects), 'off');
  await page.getByRole('button', { name: '설정', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: '크게', exact: true }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.getByRole('checkbox', { name: '번쩍이는 이펙트 제거' }).isChecked(), true);
  await page.getByRole('button', { name: '기본', exact: true }).click();
  await page.getByRole('checkbox', { name: '번쩍이는 이펙트 제거' }).uncheck();
  await page.getByRole('button', { name: '확인', exact: true }).click();
  await page.getByRole('button', { name: '도움말', exact: true }).click();
  await page.getByRole('heading', { name: '처음 플레이하는 분께' }).waitFor();
  await page.screenshot({ path: 'artifacts/game-review/help-ui.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '게임 시작', exact: true }).click();
  await page.getByRole('button', { name: '도움말', exact: true }).click();
  await page.getByRole('heading', { name: '처음 플레이하는 분께' }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await page.getByRole('button', { name: '확인', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: /ZIP/ }).count(), 0);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.evaluate(() => document.fonts.check('16px DungGeunMo')), true);
  assert.match(await page.locator('#root').evaluate((element) => getComputedStyle(element).fontFamily), /Segoe UI/);
  assert.match(await page.locator('main p').first().evaluate((element) => getComputedStyle(element).fontFamily), /DungGeunMo/);
  for (const width of [1920, 1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}px`);
    assert.equal(await page.locator('main p').first().evaluate((element) => getComputedStyle(element).fontSize), '18px');
    await page.screenshot({ path: `artifacts/game-review/retro-ui-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const timeline = page.locator('details.group').filter({ hasText: 'ZONE TIMELINE' });
  assert.equal(await timeline.evaluate((element) => element.open), false);
  await timeline.locator('summary').click();
  assert.equal(await timeline.getByText('미탐색 구역').count(), 5);
  await timeline.locator('summary').click();

  await page.getByRole('button', { name: '여성', exact: true }).click();
  await page.getByRole('button', { name: /분석형 엔지니어.*주력/ }).click();
  assert.match(await page.locator('.condition-panel h3').evaluate((element) => getComputedStyle(element).fontFamily), /Segoe UI/);
  await page.screenshot({ path: 'artifacts/game-review/condition-ui.png' });
  await page.getByRole('button', { name: 'D20 주사위 굴려 피로도 확정' }).click();
  await roll(true, true);
  await next();
  await next(true);
  await checkChoices('stage1');
  await page.getByRole('button', { name: /④ 선반 위 쇼핑백/ }).click();
  const reward = page.getByRole('dialog').getByRole('img', { name: '비상 스패너', exact: true });
  await reward.waitFor();
  assert.equal(await reward.evaluate((element) => element.complete && element.naturalWidth > 0), true);
  await page.screenshot({ path: 'artifacts/game-review/wrench-acquired.png' });
  await next(true);
  assert.equal(await page.getByTestId('story-backdrop').count(), 0);
  await page.getByRole('button', { name: /③ 출입문 수동 코크/ }).click(); await next();
  await page.getByRole('button', { name: /⑥ 바닥의 검붉은 얼룩/ }).click(); await next();
  await next(); await next(true);
  await checkChoices('stage2');

  for (const label of [/① 벽면 비상 대피 홈/, /② 주황색 비상 전화기/, /③ 보수용 손수레 트로리/]) {
    await page.getByRole('button', { name: label }).click(); await roll(); await next(true);
  }
  await next();
  await checkChoices('stage3');
  await page.getByRole('button', { name: /① 종합 노선도 역명판/ }).click(); await roll();
  await page.getByRole('img', { name: '왜곡된 노선도' }).waitFor(); await next(true);
  await page.getByRole('button', { name: /④ 역무원 고객안내센터/ }).click(); await next();
  await page.getByRole('button', { name: /경로 B/ }).click();
  await checkChoices('stage4');
  for (const label of [/① 24시 편의점 수색/, /③ CCTV 모니터실/, /④ 개찰구 교통카드 단말기/]) {
    await page.getByRole('button', { name: label }).click();
    if (await page.getByTestId('dice-backdrop').count()) await roll();
    await next(true);
  }
  await next();
  await checkChoices('stage5');
  await page.getByRole('button', { name: /도구 특전/ }).click(); await next(true);
  await page.getByRole('button', { name: /최종 판정 DC 11/ }).click(); await roll();
  await page.getByRole('heading', { name: /TRUE END/ }).waitFor();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.ending-copy')).opacity === '1');
  const finishEnding = page.getByRole('button', { name: '텍스트 바로 보기' });
  if (await finishEnding.count()) await finishEnding.click();
  await page.locator('.ending-credits summary').click();
  await page.getByText('게임 구현', { exact: true }).waitFor();
  await page.locator('.ending-credits summary').click();
  assert.equal(await page.locator('.character-sheet').count(), 0);
  assert.equal(await page.locator('.game-console').count(), 0);
  for (const width of [1920, 1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('.ending-card').evaluate((element) => element.decode());
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Ending without overflow at ${width}px`);
    assert.ok((await page.locator('.ending-card').boundingBox()).width >= (width >= 1440 ? 380 : 240));
    await page.screenshot({ path: `artifacts/game-review/ending-ui-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'artifacts/game-review/true-ending.png' });
  assert.deepEqual(errors, []);
  console.log('PASS: font, spoiler accordion, visible dice animation, backdrop advance, rewards, Stage 0→5→TRUE ending, zero page errors');

  await page.getByRole('button', { name: '처음부터 다시 시도' }).click();
  await page.getByRole('button', { name: '게임 시작', exact: true }).click();
  await page.getByRole('button', { name: /분석형 엔지니어.*주력/ }).click();
  await page.getByRole('button', { name: 'D20 주사위 굴려 피로도 확정' }).click(); await roll(); await next(); await next();
  for (const label of [/③ 출입문 수동 코크/, /⑥ 바닥의 검붉은 얼룩/, /① 바닥의 롱패딩/]) {
    await page.getByRole('button', { name: label }).click(); await next(true);
  }
  await next(true);
  await page.getByRole('heading', { name: /BAD END 1/ }).waitFor();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.ending-copy')).opacity === '1');
  if (await finishEnding.count()) await finishEnding.click();
  await page.screenshot({ path: 'artifacts/game-review/bad-ending-ui.png' });
  console.log('PASS: restart and no-wrench BAD END 1 via actual browser clicks');

  const reachPlatform = async () => {
    await page.getByRole('button', { name: '처음부터 다시 시도' }).click();
    await page.getByRole('button', { name: '게임 시작', exact: true }).click();
    await page.getByRole('button', { name: /분석형 엔지니어.*주력/ }).click();
    await page.getByRole('button', { name: 'D20 주사위 굴려 피로도 확정' }).click(); await roll(); await next(); await next();
    for (const label of [/④ 선반 위 쇼핑백/, /③ 출입문 수동 코크/, /⑥ 바닥의 검붉은 얼룩/]) {
      await page.getByRole('button', { name: label }).click(); await next();
    }
    await next(); await next();
    for (const label of [/① 벽면 비상 대피 홈/, /② 주황색 비상 전화기/, /④ 750V/]) {
      await page.getByRole('button', { name: label }).click(); await roll(); await next();
    }
    await next();
  };
  await reachPlatform();
  await page.getByRole('button', { name: /경로 A/ }).click(); await next(true);
  await page.getByRole('heading', { name: /BAD END 2/ }).waitFor();
  console.log('PASS: fake exit trap → BAD END 2');

  await reachPlatform();
  await page.getByRole('button', { name: /경로 B/ }).click();
  for (const label of [/① 24시 편의점 수색/, /③ CCTV 모니터실/, /④ 개찰구 교통카드 단말기/]) {
    await page.getByRole('button', { name: label }).click();
    if (await page.getByTestId('dice-backdrop').count()) await roll();
    await next();
  }
  await next();
  await page.evaluate(() => { Math.random = () => 0; });
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByRole('button', { name: /INT 판정/ }).click(); await roll(); await next(true);
    assert.equal(await page.getByTestId('story-backdrop').count(), 0);
  }
  await page.getByRole('heading', { name: /BAD END 3/ }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: failed final checks return to action panel, countdown → BAD END 3, zero page errors');
  for (const [width, height] of [[375, 667], [844, 390], [320, 568]]) {
    const accessiblePage = await browser.newPage({ viewport: { width, height } });
    accessiblePage.on('pageerror', (error) => errors.push(error.message));
    await accessiblePage.addInitScript(() => {
      Math.random = () => .999;
      localStorage.setItem('subway-settings-v1', JSON.stringify({ textSize: 'large', disableEffects: true }));
    });
    await accessiblePage.goto('http://127.0.0.1:4173/');
    await accessiblePage.getByRole('button', { name: '게임 시작', exact: true }).click();
    await accessiblePage.getByRole('button', { name: /분석형 엔지니어.*주력/ }).click();
    assert.equal(await accessiblePage.locator('.condition-panel p').evaluate((element) => getComputedStyle(element).fontSize), '21px');
    await accessiblePage.getByRole('button', { name: 'D20 주사위 굴려 피로도 확정' }).click();
    const before = await accessiblePage.getByRole('dialog').boundingBox();
    await accessiblePage.getByRole('button', { name: '운명의 D20 주사위 굴리기' }).click();
    const rollingImage = accessiblePage.getByRole('img', { name: '회전 중...' });
    await rollingImage.waitFor();
    assert.equal(await rollingImage.evaluate((image) => getComputedStyle(image).animationName), 'none');
    assert.equal((await accessiblePage.getByRole('dialog').boundingBox()).height, before.height);
    await accessiblePage.getByRole('button', { name: '>다음', exact: true }).waitFor();
    assert.equal((await accessiblePage.getByRole('dialog').boundingBox()).height, before.height);
    const buttonBox = await accessiblePage.getByRole('button', { name: '>다음', exact: true }).boundingBox();
    assert.ok(buttonBox.y + buttonBox.height <= height, `Accessible dice button inside ${width}x${height}`);
    await accessiblePage.screenshot({ path: `artifacts/game-review/dice-accessible-${width}.png` });
    await accessiblePage.close();
  }
  assert.deepEqual(errors, []);
  console.log('PASS: intro/header settings and help, persisted preferences, 9 viewport sizes across Stage 1–5, fixed dice geometry, canvas, typing skip, large text and effects off on mobile/landscape');
} finally { await browser.close(); }
