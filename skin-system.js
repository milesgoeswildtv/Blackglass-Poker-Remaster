import{GENERATED_SKIN_REGISTRY}from'./skin-registry.generated.js';

export const SKIN_CHANNELS=[
 {key:'lobbyBg',label:'Lobby BG',kind:'background'},
 {key:'gameRoomBg',label:'Game Room BG',kind:'background'},
 {key:'gameplayTheme',label:'In-Game Theme',kind:'theme'},
 {key:'tableSkin',label:'Table Skin',kind:'single'},
 {key:'menuTheme',label:'Menu / Panel Theme',kind:'theme'}
];
export const SKIN_CHANNEL_KEYS=SKIN_CHANNELS.map(x=>x.key);
export const DEFAULT_SKIN_LOADOUT=Object.freeze({lobbyBg:'default',gameRoomBg:'default',gameplayTheme:'default',tableSkin:'default',menuTheme:'default'});
export const SKIN_REGISTRY=GENERATED_SKIN_REGISTRY;

export function normalizeSkinId(value){const id=String(value||'default').trim().toLowerCase();return SKIN_REGISTRY[id]?id:'default'}
export function normalizeSkinLoadout(value={}){
 const src=value&&typeof value==='object'?value:{},out={...DEFAULT_SKIN_LOADOUT};
 for(const channel of SKIN_CHANNEL_KEYS){
  const id=String(src[channel]||'default').trim().toLowerCase();
  out[channel]=SKIN_REGISTRY[id]?.channels?.[channel]?id:'default';
 }
 return out;
}
export function skinSupportsChannel(skinId,channel){return!!SKIN_REGISTRY[String(skinId||'')]?.channels?.[channel]}
export function skinUnlockKey(skinId){const skin=SKIN_REGISTRY[String(skinId||'')];return skin?skin.unlock:'__owner_preview__'}
export function canUseSkin(skinId,inventory=[],ownerPreview=false){
 const skin=SKIN_REGISTRY[String(skinId||'')];if(!skin)return false;
 if(ownerPreview)return true;
 const unlock=skin.unlock;
 return unlock==null||unlock===''||(Array.isArray(inventory)&&inventory.includes(unlock));
}
export function skinChoices(channel,inventory=[],ownerPreview=false){
 return Object.values(SKIN_REGISTRY)
  .filter(skin=>skin.channels?.[channel])
  .map(skin=>({...skin,owned:canUseSkin(skin.id,inventory,ownerPreview)}))
  .sort((a,b)=>a.id==='default'?-1:b.id==='default'?1:a.label.localeCompare(b.label));
}
export function skinChannelData(loadout,channel){
 const normalized=normalizeSkinLoadout(loadout),selected=SKIN_REGISTRY[normalized[channel]],fallback=SKIN_REGISTRY.default;
 return{...(fallback?.channels?.[channel]||{}),...(selected?.channels?.[channel]||{})};
}
export function backgroundVariant(loadout,channel,variant='default'){
 const data=skinChannelData(loadout,channel);
 return data?.[variant]||data?.default||data?.mobile||data?.desktop||data?.landscape||'';
}
export function themeAsset(loadout,channel,role){
 const data=skinChannelData(loadout,channel);
 return String(data?.[role]||'');
}
export function mergeSkinLoadout(primary={},secondary={}){
 const a=normalizeSkinLoadout(primary),b=normalizeSkinLoadout(secondary),out={...DEFAULT_SKIN_LOADOUT};
 for(const channel of SKIN_CHANNEL_KEYS)out[channel]=a[channel]!=='default'?a[channel]:b[channel];
 return normalizeSkinLoadout(out);
}
export function allSkinAssetPaths(){
 const paths=new Set();
 for(const skin of Object.values(SKIN_REGISTRY))for(const data of Object.values(skin.channels||{}))for(const value of Object.values(data||{}))if(value)paths.add(value);
 return[...paths];
}
