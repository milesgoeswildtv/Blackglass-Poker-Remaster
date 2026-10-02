const seats=(prefix='poker.seat')=>Array.from({length:8},(_,i)=>[`${prefix}.${i+1}`,`Opponent Seat ${i+1}`,`[data-afterdark-slot="opponent-seat-${i+1}"]`]);
const cards=(prefix,label,selectorPrefix,count)=>Array.from({length:count},(_,i)=>[`${prefix}.${i+1}`,`${label} ${i+1}`,`[data-afterdark-slot="${selectorPrefix}-${i+1}"]`]);

const GAMEPLAY_BUILT_INS=[
 ['poker.gameplay.back','Back / Exit','[data-afterdark-slot="table-back"]'],
 ['poker.gameplay.header','Table Header / Info','[data-afterdark-slot="table-info"]'],
 ['poker.gameplay.commands','Top Commands','[data-afterdark-slot="top-commands"]'],
 ['poker.table','Table Artwork','.ftp3Stage','child-img','.ftp3TableShell'],
 ...seats(),
 ...cards('poker.board','Community Card','community-card',5),
 ['poker.pot','Pot','[data-afterdark-slot="pot"]'],
 ['poker.sidePots','Side Pots','[data-afterdark-slot="side-pots"]'],
 ...cards('poker.hero.card','Hero Hole Card','hero-card',2),
 ['poker.hero.plaque','Hero Plaque','[data-afterdark-slot="hero-plaque"]'],
 ['poker.handStrength','Hand Strength','[data-afterdark-slot="hand-strength"]'],
 ['poker.extraTime','Extra Time / Timer','[data-afterdark-slot="extra-time"]'],
 ['poker.action.fold','Fold','[data-afterdark-slot="action-fold"]'],
 ['poker.action.call','Check / Call','[data-afterdark-slot="action-call"]'],
 ['poker.action.raise','Bet / Raise','[data-afterdark-slot="action-raise"]'],
 ['poker.action.allIn','All In','[data-afterdark-slot="action-all-in"]'],
 ['poker.bet.amount','Bet Amount Label','[data-afterdark-slot="bet-amount"]'],
 ['poker.bet.slider','Bet Slider','[data-afterdark-slot="bet-slider"]'],
 ['poker.bet.quick','Quick Bet Group','[data-afterdark-slot="quick-bet-group"]'],
 ...cards('poker.bet.quick','Quick Bet','quick-bet',4),
 ['poker.chat','Chat','[data-afterdark-slot="chat"]'],
 ['poker.history','Hand Log / History','[data-afterdark-slot="history"]'],
];
const PREGAME_BUILT_INS=[
 ['poker.pregame.back','Back','[data-afterdark-slot="pregame-back"]'],
 ['poker.pregame.header','Header Information','[data-afterdark-slot="pregame-header"]'],
 ['poker.pregame.blinds','Blinds / Table Info','[data-afterdark-slot="pregame-blinds"]'],
 ['poker.table','Table Artwork','.ftp3Stage','child-img','.ftp3TableShell'],
 ...seats(),
 ...cards('poker.hero.card','Hero Hole Card','hero-card',2),
 ['poker.hero.plaque','Hero Plaque','[data-afterdark-slot="hero-plaque"]'],
 ['poker.pregame.start','Start Control','[data-afterdark-slot="pregame-start"]'],
 ['poker.pregame.utility','Utility Controls','[data-afterdark-slot="pregame-utility"]'],
 ['poker.chat','Chat','[data-afterdark-slot="chat"]'],
 ['poker.history','Hand Log / History','[data-afterdark-slot="history"]'],
];

