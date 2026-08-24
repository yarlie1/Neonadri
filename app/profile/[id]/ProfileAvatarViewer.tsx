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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/55 px-4 py-6 sm:px-8"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[min(92vw,520px)] overflow-hidden rounded-[8px] border border-[#111111] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#111111] px-4 py-3">
              <div className="min-w-0 text-sm font-semibold text-[#111111]">
                <div className="truncate">{name || "Profile photo"}</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#111111] bg-white text-[#111111] transition hover:bg-[#f4f6f7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c8d3da]/50"
                aria-label="Close profile photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-[#f5f7f8] p-3 sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={label}
                className="mx-auto max-h-[76vh] max-w-full rounded-[6px] bg-white object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
