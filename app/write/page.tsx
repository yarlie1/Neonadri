import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import {
  getAdultGateRedirectPath,
  isAdultConfirmedUser,
} from "../../lib/adultGate";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";
import {
  isPostingAccessAllowedForEmail,
  POSTING_ACCESS_ERROR_MESSAGE,
} from "../../lib/postingAccess";
import WriteForm from "./WriteForm";

export default async function WritePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdultConfirmedUser(user)) {
    redirect(getAdultGateRedirectPath("/write"));
  }

  let postingAccessAllowed = false;

  try {
    postingAccessAllowed = await isPostingAccessAllowedForEmail(
      supabase,
      user.email
    );
  } catch (error) {
    console.error("Write page posting access check failed", error);
  }

  if (!postingAccessAllowed) {
    const betaHref = user.email
      ? `/beta?email=${encodeURIComponent(user.email)}&next=/write`
      : "/beta?next=/write";

    return (
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
        <div className="mx-auto max-w-3xl">
          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            <div
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}
            >
              Posting access
            </div>
            <div className={APP_EYEBROW_CLASS + " mt-5"}>Create meetup</div>
            <h1 className="mt-2 text-[32px] font-black leading-[0.98] tracking-[-0.05em] text-[#24323f] sm:text-[38px]">
              Posting is limited to beta testers right now.
            </h1>
            <p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
              You can browse and join meetups with your current account, but
              creating a meetup during beta still needs posting approval.
            </p>
            <p className="mt-4 rounded-[20px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
              {POSTING_ACCESS_ERROR_MESSAGE}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={betaHref}
                className={`inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_PRIMARY_CLASS}`}
              >
                Apply for posting access
              </Link>
              <Link
                href="/"
                className={`inline-flex items-center rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Back to home
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return <WriteForm userId={user.id} />;
}
