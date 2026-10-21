const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
let user={id:'guest'},adult=true,row,deleteError=null,push=[],email=[],failPush=false;
const db={auth:{getUser:async()=>({data:{user}})},from(table){
 const filters={};let deleting=false;
 const q={delete(){deleting=true;return q},select(){return q},eq(k,v){filters[k]=v;return q},
 maybeSingle:async()=>({data:table==='profiles'?{display_name:'Alice'}:{meeting_purpose:'Coffee'}}),
 then(resolve,reject){return Promise.resolve().then(()=>{
  assert.equal(table,'match_requests');assert.ok(deleting);
  assert.equal(filters.requester_user_id,user.id);assert.equal(filters.status,'pending');
  if(deleteError)return {error:deleteError};
  if(row&&row.id===filters.id&&row.requester_user_id===filters.requester_user_id&&row.status===filters.status){const data=[row];row=null;return {data};}
  return {data:[]};
 }).then(resolve,reject)}};return q;
}};
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/match-requests/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports:api,console:{error(){}},require:n=>n==='next/server'?{NextResponse:{json:(data,o)=>({data,status:o.status})}}:n.endsWith('/server')?{createClient:async()=>db}:n.endsWith('/adultGate')?{isAdultConfirmedUser:async()=>adult}:n.endsWith('/pushNotifications')?{sendPushNotificationToUser:async(id,p)=>{push.push({id,p});if(failPush)throw Error('delivery failure')}}:n.endsWith('/emailNotifications')?{sendEmailNotificationToUser:async(id,p)=>email.push({id,p})}:{}
});
const req=()=>({json:async()=>({requestId:7})});
const fixture=(status='pending',owner='guest')=>({id:7,post_id:12,post_owner_user_id:'host',requester_user_id:owner,status});
(async()=>{
 row=fixture();assert.equal((await api.DELETE(req())).status,200);assert.equal(push.length,1);assert.equal(email.length,1);assert.equal(push[0].id,'host');assert.match(email[0].p.body,/Alice cancelled their request to join Coffee/);
 await api.DELETE(req());assert.equal(push.length,1);
 row=fixture('accepted');await api.DELETE(req());assert.equal(push.length,1);assert.ok(row);
 row=fixture('pending','other');await api.DELETE(req());assert.equal(push.length,1);assert.ok(row);
 row=fixture();deleteError={message:'failure'};assert.equal((await api.DELETE(req())).status,500);assert.equal(push.length,1);deleteError=null;
 failPush=true;assert.equal((await api.DELETE(req())).status,200);assert.equal(email.length,2);
 user=null;assert.equal((await api.DELETE(req())).status,401);
 console.log('PASS: host notifications, retry suppression, pending-only ownership, delete failure, delivery failure isolation, login');
})().catch(e=>{console.error(e);process.exitCode=1});
