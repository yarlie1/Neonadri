"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";
import {
  ABOUT_ME_RESTRICTION_MESSAGE,
  validateAboutMeContent,
} from "../../lib/profileContent";

const LANGUAGE_OPTIONS = [
  "English",
  "Korean",
  "Spanish",
  "Japanese",
  "Chinese",
  "French",
];

const MEETING_STYLE_OPTIONS = [
  "Friendly and relaxed",
  "Thoughtful and calm",
  "Casual and easygoing",
  "Focused and productive",
  "Energetic and social",
  "Quiet and comfortable",
];

const INTEREST_OPTIONS = [
  "Coffee",
  "Walk",
  "Study",
  "Board Games",
  "Meal",
  "Dessert",
  "Movie",
  "Karaoke",
  "Workout",
  "Books",
  "Travel",
  "Language Exchange",
  "Networking",
  "Photography",
];

const RESPONSE_NOTE_OPTIONS = [
  "Usually replies within a few hours",
  "Usually replies within a day",
  "Usually replies within 2 days",
  "Replies may be slow on weekdays",
  "Usually replies in the evening",
];

const STEPS = [
  { number: 1, label: "Basics" },
  { number: 2, label: "Vibe" },
  { number: 3, label: "Account" },
];

const DEFAULT_ABOUT_ME =
  "I enjoy meeting new people over coffee, walks, or low-pressure plans. I usually appreciate clear communication, relaxed energy, and a meetup that feels easy to settle into.";
