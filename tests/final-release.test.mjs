import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CharacterRuntime} from '../app/core/runtime.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

const read=relative=>fs.readFile(path.join(root,relative),'utf8');

test('final release gate: package metadata and generated lockfile agree',async()=>{
  const pkg=JSON.parse(await read('package.json'));
  const lock=JSON.parse(await read('package-lock.json'));
  assert.equal(pkg.private,true);
  assert.equal(pkg.type,'module');
  assert.equal(pkg.main,'app/main.mjs');
  assert.equal(pkg.engines?.node,'>=22');
  assert.equal(lock.lockfileVersion,3);
  assert.equal(lock.packages?.['']?.devDependencies?.electron,pkg.devDependencies.electron);
  assert.equal(lock.packages?.['']?.devDependencies?.['electron-builder'],pkg.devDependencies['electron-builder']);
});

test('final release gate: renderer trust boundary is explicitly hardened',async()=>{
  const main=await read('app/main.mjs');
  assert.match(main,/contextIsolation:true/);
  assert.match(main,/nodeIntegration:false/);
  assert.match(main,/sandbox:true/);
  assert.match(main,/event\?\.sender===win\.webContents/);
  assert.match(main,/setWindowOpenHandler/);
  assert.match(main,/action:'deny'/);
  assert.match(main,/Only http and https URLs are allowed/);
});

test('final release gate: optional capabilities default to safe-off',async()=>{
  const experience=await read('app/core/experience.mjs');
  assert.match(experience,/networkAllowed:false/);
  assert.match(experience,/voiceInput:false/);
  assert.match(experience,/desktopContext:false/);
  assert.match(experience,/proactive:false/);
});

test('final release gate: character lifecycle survives a full interaction cycle',()=>{
  const runtime=new CharacterRuntime('dormant',{sleepAfterMs:10});
  const states=[];
  runtime.subscribe(change=>states.push(change.state));
  assert.equal(runtime.wake(),true);
  assert.equal(runtime.state,'awakening');
  assert.equal(runtime.transition('idle'),true);
  assert.equal(runtime.beginThinking(),true);
  assert.equal(runtime.beginSpeaking(),true);
  assert.equal(runtime.finish(),true);
  assert.equal(runtime.state,'idle');
  runtime.dispose();
  assert.deepEqual(states,['awakening','idle','thinking','speaking','idle']);
});
