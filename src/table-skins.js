/*
  CRASHOUT POKER table skins — presentation only. Nothing here touches game state, rules, betting,
  pots, payouts, accounts or the shop.

  A skin is data. Each orientation variant draws ONE environment image (the AFTER HOURS V3 gameplay
  backgrounds have the table baked in) and pins every live table element to a point on that image:
    art         the environment image and its pixel size. Every anchor is a fraction of this image:
                x 0 = left edge → 1 = right edge, y 0 = top → 1 = bottom.
    sizes       element sizes: `f` is a fraction of the rendered art width, `min` a floor in CSS px.
                table-skin.css draws with exactly these numbers (sceneStyle emits them) and the contract
                below checks collisions with the same numbers.
    seats       opponent anchors in clockwise order from the hero's left, each with its bet anchor and the side
                of the table it sits on. `front` is the front-centre place a spectator's first player takes (it is
                the hero's place).
    hero        the local player's ticket and bet anchors, and where their hole cards sit:
                'above' the ticket (phones) or 'inside' its right-hand slots (wide screens).
    board, pots, staging   centre-table anchors.
    feltMark    optional: the faint live CRASHOUT POKER · AFTER HOURS text on the felt. Drop the anchor from both
                variants to remove it.
    cupholders  optional notes about cupholders painted into the art. They never decide seats.

  The two variants share seat identities and the clockwise layouts, so who sits where never depends on the
  screen — only coordinates do. CSS picks the variant with LANDSCAPE_MEDIA (the same query is written in
  table-skin.css; tests/table-skins.test.js keeps them identical), so rotating or resizing re-lays out
  without React state.

  To add a skin: copy the shape below, supply the art, calibrate the anchors, add it to TABLE_SKINS and run
  tests/table-skins.test.js.
*/

export const SEAT_ORDER=['left3','left2','left1','farLeft','farCenter','farRight','right1','right2','right3'];
export const FRONT_SEAT='front';
export const VARIANTS=['portrait','landscape'];
export const TICKET_ASPECT=3;
// Portrait art on phones, portrait tablets and narrow windows; landscape art once the viewport is at least
// square and 600px wide. The width floor keeps a phone with its keyboard open on the portrait layout.
export const LANDSCAPE_MEDIA='(min-aspect-ratio: 1/1) and (min-width: 600px)';
// A phone held sideways: portrait gameplay is the priority, so the page asks for rotation instead.
export const ROTATE_MEDIA='(min-aspect-ratio: 1/1) and (min-width: 600px) and (max-height: 500px) and (pointer: coarse)';
export const hasFeltMark=skin=>VARIANTS.every(name=>!!skin.variants?.[name]?.feltMark?.at);

// Which seats are used for 1–8 opponents, clockwise from the hero's left so turn order travels around the table.
const LAYOUTS={
 1:['farCenter'],
 2:['left1','right1'],
 3:['left2','farCenter','right2'],
 4:['left2','farLeft','farRight','right2'],
 5:['left3','left1','farCenter','right1','right3'],
 6:['left3','left2','farLeft','farRight','right2','right3'],
 7:['left3','left2','left1','farCenter','right1','right2','right3'],
 8:['left3','left2','left1','farLeft','farRight','right1','right2','right3']
};

// Optimized WebP copies of the V3 environments (same pixel size as the PNG originals beside them).
const REMASTER='/remaster';

