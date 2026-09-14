import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const read=relative=>fs.readFile(path.join(root,relative),'utf8');

test('Phase 17: core runtime does not hard-code an operating system',async()=>{const source=await read('app/core/runtime.mjs');assert.doesNotMatch(source,/process\.platform|win32|darwin|linux/);});

test('Phase 17: release packaging keeps Windows targeting isolated from core code',async()=>{const pkg=JSON.parse(await read('package.json'));const main=await read('app/main.mjs');assert.equal(pkg.build?.win?.target?.[0]?.target,'nsis');assert.match(main,/process\.platform/);assert.doesNotMatch(main,/win32.*&&|darwin.*&&|linux.*&&/);});

test('Phase 17: renderer trust boundary remains platform-neutral',async()=>{const main=await read('app/main.mjs');assert.match(main,/contextIsolation:true/);assert.match(main,/nodeIntegration:false/);assert.match(main,/sandbox:true/);assert.match(main,/event\?\.sender===win\.webContents/);});
