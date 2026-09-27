import React,{useMemo,useState}from'react';
import{Puck}from'@puckeditor/core';
import'@puckeditor/core/puck.css';
import'./puck-design-lab.css';

const STORAGE_KEY='crashout-puck-spike-v1';
const BASE=import.meta.env.BASE_URL||'/';
const publicAsset=path=>`${BASE}${String(path).replace(/^\/+/, '')}`;

const assetOptions=[
 {label:'Crashout Poker Logo',value:publicAsset('assets/remaster/entry-gate/CRASHOUT_LOGO.PNG')},
 {label:'Player Identity Panel',value:publicAsset('assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG')},
 {label:'Create Game Panel',value:publicAsset('assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG')},
 {label:'Join Game Panel',value:publicAsset('assets/remaster/homescreen/CRASHOUT_JOIN_GAME_PANEL.PNG')},
 {label:'Booster Shop Panel',value:publicAsset('assets/remaster/homescreen/CRASHOUT_BOOSTER_PANEL.PNG')},
 {label:'Entry Primary Action',value:publicAsset('assets/remaster/entry-gate/CRASHOUT_PRIMARY_ACTION.PNG')},
 {label:'Entry Utility Badge',value:publicAsset('assets/remaster/entry-gate/UTILITY_INFO_BADGE.PNG')}
];

const backgroundOptions=[
 {label:'Home — Mobile',value:publicAsset('assets/remaster/homescreen/CRASHOUT_MOBILE_BG.PNG')},
 {label:'Entry Gate — Mobile',value:publicAsset('assets/remaster/entry-gate/CRASHOUT_MOBILE_BG.PNG')},
 {label:'Home — Desktop',value:publicAsset('assets/remaster/homescreen/CRASHOUT_DESKTOP_BG.PNG')},
 {label:'Entry Gate — Desktop',value:publicAsset('assets/remaster/entry-gate/CRASHOUT_DESKTOP_BG.PNG')}
];

const primaryAction=publicAsset('assets/remaster/entry-gate/CRASHOUT_PRIMARY_ACTION.PNG');
const utilityBadge=publicAsset('assets/remaster/entry-gate/UTILITY_INFO_BADGE.PNG');
const homeMobile=publicAsset('assets/remaster/homescreen/CRASHOUT_MOBILE_BG.PNG');
const createPanel=publicAsset('assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG');
const logoAsset=publicAsset('assets/remaster/entry-gate/CRASHOUT_LOGO.PNG');
const profileAsset=publicAsset('assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG');

const spanOptions=Array.from({length:12},(_,i)=>({label:String(i+1),value:i+1}));
const rowOptions=Array.from({length:12},(_,i)=>({label:String(i+1),value:i+1}));

function gridStyle(columns=12,rows=3){
 return{gridColumn:`span ${Math.max(1,Math.min(12,Number(columns)||12))}`,gridRow:`span ${Math.max(1,Math.min(12,Number(rows)||3))}`};
}

const config={
 root:{
  fields:{
   background:{type:'select',options:backgroundOptions},
   minHeight:{type:'number',min:640,max:1200}
  },
  defaultProps:{
   background:homeMobile,
   minHeight:844
  },
  render:({children,background,minHeight})=><div className="puckSpikeCanvas" style={{backgroundImage:`linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.18)),url("${background}")`,minHeight:Number(minHeight)||844}}>{children}</div>
 },
 components:{
  Asset:{
   label:'Approved Asset',
   fields:{
    asset:{type:'select',options:assetOptions},
    columns:{type:'select',options:spanOptions},
    rows:{type:'select',options:rowOptions},
    fit:{type:'select',options:[{label:'Contain',value:'contain'},{label:'Cover',value:'cover'},{label:'Fill',value:'fill'}]}
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
   label:'Safe Text',
   fields:{
    text:{type:'text',contentEditable:true},
    columns:{type:'select',options:spanOptions},
    rows:{type:'select',options:rowOptions},
    fontSize:{type:'number',min:10,max:48},
    align:{type:'select',options:[{label:'Left',value:'left'},{label:'Center',value:'center'},{label:'Right',value:'right'}]}
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
   label:'Safe Control Shell',
   fields:{
    asset:{type:'select',options:[
     {label:'Primary Action',value:primaryAction},
     {label:'Utility Badge',value:utilityBadge}
    ]},
    label:{type:'text',contentEditable:true},
    columns:{type:'select',options:spanOptions},
    rows:{type:'select',options:rowOptions}
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
  {type:'Asset',props:{id:'spike-profile',asset:profileAsset,columns:12,rows:4,fit:'fill'}},
  {type:'Text',props:{id:'spike-text',text:'CREATE GAME',columns:7,rows:2,fontSize:24,align:'left'}},
  {type:'Asset',props:{id:'spike-create',asset:createPanel,columns:12,rows:5,fit:'fill'}},
  {type:'ControlShell',props:{id:'spike-control',asset:primaryAction,label:'OPEN',columns:6,rows:3}}
 ],
 root:{props:{background:homeMobile,minHeight:844}},
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
   <div><strong>PUCK VISUAL EDITOR SPIKE</strong><span>LOCAL / MOCK / PRESENTATION ONLY</span>{savedAt&&<small>Saved locally {savedAt}</small>}</div>
   <button type="button" onClick={reset}>RESET LOCAL LAYOUT</button>
  </div>
  <Puck
   config={config}
   data={data}
   onPublish={publish}
   headerTitle="Crashout Poker — Puck Spike"
   viewports={viewports}
   dnd={{behavior:'fluid'}}
   height="calc(100dvh - 52px)"
  />
 </main>;
}
