import{IntentPlanner}from'./planner.mjs';
const GREETINGS=/^(hi|hello|hey|hii|yo|good morning|good evening|good afternoon)[!. ]*$/i;
const SYSTEM=`You are SAGE, a private local-first desktop AI companion. You are calm, warm, technically capable, curious, concise when simple and detailed when useful. You are not a mascot and you never pretend to have done an action you did not actually perform. Respect privacy and explicit permissions. Online access is never assumed.`;

export class AssistantCore{
 constructor({memory,policy,model=null,tools=null,historyLimit=16}){this.memory=memory;this.policy=policy;this.model=model;this.tools=tools;this.planner=new IntentPlanner();this.history=[];this.historyLimit=historyLimit;}
 async respond(input){
  const text=String(input??'').trim();
  if(!text)return{kind:'respond',text:'I’m listening. Say something whenever you’re ready.',state:'speaking'};
  if(GREETINGS.test(text))return{kind:'respond',text:'Hey. I’m Sage. I’m right here. ✨',state:'speaking'};
  const lower=text.toLowerCase();
  if(/\bwhat do you remember\b|\bmy memories\b/i.test(text)){const memories=this.memory.snapshot().slice(0,8);return{kind:'respond',text:memories.length?`I remember: ${memories.map(m=>m.text).join('; ')}`:'Nothing saved yet. We can build that together.',state:'speaking'};}
  if(/\b(network|online|internet)\b/i.test(text))return{kind:'respond',text:this.policy.networkAllowed?'Online access is currently allowed.':'I’m in offline mode. Online access is currently disabled.',state:'speaking'};
  const intent=this.planner.plan(text);
  if(intent.type!=='conversation'&&this.tools){
   if(intent.type==='memory.remember'){await this.tools.execute(intent.type,intent.args,true);return{kind:'respond',text:'Got it. I’ll keep that in my local memory.',state:'speaking',tool:intent.type};}
   const prepared=this.tools.prepare(intent.type,intent.args,false);
   if(prepared.requiresConfirmation)return{kind:'confirmation',state:'speaking',confirmation:{tool:intent.type,args:intent.args,summary:summaryFor(intent)}};
   if(!prepared.ok)return{kind:'respond',text:`I can’t do that right now: ${prepared.reason}`,state:'concerned'};
  }
  if(this.model){const relevant=await this.memory.search(text,6).catch(()=>[]);const memoryContext=relevant.length?`Relevant local memories:\n${relevant.map(m=>`- ${m.text}`).join('\n')}`:'No relevant local memories.';try{const answer=await this.model.chat([{role:'system',content:SYSTEM},{role:'system',content:memoryContext},...this.history,{role:'user',content:text}]);if(answer){this.#rememberTurn(text,answer);return{kind:'respond',text:answer,state:'speaking',provider:'model'};}}catch(error){return{kind:'respond',text:`I couldn’t reach my local reasoning engine right now. ${error?.message||'It is unavailable.'}\n\nI’m still here, and your local memory remains available.`,state:'concerned',provider:'fallback'};}}
  this.#rememberTurn(text,`I’m with you. You said: “${text.slice(0,220)}”`);return{kind:'respond',text:`I’m with you. You said: “${text.slice(0,220)}”\n\nMy reasoning engine is ready to connect to a local model, while memory and permissions remain local-first.`,state:'speaking',provider:'fallback'};
 }
 async confirm(action){if(!action?.tool)throw new Error('Invalid confirmation.');const result=await this.tools.execute(action.tool,action.args||{},true);return{kind:'respond',text:confirmationResult(action.tool,result),state:'speaking',tool:action.tool};}
 #rememberTurn(user,assistant){this.history.push({role:'user',content:user},{role:'assistant',content:assistant});if(this.history.length>this.historyLimit)this.history.splice(0,this.history.length-this.historyLimit);}
}
function summaryFor(i){if(i.type==='reminder.create')return`Create a reminder: “${i.args.text}”${i.args.when?` (${i.args.when})`:''}`;if(i.type==='open.url')return`Open ${i.args.url} in your browser`;if(i.type==='memory.clear')return'Delete all saved local memories';return`Run ${i.type}`;}
function confirmationResult(tool,result){if(tool==='reminder.create')return`Done. I’ll remind you about “${result.text}”.`;if(tool==='open.url')return'I’ve opened that in your default browser.';if(tool==='memory.clear')return'Your local memories have been cleared.';return'Done.';}
