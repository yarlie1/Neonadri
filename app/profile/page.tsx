import { redirect } from "next/navigation";
import { buildProfilePath } from "../../lib/profileUrl";
import { createClient } from "../../lib/supabase/server";

export default async function MyProfileRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  redirect(buildProfilePath({ id: user.id, username: profile?.username }));
}
