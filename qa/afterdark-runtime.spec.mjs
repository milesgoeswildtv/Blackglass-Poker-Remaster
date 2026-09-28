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

  console.log('AFTERDARK_BAD_RESPONSES',JSON.stringify(badResponses));
  expect(pageErrors,'page errors: '+pageErrors.join('\n')).toEqual([]);
  const meaningful=badResponses.filter(x=>!/favicon\.ico(?:$|\?)/i.test(x.url));
  expect(meaningful,'bad responses: '+JSON.stringify(meaningful)).toEqual([]);
  const meaningfulConsole=consoleErrors.filter(x=>!/favicon|source map|Failed to load resource/i.test(x));
  expect(meaningfulConsole,'console errors: '+consoleErrors.join('\n')).toEqual([]);

  await page.screenshot({path:evidenceDir+'/afterdark-editor.png',animations:'disabled',fullPage:false});
});
