import{test,expect}from'@playwright/test';
import{mkdirSync}from'node:fs';

const evidence='artifacts/browser-qa-afterdark';
mkdirSync(evidence,{recursive:true});

const surfaces=[
 ['home','.homeShell'],
 ['table-invite','.productionInvite'],
 ['pregame','.pregameTablePage'],
 ['gameplay','.gameplayV3Page'],
 ['mtt-lobby','.afterdarkMttLobbyPage'],
 ['mtt-break','.afterdarkMttBreakPage'],
 ['result','.afterdarkResultPage']
];

for(const[surface,selector]of surfaces){
 test('Afterdark surface '+surface+' renders without live API traffic',async({page})=>{
  const api=[];
  page.on('request',request=>{try{if(new URL(request.url()).pathname.startsWith('/api/'))api.push(request.url())}catch{}});
  await page.goto('/?afterdarkPreview=1&afterdarkSurface='+surface,{waitUntil:'networkidle'});
  await expect(page.locator(selector)).toBeVisible();
  expect(api).toEqual([]);
  await page.screenshot({path:evidence+'/'+surface+'.png',fullPage:surface==='home'||surface==='mtt-lobby'||surface==='result'});
 });
}

test('Home stays scroll-capable while seated Pre-game and Gameplay are viewport locked',async({page})=>{
 await page.goto('/?afterdarkPreview=1&afterdarkSurface=home');
 const home=await page.evaluate(()=>({html:getComputedStyle(document.documentElement).overflowY,body:getComputedStyle(document.body).overflowY}));
 expect(home.html).not.toBe('hidden');
 expect(home.body).not.toBe('hidden');

 for(const surface of['pregame','gameplay']){
  await page.goto('/?afterdarkPreview=1&afterdarkSurface='+surface);
  const locked=await page.evaluate(()=>({
   html:getComputedStyle(document.documentElement).overflowY,
   body:getComputedStyle(document.body).overflowY,
   root:getComputedStyle(document.getElementById('root')).overflowY,
   height:document.documentElement.scrollHeight,
   viewport:innerHeight
  }));
  expect(locked.html).toBe('hidden');
  expect(locked.body).toBe('hidden');
  expect(locked.root).toBe('hidden');
  expect(locked.height).toBeLessThanOrEqual(locked.viewport+2);
 }
});

test('active surface manifest updates groups and granular controls independently',async({page})=>{
 await page.goto('/?afterdarkPreview=1&afterdarkSurface=gameplay');
 await page.evaluate(()=>window.postMessage({
  type:'afterdark:manifest',
  surface:'gameplay',
  breakpoint:'mobile',
  selectableSlots:['gameplay.fold','gameplay.raise'],
  manifest:{slots:{
   'gameplay.table':{layout:{desktop:{x:0,y:0},mobile:{x:12,y:8}},style:{desktop:{opacity:1},mobile:{opacity:.75}},asset:null},
   'gameplay.fold':{layout:{desktop:{x:0,y:0},mobile:{x:18,y:-4}},style:{desktop:{opacity:1},mobile:{opacity:.9}},asset:null},
   'gameplay.raise':{layout:{desktop:{},mobile:{}},style:{desktop:{opacity:1},mobile:{opacity:1}},asset:null}
  }}
 },'*'));
 await expect.poll(()=>page.locator('.ftp3Stage').evaluate(el=>el.style.translate)).toBe('12px 8px');
 await expect.poll(()=>page.locator('.ftp3Stage').evaluate(el=>el.style.opacity)).toBe('0.75');
 await expect.poll(()=>page.locator('.ftp3ActionRow .fold').evaluate(el=>el.style.translate)).toBe('18px -4px');
 await expect.poll(()=>page.locator('.ftp3ActionRow .fold').evaluate(el=>el.style.opacity)).toBe('0.9');
 await expect(page.locator('.ftp3ActionRow .raise')).toHaveCSS('opacity','1');
});

test('pre-game granular controls update production elements without duplicating them',async({page})=>{
 await page.goto('/?afterdarkPreview=1&afterdarkSurface=pregame');
 await page.evaluate(()=>window.postMessage({
  type:'afterdark:manifest',
  surface:'pregame',
  breakpoint:'desktop',
  selectableSlots:['pregame.start'],
  manifest:{slots:{
   'pregame.start':{layout:{desktop:{x:-9,y:6}},style:{desktop:{opacity:.8}},asset:null},
   'pregame.tableArtwork':{layout:{desktop:{}},style:{desktop:{opacity:.95}},asset:null}
  }}
 },'*'));
 await expect.poll(()=>page.locator('.ftp3Start').evaluate(el=>el.style.translate)).toBe('-9px 6px');
 await expect.poll(()=>page.locator('.ftp3Start').evaluate(el=>el.style.opacity)).toBe('0.8');
 await expect(page.locator('.ftp3TableShell')).toHaveCount(1);
 await expect(page.locator('.ftp3Start')).toHaveCount(1);
 await expect(page.locator('.ftp3TableShell')).toHaveCSS('opacity','0.95');
});
