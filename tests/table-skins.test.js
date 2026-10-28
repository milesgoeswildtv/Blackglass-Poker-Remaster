import test from'node:test';
import assert from'node:assert/strict';
import{TABLE_SKINS,CUPHOLDER_IDS,SEAT_ORDER,FRONT_SEAT,tableSkinFor,validateTableSkin,seatLayout,seatEntries,stagePoint,ticketBox,artAspect,tableSkinStyle,tableStageStyle}from'../src/table-skins.js';
import{ticketFor,plaqueFor,avatarFrameFor}from'../src/assets.js';

// Layout contract for table skins, checked in table-art fractions so it holds at every viewport size.
const skins=Object.values(TABLE_SKINS),skin=tableSkinFor();
const overlap=(a,b,eps=0)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>eps&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>eps;
// A box covers a cupholder if it contains the ring centre or any of 8 points on the ring.
const coversCup=(r,c)=>[[0,0],[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]].some(([dx,dy])=>{const x=c.x+dx*c.rx,y=c.y+dy*c.ry;return x>r.left&&x<r.right&&y>r.top&&y<r.bottom});
const centreBox=(s,[x,y],w,h)=>({left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2});
const boardBox=s=>{const w=s.board.width,h=w*.2441/artAspect(s);return centreBox(s,s.board.at,w,h)};
const stageBounds=s=>({left:-s.frame.left,right:1+s.frame.right,top:-s.frame.top,bottom:1+s.frame.bottom});
const inside=(r,b)=>r.left>=b.left-1e-9&&r.right<=b.right+1e-9&&r.top>=b.top-1e-9&&r.bottom<=b.bottom+1e-9;

test('every table skin satisfies the layout contract',()=>{
 for(const s of skins)assert.deepEqual(validateTableSkin(s),[],s.id);
});

test('the default skin declares its interim art honestly and keeps room, table and cupholders separable',()=>{
 assert.equal(skin.table.interim,true);
 assert.match(skin.table.note,/interim/i);
 assert.equal(skin.cupholders.paintedIntoTable,true,'cupholders are a temporary part of the table art');
 assert.equal(skin.cupholders.src,null,'no separate cupholder layer is invented');
 assert.match(skin.cupholders.note,/TEMPORARY/);
 assert.match(skin.room.src,/CRASHOUT_BACKGROUND_REMASTER\.webp$/);
 assert.match(skin.table.src,/CRASHOUT_TABLE_REMASTER\.webp$/);
 assert.notEqual(skin.room.src,skin.table.src,'room and table are independent layers');
});

test('the eight cupholders follow the canonical arrangement',()=>{
 const c=skin.cupholders.at;
 assert.deepEqual(Object.keys(c).sort(),[...CUPHOLDER_IDS].sort());
 assert.equal(['left1','left2','left3'].filter(id=>c[id].x<.5).length,3,'three on the left');
 assert.equal(['right1','right2','right3'].filter(id=>c[id].x>.5).length,3,'three on the right');
 assert.ok(Math.abs(c.farCenter.x-.5)<.02&&CUPHOLDER_IDS.every(id=>c.farCenter.y<=c[id].y),'one at the far centre');
 assert.ok(Math.abs(c.frontCenter.x-.5)<.02&&CUPHOLDER_IDS.every(id=>c.frontCenter.y>=c[id].y),'one at the front centre');
 for(const i of[1,2,3])assert.ok(Math.abs(c[`left${i}`].x+c[`right${i}`].x-1)<.02&&Math.abs(c[`left${i}`].y-c[`right${i}`].y)<.02,`pair ${i} mirrored`);
});

test('each seat is tied to its cupholder: same side, adjacent, never covering it',()=>{
 const c=skin.cupholders.at;
 for(const id of SEAT_ORDER){
  const seat=skin.seats[id],cup=c[seat.cupholder],box=ticketBox(skin,seat.at);
  if(seat.side==='left')assert.ok(seat.at[0]<.5&&cup.x<.5,id);
  if(seat.side==='right')assert.ok(seat.at[0]>.5&&cup.x>.5,id);
  if(seat.side==='far')assert.equal(seat.cupholder,'farCenter',id);
  const dx=Math.max(box.left-cup.x,0,cup.x-box.right),dy=Math.max(box.top-cup.y,0,cup.y-box.bottom);
  assert.ok(Math.hypot(dx,dy)<.1,`${id} ticket is next to cupholder ${seat.cupholder}`);
  for(const other of CUPHOLDER_IDS)assert.ok(!coversCup(box,c[other]),`${id} ticket covers cupholder ${other}`);
 }
 const hero=ticketBox(skin,skin.hero.at,skin.ticket.heroWidth);
 for(const id of CUPHOLDER_IDS)assert.ok(!coversCup(hero,c[id]),`hero ticket covers ${id}`);
 assert.ok(hero.top>c.frontCenter.y+c.frontCenter.ry,'hero sits in front of the front-centre cupholder');
});

