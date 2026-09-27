import test from'node:test';
import assert from'node:assert/strict';
import{DEFAULT_SKIN_LOADOUT,SKIN_CHANNEL_KEYS,canUseSkin,mergeSkinLoadout,normalizeSkinLoadout,skinChoices,skinSupportsChannel}from'../skin-system.js';

test('skin system exposes exactly five independent channels',()=>{
 assert.deepEqual(SKIN_CHANNEL_KEYS,['lobbyBg','gameRoomBg','gameplayTheme','tableSkin','menuTheme']);
 assert.deepEqual(normalizeSkinLoadout({}),DEFAULT_SKIN_LOADOUT);
});

test('existing booster ownership unlocks gameplay themes only',()=>{
 assert.equal(canUseSkin('constellation',['constellation']),true);
 assert.equal(canUseSkin('constellation',[]),false);
 assert.equal(skinSupportsChannel('constellation','gameplayTheme'),true);
 assert.equal(skinSupportsChannel('constellation','tableSkin'),false);
});

test('default skin is always available in every channel',()=>{
 for(const channel of SKIN_CHANNEL_KEYS){
  const choices=skinChoices(channel,[],false);
  assert.equal(choices.some(x=>x.id==='default'&&x.owned),true);
 }
});

test('linked account skin merge preserves non-default choices per channel',()=>{
 const merged=mergeSkinLoadout({gameplayTheme:'regalia'},{gameplayTheme:'constellation'});
 assert.equal(merged.gameplayTheme,'regalia');
 assert.equal(merged.tableSkin,'default');
});
