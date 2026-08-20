import Link from "next/link";

export default function LegalFooter() {
  return (
    <footer className="px-4 pb-6 pt-8 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 border-t border-[#111111] pt-3 text-xs text-[#555555] sm:flex-row sm:items-center sm:justify-between">
        <div>Adults 18+ only.</div>
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
        </div>
      </div>
    </footer>
  );
}