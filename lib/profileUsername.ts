import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileUsernameBase } from "./profileUrl";

const USERNAME_COLLISION_LIMIT = 100;

export async function generateUniqueProfileUsername(
  supabase: SupabaseClient,
  displayName: string | null | undefined,
  userId: string
) {
  const base = getProfileUsernameBase(displayName, userId);

  for (let index = 0; index < USERNAME_COLLISION_LIMIT; index += 1) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const candidate = `${base}${suffix}`.slice(0, 40).replace(/-+$/g, "");

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .neq("id", userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }
  }

  return `user-${userId.replace(/-/g, "").slice(0, 12)}`;
}
