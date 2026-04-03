"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const supabase = createClient();

  const services = [
    {
      title: "Strategy",
      desc: "Clear positioning, messaging, and digital direction for brands that want a sharper online presence.",
    },
    {
      title: "Design",
      desc: "Modern, elegant website design focused on readability, trust, and visual clarity.",
    },
    {
      title: "Launch",
      desc: "A practical structure that is easy to publish, maintain, and expand over time.",
    },
  ];

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupMessage, setSignupMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? "");
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? "");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupMessage("");

    if (!signupName || !signupEmail || !signupPassword) {
      setSignupMessage("Please fill in all signup fields.");
      return;
    }

    if (signupPassword.length < 6) {
      setSignupMessage("Password must be at least 6 characters.");
      return;
    }

    setLoadingSignup(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
          },
        },
      });

      if (error) {
        setSignupMessage(error.message);
      } else {
        setSignupMessage("Signup successful. Check your email for confirmation.");
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");
      }
    } catch {
      setSignupMessage("Something went wrong during signup.");
    } finally {
      setLoadingSignup(false);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMessage("");

    if (!loginEmail || !loginPassword) {
      setLoginMessage("Please enter your email and password.");
      return;
    }

    setLoadingLogin(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginMessage(error.message);
      } else {
        setLoginMessage("Logged in successfully.");
        setLoginEmail("");
        setLoginPassword("");
      }
    } catch {
      setLoginMessage("Something went wrong during login.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    setLoginMessage("");
    setSignupMessage("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setLoginMessage(error.message);
      } else {
        setLoginMessage("Logged out successfully.");
      }
    } catch {
      setLoginMessage("Something went wrong during logout.");
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="text-xl font-semibold tracking-tight">Neonadri</div>
          <nav className="hidden gap-8 text-sm text-slate-600 md:flex">
            <a href="#about" className="transition hover:text-slate-900">About</a>
            <a href="#services" className="transition hover:text-slate-900">Services</a>
            <a href="#signup" className="transition hover:text-slate-900">Sign Up</a>
            <a href="#login" className="transition hover:text-slate-900">Log In</a>
            <a href="#contact" className="transition hover:text-slate-900">Contact</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
        <div>
          <div className="inline-flex rounded-full border border-slate-200 px-4 py-1 text-sm text-slate-600 shadow-sm">
            Modern digital presence
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            Build a polished online home for your brand.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            Neonadri is a clean, modern homepage template that can be used for a company,
            portfolio, studio, or professional brand site.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#signup"
              className="rounded-2xl bg-slate-900 px-6 py-3 text-center text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Sign Up
            </a>
            <a
              href="#login"
              className="rounded-2xl border border-slate-300 px-6 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Log In
            </a>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            {userEmail ? `Logged in as ${userEmail}` : "You are currently logged out."}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm md:p-10">
          <div className="rounded-[1.5rem] border border-white bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">Featured Message</div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">
              Simple. Credible. Memorable.
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Designed to help visitors understand who you are, what you do, and how to contact you
              in just a few seconds.
            </p>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">About</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              A flexible homepage for real-world use.
            </h2>
            <p className="mt-6 text-base leading-7 text-slate-600">
              This layout is intentionally minimal so it can be adapted for a business introduction,
              consulting page, creative portfolio, or landing page without feeling cluttered.
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Services</div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            What Neonadri can highlight
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="signup" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:px-10">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Sign Up</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Create your account
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Visitors can create an account using their email and password.
            </p>
          </div>

          <form onSubmit={handleSignup} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loadingSignup}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingSignup ? "Creating..." : "Create Account"}
              </button>

              {signupMessage ? (
                <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  {signupMessage}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section id="login" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:px-10">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Log In</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Access your account
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Existing members can sign in with their email and password.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <form onSubmit={handleLogin} className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loadingLogin}
                  className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingLogin ? "Logging in..." : "Log In"}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loadingLogout || !userEmail}
                  className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingLogout ? "Logging out..." : "Log Out"}
                </button>
              </div>

              {loginMessage ? (
                <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                  {loginMessage}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-20 md:flex-row md:px-10">
          <div className="max-w-2xl">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Contact</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to turn this into a live website?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Replace this section with your email address, inquiry form, office details, or booking link.
            </p>
          </div>
          <a
            href="mailto:hello@neonadri.net"
            className="rounded-2xl bg-white px-6 py-3 text-sm font-medium text-slate-900 shadow-lg transition hover:-translate-y-0.5"
          >
            hello@neonadri.net
          </a>
        </div>
      </section>
    </main>
  );
}