const afterHoursV3={
 id:'afterHoursV3',
 label:'After Hours',
 status:'approved',
 source:'AFTER HOURS V3 kit, Oct 6 (public/remaster). The table is baked into each environment image.',
 layouts:LAYOUTS,
 variants:{
  portrait:{
   art:{src:`${REMASTER}/afterhours_gameplay_background_mobile.webp`,width:864,height:1536},
   cupholders:null,
   sizes:{
    ticket:{f:.282},heroTicket:{f:.34},
    board:{f:.39},card:{aspect:.8},
    heroCard:{f:.088,min:34},
    chip:{f:.052,min:20},
    pot:{f:.18,min:64},potHeight:{f:.082,min:32},potCols:2,
    disc:{f:.032,min:18},
    feltMark:{f:.04,min:13},
    staging:{f:.39}
   },
   // Arranged like afterhours_reference_gameplay_mobile.png (pots between the first side pair, board below, side
   // bets just inside their tickets, the hero's cards above their ticket), mapped onto the real mobile background.
   seats:{
    left3:{at:[.18,.64],bet:[.2,.594],side:'left'},
    left2:{at:[.15,.49],bet:[.17,.545],side:'left'},
    left1:{at:[.155,.35],bet:[.17,.405],side:'left'},
    farLeft:{at:[.25,.228],bet:[.3,.272],side:'far'},
    farCenter:{at:[.5,.228],bet:[.5,.272],side:'far'},
    farRight:{at:[.75,.228],bet:[.7,.272],side:'far'},
    right1:{at:[.845,.35],bet:[.83,.405],side:'right'},
    right2:{at:[.85,.49],bet:[.83,.545],side:'right'},
    right3:{at:[.82,.64],bet:[.8,.594],side:'right'}
   },
   hero:{at:[.5,.66],bet:[.5,.538],cards:'above'},
   board:{at:[.5,.436]},
   pots:{at:[.5,.405]},
   feltMark:{at:[.5,.491]},
   staging:{at:[.5,.4]}
  },
  landscape:{
   art:{src:`${REMASTER}/afterhours_gameplay_background_desktop.webp`,width:1536,height:864},
   // Four cupholders are painted into the desktop art. They are recorded, not protected: seats come first.
   cupholders:{painted:true,keepVisible:false,at:{farLeft:{x:.199,y:.203,r:.016},farRight:{x:.791,y:.197,r:.016},nearLeft:{x:.244,y:.708,r:.016},nearRight:{x:.755,y:.708,r:.016}}},
   sizes:{
    ticket:{f:.15},heroTicket:{f:.21},
    board:{f:.255},card:{aspect:.8},
    heroCard:{f:.031,min:34},
    chip:{f:.026,min:22},
    pot:{f:.094,min:84},potHeight:{f:.034,min:36},potCols:4,
    disc:{f:.018,min:18},
    feltMark:{f:.017,min:13},
    staging:{f:.3}
   },
   // Measured from afterhours_reference_gameplay_desktop.png, which matches the desktop background 1:1.
   seats:{
    left3:{at:[.26,.685],bet:[.352,.604],side:'left'},
    left2:{at:[.108,.53],bet:[.28,.527],side:'left'},
    left1:{at:[.105,.333],bet:[.241,.365],side:'left'},
    farLeft:{at:[.231,.166],bet:[.3,.243],side:'far'},
    farCenter:{at:[.5,.166],bet:[.5,.237],side:'far'},
    farRight:{at:[.684,.164],bet:[.69,.243],side:'far'},
    right1:{at:[.892,.332],bet:[.687,.431],side:'right'},
    right2:{at:[.892,.533],bet:[.76,.538],side:'right'},
    right3:{at:[.723,.685],bet:[.648,.604],side:'right'}
   },
   hero:{at:[.498,.69],bet:[.498,.573],cards:'inside'},
   board:{at:[.502,.399]},
   pots:{at:[.501,.342]},
   feltMark:{at:[.501,.497]},
   staging:{at:[.5,.36]}
  }
 }
};

export const TABLE_SKINS={afterHoursV3};
export const DEFAULT_TABLE_SKIN='afterHoursV3';

// One polished default for now. Future table themes resolve here (e.g. from table settings) without changing the renderer.
export function tableSkinFor(){return TABLE_SKINS[DEFAULT_TABLE_SKIN]}

const round=n=>Math.round(n*1e4)/1e4;
const variantOf=(skin,name)=>skin.variants[name];
export function artRatio(variant){return variant.art.height/variant.art.width}

