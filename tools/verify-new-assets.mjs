import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';
import { ENDINGS, ITEM_DB } from '../src/aquariumEngine.js';
import { SECRET_STORY } from '../src/data/endingDB.js';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(ids => {
  localStorage.setItem('aquarium_2345_endings', JSON.stringify(ids.slice(0,6)));
  localStorage.setItem('aquarium-opening-seen-v1','1');
}, Object.keys(ENDINGS));
await mkdir('artifacts/series-review',{recursive:true});
try {
  await page.goto('http://127.0.0.1:5174');
  assert.match(await page.locator('.intro-image').getAttribute('src'), /scene_intro_aquarium.webp$/);
  await page.locator('.intro-image').evaluate(el => el.decode());
  await page.getByRole('button',{name:'엔딩 도감',exact:false}).click();
  assert.equal(await page.getByRole('button',{name:'최종 진상 파일 잠김',exact:false}).isDisabled(),true);
  await page.getByRole('button',{name:'닫기',exact:true}).click();
  await page.evaluate(ids => { localStorage.setItem('aquarium_2345_endings',JSON.stringify(ids)); window.dispatchEvent(new Event('aquarium-ending-collected')); },Object.keys(ENDINGS));
  await page.getByRole('button',{name:'엔딩 도감',exact:false}).click();
  await page.getByRole('button',{name:'최종 진상 파일 열기',exact:false}).click();
  await page.getByRole('button',{name:'텍스트 바로 보기',exact:true}).click();
  assert.equal(await page.locator('.secret-report > p').last().innerText(),SECRET_STORY.content);
  assert.doesNotMatch(SECRET_STORY.content,/대한민국|해양수산부|방재청/);
  const img = page.locator('.secret-report > img');
  assert.match(await img.getAttribute('src'),/scene_classified_truth.webp$/);
  await img.evaluate(el => el.decode());
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({path:`artifacts/series-review/truth-${width}.png`,fullPage:true});
    await page.getByRole('button',{name:'도감으로 돌아가기',exact:true}).scrollIntoViewIfNeeded();
  }
  await page.getByRole('button',{name:'도감으로 돌아가기',exact:true}).click();
  await page.getByRole('button',{name:'닫기',exact:true}).click();
  await page.setViewportSize({width:1440,height:900});
  for(const [job,id] of [['시설 관리 다이버','WETSUIT'],['수생 임상 수의사','SEDATIVE']]) {
    await page.reload(); await page.getByRole('button',{name:'게임 시작',exact:true}).click();
    await page.getByRole('button',{name:job,exact:false}).click();
    await page.getByRole('button',{name:'이 사원증으로 당직 시작',exact:true}).click();
    const image = page.locator(`.character-sheet img[src="${ITEM_DB[id].img}"]`);
    await image.evaluate(el => el.decode()); assert.ok(await image.evaluate(el => el.naturalWidth > 0));
  }
  await page.evaluate(src => new Promise((resolve,reject) => { const image=new Image(); image.onload=resolve; image.onerror=reject; image.src=src; }),ITEM_DB.HEX_WRENCH.img);
  assert.deepEqual(errors,[]);
  console.log('PASS: intro/truth images, full report text, 6/7 locked and 7/7 unlocked, desktop/mobile truth, wetsuit/sedative inventory, wrench image, no runtime errors');
} finally { await browser.close(); }
