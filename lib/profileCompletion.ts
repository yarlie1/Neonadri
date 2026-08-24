export type RequiredProfileFields = {
  display_name: string | null;
  gender: string | null;
  age_group: string | null;
  is_adult_confirmed: boolean | null;
};

export const PROFILE_COMPLETION_REQUIRED_MESSAGE =
  "Please complete your profile before requesting to join a meetup.";

export function isProfileComplete(profile: RequiredProfileFields | null) {
  return Boolean(
    profile?.display_name?.trim() &&
      profile?.gender?.trim() &&
      profile?.age_group?.trim() &&
      profile?.is_adult_confirmed === true
  );
}

export function getProfileCompletionPath(nextPath = "/") {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/";

  return `/profile/complete?next=${encodeURIComponent(safeNext)}`;
}
