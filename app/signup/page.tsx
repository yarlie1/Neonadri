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
  "w-full rounded-[8px] border border-[#111111] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:ring-1 focus:/30";
const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[8px] border border-[#111111] bg-white px-6 py-7 text-[#111111] shadow-none sm:px-8 sm:py-9";
const BETA_ACTION_CLASS =
  "inline-flex appearance-none items-center justify-center gap-2 rounded-[8px] border border-[#111111] bg-white px-5 py-3 text-sm font-medium text-[#333333] no-underline transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";
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
        const nextPath = redirectPath.startsWith("/posts/")
          ? `${redirectPath}${redirectPath.includes("?") ? "&" : "?"}joinCue=1`
          : redirectPath;
        window.location.replace(nextPath);
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
    const nextPath = redirectPath.startsWith("/posts/")
      ? `${redirectPath}${redirectPath.includes("?") ? "&" : "?"}joinCue=1`
      : redirectPath;
    const editProfileHref = completedUserId
      ? `/profile/${completedUserId}/edit?profileCue=1&next=${encodeURIComponent(redirectPath)}`
      : `/profile/edit?profileCue=1&next=${encodeURIComponent(redirectPath)}`;

    return (
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
        <div className="mx-auto max-w-lg">
          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            <div className={APP_EYEBROW_CLASS}>Account created</div>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
              Account created
            </h1>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              You can request to join now.
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                href={nextPath}
                className={`inline-flex min-h-[52px] items-center justify-center rounded-[8px] px-5 py-3 text-base font-black transition ${APP_BUTTON_PRIMARY_CLASS}`}
              >
                Continue to request
              </Link>
              <Link
                href={editProfileHref}
                className="text-sm font-bold text-[#111111] underline underline-offset-4"
              >
                Add profile details first
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }
  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className={`mx-auto ${showBetaGate ? "max-w-2xl" : "max-w-xl"}`}>
        <div>
          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            {awaitingSignupMode ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={APP_EYEBROW_CLASS}>Sign Up</div>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
                      Create account
                    </h2>
                  </div>
                  <div className={`rounded-[8px] px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
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
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
                      Already have an account?
                    </h2>
                  </div>
                  <div className={`rounded-[8px] px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    Quick link
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  Have an account? Log in.
                </p>

                <div className="mt-6">
                  <Link
                    href="/login"
                    className={`inline-flex rounded-[8px] px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
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
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
                      Approved email required
                    </h2>
                  </div>
                  <div className={`rounded-[8px] px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    Access first
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  Use your approved email to create meetups.
                </p>

                <div className="mt-6 space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
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
                      className={`${BETA_ACTION_CLASS} shadow-none`}
                    >
                      <span className="text-sm font-medium text-[#333333]">
                        {checkingBetaAccess ? "Checking access..." : "Continue with this email"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetIntent}
                      className={`rounded-[8px] px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
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
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
                      Create account
                    </h2>
                  </div>
                  <div className={`rounded-[8px] px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    Required
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  Create your account, then request this meetup.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
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
                        className="mt-2 text-xs font-medium text-[#55656e] underline underline-offset-2 transition hover:text-[#111111]"
                      >
                        Use a different email
                      </button>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
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
                      <p className="mt-2 text-xs text-[#444444]">
                        Password must be at least {PASSWORD_MIN_LENGTH} characters.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
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
                      <p className="mt-2 text-xs text-[#444444]">
                        Passwords do not match.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
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
                      <label className="mb-2 block text-sm font-medium text-[#333333]">
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
                      <label className="mb-2 block text-sm font-medium text-[#333333]">
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

                  <label className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 rounded-[8px] border border-[#111111] bg-white p-4 text-sm text-[#333333]">
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
                  <p className="w-full text-xs text-[#444444]">
                    {"By creating an account, you agree to Neonadri's "}
                    <Link href="/terms" className="underline underline-offset-2 transition hover:text-[#111111]">
                      Terms
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="underline underline-offset-2 transition hover:text-[#111111]">
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link href="/community" className="underline underline-offset-2 transition hover:text-[#111111]">
                      Community Guidelines
                    </Link>
                    .
                  </p>

                  <div className="flex w-full flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleSignup}
                      disabled={submitting || !canCreateAccount}
                      className={`w-full rounded-[8px] border px-5 py-3 text-base font-black transition disabled:cursor-not-allowed disabled:opacity-75 ${APP_BUTTON_PRIMARY_CLASS}`}
                    >
                      {submitting ? "Creating account..." : "Create account"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {message && (
              <p className="mt-4 rounded-[8px] border border-[#111111] bg-white px-4 py-3 text-sm text-[#333333]">
                {message}
              </p>
            )}
          </section>
        </div>

        {showBetaGate ? (
          <section className={`mt-4 ${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
            <div className="flex items-start gap-3">
              <div className={`rounded-[8px] px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                Create access
              </div>
            </div>
            <h3 className="mt-3 text-xl font-black tracking-[-0.04em] text-[#111111]">
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
                <span className="text-sm font-medium text-[#333333]">
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
              <div className="mt-3 text-sm text-[#333333]">Loading signup...</div>
            </section>
          </div>
        </main>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