const DISPLAY_NAME_MAX_LENGTH = 24;
const PASSWORD_MIN_LENGTH = 8;
const DISPLAY_NAME_LENGTH_MESSAGE = `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`;
const DISPLAY_NAME_IN_USE_MESSAGE = "This display name is already in use.";
const EMAIL_IN_USE_MESSAGE = "This email is already in use.";
const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30";
const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[32px] border border-[#dde5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#25313a] shadow-[0_24px_52px_rgba(118,126,133,0.12)] sm:px-8 sm:py-9";
const BETA_ACTION_CLASS =
  "inline-flex appearance-none items-center justify-center gap-2 rounded-full border border-[#d6dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6f8_100%)] px-5 py-3 text-sm font-medium text-[#52616a] no-underline transition hover:bg-[#f5f8fa] disabled:cursor-not-allowed disabled:opacity-50";

function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
        selected ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
      }`}
    >
      {label}
    </button>
  );
}

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [checkingBetaAccess, setCheckingBetaAccess] = useState(false);
  const [betaAccessAllowed, setBetaAccessAllowed] = useState(false);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [aboutMe, setAboutMe] = useState(DEFAULT_ABOUT_ME);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [meetingStyle, setMeetingStyle] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [responseTimeNote, setResponseTimeNote] = useState("");
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);

  const canMoveNext = useMemo(() => {
    if (step === 1) {
      return (
        displayName.trim().length > 0 &&
        gender.trim().length > 0 &&
        ageGroup.trim().length > 0
      );
    }

    if (step === 2) {
      return (
        aboutMe.trim().length > 0 &&
        meetingStyle.trim().length > 0 &&
        interests.length > 0
      );
    }

    if (step === 3) {
      return (
        email.trim().length > 0 &&
        password.trim().length >= PASSWORD_MIN_LENGTH &&
        isAdultConfirmed
      );
    }

    return false;
  }, [aboutMe, ageGroup, displayName, email, gender, interests.length, isAdultConfirmed, meetingStyle, password, step]);

  const profileSummary = useMemo(() => {
    const normalized = aboutMe.replace(/\s+/g, " ").trim();

    if (!normalized) return "";

    if (normalized.length <= 110) {
      return normalized;
    }

    return `${normalized.slice(0, 107).trimEnd()}...`;
  }, [aboutMe]);

  const toggleArrayValue = (
    value: string,
    current: string[],
    setter: (next: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }

    setter([...current, value]);
  };

  const handleNext = async () => {
    if (!canMoveNext || step >= STEPS.length) return;
    setMessage("");

    if (step === 1) {
      const normalizedDisplayName = displayName.trim();

      if (normalizedDisplayName.length > DISPLAY_NAME_MAX_LENGTH) {
        setMessage(DISPLAY_NAME_LENGTH_MESSAGE);
        return;
      }

      const { data: existingProfile, error: existingProfileError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("display_name", normalizedDisplayName)
        .limit(1)
        .maybeSingle();

      if (existingProfileError) {
        console.error("Display name availability check failed", {
          message: existingProfileError.message,
          details: existingProfileError.details,
          hint: existingProfileError.hint,
          code: existingProfileError.code,
        });
        setMessage("We couldn't check that display name right now.");
        return;
      }

      if (existingProfile) {
        setMessage(DISPLAY_NAME_IN_USE_MESSAGE);
        return;
      }
    }

    setStep((current) => current + 1);
  };

  const handleBack = () => {
    if (step <= 1) return;
    setMessage("");
    setStep((current) => current - 1);
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
          betaCheckPayload.error || "Could not verify beta access right now."
        );
        setCheckingBetaAccess(false);
        return;
      }

      if (!betaCheckPayload.allowed) {
        setBetaAccessAllowed(false);
        setMessage(
          "This email is not approved for beta access yet. Please apply for beta access first."
        );
        setCheckingBetaAccess(false);
        return;
      }

      setBetaAccessAllowed(true);
      setStep(1);
      setMessage("Beta access confirmed. Let's finish your profile.");
    } catch (error) {
      console.error("Beta access check error:", error);
      setMessage("Could not verify beta access right now.");
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

      if (!isAdultConfirmed) {
        setMessage("Please confirm that you are 18 or older.");
        setSubmitting(false);
        return;
      }

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
          betaCheckPayload.error || "Could not verify beta access right now."
        );
        setSubmitting(false);
        return;
      }

      if (!betaCheckPayload.allowed) {
        setMessage(
          "Neonadri is currently available to approved beta testers only. Please apply for beta access first."
        );
        setSubmitting(false);
        return;
      }

      const aboutMeValidation = validateAboutMeContent(aboutMe);

      if (!aboutMeValidation.ok) {
        setMessage(ABOUT_ME_RESTRICTION_MESSAGE);
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: displayName.trim(),
            display_name: displayName.trim(),
            is_adult_confirmed: true,
            age_gate_confirmed_at: new Date().toISOString(),
          },
        },
      });

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
        setMessage("Account was created, but profile setup could not be finished.");
        setSubmitting(false);
        return;
      }

      const hasSession = !!data.session;

      if (hasSession) {
        const payload = {
          id: userId,
          display_name: displayName.trim(),
          bio: profileSummary || null,
          about_me: aboutMe.trim() || null,
          gender: gender || null,
          age_group: ageGroup || null,
          preferred_area: null,
          languages: languages.length > 0 ? languages : null,
          meeting_style: meetingStyle || null,
          interests: interests.length > 0 ? interests : null,
          response_time_note: responseTimeNote.trim() || null,
        };

        const response = await fetch("/api/profile/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          setMessage(result.error || "Failed to save your profile.");
          setSubmitting(false);
          return;
        }
      }

      setMessage(
        hasSession
          ? "Account created. Taking you into Neonadri now..."
          : "Account created. Please log in to continue."
      );

      window.setTimeout(() => {
        router.push(hasSession ? "/" : "/login");
      }, 900);
    } catch (error) {
      console.error("Signup flow error:", error);
      setMessage("Something went wrong while creating your account.");
      setSubmitting(false);
    }
  };

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <section className={HERO_SURFACE_CLASS}>
            <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-white/40 blur-2xl" />
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#d9e2e8]/40 blur-2xl" />

            <div className="relative">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-[0.3125rem] text-[11px] font-medium uppercase leading-none tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Join the vibe
              </div>
              <h1 className="mt-4 max-w-md text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#22303a] sm:text-[42px]">
                Build your profile before the first hello.
              </h1>
              <p className={`mt-3 max-w-lg sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
                We guide people through account setup one step at a time, so you can finish your profile and join the app without friction.
              </p>
              <div className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                Neonadri is for adults 18+ only.
              </div>
              <div className="mt-3 text-sm text-[#5f6d76]">
                Signup is currently limited to approved beta testers.{" "}
                <Link href="/beta" className="font-semibold text-[#31424d] underline underline-offset-4">
                  Apply for beta access
                </Link>
                .
              </div>

              <div className="mt-7 space-y-3">
                {STEPS.map((item) => {
                  const active = step === item.number;
                  const complete = step > item.number;

                  return (
                    <div
                      key={item.number}
                      className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 transition ${
                        active
                          ? "border-[#cbd6dd] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(232,238,242,0.94)_100%)] shadow-[0_12px_24px_rgba(118,126,133,0.12)]"
                          : "border-[#e0e7ec] bg-white/60"
                      }`}
                    >
                      <div
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          complete
                            ? "bg-[#273640] text-white"
                            : active
                              ? "bg-[#2f3c46] text-white"
                              : "bg-white/80 text-[#6e7d86]"
                        }`}
                      >
                        {complete ? <Check className="h-4 w-4" /> : item.number}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#24323c]">
                          {item.label}
                        </div>
                        <div className="text-xs text-[#67747c]">
                          {item.number === 1 && "Name, gender, and age group"}
                          {item.number === 2 && "About you, style, and interests"}
                          {item.number === 3 && "Email and password"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                  Coffee chats
                </span>
                <span className={`rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                  Walk dates
                </span>
                <span className={`rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                  Focus sessions
                </span>
              </div>
            </div>
          </section>

          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            {!betaAccessAllowed ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={APP_EYEBROW_CLASS}>Beta Access</div>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
                      Approved beta email required
                    </h2>
                  </div>
                  <div className={`rounded-full px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    Access first
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  Check your beta access first. Once we confirm your email, we will open the signup steps right away.
                </p>

                <div className="mt-6 space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#52616a]">
                      Approved beta email
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
                  </div>

                  <div className={`${APP_SOFT_CARD_CLASS} p-4`}>
                    <p className={`text-sm ${APP_BODY_TEXT_CLASS}`}>
                      If this email is not approved yet, you can apply for access first and come back once your spot opens.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/beta"
                    className={BETA_ACTION_CLASS}
                  >
                    <span className="text-sm font-medium text-[#52616a]">
                      Apply for beta access
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={APP_EYEBROW_CLASS}>
                      Sign Up
                    </div>
                    <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
                      Step {step} of {STEPS.length}
                    </h2>
                  </div>
                  <div className={`rounded-full px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    {STEPS[step - 1].label}
                  </div>
                </div>

                <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  {step === 1 &&
                    "Add the basics people usually want to know first."}
                  {step === 2 &&
                    "Show your personality so meetup requests feel more natural."}
                  {step === 3 &&
                    "Finish with the password you will use to sign in."}
                </p>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e8eef2]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#d9e2e8,#aab8c1)] transition-all"
                    style={{ width: `${(step / STEPS.length) * 100}%` }}
                  />
                </div>

                <div className="mt-6 space-y-4">
                  {step === 1 && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#52616a]">
                          Display Name
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

                      <div className="grid grid-cols-2 gap-3">
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
                            Age Group
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
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#52616a]">
                          Languages
                        </label>
                        <div className={`${APP_SOFT_CARD_CLASS} flex flex-wrap gap-2 p-3`}>
                          {LANGUAGE_OPTIONS.map((item) => (
                            <ToggleChip
                              key={item}
                              label={item}
                              selected={languages.includes(item)}
                              onClick={() =>
                                toggleArrayValue(item, languages, setLanguages)
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#52616a]">
                          Meeting Style
                        </label>
                        <select
                          value={meetingStyle}
                          onChange={(e) => setMeetingStyle(e.target.value)}
                          className={INPUT_CLASS}
                        >
                          <option value="">Select meeting style</option>
                          {MEETING_STYLE_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#52616a]">
                          Interests
                        </label>
                        <div className={`${APP_SOFT_CARD_CLASS} flex flex-wrap gap-2 p-3`}>
                          {INTEREST_OPTIONS.map((item) => (
                            <ToggleChip
                              key={item}
                              label={item}
                              selected={interests.includes(item)}
                              onClick={() =>
                                toggleArrayValue(item, interests, setInterests)
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#52616a]">
                          Response Note
                        </label>
                        <select
                          value={responseTimeNote}
                          onChange={(e) => setResponseTimeNote(e.target.value)}
                          className={INPUT_CLASS}
                        >
                          <option value="">Select response note</option>
                          {RESPONSE_NOTE_OPTIONS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#52616a]">
                          About Me
                        </label>
                        <textarea
                          value={aboutMe}
                          onChange={(e) => setAboutMe(e.target.value)}
                          rows={4}
                          className={INPUT_CLASS}
                        />
                        <p className={`mt-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                          Avoid prostitution, solicitation, or other unsafe sexual content.
                        </p>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#52616a]">
                          Approved Email
                        </label>
                        <input
                          type="email"
                          className={`${INPUT_CLASS} bg-[#f4f7f9] text-[#64727a]`}
                          value={email}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={handleResetBetaAccess}
                          className="mt-2 text-xs font-medium text-[#55656e] underline underline-offset-2 transition hover:text-[#24323c]"
                        >
                          Use a different email
                        </button>
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
                        {password.trim().length > 0 && password.trim().length < PASSWORD_MIN_LENGTH ? (
                          <p className={`mt-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                            Password must be at least {PASSWORD_MIN_LENGTH} characters.
                          </p>
                        ) : null}
                      </div>

                      <label className={`${APP_SOFT_CARD_CLASS} grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 p-4 text-sm ${APP_BODY_TEXT_CLASS}`}>
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
                      {!isAdultConfirmed ? (
                        <p className={`text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                          You need to confirm you are 18 or older to create an account.
                        </p>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {step === 2 && !canMoveNext && (
                    <p className={`w-full text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                      Select a meeting style and at least one interest to continue.
                    </p>
                  )}
                  {step === 3 && !isAdultConfirmed && (
                    <p className={`w-full text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                      Confirm that you are 18 or older to continue.
                    </p>
                  )}
                  {step === 3 && (
                    <p className={`w-full text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                      By creating an account, you agree to Neonadri's{" "}
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
                  )}

                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                    >
                      I already have one
                    </Link>
                  )}

                  {step < STEPS.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canMoveNext}
                      className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSignup}
                      disabled={submitting}
                      className={`rounded-full border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
                    >
                      {submitting ? "Creating account..." : "Create account"}
                    </button>
                  )}
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
      </div>
    </main>
  );
}

