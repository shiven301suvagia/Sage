const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export class ContextFusion{
  constructor({context=null,presence=null,clock=()=>Date.now()}={}){this.context=context;this.presence=presence;this.clock=clock;}
  snapshot(now=this.clock()){
    const context=this.context?.snapshot?.()||{};const presence=this.presence?.tick?.(now)||this.presence?.snapshot?.(now)||{mode:'available',idleForMs:0};
    const app=context.activeApp||{process:null,title:null,source:'unavailable'};
    const pending=Number(context.pendingReminders||0);const interactions=Number(context.interactionCount||0);const sessionAgeMs=Number(context.sessionAgeMs||0);
    const focus=presence.mode==='focused';const resting=presence.mode==='sleeping'||presence.mode==='quiet';
    const engagement=clamp((interactions*12)+(sessionAgeMs>30*60*1000?10:0)+(focus?15:0),0,100);
    const urgency=clamp(pending*25,0,100);
    const attention=resting?'protected':focus?'focused':urgency>=50?'alert':'available';
    return Object.freeze({attention,engagement,urgency,presenceMode:presence.mode,desktopContextEnabled:Boolean(context.desktopContextEnabled),activeApp:{process:app.process||null,title:app.title||null,source:app.source||'unavailable'},pendingReminders:pending,interactionCount:interactions,sessionAgeMs,onlineAllowed:Boolean(context.onlineAllowed),proactiveEnabled:Boolean(context.proactiveEnabled)});
  }
}
