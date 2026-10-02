const previewEnabled=()=>{try{return new URLSearchParams(location.search).get('afterdarkPreview')==='1'}catch{return false}};
const BASE=import.meta.env.BASE_URL||'/';

const PREVIEW_SURFACE=(()=>{try{return new URLSearchParams(location.search).get('afterdarkSurface')||'home'}catch{return'home'}})();
import{AFTERDARK_SLOT_DEFS}from'./afterdark-surfaces.js';
const SLOT_DEFS=AFTERDARK_SLOT_DEFS[PREVIEW_SURFACE]||AFTERDARK_SLOT_DEFS.home;

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

function ensurePreviewStyles(){
 let style=document.getElementById('afterdark-preview-styles');
 if(!style){
  style=document.createElement('style');
  style.id='afterdark-preview-styles';
  style.textContent='html[data-afterdark-preview="1"] .homeShell:before{background-image:var(--afterdark-preview-bg,var(--home-bg))!important;background-size:var(--afterdark-preview-bg-size,cover)!important;background-position:var(--afterdark-preview-bg-position,50% 50%)!important;background-repeat:no-repeat!important}';
  document.head.appendChild(style);
 }
}
function backgroundPresentation(style={}){
 const mode=['cover','contain','stretch','manual'].includes(style.backgroundFit)?style.backgroundFit:'cover';
 const scale=Math.max(50,Math.min(300,Number(style.backgroundScale??100)));
 const x=Math.max(0,Math.min(100,Number(style.backgroundPositionX??50)));
 const y=Math.max(0,Math.min(100,Number(style.backgroundPositionY??50)));
 const size=mode==='contain'?'contain':mode==='stretch'?'100% 100%':mode==='manual'?(scale+'% auto'):'cover';
 return{size,position:x+'% '+y+'%'};
}
function applySlot(def,slot,bp){
 const el=elementFor(def);if(!el||!slot)return;
 const layout=layoutFor(slot,bp),style=styleFor(slot,bp);
 const x=Number(layout.x||0),y=Number(layout.y||0);
 el.style.setProperty('translate',`${x}px ${y}px`,'important');
 if(Number.isFinite(Number(layout.width)))el.style.setProperty('width',px(layout.width),'important');
 if(Number.isFinite(Number(layout.height)))el.style.setProperty('height',px(layout.height),'important');
 if(Number.isFinite(Number(layout.zIndex)))el.style.setProperty('z-index',String(layout.zIndex),'important');
 if(layout.visible===false){if(def.hideMode==='background')el.style.setProperty('background-image','none','important');else el.style.setProperty('visibility','hidden','important')}else{if(def.hideMode!=='background')el.style.removeProperty('visibility')}
 if(Number.isFinite(Number(style.opacity)))el.style.setProperty('opacity',String(style.opacity),'important');
 if(Object.prototype.hasOwnProperty.call(style,'filter'))el.style.setProperty('filter',String(style.filter||'none'),'important');
 if(def.id==='poker.background'){
  const frame=backgroundPresentation(style);
  if(def.asset==='home-bg'){
   ensurePreviewStyles();
   el.style.setProperty('--afterdark-preview-bg-size',frame.size);
   el.style.setProperty('--afterdark-preview-bg-position',frame.position);
  }else{
   el.style.setProperty('background-size',frame.size,'important');
   el.style.setProperty('background-position',frame.position,'important');
   el.style.setProperty('background-repeat','no-repeat','important');
  }
 }
 if(style.objectFit){
  const img=el.matches('img')?el:el.querySelector('img');
  if(img)img.style.setProperty('object-fit',style.objectFit,'important');
 }
 if(slot.asset&&def.asset&&!(layout.visible===false&&def.hideMode==='background')){
  const asset=resolveAsset(slot.asset);
  if(def.asset==='home-bg'){
   ensurePreviewStyles();
   const value=`url("${asset}")`;
   el.style.setProperty('--afterdark-preview-bg',value);
  }else if(def.asset==='surface-bg'){
   el.style.setProperty('background-image',`url("${asset}")`,'important');
  }else if(def.asset==='child-img'){
   const img=el.querySelector(def.assetSelector||'img');if(img)img.src=asset;
  }else el.style.setProperty('background-image',`url("${asset}")`,'important');
 }
}

