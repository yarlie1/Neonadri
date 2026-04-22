import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import AdminReportsClient from "./AdminReportsClient";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return <AdminReportsClient />;
}
