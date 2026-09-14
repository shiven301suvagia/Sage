export const SAGE_STATES=Object.freeze(['dormant','awakening','idle','thinking','speaking','working','sleeping','concerned','excited']);
const ALLOWED=new Map([
 ['dormant',new Set(['awakening'])],['awakening',new Set(['idle','sleeping'])],
 ['idle',new Set(['thinking','speaking','working','sleeping','dormant','excited','concerned'])],
 ['thinking',new Set(['speaking','idle','working','concerned','excited'])],
 ['speaking',new Set(['idle','working','sleeping','excited','concerned'])],
 ['working',new Set(['idle','thinking','speaking','concerned','excited'])],
 ['sleeping',new Set(['awakening','dormant','idle'])],['concerned',new Set(['idle','thinking','speaking'])],['excited',new Set(['idle','speaking','thinking'])]
]);
export class CharacterRuntime{
 #state;#listeners=new Set();#sleepTimer=null;#clock;#clearClock;
 constructor(initialState='dormant',{sleepAfterMs=60000,clock=setTimeout,clearClock=clearTimeout}={}){if(!SAGE_STATES.includes(initialState))throw new Error(`Unknown state: ${initialState}`);this.#state=initialState;this.sleepAfterMs=Math.max(0,Number(sleepAfterMs)||0);this.#clock=clock;this.#clearClock=clearClock;}
 get state(){return this.#state;}
 canTransition(next){return SAGE_STATES.includes(next)&&ALLOWED.get(this.#state)?.has(next)===true;}
 transition(next){if(next===this.#state)return false;if(!this.canTransition(next))return false;const previous=this.#state;this.#state=next;for(const listener of this.#listeners)listener({previous,state:next});return true;}
 subscribe(listener){this.#listeners.add(listener);return()=>this.#listeners.delete(listener);}
 wake(){this.cancelSleep();if(this.#state==='dormant'||this.#state==='sleeping')return this.transition('awakening');return this.#state!=='dormant';}
 beginThinking(){this.cancelSleep();return this.#state==='idle'&&this.transition('thinking');}
 beginSpeaking(){this.cancelSleep();return (this.#state==='thinking'||this.#state==='working'||this.#state==='idle')&&this.transition('speaking');}
 beginWorking(){this.cancelSleep();return this.#state==='idle'&&this.transition('working');}
 finish(){if(!['thinking','speaking','working','concerned','excited'].includes(this.#state))return false;const changed=this.transition('idle');if(changed)this.scheduleSleep();return changed;}
 fail(){return ['thinking','working'].includes(this.#state)&&this.transition('concerned');}
 scheduleSleep(){this.cancelSleep();if(!this.sleepAfterMs||this.#state!=='idle')return false;this.#sleepTimer=this.#clock(()=>{this.#sleepTimer=null;if(this.#state==='idle')this.transition('sleeping');},this.sleepAfterMs);return true;}
 cancelSleep(){if(this.#sleepTimer!==null){this.#clearClock(this.#sleepTimer);this.#sleepTimer=null;}}
 dispose(){this.cancelSleep();this.#listeners.clear();}
}
