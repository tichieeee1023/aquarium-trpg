import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
try {
  await page.goto('http://127.0.0.1:4174/');
  assert.equal(await page.getByRole('button', { name: '엔딩 도감 · 잠김', exact: true }).isDisabled(), true);
  await page.keyboard.press('Control+Shift+F10');
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.getByRole('button', { name: '엔딩 도감 · 잠김', exact: true }).isDisabled(), true);
  assert.equal(await page.evaluate(() => localStorage.getItem('aquarium_2345_endings')), null);
  console.log('PASS: production build ignores the developer collection shortcut');
} finally {
  await browser.close();
}
