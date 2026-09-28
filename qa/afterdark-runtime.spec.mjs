import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const evidenceDir='artifacts/browser-qa-afterdark';

test.beforeEach(async()=>{await fs.mkdir(evidenceDir,{recursive:true})});

test('Afterdark editor renders controls, Poker preview, and swaps skin background',async({page})=>{
  const pageErrors=[],consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});

  await page.setViewportSize({width:390,height:844});
  await page.goto('/?qa=afterdark#/design-lab/afterdark');

  await expect(page.getByText('CRASHOUT POKER VISUAL EDITOR')).toBeVisible();
  for(const label of ['LAYERS','ASSETS','SKIN','UNDO','REDO','EDIT'])await expect(page.getByText(label,{exact:true})).toBeVisible();

  const frame=page.frameLocator('iframe');
  await expect(frame.locator('.homeShell')).toBeVisible();
  await expect(frame.locator('.homeFrame')).toBeVisible();
  await expect(frame.getByRole('heading',{name:'CRASHOUT POKER'})).toBeVisible();

  const before=await frame.locator('.homeShell').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);

  await page.getByText('SKIN',{exact:true}).click();
  await expect(page.getByText('SKIN + BACKGROUND')).toBeVisible();
  const magenta=page.getByRole('button',{name:/Magenta/i});
  await expect(magenta).toBeVisible();
  await magenta.click();

  await expect(page.locator('.adStatus')).toContainText(/Magenta/i);
  await page.waitForTimeout(250);

  const debug=await frame.locator('.homeShell').evaluate(el=>({inlineHome:el.style.getPropertyValue('--home-bg'),inlinePreview:el.style.getPropertyValue('--afterdark-preview-bg'),inlineMobile:el.style.getPropertyValue('--skin-lobby-bg-mobile'),computedHome:getComputedStyle(el).getPropertyValue('--home-bg'),computedPreview:getComputedStyle(el).getPropertyValue('--afterdark-preview-bg'),computedMobile:getComputedStyle(el).getPropertyValue('--skin-lobby-bg-mobile'),pseudo:getComputedStyle(el,'::before').backgroundImage}));
  console.log('AFTERDARK_BG_DEBUG',JSON.stringify(debug));
  console.log('AFTERDARK_DOC_DEBUG',await page.evaluate(()=>localStorage.getItem('crashout.afterdark.document.v2')));
  const after=await frame.locator('.homeShell').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
  expect(after).not.toBe(before);
  expect(after.toLowerCase()).toContain('magenta');

  expect(pageErrors,'page errors: '+pageErrors.join('\n')).toEqual([]);
  expect(consoleErrors.filter(x=>!/favicon|source map/i.test(x)),'console errors: '+consoleErrors.join('\n')).toEqual([]);

  await page.screenshot({path:evidenceDir+'/afterdark-editor.png',animations:'disabled',fullPage:false});
});
