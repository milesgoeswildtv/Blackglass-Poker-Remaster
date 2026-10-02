import React,{useState}from'react';
import Lobby from'./Lobby.jsx';
import AccessHome from'./AccessHome.jsx';
import{TableTopbar,PokerFelt,TableHUD}from'./TableSurface.jsx';
import{gameSkinStyle,gameplayThemeAssets,tableSkinAsset,lobbySkinStyle,skinAssetUrl}from'./skin-client.js';
import{backgroundVariant}from'../skin-system.js';
import'./styles.css';
import'./home.css';
import'./mtt-lobby.css';

const noop=()=>{};
const SURFACES=new Set(['entry','home','invite','pregame','gameplay','mtt-lobby','mtt-break','mtt-move','mtt-result']);
function selectedSkin(){try{return new URLSearchParams(location.search).get('afterdarkSkin')||'default'}catch{return'default'}}
function loadout(id){return{lobbyBg:id,gameRoomBg:id,gameplayTheme:id,tableSkin:id,menuTheme:id}}
function surface(){try{const id=new URLSearchParams(location.search).get('afterdarkSurface')||'home';return SURFACES.has(id)?id:'home'}catch{return'home'}}
function bgUrl(value){const url=skinAssetUrl(value);return url?`url("${url}")`:''}
function lobbyPageStyle(skins){return{...lobbySkinStyle(skins),'--desktop-bg':bgUrl(backgroundVariant(skins,'lobbyBg','desktop')),'--mobile-bg':bgUrl(backgroundVariant(skins,'lobbyBg','mobile'))}}
function gamePageStyle(skins){return{...gameSkinStyle(skins),'--desktop-bg':bgUrl(backgroundVariant(skins,'gameRoomBg','desktop')),'--mobile-bg':bgUrl(backgroundVariant(skins,'gameRoomBg','mobile'))}}

const players=[
 {id:'p1',name:'YOU',chips:8420,host:true,turn:true,bet:200,cards:['A♠','K♠'],folded:false,eliminated:false,sittingOut:false,timeBankMs:30000},
 {id:'p2',name:'RUBY',chips:6110,host:false,turn:false,bet:200,cards:['',''],folded:false,eliminated:false,sittingOut:false},
 {id:'p3',name:'ZERO',chips:9320,host:false,turn:false,bet:0,cards:['',''],folded:false,eliminated:false,sittingOut:false},
 {id:'p4',name:'PSYCHEE',chips:4770,host:false,turn:false,bet:0,cards:['',''],folded:false,eliminated:false,sittingOut:false},
 {id:'p5',name:'MIKA',chips:7200,host:false,turn:false,bet:0,cards:['',''],folded:false,eliminated:false,sittingOut:false},
 {id:'p6',name:'DROOPY',chips:5380,host:false,turn:false,bet:0,cards:['',''],folded:false,eliminated:false,sittingOut:false},
 {id:'p7',name:'ACE',chips:10400,host:false,turn:false,bet:0,cards:['',''],folded:false,eliminated:false,sittingOut:false},
 {id:'p8',name:'NOVA',chips:6840,host:false,turn:false,bet:0,cards:['',''],folded:false,eliminated:false,sittingOut:false},
 {id:'p9',name:'BONES',chips:3900,host:false,turn:false,bet:0,cards:['',''],folded:false,eliminated:false,sittingOut:false}
];
const me=players[0];
function stateFor(started){
 return{
  started,paused:false,street:started?'flop':'waiting',handNumber:17,smallBlind:100,bigBlind:200,
  players,viewer:{type:'player',name:'YOU'},board:started?['A♥','7♣','2♦','J♠','4♥']:[],
  pot:started?1250:0,livePots:started?[{amount:900},{amount:350}]:[],toCall:200,raiseTo:600,currentBet:200,canRaise:true,canAllIn:true,
  handHistory:[],chat:[],lastResult:null,endedByHost:false
 };
}
function posFor(state){return Object.fromEntries(state.players.map((p,i)=>[i,i===0?'D':i===1?'SB':i===2?'BB':'']))}

