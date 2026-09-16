import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const read=p=>fs.readFile(path.join(root,p),'utf8');

test('Phase 19: pet interaction surface owns pointer input',async()=>{const source=await read('app/renderer/app.mjs');assert.match(source,/pet\.addEventListener\('pointerdown'/);assert.match(source,/pet\.addEventListener\('pointermove'/);assert.match(source,/pet\.addEventListener\('pointerup'/);});
test('Phase 19: stale voice recognition callbacks remain blocked',async()=>{const source=await read('app/core/voice.mjs');assert.match(source,/this\.recognition!==recognition/);assert.match(source,/this\.recognition=null/);});
test('Phase 19: renderer keeps a controlled character-state map',async()=>{const source=await read('app/renderer/app.mjs');assert.match(source,/const labels=\{/);assert.match(source,/window\.sage\.character\.onStateChange/);});
test('Phase 19: native image dragging is disabled',async()=>{const html=await read('app/renderer/index.html');const source=await read('app/renderer/app.mjs');assert.match(html,/draggable="false"/);assert.match(source,/dragstart/);});
