import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Welcome: {user.email}</p>
      {profile?.full_name ? <p>Name: {profile.full_name}</p> : null}
    </main>
  );
}
