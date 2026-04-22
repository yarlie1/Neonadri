import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import {
  APP_BODY_TEXT_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";
import AdultCheckForm from "./AdultCheckForm";
import { isAdultConfirmedUser } from "../../lib/adultGate";

export default async function AdultCheckPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nextPath =
    searchParams?.next && searchParams.next.startsWith("/") && !searchParams.next.startsWith("//")
      ? searchParams.next
      : "/";

  if (isAdultConfirmedUser(user)) {
    redirect(nextPath);
  }

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-2xl">
        <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
          <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}>
            Adults only
          </div>
          <div className={APP_EYEBROW_CLASS + " mt-5"}>Age confirmation</div>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
            Confirm that you are 18 or older
          </h1>
          <p className={`mt-3 ${APP_BODY_TEXT_CLASS}`}>
            Before continuing, we need you to confirm that you are an adult. This keeps Neonadri aligned with the way the service is designed and moderated.
          </p>

          <AdultCheckForm nextPath={nextPath} />
        </section>
      </div>
    </main>
  );
}
