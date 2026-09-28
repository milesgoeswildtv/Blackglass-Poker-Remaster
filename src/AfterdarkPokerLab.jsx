import React,{useEffect,useMemo,useRef,useState}from'react';
import'./afterdark-poker-lab.css';
import{SKIN_REGISTRY}from'../skin-system.js';
import{skinAssetUrl}from'./skin-client.js';

const BUILT_INS=[
 ['poker.logo','Logo'],['poker.identity','Player Identity'],['poker.hostBar','Host Bar'],['poker.create','Create Game'],['poker.join','Join Game'],['poker.shop','Booster Shop'],['poker.utility','Engine + Fairness']
];
const SKIN_ORDER=['default','magenta','sapphire','envy','crimson','full-tilt','dwallet'];
const STORAGE='crashout.afterdark.document.v2';
const clone=v=>structuredClone(v);
const freshLayout=()=>Object.fromEntries(BUILT_INS.map(([id])=>[id,{x:0,y:0,width:null,height:null,zIndex:5}]));
const freshDoc=()=>({skinId:'default',backgroundChannel:'lobbyBg',layout:freshLayout(),custom:[]});
function loadDoc(){
 try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved?.layout&&Array.isArray(saved.custom))return saved}catch{}
 try{const old=JSON.parse(localStorage.getItem('crashout.afterdark.layout')||'null');if(old)return{...freshDoc(),layout:{...freshLayout(),...old}}}catch{}
 return freshDoc();
}
function mergedChannel(skinId,channel){return{...(SKIN_REGISTRY.default?.channels?.[channel]||{}),...(SKIN_REGISTRY[skinId]?.channels?.[channel]||{})}}
function backgroundChannel(skinId,channel){const selected=SKIN_REGISTRY[skinId]?.channels?.[channel];return selected&&Object.keys(selected).length?selected:(SKIN_REGISTRY.default?.channels?.[channel]||{})}
function pickBg(data,bp){return bp==='mobile'?(data.mobile||data.default||data.desktop||data.landscape||''):bp==='desktop'?(data.desktop||data.default||data.mobile||data.landscape||''):(data.default||data.mobile||data.desktop||data.landscape||'')}
function buildManifest(doc,bp){
 const menu=mergedChannel(doc.skinId,'menuTheme'),bg=backgroundChannel(doc.skinId,doc.backgroundChannel);
 const slots={
  'poker.logo':{label:'Crashout Logo',layout:{},style:{[bp]:{opacity:1}},asset:'assets/remaster/entry-gate/CRASHOUT_LOGO.PNG'},
  'poker.identity':{label:'Player Identity',layout:{},style:{[bp]:{opacity:1}},asset:menu['identity-panel']||null},
  'poker.hostBar':{label:'Host Bar',layout:{},style:{[bp]:{opacity:1}},asset:menu['host-bar']||null},
  'poker.create':{label:'Create Game',layout:{},style:{[bp]:{opacity:1}},asset:menu['create-panel']||null},
  'poker.join':{label:'Join Game',layout:{},style:{[bp]:{opacity:1}},asset:menu['join-panel']||null},
  'poker.shop':{label:'Booster Shop',layout:{},style:{[bp]:{opacity:1}},asset:menu['shop-panel']||null},
  'poker.utility':{label:'Engine + Fairness',layout:{},style:{[bp]:{opacity:1}},asset:menu['utility-badge']||null},
  'poker.background':{label:doc.backgroundChannel==='gameRoomBg'?'Game Room Background':'Lobby Background',layout:{},style:{[bp]:{opacity:1}},asset:pickBg(bg,bp)}
 };
 for(const[id]of BUILT_INS){const v=doc.layout[id]||{},out={x:Number(v.x||0),y:Number(v.y||0),zIndex:Number(v.zIndex||5)};if(Number.isFinite(v.width)&&v.width>0)out.width=v.width;if(Number.isFinite(v.height)&&v.height>0)out.height=v.height;slots[id].layout[bp]=out}
 slots['poker.background'].layout[bp]={};
 return{schemaVersion:1,projectId:'crashout-poker',name:'Crashout Poker',kind:'website',revision:0,breakpoints:{desktop:{width:820},tablet:{width:760},mobile:{width:390}},slots}
}
function skinList(){return SKIN_ORDER.map(id=>SKIN_REGISTRY[id]).filter(Boolean)}
function skinThumb(skin){const bg=skin?.channels?.lobbyBg||{},menu=skin?.channels?.menuTheme||{};return skinAssetUrl(bg.mobile||bg.default||bg.desktop||menu['create-panel']||'')}
function assetLibrary(skinId){
 const groups=[],seen=new Set(),channels=[['menuTheme','MENU / PANELS'],['gameplayTheme','GAMEPLAY'],['tableSkin','TABLE'],['lobbyBg','LOBBY BACKGROUNDS'],['gameRoomBg','GAME ROOM BACKGROUNDS']];
 for(const[channel,label]of channels){
  const data=(channel==='lobbyBg'||channel==='gameRoomBg')?backgroundChannel(skinId,channel):mergedChannel(skinId,channel),items=[];
  for(const[role,path]of Object.entries(data)){if(!path||seen.has(path))continue;seen.add(path);items.push({role,label:role.replaceAll('-',' ').toUpperCase(),path,channel})}
  if(items.length)groups.push({channel,label,items});
 }
 return groups;
}
function layerName(id,doc){return BUILT_INS.find(x=>x[0]===id)?.[1]||doc.custom.find(x=>x.id===id)?.label||id}
function isCustom(id){return String(id||'').startsWith('custom.')}

