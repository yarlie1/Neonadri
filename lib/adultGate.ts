type UserLike = {
  user_metadata?: Record<string, unknown> | null;
} | null | undefined;

export const ADULT_MEETUP_MUTATION_REQUIRED_MESSAGE =
  "Please confirm that you are 18 or older before creating, editing, or deleting meetups.";

export function isAdultConfirmedUser(user: UserLike) {
  return user?.user_metadata?.is_adult_confirmed === true;
}

export function getAdultGateRedirectPath(nextPath: string) {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/";

  return `/adult-check?next=${encodeURIComponent(safeNext)}`;
}
