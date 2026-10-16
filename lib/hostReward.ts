export const HOST_REWARD_START="2026-10-20T07:00:00Z";
export const HOST_REWARD_END="2026-12-01T08:00:00Z";
export function hostRewardPhase(now=Date.now()) {
 return now<Date.parse(HOST_REWARD_START)?"upcoming":now>=Date.parse(HOST_REWARD_END)?"ended":"open";
}
export function hostRewardDeadline(value:string) {
 const date=new Date(value);
 const holidays=new Set(["2026-10-12","2026-11-11","2026-11-26","2026-12-25","2027-01-01","2027-01-18"]);
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
 const get=(name:string)=>parts.find(p=>p.type===name)!.value;
 const day=new Date(get("year")+"-"+get("month")+"-"+get("day")+"T12:00:00Z");
 let added=0;while(added<7){day.setUTCDate(day.getUTCDate()+1);if(day.getUTCDay()!==0 && day.getUTCDay()!==6 && !holidays.has(day.toISOString().slice(0,10)))added++;}
 return day.toLocaleDateString("en-US",{timeZone:"UTC",year:"numeric",month:"short",day:"numeric"});
}