export const AFTERDARK_SURFACES=[
 {id:'entry',label:'ENTRY',short:'ENTRY',backgroundChannel:'lobbyBg',scroll:'page',builtIns:[
  ['poker.entry.logo','Logo','.homeBrand h1','background'],
  ['poker.entry.tagline','Brand Tagline','.homeBrand p'],
  ['poker.entry.panel','Panel Artwork','.homeEntry','background',null,'background'],
  ['poker.entry.eyebrow','Private Access Label','.privateGate>.entryEyebrow'],
  ['poker.entry.title','Entry Title','.privateGate>h2'],
  ['poker.entry.copy','Entry Copy','.privateGate>p'],
  ['poker.entry.key','Enter Key Button','.privateGateChoices>button:first-child'],
  ['poker.entry.invite','Enter Invite Button','.privateGateChoices>button:nth-child(2)'],
 ]},
 {id:'home',label:'HOME',short:'HOME',backgroundChannel:'lobbyBg',scroll:'page',builtIns:[['poker.logo','Logo','.homeBrand h1','background'],['poker.identity','Player Identity','.homeIdentityTicket','background'],['poker.hostBar','Host Bar','.homeHostIdentity','background'],['poker.create','Create Game','.homeActionPrimary:first-child','background'],['poker.join','Join Game','.homeActionPrimary:nth-child(2)','background'],['poker.shop','Booster Shop','.homeActionShop','background'],['poker.utility','Engine + Fairness','.homeUtilityEntry button','background']]},
 {id:'invite',label:'INVITE',short:'INVITE',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:[['poker.invite.panel','Invite Panel','.inviteJoin']]},
 {id:'pregame',label:'PRE-GAME',short:'PRE',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:PREGAME_BUILT_INS},
 {id:'gameplay',label:'GAMEPLAY',short:'PLAY',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:GAMEPLAY_BUILT_INS},
 {id:'mtt-lobby',label:'MTT LOBBY',short:'MTT',backgroundChannel:'lobbyBg',scroll:'page',builtIns:[['poker.mtt.header','Tournament Header','.mttLobbyHeader'],['poker.mtt.status','Tournament Status','.mttStatusCard'],['poker.mtt.field','Tournament Field','.mttLobbyCard:not(.mttStatusCard)']]},
 {id:'mtt-break',label:'MTT BREAK',short:'BREAK',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:[['poker.mtt.break','Break Screen','.mttBreakScreen']]},
 {id:'mtt-move',label:'MTT MOVE',short:'MOVE',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:[['poker.mtt.move','Table Move','.mttMoveScreen']]},
 {id:'mtt-result',label:'MTT RESULT',short:'RESULT',backgroundChannel:'lobbyBg',scroll:'page',builtIns:[['poker.mtt.header','Tournament Header','.mttLobbyHeader'],['poker.mtt.result','Result Hero','.mttResultHero'],['poker.mtt.standings','Final Standings','.mttResultStandings']]}
];
export const AFTERDARK_SURFACE_MAP=Object.fromEntries(AFTERDARK_SURFACES.map(x=>[x.id,x]));
export const AFTERDARK_SLOT_DEFS=Object.freeze(Object.fromEntries(AFTERDARK_SURFACES.map(surface=>[surface.id,Object.freeze([
 ...surface.builtIns.map(([id,label,selector,asset,assetSelector,hideMode])=>Object.freeze({id,label,selector,asset,assetSelector,hideMode})),
 Object.freeze({id:'poker.background',label:'Background',selector:surface.id==='home'||surface.id==='entry'?'.homeShell':surface.id==='pregame'?'.pregameTablePage':surface.id==='gameplay'?'.gameplayV3Page':'.tablePage',asset:surface.id==='home'||surface.id==='entry'?'home-bg':'surface-bg'})
])])));
export const DEFAULT_BACKGROUND_FRAMING=Object.freeze({mode:'cover',scale:100,x:50,y:50});
export function surfaceConfig(id='home'){return AFTERDARK_SURFACE_MAP[id]||AFTERDARK_SURFACE_MAP.home}
export function freshSurface(id='home'){
 const cfg=surfaceConfig(id);
 return{backgroundChannel:cfg.backgroundChannel,backgroundFraming:{...DEFAULT_BACKGROUND_FRAMING},layout:Object.fromEntries(cfg.builtIns.map(([key])=>[key,{x:0,y:0,width:null,height:null,zIndex:5,locked:false}])),custom:[]};
}
export function freshSurfaceDocument(){
 return{schemaVersion:3,skinId:'default',surfaces:Object.fromEntries(AFTERDARK_SURFACES.map(s=>[s.id,freshSurface(s.id)]))};
}
