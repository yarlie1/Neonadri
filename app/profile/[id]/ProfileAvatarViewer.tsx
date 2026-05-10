"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Avatar from "../../components/Avatar";

type ProfileAvatarViewerProps = {
  src?: string | null;
  name?: string | null;
};

export default function ProfileAvatarViewer({
  src,
  name,
}: ProfileAvatarViewerProps) {
  const [open, setOpen] = useState(false);
  const label = name ? `${name}'s profile photo` : "Profile photo";

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!src) {
    return <Avatar src={src} name={name} size="lg" />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full outline-none transition hover:scale-[1.03] focus-visible:ring-4 focus-visible:ring-[#c8d3da]/50"
        aria-label={`Open ${label}`}
      >
        <Avatar src={src} name={name} size="lg" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#17212a]/70 px-5 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-full max-w-[min(92vw,560px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/90 text-[#24323c] shadow-[0_12px_24px_rgba(20,29,37,0.2)] transition hover:bg-white"
              aria-label="Close profile photo"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={label}
              className="max-h-[82vh] w-full rounded-[22px] border border-white/30 bg-white object-contain shadow-[0_24px_80px_rgba(10,18,24,0.35)]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
