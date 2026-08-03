"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

const DISPLAY_NAME_MAX_LENGTH = 24;
const PASSWORD_MIN_LENGTH = 8;
const DISPLAY_NAME_LENGTH_MESSAGE = `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`;
const DISPLAY_NAME_IN_USE_MESSAGE = "This display name is already in use.";
const EMAIL_IN_USE_MESSAGE = "This email is already in use.";
const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30";
const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[24px] border border-[#dde5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#25313a] shadow-[0_24px_52px_rgba(118,126,133,0.12)] sm:px-8 sm:py-9";
const BETA_ACTION_CLASS =
  "inline-flex appearance-none items-center justify-center gap-2 rounded-full border border-[#d6dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6f8_100%)] px-5 py-3 text-sm font-medium text-[#52616a] no-underline transition hover:bg-[#f5f8fa] disabled:cursor-not-allowed disabled:opacity-50";
const SIGNUP_HERO_TITLE = "Join or create meetups.";
const SIGNUP_HERO_BODY =
  "Set up your profile. Browse, request, or host.";
const SIGNUP_STEP_TIMEOUT_MS = 30000;

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function withTimeout<T>(promise: PromiseLike<T>, timeoutMessage: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, SIGNUP_STEP_TIMEOUT_MS);

    Promise.resolve(promise).then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMessage: string) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), SIGNUP_STEP_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(timeoutMessage);
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function SignupPageContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIntentFromLink = searchParams.get("intent");
  const initialEmailFromLink = searchParams.get("email")?.trim().toLowerCase() || "";
  const requestedNextPath = searchParams.get("next");
  const redirectPath =
    requestedNextPath && requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//")
      ? requestedNextPath
      : "/";
  const initialPostingBetaRequiredParam = searchParams.get("postingBetaRequired");
  const hasInitialPostingBetaRequired =
    initialPostingBetaRequiredParam === "0" ||
    initialPostingBetaRequiredParam === "1";
  const initialPostingBetaRequired =
    initialPostingBetaRequiredParam === "0" ? false : true;

  const [signupIntent, setSignupIntent] = useState<"guest" | "host" | null>(
    initialIntentFromLink === "guest" || initialIntentFromLink === "host"
      ? initialIntentFromLink
      : null
  );
  const [submitting, setSubmitting] = useState(false);
  const [checkingBetaAccess, setCheckingBetaAccess] = useState(false);
  const [betaAccessAllowed, setBetaAccessAllowed] = useState(false);
  const [postingBetaRequired, setPostingBetaRequired] = useState(
    initialPostingBetaRequired
  );
  const [betaConfigResolved, setBetaConfigResolved] = useState(
    hasInitialPostingBetaRequired
  );
  const [message, setMessage] = useState("");
  const [signupCompleteWithSession, setSignupCompleteWithSession] = useState(false);
  const [completedUserId, setCompletedUserId] = useState("");

  const [email, setEmail] = useState(initialEmailFromLink);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);

  const resolvedSignupIntent =
    betaConfigResolved && !postingBetaRequired ? signupIntent ?? "host" : signupIntent;
  const awaitingSignupMode = !betaConfigResolved && signupIntent === null;
  const hostSignupOpen = resolvedSignupIntent === "host" && !postingBetaRequired;
  const requiresPostingBeta =
    resolvedSignupIntent === "host" && postingBetaRequired;
  const showIntentPicker = betaConfigResolved && resolvedSignupIntent === null;
  const showBetaGate = requiresPostingBeta && !betaAccessAllowed;
  const showSignupForm =
    resolvedSignupIntent === "guest" || hostSignupOpen || betaAccessAllowed;
  const passwordsMatch =
    password.length >= PASSWORD_MIN_LENGTH && password === passwordConfirmation;
  const showCreateAccountCue =
    redirectPath.startsWith("/posts/") ||
    searchParams.get("utm_source")?.toLowerCase() === "reddit" ||
    !!searchParams.get("utm_medium")?.toLowerCase().includes("reddit") ||
    !!searchParams.get("utm_campaign")?.toLowerCase().includes("reddit");

  const canCreateAccount = useMemo(
    () =>
      displayName.trim().length > 0 &&
      gender.trim().length > 0 &&
      ageGroup.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length >= PASSWORD_MIN_LENGTH &&
      passwordsMatch &&
      isAdultConfirmed,
    [ageGroup, displayName, email, gender, isAdultConfirmed, password, passwordsMatch]
  );

  useEffect(() => {
    if (hasInitialPostingBetaRequired) return;

    let mounted = true;

    void fetch("/api/beta/config", { cache: "no-store" })
      .then((response) => response.json().catch(() => ({})))
      .then((payload) => {
        if (!mounted) return;
        setPostingBetaRequired(payload.postingBetaRequired !== false);
        setBetaConfigResolved(true);
      })
      .catch((error) => {
        console.error("Signup beta config lookup failed", error);
        if (!mounted) return;
        setBetaConfigResolved(true);
      });

    return () => {
      mounted = false;
    };
  }, [hasInitialPostingBetaRequired]);

  useEffect(() => {
    if (!signupCompleteWithSession) return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [signupCompleteWithSession]);

  const handleSelectIntent = (nextIntent: "guest" | "host") => {
    setSignupIntent(nextIntent);
    setBetaAccessAllowed(false);
    setMessage("");
  };

  const handleResetIntent = () => {
    setSignupIntent(null);
    setBetaAccessAllowed(false);
    setMessage("");
  };

  const handleBetaAccessCheck = async () => {
    if (checkingBetaAccess) return;

    try {
      setCheckingBetaAccess(true);
      setMessage("");

      const betaCheckResponse = await fetch("/api/beta/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const betaCheckPayload = await betaCheckResponse.json().catch(() => ({}));

      if (!betaCheckResponse.ok) {
        setMessage(
          betaCheckPayload.error || "Could not verify create access right now."
        );
        setCheckingBetaAccess(false);
        return;
      }

      if (!betaCheckPayload.allowed) {
        setBetaAccessAllowed(false);
        setMessage(
          "Apply to host first."
        );
        setCheckingBetaAccess(false);
        return;
      }

      setBetaAccessAllowed(true);
      setPostingBetaRequired(betaCheckPayload.postingBetaRequired !== false);
      setMessage(
        betaCheckPayload.postingBetaRequired === false
          ? "Hosting is open. Finish your profile."
          : "Create access confirmed."
      );
    } catch (error) {
      console.error("Beta access check error:", error);
      setMessage("Could not verify create access right now.");
    } finally {
      setCheckingBetaAccess(false);
    }
  };

  const handleResetBetaAccess = () => {
    setBetaAccessAllowed(false);
    setMessage("");
  };

  const handleSignup = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setMessage("");

      if (displayName.trim().length > DISPLAY_NAME_MAX_LENGTH) {
        setMessage(DISPLAY_NAME_LENGTH_MESSAGE);
        setSubmitting(false);
        return;
      }

      if (!displayName.trim() || !gender || !ageGroup || !email.trim()) {
        setMessage("Complete the required fields.");
        setSubmitting(false);
        return;
      }

      if (password.trim().length < PASSWORD_MIN_LENGTH) {
        setMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
        setSubmitting(false);
        return;
      }

      if (password !== passwordConfirmation) {
        setMessage("Passwords do not match.");
        setSubmitting(false);
        return;
      }

      if (!isAdultConfirmed) {
        setMessage("Please confirm that you are 18 or older.");
        setSubmitting(false);
        return;
      }

      if (!resolvedSignupIntent) {
        setMessage("Choose how you plan to use Neonadri first.");
        setSubmitting(false);
        return;
      }

      if (requiresPostingBeta) {
        setMessage("Checking create access...");
        const betaCheckResponse = await fetchWithTimeout(
          "/api/beta/check-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email.trim() }),
          },
          "Create access check is taking too long. Please try again."
        );

        const betaCheckPayload = await betaCheckResponse.json().catch(() => ({}));

        if (!betaCheckResponse.ok) {
          setMessage(
            betaCheckPayload.error || "Could not verify create access right now."
          );
          setSubmitting(false);
          return;
        }

        if (!betaCheckPayload.allowed) {
          setMessage("Apply to host first.");
          setSubmitting(false);
          return;
        }
      }

      const normalizedDisplayName = displayName.trim();
      setMessage("Checking profile name...");
      const displayNameResponse = await fetchWithTimeout(
        "/api/profile/display-name",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ display_name: normalizedDisplayName }),
        },
        "Checking the profile name is taking too long. Please try again."
      );
      const displayNameResult = await displayNameResponse.json().catch(() => ({}));

      if (!displayNameResponse.ok) {
        setMessage(displayNameResult.error || "We couldn't check that display name right now.");
        setSubmitting(false);
        return;
      }

      if (!displayNameResult.available) {
        setMessage(DISPLAY_NAME_IN_USE_MESSAGE);
        setSubmitting(false);
        return;
      }

      setMessage("Creating your login...");
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: normalizedDisplayName,
              display_name: normalizedDisplayName,
              signup_intent: resolvedSignupIntent,
            },
          },
        }),
        "Creating your login is taking too long. If you receive a confirmation email, use Log in instead."
      );

      if (error) {
        const normalizedAuthMessage = String(error.message || "").toLowerCase();
        const duplicateEmail =
          normalizedAuthMessage.includes("already registered") ||
          normalizedAuthMessage.includes("already been registered") ||
          normalizedAuthMessage.includes("user already registered");

        setMessage(duplicateEmail ? EMAIL_IN_USE_MESSAGE : error.message);
        setSubmitting(false);
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        setMessage("Account created. Profile incomplete.");
        setSubmitting(false);
        return;
      }

      const hasSession = !!data.session;

      if (hasSession) {
        const payload = {
          id: userId,
          display_name: normalizedDisplayName,
          bio: null,
          about_me: null,
          avatar_url: null,
          gender: gender || null,
          age_group: ageGroup || null,
          preferred_area: null,
          languages: null,
          meeting_style: null,
          interests: null,
          response_time_note: null,
          signup_intent: resolvedSignupIntent,
        };

        setMessage("Saving your profile...");
        const response = await fetchWithTimeout(
          "/api/profile/save",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
          "Saving your profile is taking too long. Please try again."
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          setMessage(result.error || "Failed to save your profile.");
          setSubmitting(false);
          return;
        }

        setMessage("Saving age confirmation...");
        const adultConfirmationResponse = await fetchWithTimeout(
          "/api/account/confirm-adult",
          {
            method: "POST",
          },
          "Saving age confirmation is taking too long. Please try again."
        );
        const adultConfirmationResult = await adultConfirmationResponse
          .json()
          .catch(() => ({}));

        if (!adultConfirmationResponse.ok) {
          setMessage(
            adultConfirmationResult.error ||
              "We couldn't update your age confirmation right now."
          );
          setSubmitting(false);
          return;
        }
      }

      if (hasSession) {
        setCompletedUserId(userId);
        setSignupCompleteWithSession(true);
        setSubmitting(false);
        setMessage("");
        return;
      }

      setMessage("Account created. Please log in to continue.");

      window.setTimeout(() => {
        router.push(`/login?next=${encodeURIComponent(redirectPath)}`);
      }, 900);
    } catch (error) {
      console.error("Signup flow error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account."
      );
      setSubmitting(false);
    }
  };
  if (signupCompleteWithSession) {
    const profileEditPath = completedUserId
      ? `/profile/${completedUserId}/edit`
      : redirectPath;
    const continuePath = redirectPath.startsWith("/posts/")
      ? `${redirectPath}${redirectPath.includes("?") ? "&" : "?"}joinCue=1`
      : redirectPath;

    return (
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
        <style jsx global>{`
          @keyframes neonadri-create-account-pulse {
            0%, 100% {
              box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.98), 0 0 0 7px rgba(45, 212, 191, 0.38), 0 0 30px rgba(14, 165, 233, 0.45);
            }
            50% {
              box-shadow: 0 0 0 5px rgba(255, 255, 255, 1), 0 0 0 12px rgba(45, 212, 191, 0.2), 0 0 46px rgba(14, 165, 233, 0.72);
            }
          }
        `}</style>
        <div className="mx-auto max-w-2xl">
          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            <div className={APP_EYEBROW_CLASS}>Account created</div>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
              What would you like to do next?
            </h1>
            <p className={`mt-3 ${APP_BODY_TEXT_CLASS}`}>
              Your required account details are saved.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => router.push(profileEditPath)}
                  className={`w-full rounded-full px-5 py-3 text-sm font-medium transition border-[#0891b2] ring-4 ring-[#67e8f9]/55 shadow-[0_0_0_3px_rgba(255,255,255,0.96),0_0_34px_rgba(14,165,233,0.68)] [animation:neonadri-create-account-pulse_1.45s_ease-in-out_infinite] ${APP_BUTTON_PRIMARY_CLASS}`}
                >
                  Edit profile
                </button>
                <div className="relative mt-4 rounded-[18px] border-2 border-[#38bdf8] bg-[#f0fdfa] px-4 py-3 text-left text-sm leading-6 text-[#31545d] shadow-[0_16px_30px_rgba(14,165,233,0.18)]">
                  <div className="font-bold text-[#24323c]">Add profile first</div>
                  <div>Fill out your profile, then request to join.</div>
                  <div className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l-2 border-t-2 border-[#38bdf8] bg-[#f0fdfa]" />
                </div>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => router.push(continuePath)}
                  className={`w-full rounded-full px-5 py-3 text-sm font-medium transition border-[#0891b2] ring-4 ring-[#67e8f9]/55 shadow-[0_0_0_3px_rgba(255,255,255,0.96),0_0_34px_rgba(14,165,233,0.68)] [animation:neonadri-create-account-pulse_1.45s_ease-in-out_infinite] ${APP_BUTTON_SECONDARY_CLASS}`}
                >
                  Just continue
                </button>
                <div className="relative mt-4 rounded-[18px] border-2 border-[#38bdf8] bg-[#f0fdfa] px-4 py-3 text-left text-sm leading-6 text-[#31545d] shadow-[0_16px_30px_rgba(14,165,233,0.18)]">
                  <div className="font-bold text-[#24323c]">Request now</div>
                  <div>Skip profile details and request to join right away.</div>
                  <div className="absolute -top-2 left-8 h-4 w-4 rotate-45 border-l-2 border-t-2 border-[#38bdf8] bg-[#f0fdfa]" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <style jsx global>{`
        @keyframes neonadri-create-account-pulse {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.98), 0 0 0 7px rgba(45, 212, 191, 0.38), 0 0 30px rgba(14, 165, 233, 0.45);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(255, 255, 255, 1), 0 0 0 12px rgba(45, 212, 191, 0.2), 0 0 46px rgba(14, 165, 233, 0.72);
          }
        }
      `}</style>
      <div className={`mx-auto ${showBetaGate ? "max-w-2xl" : "max-w-6xl"}`}>
        <div className={showBetaGate ? "" : "grid gap-4 lg:grid-cols-[1.02fr_0.98fr]"}>
          {!showBetaGate ? (
            <section className={HERO_SURFACE_CLASS}>
            <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-white/40 blur-2xl" />
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#d9e2e8]/40 blur-2xl" />

            <div className="relative">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-[0.3125rem] text-[11px] font-medium uppercase leading-none tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {awaitingSignupMode
                  ? "Create account"
                  : showIntentPicker
                  ? "Choose your path"
                  : requiresPostingBeta
                  ? "Posting during beta"
                  : "Create account"}
              </div>
              <h1 className="mt-4 max-w-md text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#22303a] sm:text-[42px]">
                {awaitingSignupMode
                  ? SIGNUP_HERO_TITLE
                  : showIntentPicker
                  ? "How do you want to start?"
                  : requiresPostingBeta
                  ? "Use your approved email."
                  : SIGNUP_HERO_TITLE}
              </h1>
              <p className={`mt-3 max-w-lg sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
                {awaitingSignupMode
                  ? SIGNUP_HERO_BODY
                  : showIntentPicker
                  ? postingBetaRequired
                    ? "Join now, or apply to host."
                    : "Join or create low-pressure 1:1 meetups right away."
                  : requiresPostingBeta
                  ? "Use the email already approved for creating meetups."
                  : SIGNUP_HERO_BODY}
              </p>
              <div className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                Neonadri is for adults 18+ only.
              </div>

              {showIntentPicker ? (
                <div className="mt-7 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSelectIntent("guest")}
                    className="w-full rounded-[24px] border border-[#cbd6dd] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(234,240,244,0.95)_100%)] px-5 py-5 text-left shadow-[0_16px_28px_rgba(118,126,133,0.14),inset_0_1px_0_rgba(255,255,255,0.96)] transition hover:-translate-y-0.5 hover:border-[#aebec8] hover:shadow-[0_20px_32px_rgba(118,126,133,0.18),inset_0_1px_0_rgba(255,255,255,0.98)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-[#24323c]">
                          Join 1:1 meetups
                        </div>
                        <div className="mt-1 text-xs leading-6 text-[#67747c]">
                          Browse plans. Request to join.
                        </div>
                      </div>
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c3d0d8] bg-white/90 text-[#31424d] shadow-sm">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#60707a]">
                      Tap to continue
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectIntent("host")}
                    className="w-full rounded-[24px] border border-[#cbd6dd] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(234,240,244,0.95)_100%)] px-5 py-5 text-left shadow-[0_16px_28px_rgba(118,126,133,0.14),inset_0_1px_0_rgba(255,255,255,0.96)] transition hover:-translate-y-0.5 hover:border-[#aebec8] hover:shadow-[0_20px_32px_rgba(118,126,133,0.18),inset_0_1px_0_rgba(255,255,255,0.98)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-[#24323c]">
                          Create 1:1 meetups
                        </div>
                        <div className="mt-1 text-xs leading-6 text-[#67747c]">
                          {postingBetaRequired
                            ? "Apply for beta access to post activity-based plans."
                            : "Post activity-based plans right away."}
                        </div>
                      </div>
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#c3d0d8] bg-white/90 text-[#31424d] shadow-sm">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#60707a]">
                      Tap to continue
                    </div>
                  </button>
                </div>
              ) : showSignupForm || awaitingSignupMode ? (
                <div className="mt-7 rounded-[22px] border border-[#dce5eb] bg-white/65 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                  <div className="text-sm font-semibold text-[#24323c]">
                    Required details first
                  </div>
                  <div className="mt-1 text-xs leading-6 text-[#67747c]">
                    Email, password, confirmation, display name, gender, age group, and 18+ confirmation.
                  </div>
                  <div className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#60707a]">
                    Profile details can come next
                  </div>
                </div>
              ) : showBetaGate ? null : (
                <div className="mt-7 rounded-[22px] border border-[#e0e7ec] bg-white/60 px-4 py-4">
                  <div className="text-sm font-semibold text-[#24323c]">
                    Create access comes first
                  </div>
                  <div className="mt-1 text-xs leading-6 text-[#67747c]">
                    Use the approved email, then finish signup.
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                  Coffee chats
                </span>
                <span className={`rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                  Walk meetups
                </span>
                <span className={`rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                  Focus sessions
                </span>
              </div>
            </div>
            </section>
          ) : null}

          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            {awaitingSignupMode ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={APP_EYEBROW_CLASS}>Sign Up</div>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
                      Create your account
                    </h2>
                  </div>
                  <div className={`rounded-full px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    Getting ready
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  {SIGNUP_HERO_BODY}
                </p>
              </>
            ) : showIntentPicker ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={APP_EYEBROW_CLASS}>Sign Up</div>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
                      Already have an account?
                    </h2>
                  </div>
                  <div className={`rounded-full px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    Quick link
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  Have an account? Log in.
                </p>

                <div className="mt-6">
                  <Link
                    href="/login"
                    className={`inline-flex rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                  >
                    Log in
                  </Link>
                </div>
              </>
            ) : showBetaGate ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={APP_EYEBROW_CLASS}>Create Access</div>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
                      Approved email required
                    </h2>
                  </div>
                  <div className={`rounded-full px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    Access first
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  Use your approved email to create meetups.
                </p>

                <div className="mt-6 space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#52616a]">
                      Approved email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={INPUT_CLASS}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleBetaAccessCheck}
                      disabled={checkingBetaAccess}
                      className={`${BETA_ACTION_CLASS} shadow-[inset_0_0_0_1px_rgba(214,223,229,0.95)]`}
                    >
                      <span className="text-sm font-medium text-[#52616a]">
                        {checkingBetaAccess ? "Checking access..." : "Continue with this email"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetIntent}
                      className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                    >
                      Choose another path
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={APP_EYEBROW_CLASS}>Sign Up</div>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
                      Create your account
                    </h2>
                  </div>
                  <div className={`rounded-full px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    Required
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  Save the details Neonadri needs to work.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#52616a]">
                      {requiresPostingBeta ? "Approved email" : "Email"}
                    </label>
                    <input
                      type="email"
                      className={
                        requiresPostingBeta
                          ? `${INPUT_CLASS} bg-[#f4f7f9] text-[#64727a]`
                          : INPUT_CLASS
                      }
                      value={email}
                      readOnly={requiresPostingBeta}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {requiresPostingBeta ? (
                      <button
                        type="button"
                        onClick={handleResetBetaAccess}
                        className="mt-2 text-xs font-medium text-[#55656e] underline underline-offset-2 transition hover:text-[#24323c]"
                      >
                        Use a different email
                      </button>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#52616a]">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                      className={INPUT_CLASS}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {password.trim().length > 0 &&
                    password.trim().length < PASSWORD_MIN_LENGTH ? (
                      <p className="mt-2 text-xs text-[#6e7d86]">
                        Password must be at least {PASSWORD_MIN_LENGTH} characters.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#52616a]">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter password again"
                      className={INPUT_CLASS}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                    />
                    {passwordConfirmation.length > 0 && password !== passwordConfirmation ? (
                      <p className="mt-2 text-xs text-[#6e7d86]">
                        Passwords do not match.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#52616a]">
                      Display name
                    </label>
                    <input
                      value={displayName}
                      onChange={(e) =>
                        setDisplayName(e.target.value.slice(0, DISPLAY_NAME_MAX_LENGTH))
                      }
                      maxLength={DISPLAY_NAME_MAX_LENGTH}
                      className={INPUT_CLASS}
                      placeholder="How people will see you"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#52616a]">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={INPUT_CLASS}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#52616a]">
                        Age group
                      </label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className={INPUT_CLASS}
                      >
                        <option value="">Select age group</option>
                        <option value="20s">20s</option>
                        <option value="30s">30s</option>
                        <option value="40s">40s</option>
                        <option value="50s+">50s+</option>
                      </select>
                    </div>
                  </div>

                  <label className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] p-4 text-sm text-[#55626a]">
                    <input
                      type="checkbox"
                      checked={isAdultConfirmed}
                      onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                      className="!mt-0.5 !h-4 !w-4 !appearance-auto !rounded !border-[#c7d2d9] !p-0 !shadow-none !outline-none !ring-0 accent-[#8fa1ac]"
                    />
                    <span className="min-w-0 leading-6">
                      I confirm that I am 18 or older and understand that Neonadri is for adults only.
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <p className="w-full text-xs text-[#6e7d86]">
                    {"By creating an account, you agree to Neonadri's "}
                    <Link href="/terms" className="underline underline-offset-2 transition hover:text-[#24323c]">
                      Terms
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="underline underline-offset-2 transition hover:text-[#24323c]">
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link href="/community" className="underline underline-offset-2 transition hover:text-[#24323c]">
                      Community Guidelines
                    </Link>
                    .
                  </p>

                  <div className="inline-flex flex-col items-start gap-3">
                    <button
                      type="button"
                      onClick={handleSignup}
                      disabled={submitting || !canCreateAccount}
                      className={`rounded-full border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-75 ${APP_BUTTON_PRIMARY_CLASS} ${
                        showCreateAccountCue
                          ? "border-[#0891b2] ring-4 ring-[#67e8f9]/55 shadow-[0_0_0_3px_rgba(255,255,255,0.96),0_0_34px_rgba(14,165,233,0.68)] [animation:neonadri-create-account-pulse_1.45s_ease-in-out_infinite]"
                          : ""
                      }`}
                    >
                      {submitting ? "Creating account..." : "Create account"}
                    </button>
                    {showCreateAccountCue ? (
                      <div className="relative max-w-[320px] rounded-[18px] border-2 border-[#38bdf8] bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)] px-4 py-3 text-sm leading-5 text-[#17424a] shadow-[0_18px_34px_rgba(14,165,233,0.24)]">
                        <div className="absolute -top-2 left-7 h-4 w-4 rotate-45 border-l-2 border-t-2 border-[#38bdf8] bg-white" />
                        <div className="relative font-semibold text-[#0f3f46]">Fill this out first</div>
                        <div className="relative mt-1 text-[#3f6d74]">
                          Complete the details above, then tap Create account to request this meetup.
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}

            {message && (
              <p className="mt-4 rounded-[20px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
                {message}
              </p>
            )}
          </section>
        </div>

        {showBetaGate ? (
          <section className={`mt-4 ${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
            <div className="flex items-start gap-3">
              <div className={`rounded-full px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                Create access
              </div>
            </div>
            <h3 className="mt-3 text-xl font-black tracking-[-0.04em] text-[#24323c]">
              Need create access?
            </h3>
            <p className={`mt-3 text-sm leading-6 ${APP_BODY_TEXT_CLASS}`}>
              Apply first, then return with the same email.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={email ? `/beta?email=${encodeURIComponent(email)}` : "/beta"}
                className={BETA_ACTION_CLASS}
              >
                <span className="text-sm font-medium text-[#52616a]">
                  Apply to create meetups
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        ) : null}

      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
          <div className="mx-auto max-w-6xl">
            <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
              <div className={APP_EYEBROW_CLASS}>Sign Up</div>
              <div className="mt-3 text-sm text-[#55626a]">Loading signup...</div>
            </section>
          </div>
        </main>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
