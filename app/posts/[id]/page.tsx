import { createClient } from "../../../lib/supabase/server";
import ClientMap from "./ClientMap";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id, title, content, created_at, user_id, location, meeting_time, target_gender, target_age_group, meeting_purpose, payment_amount, latitude, longitude"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !post) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text