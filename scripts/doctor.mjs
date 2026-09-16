import process from'node:process';
import fs from'node:fs/promises';
import path from'node:path';
const root=process.cwd();
const packageJson=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
const provider=process.env.SAGE_MODEL_PROVIDER||'ollama';
const model=process.env.SAGE_OLLAMA_MODEL||'llama3.2:3b';
const url=process.env.SAGE_OLLAMA_URL||'http://127.0.0.1:11434/api/tags';
let failed=false;
function ok(label,detail=''){console.log(`OK   ${label}${detail?` — ${detail}`:''}`)}
function warn(label,detail=''){console.log(`WARN ${label}${detail?` — ${detail}`:''}`)}
function fail(label,detail=''){failed=true;console.log(`FAIL ${label}${detail?` — ${detail}`:''}`)}
const major=Number(process.versions.node.split('.')[0]);
if(major>=22)ok('Node.js',process.versions.node);else fail('Node.js',`SAGE requires Node 22+, found ${process.versions.node}`);
if(packageJson.type==='module')ok('Package type','ESM');else fail('Package type','package.json must use type=module');
if(packageJson.main==='app/main.mjs')ok('Electron entry','app/main.mjs');else fail('Electron entry',String(packageJson.main));
ok('Model provider',provider);
if(provider==='ollama'){
 try{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),3000);
  const response=await fetch(url,{signal:controller.signal});
  clearTimeout(timer);
  if(!response.ok){fail('Ollama service',`HTTP ${response.status}`);}
  else{
   const data=await response.json();
   const names=(data?.models||[]).map(item=>String(item?.name||''));
   if(names.includes(model))ok('Ollama model',model);else warn('Ollama model',`${model} is not installed; run: ollama pull ${model}`);
  }
 }catch(error){
  if(error?.name==='AbortError')fail('Ollama service','timed out after 3s');
  else fail('Ollama service','not reachable at '+url);
 }
}else if(provider==='openai'){
 if(process.env.OPENAI_API_KEY)ok('OpenAI API key','configured');else fail('OpenAI API key','set OPENAI_API_KEY before starting SAGE');
}else fail('Model provider',`unknown provider: ${provider}`);
console.log(failed?'\nSAGE runtime doctor: FAILED':'\nSAGE runtime doctor: READY');
process.exitCode=failed?1:0;