export function seatLayout(skin,count){const n=Math.max(0,Math.min(8,count|0));return n?skin.layouts[n]:[]}

// The seat a place resolves to in one variant. `front` is the hero's place.
export function seatOf(variant,seatId){return seatId===FRONT_SEAT?{at:variant.hero.at,bet:variant.hero.bet,side:'near'}:variant.seats[seatId]}

// Who sits where. A seated viewer is the hero at the front centre; everyone else takes the opponent seats
// clockwise from the hero's left. A spectator has no seat, so the table is drawn from the first player's
// point of view: that player takes the front-centre seat and the rest follow clockwise, so all nine players
// of a full table have a place. Every entry is { player, index, rel, seatIndex, seatId }.
export function seatEntries(skin,players=[],viewer=null){
 if(!players.length)return[];
 const heroIndex=viewer?players.findIndex(p=>p.id===viewer.id):-1,anchor=heroIndex<0?0:heroIndex;
 const around=players.map((player,index)=>({player,index,rel:(index-anchor+players.length)%players.length})).sort((a,b)=>a.rel-b.rel);
 const others=around.slice(1,9),ids=seatLayout(skin,others.length),entries=others.map((item,i)=>({...item,seatIndex:i,seatId:ids[i]}));
 return heroIndex<0?[{...around[0],seatIndex:others.length,seatId:FRONT_SEAT},...entries]:entries;
}

// Inline custom properties that pin one element in both variants; table-skin.css picks the pair.
export function anchorVars(skin,pick,prefix=''){
 const out={};
 for(const name of VARIANTS){const p=pick(variantOf(skin,name)),v=name[0];out[`--${prefix}${v}x`]=String(round(p[0]));out[`--${prefix}${v}y`]=String(round(p[1]))}
 return out;
}
export const seatVars=(skin,seatId)=>({...anchorVars(skin,v=>seatOf(v,seatId).at),...anchorVars(skin,v=>seatOf(v,seatId).bet,'b')});
export const heroVars=skin=>({...anchorVars(skin,v=>v.hero.at),...anchorVars(skin,v=>v.hero.bet,'b')});
export const pointVars=(skin,key)=>anchorVars(skin,v=>v[key].at);

// ---- geometry: element boxes in art fractions for a rendered art width (px) ----
const px=(size,artW)=>Math.max(size.min||0,artW*(size.f||0));
function box(cx,cy,w,h){return{left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2}}
// Footprints of live text, used only for the contract: a bet's pill holds "12,500" in max(12px, chip × .34) type
// (table-skin.css .ftp3Bet b); the felt mark is CRASHOUT POKER (9.8em wide, 2.5em for both lines) over AFTER HOURS
// between two rules (10.9em of its own max(11px, .46em) type).
const BET_TEXT_EM=3.6,BET_PILL_PAD_PX=14,FELT_MARK_EM=[9.8,2.5],FELT_SUBLINE_EM=10.9;

