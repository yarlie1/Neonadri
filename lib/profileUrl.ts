const RESERVED_PROFILE_USERNAMES = new Set([
  "account",
  "admin",
  "api",
  "beta",
  "chats",
  "community",
  "dashboard",
  "faq",
  "login",
  "logout",
  "map",
  "posts",
  "privacy",
  "profile",
  "reviews",
  "signup",
  "terms",
  "write",
]);

export function slugifyProfileUsername(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32)
    .replace(/-+$/g, "");
}

export function buildProfilePath({
  id,
  username,
}: {
  id: string | null | undefined;
  username?: string | null;
}) {
  const cleanUsername = slugifyProfileUsername(username);

  if (cleanUsername) {
    return `/@${cleanUsername}`;
  }

  return id ? `/profile/${id}` : "/profile";
}

export function getProfileUsernameBase(displayName: string | null | undefined, userId: string) {
  const slug = slugifyProfileUsername(displayName);
  const fallback = `user-${String(userId || "").replace(/-/g, "").slice(0, 10)}`;
  const base = slug || fallback;

  return RESERVED_PROFILE_USERNAMES.has(base) ? `user-${base}` : base;
}
