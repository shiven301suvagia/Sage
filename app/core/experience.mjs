import fs from'node:fs/promises';import path from'node:path';

const SCHEMA_VERSION=1;
export class ExperienceStore{
 #file;#data={schemaVersion:SCHEMA_VERSION,installedAt:null,lastSeenAt:null,anniversaries:0,growthNotes:[],preferences:{proactive:false}};
 constructor(file){this.#file=file;}
 async load(){try{const parsed=JSON.parse(await fs.readFile(this.#file,'utf8'));if(parsed?.schemaVersion===SCHEMA_VERSION)this.#data={...this.#data,...parsed,preferences:{...this.#data.preferences,...parsed.preferences}};}catch(e){if(e?.code!=='ENOENT')throw e;}if(!this.#data.installedAt)this.#data.installedAt=new Date().toISOString();this.#data.lastSeenAt=new Date().toISOString();await this.#persist();return this.snapshot();}
 snapshot(){return structuredClone(this.#data);}
 get proactiveEnabled(){return Boolean(this.#data.preferences.proactive);}
 async setProactiveEnabled(value){this.#data.preferences.proactive=Boolean(value);await this.#persist();return this.proactiveEnabled;}
 async recordGrowth(note){const text=String(note??'').trim();if(!text)return false;this.#data.growthNotes.unshift({id:crypto.randomUUID(),text:text.slice(0,1000),createdAt:new Date().toISOString()});this.#data.growthNotes=this.#data.growthNotes.slice(0,100);await this.#persist();return true;}
 async celebrateAnniversary(now=new Date()){this.#data.anniversaries=anniversaryCount(new Date(this.#data.installedAt),now);await this.#persist();return this.snapshot();}
 async #persist(){await fs.mkdir(path.dirname(this.#file),{recursive:true});const tmp=`${this.#file}.tmp`;await fs.writeFile(tmp,JSON.stringify(this.#data,null,2),'utf8');await fs.rename(tmp,this.#file);}
}
function anniversaryCount(installed,now){let count=now.getFullYear()-installed.getFullYear();const before=now.getMonth()<installed.getMonth()||(now.getMonth()===installed.getMonth()&&now.getDate()<installed.getDate());if(before)count-=1;return Math.max(0,count);}