export function ticketBox(variant,at,artW,{hero=false}={}){
 const w=px(hero?variant.sizes.heroTicket:variant.sizes.ticket,artW)/artW,h=w*variant.art.width/TICKET_ASPECT/variant.art.height;
 return box(at[0],at[1],w,h);
}
// The dealer disc sits above the avatar ring, which is the ticket's left fifth.
export function discBox(variant,at,artW,opts){
 const t=ticketBox(variant,at,artW,opts),d=px(variant.sizes.disc,artW),dw=d/artW,dh=d/(artW*artRatio(variant)),cx=t.left+(t.right-t.left)*.177;
 return box(cx,t.top-dh*.2,dw,dh);
}
export function betBox(variant,at,artW){
 const chip=px(variant.sizes.chip,artW),font=Math.max(12,chip*.34),w=(chip+3+font*BET_TEXT_EM+BET_PILL_PAD_PX)/artW,h=Math.max(chip,font*1.15+6)/(artW*artRatio(variant));
 return box(at[0],at[1],w,h);
}
export function boardBox(variant,artW){
 const w=px(variant.sizes.board,artW)/artW,cardW=w*.184,h=cardW/variant.sizes.card.aspect*variant.art.width/variant.art.height;
 return box(variant.board.at[0],variant.board.at[1],w,h);
}
// Pot boxes sit on rows just above the board (the anchor is the bottom centre) and grow upward when they wrap: at most
// sizes.potCols per row. Room is kept for the main pot plus three side pots (the most the table shows).
export const POT_GAP=4,MAX_POTS=4;
export const potColumns=(variant,count)=>Math.max(1,Math.min(count,variant.sizes.potCols));
// The pot row's anchor plus each variant's column count for `count` pots, so the row is exactly as wide as its boxes.
export const potsVars=(skin,count)=>({...pointVars(skin,'pots'),'--pcols':String(potColumns(skin.variants.portrait,count)),'--lcols':String(potColumns(skin.variants.landscape,count))});
export function potsLayout(variant,artW,count=MAX_POTS){
 const one=px(variant.sizes.pot,artW),h=px(variant.sizes.potHeight,artW),perRow=potColumns(variant,count),rows=Math.ceil(count/perRow);
 return{one,h,perRow,rows,width:one*perRow+POT_GAP*(perRow-1),height:h*rows+POT_GAP*(rows-1)};
}
export function potsBox(variant,artW,count=MAX_POTS){
 const l=potsLayout(variant,artW,count),[x,y]=variant.pots.at,w=l.width/artW,h=l.height/(artW*artRatio(variant));
 return{left:x-w/2,right:x+w/2,top:y-h,bottom:y};
}
// Pre-game card on the felt where the board and pots will appear. Its height is the text block it holds (measured at
// most 147px on phones, where the copy wraps, and 117px on wide screens).
const STAGING_PX={portrait:152,landscape:150};
export function stagingBox(variant,name,artW){
 const w=px(variant.sizes.staging,artW)/artW,h=STAGING_PX[name]/(artW*artRatio(variant));
 return box(variant.staging.at[0],variant.staging.at[1],w,h);
}
// The hero's two hole cards (table-skin.css .ftp3HeroCards): inside the ticket's right-hand box, or a pair above the
// ticket whose bottom edge tucks 14% into it.
export function heroCardsBox(variant,artW){
 const t=ticketBox(variant,variant.hero.at,artW,{hero:true}),tw=t.right-t.left,th=t.bottom-t.top;
 if(variant.hero.cards==='inside')return{left:t.left+tw*.58,right:t.right-tw*.04,top:t.top+th*.08,bottom:t.bottom-th*.08};
 const cw=px(variant.sizes.heroCard,artW),w=(cw*1.9)/artW,h=(cw/.72)/(artW*artRatio(variant)),bottom=t.top+th*.14;
 return{left:variant.hero.at[0]-w/2,right:variant.hero.at[0]+w/2,top:bottom-h,bottom};
}
// The felt mark is two lines of live text; its size follows its font size (sizes.feltMark).
export function feltMarkBox(variant,artW){
 const font=px(variant.sizes.feltMark,artW),w=Math.max(font*FELT_MARK_EM[0],Math.max(11,font*.46)*FELT_SUBLINE_EM)/artW,h=font*FELT_MARK_EM[1]/(artW*artRatio(variant));
 return box(variant.feltMark.at[0],variant.feltMark.at[1],w,h);
}

