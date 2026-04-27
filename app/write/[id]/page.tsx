import { notFound, redirect } from "next/navigation";
import {
  getAdultGateRedirectPath,
  isAdultConfirmedUser,
} from "../../../lib/adultGate";
import { getOwnedPostEditLockState } from "../../../lib/postEditAccess";
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

  if (!isAdultConfirmedUser(user)) {
    redirect(getAdultGateRedirectPath(`/write/${params.id}`));
  }

  const postId = Number(params.id);
  if (!Number.isFinite(postId)) {
    notFound();
  }

  const editAccessState = await getOwnedPostEditLockState(
    supabase,
    postId,
    user.id
  );

  if (!editAccessState.found || !editAccessState.owned) {
    notFound();
  }

  if (editAccessState.verificationFailed) {
    redirect(`/posts/${postId}`);
  }

  if (editAccessState.locked) {
    redirect(`/posts/${postId}`);
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id, user_id, meeting_purpose, meeting_time, duration_minutes, location, place_name, latitude, longitude, target_gender, target_age_group, benefit_amount"
    )
    .eq("id", postId)
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
