import test from 'node:test';
import assert from 'node:assert/strict';
import { VoiceController } from '../app/core/voice.mjs';

class FakeRecognition{
 static instances=[];
 constructor(){this.started=false;this.stopped=false;FakeRecognition.instances.push(this);}
 start(){this.started=true;queueMicrotask(()=>this.onstart?.());}
 stop(){this.stopped=true;queueMicrotask(()=>this.onend?.());}
}

test('voice controller rejects unsupported input',()=>{
 const voice=new VoiceController();
 assert.equal(voice.supported(),false);
 assert.throws(()=>voice.start(),error=>error.code==='VOICE_UNAVAILABLE');
});

test('voice controller forwards final transcripts',async()=>{
 const voice=new VoiceController({SpeechRecognitionImpl:FakeRecognition});
 let result=null;
 voice.on('result',data=>{result=data;});
 voice.start();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(voice.active,true);
 FakeRecognition.instances.at(-1).onresult?.({resultIndex:0,results:[{0:{transcript:'hello Sage'},isFinal:true}]});
 assert.equal(result.text,'hello Sage');
 assert.equal(result.final,true);
 voice.stop();
});

test('voice controller maps dashed recognition error codes',()=>{
 const voice=new VoiceController({SpeechRecognitionImpl:FakeRecognition});
 let error=null;
 voice.on('error',data=>{error=data;});
 voice.start();
 FakeRecognition.instances.at(-1).onerror?.({error:'not-allowed'});
 assert.equal(error.message,'Microphone permission was denied.');
});

test('voice controller can stop and restart cleanly across supported desktop implementations',async()=>{
 const voice=new VoiceController({SpeechRecognitionImpl:FakeRecognition});
 const events=[];
 voice.on('start',()=>events.push('start'));
 voice.on('end',()=>events.push('end'));
 assert.equal(voice.start(),true);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(voice.active,true);
 const first=FakeRecognition.instances.at(-1);
 assert.equal(voice.stop(),true);
 assert.equal(voice.active,false);
 assert.equal(first.stopped,true);
 assert.deepEqual(events,['start','end']);
 assert.equal(voice.start(),true);
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(voice.active,true);
 assert.notEqual(FakeRecognition.instances.at(-1),first);
 assert.deepEqual(events,['start','end','start']);
 voice.stop();
});