let manifest=null,breakpoint='mobile',customAssets=[],interactionLocked=false,lockedScrollY=0;
function blockTouchScroll(e){if(interactionLocked)e.preventDefault()}
function setInteractionLock(locked){
 locked=!!locked;if(locked===interactionLocked)return;interactionLocked=locked;
 const root=document.documentElement,body=document.body;
 if(locked){
  lockedScrollY=window.scrollY||document.documentElement.scrollTop||0;
  root.style.setProperty('overflow','hidden','important');root.style.setProperty('overscroll-behavior','none','important');root.style.setProperty('touch-action','none','important');
  body.style.setProperty('position','fixed','important');body.style.setProperty('top',`-${lockedScrollY}px`,'important');body.style.setProperty('left','0','important');body.style.setProperty('right','0','important');body.style.setProperty('width','100%','important');body.style.setProperty('overflow','hidden','important');body.style.setProperty('touch-action','none','important');
  document.addEventListener('touchmove',blockTouchScroll,{passive:false,capture:true});
 }else{
  document.removeEventListener('touchmove',blockTouchScroll,true);
  for(const el of[root,body])for(const prop of['overflow','overscroll-behavior','touch-action','position','top','left','right','width'])el.style.removeProperty(prop);
  requestAnimationFrame(()=>window.scrollTo(0,lockedScrollY));
 }
}

function ensureCustomRoot(){
 const canvas=document.querySelector('[data-afterdark-canvas]');
 if(canvas){
  let root=document.getElementById('afterdark-custom-root');
  if(!root){root=document.createElement('div');root.id='afterdark-custom-root';canvas.appendChild(root)}
  else if(root.parentElement!==canvas)canvas.appendChild(root);
  Object.assign(root.style,{position:'absolute',left:'0',top:'0',width:Math.max(canvas.scrollWidth,canvas.clientWidth,1)+'px',height:Math.max(canvas.scrollHeight,canvas.clientHeight,1)+'px',zIndex:'5000',pointerEvents:'none',overflow:'visible'});
  return root;
 }
 const shell=document.querySelector('.homeShell'),frame=document.querySelector('.homeFrame');if(!shell||!frame)return null;
 let root=document.getElementById('afterdark-custom-root');
 if(!root){root=document.createElement('div');root.id='afterdark-custom-root';frame.appendChild(root)}
 else if(root.parentElement!==frame)frame.appendChild(root);
 const frameRect=frame.getBoundingClientRect(),shellRect=shell.getBoundingClientRect();
 const offsetX=shellRect.left-frameRect.left,offsetY=shellRect.top-frameRect.top;
 Object.assign(root.style,{position:'absolute',left:offsetX+'px',top:offsetY+'px',width:Math.max(shell.scrollWidth,shell.offsetWidth,innerWidth)+'px',height:Math.max(shell.scrollHeight,shell.offsetHeight,innerHeight)+'px',zIndex:'5000',pointerEvents:'none',overflow:'visible'});
 return root;
}
function renderCustomAssets(){
 const root=ensureCustomRoot(),seen=new Set();if(!root)return;
 for(const item of customAssets){
  if(!item?.id)continue;seen.add(item.id);
  let el=root.querySelector('[data-afterdark-id="'+CSS.escape(item.id)+'"]');
  if(!el){el=document.createElement('div');el.dataset.afterdarkId=item.id;el.style.position='absolute';el.style.pointerEvents='auto';el.style.touchAction='none';root.appendChild(el)}
  const l=item.layout||{};
  el.style.left=px(l.x||0);el.style.top=px(l.y||0);el.style.width=px(l.width||180);el.style.height=px(l.height||120);el.style.zIndex=String(Number(l.zIndex||20));
  if(item.kind==='text'){
   el.dataset.afterdarkKind='text';
   let text=el.querySelector('[data-afterdark-text]');
   if(!text){el.replaceChildren();text=document.createElement('div');text.dataset.afterdarkText='1';Object.assign(text.style,{width:'100%',height:'100%',display:'flex',alignItems:'center',whiteSpace:'pre-wrap',overflow:'hidden',wordBreak:'break-word',pointerEvents:'none',userSelect:'none'});el.appendChild(text)}
   const s=item.textStyle||{},nextText=String(item.text||'');
   if(text.textContent!==nextText)text.textContent=nextText;
   text.style.fontSize=px(Number(s.fontSize||24));
   text.style.fontWeight=String(Number(s.fontWeight||800));
   text.style.color=String(s.color||'#ffffff');
   text.style.textAlign=['left','center','right'].includes(s.textAlign)?s.textAlign:'left';
   text.style.justifyContent=text.style.textAlign==='center'?'center':text.style.textAlign==='right'?'flex-end':'flex-start';
   text.style.fontFamily='Inter,system-ui,sans-serif';
   text.style.lineHeight='1.05';
  }else if(item.kind==='shape'){
   el.dataset.afterdarkKind='shape';
   let shape=el.querySelector('[data-afterdark-shape]');
   if(!shape){el.replaceChildren();shape=document.createElement('div');shape.dataset.afterdarkShape='1';Object.assign(shape.style,{width:'100%',height:'100%',boxSizing:'border-box',pointerEvents:'none',userSelect:'none'});el.appendChild(shape)}
   const s=item.shapeStyle||{};
   shape.style.background=String(s.fill||'#5f2878');
   shape.style.borderColor=String(s.borderColor||'#d77cff');
   shape.style.borderWidth=px(Math.max(0,Number(s.borderWidth??2)));
   shape.style.borderStyle=['solid','dashed','dotted'].includes(s.borderStyle)?s.borderStyle:'dashed';
   shape.style.borderRadius=px(Math.max(0,Number(s.radius??10)));
   shape.style.opacity=String(Math.max(.05,Math.min(1,Number(s.opacity??.35))));
  }else{
   el.dataset.afterdarkKind='asset';
   let img=el.querySelector('img');
   if(!img){el.replaceChildren();img=document.createElement('img');img.draggable=false;img.alt='';Object.assign(img.style,{display:'block',width:'100%',height:'100%',objectFit:'contain',pointerEvents:'none',userSelect:'none'});el.appendChild(img)}
   if(item.asset)img.src=resolveAsset(item.asset);
  }
 }
 for(const el of [...root.children])if(!seen.has(el.dataset.afterdarkId))el.remove();
}

