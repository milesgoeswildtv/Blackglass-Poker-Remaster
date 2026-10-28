import{assets}from'./assets.js';

/*
  CRASHOUT POKER table skins — presentation only. Nothing here touches game state, rules, betting,
  pots, payouts, accounts or the shop.

  A table skin is data: independently replaceable layers plus anchors measured against the table art.
    room        page background behind the table (independent of the table art)
    table       the table artwork. Every anchor in the skin is a fraction of this image:
                x 0 = left edge → 1 = right edge, y 0 = top (far rail) → 1 = bottom (near rail).
                Values outside 0..1 sit in the frame beyond the art.
    cupholders  a separate transparent layer registered to the table canvas (same size as the table art),
                or — temporarily — painted into the table art. `at` holds the calibrated centre and
                radii of each of the eight cupholders; no cupholder is ever drawn from these numbers.
    frame       stage space around the art (fractions of the art's width/height) so far-side seats and the
                hero can sit past the rail without leaving the stage.
    ticket      opponent and hero ticket widths (fraction of the art width; tickets are 3:1 artwork).
    seats       opponent anchors in clockwise order from the hero's left; each names the cupholder it sits by,
                its bet anchor, and which top corner its face-down cards tuck behind (away from the board).
    layouts     which seats are used for 1–8 opponents (clockwise, so turn order travels around the table).
    hero, board, pot, sidePots   anchors for the remaining live elements (sidePots grows downward from its anchor).

  To add a skin: copy the shape below, supply the art, calibrate the anchors, add it to TABLE_SKINS and run
  tests/table-skins.test.js. To move from the interim art to separate layers, change `table.src`,
  set `cupholders.src` + `cupholders.paintedIntoTable:false`, and recalibrate — no component changes.
*/

export const CUPHOLDER_IDS=['farCenter','left1','left2','left3','right1','right2','right3','frontCenter'];
export const SEAT_ORDER=['left3','left2','left1','farLeft','farCenter','farRight','right1','right2','right3'];
export const TICKET_ASPECT=3;

const afterHoursInterim={
 id:'afterHoursInterim',
 label:'After Hours',
 status:'interim',
 room:{src:assets.default.gameplayBackgroundRemaster,color:'#120d08',position:'center top'},
 table:{
  src:assets.default.gameplayTableRemaster,
  width:1024,
  height:1080,
  interim:true,
  note:'Interim overhead remaster table. It is the only supplied table art with all eight cupholders, so it stays until separate seated-perspective table and cupholder art is supplied.'
 },
 cupholders:{
  src:null,
  paintedIntoTable:true,
  note:'TEMPORARY combined asset: the eight cupholders are painted into the interim table art. Positions below are calibrated to the painted rings.',
  at:{
   farCenter:{x:.5,y:.026,rx:.03,ry:.015},
   left1:{x:.244,y:.1,rx:.037,ry:.016},
   left2:{x:.128,y:.289,rx:.049,ry:.019},
   left3:{x:.04,y:.49,rx:.045,ry:.03},
   right1:{x:.757,y:.1,rx:.037,ry:.016},
   right2:{x:.872,y:.289,rx:.049,ry:.019},
   right3:{x:.96,y:.49,rx:.045,ry:.03},
   frontCenter:{x:.5,y:.727,rx:.08,ry:.058}
  }
 },
 frame:{top:.13,right:0,bottom:0,left:0},
 ticket:{width:.3,heroWidth:.46},
 seats:{
  left3:{at:[.165,.607],bet:[.38,.607],cupholder:'left3',side:'left',cards:'left'},
  left2:{at:[.165,.395],bet:[.25,.47],cupholder:'left2',side:'left',cards:'left'},
  left1:{at:[.225,.185],bet:[.437,.19],cupholder:'left1',side:'left',cards:'left'},
  farLeft:{at:[.315,-.045],bet:[.38,.07],cupholder:'farCenter',side:'far',cards:'left'},
  farCenter:{at:[.5,-.055],bet:[.5,.085],cupholder:'farCenter',side:'far',cards:'left'},
  farRight:{at:[.685,-.045],bet:[.62,.07],cupholder:'farCenter',side:'far',cards:'right'},
  right1:{at:[.775,.185],bet:[.563,.19],cupholder:'right1',side:'right',cards:'right'},
  right2:{at:[.835,.395],bet:[.75,.47],cupholder:'right2',side:'right',cards:'right'},
  right3:{at:[.835,.607],bet:[.62,.607],cupholder:'right3',side:'right',cards:'right'},
  // Spectators only: with no seated viewer, the front-centre place is a ninth seat (see seatEntries).
  front:{at:[.5,.885],bet:[.5,.6],cupholder:'frontCenter',side:'near',cards:'right'}
 },
 layouts:{
  1:['farCenter'],
  2:['left1','right1'],
  3:['left2','farCenter','right2'],
  4:['left2','farLeft','farRight','right2'],
  5:['left3','left1','farCenter','right1','right3'],
  6:['left3','left2','farLeft','farRight','right2','right3'],
  7:['left3','left2','left1','farCenter','right1','right2','right3'],
  8:['left3','left2','left1','farLeft','farRight','right1','right2','right3']
 },
 hero:{at:[.5,.885],cupholder:'frontCenter'},
 board:{at:[.5,.29],width:.4},
 pot:{at:[.5,.375]},
 sidePots:{at:[.5,.41],width:.37}
};

