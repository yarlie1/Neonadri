const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const util={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/hostReward.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:util,Date,Intl,Set});
assert.equal(util.hostRewardPhase(Date.parse('2026-10-20T06:59:59Z')),'upcoming');
assert.equal(util.hostRewardPhase(Date.parse('2026-10-20T07:00:00Z')),'open');
assert.equal(util.hostRewardPhase(Date.parse('2026-12-01T07:59:59Z')),'open');
assert.equal(util.hostRewardPhase(Date.parse('2026-12-01T08:00:00Z')),'ended');
assert.equal(util.hostRewardDeadline('2026-11-23T20:00:00Z'),'Dec 3, 2026');
assert.equal(util.hostRewardDeadline('2026-11-06T20:00:00Z'),'Nov 18, 2026');
let user=null,admin=false,calls=0;
const db={from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>({data:{is_admin:admin}})}),rpc:async()=>{calls++;return {data:{id:1,commentId:2,existing:false}}}};
const api={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/host-reward/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports:api,URL,process:{env:{SUPABASE_SERVICE_ROLE_KEY:'test-secret'}},require:n=>n==='next/server'?{NextResponse:{json:(data,options)=>({data,status:options.status})}}:n==='crypto'?require('crypto'):n.endsWith('/admin')?{createAdminClient:()=>db}:n.endsWith('/server')?{createClient:async()=>({auth:{getUser:async()=>({data:{user}})}})}:util
});
const req=(body,origin='https://example.test')=>({url:'https://example.test/api/host-reward',headers:new Headers({origin}),text:async()=>JSON.stringify(body),json:async()=>body});
(async()=>{
 const valid={matchId:1,body:'An honest experience',confirmed:true};
 assert.equal((await api.POST(req(valid))).status,401);
 user={id:'host',email:'host@example.invalid'};
 assert.equal((await api.POST(req(valid,'https://other.test'))).status,403);
 assert.equal((await api.POST(req({...valid,confirmed:false}))).status,400);
 assert.equal((await api.POST(req({...valid,matchId:-1}))).status,400);
 assert.equal((await api.POST(req({...valid,body:' '}))).status,400);
 assert.equal(calls,0);
 const response=await api.POST(req(valid));assert.equal(response.status,201);assert.match(response.data.deleteToken,/^[a-f0-9]{64}$/);assert.equal(calls,1);
 assert.equal((await api.PATCH(req({id:1,action:'approve',reason:''}))).status,403);
 admin=true;assert.equal((await api.PATCH(req({id:1,action:'unknown',reason:''}))).status,400);
 assert.equal(calls,1);
 console.log('PASS: Pacific/DST event boundaries, federal-holiday deadlines, login/origin/validation, ownership token, admin authorization');
})().catch(e=>{console.error(e);process.exitCode=1});
