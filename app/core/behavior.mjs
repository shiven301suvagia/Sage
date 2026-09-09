const DEFAULT_COOLDOWN=5*60*1000;

export const BEHAVIOR_ACTIONS=Object.freeze(['silent','acknowledge','remind','encourage','concern']);

export class CompanionBehavior{
  constructor({clock=()=>Date.now(),cooldown=DEFAULT_COOLDOWN}={}){this.clock=clock;this.cooldown=cooldown;this.lastActionAt=0;}
  decide(context,now=this.clock()){
    const c=context||{};
    if(['sleeping','quiet'].includes(c.presenceMode)||c.attention==='protected')return this.#result('silent','protected');
    if(c.urgency>=50&&c.pendingReminders>0)return this.#result('remind','upcoming-reminder');
    if(c.attention==='focused')return this.#result('silent','focus');
    if(now-this.lastActionAt<this.cooldown)return this.#result('silent','cooldown');
    if(c.engagement>=70)return this.#result('encourage','sustained-session');
    if(c.urgency>0)return this.#result('remind','pending-reminder');
    return this.#result('acknowledge','available');
  }
  commit(action,now=this.clock()){if(BEHAVIOR_ACTIONS.includes(action)&&action!=='silent')this.lastActionAt=now;return this.lastActionAt;}
  #result(action,reason){return Object.freeze({action,reason});}
}
