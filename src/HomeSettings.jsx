import React,{useEffect,useRef,useState}from'react';
import{pokerAudio}from'./poker-audio.js';

// Device settings that already exist in the app. Sound is stored per device by poker-audio.js;
// Telegram turn alerts belong to the account and stay in the profile drawer.
export default function HomeSettings({onClose,hasTelegram,onOpenProfile}){
 const[muted,setMuted]=useState(()=>!!pokerAudio.muted),[volume,setVolume]=useState(()=>Math.round((pokerAudio.volume??0.82)*100));
 const closeRef=useRef(null);
 useEffect(()=>{closeRef.current?.focus();const key=e=>{if(e.key==='Escape')onClose()};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[onClose]);
 const toggle=()=>{const next=!muted;pokerAudio.setMuted(next);setMuted(next)};
 const changeVolume=e=>{const v=Number(e.target.value);pokerAudio.setVolume(v/100);setVolume(v)};
 return <div className="homeSettingsShade" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="homeSettingsModal" role="dialog" aria-modal="true" aria-labelledby="home-settings-title">
   <header className="homeSettingsHead"><h2 id="home-settings-title">Settings</h2><button ref={closeRef} type="button" className="homeSettingsClose" onClick={onClose} aria-label="Close settings">×</button></header>
   <div className="notificationList">
    <button type="button" className={`notificationToggle ${muted?'':'on'}`} aria-pressed={!muted} onClick={toggle}><span><b>Table sound</b><small>Cards, chips and turn cues on this device</small></span><i>{muted?'OFF':'ON'}</i></button>
    <label className="homeSettingsVolume"><span>Volume</span><input type="range" min="0" max="100" step="1" value={volume} disabled={muted} onChange={changeVolume} aria-label="Table sound volume"/><b>{volume}%</b></label>
   </div>
   {hasTelegram&&<button type="button" className="homeSettingsLink" onClick={onOpenProfile}>Telegram turn alerts are in your profile →</button>}
  </section>
 </div>;
}
