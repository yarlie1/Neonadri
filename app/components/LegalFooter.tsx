import Link from "next/link";

export default function LegalFooter() {
  return (
    <footer className="px-4 pb-6 pt-3 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[8px] border border-[#111111] bg-white px-4 py-3 shadow-none">
        <div className="flex flex-col gap-2 text-xs text-[#333333] sm:flex-row sm:items-center sm:justify-between">
          <div>Neonadri is for adults 18+ only.</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/faq" className="transition hover:text-[#111111]">
              FAQ
            </Link>
            <Link href="/terms" className="transition hover:text-[#111111]">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-[#111111]">
              Privacy
            </Link>
            <Link href="/community" className="transition hover:text-[#111111]">
              Community
            </Link>
            <a
              href="mailto:hello@neonadri.net?subject=Beta%20testing%20question"
              className="transition hover:text-[#111111]"
            >
              Beta questions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
