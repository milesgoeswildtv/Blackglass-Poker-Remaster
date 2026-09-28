const previewEnabled=()=>{try{return new URLSearchParams(location.search).get('afterdarkPreview')==='1'}catch{return false}};
const BASE=import.meta.env.BASE_URL||'/';

const SLOT_DEFS=[
 {id:'poker.logo',selector:'.homeBrand h1',asset:'background'},
 {id:'poker.identity',selector:'.homeIdentityTicket',asset:'background'},
 {id:'poker.hostBar',selector:'.homeHostIdentity',asset:'background'},
 {id:'poker.create',selector:'.homeActionPrimary:first-child',asset:'background'},
 {id:'poker.join',selector:'.homeActionPrimary:nth-child(2)',asset:'background'},
 {id:'poker.shop',selector:'.homeActionShop',asset:'background'},
 {id:'poker.utility',selector:'.homeUtilityEntry',asset:null},
 {id:'poker.background',selector:'.homeShell',asset:'home-bg'}
];

function resolveAsset(value){
 const raw=String(value||'').trim();
 if(!raw)return'';
 if(/^https:\/\//i.test(raw))return raw;
 if(/^\//.test(raw))return `${BASE}${raw.replace(/^\/+/, '')}`;
 return `${BASE}${raw.replace(/^\/+/, '')}`;
}
function elementFor(def){return document.querySelector(def.selector)}
function layoutFor(slot,bp){return slot?.layout?.[bp]||slot?.layout?.desktop||{}}
function styleFor(slot,bp){return slot?.style?.[bp]||slot?.style?.desktop||{}}
function px(v){return Number.isFinite(Number(v))?`${Number(v)}px`:''}

function applySlot(def,slot,bp){
 const el=elementFor(def);if(!el||!slot)return;
 const layout=layoutFor(slot,bp),style=styleFor(slot,bp);
 const x=Number(layout.x||0),y=Number(layout.y||0);
 el.style.setProperty('translate',`${x}px ${y}px`,'important');
 if(Number.isFinite(Number(layout.width)))el.style.setProperty('width',px(layout.width),'important');
 if(Number.isFinite(Number(layout.height)))el.style.setProperty('height',px(layout.height),'important');
 if(Number.isFinite(Number(layout.zIndex)))el.style.setProperty('z-index',String(layout.zIndex),'important');
 if(layout.visible===false)el.style.setProperty('visibility','hidden','important');else el.style.removeProperty('visibility');
 if(Number.isFinite(Number(style.opacity)))el.style.setProperty('opacity',String(style.opacity),'important');
 if(style.objectFit){
  const img=el.matches('img')?el:el.querySelector('img');
  if(img)img.style.setProperty('object-fit',style.objectFit,'important');
 }
 if(slot.asset&&def.asset){
  const asset=resolveAsset(slot.asset);
  if(def.asset==='home-bg')el.style.setProperty('--home-bg',`url("${asset}")`);
  else el.style.setProperty('background-image',`url("${asset}")`,'important');
 }
}

let manifest=null,breakpoint='mobile';
function apply(){
 if(!manifest)return;
 for(const def of SLOT_DEFS)applySlot(def,manifest.slots?.[def.id],breakpoint);
 requestAnimationFrame(reportRects);
}
function reportRects(){
 const rects=[];
 for(const def of SLOT_DEFS){
  const el=elementFor(def);if(!el)continue;
  const r=el.getBoundingClientRect();
  rects.push({id:def.id,x:r.left,y:r.top,width:r.width,height:r.height});
 }
 parent.postMessage({type:'afterdark:rects',rects},'*');
}
function selectFromTarget(target){
 for(const def of SLOT_DEFS){
  if(def.id==='poker.background')continue;
  const el=elementFor(def);
  if(el&&(target===el||el.contains(target))){parent.postMessage({type:'afterdark:select',id:def.id},'*');return true}
 }
 const bg=elementFor(SLOT_DEFS[SLOT_DEFS.length-1]);
 if(bg&&(target===bg||bg.contains(target))){parent.postMessage({type:'afterdark:select',id:'poker.background'},'*');return true}
 return false;
}

export function installAfterdarkPreview(){
 if(!previewEnabled())return false;
 document.documentElement.dataset.afterdarkPreview='1';
 const ready=()=>{
  document.addEventListener('pointerdown',e=>{selectFromTarget(e.target)},true);
  document.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()},true);
  addEventListener('message',e=>{
   const d=e.data||{};
   if(d.type==='afterdark:manifest'&&d.manifest){
    manifest=d.manifest;
    breakpoint=['mobile','tablet','desktop'].includes(d.breakpoint)?d.breakpoint:'mobile';
    apply();
   }
  });
  addEventListener('resize',reportRects);
  new MutationObserver(()=>{apply();reportRects()}).observe(document.body,{childList:true,subtree:true});
  parent.postMessage({type:'afterdark:ready'},'*');
  reportRects();
 };
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',ready,{once:true});else requestAnimationFrame(ready);
 return true;
}
