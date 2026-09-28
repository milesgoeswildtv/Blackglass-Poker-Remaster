import React,{useEffect,useMemo,useRef,useState}from'react';
import'./afterdark-poker-lab.css';
import{SKIN_REGISTRY}from'../skin-system.js';
import{skinAssetUrl}from'./skin-client.js';
import{buildSnapTargets,snapMoveRect,snapResizeRect,SNAP_GRID}from'./afterdark-snapping.js';
import{AFTERDARK_SURFACES,surfaceConfig,freshSurface,freshSurfaceDocument}from'./afterdark-surfaces.js';

const SKIN_ORDER=['default','magenta','sapphire','envy','crimson','full-tilt','dwallet'];
const STORAGE='crashout.afterdark.document.v3';
const LEGACY_STORAGE='crashout.afterdark.document.v2';
const clone=v=>structuredClone(v);
function normalizeSurface(id,value={}){
 const base=freshSurface(id),layout={...base.layout,...(value?.layout||{})},custom=Array.isArray(value?.custom)?value.custom.map(bindCustomItem):[];
 const backgroundFraming={...base.backgroundFraming,...(value?.backgroundFraming||{})};
 return{...base,...value,backgroundChannel:value?.backgroundChannel||base.backgroundChannel,backgroundFraming,layout,custom};
}
function normalizeDocument(value){
 const base=freshSurfaceDocument();
 if(value?.surfaces){
  const next={...base,...value,schemaVersion:3,surfaces:{...base.surfaces}};
  for(const s of AFTERDARK_SURFACES)next.surfaces[s.id]=normalizeSurface(s.id,value.surfaces?.[s.id]);
  return next;
 }
 if(value?.layout&&Array.isArray(value.custom)){
  base.skinId=value.skinId||'default';
  base.surfaces.home=normalizeSurface('home',{backgroundChannel:value.backgroundChannel||'lobbyBg',layout:value.layout,custom:value.custom});
 }
 return base;
}
function loadDoc(){
 try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved)return normalizeDocument(saved)}catch{}
 try{const legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE)||'null');if(legacy)return normalizeDocument(legacy)}catch{}
 try{const old=JSON.parse(localStorage.getItem('crashout.afterdark.layout')||'null');if(old){const base=freshSurfaceDocument();base.surfaces.home.layout={...base.surfaces.home.layout,...old};return base}}catch{}
 return freshSurfaceDocument();
}
function mergedChannel(skinId,channel){return{...(SKIN_REGISTRY.default?.channels?.[channel]||{}),...(SKIN_REGISTRY[skinId]?.channels?.[channel]||{})}}
function backgroundChannel(skinId,channel){const selected=SKIN_REGISTRY[skinId]?.channels?.[channel];return selected&&Object.keys(selected).length?selected:(SKIN_REGISTRY.default?.channels?.[channel]||{})}
function pickBg(data,bp){return bp==='mobile'?(data.mobile||data.default||data.desktop||data.landscape||''):bp==='desktop'?(data.desktop||data.default||data.mobile||data.landscape||''):(data.default||data.mobile||data.desktop||data.landscape||'')}
function buildManifest(doc,bp,surfaceId,page){
 const cfg=surfaceConfig(surfaceId),menu=mergedChannel(doc.skinId,'menuTheme'),brand=mergedChannel(doc.skinId,'brandTheme'),table=mergedChannel(doc.skinId,'tableSkin'),bg=backgroundChannel(doc.skinId,page.backgroundChannel),frame=page.backgroundFraming||freshSurface(surfaceId).backgroundFraming;
 const slots={'poker.background':{label:page.backgroundChannel==='gameRoomBg'?'Game Room Background':'Lobby Background',layout:{[bp]:{}},style:{[bp]:{opacity:1,backgroundFit:frame.mode||'cover',backgroundScale:Number(frame.scale??100),backgroundPositionX:Number(frame.x??50),backgroundPositionY:Number(frame.y??50)}},asset:pickBg(bg,bp)}};
 if(surfaceId==='home'){
  Object.assign(slots,{
   'poker.logo':{label:'Crashout Logo',layout:{},style:{[bp]:{opacity:1}},asset:brand.default||'assets/remaster/entry-gate/CRASHOUT_LOGO.PNG'},
   'poker.identity':{label:'Player Identity',layout:{},style:{[bp]:{opacity:1}},asset:menu['identity-panel']||null},
   'poker.hostBar':{label:'Host Bar',layout:{},style:{[bp]:{opacity:1}},asset:menu['host-bar']||null},
   'poker.create':{label:'Create Game',layout:{},style:{[bp]:{opacity:1}},asset:menu['create-panel']||null},
   'poker.join':{label:'Join Game',layout:{},style:{[bp]:{opacity:1}},asset:menu['join-panel']||null},
   'poker.shop':{label:'Booster Shop',layout:{},style:{[bp]:{opacity:1}},asset:menu['shop-panel']||null},
   'poker.utility':{label:'Engine + Fairness',layout:{},style:{[bp]:{opacity:1}},asset:menu['utility-badge']||null}
  });
 }else if(surfaceId==='entry'){
  slots['poker.entry.logo']={label:'Crashout Logo',layout:{},style:{[bp]:{opacity:1}},asset:brand.default||'assets/remaster/entry-gate/CRASHOUT_LOGO.PNG'};
  slots['poker.entry.panel']={label:'Panel Artwork',layout:{},style:{[bp]:{opacity:1}},asset:menu['master-panel']||'assets/remaster/entry-gate/CRASHOUT_MASTER_FULL_SCREEN_PANEL.PNG'};
  slots['poker.entry.content']={label:'Access Content',layout:{},style:{[bp]:{opacity:1}},asset:null};
 }else{
  for(const[id,label]of cfg.builtIns)slots[id]={label,layout:{},style:{[bp]:{opacity:1}}};
  if(slots['poker.table'])slots['poker.table'].asset=table.default||null;
 }
 for(const[id]of cfg.builtIns){
  if(!slots[id])slots[id]={label:id,layout:{},style:{[bp]:{opacity:1}}};
  const v=page.layout[id]||{},out={x:Number(v.x||0),y:Number(v.y||0),zIndex:Number(v.zIndex||5),visible:v.visible!==false};
  if(Number.isFinite(v.width)&&v.width>0)out.width=v.width;
  if(Number.isFinite(v.height)&&v.height>0)out.height=v.height;
  slots[id].layout[bp]=out;
 }
 return{schemaVersion:1,projectId:'crashout-poker',name:'Crashout Poker',kind:'website',revision:0,breakpoints:{desktop:{width:820},tablet:{width:760},mobile:{width:390}},slots};
}
function skinList(){return SKIN_ORDER.map(id=>SKIN_REGISTRY[id]).filter(Boolean)}
function skinThumb(skin){const bg=skin?.channels?.lobbyBg||{},menu=skin?.channels?.menuTheme||{};return skinAssetUrl(bg.mobile||bg.default||bg.desktop||menu['create-panel']||'')}
function assetLibrary(skinId){
 const groups=[],seen=new Set(),channels=[['brandTheme','LOGO'],['menuTheme','MENU / PANELS'],['gameplayTheme','GAMEPLAY'],['tableSkin','TABLE'],['lobbyBg','LOBBY BACKGROUNDS'],['gameRoomBg','GAME ROOM BACKGROUNDS']];
 for(const[channel,label]of channels){
  const data=(channel==='lobbyBg'||channel==='gameRoomBg')?backgroundChannel(skinId,channel):mergedChannel(skinId,channel),items=[];
  for(const[role,path]of Object.entries(data)){if(!path||seen.has(path))continue;seen.add(path);items.push({role,label:role.replaceAll('-',' ').toUpperCase(),path,channel})}
  if(items.length)groups.push({channel,label,items});
 }
 return groups;
}
function layerName(id,page,builtIns){return builtIns.find(x=>x[0]===id)?.[1]||page.custom.find(x=>x.id===id)?.label||id}
function isCustom(id){return String(id||'').startsWith('custom.')}
function isTextItem(item){return item?.kind==='text'}
function findSkinBinding(asset){
 const wanted=String(asset||'');if(!wanted)return null;
 for(const skin of Object.values(SKIN_REGISTRY))for(const[channel,data]of Object.entries(skin.channels||{}))for(const[role,path]of Object.entries(data||{}))if(String(path)===wanted)return{channel,role};
 return null;
}
function bindCustomItem(item){
 if(!item||isTextItem(item)||item.binding)return item;
 const binding=findSkinBinding(item.asset);return binding?{...item,binding}:item;
}
function realViewport(){
 const vv=window.visualViewport;
 return{width:Math.max(1,Math.round(vv?.width||window.innerWidth||390)),height:Math.max(1,Math.round(vv?.height||window.innerHeight||844))}
}
function breakpointForWidth(width){return width<=600?'mobile':width<=900?'tablet':'desktop'}
function resolveBoundAsset(item,skinId,bp){
 if(!item||isTextItem(item))return'';
 const binding=item.binding||findSkinBinding(item.asset);
 if(!binding)return item.asset||'';
 const{channel,role}=binding;
 if(channel==='lobbyBg'||channel==='gameRoomBg'){
  const data=backgroundChannel(skinId,channel);
  return data?.[role]||pickBg(data,bp)||item.asset||'';
 }
 const data=mergedChannel(skinId,channel);
 return data?.[role]||item.asset||'';
}

