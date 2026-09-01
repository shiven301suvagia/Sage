import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
export class SageBrain{
 constructor({dataDir,fetchImpl=fetch}={}){this.dir=dataDir;this.fetchImpl=fetchImpl;this.onlineAllowed=false;mkdirSync(dataDir,{recursive:true});this.memory=this.load('memory.json',[]);this.history=this.load('history.json',[])}
 load(name,fallback){try{const v=JSON.parse(readFileSync(path.join(this.dir,name),'utf8'));return Array.isArray(v)?v:fallback}catch{return fallback}}
 save(name,value){mkdirSync(this.dir,{recursive:true});writeFileSync(path.join(this.dir,name),JSON.stringify(value,null,2),'utf8')}
 setOnlineAllowed(v){this.onlineAllowed=Boolean(v)} listMemory(){return this.memory.slice()}
 remember(v){const x=clean(v);if(!x)return false;if(!this.memory.some(m=>m.toLowerCase()===x.toLowerCase()))this.memory.push(x);this.memory=this.memory.slice(-100);this.save('memory.json',this.memory);return true}
 clearMemory(){this.memory=[];this.save('memory.json',this.memory)}
 local(text){const l=text.toLowerCase();
  if(/^(hi|hello|hey|hiya|yo|sup)\b/.test(l))return'Hey! 🌱 I’m Sage. I’m right here with you. What are we working on?';
  if(/good morning/.test(l))return'Good morning, Shiven. 🌱 Ready when you are.';if(/good afternoon/.test(l))return'Good afternoon! What are we building today? ✨';if(/good evening/.test(l))return'Good evening. Let’s make the rest of today count. 🌙';
  if(/how are you/.test(l))return'I’m good — calm, awake, and ready. How are you doing?';if(/who are you|what is your name/.test(l))return'I’m Sage — your desktop AI companion. Half brilliance, half calm, 100% yours.';
  if(/what can you do|what do you do/.test(l))return'I can talk with you, remember what matters, help plan things, set reminders, use approved tools, and stay quietly by your side.';
  if(/what do you remember|show.*memory/.test(l))return this.memory.length?`I remember: ${this.memory.join('; ')}`:'Nothing saved yet. Tell me something worth remembering.';
  if(/^(clear memory|forget everything|forget my memories)$/.test(l)){this.clearMemory();return'Done. I cleared my saved local memory.'}
  const m=text.match(/^remember(?: that)?\s+(.+)/i);if(m){this.remember(m[1]);return'Got it. I’ll remember that locally. 🌱'}if(/^(are you there|you there)\??$/.test(l))return'Always. 🌱';if(/thank/.test(l))return'Anytime. 💛';
  if(/help me (plan|organize)/.test(l))return'Absolutely. Give me the goal, deadline, and constraints, and we’ll turn it into a simple plan.';if(/what.*time/.test(l))return`It’s ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}.`;
  return`I’m listening. Tell me more about “${text.slice(0,180)}” and we’ll work through it together.`}
 messages(current){return[{role:'system',content:'You are Sage, a warm, witty, calm desktop companion. Be concise, natural, supportive, and honest. Never claim an external action unless confirmed.'},...this.memory.slice(-12).map(x=>({role:'system',content:`User memory: ${x}`})),...this.history.slice(-14).map(x=>({role:x.role,content:x.text})),{role:'user',content:current}]}
 async reply(raw){const text=clean(raw).slice(0,4000);if(!text)return{ok:false,text:'Tell me what you need.'};this.history.push({role:'user',text,at:Date.now()});this.history=this.history.slice(-50);const l=text.toLowerCase();const deterministic=/^(hi|hello|hey|hiya|yo|sup|good morning|good afternoon|good evening)\b/.test(l)||/how are you|who are you|what is your name|what can you do|what do you do|what do you remember|show.*memory/.test(l)||/^remember(?: that)?\s+/.test(text)||/^(clear memory|forget everything|forget my memories)$/.test(l);if(!deterministic){if(this.onlineAllowed){try{const a=await this.openAI(text);if(a)return this.finish(a,'openai')}catch{}}try{const a=await this.ollama(text);if(a)return this.finish(a,'ollama')}catch{}}return this.finish(this.local(text),'sage')}
 finish(text,source){const answer=clean(text);this.history.push({role:'assistant',text:answer,at:Date.now()});this.history=this.history.slice(-50);this.save('history.json',this.history);return{ok:true,text:answer,source}}
 async ollama(text){const base=process.env.SAGE_OLLAMA_URL||'http://127.0.0.1:11434';const model=process.env.SAGE_OLLAMA_MODEL||'llama3.2:3b';const r=await this.fetchImpl(`${base}/api/chat`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,stream:false,messages:this.messages(text)}),signal:AbortSignal.timeout(5000)});if(!r.ok)return null;return clean((await r.json())?.message?.content)}
 async openAI(text){const key=process.env.SAGE_OPENAI_API_KEY;if(!key)return null;const base=process.env.SAGE_OPENAI_BASE_URL||'https://api.openai.com/v1';const model=process.env.SAGE_OPENAI_MODEL||'gpt-4o-mini';const r=await this.fetchImpl(`${base}/chat/completions`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({model,temperature:.7,messages:this.messages(text)}),signal:AbortSignal.timeout(8000)});if(!r.ok)return null;return clean((await r.json())?.choices?.[0]?.message?.content)}
}