export const TABLE_SKINS={afterHoursInterim};
export const DEFAULT_TABLE_SKIN='afterHoursInterim';

// One polished default for now. Future table themes resolve here (e.g. from table settings) without
// changing the renderer.
export function tableSkinFor(){return TABLE_SKINS[DEFAULT_TABLE_SKIN]}

const round=n=>Math.round(n*1e4)/1e4;
function frameOf(skin){const f=skin.frame||{};return{top:f.top||0,right:f.right||0,bottom:f.bottom||0,left:f.left||0}}
export function artAspect(skin){return skin.table.height/skin.table.width}

// Art fraction → stage percentage (the stage is the art plus its frame).
export function stagePoint(skin,[x,y]){const f=frameOf(skin);return[round((f.left+x)/(1+f.left+f.right)*100),round((f.top+y)/(1+f.top+f.bottom)*100)]}

export function seatLayout(skin,count){const n=Math.max(0,Math.min(8,count|0));return n?skin.layouts[n]:[]}

// Who sits where. A seated viewer is the hero at the front centre; everyone else takes the opponent seats
// clockwise from the hero's left. A spectator has no seat, so the table is drawn from the first player's
// point of view: that player takes the front-centre seat and the rest follow clockwise, so all nine players
// of a full table have a place. Every entry is { player, index, rel, seatIndex, seatId }.
export const FRONT_SEAT='front';
export function seatEntries(skin,players=[],viewer=null){
 if(!players.length)return[];
 const heroIndex=viewer?players.findIndex(p=>p.id===viewer.id):-1,anchor=heroIndex<0?0:heroIndex;
 const around=players.map((player,index)=>({player,index,rel:(index-anchor+players.length)%players.length})).sort((a,b)=>a.rel-b.rel);
 const others=around.slice(1,9),ids=seatLayout(skin,others.length),entries=others.map((item,i)=>({...item,seatIndex:i,seatId:ids[i]}));
 return heroIndex<0?[{...around[0],seatIndex:others.length,seatId:FRONT_SEAT},...entries]:entries;
}

// Ticket box in art fractions for contract checks: width w (of art width), 3:1 artwork.
export function ticketBox(skin,[x,y],w=skin.ticket.width){const h=w/TICKET_ASPECT/artAspect(skin);return{left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2}}

// CSS custom properties consumed by table-skin.css. Set on the table page so the stage, hero and dock share one geometry.
export function tableSkinStyle(skin){
 const f=frameOf(skin),[hx,hy]=skin.hero.at;
 return{
  '--gameplay-remaster-bg':`url(${skin.room.src})`,
  '--table-room-color':skin.room.color,
  '--table-room-position':skin.room.position,
  '--table-art-ratio':String(round(artAspect(skin))),
  '--table-frame-top':String(f.top),
  '--table-frame-right':String(f.right),
  '--table-frame-bottom':String(f.bottom),
  '--table-frame-left':String(f.left),
  '--table-ticket-w':String(skin.ticket.width),
  '--table-hero-ticket-w':String(skin.ticket.heroWidth),
  '--table-hero-x':String(hx),
  '--table-hero-y':String(hy)
 };
}

