import React,{useEffect,useMemo,useState}from'react';
import{SKIN_CHANNELS,normalizeSkinLoadout,skinChoices}from'../skin-system.js';
import{skinPreviewAsset}from'./skin-client.js';
import'./skin-drawer.css';

export default function SkinDrawer({open,onClose,account,ownerPreview=false,onAccount,onMessage}){
 const[active,setActive]=useState('lobbyBg'),[busy,setBusy]=useState('');
 const loadout=normalizeSkinLoadout(account?.skins),inventory=Array.isArray(account?.inventory)?account.inventory:[];
 const channel=SKIN_CHANNELS.find(x=>x.key===active)||SKIN_CHANNELS[0];
 const choices=useMemo(()=>skinChoices(channel.key,inventory,ownerPreview),[channel.key,inventory.join('|'),ownerPreview]);
 useEffect(()=>{if(!open)return;const prior=document.body.style.overflow;document.body.style.overflow='hidden';const esc=e=>{if(e.key==='Escape')onClose?.()};addEventListener('keydown',esc);return()=>{document.body.style.overflow=prior;removeEventListener('keydown',esc)}},[open,onClose]);
 if(!open)return null;
 async function equip(skin){
  if(!skin.owned||busy)return;
  const key=`${channel.key}:${skin.id}`;setBusy(key);
  try{
   const r=await fetch('/api/account/skin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({channel:channel.key,skinId:skin.id})}),j=await r.json().catch(()=>({}));
   if(!r.ok){onMessage?.(j.error||'Could not equip that skin.');return}
   onAccount?.(j.account);
   onMessage?.(`${skin.label} equipped for ${channel.label}.`);
  }catch{onMessage?.('Could not reach skin services.')}finally{setBusy('')}
 }
 return <div className="skinShade" onMouseDown={e=>{if(e.target===e.currentTarget)onClose?.()}}>
  <section className="skinDrawer" role="dialog" aria-modal="true" aria-label="Crashout Poker skins">
   <header><div><small>CRASHOUT POKER</small><h2>SKINS</h2><p>Mix the five channels however you want.</p></div><button type="button" onClick={onClose} aria-label="Close skins">×</button></header>
   <nav className="skinChannels" aria-label="Skin categories">{SKIN_CHANNELS.map(item=><button type="button" key={item.key} className={active===item.key?'active':''} onClick={()=>setActive(item.key)}><span>{item.label}</span><small>{loadout[item.key]==='default'?'Crashout Poker':loadout[item.key]}</small></button>)}</nav>
   <div className="skinChannelHead"><div><small>EDITING</small><b>{channel.label}</b></div><span>{choices.filter(x=>x.owned).length} unlocked</span></div>
   <div className="skinChoiceGrid">{choices.map(skin=>{const preview=skinPreviewAsset(skin,channel.key),selected=loadout[channel.key]===skin.id,key=`${channel.key}:${skin.id}`;return <button type="button" key={skin.id} disabled={!skin.owned||!!busy} className={`skinChoice ${selected?'selected':''} ${skin.owned?'':'locked'}`} onClick={()=>equip(skin)}>
    <span className="skinChoicePreview">{preview?<img src={preview} alt="" draggable="false"/>:<i>NO PREVIEW</i>}</span>
    <span className="skinChoiceCopy"><b>{skin.label}</b><small>{selected?'EQUIPPED':busy===key?'EQUIPPING…':skin.owned?(skin.unlock==='__owner_preview__'?'OWNER PREVIEW':'UNLOCKED'):'LOCKED'}</small></span>
   </button>})}</div>
   <footer><span>Each category equips independently.</span><button type="button" onClick={onClose}>DONE</button></footer>
  </section>
 </div>
}
