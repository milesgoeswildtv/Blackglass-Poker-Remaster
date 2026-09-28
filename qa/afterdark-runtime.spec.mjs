import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const evidenceDir='artifacts/browser-qa-afterdark';

test.beforeEach(async()=>{await fs.mkdir(evidenceDir,{recursive:true})});

test('Afterdark editor renders controls, Poker preview, and swaps skin background',async({page})=>{
  test.setTimeout(90000);
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

  await page.getByRole('button',{name:'SITE VIEW'}).click();
  await expect(page.locator('.adTop')).toBeHidden();
  await expect(page.locator('.adDock')).toBeHidden();
  const realVp=await page.evaluate(()=>({width:Math.round(visualViewport?.width||innerWidth),height:Math.round(visualViewport?.height||innerHeight)}));
  let liveBox=await page.locator('iframe').boundingBox();
  expect(liveBox).toBeTruthy();
  expect(Math.abs(liveBox.width-realVp.width)).toBeLessThan(2);
  expect(Math.abs(liveBox.height-realVp.height)).toBeLessThan(2);
  await expect(page.getByRole('button',{name:'Reset zoom to 100 percent'})).toHaveText('100%');
  await page.getByRole('button',{name:'Zoom in'}).click();
  await expect(page.getByRole('button',{name:'Reset zoom to 100 percent'})).toHaveText('110%');
  liveBox=await page.locator('iframe').boundingBox();
  expect(liveBox.width).toBeGreaterThan(realVp.width*1.09);
  await page.locator('.adWorkspace').evaluate(el=>el.scrollTo({top:60,left:20}));
  await page.getByText('RESET',{exact:true}).click();
  await expect(page.getByRole('button',{name:'Reset zoom to 100 percent'})).toHaveText('100%');
  await page.waitForTimeout(50);
  expect(await page.locator('.adWorkspace').evaluate(el=>({top:el.scrollTop,left:el.scrollLeft}))).toEqual({top:0,left:0});
  liveBox=await page.locator('iframe').boundingBox();
  expect(Math.abs(liveBox.width-realVp.width)).toBeLessThan(2);
  await page.getByRole('button',{name:'EDIT',exact:true}).click();
  await expect(page.locator('.adTop')).toBeVisible();
  await expect(page.locator('.adDock')).toBeVisible();

  const frame=page.frameLocator('iframe');
  await expect(frame.locator('.homeShell')).toBeVisible();
  await expect(frame.locator('.homeFrame')).toBeVisible();
  await expect(frame.getByRole('heading',{name:'CRASHOUT POKER'})).toBeVisible();

  const defaultBg=await frame.locator('.homeShell').evaluate(el=>getComputedStyle(el,'::before').backgroundImage);
  const defaultLogo=await frame.locator('.homeBrand h1').evaluate(el=>getComputedStyle(el).backgroundImage);
  const defaultCreate=await frame.locator('.homeActionPrimary').first().evaluate(el=>getComputedStyle(el).backgroundImage);
  const defaultJoin=await frame.locator('.homeActionPrimary').nth(1).evaluate(el=>getComputedStyle(el).backgroundImage);
  const defaultHost=await frame.locator('.homeHostIdentity').evaluate(el=>getComputedStyle(el).backgroundImage);
  const defaultUtility=await frame.locator('.homeUtilityEntry button').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(defaultBg.toLowerCase()).toContain('default__lobby-bg.png');
  expect(defaultLogo.toLowerCase()).toContain('default__logo.png');
  expect(defaultCreate.toLowerCase()).toContain('default__menu__create-panel.png');
  expect(defaultJoin.toLowerCase()).toContain('default__menu__join-panel.png');
  expect(defaultHost.toLowerCase()).toContain('default__menu__host-bar.png');
  expect(defaultUtility.toLowerCase()).toContain('default__menu__utility-badge.png');

  const before=defaultBg;

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
  const tableGroup=page.locator('.adAssetGroup').filter({has:page.getByRole('heading',{name:'TABLE'})});
  const tableAsset=tableGroup.locator('button').first();
  await expect(tableAsset).toBeVisible();
  await tableAsset.click();
  await expect(page.getByRole('button',{name:'Delete selected asset'})).toBeVisible();
  await expect(frame.locator('#afterdark-custom-root [data-afterdark-id]')).toHaveCount(1);
  const customImg=frame.locator('#afterdark-custom-root [data-afterdark-id] img');
  await expect(customImg).toHaveAttribute('src',/magenta__table/i);
  const linkedBefore=await frame.locator('#afterdark-custom-root [data-afterdark-id]').boundingBox();

  await page.getByText('SKIN',{exact:true}).click();
  const crimson=page.getByRole('button',{name:/Crimson/i});
  await expect(crimson).toBeVisible();
  await crimson.click();
  await expect(customImg).toHaveAttribute('src',/crimson__table/i);
  const linkedAfter=await frame.locator('#afterdark-custom-root [data-afterdark-id]').boundingBox();
  expect(linkedBefore&&linkedAfter).toBeTruthy();
  expect(Math.abs(linkedAfter.x-linkedBefore.x)).toBeLessThan(1);
  expect(Math.abs(linkedAfter.y-linkedBefore.y)).toBeLessThan(1);
  expect(Math.abs(linkedAfter.width-linkedBefore.width)).toBeLessThan(1);
  expect(Math.abs(linkedAfter.height-linkedBefore.height)).toBeLessThan(1);

  const assetBefore=linkedAfter;
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

  const surfaceTabs=page.locator('.adSurfaceTabs');
  await expect(surfaceTabs).toBeVisible();
  for(const label of ['ENTRY','HOME','INVITE','PRE','PLAY','MTT','BREAK','MOVE','RESULT'])await expect(surfaceTabs.getByText(label,{exact:true})).toBeVisible();

  await surfaceTabs.getByText('PRE',{exact:true}).click();
  await expect(frame.locator('.pregameTablePage')).toBeVisible();
  expect(await frame.locator('body').evaluate(el=>getComputedStyle(el).overflow)).toBe('hidden');
  await page.getByText('ASSETS',{exact:true}).click();
  await page.getByRole('button',{name:/ADD TEXT/i}).click();
  await page.locator('.adTextEditor textarea').fill('PRE ONLY');
  await expect(frame.locator('[data-afterdark-text]')).toHaveText('PRE ONLY');

  await surfaceTabs.getByText('PLAY',{exact:true}).click();
  await expect(frame.locator('.gameplayV3Page')).toBeVisible();
  expect(await frame.locator('body').evaluate(el=>getComputedStyle(el).overflow)).toBe('hidden');
  await expect(frame.locator('[data-afterdark-text]')).toHaveCount(0);

  await surfaceTabs.getByText('HOME',{exact:true}).click();
  await expect(frame.locator('.homeShell')).toBeVisible();
  expect(await frame.locator('body').evaluate(el=>getComputedStyle(el).overflow)).not.toBe('hidden');
  await expect(frame.locator('[data-afterdark-text]')).toHaveCount(0);

  await surfaceTabs.getByText('PRE',{exact:true}).click();
  await expect(frame.locator('.pregameTablePage')).toBeVisible();
  await expect(frame.locator('[data-afterdark-text]')).toHaveText('PRE ONLY');

  for(const [tab,selector] of [['ENTRY','.homeShell'],['INVITE','.inviteJoin'],['MTT','.mttLobbyShell'],['BREAK','.mttBreakScreen'],['MOVE','.mttMoveScreen'],['RESULT','.mttResultHero']]){
    await surfaceTabs.getByText(tab,{exact:true}).click();
    await expect(frame.locator(selector)).toBeVisible();
  }

  console.log('AFTERDARK_BAD_RESPONSES',JSON.stringify(badResponses));
  expect(pageErrors,'page errors: '+pageErrors.join('\n')).toEqual([]);
  const meaningful=badResponses.filter(x=>!/favicon\.ico(?:$|\?)/i.test(x.url));
  expect(meaningful,'bad responses: '+JSON.stringify(meaningful)).toEqual([]);
  const meaningfulConsole=consoleErrors.filter(x=>!/favicon|source map|Failed to load resource/i.test(x));
  expect(meaningfulConsole,'console errors: '+consoleErrors.join('\n')).toEqual([]);

  await page.screenshot({path:evidenceDir+'/afterdark-editor.png',animations:'disabled',fullPage:false});
});
