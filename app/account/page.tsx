import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getPostingAccessStateForEmail } from "../../lib/postingAccess";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";
import BlockedUsersCard from "../components/BlockedUsersCard";
import PushNotificationButton from "../components/PushNotificationButton";
import EmailNotificationToggle from "./EmailNotificationToggle";

type Profile = {
  id: string;
  is_admin: boolean | null;
  signup_intent: "guest" | "host" | null;
  email_notifications_enabled: boolean | null;
};

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
    .select("id, is_admin, signup_intent, email_notifications_enabled")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Account profile load failed", error);
  }

  const profile = (data as Profile | null) ?? {
    id: user.id,
    is_admin: false,
    signup_intent: "guest" as const,
    email_notifications_enabled: true,
  };
  let postingAccessAllowed = false;
  let postingBetaRequired = true;

  try {
    const accessState = await getPostingAccessStateForEmail(
      supabase,
      user.email
    );
    postingAccessAllowed = accessState.postingAccessAllowed;
    postingBetaRequired = accessState.postingBetaRequired;
  } catch (error) {
    console.error("Account posting access check failed", error);
  }
  const postingAccessHref = user.email
    ? `/beta?email=${encodeURIComponent(user.email)}&next=/write`
    : "/beta?next=/write";

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-4xl space-y-4">
        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Account</div>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
            Identity and settings
          </h2>

          <div className={`mt-4 px-4 py-4 ${APP_SOFT_CARD_CLASS}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
              Account email
            </div>
            <div className="mt-2 text-sm font-medium text-[#52616a]">
              {user.email || "Not available"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/account/password"
              className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Change password
            </Link>
          </div>
        </section>

        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Notifications</div>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
            Request and match alerts
          </h2>
          <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
            Request and match alerts.
          </p>
          <div className={`mt-4 px-4 py-4 ${APP_SOFT_CARD_CLASS}`}>
            <PushNotificationButton variant="toggle" />
          </div>
          <div className={`mt-3 px-4 py-4 ${APP_SOFT_CARD_CLASS}`}>
            <EmailNotificationToggle
              initialEnabled={profile.email_notifications_enabled !== false}
            />
          </div>
        </section>

        {postingBetaRequired ? (
          <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
            <div className={APP_EYEBROW_CLASS}>Posting access</div>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
              {postingAccessAllowed
                ? "Beta tester posting is active"
                : "This account is in join-only mode"}
            </h2>
            <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
              {postingAccessAllowed
                ? "You can create meetups."
                : profile.signup_intent === "host"
                ? "Posting approval is not active yet."
                : "Join now. Apply to host later."}
            </p>

            <div className={`mt-4 px-4 py-4 ${APP_SOFT_CARD_CLASS}`}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                Signup path
              </div>
              <div className="mt-2 text-sm font-medium text-[#52616a]">
                {profile.signup_intent === "host"
                  ? "Host path"
                  : "Join path"}
              </div>
            </div>

            {!postingAccessAllowed ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={postingAccessHref}
                  className={`inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                >
                  Apply for posting access
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}

        {!!profile.is_admin ? (
          <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
            <div className={APP_EYEBROW_CLASS}>Admin tools</div>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
              Run admin tools
            </h2>
            <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
              Overview, reports, and beta.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/overview"
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Open admin overview
              </Link>
              <Link
                href="/admin/reports"
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Open admin reports
              </Link>
              <Link
                href="/admin/beta"
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Open beta applications
              </Link>
            </div>
          </section>
        ) : null}

        <BlockedUsersCard />

        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Account removal</div>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
            Delete this account
          </h2>
          <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
            Permanently remove this account.
          </p>
          <div className="mt-4">
            <Link
              href="/account/delete"
              className={`inline-flex rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Delete account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
