"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
type Comment = {id:number;nickname:string;body:string;parent_id:number|null;hidden:boolean;created_at:string};
export default function DiscussionComments() {
 const [comments,setComments]=useState<Comment[]>([]);
 const [nickname,setNickname]=useState("");
 const [body,setBody]=useState("");
 const [website,setWebsite]=useState("");
 const [reply,setReply]=useState<Comment|null>(null);
 const [admin,setAdmin]=useState(false);
 const [cursor,setCursor]=useState<number|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const input=useRef<HTMLTextAreaElement>(null);
 async function load(before?:number) {
  setLoading(true); setError("");
  try {
   const r=await fetch("/api/discussion"+(before?"?before="+before:""),{cache:"no-store"});
   const data=await r.json();
   if(!r.ok) throw Error(data.error);
   setComments(old=>before ? [...old,...data.comments.filter((c:Comment)=>!old.some(o=>o.id===c.id))] : data.comments);
   setAdmin(data.admin); setCursor(data.nextCursor);
  } catch(e) {setError(e instanceof Error?e.message:"Could not load comments.");}
  finally {setLoading(false);}
 }
 useEffect(()=>{void load();},[]);
 async function submit(e:FormEvent) {
  e.preventDefault(); if(busy) return;
  setBusy(true);setMessage("");setError("");
  try {
   const r=await fetch("/api/discussion",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nickname,body,parent_id:reply?.id ?? null,website})});
   const data=await r.json();
   if(!r.ok) throw Error(data.error);
   setBody("");setReply(null);setMessage("Your comment was posted. Thank you for sharing.");
   await load();
  } catch(e) {setError(e instanceof Error?e.message:"Could not post comment.");}
  finally {setBusy(false);}
 }
 async function moderate(c:Comment) {
  if(!window.confirm(c.hidden?"Restore this comment?":"Hide this comment from public view?")) return;
  setBusy(true);setError("");
  try {
   const r=await fetch("/api/discussion",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:c.id,hidden:!c.hidden})});
   const data=await r.json(); if(!r.ok) throw Error(data.error);
   setComments(old=>old.map(row=>row.id===c.id?{...row,hidden:!c.hidden}:row));
  } catch(e) {setError(e instanceof Error?e.message:"Could not update comment.");}
  finally {setBusy(false);}
 }
 return <div className="mt-7">
  <form onSubmit={submit} className="rounded-xl border border-[#cccccc] p-5 sm:p-6">
   <label className="block text-sm font-bold" htmlFor="discussion-name">Nickname</label>
   <input id="discussion-name" required maxLength={40} value={nickname} onChange={e=>setNickname(e.target.value)} className="mt-2 w-full rounded-lg border border-[#aaaaaa] p-3 sm:max-w-xs" placeholder="How should we call you?"/>
   <p className="mt-2 text-xs leading-5 text-[#666666]">Nicknames are not verified accounts. Don’t impersonate others or share private contact details.</p>
   {reply && <div className="mt-4 rounded-lg bg-[#f4f4f4] p-3 text-sm">Replying to {reply.nickname} (#{reply.id}) <button type="button" onClick={()=>setReply(null)} className="ml-3 underline">Cancel reply</button></div>}
   <label className="mt-5 block text-sm font-bold" htmlFor="discussion-body">{reply?"Your reply":"Your thoughts"}</label>
   <textarea ref={input} id="discussion-body" required maxLength={2000} rows={5} value={body} onChange={e=>setBody(e.target.value)} className="mt-2 w-full rounded-lg border border-[#aaaaaa] p-3" placeholder="What would make a simple meetup work for you?"/>
   <div aria-hidden="true" className="hidden"><label>Leave blank<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
   <p className="mt-2 text-xs leading-5 text-[#666666]">Comments are public. Be respectful; spam and abuse may be hidden. A privacy-preserving connection identifier is used to limit spam. Please wait 60 seconds between posts; maximum 20 per day per connection.</p>
   <button disabled={busy || !nickname.trim() || !body.trim()} className="mt-4 rounded-lg bg-[#111111] px-6 py-3 font-bold text-white disabled:opacity-40" style={{color:"#fff"}}>{busy?"Please wait…":reply?"Post reply":"Post comment"}</button>
  </form>
  <p role="status" className="mt-3 text-sm">{message}</p>
  {error && <p role="alert" className="mt-3 text-sm text-red-700">{error} <button onClick={()=>load()} className="underline">Reload comments</button></p>}
  <div className="mt-8 flex items-center justify-between"><h3 className="text-xl font-bold">The conversation</h3><button disabled={loading} onClick={()=>load()} className="text-sm underline disabled:opacity-40">Refresh</button></div>
  <p className="mt-1 text-xs text-[#666666]">Newest first</p>
  {!loading && !error && comments.length===0 && <p className="py-8 text-[#666666]">No comments yet. Be the first to share a thought.</p>}
  <div className="mt-4 divide-y divide-[#dddddd]">{comments.map(c=><article key={c.id} id={"comment-"+c.id} className="py-6">
   <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-bold">{c.nickname}</span><span className="text-xs text-[#666666]">#{c.id} · {new Date(c.created_at).toLocaleString()}</span>{c.hidden && admin && <span className="text-xs">Hidden from public</span>}</div>
   {c.parent_id && <p className="mt-2 text-xs text-[#666666]">Reply to comment #{c.parent_id}</p>}
   <p className="mt-3 whitespace-pre-wrap break-words leading-7">{c.hidden && !admin?"This comment was hidden by a moderator.":c.body}</p>
   {!c.hidden && <button className="mt-3 text-sm underline underline-offset-4" onClick={()=>{setReply(c);input.current?.focus();input.current?.scrollIntoView({behavior:"smooth",block:"center"});}}>Reply</button>}
   {admin && <button disabled={busy} className="ml-5 mt-3 text-sm underline" onClick={()=>moderate(c)}>{c.hidden?"Restore":"Hide"}</button>}
  </article>)}</div>
  {loading && <p role="status" className="py-5 text-sm">Loading comments…</p>}
  {cursor && <button disabled={loading} onClick={()=>load(cursor)} className="mt-5 rounded-lg border px-5 py-3 text-sm">Load older comments</button>}
 </div>;
}
