import React,{useEffect,useMemo,useRef,useState}from'react';
import'./afterdark-poker-lab.css';

const SLOT_DEFS=[
 ['poker.logo','Logo'],['poker.identity','Player Identity'],['poker.hostBar','Host Bar'],['poker.create','Create Game'],['poker.join','Join Game'],['poker.shop','Booster Shop'],['poker.utility','Engine + Fairness']
];
const freshLayout=()=>Object.fromEntries(SLOT_DEFS.map(([id])=>[id,{x:0,y:0,width:null,height:null,zIndex:5}]));
const clone=v=>structuredClone(v);
const MANIFEST_BASE={schemaVersion:1,projectId:'crashout-poker',name:'Crashout Poker',kind:'website',revision:0,breakpoints:{desktop:{width:820},tablet:{width:760},mobile:{width:390}},slots:{
 'poker.logo':{label:'Crashout Logo',layout:{},style:{mobile:{opacity:1}},asset:'/assets/remaster/entry-gate/CRASHOUT_LOGO.PNG'},
 'poker.identity':{label:'Player Identity',layout:{},style:{mobile:{opacity:1}},asset:'/assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG'},
 'poker.hostBar':{label:'Host Bar',layout:{},style:{mobile:{opacity:1}},asset:'/assets/remaster/homescreen/CRASHOUT_INPUT_FIELD.PNG'},
 'poker.create':{label:'Create Game',layout:{},style:{mobile:{opacity:1}},asset:'/assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG'},
 'poker.join':{label:'Join Game',layout:{},style:{mobile:{opacity:1}},asset:'/assets/remaster/homescreen/CRASHOUT_JOIN_GAME_PANEL.PNG'},
 'poker.shop':{label:'Booster Shop',layout:{},style:{mobile:{opacity:1}},asset:'/assets/remaster/homescreen/CRASHOUT_BOOSTER_PANEL.PNG'},
 'poker.utility':{label:'Engine + Fairness',layout:{},style:{mobile:{opacity:1}},asset:null},
 'poker.background':{label:'Lobby Background',locked:true,layout:{},style:{mobile:{opacity:1}},asset:null}
}};
function layoutManifest(layout,bp){const m=clone(MANIFEST_BASE);for(const[id]of SLOT_DEFS){const v=layout[id]||{},out={x:Number(v.x||0),y:Number(v.y||0),zIndex:Number(v.zIndex||5)};if(Number.isFinite(v.width)&&v.width>0)out.width=v.width;if(Number.isFinite(v.height)&&v.height>0)out.height=v.height;m.slots[id].layout[bp]=out}return m}

