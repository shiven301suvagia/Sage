const DEFAULT_IDLE_AFTER_MS=20*60*1000;
const DEFAULT_FOCUS_COOLDOWN=10*60*1000;

export const COMPANION_MODES=Object.freeze(['available','focused','quiet','sleeping']);

export class CompanionPresence{
  constructor({clock=()=>Date.now(),idleAfterMs=DEFAULT_IDLE_AFTER_MS,focusCooldown=DEFAULT_FOCUS_COOLDOWN}={}){
    this.clock=clock;this.idleAfterMs=idleAfterMs;this.focusCooldown=focusCooldown;
    this.lastInteractionAt=0;this.lastContextKey=null;this.lastContextAt=0;this.mode='available';
  }
  observeInteraction(now=this.clock()){
    this.lastInteractionAt=now;this.mode='available';return this.snapshot(now);
  }
  observeContext(processName,now=this.clock()){
    const process=String(processName??'').trim().slice(0,120);
    if(!process)return this.snapshot(now);
    const key=process.toLowerCase();
    if(key!==this.lastContextKey){this.lastContextKey=key;this.lastContextAt=now;this.mode='focused';}
    return this.snapshot(now);
  }
  setQuiet(quiet=true){this.mode=quiet?'quiet':'available';return this.mode;}
  tick(now=this.clock()){
    if(this.mode==='quiet'||this.mode==='sleeping')return this.snapshot(now);
    if(this.lastInteractionAt&&now-this.lastInteractionAt>=this.idleAfterMs){this.mode='sleeping';return this.snapshot(now);}
    if(this.mode==='focused'&&this.lastContextAt&&now-this.lastContextAt>=this.focusCooldown)this.mode='available';
    return this.snapshot(now);
  }
  canInterrupt(now=this.clock()){
    if(this.mode==='quiet'||this.mode==='sleeping')return false;
    return !this.lastContextAt||now-this.lastContextAt>=this.focusCooldown;
  }
  snapshot(now=this.clock()){
    return Object.freeze({mode:this.mode,lastInteractionAt:this.lastInteractionAt,lastContextAt:this.lastContextAt,contextKey:this.lastContextKey,idleForMs:this.lastInteractionAt?Math.max(0,now-this.lastInteractionAt):0});
  }
}
