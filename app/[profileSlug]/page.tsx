import { notFound } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { ProfilePageContent } from "../profile/[id]/ProfilePageContent";

type PageProps = {
  params: {
    profileSlug: string;
  };
};

export default async function PublicProfileSlugPage({ params }: PageProps) {
  const rawSlug = decodeURIComponent(params.profileSlug || "");

  if (!rawSlug.startsWith("@")) {
    notFound();
  }

  const username = rawSlug.slice(1).trim().toLowerCase();

  if (!username) {
    notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error || !data?.id) {
    notFound();
  }

  return <ProfilePageContent params={{ id: data.id }} />;
}
