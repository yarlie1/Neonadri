"use client";

import {
  MessageCircle,
  Play,
  ShieldCheck,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "neonadri-intro-dismissed-date-v2";
const OPEN_EVENT = "neonadri:open-intro";
const SLIDE_MS = 4200;

const slides = [
  {
    eyebrow: "Host",
    title: "1. Post a meetup",
    body: "Add the activity, time, place, and what the host covers.",
    icon: UserRound,
  },
  {
    eyebrow: "Guest",
    title: "2. Send a request",
    body: "Choose a meetup that fits and ask to join.",
    icon: UserRound,
  },
  {
    eyebrow: "Host",
    title: "3. Accept a guest",
    body: "Review requests and accept one guest to match.",
    icon: UserCheck,
  },
  {
    eyebrow: "Host / Guest",
    title: "4. Chat",
    body: "Confirm the exact time, meeting spot, and small details.",
    icon: MessageCircle,
  },
  {
    eyebrow: "Host / Guest",
    title: "5. Meetup",
    body: "Show up, relax, and enjoy the time together.",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Quick notice",
    title: "Respect and care",
    body: "Meet in public places, keep plans clear, and respect each other's time.",
    icon: ShieldCheck,
  },
] as const;

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function IntroVideoGate() {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const hasEnded = currentSlide === slides.length - 1;
  const activeSlide = slides[currentSlide];
  const ActiveIcon = activeSlide.icon;
  const slideNumberLabel = useMemo(
    () => `${currentSlide + 1} / ${slides.length}`,
    [currentSlide]
  );

  const openIntro = () => {
    setCurrentSlide(0);
    setProgressKey((value) => value + 1);
    setIsVisible(true);
  };

  useEffect(() => {
    const todayKey = getTodayKey();
    const url = new URL(window.location.href);
    const shouldOpenFromUrl = url.searchParams.get("intro") === "1";
    const shouldAutoOpen = url.pathname === "/";

    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (shouldOpenFromUrl || (shouldAutoOpen && dismissed !== todayKey)) {
        openIntro();
      }
    } catch {
      if (shouldOpenFromUrl || shouldAutoOpen) {
        openIntro();
      }
    } finally {
      if (shouldOpenFromUrl) {
        url.searchParams.delete("intro");
        window.history.replaceState(
          {},
          "",
          url.pathname + url.search + url.hash
        );
      }
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    const handleOpenIntro = () => openIntro();

    window.addEventListener(OPEN_EVENT, handleOpenIntro);
    return () => window.removeEventListener(OPEN_EVENT, handleOpenIntro);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || hasEnded) return;

    const timer = window.setTimeout(() => {
      setCurrentSlide((value) => Math.min(value + 1, slides.length - 1));
      setProgressKey((value) => value + 1);
    }, SLIDE_MS);

    return () => window.clearTimeout(timer);
  }, [currentSlide, hasEnded, isVisible]);

  const handleClose = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, getTodayKey());
    } catch {}

    setIsVisible(false);
  };

  const handleReplay = () => {
    setCurrentSlide(0);
    setProgressKey((value) => value + 1);
  };

  const handleNext = () => {
    if (hasEnded) {
      handleClose();
      return;
    }

    setCurrentSlide((value) => Math.min(value + 1, slides.length - 1));
    setProgressKey((value) => value + 1);
  };

  if (!isReady || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-white text-[#111111]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#eeeeee]">
        <div
          key={progressKey}
          className="h-full origin-left bg-[#111111]"
          style={{
            animation: hasEnded ? "none" : `intro-progress ${SLIDE_MS}ms linear`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes intro-progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>

      <button
        type="button"
        onClick={handleClose}
        className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 text-sm font-black text-[#111111]"
      >
        <X className="h-4 w-4" />
        Skip
      </button>

      <div className="flex min-h-screen items-center justify-center px-5 py-20">
        <section className="w-full max-w-2xl rounded-[8px] border border-[#111111] bg-white p-7 sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.18em] text-[#666666]">
              <ActiveIcon className="h-4 w-4 text-[#111111]" />
              {activeSlide.eyebrow}
            </div>
            <div className="text-sm font-black text-[#666666]">{slideNumberLabel}</div>
          </div>

          <h1 className="mt-8 text-[44px] font-black leading-[0.95] tracking-[-0.05em] text-[#111111] sm:text-[64px]">
            {activeSlide.title}
          </h1>
          <p className="mt-5 max-w-xl text-[18px] leading-7 text-[#444444] sm:text-[20px]">
            {activeSlide.body}
          </p>

          <div className="mt-9 flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => {
                  setCurrentSlide(index);
                  setProgressKey((value) => value + 1);
                }}
                aria-label={slide.title}
                className={`h-2 flex-1 rounded-[8px] transition ${
                  index === currentSlide ? "bg-[#111111]" : "bg-[#dddddd]"
                }`}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#111111] bg-white px-5 py-3 text-sm font-black text-[#111111]"
            >
              <Play className="h-4 w-4" />
              Replay
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-[8px] border border-[#111111] bg-[#111111] px-8 py-3 text-sm font-black text-white"
            >
              {hasEnded ? "Enter Neonadri" : "Next"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
