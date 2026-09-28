import test from'node:test';
import assert from'node:assert/strict';
import{readFileSync}from'node:fs';

const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('Afterdark is the only visual editor implementation',()=>{
 assert.match(main,/AfterdarkPokerLab/);
 assert.doesNotMatch(main,/import PuckDesignLab/);
 assert.match(main,/design-lab\\\/puck/);
 assert.match(main,/location\.hash='#\/design-lab\/afterdark'/);
 assert.equal(pkg.dependencies?.['@puckeditor/core'],undefined);
});
