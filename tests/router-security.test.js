import test from'node:test';
import assert from'node:assert/strict';
import router,{hardenResponse}from'../worker/router.js';
import{APP_VERSION}from'../worker/health.js';

test('normal worker responses receive baseline browser security headers',async()=>{const r=hardenResponse(new Response('ok',{status:200,headers:{'content-type':'text/plain','x-custom':'kept'}}));assert.equal(await r.text(),'ok');assert.equal(r.status,200);assert.equal(r.headers.get('x-custom'),'kept');assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('x-frame-options'),'DENY');assert.equal(r.headers.get('referrer-policy'),'no-referrer');assert.equal(r.headers.get('permissions-policy'),'camera=(), microphone=(), geolocation=(), payment=()')});

test('websocket upgrade responses are never reconstructed by response hardening',()=>{const upgrade={status:101,webSocket:{accepted:true},headers:new Headers()};assert.equal(hardenResponse(upgrade),upgrade)});

test('deployed router health uses the authoritative release version and security headers',async()=>{const r=await router.fetch(new Request('https://fulltilt.test/api/health'),{},{}),j=await r.json();assert.equal(r.status,200);assert.equal(j.version,APP_VERSION);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('x-frame-options'),'DENY')});

test('worker router sends malformed host-key preparation to AccessRegistry and returns structured JSON',async()=>{
 let registryRequests=0;
 const env={ACCESS_REGISTRY:{idFromName(name){assert.equal(name,'crashout-access');return name},get(){return{async fetch(request){registryRequests+=1;assert.equal(new URL(request.url).pathname,'/prepare');return Response.json({error:'Enter a valid host key.'},{status:400})}}}}};
 const r=await router.fetch(new Request('https://fulltilt.test/api/access/key/prepare',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:'intentionally-malformed'})}),env,{}),j=await r.json();
 assert.equal(registryRequests,1);assert.equal(r.status,400);assert.match(r.headers.get('content-type'),/^application\/json/);assert.deepEqual(j,{error:'Enter a valid host key.'});assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');
});
