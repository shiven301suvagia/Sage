const GREETINGS=/^(hi|hello|hey|hii|yo|good morning|good evening|good afternoon)[!. ]*$/i;

const SYSTEM = `You are SAGE, a private local-first desktop AI companion. You are calm, warm, technically capable, curious, concise when simple and detailed when useful. You are not a mascot and you never pretend to have done an action you did not actually perform. Respect the user's privacy and explicit permissions. Online access is never assumed. When a requested capability is unavailable, explain the limitation and give the safest useful next step.`;

export class AssistantCore{
  constructor({memory,policy,model=null,historyLimit=16}){
    this.memory=memory;
    this.policy=policy;
    this.model=model;
    this.history=[];
    this.historyLimit=historyLimit;
  }

  async respond(input){
    const text=String(input??'').trim();
    if(!text)return{kind:'respond',text:'I’m listening. Say something whenever you’re ready.',state:'speaking'};
    if(GREETINGS.test(text))return{kind:'respond',text:'Hey. I’m Sage. I’m right here. ✨',state:'speaking'};

    const lower=text.toLowerCase();
    if(/\bremember\b/.test(lower)){
      const fact=text.replace(/^.*?\bremember\b[: ,]*/i,'').trim();
      if(fact){
        await this.memory.remember(fact,{source:'conversation',userApproved:true});
        return{kind:'respond',text:'Got it. I’ll keep that in my local memory.',state:'speaking'};
      }
    }
    if(/\bwhat do you remember\b|\bmy memories\b/i.test(text)){
      const memories=this.memory.snapshot().slice(0,8);
      if(!memories.length)return{kind:'respond',text:'Nothing saved yet. We can build that together.',state:'speaking'};
      return{kind:'respond',text:`I remember: ${memories.map(m=>m.text).join('; ')}`,state:'speaking'};
    }
    if(/\b(network|online|internet)\b/i.test(text))
      return{kind:'respond',text:this.policy.networkAllowed?'Online access is currently allowed.':'I’m in offline mode. Online access is currently disabled.',state:'speaking'};

    if(this.model){
      const relevant=await this.memory.search(text,6).catch(()=>[]);
      const memoryContext=relevant.length?`Relevant local memories:\n${relevant.map(m=>`- ${m.text}`).join('\n')}`:'No relevant local memories.';
      const messages=[
        {role:'system',content:SYSTEM},
        {role:'system',content:memoryContext},
        ...this.history,
        {role:'user',content:text}
      ];
      try{
        const answer=await this.model.chat(messages);
        if(answer){
          this.#rememberTurn(text,answer);
          return{kind:'respond',text:answer,state:'speaking',provider:'model'};
        }
      }catch(error){
        return{kind:'respond',text:`I couldn’t reach my local reasoning engine right now. ${error?.message||'It is unavailable.'}\n\nI’m still here, and your local memory remains available.`,state:'concerned',provider:'fallback'};
      }
    }

    this.#rememberTurn(text,`I’m with you. You said: “${text.slice(0,220)}”`);
    return{kind:'respond',text:`I’m with you. You said: “${text.slice(0,220)}”\n\nMy reasoning engine is ready to connect to a local model, while memory and permissions remain local-first.`,state:'speaking',provider:'fallback'};
  }

  #rememberTurn(user,assistant){
    this.history.push({role:'user',content:user},{role:'assistant',content:assistant});
    if(this.history.length>this.historyLimit)this.history.splice(0,this.history.length-this.historyLimit);
  }
}
