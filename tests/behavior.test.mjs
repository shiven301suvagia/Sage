import test from 'node:test';
import assert from 'node:assert/strict';
import {CompanionBehavior} from '../app/core/behavior.mjs';
import {ContextFusion} from '../app/core/context-fusion.mjs';

test('behavior protects sleeping and quiet presence',()=>{
  const behavior=new CompanionBehavior({clock:()=>1000});
  assert.equal(behavior.decide({presenceMode:'sleeping'}).action,'silent');
  assert.equal(behavior.decide({presenceMode:'quiet'}).action,'silent');
});

test('behavior prioritizes urgent reminders',()=>{
  const behavior=new CompanionBehavior({clock:()=>1000});
  assert.equal(behavior.decide({presenceMode:'available',attention:'alert',urgency:50,pendingReminders:2}).action,'remind');
});

test('behavior stays silent during focus',()=>{
  const behavior=new CompanionBehavior({clock:()=>1000});
  assert.equal(behavior.decide({presenceMode:'focused',attention:'focused',urgency:0,pendingReminders:0}).action,'silent');
});

test('context fusion combines presence and desktop context',()=>{
  const fusion=new ContextFusion({
    clock:()=>10000,
    presence:{tick:()=>({mode:'focused',idleForMs:100})},
    context:{snapshot:()=>({interactionCount:5,sessionAgeMs:3600000,pendingReminders:2,desktopContextEnabled:true,onlineAllowed:false,proactiveEnabled:true,activeApp:{process:'Code.exe',title:'SAGE',source:'local'}})}
  });
  const result=fusion.snapshot();
  assert.equal(result.presenceMode,'focused');
  assert.equal(result.attention,'focused');
  assert.equal(result.pendingReminders,2);
  assert.equal(result.activeApp.process,'Code.exe');
});
