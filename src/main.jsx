import React from'react';
import{createRoot}from'react-dom/client';
import App from'./App.jsx';
import PuckDesignLab from'./PuckDesignLab.jsx';
import{installAfterdarkPreview}from'./afterdark-preview.js';
import'./production-system.css';
import{installSessionRouting}from'./session.js';
import{bootstrapPlatform}from'./platform.js';
import{installPokerAudioUnlock}from'./poker-audio.js';
import'./global-royal-grade.css';
import'./telegram.css';

installPokerAudioUnlock();

const root=createRoot(document.getElementById('root'));
const isPuckDesignLab=()=>/^#\/design-lab\/puck(?:$|\?)/i.test(location.hash);
const isAfterdarkPreview=()=>{try{return new URLSearchParams(location.search).get('afterdarkPreview')==='1'}catch{return false}};

function render(){
 root.render(isPuckDesignLab()?<PuckDesignLab/>:<App/>);
}

async function boot(){
 if(isAfterdarkPreview()){render();installAfterdarkPreview();return}
 if(isPuckDesignLab()){
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
