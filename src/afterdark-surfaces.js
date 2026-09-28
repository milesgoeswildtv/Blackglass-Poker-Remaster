export const AFTERDARK_SURFACES=[
 {id:'entry',label:'ENTRY',short:'ENTRY',backgroundChannel:'lobbyBg',scroll:'page',builtIns:[['poker.entry.logo','Logo'],['poker.entry.panel','Panel Artwork'],['poker.entry.content','Access Content']]},
 {id:'home',label:'HOME',short:'HOME',backgroundChannel:'lobbyBg',scroll:'page',builtIns:[['poker.logo','Logo'],['poker.identity','Player Identity'],['poker.hostBar','Host Bar'],['poker.create','Create Game'],['poker.join','Join Game'],['poker.shop','Booster Shop'],['poker.utility','Engine + Fairness']]},
 {id:'invite',label:'INVITE',short:'INVITE',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:[['poker.invite.panel','Invite Panel']]},
 {id:'pregame',label:'PRE-GAME',short:'PRE',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:[['poker.pregame.panel','Staging Panel'],['poker.table','Table'],['poker.hero','Player Plaque'],['poker.actions','Pregame Controls']]},
 {id:'gameplay',label:'GAMEPLAY',short:'PLAY',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:[['poker.header','Table Header'],['poker.table','Table'],['poker.hero','Player Plaque'],['poker.actions','Action Controls']]},
 {id:'mtt-lobby',label:'MTT LOBBY',short:'MTT',backgroundChannel:'lobbyBg',scroll:'page',builtIns:[['poker.mtt.header','Tournament Header'],['poker.mtt.status','Tournament Status'],['poker.mtt.field','Tournament Field']]},
 {id:'mtt-break',label:'MTT BREAK',short:'BREAK',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:[['poker.mtt.break','Break Screen']]},
 {id:'mtt-move',label:'MTT MOVE',short:'MOVE',backgroundChannel:'gameRoomBg',scroll:'fixed',builtIns:[['poker.mtt.move','Table Move']]},
 {id:'mtt-result',label:'MTT RESULT',short:'RESULT',backgroundChannel:'lobbyBg',scroll:'page',builtIns:[['poker.mtt.header','Tournament Header'],['poker.mtt.result','Result Hero'],['poker.mtt.standings','Final Standings']]}
];
export const AFTERDARK_SURFACE_MAP=Object.fromEntries(AFTERDARK_SURFACES.map(x=>[x.id,x]));
export const DEFAULT_BACKGROUND_FRAMING=Object.freeze({mode:'cover',scale:100,x:50,y:50});
export function surfaceConfig(id='home'){return AFTERDARK_SURFACE_MAP[id]||AFTERDARK_SURFACE_MAP.home}
export function freshSurface(id='home'){
 const cfg=surfaceConfig(id);
 return{backgroundChannel:cfg.backgroundChannel,backgroundFraming:{...DEFAULT_BACKGROUND_FRAMING},layout:Object.fromEntries(cfg.builtIns.map(([key])=>[key,{x:0,y:0,width:null,height:null,zIndex:5,locked:false}])),custom:[]};
}
export function freshSurfaceDocument(){
 return{schemaVersion:3,skinId:'default',surfaces:Object.fromEntries(AFTERDARK_SURFACES.map(s=>[s.id,freshSurface(s.id)]))};
}
