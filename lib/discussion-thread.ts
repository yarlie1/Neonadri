type ThreadComment = {id:number;parent_id:number|null;deleted_at:string|null};

export function orderDiscussion<T extends ThreadComment>(comments:T[]) {
 const byId=new Map(comments.map(c=>[c.id,c]));
 const children=new Map<number,T[]>();
 const roots:T[]=[];
 for(const c of Array.from(byId.values())) {
  if(c.parent_id!==null && byId.has(c.parent_id)) {
   const siblings=children.get(c.parent_id)||[];
   siblings.push(c);children.set(c.parent_id,siblings);
  } else roots.push(c);
 }
 roots.sort((a,b)=>b.id-a.id);
 for(const siblings of Array.from(children.values())) siblings.sort((a,b)=>a.id-b.id);
 const stack=roots.map(comment=>({comment,depth:0})).reverse();
 const ordered:{comment:T;depth:number}[]=[];
 const seen=new Set<number>();
 while(stack.length) {
  const item=stack.pop()!;
  if(seen.has(item.comment.id)) continue;
  seen.add(item.comment.id);
  if(!item.comment.deleted_at) ordered.push(item);
  const depth=item.depth+(item.comment.deleted_at?0:1);
  const replies=children.get(item.comment.id)||[];
  for(let i=replies.length-1;i>=0;i--) stack.push({comment:replies[i],depth});
 }
 return ordered;
}