export default function AfterdarkPokerLab(){
 const iframeRef=useRef(null),dragRef=useRef(null);
 const[breakpoint,setBreakpoint]=useState('mobile');
 const[layout,setLayout]=useState(()=>{try{return JSON.parse(localStorage.getItem('crashout.afterdark.layout'))||freshLayout()}catch{return freshLayout()}});
 const[selected,setSelected]=useState(''),[rects,setRects]=useState({}),[connected,setConnected]=useState(false),[history,setHistory]=useState([]),[future,setFuture]=useState([]),[layerOpen,setLayerOpen]=useState(false),[numbersOpen,setNumbersOpen]=useState(false);
 const manifest=useMemo(()=>layoutManifest(layout,breakpoint),[layout,breakpoint]);
 const frameWidth=breakpoint==='mobile'?390:breakpoint==='tablet'?760:820;
 const selectedLayout=selected?layout[selected]:null,selectedRect=selected?rects[selected]:null;
 const previewSrc=location.pathname+'?afterdarkPreview=1&labFrame=1#/';
 function send(next=manifest){iframeRef.current?.contentWindow?.postMessage({type:'afterdark:manifest',manifest:next,breakpoint},'*')}
 function commit(next,record=true){if(record){setHistory(h=>[...h.slice(-49),JSON.stringify(layout)]);setFuture([])}setLayout(next);localStorage.setItem('crashout.afterdark.layout',JSON.stringify(next))}
 function patch(id,values,record=true){if(!id)return;const next=clone(layout);next[id]={...(next[id]||{}),...values};commit(next,record)}
 function undo(){if(!history.length)return;const prev=JSON.parse(history[history.length-1]);setFuture(f=>[JSON.stringify(layout),...f].slice(0,50));setHistory(h=>h.slice(0,-1));setLayout(prev);localStorage.setItem('crashout.afterdark.layout',JSON.stringify(prev))}
 function redo(){if(!future.length)return;const next=JSON.parse(future[0]);setHistory(h=>[...h,JSON.stringify(layout)].slice(-50));setFuture(f=>f.slice(1));setLayout(next);localStorage.setItem('crashout.afterdark.layout',JSON.stringify(next))}
 function reset(){const next=freshLayout();commit(next,true);setSelected('');setRects({})}
 function startPointer(e,mode){
  if(!selected||!selectedRect)return;e.preventDefault();e.stopPropagation();e.currentTarget?.setPointerCapture?.(e.pointerId);document.querySelector('.adLab')?.classList.add('adManipulating');document.documentElement.classList.add('adScrollLocked');document.body.classList.add('adScrollLocked');iframeRef.current?.contentWindow?.postMessage({type:'afterdark:interaction',locked:true},'*');
  const base=layout[selected]||{},r=selectedRect,d={mode,sx:e.clientX,sy:e.clientY,x:Number(base.x||0),y:Number(base.y||0),w:Number(base.width||r.width),h:Number(base.height||r.height)};dragRef.current=d;setHistory(h=>[...h.slice(-49),JSON.stringify(layout)]);setFuture([]);
  const move=ev=>{const q=dragRef.current;if(!q)return;ev.preventDefault();const dx=ev.clientX-q.sx,dy=ev.clientY-q.sy;let x=q.x,y=q.y,w=q.w,h=q.h;if(q.mode==='move'){x=q.x+dx;y=q.y+dy}else{if(q.mode.includes('e'))w=Math.max(30,q.w+dx);if(q.mode.includes('s'))h=Math.max(24,q.h+dy);if(q.mode.includes('w')){w=Math.max(30,q.w-dx);x=q.x+(q.w-w)}if(q.mode.includes('n')){h=Math.max(24,q.h-dy);y=q.y+(q.h-h)}}setLayout(current=>{const next=clone(current);next[selected]={...next[selected],x:Math.round(x),y:Math.round(y),width:Math.round(w),height:Math.round(h)};localStorage.setItem('crashout.afterdark.layout',JSON.stringify(next));return next})};
  const blockScroll=ev=>{ev.preventDefault()};
  document.addEventListener('touchmove',blockScroll,{passive:false,capture:true});
  const up=()=>{dragRef.current=null;iframeRef.current?.contentWindow?.postMessage({type:'afterdark:interaction',locked:false},'*');document.querySelector('.adLab')?.classList.remove('adManipulating');document.documentElement.classList.remove('adScrollLocked');document.body.classList.remove('adScrollLocked');document.removeEventListener('touchmove',blockScroll,true);removeEventListener('pointermove',move);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};addEventListener('pointermove',move,{passive:false});addEventListener('pointerup',up,{once:true});addEventListener('pointercancel',up,{once:true});
 }
 useEffect(()=>{send()},[manifest]);
 useEffect(()=>{const onMessage=e=>{const d=e.data||{};if(d.type==='afterdark:ready'){setConnected(true);setTimeout(()=>send(),30)}if(d.type==='afterdark:rects'&&Array.isArray(d.rects))setRects(Object.fromEntries(d.rects.map(r=>[r.id,r])));if(d.type==='afterdark:select'&&layout[d.id]){setSelected(d.id);setNumbersOpen(false)}};addEventListener('message',onMessage);return()=>removeEventListener('message',onMessage)},[layout,breakpoint]);
 useEffect(()=>{setConnected(false);setSelected('');setRects({})},[breakpoint]);
 const stageWidth=breakpoint==='mobile'?'min(100%,'+frameWidth+'px)':frameWidth+'px';
 return <main className="adLab"><header className="adTop"><div><b>AFTERDARK</b><span>CRASHOUT POKER LAYOUT</span></div><select value={breakpoint} onChange={e=>setBreakpoint(e.target.value)}><option value="mobile">MOBILE</option><option value="tablet">TABLET</option><option value="desktop">DESKTOP</option></select></header><div className="adStatus"><button onClick={()=>setLayerOpen(v=>!v)}>{selected?(SLOT_DEFS.find(x=>x[0]===selected)?.[1]||selected):'SELECT A LAYER'}</button><span className={connected?'live':''}>{connected?'LIVE':'CONNECTING'}</span></div><section className="adWorkspace"><div className="adStage" style={{width:stageWidth}}><iframe ref={iframeRef} src={previewSrc} title="Crashout Poker visual preview"/><div className="adOverlay">{selectedRect&&<div className="adSelection" style={{left:selectedRect.x,top:selectedRect.y,width:selectedRect.width,height:selectedRect.height}} onPointerDown={e=>startPointer(e,'move')}><span>{SLOT_DEFS.find(x=>x[0]===selected)?.[1]}</span>{['nw','ne','sw','se'].map(h=><i key={h} className={'adHandle '+h} onPointerDown={e=>startPointer(e,h)}/>)}</div>}</div></div></section>{layerOpen&&<aside className="adSheet layers"><header><b>LAYERS</b><button onClick={()=>setLayerOpen(false)}>×</button></header>{SLOT_DEFS.map(([id,label])=><button key={id} className={selected===id?'active':''} onClick={()=>{setSelected(id);setLayerOpen(false)}}><span>{label}</span><small>{id}</small></button>)}</aside>}{numbersOpen&&selectedLayout&&<aside className="adSheet numbers"><header><b>{SLOT_DEFS.find(x=>x[0]===selected)?.[1]}</b><button onClick={()=>setNumbersOpen(false)}>×</button></header><div className="adFields">{[['x','X'],['y','Y'],['width','WIDTH'],['height','HEIGHT']].map(([key,label])=><label key={key}><span>{label}</span><input type="number" value={selectedLayout[key]??(key==='width'?Math.round(selectedRect?.width||0):key==='height'?Math.round(selectedRect?.height||0):0)} onChange={e=>patch(selected,{[key]:Number(e.target.value)},true)}/></label>)}</div><button className="adResetOne" onClick={()=>patch(selected,{x:0,y:0,width:null,height:null},true)}>RESET THIS LAYER</button></aside>}<nav className="adDock"><button onClick={()=>setLayerOpen(v=>!v)}><b>☰</b><small>LAYERS</small></button><button disabled={!history.length} onClick={undo}><b>↶</b><small>UNDO</small></button><button disabled={!future.length} onClick={redo}><b>↷</b><small>REDO</small></button><button disabled={!selected} onClick={()=>setNumbersOpen(v=>!v)}><b>▦</b><small>NUMBERS</small></button><button onClick={reset}><b>⟲</b><small>RESET</small></button></nav><div className="adHint">{selected?'Drag the box to move • drag a corner to resize':'Tap Create Game, Join Game, Shop, Identity, Host Bar, Logo, or Utility to select it.'}</div></main>
}