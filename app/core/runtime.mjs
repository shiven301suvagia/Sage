export const SAGE_STATES=Object.freeze(['dormant','awakening','idle','thinking','speaking','working','sleeping','concerned','excited']);
const ALLOWED=new Map([
 ['dormant',new Set(['awakening'])],['awakening',new Set(['idle','sleeping'])],
 ['idle',new Set(['thinking','speaking','working','sleeping','dormant','excited','concerned'])],
 ['thinking',new Set(['speaking','idle','working','concerned','excited'])],
 ['speaking',new Set(['idle','working','sleeping','excited','concerned'])],
 ['working',new Set(['idle','thinking','speaking','concerned','excited'])],
 ['sleeping',new Set(['awakening','dormant','idle'])],['concerned',new Set(['idle','thinking','speaking'])],['excited',new Set(['idle','speaking','thinking'])]
]);
export class CharacterRuntime{#state;#listeners=new Set();constructor(initialState='idle'){if(!SAGE_STATES.includes(initialState))throw new Error(`Unknown state: ${initialState}`);this.#state=initialState;}get state(){return this.#state;}canTransition(next){return SAGE_STATES.includes(next)&&ALLOWED.get(this.#state)?.has(next)===true;}transition(next){if(next===this.#state)return false;if(!this.canTransition(next))return false;const previous=this.#state;this.#state=next;for(const listener of this.#listeners)listener({previous,state:next});return true;}subscribe(listener){this.#listeners.add(listener);return()=>this.#listeners.delete(listener);}}
