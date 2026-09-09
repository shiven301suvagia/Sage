import{CompanionPresence}from'./companion.mjs';
const DEFAULT_COOLDOWN=30*60*1000;
const CONTEXT_COOLDOWN=5*60*1000;
const APP_HINTS=[{match:/code|studio|cursor|devenv|idea|pycharm|webstorm|notepad\+\+|terminal|powershell|cmd/i,text:'Looks like you’re in a coding flow. Want me to stay quiet and focused unless you need me?'},{match:/chrome|msedge|firefox|brave|opera/i,text:'You’re browsing right now. If you’re researching something, I can help keep the thread organized.'},{match:/teams|zoom|webex|meet/i,text:'Looks like you’re in a meeting. I’ll keep interruptions to a minimum.'}];
export class ProactiveEngine{
 constructor({experience,reminders,context=null,onSuggestion=()=>{},cooldown=DEFAULT_COOLDOWN,contextCooldown=CONTEXT_COOLDOWN,presence=null,runtime=null,onStateChange=()=>{}}={}){this.experience=experience;this.reminders=reminders;this.context=context;this.onSuggestion=onSuggestion;this.cooldown=cooldown;this.contextCooldown=contextCooldown;this.lastSuggestionAt=0;this.lastContextSuggestionAt=0;this.lastContextKey=null;this.timer=null;this.runtime=runtime;this.onStateChange=onStateChange;this.presence=presence||new CompanionPresence({focusCooldown:contextCooldown});}
 start(interval=60000){this.stop();this.timer=setInterval(()=>this.tick(),interval);return this.tick();}
 stop(){if(this.timer)clearInterval(this.timer);this.timer=null;}
 observeInteraction(now=Date.now()){return this.presence.observeInteraction(now);}
 #emotionState(emotion){return emotion==='encouraged'?'excited':emotion==='concerned'?'concerned':emotion==='helpful'?'speaking':emotion==='focused'?'working':'idle';}
 #applyEmotion(emotion){const state=this.#emotionState(emotion);if(this.runtime?.state!==state)this.runtime?.transition(state);this.onStateChange({state,emotion});}
 #restore(){if(this.runtime?.state&&this.runtime.state!=='idle'&&this.runtime.canTransition?.('idle'))this.runtime.transition('idle');this.onStateChange({state:'idle',emotion:'neutral'});}
 async tick(now=Date.now()){
  if(!this.experience?.proactiveEnabled)return null;
  const presence=this.presence.tick(now);
  if(presence.mode==='sleeping'||presence.mode==='quiet')return null;
  const pending=this.reminders?.snapshot?.().filter(x=>!x.done).sort((a,b)=>Date.parse(a.dueAt||'9999')-Date.parse(b.dueAt||'9999'))||[];
  const next=pending.find(x=>x.dueAt&&Date.parse(x.dueAt)>now);
  if(now-this.lastSuggestionAt>=this.cooldown&&next){const until=Date.parse(next.dueAt)-now;if(until<=15*60*1000&&until>=0){this.lastSuggestionAt=now;const suggestion={kind:'reminder',text:`You have a reminder coming up: “${next.text}”.`,reminderId:next.id};await this.onSuggestion(suggestion);return suggestion;}}
  if(now-this.lastContextSuggestionAt<this.contextCooldown)return null;
  const snapshot=this.context?.snapshot?.();if(!snapshot?.desktopContextEnabled)return null;
  const app=snapshot.activeApp;if(!app?.process)return null;
  const hint=APP_HINTS.find(x=>x.match.test(app.process));if(!hint)return null;
  const key=`${app.process}:${hint.text}`;if(key===this.lastContextKey)return null;
  if(!this.presence.canInterrupt(now))return null;
  this.presence.observeContext(app.process,now);this.lastContextKey=key;this.lastContextSuggestionAt=now;
  const suggestion={kind:'context',text:hint.text,process:app.process};await this.onSuggestion(suggestion);return suggestion;
 }
}
