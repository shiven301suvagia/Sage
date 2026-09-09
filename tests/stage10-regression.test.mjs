import test from 'node:test';
import assert from 'node:assert/strict';
import {CharacterRuntime} from '../app/core/runtime.mjs';
import {ProactiveEngine} from '../app/core/proactive.mjs';

const waitForPresentationToRestore=()=>new Promise(resolve=>setTimeout(resolve,300));

test('Stage 10 uses the real runtime graph for reminder emotion',async()=>{
  const states=[];
  const runtime=new CharacterRuntime('idle');
  const engine=new ProactiveEngine({
    experience:{proactiveEnabled:true},
    reminders:{snapshot:()=>[{id:'r1',text:'stretch',dueAt:new Date(5000).toISOString(),done:false}]},
    cooldown:0,contextCooldown:300000,presentationMs:250,runtime,
    onStateChange:state=>states.push(state),shouldPresent:()=>true,onSuggestion:async()=>{}
  });
  const result=await engine.tick(0);
  assert.equal(result?.kind,'reminder');
  assert.deepEqual(states[0],{state:'speaking',emotion:'helpful'});
  assert.equal(runtime.state,'speaking');
  await waitForPresentationToRestore();
  assert.equal(runtime.state,'idle');
});

test('Stage 10 can transition speaking to the focused working state',async()=>{
  const states=[];
  const runtime=new CharacterRuntime('speaking');
  const engine=new ProactiveEngine({
    experience:{proactiveEnabled:true},
    reminders:{snapshot:()=>[]},
    context:{snapshot:()=>({desktopContextEnabled:true,activeApp:{process:'Code.exe'}})},
    cooldown:300000,contextCooldown:0,presentationMs:250,runtime,
    onStateChange:state=>states.push(state),shouldPresent:()=>true,onSuggestion:async()=>{}
  });
  const result=await engine.tick(0);
  assert.equal(result?.kind,'context');
  assert.equal(runtime.state,'working');
  assert.deepEqual(states[0],{state:'working',emotion:'focused'});
  await waitForPresentationToRestore();
  assert.equal(runtime.state,'idle');
});

test('Stage 10 does not present an emotion the runtime cannot enter',async()=>{
  const runtime=new CharacterRuntime('dormant');
  let presented=false;
  const engine=new ProactiveEngine({
    experience:{proactiveEnabled:true},
    reminders:{snapshot:()=>[{id:'r1',text:'stretch',dueAt:new Date(5000).toISOString(),done:false}]},
    cooldown:0,contextCooldown:300000,presentationMs:250,runtime,
    onStateChange:()=>{},shouldPresent:()=>true,onSuggestion:async()=>{presented=true;}
  });
  const result=await engine.tick(0);
  assert.equal(result,null);
  assert.equal(presented,false);
  assert.equal(runtime.state,'dormant');
});
