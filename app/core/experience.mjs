import fs from'node:fs/promises';import path from'node:path';import{randomUUID}from'node:crypto';import{EXPERIENCE_SCHEMA_VERSION,normalizeExperience}from'./experience-migration.mjs';
const DEFAULT_PREFERENCES={proactive:false,networkAllowed:false,voiceInput:false,desktopContext:false};
export class ExperienceStore{
 #file;#data=normalizeExperience({schemaVersion:EXPERIENCE_SCHEMA_VERSION,preferences:DEFAULT_PREFERENCES});
 constructor(file){this.#file=file;}
 async load(now=new Date()){
  try{const parsed=JSON.parse(await fs.readFile(this.#file,'utf8'));if(!Number.isInteger(parsed?.schemaVersion)||parsed.schemaVersion<1||parsed.schemaVersion>EXPERIENCE_SCHEMA_VERSION)throw Object.assign(new Error('Unsupported experience schema.'),{code:'EXPERIENCE_SCHEMA'});this.#data=normalizeExperience(parsed,now);}catch(e){if(e?.code==='ENOENT'){}else{await this.#quarantine(e?.code==='EXPERIENCE_SCHEMA'?'schema':'parse');}}
  if(!this.#data.installedAt)this.#data.installedAt=now.toISOString();this.#data.lastSeenAt=now.toISOString();await this.celebrateBirthday(now);return this.snapshot();
 }
 snapshot(){return structuredClone(this.#data);}
 get proactiveEnabled(){return this.#data.preferences.proactive;}get networkAllowed(){return this.#data.preferences.networkAllowed;}get voiceInputEnabled(){return this.#data.preferences.voiceInput;}get desktopContextEnabled(){return this.#data.preferences.desktopContext;}
 async setProactiveEnabled(v){this.#data.preferences.proactive=Boolean(v);await this.#persist();return this.proactiveEnabled;}async setNetworkAllowed(v){this.#data.preferences.networkAllowed=Boolean(v);await this.#persist();return this.networkAllowed;}async setVoiceInputEnabled(v){this.#data.preferences.voiceInput=Boolean(v);await this.#persist();return this.voiceInputEnabled;}async setDesktopContextEnabled(v){this.#data.preferences.desktopContext=Boolean(v);await this.#persist();return this.desktopContextEnabled;}
 async recordGrowth(note){const text=String(note??'').trim();if(!text)return false;this.#data.growthNotes.unshift({id:randomUUID(),text:text.slice(0,1000),createdAt:new Date().toISOString()});this.#data.growthNotes=this.#data.growthNotes.slice(0,100);await this.#persist();return true;}
 async celebrateBirthday(now=new Date()){if(now.getMonth()===9&&now.getDate()>=12&&this.#data.lastBirthdayYear!==now.getFullYear()){this.#data.experienceYears+=1;this.#data.lastBirthdayYear=now.getFullYear();this.#data.growthNotes.unshift({id:randomUUID(),text:`Birthday growth marker — year ${this.#data.experienceYears}.`,createdAt:now.toISOString()});this.#data.growthNotes=this.#data.growthNotes.slice(0,100);}await this.#persist();return this.snapshot();}
 async #quarantine(reason){const stamp=new Date().toISOString().replace(/[:.]/g,'-');const backup=`${this.#file}.corrupt-${reason}-${stamp}`;try{await fs.rename(this.#file,backup);}catch(e){if(e?.code!=='ENOENT')throw e;}this.#data=normalizeExperience({},new Date());}
 async #persist(){await fs.mkdir(path.dirname(this.#file),{recursive:true});const tmp=`${this.#file}.tmp`;await fs.writeFile(tmp,JSON.stringify(this.#data,null,2),'utf8');await fs.rename(tmp,this.#file);}
}
