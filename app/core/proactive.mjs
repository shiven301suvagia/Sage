const DEFAULT_COOLDOWN=30*60*1000;
export class ProactiveEngine{
 constructor({experience,reminders,onSuggestion=()=>{},cooldown=DEFAULT_COOLDOWN}={}){this.experience=experience;this.reminders=reminders;this.onSuggestion=onSuggestion;this.cooldown=cooldown;this.lastSuggestionAt=0;this.timer=null;}
 start(interval=60000){this.stop();this.timer=setInterval(()=>this.tick(),interval);return this.tick();}
 stop(){if(this.timer)clearInterval(this.timer);this.timer=null;}
 async tick(now=Date.now()){if(!this.experience?.proactiveEnabled)return null;if(now-this.lastSuggestionAt<this.cooldown)return null;const pending=this.reminders?.snapshot?.().filter(x=>!x.done).sort((a,b)=>Date.parse(a.dueAt||'9999')-Date.parse(b.dueAt||'9999'))||[];const next=pending.find(x=>x.dueAt&&Date.parse(x.dueAt)>now);if(!next)return null;const until=Date.parse(next.dueAt)-now;if(until>15*60*1000||until<0)return null;this.lastSuggestionAt=now;const suggestion={kind:'reminder',text:`You have a reminder coming up: “${next.text}”.`,reminderId:next.id};await this.onSuggestion(suggestion);return suggestion;}
}
