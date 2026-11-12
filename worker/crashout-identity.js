import{authenticatedIdentity}from'./auth.js';
import{accountRequest,resolveAccountId}from'./account-links.js';
const enc=new TextEncoder(),dec=new TextDecoder();
const STATE='ftp_crashout_state',VERIFIER='ftp_crashout_verifier',NONCE='ftp_crashout_nonce',ISSUER='https://qcmfnkuyinhfdxnuvneb.supabase.co/auth/v1',CLAIM_URL='https://qcmfnkuyinhfdxnuvneb.supabase.co/functions/v1/claim-destination-identity';
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}})}
function cookies(req){const out={};for(const part of String(req.headers.get('cookie')||'').split(';')){const i=part.indexOf('=');if(i>0)out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim())}return out}
function cookie(name,value,maxAge){return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
function clear(name){return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`}
function b64url(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'')}
function random(size=32){const b=new Uint8Array(size);crypto.getRandomValues(b);return b64url(b)}
async function sha256(value){return new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value)))}
function appendClear(headers){for(const name of[STATE,VERIFIER,NONCE])headers.append('set-cookie',clear(name));return headers}
function finish(origin,ok,error=''){const headers=new Headers({location:ok?`${origin}/?crashout=linked`:`${origin}/?crashout=failed&reason=${encodeURIComponent(error)}`,'cache-control':'no-store'});appendClear(headers);return new Response(null,{status:302,headers})}
export async function handleCrashoutIdentityApi(req,env){
 const u=new URL(req.url);if(!u.pathname.startsWith('/api/auth/crashout/'))return null;
 const identity=await authenticatedIdentity(req,env);if(!identity)return json({error:'Crashout Poker login required.'},401);
 const clientId=String(env.CRASHOUT_OIDC_CLIENT_ID||''),clientSecret=String(env.CRASHOUT_OIDC_CLIENT_SECRET||''),adapterKey=String(env.CRASHOUT_POKER_ADAPTER_KEY||'');
 if(u.pathname==='/api/auth/crashout/status'&&req.method==='GET'){const profile=await accountRequest(env,identity,'/profile');return json({linked:!!profile?.account?.crashoutLinked})}
 if(u.pathname==='/api/auth/crashout/start'&&req.method==='GET'){
  if(!clientId||!clientSecret||adapterKey.length<32)return json({error:'Crashout identity integration is not fully configured.'},503);
  const state=random(32),verifier=random(48),nonce=random(32),challenge=b64url(await sha256(verifier)),redirectUri=`${u.origin}/api/auth/crashout/callback`,authorize=new URL(`${ISSUER}/oauth/authorize`);
  for(const[k,v]of Object.entries({response_type:'code',client_id:clientId,redirect_uri:redirectUri,scope:'openid profile',state,nonce,code_challenge:challenge,code_challenge_method:'S256'}))authorize.searchParams.set(k,v);
  const headers=new Headers({location:authorize.toString(),'cache-control':'no-store'});headers.append('set-cookie',cookie(STATE,state,600));headers.append('set-cookie',cookie(VERIFIER,verifier,600));headers.append('set-cookie',cookie(NONCE,nonce,600));return new Response(null,{status:302,headers})
 }
 if(u.pathname==='/api/auth/crashout/callback'&&req.method==='GET'){
  const jar=cookies(req),state=u.searchParams.get('state')||'',code=u.searchParams.get('code')||'';
  if(!state||state!==jar[STATE]||!code||!jar[VERIFIER]||!jar[NONCE])return finish(u.origin,false,'state');
  if(!clientId||!clientSecret||adapterKey.length<32)return finish(u.origin,false,'configuration');
  const redirectUri=`${u.origin}/api/auth/crashout/callback`,basic=btoa(`${clientId}:${clientSecret}`),tokenResponse=await fetch(`${ISSUER}/oauth/token`,{method:'POST',headers:{authorization:`Basic ${basic}`,'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:redirectUri,code_verifier:jar[VERIFIER]})});
  if(!tokenResponse.ok){console.error('crashout_oauth_exchange_failed',{status:tokenResponse.status});return finish(u.origin,false,'exchange')}
  const tokens=await tokenResponse.json(),idToken=String(tokens.id_token||'');if(!idToken)return finish(u.origin,false,'missing_id_token');
  const canonicalId=await resolveAccountId(env,identity.id),claim=await fetch(CLAIM_URL,{method:'POST',headers:{'content-type':'application/json','x-crashout-adapter-key':adapterKey},body:JSON.stringify({game_key:'poker',external_player_id:canonicalId,id_token:idToken,nonce:jar[NONCE]})});
  const claimBody=await claim.json().catch(()=>({}));if(!claim.ok){console.error('crashout_identity_claim_failed',{status:claim.status,error:claimBody.error||'claim_failed'});return finish(u.origin,false,String(claimBody.error||'claim_failed'))}
  const saved=await accountRequest(env,identity,'/crashout/link',{crashoutUserId:String(claimBody.crashout_user_id||claimBody.user_id||'')});if(saved?.error)return finish(u.origin,false,'account_link_save');
  return finish(u.origin,true)
 }
 return null
}
