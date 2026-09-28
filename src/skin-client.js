import{SKIN_REGISTRY,backgroundVariant,normalizeSkinLoadout,skinChannelData,themeAsset}from'../skin-system.js';

const LOGO_FILTERS=Object.freeze({
 default:'none',
 magenta:'saturate(1.75) hue-rotate(275deg) brightness(1.03)',
 sapphire:'saturate(1.8) hue-rotate(170deg) brightness(.98)',
 envy:'saturate(1.65) hue-rotate(80deg) brightness(.98)',
 crimson:'saturate(1.9) hue-rotate(320deg) brightness(.96)',
 'full-tilt':'saturate(1.45) brightness(1.04)',
 dwallet:'saturate(1.7) hue-rotate(125deg) brightness(1.02)'
});
function logoPresentation(loadout={}){
 const normalized=normalizeSkinLoadout(loadout),id=normalized.menuTheme||'default';
 const selected=SKIN_REGISTRY[id]?.channels?.brandTheme?.default;
 const fallback=SKIN_REGISTRY.default?.channels?.brandTheme?.default||'assets/remaster/entry-gate/CRASHOUT_LOGO.PNG';
 return{asset:selected||fallback,filter:selected?'none':(LOGO_FILTERS[id]||'none')};
}

const BASE=import.meta.env.BASE_URL||'/';
export function skinAssetUrl(value){const path=String(value||'');if(!path)return'';if(/^(?:https?:|data:|blob:)/i.test(path))return path;return`${BASE}${path.replace(/^\/+/, '')}`}
const bg=value=>value?`url("${skinAssetUrl(value)}")`:'';

export function lobbySkinStyle(loadout={}){
 const menu=skinChannelData(loadout,'menuTheme'),logo=logoPresentation(loadout);
 return{
  '--skin-brand-logo':bg(logo.asset),
  '--skin-brand-filter':logo.filter,
  '--skin-lobby-bg-mobile':bg(backgroundVariant(loadout,'lobbyBg','mobile')),
  '--skin-lobby-bg-desktop':bg(backgroundVariant(loadout,'lobbyBg','desktop')),
  '--skin-lobby-bg-landscape':bg(backgroundVariant(loadout,'lobbyBg','landscape')),
  '--skin-menu-identity':bg(menu['identity-panel']),
  '--skin-menu-host':bg(menu['host-bar']),
  '--skin-menu-create':bg(menu['create-panel']),
  '--skin-menu-join':bg(menu['join-panel']),
  '--skin-menu-shop':bg(menu['shop-panel']),
  '--skin-menu-input':bg(menu['input-field']),
  '--skin-menu-primary':bg(menu['primary-action']),
  '--skin-menu-utility':bg(menu['utility-badge']),
  '--skin-menu-master':bg(menu['master-panel']),
  '--skin-menu-small':bg(menu['small-button'])
 };
}

export function gameSkinStyle(loadout={}){
 const selected=normalizeSkinLoadout(loadout).gameplayTheme,gameplay=selected==='default'?{}:(SKIN_REGISTRY[selected]?.channels?.gameplayTheme||{});
 return{
  '--skin-game-bg-mobile':bg(backgroundVariant(loadout,'gameRoomBg','mobile')),
  '--skin-game-bg-desktop':bg(backgroundVariant(loadout,'gameRoomBg','desktop')),
  '--skin-game-bg-landscape':bg(backgroundVariant(loadout,'gameRoomBg','landscape')),
  '--skin-gameplay-fold':bg(gameplay['action-fold']),
  '--skin-gameplay-call':bg(gameplay['action-call']),
  '--skin-gameplay-raise':bg(gameplay['action-raise']),
  '--skin-gameplay-all-in':bg(gameplay['action-all-in']),
  '--skin-gameplay-utility':bg(gameplay['utility-button'])
 };
}
export function tableSkinAsset(loadout={}){return skinAssetUrl(backgroundVariant(loadout,'tableSkin','default'))}
export function gameplayThemeAssets(loadout={}){
 const selected=normalizeSkinLoadout(loadout).gameplayTheme,data=selected==='default'?{}:(SKIN_REGISTRY[selected]?.channels?.gameplayTheme||{}),out={};
 for(const[key,value]of Object.entries(data||{}))out[key]=skinAssetUrl(value);
 return out;
}
export function skinPreviewAsset(skin,channel){
 const data=skin?.channels?.[channel]||{};
 const preferred=channel==='lobbyBg'||channel==='gameRoomBg'?data.mobile||data.default||data.desktop:channel==='tableSkin'?data.default:data['create-panel']||data['player-plaque-idle']||data['card-back']||Object.values(data)[0];
 return skinAssetUrl(preferred||'');
}
export function menuAsset(loadout,role){return skinAssetUrl(themeAsset(loadout,'menuTheme',role))}
