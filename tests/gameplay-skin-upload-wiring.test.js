import test from'node:test';
import assert from'node:assert/strict';
import{readFileSync}from'node:fs';

const skinClient=readFileSync(new URL('../src/skin-client.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/gameplay.css',import.meta.url),'utf8');
const surface=readFileSync(new URL('../src/TableSurface.jsx',import.meta.url),'utf8');

test('uploaded gameplay skin roles are wired to production presentation targets',()=>{
 for(const role of[
  'action-button-primary',
  'action-button-secondary',
  'bet-amount-pill',
  'bet-slider-track',
  'chip-tray-panel',
  'community-cards-panel',
  'dealer-button',
  'player-seat-panel',
  'pot-panel',
  'turn-timer-ring'
 ])assert.ok(skinClient.includes(role),role);
 for(const variable of[
  '--skin-gameplay-action-primary',
  '--skin-gameplay-action-secondary',
  '--skin-gameplay-bet-amount',
  '--skin-gameplay-bet-slider-track',
  '--skin-gameplay-chip-tray',
  '--skin-gameplay-community-cards',
  '--skin-gameplay-dealer-button',
  '--skin-gameplay-player-seat',
  '--skin-gameplay-pot-panel',
  '--skin-gameplay-turn-timer'
 ])assert.ok(css.includes(variable),variable);
 assert.match(surface,/data-pos=\{pos\[index\]\}/);
});
