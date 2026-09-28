// CRASHOUT POKER — Puck visual-editor approved asset whitelist.
// Presentation-only. Paths are relative to public/ and are converted to deployment-safe URLs by PuckDesignLab.

import{puckUploadedAssets}from'./puck-uploaded-assets.generated.js';
import{SKIN_REGISTRY}from'../skin-system.js';

const channelLabel={lobbyBg:'Lobby BG',gameRoomBg:'Game Room BG',gameplayTheme:'In-Game Theme',tableSkin:'Table Skin',menuTheme:'Menu / Panel Theme'};
const skinAssets=[];
const skinBackgrounds=[];
const seen=new Set();
for(const skin of Object.values(SKIN_REGISTRY)){
 for(const[channel,data]of Object.entries(skin.channels||{})){
  for(const[role,path]of Object.entries(data||{})){
   if(!path)continue;
   const key=`${skin.id}:${channel}:${role}:${path}`;
   if(seen.has(key))continue;seen.add(key);
   const item={id:`skin-${skin.id}-${channel}-${role}`,label:`Skin — ${skin.label} — ${channelLabel[channel]||channel} — ${role}`,path,kind:'asset'};
   skinAssets.push(item);
   if(channel==='lobbyBg'||channel==='gameRoomBg')skinBackgrounds.push(item);
  }
 }
}

export const puckApprovedAssets = [
  ...puckUploadedAssets,
  ...skinAssets,

  // Brand / identity
  { id:'logo', label:'Brand — Crashout Poker Logo', path:'assets/remaster/entry-gate/CRASHOUT_LOGO.PNG', kind:'asset' },
  { id:'player-identity', label:'Home — Player Identity Panel', path:'assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG', kind:'asset' },

  // Home controls / panels
  { id:'home-create', label:'Home — Create Game Panel', path:'assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG', kind:'asset' },
  { id:'home-join', label:'Home — Join Game Panel', path:'assets/remaster/homescreen/CRASHOUT_JOIN_GAME_PANEL.PNG', kind:'asset' },
  { id:'home-booster', label:'Home — Booster Shop Panel', path:'assets/remaster/homescreen/CRASHOUT_BOOSTER_PANEL.PNG', kind:'asset' },
  { id:'home-input', label:'Home — Input / Host Strip', path:'assets/remaster/homescreen/CRASHOUT_INPUT_FIELD.PNG', kind:'asset' },

  // Entry / utility
  { id:'entry-primary', label:'Entry — Primary Action', path:'assets/remaster/entry-gate/CRASHOUT_PRIMARY_ACTION.PNG', kind:'asset' },
  { id:'entry-utility', label:'Entry — Utility Info Badge', path:'assets/remaster/entry-gate/UTILITY_INFO_BADGE.PNG', kind:'asset' },
  { id:'entry-info-2', label:'Entry — Info Bar 2', path:'assets/remaster/entry-gate/CRASHOUT_INFO_BAR_2.PNG', kind:'asset' },
  { id:'entry-input', label:'Entry — Input Field', path:'assets/remaster/entry-gate/CRASHOUT_INPUT_FIELD.PNG', kind:'asset' },
  { id:'entry-master-panel', label:'Entry — Master Full-Screen Panel', path:'assets/remaster/entry-gate/CRASHOUT_MASTER_FULL_SCREEN_PANEL.PNG', kind:'asset' }
];

export const puckApprovedBackgrounds = [
  ...skinBackgrounds.map(item=>({...item,label:item.label.replace(/^Skin — /,'')})),
  { id:'entry-mobile', label:'Entry — Mobile Background', path:'assets/remaster/entry-gate/CRASHOUT_MOBILE_BG.PNG' },
  { id:'entry-landscape', label:'Entry — Landscape Background', path:'assets/remaster/entry-gate/CRASHOUT_LANDSCAPE_BG.PNG' },
  { id:'entry-desktop', label:'Entry — Desktop Background', path:'assets/remaster/entry-gate/CRASHOUT_DESKTOP_BG.PNG' }
];
