export const EXPERIENCE_SCHEMA_VERSION=4;
export const DEFAULT_EXPERIENCE_PREFERENCES=Object.freeze({proactive:false,networkAllowed:false,voiceInput:false,desktopContext:false});
export function normalizeExperience(value,now=new Date()){
 const source=value&&typeof value==='object'?value:{};
 const preferences=source.preferences&&typeof source.preferences==='object'?source.preferences:{};
 return {schemaVersion:EXPERIENCE_SCHEMA_VERSION,installedAt:typeof source.installedAt==='string'?source.installedAt:now.toISOString(),lastSeenAt:typeof source.lastSeenAt==='string'?source.lastSeenAt:now.toISOString(),experienceYears:Number.isSafeInteger(source.experienceYears)&&source.experienceYears>=0?source.experienceYears:0,lastBirthdayYear:Number.isSafeInteger(source.lastBirthdayYear)?source.lastBirthdayYear:null,growthNotes:Array.isArray(source.growthNotes)?source.growthNotes.filter(x=>x&&typeof x.text==='string').slice(0,100):[],preferences:{proactive:preferences.proactive===true,networkAllowed:preferences.networkAllowed===true,voiceInput:preferences.voiceInput===true,desktopContext:preferences.desktopContext===true}};
}
