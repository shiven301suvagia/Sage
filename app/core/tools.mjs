import{TOOL_RISK}from'./policy.mjs';
export const TOOL_DEFINITIONS=Object.freeze([
 {name:'memory.remember',description:'Save a user-approved fact in local memory.',risk:TOOL_RISK.write,network:false},
 {name:'memory.clear',description:'Delete all local memories.',risk:TOOL_RISK.destructive,network:false},
 {name:'reminder.create',description:'Create a local desktop reminder.',risk:TOOL_RISK.write,network:false},
 {name:'open.url',description:'Open a URL in the default browser.',risk:TOOL_RISK.external,network:true},
 {name:'system.info',description:'Read basic local SAGE system information.',risk:TOOL_RISK.read,network:false},
 {name:'system.context',description:'Read SAGE local desktop context.',risk:TOOL_RISK.read,network:false}
]);
export class ToolRegistry{
 constructor({policy,handlers={}}={}){this.policy=policy;this.handlers=handlers;this.tools=new Map(TOOL_DEFINITIONS.map(t=>[t.name,t]));}
 describe(name){return this.tools.get(name)||null;}
 list(){return [...this.tools.values()];}
 prepare(name,args={},explicit=false){const tool=this.describe(name);if(!tool)return{ok:false,reason:`Unknown tool: ${name}`};const decision=this.policy.decide(tool);if(!decision.allowed&&!decision.requiresConfirmation)return{ok:false,tool,reason:decision.reason};if(decision.requiresConfirmation&&!explicit)return{ok:false,tool,requiresConfirmation:true,reason:decision.reason};return{ok:true,tool,args};}
 async execute(name,args={},explicit=false){const prepared=this.prepare(name,args,explicit);if(!prepared.ok)throw Object.assign(new Error(prepared.reason),{code:prepared.requiresConfirmation?'CONFIRMATION_REQUIRED':'TOOL_DENIED',tool:prepared.tool,args});const handler=this.handlers[name];if(typeof handler!=='function')throw new Error(`Tool handler unavailable: ${name}`);return handler(args);}
}
