import React,{useEffect,useState}from'react';
import{assets}from'./assets.js';
import{TableTopbar,PokerFelt,TableHUD}from'./TableSurface.jsx';
import'./home.css';
import'./mtt-lobby.css';
import'./afterdark-preview.css';

const noop=()=>{};
const CODE='CR8OUT';
const players=[
 {id:'hero',name:'MILES',chips:8420,bet:0,turn:true,folded:false,eliminated:false,sittingOut:false,host:true,cards:['A♥','K♠'],timeBankMs:45000,cosmetic:'default'},
 {id:'p1',name:'RUBY',chips:6110,bet:120,turn:false,folded:false,eliminated:false,sittingOut:false,cards:[],cosmetic:'default'},
 {id:'p2',name:'ZERO',chips:4950,bet:120,turn:false,folded:false,eliminated:false,sittingOut:false,cards:[],cosmetic:'default'},
 {id:'p3',name:'PSYCHEE',chips:7230,bet:0,turn:false,folded:false,eliminated:false,sittingOut:false,cards:[],cosmetic:'default'},
 {id:'p4',name:'DROOPY',chips:3280,bet:0,turn:false,folded:false,eliminated:false,sittingOut:false,cards:[],cosmetic:'default'},
 {id:'p5',name:'MICHAEL',chips:9870,bet:0,turn:false,folded:false,eliminated:false,sittingOut:false,cards:[],cosmetic:'default'}
];
const hero=players[0];
const baseState={players,viewer:{type:'player',name:'MILES'},smallBlind:25,bigBlind:50,handNumber:42,board:['A♣','7♦','2♠'],pot:640,livePots:[{amount:640}],street:'flop',started:true,paused:false,currentBet:120,toCall:120,raiseTo:300,canRaise:true,canAllIn:true,lastResult:{},handHistory:[],chat:[]};
const pregameState={...baseState,started:false,street:'waiting',board:[],pot:0,livePots:[],currentBet:0,toCall:0,raiseTo:50,canRaise:false,canAllIn:false,players:players.map((p,i)=>({...p,turn:false,bet:0,cards:i===0?p.cards:[]}))};
const gameplayStyle={'--gameplay-remaster-bg':'url('+assets.default.gameplayBackgroundRemaster+')'};

