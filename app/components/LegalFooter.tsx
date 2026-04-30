import Link from "next/link";

export default function LegalFooter() {
  return (
    <footer className="px-4 pb-6 pt-3 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[22px] border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-4 py-3 shadow-[0_12px_26px_rgba(118,126,133,0.08)]">
        <div className="flex flex-col gap-2 text-xs text-[#6f7d86] sm:flex-row sm:items-center sm:justify-between">
          <div>Neonadri is for adults 18+ only.</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/faq" className="transition hover:text-[#24323f]">
              FAQ
            </Link>
            <Link href="/terms" className="transition hover:text-[#24323f]">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-[#24323f]">
              Privacy
            </Link>
            <Link href="/community" className="transition hover:text-[#24323f]">
              Community
            </Link>
            <a
              href="mailto:hello@neonadri.net?subject=Beta%20testing%20question"
              className="transition hover:text-[#24323f]"
            >
              Beta questions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
