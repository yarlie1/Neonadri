"use client";

import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "neonadri-intro-dismissed-v1";

export default function IntroVideoGate() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (dismissed !== "true") {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  const handleClose = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {}

    setIsVisible(false);
  };

  const handleReplay = async () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setHasEnded(false);

    try {
      await video.play();
    } catch {}
  };

  if (!isReady || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[#091117] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_32%),linear-gradient(180deg,rgba(8,14,18,0.18)_0%,rgba(8,14,18,0.72)_100%)]" />

      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setHasEnded(true)}
      >
        <source src="/neonadri-intro.webm" type="video/webm" />
      </video>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,14,0.18)_0%,rgba(5,10,14,0.28)_22%,rgba(5,10,14,0.64)_100%)]" />

      <button
        type="button"
        onClick={handleClose}
        className="absolute right-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/16"
      >
        <X className="h-4 w-4" />
        Skip
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/14 bg-[rgba(10,18,24,0.58)] px-5 py-5 shadow-[0_28px_64px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-7 sm:py-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Neonadri Intro
          </div>
          <h2 className="mt-2 max-w-3xl text-[30px] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-[42px]">
            A calmer way to meet someone new.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/78 sm:text-[15px]">
            Watch the quick intro, then enter the full Neonadri experience.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center rounded-full border border-white/22 bg-white px-5 py-3 text-sm font-semibold text-[#1c2a33] transition hover:bg-[#f3f7fa]"
            >
              Enter Neonadri
            </button>
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/16"
            >
              <Play className="h-4 w-4" />
              Replay intro
            </button>
          </div>

          {hasEnded ? (
            <div className="mt-4 text-sm text-white/74">
              The intro has finished. Tap Enter Neonadri to continue.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