const SLOT_DEFS={
 home:{
  'poker.logo':{selector:'.homeBrand h1',assetMode:'background'},
  'poker.identity':{selector:'.homeIdentityTicket',assetMode:'background'},
  'poker.hostBar':{selector:'.homeHostIdentity',assetMode:'background'},
  'poker.create':{selector:'.homePlayPair .homeActionPrimary:first-child',assetMode:'background'},
  'poker.join':{selector:'.homePlayPair .homeActionPrimary:nth-child(2)',assetMode:'background'},
  'poker.shop':{selector:'.homeActionShop',assetMode:'background'},
  'poker.utility':{selector:'.homeUtilityEntry'},
  'poker.background':{selector:'.homeShell',assetMode:'cssVar',assetName:'--home-bg'}
 },
 'table-invite':{
  'invite.panel':{selector:'.productionInvite',assetMode:'background'},
  'invite.primary':{selector:'.productionInvite .primary',assetMode:'background'},
  'invite.watch':{selector:'.productionInvite .watchButton',assetMode:'background'},
  'invite.background':{selector:'.afterdarkInvitePage',assetMode:'background'}
 },
 pregame:{
  'pregame.header':{selector:'.pregameRoom',assetMode:'background'},
  'pregame.table':{selector:'.ftp3Stage'},
  'pregame.hero':{selector:'.ftp3Hero'},
  'pregame.actions':{selector:'.ftp3ActionDock',assetMode:'background'},
  'pregame.background':{selector:'.pregameTablePage',assetMode:'cssVar',assetName:'--gameplay-remaster-bg'},
  'pregame.back':{selector:'.pregameBack'},
  'pregame.headerLeft':{selector:'.pregameHeaderLeft'},
  'pregame.headerRight':{selector:'.pregameHeaderRight'},
  'pregame.blinds':{selector:'.pregameBlindBadge'},
  'pregame.tableArtwork':{selector:'.ftp3TableShell',assetMode:'img'},
  'pregame.seat1':{selector:'.ftp3SeatUnit[data-seat="0"]'},
  'pregame.seat2':{selector:'.ftp3SeatUnit[data-seat="1"]'},
  'pregame.seat3':{selector:'.ftp3SeatUnit[data-seat="2"]'},
  'pregame.seat4':{selector:'.ftp3SeatUnit[data-seat="3"]'},
  'pregame.seat5':{selector:'.ftp3SeatUnit[data-seat="4"]'},
  'pregame.seat6':{selector:'.ftp3SeatUnit[data-seat="5"]'},
  'pregame.seat7':{selector:'.ftp3SeatUnit[data-seat="6"]'},
  'pregame.seat8':{selector:'.ftp3SeatUnit[data-seat="7"]'},
  'pregame.heroCards':{selector:'.ftp3HeroCards'},
  'pregame.heroCard1':{selector:'.ftp3HeroCards > :nth-child(1)'},
  'pregame.heroCard2':{selector:'.ftp3HeroCards > :nth-child(2)'},
  'pregame.heroPlaque':{selector:'.ftp3HeroPlaque'},
  'pregame.start':{selector:'.ftp3Start'},
  'pregame.utility':{selector:'.ftp3UtilityBar'},
  'pregame.chat':{selector:'.ftp3Chat'},
  'pregame.handLog':{selector:'.ftp3HandLog'}
 },
 gameplay:{
  'gameplay.header':{selector:'.ftp3Header',assetMode:'background'},
  'gameplay.table':{selector:'.ftp3Stage'},
  'gameplay.hero':{selector:'.ftp3Hero'},
  'gameplay.actions':{selector:'.ftp3ActionDock',assetMode:'background'},
  'gameplay.utility':{selector:'.ftp3UtilityBar',assetMode:'background'},
  'gameplay.background':{selector:'.gameplayV3Page',assetMode:'cssVar',assetName:'--gameplay-remaster-bg'},
  'gameplay.back':{selector:'.ftp3Back'},
  'gameplay.headerInfo':{selector:'.ftp3HeaderBrand'},
  'gameplay.topCommands':{selector:'.ftp3TopCommands'},
  'gameplay.sitOut':{selector:'.ftp3SitOut'},
  'gameplay.pause':{selector:'.ftp3Pause'},
  'gameplay.endGame':{selector:'.ftp3EndGame'},
  'gameplay.tableArtwork':{selector:'.ftp3TableShell',assetMode:'img'},
  'gameplay.seat1':{selector:'.ftp3SeatUnit[data-seat="0"]'},
  'gameplay.seat2':{selector:'.ftp3SeatUnit[data-seat="1"]'},
  'gameplay.seat3':{selector:'.ftp3SeatUnit[data-seat="2"]'},
  'gameplay.seat4':{selector:'.ftp3SeatUnit[data-seat="3"]'},
  'gameplay.seat5':{selector:'.ftp3SeatUnit[data-seat="4"]'},
  'gameplay.seat6':{selector:'.ftp3SeatUnit[data-seat="5"]'},
  'gameplay.seat7':{selector:'.ftp3SeatUnit[data-seat="6"]'},
  'gameplay.seat8':{selector:'.ftp3SeatUnit[data-seat="7"]'},
  'gameplay.board':{selector:'.ftp3Board'},
  'gameplay.boardCard1':{selector:'.ftp3Board > :nth-child(1)'},
  'gameplay.boardCard2':{selector:'.ftp3Board > :nth-child(2)'},
  'gameplay.boardCard3':{selector:'.ftp3Board > :nth-child(3)'},
  'gameplay.boardCard4':{selector:'.ftp3Board > :nth-child(4)'},
  'gameplay.boardCard5':{selector:'.ftp3Board > :nth-child(5)'},
  'gameplay.pot':{selector:'.ftp3Pot'},
  'gameplay.sidePots':{selector:'.ftp3SidePots'},
  'gameplay.heroCards':{selector:'.ftp3HeroCards'},
  'gameplay.heroCard1':{selector:'.ftp3HeroCards > :nth-child(1)'},
  'gameplay.heroCard2':{selector:'.ftp3HeroCards > :nth-child(2)'},
  'gameplay.heroPlaque':{selector:'.ftp3HeroPlaque'},
  'gameplay.strength':{selector:'.ftp3Strength'},
  'gameplay.extraTime':{selector:'.ftp3ExtraTime'},
  'gameplay.fold':{selector:'.ftp3ActionRow .fold'},
  'gameplay.call':{selector:'.ftp3ActionRow .call'},
  'gameplay.raise':{selector:'.ftp3ActionRow .raise'},
  'gameplay.allIn':{selector:'.ftp3ActionRow .allin'},
  'gameplay.betLabel':{selector:'.ftp3RaiseRow > span'},
  'gameplay.betSlider':{selector:'.ftp3RaiseRow > input'},
  'gameplay.betQuickGroup':{selector:'.ftp3RaiseRow > div'},
  'gameplay.bet25':{selector:'.ftp3Bet25'},
  'gameplay.bet50':{selector:'.ftp3Bet50'},
  'gameplay.bet75':{selector:'.ftp3Bet75'},
  'gameplay.betMax':{selector:'.ftp3BetMax'},
  'gameplay.chat':{selector:'.ftp3Chat'},
  'gameplay.handLog':{selector:'.ftp3HandLog'}
 },
 'mtt-lobby':{
  'mttLobby.header':{selector:'.mttLobbyHeader',assetMode:'background'},
  'mttLobby.status':{selector:'.mttStatusCard',assetMode:'background'},
  'mttLobby.roster':{selector:'.afterdarkMttRoster',assetMode:'background'},
  'mttLobby.background':{selector:'.afterdarkMttLobbyPage',assetMode:'background'}
 },
 'mtt-break':{
  'mttBreak.header':{selector:'.mttBreakScreen header',assetMode:'background'},
  'mttBreak.clock':{selector:'.mttBreakScreen h1'},
  'mttBreak.copy':{selector:'.afterdarkBreakCopy',assetMode:'background'},
  'mttBreak.background':{selector:'.afterdarkMttBreakPage',assetMode:'background'}
 },
 result:{
  'result.header':{selector:'.mttLobbyHeader',assetMode:'background'},
  'result.hero':{selector:'.mttResultHero',assetMode:'background'},
  'result.standings':{selector:'.mttResultStandings',assetMode:'background'},
  'result.return':{selector:'.mttReturnButton',assetMode:'background'},
  'result.background':{selector:'.afterdarkResultPage',assetMode:'background'}
 }
};

