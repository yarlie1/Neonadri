"use client";

import {
  Check,
  MessageCircle,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
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
    icon: Sparkles,
  },
  {
    eyebrow: "Guest",
    title: "2. Send a request",
    body: "Choose a meetup that fits and ask to join.",
    icon: Send,
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
    body: "Meet in a public place and keep the plan respectful.",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Quick notice",
    title: "Respect and care",
    body: "Meet in public places, keep plans clear, and use reports when something feels off.",
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
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[#f7fafb] text-[#22303a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98)_0%,rgba(234,241,245,0.92)_35%,rgba(205,216,224,0.86)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-[#dce5eb]">
        <div
          key={progressKey}
          className="h-full origin-left bg-[#8ea0aa]"
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
        className="absolute right-4 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-[#dbe4ea] bg-white/80 px-4 py-2 text-sm font-medium text-[#52616a] shadow-[0_14px_32px_rgba(118,126,133,0.12)] backdrop-blur-md transition hover:bg-white"
      >
        <X className="h-4 w-4" />
        Skip
      </button>

      <div className="relative z-10 flex max-h-screen min-h-screen items-center justify-center overflow-y-auto px-4 pb-[11.5rem] pt-20 sm:px-6 sm:pb-32 sm:pt-16">
        <div className="grid w-full max-w-6xl gap-5 md:grid-cols-[0.92fr_1.08fr] md:items-center">
          <section className="relative overflow-hidden rounded-[32px] border border-[#dce5eb] bg-white/72 p-5 shadow-[0_28px_80px_rgba(118,126,133,0.16)] backdrop-blur-xl sm:p-7">
            <ActiveIcon className="pointer-events-none absolute -right-4 top-8 h-40 w-40 text-[#dce5eb]/55 sm:-right-8 sm:top-4 sm:h-60 sm:w-60" />
            <div className="relative inline-flex items-center gap-2 rounded-[18px] border border-[#dce5eb] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-4 py-2 text-[16px] font-black uppercase tracking-[0.08em] text-[#31414a] sm:text-[18px]">
              <ActiveIcon className="h-3.5 w-3.5" />
              {activeSlide.eyebrow}
            </div>
            <h1 className="relative mt-5 text-[42px] font-black leading-[0.92] tracking-[-0.05em] text-[#22303a] sm:text-[64px]">
              {activeSlide.title}
            </h1>
            <p className="relative mt-5 max-w-xl text-[17px] leading-7 text-[#62717a] sm:text-[19px]">
              {activeSlide.body}
            </p>

            <div className="relative mt-8 flex gap-1.5 md:hidden">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => {
                    setCurrentSlide(index);
                    setProgressKey((value) => value + 1);
                  }}
                  aria-label={slide.title}
                  className={`h-2 flex-1 rounded-full transition ${
                    index === currentSlide ? "bg-[#7f929d]" : "bg-[#dce5eb]"
                  }`}
                />
              ))}
            </div>

          </section>

          <section className="hidden rounded-[32px] border border-[#dce5eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(237,243,246,0.94)_100%)] p-4 shadow-[0_28px_80px_rgba(118,126,133,0.14)] sm:p-6 md:block">
            <div className="grid gap-3">
              {slides.map((slide, index) => {
                const StepIcon = slide.icon;
                const active = index === currentSlide;
                const complete = index < currentSlide;

                return (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => {
                      setCurrentSlide(index);
                      setProgressKey((value) => value + 1);
                    }}
                    className={`grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3 rounded-[24px] border px-3.5 py-3 text-left transition sm:grid-cols-[48px_minmax(0,1fr)] sm:px-4 ${
                      active
                        ? "border-[#b8c6cf] bg-white text-[#22303a] shadow-[0_18px_40px_rgba(118,126,133,0.14)]"
                        : "border-[#e3eaf0] bg-white/56 text-[#66757e] hover:bg-white/82"
                    }`}
                  >
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border sm:h-12 sm:w-12 ${
                        active
                          ? "border-[#cbd7de] bg-[linear-gradient(180deg,#ffffff_0%,#dce7ed_100%)]"
                          : "border-[#e1e8ed] bg-[#f7fafb]"
                      }`}
                    >
                      {complete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#88949b]">
                        {slide.eyebrow}
                      </span>
                      <span className="mt-1 block text-base font-black tracking-[-0.03em]">
                        {slide.title}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[#dce5eb] bg-white/78 px-4 py-4 shadow-[0_-18px_48px_rgba(118,126,133,0.12)] backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#849099]">
              Neonadri intro - {slideNumberLabel}
            </div>
            <div className="mt-1 text-sm font-medium text-[#62717a]">
              {hasEnded
                ? "You're ready to enter Neonadri."
                : "A quick walkthrough of how a meetup works."}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#dbe4ea] bg-white px-5 py-3 text-sm font-medium text-[#52616a] transition hover:bg-[#f7fafb] sm:min-h-0"
            >
              <Play className="h-4 w-4" />
              Replay
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#bac7d0] bg-[linear-gradient(180deg,#ffffff_0%,#dce6ec_100%)] px-5 py-3 text-sm font-bold text-[#24323c] shadow-[0_16px_30px_rgba(118,126,133,0.16)] transition hover:border-[#a8b8c2] sm:min-h-0"
            >
              {hasEnded ? "Enter Neonadri" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
