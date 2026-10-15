"use client";
import { createPortal } from "react-dom";
import { orderDiscussion } from "../../lib/discussion-thread";
import { useEffect, useRef, useState, type FormEvent } from "react";
type Comment = {id:number;nickname:string;body:string;parent_id:number|null;hidden:boolean;created_at:string;deleted_at:string|null};
export default function DiscussionComments() {
 const [deleteTokens,setDeleteTokens]=useState<Record<string,string>>({});
 const [storageWarning,setStorageWarning]=useState("");
 useEffect(()=>{
  try {
   const saved=JSON.parse(localStorage.getItem("neonadri-discussion-delete") || "{}");
   if(saved && typeof saved==="object" && !Array.isArray(saved))
    setDeleteTokens(Object.fromEntries(Object.entries(saved).filter((entry): entry is [string,string]=>/^\d+$/.test(entry[0]) && typeof entry[1]==="string" && /^[a-f0-9]{64}$/.test(entry[1]))));
  } catch {setStorageWarning("Browser storage is unavailable. Deletion access may be lost when you leave this page.");}
 },[]);
 const [comments,setComments]=useState<Comment[]>([]);
 const [topContainer,setTopContainer]=useState<HTMLElement|null>(null);
 const [topBody,setTopBody]=useState("");
 const [activeComposer,setActiveComposer]=useState("discussion");
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
   const merged=new Map<number,Comment>((before?comments:[]).map(c=>[c.id,c]));
   let pageCursor=before;
   let nextCursor:number|null=null;
   let isAdmin=false;
   // Include older pages when needed so a reply never appears without its parent.
   do {
    const r=await fetch("/api/discussion"+(pageCursor?"?before="+pageCursor:""),{cache:"no-store"});
    const data=await r.json();
    if(!r.ok) throw Error(data.error);
    for(const c of data.comments as Comment[]) merged.set(c.id,c);
    isAdmin=data.admin;nextCursor=data.nextCursor;
    const missingParent=Array.from(merged.values()).some(c=>c.parent_id!==null && !merged.has(c.parent_id));
    if(!missingParent || !nextCursor || nextCursor===pageCursor) break;
    pageCursor=nextCursor;
   } while(true);
   setComments(Array.from(merged.values()));
   setAdmin(isAdmin);setCursor(nextCursor);
  } catch(e) {setError(e instanceof Error?e.message:"Could not load comments.");}
  finally {setLoading(false);}
 }
 useEffect(()=>{setTopContainer(document.getElementById("discussion-top-composer"));void load();},[]);
 useEffect(()=>{if(reply) input.current?.focus();},[reply?.id]);
 async function submit(e:FormEvent, parent:Comment|null=null, top=false) {
  e.preventDefault(); if(busy) return;
  setActiveComposer(parent?"discussion-reply-"+parent.id:top?"discussion-top":"discussion");
  setBusy(true);setMessage("");setError("");
  try {
   const r=await fetch("/api/discussion",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nickname:"Anonymous",body:parent ? replyDrafts[parent.id] || "" : top ? topBody : body,parent_id:parent?.id ?? null,website})});
   const data=await r.json();
   if(!r.ok) throw Error(data.error);
   if(data.deleteToken) {
    setDeleteTokens(old=>({...old,[data.id]:data.deleteToken}));
    try {
     const saved=JSON.parse(localStorage.getItem("neonadri-discussion-delete") || "{}");
     localStorage.setItem("neonadri-discussion-delete",JSON.stringify({...saved,[data.id]:data.deleteToken}));
    } catch {setStorageWarning("Your comment was posted, but deletion access could not be saved. Keep this page open to delete it.");}
   }
   if(parent) {setReplyDrafts(old=>({...old,[parent.id]:""}));setReply(null);} else if(top) {setTopBody("");} else {setBody("");}
   setMessage(parent?"Your reply was posted.":"Your comment was posted. Thank you for sharing.");
   await load();
  } catch(e) {setError(e instanceof Error?e.message:"Could not post comment.");}
  finally {setBusy(false);}
 }
 async function removeComment(c:Comment) {
  if(busy || !window.confirm("Delete your comment? This cannot be undone. Replies will remain.")) return;
  setBusy(true);setError("");
  try {
   const r=await fetch("/api/discussion",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:c.id,deleteToken:deleteTokens[c.id]})});
   const data=await r.json();if(!r.ok) throw Error(data.error);
   setComments(old=>old.map(row=>row.id===c.id?{...row,body:"",hidden:true,deleted_at:new Date().toISOString()}:row));
   if(reply?.id===c.id) setReply(null);
  } catch(e) {setError(e instanceof Error?e.message:"Could not delete comment.");}
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
 function composer(parent:Comment|null=null, top=false) {
  const id=parent ? "discussion-reply-"+parent.id : top ? "discussion-top" : "discussion";
  const text=parent ? replyDrafts[parent.id] || "" : top ? topBody : body;
  return <form onSubmit={e=>submit(e,parent,top)} className="mt-4">
   {parent && <p className="mb-2 text-xs text-[#666666]">Replying to #{parent.id}</p>}
   <div className="flex items-stretch gap-2">
    <label htmlFor={id+"-body"} className="sr-only">{parent?"Your reply":"Your thoughts"}</label>
    <textarea ref={parent?input:undefined} id={id+"-body"} required maxLength={2000} rows={3} disabled={busy} value={text} onChange={e=>{const value=e.target.value;parent?setReplyDrafts(old=>({...old,[parent.id]:value})):top?setTopBody(value):setBody(value);}} className="block min-w-0 flex-1 resize-y border border-[#cccccc] bg-white p-3 text-sm" placeholder={parent?"Write a reply…":"Share your thoughts…"}/>
    <button disabled={busy || !text.trim()} className="shrink-0 border border-[#111111] bg-[#111111] px-3 py-2 text-sm font-bold text-white disabled:opacity-40 sm:px-5" style={{color:"#fff"}}>{busy && activeComposer===id?"Posting…":"Post"}</button>
   </div>
   <div aria-hidden="true" className="hidden"><label>Leave blank<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
   {parent && <button type="button" disabled={busy} onClick={()=>setReply(null)} className="mt-2 text-xs underline">Cancel reply</button>}
   {activeComposer===id && message && <p role="status" className="mt-2 text-sm">{message}</p>}
   {activeComposer===id && error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </form>;
 }
 const visibleComments=orderDiscussion(comments);
 return <div className="mt-7">
  {topContainer && createPortal(composer(null,true),topContainer)}
  <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-bold">The conversation</h3><button disabled={loading || busy} onClick={()=>load()} className="text-sm underline disabled:opacity-40">Refresh</button></div>
  {error && !busy && <p role="alert" className="mt-3 text-sm text-red-700">{error} <button onClick={()=>load()} className="underline">Reload comments</button></p>}
  <p className="mt-5 text-xs text-[#666666]">Newest conversations first</p>
  {!loading && !error && visibleComments.length===0 && <p className="py-8 text-[#666666]">No comments yet. Be the first to share a thought.</p>}
  <div className="mt-4">{visibleComments.map(({comment:c,depth})=><article key={c.id} id={"comment-"+c.id} className={"border-t border-[#dddddd] py-6"+(depth?" border-l pl-4":"")} style={{marginLeft:Math.min(depth,3)*16}}>
   <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-bold">#{c.id}</span><time dateTime={c.created_at} className="text-xs text-[#666666]">{new Date(c.created_at).toLocaleString()}</time>{c.hidden && !c.deleted_at && admin && <span className="text-xs">Hidden from public</span>}</div>
   <p className="mt-3 whitespace-pre-wrap break-words leading-7">{c.hidden && !admin?"This comment was hidden by a moderator.":c.body}</p>
   {!c.hidden && <button disabled={busy} aria-expanded={reply?.id===c.id} aria-controls={"reply-form-"+c.id} className="mt-3 text-sm underline underline-offset-4" onClick={()=>setReply(reply?.id===c.id?null:c)}>Reply</button>}
   {!c.deleted_at && deleteTokens[c.id] && <button disabled={busy} className="ml-5 mt-3 text-sm underline" onClick={()=>removeComment(c)}>Delete</button>}
   {admin && !c.deleted_at && <button disabled={busy} className="ml-5 mt-3 text-sm underline" onClick={()=>moderate(c)}>{c.hidden?"Restore":"Hide"}</button>}
   {reply?.id===c.id && !c.hidden && <div id={"reply-form-"+c.id}>{composer(c)}</div>}
  </article>)}</div>
  {loading && <p role="status" className="py-5 text-sm">Loading comments…</p>}
  {cursor && <button disabled={loading} onClick={()=>load(cursor)} className="mt-5 rounded-lg border px-5 py-3 text-sm">Load older comments</button>}
  {composer()}
  {storageWarning && <p role="status" className="mt-2 text-xs">{storageWarning}</p>}
  <details className="mt-2 text-xs leading-5 text-[#666666]">
   <summary className="cursor-pointer">Comment guidelines</summary>
   <p className="mt-2">You can delete new comments from the browser where you posted them. Clearing browser data removes this access. Comments are public. Comments are identified by number and date. Don’t impersonate others or share private contact details. Spam and abuse may be hidden. A privacy-preserving connection identifier is used to limit spam: one post per 60 seconds, up to 20 per day per connection.</p>
  </details>
 </div>;
}
