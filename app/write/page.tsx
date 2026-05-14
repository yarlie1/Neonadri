import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import {
  getAdultGateRedirectPath,
  isAdultConfirmedUser,
} from "../../lib/adultGate";
import WriteForm from "./WriteForm";

export default async function WritePage({
  searchParams,
}: {
  searchParams?: { submit?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !isAdultConfirmedUser(user)) {
    const submitQuery = searchParams?.submit === "1" ? "?submit=1" : "";
    redirect(getAdultGateRedirectPath(`/write${submitQuery}`));
  }

  return <WriteForm userId={user?.id ?? null} />;
}
