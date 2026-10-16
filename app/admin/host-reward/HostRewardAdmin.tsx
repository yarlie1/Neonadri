"use client";
import {useEffect,useState} from "react";
import {hostRewardDeadline} from "../../../lib/hostReward";
export default function HostRewardAdmin(){
 const [claims,setClaims]=useState<any[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 async function load(){try{const r=await fetch("/api/host-reward?admin=1",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setClaims(d.claims);}catch(e){setError(String(e));}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 async function update(id:number,action:string){
  const reason=action==="approve"?"":window.prompt(action==="paid"?"Enter the Tango order/reference after sending the $100 reward.":"Enter an objective eligibility reason (visible to the applicant).");
  if(reason===null)return;
  if(!window.confirm(action==="approve"?"I verified U.S. residency, LA County location, a genuine meetup and one reward per person. Approve this claim?":action==="paid"?"Confirm the $100 reward has already been sent. This button only records payment.":"Decline this claim?"))return;
  setBusy(true);setError("");
  try{const r=await fetch("/api/host-reward",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,action,reason,verified:action==="approve"})});const d=await r.json();if(!r.ok)throw Error(d.error);await load();}catch(e){setError(String(e));}finally{setBusy(false);}
 }
 return <div className="mt-6 space-y-5">{error&&<p role="alert" className="text-red-700">{error}</p>}<button className="underline" onClick={()=>load()} disabled={busy}>Refresh</button>{loading&&<p>Loading…</p>}{!loading&&!claims.length&&!error&&<p>No claims yet.</p>}{claims.map(c=><article key={c.id} className="border p-5">
  <h2 className="font-bold">#{c.id} · {c.status} · {c.email}</h2><p className="text-sm">Received {new Date(c.submitted_at).toLocaleString()} · Review by {hostRewardDeadline(c.submitted_at)} PT</p>
  {c.status==="approved"&&<p>Send by {hostRewardDeadline(c.reviewed_at)} PT</p>}
  <p className="mt-2 font-semibold">{c.eligibilityReason || "Verified: host, completed meetup, and both attendance reviews are Yes."}</p><p className="mt-2">{c.matches?.posts?.place_name} · {c.matches?.posts?.location} · {c.matches?.posts?.meeting_time}</p>
  <p className="text-sm">U.S. residency and LA County location attested. Host: {c.user_id}</p>
  <p className="my-3 whitespace-pre-wrap">{c.discussion_comments?.deleted_at?"Experience deleted":c.discussion_comments?.body}</p>
  <a className="underline" href={"/posts/"+c.matches?.post_id}>View meetup and reviews</a> · <a className="underline" href={"/discussion#comment-"+c.comment_id}>View public experience</a>
  {c.reason&&<p>{c.reason}</p>}{c.payment_reference&&<p>Payment: {c.payment_reference}</p>}
  <div className="mt-3 flex gap-4">{c.status==="pending"&&<><button disabled={busy} className="border px-3 py-2" onClick={()=>update(c.id,"approve")}>Approve</button><button disabled={busy} className="border px-3 py-2" onClick={()=>update(c.id,"reject")}>Decline</button></>}{c.status==="approved"&&<button disabled={busy} className="border px-3 py-2" onClick={()=>update(c.id,"paid")}>Record reward sent</button>}</div>
 </article>)}</div>;
}