export default function AfterdarkPokerLab(){
 const iframeRef=useRef(null),stageRef=useRef(null),dragRef=useRef(null);
 const[breakpoint,setBreakpoint]=useState('mobile'),[doc,setDoc]=useState(loadDoc),[surfaceId,setSurfaceId]=useState('home');
 const[selected,setSelected]=useState(''),[rects,setRects]=useState({}),[connected,setConnected]=useState(false),[guides,setGuides]=useState({x:null,y:null});
 const[history,setHistory]=useState([]),[future,setFuture]=useState([]);
 const[layerOpen,setLayerOpen]=useState(false),[assetOpen,setAssetOpen]=useState(false),[skinOpen,setSkinOpen]=useState(false),[editOpen,setEditOpen]=useState(false);
 const[siteView,setSiteView]=useState(false),[zoom,setZoom]=useState(1),[viewport,setViewport]=useState(realViewport);
 const surface=surfaceConfig(surfaceId),builtIns=surface.builtIns,page=doc.surfaces?.[surfaceId]||freshSurface(surfaceId);
 const effectiveBreakpoint=siteView?breakpointForWidth(viewport.width):breakpoint;
 const manifest=useMemo(()=>buildManifest(doc,effectiveBreakpoint,surfaceId,page),[doc,effectiveBreakpoint,surfaceId,page]);
 const customAssets=useMemo(()=>page.custom.map(x=>({id:x.id,kind:x.kind||'asset',asset:isTextItem(x)?'':resolveBoundAsset(x,doc.skinId,effectiveBreakpoint),text:x.text||'',textStyle:x.textStyle||{},layout:x.layout,binding:x.binding||null})),[page.custom,doc.skinId,effectiveBreakpoint]);
 const selectedCustom=isCustom(selected)?page.custom.find(x=>x.id===selected):null;
 const selectedLayer=selectedCustom?.layout||page.layout[selected];
 const selectedRect=rects[selected],frameWidth=breakpoint==='mobile'?390:breakpoint==='tablet'?760:820;
 const previewSrc=useMemo(()=>{const q=new URLSearchParams({afterdarkPreview:'1',labFrame:'1',afterdarkSurface:surfaceId,afterdarkSkin:doc.skinId});return location.pathname+'?'+q.toString()+'#/'},[surfaceId,doc.skinId]);
 const skins=useMemo(skinList,[]),groups=useMemo(()=>assetLibrary(doc.skinId),[doc.skinId]);

 function persist(next){setDoc(next);localStorage.setItem(STORAGE,JSON.stringify(next))}
 function snapshot(){setHistory(h=>[...h.slice(-59),JSON.stringify(doc)]);setFuture([])}
 function commit(next,record=true){if(record)snapshot();persist(next)}
 function pageOf(next){return next.surfaces[surfaceId]||(next.surfaces[surfaceId]=freshSurface(surfaceId))}
 function patchLayer(id,values,record=true){
  if(!id)return;const next=clone(doc),target=pageOf(next);
  if(isCustom(id)){const item=target.custom.find(x=>x.id===id);if(!item)return;item.layout={...item.layout,...values}}
  else target.layout[id]={...(target.layout[id]||{}),...values};
  commit(next,record)
 }
 function send(){iframeRef.current?.contentWindow?.postMessage({type:'afterdark:manifest',manifest,customAssets,breakpoint:effectiveBreakpoint},'*')}
 function closeSheets(){setLayerOpen(false);setAssetOpen(false);setSkinOpen(false);setEditOpen(false)}
 function undo(){if(!history.length)return;const prev=JSON.parse(history[history.length-1]);setFuture(f=>[JSON.stringify(doc),...f].slice(0,60));setHistory(h=>h.slice(0,-1));persist(prev);setSelected('')}
 function redo(){if(!future.length)return;const next=JSON.parse(future[0]);setHistory(h=>[...h,JSON.stringify(doc)].slice(-60));setFuture(f=>f.slice(1));persist(next);setSelected('')}
 function resetPage(){const next=clone(doc);next.surfaces[surfaceId]=freshSurface(surfaceId);commit(next,true);setSelected('');closeSheets()}
 function changeSurface(id){if(id===surfaceId)return;closeSheets();setSelected('');setRects({});setConnected(false);setGuides({x:null,y:null});setHistory([]);setFuture([]);setSiteView(false);setZoom(1);setSurfaceId(id)}
 function addAsset(item){
  const next=clone(doc),target=pageOf(next),id='custom.'+Date.now().toString(36)+'.'+target.custom.length;
  target.custom.push({id,label:item.label,kind:'asset',asset:item.path,binding:item.channel&&item.role?{channel:item.channel,role:item.role}:null,layout:{x:50+(target.custom.length%4)*12,y:120+(target.custom.length%5)*14,width:180,height:120,zIndex:20+target.custom.length}});
  commit(next,true);setSelected(id);setAssetOpen(false)
 }
 function addText(){
  const next=clone(doc),target=pageOf(next),id='custom.text.'+Date.now().toString(36)+'.'+target.custom.length;
  target.custom.push({id,label:'TEXT',kind:'text',text:'NEW TEXT',textStyle:{fontSize:24,fontWeight:800,color:'#ffffff',textAlign:'left'},layout:{x:48,y:120,width:220,height:60,zIndex:30+target.custom.length}});
  commit(next,true);setSelected(id);setAssetOpen(false);setTimeout(()=>setEditOpen(true),0)
 }
 function patchCustomMeta(id,values,record=true){
  if(!id||!isCustom(id))return;const next=clone(doc),item=pageOf(next).custom.find(x=>x.id===id);if(!item)return;Object.assign(item,values);commit(next,record)
 }
 function patchTextStyle(id,values,record=true){
  if(!id||!isCustom(id))return;const next=clone(doc),item=pageOf(next).custom.find(x=>x.id===id);if(!item)return;item.textStyle={...(item.textStyle||{}),...values};commit(next,record)
 }
 function deleteSelected(){if(!selected)return;const next=clone(doc),target=pageOf(next);if(isCustom(selected))target.custom=target.custom.filter(x=>x.id!==selected);else target.layout[selected]={...(target.layout[selected]||{}),visible:false};commit(next,true);setSelected('');setEditOpen(false)}
 function showSelected(){if(!selected||isCustom(selected))return;patchLayer(selected,{visible:true},true)}
 function duplicateSelected(){if(!isCustom(selected))return;const source=page.custom.find(x=>x.id===selected);if(!source)return;const next=clone(doc),target=pageOf(next),id='custom.'+Date.now().toString(36)+'.'+target.custom.length,copy=clone(source);copy.id=id;copy.label=source.label+' COPY';copy.layout={...copy.layout,x:Number(copy.layout.x||0)+14,y:Number(copy.layout.y||0)+14,zIndex:Number(copy.layout.zIndex||20)+1};target.custom.push(copy);commit(next,true);setSelected(id)}
 function changeZ(delta){if(!selected)return;patchLayer(selected,{zIndex:Number(selectedLayer?.zIndex||5)+delta},true)}
 function changeSkin(id){const next=clone(doc);next.skinId=id;commit(next,true);setSkinOpen(false)}
 function changeBackground(channel){const next=clone(doc);pageOf(next).backgroundChannel=channel;commit(next,true)}
 function patchBackgroundFraming(values,record=true){const next=clone(doc),target=pageOf(next);target.backgroundFraming={...freshSurface(surfaceId).backgroundFraming,...(target.backgroundFraming||{}),...values};commit(next,record)}
 function resetBackgroundFraming(){patchBackgroundFraming({...freshSurface(surfaceId).backgroundFraming},true)}
 function enterSiteView(){closeSheets();setSelected('');setGuides({x:null,y:null});setViewport(realViewport());setZoom(1);setSiteView(true);requestAnimationFrame(()=>document.querySelector('.adWorkspace')?.scrollTo({top:0,left:0}))}
 function exitSiteView(){setSiteView(false);setZoom(1)}
 function changeZoom(delta){setZoom(z=>Math.max(.5,Math.min(2,Math.round((z+delta)*10)/10)))}
 function resetZoom(){setZoom(1);requestAnimationFrame(()=>document.querySelector('.adWorkspace')?.scrollTo({top:0,left:0}))}
 function startPointer(e,mode){
  if(!selected||!selectedRect)return;e.preventDefault();e.stopPropagation();e.currentTarget?.setPointerCapture?.(e.pointerId);document.querySelector('.adLab')?.classList.add('adManipulating');document.documentElement.classList.add('adScrollLocked');document.body.classList.add('adScrollLocked');iframeRef.current?.contentWindow?.postMessage({type:'afterdark:interaction',locked:true},'*');
  const base=selectedLayer||{},r=selectedRect,q={mode,sx:e.clientX,sy:e.clientY,x:Number(base.x||0),y:Number(base.y||0),w:Number(base.width||r.width),h:Number(base.height||r.height),rx:Number(r.x),ry:Number(r.y),rw:Number(r.width),rh:Number(r.height)};dragRef.current=q;snapshot();
  const move=ev=>{
   const d=dragRef.current;if(!d)return;ev.preventDefault();
   const dx=ev.clientX-d.sx,dy=ev.clientY-d.sy,stage=stageRef.current;
   const targets=buildSnapTargets(rects,selected,stage?.clientWidth||frameWidth,stage?.clientHeight||window.innerHeight);
   let snapped;
   if(d.mode==='move'){
    snapped=snapMoveRect({left:d.rx+dx,top:d.ry+dy,right:d.rx+d.rw+dx,bottom:d.ry+d.rh+dy},targets);
   }else{
    let left=d.rx,top=d.ry,right=d.rx+d.rw,bottom=d.ry+d.rh;
    if(d.mode.includes('e'))right+=dx;if(d.mode.includes('s'))bottom+=dy;if(d.mode.includes('w'))left+=dx;if(d.mode.includes('n'))top+=dy;
    snapped=snapResizeRect({left,top,right,bottom},d.mode,targets);
   }
   const screenW=snapped.right-snapped.left,screenH=snapped.bottom-snapped.top;
   const x=d.x+(snapped.left-d.rx),y=d.y+(snapped.top-d.ry),w=d.w+(screenW-d.rw),h=d.h+(screenH-d.rh);
   setGuides({x:snapped.guideX,y:snapped.guideY});
   setDoc(current=>{const next=clone(current),target=next.surfaces[surfaceId]||(next.surfaces[surfaceId]=freshSurface(surfaceId)),values={x:Math.round(x),y:Math.round(y),width:Math.round(w),height:Math.round(h)};if(isCustom(selected)){const item=target.custom.find(a=>a.id===selected);if(item)item.layout={...item.layout,...values}}else target.layout[selected]={...target.layout[selected],...values};localStorage.setItem(STORAGE,JSON.stringify(next));return next})
  };
  const block=ev=>ev.preventDefault();document.addEventListener('touchmove',block,{passive:false,capture:true});
  const up=()=>{dragRef.current=null;setGuides({x:null,y:null});iframeRef.current?.contentWindow?.postMessage({type:'afterdark:interaction',locked:false},'*');document.querySelector('.adLab')?.classList.remove('adManipulating');document.documentElement.classList.remove('adScrollLocked');document.body.classList.remove('adScrollLocked');document.removeEventListener('touchmove',block,true);removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};
  addEventListener('pointermove',move,{passive:false});addEventListener('pointerup',up,{once:true});addEventListener('pointercancel',up,{once:true})
 }

 useEffect(send,[manifest,customAssets,effectiveBreakpoint]);
 useEffect(()=>{const fn=e=>{const d=e.data||{};if(d.type==='afterdark:ready'){setConnected(true);setTimeout(send,30)}if(d.type==='afterdark:rects'&&Array.isArray(d.rects))setRects(Object.fromEntries(d.rects.map(r=>[r.id,r])));if(!siteView&&d.type==='afterdark:select'&&(page.layout[d.id]||page.custom.some(x=>x.id===d.id))){setSelected(d.id);setEditOpen(false)}};addEventListener('message',fn);return()=>removeEventListener('message',fn)},[page,manifest,customAssets,effectiveBreakpoint,siteView]);
 useEffect(()=>{setConnected(false);setSelected('');setRects({})},[breakpoint,surfaceId]);
 useEffect(()=>{setConnected(false)},[doc.skinId]);
 useEffect(()=>{const update=()=>setViewport(realViewport());addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);return()=>{removeEventListener('resize',update);window.visualViewport?.removeEventListener('resize',update)}},[]);

 const stageWidth=breakpoint==='mobile'?'min(100%,'+frameWidth+'px)':frameWidth+'px',skin=SKIN_REGISTRY[doc.skinId]||SKIN_REGISTRY.default;
 const siteStageStyle=siteView?{width:viewport.width,height:viewport.height,transform:`scale(${zoom})`,transformOrigin:'top left'}:{width:stageWidth};
 const siteWrapStyle=siteView?{width:Math.round(viewport.width*zoom),height:Math.round(viewport.height*zoom)}:undefined;
 return <main className={'adLab'+(siteView?' adSiteView':'')}>
  <header className="adTop"><div><b>AFTERDARK</b><span>CRASHOUT POKER VISUAL EDITOR</span></div><button className="adViewButton" type="button" onClick={enterSiteView}>SITE VIEW</button><select value={breakpoint} onChange={e=>setBreakpoint(e.target.value)}><option value="mobile">MOBILE</option><option value="tablet">TABLET</option><option value="desktop">DESKTOP</option></select></header>
  <div className="adStatus"><button onClick={()=>{closeSheets();setLayerOpen(true)}}>{selected?layerName(selected,page,builtIns):'SELECT A LAYER'}</button><em>{surface.label} · {skin?.label||'DEFAULT'} · {page.backgroundChannel==='gameRoomBg'?'GAME ROOM':'LOBBY'}</em><span className={connected?'live':''}>{connected?'LIVE':'CONNECTING'}</span></div>
  <nav className="adSurfaceTabs" aria-label="Page loadouts">{AFTERDARK_SURFACES.map(s=><button key={s.id} type="button" className={surfaceId===s.id?'active':''} onClick={()=>changeSurface(s.id)}><b>{s.short}</b><small>{s.scroll==='fixed'?'LOCKED':'SCROLL'}</small></button>)}</nav>
  <section className="adWorkspace">{siteView?<div className="adSiteStageWrap" style={siteWrapStyle}><div ref={stageRef} className="adStage" style={siteStageStyle}><iframe ref={iframeRef} src={previewSrc} title="Crashout Poker visual preview"/></div></div>:<div ref={stageRef} className="adStage" style={siteStageStyle}><iframe ref={iframeRef} src={previewSrc} title="Crashout Poker visual preview"/><div className="adOverlay">{guides.x!=null&&<i className="adSnapGuide x" style={{left:guides.x}}/>}{guides.y!=null&&<i className="adSnapGuide y" style={{top:guides.y}}/>}{selectedRect&&<div className="adSelection" style={{left:selectedRect.x,top:selectedRect.y,width:selectedRect.width,height:selectedRect.height}} onPointerDown={e=>startPointer(e,'move')}><span>{layerName(selected,page,builtIns)}</span><button className="adSelectionDelete" type="button" aria-label={isCustom(selected)?'Delete selected asset':'Hide selected element'} onPointerDown={e=>{e.preventDefault();e.stopPropagation()}} onClick={e=>{e.preventDefault();e.stopPropagation();deleteSelected()}}>🗑</button>{['nw','ne','sw','se'].map(h=><i key={h} className={'adHandle '+h} onPointerDown={e=>startPointer(e,h)}/>)}</div>}</div></div>}</section>

  {siteView&&<div className="adViewControls" role="toolbar" aria-label="Site view zoom controls"><button type="button" aria-label="Zoom out" onClick={()=>changeZoom(-.1)}>−</button><button type="button" className="adZoomReadout" aria-label="Reset zoom to 100 percent" onClick={resetZoom}>{Math.round(zoom*100)}%</button><button type="button" aria-label="Zoom in" onClick={()=>changeZoom(.1)}>＋</button><button type="button" className="adResetZoom" onClick={resetZoom}>RESET</button><button type="button" className="adExitView" onClick={exitSiteView}>EDIT</button><small>{surface.label} · {viewport.width}×{viewport.height} · 1:1 = REAL SITE</small></div>}

  {layerOpen&&<aside className="adSheet"><header><div><b>LAYERS</b><small>{surface.label} LOADOUT</small></div><button onClick={()=>setLayerOpen(false)}>×</button></header><div className="adLayerList">{builtIns.map(([id,label])=><button key={id} className={selected===id?'active':''} onClick={()=>{setSelected(id);setLayerOpen(false)}}><span>{label}</span><small>{page.layout[id]?.visible===false?'HIDDEN':'BUILT IN'}</small></button>)}{page.custom.map(item=><button key={item.id} className={selected===item.id?'active':''} onClick={()=>{setSelected(item.id);setLayerOpen(false)}}><span>{item.label}</span><small>{isTextItem(item)?'TEXT':item.binding?'SKIN-LINKED':'FREE ASSET'}</small></button>)}</div><button className="adDanger" onClick={resetPage}>RESET THIS PAGE</button></aside>}

  {assetOpen&&<aside className="adSheet adAssetSheet"><header><div><b>ADD ASSET</b><small>{skin?.label||'DEFAULT'} ASSETS + FREE TEXT</small></div><button onClick={()=>setAssetOpen(false)}>×</button></header><button className="adAddText" type="button" onClick={addText}><b>T</b><span>ADD TEXT</span><small>Editable live text layer</small></button>{groups.map(group=><section className="adAssetGroup" key={group.channel}><h3>{group.label}</h3><div className="adAssetGrid">{group.items.map(item=><button key={item.channel+item.role+item.path} onClick={()=>addAsset(item)}><span><img src={skinAssetUrl(item.path)} alt=""/></span><small>{item.label}</small></button>)}</div></section>)}</aside>}

  {skinOpen&&<aside className="adSheet adSkinSheet"><header><div><b>SKIN + BACKGROUND</b><small>LAYOUT STAYS IN PLACE</small></div><button onClick={()=>setSkinOpen(false)}>×</button></header><div className="adBackgroundToggle"><button className={page.backgroundChannel==='lobbyBg'?'active':''} onClick={()=>changeBackground('lobbyBg')}>LOBBY BG</button><button className={page.backgroundChannel==='gameRoomBg'?'active':''} onClick={()=>changeBackground('gameRoomBg')}>GAME ROOM BG</button></div><section className="adBackgroundFraming"><h3>BACKGROUND FRAMING</h3><div className="adBackgroundFit">{[['cover','COVER'],['contain','CONTAIN'],['stretch','STRETCH'],['manual','MANUAL']].map(([mode,label])=><button key={mode} type="button" className={page.backgroundFraming?.mode===mode?'active':''} onClick={()=>patchBackgroundFraming({mode},true)}>{label}</button>)}</div><label><span>ZOOM <b>{Math.round(Number(page.backgroundFraming?.scale??100))}%</b></span><input aria-label="Background zoom" type="range" min="50" max="300" step="5" value={Number(page.backgroundFraming?.scale??100)} onChange={e=>patchBackgroundFraming({mode:'manual',scale:Number(e.target.value)},true)}/></label><label><span>POSITION X <b>{Math.round(Number(page.backgroundFraming?.x??50))}%</b></span><input aria-label="Background position X" type="range" min="0" max="100" step="1" value={Number(page.backgroundFraming?.x??50)} onChange={e=>patchBackgroundFraming({x:Number(e.target.value)},true)}/></label><label><span>POSITION Y <b>{Math.round(Number(page.backgroundFraming?.y??50))}%</b></span><input aria-label="Background position Y" type="range" min="0" max="100" step="1" value={Number(page.backgroundFraming?.y??50)} onChange={e=>patchBackgroundFraming({y:Number(e.target.value)},true)}/></label><button className="adResetBackground" type="button" onClick={resetBackgroundFraming}>RESET FRAMING</button></section><div className="adSkinGrid">{skins.map(s=><button key={s.id} className={doc.skinId===s.id?'active':''} onClick={()=>changeSkin(s.id)}><span>{skinThumb(s)&&<img src={skinThumb(s)} alt=""/>}</span><b>{s.label}</b><small>{s.id==='default'?'DEFAULT':s.id.toUpperCase()}</small></button>)}</div></aside>}

  {editOpen&&selectedLayer&&<aside className="adSheet"><header><div><b>{layerName(selected,page,builtIns)}</b><small>{selectedCustom?(isTextItem(selectedCustom)?'TEXT LAYER':'FREE ASSET'):'BUILT IN'}</small></div><button onClick={()=>setEditOpen(false)}>×</button></header>{isTextItem(selectedCustom)&&<div className="adTextEditor"><label><span>TEXT</span><textarea value={selectedCustom.text||''} onChange={e=>patchCustomMeta(selected,{text:e.target.value,label:(e.target.value.trim().slice(0,24)||'TEXT')},true)}/></label><div className="adTextStyleGrid"><label><span>SIZE</span><input type="number" min="8" max="160" value={selectedCustom.textStyle?.fontSize??24} onChange={e=>patchTextStyle(selected,{fontSize:Number(e.target.value)},true)}/></label><label><span>WEIGHT</span><select value={selectedCustom.textStyle?.fontWeight??800} onChange={e=>patchTextStyle(selected,{fontWeight:Number(e.target.value)},true)}><option value="400">REGULAR</option><option value="600">SEMIBOLD</option><option value="800">BOLD</option><option value="900">BLACK</option></select></label><label><span>ALIGN</span><select value={selectedCustom.textStyle?.textAlign||'left'} onChange={e=>patchTextStyle(selected,{textAlign:e.target.value},true)}><option value="left">LEFT</option><option value="center">CENTER</option><option value="right">RIGHT</option></select></label><label><span>COLOR</span><input className="adColorInput" type="color" value={selectedCustom.textStyle?.color||'#ffffff'} onChange={e=>patchTextStyle(selected,{color:e.target.value},true)}/></label></div></div>}<div className="adFields">{[['x','X'],['y','Y'],['width','WIDTH'],['height','HEIGHT']].map(([key,label])=><label key={key}><span>{label}</span><input type="number" value={selectedLayer[key]??(key==='width'?Math.round(selectedRect?.width||0):key==='height'?Math.round(selectedRect?.height||0):0)} onChange={e=>patchLayer(selected,{[key]:Number(e.target.value)},true)}/></label>)}</div><div className="adActions"><button onClick={()=>changeZ(1)}>BRING FORWARD</button><button onClick={()=>changeZ(-1)}>SEND BACK</button>{isCustom(selected)&&<button onClick={duplicateSelected}>DUPLICATE</button>}{isCustom(selected)&&<button className="danger" onClick={deleteSelected}>DELETE</button>}{!isCustom(selected)&&selectedLayer?.visible!==false&&<button className="danger" onClick={deleteSelected}>HIDE</button>}{!isCustom(selected)&&selectedLayer?.visible===false&&<button onClick={showSelected}>SHOW</button>}</div><button className="adResetOne" onClick={()=>patchLayer(selected,{x:0,y:0,width:null,height:null,zIndex:isCustom(selected)?20:5},true)}>RESET THIS LAYER</button></aside>}

  <nav className="adDock six"><button onClick={()=>{closeSheets();setLayerOpen(true)}}><b>☰</b><small>LAYERS</small></button><button onClick={()=>{closeSheets();setAssetOpen(true)}}><b>＋</b><small>ASSETS</small></button><button onClick={()=>{closeSheets();setSkinOpen(true)}}><b>◈</b><small>SKIN</small></button><button disabled={!history.length} onClick={undo}><b>↶</b><small>UNDO</small></button><button disabled={!future.length} onClick={redo}><b>↷</b><small>REDO</small></button><button disabled={!selected} onClick={()=>{closeSheets();setEditOpen(true)}}><b>▦</b><small>EDIT</small></button></nav>
  <div className="adHint">{selected?`SNAP ${SNAP_GRID}px · edges + centers align · corners resize · Edit for layer tools`:'Tap an existing element or use ASSETS to add something.'}</div>
 </main>
}