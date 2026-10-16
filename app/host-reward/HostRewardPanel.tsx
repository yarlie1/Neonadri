"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {hostRewardDeadline} from "../../lib/hostReward";
type Claim={id:number;match_id:number;comment_id:number;status:string;submitted_at:string;reviewed_at:string|null;paid_at:string|null;reason:string|null};
type Meetup={id:number;matchId:number;place_name:string|null;location:string|null;meeting_time:string;reason:string|null};
type Data={loggedIn:boolean;phase:string;approved:number;pending:number;claims:Claim[];meetups:Meetup[]};
export default function HostRewardPanel({compose=false,postId}:{compose?:boolean;postId?:number}){
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[matchId,setMatchId]=useState(""),[body,setBody]=useState(""),[confirmed,setConfirmed]=useState(false);
 async function load(){try{const r=await fetch("/api/host-reward",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setData(d);}catch(e){setError(e instanceof Error?e.message:"Please try again.");}}
 useEffect(()=>{void load();},[]);
 async function submit(e:React.FormEvent){
  e.preventDefault();if(busy)return;setBusy(true);setError("");
  try{
   const r=await fetch("/api/host-reward",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({matchId:Number(matchId),body,confirmed})});
   const d=await r.json();if(!r.ok)throw Error(d.error);
   try{const saved=JSON.parse(localStorage.getItem("neonadri-discussion-delete")||"{}");localStorage.setItem("neonadri-discussion-delete",JSON.stringify({...saved,[d.commentId]:d.deleteToken}));}catch{}
   window.location.href="/discussion?submitted=host100#conversation";
  }catch(e){setError(e instanceof Error?e.message:"Please try again.");setBusy(false);}
 }
 const active=data?.claims.some(c=>["pending","approved","paid"].includes(c.status));
 const meetups=data?.meetups.filter(m=>!postId||m.id===postId)||[];
 return <section id="host-reward-claim" className="my-5 rounded-lg border border-[#cccccc] bg-white p-5 text-[#111111]">
  <h2 className="text-xl font-bold">$100 Host Reward</h2>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error} <button onClick={()=>{setError("");void load();}} className="underline">Retry</button></p>}
  {!data&&!error&&<p className="mt-3">Loading reward information…</p>}
  {data&&<>
   <p className="mt-2 text-sm">{data.approved}/10 rewards approved · {data.pending} claims under review</p>
   <p className="mt-2 text-sm">{data.phase==="upcoming"?"Applications open October 20, 2026.":data.phase==="ended"?"Applications closed November 30, 2026.":data.approved>=10?"All 10 rewards have been approved.":data.approved+data.pending>=10?"All spots are approved or under review. Check back if a claim is declined.":"Applications are open through November 30, 2026 (Pacific Time)."}</p>
   {!data.loggedIn?<Link href="/login?next=%2Fdiscussion%3Freward%3Dhost100%23host-reward-claim" className="mt-4 inline-block underline">Log in to check eligibility</Link>:<>
    {data.claims.map(c=><div key={c.id} className="mt-4 border-t pt-3 text-sm">
     <p className="font-bold">Claim #{c.id} · {c.status==="pending"?"Under review":c.status==="paid"?"Reward sent":c.status}</p>
     <p>Submitted {new Date(c.submitted_at).toLocaleString()}</p>
     {c.status==="pending"&&<p>Review by {hostRewardDeadline(c.submitted_at)} (Pacific Time).</p>}
     {c.status==="approved"&&c.reviewed_at&&<p>Reward sent by {hostRewardDeadline(c.reviewed_at)} (Pacific Time).</p>}
     {c.reason&&<p>{c.reason}</p>}
     <Link href={"/discussion#comment-"+c.comment_id} className="underline">View experience</Link>
    </div>)}
    {!active&&meetups.map(m=><div key={m.matchId} className="mt-4 border-t pt-3 text-sm">
     <Link href={"/posts/"+m.id} className="font-bold underline">{m.place_name||m.location||"Meetup"} · {m.meeting_time.slice(0,10)}</Link>
     <p className="mt-1">{m.reason||"Both reviews confirm attendance. Ready for eligibility review."}</p>
     {m.reason&&<Link href={"/reviews/write/"+m.matchId} className="underline">View or write your review</Link>}
    </div>)}
    {!active&&!meetups.length&&<p className="mt-3 text-sm">Host a meetup in LA County between October 20 and November 30. After matching and completing both reviews, check back here.</p>}
    {!active&&compose&&data.phase==="open"&&data.approved+data.pending<10&&meetups.some(m=>!m.reason)&&<form onSubmit={submit} className="mt-5 space-y-4">
     <label className="block text-sm">Completed meetup<select required value={matchId} onChange={e=>setMatchId(e.target.value)} className="mt-2 block w-full border p-3"><option value="">Select your meetup</option>{meetups.filter(m=>!m.reason).map(m=><option key={m.matchId} value={m.matchId}>{m.place_name||m.location||"Meetup"} · {m.meeting_time.slice(0,10)}</option>)}</select></label>
     <label className="block text-sm">Your honest experience<textarea required maxLength={2000} rows={5} value={body} onChange={e=>setBody(e.target.value)} className="mt-2 block w-full border p-3" placeholder="What did you do? What worked well or could be improved? Do not include your guest’s private information."/></label>
     <p className="text-sm">Your public post will be labeled: “Reward program participant — I am applying for Neonadri’s $100 reward for completing a meetup and sharing my honest experience.” Positive feedback is not required.</p>
     <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} className="mt-1"/><span>I am a U.S. resident age 18+, hosted this meetup in LA County, and have not received this $100 reward before. This is my own real experience. I agree to the <Link href="/host-reward/rules" className="underline">Official Rules</Link>.</span></label>
     <button disabled={busy||!confirmed||!matchId||!body.trim()} className="border border-black bg-black px-5 py-3 font-bold text-white disabled:opacity-40" style={{color:"white"}}>{busy?"Submitting…":"Post & Submit Claim"}</button>
    </form>}
    {!active&&!compose&&data.phase==="open"&&meetups.some(m=>!m.reason)&&<Link href="/discussion?reward=host100#host-reward-claim" className="mt-4 inline-block border px-4 py-3 font-bold">Share Your Experience & Claim $100</Link>}
   </>}
  </>}
  <p className="mt-4 text-sm"><Link href="/host-reward" className="underline">How it works</Link> · <Link href="/host-reward/rules" className="underline">Official Rules</Link></p>
 </section>;
}

