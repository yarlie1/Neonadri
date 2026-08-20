import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import {
  APP_BODY_TEXT_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
} from "../../designSystem";
import AccountDeletePanel from "../AccountDeletePanel";

const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[8px] border border-[#111111] bg-white px-6 py-7 text-[#111111] shadow-none sm:px-8 sm:py-8";

export default async function AccountDeletePage() {
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
        <section className={HERO_SURFACE_CLASS}>          <div className="relative">
            <div
              className={`inline-flex items-center rounded-[8px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}
            >
              Account
            </div>
            <h1 className="mt-4 text-[30px] font-extrabold leading-[0.98] tracking-[-0.05em] text-[#22303a] sm:text-[34px]">
              Delete account.
            </h1>
            <p className={`mt-3 max-w-xl ${APP_BODY_TEXT_CLASS}`}>
              Review the removal warning before continuing.
            </p>
          </div>
        </section>

        <AccountDeletePanel />
      </div>
    </main>
  );
}