// Stage-local custom properties: where the art and the centre-table elements sit inside the stage.
export function tableStageStyle(skin){
 const f=frameOf(skin),w=1+f.left+f.right,h=1+f.top+f.bottom,pct=n=>`${round(n*100)}%`,[bx,by]=stagePoint(skin,skin.board.at),[px,py]=stagePoint(skin,skin.pot.at),[sx,sy]=stagePoint(skin,skin.sidePots.at);
 return{
  '--table-art-left':pct(f.left/w),'--table-art-top':pct(f.top/h),'--table-art-width':pct(1/w),'--table-art-height':pct(1/h),
  '--board-x':`${bx}%`,'--board-y':`${by}%`,'--board-w':String(skin.board.width),
  '--pot-x':`${px}%`,'--pot-y':`${py}%`,
  '--sidepots-x':`${sx}%`,'--sidepots-y':`${sy}%`,'--sidepots-w':String(skin.sidePots.width)
 };
}

// Contract for a table skin. Returns a list of problems (empty = valid).
export function validateTableSkin(skin){
 const problems=[],cups=skin?.cupholders?.at||{},seats=skin?.seats||{},bad=m=>problems.push(m);
 if(!skin?.room?.src)bad('room layer has no artwork');
 if(!skin?.table?.src||!skin.table.width||!skin.table.height)bad('table layer has no artwork or size');
 if(!skin?.cupholders?.src&&!skin?.cupholders?.paintedIntoTable)bad('no cupholder artwork: supply a cupholder layer or mark them painted into the table art');
 const ids=Object.keys(cups);
 if(ids.length!==8||CUPHOLDER_IDS.some(id=>!cups[id]))bad(`expected the eight canonical cupholders, got ${ids.join(',')}`);
 if(problems.length)return problems;
 const near=(a,b,t=.02)=>Math.abs(a-b)<=t;
 for(const i of[1,2,3]){const l=cups[`left${i}`],r=cups[`right${i}`];if(!(l.x<.5&&r.x>.5))bad(`left${i}/right${i} are not on their sides`);if(!near(l.x+r.x,1)||!near(l.y,r.y))bad(`left${i}/right${i} are not mirrored`)}
 for(const i of[1,2])if(!(cups[`left${i}`].y<cups[`left${i+1}`].y))bad(`left side cupholders are not ordered far→near at ${i}`);
 const ys=CUPHOLDER_IDS.map(id=>cups[id].y);
 if(!(cups.farCenter.y<=Math.min(...ys)&&near(cups.farCenter.x,.5)))bad('far-centre cupholder is not at the far centre');
 if(!(cups.frontCenter.y>=Math.max(...ys)&&near(cups.frontCenter.x,.5)))bad('front-centre cupholder is not at the front centre');
 const claimed=new Set([skin.hero?.cupholder]);
 for(const id of SEAT_ORDER){const s=seats[id];if(!s){bad(`missing seat ${id}`);continue}if(!cups[s.cupholder])bad(`seat ${id} names unknown cupholder ${s.cupholder}`);claimed.add(s.cupholder)}
 if(skin.hero?.cupholder!=='frontCenter')bad('hero must sit at the front-centre cupholder');
 if(!seats.front?.at||!seats.front?.bet)bad('missing the front seat that spectators use for the ninth player');
 for(const id of CUPHOLDER_IDS)if(!claimed.has(id))bad(`cupholder ${id} has no seat`);
 for(let n=1;n<=8;n++){const l=skin.layouts?.[n]||[];if(l.length!==n||new Set(l).size!==n||l.some(id=>!seats[id]))bad(`layout ${n} is invalid`);const order=l.map(id=>SEAT_ORDER.indexOf(id));if(order.some((v,i)=>i&&v<=order[i-1]))bad(`layout ${n} is not clockwise`)}
 return problems;
}
