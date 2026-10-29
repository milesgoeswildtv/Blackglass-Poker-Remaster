import React from'react';
import{Card}from'./TablePanels.jsx';
import{avatarFrameFor,betChipFor,cardBackFor,ticketFor}from'./assets.js';
import{FRONT_SEAT,LANDSCAPE_MEDIA,hasFeltMark,heroVars,pointVars,potsVars,seatEntries,seatOf,seatVars,tableSkinFor}from'./table-skins.js';
import{STATUS_LABELS,clockParts,potDisplay,seatMarkers,seatStatus}from'./table-view.js';
import'./gameplay.css';
import'./pregame.css';
import'./table-skin.css';
function initials(name='Player'){return name.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase()||'P'}
function AvatarVisual({player,className=''}){const frame=avatarFrameFor(player);return <span className={`ftp3IdentityAvatar ${className}`}><span className="ftp3AvatarFallback">{initials(player?.name)}</span>{player?.avatarUrl&&<img className="ftp3AvatarPhoto" src={player.avatarUrl} alt="" referrerPolicy="no-referrer" onError={e=>e.currentTarget.remove()}/>}{frame&&<img className="ftp3AvatarFrame" src={frame} alt=""/>}</span>}
function showdownWinners(state){if(state.street!=='showdown')return new Map();const map=new Map();for(const award of state.lastResult?.awards||[])map.set(award.playerId,(map.get(award.playerId)||0)+Number(award.amount||0));return map}
const amount=n=>Number(n||0).toLocaleString();
// A stack's character count, so table-skin.css can size long stacks down to fit their slot (never below 11px).
const stackFit=n=>({'--chars':String(amount(n).length)});
// The acting player's clock: TURN + mm:ss + time left on wide tickets, a seconds pill on compact ones (table-skin.css picks).
function TurnClock({className,turnLeft,turnSeconds}){const c=clockParts(turnLeft,turnSeconds);return <i className={className} style={{'--clock-left':c.left}}><small>TURN</small><b className="ftp3ClockLong">{c.long}</b><b className="ftp3ClockShort">{c.short}</b><s aria-hidden="true"/></i>}

