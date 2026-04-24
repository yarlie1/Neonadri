import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";
import BlockedUsersCard from "../components/BlockedUsersCard";

type Profile = {
  id: string;
  is_admin: boolean | null;
};

const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[32px] border border-[#dce5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#24323c] shadow-[0_24px_60px_rgba(118,126,133,0.14)] sm:px-8 sm:py-8";

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
    .select("id, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Account profile load failed", error);
  }

  const profile = (data as Profile | null) ?? {
    id: user.id,
    is_admin: false,
  };

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
              Account
            </div>
            <h1 className="mt-4 text-[30px] font-extrabold leading-[0.98] tracking-[-0.05em] text-[#22303a] sm:text-[34px]">
              Manage access.
            </h1>
            <p className={`mt-3 max-w-xl ${APP_BODY_TEXT_CLASS}`}>
              Update password, safety settings, and account tools here.
            </p>
          </div>
        </section>

        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Account</div>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
            Identity and settings
          </h2>

          <div className="mt-4 rounded-[24px] border border-[#e3e9ee] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
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

        {!!profile.is_admin ? (
          <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
            <div className={APP_EYEBROW_CLASS}>Admin tools</div>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
              Review safety reports
            </h2>
            <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
              Open the admin tools to review reports and beta access requests.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
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
            Open the final confirmation screen if you want to permanently remove this account.
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
