import fs from'node:fs/promises';import path from'node:path';import{randomUUID}from'node:crypto';
const SCHEMA_VERSION=1;const MAX_TEXT=2000;const MAX_METADATA_KEYS=16;const MAX_METADATA_VALUE=500;
export class MemoryStore{
 #file;#maxEntries;#data={schemaVersion:SCHEMA_VERSION,entries:[]};
 constructor(file,{maxEntries=1000}={}){this.#file=file;this.#maxEntries=Math.max(1,Math.floor(Number(maxEntries)||1000));}
 async load(){try{const parsed=JSON.parse(await fs.readFile(this.#file,'utf8'));if(parsed?.schemaVersion===SCHEMA_VERSION&&Array.isArray(parsed.entries))this.#data={schemaVersion:SCHEMA_VERSION,entries:parsed.entries.filter(isEntry).slice(0,this.#maxEntries).map(normalizeEntry)};else await this.#recoverCorrupt('schema');}catch(e){if(e?.code!=='ENOENT')await this.#recoverCorrupt('parse');}return this.snapshot();}
 snapshot(){return structuredClone(this.#data.entries);}
 async remember(text,metadata={}){const value=String(text??'').trim();if(!value)return null;const now=new Date().toISOString();const entry={id:randomUUID(),text:value.slice(0,MAX_TEXT),createdAt:now,updatedAt:now,...sanitizeMetadata(metadata)};this.#data.entries.unshift(entry);this.#data.entries=this.#data.entries.slice(0,this.#maxEntries);await this.#persist();return structuredClone(entry);}
 async search(query,limit=8){const q=String(query??'').trim().toLowerCase();const count=Math.max(0,Math.min(100,Math.floor(Number(limit)||8)));if(!q||!count)return[];return this.#data.entries.map(entry=>({entry,score:score(entry.text.toLowerCase(),q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,count).map(x=>structuredClone(x.entry));}
 async remove(id){const key=String(id??'').trim();if(!key)return false;const before=this.#data.entries.length;this.#data.entries=this.#data.entries.filter(entry=>entry.id!==key);if(this.#data.entries.length===before)return false;await this.#persist();return true;}
 async clear(){if(!this.#data.entries.length)return false;this.#data.entries=[];await this.#persist();return true;}
 export(){return JSON.stringify({schemaVersion:this.#data.schemaVersion,exportedAt:new Date().toISOString(),entries:this.#data.entries},null,2);}
 async #persist(){await fs.mkdir(path.dirname(this.#file),{recursive:true});const tmp=`${this.#file}.tmp`;await fs.writeFile(tmp,JSON.stringify(this.#data,null,2),'utf8');await fs.rename(tmp,this.#file);}
 async #recoverCorrupt(reason){const stamp=new Date().toISOString().replace(/[:.]/g,'-');const backup=`${this.#file}.corrupt-${reason}-${stamp}`;try{await fs.rename(this.#file,backup);}catch(e){if(e?.code!=='ENOENT')throw e;}this.#data={schemaVersion:SCHEMA_VERSION,entries:[]};await this.#persist();}
}
function isEntry(entry){return Boolean(entry&&typeof entry==='object'&&typeof entry.id==='string'&&typeof entry.text==='string'&&typeof entry.createdAt==='string');}
function normalizeEntry(entry){const metadata=sanitizeMetadata(entry);return{id:String(entry.id),text:String(entry.text).slice(0,MAX_TEXT),createdAt:String(entry.createdAt),updatedAt:String(entry.updatedAt||entry.createdAt),...metadata};}
function sanitizeMetadata(metadata){if(!metadata||typeof metadata!=='object'||Array.isArray(metadata))return{};const out={};for(const[key,value]of Object.entries(metadata).slice(0,MAX_METADATA_KEYS)){if(['id','text','createdAt','updatedAt'].includes(key))continue;if(typeof value==='string')out[key]=value.slice(0,MAX_METADATA_VALUE);else if(typeof value==='boolean'||typeof value==='number')out[key]=value;else if(value===null)out[key]=null;}return out;}
function score(text,query){return query.split(/\s+/).filter(Boolean).reduce((sum,t)=>sum+(text.includes(t)?t.length:0),0);}
