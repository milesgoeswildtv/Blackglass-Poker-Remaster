import test from'node:test';
import assert from'node:assert/strict';
import{buildSnapTargets,snapMoveRect,snapResizeRect,SNAP_GRID}from'../src/afterdark-snapping.js';

test('Afterdark move snapping prefers nearby centers and edges',()=>{
 const targets=buildSnapTargets({'other':{x:40,y:80,width:120,height:60}},'selected',390,800);
 const out=snapMoveRect({left:147,top:106,right:247,bottom:156},targets);
 assert.equal(out.left,145);
 assert.equal(out.guideX,195);
 assert.equal(out.top,110);
 assert.equal(out.guideY,110);
});

test('Afterdark move snapping falls back to the 8px grid',()=>{
 const out=snapMoveRect({left:13,top:19,right:113,bottom:69},{x:[],y:[]});
 assert.equal(SNAP_GRID,8);
 assert.equal(out.left,16);
 assert.equal(out.top,16);
 assert.equal(out.guideX,null);
 assert.equal(out.guideY,null);
});

test('Afterdark resize snapping locks active edges without moving opposite edges',()=>{
 const out=snapResizeRect({left:40,top:80,right:193,bottom:140},'se',{x:[195],y:[144]});
 assert.deepEqual({left:out.left,top:out.top,right:out.right,bottom:out.bottom},{left:40,top:80,right:195,bottom:144});
 assert.equal(out.guideX,195);
 assert.equal(out.guideY,144);
});

test('Afterdark resize snapping preserves the minimum touch-editable size',()=>{
 const out=snapResizeRect({left:78,top:40,right:100,bottom:100},'w',{x:[80],y:[]});
 assert.equal(out.right-out.left,24);
 assert.equal(out.right,100);
});
