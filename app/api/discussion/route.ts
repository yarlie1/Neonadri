import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createClient } from "../../../lib/supabase/server";

type CommentRow = {id:number;nickname:string;body:string;parent_id:number|null;hidden:boolean;created_at:string};
const adminDb = () => createAdminClient() as any;
export const dynamic = "force-dynamic";
async function isAdmin() {
 const db = await createClient();
 const { data: { user } } = await db.auth.getUser();
 if (!user) return false;
 const { data } = await db.from("profiles").select("is_admin").eq("id",user.id).maybeSingle();
 return data?.is_admin === true;
}
function sameOrigin(req: Request) {
 const origin = req.headers.get("origin");
 return !!origin && origin === new URL(req.url).origin;
}
export async function GET(req: Request) {
 try {
  const cursor = new URL(req.url).searchParams.get("before");
  if(cursor && !/^\d{1,15}$/.test(cursor)) return NextResponse.json({error:"Invalid page."},{status:400});
  const admin = await isAdmin();
  let query = adminDb().from("discussion_comments").select("id,nickname,body,parent_id,hidden,created_at").order("id",{ascending:false}).limit(31);
  if(cursor) query=query.lt("id",Number(cursor));
  const {data,error}=await query;
  if(error) throw error;
  const rows=(data || []) as CommentRow[];
  const comments=rows.slice(0,30).map(row=>row.hidden && !admin ? {...row,nickname:"Hidden",body:""} : row);
  return NextResponse.json({comments,admin,nextCursor:rows.length>30 ? comments[comments.length-1].id : null},{headers:{"Cache-Control":"no-store"}});
 } catch { return NextResponse.json({error:"Could not load comments. Please try again."},{status:503}); }
}
export async function POST(req: Request) {
 if(!sameOrigin(req)) return NextResponse.json({error:"Please submit from this website."},{status:403});
 try {
  const raw=await req.text();
  if(raw.length>12000) return NextResponse.json({error:"Comment is too long."},{status:400});
  let input;
  try {input=JSON.parse(raw);} catch {return NextResponse.json({error:"Invalid request."},{status:400});}
  if(!input || typeof input!=="object") return NextResponse.json({error:"Invalid request."},{status:400});
  const nickname=typeof input.nickname==="string"?input.nickname.trim():"";
  const body=typeof input.body==="string"?input.body.trim():"";
  const parent=input.parent_id == null ? null : input.parent_id;
  if(!nickname || nickname.length>40 || !body || body.length>2000 || (parent!==null && (!Number.isSafeInteger(parent)||parent<1)) || input.website) {
    return NextResponse.json({error:"Enter a nickname (up to 40 characters) and a comment (up to 2,000 characters)."},{status:400});
  }
  const ip=req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
    (process.env.NODE_ENV!=="production" ? "local-preview" : "");
  if(!ip) return NextResponse.json({error:"Comments are temporarily unavailable. Please try again."},{status:503});
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!secret) throw new Error("Missing server configuration");
  const writerKey=createHmac("sha256",secret).update("discussion:"+ip).digest("hex");
  const {data,error}=await adminDb().rpc("submit_discussion_comment",{
    p_nickname:nickname,p_body:body,p_parent_id:parent,p_writer_key:writerKey
  });
  if(error) {
    if(error.message.includes("discussion_rate_limit")) return NextResponse.json({error:"Please wait a minute between comments. Limit: 20 comments per day per connection."},{status:429});
    if(error.message.includes("discussion_parent_unavailable")) return NextResponse.json({error:"That comment is no longer available. Please post a new comment instead."},{status:400});
    throw error;
  }
  return NextResponse.json({id:data},{status:201});
 } catch {return NextResponse.json({error:"Could not post your comment. Please try again."},{status:503});}
}
export async function PATCH(req: Request) {
 if(!sameOrigin(req)) return NextResponse.json({error:"Invalid origin."},{status:403});
 try {
  if(!await isAdmin()) return NextResponse.json({error:"Forbidden"},{status:403});
  const input=await req.json();
  if(!input || !Number.isSafeInteger(input.id) || input.id<1 || typeof input.hidden!=="boolean") return NextResponse.json({error:"Invalid request."},{status:400});
  const {data,error}=await adminDb().from("discussion_comments").update({hidden:input.hidden}).eq("id",input.id).select("id").maybeSingle();
  if(error) throw error;
  if(!data) return NextResponse.json({error:"Comment not found."},{status:404});
  return NextResponse.json({ok:true});
 } catch {return NextResponse.json({error:"Could not update comment."},{status:503});}
}
