export const TOOL_RISK=Object.freeze({read:'read',write:'write',external:'external',destructive:'destructive'});
export class ToolPolicy{
  constructor({networkAllowed=false}={}){this.networkAllowed=Boolean(networkAllowed);}
  decide(tool){if(!tool||typeof tool.name!=='string')return{allowed:false,reason:'Malformed tool.'};if(tool.network&&!this.networkAllowed)return{allowed:false,reason:'Network access is disabled.'};if([TOOL_RISK.write,TOOL_RISK.external,TOOL_RISK.destructive].includes(tool.risk))return{allowed:false,requiresConfirmation:true,reason:'Confirmation required.'};return{allowed:true,requiresConfirmation:false,reason:'Allowed by current policy.'};}
}
