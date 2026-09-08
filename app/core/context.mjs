const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export class DesktopContext{
 constructor({clock=()=>new Date(),memory=null,reminders=null,experience=null,policy=null}={}){this.clock=clock;this.memory=memory;this.reminders=reminders;this.experience=experience;this.policy=policy;this.startedAt=this.clock();this.lastInteractionAt=null;this.interactions=0;}
 markInteraction(){this.lastInteractionAt=this.clock();this.interactions+=1;}
 snapshot(){const now=this.clock();const memories=this.memory?.snapshot?.()||[];const reminderItems=this.reminders?.snapshot?.()||[];const pendingReminders=reminderItems.filter(item=>item?.dueAt&&new Date(item.dueAt).getTime()>now.getTime()).length;return Object.freeze({onlineAllowed:Boolean(this.policy?.networkAllowed),proactiveEnabled:Boolean(this.experience?.proactiveEnabled),voiceEnabled:Boolean(this.experience?.voiceInputEnabled),memoryCount:memories.length,reminderCount:reminderItems.length,pendingReminders,interactionCount:this.interactions,lastInteractionAt:this.lastInteractionAt?.toISOString()||null,sessionAgeMs:clamp(now.getTime()-this.startedAt.getTime(),0,Number.MAX_SAFE_INTEGER)});}
}
