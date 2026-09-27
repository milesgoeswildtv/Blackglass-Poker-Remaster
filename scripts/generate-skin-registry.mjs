import fs from'node:fs';
import path from'node:path';

const root=process.cwd();
const inbox=path.join(root,'public','skin-uploads');
const out=path.join(root,'skin-registry.generated.js');
const imageExts=new Set(['.png','.jpg','.jpeg','.webp','.svg']);
const channels=new Set(['lobby-bg','game-room-bg','gameplay','table','menu']);
const bgVariants=new Set(['default','mobile','desktop','landscape']);

fs.mkdirSync(inbox,{recursive:true});

const seed={
 default:{
  id:'default',label:'Crashout Poker',unlock:null,
  channels:{
   lobbyBg:{default:'assets/remaster/homescreen/CRASHOUT_MOBILE_BG.PNG',mobile:'assets/remaster/homescreen/CRASHOUT_MOBILE_BG.PNG',desktop:'assets/remaster/homescreen/CRASHOUT_DESKTOP_BG.PNG',landscape:'assets/remaster/homescreen/CRASHOUT_LANDSCAPE_BG.PNG'},
   gameRoomBg:{default:'assets/remaster/CRASHOUT_BACKGROUND_REMASTER.webp'},
   gameplayTheme:{
    'avatar-frame':'assets/default/default-avatar-frame.png',
    'card-back':'assets/crashout/CrashoutCardBack.PNG',
    'player-plaque-idle':'assets/default/default-player-plaque.png',
    'player-plaque-active':'assets/default/default-player-plaque-active.png',
    'player-plaque-folded':'assets/default/default-player-plaque-folded.png',
    'player-plaque-all-in':'assets/default/default-player-plaque-all-in.png',
    'chip-black':'assets/default/default-chip-black.png',
    'chip-blue':'assets/default/default-chip-blue.png',
    'chip-green':'assets/default/default-chip-green.png',
    'chip-purple':'assets/default/default-chip-purple.png',
    'chip-red':'assets/default/default-chip-red.png',
    'action-log':'assets/default/action-log.png',
    'chat':'assets/default/chat-panel.png',
    'hand-history':'assets/default/hand-history.png',
    'invite':'assets/default/invite-table-code.png',
    'spectator':'assets/default/spectator-ui.png',
    'showdown':'assets/default/showdown-ui.png',
    'tournament-winner':'assets/default/tournament-winner-ui.png',
    'top-bar':'assets/default/top-bar.png',
    'info-strip':'assets/default/info-strip.png',
    'tournament-stats':'assets/default/tournament-stats.png'
   },
   tableSkin:{default:'assets/remaster/CRASHOUT_TABLE_REMASTER.webp'},
   menuTheme:{
    'identity-panel':'assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG',
    'host-bar':'assets/remaster/homescreen/CRASHOUT_INPUT_FIELD.PNG',
    'create-panel':'assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG',
    'join-panel':'assets/remaster/homescreen/CRASHOUT_JOIN_GAME_PANEL.PNG',
    'shop-panel':'assets/remaster/homescreen/CRASHOUT_BOOSTER_PANEL.PNG',
    'input-field':'assets/remaster/entry-gate/CRASHOUT_INPUT_FIELD.PNG',
    'primary-action':'assets/remaster/entry-gate/CRASHOUT_PRIMARY_ACTION.PNG',
    'utility-badge':'assets/remaster/entry-gate/UTILITY_INFO_BADGE.PNG',
    'master-panel':'assets/remaster/entry-gate/CRASHOUT_MASTER_FULL_SCREEN_PANEL.PNG'
   }
  }
 },
 constellation:{
  id:'constellation',label:'Constellation',unlock:'constellation',
  channels:{gameplayTheme:{
   'avatar-frame':'assets/constellation/constellation-avatar-frame.png',
   'card-back':'assets/constellation/card-back-constellation.png',
   'player-plaque-idle':'assets/constellation/constellation-idle-player-plaque.png',
   'player-plaque-active':'assets/constellation/constellation-active-player-plaque.png',
   'player-plaque-folded':'assets/constellation/constellation-fold-player-plaque.png',
   'player-plaque-all-in':'assets/constellation/constellation-all-in-player-plaque.png',
   'chip-black':'assets/constellation/constellation-black-chip.png',
   'chip-blue':'assets/constellation/constellation-blue-chip.png',
   'chip-green':'assets/constellation/constellation-green-chip.png',
   'chip-purple':'assets/constellation/constellation-purple-chip.png',
   'chip-red':'assets/constellation/constellation-red-chip.png'
  }}
 },
 'dead-mans-hand':{
  id:'dead-mans-hand',label:"Dead Man's Hand",unlock:'deadMansHand',
  channels:{gameplayTheme:{
   'avatar-frame':'assets/dead-mans-hand/dead-mans-hand-avatar-frame.png',
   'card-back':'assets/dead-mans-hand/card-back-skull.png',
   'player-plaque-idle':'assets/dead-mans-hand/dead-mans-hand-idle-player-plaque.png',
   'player-plaque-active':'assets/dead-mans-hand/dead-mans-hand-active-player-plaque.png',
   'player-plaque-folded':'assets/dead-mans-hand/dead-mans-hand-folded-player-plaque.png',
   'player-plaque-all-in':'assets/dead-mans-hand/dead-mans-hand-all-in-player-plaque.png',
   'chip-black':'assets/dead-mans-hand/dead-mans-hand-black-chip.png',
   'chip-blue':'assets/dead-mans-hand/dead-mans-hand-blue-chip.png',
   'chip-green':'assets/dead-mans-hand/dead-mans-hand-green-chip.png',
   'chip-purple':'assets/dead-mans-hand/dead-mans-hand-purple-chip.png',
   'chip-red':'assets/dead-mans-hand/dead-mans-hand-red-chip.png'
  }}
 },
 regalia:{
  id:'regalia',label:'Regalia',unlock:'regalia',
  channels:{gameplayTheme:{
   'avatar-frame':'assets/regalia/regalia-avatar-frame.png',
   'card-back':'assets/regalia/regalia-card-back.png',
   'player-plaque-idle':'assets/regalia/regalia-idle-player-plaque.png',
   'player-plaque-active':'assets/regalia/regalia-active-player-plaque.png',
   'player-plaque-folded':'assets/regalia/regalia-folded-player-plaque.png',
   'player-plaque-all-in':'assets/regalia/regalia-all-in-player-plaque.png',
   'chip-black':'assets/regalia/regalia-black-chip.png',
   'chip-blue':'assets/regalia/regalia-blue-chip.png',
   'chip-green':'assets/regalia/regalia-green-chip.png',
   'chip-purple':'assets/regalia/regalia-purple-chip.png',
   'chip-red':'assets/regalia/regalia-red-chip.png'
  }}
 }
};

