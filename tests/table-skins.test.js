import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';
import{TABLE_SKINS,SEAT_ORDER,FRONT_SEAT,VARIANTS,LANDSCAPE_MEDIA,ROTATE_MEDIA,CHECK_WIDTHS,MAX_POTS,tableSkinFor,validateTableSkin,seatLayout,seatOf,seatEntries,seatVars,heroVars,potsVars,potsLayout,potColumns,allLayouts,layoutBoxes,safeRect,sceneStyle,hasFeltMark,heroCardsBox,ticketBox}from'../src/table-skins.js';
import{ticketFor,plaqueFor,avatarFrameFor,betChipFor,chipFor,cardBackFor}from'../src/assets.js';

// Layout contract for the AFTER HOURS V3 table: one environment image per orientation, every live element on an anchor
// of that image, no collisions for any player count, the same seat identities and clockwise order in both variants.
const skin=tableSkinFor(),read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url));
const imageSize=file=>{const b=read(`public${file}`);assert.equal(b.toString('latin1',1,4),'PNG',file);return[b.readUInt32BE(16),b.readUInt32BE(20)]};
const css=p=>read(p).toString('utf8');

test('every table skin satisfies the layout contract',()=>{
 for(const s of Object.values(TABLE_SKINS))assert.deepEqual(validateTableSkin(s),[],s.id);
});