// Host-only table controls behind one labelled disclosure menu. Items act only on their own click; opening the menu never
// moves focus onto an item, Escape and outside clicks close it, and an item with `confirm` needs a second, separate press
// (a press that lands within 450ms of the confirmation appearing, such as the tail of a double click, is ignored).
function HostMenu({label,items}){
 const[open,setOpen]=React.useState(false),[confirming,setConfirming]=React.useState(''),armedAt=React.useRef(0),ref=React.useRef(null),listId=React.useId();
 const close=React.useCallback(()=>{setOpen(false);setConfirming('')},[]);
 React.useEffect(()=>{if(!open)return;const away=e=>{if(!ref.current?.contains(e.target))close()},key=e=>{if(e.key==='Escape'){close();ref.current?.querySelector('.ftp3HostMenuToggle')?.focus()}};document.addEventListener('pointerdown',away,true);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',away,true);document.removeEventListener('keydown',key)}},[open,close]);
 if(!items.length)return null;
 const ask=item=>{setConfirming(item.key);armedAt.current=Date.now()+450};
 return <div className={`ftp3HostMenu ${open?'open':''}`} ref={ref}><button type="button" className="ftp3HostMenuToggle" aria-expanded={open} aria-controls={open?listId:undefined} aria-label={`${label} controls`} onClick={()=>open?close():setOpen(true)}><span>{label}</span><i aria-hidden="true">⋯</i></button>
  {open&&<div className="ftp3HostMenuList" id={listId} role="group" aria-label={`${label} controls`}>{items.map(item=>confirming===item.key?<div className="ftp3HostConfirm" key={item.key}><small>{item.confirm}</small><div><button type="button" className="ftp3HostCancel" onClick={()=>setConfirming('')}>Cancel</button><button type="button" className={`ftp3Danger ${item.className||''}`} onClick={()=>{if(Date.now()<armedAt.current)return;close();item.onSelect()}}>{item.confirmLabel||item.label}</button></div></div>:<button type="button" key={item.key} className={`${item.danger?'ftp3Danger ':''}${item.confirm?'':item.className||''}`} onClick={()=>{if(item.confirm)return ask(item);close();item.onSelect()}}>{item.confirm?`${item.label}…`:item.label}</button>)}</div>}
 </div>;
}

// AFTER HOURS header: wordmark, table meta, Sit Out, and the labelled host menu (host and tournament-director controls).
export function TableTopbar({code,state,onExit,me,onAction,directorItems=[]}){
 const isShowdown=state.street==='showdown',isSpectator=state.viewer?.type==='spectator',seated=!!(state.started&&me&&!isSpectator);
 const hostItems=seated&&me.host?[...(!isShowdown?[{key:'pause',label:state.paused?'Resume game':'Pause game',className:'ftp3Pause',onSelect:()=>onAction(state.paused?'resume':'pause')}]:[]),{key:'end',label:'End game',className:'ftp3EndGame',danger:true,confirm:'End the game for everyone at this table?',confirmLabel:'End game',onSelect:()=>onAction('end')}]:[];
 const items=[...hostItems,...directorItems];
 return <header className="ftp3Header"><button className="ftp3Back" onClick={onExit} aria-label="Back to lobby">‹</button><div className="ftp3Wordmark" aria-label="Crashout Poker, After Hours"><strong>CRASHOUT POKER</strong><span>AFTER HOURS</span></div><div className="ftp3HeaderBrand"><strong>{amount(state.smallBlind)} / {amount(state.bigBlind)} NLH</strong><span>Table {code} <i/> {state.started||state.street==='finished'?`Hand #${state.handNumber||0}`:'Staging'}</span></div>{(seated||items.length>0)&&<div className="ftp3TopCommands">{seated&&!me.eliminated&&me.chips>0&&!isShowdown&&<button className={`ftp3SitOut ${me.sittingOut?'active':''}`} onClick={()=>onAction(me.sittingOut?'sitin':'sitout')}>{me.sittingOut?'Sit In':'Sit Out'}</button>}<HostMenu label={directorItems.length&&!hostItems.length?'Director':'Host'} items={items}/></div>}</header>;
}

// One seat: the V3 ticket at its anchor and the player's bet at the seat's bet anchor (both from the skin, both variants).
function SeatTicket({entry,skin,state,pos,turnLeft,winners,me,onKick,onThrowTarget,throwingEnabled}){
 const{player,index,seatIndex,seatId}=entry,seat=seatOf(skin.variants.portrait,seatId),ticket=ticketFor(player),status=seatStatus(player,state),{dealer,blind}=seatMarkers(pos[index]),isShowdown=state.street==='showdown',revealed=isShowdown&&Array.isArray(player.cards)&&player.cards.some(Boolean),backs=!!state.started&&!isShowdown&&!player.eliminated&&!player.folded,won=winners.has(player.id),acting=!!(player.turn&&turnLeft!=null);
 return <div className="ftp3SeatUnit" data-seat={seatIndex} data-seat-id={seatId} data-side={seat.side} style={seatVars(skin,seatId)}>
  <div className={`ftp3Seat ${player.turn?'turn':''} ${player.folded?'folded':''} ${player.eliminated?'out':''} ${player.sittingOut?'sittingout':''} ${revealed?'showing':''} ${isShowdown&&winners.size?(won?'winner':'showdownDim'):''}`} data-status={status||undefined}>
   {(backs||revealed)&&<div className={`ftp3SeatCards ${revealed?'revealed':''}`}>{(revealed?player.cards.slice(0,2):['','']).map((c,i)=><Card key={i} c={c} backAsset={cardBackFor(player)}/>)}</div>}
   <div className={`ftp3SeatPlaque ${throwingEnabled?'throwableTarget':''}`} data-throw-player={player.id} role={throwingEnabled?'button':undefined} tabIndex={throwingEnabled?0:undefined} aria-label={throwingEnabled?`Throw at ${player.name}`:undefined} onClick={throwingEnabled?()=>onThrowTarget?.(player):undefined} onKeyDown={throwingEnabled?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onThrowTarget?.(player)}}:undefined} data-ticket={ticket.layout} style={{'--player-plaque':`url(${ticket.src})`,...(ticket.activeSrc?{'--player-plaque-active':`url(${ticket.activeSrc})`}:{})}}>
    <AvatarVisual player={player} className="ftp3Avatar"/>
    <span className="ftp3SeatCopy"><b>{player.name}</b><strong style={stackFit(player.chips)}>{amount(player.chips)}</strong></span>
    {blind&&<em className="ftp3Pos">{blind}</em>}
    {status&&<i className={`ftp3Status ${status==='away'?'ftp3Away':''}`} data-status={status}>{STATUS_LABELS[status]}</i>}
    {acting&&<TurnClock className="ftp3Clock" turnLeft={turnLeft} turnSeconds={state.turnSeconds}/>}
    {won&&<i className="ftp3Win">+{amount(winners.get(player.id))}</i>}
    {dealer&&<i className="ftp3Dealer" title="Dealer">D</i>}
    {me?.host&&!state.started&&!player.host&&<button className="ftp3SeatKick" onClick={e=>{e.stopPropagation();onKick?.(player.id)}} aria-label={`Remove ${player.name}`}>×</button>}
   </div>
  </div>
  {player.bet>0&&<div className="ftp3Bet"><img src={betChipFor(player,player.bet,state.bigBlind)} alt=""/><b>{amount(player.bet)}</b></div>}
 </div>;
}

