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
  searchParams?: { submit?: string; campaign?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const campaign = searchParams?.campaign === "launch10" ? "launch10" : "";
  const writeParams = new URLSearchParams();
  if (searchParams?.submit === "1") writeParams.set("submit", "1");
  if (campaign) writeParams.set("campaign", campaign);
  const writePath = `/write${writeParams.toString() ? `?${writeParams.toString()}` : ""}`;

  if (user && !(await isAdultConfirmedUser(supabase, user.id))) {
    redirect(getAdultGateRedirectPath(writePath));
  }

  return <WriteForm userId={user?.id ?? null} campaign={campaign} />;
}
