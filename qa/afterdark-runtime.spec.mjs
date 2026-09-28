import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const evidenceDir='artifacts/browser-qa-afterdark';

test.beforeEach(async()=>{await fs.mkdir(evidenceDir,{recursive:true})});

test('Afterdark editor renders controls, Poker preview, and swaps skin background',async({page})=>{
  const pageErrors=[],consoleErrors=[],badResponses=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400)badResponses.push({status:r.status(),url:r.url()})});

  await page.route('**/api/**',async route=>{
    const req=route.request(),p=new URL(req.url()).pathname;
    if(p==='/api/auth/me')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({canonicalAccountId:'afterdark-qa',identity:{provider:'discord',displayName:'Afterdark QA',username:'afterdarkqa',avatarUrl:''},account:{equipped:'default',inventory:['default'],notifications:{},links:{},access:{canHost:true,permanentHost:false,hostCredits:3,invites:[]}}})});
    if(p==='/api/access/key/redeem')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({redeemed:false})});
    return route.fulfill({status:200,contentType:'application/json',body:'{}'});
  });
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

  const after=await frame.locator('.homeShell').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
  expect(after).not.toBe(before);
  expect(after.toLowerCase()).toContain('magenta');

  await page.getByText('ASSETS',{exact:true}).click();
  const firstAsset=page.locator('.adAssetGrid button').first();
  await expect(firstAsset).toBeVisible();
  await firstAsset.click();
  await expect(page.getByRole('button',{name:'Delete selected asset'})).toBeVisible();
  await expect(frame.locator('#afterdark-custom-root [data-afterdark-id]')).toHaveCount(1);

  const assetBefore=await frame.locator('#afterdark-custom-root [data-afterdark-id]').boundingBox();
  const selectionBefore=await page.locator('.adSelection').boundingBox();
  const iframeBox=await page.locator('iframe').boundingBox();
  expect(iframeBox).toBeTruthy();
  await page.mouse.move(iframeBox.x+iframeBox.width/2,iframeBox.y+iframeBox.height/2);
  await page.mouse.wheel(0,240);
  await page.waitForTimeout(180);
  const assetAfter=await frame.locator('#afterdark-custom-root [data-afterdark-id]').boundingBox();
  const selectionAfter=await page.locator('.adSelection').boundingBox();
  expect(assetBefore&&assetAfter&&selectionBefore&&selectionAfter).toBeTruthy();
  expect(assetAfter.y).toBeLessThan(assetBefore.y-40);
  expect(Math.abs((selectionAfter.y-selectionBefore.y)-(assetAfter.y-assetBefore.y))).toBeLessThan(4);
  expect(await frame.locator('#afterdark-custom-root').evaluate(el=>el.parentElement?.classList.contains('homeFrame'))).toBe(true);
  await page.mouse.wheel(0,-240);
  await page.waitForTimeout(180);
  await page.getByRole('button',{name:'Delete selected asset'}).click();
  await expect(frame.locator('#afterdark-custom-root [data-afterdark-id]')).toHaveCount(0);
  await expect(page.getByRole('button',{name:/UNDO/i})).toBeEnabled();

  await page.getByText('ASSETS',{exact:true}).click();
  await page.getByRole('button',{name:/ADD TEXT/i}).click();
  await expect(frame.locator('#afterdark-custom-root [data-afterdark-kind="text"]')).toHaveCount(1);
  await expect(page.locator('.adTextEditor textarea')).toBeVisible();
  await page.locator('.adTextEditor textarea').fill('TABLE LIMIT');
  await expect(frame.locator('[data-afterdark-text]')).toHaveText('TABLE LIMIT');
  await page.getByRole('button',{name:'Delete selected asset'}).click();
  await expect(frame.locator('#afterdark-custom-root [data-afterdark-kind="text"]')).toHaveCount(0);

  console.log('AFTERDARK_BAD_RESPONSES',JSON.stringify(badResponses));
  expect(pageErrors,'page errors: '+pageErrors.join('\n')).toEqual([]);
  const meaningful=badResponses.filter(x=>!/favicon\.ico(?:$|\?)/i.test(x.url));
  expect(meaningful,'bad responses: '+JSON.stringify(meaningful)).toEqual([]);
  const meaningfulConsole=consoleErrors.filter(x=>!/favicon|source map|Failed to load resource/i.test(x));
  expect(meaningfulConsole,'console errors: '+consoleErrors.join('\n')).toEqual([]);

  await page.screenshot({path:evidenceDir+'/afterdark-editor.png',animations:'disabled',fullPage:false});
});
