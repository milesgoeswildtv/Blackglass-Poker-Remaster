import React from'react';
import{createRoot}from'react-dom/client';
import App from'./App.jsx';
import AfterdarkPokerLab from'./AfterdarkPokerLab.jsx';
import AfterdarkSurfacePreview from'./AfterdarkSurfacePreview.jsx';
import{installAfterdarkPreview}from'./afterdark-preview.js';
import'./production-system.css';
import{installSessionRouting}from'./session.js';
import{bootstrapPlatform}from'./platform.js';
import{installPokerAudioUnlock}from'./poker-audio.js';
import'./global-royal-grade.css';
import'./telegram.css';

installPokerAudioUnlock();

const root=createRoot(document.getElementById('root'));
const isAfterdarkLab=()=>/^#\/design-lab\/afterdark(?:$|\?)/i.test(location.hash);
const isAfterdarkPreview=()=>{try{return new URLSearchParams(location.search).get('afterdarkPreview')==='1'}catch{return false}};

function render(){
 root.render(isAfterdarkPreview()?<AfterdarkSurfacePreview/>:isAfterdarkLab()?<AfterdarkPokerLab/>:<App/>);
}

async function boot(){
 if(isAfterdarkPreview()){render();installAfterdarkPreview();return}
 if(/^#\/design-lab\/puck(?:$|\?)/i.test(location.hash)){
  location.hash='#/design-lab/afterdark';
  return;
 }
 if(isAfterdarkLab()){
  render();
  addEventListener('hashchange',()=>location.reload());
  return;
 }
 root.render(<div className="telegramBoot">Opening Crashout Poker…</div>);
 await bootstrapPlatform();
 installSessionRouting();
 addEventListener('hashchange',render);
 render();
}

boot();
