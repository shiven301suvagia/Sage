import fs from'node:fs/promises';import path from'node:path';
const SCHEMA_VERSION=1;const MAX_TURNS=32;const MAX_TEXT=4000;
export class ConversationStore{
 #file;#turns=[];
 constructor(file,{maxTurns=MAX_TURNS}={}){this.#file=file;this.maxTurns=Math.max(2,Math.min(MAX_TURNS,Math.floor(Number(maxTurns)||MAX_TURNS)));}
 async load(){try{const parsed=JSON.parse(await fs.readFile(this.#file,'utf8'));if(parsed?.schemaVersion===SCHEMA_VERSION&&Array.isArray(parsed.turns))this.#turns=parsed.turns.filter(isTurn).slice(-this.maxTurns).map(normalizeTurn);else await this.#recover('schema');}catch(e){if(e?.code!=='ENOENT')await this.#recover('parse');}return this.snapshot();}
 snapshot(){return structuredClone(this.#turns);}
 async append(user,assistant){const u=String(user??'').trim().slice(0,MAX_TEXT);const a=String(assistant??'').trim().slice(0,MAX_TEXT);if(!u||!a)return false;this.#turns.push({user:u,assistant:a,createdAt:new Date().toISOString()});this.#turns=this.#turns.slice(-this.maxTurns);await this.#persist();return true;}
 async clear(){this.#turns=[];await this.#persist();return true;}
 async #persist(){await fs.mkdir(path.dirname(this.#file),{recursive:true});const tmp=`${this.#file}.tmp`;await fs.writeFile(tmp,JSON.stringify({schemaVersion:SCHEMA_VERSION,turns:this.#turns},null,2),'utf8');await fs.rename(tmp,this.#file);}
 async #recover(reason){const stamp=new Date().toISOString().replace(/[:.]/g,'-');try{await fs.rename(this.#file,`${this.#file}.corrupt-${reason}-${stamp}`);}catch(e){if(e?.code!=='ENOENT')throw e;}this.#turns=[];await this.#persist();}
}
function isTurn(v){return Boolean(v&&typeof v==='object'&&typeof v.user==='string'&&typeof v.assistant==='string');}
function normalizeTurn(v){return{user:String(v.user).slice(0,MAX_TEXT),assistant:String(v.assistant).slice(0,MAX_TEXT),createdAt:String(v.createdAt||new Date().toISOString())};}
