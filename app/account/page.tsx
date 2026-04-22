import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";
import BlockedUsersCard from "../components/BlockedUsersCard";

type Profile = {
  id: string;
  display_name: string | null;
  about_me: string | null;
  interests: string[] | null;
  response_time_note: string | null;
  is_admin: boolean | null;
};

const SURFACE_CARD_CLASS = APP_SURFACE_CARD_CLASS;
const SOFT_CARD_CLASS = APP_SOFT_CARD_CLASS;
const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[32px] border border-[#dce5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#24323c] shadow-[0_24px_60px_rgba(118,126,133,0.14)] sm:px-8 sm:py-9";

function summarizeAbout(text: string | null) {
  const normalized = text?.replace(/\s+/g, " ").trim() || "";
  if (!normalized) return "Add a short intro so people know your pace.";
  if (normalized.length <= 110) return normalized;
  return `${normalized.slice(0, 107).trimEnd()}...`;
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, about_me, interests, response_time_note, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Account profile load failed", error);
  }

  let profile = (data as Profile | null) ?? null;

  if (!profile) {
    const fallbackProfile: Profile = {
      id: user.id,
      display_name: "",
      about_me: "",
      interests: [],
      response_time_note: "",
      is_admin: false,
    };

    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .upsert(fallbackProfile)
      .select("id, display_name, about_me, interests, response_time_note, is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (insertError) {
      console.error("Account profile create failed", insertError);
      profile = fallbackProfile;
    } else {
      profile = (insertedProfile as Profile | null) ?? fallbackProfile;
    }
  }

  const displayName = profile.display_name?.trim() || "Your public profile";
  const aboutSummary = summarizeAbout(profile.about_me || null);
  const interestSummary =
    profile.interests && profile.interests.length > 0
      ? `${profile.interests.length} selected`
      : "No interests added yet";
  const responseNote = profile.response_time_note?.trim() || "No response note yet";
  const isAdmin = !!profile.is_admin;

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-4xl space-y-4">
        <section className={HERO_SURFACE_CLASS}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#d6e0e6]/45 blur-2xl" />
          <div className="relative">
            <div
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}
            >
              Account & safety
            </div>
            <h1 className="mt-4 text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#22303a] sm:text-[40px]">
              Manage your account without touching your public layout.
            </h1>
            <p className={`mt-3 max-w-2xl sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
              Use this page for account details, safety tools, and admin access.
              Edit your public profile on its own page so the public-facing version
              stays easy to review.
            </p>
          </div>
        </section>

        <section className={`${SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Public profile</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#24323c]">
            Public profile shortcut
          </h2>
          <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
            Your public profile is what other people see before they send a request.
            Review it here, then jump into the dedicated edit page when you want to
            change how it reads.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className={`${SOFT_CARD_CLASS} p-4`}>
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}
              >
                Display name
              </div>
              <div className="mt-2 text-sm font-medium text-[#52616a]">
                {displayName}
              </div>
            </div>
            <div className={`${SOFT_CARD_CLASS} p-4`}>
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}
              >
                About
              </div>
              <div className="mt-2 text-sm font-medium text-[#52616a]">
                {aboutSummary}
              </div>
            </div>
            <div className={`${SOFT_CARD_CLASS} p-4`}>
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}
              >
                Interests
              </div>
              <div className="mt-2 text-sm font-medium text-[#52616a]">
                {interestSummary}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#eef4f7_100%)] px-4 py-3">
            <div
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}
            >
              Response note
            </div>
            <div className="mt-2 text-sm text-[#52616a]">{responseNote}</div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/profile/${user.id}`}
              className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              View public profile
            </Link>
            <Link
              href={`/profile/${user.id}/edit`}
              className={`rounded-full border px-5 py-3 text-sm font-medium transition ${APP_BUTTON_PRIMARY_CLASS}`}
            >
              Edit public profile
            </Link>
          </div>
        </section>

        <section className={`${SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Account</div>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
            Identity and access
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className={`${SOFT_CARD_CLASS} p-4`}>
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}
              >
                Account email
              </div>
              <div className="mt-2 text-sm font-medium text-[#52616a]">
                {user.email || "Not available"}
              </div>
            </div>
            <div className={`${SOFT_CARD_CLASS} p-4`}>
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}
              >
                Account id
              </div>
              <div className="mt-2 break-all text-sm font-medium text-[#52616a]">
                {user.id}
              </div>
            </div>
          </div>
        </section>

        {isAdmin ? (
          <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
            <div className={APP_EYEBROW_CLASS}>Admin tools</div>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
              Review safety reports
            </h2>
            <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
              Open the admin reports queue to review new reports, update status,
              and jump to the affected target.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/reports"
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Open admin reports
              </Link>
            </div>
          </section>
        ) : null}

        <BlockedUsersCard />
      </div>
    </main>
  );
}
