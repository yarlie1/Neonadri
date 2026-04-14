import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import EditMeetupForm from "./EditMeetupForm";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function EditMeetupPage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id, user_id, meeting_purpose, meeting_time, duration_minutes, location, place_name, latitude, longitude, target_gender, target_age_group, benefit_amount"
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !post) {
    notFound();
  }

  return (
    <EditMeetupForm
      postId={String(post.id)}
      userId={user.id}
      initialPost={post}
    />
  );
}
