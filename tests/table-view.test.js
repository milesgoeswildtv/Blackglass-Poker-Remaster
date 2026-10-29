import test from'node:test';
import assert from'node:assert/strict';
import{seatMarkers,seatStatus,STATUS_LABELS,potDisplay,MAX_POT_BOXES,chipStackIndex,CHIP_STACK_TIERS,clockParts}from'../src/table-view.js';

// Presentation helpers: they only read the state the server sends.

test('position labels split into the dealer disc and the blind badge',()=>{
 assert.deepEqual(seatMarkers('D'),{dealer:true,blind:''});
 assert.deepEqual(seatMarkers('D/SB'),{dealer:true,blind:'SB'},'heads-up dealer posts the small blind');
 assert.deepEqual(seatMarkers('SB'),{dealer:false,blind:'SB'});
 assert.deepEqual(seatMarkers('BB'),{dealer:false,blind:'BB'});
 assert.deepEqual(seatMarkers(''),{dealer:false,blind:''});
 assert.deepEqual(seatMarkers(),{dealer:false,blind:''});
});

test('seat status: out and away win, nothing before the first deal, then all-in, folded or live',()=>{
 const live={started:true},waiting={started:false};
 assert.equal(seatStatus({eliminated:true,chips:0,sittingOut:true},live),'out');
 assert.equal(seatStatus({sittingOut:true,folded:true,chips:900},live),'away');
 assert.equal(seatStatus({sittingOut:true,chips:900},waiting),'away');
 assert.equal(seatStatus({chips:900},waiting),'');
 assert.equal(seatStatus({chips:0},live),'allin');
 assert.equal(seatStatus({chips:900,folded:true},live),'folded');
 assert.equal(seatStatus({chips:900},live),'live');
 assert.equal(seatStatus(null,live),'');
 assert.deepEqual(Object.keys(STATUS_LABELS).sort(),['allin','away','folded','live','out']);
 assert.equal(STATUS_LABELS.allin,'ALL-IN');
});

const table=(over={})=>({started:true,street:'turn',pot:1300,players:[{id:'a',chips:900},{id:'b',chips:400},{id:'c',chips:2000}],livePots:[],...over});

test('pots: one POT box with the authoritative total unless an all-in makes side pots real',()=>{
 assert.deepEqual(potDisplay(table()),[{kind:'pot',label:'POT',amount:1300}]);
 // an uncalled bet shows up as a one-player level: it is not a side pot
 const uncalled=table({livePots:[{amount:1200,participantCount:3},{amount:100,participantCount:1}]});
 assert.deepEqual(potDisplay(uncalled),[{kind:'pot',label:'POT',amount:1300}]);
 // two contested levels but nobody all-in: still one pot
 assert.deepEqual(potDisplay(table({livePots:[{amount:900,participantCount:3},{amount:400,participantCount:2}]})).map(p=>p.kind),['pot']);
});

test('pots: MAIN POT and SIDE POT n while a player still in the hand is all-in, at most four boxes',()=>{
 const players=[{id:'a',chips:0},{id:'b',chips:0},{id:'c',chips:0},{id:'d',chips:500},{id:'e',chips:800}];
 const s=table({players,pot:8300,livePots:[{amount:3600,participantCount:5},{amount:2400,participantCount:4},{amount:1500,participantCount:3},{amount:600,participantCount:2},{amount:200,participantCount:2},{amount:50,participantCount:1}]});
 const pots=potDisplay(s);
 assert.equal(MAX_POT_BOXES,4);
 assert.deepEqual(pots.map(p=>p.label),['MAIN POT','SIDE POT 1','SIDE POT 2','SIDE POT 3']);
 assert.deepEqual(pots.map(p=>p.kind),['main','side','side','side']);
 assert.deepEqual(pots.map(p=>p.amount),[3600,2400,1500,600]);
 // a folded or eliminated player with no chips does not make side pots
 const quiet=table({players:[{id:'a',chips:0,folded:true},{id:'b',chips:0,eliminated:true},{id:'c',chips:900}],livePots:[{amount:900,participantCount:3},{amount:400,participantCount:2}]});
 assert.deepEqual(potDisplay(quiet).map(p=>p.kind),['pot']);
 // before the first deal nobody is all-in
 assert.deepEqual(potDisplay(table({started:false,players:[{id:'a',chips:0}],pot:0,livePots:[{amount:10,participantCount:2},{amount:5,participantCount:2}]})).map(p=>p.kind),['pot']);
});

test('pots: showdown shows the settled total as AWARDED',()=>{
 assert.deepEqual(potDisplay(table({street:'showdown',pot:0,lastResult:{settledPot:9500}})),[{kind:'awarded',label:'AWARDED',amount:9500}]);
 assert.deepEqual(potDisplay(table({street:'showdown',pot:0,lastResult:null})),[{kind:'awarded',label:'AWARDED',amount:0}]);
});

test('chip stacks grow with the bet in big blinds',()=>{
 assert.deepEqual(CHIP_STACK_TIERS,[1,2.5,5,10,25]);
 const at=(amount,bb=100)=>chipStackIndex(amount,bb);
 assert.deepEqual([0,50,100,101,250,251,500,1000,2500,2501,1e6].map(a=>at(a)),[0,0,0,1,1,2,2,3,4,5,5]);
 assert.equal(chipStackIndex(100,0),5,'a missing big blind counts as 1');
 assert.equal(chipStackIndex(-5,100),0);
});

test('turn clock: mm:ss for wide tickets, seconds for compact ones, and the share of the turn left',()=>{
 assert.deepEqual(clockParts(16,30),{long:'00:16',short:'16s',left:16/30});
 assert.deepEqual(clockParts(75,30),{long:'01:15',short:'75s',left:1},'time-bank seconds never overfill the bar');
 assert.deepEqual(clockParts(-3,30),{long:'00:00',short:'0s',left:0});
 assert.deepEqual(clockParts(9.8,0),{long:'00:09',short:'9s',left:9/30},'a missing turn length falls back to 30 seconds');
});