test('for 1–8 opponents, tickets, bets, board and pot never collide and stay on the stage',()=>{
 const stage=stageBounds(skin),board=boardBox(skin),hero=ticketBox(skin,skin.hero.at,skin.ticket.heroWidth);
 for(let n=1;n<=8;n++){
  const ids=seatLayout(skin,n),boxes=ids.map(id=>[id,ticketBox(skin,skin.seats[id].at)]);
  for(const[id,b]of boxes){
   assert.ok(inside(b,stage),`${n}: ${id} leaves the stage`);
   assert.ok(!overlap(b,board),`${n}: ${id} overlaps the board`);
   assert.ok(!overlap(b,hero),`${n}: ${id} overlaps the hero`);
   const bet=centreBox(skin,skin.seats[id].bet,.11,.045);
   assert.ok(!overlap(bet,board),`${n}: ${id} bet overlaps the board`);
   for(const[other,ob]of boxes){if(other!==id){assert.ok(!overlap(b,ob),`${n}: ${id}/${other} tickets overlap`);assert.ok(!overlap(bet,ob),`${n}: ${id} bet overlaps ${other} ticket`)}}
  }
 }
});

test('seat layouts travel clockwise from the hero and use distinct seats',()=>{
 assert.deepEqual(seatLayout(skin,8),['left3','left2','left1','farLeft','farRight','right1','right2','right3']);
 assert.deepEqual(seatLayout(skin,1),['farCenter']);
 assert.deepEqual(seatLayout(skin,0),[]);
 for(let n=1;n<=8;n++){const order=seatLayout(skin,n).map(id=>SEAT_ORDER.indexOf(id));assert.deepEqual([...order].sort((a,b)=>a-b),order,`layout ${n}`)}
});

test('seat entries: a seated viewer is the hero and the others fill the clockwise layout',()=>{
 const players=Array.from({length:9},(_,i)=>({id:`p${i}`}));
 const e=seatEntries(skin,players,players[3]);
 assert.equal(e.length,8);
 assert.deepEqual(e.map(x=>x.seatId),seatLayout(skin,8));
 assert.deepEqual(e.map(x=>x.player.id),['p4','p5','p6','p7','p8','p0','p1','p2'],'clockwise from the hero');
 assert.ok(e.every(x=>x.player===players[x.index]),'every entry wraps its player and table index');
});

test('seat entries: a spectator with no seat sees every player, the first in the front-centre seat',()=>{
 for(let n=1;n<=9;n++){
  const players=Array.from({length:n},(_,i)=>({id:`p${i}`})),e=seatEntries(skin,players,null);
  assert.equal(e.length,n,`${n} players`);
  assert.equal(e[0].seatId,FRONT_SEAT);
  assert.equal(e[0].player.id,'p0');
  assert.deepEqual(e.slice(1).map(x=>x.seatId),seatLayout(skin,n-1));
  assert.deepEqual(e.slice(1).map(x=>x.player.id),players.slice(1).map(p=>p.id),'the rest follow clockwise');
  assert.equal(new Set(e.map(x=>x.seatId)).size,n,'nobody shares a seat');
  assert.ok(e.every(x=>x.player===players[x.index]&&skin.seats[x.seatId]),'wrapped players on real seats');
 }
 assert.deepEqual(seatEntries(skin,[],null),[]);
});

