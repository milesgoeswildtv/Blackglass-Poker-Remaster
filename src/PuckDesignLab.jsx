import React,{createContext,useContext,useMemo,useState}from'react';
import{Puck}from'@puckeditor/core';
import{puckApprovedAssets}from'./puck-asset-manifest.js';
import{SKIN_REGISTRY}from'../skin-system.js';
import'@puckeditor/core/puck.css';
import'./puck-design-lab.css';

const STORAGE_KEY='crashout-puck-spike-v2';
const BASE=import.meta.env.BASE_URL||'/';
const publicAsset=path=>`${BASE}${String(path||'').replace(/^\/+/, '')}`;
const SkinPreviewContext=createContext({skinId:'default'});

const assetOptions=puckApprovedAssets.map(item=>({label:item.label,value:publicAsset(item.path)}));
const skinOptions=Object.values(SKIN_REGISTRY)
 .filter(skin=>['default','normal','premium'].includes(String(skin.tier||'')))
 .sort((a,b)=>a.id==='default'?-1:b.id==='default'?1:a.label.localeCompare(b.label))
 .map(skin=>({label:`${skin.label}${skin.tier==='premium'?' — PREMIUM':skin.tier==='normal'?' — NORMAL':''}`,value:skin.id}));

const channelOptions=[
 {label:'Panels / Menu',value:'menuTheme'},
 {label:'Gameplay',value:'gameplayTheme'},
 {label:'Poker Table',value:'tableSkin'}
];
const roleOptions=[
 {label:'Identity Panel',value:'identity-panel'},
 {label:'Host Bar',value:'host-bar'},
 {label:'Create Panel',value:'create-panel'},
 {label:'Join Panel',value:'join-panel'},
 {label:'Shop Panel',value:'shop-panel'},
 {label:'Utility Badge',value:'utility-badge'},
 {label:'Input Field',value:'input-field'},
 {label:'Primary Action',value:'primary-action'},
 {label:'Small Button',value:'small-button'},
 {label:'Master Panel',value:'master-panel'},
 {label:'Avatar Frame',value:'avatar-frame'},
 {label:'Card Back',value:'card-back'},
 {label:'Player Plaque — Idle',value:'player-plaque-idle'},
 {label:'Player Plaque — Active',value:'player-plaque-active'},
 {label:'Player Plaque — Folded',value:'player-plaque-folded'},
 {label:'Player Plaque — All In',value:'player-plaque-all-in'},
 {label:'Action — Fold',value:'action-fold'},
 {label:'Action — Call',value:'action-call'},
 {label:'Action — Raise',value:'action-raise'},
 {label:'Action — All In',value:'action-all-in'},
 {label:'Utility Button',value:'utility-button'}
];

const primaryAction=publicAsset('assets/remaster/entry-gate/CRASHOUT_PRIMARY_ACTION.PNG');
const utilityBadge=publicAsset('assets/remaster/entry-gate/UTILITY_INFO_BADGE.PNG');
const createPanel=publicAsset('assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG');
const logoAsset=publicAsset('assets/remaster/entry-gate/CRASHOUT_LOGO.PNG');

const spanOptions=Array.from({length:12},(_,i)=>({label:String(i+1),value:i+1}));
const rowOptions=Array.from({length:12},(_,i)=>({label:String(i+1),value:i+1}));

function gridStyle(columns=12,rows=3){
 return{gridColumn:`span ${Math.max(1,Math.min(12,Number(columns)||12))}`,gridRow:`span ${Math.max(1,Math.min(12,Number(rows)||3))}`};
}
function channelData(skinId,channel){
 return SKIN_REGISTRY[skinId]?.channels?.[channel]||{};
}
function resolvedRole(skinId,channel,role){
 const selected=channelData(skinId,channel),fallback=channelData('default',channel);
 if(channel==='tableSkin')return selected.default||fallback.default||'';
 return selected[role]||fallback[role]||'';
}
function resolvedBackground(skinId,surface){
 const channel=surface==='game'?'gameRoomBg':'lobbyBg',selected=channelData(skinId,channel),fallback=channelData('default',channel);
 return selected.default||selected.mobile||selected.desktop||selected.landscape||fallback.default||fallback.mobile||fallback.desktop||fallback.landscape||'';
}

function SkinAssetRender({channel,role,columns,rows,fit,puck}){
 const{skinId}=useContext(SkinPreviewContext),path=resolvedRole(skinId,channel,role),src=publicAsset(path);
 return <div ref={puck?.dragRef} className="puckSpikeAsset" style={gridStyle(columns,rows)}>{src?<img src={src} alt="" draggable="false" style={{objectFit:fit||'contain'}}/>:<span className="puckSpikeMissing">NO ASSET FOR THIS SLOT</span>}</div>;
}

