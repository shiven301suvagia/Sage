const MANIFEST_VERSION=1;
const NAME=/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const RISK=new Set(['read','write','external','destructive']);
const clone=value=>JSON.parse(JSON.stringify(value));
export class PluginRegistry{
 constructor({policy=null}={}){this.policy=policy;this.plugins=new Map();}
 register(manifest,handler){const normalized=this.#validate(manifest);if(this.plugins.has(normalized.id))throw new Error(`Plugin already registered: ${normalized.id}`);if(typeof handler!=='function')throw new Error(`Plugin handler unavailable: ${normalized.id}`);this.plugins.set(normalized.id,{manifest:normalized,handler});return clone(normalized);}
 unregister(id){return this.plugins.delete(String(id));}
 describe(id){const item=this.plugins.get(String(id));return item?clone(item.manifest):null;}
 list(){return [...this.plugins.values()].map(item=>clone(item.manifest));}
 async execute(id,input={}){const item=this.plugins.get(String(id));if(!item)throw Object.assign(new Error(`Unknown plugin: ${id}`),{code:'PLUGIN_UNKNOWN'});const decision=this.policy?.decide?.(item.manifest)||{allowed:true,requiresConfirmation:false};if(!decision.allowed&&!decision.requiresConfirmation)throw Object.assign(new Error(decision.reason),{code:'PLUGIN_DENIED'});if(decision.requiresConfirmation)throw Object.assign(new Error('Plugin execution requires confirmation.'),{code:'PLUGIN_CONFIRMATION_REQUIRED'});return item.handler(input);}
 #validate(manifest){if(!manifest||typeof manifest!=='object')throw new Error('Malformed plugin manifest.');const id=String(manifest.id||'');if(!NAME.test(id))throw new Error('Invalid plugin id.');if(Number(manifest.version)!==MANIFEST_VERSION)throw new Error('Unsupported plugin manifest version.');if(typeof manifest.name!=='string'||!manifest.name.trim())throw new Error('Plugin name is required.');if(!Array.isArray(manifest.capabilities)||manifest.capabilities.length>32)throw new Error('Invalid plugin capabilities.');const capabilities=[...new Set(manifest.capabilities.map(String))];for(const capability of capabilities){if(!NAME.test(capability))throw new Error(`Invalid plugin capability: ${capability}`);}const risk=String(manifest.risk||'read');if(!RISK.has(risk))throw new Error('Invalid plugin risk.');return Object.freeze({version:MANIFEST_VERSION,id,name:manifest.name.trim().slice(0,120),description:String(manifest.description||'').trim().slice(0,500),capabilities,risk,network:Boolean(manifest.network),permissions:Array.isArray(manifest.permissions)?[...new Set(manifest.permissions.map(String))].slice(0,16):[]});}
}
export const PLUGIN_MANIFEST_VERSION=MANIFEST_VERSION;
