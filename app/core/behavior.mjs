const DEFAULT_COOLDOWN=5*60*1000;

export const BEHAVIOR_ACTIONS=Object.freeze(['silent','acknowledge','remind','encourage','concern']);
export const EMOTIONS=Object.freeze(['neutral','focused','helpful','encouraged','concerned','excited']);

export class CompanionBehavior{
  constructor({clock=()=>Date.now(),cooldown=DEFAULT_COOLDOWN}={}){this.clock=clock;this.cooldown=cooldown;this.lastActionAt=null;}
  decide(context,now=this.clock()){
    const c=context||{};
    if(['sleeping','quiet'].includes(c.presenceMode)||c.attention==='protected')return this.#result('silent','protected','neutral');
    if(c.urgency>=50&&c.pendingReminders>0)return this.#result('remind','upcoming-reminder','helpful');
    if(c.attention==='focused')return this.#result('silent','focus','focused');
    if(this.lastActionAt!==null&&now-this.lastActionAt<this.cooldown)return this.#result('silent','cooldown','neutral');
    if(c.engagement>=70)return this.#result('encourage','sustained-session','encouraged');
    if(c.urgency>0)return this.#result('remind','pending-reminder','helpful');
    return this.#result('acknowledge','available','neutral');
  }
  commit(action,now=this.clock()){if(BEHAVIOR_ACTIONS.includes(action)&&action!=='silent')this.lastActionAt=now;return this.lastActionAt;}
  #result(action,reason,emotion){return Object.freeze({action,reason,emotion});}
}