test('each orientation draws one approved AFTER HOURS V3 environment at its real pixel size',()=>{
 const{portrait,landscape}=skin.variants;
 assert.equal(portrait.art.src,'/remaster/afterhours_gameplay_background_mobile.png');
 assert.equal(landscape.art.src,'/remaster/afterhours_gameplay_background_desktop.png');
 for(const name of VARIANTS){const{src,width,height}=skin.variants[name].art;assert.deepEqual(imageSize(src),[width,height],`${name} art size`)}
 assert.ok(portrait.art.height>portrait.art.width&&landscape.art.width>landscape.art.height,'portrait art is tall, landscape art is wide');
 const source=['src/table-skins.js','src/table-skin.css','src/gameplay.css','src/TableSurface.jsx','src/assets.js'].map(css).join('\n');
 assert.doesNotMatch(source,/CRASHOUT_(BACKGROUND|TABLE)_REMASTER|\/assets\/remaster\//,'the legacy September room and table are gone from the table');
});

test('the CSS picks the variant with exactly the media queries the skin module exports',()=>{
 for(const file of['src/table-skin.css','src/gameplay.css','src/social.css']){
  const queries=[...css(file).matchAll(/@media\s*([^{]*aspect-ratio[^{]*)\{/g)].map(m=>m[1].trim());
  for(const q of queries)assert.ok(q===LANDSCAPE_MEDIA||q===ROTATE_MEDIA,`${file}: ${q}`);
 }
 assert.ok(css('src/table-skin.css').includes(`@media ${LANDSCAPE_MEDIA}`));
 assert.ok(css('src/gameplay.css').includes(`@media ${ROTATE_MEDIA}`),'the rotate prompt uses ROTATE_MEDIA');
 assert.ok(ROTATE_MEDIA.startsWith(LANDSCAPE_MEDIA),'the rotate prompt only appears on the landscape variant');
});

test('sceneStyle emits every page variable table-skin.css reads, for both variants',()=>{
 const style=sceneStyle(skin),used=new Set([...css('src/table-skin.css').matchAll(/var\(--([pl])-([a-z-]+)\)/g)].map(m=>m[2]));
 for(const name of used)for(const v of['p','l'])assert.ok(`--${v}-${name}` in style,`--${v}-${name} is read but not emitted`);
 for(const key of Object.keys(style))assert.ok(used.has(key.slice(4)),`${key} is emitted but never read`);
 for(const name of VARIANTS){
  const s=safeRect(skin,name);
  assert.ok(s.left>=0&&s.top>=0&&s.right<=1&&s.bottom<=1&&s.left<s.right&&s.top<s.bottom,`${name} safe rectangle`);
 }
});

test('seat layouts travel clockwise from the hero and use distinct seats',()=>{
 assert.deepEqual(seatLayout(skin,8),['left3','left2','left1','farLeft','farRight','right1','right2','right3']);
 assert.deepEqual(seatLayout(skin,1),['farCenter']);
 assert.deepEqual(seatLayout(skin,0),[]);
 for(let n=1;n<=8;n++){const order=seatLayout(skin,n).map(id=>SEAT_ORDER.indexOf(id));assert.deepEqual([...order].sort((a,b)=>a-b),order,`layout ${n}`)}
 for(const name of VARIANTS){
  const v=skin.variants[name],[cx,cy]=v.board.at,angle=([x,y])=>(Math.atan2((y-cy)*v.art.height,(x-cx)*v.art.width)*180/Math.PI-90+720)%360;
  const angles=SEAT_ORDER.map(id=>angle(v.seats[id].at));
  assert.ok(angles.every((a,i)=>!i||a>angles[i-1]),`${name}: seats run clockwise around the board`);
  assert.ok(SEAT_ORDER.slice(0,3).every(id=>v.seats[id].at[0]<.5)&&SEAT_ORDER.slice(6).every(id=>v.seats[id].at[0]>.5),`${name}: left seats on the left, right seats on the right`);
 }
});

test('for 1–8 opponents, a spectator’s nine and pre-game, nothing collides or leaves the art at the checked widths',()=>{
 const labels=allLayouts(skin).map(l=>l.label);
 assert.ok(labels.includes('spectator, 9 players')&&labels.includes('8 opponents (pre-game)'));
 for(const name of VARIANTS)for(const artW of CHECK_WIDTHS[name])for(const l of allLayouts(skin)){
  const boxes=layoutBoxes(skin,name,l.seatIds,artW,l.opts),kinds=new Set(boxes.map(b=>b.kind));
  assert.ok(kinds.has('ticket'),`${name}@${artW} ${l.label}`);
  if(!l.opts.pregame)assert.ok(kinds.has('board')&&kinds.has('pots')&&kinds.has('bet'),`${name}@${artW} ${l.label}: live elements`);
  else assert.ok(kinds.has('staging')&&!kinds.has('board'),`${name}@${artW} ${l.label}: the staging card stands in for board and pots`);
 }
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
  assert.ok(e.every(x=>x.player===players[x.index]),'wrapped players');
  for(const name of VARIANTS)assert.ok(e.every(x=>seatOf(skin.variants[name],x.seatId)?.at),`${name}: every entry resolves to an anchor`);
 }
 assert.deepEqual(seatEntries(skin,[],null),[]);
});

test('the front seat is the hero’s place, and every element carries its anchor for both variants',()=>{
 for(const name of VARIANTS){const v=skin.variants[name];assert.deepEqual(seatOf(v,FRONT_SEAT).at,v.hero.at);assert.deepEqual(seatOf(v,FRONT_SEAT).bet,v.hero.bet)}
 const vars=seatVars(skin,'left2');
 assert.deepEqual(Object.keys(vars).sort(),['--blx','--bly','--bpx','--bpy','--lx','--ly','--px','--py']);
 assert.equal(vars['--px'],String(skin.variants.portrait.seats.left2.at[0]));
 assert.equal(vars['--lx'],String(skin.variants.landscape.seats.left2.at[0]));
 assert.deepEqual(seatVars(skin,FRONT_SEAT),heroVars(skin));
});

test('pots: one box per pot, at most the variant’s columns per row, and the row is exactly as wide as its boxes',()=>{
 assert.equal(MAX_POTS,4);
 for(const name of VARIANTS){
  const v=skin.variants[name];
  for(let count=1;count<=MAX_POTS;count++){
   const l=potsLayout(v,CHECK_WIDTHS[name][0],count);
   assert.equal(l.perRow,Math.min(count,v.sizes.potCols));
   assert.equal(l.rows,Math.ceil(count/l.perRow));
   assert.equal(Math.round(l.width),Math.round(l.one*l.perRow+4*(l.perRow-1)));
  }
 }
 assert.deepEqual(potsVars(skin,4),{...potsVars(skin,4),'--pcols':'2','--lcols':'4'});
 assert.equal(potsVars(skin,1)['--pcols'],'1');
 assert.equal(potColumns(skin.variants.portrait,3),2);
});

test('the hero’s hole cards sit above the ticket on phones and inside its right-hand box on wide screens',()=>{
 const{portrait,landscape}=skin.variants;
 assert.equal(portrait.hero.cards,'above');
 assert.equal(landscape.hero.cards,'inside');
 const t=ticketBox(portrait,portrait.hero.at,390,{hero:true}),c=heroCardsBox(portrait,390);
 assert.ok(c.top<t.top&&c.bottom<t.bottom,'phone cards stand above the ticket');
 assert.ok(Math.round((c.bottom-c.top)*390*portrait.art.height/portrait.art.width)>=46,'phone cards are at least ~34×48px');
 const lt=ticketBox(landscape,landscape.hero.at,1536,{hero:true}),lc=heroCardsBox(landscape,1536);
 assert.ok(lc.left>lt.left+(lt.right-lt.left)/2&&lc.right<=lt.right&&lc.top>=lt.top&&lc.bottom<=lt.bottom,'wide-screen cards stay inside the ticket’s right half');
});

test('the felt mark is optional and removable from the skin data alone',()=>{
 assert.equal(hasFeltMark(skin),true);
 const plain=structuredClone(skin);
 for(const name of VARIANTS)delete plain.variants[name].feltMark;
 assert.equal(hasFeltMark(plain),false);
 assert.deepEqual(validateTableSkin(plain),[]);
 for(const name of VARIANTS)assert.ok(layoutBoxes(plain,name,seatLayout(plain,8),CHECK_WIDTHS[name][0]).every(b=>b.kind!=='feltMark'));
});

test('the contract rejects broken skins',()=>{
 const clone=()=>structuredClone(skin);
 const swapped=clone();swapped.layouts[8]=['right3',...swapped.layouts[8].slice(0,7)];
 assert.ok(validateTableSkin(swapped).some(m=>/not clockwise/.test(m)));
 const missing=clone();delete missing.variants.landscape.seats.left2;
 assert.ok(validateTableSkin(missing).some(m=>/landscape: missing seat left2/.test(m)));
 const crowded=clone();crowded.variants.portrait.seats.left2.at=[...crowded.variants.portrait.seats.left1.at];
 assert.ok(validateTableSkin(crowded).some(m=>/portrait@\d+px .*ticket left2 overlaps ticket left1|portrait: seats are not clockwise/.test(m)));
 const outside=clone();outside.variants.landscape.seats.farCenter.at=[.5,.01];
 assert.ok(validateTableSkin(outside).some(m=>/leaves the art/.test(m)));
 const noCols=clone();noCols.variants.portrait.sizes.potCols=1.5;
 assert.ok(validateTableSkin(noCols).some(m=>/potCols/.test(m)));
 const halfMark=clone();delete halfMark.variants.portrait.feltMark;
 assert.ok(validateTableSkin(halfMark).some(m=>/felt mark must be on both variants/.test(m)));
 const noArt=clone();noArt.variants.portrait.art.src='';
 assert.ok(validateTableSkin(noArt).some(m=>/environment art/.test(m)));
});

test('tickets: V3 artwork for the default skin, equipped pack artwork for purchased packs',()=>{
 const idle=ticketFor({cosmetic:'default',chips:100});
 assert.match(idle.src,/afterhours_standard_seat_ticket\.png$/);assert.equal(idle.layout,'v3');assert.equal(idle.activeSrc,null);
 const acting=ticketFor({cosmetic:'default',chips:100,turn:true});
 assert.match(acting.src,/afterhours_standard_seat_ticket\.png$/,'an acting opponent keeps the standard ticket where it is compact');
 assert.match(acting.activeSrc,/afterhours_hero_active_seat_ticket\.png$/,'and switches to the hero/active art where it is wide');
 const hero=ticketFor({cosmetic:'default',chips:100,turn:true},{hero:true});
 assert.match(hero.src,/afterhours_hero_active_seat_ticket\.png$/);assert.equal(hero.layout,'v3Active');assert.equal(hero.activeSrc,null);
 const pack=ticketFor({cosmetic:'regalia',chips:100,folded:true});
 assert.match(pack.src,/regalia-folded-player-plaque\.png$/);assert.equal(pack.layout,'pack');assert.equal(pack.activeSrc,null);
 const packActing=ticketFor({cosmetic:'regalia',chips:100,turn:true});
 assert.match(packActing.src,/regalia-active-player-plaque\.png$/,'a pack keeps its own active art');assert.equal(packActing.activeSrc,null);
 const packHero=ticketFor({cosmetic:'constellation',chips:100,turn:true},{hero:true});
 assert.match(packHero.src,/constellation-active-player-plaque\.png$/);assert.equal(packHero.layout,'pack');
 assert.equal(ticketFor({cosmetic:'wat',chips:1}).layout,'v3','unknown cosmetics fall back to the default ticket');
 assert.equal(plaqueFor({cosmetic:'deadMansHand',chips:0,eliminated:false}).endsWith('dead-mans-hand-all-in-player-plaque.png'),true);
 assert.equal(avatarFrameFor({cosmetic:'default'}),null,'the V3 ticket ring replaces the legacy default frame');
 assert.match(avatarFrameFor({cosmetic:'regalia'}),/regalia-avatar-frame\.png$/,'purchased avatar frames still render');
 assert.match(cardBackFor({cosmetic:'deadMansHand'}),/card-back-skull\.png$/,'purchased card backs still render');
});

test('bets: V3 chip stacks sized by big blinds for the default skin, the pack’s own chip for purchased packs',()=>{
 const stack=(amount,bb=100)=>betChipFor({cosmetic:'default'},amount,bb);
 assert.match(stack(50),/afterhours_chip_stack_01_red_loose\.png$/);
 assert.match(stack(100),/afterhours_chip_stack_01_red_loose\.png$/);
 assert.match(stack(250),/afterhours_chip_stack_02_red_blue_loose\.png$/);
 assert.match(stack(400),/afterhours_chip_stack_03_mixed_three\.png$/);
 assert.match(stack(900),/afterhours_chip_stack_04_mixed_tall\.png$/);
 assert.match(stack(2000),/afterhours_chip_stack_05_mixed_four\.png$/);
 assert.match(stack(12500),/afterhours_chip_stack_06_mixed_four_alt\.png$/);
 for(const file of new Set([50,250,400,900,2000,12500].map(a=>stack(a))))assert.ok(read(`public${file}`).length>0,file);
 assert.equal(betChipFor({cosmetic:'regalia'},12500,100),chipFor({cosmetic:'regalia'},'purple'));
 assert.match(betChipFor({cosmetic:'constellation'},50,100),/constellation-purple-chip\.png$/);
});
