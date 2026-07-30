export const ADULT_MEETUP_MUTATION_REQUIRED_MESSAGE =
  "Please confirm that you are 18 or older before creating, editing, or deleting meetups.";

export async function isAdultConfirmedUser(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_adult_confirmed")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Adult confirmation lookup failed", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId,
    });
    return false;
  }

  return data?.is_adult_confirmed === true;
}

export function getAdultGateRedirectPath(nextPath: string) {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/";

  return `/adult-check?next=${encodeURIComponent(safeNext)}`;
}
