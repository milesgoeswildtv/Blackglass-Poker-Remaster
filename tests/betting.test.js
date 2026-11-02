import test from'node:test';
import assert from'node:assert/strict';
import{raiseIsOpen,legalBettingState,applyRaiseState}from'../worker/betting.js';

test('single short all-in does not reopen action for a player who already acted',()=>{
 assert.equal(raiseIsOpen(140,100,100),false);
 const legal=legalBettingState({currentBet:140,minRaise:100,playerBet:100,playerChips:900,actedAtBet:100});
 assert.equal(legal.toCall,40);assert.equal(legal.canRaise,false);assert.equal(legal.canAllIn,false);
});

test('cumulative short all-ins reopen once total increase reaches a full raise',()=>{
 assert.equal(raiseIsOpen(160,100,100),false);
 assert.equal(raiseIsOpen(199,100,100),false);
 assert.equal(raiseIsOpen(200,100,100),true);
 const legal=legalBettingState({currentBet:200,minRaise:100,playerBet:100,playerChips:900,actedAtBet:100});
 assert.equal(legal.canRaise,true);assert.equal(legal.canAllIn,true);
});

test('player who has not acted retains raise rights after a short all-in',()=>{
 assert.equal(raiseIsOpen(140,100,undefined),true);
});

test('all-in call remains legal even when raising is not reopened',()=>{
 const legal=legalBettingState({currentBet:140,minRaise:100,playerBet:100,playerChips:25,actedAtBet:100});
 assert.equal(legal.toCall,40);assert.equal(legal.canRaise,false);assert.equal(legal.canAllIn,true);
});

test('non-all-in undersized raise is rejected',()=>{
 assert.throws(()=>applyRaiseState({currentBet:100,minRaise:100,target:150,isAllIn:false}),/Minimum raise/);
});

test('short all-in increases current bet without lowering minimum raise',()=>{
 assert.deepEqual(applyRaiseState({currentBet:100,minRaise:100,target:150,isAllIn:true}),{currentBet:150,minRaise:100,fullRaise:false});
});

test('full raise replaces minimum raise with its actual raise size',()=>{
 assert.deepEqual(applyRaiseState({currentBet:100,minRaise:100,target:250,isAllIn:false}),{currentBet:250,minRaise:150,fullRaise:true});
});

// Chips are whole numbers. A raise target that is not an integer is rejected before any chips move.
import{PokerTable as FractionTable}from'../worker/index.js';
test('fractional raise targets are rejected and leave stacks untouched',()=>{
 const st=()=>({handsPlayed:0,handsWon:0,vpipHands:0,pfrHands:0,biggestPotWon:0,knockouts:0});
 const pl=(id)=>({id,token:`t${id}`,name:id,chips:1000,bet:0,contributed:0,host:id==='a',folded:false,eliminated:false,finishPlace:null,cards:[],stats:st(),handStartChips:1000,vpipThisHand:false,pfrThisHand:false});
 for(const amount of[60.5,70.25,60.000000001,Infinity,NaN]){
  const t=new FractionTable({storage:{setAlarm(){},deleteAlarm(){},put(){},get(){}},getWebSockets(){return[]}},{});
  t.data={code:'ABC123',startingChips:1000,blindMinutes:10,blindLevel:0,smallBlind:10,bigBlind:20,levelStartedAt:Date.now(),started:true,paused:false,players:[pl('a'),pl('b'),pl('c')],board:[],burned:[],pot:0,deck:[],dealerIndex:2,turnIndex:0,street:'preflop',currentBet:0,minRaise:20,acted:{},chat:[],spectators:[],actionLog:[],handNumber:0};
  t.newHand();const p=t.data.players[t.data.turnIndex],before=t.data.players.map(x=>[x.chips,x.bet]);
  assert.throws(()=>t.act(p,'raise',amount),/whole number/);
  assert.deepEqual(t.data.players.map(x=>[x.chips,x.bet]),before);
 }
 const t=new FractionTable({storage:{setAlarm(){},deleteAlarm(){},put(){},get(){}},getWebSockets(){return[]}},{});
 t.data={code:'ABC123',startingChips:1000,blindMinutes:10,blindLevel:0,smallBlind:10,bigBlind:20,levelStartedAt:Date.now(),started:true,paused:false,players:[pl('a'),pl('b'),pl('c')],board:[],burned:[],pot:0,deck:[],dealerIndex:2,turnIndex:0,street:'preflop',currentBet:0,minRaise:20,acted:{},chat:[],spectators:[],actionLog:[],handNumber:0};
 t.newHand();const p=t.data.players[t.data.turnIndex];t.act(p,'raise',60);
 assert.equal(p.bet,60);assert.ok(t.data.players.every(x=>Number.isInteger(x.chips)&&Number.isInteger(x.bet)));
});
