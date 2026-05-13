import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import {
  APP_BODY_TEXT_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
} from "../../designSystem";
import AccountPasswordForm from "../AccountPasswordForm";

const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[24px] border border-[#dce5eb] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(246,249,251,0.99)_100%)] px-6 py-7 text-[#24323c] shadow-[0_24px_48px_rgba(118,126,133,0.1),inset_0_1px_0_rgba(255,255,255,1)] sm:px-8 sm:py-8";

export default async function AccountPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-3xl space-y-4">
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
              Change password.
            </h1>
            <p className={`mt-3 max-w-xl ${APP_BODY_TEXT_CLASS}`}>
              Update your sign-in password here.
            </p>
          </div>
        </section>

        <AccountPasswordForm />
      </div>
    </main>
  );
}
