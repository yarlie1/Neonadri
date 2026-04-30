import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export default async function AccountBetaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/account/beta")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/account");
  }

  redirect("/admin/beta");
}