// The local player at the front centre: hero/active ticket, hole cards (above the ticket on phones, inside it on wide
// screens), turn clock and their bet. Hand strength and the time bank live in the action dock, next to the decision.
function HeroSeat({skin,state,me,pos,turnLeft,winners}){
 const index=state.players.findIndex(p=>p.id===me.id),ticket=ticketFor(me,{hero:true}),{dealer,blind}=seatMarkers(pos[index]),isShowdown=state.street==='showdown',status=seatStatus(me,state),sittingOut=!!me.sittingOut,canAct=!!(state.started&&!state.paused&&!isShowdown&&me.turn&&!me.folded&&!me.eliminated&&me.chips>0&&!sittingOut),heroCards=state.started&&Array.isArray(me.cards)&&me.cards.some(Boolean)?me.cards:[],won=!!(isShowdown&&winners.has(me.id)),dim=!!(isShowdown&&winners.size&&!won);
 return <div className="ftp3HeroUnit" style={heroVars(skin)}>
  <div className={`ftp3Hero ${won?'winner':''} ${dim?'showdownDim':''} ${me.folded?'folded':''} ${canAct?'turn':''}`} data-status={status||undefined}>
   {heroCards.length>0&&<div className="ftp3HeroCards">{heroCards.slice(0,2).map((card,i)=><Card key={i} c={card} backAsset={cardBackFor(me)}/>)}</div>}
   <div className="ftp3HeroPlaque" data-throw-player={me.id} data-ticket={ticket.layout} style={{'--player-plaque':`url(${ticket.src})`}}>
    <AvatarVisual player={me} className="ftp3HeroAvatar"/>
    <div className="ftp3HeroCopy"><small>YOU</small><b style={stackFit(me.chips)}>{amount(me.chips)}</b></div>
    {blind&&<em className="ftp3Pos">{blind}</em>}
    {status&&status!=='live'&&<i className={`ftp3Status ${status==='away'?'ftp3Away':''}`} data-status={status}>{STATUS_LABELS[status]}</i>}
    {canAct&&turnLeft!=null&&<TurnClock className="ftp3HeroClock" turnLeft={turnLeft} turnSeconds={state.turnSeconds}/>}
    {won&&<i className="ftp3Win">+{amount(winners.get(me.id))}</i>}
    {dealer&&<i className="ftp3Dealer" title="Dealer">D</i>}
   </div>
  </div>
  {me.bet>0&&<div className="ftp3Bet ftp3HeroBet"><img src={betChipFor(me,me.bet,state.bigBlind)} alt=""/><b>{amount(me.bet)}</b></div>}
 </div>;
}

