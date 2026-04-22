type UserLike = {
  user_metadata?: Record<string, unknown> | null;
} | null | undefined;

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
