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

const knownMeta={
 default:{label:'Crashout Poker',unlock:null,tier:'default'},
 magenta:{label:'Magenta',unlock:'__owner_preview__',tier:'normal'},
 sapphire:{label:'Sapphire',unlock:'__owner_preview__',tier:'normal'},
 envy:{label:'Envy',unlock:'__owner_preview__',tier:'normal'},
 crimson:{label:'Crimson',unlock:'__owner_preview__',tier:'normal'},
 'full-tilt':{label:'Full Tilt',unlock:'__owner_preview__',tier:'premium'},
 dwallet:{label:'DWallet',unlock:'__owner_preview__',tier:'premium'},
 constellation:{label:'Constellation',unlock:'constellation',tier:'booster'},
 'dead-mans-hand':{label:"Dead Man's Hand",unlock:'deadMansHand',tier:'booster'},
 regalia:{label:'Regalia',unlock:'regalia',tier:'booster'}
};
const humanize=value=>String(value).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

for(const skin of Object.values(seed)){
 const meta=knownMeta[skin.id]||{};
 skin.label=meta.label||skin.label||humanize(skin.id);
 skin.unlock=Object.prototype.hasOwnProperty.call(meta,'unlock')?meta.unlock:(skin.unlock??'__owner_preview__');
 skin.tier=meta.tier||skin.tier||'custom';
}
function ensureSkin(id){
 if(!seed[id]){
  const meta=knownMeta[id]||{};
  seed[id]={id,label:meta.label||humanize(id),unlock:Object.prototype.hasOwnProperty.call(meta,'unlock')?meta.unlock:'__owner_preview__',tier:meta.tier||'custom',channels:{}};
 }
 return seed[id];
}
function channelKey(raw){
 return raw==='lobby-bg'?'lobbyBg':raw==='game-room-bg'?'gameRoomBg':raw==='gameplay'?'gameplayTheme':raw==='table'?'tableSkin':'menuTheme';
}
const chosen=new Map();
const cleanToken=value=>String(value||'').trim().toLowerCase().replace(/[\s_]+/g,'-').replace(/\.+$/g,'').replace(/-+/g,'-').replace(/^-|-$/g,'');
const sourceScore=name=>(name!==name.trim()?20:0)+(/\.\./.test(name)?10:0)+(new RegExp('\\.(?:png|jpe?g|webp|svg)\\.(?:png|jpe?g|webp|svg)

const ordered=Object.fromEntries(Object.keys(seed).sort((a,b)=>a==='default'?-1:b==='default'?1:a.localeCompare(b)).map(id=>[id,seed[id]]));
const source=`// AUTO-GENERATED by scripts/generate-skin-registry.mjs. Do not hand-edit.\nexport const GENERATED_SKIN_REGISTRY=${JSON.stringify(ordered,null,2)};\n`;
fs.writeFileSync(out,source);
console.log(`Skin registry: ${Object.keys(ordered).length} skin(s), ${fs.readdirSync(inbox).filter(name=>imageExts.has(path.extname(name).toLowerCase())).length} uploaded asset(s)`);
,'i').test(name)?10:0);
function put(map,key,value,source,slot){
 const nextScore=sourceScore(source),prior=chosen.get(slot);
 if(prior&&prior.score<=nextScore){
  console.warn(`Skin upload duplicate ignored for ${slot}: "${source}" (using "${prior.source}")`);
  return;
 }
 if(prior)console.warn(`Skin upload duplicate replaced for ${slot}: "${prior.source}" -> "${source}"`);
 chosen.set(slot,{score:nextScore,source});
 map[key]=value;
}

for(const entry of fs.readdirSync(inbox,{withFileTypes:true}).filter(x=>x.isFile()).sort((a,b)=>a.name.localeCompare(b.name))){
 const originalName=entry.name,trimmedName=originalName.trim(),ext=path.extname(trimmedName).toLowerCase();
 if(!imageExts.has(ext))continue;
 let stem=trimmedName.slice(0,-ext.length);
 while(/\.(?:png|jpe?g|webp|svg)$/i.test(stem))stem=stem.replace(/\.(?:png|jpe?g|webp|svg)$/i,'');
 stem=stem.replace(/\.+$/,'');
 let parts=stem.split('__').map(x=>x.trim()).filter(Boolean);
 if(parts.length<2){
  const legacy=stem.match(/^(.+?)_(lobby-bg|game-room-bg|table)$/i);
  if(legacy)parts=[legacy[1],legacy[2]];
 }
 if(parts.length<2)throw new Error(`Invalid skin filename "${originalName}". Expected skin-id__channel[__role].ext`);
 const id=cleanToken(parts[0]),rawChannel=cleanToken(parts[1]),roleRaw=parts[2]?cleanToken(parts[2]):'';
 if(!/^[a-z0-9-]+$/.test(id))throw new Error(`Invalid skin id in "${originalName}".`);
 if(!channels.has(rawChannel))throw new Error(`Unknown skin channel "${rawChannel}" in "${originalName}".`);
 const skin=ensureSkin(id),key=channelKey(rawChannel),assetPath=`skin-uploads/${originalName}`;
 if(rawChannel==='lobby-bg'||rawChannel==='game-room-bg'){
  const variant=roleRaw||'default';
  if(!bgVariants.has(variant))throw new Error(`Invalid background variant "${variant}" in "${originalName}". Use mobile, desktop, landscape, or omit it.`);
  skin.channels[key]??={};
  put(skin.channels[key],variant,assetPath,originalName,`${id}:${key}:${variant}`);
 }else if(rawChannel==='table'){
  if(roleRaw)throw new Error(`Table skin "${originalName}" should not include a role. Use skin-id__table.ext`);
  skin.channels[key]??={};
  put(skin.channels[key],'default',assetPath,originalName,`${id}:${key}:default`);
 }else{
  if(!roleRaw||!/^[a-z0-9-]+$/.test(roleRaw))throw new Error(`Skin "${originalName}" needs a role, e.g. SKIN__${rawChannel}__create-panel.png`);
  skin.channels[key]??={};
  put(skin.channels[key],roleRaw,assetPath,originalName,`${id}:${key}:${roleRaw}`);
 }
}

const ordered=Object.fromEntries(Object.keys(seed).sort((a,b)=>a==='default'?-1:b==='default'?1:a.localeCompare(b)).map(id=>[id,seed[id]]));
const source=`// AUTO-GENERATED by scripts/generate-skin-registry.mjs. Do not hand-edit.\nexport const GENERATED_SKIN_REGISTRY=${JSON.stringify(ordered,null,2)};\n`;
fs.writeFileSync(out,source);
console.log(`Skin registry: ${Object.keys(ordered).length} skin(s), ${fs.readdirSync(inbox).filter(name=>imageExts.has(path.extname(name).toLowerCase())).length} uploaded asset(s)`);