const knownUnlocks={default:null,constellation:'constellation','dead-mans-hand':'deadMansHand',regalia:'regalia'};
const humanize=value=>String(value).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

function ensureSkin(id){
 if(!seed[id])seed[id]={id,label:humanize(id),unlock:Object.prototype.hasOwnProperty.call(knownUnlocks,id)?knownUnlocks[id]:'__owner_preview__',channels:{}};
 return seed[id];
}
function channelKey(raw){
 return raw==='lobby-bg'?'lobbyBg':raw==='game-room-bg'?'gameRoomBg':raw==='gameplay'?'gameplayTheme':raw==='table'?'tableSkin':'menuTheme';
}
function put(map,key,value,source){
 if(Object.prototype.hasOwnProperty.call(map,key)&&map[key]!==value)console.warn(`Skin upload overrides ${source}: ${key}`);
 map[key]=value;
}

for(const entry of fs.readdirSync(inbox,{withFileTypes:true}).filter(x=>x.isFile()).sort((a,b)=>a.name.localeCompare(b.name))){
 const ext=path.extname(entry.name).toLowerCase();
 if(!imageExts.has(ext))continue;
 const stem=entry.name.slice(0,-ext.length);
 const parts=stem.split('__').map(x=>x.trim()).filter(Boolean);
 if(parts.length<2)throw new Error(`Invalid skin filename "${entry.name}". Expected skin-id__channel[__role].ext`);
 const[id,rawChannel,roleRaw]=parts;
 if(!/^[a-z0-9-]+$/.test(id))throw new Error(`Invalid skin id in "${entry.name}". Use lowercase letters, numbers, and hyphens.`);
 if(!channels.has(rawChannel))throw new Error(`Unknown skin channel "${rawChannel}" in "${entry.name}".`);
 const skin=ensureSkin(id),key=channelKey(rawChannel),assetPath=`skin-uploads/${entry.name}`;
 if(rawChannel==='lobby-bg'||rawChannel==='game-room-bg'){
  const variant=roleRaw||'default';
  if(!bgVariants.has(variant))throw new Error(`Invalid background variant "${variant}" in "${entry.name}". Use mobile, desktop, landscape, or omit it.`);
  skin.channels[key]??={};
  put(skin.channels[key],variant,assetPath,entry.name);
 }else if(rawChannel==='table'){
  if(roleRaw)throw new Error(`Table skin "${entry.name}" should not include a role. Use skin-id__table.ext`);
  skin.channels[key]??={};
  put(skin.channels[key],'default',assetPath,entry.name);
 }else{
  if(!roleRaw||!/^[a-z0-9-]+$/.test(roleRaw))throw new Error(`Skin "${entry.name}" needs a lowercase role, e.g. skin__${rawChannel}__create-panel.png`);
  skin.channels[key]??={};
  put(skin.channels[key],roleRaw,assetPath,entry.name);
 }
}

const ordered=Object.fromEntries(Object.keys(seed).sort((a,b)=>a==='default'?-1:b==='default'?1:a.localeCompare(b)).map(id=>[id,seed[id]]));
const source=`// AUTO-GENERATED by scripts/generate-skin-registry.mjs. Do not hand-edit.\nexport const GENERATED_SKIN_REGISTRY=${JSON.stringify(ordered,null,2)};\n`;
fs.writeFileSync(out,source);
console.log(`Skin registry: ${Object.keys(ordered).length} skin(s), ${fs.readdirSync(inbox).filter(name=>imageExts.has(path.extname(name).toLowerCase())).length} uploaded asset(s)`);
