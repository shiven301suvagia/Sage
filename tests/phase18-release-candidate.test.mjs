import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>fs.readFile(path.join(root,relative),'utf8');

test('Phase 18: release package has a single explicit desktop entry point',async()=>{const pkg=JSON.parse(await read('package.json'));assert.equal(pkg.main,'app/main.mjs');assert.equal(pkg.build?.appId,'com.shiven.sage');assert.equal(pkg.build?.productName,'SAGE');assert.deepEqual(pkg.build?.win?.target,[{target:'nsis',arch:['x64']}]);assert.match(pkg.scripts?.['dist:win']||'',/^electron-builder --win nsis --x64$/);});

test('Phase 18: packaged files are limited to runtime application content',async()=>{const pkg=JSON.parse(await read('package.json'));const files=pkg.build?.files||[];assert.ok(files.includes('app/**/*'));assert.ok(files.includes('package.json'));assert.ok(files.includes('!**/*.map'));assert.ok(!files.some(value=>/node_modules|tests|\.github|\.git|dist/.test(value)));});

test('Phase 18: Windows release workflow validates before publishing artifacts',async()=>{const workflow=await read('.github/workflows/release-windows.yml');assert.match(workflow,/npm ci --ignore-scripts/);assert.match(workflow,/npm run validate:package/);assert.match(workflow,/npm run check/);assert.match(workflow,/npm audit --omit=dev --audit-level=high/);assert.match(workflow,/npm run dist:win/);assert.match(workflow,/Expected exactly one Windows installer/);assert.match(workflow,/Get-FileHash -Algorithm SHA256/);assert.match(workflow,/if-no-files-found: error/);});

test('Phase 18: release build does not expose development-only lifecycle hooks',async()=>{const pkg=JSON.parse(await read('package.json'));assert.equal(pkg.private,true);assert.equal(pkg.scripts?.start,'electron .');assert.equal(pkg.scripts?.test,'node --test');assert.equal(pkg.engines?.node,'>=22');});
