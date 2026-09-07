const GREETINGS=/^(hi|hello|hey|hii|yo|good morning|good evening|good afternoon)[!. ]*$/i;
export class AssistantCore{
  constructor({memory,policy}){this.memory=memory;this.policy=policy;}
  async respond(input){
    const text=String(input??'').trim();
    if(!text)return{kind:'respond',text:'I’m listening. Say something whenever you’re ready.'};
    if(GREETINGS.test(text))return{kind:'respond',text:'Hey. I’m Sage. I’m right here. ✨'};
    const lower=text.toLowerCase();
    if(/\bremember\b/.test(lower)){const fact=text.replace(/^.*?\bremember\b[: ,]*/i,'').trim();if(fact){await this.memory.remember(fact,{source:'conversation',userApproved:true});return{kind:'respond',text:'Got it. I’ll keep that in my local memory.'};}}
    if(/\bwhat do you remember\b|\bmy memories\b/i.test(text)){const memories=this.memory.snapshot().slice(0,5);if(!memories.length)return{kind:'respond',text:'Nothing saved yet. We can build that together.'};return{kind:'respond',text:`I remember: ${memories.map(m=>m.text).join('; ')}`};}
    if(/\b(network|online|internet)\b/i.test(text))return{kind:'respond',text:this.policy.networkAllowed?'Online access is currently allowed.':'I’m in offline mode. Online access is currently disabled.'};
    return{kind:'respond',text:`I’m with you. You said: “${text.slice(0,220)}”\n\nMy full reasoning, memory and tool systems are being built on top of this companion core.`};
  }
}
