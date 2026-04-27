export const MEETUP_EDIT_LOCKED_MESSAGE =
  "This meetup already has requests or a match, so it can no longer be edited. Cancel it instead.";
export const CANCELLED_MEETUP_EDIT_MESSAGE =
  "This meetup was cancelled and can no longer be edited.";

type SupabaseQueryClient = {
  from: (table: string) => {
    select: (columns: string, options?: Record<string, unknown>) => any;
  };
};

export async function getOwnedPostEditLockState(
  supabase: SupabaseQueryClient,
  postId: number,
  userId: string
) {
  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select("id, user_id, status")
    .eq("id", postId)
    .maybeSingle();

  if (postError || !postData) {
    return {
      found: false,
      owned: false,
      locked: false,
      verificationFailed: false,
      post: null,
      errorMessage: "Meetup not found.",
    };
  }

  if (postData.user_id !== userId) {
    return {
      found: true,
      owned: false,
      locked: false,
      verificationFailed: false,
      post: postData,
      errorMessage: "Only the host can edit this meetup.",
    };
  }

  if (String(postData.status || "open").toLowerCase() === "cancelled") {
    return {
      found: true,
      owned: true,
      locked: true,
      verificationFailed: false,
      post: postData,
      errorMessage: CANCELLED_MEETUP_EDIT_MESSAGE,
    };
  }

  const [{ count: requestCount, error: requestError }, { count: matchCount, error: matchError }] =
    await Promise.all([
      supabase
        .from("match_requests")
        .select("id", { count: "exact", head: true })
        .eq("post_id", postId),
      supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("post_id", postId),
    ]);

  if (requestError || matchError) {
    return {
      found: true,
      owned: true,
      locked: false,
      verificationFailed: true,
      post: postData,
      errorMessage: "We couldn't verify this meetup right now.",
    };
  }

  if ((requestCount || 0) > 0 || (matchCount || 0) > 0) {
    return {
      found: true,
      owned: true,
      locked: true,
      verificationFailed: false,
      post: postData,
      errorMessage: MEETUP_EDIT_LOCKED_MESSAGE,
    };
  }

  return {
    found: true,
    owned: true,
    locked: false,
    verificationFailed: false,
    post: postData,
    errorMessage: null,
  };
}
