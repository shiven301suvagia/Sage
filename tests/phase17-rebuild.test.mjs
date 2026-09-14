import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs/promises';
import path from'node:path';
import{fileURLToPath}from'node:url';
import{CharacterRuntime}from'../app/core/runtime.mjs';
import{VoiceController}from'../app/core/voice.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>fs.readFile(path.join(root,relative),'utf8');

class FakeRecognition{
 static instances=[];
 constructor(){this.started=false;this.stopped=false;FakeRecognition.instances.push(this);}
 start(){this.started=true;queueMicrotask(()=>this.onstart?.());}
 stop(){this.stopped=true;queueMicrotask(()=>this.onend?.());}
}

test('Phase 17 rebuild: runtime is OS neutral and uses injectable timing',async()=>{
 const source=await read('app/core/runtime.mjs');
 assert.doesNotMatch(source,/process\.platform|win32|darwin|linux/);
 let timer=null;let cleared=null;
 const runtime=new CharacterRuntime('idle',{sleepAfterMs:100,clock:(fn,ms)=>{timer={fn,ms};return timer;},clearClock:value=>{cleared=value;}});
 assert.equal(runtime.scheduleSleep(),true);
 assert.equal(runtime.wake(),true);
 assert.equal(runtime.state,'idle');
 assert.equal(cleared,timer);
 timer.fn();
 assert.equal(runtime.state,'idle');
 runtime.dispose();
});

test('Phase 17 rebuild: complete character lifecycle is deterministic',()=>{
 const runtime=new CharacterRuntime('dormant',{sleepAfterMs:100});
 assert.equal(runtime.wake(),true);
 assert.equal(runtime.state,'awakening');
 assert.equal(runtime.transition('idle'),true);
 assert.equal(runtime.beginThinking(),true);
 assert.equal(runtime.beginSpeaking(),true);
 assert.equal(runtime.finish(),true);
 assert.equal(runtime.state,'idle');
 runtime.dispose();
});

test('Phase 17 rebuild: voice stop cannot be followed by stale recognition events',async()=>{
 const voice=new VoiceController({SpeechRecognitionImpl:FakeRecognition});
 const events=[];
 voice.on('start',()=>events.push('start'));
 voice.on('end',()=>events.push('end'));
 assert.equal(voice.start(),true);
 await new Promise(resolve=>setImmediate(resolve));
 const first=FakeRecognition.instances.at(-1);
 assert.equal(voice.stop(),true);
 assert.equal(first.stopped,true);
 assert.deepEqual(events,['start','end']);
 first.onstart?.();
 first.onend?.();
 assert.deepEqual(events,['start','end']);
 assert.equal(voice.start(),true);
 await new Promise(resolve=>setImmediate(resolve));
 assert.notEqual(FakeRecognition.instances.at(-1),first);
 assert.equal(voice.active,true);
 voice.stop();
});

test('Phase 17 rebuild: renderer security boundary remains explicit',async()=>{
 const main=await read('app/main.mjs');
 assert.match(main,/contextIsolation:true/);
 assert.match(main,/nodeIntegration:false/);
 assert.match(main,/sandbox:true/);
 assert.match(main,/event\?\.sender===win\.webContents/);
 assert.match(main,/setWindowOpenHandler/);
 assert.match(main,/action:'deny'/);
 assert.match(main,/Only http and https URLs are allowed/);
});

test('Phase 17 rebuild: Windows packaging is isolated from the core runtime',async()=>{
 const pkg=JSON.parse(await read('package.json'));
 const runtime=await read('app/core/runtime.mjs');
 assert.equal(pkg.build?.win?.target?.[0]?.target,'nsis');
 assert.match(pkg.scripts?.['dist:win']||'',/electron-builder --win nsis --x64/);
 assert.doesNotMatch(runtime,/electron|process\.platform|win32|darwin|linux/);
});