const config={
 root:{
  fields:{
   previewSkin:{type:'select',label:'Preview Skin',options:skinOptions},
   previewSurface:{type:'select',label:'Preview Background',options:[{label:'Lobby BG',value:'lobby'},{label:'Game Room BG',value:'game'}]},
   minHeight:{type:'number',label:'Canvas Height',min:640,max:1200}
  },
  defaultProps:{
   previewSkin:'default',
   previewSurface:'lobby',
   minHeight:844
  },
  render:({children,previewSkin,previewSurface,minHeight})=>{
   const skinId=SKIN_REGISTRY[previewSkin]?previewSkin:'default',background=publicAsset(resolvedBackground(skinId,previewSurface));
   return <SkinPreviewContext.Provider value={{skinId}}><div className="puckSpikeCanvas" data-preview-skin={skinId} style={{backgroundImage:background?`linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.18)),url("${background}")`:'none',minHeight:Number(minHeight)||844}}>{children}</div></SkinPreviewContext.Provider>;
  }
 },
 components:{
  SkinAsset:{
   label:'SKIN ASSET — Auto Swaps',
   inline:true,
   fields:{
    channel:{type:'select',label:'Skin Channel',options:channelOptions},
    role:{type:'select',label:'Asset Role',options:roleOptions},
    columns:{type:'select',label:'Width',options:spanOptions},
    rows:{type:'select',label:'Height',options:rowOptions},
    fit:{type:'select',label:'Image Fit',options:[{label:'Contain',value:'contain'},{label:'Cover',value:'cover'},{label:'Fill',value:'fill'}]}
   },
   defaultProps:{
    channel:'menuTheme',
    role:'create-panel',
    columns:12,
    rows:4,
    fit:'contain'
   },
   render:SkinAssetRender
  },
  Asset:{
   label:'FIXED ASSET — No Skin Swap',
   inline:true,
   fields:{
    asset:{type:'select',label:'Allowed Asset',options:assetOptions},
    columns:{type:'select',label:'Width',options:spanOptions},
    rows:{type:'select',label:'Height',options:rowOptions},
    fit:{type:'select',label:'Image Fit',options:[{label:'Contain',value:'contain'},{label:'Cover',value:'cover'},{label:'Fill',value:'fill'}]}
   },
   defaultProps:{
    asset:createPanel,
    columns:12,
    rows:4,
    fit:'contain'
   },
   render:({asset,columns,rows,fit,puck})=><div ref={puck?.dragRef} className="puckSpikeAsset" style={gridStyle(columns,rows)}><img src={asset} alt="" draggable="false" style={{objectFit:fit||'contain'}}/></div>
  },
  Text:{
   label:'TEXT',
   inline:true,
   fields:{
    text:{type:'text',label:'Text',contentEditable:true},
    columns:{type:'select',label:'Width',options:spanOptions},
    rows:{type:'select',label:'Height',options:rowOptions},
    fontSize:{type:'number',label:'Font Size',min:10,max:48},
    align:{type:'select',label:'Alignment',options:[{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}]}
   },
   defaultProps:{
    text:'CREATE GAME',
    columns:7,
    rows:2,
    fontSize:24,
    align:'left'
   },
   render:({text,columns,rows,fontSize,align,puck})=><div ref={puck?.dragRef} className="puckSpikeText" style={{...gridStyle(columns,rows),fontSize:Number(fontSize)||24,textAlign:align||'left'}}>{text}</div>
  },
  ControlShell:{
   label:'CONTROL BUTTON',
   inline:true,
   fields:{
    asset:{type:'select',label:'Allowed Control Asset',options:[
     {label:'Primary Action',value:primaryAction},
     {label:'Utility Badge',value:utilityBadge}
    ]},
    label:{type:'text',label:'Control Label',contentEditable:true},
    columns:{type:'select',label:'Width',options:spanOptions},
    rows:{type:'select',label:'Height',options:rowOptions}
   },
   defaultProps:{
    asset:primaryAction,
    label:'OPEN',
    columns:6,
    rows:3
   },
   render:({asset,label,columns,rows,puck})=><div ref={puck?.dragRef} className="puckSpikeControl" style={{...gridStyle(columns,rows),backgroundImage:`url("${asset}")`}}><span>{label}</span></div>
  }
 }
};

const initialData={
 content:[
  {type:'Asset',props:{id:'spike-logo',asset:logoAsset,columns:9,rows:4,fit:'contain'}},
  {type:'SkinAsset',props:{id:'spike-profile',channel:'menuTheme',role:'identity-panel',columns:12,rows:4,fit:'fill'}},
  {type:'Text',props:{id:'spike-text',text:'CREATE GAME',columns:7,rows:2,fontSize:24,align:'left'}},
  {type:'SkinAsset',props:{id:'spike-create',channel:'menuTheme',role:'create-panel',columns:12,rows:5,fit:'fill'}},
  {type:'ControlShell',props:{id:'spike-control',asset:primaryAction,label:'OPEN',columns:6,rows:3}}
 ],
 root:{props:{previewSkin:'default',previewSurface:'lobby',minHeight:844}},
 zones:{}
};

function loadData(){
 try{
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw)return JSON.parse(raw);
 }catch{}
 return initialData;
}

export default function PuckDesignLab(){
 const[data]=useState(loadData);
 const[savedAt,setSavedAt]=useState('');
 const viewports=useMemo(()=>[
  {width:390,height:844,label:'iPhone 390'},
  {width:430,height:932,label:'Mobile 430'},
  {width:844,height:390,label:'Landscape'},
  {width:1280,height:900,label:'Desktop'}
 ],[]);
 function publish(next){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
  setSavedAt(new Date().toLocaleTimeString());
 }
 function reset(){
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
 }
 return <main className="puckSpikeShell">
  <div className="puckSpikeBanner">
   <div><strong>PUCK VISUAL EDITOR SPIKE</strong><span>EDIT DEFAULT ONCE • USE PREVIEW SKIN TO TOGGLE ART • PUBLISH IS LOCAL ONLY</span>{savedAt&&<small>Saved locally {savedAt}</small>}</div>
   <button type="button" onClick={reset}>RESET LOCAL LAYOUT</button>
  </div>
  <Puck
   config={config}
   data={data}
   onPublish={publish}
   headerTitle="Crashout Poker — Skin-Aware Puck"
   viewports={viewports}
   dnd={{behavior:'fluid'}}
   height="calc(100dvh - 52px)"
  />
 </main>;
}
