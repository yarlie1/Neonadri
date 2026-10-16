import {redirect} from "next/navigation";
import {createClient} from "../../../lib/supabase/server";
import HostRewardAdmin from "./HostRewardAdmin";
export default async function Page(){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/login?next=/admin/host-reward");
 const {data:profile}=await db.from("profiles").select("is_admin").eq("id",user.id).maybeSingle();
 if(!profile?.is_admin)redirect("/");
 return <main className="mx-auto max-w-5xl px-5 py-10"><h1 className="text-3xl font-bold">$100 Host Reward claims</h1><p className="mt-3">Review in receipt order. Verify U.S. residency, LA County location, real experience and one reward per person. Never reject based on rating or negative sentiment.</p><HostRewardAdmin/></main>;
}