function bpValue(group,bp,key){return group?.[bp]?.[key]??group?.desktop?.[key]}
function cleanAsset(value){return String(value||'').replace(/["\\\n\r]/g,'')}
function applyAsset(el,def,asset){
 const value=cleanAsset(asset);
 if(def.assetMode==='img'){
  const img=el.matches?.('img')?el:el.querySelector(def.assetSelector||'img');
  if(img)img.src=value||assets.default.gameplayTableRemaster;
 }else if(def.assetMode==='cssVar'){
  if(value)el.style.setProperty(def.assetName,'url("'+value+'")');else el.style.removeProperty(def.assetName);
 }else if(def.assetMode==='background'){
  if(value)el.style.setProperty('background-image','url("'+value+'")','important');else el.style.removeProperty('background-image');
 }
}
function applyManifest(surface,manifest,bp){
 const defs=SLOT_DEFS[surface]||{};
 for(const[id,def]of Object.entries(defs)){
  const el=document.querySelector(def.selector),slot=manifest?.slots?.[id];
  if(!el||!slot)continue;
  const x=bpValue(slot.layout,bp,'x'),y=bpValue(slot.layout,bp,'y'),w=bpValue(slot.layout,bp,'width'),h=bpValue(slot.layout,bp,'height'),z=bpValue(slot.layout,bp,'zIndex'),opacity=bpValue(slot.style,bp,'opacity');
  el.style.translate=x!==undefined||y!==undefined?Number(x||0)+'px '+Number(y||0)+'px':'';
  el.style.width=w!==undefined?Number(w)+'px':'';
  el.style.height=h!==undefined?Number(h)+'px':'';
  el.style.zIndex=z!==undefined?String(Number(z)):'';
  el.style.opacity=opacity!==undefined?String(Number(opacity)):'';
  applyAsset(el,def,slot.asset);
 }
}
function rectPayload(surface){
 const defs=SLOT_DEFS[surface]||{};
 return Object.entries(defs).flatMap(([id,def])=>{const el=document.querySelector(def.selector);if(!el)return[];const r=el.getBoundingClientRect();return[{id,x:r.left,y:r.top,width:r.width,height:r.height}]});
}
function depth(el){let n=0;for(let p=el;p;p=p.parentElement)n++;return n}

function HomePreview(){
 return <main className="homeShell"><div className="homeFrame">
  <header className="homeTopline"><div className="homeBrand"><h1>CRASHOUT POKER</h1><p>Private tables • Tournaments • Invite only.</p></div><button className="homeIdentityTicket" type="button"><span className="homeIdentityAvatar"><i>MH</i></span><span className="homeIdentityCopy"><strong>Miles</strong><small>@milesgoeswild</small></span><span className="homeIdentityAction">PROFILE</span></button></header>
  <section className="homeHero"><div className="homeAssetEntry"><div className="homeHostBoard"><div className="homeHostIdentity"><span>HOST ACCESS</span><strong>Miles</strong><small>Permanent Host</small></div><div className="homePlayPair"><button type="button" className="homeAction homeActionPrimary"><small>OPEN A ROOM</small><b>CREATE GAME</b><span>Quick Table or Tournament</span></button><button type="button" className="homeAction homeActionPrimary"><small>USE A CODE</small><b>JOIN GAME</b><span>Six-character private game code</span></button></div><button type="button" className="homeAction homeActionShop"><span className="homeActionIndex">03</span><span><small>COSMETICS + BOOSTERS</small><b>BOOSTER SHOP</b></span><em>OPEN →</em></button></div></div></section>
  <section className="homeUtilityEntry"><button type="button"><span>ENGINE + FAIRNESS</span><small>Architecture, fairness and published mass-simulation audit</small><em>OPEN REPORT →</em></button></section>
  <footer className="homeFooter"><div className="homeLegal"><span>CRASHOUT POKER</span><span>PRIVATE PLAY-CHIP POKER • CRASHOUT ACCOUNT REQUIRED</span></div></footer>
 </div></main>;
}
function InvitePreview(){
 return <main className="tablePage afterdarkInvitePage" style={gameplayStyle}><div className="topbar"><button className="ghost">← Lobby</button><div><b>TABLE {CODE}</b><span> Private Crashout Poker tournament • LIVE</span></div></div><section className="inviteJoin productionInvite"><div className="mark bigMark">FT</div><span className="eyebrow">YOU&apos;VE BEEN INVITED</span><h2>Take a seat at Table {CODE}</h2><p>Your Crashout Poker identity is locked in. Take a seat now, or watch from the rail without affecting the game.</p><button className="primary">Take My Seat</button><button className="watchButton">Watch Table</button><small>6/9 players seated • 2 watching</small></section></main>;
}
function PregamePreview(){
 const me=pregameState.players[0];
 return <main className="tablePage pregameTablePage" style={gameplayStyle}><button className="pregameBack" aria-label="Back to lobby">Back</button><section className="pregameRoom" aria-label="Crashout staging room"><div className="pregameHeaderLeft"><span>CRASHOUT STAGING ROOM</span><h2>THE TABLE IS READY.</h2><p>Everyone seated? Start when you&apos;re ready to deal.</p></div><div className="pregameHeaderRight"><div className="pregameCount"><b>6<small>/9</small></b><span>SEATED</span></div><div className="pregameInviteCluster"><button className="pregameInviteButton">INVITE</button><strong className="pregameCode">{CODE}</strong></div></div><div className="pregameBlindBadge">25 / 50 NLH</div></section><PokerFelt state={pregameState} finished={false} pos={{1:'D',2:'SB',3:'BB'}} turnLeft={null} me={me} onKick={noop} onThrowTarget={noop}/><TableHUD state={pregameState} me={me} isSpectator={false} strength="" turnLeft={null} raise="" setRaise={noop} showHistory={false} setShowHistory={noop} showChat={false} unreadChat={0} onToggleChat={noop} preAction="" onPreAction={noop} showTestBot={false} onAction={noop}/></main>;
}
function GameplayPreview(){
 return <main className="tablePage gameplayV3Page" style={gameplayStyle}><TableTopbar code={CODE} state={baseState} onExit={noop} me={hero} onAction={noop}/><PokerFelt state={baseState} finished={false} pos={{1:'D',2:'SB',3:'BB'}} turnLeft={18} me={hero} onKick={noop} onThrowTarget={noop} throwingEnabled/><TableHUD state={baseState} me={hero} isSpectator={false} strength="Top Pair" turnLeft={18} raise="300" setRaise={noop} showHistory={false} setShowHistory={noop} showChat={false} unreadChat={2} onToggleChat={noop} preAction="" onPreAction={noop} showTestBot={false} onAction={noop}/></main>;
}
function MttLobbyPreview(){
 const names=['MILES','RUBY','ZERO','PSYCHEE','DROOPY','MICHAEL'];
 return <main className="tablePage mttLobbyPage afterdarkMttLobbyPage"><div className="mttLobbyShell"><header className="mttLobbyHeader"><button className="ghost">← Lobby</button><div><span>MULTI-TABLE TOURNAMENT</span><strong>{CODE}</strong></div><button className="ghost">Invite</button></header><section className="mttLobbyCard mttStatusCard"><div><span className="eyebrow">REGISTRATION OPEN</span><h2>18 / 50 players</h2><p>Start whenever the field is ready. Seats are assigned automatically.</p></div><div className="mttSeatStamp"><small>YOUR SEAT</small><b>TABLE 2</b><span>SEAT 4</span></div></section><section className="mttLobbyCard afterdarkMttRoster"><div className="mttRosterHead"><div><span className="eyebrow">LIVE SEATING MAP</span><h3>3 tables allocated</h3></div><button className="primary mttStart">Start Tournament</button></div><div className="mttTables">{[1,2,3].map(table=><div className="mttTableCard" key={table}><b>TABLE {table}</b><span>6/8</span><div>{names.map((name,i)=><p className={table===2&&i===3?'me':''} key={name}><i>{i+1}</i><span>{name}</span></p>)}</div></div>)}</div></section></div></main>;
}
function BreakPreview(){
 return <main className="tablePage mttLobbyPage afterdarkMttBreakPage"><div className="mttBreakScreen"><header><button className="ghost">← Lobby</button><span>{CODE}</span></header><div className="mttBreakMark">☕</div><span className="eyebrow">TOURNAMENT BREAK</span><h1>04:37</h1><div className="afterdarkBreakCopy"><p>All tables are paused together. Your seat, stack, and Time Bank are locked in place.</p><div><span>BREAK #1</span><span>LEVEL 7</span></div><small>Play resumes automatically when the clock hits zero.</small></div></div></main>;
}
function ResultPreview(){
 const rows=[['1st','MILES','48,600','5 KO'],['2nd','RUBY','0','3 KO'],['3rd','ZERO','0','2 KO'],['4th','PSYCHEE','0','1 KO']];
 return <main className="tablePage mttLobbyPage afterdarkResultPage"><div className="mttLobbyShell mttResultShell"><header className="mttLobbyHeader"><button className="ghost">← Lobby</button><div><span>MULTI-TABLE TOURNAMENT</span><strong>{CODE}</strong></div><div/></header><section className="mttResultHero winner"><span className="eyebrow">CRASHOUT CHAMPION</span><h1>You won.</h1><p>48,600 chips. Last player standing.</p><div className="mttResultMeta"><span>18 ENTRIES</span><span>WINNER • MILES</span><span>5 KO</span></div></section><div className="mttResultStandings"><section className="mttResultStandingsPanel"><header><b>FINAL STANDINGS</b><span>18 players</span></header><div>{rows.map((r,i)=><p className={i===0?'winner':''} key={r[0]}><i>{r[0]}</i><strong>{r[1]}</strong><span>{r[2]} chips</span><em>{r[3]}</em></p>)}</div></section></div><button className="primary mttReturnButton">Return to Lobby</button></div></main>;
}
function Surface({surface}){if(surface==='table-invite')return <InvitePreview/>;if(surface==='pregame')return <PregamePreview/>;if(surface==='gameplay')return <GameplayPreview/>;if(surface==='mtt-lobby')return <MttLobbyPreview/>;if(surface==='mtt-break')return <BreakPreview/>;if(surface==='result')return <ResultPreview/>;return <HomePreview/>}

export default function AfterdarkPreview(){
 const params=new URLSearchParams(location.search),requested=params.get('afterdarkSurface')||'home',surface=SLOT_DEFS[requested]?requested:'home',[manifest,setManifest]=useState(null),[breakpoint,setBreakpoint]=useState('mobile');
 useEffect(()=>{
  document.documentElement.classList.add('afterdarkPreviewMode');
  const post=payload=>parent.postMessage({...payload,surface},'*');
  let raf=0,selectable=null;
  const emit=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>post({type:'afterdark:rects',rects:rectPayload(surface)}))};
  const onMessage=e=>{const d=e.data||{};if(d.type!=='afterdark:manifest'||(d.surface&&d.surface!==surface))return;selectable=Array.isArray(d.selectableSlots)?new Set(d.selectableSlots):null;setManifest(d.manifest||null);setBreakpoint(d.breakpoint||'mobile')};
  const onPointer=e=>{const defs=SLOT_DEFS[surface]||{},candidates=Object.entries(defs).filter(([id])=>!selectable||selectable.has(id)).map(([id,def])=>({id,el:document.querySelector(def.selector)})).filter(x=>x.el&&x.el.contains(e.target)).sort((a,b)=>depth(b.el)-depth(a.el));if(!candidates.length)return;e.preventDefault();e.stopPropagation();post({type:'afterdark:select',id:candidates[0].id})};
  addEventListener('message',onMessage);addEventListener('resize',emit);addEventListener('scroll',emit,true);document.addEventListener('pointerdown',onPointer,true);
  post({type:'afterdark:ready'});emit();
  return()=>{document.documentElement.classList.remove('afterdarkPreviewMode');cancelAnimationFrame(raf);removeEventListener('message',onMessage);removeEventListener('resize',emit);removeEventListener('scroll',emit,true);document.removeEventListener('pointerdown',onPointer,true)};
 },[surface]);
 useEffect(()=>{if(!manifest)return;applyManifest(surface,manifest,breakpoint);const id=requestAnimationFrame(()=>parent.postMessage({type:'afterdark:rects',surface,rects:rectPayload(surface)},'*'));return()=>cancelAnimationFrame(id)},[surface,manifest,breakpoint]);
 return <Surface surface={surface}/>;
}
