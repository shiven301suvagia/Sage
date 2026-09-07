const REMINDER=/^(?:remind me|set a reminder|reminder)\s+(?:to\s+)?(.+?)(?:\s+(?:at|in)\s+(.+))?$/i;
const OPEN=/^(?:open|go to|visit)\s+(https?:\/\/\S+)$/i;

export class IntentPlanner{
 plan(input){
  const text=String(input??'').trim();
  if(!text)return{type:'conversation',confidence:1};
  if(/^remember\b/i.test(text))return{type:'memory.remember',confidence:1,args:{text:text.replace(/^remember\b[: ,]*/i,'').trim()}};
  if(/^forget everything|^clear (?:my )?memories$/i.test(text))return{type:'memory.clear',confidence:1,args:{}};
  const reminder=text.match(REMINDER);if(reminder)return{type:'reminder.create',confidence:.98,args:{text:reminder[1].trim(),when:reminder[2]?.trim()||null}};
  const open=text.match(OPEN);if(open)return{type:'open.url',confidence:.98,args:{url:open[1]}};
  return{type:'conversation',confidence:.7};
 }
}
