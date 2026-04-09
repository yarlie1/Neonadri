import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import WriteForm from "./WriteForm";

export default async function WritePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <WriteForm userId={user.id} />;
}