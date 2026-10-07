"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
type Comment = {id:number;nickname:string;body:string;parent_id:number|null;hidden:boolean;created_at:string};
export default function DiscussionComments() {
 const [comments,setComments]=useState<Comment[]>([]);
 const [nickname,setNickname]=useState("");
 const [body,setBody]=useState("");
 const [website,setWebsite]=useState("");
 const [reply,setReply]=useState<Comment|null>(null);
 const [replyDrafts,setReplyDrafts]=useState<Record<number,string>>({});
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
 useEffect(()=>{if(reply) input.current?.focus();},[reply?.id]);
 async function submit(e:FormEvent, parent:Comment|null=null) {
  e.preventDefault(); if(busy) return;
  setBusy(true);setMessage("");setError("");
  try {
   const r=await fetch("/api/discussion",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nickname,body:parent ? replyDrafts[parent.id] || "" : body,parent_id:parent?.id ?? null,website})});
   const data=await r.json();
   if(!r.ok) throw Error(data.error);
   if(parent) {setReplyDrafts(old=>({...old,[parent.id]:""}));setReply(null);} else {setBody("");}
   setMessage(parent?"Your reply was posted.":"Your comment was posted. Thank you for sharing.");
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
 function composer(parent:Comment|null=null) {
  const id=parent ? "discussion-reply-"+parent.id : "discussion";
  const text=parent ? replyDrafts[parent.id] || "" : body;
  return <form onSubmit={e=>submit(e,parent)} className="mt-4 border border-[#cccccc] bg-white p-4">
   {parent && <p className="mb-3 text-xs text-[#666666]">Replying to {parent.nickname}</p>}
   <label htmlFor={id+"-name"} className="sr-only">Nickname</label>
   <input id={id+"-name"} required maxLength={40} disabled={busy} value={nickname} onChange={e=>setNickname(e.target.value)} className="w-full border border-[#cccccc] px-3 py-2 text-sm sm:max-w-xs" placeholder="Nickname"/>
   <label htmlFor={id+"-body"} className="sr-only">{parent?"Your reply":"Your thoughts"}</label>
   <textarea ref={parent?input:undefined} id={id+"-body"} required maxLength={2000} rows={3} disabled={busy} value={text} onChange={e=>{const value=e.target.value;parent?setReplyDrafts(old=>({...old,[parent.id]:value})):setBody(value);}} className="mt-3 block w-full resize-y border border-[#cccccc] p-3 text-sm" placeholder={parent?"Write a reply…":"Share your thoughts…"}/>
   <div aria-hidden="true" className="hidden"><label>Leave blank<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
   <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
    <span className="text-xs text-[#666666]">No login needed.</span>
    <div className="flex items-center gap-3">
     {parent && <button type="button" disabled={busy} onClick={()=>setReply(null)} className="text-sm underline">Cancel</button>}
     <button disabled={busy || !nickname.trim() || !text.trim()} className="bg-[#111111] px-4 py-2 text-sm font-bold text-white disabled:opacity-40" style={{color:"#fff"}}>{busy?"Please wait…":parent?"Post reply":"Post comment"}</button>
    </div>
   </div>
  </form>;
 }
 return <div className="mt-7">
  <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-bold">The conversation</h3><button disabled={loading || busy} onClick={()=>load()} className="text-sm underline disabled:opacity-40">Refresh</button></div>
  {composer()}
  <details className="mt-2 text-xs leading-5 text-[#666666]">
   <summary className="cursor-pointer">Comment guidelines</summary>
   <p className="mt-2">Comments are public. Nicknames are not verified accounts. Don’t impersonate others or share private contact details. Spam and abuse may be hidden. A privacy-preserving connection identifier is used to limit spam: one post per 60 seconds, up to 20 per day per connection.</p>
  </details>
  <p role="status" className="mt-3 text-sm">{message}</p>
  {error && <p role="alert" className="mt-3 text-sm text-red-700">{error} <button onClick={()=>load()} className="underline">Reload comments</button></p>}
  <p className="mt-5 text-xs text-[#666666]">Newest first</p>
  {!loading && !error && comments.length===0 && <p className="py-8 text-[#666666]">No comments yet. Be the first to share a thought.</p>}
  <div className="mt-4 divide-y divide-[#dddddd]">{comments.map(c=><article key={c.id} id={"comment-"+c.id} className="py-6">
   <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-bold">{c.nickname}</span><span className="text-xs text-[#666666]">#{c.id} · {new Date(c.created_at).toLocaleString()}</span>{c.hidden && admin && <span className="text-xs">Hidden from public</span>}</div>
   {c.parent_id && <p className="mt-2 text-xs text-[#666666]">Reply to comment #{c.parent_id}</p>}
   <p className="mt-3 whitespace-pre-wrap break-words leading-7">{c.hidden && !admin?"This comment was hidden by a moderator.":c.body}</p>
   {!c.hidden && <button disabled={busy} aria-expanded={reply?.id===c.id} aria-controls={"reply-form-"+c.id} className="mt-3 text-sm underline underline-offset-4" onClick={()=>setReply(reply?.id===c.id?null:c)}>Reply</button>}
   {admin && <button disabled={busy} className="ml-5 mt-3 text-sm underline" onClick={()=>moderate(c)}>{c.hidden?"Restore":"Hide"}</button>}
   {reply?.id===c.id && !c.hidden && <div id={"reply-form-"+c.id}>{composer(c)}</div>}
  </article>)}</div>
  {loading && <p role="status" className="py-5 text-sm">Loading comments…</p>}
  {cursor && <button disabled={loading} onClick={()=>load(cursor)} className="mt-5 rounded-lg border px-5 py-3 text-sm">Load older comments</button>}
 </div>;
}
