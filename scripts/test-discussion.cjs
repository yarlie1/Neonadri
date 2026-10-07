const fs=require("fs"),vm=require("vm"),assert=require("node:assert/strict"),ts=require("../node_modules/typescript");
let admin=false, rpcError=null, calls=0;
const rows=[{id:1,nickname:"private name",body:"hidden text",hidden:true,parent_id:null,created_at:"2026-10-07"}];
const chain={select(){return this},order(){return this},limit(){return this},lt(){return this},eq(){return this},maybeSingle:async()=>({data:{is_admin:admin}}),then(resolve){return Promise.resolve({data:rows,error:null}).then(resolve)}};
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("app/api/discussion/route.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports:exportsObject,URL,process:{env:{NODE_ENV:"production",SUPABASE_SERVICE_ROLE_KEY:"test-only"}},
 require:n=> n==="next/server"?{NextResponse:{json:(data,options={})=>({data,status:options.status||200})}}:n==="crypto"?require("crypto"):n.includes("/admin")?{createAdminClient:()=>({from:()=>chain,rpc:async()=>{calls++;return {data:1,error:rpcError}}})}:{createClient:async()=>({auth:{getUser:async()=>({data:{user:admin?{id:"admin"}:null}})},from:()=>chain})}
});
const req=(data,origin="https://example.test")=>({url:"https://example.test/api/discussion",headers:new Headers({origin,"x-vercel-forwarded-for":"192.0.2.1"}),text:async()=>JSON.stringify(data),json:async()=>data});
(async()=>{
 let r=await exportsObject.GET(req({}));assert.equal(r.data.comments[0].body,"");assert.equal(r.data.comments[0].nickname,"Hidden");assert.equal(r.data.admin,false);
 r=await exportsObject.PATCH(req({id:1,hidden:true}));assert.equal(r.status,403);
 r=await exportsObject.POST(req({nickname:"Guest",body:"Hello"}));assert.equal(r.status,201);
 r=await exportsObject.POST(req({nickname:"Guest",body:"Hello"},"https://other.test"));assert.equal(r.status,403);
 r=await exportsObject.POST(req({nickname:"Guest",body:" "}));assert.equal(r.status,400);
 r=await exportsObject.POST(req({nickname:"Guest",body:"hello",website:"spam"}));assert.equal(r.status,400);
 r=await exportsObject.POST(req({nickname:"Guest",body:"hello",parent_id:-1}));assert.equal(r.status,400);
 assert.equal(calls,1);
 rpcError={message:"discussion_rate_limit"};r=await exportsObject.POST(req({nickname:"Guest",body:"hello"}));assert.equal(r.status,429);
 admin=true;r=await exportsObject.GET(req({}));assert.equal(r.data.comments[0].body,"hidden text");
 console.log("PASS: anonymous posting, input validation, origin restriction, rate-limit response, hidden content redaction, moderation authorization");
})().catch(e=>{console.error(e);process.exitCode=1});
