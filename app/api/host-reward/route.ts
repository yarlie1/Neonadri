import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { hostRewardPhase } from "../../../lib/hostReward";
export const dynamic="force-dynamic";
const response=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
async function context(){
 const client=await createClient();
 const {data:{user}}=await client.auth.getUser();
 const db=createAdminClient() as any;
 return {db,user};
}
export async function GET(req:Request){
 try{
  const {db,user}=await context();
  const {data:counts,error:countError}=await db.from("host_reward_claims").select("status").in("status",["pending","approved","paid"]);
  if(countError) throw countError;
  const summary={approved:counts.filter((c:any)=>c.status!=="pending").length,pending:counts.filter((c:any)=>c.status==="pending").length,phase:hostRewardPhase()};
  if(new URL(req.url).searchParams.get("admin")==="1"){
   if(!user)return response({error:"Unauthorized"},401);
   const {data:profile,error:profileError}=await db.from("profiles").select("is_admin").eq("id",user.id).maybeSingle();
   if(profileError)throw profileError;
   if(!profile?.is_admin)return response({error:"Forbidden"},403);
   const {data:claims,error}=await db.from("host_reward_claims").select("*,matches(id,post_id,user_a,user_b,posts(id,place_name,location,meeting_time)),discussion_comments(body,hidden,deleted_at)").order("submitted_at").order("id");
   if(error)throw error;
   const checkedClaims=await Promise.all(claims.map(async(c:any)=>{
    const {data:eligibilityReason,error:checkError}=await db.rpc("host_reward_eligibility",{p_user:c.user_id,p_match:c.match_id});
    if(checkError)throw checkError;
    return {...c,eligibilityReason};
   }));
   return response({...summary,claims:checkedClaims});
  }
  if(!user)return response({...summary,loggedIn:false,claims:[],meetups:[]});
  const {data:claims,error}=await db.from("host_reward_claims").select("id,match_id,comment_id,status,submitted_at,reviewed_at,paid_at,reason").eq("user_id",user.id).order("id",{ascending:false});
  if(error)throw error;
  const {data:posts,error:postError}=await db.from("posts").select("id,place_name,location,meeting_time").eq("user_id",user.id).gte("meeting_time","2026-10-20T00:00:00").lt("meeting_time","2026-12-01T00:00:00").order("id",{ascending:false});
  if(postError)throw postError;
  const meetups=[];
  if(posts.length){
   const {data:matches,error:matchError}=await db.from("matches").select("id,post_id,status").in("post_id",posts.map((p:any)=>p.id)).in("status",["active","matched"]);
   if(matchError)throw matchError;
   for(const match of matches){
    const {data:reason,error:eligibilityError}=await db.rpc("host_reward_eligibility",{p_user:user.id,p_match:match.id});
    if(eligibilityError)throw eligibilityError;
    meetups.push({...posts.find((p:any)=>p.id===match.post_id),matchId:match.id,reason});
   }
  }
  return response({...summary,loggedIn:true,claims,meetups});
 }catch{return response({error:"Could not load reward information. Please try again."},503);}
}
export async function POST(req:Request){
 if(req.headers.get("origin")!==new URL(req.url).origin)return response({error:"Invalid origin"},403);
 try{
  const {db,user}=await context();if(!user)return response({error:"Please log in."},401);
  const raw=await req.text();if(raw.length>12000)return response({error:"Request too large"},400);
  const input=JSON.parse(raw);
  if(!input || !Number.isSafeInteger(input.matchId)||input.matchId<1||typeof input.body!=="string"||!input.body.trim()||input.body.length>2000||input.confirmed!==true)return response({error:"Enter your experience and confirm the requirements."},400);
  const {data,error}=await db.rpc("submit_host_reward",{p_user:user.id,p_match:input.matchId,p_body:input.body,p_email:user.email||"",p_us:input.confirmed,p_la:input.confirmed});
  if(error)return response({error:error.message},400);
  const deleteToken=createHmac("sha256",process.env.SUPABASE_SERVICE_ROLE_KEY!).update("discussion-delete-v1:"+data.commentId).digest("hex");
  return response({...data,deleteToken},data.existing?200:201);
 }catch{return response({error:"Could not submit your claim. Please try again."},503);}
}
export async function PATCH(req:Request){
 if(req.headers.get("origin")!==new URL(req.url).origin)return response({error:"Invalid origin"},403);
 try{
  const {db,user}=await context();if(!user)return response({error:"Unauthorized"},401);
  const {data:profile}=await db.from("profiles").select("is_admin").eq("id",user.id).maybeSingle();
  if(!profile?.is_admin)return response({error:"Forbidden"},403);
  const input=await req.json();
  if(!input||!Number.isSafeInteger(input.id)||!["approve","reject","paid"].includes(input.action)||typeof input.reason!=="string"||input.reason.length>1000)return response({error:"Invalid request"},400);
  const {error}=await db.rpc("review_host_reward",{p_admin:user.id,p_id:input.id,p_action:input.action,p_reason:input.reason,p_verified:input.verified===true});
  if(error)return response({error:error.message},400);
  return response({ok:true});
 }catch{return response({error:"Could not update claim."},503);}
}