// The table scene: one AFTER HOURS environment (mobile art in portrait, desktop art in landscape; the browser loads only the
// one it shows) with every live element pinned to the skin's anchors. Pre-game shows the staging card where the board and
// pots will appear, so nothing moves when the first hand is dealt.
export function PokerFelt({state,finished,pos,turnLeft,me,onKick,onThrowTarget,throwingEnabled=false,staging=null,skin=tableSkinFor(state)}){
 const winners=showdownWinners(state),entries=seatEntries(skin,state.players,me),pregame=!state.started&&!finished,pots=potDisplay(state),{portrait,landscape}=skin.variants;
 return <section className={`ftp3Stage ${pregame?'pregame':''}`} data-opponents={entries.length} data-player-count={state.players.length} data-street={state.street} data-table-skin={skin.id}>
  <div className="ftp3SceneArt">
   <picture className="ftp3Environment"><source media={LANDSCAPE_MEDIA} srcSet={landscape.art.src}/><img src={portrait.art.src} alt="" aria-hidden="true" decoding="async"/></picture>
   {!pregame&&hasFeltMark(skin)&&<div className="ftp3FeltMark" aria-hidden="true" style={pointVars(skin,'feltMark')}><b>CRASHOUT POKER</b><span>AFTER HOURS</span></div>}
   {entries.map(entry=><SeatTicket key={entry.player.id} entry={entry} skin={skin} state={state} pos={pos} turnLeft={turnLeft} winners={winners} me={me} onKick={onKick} onThrowTarget={onThrowTarget} throwingEnabled={throwingEnabled}/>)}
   {me&&entries.every(e=>e.seatId!==FRONT_SEAT)&&<HeroSeat skin={skin} state={state} me={me} pos={pos} turnLeft={turnLeft} winners={winners}/>}
   {pregame?staging&&<div className="ftp3Staging" style={pointVars(skin,'staging')}>{staging}</div>:<>
    <div className="ftp3Board" style={pointVars(skin,'board')}>{state.board.map((c,i)=><Card key={`${state.handNumber}-${i}`} c={c}/>)}{state.board.length===0&&<span className="ftp3Street">{state.started?(state.paused?'Paused':'Pre-flop'):finished?'Game complete':'Waiting for start'}</span>}</div>
    <div className={`ftp3Pots ${pots.length>1?'split':''}`} style={potsVars(skin,pots.length)}>{pots.map((p,i)=><div key={i} className="ftp3Pot" data-kind={p.kind}><small>{p.label}</small><strong>{amount(p.amount)}</strong></div>)}</div>
   </>}
  </div>
 </section>;
}