// Every element of one layout as named boxes. `seatIds` are the opponents' seats (a spectator's list starts with
// FRONT_SEAT). Live play shows bets, board, pots and the felt mark; pre-game shows the staging card instead.
export function layoutBoxes(skin,name,seatIds,artW,{spectator=false,pregame=false}={}){
 const v=variantOf(skin,name),out=[];
 for(const id of seatIds){const s=seatOf(v,id);out.push({kind:'ticket',id,box:ticketBox(v,s.at,artW)});if(!pregame)out.push({kind:'disc',id,box:discBox(v,s.at,artW)},{kind:'bet',id,box:betBox(v,s.bet,artW)})}
 if(!spectator){out.push({kind:'ticket',id:'hero',box:ticketBox(v,v.hero.at,artW,{hero:true})});if(!pregame)out.push({kind:'disc',id:'hero',box:discBox(v,v.hero.at,artW,{hero:true})},{kind:'bet',id:'hero',box:betBox(v,v.hero.bet,artW)},{kind:'heroCards',id:'hero',box:heroCardsBox(v,artW)})}
 if(pregame)out.push({kind:'staging',id:'staging',box:stagingBox(v,name,artW)});
 else{out.push({kind:'board',id:'board',box:boardBox(v,artW)},{kind:'pots',id:'pots',box:potsBox(v,artW)});if(v.feltMark?.at)out.push({kind:'feltMark',id:'feltMark',box:feltMarkBox(v,artW)})}
 return out;
}
// Every layout the table can show: 1–8 opponents for a seated player, live and pre-game, and a spectator's nine.
export function allLayouts(skin){
 const out=[];
 for(let n=1;n<=8;n++)for(const pregame of[false,true])out.push({label:`${n} opponents${pregame?' (pre-game)':''}`,seatIds:seatLayout(skin,n),opts:{pregame}});
 for(const pregame of[false,true])out.push({label:`spectator, 9 players${pregame?' (pre-game)':''}`,seatIds:[FRONT_SEAT,...seatLayout(skin,8)],opts:{spectator:true,pregame}});
 return out;
}
// The narrowest and a wide rendered art width per variant. The floors (`min`) only bite at the narrow end and every
// size scales with the art above them, so the two ends cover the range. Portrait: 330px is Telegram's usable
// 375×591 viewport (a 375×667 phone) with its compact chat; landscape: 900px is a ~860px-wide or ~575px-tall window.
export const CHECK_WIDTHS={portrait:[330,1100],landscape:[900,2600]};

// The area every live element of every layout needs (art fractions). The scene is fitted so this is always on screen.
export function safeRect(skin,name){
 let r=null;
 const grow=b=>{r=r?{left:Math.min(r.left,b.left),right:Math.max(r.right,b.right),top:Math.min(r.top,b.top),bottom:Math.max(r.bottom,b.bottom)}:{...b}};
 for(const artW of CHECK_WIDTHS[name])for(const l of allLayouts(skin))for(const e of layoutBoxes(skin,name,l.seatIds,artW,l.opts))grow(e.box);
 const pad=.006;
 return{left:Math.max(0,round(r.left-pad)),top:Math.max(0,round(r.top-pad)),right:Math.min(1,round(r.right+pad)),bottom:Math.min(1,round(r.bottom+pad))};
}

// Page-level custom properties for both variants, consumed by table-skin.css.
export function sceneStyle(skin){
 const out={};
 for(const name of VARIANTS){
  const v=variantOf(skin,name),p=`--${name[0]}-`,s=safeRect(skin,name),z=v.sizes;
  Object.assign(out,{
   [`${p}art-ratio`]:String(round(artRatio(v))),
   [`${p}art-aspect`]:`${v.art.width} / ${v.art.height}`,
   [`${p}safe-l`]:String(s.left),[`${p}safe-t`]:String(s.top),[`${p}safe-w`]:String(round(s.right-s.left)),[`${p}safe-h`]:String(round(s.bottom-s.top)),
   [`${p}tk-w`]:String(z.ticket.f),[`${p}hero-w`]:String(z.heroTicket.f),[`${p}board-w`]:String(z.board.f),
   [`${p}hero-card-f`]:String(z.heroCard.f),[`${p}hero-card-min`]:`${z.heroCard.min}px`,
   [`${p}chip-f`]:String(z.chip.f),[`${p}chip-min`]:`${z.chip.min}px`,
   [`${p}pot-f`]:String(z.pot.f),[`${p}pot-min`]:`${z.pot.min}px`,[`${p}pot-h-f`]:String(z.potHeight.f),[`${p}pot-h-min`]:`${z.potHeight.min}px`,
   [`${p}disc-f`]:String(z.disc.f),[`${p}disc-min`]:`${z.disc.min}px`,
   [`${p}felt-f`]:String(z.feltMark.f),[`${p}felt-min`]:`${z.feltMark.min}px`,[`${p}staging-w`]:String(z.staging.f)
  });
 }
 return out;
}

