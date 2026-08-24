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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!src) {
    return <Avatar src={src} name={name} size="lg" />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full outline-none transition hover:opacity-90 focus-visible:ring-4 focus-visible:ring-[#c8d3da]/50"
        aria-label={`Open ${label}`}
      >
        <Avatar src={src} name={name} size="lg" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101417]/75 px-4 py-6 sm:px-8"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex max-h-full max-w-[min(92vw,680px)] flex-col items-end gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white text-[#111111] shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition hover:bg-[#f4f6f7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/35"
              aria-label="Close profile photo"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={label}
              className="max-h-[82vh] max-w-full rounded-[12px] border border-white/20 bg-white object-contain shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
