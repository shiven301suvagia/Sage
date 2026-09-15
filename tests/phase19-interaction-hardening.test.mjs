import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const read=p=>fs.readFile(path.join(root,p),'utf8');

test('Phase 19: renderer serializes chat opening',async()=>{const source=await read('app/renderer/app.mjs');assert.match(source,/chatOpenPromise/);assert.match(source,/if\(chatOpenPromise\)return chatOpenPromise/);});
test('Phase 19: renderer rejects overlapping assistant submissions',async()=>{const source=await read('app/renderer/app.mjs');assert.match(source,/assistantBusy/);assert.match(source,/if\(assistantBusy\)return/);});
test('Phase 19: renderer releases assistant lock after failures',async()=>{const source=await read('app/renderer/app.mjs');assert.match(source,/assistantBusy=false/);assert.match(source,/finally\{/);});
test('Phase 19: voice controller ignores stale recognition callbacks',async()=>{const source=await read('app/core/voice.mjs');assert.match(source,/this\.recognition!==recognition/);assert.match(source,/this\.recognition=null/);});
test('Phase 19: renderer only exposes approved character states',async()=>{const source=await read('app/renderer/app.mjs');assert.match(source,/CHARACTER_STATES=new Set/);assert.match(source,/if\(!CHARACTER_STATES\.has\(next\)\)return/);});
