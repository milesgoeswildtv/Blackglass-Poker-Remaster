import test from'node:test';
import assert from'node:assert/strict';
import{PokerTable}from'../worker/index.js';

// Random legal play against the real engine (fold/check/call/raise/all-in, mixed short and deep stacks,
// 2-9 players). After every action: whole, non-negative stacks; after every hand: chips conserved and the
// hand reached showdown. A sprint run of 40,000 hands (20 seeds x 2,000) found no violations; this keeps a
// small deterministic slice in the suite.
const fake={storage:{setAlarm(){},deleteAlarm(){},put(){},get(){}},getWebSockets(){return[]}};
const stats=()=>({handsPlayed:0,handsWon:0,vpipHands:0,pfrHands:0,biggestPotWon:0,knockouts:0});
function run(seed,HANDS){
 let s=seed;const rnd=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648},pick=a=>a[Math.floor(rnd()*a.length)];
 const fresh=()=>{const n=2+Math.floor(rnd()*8),players=[];for(let i=0;i<n;i++){const chips=pick([1000,1000,1500,300,60,25,7]);players.push({id:'p'+i,token:'t'+i,name:'P'+i,chips,bet:0,contributed:0,host:i===0,folded:false,eliminated:false,finishPlace:null,cards:[],stats:stats(),handStartChips:chips,vpipThisHand:false,pfrThisHand:false})}
  const t=new PokerTable(fake,{});t.data={code:'FUZZ01',startingChips:1000,blindMinutes:10,blindLevel:0,smallBlind:10,bigBlind:20,levelStartedAt:Date.now(),started:true,paused:false,players,board:[],burned:[],pot:0,deck:[],dealerIndex:n-1,turnIndex:0,currentBet:0,openingBet:0,minRaise:20,street:'waiting',acted:{},actedAtBet:{},message:'',lastResult:null,handHistory:[],placements:[],turnSeconds:30,turnDeadline:null,phaseDeadline:null,handNumber:0,fairness:null};return t};
 const total=t=>t.data.players.reduce((n,p)=>n+p.chips,0);
 let t=fresh(),hands=0,allIns=0;
 while(hands<HANDS){
  if(t.data.players.filter(p=>p.chips>0&&!p.eliminated).length<2||rnd()<0.02)t=fresh();
  const before=total(t);t.newHand();hands++;let guard=0;
  while(t.data.street!=='showdown'&&t.data.street!=='finished'){
   assert.ok(++guard<=400,`seed ${seed} hand ${hands}: no progress`);
   const d=t.data,p=d.players[d.turnIndex],toCall=t.toCall(p),opts=toCall?['fold','call','call','raise','allin']:['check','check','raise','allin'];let done=false;
   for(const type of[pick(opts),'call','check','fold','allin']){const amount=type==='raise'?t.betToMatch()+Math.max(d.minRaise||20,1)*(1+Math.floor(rnd()*3)):0;try{t.act(p,type,amount);done=true;if(type==='allin')allIns++;break}catch{}}
   assert.ok(done,`seed ${seed} hand ${hands}: ${p.id} had no legal action`);
   for(const q of d.players)assert.ok(Number.isInteger(q.chips)&&q.chips>=0&&Number.isInteger(q.bet||0),`seed ${seed} hand ${hands}: stack ${q.id}=${q.chips}/${q.bet}`);
  }
  assert.equal(t.data.street,'showdown');assert.equal(total(t),before,`seed ${seed} hand ${hands}: chips not conserved`);
 }
 return allIns;
}
test('engine fuzz: random legal play conserves chips, keeps stacks whole and always progresses',()=>{
 let allIns=0;for(const seed of[1,7,42])allIns+=run(seed,400);
 assert.ok(allIns>100,'the slice exercises plenty of all-ins');
});
