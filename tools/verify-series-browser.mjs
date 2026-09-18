import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
page.setDefaultTimeout(10000);
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  Math.random = () => .999;
  if (sessionStorage.getItem('series-review-initialized') === '1') return;
  sessionStorage.setItem('series-review-initialized', '1');
  localStorage.removeItem('aquarium-settings-v1');
  localStorage.removeItem('aquarium-opening-seen-v1');
  localStorage.removeItem('aquarium_2345_endings');
  localStorage.removeItem('subway-settings-v1');
  localStorage.removeItem('subway_0037_endings');
});
await mkdir('artifacts/series-review', { recursive: true });
const choose = name => page.getByRole('button', { name, exact: false }).click();
const story = async (expectedScene = null) => {
  const backdrop = page.getByTestId('story-backdrop');
  await backdrop.waitFor();
  if (expectedScene) assert.ok((await backdrop.locator('img').first().getAttribute('src')).includes(expectedScene));
  const button = backdrop.getByRole('button', { name: '>다음', exact: true });
  if (await button.getAttribute('data-typing') === 'typing') await button.click();
  await button.click(); await backdrop.waitFor({ state: 'hidden' });
};
const roll = async () => {
  const backdrop = page.getByTestId('dice-backdrop');
  await backdrop.waitFor();
  await backdrop.getByRole('button', { name: '운명의 D20 주사위 굴리기' }).click();
  await backdrop.getByRole('button', { name: '>다음', exact: true }).click();
  await backdrop.waitFor({ state: 'hidden' });
};
const inspect = async (name, dice = false, expectedScene = null) => {
  await choose(name);
  if (dice) await roll();
  const backdrop = page.getByTestId('story-backdrop');
  await backdrop.waitFor();
  if (expectedScene) assert.ok((await backdrop.locator('img').first().getAttribute('src')).includes(expectedScene));
  await story();
};
const start = async (job = '대형 어류 아쿠아리스트') => {
  await choose('게임 시작');
  if (await page.getByRole('button', { name: '인트로 건너뛰기' }).isVisible()) await choose('인트로 건너뛰기');
  await choose(job); await choose('이 사원증으로 당직 시작');
  await choose('D20 주사위 굴려 피로도 확정'); await roll();
};
const advance = async (dice = false, expectedScene = null) => { await choose('위기 결단 & 돌파'); if (dice) await roll(); if (expectedScene) await story(expectedScene); };
const images = async () => {
  await page.locator('img').evaluateAll(els => Promise.all(els.map(el => el.decode())));
  assert.ok(await page.locator('img').evaluateAll(els => els.every(el => el.naturalWidth > 0)));
};
try {
  await page.goto('http://127.0.0.1:5174');
  await images();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `artifacts/series-review/intro-${width}.png` });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await choose('설정'); await choose('크게');
  await page.getByLabel('번쩍이는 이펙트 제거').check();
  await page.getByLabel('주사위 연출 생략').check();
  await choose('확인');
  assert.equal(await page.locator('html').getAttribute('data-text-size'), 'large');
  await choose('도움말'); await page.getByText('가방은 5칸', { exact: false }).waitFor(); await choose('확인');
  await choose('설정'); await choose('기본'); await choose('확인');
  await choose('게임 시작');
  await page.getByRole('heading', { name: '야간 당직', exact: true }).waitFor();
  await choose('인트로 건너뛰기');
  await page.getByText('TEXTLOG SURVIVAL ENGINE', { exact: false }).waitFor();
  await choose('여성'); await choose('대형 어류 아쿠아리스트');
  await page.getByRole('heading', { name: '당직 전 사원증 확인' }).waitFor();
  await images(); await choose('이 사원증으로 당직 시작');
  await choose('D20 주사위 굴려 피로도 확정'); await roll();
  assert.equal(await page.locator('.scene-description-static').isVisible(), true, 'desktop description remains open');
  assert.ok((await page.locator('.scene-overview-content > img').getAttribute('src')).includes('scene_stage1_jellyfish.png'));
  for (const width of [1440, 1024, 844, 390, 320]) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${width}`);
    assert.equal(await page.locator('.game-columns').evaluate(el => getComputedStyle(el).display), width <= 1200 ? 'grid' : 'flex');
    if (width < 701) {
      assert.equal(await page.locator('.header-controls').evaluate(el => getComputedStyle(el.parentElement).display), 'grid');
      assert.equal(await page.locator('.character-sheet .auxiliary-panel').evaluate(el => el.open), false);
    }
    await images(); await page.screenshot({ path: `artifacts/series-review/stage1-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await choose('현재 구역 힌트'); await choose('확인');
  const downloaded = page.waitForEvent('download'); await choose('기록 저장'); assert.equal((await downloaded).suggestedFilename(),'aquarium-play-log.json');
  for (const ending of ['TRUE','BAD_1','BAD_2','BAD_3','BAD_4','NORMAL','GOOD']) {
    await page.reload(); await start(ending === 'BAD_1' ? '수생 임상 수의사' : undefined);
    await inspect('대형 아치형 유리벽', false, 'scene_stage1_jellyfish.png'); await inspect('안내 데스크 분전반'); await inspect('관람객 분실물 바구니');
    if (ending === 'BAD_1') await choose('위기 결단 & 돌파');
    else {
      await advance(false, 'scene_stage1_blackout_shock.png');
      await inspect(ending === 'NORMAL' ? '비상 방재 사물함' : '폭포수 아래 정비 카트', false, 'scene_stage2_bulkhead.png');
      await inspect('천장 케이블 트레이', false, 'scene_stage2_bulkhead_closing.png'); await inspect('닫혀가는 수밀문 틈');
      if (ending === 'BAD_2') await page.evaluate(() => { Math.random = () => 0; });
      await choose('위기 결단 & 돌파'); await roll();
      if (ending !== 'BAD_2') {
        await inspect(ending === 'NORMAL' ? '방한복 건조 랙' : '사료 해동 작업대');
        await inspect('비닐 천이 덮인 카트'); await inspect('탈출용 비상 도어 래치');
        if (ending === 'BAD_3') await page.evaluate(() => { Math.random = () => 0; });
        await choose('위기 결단 & 돌파'); await roll();
        if (ending !== 'BAD_3') {
          if (ending === 'TRUE') await inspect('방재 장비 보관함', true); else await inspect('수면 위 배선 트레이');
          await inspect('중앙 전력 제어반'); await inspect('고압 증기 바이패스 밸브');
          await advance();
          if (ending === 'BAD_4') await page.evaluate(() => { Math.random = () => 0; });
          await choose('돔 아크릴 파쇄'); await roll();
        }
      }
    }
    await page.locator('.ending-screen.is-revealed').waitFor(); await images();
    assert.ok((await page.locator('.ending-label').innerText()).includes(ending.startsWith('BAD') ? 'BAD END' : ending === 'TRUE' ? 'TRUE CLEAR' : `${ending} END`));
    await page.screenshot({ path: `artifacts/series-review/ending-${ending}.png` });
    await choose('처음부터 다시 시도'); await page.getByRole('heading', { name: '아쿠아리움: 심해의 균열' }).waitFor();
  }
  await choose('엔딩 도감'); await page.getByRole('heading', { name: '엔딩 도감 · 7/7', exact: true }).waitFor();
  assert.equal(await page.locator('.collection-grid img').count(),7);
  await choose('최종 진상 파일 열기'); await choose('도감으로 돌아가기'); await page.getByRole('button',{name:'닫기',exact:true}).click();
  const storage = await page.evaluate(() => ({ subwayEndings: localStorage.getItem('subway_0037_endings'), subwaySettings: localStorage.getItem('subway-settings-v1'), aquariumSettings: JSON.parse(localStorage.getItem('aquarium-settings-v1')), endings: JSON.parse(localStorage.getItem('aquarium_2345_endings')) }));
  assert.equal(storage.subwayEndings, null); assert.equal(storage.subwaySettings, null); assert.equal(storage.aquariumSettings.textSize, 'normal'); assert.equal(storage.endings.length,7);
  assert.deepEqual(errors,[]);
  console.log('PASS: series intro/opening/header/footer, settings/help/hints, character preview, story/dice presentation, responsive screens, all seven endings/collection, restart, log download, isolated storage; no runtime errors');
} finally { await browser.close(); }
