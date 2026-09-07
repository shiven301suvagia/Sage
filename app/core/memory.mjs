import fs from 'node:fs/promises';
import path from 'node:path';
const SCHEMA_VERSION=1;
export class MemoryStore {
  #file; #maxEntries; #data={schemaVersion:SCHEMA_VERSION,entries:[]};
  constructor(file,{maxEntries=1000}={}){this.#file=file;this.#maxEntries=maxEntries;}
  async load(){try{const parsed=JSON.parse(await fs.readFile(this.#file,'utf8'));if(parsed?.schemaVersion===SCHEMA_VERSION&&Array.isArray(parsed.entries))this.#data=parsed;}catch(e){if(e?.code!=='ENOENT')throw e;}return this.snapshot();}
  snapshot(){return structuredClone(this.#data.entries);}
  async remember(text,metadata={}){const value=String(text).trim();if(!value)return null;const now=new Date().toISOString();const entry={id:crypto.randomUUID(),text:value.slice(0,2000),createdAt:now,updatedAt:now,...metadata};this.#data.entries.unshift(entry);this.#data.entries=this.#data.entries.slice(0,this.#maxEntries);await this.#persist();return structuredClone(entry);}
  async search(query,limit=8){const q=String(query).trim().toLowerCase();if(!q)return[];return this.#data.entries.map(entry=>({entry,score:score(entry.text.toLowerCase(),q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>structuredClone(x.entry));}
  async clear(){this.#data.entries=[];await this.#persist();}
  async #persist(){await fs.mkdir(path.dirname(this.#file),{recursive:true});const tmp=`${this.#file}.tmp`;await fs.writeFile(tmp,JSON.stringify(this.#data,null,2),'utf8');await fs.rename(tmp,this.#file);}
}
function score(text,query){return query.split(/\s+/).filter(Boolean).reduce((sum,t)=>sum+(text.includes(t)?t.length:0),0);}
