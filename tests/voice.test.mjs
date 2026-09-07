import test from 'node:test';
import assert from 'node:assert/strict';
import { VoiceController } from '../app/core/voice.mjs';

class FakeRecognition{
 static instance;
 constructor(){FakeRecognition.instance=this;this.started=false;this.stopped=false;}
 start(){this.started=true;queueMicrotask(()=>this.onstart?.());}
 stop(){this.stopped=true;queueMicrotask(()=>this.onend?.());}
 emitResult(text,isFinal=true){this.onresult?.({resultIndex:0,results:[[{transcript:text}],Object.assign([], {isFinal})]});}
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
 FakeRecognition.instance.onresult?.({resultIndex:0,results:[{0:{transcript:'hello Sage'},isFinal:true}]});
 assert.equal(result.text,'hello Sage');
 assert.equal(result.final,true);
 voice.stop();
});
