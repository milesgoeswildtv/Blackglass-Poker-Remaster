/*
  Table presentation helpers. Each function reads the state the server already sends and decides how to show
  it; nothing here changes game state, betting, pots or payouts.
*/

// positions() labels a seat 'D', 'SB', 'BB' or 'D/SB' (heads-up). The table shows the dealer as a disc and the
// blind in the ticket's small slot, so a combined label splits into both.
export function seatMarkers(label=''){
 const dealer=label==='D'||label.startsWith('D/');
 return{dealer,blind:dealer?label.slice(2):label};
}

// What a ticket says about its player. Sitting out and elimination win over everything; before the first deal
// a seat has no status.
export const STATUS_LABELS={live:'LIVE',folded:'FOLDED',allin:'ALL-IN',away:'AWAY',out:'OUT'};
export function seatStatus(player,state){
 if(!player)return'';
 if(player.eliminated)return'out';
 if(player.sittingOut)return'away';
 if(!state?.started)return'';
 if(Number(player.chips)===0)return'allin';
 if(player.folded)return'folded';
 return'live';
}

// Pot boxes. The engine's livePots splits contributions by level on every street, so a big blind's unmatched
// chips or a bet nobody has called yet show up as a second "pot". Main and side pots are only real when an
// all-in caps someone's share, so the breakdown is shown only while a player still in the hand is all-in, and
// only for levels two or more players reached (a level one player reached is an uncalled bet, which stays
// visible as that player's bet). Otherwise the table shows one POT box with the authoritative total.
export const MAX_POT_BOXES=4;
export function potDisplay(state){
 if(state?.street==='showdown')return[{kind:'awarded',label:'AWARDED',amount:Number(state.lastResult?.settledPot||0)}];
 const players=Array.isArray(state?.players)?state.players:[];
 const allInInHand=!!state?.started&&players.some(p=>Number(p.chips)===0&&!p.eliminated&&!p.folded);
 const contested=(Array.isArray(state?.livePots)?state.livePots:[]).filter(p=>Number(p.amount)>0&&Number(p.participantCount??2)>=2);
 if(allInInHand&&contested.length>=2)return contested.slice(0,MAX_POT_BOXES).map((p,i)=>({kind:i?'side':'main',label:i?`SIDE POT ${i}`:'MAIN POT',amount:Number(p.amount)}));
 return[{kind:'pot',label:'POT',amount:Number(state?.pot||0)}];
}

// Bets use one of the six AFTER HOURS chip stacks, bigger for bigger bets (in big blinds).
export const CHIP_STACK_TIERS=[1,2.5,5,10,25];
export function chipStackIndex(amount,bigBlind){
 const ratio=Math.max(0,Number(amount)||0)/Math.max(1,Number(bigBlind)||1),i=CHIP_STACK_TIERS.findIndex(t=>ratio<=t);
 return i<0?CHIP_STACK_TIERS.length:i;
}

// The acting player's clock: mm:ss for wide tickets, "17s" for compact ones, and the share of the turn left.
export function clockParts(secondsLeft,turnSeconds){
 const s=Math.max(0,Math.floor(Number(secondsLeft)||0)),total=Math.max(1,Number(turnSeconds)||30);
 return{long:`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`,short:`${s}s`,left:Math.min(1,s/total)};
}
