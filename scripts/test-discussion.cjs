const fs=require("fs"),vm=require("vm"),assert=require("node:assert/strict"),ts=require("../node_modules/typescript");
let admin=false, rpcError=null, calls=0, updates=0, mutation=null;
const rows=[{id:1,nickname:"private name",body:"hidden text",hidden:true,parent_id:null,created_at:"2026-10-07"}];
const chain={update(value){updates++;mutation=value;return this},is(){return this},select(){return this},order(){return this},limit(){return this},lt(){return this},eq(){return this},maybeSingle:async()=>({data:mutation?{id:1}:{is_admin:admin}}),then(resolve){return Promise.resolve({data:rows,error:null}).then(resolve)}};
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("app/api/discussion/route.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports:exportsObject,URL,Buffer,process:{env:{NODE_ENV:"production",SUPABASE_SERVICE_ROLE_KEY:"test-only"}},
 require:n=> n==="next/server"?{NextResponse:{json:(data,options={})=>({data,status:options.status||200})}}:n==="crypto"?require("crypto"):n.includes("/admin")?{createAdminClient:()=>({from:()=>chain,rpc:async()=>{calls++;return {data:1,error:rpcError}}})}:{createClient:async()=>({auth:{getUser:async()=>({data:{user:admin?{id:"admin"}:null}})},from:()=>chain})}
});
const req=(data,origin="https://example.test")=>({url:"https://example.test/api/discussion",headers:new Headers({origin,"x-vercel-forwarded-for":"192.0.2.1"}),text:async()=>JSON.stringify(data),json:async()=>data});
(async()=>{
 let r=await exportsObject.GET(req({}));assert.equal(r.data.comments[0].body,"");assert.equal(r.data.comments[0].nickname,"Hidden");assert.equal(r.data.admin,false);
 r=await exportsObject.PATCH(req({id:1,hidden:true}));assert.equal(r.status,403);
 r=await exportsObject.POST(req({nickname:"Guest",body:"Hello"}));assert.equal(r.status,201);const token=r.data.deleteToken;assert.match(token,/^[a-f0-9]{64}$/);
 r=await exportsObject.POST(req({nickname:"Guest",body:"Hello"},"https://other.test"));assert.equal(r.status,403);
 r=await exportsObject.POST(req({nickname:"Guest",body:" "}));assert.equal(r.status,400);
 r=await exportsObject.POST(req({nickname:"Guest",body:"hello",website:"spam"}));assert.equal(r.status,400);
 r=await exportsObject.POST(req({nickname:"Guest",body:"hello",parent_id:-1}));assert.equal(r.status,400);
 assert.equal(calls,1);
 rpcError={message:"discussion_rate_limit"};r=await exportsObject.POST(req({nickname:"Guest",body:"hello"}));assert.equal(r.status,429);
 r=await exportsObject.DELETE(req({id:1}));assert.equal(r.status,403);
 r=await exportsObject.DELETE(req({id:1,deleteToken:"0".repeat(64)}));assert.equal(r.status,403);
 r=await exportsObject.DELETE(req({id:2,deleteToken:token}));assert.equal(r.status,403);
 r=await exportsObject.DELETE(req({id:1,deleteToken:token},"https://other.test"));assert.equal(r.status,403);
 assert.equal(updates,0);
 r=await exportsObject.DELETE(req({id:1,deleteToken:token}));assert.equal(r.status,200);
 assert.equal(updates,1);assert.equal(mutation.body,"[deleted]");assert.equal(mutation.hidden,true);assert.ok(mutation.deleted_at);
 mutation=null;
 admin=true;r=await exportsObject.GET(req({}));assert.equal(r.data.comments[0].body,"hidden text");
 rows[0].deleted_at="2026-10-14";r=await exportsObject.GET(req({}));assert.equal(r.data.comments[0].body,"");assert.equal(r.data.comments[0].deleteToken,undefined);
 console.log("PASS: anonymous posting, input validation, origin restriction, rate-limit response, hidden content redaction, moderation authorization");
})().catch(e=>{console.error(e);process.exitCode=1});
