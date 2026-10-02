import test from'node:test';
import assert from'node:assert/strict';
import{AFTERDARK_SLOT_DEFS,surfaceConfig}from'../src/afterdark-surfaces.js';

const ids=surface=>surfaceConfig(surface).builtIns.map(([id])=>id);

test('gameplay exposes granular selectable production layers',()=>{
 const required=['poker.gameplay.back','poker.gameplay.header','poker.gameplay.commands','poker.table','poker.seat.1','poker.seat.8','poker.board.1','poker.board.5','poker.pot','poker.sidePots','poker.hero.card.1','poker.hero.card.2','poker.hero.plaque','poker.handStrength','poker.extraTime','poker.action.fold','poker.action.call','poker.action.raise','poker.action.allIn','poker.bet.amount','poker.bet.slider','poker.bet.quick','poker.bet.quick.1','poker.bet.quick.4','poker.chat','poker.history'];
 assert.deepEqual(required.filter(id=>!ids('gameplay').includes(id)),[]);
});

test('pre-game exposes granular selectable production layers',()=>{
 const required=['poker.pregame.back','poker.pregame.header','poker.pregame.blinds','poker.table','poker.seat.1','poker.seat.8','poker.hero.card.1','poker.hero.card.2','poker.hero.plaque','poker.pregame.start','poker.pregame.utility','poker.chat','poker.history'];
 assert.deepEqual(required.filter(id=>!ids('pregame').includes(id)),[]);
});

test('selector registry is the complete single source for every built-in',()=>{
 for(const surface of ['gameplay','pregame']){
  const defs=AFTERDARK_SLOT_DEFS[surface];
  assert.equal(new Set(defs.map(def=>def.id)).size,defs.length);
  for(const id of ids(surface))assert.ok(defs.find(def=>def.id===id)?.selector,`${surface}:${id} needs a stable selector`);
 }
});


test('pre-game utility selector has one stable owner contract',()=>{
 const def=AFTERDARK_SLOT_DEFS.pregame.find(def=>def.id==='poker.pregame.utility');
 assert.equal(def?.selector,'[data-afterdark-slot="pregame-utility"]');
});