// The action dock: V3 button shell for Fold / Check / Call / Bet / Raise / All In, raise sizing, pre-actions, showdown
// choices and table notices. One box in every state, so the table never jumps.
export function TableHUD({state,me,isSpectator,strength='',raise,setRaise,preAction,onPreAction,showTestBot=false,onAction,pregameNote=''}){
 const viewerName=String(state.viewer?.name||'Guest').toUpperCase(),sittingOut=!!me?.sittingOut,isShowdown=state.street==='showdown',muckEntry=isShowdown?(state.lastResult?.mucked||[]).find(x=>x.playerId===me?.id):null,shownEntry=isShowdown?(state.lastResult?.revealed||[]).find(x=>x.playerId===me?.id):null,showdownChoice=!!(muckEntry&&!muckEntry.confirmed),muckConfirmed=!!muckEntry?.confirmed,rabbitRevealed=isShowdown&&state.lastResult?.rabbitBoard?.length===5,rabbitAvailable=!!(isShowdown&&me&&!isSpectator&&state.lastResult?.uncontested&&!rabbitRevealed&&(state.lastResult?.board?.length||0)<5),canAct=!!(me&&state.started&&!state.paused&&!isShowdown&&me.turn&&!me.folded&&!me.eliminated&&me.chips>0&&!sittingOut),canQueue=!!(me&&state.started&&!state.paused&&!isShowdown&&!me.turn&&!me.folded&&!me.eliminated&&me.chips>0&&!sittingOut),toCall=Math.min(Number(me?.chips||0),Math.max(0,Number(state.toCall||0))),minRaise=Math.max(0,Number(state.raiseTo||0)),maxRaise=Math.max(minRaise,Number(me?.bet||0)+Number(me?.chips||0)),target=Math.min(maxRaise,Math.max(minRaise,Number(raise||minRaise))),opening=Number(state.currentBet||0)===0,canTimeBank=canAct&&Number(me?.timeBankMs||0)>0,showStrength=!!(strength&&me&&state.started&&!me.folded&&!isShowdown&&!sittingOut),head=canAct||canQueue||showStrength;
 function quick(frac){if(!state.canRaise)return;const call=Math.max(0,Number(state.toCall||0)),pot=Math.max(0,Number(state.pot||0)),currentBet=Number(state.currentBet||0),suggested=Math.round(currentBet+call+(pot*frac)),clamped=Math.min(maxRaise,Math.max(minRaise,suggested));setRaise(String(clamped))}
 const primaryLabel=state.toCall===0?'Check':'Call',raiseLabel=opening?'Bet':'Raise',fill=maxRaise>minRaise?(target-minRaise)/(maxRaise-minRaise):1;
 return <section className={`ftp3ActionDock ${canAct?'acting':''}`} aria-label="Table actions">
  {isSpectator&&<div className="spectatorRibbon">◉ WATCHING AS {viewerName} • READ ONLY</div>}
  {!state.started?(state.street==='finished'||state.endedByHost)?<div className="ftp3Watching">Game complete</div>:<>{pregameNote&&<p className="ftp3DockNote">{pregameNote}</p>}{me?.host?<div className="ftp3PregameControls"><button className="ftp3Start" onClick={()=>onAction('start')}>Start Game</button>{showTestBot&&<button className="ftp3OwnerBotControl" onClick={()=>onAction('addbot')}>+ Test Bot</button>}</div>:<div className="ftp3Watching">Waiting for the host to start</div>}</>
  :isSpectator?<div className="ftp3Watching">Watching table • read only</div>:<>
   {showdownChoice&&<div className="ftp3ShowdownChoice"><span><small>LOSING HAND</small><b>Show it or muck it?</b></span><button onClick={()=>onAction('showhand')}>Show Hand</button><button onClick={()=>onAction('muck')}>Muck</button></div>}
   {muckConfirmed&&<div className="ftp3StateNotice">HAND MUCKED</div>}
   {shownEntry?.reason==='voluntary'&&<div className="ftp3StateNotice">HAND SHOWN</div>}
   {rabbitAvailable&&<div className="ftp3Rabbit"><button onClick={()=>onAction('rabbit')}>🐇 Rabbit Hunt</button><small>Reveal the board that would have run out</small></div>}
   {rabbitRevealed&&<div className="ftp3StateNotice">RABBIT RAN • HYPOTHETICAL ONLY</div>}
   {head&&<div className="ftp3DockHead"><small>{canAct?'YOUR TURN':canQueue?'PRE-ACTION':'YOUR HAND'}</small>{showStrength&&<span className="ftp3Strength">{strength}</span>}{canTimeBank&&<button className="ftp3ExtraTime" title="Add 15 seconds of decision time" onClick={()=>onAction('timebank')}>+15s</button>}</div>}
   {sittingOut?<div className="ftp3Watching ftp3SittingOut">SITTING OUT • BLINDS STILL POST • YOU AUTO-FOLD</div>:canAct?<><div className="ftp3ActionRow"><button className="fold" onClick={()=>onAction('fold')}>Fold</button><button className="call" onClick={()=>onAction(state.toCall===0?'check':'call')}>{primaryLabel}{state.toCall>0&&<small>{toCall.toLocaleString()}</small>}</button><button className="raise" disabled={!state.canRaise} onClick={()=>onAction('raise',target)}>{raiseLabel}</button><button className="ftp3AllIn" disabled={!state.canAllIn} onClick={()=>onAction('allin')}>All In<small>{amount(me?.chips)}</small></button></div>{state.canRaise&&<div className="ftp3RaiseRow" style={{'--raise-fill':fill}}><span>{opening?'Bet':'Raise to'}</span><input type="range" min={minRaise} max={maxRaise} step="1" value={target} aria-label={opening?'Bet size':'Raise to'} onChange={e=>setRaise(e.target.value)}/><b className="ftp3RaiseValue">{target.toLocaleString()}</b><div><button className="ftp3Bet25" onClick={()=>quick(.25)}>25%</button><button className="ftp3Bet50" onClick={()=>quick(.5)}>50%</button><button className="ftp3Bet75" onClick={()=>quick(.75)}>75%</button><button className="ftp3BetMax" onClick={()=>setRaise(String(maxRaise))}>Max</button></div></div>}</>:canQueue?<div className="ftp3PreActions"><div><button className={preAction==='checkfold'?'active':''} onClick={()=>onPreAction('checkfold')}>Check / Fold</button><button className={preAction==='check'?'active':''} onClick={()=>onPreAction('check')}>Check</button><button className={preAction==='callany'?'active':''} onClick={()=>onPreAction('callany')}>Call Any</button></div></div>:!isShowdown&&<div className="ftp3Watching">Waiting for action…</div>}
  </>}
 </section>;
}