function TableFixture({pregame=false,skins}){
 const[raise,setRaise]=useState('600'),state=stateFor(!pregame),gameplaySkin=gameplayThemeAssets(skins),tableAsset=tableSkinAsset(skins),pos=posFor(state);
 return <main data-afterdark-canvas className={`tablePage ${pregame?'pregameTablePage':'gameplayV3Page'}`} style={gamePageStyle(skins)}>
  {pregame?<><button data-afterdark-slot="pregame-back" className="pregameBack" type="button">Back</button><button data-afterdark-slot="pregame-utility" className="pregameSkins" type="button">Skins</button></>:<TableTopbar code="C0DE42" state={state} onExit={noop} me={me} onAction={noop}/>}
  {pregame&&<section data-afterdark-slot="pregame-header" className="pregameRoom" aria-label="Crashout staging room"><div className="pregameHeaderLeft"><span>CRASHOUT STAGING ROOM</span><h2>THE TABLE IS READY.</h2><p>Everyone seated? Start when you’re ready to deal.</p></div><div className="pregameHeaderRight"><div className="pregameCount"><b>{state.players.length}<small>/9</small></b><span>SEATED</span></div><div className="pregameInviteCluster"><button className="pregameInviteButton" type="button">INVITE</button><strong className="pregameCode">C0DE42</strong></div></div><div data-afterdark-slot="pregame-blinds" className="pregameBlindBadge">100 / 200 NLH</div></section>}
  <PokerFelt state={state} finished={false} pos={pos} turnLeft={22} me={me} onKick={noop} onThrowTarget={noop} throwingEnabled={!pregame} tableAsset={tableAsset} gameplaySkin={gameplaySkin}/>
  <TableHUD state={state} me={me} isSpectator={false} strength={pregame?'':'TOP PAIR'} turnLeft={22} raise={raise} setRaise={setRaise} showHistory={false} setShowHistory={noop} showChat={false} unreadChat={0} onToggleChat={noop} preAction="" onPreAction={noop} showTestBot={pregame} onAction={noop} gameplaySkin={gameplaySkin}/>
 </main>
}
function EntryFixture({skins}){
 return <main className="homeShell" style={lobbySkinStyle(skins)}><div data-afterdark-canvas data-afterdark-canvas-kind="entry-frame" className="homeFrame">
  <header className="homeTopline"><div className="homeBrand"><h1>CRASHOUT POKER</h1><p>Private tables • Tournaments • Invite only.</p></div></header>
  <section className="homeHero"><div className="homeEntry"><AccessHome account={null} authLoading={false} authError="" telegram={false} name="LAYOUT PREVIEW" discordLink={null} onRefresh={noop} onCreate={noop} onJoin={noop} onShop={noop}/></div></section>
 </div></main>
}
function InviteFixture({skins}){
 return <main data-afterdark-canvas className="tablePage" style={gamePageStyle(skins)}><div className="topbar"><button className="ghost">← Lobby</button><div><b>TABLE C0DE42</b><span> Private Crashout Poker tournament • LIVE</span></div></div><section className="inviteJoin productionInvite"><span className="eyebrow">YOU'VE BEEN INVITED</span><h2>Take a seat at Table C0DE42</h2><p>Your Crashout Poker identity is locked in. Take a seat now, or watch from the rail without affecting the game.</p><button className="primary">Take My Seat</button><button className="watchButton">Watch Table</button><small>4/9 players seated • 1 watching</small></section></main>
}
function MttLobbyFixture({skins}){
 return <main data-afterdark-canvas className="tablePage mttLobbyPage" style={lobbyPageStyle(skins)}><div className="mttLobbyShell"><header className="mttLobbyHeader"><button className="ghost">← Lobby</button><div><span>MULTI-TABLE TOURNAMENT</span><strong>C0DE42</strong></div><button className="ghost">Invite</button></header><section className="mttLobbyCard mttStatusCard"><div><span className="eyebrow">REGISTRATION OPEN</span><h2>18 / 50 players</h2><p>Start whenever the field is ready.</p></div><div className="mttSeatStamp"><small>YOUR SEAT</small><b>TABLE 2</b><span>SEAT 4</span></div></section><section className="mttLobbyCard"><div className="mttRosterHead"><div><span className="eyebrow">FIELD</span><h3>Registered Players</h3></div><button className="primary mttStart">Start Tournament</button></div><div className="mttTables"><div className="mttTableCard"><b>TABLE 1</b><span>8 / 8</span><div><p>Ruby</p><p>Zero</p><p>Psychee</p></div></div><div className="mttTableCard"><b>TABLE 2</b><span>8 / 8</span><div><p className="me">YOU</p><p>Michael</p><p>Droopy</p></div></div></div></section></div></main>
}
function MttBreakFixture(){
 return <main data-afterdark-canvas className="tablePage mttLobbyPage"><div className="mttBreakScreen"><header><button className="ghost">← Lobby</button><span>C0DE42</span></header><div className="mttBreakMark">☕</div><span className="eyebrow">TOURNAMENT BREAK</span><h1>04:27</h1><p>All tables are paused together. Your seat, stack, and Time Bank are locked in place.</p><div><span>BREAK #1</span><span>LEVEL 5</span></div><small>Play resumes automatically when the clock hits zero.</small></div></main>
}
function MttMoveFixture(){
 return <main data-afterdark-canvas className="tablePage mttLobbyPage"><div className="mttMoveScreen"><span className="eyebrow">TABLE CHANGE</span><div className="mttMoveRoute"><b>TABLE 2</b><i>→</i><b>TABLE 3</b></div><h2>Pack your chips.</h2><p>You’re moving to Seat 6. Your stack and tournament session are coming with you.</p><small>C0DE42 • reconnecting automatically</small></div></main>
}
function MttResultFixture({skins}){
 return <main data-afterdark-canvas className="tablePage mttLobbyPage" style={lobbyPageStyle(skins)}><div className="mttLobbyShell mttResultShell"><header className="mttLobbyHeader"><button className="ghost">← Lobby</button><div><span>MULTI-TABLE TOURNAMENT</span><strong>C0DE42</strong></div><div/></header><section className="mttResultHero"><span className="eyebrow">TOURNAMENT RESULT</span><h1>You finished 3rd.</h1><p>Ruby took it down. You finished 3rd.</p><div className="mttResultMeta"><span>24 ENTRIES</span><span>WINNER • RUBY</span><span>4 KO</span></div></section><div className="mttResultStandings"><section className="mttResultStandingsPanel"><header><b>FINAL STANDINGS</b><span>24 players</span></header><div><p className="winner"><i>1st</i><strong>Ruby</strong><span>240,000 chips</span><em>5 KO</em></p><p><i>2nd</i><strong>Zero</strong><span>0 chips</span><em>3 KO</em></p><p><i>3rd</i><strong>YOU</strong><span>0 chips</span><em>4 KO</em></p></div></section></div><button className="primary mttReturnButton">Return to Lobby</button></div></main>
}

export default function AfterdarkSurfacePreview(){
 const id=surface(),skin=selectedSkin(),skins=loadout(skin);
 if(id==='home')return <Lobby code="" setCode={noop}/>;
 if(id==='entry')return <EntryFixture skins={skins}/>;
 if(id==='invite')return <InviteFixture skins={skins}/>;
 if(id==='pregame')return <TableFixture pregame skins={skins}/>;
 if(id==='gameplay')return <TableFixture skins={skins}/>;
 if(id==='mtt-lobby')return <MttLobbyFixture skins={skins}/>;
 if(id==='mtt-break')return <MttBreakFixture/>;
 if(id==='mtt-move')return <MttMoveFixture/>;
 return <MttResultFixture skins={skins}/>;
}
