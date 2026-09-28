export const SNAP_GRID=8;
export const SNAP_THRESHOLD=6;

const finite=n=>Number.isFinite(Number(n));
const grid=(value,step=SNAP_GRID)=>Math.round(Number(value)/step)*step;

function nearest(anchors,targets,threshold=SNAP_THRESHOLD){
 let best=null;
 for(const anchor of anchors)for(const target of targets){
  const delta=Number(target)-Number(anchor),distance=Math.abs(delta);
  if(distance<=threshold&&(!best||distance<best.distance))best={delta,distance,target:Number(target)};
 }
 return best;
}

function edge(value,targets,threshold=SNAP_THRESHOLD,step=SNAP_GRID){
 const hit=nearest([value],targets,threshold);
 return hit?{value:Number(value)+hit.delta,guide:hit.target}:{value:grid(value,step),guide:null};
}

export function buildSnapTargets(rects={},selected='',stageWidth=0,stageHeight=0){
 const x=[],y=[];
 if(finite(stageWidth)&&Number(stageWidth)>0)x.push(0,Number(stageWidth)/2,Number(stageWidth));
 if(finite(stageHeight)&&Number(stageHeight)>0)y.push(0,Number(stageHeight)/2,Number(stageHeight));
 for(const[id,r]of Object.entries(rects||{})){
  if(id===selected||id==='poker.background'||!r)continue;
  const left=Number(r.x),top=Number(r.y),width=Number(r.width),height=Number(r.height);
  if([left,top,width,height].every(Number.isFinite)&&width>0&&height>0){
   x.push(left,left+width/2,left+width);
   y.push(top,top+height/2,top+height);
  }
 }
 return{x,y};
}

export function snapMoveRect(rect,targets,threshold=SNAP_THRESHOLD,step=SNAP_GRID){
 const left=Number(rect.left),top=Number(rect.top),right=Number(rect.right),bottom=Number(rect.bottom);
 const width=right-left,height=bottom-top;
 const hitX=nearest([left,left+width/2,right],targets.x||[],threshold);
 const hitY=nearest([top,top+height/2,bottom],targets.y||[],threshold);
 const nextLeft=hitX?left+hitX.delta:grid(left,step);
 const nextTop=hitY?top+hitY.delta:grid(top,step);
 return{left:nextLeft,top:nextTop,right:nextLeft+width,bottom:nextTop+height,guideX:hitX?.target??null,guideY:hitY?.target??null};
}

export function snapResizeRect(rect,mode,targets,threshold=SNAP_THRESHOLD,step=SNAP_GRID,minSize=24){
 let left=Number(rect.left),top=Number(rect.top),right=Number(rect.right),bottom=Number(rect.bottom),guideX=null,guideY=null;
 if(mode.includes('w')){const s=edge(left,targets.x||[],threshold,step);left=s.value;guideX=s.guide}
 if(mode.includes('e')){const s=edge(right,targets.x||[],threshold,step);right=s.value;guideX=s.guide}
 if(mode.includes('n')){const s=edge(top,targets.y||[],threshold,step);top=s.value;guideY=s.guide}
 if(mode.includes('s')){const s=edge(bottom,targets.y||[],threshold,step);bottom=s.value;guideY=s.guide}
 if(right-left<minSize){if(mode.includes('w'))left=right-minSize;else right=left+minSize;guideX=null}
 if(bottom-top<minSize){if(mode.includes('n'))top=bottom-minSize;else bottom=top+minSize;guideY=null}
 return{left,top,right,bottom,guideX,guideY};
}
