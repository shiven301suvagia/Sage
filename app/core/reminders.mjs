import fs from'node:fs/promises';import path from'node:path';import{randomUUID}from'node:crypto';

export class ReminderStore{
 constructor(file){this.file=file;this.items=[];this.timer=null;this.onDue=()=>{};}
 async load(){try{const parsed=JSON.parse(await fs.readFile(this.file,'utf8'));this.items=Array.isArray(parsed)?parsed.filter(isReminder):[];}catch(e){if(e?.code!=='ENOENT')throw e;this.items=[];}return this.snapshot();}
 snapshot(){return this.items.map(x=>({...x}));}
 async add(text,when=null){const cleanText=String(text??'').trim();if(!cleanText)throw new Error('Reminder text is required.');const dueAt=parseWhen(when);if(!dueAt)throw new Error('Please give me a valid time, such as “10 minutes” or “6:30 pm”.');const item={id:randomUUID(),text:cleanText.slice(0,1000),when:String(when).trim(),dueAt,createdAt:new Date().toISOString(),done:false};this.items.push(item);await this.#save();return{...item};}
 async complete(id){const item=this.items.find(x=>x.id===String(id));if(!item)return false;item.done=true;await this.#save();return true;}
 start(onDue){this.onDue=typeof onDue==='function'?onDue:()=>{};clearInterval(this.timer);this.timer=setInterval(()=>this.#tick(),15000);this.#tick();}
 stop(){clearInterval(this.timer);this.timer=null;}
 async #tick(){const now=Date.now();for(const item of this.items.filter(x=>!x.done&&x.dueAt&&Date.parse(x.dueAt)<=now)){item.done=true;await this.#save();this.onDue({...item});}}
 async #save(){await fs.mkdir(path.dirname(this.file),{recursive:true});const tmp=`${this.file}.tmp`;await fs.writeFile(tmp,JSON.stringify(this.items,null,2),'utf8');await fs.rename(tmp,this.file);}
}
function isReminder(item){return Boolean(item&&typeof item==='object'&&typeof item.id==='string'&&typeof item.text==='string'&&typeof item.dueAt==='string');}
function parseWhen(value){if(!value)return null;const s=String(value).trim().toLowerCase().replace(/^in\s+/,'');let m=s.match(/^(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs|day|days)\s*$/);if(m){const n=Number(m[1]),unit=m[2];if(!Number.isSafeInteger(n)||n<1)return null;const ms=unit.startsWith('hour')||unit.startsWith('hr')?n*3600000:unit.startsWith('day')?n*86400000:n*60000;return new Date(Date.now()+ms).toISOString();}m=s.match(/^(?:today\s+)?(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);if(m){let h=Number(m[1]);const min=Number(m[2]||0);if(h<1||h>12||min>59)return null;if(m[3]==='pm'&&h<12)h+=12;if(m[3]==='am'&&h===12)h=0;const d=new Date();d.setHours(h,min,0,0);if(d.getTime()<=Date.now())d.setDate(d.getDate()+1);return d.toISOString();}return null;}
