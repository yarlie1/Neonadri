import Link from "next/link";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export default function LegalPageShell({
  eyebrow,
  title,
  intro,
  lastUpdated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-3xl space-y-5">
        <section className={`relative overflow-hidden ${APP_SURFACE_CARD_CLASS} px-5 py-6 sm:px-6 sm:py-7`}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/42 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#cfd8de]/35 blur-2xl" />
          <div className="relative">
            <div className={`inline-flex items-center rounded-full ${APP_SOFT_CARD_CLASS} px-3 py-1.5 ${APP_EYEBROW_CLASS}`}>
              {eyebrow}
            </div>
            <h1 className="mt-4 max-w-2xl text-[32px] font-black leading-[0.98] tracking-[-0.05em] text-[#24323f] sm:text-[38px]">
              {title}
            </h1>
            <p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
              {intro}
            </p>
            <p className={`mt-3 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
              Last updated: {lastUpdated}
            </p>
          </div>
        </section>

        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h2 className="text-lg font-bold tracking-[-0.03em] text-[#24323f]">
                  {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className={`text-sm leading-7 sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className={`space-y-2 pl-5 text-sm leading-7 sm:text-[15px] ${APP_BODY_TEXT_CLASS} list-disc`}>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/"
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Back home
            </Link>
            <Link
              href="/faq"
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              FAQ
            </Link>
            <Link
              href="/community"
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Community
            </Link>
            <Link
              href="/privacy"
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Terms
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
