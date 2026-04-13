"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { createClient } from "../../lib/supabase/client";

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

const STEPS = [
  { number: 1, label: "Account" },
  { number: 2, label: "Basics" },
  { number: 3, label: "Vibe" },
  { number: 4, label: "Finish" },
];

const DEFAULT_ABOUT_ME =
  "I enjoy meeting new people over coffee, walks, or low-pressure plans. I usually appreciate clear communication, relaxed energy, and a meetup that feels easy to settle into.";

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
      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
        selected
          ? "bg-[#a48f7a] text-white"
          : "bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
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

  const canMoveNext = useMemo(() => {
    if (step === 1) {
      return email.trim().length > 0 && password.trim().length >= 6;
    }

    if (step === 2) {
      return (
        displayName.trim().length > 0 &&
        gender.trim().length > 0 &&
        ageGroup.trim().length > 0
      );
    }

    if (step === 3) {
      return (
        aboutMe.trim().length > 0 &&
        meetingStyle.trim().length > 0 &&
        interests.length > 0
      );
    }

    return true;
  }, [aboutMe, ageGroup, displayName, email, gender, interests.length, meetingStyle, password, step]);

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

  const handleNext = () => {
    if (!canMoveNext || step >= STEPS.length) return;
    setMessage("");
    setStep((current) => current + 1);
  };

  const handleBack = () => {
    if (step <= 1) return;
    setMessage("");
    setStep((current) => current - 1);
  };

  const handleSignup = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setMessage("");

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: displayName.trim(),
            display_name: displayName.trim(),
            bio: profileSummary || "",
            about_me: aboutMe.trim(),
            gender: gender || "",
            age_group: ageGroup || "",
            languages,
            meeting_style: meetingStyle || "",
            interests,
            is_public: true,
          },
        },
      });

      if (error) {
        setMessage(error.message);
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
          response_time_note: null,
          is_public: true,
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(payload);

        if (profileError) {
          setMessage(profileError.message);
          setSubmitting(false);
          return;
        }
      }

      setMessage(
        hasSession
          ? "Account created. Taking you into Neonadri now..."
          : "Account created. Please check your email to confirm, then log in."
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f3d6c5_38%,#e4b49d_100%)] px-6 py-7 text-[#2a211d] shadow-[0_24px_60px_rgba(120,76,52,0.16)] sm:px-8 sm:py-9">
            <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-white/25 blur-2xl" />
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
                <Sparkles className="h-3.5 w-3.5" />
                Join the vibe
              </div>
              <h1 className="mt-4 max-w-md text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#2b1f1a] sm:text-[42px]">
                Build your profile before the first hello.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#5f453b] sm:text-[15px]">
                We guide people through account setup one step at a time, so the first meetup already feels personal, clear, and comfortable.
              </p>

              <div className="mt-7 space-y-3">
                {STEPS.map((item) => {
                  const active = step === item.number;
                  const complete = step > item.number;

                  return (
                    <div
                      key={item.number}
                      className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 transition ${
                        active
                          ? "border-white/80 bg-white/75 shadow-[0_12px_24px_rgba(126,80,54,0.12)]"
                          : "border-white/45 bg-white/40"
                      }`}
                    >
                      <div
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          complete
                            ? "bg-[#8e6f58] text-white"
                            : active
                              ? "bg-[#2f241f] text-white"
                              : "bg-white/80 text-[#8a5647]"
                        }`}
                      >
                        {complete ? <Check className="h-4 w-4" /> : item.number}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#2d211c]">
                          {item.label}
                        </div>
                        <div className="text-xs text-[#6f5448]">
                          {item.number === 1 && "Email and password"}
                          {item.number === 2 && "Name, gender, and age group"}
                          {item.number === 3 && "About you, style, and interests"}
                          {item.number === 4 && "Final review before joining"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/70 bg-white/65 px-3 py-2 text-xs font-medium text-[#6a4b40]">
                  Coffee chats
                </span>
                <span className="rounded-full border border-white/70 bg-white/65 px-3 py-2 text-xs font-medium text-[#6a4b40]">
                  Walk dates
                </span>
                <span className="rounded-full border border-white/70 bg-white/65 px-3 py-2 text-xs font-medium text-[#6a4b40]">
                  Focus sessions
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#eadfd3] bg-white/90 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                  Sign Up
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#2f2a26]">
                  Step {step} of {STEPS.length}
                </h2>
              </div>
              <div className="rounded-full border border-[#eadfd3] bg-[#faf4ee] px-3 py-1.5 text-xs font-medium text-[#7a6b61]">
                {STEPS[step - 1].label}
              </div>
            </div>

            <p className="mt-2 text-sm leading-6 text-[#7a6b61]">
              {step === 1 &&
                "Start with the account details you will use to sign in."}
              {step === 2 &&
                "Add the basics people usually want to know first."}
              {step === 3 &&
                "Show your personality so meetup requests feel more natural."}
              {step === 4 &&
                "Review the profile that will be created together with your account."}
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#f2e7dc]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#b78363,#8f6c58)] transition-all"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
              />
            </div>

            <div className="mt-6 space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                      Display Name
                    </label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                      placeholder="How people will see you"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                        Age Group
                      </label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                        className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
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

              {step === 3 && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                      Languages
                    </label>
                    <div className="flex flex-wrap gap-2 rounded-[22px] border border-[#e7ddd2] bg-[#fcfaf7] p-3">
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
                    <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                      Meeting Style
                    </label>
                    <select
                      value={meetingStyle}
                      onChange={(e) => setMeetingStyle(e.target.value)}
                      className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
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
                    <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2 rounded-[22px] border border-[#e7ddd2] bg-[#fcfaf7] p-3">
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
                    <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                      About Me
                    </label>
                    <textarea
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      rows={4}
                      className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                    />
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-[#eadfd3] bg-[#fffaf6] p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                      Profile preview
                    </div>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#2f2a26]">
                      {displayName || "Your display name"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#6f6258]">
                      {profileSummary || "A quick introduction will show up here."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {gender && (
                        <span className="rounded-full bg-[#f4ece4] px-3 py-2 text-xs font-medium text-[#5f4e45]">
                          {gender}
                        </span>
                      )}
                      {ageGroup && (
                        <span className="rounded-full bg-[#f4ece4] px-3 py-2 text-xs font-medium text-[#5f4e45]">
                          {ageGroup}
                        </span>
                      )}
                      {meetingStyle && (
                        <span className="rounded-full bg-[#f4ece4] px-3 py-2 text-xs font-medium text-[#5f4e45]">
                          {meetingStyle}
                        </span>
                      )}
                    </div>

                    {aboutMe.trim() && (
                      <p className="mt-4 text-sm leading-6 text-[#6f6258]">
                        {aboutMe}
                      </p>
                    )}

                    {interests.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {interests.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[#e7ddd2] bg-white px-3 py-2 text-xs font-medium text-[#5f4e45]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {step === 3 && !canMoveNext && (
                <p className="w-full text-xs text-[#8c7668]">
                  Select a meeting style and at least one interest to continue.
                </p>
              )}

              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-[#f6eee6] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#efe4d9]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-[#dccfc2] bg-[#f6eee6] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#efe4d9]"
                >
                  I already have one
                </Link>
              )}

              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canMoveNext}
                  className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:cursor-not-allowed disabled:bg-[#c8b8aa]"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={submitting}
                  className="rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:cursor-not-allowed disabled:bg-[#c8b8aa]"
                >
                  {submitting ? "Creating account..." : "Complete sign up"}
                </button>
              )}
            </div>

            {message && (
              <p className="mt-4 rounded-[20px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-3 text-sm text-[#6b5f52]">
                {message}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
