import { redirect } from "next/navigation";
import { getUserMetadataDisplayName } from "../../../lib/displayName";
import { isProfileComplete } from "../../../lib/profileCompletion";
import { createClient } from "../../../lib/supabase/server";
import {
  APP_BODY_TEXT_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";
import CompleteProfileForm from "./CompleteProfileForm";

function getSafeNextPath(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const supabase = await createClient();
  const nextPath = getSafeNextPath(searchParams?.next);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/profile/complete?next=${encodeURIComponent(nextPath)}`
      )}`
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, gender, age_group, is_adult_confirmed")
    .eq("id", user.id)
    .maybeSingle();

  if (isProfileComplete(profile)) {
    redirect(nextPath);
  }

  const initialDisplayName =
    profile?.display_name || getUserMetadataDisplayName(user.user_metadata);

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-2xl">
        <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
          <div className={`inline-flex items-center rounded-[8px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}>
            Required
          </div>
          <div className={APP_EYEBROW_CLASS + " mt-5"}>Profile completion</div>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
            Complete your profile
          </h1>
          <p className={`mt-3 ${APP_BODY_TEXT_CLASS}`}>
            Display name, gender, age group, and 18+ confirmation are required before you can request to join a meetup.
          </p>

          <CompleteProfileForm
            initialDisplayName={initialDisplayName}
            initialGender={profile?.gender || ""}
            initialAgeGroup={profile?.age_group || ""}
            initialAdultConfirmed={profile?.is_adult_confirmed === true}
            nextPath={nextPath}
          />
        </section>
      </div>
    </main>
  );
}
