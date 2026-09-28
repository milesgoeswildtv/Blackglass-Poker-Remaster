import test from'node:test';
import assert from'node:assert/strict';
import{readFileSync}from'node:fs';

const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const preview=readFileSync(new URL('../src/AfterdarkPreview.jsx',import.meta.url),'utf8');
const gameplay=readFileSync(new URL('../src/gameplay.css',import.meta.url),'utf8');

test('Afterdark preview routes before live runtime state',()=>{
 assert.match(app,/afterdarkPreview/);
 assert.match(app,/return <AfterdarkPreview\/>/);
 assert.match(main,/if\(afterdarkPreview\)\{render\(\);return\}/);
});

test('all editor surfaces have isolated preview renderers',()=>{
 for(const id of['home','table-invite','pregame','gameplay','mtt-lobby','mtt-break','result'])assert.ok(preview.includes(id),id);
 assert.match(preview,/afterdark:ready/);
 assert.match(preview,/afterdark:rects/);
 assert.match(preview,/afterdark:select/);
 assert.match(preview,/d\.surface&&d\.surface!==surface/);
});

test('production pre-game and gameplay are viewport locked while Home is not',()=>{
 assert.match(gameplay,/html:has\(\.pregameTablePage\)/);
 assert.match(gameplay,/body:has\(\.pregameTablePage\)/);
 assert.match(gameplay,/overflow:hidden!important/);
 assert.doesNotMatch(gameplay,/homeShell[^\n]*overflow:hidden!important/);
});