test('the spectator front seat fits a full table without colliding',()=>{
 const front=skin.seats.front,box=ticketBox(skin,front.at),bet=centreBox(skin,front.bet,.11,.045),board=boardBox(skin);
 assert.ok(inside(box,stageBounds(skin)),'front ticket stays on the stage');
 assert.ok(!overlap(box,board)&&!overlap(bet,board),'clear of the board');
 for(const id of seatLayout(skin,8)){
  const other=ticketBox(skin,skin.seats[id].at),otherBet=centreBox(skin,skin.seats[id].bet,.11,.045);
  assert.ok(!overlap(box,other),`front ticket overlaps ${id}`);
  assert.ok(!overlap(bet,other),`front bet overlaps ${id} ticket`);
  assert.ok(!overlap(otherBet,box),`${id} bet overlaps the front ticket`);
  assert.ok(!overlap(bet,otherBet),`front bet overlaps ${id} bet`);
 }
 for(const id of CUPHOLDER_IDS)assert.ok(!coversCup(box,skin.cupholders.at[id]),`front ticket covers cupholder ${id}`);
});

test('the contract rejects broken skins',()=>{
 const clone=()=>structuredClone(skin);
 const noCup=clone();delete noCup.cupholders.at.left2;
 assert.ok(validateTableSkin(noCup).some(m=>/eight canonical cupholders/.test(m)));
 const noArt=clone();noArt.cupholders.paintedIntoTable=false;noArt.cupholders.src=null;
 assert.ok(validateTableSkin(noArt).some(m=>/no cupholder artwork/.test(m)));
 const lopsided=clone();lopsided.cupholders.at.right2.y+=.1;
 assert.ok(validateTableSkin(lopsided).some(m=>/not mirrored/.test(m)));
 const swapped=clone();swapped.layouts[8]=['right3',...swapped.layouts[8].slice(0,7)];
 assert.ok(validateTableSkin(swapped).some(m=>/not clockwise/.test(m)));
 const orphan=clone();orphan.seats.left2.cupholder='left1';
 assert.ok(validateTableSkin(orphan).some(m=>/cupholder left2 has no seat/.test(m)));
 const noFront=clone();delete noFront.seats.front;
 assert.ok(validateTableSkin(noFront).some(m=>/front seat/.test(m)));
});

test('anchors convert to stage percentages through the frame',()=>{
 const f=skin.frame;
 assert.deepEqual(stagePoint(skin,[0,0]),[Math.round(f.left/(1+f.left+f.right)*1e6)/1e4,Math.round(f.top/(1+f.top+f.bottom)*1e6)/1e4]);
 assert.deepEqual(stagePoint(skin,[.5,1]).map(Math.round),[50,100]);
 const style=tableSkinStyle(skin),stageStyle=tableStageStyle(skin);
 assert.match(style['--gameplay-remaster-bg'],/CRASHOUT_BACKGROUND_REMASTER/);
 assert.equal(Number(style['--table-art-ratio']).toFixed(3),(1080/1024).toFixed(3));
 assert.equal(stageStyle['--table-art-width'],'100%');
 assert.match(stageStyle['--table-art-top'],/%$/);
});

test('tickets: V3 artwork for the default skin, equipped pack artwork for purchased packs',()=>{
 const idle=ticketFor({cosmetic:'default',chips:100});
 assert.match(idle.src,/afterhours_standard_seat_ticket\.png$/);assert.equal(idle.layout,'v3');
 const acting=ticketFor({cosmetic:'default',chips:100,turn:true});
 assert.match(acting.src,/afterhours_standard_seat_ticket\.png$/,'acting opponents keep the standard ticket: its slots hold 11px+ text');assert.equal(acting.layout,'v3');
 const hero=ticketFor({cosmetic:'default',chips:100},{hero:true});
 assert.match(hero.src,/afterhours_hero_active_seat_ticket\.png$/);assert.equal(hero.layout,'v3Active');
 const pack=ticketFor({cosmetic:'regalia',chips:100,folded:true});
 assert.match(pack.src,/regalia-folded-player-plaque\.png$/);assert.equal(pack.layout,'pack');
 const packHero=ticketFor({cosmetic:'constellation',chips:100,turn:true},{hero:true});
 assert.match(packHero.src,/constellation-active-player-plaque\.png$/);assert.equal(packHero.layout,'pack');
 assert.equal(ticketFor({cosmetic:'wat',chips:1}).layout,'v3','unknown cosmetics fall back to the default ticket');
 assert.equal(plaqueFor({cosmetic:'deadMansHand',chips:0,eliminated:false}).endsWith('dead-mans-hand-all-in-player-plaque.png'),true);
 assert.equal(avatarFrameFor({cosmetic:'default'}),null,'the V3 ticket ring replaces the legacy default frame');
 assert.match(avatarFrameFor({cosmetic:'regalia'}),/regalia-avatar-frame\.png$/,'purchased avatar frames still render');
});
