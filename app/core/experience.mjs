import fs from'node:fs/promises';import path from'node:path';import{randomUUID}from'node:crypto';

const SCHEMA_VERSION=2;
export class ExperienceStore{
 #file;#data={schemaVersion:SCHEMA_VERSION,installedAt:null,lastSeenAt:null,experienceYears:0,lastBirthdayYear:null,growthNotes:[],preferences:{proactive:false}};
 constructor(file){this.#file=file;}
 async load(now=new Date()){try{const parsed=JSON.parse(await fs.readFile(this.#file,'utf8'));if(parsed?.schemaVersion===1){this.#data={...this.#data,installedAt:parsed.installedAt,lastSeenAt:parsed.lastSeenAt,growthNotes:parsed.growthNotes||[],preferences:{...this.#data.preferences,...parsed.preferences}};}else if(parsed?.schemaVersion===SCHEMA_VERSION){this.#data={...this.#data,...parsed,preferences:{...this.#data.preferences,...parsed.preferences}};}}catch(e){if(e?.code!=='ENOENT')throw e;}if(!this.#data.installedAt)this.#data.installedAt=now.toISOString();this.#data.lastSeenAt=now.toISOString();await this.celebrateBirthday(now);return this.snapshot();}
 snapshot(){return structuredClone(this.#data);}
 get proactiveEnabled(){return Boolean(this.#data.preferences.proactive);}
 async setProactiveEnabled(value){this.#data.preferences.proactive=Boolean(value);await this.#persist();return this.proactiveEnabled;}
 async recordGrowth(note){const text=String(note??'').trim();if(!text)return false;this.#data.growthNotes.unshift({id:randomUUID(),text:text.slice(0,1000),createdAt:new Date().toISOString()});this.#data.growthNotes=this.#data.growthNotes.slice(0,100);await this.#persist();return true;}
 async celebrateBirthday(now=new Date()){if(now.getMonth()===9&&now.getDate()>=12&&this.#data.lastBirthdayYear!==now.getFullYear()){this.#data.experienceYears+=1;this.#data.lastBirthdayYear=now.getFullYear();this.#data.growthNotes.unshift({id:randomUUID(),text:`Birthday growth marker — year ${this.#data.experienceYears}.`,createdAt:now.toISOString()});this.#data.growthNotes=this.#data.growthNotes.slice(0,100);}await this.#persist();return this.snapshot();}
 async #persist(){await fs.mkdir(path.dirname(this.#file),{recursive:true});const tmp=`${this.#file}.tmp`;await fs.writeFile(tmp,JSON.stringify(this.#data,null,2),'utf8');await fs.rename(tmp,this.#file);}
}