function apply(){
 if(!manifest)return;
 for(const def of SLOT_DEFS)applySlot(def,manifest.slots?.[def.id],breakpoint);
 renderCustomAssets();
 requestAnimationFrame(reportRects);
}
function reportRects(){
 const rects=[];
 for(const def of SLOT_DEFS){
  const el=elementFor(def);if(!el)continue;
  const r=el.getBoundingClientRect();
  rects.push({id:def.id,x:r.left,y:r.top,width:r.width,height:r.height});
 }
 for(const el of document.querySelectorAll('#afterdark-custom-root [data-afterdark-id]')){const r=el.getBoundingClientRect();rects.push({id:el.dataset.afterdarkId,x:r.left,y:r.top,width:r.width,height:r.height})}
 parent.postMessage({type:'afterdark:rects',rects},'*');
}
function layerLocked(id){
 const custom=customAssets.find(item=>item?.id===id);
 if(custom)return custom.layout?.locked===true;
 return layoutFor(manifest?.slots?.[id],breakpoint).locked===true;
}
function postSelect(id){parent.postMessage({type:'afterdark:select',id},'*');return true}
function selectFromPoint(x,y,target){
 const stack=document.elementsFromPoint?.(x,y)||[target].filter(Boolean);
 for(const node of stack){
  const custom=node?.closest?.('#afterdark-custom-root [data-afterdark-id]');
  if(custom&&custom===node&&!layerLocked(custom.dataset.afterdarkId))return postSelect(custom.dataset.afterdarkId);
  for(const def of SLOT_DEFS){
   if(def.id==='poker.background'||layerLocked(def.id))continue;
   const el=elementFor(def);
   if(el===node)return postSelect(def.id);
  }
 }
 for(const node of stack){
  const custom=node?.closest?.('#afterdark-custom-root [data-afterdark-id]');
  if(custom&&!layerLocked(custom.dataset.afterdarkId))return postSelect(custom.dataset.afterdarkId);
  for(const def of SLOT_DEFS){
   if(def.id==='poker.background'||layerLocked(def.id))continue;
   const el=elementFor(def);
   if(el&&(node===el||el.contains(node)))return postSelect(def.id);
  }
 }
 if(!layerLocked('poker.background')){
  const bg=elementFor(SLOT_DEFS[SLOT_DEFS.length-1]);
  if(bg&&(target===bg||bg.contains(target)))return postSelect('poker.background');
 }
 return false;
}

export function installAfterdarkPreview(){
 if(!previewEnabled())return false;
 document.documentElement.dataset.afterdarkPreview='1';
 const ready=()=>{
  document.addEventListener('pointerdown',e=>{selectFromPoint(e.clientX,e.clientY,e.target)},true);
  document.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()},true);
  addEventListener('message',e=>{
   const d=e.data||{};
   if(d.type==='afterdark:interaction'){setInteractionLock(d.locked);return}
   if(d.type==='afterdark:manifest'&&d.manifest){
    manifest=d.manifest;
    customAssets=Array.isArray(d.customAssets)?d.customAssets:[];
    breakpoint=['mobile','tablet','desktop'].includes(d.breakpoint)?d.breakpoint:'mobile';
    apply();
   }
  });
  addEventListener('resize',reportRects);
  addEventListener('scroll',reportRects,{passive:true});
  document.addEventListener('scroll',reportRects,{passive:true,capture:true});
  new MutationObserver(()=>{apply();reportRects()}).observe(document.body,{childList:true,subtree:true});
  parent.postMessage({type:'afterdark:ready'},'*');
  reportRects();
 };
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',ready,{once:true});else requestAnimationFrame(ready);
 return true;
}
