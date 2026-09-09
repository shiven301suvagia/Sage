import test from 'node:test';
import assert from 'node:assert/strict';
import {ProactiveEngine} from '../app/core/proactive.mjs';

test('proactive reminder presents a speaking emotion',async()=>{
  const states=[];
  const runtime={state:'idle',canTransition:next=>next==='speaking'||next==='idle',transition(next){this.state=next;return true;}};
  const engine=new ProactiveEngine({
    experience:{proactiveEnabled:true},
    reminders:{snapshot:()=>[{id:'r1',text:'stretch',dueAt:new Date(5000).toISOString(),done:false}]},
    cooldown:0,contextCooldown:300000,presentationMs:0,
    runtime,onStateChange:s=>states.push(s),
    shouldPresent:()=>true,onSuggestion:async()=>{}
  });
  const result=await engine.tick(0);
  assert.equal(result.kind,'reminder');
  assert.deepEqual(states[0],{state:'speaking',emotion:'helpful'});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(runtime.state,'idle');
});

test('proactive context emotion follows the runtime transition graph',async()=>{
  const states=[];
  const runtime={state:'speaking',canTransition:next=>next==='idle'||next==='working',transition(next){this.state=next;return true;}};
  const engine=new ProactiveEngine({
    experience:{proactiveEnabled:true},
    reminders:{snapshot:()=>[]},
    context:{snapshot:()=>({desktopContextEnabled:true,activeApp:{process:'Code.exe'}})},
    cooldown:300000,contextCooldown:0,presentationMs:0,
    runtime,onStateChange:s=>states.push(s),
    shouldPresent:()=>true,onSuggestion:async()=>{}
  });
  const result=await engine.tick(0);
  assert.equal(result.kind,'context');
  assert.equal(runtime.state,'working');
  assert.deepEqual(states[0],{state:'working',emotion:'focused'});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(runtime.state,'idle');
});
