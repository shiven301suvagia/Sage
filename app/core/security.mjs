import{randomUUID}from'node:crypto';
export class ConfirmationVault{
 constructor({ttlMs=120000,maxPending=32,clock=()=>Date.now(),idFactory=()=>randomUUID()}={}){this.ttlMs=Math.max(1000,Number(ttlMs)||120000);this.maxPending=Math.max(1,Math.floor(Number(maxPending)||32));this.clock=clock;this.idFactory=idFactory;this.items=new Map();}
 issue(action){this.#prune();while(this.items.size>=this.maxPending)this.items.delete(this.items.keys().next().value);const token=String(this.idFactory());this.items.set(token,{action,expiresAt:this.clock()+this.ttlMs});return token;}
 consume(token){this.#prune();const key=String(token);const item=this.items.get(key);this.items.delete(key);if(!item)throw Object.assign(new Error('That permission request has expired. Please ask me again.'),{code:'CONFIRMATION_EXPIRED'});return item.action;}
 clear(){this.items.clear();}
 get size(){this.#prune();return this.items.size;}
 #prune(){const now=this.clock();for(const[token,item]of this.items)if(item.expiresAt<now)this.items.delete(token);}
}
export class RecoveryBudget{
 constructor({maxAttempts=3,windowMs=30000,clock=()=>Date.now()}={}){this.maxAttempts=Math.max(1,Math.floor(Number(maxAttempts)||3));this.windowMs=Math.max(1000,Number(windowMs)||30000);this.clock=clock;this.attempts=[];}
 take(){const now=this.clock();this.attempts=this.attempts.filter(time=>time>now-this.windowMs);if(this.attempts.length>=this.maxAttempts)return false;this.attempts.push(now);return true;}
 reset(){this.attempts=[];}
}