// ---- contract ----
const overlapArea=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
// Angle of a point around the board, measured clockwise (as the viewer sees it) from straight down at the hero.
function clockAngle(v,[x,y]){const[cx,cy]=v.board.at,a=Math.atan2((y-cy)*v.art.height,(x-cx)*v.art.width)*180/Math.PI;return(a-90+720)%360}

// Problems in one set of boxes: anything leaving the art, and any two elements overlapping (a seat's own disc
// and hole cards are drawn on its ticket, so those pairs are allowed).
export function layoutProblems(boxes){
 const out=[];
 for(const e of boxes){const b=e.box;if(b.left<-1e-6||b.right>1+1e-6||b.top<-1e-6||b.bottom>1+1e-6)out.push(`${e.kind} ${e.id} leaves the art`)}
 for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const a=boxes[i],b=boxes[j];
  if(a.id===b.id&&(a.kind==='disc'||b.kind==='disc'||a.kind==='heroCards'||b.kind==='heroCards'))continue;
  if(overlapArea(a.box,b.box)>1e-7)out.push(`${a.kind} ${a.id} overlaps ${b.kind} ${b.id}`);
 }
 return out;
}

// Returns a list of problems (empty = valid). Geometry is checked at the smallest and largest expected art widths.
export function validateTableSkin(skin){
 const problems=[],bad=m=>problems.push(m);
 for(let n=1;n<=8;n++){const l=skin.layouts?.[n]||[];if(l.length!==n||new Set(l).size!==n||l.some(id=>!SEAT_ORDER.includes(id)))bad(`layout ${n} is invalid`);const order=l.map(id=>SEAT_ORDER.indexOf(id));if(order.some((o,i)=>i&&o<=order[i-1]))bad(`layout ${n} is not clockwise`)}
 for(const name of VARIANTS){
  const v=skin.variants?.[name];
  if(!v){bad(`missing ${name} variant`);continue}
  if(!!v.feltMark?.at!==hasFeltMark(skin))bad(`${name}: the felt mark must be on both variants or neither`);
  if(!v.art?.src||!v.art.width||!v.art.height)bad(`${name}: environment art has no source or size`);
  if(v.cupholders&&!v.cupholders.painted&&!v.cupholders.src)bad(`${name}: cupholders must be painted into the art or supplied as a layer`);
  for(const id of SEAT_ORDER)if(!v.seats?.[id]?.at||!v.seats[id].bet)bad(`${name}: missing seat ${id}`);
  for(const key of['hero','board','pots','staging'])if(!v[key]?.at)bad(`${name}: missing ${key} anchor`);
  if(!v.hero?.bet)bad(`${name}: the hero (and the spectator front seat) needs a bet anchor`);
  if(!Number.isInteger(v.sizes?.potCols)||v.sizes.potCols<1)bad(`${name}: sizes.potCols must be a whole number of pot boxes per row`);
  if(problems.length)continue;
  const angles=SEAT_ORDER.map(id=>clockAngle(v,v.seats[id].at));
  if(angles.some((a,i)=>i&&a<=angles[i-1]))bad(`${name}: seats are not clockwise around the board`);
  for(const artW of CHECK_WIDTHS[name])for(const l of allLayouts(skin))for(const p of layoutProblems(layoutBoxes(skin,name,l.seatIds,artW,l.opts)))bad(`${name}@${artW}px ${l.label}: ${p}`);
 }
 return problems;
}