export default function AfterdarkPokerLab(){
 const iframeRef=useRef(null),dragRef=useRef(null);
 const[breakpoint,setBreakpoint]=useState('mobile'),[doc,setDoc]=useState(loadDoc);
 const[selected,setSelected]=useState(''),[rects,setRects]=useState({}),[connected,setConnected]=useState(false);
 const[history,setHistory]=useState([]),[future,setFuture]=useState([]);
 const[layerOpen,setLayerOpen]=useState(false),[assetOpen,setAssetOpen]=useState(false),[skinOpen,setSkinOpen]=useState(false),[editOpen,setEditOpen]=useState(false);
 const manifest=useMemo(()=>buildManifest(doc,breakpoint),[doc,breakpoint]);
 const customAssets=useMemo(()=>doc.custom.map(x=>({id:x.id,asset:x.asset,layout:x.layout})),[doc.custom]);
 const selectedLayer=isCustom(selected)?doc.custom.find(x=>x.id===selected)?.layout:doc.layout[selected];
 const selectedRect=rects[selected],frameWidth=breakpoint==='mobile'?390:breakpoint==='tablet'?760:820;
 const previewSrc=location.pathname+'?afterdarkPreview=1&labFrame=1#/';
 const skins=useMemo(skinList,[]),groups=useMemo(()=>assetLibrary(doc.skinId),[doc.skinId]);

 function persist(next){setDoc(next);localStorage.setItem(STORAGE,JSON.stringify(next))}
 function snapshot(){setHistory(h=>[...h.slice(-59),JSON.stringify(doc)]);setFuture([])}
 function commit(next,record=true){if(record)snapshot();persist(next)}
 function patchLayer(id,values,record=true){
  if(!id)return;const next=clone(doc);
  if(isCustom(id)){const item=next.custom.find(x=>x.id===id);if(!item)return;item.layout={...item.layout,...values}}
  else next.layout[id]={...(next.layout[id]||{}),...values};
  commit(next,record)
 }
 function send(){iframeRef.current?.contentWindow?.postMessage({type:'afterdark:manifest',manifest,customAssets,breakpoint},'*')}
 function closeSheets(){setLayerOpen(false);setAssetOpen(false);setSkinOpen(false);setEditOpen(false)}
 function undo(){if(!history.length)return;const prev=JSON.parse(history[history.length-1]);setFuture(f=>[JSON.stringify(doc),...f].slice(0,60));setHistory(h=>h.slice(0,-1));persist(prev);setSelected('')}
 function redo(){if(!future.length)return;const next=JSON.parse(future[0]);setHistory(h=>[...h,JSON.stringify(doc)].slice(-60));setFuture(f=>f.slice(1));persist(next);setSelected('')}
 function resetAll(){commit(freshDoc(),true);setSelected('');closeSheets()}
 function addAsset(item){
  const next=clone(doc),id='custom.'+Date.now().toString(36)+'.'+next.custom.length;
  next.custom.push({id,label:item.label,asset:item.path,layout:{x:50+(next.custom.length%4)*12,y:120+(next.custom.length%5)*14,width:180,height:120,zIndex:20+next.custom.length}});
  commit(next,true);setSelected(id);setAssetOpen(false)
 }
 function deleteSelected(){if(!isCustom(selected))return;const next=clone(doc);next.custom=next.custom.filter(x=>x.id!==selected);commit(next,true);setSelected('');setEditOpen(false)}
 function duplicateSelected(){if(!isCustom(selected))return;const source=doc.custom.find(x=>x.id===selected);if(!source)return;const next=clone(doc),id='custom.'+Date.now().toString(36)+'.'+next.custom.length,copy=clone(source);copy.id=id;copy.label=source.label+' COPY';copy.layout={...copy.layout,x:Number(copy.layout.x||0)+14,y:Number(copy.layout.y||0)+14,zIndex:Number(copy.layout.zIndex||20)+1};next.custom.push(copy);commit(next,true);setSelected(id)}
 function changeZ(delta){if(!selected)return;patchLayer(selected,{zIndex:Number(selectedLayer?.zIndex||5)+delta},true)}
 function changeSkin(id){const next=clone(doc);next.skinId=id;commit(next,true);setSkinOpen(false)}
 function changeBackground(channel){const next=clone(doc);next.backgroundChannel=channel;commit(next,true)}
 function startPointer(e,mode){
  if(!selected||!selectedRect)return;e.preventDefault();e.stopPropagation();e.currentTarget?.setPointerCapture?.(e.pointerId);document.querySelector('.adLab')?.classList.add('adManipulating');document.documentElement.classList.add('adScrollLocked');document.body.classList.add('adScrollLocked');iframeRef.current?.contentWindow?.postMessage({type:'afterdark:interaction',locked:true},'*');
  const base=selectedLayer||{},r=selectedRect,q={mode,sx:e.clientX,sy:e.clientY,x:Number(base.x||0),y:Number(base.y||0),w:Number(base.width||r.width),h:Number(base.height||r.height)};dragRef.current=q;snapshot();
  const move=ev=>{const d=dragRef.current;if(!d)return;ev.preventDefault();const dx=ev.clientX-d.sx,dy=ev.clientY-d.sy;let x=d.x,y=d.y,w=d.w,h=d.h;if(d.mode==='move'){x=d.x+dx;y=d.y+dy}else{if(d.mode.includes('e'))w=Math.max(24,d.w+dx);if(d.mode.includes('s'))h=Math.max(24,d.h+dy);if(d.mode.includes('w')){w=Math.max(24,d.w-dx);x=d.x+(d.w-w)}if(d.mode.includes('n')){h=Math.max(24,d.h-dy);y=d.y+(d.h-h)}}setDoc(current=>{const next=clone(current),values={x:Math.round(x),y:Math.round(y),width:Math.round(w),height:Math.round(h)};if(isCustom(selected)){const item=next.custom.find(a=>a.id===selected);if(item)item.layout={...item.layout,...values}}else next.layout[selected]={...next.layout[selected],...values};localStorage.setItem(STORAGE,JSON.stringify(next));return next})};
  const block=ev=>ev.preventDefault();document.addEventListener('touchmove',block,{passive:false,capture:true});
  const up=()=>{dragRef.current=null;iframeRef.current?.contentWindow?.postMessage({type:'afterdark:interaction',locked:false},'*');document.querySelector('.adLab')?.classList.remove('adManipulating');document.documentElement.classList.remove('adScrollLocked');document.body.classList.remove('adScrollLocked');document.removeEventListener('touchmove',block,true);removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};
  addEventListener('pointermove',move,{passive:false});addEventListener('pointerup',up,{once:true});addEventListener('pointercancel',up,{once:true})
 }

 useEffect(send,[manifest,customAssets,breakpoint]);
 useEffect(()=>{const fn=e=>{const d=e.data||{};if(d.type==='afterdark:ready'){setConnected(true);setTimeout(send,30)}if(d.type==='afterdark:rects'&&Array.isArray(d.rects))setRects(Object.fromEntries(d.rects.map(r=>[r.id,r])));if(d.type==='afterdark:select'&&(doc.layout[d.id]||doc.custom.some(x=>x.id===d.id))){setSelected(d.id);setEditOpen(false)}};addEventListener('message',fn);return()=>removeEventListener('message',fn)},[doc,manifest,customAssets,breakpoint]);
 useEffect(()=>{setConnected(false);setSelected('');setRects({})},[breakpoint]);

 const stageWidth=breakpoint==='mobile'?'min(100%,'+frameWidth+'px)':frameWidth+'px',skin=SKIN_REGISTRY[doc.skinId]||SKIN_REGISTRY.default;
 return <main className="adLab">
  <header className="adTop"><div><b>AFTERDARK</b><span>CRASHOUT POKER VISUAL EDITOR</span></div><select value={breakpoint} onChange={e=>setBreakpoint(e.target.value)}><option value="mobile">MOBILE</option><option value="tablet">TABLET</option><option value="desktop">DESKTOP</option></select></header>
  <div className="adStatus"><button onClick={()=>{closeSheets();setLayerOpen(true)}}>{selected?layerName(selected,doc):'SELECT A LAYER'}</button><em>{skin?.label||'DEFAULT'} · {doc.backgroundChannel==='gameRoomBg'?'GAME ROOM':'LOBBY'}</em><span className={connected?'live':''}>{connected?'LIVE':'CONNECTING'}</span></div>
  <section className="adWorkspace"><div className="adStage" style={{width:stageWidth}}><iframe ref={iframeRef} src={previewSrc} title="Crashout Poker visual preview"/><div className="adOverlay">{selectedRect&&<div className="adSelection" style={{left:selectedRect.x,top:selectedRect.y,width:selectedRect.width,height:selectedRect.height}} onPointerDown={e=>startPointer(e,'move')}><span>{layerName(selected,doc)}</span>{['nw','ne','sw','se'].map(h=><i key={h} className={'adHandle '+h} onPointerDown={e=>startPointer(e,h)}/>)}</div>}</div></div></section>

  {layerOpen&&<aside className="adSheet"><header><b>LAYERS</b><button onClick={()=>setLayerOpen(false)}>×</button></header><div className="adLayerList">{BUILT_INS.map(([id,label])=><button key={id} className={selected===id?'active':''} onClick={()=>{setSelected(id);setLayerOpen(false)}}><span>{label}</span><small>BUILT IN</small></button>)}{doc.custom.map(item=><button key={item.id} className={selected===item.id?'active':''} onClick={()=>{setSelected(item.id);setLayerOpen(false)}}><span>{item.label}</span><small>FREE ASSET</small></button>)}</div><button className="adDanger" onClick={resetAll}>RESET ENTIRE LAYOUT</button></aside>}

  {assetOpen&&<aside className="adSheet adAssetSheet"><header><div><b>ADD ASSET</b><small>{skin?.label||'DEFAULT'} ASSETS</small></div><button onClick={()=>setAssetOpen(false)}>×</button></header>{groups.map(group=><section className="adAssetGroup" key={group.channel}><h3>{group.label}</h3><div className="adAssetGrid">{group.items.map(item=><button key={item.channel+item.role+item.path} onClick={()=>addAsset(item)}><span><img src={skinAssetUrl(item.path)} alt=""/></span><small>{item.label}</small></button>)}</div></section>)}</aside>}

  {skinOpen&&<aside className="adSheet adSkinSheet"><header><div><b>SKIN + BACKGROUND</b><small>LAYOUT STAYS IN PLACE</small></div><button onClick={()=>setSkinOpen(false)}>×</button></header><div className="adBackgroundToggle"><button className={doc.backgroundChannel==='lobbyBg'?'active':''} onClick={()=>changeBackground('lobbyBg')}>LOBBY BG</button><button className={doc.backgroundChannel==='gameRoomBg'?'active':''} onClick={()=>changeBackground('gameRoomBg')}>GAME ROOM BG</button></div><div className="adSkinGrid">{skins.map(s=><button key={s.id} className={doc.skinId===s.id?'active':''} onClick={()=>changeSkin(s.id)}><span>{skinThumb(s)&&<img src={skinThumb(s)} alt=""/>}</span><b>{s.label}</b><small>{s.id==='default'?'DEFAULT':s.id.toUpperCase()}</small></button>)}</div></aside>}

  {editOpen&&selectedLayer&&<aside className="adSheet"><header><div><b>{layerName(selected,doc)}</b><small>{isCustom(selected)?'FREE ASSET':'BUILT IN'}</small></div><button onClick={()=>setEditOpen(false)}>×</button></header><div className="adFields">{[['x','X'],['y','Y'],['width','WIDTH'],['height','HEIGHT']].map(([key,label])=><label key={key}><span>{label}</span><input type="number" value={selectedLayer[key]??(key==='width'?Math.round(selectedRect?.width||0):key==='height'?Math.round(selectedRect?.height||0):0)} onChange={e=>patchLayer(selected,{[key]:Number(e.target.value)},true)}/></label>)}</div><div className="adActions"><button onClick={()=>changeZ(1)}>BRING FORWARD</button><button onClick={()=>changeZ(-1)}>SEND BACK</button>{isCustom(selected)&&<button onClick={duplicateSelected}>DUPLICATE</button>}{isCustom(selected)&&<button className="danger" onClick={deleteSelected}>DELETE</button>}</div><button className="adResetOne" onClick={()=>patchLayer(selected,{x:0,y:0,width:null,height:null,zIndex:isCustom(selected)?20:5},true)}>RESET THIS LAYER</button></aside>}

  <nav className="adDock six"><button onClick={()=>{closeSheets();setLayerOpen(true)}}><b>☰</b><small>LAYERS</small></button><button onClick={()=>{closeSheets();setAssetOpen(true)}}><b>＋</b><small>ASSETS</small></button><button onClick={()=>{closeSheets();setSkinOpen(true)}}><b>◈</b><small>SKIN</small></button><button disabled={!history.length} onClick={undo}><b>↶</b><small>UNDO</small></button><button disabled={!future.length} onClick={redo}><b>↷</b><small>REDO</small></button><button disabled={!selected} onClick={()=>{closeSheets();setEditOpen(true)}}><b>▦</b><small>EDIT</small></button></nav>
  <div className="adHint">{selected?'Drag to move · corners resize · Edit for layer tools':'Tap an existing element or use ASSETS to add something.'}</div>
 </main>
}