export const REPORT_REASON_OPTIONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "unsafe_behavior", label: "Unsafe behavior" },
  { value: "fake_or_misleading", label: "Fake or misleading" },
  { value: "bad_meetup_conduct", label: "Bad meetup conduct" },
  { value: "other", label: "Other" },
] as const;

export type ReportReason = (typeof REPORT_REASON_OPTIONS)[number]["value"];

type SupabaseLikeClient = {
  from: (table: string) => {
    select: (columns: string, options?: Record<string, unknown>) => any;
    insert?: (values: Record<string, unknown>) => any;
    update?: (values: Record<string, unknown>) => any;
    delete?: () => any;
  };
};

type BlockRelationRow = {
  user_id: string;
  blocked_user_id: string;
};

export async function isBlockedBetween(
  supabase: SupabaseLikeClient,
  firstUserId: string,
  secondUserId: string
) {
  const { count, error } = await supabase
    .from("blocked_users")
    .select("id", { head: true, count: "exact" })
    .or(
      `and(user_id.eq.${firstUserId},blocked_user_id.eq.${secondUserId}),and(user_id.eq.${secondUserId},blocked_user_id.eq.${firstUserId})`
    );

  if (error) {
    console.error("Blocked users lookup failed", error);
    return false;
  }

  return Number(count || 0) > 0;
}

export async function getBlockedUserIdsForViewer(
  supabase: SupabaseLikeClient,
  userId: string | null | undefined
) {
  if (!userId) return new Set<string>();

  const { data, error } = await supabase
    .from("blocked_users")
    .select("user_id, blocked_user_id")
    .or(`user_id.eq.${userId},blocked_user_id.eq.${userId}`);

  if (error) {
    console.error("Blocked users list lookup failed", error);
    return new Set<string>();
  }

  return new Set(
    ((data || []) as BlockRelationRow[]).flatMap((row) =>
      row.user_id === userId ? [row.blocked_user_id] : [row.user_id]
    )
  );
}
