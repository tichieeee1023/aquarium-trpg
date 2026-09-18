import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.addInitScript(() => {
  localStorage.removeItem('aquarium_2345_endings');
  localStorage.removeItem('aquarium-opening-seen-v1');
  localStorage.removeItem('aquarium-settings-v1');
});

try {
  await page.goto('http://127.0.0.1:5174/');
  const settings = page.getByRole('button', { name: '설정', exact: true });
  await settings.focus();
  await settings.click();
  await page.getByRole('heading', { name: '설정', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), '닫기');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), '설정');

  await page.keyboard.press('Control+Shift+F10');
  await page.getByRole('heading', { name: '엔딩 도감 · 7/7', exact: true }).waitFor();
  assert.equal(await page.locator('.collection-grid img').count(), 7);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: '게임 시작', exact: true }).click();
  await page.getByRole('button', { name: '인트로 건너뛰기', exact: true }).click();
  await page.getByRole('button', { name: '시설 관리 다이버', exact: false }).click();
  await page.getByRole('button', { name: '이 사원증으로 당직 시작', exact: true }).click();
  assert.equal(await page.locator('.inventory-grid > *').count(), 5, 'five inventory slots are shown');

  const sound = page.getByRole('button', { name: '사운드 끄기', exact: true });
  await sound.click();
  await page.getByRole('button', { name: '사운드 켜기', exact: true }).waitFor();
  await page.getByRole('button', { name: '현재 구역 힌트', exact: true }).click();
  await page.getByRole('heading', { name: '현재 구역 힌트', exact: true }).waitFor();
  await page.getByText('오늘의 피로', { exact: false }).waitFor();
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await page.getByRole('button', { name: '크게', exact: true }).click();
  await page.getByRole('button', { name: '확인', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('data-text-size'), 'large');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await page.locator('.character-sheet .auxiliary-panel').evaluate((panel) => panel.open), false);
  assert.deepEqual(errors, []);
  console.log('PASS: developer collection shortcut, focus return, five slots, sound label, hint, large-text mobile layout, no runtime errors');
} finally {
  await browser.close();
}
